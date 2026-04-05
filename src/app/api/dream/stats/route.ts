import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) return NextResponse.json({ error: '유저 없음' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 플랜 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()

  if (!profile || profile.plan === 'free') {
    return NextResponse.json({ error: 'PLAN_REQUIRED' }, { status: 403 })
  }

  // 이번 달 꿈 가져오기
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: dreams } = await supabase
    .from('dreams')
    .select('emotions, emotion_scores, created_at')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())

  // 지난달 꿈
  const startOfLastMonth = new Date()
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)
  startOfLastMonth.setDate(1)
  startOfLastMonth.setHours(0, 0, 0, 0)
  const endOfLastMonth = new Date()
  endOfLastMonth.setDate(0)

  const { data: lastMonthDreams } = await supabase
    .from('dreams')
    .select('emotions, emotion_scores')
    .eq('user_id', userId)
    .gte('created_at', startOfLastMonth.toISOString())
    .lte('created_at', endOfLastMonth.toISOString())

  // 감정 집계
  function aggregateEmotions(dreamList: any[]) {
    const counts: Record<string, number> = {}
    const scores: Record<string, number[]> = {}

    dreamList?.forEach((d) => {
      const emotions = d.emotions ?? []
      const emotionScores = d.emotion_scores ?? {}
      emotions.forEach((e: string) => {
        counts[e] = (counts[e] ?? 0) + 1
        if (!scores[e]) scores[e] = []
        if (emotionScores[e]) scores[e].push(emotionScores[e])
      })
    })

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        avgScore: scores[name]?.length
          ? Math.round(scores[name].reduce((a, b) => a + b, 0) / scores[name].length)
          : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  const thisMonth = aggregateEmotions(dreams ?? [])
  const lastMonth = aggregateEmotions(lastMonthDreams ?? [])

  return NextResponse.json({
    thisMonth,
    lastMonth,
    totalDreams: dreams?.length ?? 0,
  })
}