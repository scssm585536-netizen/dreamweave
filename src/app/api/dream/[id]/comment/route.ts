import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { data } = await supabaseAdmin
    .from('dream_comments')
    .select('id, content, created_at, user_id, profiles(email, nickname)')
    .eq('dream_id', params.id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ comments: data ?? [] })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId, content } = await req.json()
  if (!userId || !content?.trim()) {
    return NextResponse.json({ error: '내용을 입력해줘요' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('dream_comments')
    .insert({ dream_id: params.id, user_id: userId, content: content.trim() })
    .select('id, content, created_at, user_id, profiles(email, nickname)')
    .single()

  if (error) return NextResponse.json({ error: '댓글 저장 실패' }, { status: 500 })
  return NextResponse.json({ comment: data })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { commentId, userId } = await req.json()

  await supabaseAdmin
    .from('dream_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId)

  return NextResponse.json({ deleted: true })
}
