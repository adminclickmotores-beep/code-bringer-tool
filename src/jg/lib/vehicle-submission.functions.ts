import { createServerFn } from '@tanstack/react-start';
import { vehicleSubmissionSchema } from './vehicle-submission';
import { normalizePlate, PLATE_USED_MESSAGE } from './plans';

function safeDiagnosticString(value: unknown): string | undefined {
  return typeof value === 'string' && /^[A-Za-z0-9_.-]{1,64}$/.test(value)
    ? value
    : undefined;
}

function storageErrorDiagnostics(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return { errorName: 'UnknownError' };
  }

  const details = error as {
    name?: unknown;
    status?: unknown;
    statusCode?: unknown;
    code?: unknown;
  };
  return {
    errorName: safeDiagnosticString(details.name) ?? 'Error',
    status: typeof details.status === 'number' && Number.isFinite(details.status)
      ? details.status
      : undefined,
    statusCode: safeDiagnosticString(details.statusCode),
    code: safeDiagnosticString(details.code),
  };
}

export const submitVehicleRequest = createServerFn({ method: 'POST' })
  .inputValidator((input) => vehicleSubmissionSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const documentGroup = data.propertyCardPaths[0].split('/')[1];
    if (!documentGroup) throw new Error('No pudimos validar la tarjeta de propiedad.');

    const documentQuery = await Promise.resolve()
      .then(() => supabaseAdmin.storage
        .from('property-cards')
        .list(documentGroup, { limit: 10 }))
      .catch((error: unknown) => {
        console.error(
          '[vehicle-submission] Excepción inesperada al consultar documentos de Storage',
          {
            ...storageErrorDiagnostics(error),
            entryCount: null,
            matchedFileCount: 0,
          },
        );
        throw new Error(
          'No pudimos validar el frente y el reverso de la tarjeta de propiedad.',
        );
      });
    const { data: uploadedDocuments, error: documentError } = documentQuery;

    if (documentError) {
      console.error('[vehicle-submission] Storage devolvió un error al consultar documentos', {
        ...storageErrorDiagnostics(documentError),
        entryCount: 0,
        matchedFileCount: 0,
      });
      throw new Error('No pudimos validar el frente y el reverso de la tarjeta de propiedad.');
    }

    const uploadedNames = new Set((uploadedDocuments ?? []).map((document) => document.name));
    const requestedNames = data.propertyCardPaths.map((path) => path.split('/').at(-1));
    const matchedFileCount = requestedNames.filter(
      (name): name is string => Boolean(name && uploadedNames.has(name)),
    ).length;

    if (matchedFileCount !== requestedNames.length) {
      console.warn('[vehicle-submission] Consulta de Storage correcta, pero faltan documentos', {
        entryCount: uploadedDocuments?.length ?? 0,
        matchedFileCount,
      });
      throw new Error('No pudimos validar el frente y el reverso de la tarjeta de propiedad.');
    }

    console.info('[vehicle-submission] Documentos validados en Storage', {
      entryCount: uploadedDocuments?.length ?? 0,
      matchedFileCount,
    });

    const table = data.saleMode === 'publicar_gratis' ? 'vehicle_submissions' : 'leads';
    const plateNormalized = normalizePlate(data.plate);
    if (data.saleMode === 'publicar_gratis') {
      const { data: used } = await supabaseAdmin
        .from('plate_registry')
        .select('plate_normalized')
        .eq('plate_normalized', plateNormalized)
        .maybeSingle();
      if (used) throw new Error(PLATE_USED_MESSAGE);
    }
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('phone', data.phone)
      .gte('created_at', oneHourAgo);

    if ((count ?? 0) >= 5) {
      throw new Error('Has enviado varias solicitudes. Espera una hora antes de intentar de nuevo.');
    }

    const common = {
      name: data.name,
      phone: data.phone,
      email: null,
      vehicle_type: data.vehicleType,
      brand: data.brand,
      model: data.model,
      year: data.year,
      displacement: data.displacement || null,
      mileage: data.mileage,
      condition: data.condition || null,
      asking_price: data.askingPrice || null,
      description: data.description || null,
      image_urls: data.photoUrls,
      instagram_url: null,
      placa_completa: data.plate,
      ciudad: data.city,
      property_card_urls: data.propertyCardPaths,
      modalidad: data.saleMode,
    };

    const record = data.saleMode === 'publicar_gratis'
      ? { ...common, status: 'pendiente', plate_normalized: plateNormalized }
      : {
          ...common,
          mode: data.saleMode === 'directa' ? 'compra_directa' : 'consignacion',
          status: 'nuevo_lead',
        };
    const { data: inserted, error } = await supabaseAdmin
      .from(table)
      .insert(record)
      .select('id')
      .single();
    if (error) throw new Error('No pudimos guardar la solicitud. Intenta nuevamente.');

    if (data.saleMode === 'publicar_gratis') {
      const { error: regErr } = await supabaseAdmin
        .from('plate_registry')
        .insert({ plate_normalized: plateNormalized, submission_id: inserted.id });
      if (regErr) {
        await supabaseAdmin.from('vehicle_submissions').delete().eq('id', inserted.id);
        throw new Error(PLATE_USED_MESSAGE);
      }
    }

    await supabaseAdmin.from('notifications').insert({
      type: data.saleMode === 'publicar_gratis' ? 'submission' : 'lead',
      title: data.saleMode === 'publicar_gratis' ? 'Nueva publicación gratuita' : 'Nueva solicitud comercial',
      message: `${data.vehicleType === 'moto' ? 'Moto' : 'Carro'}: ${data.brand} ${data.model} - ${data.name}`,
      related_id: inserted.id,
      is_read: false,
    });

    return { id: inserted.id };
  });