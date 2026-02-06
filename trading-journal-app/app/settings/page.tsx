'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserSettings } from '@/types';
import Navbar from '@/components/Navbar';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [tradingType, setTradingType] = useState<'Futuros' | 'Forex' | 'CFDs'>('Futuros');
  const [customSetups, setCustomSetups] = useState<string[]>(['Balance', 'Imbalance alcista', 'Imbalance bajista']);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadSettings();
  }, [user, router]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const settingsDoc = await getDoc(doc(db, 'userSettings', user.uid));
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data() as UserSettings;
        setTradingType(data.tradingType);
        setCustomSetups(data.customSetups);
      } else {
        // Configuración por defecto
        const defaultSetups = [
          'Balance',
          'Imbalance alcista',
          'Imbalance bajista',
          'Segundo golpe',
          'Medias móviles',
          'Trend Flow',
          'Trend Hunter',
          'Returns',
          'Liquidity Kill Zone',
          'Otro'
        ];
        setCustomSetups(defaultSetups);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      // Filtrar setups vacíos
      const filteredSetups = customSetups.filter(s => s.trim() !== '');

      if (filteredSetups.length === 0) {
        setMessage('❌ Debes tener al menos 1 setup configurado');
        setSaving(false);
        return;
      }

      const settings: UserSettings = {
        userId: user.uid,
        tradingType,
        customSetups: filteredSetups,
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'userSettings', user.uid), settings);

      setMessage('✅ Configuración guardada exitosamente!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error:', error);
      setMessage('❌ Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSetupChange = (index: number, value: string) => {
    const newSetups = [...customSetups];
    newSetups[index] = value;
    setCustomSetups(newSetups);
  };

  const addSetup = () => {
    if (customSetups.length < 10) {
      setCustomSetups([...customSetups, '']);
    }
  };

  const removeSetup = (index: number) => {
    const newSetups = customSetups.filter((_, i) => i !== index);
    setCustomSetups(newSetups);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500">
      <Navbar onLogout={logout} />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">⚙️ Configuración</h1>
          <p className="text-gray-600 mb-6">Personaliza tu experiencia de trading</p>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-8">
            {/* Tipo de Trading */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                📊 Tipo de Trading
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Selecciona el tipo de instrumentos que operas. Esto ajustará los campos del formulario.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setTradingType('Futuros')}
                  className={`p-4 rounded-lg border-2 font-semibold transition duration-200 ${
                    tradingType === 'Futuros'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  🔮 Futuros
                  {tradingType === 'Futuros' && (
                    <div className="text-xs mt-2 text-gray-600">Contratos • Puntos</div>
                  )}
                </button>

                <button
                  onClick={() => setTradingType('Forex')}
                  className={`p-4 rounded-lg border-2 font-semibold transition duration-200 ${
                    tradingType === 'Forex'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  💱 Forex
                  {tradingType === 'Forex' && (
                    <div className="text-xs mt-2 text-gray-600">Lotes • Pips</div>
                  )}
                </button>

                <button
                  onClick={() => setTradingType('CFDs')}
                  className={`p-4 rounded-lg border-2 font-semibold transition duration-200 ${
                    tradingType === 'CFDs'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  📈 CFDs
                  {tradingType === 'CFDs' && (
                    <div className="text-xs mt-2 text-gray-600">Lotes • Ticks</div>
                  )}
                </button>
              </div>
              
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Seleccionaste: {tradingType}</strong>
                  <br />
                  {tradingType === 'Futuros' && '→ En el formulario verás: "Contratos" y "Puntos"'}
                  {tradingType === 'Forex' && '→ En el formulario verás: "Lotes" y "Pips"'}
                  {tradingType === 'CFDs' && '→ En el formulario verás: "Lotes" y "Ticks"'}
                </p>
              </div>
            </div>

            {/* Setups Personalizados */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                🎯 Tus Setups Personalizados
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Define hasta 10 setups que usas en tu trading. Estos aparecerán en el formulario de registro.
              </p>

              <div className="space-y-3">
                {customSetups.map((setup, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-gray-500 font-semibold w-8">{index + 1}.</span>
                    <input
                      type="text"
                      value={setup}
                      onChange={(e) => handleSetupChange(index, e.target.value)}
                      placeholder={`Setup ${index + 1}`}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      maxLength={50}
                    />
                    {customSetups.length > 1 && (
                      <button
                        onClick={() => removeSetup(index)}
                        className="px-3 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition duration-200"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {customSetups.length < 10 && (
                <button
                  onClick={addSetup}
                  className="mt-4 w-full px-4 py-3 border-2 border-dashed border-gray-300 hover:border-primary-500 text-gray-600 hover:text-primary-600 rounded-lg font-semibold transition duration-200"
                >
                  + Agregar Setup ({customSetups.length}/10)
                </button>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-4 pt-6 border-t">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-4 rounded-lg transition duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : '💾 Guardar Configuración'}
              </button>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">💡 Información</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Los cambios se aplicarán inmediatamente en todos los formularios</p>
            <p>• Tus trades anteriores no se modificarán</p>
            <p>• Puedes actualizar tu configuración en cualquier momento</p>
            <p>• Los setups vacíos se eliminarán automáticamente al guardar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
