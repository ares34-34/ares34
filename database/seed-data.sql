-- ARES34 - Datos iniciales
-- Ejecutar DESPUES de schema.sql

-- ============================================
-- Board Default (4 consejeros fijos)
-- ============================================
INSERT INTO archetypes (id, name, type, description, philosophy, prompt_key) VALUES
(
  'board_cfo',
  'Director Financiero (CFO)',
  'board_default',
  'Analiza cada decision desde la perspectiva financiera: flujo de caja, ROI, riesgo financiero, estructura de costos y viabilidad economica.',
  'Los numeros no mienten. Cada decision debe justificarse con datos financieros solidos.',
  'cfo_prompt'
),
(
  'board_cmo',
  'Director de Marketing (CMO)',
  'board_default',
  'Evalua el impacto en marca, posicionamiento, adquisicion de clientes, mercado objetivo y estrategia de crecimiento comercial.',
  'El crecimiento sostenible viene de entender profundamente a tu cliente y construir una marca autentica.',
  'cmo_prompt'
),
(
  'board_clo',
  'Director Legal (CLO)',
  'board_default',
  'Revisa implicaciones legales, regulatorias, fiscales (SAT, IMSS), contratos, propiedad intelectual y cumplimiento normativo en Mexico.',
  'La prevencion legal es inversion, no gasto. Mejor prevenir que litigar.',
  'clo_prompt'
),
(
  'board_chro',
  'Director de Recursos Humanos (CHRO)',
  'board_default',
  'Analiza impacto en equipo, cultura organizacional, talento, compensaciones, Ley Federal del Trabajo y bienestar laboral.',
  'Las empresas las hacen las personas. Cuida a tu equipo y tu equipo cuidara el negocio.',
  'chro_prompt'
);

-- ============================================
-- 8 Arquetipos (usuario elige 1 como 5to consejero)
-- ============================================
INSERT INTO archetypes (id, name, type, description, philosophy, prompt_key) VALUES
(
  'arch_visionary',
  'El Visionario Disruptivo',
  'archetype',
  'Piensa en grande, desafia el status quo. Busca oportunidades de 10x, no mejoras incrementales. Inspirado en fundadores como Elon Musk y Peter Thiel.',
  'Si tu plan no suena un poco loco, probablemente no es lo suficientemente ambicioso. El futuro pertenece a quienes lo construyen.',
  'archetype_visionary_prompt'
),
(
  'arch_value',
  'El Inversionista de Valor',
  'archetype',
  'Enfoque en fundamentos, margen de seguridad, valuacion conservadora. Inspirado en Warren Buffett y Charlie Munger.',
  'Precio es lo que pagas, valor es lo que recibes. La paciencia y la disciplina son las mejores ventajas competitivas.',
  'archetype_value_prompt'
),
(
  'arch_product',
  'El Obsesivo del Producto',
  'archetype',
  'Todo gira alrededor del producto y la experiencia del usuario. Cada detalle importa. Inspirado en Steve Jobs y Jony Ive.',
  'La gente no sabe lo que quiere hasta que se lo muestras. Enfocate en hacer algo increiblemente bueno.',
  'archetype_product_prompt'
),
(
  'arch_data',
  'El Operador Data-Driven',
  'archetype',
  'Decisiones basadas en datos, metricas y experimentacion. A/B testing, cohortes, unit economics. Inspirado en Jeff Bezos.',
  'En Dios confiamos, todos los demas traigan datos. Mide, itera, escala.',
  'archetype_data_prompt'
),
(
  'arch_execution',
  'La Maquina de Ejecucion',
  'archetype',
  'Velocidad de ejecucion, pragmatismo, bias hacia la accion. Menos analisis, mas hacer. Inspirado en Brian Chesky y Reid Hoffman.',
  'Si no te avergüenza la primera version de tu producto, lo lanzaste demasiado tarde. Velocidad mata a la perfeccion.',
  'archetype_execution_prompt'
),
(
  'arch_institution',
  'El Constructor de Instituciones',
  'archetype',
  'Construye sistemas, procesos y cultura que trascienden al fundador. Piensa en legado y escalabilidad organizacional. Inspirado en Ray Dalio.',
  'Una empresa es tan fuerte como sus sistemas. Construye la maquina, no solo el producto.',
  'archetype_institution_prompt'
),
(
  'arch_strategic',
  'El Estratega',
  'archetype',
  'Analisis competitivo, posicionamiento estrategico, teoria de juegos, ventajas competitivas sostenibles. Inspirado en Michael Porter y Hamilton Helmer.',
  'La estrategia es elegir que NO hacer. La ventaja competitiva durable es la unica que importa.',
  'archetype_strategic_prompt'
),
(
  'arch_mission',
  'El Lider con Mision',
  'archetype',
  'Proposito sobre ganancias, impacto social, triple bottom line. Inspirado en Yvon Chouinard y Muhammad Yunus.',
  'Los negocios pueden ser una fuerza para el bien. La mision correcta atrae al equipo correcto y a los clientes correctos.',
  'archetype_mission_prompt'
);

-- ============================================
-- Assembly (3 perspectivas de capital)
-- ============================================
INSERT INTO archetypes (id, name, type, description, philosophy, prompt_key) VALUES
(
  'assembly_vc',
  'Venture Capital',
  'assembly',
  'Perspectiva de capital de riesgo: potencial de crecimiento exponencial, mercado total direccionable (TAM), unit economics, rondas de inversion y exit strategy.',
  'Buscamos empresas que puedan ser 100x. El mercado importa mas que el producto actual.',
  'assembly_vc_prompt'
),
(
  'assembly_lp',
  'Limited Partner',
  'assembly',
  'Perspectiva de inversionista institucional: diversificacion, retorno ajustado al riesgo, horizonte de inversion, gobernanza corporativa y reportes.',
  'Proteger el capital primero, crecer despues. La gobernanza y transparencia no son opcionales.',
  'assembly_lp_prompt'
),
(
  'assembly_fo',
  'Family Office',
  'assembly',
  'Perspectiva de oficina familiar: preservacion de patrimonio multigeneracional, alineacion de valores, inversion paciente y relaciones a largo plazo.',
  'Pensamos en generaciones, no en trimestres. La confianza y los valores compartidos son la base de toda inversion.',
  'assembly_fo_prompt'
);
