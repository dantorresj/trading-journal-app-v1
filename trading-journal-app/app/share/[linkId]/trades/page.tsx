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
  strategy: string | null;
  isActive: boolean;
}

export default function SharedTradesPage() {
  const params = useParams();
  const linkId = params.linkId as string;

  const [linkData, setLinkData] = useState<ShareLinkData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros (igual que alltrades original, sin editar/eliminar)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('');
  const [filterSetup, setFilterSetup] = useState('');
  const [filterResultado, setFilterResultado] = useState('');
  const [filterCuenta, setFilterCuenta] = useState('');
  const [sortBy, setSortBy] = useState<'fecha' | 'ganancia_perdida'>('fecha');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
        if (link.strategy) {
          q = query(tradesRef, where('userId', '==', link.userId), where('setup', '==', link.strategy));
        } else {
          q = query(tradesRef, where('userId', '==', link.userId));
        }

        const snap = await getDocs(q);
        const data: Trade[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Trade));

        // Ordenar por createdAt descendente (más reciente primero)
        data.sort((a, b) => {
          const tsA = (a.createdAt as any)?.seconds
            ? (a.createdAt as any).seconds * 1000
            : new Date(a.createdAt).getTime();
          const tsB = (b.createdAt as any)?.seconds
            ? (b.createdAt as any).seconds * 1000
            : new Date(b.createdAt).getTime();
          return tsB - tsA;
        });

        setTrades(data);
        setFilteredTrades(data);
      } catch (e) {
        console.error(e);
        setError('Error al cargar los trades');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [linkId]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...trades];

    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.activo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.setup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.comentarios?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterActivo) filtered = filtered.filter((t) => t.activo === filterActivo);
    if (filterSetup) filtered = filtered.filter((t) => t.setup === filterSetup);
    if (filterResultado) filtered = filtered.filter((t) => t.resultado === filterResultado);
    if (filterCuenta) filtered = filtered.filter((t) => t.identificadorCuenta === filterCuenta);

    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'fecha') cmp = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      else cmp = a.ganancia_perdida - b.ganancia_perdida;
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    setFilteredTrades(filtered);
  }, [trades, searchTerm, filterActivo, filterSetup, filterResultado, filterCuenta, sortBy, sortOrder]);

  const exportToCSV = () => {
    const headers = ['Fecha', 'Activo', 'Setup', 'Dirección', 'Contratos', 'Puntos', 'Resultado', 'P&L', 'Comentarios'];
    const rows = filteredTrades.map((t) => [
      t.fecha, t.activo, t.setup, t.direccion, t.contratos, t.puntos,
      t.resultado, t.ganancia_perdida, t.comentarios || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `trades_${linkData?.displayName ?? 'bitacora'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const renderCommentsWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) =>
      part.match(urlRegex) ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all">
          {part}
        </a>
      ) : <span key={i}>{part}</span>
    );
  };

  const uniqueActivos = Array.from(new Set(trades.map((t) => t.activo)));
  const uniqueSetups = Array.from(new Set(trades.map((t) => t.setup)));
  const uniqueCuentas = Array.from(new Set(trades.map((t) => t.identificadorCuenta).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver flex items-center justify-center">
        <div className="text-carbon text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-kint mx-auto mb-4" />
          <p className="text-xl font-heading">Cargando trades...</p>
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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-silver">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-carbon">Todos los Trades</h1>
              <p className="text-text-gray font-body mt-1">
                Total: {filteredTrades.length}
                {filteredTrades.length !== trades.length && ` de ${trades.length}`}
              </p>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200 font-semibold font-body"
            >
              <span>⬇</span>
              <span>Exportar CSV</span>
            </button>
          </div>

          {/* Filtros — idénticos a alltrades original */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <input
              type="text"
              placeholder="🔍 Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
            />
            <select value={filterActivo} onChange={(e) => setFilterActivo(e.target.value)}
              className="px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body">
              <option value="">Todos los activos</option>
              {uniqueActivos.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={filterSetup} onChange={(e) => setFilterSetup(e.target.value)}
              className="px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body">
              <option value="">Todos los setups</option>
              {uniqueSetups.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterResultado} onChange={(e) => setFilterResultado(e.target.value)}
              className="px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body">
              <option value="">Todos los resultados</option>
              <option value="Won">Won</option>
              <option value="Lose">Lose</option>
              <option value="BE">BE</option>
            </select>
            <select value={filterCuenta} onChange={(e) => setFilterCuenta(e.target.value)}
              className="px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body">
              <option value="">Todas las cuentas</option>
              {uniqueCuentas.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb as 'fecha' | 'ganancia_perdida');
                setSortOrder(so as 'asc' | 'desc');
              }}
              className="px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
            >
              <option value="fecha-desc">Más reciente</option>
              <option value="fecha-asc">Más antiguo</option>
              <option value="ganancia_perdida-desc">Mayor ganancia</option>
              <option value="ganancia_perdida-asc">Mayor pérdida</option>
            </select>
          </div>

          {(searchTerm || filterActivo || filterSetup || filterResultado) && (
            <button
              onClick={() => { setSearchTerm(''); setFilterActivo(''); setFilterSetup(''); setFilterResultado(''); }}
              className="text-sm text-gold-kint hover:text-gold-dark font-medium mb-4 font-body"
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>

        {/* Lista de trades — igual que alltrades, sin botones editar/eliminar */}
        {filteredTrades.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-silver">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-heading font-bold text-carbon mb-2">No se encontraron trades</h2>
            <p className="text-text-gray font-body">
              {trades.length === 0 ? 'Sin trades registrados.' : 'Prueba ajustando los filtros.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrades.map((trade) => (
              <div key={trade.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-200 border border-silver">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="text-2xl font-bold text-carbon">{trade.activo}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      trade.resultado === 'Won' ? 'bg-green-100 text-green-800' :
                      trade.resultado === 'Lose' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {trade.resultado}
                    </span>
                    <span className={`text-2xl font-bold font-mono ${
                      trade.ganancia_perdida >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${trade.ganancia_perdida.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-text-gray">
                    <div><span className="font-semibold text-carbon">Fecha:</span> {trade.fecha}</div>
                    <div><span className="font-semibold text-carbon">Setup:</span> {trade.setup}</div>
                    <div><span className="font-semibold text-carbon">Dirección:</span> {trade.direccion}</div>
                    <div>
                      <span className="font-semibold text-carbon">
                        {(trade.tradingType || 'Futuros') === 'Futuros' ? 'Contratos:' : 'Lotes:'}
                      </span>{' '}
                      {trade.contratos.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-semibold text-carbon">
                        {(trade.tradingType || 'Futuros') === 'Futuros' ? 'Puntos:' :
                         (trade.tradingType || 'Futuros') === 'Forex' ? 'Pips:' : 'Ticks:'}
                      </span>{' '}
                      {trade.puntos.toFixed(2)}
                    </div>
                    <div><span className="font-semibold text-carbon">Horario:</span> {trade.horario}</div>
                    <div><span className="font-semibold text-carbon">Entrada:</span> {trade.hora_entrada}</div>
                    <div><span className="font-semibold text-carbon">Salida:</span> {trade.hora_salida}</div>
                  </div>

                  {trade.comentarios && (
                    <div className="mt-3 text-sm text-text-gray font-body">
                      <span className="font-semibold text-carbon">Comentarios:</span>{' '}
                      {renderCommentsWithLinks(trade.comentarios)}
                    </div>
                  )}

                  {trade.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={trade.imageUrl}
                        alt="Trade screenshot"
                        className="rounded-lg max-h-48 cursor-pointer hover:opacity-90"
                        onClick={() => window.open(trade.imageUrl, '_blank')}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
