'use client'
import { useEffect, useState } from 'react'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { email: string; nickname: string | null }
}

interface Props {
  dreamId: string
  userId: string | null
}

export default function CommentSection({ dreamId, userId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/dream/${dreamId}/comment`)
      .then(r => r.json())
      .then(data => setComments(data.comments ?? []))
  }, [dreamId])

  async function handleSubmit() {
    if (!userId) { alert('로그인이 필요해요'); return }
    if (!input.trim()) return
    setLoading(true)
    const res = await fetch(`/api/dream/${dreamId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, content: input }),
    })
    const data = await res.json()
    if (data.comment) {
      setComments(prev => [...prev, data.comment])
      setInput('')
    }
    setLoading(false)
  }

  async function handleDelete(commentId: string) {
    if (!userId) return
    await fetch(`/api/dream/${dreamId}/comment`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId, userId }),
    })
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  return (
    <div className="mt-8">
      <h2 className="text-xs text-gray-600 uppercase tracking-widest mb-4">
        댓글 {comments.length > 0 && `(${comments.length})`}
      </h2>

      {/* 댓글 목록 */}
      <div className="space-y-3 mb-6">
        {comments.length === 0 ? (
          <p className="text-gray-700 text-sm">첫 번째 댓글을 남겨봐요</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-purple-400">
                  {c.profiles?.nickname ?? c.profiles?.email?.split('@')[0] ?? '익명'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-700">
                    {new Date(c.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  {c.user_id === userId && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-red-500/50 hover:text-red-400 transition"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-300 text-sm">{c.content}</p>
            </div>
          ))
        )}
      </div>

      {/* 댓글 입력 */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
          placeholder={userId ? '댓글을 입력해요...' : '로그인 후 댓글을 남길 수 있어요'}
          disabled={!userId}
          className="flex-1 bg-white/[0.03] border border-white/[0.07] focus:border-purple-500/60 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-700 focus:outline-none transition disabled:opacity-40"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !userId || !input.trim()}
          className="px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition disabled:opacity-40"
        >
          {loading ? '...' : '등록'}
        </button>
      </div>
    </div>
  )
}
