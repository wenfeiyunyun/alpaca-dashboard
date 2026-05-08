'use client';

import { Candidate, StockAnalysis, OptionsChain, TradeProps } from '../types';
import React, { useState } from 'react';

interface TradeProps {
  tradeSymbol?: string;
  tradePrice?: string;
  tradeQty?: string;
  setTradeSymbol?: (v: string) => void;
  setTradePrice?: (v: string) => void;
  setTradeQty?: (v: string) => void;
  onTrade?: (side: string) => void;
}

interface ResearchProps {
  tradeSymbol?: string;
  tradePrice?: string;
  tradeQty?: string;
  setTradeSymbol?: (v: string) => void;
  setTradePrice?: (v: string) => void;
  setTradeQty?: (v: string) => void;
  onTrade?: (side: string) => void;

  onSelectPrice?: (strike: number, type: 'call' | 'put', price: number) => void;
  candidates: Candidate[];
  stockAnalysis: StockAnalysis | null;
  optionsChain: OptionsChain | null;
  onAnalyze: () => void;
  onAnalyzeStock: (symbol: string) => void;
  onGetOptions: (symbol: string) => void;
  analyzing: boolean;
}

export function ResearchTab({ candidates, stockAnalysis, optionsChain, onAnalyze, onAnalyzeStock, onGetOptions, analyzing, onSelectPrice, tradeSymbol, tradePrice, tradeQty, setTradeSymbol, setTradePrice, setTradeQty, onTrade }: ResearchProps) {
  const [searchSymbol, setSearchSymbol] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginTop: 0, color: '#58a6ff', marginBottom: '15px', fontSize: '18px', textAlign: 'center' }}>Wheel Strategy Research</h3>
      
      <div style={{ marginBottom: '15px', textAlign: 'center' }}>
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          style={{
            padding: '10px 20px',
            background: '#238636',
            border: 'none',
            color: 'white',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: analyzing ? 'not-allowed' : 'pointer',
          }}
        >
          {analyzing ? 'Analyzing...' : 'Analyze Candidates'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '12px' }}>
        {/* Left: Candidates */}
        <div>
          <div style={{ padding: '10px', background: '#161b22', borderRadius: '8px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '6px', color: '#d29922', fontSize: '12px', textAlign: 'center' }}>TOP 10 Candidates</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #21262d' }}>
                  <th style={{ padding: '3px', color: '#8b949e' }}>Sym</th>
                  <th style={{ padding: '3px', color: '#8b949e' }}>Price</th>
                  <th style={{ padding: '3px', color: '#8b949e' }}>HV</th>
                  <th style={{ padding: '3px', color: '#8b949e' }}>Scr</th>
                  <th style={{ padding: '3px', color: '#8b949e' }}></th>
                </tr>
              </thead>
              <tbody>
                {candidates.slice(0, 10).map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                    <td style={{ padding: '3px', fontFamily: 'monospace', fontWeight: 'bold', color: '#58a6ff' }}>{c.symbol}</td>
                    <td style={{ padding: '3px' }}>${c.price.toFixed(0)}</td>
                    <td style={{ padding: '3px', color: c.hv > 60 ? '#f0883e' : c.hv > 40 ? '#d29922' : '#3fb950' }}>{c.hv}%</td>
                    <td style={{ padding: '3px', fontWeight: 'bold' }}>{c.score}</td>
                    <td style={{ padding: '3px' }}>
                      <button
                        onClick={() => onGetOptions(c.symbol)}
                        style={{ padding: '2px 5px', background: '#1f6feb', border: 'none', color: 'white', borderRadius: '3px', fontSize: '9px', cursor: 'pointer' }}
                      >
                        Options
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '10px', padding: '10px', background: '#161b22', borderRadius: '8px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '6px', fontSize: '12px', textAlign: 'center' }}>Stock Analysis</h4>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                placeholder="Symbol..."
                value={searchSymbol}
                onChange={e => setSearchSymbol(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: '6px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '11px', borderRadius: '4px', textAlign: 'center' }}
              />
              <button
                onClick={() => { onAnalyzeStock(searchSymbol); onGetOptions(searchSymbol); }}
                disabled={analyzing || !searchSymbol.trim()}
                style={{ padding: '6px 10px', background: '#1f6feb', border: 'none', color: 'white', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
              >
                Go
              </button>
            </div>
            
            {stockAnalysis && (
              <div style={{ marginTop: '8px', padding: '8px', background: '#0d1117', borderRadius: '4px', fontSize: '12px', textAlign: 'center' }}>
                <div style={{ color: '#8b949e' }}>
                  Score: <strong style={{ color: '#58a6ff', fontSize: '16px' }}>{stockAnalysis.score}/100</strong>
                  <span style={{ marginLeft: '8px' }}>{stockAnalysis.recommendation}</span>
                </div>
                <div style={{ marginTop: '4px', color: '#8b949e', fontSize: '10px' }}>
                  Price: ${stockAnalysis.price} | HV: {stockAnalysis.hv}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Options */}
        <div>
          {optionsChain && (
            <div style={{ padding: '10px', background: '#161b22', borderRadius: '8px' }}>
              <h4 style={{ marginTop: 0, marginBottom: '6px', color: '#58a6ff', fontSize: '12px', textAlign: 'center' }}>
                {optionsChain.symbol} {optionsChain.calls.length} strikes  ${optionsChain.price}  HV:{optionsChain.hv}%
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {/* Calls */}
                <div>
                  <h5 style={{ color: '#3fb950', marginBottom: '3px', fontSize: '10px', textAlign: 'center' }}>Calls</h5>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #21262d' }}>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Strike</th>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Price</th>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Bid</th>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Ask</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionsChain.calls.map((c, i) => {
                        const isATM = Math.abs(c.strike - optionsChain.price) < optionsChain.price * 0.01;
                        return (
                          <tr key={i} style={{ background: isATM ? '#1f3a5f' : 'transparent' }}>
                            <td style={{ padding: '1px', fontFamily: 'monospace', fontWeight: isATM ? 'bold' : 'normal' }}>{c.strike.toFixed(2)}</td>
                            <td style={{ padding: '1px', color: '#3fb950', fontWeight: isATM ? 'bold' : 'normal', cursor: 'pointer' }} onClick={() => onSelectPrice && onSelectPrice(c.strike, 'call', c.price)}>{c.price.toFixed(1)}</td>
                            <td style={{ padding: '1px' }}>{c.bid.toFixed(1)}</td>
                            <td style={{ padding: '1px' }}>{c.ask.toFixed(1)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Puts */}
                <div>
                  <h5 style={{ color: '#f0883e', marginBottom: '3px', fontSize: '10px', textAlign: 'center' }}>Puts</h5>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #21262d' }}>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Strike</th>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Price</th>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Bid</th>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Ask</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionsChain.puts.map((p, i) => {
                        const isATM = Math.abs(p.strike - optionsChain.price) < optionsChain.price * 0.01;
                        return (
                          <tr key={i} style={{ background: isATM ? '#3d1f1f' : 'transparent' }}>
                            <td style={{ padding: '1px', fontFamily: 'monospace', fontWeight: isATM ? 'bold' : 'normal' }}>{p.strike.toFixed(2)}</td>
                            <td style={{ padding: '1px', color: '#f0883e', fontWeight: isATM ? 'bold' : 'normal', cursor: 'pointer' }} onClick={() => onSelectPrice && onSelectPrice(p.strike, 'put', p.price)}>{p.price.toFixed(1)}</td>
                            <td style={{ padding: '1px' }}>{p.bid.toFixed(1)}</td>
                            <td style={{ padding: '1px' }}>{p.ask.toFixed(1)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {!optionsChain && (
            <div style={{ padding: '25px', background: '#161b22', borderRadius: '8px', textAlign: 'center', color: '#8b949e', fontSize: '12px' }}>
              Click "Options" button to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}