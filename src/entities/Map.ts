import { Object3D, Mesh } from "three";

import { HeightMapMaterial } from "../materials/HeightMapMaterial";
import { Grid } from "../geometries/Grid";
import { userParameters } from "../models/parameters";

export class Map extends Object3D {
  grid: Grid;
  material: HeightMapMaterial;
  mapResolution: number;
  mesh: Mesh;

  constructor() {
    super();
    this.grid = new Grid(userParameters.mapResolution);
    this.material = new HeightMapMaterial();
    this.mesh = new Mesh(this.grid, this.material);
    this.add(this.mesh);
    this.mapResolution = userParameters.mapResolution;
    userParameters.subscribe(() => this.update());
  }

  // TODO: throttle
  update() {
    // Replace the grid if resolution changed
    if (this.mapResolution != userParameters.mapResolution) {
      this.remove(this.mesh);
      this.grid = new Grid(userParameters.mapResolution);
      this.mesh = new Mesh(this.grid, this.material);
      this.mapResolution = userParameters.mapResolution;
      this.add(this.mesh);
    }
  }
}
