import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aviso de Privacidad — ARES34',
  description: 'Aviso de privacidad y protección de datos personales de ARES34.',
}

export default function PrivacyPage() {
  return (
    <>
      <div className="dynamic-bg-fixed">
        <div className="dynamic-bg-mesh" />
        <div className="cloud-layer-1" />
        <div className="cloud-layer-2" />
        <div className="dynamic-bg-noise" />
      </div>

      <main className="relative z-10 min-h-screen">
        {/* Nav simple */}
        <nav className="w-full border-b border-white/[0.08] bg-black/60 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-white text-sm font-semibold tracking-wide hover:text-white/80 transition-colors">
              ← ARES34
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </nav>

        {/* Contenido */}
        <div className="max-w-[900px] mx-auto px-6 py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Aviso de Privacidad
          </h1>
          <p className="text-white/40 text-sm mb-12">
            Última actualización: 22 de febrero de 2026
          </p>

          <div className="space-y-10 text-white/70 text-sm leading-relaxed">
            {/* 1 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. Responsable del tratamiento</h2>
              <p>
                ARES34 (en adelante &quot;nosotros&quot;), con domicilio en México, es responsable del
                tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos
                Personales en Posesión de los Particulares (LFPDPPP).
              </p>
              <p className="mt-2">
                Contacto para asuntos de privacidad: <span className="text-white">privacidad@ares34.com</span>
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. Datos personales que recopilamos</h2>
              <p>Recopilamos los siguientes datos personales:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong className="text-white/90">Datos de identificación:</strong> nombre, correo electrónico</li>
                <li><strong className="text-white/90">Datos de autenticación:</strong> información proporcionada por Google al iniciar sesión (nombre, email, foto de perfil)</li>
                <li><strong className="text-white/90">Datos de uso:</strong> preguntas que realizas a los agentes de IA, configuraciones de tu perfil ejecutivo (KPIs, metas, inspiración)</li>
                <li><strong className="text-white/90">Datos de facturación:</strong> procesados directamente por Stripe; nosotros no almacenamos números de tarjeta</li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. Finalidades del tratamiento</h2>
              <p>Utilizamos tus datos para:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Crear y administrar tu cuenta</li>
                <li>Autenticar tu identidad mediante correo electrónico o Google OAuth</li>
                <li>Proporcionar las respuestas personalizadas de nuestros agentes de IA</li>
                <li>Procesar pagos y gestionar tu suscripción</li>
                <li>Mejorar nuestro servicio y la calidad de las recomendaciones</li>
                <li>Cumplir con obligaciones legales aplicables</li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. Transferencia de datos</h2>
              <p>
                Tus datos pueden ser compartidos con los siguientes terceros para el funcionamiento del servicio:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong className="text-white/90">Supabase:</strong> almacenamiento de datos y autenticación (servidores en EE.UU.)</li>
                <li><strong className="text-white/90">Anthropic (Claude):</strong> procesamiento de consultas de IA — las preguntas se envían de forma anónima sin datos personales identificables</li>
                <li><strong className="text-white/90">Stripe:</strong> procesamiento de pagos</li>
                <li><strong className="text-white/90">Google:</strong> autenticación OAuth (solo si eliges iniciar sesión con Google)</li>
                <li><strong className="text-white/90">Vercel:</strong> hospedaje de la aplicación</li>
              </ul>
              <p className="mt-2">
                No vendemos, rentamos ni compartimos tus datos personales con terceros para fines publicitarios.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. Derechos ARCO</h2>
              <p>
                De acuerdo con la LFPDPPP, tienes derecho a Acceder, Rectificar, Cancelar u Oponerte
                al tratamiento de tus datos personales (derechos ARCO). Para ejercer estos derechos,
                envía un correo a <span className="text-white">privacidad@ares34.com</span> con tu solicitud.
              </p>
              <p className="mt-2">
                Responderemos en un plazo máximo de 20 días hábiles.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">6. Seguridad de los datos</h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Cifrado en tránsito (HTTPS/TLS) y en reposo</li>
                <li>Políticas de seguridad a nivel de fila (RLS) en la base de datos — cada usuario solo puede acceder a sus propios datos</li>
                <li>Autenticación segura mediante Supabase Auth</li>
                <li>No almacenamos contraseñas en texto plano</li>
              </ul>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">7. Cookies y tecnologías de seguimiento</h2>
              <p>
                Utilizamos cookies esenciales para el funcionamiento de la autenticación y la sesión.
                No utilizamos cookies de terceros con fines publicitarios ni de seguimiento.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">8. Datos de Google OAuth</h2>
              <p>
                Si inicias sesión con Google, accedemos únicamente a tu nombre, dirección de correo
                electrónico y foto de perfil. No accedemos a tus contactos, archivos de Drive,
                calendario ni ningún otro dato de tu cuenta de Google.
              </p>
              <p className="mt-2">
                El uso de información recibida de las APIs de Google cumple con la
                {' '}<a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                  Política de Datos de Usuario de los Servicios API de Google
                </a>, incluyendo los requisitos de uso limitado.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">9. Retención de datos</h2>
              <p>
                Conservamos tus datos mientras mantengas una cuenta activa. Si cancelas tu suscripción,
                tus datos se retienen por 90 días adicionales y luego se eliminan permanentemente.
                Puedes solicitar la eliminación inmediata contactando a <span className="text-white">privacidad@ares34.com</span>.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">10. Cambios al aviso de privacidad</h2>
              <p>
                Nos reservamos el derecho de modificar este aviso de privacidad. Cualquier cambio
                será publicado en esta página y, si es significativo, te notificaremos por correo electrónico.
              </p>
            </section>
          </div>

          {/* Footer links */}
          <div className="mt-16 pt-8 border-t border-white/[0.08] flex items-center justify-between">
            <Link href="/" className="text-white/40 text-xs hover:text-white/60 transition-colors">
              ← Volver al inicio
            </Link>
            <Link href="/terms" className="text-white/40 text-xs hover:text-white/60 transition-colors">
              Términos de Servicio →
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
