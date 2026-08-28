'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const statuses = ['all', 'open', 'answered', 'resolved']

export default function AdminSupportList({ rows }: { rows: any[] }) {
  const [list, setList] = useState(rows)
  const [filter, setFilter] = useState('all')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => list.filter(t => filter === 'all' || t.status === filter), [list, filter])

  async function reply(id: string, resolve: boolean) {
    setBusyId(id)
    const db = createClient()
    const patch: any = { status: resolve ? 'resolved' : 'answered', updated_at: new Date().toISOString() }
    if (drafts[id]?.trim()) patch.admin_reply = drafts[id].trim()

    const { error } = await db.from('support_tickets').update(patch).eq('id', id)
    setBusyId(null)
    if (error) { alert(error.message); return }
    setList(l => l.map(t => t.id === id ? { ...t, ...patch } : t))
  }

  return <>
    <div className="mt-8 flex gap-3">
      {statuses.map(s => (
        <button key={s} onClick={() => setFilter(s)} className={`rounded-xl px-4 py-2 text-sm font-bold capitalize ${filter === s ? 'bg-cyanx text-[#03101b]' : 'border border-white/10 text-slate-400'}`}>{s}</button>
      ))}
    </div>

    <section className="mt-6 space-y-4">
      {filtered.map(t => (
        <div key={t.id} className="glass rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <b>{t.subject}</b>
              {t.tracking_number && <span className="ml-2 text-xs text-slate-500">({t.tracking_number})</span>}
            </div>
            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase text-cyanx">{t.status}</span>
          </div>
          <p className="mt-2 text-sm text-slate-400">{t.message}</p>
          <p className="mt-1 text-xs text-slate-600">{new Date(t.created_at).toLocaleString()}</p>

          {t.admin_reply && t.status === 'resolved' && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Reply sent: {t.admin_reply}</div>
          )}

          {t.status !== 'resolved' && (
            <div className="mt-4 space-y-3">
              <textarea rows={3} defaultValue={t.admin_reply || ''} onChange={e => setDrafts(d => ({ ...d, [t.id]: e.target.value }))} placeholder="Write a reply…" className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm" />
              <div className="flex gap-3">
                <button disabled={busyId === t.id} onClick={() => reply(t.id, false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 disabled:opacity-50">Send reply</button>
                <button disabled={busyId === t.id} onClick={() => reply(t.id, true)} className="rounded-xl bg-cyanx px-4 py-2 text-sm font-bold text-[#03101b] disabled:opacity-50">Reply &amp; resolve</button>
              </div>
            </div>
          )}
        </div>
      ))}
      {!filtered.length && <div className="py-16 text-center text-slate-500">No tickets match this filter.</div>}
    </section>
  </>
}
