'use client';

import { Trade } from '@/types';
import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardChartsProps {
  trades: Trade[];
}

export default function DashboardCharts({ trades }: DashboardChartsProps) {
  // Curva de Equity
  const equityData = useMemo(() => {
    const sortedTrades = [...trades].sort((a, b) => {
    const dateTimeA = new Date(`${a.fecha}T${a.hora_entrada || '00:00'}`).getTime();
    const dateTimeB = new Date(`${b.fecha}T${b.hora_entrada || '00:00'}`).getTime();
    return dateTimeA - dateTimeB;
  });
    let cumulative = 0;
    const data = trades.map((trade, i) => {
      cumulative += trade.ganancia_perdida;
      return cumulative;
    });

    return {
      labels: trades.map((_, i) => i + 1),
      datasets: [{
        label: 'P&L Acumulado',
        data: data,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6
      }]
    };
  }, [trades]);

  // P&L Diario
  const dailyPLData = useMemo(() => {
    const dailyPL: { [key: string]: number } = {};
    trades.forEach(trade => {
      const date = new Date(trade.fecha);
      const dateKey = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear()).slice(-2)}`;
      dailyPL[dateKey] = (dailyPL[dateKey] || 0) + trade.ganancia_perdida;
    });

    const sortedDates = Object.keys(dailyPL).sort();
    const colors = sortedDates.map(date => dailyPL[date] >= 0 ? '#10b981' : '#ef4444');

    return {
      labels: sortedDates,
      datasets: [{
        label: 'P&L Diario',
        data: sortedDates.map(date => dailyPL[date]),
        backgroundColor: colors
      }]
    };
  }, [trades]);

  // P&L Mensual
  const monthlyPLData = useMemo(() => {
    const monthlyPL: { [key: string]: number } = {};
    trades.forEach(trade => {
      const monthKey = trade.fecha.substring(0, 7);
      monthlyPL[monthKey] = (monthlyPL[monthKey] || 0) + trade.ganancia_perdida;
    });

    const sortedMonths = Object.keys(monthlyPL).sort();
    const colors = sortedMonths.map(month => monthlyPL[month] >= 0 ? '#10b981' : '#ef4444');

    return {
      labels: sortedMonths,
      datasets: [{
        label: 'P&L Mensual',
        data: sortedMonths.map(month => monthlyPL[month]),
        backgroundColor: colors
      }]
    };
  }, [trades]);

  // Distribución por Activo
  const assetData = useMemo(() => {
    const assetCount: { [key: string]: number } = {};
    trades.forEach(trade => {
      assetCount[trade.activo] = (assetCount[trade.activo] || 0) + 1;
    });

    return {
      labels: Object.keys(assetCount),
      datasets: [{
        data: Object.values(assetCount),
        backgroundColor: [
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#4facfe',
          '#43e97b'
        ]
      }]
    };
  }, [trades]);

  // Win/Loss Distribution
  const winLossData = useMemo(() => {
    const wins = trades.filter(t => t.resultado === 'Won').length;
    const losses = trades.filter(t => t.resultado === 'Lose').length;
    const be = trades.filter(t => t.resultado === 'BE').length;

    return {
      labels: ['Ganadas', 'Perdidas', 'Breakeven'],
      datasets: [{
        data: [wins, losses, be],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
      }]
    };
  }, [trades]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  };

  const ChartCard = ({ title, children, fullWidth = false }: any) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${fullWidth ? 'col-span-full' : ''}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <div style={{ height: fullWidth ? '400px' : '300px' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Curva de Equity - Full Width */}
      <ChartCard title="Curva de Equity" fullWidth>
        <Line data={equityData} options={chartOptions} />
      </ChartCard>

      {/* Grid de 2 columnas */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="P&L Diario">
          <Bar data={dailyPLData} options={chartOptions} />
        </ChartCard>

        <ChartCard title="P&L Mensual">
          <Bar data={monthlyPLData} options={chartOptions} />
        </ChartCard>

        <ChartCard title="Distribución por Activo">
          <Doughnut data={assetData} options={{ responsive: true, maintainAspectRatio: false }} />
        </ChartCard>

        <ChartCard title="Win/Loss Distribution">
          <Pie data={winLossData} options={{ responsive: true, maintainAspectRatio: false }} />
        </ChartCard>
      </div>
    </div>
  );
}
