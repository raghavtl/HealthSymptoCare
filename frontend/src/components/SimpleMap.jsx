import React, { useState, useEffect } from 'react';

const SimpleMap = ({ 
  center, 
  hospitals, 
  onHospitalClick, 
  userLocation,
  onMapLoad 
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (center) {
      setMapLoaded(true);
      if (onMapLoad) onMapLoad(null);
    }
  }, [center, onMapLoad]);

  if (!center) {
    return (
      <div className="bg-gray-100 h-96 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  // Create OpenStreetMap URL with markers
  const createMapUrl = () => {
    const baseUrl = 'https://www.openstreetmap.org/export/embed.html';
    const params = new URLSearchParams({
      bbox: `${center.lng - 0.01},${center.lat - 0.01},${center.lng + 0.01},${center.lat + 0.01}`,
      layer: 'mapnik',
      marker: `${center.lat},${center.lng}`,
    });

    // Add hospital markers
    hospitals.forEach((hospital, index) => {
      if (hospital.lat && hospital.lng) {
        params.append('marker', `${hospital.lat},${hospital.lng}`);
      }
    });

    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="relative">
      <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
        <iframe
          src={createMapUrl()}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          title="OpenStreetMap"
          onLoad={() => setMapLoaded(true)}
          onError={() => setError('Failed to load the map')}
        />
      </div>
      
      {/* Hospital List Overlay */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs max-h-64 overflow-y-auto">
        <h3 className="font-semibold text-gray-800 mb-2">🏥 Hospitals Nearby</h3>
        <div className="space-y-2">
          {hospitals.slice(0, 5).map((hospital, index) => (
            <div 
              key={hospital.id} 
              className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onHospitalClick && onHospitalClick(hospital)}
            >
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-lg">🏥</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{hospital.name}</p>
                  <p className="text-xs text-gray-600">{hospital.distance}</p>
                </div>
                {hospital.emergency && (
                  <span className="text-xs bg-red-100 text-red-800 px-1 rounded">🚨</span>
                )}
              </div>
            </div>
          ))}
        </div>
        {hospitals.length > 5 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            +{hospitals.length - 5} more hospitals
          </p>
        )}
      </div>

      {/* Location Info */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2">
          <span className="text-blue-500 text-lg">📍</span>
          <div>
            <p className="text-sm font-medium text-gray-900">Current Location</p>
            <p className="text-xs text-gray-600">
              {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
            </p>
          </div>
        </div>
      </div>

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

export default SimpleMap;
