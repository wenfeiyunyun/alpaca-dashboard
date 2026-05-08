'use client';
import { useState, useEffect } from 'react';

interface Position {
  symbol: string;
  qty: string;
  avg_entry_price: string;
  current_price: string;
  market_value: string;
  unrealized_pl: string;
  side: string;
}

interface Order {
  id: string;
  symbol: string;
  side: string;
  type: string;
  qty: string;
  filled_qty: string;
  status: string;
  limit_price: string;
  created_at: string;
}

const TABS = ['positions', 'orders', 'trade', 'research'] as const;
type Tab = typeof TABS[number];

export default function AlpacaDashboard() {
  const [account, setAccount] = useState<any>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clock, setClock] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('positions');
  const [tradeSymbol, setTradeSymbol] = useState('AAPL');
  const [tradeQty, setTradeQty] = useState('1');
  const [tradeSide, setTradeSide] = useState('buy');
  const [tradePrice, setTradePrice] = useState('');
  const [tradeType, setTradeType] = useState('market');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [acc, pos, ord, clk] = await Promise.all([
        fetch('/api/alpaca?endpoint=account').then(r => r.json()),
        fetch('/api/alpaca?endpoint=positions').then(r => r.json()),
        fetch('/api/alpaca?endpoint=orders&status=open').then(r => r.json()),
        fetch('/api/alpaca?endpoint=clock').then(r => r.json()),
      ]);
      setAccount(acc);
      setPositions(Array.isArray(pos) ? pos : []);
      setOrders(Array.isArray(ord) ? ord : []);
      setClock(clk);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmitOrder = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/alpaca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: tradeSymbol,
          qty: tradeQty,
          side: tradeSide,
          type: tradeType,
          limit_price: tradePrice || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Order submitted: ${data.symbol} ${data.side} ${data.qty} @ ${data.limit_price || 'market'}`);
        fetchData();
      } else {
        setMessage(`❌ Error: ${data.message || JSON.stringify(data)}`);
      }
    } catch (e: any) {
      setMessage(`❌ Error: ${e.message}`);
    }
    setLoading(false);
  };

  const formatMoney = (v: string) => `$${parseFloat(v || '0').toFixed(2)}`;
  const formatDate = (d: string) => d ? new Date(d).toLocaleString() : '';

  const tabLabels = {
    positions: '📊 Positions',
    orders: '📋 Orders',
    trade: '📝 Trade',
    research: '📓 Research',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'system-ui' }}>
      {/* Header */}
      <header style={{ padding: '20px', borderBottom: '1px solid #21262d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#58a6ff' }}>🐉 Alpaca Dashboard</h1>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#8b949e' }}>Portfolio Value</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: account?.portfolio_value ? '#3fb950' : '#e6edf3' }}>
            {account ? formatMoney(account.portfolio_value) : '...'}
          </div>
          <div style={{ fontSize: '14px', color: '#8b949e' }}>
            Cash: {account ? formatMoney(account.cash) : '...'}
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div style={{ padding: '10px 20px', background: '#161b22', fontSize: '12px', display: 'flex', gap: '20px', color: '#8b949e' }}>
        <span>📈 Market: {clock?.is_open ? '🟢 OPEN' : '🔴 CLOSED'}</span>
        <span>Next Open: {clock?.next_open ? new Date(clock.next_open).toLocaleString('en-AU', { timeZone: 'Australia/Sydney' }) : '...'}</span>
        <span>Buying Power: {account ? formatMoney(account.buying_power) : '...'}</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #21262d' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '15px 30px',
              background: activeTab === tab ? '#161b22' : 'transparent',
              border: 'none',
              color: activeTab === tab ? '#58a6ff' : '#8b949e',
              borderBottom: activeTab === tab ? '2px solid #58a6ff' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* Positions Tab */}
        {activeTab === 'positions' && (
          <div>
            <h3 style={{ marginTop: 0 }}>Open Positions</h3>
            {positions.length === 0 ? (
              <p style={{ color: '#8b949e' }}>No open positions</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #21262d', textAlign: 'left' }}>
                    <th style={{ padding: '10px', color: '#8b949e' }}>Symbol</th>
                    <th style={{ padding: '10px', color: '#8b949e' }}>Qty</th>
                    <th style={{ padding: '10px', color: '#8b949e' }}>Entry</th>
                    <th style={{ padding: '10px', color: '#8b949e' }}>Current</th>
                    <th style={{ padding: '10px', color: '#8b949e' }}>Value</th>
                    <th style={{ padding: '10px', color: '#8b949e' }}>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                      <td style={{ padding: '10px', fontFamily: 'monospace' }}>{p.symbol}</td>
                      <td style={{ padding: '10px' }}>{p.qty}</td>
                      <td style={{ padding: '10px' }}>{p.avg_entry_price}</td>
                      <td style={{ padding: '10px' }}>{p.current_price}</td>
                      <td style={{ padding: '10px' }}>{formatMoney(p.market_value)}</td>
                      <td style={{ padding: '10px', color: parseFloat(p.unrealized_pl) >= 0 ? '#3fb950' : '#f85149' }}>
                        {p.unrealized_pl}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h3 style={{ marginTop: 0 }}>Open Orders</h3>
            {orders.length === 0 ? (
              <p style={{ color: '#8b949e' }}>No open orders</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #21262d', textAlign: 'left' }}>
                    <th style={{ padding: '10px', color: '#8b949e' }}>Symbol</th>
                    <th style={{ padding: '10px', color: '#8b949e' }}>Side</th>
                    <th style={{ padding: '10px', color: '#8b949e' }}>Type</th>
                    <th style={{ padding: '10px', color: '#8b949e' }}>Qty</th>
                    <th style={{ padding: '10px', color: '#8b949e' }}>Price</th>
                    <th style={{ padding: '10px', color: '#8b949e' }}>Status</th>
                    <th style={{ padding: '10px', color: '#8b949e' }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                      <td style={{ padding: '10px', fontFamily: 'monospace' }}>{o.symbol}</td>
                      <td style={{ padding: '10px', color: o.side === 'buy' ? '#3fb950' : '#f85149' }}>{o.side}</td>
                      <td style={{ padding: '10px' }}>{o.type}</td>
                      <td style={{ padding: '10px' }}>{o.qty}</td>
                      <td style={{ padding: '10px' }}>{o.limit_price || 'market'}</td>
                      <td style={{ padding: '10px' }}>{o.status}</td>
                      <td style={{ padding: '10px', fontSize: '12px', color: '#8b949e' }}>{formatDate(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Trade Tab */}
        {activeTab === 'trade' && (
          <div style={{ maxWidth: '500px' }}>
            <h3 style={{ marginTop: 0 }}>Place Order</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#8b949e' }}>Symbol</label>
              <input
                value={tradeSymbol}
                onChange={e => setTradeSymbol(e.target.value.toUpperCase())}
                style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '16px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#8b949e' }}>Side</label>
                <select
                  value={tradeSide}
                  onChange={e => setTradeSide(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '16px' }}
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#8b949e' }}>Qty</label>
                <input
                  type="number"
                  value={tradeQty}
                  onChange={e => setTradeQty(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '16px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#8b949e' }}>Order Type</label>
                <select
                  value={tradeType}
                  onChange={e => setTradeType(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '16px' }}
                >
                  <option value="market">Market</option>
                  <option value="limit">Limit</option>
                </select>
              </div>
              {tradeType === 'limit' && (
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#8b949e' }}>Limit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tradePrice}
                    onChange={e => setTradePrice(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '16px' }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                background: tradeSide === 'buy' ? '#238636' : '#da3633',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Submitting...' : `${tradeSide.toUpperCase()} ${tradeQty} ${tradeSymbol}`}
            </button>

            {message && (
              <div style={{ marginTop: '15px', padding: '10px', background: '#161b22', borderRadius: '6px', fontSize: '14px' }}>
                {message}
              </div>
            )}
          </div>
        )}

        {/* Research Tab */}
        {activeTab === 'research' && (
          <div>
            <h3 style={{ marginTop: 0 }}>📓 Options Research</h3>
            <p style={{ color: '#8b949e' }}>
              启动 Jupyter Notebook 进行 Wheel 策略分析
            </p>

            <div style={{ 
              padding: '40px', 
              background: '#161b22', 
              borderRadius: '12px',
              textAlign: 'center',
              maxWidth: '500px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📓</div>
              <h4 style={{ margin: '0 0 10px', fontSize: '18px' }}>Jupyter Notebook</h4>
              <p style={{ color: '#8b949e', marginBottom: '20px' }}>
                wheel.ipynb - Wheel 策略分析
              </p>
              <a
                href="http://localhost:8888/notebooks/wheel.ipynb"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  background: '#238636',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                🚀 打开 wheel.ipynb
              </a>
            </div>

            <div style={{ marginTop: '30px', padding: '15px', background: '#161b22', borderRadius: '8px', maxWidth: '500px' }}>
              <h4 style={{ margin: '0 0 10px' }}>📋 笔记本说明</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#8b949e' }}>
                <li>账户验证 - 检查 Alpaca 账号状态</li>
                <li>股票候选池 - 定义要分析的股票</li>
                <li>历史波动率 - 计算 HV 并分析</li>
                <li>Wheel 评分 - 筛选最佳候选股票</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}