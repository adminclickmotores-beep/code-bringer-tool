import { ShieldAlert, FileText } from 'lucide-react';
import { WHATSAPP_DISPLAY, whatsappLink } from '@/jg/lib/supabase';

interface LegalPageProps {
  onNavigate: (page: string) => void;
}

export function TermsPage({ onNavigate }: LegalPageProps) {
  return (
    <div className="animate-fade-in">
      <div className="border-b border-jg-silver/50 bg-jg-carbon/50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <span className="badge bg-jg-red/15 text-jg-red border border-jg-red/30">
            <FileText className="h-3.5 w-3.5" />
            Legal
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Términos y Condiciones
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            JG Motors · Comercializadora Virtual y Tecnológica de Motos y Carros
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="card space-y-8 p-8">
          {/* Modelo de Operación */}
          <section>
            <h2 className="font-display text-xl font-bold text-white">1. Modelo de Operación</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              JG Motors opera como una <strong className="text-white">comercializadora virtual y tecnológica</strong> especializada
              en la comercialización, compra, venta y consignación de motos y carros. Próximamente habilitaremos
              vitrinas físicas de atención al público.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              <strong className="text-white">Inspección Física y Verificación Documental:</strong> Antes de concretar
              cualquier negocio de compra directa, retoma o consignación, agendamos una cita previa con el propietario
              para realizar una inspección física detallada del vehículo y una revisión minuciosa de documentación,
              historial de impuestos, embargos, pignoraciones y comparendos de tránsito pendientes.
            </p>
          </section>

          {/* Propósito y Filosofía */}
          <section>
            <h2 className="font-display text-xl font-bold text-white">2. Propósito, Filosofía y Selección de Vehículos</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              No somos una compraventa más. Nos diferenciamos por la <strong className="text-white">calidad,
              transparencia, honestidad, responsabilidad, seriedad y cumplimiento</strong>.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              <strong className="text-white">Política de Selección:</strong> JG Motors NO recibe cualquier vehículo.
              Nos reservamos el derecho absoluto de aceptación para asegurar que solo ingresen al catálogo vehículos
              en óptimo estado y con procedencia 100% transparente.
            </p>
          </section>

          {/* Publica Gratis y Gestión Exclusiva */}
          <section>
            <h2 className="font-display text-xl font-bold text-white">3. Modalidad "Publica Gratis" y Gestión Exclusiva de Venta</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              <strong className="text-white">Publicación Gratuita:</strong> Publicar un vehículo en nuestra página web
              es 100% gratuito.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              <strong className="text-white">Exclusividad de Intermediación:</strong> Los datos de contacto de los
              compradores interesados llegarán única y exclusivamente a JG Motors.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              <strong className="text-white">Control Integral:</strong> Gestionamos las ofertas, transmitimos propuestas
              al vendedor, agendamos citas, mostramos el vehículo y cerramos la negociación.
            </p>
          </section>

          {/* Consignación Comercial */}
          <section>
            <h2 className="font-display text-xl font-bold text-white">4. Consignación Comercial, Pauta Multicanal y Custodia</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              <strong className="text-white">Cobro por Adelantado:</strong> Pago único e inicial de{' '}
              <strong className="text-white">$100.000 COP</strong> (no reembolsable) para pauta en nuestra web,
              MercadoLibre, TuCarro.com, Facebook e Instagram.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              <strong className="text-white">Libertad de Custodia:</strong> El propietario es libre de elegir si deja
              el vehículo (moto o carro) bajo custodia de JG Motors o si continúa usándolo. Si decide no dejarlo, el
              vendedor se compromete a estar disponible y disponer del vehículo para coordinar las citas de exhibición
              cuando exista un comprador interesado.
            </p>
          </section>

          {/* Esquema de Cierre y Pago */}
          <section>
            <h2 className="font-display text-xl font-bold text-white">5. Esquema de Cierre y Pago del Negocio</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Al momento de cerrar la venta de un vehículo consignado, el comprador se compromete a realizar el pago
              dividido de la siguiente manera:
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                <p className="text-sm text-gray-300">
                  <strong className="text-green-400">80% del valor total del negocio:</strong> Consignado directamente
                  al vendedor/propietario del vehículo.
                </p>
              </div>
              <div className="rounded-lg border border-jg-red/20 bg-jg-red/5 p-4">
                <p className="text-sm text-gray-300">
                  <strong className="text-jg-red">20% restante del valor del negocio + Gastos de traspaso:</strong>{' '}
                  Consignado a las cuentas oficiales de JG Motors. De este porcentaje, JG Motors descontará su comisión
                  comercial (3% carros / 5% motos) y destinará el saldo correspondiente a la gestión de traspaso e
                  impuestos de tránsito.
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Una vez recibidos los valores, se citará a las partes para la firma y autenticación notarial de
              documentos y tramitación formal de traspaso.
            </p>
          </section>

          {/* Peritaje e Inspección */}
          <section>
            <h2 className="font-display text-xl font-bold text-white">6. Política de Peritaje e Inspección Técnica</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              <strong className="text-white">Consignación/Publicación:</strong> No exige un peritaje obligatorio al
              momento de recibirlo; se realiza la primera inspección física y legal técnica inicial.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              <strong className="text-white">Peritaje a Solicitud del Comprador:</strong> Si el cliente comprador
              requiere un peritaje especializado, el costo total debe ser asumido por el comprador.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              <strong className="text-white">Libertad de Peritaje en Compras/Retomas:</strong> JG Motors realiza una
              inspección física primaria y decide autónomamente si envía o no a peritaje técnico un vehículo antes de
              comprarlo o retomarlo.
            </p>
          </section>

          {/* Trámites de Tránsito */}
          <section>
            <h2 className="font-display text-xl font-bold text-white">7. Trámites de Tránsito y Saneamiento Legal</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Los costos de retención en la fuente, derechos de traspaso y honorarios de gestión se liquidan según la
              normatividad vigente.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              <strong className="text-white">Todo vehículo debe estar 100% libre de embargos, pignoraciones y
              comparendos de tránsito pendientes.</strong>
            </p>
          </section>

          {/* Contacto */}
          <section className="border-t border-jg-silver/50 pt-6">
            <p className="text-sm text-gray-400">
              Para consultas sobre estos términos, escríbenos por WhatsApp al{' '}
              <a href={whatsappLink('Hola JG Motors, tengo una consulta sobre los términos y condiciones.')} target="_blank" rel="noopener noreferrer" className="text-jg-red hover:text-jg-red-light">{WHATSAPP_DISPLAY}</a>
            </p>
            <button onClick={() => onNavigate('home')} className="mt-4 btn-secondary">
              Volver al inicio
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export function HabeasDataPage({ onNavigate }: LegalPageProps) {
  return (
    <div className="animate-fade-in">
      <div className="border-b border-jg-silver/50 bg-jg-carbon/50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <span className="badge bg-jg-red/15 text-jg-red border border-jg-red/30">
            <ShieldAlert className="h-3.5 w-3.5" />
            Legal
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Política de Tratamiento de Datos Personales
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Habeas Data · Ley 1581 de 2012 · Decreto 1377 de 2013
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="card space-y-8 p-8">
          <section>
            <h2 className="font-display text-xl font-bold text-white">1. Responsable del Tratamiento</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              JG Motors, comercializadora virtual y tecnológica de motos y carros con sede en Yumbo, Valle del Cauca,
              Colombia, es responsable del tratamiento de los datos personales suministrados por los usuarios a través
              de nuestra página web y formularios de contacto.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">2. Finalidad del Tratamiento</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Los datos personales recopilados serán utilizados para:
            </p>
            <ul className="mt-3 space-y-2">
              {[
                'Gestionar solicitudes de publicación, compra directa, consignación y retomas de vehículos.',
                'Contactar a los usuarios para coordinar inspecciones, citas y negociaciones.',
                'Enviar información comercial sobre vehículos disponibles y servicios relacionados.',
                'Cumplir con obligaciones legales y tramites ante autoridades de tránsito.',
                'Mantener un registro interno de prospectos y clientes (CRM comercial).',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-jg-red" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">3. Autorización del Titular</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Al enviar sus datos a través de los formularios de JG Motors, el titular autoriza de manera libre,
              expresa e informada el tratamiento de sus datos personales para las finalidades descritas en esta
              política.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">4. Derechos del Titular</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Como titular de datos personales, usted tiene derecho a:
            </p>
            <ul className="mt-3 space-y-2">
              {[
                'Acceder, conocer, actualizar y rectificar sus datos personales.',
                'Solicitar prueba de la autorización otorgada.',
                'Revocar la autorización y/o solicitar la supresión de sus datos.',
                'Presentar quejas ante la Superintendencia de Industria y Comercio.',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-jg-red" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">5. Medidas de Seguridad</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              JG Motors adopta las medidas técnicas, administrativas y físicas necesarias para proteger los datos
              personales contra alteración, pérdida, consulta o uso no autorizado.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">6. Contacto y PQRS</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Para ejercer sus derechos o presentar solicitudes relacionadas con el tratamiento de sus datos, puede
              contactarnos a través de WhatsApp:{' '}
              <a href={whatsappLink('Hola JG Motors, tengo una consulta sobre tratamiento de datos personales.')} target="_blank" rel="noopener noreferrer" className="text-jg-red hover:text-jg-red-light">{WHATSAPP_DISPLAY}</a>
            </p>
          </section>

          <section className="border-t border-jg-silver/50 pt-6">
            <button onClick={() => onNavigate('home')} className="btn-secondary">
              Volver al inicio
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
