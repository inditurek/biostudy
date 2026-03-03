-- Agrega el estado 'pendiente' para materias que aún no se cursaron
-- (estaban en el plan pero todavía no comenzaron)

alter table materias drop constraint estado_valido;

alter table materias add constraint estado_valido check (
  estado in ('cursando', 'aprobada', 'promocionada', 'libre', 'final_pendiente', 'pendiente')
);
