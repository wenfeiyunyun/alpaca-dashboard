import { NextResponse } from 'next/server';

const BASE_URL = 'https://paper-api.alpaca.markets/v2';

const CANDIDATES = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'NFLX', 'TSLA',
  'AMD', 'INTC', 'QCOM', 'TXN', 'AVGO', 'MU', 'LRCX', 'KLAC',
  'PLTR', 'SNOW', 'COIN', 'RBLX', 'CRWD', 'ZS', 'NET',
  'COST', 'WMT', 'TGT', 'HD', 'LOW', 'NKE', 'SBUX', 'MCD',
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA', 'PYPL',
];

async function getYahooPrice(symbol: string): Promise<number> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const data = await res.json();
    return data?.chart?.result?.[0]?.meta?.regularMarketPrice || 0;
  } catch {
    return 0;
  }
}

async function getYahooHV(symbol: string): Promise<number> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=6mo`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const data = await res.json();
    const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter((p: number) => p > 0);
    if (!closes || closes.length < 20) return 0;
    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      if (closes[i] && closes[i-1]) returns.push(Math.log(closes[i] / closes[i-1]));
    }
    if (returns.length < 20) return 0;
    const recent = returns.slice(-20);
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const variance = recent.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recent.length;
    return Math.round(Math.sqrt(variance) * Math.sqrt(252) * 1000) / 10;
  } catch {
    return 0;
  }
}

// 修复后的期权定价 - 更准确的估算
function estimateOptionPrice(
  stockPrice: number,
  strikePrice: number,
  daysToExpiry: number,
  volatility: number,
  isCall: boolean
): number {
  const t = daysToExpiry / 365;
  const v = volatility / 100;
  const priceRatio = stockPrice / strikePrice;
  
  // 内在价值
  const intrinsic = isCall
    ? Math.max(0, stockPrice - strikePrice)
    : Math.max(0, strikePrice - stockPrice);
  
  // 时间价值 - 基于 Moneyness 调整
  let moneynessFactor = 1;
  if (isCall) {
    if (priceRatio < 0.8) moneynessFactor = 0.1; // deep ITM
    else if (priceRatio < 0.9) moneynessFactor = 0.5;
    else if (priceRatio > 1.2) moneynessFactor = 0.1; // deep OTM
    else if (priceRatio > 1.1) moneynessFactor = 0.5;
  } else {
    if (priceRatio > 1.2) moneynessFactor = 0.1;
    else if (priceRatio > 1.1) moneynessFactor = 0.5;
    if (priceRatio < 0.8) moneynessFactor = 0.1;
    else if (priceRatio < 0.9) moneynessFactor = 0.5;
  }
  
  const timeValue = stockPrice * v * Math.sqrt(t) * 0.3 * moneynessFactor;
  const extrinsic = Math.max(0, timeValue);
  
  return Math.round((intrinsic + extrinsic) * 100) / 100;
}

function generateOptionsChain(symbol: string, price: number, hv: number) {
  // 20 below + ATM + 20 above = 41 strikes
  const strikes: number[] = [];
  const step = price * 0.02;
  
  for (let i = 20; i >= 1; i--) {
    strikes.push(Math.round((price - i * step) * 100) / 100);
  }
  strikes.push(price);
  for (let i = 1; i <= 20; i++) {
    strikes.push(Math.round((price + i * step) * 100) / 100);
  }
  
  const days = 30;
  const calls = [];
  const puts = [];
  
  for (const s of strikes) {
    calls.push({
      strike: s,
      price: estimateOptionPrice(price, s, days, hv, true),
      bid: 0,
      ask: 0,
      iv: hv,
    });
    puts.push({
      strike: s,
      price: estimateOptionPrice(price, s, days, hv, false),
      bid: 0,
      ask: 0,
      iv: hv,
    });
  }
  
  return {
    symbol,
    price,
    hv,
    calls,
    puts,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const symbol = searchParams.get('symbol');

  try {
    if (endpoint === 'account') {
      const resp = await fetch(`${BASE_URL}/account`, {
        headers: {
          'APCA-API-KEY-ID': 'PKCYF4IQXKIZLABNGLZ7VC6PY7',
          'APCA-API-SECRET-KEY': 'BYjBhJkC6HW131nGvj3v9apf56LdU3K3RFwWwbN1cZn5',
        },
      });
      return NextResponse.json(await resp.json());
    }

    if (endpoint === 'analyze') {
      const results = [];
      for (const sym of CANDIDATES.slice(0, 30)) {
        const price = await getYahooPrice(sym);
        if (!price) continue;
        const hv = await getYahooHV(sym);
        if (!hv) continue;
        let score = 0;
        score += hv > 60 ? 50 : hv > 40 ? 40 : hv > 30 ? 30 : hv > 20 ? 20 : 10;
        score += price >= 20 && price <= 200 ? 20 : price >= 10 && price <= 500 ? 10 : 5;
        results.push({ symbol: sym, price, hv, score });
      }
      results.sort((a, b) => b.score - a.score);
      return NextResponse.json({ candidates: results.slice(0, 10), total: results.length });
    }

    if (endpoint === 'stock' && symbol) {
      const sym = symbol.toUpperCase();
      const price = await getYahooPrice(sym);
      if (!price) return NextResponse.json({ error: '无法获取价格' }, { status: 400 });
      const hv = await getYahooHV(sym);
      let score = 0;
      if (hv) {
        score += hv > 60 ? 50 : hv > 40 ? 40 : hv > 30 ? 30 : hv > 20 ? 20 : 10;
        score += price >= 20 && price <= 200 ? 20 : price >= 10 && price <= 500 ? 10 : 5;
      }
      const rec = hv > 60 ? '⚠️ 高波动' : hv > 40 ? '🟡 中高波动' : hv > 20 ? '🟢 中等波动' : '🔵 低波动';
      return NextResponse.json({ symbol: sym, price, hv, score, recommendation: rec });
    }

    if (endpoint === 'options' && symbol) {
      const sym = symbol.toUpperCase();
      const price = await getYahooPrice(sym);
      const hv = await getYahooHV(sym);
      if (!price) return NextResponse.json({ error: '无法获取数据' }, { status: 400 });
      const chain = generateOptionsChain(sym, price, hv);
      return NextResponse.json(chain);
    }

    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}