'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Mensaje enviado exitosamente. Te responderemos pronto!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setMessage('❌ Error: ' + (data.error || 'No se pudo enviar el mensaje'));
      }
    } catch (error) {
      setMessage('❌ Error al enviar el mensaje. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver flex flex-col">
      <div className="container mx-auto px-4 py-12 max-w-3xl flex-1">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-gold-kint hover:text-gold-dark font-semibold font-body inline-flex items-center mb-4"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-heading font-bold text-carbon mb-4">
            Soporte
          </h1>
          <p className="text-text-gray font-body">
            ¿Necesitas ayuda? Estamos aquí para ti. Responderemos en menos de 24 horas.
          </p>
        </div>

        {/* Quick Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-heading font-semibold text-carbon mb-3">
            💡 Preguntas Frecuentes
          </h2>
          <div className="space-y-3 text-sm font-body">
            <details className="cursor-pointer">
              <summary className="font-semibold text-carbon">¿Cómo cancelo mi suscripción?</summary>
              <p className="text-text-gray mt-2 ml-4">
                Ve a tu Perfil → Suscripción → Gestionar Suscripción. Desde ahí puedes cancelar en cualquier momento.
              </p>
            </details>
            <details className="cursor-pointer">
              <summary className="font-semibold text-carbon">¿Puedo exportar mis datos?</summary>
              <p className="text-text-gray mt-2 ml-4">
                Sí, en Settings encontrarás la opción para exportar todos tus trades y reflexiones en formato CSV.
              </p>
            </details>
            <details className="cursor-pointer">
              <summary className="font-semibold text-carbon">¿Los Insights con IA son consejos financieros?</summary>
              <p className="text-text-gray mt-2 ml-4">
                No. Los insights son análisis educativos para ayudarte a reflexionar sobre tu trading. No son recomendaciones de inversión.
              </p>
            </details>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-heading font-semibold text-carbon mb-6">
            Envíanos un mensaje
          </h2>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-carbon mb-2 font-body">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon mb-2 font-body">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon mb-2 font-body">
                Asunto *
              </label>
              <select
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body"
              >
                <option value="">Selecciona un tema</option>
                <option value="Problema técnico">Problema técnico</option>
                <option value="Pregunta sobre suscripción">Pregunta sobre suscripción</option>
                <option value="Sugerencia de función">Sugerencia de función</option>
                <option value="Problema con pago">Problema con pago</option>
                <option value="Cancelación de cuenta">Cancelación de cuenta</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon mb-2 font-body">
                Mensaje *
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body resize-none"
                placeholder="Describe tu consulta con el mayor detalle posible..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-kint hover:bg-gold-dark text-white font-semibold py-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-body shadow-gold hover:shadow-gold-lg"
            >
              {loading ? 'Enviando...' : '📧 Enviar Mensaje'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-silver">
            <p className="text-sm text-text-gray text-center font-body">
              También puedes contactarnos directamente en{' '}
              <a href="mailto:support@kintedge.com" className="text-gold-kint hover:underline">
                support@kintedge.com
              </a>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
