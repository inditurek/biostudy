// Tipos del schema de base de datos de MyLocus.
// Generados manualmente según supabase/migrations/20260302_schema_inicial.sql
// Si se corre `npx supabase gen types typescript --local`, reemplazar este archivo.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── Enums ────────────────────────────────────────────────────────────────────

export type EstadoMateria =
  | 'cursando'
  | 'aprobada'
  | 'promocionada'
  | 'libre'
  | 'final_pendiente'

export type TipoEvento = 'clase' | 'parcial' | 'tarea' | 'personal' | 'sprint'

export type ModoGuia = 'cursada' | 'examen' | 'sprint'

export type DuracionSprint = 7 | 4 | 2

// ─── Filas (Row) ──────────────────────────────────────────────────────────────

export interface Perfil {
  id: string
  email: string
  nombre: string
  carrera: string
  universidad: string
  creado_en: string
}

export interface Cuaderno {
  id: string
  usuario_id: string
  nombre: string
  color: string
  orden: number
  creado_en: string
}

export interface Separador {
  id: string
  cuaderno_id: string
  nombre: string
  color: string
  orden: number
  creado_en: string
}

export interface Archivo {
  id: string
  separador_id: string
  nombre: string
  tipo: string
  url_storage: string
  tamano: number
  creado_en: string
}

export interface Materia {
  id: string
  usuario_id: string
  nombre: string
  anio: number
  cuatrimestre: 1 | 2
  estado: EstadoMateria
  creado_en: string
}

export interface NotaMateria {
  id: string
  materia_id: string
  p1: number | null
  p2: number | null
  recuperatorio: number | null
  cursada: number | null
  final: number | null
}

export interface Evento {
  id: string
  usuario_id: string
  titulo: string
  tipo: TipoEvento
  fecha: string         // 'YYYY-MM-DD'
  hora_inicio: string | null   // 'HH:MM'
  hora_fin: string | null
  todo_el_dia: boolean
  creado_en: string
}

export interface Todo {
  id: string
  usuario_id: string
  texto: string
  completado: boolean
  categoria: string
  fecha: string | null  // 'YYYY-MM-DD'
  orden: number
  creado_en: string
}

export interface ProgresoGuia {
  id: string
  separador_id: string
  modo: ModoGuia
  duracion_sprint: DuracionSprint | null
  bloque_actual: string
  pasos_completados: string[]
  fecha_inicio: string
  updated_at: string
}

// ─── Inserts ──────────────────────────────────────────────────────────────────
// Para crear registros nuevos: id y timestamps son opcionales
// porque Supabase los genera automáticamente.

export type PerfilInsert = Omit<Perfil, 'creado_en'> & { creado_en?: string }

export type CuadernoInsert = Omit<Cuaderno, 'id' | 'creado_en'> & {
  id?: string
  creado_en?: string
}

export type SeparadorInsert = Omit<Separador, 'id' | 'creado_en'> & {
  id?: string
  creado_en?: string
}

export type ArchivoInsert = Omit<Archivo, 'id' | 'creado_en'> & {
  id?: string
  creado_en?: string
}

export type MateriaInsert = Omit<Materia, 'id' | 'creado_en'> & {
  id?: string
  creado_en?: string
}

// Todos los campos de notas son nullable en el DB → opcionales en insert
export type NotaMateriaInsert = {
  id?: string
  materia_id: string
  p1?: number | null
  p2?: number | null
  recuperatorio?: number | null
  cursada?: number | null
  final?: number | null
}

export type EventoInsert = Omit<Evento, 'id' | 'creado_en'> & {
  id?: string
  creado_en?: string
}

export type TodoInsert = Omit<Todo, 'id' | 'creado_en'> & {
  id?: string
  creado_en?: string
}

export type ProgresoGuiaInsert = Omit<
  ProgresoGuia,
  'id' | 'fecha_inicio' | 'updated_at'
> & {
  id?: string
  fecha_inicio?: string
  updated_at?: string
}

// ─── Updates ──────────────────────────────────────────────────────────────────
// Para actualizar: todos los campos son opcionales.

export type PerfilUpdate = Partial<Omit<Perfil, 'id' | 'creado_en'>>
export type CuadernoUpdate = Partial<Omit<Cuaderno, 'id' | 'usuario_id' | 'creado_en'>>
export type SeparadorUpdate = Partial<Omit<Separador, 'id' | 'cuaderno_id' | 'creado_en'>>
export type ArchivoUpdate = Partial<Omit<Archivo, 'id' | 'separador_id' | 'creado_en'>>
export type MateriaUpdate = Partial<Omit<Materia, 'id' | 'usuario_id' | 'creado_en'>>
export type NotaMateriaUpdate = Partial<Omit<NotaMateria, 'id' | 'materia_id'>>
export type EventoUpdate = Partial<Omit<Evento, 'id' | 'usuario_id' | 'creado_en'>>
export type TodoUpdate = Partial<Omit<Todo, 'id' | 'usuario_id' | 'creado_en'>>
export type ProgresoGuiaUpdate = Partial<
  Omit<ProgresoGuia, 'id' | 'separador_id' | 'fecha_inicio'>
>
