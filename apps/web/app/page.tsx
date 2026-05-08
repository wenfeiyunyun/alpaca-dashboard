'use client';
import { useState, useEffect } from 'react';
import { PositionsTab, OrdersTab, TradeTab, ResearchTab } from './components/Tabs';
import type { Candidate, StockAnalysis } from './types';

const TABS = ['positions', 'orders', 'trade', 'research'] as const;
type Tab = typeof TABS[number];

export default function Dashboard() {
  const [account, setAccount] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [clock, setClock] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('positions');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stockAnalysis, setStockAnalysis] = useState<StockAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

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
    } catch (e) { console.error(e); }
  };

  const analyzeCandidates = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/research?endpoint=analyze');
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch (e) { console.error(e); }
    setAnalyzing(false);
  };

  const analyzeStock = async (symbol: string) => {
    if (!symbol.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/research?endpoint=stock&symbol=${symbol.trim()}`);
      const data = await res.json();
      if (data.error) alert(data.error);
      else setStockAnalysis(data);
    } catch (e) { console.error(e); }
    setAnalyzing(false);
  };

  const handleOrder = async (order: any) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/alpaca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.symbol} ${data.side} ${data.qty} @ ${data.limit_price || 'market'}`);
        fetchData();
      } else {
        setMessage(`❌ ${data.message || JSON.stringify(data)}`);
      }
    } catch (e: any) { setMessage(`❌ ${e.message}`); }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatMoney = (v: string) => `$${parseFloat(v || '0').toFixed(2)}`;
  const tabLabels = { positions: '📊 Positions', orders: '📋 Orders', trade: '📝 Trade', research: '📓 Research' };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'system-ui' }}>
      <header style={{ padding: '20px', borderBottom: '1px solid #21262d', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#58a6ff' }}>🐉 Alpaca Dashboard</h1>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#8b949e' }}>Portfolio</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3fb950' }}>{account ? formatMoney(account.portfolio_value) : '...'}</div>
          <div style={{ fontSize: '14px', color: '#8b949e' }}>Cash: {account ? formatMoney(account.cash) : '...'}</div>
        </div>
      </header>

      <div style={{ padding: '10px 20px', background: '#161b22', fontSize: '12px', color: '#8b949e' }}>
        <span>📈 {clock?.is_open ? '🟢 OPEN' : '🔴 CLOSED'}</span>
        <span style={{ marginLeft: '20px' }}>💰 {account ? formatMoney(account.buying_power) : '...'}</span>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #21262d' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '15px 30px',
              background: activeTab === tab ? '#161b22' : 'transparent',
              border: 'none',
              color: activeTab === tab ? '#58a6ff' : '#8b949e',
              borderBottom: activeTab === tab ? '2px solid #58a6ff' : '2px solid transparent',
              cursor: 'pointer', fontSize: '14px',
            }}>
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px' }}>
        {activeTab === 'positions' && <PositionsTab positions={positions} />}
        {activeTab === 'orders' && <OrdersTab orders={orders} />}
        {activeTab === 'trade' && <TradeTab onSubmit={handleOrder} loading={loading} message={message} />}
        {activeTab === 'research' && (
          <ResearchTab
            candidates={candidates}
            stockAnalysis={stockAnalysis}
            onAnalyze={analyzeCandidates}
            onAnalyzeStock={analyzeStock}
            analyzing={analyzing}
          />
        )}
      </div>
    </div>
  );
}