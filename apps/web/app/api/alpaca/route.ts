import { NextResponse } from 'next/server';

// Alpaca API configuration
const BASE_URL = 'https://paper-api.alpaca.markets/v2';

const credentials = {
  key: process.env.ALPACA_KEY || 'PKCYF4IQXKIZLABNGLZ7VC6PY7',
  secret: process.env.ALPACA_SECRET || 'BYjBhJkC6HW131nGvj3v9apf56LdU3K3RFwWwbN1cZn5',
};

const headers = {
  'APCA-API-KEY-ID': credentials.key,
  'APCA-API-SECRET-KEY': credentials.secret,
};

// 1. Get Account
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  try {
    let url = `${BASE_URL}`;
    
    if (endpoint === 'account') url += '/account';
    else if (endpoint === 'positions') url += '/positions';
    else if (endpoint === 'clock') url += '/clock';
    else if (endpoint === 'orders') {
      const status = searchParams.get('status') || 'open';
      url += `/orders?status=${status}`;
    }
    else if (endpoint?.startsWith('quote:')) {
      const symbol = endpoint.replace('quote:', '');
      url += `/quotes/${symbol}`;
    }

    const response = await fetch(url, { headers });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. Post Order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbol, qty, side, type, time_in_force, limit_price } = body;

    const order: any = {
      symbol,
      qty: parseInt(qty),
      side,
      type: type || 'market',
      time_in_force: time_in_force || 'day',
    };
    
    if (limit_price) order.limit_price = parseFloat(limit_price);

    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.ok ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}