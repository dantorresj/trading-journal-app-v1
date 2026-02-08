'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Reflexion } from '@/types';
import Navbar from '@/components/Navbar';

export default function ReflexionPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData(e.currentTarget);

      const reflexionData: Omit<Reflexion, 'id'> = {
        userId: user.uid,
        fecha: formData.get('fecha') as string,
        queBien: formData.get('queBien') as string,
        queMejorar: formData.get('queMejorar') as string,
        segunPlan: formData.get('segunPlan') as string,
        disciplina: formData.get('disciplina') as string,
        exitoso: formData.get('exitoso') as string,
        tradeTP: formData.get('tradeTP') === 'on',
        noSetup: formData.get('noSetup') === 'on',
        perdidasControladas: formData.get('perdidasControladas') === 'on',
        breakeven: formData.get('breakeven') === 'on',
        noRespetePlan: formData.get('noRespetePlan') === 'on',
        createdAt: new Date()
      };

      await addDoc(collection(db, 'reflexiones'), reflexionData);

      setMessage('✅ Reflexión guardada exitosamente!');
      
      // Resetear formulario usando ref
      if (formRef.current) {
        formRef.current.reset();
      }
      
      setTimeout(() => {
        setMessage('');
      }, 3000);

    } catch (error: any) {
      console.error('Error:', error);
      setMessage('❌ Error al guardar reflexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver">
      <Navbar onLogout={logout} />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-silver">
          <h1 className="text-3xl font-heading font-bold text-carbon mb-2 text-center">
            📝 Reflexión Diaria
          </h1>
          <p className="text-text-gray text-center mb-6 font-body italic">
            "Las palabras revelan patrones que los números no pueden mostrar"
          </p>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('✅') 
                ? 'bg-growth-light text-growth-dark border border-growth-jade' 
                : 'bg-lesson-light text-lesson-red border border-lesson-red'
            }`}>
              {message}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-carbon mb-2 font-body">Fecha</label>
              <input
                type="date"
                name="fecha"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon mb-2 font-body">
                ¿Qué hice bien hoy?
              </label>
              <textarea
                name="queBien"
                rows={4}
                required
                placeholder="Describe tus aciertos y decisiones correctas..."
                className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon mb-2 font-body">
                ¿Qué puedo mejorar?
              </label>
              <textarea
                name="queMejorar"
                rows={4}
                required
                placeholder="Identifica áreas de mejora sin juzgarte..."
                className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon mb-2 font-body">
                ¿Operé según mi plan?
              </label>
              <textarea
                name="segunPlan"
                rows={3}
                required
                placeholder="Evalúa tu adherencia al plan de trading..."
                className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon mb-2 font-body">
                Nivel de disciplina (0-10)
              </label>
              <input
                type="text"
                name="disciplina"
                required
                placeholder="Ej: 8"
                className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon mb-2 font-body">
                ¿Qué hizo que hoy fuera exitoso o no?
              </label>
              <textarea
                name="exitoso"
                rows={3}
                required
                placeholder="Reflexiona sobre los factores clave del día..."
                className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon mb-3 font-body">
                Marcadores de Éxito
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-growth-light transition-colors">
                  <input
                    type="checkbox"
                    name="tradeTP"
                    className="w-5 h-5 text-gold-kint focus:ring-gold-kint rounded"
                  />
                  <span className="font-body text-carbon">✅ Llegué al TP en al menos un trade</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-growth-light transition-colors">
                  <input
                    type="checkbox"
                    name="noSetup"
                    className="w-5 h-5 text-gold-kint focus:ring-gold-kint rounded"
                  />
                  <span className="font-body text-carbon">✅ No operé trades sin setup</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-growth-light transition-colors">
                  <input
                    type="checkbox"
                    name="perdidasControladas"
                    className="w-5 h-5 text-gold-kint focus:ring-gold-kint rounded"
                  />
                  <span className="font-body text-carbon">✅ Pérdidas controladas según mi plan</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-growth-light transition-colors">
                  <input
                    type="checkbox"
                    name="breakeven"
                    className="w-5 h-5 text-gold-kint focus:ring-gold-kint rounded"
                  />
                  <span className="font-body text-carbon">✅ Moví a breakeven cuando correspondía</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-lesson-light transition-colors">
                  <input
                    type="checkbox"
                    name="noRespetePlan"
                    className="w-5 h-5 text-lesson-red focus:ring-lesson-red rounded"
                  />
                  <span className="font-body text-carbon">⚠️ No respeté mi plan de trading</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-kint hover:bg-gold-dark text-white font-semibold py-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-gold hover:shadow-gold-lg font-body"
            >
              {loading ? 'Guardando...' : '💾 Guardar Reflexión'}
            </button>
          </form>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-silver">
          <h3 className="text-lg font-heading font-bold text-carbon mb-3">💡 Consejo Kintsugi</h3>
          <p className="text-text-gray font-body leading-relaxed">
            Cada reflexión es un paso hacia el autoconocimiento. No juzgues tus errores,
            obsérvalos con curiosidad. Las grietas que documentes hoy serán el oro de tu
            maestría mañana.
          </p>
        </div>
      </div>
    </div>
  );
}
