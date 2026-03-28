import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createEmbedding } from '@/lib/openai'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 임베딩 없는 꿈 조회
  const { data: dreams } = await supabase
    .from('dreams')
    .select('id, content')
    .is('embedding', null)
    .neq('visibility', 'private')

  if (!dreams || dreams.length === 0) {
    return NextResponse.json({ message: '처리할 꿈이 없어요' })
  }

  let processed = 0
  let connected = 0

  for (const dream of dreams) {
    try {
      // 임베딩 생성
      const embedding = await createEmbedding(dream.content)

      // 임베딩 저장
      await supabase
        .from('dreams')
        .update({ embedding })
        .eq('id', dream.id)

      // 유사 꿈 연결
      const { data: similar } = await supabase.rpc('match_dreams', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 5,
        exclude_id: dream.id,
      })

      if (similar && similar.length > 0) {
        const connections = similar.map((s: any) => ({
          dream_a: dream.id,
          dream_b: s.id,
          similarity: s.similarity,
        }))
        await supabase
          .from('dream_connections')
          .upsert(connections, { onConflict: 'dream_a,dream_b' })
        connected += similar.length
      }

      processed++
      console.log(`[embed] ${processed}/${dreams.length} 처리 완료`)

      // API 레이트 리밋 방지
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error(`[embed] 실패 ${dream.id}:`, err)
    }
  }

  return NextResponse.json({
    message: '임베딩 생성 완료',
    processed,
    connected,
  })
}