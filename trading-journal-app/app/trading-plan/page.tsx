'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TradingPlan } from '@/types';
import Navbar from '@/components/Navbar';

export default function TradingPlanPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [message, setMessage] = useState('');
  const [tradingPlan, setTradingPlan] = useState<TradingPlan>({
    userId: user?.uid || '',
    tradesMaxDiarios: 3,
    riesgoMaxPorTrade: 2,
    perdidaMaxDiaria: 500,
    pausaDespuesDePerdidas: 2,
    horariosPermitidos: ['Sesión NY'],
    reglasPersonalizadas: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadTradingPlan();
  }, [user, router]);

  const loadTradingPlan = async () => {
    if (!user) return;

    try {
      const planDoc = await getDoc(doc(db, 'tradingPlans', user.uid));
      
      if (planDoc.exists()) {
        setTradingPlan(planDoc.data() as TradingPlan);
      }
    } catch (error) {
      console.error('Error loading trading plan:', error);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');

    try {
      const planData: TradingPlan = {
        ...tradingPlan,
        userId: user.uid,
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'tradingPlans', user.uid), planData);

      setMessage('✅ Trading Plan guardado exitosamente!');
      
      setTimeout(() => {
        setMessage('');
      }, 3000);

    } catch (error: any) {
      console.error('Error:', error);
      setMessage('❌ Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHorarioToggle = (horario: string) => {
    setTradingPlan(prev => {
      const horariosPermitidos = prev.horariosPermitidos.includes(horario)
        ? prev.horariosPermitidos.filter(h => h !== horario)
        : [...prev.horariosPermitidos, horario];
      
      return { ...prev, horariosPermitidos };
    });
  };

  if (!user || loadingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver flex items-center justify-center">
        <div className="text-carbon text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-kint mx-auto mb-4"></div>
          <p className="text-xl font-heading">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver">
      <Navbar onLogout={logout} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-silver">
          <div className="text-center mb-8">
            <h1 className="flex items-center justify-center space-x-3 text-3xl font-heading font-bold text-carbon mb-2">
              <img src="/icons/icon-plan.png" alt="Trading Plan" className="w-10 h-10" />
              <span>Mi Trading Plan</span>
            </h1>
            <p className="text-text-gray font-body">
              Define tus reglas y mantén la disciplina
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('✅') 
                ? 'bg-growth-light text-growth-dark border border-growth-jade' 
                : 'bg-lesson-light text-lesson-red border border-lesson-red'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* A) Límites Diarios */}
            <section>
              <h2 className="text-xl font-heading font-bold text-carbon mb-4 flex items-center space-x-2">
                <span className="text-2xl">⚠️</span>
                <span>Límites Diarios</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-carbon mb-2 font-body">
                    Trades máximos por día *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={tradingPlan.tradesMaxDiarios}
                    onChange={(e) => setTradingPlan({ ...tradingPlan, tradesMaxDiarios: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                    placeholder="3"
                  />
                  <p className="text-xs text-text-gray mt-1 font-body">
                    Recomendado: 2-5 trades
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-carbon mb-2 font-body">
                    Riesgo máximo por trade (%) *
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="10"
                    step="0.5"
                    required
                    value={tradingPlan.riesgoMaxPorTrade}
                    onChange={(e) => setTradingPlan({ ...tradingPlan, riesgoMaxPorTrade: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                    placeholder="2"
                  />
                  <p className="text-xs text-text-gray mt-1 font-body">
                    Recomendado: 1-2% de tu capital
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-carbon mb-2 font-body">
                    Pérdida máxima diaria ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={tradingPlan.perdidaMaxDiaria}
                    onChange={(e) => setTradingPlan({ ...tradingPlan, perdidaMaxDiaria: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                    placeholder="500"
                  />
                  <p className="text-xs text-text-gray mt-1 font-body">
                    Si llegas a este límite, deja de operar por hoy
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-carbon mb-2 font-body">
                    Pausa después de X pérdidas consecutivas *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    required
                    value={tradingPlan.pausaDespuesDePerdidas}
                    onChange={(e) => setTradingPlan({ ...tradingPlan, pausaDespuesDePerdidas: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                    placeholder="2"
                  />
                  <p className="text-xs text-text-gray mt-1 font-body">
                    Toma un descanso para evitar operar con emociones
                  </p>
                </div>
              </div>
            </section>

            {/* B) Horarios Permitidos */}
            <section>
              <h2 className="text-xl font-heading font-bold text-carbon mb-4 flex items-center space-x-2">
                <span className="text-2xl">⏰</span>
                <span>Horarios Permitidos</span>
              </h2>
              
              <p className="text-sm text-text-gray mb-4 font-body">
                Selecciona los horarios en los que te permites operar
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { value: 'Pre-market', label: 'Pre-market (antes de 09:30)', icon: '🌅' },
                  { value: 'Sesión NY', label: 'Sesión NY (09:30-16:00)', icon: '🗽' },
                  { value: 'Sesión Londres', label: 'Sesión Londres (03:00-12:00)', icon: '🇬🇧' },
                  { value: 'Sesión Asia', label: 'Sesión Asia (19:00-04:00)', icon: '🌏' },
                  { value: 'After-hours', label: 'After-hours (después de 16:00)', icon: '🌙' }
                ].map((horario) => (
                  <label
                    key={horario.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                      tradingPlan.horariosPermitidos.includes(horario.value)
                        ? 'border-gold-kint bg-gold-50'
                        : 'border-silver bg-white hover:border-gold-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={tradingPlan.horariosPermitidos.includes(horario.value)}
                      onChange={() => handleHorarioToggle(horario.value)}
                      className="w-5 h-5 text-gold-kint focus:ring-gold-kint rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{horario.icon}</span>
                        <span className="font-medium text-carbon font-body text-sm">
                          {horario.label}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* D) Reglas Personalizadas */}
            <section>
              <h2 className="text-xl font-heading font-bold text-carbon mb-4 flex items-center space-x-2">
                <span className="text-2xl">📝</span>
                <span>Reglas Personalizadas</span>
              </h2>
              
              <textarea
                rows={6}
                value={tradingPlan.reglasPersonalizadas}
                onChange={(e) => setTradingPlan({ ...tradingPlan, reglasPersonalizadas: e.target.value })}
                placeholder="Escribe aquí tus reglas personalizadas. Ejemplos:&#10;- No operar en días de noticias importantes (FOMC, NFP)&#10;- Esperar confirmación en 2 temporalidades&#10;- Solo operar setups A+ con risk/reward mínimo de 1:2&#10;- Tomar break de 15 minutos después de cada trade"
                className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
              />
              <p className="text-xs text-text-gray mt-1 font-body">
                Escribe todas las reglas que quieras seguir. Úsalas como recordatorio diario.
              </p>
            </section>

            {/* Botón de guardar */}
            <div className="pt-6 border-t border-silver">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-kint hover:bg-gold-dark text-white font-semibold py-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-gold hover:shadow-gold-lg font-body"
              >
                {loading ? 'Guardando...' : '💾 Guardar Trading Plan'}
              </button>
            </div>

            {/* Mensaje motivacional */}
            <div className="bg-gradient-to-r from-gold-50 to-white rounded-xl p-6 border-l-4 border-gold-kint">
              <p className="text-carbon font-body text-center italic">
                "La disciplina es el puente entre metas y logros. Tu Trading Plan es tu guía para mantenerte en el camino correcto."
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
