
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
  useCallback,
} from 'react';
import { Nft, nftsData } from '@/lib/data';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useTelegramUser } from './telegram-user-context';

interface NftContextType {
  nfts: Nft[];
  setNftStatus: (nftId: string, isListed: boolean, price?: number) => void;
  isLoading: boolean;
  removeNftFromInventory: (nftId: string) => Promise<void>;
  addNftToAuctions: (nft: Nft) => Promise<void>;
}

const NftContext = createContext<NftContextType | undefined>(undefined);

export const NftProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser, isUserLoading: isFirebaseUserLoading } = useUser();
  const { user: telegramUser, isLoading: isTelegramUserLoading } = useTelegramUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userId = firebaseUser?.uid;

  const inventoryRef = useMemoFirebase(
    () => (userId && firestore ? collection(firestore, 'users', userId, 'inventory') : null),
    [userId, firestore]
  );

  const { data: nftsFromDb, isLoading: isCollectionLoading } =
    useCollection<Nft>(inventoryRef);

  useEffect(() => {
    // Bootstrap inventory only when firebase and telegram user are loaded, and inventory is confirmed empty
    if (userId && !isFirebaseUserLoading && !isTelegramUserLoading && !isCollectionLoading && nftsFromDb?.length === 0) {
      console.log("User inventory is empty, bootstrapping with initial NFTs...");
      const batch = writeBatch(firestore);
      nftsData.forEach((nft) => {
        const userNft = { ...nft, ownerId: userId };
        const newDocRef = doc(firestore, 'users', userId, 'inventory', nft.id);
        batch.set(newDocRef, userNft);
      });
      
      batch.commit().catch(error => {
        console.error("Error bootstrapping inventory:", error);
      });
    }
  }, [userId, nftsFromDb, isCollectionLoading, isFirebaseUserLoading, isTelegramUserLoading, firestore]);

  const setNftStatus = (nftId: string, isListed: boolean, price?: number) => {
    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to manage NFTs.',
      });
      return;
    }
    
    const nftToUpdate = nftsFromDb?.find(n => n.id === nftId);
    if (!nftToUpdate) return;
    
    const docRef = doc(firestore, 'users', userId, 'inventory', nftId);
    
    const updatedData: Partial<Nft> = {
        isListed: isListed,
        price: isListed ? price : 0,
    };

    setDocumentNonBlocking(docRef, updatedData, { merge: true });
  };
  
  const removeNftFromInventory = useCallback(async (nftId: string) => {
    if (!userId) return;
    const docRef = doc(firestore, 'users', userId, 'inventory', nftId);
    deleteDocumentNonBlocking(docRef);
  }, [userId, firestore]);

  const addNftToAuctions = useCallback(async (nft: Nft) => {
      if (!userId) return;
      const auctionsCollection = collection(firestore, 'auctions');
      const auctionNft = { ...nft, ownerId: userId };
      const auctionDocRef = doc(auctionsCollection, nft.id);
      setDocumentNonBlocking(auctionDocRef, auctionNft, {});
  }, [firestore, userId]);

  const isLoading = isFirebaseUserLoading || isCollectionLoading || isTelegramUserLoading;

  return (
    <NftContext.Provider value={{ nfts: nftsFromDb || [], setNftStatus, isLoading, removeNftFromInventory, addNftToAuctions }}>
      {children}
    </NftContext.Provider>
  );
};

export const useNft = () => {
  const context = useContext(NftContext);
  if (context === undefined) {
    throw new Error('useNft must be used within a NftProvider');
  }
  return context;
};
