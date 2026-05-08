'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [tab, setTab] = useState('dynamic')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState('')
  const [favorites, setFavorites] = useState<any[]>([])
  const [compareList, setCompareList] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('default')
  const [projectPath, setProjectPath] = useState('/Users/user/.openclaw/projects')

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ui-favorites')
    if (saved) {
      setFavorites(JSON.parse(saved))
    }
  }, [])

  // Remove from favorites
  const removeFromFavorites = (id: string) => {
    const newFavorites = favorites.filter(f => f.id !== id)
    setFavorites(newFavorites)
    localStorage.setItem('ui-favorites', JSON.stringify(newFavorites))
  }

  // Save to favorites
  const addToFavorites = (item: any) => {
    if (favorites.some(f => f.id === item.id)) {
      return // Already favorited
    }
    const newFavorites = [...favorites, item]
    setFavorites(newFavorites)
    localStorage.setItem('ui-favorites', JSON.stringify(newFavorites))
  }

// Check if item is favorited
  const isFavorited = (id: string) => favorites.some(f => f.id === id)

  const toggleCompare = (item: any) => {
    if (compareList.some(c => c.id === item.id)) {
      setCompareList(compareList.filter(c => c.id !== item.id))
    } else if (compareList.length < 2) {
      setCompareList([...compareList, item])
    }
  }
  
  const isInCompare = (id: string) => compareList.some(c => c.id === id)

  const handleGenerate = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('http://localhost:3002/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 12, template: selectedTemplate })
      })
      const data = await res.json()
      if (data.success) {
        setResults(data.schemas)
        setMessage(`生成 ${data.schemas.length} 个版式`)
      } else {
        setMessage('Error: ' + JSON.stringify(data))
      }
    } catch (e) { 
      setMessage('Error: ' + e)
    }
    setLoading(false)
  }

  const handleAnalyze = async () => {
    if (!url) {
      setMessage('请输入URL')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('http://localhost:3002/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, count: 12 })
      })
      const data = await res.json()
      if (data.success) {
        setResults(data.variations)
        setMessage(`✅ 提取完成! 发现: ${data.summary?.sections?.join(', ') || 'none'}`)
      } else {
        setMessage('Error: ' + data.error)
      }
    } catch (e) { 
      setMessage('Error: ' + e)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ padding: '16px 24px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>🎨 UI 版式库</h1>
        <span style={{ fontSize: 12, color: '#666' }}>动态生成 + 网站分析</span>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{ width: 280, padding: 20, background: '#111', borderRight: '1px solid #222', minHeight: 'calc(100vh - 60px)' }}>
          {/* Tab选择 */}
          <div style={{ display: 'flex', marginBottom: 20, background: '#1a1a1a', borderRadius: 8, padding: 4 }}>
            <button 
              onClick={() => setTab('dynamic')}
              style={{ 
                flex: 1, padding: '10px 12px', borderRadius: 6, 
                background: tab === 'dynamic' ? '#22c55e' : 'transparent', 
                color: tab === 'dynamic' ? '#000' : '#888', 
                border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' 
              }}>
              🎲 动态版式
            </button>
            <button 
              onClick={() => setTab('analyzer')}
              style={{ 
                flex: 1, padding: '10px 12px', borderRadius: 6, 
                background: tab === 'analyzer' ? '#3b82f6' : 'transparent', 
                color: tab === 'analyzer' ? '#fff' : '#888', 
                border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' 
              }}>
              🔍 网站分析
            </button>
          </div>

          {/* 收藏夹 Tab */}
          <div style={{ display: 'flex', marginBottom: 20, background: '#1a1a1a', borderRadius: 8, padding: 4 }}>
            <button 
              onClick={() => setTab('dynamic')}
              style={{ 
                flex: 1, padding: '10px 12px', borderRadius: 6, 
                background: tab === 'dynamic' ? '#22c55e' : 'transparent', 
                color: tab === 'dynamic' ? '#000' : '#888', 
                border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' 
              }}>
              🎲 版式
            </button>
            <button 
              onClick={() => setTab('favorites')}
              style={{ 
                flex: 1, padding: '10px 12px', borderRadius: 6, 
                background: tab === 'favorites' ? '#F59E0B' : 'transparent', 
                color: tab === 'favorites' ? '#000' : '#888', 
                border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' 
              }}>
              ⭐ 收藏 ({favorites.length})
            </button>
            <button 
              onClick={() => setTab('analyzer')}
              style={{ 
                flex: 1, padding: '10px 12px', borderRadius: 6, 
                background: tab === 'analyzer' ? '#3b82f6' : 'transparent', 
                color: tab === 'analyzer' ? '#fff' : '#888', 
                border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' 
              }}>
              🔍 分析
            </button>
          </div>

          {tab === 'dynamic' && (
            <div>
              <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>随机生成多样式网页版式</p>
              
              {/* 场景模板选择 */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>🎯 选择场景模板</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    { id: 'default', name: '🎨 通用', emoji: '🎨' },
                    { id: 'ecommerce', name: '🛒 电商', emoji: '🛒' },
                    { id: 'saas', name: '💻 SaaS', emoji: '💻' },
                    { id: 'blog', name: '📝 博客', emoji: '📝' },
                    { id: 'portfolio', name: '💼 作品集', emoji: '💼' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 6,
                        background: selectedTemplate === t.id ? '#22c55e' : '#1a1a1a',
                        color: selectedTemplate === t.id ? '#000' : '#888',
                        border: '1px solid ' + (selectedTemplate === t.id ? '#22c55e' : '#333'),
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {t.emoji} {t.name.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 项目保存路径输入框 */}
              <div style={{ marginTop: 16, marginBottom: 8 }}>
                <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>📁 项目保存路径</p>
                <input
                  type="text"
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                  placeholder="/Users/user/.openclaw/projects"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #333',
                    fontSize: 11
                  }}
                />
              </div>
              
              <button 
                onClick={handleGenerate} 
                disabled={loading}
                style={{ 
                  width: '100%', padding: '14px', borderRadius: 8, 
                  background: '#22c55e', color: '#000', border: 'none', 
                  fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' 
                }}>
                {loading ? '生成中...' : '🚀 生成动态版式'}
              </button>
            </div>
          )}

          {tab === 'analyzer' && (
            <div>
              <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>输入网站URL，提取元素生成变体</p>
              <input 
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://stripe.com"
                style={{ 
                  width: '100%', padding: '12px', borderRadius: 8, 
                  background: '#1a1a1a', color: '#fff', border: '1px solid #333', 
                  fontSize: 12, marginBottom: 12 
                }}
              />
              <button 
                onClick={handleAnalyze} 
                disabled={loading || !url}
                style={{ 
                  width: '100%', padding: '14px', borderRadius: 8, 
                  background: '#3b82f6', color: '#fff', border: 'none', 
                  fontSize: 14, fontWeight: 700, cursor: (loading || !url) ? 'not-allowed' : 'pointer' 
                }}>
                {loading ? '分析中...' : '🔍 深度分析网站'}
              </button>
            </div>
          )}

          {message && (
            <div style={{ marginTop: 16, padding: 12, background: '#1a1a1a', borderRadius: 8, fontSize: 12, color: message.includes('✅') ? '#22c55e' : '#f59e0b' }}>
              {message}
            </div>
          )}

          {results.length > 0 && (
            <>
              {compareList.length > 0 && (
                <div style={{ marginTop: 12, padding: 12, background: '#EC4899', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>已选择 {compareList.length} 个方案</span>
                {compareList.length >= 2 && (
                  <button 
                    onClick={() => {
                      sessionStorage.setItem('compareData', JSON.stringify(compareList))
                      window.open('/preview', '_blank')
                    }}
                    style={{ padding: '8px 16px', background: '#fff', color: '#EC4899', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    ⚖️ 打开对比
                  </button>
                )}
              </div>
              )}
              <div style={{ marginTop: 20, padding: 12, background: '#1a1a1a', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>生成结果</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{results.length} 个案例</div>
              </div>
            </>
          )}
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: 20 }}>
          {tab === 'favorites' ? (
            favorites.length === 0 ? (
              <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
                  <div>还没有收藏的方案</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>点击卡片上的 ❤️ 保存喜欢的设计方案</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {favorites.map((item, i) => (
                  <Card 
                    key={i} 
                    data={item} 
                    isFavorited={true} 
                    onToggleFavorite={() => removeFromFavorites(item.id)} 
                    projectPath={projectPath}
                  />
                ))}
              </div>
            )
          ) : results.length === 0 ? (
            <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
                <div>{tab === 'dynamic' ? '点击生成动态版式' : '输入URL分析网站'}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                  {tab === 'dynamic' ? '随机生成各种网页版式案例' : '自动提取网页元素生成设计变体'}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {results.map((r, i) => (
                <Card 
                  key={i} 
                  data={r} 
                  onFavorite={() => addToFavorites(r)} 
                  onToggleFavorite={() => removeFromFavorites(r.id)} 
                  isFavorited={isFavorited(r.id)}
                  onCompare={() => toggleCompare(r)}
                  isInCompare={isInCompare(r.id)}
                  projectPath={projectPath}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function Card({ data, isFavorited = false, onToggleFavorite, onFavorite, onCompare, isInCompare = false, projectPath = '/Users/user/.openclaw/projects' }: { data: any; isFavorited?: boolean; onToggleFavorite?: () => void; onFavorite?: () => void; onCompare?: () => void; isInCompare?: boolean; projectPath?: string }) {
  const { strategy, components, layout, typography, _meta } = data
  const { accentColor, bgColor, textColor, cardBg, radius, neutralTint } = strategy
  const [expanded, setExpanded] = useState(false)
  
  const sections = layout.sections || []
  const isFromUrl = !!layout.sourceUrl
  const realContent = layout.realContent || {}

  const handleClick = () => {
    setExpanded(!expanded)
  }

  return (
    <div 
      onClick={handleClick}
      style={{ 
        background: bgColor, color: textColor, borderRadius: radius || 12, 
        overflow: 'hidden', border: `1px solid ${accentColor}33`,
        minHeight: expanded ? 'auto' : 220,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Tags */}
      <div style={{ padding: 10, borderBottom: `1px solid ${accentColor}22`, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {isFromUrl ? (
          <span style={{ fontSize: 9, padding: '2px 6px', background: accentColor, color: bgColor, borderRadius: 4 }}>
            🔗 {new URL(layout.sourceUrl).hostname}
          </span>
        ) : (
          <>
            <span style={{ fontSize: 9, padding: '2px 6px', background: accentColor, color: bgColor, borderRadius: 4 }}>
              {strategy.theme}
            </span>
            {typography && (
              <span style={{ fontSize: 9, padding: '2px 6px', background: '#333', borderRadius: 4 }}>
                {typography.heading}
              </span>
            )}
            <span style={{ fontSize: 9, padding: '2px 6px', background: '#444', borderRadius: 4 }}>
              {strategy.cardStyle}
            </span>
            {/* Favorite button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                // 已收藏点击则取消，未收藏点击则添加
                if (isFavorited && onToggleFavorite) {
                  onToggleFavorite() // 取消收藏
                } else if (onFavorite && !isFavorited) {
                  onFavorite() // 添加收藏
                }
              }}
              style={{ 
                fontSize: 9, padding: '2px 6px', 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              {isFavorited ? '❤️' : '🤍'}
            </button>
            {onCompare && (
              <button
                onClick={(e) => { e.stopPropagation(); onCompare && onCompare() }}
                style={{ 
                  fontSize: 9, padding: '2px 6px', 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer',
                  marginLeft: 4
                }}
              >
                {isInCompare ? '⚫' : '⚪'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Real content markers */}
      {isFromUrl && Object.keys(realContent).length > 0 && (
        <div style={{ padding: '6px 10px', display: 'flex', gap: 3, flexWrap: 'wrap', borderBottom: `1px solid ${accentColor}11` }}>
          {realContent.hero && <Tag color="#22c55e">Hero</Tag>}
          {realContent.stats && <Tag color="#22c55e">Stats</Tag>}
          {realContent.features && <Tag color="#22c55e">Features</Tag>}
          {realContent.products && <Tag color="#22c55e">Products</Tag>}
          {realContent.pricing && <Tag color="#22c55e">Pricing</Tag>}
          {realContent.testimonials && <Tag color="#22c55e">Reviews</Tag>}
          {realContent.team && <Tag color="#22c55e">Team</Tag>}
        </div>
      )}

      {/* Content Preview */}
      <div style={{ padding: 12 }}>
        {components.Hero && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{components.Hero.title}</div>
            <div style={{ fontSize: 10, color: '#888', marginBottom: 6 }}>{components.Hero.subtitle}</div>
            <button style={{ 
              padding: '4px 10px', background: accentColor, color: bgColor, 
              border: 'none', borderRadius: 4, fontSize: 10 
            }}>
              {components.Hero.cta}
            </button>
          </div>
        )}

        {/* Stats/Facts */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {components.Stats?.stats?.slice(0, 3).map((s: any, i: number) => (
            <span key={i} style={{ fontSize: 9, padding: 4, background: cardBg, borderRadius: 4 }}>{s.value}</span>
          ))}
          {components.Pricing?.plans?.slice(0, 2).map((p: any, i: number) => (
            <span key={i} style={{ fontSize: 9, padding: 4, background: cardBg, borderRadius: 4 }}>{p.price}</span>
          ))}
          {components.Testimonials?.items?.slice(0, 2).map((t: any, i: number) => (
            <span key={i} style={{ fontSize: 9, padding: 4, background: cardBg, borderRadius: 4 }}>💬</span>
          ))}
        </div>

        {/* Section count */}
        <div style={{ marginTop: 10, fontSize: 9, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
          <span>{sections.length} 个区块</span>
          <span style={{ color: accentColor }}>{expanded ? '▼ 点击收起' : '▶ 点击展开'}</span>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div style={{ paddingTop: 12, borderTop: `1px solid ${accentColor}22`, marginTop: 12 }}>
            {/* 新增: 字体和美学信息 */}
            {typography && (
              <div style={{ marginBottom: 12, padding: 8, background: cardBg, borderRadius: 6, fontSize: 10, color: '#888' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span>🔤 {typography.heading}</span>
                  <span>{typography.body}</span>
                  <span>🎨 {_meta?.aesthetic}</span>
                </div>
                {data.motion && (
                  <div style={{ marginTop: 6, display: 'flex', gap: 12 }}>
                    <span>⏱ {data.motion.duration}ms ({data.motion.type})</span>
                    <span>↗️ {data.motion.easing}</span>
                  </div>
                )}
                {data.strategy.spacing && (
                  <div style={{ marginTop: 6 }}>
                    <span>📏 spacing: {data.strategy.spacing.unit}px unit, {data.strategy.spacing.section}px section</span>
                  </div>
                )}
              </div>
            )}

            {/* 导出按钮 */}
            <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
              <button
                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(exportAsCSS(data)); alert('CSS copied!'); }}
                style={{ flex: 1, padding: '8px 12px', background: accentColor, color: bgColor, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
              >
                📋 Copy CSS
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(exportAsReact(data)); alert('React copied!'); }}
                style={{ flex: 1, padding: '8px 12px', background: cardBg, color: textColor, border: `1px solid ${accentColor}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
              >
                ⚛️ Copy React
              </button>
            </div>

            {/* 创建Next.js项目按钮 */}
            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const finalPath = projectPath.trim() || '/Users/user/.openclaw/projects';
                  if (projectPath.trim() === '' && !confirm('未输入路径，将使用默认路径：/Users/user/.openclaw/projects\n\n是否继续？')) {
                    return;
                  }
                  try {
                    const res = await fetch('http://localhost:3002/api/create-project', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ schema: data, customPath: finalPath })
                    });
                    const text = await res.text();
                    if (!res.ok) {
                      alert('Error: ' + text);
                      return;
                    }
                    const result = JSON.parse(text);
                    if (result.success) {
                      alert(`✅ 项目已创建!\n路径: ${result.projectPath}\n\n在终端运行:\ncd ${result.projectPath}\nnpm install\nnpm run dev`);
                    } else {
                      alert('Error: ' + result.error);
                    }
                  } catch (err) {
                    alert('Error: ' + err);
                  }
                }}
                style={{ width: '100%', padding: '10px', background: '#22c55e', color: '#000', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                🚀 创建 Next.js 项目
              </button>
            </div>

            {/* 实时预览按钮 */}
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                // 保存到 sessionStorage
                sessionStorage.setItem('previewData', JSON.stringify(data));
                window.open('/preview', '_blank');
              }}
              style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}
            >
              👁️ 实时预览
            </button>

            {/* Full Hero */}
            {components.Hero && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>🎯 Hero</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{components.Hero.title}</div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{components.Hero.subtitle}</div>
                <button style={{ padding: '6px 12px', background: accentColor, color: bgColor, border: 'none', borderRadius: 4, fontSize: 11 }}>
                  {components.Hero.cta}
                </button>
              </div>
            )}

            {/* Full Features */}
            {components.Features && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>⚡ Features</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  {components.Features.items?.map((item: any, i: number) => (
                    <div key={i} style={{ fontSize: 11, padding: 6, background: cardBg, borderRadius: 4 }}>
                      {item.icon} {item.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Stats */}
            {components.Stats && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>📊 Stats</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {components.Stats.stats?.map((s: any, i: number) => (
                    <div key={i} style={{ fontSize: 14, fontWeight: 600, padding: 8, background: cardBg, borderRadius: 4 }}>
                      {s.value} <span style={{ fontSize: 10, color: '#888' }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Pricing */}
            {components.Pricing && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>💰 Pricing</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {components.Pricing.plans?.map((plan: any, i: number) => (
                    <div key={i} style={{ padding: 10, background: cardBg, borderRadius: 6, border: plan.popular ? `2px solid ${accentColor}` : 'none' }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{plan.name}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: accentColor }}>{plan.price}</div>
                      <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
                        {plan.features?.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Products */}
            {components.Products && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>🛍️ Products</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {components.Products.items?.map((p: any, i: number) => (
                    <div key={i} style={{ padding: 8, background: cardBg, borderRadius: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: accentColor }}>{p.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Testimonials */}
            {components.Testimonials && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>💬 Reviews</div>
                {components.Testimonials.items?.map((t: any, i: number) => (
                  <div key={i} style={{ padding: 8, background: cardBg, borderRadius: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 12 }}>{t.avatar} {t.name}</span>
                    <span style={{ fontSize: 10, color: '#888' }}> · {t.role}</span>
                    <div style={{ fontSize: 11, marginTop: 4 }}>"{t.text}"</div>
                  </div>
                ))}
              </div>
            )}

            {/* Full CTA */}
            {components.CTA && (
              <div style={{ padding: 12, background: accentColor, borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: bgColor }}>{components.CTA.title}</div>
                <button style={{ marginTop: 8, padding: '8px 16px', background: bgColor, color: textColor, border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                  {components.CTA.buttonText}
                </button>
              </div>
            )}

            {/* Full Footer */}
            {components.Footer && (
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${accentColor}22`, fontSize: 10, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                <span>🔗 {components.Footer.links?.join(' · ')}</span>
                <span>📱 {components.Footer.social?.join(' · ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// 导出函数
function exportAsCSS(data: any) {
  const { strategy, typography } = data
  return `/* Generated by UI Alpha System */
:root {
  --accent: ${strategy.accentColor};
  --bg: ${strategy.bgColor};
  --card-bg: ${strategy.cardBg};
  --text: ${strategy.textColor};
  --radius: ${strategy.radius}px;
  --shadow: ${strategy.shadow || 'none'};
  --font-heading: '${typography?.heading || 'Inter'}', sans-serif;
  --font-body: '${typography?.body || 'Inter'}', sans-serif;
  --spacing-unit: ${strategy.padding}px;
  --grid-type: ${data.layout?.grid || 'auto-fit'};
}`
}

function exportAsReact(data: any) {
  const { strategy, typography, motion, layout } = data
  return `// Generated by UI Alpha System
export const theme = {
  colors: {
    accent: '${strategy.accentColor}',
    bg: '${strategy.bgColor}',
    cardBg: '${strategy.cardBg}',
    text: '${strategy.textColor}',
  },
  typography: {
    heading: '${typography?.heading || 'Inter'}',
    body: '${typography?.body || 'Inter'}',
  },
  spacing: {
    unit: ${strategy.padding},
    section: ${strategy.spacing?.section || 24},
  },
  border: {
    radius: ${strategy.radius},
  },
  motion: {
    duration: ${motion?.duration || 300},
    easing: '${motion?.easing || 'ease-out-quart'}',
  },
  layout: '${layout?.grid || 'auto-fit'}',
}`
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 8, padding: '1px 4px', background: `${color}33`, color, borderRadius: 2 }}>
      {children}
    </span>
  )
}