export class VoxelManager {
  constructor(scene, bounds, voxelSize) {
    this.scene = scene;
    this.bounds = bounds;
    this.voxelSize = voxelSize;
    this.voxelMesh = null;

    const { minX, maxX, minY, maxY, minZ, maxZ } = this.bounds;
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
    this.minZ = minZ;
    this.maxZ = maxZ;

    this.width = this.maxX - this.minX;
    this.height = this.maxY - this.minY;
    this.depth = this.maxZ - this.minZ;

    this.numX = Math.ceil(this.width / this.voxelSize);
    this.numY = Math.ceil(this.height / this.voxelSize);
    this.numZ = Math.ceil(this.depth / this.voxelSize);

    this.count = this.numX * this.numY * this.numZ;

    this.accumulatedCounts = new Array(this.count).fill(0);
    this.actualCounts = new Array(this.count).fill(0);

    this.createVoxels();
  }

  createVoxels() {
    const voxelGeometry = new THREE.BoxGeometry(
      this.voxelSize,
      this.voxelSize,
      this.voxelSize
    );
    this.voxelMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      transparent: true,
      opacity: 1.0,
    });
    this.voxelMesh = new THREE.InstancedMesh(
      voxelGeometry,
      this.voxelMaterial,
      this.count
    );

    let i = 0;
    const dummy = new THREE.Object3D();
    for (let x = 0; x < this.numX; x++) {
      for (let y = 0; y < this.numY; y++) {
        for (let z = 0; z < this.numZ; z++) {
          dummy.position.set(
            this.minX + x * this.voxelSize + this.voxelSize / 2,
            this.minY + y * this.voxelSize + this.voxelSize / 2,
            this.minZ + z * this.voxelSize + this.voxelSize / 2
          );
          dummy.updateMatrix();

          this.voxelMesh.setMatrixAt(i++, dummy.matrix);
        }
      }
    }

    this.scene.add(this.voxelMesh);
  }

  updateVoxels() {
    const activeVoxels = [];

    for (let i = 0; i < this.count; i++) {
      if (this.actualCounts[i] > 0) {
        activeVoxels.push(i);
      }
    }

    const dummy = new THREE.Object3D();
    const matrix = new THREE.Matrix4();

    for (let i = 0; i < activeVoxels.length; i++) {
      const index = activeVoxels[i];
      this.voxelMesh.getMatrixAt(index, matrix);
      matrix.decompose(dummy.position, dummy.rotation, dummy.scale);
      dummy.updateMatrix();
      this.voxelMesh.setMatrixAt(i, dummy.matrix);
    }

    this.voxelMesh.count = activeVoxels.length;
    this.voxelMesh.instanceMatrix.needsUpdate = true;
  }

  toggleVoxels(visible) {
    if (this.voxelMesh) {
      this.voxelMesh.material.opacity = visible ? 1.0 : 0.005; 
      this.voxelMesh.material.needsUpdate = true; 
    }
  }

  updateVoxelsVisibillity(visible) {
    if (this.voxelMesh) {
      this.voxelMesh.visible = visible;
    }
  }

  updateTransparency(opacity) {
    if (this.voxelMesh) {
      this.voxelMesh.material.opacity = opacity;
      this.voxelMesh.material.needsUpdate = true;
    }
  }

  setWireframeMode(isWireframe) {
    if (this.voxelMesh) {
      this.voxelMesh.material.wireframe = isWireframe;
      this.voxelMesh.material.needsUpdate = true;
    }
  }

  particleEnteredVoxel(voxelIndex) {
    this.accumulatedCounts[voxelIndex]++;
    this.actualCounts[voxelIndex]++;
  }

  particleLeftVoxel(voxelIndex) {
    this.actualCounts[voxelIndex]--;
  }

  getAccumulatedCount(voxelIndex) {
    return this.accumulatedCounts[voxelIndex];
  }

  getActualCount(voxelIndex) {
    return this.actualCounts[voxelIndex];
  }

  printCounts() {
    console.log('Accumulated Counts:', this.accumulatedCounts);
    console.log('Actual Counts:', this.actualCounts);
  }
}