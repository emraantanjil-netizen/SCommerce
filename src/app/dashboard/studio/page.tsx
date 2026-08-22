'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Kit = {
  product?: { name?: string; category?: string; brand?: string; model?: string; color?: string; material?: string; dimensions?: string; weight?: string; power?: string; battery?: string; compatibility?: string; whatsIncluded?: string[]; specifications?: { label: string; value: string; confidence: string }[] }
  en?: { headline?: string; shortDescription?: string; salesCaption?: string; adCopy?: string; hooks?: string[]; cta?: string; benefits?: string[]; reelScript?: string }
  bn?: { headline?: string; shortDescription?: string; salesCaption?: string; adCopy?: string; hooks?: string[]; cta?: string; benefits?: string[]; reelScript?: string }
}

export default function Studio() {
  const [image, setImage] = useState('')
  const [imagePath, setImagePath] = useState('')
  const [assetId, setAssetId] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [features, setFeatures] = useState('')
  const [kit, setKit] = useState<Kit | null>(null)
  const [lang, setLang] = useState<'en' | 'bn'>('en')
  const [tab, setTab] = useState<'captions' | 'specs' | 'kit'>('captions')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    setMessage('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setMessage('Please select a JPG, PNG or WEBP image.')
    if (file.size > 8 * 1024 * 1024) return setMessage('Image must be 8 MB or smaller.')
    setBusy(true)
    try {
      const s = createClient(); const { data: { user } } = await s.auth.getUser()
      if (!user) throw new Error('Please log in again.')
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`
      const { error } = await s.storage.from('product-images').upload(path, file, { contentType: file.type, upsert: false })
      if (error) throw error
      const url = s.storage.from('product-images').getPublicUrl(path).data.publicUrl
      const { data: asset, error: assetError } = await s.from('product_assets').insert({ user_id: user.id, name: name || file.name.replace(/\.[^.]+$/, ''), image_path: path, image_url: url, mime_type: file.type, file_size: file.size, status: 'uploaded' }).select('id').single()
      if (assetError) throw assetError
      setImage(url); setImagePath(path); setAssetId(asset.id); setKit(null); setMessage('Product photo uploaded. Ready for AI analysis.')
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Upload failed.') } finally { setBusy(false) }
  }

  async function removeImage() {
    if (!imagePath) return
    setBusy(true)
    try {
      const s = createClient()
      await s.storage.from('product-images').remove([imagePath])
      if (assetId) await s.from('product_assets').delete().eq('id', assetId)
      setImage(''); setImagePath(''); setAssetId(''); setKit(null); setMessage('Product photo removed.')
    } finally { setBusy(false) }
  }

  async function generate() {
    if (!image && !name) return setMessage('Upload a product photo or enter a product name.')
    setBusy(true); setMessage('')
    try {
      if (assetId) await createClient().from('product_assets').update({ status: 'processing' }).eq('id', assetId)
      const r = await fetch('/api/ai-generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ imageUrl: image, name, price, description: notes, features: features.split('\n').filter(Boolean) }) })
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Generation failed')
      setKit({ product: {}, en: {}, bn: {}, ...d.content }); setTab('captions')
      if (assetId) await createClient().from('product_assets').update({ status: 'ready' }).eq('id', assetId)
    } catch (e) {
      if (assetId) await createClient().from('product_assets').update({ status: 'failed' }).eq('id', assetId)
      setMessage(e instanceof Error ? e.message : 'Generation failed.')
    } finally { setBusy(false) }
  }

  function updateLang(field: string, value: string) { setKit(k => k ? { ...k, [lang]: { ...(k[lang] || {}), [field]: value } } : k) }
  function copy(text: string) { navigator.clipboard?.writeText(text); setMessage('Copied to clipboard.') }
  const content: any = kit?.[lang] || {}

  return <div className="mx-auto max-w-7xl">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-black uppercase tracking-[0.2em] text-teal">AI PRODUCT MARKETING STUDIO</p><h1 className="mt-2 text-4xl font-black tracking-tight">One photo. A complete sales kit.</h1><p className="mt-2 max-w-2xl text-brand/55">Upload one product photo, save it to your workspace, then generate sales captions, trustworthy specifications, hooks, CTAs and reel scripts.</p></div>
      <button onClick={generate} disabled={busy} className="rounded-2xl bg-teal px-6 py-3 font-black text-white shadow-sm disabled:opacity-50">{busy ? '✨ Working…' : '✨ Generate marketing kit'}</button>
    </div>

    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <section className="rounded-3xl border border-brand/10 bg-white p-5 shadow-sm">
        <div onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);const f=e.dataTransfer.files?.[0];if(f)upload(f)}} className={`rounded-2xl border-2 border-dashed p-3 transition ${dragging?'border-teal bg-sky/30':'border-brand/10 bg-beige/60'}`}>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)upload(f);e.currentTarget.value=''}} />
          <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-xl bg-sky/40">
            {image ? <><img src={image} alt="Product" className="h-56 w-full object-contain"/><button type="button" onClick={removeImage} disabled={busy} className="absolute right-3 top-3 rounded-xl bg-white/95 px-3 py-2 text-xs font-black shadow-sm">Remove</button></> : <button type="button" onClick={()=>inputRef.current?.click()} className="h-full w-full"><div className="text-5xl">📸</div><p className="mt-3 font-black">Drop product photo here</p><p className="mt-1 text-xs text-brand/45">or click to browse · JPG, PNG, WEBP · max 8 MB</p></button>}
          </div>
        </div>
        {image && <button type="button" onClick={()=>inputRef.current?.click()} disabled={busy} className="mt-3 w-full rounded-xl border border-brand/10 px-4 py-2.5 text-sm font-bold hover:bg-beige">Replace photo</button>}
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-bold">Product name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. M11 Bladeless Mini Fan" className="mt-2 w-full rounded-xl border border-brand/10 px-4 py-3 outline-none focus:border-teal"/></label>
          <label className="block text-sm font-bold">Price<input value={price} onChange={e=>setPrice(e.target.value)} placeholder="370" className="mt-2 w-full rounded-xl border border-brand/10 px-4 py-3 outline-none focus:border-teal"/></label>
          <label className="block text-sm font-bold">Seller notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Anything you know about the product…" className="mt-2 w-full rounded-xl border border-brand/10 px-4 py-3 outline-none focus:border-teal"/></label>
          <label className="block text-sm font-bold">Known features<span className="mt-1 block text-xs font-normal text-brand/45">One per line</span><textarea value={features} onChange={e=>setFeatures(e.target.value)} rows={4} placeholder="Portable\nUSB rechargeable\nQuiet operation" className="mt-2 w-full rounded-xl border border-brand/10 px-4 py-3 outline-none focus:border-teal"/></label>
        </div>
        {message && <div className="mt-4 rounded-xl bg-sky/50 px-4 py-3 text-sm font-semibold">{message}</div>}
      </section>

      <section className="min-w-0 rounded-3xl border border-brand/10 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand/10 p-5"><div className="flex gap-1 rounded-xl bg-beige p-1"><button onClick={()=>setTab('captions')} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab==='captions'?'bg-white shadow-sm':''}`}>📝 Captions</button><button onClick={()=>setTab('specs')} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab==='specs'?'bg-white shadow-sm':''}`}>📋 Specifications</button><button onClick={()=>setTab('kit')} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab==='kit'?'bg-white shadow-sm':''}`}>🎯 Marketing Kit</button></div><div className="flex rounded-xl bg-beige p-1"><button onClick={()=>setLang('en')} className={`rounded-lg px-4 py-2 text-xs font-bold ${lang==='en'?'bg-white shadow-sm':''}`}>English</button><button onClick={()=>setLang('bn')} className={`rounded-lg px-4 py-2 text-xs font-bold ${lang==='bn'?'bg-white shadow-sm':''}`}>বাংলা</button></div></div>
        {!kit ? <div className="grid min-h-[600px] place-items-center p-8 text-center"><div><div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-sky/60 text-4xl">✨</div><h2 className="mt-5 text-2xl font-black">Your sales content will appear here</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-brand/50">Upload one product photo, add anything you already know, and generate the first draft.</p></div></div> : <div className="p-6">{tab==='captions' && <div className="space-y-5"><Editable label="Sales headline" value={content.headline||''} onChange={v=>updateLang('headline',v)} onCopy={()=>copy(content.headline||'')}/><Editable area label="Sales caption" value={content.salesCaption||''} onChange={v=>updateLang('salesCaption',v)} onCopy={()=>copy(content.salesCaption||'')}/><Editable area label="Ad copy" value={content.adCopy||''} onChange={v=>updateLang('adCopy',v)} onCopy={()=>copy(content.adCopy||'')}/><div><div className="flex items-center justify-between"><label className="text-xs font-black uppercase tracking-wider text-brand/45">Hooks</label><button onClick={()=>copy((content.hooks||[]).join('\n'))} className="text-xs font-bold text-teal">Copy all</button></div><div className="mt-2 space-y-2">{(content.hooks||[]).map((h:string,i:number)=><input key={i} value={h} onChange={e=>{const a=[...(content.hooks||[])];a[i]=e.target.value;setKit(k=>k?{...k,[lang]:{...k[lang],hooks:a}}:k)}} className="w-full rounded-xl border border-brand/10 px-4 py-3"/>)}</div></div><Editable label="CTA" value={content.cta||''} onChange={v=>updateLang('cta',v)} onCopy={()=>copy(content.cta||'')}/></div>}{tab==='specs' && <div><div className="mb-5 rounded-2xl bg-beige p-4 text-sm"><strong>AI honesty check:</strong> specifications are marked as detected, provided, or needing confirmation. Review before publishing.</div><div className="grid gap-3 sm:grid-cols-2">{(kit.product?.specifications||[]).map((s,i)=><div key={i} className="rounded-2xl border border-brand/10 p-4"><div className="flex items-center justify-between gap-3"><span className="text-xs font-black uppercase tracking-wider text-brand/45">{s.label}</span><span className="rounded-full bg-sky px-2 py-1 text-[10px] font-black">{s.confidence}</span></div><input value={s.value||''} onChange={e=>setKit(k=>k?{...k,product:{...k.product,specifications:(k.product?.specifications||[]).map((x,j)=>j===i?{...x,value:e.target.value,confidence:'provided'}:x)}}:k)} className="mt-3 w-full rounded-xl border border-brand/10 px-3 py-2 font-semibold"/></div>)}</div>{!(kit.product?.specifications||[]).length&&<p className="py-16 text-center text-sm text-brand/45">No reliable specifications were detected. Add known features on the left and regenerate.</p>}</div>}{tab==='kit' && <div className="grid gap-4 md:grid-cols-2"><KitCard title="📝 Caption" text={content.salesCaption||''} onCopy={()=>copy(content.salesCaption||'')}/><KitCard title="🎯 Hooks" text={(content.hooks||[]).join('\n')} onCopy={()=>copy((content.hooks||[]).join('\n'))}/><KitCard title="🎬 Reel script" text={content.reelScript||''} onCopy={()=>copy(content.reelScript||'')}/><KitCard title="🛍️ Benefits" text={(content.benefits||[]).map((x:string)=>'• '+x).join('\n')} onCopy={()=>copy((content.benefits||[]).join('\n'))}/></div>}</div>}
      </section>
    </div>
  </div>
}

function Editable({label,value,onChange,onCopy,area=false}:{label:string;value:string;onChange:(v:string)=>void;onCopy:()=>void;area?:boolean}) { return <div><div className="flex items-center justify-between"><label className="text-xs font-black uppercase tracking-wider text-brand/45">{label}</label><button onClick={onCopy} className="text-xs font-bold text-teal">Copy</button></div>{area?<textarea value={value} onChange={e=>onChange(e.target.value)} rows={7} className="mt-2 w-full rounded-2xl border border-brand/10 p-4 leading-6 outline-none focus:border-teal"/>:<input value={value} onChange={e=>onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-brand/10 px-4 py-3 font-bold outline-none focus:border-teal"/>}</div> }
function KitCard({title,text,onCopy}:{title:string;text:string;onCopy:()=>void}) { return <div className="rounded-2xl border border-brand/10 p-5"><div className="flex items-center justify-between"><h3 className="font-black">{title}</h3><button onClick={onCopy} className="text-xs font-bold text-teal">Copy</button></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-brand/70">{text||'Not generated.'}</p></div> }
