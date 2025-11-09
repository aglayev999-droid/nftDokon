
// src/lib/firebase-admin.ts
import * as admin from "firebase-admin";

let adminDb: admin.firestore.Firestore;

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      throw new Error("The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Server-side features will not work.");
    }
    
    // This key needs to be set in your hosting environment's secret variables
    const serviceAccount = JSON.parse(serviceAccountKey);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    adminDb = admin.firestore();

  } catch (error: any) {
    console.error("Firebase Admin initialization error:", error.message);
    // Note: adminDb will be undefined, and any functions relying on it will fail.
    // This is expected if the service account key is not configured.
  }
} else {
    // If already initialized, get the firestore instance
    adminDb = admin.firestore();
}

// Export the initialized admin database instance
// It might be undefined if initialization failed, and callers must handle this.
export { adminDb };
