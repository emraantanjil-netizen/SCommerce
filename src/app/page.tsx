import Link from 'next/link';

const steps = [
  ['01', 'Upload product', 'Drop one product photo and a few details.'],
  ['02', 'Generate with AI', 'SCommerce creates the copy, offer and page structure.'],
  ['03', 'Edit & publish', 'Fine-tune the page, then share your live checkout link.'],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-beige text-brand">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link href="/" className="text-xl font-black tracking-tight">SCommerce<span className="text-teal"> AI</span></Link>
        <div className="hidden items-center gap-8 text-sm font-semibold md:flex"><a href="#how">How it works</a><a href="#features">Features</a></div>
        <div className="flex items-center gap-2"><Link href="/login" className="rounded-xl px-4 py-2 text-sm font-bold">Log in</Link><Link href="/dashboard" className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-sm">Dashboard</Link></div>
      </nav>

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-12 md:px-8 md:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/10 bg-white px-4 py-2 text-xs font-extrabold tracking-widest text-teal">AI PRODUCT PAGE GENERATOR</div>
            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">Create a product page <span className="text-teal">from one photo.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-brand/65 md:text-xl">Upload your product. Let AI write the selling copy. Edit the design visually. Publish a page that is ready to collect orders.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/dashboard/create" className="rounded-2xl bg-brand px-7 py-4 text-center font-extrabold text-white shadow-xl shadow-brand/15">✨ Generate with AI</Link><Link href="/dashboard" className="rounded-2xl border border-brand/10 bg-white px-7 py-4 text-center font-extrabold">Open dashboard</Link></div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-brand/60"><span className="rounded-full bg-white px-4 py-2">English + বাংলা</span><span className="rounded-full bg-white px-4 py-2">Mobile-first</span><span className="rounded-full bg-white px-4 py-2">COD ready</span></div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-sky/60 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white bg-white p-3 shadow-2xl">
              <div className="rounded-[1.5rem] bg-brand p-5 text-white">
                <div className="flex items-center justify-between text-xs"><span className="font-bold">SCommerce AI</span><span className="rounded-full bg-white/10 px-3 py-1">LIVE PREVIEW</span></div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex min-h-64 items-center justify-center rounded-2xl bg-sky"><div className="text-7xl">🛍️</div></div>
                  <div className="flex flex-col justify-center"><span className="text-xs font-bold uppercase tracking-widest text-sky">Limited offer</span><h2 className="mt-3 text-3xl font-black">Premium Mini Fan</h2><p className="mt-3 text-sm text-white/65">AI-generated product copy, benefits and checkout-ready CTA.</p><div className="mt-5 flex items-end gap-3"><span className="text-3xl font-black">৳370</span><span className="text-sm text-white/50 line-through">৳672</span></div><button className="mt-5 rounded-xl bg-white px-5 py-3 font-extrabold text-brand">Order now →</button></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-brand/5 bg-white"><div className="mx-auto max-w-7xl px-5 py-16 md:px-8"><div className="max-w-2xl"><p className="text-xs font-extrabold tracking-widest text-teal">HOW IT WORKS</p><h2 className="mt-3 text-3xl font-black md:text-4xl">Upload → AI → Edit → Publish</h2></div><div className="mt-10 grid gap-4 md:grid-cols-3">{steps.map(([n,t,d])=><div key={n} className="rounded-3xl border border-brand/10 bg-beige p-7"><span className="text-sm font-black text-teal">{n}</span><h3 className="mt-5 text-xl font-black">{t}</h3><p className="mt-2 leading-7 text-brand/60">{d}</p></div>)}</div></div></section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-16 md:px-8"><div className="rounded-[2rem] bg-brand p-8 text-white md:p-12"><div className="grid gap-10 md:grid-cols-2"><div><p className="text-xs font-extrabold tracking-widest text-sky">BUILT FOR SELLERS</p><h2 className="mt-3 text-3xl font-black md:text-4xl">Everything between a product photo and an order.</h2></div><div className="grid grid-cols-2 gap-3 text-sm font-semibold"><div className="rounded-2xl bg-white/10 p-4">AI copy</div><div className="rounded-2xl bg-white/10 p-4">Visual editor</div><div className="rounded-2xl bg-white/10 p-4">Public pages</div><div className="rounded-2xl bg-white/10 p-4">Order capture</div></div></div></div></section>
    </main>
  );
}
