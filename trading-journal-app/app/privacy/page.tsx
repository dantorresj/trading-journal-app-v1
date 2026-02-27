'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-silver via-white to-silver flex flex-col">
      <div className="container mx-auto px-4 py-12 max-w-4xl flex-1">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-gold-kint hover:text-gold-dark font-semibold font-body inline-flex items-center mb-4"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-heading font-bold text-carbon mb-4">
            Política de Privacidad
          </h1>
          <p className="text-text-gray font-body">
            Última actualización: Febrero 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6 font-body text-carbon">
          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">1. Información que Recopilamos</h2>
            <p className="text-text-gray mb-3">
              En KintEdge, recopilamos la siguiente información para brindarte nuestros servicios:
            </p>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4">
              <li><strong>Información de cuenta:</strong> Email, nombre (opcional), contraseña encriptada</li>
              <li><strong>Datos de trading:</strong> Trades registrados, reflexiones, configuraciones personalizadas</li>
              <li><strong>Información de pago:</strong> A través de Stripe (no almacenamos datos de tarjetas)</li>
              <li><strong>Uso de la plataforma:</strong> Páginas visitadas, funciones utilizadas (para mejorar el servicio)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">2. Cómo Usamos tu Información</h2>
            <p className="text-text-gray mb-3">
              Utilizamos tus datos exclusivamente para:
            </p>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4">
              <li>Proporcionar y mejorar nuestros servicios</li>
              <li>Procesar pagos y gestionar suscripciones</li>
              <li>Enviarte notificaciones importantes sobre tu cuenta</li>
              <li>Responder a tus consultas de soporte</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">3. Comunicaciones por Email</h2>
            <p className="text-text-gray mb-3">
              Te enviaremos emails en las siguientes situaciones:
            </p>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4">
              <li><strong>Emails transaccionales:</strong> Confirmaciones de pago, cambios en tu suscripción, actualizaciones de seguridad (no puedes darte de baja de estos)</li>
              <li><strong>Emails informativos:</strong> Nuevas funciones, consejos de trading, contenido educativo (puedes darte de baja en cualquier momento)</li>
            </ul>
            <p className="text-text-gray mt-3">
              Puedes gestionar tus preferencias de email desde la configuración de tu cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">4. Protección de Datos</h2>
            <p className="text-text-gray">
              Implementamos medidas de seguridad para proteger tu información:
            </p>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4 mt-3">
              <li>Encriptación SSL/TLS en todas las comunicaciones</li>
              <li>Contraseñas hasheadas con Firebase Authentication</li>
              <li>Acceso restringido mediante Firebase Security Rules</li>
              <li>Pagos procesados exclusivamente por Stripe (PCI DSS Level 1)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">5. Compartir Información</h2>
            <p className="text-text-gray">
              <strong>No vendemos ni compartimos tus datos personales con terceros</strong> para fines de marketing.
            </p>
            <p className="text-text-gray mt-3">
              Compartimos información únicamente con:
            </p>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4 mt-3">
              <li><strong>Stripe:</strong> Para procesar pagos (ver su política en stripe.com/privacy)</li>
              <li><strong>Firebase/Google Cloud:</strong> Para almacenar datos de forma segura</li>
              <li><strong>Autoridades:</strong> Cuando sea requerido por ley</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">6. Tus Derechos</h2>
            <p className="text-text-gray mb-3">
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4">
              <li>Acceder a tus datos personales</li>
              <li>Corregir información incorrecta</li>
              <li>Eliminar tu cuenta y todos tus datos</li>
              <li>Exportar tus datos en formato legible</li>
              <li>Oponerte al procesamiento de tus datos</li>
            </ul>
            <p className="text-text-gray mt-3">
              Para ejercer estos derechos, contáctanos en: <a href="mailto:privacy@kintedge.com" className="text-gold-kint hover:underline">privacy@kintedge.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">7. Cookies y Tecnologías Similares</h2>
            <p className="text-text-gray">
              Utilizamos cookies esenciales para el funcionamiento de la plataforma (autenticación, sesión). 
              No utilizamos cookies de terceros para publicidad o seguimiento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">8. Retención de Datos</h2>
            <p className="text-text-gray">
              Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, 
              borramos todos tus datos personales en un plazo de 30 días, excepto información 
              que debamos mantener por obligaciones legales (registros de pago).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">9. Cambios a esta Política</h2>
            <p className="text-text-gray">
              Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios 
              significativos por email o mediante un aviso en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">10. Contacto</h2>
            <p className="text-text-gray">
              Para preguntas sobre esta política o tus datos, contáctanos en:
            </p>
            <ul className="text-text-gray space-y-2 mt-3">
              <li>📧 Email: <a href="" className="text-gold-kint hover:underline"></a></li>
              <li>💬 Soporte: <Link href="/support" className="text-gold-kint hover:underline">kintedge.com/support</Link></li>
            </ul>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
