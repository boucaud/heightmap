import { PlaneGeometry } from "three";

export class PinQuad extends PlaneGeometry {
  constructor(width = 2, height = 2) {
    super(width, height, 1, 1);
    this.scale(0.1, 0.1, 0.1);
  }
}
