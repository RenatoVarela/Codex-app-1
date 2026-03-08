# 📚 THE CODEX — AI-Powered Personal Knowledge Base

> *Your documents. Your knowledge. Your library.*

---

## 🏛️ Visión del Proyecto

The Codex es una aplicación web tipo "Second Brain" donde los usuarios suben sus documentos (PDFs, Markdown, texto plano, URLs) y pueden hacer preguntas en lenguaje natural sobre su propio contenido. Usando Retrieval-Augmented Generation (RAG), la IA responde con citas exactas de los documentos originales, eliminando alucinaciones y proporcionando respuestas verificables.

La temática visual es una **biblioteca clásica**: estanterías de madera, tonos cálidos parchment/gold, tipografía serif elegante, y metáforas de libros en toda la UI. Cada documento subido es un "tomo" en tu biblioteca personal.

---

## 🎯 Por Qué Este Proyecto Importa

- RAG es una de las skills más buscadas en roles full-stack/AI-enhanced en 2026.
- Demuestra habilidades reales: manejo de archivos, procesamiento de documentos, vector databases, embeddings, streaming, auth, state management moderno.
- Diferenciador: pocos devs tienen RAG con documentos propios + citas verificables + animaciones inmersivas. La mayoría solo tiene chatbots genéricos.
- Es "meta": úsalo tú mismo para organizar tus notas/proyectos. En entrevistas dices "mira, lo uso daily" → impacto real.
- Costo de mantenimiento: $0/mes con el stack elegido (todo en free tiers).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Frontend/Full-Stack** | Next.js 15+ (App Router) | Server Components, Server Actions, RSC streaming |
| **Lenguaje** | TypeScript (strict mode) | Type safety end-to-end |
| **Auth** | Clerk | Integración nativa con Next.js App Router, componentes listos, middleware simple |
| **Base de Datos** | Supabase (PostgreSQL + pgvector) | DB + vector store en un solo servicio. Búsqueda híbrida (semantic + full-text) sin servicios extra |
| **ORM** | Prisma | Type-safe queries, migraciones, compatible con pgvector via extensión |
| **Embeddings + Reranking** | Voyage AI (voyage-3-lite) | Superior en retrieval benchmarks. Free tier generoso. Reranking incluido |
| **LLM Principal** | Google Gemini 2.5 Flash | Free tier permanente: 10 RPM, 250 RPD. Sin tarjeta de crédito |
| **Streaming / AI** | Vercel AI SDK | Reemplaza LangChain. Soporte nativo para RAG patterns, streaming, tool calling |
| **State (Client)** | Zustand | Lightweight (~1kb), hook-based, zero boilerplate. UI state, tema, sidebar |
| **State (Server)** | TanStack Query v5 | Cache inteligente, optimistic updates, background refetching. Documentos y conversaciones |
| **Animaciones** | Motion (Framer Motion) | 3.6M+ descargas/semana. API declarativa, AnimatePresence, gestures, scroll, layout animations |
| **Almacenamiento** | Vercel Blob | Serverless file storage. Free tier suficiente |
| **UI Framework** | shadcn/ui + Tailwind CSS v4 | Componentes customizables. Tema biblioteca personalizado |
| **Markdown Render** | React Markdown | Renderizado de citas y respuestas del chat |
| **Testing** | Vitest + Playwright | Unit + E2E testing |
| **Deploy** | Vercel | Todo serverless. Free tier |

### Decisiones Técnicas Clave

**¿Por qué NO LangChain.js?** El Vercel AI SDK maneja RAG patterns directamente con menos abstracciones. Código más limpio, menos dependencias, y demuestras que entiendes el pipeline sin depender de un framework que lo oculte. En entrevistas esto pesa más.

**¿Por qué Zustand y no Redux?** Zustand es el estándar moderno en 2026 para apps React de escala media. Zero boilerplate, API basada en hooks, bundle tiny (~1kb), y se integra perfectamente con TanStack Query. Redux sería overkill para este proyecto.

