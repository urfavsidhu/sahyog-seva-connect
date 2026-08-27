export interface LocationOption {
  id: string;
  name: string;
  nameHi: string;
  lat: number;
  lng: number;
}

// Pune localities — matches the coordinate spread used by mock workers &
// the coop-admin "demand map" (see mock-data.ts -> areaDemand).
export const LOCATIONS: LocationOption[] = [
  { id: "baner", name: "Baner", nameHi: "बानेर", lat: 18.559, lng: 73.7868 },
  { id: "kothrud", name: "Kothrud", nameHi: "कोथरूड", lat: 18.5074, lng: 73.8077 },
  { id: "viman-nagar", name: "Viman Nagar", nameHi: "विमान नगर", lat: 18.5679, lng: 73.9143 },
  { id: "hadapsar", name: "Hadapsar", nameHi: "हडपसर", lat: 18.5089, lng: 73.926 },
  { id: "kharadi", name: "Kharadi", nameHi: "खराडी", lat: 18.5515, lng: 73.947 },
  { id: "shivaji-nagar", name: "Shivaji Nagar", nameHi: "शिवाजी नगर", lat: 18.5304, lng: 73.8467 },
  { id: "hinjewadi", name: "Hinjewadi", nameHi: "हिंजेवाड़ी", lat: 18.5975, lng: 73.7623 },
  { id: "wakad", name: "Wakad", nameHi: "वाकड", lat: 18.5989, lng: 73.7645 },
];

/** Great-circle distance between two lat/lng points, in kilometres. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function findLocation(id: string) {
  return LOCATIONS.find((l) => l.id === id);
}
