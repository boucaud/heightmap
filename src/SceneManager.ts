import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { createGridMesh } from "./grid";

export class SceneManager {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;

  canvas: HTMLCanvasElement;

  width: number;
  height: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = this.buildScene();
    this.camera = this.buildCamera();
    this.renderer = this.buildRenderer();
    this.controls = this.buildControls();
    this.buildEntities();
  }

  buildScene() {
    const scene = new Scene();
    scene.background = new Color(0x000055);
    return scene;
  }

  buildRenderer() {
    const renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(this.width, this.height);
    return renderer;
  }

  buildCamera() : PerspectiveCamera {
    const camera = new PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      1000
    );
    camera.position.z = 100;
    return camera;
  }

  buildEntities() {
    const mesh = createGridMesh(32, 32, 64);
    this.scene.add(mesh);
  }

  buildControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.addEventListener('change', () => this.update());
    return controls;
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  update() {
    this.renderer.render(this.scene, this.camera);
  }
}