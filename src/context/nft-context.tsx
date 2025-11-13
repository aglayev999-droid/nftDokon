
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { Nft, UserAccount, nftsData as initialNfts } from '@/lib/data';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import { collection, doc, writeBatch, runTransaction, getDoc, Transaction, getDocs, FirestoreError } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useTelegramUser } from './telegram-user-context';
import { useWallet } from './wallet-context';

interface NftContextType {
  nfts: Nft[];
  setNftStatus: (nftId: string, isListed: boolean, price?: number) => void;
  isLoading: boolean;
  removeNftFromInventory: (nftId: string) => Promise<void>;
  addNftToAuctions: (nft: Nft) => Promise<void>;
  placeBid: (nft: Nft, bidAmount: number) => void;
  buyNft: (nft: Nft) => void;
}

const NftContext = createContext<NftContextType | undefined>(undefined);

export const NftProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser, isUserLoading: isFirebaseUserLoading } = useUser();
  const { user: telegramUser, isLoading: isTelegramUserLoading } = useTelegramUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { balance, setBalance } = useWallet();

  const userId = firebaseUser?.uid;

  const inventoryRef = useMemoFirebase(
    () => (userId && firestore ? collection(firestore, 'users', userId, 'inventory') : null),
    [userId, firestore]
  );

  const { data: nftsFromDb, isLoading: isCollectionLoading } =
    useCollection<Nft>(inventoryRef);

  // Effect to bootstrap user data and initial NFTs
  useEffect(() => {
    if (!userId || !telegramUser || isFirebaseUserLoading || isTelegramUserLoading || !firestore) {
      return;
    }

    const userDocRef = doc(firestore, 'users', userId);
    const userInventoryRef = collection(userDocRef, 'inventory');

    runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        
        // Bootstrap user account if it doesn't exist
        if (!userDoc.exists()) {
            console.log(`User document for ${userId} does not exist, bootstrapping...`);
            const newUserAccount: UserAccount = {
                id: userId,
                telegramId: String(telegramUser.id),
                username: telegramUser.username || telegramUser.first_name,
                fullName: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
                balance: 1000000, // Generous starting balance
            };
            transaction.set(userDocRef, newUserAccount);
        }

        // Check if inventory is empty, if so, add initial NFTs
        const inventorySnapshot = await getDocs(userInventoryRef);
        if (inventorySnapshot.empty) {
            console.log(`Inventory for user ${userId} is empty, adding initial NFTs.`);
            initialNfts.forEach(nft => {
                const newNftRef = doc(userInventoryRef, nft.id);
                // Assign the current user as the owner
                transaction.set(newNftRef, { ...nft, ownerId: userId });
            });
        }
    }).catch((error: FirestoreError) => {
        console.error("Error bootstrapping user or inventory:", error);
         if (error.code === 'permission-denied') {
            const contextualError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'write', 
                requestResourceData: { userId, telegramUser }
            });
            errorEmitter.emit('permission-error', contextualError);
        }
    });

  }, [userId, telegramUser, firestore, isFirebaseUserLoading, isTelegramUserLoading]);


  const setNftStatus = (nftId: string, isListed: boolean, price?: number) => {
    if (!userId || !firestore) {
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
    if (!userId || !firestore) return;
    const docRef = doc(firestore, 'users', userId, 'inventory', nftId);
    await deleteDocumentNonBlocking(docRef);
  }, [userId, firestore]);

  const addNftToAuctions = useCallback(async (nft: Nft) => {
      if (!userId || !firestore) return;
      const auctionsCollection = collection(firestore, 'auctions');
      const auctionNft = { ...nft, ownerId: userId };
      const auctionDocRef = doc(auctionsCollection, nft.id);
      await setDocumentNonBlocking(auctionDocRef, auctionNft, {});
      await removeNftFromInventory(nft.id);
  }, [firestore, userId, removeNftFromInventory]);
  
  const placeBid = (nft: Nft, bidAmount: number) => {
    if (!userId || !firestore) {
        toast({ variant: "destructive", title: "You must be logged in to bid."});
        return;
    }

    const auctionRef = doc(firestore, 'auctions', nft.id);
    const userRef = doc(firestore, 'users', userId);

    runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const auctionDoc = await transaction.get(auctionRef);

        if (!userDoc.exists()) throw new Error("Your user account was not found.");
        if (!auctionDoc.exists()) throw new Error("This auction no longer exists.");

        const userData = userDoc.data() as UserAccount;
        const auctionData = auctionDoc.data() as Nft;

        if (userData.balance < bidAmount) throw new Error("Not enough balance to place this bid.");
        if (bidAmount <= (auctionData.highestBid || 0)) throw new Error("Your bid must be higher than the current highest bid.");
        
        const updateData = { 
            highestBid: bidAmount,
            highestBidderId: userId,
        };
        transaction.update(auctionRef, updateData);
    })
    .then(() => {
        toast({ title: "Bid placed successfully!", description: `You are now the highest bidder for ${nft.name}.` });
    })
    .catch((error: any) => {
        if (error.message.includes("permission-denied") || error.code === "permission-denied") {
             const contextualError = new FirestorePermissionError({
                path: auctionRef.path,
                operation: 'update',
                requestResourceData: { highestBid: bidAmount, highestBidderId: userId }
             });
             errorEmitter.emit('permission-error', contextualError);
        } else {
            console.error("Bid failed:", error);
            toast({ variant: "destructive", title: "Bid Failed", description: error.message });
        }
    });
  };
  
  const buyNft = async (nft: Nft) => {
    if (!userId || !nft.ownerId) {
        toast({ variant: "destructive", title: "Cannot complete purchase.", description: "You must be logged in and the NFT must have an owner."});
        return;
    }
    if (userId === nft.ownerId) {
        toast({ variant: "destructive", title: "Cannot buy your own NFT."});
        return;
    }
    if (balance < nft.price) {
        toast({ variant: "destructive", title: "Insufficient funds.", description: "You do not have enough balance to buy this NFT."});
        return;
    }

    try {
      const response = await fetch('/api/buy-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nftId: nft.id,
          sellerId: nft.ownerId,
          buyerId: userId 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }
      
      // The wallet context will automatically update the balance via its own Firestore listener.
      // No need to manually setBalance here.

      toast({ title: "Purchase successful!", description: `You bought ${nft.name}.` });
      
      // The real-time listeners for the marketplace/inventory will handle showing/hiding the NFT automatically.
    
    } catch (error: any) {
        console.error("Purchase failed:", error);
        toast({ variant: "destructive", title: "Purchase Failed", description: error.message });
    }
  };


  const isLoading = isFirebaseUserLoading || isCollectionLoading || isTelegramUserLoading;

  return (
    <NftContext.Provider value={{ nfts: nftsFromDb || [], setNftStatus, isLoading, removeNftFromInventory, addNftToAuctions, placeBid, buyNft }}>
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
