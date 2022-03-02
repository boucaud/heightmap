import { Scene, PerspectiveCamera, WebGLRenderer, Color } from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { Map } from "./entities/Map";
import { Markers } from "./entities/Markers";

import { MainWidget } from "./controls/MainWidget";
import { userParameters } from "./models/parameters";

import { HeatMapRenderer } from "./PointCloudHeatMapRenderer";
import { textures } from "./TextureManager";

/**
 * This class is responsible for creating and managing the scene
 */
export class SceneManager {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private orbitControls: OrbitControls;

  private canvas: HTMLCanvasElement;

  private width: number;
  private height: number;
  private widget: MainWidget;

  private heatMapRenderer: HeatMapRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.widget = new MainWidget();
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = this.buildScene();
    this.camera = this.buildCamera();
    this.renderer = this.buildRenderer();
    this.orbitControls = this.buildControls();
    this.heatMapRenderer = this.buildHeatMapRenderer();

    this.buildEntities();
    userParameters.subscribe(() => this.update());
  }

  buildHeatMapRenderer() {
    const heatMapRenderer = new HeatMapRenderer(this.renderer);
    textures.heatMapTexture = heatMapRenderer.renderTarget.texture;
    return heatMapRenderer;
  }

  buildScene() {
    const scene = new Scene();
    scene.background = new Color(0x555555);
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
    camera.position.y = -16;
    camera.position.z = 16;
    return camera;
  }

  buildEntities() {
    const map = new Map();
    map.renderOrder = 0;
    this.scene.add(map);

    // Clear depth after rendering the map
    // Because markers have to stay on top
    map.mesh.onAfterRender = (renderer) => {
      renderer.clearDepth();
    };

    const markers = new Markers();
    this.scene.add(markers);
    markers.renderOrder = 1;
  }

  buildControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Limit the ability to look below the map
    controls.maxAzimuthAngle = Math.PI / 2;
    controls.minAzimuthAngle = -Math.PI / 2;

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

  /**
   * Draws the scene and the heatmap
   */
  update() {
    this.heatMapRenderer.drawHeatMapTexture();
    this.renderer.render(this.scene, this.camera);
  }
}
