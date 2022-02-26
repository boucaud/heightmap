import {
  MeshBasicMaterial,
  DoubleSide,
} from "three";

export class HeightMapMaterial extends MeshBasicMaterial {
  constructor() {
    super({ color: 0xff0000, side: DoubleSide });
  }
}
