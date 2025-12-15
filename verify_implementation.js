
// Mocking the logic from useLocationService.ts for Node.js verification

async function geocodeAddressPhoton(query) {
    try {
      const lat = 7.190;
      const lon = 125.452;
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&limit=3`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const phResult = data.features.find((f) => 
          f.properties.country === 'Philippines' || 
          f.properties.countrycode === 'PH'
        );

        if (phResult) {
          return {
            lat: phResult.geometry.coordinates[1],
            lng: phResult.geometry.coordinates[0],
            source: 'Photon (PH)'
          };
        }
        
        const first = data.features[0];
        const props = first.properties;
        if (props.city === 'Davao City' || props.state === 'Davao Region') {
           return {
            lat: first.geometry.coordinates[1],
            lng: first.geometry.coordinates[0],
            source: 'Photon (Davao)'
          };
        }
      }
      return null;
    } catch (err) {
      console.error('Photon error:', err);
      return null;
    }
}

async function geocodeAddressNominatim(query) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=ph`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          source: 'Nominatim'
        };
      }
      return null;
    } catch (err) {
      console.error('Nominatim error:', err);
      return null;
    }
}

async function geocodeAddress(address) {
    console.log(`\nSearching for: "${address}"`);
    
    // 1. Photon
    let coords = await geocodeAddressPhoton(address);
    if (coords) return coords;
    console.log('  - Photon failed');

    // 2. Photon + Calinan
    if (!address.toLowerCase().includes('calinan')) {
      coords = await geocodeAddressPhoton(`${address}, Calinan`);
      if (coords) return coords;
      console.log('  - Photon (Calinan) failed');
    }

    // 3. Nominatim
    coords = await geocodeAddressNominatim(address);
    if (coords) return coords;
    console.log('  - Nominatim failed');

    // 4. Nominatim + Davao
    const fullAddress = address.includes('Davao') || address.includes('Philippines') 
      ? address 
      : `${address}, Davao City, Philippines`;
    
    coords = await geocodeAddressNominatim(fullAddress);
    if (coords) return coords;
    console.log('  - Nominatim (Davao) failed');

    return null;
}

async function runTests() {
    const tests = [
        'Vallafuarte', // Typo
        'Villafuerte', // Correct
        'Calinan District',
        'Waling Waling St',
        'Unknown Place 12345'
    ];

    for (const test of tests) {
        const result = await geocodeAddress(test);
        if (result) {
            console.log(`  ✅ Found via ${result.source}: ${result.lat}, ${result.lng}`);
        } else {
            console.log(`  ❌ Could not find address`);
        }
    }
}

runTests();
