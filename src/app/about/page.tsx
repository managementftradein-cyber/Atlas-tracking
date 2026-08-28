'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function About() {
  const [c, setC] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const db = createClient();
      const { data } = await db.from('site_content').select('key,value');
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => { map[r.key] = r.value; });
      setC(map);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-cyanx font-bold uppercase tracking-[.2em]">About</p>
      <h1 className="mt-3 text-4xl font-black">{c.about_title || 'About Atlas Tracking'}</h1>
      <p className="mt-6 whitespace-pre-line leading-8 text-slate-400">{c.about_body}</p>

      <div className="glass mt-10 rounded-3xl p-7">
        <h2 className="text-xl font-black">Our location</h2>
        <p className="mt-3 text-slate-300">{c.company_name}</p>
        <p className="text-slate-400">{c.company_address}</p>
        <p className="text-slate-400">{c.company_city}{c.company_city && c.company_country ? ', ' : ''}{c.company_country}</p>
        <p className="mt-3 text-slate-400">{c.company_phone} {c.company_phone && c.company_email ? '·' : ''} {c.company_email}</p>
      </div>
    </main>
  );
}
