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
    let isMounted = true;
    let fallbackTimeout: NodeJS.Timeout;

    const initializeTelegram = () => {
      if (!isMounted) return;

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
            clearTimeout(fallbackTimeout); // We got the user, cancel the fallback
            return;
          }
        }
      } catch (error) {
        console.error("Error initializing Telegram Web App:", error);
      }
      
      // If after checks we still don't have a user, it might be too early.
      // The fallback timeout will handle the case where it never loads.
    };

    const setupFallback = () => {
        // Fallback for when not in a Telegram environment
        if (isLoading && isMounted) { // Only set fallback if still loading
            console.log('Fallback to Web User.');
            setUser({
                id: 987654321,
                first_name: 'Web',
                last_name: 'User',
                username: 'web_user',
                photo_url: `https://picsum.photos/seed/webuser/200/200`,
            });
            setIsTelegram(false);
            setIsLoading(false);
        }
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;

    script.onload = () => {
      // The script is loaded, now we can safely access window.Telegram
      initializeTelegram();
    };

    script.onerror = () => {
        // If the script fails to load, fallback immediately
        console.error("Telegram Web App script failed to load.");
        setupFallback();
    };

    document.body.appendChild(script);

    // Set a timeout to fallback if Telegram script doesn't initialize
    fallbackTimeout = setTimeout(setupFallback, 3000);

    return () => {
      isMounted = false;
      document.body.removeChild(script);
      clearTimeout(fallbackTimeout);
    };
    
  }, [isLoading]); // Run effect only once

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
