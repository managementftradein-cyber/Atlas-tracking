'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const LABELS: Record<string, string> = {
  hero_eyebrow: 'Hero eyebrow',
  hero_title_line1: 'Hero title (line 1)',
  hero_title_line2: 'Hero title (line 2)',
  hero_subtitle: 'Hero subtitle',
  about_title: 'About page title',
  about_body: 'About page body',
  company_name: 'Company name',
  company_address: 'Company address',
  company_city: 'Company city',
  company_country: 'Company country',
  company_phone: 'Company phone',
  company_email: 'Company email',
}

export default function CmsContentForm({ rows }: { rows: any[] }) {
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(rows.map(r => [r.key, r.value])))
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)

  async function save(key: string) {
    setSavingKey(key)
    const db = createClient()
    const { error } = await db.from('site_content').upsert({ key, value: values[key] || '', updated_at: new Date().toISOString() })
    setSavingKey(null)
    if (error) { alert(error.message); return }
    setSavedKey(key)
    setTimeout(() => setSavedKey(k => k === key ? null : k), 1500)
  }

  return (
    <div className="glass mt-8 space-y-6 rounded-3xl p-7">
      {rows.map(r => (
        <div key={r.key}>
          <label className="block text-sm text-slate-400">{LABELS[r.key] || r.key}</label>
          {(r.value?.length || 0) > 80 ? (
            <textarea rows={4} value={values[r.key] ?? ''} onChange={e => setValues(v => ({ ...v, [r.key]: e.target.value }))} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
          ) : (
            <input value={values[r.key] ?? ''} onChange={e => setValues(v => ({ ...v, [r.key]: e.target.value }))} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
          )}
          <button onClick={() => save(r.key)} disabled={savingKey === r.key} className="mt-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 disabled:opacity-50">
            {savingKey === r.key ? 'Saving…' : savedKey === r.key ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      ))}
    </div>
  )
}
