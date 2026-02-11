# ARES34 - Sistema de Inteligencia Ejecutiva

ARES34 es un sistema de inteligencia ejecutiva impulsado por IA que simula un consejo directivo virtual para fundadores y dueños de PyMEs en México. Clasifica automáticamente tus preguntas de negocio en tres niveles de gobierno (CEO, Board, Asamblea) y convoca al grupo de agentes especialistas correcto para deliberar y darte una recomendación unificada y accionable. Todo opera en contexto mexicano: fiscal (SAT, IMSS), legal (LFT, LFPDPPP) y de mercado local.

## Requisitos

- **Node.js** 18+ (recomendado 20+)
- **Cuenta de Supabase** (plan gratuito funciona)
- **API Key de Anthropic** (modelo Claude Sonnet 4.5)
- **npm** (incluido con Node.js)

## Setup paso a paso

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd ares34-mvp
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y agrega tus credenciales:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...tu-service-role-key
ANTHROPIC_API_KEY=sk-ant-...tu-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Donde obtener cada valor:**
- **Supabase URL y keys**: Ve a tu proyecto en [supabase.com](https://supabase.com) > Settings > API
- **Anthropic API Key**: Ve a [console.anthropic.com](https://console.anthropic.com) > API Keys

### 4. Configurar la base de datos en Supabase

Ve al **SQL Editor** en tu dashboard de Supabase y ejecuta los scripts en este orden:

```sql
-- Primero: crear tablas, indexes y RLS
-- Copia y pega el contenido de: database/schema.sql

-- Segundo: insertar arquetipos pre-cargados
-- Copia y pega el contenido de: database/seed-data.sql
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 6. Flujo de primer uso

1. Regístrate con correo y contraseña
2. Completa el onboarding (3 pasos): configura tus KPIs, elige tu 5to consejero
3. Haz tu primera consulta a ARES

## Arquitectura de agentes

| Nivel | Agentes | Tiempo estimado |
|-------|---------|-----------------|
| **CEO** | 1 agente personalizado con tus KPIs | ~6 segundos |
| **Board** | CFO + CMO + CLO + CHRO + tu 5to consejero (en paralelo) + sintetizador | ~17 segundos |
| **Asamblea** | VC + LP + Family Office (en paralelo) + sintetizador | ~12 segundos |

## Stack tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: API Routes de Next.js, Supabase (Auth + PostgreSQL)
- **IA**: Anthropic API (Claude Sonnet 4.5)

## Deploy en Vercel

### 1. Conecta tu repositorio

Ve a [vercel.com](https://vercel.com), crea un nuevo proyecto y conecta tu repositorio de GitHub.

### 2. Configura las variables de entorno

En el dashboard de Vercel, ve a **Settings > Environment Variables** y agrega:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

### 3. Configura Supabase para producción

En tu proyecto de Supabase, ve a **Authentication > URL Configuration** y agrega tu dominio de Vercel a las URLs permitidas:

```
https://tu-dominio.vercel.app
```

### 4. Despliega

Vercel desplegará automáticamente con cada push a la rama principal. El primer deploy se dispara al conectar el repositorio.

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/login/          # Login y registro
│   ├── (dashboard)/           # Dashboard, onboarding, settings
│   └── api/                   # Endpoints: ares, config, conversations
├── components/
│   ├── layout/                # Navbar, DashboardLayout
│   ├── ui/                    # Componentes shadcn/ui
│   ├── ARESResponse.tsx       # Visualización de respuestas
│   ├── LevelBadge.tsx         # Badge de nivel con color
│   ├── PerspectiveCard.tsx    # Card colapsable por perspectiva
│   ├── RecommendationCard.tsx # Card de recomendación unificada
│   └── ClassificationInfo.tsx # Confianza y complejidad
├── lib/
│   ├── supabase.ts            # Clientes Supabase (browser + server)
│   ├── anthropic.ts           # Wrapper API Anthropic
│   ├── prompts.ts             # 16 system prompts en español
│   ├── ares-engine.ts         # Motor de orquestación
│   └── types.ts               # Interfaces TypeScript
└── middleware.ts               # Protección de rutas (auth)
```
