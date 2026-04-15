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
import Footer from '@/components/Footer';
import ShareBitacoraModal from '@/components/ShareBitacoraModal';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [tradingPlan, setTradingPlan] = useState<TradingPlan | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showShareModal, setShowShareModal] = useState(false);

  // Estados para filtros
  const [filterCuenta, setFilterCuenta] = useState('');
  const [filterEstrategia, setFilterEstrategia] = useState('');
  const [filterDireccion, setFilterDireccion] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadProfile();
  }, [user, router]);

  // Aplicar filtros cuando cambian
  useEffect(() => {
    let filtered = [...trades];

    if (filterCuenta) {
      filtered = filtered.filter(trade => trade.identificadorCuenta === filterCuenta);
    }
    if (filterEstrategia) {
      filtered = filtered.filter(trade => trade.setup === filterEstrategia);
    }
    if (filterDireccion) {
      filtered = filtered.filter(trade => trade.direccion === filterDireccion);
    }

    setFilteredTrades(filtered);
  }, [trades, filterCuenta, filterEstrategia, filterDireccion]);

  // Recargar trades cuando cambia el mes
  useEffect(() => {
    if (user) {
      loadTradesForMonth();
    }
  }, [currentMonth]);

  const loadTradesForMonth = async () => {
    if (!user) return;

    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
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
      setFilteredTrades(tradesData);
    } catch (error) {
      console.error('Error loading trades:', error);
    }
  };

  // Obtener opciones únicas de filtros
  const uniqueCuentas = Array.from(new Set(trades.map(t => t.identificadorCuenta).filter(Boolean)));
  const uniqueEstrategias = Array.from(new Set(trades.map(t => t.setup).filter(Boolean)));

  // Generar opciones de meses (últimos 12 meses)
  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      options.push(date);
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const loadProfile = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
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
      setFilteredTrades(tradesData);

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

        {/* Título + botón Compartir Bitácora */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold text-carbon">Mi Perfil</h1>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 bg-gold-kint hover:bg-gold-dark text-white px-5 py-2 rounded-lg font-body font-semibold transition-colors shadow-gold"
          >
            🔗 Compartir Bitácora
          </button>
        </div>

        {/* Filtros para el calendario */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-silver">
          <h3 className="text-lg font-heading font-semibold text-carbon mb-4">
            Filtros del Calendario
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Filtro Mes */}
            <div>
              <label className="block text-sm font-medium text-carbon mb-2 font-body">
                Mes
              </label>
              <select
                value={currentMonth.getTime()}
                onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value)))}
                className="w-full px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
              >
                {monthOptions.map((date) => (
                  <option key={date.getTime()} value={date.getTime()}>
                    {formatMonth(date)}
                  </option>
                ))}
              </select>
            </div>

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
                  <option key={cuenta} value={cuenta}>{cuenta}</option>
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
                  <option key={estrategia} value={estrategia}>{estrategia}</option>
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

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <UserProgress user={userProfile} />
          <MonthlyCalendar
            trades={filteredTrades}
            tradingPlan={tradingPlan}
            currentMonth={currentMonth}
          />
        </div>

        <SubscriptionManager user={userProfile} />
        <Footer />
      </div>

      {/* Modal Compartir Bitácora */}
      {showShareModal && (
        <ShareBitacoraModal
          userId={user!.uid}
          displayName={userProfile.displayName || userProfile.email || 'Trader'}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}


