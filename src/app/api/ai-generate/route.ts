import OpenAI from 'openai'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function promptFor(body: any) {
  return `You are SCommerce AI, an honest sales-content assistant for small businesses and Facebook sellers in Bangladesh. Analyze the supplied product image and seller notes. Return ONLY valid JSON in this exact shape:
{
  "product": {"name":"","category":"","brand":"","model":"","color":"","material":"","dimensions":"","weight":"","power":"","battery":"","compatibility":"","whatsIncluded":[""],"specifications":[{"label":"","value":"","confidence":"detected|needs_confirmation|provided"}]},
  "en": {"headline":"","shortDescription":"","salesCaption":"","adCopy":"","hooks":["","",""],"cta":"","benefits":["","",""],"reelScript":""},
  "bn": {"headline":"","shortDescription":"","salesCaption":"","adCopy":"","hooks":["","",""],"cta":"","benefits":["","",""],"reelScript":""}
}
Rules: Never invent technical specifications, certifications, warranty, health claims, guarantees, dimensions, battery capacity, power ratings, materials or compatibility. If a value cannot be reliably seen or supplied, leave it blank or mark the specification needs_confirmation. Use provided seller notes as higher-confidence input. Make captions sales-oriented but truthful. Bangla should sound natural for Bangladesh social commerce. Product image: ${body.imageUrl ? 'attached' : 'not attached'}. Product name: ${body.name || ''}. Price: ${body.price || ''}. Compare price: ${body.compareAtPrice || ''}. Seller notes: ${body.description || ''}. Known features: ${(body.features || []).join(', ')}.`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.imageUrl && !body.name) return NextResponse.json({ error: 'Upload a product image or enter a product name.' }, { status: 400 })
    const client = new OpenAI()
    const content: any[] = [{ type: 'text', text: promptFor(body) }]
    if (body.imageUrl) content.push({ type: 'image_url', image_url: { url: body.imageUrl, detail: 'high' } })
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You create concise, trustworthy product marketing content in English and Bangla. Follow the requested JSON schema exactly.' },
        { role: 'user', content }
      ]
    })
    const text = response.choices[0]?.message?.content || '{}'
    let parsed
    try { parsed = JSON.parse(text) } catch { throw new Error('AI returned invalid content. Please try again.') }
    return NextResponse.json({ content: parsed })
  } catch (error) {
    console.error('AI generation error', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'AI generation failed' }, { status: 500 })
  }
}
