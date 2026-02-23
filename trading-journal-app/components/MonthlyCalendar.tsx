'use client';

import { Trade, TradingPlan } from '@/types';

interface MonthlyCalendarProps {
  trades: Trade[];
  tradingPlan: TradingPlan | null;
  currentMonth: Date;
}

interface DayData {
  day: number;
  pl: number;
  tradesCount: number;
  violatedPlan: boolean;
  isToday: boolean;
}

export default function MonthlyCalendar({ trades, tradingPlan, currentMonth }: MonthlyCalendarProps) {
  
  // Obtener días del mes
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Domingo
  
  // Calcular datos por día
  const getDayData = (day: number): DayData => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTrades = trades.filter(t => t.fecha === dateStr);
    
    const pl = dayTrades.reduce((sum, t) => sum + t.ganancia_perdida, 0);
    const tradesCount = dayTrades.length;
    
    // Verificar violación del trading plan
    let violatedPlan = false;
    if (tradingPlan && tradesCount > 0) {
      // Verificar trades máximos
      if (tradesCount > tradingPlan.tradesMaxDiarios) {
        violatedPlan = true;
      }
      
      // Verificar pérdida máxima diaria
      if (pl < 0 && Math.abs(pl) > tradingPlan.perdidaMaxDiaria) {
        violatedPlan = true;
      }
      
      // Verificar pérdidas consecutivas (simplificado)
      const lossTrades = dayTrades.filter(t => t.resultado === 'Lose');
      if (lossTrades.length >= tradingPlan.pausaDespuesDePerdidas) {
        violatedPlan = true;
      }
    }
    
    const today = new Date();
    const isToday = today.getDate() === day && 
                    today.getMonth() === month && 
                    today.getFullYear() === year;
    
    return { day, pl, tradesCount, violatedPlan, isToday };
  };
  
  // Generar calendario
  const calendar: (DayData | null)[] = [];
  
  // Espacios vacíos al inicio
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendar.push(null);
  }
  
  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    calendar.push(getDayData(day));
  }
  
  // Calcular resumen mensual
  const monthlyPL = trades.reduce((sum, t) => sum + t.ganancia_perdida, 0);
  const totalTrades = trades.length;
  const daysWithViolations = calendar.filter(d => d && d.violatedPlan).length;
  const daysTraded = calendar.filter(d => d && d.tradesCount > 0).length;
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-silver">
      <h3 className="text-2xl font-heading font-bold text-carbon mb-6">
        {monthNames[month]} {year}
      </h3>
      
      {/* Grid del calendario */}
      <div className="mb-6">
        {/* Encabezados de días */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-sm font-body font-semibold text-text-gray py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2">
          {calendar.map((dayData, index) => {
            if (!dayData) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }
            
            const { day, pl, tradesCount, violatedPlan, isToday } = dayData;
            
            // Determinar color del día
            let dayColorClass = 'text-carbon';
            if (pl > 0) dayColorClass = 'text-growth-jade font-semibold';
            if (pl < 0) dayColorClass = 'text-lesson-red font-semibold';
            
            // Determinar borde si violó el plan
            const borderClass = violatedPlan 
              ? 'border-2 border-lesson-red' 
              : isToday 
                ? 'border-2 border-gold-kint' 
                : 'border border-silver';
            
            return (
              <div
                key={day}
                className={`
                  aspect-square rounded-lg ${borderClass} 
                  flex flex-col items-center justify-center
                  hover:bg-gray-50 transition-colors duration-200
                  ${tradesCount > 0 ? 'bg-gray-50' : 'bg-white'}
                `}
              >
                <span className={`text-lg font-mono ${dayColorClass}`}>
                  {day}
                </span>
                {tradesCount > 0 && (
                  <span className={`text-xs font-mono mt-1 ${dayColorClass}`}>
                    ${pl >= 0 ? '+' : ''}{pl.toFixed(0)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 text-sm font-body text-text-gray mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-gold-kint rounded"></div>
          <span>Hoy</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-lesson-red rounded"></div>
          <span>Plan violado</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-growth-jade font-semibold">+123</span>
          <span>Ganancia</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-lesson-red font-semibold">-123</span>
          <span>Pérdida</span>
        </div>
      </div>
      
      {/* Resumen mensual */}
      <div className="border-t border-silver pt-6">
        <h4 className="text-lg font-heading font-semibold text-carbon mb-4">
          Resumen del Mes
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-text-gray font-body mb-1">P&L Total</p>
            <p className={`text-2xl font-mono font-bold ${monthlyPL >= 0 ? 'text-growth-jade' : 'text-lesson-red'}`}>
              ${monthlyPL >= 0 ? '+' : ''}{monthlyPL.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-text-gray font-body mb-1">Total Trades</p>
            <p className="text-2xl font-mono font-bold text-carbon">{totalTrades}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-text-gray font-body mb-1">Días Operados</p>
            <p className="text-2xl font-mono font-bold text-carbon">{daysTraded}/{daysInMonth}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-text-gray font-body mb-1">Días con Violación</p>
            <p className={`text-2xl font-mono font-bold ${daysWithViolations === 0 ? 'text-growth-jade' : 'text-lesson-red'}`}>
              {daysWithViolations}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
