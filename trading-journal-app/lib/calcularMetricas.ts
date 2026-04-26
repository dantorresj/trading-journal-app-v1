import { Trade } from '@/types';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function getDiaSemana(fecha: string): string {
  const d = new Date(fecha + 'T12:00:00'); // noon para evitar timezone shift
  return DIAS[d.getDay()];
}

function agruparPor<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function calcularWinRate(trades: Trade[]): number {
  const wonLose = trades.filter(t => t.resultado === 'Won' || t.resultado === 'Lose');
  if (wonLose.length === 0) return 0;
  const wins = wonLose.filter(t => t.resultado === 'Won').length;
  return parseFloat(((wins / wonLose.length) * 100).toFixed(1));
}

function calcularPnL(trades: Trade[]): number {
  return parseFloat(
    trades
      .filter(t => t.resultado === 'Won' || t.resultado === 'Lose')
      .reduce((sum, t) => sum + t.ganancia_perdida, 0)
      .toFixed(2)
  );
}

function calcularProfitFactor(trades: Trade[]): number {
  const wins = trades.filter(t => t.resultado === 'Won');
  const losses = trades.filter(t => t.resultado === 'Lose');
  const totalWins = wins.reduce((sum, t) => sum + Math.abs(t.ganancia_perdida), 0);
  const totalLosses = losses.reduce((sum, t) => sum + Math.abs(t.ganancia_perdida), 0);
  if (totalLosses === 0) return totalWins > 0 ? 999 : 0;
  return parseFloat((totalWins / totalLosses).toFixed(2));
}

function calcularRRPromedio(trades: Trade[]): number | null {
  const conRR = trades.filter(t => t.rr !== undefined && t.rr !== null && t.rr > 0);
  if (conRR.length === 0) return null;
  const avg = conRR.reduce((sum, t) => sum + (t.rr as number), 0) / conRR.length;
  return parseFloat(avg.toFixed(2));
}

// ─────────────────────────────────────────────
// TIPOS DE SALIDA
// ─────────────────────────────────────────────

export interface MetricaGrupo {
  winRate: number;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  profitFactor: number;
  rrPromedio: number | null;
}

export interface MetricaSetup extends MetricaGrupo {
  nombre: string;
  frecuencia: number; // % del total de trades
}

export interface MetricaRacha {
  despuesDeRacha: MetricaGrupo;
  normal: MetricaGrupo;
  rachaAnalizada: number; // cuántas pérdidas consecutivas
}

export interface MetricasCompletas {
  resumen: {
    totalTrades: number;
    winRate: number;
    winRateConBE: number;
    pnlTotal: number;
    profitFactor: number;
    avgWin: number;
    avgLoss: number;
    expectedValue: number;
    rrPromedio: number | null;
  };
  porDiaSemana: Record<string, MetricaGrupo>;
  porSetup: Record<string, MetricaSetup>;
  porHorario: Record<string, MetricaGrupo>;
  porDireccion: Record<string, MetricaGrupo>;
  porActivo: Record<string, MetricaGrupo>;
  porEjecucion: {
    ejecutoBien: MetricaGrupo;
    ejecutoMal: MetricaGrupo;
  };
  rachas: MetricaRacha;
  mejorDia: { dia: string; winRate: number } | null;
  peorDia: { dia: string; winRate: number } | null;
  mejorSetup: { nombre: string; winRate: number; pnl: number } | null;
  setupMasUsadoVsRentable: {
    masUsado: string;
    masRentable: string;
    sonIguales: boolean;
  } | null;
}

// ─────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────

