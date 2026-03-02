// Datos del Plan de Materias — Licenciatura en Biotecnología
// Fuente: Plan de Materias - Licenciatura en Biotecnología.xlsx
//
// Uso: importar en el Server Action de carga inicial del Historial.
// La función `cargarMateriasIniciales` en lib/data/cargar-materias.ts
// toma estos datos y los inserta con el usuario_id del usuario autenticado.

import type { MateriaInsert, NotaMateriaInsert } from '@/lib/supabase/types'

export interface MateriaSeed {
  materia: Omit<MateriaInsert, 'usuario_id'>
  notas?: Omit<NotaMateriaInsert, 'materia_id'>
}

export const MATERIAS_SEED: MateriaSeed[] = [
  // ─── PRIMER AÑO — 1° Cuatrimestre ──────────────────────────────────────────
  {
    materia: { nombre: 'Tópicos de Álgebra y Geometría', anio: 1, cuatrimestre: 1, estado: 'aprobada' },
    notas:   { p1: 9, p2: 9, cursada: 8, final: 6 },
  },
  {
    materia: { nombre: 'Introducción a la Física', anio: 1, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Química General', anio: 1, cuatrimestre: 1, estado: 'aprobada' },
    notas:   { p1: 4, p2: 4, cursada: 4, final: 4 },
  },
  {
    materia: { nombre: 'Introducción a la Biología Molecular y Celular', anio: 1, cuatrimestre: 1, estado: 'aprobada' },
    notas:   { p1: 5, p2: 4, recuperatorio: 7, cursada: 7 },
  },
  {
    materia: { nombre: 'Pensamiento Crítico y Comunicación', anio: 1, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Cálculo I', anio: 1, cuatrimestre: 1, estado: 'promocionada' },
    notas:   { p1: 10, p2: 8, cursada: 9 },
  },

  // ─── PRIMER AÑO — 2° Cuatrimestre ──────────────────────────────────────────
  {
    materia: { nombre: 'Física Aplicada a las Biociencias', anio: 1, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Cálculo II', anio: 1, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Química General e Inorgánica', anio: 1, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Dirección de Empresas', anio: 1, cuatrimestre: 2, estado: 'promocionada' },
    notas:   { p1: 9, p2: 8, cursada: 9 },
  },
  {
    materia: { nombre: 'Biología y Fisiología Molecular', anio: 1, cuatrimestre: 2, estado: 'cursando' },
  },

  // ─── SEGUNDO AÑO — 1° Cuatrimestre ─────────────────────────────────────────
  {
    materia: { nombre: 'Química Analítica', anio: 2, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Química Orgánica', anio: 2, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Probabilidad y Estadística', anio: 2, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Economía General y Finanzas', anio: 2, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Costos Industriales', anio: 2, cuatrimestre: 1, estado: 'aprobada' },
    // P1 fue recuperatorio (4), P2 normal (10), final (9), nota cursada (8)
    notas:   { recuperatorio: 4, p2: 10, cursada: 8, final: 9 },
  },

  // ─── SEGUNDO AÑO — 2° Cuatrimestre ─────────────────────────────────────────
  {
    materia: { nombre: 'Genética Molecular', anio: 2, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Microbiología General', anio: 2, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Inglés I', anio: 2, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Química Biológica I', anio: 2, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Análisis Instrumental', anio: 2, cuatrimestre: 2, estado: 'cursando' },
  },

  // ─── TERCER AÑO — 1° Cuatrimestre ──────────────────────────────────────────
  {
    materia: { nombre: 'Técnicas Biotecnológicas', anio: 3, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Fenómenos de Transporte', anio: 3, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Bioestadística', anio: 3, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Agrobiotecnología', anio: 3, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Química Biológica II', anio: 3, cuatrimestre: 1, estado: 'cursando' },
  },

  // ─── TERCER AÑO — 2° Cuatrimestre ──────────────────────────────────────────
  {
    materia: { nombre: 'Ingeniería Genética I', anio: 3, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Fisicoquímica', anio: 3, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Comercialización de Productos Biotecnológicos', anio: 3, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Bioinformática', anio: 3, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Inmunología', anio: 3, cuatrimestre: 2, estado: 'cursando' },
  },

  // ─── CUARTO AÑO — 1° Cuatrimestre ──────────────────────────────────────────
  {
    materia: { nombre: 'Biotecnología y Derecho', anio: 4, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Ingeniería Genética II', anio: 4, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Biorreactores', anio: 4, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Cultivos Celulares', anio: 4, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Estrategias Industriales', anio: 4, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Proyecto Final de Licenciatura en Biotecnología', anio: 4, cuatrimestre: 1, estado: 'cursando' },
  },

  // ─── CUARTO AÑO — 2° Cuatrimestre ──────────────────────────────────────────
  {
    materia: { nombre: 'Genómica y Proteómica', anio: 4, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Industrias y Procesos Biotecnológicos', anio: 4, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Nanobiotecnología', anio: 4, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Bioética', anio: 4, cuatrimestre: 2, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Desarrollo de Negocios Biotecnológicos', anio: 4, cuatrimestre: 2, estado: 'cursando' },
  },

  // ─── QUINTO AÑO — 1° Cuatrimestre ──────────────────────────────────────────
  {
    materia: { nombre: 'Biología de Sistemas', anio: 5, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Laboratorio de Bioprocesos', anio: 5, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Laboratorio de Diagnóstico y Ciencias Forenses', anio: 5, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Optativa 1', anio: 5, cuatrimestre: 1, estado: 'cursando' },
  },
  {
    materia: { nombre: 'Optativa 2', anio: 5, cuatrimestre: 1, estado: 'cursando' },
  },
]
