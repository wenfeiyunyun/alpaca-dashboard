'use client'
import { useEffect, useState } from 'react'

export default function PreviewPage() {
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('compareData') || sessionStorage.getItem('previewData')
      if (stored) {
        const parsed = JSON.parse(stored)
        setData(Array.isArray(parsed) ? parsed : [parsed])
      } else {
        setError('No data found')
      }
    } catch (e: any) {
      setError(e.message)
    }
  }, [])

  if (error) return <div style={{ padding: 40, color: 'red' }}>Error: {error}</div>
  if (!data || data.length === 0) return <div style={{ padding: 40, color: '#888' }}>Loading...</div>

  const isCompare = data.length >= 2

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '12px 20px', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{isCompare ? '⚖️ A/B 对比' : '👁️ 实时预览'}</span>
        <button onClick={() => window.close()} style={{ padding: '6px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>关闭</button>
      </div>

      <div style={{ paddingTop: 60, display: isCompare ? 'grid' : 'block', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        {data.map((item, idx) => (
          <PreviewCard key={idx} data={item} index={idx} />
        ))}
      </div>
    </div>
  )
}

function PreviewCard({ data, index }: { data: any; index: number }) {
  const { strategy, typography, components } = data
  if (!strategy) return null

  const { accentColor, bgColor, textColor, cardBg, radius, padding } = strategy
  const fontHeading = typography?.heading || 'Inter'
  const fontBody = typography?.body || 'Inter'
  const accent = index === 0 ? '#22c55e' : '#3b82f6'

  return (
    <div style={{ background: '#0a0a0a', padding: 24, overflow: 'auto', minHeight: 'calc(100vh - 60px)' }}>
      {/* Label */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 24, height: 24, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{['A', 'B'][index]}</span>
        <span style={{ color: accent, fontWeight: 600 }}>{['方案A', '方案B'][index]}</span>
        <span style={{ fontSize: 12, color: '#666', marginLeft: 'auto' }}>{strategy.theme}</span>
      </div>

      {/* Hero */}
      {components.Hero && (
        <div style={{ padding: 60, background: bgColor, borderRadius: radius, textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: fontHeading, color: textColor, marginBottom: 12 }}>{components.Hero.title}</h1>
          <p style={{ fontSize: 16, opacity: 0.7, marginBottom: 24, color: textColor }}>{components.Hero.subtitle}</p>
          <button style={{ padding: '14px 32px', background: accentColor, color: bgColor, border: 'none', borderRadius: radius / 2, fontSize: 14, fontWeight: 600 }}>{components.Hero.cta}</button>
        </div>
      )}

      {/* Stats */}
      {components.Stats && (
        <div style={{ padding: 24, background: cardBg, borderRadius: radius, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
            {components.Stats.stats?.map((s: any, i: number) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: accentColor }}>{s.value}</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      {components.Features && (
        <div style={{ padding: 24, background: cardBg, borderRadius: radius, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {components.Features.items?.slice(0, 4).map((item: any, i: number) => (
              <div key={i} style={{ padding: 16, background: bgColor, borderRadius: radius / 2, textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 8 }}>{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing */}
      {components.Pricing && (
        <div style={{ padding: 24, background: cardBg, borderRadius: radius }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            {components.Pricing.plans?.map((plan: any, i: number) => (
              <div key={i} style={{ padding: 20, background: bgColor, borderRadius: radius, border: plan.popular ? `2px solid ${accentColor}` : 'none', flex: 1, maxWidth: 200 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{plan.name}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: accentColor }}>{plan.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical */}
      <div style={{ marginTop: 24, padding: 16, background: '#111', borderRadius: 8, fontSize: 11, color: '#666' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <div>字体: {fontHeading}</div>
          <div>圆角: {radius}px</div>
          <div>间距: {padding}px</div>
          <div>卡片: {strategy.cardStyle}</div>
        </div>
      </div>
    </div>
  )
}