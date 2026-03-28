import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: dream } = await supabase
    .from('dreams')
    .select('content, main_tag, emotions')
    .eq('id', params.id)
    .single()

  const title = dream?.main_tag
    ? `${dream.main_tag} — DreamWeave`
    : 'DreamWeave — AI 꿈 직조기'

  const description = dream?.content?.slice(0, 120) ?? '내 꿈이 전 세계 사람들의 꿈과 연결되는 곳'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/dream/${params.id}/opengraph-image`],
      siteName: 'DreamWeave',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/dream/${params.id}/opengraph-image`],
    },
  }
}

export default function DreamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}