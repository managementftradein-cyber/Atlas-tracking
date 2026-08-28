'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ProhibitedItems() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const db = createClient();
      const { data } = await db.from('prohibited_items').select('*').order('sort_order');
      setRows(data || []);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-cyanx font-bold uppercase tracking-[.2em]">Shipping Policy</p>
      <h1 className="mt-3 text-4xl font-black">Prohibited items</h1>
      <p className="mt-3 text-slate-500">The following items cannot be shipped through Atlas Tracking.</p>
      <div className="mt-8 space-y-3">
        {rows.map(x => (
          <div key={x.id} className="glass rounded-2xl p-5">
            <p className="font-semibold">{x.item}</p>
            {x.note && <p className="mt-1 text-sm text-slate-400">{x.note}</p>}
          </div>
        ))}
        {!rows.length && <p className="text-slate-500">List coming soon.</p>}
      </div>
    </main>
  );
}
