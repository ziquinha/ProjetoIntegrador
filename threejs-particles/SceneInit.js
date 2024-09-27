import { OrbitControls } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js";
import { VoxelManager } from "./VoxelManager.js";
import * as dat from "https://cdn.skypack.dev/dat.gui";

export class SceneInit {
  constructor(bounds) {
    this.scene = new THREE.Scene();

    const { minX, maxX, minY, maxY, minZ, maxZ } = bounds;

    const gui = new dat.GUI();

    this.settings = {
      showAxes: false,
      voxelsVisible: false, 
      voxelTransparency: 1.0, 
      particlesVisible: true,
      trajectoryVisible: true,
      windArrowVisible: true,
      currentArrowVisible: true,
      wireframeVisible: true,
      particleRadius: 0.5,
      particleColor: "#000000",
      voxelWireframe: true, 
    };

    gui.add(this.settings, "showAxes").name("Show Axes").onChange((visible) => {this.axesHelper.visible = visible;});

    gui.add(this.settings, "voxelsVisible").name("Show Voxels").onChange((visible) => {
        this.updateVoxelsVisibillity(visible);
      });

    gui.add(this.settings, "particlesVisible").name("Show Particles").onChange((visible) => {
        this.updateParticleVisibility(visible);
      });

    gui.add(this.settings, "trajectoryVisible").name("Show Particle Trajectory").onChange((visible) => {this.updateTrajectory(visible);});
    gui.add(this.settings, "windArrowVisible").name("Show Wind Arrow").onChange((visible) => {this.updateArrowWind(visible);});
    gui.add(this.settings, "voxelTransparency", 0.0, 1.0, 0.1).name("Transparency").onChange((value) => {this.voxelManager.updateTransparency(value);});
    gui.add(this.settings, "currentArrowVisible").name("Show Current Arrow").onChange((visible) => {this.updateArrowCurrent(visible);});
    gui.addColor(this.settings, "particleColor").name("Particle Color").onChange((color) => {this.updateParticleColor(color);});
    gui.add(this.settings, "voxelWireframe").name("Wireframe Mode").onChange((isWireframe) => {this.voxelManager.setWireframeMode(isWireframe);});

    gui.add(this.settings, "particleRadius", 0.1, 5.0, 0.1).name("Particle Radius").onChange((value) => {this.updateParticleRadius(value);});

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.scene.background = new THREE.Color(0xffffff);

    const aspectRatio = window.innerWidth / window.innerHeight;
      const frustumSize = 1000;
      const frustumHalfSize = frustumSize / 2;
      this.camera = new THREE.OrthographicCamera(
      -frustumHalfSize * aspectRatio,
      frustumHalfSize * aspectRatio,
      frustumHalfSize,
      -frustumHalfSize,
      1,
      20000
    );

    this.camera.position.set(0, 1000, 0);  
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.axesHelper = new THREE.AxesHelper(500);
    this.scene.add(this.axesHelper);
    this.axesHelper.visible = this.settings.showAxes;

    this.voxelManager = new VoxelManager(this.scene, bounds, 200);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.particles = [];
    this.clock = new THREE.Clock();
    this.lastTime = 0;

    this.updateVoxelsVisibillity(this.settings.voxelsVisible);
  }

  updateParticleRadius(radius) {
    this.particles.forEach((particle) => {
      particle.mesh.scale.set(radius, radius, radius);
    });
  }

  updateTrajectory(visible) {
    this.particles.forEach((particle) => {
      particle.trajectory.visible = visible;
    });
  }

  updateArrowWind(visible) {
    this.particles.forEach((particle) => {
      if (particle.windArrow) {
        particle.windArrow.visible = visible;
      }
    });
  }

  updateArrowCurrent(visible) {
    this.particles.forEach((particle) => {
      if (particle.currentArrow) {
        particle.currentArrow.visible = visible;
      }
    });
  }

  updateParticleVisibility(visible) {
    this.particles.forEach((particle) => {
      particle.mesh.visible = visible;
    });
  }

  updateVoxelsVisibillity(visible) {
    this.voxelManager.updateVoxelsVisibillity(visible);
  }

  updateParticleColor(color) {
    this.particles.forEach((particle) => {
      particle.updateColor(color);
    });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    let deltaTime = this.clock.getDelta();
    let currentTime = this.lastTime + deltaTime;

    this.voxelManager.actualCounts.fill(0);

    this.particles.forEach((particle, index) => {
        if (currentTime >= particle.startTime && currentTime <= particle.endTime) {
            particle.update(deltaTime, this.voxelManager);
            this.voxelManager.actualCounts[particle.index] += 1;
        } else if (currentTime > particle.endTime) {
            this.scene.remove(particle.mesh);
            this.particles.splice(index, 1);
            this.voxelManager.actualCounts[particle.index] = 0;
        }
    });

    this.voxelManager.updateVoxels();
    this.renderer.render(this.scene, this.camera);
    this.lastTime = currentTime;
  }

  addParticle(particle, startTime, endTime) {
    particle.startTime = startTime;
    particle.endTime = endTime;
    this.scene.add(particle.mesh);
    this.particles.push(particle);
  }
}