**¿Por qué TanStack Query?** Maneja todo el server state (documentos, conversaciones, chunks) con cache automático, background refetching, optimistic updates, y estados de loading/error. Zustand se encarga solo del client state (UI, tema, sidebar). Esta separación es una best practice moderna que demuestra madurez técnica.

**¿Por qué Motion (Framer Motion)?** Es la librería de animaciones más popular para React. API declarativa que permite crear las animaciones del tema biblioteca (libros inclinándose, páginas pasándose, elementos apareciendo al scroll) con código limpio y performante. Soporta AnimatePresence para exit animations, layout animations, gestures, y scroll-triggered animations.

**¿Por qué Supabase pgvector y no Pinecone?** Ya estamos en PostgreSQL con Prisma, así que tener embeddings en la misma base de datos simplifica la arquitectura: una sola fuente de verdad, menos servicios, y búsqueda híbrida (semantic + full-text) nativa sin APIs extra.

---

## 🏗️ Arquitectura del Sistema

### Pipeline RAG (Flujo Principal)

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐
│  Upload  │───▶│  Extracción  │───▶│   Chunking   │───▶│ Embeddings│
│  (Blob)  │    │  (pdf-parse) │    │ (semántico)  │    │ (Voyage)  │
└──────────┘    └──────────────┘    └──────────────┘    └─────┬─────┘
                                                              │
                                                              ▼
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐
│ Response │◀───│   Gemini     │◀───│  Reranking   │◀───│  Hybrid   │
│(streaming│    │   Flash      │    │  (Voyage)    │    │  Search   │
│ + citas) │    │              │    │              │    │ (pgvector │
└──────────┘    └──────────────┘    └──────────────┘    │+ fulltext)│
                                                        └───────────┘
