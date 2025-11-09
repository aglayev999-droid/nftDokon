
import * as admin from 'firebase-admin';

// Muhim: Bu ma'lumotlarni Firebase konsolidan olib,
// hosting provider'ning (masalan, Render) Environment Variables bo'limiga qo'shish kerak.
// BU YERGA TO'G'RIDAN-TO'G'RI KALITLARNI YOZMANG!

let adminDb: admin.firestore.Firestore;

try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (!admin.apps.length && serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized.');
  }
  adminDb = admin.firestore();
} catch (e: any) {
    console.error('Firebase Admin SDK initialization error. This is expected in dev without credentials.', e.message);
    // In a non-production environment, we can mock or disable the adminDb.
    // For now, we'll let it be undefined and handle it where it's used.
    // @ts-ignore
    adminDb = {
        collection: () => ({
            where: () => ({
                limit: () => ({
                    get: () => Promise.resolve({ empty: true, docs: [] })
                })
            })
        })
    };
}


export { adminDb };
