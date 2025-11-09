// src/lib/firebase-admin.ts
import * as admin from "firebase-admin";

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
  } catch (error: any) {
    console.error("Firebase Admin initialization error:", error.message);
    // In a real app, you might want to handle this more gracefully,
    // but for development, logging is crucial.
  }
}

// Export the initialized admin database instance
export const adminDb = admin.firestore();
