import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

// 读取 Alpaca credentials
const credentials = JSON.parse(fs.readFileSync('./credentials.json', 'utf-8'));

const headers = {
  'APCA-API-KEY-ID': credentials.key,
  'APCA-API-SECRET-KEY': credentials.secret,
};

const BASE_URL = 'https://paper-api.alpaca.markets/v2';

// 1. 获取账户信息
app.get('/api/account', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/account`, { headers });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. 获取持仓
app.get('/api/positions', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/positions`, { headers });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. 获取订单
app.get('/api/orders', async (req, res) => {
  const { status } = req.query;
  try {
    const response = await fetch(`${BASE_URL}/orders?status=${status || 'open'}`, { headers });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. 下单
app.post('/api/orders', async (req, res) => {
  const { symbol, qty, side, type, time_in_force, limit_price, stop_price } = req.query;
  try {
    const order = {
      symbol,
      qty: parseInt(qty),
      side,
      type: type || 'market',
      time_in_force: time_in_force || 'day',
      ...(limit_price && { limit_price: parseFloat(limit_price) }),
      ...(stop_price && { stop_price: parseFloat(stop_price) }),
    };
    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. 取消订单
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/orders/${req.params.id}`, {
      method: 'DELETE',
      headers,
    });
    res.json({ success: response.ok });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. 获取股票/期权报价
app.get('/api/quotes/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await fetch(`${BASE_URL}/quotes/${symbol}`, { headers });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. 获取期权链
app.get('/api/options/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await fetch(`${BASE_URL}/optionschain?underlying_symbol=${symbol}`, { headers });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. 获取时钟
app.get('/api/clock', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/clock`, { headers });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Alpaca API Server running on http://localhost:${PORT}`);
});