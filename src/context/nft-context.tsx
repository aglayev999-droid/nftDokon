
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { Nft, nftsData, UserAccount } from '@/lib/data';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
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

  // Effect to bootstrap user data and inventory
  useEffect(() => {
    // Wait until we have both firebase and telegram user info
    if (!userId || !telegramUser || isFirebaseUserLoading || isTelegramUserLoading) {
      return;
    }

    const userDocRef = doc(firestore, 'users', userId);

    // Bootstrap user document and inventory
    const bootstrapUser = async () => {
      const batch = writeBatch(firestore);

      // 1. Create the user document
      const newUserAccount: UserAccount = {
        id: userId,
        telegramId: String(telegramUser.id),
        username: telegramUser.username || `${telegramUser.first_name}${telegramUser.last_name || ''}`,
        balance: 100000, // Initial balance for new users
      };
      batch.set(userDocRef, newUserAccount);

      // 2. Bootstrap inventory for the new user
      nftsData.forEach((nft) => {
        const userNft = { ...nft, ownerId: userId };
        const newDocRef = doc(firestore, 'users', userId, 'inventory', nft.id);
        batch.set(newDocRef, userNft);
      });
      
      await batch.commit();
      console.log(`User ${userId} and their inventory have been bootstrapped.`);
    };

    // Check if inventory is empty, which implies a new user
    if (!isCollectionLoading && nftsFromDb?.length === 0) {
      console.log(`User inventory for ${userId} is empty, bootstrapping...`);
      bootstrapUser().catch(error => {
        console.error("Error bootstrapping user and inventory:", error);
      });
    }

  }, [userId, telegramUser, firestore, nftsFromDb, isCollectionLoading, isFirebaseUserLoading, isTelegramUserLoading]);

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
