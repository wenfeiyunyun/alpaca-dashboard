'use client';

import { Candidate, StockAnalysis, OptionsChain } from '../types';
import React, { useState } from 'react';

interface ResearchProps {
  candidates: Candidate[];
  stockAnalysis: StockAnalysis | null;
  optionsChain: OptionsChain | null;
  onAnalyze: () => void;
  onAnalyzeStock: (symbol: string) => void;
  onGetOptions: (symbol: string) => void;
  analyzing: boolean;
}

export function ResearchTab({ candidates, stockAnalysis, optionsChain, onAnalyze, onAnalyzeStock, onGetOptions, analyzing }: ResearchProps) {
  const [searchSymbol, setSearchSymbol] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginTop: 0, color: '#58a6ff', marginBottom: '20px' }}>📓 Wheel Strategy Research</h3>
      
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

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '15px' }}>
        {/* 左边：推荐表 */}
        <div>
          <div style={{ padding: '12px', background: '#161b22', borderRadius: '10px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '8px', color: '#d29922', fontSize: '13px' }}>🏆 TOP 10 推荐</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #21262d' }}>
                  <th style={{ padding: '4px', color: '#8b949e', fontSize: '10px' }}>Sym</th>
                  <th style={{ padding: '4px', color: '#8b949e', fontSize: '10px' }}>Price</th>
                  <th style={{ padding: '4px', color: '#8b949e', fontSize: '10px' }}>HV</th>
                  <th style={{ padding: '4px', color: '#8b949e', fontSize: '10px' }}>Scr</th>
                  <th style={{ padding: '4px', color: '#8b949e', fontSize: '10px' }}></th>
                </tr>
              </thead>
              <tbody>
                {candidates.slice(0, 10).map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                    <td style={{ padding: '4px', fontFamily: 'monospace', fontWeight: 'bold', color: '#58a6ff', fontSize: '12px' }}>{c.symbol}</td>
                    <td style={{ padding: '4px', fontSize: '12px' }}>${c.price.toFixed(0)}</td>
                    <td style={{ padding: '4px', color: c.hv > 60 ? '#f0883e' : c.hv > 40 ? '#d29922' : '#3fb950', fontSize: '12px' }}>{c.hv}%</td>
                    <td style={{ padding: '4px', fontWeight: 'bold', fontSize: '12px' }}>{c.score}</td>
                    <td style={{ padding: '4px' }}>
                      <button
                        onClick={() => onGetOptions(c.symbol)}
                        style={{
                          padding: '2px 6px',
                          background: '#1f6feb',
                          border: 'none',
                          color: 'white',
                          borderRadius: '3px',
                          fontSize: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        期权
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '12px', padding: '12px', background: '#161b22', borderRadius: '10px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '13px' }}>🔎 个股分析</h4>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                placeholder="股票代码..."
                value={searchSymbol}
                onChange={e => setSearchSymbol(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: '8px', background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', fontSize: '12px', borderRadius: '4px' }}
              />
              <button
                onClick={() => { onAnalyzeStock(searchSymbol); onGetOptions(searchSymbol); }}
                disabled={analyzing || !searchSymbol.trim()}
                style={{ padding: '8px 12px', background: '#1f6feb', border: 'none', color: 'white', borderRadius: '4px', fontSize: '12px', cursor: analyzing ? 'not-allowed' : 'pointer' }}
              >
                分析
              </button>
            </div>
          </div>
        </div>

        {/* 右边：Options 链 */}
        <div>
          {optionsChain && (
            <div style={{ padding: '12px', background: '#161b22', borderRadius: '10px' }}>
              <h4 style={{ marginTop: 0, marginBottom: '8px', color: '#58a6ff', fontSize: '13px' }}>
                📊 {optionsChain.symbol} {optionsChain.calls.length}个价  ${optionsChain.price}  HV:{optionsChain.hv}%
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {/* Calls */}
                <div>
                  <h5 style={{ color: '#3fb950', marginBottom: '4px', fontSize: '11px' }}>📈 Calls</h5>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #21262d' }}>
                        <th style={{ padding: '1px', color: '#8b949e' }}>行权价</th>
                        <th style={{ padding: '1px', color: '#8b949e' }}>价格</th>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Bid</th>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Ask</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionsChain.calls.map((c, i) => {
                        const isATM = Math.abs(c.strike - optionsChain.price) < optionsChain.price * 0.01;
                        return (
                          <tr key={i} style={{ background: isATM ? '#1f3a5f' : 'transparent' }}>
                            <td style={{ padding: '2px', fontFamily: 'monospace', fontWeight: isATM ? 'bold' : 'normal' }}>{c.strike.toFixed(0)}</td>
                            <td style={{ padding: '2px', color: '#3fb950', fontWeight: isATM ? 'bold' : 'normal' }}>{c.price.toFixed(1)}</td>
                            <td style={{ padding: '2px' }}>{c.bid.toFixed(1)}</td>
                            <td style={{ padding: '2px' }}>{c.ask.toFixed(1)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Puts */}
                <div>
                  <h5 style={{ color: '#f0883e', marginBottom: '4px', fontSize: '11px' }}>📉 Puts</h5>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #21262d' }}>
                        <th style={{ padding: '1px', color: '#8b949e' }}>行权价</th>
                        <th style={{ padding: '1px', color: '#8b949e' }}>价格</th>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Bid</th>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Ask</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionsChain.puts.map((p, i) => {
                        const isATM = Math.abs(p.strike - optionsChain.price) < optionsChain.price * 0.01;
                        return (
                          <tr key={i} style={{ background: isATM ? '#3d1f1f' : 'transparent' }}>
                            <td style={{ padding: '2px', fontFamily: 'monospace', fontWeight: isATM ? 'bold' : 'normal' }}>{p.strike.toFixed(0)}</td>
                            <td style={{ padding: '2px', color: '#f0883e', fontWeight: isATM ? 'bold' : 'normal' }}>{p.price.toFixed(1)}</td>
                            <td style={{ padding: '2px' }}>{p.bid.toFixed(1)}</td>
                            <td style={{ padding: '2px' }}>{p.ask.toFixed(1)}</td>
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
            <div style={{ padding: '30px', background: '#161b22', borderRadius: '10px', textAlign: 'center', color: '#8b949e', fontSize: '13px' }}>
              点击左侧股票 "期权" 按钮查看
            </div>
          )}
        </div>
      </div>
    </div>
  );
}