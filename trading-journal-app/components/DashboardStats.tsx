'use client';

import { Trade } from '@/types';
import { useMemo } from 'react';

interface DashboardStatsProps {
  trades: Trade[];
}

export default function DashboardStats({ trades }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const total = trades.length;
    const wins = trades.filter(t => t.resultado === 'Won');
    const losses = trades.filter(t => t.resultado === 'Lose');
    const breakevens = trades.filter(t => t.resultado === 'BE');
    
    // Win Rate solo Won vs Lose (sin BE)
    const tradesWonLose = wins.length + losses.length;
    const winRate = tradesWonLose > 0 ? ((wins.length / tradesWonLose) * 100) : 0;
    
    // Win Rate con BE = Won / Total
    const winRateWithBE = total > 0 ? ((wins.length / total) * 100) : 0;
    
    // Win Rate del mes actual
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthTrades = trades.filter(t => {
      const tradeMonth = t.fecha.substring(0, 7);
      return tradeMonth === currentMonth;
    });
    const currentMonthWins = currentMonthTrades.filter(t => t.resultado === 'Won');
    const currentMonthLosses = currentMonthTrades.filter(t => t.resultado === 'Lose');
    const currentMonthWonLose = currentMonthWins.length + currentMonthLosses.length;
    const winRateCurrentMonth = currentMonthWonLose > 0 ? ((currentMonthWins.length / currentMonthWonLose) * 100) : 0;
    const winRateCurrentMonthBE = currentMonthTrades.length > 0 ? ((currentMonthWins.length / currentMonthTrades.length) * 100) : 0;
    
    const totalWins = wins.reduce((sum, t) => sum + Math.abs(t.ganancia_perdida), 0);
    const totalLosses = losses.reduce((sum, t) => sum + Math.abs(t.ganancia_perdida), 0);
    const totalPL = wins.reduce((sum, t) => sum + t.ganancia_perdida, 0) + 
                    losses.reduce((sum, t) => sum + t.ganancia_perdida, 0);
    
    const profitFactor = totalLosses > 0 ? (totalWins / totalLosses) : (totalWins > 0 ? Infinity : 0);
    const avgWin = wins.length > 0 ? (totalWins / wins.length) : 0;
    const avgLoss = losses.length > 0 ? (totalLosses / losses.length) : 0;
    
    // Expected Value = (Avg Win × Win Rate) - (Avg Loss × Loss Rate)
    const lossRate = tradesWonLose > 0 ? (losses.length / tradesWonLose) : 0;
    const expectedValue = (avgWin * (winRate / 100)) - (avgLoss * lossRate);
    
    return {
      total,
      winRate,
      winRateWithBE,
      winRateCurrentMonth,
      winRateCurrentMonthBE,
      totalPL,
      profitFactor,
      avgWin,
      avgLoss,
      expectedValue
    };
  }, [trades]);

  const StatCard = ({ title, value, isPositive, isNegative }: any) => (
    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <div className={`text-3xl font-bold ${
        isPositive ? 'text-green-600' : 
        isNegative ? 'text-red-600' : 
        'text-gray-800'
      }`}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      <StatCard title="Total Trades" value={stats.total} />
      <StatCard title="Win Rate" value={`${stats.winRate.toFixed(1)}%`} isPositive />
      <StatCard title="Win Rate (con BE)" value={`${stats.winRateWithBE.toFixed(1)}%`} isPositive />
      <StatCard title="WR Mes Actual" value={`${stats.winRateCurrentMonth.toFixed(1)}%`} isPositive />
      <StatCard title="WR Mes (con BE)" value={`${stats.winRateCurrentMonthBE.toFixed(1)}%`} isPositive />
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
      <StatCard title="Avg Win" value={`$${stats.avgWin.toFixed(2)}`} isPositive />
      <StatCard title="Avg Loss" value={`$${stats.avgLoss.toFixed(2)}`} isNegative />
      <StatCard 
        title="Expected Value" 
        value={`$${stats.expectedValue.toFixed(2)}`}
        isPositive={stats.expectedValue >= 0}
        isNegative={stats.expectedValue < 0}
      />
    </div>
  );
}
