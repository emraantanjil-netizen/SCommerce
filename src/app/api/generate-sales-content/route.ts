import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'AI service is not configured.' }, { status: 500 })
    const body = await request.json()
    const { product, language = 'both', tone = 'sales', audience = '', offer = '' } = body
    if (!product) return NextResponse.json({ error: 'Analyzed product data is required.' }, { status: 400 })

    const languages = language === 'bn' ? 'Bangla only' : language === 'en' ? 'English only' : 'both English and natural Bangla'
    const prompt = `Create sales-oriented marketing content for this product. Return ONLY valid JSON. Languages: ${languages}. Tone: ${tone}. Target audience: ${audience}. Offer/pricing context: ${offer}. Never invent technical specifications, certifications, guarantees, stock claims, or product capabilities. Use only the supplied product information. Make Bangla natural for Bangladesh social commerce, not a literal translation. Return this exact shape: {"en":{"headline":"","shortDescription":"","salesCaption":"","adCopy":"","hooks":["","","","",""],"cta":"","benefits":["","",""],"productDescription":"","reelScript":""},"bn":{"headline":"","shortDescription":"","salesCaption":"","adCopy":"","hooks":["","","","",""],"cta":"","benefits":["","",""],"productDescription":"","reelScript":""}}. Product data: ${JSON.stringify(product)}`

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }] }],
    })
    const raw = response.output_text?.trim() || ''
    const jsonText = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    return NextResponse.json({ content: JSON.parse(jsonText) })
  } catch (error) {
    console.error('Sales content generation error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Sales content generation failed.' }, { status: 500 })
  }
}
