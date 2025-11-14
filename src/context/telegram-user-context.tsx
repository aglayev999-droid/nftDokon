'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

declare global {
  interface Window {
    Telegram: any;
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramUserContextType {
  user: TelegramUser | null;
  isTelegram: boolean;
  isLoading: boolean;
}

const TelegramUserContext = createContext<TelegramUserContextType | undefined>(undefined);

export const TelegramUserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;

    const initializeTelegram = () => {
      try {
        if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
          const tg = window.Telegram.WebApp;
          
          if (tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) {
            tg.ready();
            tg.expand();
            setUser(tg.initDataUnsafe.user);
            setIsTelegram(true);
            setIsLoading(false);
            console.log('Telegram User data loaded:', tg.initDataUnsafe.user);
            return;
          }
        }
      } catch (error) {
        console.error("Error initializing Telegram Web App:", error);
      }
      
      // If after all checks, we are not in a real Telegram environment
      setUser({
          id: 987654321,
          first_name: 'Web',
          last_name: 'User',
          username: 'web_user',
          photo_url: `https://picsum.photos/seed/webuser/200/200`,
      });
      setIsTelegram(false);
      setIsLoading(false);
      console.log('Fallback to Web User.');
    };
    
    script.onload = () => {
      // The script is loaded, now we can safely access window.Telegram
      // We give it a little time for the WebApp to be fully ready.
      setTimeout(initializeTelegram, 100);
    };

    script.onerror = () => {
        // If the script fails to load, fallback immediately
        console.error("Telegram Web App script failed to load.");
        initializeTelegram();
    };

    document.body.appendChild(script);

    // Set a timeout to fallback if Telegram script doesn't initialize within a few seconds
    const fallbackTimeout = setTimeout(() => {
        if (isLoading) {
            console.warn("Telegram Web App initialization timed out. Falling back to web user.");
            initializeTelegram();
        }
    }, 3000);

    return () => {
      document.body.removeChild(script);
      clearTimeout(fallbackTimeout);
    };
    
  }, [isLoading]); // isLoading dependency is to prevent re-running after fallback

  const value = { user, isTelegram, isLoading };

  return (
    <TelegramUserContext.Provider value={value}>
      {children}
    </TelegramUserContext.Provider>
  );
};

export const useTelegramUser = () => {
  const context = useContext(TelegramUserContext);
  if (context === undefined) {
    throw new Error('useTelegramUser must be used within a TelegramUserProvider');
  }
  return context;
};
