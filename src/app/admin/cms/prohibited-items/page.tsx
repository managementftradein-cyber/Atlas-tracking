import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminCrudList from '../crud-list'

export const dynamic = 'force-dynamic'

export default async function AdminProhibitedItems() {
  const db = await createClient()
  const { data: claimsData } = await db.auth.getClaims()
  if (!claimsData?.claims?.sub) redirect('/login?next=/admin/cms/prohibited-items')
  const { data: isAdmin } = await db.rpc('is_admin')
  if (!isAdmin) return <main className="grid min-h-[calc(100vh-70px)] place-items-center px-5"><div className="glass rounded-3xl p-10 text-center"><h1 className="text-2xl font-black">Admin access required</h1></div></main>

  const { data: rows } = await db.from('prohibited_items').select('*').order('sort_order')

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-cyanx">CMS</p>
      <h1 className="mt-2 text-4xl font-black">Prohibited Items</h1>
      <AdminCrudList table="prohibited_items" rows={rows || []} fields={[
        { key: 'item', label: 'Item' },
        { key: 'note', label: 'Note', type: 'textarea' },
        { key: 'sort_order', label: 'Sort order', type: 'number' },
      ]} />
    </main>
  )
}
