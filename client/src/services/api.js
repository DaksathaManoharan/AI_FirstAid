const API_BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Attach token from localStorage if it exists
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth APIs
  login: (email, password) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
    
  register: (name, email, password, preferredLanguage) => 
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, preferredLanguage })
    }),
    
  getPreferences: () => 
    request('/auth/preferences'),
    
  updatePreferences: (preferences) => 
    request('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences)
    }),
    
  deleteAccount: () => 
    request('/auth/delete-account', {
      method: 'DELETE'
    }),

  forgotPassword: (email) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  verifyResetCode: (email, code) =>
    request('/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    }),

  resetPassword: (email, tokenOrOtp, newPassword) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, tokenOrOtp, newPassword })
    }),

  // AI assessment APIs
  triage: (description, language) => 
    request('/ai/triage', {
      method: 'POST',
      body: JSON.stringify({ description, language })
    }),
    
  analyzeImage: (image, language) => 
    request('/ai/image-analysis', {
      method: 'POST',
      body: JSON.stringify({ image, language })
    }),

  // Text-To-Speech APIs
  synthesizeTamilSpeech: async (text) => {
    const url = `${API_BASE_URL}/tts/tamil`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    return response.blob();
  },

  // Guides APIs
  getGuides: () => request('/guides'),
  getGuideByType: (type) => request(`/guides/${type}`),

  // Proximity Map Resources APIs
  getNearbyResources: (lat, lng, type) => 
    request(`/resources/nearby?lat=${lat}&lng=${lng}&type=${type}`),
    
  getNearbyAEDs: (lat, lng) => 
    request(`/resources/aed/nearby?lat=${lat}&lng=${lng}`),

  reverseGeocode: (lat, lng) =>
    request(`/resources/reverse-geocode?lat=${lat}&lng=${lng}`),

  searchLocation: (query) =>
    request(`/resources/search-location?q=${encodeURIComponent(query)}`),

  // Poison and Substance Analysis APIs
  searchPoison: (params, ageGroup, exposureRoute) => {
    if (typeof params === 'object') {
      return request('/poison/search', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    }
    return request(`/poison/search?substance=${encodeURIComponent(params)}&ageGroup=${ageGroup || 'Adult'}&exposureRoute=${exposureRoute || 'swallowed'}`);
  },

  analyzeProductLabel: (image) => 
    request('/poison/analyze-label', {
      method: 'POST',
      body: JSON.stringify({ image })
    }),

  // Disaster Preparedness APIs
  getDisasters: () => request('/disasters'),
  getDisasterByType: (type) => request(`/disasters/${type}`),
  
  getChecklist: () => request('/disasters/checklist'),
  
  updateChecklist: (disasterType, item, completed) => 
    request('/disasters/checklist', {
      method: 'POST',
      body: JSON.stringify({ disasterType, item, completed })
    }),

  // History sessions APIs
  getSessions: () => request('/emergency-sessions'),
  
  createSession: (sessionData) => 
    request('/emergency-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    }),
    
  deleteSession: (id) => 
    request(`/emergency-sessions/${id}`, {
      method: 'DELETE'
    }),
    
  clearAllSessions: () => 
    request('/emergency-sessions/clear', {
      method: 'POST'
    })
};

export default api;
