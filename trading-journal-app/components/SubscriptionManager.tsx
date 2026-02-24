'use client';

import { useState } from 'react';
import { UserProfile } from '@/types';
import { hasProAccess } from '@/lib/gamification';

interface SubscriptionManagerProps {
  user: UserProfile;
}

export default function SubscriptionManager({ user }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Redirigir al portal de Stripe
      window.location.href = url;
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error al abrir el portal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isPro = hasProAccess(user);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-silver">
      <h3 className="text-xl font-heading font-semibold text-carbon mb-4">
        Suscripción
      </h3>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-text-gray font-body mb-1">Plan Actual</p>
          <p className="text-2xl font-bold font-body">
            {user.plan === 'free' && '🆓 Free'}
            {user.plan === 'pro' && '💎 Pro'}
            {user.plan === 'lifetime' && '👑 Lifetime'}
          </p>
        </div>

        {user.plan === 'pro' && (
          <div className="text-right">
            <p className="text-sm text-text-gray font-body mb-1">Precio</p>
            <p className="text-2xl font-bold text-gold-kint font-mono">
              $19.99/mes
            </p>
          </div>
        )}
      </div>

      {/* Descripción del plan */}
      <div className="mb-6">
        {user.plan === 'free' && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-text-gray font-body mb-2">
              Plan gratuito con límites:
            </p>
            <ul className="text-sm text-text-gray font-body space-y-1">
              <li>• 20 trades por mes</li>
              <li>• 20 reflexiones por mes</li>
              <li>• Sin imágenes ni Insights IA</li>
            </ul>
          </div>
        )}

        {user.plan === 'pro' && (
          <div className="bg-gold-50 rounded-lg p-4 border border-gold-200">
            <p className="text-sm text-carbon font-body">
              ✅ Acceso completo a todas las funciones PRO
            </p>
          </div>
        )}

        {user.plan === 'lifetime' && (
          <div className="bg-gradient-to-r from-gold-50 to-white rounded-lg p-4 border border-gold-kint">
            <p className="text-sm text-carbon font-body">
              👑 Acceso PRO de por vida - Gracias por ser un miembro fundador
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="space-y-3">
        {user.plan === 'free' && (
          <button
            onClick={() => window.location.href = '/upgrade'}
            className="w-full bg-gold-kint hover:bg-gold-dark text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-gold hover:shadow-gold-lg font-body"
          >
            Upgrade a Pro
          </button>
        )}

        {user.plan === 'pro' && (
          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="w-full bg-gray-200 hover:bg-gray-300 text-carbon font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 font-body"
          >
            {loading ? 'Cargando...' : 'Gestionar Suscripción'}
          </button>
        )}

        {user.plan === 'lifetime' && (
          <div className="text-center">
            <p className="text-sm text-text-gray font-body">
              Tu acceso es permanente, no requiere gestión
            </p>
          </div>
        )}
      </div>

      {user.plan === 'pro' && (
        <p className="text-xs text-center text-text-gray mt-4 font-body">
          Puedes actualizar tu método de pago o cancelar tu suscripción en cualquier momento
        </p>
      )}
    </div>
  );
}
