// Mapa de correlativas — Licenciatura en Biotecnología
// Fuente: Plan de Materias - Licenciatura en Biotecnología.xlsx
//
// Clave: nombre de la materia (igual al campo `nombre` en la DB)
// Valor: array de nombres de materias correlativas (prerequisitos)
//
// Una materia "bloqueada" = está pendiente Y al menos un prerequisito
// no está aprobado ni promocionado.

export const CORRELATIVAS: Record<string, string[]> = {
  // ─── PRIMER AÑO — sin correlativas ──────────────────────────────────────────
  'Tópicos de Álgebra y Geometría':               [],
  'Introducción a la Física':                      [],
  'Química General':                               [],
  'Introducción a la Biología Molecular y Celular': [],
  'Pensamiento Crítico y Comunicación':            [],
  'Cálculo I':                                     [],

  // ─── PRIMER AÑO — 2° Cuatrimestre ───────────────────────────────────────────
  'Física Aplicada a las Biociencias': [
    'Introducción a la Física',
  ],
  'Cálculo II': [
    'Cálculo I',
    'Tópicos de Álgebra y Geometría',
  ],
  'Química General e Inorgánica': [
    'Química General',
  ],
  'Dirección de Empresas':           [],
  'Biología y Fisiología Molecular': [
    'Introducción a la Biología Molecular y Celular',
  ],

  // ─── SEGUNDO AÑO — 1° Cuatrimestre ──────────────────────────────────────────
  'Química Analítica': [
    'Química General e Inorgánica',
  ],
  'Química Orgánica': [
    'Química General e Inorgánica',
  ],
  'Probabilidad y Estadística': [
    'Cálculo I',
  ],
  'Economía General y Finanzas': [],
  'Costos Industriales':         [],

  // ─── SEGUNDO AÑO — 2° Cuatrimestre ──────────────────────────────────────────
  'Genética Molecular': [
    'Biología y Fisiología Molecular',
  ],
  'Microbiología General': [
    'Introducción a la Biología Molecular y Celular',
  ],
  'Inglés I':           [],
  'Química Biológica I': [
    'Química Orgánica',
  ],
  'Análisis Instrumental': [
    'Química Analítica',
  ],

  // ─── TERCER AÑO — 1° Cuatrimestre ───────────────────────────────────────────
  'Técnicas Biotecnológicas': [
    'Genética Molecular',
  ],
  'Fenómenos de Transporte': [
    'Física Aplicada a las Biociencias',
    'Cálculo II',
  ],
  'Bioestadística': [
    'Probabilidad y Estadística',
  ],
  'Agrobiotecnología': [
    'Biología y Fisiología Molecular',
  ],
  'Química Biológica II': [
    'Química Biológica I',
  ],

  // ─── TERCER AÑO — 2° Cuatrimestre ───────────────────────────────────────────
  'Ingeniería Genética I': [
    'Técnicas Biotecnológicas',
  ],
  'Fisicoquímica': [
    'Física Aplicada a las Biociencias',
  ],
  'Comercialización de Productos Biotecnológicos': [],
  'Bioinformática': [
    'Genética Molecular',
  ],
  'Inmunología': [
    'Biología y Fisiología Molecular',
  ],

  // ─── CUARTO AÑO — 1° Cuatrimestre ───────────────────────────────────────────
  'Biotecnología y Derecho': [],
  'Ingeniería Genética II': [
    'Ingeniería Genética I',
  ],
  'Biorreactores': [
    'Fenómenos de Transporte',
  ],
  'Cultivos Celulares': [
    'Química Biológica I',
  ],
  'Estrategias Industriales': [
    'Dirección de Empresas',
  ],
  'Proyecto Final de Licenciatura en Biotecnología': [
    'Técnicas Biotecnológicas',
  ],

  // ─── CUARTO AÑO — 2° Cuatrimestre ───────────────────────────────────────────
  'Genómica y Proteómica': [
    'Técnicas Biotecnológicas',
    'Bioinformática',
  ],
  'Industrias y Procesos Biotecnológicos': [
    'Biorreactores',
  ],
  'Nanobiotecnología': [
    'Técnicas Biotecnológicas',
  ],
  'Bioética': [
    'Biología y Fisiología Molecular',
  ],
  'Desarrollo de Negocios Biotecnológicos': [
    'Comercialización de Productos Biotecnológicos',
  ],

  // ─── QUINTO AÑO — 1° Cuatrimestre ───────────────────────────────────────────
  'Biología de Sistemas': [
    'Química Biológica II',
  ],
  'Laboratorio de Bioprocesos': [
    'Biorreactores',
  ],
  'Laboratorio de Diagnóstico y Ciencias Forenses': [
    'Técnicas Biotecnológicas',
  ],
  'Optativa 1': [],
  'Optativa 2': [],
}

/** Devuelve true si la materia está desbloqueada para cursar.
 *  Una materia está desbloqueada si todos sus correlativas están
 *  aprobadas o promocionadas en el mapa de estados del usuario. */
export function estaDesbloqueada(
  nombre: string,
  estadoMap: Record<string, string>
): boolean {
  const prereqs = CORRELATIVAS[nombre] ?? []
  return prereqs.every((p) => {
    const e = estadoMap[p]
    return e === 'aprobada' || e === 'promocionada'
  })
}
