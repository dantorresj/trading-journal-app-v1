'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Trade } from '@/types';
import Navbar from '@/components/Navbar';

export default function EditTrade() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tradeId = params.id as string;

  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadTrade();
  }, [user, router, tradeId]);

  const loadTrade = async () => {
    try {
      const tradeDoc = await getDoc(doc(db, 'trades', tradeId));
      
      if (!tradeDoc.exists()) {
        setMessage('❌ Trade no encontrado');
        setTimeout(() => router.push('/all-trades'), 2000);
        return;
      }

      const tradeData = { id: tradeDoc.id, ...tradeDoc.data() } as Trade;
      
      // Verificar que el trade pertenece al usuario
      if (tradeData.userId !== user?.uid) {
        setMessage('❌ No tienes permiso para editar este trade');
        setTimeout(() => router.push('/all-trades'), 2000);
        return;
      }

      setTrade(tradeData);
      if (tradeData.imagen) {
        setImagePreview(tradeData.imagen);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error al cargar el trade');
    } finally {
      setLoading(false);
    }
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
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setRemoveImage(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !trade) return;

    setSaving(true);
    setMessage('');

    try {
      const formData = new FormData(e.currentTarget);
      
      let imageUrl = trade.imagen || '';

      // Manejar imagen
      if (removeImage && trade.imagen) {
        // Eliminar imagen anterior
        try {
          const imageRef = ref(storage, trade.imagen);
          await deleteObject(imageRef);
        } catch (err) {
          console.log('Error deleting old image:', err);
        }
        imageUrl = '';
      } else if (imageFile) {
        // Subir nueva imagen
        if (trade.imagen) {
          // Eliminar imagen anterior
          try {
            const imageRef = ref(storage, trade.imagen);
            await deleteObject(imageRef);
          } catch (err) {
            console.log('Error deleting old image:', err);
          }
        }
        const imageRef = ref(storage, `trades/${user.uid}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const updatedTrade = {
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
      };

      await updateDoc(doc(db, 'trades', tradeId), updatedTrade);

      setMessage('✅ Trade actualizado exitosamente!');
      setTimeout(() => {
        router.push('/all-trades');
      }, 1500);

    } catch (error: any) {
      console.error('Error:', error);
      setMessage('❌ Error al actualizar trade: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Cargando trade...</p>
        </div>
      </div>
    );
  }

  if (!trade) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500">
      <Navbar onLogout={logout} />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            ✏️ Editar Trade
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
                defaultValue={trade.fecha}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activo</label>
                <select
                  name="activo"
                  defaultValue={trade.activo}
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
                  defaultValue={trade.horario}
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
                defaultValue={trade.setup}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option>Balance</option>
                <option>Imbalance alcista</option>
                <option>Imbalance bajista</option>
                <option>Segundo golpe</option>
                <option>Medias móviles</option>
                <option>Trend Flow</option>
                <option>Trend Hunter</option>
                <option>Returns</option>
                <option>Liquidity Kill Zone</option>
                <option>Otro</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tendencia</label>
                <select
                  name="tendencia"
                  defaultValue={trade.tendencia}
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
                  defaultValue={trade.temporalidad}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Contratos</label>
              <input
                type="number"
                name="contratos"
                min="1"
                defaultValue={trade.contratos}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <select
                  name="direccion"
                  defaultValue={trade.direccion}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option>compra</option>
                  <option>venta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Puntos</label>
                <input
                  type="number"
                  name="puntos"
                  defaultValue={trade.puntos}
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
                  defaultValue={trade.hora_entrada}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora Salida</label>
                <input
                  type="time"
                  name="hora_salida"
                  defaultValue={trade.hora_salida}
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
                  defaultValue={trade.resultado}
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
                  defaultValue={trade.resultado_especifico}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option>G</option>
                  <option>P</option>
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
                defaultValue={trade.ganancia_perdida}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comentarios</label>
              <textarea
                name="comentarios"
                rows={3}
                defaultValue={trade.comentarios}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Trade</label>
              
              {imagePreview && !removeImage && (
                <div className="mb-4 relative">
                  <img src={imagePreview} alt="Preview" className="w-full rounded-lg" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}

              {(!imagePreview || removeImage) && (
                <div 
                  onClick={() => document.getElementById('imageInput')?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition"
                >
                  <div className="text-4xl mb-2">📸</div>
                  <div className="text-sm text-gray-600">Toca para {trade.imagen ? 'cambiar' : 'subir'} imagen</div>
                </div>
              )}
              
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/all-trades')}
                disabled={saving}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-4 rounded-lg transition duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
