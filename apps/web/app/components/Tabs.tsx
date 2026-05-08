'use client';

import React from 'react';

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

interface UnifiedTabProps {
  positions: Position[];
  orders: Order[];
}

export function UnifiedPositionsOrdersTab({ positions, orders }: UnifiedTabProps) {
  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#58a6ff', textAlign: 'center' }}>Positions & Orders</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {/* Left: Positions */}
        <div style={{ padding: '12px', background: '#161b22', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0, marginBottom: '8px', color: '#3fb950', fontSize: '12px', textAlign: 'center' }}>Open Positions</h4>
          {positions.length === 0 ? (
            <p style={{ color: '#8b949e', fontSize: '11px', textAlign: 'center' }}>No open positions</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #21262d' }}>
                  <th style={{ padding: '2px', color: '#8b949e' }}>Symbol</th>
                  <th style={{ padding: '2px', color: '#8b949e' }}>Qty</th>
                  <th style={{ padding: '2px', color: '#8b949e' }}>Entry</th>
                  <th style={{ padding: '2px', color: '#8b949e' }}>Current</th>
                  <th style={{ padding: '2px', color: '#8b949e' }}>P&L</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #21262d', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1f2a3a'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '2px', fontFamily: 'monospace' }}>{p.symbol}</td>
                    <td style={{ padding: '2px' }}>{p.qty}</td>
                    <td style={{ padding: '2px' }}>{p.avg_entry_price}</td>
                    <td style={{ padding: '2px' }}>{p.current_price}</td>
                    <td style={{ padding: '2px', color: parseFloat(p.unrealized_pl) >= 0 ? '#3fb950' : '#f85149' }}>{p.unrealized_pl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right: Orders */}
        <div style={{ padding: '12px', background: '#161b22', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0, marginBottom: '8px', color: '#58a6ff', fontSize: '12px', textAlign: 'center' }}>Open Orders</h4>
          {orders.length === 0 ? (
            <p style={{ color: '#8b949e', fontSize: '11px', textAlign: 'center' }}>No open orders</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #21262d' }}>
                  <th style={{ padding: '2px', color: '#8b949e' }}>Symbol</th>
                  <th style={{ padding: '2px', color: '#8b949e' }}>Side</th>
                  <th style={{ padding: '2px', color: '#8b949e' }}>Qty</th>
                  <th style={{ padding: '2px', color: '#8b949e' }}>Price</th>
                  <th style={{ padding: '2px', color: '#8b949e' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #21262d', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1f2a3a'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '2px', fontFamily: 'monospace' }}>{o.symbol}</td>
                    <td style={{ padding: '2px', color: o.side === 'buy' ? '#3fb950' : '#f85149' }}>{o.side}</td>
                    <td style={{ padding: '2px' }}>{o.qty}</td>
                    <td style={{ padding: '2px' }}>{o.limit_price || 'market'}</td>
                    <td style={{ padding: '2px' }}>{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

interface TradeProps {
  onSubmit: (data: any) => void;
  loading: boolean;
  message: string;
}

export function TradeTab({ onSubmit, loading, message }: TradeProps) {
  const [symbol, setSymbol] = React.useState('AAPL');
  const [qty, setQty] = React.useState('1');
  const [side, setSide] = React.useState('buy');
  const [price, setPrice] = React.useState('');
  const [type, setType] = React.useState('market');

  return (
    <div style={{ maxWidth: '400px' }}>
      <h3 style={{ marginTop: 0, color: '#58a6ff', textAlign: 'center' }}>Place Order</h3>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', color: '#8b949e', fontSize: '11px', textAlign: 'center' }}>Symbol</label>
        <input
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          style={{ width: '100%', padding: '8px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '13px', textAlign: 'center' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '4px', color: '#8b949e', fontSize: '11px', textAlign: 'center' }}>Side</label>
          <select
            value={side}
            onChange={e => setSide(e.target.value)}
            style={{ width: '100%', padding: '8px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '13px', textAlign: 'center' }}
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '4px', color: '#8b949e', fontSize: '11px', textAlign: 'center' }}>Qty</label>
          <input
            type="number"
            value={qty}
            onChange={e => setQty(e.target.value)}
            style={{ width: '100%', padding: '8px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '13px', textAlign: 'center' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '4px', color: '#8b949e', fontSize: '11px', textAlign: 'center' }}>Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            style={{ width: '100%', padding: '8px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '13px', textAlign: 'center' }}
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>
        {type === 'limit' && (
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '4px', color: '#8b949e', fontSize: '11px', textAlign: 'center' }}>Limit Price</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              style={{ width: '100%', padding: '8px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '13px', textAlign: 'center' }}
            />
          </div>
        )}
      </div>

      <button
        onClick={() => onSubmit({ symbol, qty, side, type, limit_price: price || null })}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: side === 'buy' ? '#238636' : '#da3633',
          border: 'none',
          color: 'white',
          fontSize: '13px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Submitting...' : `${side.toUpperCase()} ${qty} ${symbol}`}
      </button>

      {message && (
        <div style={{ marginTop: '10px', padding: '8px', background: '#161b22', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}>
          {message}
        </div>
      )}
    </div>
  );
}