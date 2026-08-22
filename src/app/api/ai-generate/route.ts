import OpenAI from 'openai'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function promptFor(body: any) {
  return `You are SCommerce AI, an honest product-marketing assistant for small businesses and Facebook sellers in Bangladesh. Analyze the supplied product image and seller notes. Return ONLY valid JSON in this exact shape:
{"product":{"name":"","category":"","brand":"","model":"","color":"","material":"","dimensions":"","weight":"","power":"","battery":"","compatibility":"","whatsIncluded":[],"specifications":[{"label":"","value":"","confidence":"detected|needs_confirmation|provided"}]},"en":{"headline":"","shortDescription":"","salesCaption":"","adCopy":"","hooks":["","",""],"cta":"","benefits":["","",""],"reelScript":""},"bn":{"headline":"","shortDescription":"","salesCaption":"","adCopy":"","hooks":["","",""],"cta":"","benefits":["","",""],"reelScript":""}}
Rules: Never invent technical specifications, certifications, warranty, health claims, guarantees, dimensions, battery capacity, power ratings, materials or compatibility. If a value cannot be reliably seen or supplied, leave it blank or mark the specification needs_confirmation. Use seller notes as higher-confidence input. Make sales copy persuasive but truthful. Bangla should sound natural for Bangladesh social commerce. Product image: ${body.imageUrl ? 'attached' : 'not attached'}. Product name: ${body.name || ''}. Price: ${body.price || ''}. Compare price: ${body.compareAtPrice || ''}. Seller notes: ${body.description || ''}. Known features: ${(body.features || []).join(', ')}.`
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'AI service is not configured. Add OPENAI_API_KEY to the server environment.' }, { status: 500 })
    const body = await req.json()
    if (!body.imageUrl && !body.name) return NextResponse.json({ error: 'Upload a product image or enter a product name.' }, { status: 400 })
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const content: any[] = [{ type: 'input_text', text: promptFor(body) }]
    if (body.imageUrl) content.push({ type: 'input_image', image_url: body.imageUrl, detail: 'high' })
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      input: [{ role: 'user', content }],
    })
    const text = response.output_text?.trim() || '{}'
    const jsonText = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    let parsed
    try { parsed = JSON.parse(jsonText) } catch { throw new Error('AI returned invalid content. Please try again.') }
    return NextResponse.json({ content: parsed })
  } catch (error) {
    console.error('AI generation error', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'AI generation failed' }, { status: 500 })
  }
}
