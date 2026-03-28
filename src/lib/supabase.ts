import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 브라우저용 (세션 자동 유지)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// 서버 전용
export const supabaseAdmin = typeof window === 'undefined'
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  : createClient(supabaseUrl, supabaseAnonKey)