```

1. **Ingestión:** Usuario sube documento → extracción de texto (pdf-parse para PDFs, parsers para MD/TXT) → chunking semántico con overlap.
2. **Indexación:** Cada chunk → Voyage AI genera embedding → almacenado en Supabase pgvector junto con metadatos (documento_id, posición, texto original).
3. **Retrieval:** Usuario hace pregunta → se genera embedding de la query → búsqueda híbrida (cosine similarity en pgvector + full-text search en PostgreSQL) → top-K chunks relevantes.
4. **Reranking:** Los chunks recuperados pasan por Voyage Rerank para reordenar por relevancia real (mejora dramática en precisión).
5. **Generación:** Chunks rerankeados + pregunta original → prompt a Gemini Flash → respuesta con streaming + citas inline que referencian los documentos originales.

### Estrategia de Chunking

- Dividir por párrafos/secciones naturales del documento (NO por tamaño fijo).
- Overlap de 10-15% entre chunks para mantener contexto.
- Tamaño objetivo: 200-500 tokens por chunk.
- Preservar metadatos: número de página, sección, título del heading más cercano.

### Búsqueda Híbrida

- **Semántica:** cosine similarity contra embeddings en pgvector.
- **Keyword:** full-text search nativo de PostgreSQL (ts_vector/ts_query).
- **Score final:** weighted combination (ej: 0.7 semántico + 0.3 keyword).
- Resuelve casos donde la búsqueda semántica falla con términos técnicos o nombres propios.
- Todo vive en Supabase sin servicios adicionales.

### Arquitectura de Estado

```
┌─────────────────────────────────────────────────────┐
│                   ESTADO DE LA APP                   │
├─────────────────────────┬───────────────────────────┤
│    ZUSTAND (Client)     │  TANSTACK QUERY (Server)  │
├─────────────────────────┼───────────────────────────┤
│ • UI sidebar open/close │ • Lista de documentos     │
│ • Tema (light/dark)     │ • Conversaciones          │
│ • Chat input draft      │ • Mensajes del chat       │
│ • Modal states          │ • Detalles de documento   │
│ • Active document ID    │ • Búsqueda de chunks      │
│ • Upload progress       │ • Perfil de usuario       │
│ • Animation triggers    │ • Estado de indexación     │
└─────────────────────────┴───────────────────────────┘
```

**Regla clara:** Zustand = estado que solo vive en el cliente (UI, preferencias). TanStack Query = datos que vienen del servidor (documentos, conversaciones, etc.).

---

## ✨ Features Principales

### Core (MVP)

- Registro/login con Clerk + dashboard personal ("Mi Biblioteca").
- Subida múltiple de archivos: PDF, MD, TXT, URLs. Procesamiento background via Server Actions.
- Indexación automática: chunking semántico + embeddings Voyage AI → store en Supabase pgvector.
- Chat interface: pregunta → retrieve chunks → rerank → prompt a Gemini → respuesta con citas inline (links a secciones exactas del documento).
- Streaming de respuestas con Vercel AI SDK.
- Historial de conversaciones por documento y global.
- Resumen automático al subir cada documento.

### Diferenciadores (Post-MVP)

- Búsqueda híbrida: keyword + semantic en una sola query.
- Reranking con Voyage Rerank para precisión superior.
- Evaluación de RAG: métricas de faithfulness y relevancy (RAGAS). Mostrar en README.
- Exportar respuestas como Markdown o PDF.
- Diseño model-agnostic: switch entre proveedores de LLM (Gemini gratis por defecto, Claude como opción premium).
- Rate limiting por usuario para evitar abusos del free tier.
- Dark mode ("Modo Nocturno" — biblioteca de noche).

---

## 🎨 Tema Visual: La Biblioteca

### Paleta de Colores — Light Mode

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--color-wood-dark` | `#3E2723` | Headers, sidebar background, nav principal |
| `--color-wood-warm` | `#5D4037` | Texto de headings, bordes activos |
| `--color-parchment` | `#FFF8E1` | Background principal (como papel viejo) |
| `--color-gold` | `#C6893F` | CTAs, links, iconos activos, decoraciones |
| `--color-cream` | `#FFFDE7` | Cards, chat bubbles, áreas de contenido |
| `--color-leather` | `#8D6E63` | Bordes, separadores, texto secundario |
| `--color-ink-green` | `#2E7D32` | Citas verificadas, indicadores de éxito |
| `--color-ink-red` | `#C62828` | Errores, alertas, estados destructivos |

### Paleta de Colores — Dark Mode ("Biblioteca de Noche")

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--color-night-bg` | `#1A1A2E` | Background principal |
| `--color-night-surface` | `#16213E` | Sidebar, cards, superficies elevadas |
| `--color-night-border` | `#0F3460` | Bordes, elementos secundarios |
| `--color-night-gold` | `#E2B049` | Acentos, CTAs (más brillante que light mode) |
| `--color-night-text` | `#F5E6CC` | Texto principal |
| `--color-night-muted` | `#D4A574` | Texto secundario, efecto lámpara de escritorio |

### Metáforas de UI

- **Dashboard** = "Mi Biblioteca" con estanterías visuales de documentos.
- **Cada documento** = un "Tomo" con lomo de color, título serif, y badge de número de páginas.
- **Chat** = "Consultar al Bibliotecario" — la IA responde como un bibliotecario experto.
- **Upload zone** = "Donar un Libro" con animación de libro abriéndose.
- **Citas** = aparecen como notas al pie con referencia al tomo/página.
- **Sidebar** = estantería con los tomos organizados por colección.
- **Loading states** = animación de páginas pasándose.
- **Empty states** = biblioteca vacía con mensaje invitando a subir primer tomo.

### Tipografía

- **Headings:** Playfair Display (serif display, personalidad de biblioteca).
- **Body:** Lora (serif legible, cálida, excelente para lectura).
- **UI/Labels:** Inter (sans-serif limpia para elementos de interfaz pequeños).
- **Code/monospace:** JetBrains Mono (para code blocks en citas técnicas).

