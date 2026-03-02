# Documento maestro para Claude Code — StudyLab

Este documento contiene todo lo que necesitás saber para construir StudyLab
desde cero. Leelo completo antes de escribir cualquier línea de código.

Los archivos de referencia en la raíz del proyecto son:
- `CLAUDE.md` — stack, estructura, convenciones, base de datos
- `STYLE.md` — cómo entregar el código en cada sesión
- `SKILLS.md` — flujos de trabajo paso a paso
- `SUBAGENTS.md` — misiones completas para ejecutar de forma autónoma
- `GUIA-DE-ESTUDIO.md` — contenido completo de la guía (fuente de verdad)

Los prototipos visuales están en `/prototypes/`. Son la fuente de verdad
visual. Antes de construir cualquier pantalla, leer el prototipo correspondiente.

---

## Qué es StudyLab

Aplicación web personal de gestión académica universitaria. Un solo usuario.
Sin inteligencia artificial. Sin costo operativo más allá del hosting.

**Pantallas:**
1. Inicio / Dashboard
2. Cuadernos → Separador → Guía de Estudio
3. Historial Académico + árbol de correlativas
4. Calendario + To-do list

**La Guía de Estudio** es una guía estática con tres modos:
- **Cursada** — para usar semana a semana después de cada clase
- **Examen** — para activar 2–3 semanas antes del parcial
- **Sprint** — para cuando quedan 7, 4 o 2 días

El progreso de cada plan se guarda en Supabase vinculado al separador activo.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript estricto (sin `any`) |
| Base de datos | Supabase (PostgreSQL + Auth + Storage) |
| Deploy | Vercel |
| Estilos | Tailwind CSS con paleta custom |
| Fuentes | Fraunces (títulos) + DM Sans (cuerpo) |

**No se usa ninguna API de IA.** No instalar `@anthropic-ai/sdk` ni similar.

---

## Paleta de colores

Configurar en `tailwind.config.ts` bajo la clave `brand`:

```
brand-50:  #faf7ff   brand-100: #f5f0ff   brand-200: #e9d5ff
brand-300: #c084fc   brand-400: #a855f7   brand-500: #7c3aed  ← primario
brand-600: #5b2d9e   brand-700: #3d1a6e   brand-800: #2d1354
brand-900: #1e0a3c   ← texto principal
```

---

## Reglas de Git — siempre seguirlas

### Ramas
Nunca trabajar en `main`. Crear una rama por feature:

```
feat/setup-inicial        feat/auth               feat/schema-db
feat/onboarding           feat/pantalla-cuadernos feat/pantalla-historial
feat/pantalla-calendario  feat/pantalla-inicio     feat/guia-estudio
feat/correlativas-tree    fix/[descripcion]
```

### Flujo por sesión
```bash
# 1. Verificar rama actual
git branch --show-current

# 2. Si estás en main, crear rama nueva
git checkout -b feat/[nombre]

# 3. Trabajar normalmente

# 4. Commit al terminar cada bloque lógico
git add .
git commit -m "feat: [descripción breve en español]"

# 5. Push solo cuando el código funciona
git push origin feat/[nombre]
```

### Mensajes de commit
```
feat: configurar proyecto con Tailwind y paleta de colores
feat: agregar autenticación con Supabase
feat: crear esquema de base de datos completo
feat: migrar pantalla de cuadernos a Next.js
fix: corregir tipos TypeScript en SeparadorCard
```

### Prohibido
- Push directo a `main`
- Commits con errores de TypeScript
- Mensajes como "cambios", "wip", "arreglos"
- Mezclar dos features en una misma rama

---

## Orden de construcción

Seguir este orden. Cada fase depende de la anterior.

```
FASE 1 — Fundamentos
├── Subagente 1: Setup inicial          → feat/setup-inicial
├── Subagente 2: Auth con Supabase      → feat/auth
└── Subagente 3: Base de datos          → feat/schema-db

FASE 2 — Onboarding
└── Pantalla de bienvenida (primera vez) → feat/onboarding

FASE 3 — Pantallas principales
├── Subagente 4: Cuadernos              → feat/pantalla-cuadernos
├── Subagente 4: Historial Académico    → feat/pantalla-historial
├── Subagente 4: Calendario + To-do     → feat/pantalla-calendario
└── Subagente 4: Inicio / Dashboard     → feat/pantalla-inicio

FASE 4 — Guía de Estudio
└── Subagente 5: Guía interactiva       → feat/guia-estudio

FASE 5 — Conexiones entre pantallas
├── Dashboard muestra datos reales del Calendario
├── Guía sugiere modo según días al próximo parcial
└── Sprint activo en Dashboard lleva al separador correcto
```

