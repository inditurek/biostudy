# SKILLS.md — Flujos de trabajo de StudyLab

Estas son las habilidades (skills) que Claude debe seguir paso a paso
cada vez que se ejecuta uno de estos flujos en el proyecto.

---

## SKILL 1 — Migrar un prototipo HTML a Next.js

**Cuándo usarla:** cada vez que hay que convertir una pantalla de
`/prototypes/*.html` en componentes reales de Next.js.

### Pasos

**Paso 1 — Leer el prototipo**
Abrir el archivo HTML correspondiente y identificar:
- Las secciones visuales principales (header, cards, tablas, modales)
- Los estados interactivos (acordeones, vistas distintas, modales)
- Los datos que son hardcodeados (van a venir de Supabase después)
- Las clases CSS que usan variables de la paleta (`--v5`, `--g2`, etc.)

**Paso 2 — Planificar la descomposición en componentes**
Antes de escribir código, listar los componentes que se van a crear:
```
Ejemplo para la pantalla de Cuadernos:
- app/(app)/cuadernos/page.tsx         ← page (Server Component)
- components/cuadernos/NotebookGrid.tsx
- components/cuadernos/NotebookCard.tsx
- components/cuadernos/NewNotebookModal.tsx
- components/ui/Modal.tsx              ← si no existe todavía
```

Regla: si un bloque visual tiene más de ~30 líneas o tiene estado propio,
es un componente separado.

**Paso 3 — Crear la page como Server Component**
La page (`page.tsx`) debe:
- Ser async y sin `"use client"`
- Traer los datos de Supabase directamente (no en el cliente)
- Pasarle los datos a los componentes hijos como props

```tsx
// Estructura base de una page
export default async function CuadernosPage() {
  const supabase = createServerClient()
  const { data: cuadernos } = await supabase
    .from('cuadernos')
    .select('*')
    .order('orden')

  return <NotebookGrid cuadernos={cuadernos ?? []} />
}
```

**Paso 4 — Traducir el CSS del prototipo a Tailwind**
Las variables CSS del prototipo se mapean así:

| Variable prototipo | Clase Tailwind equivalente |
|---|---|
| `--v5: #7c3aed` | `bg-violet-600`, `text-violet-600` |
| `--v1: #f5f0ff` | `bg-violet-50` |
| `--v9: #1e0a3c` | `text-[#1e0a3c]` (usar valor custom) |
| `--g2: #e5e7eb` | `border-gray-200` |
| `--g1: #f3f4f6` | `bg-gray-100` |

Para colores de la paleta violeta que no tienen equivalente exacto en Tailwind,
usar valores arbitrarios: `bg-[#7c3aed]`.

Definir los colores de la paleta en `tailwind.config.ts` para poder usarlos
como `bg-brand-500` en vez de repetir el hex en todos lados.

**Paso 5 — Agregar interactividad con `"use client"` mínimo**
Solo marcar como `"use client"` los componentes que realmente lo necesitan:
- Modales (tienen estado abierto/cerrado)
- Acordeones
- Formularios
- Componentes con `onClick`, `useState`, `useEffect`

La page y los componentes de layout deben quedarse como Server Components.

**Paso 6 — Datos hardcodeados → props tipadas**
Reemplazar todo dato hardcodeado del prototipo por props con tipos:

```tsx
// En vez de hardcodear "Genética Molecular"
interface NotebookCardProps {
  id: string
  nombre: string
  color: string
  cantSeparadores: number
  cantArchivos: number
  estado: 'en_curso' | 'aprobada' | 'promocionada'
}

export function NotebookCard({ nombre, color, cantSeparadores }: NotebookCardProps) {
  // ...
}
```

**Paso 7 — Verificación**
Confirmar que:
- [ ] La pantalla se ve igual al prototipo HTML
- [ ] No hay errores de TypeScript
- [ ] Los datos hardcodeados fueron reemplazados por props
- [ ] No hay `any` en ningún tipo

---

## SKILL 2 — Crear una tabla en Supabase y conectarla a la UI

**Cuándo usarla:** cada vez que hay que persistir datos nuevos
(cuadernos, separadores, archivos, eventos, tareas, notas de materia, etc.)

### Pasos

**Paso 1 — Diseñar el esquema de la tabla**
Antes de escribir SQL, definir:
- Nombre de la tabla (snake_case, plural)
- Columnas con tipos y constraints
- Relaciones con otras tablas (foreign keys)
- Si necesita RLS (Row Level Security)

Para uso personal (un solo usuario), RLS es opcional pero buena práctica.

**Paso 2 — Escribir la migración SQL**
Crear el archivo en `supabase/migrations/YYYYMMDD_nombre.sql`:

```sql
-- Ejemplo: tabla de cuadernos
create table cuadernos (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid references auth.users(id) on delete cascade not null,
  nombre      text not null,
  color       text not null default '#7c3aed',
  orden       integer not null default 0,
  creado_en   timestamptz default now()
);

-- Índice para traer los cuadernos de un usuario ordenados
create index on cuadernos (usuario_id, orden);

-- RLS: cada usuario solo ve sus propios cuadernos
alter table cuadernos enable row level security;

create policy "usuario ve sus cuadernos"
  on cuadernos for all
  using (auth.uid() = usuario_id);
```

**Paso 3 — Generar los tipos TypeScript**
Después de aplicar la migración, regenerar los tipos:
```bash
npx supabase gen types typescript --local > lib/supabase/types.ts
```

Esto genera tipos como `Database['public']['Tables']['cuadernos']['Row']`
que se pueden usar en toda la app.

