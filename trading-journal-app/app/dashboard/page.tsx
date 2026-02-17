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
  const [inspirationalPhrase, setInspirationalPhrase] = useState('');

  const kintsugiPhrases = [
    "Cada grieta es una oportunidad de oro",
    "Las pérdidas no se ocultan, se transforman en sabiduría",
    "Tu imperfección es tu camino único hacia la maestría",
    "El oro más valioso está en las lecciones aprendidas",
    "No hay trader perfecto, solo traders en evolución",
    "Cada trade, ganador o perdedor, es parte de tu obra maestra",
    "La belleza está en cómo reparas, no en nunca romperte"
  ];

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Seleccionar frase aleatoria
    const randomPhrase = kintsugiPhrases[Math.floor(Math.random() * kintsugiPhrases.length)];
    setInspirationalPhrase(randomPhrase);

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
      
      // Ordenar por fecha + hora de entrada, luego por hora de salida
      tradesData.sort((a, b) => {
        const entradaA = new Date(`${a.fecha}T${a.hora_entrada || '00:00'}`).getTime();
        const entradaB = new Date(`${b.fecha}T${b.hora_entrada || '00:00'}`).getTime();
        
        if (entradaA !== entradaB) {
          return entradaA - entradaB;
        }
        
        const salidaA = new Date(`${a.fecha}T${a.hora_salida || '23:59'}`).getTime();
        const salidaB = new Date(`${b.fecha}T${b.hora_salida || '23:59'}`).getTime();
        return salidaA - salidaB;
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
      <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver flex items-center justify-center">
        <div className="text-carbon text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-kint mx-auto mb-4"></div>
          <p className="text-xl font-heading">Cargando tu jornada...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver">
      <Navbar onLogout={logout} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-heading font-bold text-carbon mb-3">Tu Jornada Kintsugi</h1>
          <p className="text-lg text-text-gray font-body italic mb-2">
            "{inspirationalPhrase}"
          </p>
          <div className="w-32 h-1 bg-gradient-gold mx-auto rounded-full"></div>
        </div>

        {trades.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-silver">
            <div className="text-6xl mb-4">🏺</div>
            <h2 className="text-3xl font-heading font-bold text-carbon mb-3">
              Tu Lienzo Está en Blanco
            </h2>
            <p className="text-text-gray mb-2 font-body max-w-md mx-auto">
              Cada gran obra comienza con el primer trazo.
            </p>
            <p className="text-sm text-text-gray mb-6 font-body italic">
              "Las grietas más hermosas comienzan con el primer paso"
            </p>
            <button
              onClick={() => router.push('/new-trade')}
              className="bg-gold-kint hover:bg-gold-dark text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-gold hover:shadow-gold-lg font-body"
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