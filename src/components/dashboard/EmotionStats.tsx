'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface EmotionStat {
  name: string
  count: number
  avgScore: number
}

interface Props {
  userId: string
  plan: string
}

const EMOTION_COLORS: Record<string, string> = {
  행복: '#22c55e', 불안: '#ef4444', 슬픔: '#60a5fa',
  설렘: '#fbbf24', 평온: '#22d3ee', 혼란: '#f472b6',
  사랑: '#fb7185', 두려움: '#a78bfa', 분노: '#f97316',
}

export default function EmotionStats({ userId, plan }: Props) {
  const [stats, setStats] = useState<EmotionStat[]>([])
  const [lastMonth, setLastMonth] = useState<EmotionStat[]>([])
  const [totalDreams, setTotalDreams] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (plan === 'free') { setLoading(false); return }
    fetch(`/api/dream/stats?userId=${userId}&period=1m`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          const thisMonth = Array.isArray(data.thisMonth) ? data.thisMonth : []
          const lastMonthData = Array.isArray(data.lastMonth) ? data.lastMonth : []
          setStats(thisMonth)
          setLastMonth(lastMonthData)
          setTotalDreams(data.totalDreams ?? 0)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId, plan])

  const maxCount = Array.isArray(stats) && stats.length > 0
    ? Math.max(...stats.map(s => s.count))
    : 1

  if (plan === 'free') {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-black/40 z-10 flex flex-col items-center justify-center rounded-2xl">
          <span className="text-2xl mb-2">🔒</span>
          <p className="text-white font-semibold mb-1">Dreamer 플랜 전용</p>
          <p className="text-gray-400 text-sm mb-4">감정 패턴 분석을 이용해보세요</p>
          <Link href="/pricing" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-full text-sm font-semibold transition">
            업그레이드 →
          </Link>
        </div>
        {/* 흐릿한 배경 미리보기 */}
        <h2 className="text-sm text-gray-600 uppercase tracking-widest mb-4">이번 달 감정 패턴</h2>
        <div className="space-y-3">
          {['행복', '불안', '설렘'].map((e) => (
            <div key={e} className="flex items-center gap-3">
              <span className="text-gray-600 text-sm w-12">{e}</span>
              <div className="flex-1 bg-white/[0.03] rounded-full h-2">
                <div className="h-2 rounded-full bg-purple-800/50" style={{ width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/[0.05] rounded w-32" />
          {[1,2,3].map(i => <div key={i} className="h-2 bg-white/[0.05] rounded" />)}
        </div>
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
        <h2 className="text-sm text-gray-600 uppercase tracking-widest mb-4">이번 달 감정 패턴</h2>
        <p className="text-gray-600 text-sm">이번 달 기록된 꿈이 없어요</p>
      </div>
    )
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm text-gray-500 uppercase tracking-widest">이번 달 감정 패턴</h2>
        <span className="text-xs text-gray-600">꿈 {totalDreams}개 분석</span>
      </div>

      <div className="space-y-4">
        {stats.map((stat, i) => {
          const color = EMOTION_COLORS[stat.name] ?? '#818cf8'
          const lastMonthStat = lastMonth.find(l => l.name === stat.name)
          const change = lastMonthStat
            ? stat.count - lastMonthStat.count
            : null

          return (
            <div key={stat.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {i === 0 && <span className="text-yellow-400 text-xs">✦</span>}
                  <span className="text-sm text-gray-300">{stat.name}</span>
                  {change !== null && (
                    <span className={`text-xs ${change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-600'}`}>
                      {change > 0 ? `+${change}` : change < 0 ? `${change}` : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">{stat.avgScore}%</span>
                  <span className="text-xs text-gray-500">{stat.count}회</span>
                </div>
              </div>
              <div className="flex-1 bg-white/[0.04] rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${(stat.count / maxCount) * 100}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}60`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/[0.05]">
        <p className="text-xs text-gray-600">
          {stats[0] && `이번 달 가장 많이 느낀 감정은 `}
          {stats[0] && <span className="text-purple-400">{stats[0].name}</span>}
          {stats[0] && `이에요`}
        </p>
      </div>
    </div>
  )
}