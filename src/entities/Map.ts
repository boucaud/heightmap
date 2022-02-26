import { Object3D, Mesh } from "three";

import { HeightMapMaterial } from "../materials/HeightMapMaterial";
import { Grid } from "../geometries/Grid";

export class Map extends Object3D {
  constructor() {
    super();
    this.add(new Mesh(new Grid(64), new HeightMapMaterial()));
  }
}
