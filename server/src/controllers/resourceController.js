import prisma from '../config/prisma.js';
import { fetchNearbyOSMResources } from '../services/overpassService.js';

// Accurate Haversine Distance Formula in meters
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (val) => (val * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

export function formatDistance(distanceMeters) {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m away`;
  }
  return `${(distanceMeters / 1000).toFixed(1)} km away`;
}

// In-memory cache for Reverse Geocoding to respect Nominatim limits
const geocodeCache = new Map();
const GEOCODE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function reverseGeocode(req, res, next) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Valid 'lat' and 'lng' query parameters are required." });
    }

    // Cache key grouped to ~100m precision (3 decimal places)
    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    const cached = geocodeCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < GEOCODE_CACHE_TTL)) {
      return res.json(cached.data);
    }

    // Call OpenStreetMap Nominatim with compliant User-Agent and timeout
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const nominatimRes = await fetch(url, {
      headers: {
        'User-Agent': 'AIFirstAidEmergencyAssistant/2.0 (contact: info@aifirstaid.org)',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!nominatimRes.ok) {
      return res.json({
        address: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        latitude: lat,
        longitude: lng
      });
    }

    const data = await nominatimRes.json();
    const addressObj = data.address || {};
    
    const street = addressObj.road || addressObj.pedestrian || addressObj.street || '';
    const area = addressObj.neighbourhood || addressObj.suburb || addressObj.residential || addressObj.district || '';
    const city = addressObj.city || addressObj.town || addressObj.village || addressObj.county || '';
    const state = addressObj.state || '';
    const country = addressObj.country || '';

    const parts = [street, area, city, state, country].filter(Boolean);
    const formattedAddress = parts.length > 0 ? parts.join(', ') : data.display_name || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;

    const responsePayload = {
      address: formattedAddress,
      displayName: data.display_name,
      components: {
        road: street,
        suburb: area,
        city,
        state,
        country,
        postcode: addressObj.postcode || null
      },
      latitude: lat,
      longitude: lng
    };

    // Store in cache
    geocodeCache.set(cacheKey, {
      timestamp: Date.now(),
      data: responsePayload
    });

    res.json(responsePayload);

  } catch (error) {
    console.warn("[ReverseGeocode] Geocoding lookup failed:", error.message);
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    res.json({
      address: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      latitude: lat,
      longitude: lng
    });
  }
}

export async function searchLocation(req, res, next) {
  try {
    const query = req.query.q;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Query parameter 'q' is required." });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const nominatimRes = await fetch(url, {
      headers: {
        'User-Agent': 'AIFirstAidEmergencyAssistant/2.0 (contact: info@aifirstaid.org)',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!nominatimRes.ok) {
      return res.json([]);
    }

    const data = await nominatimRes.json();
    const results = data.map(item => ({
      name: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type,
      importance: item.importance
    }));

    res.json(results);
  } catch (error) {
    console.warn("[SearchLocation] Nominatim search failed:", error.message);
    res.json([]);
  }
}

export async function getNearbyResources(req, res, next) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const type = req.query.type || 'hospital'; // hospital, aed, pharmacy

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Query parameters 'lat' and 'lng' must be valid numbers." });
    }

    try {
      // 1. Attempt to fetch real-time OSM data around user's actual coordinates
      const osmResources = await fetchNearbyOSMResources(lat, lng, type, 25000);
      
      // Calculate real Haversine distance from user's live position
      const sortedOsm = osmResources
        .map(item => {
          const dist = calculateHaversineDistance(lat, lng, item.latitude, item.longitude);
          return {
            ...item,
            distanceM: dist,
            distanceFormatted: formatDistance(dist),
            // Estimated driving (hospital) vs walking (AED/pharmacy) travel time
            timeMin: Math.max(1, Math.round(type === 'hospital' ? dist / 400 : dist / 80)),
            directionsUrl: `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${item.latitude},${item.longitude}`
          };
        })
        .filter(item => item.distanceM <= 25000) // Within 25 km only
        .sort((a, b) => a.distanceM - b.distanceM);

      return res.json(sortedOsm);

    } catch (osmError) {
      console.warn("[ResourceController] Overpass API unavailable:", osmError.message);
      
      // 2. Fallback to database resources ONLY if they are strictly within 15 km
      let dbResources = [];
      try {
        dbResources = await prisma.emergencyResource.findMany({
          where: { type }
        });
      } catch (dbErr) {
        dbResources = [];
      }

      // Filter STRICTLY within 15km - NEVER return far-away mock cities as "nearby"
      const realLocalResources = dbResources
        .map(item => {
          const dist = calculateHaversineDistance(lat, lng, item.latitude, item.longitude);
          return {
            id: item.id,
            name: item.name,
            type: item.type,
            latitude: item.latitude,
            longitude: item.longitude,
            address: item.address,
            phone: item.phone,
            openingHours: item.openingHours,
            source: 'verified_db',
            distanceM: dist,
            distanceFormatted: formatDistance(dist),
            timeMin: Math.max(1, Math.round(type === 'hospital' ? dist / 400 : dist / 80)),
            directionsUrl: `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${item.latitude},${item.longitude}`
          };
        })
        .filter(item => item.distanceM <= 15000) // Within 15 km only
        .sort((a, b) => a.distanceM - b.distanceM);

      return res.json(realLocalResources);
    }
  } catch (error) {
    next(error);
  }
}

export async function getNearbyAEDs(req, res, next) {
  req.query.type = 'aed';
  return getNearbyResources(req, res, next);
}

export async function getResourceById(req, res, next) {
  try {
    const { id } = req.params;
    
    if (id.startsWith('osm-')) {
      return res.status(404).json({ error: "OSM live resource is queried by coordinates." });
    }

    let resource = null;
    try {
      resource = await prisma.emergencyResource.findUnique({
        where: { id }
      });
    } catch (err) {}

    if (!resource) {
      return res.status(404).json({ error: "Resource not found." });
    }

    res.json(resource);
  } catch (error) {
    next(error);
  }
}
