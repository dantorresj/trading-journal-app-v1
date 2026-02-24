'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, Trade, TradingPlan } from '@/types';
import Navbar from '@/components/Navbar';
import UserProgress from '@/components/UserProgress';
import MonthlyCalendar from '@/components/MonthlyCalendar';
import SubscriptionManager from '@/components/SubscriptionManager';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradingPlan, setTradingPlan] = useState<TradingPlan | null>(null);
  const [currentMonth] = useState(new Date());

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
    // Cargar perfil de usuario
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      setUserProfile(userDoc.data() as UserProfile);
    }

    // Cargar trades del mes actual
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const firstDayStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

    const tradesQuery = query(
      collection(db, 'trades'),
      where('userId', '==', user.uid),
      where('fecha', '>=', firstDayStr),
      where('fecha', '<=', lastDayStr)
    );
    
    const tradesSnapshot = await getDocs(tradesQuery);
    const tradesData: Trade[] = [];
    tradesSnapshot.forEach((doc) => {
      tradesData.push({ id: doc.id, ...doc.data() } as Trade);
    });
    setTrades(tradesData);

    // Cargar trading plan
    const planDoc = await getDoc(doc(db, 'tradingPlans', user.uid));
    if (planDoc.exists()) {
      setTradingPlan(planDoc.data() as TradingPlan);
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-heading font-bold text-carbon mb-8">Mi Perfil</h1>
      
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <UserProgress user={userProfile} />
        <MonthlyCalendar 
          trades={trades} 
          tradingPlan={tradingPlan}
          currentMonth={currentMonth}
        />
      </div>
        <SubscriptionManager user={userProfile} />
    </div>
  </div>
);
}