import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const OpenStreetMap = ({ 
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
    if (!mapRef.current || !center) return;
    try {
      // Initialize the map
      const map = L.map(mapRef.current).setView([center.lat, center.lng], 12);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add user location marker
      if (userLocation) {
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div style="
              width: 24px; 
              height: 24px; 
              background: #4285F4; 
              border: 2px solid white; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              <div style="
                width: 8px; 
                height: 8px; 
                background: white; 
                border-radius: 50%;
              "></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const userMarker = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          title: 'Your Location'
        }).addTo(map);

        // Add a popup for user location
        userMarker.bindPopup('<strong>Your Location</strong>');
      }

      setMapLoaded(true);
      if (onMapLoad) onMapLoad(map);

    } catch (err) {
      console.error('Error loading OpenStreetMap:', err);
      setError('Failed to load the map. Please check your internet connection.');
    }
  }, [center, userLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current || !hospitals.length) return;

    // Clear existing hospital markers
    markersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Add hospital markers
    hospitals.forEach((hospital) => {
      if (hospital.lat && hospital.lng) {
        const hospitalIcon = L.divIcon({
          className: 'hospital-marker',
          html: `
            <div style="
              width: 32px; 
              height: 32px; 
              background: #EA4335; 
              border: 2px solid white; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              font-size: 16px;
              color: white;
              font-weight: bold;
            ">🏥</div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([hospital.lat, hospital.lng], {
          icon: hospitalIcon,
          title: hospital.name
        }).addTo(mapInstanceRef.current);

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #333;">${hospital.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${hospital.address}</p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">📞 ${hospital.phone}</p>
            <div style="display: flex; align-items: center; gap: 4px; margin: 4px 0;">
              <span style="color: #FFD700;">★</span>
              <span style="font-size: 12px;">${hospital.rating}</span>
              <span style="color: #999; font-size: 11px;">(${hospital.user_ratings_total || 0})</span>
            </div>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">📍 ${hospital.distance}</p>
            ${hospital.emergency ? '<span style="color: #EA4335; font-size: 12px; font-weight: bold;">🚨 Emergency Services</span>' : ''}
            ${hospital.open_now ? '<span style="color: #4CAF50; font-size: 12px; font-weight: bold;">🟢 Open Now</span>' : ''}
          </div>
        `;

        marker.bindPopup(popupContent);

        // Add click listener
        marker.on('click', () => {
          if (onHospitalClick) {
            onHospitalClick(hospital);
          }
        });

        markersRef.current.push(marker);
      }
    });
  }, [hospitals, onHospitalClick]);

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

export default OpenStreetMap;
