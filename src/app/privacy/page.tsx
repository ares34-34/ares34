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
            Última actualización: 18 de marzo de 2026
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
                <li><strong className="text-white/90">Datos de calendario:</strong> eventos de tu Google Calendar (título, descripción, fecha/hora, enlaces de reunión) cuando conectas la integración de calendario</li>
                <li><strong className="text-white/90">Datos de uso:</strong> preguntas que realizas a los agentes de IA, configuraciones de tu perfil ejecutivo (KPIs, metas, inspiración), eventos creados en ARES Calendar</li>
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
                <li>Sincronizar y mostrar tus eventos de Google Calendar dentro de ARES34</li>
                <li>Crear eventos en tu Google Calendar desde ARES34 cuando lo solicites</li>
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
              <h2 className="text-lg font-semibold text-white mb-3">8. Integración con Google Calendar</h2>
              <p>
                ARES34 ofrece integración con Google Calendar para sincronizar tu agenda ejecutiva.
                Al conectar tu cuenta de Google, autorizas a ARES34 a acceder a los siguientes datos:
              </p>

              <h3 className="text-sm font-semibold text-white/90 mt-4 mb-2">8.1 Datos que accedemos</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong className="text-white/90">Perfil básico:</strong> nombre, correo electrónico y foto de perfil (scopes: userinfo.email, userinfo.profile)</li>
                <li><strong className="text-white/90">Lectura de calendario:</strong> eventos, títulos, descripciones, fechas/horas, enlaces de reunión y calendarios asociados (scope: calendar.readonly)</li>
                <li><strong className="text-white/90">Escritura de calendario:</strong> crear nuevos eventos en tu Google Calendar cuando lo solicites desde ARES34 (scope: calendar.events)</li>
              </ul>

              <h3 className="text-sm font-semibold text-white/90 mt-4 mb-2">8.2 Cómo usamos estos datos</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Mostrarte tus eventos de Google Calendar dentro de ARES Calendar para que tengas una vista unificada de tu agenda</li>
                <li>Crear eventos en tu Google Calendar cuando generas citas o recordatorios desde ARES34</li>
                <li>Sincronizar automáticamente cambios para mantener ambos calendarios actualizados</li>
              </ul>

              <h3 className="text-sm font-semibold text-white/90 mt-4 mb-2">8.3 Almacenamiento y protección</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Los eventos sincronizados se almacenan en nuestra base de datos con cifrado en reposo</li>
                <li>Los tokens de acceso de Google se almacenan de forma segura y se refrescan automáticamente</li>
                <li>Cada usuario solo puede ver sus propios eventos (aislamiento por Row Level Security)</li>
                <li>No compartimos tus datos de calendario con otros usuarios ni con terceros</li>
                <li>No utilizamos tus datos de calendario para entrenar modelos de IA</li>
              </ul>

              <h3 className="text-sm font-semibold text-white/90 mt-4 mb-2">8.4 Datos que NO accedemos</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>No accedemos a tus contactos de Google</li>
                <li>No accedemos a Google Drive ni a tus archivos</li>
                <li>No accedemos a Gmail ni a tus correos electrónicos</li>
                <li>No accedemos a Google Fotos ni a tus imágenes</li>
              </ul>

              <h3 className="text-sm font-semibold text-white/90 mt-4 mb-2">8.5 Revocación del acceso</h3>
              <p>
                Puedes desconectar tu Google Calendar en cualquier momento desde la sección
                &quot;Integraciones&quot; de ARES Calendar o desde la configuración de tu cuenta de Google en{' '}
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                  myaccount.google.com/permissions
                </a>. Al desconectar, dejaremos de sincronizar eventos y eliminaremos los tokens de acceso almacenados.
              </p>

              <h3 className="text-sm font-semibold text-white/90 mt-4 mb-2">8.6 Cumplimiento con políticas de Google</h3>
              <p>
                El uso y transferencia de información recibida de las APIs de Google por parte de ARES34
                cumple con la{' '}
                <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                  Política de Datos de Usuario de los Servicios API de Google
                </a>, incluyendo los requisitos de Uso Limitado. Específicamente:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Solo usamos los datos de Google para proporcionar y mejorar las funcionalidades de ARES34 visibles para el usuario</li>
                <li>No transferimos datos de Google a terceros, excepto cuando es necesario para proporcionar el servicio, cumplir con leyes aplicables, o con tu consentimiento explícito</li>
                <li>No usamos datos de Google para publicidad ni para crear perfiles publicitarios</li>
                <li>No permitimos que humanos lean tus datos de Google, excepto con tu consentimiento, por razones de seguridad, para cumplir con la ley, o cuando los datos son agregados y anonimizados para operaciones internas</li>
              </ul>
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
