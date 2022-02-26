import { PlaneGeometry } from "three";

export class Grid extends PlaneGeometry {
  constructor(resolution: number, width: number = 32, height: number = 32) {
    super(width, height, resolution, resolution);
  }
}
