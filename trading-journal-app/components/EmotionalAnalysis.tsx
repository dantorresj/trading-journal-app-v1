'use client';

interface EmotionalAnalysisProps {
  insights: {
    patronEmocional: {
      palabrasClave: string[];
      frecuencia: string;
      impactoResultados: string;
      explicacion: string;
    };
    insightDiaActual: {
      tono: string;
      observacion: string;
      relacionConResultado: string;
    };
    tendenciaUltimos10Dias: {
      evolucion: string;
      detalles: string;
      alertas: string[];
    };
    recomendaciones: {
      inmediatas: string[];
      mediano: string[];
      frasesMotivacionales: string[];
    };
  };
}

export default function EmotionalAnalysis({ insights }: EmotionalAnalysisProps) {
  const getTrendIcon = (evolucion: string) => {
    if (evolucion === 'mejorando') return '📈';
    if (evolucion === 'deteriorando') return '📉';
    return '➡️';
  };

  const getTrendColor = (evolucion: string) => {
    if (evolucion === 'mejorando') return 'text-growth-jade';
    if (evolucion === 'deteriorando') return 'text-lesson-red';
    return 'text-text-gray';
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Patrón Emocional */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-silver">
        <div className="flex items-start space-x-4">
          <div className="text-5xl">🔍</div>
          <div className="flex-1">
            <h3 className="text-2xl font-heading font-bold text-carbon mb-4">
              Patrón Emocional Detectado
            </h3>
            
            {/* Palabras clave */}
            <div className="mb-4">
              <p className="text-sm text-text-gray font-body mb-2">Palabras frecuentes en tus reflexiones:</p>
              <div className="flex flex-wrap gap-2">
                {insights.patronEmocional.palabrasClave.map((palabra, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-gold-50 text-gold-kint font-semibold rounded-full border border-gold-kint"
                  >
                    {palabra}
                  </span>
                ))}
              </div>
              <p className="text-sm text-text-gray font-body mt-2">
                Frecuencia: <strong>{insights.patronEmocional.frecuencia}</strong>
              </p>
            </div>

            {/* Impacto */}
            <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-4 border-l-4 border-blue-500 mb-4">
              <p className="text-sm font-semibold text-blue-600 mb-1">Impacto en Resultados:</p>
              <p className="text-carbon font-body">{insights.patronEmocional.impactoResultados}</p>
            </div>

            {/* Explicación */}
            <p className="text-carbon font-body leading-relaxed">
              {insights.patronEmocional.explicacion}
            </p>
          </div>
        </div>
      </div>

      {/* Insight del día actual */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-silver">
        <div className="flex items-start space-x-4">
          <div className="text-5xl">📝</div>
          <div className="flex-1">
            <h3 className="text-2xl font-heading font-bold text-carbon mb-2">
              Análisis de Tu Última Reflexión
            </h3>
            <div className="mt-4">
              <p className="text-sm text-text-gray font-body mb-2">
                Tono detectado: <span className={`font-bold ${
                  insights.insightDiaActual.tono === 'positivo' ? 'text-growth-jade' :
                  insights.insightDiaActual.tono === 'negativo' ? 'text-lesson-red' :
                  'text-text-gray'
                }`}>
                  {insights.insightDiaActual.tono}
                </span>
              </p>
              <div className="bg-gradient-to-r from-silver to-white rounded-lg p-4 border-l-4 border-carbon mb-3">
                <p className="text-carbon font-body">{insights.insightDiaActual.observacion}</p>
              </div>
              <p className="text-sm text-text-gray font-body">
                {insights.insightDiaActual.relacionConResultado}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tendencia últimos 10 días */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-silver">
        <div className="flex items-start space-x-4">
          <div className="text-5xl">{getTrendIcon(insights.tendenciaUltimos10Dias.evolucion)}</div>
          <div className="flex-1">
            <h3 className="text-2xl font-heading font-bold text-carbon mb-2">
              Tendencia Últimos 10 Días
            </h3>
            <p className="mb-2">
              Estado: <span className={`text-xl font-bold ${getTrendColor(insights.tendenciaUltimos10Dias.evolucion)}`}>
                {insights.tendenciaUltimos10Dias.evolucion}
              </span>
            </p>
            <p className="text-carbon font-body leading-relaxed mb-4">
              {insights.tendenciaUltimos10Dias.detalles}
            </p>
            
            {/* Alertas si existen */}
            {insights.tendenciaUltimos10Dias.alertas.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-700 mb-2">⚠️ Alertas:</p>
                <ul className="space-y-1">
                  {insights.tendenciaUltimos10Dias.alertas.map((alerta, index) => (
                    <li key={index} className="text-carbon font-body">• {alerta}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-gradient-to-br from-growth-jade to-growth-dark rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start space-x-4 mb-6">
          <div className="text-5xl">💡</div>
          <div>
            <h3 className="text-3xl font-heading font-bold mb-2">
              Recomendaciones Personalizadas
            </h3>
            <p className="text-lg font-body opacity-90">
              Basadas en tu estado emocional actual
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Acciones inmediatas */}
          <div>
            <h4 className="text-xl font-heading font-bold mb-3 flex items-center space-x-2">
              <span>⚡</span>
              <span>Acciones Inmediatas</span>
            </h4>
            <ul className="space-y-2">
              {insights.recomendaciones.inmediatas.map((rec, index) => (
                <li key={index} className="bg-white bg-opacity-20 rounded-lg p-3 font-body">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Acciones mediano plazo */}
          <div>
            <h4 className="text-xl font-heading font-bold mb-3 flex items-center space-x-2">
              <span>🎯</span>
              <span>Para los Próximos Días</span>
            </h4>
            <ul className="space-y-2">
              {insights.recomendaciones.mediano.map((rec, index) => (
                <li key={index} className="bg-white bg-opacity-20 rounded-lg p-3 font-body">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Frases motivacionales */}
        <div className="mt-8 pt-6 border-t border-white border-opacity-30">
          <h4 className="text-xl font-heading font-bold mb-4 text-center">
            ✨ Frases para Mantener en Mente
          </h4>
          <div className="space-y-3">
            {insights.recomendaciones.frasesMotivacionales.map((frase, index) => (
              <div key={index} className="bg-white text-carbon rounded-lg p-4 text-center">
                <p className="font-body text-lg italic">"{frase}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
