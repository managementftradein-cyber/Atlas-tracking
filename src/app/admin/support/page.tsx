import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatusPulse from '@/components/StatusPulse'
import AdminSupportList from './list'

export const dynamic = 'force-dynamic'

export default async function AdminSupportPage() {
  const db = await createClient()
  const { data: claimsData } = await db.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) redirect('/login?next=/admin/support')

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

  const { data: tickets, error } = await db.from('support_tickets').select('*').order('created_at', { ascending: false })

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <StatusPulse label="Atlas Tracking control center" />
      <p className="mt-5 text-cyanx font-bold tracking-[.2em] text-xs">SUPPORT</p>
      <h1 className="mt-2 text-4xl font-black sm:text-5xl">Customer Support</h1>
      <p className="mt-3 text-slate-400">Respond to messages sent from the customer support page.</p>

      {error ? (
        <div className="glass mt-8 rounded-2xl p-5 text-sm text-red-200">Tickets could not be loaded: {error.message}</div>
      ) : (
        <AdminSupportList rows={tickets || []} />
      )}
    </main>
  )
}
