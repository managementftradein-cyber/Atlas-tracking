'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = createClient();
      const { data } = await db.from('blog_posts').select('*').eq('slug', slug).eq('published', true).maybeSingle();
      setPost(data);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <main className="p-10 text-slate-500">Loading…</main>;
  if (!post) return <main className="mx-auto max-w-2xl px-5 py-16 text-center"><p className="text-2xl font-black">Post not found</p></main>;

  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <p className="text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString()}</p>
      <h1 className="mt-3 text-4xl font-black">{post.title}</h1>
      <div className="mt-8 space-y-4 whitespace-pre-line leading-8 text-slate-300">{post.body}</div>
    </main>
  );
}
