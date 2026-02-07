import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: El usuario debe reemplazar estos valores con su configuración de Firebase
// Se obtienen desde Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyAWyz159KDBY6gEiy-B4n0NvNwYtc_UrVw",
  authDomain: "trading-journal-d3f58.firebaseapp.com",
  projectId: "trading-journal-d3f58",
  storageBucket: "trading-journal-d3f58.firebasestorage.app",
  messagingSenderId: "482253180833",
  appId: "1:482253180833:web:c139f803ca12d4f6fd85e0"
};

// Inicializar Firebase solo si no está ya inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

// Storage con configuración de timeout más largo
export const storage = getStorage(app);

// Configurar timeout más largo para uploads (5 minutos en lugar de 2)
storage.maxUploadRetryTime = 300000; // 5 minutos en milisegundos
storage.maxOperationRetryTime = 300000; // 5 minutos en milisegundos

export default app;
