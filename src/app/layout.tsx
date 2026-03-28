import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'DreamWeave – AI 꿈 직조기',
  description: '내 꿈이 전 세계 사람들의 꿈과 실시간으로 연결되는 살아있는 꿈 직물',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  )
}
