'use client'
import { useEffect, useState } from 'react'

export default function ComparePage() {
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('compareData')
      if (stored) {
        setData(JSON.parse(stored))
      } else {
        setError('No data found')
      }
    } catch (e: any) {
      setError(e.message)
    }
  }, [])

  if (error) return <div style={{ padding: 40, color: 'red' }}>Error: {error}</div>
  if (data.length === 0) return <div style={{ padding: 40 }}>Loading...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>⚖️ A/B 对比</h1>
        <button onClick={() => window.close()} style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>关闭</button>
      </div>

      {/* Compare Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, minHeight: 'calc(100vh - 60px)' }}>
        {data.map((item, index) => (
          <CompareCard key={index} data={item} label={index === 0 ? 'A 方案' : 'B 方案'} accent={index === 0 ? '#22c55e' : '#3b82f6'} />
        ))}
      </div>
    </div>
  )
}

function CompareCard({ data, label, accent }: { data: any; label: string; accent: string }) {
  const { strategy, typography, components, motion } = data
  const { accentColor, bgColor, textColor, cardBg, radius, padding } = strategy
  const fontHeading = typography?.heading || 'Inter'
  const fontBody = typography?.body || 'Inter'

  return (
    <div style={{ background: '#0a0a0a', padding: 24, overflow: 'auto' }}>
      {/* Label */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 24, height: 24, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{label[0]}</span>
        <span style={{ color: accent, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, color: '#666', marginLeft: 'auto' }}>{strategy.theme}</span>
      </div>

      {/* Hero Preview */}
      {components.Hero && (
        <div style={{ padding: 60, background: bgColor, borderRadius: radius, textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: fontHeading, color: textColor, marginBottom: 12 }}>
            {components.Hero.title}
          </h1>
          <p style={{ fontSize: 16, opacity: 0.7, marginBottom: 24, color: textColor }}>
            {components.Hero.subtitle}
          </p>
          <button style={{ padding: '14px 32px', background: accentColor, color: bgColor, border: 'none', borderRadius: radius / 2, fontSize: 14, fontWeight: 600 }}>
            {components.Hero.cta}
          </button>
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

      {/* Technical Details */}
      <div style={{ marginTop: 24, padding: 16, background: '#111', borderRadius: 8, fontSize: 12, color: '#888' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div><span style={{ color: '#666' }}>字体:</span> {fontHeading}</div>
          <div><span style={{ color: '#666' }}>圆角:</span> {radius}px</div>
          <div><span style={{ color: '#666' }}>间距:</span> {padding}px</div>
          <div><span style={{ color: '#666' }}>动画:</span> {motion?.duration}ms</div>
          <div><span style={{ color: '#666' }}>阴影:</span> {strategy.shadowStyle || 'none'}</div>
          <div><span style={{ color: '#666' }}>布局:</span> {data.layout?.grid || 'auto-fit'}</div>
        </div>
      </div>
    </div>
  )
}