'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminHeader() {
  const router = useRouter();

  const logout = async () => {
    await createClient().auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#03101b]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2 text-xl font-black tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyanx text-[#03101b]">A</span>
          <span>Atlas <span className="text-cyanx">Tracking</span></span>
          <span className="ml-2 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">Admin</span>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/admin" className="nav-pill">Shipments</Link>
          <button onClick={logout} className="nav-pill">Sign out</button>
        </nav>
      </div>
    </header>
  );
}
