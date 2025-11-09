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
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
        setIsTelegram(true);
      } else {
        // For development outside Telegram
        setUser({
          id: 123456789,
          first_name: 'Dev',
          last_name: 'User',
          username: 'devuser',
          photo_url: 'https://picsum.photos/seed/dev/200/200',
        });
      }
      setIsLoading(false);
    } else {
      // Also for development outside Telegram
       setUser({
          id: 123456789,
          first_name: 'Dev',
          last_name: 'User',
          username: 'devuser',
          photo_url: 'https://picsum.photos/seed/dev/200/200',
        });
      setIsLoading(false);
    }
  }, []);

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
