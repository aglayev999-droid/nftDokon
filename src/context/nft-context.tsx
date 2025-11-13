
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { Nft, UserAccount } from '@/lib/data';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import { collection, doc, runTransaction, FirestoreError, WithFieldValue, writeBatch, getDoc, setDoc, deleteDoc, serverTimestamp, increment } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useTelegramUser } from './telegram-user-context';
import { useWallet } from './wallet-context';

interface NftContextType {
  inventoryNfts: Nft[];
  marketplaceNfts: Nft[];
  setNftForSale: (nftId: string, price: number) => void;
  removeNftFromSale: (nftId: string) => void;
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
  const { balance } = useWallet();

  const userId = firebaseUser?.uid;

  // Hook for user's personal inventory
  const inventoryRef = useMemoFirebase(
    () => (userId && firestore ? collection(firestore, 'users', userId, 'inventory') : null),
    [userId, firestore]
  );
  const { data: inventoryNfts, isLoading: isInventoryLoading } = useCollection<Nft>(inventoryRef);

  // Hook for the global marketplace
  const marketplaceRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'marketplace') : null),
    [firestore]
  );
  const { data: marketplaceNfts, isLoading: isMarketplaceLoading } = useCollection<Nft>(marketplaceRef);


  // Effect to bootstrap user data
  useEffect(() => {
    if (!userId || !telegramUser || isFirebaseUserLoading || isTelegramUserLoading || !firestore) {
      return;
    }

    const userDocRef = doc(firestore, 'users', userId);
    
    // Extract referral ID from URL
    const params = new URLSearchParams(window.location.search);
    const refId = params.get('start')?.replace('ref_', '');

    const bootstrapUser = async () => {
        try {
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                const userAccountData: UserAccount = {
                    id: userId,
                    telegramId: String(telegramUser.id),
                    username: telegramUser.username || telegramUser.first_name,
                    fullName: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
                    balance: 1000000,
                    nftsBought: 0,
                    nftsSold: 0,
                    tradeVolume: 0,
                    referrals: 0,
                    referralEarnings: 0,
                    ...(refId && { referredBy: refId }), // Add referredBy if refId exists
                };
                await setDoc(userDocRef, userAccountData);

                // If referred, update the referrer's count
                if (refId) {
                  const referrerQuery = await getDocs(collection(firestore, 'users').where('telegramId', '==', refId).limit(1));
                  if (!referrerQuery.empty) {
                    const referrerDoc = referrerQuery.docs[0];
                    await setDoc(referrerDoc.ref, { referrals: increment(1) }, { merge: true });
                  }
                }
            }
        } catch (error: any) {
            console.error("Error bootstrapping user:", error);
            if (error.code === 'permission-denied') {
                const contextualError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'write',
                    requestResourceData: { userId, telegramUser }
                });
                errorEmitter.emit('permission-error', contextualError);
            }
        }
    };

    bootstrapUser();

  }, [userId, telegramUser, firestore, isFirebaseUserLoading, isTelegramUserLoading]);


  const setNftForSale = async (nftId: string, price: number) => {
    if (!userId || !firestore) return;
    
    const inventoryDocRef = doc(firestore, 'users', userId, 'inventory', nftId);
    const marketplaceDocRef = doc(firestore, 'marketplace', nftId);

    try {
        await runTransaction(firestore, async (transaction) => {
            const inventoryDoc = await transaction.get(inventoryDocRef);
            if (!inventoryDoc.exists()) {
                throw new Error("NFT not found in your inventory.");
            }

            const nftData = inventoryDoc.data() as Nft;
            const marketplaceNftData: Nft = {
                ...nftData,
                price: price,
                isListed: true, 
                ownerId: userId 
            };

            transaction.set(marketplaceDocRef, marketplaceNftData);
            transaction.delete(inventoryDocRef);
        });
        toast({ title: "Muvaffaqiyatli!", description: `NFT sotuvga qo'yildi.`});
    } catch (error: any) {
        console.error("Error listing NFT:", error);
        toast({ variant: 'destructive', title: 'Xatolik', description: error.message });
    }
  };
  
  const removeNftFromSale = async (nftId: string) => {
    if (!userId || !firestore) return;
    
    const marketplaceDocRef = doc(firestore, 'marketplace', nftId);
    const inventoryDocRef = doc(firestore, 'users', userId, 'inventory', nftId);

    try {
        await runTransaction(firestore, async (transaction) => {
            const marketplaceDoc = await transaction.get(marketplaceDocRef);
            if (!marketplaceDoc.exists()) {
                throw new Error("NFT not found in the marketplace.");
            }
            
            const nftData = marketplaceDoc.data() as Nft;

            if (nftData.ownerId !== userId) {
                throw new Error("You are not the owner of this NFT.");
            }
            
            const inventoryNftData: Nft = {
                ...nftData,
                price: 0,
                isListed: false
            };

            transaction.set(inventoryDocRef, inventoryNftData);
            transaction.delete(marketplaceDocRef);
        });
        toast({ title: "Muvaffaqiyatli!", description: "NFT sotuvdan olindi."});
    } catch (error: any) {
        console.error("Error unlisting NFT:", error);
        toast({ variant: 'destructive', title: 'Xatolik', description: error.message });
    }
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
        if (error.code === "permission-denied") {
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
    if (!userId || !nft.ownerId || !firestore) {
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

    const sellerId = nft.ownerId;
    const price = nft.price;
    const commission = price * 0.01;
    
    const marketplaceDocRef = doc(firestore, 'marketplace', nft.id);
    const buyerInventoryDocRef = doc(firestore, 'users', userId, 'inventory', nft.id);
    const sellerUserRef = doc(firestore, 'users', sellerId);
    const buyerUserRef = doc(firestore, 'users', userId);

    try {
        await runTransaction(firestore, async (transaction) => {
            const marketplaceDoc = await transaction.get(marketplaceDocRef);
            if (!marketplaceDoc.exists()) throw new Error("This NFT is no longer for sale.");

            const sellerDoc = await transaction.get(sellerUserRef);
            if (!sellerDoc.exists()) throw new Error("Seller account not found.");
            
            const buyerDoc = await transaction.get(buyerUserRef);
            if (!buyerDoc.exists()) throw new Error("Buyer account not found.");
            
            const nftData = marketplaceDoc.data() as Nft;
            const buyerData = buyerDoc.data() as UserAccount;

            if (buyerData.balance < nftData.price) throw new Error("Insufficient funds.");

            // Debit buyer
            transaction.update(buyerUserRef, { 
                balance: increment(-price),
                nftsBought: increment(1),
                tradeVolume: increment(price)
            });
            // Credit seller
            transaction.update(sellerUserRef, { 
                balance: increment(price - commission),
                nftsSold: increment(1),
                tradeVolume: increment(price)
             });

            // Credit referrer if exists
            if (buyerData.referredBy) {
                const referrerQuery = await getDocs(collection(firestore, 'users').where('telegramId', '==', buyerData.referredBy).limit(1));
                if (!referrerQuery.empty) {
                    const referrerDoc = referrerQuery.docs[0];
                    transaction.update(referrerDoc.ref, {
                        balance: increment(commission),
                        referralEarnings: increment(commission)
                    });
                }
            }

            // Move NFT from marketplace to buyer's inventory
            const newInventoryData = { ...nftData, ownerId: userId, isListed: false, price: 0 };
            transaction.set(buyerInventoryDocRef, newInventoryData);
            transaction.delete(marketplaceDocRef);
        });

        toast({ title: "Purchase successful!", description: `You bought ${nft.name}.` });
    } catch (error: any) {
        console.error("Purchase failed:", error);
        toast({ variant: "destructive", title: "Purchase Failed", description: error.message });
    }
  };


  const isLoading = isFirebaseUserLoading || isInventoryLoading || isMarketplaceLoading || isTelegramUserLoading;

  return (
    <NftContext.Provider value={{ 
        inventoryNfts: inventoryNfts || [], 
        marketplaceNfts: marketplaceNfts || [],
        setNftForSale, 
        removeNftFromSale,
        isLoading, 
        removeNftFromInventory, 
        addNftToAuctions, 
        placeBid, 
        buyNft 
    }}>
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
