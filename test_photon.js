
async function testPhoton(query) {
    // Bias towards Davao (approximate)
    const lat = 7.190;
    const lon = 125.452;
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&limit=5`;
    console.log(`Querying Photon: ${query}`);
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(`Results:`, data.features.length);
        if (data.features.length > 0) {
            const props = data.features[0].properties;
            console.log('Top result:', props.name, props.street, props.city, props.country);
            console.log('Lat/Lon:', data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]);
        } else {
            console.log('No results found.');
        }
        console.log('---');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function runTests() {
    await testPhoton('Vallafuarte'); // Typo
    await testPhoton('Villafuerte'); // Correct
    await testPhoton('Calinan District');
}

runTests();
