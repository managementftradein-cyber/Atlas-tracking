import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminCrudList from '../crud-list'

export const dynamic = 'force-dynamic'

const KNOWN_KEYS = ['track','support','dashboard','login','signup','logout','about','locations','calculator','prohibited','blog','faqs','language']

export default async function AdminTranslations() {
  const db = await createClient()
  const { data: claimsData } = await db.auth.getClaims()
  if (!claimsData?.claims?.sub) redirect('/login?next=/admin/cms/translations')
  const { data: isAdmin } = await db.rpc('is_admin')
  if (!isAdmin) return <main className="grid min-h-[calc(100vh-70px)] place-items-center px-5"><div className="glass rounded-3xl p-10 text-center"><h1 className="text-2xl font-black">Admin access required</h1></div></main>

  const [{ data: rows }, { data: languages }] = await Promise.all([
    db.from('translations').select('*').order('lang_code'),
    db.from('languages').select('code').order('sort_order'),
  ])

  const langCodes = (languages || []).map(l => l.code)

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-cyanx">CMS</p>
      <h1 className="mt-2 text-4xl font-black">Translations</h1>
      <p className="mt-2 text-sm text-slate-500">One row per (language, key) pair. Standard keys used across the site: {KNOWN_KEYS.join(', ')}.</p>
      <AdminCrudList table="translations" rows={rows || []} fields={[
        { key: 'lang_code', label: 'Language', type: 'select', options: langCodes.length ? langCodes : ['en'] },
        { key: 'key', label: 'Key', type: 'select', options: KNOWN_KEYS },
        { key: 'value', label: 'Translated text' },
      ]} />
    </main>
  )
}
