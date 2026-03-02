-- ============================================================
-- MyLocus — Schema inicial
-- Aplicar en: Supabase dashboard → SQL Editor → New query → Run
-- ============================================================


-- ============================================================
-- 1. PERFILES
-- Datos del usuario. El id es el mismo que auth.users para
-- poder hacer JOIN sin una columna extra.
-- ============================================================
create table perfiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  nombre       text not null,
  carrera      text not null,
  universidad  text not null,
  creado_en    timestamptz default now()
);

alter table perfiles enable row level security;

create policy "usuario gestiona su perfil"
  on perfiles for all
  using (auth.uid() = id);


-- ============================================================
-- 2. CUADERNOS
-- Agrupan separadores por materia o tema.
-- ============================================================
create table cuadernos (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid references auth.users(id) on delete cascade not null,
  nombre      text not null,
  color       text not null default '#7c3aed',
  orden       integer not null default 0,
  creado_en   timestamptz default now()
);

create index on cuadernos (usuario_id, orden);

alter table cuadernos enable row level security;

create policy "usuario gestiona sus cuadernos"
  on cuadernos for all
  using (auth.uid() = usuario_id);


-- ============================================================
-- 3. SEPARADORES
-- Cada cuaderno tiene varios separadores (temas, unidades, etc.)
-- ============================================================
create table separadores (
  id           uuid primary key default gen_random_uuid(),
  cuaderno_id  uuid references cuadernos(id) on delete cascade not null,
  nombre       text not null,
  color        text not null default '#7c3aed',
  orden        integer not null default 0,
  creado_en    timestamptz default now()
);

create index on separadores (cuaderno_id, orden);

alter table separadores enable row level security;

-- RLS via join a cuadernos para obtener usuario_id
create policy "usuario gestiona sus separadores"
  on separadores for all
  using (
    exists (
      select 1 from cuadernos
      where cuadernos.id = separadores.cuaderno_id
        and cuadernos.usuario_id = auth.uid()
    )
  );


-- ============================================================
-- 4. ARCHIVOS
-- Archivos cargados dentro de un separador (PDFs, imágenes, links).
-- ============================================================
create table archivos (
  id            uuid primary key default gen_random_uuid(),
  separador_id  uuid references separadores(id) on delete cascade not null,
  nombre        text not null,
  tipo          text not null,   -- 'pdf' | 'imagen' | 'link' | 'nota'
  url_storage   text not null,
  tamano        integer not null default 0,  -- tamaño en bytes
  creado_en     timestamptz default now()
);

create index on archivos (separador_id);

alter table archivos enable row level security;

-- RLS via join separadores → cuadernos
create policy "usuario gestiona sus archivos"
  on archivos for all
  using (
    exists (
      select 1
      from separadores s
      join cuadernos c on c.id = s.cuaderno_id
      where s.id = archivos.separador_id
        and c.usuario_id = auth.uid()
    )
  );


-- ============================================================
-- 5. MATERIAS
-- Historial académico: cada materia cursada o en curso.
-- ============================================================
create table materias (
  id            uuid primary key default gen_random_uuid(),
  usuario_id    uuid references auth.users(id) on delete cascade not null,
  nombre        text not null,
  anio          integer not null,
  cuatrimestre  integer not null,  -- 1 o 2
  estado        text not null default 'cursando',
  creado_en     timestamptz default now(),

  constraint estado_valido check (
    estado in ('cursando', 'aprobada', 'promocionada', 'libre', 'final_pendiente')
  ),
  constraint cuatrimestre_valido check (cuatrimestre in (1, 2))
);

create index on materias (usuario_id, anio, cuatrimestre);

alter table materias enable row level security;

create policy "usuario gestiona sus materias"
  on materias for all
  using (auth.uid() = usuario_id);


-- ============================================================
-- 6. NOTAS_MATERIA
-- Notas de cada instancia de evaluación de una materia.
-- Todos los campos son nullable: se completan a medida que ocurren.
-- ============================================================
create table notas_materia (
  id              uuid primary key default gen_random_uuid(),
  materia_id      uuid references materias(id) on delete cascade not null unique,
  p1              numeric(4,2),   -- parcial 1
  p2              numeric(4,2),   -- parcial 2
  recuperatorio   numeric(4,2),
  cursada         numeric(4,2),   -- nota final de cursada
  final           numeric(4,2)
);

alter table notas_materia enable row level security;

-- RLS via join a materias
create policy "usuario gestiona sus notas"
  on notas_materia for all
  using (
    exists (
      select 1 from materias
      where materias.id = notas_materia.materia_id
        and materias.usuario_id = auth.uid()
    )
  );


-- ============================================================
-- 7. EVENTOS
-- Calendario: clases, parciales, tareas, eventos personales.
-- ============================================================
create table eventos (
  id           uuid primary key default gen_random_uuid(),
  usuario_id   uuid references auth.users(id) on delete cascade not null,
  titulo       text not null,
  tipo         text not null,   -- 'clase'|'parcial'|'tarea'|'personal'|'sprint'
  fecha        date not null,
  hora_inicio  time,
  hora_fin     time,
  todo_el_dia  boolean not null default false,
  creado_en    timestamptz default now(),

  constraint tipo_valido check (
    tipo in ('clase', 'parcial', 'tarea', 'personal', 'sprint')
  )
);

create index on eventos (usuario_id, fecha);

alter table eventos enable row level security;

create policy "usuario gestiona sus eventos"
  on eventos for all
  using (auth.uid() = usuario_id);


-- ============================================================
-- 8. TODOS
-- Lista de tareas, integrada al calendario por fecha.
-- ============================================================
create table todos (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid references auth.users(id) on delete cascade not null,
  texto       text not null,
  completado  boolean not null default false,
  categoria   text not null default 'general',
  fecha       date,
  orden       integer not null default 0,
  creado_en   timestamptz default now()
);

create index on todos (usuario_id, fecha);

alter table todos enable row level security;

create policy "usuario gestiona sus todos"
  on todos for all
  using (auth.uid() = usuario_id);


-- ============================================================
-- 9. PROGRESO_GUIA
-- Guarda el estado de avance de la Guía de Estudio por separador.
-- Un separador tiene exactamente un registro de progreso (unique).
-- ============================================================
create table progreso_guia (
  id                  uuid primary key default gen_random_uuid(),
  separador_id        uuid references separadores(id) on delete cascade not null unique,
  modo                text not null default 'cursada',
  duracion_sprint     integer,  -- 7 | 4 | 2 (solo aplica si modo = 'sprint')
  bloque_actual       text not null default '',
  pasos_completados   text[] not null default '{}',
  fecha_inicio        timestamptz default now(),
  updated_at          timestamptz default now(),

  constraint modo_valido check (modo in ('cursada', 'examen', 'sprint')),
  constraint duracion_sprint_valido check (
    duracion_sprint is null or duracion_sprint in (7, 4, 2)
  )
);

alter table progreso_guia enable row level security;

-- RLS via join separadores → cuadernos
create policy "usuario gestiona su progreso"
  on progreso_guia for all
  using (
    exists (
      select 1
      from separadores s
      join cuadernos c on c.id = s.cuaderno_id
      where s.id = progreso_guia.separador_id
        and c.usuario_id = auth.uid()
    )
  );


-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- Se usa en progreso_guia para saber cuándo se modificó por última vez.
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_progreso_guia_updated_at
  before update on progreso_guia
  for each row execute function set_updated_at();
