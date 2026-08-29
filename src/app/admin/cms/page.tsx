import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusPulse from '@/components/StatusPulse'
import CmsContentForm from './content-form'

export const dynamic = 'force-dynamic'

export default async function AdminCms() {
  const db = await createClient()
  const { data: claimsData } = await db.auth.getClaims()
  const userId = claimsData?.claims?.sub
  if (!userId) redirect('/login?next=/admin/cms')

  const { data: isAdmin, error: adminError } = await db.rpc('is_admin')
  if (adminError || !isAdmin) {
    return (
      <main className="grid min-h-[calc(100vh-70px)] place-items-center px-5">
        <div className="glass rounded-3xl p-10 text-center">
          <h1 className="text-2xl font-black">Admin access required</h1>
          <p className="mt-2 text-slate-400">This signed-in account is not an Atlas Tracking administrator.</p>
        </div>
      </main>
    )
  }

  const { data: content, error } = await db.from('site_content').select('*').order('key')

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <StatusPulse label="Atlas Tracking control center" />
      <p className="mt-5 text-cyanx font-bold tracking-[.2em] text-xs">CMS</p>
      <h1 className="mt-2 text-4xl font-black sm:text-5xl">Website Content</h1>
      <p className="mt-3 text-slate-400">Edit the text and pages shown across the public site.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/cms/faqs" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/5">Manage FAQs</Link>
        <Link href="/admin/cms/prohibited-items" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/5">Manage Prohibited Items</Link>
        <Link href="/admin/cms/locations" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/5">Manage Locations</Link>
        <Link href="/admin/cms/blog" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/5">Manage Blog</Link>
        <Link href="/admin/cms/rates" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/5">Manage Shipping Rates</Link>
        <Link href="/admin/cms/languages" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/5">Manage Languages</Link>
        <Link href="/admin/cms/translations" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/5">Manage Translations</Link>
      </div>

      {error ? (
        <div className="glass mt-8 rounded-2xl p-5 text-sm text-red-200">Content could not be loaded: {error.message}</div>
      ) : (
        <CmsContentForm rows={content || []} />
      )}
    </main>
  )
}
