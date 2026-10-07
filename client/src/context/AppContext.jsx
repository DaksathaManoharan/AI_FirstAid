import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Real Geolocation State Machine
  // Statuses: 'idle' | 'detecting' | 'permission_required' | 'permission_denied' | 'unavailable' | 'timeout' | 'unsupported' | 'detected'
  const [location, setLocation] = useState(null); // { lat, lng, accuracy, timestamp }
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState(null);
  const [accuracyQuality, setAccuracyQuality] = useState(null); // 'high' (<=30m) | 'good' (30-100m) | 'low' (>100m)
  const [locationAddress, setLocationAddress] = useState(null);
  const [activeEmergency, setActiveEmergency] = useState(null);

  const refinementWatchRef = useRef(null);
  const refinementTimeoutRef = useRef(null);

  // Clean up any running GPS refinement watcher
  const clearRefinementWatch = useCallback(() => {
    if (refinementWatchRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(refinementWatchRef.current);
      refinementWatchRef.current = null;
    }
    if (refinementTimeoutRef.current !== null) {
      clearTimeout(refinementTimeoutRef.current);
      refinementTimeoutRef.current = null;
    }
  }, []);

  // Compute accuracy quality tier
  const evaluateAccuracyQuality = (accuracyMeters) => {
    if (accuracyMeters <= 30) return 'high';
    if (accuracyMeters <= 100) return 'good';
    return 'low';
  };

  // Reverse geocode helper
  const fetchAddress = async (lat, lng) => {
    try {
      const geo = await api.reverseGeocode(lat, lng);
      if (geo && geo.address) {
        setLocationAddress(geo.address);
      }
    } catch (err) {
      console.warn("Reverse geocode failed:", err.message);
    }
  };

  // Explicit Location Request using real browser Geolocation API
  const requestLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      clearRefinementWatch();

      if (!navigator.geolocation) {
        const errMsg = "Location services are not supported by this browser.";
        setLocationStatus('unsupported');
        setLocationError(errMsg);
        reject(new Error(errMsg));
        return;
      }

      setLocationStatus('detecting');
      setLocationError(null);

      const geoOptions = {
        enableHighAccuracy: true,
        maximumAge: 0, // Never use stale cached position
        timeout: 15000 // 15-second timeout
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const timestamp = pos.timestamp || Date.now();
          const quality = evaluateAccuracyQuality(accuracy);

          const realLocation = {
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy * 10) / 10,
            timestamp
          };

          setLocation(realLocation);
          setAccuracyQuality(quality);
          setLocationStatus('detected');
          setLocationError(null);

          // Asynchronously reverse geocode
          fetchAddress(latitude, longitude);

          // If accuracy is poor (>100m), attempt a brief refinement watch to get better GPS fix
          if (accuracy > 100) {
            console.log(`[Geolocation] Initial accuracy ±${Math.round(accuracy)}m is low. Watching for improvement...`);
            
            refinementWatchRef.current = navigator.geolocation.watchPosition(
              (betterPos) => {
                const betterAcc = betterPos.coords.accuracy;
                if (betterAcc < accuracy) {
                  console.log(`[Geolocation] Improved accuracy: ±${Math.round(betterAcc)}m`);
                  const refinedLocation = {
                    lat: betterPos.coords.latitude,
                    lng: betterPos.coords.longitude,
                    accuracy: Math.round(betterAcc * 10) / 10,
                    timestamp: betterPos.timestamp || Date.now()
                  };
                  setLocation(refinedLocation);
                  setAccuracyQuality(evaluateAccuracyQuality(betterAcc));
                  
                  // Stop once good accuracy obtained
                  if (betterAcc <= 50) {
                    clearRefinementWatch();
                  }
                }
              },
              (watchErr) => {
                console.warn("[Geolocation] Watch refinement error:", watchErr.message);
                clearRefinementWatch();
              },
              { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
            );

            // Auto-stop watch after 10 seconds to conserve battery
            refinementTimeoutRef.current = setTimeout(() => {
              clearRefinementWatch();
            }, 10000);
          }

          resolve(realLocation);
        },
        (err) => {
          let status = 'unavailable';
          let message = "Your device could not determine the current location. Please enable GPS/location services and try again.";

          switch (err.code) {
            case 1: // PERMISSION_DENIED
              status = 'permission_denied';
              message = "Location permission was denied. Please allow location access in your browser settings and try again.";
              break;
            case 2: // POSITION_UNAVAILABLE
              status = 'unavailable';
              message = "Your device could not determine the current location. Please enable GPS/location services and try again.";
              break;
            case 3: // TIMEOUT
              status = 'timeout';
              message = "Location detection timed out. Move to an area with better GPS/network reception and try again.";
              break;
            default:
              status = 'unavailable';
              message = err.message || "An unknown error occurred while detecting location.";
              break;
          }

          setLocationStatus(status);
          setLocationError(message);
          // Never set fake or fallback coordinates
          reject(new Error(message));
        },
        geoOptions
      );
    });
  }, [clearRefinementWatch]);

  // Initial permission check & detection on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      setLocationError("Location services are not supported by this browser.");
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          // If already granted, immediately obtain real device position
          requestLocation().catch(() => {});
        } else if (result.state === 'prompt') {
          setLocationStatus('permission_required');
        } else if (result.state === 'denied') {
          setLocationStatus('permission_denied');
          setLocationError("Location permission was denied. Please allow location access in your browser settings and try again.");
        }

        result.onchange = () => {
          if (result.state === 'granted') {
            requestLocation().catch(() => {});
          } else if (result.state === 'denied') {
            setLocationStatus('permission_denied');
            setLocationError("Location permission was denied. Please allow location access in your browser settings and try again.");
          }
        };
      }).catch(() => {
        // Fallback for browsers without permission query
        setLocationStatus('permission_required');
      });
    } else {
      setLocationStatus('permission_required');
    }

    return () => {
      clearRefinementWatch();
    };
  }, [requestLocation, clearRefinementWatch]);

  // Sync localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const loginUser = (token, userData) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.preferredLanguage) {
      setLanguage(userData.preferredLanguage);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const setManualLocation = useCallback((lat, lng, customAddress = null) => {
    clearRefinementWatch();
    const manualLoc = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      accuracy: 10,
      timestamp: Date.now(),
      isManual: true
    };
    setLocation(manualLoc);
    setAccuracyQuality('high');
    setLocationStatus('detected');
    setLocationError(null);
    if (customAddress) {
      setLocationAddress(customAddress);
    } else {
      fetchAddress(lat, lng);
    }
  }, [clearRefinementWatch]);

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      theme,
      setTheme,
      user,
      setUser,
      loginUser,
      logoutUser,
      location,
      setLocation,
      setManualLocation,
      locationStatus,
      locationError,
      accuracyQuality,
      locationAddress,
      requestLocation,
      refreshLocation: requestLocation, // alias
      activeEmergency,
      setActiveEmergency
    }}>
      {children}
    </AppContext.Provider>
  );
}
