export async function loadCoordinates(jsonUrl) {
    try {
        const response = await fetch(jsonUrl);
        const data = await response.json();
        const allCoordinates = data.features.map(feature => {
            const [x, z, y] = feature.geometry.coordinates;
            return {
                coordinates: [x, y, z], 
                time: feature.geometry.time,
                velocity: feature.property.velocity_1
            };
        });
        return allCoordinates;
    } catch (error) {
        console.error('Erro ao carregar os dados JSON:', error);
        return []; // Return an empty array in case of error
    }
}