---

## Onboarding — pantalla de bienvenida

Esta pantalla aparece solo la primera vez (cuando no existe perfil de usuario).
Pide tres datos: nombre, carrera y universidad. Al guardar:
1. Crea el registro en la tabla `perfiles`
2. Crea un cuaderno de ejemplo con el color por defecto
3. Crea un separador de ejemplo dentro de ese cuaderno
4. Redirige a `/cuadernos`

La lógica de "primera vez" se detecta en el layout de la app:
si el usuario está autenticado pero no tiene perfil, redirigir a `/onboarding`.

---

## Guía de Estudio — estructura de datos

Los planes están definidos como objetos TypeScript en `lib/guia/planes.ts`.
No hay llamadas a APIs externas. El contenido viene de `GUIA-DE-ESTUDIO.md`.

```ts
// lib/guia/tipos.ts
type ModoGuia = 'cursada' | 'examen' | 'sprint'
type DuracionSprint = 7 | 4 | 2
type TecnicaEstudio = 'active-recall' | 'espaciado' | 'elaboracion' | 'simulacro' | 'lectura'

interface PasoGuia {
  id: string
  titulo: string
  duracionLabel: string
  descripcion: string
  tecnica: TecnicaEstudio
}

interface BloqueGuia {
  id: string
  titulo: string
  subtitulo: string
  color: string
  pasos: PasoGuia[]
}

interface PlanGuia {
  modo: ModoGuia
  duracionSprint?: DuracionSprint
  bloques: BloqueGuia[]
}
```

El progreso se guarda en la tabla `progreso_guia`:
```sql
progreso_guia (
  id, separador_id, modo, duracion_sprint,
  pasos_completados text[],  -- array de paso IDs
  fecha_inicio timestamptz,
  updated_at timestamptz
)
```

---

## Conexión Calendario → Guía de Estudio

La Guía debe consultar el próximo evento de tipo `parcial` para la materia
del cuaderno activo y sugerir el modo automáticamente:

```ts
function sugerirModo(diasRestantes: number): { modo: ModoGuia; sprint?: DuracionSprint } {
  if (diasRestantes > 14) return { modo: 'cursada' }
  if (diasRestantes > 7)  return { modo: 'examen' }
  if (diasRestantes >= 5) return { modo: 'sprint', sprint: 7 }
  if (diasRestantes >= 3) return { modo: 'sprint', sprint: 4 }
  return { modo: 'sprint', sprint: 2 }
}
```

Mostrar este dato en el selector de modo como:
"📅 Faltan 5 días para Estadística · Te recomendamos Sprint 4d"

---

## Resumen de semana (Dashboard)

Cada domingo, el Dashboard muestra un widget "Tu semana":
- Pasos de la Guía completados en los últimos 7 días
- Materias trabajadas (cuadernos con actividad reciente)
- Tareas del calendario completadas vs. totales
- Eventos cumplidos

Los datos vienen de Supabase con un filtro `>= NOW() - INTERVAL '7 days'`.
No requiere ninguna lógica especial — es una query de agregación.

---

## Configuración de VSCode

Crear estos archivos en el repo para estandarizar el entorno:

**`.vscode/extensions.json`**
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "mattpocock.ts-error-translator",
    "eamodio.gitlens"
  ]
}
```

**`.vscode/settings.json`**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

**`.prettierrc`**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## Variables de entorno necesarias

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=        # del dashboard de Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # del dashboard de Supabase
```

Estas dos variables son las únicas necesarias. No hay claves de IA.

---

## Cómo activar cada subagente

Copiar el prompt de activación de `SUBAGENTS.md` y enviarlo como
primer mensaje de la sesión. Claude ejecutará la misión completa.

**Primera sesión — copiar y pegar esto:**

```
Leé el CLAUDE.md, STYLE.md, SKILLS.md y SUBAGENTS.md del proyecto.
Después ejecutá el Subagente 1: Setup inicial de StudyLab.

Antes de empezar:
1. Verificá que estás en la carpeta correcta del proyecto
2. Creá la rama feat/setup-inicial
3. Seguí todos los pasos del Subagente 1
4. Incluí la configuración de VSCode (.vscode/extensions.json,
   .vscode/settings.json, .prettierrc) como parte del setup
5. Al terminar, hacé commit y push de la rama

Trabajá directamente sobre los archivos locales.
```
