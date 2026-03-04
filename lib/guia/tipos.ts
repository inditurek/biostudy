export type TecnicaGuia =
  | 'active-recall'
  | 'espaciado'
  | 'elaboracion'
  | 'simulacro'
  | 'lectura'

export type PlanKey = 'cursada' | 'examen' | 'sprint7' | 'sprint4' | 'sprint2'

export interface PasoGuia {
  id: string
  titulo: string
  duracion: string
  descripcion: string
  tecnica: TecnicaGuia
}

export interface BloqueGuia {
  id: string
  titulo: string
  subtitulo: string
  color: string
  pasos: PasoGuia[]
}

export interface PlanGuia {
  bloques: BloqueGuia[]
}

export function getPlanKey(
  modo: 'cursada' | 'examen' | 'sprint',
  duracion: number | null
): PlanKey {
  if (modo === 'sprint') {
    if (duracion === 4) return 'sprint4'
    if (duracion === 2) return 'sprint2'
    return 'sprint7'
  }
  return modo
}
