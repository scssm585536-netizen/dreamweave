import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }

export default async function Image({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: dream } = await supabase
    .from('dreams')
    .select('content, emotions, main_tag, interpretation')
    .eq('id', params.id)
    .single()

  const content = dream?.content?.slice(0, 80) ?? '꿈을 기록해보세요'
  const mainTag = dream?.main_tag ?? '꿈'
  const emotions = (dream?.emotions ?? []).slice(0, 3).join(' · ')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #070712 0%, #1a0a2e 50%, #070712 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 배경 원 */}
        <div style={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'rgba(107, 70, 193, 0.15)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.15)',
          filter: 'blur(80px)',
        }} />

        {/* 로고 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 40,
        }}>
          <span style={{ fontSize: 32 }}>🧵</span>
          <span style={{ color: '#a78bfa', fontSize: 20, letterSpacing: 4 }}>DREAMWEAVE</span>
        </div>

        {/* 메인 태그 */}
        <div style={{
          background: 'rgba(147, 51, 234, 0.2)',
          border: '1px solid rgba(147, 51, 234, 0.4)',
          borderRadius: 50,
          padding: '8px 24px',
          color: '#c4b5fd',
          fontSize: 18,
          marginBottom: 28,
        }}>
          ✦ {mainTag}
        </div>

        {/* 꿈 내용 */}
        <div style={{
          color: '#e2e8f0',
          fontSize: 28,
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: 1.5,
          maxWidth: 900,
          marginBottom: 28,
        }}>
          "{content}{dream?.content?.length > 80 ? '...' : ''}"
        </div>

        {/* 감정 태그 */}
        {emotions && (
          <div style={{
            color: '#7c3aed',
            fontSize: 18,
          }}>
            {emotions}
          </div>
        )}

        {/* 하단 */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          right: 60,
          color: '#374151',
          fontSize: 16,
        }}>
          dreamweave.app
        </div>
      </div>
    ),
    { ...size }
  )
}