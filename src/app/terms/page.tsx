import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Servicio — ARES34',
  description: 'Términos y condiciones de uso del servicio ARES34.',
}

export default function TermsPage() {
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
            Términos de Servicio
          </h1>
          <p className="text-white/40 text-sm mb-12">
            Última actualización: 22 de febrero de 2026
          </p>

          <div className="space-y-10 text-white/70 text-sm leading-relaxed">
            {/* 1 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. Aceptación de los términos</h2>
              <p>
                Al acceder y utilizar ARES34 (el &quot;Servicio&quot;), aceptas quedar vinculado por estos
                Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos,
                no debes utilizar el Servicio.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. Descripción del servicio</h2>
              <p>
                ARES34 es una plataforma de inteligencia ejecutiva que utiliza agentes de inteligencia
                artificial para proporcionar análisis, perspectivas y recomendaciones a CEOs, directores
                y dueños de empresas. El Servicio incluye:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Un sistema de 9 agentes de IA especializados (CEO Virtual, Consejo Directivo, Junta de Inversionistas)</li>
                <li>Análisis y deliberación sobre preguntas estratégicas, operativas y de capital</li>
                <li>Recomendaciones personalizadas basadas en tu perfil ejecutivo</li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. Naturaleza de las recomendaciones</h2>
              <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                <p className="text-white/80">
                  <strong className="text-yellow-400">Importante:</strong> Las recomendaciones proporcionadas por ARES34
                  son generadas por inteligencia artificial y tienen carácter informativo y orientativo.
                  No constituyen asesoría legal, fiscal, financiera ni de inversión profesional.
                </p>
                <p className="mt-2 text-white/80">
                  Siempre consulta con profesionales calificados antes de tomar decisiones importantes
                  para tu negocio. ARES34 no se hace responsable por decisiones tomadas con base
                  en las recomendaciones del Servicio.
                </p>
              </div>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. Registro y cuenta</h2>
              <p>Para utilizar el Servicio debes:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Ser mayor de 18 años</li>
                <li>Proporcionar información veraz y actualizada</li>
                <li>Mantener la confidencialidad de tus credenciales de acceso</li>
                <li>Notificarnos inmediatamente si sospechas de uso no autorizado de tu cuenta</li>
              </ul>
              <p className="mt-2">
                Puedes registrarte con correo electrónico y contraseña, o mediante tu cuenta de Google.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. Suscripción y pagos</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>El plan Fundador tiene un costo de <strong className="text-white/90">$99 USD al mes</strong></li>
                <li>El pago se procesa mensualmente a través de Stripe</li>
                <li>Ofrecemos una <strong className="text-white/90">garantía de devolución de 30 días</strong> — si no estás satisfecho en los primeros 30 días, te devolvemos tu dinero sin preguntas</li>
                <li>Puedes cancelar tu suscripción en cualquier momento; tendrás acceso hasta el final del período pagado</li>
                <li>No hay contratos a largo plazo ni penalizaciones por cancelación</li>
              </ul>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">6. Uso aceptable</h2>
              <p>Al utilizar el Servicio, te comprometes a no:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Utilizar el Servicio para fines ilegales o no autorizados</li>
                <li>Intentar acceder a cuentas o datos de otros usuarios</li>
                <li>Realizar ingeniería inversa del sistema de agentes de IA</li>
                <li>Automatizar el acceso al Servicio mediante bots o scripts</li>
                <li>Compartir tu cuenta con terceros</li>
                <li>Revender o redistribuir las recomendaciones del Servicio como propias</li>
              </ul>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">7. Propiedad intelectual</h2>
              <p>
                Todo el contenido del Servicio, incluyendo la interfaz, diseño, código, agentes de IA
                y prompts del sistema, es propiedad de ARES34 y está protegido por las leyes de
                propiedad intelectual aplicables.
              </p>
              <p className="mt-2">
                Las recomendaciones generadas para ti son para tu uso personal y profesional.
                Puedes utilizarlas en tu toma de decisiones, pero no puedes redistribuirlas comercialmente.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">8. Confidencialidad</h2>
              <p>
                Entendemos que compartes información sensible de tu negocio con el Servicio.
                Nos comprometemos a:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Tratar toda tu información como confidencial</li>
                <li>No utilizar tus datos para entrenar modelos de IA</li>
                <li>No compartir tus consultas ni respuestas con otros usuarios</li>
                <li>Implementar las medidas de seguridad descritas en nuestro Aviso de Privacidad</li>
              </ul>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">9. Disponibilidad del servicio</h2>
              <p>
                Nos esforzamos por mantener el Servicio disponible 24/7, pero no garantizamos
                disponibilidad ininterrumpida. Podemos realizar mantenimiento programado o
                experimentar interrupciones por causas ajenas a nuestro control.
              </p>
              <p className="mt-2">
                Los tiempos de respuesta de los agentes de IA dependen de la complejidad de la
                consulta y la carga del sistema.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">10. Limitación de responsabilidad</h2>
              <p>
                En la máxima medida permitida por la ley, ARES34 no será responsable por:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Pérdidas o daños derivados de decisiones tomadas con base en las recomendaciones del Servicio</li>
                <li>Interrupciones del Servicio o pérdida de datos</li>
                <li>Daños indirectos, incidentales o consecuentes</li>
              </ul>
              <p className="mt-2">
                Nuestra responsabilidad total se limita al monto pagado por el usuario en los
                últimos 3 meses de suscripción.
              </p>
            </section>

            {/* 11 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">11. Legislación aplicable</h2>
              <p>
                Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier
                controversia se someterá a los tribunales competentes de la Ciudad de México.
              </p>
            </section>

            {/* 12 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">12. Modificaciones</h2>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento.
                Los cambios entrarán en vigor al publicarse en esta página. Si los cambios son
                significativos, te notificaremos por correo electrónico con al menos 15 días de anticipación.
              </p>
            </section>

            {/* 13 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">13. Contacto</h2>
              <p>
                Para cualquier consulta sobre estos términos, contáctanos en:{' '}
                <span className="text-white">soporte@ares34.com</span>
              </p>
            </section>
          </div>

          {/* Footer links */}
          <div className="mt-16 pt-8 border-t border-white/[0.08] flex items-center justify-between">
            <Link href="/" className="text-white/40 text-xs hover:text-white/60 transition-colors">
              ← Volver al inicio
            </Link>
            <Link href="/privacy" className="text-white/40 text-xs hover:text-white/60 transition-colors">
              Aviso de Privacidad →
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
