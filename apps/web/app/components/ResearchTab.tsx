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
      
      {/* 分析按钮 */}
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

      {/* 主体：左右并排 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* 左边：Options 链 */}
        <div>
          {optionsChain && (
            <div style={{ padding: '15px', background: '#161b22', borderRadius: '12px' }}>
              <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#58a6ff', fontSize: '16px' }}>
                📊 {optionsChain.symbol} Options
                <span style={{ fontSize: '13px', color: '#8b949e', marginLeft: '10px' }}>
                  ${optionsChain.price.toFixed(2)} | HV: {optionsChain.hv}%
                </span>
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {/* Calls */}
                <div>
                  <h5 style={{ color: '#3fb950', marginBottom: '8px', fontSize: '13px' }}>📈 Calls</h5>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #21262d' }}>
                        <th style={{ padding: '4px', color: '#8b949e', fontSize: '11px' }}>Str</th>
                        <th style={{ padding: '4px', color: '#8b949e', fontSize: '11px' }}>Price</th>
                        <th style={{ padding: '4px', color: '#8b949e', fontSize: '11px' }}>Bid</th>
                        <th style={{ padding: '4px', color: '#8b949e', fontSize: '11px' }}>Ask</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionsChain.calls.slice(0, 6).map((c, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                          <td style={{ padding: '4px', fontFamily: 'monospace', fontSize: '12px' }}>${c.strike}</td>
                          <td style={{ padding: '4px', color: '#3fb950', fontWeight: 'bold', fontSize: '12px' }}>${c.price}</td>
                          <td style={{ padding: '4px', fontSize: '12px' }}>${c.bid}</td>
                          <td style={{ padding: '4px', fontSize: '12px' }}>${c.ask}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Puts */}
                <div>
                  <h5 style={{ color: '#f0883e', marginBottom: '8px', fontSize: '13px' }}>📉 Puts</h5>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #21262d' }}>
                        <th style={{ padding: '4px', color: '#8b949e', fontSize: '11px' }}>Str</th>
                        <th style={{ padding: '4px', color: '#8b949e', fontSize: '11px' }}>Price</th>
                        <th style={{ padding: '4px', color: '#8b949e', fontSize: '11px' }}>Bid</th>
                        <th style={{ padding: '4px', color: '#8b949e', fontSize: '11px' }}>Ask</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionsChain.puts.slice(0, 6).map((p, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                          <td style={{ padding: '4px', fontFamily: 'monospace', fontSize: '12px' }}>${p.strike}</td>
                          <td style={{ padding: '4px', color: '#f0883e', fontWeight: 'bold', fontSize: '12px' }}>${p.price}</td>
                          <td style={{ padding: '4px', fontSize: '12px' }}>${p.bid}</td>
                          <td style={{ padding: '4px', fontSize: '12px' }}>${p.ask}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* 个股分析输入 */}
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

        {/* 右边：推荐表 */}
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
          
          {/* 说明 */}
          <div style={{ marginTop: '15px', padding: '12px', background: '#161b22', borderRadius: '8px' }}>
            <h5 style={{ marginTop: 0, marginBottom: '8px', fontSize: '12px', color: '#8b949e' }}>📋 评分说明</h5>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#8b949e', fontSize: '11px' }}>
              <li>HV &gt; 60%: 高权利金</li>
              <li>HV 40-60%: 中高权利金</li>
              <li>HV 20-40%: 推荐</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}