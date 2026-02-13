// Tipo para un trade individual
export interface Trade {
  id?: string;
  userId: string;
  fecha: string;
  activo: string;
  horario: string;
  identificadorCuenta?: string; // NUEVO: Identificador de la cuenta
  setup: string;
  direccion: string;
  temporalidad: string;
  contratos: number;
  puntos: number;
  hora_entrada: string;
  hora_salida: string;
  resultado: 'Won' | 'Lose' | 'BE';
  resultado_especifico: string;
  ganancia_perdida: number;
  comentarios?: string;
  imageUrl?: string; // URL de la imagen en Firebase Storage
  createdAt: Date;
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

// Tipo para el usuario
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  plan: 'free' | 'premium';
}

// Configuraciones personalizables del usuario
export interface UserSettings {
  id?: string;
  userId: string;
  // Tipo de trading
  tradingType: 'Futuros' | 'Forex' | 'CFDs';
  // Setups personalizados (hasta 10)
  customSetups: string[];
  // Fecha de creación/actualización
  updatedAt: Date;
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
