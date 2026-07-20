import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const LOCAL_STORAGE_CONFIG_KEY = 'eldorado_firebase_config_keys';

// Retrieve saved Firebase configuration
export function getSavedFirebaseConfig(): FirebaseConfig | null {
  const saved = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved Firebase config:', e);
    }
  }

  // Fallback to environment variables if provided
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: metaEnv.VITE_FIREBASE_API_KEY,
      authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: metaEnv.VITE_FIREBASE_APP_ID || '',
    };
  }

  return null;
}

// Check if Firebase configuration is complete and valid
export function isFirebaseConfigured(): boolean {
  const config = getSavedFirebaseConfig();
  return !!(config && config.apiKey && config.projectId);
}

// Get or initialize Firebase App instance safely
let appInstance: FirebaseApp | null = null;
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  
  try {
    if (getApps().length > 0) {
      return getApp();
    }
    const config = getSavedFirebaseConfig();
    if (config) {
      appInstance = initializeApp(config);
      return appInstance;
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
  return null;
}

// Save all app data to Firestore (Products, Blogs, HomeConfig, Inquiries)
export async function saveToCloudDb(key: string, data: any): Promise<boolean> {
  const app = getFirebaseApp();
  if (!app) {
    // If Firebase isn't configured, save only to local storage as fallback
    localStorage.setItem(key, JSON.stringify(data));
    return false;
  }

  try {
    const db = getFirestore(app);
    // We will store all configurations in a "configuration" collection under fixed documents
    // e.g. /configuration/eldorado_store_data -> { products, blogs, homeConfig, inquiries }
    // This allows single read/write operations to avoid hitting free-tier document limits
    const docRef = doc(db, 'configuration', 'eldorado_store_data');
    
    // Fetch existing document to merge or set
    const docSnap = await getDoc(docRef);
    const existingData = docSnap.exists() ? docSnap.data() : {};
    
    await setDoc(docRef, {
      ...existingData,
      [key]: data,
      lastUpdated: new Date().toISOString(),
    });
    
    // Also mirror to local storage for offline performance and quick initial load
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Failed to save ${key} to Firebase Cloud DB:`, error);
    localStorage.setItem(key, JSON.stringify(data));
    return false;
  }
}

// Load app data from Firestore with fallback to local storage
export async function loadFromCloudDb<T>(key: string, fallbackDefault: T): Promise<T> {
  const app = getFirebaseApp();
  const localSaved = localStorage.getItem(key);
  let localData: T = fallbackDefault;

  if (localSaved) {
    try {
      localData = JSON.parse(localSaved);
    } catch (e) {
      console.error(`Failed to parse local storage key: ${key}`, e);
    }
  }

  if (!app) {
    return localData;
  }

  try {
    const db = getFirestore(app);
    const docRef = doc(db, 'configuration', 'eldorado_store_data');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const cloudData = docSnap.data();
      if (cloudData && cloudData[key] !== undefined) {
        // Update local storage to stay in sync
        localStorage.setItem(key, JSON.stringify(cloudData[key]));
        return cloudData[key] as T;
      }
    }
  } catch (error) {
    console.error(`Failed to load ${key} from Firebase Cloud DB:`, error);
  }

  return localData;
}

// Clear current Firebase config (Disconnect)
export function disconnectFirebase() {
  localStorage.removeItem(LOCAL_STORAGE_CONFIG_KEY);
  if (appInstance) {
    appInstance = null;
  }
}

// Save Firebase configuration keys
export function saveFirebaseConfigKeys(config: FirebaseConfig): boolean {
  try {
    localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config));
    // Verify initialization works
    if (getApps().length > 0) {
      // Re-initialize isn't supported directly, we'll suggest a page reload
    } else {
      initializeApp(config);
    }
    return true;
  } catch (e) {
    console.error('Failed to save Firebase configuration keys:', e);
    return false;
  }
}
