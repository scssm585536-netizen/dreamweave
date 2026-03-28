import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { interpretDream, createEmbedding } from '@/lib/openai'
import { checkDreamLimit, checkInterpretationLimit, incrementDreamCount } from '@/lib/plan'
import { sanitizeText, isValidUUID } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    const { content, visibility, userId } = await req.json()

    // 입력값 검증
    if (!content || !userId) {
      return NextResponse.json({ error: '필수 값 누락' }, { status: 400 })
    }

    if (!isValidUUID(userId)) {
      return NextResponse.json({ error: '잘못된 요청이에요' }, { status: 400 })
    }

    const cleanContent = sanitizeText(content)
    if (cleanContent.length < 5) {
      return NextResponse.json({ error: '꿈 내용을 5자 이상 입력해주세요' }, { status: 400 })
    }

    const validVisibility = ['private', 'anonymous', 'public']
    if (!validVisibility.includes(visibility)) {
      return NextResponse.json({ error: '잘못된 공개 범위에요' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 플랜 제한 확인
    const { allowed, used, limit } = await checkDreamLimit(userId)
    if (!allowed) {
      return NextResponse.json({
        error: `이번 달 꿈 기록 한도(${limit}건)를 초과했어요.`,
        code: 'PLAN_LIMIT_EXCEEDED',
        used, limit,
      }, { status: 403 })
    }

    // AI 해석
    let interpretation = '플랜을 업그레이드하면 AI 해석을 받을 수 있어요.'
    let emotions: any[] = []
    let keywords: any[] = []
    let main_tag = '꿈'

    const { allowed: interpretAllowed } = await checkInterpretationLimit(userId)

    let emotion_scores: Record<string, number> = {}
    let keyword_scores: Record<string, number> = {}

    if (interpretAllowed) {
      const result = await interpretDream(content)
      interpretation = result.interpretation
      emotions = result.emotions
      keywords = result.keywords
      emotion_scores = result.emotion_scores
      keyword_scores = result.keyword_scores
      main_tag = result.main_tag
    } else {
      emotions = ['미분류']
      keywords = ['꿈']
      emotion_scores = { '미분류': 100 }
      keyword_scores = { '꿈': 100 }
    }

    // 임베딩 생성
    const embedding = await createEmbedding(content)
    const image_url = null

    // DB 저장
    const { data: dream, error } = await supabase
      .from('dreams')
      .insert({
        user_id: userId,
        content: cleanContent,
        interpretation,
        emotions,
        emotion_scores,
        keywords,
        keyword_scores,
        main_tag,
        image_url,
        visibility,
        embedding,
      })
      .select()
      .single()

    if (error) throw error

    // 카운트 증가
    await incrementDreamCount(userId)

    // 유사 꿈 연결
    if (visibility !== 'private') {
      const { data: similar } = await supabase.rpc('match_dreams', {
        query_embedding: embedding,
        match_threshold: 0.65,
        match_count: 5,
        exclude_id: dream.id,
      })

      if (similar && similar.length > 0) {
        const connections = similar.map((s: any) => ({
          dream_a: dream.id,
          dream_b: s.id,
          similarity: s.similarity,
        }))
        await supabase.from('dream_connections').insert(connections)
      }
    }

    return NextResponse.json({ dream })
  } catch (err) {
    console.error('[dream/create]', err)
    return NextResponse.json({ error: '꿈 저장 실패' }, { status: 500 })
  }
}
