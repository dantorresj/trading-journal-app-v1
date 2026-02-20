'use client';

import { UserProfile } from '@/types';
import { getUserLevel, getXPForNextLevel, getBadgeById } from '@/lib/gamification';

interface UserProgressProps {
  user: UserProfile;
  compact?: boolean;
}

export default function UserProgress({ user, compact = false }: UserProgressProps) {
  const currentLevel = getUserLevel(user.xp || 0);
  const xpProgress = getXPForNextLevel(user.xp || 0);
  const progressPercent = (xpProgress.current / xpProgress.total) * 100;
  
  const userBadges = (user.badges || []).map(badgeId => getBadgeById(badgeId)).filter(Boolean);
  
  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="text-xs text-text-gray font-body">Nivel {currentLevel.level}</p>
            <p className="text-sm font-semibold text-carbon font-body">{currentLevel.name}</p>
          </div>
        </div>
        <div className="flex-1 max-w-xs">
          <div className="w-full bg-silver rounded-full h-2">
            <div 
              className="bg-gradient-gold h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-text-gray mt-1 font-mono">
            {xpProgress.current} / {xpProgress.total} XP
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-silver">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-heading font-bold text-carbon">
            Nivel {currentLevel.level}
          </h3>
          <p className="text-lg text-gold-kint font-semibold font-body">
            {currentLevel.name}
          </p>
        </div>
        <div className="text-5xl">⭐</div>
      </div>
      
      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-gray font-body">Progreso al siguiente nivel</span>
          <span className="text-sm font-semibold text-carbon font-mono">
            {xpProgress.current} / {xpProgress.total} XP
          </span>
        </div>
        <div className="w-full bg-silver rounded-full h-4 overflow-hidden">
          <div 
            className="bg-gradient-gold h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${Math.max(progressPercent, 5)}%` }}
          >
            <span className="text-xs text-white font-bold">{Math.round(progressPercent)}%</span>
          </div>
        </div>
        <p className="text-xs text-text-gray mt-1 font-body">
          Faltan {xpProgress.needed} XP para el siguiente nivel
        </p>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-gold-50 to-white rounded-lg p-3 border-l-4 border-gold-kint">
          <p className="text-xs text-text-gray font-body mb-1">Total XP</p>
          <p className="text-2xl font-bold text-gold-kint font-mono">{user.xp || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-growth-50 to-white rounded-lg p-3 border-l-4 border-growth-jade">
          <p className="text-xs text-text-gray font-body mb-1">Racha</p>
          <p className="text-2xl font-bold text-growth-jade font-mono">
            {user.streak || 0} 🔥
          </p>
        </div>
      </div>
      
      {/* Badges */}
      <div>
        <h4 className="text-sm font-semibold text-carbon mb-3 font-body">
          Logros Desbloqueados ({userBadges.length})
        </h4>
        {userBadges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {userBadges.map((badge) => (
              <div
                key={badge?.id}
                className="group relative bg-gradient-to-br from-gold-50 to-white border-2 border-gold-kint rounded-lg p-3 hover:shadow-gold transition-all duration-300 cursor-pointer"
                title={badge?.description}
              >
                <div className="text-3xl">{badge?.icon}</div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-carbon text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10">
                  <p className="font-semibold">{badge?.name}</p>
                  <p className="text-gray-300">{badge?.description}</p>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-carbon"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-gray italic font-body">
            Aún no has desbloqueado ningún logro. ¡Sigue registrando trades!
          </p>
        )}
      </div>
      
      {/* Plan del usuario */}
      <div className="mt-6 pt-6 border-t border-silver">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-gray font-body">Plan Actual</p>
            <p className="text-lg font-bold font-body">
              {user.plan === 'free' && '🆓 Free'}
              {user.plan === 'pro' && '💎 Pro'}
              {user.plan === 'lifetime' && '👑 Lifetime'}
            </p>
          </div>
          {user.plan === 'free' && (
            <button className="bg-gold-kint hover:bg-gold-dark text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm font-body">
              Upgrade a Pro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
