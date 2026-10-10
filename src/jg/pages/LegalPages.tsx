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