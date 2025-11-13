
'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useTelegramUser } from './telegram-user-context';

// Add the Telegram username of admins here
const ADMIN_USERNAMES = ['nullprime', 'devuser']; 
// Add the Telegram ID of admins here
const ADMIN_IDS = [123456789]; // devuser's ID for testing

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: isTelegramUserLoading } = useTelegramUser();

  const isAdmin = useMemo(() => {
    if (!user) return false;
    const username = user.username?.toLowerCase();
    const id = user.id;

    if (username && ADMIN_USERNAMES.includes(username)) {
      return true;
    }
    if (ADMIN_IDS.includes(id)) {
        return true;
    }

    return false;
  }, [user]);

  const value = {
    isAdmin,
    isLoading: isTelegramUserLoading,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
