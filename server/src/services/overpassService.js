/**
 * OpenStreetMap (OSM) Multi-Layered Emergency Resource Finder
 * Supports Overpass API, Nominatim POI Search, and Verified Medical Registry Fallback
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REGISTRY_FILE = path.join(__dirname, '..', 'data', 'verifiedMedicalFacilities.json');

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

function loadLocalRegistry() {
  try {
    if (fs.existsSync(REGISTRY_FILE)) {
      return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    }
  } catch (err) {
    console.error("[OverpassService] Error reading local medical registry:", err.message);
  }
  return [];
}

export async function fetchNearbyOSMResources(lat, lng, type = 'hospital', radiusMeters = 15000) {
  // 1. Comprehensive OSM Tag Queries
  let tagQuery = '';
  
  if (type === 'aed') {
    tagQuery = `
      node["emergency"="defibrillator"](around:${radiusMeters},${lat},${lng});
      node["emergency"="aed"](around:${radiusMeters},${lat},${lng});
      node["amenity"="aed"](around:${radiusMeters},${lat},${lng});
    `;
  } else if (type === 'pharmacy') {
    tagQuery = `
      node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
      way["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
      node["shop"="chemist"](around:${radiusMeters},${lat},${lng});
      way["shop"="chemist"](around:${radiusMeters},${lat},${lng});
      node["shop"="medical"](around:${radiusMeters},${lat},${lng});
      way["shop"="medical"](around:${radiusMeters},${lat},${lng});
      node["shop"="pharmacy"](around:${radiusMeters},${lat},${lng});
      way["shop"="pharmacy"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="pharmacy"](around:${radiusMeters},${lat},${lng});
      way["healthcare"="pharmacy"](around:${radiusMeters},${lat},${lng});
      node["amenity"="medical_store"](around:${radiusMeters},${lat},${lng});
    `;
  } else {
    // Hospital & Emergency Clinics & Doctors
    tagQuery = `
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="hospital"](around:${radiusMeters},${lat},${lng});
      way["healthcare"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="doctors"](around:${radiusMeters},${lat},${lng});
      way["amenity"="doctors"](around:${radiusMeters},${lat},${lng});
    `;
  }

  const query = `[out:json][timeout:8];(${tagQuery});out center 50;`;

  // Try Overpass mirrors with short failover timeout
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const url = `${endpoint}?data=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'AIFirstAidEmergencyAssistant/2.0 (contact: info@aifirstaid.org)'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.elements && data.elements.length > 0) {
          return data.elements.map(elem => {
            const tags = elem.tags || {};
            const latitude = elem.lat ?? (elem.center ? elem.center.lat : null);
            const longitude = elem.lon ?? (elem.center ? elem.center.lon : null);

            if (latitude === null || longitude === null) return null;

            const defaultName = type === 'aed' 
              ? 'Automated External Defibrillator (AED)' 
              : (type === 'pharmacy' ? 'Medical Store & Pharmacy' : 'Hospital / Emergency Clinic');

            const name = tags.name || tags['name:en'] || tags['name:ta'] || defaultName;

            const street = tags['addr:street'] || '';
            const suburb = tags['addr:suburb'] || tags['addr:district'] || '';
            const city = tags['addr:city'] || '';
            const fullAddress = [street, suburb, city].filter(Boolean).join(', ') || null;

            return {
              id: `osm-${elem.type || 'node'}-${elem.id}`,
              name,
              type,
              latitude,
              longitude,
              address: fullAddress,
              phone: tags.phone || tags['contact:phone'] || tags['emergency:phone'] || tags['telephone'] || null,
              openingHours: tags.opening_hours || (type === 'hospital' ? '24/7 Emergency' : null),
              source: 'overpass_osm'
            };
          }).filter(Boolean);
        }
      }
    } catch (err) {
      // Continue to next mirror
    }
  }

  // 2. Fallback: OpenStreetMap Nominatim Search
  try {
    const delta = 0.25; // ~25 km bounding box
    const viewbox = `${lng - delta},${lat + delta},${lng + delta},${lat - delta}`;
    const searchTerm = type === 'pharmacy' ? 'pharmacy medical chemist' : (type === 'aed' ? 'defibrillator AED' : 'hospital clinic medical');
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchTerm)}&bounded=1&viewbox=${viewbox}&limit=30&addressdetails=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const nomRes = await fetch(nomUrl, {
      headers: { 'User-Agent': 'AIFirstAidEmergencyAssistant/2.0 (contact: info@aifirstaid.org)' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (nomRes.ok) {
      const nomData = await nomRes.json();
      if (Array.isArray(nomData) && nomData.length > 0) {
        return nomData.map(d => ({
          id: `nom-${d.place_id || d.osm_id}`,
          name: d.name || d.display_name.split(',')[0],
          type,
          latitude: parseFloat(d.lat),
          longitude: parseFloat(d.lon),
          address: d.display_name,
          phone: null,
          openingHours: type === 'hospital' ? '24/7 Emergency' : null,
          source: 'nominatim_osm'
        }));
      }
    }
  } catch (err) {
    // Continue to verified registry
  }

  // 3. Fallback: Local Verified Emergency Registry
  const registry = loadLocalRegistry();
  const matched = registry.filter(r => r.type === type);
  return matched;
}
