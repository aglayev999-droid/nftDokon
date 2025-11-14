
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
import { collection, doc, runTransaction, WithFieldValue, writeBatch, getDoc, setDoc, deleteDoc, serverTimestamp, increment, getDocs, query, where } from 'firebase/firestore';
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
    
    const bootstrapUser = async () => {
        try {
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                 // Extract referral ID from start param if it exists (e.g. from a referral link)
                 const params = new URLSearchParams(window.location.search);
                 const tgWebAppStartParam = params.get('tgWebAppStartParam');
                 const refId = tgWebAppStartParam && tgWebAppStartParam.startsWith('ref_') ? tgWebAppStartParam.replace('ref_', '') : null;

                const userAccountData: UserAccount = {
                    id: userId,
                    telegramId: String(telegramUser.id),
                    username: telegramUser.username || telegramUser.first_name,
                    fullName: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
                    balance: 1000000, // Initial balance for new users
                    nftsBought: 0,
                    nftsSold: 0,
                    tradeVolume: 0,
                    referrals: 0,
                    referralEarnings: 0,
                    ...(refId && { referredBy: refId }), // Add referredBy if refId exists
                };
                
                await setDoc(userDocRef, userAccountData);
                console.log(`New user bootstrapped: ${userId}`);

                // If referred, update the referrer's count
                if (refId) {
                  // Find referrer by their Telegram ID
                  const usersCollectionRef = collection(firestore, 'users');
                  const q = query(usersCollectionRef, where("telegramId", "==", refId));
                  const referrerQuerySnapshot = await getDocs(q);

                  if (!referrerQuerySnapshot.empty) {
                    const referrerDoc = referrerQuerySnapshot.docs[0];
                    await setDoc(referrerDoc.ref, { referrals: increment(1) }, { merge: true });
                    console.log(`Referrer ${referrerDoc.id} updated.`);
                  } else {
                    console.warn(`Referrer with Telegram ID ${refId} not found.`);
                  }
                }
            }
        } catch (error: any) {
            console.error("Error bootstrapping user:", error);
            if (error.code === 'permission-denied') {
                const contextualError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'create', // Corrected operation type
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
        toast({ variant: "destructive", title: "Siz narx taklif qilish uchun tizimga kirishingiz kerak."});
        return;
    }
    if (userId === nft.ownerId) {
        toast({ variant: "destructive", title: "O'zingizning auksioningizga narx taklif qila olmaysiz."});
        return;
    }

    const auctionRef = doc(firestore, 'auctions', nft.id);
    const userRef = doc(firestore, 'users', userId);

    runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const auctionDoc = await transaction.get(auctionRef);

        if (!userDoc.exists()) throw new Error("Foydalanuvchi hisobi topilmadi.");
        if (!auctionDoc.exists()) throw new Error("Bu auksion endi mavjud emas.");

        const userData = userDoc.data() as UserAccount;
        const auctionData = auctionDoc.data() as Nft;

        if (userData.balance < bidAmount) throw new Error("Ushbu narxni taklif qilish uchun balansingizda mablag' yetarli emas.");
        if (bidAmount <= (auctionData.highestBid || 0)) throw new Error("Sizning taklifingiz joriy eng yuqori taklifdan baland bo'lishi kerak.");
        
        const updateData = { 
            highestBid: bidAmount,
            highestBidderId: userId,
        };
        transaction.update(auctionRef, updateData);
    })
    .then(() => {
        toast({ title: "Taklif muvaffaqiyatli!", description: `Siz endi ${nft.name} uchun eng yuqori narxni taklif qildingiz.` });
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
            console.error("Taklif xatosi:", error);
            toast({ variant: "destructive", title: "Taklif Amalga Oshmadi", description: error.message });
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
    const commission = price * 0.01; // 1% commission
    
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

            // 1. Debit buyer
            transaction.update(buyerUserRef, { 
                balance: increment(-price),
                nftsBought: increment(1),
                tradeVolume: increment(price)
            });
            // 2. Credit seller
            transaction.update(sellerUserRef, { 
                balance: increment(price - commission),
                nftsSold: increment(1),
                tradeVolume: increment(price)
             });

            // 3. Credit referrer if one exists
            if (buyerData.referredBy) {
                const usersCollectionRef = collection(firestore, 'users');
                const q = query(usersCollectionRef, where("telegramId", "==", buyerData.referredBy));
                const referrerQuerySnapshot = await getDocs(q);

                if (!referrerQuerySnapshot.empty) {
                    const referrerDoc = referrerQuerySnapshot.docs[0];
                    transaction.update(referrerDoc.ref, {
                        balance: increment(commission),
                        referralEarnings: increment(commission)
                    });
                }
            }

            // 4. Move NFT from marketplace to buyer's inventory
            const newInventoryData: Nft = { ...nftData, ownerId: userId, isListed: false, price: 0 };
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
