'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { dict } from '@/lib/i18n';

const LanguageContext = createContext<{ lang: string; setLang: (l: string) => void; t: (k: string) => string }>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const saved = window.localStorage.getItem('atlas_lang');
    if (saved && dict[saved]) setLangState(saved);
  }, []);

  const setLang = (l: string) => {
    setLangState(l);
    window.localStorage.setItem('atlas_lang', l);
  };

  const t = (k: string) => dict[lang]?.[k] || dict.en[k] || k;

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
