import React, { useState, useEffect, useRef, useContext } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Heart, 
  RefreshCw, 
  Share2, 
  Crosshair, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  ExternalLink,
  ShieldAlert,
  Search,
  X,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { AppContext } from '../context/AppContext';
import { translations } from '../services/translations';

export default function EmergencyMapPage() {
  const { 
    language, 
    location, 
    setManualLocation,
    locationStatus, 
    locationError, 
    accuracyQuality, 
    locationAddress, 
    requestLocation, 
    refreshLocation 
  } = useContext(AppContext);

  const t = translations[language];
  const isTa = language === 'ta';

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const markersRef = useRef([]);

  const [activeType, setActiveType] = useState('hospital'); // hospital | aed | pharmacy
  const [destinations, setDestinations] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // Search locality states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const hasRealLocation = location && typeof location.lat === 'number' && typeof location.lng === 'number';

  // 1. Fetch nearby emergency facilities based ONLY on real coordinates
  useEffect(() => {
    if (!hasRealLocation) {
      setDestinations([]);
      return;
    }

    const loadResources = async () => {
      setMapLoading(true);
      setFetchError("");
      try {
        const data = await api.getNearbyResources(location.lat, location.lng, activeType);
        setDestinations(data);
      } catch (err) {
        console.error("Failed to load map resources:", err);
        setFetchError(isTa 
          ? "அருகிலுள்ள மருத்துவத் தரவை ஏற்றுவதில் பிழை ஏற்பட்டது. அவசர உதவிக்கு நேரடியாக 112ஐ அழைக்கவும்."
          : "Nearby emergency data could not be retrieved. Please dial 112 or 108 directly.");
      } finally {
        setMapLoading(false);
      }
    };

    loadResources();
  }, [hasRealLocation, location?.lat, location?.lng, activeType, isTa]);

  // 2. Initialize Leaflet Map once real location is available
  useEffect(() => {
    if (!hasRealLocation || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true
      }).setView([location.lat, location.lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Allow user to click anywhere on map to pin their exact location
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setManualLocation(lat, lng);
      });

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([location.lat, location.lng]);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hasRealLocation, setManualLocation]);

  // 3. Update User Marker and Accuracy Circle when live location updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !hasRealLocation) return;

    // Clear old user marker and accuracy circle
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (accuracyCircleRef.current) {
      map.removeLayer(accuracyCircleRef.current);
      accuracyCircleRef.current = null;
    }

    // Google-style pulsing location dot
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #2563eb; opacity: 0.35; animation: pulse-critical 2s infinite;"></div>
          <div style="position: absolute; top: 5px; left: 5px; width: 18px; height: 18px; border-radius: 50%; background: #1d4ed8; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const accuracyText = location.accuracy ? `±${location.accuracy}m` : '';

    userMarkerRef.current = L.marker([location.lat, location.lng], { icon: userIcon, zIndexOffset: 1000, draggable: true })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: inherit; font-size: 0.8rem; line-height: 1.4;">
          <strong style="color: #2563eb; font-size: 0.85rem; display: block;">📍 ${isTa ? 'எனது இருப்பிடம்' : 'My Location'}</strong>
          <span style="color: #64748b; font-size: 0.75rem;">Lat: ${location.lat.toFixed(5)}, Lng: ${location.lng.toFixed(5)}</span><br/>
          <span style="color: #059669; font-weight: 600; font-size: 0.75rem;">${isTa ? 'துல்லியம்' : 'Accuracy'}: ${accuracyText}</span>
          <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 4px;">
            ${isTa ? '(மாற்ற இழுத்து விடவும் / வரைபடத்தில் கிளிக் செய்யவும்)' : '(Drag pin or click map to adjust)'}
          </div>
        </div>
      `);

    // Handle marker drag to adjust location
    userMarkerRef.current.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      setManualLocation(pos.lat, pos.lng);
    });

    // Draw real accuracy circle only if accuracy is reasonable (< 5000m)
    if (location.accuracy && location.accuracy > 0 && location.accuracy < 5000) {
      accuracyCircleRef.current = L.circle([location.lat, location.lng], {
        radius: location.accuracy,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.12,
        weight: 1.5
      }).addTo(map);
    }

  }, [hasRealLocation, location?.lat, location?.lng, location?.accuracy, isTa, setManualLocation]);

  // 4. Update Destination Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !hasRealLocation) return;

    // Clear old destination markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    destinations.forEach(dest => {
      const isAed = dest.type === 'aed';
      const isPharm = dest.type === 'pharmacy';
      const markerColor = isAed ? '#10b981' : (isPharm ? '#0ea5e9' : '#ef4444');
      const markerIcon = isAed ? '❤️' : (isPharm ? '💊' : '🏥');

      const destIcon = L.divIcon({
        className: 'custom-resource-marker',
        html: `
          <div style="
            background: ${markerColor}; 
            color: white; 
            width: 32px; 
            height: 32px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4);
            font-size: 15px;
            cursor: pointer;
          ">
            ${markerIcon}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const directionsUrl = dest.directionsUrl || `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${dest.latitude},${dest.longitude}`;

      const marker = L.marker([dest.latitude, dest.longitude], { icon: destIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: inherit; font-size: 0.8rem; max-width: 220px; line-height: 1.4;">
            <strong style="display: block; font-size: 0.9rem; color: #0f172a; margin-bottom: 2px;">${dest.name}</strong>
            <span style="color: #64748b; font-size: 0.75rem; display: block; margin-bottom: 6px;">${dest.address || (isTa ? 'முகவரி குறிப்பிடப்படவில்லை' : 'Address not listed')}</span>
            <div style="color: #2563eb; font-weight: 700; font-size: 0.8rem; margin-bottom: 6px;">
              📍 ${dest.distanceFormatted || `${(dest.distanceM / 1000).toFixed(1)} km away`}
            </div>
            ${dest.phone ? `<a href="tel:${dest.phone}" style="display: block; color: #059669; text-decoration: none; font-weight: 600; font-size: 0.75rem; margin-bottom: 6px;">📞 ${dest.phone}</a>` : ''}
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #2563eb; color: #ffffff !important; padding: 5px 12px; border-radius: 6px; text-decoration: none; font-size: 0.75rem; font-weight: 700; margin-top: 4px;">
              ${isTa ? 'வழிகாட்டுதல் பெறு' : 'Get Directions'} ↗
            </a>
          </div>
        `);

      marker.on('click', () => {
        setSelectedDest(dest);
      });

      markersRef.current.push(marker);
    });

    // Auto-fit bounds if we have points, otherwise keep user centered
    if (destinations.length > 0 && userMarkerRef.current) {
      const group = L.featureGroup([userMarkerRef.current, ...markersRef.current]);
      map.fitBounds(group.getBounds().pad(0.12), { maxZoom: 16 });
    }

  }, [destinations, hasRealLocation, location?.lat, location?.lng, isTa]);

  // Recenter map on user location
  const handleRecenter = () => {
    if (mapInstanceRef.current && hasRealLocation) {
      mapInstanceRef.current.flyTo([location.lat, location.lng], 16, { animate: true, duration: 1 });
      if (userMarkerRef.current) {
        userMarkerRef.current.openPopup();
      }
    }
  };

  // Explicit user trigger for fresh GPS
  const handleRefreshLocation = async () => {
    setGpsLoading(true);
    try {
      await refreshLocation();
      handleRecenter();
    } catch (err) {
      console.warn("Location refresh rejected:", err.message);
    } finally {
      setGpsLoading(false);
    }
  };

  // Search area/landmark by text or pincode
  const handleSearchLocationSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchingLocation(true);
    setShowSearchDropdown(true);

    try {
      const results = await api.searchLocation(searchQuery.trim());
      setSearchResults(results);
      if (results.length === 1) {
        selectSearchedLocation(results[0]);
      }
    } catch (err) {
      console.error("Search location failed:", err);
      setSearchResults([]);
    } finally {
      setSearchingLocation(false);
    }
  };

  const selectSearchedLocation = (place) => {
    setManualLocation(place.latitude, place.longitude, place.name);
    setShowSearchDropdown(false);
    setSearchQuery("");
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.latitude, place.longitude], 15, { animate: true });
    }
  };

  // Share real location coordinates
  const shareMyLocation = () => {
    if (!hasRealLocation) return;
    const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const shareTitle = isTa ? 'எனது அவசரகால இருப்பிடம்' : 'My Emergency Location';
    const shareText = isTa 
      ? `அவசர உதவி! எனது தற்போதைய நேரடி இருப்பிடம்: Lat: ${location.lat.toFixed(5)}, Lng: ${location.lng.toFixed(5)} (துல்லியம்: ±${location.accuracy}m)`
      : `Emergency! My real-time device location: Lat: ${location.lat.toFixed(5)}, Lng: ${location.lng.toFixed(5)} (Accuracy: ±${location.accuracy}m)`;

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: mapsUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText}\n${mapsUrl}`);
      alert(isTa ? "இருப்பிட விவரங்கள் நகலெடுக்கப்பட்டது!" : "Live location coordinates copied to clipboard!");
    }
  };

  // Render Accuracy Quality Badge
  const renderAccuracyBadge = () => {
    if (!hasRealLocation) return null;
    
    if (location.isManual) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid var(--color-safe)',
          color: 'var(--color-safe)',
          padding: '3px 8px',
          borderRadius: '12px',
          fontSize: '0.72rem',
          fontWeight: 700
        }}>
          <CheckCircle2 size={12} />
          {isTa ? '📍 பயனர் குறிப்பிட்ட துல்லிய இருப்பிடம்' : '📍 User-Selected Accurate Location'}
        </span>
      );
    }

    if (accuracyQuality === 'high') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid var(--color-safe)',
          color: 'var(--color-safe)',
          padding: '3px 8px',
          borderRadius: '12px',
          fontSize: '0.72rem',
          fontWeight: 700
        }}>
          <CheckCircle2 size={12} />
          {isTa ? `உயர் துல்லியம்: ±${location.accuracy} மீ` : `High accuracy: ±${location.accuracy} m`}
        </span>
      );
    } else if (accuracyQuality === 'good') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid var(--color-primary)',
          color: 'var(--color-primary)',
          padding: '3px 8px',
          borderRadius: '12px',
          fontSize: '0.72rem',
          fontWeight: 700
        }}>
          <Compass size={12} />
          {isTa ? `நல்ல துல்லியம்: ±${location.accuracy} மீ` : `Good accuracy: ±${location.accuracy} m`}
        </span>
      );
    } else {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(234, 179, 8, 0.15)',
          border: '1px solid #eab308',
          color: '#eab308',
          padding: '3px 8px',
          borderRadius: '12px',
          fontSize: '0.72rem',
          fontWeight: 700
        }}>
          <AlertTriangle size={12} />
          {isTa ? `ISP பிணைய உத்தேச இருப்பிடம்: ±${location.accuracy} மீ` : `ISP Network Coarse Location: ±${location.accuracy} m`}
        </span>
      );
    }
  };

  const isCoarseNetworkLocation = hasRealLocation && !location.isManual && location.accuracy > 1000;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* 🧭 Location Control Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>📍 {t.map_header}</h2>
              {renderAccuracyBadge()}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isTa ? 'உண்மையான சாதன இருப்பிடத்தை அடிப்படையாகக் கொண்ட அவசர மருத்துவ வரைபடம்.' : 'Real emergency locator — searches genuine hospitals, pharmacies, and AEDs near you.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {hasRealLocation ? (
              <>
                <button 
                  onClick={handleRecenter}
                  className="btn btn-glass"
                  title={isTa ? 'வரைபடத்தை மையப்படுத்து' : 'Recenter on My Location'}
                  style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Crosshair size={15} style={{ color: 'var(--color-primary)' }} />
                  {isTa ? 'மையப்படுத்து' : 'Recenter'}
                </button>
                <button 
                  onClick={handleRefreshLocation} 
                  disabled={gpsLoading}
                  className="btn btn-glass"
                  style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <RefreshCw size={14} className={gpsLoading ? 'animate-spin' : ''} />
                  {isTa ? 'ஜிபிஎஸ் புதுப்பி' : 'Refresh GPS'}
                </button>
                <button 
                  onClick={shareMyLocation}
                  className="btn btn-glass"
                  style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                >
                  <Share2 size={14} />
                  {isTa ? 'பகிர்' : 'Share Location'}
                </button>
              </>
            ) : (
              <button
                onClick={handleRefreshLocation}
                disabled={gpsLoading}
                className="btn"
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  padding: '9px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <MapPin size={16} />
                {gpsLoading 
                  ? (isTa ? 'கண்டறியப்படுகிறது...' : 'Detecting GPS...') 
                  : (isTa ? 'எனது சாதன ஜிபிஎஸ்-ஐப் பயன்படுத்து' : 'Use Device GPS')}
              </button>
            )}
          </div>
        </div>

        {/* 🔍 Manual Area / City / Pincode Search Bar */}
        <div style={{ position: 'relative' }}>
          <form onSubmit={handleSearchLocationSubmit} style={{ display: 'flex', gap: '6px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={isTa 
                  ? "உங்கள் பகுதி, நகரம், பின்கோடு அல்லது அடையாளத்தைத் தேடவும் (எ.கா. Gandhipuram Coimbatore, 641001)..." 
                  : "Search your area, city, pincode or landmark (e.g. Gandhipuram Coimbatore, 641001)..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={searchingLocation}
              className="btn"
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0
              }}
            >
              {searchingLocation ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
              {isTa ? 'இருப்பிடத்தை அமை' : 'Set Location'}
            </button>
          </form>

          {/* Search Results Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: '8px',
              zIndex: 1000,
              boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              {searchResults.map((place, idx) => (
                <div
                  key={idx}
                  onClick={() => selectSearchedLocation(place)}
                  style={{
                    padding: '10px 14px',
                    borderBottom: idx < searchResults.length - 1 ? '1px solid #1f2937' : 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <MapPin size={15} style={{ color: '#3b82f6', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {place.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ⚠️ Helpful Desktop ISP Location Explanation & Action Banner */}
        {isCoarseNetworkLocation && (
          <div style={{
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '8px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '0.78rem',
            color: '#fef08a'
          }}>
            <Info size={16} style={{ color: '#eab308', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>{isTa ? 'கணினி/டெஸ்க்டாப் உலாவி அறிவிப்பு:' : 'Desktop Browser Network Location Notice:'}</strong>{' '}
              {isTa 
                ? 'உங்கள் உலாவி GPS சிப் இல்லாததால் உங்கள் பிராட்பேண்ட் ISP சேவையகத்தின் பொதுவான பகுதியை (±50 கி.மீ) கண்டறிந்துள்ளது. உங்கள் துல்லியமான பகுதியை அமைக்க மேலே உள்ள தேடல் பெட்டியில் உங்கள் பகுதி/நகரத்தின் பெயரைத் தட்டச்சு செய்யவும் அல்லது வரைபடத்தில் கிளிக் செய்யவும்.'
                : 'Your desktop/laptop browser does not have hardware GPS, so it reported your broadband ISP gateway region (±50 km). To get resources for your exact locality, type your area/city/pincode in the search box above or click anywhere on the map.'}
            </div>
          </div>
        )}

        {/* Human-readable detected address banner */}
        {hasRealLocation && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {locationAddress || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
              Lat: {location.lat.toFixed(5)} • Lng: {location.lng.toFixed(5)}
            </div>
          </div>
        )}

        {/* Resource Category Selection Tabs */}
        {hasRealLocation && (
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'hospital', label: isTa ? '🏥 மருத்துவமனைகள்' : '🏥 Hospitals & Clinics' },
              { id: 'pharmacy', label: isTa ? '💊 மருந்தகங்கள்' : '💊 Pharmacies' },
              { id: 'aed', label: isTa ? '❤️ ஏ.இ.டி (AED)' : '❤️ AED Defibrillators' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveType(tab.id);
                  setSelectedDest(null);
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: activeType === tab.id ? 'var(--color-primary)' : 'var(--glass-border)',
                  background: activeType === tab.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)',
                  color: activeType === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ⚠️ Geolocation Status Notices when real location is NOT yet resolved */}
      {!hasRealLocation && (
        <div className="glass-panel" style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {locationStatus === 'detecting' ? (
            <>
              <div style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--color-primary)',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <RefreshCw size={28} className="animate-spin" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {isTa ? 'உண்மையான இருப்பிடம் கண்டறியப்படுகிறது...' : 'Detecting your device location...'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.5 }}>
                {isTa 
                  ? 'உங்கள் சாதனத்திலிருந்து ஜிபிஎஸ் சிக்னலைப் பெறுகிறது. உலாவி அனுமதி கேட்டால் "Allow" என்பதைக் கிளிக் செய்யவும், அல்லது கீழே உங்கள் பகுதியைத் தேடவும்.'
                  : 'Acquiring GPS coordinates from your device. Click "Allow" on the browser prompt, or search your area manually below.'}
              </p>

              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '400px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.querySelector('input[placeholder*="Search your area"]');
                    if (el) el.focus();
                  }}
                  className="btn"
                  style={{
                    background: 'var(--color-primary)',
                    color: '#fff',
                    padding: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Search size={16} />
                  {isTa ? 'பகுதியைத் தட்டச்சு செய்து தேர்ந்தெடுக்கவும்' : 'Type & Search Your Locality'}
                </button>

                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                  {[
                    { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
                    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
                    { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
                    { name: 'Pollachi', lat: 10.6609, lng: 77.0048 }
                  ].map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setManualLocation(c.lat, c.lng, c.name)}
                      className="btn btn-glass"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px' }}
                    >
                      📍 {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : locationStatus === 'permission_denied' ? (
            <>
              <div style={{
                background: 'var(--color-critical-glow)',
                color: 'var(--color-critical)',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-critical)' }}>
                {isTa ? 'இருப்பிட அனுமதி மறுக்கப்பட்டது' : 'Location Permission Denied'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.5 }}>
                {isTa 
                  ? 'இருப்பிட அனுமதி மறுக்கப்பட்டது. உங்கள் உலாவி அமைப்புகளில் இருப்பிடத்தை அனுமதிக்கவும் அல்லது மேலே உள்ள தேடல் பெட்டியில் உங்கள் நகரைத் தட்டச்சு செய்யவும்.'
                  : 'Location permission was denied. Please allow location in your browser settings, or type your city/area in the search box above.'}
              </p>
            </>
          ) : (
            <>
              <div style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--color-primary)',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MapPin size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {isTa ? 'அவசர உதவிக்கு உங்கள் இருப்பிடம் தேவை' : 'Live Device Location Required'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.5 }}>
                {isTa 
                  ? 'உங்களைச் சுற்றியுள்ள உண்மையான மருத்துவமனைகள், மருந்தகங்கள் மற்றும் ஏ.இ.டி சாதனங்களைக் கண்டறிய சாதன ஜிபிஎஸ்-ஐ இயக்கவும் அல்லது உங்கள் பகுதியைத் தேடவும்.'
                  : 'Click below to detect your device GPS, or type your locality/city in the search box above.'}
              </p>
              <button
                onClick={handleRefreshLocation}
                disabled={gpsLoading}
                className="btn"
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  padding: '12px 24px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.35)'
                }}
              >
                <Crosshair size={18} />
                {gpsLoading ? (isTa ? 'கண்டறியப்படுகிறது...' : 'Detecting GPS...') : (isTa ? 'சாதன ஜிபிஎஸ்-ஐப் பயன்படுத்து' : 'Use Device GPS')}
              </button>
            </>
          )}
        </div>
      )}

      {fetchError && (
        <div style={{
          background: 'var(--color-critical-glow)',
          border: '1px solid var(--color-critical)',
          color: '#fff',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldAlert size={16} />
          <span>{fetchError}</span>
        </div>
      )}

      {/* 🗺️ Real Leaflet Map (Rendered only with real GPS coordinates) */}
      {hasRealLocation && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          
          <div 
            ref={mapContainerRef} 
            className="glass-panel"
            style={{ 
              height: '380px', 
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              zIndex: 1
            }} 
          />

          {/* 📋 Proximity Emergency Facilities List */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
                📋 {isTa 
                  ? `அருகிலுள்ள ${activeType === 'hospital' ? 'மருத்துவமனைகள்' : (activeType === 'pharmacy' ? 'மருந்தகங்கள்' : 'AED சாதனங்கள்')}` 
                  : `Nearby Verified ${activeType.toUpperCase()}s`}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {destinations.length} {isTa ? 'இடங்கள் கண்டறியப்பட்டன' : 'places found'}
              </span>
            </div>

            {mapLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--color-primary)' }} />
                {isTa ? 'உண்மையான அவசர இடங்கள் தேடப்படுகின்றன...' : 'Searching real OpenStreetMap emergency resources near your coordinates...'}
              </div>
            ) : destinations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <AlertTriangle size={24} style={{ color: '#eab308', margin: '0 auto 8px' }} />
                <div>{isTa ? 'உங்கள் இருப்பிடத்திற்கு அருகில் 8 கி.மீ சுற்றளவில் வசதிகள் கிடைக்கவில்லை.' : 'No items found within 8 km radius of your coordinates.'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {isTa ? 'அவசர ஆபத்துக்களில் உடனடியாக 112 அல்லது 108 ஐ தொடர்பு கொள்ளவும்.' : 'For medical emergencies, immediately call 112 or 108.'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                {destinations.map((dest) => {
                  const isSelected = selectedDest?.id === dest.id;
                  const directionsUrl = dest.directionsUrl || `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${dest.latitude},${dest.longitude}`;

                  return (
                    <div
                      key={dest.id}
                      onClick={() => {
                        setSelectedDest(dest);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.flyTo([dest.latitude, dest.longitude], 16, { animate: true });
                        }
                      }}
                      style={{
                        padding: '0.9rem',
                        borderRadius: '10px',
                        background: isSelected ? 'var(--bg-tertiary)' : 'rgba(255,255,255,0.01)',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--color-primary)' : 'var(--glass-border)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '1rem' }}>
                            {dest.type === 'aed' ? '❤️' : (dest.type === 'pharmacy' ? '💊' : '🏥')}
                          </span>
                          <strong style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {dest.name}
                          </strong>
                        </div>
                        
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', margin: '3px 0 6px' }}>
                          {dest.address || (isTa ? 'முகவரி குறிப்பிடப்படவில்லை' : 'Address not listed')}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          {dest.phone && (
                            <a 
                              href={`tel:${dest.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '3px', 
                                color: '#10b981', 
                                textDecoration: 'none', 
                                fontSize: '0.75rem', 
                                fontWeight: 700 
                              }}
                            >
                              <Phone size={12} />
                              {dest.phone}
                            </a>
                          )}
                          
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'var(--color-primary)',
                              color: '#fff',
                              textDecoration: 'none',
                              padding: '3px 10px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            <Navigation size={11} />
                            {isTa ? 'வழிகாட்டுதல்' : 'Get Directions'}
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ display: 'block', color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.95rem' }}>
                          {dest.distanceFormatted}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          ~{dest.timeMin} {isTa ? 'நிமி' : 'min'} {dest.type === 'hospital' ? (isTa ? 'வாகனம்' : 'drive') : (isTa ? 'நடை' : 'walk')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
