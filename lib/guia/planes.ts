import type { PlanGuia, PlanKey, TecnicaGuia } from './tipos'

export const PLANES: Record<PlanKey, PlanGuia> = {
  cursada: {
    bloques: [
      {
        id: 'b1',
        titulo: 'Bloque 1 — Procesamiento',
        subtitulo: 'Mismo día o al día siguiente de la clase',
        color: '#7c3aed',
        pasos: [
          {
            id: 'b1p1',
            titulo: 'Volcado libre',
            duracion: '10 min',
            descripcion: 'Sin mirar los apuntes, escribí todo lo que recordás de la clase. No importa si está desordenado.',
            tecnica: 'active-recall',
          },
          {
            id: 'b1p2',
            titulo: 'Revisión y corrección',
            duracion: '15 min',
            descripcion: 'Abrí los apuntes. Marcá en color diferente lo que te faltó o estaba mal. No reescribas lo que ya tenías bien.',
            tecnica: 'lectura',
          },
          {
            id: 'b1p3',
            titulo: 'Pregunta central',
            duracion: '5 min',
            descripcion: 'Escribí una sola pregunta que capture la idea principal de la clase. Será tu ancla para el repaso posterior.',
            tecnica: 'elaboracion',
          },
          {
            id: 'b1p4',
            titulo: 'Conexión con temas anteriores',
            duracion: '10 min',
            descripcion: 'Escribí 2–3 conexiones entre el tema de hoy y temas que ya viste.',
            tecnica: 'elaboracion',
          },
        ],
      },
      {
        id: 'b2',
        titulo: 'Bloque 2 — Profundización',
        subtitulo: '2–3 días después del Bloque 1',
        color: '#5b2d9e',
        pasos: [
          {
            id: 'b2p1',
            titulo: 'Active Recall sin apuntes',
            duracion: '10 min',
            descripcion: 'Respondé la pregunta central que escribiste. Solo después de intentarlo, revisás tus apuntes.',
            tecnica: 'active-recall',
          },
          {
            id: 'b2p2',
            titulo: 'Elaboración escrita',
            duracion: '20 min',
            descripcion: 'Explicá el concepto más difícil como si se lo explicaras a alguien que no sabe nada del tema.',
            tecnica: 'elaboracion',
          },
          {
            id: 'b2p3',
            titulo: 'Ejercicios / Preguntas de comprensión',
            duracion: '20 min',
            descripcion: 'Exactas: 2 ejercicios sin mirar el procedimiento. Biológicas: 3 preguntas de nivel creciente (definición → mecanismo → aplicación).',
            tecnica: 'active-recall',
          },
        ],
      },
      {
        id: 'b3',
        titulo: 'Bloque 3 — Repaso espaciado',
        subtitulo: '7 días después del Bloque 1',
        color: '#a855f7',
        pasos: [
          {
            id: 'b3p1',
            titulo: 'Test rápido sin mirar',
            duracion: '15 min',
            descripcion: 'Respondé por escrito: la pregunta central, los 3 conceptos más importantes, y una conexión con otro tema.',
            tecnica: 'active-recall',
          },
          {
            id: 'b3p2',
            titulo: 'Revisión selectiva',
            duracion: '15 min',
            descripcion: 'Revisá solo lo que no recordaste bien. No releas todo.',
            tecnica: 'espaciado',
          },
          {
            id: 'b3p3',
            titulo: 'Actualización del resumen',
            duracion: '10 min',
            descripcion: 'Agregá al resumen solo lo que aprendiste nuevo hoy. Los resúmenes crecen, no se reescriben.',
            tecnica: 'elaboracion',
          },
        ],
      },
    ],
  },

  examen: {
    bloques: [
      {
        id: 'e1',
        titulo: 'Semana −3 — Diagnóstico y mapa',
        subtitulo: 'Tres semanas antes del parcial',
        color: '#d97706',
        pasos: [
          {
            id: 'e1p1',
            titulo: 'Inventario del programa',
            duracion: '45 min',
            descripcion: 'Listá todos los temas. Asignate 🟢 (lo sé), 🟡 (más o menos) o 🔴 (no lo sé). Hacé un test rápido de cada uno antes de asignar.',
            tecnica: 'active-recall',
          },
          {
            id: 'e1p2',
            titulo: 'Consolidar temas 🟡',
            duracion: '45 min/día × 4',
            descripcion: 'Empezá por los amarillos. Ya tenés base, solo necesitan refuerzo. Usá el Bloque 2 de Cursada para cada uno.',
            tecnica: 'espaciado',
          },
        ],
      },
      {
        id: 'e2',
        titulo: 'Semana −2 — Relleno y práctica',
        subtitulo: 'Dos semanas antes del parcial',
        color: '#ea580c',
        pasos: [
          {
            id: 'e2p1',
            titulo: 'Atacar temas 🔴',
            duracion: '60 min/día × 3',
            descripcion: 'Leer una fuente → cerrar → escribir → volver a leer para llenar huecos → Bloque 2. Si hay muchos, priorizá por peso en el parcial.',
            tecnica: 'active-recall',
          },
          {
            id: 'e2p2',
            titulo: 'Práctica integrada',
            duracion: '60 min/día × 2',
            descripcion: 'Exactas: parciales viejos en condiciones reales. Biológicas: preguntas que integren varios temas entre sí.',
            tecnica: 'simulacro',
          },
          {
            id: 'e2p3',
            titulo: 'Repaso de temas 🟢',
            duracion: '30 min/día × 2',
            descripcion: 'Un test rápido de 5 minutos por tema para confirmar que siguen consolidados.',
            tecnica: 'espaciado',
          },
        ],
      },
      {
        id: 'e3',
        titulo: 'Semana −1 — Afinado final',
        subtitulo: 'Una semana antes del parcial',
        color: '#dc2626',
        pasos: [
          {
            id: 'e3p1',
            titulo: 'Simulacros completos',
            duracion: '60 min/día × 3',
            descripcion: 'Al menos 2 simulacros completos en condiciones reales. Corregí y anotá qué falló. No vuelvas a estudiar todo — solo lo que falló.',
            tecnica: 'simulacro',
          },
          {
            id: 'e3p2',
            titulo: 'Repaso final selectivo',
            duracion: '45 min/día × 2',
            descripcion: 'Solo los temas que siguen flojos después de los simulacros. No toques lo que ya salió bien.',
            tecnica: 'espaciado',
          },
          {
            id: 'e3p3',
            titulo: 'Repaso ultraligero',
            duracion: '20 min',
            descripcion: 'Solo leé tus preguntas centrales de cada tema. No estudies contenido nuevo.',
            tecnica: 'active-recall',
          },
          {
            id: 'e3p4',
            titulo: 'Descanso total',
            duracion: 'Día previo',
            descripcion: 'No estudies. El cerebro consolida mientras descansás. Dormir bien vale más que cualquier repaso de última hora.',
            tecnica: 'espaciado',
          },
        ],
      },
    ],
  },

  sprint7: {
    bloques: [
      {
        id: 's7d1',
        titulo: 'Día 1 — Diagnóstico brutal',
        subtitulo: 'Ser honesto y rápido',
        color: '#dc2626',
        pasos: [
          {
            id: 's7p1',
            titulo: 'Inventario y decisiones difíciles',
            duracion: '2 hs',
            descripcion: 'Inventario en 1 hora. Marcá "sacrificio consciente" los temas de bajo peso. Mejor dominar el 70% que tener el 100% a medias.',
            tecnica: 'active-recall',
          },
        ],
      },
      {
        id: 's7d23',
        titulo: 'Días 2–3 — Temas de mayor peso',
        subtitulo: 'Los que siempre entran en el parcial',
        color: '#dc2626',
        pasos: [
          {
            id: 's7p2',
            titulo: 'Estudiar en profundidad los 3–4 temas clave',
            duracion: '2–3 hs/día',
            descripcion: 'Solo los temas de mayor probabilidad. Usá el Bloque 2 de Cursada para cada uno.',
            tecnica: 'active-recall',
          },
        ],
      },
      {
        id: 's7d45',
        titulo: 'Días 4–5 — Temas secundarios',
        subtitulo: 'Nivel concepto general',
        color: '#ef4444',
        pasos: [
          {
            id: 's7p3',
            titulo: 'Cobertura superficial de temas secundarios',
            duracion: '2 hs/día',
            descripcion: 'Suficiente para no dejar la pregunta en blanco. No en detalle.',
            tecnica: 'lectura',
          },
        ],
      },
      {
        id: 's7d6',
        titulo: 'Día 6 — Simulacro',
        subtitulo: 'Condiciones reales',
        color: '#f97316',
        pasos: [
          {
            id: 's7p4',
            titulo: 'Parcial viejo completo sin consultar',
            duracion: '2 hs',
            descripcion: 'Corregí. Anotá qué falló. No vuelvas a estudiar todo — solo lo que salió mal.',
            tecnica: 'simulacro',
          },
        ],
      },
      {
        id: 's7d7',
        titulo: 'Día 7 — Repaso y descanso',
        subtitulo: 'Día del parcial',
        color: '#22c55e',
        pasos: [
          {
            id: 's7p5',
            titulo: 'Repaso de lo que falló en el simulacro',
            duracion: '1 hs',
            descripcion: 'Solo los puntos débiles detectados ayer. Nada más.',
            tecnica: 'active-recall',
          },
          {
            id: 's7p6',
            titulo: 'Descanso',
            duracion: 'Resto del día',
            descripcion: 'Comé bien. Dormí. El pánico consume energía que necesitás para rendir.',
            tecnica: 'espaciado',
          },
        ],
      },
    ],
  },

  sprint4: {
    bloques: [
      {
        id: 's4d1',
        titulo: 'Día 1 — Triage',
        subtitulo: 'Ser quirúrgico',
        color: '#dc2626',
        pasos: [
          {
            id: 's4p1',
            titulo: 'Inventario rápido + estudio de temas prioritarios',
            duracion: '1 hs + 2 hs',
            descripcion: 'Mirá el programa y parciales viejos. Decidí qué temas tienen mayor probabilidad. Estudiá solo esos.',
            tecnica: 'active-recall',
          },
        ],
      },
      {
        id: 's4d2',
        titulo: 'Día 2 — Profundizar',
        subtitulo: 'Continuar con temas prioritarios',
        color: '#dc2626',
        pasos: [
          {
            id: 's4p2',
            titulo: 'Profundización + ejercicios o preguntas',
            duracion: '3 hs',
            descripcion: 'Exactas: ejercicios. Biológicas: preguntas de nivel 2 y 3.',
            tecnica: 'active-recall',
          },
        ],
      },
      {
        id: 's4d3',
        titulo: 'Día 3 — Huecos + simulacro',
        subtitulo: 'Cubrir lo crítico y practicar',
        color: '#f97316',
        pasos: [
          {
            id: 's4p3',
            titulo: 'Cubrir temas 🔴 prioritarios',
            duracion: '2 hs',
            descripcion: 'Por la mañana: los temas críticos que quedan en rojo.',
            tecnica: 'lectura',
          },
          {
            id: 's4p4',
            titulo: 'Simulacro parcial',
            duracion: '1 hs',
            descripcion: 'La mitad de un parcial viejo. Corregí.',
            tecnica: 'simulacro',
          },
        ],
      },
      {
        id: 's4d4',
        titulo: 'Día 4 — Día del parcial',
        subtitulo: 'Máximo 1 hora de estudio',
        color: '#22c55e',
        pasos: [
          {
            id: 's4p5',
            titulo: 'Repaso ultraligero y descanso',
            duracion: '1 hs máx',
            descripcion: 'Solo tus preguntas centrales y conceptos clave. Comé bien. Llegá descansado.',
            tecnica: 'active-recall',
          },
        ],
      },
    ],
  },

  sprint2: {
    bloques: [
      {
        id: 's2m',
        titulo: 'Día 1 — Mañana',
        subtitulo: 'Los 3 temas más probables',
        color: '#dc2626',
        pasos: [
          {
            id: 's2p1',
            titulo: 'Estudiar los 3 temas de mayor peso',
            duracion: '3 hs',
            descripcion: 'Leer → cerrar → escribir todo lo que recordás → volver a leer para completar → repetir.',
            tecnica: 'active-recall',
          },
        ],
      },
      {
        id: 's2t',
        titulo: 'Día 1 — Tarde',
        subtitulo: 'Cobertura superficial',
        color: '#ef4444',
        pasos: [
          {
            id: 's2p2',
            titulo: 'Dos temas más a nivel concepto',
            duracion: '2 hs',
            descripcion: 'Solo los conceptos principales. Suficiente para escribir algo coherente si aparecen.',
            tecnica: 'lectura',
          },
        ],
      },
      {
        id: 's2n',
        titulo: 'Día 1 — Noche',
        subtitulo: 'Obligatorio',
        color: '#22c55e',
        pasos: [
          {
            id: 's2p3',
            titulo: 'Dormir',
            duracion: 'Toda la noche',
            descripcion: 'Estudiar de noche con el cerebro agotado tiene retorno casi nulo. El sueño consolida la memoria.',
            tecnica: 'espaciado',
          },
        ],
      },
      {
        id: 's2f',
        titulo: 'Día 2 — Día del parcial',
        subtitulo: 'Mañana antes del examen',
        color: '#f97316',
        pasos: [
          {
            id: 's2p4',
            titulo: 'Repaso ultraligero',
            duracion: '1 hs máx',
            descripcion: 'Solo las preguntas centrales de los 3 temas principales. No intentes aprender nada nuevo.',
            tecnica: 'active-recall',
          },
        ],
      },
    ],
  },
}

export type TecnicaConfig = {
  label: string
  bgClass: string
  textClass: string
}

export const TECNICA_CONFIG: Record<TecnicaGuia, TecnicaConfig> = {
  'active-recall': { label: '🧠 Active Recall', bgClass: 'bg-purple-50', textClass: 'text-purple-700' },
  'espaciado':     { label: '📅 Espaciado',      bgClass: 'bg-blue-50',   textClass: 'text-blue-700'   },
  'elaboracion':   { label: '🔗 Elaboración',    bgClass: 'bg-green-50',  textClass: 'text-green-700'  },
  'simulacro':     { label: '📋 Simulacro',      bgClass: 'bg-orange-50', textClass: 'text-orange-700' },
  'lectura':       { label: '📖 Lectura activa', bgClass: 'bg-gray-100',  textClass: 'text-gray-600'   },
}
