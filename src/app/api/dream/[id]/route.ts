import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('dreams')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: '꿈 조회 실패' }, { status: 404 })
  }

  return NextResponse.json({ dream: data })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 요청에서 userId 받기
  const { userId } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  }

  // 꿈 소유자 확인
  const { data: dream } = await supabase
    .from('dreams')
    .select('user_id')
    .eq('id', params.id)
    .single()

  if (!dream) {
    return NextResponse.json({ error: '꿈을 찾을 수 없어요' }, { status: 404 })
  }

  if (dream.user_id !== userId) {
    return NextResponse.json({ error: '본인이 작성한 꿈만 삭제할 수 있어요' }, { status: 403 })
  }

  const { error } = await supabase
    .from('dreams')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: '꿈 삭제 실패' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { visibility, userId } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  }

  // 소유자 확인
  const { data: dream } = await supabase
    .from('dreams')
    .select('user_id')
    .eq('id', params.id)
    .single()

  if (!dream || dream.user_id !== userId) {
    return NextResponse.json({ error: '본인이 작성한 꿈만 수정할 수 있어요' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('dreams')
    .update({ visibility })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: '업데이트 실패' }, { status: 500 })
  }

  return NextResponse.json({ dream: data })
}
