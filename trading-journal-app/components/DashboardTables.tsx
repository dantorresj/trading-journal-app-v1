'use client';

import { Trade } from '@/types';
import { useMemo } from 'react';

interface DashboardTablesProps {
  trades: Trade[];
}

export default function DashboardTables({ trades }: DashboardTablesProps) {
  // Histórico mensual
  const monthlyStats = useMemo(() => {
    const monthlyData: { [key: string]: any } = {};
    
    trades.forEach(trade => {
      const date = new Date(trade.fecha);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          trades: [],
          wins: 0,
          losses: 0
        };
      }
      
      monthlyData[monthKey].trades.push(trade);
      if (trade.resultado === 'Won') {
        monthlyData[monthKey].wins++;
      } else if (trade.resultado === 'Lose') {
        monthlyData[monthKey].losses++;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, stats]) => {
        const total = stats.trades.length;
        const winRate = total > 0 ? ((stats.wins / total) * 100).toFixed(1) : '0.0';
        const totalPL = stats.trades.reduce((sum: number, t: Trade) => sum + t.ganancia_perdida, 0);
        
        const winTrades = stats.trades.filter((t: Trade) => t.resultado === 'Won');
        const lossTrades = stats.trades.filter((t: Trade) => t.resultado === 'Lose');
        
        const totalWins = winTrades.reduce((sum: number, t: Trade) => sum + Math.abs(t.ganancia_perdida), 0);
        const totalLosses = lossTrades.reduce((sum: number, t: Trade) => sum + Math.abs(t.ganancia_perdida), 0);
        
        const avgWin = winTrades.length > 0 ? (totalWins / winTrades.length).toFixed(2) : '0.00';
        const avgLoss = lossTrades.length > 0 ? (totalLosses / lossTrades.length).toFixed(2) : '0.00';
        const profitFactor = totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : (totalWins > 0 ? '∞' : '0');
        
        return {
          month,
          total,
          winRate,
          totalPL: totalPL.toFixed(2),
          avgWin,
          avgLoss,
          profitFactor
        };
      })
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [trades]);

  // Últimos 10 trades — ordenados por timestamp real de registro (createdAt)
  const lastTrades = useMemo(() => {
    return [...trades]
      .sort((a, b) => {
        const tsA = (a.createdAt as any)?.seconds
          ? (a.createdAt as any).seconds * 1000
          : new Date(a.createdAt).getTime();
        const tsB = (b.createdAt as any)?.seconds
          ? (b.createdAt as any).seconds * 1000
          : new Date(b.createdAt).getTime();
        return tsB - tsA; // descendente: el más recientemente registrado arriba
      })
      .slice(0, 10);
  }, [trades]);

  return (
    <div className="space-y-6">
      {/* Tabla de histórico mensual */}
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Histórico Mensual
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Mes</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Trades</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Win Rate</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">P&L</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Win</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Loss</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Profit Factor</th>
            </tr>
          </thead>
          <tbody>
            {monthlyStats.map((row) => (
              <tr key={row.month} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold">{row.month}</td>
                <td className="py-3 px-4">{row.total}</td>
                <td className="py-3 px-4">{row.winRate}%</td>
                <td className={`py-3 px-4 font-semibold ${parseFloat(row.totalPL) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${row.totalPL}
                </td>
                <td className="py-3 px-4 text-green-600">${row.avgWin}</td>
                <td className="py-3 px-4 text-red-600">${row.avgLoss}</td>
                <td className="py-3 px-4 font-semibold">{row.profitFactor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabla de últimos 10 trades */}
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Últimos 10 Trades
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Activo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Setup</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Dirección</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Contratos</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Resultado</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">P&L</th>
            </tr>
          </thead>
          <tbody>
            {lastTrades.map((trade) => (
              <tr key={trade.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">{trade.fecha}</td>
                <td className="py-3 px-4">{trade.activo}</td>
                <td className="py-3 px-4">{trade.setup}</td>
                <td className="py-3 px-4 capitalize">{trade.direccion}</td>
                <td className="py-3 px-4">{trade.contratos}</td>
                <td className={`py-3 px-4 font-semibold ${
                  trade.resultado === 'Won' ? 'text-green-600' : 
                  trade.resultado === 'Lose' ? 'text-red-600' : 
                  'text-yellow-600'
                }`}>
                  {trade.resultado}
                </td>
                <td className={`py-3 px-4 font-semibold ${trade.ganancia_perdida >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${trade.ganancia_perdida.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
