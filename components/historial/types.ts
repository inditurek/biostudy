import type { Materia, NotaMateria } from '@/lib/supabase/types'

// Materia enriquecida con sus notas (puede no tener)
export interface MateriaConNotas extends Materia {
  notas: NotaMateria | null
}

// Agrupación por año y cuatrimestre
export interface CuatriData {
  cuatrimestre: 1 | 2
  materias: MateriaConNotas[]
  promedio: number | null
}

export interface AnioData {
  anio: number
  cuatrimestres: CuatriData[]
  aprobadas: number
  promocionadas: number
  promedio: number | null
}

// Stats globales
export interface HistorialStats {
  promedioGeneral: number | null
  aprobadas: number
  enCurso: number
  promocionadas: number
  recuperatorios: number
  total: number
}
