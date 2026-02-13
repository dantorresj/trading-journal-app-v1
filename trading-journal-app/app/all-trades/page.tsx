'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trade } from '@/types';
import Navbar from '@/components/Navbar';

export default function AllTradesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('');
  const [filterSetup, setFilterSetup] = useState('');
  const [filterResultado, setFilterResultado] = useState('');
  const [sortBy, setSortBy] = useState<'fecha' | 'ganancia_perdida'>('fecha');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadTrades();
  }, [user, router]);

  useEffect(() => {
    applyFilters();
  }, [trades, searchTerm, filterActivo, filterSetup, filterResultado, sortBy, sortOrder]);

  const loadTrades = async () => {
    if (!user) return;

    try {
      const tradesRef = collection(db, 'trades');
      const q = query(
        tradesRef,
        where('userId', '==', user.uid),
        orderBy('fecha', 'desc')
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

  const applyFilters = () => {
    let filtered = [...trades];

    // Búsqueda por texto
    if (searchTerm) {
      filtered = filtered.filter(trade =>
        trade.activo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.setup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.comentarios?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por activo
    if (filterActivo) {
      filtered = filtered.filter(trade => trade.activo === filterActivo);
    }

    // Filtro por setup
    if (filterSetup) {
      filtered = filtered.filter(trade => trade.setup === filterSetup);
    }

    // Filtro por resultado
    if (filterResultado) {
      filtered = filtered.filter(trade => trade.resultado === filterResultado);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'fecha') {
        comparison = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      } else if (sortBy === 'ganancia_perdida') {
        comparison = a.ganancia_perdida - b.ganancia_perdida;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredTrades(filtered);
  };

  const handleDelete = async () => {
    if (!selectedTrade?.id) return;

    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'trades', selectedTrade.id));
      setTrades(trades.filter(t => t.id !== selectedTrade.id));
      setShowDeleteModal(false);
      setSelectedTrade(null);
    } catch (error) {
      console.error('Error deleting trade:', error);
      alert('Error al eliminar el trade');
    } finally {
      setDeleteLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Activo', 'Setup', 'Dirección', 'Contratos', 'Puntos', 'Resultado', 'P&L', 'Comentarios'];
    const csvData = filteredTrades.map(trade => [
      trade.fecha,
      trade.activo,
      trade.setup,
      trade.direccion,
      trade.contratos,
      trade.puntos,
      trade.resultado,
      trade.ganancia_perdida,
      trade.comentarios || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `trades_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const uniqueActivos = Array.from(new Set(trades.map(t => t.activo)));
  const uniqueSetups = Array.from(new Set(trades.map(t => t.setup)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Cargando trades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500">
      <Navbar onLogout={logout} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Todos los Trades</h1>
              <p className="text-gray-600 mt-1">
                Total: {filteredTrades.length} {filteredTrades.length !== trades.length && `de ${trades.length}`}
              </p>
            </div>
            
            <button
              onClick={exportToCSV}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 flex items-center space-x-2"
            >
              <span>📊</span>
              <span>Exportar CSV</span>
            </button>
          </div>

          {/* Filtros y búsqueda */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <input
              type="text"
              placeholder="🔍 Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />

            <select
              value={filterActivo}
              onChange={(e) => setFilterActivo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos los activos</option>
              {uniqueActivos.map(activo => (
                <option key={activo} value={activo}>{activo}</option>
              ))}
            </select>

            <select
              value={filterSetup}
              onChange={(e) => setFilterSetup(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos los setups</option>
              {uniqueSetups.map(setup => (
                <option key={setup} value={setup}>{setup}</option>
              ))}
            </select>

            <select
              value={filterResultado}
              onChange={(e) => setFilterResultado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos los resultados</option>
              <option value="Won">Won</option>
              <option value="Lose">Lose</option>
              <option value="BE">BE</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy as 'fecha' | 'ganancia_perdida');
                setSortOrder(newSortOrder as 'asc' | 'desc');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="fecha-desc">Más reciente</option>
              <option value="fecha-asc">Más antiguo</option>
              <option value="ganancia_perdida-desc">Mayor ganancia</option>
              <option value="ganancia_perdida-asc">Mayor pérdida</option>
            </select>
          </div>

          {/* Botón para limpiar filtros */}
          {(searchTerm || filterActivo || filterSetup || filterResultado) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterActivo('');
                setFilterSetup('');
                setFilterResultado('');
              }}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium mb-4"
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>

        {/* Lista de trades */}
        {filteredTrades.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No se encontraron trades
            </h2>
            <p className="text-gray-600">
              {trades.length === 0 
                ? 'Aún no has registrado ningún trade.'
                : 'Prueba ajustando los filtros de búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrades.map((trade) => (
              <div
                key={trade.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="text-2xl font-bold text-gray-800">{trade.activo}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        trade.resultado === 'Won' ? 'bg-green-100 text-green-800' :
                        trade.resultado === 'Lose' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {trade.resultado}
                      </span>
                      <span className={`text-2xl font-bold ${
                        trade.ganancia_perdida >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${trade.ganancia_perdida.toFixed(2)}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">Fecha:</span> {trade.fecha}
                      </div>
                      <div>
                        <span className="font-semibold">Setup:</span> {trade.setup}
                      </div>
                      <div>
                        <span className="font-semibold">Dirección:</span> {trade.direccion}
                      </div>
                      <div>
                        <span className="font-semibold">Contratos:</span> {trade.contratos}
                      </div>
                      <div>
                        <span className="font-semibold">Puntos:</span> {trade.puntos}
                      </div>
                      <div>
                        <span className="font-semibold">Horario:</span> {trade.horario}
                      </div>
                      <div>
                        <span className="font-semibold">Entrada:</span> {trade.hora_entrada}
                      </div>
                      <div>
                        <span className="font-semibold">Salida:</span> {trade.hora_salida}
                      </div>
                    </div>

                    {trade.comentarios && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-semibold">Comentarios:</span> {trade.comentarios}
                      </div>
                    )}

                    {trade.imageUrl && (
                      <div className="mt-3">
                        <img 
                          src={trade.imageUrl} 
                          alt="Trade screenshot" 
                          className="rounded-lg max-h-48 cursor-pointer hover:opacity-90"
                          onClick={() => window.open(trade.imagen, '_blank')}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 mt-4 md:mt-0 md:ml-4">
                    <button
                      onClick={() => router.push(`/edit-trade/${trade.id}`)}
                      className="flex-1 md:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition duration-200"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTrade(trade);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 md:w-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition duration-200"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ¿Eliminar trade?
            </h2>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de eliminar el trade de <strong>{selectedTrade.activo}</strong> del {selectedTrade.fecha}?
              <br />
              <span className="text-red-600 font-semibold">Esta acción no se puede deshacer.</span>
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTrade(null);
                }}
                disabled={deleteLoading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
