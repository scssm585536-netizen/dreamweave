import { NextRequest, NextResponse } from 'next/server'

// 간단한 Rate Limiting (IP 기반)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1분
const RATE_LIMIT_MAX = 30 // 분당 30회

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX) return false

  record.count++
  return true
}

// XSS 방지 — 위험 문자 감지
function containsXSS(input: string): boolean {
  const xssPatterns = /<script|javascript:|on\w+\s*=|<iframe|<img.*onerror/i
  return xssPatterns.test(input)
}

export async function middleware(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'

  // API 요청만 Rate Limiting 적용
  if (req.nextUrl.pathname.startsWith('/api/')) {

    // Rate Limiting
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    // POST 요청 body XSS 체크
    if (req.method === 'POST') {
      try {
        const body = await req.text()
        if (containsXSS(body)) {
          return NextResponse.json(
            { error: '허용되지 않는 입력이에요.' },
            { status: 400 }
          )
        }

        // body를 다시 읽을 수 있게 새 request 생성
        return NextResponse.next({
          request: {
            headers: req.headers,
          },
        })
      } catch {
        // body 파싱 실패는 무시
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}