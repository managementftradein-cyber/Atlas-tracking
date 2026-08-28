'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Faqs() {
  const [rows, setRows] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const db = createClient();
      const { data } = await db.from('faqs').select('*').order('sort_order');
      setRows(data || []);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-cyanx font-bold uppercase tracking-[.2em]">FAQs</p>
      <h1 className="mt-3 text-4xl font-black">Frequently asked questions</h1>
      <div className="mt-8 space-y-3">
        {rows.map(x => (
          <div key={x.id} className="glass overflow-hidden rounded-2xl">
            <button onClick={() => setOpenId(openId === x.id ? null : x.id)} className="flex w-full items-center justify-between p-5 text-left font-semibold">
              {x.question}<span className="text-cyanx">{openId === x.id ? '−' : '+'}</span>
            </button>
            {openId === x.id && <p className="px-5 pb-5 text-sm text-slate-400">{x.answer}</p>}
          </div>
        ))}
        {!rows.length && <p className="text-slate-500">No FAQs yet.</p>}
      </div>
    </main>
  );
}
