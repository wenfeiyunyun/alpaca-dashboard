import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UI Alpha System',
  description: 'AI-powered UI generation with A/B testing and reinforcement learning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}