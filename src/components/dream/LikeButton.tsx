'use client'
import { useEffect, useState } from 'react'

interface Props {
  dreamId: string
  userId: string | null
}

export default function LikeButton({ dreamId, userId }: Props) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/dream/${dreamId}/like?userId=${userId ?? ''}`)
      .then(r => r.json())
      .then(data => {
        setLiked(data.liked)
        setCount(data.count)
      })
  }, [dreamId, userId])

  async function handleLike() {
    if (!userId) { alert('로그인이 필요해요'); return }
    setLoading(true)
    const res = await fetch(`/api/dream/${dreamId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    setLiked(data.liked)
    setCount(prev => data.liked ? prev + 1 : prev - 1)
    setLoading(false)
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all duration-200 ${
        liked
          ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
          : 'border-white/[0.06] text-gray-500 hover:border-pink-500/30 hover:text-pink-400'
      }`}
    >
      {liked ? '♥' : '♡'} {count > 0 && count}
    </button>
  )
}
