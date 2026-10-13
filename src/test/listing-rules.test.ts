import { describe, it, expect } from 'vitest';
import { listingStatus, normalizePlate, renewedExpiry } from '@/jg/lib/plans';

const now = new Date('2026-10-13T00:00:00Z');
const DAY = 86400000;

describe('listing rules', () => {
  it('third-party listing 21 days old is expired', () => {
    const expires = new Date(now.getTime() - 21 * DAY + 20 * DAY).toISOString();
    expect(listingStatus({ listing_owner: 'tercero', expires_at: expires }, now)).toBe('expirado');
  });
  it('JG listing never expires', () => {
    expect(listingStatus({ listing_owner: 'jg', expires_at: null }, now)).toBe('permanente');
  });
  it('plates normalize so variants collide', () => {
    expect(normalizePlate('abc-12 3')).toBe(normalizePlate('ABC123'));
  });
  it('renewal adds 30 days from now when already expired', () => {
    const r = renewedExpiry(new Date(now.getTime() - DAY).toISOString(), 30, now);
    expect(r.getTime()).toBe(now.getTime() + 30 * DAY);
  });
});
