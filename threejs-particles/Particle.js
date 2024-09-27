export class Particle {
  constructor(timePoints, radius, bounds, color) {
    this.timePoints = timePoints;
    this.bounds = bounds;
    var geometry = new THREE.SphereGeometry(radius, 32, 32); 
    var material = new THREE.MeshBasicMaterial({ color: color }); 
    this.mesh = new THREE.Mesh(geometry, material);
    this.currentTime = 0;
    this.trajectory = new THREE.Line();
    this.trajectoryGeometry = new THREE.BufferGeometry();
    this.trajectoryMaterial = new THREE.LineBasicMaterial({ color: 0x1abc9c });
    this.trajectory.geometry = this.trajectoryGeometry;
    this.trajectory.material = this.trajectoryMaterial;
    this.index = 0;

    if (timePoints.length > 0) {
      this.mesh.position.copy(timePoints[0].coord);
      this.trajectoryGeometry.setFromPoints([timePoints[0].coord]); 
    }
  }

  update(deltaTime, voxelManager) {
    this.currentTime += deltaTime;

    for (let i = 0; i < this.timePoints.length - 1; i++) {
      if (
        this.currentTime >= this.timePoints[i].time &&
        this.currentTime < this.timePoints[i + 1].time
      ) {
        let factor =
          (this.currentTime - this.timePoints[i].time) /
          (this.timePoints[i + 1].time - this.timePoints[i].time);

        let newPosition = new THREE.Vector3();
        newPosition.lerpVectors(
          this.timePoints[i].coord,
          this.timePoints[i + 1].coord,
          factor
        );
        this.mesh.position.copy(newPosition);

        const { minX, maxX, minY, maxY, minZ, maxZ } = this.bounds;

        let size = maxZ - minZ;
        let sizeY = maxY - minY;

        let numSize = Math.ceil(size / 200);
        let numSizeY = Math.ceil(sizeY / 200);

        let newIndex =
          Math.floor(Math.abs(newPosition.z / 200 - minZ / 200)) +
          Math.floor(Math.abs(newPosition.y / 200 - minY / 200)) * numSize +
          Math.floor(Math.abs(newPosition.x / 200 - minX / 200)) *
            numSize *
            numSizeY;

        if (newIndex !== this.index) {
          voxelManager.particleLeftVoxel(this.index);
          voxelManager.particleEnteredVoxel(newIndex);
          this.index = newIndex;
        }

        let positions = [];
        for (let j = 0; j <= i; j++) {
          let coord = this.timePoints[j].coord;
          positions.push(coord.x, coord.y, coord.z);
        }
        positions.push(newPosition.x, newPosition.y, newPosition.z);
        this.trajectoryGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(positions, 3)
        );

        if (this.windArrow) {
          let windStart = this.timePoints[i].wind.clone().normalize();
          let windEnd = this.timePoints[i + 1].wind.clone().normalize();
          let interpolatedWindDirection = new THREE.Vector3()
            .lerpVectors(windStart, windEnd, factor)
            .normalize();
          this.windArrow.position.copy(newPosition);
          this.windArrow.setDirection(interpolatedWindDirection);
        }

        if (this.currentArrow) {
          let currentStart = this.timePoints[i].current.clone().normalize();
          let currentEnd = this.timePoints[i + 1].current.clone().normalize();
          let interpolatedCurrentDirection = new THREE.Vector3()
            .lerpVectors(currentStart, currentEnd, factor)
            .normalize();
          this.currentArrow.position.copy(newPosition);
          this.currentArrow.setDirection(interpolatedCurrentDirection);
        }
      }
    }
  }

  updateColor(color) {
    this.mesh.material.color.set(color);
  }

  addArrows(scene) {
    const currentWind = this.timePoints[0].wind;
    const currentCurrent = this.timePoints[0].current;

    this.windArrow = new THREE.ArrowHelper(
      currentWind.clone().normalize(),
      this.mesh.position,
      currentWind.length(),
      0xff0000
    );
    this.currentArrow = new THREE.ArrowHelper(
      currentCurrent.clone().normalize(),
      this.mesh.position,
      currentCurrent.length(),
      0x0000ff
    );
    scene.add(this.windArrow);
    scene.add(this.currentArrow);
    scene.add(this.trajectory);
  }
}