
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
    const initializeTelegram = () => {
        if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            
            // Expand the viewport
            tg.expand();
            
            setIsTelegram(true);
            if (tg.initDataUnsafe?.user) {
                setUser(tg.initDataUnsafe.user);
            } else {
                 // Fallback for browsers or if user data is not available
                setUser({
                    id: 987654321,
                    first_name: 'Web',
                    last_name: 'User',
                    username: 'web_user',
                    photo_url: `https://picsum.photos/seed/webuser/200/200`,
                });
            }
        } else {
             // Fallback for non-Telegram environments
            setUser({
                id: 987654321,
                first_name: 'Web',
                last_name: 'User',
                username: 'web_user',
                photo_url: `https://picsum.photos/seed/webuser/200/200`,
            });
        }
        setIsLoading(false);
    };

    // The Telegram script might take a moment to load.
    if (window.Telegram?.WebApp?.initData) {
        initializeTelegram();
    } else {
        const timeout = setTimeout(initializeTelegram, 100); // Check again after a short delay
        return () => clearTimeout(timeout);
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
