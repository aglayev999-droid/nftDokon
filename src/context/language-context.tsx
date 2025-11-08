
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import uz from '@/locales/uz.json';
import ru from '@/locales/ru.json';
import en from '@/locales/en.json';

type Language = 'uz' | 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: { [key: string]: string };
}

const translationsData = { uz, ru, en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('uz');
  const [translations, setTranslations] = useState(translationsData.uz);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['uz', 'ru', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    setTranslations(translationsData[language]);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
