import { createServerFn } from '@tanstack/react-start';
import { vehicleSubmissionSchema } from './vehicle-submission';

export const submitVehicleRequest = createServerFn({ method: 'POST' })
  .inputValidator((input) => vehicleSubmissionSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const documentGroup = data.propertyCardPaths[0].split('/')[1];
    if (!documentGroup) throw new Error('No pudimos validar la tarjeta de propiedad.');

    const { data: uploadedDocuments, error: documentError } = await supabaseAdmin.storage
      .from('property-cards')
      .list(documentGroup, { limit: 10 });
    const uploadedNames = new Set((uploadedDocuments ?? []).map((document) => document.name));
    const requestedNames = data.propertyCardPaths.map((path) => path.split('/').at(-1));
    if (documentError || requestedNames.some((name) => !name || !uploadedNames.has(name))) {
      throw new Error('No pudimos validar el frente y el reverso de la tarjeta de propiedad.');
    }

    const table = data.saleMode === 'publicar_gratis' ? 'vehicle_submissions' : 'leads';
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
      ? { ...common, status: 'pendiente' }
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

    await supabaseAdmin.from('notifications').insert({
      type: data.saleMode === 'publicar_gratis' ? 'submission' : 'lead',
      title: data.saleMode === 'publicar_gratis' ? 'Nueva publicación gratuita' : 'Nueva solicitud comercial',
      message: `${data.vehicleType === 'moto' ? 'Moto' : 'Carro'}: ${data.brand} ${data.model} - ${data.name}`,
      related_id: inserted.id,
      is_read: false,
    });

    return { id: inserted.id };
  });