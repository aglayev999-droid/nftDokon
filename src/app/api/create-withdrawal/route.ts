
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { spawn } from 'child_process';
import path from 'path';

// Bu funksiya yechib olish so'rovini qayta ishlaydi va avtomatik ravishda sovg'a yuborish skriptini ishga tushiradi.
export async function POST(request: NextRequest) {
  try {
    const { userId, nftId, nftName, telegramUsername } = await request.json();

    if (!userId || !nftId || !nftName || !telegramUsername) {
      return NextResponse.json({ ok: false, error: 'Barcha maydonlar to\'ldirilishi shart' }, { status: 400 });
    }

    // 1. Python skriptini ishga tushirish
    const scriptPath = path.resolve(process.cwd(), 'scripts/auto_relayer.py');
    const pythonProcess = spawn('python3', [scriptPath, telegramUsername]);

    let scriptOutput = '';
    let scriptError = '';

    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
      console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      scriptError += data.toString();
      console.error(`Python stderr: ${data}`);
    });
    
    // Handle spawn errors, e.g., command not found
    pythonProcess.on('error', (err) => {
        console.error('Failed to start subprocess.', err);
        scriptError += `Failed to start script: ${err.message}. Make sure python3 is installed and in the system's PATH.`;
    });

    const scriptResult = await new Promise<{ success: boolean; message: string }>((resolve) => {
        pythonProcess.on('close', (code) => {
            console.log(`Python script exited with code ${code}`);
            if (code === 0 && scriptOutput.includes('✅ Gift muvaffaqiyatli yuborildi')) {
                resolve({ success: true, message: 'Sovg\'a muvaffaqiyatli yuborildi.' });
            } else {
                // Prepend spawn error if it exists
                resolve({ success: false, message: scriptError || scriptOutput || 'Skriptni ishga tushirishda noma\'lum xatolik.' });
            }
        });
    });

    // 2. Agar skript muvaffaqiyatsiz bo'lsa, jarayonni to'xtatish
    if (!scriptResult.success) {
      // Skriptdagi keng tarqalgan xatolarni aniqlash
      if (scriptResult.message.includes('telethon.errors.rpcerrorlist.UserNotMutualContactError')) {
           return NextResponse.json({ ok: false, error: 'Xatolik: Bot sizning kontaktingizda emas. Iltimos, botni kontaktingizga qo\'shing.' }, { status: 400 });
      }
       if (scriptResult.message.includes('JSON bo\'sh giftlarni qidiryapman')) {
           return NextResponse.json({ ok: false, error: 'Hozircha yuborish uchun sovg\'alar qolmadi. Iltimos, keyinroq urinib ko\'ring.' }, { status: 400 });
      }
      return NextResponse.json({ ok: false, error: `Sovg'ani yuborishda xatolik: ${scriptResult.message}` }, { status: 500 });
    }


    // 3. Skript muvaffaqiyatli bo'lsa, Firestore'dagi ma'lumotlarni yangilash
    const withdrawalRef = adminDb.collection('withdrawals').doc();
    const inventoryItemRef = adminDb.doc(`users/${userId}/inventory/${nftId}`);

    const withdrawalData = {
      userId: userId,
      telegramUsername: telegramUsername,
      nftId: nftId,
      nftName: nftName,
      status: 'completed', // Statusni 'completed' ga o'zgartiramiz
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await adminDb.runTransaction(async (transaction) => {
        const itemDoc = await transaction.get(inventoryItemRef);
        if (!itemDoc.exists) {
            // Bu holat kamdan-kam bo'lishi kerak, chunki frontendda tekshiriladi
            throw new Error("Inventardagi NFT topilmadi.");
        }
        // Yechib olish yozuvini yaratish
        transaction.set(withdrawalRef, withdrawalData);
        // Inventardan NFTni o'chirish
        transaction.delete(inventoryItemRef);
    });

    return NextResponse.json({ ok: true, message: 'Sovg\'a muvaffaqiyatli yuborildi va inventardan o\'chirildi.' });

  } catch (error: any) {
    console.error('Error in /api/create-withdrawal:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Serverda noma\'lum xatolik yuz berdi.' }, { status: 500 });
  }
}