**Paso 4 — Crear las funciones de acceso a datos**
En `lib/supabase/queries/[tabla].ts`, crear funciones nombradas para
cada operación que necesite la UI:

```ts
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Cuaderno = Database['public']['Tables']['cuadernos']['Row']
type NuevoCuaderno = Database['public']['Tables']['cuadernos']['Insert']

export async function getCuadernos(): Promise<Cuaderno[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('cuadernos')
    .select('*')
    .order('orden')

  if (error) throw new Error(`Error trayendo cuadernos: ${error.message}`)
  return data
}

export async function crearCuaderno(datos: NuevoCuaderno): Promise<Cuaderno> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('cuadernos')
    .insert(datos)
    .select()
    .single()

  if (error) throw new Error(`Error creando cuaderno: ${error.message}`)
  return data
}
```

**Paso 5 — Conectar a la UI**
- **Lectura**: llamar la función en la `page.tsx` (Server Component) y pasar como props.
- **Escritura**: usar Server Actions para formularios o Route Handlers para operaciones
  más complejas.

```tsx
// Server Action para crear un cuaderno
'use server'
export async function actionCrearCuaderno(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const color = formData.get('color') as string
  await crearCuaderno({ nombre, color, usuario_id: await getUserId() })
  revalidatePath('/cuadernos')
}
```

**Paso 6 — Verificación**
- [ ] La tabla existe en Supabase y la migración se aplicó sin errores
- [ ] Los tipos TypeScript están generados y actualizados
- [ ] La UI muestra los datos reales (no hardcodeados)
- [ ] Crear, leer y (si aplica) editar/borrar funcionan
- [ ] No hay claves de Supabase expuestas en código cliente

---

## SKILL 3 — Implementar la Guía de Estudio estática

**Cuándo usarla:** para conectar los planes de estudio definidos en
`lib/guia/planes.ts` a los componentes de UI, con progreso persistido en Supabase.

### Pasos

**Paso 1 — Verificar que los planes existen**
Confirmar que `lib/guia/planes.ts` y `lib/guia/tipos.ts` están creados
(Subagente 3). Si no, crearlos basándose en `GUIA-DE-ESTUDIO.md`.

**Paso 2 — Crear los componentes en `components/guia/`**

```
ModeSelector.tsx        ← tarjetas de modo (Cursada / Examen / Sprint)
SprintDurationPicker.tsx ← selector 7 / 4 / 2 días
PlanViewer.tsx          ← lista de bloques del plan activo
BloqueCard.tsx          ← bloque expandible con sus pasos
PasoCard.tsx            ← paso individual con checkbox
ProgressBar.tsx         ← barra de progreso del plan
ChecklistPanel.tsx      ← checklist pre-parcial (modo Examen)
ReferenciasRapidas.tsx  ← tabla de referencia según días restantes
```

**Paso 3 — Leer el progreso desde Supabase**
En la page del separador, cargar el progreso guardado:

```ts
const progreso = await supabase
  .from('progreso_guia')
  .select('*')
  .eq('separador_id', separadorId)
  .single()
```

**Paso 4 — Persistir el progreso con Server Actions**
Cada vez que el usuario marca un paso:

```ts
'use server'
export async function togglePasoCompletado(
  separadorId: string,
  pasoId: string,
  completado: boolean
) {
  const supabase = createServerClient()
  // Actualizar el array pasos_completados en Supabase
  await supabase.rpc('toggle_paso_guia', { separador_id: separadorId, paso_id: pasoId, completado })
  revalidatePath(`/cuadernos/[id]/${separadorId}`)
}
```

**Paso 5 — Sugerencia automática de modo**
Consultar el próximo evento de tipo `parcial` del calendario
y sugerir el modo según los días restantes:

```ts
function sugerirModo(diasRestantes: number): ModoGuia {
  if (diasRestantes > 14) return 'cursada'
  if (diasRestantes > 7)  return 'examen'
  return 'sprint'
}
```

**Paso 6 — Verificación**
- [ ] Los tres modos renderizan sus bloques y pasos correctamente
- [ ] Marcar un paso lo persiste en Supabase y sobrevive a un refresh
- [ ] La barra de progreso refleja el estado real
- [ ] La sugerencia de modo aparece cuando hay un parcial próximo en el calendario


## Orden recomendado de construcción

Para un proyecto nuevo desde cero, seguir este orden:

```
1. Setup inicial
   └── crear proyecto Next.js + configurar Supabase + configurar Tailwind

2. Auth (una sola vez)
   └── SKILL 2 parcial: tabla de usuarios + login con Supabase Auth

3. Layout global
   └── SKILL 1: sidebar + nav (sin datos, solo visual)

4. Pantalla de Inicio
   └── SKILL 1: migrar prototipo → componentes
   └── SKILL 2: conectar stats reales desde Supabase

5. Cuadernos
   └── SKILL 2: tablas cuadernos + separadores + archivos
   └── SKILL 1: migrar prototipo → componentes conectados

6. Guía de Estudio (básica, sin IA)
   └── SKILL 1: migrar prototipo → componentes con estado local

7. Guía de Estudio + IA
   └── SKILL 3: endpoint de chat + streaming

8. Historial Académico
   └── SKILL 2: tablas materias + notas
   └── SKILL 1: migrar prototipo (tabla + árbol de correlativas)

9. Calendario + To-do
   └── SKILL 2: tablas eventos + todos
   └── SKILL 1: migrar prototipo → grilla de calendario
```
