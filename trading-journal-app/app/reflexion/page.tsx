'use client';

import { useState, useEffect } from 'react';
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
      e.currentTarget.reset();
      
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
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500">
      <Navbar onLogout={logout} />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            📝 Reflexión Diaria
          </h1>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                name="fecha"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué hice bien?
              </label>
              <textarea
                name="queBien"
                rows={3}
                placeholder="Fortalezas de hoy..."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué puedo mejorar?
              </label>
              <textarea
                name="queMejorar"
                rows={3}
                placeholder="Áreas de mejora..."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Operé según mi plan o me dejé llevar por emociones?
              </label>
              <textarea
                name="segunPlan"
                rows={3}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Estoy orgulloso de mi disciplina hoy?
              </label>
              <textarea
                name="disciplina"
                rows={3}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoy fue un exitoso día de trading porque:
              </label>
              <textarea
                name="exitoso"
                rows={3}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Marcadores de éxito
              </label>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="tradeTP"
                    className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">Trade al TP</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="noSetup"
                    className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">No operé porque no se presentó el setup</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="perdidasControladas"
                    className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">Pérdidas controladas</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="breakeven"
                    className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">Breakeven</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="noRespetePlan"
                    className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-gray-700">No respeté el plan</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar Reflexión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
