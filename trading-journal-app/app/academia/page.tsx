'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

export default function AcademiaPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    email: user?.email || '',
    experiencia: '',
    redes: '',
    mensaje: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aquí podrías enviar a Firebase o a un servicio de email
    console.log('Solicitud de instructor:', formData);
    
    setSubmitted(true);
    
    setTimeout(() => {
      setFormData({
        nombre: '',
        email: user?.email || '',
        experiencia: '',
        redes: '',
        mensaje: ''
      });
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver">
      <Navbar onLogout={logout} />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg border-2 border-gold-kint mb-6">
            <img src="/icons/icon-academy.png" alt="Academia" className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-5xl font-heading font-bold text-carbon mb-4">
            Academia KintEdge
          </h1>
          <p className="text-xl text-text-gray font-body max-w-2xl mx-auto">
            Aprende de traders profesionales y lleva tu trading al siguiente nivel
          </p>
        </div>

        {/* Sección: Próximamente */}
        <div className="bg-white rounded-2xl shadow-xl p-12 mb-12 text-center border border-silver">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-3xl font-heading font-bold text-carbon mb-4">
            Próximamente: Cursos y Recursos
          </h2>
          <p className="text-lg text-text-gray font-body max-w-2xl mx-auto mb-6">
            Estamos trabajando para traerte contenido educativo de alta calidad creado por traders experimentados.
            Pronto podrás acceder a cursos, estrategias, análisis y mucho más.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-gradient-to-br from-gold-50 to-white rounded-xl border border-gold-200">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-semibold text-carbon mb-2 font-body">Cursos Completos</h3>
              <p className="text-sm text-text-gray font-body">
                Desde principiante hasta avanzado
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-growth-50 to-white rounded-xl border border-growth-200">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-carbon mb-2 font-body">Estrategias Probadas</h3>
              <p className="text-sm text-text-gray font-body">
                Setups y técnicas rentables
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="font-semibold text-carbon mb-2 font-body">Mentoría 1-on-1</h3>
              <p className="text-sm text-text-gray font-body">
                Sesiones personalizadas
              </p>
            </div>
          </div>
        </div>

        {/* Sección: Para Instructores */}
        <div className="bg-gradient-to-br from-gold-kint to-gold-dark rounded-2xl shadow-xl p-8 md:p-12 text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-heading font-bold mb-4 text-center">
              ¿Eres Trader Profesional?
            </h2>
            <p className="text-lg text-center mb-8 opacity-90">
              Comparte tu conocimiento, construye tu marca y monetiza tu experiencia
            </p>

            {submitted ? (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h3>
                <p className="opacity-90">
                  Hemos recibido tu solicitud. Nos pondremos en contacto contigo pronto.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-6 text-center">
                  Solicita Ser Instructor
                </h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Experiencia en Trading *</label>
                  <input
                    type="text"
                    required
                    value={formData.experiencia}
                    onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    placeholder="Ej: 5 años operando futuros, especializado en scalping"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Redes Sociales / Sitio Web</label>
                  <input
                    type="text"
                    value={formData.redes}
                    onChange={(e) => setFormData({ ...formData, redes: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    placeholder="Twitter, YouTube, Instagram, etc."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">¿Qué te gustaría enseñar?</label>
                  <textarea
                    rows={4}
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    placeholder="Cuéntanos sobre tu estrategia, metodología o contenido que quieres compartir..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-white text-gold-kint hover:bg-gray-100 font-semibold py-4 rounded-lg transition-all duration-300 shadow-lg"
                >
                  Enviar Solicitud
                </button>

                <p className="text-sm text-center mt-4 opacity-75">
                  Revisaremos tu solicitud y nos pondremos en contacto contigo
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Beneficios para Instructores */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-silver text-center">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-semibold text-carbon mb-2 font-body">Monetiza tu Conocimiento</h3>
            <p className="text-sm text-text-gray font-body">
              Define tus propios precios y gana dinero con lo que sabes
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-silver text-center">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="font-semibold text-carbon mb-2 font-body">Construye tu Audiencia</h3>
            <p className="text-sm text-text-gray font-body">
              Accede a miles de traders activos buscando aprender
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-silver text-center">
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="font-semibold text-carbon mb-2 font-body">Herramientas Completas</h3>
            <p className="text-sm text-text-gray font-body">
              Plataforma todo-en-uno para subir y vender tu contenido
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
