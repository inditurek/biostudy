# STYLE.md — Estilo de salida para Claude Code

Este archivo define cómo debe comportarse Claude en cada sesión de desarrollo
de StudyLab. Leerlo al inicio de cada conversación de código.

---

## Perfil del usuario

- **Nivel**: principiante que aprende mientras construye.
- **Objetivo**: entender lo que está haciendo, no solo que funcione.
- **Contexto**: está construyendo StudyLab como herramienta personal de estudio.

Claude debe asumir que el usuario puede no conocer patrones avanzados de Next.js,
Supabase o TypeScript. Nunca asumir conocimiento previo sin verificarlo.

---

## Formato de respuesta al pedir un feature

### Siempre seguir este orden:

**1. Enfoque** (antes de escribir una sola línea de código)
Explicar en 3-5 líneas qué se va a hacer y por qué de esa forma.
Mencionar si hay más de una opción válida y cuál se elige y por qué.

```
Ejemplo:
"Para conectar el chat al backend voy a usar un Route Handler de Next.js
en vez de un Server Action, porque necesitamos streaming de la respuesta
de Claude. Los Server Actions no soportan streaming todavía."
```

**2. Archivos a crear o modificar**
Listar con rutas completas antes de mostrar el código:
```
Voy a crear / modificar:
- app/api/chat/route.ts          ← nuevo Route Handler
- components/guia/ChatPanel.tsx  ← agregar lógica de streaming
- lib/claude/client.ts           ← función reutilizable
```

**3. Código**
- Siempre archivos completos, listos para copiar y pegar.
- Sin `// ... resto del código` ni fragmentos incompletos.
- Con comentarios en español en las partes no obvias.

**4. Cómo probarlo**
Una instrucción concreta de qué hacer para verificar que funciona.

---

## TypeScript

- Siempre tipos explícitos. Nunca `any`.
- Definir interfaces y types en el mismo archivo si son locales,
  o en `lib/supabase/types.ts` si son de base de datos.
- Incluir tipos de retorno en funciones async.

```ts
// ✅ Correcto
async function getNotebook(id: string): Promise<Notebook | null> { ... }

// ❌ Incorrecto
async function getNotebook(id) { ... }
```

---

## Comentarios en el código

Comentar **el por qué**, no el qué. El código dice qué hace; el comentario
explica por qué se eligió ese enfoque.

```ts
// ✅ Útil
// Usamos el cliente de servidor aquí porque este componente corre en el servidor
// y necesita acceso a la sesión sin exponer la clave al cliente
const supabase = createServerClient()

// ❌ Inútil
// Creamos el cliente de supabase
const supabase = createServerClient()
```

Comentarios siempre en español.

---

## Comportamiento proactivo

Sin que el usuario lo pida, Claude debe:

### 🐛 Señalar bugs y edge cases
Al final de cada bloque de código, agregar una sección breve:
```
⚠️ Edge cases a tener en cuenta:
- Si el archivo supera 5MB, la carga va a fallar silenciosamente. Habría que
  agregar validación de tamaño antes del upload.
- Si el usuario cierra el tab durante el streaming, el request queda colgado.
```

### ⚡ Sugerir mejoras de performance
Solo cuando sean relevantes y no compliquen el código innecesariamente:
```
💡 Performance: Esta query trae todos los separadores del cuaderno.
Si un cuaderno llega a tener muchos separadores, conviene agregar paginación.
Por ahora está bien, pero vale tenerlo en mente.
```

### 🏗️ Explicar decisiones de arquitectura
Cuando se elige entre dos opciones válidas, explicar la elección:
```
🏗️ Por qué Route Handler y no Server Action:
Los Server Actions están pensados para mutaciones (crear, editar, borrar).
Para este chat necesitamos leer una respuesta en streaming, que es más natural
con un Route Handler que devuelve un ReadableStream.
```

### 📝 Tipos TypeScript completos
Nunca dejar un tipo sin definir. Si no existe en el proyecto todavía,
crearlo en el mismo bloque de código y aclararlo.

---

## Tono y nivel de explicación

- Hablar de forma directa, sin jerga innecesaria.
- Si hay un término técnico importante, explicarlo entre paréntesis la primera
  vez que aparece en la sesión.
- No asumir que el usuario sabe qué es un "Server Component", un "Route Handler"
  o un "RLS policy" — explicar brevemente cada vez que aparezcan por primera vez.
- No ser condescendiente. Explicar sin dar a entender que es obvio.

---

## Lo que Claude NO debe hacer

- ❌ Entregar fragmentos de código incompletos con `// ...`.
- ❌ Usar `any` en TypeScript.
- ❌ Asumir que el usuario sabe cómo conectar los archivos entre sí — siempre
  aclarar dónde va cada archivo y cómo se importa.
- ❌ Dar dos opciones y dejar que el usuario elija sin orientación — elegir una
  y explicar por qué.
- ❌ Responder solo con código sin ningún contexto.
- ❌ Usar inglés en los comentarios del código.
- ❌ Modificar los archivos en `/prototypes/` — son solo referencia visual.

---

## Ejemplo de respuesta ideal

**Usuario:** "Quiero que cuando haga clic en una herramienta en la Guía de Estudio,
la IA genere el contenido correspondiente."

**Claude:**

> **Enfoque:** Voy a crear un endpoint de API que recibe el tipo de herramienta
> (tarjetas, cuestionario, mapa mental, etc.) y las fuentes del separador, y le
> pide a Claude que genere el contenido en formato estructurado. Uso un Route Handler
> porque en el futuro podríamos agregar streaming.
>
> **Archivos:**
> - `app/api/generar-herramienta/route.ts` ← nuevo
> - `components/guia/ToolsGrid.tsx` ← modificar para conectar al endpoint
> - `lib/claude/prompts/herramientas.ts` ← system prompts por herramienta
>
> [código completo de cada archivo]
>
> **Para probarlo:** Abrí un separador, hacé clic en "Tarjetas" y deberías ver
> el spinner seguido del resultado en el chat.
>
> ⚠️ **Edge case:** Si las fuentes son muy largas, el request puede superar el
> límite de contexto de Claude. Hay que agregar truncado de texto en el paso 2.
