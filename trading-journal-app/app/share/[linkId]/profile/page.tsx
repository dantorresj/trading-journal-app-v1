'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trade } from '@/types';
import SharedNavbar from '@/components/SharedNavbar';

interface ShareLinkData {
  userId: string;
  displayName: string;
  type: 'todos' | 'estrategia' | 'cuenta';
  strategy: string | null;
  cuenta: string | null;
  isActive: boolean;
}

export default function SharedProfilePage() {
  const params = useParams();
  const linkId = params.linkId as string;

  const [linkData, setLinkData] = useState<ShareLinkData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const linkDoc = await getDoc(doc(db, 'sharedLinks', linkId));
        if (!linkDoc.exists()) { setError('Link no encontrado'); return; }

        const link = linkDoc.data() as ShareLinkData;
        if (!link.isActive) { setError('Este link ha sido desactivado'); return; }

        setLinkData(link);

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
        setTrades(data);
      } catch (e) {
        console.error(e);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [linkId]);

  const stats = (() => {
    if (!trades.length) return null;

    const wins = trades.filter((t) => t.resultado === 'Won');
    const losses = trades.filter((t) => t.resultado === 'Lose');
    const be = trades.filter((t) => t.resultado === 'BE');
    const wonLose = wins.length + losses.length;
    const winRate = wonLose > 0 ? (wins.length / wonLose) * 100 : 0;
    const winRateConBE = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
    const totalWins = wins.reduce((s, t) => s + Math.abs(t.ganancia_perdida), 0);
    const totalLosses = losses.reduce((s, t) => s + Math.abs(t.ganancia_perdida), 0);
    const totalPL = trades.reduce((s, t) => s + t.ganancia_perdida, 0);
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
    const avgWin = wins.length > 0 ? totalWins / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLosses / losses.length : 0;
    const lossRate = wonLose > 0 ? losses.length / wonLose : 0;
    const expectedValue = avgWin * (winRate / 100) - avgLoss * lossRate;
    const setups = [...new Set(trades.map((t) => t.setup).filter(Boolean))];
    const activos = [...new Set(trades.map((t) => t.activo).filter(Boolean))];
    const dates = trades.map((t) => t.fecha).filter(Boolean).sort();

    return {
      total: trades.length,
      wins: wins.length, losses: losses.length, be: be.length,
      winRate, winRateConBE, totalPL, profitFactor, avgWin, avgLoss, expectedValue,
      setups, activos,
      firstTrade: dates[0] ?? null,
      lastTrade: dates[dates.length - 1] ?? null,
    };
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver flex items-center justify-center">
        <div className="text-carbon text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-kint mx-auto mb-4" />
          <p className="text-xl font-heading">Cargando perfil...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver">
      <SharedNavbar linkId={linkId} displayName={linkData?.displayName ?? ''} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-silver text-center">
          <div className="w-20 h-20 rounded-full bg-gold-kint flex items-center justify-center text-3xl font-bold font-heading text-white mx-auto mb-4">
            {linkData?.displayName?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <h1 className="text-3xl font-heading font-bold text-carbon mb-2">
            {linkData?.displayName}
          </h1>
          {linkData?.strategy && (
            <span className="inline-block bg-amber-50 text-gold-kint text-sm px-4 py-1 rounded-full border border-gold-kint font-body font-semibold mb-3">
              Estrategia: {linkData.strategy}
            </span>
          )}
          {linkData?.cuenta && (
            <span className="inline-block bg-amber-50 text-gold-kint text-sm px-4 py-1 rounded-full border border-gold-kint font-body font-semibold mb-3">
              Cuenta: {linkData.cuenta}
            </span>
          )}
          {stats?.firstTrade && (
            <p className="text-text-gray text-sm font-body">
              🗓 Trader desde{' '}
              {new Date(stats.firstTrade + 'T12:00:00').toLocaleDateString('es-MX', {
                year: 'numeric', month: 'long',
              })}
            </p>
          )}
        </div>

        {!stats ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-silver">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-heading font-bold text-carbon mb-2">Sin trades aún</h2>
            <p className="text-text-gray font-body">Este trader no tiene trades registrados todavía.</p>
          </div>
        ) : (
          <>
            {/* KPIs — mismos estilos que DashboardStats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <StatCard title="Total Trades" value={String(stats.total)} />
              <StatCard title="Win Rate" value={`${stats.winRate.toFixed(1)}%`} isPositive />
              <StatCard title="Win Rate (con BE)" value={`${stats.winRateConBE.toFixed(1)}%`} isPositive />
              <StatCard
                title="P&L Total"
                value={`$${stats.totalPL.toFixed(2)}`}
                isPositive={stats.totalPL >= 0}
                isNegative={stats.totalPL < 0}
              />
              <StatCard
                title="Profit Factor"
                value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Rendimiento */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-silver">
                <h3 className="text-lg font-heading font-semibold text-carbon mb-4">📊 Rendimiento</h3>
                <div className="space-y-3">
                  <Row label="Ganados" value={String(stats.wins)} positive />
                  <Row label="Perdidos" value={String(stats.losses)} negative />
                  <Row label="Breakeven" value={String(stats.be)} />
                  <Row label="Avg Win" value={`$${stats.avgWin.toFixed(2)}`} positive />
                  <Row label="Avg Loss" value={`$${stats.avgLoss.toFixed(2)}`} negative />
                  <Row
                    label="Expected Value"
                    value={`$${stats.expectedValue.toFixed(2)}`}
                    positive={stats.expectedValue >= 0}
                    negative={stats.expectedValue < 0}
                  />
                </div>
              </div>

              {/* Actividad */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-silver">
                <h3 className="text-lg font-heading font-semibold text-carbon mb-4">📅 Actividad</h3>
                <div className="space-y-3 mb-4">
                  {stats.firstTrade && <Row label="Primer trade" value={stats.firstTrade} />}
                  {stats.lastTrade && <Row label="Último trade" value={stats.lastTrade} />}
                </div>

                {stats.setups.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-text-gray font-body uppercase tracking-wide mb-2">Estrategias</p>
                    <div className="flex flex-wrap gap-2">
                      {stats.setups.map((s) => (
                        <span key={s} className="text-xs bg-amber-50 border border-gold-kint text-gold-kint px-2 py-1 rounded-full font-body">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {stats.activos.length > 0 && (
                  <div>
                    <p className="text-xs text-text-gray font-body uppercase tracking-wide mb-2">Activos</p>
                    <div className="flex flex-wrap gap-2">
                      {stats.activos.map((a) => (
                        <span key={a} className="text-xs bg-gray-100 border border-silver text-carbon px-2 py-1 rounded-full font-body">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, isPositive, isNegative }: {
  title: string; value: string; isPositive?: boolean; isNegative?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 text-center border border-silver">
      <h3 className="text-xs font-semibold text-text-gray uppercase tracking-wide mb-2 font-body">{title}</h3>
      <div className={`text-3xl font-bold font-mono ${
        isPositive ? 'text-gold-kint' : isNegative ? 'text-lesson-red' : 'text-carbon'
      }`}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, value, positive, negative }: {
  label: string; value: string; positive?: boolean; negative?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-text-gray font-body">{label}</span>
      <span className={`text-sm font-semibold font-mono ${
        positive ? 'text-gold-kint' : negative ? 'text-lesson-red' : 'text-carbon'
      }`}>
        {value}
      </span>
    </div>
  );
}
