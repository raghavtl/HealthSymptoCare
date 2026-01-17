// Nominatim (OpenStreetMap) geocoding service
class NominatimService {
  constructor() {
    this.baseUrl = 'https://nominatim.openstreetmap.org';
  }

  // Geocode an address to get coordinates using Nominatim
  async geocodeAddress(address) {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          formattedAddress: result.display_name
        };
      } else {
        // Fallback to our predefined cities
        return this.fallbackGeocode(address);
      }
    } catch (error) {
      console.error('Nominatim geocoding error:', error);
      // Fallback to our predefined cities
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
      'jaipur': { lat: 26.9124, lng: 75.7873 },
      'lucknow': { lat: 26.8467, lng: 80.9462 },
      'kanpur': { lat: 26.4499, lng: 80.3319 },
      'nagpur': { lat: 21.1458, lng: 79.0882 },
      'indore': { lat: 22.7196, lng: 75.8577 },
      'thane': { lat: 19.2183, lng: 72.9781 },
      'bhopal': { lat: 23.2599, lng: 77.4126 },
      'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
      'patna': { lat: 25.5941, lng: 85.1376 },
      'vadodara': { lat: 22.3072, lng: 73.1812 },
      'ghaziabad': { lat: 28.6692, lng: 77.4538 }
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
}

export default new NominatimService();
