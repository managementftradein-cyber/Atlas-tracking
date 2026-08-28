'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/Logo';

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
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">Admin</span>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/admin" className="nav-pill">Shipments</Link>
          <Link href="/admin/support" className="nav-pill">Support</Link>
          <button onClick={logout} className="nav-pill">Sign out</button>
        </nav>
      </div>
    </header>
  );
}
