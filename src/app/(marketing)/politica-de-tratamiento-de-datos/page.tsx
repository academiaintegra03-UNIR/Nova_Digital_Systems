import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Tratamiento de Datos",
  description:
    "Política Integral de Tratamiento de Datos Personales y Habeas Data de Nova Digital Studio Systems (NDSS), conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-extrabold text-heading">{title}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground/80">{children}</div>
    </section>
  );
}

export default function PoliticaTratamientoDatosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <p className="mb-2 text-xs font-semibold tracking-wide text-cta uppercase">Habeas Data</p>
      <h1 className="mb-2 text-3xl font-extrabold text-heading">
        Política Integral de Tratamiento de Datos Personales y Habeas Data
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Ecosistema Tecnológico, Pedagógico y Multicanal de Nova Digital Studio Systems (NDSS) — vigente desde
        octubre de 2026.
      </p>

      <Section title="Encabezado y metadatos institucionales">
        <p>
          <strong className="text-heading">Razón social y marca registrada:</strong> Nova Digital Studio
          Systems (NDSS) — Boutique de Inteligencia Educativa.
        </p>
        <p>
          <strong className="text-heading">Responsable del tratamiento:</strong> Jimmy Alejandro Ramírez
          Martínez (persona natural responsable).
        </p>
        <p>
          <strong className="text-heading">Canales oficiales de atención:</strong>{" "}
          <a href="mailto:ingenieroeducativo@gmail.com" className="text-secondary-foreground underline hover:no-underline">
            ingenieroeducativo@gmail.com
          </a>{" "}
          y línea oficial de WhatsApp NDSS.
        </p>
        <p>
          <strong className="text-heading">Domicilio principal:</strong> Bogotá D.C., República de Colombia.
        </p>
        <p>
          <strong className="text-heading">Ámbito de aplicación ecosistémico:</strong> ecosistema web y
          plataformas digitales de NDSS (incluyendo Google Workspace, Google Sites, aplicaciones web
          interactivas, bases de datos Supabase/Firebase y canales de mensajería instantánea).
        </p>
      </Section>

      <Section title="Resumen ejecutivo y alcance integral del tratamiento">
        <p>
          Este documento constituye la norma rectora e ineludible para la recolección, almacenamiento, uso,
          procesamiento, circulación, supresión y protección de datos personales de todos los usuarios,
          estudiantes, acudientes, docentes, directivos escolares y aliados comerciales que interactúen con el
          ecosistema formativo y tecnológico de NDSS. NDSS ratifica su compromiso irrestricto de emplear la
          información tratada exclusivamente bajo parámetros de excelencia pedagógica, confidencialidad,
          seguridad digital avanzada en infraestructura cloud y absoluta abstención de comercialización o
          transferencia no autorizada a terceros.
        </p>
      </Section>

      <Section title="1. Marco jurídico y principios rectores">
        <p>
          El tratamiento de datos personales realizado por NDSS se rige por la Ley Estatutaria 1581 de 2012,
          el Decreto Reglamentario 1377 de 2013 y demás normas complementarias vigentes en la República de
          Colombia. La organización aplica con rigor los siguientes principios rectores:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-heading">Legalidad:</strong> el tratamiento es una actividad reglada que
            se somete estrictamente a las disposiciones normativas colombianas vigentes.
          </li>
          <li>
            <strong className="text-heading">Finalidad:</strong> toda recolección de datos obedece a un
            propósito legítimo, explícito e informado, comunicado de forma transparente al titular.
          </li>
          <li>
            <strong className="text-heading">Libertad:</strong> el tratamiento solo se ejerce con el
            consentimiento previo, expreso e informado del titular, sin mecanismos engañosos.
          </li>
          <li>
            <strong className="text-heading">Veracidad o calidad:</strong> la información debe ser veraz,
            completa, exacta, actualizada, comprobable y comprensible.
          </li>
          <li>
            <strong className="text-heading">Transparencia:</strong> se garantiza el derecho del titular a
            obtener en cualquier momento información sobre la existencia e historial de sus datos.
          </li>
          <li>
            <strong className="text-heading">Acceso y circulación restringida:</strong> el tratamiento se
            sujeta a los límites derivados de la naturaleza de los datos y de las autorizaciones otorgadas.
          </li>
          <li>
            <strong className="text-heading">Seguridad:</strong> la información se administra mediante
            protocolos cibernéticos y administrativos que previenen su adulteración, pérdida, acceso no
            autorizado o fuga.
          </li>
          <li>
            <strong className="text-heading">Confidencialidad:</strong> toda persona involucrada en la
            gestión de datos mantiene reserva profesional, extendida tras la finalización del vínculo
            contractual o académico.
          </li>
        </ul>
      </Section>

      <Section title="2. Ámbito de aplicación y grupos de titulares">
        <p>Esta política ampara y regula el tratamiento de información de:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Estudiantes de educación básica y media (Pre-Saber y Pre-ICFES, grados 9°, 10° y 11°).</li>
          <li>Estudiantes y postulantes internacionales (PAES en Chile, EXANI/Ceneval en México, MEP/PAA en Costa Rica, entre otros).</li>
          <li>Estudiantes universitarios y profesionales en mentorías de ciencias exactas, ingeniería, STEM y analítica.</li>
          <li>Padres de familia, acudientes y tutores legales.</li>
          <li>Directivos y docentes de instituciones educativas aliadas.</li>
          <li>Mentores, docentes colaboradores y pasantes del equipo pedagógico y técnico.</li>
          <li>Clientes potenciales y comunidad general (pruebas diagnósticas abiertas, simulacros gratuitos, webinars, descargas de recursos y seguidores en redes sociales).</li>
        </ul>
      </Section>

      <Section title="3. Categorías de datos objeto de tratamiento">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-heading">Identificación y contacto:</strong> nombres, apellidos, tipo y
            número de documento, correo electrónico, número de teléfono/WhatsApp, ciudad, país, colegio y
            grado cursado.
          </li>
          <li>
            <strong className="text-heading">Académicos, evaluativos y telemetría cognitiva:</strong>
            respuestas de prueba, puntajes por área, patrones de latencia de resolución, vacilación analítica
            y registros de navegación destinados a auditar la resiliencia en pruebas estandarizadas.
          </li>
          <li>
            <strong className="text-heading">Registros audiovisuales y sesiones sincrónicas:</strong>
            grabaciones de audio, video y transcripciones automatizadas en Google Meet, destinadas al
            aseguramiento de calidad pedagógica y soporte formativo.
          </li>
          <li>
            <strong className="text-heading">Financieros y de facturación:</strong> registro de
            transacciones, planes suscritos y estados de pago procesados a través de pasarelas certificadas
            (Wompi, Binance Pay, Global66). NDSS no almacena números de tarjetas ni credenciales bancarias
            sensibles.
          </li>
        </ul>
      </Section>

      <Section title="4. Finalidades explícitas del tratamiento">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Prestación personalizada de servicios de formación, entrenamiento cognitivo y tutoría académica.</li>
          <li>Emisión y despacho automatizado de credenciales de acceso a las plataformas de NDSS.</li>
          <li>Generación y entrega de reportes diagnósticos y métricas de resiliencia cognitiva.</li>
          <li>Comunicación vía WhatsApp y correo para notificaciones de clase, agenda, materiales y soporte técnico.</li>
          <li>Remisión periódica de informes de progreso (modelo GROW) a padres de familia y acudientes.</li>
          <li>Gestión administrativa, tributaria, contractual, contable y de cobro de planes suscritos.</li>
          <li>Difusión de nuevos programas, baterías diagnósticas, becas, simulacros y contenido pedagógico.</li>
        </ul>
        <p>
          <strong className="text-heading">Prohibición de comercialización:</strong> NDSS prohíbe
          categóricamente la venta, arrendamiento, intercambio o transferencia no autorizada de sus bases de
          datos a cualquier tercero.
        </p>
      </Section>

      <Section title="5. Tratamiento especial de datos de menores de edad">
        <p>
          En acatamiento del Artículo 7 de la Ley 1581 de 2012 y el Artículo 12 del Decreto 1377 de 2013,
          NDSS aplica salvaguardas especiales cuando trata datos de niños, niñas y adolescentes:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Se responde al Interés Superior de los menores y al respeto absoluto de sus derechos fundamentales.</li>
          <li>Las actividades evaluativas y de telemetría tienen un fin estrictamente educativo y orientador.</li>
          <li>Se promueve la participación e involucramiento de padres, acudientes o tutores legales en la vinculación y el seguimiento.</li>
          <li>Se prohíbe la recolección de datos sensibles (origen racial, convicciones religiosas, datos de salud o biométricos) sin autorización expresa legalmente justificada.</li>
        </ul>
      </Section>

      <Section title="6. Derechos de los titulares (Derechos ARCO) y canales de atención">
        <p>
          Los titulares de la información (o sus representantes legales) pueden ejercer en todo momento sus
          derechos de Acceso, Rectificación, Cancelación y Oposición:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Conocer, actualizar y rectificar sus datos personales frente a NDSS.</li>
          <li>Solicitar prueba de la autorización otorgada para el tratamiento.</li>
          <li>Revocar la autorización o solicitar la supresión del dato cuando considere que no se respetan los principios constitucionales.</li>
          <li>Acceder gratuitamente a la información tratada por la organización.</li>
        </ul>
        <p>
          Para realizar cualquier solicitud ARCO, el titular debe remitir un mensaje formal al correo
          oficial{" "}
          <a href="mailto:ingenieroeducativo@gmail.com" className="text-secondary-foreground underline hover:no-underline">
            ingenieroeducativo@gmail.com
          </a>
          .
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-heading">Consultas:</strong> atendidas en máximo diez (10) días hábiles
            desde la recepción, prorrogable por cinco (5) días hábiles adicionales con aviso previo.
          </li>
          <li>
            <strong className="text-heading">Reclamos y supresión:</strong> resueltos en máximo quince (15)
            días hábiles a partir del día siguiente a su recepción completa.
          </li>
        </ul>
      </Section>

      <Section title="7. Medidas de seguridad, almacenamiento y conservación">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-heading">Infraestructura cloud robusta:</strong> los datos se alojan en
            plataformas de nivel empresarial como Supabase, Firebase y Google Workspace, con cifrado de
            datos en reposo y en tránsito (TLS/SSL).
          </li>
          <li>
            <strong className="text-heading">Portafolios soberanos individualizados:</strong> cada
            estudiante dispone de una carpeta exclusiva en Google Drive con control de acceso jerárquico.
          </li>
          <li>
            <strong className="text-heading">Conservación:</strong> los datos se conservan durante el tiempo
            técnicamente indispensable para cumplir las finalidades pedagógicas y contractuales, o hasta que
            el titular solicite su revocatoria.
          </li>
        </ul>
      </Section>

      <Section title="8. Autorización de tratamiento">
        <p>
          Al aceptar el tratamiento de datos personales en cualquier formulario del ecosistema NDSS, el
          titular (o su representante legal) autoriza de manera libre, previa, expresa e informada a Nova
          Digital Studio Systems (NDSS) para tratar sus datos personales (contacto vía WhatsApp y correo
          electrónico) conforme a esta política. Entiende que la información será usada para gestionar sus
          credenciales de acceso, generar su reporte diagnóstico de competencias y enviarle orientaciones
          pedagógicas del ecosistema académico.
        </p>
        <p>
          En el marco de convenios educativos con instituciones aliadas, NDSS podrá actuar como Encargado o
          Co-responsable del Tratamiento de los datos de estudiantes y docentes, comprometiéndose a procesar
          la información exclusivamente para la ejecución del diagnóstico institucional, auditoría académica
          y entrega de métricas consolidadas a las directivas del plantel. Las sesiones sincrónicas en Google
          Meet podrán ser grabadas en audio, video y transcripción con fines exclusivos de auditoría de
          calidad académica, repaso estudiantil y soporte formativo.
        </p>
      </Section>
    </div>
  );
}
