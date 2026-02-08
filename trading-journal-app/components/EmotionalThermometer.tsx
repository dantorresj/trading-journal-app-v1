'use client';

interface EmotionalThermometerProps {
  insights: {
    estadoEmocional: {
      nivel: string;
      temperatura: number;
      explicacion: string;
    };
  };
}

export default function EmotionalThermometer({ insights }: EmotionalThermometerProps) {
  const { nivel, temperatura, explicacion } = insights.estadoEmocional;

  // Determinar color y mensaje según temperatura
  const getColorAndMessage = () => {
    if (temperatura <= 30) {
      return {
        color: 'from-lesson-red to-red-400',
        bgColor: 'bg-lesson-light',
        textColor: 'text-lesson-red',
        icon: '😰',
        label: 'Zona de Alerta',
        description: 'Detectamos estrés o miedo'
      };
    } else if (temperatura <= 60) {
      return {
        color: 'from-growth-jade to-green-400',
        bgColor: 'bg-growth-light',
        textColor: 'text-growth-jade',
        icon: '😌',
        label: 'Zona de Equilibrio',
        description: 'Estado mental óptimo'
      };
    } else {
      return {
        color: 'from-yellow-400 to-orange-400',
        bgColor: 'bg-yellow-50',
        textColor: 'text-orange-600',
        icon: '😎',
        label: 'Zona de Confianza Alta',
        description: 'Cuidado con el exceso de confianza'
      };
    }
  };

  const colorData = getColorAndMessage();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-silver mb-6">
      <div className="text-center mb-6">
        <div className="text-6xl mb-3">{colorData.icon}</div>
        <h3 className="text-2xl font-heading font-bold text-carbon mb-1">
          Termómetro Emocional
        </h3>
        <p className="text-text-gray font-body">Estado actual: <strong className={colorData.textColor}>{nivel}</strong></p>
      </div>

      {/* Termómetro visual */}
      <div className="relative w-full max-w-2xl mx-auto mb-8">
        {/* Background del termómetro */}
        <div className="h-12 bg-gray-200 rounded-full overflow-hidden relative">
          {/* Gradiente de temperatura */}
          <div className="absolute inset-0 flex">
            <div className="w-1/3 bg-gradient-to-r from-red-500 to-red-400"></div>
            <div className="w-1/3 bg-gradient-to-r from-green-400 to-green-500"></div>
            <div className="w-1/3 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
          </div>
          
          {/* Indicador de posición */}
          <div 
            className="absolute top-0 bottom-0 w-2 bg-white border-4 border-carbon shadow-lg transition-all duration-500"
            style={{ left: `calc(${temperatura}% - 4px)` }}
          ></div>
        </div>

        {/* Labels del termómetro */}
        <div className="flex justify-between mt-3 text-sm font-body font-semibold">
          <span className="text-lesson-red">Miedo/Estrés</span>
          <span className="text-growth-jade">Equilibrio</span>
          <span className="text-orange-600">Sobreconfianza</span>
        </div>
      </div>

      {/* Medidor numérico */}
      <div className="text-center mb-6">
        <div className="inline-block">
          <p className="text-sm text-text-gray font-body mb-2">Nivel detectado</p>
          <p className={`text-7xl font-mono font-bold ${colorData.textColor}`}>
            {temperatura}
          </p>
          <p className="text-sm text-text-gray font-body mt-1">de 100</p>
        </div>
      </div>

      {/* Zona de estado */}
      <div className={`${colorData.bgColor} rounded-xl p-6 border-l-4 ${colorData.textColor.replace('text-', 'border-')}`}>
        <h4 className={`text-xl font-heading font-bold ${colorData.textColor} mb-2`}>
          {colorData.label}
        </h4>
        <p className="text-carbon font-body mb-3">
          {colorData.description}
        </p>
        <p className="text-carbon font-body leading-relaxed">
          {explicacion}
        </p>
      </div>
    </div>
  );
}
