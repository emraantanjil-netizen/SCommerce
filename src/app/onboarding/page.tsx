'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const [workspaceName, setWorkspaceName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      const name = workspaceName.trim() || 'My SCommerce Workspace'
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: String(user.user_metadata?.full_name || ''),
        workspace_name: name,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      if (upsertError) throw upsertError

      const { error: settingsError } = await supabase.from('store_settings').upsert({
        user_id: user.id,
        store_name: name,
        default_language: 'en',
        currency: 'BDT',
      }, { onConflict: 'user_id' })
      if (settingsError) throw settingsError

      router.replace('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create workspace.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-beige px-5 py-10 text-brand">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center">
        <div className="w-full rounded-[2rem] bg-white p-8 shadow-xl md:p-10">
          <div className="mb-8">
            <div className="text-2xl font-black">SCommerce<span className="text-teal"> AI</span></div>
            <div className="mt-8 inline-flex rounded-full bg-sky/50 px-3 py-1 text-xs font-black uppercase tracking-wider">Step 1 · Workspace setup</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight">Create your marketing workspace</h1>
            <p className="mt-2 text-sm leading-6 text-brand/60">Give your workspace a name. You can change it later from Brand Kit.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold">Workspace name</label>
              <input
                autoFocus
                required
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                placeholder="e.g. LittleBae Marketing"
                className="w-full rounded-2xl border border-brand/10 px-4 py-3.5 outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/10"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['📸', 'Product photos'],
                ['✨', 'AI sales content'],
                ['🎨', 'Branded creatives'],
              ].map(([icon, label]) => (
                <div key={label} className="rounded-2xl bg-beige p-4 text-center">
                  <div className="text-xl">{icon}</div>
                  <div className="mt-2 text-xs font-bold">{label}</div>
                </div>
              ))}
            </div>

            {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

            <button disabled={loading} className="w-full rounded-2xl bg-brand px-5 py-4 font-extrabold text-white shadow-lg shadow-brand/10 transition hover:-translate-y-0.5 disabled:opacity-50">
              {loading ? 'Creating workspace…' : 'Create workspace →'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
