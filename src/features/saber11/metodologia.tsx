import { CATEGORIAS } from "@/lib/saber11/data";
import { CategoriaBadge } from "@/features/saber11/componentes";

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-2 overflow-x-auto rounded-lg bg-muted/60 px-3 py-2 font-mono text-xs text-heading">{children}</div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-bold text-heading">{titulo}</h3>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/80">{children}</div>
    </section>
  );
}

export function Metodologia() {
  return (
    <div className="max-w-3xl space-y-9">
      <p className="text-sm leading-relaxed text-foreground/80">
        Este sistema aplica los lineamientos y fórmulas del ICFES establecidos en la{" "}
        <strong className="text-heading">Resolución 677 de 2021</strong> (que modificó la Resolución 268 de 2020) para la
        clasificación de planteles educativos.
      </p>

      <Seccion titulo="1. Los dos tipos de promedio: simple y ponderado">
        <p>
          <strong className="text-heading">Promedio simple (aritmético):</strong> la suma de los puntajes de las 5
          materias dividida entre 5. Todas pesan lo mismo (20% cada una).
        </p>
        <Formula>Promedio simple = (Lectura + Matemáticas + Ciencias + Sociales + Inglés) / 5</Formula>
        <p>
          <strong className="text-heading">Promedio ponderado oficial (ICFES):</strong> da peso 3 a las materias del
          núcleo formativo y peso 1 a inglés. El divisor es la suma de los pesos (3+3+3+3+1 = 13).
        </p>
        <Formula>Promedio ponderado = [ 3 × (Lectura + Matemáticas + Ciencias + Sociales) + 1 × Inglés ] / 13</Formula>
        <p>
          <em>¿Por qué inglés pesa 1?</em> Para que el nivel de bilingüismo no eclipse el desempeño en razonamiento
          cuantitativo, comprensión lectora y ciencias.
        </p>
      </Seccion>

      <Seccion titulo="2. Ventana móvil trienal (2024, 2025 y 2026)">
        <p>
          La Resolución 677 exige que la clasificación oficial considere la{" "}
          <strong className="text-heading">cohorte acumulada de los tres últimos años consecutivos</strong>.
        </p>
        <p>
          El ICFES no aplica porcentajes fijos como 50%-30%-20%: cada año aporta al promedio trienal en proporción al
          número de estudiantes que presentó la institución en esa vigencia.
        </p>
      </Seccion>

      <Seccion titulo="3. Puntos de corte de las categorías">
        <p>Con el índice global unificado (escala de 0 a 100) se asigna la categoría oficial:</p>
        <ul className="space-y-2">
          {CATEGORIAS.map((c) => (
            <li key={c.id} className="flex items-center gap-3">
              <CategoriaBadge cat={c.id} />
              <span>
                <strong className="text-heading">{c.nombre}:</strong> {c.rango}.
              </span>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion titulo="4. Los percentiles (0 a 100%)">
        <p>El percentil indica qué porcentaje de colegios del país tuvo un puntaje menor o igual al del colegio.</p>
        <p>
          Un colegio con <strong className="text-heading">percentil 95 en matemáticas</strong> superó al 95% de los
          colegios de Colombia en esa materia: está en el 5% de mayor rendimiento nacional.
        </p>
      </Seccion>

      <Seccion titulo="5. La regla del 20% y los colegios en zona frontera">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-heading">Asistencia:</strong> si la diferencia entre inscritos y asistentes en los
            últimos 3 años es menor al 20%, la norma ordena excluir, para cada una de las 5 pruebas, el 20% de los
            resultados más bajos. Los cálculos oficiales se hacen con el 80% restante.
          </li>
          <li>
            <strong className="text-heading">Efecto en el promedio:</strong> al quitar el 20% de notas más bajas, el
            promedio institucional sube entre 1,5 y 2,5 puntos.
          </li>
          <li>
            <strong className="text-heading">Disponibilidad de datos:</strong> en octubre el ICFES solo publica el
            reporte agregado por colegio en PRISMA. Los microdatos individuales, necesarios para aplicar el recorte,
            se publican meses después en DataIcfes; por eso en octubre nadie puede aplicarlo todavía.
          </li>
          <li>
            <strong className="text-heading">Zona frontera:</strong> marcamos los colegios cuyo índice trienal está a
            menos de 2 puntos del corte superior (por ejemplo, categoría A con índice entre 75,0 y 77,0). Cuando el
            ICFES aplique el descarte del 20%, tienen alta probabilidad de subir de categoría.
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="6. ¿Por qué ~10.000 colegios si hay más de 14.000 sedes?">
        <p>
          Cerca de 3.000 sedes rurales multigrado o de validación nocturna presentan solo entre 1 y 4 estudiantes. Por
          protección de datos (habeas data estadístico del DANE y del ICFES), no se publican promedios de grupos de
          menos de 5 evaluados.
        </p>
      </Seccion>

      <Seccion titulo="7. Posición y ámbito del puesto">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-heading">Posición:</strong> limita cuántos colegios ver (top 5, 10, 20, 50, 100,
            200 o todos).
          </li>
          <li>
            <strong className="text-heading">Puesto en:</strong> define contra quién se compara: la combinación actual
            de filtros, su municipio, su departamento o todo el país.
          </li>
        </ul>
      </Seccion>
    </div>
  );
}
