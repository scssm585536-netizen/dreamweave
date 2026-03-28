import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId 필요' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('dreams')
    .select('id, title, content, interpretation, emotions, keywords, image_url, visibility, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: '목록 조회 실패' }, { status: 500 })
  }

  return NextResponse.json({ dreams: data })
}
