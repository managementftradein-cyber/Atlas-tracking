'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Field = { key: string; label: string; type?: 'text' | 'textarea' | 'number' | 'select' | 'boolean'; options?: string[] }

function emptyDraft(fields: Field[]) {
  const d: Record<string, any> = {}
  fields.forEach(f => { d[f.key] = f.type === 'boolean' ? false : f.type === 'select' ? (f.options?.[0] || '') : '' })
  return d
}

export default function AdminCrudList({ table, fields, rows: initialRows }: { table: string; fields: Field[]; rows: any[] }) {
  const [rows, setRows] = useState(initialRows)
  const [draft, setDraft] = useState<Record<string, any>>(emptyDraft(fields))
  const [busy, setBusy] = useState(false)

  function castPayload(source: Record<string, any>) {
    const payload: Record<string, any> = {}
    fields.forEach(f => {
      const v = source[f.key]
      payload[f.key] = f.type === 'number' ? Number(v || 0) : f.type === 'boolean' ? !!v : (v ?? '')
    })
    return payload
  }

  async function add() {
    setBusy(true)
    const db = createClient()
    const { data, error } = await db.from(table).insert(castPayload(draft)).select().single()
    setBusy(false)
    if (error) { alert(error.message); return }
    setRows(r => [...r, data])
    setDraft(emptyDraft(fields))
  }

  async function remove(id: string) {
    if (!confirm('Delete this entry?')) return
    const db = createClient()
    const { error } = await db.from(table).delete().eq('id', id)
    if (error) { alert(error.message); return }
    setRows(r => r.filter(x => x.id !== id))
  }

  async function update(id: string, key: string, value: any) {
    const db = createClient()
    const { error } = await db.from(table).update({ [key]: value }).eq('id', id)
    if (error) { alert(error.message); return }
    setRows(r => r.map(x => x.id === id ? { ...x, [key]: value } : x))
  }

  function FieldInput({ f, value, onChange, onCommit }: { f: Field; value: any; onChange: (v: any) => void; onCommit?: (v: any) => void }) {
    if (f.type === 'textarea') return <textarea rows={3} value={value ?? ''} onChange={e => onChange(e.target.value)} onBlur={e => onCommit?.(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-2 text-sm" />
    if (f.type === 'select') return (
      <select value={value ?? f.options?.[0] ?? ''} onChange={e => { onChange(e.target.value); onCommit?.(e.target.value) }} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b1828] p-2 text-sm">
        {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
    if (f.type === 'boolean') return <input type="checkbox" checked={!!value} onChange={e => { onChange(e.target.checked); onCommit?.(e.target.checked) }} className="mt-2 h-4 w-4" />
    return <input type={f.type === 'number' ? 'number' : 'text'} value={value ?? ''} onChange={e => onChange(e.target.value)} onBlur={e => onCommit?.(f.type === 'number' ? Number(e.target.value) : e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-2 text-sm" />
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="glass space-y-3 rounded-2xl p-5">
        <p className="font-bold">Add new</p>
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs text-slate-500">{f.label}</label>
            <FieldInput f={f} value={draft[f.key]} onChange={v => setDraft(d => ({ ...d, [f.key]: v }))} />
          </div>
        ))}
        <button onClick={add} disabled={busy} className="rounded-xl bg-cyanx px-4 py-2 text-sm font-bold text-[#03101b] disabled:opacity-50">{busy ? 'Adding…' : 'Add'}</button>
      </div>

      {rows.map(row => (
        <div key={row.id} className="glass space-y-3 rounded-2xl p-5">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs text-slate-500">{f.label}</label>
              <FieldInput f={f} value={row[f.key]} onChange={v => setRows(r => r.map(x => x.id === row.id ? { ...x, [f.key]: v } : x))} onCommit={v => update(row.id, f.key, v)} />
            </div>
          ))}
          <button onClick={() => remove(row.id)} className="text-xs font-bold text-red-300">Delete</button>
        </div>
      ))}
      {!rows.length && <p className="text-slate-500">Nothing here yet — add your first entry above.</p>}
    </div>
  )
}
