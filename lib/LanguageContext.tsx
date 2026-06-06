'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { type Language } from './types';
import { t, type TranslationKey } from './i18n';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  tr: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'al',
  setLang: () => {},
  tr: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('al');

  useEffect(() => {
    const saved = localStorage.getItem('mali_lang') as Language | null;
    if (saved === 'al' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('mali_lang', l);
  };

  const tr = (key: TranslationKey) => t(lang, key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
