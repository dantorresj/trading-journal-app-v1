'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Crear perfil de usuario en Firestore
    const userProfile: UserProfile = {
  uid: userCredential.user.uid,
  email: email,
  displayName: displayName,
  createdAt: new Date(),
  plan: 'free',
  role: 'user',
  planStartDate: new Date(),
  xp: 0,
  level: 1,
  badges: [],
  streak: 0
};

    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Verificar si el usuario ya existe en Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      // Crear perfil si es nuevo usuario
      const userProfile: UserProfile = {
  uid: userCredential.user.uid,
  email: userCredential.user.email || '',
  displayName: userCredential.user.displayName || '',
  createdAt: new Date(),
  plan: 'free',
  role: 'user',
  planStartDate: new Date(),
  xp: 0,
  level: 1,
  badges: [],
  streak: 0
};
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
