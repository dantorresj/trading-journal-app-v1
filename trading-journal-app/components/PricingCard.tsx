'use client';

interface PricingCardProps {
  plan: 'free' | 'pro';
  currentPlan?: 'free' | 'pro' | 'lifetime';
  onUpgrade?: () => void;
}

export default function PricingCard({ plan, currentPlan = 'free', onUpgrade }: PricingCardProps) {
  
  const plans = {
    free: {
      name: 'Free',
      price: '$0',
      period: 'Gratis para siempre',
      features: [
        { text: 'Hasta 20 trades/mes', included: true },
        { text: 'Hasta 20 reflexiones/mes', included: true },
        { text: 'Dashboard básico', included: true },
        { text: 'Trading Plan', included: true },
        { text: 'Gamificación (XP, niveles, badges)', included: true },
        { text: 'Subir imágenes', included: false },
        { text: 'Insights con IA', included: false },
        { text: 'Trades ilimitados', included: false },
        { text: 'Soporte prioritario', included: false },
      ],
      cta: 'Plan Actual',
      popular: false
    },
    pro: {
      name: 'Pro',
      price: '$19.99',
      period: 'por mes',
      features: [
        { text: 'Trades ILIMITADOS', included: true },
        { text: 'Reflexiones ILIMITADAS', included: true },
        { text: 'Subir imágenes de trades', included: true },
        { text: 'Insights con IA (análisis técnico)', included: true },
        { text: 'Insights con IA (análisis emocional)', included: true },
        { text: 'Dashboard completo', included: true },
        { text: 'Trading Plan avanzado', included: true },
        { text: 'Gamificación (XP, niveles, badges)', included: true },
        { text: 'Soporte prioritario', included: true },
      ],
      cta: currentPlan === 'pro' || currentPlan === 'lifetime' ? 'Plan Actual' : 'Upgrade a Pro',
      popular: true
    }
  };
  
  const planData = plans[plan];
  const isCurrentPlan = (plan === 'free' && currentPlan === 'free') || 
                        (plan === 'pro' && (currentPlan === 'pro' || currentPlan === 'lifetime'));
  
  return (
    <div className={`
      relative bg-white rounded-2xl shadow-xl p-8 border-2 transition-all duration-300
      ${planData.popular ? 'border-gold-kint shadow-gold-lg' : 'border-silver'}
      ${isCurrentPlan ? 'opacity-75' : 'hover:shadow-2xl'}
    `}>
      {/* Badge "Popular" */}
      {planData.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gold-kint text-white px-4 py-1 rounded-full text-sm font-semibold font-body shadow-lg">
            ⭐ Más Popular
          </span>
        </div>
      )}
      
      {/* Nombre del plan */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-heading font-bold text-carbon mb-2">
          {planData.name}
        </h3>
        <div className="flex items-baseline justify-center space-x-2">
          <span className="text-5xl font-mono font-bold text-carbon">
            {planData.price}
          </span>
          <span className="text-text-gray font-body">
            {planData.period}
          </span>
        </div>
      </div>
      
      {/* Features */}
      <ul className="space-y-3 mb-8">
        {planData.features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-3">
            <span className={`text-xl flex-shrink-0 ${
              feature.included ? 'text-growth-jade' : 'text-text-gray opacity-40'
            }`}>
              {feature.included ? '✓' : '×'}
            </span>
            <span className={`font-body text-sm ${
              feature.included ? 'text-carbon' : 'text-text-gray line-through'
            }`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      
      {/* CTA Button */}
      <button
        onClick={onUpgrade}
        disabled={isCurrentPlan}
        className={`
          w-full py-4 rounded-lg font-semibold font-body transition-all duration-300
          ${planData.popular && !isCurrentPlan
            ? 'bg-gold-kint hover:bg-gold-dark text-white shadow-gold hover:shadow-gold-lg'
            : 'bg-gray-200 text-text-gray cursor-not-allowed'
          }
        `}
      >
        {isCurrentPlan && currentPlan === 'lifetime' ? '👑 Plan Lifetime' : planData.cta}
      </button>
      
      {plan === 'pro' && !isCurrentPlan && (
        <p className="text-xs text-center text-text-gray mt-4 font-body">
          💳 Pago seguro · ⚡ Activación instantánea · 🔒 Cancela cuando quieras
        </p>
      )}
    </div>
  );
}
