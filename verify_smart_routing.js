
// Mock OSRM response with multiple routes
const mockOSRMResponse = {
    routes: [
        {
            distance: 5000,
            duration: 600, // 10 mins
            geometry: { coordinates: [[0,0], [1,1]] }
        },
        {
            distance: 4500,
            duration: 400, // 6.6 mins (Fastest)
            geometry: { coordinates: [[0,0], [0.5,0.5], [1,1]] }
        },
        {
            distance: 6000,
            duration: 800, // 13.3 mins
            geometry: { coordinates: [[0,0], [2,2], [1,1]] }
        }
    ]
};

function selectBestRoute(data) {
    if (data.routes && data.routes.length > 0) {
        // Smart Routing: Select the fastest route (lowest duration)
        const bestRoute = data.routes.sort((a, b) => a.duration - b.duration)[0];
        return bestRoute;
    }
    return null;
}

async function testRealOSRM() {
    // Calinan District Center
    const start = { lat: 7.1902484, lng: 125.4524905 };
    // Some random point nearby
    const end = { lat: 7.185, lng: 125.460 };

    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`;
    console.log(`Testing OSRM Smart Routing URL: ${url}`);

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            console.log(`Routes found: ${data.routes.length}`);
            const best = selectBestRoute(data);
            console.log(`Best route duration: ${best.duration}s`);
            console.log(`Best route distance: ${best.distance}m`);
        } else {
            console.log('OSRM Request failed');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

console.log('Testing Logic with Mock Data:');
const bestMock = selectBestRoute(mockOSRMResponse);
if (bestMock.duration === 400) {
    console.log('✅ Correctly selected the fastest route (400s)');
} else {
    console.log(`❌ Failed: Selected route with duration ${bestMock.duration}s`);
}

console.log('\nTesting Real OSRM API:');
testRealOSRM();
