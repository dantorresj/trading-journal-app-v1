'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types';
import Navbar from '@/components/Navbar';
import UserProgress from '@/components/UserProgress';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadProfile();
  }, [user, router]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !userProfile) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver">
      <Navbar onLogout={logout} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-heading font-bold text-carbon mb-8">Mi Perfil</h1>
        <UserProgress user={userProfile} />
      </div>
    </div>
  );
}