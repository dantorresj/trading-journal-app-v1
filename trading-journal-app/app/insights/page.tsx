'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trade, Reflexion } from '@/types';
import Navbar from '@/components/Navbar';
import TechnicalAnalysis from '@/components/TechnicalAnalysis';
import EmotionalAnalysis from '@/components/EmotionalAnalysis';
import EmotionalThermometer from '@/components/EmotionalThermometer';

export default function InsightsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [reflexiones, setReflexiones] = useState<Reflexion[]>([]);
  const [technicalInsights, setTechnicalInsights] = useState<any>(null);
  const [emotionalInsights, setEmotionalInsights] = useState<any>(null);
  const [analyzingTechnical, setAnalyzingTechnical] = useState(false);
  const [analyzingEmotional, setAnalyzingEmotional] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Cargar trades
      const tradesRef = collection(db, 'trades');
      const tradesQuery = query(
        tradesRef,
        where('userId', '==', user.uid),
        orderBy('fecha', 'desc')
      );
      const tradesSnapshot = await getDocs(tradesQuery);
      const tradesData: Trade[] = [];
      tradesSnapshot.forEach((doc) => {
        tradesData.push({ id: doc.id, ...doc.data() } as Trade);
      });

      // Cargar reflexiones (últimas 10)
      const reflexionesRef = collection(db, 'reflexiones');
      const reflexionesQuery = query(
        reflexionesRef,
        where('userId', '==', user.uid),
        orderBy('fecha', 'desc'),
        limit(10)
      );
      const reflexionesSnapshot = await getDocs(reflexionesQuery);
      const reflexionesData: Reflexion[] = [];
      reflexionesSnapshot.forEach((doc) => {
        reflexionesData.push({ id: doc.id, ...doc.data() } as Reflexion);
      });

      setTrades(tradesData);
      setReflexiones(reflexionesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeTechnical = async () => {
    if (trades.length === 0) return;

    setAnalyzingTechnical(true);
    try {
      const response = await fetch('/api/analyze-technical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trades })
      });

      const data = await response.json();
      setTechnicalInsights(data);
    } catch (error) {
      console.error('Error analyzing technical:', error);
    } finally {
      setAnalyzingTechnical(false);
    }
  };

  const analyzeEmotional = async () => {
    if (reflexiones.length === 0) return;

    setAnalyzingEmotional(true);
    try {
      const response = await fetch('/api/analyze-emotional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reflexiones,
          recentTrades: trades.slice(0, 10) // Últimos 10 trades
        })
      });

      const data = await response.json();
      setEmotionalInsights(data);
    } catch (error) {
      console.error('Error analyzing emotional:', error);
    } finally {
      setAnalyzingEmotional(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver flex items-center justify-center">
        <div className="text-carbon text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-kint mx-auto mb-4"></div>
          <p className="text-xl font-heading">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver">
      <Navbar onLogout={logout} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header con filosofía Kintsugi */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-block p-4 bg-white rounded-full shadow-lg border-2 border-gold-kint">
              <span className="text-6xl">🏺</span>
            </div>
          </div>
          <h1 className="text-5xl font-heading font-bold text-carbon mb-4">
            Insights KintEdge
          </h1>
          <p className="text-xl text-text-gray font-body italic mb-2">
            "Cada Stop Loss documentado y analizado se convierte en Oro"
          </p>
          <p className="text-lg text-text-gray font-body max-w-2xl mx-auto">
            Las fracturas se reparan y se vuelven más valiosas. Descubre los patrones que te harán crecer.
          </p>
          <div className="w-32 h-1 bg-gradient-gold mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Mensaje si no hay datos suficientes */}
        {trades.length < 10 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-silver text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-heading font-bold text-carbon mb-3">
              Necesitas más datos
            </h3>
            <p className="text-text-gray font-body">
              Para generar insights significativos, necesitas al menos <strong>10 trades registrados</strong>.
              <br />
              Actualmente tienes: <strong className="text-gold-kint">{trades.length} trades</strong>
            </p>
          </div>
        )}

        {/* Sección: Análisis Técnico */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-heading font-bold text-carbon mb-2">
                📈 Análisis Técnico
              </h2>
              <p className="text-text-gray font-body">
                Identifica patrones y optimiza tu estrategia
              </p>
            </div>
            <button
              onClick={analyzeTechnical}
              disabled={analyzingTechnical || trades.length < 10}
              className="bg-gold-kint hover:bg-gold-dark text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-gold hover:shadow-gold-lg disabled:opacity-50 disabled:cursor-not-allowed font-body"
            >
              {analyzingTechnical ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Analizando con IA...</span>
                </span>
              ) : (
                '🧠 Analizar con IA'
              )}
            </button>
          </div>

          {technicalInsights ? (
            <TechnicalAnalysis insights={technicalInsights} />
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 border border-silver text-center">
              <div className="text-5xl mb-4">🤖</div>
              <p className="text-text-gray font-body text-lg">
                Haz clic en "Analizar con IA" para generar insights técnicos personalizados
              </p>
            </div>
          )}
        </div>

        {/* Sección: Análisis Emocional */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-heading font-bold text-carbon mb-2">
                🧠 Análisis Emocional
              </h2>
              <p className="text-text-gray font-body">
                Comprende tu psicología y fortalece tu disciplina
              </p>
            </div>
            <button
              onClick={analyzeEmotional}
              disabled={analyzingEmotional || reflexiones.length === 0}
              className="bg-growth-jade hover:bg-growth-dark text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-body"
            >
              {analyzingEmotional ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Analizando con IA...</span>
                </span>
              ) : (
                '💭 Analizar Reflexiones'
              )}
            </button>
          </div>

          {emotionalInsights ? (
            <>
              <EmotionalThermometer insights={emotionalInsights} />
              <EmotionalAnalysis insights={emotionalInsights} />
            </>
          ) : reflexiones.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 border border-silver text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-2xl font-heading font-bold text-carbon mb-3">
                No tienes reflexiones registradas
              </h3>
              <p className="text-text-gray font-body mb-6">
                Comienza a documentar tus reflexiones diarias para desbloquear análisis emocional
              </p>
              <button
                onClick={() => router.push('/reflexion')}
                className="bg-gold-kint hover:bg-gold-dark text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 font-body"
              >
                Escribir Primera Reflexión
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 border border-silver text-center">
              <div className="text-5xl mb-4">🤖</div>
              <p className="text-text-gray font-body text-lg">
                Haz clic en "Analizar Reflexiones" para generar insights emocionales
              </p>
            </div>
          )}
        </div>

        {/* Filosofía Kintsugi al final */}
        <div className="mt-12 bg-gradient-to-br from-gold-kint to-gold-dark rounded-2xl shadow-xl p-8 text-white text-center">
          <div className="text-5xl mb-4">✨</div>
          <h3 className="text-3xl font-heading font-bold mb-3">
            La Belleza del Kintsugi
          </h3>
          <p className="text-lg font-body max-w-3xl mx-auto leading-relaxed">
            En el arte japonés del Kintsugi, las grietas de la cerámica rota se reparan con oro líquido,
            creando piezas más valiosas que el original. En tu trading, cada pérdida documentada,
            cada emoción analizada, cada patrón descubierto, se convierte en oro que fortalece tu camino.
          </p>
        </div>
      </div>
    </div>
  );
}
