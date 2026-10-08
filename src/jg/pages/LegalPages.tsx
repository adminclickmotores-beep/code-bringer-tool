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
        <div className="card space-y-8 p-8 text-[15px] leading-relaxed text-jg-text-muted">
          {children}
          <section className="border-t border-jg-silver pt-6">
            <p className="text-sm">
              Para consultas escríbenos por WhatsApp al{' '}
              <a href={whatsappLink('Hola ClickMotores, tengo una consulta legal.')} target="_blank" rel="noopener noreferrer" className="font-semibold text-jg-red">
                {WHATSAPP_DISPLAY}
              </a>
            </p>
            <button onClick={() => onNavigate('home')} className="btn-secondary mt-4">
              Volver al inicio
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function Item({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}

function CommonItems() {
  return (
    <>
      <Item title="Operador Legal y Representación">
        Jg Motors (NIT 1130674978-2), establecimiento de comercio de propiedad de persona natural comerciante, domiciliado en Yumbo / Cali, Valle del Cauca, Colombia.
      </Item>
      <Item title="Objeto">
        ClickMotores opera como vitrina virtual neutra e intermediaria comercial para la publicación, compra, venta y consignación de carros y motos, así como la gestión de créditos vehiculares, SOAT y seguros todo riesgo en Colombia.
      </Item>
      <Item title="Protección de Datos (Ley 1581 de 2012)">
        El usuario autoriza de manera previa e informada a Jg Motors (NIT 1130674978-2) a tratar sus datos personales y los de su vehículo para gestionar la comercialización, atención vía WhatsApp y trámites asociados.
      </Item>
      <Item title="Confidencialidad de la Tarjeta de Propiedad">
        La tarjeta de propiedad cargada en la plataforma se almacena en un servidor privado cifrado y se utiliza exclusivamente para la verificación jurídica interna de antecedentes (RUNT/SIMIT). <strong className="text-jg-text-dark">NUNCA será pública ni visible para terceros.</strong>
      </Item>
      <Item title="Contratos y Facturación">
        Todos los contratos de consignación, compraventa, certificados y documentos contables se suscribirán oficialmente bajo la razón social Jg Motors (NIT 1130674978-2).
      </Item>
    </>
  );
}

export function TermsPage({ onNavigate }: LegalPageProps) {
  return (
    <LegalShell icon={<FileText className="h-3.5 w-3.5" />} title="Términos y Condiciones — ClickMotores" onNavigate={onNavigate}>
      <CommonItems />
    </LegalShell>
  );
}

export function HabeasDataPage({ onNavigate }: LegalPageProps) {
  return (
    <LegalShell icon={<ShieldAlert className="h-3.5 w-3.5" />} title="Política de Habeas Data — ClickMotores" onNavigate={onNavigate}>
      <CommonItems />
      <Item title="Derechos del Titular">
        Puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos en cualquier momento escribiendo a nuestro WhatsApp oficial.
      </Item>
    </LegalShell>
  );
}
