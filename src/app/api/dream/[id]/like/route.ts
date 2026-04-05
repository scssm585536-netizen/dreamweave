import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  // 이미 좋아요 했는지 확인
  const { data: existing } = await supabaseAdmin
    .from('dream_likes')
    .select('id')
    .eq('dream_id', params.id)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // 좋아요 취소
    await supabaseAdmin.from('dream_likes').delete().eq('id', existing.id)
    return NextResponse.json({ liked: false })
  } else {
    // 좋아요 추가
    await supabaseAdmin.from('dream_likes').insert({ dream_id: params.id, user_id: userId })
    return NextResponse.json({ liked: true })
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  const { count } = await supabaseAdmin
    .from('dream_likes')
    .select('*', { count: 'exact', head: true })
    .eq('dream_id', params.id)

  let liked = false
  if (userId) {
    const { data } = await supabaseAdmin
      .from('dream_likes')
      .select('id')
      .eq('dream_id', params.id)
      .eq('user_id', userId)
      .single()
    liked = !!data
  }

  return NextResponse.json({ count: count ?? 0, liked })
}
