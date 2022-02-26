import { PlaneGeometry } from "three";

export class PinQuad extends PlaneGeometry {
  constructor(scale: number, width = 2, height = 2) {
    super(width, height, 1, 1);
    this.scale(scale, scale, scale);
  }
}
