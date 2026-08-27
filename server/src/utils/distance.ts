export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Great-circle distance between two lat/lng points, in kilometres.
 * Kept identical to the frontend's `distanceKm` in src/lib/locations.ts
 * so search results and displayed distances never disagree between
 * client and server.
 */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
