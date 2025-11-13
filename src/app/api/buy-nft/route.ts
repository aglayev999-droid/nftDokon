
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import type { Nft, UserAccount } from '@/lib/data';

// This function handles the secure process of an NFT purchase.
export async function POST(request: NextRequest) {
  try {
    const { nftId, sellerId, buyerId } = await request.json();

    if (!nftId || !sellerId || !buyerId) {
      return NextResponse.json({ ok: false, error: 'Missing required fields: nftId, sellerId, buyerId' }, { status: 400 });
    }

    if (sellerId === buyerId) {
        return NextResponse.json({ ok: false, error: 'Buyer and seller cannot be the same person.' }, { status: 400 });
    }

    const sellerRef = adminDb.collection('users').doc(sellerId);
    const buyerRef = adminDb.collection('users').doc(buyerId);
    const originalNftRef = adminDb.collection('users').doc(sellerId).collection('inventory').doc(nftId);
    const newNftRef = adminDb.collection('users').doc(buyerId).collection('inventory').doc(nftId);
    
    // Run as a transaction to ensure all or nothing
    await adminDb.runTransaction(async (transaction) => {
        const [sellerDoc, buyerDoc, originalNftDoc] = await Promise.all([
            transaction.get(sellerRef),
            transaction.get(buyerRef),
            transaction.get(originalNftRef)
        ]);

        if (!sellerDoc.exists) throw new Error("Seller account not found.");
        if (!buyerDoc.exists) throw new Error("Buyer account not found.");
        if (!originalNftDoc.exists) throw new Error("The NFT is no longer available from this seller.");

        const sellerData = sellerDoc.data() as UserAccount;
        const buyerData = buyerDoc.data() as UserAccount;
        const nftData = originalNftDoc.data() as Nft;
        
        if (!nftData.isListed || !nftData.price) {
            throw new Error("This NFT is not for sale.");
        }

        if (buyerData.balance < nftData.price) {
            throw new Error("Insufficient funds.");
        }

        // --- Perform the transaction steps ---

        // 1. Debit buyer
        transaction.update(buyerRef, { balance: admin.firestore.FieldValue.increment(-nftData.price) });
        
        // 2. Credit seller
        transaction.update(sellerRef, { balance: admin.firestore.FieldValue.increment(nftData.price) });
        
        // 3. Prepare new NFT data for the buyer
        const newNftData = { ...nftData, ownerId: buyerId, isListed: false, price: 0 };

        // 4. Move the NFT: delete from seller's inventory
        transaction.delete(originalNftRef);
        
        // 5. Move the NFT: create in buyer's inventory
        transaction.set(newNftRef, newNftData);
    });
    
    return NextResponse.json({ ok: true, message: `Successfully purchased NFT ${nftId}.` });

  } catch (error: any) {
    console.error('Error in /api/buy-nft:', error);
    // Ensure a structured error is always returned
    return NextResponse.json({ ok: false, error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
