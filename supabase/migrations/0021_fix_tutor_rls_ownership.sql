-- Corrige un hueco real encontrado en un security review: las policies
-- de tutor en clases/grupo_materias/actividades/foro_hilos/foro_mensajes/
-- materia_recursos solo verificaban `tutor_id = auth.uid()` (columna
-- propia de la fila) — nunca que el `grupo_id` referenciado sea
-- realmente de un grupo del tutor. Todo el ownership real vivía solo en
-- las Server Actions (verifyGrupoIsMine), pero RLS es la única barrera
-- real si alguien llama la API REST de Supabase directo con su propio
-- JWT + la anon key pública, sin pasar por el servidor de Next.js — ahí
-- un tutor podía escribir filas apuntando al grupo de OTRO tutor con solo
-- poner su propio id en `tutor_id`. Pegar en Supabase SQL Editor.
-- Requiere 0001..0020 ya aplicadas.

-- clases (0015)
drop policy "Los tutores gestionan sus propias clases" on public.clases;
create policy "Los tutores gestionan sus propias clases"
  on public.clases for all
  using (
    tutor_id = auth.uid()
    and exists (select 1 from public.grupos g where g.id = clases.grupo_id and g.tutor_id = auth.uid())
  )
  with check (
    tutor_id = auth.uid()
    and exists (select 1 from public.grupos g where g.id = clases.grupo_id and g.tutor_id = auth.uid())
  );

-- grupo_materias (0016)
drop policy "Los tutores gestionan las materias de sus grupos" on public.grupo_materias;
create policy "Los tutores gestionan las materias de sus grupos"
  on public.grupo_materias for all
  using (
    tutor_id = auth.uid()
    and exists (select 1 from public.grupos g where g.id = grupo_materias.grupo_id and g.tutor_id = auth.uid())
  )
  with check (
    tutor_id = auth.uid()
    and exists (select 1 from public.grupos g where g.id = grupo_materias.grupo_id and g.tutor_id = auth.uid())
  );

-- actividades (0016)
drop policy "Los tutores gestionan sus propias actividades" on public.actividades;
create policy "Los tutores gestionan sus propias actividades"
  on public.actividades for all
  using (
    tutor_id = auth.uid()
    and exists (select 1 from public.grupos g where g.id = actividades.grupo_id and g.tutor_id = auth.uid())
  )
  with check (
    tutor_id = auth.uid()
    and exists (select 1 from public.grupos g where g.id = actividades.grupo_id and g.tutor_id = auth.uid())
  );

-- foro_hilos (0017)
drop policy "Los tutores gestionan los hilos de sus grupos" on public.foro_hilos;
create policy "Los tutores gestionan los hilos de sus grupos"
  on public.foro_hilos for all
  using (
    tutor_id = auth.uid()
    and exists (select 1 from public.grupos g where g.id = foro_hilos.grupo_id and g.tutor_id = auth.uid())
  )
  with check (
    tutor_id = auth.uid()
    and exists (select 1 from public.grupos g where g.id = foro_hilos.grupo_id and g.tutor_id = auth.uid())
  );

-- foro_mensajes (0017) — sin grupo_id propio, se valida vía el hilo. Como
-- la policy de foro_hilos ya queda corregida arriba, un hilo con
-- tutor_id = X solo pudo haberlo creado legítimamente el tutor X.
drop policy "Los tutores gestionan los mensajes de sus hilos" on public.foro_mensajes;
create policy "Los tutores gestionan los mensajes de sus hilos"
  on public.foro_mensajes for all
  using (
    tutor_id = auth.uid()
    and exists (select 1 from public.foro_hilos h where h.id = foro_mensajes.hilo_id and h.tutor_id = auth.uid())
  )
  with check (
    tutor_id = auth.uid()
    and exists (select 1 from public.foro_hilos h where h.id = foro_mensajes.hilo_id and h.tutor_id = auth.uid())
  );

-- materia_recursos (0020)
drop policy "Los tutores gestionan los recursos de sus grupos" on public.materia_recursos;
create policy "Los tutores gestionan los recursos de sus grupos"
  on public.materia_recursos for all
  using (
    tutor_id = auth.uid()
    and exists (select 1 from public.grupos g where g.id = materia_recursos.grupo_id and g.tutor_id = auth.uid())
  )
  with check (
    tutor_id = auth.uid()
    and exists (select 1 from public.grupos g where g.id = materia_recursos.grupo_id and g.tutor_id = auth.uid())
  );
