import { UserProfile, LEVELS, BADGES, XP_REWARDS, Badge } from '@/types';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Obtener nivel actual del usuario basado en XP
 */
export const getUserLevel = (xp: number): { level: number; name: string; progress: number } => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    const levelData = LEVELS[i];
    if (xp >= levelData.minXP) {
      const progress = Math.min(
        100,
        ((xp - levelData.minXP) / (levelData.maxXP - levelData.minXP)) * 100
      );
      return {
        level: levelData.level,
        name: levelData.name,
        progress: Math.round(progress)
      };
    }
  }
  return { level: 1, name: 'Trader Novato', progress: 0 };
};

/**
 * Calcular XP necesario para siguiente nivel
 */
export const getXPForNextLevel = (currentXP: number): { current: number; needed: number; total: number } => {
  const currentLevel = getUserLevel(currentXP);
  const nextLevelData = LEVELS[currentLevel.level]; // El siguiente nivel
  
  if (!nextLevelData) {
    return { current: currentXP, needed: 0, total: currentXP };
  }
  
  return {
    current: currentXP - LEVELS[currentLevel.level - 1].minXP,
    needed: nextLevelData.maxXP - currentXP,
    total: nextLevelData.maxXP - LEVELS[currentLevel.level - 1].minXP
  };
};

/**
 * Agregar XP al usuario
 */
export const addXP = async (userId: string, xpAmount: number): Promise<{ 
  newXP: number; 
  levelUp: boolean; 
  newLevel?: { level: number; name: string } 
}> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error('Usuario no encontrado');
  }
  
  const userData = userSnap.data() as UserProfile;
  const oldXP = userData.xp || 0;
  const newXP = oldXP + xpAmount;
  
  const oldLevel = getUserLevel(oldXP);
  const newLevel = getUserLevel(newXP);
  
  const levelUp = newLevel.level > oldLevel.level;
  
  await updateDoc(userRef, {
    xp: newXP,
    level: newLevel.level
  });
  
  return {
    newXP,
    levelUp,
    newLevel: levelUp ? newLevel : undefined
  };
};

/**
 * Verificar si el usuario cumple requisito para un badge
 */
export const checkBadgeRequirement = async (
  userId: string, 
  badgeId: string,
  stats?: {
    totalTrades?: number;
    winningTrades?: number;
    reflexiones?: number;
    winRate?: number;
    streak?: number;
    tradesLast30Days?: number;
  }
): Promise<boolean> => {
  const badge = BADGES.find(b => b.id === badgeId);
  if (!badge) return false;
  
  switch (badgeId) {
    case 'first_win':
      return (stats?.winningTrades || 0) >= 1;
    
    case 'fire_streak':
      return (stats?.streak || 0) >= 5;
    
    case 'disciplined':
      return (stats?.reflexiones || 0) >= 30;
    
    case 'sniper':
      return (stats?.totalTrades || 0) >= 50 && (stats?.winRate || 0) > 70;
    
    case 'kintsugi_master':
      // Verificar que tenga 10 pérdidas con reflexión (esto requiere query adicional)
      return false; // Implementar lógica específica
    
    case 'speedster':
      return (stats?.tradesLast30Days || 0) >= 30;
    
    case 'zen_trader':
      // Verificar días sin violar plan (requiere tracking adicional)
      return false; // Implementar lógica específica
    
    case 'centurion':
      return (stats?.totalTrades || 0) >= 100;
    
    default:
      return false;
  }
};

/**
 * Otorgar badge al usuario
 */
export const awardBadge = async (userId: string, badgeId: string): Promise<boolean> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return false;
  
  const userData = userSnap.data() as UserProfile;
  const currentBadges = userData.badges || [];
  
  // Verificar si ya tiene el badge
  if (currentBadges.includes(badgeId)) return false;
  
  // Agregar badge
  await updateDoc(userRef, {
    badges: [...currentBadges, badgeId]
  });
  
  return true;
};

/**
 * Actualizar racha de días consecutivos
 */
export const updateStreak = async (userId: string, currentDate: string): Promise<number> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return 0;
  
  const userData = userSnap.data() as UserProfile;
  const lastTradeDate = userData.lastTradeDate;
  const currentStreak = userData.streak || 0;
  
  if (!lastTradeDate) {
    // Primera vez registrando
    await updateDoc(userRef, {
      streak: 1,
      lastTradeDate: currentDate
    });
    return 1;
  }
  
  // Calcular diferencia de días
  const lastDate = new Date(lastTradeDate);
  const today = new Date(currentDate);
  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  let newStreak = currentStreak;
  
  if (diffDays === 0) {
    // Mismo día, no cambiar streak
    return currentStreak;
  } else if (diffDays === 1) {
    // Día consecutivo, incrementar
    newStreak = currentStreak + 1;
  } else {
    // Rompió la racha, reiniciar
    newStreak = 1;
  }
  
  await updateDoc(userRef, {
    streak: newStreak,
    lastTradeDate: currentDate
  });
  
  return newStreak;
};

/**
 * Verificar si el usuario tiene acceso PRO
 */
export const hasProAccess = (user: UserProfile): boolean => {
  if (user.role === 'admin') return true;
  if (user.plan === 'lifetime') return true;
  if (user.plan === 'pro') return true;
  return false;
};

/**
 * Obtener badge por ID
 */
export const getBadgeById = (badgeId: string): Badge | undefined => {
  return BADGES.find(b => b.id === badgeId);
};

/**
 * Calcular trades registrados en los últimos N días
 */
export const getTradesInLastNDays = (trades: any[], days: number): number => {
  const now = new Date();
  const nDaysAgo = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  
  return trades.filter(trade => {
    const tradeDate = new Date(trade.fecha);
    return tradeDate >= nDaysAgo;
  }).length;
};

/**
 * Verificar límites del plan
 */
export const checkPlanLimit = async (
  userId: string,
  type: 'trades' | 'reflexiones'
): Promise<{ withinLimit: boolean; count: number; limit: number }> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { withinLimit: false, count: 0, limit: 0 };
    }
    
    const userData = userSnap.data() as UserProfile;
    
    // Si tiene acceso PRO, no hay límites
    if (hasProAccess(userData)) {
      return { withinLimit: true, count: 0, limit: Infinity };
    }
    
    // Calcular inicio del mes actual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Contar trades/reflexiones del mes actual
    const collectionName = type === 'trades' ? 'trades' : 'reflexiones';
    
    const q = query(
      collection(db, collectionName),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    
    // Filtrar por fecha en el cliente (para evitar necesidad de índice)
    const thisMonthDocs = snapshot.docs.filter((docSnap) => {
      const data = docSnap.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      return createdAt >= firstDayOfMonth;
    });
    
    const count = thisMonthDocs.length;
    const limit = 20;
    
    return {
      withinLimit: count < limit,
      count,
      limit
    };
  } catch (error) {
    console.error('Error checking plan limit:', error);
    // En caso de error, permitir la acción
    return { withinLimit: true, count: 0, limit: 20 };
  }
};