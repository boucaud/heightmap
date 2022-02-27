import { Object3D, Mesh } from "three";

import { HeightMapMaterial } from "../materials/HeightMapMaterial";
import { Grid } from "../geometries/Grid";

export class Map extends Object3D {
  constructor() {
    super();
    const grid = new Grid(1280);
    this.add(new Mesh(grid, new HeightMapMaterial()));
    // this.add(new LineSegments(new WireframeGeometry(grid)));
  }
}
