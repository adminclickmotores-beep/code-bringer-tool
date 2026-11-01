import { createServerFn } from '@tanstack/react-start';
import { commercialLeadSchema, directPurchaseSheet } from './commercial-lead';

export const submitCommercialLead = createServerFn({ method: 'POST' })
  .inputValidator((input) => commercialLeadSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('phone', data.phone)
      .gte('created_at', oneHourAgo);
    if ((count ?? 0) >= 5) {
      throw new Error('Has enviado varias solicitudes. Espera una hora antes de intentar de nuevo.');
    }

    const record = data.kind === 'directa'
      ? {
          name: data.name, phone: data.phone, email: null,
          vehicle_type: data.vehicleType, mode: 'compra_directa',
          brand: data.brand, model: data.version, year: data.year,
          mileage: data.mileage, asking_price: data.askingPrice || null,
          description: directPurchaseSheet(data), image_urls: data.photoUrls,
          placa_completa: data.plate, ciudad: data.city, modalidad: 'directa',
          status: 'nuevo_lead',
        }
      : {
          name: data.name, phone: data.phone, email: null,
          vehicle_type: data.vehicleType, mode: 'consignacion',
          brand: data.brand, model: data.model, year: data.year,
          description: 'Solicita llamada de asesoría comercial (consignación).',
          image_urls: [], ciudad: data.city, modalidad: 'consignacion',
          status: 'nuevo_lead',
        };

    const { data: inserted, error } = await supabaseAdmin
      .from('leads')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(record as any)
      .select('id')
      .single();
    if (error || !inserted) throw new Error('No pudimos guardar la solicitud. Intenta nuevamente.');

    await supabaseAdmin.from('notifications').insert({
      type: 'lead',
      title: data.kind === 'directa' ? 'Nueva solicitud: Te Compramos' : 'Nueva solicitud: Consignación',
      message: `${data.vehicleType === 'moto' ? 'Moto' : 'Carro'}: ${data.brand} - ${data.name}`,
      related_id: inserted.id,
      is_read: false,
    });

    return { id: inserted.id };
  });
