import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type ShareLinkType = 'todos' | 'estrategia' | 'cuenta';

export interface ShareLink {
  id: string;
  userId: string;
  displayName: string;
  type: ShareLinkType;       // qué tipo de filtro aplica
  strategy: string | null;   // solo si type === 'estrategia'
  cuenta: string | null;     // solo si type === 'cuenta'
  isActive: boolean;
  createdAt: any;
}

/**
 * Crea un nuevo link compartido.
 */
export async function createShareLink(
  userId: string,
  displayName: string,
  type: ShareLinkType,
  strategy: string | null = null,
  cuenta: string | null = null
): Promise<string> {
  const docRef = await addDoc(collection(db, 'sharedLinks'), {
    userId,
    displayName,
    type,
    strategy,
    cuenta,
    isActive: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Activa o desactiva un link.
 */
export async function toggleShareLink(linkId: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, 'sharedLinks', linkId), { isActive });
}

/**
 * Elimina permanentemente un link.
 */
export async function deleteShareLink(linkId: string): Promise<void> {
  await deleteDoc(doc(db, 'sharedLinks', linkId));
}

/**
 * Obtiene todos los links del usuario.
 */
export async function getUserShareLinks(userId: string): Promise<ShareLink[]> {
  const q = query(collection(db, 'sharedLinks'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShareLink));
}
