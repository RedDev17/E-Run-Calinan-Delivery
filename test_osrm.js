
async function testOSRM() {
    // Calinan District Center
    const start = { lat: 7.1902484, lng: 125.4524905 };
    // Some random point nearby
    const end = { lat: 7.185, lng: 125.460 };

    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    console.log(`Testing OSRM URL: ${url}`);

    try {
        const response = await fetch(url);
        console.log(`Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log('OSRM Response OK');
            if (data.routes && data.routes.length > 0) {
                console.log(`Distance: ${data.routes[0].distance} meters`);
                console.log(`Duration: ${data.routes[0].duration} seconds`);
                console.log(`Geometry points: ${data.routes[0].geometry.coordinates.length}`);
            } else {
                console.log('No routes found in response');
            }
        } else {
            console.log('OSRM Response not OK');
            console.log(await response.text());
        }
    } catch (error) {
        console.error('Error fetching OSRM:', error);
    }
}

testOSRM();
