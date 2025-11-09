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

  // Use Telegram User ID for the document path
  const userId = telegramUser?.id.toString();

  const inventoryRef = useMemoFirebase(
    () => (userId ? collection(firestore, 'users', userId, 'inventory') : null),
    [userId, firestore]
  );

  const { data: nftsFromDb, isLoading: isCollectionLoading } =
    useCollection<Nft>(inventoryRef);

  // This effect runs once to bootstrap the user's inventory if it's empty
  useEffect(() => {
    if (userId && firebaseUser && nftsFromDb?.length === 0 && !isCollectionLoading) {
      console.log("User inventory is empty, bootstrapping with initial NFTs...");
      const batch = writeBatch(firestore);
      nftsData.forEach((nft) => {
        // Only give the default user the "Fresh Socks" NFT for demo purposes
        if (nft.id === 'fresh-socks-91000') {
           const userNft = { ...nft, ownerId: firebaseUser.uid }; // Keep firebase uid as owner
           const newDocRef = doc(firestore, 'users', userId, 'inventory', nft.id);
           batch.set(newDocRef, userNft);
        }
      });
      
      batch.commit().catch(error => {
        console.error("Error bootstrapping inventory:", error);
      });
    }
  }, [userId, firebaseUser, nftsFromDb, isCollectionLoading, firestore]);

  const setNftStatus = (nftId: string, isListed: boolean, price?: number) => {
    if (!userId || !firebaseUser) {
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
      if (!firebaseUser) return;
      const auctionsCollection = collection(firestore, 'auctions');
      // Ensure the NFT has the correct ownerId before putting to auction
      const auctionNft = { ...nft, ownerId: firebaseUser.uid };
      const auctionDocRef = doc(auctionsCollection, nft.id);
      setDocumentNonBlocking(auctionDocRef, auctionNft, {});
  }, [firestore, firebaseUser]);


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
