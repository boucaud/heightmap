import { PlaneGeometry, MeshBasicMaterial, DoubleSide, Mesh } from "three";

// TODO: check center
export function createGridMesh(
  width: number,
  height: number,
  resolution: number
) {
  const geometry = new PlaneGeometry(width, height, resolution, resolution);
  // TODO: separate
  const material = new MeshBasicMaterial( { color: 0xFF0000, side: DoubleSide });
  return new Mesh(geometry, material);

}