### Animaciones con Motion (Framer Motion)

Las animaciones son parte integral de la experiencia de biblioteca:

**Entrada de elementos (whileInView + stagger):**
- Los "tomos" en la estantería aparecen con stagger (uno tras otro) al cargar el dashboard.
- Efecto de libro deslizándose desde la estantería al abrir un documento.

**Hover y Gestures (whileHover, whileTap):**
- Los tomos se inclinan ligeramente al hover (rotateY sutil + scale).
- El lomo del libro se ilumina con un glow dorado al hover.
- Botones con efecto de presión satisfactorio (whileTap scale: 0.95).

**Transiciones de página (AnimatePresence):**
- Transición entre vistas con efecto de página pasándose.
- Chat messages aparecen con fade-in + slide-up suave.
- Modal de upload con efecto de libro abriéndose (scaleY de 0 a 1).

**Scroll animations (useScroll, whileInView):**
- Parallax sutil en el header de la biblioteca.
- Elementos que aparecen al scroll con fade + translate.

**Layout animations:**
- Sidebar que se expande/contrae con layout animation fluida.
- Grid de documentos que se reorganiza suavemente al filtrar/buscar.

**Loading states:**
- Skeleton loaders con shimmer effect en tono parchment.
- Spinner de carga = animación de páginas rotando como un libro.
- Streaming text con animación de "máquina de escribir" para las respuestas del bibliotecario.

### Detalles Visuales

- Texturas sutiles de papel/parchment en backgrounds (via CSS o SVG patterns).
- Bordes con estilo de encuadernación en cards (border + box-shadow cálidas).
- Sombras cálidas: usar marrones suaves, nunca grises puros.
- Dark mode = fondos deep navy/charcoal, acentos gold más brillantes, efecto de lámpara de escritorio (radial gradient sutil detrás del área de chat).

---

## 🗃️ Esquema de Base de Datos

### users
Sincronizado con Clerk via webhooks.
- `id` (UUID, PK)
- `clerkId` (string, unique)
- `email` (string)
- `name` (string)
- `createdAt` (timestamp)
- `plan` (enum: free/premium)

### documents ("Tomos")
- `id` (UUID, PK)
- `userId` (FK → users)
- `title` (string)
- `originalName` (string)
- `fileUrl` (string — Vercel Blob URL)
- `fileType` (enum: pdf/md/txt/url)
- `summary` (text — generado por IA)
- `totalChunks` (integer)
- `status` (enum: processing/ready/error)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### chunks
- `id` (UUID, PK)
- `documentId` (FK → documents, cascade delete)
- `content` (text — texto del chunk)
- `embedding` (vector(1024) via pgvector — dimensión de voyage-3-lite)
- `chunkIndex` (integer)
- `pageNumber` (integer, nullable)
- `sectionTitle` (string, nullable)
- `tokenCount` (integer)
- `metadata` (JSONB)

### conversations
- `id` (UUID, PK)
- `userId` (FK → users)
- `documentId` (FK → documents, nullable — null = búsqueda global)
- `title` (string)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### messages
- `id` (UUID, PK)
- `conversationId` (FK → conversations, cascade delete)
- `role` (enum: user/assistant)
- `content` (text)
- `citations` (JSONB array — chunk_ids + texto citado + página)
- `createdAt` (timestamp)

---

## 💰 Costos de Mantenimiento

**Objetivo: $0/mes para mantener en portfolio.**

| Servicio | Costo Mensual | Límites Free Tier |
|----------|:------------:|-------------------|
| Gemini 2.5 Flash (LLM) | **$0** | 10 RPM, 250 RPD, 250K TPM. Sin tarjeta |
| Voyage AI (Embeddings) | **$0** | Créditos iniciales generosos. Reranking incluido |
| Supabase (DB + pgvector) | **$0** | 500 MB database, 1 GB storage, 2 GB bandwidth |
| Clerk (Auth) | **$0** | 10,000 MAU |
| Vercel (Deploy + Blob) | **$0** | 100 GB bandwidth, serverless functions incluidas |
| **TOTAL** | **$0/mes** | Suficiente para portfolio + demos en entrevistas |

