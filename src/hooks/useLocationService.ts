import { useState, useCallback, useEffect } from 'react';

// Restaurant location: Calinan District Center
const RESTAURANT_LOCATION = {
  lat: 7.1902484, // Calinan District Center
  lng: 125.4524905 // Calinan District Center
};

// Delivery center: Calinan District, Davao City
// This is the point from which delivery distance is calculated
const DELIVERY_CENTER = {
  lat: 7.1902484, // Calinan District Center
  lng: 125.4524905, // Calinan District Center
  address: 'Calinan District, Davao City, Davao del Sur'
};

// Maximum delivery radius in kilometers from delivery center (adjust as needed)
const MAX_DELIVERY_RADIUS_KM = 100;

interface DistanceResult {
  distance: number; // in kilometers
  duration?: string;
}

export const useLocationService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Use delivery center coordinates (will be geocoded, but start with default)
  const [deliveryCenterCoords, setDeliveryCenterCoords] = useState<{ lat: number; lng: number }>({
    lat: DELIVERY_CENTER.lat,
    lng: DELIVERY_CENTER.lng
  });

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

  // Viewbox for Davao City/Calinan area to bias search results
  // Format: min_lon,min_lat,max_lon,max_lat (approximate bounding box for Davao)
  const VIEWBOX = '125.30,7.00,125.70,7.60';

  // Get coordinates from address using OpenStreetMap Nominatim (FREE, no API key needed)
  const geocodeAddressOSM = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Helper function to fetch coordinates
      const fetchCoords = async (query: string) => {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=ph&viewbox=${VIEWBOX}&bounded=1`
        );
        
        if (!response.ok) return null;
        
        const data = await response.json();
        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          };
        }
        return null;
      };

      // 1. Try exact address as typed by user (best for specific places like "Lagazo Village")
      let coords = await fetchCoords(address);
      if (coords) return coords;

      // 2. Try with "Calinan, Davao City" appended (since this is the main service area)
      if (!address.toLowerCase().includes('calinan')) {
        coords = await fetchCoords(`${address}, Calinan, Davao City`);
        if (coords) return coords;
      }

      // 3. Try with "Davao City, Philippines" appended (broader context)
      const fullAddress = address.includes('Davao') || address.includes('Philippines') 
        ? address 
        : `${address}, Davao City, Philippines`;
      
      coords = await fetchCoords(fullAddress);
      if (coords) return coords;

      // 4. Fallback: If address contains "Calinan", try "Calinan District, Davao City"
      if (address.toLowerCase().includes('calinan')) {
        console.log('Exact address not found, trying Calinan District fallback...');
        coords = await fetchCoords('Calinan District, Davao City, Philippines');
        if (coords) return coords;
      }

      // 5. Fallback: Try just "Davao City" as a last resort to at least show map
      // (Only if the address looks like it might be in Davao or is a short landmark name)
      const lowerAddress = address.toLowerCase();
      const isLocalContext = lowerAddress.includes('davao') || lowerAddress.includes('calinan');
      const isShortAddress = address.length < 25; // Heuristic for landmarks
      const hasOtherLocation = lowerAddress.includes('cavite') || lowerAddress.includes('manila') || lowerAddress.includes('cebu') || lowerAddress.includes('quezon') || lowerAddress.includes('luzon') || lowerAddress.includes('visayas');

      if ((isLocalContext || isShortAddress) && !hasOtherLocation) {
         console.log('Address not found, trying Davao City fallback...');
         coords = await fetchCoords('Davao City, Philippines');
         if (coords) return coords;
      }
      
      return null;
    } catch (err) {
      console.error('OpenStreetMap geocoding error:', err);
      return null;
    }
  };

  // Geocode delivery center address on first load
  useEffect(() => {
    const geocodeDeliveryCenter = async () => {
      try {
        const coords = await geocodeAddressOSM(DELIVERY_CENTER.address);
        if (coords) {
          setDeliveryCenterCoords(coords);
          console.log('Delivery center geocoded:', coords);
        }
      } catch (err) {
        console.error('Error geocoding delivery center:', err);
      }
    };
    geocodeDeliveryCenter();
  }, []);

  // Main distance calculation function - calculates from delivery center to customer address
  const calculateDistance = useCallback(async (destinationAddress: string): Promise<DistanceResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Use free OpenStreetMap geocoding + Haversine formula
      const coords = await geocodeAddressOSM(destinationAddress);

      if (coords) {
        // Calculate distance from delivery center to customer address
        const distance = calculateDistanceHaversine(
          deliveryCenterCoords.lat,
          deliveryCenterCoords.lng,
          coords.lat,
          coords.lng
        );
        setLoading(false);
        return {
          distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
        };
      }

      // If geocoding fails
      setError('Could not find the address. Please enter a complete address including barangay and city.');
      setLoading(false);
      return null;
    } catch (err) {
      console.error('Distance calculation error:', err);
      setError('Failed to calculate distance. Please try again.');
      setLoading(false);
      return null;
    }
  }, [deliveryCenterCoords]);

  // Calculate distance between two arbitrary addresses (e.g., Angkas/Padala pickup -> drop-off)
  const calculateDistanceBetweenAddresses = useCallback(
    async (pickupAddress: string, dropoffAddress: string): Promise<DistanceResult | null> => {
      setLoading(true);
      setError(null);

      try {
        // Geocode both addresses and use Haversine
        const pickupCoords = await geocodeAddressOSM(pickupAddress);
        const dropoffCoords = await geocodeAddressOSM(dropoffAddress);

        if (pickupCoords && dropoffCoords) {
          const distance = calculateDistanceHaversine(
            pickupCoords.lat,
            pickupCoords.lng,
            dropoffCoords.lat,
            dropoffCoords.lng
          );

          setLoading(false);
          return {
            distance: Math.round(distance * 10) / 10
          };
        }

        setError('Could not find pickup or drop-off address. Please enter complete addresses.');
        setLoading(false);
        return null;
      } catch (err) {
        console.error('Distance calculation error (pickup->dropoff):', err);
        setError('Failed to calculate distance. Please try again.');
        setLoading(false);
        return null;
      }
    },
    []
  );

  // Calculate delivery fee (shared by Food / Pabili / Padala / Angkas)
  // Tiered delivery fee calculation:
  // - Base fee: ₱65 (0-2km)
  // - > 2km: +₱15
  // - > 3km: +₱25
  // - > 5km: +₱35
  // - > 10km: +₱50
  // - > 25km: +₱60
  // - > 30km: +₱100
  // - > 45km: +₱200
  const calculateDeliveryFee = useCallback((distance: number | null): number => {
    if (distance === null || distance === undefined || isNaN(distance)) {
      return 65; // Base fee if distance cannot be calculated
    }

    const baseFee = 65;
    let surcharge = 0;

    // Tiered surcharges based on distance
    if (distance > 45) {
      surcharge = 200; // Additional 100 on top of 30km rate (100 + 100)
    } else if (distance > 30) {
      surcharge = 100;
    } else if (distance > 25) {
      surcharge = 60;
    } else if (distance > 10) {
      surcharge = 50;
    } else if (distance > 5) {
      surcharge = 35;
    } else if (distance > 3) {
      surcharge = 25;
    } else if (distance > 2) {
      surcharge = 15;
    }
    
    return baseFee + surcharge;
  }, []);

  // Check if customer address is within delivery area (distance from restaurant)
  const isWithinDeliveryArea = useCallback(async (address: string): Promise<{ within: boolean; distance?: number; error?: string }> => {
    try {
      // Get coordinates for the customer's delivery address
      const coords = await geocodeAddressOSM(address);

      if (!coords) {
        return { within: false, error: 'Could not find the address location.' };
      }

      // Calculate distance from delivery center to customer address
      const distanceFromCenter = calculateDistanceHaversine(
        deliveryCenterCoords.lat,
        deliveryCenterCoords.lng,
        coords.lat,
        coords.lng
      );

      const within = distanceFromCenter <= MAX_DELIVERY_RADIUS_KM;
      return { within, distance: Math.round(distanceFromCenter * 10) / 10 };
    } catch (err) {
      console.error('Delivery area check error:', err);
      return { within: false, error: 'Failed to check delivery area.' };
    }
  }, [deliveryCenterCoords]);

  return {
    calculateDistance,
    calculateDistanceBetweenAddresses,
    calculateDeliveryFee,
    isWithinDeliveryArea,
    loading,
    error,
    restaurantLocation: RESTAURANT_LOCATION,
    maxDeliveryRadius: MAX_DELIVERY_RADIUS_KM,
    geocodeAddressOSM // Export this function
  };
};
