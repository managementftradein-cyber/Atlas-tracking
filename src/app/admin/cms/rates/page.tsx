import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminCrudList from '../crud-list'

export const dynamic = 'force-dynamic'

export default async function AdminRates() {
  const db = await createClient()
  const { data: claimsData } = await db.auth.getClaims()
  if (!claimsData?.claims?.sub) redirect('/login?next=/admin/cms/rates')
  const { data: isAdmin } = await db.rpc('is_admin')
  if (!isAdmin) return <main className="grid min-h-[calc(100vh-70px)] place-items-center px-5"><div className="glass rounded-3xl p-10 text-center"><h1 className="text-2xl font-black">Admin access required</h1></div></main>

  const { data: rows } = await db.from('shipping_rates').select('*').order('base_price')

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-cyanx">CMS</p>
      <h1 className="mt-2 text-4xl font-black">Shipping Rates</h1>
      <p className="mt-2 text-sm text-slate-500">These power the public Shipping Price Calculator. Only rates marked Active are shown to customers.</p>
      <AdminCrudList table="shipping_rates" rows={rows || []} fields={[
        { key: 'shipping_type', label: 'Type', type: 'select', options: ['standard', 'express', 'priority'] },
        { key: 'base_price', label: 'Base price ($)', type: 'number' },
        { key: 'price_per_kg', label: 'Price per kg ($)', type: 'number' },
        { key: 'estimated_days_min', label: 'Estimated days (min)', type: 'number' },
        { key: 'estimated_days_max', label: 'Estimated days (max)', type: 'number' },
        { key: 'active', label: 'Active', type: 'boolean' },
      ]} />
    </main>
  )
}