**Nota:** Diseño model-agnostic permite switch a Claude cargando ~$5 ese mes si quieres demo premium.

---

## 📅 Timeline Estimado

| Fase | Tareas | Entregable |
|------|--------|------------|
| **Semana 1-2** | Setup proyecto + docs/standards + Clerk auth + Supabase + Prisma schema + Zustand stores + TanStack Query providers + Upload a Vercel Blob + Extracción de texto básica + Layout biblioteca básico | Auth funcional + subida de docs + dashboard básico con tema |
| **Semana 3-4** | Chunking semántico + Voyage AI embeddings + pgvector indexación + RAG pipeline (sin reranking) + Chat UI con Vercel AI SDK + Streaming + Motion animations básicas (stagger, hover) | Chat funcional con respuestas + citas básicas |
| **Semana 5-6** | Reranking Voyage + Búsqueda híbrida + Citas inline mejoradas + Historial de conversaciones + Resumen auto de docs + Tema biblioteca completo con todas las animaciones Motion + Dark mode | App pulida con todos los diferenciadores |
| **Semana 7+** | Tests (Vitest + Playwright) + Evaluación RAG (RAGAS) + Responsive mobile + Export MD/PDF + README con screenshots/GIFs/métricas + Model-agnostic switch | Production-ready. Portfolio-ready. |

---

## 🔑 Cuentas a Crear

Ninguna requiere tarjeta de crédito:

1. **Vercel** (vercel.com) — deploy + Vercel Blob
2. **Supabase** (supabase.com) — PostgreSQL + pgvector
3. **Clerk** (clerk.com) — autenticación
4. **Google AI Studio** (ai.google.dev) — API key de Gemini
5. **Voyage AI** (voyageai.com) — embeddings + reranking
6. **GitHub** (github.com) — repositorio + CI/CD con Vercel

---

## 🎯 Estructura del Proyecto

