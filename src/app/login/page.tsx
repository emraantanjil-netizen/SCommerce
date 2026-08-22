'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login'|'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setMessage('')
    try {
      const supabase = createClient()
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
        if (error) throw error
        setMessage('Account created. Check your email if confirmation is enabled, then log in.')
        setMode('login')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard'); router.refresh()
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Something went wrong.') }
    finally { setLoading(false) }
  }

  return <main className="min-h-screen bg-beige px-5 py-10 text-brand"><div className="mx-auto flex min-h-[80vh] max-w-md items-center"><div className="w-full rounded-[2rem] bg-white p-7 shadow-xl md:p-9"><div className="text-center"><a href="/" className="text-2xl font-black">SCommerce<span className="text-teal"> AI</span></a><h1 className="mt-8 text-3xl font-black">{mode === 'login' ? 'Welcome back' : 'Create your store account'}</h1><p className="mt-2 text-sm text-brand/55">{mode === 'login' ? 'Build and publish product pages faster.' : 'Start creating product pages with AI.'}</p></div><form onSubmit={submit} className="mt-8 space-y-4">{mode === 'signup' && <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full rounded-xl border border-brand/10 px-4 py-3 outline-none focus:border-teal"/>}<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-xl border border-brand/10 px-4 py-3 outline-none focus:border-teal"/><input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-brand/10 px-4 py-3 outline-none focus:border-teal"/>{message && <div className="rounded-xl bg-sky/40 px-4 py-3 text-sm">{message}</div>}<button disabled={loading} className="w-full rounded-xl bg-brand px-4 py-3.5 font-extrabold text-white disabled:opacity-50">{loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button></form><button onClick={()=>{setMode(mode==='login'?'signup':'login');setMessage('')}} className="mt-5 w-full text-sm font-bold text-teal">{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}</button></div></div></main>
}
