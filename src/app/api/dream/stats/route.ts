import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const period = searchParams.get('period') ?? '1m' // 1m, 3m, 1y, all

  if (!userId) return NextResponse.json({ error: '유저 없음' }, { status: 400 })

  // 플랜 확인
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()

  if (!profile || profile.plan === 'free') {
    return NextResponse.json({ error: 'PLAN_REQUIRED' }, { status: 403 })
  }

  // 기간 계산
  const now = new Date()
  let startDate: Date | null = null
  if (period === '1m') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (period === '3m') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  } else if (period === '1y') {
    startDate = new Date(now.getFullYear(), 0, 1)
  }

  let query = supabaseAdmin
    .from('dreams')
    .select('emotions, emotion_scores, keywords, main_tag, created_at')
    .eq('user_id', userId)

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString())
  }

  const { data: dreams } = await query.order('created_at', { ascending: true })

  const dreamList = dreams ?? []

  // 감정 집계
  const emotionCounts: Record<string, number> = {}
  const tagCounts: Record<string, number> = {}
  const monthCounts: Record<string, number> = {}

  dreamList.forEach((d) => {
    // 감정
    ;(d.emotions ?? []).forEach((e: string) => {
      emotionCounts[e] = (emotionCounts[e] ?? 0) + 1
    })
    // 태그
    if (d.main_tag) tagCounts[d.main_tag] = (tagCounts[d.main_tag] ?? 0) + 1
    // 월별
    const month = new Date(d.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })
    monthCounts[month] = (monthCounts[month] ?? 0) + 1
  })

  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)

  const monthlyData = Object.entries(monthCounts)
    .map(([month, count]) => ({ month, count }))

  return NextResponse.json({
    totalDreams: dreamList.length,
    topEmotions,
    topTags,
    monthlyData,
    thisMonth: {
      count: monthCounts[now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })] ?? 0,
    },
  })
}
