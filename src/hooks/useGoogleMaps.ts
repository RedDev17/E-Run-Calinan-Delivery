import { useState, useCallback } from 'react';

// Restaurant location: Calinan, Davao City
const RESTAURANT_LOCATION = {
  lat: 7.2906, // Calinan, Davao City latitude
  lng: 125.3764 // Calinan, Davao City longitude
};

// Delivery area center: Villafuerte st, Calinan, Davao City
// Approximate coordinates for Villafuerte st area
const DELIVERY_AREA_CENTER = {
  lat: 7.2906, // Villafuerte st, Calinan, Davao City latitude (approximate)
  lng: 125.3764 // Villafuerte st, Calinan, Davao City longitude (approximate)
};

// Maximum delivery radius in kilometers (adjust as needed)
const MAX_DELIVERY_RADIUS_KM = 100;

interface DistanceResult {
  distance: number; // in kilometers
  duration?: string;
}

export const useGoogleMaps = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate distance using Haversine formula (straight-line distance)
  const calculateDistanceHaversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightLineDistance = R * c;
    
    // Add 20% buffer for road distance (straight-line is usually shorter than actual road distance)
    return straightLineDistance * 1.2;
  };

  // Get coordinates from address using OpenStreetMap Nominatim (FREE, no API key needed)
  const geocodeAddressOSM = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Add "Davao City, Philippines" to improve accuracy for local addresses
      const fullAddress = address.includes('Davao') || address.includes('Philippines') 
        ? address 
        : `${address}, Davao City, Philippines`;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=ph`,
        {
          headers: {
            'User-Agent': 'E-Run-Delivery-App' // Required by Nominatim
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      
      return null;
    } catch (err) {
      console.error('OpenStreetMap geocoding error:', err);
      return null;
    }
  };

  // Alternative: Try Google Maps API if key is provided (optional)
  const geocodeAddressGoogle = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return null;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&region=ph`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      }
      
      return null;
    } catch (err) {
      console.error('Google geocoding error:', err);
      return null;
    }
  };

  // Calculate distance using Google Maps Distance Matrix API (if key is provided)
  const calculateDistanceGoogle = async (destinationAddress: string): Promise<DistanceResult | null> => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return null;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${RESTAURANT_LOCATION.lat},${RESTAURANT_LOCATION.lng}&destinations=${encodeURIComponent(destinationAddress)}&key=${apiKey}&units=metric&region=ph`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
        const element = data.rows[0].elements[0];
        const distanceInKm = element.distance.value / 1000; // Convert meters to kilometers
        const duration = element.duration.text;
        
        return {
          distance: Math.round(distanceInKm * 10) / 10, // Round to 1 decimal place
          duration
        };
      }
    } catch (err) {
      console.warn('Google Maps API error:', err);
    }
    
    return null;
  };

  // Main distance calculation function - uses free services by default
  const calculateDistance = useCallback(async (destinationAddress: string): Promise<DistanceResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Try Google Maps API first if key is available (more accurate road distance)
      const googleResult = await calculateDistanceGoogle(destinationAddress);
      if (googleResult) {
        setLoading(false);
        return googleResult;
      }

      // Fallback: Use free OpenStreetMap geocoding + Haversine formula
      // Try Google geocoding first (if key available), then OSM
      let coords = await geocodeAddressGoogle(destinationAddress);
      if (!coords) {
        coords = await geocodeAddressOSM(destinationAddress);
      }

      if (coords) {
        const distance = calculateDistanceHaversine(
          RESTAURANT_LOCATION.lat,
          RESTAURANT_LOCATION.lng,
          coords.lat,
          coords.lng
        );
        setLoading(false);
        return {
          distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
        };
      }

      // If all geocoding fails
      setError('Could not find the address. Please enter a complete address including barangay and city.');
      setLoading(false);
      return null;
    } catch (err) {
      console.error('Distance calculation error:', err);
      setError('Failed to calculate distance. Please try again.');
      setLoading(false);
      return null;
    }
  }, []);

  // Calculate delivery fee: 60 base + 15 for every 3km (or portion thereof)
  const calculateDeliveryFee = useCallback((distance: number | null): number => {
    if (distance === null || distance === undefined || isNaN(distance)) {
      return 60; // Base fee if distance cannot be calculated
    }
    const baseFee = 60;
    const feePer3Km = 15;
    // For every 3km (or portion), add ₱15
    const kmBlocks = Math.ceil(distance / 3);
    return baseFee + (kmBlocks * feePer3Km);
  }, []);

  // Check if address is within delivery area (near Villafuerte st, Calinan, Davao City)
  const isWithinDeliveryArea = useCallback(async (address: string): Promise<{ within: boolean; distance?: number; error?: string }> => {
    try {
      // Get coordinates for the delivery address
      let coords = await geocodeAddressGoogle(address);
      if (!coords) {
        coords = await geocodeAddressOSM(address);
      }

      if (!coords) {
        return { within: false, error: 'Could not find the address location.' };
      }

      // Calculate distance from delivery area center
      const distanceFromCenter = calculateDistanceHaversine(
        DELIVERY_AREA_CENTER.lat,
        DELIVERY_AREA_CENTER.lng,
        coords.lat,
        coords.lng
      );

      const within = distanceFromCenter <= MAX_DELIVERY_RADIUS_KM;
      return { within, distance: Math.round(distanceFromCenter * 10) / 10 };
    } catch (err) {
      console.error('Delivery area check error:', err);
      return { within: false, error: 'Failed to check delivery area.' };
    }
  }, []);

  return {
    calculateDistance,
    calculateDeliveryFee,
    isWithinDeliveryArea,
    loading,
    error,
    restaurantLocation: RESTAURANT_LOCATION,
    deliveryAreaCenter: DELIVERY_AREA_CENTER,
    maxDeliveryRadius: MAX_DELIVERY_RADIUS_KM
  };
};

