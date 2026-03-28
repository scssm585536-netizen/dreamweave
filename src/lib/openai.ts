import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function interpretDream(content: string): Promise<{
  interpretation: string
  emotions: string[]
  keywords: string[]
  emotion_scores: Record<string, number>
  keyword_scores: Record<string, number>
  main_tag: string
}> {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `당신은 Jung 심리학 기반 꿈 해석 전문가입니다.
꿈을 분석하고 다음 JSON 형식으로만 반환하세요:
{
  "interpretation": "Jung 관점의 꿈 해석 (200자 내외, 따뜻하고 시적인 톤)",
  "emotions": ["감정1", "감정2", "감정3"],
  "emotion_scores": { "감정1": 85, "감정2": 60, "감정3": 40 },
  "keywords": ["상징1", "상징2", "상징3"],
  "keyword_scores": { "상징1": 90, "상징2": 70, "상징3": 50 },
  "main_tag": "이 꿈의 핵심 테마 단어 1개"
}`
      },
      { role: 'user', content: `꿈 내용: ${content}` }
    ],
    response_format: { type: 'json_object' },
  })

  const parsed = JSON.parse(res.choices[0].message.content!)
  return {
    interpretation: parsed.interpretation,
    emotions: parsed.emotions ?? [],
    emotion_scores: parsed.emotion_scores ?? {},
    keywords: parsed.keywords ?? [],
    keyword_scores: parsed.keyword_scores ?? {},
    main_tag: parsed.main_tag ?? '꿈',
  }
}

export async function createEmbedding(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return res.data[0].embedding
}
