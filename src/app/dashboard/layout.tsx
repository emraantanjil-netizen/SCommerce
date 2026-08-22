import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('onboarding_completed').eq('id', user.id).maybeSingle()
  if (!profile?.onboarding_completed) redirect('/onboarding')
  return <div className="min-h-screen bg-beige text-brand">
    <header className="sticky top-0 z-30 border-b border-brand/10 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-black tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">S</span>SCommerce<span className="text-teal">AI</span></Link>
        <div className="flex items-center gap-3"><Link href="/dashboard/create" className="hidden rounded-xl bg-teal px-4 py-2 text-sm font-black text-white sm:block">✨ Create with AI</Link><span className="hidden max-w-48 truncate text-sm text-brand/50 md:block">{user.email}</span><form action="/auth/signout" method="post"><button className="rounded-xl border border-brand/10 bg-white px-3 py-2 text-sm font-bold hover:bg-beige">Sign out</button></form></div>
      </div>
    </header>
    <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[240px_1fr]">
      <aside className="hidden min-h-[calc(100vh-4rem)] border-r border-brand/10 bg-white p-5 lg:block">
        <p className="mb-4 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">AI Product Marketing Studio</p>
        <nav className="space-y-1 text-sm font-bold">
          <Nav href="/dashboard" icon="⌂" label="Dashboard" />
          <Nav href="/dashboard/create" icon="✨" label="Create with AI" primary />
          <Nav href="/dashboard/products" icon="📦" label="Product Library" />
          <Nav href="/dashboard/studio" icon="📝" label="Sales Content" />
          <Nav href="/dashboard/studio" icon="🎨" label="Creative Studio" />
          <Nav href="/dashboard/settings" icon="🏷️" label="Brand Kit" />
          <div className="my-5 border-t border-brand/10" />
          <Nav href="/dashboard/products" icon="📊" label="Usage & History" />
          <Nav href="/dashboard/settings" icon="⚙️" label="Settings" />
        </nav>
        <div className="mt-8 rounded-2xl bg-brand p-4 text-white"><p className="text-xs font-black text-sky">ONE PHOTO → COMPLETE SALES KIT</p><p className="mt-2 text-sm font-semibold leading-5 text-white/70">Turn product photos into content that sells.</p><Link href="/dashboard/create" className="mt-4 block rounded-xl bg-white px-3 py-2 text-center text-xs font-black text-brand">Start creating →</Link></div>
      </aside>
      <main className="min-w-0 p-4 pb-24 md:p-8 lg:pb-8">{children}</main>
    </div>
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-brand/10 bg-white/95 p-2 backdrop-blur lg:hidden"><Mobile href="/dashboard" icon="⌂" label="Home"/><Mobile href="/dashboard/products" icon="📦" label="Library"/><Mobile href="/dashboard/create" icon="✨" label="Create"/><Mobile href="/dashboard/settings" icon="🏷️" label="Brand"/></nav>
  </div>
}
function Nav({href,icon,label,primary=false}:{href:string;icon:string;label:string;primary?:boolean}){return <Link href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${primary?'bg-sky/60 text-brand':'hover:bg-beige'}`}><span className="w-5 text-center">{icon}</span>{label}</Link>}
function Mobile({href,icon,label}:{href:string;icon:string;label:string}){return <Link href={href} className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-black"><span className="text-lg">{icon}</span>{label}</Link>}
