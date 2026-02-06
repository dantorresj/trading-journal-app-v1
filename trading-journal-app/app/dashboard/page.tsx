'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trade } from '@/types';
import DashboardStats from '@/components/DashboardStats';
import DashboardCharts from '@/components/DashboardCharts';
import DashboardTables from '@/components/DashboardTables';
import Navbar from '@/components/Navbar';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    loadTrades();
  }, [user, router]);

  const loadTrades = async () => {
    if (!user) return;

    try {
      const tradesRef = collection(db, 'trades');
      const q = query(
        tradesRef,
        where('userId', '==', user.uid),
        orderBy('fecha', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const tradesData: Trade[] = [];
      
      querySnapshot.forEach((doc) => {
        tradesData.push({ id: doc.id, ...doc.data() } as Trade);
      });
      
      setTrades(tradesData);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500">
      <Navbar onLogout={logout} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">📊 Trading Dashboard</h1>
          <p className="text-lg opacity-90">Análisis de rendimiento en tiempo real</p>
        </div>

        {trades.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📈</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Bienvenido a tu Trading Journal!
            </h2>
            <p className="text-gray-600 mb-6">
              Aún no tienes trades registrados. Comienza registrando tu primera operación.
            </p>
            <button
              onClick={() => router.push('/new-trade')}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-lg transition duration-200"
            >
              Registrar mi primer trade
            </button>
          </div>
        ) : (
          <>
            <DashboardStats trades={trades} />
            <DashboardCharts trades={trades} />
            <DashboardTables trades={trades} />
          </>
        )}
      </div>
    </div>
  );
}
