-- Tabla para registrar sesiones de estudio del Temporizador de Foco.
-- Una sesión = un conjunto de bloques completados (o parcialmente completados).
-- Prerequisito: aplicar DESPUÉS de crear la migración en Supabase SQL Editor.

create table sesiones_foco (
  id           uuid primary key default gen_random_uuid(),
  usuario_id   uuid references auth.users(id) on delete cascade not null,
  fecha        date not null,             -- 'YYYY-MM-DD'
  duracion_min integer not null,          -- minutos de FOCO completados (no pausa)
  preset       text not null default 'personalizado',
  materia_id   uuid references materias(id) on delete set null,
  completada   boolean not null default true,  -- false = sesión interrumpida
  creado_en    timestamptz default now(),

  constraint preset_valido check (
    preset in ('pomodoro', 'deep-work', 'sprint-corto', 'personalizado')
  )
);

create index on sesiones_foco (usuario_id, fecha);
alter table sesiones_foco enable row level security;

create policy "usuario gestiona sus sesiones"
  on sesiones_foco for all
  using (auth.uid() = usuario_id);