```
the-codex/
│
├── docs/                                # 📖 Documentación del proyecto
│   ├── PROJECT_SPEC.md                  # ← ESTE archivo (spec completa del proyecto)
│   ├── plans/                           # Planes de implementación paso a paso
│   │   ├── plan-001-project-setup.md    # Plan: setup inicial del proyecto
│   │   ├── plan-002-auth-clerk.md       # Plan: implementación de auth
│   │   ├── plan-003-database-schema.md  # Plan: Supabase + Prisma + pgvector
│   │   └── ...                          # Un plan por feature/fase
│   ├── features/                        # Specs detalladas de cada feature
│   │   ├── feat-upload-pipeline.md      # Spec: pipeline de upload de documentos
│   │   ├── feat-rag-chat.md             # Spec: chat con RAG completo
│   │   ├── feat-hybrid-search.md        # Spec: búsqueda híbrida
│   │   └── ...
│   ├── decisions/                       # Architecture Decision Records (ADRs)
│   │   ├── adr-001-no-langchain.md      # ADR: Por qué no LangChain
│   │   ├── adr-002-pgvector-over-pinecone.md
│   │   ├── adr-003-zustand-over-redux.md
│   │   ├── adr-004-motion-for-animations.md
│   │   └── ...
│   ├── standards/                       # Estándares y convenciones del proyecto
│   │   ├── CODE_STANDARDS.md            # Convenciones TypeScript, naming, imports
│   │   ├── UI_STANDARDS.md              # Design tokens, tema biblioteca, componentes
│   │   ├── TESTING_STANDARDS.md         # Estrategia de testing, qué testear
│   │   ├── API_STANDARDS.md             # Convenciones API routes / Server Actions
│   │   └── GIT_STANDARDS.md             # Branching, commits convencionales, PRs
│   ├── reviews/                         # Reviews de features completadas
│   │   └── ...
│   └── roadmap/
│       └── ROADMAP.md                   # Sprint tracking y progreso general
│
├── src/                                 # 🏠 Todo el código fuente
│   │
│   ├── app/                             # Next.js App Router (rutas y API)
│   │   ├── (marketing)/                 # Grupo: rutas públicas
│   │   │   ├── page.tsx                 # Landing page de The Codex
│   │   │   └── layout.tsx               # Layout sin sidebar
│   │   ├── (auth)/                      # Grupo: rutas de autenticación
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (dashboard)/                 # Grupo: rutas protegidas (requieren auth)
│   │   │   ├── layout.tsx               # Layout con sidebar biblioteca
│   │   │   ├── library/page.tsx         # "Mi Biblioteca" — dashboard principal
│   │   │   ├── document/[id]/page.tsx   # Vista de "Tomo" individual
│   │   │   ├── chat/page.tsx            # Chat global (todos los documentos)
│   │   │   └── chat/[conversationId]/page.tsx  # Conversación específica
│   │   ├── api/                         # API Routes (backend)
│   │   │   ├── documents/
│   │   │   │   ├── route.ts             # GET (list) / POST (create + upload)
│   │   │   │   └── [id]/route.ts        # GET / PATCH / DELETE documento
│   │   │   ├── chat/route.ts            # POST — streaming chat (Vercel AI SDK)
│   │   │   ├── search/route.ts          # POST — búsqueda híbrida
│   │   │   ├── embeddings/route.ts      # POST — trigger indexación de documento
│   │   │   └── webhooks/clerk/route.ts  # POST — sync usuarios Clerk → DB
│   │   ├── layout.tsx                   # Root layout (providers, fonts, metadata)
│   │   └── globals.css                  # Tailwind base + CSS variables del tema
│   │
│   ├── components/                      # Componentes React
│   │   ├── ui/                          # shadcn/ui (generados via CLI)
│   │   │   └── ...                      # button, dialog, input, skeleton, etc.
│   │   ├── library/                     # Dominio: Biblioteca
│   │   │   ├── book-shelf.tsx           # Grid de estantería con documentos
│   │   │   ├── book-card.tsx            # Card de "tomo" individual
│   │   │   ├── book-spine.tsx           # Lomo de libro (para sidebar)
│   │   │   ├── upload-zone.tsx          # "Donar un Libro" — drag & drop
│   │   │   ├── document-viewer.tsx      # Visor de contenido del documento
│   │   │   ├── document-summary.tsx     # Resumen generado por IA
│   │   │   └── empty-library.tsx        # Estado vacío
│   │   ├── chat/                        # Dominio: Chat RAG
│   │   │   ├── chat-interface.tsx       # Container principal del chat
│   │   │   ├── message-bubble.tsx       # Burbuja (user/assistant)
│   │   │   ├── citation-card.tsx        # Card de cita → tomo/página
│   │   │   ├── chat-input.tsx           # Input con submit
│   │   │   └── streaming-text.tsx       # Texto con animación streaming
│   │   ├── motion/                      # Primitivas de animación reutilizables
│   │   │   ├── fade-in.tsx              # Fade al entrar en viewport
│   │   │   ├── stagger-children.tsx     # Stagger para listas
│   │   │   ├── page-transition.tsx      # Transición entre páginas
│   │   │   ├── book-tilt.tsx            # Efecto tilt 3D en hover
│   │   │   └── slide-in.tsx             # Slide desde cualquier dirección
│   │   ├── layout/                      # Shell / navegación
│   │   │   ├── sidebar.tsx              # Sidebar estantería
│   │   │   ├── header.tsx               # Header con búsqueda
│   │   │   ├── theme-toggle.tsx         # Switch light/dark
│   │   │   └── mobile-nav.tsx           # Nav móvil
│   │   └── providers/                   # React context providers
│   │       ├── query-provider.tsx       # TanStack Query provider
│   │       └── theme-provider.tsx       # Theme provider (next-themes o custom)
│   │
│   ├── stores/                          # Zustand stores (client state only)
│   │   ├── ui-store.ts                  # Sidebar, modals, active views
│   │   ├── chat-store.ts               # Draft input, active document selection
│   │   └── theme-store.ts              # Light/dark mode preference
│   │
│   ├── hooks/                           # Custom React hooks
│   │   ├── queries/                     # TanStack Query hooks (server state)
│   │   │   ├── use-documents.ts         # CRUD documentos + cache invalidation
│   │   │   ├── use-conversations.ts     # Lista/create conversaciones
│   │   │   ├── use-messages.ts          # Mensajes de una conversación
│   │   │   └── use-document-status.ts   # Polling estado de indexación
│   │   ├── use-chat.ts                  # Hook de chat con streaming
│   │   ├── use-search.ts               # Búsqueda híbrida
│   │   └── use-upload.ts               # Upload con progreso
│   │
│   ├── lib/                             # Lógica de negocio y utilidades
│   │   ├── clients/                     # Clientes de servicios externos
│   │   │   ├── supabase.ts             # Cliente Supabase (server + browser)
│   │   │   ├── prisma.ts               # Singleton Prisma client
│   │   │   ├── voyage.ts               # Cliente Voyage AI (embeddings + rerank)
│   │   │   └── gemini.ts               # Config Gemini para Vercel AI SDK
│   │   ├── rag/                         # Pipeline RAG (core del proyecto)
│   │   │   ├── chunking.ts             # Chunking semántico con overlap
│   │   │   ├── embeddings.ts           # Generar embeddings via Voyage
│   │   │   ├── retrieval.ts            # Búsqueda híbrida (semantic + fulltext)
│   │   │   ├── reranking.ts            # Reranking via Voyage Rerank
│   │   │   ├── generation.ts           # Prompt construction + streaming response
│   │   │   └── pipeline.ts             # Orquestador: query → retrieve → rerank → generate
│   │   ├── parsers/                     # Extractores de texto por tipo de archivo
│   │   │   ├── pdf-parser.ts
│   │   │   ├── markdown-parser.ts
│   │   │   ├── text-parser.ts
│   │   │   └── url-parser.ts
│   │   ├── utils/                       # Utilidades generales
│   │   │   ├── cn.ts                   # clsx + twMerge helper
│   │   │   ├── format.ts              # Formateo de fechas, tamaños de archivo
│   │   │   └── constants.ts           # Constantes globales
│   │   └── validations/                # Schemas Zod
│   │       ├── document.ts
│   │       ├── chat.ts
│   │       └── upload.ts
│   │
│   ├── types/                           # TypeScript types globales
│   │   ├── database.ts                  # Types de Prisma + extensiones custom
│   │   ├── api.ts                       # Request/Response types
│   │   ├── chat.ts                      # Mensajes, citas, streaming
│   │   └── rag.ts                       # Chunks, embeddings, pipeline
│   │
│   └── config/                          # Configuración centralizada
│       ├── site.ts                      # Metadata: nombre, descripción, URLs
│       ├── rag.ts                       # Config RAG: chunk size, overlap, top-K, weights
│       └── navigation.ts               # Items de navegación sidebar
│
├── prisma/
│   ├── schema.prisma                    # Schema de base de datos
│   └── migrations/                      # Migraciones auto-generadas
│
├── public/
│   ├── textures/                        # Texturas papel/parchment (SVG o PNG)
│   ├── fonts/                           # Fonts locales (si no usas Google Fonts)
│   └── og-image.png                     # OpenGraph image para social sharing
│
├── tests/
│   ├── unit/                            # Vitest
│   │   ├── lib/                         # Tests de RAG pipeline y utilidades
│   │   └── components/                  # Tests de componentes
│   ├── e2e/                             # Playwright
│   │   ├── auth.spec.ts
│   │   ├── upload.spec.ts
│   │   └── chat.spec.ts
│   └── fixtures/                        # Archivos de prueba (PDFs, MDs de test)
│
├── .env.local                           # Variables de entorno (NO commitear)
├── .env.example                         # Template de variables (SÍ commitear)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── components.json                      # Config shadcn/ui
├── .eslintrc.json
├── .prettierrc
├── .gitignore
└── README.md
```

