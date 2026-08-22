'use client'

import { useState } from 'react'

type Block = { key: string; title: string; icon: string; text: string }

export default function MarketingKitPage() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [blocks, setBlocks] = useState<Block[]>([
    { key: 'headline', title: 'Sales Headline', icon: '⚡', text: '' },
    { key: 'caption', title: 'Sales Caption', icon: '📝', text: '' },
    { key: 'adCopy', title: 'Ad Copy', icon: '🎯', text: '' },
    { key: 'hooks', title: 'Sales Hooks', icon: '🔥', text: '' },
    { key: 'benefits', title: 'Benefits', icon: '✨', text: '' },
    { key: 'cta', title: 'Call to Action', icon: '👉', text: '' },
    { key: 'reelScript', title: 'Reel Script', icon: '🎬', text: '' },
  ])

  async function generateAll() {
    setBusy(true); setMessage('')
    try {
      const product = JSON.parse(localStorage.getItem('scommerce_analyzed_product') || 'null')
      if (!product) throw new Error('Analyze a product first in Create Studio.')
      const r = await fetch('/api/generate-sales-content', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ product, language }) })
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Generation failed.')
      const c = d.content?.[language] || {}
      setBlocks([
        { key: 'headline', title: 'Sales Headline', icon: '⚡', text: c.headline || '' },
        { key: 'caption', title: 'Sales Caption', icon: '📝', text: c.salesCaption || '' },
        { key: 'adCopy', title: 'Ad Copy', icon: '🎯', text: c.adCopy || '' },
        { key: 'hooks', title: 'Sales Hooks', icon: '🔥', text: (c.hooks || []).join('\n') },
        { key: 'benefits', title: 'Benefits', icon: '✨', text: (c.benefits || []).map((x:string) => `• ${x}`).join('\n') },
        { key: 'cta', title: 'Call to Action', icon: '👉', text: c.cta || '' },
        { key: 'reelScript', title: 'Reel Script', icon: '🎬', text: c.reelScript || '' },
      ])
      localStorage.setItem('scommerce_marketing_kit', JSON.stringify({ language, content: c, generatedAt: new Date().toISOString() }))
      setMessage('Marketing kit generated.')
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Generation failed.') } finally { setBusy(false) }
  }

  function update(key: string, text: string) { setBlocks(b => b.map(x => x.key === key ? { ...x, text } : x)) }
  async function copyAll() { await navigator.clipboard?.writeText(blocks.filter(b => b.text).map(b => `${b.title}\n${b.text}`).join('\n\n')); setMessage('Complete marketing kit copied.') }
  async function copy(text: string) { await navigator.clipboard?.writeText(text); setMessage('Copied.') }

  return <main className="mx-auto max-w-7xl">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-black uppercase tracking-[0.2em] text-teal">STEP 5 · MARKETING KIT</p><h1 className="mt-2 text-4xl font-black tracking-tight">Everything you need to sell.</h1><p className="mt-2 max-w-2xl text-brand/55">Turn your analyzed product into a complete, editable sales kit. Generate once, refine anything, and copy everything when you are ready.</p></div>
      <div className="flex gap-2"><div className="flex rounded-xl bg-beige p-1"><button onClick={()=>setLanguage('en')} className={`rounded-lg px-4 py-2 text-sm font-bold ${language==='en'?'bg-white shadow-sm':''}`}>English</button><button onClick={()=>setLanguage('bn')} className={`rounded-lg px-4 py-2 text-sm font-bold ${language==='bn'?'bg-white shadow-sm':''}`}>বাংলা</button></div><button onClick={generateAll} disabled={busy} className="rounded-xl bg-teal px-5 py-2.5 font-black text-white disabled:opacity-50">{busy?'✨ Generating…':'✨ Generate All'}</button></div>
    </div>
    {message && <div className="mb-5 rounded-2xl bg-sky/50 px-4 py-3 text-sm font-semibold">{message}</div>}
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/10 bg-white p-4 shadow-sm"><div><span className="font-black">Marketing Kit</span><span className="ml-2 text-sm text-brand/45">{language==='bn'?'বাংলা':'English'} · editable</span></div><div className="flex gap-2"><button onClick={copyAll} className="rounded-xl border border-brand/10 px-4 py-2 text-sm font-bold">Copy All</button><button onClick={generateAll} disabled={busy} className="rounded-xl bg-beige px-4 py-2 text-sm font-bold">↻ Regenerate</button></div></div>
    <div className="grid gap-5 lg:grid-cols-2">
      {blocks.map((block, i) => <section key={block.key} className={`rounded-3xl border border-brand/10 bg-white p-5 shadow-sm ${i===1?'lg:col-span-2':''}`}><div className="flex items-center justify-between gap-3"><div><span className="mr-2">{block.icon}</span><span className="font-black">{block.title}</span></div><button onClick={()=>copy(block.text)} className="text-xs font-black text-teal">Copy</button></div><textarea value={block.text} onChange={e=>update(block.key,e.target.value)} placeholder="Generate content to fill this section…" rows={i===1?8:i===6?8:5} className="mt-4 w-full resize-y rounded-2xl border border-brand/10 bg-beige/40 p-4 text-sm leading-6 outline-none focus:border-teal" /></section>)}
    </div>
  </main>
}
