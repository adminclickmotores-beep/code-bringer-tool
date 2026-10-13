import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { PUBLICATION_PLANS, renewedExpiry } from './plans';

export const renewListing = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      vehicleId: z.string().uuid(),
      planId: z.enum(['renovacion_simple', 'destacado_30', 'destacado_90']),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const plan = PUBLICATION_PLANS.find((p) => p.id === data.planId)!;
    const { data: v, error } = await context.supabase
      .from('vehicles')
      .select('id, listing_owner, expires_at')
      .eq('id', data.vehicleId)
      .single();
    if (error || !v) throw new Error('Vehículo no encontrado.');
    if (v.listing_owner !== 'tercero') throw new Error('Solo los avisos de terceros se renuevan.');
    const expires = renewedExpiry(v.expires_at, plan.days).toISOString();
    const { error: upErr } = await context.supabase
      .from('vehicles')
      .update({
        expires_at: expires,
        plan_type: plan.id,
        featured_until: plan.featured ? expires : null,
        featured: plan.featured,
      })
      .eq('id', data.vehicleId);
    if (upErr) throw new Error('No se pudo renovar.');
    return { expires_at: expires };
  });
