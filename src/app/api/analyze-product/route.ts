import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI service is not configured. Add OPENAI_API_KEY to the server environment.' }, { status: 500 })
    }

    const body = await request.json()
    const { imageUrl, name, price, notes, features } = body
    if (!imageUrl) return NextResponse.json({ error: 'Product image is required.' }, { status: 400 })

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      input: [{
        role: 'user',
        content: [
          { type: 'input_text', text: `Analyze this product photo for a product marketing SaaS. Return ONLY valid JSON. Never invent technical specifications. Use "detected" only when visually supported, "provided" for seller-supplied information, and "needs_confirmation" when uncertain. Seller-provided context: name=${name || ''}; price=${price || ''}; notes=${notes || ''}; known_features=${JSON.stringify(features || [])}. JSON shape: {"product":{"name":"","category":"","brand":"","model":"","color":"","material":"","dimensions":"","weight":"","power":"","battery":"","compatibility":"","whatsIncluded":[],"specifications":[{"label":"","value":"","confidence":"detected|provided|needs_confirmation"}]}}` },
          { type: 'input_image', image_url: imageUrl, detail: 'high' },
        ],
      }],
    })

    const raw = response.output_text?.trim() || ''
    const jsonText = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    const content = JSON.parse(jsonText)
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Product analysis error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Product analysis failed.' }, { status: 500 })
  }
}
