
import * as admin from 'firebase-admin';

// Muhim: Bu ma'lumotlarni Firebase konsolidan olib,
// hosting provider'ning (masalan, Render) Environment Variables bo'limiga qo'shish kerak.
// BU YERGA TO'G'RIDAN-TO'G'RI KALITLARNI YOZMANG!

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized.');
  } catch (e: any) {
    console.error('Firebase Admin SDK initialization error', e.stack);
  }
}

export const adminDb = admin.firestore();
