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

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px' }}>
        {/* 左边：推荐表 */}
        <div>
          <div style={{ padding: '15px', background: '#161b22', borderRadius: '12px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#d29922', fontSize: '14px' }}>🏆 TOP 10 推荐</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #21262d' }}>
                  <th style={{ padding: '6px', color: '#8b949e', fontSize: '11px' }}>Symbol</th>
                  <th style={{ padding: '6px', color: '#8b949e', fontSize: '11px' }}>Price</th>
                  <th style={{ padding: '6px', color: '#8b949e', fontSize: '11px' }}>HV</th>
                  <th style={{ padding: '6px', color: '#8b949e', fontSize: '11px' }}>Score</th>
                  <th style={{ padding: '6px', color: '#8b949e', fontSize: '11px' }}></th>
                </tr>
              </thead>
              <tbody>
                {candidates.slice(0, 10).map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                    <td style={{ padding: '6px', fontFamily: 'monospace', fontWeight: 'bold', color: '#58a6ff', fontSize: '13px' }}>{c.symbol}</td>
                    <td style={{ padding: '6px', fontSize: '13px' }}>${c.price.toFixed(2)}</td>
                    <td style={{ padding: '6px', color: c.hv > 60 ? '#f0883e' : c.hv > 40 ? '#d29922' : '#3fb950', fontSize: '13px' }}>{c.hv}%</td>
                    <td style={{ padding: '6px', fontWeight: 'bold', fontSize: '13px' }}>{c.score}</td>
                    <td style={{ padding: '6px' }}>
                      <button
                        onClick={() => onGetOptions(c.symbol)}
                        style={{
                          padding: '3px 8px',
                          background: '#1f6feb',
                          border: 'none',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Options
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {candidates.length === 0 && (
              <p style={{ color: '#8b949e', textAlign: 'center', padding: '20px' }}>
                点击上方按钮分析股票池
              </p>
            )}
          </div>
          
          <div style={{ marginTop: '15px', padding: '15px', background: '#161b22', borderRadius: '12px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '10px', fontSize: '14px' }}>🔎 个股分析</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                placeholder="股票代码..."
                value={searchSymbol}
                onChange={e => setSearchSymbol(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && onAnalyzeStock(searchSymbol)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#0d1117',
                  border: '1px solid #21262d',
                  color: '#e6edf3',
                  fontSize: '13px',
                  borderRadius: '6px',
                }}
              />
              <button
                onClick={() => { onAnalyzeStock(searchSymbol); onGetOptions(searchSymbol); }}
                disabled={analyzing || !searchSymbol.trim()}
                style={{
                  padding: '10px 15px',
                  background: '#1f6feb',
                  border: 'none',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: analyzing ? 'not-allowed' : 'pointer',
                }}
              >
                分析
              </button>
            </div>
            
            {stockAnalysis && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#0d1117', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: '#8b949e' }}>
                  评分: <strong style={{ color: '#58a6ff', fontSize: '16px' }}>{stockAnalysis.score}/100</strong>
                  <span style={{ marginLeft: '10px' }}>{stockAnalysis.recommendation}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右边：Options 链 - 不滚动，直接显示 */}
        <div>
          {optionsChain && (
            <div style={{ padding: '15px', background: '#161b22', borderRadius: '12px' }}>
              <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#58a6ff', fontSize: '14px' }}>
                📊 {optionsChain.symbol} Options ({optionsChain.calls.length}个价)
                <span style={{ fontSize: '12px', color: '#8b949e', marginLeft: '10px' }}>
                  ${optionsChain.price} | HV:{optionsChain.hv}%
                </span>
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Calls - 全部显示 */}
                <div>
                  <h5 style={{ color: '#3fb950', marginBottom: '4px', fontSize: '11px' }}>📈 Calls</h5>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #21262d' }}>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Str</th>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Prc</th>
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
                            <td style={{ padding: '1px', color: '#3fb950', fontWeight: isATM ? 'bold' : 'normal' }}>{c.price.toFixed(2)}</td>
                            <td style={{ padding: '1px' }}>{c.bid.toFixed(2)}</td>
                            <td style={{ padding: '1px' }}>{c.ask.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Puts - 全部显示 */}
                <div>
                  <h5 style={{ color: '#f0883e', marginBottom: '4px', fontSize: '11px' }}>📉 Puts</h5>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #21262d' }}>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Str</th>
                        <th style={{ padding: '1px', color: '#8b949e' }}>Prc</th>
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
                            <td style={{ padding: '1px', color: '#f0883e', fontWeight: isATM ? 'bold' : 'normal' }}>{p.price.toFixed(2)}</td>
                            <td style={{ padding: '1px' }}>{p.bid.toFixed(2)}</td>
                            <td style={{ padding: '1px' }}>{p.ask.toFixed(2)}</td>
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
            <div style={{ padding: '40px', background: '#161b22', borderRadius: '12px', textAlign: 'center', color: '#8b949e' }}>
              <p>点击左侧股票的 "Options" 查看41个价格</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}