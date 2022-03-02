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

/**
 * Renders the events as a 2D point cloud to an off-sceen texture using the heatmap material
 */
export class HeatMapRenderer {
  private scene: Scene;
  private pointCloud: PinCloud;
  private material: PointCloudHeatMapMaterial;
  private camera: OrthographicCamera;
  private points: Points;
  private renderer: WebGLRenderer;
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
  }

  drawHeatMapTexture() {
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
  }
}
