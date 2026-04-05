'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Dream } from '@/types'
import { formatDreamDate } from '@/lib/dream'
import LikeButton from '@/components/dream/LikeButton'
import CommentSection from '@/components/dream/CommentSection'
import { exportDreamPdf } from '@/lib/exportPdf'

export default function DreamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [dream, setDream] = useState<Dream | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [copied, setCopied] = useState(false)
  const [plan, setPlan] = useState('free')
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()
        setPlan(profile?.plan ?? 'free')
      }
    })

    fetch(`/api/dream/${params.id}`)
      .then((r) => r.json())
      .then(({ dream }) => {
        setDream(dream)
        setLoading(false)
      })
  }, [params.id])

  // 소유자 확인
  useEffect(() => {
    if (userId && dream) {
      setIsOwner(dream.user_id === userId)
    }
  }, [userId, dream])

  async function handleDelete() {
    if (!isOwner) {
      alert('본인이 작성한 꿈만 삭제할 수 있어요')
      return
    }
    if (!confirm('정말 삭제할까요? 되돌릴 수 없어요.')) return

    const res = await fetch(`/api/dream/${params.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      const { error } = await res.json()
      alert(error ?? '삭제에 실패했어요')
    }
  }

  async function handleVisibility(visibility: string) {
    if (!isOwner) return
    setUpdating(true)
    const res = await fetch(`/api/dream/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility, userId }),
    })
    const { dream: updated } = await res.json()
    setDream(updated)
    setUpdating(false)
  }

  async function handleExportPdf() {
    if (!dream) return
    if (plan === 'free') {
      alert('Dreamer 플랜 이상에서 이용할 수 있어요')
      return
    }
    setPdfLoading(true)
    await exportDreamPdf({
      content: dream.content,
      interpretation: dream.interpretation,
      emotions: dream.emotions as string[],
      keywords: dream.keywords as string[],
      emotion_scores: dream.emotion_scores,
      main_tag: dream.main_tag,
      created_at: dream.created_at,
      visibility: dream.visibility,
    })
    setPdfLoading(false)
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleTwitterShare() {
    const text = `${dream?.main_tag ? `#${dream.main_tag} ` : ''}내 꿈을 AI가 해석해줬어요 🧵`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`,
      '_blank'
    )
  }

  async function handleInstagramShare() {
    const shareData = {
      title: 'Dreamsync — AI 꿈 동기화',
      text: `${dream?.main_tag ? `✦ ${dream.main_tag}\n` : ''}${dream?.content?.slice(0, 100)}...\n\n내 꿈을 AI가 해석해줬어요 🧵`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // 취소한 경우 무시
      }
      return
    }

    await navigator.clipboard.writeText(window.location.href)
    alert('링크가 복사됐어요!\n인스타그램 앱에서 스토리나 바이오에 붙여넣기 해줘요 📸')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070712] flex items-center justify-center">
        <div className="text-4xl animate-pulse">🧵</div>
      </div>
    )
  }

  if (!dream) {
    return (
      <main className="min-h-screen bg-[#070712] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">꿈을 찾을 수 없어요.</p>
          <Link href="/dashboard" className="text-purple-400 hover:underline text-sm">
            ← 대시보드로 돌아가기
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#070712] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-900/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-300 text-sm mb-12 transition">
          ← 내 꿈 목록
        </Link>

        {/* 날짜 + 액션 */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-600 text-sm">{formatDreamDate(dream.created_at)}</p>
          <div className="flex items-center gap-2">
            {/* 공유 버튼들 */}
            {dream.visibility !== 'private' && (
              <>
                <button
                  onClick={handleTwitterShare}
                  className="text-xs text-gray-500 hover:text-blue-400 border border-white/[0.06] hover:border-blue-400/40 px-3 py-1.5 rounded-full transition flex items-center gap-1"
                >
                  𝕏 공유
                </button>
                <button
                  onClick={handleInstagramShare}
                  className="text-xs text-gray-500 hover:text-pink-400 border border-white/[0.06] hover:border-pink-400/40 px-3 py-1.5 rounded-full transition flex items-center gap-1"
                >
                  📸 인스타
                </button>
                <button
                  onClick={handleCopyLink}
                  className="text-xs text-gray-500 hover:text-purple-400 border border-white/[0.06] hover:border-purple-400/40 px-3 py-1.5 rounded-full transition"
                >
                  {copied ? '✓ 복사됨' : '🔗 링크'}
                </button>
              </>
            )}
            <LikeButton dreamId={dream.id} userId={userId} />
            {isOwner && (
              <button
                onClick={handleExportPdf}
                disabled={pdfLoading}
                className={`text-xs border px-3 py-1.5 rounded-full transition ${
                  plan === 'free'
                    ? 'border-white/5 text-gray-700 cursor-not-allowed'
                    : 'text-gray-500 hover:text-purple-400 border-white/[0.06] hover:border-purple-400/40'
                }`}
              >
                {pdfLoading ? '...' : plan === 'free' ? '🔒 PDF' : '📄 PDF'}
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleDelete}
                className="text-xs text-red-500/60 hover:text-red-400 border border-red-500/20 hover:border-red-400/40 px-3 py-1.5 rounded-full transition"
              >
                🗑 삭제
              </button>
            )}
          </div>
        </div>

        {/* 공개 범위 변경 */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 mb-8">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">공개 범위</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'private', icon: '🔒', label: '비공개' },
              { value: 'anonymous', icon: '👤', label: '익명 공개' },
              { value: 'public', icon: '🌐', label: '공개' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleVisibility(opt.value)}
                disabled={updating || dream.visibility === opt.value}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  dream.visibility === opt.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:border-purple-500/40 hover:text-white'
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
          {dream.visibility === 'private' && (
            <p className="text-xs text-gray-600 mt-3">비공개 꿈은 직물에 연결되지 않아요.</p>
          )}
        </div>

        {/* 꿈 내용 */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xs text-gray-600 uppercase tracking-widest mb-3">꿈 내용</h2>
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{dream.content}</p>
          </div>

          {dream.interpretation && (
            <div className="bg-white/[0.03] border border-purple-800/30 rounded-2xl p-6">
              <h2 className="text-xs text-purple-400 uppercase tracking-widest mb-3">🔮 AI 해석 (Jung 심리학)</h2>
              <p className="text-gray-300 leading-relaxed italic">{dream.interpretation}</p>
            </div>
          )}

          {dream.emotions && dream.emotions.length > 0 && (
            <div>
              <h2 className="text-xs text-gray-600 uppercase tracking-widest mb-3">감정</h2>
              <div className="flex flex-wrap gap-2">
                {(dream.emotions as any[])
                  .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                  .map((e: any) => {
                    const name = typeof e === 'string' ? e : e.name
                    const score = typeof e === 'string' ? null : e.score
                    const isTop = score === Math.max(...(dream.emotions as any[]).map((x: any) => x.score ?? 0))
                    return (
                      <span key={name} className={`px-3 py-1.5 rounded-full text-sm border flex items-center gap-1.5 ${
                        isTop
                          ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                          : 'bg-purple-900/30 text-purple-300 border-purple-800/30'
                      }`}>
                        {isTop && <span className="text-yellow-400 text-xs">✦</span>}
                        {name}
                        {score != null && (
                          <span className="text-xs opacity-60">{score}%</span>
                        )}
                      </span>
                    )
                  })}
              </div>
            </div>
          )}

          {dream.keywords && dream.keywords.length > 0 && (
            <div>
              <h2 className="text-xs text-gray-600 uppercase tracking-widest mb-3">핵심 상징</h2>
              <div className="flex flex-wrap gap-2">
                {(dream.keywords as any[])
                  .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                  .map((k: any) => {
                    const name = typeof k === 'string' ? k : k.name
                    const score = typeof k === 'string' ? null : k.score
                    return (
                      <span key={name} className="bg-indigo-900/30 text-indigo-300 px-3 py-1.5 rounded-full text-sm border border-indigo-800/30 flex items-center gap-1.5">
                        #{name}
                        {score != null && (
                          <span className="text-xs opacity-60">{score}%</span>
                        )}
                      </span>
                    )
                  })}
              </div>
            </div>
          )}
        </div>

        <CommentSection dreamId={dream.id} userId={userId} />
      </div>
    </main>
  )
}