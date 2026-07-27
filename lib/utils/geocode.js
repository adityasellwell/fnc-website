/**
 * Reverse-geocodes coordinates into a real, human-readable address using
 * OpenStreetMap's Nominatim (same provider already used for the Store
 * Locator map — no new API key/vendor needed).
 *
 * Returns null on any failure so callers can fall back gracefully (e.g. to
 * a nearest-store label) instead of showing a broken location.
 */
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address ?? {};

    const area = a.suburb || a.neighbourhood || a.village || a.town || a.city_district;
    const city = a.city || a.town || a.state_district || a.state;

    const short = area && city ? `${area}, ${city}` : city || data.display_name?.split(",")[0];
    const full = data.display_name ?? short;

    return { short, full, city, area, postcode: a.postcode };
  } catch {
    return null;
  }
}
