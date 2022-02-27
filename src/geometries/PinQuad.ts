import { PlaneGeometry } from "three";

export class PinQuad extends PlaneGeometry {
  constructor(scale: number) {
    super(1, 1, 1, 1);
    this.translate(0, 0.5, 0);
    this.scale(scale, scale, scale);
    this.computeBoundingBox();
  }
}
