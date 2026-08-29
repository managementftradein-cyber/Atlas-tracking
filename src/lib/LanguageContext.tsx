'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Minimal built-in fallback so nav labels never show raw keys like
// "track" during the brief moment before the DB-backed dictionary
// loads, or if the fetch fails.
const EN_FALLBACK: Record<string, string> = {
  track: 'Track', support: 'Support', dashboard: 'Dashboard', login: 'Login', signup: 'Sign Up',
  logout: 'Logout', about: 'About', locations: 'Locations', calculator: 'Shipping Price Calculator',
  prohibited: 'Prohibited Items', blog: 'Blog', faqs: 'FAQs', language: 'Language',
};

type LanguageOption = { code: string; label: string };

const LanguageContext = createContext<{
  lang: string;
  setLang: (l: string) => void;
  t: (k: string) => string;
  languages: LanguageOption[];
}>({
  lang: 'en',
  setLang: () => {},
  t: (k) => EN_FALLBACK[k] || k,
  languages: [{ code: 'en', label: 'English' }],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState('en');
  const [dict, setDict] = useState<Record<string, Record<string, string>>>({ en: EN_FALLBACK });
  const [languages, setLanguages] = useState<LanguageOption[]>([{ code: 'en', label: 'English' }]);

  useEffect(() => {
    const saved = window.localStorage.getItem('atlas_lang');
    if (saved) setLangState(saved);

    (async () => {
      const db = createClient();
      const [{ data: langRows }, { data: trRows }] = await Promise.all([
        db.from('languages').select('code,label').eq('active', true).order('sort_order'),
        db.from('translations').select('lang_code,key,value'),
      ]);

      if (langRows?.length) setLanguages(langRows);

      if (trRows?.length) {
        const built: Record<string, Record<string, string>> = {};
        trRows.forEach((r: any) => {
          built[r.lang_code] = built[r.lang_code] || {};
          built[r.lang_code][r.key] = r.value;
        });
        setDict(d => ({ ...d, ...built }));
      }
    })();
  }, []);

  const setLang = (l: string) => {
    setLangState(l);
    window.localStorage.setItem('atlas_lang', l);
  };

  const t = (k: string) => dict[lang]?.[k] || dict.en?.[k] || EN_FALLBACK[k] || k;

  return <LanguageContext.Provider value={{ lang, setLang, t, languages }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
