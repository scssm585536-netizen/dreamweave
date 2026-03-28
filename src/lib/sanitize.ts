// HTML 태그 제거
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')           // HTML 태그 제거
    .replace(/javascript:/gi, '')       // javascript: 제거
    .replace(/on\w+\s*=/gi, '')        // 이벤트 핸들러 제거
    .trim()
    .slice(0, 5000)                     // 최대 5000자
}

// 이메일 검증
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// UUID 검증
export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)
}