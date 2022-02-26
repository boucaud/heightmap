import { Object3D, Mesh, WireframeGeometry, LineSegments } from "three";

import { HeightMapMaterial } from "../materials/HeightMapMaterial";
import { Grid } from "../geometries/Grid";

export class Map extends Object3D {
  constructor() {
    super();
    const grid = new Grid(255);
    this.add(new Mesh(grid, new HeightMapMaterial()));
    // this.add(new LineSegments(new WireframeGeometry(grid)));
  }
}