### Convenciones de la Estructura

**`docs/` vive en la raíz, fuera de `src/`:** No es código — es documentación. La IA usa esta carpeta como contexto para generar código alineado con los estándares. Los planes (`docs/plans/`) son el roadmap paso a paso que la IA sigue para implementar cada feature. Los standards (`docs/standards/`) definen las reglas que todo el código debe seguir.

**`src/` contiene todo el código:** Next.js soporta esto nativamente. Mantiene la raíz limpia y separa código de configuración/docs.

**Nomenclatura:** kebab-case para archivos (`book-card.tsx`, no `BookCard.tsx`). Next.js route files siguen su convención (`page.tsx`, `layout.tsx`, `route.ts`).

**`src/lib/rag/`:** El pipeline RAG tiene su propia subcarpeta porque es el core del proyecto. Cada paso del pipeline es un archivo separado → testing individual + explicable en entrevistas.

**`src/lib/clients/`:** Clientes de servicios externos centralizados. Un solo lugar para cambiar configs o swappear proveedores (ej: Gemini → Claude).

**`src/hooks/queries/`:** Hooks de TanStack Query separados de hooks de lógica general. Separación clara entre server state y client logic.

**`src/components/motion/`:** Primitivas de animación reutilizables, no componentes de negocio. Se componen con los componentes de `library/` y `chat/`.

