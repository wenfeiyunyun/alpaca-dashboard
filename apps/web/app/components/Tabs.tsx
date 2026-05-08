'use client';

import { Candidate, StockAnalysis } from '../types';

interface PositionsProps {
  positions: any[];
}

export function PositionsTab({ positions }: PositionsProps) {
  const formatMoney = (v: string) => `$${parseFloat(v || '0').toFixed(2)}`;

  return (
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
            {positions.map((p: any, i: number) => (
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
  );
}

interface OrdersProps {
  orders: any[];
}

export function OrdersTab({ orders }: OrdersProps) {
  const formatDate = (d: string) => d ? new Date(d).toLocaleString() : '';

  return (
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
            {orders.map((o: any, i: number) => (
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
    <div style={{ maxWidth: '500px' }}>
      <h3 style={{ marginTop: 0 }}>Place Order</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: '#8b949e' }}>Symbol</label>
        <input
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '16px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#8b949e' }}>Side</label>
          <select
            value={side}
            onChange={e => setSide(e.target.value)}
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
            value={qty}
            onChange={e => setQty(e.target.value)}
            style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '16px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#8b949e' }}>Order Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '16px' }}
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>
        {type === 'limit' && (
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#8b949e' }}>Limit Price</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '16px' }}
            />
          </div>
        )}
      </div>

      <button
        onClick={() => onSubmit({ symbol, qty, side, type, limit_price: price || null })}
        disabled={loading}
        style={{
          width: '100%',
          padding: '15px',
          background: side === 'buy' ? '#238636' : '#da3633',
          border: 'none',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Submitting...' : `${side.toUpperCase()} ${qty} ${symbol}`}
      </button>

      {message && (
        <div style={{ marginTop: '15px', padding: '10px', background: '#161b22', borderRadius: '6px', fontSize: '14px' }}>
          {message}
        </div>
      )}
    </div>
  );
}

interface ResearchProps {
  candidates: Candidate[];
  stockAnalysis: StockAnalysis | null;
  onAnalyze: () => void;
  onAnalyzeStock: (symbol: string) => void;
  analyzing: boolean;
}

export function ResearchTab({ candidates, stockAnalysis, onAnalyze, onAnalyzeStock, analyzing }: ResearchProps) {
  const [searchSymbol, setSearchSymbol] = React.useState('');

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>📓 Wheel Strategy Research</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          style={{
            padding: '12px 24px',
            background: '#238636',
            border: 'none',
            color: 'white',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: analyzing ? 'not-allowed' : 'pointer',
            opacity: analyzing ? 0.7 : 1,
          }}
        >
          {analyzing ? '⏳ Analyzing...' : '🔍 分析候选股票池'}
        </button>
      </div>

      {candidates.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ color: '#58a6ff' }}>🏆 TOP 15 推荐 (Wheel Strategy)</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', maxWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #21262d', textAlign: 'left' }}>
                <th style={{ padding: '8px', color: '#8b949e' }}>Symbol</th>
                <th style={{ padding: '8px', color: '#8b949e' }}>Price</th>
                <th style={{ padding: '8px', color: '#8b949e' }}>HV</th>
                <th style={{ padding: '8px', color: '#8b949e' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {candidates.slice(0, 15).map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={{ padding: '8px', fontFamily: 'monospace', fontWeight: 'bold', color: '#58a6ff' }}>
                    {c.symbol}
                  </td>
                  <td style={{ padding: '8px' }}>${c.price.toFixed(2)}</td>
                  <td style={{ padding: '8px', color: c.hv > 60 ? '#f0883e' : c.hv > 40 ? '#d29922' : '#3fb950' }}>
                    {c.hv}%
                  </td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{c.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ padding: '20px', background: '#161b22', borderRadius: '12px', maxWidth: '600px' }}>
        <h4 style={{ marginTop: 0, marginBottom: '15px' }}>🔎 个股分析</h4>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            placeholder="输入股票代码，如 TSLA, AAPL, AMD..."
            value={searchSymbol}
            onChange={e => setSearchSymbol(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && onAnalyzeStock(searchSymbol)}
            style={{
              flex: 1,
              padding: '12px',
              background: '#0d1117',
              border: '1px solid #21262d',
              color: '#e6edf3',
              fontSize: '14px',
              borderRadius: '8px',
            }}
          />
          <button
            onClick={() => onAnalyzeStock(searchSymbol)}
            disabled={analyzing || !searchSymbol.trim()}
            style={{
              padding: '12px 20px',
              background: '#1f6feb',
              border: 'none',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: analyzing ? 'not-allowed' : 'pointer',
              opacity: analyzing ? 0.7 : 1,
            }}
          >
            分析
          </button>
        </div>

        {stockAnalysis && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div style={{ padding: '15px', background: '#0d1117', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#8b949e' }}>当前价格</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3fb950' }}>
                  ${stockAnalysis.price.toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '15px', background: '#0d1117', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#8b949e' }}>历史波动率 (HV)</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: stockAnalysis.hv > 60 ? '#f0883e' : stockAnalysis.hv > 40 ? '#d29922' : '#3fb950' }}>
                  {stockAnalysis.hv}%
                </div>
              </div>
            </div>

            <div style={{ padding: '15px', background: '#0d1117', borderRadius: '8px', marginBottom: '15px' }}>
              <div style={{ fontSize: '12px', color: '#8b949e' }}>Wheel 评分</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#58a6ff' }}>
                {stockAnalysis.score}/100
              </div>
              <div style={{ marginTop: '10px' }}>
                {stockAnalysis.recommendation}
              </div>
            </div>

            <div style={{ padding: '15px', background: '#0d1117', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '10px' }}>Options 建议</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '5px' }}>Sell Put (5% OTM)</div>
                  <div style={{ fontFamily: 'monospace', color: '#f0883e' }}>${stockAnalysis.options.putOTM5}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '5px' }}>Sell Put (10% OTM)</div>
                  <div style={{ fontFamily: 'monospace', color: '#f0883e' }}>${stockAnalysis.options.putOTM10}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '5px' }}>Sell Call (5% OTM)</div>
                  <div style={{ fontFamily: 'monospace', color: '#3fb950' }}>${stockAnalysis.options.callOTM5}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '5px' }}>Sell Call (10% OTM)</div>
                  <div style={{ fontFamily: 'monospace', color: '#3fb950' }}>${stockAnalysis.options.callOTM10}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#161b22', borderRadius: '8px', maxWidth: '600px' }}>
        <h4 style={{ marginTop: 0 }}>📋 评分说明</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#8b949e', fontSize: '13px' }}>
          <li><strong>HV &gt; 60%</strong>: 高权利金 (风险高)</li>
          <li><strong>HV 40-60%</strong>: 中高权利金</li>
          <li><strong>HV 20-40%</strong>: 中等权利金 (推荐练习)</li>
          <li><strong>HV &lt; 20%</strong>: 低权利金 (稳定)</li>
          <li><strong>价格 $20-$200</strong>: 最佳行权区间</li>
        </ul>
      </div>
    </div>
  );
}

import React from 'react';