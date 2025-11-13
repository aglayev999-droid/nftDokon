
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

        if (!winnerId || !ownerId || !finalPrice || finalPrice <= (auctionData.startingPrice || 0) || winnerId === ownerId) {
            // This case happens if no one bid, or the owner "won" their own auction (no other bids).
            // The NFT should be returned to the owner.
            console.log(`Auction ${auctionId} ended with no valid higher bids. Returning to owner.`);
            const ownerInventoryRef = adminDb.collection('users').doc(ownerId).collection('inventory').doc(auctionId);
            
            // Create a clean NFT object to return, removing all auction-specific fields.
            const returnedNftData: Nft = {
                id: auctionData.id,
                name: auctionData.name,
                price: 0,
                rarity: auctionData.rarity,
                collection: auctionData.collection,
                model: auctionData.model,
                background: auctionData.background,
                symbol: auctionData.symbol,
                imageUrl: auctionData.imageUrl,
                lottieUrl: auctionData.lottieUrl,
                imageHint: auctionData.imageHint,
                isListed: false,
                ownerId: ownerId,
            };

            // Set the clean NFT object back into the owner's inventory.
            transaction.set(ownerInventoryRef, returnedNftData);
            // Delete the auction record.
            transaction.delete(auctionRef);
            
            return { ok: true, message: 'Auction ended with no valid bids. NFT returned to owner.'};
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
        
        // 3. Prepare new NFT data for the winner, cleaning auction fields.
        const newNftData: Nft = {
            id: auctionData.id,
            name: auctionData.name,
            price: 0,
            rarity: auctionData.rarity,
            collection: auctionData.collection,
            model: auctionData.model,
            background: auctionData.background,
            symbol: auctionData.symbol,
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
    // Ensure a structured error is always returned
    return NextResponse.json({ ok: false, error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

