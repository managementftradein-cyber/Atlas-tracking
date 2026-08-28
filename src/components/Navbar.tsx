'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/LanguageContext';
import Logo from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Navbar(){
  const path = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
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
        <Logo href="/" />
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/track" className={`nav-pill ${path==='/track'?'nav-active':''}`}>{t('track')}</Link>
          <Link href="/support" className={`nav-pill ${path==='/support'?'nav-active':''}`}>{t('support')}</Link>
          {signedIn && <Link href="/dashboard" className={`nav-pill ${path==='/dashboard'?'nav-active':''}`}>{t('dashboard')}</Link>}
          {!signedIn ? (
            <>
              <Link href="/login" className="nav-pill">{t('login')}</Link>
              <Link href="/register" className="ml-1 rounded-xl bg-cyanx px-4 py-2 font-bold text-[#03101b] shadow-lg shadow-cyan-500/10 hover:-translate-y-0.5">{t('signup')}</Link>
            </>
          ) : (
            <button onClick={logout} className="nav-pill">{t('logout')}</button>
          )}
          <LanguageSwitcher compact />
        </nav>
      </div>
    </header>
  );
}
