'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '무료',
    color: 'border-white/10',
    badge: '',
    features: [
      '꿈 기록 월 20건',
      'AI 해석 월 3회',
      '직물 탐험 (읽기 전용)',
      '기본 감정 태깅',
    ],
    limits: ['검색 기능 제한'],
  },
  {
    id: 'dreamer',
    name: 'Dreamer',
    price: '₩6,900/월',
    color: 'border-purple-500/60',
    badge: '인기',
    features: [
      '꿈 기록 무제한',
      'AI 해석 무제한',
      '직물 탐험 + 기여',
      '감정 패턴 분석',
      '핵심 상징 검색',
    ],
    limits: [],
  },
  {
    id: 'weaver',
    name: 'Weaver',
    price: '₩12,900/월',
    color: 'border-indigo-400/60',
    badge: '최고',
    features: [
      'Dreamer 전부 포함',
      '직물 우선 노출',
      '월간 인사이트 리포트',
      '꿈 패턴 심층 분석',
      '전용 고객 지원',
    ],
    limits: [],
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth'); return }
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      setCurrentPlan(data?.plan ?? 'free')
      setLoading(false)
    })
  }, [router])

  // 결제 성공/취소 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      const plan = params.get('plan')
      if (plan) {
        setCurrentPlan(plan)
        alert(`🎉 ${plan === 'dreamer' ? 'Dreamer' : 'Weaver'} 플랜으로 업그레이드됐어요!`)
        window.history.replaceState({}, '', '/pricing')
      }
    }
    if (params.get('canceled') === 'true') {
      alert('결제가 취소됐어요.')
      window.history.replaceState({}, '', '/pricing')
    }
  }, [])

  async function handleUpgrade(planId: string) {
    if (planId === currentPlan || planId === 'free') return
    setUpgrading(planId)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          userId: user.id,
          email: user.email,
        }),
      })

      const { url, error } = await res.json()
      if (error) { alert(error); return }

      // Stripe 결제 페이지로 이동
      window.location.href = url
    } catch (err) {
      console.error(err)
      alert('결제 페이지 연결에 실패했어요')
    } finally {
      setUpgrading(null)
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
    <main className="min-h-screen bg-[#070712] text-white px-6 py-16">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-300 text-sm mb-12 transition">
          ← 대시보드
        </Link>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            플랜 선택
          </div>
          <h1 className="text-4xl font-black mb-4">내 꿈에 맞는 플랜을 선택하세요</h1>
          <p className="text-gray-500">언제든 변경 가능해요</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id
            const isUpgrading = upgrading === plan.id

            return (
              <div
                key={plan.id}
                className={`relative bg-white/[0.02] border rounded-2xl p-7 flex flex-col transition-all duration-200 ${
                  plan.color
                } ${isCurrent ? 'bg-white/[0.05]' : 'hover:bg-white/[0.04]'}`}
              >
                {/* 배지 */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-600 text-xs font-bold">
                    {plan.badge}
                  </div>
                )}

                {/* 현재 플랜 표시 */}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-green-600/80 text-xs font-bold">
                    현재 플랜
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-black mb-2">{plan.name}</h2>
                  <p className="text-3xl font-black text-purple-300">{plan.price}</p>
                </div>

                {/* 기능 목록 */}
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-purple-400 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                  {plan.limits.map((l) => (
                    <li key={l} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-0.5">✕</span>
                      {l}
                    </li>
                  ))}
                </ul>

<button
  onClick={() => handleUpgrade(plan.id)}
  disabled={isCurrent || upgrading !== null}
  className={`w-full py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
    isCurrent
      ? 'bg-white/[0.05] text-gray-500 cursor-default'
      : 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/40'
  }`}
>
  {isCurrent ? '현재 사용 중' : upgrading === plan.id ? '변경 중...' : '이 플랜 선택'}
</button>
              </div>
            )
          })}
        </div>

        <p className="text-center text-gray-700 text-xs mt-10">
          * 현재는 테스트 모드예요. 실제 결제 시스템은 준비 중이에요.
        </p>
      </div>
    </main>
  )
}