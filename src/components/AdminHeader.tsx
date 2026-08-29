'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/Logo';

export default function AdminHeader() {
  const router = useRouter();
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [path]);

  const logout = async () => {
    await createClient().auth.signOut();
    setMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const links = (
    <>
      <Link href="/admin" className="nav-pill">Shipments</Link>
      <Link href="/admin/support" className="nav-pill">Support</Link>
      <Link href="/admin/cms" className="nav-pill">CMS</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#03101b]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <span className="hidden rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-slate-400 sm:inline">Admin</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 text-sm md:flex">
          {links}
          <button onClick={logout} className="nav-pill">Sign out</button>
        </nav>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu" aria-expanded={menuOpen} className="rounded-lg p-2 text-slate-300 md:hidden">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#03101b] px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1 text-sm">
            {links}
            <button onClick={logout} className="nav-pill text-left">Sign out</button>
          </nav>
        </div>
      )}
    </header>
  );
}
