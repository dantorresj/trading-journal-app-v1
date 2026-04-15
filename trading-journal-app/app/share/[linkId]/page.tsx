'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trade } from '@/types';
import SharedNavbar from '@/components/SharedNavbar';
import DashboardStats from '@/components/DashboardStats';
import DashboardCharts from '@/components/DashboardCharts';
import DashboardTables from '@/components/DashboardTables';

interface ShareLinkData {
  userId: string;
  displayName: string;
  type: 'todos' | 'estrategia' | 'cuenta';
  strategy: string | null;
  cuenta: string | null;
  isActive: boolean;
}

export default function SharedDashboardPage() {
  const params = useParams();
  const linkId = params.linkId as string;

  const [linkData, setLinkData] = useState<ShareLinkData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawdown y rachas (misma lógica que Dashboard original)
  const calculateMaxDrawdown = (tradesToAnalyze: Trade[]) => {
    if (!tradesToAnalyze.length) return { maxDD: 0, maxDDPercent: 0 };
    const sorted = [...tradesToAnalyze].sort((a, b) =>
      new Date(`${a.fecha}T${a.hora_entrada || '00:00'}`).getTime() -
      new Date(`${b.fecha}T${b.hora_entrada || '00:00'}`).getTime()
    );
    let equity = 0, peak = 0, maxDD = 0;
    sorted.forEach((t) => {
      equity += t.ganancia_perdida;
      if (equity > peak) peak = equity;
      const dd = peak - equity;
      if (dd > maxDD) maxDD = dd;
    });
    return { maxDD, maxDDPercent: peak > 0 ? (maxDD / peak) * 100 : 0 };
  };

  const calculateStreaks = (tradesToAnalyze: Trade[]) => {
    if (!tradesToAnalyze.length)
      return { currentWinStreak: 0, maxWinStreak: 0, currentLossStreak: 0, maxLossStreak: 0, lastResult: null };
    const sorted = [...tradesToAnalyze].sort((a, b) =>
      new Date(`${a.fecha}T${a.hora_entrada || '00:00'}`).getTime() -
      new Date(`${b.fecha}T${b.hora_entrada || '00:00'}`).getTime()
    );
    let currentWinStreak = 0, maxWinStreak = 0, currentLossStreak = 0, maxLossStreak = 0;
    let tempW = 0, tempL = 0, lastResult: string | null = null;
    sorted.forEach((t, i) => {
      if (t.resultado === 'Won') { tempW++; tempL = 0; if (tempW > maxWinStreak) maxWinStreak = tempW; }
      else if (t.resultado === 'Lose') { tempL++; tempW = 0; if (tempL > maxLossStreak) maxLossStreak = tempL; }
      else { tempW = 0; tempL = 0; }
      if (i === sorted.length - 1) lastResult = t.resultado;
    });
    currentWinStreak = sorted[sorted.length - 1]?.resultado === 'Won' ? tempW : 0;
    currentLossStreak = sorted[sorted.length - 1]?.resultado === 'Lose' ? tempL : 0;
    return { currentWinStreak, maxWinStreak, currentLossStreak, maxLossStreak, lastResult };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const linkDoc = await getDoc(doc(db, 'sharedLinks', linkId));
        if (!linkDoc.exists()) { setError('Link no encontrado'); return; }

        const link = linkDoc.data() as ShareLinkData;
        if (!link.isActive) { setError('Este link ha sido desactivado'); return; }

        setLinkData(link);

        // Cargar trades según tipo de link
        const tradesRef = collection(db, 'trades');
        let q;
        if (link.type === 'estrategia' && link.strategy) {
          q = query(tradesRef, where('userId', '==', link.userId), where('setup', '==', link.strategy));
        } else if (link.type === 'cuenta' && link.cuenta) {
          q = query(tradesRef, where('userId', '==', link.userId), where('identificadorCuenta', '==', link.cuenta));
        } else {
          q = query(tradesRef, where('userId', '==', link.userId));
        }

        const snap = await getDocs(q);
        const data: Trade[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Trade));

        // Ordenar por createdAt igual que el dashboard original
        data.sort((a, b) => {
          const tsA = (a.createdAt as any)?.seconds
            ? (a.createdAt as any).seconds * 1000
            : new Date(a.createdAt).getTime();
          const tsB = (b.createdAt as any)?.seconds
            ? (b.createdAt as any).seconds * 1000
            : new Date(b.createdAt).getTime();
          return tsA - tsB;
        });

        setTrades(data);
      } catch (e) {
        console.error(e);
        setError('Error al cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [linkId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver flex items-center justify-center">
        <div className="text-carbon text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-kint mx-auto mb-4" />
          <p className="text-xl font-heading">Cargando bitácora...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-carbon mb-2">{error}</p>
          <p className="text-text-gray font-body text-sm">Verifica el link e intenta de nuevo.</p>
        </div>
      </div>
    );
  }

  const maxDrawdown = calculateMaxDrawdown(trades);
  const streaks = calculateStreaks(trades);

  return (
    <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver">
      <SharedNavbar linkId={linkId} displayName={linkData?.displayName ?? ''} />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-carbon mb-2">
            Bitácora de {linkData?.displayName}
          </h1>
          {linkData?.strategy && (
            <p className="text-text-gray font-body">
              Estrategia: <span className="font-semibold text-gold-kint">{linkData.strategy}</span>
            </p>
          )}
          {linkData?.cuenta && (
            <p className="text-text-gray font-body">
              Cuenta: <span className="font-semibold text-gold-kint">{linkData.cuenta}</span>
            </p>
          )}
          <div className="w-32 h-1 bg-gradient-gold mx-auto rounded-full mt-3" />
        </div>

        {trades.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-silver">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-heading font-bold text-carbon mb-2">Sin trades aún</h2>
            <p className="text-text-gray font-body">Este trader no tiene trades registrados todavía.</p>
          </div>
        ) : (
          <>
            <DashboardStats trades={trades} />

            {/* Max Drawdown */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-silver">
              <h3 className="text-xl font-heading font-semibold text-carbon mb-4">📉 Max Drawdown</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-xs text-text-gray font-body uppercase tracking-wide mb-2">Valor Absoluto</p>
                  <p className="text-4xl font-bold font-mono text-lesson-red">${maxDrawdown.maxDD.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-gray font-body uppercase tracking-wide mb-2">Porcentaje</p>
                  <p className="text-4xl font-bold font-mono text-lesson-red">{maxDrawdown.maxDDPercent.toFixed(2)}%</p>
                </div>
              </div>
              <p className="text-xs text-text-gray font-body text-center mt-4">
                Máxima caída desde un pico hasta un valle antes de un nuevo máximo
              </p>
            </div>

            {/* Rachas */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-silver">
                <h3 className="text-xl font-heading font-semibold text-carbon mb-4">🔥 Racha de Ganados</h3>
                <div className="text-center">
                  <p className="text-5xl font-bold font-mono text-growth-jade mb-2">{streaks.currentWinStreak}</p>
                  <p className="text-sm text-text-gray font-body mb-4">
                    {streaks.currentWinStreak === 0 ? 'Sin racha activa' : 'trades actuales'}
                  </p>
                  <div className="pt-4 border-t border-silver">
                    <p className="text-xs text-text-gray font-body uppercase tracking-wide mb-1">Mejor Racha</p>
                    <p className="text-2xl font-bold font-mono text-carbon">
                      {streaks.maxWinStreak} {streaks.maxWinStreak === 1 ? 'trade' : 'trades'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-silver">
                <h3 className="text-xl font-heading font-semibold text-carbon mb-4">❄️ Racha de Perdidos</h3>
                <div className="text-center">
                  <p className="text-5xl font-bold font-mono text-lesson-red mb-2">{streaks.currentLossStreak}</p>
                  <p className="text-sm text-text-gray font-body mb-4">
                    {streaks.currentLossStreak === 0 ? 'Sin racha activa' : 'trades actuales'}
                  </p>
                  <div className="pt-4 border-t border-silver">
                    <p className="text-xs text-text-gray font-body uppercase tracking-wide mb-1">Mayor Racha</p>
                    <p className="text-2xl font-bold font-mono text-carbon">
                      {streaks.maxLossStreak} {streaks.maxLossStreak === 1 ? 'trade' : 'trades'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DashboardCharts trades={trades} />
            <DashboardTables trades={trades} />
          </>
        )}
      </div>
    </div>
  );
}