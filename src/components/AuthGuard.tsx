'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth')
      else setChecked(true)
    })
  }, [router])

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#070712] flex items-center justify-center">
        <div className="text-4xl animate-pulse">🧵</div>
      </div>
    )
  }

  return <>{children}</>
}