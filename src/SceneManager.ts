import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  Points,
  WebGLRenderTarget,
  LinearFilter,
  OrthographicCamera,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { Map } from "./entities/Map";
import { Markers } from "./entities/Markers";

import { MainWidget } from "./controls/MainWidget";
import { userParameters } from "./models/parameters";
import { PinCloud } from "./geometries/PinCloud";

import eventGroups from "../assets/position_events.json";
import { PointCloudHeatMapMaterial } from "./materials/PointCloudHeatMapMaterial";
import { textures } from "./TextureManager";

export class SceneManager {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private orbitControls: OrbitControls;

  private canvas: HTMLCanvasElement;

  private width: number;
  private height: number;
  private widget: MainWidget;

  private heatMapTarget: WebGLRenderTarget;

  constructor(canvas: HTMLCanvasElement) {
    this.widget = new MainWidget();
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = this.buildScene();
    this.camera = this.buildCamera();
    this.renderer = this.buildRenderer();
    this.orbitControls = this.buildControls();

    this.heatMapTarget = new WebGLRenderTarget(1024, 1024, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
    });
    textures.heatMapTexture = this.heatMapTarget.texture;
    // TODO: move to a more specific class
    this.drawHeatMapTexture(); // TODO: only draw if parameters changed

    this.buildEntities();
    userParameters.subscribe(() => this.update());
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
    this.drawHeatMapTexture();
    markers.renderOrder = 1;
  }

  drawHeatMapTexture() {
    // TODO: some resources can be reused
    const scene = new Scene();
    const pointCloud = new PinCloud(eventGroups.flat(1));
    const material = new PointCloudHeatMapMaterial();

    const cam = new OrthographicCamera(-50, 50, -50, 50, 0.1, 100);
    const pointsObject = new Points(pointCloud, material);
    scene.add(pointsObject);

    this.renderer.setRenderTarget(this.heatMapTarget);
    this.renderer.render(scene, cam);
    this.renderer.setRenderTarget(null);
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

  update() {
    this.drawHeatMapTexture();
    this.renderer.render(this.scene, this.camera);
  }
}
