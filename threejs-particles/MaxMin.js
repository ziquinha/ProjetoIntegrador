import { loadCoordinates } from './dataLoader.js';

async function MaxMin(){
    
   
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    const Files = ['Particles_Data/dados_particula1.json','Particles_Data/dados_particula2.json','Particles_Data/dados_particula3.json','Particles_Data/dados_particula4.json'
    ,'Particles_Data/dados_particula5.json','Particles_Data/dados_particula6.json','Particles_Data/dados_particula7.json','Particles_Data/dados_particula8.json','Particles_Data/dados_particula9.json','Particles_Data/dados_particula10.json'];
    for(const file of Files){
        const arrayCoord = await loadCoordinates(file);
        console.log(arrayCoord);
        for (let j = 0; j < arrayCoord.length; j++) {
            const coordinates = arrayCoord[j].coordinates;
            if (minX > coordinates[0]) minX = coordinates[0];
            if (maxX < coordinates[0]) maxX = coordinates[0];
            if (minY > coordinates[1]) minY = coordinates[1];
            if (maxY < coordinates[1]) maxY = coordinates[1];
            if (minZ > coordinates[2]) minZ = coordinates[2];
            if (maxZ < coordinates[2]) maxZ = coordinates[2];
        }
    }
    console.log(minX, maxX, minY, maxY, minZ, maxZ);    
    return { minX, maxX, minY, maxY, minZ, maxZ };
}

export default MaxMin;