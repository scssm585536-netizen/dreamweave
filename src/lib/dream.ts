import { Dream } from '@/types'

// 꿈 생성일 포맷
export function formatDreamDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 감정 → 색상 매핑
export function emotionToColor(emotion: string): string {
  const map: Record<string, string> = {
    불안: '#ef4444',
    설렘: '#f59e0b',
    슬픔: '#3b82f6',
    기쁨: '#22c55e',
    공포: '#8b5cf6',
    평온: '#06b6d4',
    혼란: '#ec4899',
    신비: '#a855f7',
  }
  return map[emotion] ?? '#6b7280'
}

// 꿈 내용 미리보기 (50자)
export function previewContent(content: string): string {
  return content.length > 50 ? content.slice(0, 50) + '...' : content
}
