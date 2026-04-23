// Tipo para un trade individual
export interface Trade {
  id?: string;
  userId: string;
  fecha: string;
  activo: string;
  horario: string;
  identificadorCuenta?: string;
  setup: string;
  direccion: string;
  temporalidad: string;
  tradingType: 'Futuros' | 'Forex' | 'CFDs';
  contratos: number;
  puntos: number;
  hora_entrada: string;
  hora_salida: string;
  trigger_entrada: string;
  ejecute_bien: 'Si' | 'No';
  resultado: 'Won' | 'Lose' | 'BE';
  resultado_especifico: string;
  ganancia_perdida: number;
  comentarios?: string;
  imageUrl?: string;
  rr?: number;
  createdAt: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// Tipo para una reflexión diaria
export interface Reflexion {
  id?: string;
  userId: string;
  fecha: string;
  queBien: string;
  queMejorar: string;
  segunPlan: string;
  disciplina: string;
  exitoso: string;
  tradeTP: boolean;
  noSetup: boolean;
  perdidasControladas: boolean;
  breakeven: boolean;
  noRespetePlan: boolean;
  createdAt: Date;
}

// Tipo para el usuario con planes y gamificación
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  plan: 'free' | 'pro' | 'lifetime';
  role: 'user' | 'admin' | 'beta';
  planStartDate: Date;
  // Stripe
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  // Gamificación
  xp: number;
  level: number;
  badges: string[];
  streak: number; // Días consecutivos
  lastTradeDate?: string;
}

// Configuraciones personalizables del usuario
export interface UserSettings {
  id?: string;
  userId: string;
  tradingType: 'Futuros' | 'Forex' | 'CFDs';
  customSetups: string[];
  updatedAt: Date;
}

// Trading Plan
export interface TradingPlan {
  id?: string;
  userId: string;
  tradesMaxDiarios: number;
  riesgoMaxPorTrade: number;
  perdidaMaxDiaria: number;
  pausaDespuesDePerdidas: number;
  horariosPermitidos: string[];
  reglasPersonalizadas: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sistema de cupones
export interface Coupon {
  id?: string;
  code: string;
  type: 'percentage' | 'fixed' | 'lifetime';
  value: number;
  maxUses: number;
  usedCount: number;
  usedBy: string[];
  validFrom: Date;
  validUntil: Date | null;
  active: boolean;
  createdAt: Date;
  createdBy: string;
}

// Badges disponibles
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

// Niveles de usuario
export interface Level {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
}

// Tipo para estadísticas calculadas
export interface TradeStats {
  totalTrades: number;
  winRate: number;
  winRateWithBE: number;
  totalPL: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  expectedValue: number;
}

// 🔽 NUEVAS INTERFACES (grabaciones)

export interface Recording {
  id?: string;
  userId: string;
  userDisplayName: string;
  tradeId?: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  visibility: 'private' | 'public';
  createdAt: Date;
  views: number;
  commentsEnabled: boolean;
}

export interface RecordingComment {
  id?: string;
  recordingId: string;
  userId: string;
  userDisplayName: string;
  text: string;
  createdAt: Date;
}

// Constantes de gamificación
export const LEVELS: Level[] = [
  { level: 1, name: 'Trader Novato', minXP: 0, maxXP: 100 },
  { level: 2, name: 'Trader Aprendiz', minXP: 100, maxXP: 250 },
  { level: 3, name: 'Trader Practicante', minXP: 250, maxXP: 500 },
  { level: 4, name: 'Trader Competente', minXP: 500, maxXP: 1000 },
  { level: 5, name: 'Trader Avanzado', minXP: 1000, maxXP: 2000 },
  { level: 6, name: 'Trader Experto', minXP: 2000, maxXP: 5000 },
  { level: 7, name: 'Trader Maestro', minXP: 5000, maxXP: 10000 },
  { level: 8, name: 'Trader Leyenda', minXP: 10000, maxXP: Infinity }
];

export const BADGES: Badge[] = [
  {
    id: 'first_win',
    name: 'Primera Victoria',
    description: 'Registra tu primer trade ganador',
    icon: '🏆',
    requirement: '1 trade ganador'
  },
  {
    id: 'fire_streak',
    name: 'Racha de Fuego',
    description: '5 días consecutivos registrando',
    icon: '🔥',
    requirement: '5 días consecutivos'
  },
  {
    id: 'disciplined',
    name: 'Disciplinado',
    description: '30 reflexiones escritas',
    icon: '📚',
    requirement: '30 reflexiones'
  },
  {
    id: 'sniper',
    name: 'Sniper',
    description: 'Win rate >70% con 50+ trades',
    icon: '🎯',
    requirement: 'WR >70% con 50 trades'
  },
  {
    id: 'kintsugi_master',
    name: 'Kintsugi Master',
    description: 'Convierte 10 pérdidas en aprendizajes',
    icon: '💎',
    requirement: '10 trades perdedores con reflexión'
  },
  {
    id: 'speedster',
    name: 'Velocista',
    description: 'Registra 30 trades en 30 días',
    icon: '⚡',
    requirement: '30 trades en 30 días'
  },
  {
    id: 'zen_trader',
    name: 'Zen Trader',
    description: '15 días sin violar tu trading plan',
    icon: '🧘',
    requirement: '15 días cumpliendo el plan'
  },
  {
    id: 'centurion',
    name: 'Centurión',
    description: 'Registra 100 trades',
    icon: '💯',
    requirement: '100 trades registrados'
  }
];

// XP por acción
export const XP_REWARDS = {
  TRADE_REGISTERED: 10,
  REFLEXION_WRITTEN: 15,
  WINNING_TRADE: 5,
  STREAK_BONUS: 50,
  HIGH_WINRATE: 100,
  TRADING_PLAN_COMPLETED: 75
};

// Límites de planes
export const PLAN_LIMITS = {
  free: {
    tradesPerMonth: 20,
    reflexionesPerMonth: 20,
    canUploadImages: false,
    hasInsights: false
  },
  pro: {
    tradesPerMonth: Infinity,
    reflexionesPerMonth: Infinity,
    canUploadImages: true,
    hasInsights: true
  },
  lifetime: {
    tradesPerMonth: Infinity,
    reflexionesPerMonth: Infinity,
    canUploadImages: true,
    hasInsights: true
  }
};