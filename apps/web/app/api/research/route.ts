import { NextResponse } from 'next/server';

const BASE_URL = 'https://paper-api.alpaca.markets/v2';
const DATA_URL = 'https://data.alpaca.markets';

const credentials = {
  key: 'PKCYF4IQXKIZLABNGLZ7VC6PY7',
  secret: 'BYjBhJkC6HW131nGvj3v9apf56LdU3K3RFwWwbN1cZn5',
};

const headers = {
  'APCA-API-KEY-ID': credentials.key,
  'APCA-API-SECRET-KEY': credentials.secret,
};

// 股票候选池
const CANDIDATES = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'NFLX', 'TSLA',
  'AMD', 'INTC', 'QCOM', 'TXN', 'AVGO', 'MU', 'LRCX', 'KLAC',
  'PLTR', 'SNOW', 'COIN', 'RBLX', 'CRWD', 'ZS', 'NET',
  'COST', 'WMT', 'TGT', 'HD', 'LOW', 'NKE', 'SBUX', 'MCD',
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA', 'PYPL',
  'JNJ', 'UNH', 'PFE', 'MRK', 'ABBV', 'LLY', 'TMO', 'DHR',
  'XOM', 'CVX', 'COP', 'EOG', 'SLB', 'MPC', 'VLO',
  'BA', 'CAT', 'HON', 'UNP', 'GE', 'MMM', 'LMT', 'RTX',
  'AMT', 'PLD', 'CCI', 'EQIX', 'SPG', 'O',
  'MARA', 'RIOT', 'MSTR',
  'SOFI', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'AFRM', 'UPST',
  'SPY', 'QQQ', 'IWM', 'DIA', 'TLT', 'VOO', 'VTI', 'IVV',
];

// 从 Yahoo Finance 获取价格
async function getYahooPrice(symbols: string[]) {
  const prices: Record<string, number> = {};
  for (const sym of symbols) {
    try {
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=5d`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const data = await res.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price) prices[sym] = price;
    } catch (e) {
      // skip
    }
  }
  return prices;
}

// 从 Yahoo Finance 获取 HV
async function getYahooHV(symbol: string): Promise<number> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=6mo`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const data = await res.json();
    const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter((p: number) => p > 0);
    
    if (!closes || closes.length < 20) return 0;
    
    // 计算对数收益率
    const returns: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      if (closes[i] && closes[i-1]) {
        returns.push(Math.log(closes[i] / closes[i-1]));
      }
    }
    
    // 计算 HV (20天滚动标准差 * sqrt(252))
    if (returns.length < 20) return 0;
    const recentReturns = returns.slice(-20);
    const mean = recentReturns.reduce((a, b) => a + b, 0) / recentReturns.length;
    const variance = recentReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recentReturns.length;
    const std = Math.sqrt(variance);
    const hv = std * Math.sqrt(252) * 100;
    
    return Math.round(hv * 10) / 10;
  } catch {
    return 0;
  }
}

// 账户信息
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const symbol = searchParams.get('symbol');

  try {
    // 1. 账户信息
    if (endpoint === 'account') {
      const resp = await fetch(`${BASE_URL}/account`, { headers });
      return NextResponse.json(await resp.json());
    }

    // 2. 分析候选股票池
    if (endpoint === 'analyze') {
      // 获取价格
      const prices = await getYahooPrice(CANDIDATES);
      
      // 计算每个股票的 HV 和评分
      const results = [];
      for (const sym of CANDIDATES) {
        const price = prices[sym];
        if (!price) continue;
        
        const hv = await getYahooHV(sym);
        if (!hv) continue;
        
        // Wheel 评分
        let score = 0;
        score += hv > 60 ? 50 : hv > 40 ? 40 : hv > 30 ? 30 : hv > 20 ? 20 : 10;
        score += price >= 20 && price <= 200 ? 20 : price >= 10 && price <= 500 ? 10 : 5;
        
        results.push({
          symbol: sym,
          price: price,
          hv: hv,
          score: score,
        });
      }
      
      // 按评分排序
      results.sort((a, b) => b.score - a.score);
      
      return NextResponse.json({
        candidates: results.slice(0, 20),
        total: results.length,
      });
    }

    // 3. 分析单个股票
    if (endpoint === 'stock' && symbol) {
      const sym = symbol.toUpperCase();
      
      // 获取价格
      const prices = await getYahooPrice([sym]);
      const price = prices[sym] || 0;
      
      if (!price) {
        return NextResponse.json({ error: '无法获取价格' }, { status: 400 });
      }
      
      // 获取 HV
      const hv = await getYahooHV(sym);
      
      // 评分
      let score = 0;
      if (hv) {
        score += hv > 60 ? 50 : hv > 40 ? 40 : hv > 30 ? 30 : hv > 20 ? 20 : 10;
        score += price >= 20 && price <= 200 ? 20 : price >= 10 && price <= 500 ? 10 : 5;
      }
      
      // 建议
      let recommendation = '';
      if (hv > 60) recommendation = '⚠️ 高波动 - 权利金高但风险大';
      else if (hv > 40) recommendation = '🟡 中高波动 - 权利金不错';
      else if (hv > 20) recommendation = '🟢 中等波动 - 平衡选择';
      else recommendation = '🔵 低波动 - 稳定但权利金低';
      
      // Options 建议
      const options = {
        putOTM5: Math.round(price * 0.95 * 100) / 100,
        putOTM10: Math.round(price * 0.90 * 100) / 100,
        callOTM5: Math.round(price * 1.05 * 100) / 100,
        callOTM10: Math.round(price * 1.10 * 100) / 100,
      };
      
      return NextResponse.json({
        symbol: sym,
        price: price,
        hv: hv,
        score: score,
        recommendation: recommendation,
        options: options,
      });
    }

    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}