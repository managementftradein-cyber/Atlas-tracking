'use client';
import { useLanguage } from '@/lib/LanguageContext';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, languages } = useLanguage();
  return (
    <select
      value={lang}
      onChange={e => setLang(e.target.value)}
      aria-label="Select language"
      className={compact ? 'nav-pill bg-transparent text-sm' : 'w-full rounded-xl border border-white/10 bg-[#0b1828] p-2.5 text-sm'}
    >
      {languages.map(l => <option key={l.code} value={l.code} className="text-black">{l.label}</option>)}
    </select>
  );
}
