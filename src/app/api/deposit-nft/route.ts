
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { spawn } from 'child_process';
import path from 'path';
import sqlite3 from 'sqlite3';
import { Nft } from '@/lib/data';

const dbPath = path.resolve(process.cwd(), 'mon.db');

interface GiftFromDb {
  id: number;
  gift_uid: string;
  title: string;
  num: string;
  model: string;
  pattern: string;
  backdrop: string;
  value_amount: number;
  sender_id: number;
}

// Helper to run python script
function runPythonScript(scriptPath: string, args: string[]): Promise<{ output: string, error: string, code: number | null }> {
  return new Promise((resolve) => {
    const pythonProcess = spawn('python3', [scriptPath, ...args]);
    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      console.log(`Python stdout: ${chunk}`);
      output += chunk;
    });

    pythonProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      console.error(`Python stderr: ${chunk}`);
      error += chunk;
    });
    
    pythonProcess.on('error', (err) => {
        console.error('Failed to start subprocess.', err);
        error += `Failed to start script: ${err.message}.`;
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python script exited with code ${code}`);
      resolve({ output, error, code });
    });
  });
}

// Helper to interact with SQLite
function getLatestGiftFromDb(): Promise<GiftFromDb | null> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) return reject(new Error(`Failed to open SQLite DB: ${err.message}`));
        });

        db.get('SELECT * FROM gifts ORDER BY inserted_at DESC LIMIT 1', [], (err, row: GiftFromDb) => {
            db.close();
            if (err) {
                return reject(new Error(`Failed to query SQLite DB: ${err.message}`));
            }
            resolve(row || null);
        });
    });
}

function deleteGiftFromDb(id: number): Promise<void> {
     return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) return reject(new Error(`Failed to open SQLite DB for writing: ${err.message}`));
        });
        
        db.run('DELETE FROM gifts WHERE id = ?', [id], function(err) {
            db.close();
            if (err) {
                 return reject(new Error(`Failed to delete row from SQLite DB: ${err.message}`));
            }
            if (this.changes === 0) {
                 // This is not a critical error, just a log.
                 console.warn(`Row with id ${id} not found in SQLite DB for deletion.`);
            } else {
                console.log(`Successfully deleted row ${id} from mon.db`);
            }
            resolve();
        });
    });
}


export async function POST(request: NextRequest) {
  try {
    const { userId, telegramUserId } = await request.json();

    if (!userId || !telegramUserId) {
      return NextResponse.json({ ok: false, error: 'Barcha maydonlar to\'ldirilishi shart: userId, telegramUserId' }, { status: 400 });
    }

    // 1. Run the Python script to scan for new gifts and populate the SQLite DB
    const scriptPath = path.resolve(process.cwd(), 'scripts/gift_monitor_full.py');
    const scriptResult = await runPythonScript(scriptPath, ['scan']);

    if (scriptResult.code !== 0) {
      console.error(`Full Python script error for deposit: ${scriptResult.error}`);
      return NextResponse.json({ ok: false, error: `Sovg'alarni skanerlashda xatolik yuz berdi. Administrator bilan bog'laning.` }, { status: 500 });
    }
    
    // 2. Read the latest gift from the SQLite DB
    const latestGift = await getLatestGiftFromDb();

    if (!latestGift) {
      return NextResponse.json({ ok: false, error: "Yangi sovg'alar topilmadi. Iltimos, sovg'a yuborganingizga ishonch hosil qiling va qayta urinib ko'ring." }, { status: 404 });
    }

    // Check if the sender of the gift matches the user who made the request
    if (latestGift.sender_id !== telegramUserId) {
         // Even if it's not for this user, we should consider clearing it to avoid it being picked up by the next user.
         // However, another user might be trying to claim it. For now, we leave it but warn.
         console.warn(`Latest gift sender (${latestGift.sender_id}) does not match requestor (${telegramUserId}).`);
         return NextResponse.json({ ok: false, error: `Topilgan so'nggi sovg'a sizga tegishli emas. U boshqa foydalanuvchi tomonidan yuborilgan. Iltimos, qayta urinib ko'ring.` }, { status: 403 });
    }

    // 3. Prepare the NFT data for Firestore
    const newNftId = `tg-${latestGift.gift_uid}`;
    const inventoryItemRef = adminDb.doc(`users/${userId}/inventory/${newNftId}`);
    
    const docSnapshot = await inventoryItemRef.get();
    if(docSnapshot.exists) {
        console.log(`NFT with ID ${newNftId} already exists in user's inventory. Skipping.`);
        // IMPORTANT: Delete it from sqlite db anyway to prevent it from being processed again.
        await deleteGiftFromDb(latestGift.id);
        return NextResponse.json({ ok: true, message: 'Bu sovg\'a allaqachon inventaringizda mavjud.' });
    }

    // Map rarity based on value or model
    let rarity: Nft['rarity'] = 'Common';
    if (latestGift.model?.toLowerCase().includes('rare')) rarity = 'Rare';
    if (latestGift.model?.toLowerCase().includes('epic')) rarity = 'Epic';
    if (latestGift.model?.toLowerCase().includes('legendary')) rarity = 'Legendary';
    
    const nftName = latestGift.title || 'Nomsiz Sovg\'a';
    const nftNum = latestGift.num || '0';
    const slug = nftName.toLowerCase().replace(/ /g, '');

    const newNftData: Omit<Nft, 'id'> = {
        name: nftName,
        price: 0, // Not for sale by default
        rarity: rarity,
        collection: 'TON Treasures', // Default collection, can be improved
        model: latestGift.model,
        background: latestGift.backdrop,
        imageUrl: `https://nft.fragment.com/gift/${slug}-${nftNum}.png`,
        lottieUrl: `https://nft.fragment.com/gift/${slug}-${nftNum}.tgs`,
        imageHint: 'telegram gift',
        isListed: false,
        ownerId: userId,
    };
    
    // 4. Add the NFT to the user's inventory in Firestore
    await inventoryItemRef.set({ id: newNftId, ...newNftData });
    console.log(`Successfully added NFT ${newNftId} to user ${userId}'s inventory.`);
    
    // 5. Delete the entry from the SQLite DB to prevent re-adding
    await deleteGiftFromDb(latestGift.id);
    
    return NextResponse.json({ ok: true, message: `'${newNftData.name}' sovg'asi inventaringizga muvaffaqiyatli qo'shildi.` });

  } catch (error: any) {
    console.error('Error in /api/deposit-nft:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Serverda noma\'lum xatolik yuz berdi.' }, { status: 500 });
  }
}
