'use client'

import { useEffect, useRef, useState } from 'react'

type Template = { id: string; name: string; badge: string }
const templates: Template[] = [
  { id: 'sale', name: 'Sale', badge: 'SALE' },
  { id: 'launch', name: 'Launch', badge: 'NEW ARRIVAL' },
  { id: 'best', name: 'Best Seller', badge: 'BEST SELLER' },
  { id: 'limited', name: 'Limited', badge: 'LIMITED STOCK' },
  { id: 'offer', name: 'Offer', badge: 'LAUNCH OFFER' },
]

export default function CreativeStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState('')
  const [logo, setLogo] = useState('')
  const [title, setTitle] = useState('YOUR PRODUCT')
  const [price, setPrice] = useState('')
  const [discount, setDiscount] = useState('')
  const [cta, setCta] = useState('ORDER NOW')
  const [badge, setBadge] = useState('SALE')
  const [primary, setPrimary] = useState('#2F4156')
  const [accent, setAccent] = useState('#567C8D')
  const [template, setTemplate] = useState('sale')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const kit = localStorage.getItem('scommerce_marketing_kit')
    const product = localStorage.getItem('scommerce_analyzed_product')
    if (product) {
      try { const p = JSON.parse(product); setTitle(p.name || 'YOUR PRODUCT') } catch {}
    }
    if (kit) {
      try { const k = JSON.parse(kit); const c = k.content || {}; setTitle(c.headline || title); setCta(c.cta || 'ORDER NOW') } catch {}
    }
  }, [])

  useEffect(() => { draw() }, [image, logo, title, price, discount, cta, badge, primary, accent, template])

  function loadFile(file: File, setter: (v: string) => void) {
    if (!file.type.startsWith('image/')) return setMessage('Please select an image file.')
    if (file.size > 8 * 1024 * 1024) return setMessage('Image must be 8 MB or smaller.')
    const r = new FileReader(); r.onload = () => setter(String(r.result)); r.readAsDataURL(file)
  }

  function draw() {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const W = 1080, H = 1080; canvas.width = W; canvas.height = H
    ctx.fillStyle = '#F5EFEB'; ctx.fillRect(0, 0, W, H)
    const grad = ctx.createLinearGradient(0, 0, W, H); grad.addColorStop(0, primary); grad.addColorStop(1, accent)
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, 300)
    ctx.fillStyle = '#FFFFFF'; ctx.font = '900 54px Arial'; ctx.fillText(title.slice(0, 28), 70, 105)
    ctx.font = '900 28px Arial'; ctx.fillText(badge, 70, 160)
    if (logo) { const li = new Image(); li.onload = () => { const scale = Math.min(180 / li.width, 90 / li.height); ctx.drawImage(li, W - li.width * scale - 65, 55, li.width * scale, li.height * scale) }; li.src = logo }
    const drawProduct = (src: string) => { const pi = new Image(); pi.onload = () => { const maxW = 760, maxH = 600; const s = Math.min(maxW/pi.width, maxH/pi.height); const w=pi.width*s,h=pi.height*s; ctx.drawImage(pi,(W-w)/2,335+(maxH-h)/2,w,h); drawText(ctx,W,H) }; pi.src=src }
    const drawText = (ctx: CanvasRenderingContext2D, W: number, H: number) => { ctx.fillStyle = primary; ctx.font='900 48px Arial'; if(price) ctx.fillText(`৳${price}`,70,1010); if(discount){ctx.fillStyle=accent;ctx.font='900 32px Arial';ctx.fillText(`${discount}% OFF`,70,1050)} ctx.fillStyle='#FFFFFF';ctx.fillRect(W-300,960,230,70);ctx.fillStyle=primary;ctx.font='900 28px Arial';ctx.fillText(cta.slice(0,16),W-275,1005) }
    if (image) drawProduct(image); else drawText(ctx,W,H)
  }

  function download() { const c=canvasRef.current; if(!c) return; const a=document.createElement('a'); a.download='scommerce-creative.png'; a.href=c.toDataURL('image/png'); a.click(); setMessage('Creative downloaded.') }
  function choose(t: Template) { setTemplate(t.id); setBadge(t.badge) }

  return <main className="mx-auto max-w-7xl">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-teal">STEP 6 · CREATIVE STUDIO</p><h1 className="mt-2 text-4xl font-black tracking-tight">Turn your product into a ready-to-post creative.</h1><p className="mt-2 max-w-2xl text-brand/55">Add your product image, logo, offer and call-to-action. Preview the design live, then export a PNG.</p></div><button onClick={download} className="rounded-2xl bg-teal px-6 py-3 font-black text-white">↓ Download PNG</button></div>
    {message && <div className="mb-5 rounded-2xl bg-sky/50 px-4 py-3 text-sm font-semibold">{message}</div>}
    <div className="grid gap-6 xl:grid-cols-[330px_1fr_280px]">
      <section className="rounded-3xl border border-brand/10 bg-white p-5 shadow-sm"><h2 className="font-black">Content</h2><div className="mt-4 space-y-4"><Field label="Product image"><input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)loadFile(f,setImage)}} className="w-full text-sm"/></Field><Field label="Logo"><input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)loadFile(f,setLogo)}} className="w-full text-sm"/></Field><Field label="Headline"><input value={title} onChange={e=>setTitle(e.target.value)} className="input"/></Field><Field label="Price"><input value={price} onChange={e=>setPrice(e.target.value)} placeholder="370" className="input"/></Field><Field label="Discount"><input value={discount} onChange={e=>setDiscount(e.target.value)} placeholder="45" className="input"/></Field><Field label="CTA"><input value={cta} onChange={e=>setCta(e.target.value)} className="input"/></Field><Field label="Badge"><input value={badge} onChange={e=>setBadge(e.target.value)} className="input"/></Field></div></section>
      <section className="rounded-3xl border border-brand/10 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-black">Live Preview</h2><span className="text-xs font-bold text-brand/40">1080 × 1080</span></div><div className="mt-4 flex min-h-[680px] items-center justify-center rounded-2xl bg-beige p-5"><canvas ref={canvasRef} className="h-auto max-h-[650px] w-full max-w-[650px] rounded-xl shadow-lg"/></div></section>
      <section className="rounded-3xl border border-brand/10 bg-white p-5 shadow-sm"><h2 className="font-black">Templates</h2><div className="mt-4 grid grid-cols-2 gap-2">{templates.map(t=><button key={t.id} onClick={()=>choose(t)} className={`rounded-xl border px-3 py-3 text-xs font-black ${template===t.id?'border-teal bg-sky/40':'border-brand/10'}`}>{t.name}</button>)}</div><h2 className="mt-7 font-black">Brand colors</h2><div className="mt-4 space-y-3"><ColorField label="Primary" value={primary} onChange={setPrimary}/><ColorField label="Accent" value={accent} onChange={setAccent}/></div><div className="mt-7 rounded-2xl bg-beige p-4 text-xs leading-5 text-brand/55">Tip: upload a transparent PNG logo for the cleanest result. This MVP exports a square social creative at 1080×1080.</div></section>
    </div>
  </main>
}
function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="block text-sm font-bold">{label}<div className="mt-2">{children}</div></label> }
function ColorField({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) { return <label className="flex items-center justify-between gap-3 text-sm font-bold">{label}<div className="flex items-center gap-2"><input type="color" value={value} onChange={e=>onChange(e.target.value)} className="h-9 w-12 rounded-lg border-0"/><input value={value} onChange={e=>onChange(e.target.value)} className="w-24 rounded-lg border border-brand/10 px-2 py-2 text-xs"/></div></label> }
