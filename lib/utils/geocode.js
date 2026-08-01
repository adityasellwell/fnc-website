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
 * Supports progressive fallback queries to ensure we don't fail on local housing
 * society names or building landmarks that aren't indexed in OpenStreetMap.
 */
export async function geocodeAddress(addressString, structuredAddress) {
  if (!addressString?.trim()) return null;

  // Compile list of fallback queries to try progressively
  const queries = [addressString];

  if (structuredAddress) {
    const { line1, line2, city, state, pincode } = structuredAddress;
    
    // Fallback 1: Try stripping the first part of line1 (e.g. flat/apartment/society name)
    if (line1 && line1.includes(",")) {
      const parts = line1.split(",").map((p) => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        const line1WithoutFirstPart = parts.slice(1).join(", ");
        queries.push(`${line1WithoutFirstPart}, ${line2 || ""}, ${city}, ${state} ${pincode}`);
      }
    }

    // Fallback 2: Try using just the pincode, city, and state
    if (pincode && city) {
      queries.push(`${pincode}, ${city}, ${state || "Maharashtra"}, India`);
    }

    // Fallback 3: Try just the pincode and India (highly robust for Indian postal codes)
    if (pincode) {
      queries.push(`${pincode}, India`);
    }
  } else {
    // If we only have the flat address string, try to extract a 6-digit postcode using regex
    const pinMatch = addressString.match(/\b\d{6}\b/);
    if (pinMatch) {
      const pincode = pinMatch[0];
      queries.push(`${pincode}, India`);
    }
  }

  // Clean and deduplicate queries
  const uniqueQueries = [...new Set(queries.map((q) => q.replace(/\s+/g, " ").trim()))];

  for (const query of uniqueQueries) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "FncWebsiteDeliveryRadiusEnforcement/1.0",
          },
        }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        return {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          displayName: item.display_name,
        };
      }
    } catch (err) {
      console.error(`[geocodeAddress] Query "${query}" failed:`, err);
    }
  }

  return null;
}

