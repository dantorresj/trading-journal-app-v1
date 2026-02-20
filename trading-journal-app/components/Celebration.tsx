'use client';

import { useEffect } from 'react';

interface CelebrationProps {
  show: boolean;
  xpGained?: number;
  levelUp?: boolean;
  newLevel?: { level: number; name: string };
  badgeUnlocked?: { id: string; name: string; icon: string };
  onClose: () => void;
}

export default function Celebration({
  show,
  xpGained = 0,
  levelUp = false,
  newLevel,
  badgeUnlocked,
  onClose
}: CelebrationProps) {
  
  useEffect(() => {
    if (show) {
      // Lanzar confetti
      launchConfetti();
      
      // Cerrar automáticamente después de 3 segundos
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);
  
  const launchConfetti = () => {
    // Crear partículas de confetti con CSS
    const colors = ['#D4AF37', '#3A3F46', '#10B981', '#F59E0B'];
    const confettiContainer = document.getElementById('confetti-container');
    
    if (!confettiContainer) return;
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confettiContainer.appendChild(confetti);
      
      // Eliminar después de la animación
      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }
  };
  
  if (!show) return null;
  
  return (
    <>
      {/* Contenedor de confetti */}
      <div id="confetti-container" className="fixed inset-0 pointer-events-none z-50" />
      
      {/* Modal de celebración */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center animate-scaleIn">
          {/* Icono de celebración */}
          <div className="text-6xl mb-4 animate-bounce">
            {levelUp ? '🎉' : badgeUnlocked ? '🏆' : '✨'}
          </div>
          
          {/* Mensaje principal */}
          {levelUp && newLevel ? (
            <>
              <h2 className="text-3xl font-heading font-bold text-carbon mb-2">
                ¡Subiste de Nivel!
              </h2>
              <div className="text-5xl font-bold text-gold-kint mb-2">
                Nivel {newLevel.level}
              </div>
              <p className="text-xl text-text-gray font-body mb-4">
                {newLevel.name}
              </p>
            </>
          ) : badgeUnlocked ? (
            <>
              <h2 className="text-3xl font-heading font-bold text-carbon mb-2">
                ¡Nuevo Logro!
              </h2>
              <div className="text-6xl mb-3">
                {badgeUnlocked.icon}
              </div>
              <p className="text-xl font-semibold text-gold-kint font-body mb-2">
                {badgeUnlocked.name}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-heading font-bold text-carbon mb-2">
                ¡Trade Registrado!
              </h2>
            </>
          )}
          
          {/* XP ganado */}
          {xpGained > 0 && (
            <div className="bg-gradient-to-r from-gold-50 to-gold-100 rounded-lg p-4 mb-4">
              <p className="text-2xl font-bold text-gold-kint font-mono">
                +{xpGained} XP
              </p>
            </div>
          )}
          
          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className="mt-4 bg-gold-kint hover:bg-gold-dark text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-gold hover:shadow-gold-lg font-body"
          >
            ¡Genial!
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            transform: scale(0.8);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
        
        :global(.confetti-piece) {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: confettiFall 3s linear forwards;
        }
      `}</style>
    </>
  );
}
