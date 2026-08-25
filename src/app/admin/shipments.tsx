'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'

const statuses = ['all','pending','confirmed','processing','in_transit','arrived_at_facility','out_for_delivery','delivered','delayed','cancelled']

export default function AdminShipments({ rows }: { rows: any[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => rows.filter(x => {
    const q = query.trim().toLowerCase()
    const matchesQuery = !q || [x.tracking_number, x.origin, x.destination, x.current_location].some(v => String(v || '').toLowerCase().includes(q))
    return matchesQuery && (status === 'all' || x.status === status)
  }), [rows, query, status])

  const count = (s: string) => rows.filter(x => x.status === s).length
  const revenue = rows.reduce((n, x) => n + Number(x.total_cost || 0), 0)

  return <>
    <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        ['Total shipments', rows.length],
        ['In transit', count('in_transit')],
        ['Delivered', count('delivered')],
        ['Shipment value', `$${revenue.toFixed(2)}`]
      ].map(([a,b], i) => (
        <motion.div key={a as string} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }} className="glass rounded-2xl p-5 interactive-surface">
          <p className="text-sm text-slate-500">{a}</p><p className="mt-2 text-3xl font-black">{b}</p>
        </motion.div>
      ))}
    </div>

    <div className="glass mt-8 rounded-3xl p-5">
      <div className="flex flex-col gap-3 lg:flex-row">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tracking number, origin, destination or location" className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-cyanx/50" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-white/10 bg-[#0b1828] p-3">
          {statuses.map(x => <option key={x} value={x}>{x.replaceAll('_', ' ')}</option>)}
        </select>
      </div>
    </div>

    <section className="mt-7 space-y-3">
      {filtered.map((x, i) => (
        <motion.div key={x.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * .035, .35) }}>
          <Link href={`/admin/shipments/${x.id}`} className="glass block rounded-2xl p-5 interactive-surface hover:border-cyanx/30">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <b className="text-lg">{x.tracking_number}</b>
                <p className="mt-1 text-sm text-slate-500">{x.origin} → {x.destination}</p>
                <p className="mt-2 text-xs text-slate-500">Current location: <span className="text-slate-300">{x.current_location || 'Not updated'}</span></p>
              </div>
              <div className="flex items-center gap-4"><span className="text-sm text-cyanx capitalize">{String(x.status || 'pending').replaceAll('_',' ')}</span><span className="text-sm font-semibold">${Number(x.total_cost || 0).toFixed(2)}</span><span className="text-slate-500">→</span></div>
            </div>
          </Link>
        </motion.div>
      ))}
      {!filtered.length && <div className="py-16 text-center text-slate-500">No shipments match your filters.</div>}
    </section>
  </>
}
