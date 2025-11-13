
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { useTelegramUser } from './telegram-user-context';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
  const { user: telegramUser, isLoading: isTelegramUserLoading } = useTelegramUser();
  const { user: firebaseUser, isUserLoading: isFirebaseUserLoading } = useUser();
  const firestore = useFirestore();

  const isAdmin = useMemo(() => {
    if (!telegramUser) return false;
    const username = telegramUser.username?.toLowerCase();
    const id = telegramUser.id;

    if (username && ADMIN_USERNAMES.includes(username)) {
      return true;
    }
    if (ADMIN_IDS.includes(id)) {
        return true;
    }

    return false;
  }, [telegramUser]);
  
  // Effect to provision the user as an admin in Firestore if they are one
  useEffect(() => {
    if (isAdmin && firebaseUser && firestore && telegramUser) {
      const adminDocRef = doc(firestore, 'admins', firebaseUser.uid);
      const adminData = {
        telegramId: telegramUser.id,
        username: telegramUser.username,
        provisionedAt: new Date(),
      };
      
      getDoc(adminDocRef).then(docSnap => {
        if (!docSnap.exists()) {
          setDoc(adminDocRef, adminData).catch(error => {
            if (error.code === 'permission-denied') {
                 const contextualError = new FirestorePermissionError({
                    path: adminDocRef.path,
                    operation: 'create', 
                    requestResourceData: adminData
                });
                errorEmitter.emit('permission-error', contextualError);
            } else {
                console.error("Failed to provision admin document:", error);
            }
          });
        }
      });
    }
  }, [isAdmin, firebaseUser, firestore, telegramUser]);


  const value = {
    isAdmin,
    isLoading: isTelegramUserLoading || isFirebaseUserLoading,
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
