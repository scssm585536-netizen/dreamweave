'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn, signUp } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'login' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/dashboard')
      else setLoading(false)
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message ?? '오류가 발생했어요')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070712] flex items-center justify-center">
        <div className="text-4xl animate-pulse">🧵</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#070712] text-white flex items-center justify-center px-4 md:px-6">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="text-4xl mb-3 block">🧵</Link>
          <h1 className="text-2xl font-bold">DreamWeave</h1>
          <p className="text-gray-500 text-sm mt-1">꿈을 기록하고 세상과 연결하세요</p>
        </div>

        <div className="flex bg-white/[0.03] rounded-full p-1 mb-8 border border-white/[0.06]">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                mode === m ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {m === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              required
              className="w-full bg-white/[0.03] border border-white/[0.07] focus:border-purple-500/60 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-700 focus:outline-none transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-white/[0.03] border border-white/[0.07] focus:border-purple-500/60 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-700 focus:outline-none transition-all duration-200"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-sm transition-all duration-200 shadow-[0_0_30px_rgba(147,51,234,0.3)] mt-2"
          >
            {mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070712] flex items-center justify-center">
        <div className="text-4xl animate-pulse">🧵</div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}