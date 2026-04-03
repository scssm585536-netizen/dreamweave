'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import DreamForm from '@/components/dream/DreamForm'

export default function NewDreamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth')
      else setUserId(user.id)
    })
  }, [router])

  async function handleSubmit(data: { content: string; visibility: string }) {
    if (!userId) return
    setLoading(true)
    try {
      const res = await fetch('/api/dream/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId, plan: 'free' }),
      })
      const { dream } = await res.json()
      router.push(`/dream/${dream.id}`)
    } catch (err) {
      console.error(err)
      alert('꿈 저장에 실패했어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#070712] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full bg-indigo-900/15 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-300 text-sm mb-8 md:mb-12 transition">
          ← 대시보드
        </Link>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">🧵</span>
          <span className="font-bold text-sm">Dreamsync</span>
        </div>
        <div className="mb-8 md:mb-10">
          <span className="text-purple-400 text-xs tracking-[0.3em] uppercase">오늘의 꿈</span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2">꿈을 기록해요</h1>
          <p className="text-gray-600 text-sm mt-2">기억나는 만큼만 써도 괜찮아요. AI가 해석해드려요.</p>
        </div>
        <DreamForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </main>
  )
}
