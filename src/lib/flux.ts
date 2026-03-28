export async function generateDreamImage(
  keywords: string[],
  emotions: string[]
): Promise<string | null> {
  const prompt = `A surreal dreamscape featuring: ${keywords.join(', ')}. Mood: ${emotions.join(', ')}. Ethereal, mystical, soft watercolor, dreamlike, Studio Ghibli style, no text.`

  const response = await fetch(
    'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  )

  if (!response.ok) return null

  const blob = await response.blob()
  const buffer = Buffer.from(await blob.arrayBuffer())
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}
