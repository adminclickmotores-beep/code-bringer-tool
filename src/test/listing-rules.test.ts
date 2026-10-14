import { describe, it, expect } from 'vitest';
import { listingStatus, normalizePlate, renewedExpiry, catalogRank, contactTarget } from '@/jg/lib/plans';

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

describe('catalog order and contact rules', () => {
  it('expired third-party ranks after unavailable, before sold', () => {
    const expired = { listing_owner: 'tercero', expires_at: new Date(now.getTime() - DAY).toISOString(), status: 'disponible' };
    const unavailable = { listing_owner: 'jg', expires_at: null, status: 'no_disponible' };
    const sold = { listing_owner: 'jg', expires_at: null, status: 'vendido' };
    const available = { listing_owner: 'jg', expires_at: null, status: 'disponible' };
    expect(catalogRank(available, now)).toBe(0);
    expect(catalogRank(unavailable, now)).toBe(1);
    expect(catalogRank(expired, now)).toBe(2);
    expect(catalogRank(sold, now)).toBe(3);
  });
  it('active third-party listing contacts the owner directly', () => {
    const active = { listing_owner: 'tercero', expires_at: new Date(now.getTime() + 10 * DAY).toISOString(), status: 'disponible' };
    expect(contactTarget(active, now)).toBe('owner');
  });
  it('expired third-party listing has no contact option', () => {
    const expired = { listing_owner: 'tercero', expires_at: new Date(now.getTime() - DAY).toISOString(), status: 'disponible' };
    expect(contactTarget(expired, now)).toBe('none');
  });
  it('own, consignment and ally vehicles contact ClickMotores', () => {
    const own = { listing_owner: 'jg', expires_at: null, status: 'disponible' };
    const ally = { listing_owner: 'jg', expires_at: null, status: 'aliado' };
    expect(contactTarget(own, now)).toBe('clickmotores');
    expect(contactTarget(ally, now)).toBe('clickmotores');
  });
  it('sold vehicles have no contact option', () => {
    const sold = { listing_owner: 'tercero', expires_at: new Date(now.getTime() + 10 * DAY).toISOString(), status: 'vendido' };
    expect(contactTarget(sold, now)).toBe('none');
  });
});
