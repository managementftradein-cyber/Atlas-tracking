'use client';
import { useLanguage } from '@/lib/LanguageContext';
import { LANGUAGES } from '@/lib/i18n';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage();
  return (
    <select
      value={lang}
      onChange={e => setLang(e.target.value)}
      aria-label="Select language"
      className={compact ? 'nav-pill bg-transparent text-sm' : 'w-full rounded-xl border border-white/10 bg-[#0b1828] p-2.5 text-sm'}
    >
      {LANGUAGES.map(l => <option key={l.code} value={l.code} className="text-black">{l.label}</option>)}
    </select>
  );
}
