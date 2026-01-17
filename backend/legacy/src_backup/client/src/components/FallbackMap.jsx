import React from 'react';

const FallbackMap = ({ 
  center, 
  hospitals, 
  onHospitalClick, 
  userLocation,
  onMapLoad 
}) => {
  // Generate static map URL using OpenStreetMap
  const getStaticMapUrl = () => {
    if (!center) return '';
    
    const width = 800;
    const height = 400;
    const zoom = 12;
    
    // Create a simple static map URL
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${center.lat},${center.lng}&zoom=${zoom}&size=${width}x${height}&markers=${center.lat},${center.lng},red`;
  };

  return (
    <div className="relative">
      {/* Static Map Background */}
      <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
        {center && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Interactive Map</h3>
              <p className="text-gray-600 mb-4">
                Location: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
              </p>
              <p className="text-sm text-gray-500">
                {hospitals.length} hospitals found in this area
              </p>
            </div>
          </div>
        )}
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
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500 text-xs">★</span>
                    <span className="text-xs text-gray-600">{hospital.rating}</span>
                    {hospital.emergency && (
                      <span className="text-xs bg-red-100 text-red-800 px-1 rounded">🚨</span>
                    )}
                    {hospital.open_now && (
                      <span className="text-xs bg-green-100 text-green-800 px-1 rounded">🟢</span>
                    )}
                  </div>
                </div>
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
              {center?.lat?.toFixed(4) || '0.0000'}, {center?.lng?.toFixed(4) || '0.0000'}
            </p>
          </div>
        </div>
      </div>

      {/* Map Features Info */}
      <div className="absolute bottom-4 right-4 bg-blue-50 rounded-lg p-3 max-w-xs">
        <h4 className="font-medium text-blue-900 mb-1">Map Features</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p>• Click hospital cards for details</p>
          <p>• Emergency hospitals marked with 🚨</p>
          <p>• Distance calculated from your location</p>
          <p>• Ratings and contact info available</p>
        </div>
      </div>
    </div>
  );
};

export default FallbackMap;
