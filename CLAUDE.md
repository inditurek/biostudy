# CLAUDE.md — StudyLab

## Tech Stack

This project uses TypeScript and JavaScript with Supabase as the backend. Always prefer TypeScript for new files. Use Supabase client libraries and raw SQL only for migrations.

---

## Calendar & Date Logic

When implementing date/calendar logic (recurrence, scheduling, etc.), always clarify the exact recurrence semantics with the user before coding. For example: 'every Monday' means the Nth weekday-of-month, NOT the Nth day-of-month.

---

## Workflow Resilience

When a task involves multiple sequential steps (e.g., migration → commit → push → PR), break it into checkpoints and commit/save progress at each step so that rate limits or interruptions don't lose work.

Always use the `gh` CLI to create pull requests whenever possible. Example: `gh pr create --title "..." --body "..."`. Confirm success by running `gh pr view` and returning the PR URL.

---

## ¿Qué es este proyecto?

StudyLab es una aplicación web personal de gestión académica universitaria. Su objetivo
es centralizar todo lo que necesita un estudiante para estudiar mejor: cuadernos digitales
por materia, una guía de estudio estructurada con planes por etapa del cuatrimestre,
historial académico con correlativas, y un calendario con to-do list.

**No es un producto para vender.** Es una herramienta personal, construida con cuidado,
que el usuario usa para rendir mejor en la facultad.

**No usa inteligencia artificial.** La Guía de Estudio es una guía estática con planes
y técnicas probadas, aplicables a cualquier materia sin costo operativo.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript estricto |
| Base de datos | Supabase (PostgreSQL + Auth + Storage) |
| Deploy | Vercel |
| Estilos | Tailwind CSS |
| Fuentes | Fraunces (serif, títulos) + DM Sans (sans, cuerpo) |

---

## Paleta de diseño

```
--v9: #1e0a3c   (violeta muy oscuro, texto principal)
--v8: #2d1354
--v7: #3d1a6e
--v6: #5b2d9e
--v5: #7c3aed   (violeta primario, CTAs)
--v4: #a855f7
--v3: #c084fc
--v2: #e9d5ff
--v1: #f5f0ff
--v0: #faf7ff   (fondo general)
```

Los prototipos HTML en `/prototypes/` son la fuente de verdad visual.
Antes de construir cualquier componente de UI, consultar el prototipo correspondiente.

---

## Estructura de carpetas (objetivo)

```
studylab/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (app)/
│   │   ├── layout.tsx           ← sidebar + nav
│   │   ├── page.tsx             ← Inicio / Dashboard
│   │   ├── cuadernos/
│   │   │   ├── page.tsx         ← grilla de cuadernos
│   │   │   └── [id]/
│   │   │       ├── page.tsx     ← interior del cuaderno
│   │   │       └── [sep]/
│   │   │           └── page.tsx ← separador + guía de estudio
│   │   ├── historial/
│   │   │   └── page.tsx
│   │   └── calendario/
│   │       └── page.tsx
├── components/
│   ├── ui/                      ← primitivos (Button, Card, Modal, Badge)
│   ├── layout/                  ← Sidebar, Breadcrumb, PageHeader
│   ├── cuadernos/               ← NotebookCard, SeparadorCard, FileList
│   ├── historial/               ← StatsBar, YearCard, MateriasTable, CorrelativasTree
│   ├── calendario/              ← CalendarGrid, EventList, TodoList
│   └── guia/                    ← ModeSelector, PlanViewer, SprintTracker, ChecklistPanel
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts             ← tipos generados desde schema
│   ├── guia/
│   │   ├── planes.ts            ← planes estáticos de estudio por modo
│   │   └── tipos.ts             ← tipos TypeScript de la guía
│   └── utils.ts
├── prototypes/                  ← HTMLs de referencia visual (NO tocar)
│   ├── studylab-home-v3.html
│   ├── studylab-cuadernos-v2.html
│   ├── studylab-historial-v3.html
│   ├── studylab-calendario.html
│   └── studylab-guia-v3.html
└── supabase/
    └── migrations/
```

