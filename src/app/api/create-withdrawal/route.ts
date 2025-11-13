
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
      const chunk = data.toString();
      console.log(`Python stdout: ${chunk}`);
      scriptOutput += chunk;
    });

    pythonProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      console.error(`Python stderr: ${chunk}`);
      scriptError += chunk;
    });
    
    // Handle spawn errors, e.g., command not found
    pythonProcess.on('error', (err) => {
        console.error('Failed to start subprocess.', err);
        // Combine with other errors to provide full context
        scriptError = `Failed to start script: ${err.message}. Make sure python3 is installed and in the system's PATH. ${scriptError}`;
    });

    const scriptResult = await new Promise<{ success: boolean; message: string }>((resolve) => {
        pythonProcess.on('close', (code) => {
            console.log(`Python script exited with code ${code}`);
            // Success is now strictly defined by the exit code and a success message in the output.
            if (code === 0 && scriptOutput.includes('✅ Gift muvaffaqiyatli yuborildi')) {
                resolve({ success: true, message: scriptOutput });
            } else {
                // Combine stderr and stdout for a comprehensive error message.
                const fullError = (scriptError || 'Script produced an error.') + `\n--- Output ---\n` + (scriptOutput || 'No output.');
                resolve({ success: false, message: fullError });
            }
        });
    });

    // 2. Agar skript muvaffaqiyatsiz bo'lsa, jarayonni to'xtatish
    if (!scriptResult.success) {
      // Skriptdagi keng tarqalgan xatolarni aniqlash va foydalanuvchiga tushunarli qilib ko'rsatish
      if (scriptResult.message.includes('telethon.errors.rpcerrorlist.UserNotMutualContactError')) {
           return NextResponse.json({ ok: false, error: 'Xatolik: Bot sizning kontaktingizda emas. Iltimos, botni kontaktingizga qo\'shing.' }, { status: 400 });
      }
       if (scriptResult.message.includes('JSON bo\'sh giftlarni qidiryapman')) {
           return NextResponse.json({ ok: false, error: 'Hozircha yuborish uchun sovg\'alar qolmadi. Iltimos, keyinroq urinib ko\'ring.' }, { status: 400 });
      }
      // For other errors, return a generic message but log the detailed one.
      console.error(`Full Python script error for withdrawal: ${scriptResult.message}`);
      return NextResponse.json({ ok: false, error: `Sovg'ani yuborishda noma'lum xatolik yuz berdi. Administrator bilan bog'laning.` }, { status: 500 });
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
