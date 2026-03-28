import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const PLAN_LIMITS = {
  free: { monthlyDreams: 20, monthlyInterpretations: 3 },
  dreamer: { monthlyDreams: Infinity, monthlyInterpretations: Infinity },
  weaver: { monthlyDreams: Infinity, monthlyInterpretations: Infinity },
}

export async function checkDreamLimit(userId: string): Promise<{
  allowed: boolean
  plan: string
  used: number
  limit: number
}> {
  const supabase = getAdmin()

  const { data } = await supabase
    .from('profiles')
    .select('plan, dream_count_this_month, month_reset_at')
    .eq('id', userId)
    .single()

  if (!data) return { allowed: true, plan: 'free', used: 0, limit: 20 }

  const plan = data.plan ?? 'free'
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.monthlyDreams ?? 20

  const resetAt = new Date(data.month_reset_at)
  const now = new Date()
  const isNewMonth =
    now.getMonth() !== resetAt.getMonth() ||
    now.getFullYear() !== resetAt.getFullYear()

  let used = data.dream_count_this_month ?? 0

  if (isNewMonth) {
    await supabase
      .from('profiles')
      .update({ dream_count_this_month: 0, month_reset_at: now.toISOString() })
      .eq('id', userId)
    used = 0
  }

  return {
    allowed: limit === Infinity || used < limit,
    plan,
    used,
    limit: limit === Infinity ? -1 : limit,
  }
}

export async function checkInterpretationLimit(userId: string): Promise<{
  allowed: boolean
  plan: string
}> {
  const supabase = getAdmin()

  const { data } = await supabase
    .from('profiles')
    .select('plan, dream_count_this_month')
    .eq('id', userId)
    .single()

  const plan = data?.plan ?? 'free'

  if (plan === 'free') {
    const used = data?.dream_count_this_month ?? 0
    return { allowed: used < 3, plan }
  }

  return { allowed: true, plan }
}

export async function incrementDreamCount(userId: string) {
  const supabase = getAdmin()

  const { data } = await supabase
    .from('profiles')
    .select('dream_count_this_month')
    .eq('id', userId)
    .single()

  await supabase
    .from('profiles')
    .update({ dream_count_this_month: (data?.dream_count_this_month ?? 0) + 1 })
    .eq('id', userId)
}