import { GOOGLE_MAPS_CONFIG, isApiKeyConfigured } from '../config/maps';

// Google Places API service for finding hospitals
class PlacesService {
  constructor() {
    this.apiKey = GOOGLE_MAPS_CONFIG.API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  // Geocode an address to get coordinates
  async geocodeAddress(address) {
    // If API key is not configured, use fallback geocoding
    if (!isApiKeyConfigured()) {
      return this.fallbackGeocode(address);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
          formattedAddress: data.results[0].formatted_address
        };
      } else {
        throw new Error('Unable to geocode address');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback to mock geocoding
      return this.fallbackGeocode(address);
    }
  }

  // Fallback geocoding for common cities
  fallbackGeocode(address) {
    const cityCoordinates = {
      'tumkur': { lat: 13.3417, lng: 77.1017 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'delhi': { lat: 28.7041, lng: 77.1025 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 },
      'kolkata': { lat: 22.5726, lng: 88.3639 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'jaipur': { lat: 26.9124, lng: 75.7873 }
    };

    const addressLower = address.toLowerCase().trim();
    
    // Try to find exact match
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (addressLower.includes(city)) {
        return {
          lat: coords.lat,
          lng: coords.lng,
          formattedAddress: `${city.charAt(0).toUpperCase() + city.slice(1)}, India`
        };
      }
    }

    // Default to Bangalore if no match found
    return {
      lat: 12.9716,
      lng: 77.5946,
      formattedAddress: 'Bangalore, India'
    };
  }

  // Find hospitals near a location using Places API
  async findNearbyHospitals(lat, lng, radius = 5000) {
    // If API key is not configured, use fallback data
    if (!isApiKeyConfigured()) {
      return this.getFallbackHospitals(lat, lng);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=hospital&key=${this.apiKey}`
      );
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.results.map(place => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          rating: place.rating || 0,
          user_ratings_total: place.user_ratings_total || 0,
          emergency: this.isEmergencyHospital(place.name, place.types),
          phone: place.formatted_phone_number || 'Not available',
          website: place.website || null,
          open_now: place.opening_hours?.open_now || false,
          distance: this.calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
        }));
      } else {
        throw new Error(`Places API error: ${data.status}`);
      }
    } catch (error) {
      console.error('Places API error:', error);
      // Fallback to mock data
      return this.getFallbackHospitals(lat, lng);
    }
  }

  // Get fallback hospital data
  getFallbackHospitals(lat, lng) {
    const baseHospitals = [
      {
        id: 1,
        name: 'City General Hospital',
        address: 'Main Street, City Center',
        phone: '+91 123-456-7890',
        rating: 4.5,
        emergency: true,
        open_now: true,
        user_ratings_total: 150
      },
      {
        id: 2,
        name: 'Community Medical Center',
        address: 'Oak Avenue, Downtown',
        phone: '+91 987-654-3210',
        rating: 4.2,
        emergency: true,
        open_now: true,
        user_ratings_total: 120
      },
      {
        id: 3,
        name: 'Riverside Clinic',
        address: 'River Road, Suburb',
        phone: '+91 456-789-0123',
        rating: 3.9,
        emergency: false,
        open_now: false,
        user_ratings_total: 85
      },
      {
        id: 4,
        name: 'Sunset Health Center',
        address: 'Sunset Boulevard, West Side',
        phone: '+91 234-567-8901',
        rating: 4.7,
        emergency: false,
        open_now: true,
        user_ratings_total: 200
      },
      {
        id: 5,
        name: 'Metro Emergency Hospital',
        address: 'Metro Parkway, East District',
        phone: '+91 345-678-9012',
        rating: 4.8,
        emergency: true,
        open_now: true,
        user_ratings_total: 300
      }
    ];

    // Add coordinates and distances to hospitals
    return baseHospitals.map((hospital, index) => {
      // Generate coordinates around the given location
      const offsetLat = lat + (Math.random() - 0.5) * 0.01; // ±0.005 degrees
      const offsetLng = lng + (Math.random() - 0.5) * 0.01;
      
      return {
        ...hospital,
        lat: offsetLat,
        lng: offsetLng,
        distance: this.calculateDistance(lat, lng, offsetLat, offsetLng)
      };
    });
  }

  // Get detailed information about a specific place
  async getPlaceDetails(placeId) {
    if (!isApiKeyConfigured()) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating,user_ratings_total,types&key=${this.apiKey}`
      );
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.result;
      } else {
        throw new Error(`Place details error: ${data.status}`);
      }
    } catch (error) {
      console.error('Place details error:', error);
      throw error;
    }
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
    }
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Determine if a hospital has emergency services based on name and types
  isEmergencyHospital(name, types) {
    const emergencyKeywords = ['emergency', 'trauma', 'urgent', 'critical'];
    const emergencyTypes = ['hospital', 'health'];
    
    const nameLower = name.toLowerCase();
    const hasEmergencyKeyword = emergencyKeywords.some(keyword => 
      nameLower.includes(keyword)
    );
    
    const hasEmergencyType = types ? types.some(type => 
      emergencyTypes.includes(type)
    ) : false;
    
    return hasEmergencyKeyword || hasEmergencyType;
  }

  // Get user's current location
  getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }
}

export default new PlacesService();
