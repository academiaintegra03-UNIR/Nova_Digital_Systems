-- Colegio del postulante a la prueba gratuita, igual que diagnosticos.colegio
-- (0018): texto libre tomado del catálogo de instituciones
-- (src/lib/data/instituciones.json) o escrito a mano si no aparece ahí.
-- No es una FK a profiles.colegio_id — ese es el colegio aliado con cuenta
-- en la plataforma, que casi nunca será el caso de un lead del sitio público.
-- Nullable porque las postulaciones anteriores no lo tienen; el formulario
-- lo exige a partir de ahora. El tope de longitud coincide con
-- COLEGIO_MAX_LENGTH en src/lib/validation/colegio.ts.
-- Pegar en Supabase SQL Editor. Requiere 0001..0026 ya aplicadas.

alter table public.postulaciones_prueba_gratuita
  add column colegio text
    constraint postulaciones_prueba_gratuita_colegio_length check (char_length(colegio) <= 200);
