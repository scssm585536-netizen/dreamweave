'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const EMOTION_COLORS: Record<string, string> = {
  행복: '#22c55e', 불안: '#ef4444', 슬픔: '#60a5fa',
  설렘: '#fbbf24', 평온: '#22d3ee', 혼란: '#f472b6',
  사랑: '#fb7185', 두려움: '#a78bfa', 분노: '#f97316',
  default: '#818cf8',
}

type Period = '1m' | '3m' | '1y' | 'all'

interface StatsData {
  totalDreams: number
  topEmotions: [string, number][]
  topTags: [string, number][]
  monthlyData: { month: string; count: number }[]
  thisMonth: { count: number }
}

export default function StatsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('3m')
  const [plan, setPlan] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth'); return }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()

      setPlan(profile?.plan ?? 'free')

      if (profile?.plan === 'free') {
        setLoading(false)
        return
      }

      fetchStats(user.id, '3m')
    })
  }, [])

  async function fetchStats(uid: string, p: Period) {
    setLoading(true)
    const res = await fetch(`/api/dream/stats?userId=${uid}&period=${p}`)
    const data = await res.json()
    if (!data.error) setStats(data)
    setLoading(false)
  }

  function handlePeriodChange(p: Period) {
    setPeriod(p)
    if (userId) fetchStats(userId, p)
  }

  if (plan === 'free') return (
    <main className="min-h-screen bg-[#070712] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold mb-3">Dreamer 플랜 전용</h1>
        <p className="text-gray-400 mb-8">꿈 통계는 Dreamer 플랜에서 이용할 수 있어요</p>
        <Link href="/pricing" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-full font-semibold transition">
          업그레이드 →
        </Link>
      </div>
    </main>
  )

  const emotionList = Array.isArray(stats?.topEmotions) ? stats.topEmotions : []
  const monthList = Array.isArray(stats?.monthlyData) ? stats.monthlyData : []
  const tagList = Array.isArray(stats?.topTags) ? stats.topTags : []

  const maxEmotionCount = emotionList.length > 0 ? Math.max(...emotionList.map(([, c]) => c)) : 1
  const maxMonthCount = monthList.length > 0 ? Math.max(...monthList.map(d => d.count)) : 1

  return (
    <main className="min-h-screen bg-[#070712] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-900/15 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-300 text-sm mb-10 transition">
          ← 대시보드
        </Link>

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs tracking-widest uppercase mb-3">
              ✦ Dreamer 전용
            </div>
            <h1 className="text-3xl font-black">꿈 통계</h1>
          </div>

          {/* 기간 선택 */}
          <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-full p-1 gap-1">
            {([
              { value: '1m', label: '1개월' },
              { value: '3m', label: '3개월' },
              { value: '1y', label: '1년' },
              { value: 'all', label: '전체' },
            ] as { value: Period; label: string }[]).map((p) => (
              <button
                key={p.value}
                onClick={() => handlePeriodChange(p.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  period === p.value
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-4xl animate-pulse">📊</div>
          </div>
        ) : !stats || stats.totalDreams === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">해당 기간에 기록된 꿈이 없어요</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 요약 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
                <p className="text-3xl font-black text-purple-300">{stats.totalDreams}</p>
                <p className="text-xs text-gray-600 mt-1">총 꿈 기록</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
                <p className="text-3xl font-black text-purple-300">{emotionList[0]?.[0] ?? '-'}</p>
                <p className="text-xs text-gray-600 mt-1">가장 많은 감정</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center col-span-2 md:col-span-1">
                <p className="text-3xl font-black text-purple-300">{tagList[0]?.[0] ?? '-'}</p>
                <p className="text-xs text-gray-600 mt-1">주요 테마</p>
              </div>
            </div>

            {/* 월별 꿈 수 */}
            {monthList.length > 1 && (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                <h2 className="text-xs text-gray-600 uppercase tracking-widest mb-6">월별 꿈 기록</h2>
                <div className="flex items-end gap-2 h-32">
                  {monthList.map(({ month, count }) => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-500">{count}</span>
                      <div
                        className="w-full rounded-t-md bg-purple-600/60 transition-all duration-500"
                        style={{ height: `${(count / maxMonthCount) * 100}%`, minHeight: 4 }}
                      />
                      <span className="text-xs text-gray-700 truncate w-full text-center">{month}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 감정 분포 */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-xs text-gray-600 uppercase tracking-widest mb-6">감정 분포 Top 10</h2>
              <div className="space-y-3">
                {emotionList.map(([emotion, count], i) => {
                  const color = EMOTION_COLORS[emotion] ?? EMOTION_COLORS.default
                  return (
                    <div key={emotion} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                      <span className="text-sm text-gray-300 w-16">{emotion}</span>
                      <div className="flex-1 bg-white/[0.04] rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(count / maxEmotionCount) * 100}%`,
                            backgroundColor: color,
                            boxShadow: `0 0 6px ${color}60`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-8 text-right">{count}회</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 주요 테마 */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-xs text-gray-600 uppercase tracking-widest mb-4">주요 테마 Top 10</h2>
              <div className="flex flex-wrap gap-2">
                {tagList.map(([tag, count], i) => (
                  <div key={tag} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm ${
                    i === 0
                      ? 'bg-purple-600/20 border-purple-500/40 text-purple-200'
                      : 'bg-white/[0.02] border-white/[0.06] text-gray-400'
                  }`}>
                    {i === 0 && <span className="text-yellow-400 text-xs">✦</span>}
                    {tag}
                    <span className="text-xs opacity-50">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
