'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function TermsPage() {
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
            Términos y Condiciones
          </h1>
          <p className="text-text-gray font-body">
            Última actualización: Febrero 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6 font-body text-carbon">
          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">1. Aceptación de los Términos</h2>
            <p className="text-text-gray">
              Al crear una cuenta en KintEdge, aceptas estos Términos y Condiciones. 
              Si no estás de acuerdo, no uses nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">2. Descripción del Servicio</h2>
            <p className="text-text-gray mb-3">
              KintEdge es una plataforma de journal de trading que te permite:
            </p>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4">
              <li>Registrar y analizar tus operaciones de trading</li>
              <li>Escribir reflexiones sobre tu desempeño</li>
              <li>Recibir insights generados por inteligencia artificial</li>
              <li>Configurar y seguir tu plan de trading</li>
              <li>Acceder a contenido educativo</li>
            </ul>
            <p className="text-text-gray mt-3">
              <strong>Nota importante:</strong> KintEdge es una herramienta de análisis y seguimiento. 
              <strong> No proporcionamos asesoramiento financiero ni recomendaciones de inversión.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">3. Elegibilidad</h2>
            <p className="text-text-gray">
              Debes tener al menos 18 años para usar KintEdge. Al registrarte, confirmas que:
            </p>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4 mt-3">
              <li>Eres mayor de edad en tu jurisdicción</li>
              <li>Tienes capacidad legal para aceptar estos términos</li>
              <li>La información que proporcionas es veraz y precisa</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">4. Cuenta de Usuario</h2>
            <p className="text-text-gray mb-3">
              Eres responsable de:
            </p>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4">
              <li>Mantener la confidencialidad de tu contraseña</li>
              <li>Todas las actividades que ocurran bajo tu cuenta</li>
              <li>Notificarnos inmediatamente de cualquier uso no autorizado</li>
            </ul>
            <p className="text-text-gray mt-3">
              Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">5. Planes y Pagos</h2>
            <h3 className="text-lg font-semibold mt-4 mb-2">Plan Gratuito</h3>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4">
              <li>Hasta 20 trades por mes</li>
              <li>Hasta 20 reflexiones por mes</li>
              <li>Funciones básicas del journal</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">Plan Pro ($19.99/mes)</h3>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4">
              <li>Trades y reflexiones ilimitados</li>
              <li>Insights con inteligencia artificial</li>
              <li>Subida de imágenes</li>
              <li>Todas las funciones premium</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">Facturación y Renovación</h3>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4">
              <li>El plan Pro se renueva automáticamente cada mes</li>
              <li>Puedes cancelar en cualquier momento desde tu perfil</li>
              <li>Los cargos se procesan a través de Stripe</li>
              <li>No hay reembolsos por meses parciales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">6. Propiedad Intelectual</h2>
            <p className="text-text-gray mb-3">
              <strong>Tu contenido:</strong> Mantienes todos los derechos sobre los datos que registras 
              (trades, reflexiones, imágenes). Nos concedes una licencia para procesar y almacenar este contenido 
              únicamente para proporcionarte el servicio.
            </p>
            <p className="text-text-gray">
              <strong>Nuestro contenido:</strong> KintEdge, nuestro logo, diseño y funcionalidades son 
              propiedad de KintEdge. No puedes copiar, modificar o redistribuir sin autorización.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">7. Uso Prohibido</h2>
            <p className="text-text-gray mb-3">
              No puedes usar KintEdge para:
            </p>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4">
              <li>Violar leyes o regulaciones</li>
              <li>Compartir contenido ofensivo, ilegal o dañino</li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Hacer ingeniería inversa de la plataforma</li>
              <li>Usar bots o automatización no autorizada</li>
              <li>Revender o redistribuir el servicio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">8. Descargo de Responsabilidad</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
              <p className="text-carbon font-semibold mb-2">⚠️ IMPORTANTE - LEE CUIDADOSAMENTE</p>
              <ul className="text-text-gray space-y-2 text-sm">
                <li>• KintEdge es una herramienta de seguimiento y análisis, NO un asesor financiero</li>
                <li>• No proporcionamos recomendaciones de inversión ni señales de trading</li>
                <li>• Los insights de IA son sugerencias educativas, no consejos financieros</li>
                <li>• El trading conlleva riesgo de pérdida de capital</li>
                <li>• Eres el único responsable de tus decisiones de trading</li>
              </ul>
            </div>
            <p className="text-text-gray">
              KintEdge se proporciona "tal cual" sin garantías de ningún tipo. No garantizamos que 
              el servicio sea ininterrumpido o libre de errores.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">9. Limitación de Responsabilidad</h2>
            <p className="text-text-gray">
              En ningún caso KintEdge será responsable por:
            </p>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4 mt-3">
              <li>Pérdidas financieras resultantes de tus decisiones de trading</li>
              <li>Daños indirectos, incidentales o consecuentes</li>
              <li>Pérdida de datos debido a factores fuera de nuestro control</li>
              <li>Interrupciones del servicio por mantenimiento o problemas técnicos</li>
            </ul>
            <p className="text-text-gray mt-3">
              Nuestra responsabilidad máxima se limita al monto pagado por tu suscripción en los últimos 12 meses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">10. Modificaciones del Servicio</h2>
            <p className="text-text-gray">
              Nos reservamos el derecho de modificar, suspender o descontinuar funciones del servicio 
              en cualquier momento. Te notificaremos de cambios significativos con anticipación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">11. Terminación</h2>
            <p className="text-text-gray mb-3">
              Puedes cancelar tu cuenta en cualquier momento desde la configuración. Al hacerlo:
            </p>
            <ul className="list-disc list-inside text-text-gray space-y-2 ml-4">
              <li>Tu suscripción se cancela inmediatamente</li>
              <li>Tus datos se eliminan en un plazo de 30 días</li>
              <li>No hay reembolsos por tiempo no utilizado</li>
            </ul>
            <p className="text-text-gray mt-3">
              Podemos terminar tu cuenta si violas estos términos, con o sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">12. Cambios a los Términos</h2>
            <p className="text-text-gray">
              Podemos actualizar estos términos ocasionalmente. Los cambios significativos se notificarán 
              por email o mediante un aviso en la plataforma. El uso continuado del servicio después de 
              cambios constituye tu aceptación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">13. Ley Aplicable</h2>
            <p className="text-text-gray">
              Estos términos se rigen por las leyes de México. Cualquier disputa se resolverá en 
              los tribunales competentes de Cuernavaca, Morelos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">14. Contacto</h2>
            <p className="text-text-gray">
              Para preguntas sobre estos términos, contáctanos en:
            </p>
            <ul className="text-text-gray space-y-2 mt-3">
              <li>📧 Email: <a href="mailto:legal@kintedge.com" className="text-gold-kint hover:underline">legal@kintedge.com</a></li>
              <li>💬 Soporte: <Link href="/support" className="text-gold-kint hover:underline">kintedge.com/support</Link></li>
            </ul>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
