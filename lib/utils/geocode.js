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

    // House number + road for a checkout "address line 1" — falls back to
    // the neighbourhood name when Nominatim has no exact street match
    // (common for newer buildings/apartment complexes).
    const line1 = [a.house_number, a.road].filter(Boolean).join(" ") || area || "";

    return { short, full, city, area, line1, state: a.state, postcode: a.postcode };
  } catch {
    return null;
  }
}

/**
 * Resolves a text address string into coordinates using Nominatim.
 * Returns null if no results found or on API errors.
 */
export async function geocodeAddress(addressString) {
  if (!addressString?.trim()) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(addressString)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "FncWebsiteDeliveryRadiusEnforcement/1.0",
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    const item = data[0];
    return {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
    };
  } catch (err) {
    console.error("[geocodeAddress] failed:", err);
    return null;
  }
}

