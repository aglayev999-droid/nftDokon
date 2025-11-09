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

interface NftContextType {
  nfts: Nft[];
  setNftStatus: (nftId: string, isListed: boolean, price?: number) => void;
  isLoading: boolean;
  removeNftFromInventory: (nftId: string) => Promise<void>;
  addNftToAuctions: (nft: Nft) => Promise<void>;
}

const NftContext = createContext<NftContextType | undefined>(undefined);

export const NftProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const inventoryRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'inventory') : null),
    [user, firestore]
  );

  const { data: nftsFromDb, isLoading: isCollectionLoading } =
    useCollection<Nft>(inventoryRef);

  // This effect runs once to bootstrap the user's inventory if it's empty
  useEffect(() => {
    if (user && nftsFromDb?.length === 0 && !isCollectionLoading) {
      console.log("User inventory is empty, bootstrapping with initial NFTs...");
      const batch = writeBatch(firestore);
      nftsData.forEach((nft) => {
        // Only give user-1 the "Fresh Socks" NFT
        if (nft.id === 'fresh-socks-91000') {
           const userNft = { ...nft, ownerId: user.uid };
           const newDocRef = doc(firestore, 'users', user.uid, 'inventory', nft.id);
           batch.set(newDocRef, userNft);
        }
      });
      
      batch.commit().catch(error => {
        console.error("Error bootstrapping inventory:", error);
      });
    }
  }, [user, nftsFromDb, isCollectionLoading, firestore]);

  const setNftStatus = (nftId: string, isListed: boolean, price?: number) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to manage NFTs.',
      });
      return;
    }
    
    const nftToUpdate = nftsFromDb?.find(n => n.id === nftId);
    if (!nftToUpdate) return;
    
    const docRef = doc(firestore, 'users', user.uid, 'inventory', nftId);
    
    const updatedData: Partial<Nft> = {
        isListed: isListed,
        price: isListed ? price : 0,
    };

    setDocumentNonBlocking(docRef, updatedData, { merge: true });
  };
  
  const removeNftFromInventory = useCallback(async (nftId: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'inventory', nftId);
    deleteDocumentNonBlocking(docRef);
  }, [user, firestore]);

  const addNftToAuctions = useCallback(async (nft: Nft) => {
      const auctionsCollection = collection(firestore, 'auctions');
      // Use the original nft.id to keep it consistent
      const auctionDocRef = doc(auctionsCollection, nft.id);
      setDocumentNonBlocking(auctionDocRef, nft, {});
  }, [firestore]);


  const isLoading = isUserLoading || isCollectionLoading;

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
