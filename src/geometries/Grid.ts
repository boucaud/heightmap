import { PlaneGeometry } from "three";

export class Grid extends PlaneGeometry {
  constructor(resolution: number, width = 32, height = 32) {
    super(width, height, resolution, resolution);
  }
}
