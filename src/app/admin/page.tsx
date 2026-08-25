import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatusPulse from '@/components/StatusPulse'
import AdminShipments from './shipments'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const db = await createClient()
  const { data: claimsData } = await db.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) redirect('/login?next=/admin')

  const { data: isAdmin, error: adminError } = await db.rpc('is_admin')
  if (adminError) {
    return (
      <main className="grid min-h-[calc(100vh-70px)] place-items-center px-5">
        <div className="glass w-full max-w-2xl rounded-3xl p-8">
          <StatusPulse label="Atlas Tracking" />
          <h1 className="mt-5 text-2xl font-black">Admin authorization needs attention</h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">The signed-in session is valid, but the database authorization function could not be called.</p>
          <pre className="mt-4 overflow-auto rounded-xl bg-black/30 p-4 text-xs text-red-200">{adminError.message}</pre>
          <p className="mt-5 text-sm text-slate-400">Run <b>supabase/admin_setup.sql</b> once in the Supabase SQL Editor.</p>
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="grid min-h-[calc(100vh-70px)] place-items-center px-5">
        <div className="glass rounded-3xl p-10 text-center">
          <h1 className="text-2xl font-black">Admin access required</h1>
          <p className="mt-2 text-slate-400">This signed-in account is not an Atlas Tracking administrator.</p>
          <Link href="/dashboard" className="mt-6 inline-block rounded-xl bg-cyanx px-5 py-3 font-bold text-[#03101b]">Return to dashboard</Link>
        </div>
      </main>
    )
  }

  const { data: shipments, error } = await db.from('shipments').select('*').order('created_at', { ascending: false })

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <StatusPulse label="Atlas Tracking control center" />
          <p className="mt-5 text-cyanx font-bold tracking-[.2em] text-xs">OPERATIONS</p>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">Admin Dashboard</h1>
          <p className="mt-3 text-slate-400">Manage shipments, locations, delivery status and tracking visibility.</p>
        </div>
        <Link href="/dashboard/shipments/new" className="rounded-xl bg-cyanx px-5 py-3 text-center font-bold text-[#03101b]">+ Create Shipment</Link>
      </div>

      {error ? (
        <div className="glass mt-8 rounded-2xl p-5 text-sm text-red-200">Shipments could not be loaded: {error.message}</div>
      ) : (
        <AdminShipments rows={shipments || []} />
      )}
    </main>
  )
}