---

## Features principales (en orden de prioridad)

1. **Cuadernos y separadores** — Organización jerárquica: Cuaderno → Separador → Archivos.
   Cada separador tiene su propia instancia de la Guía de Estudio.

2. **Guía de Estudio** — Guía estática con tres modos según el momento del cuatrimestre:
   Cursada (semana a semana), Exámenes (2–3 semanas antes), Sprint (días contados).
   El progreso de cada plan se guarda en Supabase.

3. **Historial Académico** — Tabla de notas por año/cuatrimestre.
   Mapa de correlativas visual (árbol SVG interactivo).

4. **Calendario + To-do** — Eventos con tipos (clase, parcial, tarea, personal, sprint).
   To-do list integrada al día seleccionado.

---

## Guía de Estudio — estructura de datos

La guía no usa IA. Los planes son estructuras fijas definidas en `lib/guia/planes.ts`.
El usuario selecciona un modo, sigue los pasos, y marca su progreso.

```ts
type ModoGuia = 'cursada' | 'examen' | 'sprint'
type DuracionSprint = 7 | 4 | 2  // días

interface PasoGuia {
  id: string
  titulo: string
  duracionMin: number
  descripcion: string
  tecnica: 'active-recall' | 'espaciado' | 'elaboracion' | 'simulacro' | 'lectura'
}

interface BloqueGuia {
  id: string
  titulo: string
  pasos: PasoGuia[]
}

interface PlanGuia {
  modo: ModoGuia
  bloques: BloqueGuia[]
}
```

El progreso del usuario (qué pasos completó, en qué bloque está) se guarda
en la tabla `progreso_guia` de Supabase, vinculado al separador activo.

---

## Convenciones de código

- **TypeScript estricto**: sin `any`, sin `as unknown`.
- **Componentes**: siempre funcionales con tipos explícitos en props.
- **Server vs Client**: preferir Server Components. Usar `"use client"` solo cuando
  haya interactividad (estado, efectos, eventos).
- **Supabase**: usar el cliente de servidor en Server Components y Route Handlers.
  Nunca exponer claves privadas al cliente.
- **Variables de entorno**: todas las claves en `.env.local`, tipadas en `env.ts`.
- **Naming**: carpetas en kebab-case, componentes en PascalCase, funciones en camelCase.
- **Estilos**: Tailwind utility classes únicamente. Sin CSS modules, sin styled-components.

---

## Base de datos — Tablas principales

```sql
perfiles           id, email, nombre, carrera, universidad
cuadernos          id, usuario_id, nombre, color, orden
separadores        id, cuaderno_id, nombre, color, orden
archivos           id, separador_id, nombre, tipo, url_storage, tamaño
materias           id, usuario_id, nombre, año, cuatrimestre, estado
notas_materia      id, materia_id, p1, p2, recuperatorio, cursada, final
eventos            id, usuario_id, titulo, tipo, fecha, hora_inicio, hora_fin, todo_el_dia
todos              id, usuario_id, texto, completado, categoria, fecha, orden
progreso_guia      id, separador_id, modo, bloque_actual, pasos_completados[], fecha_inicio
```

---

## Lo que Claude NO debe hacer en este proyecto

- No cambiar los prototipos HTML en `/prototypes/` — son referencia, no código de producción.
- No usar `any` en TypeScript.
- No crear lógica de negocio en componentes de UI — extraer a hooks o funciones en `lib/`.
- No agregar ninguna integración con APIs de IA — la guía es completamente estática.
- No instalar `@anthropic-ai/sdk` ni ninguna librería de LLMs.
- No inventar esquemas de base de datos sin consultar primero las migraciones existentes.
- No instalar librerías sin justificación — el stack está definido.
