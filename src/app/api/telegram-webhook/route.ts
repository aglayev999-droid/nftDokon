
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { nftsData } from '@/lib/data';

// Bu funksiya Telegramdan keladigan webhook so'rovlarini qabul qiladi.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Telegramdan kelgan xabarni va foydalanuvchini ajratib olamiz.
    const message = body.message;
    const telegramUser = message?.from;
    const text = message?.text?.trim();

    if (!telegramUser || !text) {
      return NextResponse.json({ ok: false, error: 'Invalid message structure' }, { status: 400 });
    }

    // Foydalanuvchining Telegram ID'si
    const telegramId = String(telegramUser.id);
    console.log(`Processing message from Telegram User ID: ${telegramId}`);

    // Oddiy misol: Foydalanuvchi "add <nft_id>" formatida xabar yuboradi.
    // Haqiqiy hayotda bu forward qilingan giftni parse qilish bo'ladi.
    if (text.startsWith('add ')) {
      const nftIdToAdd = text.split(' ')[1];
      const nftTemplate = nftsData.find(nft => nft.id === nftIdToAdd);

      if (!nftTemplate) {
        console.log(`NFT with id ${nftIdToAdd} not found in template data.`);
        return NextResponse.json({ ok: false, error: 'NFT template not found' }, { status: 404 });
      }

      // Firestore'dan telegramId bo'yicha foydalanuvchini qidiramiz
      const usersRef = adminDb.collection('users');
      const userQuery = await usersRef.where('telegramId', '==', telegramId).limit(1).get();

      if (userQuery.empty) {
        console.log(`User with Telegram ID ${telegramId} not found in Firestore.`);
        return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
      }

      const userDoc = userQuery.docs[0];
      const firebaseUserId = userDoc.id;

      // Yangi NFT ni foydalanuvchi inventariga qo'shamiz
      const inventoryRef = userDoc.ref.collection('inventory');
      const newNftData = {
        ...nftTemplate,
        ownerId: firebaseUserId, // Firestore document ID'sini ownerId sifatida ishlatamiz
        isListed: false, // Boshida sotuvda emas
        price: 0,
      };
      
      // Yangi hujjatni nft'ning o'z ID'si bilan qo'shamiz
      await inventoryRef.doc(nftTemplate.id).set(newNftData);
      
      console.log(`Successfully added NFT '${nftTemplate.name}' to inventory of user ${firebaseUserId}`);

      return NextResponse.json({ ok: true, message: `NFT ${nftIdToAdd} added.` });
    }

    return NextResponse.json({ ok: true, message: 'Message received but no action taken.' });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
