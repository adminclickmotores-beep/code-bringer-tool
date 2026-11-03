import { FileText, ShieldAlert, ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { whatsappLink, WHATSAPP_DISPLAY } from '@/jg/lib/supabase';

interface LegalPageProps {
  onNavigate: (page: string) => void;
}

export const LEGAL_OPERATOR =
  'ClickMotores es una marca comercial y vitrina virtual operada legalmente por Jg Motors (NIT 1130674978-2).';

const RESPONSABLE = 'JG Motors (NIT 1130674978-2)';
const SEDE = 'Yumbo / Cali, Valle del Cauca, Colombia';
const WHATSAPP_HABEAS = 'Hola ClickMotores, quiero ejercer mis derechos de Habeas Data (conocer, actualizar, rectificar o suprimir mis datos).';

function LegalShell({ icon, title, updated, index, children, onNavigate }: { icon: ReactNode; title: string; updated: string; index: { id: string; label: string }[]; children: ReactNode; onNavigate: (p: string) => void }) {
  return (
    <div className="animate-fade-in">
      <div className="border-b border-jg-silver bg-jg-surface py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="mb-6 inline-flex items-center gap-2 text-sm text-jg-text-muted transition-colors hover:text-jg-text"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </button>
          <span className="badge border border-jg-red/30 bg-jg-red/10 text-jg-red">
            {icon}
            Legal
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-jg-text-muted">{LEGAL_OPERATOR}</p>
          <p className="mt-1 text-xs text-jg-text-muted">Última actualización: {updated}</p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {index.length > 0 && (
          <nav aria-label="Contenido de esta página" className="card mb-10 p-5 sm:p-6">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-jg-text-muted">Contenido</p>
            <ol className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {index.map((item, i) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-sm text-jg-text-muted transition-colors hover:text-jg-red">
                    {i + 1}. {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        {children}
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="leading-relaxed">{children}</p>;
}

const TERMS_INDEX = [
  { id: 't-operador', label: 'Operador legal y aceptación' },
  { id: 't-objeto', label: 'Objeto de los servicios' },
  { id: 't-planes', label: 'Publicaciones, planes y vigencia' },
  { id: 't-consignacion', label: 'Consignación y comisión' },
  { id: 't-retoma', label: 'Retomas y venta directa' },
  { id: 't-garantia', label: 'Vehículos usados y garantía' },
  { id: 't-peritaje', label: 'Peritaje vehicular' },
  { id: 't-tramites', label: 'Trámites de tránsito' },
  { id: 't-seguros', label: 'SOAT y seguros todo riesgo' },
  { id: 't-financiacion', label: 'Financiación y créditos' },
  { id: 't-terceros', label: 'Contenido de terceros' },
  { id: 't-propiedad', label: 'Propiedad intelectual y fotos' },
  { id: 't-datos', label: 'Datos personales' },
  { id: 't-facturacion', label: 'Facturación y contratos' },
  { id: 't-ley', label: 'Ley aplicable y jurisdicción' },
  { id: 't-contacto', label: 'Contacto y soporte' },
];

const HABEAS_INDEX = [
  { id: 'h-responsable', label: 'Responsable del tratamiento' },
  { id: 'h-definiciones', label: 'Definiciones' },
  { id: 'h-principios', label: 'Principios' },
  { id: 'h-datos', label: 'Datos que recolectamos' },
  { id: 'h-finalidades', label: 'Finalidades' },
  { id: 'h-tarjeta', label: 'Tarjeta de propiedad y fotos' },
  { id: 'h-derechos', label: 'Derechos del titular' },
  { id: 'h-procedimiento', label: 'Consultas y reclamos' },
  { id: 'h-seguridad', label: 'Seguridad y confidencialidad' },
  { id: 'h-terceros', label: 'Encargados y terceros' },
  { id: 'h-menores', label: 'Datos de menores' },
  { id: 'h-vigencia', label: 'Vigencia y contacto' },
];

export function TermsPage({ onNavigate }: LegalPageProps) {
  return (
    <LegalShell icon={<FileText className="h-4 w-4" />} title="Términos y Condiciones — ClickMotores" updated="Noviembre de 2026" index={TERMS_INDEX} onNavigate={onNavigate}>
      <div className="space-y-8 text-jg-text">
        <Section id="t-operador" title="1. Operador legal y aceptación">
          <P>
            La marca comercial y plataforma tecnológica <strong>ClickMotores</strong> es operada legalmente por <strong>{RESPONSABLE}</strong>, establecimiento de comercio de persona natural comerciante, domiciliado en {SEDE}. Al acceder, registrarse, publicar o utilizar los servicios de nuestra vitrina digital, el usuario acepta de manera expresa, previa e informada los presentes Términos y Condiciones.
          </P>
        </Section>

        <Section id="t-objeto" title="2. Objeto de los servicios">
          <P>
            ClickMotores actúa como vitrina virtual e intermediaria comercial especializada en la compra, venta, consignación y retoma de motocicletas y automóviles multimarca (nuevos y usados), propios y de terceros, con cobertura en todo el territorio colombiano. También ofrece servicios complementarios de pauta publicitaria, trámites de tránsito, peritajes, SOAT y seguros, y gestión de financiación vehicular.
          </P>
        </Section>

        <Section id="t-planes" title="3. Publicaciones, planes y vigencia">
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li><strong>Publicación gratuita inicial:</strong> los avisos de terceros incluyen un período gratuito de exhibición de 20 días. Vencido ese plazo, el aviso se desactiva y el propietario deberá adquirir o renovar un plan para reactivarlo.</li>
            <li><strong>Planes vigentes:</strong> Renovación Simple (30 días, $20.000 COP), Plan Destacado (30 días, $35.000 COP) y Trimestral Destacado (90 días, $50.000 COP). Los valores se informan antes del pago y pueden actualizarse en la plataforma.</li>
            <li><strong>Veracidad:</strong> el anunciante garantiza que los datos del automotor (marca, modelo, año, kilometraje, estado, precio y ciudad) son verídicos y exactos.</li>
            <li><strong>Derecho de admisión:</strong> JG Motors se reserva el derecho de rechazar, suspender o eliminar cualquier publicación con inconsistencias, sospecha de fraude, placas adulteradas o documentación irregular, sin que ello genere indemnización.</li>
          </ul>
        </Section>

        <Section id="t-consignacion" title="4. Consignación y comisión por venta">
          <P>
            Para el servicio de consignación (carros y motos de terceros), el propietario cancela un <strong>pago único de $100.000 COP por gestión comercial y pauta publicitaria, no reembolsable</strong>, destinado a cubrir los costos operativos de exhibición y filtrado de compradores. Al concretarse la venta se causa una comisión del <strong>3% para carros y 5% para motos</strong> sobre el valor de venta. El vehículo no queda retenido físicamente de forma obligatoria, pero el propietario se obliga a mantenerlo disponible para presentación inmediata o peritaje cuando un comprador interesado lo requiera.
          </P>
        </Section>

        <Section id="t-retoma" title="5. Retomas y venta directa">
          <P>
            JG Motors recibe vehículos de menor valor como parte de pago (retoma) y realiza compra directa de vehículos propios y de terceros bajo negociación directa. Los avalúos y ofertas están sujetos a verificación física, peritaje técnico y revisión de antecedentes legales en RUNT y SIMIT. La oferta de retoma tiene la vigencia que se indique en la cotización y puede variar según el estado real del vehículo.
          </P>
        </Section>

        <Section id="t-garantia" title="6. Vehículos usados y garantía">
          <P>
            Los vehículos usados se venden en el estado en que se encuentran al momento de la entrega, el cual el comprador declara conocer y aceptar tras la inspección y, si lo desea, el peritaje. Cada vehículo publicado como verificado pasó por una inspección técnica de JG Motors; sin embargo, por tratarse de bienes usados con desgaste natural, JG Motors no otorga garantía de fábrica ni responde por fallas derivadas del uso posterior, modificaciones del comprador o falta de mantenimiento. Los vicios ocultos se rigen por la ley colombiana aplicable.
          </P>
        </Section>

        <Section id="t-peritaje" title="7. Peritaje vehicular">
          <P>
            El comprador tiene la facultad y la responsabilidad de solicitar un peritaje técnico para verificar el estado estructural, mecánico y legal del vehículo. <strong>El costo total del peritaje lo asume el comprador</strong>, quien es libre de escoger el centro de diagnóstico (CDA) o perito autorizado de su preferencia.
          </P>
        </Section>

        <Section id="t-tramites" title="8. Gestión de trámites de tránsito">
          <P>
            JG Motors ofrece gestión y acompañamiento en traspasos de propiedad, levantamiento e inscripción de prendas, traslados de cuenta y certificados ante organismos de tránsito. Comprador y vendedor se comprometen a entregar oportunamente paz y salvos, impuestos al día y la documentación exigida por la norma. JG Motors no responde por demoras imputables a las Secretarías de Movilidad, el RUNT o las plataformas nacionales de tránsito.
          </P>
        </Section>

        <Section id="t-seguros" title="9. Cotización y venta de seguros (SOAT y todo riesgo)">
          <P>
            La plataforma facilita la cotización y expedición del SOAT y de pólizas todo riesgo para autos y motos a través de intermediarios y compañías aseguradoras legalmente autorizadas en Colombia. Las condiciones, coberturas, exclusiones y precios son los definidos por cada aseguradora en la póliza respectiva.
          </P>
        </Section>

        <Section id="t-financiacion" title="10. Financiación y créditos vehiculares">
          <P>
            JG Motors actúa exclusivamente como canal de gestión y radicación de solicitudes de crédito ante entidades aliadas (Sufi, Banco de Bogotá, Santander Finandina u otras). <strong>La aprobación o negación del crédito es decisión autónoma de cada entidad financiera</strong> según sus políticas de riesgo y el estudio de crédito del solicitante; JG Motors no garantiza aprobaciones ni define tasas, plazos o cuotas.
          </P>
        </Section>

        <Section id="t-terceros" title="11. Contenido publicado por terceros">
          <P>
            Los avisos identificados como publicados por terceros (propietarios o aliados) son responsabilidad exclusiva de quien los publica en cuanto a veracidad, precio, estado y disponibilidad. ClickMotores valida los documentos aportados al momento de la publicación, pero no es parte del contrato de compraventa entre particulares salvo que JG Motors intervenga expresamente como consignataria o vendedora.
          </P>
        </Section>

        <Section id="t-propiedad" title="12. Propiedad intelectual y fotografías">
          <P>
            Las marcas ClickMotores y JG Motors, los diseños y los textos de la plataforma están protegidos por las normas de propiedad intelectual. Al subir fotografías, el usuario autoriza a JG Motors a incluir la marca de agua de ClickMotores y a usarlas con fines de exhibición y pauta publicitaria del vehículo. Queda prohibido copiar, descargar masivamente o reutilizar el contenido de la vitrina sin autorización escrita.
          </P>
        </Section>

        <Section id="t-datos" title="13. Tratamiento de datos personales (Ley 1581 de 2012)">
          <P>
            El usuario autoriza de manera previa, expresa e informada a <strong>{RESPONSABLE}</strong> para recolectar, almacenar y tratar sus datos personales y los de su vehículo con fines comerciales, de contacto por WhatsApp y de gestión financiera o documental, según nuestra <a href="/habeas-data" className="text-jg-red hover:underline">Política de Habeas Data</a>.
          </P>
          <P>
            <strong>Confidencialidad de la tarjeta de propiedad:</strong> se almacena en un servidor privado y se usa exclusivamente para verificación jurídica interna (RUNT y SIMIT). <em>Nunca es pública ni visible para terceros en la vitrina digital.</em>
          </P>
        </Section>

        <Section id="t-facturacion" title="14. Facturación y contratos">
          <P>
            Los contratos de consignación, compraventa, certificados y documentos contables o facturas se suscriben y emiten oficialmente bajo la razón social de <strong>{RESPONSABLE}</strong>, con los impuestos y retenciones de ley cuando apliquen.
          </P>
        </Section>

        <Section id="t-ley" title="15. Ley aplicable y jurisdicción">
          <P>
            Estos Términos se rigen por las leyes de la República de Colombia. Cualquier controversia se someterá a los jueces competentes del domicilio del operador ({SEDE}), sin perjuicio de las acciones de protección al consumidor ante la Superintendencia de Industria y Comercio.
          </P>
        </Section>

        <Section id="t-contacto" title="16. Contacto y soporte">
          <P>
            Para inquietudes o soporte, escríbenos por WhatsApp corporativo al <a href={whatsappLink('Hola ClickMotores, tengo una consulta sobre soporte.')} target="_blank" rel="noopener noreferrer" className="text-jg-red hover:underline">{WHATSAPP_DISPLAY}</a> o visítanos en nuestra sede en {SEDE}.
          </P>
        </Section>
      </div>
    </LegalShell>
  );
}

export function PrivacyPage({ onNavigate }: LegalPageProps) {
  return (
    <LegalShell icon={<ShieldAlert className="h-4 w-4" />} title="Política de Tratamiento de Datos (Habeas Data — Ley 1581 de 2012)" updated="Noviembre de 2026" index={HABEAS_INDEX} onNavigate={onNavigate}>
      <div className="space-y-8 text-jg-text">
        <Section id="h-responsable" title="1. Responsable del tratamiento">
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li><strong>Responsable:</strong> {RESPONSABLE}.</li>
            <li><strong>Domicilio:</strong> {SEDE}.</li>
            <li><strong>Canal de atención de datos personales:</strong> WhatsApp <a href={whatsappLink(WHATSAPP_HABEAS)} target="_blank" rel="noopener noreferrer" className="text-jg-red hover:underline">{WHATSAPP_DISPLAY}</a>.</li>
            <li><strong>Marco legal:</strong> Ley 1581 de 2012, Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y demás normas concordantes, bajo vigilancia de la Superintendencia de Industria y Comercio.</li>
          </ul>
        </Section>

        <Section id="h-definiciones" title="2. Definiciones">
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li><strong>Dato personal:</strong> cualquier información vinculada a una persona identificada o identificable (nombre, teléfono, correo, placa, etc.).</li>
            <li><strong>Titular:</strong> la persona natural cuyos datos son tratados (visitante, comprador, vendedor, anunciante o aliado).</li>
            <li><strong>Autorización:</strong> consentimiento previo, expreso e informado que el titular otorga marcando las casillas de aceptación de los formularios o por WhatsApp.</li>
            <li><strong>Encargado:</strong> quien realiza el tratamiento por cuenta del responsable (p. ej. plataformas de almacenamiento o mensajería).</li>
          </ul>
        </Section>

        <Section id="h-principios" title="3. Principios del tratamiento">
          <P>
            Tratamos tus datos bajo los principios de legalidad, finalidad, libertad (con tu autorización), veracidad, transparencia, acceso restringido, seguridad y confidencialidad. Solo recolectamos los datos necesarios para prestar nuestros servicios de vitrina, intermediación y gestión vehicular.
          </P>
        </Section>

        <Section id="h-datos" title="4. Datos personales que recolectamos">
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li><strong>Identificación y contacto:</strong> nombre, teléfono/WhatsApp, correo electrónico y ciudad.</li>
            <li><strong>Del vehículo:</strong> marca, modelo, año, placa, kilometraje, fotos, precio y características publicadas.</li>
            <li><strong>Documentales:</strong> tarjeta de propiedad (frente y reverso) para verificación jurídica interna.</li>
            <li><strong>Comerciales:</strong> solicitudes de compra directa, consignación, financiación, trámites y seguros; historial de consultas por WhatsApp.</li>
            <li><strong>No recolectamos</strong> datos sensibles (salud, biometría, orientación u otros de la Ley 1581) ni datos de tarjetas bancarias: los pagos de planes se hacen por transferencia directa (Nequi, Daviplata u otros medios informados).</li>
          </ul>
        </Section>

        <Section id="h-finalidades" title="5. Finalidades del tratamiento">
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>Publicar y exhibir tu vehículo en la vitrina virtual y en pauta digital.</li>
            <li>Contactarte por llamada, WhatsApp o correo sobre tu aviso, oferta, retoma o consignación.</li>
            <li>Verificar antecedentes del vehículo (RUNT, SIMIT) y validar la tarjeta de propiedad.</li>
            <li>Gestionar trámites de tránsito, cotizaciones de SOAT y seguros, y radicar solicitudes de crédito ante entidades financieras aliadas.</li>
            <li>Enviarte información comercial y de servicio de ClickMotores y JG Motors (puedes oponerte en cualquier momento).</li>
            <li>Atender peticiones, quejas, reclamos y ejercer la defensa en procesos administrativos o judiciales.</li>
          </ul>
        </Section>

        <Section id="h-tarjeta" title="6. Confidencialidad de la tarjeta de propiedad y las fotos">
          <P>
            La tarjeta de propiedad se guarda en almacenamiento privado y se usa <strong>exclusivamente para verificación jurídica interna</strong>. <strong>Nunca es pública</strong> ni visible para quienes navegan la vitrina. Las fotos del vehículo sí son públicas porque son el objeto del aviso, y llevan la marca de agua de ClickMotores para protegerlas.
          </P>
        </Section>

        <Section id="h-derechos" title="7. Derechos del titular">
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>Conocer, actualizar y rectificar tus datos.</li>
            <li>Solicitar prueba de la autorización otorgada.</li>
            <li>Ser informado sobre el uso dado a tus datos.</li>
            <li>Revocar la autorización y pedir la supresión de tus datos cuando no exista deber legal o contractual de conservarlos.</li>
            <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
          </ul>
        </Section>

        <Section id="h-procedimiento" title="8. Cómo ejercer tus derechos: consultas y reclamos">
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li><strong>Consultas</strong> (conocer tus datos): las respondemos en máximo <strong>10 días hábiles</strong>.</li>
            <li><strong>Reclamos</strong> (corregir, actualizar o suprimir): los resolvemos en máximo <strong>15 días hábiles</strong>. Si tu solicitud está incompleta te lo indicaremos para que la subsanes.</li>
            <li><strong>Canal:</strong> escríbenos por WhatsApp al <a href={whatsappLink(WHATSAPP_HABEAS)} target="_blank" rel="noopener noreferrer" className="text-jg-red hover:underline">{WHATSAPP_DISPLAY}</a> indicando tu nombre, el dato a corregir y un medio de respuesta. También puedes hacerlo en nuestra sede en {SEDE}.</li>
            <li>La supresión procede cuando el tratamiento no respete la ley o cuando finalice la finalidad, salvo que debamos conservar los datos por obligación legal (p. ej. documentos contables o contractuales).</li>
          </ul>
          <P>
            <a href={whatsappLink(WHATSAPP_HABEAS)} target="_blank" rel="noopener noreferrer" className="btn-primary mt-2 inline-flex">
              Ejercer mis derechos por WhatsApp
            </a>
          </P>
        </Section>

        <Section id="h-seguridad" title="9. Seguridad y confidencialidad">
          <P>
            Aplicamos medidas técnicas y administrativas razonables: acceso restringido por roles, almacenamiento privado para documentos sensibles, conexiones cifradas y publicación mínima de datos en los avisos (solo lo necesario para el contacto comercial). Ningún sistema es infalible; si detectas un uso indebido, repórtalo de inmediato por nuestros canales.
          </P>
        </Section>

        <Section id="h-terceros" title="10. Encargados y transferencia a terceros">
          <P>
            Solo compartimos tus datos cuando es necesario para el servicio que solicitaste: organismos de tránsito y RUNT (traspasos), aseguradoras (SOAT y pólizas), entidades financieras aliadas (estudio de crédito) y proveedores de almacenamiento o mensajería, siempre bajo deber de confidencialidad y con tu autorización. No vendemos ni alquilamos tus datos.
          </P>
        </Section>

        <Section id="h-menores" title="11. Datos de niños, niñas y adolescentes">
          <P>
            Nuestros servicios están dirigidos a mayores de edad. No recolectamos deliberadamente datos de menores; si detectamos un registro así, lo eliminaremos y solo trataremos esos datos con autorización de quien ejerza la patria potestad y en interés superior del menor.
          </P>
        </Section>

        <Section id="h-vigencia" title="12. Autorización, vigencia y cambios">
          <P>
            Al marcar las casillas de aceptación en nuestros formularios (“Autorizo el tratamiento de mis datos”) otorgas tu autorización en los términos de esta política. Conservamos los datos durante la relación comercial y por los plazos legales aplicables. Esta política rige desde su publicación y cualquier cambio sustancial será informado en esta misma página antes de aplicarse.
          </P>
        </Section>
      </div>
    </LegalShell>
  );
}

export const HabeasDataPage = PrivacyPage;
