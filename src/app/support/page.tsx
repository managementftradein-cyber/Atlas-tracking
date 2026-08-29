'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const STATUS_LABEL: Record<string, string> = { open: 'Open', answered: 'Answered', resolved: 'Resolved' };

export default function Support() {
  const r = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [f, setF] = useState({ subject: '', message: '', tracking_number: '' });
  const [website, setWebsite] = useState(''); // honeypot — real users never see or fill this
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    const db = createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) { r.replace('/login'); return; }
    const { data } = await db.from('support_tickets').select('*').eq('customer_id', user.id).order('created_at', { ascending: false });
    setTickets(data || []);
  }

  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (website) return; // honeypot tripped — silently drop, don't tip off the bot
    setBusy(true);
    setMsg('');
    const db = createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) { r.replace('/login'); return; }

    const { error } = await db.from('support_tickets').insert({
      customer_id: user.id,
      subject: f.subject.trim().slice(0, 200),
      message: f.message.trim().slice(0, 4000),
      tracking_number: f.tracking_number.trim().slice(0, 40) || null,
    });

    setBusy(false);
    if (error) { setMsg(error.message); return; }
    setF({ subject: '', message: '', tracking_number: '' });
    setMsg('Your message has been sent — we\'ll get back to you shortly.');
    load();
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <p className="text-cyanx font-bold uppercase tracking-[.2em]">Support</p>
      <h1 className="mt-3 text-4xl font-black">How can we help?</h1>
      <p className="mt-2 text-slate-500">Send us a message and a member of our team will respond by email.</p>

      <form onSubmit={submit} className="glass mt-8 rounded-3xl p-7 space-y-5">
        <input type="text" name="website" value={website} onChange={e => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <label className="block text-sm text-slate-400">Subject
          <input required maxLength={200} value={f.subject} onChange={e => setF(x => ({ ...x, subject: e.target.value }))} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
        </label>
        <label className="block text-sm text-slate-400">Tracking number <span className="text-slate-600">(optional)</span>
          <input maxLength={40} value={f.tracking_number} onChange={e => setF(x => ({ ...x, tracking_number: e.target.value }))} placeholder="ATL-2026-XXXXXXXX" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
        </label>
        <label className="block text-sm text-slate-400">Message
          <textarea required maxLength={4000} rows={5} value={f.message} onChange={e => setF(x => ({ ...x, message: e.target.value }))} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
        </label>
        <button disabled={busy} className="w-full rounded-xl bg-cyanx p-4 font-bold text-[#03101b] disabled:opacity-50">{busy ? 'Sending…' : 'Send message'}</button>
        {msg && <p className="text-center text-sm text-slate-400">{msg}</p>}
      </form>

      {tickets.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-black">Your messages</h2>
          <div className="mt-5 space-y-4">
            {tickets.map(t => (
              <div key={t.id} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{t.subject}</p>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase text-cyanx">{STATUS_LABEL[t.status]}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{t.message}</p>
                {t.admin_reply && (
                  <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-cyanx">Reply from support</p>
                    <p className="mt-1 text-sm text-slate-300">{t.admin_reply}</p>
                  </div>
                )}
                <p className="mt-3 text-xs text-slate-600">{new Date(t.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
