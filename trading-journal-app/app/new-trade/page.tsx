'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Trade, UserSettings } from '@/types';
import Navbar from '@/components/Navbar';
import { doc, getDoc } from 'firebase/firestore';

export default function NewTrade() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // Configuraciones del usuario
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      loadUserSettings();
    }
  }, [user, router]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      const settingsDoc = await getDoc(doc(db, 'userSettings', user.uid));
      
      if (settingsDoc.exists()) {
        setUserSettings(settingsDoc.data() as UserSettings);
      } else {
        // Configuración por defecto si no existe
        const defaultSettings: UserSettings = {
          userId: user.uid,
          tradingType: 'Futuros',
          customSetups: [
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
          ],
          updatedAt: new Date()
        };
        setUserSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData(e.currentTarget);
      
      let imageUrl = '';
      if (imageFile) {
        const imageRef = ref(storage, `trades/${user.uid}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const tradeData: Omit<Trade, 'id'> = {
        userId: user.uid,
        fecha: formData.get('fecha') as string,
        activo: formData.get('activo') as string,
        horario: formData.get('horario') as string,
        setup: formData.get('setup') as string,
        tendencia: formData.get('tendencia') as string,
        temporalidad: formData.get('temporalidad') as string,
        contratos: parseInt(formData.get('contratos') as string) || 1,
        direccion: formData.get('direccion') as 'compra' | 'venta',
        puntos: parseInt(formData.get('puntos') as string) || 0,
        hora_entrada: formData.get('hora_entrada') as string,
        hora_salida: formData.get('hora_salida') as string,
        resultado: formData.get('resultado') as 'Won' | 'Lose' | 'BE',
        resultado_especifico: formData.get('resultado_especifico') as string,
        ganancia_perdida: parseFloat(formData.get('ganancia_perdida') as string) || 0,
        comentarios: formData.get('comentarios') as string || '',
        imagen: imageUrl,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'trades'), tradeData);

      setMessage('✅ Trade registrado exitosamente!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('Error:', error);
      setMessage('❌ Error al registrar trade: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  const tradingType = userSettings?.tradingType || 'Futuros';
  const customSetups = userSettings?.customSetups || [];
  
  // Labels dinámicos según el tipo de trading
  const contractsLabel = tradingType === 'Futuros' ? 'Contratos' : 'Lotes';
  const pointsLabel = tradingType === 'Futuros' ? 'Puntos' : (tradingType === 'Forex' ? 'Pips' : 'Ticks');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500">
      <Navbar onLogout={logout} />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            📊 Registrar Nuevo Trade
          </h1>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activo</label>
                <select
                  name="activo"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option>Nasdaq</option>
                  <option>Gold</option>
                  <option>S&P500</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horario</label>
                <select
                  name="horario"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option>Nueva York</option>
                  <option>Londres</option>
                  <option>Asia</option>
                  <option>Sídney</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Setup</label>
              <select
                name="setup"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {customSetups.length > 0 ? (
                  customSetups.map((setup, index) => (
                    <option key={index}>{setup}</option>
                  ))
                ) : (
                  <>
                    <option>Balance</option>
                    <option>Imbalance alcista</option>
                    <option>Imbalance bajista</option>
                    <option>Otro</option>
                  </>
                )}
              </select>
              {customSetups.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Configura tus setups en <a href="/settings" className="underline">Configuración</a>
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tendencia</label>
                <select
                  name="tendencia"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option>Corrección</option>
                  <option>Continuación de tendencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temporalidad</label>
                <select
                  name="temporalidad"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option>1 minuto</option>
                  <option>3 minutos</option>
                  <option>5 minutos</option>
                  <option>15 minutos</option>
                  <option>30 minutos</option>
                  <option>1 hora</option>
                  <option>4 horas</option>
                  <option>1 día</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{contractsLabel}</label>
              <input
                type="number"
                name="contratos"
                min="1"
                step={tradingType === 'Futuros' ? '1' : '0.01'}
                defaultValue="1"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <select
                  name="direccion"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option>compra</option>
                  <option>venta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{pointsLabel}</label>
                <input
                  type="number"
                  name="puntos"
                  placeholder={`Ej: ${tradingType === 'Futuros' ? '58' : (tradingType === 'Forex' ? '25' : '10')}`}
                  step={tradingType === 'Forex' ? '0.0001' : '1'}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora Entrada</label>
                <input
                  type="time"
                  name="hora_entrada"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora Salida</label>
                <input
                  type="time"
                  name="hora_salida"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resultado</label>
                <select
                  name="resultado"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option>Won</option>
                  <option>Lose</option>
                  <option>BE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resultado Específico</label>
                <select
                  name="resultado_especifico"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option>W</option>
                  <option>L</option>
                  <option>BE</option>
                  <option>TP1</option>
                  <option>TP2</option>
                  <option>TP3</option>
                  <option>Parciales</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ganancia/Pérdida ($)</label>
              <input
                type="number"
                name="ganancia_perdida"
                step="0.01"
                placeholder="Ej: 580 o -206"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comentarios</label>
              <textarea
                name="comentarios"
                rows={3}
                placeholder="Detalles del trade..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Trade</label>
              <div 
                onClick={() => document.getElementById('imageInput')?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition"
              >
                <div className="text-4xl mb-2">📸</div>
                <div className="text-sm text-gray-600">Toca para subir imagen</div>
                <div className="text-xs text-gray-500 mt-1">PNG o JPG</div>
              </div>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview && (
                <div className="mt-4 relative">
                  <img src={imagePreview} alt="Preview" className="w-full rounded-lg" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Registrar Trade'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
