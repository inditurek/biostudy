-- ============================================================
-- Campos extra para eventos: locación, descripción, recurrencia
-- Aplicar en: Supabase dashboard → SQL Editor → New query → Run
-- ============================================================

alter table eventos add column if not exists locacion    text;
alter table eventos add column if not exists descripcion text;

-- Recurrencia: por defecto 'ninguna' (evento único)
alter table eventos add column if not exists recurrencia     text not null default 'ninguna';
alter table eventos add column if not exists recurrencia_fin date;

-- CHECK constraint
alter table eventos drop constraint if exists recurrencia_valida;
alter table eventos add constraint recurrencia_valida check (
  recurrencia in ('ninguna', 'semanal', 'quincenal', 'mensual')
);

-- Índice para buscar eventos recurrentes eficientemente
create index if not exists idx_eventos_recurrencia
  on eventos (usuario_id, recurrencia, fecha)
  where recurrencia != 'ninguna';
