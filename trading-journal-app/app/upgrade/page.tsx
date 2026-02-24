'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types';
import Navbar from '@/components/Navbar';
import PricingCard from '@/components/PricingCard';

export default function UpgradePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadUserProfile();
  }, [user, router]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user || !userProfile) return;

    if (userProfile.plan === 'pro' || userProfile.plan === 'lifetime' || userProfile.role === 'admin') {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const { url, error } = await response.json();

      if (error) throw new Error(error);
      if (!url) throw new Error('No se recibió URL de pago');

      // ✅ Método nuevo
      window.location.href = url;

    } catch (error: any) {
      console.error('Error:', error);
      alert('Error al procesar el pago: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver flex items-center justify-center">
        <div className="text-carbon text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-kint mx-auto mb-4"></div>
          <p className="text-xl font-heading">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver">
      <Navbar onLogout={logout} />

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-heading font-bold text-carbon mb-4">
            Upgrade a Pro
          </h1>
          <p className="text-xl text-text-gray font-body max-w-2xl mx-auto">
            Desbloquea todo el potencial de KintEdge y convierte tus pérdidas en oro
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <PricingCard
            plan="free"
            currentPlan={userProfile.plan}
          />
          <PricingCard
            plan="pro"
            currentPlan={userProfile.plan}
            onUpgrade={handleUpgrade}
          />
        </div>

        {/* Processing Overlay */}
        {processing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-kint mx-auto mb-4"></div>
              <p className="text-xl font-heading text-carbon">Redirigiendo a pago seguro...</p>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-carbon text-center mb-8">
            ¿Por qué elegir Pro?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-silver">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-heading font-semibold text-carbon mb-2">Análisis con IA</h3>
              <p className="text-text-gray font-body text-sm">
                Insights técnicos y emocionales personalizados para mejorar tu trading
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-silver">
              <div className="text-5xl mb-4">∞</div>
              <h3 className="text-xl font-heading font-semibold text-carbon mb-2">Sin Límites</h3>
              <p className="text-text-gray font-body text-sm">
                Trades y reflexiones ilimitados. Registra todo sin preocuparte.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-silver">
              <div className="text-5xl mb-4">📸</div>
              <h3 className="text-xl font-heading font-semibold text-carbon mb-2">Imágenes</h3>
              <p className="text-text-gray font-body text-sm">
                Guarda capturas de pantalla de tus setups y analízalos visualmente
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-heading font-bold text-carbon text-center mb-8">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-silver">
              <h3 className="font-heading font-semibold text-carbon mb-2">¿Puedo cancelar cuando quiera?</h3>
              <p className="text-text-gray font-body text-sm">
                Sí, puedes cancelar tu suscripción en cualquier momento desde tu perfil.
                No hay compromisos ni cargos ocultos.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-silver">
              <h3 className="font-heading font-semibold text-carbon mb-2">¿Qué métodos de pago aceptan?</h3>
              <p className="text-text-gray font-body text-sm">
                Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard,
                American Express) a través de Stripe, nuestro procesador de pagos seguro.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-silver">
              <h3 className="font-heading font-semibold text-carbon mb-2">¿Se renovará automáticamente?</h3>
              <p className="text-text-gray font-body text-sm">
                Sí, tu suscripción se renueva automáticamente cada mes.
                Puedes cancelarla en cualquier momento antes de la próxima fecha de renovación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}