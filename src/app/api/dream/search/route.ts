import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  const userId = searchParams.get('userId')

  if (!query || !userId) {
    return NextResponse.json({ error: '필수 값 누락' }, { status: 400 })
  }

  // 플랜 확인
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()

  if (!profile || profile.plan === 'free') {
    return NextResponse.json({ error: 'PLAN_REQUIRED' }, { status: 403 })
  }

  // 전체 조회 후 클라이언트 필터링 (JSONB 배열 검색)
  const { data: dreams } = await supabaseAdmin
    .from('dreams')
    .select('id, content, emotions, keywords, emotion_scores, keyword_scores, main_tag, visibility, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!dreams) return NextResponse.json({ dreams: [] })

  const q = query.toLowerCase()
  const filtered = dreams.filter((d) => {
    const inContent = d.content?.toLowerCase().includes(q)
    const inMainTag = d.main_tag?.toLowerCase().includes(q)
    const inEmotions = (d.emotions ?? []).some((e: string) =>
      e.toLowerCase().includes(q)
    )
    const inKeywords = (d.keywords ?? []).some((k: any) => {
      const name = typeof k === 'string' ? k : k?.name ?? ''
      return name.toLowerCase().includes(q)
    })
    return inContent || inMainTag || inEmotions || inKeywords
  })

  return NextResponse.json({ dreams: filtered })
}
