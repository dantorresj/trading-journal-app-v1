'use client';

import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  show: boolean;
  onClose: () => void;
  limitType: 'trades' | 'reflexiones' | 'images' | 'insights';
  currentCount?: number;
  limit?: number;
}

export default function UpgradeModal({
  show,
  onClose,
  limitType,
  currentCount = 0,
  limit = 20
}: UpgradeModalProps) {
  const router = useRouter();
  
  if (!show) return null;
  
  const messages = {
    trades: {
      title: '📈 Límite de Trades Alcanzado',
      description: `Has registrado ${currentCount}/${limit} trades este mes con tu plan FREE.`,
      icon: '📊'
    },
    reflexiones: {
      title: '📝 Límite de Reflexiones Alcanzado',
      description: `Has escrito ${currentCount}/${limit} reflexiones este mes con tu plan FREE.`,
      icon: '💭'
    },
    images: {
      title: '📷 Imágenes No Disponibles',
      description: 'Subir imágenes de tus trades es una característica exclusiva de PRO.',
      icon: '🖼️'
    },
    insights: {
      title: '💎 Insights con IA Bloqueados',
      description: 'El análisis con Inteligencia Artificial es exclusivo para usuarios PRO.',
      icon: '🤖'
    }
  };
  
  const message = messages[limitType];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn">
        {/* Header con degradado */}
        <div className="bg-gradient-to-r from-gold-kint to-gold-dark p-6 text-white">
          <div className="text-5xl mb-3 text-center">{message.icon}</div>
          <h2 className="text-2xl font-heading font-bold text-center">
            {message.title}
          </h2>
        </div>
        
        {/* Contenido */}
        <div className="p-6">
          <p className="text-center text-text-gray font-body mb-6">
            {message.description}
          </p>
          
          {/* Beneficios de PRO */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-6 border border-silver">
            <h3 className="text-lg font-semibold text-carbon mb-4 font-heading text-center">
              💎 Upgrade a PRO y desbloquea:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <span className="text-growth-jade text-xl flex-shrink-0">✓</span>
                <span className="text-carbon font-body">
                  <strong>Trades ilimitados</strong> - Registra tantos trades como necesites
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-growth-jade text-xl flex-shrink-0">✓</span>
                <span className="text-carbon font-body">
                  <strong>Reflexiones ilimitadas</strong> - Escribe sin límites
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-growth-jade text-xl flex-shrink-0">✓</span>
                <span className="text-carbon font-body">
                  <strong>Análisis con IA</strong> - Insights técnicos y emocionales
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-growth-jade text-xl flex-shrink-0">✓</span>
                <span className="text-carbon font-body">
                  <strong>Subir imágenes</strong> - Guarda capturas de tus trades
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-growth-jade text-xl flex-shrink-0">✓</span>
                <span className="text-carbon font-body">
                  <strong>Soporte prioritario</strong> - Ayuda rápida cuando la necesites
                </span>
              </li>
            </ul>
          </div>
          
          {/* Precio */}
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-gold-kint font-mono mb-1">
              $19.99
              <span className="text-lg text-text-gray font-body">/mes</span>
            </p>
            <p className="text-sm text-text-gray font-body">
              Cancela cuando quieras
            </p>
          </div>
          
          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-carbon font-semibold py-3 rounded-lg transition-all duration-300 font-body"
            >
              Ahora no
            </button>
            <button
              onClick={() => {
                onClose();
                router.push('/upgrade');
              }}
              className="flex-1 bg-gold-kint hover:bg-gold-dark text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-gold hover:shadow-gold-lg font-body"
            >
              Upgrade a PRO
            </button>
          </div>
          
          <p className="text-xs text-center text-text-gray mt-4 font-body">
            💳 Pago seguro · ⚡ Activación instantánea · 🔒 Cancela cuando quieras
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scaleIn {
          from { 
            transform: scale(0.9);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
