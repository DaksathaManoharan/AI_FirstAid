const fetch = globalThis.fetch;

async function test() {
  const lat = 10.65882;
  const lng = 77.00873;

  const mirrors = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://overpass-api.de/api/interpreter'
  ];

  const pQuery = `[out:json][timeout:15];(
    node["amenity"="pharmacy"](around:25000,${lat},${lng});
    way["amenity"="pharmacy"](around:25000,${lat},${lng});
    node["shop"="chemist"](around:25000,${lat},${lng});
    way["shop"="chemist"](around:25000,${lat},${lng});
    node["shop"="medical"](around:25000,${lat},${lng});
    way["shop"="medical"](around:25000,${lat},${lng});
    node["shop"="pharmacy"](around:25000,${lat},${lng});
    node["healthcare"="pharmacy"](around:25000,${lat},${lng});
    node["amenity"="hospital"](around:25000,${lat},${lng});
    way["amenity"="hospital"](around:25000,${lat},${lng});
  );out center 40;`;

  for (const m of mirrors) {
    try {
      console.log(`Trying mirror ${m}...`);
      const res = await fetch(`${m}?data=${encodeURIComponent(pQuery)}`, {
        headers: { 'User-Agent': 'AIFirstAidApp/2.0' }
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`Mirror ${m} returned ${data.elements?.length} elements!`);
        if (data.elements && data.elements.length > 0) {
          data.elements.forEach(e => {
            console.log("-", e.tags?.name || e.tags?.['name:en'] || "Facility", `(${e.tags?.amenity || e.tags?.shop})`, "at", e.lat || e.center?.lat, e.lon || e.center?.lon);
          });
          break;
        }
      } else {
        console.log(`Mirror ${m} failed status: ${res.status}`);
      }
    } catch (e) {
      console.log(`Mirror ${m} error:`, e.message);
    }
  }

  // Also test Nominatim POI search fallback
  console.log("\n--- Testing Nominatim Search Fallback for 'pharmacy near Pollachi' ---");
  const nomUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=pharmacy+near+Pollachi&limit=10&addressdetails=1`;
  const nomRes = await fetch(nomUrl, { headers: { 'User-Agent': 'AIFirstAidApp/2.0 (contact: info@aifirstaid.org)' } });
  if (nomRes.ok) {
    const nomData = await nomRes.json();
    console.log("Nominatim results:", nomData.length);
    nomData.forEach(d => console.log("💊", d.name || d.display_name, "at", d.lat, d.lon));
  }
}

test().catch(e => console.error(e));
