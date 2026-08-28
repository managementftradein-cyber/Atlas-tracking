'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Locations() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const db = createClient();
      const { data } = await db.from('locations').select('*').order('sort_order');
      setRows(data || []);
    })();
  }, []);

  const groups = ['United States', 'International'];

  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <p className="text-cyanx font-bold uppercase tracking-[.2em]">Locations</p>
      <h1 className="mt-3 text-4xl font-black">Where we operate</h1>
      {groups.map(g => {
        const items = rows.filter(r => r.region === g);
        if (!items.length) return null;
        return (
          <div key={g} className="mt-10">
            <h2 className="text-xl font-black text-cyanx">{g}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {items.map(x => (
                <div key={x.id} className="glass rounded-2xl p-5">
                  <p className="font-semibold">{x.city}</p>
                  {x.address && <p className="mt-1 text-sm text-slate-400">{x.address}</p>}
                  {x.phone && <p className="mt-1 text-sm text-slate-500">{x.phone}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {!rows.length && <p className="mt-8 text-slate-500">Location details coming soon.</p>}
    </main>
  );
}
