const fetch = globalThis.fetch;

// Fast multi-layered POI search for ANY location on Earth
async function searchNearbyPlaces(lat, lng, type = 'pharmacy') {
  console.log(`\n=== Searching ${type.toUpperCase()} for Lat: ${lat}, Lng: ${lng} ===`);

  // 1. Tag queries for Overpass
  let tags = '';
  if (type === 'pharmacy') {
    tags = `
      node["amenity"="pharmacy"](around:20000,${lat},${lng});
      way["amenity"="pharmacy"](around:20000,${lat},${lng});
      node["shop"="chemist"](around:20000,${lat},${lng});
      way["shop"="chemist"](around:20000,${lat},${lng});
      node["shop"="medical"](around:20000,${lat},${lng});
      way["shop"="medical"](around:20000,${lat},${lng});
      node["shop"="pharmacy"](around:20000,${lat},${lng});
      way["shop"="pharmacy"](around:20000,${lat},${lng});
      node["healthcare"="pharmacy"](around:20000,${lat},${lng});
      way["healthcare"="pharmacy"](around:20000,${lat},${lng});
    `;
  } else if (type === 'aed') {
    tags = `
      node["emergency"="defibrillator"](around:25000,${lat},${lng});
      node["emergency"="aed"](around:25000,${lat},${lng});
      node["amenity"="aed"](around:25000,${lat},${lng});
    `;
  } else {
    tags = `
      node["amenity"="hospital"](around:20000,${lat},${lng});
      way["amenity"="hospital"](around:20000,${lat},${lng});
      node["amenity"="clinic"](around:20000,${lat},${lng});
      way["amenity"="clinic"](around:20000,${lat},${lng});
      node["healthcare"="hospital"](around:20000,${lat},${lng});
      way["healthcare"="hospital"](around:20000,${lat},${lng});
      node["amenity"="doctors"](around:20000,${lat},${lng});
      way["amenity"="doctors"](around:20000,${lat},${lng});
    `;
  }

  const query = `[out:json][timeout:8];(${tags});out center 40;`;

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];

  // Try Overpass mirrors
  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${ep}?data=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'AIFirstAidApp/2.0' },
        signal: controller.signal
      });
      clearTimeout(tid);

      if (res.ok) {
        const data = await res.json();
        if (data.elements && data.elements.length > 0) {
          console.log(`Overpass (${ep}) returned ${data.elements.length} places!`);
          return data.elements.map(e => ({
            name: e.tags?.name || e.tags?.['name:en'] || (type === 'pharmacy' ? 'Medical Store / Pharmacy' : (type === 'aed' ? 'Public AED' : 'Hospital')),
            lat: e.lat || e.center?.lat,
            lon: e.lon || e.center?.lon,
            address: [e.tags?.['addr:street'], e.tags?.['addr:suburb'], e.tags?.['addr:city']].filter(Boolean).join(', ') || null,
            phone: e.tags?.phone || e.tags?.['contact:phone'] || null
          }));
        }
      }
    } catch (e) {
      console.warn(`Overpass ${ep} error: ${e.message}`);
    }
  }

  // 2. Nominatim Structured Fallback
  console.log("Falling back to Nominatim POI lookup...");
  const delta = 0.25; // ~25km box
  const viewbox = `${lng - delta},${lat + delta},${lng + delta},${lat - delta}`;
  const term = type === 'pharmacy' ? 'pharmacy' : (type === 'aed' ? 'defibrillator' : 'hospital');
  const nomUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${term}&bounded=1&viewbox=${viewbox}&limit=30&addressdetails=1`;

  try {
    const res = await fetch(nomUrl, {
      headers: { 'User-Agent': 'AIFirstAidEmergencyAssistant/2.0 (contact: info@aifirstaid.org)' }
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Nominatim returned ${data.length} places!`);
      return data.map(d => ({
        name: d.name || d.display_name.split(',')[0],
        lat: parseFloat(d.lat),
        lon: parseFloat(d.lon),
        address: d.display_name,
        phone: null
      }));
    }
  } catch (e) {
    console.warn("Nominatim error:", e.message);
  }

  return [];
}

async function run() {
  const testLocations = [
    { name: "Pollachi", lat: 10.65882, lng: 77.00873 },
    { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
    { name: "Madurai", lat: 9.9252, lng: 78.1198 }
  ];

  for (const loc of testLocations) {
    const pharmacies = await searchNearbyPlaces(loc.lat, loc.lng, 'pharmacy');
    console.log(`Results for ${loc.name} Pharmacies:`, pharmacies.length);
    pharmacies.slice(0, 3).forEach(p => console.log("  💊", p.name, "at", p.lat, p.lon));

    const hospitals = await searchNearbyPlaces(loc.lat, loc.lng, 'hospital');
    console.log(`Results for ${loc.name} Hospitals:`, hospitals.length);
    hospitals.slice(0, 3).forEach(h => console.log("  🏥", h.name, "at", h.lat, h.lon));
  }
}

run();
