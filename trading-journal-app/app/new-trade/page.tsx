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

// Listas de activos por tipo de mercado
const ACTIVOS_POR_MERCADO = {
  Futuros: [
    'E-mini S&P 500 Futures (ES)',
    'E-mini S&P 500 ESG Index Futures',
    'E-mini NASDAQ-100 Futures (NQ)',
    'Micro E-mini S&P 500 Index Futures (MES)',
    'Micro E-mini NASDAQ-100 Index Futures (MNQ)',
    'E-mini Russell 2000 Index Futures (RTY)',
    'Micro E-mini Russell 2000 Index Futures (M2K)',
    'Gold Futures (GC)',
    'E-mini Gold Futures (QO)',
    'Micro Gold Futures (MGC)',
    'Gold 1-Ounce Futures (M10)',
    'Platinum Futures (PL)',
    'Palladium Futures (PA)',
    'Micro Palladium Futures (PAM)',
    'Corn Futures (ZC)',
    'Wheat Futures (ZW)',
    'Soybean Futures (ZS)',
    'Soybean Meal Futures (ZM)',
    'Lean Hog Futures (HE)',
    'Live Cattle Futures (LE)',
    'Feeder Cattle Futures (GF)',
    'Light Sweet Crude Oil Futures (WTI)',
    'Brent Crude Oil Futures',
    'Natural Gas Futures',
    'RBOB Gasoline Futures',
    'Heating Oil Futures',
    'Bitcoin Futures (BTC)',
    'Ether Futures (ETH)',
    'Micro Bitcoin Futures (MBT)',
    'Micro Ether Futures (MET)'
  ],
  Forex: [
    'EUR/USD',
    'USD/JPY',
    'GBP/USD',
    'USD/CHF',
    'AUD/USD',
    'USD/CAD',
    'NZD/USD',
    'EUR/GBP',
    'EUR/JPY',
    'EUR/CHF',
    'EUR/AUD',
    'EUR/CAD',
    'GBP/JPY',
    'GBP/CHF',
    'GBP/AUD',
    'AUD/JPY',
    'AUD/CAD',
    'CAD/JPY',
    'CHF/JPY',
    'NZD/JPY'
  ],
  CFDs: [
    // Índices
    'S&P 500 (US500)',
    'NASDAQ 100 (US100)',
    'Dow Jones (US30)',
    'DAX 40 (DE30)',
    'FTSE 100 (UK100)',
    'Euro Stoxx 50 (EU50)',
    'Nikkei 225 (JP225)',
    'Hang Seng (HK50)',
    'ASX 200 (AU200)',
    'CAC 40 (FR40)',
    // Commodities
    'Oro (Gold)',
    'Plata (Silver)',
    'Petróleo Crudo WTI',
    'Petróleo Brent',
    'Gas Natural',
    'Gasolina RBOB',
    'Café',
    'Azúcar',
    'Cacao',
    'Algodón',
    // Criptomonedas
    'Bitcoin (BTC/USD)',
    'Ethereum (ETH/USD)',
    'Litecoin (LTC/USD)',
    'Ripple (XRP/USD)',
    'Bitcoin Cash (BCH/USD)',
    'Cardano (ADA/USD)',
    'Solana (SOL/USD)'
  ]
};

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

  // Obtener labels dinámicos según tipo de trading
  const getFieldLabel = (baseLabel: string): string => {
    if (!userSettings) return baseLabel;

    const tradingType = userSettings.tradingType;

    if (baseLabel === 'Contratos') {
      return tradingType === 'Futuros' ? 'Contratos' : 'Lotes';
    }

    if (baseLabel === 'Puntos') {
      return tradingType === 'Futuros' ? 'Puntos' : 'Pips / Ticks';
    }

    return baseLabel;
  };

  // Obtener lista de activos según tipo de trading
  const getActivosList = (): string[] => {
    if (!userSettings) return ACTIVOS_POR_MERCADO.Futuros;
    return ACTIVOS_POR_MERCADO[userSettings.tradingType] || ACTIVOS_POR_MERCADO.Futuros;
  };

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
        const storageRef = ref(storage, `trades/${user.uid}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const tradeData: Omit<Trade, 'id'> = {
        userId: user.uid,
        fecha: formData.get('fecha') as string,
        activo: formData.get('activo') as string,
        setup: formData.get('setup') as string,
        direccion: formData.get('direccion') as string,
        temporalidad: formData.get('temporalidad') as string,
        horario: formData.get('horario') as string,
        identificadorCuenta: formData.get('identificadorCuenta') as string,
        hora_entrada: formData.get('hora_entrada') as string,
        hora_salida: formData.get('hora_salida') as string,
        contratos: parseInt(formData.get('contratos') as string),
        puntos: parseFloat(formData.get('puntos') as string),
        ganancia_perdida: parseFloat(formData.get('ganancia_perdida') as string),
        resultado: formData.get('resultado') as string,
        resultado_especifico: formData.get('resultado_especifico') as string,
        comentarios: formData.get('comentarios') as string,
        imageUrl: imageUrl,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'trades'), tradeData);

      setMessage('✅ Trade guardado exitosamente!');
      e.currentTarget.reset();
      removeImage();
      
      setTimeout(() => {
        setMessage('');
        router.push('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Error:', error);
      setMessage('❌ Error al guardar trade: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loadingSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver flex items-center justify-center">
        <div className="text-carbon text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-kint mx-auto mb-4"></div>
          <p className="text-xl font-heading">Cargando...</p>
        </div>
      </div>
    );
  }

  const activosList = getActivosList();

  return (
    <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver">
      <Navbar onLogout={logout} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-silver">
          <h1 className="text-3xl font-heading font-bold text-carbon mb-2 text-center">
            📈 Nuevo Trade
          </h1>
          <p className="text-text-gray text-center mb-6 font-body">
            Registra tu operación con precisión
          </p>
          <p className="text-sm text-text-gray text-center mb-6 font-body">
            Modo: <strong className="text-gold-kint">{userSettings?.tradingType}</strong>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-carbon mb-2 font-body">Fecha *</label>
                <input
                  type="date"
                  name="fecha"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-carbon mb-2 font-body">Activo *</label>
                <select
                  name="activo"
                  required
                  className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                >
                  <option value="">Selecciona activo</option>
                  {activosList.map((activo) => (
                    <option key={activo} value={activo}>{activo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-carbon mb-2 font-body">Setup *</label>
                <select
                  name="setup"
                  required
                  className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                >
                  <option value="">Selecciona setup</option>
                  {userSettings?.customSetups.map((setup) => (
                    <option key={setup} value={setup}>{setup}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-carbon mb-2 font-body">Dirección *</label>
                <select
                  name="direccion"
                  required
                  className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                >
                  <option value="">Selecciona dirección</option>
                  <option value="Long">Long</option>
                  <option value="Short">Short</option>
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
  <div>
    <label className="block text-sm font-medium text-carbon mb-2 font-body">Dirección *</label>
    <select
      name="direccion"
      required
      className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
    >
      <option value="">Selecciona dirección</option>
      <option value="Long">Long</option>
      <option value="Short">Short</option>
    </select>
  </div>

  <div>
    <label className="block text-sm font-medium text-carbon mb-2 font-body">Temporalidad *</label>
    <select
      name="temporalidad"
      required
      className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
    >
      <option value="">Selecciona temporalidad</option>
      <option value="1m">1 minuto</option>
      <option value="5m">5 minutos</option>
      <option value="15m">15 minutos</option>
      <option value="30m">30 minutos</option>
      <option value="1h">1 hora</option>
      <option value="4h">4 horas</option>
      <option value="1D">Diario</option>
      <option value="Volumen">Vol</option>
    </select>
  </div>
</div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-carbon mb-2 font-body">Horario *</label>
                <select
                  name="horario"
                  required
                  className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                >
                  <option value="">Selecciona horario</option>
                  <option value="Pre-market">Pre-market</option>
                  <option value="Sesión NY">Sesión NY</option>
                  <option value="Sesión Londres">Sesión Londres</option>
                  <option value="Sesión Asia">Sesión Asia</option>
                  <option value="After-hours">After-hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-carbon mb-2 font-body">Identificador de cuenta</label>
                <input
                  type="text"
                  name="identificadorCuenta"
                  placeholder="Ej: Demo-001, Real-Main, Prop-FTMO"
                  className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-carbon mb-2 font-body">Hora de Entrada *</label>
                <input
                  type="time"
                  name="hora_entrada"
                  required
                  className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-carbon mb-2 font-body">Hora de Salida *</label>
                <input
                  type="time"
                  name="hora_salida"
                  required
                  className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-carbon mb-2 font-body">
                  {getFieldLabel('Contratos')} *
                </label>
                <input
                  type="number"
                  name="contratos"
                  required
                  min="0"
                  step={userSettings?.tradingType === 'Futuros' ? '1' : '0.01'}
                  className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-carbon mb-2 font-body">
                  {getFieldLabel('Puntos')} *
                </label>
                <input
                  type="number"
                  name="puntos"
                  required
                  step={userSettings?.tradingType === 'Futuros' ? '1' : '0.0001'}
                  className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-carbon mb-2 font-body">Ganancia/Pérdida ($) *</label>
                <input
                  type="number"
                  name="ganancia_perdida"
                  required
                  step="0.01"
                  className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-carbon mb-2 font-body">Resultado *</label>
                <select
                  name="resultado"
                  required
                  className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                >
                  <option value="">Selecciona resultado</option>
                  <option value="Won">Won (Ganador)</option>
                  <option value="Lose">Lose (Perdedor)</option>
                  <option value="BE">BE (Breakeven)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-carbon mb-2 font-body">Resultado Específico</label>
                <select
                  name="resultado_especifico"
                  className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                >
                  <option value="">Selecciona</option>
                  <option value="W - TP1">W - TP1</option>
                  <option value="W - TP2">W - TP2</option>
                  <option value="W - TP3">W - TP3</option>
                  <option value="W - Trailing">W - Trailing Stop</option>
                  <option value="L - SL">L - Stop Loss</option>
                  <option value="L - Manual">L - Salida Manual</option>
                  <option value="BE - Movido">BE - Stop Movido a BE</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon mb-2 font-body">Comentarios</label>
              <textarea
                name="comentarios"
                rows={4}
                placeholder="Notas, emociones, observaciones..."
                className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon mb-2 font-body">
                📷 Imagen del Setup (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold-kint file:text-white hover:file:bg-gold-dark"
              />
              <p className="text-xs text-text-gray mt-1 font-body">
                Captura de pantalla de tu operación (PNG, JPG - Max 5MB)
              </p>
              {imagePreview && (
                <div className="mt-4 relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-w-full h-auto rounded-lg border-2 border-silver shadow-md" 
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-lesson-red hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 font-semibold shadow-lg font-body"
                  >
                    ✕ Eliminar
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-kint hover:bg-gold-dark text-white font-semibold py-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-gold hover:shadow-gold-lg font-body"
            >
              {loading ? 'Guardando...' : '💾 Guardar Trade'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
