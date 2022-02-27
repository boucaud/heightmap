import { Scene, PerspectiveCamera, WebGLRenderer, Color } from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { Map } from "./entities/Map";
import { Markers } from "./entities/Markers";

import { MainWidget } from "./controls/gui";
import { userParameters } from "./models/parameters";

export class SceneManager {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private orbitControls: OrbitControls;

  private canvas: HTMLCanvasElement;

  private width: number;
  private height: number;
  private widget: MainWidget;

  constructor(canvas: HTMLCanvasElement) {
    this.widget = new MainWidget();
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = this.buildScene();
    this.camera = this.buildCamera();
    this.renderer = this.buildRenderer();
    this.orbitControls = this.buildControls();
    this.buildEntities();
    userParameters.subscribe(() => this.update());
  }

  buildScene() {
    const scene = new Scene();
    scene.background = new Color(0x000055);
    return scene;
  }

  buildRenderer() {
    const renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(this.width, this.height);
    return renderer;
  }

  buildCamera(): PerspectiveCamera {
    const camera = new PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      1000
    );
    camera.position.z = 5;
    camera.rotateZ(Math.PI / 2);
    return camera;
  }

  buildEntities() {
    const map = new Map();
    this.scene.add(map);

    const markers = new Markers();
    this.scene.add(markers);
  }

  buildControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.addEventListener("change", () => this.update());
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
