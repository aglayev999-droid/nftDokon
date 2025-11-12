
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import type { Nft, UserAccount } from '@/lib/data';

// This function handles the secure processing of a completed auction.
export async function POST(request: NextRequest) {
  try {
    const { auctionId } = await request.json();

    if (!auctionId) {
      return NextResponse.json({ ok: false, error: 'Missing required field: auctionId' }, { status: 400 });
    }
    
    const auctionRef = adminDb.collection('auctions').doc(auctionId);

    // Use a transaction to ensure the entire process is atomic
    const result = await adminDb.runTransaction(async (transaction) => {
        const auctionDoc = await transaction.get(auctionRef);

        if (!auctionDoc.exists) {
            // If the auction doesn't exist, it might have been processed already.
            // This is not an error, just a sign that we can stop.
            console.log(`Auction ${auctionId} already processed or never existed.`);
            return { ok: true, message: 'Auction already processed.' };
        }

        const auctionData = auctionDoc.data() as Nft;

        // Double-check if the auction has actually ended
        if (auctionData.endTime && Date.now() < auctionData.endTime) {
            throw new Error("Auction has not ended yet.");
        }
        
        const winnerId = auctionData.highestBidderId;
        const ownerId = auctionData.ownerId;
        const finalPrice = auctionData.highestBid;

        if (!winnerId || !ownerId || !finalPrice || finalPrice <= 0) {
            // This case can happen if no one bid. The NFT should be returned to the owner.
            console.log(`Auction ${auctionId} ended with no bids. Removing from auction and returning to owner.`);
            const ownerInventoryRef = adminDb.collection('users').doc(ownerId).collection('inventory').doc(auctionId);
            
            // Explicitly copy required fields to avoid losing them
            const returnedNftData: Partial<Nft> = {
                id: auctionData.id,
                name: auctionData.name,
                price: 0,
                rarity: auctionData.rarity,
                collection: auctionData.collection,
                model: auctionData.model,
                background: auctionData.background,
                imageUrl: auctionData.imageUrl,
                lottieUrl: auctionData.lottieUrl,
                imageHint: auctionData.imageHint,
                isListed: false,
                ownerId: ownerId,
            };

            transaction.set(ownerInventoryRef, returnedNftData);
            transaction.delete(auctionRef);
            return { ok: true, message: 'Auction ended with no bids. NFT returned to owner.'};
        }

        if (winnerId === ownerId) {
            // The owner won their own auction, which means no one else bid higher than the starting price.
            // Just move the NFT back to their inventory.
            const ownerInventoryRef = adminDb.collection('users').doc(ownerId).collection('inventory').doc(auctionId);
            const newNftData: Partial<Nft> = {
                id: auctionData.id,
                name: auctionData.name,
                price: 0,
                rarity: auctionData.rarity,
                collection: auctionData.collection,
                model: auctionData.model,
                background: auctionData.background,
                imageUrl: auctionData.imageUrl,
                lottieUrl: auctionData.lottieUrl,
                imageHint: auctionData.imageHint,
                isListed: false,
                ownerId: ownerId,
            };

            transaction.set(ownerInventoryRef, newNftData);
            transaction.delete(auctionRef);
            return { ok: true, message: 'Auction ended, NFT returned to owner.' };
        }

        const winnerRef = adminDb.collection('users').doc(winnerId);
        const ownerRef = adminDb.collection('users').doc(ownerId);
        
        const [winnerDoc, ownerDoc] = await Promise.all([
            transaction.get(winnerRef),
            transaction.get(ownerRef)
        ]);

        if (!winnerDoc.exists) throw new Error("Winner account not found.");
        if (!ownerDoc.exists) throw new Error("Owner account not found.");

        const winnerData = winnerDoc.data() as UserAccount;

        if (winnerData.balance < finalPrice) {
            // This is a failsafe. The bid shouldn't have been possible without enough balance.
            throw new Error("Winner has insufficient funds.");
        }

        // --- Perform the transaction steps ---

        // 1. Debit winner
        transaction.update(winnerRef, { balance: admin.firestore.FieldValue.increment(-finalPrice) });
        
        // 2. Credit owner
        transaction.update(ownerRef, { balance: admin.firestore.FieldValue.increment(finalPrice) });
        
        // 3. Prepare new NFT data for the winner
        const newNftData: Partial<Nft> = {
            id: auctionData.id,
            name: auctionData.name,
            price: 0,
            rarity: auctionData.rarity,
            collection: auctionData.collection,
            model: auctionData.model,
            background: auctionData.background,
            imageUrl: auctionData.imageUrl,
            lottieUrl: auctionData.lottieUrl,
            imageHint: auctionData.imageHint,
            isListed: false,
            ownerId: winnerId, // New owner!
        };
        
        // 4. Create the NFT in the winner's inventory
        const winnerInventoryRef = winnerRef.collection('inventory').doc(auctionId);
        transaction.set(winnerInventoryRef, newNftData);

        // 5. Delete the NFT from the auctions collection
        transaction.delete(auctionRef);

        return { ok: true, message: `Auction ${auctionId} processed successfully. Winner: ${winnerId}` };
    });
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error in /api/process-auction:', error);
    return NextResponse.json({ ok: false, error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
