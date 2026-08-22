'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const tones = ['sales', 'premium', 'friendly', 'urgent', 'professional', 'minimal']
const fonts = ['Inter', 'Poppins', 'Manrope', 'Roboto', 'Playfair Display']

export default function BrandKitPage() {
  const [id, setId] = useState('')
  const [brandName, setBrandName] = useState('')
  const [tagline, setTagline] = useState('')
  const [logo, setLogo] = useState('')
  const [primary, setPrimary] = useState('#2F4156')
  const [secondary, setSecondary] = useState('#C8D9E6')
  const [font, setFont] = useState('Inter')
  const [cta, setCta] = useState('Order Now')
  const [tone, setTone] = useState('sales')
  const [language, setLanguage] = useState('both')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const s = createClient(); const { data: { user } } = await s.auth.getUser()
    if (!user) return
    const { data } = await s.from('store_settings').select('*').eq('user_id', user.id).limit(1).maybeSingle()
    if (!data) return
    setId(data.id); setBrandName(data.brand_name || data.store_name || ''); setTagline(data.brand_tagline || ''); setLogo(data.logo_url || '')
    setPrimary(data.primary_color || '#2F4156'); setSecondary(data.secondary_color || '#C8D9E6'); setFont(data.brand_font || 'Inter')
    setCta(data.default_cta || 'Order Now'); setTone(data.default_tone || 'sales'); setLanguage(data.default_language || 'both')
  }

  async function uploadLogo(file: File) {
    if (!file.type.startsWith('image/')) return setMessage('Please select an image.')
    if (file.size > 5 * 1024 * 1024) return setMessage('Logo must be 5 MB or smaller.')
    const s = createClient(); const { data: { user } } = await s.auth.getUser(); if (!user) return
    setSaving(true)
    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
      const path = `${user.id}/brand-logo-${crypto.randomUUID()}.${ext}`
      const { error } = await s.storage.from('product-images').upload(path, file, { contentType: file.type })
      if (error) throw error
      setLogo(s.storage.from('product-images').getPublicUrl(path).data.publicUrl)
      setMessage('Logo uploaded. Save Brand Kit to apply it.')
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Logo upload failed.') } finally { setSaving(false) }
  }

  async function save() {
    setSaving(true); setMessage('')
    try {
      const s = createClient(); const { data: { user } } = await s.auth.getUser(); if (!user) throw new Error('Please log in again.')
      const payload = { brand_name: brandName, brand_tagline: tagline, logo_url: logo, primary_color: primary, secondary_color: secondary, brand_font: font, default_cta: cta, default_tone: tone, default_language: language, updated_at: new Date().toISOString() }
      if (id) { const { error } = await s.from('store_settings').update(payload).eq('id', id); if (error) throw error }
      else { const { data, error } = await s.from('store_settings').insert({ ...payload, user_id: user.id }).select('id').single(); if (error) throw error; setId(data.id) }
      localStorage.setItem('scommerce_brand_kit', JSON.stringify(payload)); setMessage('Brand Kit saved and ready for future generations.')
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not save Brand Kit.') } finally { setSaving(false) }
  }

  return <main className="mx-auto max-w-6xl"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-teal">STEP 7 · BRAND KIT</p><h1 className="mt-2 text-4xl font-black tracking-tight">Make every generation feel like your brand.</h1><p className="mt-2 max-w-2xl text-brand/55">Save your identity once. SCommerce can use these defaults for future AI copy and creative generation.</p></div><button onClick={save} disabled={saving} className="rounded-2xl bg-teal px-6 py-3 font-black text-white disabled:opacity-50">{saving?'Saving…':'Save Brand Kit'}</button></div>{message&&<div className="mb-5 rounded-2xl bg-sky/50 px-4 py-3 text-sm font-semibold">{message}</div>}
  <div className="grid gap-6 lg:grid-cols-[1fr_360px]"><section className="rounded-3xl border border-brand/10 bg-white p-6 shadow-sm"><div className="grid gap-5 md:grid-cols-2"><Field label="Brand name"><input value={brandName} onChange={e=>setBrandName(e.target.value)} className="input" placeholder="LittleBae"/></Field><Field label="Tagline"><input value={tagline} onChange={e=>setTagline(e.target.value)} className="input" placeholder="Made for everyday moments"/></Field><Field label="Logo"><input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)uploadLogo(f)}} className="w-full text-sm"/>{logo&&<img src={logo} alt="Brand logo" className="mt-3 h-16 max-w-40 rounded-xl border border-brand/10 object-contain p-2"/>}</Field><Field label="Default CTA"><input value={cta} onChange={e=>setCta(e.target.value)} className="input"/></Field><Field label="Writing tone"><select value={tone} onChange={e=>setTone(e.target.value)} className="input">{tones.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Default language"><select value={language} onChange={e=>setLanguage(e.target.value)} className="input"><option value="both">English + বাংলা</option><option value="en">English</option><option value="bn">বাংলা</option></select></Field><Field label="Brand font"><select value={font} onChange={e=>setFont(e.target.value)} className="input">{fonts.map(x=><option key={x}>{x}</option>)}</select></Field></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><Color label="Primary" value={primary} set={setPrimary}/><Color label="Secondary" value={secondary} set={setSecondary}/></div></section>
  <aside className="rounded-3xl border border-brand/10 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-brand/40">Live brand preview</p><div className="mt-4 overflow-hidden rounded-2xl" style={{fontFamily:font}}><div className="p-6 text-white" style={{background:primary}}>{logo?<img src={logo} alt="Logo" className="mb-5 h-12 max-w-32 object-contain"/>:<div className="mb-5 text-2xl font-black">{brandName||'Your Brand'}</div>}<div className="text-2xl font-black">Your product.<br/>Your brand.</div><p className="mt-2 text-sm opacity-80">{tagline||'Your tagline appears here.'}</p></div><div className="p-5" style={{background:secondary}}><div className="rounded-xl bg-white px-4 py-3 text-center font-black" style={{color:primary}}>{cta}</div><p className="mt-3 text-center text-xs font-bold" style={{color:primary}}>Tone: {tone} · {language==='both'?'English + বাংলা':language}</p></div></div></aside></div></main>
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block text-sm font-bold">{label}<div className="mt-2">{children}</div></label>}
function Color({label,value,set}:{label:string;value:string;set:(v:string)=>void}){return <label className="flex items-center justify-between rounded-2xl border border-brand/10 p-4 text-sm font-bold">{label}<span className="flex gap-2"><input type="color" value={value} onChange={e=>set(e.target.value)} className="h-9 w-12"/><input value={value} onChange={e=>set(e.target.value)} className="w-24 rounded-lg border border-brand/10 px-2 py-2 text-xs"/></span></label>}
