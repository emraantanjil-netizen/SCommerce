import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <div className="min-h-screen bg-beige text-brand"><header className="sticky top-0 z-20 border-b border-brand/5 bg-white/95 backdrop-blur"><div className="flex h-16 items-center justify-between px-5 md:px-8"><Link href="/dashboard" className="text-xl font-black">SCommerce<span className="text-teal"> AI</span></Link><div className="flex items-center gap-4"><span className="hidden text-sm text-brand/55 md:block">{user.email}</span><form action="/auth/signout" method="post"><button className="rounded-xl border border-brand/10 px-3 py-2 text-sm font-bold">Sign out</button></form></div></div></header><div className="mx-auto grid max-w-[1500px] lg:grid-cols-[230px_1fr]"><aside className="hidden border-r border-brand/5 bg-white p-5 lg:block"><nav className="space-y-1 text-sm font-bold"><Link className="block rounded-xl px-4 py-3 hover:bg-beige" href="/dashboard">Overview</Link><Link className="block rounded-xl px-4 py-3 hover:bg-beige" href="/dashboard/products">Products</Link><Link className="block rounded-xl px-4 py-3 hover:bg-beige" href="/dashboard/create">✨ AI Generator</Link><Link className="block rounded-xl px-4 py-3 hover:bg-beige" href="/dashboard/orders">Orders</Link><Link className="block rounded-xl px-4 py-3 hover:bg-beige" href="/dashboard/editor">Page Editor</Link></nav></aside><main className="min-w-0 p-5 md:p-8">{children}</main></div></div>
}
