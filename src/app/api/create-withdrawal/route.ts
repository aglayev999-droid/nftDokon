
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { spawn } from 'child_process';
import path from 'path';
import { Nft } from '@/lib/data';

const WITHDRAWAL_FEE = 4000; // 4,000 UZS

export async function POST(request: NextRequest) {
  try {
    const { userId, nftId, telegramUsername } = await request.json();

    if (!userId || !nftId || !telegramUsername) {
      return NextResponse.json({ ok: false, error: 'Barcha maydonlar to\'ldirilishi shart' }, { status: 400 });
    }

    const userRef = adminDb.doc(`users/${userId}`);
    const inventoryItemRef = adminDb.doc(`users/${userId}/inventory/${nftId}`);
    const withdrawalRef = adminDb.collection('withdrawals').doc();

    let giftUid: string | undefined;

    // 1. Transaction to check balance, deduct fee, and prepare for withdrawal
    await adminDb.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const itemDoc = await transaction.get(inventoryItemRef);

        if (!userDoc.exists) {
            throw new Error("Foydalanuvchi hisobi topilmadi.");
        }
        if (!itemDoc.exists) {
            throw new Error("Inventardagi NFT topilmadi.");
        }

        const userData = userDoc.data();
        const nftData = itemDoc.data() as Nft;

        if (!nftData.giftUid) {
            throw new Error("Bu NFTni yechib bo'lmaydi (sovg'a IDsi topilmadi). Iltimos, administrator bilan bog'laning.");
        }
        giftUid = nftData.giftUid;

        if (!userData || userData.balance < WITHDRAWAL_FEE) {
            throw new Error(`Balansingizda yetarli mablag' yo'q. Yechib olish uchun ${WITHDRAWAL_FEE.toLocaleString()} UZS kerak.`);
        }

        // Deduct the fee
        transaction.update(userRef, { balance: admin.firestore.FieldValue.increment(-WITHDRAWAL_FEE) });
        
        // Log the withdrawal request as pending.
        const withdrawalData = {
          userId: userId,
          telegramUsername: telegramUsername,
          nftId: nftId,
          nftName: nftData.name,
          giftUid: giftUid,
          status: 'pending', 
          requestedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        transaction.set(withdrawalRef, withdrawalData);
    });

    if (!giftUid) {
        // This should not happen if the transaction was successful, but as a safeguard.
        throw new Error("Sovg'a IDsi aniqlanmadi. Jarayon to'xtatildi.");
    }

    // 2. Python skriptini ishga tushirish (to'lovdan keyin)
    const scriptPath = path.resolve(process.cwd(), 'scripts/auto_relayer.py');
    // Pass username AND the specific gift_uid to the script
    const pythonProcess = spawn('python3', [scriptPath, telegramUsername, giftUid]);

    let scriptOutput = '';
    let scriptError = '';

    pythonProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      console.log(`Python stdout: ${chunk}`);
      scriptOutput += chunk;
    });

    pythonProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      console.error(`Python stderr: ${chunk}`);
      scriptError += chunk;
    });
    
    pythonProcess.on('error', (err) => {
        console.error('Failed to start subprocess.', err);
        scriptError = `Failed to start script: ${err.message}. Make sure python3 is installed and in the system's PATH. ${scriptError}`;
    });

    const scriptResult = await new Promise<{ success: boolean; message: string }>((resolve) => {
        pythonProcess.on('close', (code) => {
            console.log(`Python script exited with code ${code}`);
            if (code === 0 && scriptOutput.includes('✅ Gift muvaffaqiyatli yuborildi')) {
                resolve({ success: true, message: scriptOutput });
            } else {
                const fullError = (scriptError || 'Script produced an error.') + `\n--- Output ---\n` + (scriptOutput || 'No output.');
                resolve({ success: false, message: fullError });
            }
        });
    });

    // 3. Agar skript muvaffaqiyatsiz bo'lsa
    if (!scriptResult.success) {
      if (scriptResult.message.includes('telethon.errors.rpcerrorlist.UserNotMutualContactError')) {
           return NextResponse.json({ ok: false, error: 'Xatolik: Bot sizning kontaktingizda emas. Iltimos, botni kontaktingizga qo\'shing.' }, { status: 400 });
      }
      if (scriptResult.message.includes('Kerakli gift topilmadi')) {
           return NextResponse.json({ ok: false, error: 'Yechib olinadigan sovg\'a zaxiramizda topilmadi. Bu sovg\'a allaqachon boshqa joyga ishlatilgan bo\'lishi mumkin.' }, { status: 400 });
      }
      console.error(`Full Python script error for withdrawal: ${scriptResult.message}`);
      return NextResponse.json({ ok: false, error: `Sovg'ani yuborishda noma'lum xatolik yuz berdi. To'lov ushlab qolindi. Administrator bilan bog'laning.` }, { status: 500 });
    }

    // 4. Skript muvaffaqiyatli bo'lsa, Firestore'dagi ma'lumotlarni yakuniy yangilash
    await adminDb.runTransaction(async (transaction) => {
        transaction.update(withdrawalRef, {
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        transaction.delete(inventoryItemRef);
    });

    return NextResponse.json({ ok: true, message: 'Sovg\'a muvaffaqiyatli yuborildi va inventardan o\'chirildi.' });

  } catch (error: any) {
    console.error('Error in /api/create-withdrawal:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Serverda noma\'lum xatolik yuz berdi.' }, { status: 500 });
  }
}
