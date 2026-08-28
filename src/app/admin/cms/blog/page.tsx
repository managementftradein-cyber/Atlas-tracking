import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminCrudList from '../crud-list'

export const dynamic = 'force-dynamic'

export default async function AdminBlog() {
  const db = await createClient()
  const { data: claimsData } = await db.auth.getClaims()
  if (!claimsData?.claims?.sub) redirect('/login?next=/admin/cms/blog')
  const { data: isAdmin } = await db.rpc('is_admin')
  if (!isAdmin) return <main className="grid min-h-[calc(100vh-70px)] place-items-center px-5"><div className="glass rounded-3xl p-10 text-center"><h1 className="text-2xl font-black">Admin access required</h1></div></main>

  const { data: rows } = await db.from('blog_posts').select('*').order('created_at', { ascending: false })

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-cyanx">CMS</p>
      <h1 className="mt-2 text-4xl font-black">Blog</h1>
      <p className="mt-2 text-sm text-slate-500">Slug must be unique and URL-safe (e.g. "our-new-warehouse").</p>
      <AdminCrudList table="blog_posts" rows={rows || []} fields={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'published', label: 'Published', type: 'boolean' },
      ]} />
    </main>
  )
}
