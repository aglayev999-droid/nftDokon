
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// Bu funksiya Telegramdan keladigan webhook so'rovlarini qabul qiladi.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Telegramdan kelgan xabarni va foydalanuvchini ajratib olamiz.
    const message = body.message;
    const telegramUser = message?.from;

    if (!telegramUser) {
      return NextResponse.json({ ok: false, error: 'Invalid message structure: User not found' }, { status: 400 });
    }

    // This is where you would parse the actual forwarded gift message
    // For now, we'll just log that we received a message.
    // In a real implementation, you would extract NFT details from 'message'.
    
    // Example: const nftDetails = parseForwardedMessage(message);

    const telegramId = String(telegramUser.id);
    console.log(`Processing message from Telegram User ID: ${telegramId}`);
    
    // Find user by Telegram ID
    const usersRef = adminDb.collection('users');
    const userQuery = await usersRef.where('telegramId', '==', telegramId).limit(1).get();

    if (userQuery.empty) {
      console.log(`User with Telegram ID ${telegramId} not found in Firestore.`);
      // You might want to create a user here if they don't exist
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    const userDoc = userQuery.docs[0];
    const firebaseUserId = userDoc.id;

    console.log(`User ${firebaseUserId} (Telegram: ${telegramId}) sent a message.`);
    
    // Add your logic here to create the NFT and add it to the user's inventory
    // const newNftData = { ... };
    // await userDoc.ref.collection('inventory').add(newNftData);


    return NextResponse.json({ ok: true, message: 'Message received and processed.' });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
