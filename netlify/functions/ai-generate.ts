import OpenAI from 'openai'
import type { Config } from '@netlify/functions'

const systemPrompt = `You are SCommerce AI, an expert e-commerce copywriter for Bangladesh and international online sellers. Generate concise, persuasive product-page content in both English and Bangla. Return ONLY valid JSON with this exact shape: {"en":{"title":"","shortDescription":"","description":"","benefits":[""],"offerHeadline":"","cta":"","faqs":[{"question":"","answer":""}]},"bn":{"title":"","shortDescription":"","description":"","benefits":[""],"offerHeadline":"","cta":"","faqs":[{"question":"","answer":""}]}}. Do not invent technical specifications, certifications, guarantees, delivery claims, or medical claims. If information is missing, keep claims general.`

export default async (req: Request) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  try {
    const body = await req.json()
    const { name, price, compareAtPrice, description, features } = body
    if (!name) return Response.json({ error: 'Product name is required' }, { status: 400 })
    const openai = new OpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify({ name, price, compareAtPrice, description, features }) },
      ],
      temperature: 0.7,
    })
    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('AI returned no content')
    return Response.json({ content: JSON.parse(content) })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'AI generation failed' }, { status: 500 })
  }
}

export const config: Config = { path: '/api/ai-generate', method: 'POST' }
