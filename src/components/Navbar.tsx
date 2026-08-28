 'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar(){
  const path = usePathname();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const db = createClient();

    const load = async () => {
      const { data: { user } } = await db.auth.getUser();
      setSignedIn(!!user);
    };

    load();

    const { data: listener } = db.auth.onAuthStateChange(() => {
      load();
    });

    return () => listener.subscription.unsubscribe();
  }, [path]);

  const logout = async () => {
    await createClient().auth.signOut();
    setSignedIn(false);
    router.push('/');
    router.refresh();
  };

  // Admin section renders its own separate header (see src/app/admin/layout.tsx)
  // so admin chrome never shares a page with customer login/signup/dashboard links.
  if (path?.startsWith('/admin')) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06101d]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="group flex items-center gap-2 text-xl font-black tracking-tight">
          <motion.span whileHover={{ rotate:-8, scale:1.08 }} className="grid h-9 w-9 place-items-center rounded-xl bg-cyanx text-[#03101b]">A</motion.span>
          <span>Atlas <span className="text-cyanx">Tracking</span></span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/track" className={`nav-pill ${path==='/track'?'nav-active':''}`}>Track</Link>
          {signedIn && <Link href="/dashboard" className={`nav-pill ${path==='/dashboard'?'nav-active':''}`}>Dashboard</Link>}
          {!signedIn ? (
            <>
              <Link href="/login" className="nav-pill">Login</Link>
              <Link href="/register" className="ml-1 rounded-xl bg-cyanx px-4 py-2 font-bold text-[#03101b] shadow-lg shadow-cyan-500/10 hover:-translate-y-0.5">Sign Up</Link>
            </>
          ) : (
            <button onClick={logout} className="nav-pill">Logout</button>
          )}
        </nav>
      </div>
    </header>
  );
}
