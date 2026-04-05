'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Dream } from '@/types'
import { formatDreamDate } from '@/lib/dream'

interface Props {
  userId: string
  plan: string
}

export default function SymbolSearch({ userId, plan }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Dream[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/dream/search?q=${encodeURIComponent(query)}&userId=${userId}`)
      const data = await res.json()
      if (data.error === 'PLAN_REQUIRED') {
        setResults([])
      } else {
        setResults(data.dreams ?? [])
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  if (plan === 'free') {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-black/40 z-10 flex flex-col items-center justify-center rounded-2xl">
          <span className="text-2xl mb-2">🔒</span>
          <p className="text-white font-semibold mb-1">Dreamer 플랜 전용</p>
          <p className="text-gray-400 text-sm mb-4">핵심 상징으로 꿈을 검색해보세요</p>
          <Link href="/pricing" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-full text-sm font-semibold transition">
            업그레이드 →
          </Link>
        </div>
        <h2 className="text-sm text-gray-600 uppercase tracking-widest mb-4">핵심 상징 검색</h2>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-gray-700 text-sm">
            예) 바다, 비행, 추격...
          </div>
          <div className="px-4 py-3 bg-purple-800/30 rounded-xl text-gray-600 text-sm">검색</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <h2 className="text-sm text-gray-500 uppercase tracking-widest mb-4">핵심 상징 검색</h2>

      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="예) 바다, 비행, 추격..."
          className="flex-1 bg-white/[0.03] border border-white/[0.07] focus:border-purple-500/60 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-700 focus:outline-none transition"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition disabled:opacity-40"
        >
          {loading ? '...' : '검색'}
        </button>
      </div>

      {/* 추천 상징 태그 */}
      {!searched && (
        <div className="flex flex-wrap gap-2">
          {['바다', '비행', '추격', '집', '죽음', '사랑', '학교', '돈'].map((tag) => (
            <button
              key={tag}
              onClick={() => { setQuery(tag); }}
              className="text-xs px-3 py-1.5 rounded-full border border-purple-500/20 text-purple-400 hover:bg-purple-500/10 transition"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* 검색 결과 */}
      {searched && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <p className="text-gray-600 text-sm py-4 text-center">
              "{query}" 관련 꿈이 없어요
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-600 mb-3">{results.length}개의 꿈을 찾았어요</p>
              {results.map((dream) => (
                <Link key={dream.id} href={`/dream/${dream.id}`}>
                  <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-purple-500/30 rounded-xl p-4 transition cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-600">{formatDreamDate(dream.created_at)}</p>
                      {dream.main_tag && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          ✦ {dream.main_tag}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{dream.content}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(dream.emotions as string[])?.slice(0, 3).map((e) => (
                        <span key={e} className="text-xs bg-purple-900/30 text-purple-300/80 px-2 py-0.5 rounded-full border border-purple-800/30">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
