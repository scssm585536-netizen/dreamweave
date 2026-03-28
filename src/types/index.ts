export type Plan = 'free' | 'dreamer' | 'weaver'
export type Visibility = 'private' | 'anonymous' | 'public'

export interface EmotionTag {
  name: string
  score: number
}

export interface KeywordTag {
  name: string
  score: number
}

export interface Profile {
  id: string
  email: string
  nickname: string
  plan: Plan
  created_at: string
}

export interface Dream {
  id: string
  user_id: string
  title: string
  content: string
  interpretation: string
  emotions: string[]
  emotion_scores: Record<string, number> | null
  keywords: string[]
  keyword_scores: Record<string, number> | null
  main_tag: string | null
  image_url: string | null
  visibility: Visibility
  created_at: string
}

export interface DreamConnection {
  id: string
  dream_a: string
  dream_b: string
  similarity: number
}

export interface WeaveNode {
  id: string
  title: string
  emotions: any[]
  keywords: any[]
  main_tag: string | null
  image_url: string | null
  x: number
  y: number
  z: number
  isMyDream: boolean
}

export interface WeaveEdge {
  source: string
  target: string
  similarity: number
}
