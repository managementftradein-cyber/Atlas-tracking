'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Blog() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const db = createClient();
      const { data } = await db.from('blog_posts').select('*').eq('published', true).order('created_at', { ascending: false });
      setRows(data || []);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <p className="text-cyanx font-bold uppercase tracking-[.2em]">Blog</p>
      <h1 className="mt-3 text-4xl font-black">Latest from Atlas Tracking</h1>
      <div className="mt-8 space-y-4">
        {rows.map(x => (
          <Link key={x.id} href={`/blog/${x.slug}`} className="glass block rounded-2xl p-6 transition hover:bg-white/[0.06]">
            <p className="text-xs text-slate-500">{new Date(x.created_at).toLocaleDateString()}</p>
            <h2 className="mt-2 text-xl font-black">{x.title}</h2>
            {x.excerpt && <p className="mt-2 text-sm text-slate-400">{x.excerpt}</p>}
          </Link>
        ))}
        {!rows.length && <p className="text-slate-500">No posts yet.</p>}
      </div>
    </main>
  );
}
