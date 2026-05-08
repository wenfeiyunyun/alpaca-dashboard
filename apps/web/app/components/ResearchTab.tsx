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
      <h3 style={{ marginTop: 0, color: '#58a6ff' }}>📓 Wheel Strategy Research</h3>
      
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

      {/* 推荐股票池 */}
      {candidates.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ color: '#d29922' }}>🏆 TOP 10 推荐</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', maxWidth: '500px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #21262d' }}>
                <th style={{ padding: '8px', color: '#8b949e' }}>Symbol</th>
                <th style={{ padding: '8px', color: '#8b949e' }}>Price</th>
                <th style={{ padding: '8px', color: '#8b949e' }}>HV</th>
                <th style={{ padding: '8px', color: '#8b949e' }}>Score</th>
                <th style={{ padding: '8px', color: '#8b949e' }}>Options</th>
              </tr>
            </thead>
            <tbody>
              {candidates.slice(0, 10).map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={{ padding: '8px', fontFamily: 'monospace', fontWeight: 'bold', color: '#58a6ff' }}>{c.symbol}</td>
                  <td style={{ padding: '8px' }}>${c.price.toFixed(2)}</td>
                  <td style={{ padding: '8px', color: c.hv > 60 ? '#f0883e' : c.hv > 40 ? '#d29922' : '#3fb950' }}>{c.hv}%</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{c.score}</td>
                  <td style={{ padding: '8px' }}>
                    <button
                      onClick={() => onGetOptions(c.symbol)}
                      style={{
                        padding: '4px 10px',
                        background: '#1f6feb',
                        border: 'none',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Options 链 - 左右排列 */}
      {optionsChain && (
        <div style={{ marginBottom: '30px', padding: '20px', background: '#161b22', borderRadius: '12px' }}>
          <h4 style={{ marginTop: 0, color: '#58a6ff', marginBottom: '15px' }}>
            📊 {optionsChain.symbol} Options 链
            <span style={{ fontSize: '14px', color: '#8b949e', marginLeft: '15px' }}>
              价格: ${optionsChain.price.toFixed(2)} | HV: {optionsChain.hv}%
            </span>
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Calls - 左边 */}
            <div>
              <h5 style={{ color: '#3fb950', marginBottom: '10px' }}>📈 Calls (看涨)</h5>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #21262d' }}>
                    <th style={{ padding: '6px', color: '#8b949e', fontSize: '12px' }}>Strike</th>
                    <th style={{ padding: '6px', color: '#8b949e', fontSize: '12px' }}>Price</th>
                    <th style={{ padding: '6px', color: '#8b949e', fontSize: '12px' }}>Bid</th>
                    <th style={{ padding: '6px', color: '#8b949e', fontSize: '12px' }}>Ask</th>
                  </tr>
                </thead>
                <tbody>
                  {optionsChain.calls.slice(0, 8).map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                      <td style={{ padding: '6px', fontFamily: 'monospace', fontSize: '13px' }}>${c.strike}</td>
                      <td style={{ padding: '6px', color: '#3fb950', fontWeight: 'bold', fontSize: '13px' }}>${c.price.toFixed(2)}</td>
                      <td style={{ padding: '6px', fontSize: '13px' }}>${c.bid.toFixed(2)}</td>
                      <td style={{ padding: '6px', fontSize: '13px' }}>${c.ask.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Puts - 右边 */}
            <div>
              <h5 style={{ color: '#f0883e', marginBottom: '10px' }}>📉 Puts (看跌)</h5>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #21262d' }}>
                    <th style={{ padding: '6px', color: '#8b949e', fontSize: '12px' }}>Strike</th>
                    <th style={{ padding: '6px', color: '#8b949e', fontSize: '12px' }}>Price</th>
                    <th style={{ padding: '6px', color: '#8b949e', fontSize: '12px' }}>Bid</th>
                    <th style={{ padding: '6px', color: '#8b949e', fontSize: '12px' }}>Ask</th>
                  </tr>
                </thead>
                <tbody>
                  {optionsChain.puts.slice(0, 8).map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                      <td style={{ padding: '6px', fontFamily: 'monospace', fontSize: '13px' }}>${p.strike}</td>
                      <td style={{ padding: '6px', color: '#f0883e', fontWeight: 'bold', fontSize: '13px' }}>${p.price.toFixed(2)}</td>
                      <td style={{ padding: '6px', fontSize: '13px' }}>${p.bid.toFixed(2)}</td>
                      <td style={{ padding: '6px', fontSize: '13px' }}>${p.ask.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 个股分析 */}
      <div style={{ padding: '20px', background: '#161b22', borderRadius: '12px', maxWidth: '500px' }}>
        <h4 style={{ marginTop: 0 }}>🔎 个股分析</h4>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            placeholder="输入股票代码，如 TSLA, AAPL..."
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
            onClick={() => { onAnalyzeStock(searchSymbol); onGetOptions(searchSymbol); }}
            disabled={analyzing || !searchSymbol.trim()}
            style={{
              padding: '12px 20px',
              background: '#1f6feb',
              border: 'none',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: analyzing ? 'not-allowed' : 'pointer',
            }}
          >
            分析
          </button>
        </div>

        {stockAnalysis && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <div style={{ padding: '12px', background: '#0d1117', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>价格</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3fb950' }}>${stockAnalysis.price.toFixed(2)}</div>
              </div>
              <div style={{ padding: '12px', background: '#0d1117', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>HV</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stockAnalysis.hv}%</div>
              </div>
            </div>

            <div style={{ padding: '12px', background: '#0d1117', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#8b949e' }}>Wheel 评分: <strong style={{ color: '#58a6ff', fontSize: '18px' }}>{stockAnalysis.score}/100</strong></div>
              <div style={{ color: stockAnalysis.recommendation.includes('⚠️') ? '#f0883e' : stockAnalysis.recommendation.includes('🟡') ? '#d29922' : '#3fb950' }}>
                {stockAnalysis.recommendation}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 说明 */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#161b22', borderRadius: '8px', maxWidth: '500px' }}>
        <h4 style={{ marginTop: 0, fontSize: '13px' }}>📋 评分说明</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#8b949e', fontSize: '12px' }}>
          <li>HV &gt; 60%: 高权利金</li>
          <li>HV 40-60%: 中高权利金</li>
          <li>HV 20-40%: 中等权利金 (推荐)</li>
          <li>价格 $20-$200: 最佳行权区间</li>
        </ul>
      </div>
    </div>
  );
}