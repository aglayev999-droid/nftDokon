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
import { collection, doc, writeBatch, runTransaction, getDoc, Transaction } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useTelegramUser } from './telegram-user-context';
import { useWallet } from './wallet-context';

interface NftContextType {
  nfts: Nft[];
  setNftStatus: (nftId: string, isListed: boolean, price?: number) => void;
  isLoading: boolean;
  removeNftFromInventory: (nftId: string) => Promise<void>;
  addNftToAuctions: (nft: Nft) => Promise<void>;
  placeBid: (nft: Nft, bidAmount: number) => Promise<void>;
  buyNft: (nft: Nft) => Promise<void>;
}

const NftContext = createContext<NftContextType | undefined>(undefined);

export const NftProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser, isUserLoading: isFirebaseUserLoading } = useUser();
  const { user: telegramUser, isLoading: isTelegramUserLoading } = useTelegramUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { setBalance } = useWallet();

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
    if (!userId || !telegramUser || isFirebaseUserLoading || isTelegramUserLoading || !firestore) {
      return;
    }

    const userDocRef = doc(firestore, 'users', userId);

    const bootstrapUser = async () => {
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            console.log(`User document for ${userId} does not exist, bootstrapping...`);
            const batch = writeBatch(firestore);

            const newUserAccount: UserAccount = {
                id: userId,
                telegramId: String(telegramUser.id),
                username: telegramUser.username || `${telegramUser.first_name} ${telegramUser.last_name || ''}`,
                balance: 100000,
            };
            batch.set(userDocRef, newUserAccount);
            setBalance(newUserAccount.balance);

            nftsData.forEach((nft) => {
                // Assign some NFTs to the new user and some to others
                 const userNft = { ...nft, ownerId: nft.id === 'fresh-socks-91000' ? userId : `other-user-${Math.random()}` };
                const newDocRef = doc(firestore, 'users', userId, 'inventory', nft.id);
                batch.set(newDocRef, userNft);
            });
            
            await batch.commit();
            console.log(`User ${userId} and their inventory have been bootstrapped.`);
        } else {
             const userData = userDoc.data() as UserAccount;
             setBalance(userData.balance || 0);
        }
    };
    
    bootstrapUser().catch(error => {
        console.error("Error bootstrapping user and inventory:", error);
    });

  }, [userId, telegramUser, firestore, isFirebaseUserLoading, isTelegramUserLoading, setBalance]);


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
    deleteDocumentNonBlocking(docRef);
  }, [userId, firestore]);

  const addNftToAuctions = useCallback(async (nft: Nft) => {
      if (!userId || !firestore) return;
      const auctionsCollection = collection(firestore, 'auctions');
      const auctionNft = { ...nft, ownerId: userId };
      const auctionDocRef = doc(auctionsCollection, nft.id);
      setDocumentNonBlocking(auctionDocRef, auctionNft, {});
  }, [firestore, userId]);
  
  const placeBid = async (nft: Nft, bidAmount: number) => {
    if (!userId || !firestore) {
        toast({ variant: "destructive", title: "You must be logged in to bid."});
        return;
    }

    const auctionRef = doc(firestore, 'auctions', nft.id);

    try {
        await runTransaction(firestore, async (transaction) => {
            const userRef = doc(firestore, 'users', userId);
            const userDoc = await transaction.get(userRef);
            const auctionDoc = await transaction.get(auctionRef);

            if (!userDoc.exists()) throw new Error("Your user account was not found.");
            if (!auctionDoc.exists()) throw new Error("This auction no longer exists.");

            const userData = userDoc.data() as UserAccount;
            const auctionData = auctionDoc.data() as Nft;

            if (userData.balance < bidAmount) throw new Error("Not enough balance to place this bid.");
            if (bidAmount <= (auctionData.highestBid || 0)) throw new Error("Your bid must be higher than the current highest bid.");
            
            // Note: In a real app, you might want to handle refunding the previous highest bidder.
            // For this version, we will just update the bid. The money is transferred at the end.
            transaction.update(auctionRef, { 
                highestBid: bidAmount,
                highestBidderId: userId,
            });
        });
        toast({ title: "Bid placed successfully!", description: `You are now the highest bidder for ${nft.name}.` });
    } catch (error: any) {
        console.error("Bid failed:", error);
        toast({ variant: "destructive", title: "Bid Failed", description: error.message });
    }
  };
  
  const buyNft = async (nft: Nft) => {
    if (!userId || !firestore || !nft.ownerId) {
        toast({ variant: "destructive", title: "Cannot complete purchase.", description: "You must be logged in and the NFT must have an owner."});
        return;
    }
    if (userId === nft.ownerId) {
        toast({ variant: "destructive", title: "Cannot buy your own NFT."});
        return;
    }

    try {
        await runTransaction(firestore, async (transaction) => {
            const sellerRef = doc(firestore, "users", nft.ownerId!);
            const buyerRef = doc(firestore, "users", userId);
            const originalNftRef = doc(firestore, "users", nft.ownerId!, "inventory", nft.id);
            
            const [sellerDoc, buyerDoc] = await Promise.all([
                transaction.get(sellerRef),
                transaction.get(buyerRef)
            ]);

            if (!sellerDoc.exists()) throw new Error("Seller account not found.");
            if (!buyerDoc.exists()) throw new Error("Buyer account not found.");

            const sellerData = sellerDoc.data() as UserAccount;
            const buyerData = buyerDoc.data() as UserAccount;
            
            if (buyerData.balance < nft.price) throw new Error("Insufficient funds.");

            // Transfer money
            transaction.update(buyerRef, { balance: buyerData.balance - nft.price });
            transaction.update(sellerRef, { balance: sellerData.balance + nft.price });

            // Transfer NFT
            const newNftData = { ...nft, ownerId: userId, isListed: false };
            const newNftRef = doc(firestore, "users", userId, "inventory", nft.id);
            transaction.delete(originalNftRef);
            transaction.set(newNftRef, newNftData);
        });

        toast({ title: "Purchase successful!", description: `You bought ${nft.name}.` });
        setBalance(prev => prev - nft.price);

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
