'use client';

interface TechnicalAnalysisProps {
  insights: {
    mejorHorario: {
      sesion: string;
      horario: string;
      winRate: number;
      trades: number;
      explicacion: string;
    };
    setupOptimo: {
      nombre: string;
      winRate: number;
      pnlTotal: number;
      profitFactor: number;
      trades: number;
      explicacion: string;
    };
    patronDetectado: {
      titulo: string;
      descripcion: string;
      impacto: string;
      recomendacion: string;
    };
  };
}

export default function TechnicalAnalysis({ insights }: TechnicalAnalysisProps) {
  return (
    <div className="space-y-6">
      {/* Mejor Horario */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-silver">
        <div className="flex items-start space-x-4">
          <div className="text-5xl">⏰</div>
          <div className="flex-1">
            <h3 className="text-2xl font-heading font-bold text-carbon mb-2">
              Mejor Momento para Operar
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <p className="text-sm text-text-gray font-body mb-1">Sesión</p>
                <p className="text-3xl font-heading font-bold text-gold-kint">
                  {insights.mejorHorario.sesion}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-gray font-body mb-1">Horario</p>
                <p className="text-3xl font-heading font-bold text-gold-kint">
                  {insights.mejorHorario.horario}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-gray font-body mb-1">Win Rate</p>
                <p className="text-4xl font-mono font-bold text-growth-jade">
                  {insights.mejorHorario.winRate}%
                </p>
              </div>
              <div>
                <p className="text-sm text-text-gray font-body mb-1">Trades</p>
                <p className="text-4xl font-mono font-bold text-carbon">
                  {insights.mejorHorario.trades}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-gold-50 to-white rounded-lg border-l-4 border-gold-kint">
              <p className="text-carbon font-body">
                {insights.mejorHorario.explicacion}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Óptimo */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-silver">
        <div className="flex items-start space-x-4">
          <div className="text-5xl">🎯</div>
          <div className="flex-1">
            <h3 className="text-2xl font-heading font-bold text-carbon mb-2">
              Setup Más Rentable
            </h3>
            <div className="mt-4 mb-6">
              <p className="text-sm text-text-gray font-body mb-2">Tu mejor setup</p>
              <p className="text-4xl font-heading font-bold text-gold-kint mb-4">
                {insights.setupOptimo.nombre}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-text-gray font-body mb-1">Win Rate</p>
                <p className="text-3xl font-mono font-bold text-growth-jade">
                  {insights.setupOptimo.winRate}%
                </p>
              </div>
              <div>
                <p className="text-sm text-text-gray font-body mb-1">P&L Total</p>
                <p className="text-3xl font-mono font-bold text-gold-kint">
                  ${insights.setupOptimo.pnlTotal.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-gray font-body mb-1">Profit Factor</p>
                <p className="text-3xl font-mono font-bold text-carbon">
                  {insights.setupOptimo.profitFactor.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-growth-50 to-white rounded-lg border-l-4 border-growth-jade">
              <p className="text-carbon font-body">
                {insights.setupOptimo.explicacion}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Patrón Detectado */}
      <div className="bg-gradient-to-br from-gold-kint to-gold-dark rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start space-x-4">
          <div className="text-5xl">💎</div>
          <div className="flex-1">
            <h3 className="text-2xl font-heading font-bold mb-2">
              Patrón Detectado por IA
            </h3>
            <h4 className="text-3xl font-heading font-bold mb-4">
              {insights.patronDetectado.titulo}
            </h4>
            <p className="text-lg font-body mb-4 leading-relaxed">
              {insights.patronDetectado.descripcion}
            </p>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold mb-1">Impacto en tu Trading:</p>
              <p className="font-body">{insights.patronDetectado.impacto}</p>
            </div>
            <div className="bg-white bg-opacity-90 text-carbon rounded-lg p-4">
              <p className="text-sm font-semibold mb-1 text-gold-kint">✅ Recomendación:</p>
              <p className="font-body font-medium">{insights.patronDetectado.recomendacion}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
