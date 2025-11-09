
'use client';

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserAccount } from '@/lib/data';


interface WalletContextType {
  balance: number;
  setBalance: Dispatch<SetStateAction<number>>;
  isBalanceLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<number>(0);
  const { user: firebaseUser, isUserLoading: isFirebaseUserLoading } = useUser();
  const firestore = useFirestore();
  
  const userId = firebaseUser?.uid;

  const userAccountRef = useMemoFirebase(
    () => (firestore && userId ? doc(firestore, 'users', userId) : null),
    [firestore, userId]
  );
  
  const { data: userAccount, isLoading: isUserAccountLoading } = useDoc<UserAccount>(userAccountRef);

  useEffect(() => {
    if (userAccount) {
      setBalance(userAccount.balance);
    }
  }, [userAccount]);
  
  const isBalanceLoading = isFirebaseUserLoading || isUserAccountLoading;

  return (
    <WalletContext.Provider value={{ balance, setBalance, isBalanceLoading }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
