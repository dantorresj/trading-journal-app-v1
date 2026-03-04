'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trade } from '@/types';
import DashboardStats from '@/components/DashboardStats';
import DashboardCharts from '@/components/DashboardCharts';
import DashboardTables from '@/components/DashboardTables';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [inspirationalPhrase, setInspirationalPhrase] = useState('');
  
  // Estados para filtros
  const [filterCuenta, setFilterCuenta] = useState('');
  const [filterEstrategia, setFilterEstrategia] = useState('');
  const [filterDireccion, setFilterDireccion] = useState('');

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

    const randomPhrase = kintsugiPhrases[Math.floor(Math.random() * kintsugiPhrases.length)];
    setInspirationalPhrase(randomPhrase);

    loadTrades();
  }, [user, router]);

  // Aplicar filtros cuando cambian
  useEffect(() => {
    let filtered = [...trades];

    // Filtro por cuenta
    if (filterCuenta) {
      filtered = filtered.filter(trade => trade.identificadorCuenta === filterCuenta);
    }

    // Filtro por estrategia
    if (filterEstrategia) {
      filtered = filtered.filter(trade => trade.setup === filterEstrategia);
    }

    // Filtro por dirección
    if (filterDireccion) {
      filtered = filtered.filter(trade => trade.direccion === filterDireccion);
    }

    setFilteredTrades(filtered);
  }, [trades, filterCuenta, filterEstrategia, filterDireccion]);

  // Obtener cuentas únicas
  const uniqueCuentas = Array.from(new Set(trades.map(t => t.identificadorCuenta).filter(Boolean)));

  // Obtener estrategias únicas
  const uniqueEstrategias = Array.from(new Set(trades.map(t => t.setup).filter(Boolean)));

  const loadTrades = async () => {
    if (!user) return;

    try {
      const tradesRef = collection(db, 'trades');
      const q = query(
        tradesRef,
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const tradesData: Trade[] = [];
      
      querySnapshot.forEach((doc) => {
        tradesData.push({ id: doc.id, ...doc.data() } as Trade);
      });
      
      // Ordenar por createdAt real (Firestore Timestamp o Date)
      // Garantiza el orden exacto de registro sin depender de fecha/hora de entrada
      tradesData.sort((a, b) => {
        const tsA = (a.createdAt as any)?.seconds
          ? (a.createdAt as any).seconds * 1000
          : new Date(a.createdAt).getTime();
        const tsB = (b.createdAt as any)?.seconds
          ? (b.createdAt as any).seconds * 1000
          : new Date(b.createdAt).getTime();
        return tsA - tsB; // ascendente para equity curve y gráficas cronológicas
      });
      
      setTrades(tradesData);
      setFilteredTrades(tradesData);
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
            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-silver">
              <h3 className="text-lg font-heading font-semibold text-carbon mb-4">
                Filtros
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {/* Filtro Cuenta */}
                <div>
                  <label className="block text-sm font-medium text-carbon mb-2 font-body">
                    Cuenta
                  </label>
                  <select
                    value={filterCuenta}
                    onChange={(e) => setFilterCuenta(e.target.value)}
                    className="w-full px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                  >
                    <option value="">Todas las cuentas</option>
                    {uniqueCuentas.map((cuenta) => (
                      <option key={cuenta} value={cuenta}>
                        {cuenta}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro Estrategia */}
                <div>
                  <label className="block text-sm font-medium text-carbon mb-2 font-body">
                    Estrategia
                  </label>
                  <select
                    value={filterEstrategia}
                    onChange={(e) => setFilterEstrategia(e.target.value)}
                    className="w-full px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                  >
                    <option value="">Todas las estrategias</option>
                    {uniqueEstrategias.map((estrategia) => (
                      <option key={estrategia} value={estrategia}>
                        {estrategia}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro Dirección */}
                <div>
                  <label className="block text-sm font-medium text-carbon mb-2 font-body">
                    Dirección
                  </label>
                  <select
                    value={filterDireccion}
                    onChange={(e) => setFilterDireccion(e.target.value)}
                    className="w-full px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                  >
                    <option value="">Todas las direcciones</option>
                    <option value="Long">Long</option>
                    <option value="Short">Short</option>
                  </select>
                </div>
              </div>

              {/* Indicador de filtros activos */}
              {(filterCuenta || filterEstrategia || filterDireccion) && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-text-gray font-body">
                    Mostrando {filteredTrades.length} de {trades.length} trades
                  </p>
                  <button
                    onClick={() => {
                      setFilterCuenta('');
                      setFilterEstrategia('');
                      setFilterDireccion('');
                    }}
                    className="text-sm text-gold-kint hover:text-gold-dark font-semibold font-body"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>

            <DashboardStats trades={filteredTrades} />
            <DashboardCharts trades={filteredTrades} />
            <DashboardTables trades={filteredTrades} />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
