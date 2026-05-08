import { NextResponse } from 'next/server';

const BASE_URL = 'https://paper-api.alpaca.markets/v2';

// 股票候选池
const CANDIDATES = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'NFLX', 'TSLA',
  'AMD', 'INTC', 'QCOM', 'TXN', 'AVGO', 'MU', 'LRCX', 'KLAC',
  'PLTR', 'SNOW', 'COIN', 'RBLX', 'CRWD', 'ZS', 'NET',
  'COST', 'WMT', 'TGT', 'HD', 'LOW', 'NKE', 'SBUX', 'MCD',
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA', 'PYPL',
];

// 从 Yahoo 获取价格
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

// 获取 HV
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

// 简化期权定价估算 (基于内在价值 + 时间价值)
// 注意: 这是估算，实际价格需要 broker API
function estimateOptionPrice(
  stockPrice: number,
  strikePrice: number,
  daysToExpiry: number,
  volatility: number,
  isCall: boolean
): number {
  const r = 0.05; // 假设无风险利率 5%
  const t = daysToExpiry / 365;
  const v = volatility / 100;
  
  if (t <= 0) {
    return isCall ? Math.max(0, stockPrice - strikePrice) : Math.max(0, strikePrice - stockPrice);
  }
  
  // 简化版: 内在价值 + 时间价值估算
  const intrinsic = isCall 
    ? Math.max(0, stockPrice - strikePrice)
    : Math.max(0, strikePrice - stockPrice);
    
  // 时间价值简化估算
  const timeValue = stockPrice * v * Math.sqrt(t) * 0.4;
  const extrinsic = Math.max(0, timeValue);
  
  return Math.round((intrinsic + extrinsic) * 100) / 100;
}

// 生成 Options 链
async function generateOptionsChain(symbol: string) {
  const price = await getYahooPrice(symbol);
  const hv = await getYahooHV(symbol);
  
  if (!price || !hv) return null;
  
  // 到期日 (未来4周)
  const expirations = [
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  ];
  
  // 生成 10 个行权价 (atm +/- 20%)
  const strikes: number[] = [];
  const steps = 10;
  const step = price * 0.05;
  const center = Math.round(price / step) * step;
  for (let i = -steps/2; i <= steps/2; i++) {
    strikes.push(Math.round((center + i * step) * 100) / 100);
  }
  
  const calls = [];
  const puts = [];
  
  for (const s of strikes) {
    const days = 30;
    const callPrice = estimateOptionPrice(price, s, days, hv, true);
    const putPrice = estimateOptionPrice(price, s, days, hv, false);
    
    calls.push({
      strike: s,
      price: callPrice,
      bid: Math.round(callPrice * 0.95 * 100) / 100,
      ask: Math.round(callPrice * 1.05 * 100) / 100,
      iv: hv,
    });
    
    puts.push({
      strike: s,
      price: putPrice,
      bid: Math.round(putPrice * 0.95 * 100) / 100,
      ask: Math.round(putPrice * 1.05 * 100) / 100,
      iv: hv,
    });
  }
  
  return {
    symbol,
    price,
    hv,
    expirations,
    strikes,
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

    // 分析候选股票池
    if (endpoint === 'analyze') {
      const prices: Record<string, number> = {};
      const results = [];
      
      for (const sym of CANDIDATES.slice(0, 30)) {
        const price = await getYahooPrice(sym);
        if (!price) continue;
        prices[sym] = price;
        
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

    // 单股分析
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
      
      return NextResponse.json({
        symbol: sym,
        price,
        hv,
        score,
        recommendation: rec,
        options: {
          putOTM5: Math.round(price * 0.95 * 100) / 100,
          putOTM10: Math.round(price * 0.90 * 100) / 100,
          callOTM5: Math.round(price * 1.05 * 100) / 100,
          callOTM10: Math.round(price * 1.10 * 100) / 100,
        },
      });
    }

    // Options 链
    if (endpoint === 'options' && symbol) {
      const chain = await generateOptionsChain(symbol.toUpperCase());
      if (!chain) return NextResponse.json({ error: '无法获取数据' }, { status: 400 });
      return NextResponse.json(chain);
    }

    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}