export function calcularMetricas(trades: Trade[]): MetricasCompletas {
  const tradesValidos = trades.filter(t => t.resultado === 'Won' || t.resultado === 'Lose');
  const total = trades.length;

  // ── RESUMEN GLOBAL ──
  const wins = tradesValidos.filter(t => t.resultado === 'Won');
  const losses = tradesValidos.filter(t => t.resultado === 'Lose');
  const totalWinsAmount = wins.reduce((sum, t) => sum + Math.abs(t.ganancia_perdida), 0);
  const totalLossesAmount = losses.reduce((sum, t) => sum + Math.abs(t.ganancia_perdida), 0);
  const winRate = calcularWinRate(trades);
  const winRateConBE = total > 0 ? parseFloat(((wins.length / total) * 100).toFixed(1)) : 0;
  const pnlTotal = calcularPnL(trades);
  const profitFactor = calcularProfitFactor(trades);
  const avgWin = wins.length > 0 ? parseFloat((totalWinsAmount / wins.length).toFixed(2)) : 0;
  const avgLoss = losses.length > 0 ? parseFloat((totalLossesAmount / losses.length).toFixed(2)) : 0;
  const lossRate = tradesValidos.length > 0 ? losses.length / tradesValidos.length : 0;
  const expectedValue = parseFloat(((avgWin * (winRate / 100)) - (avgLoss * lossRate)).toFixed(2));
  const rrPromedio = calcularRRPromedio(trades);

  // ── POR DÍA DE SEMANA ──
  const porDiaRaw = agruparPor(trades, t => getDiaSemana(t.fecha));
  const porDiaSemana: Record<string, MetricaGrupo> = {};
  for (const [dia, ts] of Object.entries(porDiaRaw)) {
    const w = ts.filter(t => t.resultado === 'Won');
    const l = ts.filter(t => t.resultado === 'Lose');
    porDiaSemana[dia] = {
      winRate: calcularWinRate(ts),
      pnl: calcularPnL(ts),
      trades: ts.length,
      wins: w.length,
      losses: l.length,
      profitFactor: calcularProfitFactor(ts),
      rrPromedio: calcularRRPromedio(ts),
    };
  }

  // ── MEJOR Y PEOR DÍA ──
  const diasConDatos = Object.entries(porDiaSemana).filter(([, m]) => m.trades >= 3);
  let mejorDia = null;
  let peorDia = null;
  if (diasConDatos.length > 0) {
    const sorted = diasConDatos.sort((a, b) => b[1].winRate - a[1].winRate);
    mejorDia = { dia: sorted[0][0], winRate: sorted[0][1].winRate };
    peorDia = { dia: sorted[sorted.length - 1][0], winRate: sorted[sorted.length - 1][1].winRate };
  }

  // ── POR SETUP ──
  const porSetupRaw = agruparPor(trades, t => t.setup || 'Sin setup');
  const porSetup: Record<string, MetricaSetup> = {};
  for (const [setup, ts] of Object.entries(porSetupRaw)) {
    const w = ts.filter(t => t.resultado === 'Won');
    const l = ts.filter(t => t.resultado === 'Lose');
    porSetup[setup] = {
      nombre: setup,
      frecuencia: parseFloat(((ts.length / total) * 100).toFixed(1)),
      winRate: calcularWinRate(ts),
      pnl: calcularPnL(ts),
      trades: ts.length,
      wins: w.length,
      losses: l.length,
      profitFactor: calcularProfitFactor(ts),
      rrPromedio: calcularRRPromedio(ts),
    };
  }

  // ── MEJOR SETUP Y COMPARATIVA ──
  const setupsConDatos = Object.values(porSetup).filter(s => s.trades >= 3);
  let mejorSetup = null;
  let setupMasUsadoVsRentable = null;
  if (setupsConDatos.length > 0) {
    const porRentabilidad = [...setupsConDatos].sort((a, b) => b.pnl - a.pnl);
    const porUso = [...setupsConDatos].sort((a, b) => b.frecuencia - a.frecuencia);
    mejorSetup = {
      nombre: porRentabilidad[0].nombre,
      winRate: porRentabilidad[0].winRate,
      pnl: porRentabilidad[0].pnl,
    };
    setupMasUsadoVsRentable = {
      masUsado: porUso[0].nombre,
      masRentable: porRentabilidad[0].nombre,
      sonIguales: porUso[0].nombre === porRentabilidad[0].nombre,
    };
  }

  // ── POR HORARIO ──
  const porHorarioRaw = agruparPor(trades, t => t.horario || 'Sin horario');
  const porHorario: Record<string, MetricaGrupo> = {};
  for (const [horario, ts] of Object.entries(porHorarioRaw)) {
    const w = ts.filter(t => t.resultado === 'Won');
    const l = ts.filter(t => t.resultado === 'Lose');
    porHorario[horario] = {
      winRate: calcularWinRate(ts),
      pnl: calcularPnL(ts),
      trades: ts.length,
      wins: w.length,
      losses: l.length,
      profitFactor: calcularProfitFactor(ts),
      rrPromedio: calcularRRPromedio(ts),
    };
  }

  // ── POR DIRECCIÓN ──
  const porDireccionRaw = agruparPor(trades, t => t.direccion || 'Sin dirección');
  const porDireccion: Record<string, MetricaGrupo> = {};
  for (const [dir, ts] of Object.entries(porDireccionRaw)) {
    const w = ts.filter(t => t.resultado === 'Won');
    const l = ts.filter(t => t.resultado === 'Lose');
    porDireccion[dir] = {
      winRate: calcularWinRate(ts),
      pnl: calcularPnL(ts),
      trades: ts.length,
      wins: w.length,
      losses: l.length,
      profitFactor: calcularProfitFactor(ts),
      rrPromedio: calcularRRPromedio(ts),
    };
  }

  // ── POR ACTIVO ──
  const porActivoRaw = agruparPor(trades, t => t.activo || 'Sin activo');
  const porActivo: Record<string, MetricaGrupo> = {};
  for (const [activo, ts] of Object.entries(porActivoRaw)) {
    const w = ts.filter(t => t.resultado === 'Won');
    const l = ts.filter(t => t.resultado === 'Lose');
    porActivo[activo] = {
      winRate: calcularWinRate(ts),
      pnl: calcularPnL(ts),
      trades: ts.length,
      wins: w.length,
      losses: l.length,
      profitFactor: calcularProfitFactor(ts),
      rrPromedio: calcularRRPromedio(ts),
    };
  }

  // ── POR EJECUCIÓN ──
  const ejecutoBienTrades = trades.filter(t => t.ejecute_bien === 'Si');
  const ejecutoMalTrades = trades.filter(t => t.ejecute_bien === 'No');

  const buildGrupo = (ts: Trade[]): MetricaGrupo => ({
    winRate: calcularWinRate(ts),
    pnl: calcularPnL(ts),
    trades: ts.length,
    wins: ts.filter(t => t.resultado === 'Won').length,
    losses: ts.filter(t => t.resultado === 'Lose').length,
    profitFactor: calcularProfitFactor(ts),
    rrPromedio: calcularRRPromedio(ts),
  });

  const porEjecucion = {
    ejecutoBien: buildGrupo(ejecutoBienTrades),
    ejecutoMal: buildGrupo(ejecutoMalTrades),
  };

  // ── RACHAS DE PÉRDIDAS ──
  // Ordenar por fecha ascendente para detectar rachas correctamente
  const tradesOrdenados = [...trades].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  const RACHA_ANALIZADA = 3;
  const postRachaTrades: Trade[] = [];
  const normalTrades: Trade[] = [];

  let rachaActual = 0;
  let enRacha = false;

  for (let i = 0; i < tradesOrdenados.length; i++) {
    const t = tradesOrdenados[i];

    if (enRacha) {
      postRachaTrades.push(t);
      enRacha = false;
    } else {
      normalTrades.push(t);
    }

    if (t.resultado === 'Lose') {
      rachaActual++;
      if (rachaActual >= RACHA_ANALIZADA) {
        enRacha = true;
        rachaActual = 0;
      }
    } else {
      rachaActual = 0;
    }
  }

  const rachas: MetricaRacha = {
    rachaAnalizada: RACHA_ANALIZADA,
    despuesDeRacha: buildGrupo(postRachaTrades),
    normal: buildGrupo(normalTrades),
  };

  return {
    resumen: {
      totalTrades: total,
      winRate,
      winRateConBE,
      pnlTotal,
      profitFactor,
      avgWin,
      avgLoss,
      expectedValue,
      rrPromedio,
    },
    porDiaSemana,
    porSetup,
    porHorario,
    porDireccion,
    porActivo,
    porEjecucion,
    rachas,
    mejorDia,
    peorDia,
    mejorSetup,
    setupMasUsadoVsRentable,
  };
}
