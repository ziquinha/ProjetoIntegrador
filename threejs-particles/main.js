import { loadCoordinates } from "./dataLoader.js";
import { SceneInit } from "./SceneInit.js";
import { TimePoint } from "./TimePoint.js";
import { Particle } from "./Particle.js";
import MaxMin from "./MaxMin.js";


document.addEventListener("DOMContentLoaded", async () => {
  const particleFiles = [
    "Particles_Data/dados_particula1.json",
    "Particles_Data/dados_particula2.json",
    "Particles_Data/dados_particula3.json",
    "Particles_Data/dados_particula4.json",
    "Particles_Data/dados_particula5.json",
    "Particles_Data/dados_particula6.json",
    "Particles_Data/dados_particula7.json",
    "Particles_Data/dados_particula8.json",
    "Particles_Data/dados_particula9.json",
    "Particles_Data/dados_particula10.json"
  ];

  const bounds = await MaxMin();

  let init = new SceneInit(bounds); // Cria nova cena
  const timeRange = 20; // Tempo de animação das partículas

  for (const file of particleFiles) {
    const allCoordinates = await loadCoordinates(file);

    const numTimePoints = allCoordinates.length;
    const startTime = 0;
    const endTime = 50;
    const timePoints = [];

    for (let j = 0; j < numTimePoints; j++) {
      const time =
        startTime + (endTime - startTime) * (j / (numTimePoints - 1));
      const coord = new THREE.Vector3(
        allCoordinates[j].coordinates[0],
        allCoordinates[j].coordinates[1],
        allCoordinates[j].coordinates[2]
      );
      const wind = new THREE.Vector3(
        Math.random(),
        Math.random(),
        Math.random()
      );
      const current = new THREE.Vector3(
        Math.random(),
        Math.random(),
        Math.random()
      );
      timePoints.push(new TimePoint(time, coord, wind, current));
    }

    const radius = 5;
    const color = init.settings.particleColor; 
    let particle = new Particle(timePoints, radius, bounds, color);
    init.addParticle(particle, startTime, endTime);
    particle.addArrows(init.scene);
  }

  init.animate();

  // Print counts
  setInterval(() => {
    init.voxelManager.printCounts();
  }, 5000); // Print counts every 5 seconds
});