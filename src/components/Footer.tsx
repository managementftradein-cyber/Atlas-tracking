'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/LanguageContext';
import Logo from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Footer() {
  const path = usePathname();
  const { t } = useLanguage();
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

  if (path?.startsWith('/admin')) return null;

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#03101b]/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-slate-500">{c.company_address}</p>
          <p className="text-sm text-slate-500">{c.company_city}{c.company_city && c.company_country ? ', ' : ''}{c.company_country}</p>
          <p className="mt-2 text-sm text-slate-500">{c.company_phone}</p>
          <p className="text-sm text-slate-500">{c.company_email}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">Company</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-slate-400">
            <Link href="/about" className="hover:text-cyanx">{t('about')}</Link>
            <Link href="/locations" className="hover:text-cyanx">{t('locations')}</Link>
            <Link href="/support" className="hover:text-cyanx">{t('support')}</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">Resources</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-slate-400">
            <Link href="/calculator" className="hover:text-cyanx">{t('calculator')}</Link>
            <Link href="/prohibited-items" className="hover:text-cyanx">{t('prohibited')}</Link>
            <Link href="/blog" className="hover:text-cyanx">{t('blog')}</Link>
            <Link href="/faqs" className="hover:text-cyanx">{t('faqs')}</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">{t('language')}</p>
          <div className="mt-4"><LanguageSwitcher /></div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} {c.company_name || 'Atlas Tracking'}. All rights reserved.
      </div>
    </footer>
  );
}
