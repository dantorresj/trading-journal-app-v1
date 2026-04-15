import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ShareLink {
  id: string;
  userId: string;
  displayName: string;
  strategy: string | null; // null = todos los trades
  isActive: boolean;
  createdAt: any;
}

/**
 * Crea un nuevo link compartido para un usuario.
 * @param userId    UID del usuario autenticado
 * @param displayName  Nombre público que se mostrará (sin email)
 * @param strategy  null = todos los trades, string = estrategia específica
 */
export async function createShareLink(
  userId: string,
  displayName: string,
  strategy: string | null = null
): Promise<string> {
  const docRef = await addDoc(collection(db, 'sharedLinks'), {
    userId,
    displayName,
    strategy,
    isActive: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Activa o desactiva un link compartido.
 */
export async function toggleShareLink(linkId: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, 'sharedLinks', linkId), { isActive });
}

/**
 * Elimina (desactiva permanentemente) un link.
 */
export async function deactivateShareLink(linkId: string): Promise<void> {
  await updateDoc(doc(db, 'sharedLinks', linkId), { isActive: false });
}

/**
 * Obtiene todos los links creados por un usuario.
 */
export async function getUserShareLinks(userId: string): Promise<ShareLink[]> {
  const q = query(collection(db, 'sharedLinks'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShareLink));
}
