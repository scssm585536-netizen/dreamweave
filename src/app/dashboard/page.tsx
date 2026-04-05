'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import DreamCard from '@/components/dream/DreamCard'
import EmotionStats from '@/components/dashboard/EmotionStats'
import SymbolSearch from '@/components/dashboard/SymbolSearch'
import { Dream } from '@/types'

type Tab = 'all' | 'mine'

export default function DashboardPage() {
  const router = useRouter()
  const [allDreams, setAllDreams] = useState<Dream[]>([])
  const [myDreams, setMyDreams] = useState<Dream[]>([])
  const [filtered, setFiltered] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [tab, setTab] = useState<Tab>('all')
  const [totalStats, setTotalStats] = useState({ dreams: 0, connections: 0, emotions: 0 })
const [userPlan, setUserPlan] = useState<string>('free')
const [dreamUsed, setDreamUsed] = useState<number>(0)
const [plan, setPlan] = useState('free')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth'); return }
      setUserId(user.id)

      // 전체 공개/익명 꿈
      const { data: all } = await supabase
        .from('dreams')
        .select('*')
        .neq('visibility', 'private')
        .order('created_at', { ascending: false })

      // 내 꿈 (비공개 포함)
      const { data: mine } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // 전체 연결 수
      const { count: connCount } = await supabase
        .from('dream_connections')
        .select('*', { count: 'exact', head: true })

      const allList = all ?? []
      const mineList = mine ?? []

      setAllDreams(allList)
      setMyDreams(mineList)
      setFiltered(allList)
// 플랜 정보
const { data: profile } = await supabase
  .from('profiles')
  .select('plan, dream_count_this_month')
  .eq('id', user.id)
  .single()

setPlan(profile?.plan ?? 'free')

      setUserPlan(profile?.plan ?? 'free')
      setDreamUsed(profile?.dream_count_this_month ?? 0)

      setTotalStats({
        dreams: allList.length,
        connections: connCount ?? 0,
        emotions: allList.reduce((acc, d) => acc + (d.emotions?.length ?? 0), 0),
      })
      setLoading(false)
    })
  }, [router])

  // 탭 변경 시 필터 초기화
  useEffect(() => {
    setQuery('')
    setFiltered(tab === 'all' ? allDreams : myDreams)
  }, [tab, allDreams, myDreams])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() || !userId) {
      setFiltered(tab === 'all' ? allDreams : myDreams)
      return
    }
    setSearching(true)
    const base = tab === 'all' ? allDreams : myDreams
    const q = query.toLowerCase()
    const result = base.filter((d) =>
      d.content?.toLowerCase().includes(q) ||
      d.keywords?.some((k) => k.toLowerCase().includes(q)) ||
      d.emotions?.some((em) => em.toLowerCase().includes(q))
    )
    setFiltered(result)
    setSearching(false)
  }

  function handleReset() {
    setQuery('')
    setFiltered(tab === 'all' ? allDreams : myDreams)
  }

  async function handleSignOut() {
    await signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070712] flex items-center justify-center">
        <div className="text-4xl animate-pulse">🧵</div>
      </div>
    )
  }

  const currentList = filtered

  return (
    <main className="min-h-screen bg-[#070712] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">

        {/* 헤더 */}
        <header className="flex items-start justify-between mb-10 md:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl md:text-2xl">🧵</span>
              <span className="text-purple-400 text-xs tracking-[0.3em] uppercase font-medium">Dreamsync</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">꿈 아카이브</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3 mt-1">
            <Link href="/weave" className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-full border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-xs md:text-sm text-gray-300 hover:text-white transition-all duration-200">
              🌐 <span className="hidden md:inline">직물 탐험</span>
            </Link>
            {(plan === 'dreamer' || plan === 'weaver') && (
              <Link
                href="/stats"
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-full border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-xs md:text-sm text-gray-300 hover:text-white transition-all duration-200"
              >
                📊 <span className="hidden md:inline">통계</span>
              </Link>
            )}
            <Link href="/dream/new" className="flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-xs md:text-sm font-semibold shadow-lg shadow-purple-900/50 transition-all duration-200">
              + <span className="hidden md:inline">꿈 기록</span>
            </Link>
            <Link
              href="/pricing"
              className="text-xs px-3 py-1.5 rounded-full border border-purple-500/40 text-purple-400 hover:bg-purple-500/10 transition"
            >
              ✦ 플랜 업그레이드
            </Link>
            <button onClick={handleSignOut} className="text-xs text-gray-600 hover:text-gray-400 transition hidden md:block">
              로그아웃
            </button>
          </div>
        </header>

        {/* 전체 통계 */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
          {[
            { label: '전체 공개 꿈', value: totalStats.dreams, icon: '🌙' },
            { label: '직물 연결', value: totalStats.connections, icon: '🔗' },
            { label: '감정 태그', value: totalStats.emotions, icon: '💫' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-5 hover:bg-white/[0.05] transition-all duration-200">
              <div className="text-xl md:text-2xl mb-2 md:mb-3">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-500 text-xs md:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {userId && <EmotionStats userId={userId} plan={plan} />}
        {userId && <SymbolSearch userId={userId} plan={plan} />}

        {/* 탭 */}
        <div className="flex bg-white/[0.03] rounded-full p-1 mb-6 border border-white/[0.06] w-fit">
          {([
            { value: 'all', label: '🌐 전체 꿈 피드' },
            { value: 'mine', label: '🌙 내 꿈' },
          ] as const).map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                tab === t.value ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 검색바 */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="핵심 상징, 감정, 꿈 내용으로 검색..."
              className="w-full bg-white/[0.03] border border-white/[0.07] hover:border-purple-500/30 focus:border-purple-500/60 rounded-full pl-10 pr-4 py-3 text-white text-sm placeholder-gray-700 focus:outline-none transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-sm font-semibold transition disabled:opacity-40"
          >
            {searching ? '검색 중...' : '검색'}
          </button>
          {query && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-3 rounded-full border border-white/10 hover:border-white/20 text-sm text-gray-500 hover:text-white transition"
            >
              초기화
            </button>
          )}
        </form>

        {/* 꿈 목록 */}
        {currentList.length === 0 && query ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-lg font-semibold mb-2">검색 결과가 없어요</h2>
            <p className="text-gray-500 text-sm mb-6">
              <span className="text-purple-400">"{query}"</span> 와 관련된 꿈을 찾지 못했어요
            </p>
            <button onClick={handleReset} className="text-sm text-gray-500 hover:text-white transition">
              전체 목록 보기
            </button>
          </div>
        ) : currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 rounded-full bg-purple-900/30 flex items-center justify-center text-4xl mb-6">🌙</div>
            <h2 className="text-xl font-semibold mb-2">
              {tab === 'all' ? '아직 공개된 꿈이 없어요' : '아직 기록된 꿈이 없어요'}
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              {tab === 'all' ? '첫 번째로 꿈을 공유해보세요!' : '오늘 밤 꾼 꿈을 기록해봐요'}
            </p>
            <Link href="/dream/new" className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-500 font-semibold transition shadow-lg shadow-purple-900/40">
              꿈 기록하기
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm text-gray-500 uppercase tracking-widest">
                {query ? `"${query}" 검색 결과` : tab === 'all' ? '전체 꿈 피드' : '내 꿈'}
              </h2>
              <span className="text-xs text-gray-600">{currentList.length}개</span>
            </div>
            <div className="grid gap-3">
              {currentList.map((dream) => (
                <DreamCard key={dream.id} dream={dream} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}