**Route Groups `(marketing)`, `(auth)`, `(dashboard)`:** Permiten layouts diferentes sin afectar la URL. Marketing = público sin sidebar. Auth = páginas de Clerk. Dashboard = protegido con sidebar biblioteca.

---

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "@clerk/nextjs": "latest",
    "@supabase/supabase-js": "latest",
    "@prisma/client": "latest",
    "ai": "latest",
    "@ai-sdk/google": "latest",
    "zustand": "^5.x",
    "@tanstack/react-query": "^5.x",
    "motion": "^12.x",
    "voyageai": "latest",
    "pdf-parse": "latest",
    "react-markdown": "latest",
    "remark-gfm": "latest",
    "zod": "latest",
    "lucide-react": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "prisma": "latest",
    "vitest": "latest",
    "@playwright/test": "latest",
    "tailwindcss": "^4.x",
    "@tailwindcss/typography": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest",
    "prettier": "latest",
    "@types/react": "latest",
    "@types/node": "latest"
  }
}
```

---

## 📝 Qué Incluir en el README

- Explicar el "por qué RAG": reduce alucinaciones, citas verificables, retrieval inteligente.
- Screenshots/GIFs del chat con citas, dashboard de biblioteca, upload flow, animaciones.
- Diagrama de arquitectura (pipeline RAG visual).
- Métricas reales: latencia promedio, precision/recall del retrieval, evaluación RAGAS.
- Comparación: con reranking vs sin reranking (mejora medible).
- Sección de decisiones técnicas: Vercel AI SDK vs LangChain, pgvector vs Pinecone, Zustand + TanStack Query vs Redux, Motion para animaciones, chunking semántico vs fijo.
- Instrucción para correr localmente + `.env.example` documentado.

---

## 🚀 Mejoras Futuras (Post-Portfolio)

- Multi-modal: soporte para imágenes en PDFs (OCR con Tesseract).
- Colecciones/tags para organizar tomos por tema.
- Sharing: compartir una "estantería" pública con otros usuarios.
- Notificaciones: alertas cuando un documento es indexado/listo.
- Chrome extension: guardar URLs directamente a tu biblioteca.
- API pública: exponer endpoints para integración con otras herramientas.
