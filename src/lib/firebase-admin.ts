import * as admin from 'firebase-admin';

// Lazy initialization - only initialize when actually used
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      // Check if we have the required environment variables
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        console.warn('⚠️ Firebase Admin environment variables not set - skipping initialization');
        return false;
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      console.log('✅ Firebase Admin initialized');
      return true;
    } catch (error) {
      console.error('❌ Firebase Admin initialization error:', error);
      return false;
    }
  }
  return true;
}

// Lazy getters - only initialize when accessed
export const getAdminDb = () => {
  initializeFirebaseAdmin();
  return admin.firestore();
};

export const getAdminAuth = () => {
  initializeFirebaseAdmin();
  return admin.auth();
};

export const getAdminStorage = () => {
  initializeFirebaseAdmin();
  return admin.storage();
};

// Legacy exports for backward compatibility (lazy loaded)
let _adminDb: FirebaseFirestore.Firestore | null = null;
let _adminAuth: admin.auth.Auth | null = null;
let _adminStorage: admin.storage.Storage | null = null;

export const adminDb = new Proxy({} as FirebaseFirestore.Firestore, {
  get(target, prop) {
    if (!_adminDb) {
      _adminDb = getAdminDb();
    }
    return (_adminDb as any)[prop];
  }
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(target, prop) {
    if (!_adminAuth) {
      _adminAuth = getAdminAuth();
    }
    return (_adminAuth as any)[prop];
  }
});

export const adminStorage = new Proxy({} as admin.storage.Storage, {
  get(target, prop) {
    if (!_adminStorage) {
      _adminStorage = getAdminStorage();
    }
    return (_adminStorage as any)[prop];
  }
});

export default admin;

