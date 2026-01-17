import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_CONFIG, isApiKeyConfigured } from '../config/maps';

const GoogleMap = ({ 
  center, 
  hospitals, 
  onHospitalClick, 
  userLocation,
  onMapLoad 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initMap = async () => {
      // Check if API key is configured
      if (!isApiKeyConfigured()) {
        setError('Google Maps API key not configured');
        return;
      }

      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_CONFIG.API_KEY,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const google = await loader.load();
        
        if (mapRef.current && center) {
          const map = new google.maps.Map(mapRef.current, {
            center: center,
            zoom: GOOGLE_MAPS_CONFIG.DEFAULT_ZOOM,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            styles: GOOGLE_MAPS_CONFIG.MAP_STYLES
          });

          mapInstanceRef.current = map;

          // Add user location marker
          if (userLocation) {
            new google.maps.Marker({
              position: userLocation,
              map: map,
              title: 'Your Location',
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(24, 24),
                anchor: new google.maps.Point(12, 12)
              }
            });
          }

          setMapLoaded(true);
          if (onMapLoad) onMapLoad(map);
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps. Please check your internet connection.');
      }
    };

    if (center) {
      initMap();
    }
  }, [center, userLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current || !hospitals.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add hospital markers
    hospitals.forEach((hospital, index) => {
      if (hospital.lat && hospital.lng) {
        const marker = new window.google.maps.Marker({
          position: { lat: hospital.lat, lng: hospital.lng },
          map: mapInstanceRef.current,
          title: hospital.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="16" fill="#EA4335"/>
                <path d="M16 8L20 12L18 14L16 12L14 14L12 12L16 8Z" fill="white"/>
                <path d="M8 20L12 16L14 18L12 20L14 22L12 24L8 20Z" fill="white"/>
                <path d="M24 20L20 24L18 22L20 20L18 18L20 16L24 20Z" fill="white"/>
                <path d="M16 24L12 20L14 18L16 20L18 18L20 20L16 24Z" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16)
          }
        });

        // Add click listener
        marker.addListener('click', () => {
          if (onHospitalClick) {
            onHospitalClick(hospital);
          }
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold; color: #333;">${hospital.name}</h3>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${hospital.address}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">${hospital.phone}</p>
              ${hospital.emergency ? '<span style="color: #EA4335; font-size: 12px; font-weight: bold;">Emergency Services</span>' : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
      }
    });
  }, [hospitals, onHospitalClick]);

  // Show fallback when API key is not configured
  if (!isApiKeyConfigured()) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
          </svg>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Google Maps Integration</h3>
          <p className="text-blue-700 mb-4">
            To enable real-time hospital search and interactive maps, please configure your Google Maps API key.
          </p>
        </div>
        
        <div className="space-y-3 text-sm text-blue-600">
          <p><strong>Current Location:</strong> {center?.lat?.toFixed(4)}, {center?.lng?.toFixed(4)}</p>
          <p><strong>Hospitals Found:</strong> {hospitals.length}</p>
        </div>
        
        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-medium text-gray-900 mb-2">Setup Instructions:</h4>
          <ol className="text-left text-sm text-gray-600 space-y-1">
            <li>1. Get a Google Maps API key from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
            <li>2. Enable Maps JavaScript API, Places API, and Geocoding API</li>
            <li>3. Update the API key in <code className="bg-gray-100 px-1 rounded">src/config/maps.js</code></li>
            <li>4. Restart the application</li>
          </ol>
        </div>
        
        <div className="mt-4">
          <a 
            href="https://console.cloud.google.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Get API Key
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-red-500 mt-2">
          Please check your internet connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
