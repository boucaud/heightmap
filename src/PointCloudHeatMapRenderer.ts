import {
  LinearFilter,
  OrthographicCamera,
  Points,
  Scene,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { PinCloud } from "./geometries/PinCloud";
import eventGroups from "../assets/position_events.json";
import { PointCloudHeatMapMaterial } from "./materials/PointCloudHeatMapMaterial";
import { textures } from "./TextureManager";

export class HeatMapRenderer {
  scene: Scene;
  pointCloud: PinCloud;
  material: PointCloudHeatMapMaterial;
  camera: OrthographicCamera;
  points: Points;
  renderer: WebGLRenderer;
  renderTarget: WebGLRenderTarget;

  constructor(renderer: WebGLRenderer) {
    this.scene = new Scene();
    this.pointCloud = new PinCloud(eventGroups.flat(1));
    this.material = new PointCloudHeatMapMaterial();
    this.camera = new OrthographicCamera(-50, 50, -50, 50, 0.1, 100);
    this.points = new Points(this.pointCloud, this.material);
    this.scene.add(this.points);
    this.renderer = renderer;
    this.renderTarget = new WebGLRenderTarget(1024, 1024, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
    });
    textures.heatMapTexture = this.renderTarget.texture;
  }

  drawHeatMapTexture() {
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
  }
}
