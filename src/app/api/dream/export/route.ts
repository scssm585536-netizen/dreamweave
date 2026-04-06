import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) return NextResponse.json({ error: '유저 없음' }, { status: 400 })

  // 플랜 확인
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()

  if (!profile || profile.plan !== 'weaver') {
    return NextResponse.json({ error: 'PLAN_REQUIRED' }, { status: 403 })
  }

  // 이번 달 꿈 가져오기
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: dreams } = await supabaseAdmin
    .from('dreams')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())
    .order('created_at', { ascending: true })

  return NextResponse.json({ dreams: dreams ?? [] })
}
