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

  // 키워드/감정/내용으로 검색
  const { data: dreams, error } = await supabaseAdmin
    .from('dreams')
    .select('id, content, emotions, keywords, emotion_scores, keyword_scores, main_tag, visibility, created_at')
    .eq('user_id', userId)
    .or(`content.ilike.%${query}%, main_tag.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: '검색 실패' }, { status: 500 })

  // keywords 배열에서도 검색 (JSONB)
  const { data: keywordDreams } = await supabaseAdmin
    .from('dreams')
    .select('id, content, emotions, keywords, emotion_scores, keyword_scores, main_tag, visibility, created_at')
    .eq('user_id', userId)
    .contains('keywords', [query])
    .order('created_at', { ascending: false })
    .limit(20)

  // 중복 제거 후 합치기
  const allDreams = [...(dreams ?? [])]
  keywordDreams?.forEach((kd) => {
    if (!allDreams.find(d => d.id === kd.id)) allDreams.push(kd)
  })

  return NextResponse.json({ dreams: allDreams })
}
