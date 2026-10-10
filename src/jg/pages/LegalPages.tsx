import { FileText, ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { whatsappLink, WHATSAPP_DISPLAY } from '@/jg/lib/supabase';

interface LegalPageProps {
  onNavigate: (page: string) => void;
}

export const LEGAL_OPERATOR = 
  'ClickMotores es una marca comercial y vitrina virtual operada legalmente por Jg Motors (NIT 1130674978-2).';

function LegalShell({ icon, title, children, onNavigate }: { icon: ReactNode; title: string; children: ReactNode; onNavigate: (p: string) => void }) {
  return (
    <div className="animate-fade-in">
      <div className="border-b border-jg-silver bg-jg-surface py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <span className="badge border border-jg-red/30 bg-jg-red/10 text-jg-red">
            {icon}
            Legal
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-jg-text-muted">{LEGAL_OPERATOR}</p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

export function TermsPage({ onNavigate }: LegalPageProps) {
  return (
    <LegalShell icon={<FileText className="h-4 w-4" />} title="Términos y Condiciones — ClickMotores" onNavigate={onNavigate}>
      <div className="space-y-8 text-jg-text">
        <p className="text-sm text-jg-text-muted">Última actualización: Octubre de 2026</p>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">1. Operador Legal y Naturaleza de la Plataforma</h2>
          <p className="leading-relaxed">
            La marca comercial y plataforma tecnológica <strong>ClickMotores</strong> es operada legalmente por <strong>JG Motors</strong> (NIT 1130674978-2), establecimiento de comercio de propiedad de persona natural comerciante, domiciliado en Yumbo / Cali, Valle del Cauca, Colombia. Al acceder, registrarse, publicar o utilizar los servicios de nuestra vitrina digital, el usuario acepta de manera expresa, previa e informada los presentes Términos y Condiciones.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">2. Objeto de los Servicios</h2>
          <p className="leading-relaxed">
            ClickMotores actúa como una plataforma virtual e intermediaria comercial especializada en la compra, venta, consignación y retoma de motocicletas y automóviles (nuevos y usados), tanto propios como de terceros, operando en todo el territorio colombiano. Asimismo, ofrece servicios complementarios de gestión publicitaria, trámites de tránsito, peritajes, seguros y financiación vehicular.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">3. Planes de Avisos y Publicaciones para Usuarios y Aliados</h2>
          <ul className="list-disc pl-5 space-y-2 leading-relaxed">
            <li><strong>Período Promocional Inicial:</strong> La plataforma ofrece un período inicial de días gratis para la pauta y exhibición de vehículos. Una vez finalizado dicho periodo promocional, el usuario o aliado deberá adquirir o renovar el plan de avisos vigente para mantener su vehículo visible en el inventario público de la vitrina.</li>
            <li><strong>Veracidad de la Publicación:</strong> El anunciante garantiza que los datos suministrados sobre el automotor (modelo, kilometraje, estado físico, precio y especificaciones) son verídicos y exactos.</li>
            <li><strong>Derecho de Admisión:</strong> JG Motors se reserva el derecho de rechazar, suspender o eliminar cualquier publicación que presente inconsistencias, sospechas de fraude, placas adulteradas o documentación irregular.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">4. Consignaciones y Depósito Inicial No Reembolsable</h2>
          <p className="leading-relaxed">
            Para el servicio de consignación de vehículos (carros y motos de terceros), el propietario o consignante deberá cancelar un <strong>valor inicial por concepto de gestión comercial y pauta, el cual no es reembolsable</strong>, destinado a cubrir los costos operativos iniciales de exhibición y filtrado de compradores.
          </p>
          <p className="leading-relaxed">
            El vehículo no requiere quedar retenido físicamente de manera obligatoria en nuestras instalaciones según se pacte, pero el propietario se obliga a mantenerlo disponible y atento para su presentación inmediata o peritaje cuando un cliente interesado lo requiera.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">5. Retomas y Venta Directa</h2>
          <p className="leading-relaxed">
            JG Motors realiza procesos de retoma y venta directa de vehículos propios y de terceros bajo negociación directa. Los avalúos comerciales y ofertas de retoma están sujetos a verificación física, peritaje técnico y revisión de antecedentes legales en RUNT y SIMIT.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">6. Peritaje Vehicular</h2>
          <p className="leading-relaxed">
            El cliente comprador tiene la facultad y la responsabilidad de solicitar un servicio de peritaje técnico para verificar el estado estructural, mecánico y legal del vehículo. <strong>El costo total del peritaje debe ser asumido directamente por el cliente comprador</strong>, quien además es libre de escoger el centro de diagnóstico automotriz (CDA) o perito autorizado de su preferencia en el mercado.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">7. Gestión de Trámites de Tránsito</h2>
          <p className="leading-relaxed">
            JG Motors ofrece el servicio de gestión y acompañamiento para trámites ante organismos de tránsito, tales como traspasos de propiedad, levantamientos de prenda, duplicados e inscripción de garantías. Comprador y vendedor se comprometen a entregar oportunamente la documentación legal exigida por las normas colombianas. JG Motors no asume responsabilidad por demoras operativas imputables directamente a las Secretarías de Movilidad o plataformas de tránsito nacionales.
          </p>
        </section>
    <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">8. Cotización y Venta de Seguros (SOAT y Todo Riesgo)</h2>
          <p className="leading-relaxed">
            La plataforma facilita la cotización y expedición de SOAT (Seguro Obligatorio de Accidentes de Tránsito) y pólizas de seguros de automóviles y motocicletas todo riesgo a través de alianzas estratégicas con intermediarios y compañías aseguradoras legalmente autorizadas en Colombia.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">9. Financiación y Créditos Vehiculares</h2>
          <p className="leading-relaxed">
            JG Motors actúa exclusivamente como canal de gestión y puente de radicación para solicitudes de créditos de motos y carros con entidades financieras y bancos aliados. <strong>La aprobación o negación del crédito depende de autónoma decisión y de las políticas de riesgo de cada entidad financiera aliada</strong>, por lo que JG Motors no garantiza la aprobación automática de los créditos solicitados.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">10. Tratamiento de Datos Personales (Ley 1581 de 2012)</h2>
          <p className="leading-relaxed">
            El usuario autoriza de manera previa, expresa e informada a <strong>JG Motors (NIT 1130674978-2)</strong> para recolectar, almacenar y tratar sus datos personales y los de su vehículo con fines comerciales, de atención mediante WhatsApp y de gestión financiera o documental.
          </p>
          <p className="leading-relaxed">
            <strong>Confidencialidad de la Tarjeta de Propiedad:</strong> La tarjeta de propiedad cargada a través de la plataforma se almacena en un servidor privado cifrado y se utiliza exclusivamente para la verificación jurídica interna de antecedentes (RUNT y SIMIT). <em>Esta documentación NUNCA será de carácter público ni estará visible para terceros navegando en la vitrina digital.</em>
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">11. Facturación y Contratos</h2>
          <p className="leading-relaxed">
            Todos los contratos formales de consignación, compraventa, certificados de peritaje y documentos contables o facturas se suscribirán y emitirán oficialmente bajo la razón social de <strong>JG Motors (NIT 1130674978-2)</strong>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">12. Jurisdicción y Ley Aplicable</h2>
          <p className="leading-relaxed">
            Estos Términos y Condiciones se rigen e interpretan de conformidad con las leyes de la República de Colombia. Cualquier controversia derivada del uso de la plataforma será sometida a los tribunales ordinarios competentes en el territorio nacional.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">13. Contacto y Soporte</h2>
          <p className="leading-relaxed">
           Para cualquier inquietud, solicitud o soporte adicional, comunícate a través de nuestro canal de WhatsApp corporativo al <a href={whatsappLink('Hola ClickMotores, tengo una consulta sobre soporte.')} target="_blank" rel="noopener noreferrer" className="text-jg-red hover:underline">{WHATSAPP_DISPLAY}</a> o en nuestra sede de atención en el Valle del Cauca, Colombia.
          </p>
        </section>
      </div>
    </LegalShell>
  );
}

export function PrivacyPage({ onNavigate }: LegalPageProps) {
  return (
    <LegalShell icon={<ShieldAlert className="h-4 w-4" />} title="Política de Tratamiento de Datos (Habeas Data Ley 1581)" onNavigate={onNavigate}>
      <div className="space-y-8 text-jg-text">
        <p className="text-sm text-jg-text-muted">Última actualización: Octubre de 2026</p>
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">1. Autorización de Tratamiento</h2>
          <p className="leading-relaxed">
            En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, <strong>JG Motors (NIT 1130674978-2)</strong> informa que los datos personales y de los vehículos suministrados en nuestra plataforma serán tratados bajo estrictas medidas de seguridad y confidencialidad.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">2. Confidencialidad de la Tarjeta de Propiedad</h2>
          <p className="leading-relaxed">
            Los documentos de propiedad (tarjeta de propiedad) cargados por los usuarios se gestionan en servidores cifrados privados y se emplean exclusivamente para las validaciones internas de peritaje y antecedentes legales. <strong>Nunca serán expuestos al público ni compartidos con terceros ajenos al proceso comercial.</strong>
          </p>
        </section>
      </div>
    </LegalShell>
  );
}
export const HabeasDataPage = PrivacyPage;