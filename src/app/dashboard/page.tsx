'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      const s = createClient()
      const { data: { user } } = await s.auth.getUser()
      if (!user) return setLoading(false)
      const { data, error } = await s.from('products')
        .select('id,name,slug,image_url,status,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) setError(error.message)
      setProducts(data || [])
      setLoading(false)
    })()
  }, [])

  const recent = products.slice(0, 6)

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-teal">AI PRODUCT MARKETING STUDIO</p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">Turn product photos into sales content.</h1>
          <p className="mt-2 max-w-2xl text-brand/55">Upload one product photo and generate sales captions, product specifications, branded creatives, and ready-to-use marketing copy.</p>
        </div>
        <Link href="/dashboard/create" className="hidden rounded-xl bg-brand px-5 py-3 text-sm font-extrabold text-white sm:block">✨ Create</Link>
      </header>

      <section className="mt-8 overflow-hidden rounded-[2rem] bg-brand p-7 text-white md:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-sky">ONE PHOTO → COMPLETE SALES KIT</span>
            <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">Upload a product photo. Let AI do the selling work.</h2>
            <p className="mt-4 max-w-xl leading-7 text-white/65">Generate persuasive captions, structured specifications, hooks, CTAs, ad copy, and branded visual directions in English or বাংলা.</p>
            <Link href="/dashboard/create" className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 font-extrabold text-brand">✨ Generate Marketing Kit</Link>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-widest text-sky">Your output</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {['📝 Sales captions','📋 Full specifications','🎯 Hooks & CTAs','🖼️ Logo & text ideas','🎬 Reel scripts','🌐 English + বাংলা'].map(x => <div key={x} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold">{x}</div>)}
            </div>
          </div>
        </div>
      </section>

      {error && <div className="mt-4 rounded-xl bg-beige px-4 py-3 text-sm">{error}</div>}

      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <Metric label="Products analyzed" value={loading ? '—' : products.length} />
        <Metric label="Published products" value={loading ? '—' : products.filter(p => p.status === 'published').length} />
        <Metric label="Marketing workflow" value="AI ready" />
      </section>

      <section className="mt-7 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-3xl border border-brand/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <div><h3 className="text-xl font-black">Recent products</h3><p className="mt-1 text-sm text-brand/50">Continue creating content for your products.</p></div>
            <Link href="/dashboard/products" className="text-sm font-bold text-teal">View all →</Link>
          </div>
          <div className="mt-5 space-y-2">
            {recent.length ? recent.map(p => (
              <Link href="/dashboard/create" key={p.id} className="flex items-center gap-4 rounded-2xl p-3 hover:bg-beige">
                <div className="h-14 w-14 overflow-hidden rounded-xl bg-beige">{p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}</div>
                <div className="min-w-0 flex-1"><p className="truncate font-bold">{p.name}</p><p className="text-xs capitalize text-brand/45">{p.status || 'draft'}</p></div>
                <span className="text-sm font-bold text-teal">Create content →</span>
              </Link>
            )) : <div className="rounded-2xl bg-beige p-8 text-center text-sm text-brand/50">No products yet. Start with one photo.</div>}
          </div>
        </div>

        <div className="rounded-3xl border border-brand/10 bg-white p-6">
          <h3 className="text-xl font-black">What can you create?</h3>
          <div className="mt-5 space-y-3">
            <Action href="/dashboard/create" icon="📝" title="Sales captions" text="Facebook, Instagram, WhatsApp and ad copy" />
            <Action href="/dashboard/create" icon="📋" title="Specifications" text="Organized product details and benefits" />
            <Action href="/dashboard/editor" icon="🖼️" title="Creative Studio" text="Plan logo, price and promotional text placement" />
            <Action href="/dashboard/settings" icon="🏷️" title="Brand Kit" text="Save your brand voice, logo and colors" />
          </div>
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-brand/10 bg-white p-5"><p className="text-sm font-semibold text-brand/50">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>
}

function Action({ href, icon, title, text }: { href: string; icon: string; title: string; text: string }) {
  return <Link href={href} className="flex gap-3 rounded-2xl bg-beige p-4 hover:bg-sky/50"><span className="text-xl">{icon}</span><div><p className="font-black">{title}</p><p className="mt-1 text-xs leading-5 text-brand/50">{text}</p></div></Link>
}
