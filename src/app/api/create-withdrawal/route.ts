
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { ApplicationBuilder, ContextTypes } from 'telegram';
import { sendTelegramNotification } from '@/lib/telegram';

// Bu funksiya yechib olish so'rovini yaratadi va adminga Telegram orqali xabar yuboradi.
export async function POST(request: NextRequest) {
  try {
    const { userId, nftId, nftName, telegramUsername } = await request.json();

    if (!userId || !nftId || !nftName || !telegramUsername) {
      return NextResponse.json({ ok: false, error: 'Barcha maydonlar to\'ldirilishi shart' }, { status: 400 });
    }

    const withdrawalRef = adminDb.collection('withdrawals').doc();
    const inventoryItemRef = adminDb.doc(`users/${userId}/inventory/${nftId}`);

    const withdrawalData = {
      userId: userId,
      telegramUsername: telegramUsername,
      nftId: nftId,
      nftName: nftName,
      status: 'pending',
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // 1. Tranzaksiya yordamida Firestore'ga yozish
    await adminDb.runTransaction(async (transaction) => {
        const itemDoc = await transaction.get(inventoryItemRef);
        if (!itemDoc.exists) {
            throw new Error("Inventardagi NFT topilmadi.");
        }
        transaction.set(withdrawalRef, withdrawalData);
        transaction.delete(inventoryItemRef);
    });

    // 2. Adminga Telegram orqali xabar yuborish
    try {
        await sendTelegramNotification(
            `📢 Yangi yechib olish so'rovi!\n\n` +
            `👤 Foydalanuvchi ID: \`${userId}\`\n` +
            `🎁 NFT Nomi: *${nftName}*\n` +
            `🎯 Telegram Manzili: \`${telegramUsername}\`\n\n` +
            `Iltimos, \`auto_relayer.py\` skripti yordamida sovg'ani ushbu manzilga yuboring.`
        );
    } catch (telegramError: any) {
        // Agar telegram xabari ketmasa ham, asosiy so'rov muvaffaqiyatli deb hisoblanadi.
        // Xatolikni server loglariga yozib qo'yamiz.
        console.error("Telegram xabarini yuborishda xatolik:", telegramError.message);
    }


    return NextResponse.json({ ok: true, message: 'So\'rov muvaffaqiyatli yaratildi.' });

  } catch (error: any) {
    console.error('Error in /api/create-withdrawal:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Serverda noma\'lum xatolik yuz berdi.' }, { status: 500 });
  }
}
