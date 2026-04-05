import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const tab = searchParams.get('tab') ?? 'all'

  if (tab === 'mine' && userId) {
    const { data, error } = await supabaseAdmin
      .from('dreams')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: '조회 실패' }, { status: 500 })
    return NextResponse.json({ dreams: data })
  }

  // 전체 피드 — Weaver 플랜 꿈 먼저, 그 다음 최신순
  const { data, error } = await supabaseAdmin
    .from('dreams')
    .select(`
      *,
      profiles!inner(plan)
    `)
    .neq('visibility', 'private')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: '조회 실패' }, { status: 500 })

  // Weaver 꿈을 상단으로 정렬
  const sorted = [...(data ?? [])].sort((a, b) => {
    const aPlan = (a as any).profiles?.plan ?? 'free'
    const bPlan = (b as any).profiles?.plan ?? 'free'
    const planScore = (plan: string) =>
      plan === 'weaver' ? 2 : plan === 'dreamer' ? 1 : 0

    if (planScore(bPlan) !== planScore(aPlan)) {
      return planScore(bPlan) - planScore(aPlan)
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return NextResponse.json({ dreams: sorted })
}
