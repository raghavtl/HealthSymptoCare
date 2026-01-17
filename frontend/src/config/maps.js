// Google Maps API Configuration
export const GOOGLE_MAPS_CONFIG = {
  // Use environment variable for API key with fallback
  // Get one from: https://console.cloud.google.com/apis/credentials
  API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
  
  // API endpoints
  GEOCODING_URL: 'https://maps.googleapis.com/maps/api/geocode/json',
  PLACES_URL: 'https://maps.googleapis.com/maps/api/place',
  
  // Default settings
  DEFAULT_ZOOM: 12,
  DEFAULT_RADIUS: 5000, // 5km
  MAX_RADIUS: 50000, // 50km
  
  // Map styles for medical facilities
  MAP_STYLES: [
    {
      featureType: 'poi.medical',
      elementType: 'labels',
      stylers: [{ visibility: 'on' }]
    },
    {
      featureType: 'poi.medical',
      elementType: 'geometry',
      stylers: [{ visibility: 'on' }]
    }
  ]
};

// Helper function to check if API key is configured
export const isApiKeyConfigured = () => {
  return GOOGLE_MAPS_CONFIG.API_KEY && GOOGLE_MAPS_CONFIG.API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';
};

// Helper function to get API key with fallback
export const getApiKey = () => {
  return GOOGLE_MAPS_CONFIG.API_KEY;
};
