
// src/lib/firebase-admin.ts
import * as admin from "firebase-admin";

let adminDb: admin.firestore.Firestore;

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    // This key needs to be set in your hosting environment's secret variables
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    adminDb = admin.firestore();

  } catch (error: any) {
    console.error("Firebase Admin initialization error. The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is likely not set. Server-side features like buying NFTs will not work.", error.message);
  }
} else {
    // If already initialized, get the firestore instance
    adminDb = admin.firestore();
}

// Export the initialized admin database instance
// It might be undefined if initialization failed, and callers must handle this.
export { adminDb };
