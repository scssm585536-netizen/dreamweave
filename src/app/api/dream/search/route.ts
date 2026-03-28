import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')?.trim()
  const userId = searchParams.get('userId')

  if (!query || !userId) {
    return NextResponse.json({ dreams: [] })
  }

  const { data, error } = await supabaseAdmin
    .from('dreams')
    .select('*')
    .eq('user_id', userId)
    .or(`keywords.cs.{"${query}"},emotions.cs.{"${query}"},content.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: '검색 실패' }, { status: 500 })
  }

  return NextResponse.json({ dreams: data })
}