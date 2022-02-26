import { Object3D, InstancedMesh, DynamicDrawUsage } from "three";

import { PinQuad } from "../geometries/PinQuad";
import { AxisAlignedBillboardMaterial } from "../materials/AxisAlignedBillboardMaterial";

// TODO: alias not working
import eventGroups from "../../assets/position_events.json";

console.log("eventGroups ", eventGroups);
export class Markers extends Object3D {
  constructor() {
    super();
    // Testing non instanced with one group
    const events = eventGroups[0].slice(0, 100);
    const quad = new PinQuad();
    quad.computeVertexNormals();
    const mesh = new InstancedMesh(
      quad,
      new AxisAlignedBillboardMaterial(),
      100
    );
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    const dummy = new Object3D();
    events.forEach((event: { x: number; y: number; t: number }, index) => {
      dummy.position.set(event.x, event.y, 0);
      dummy.rotation.x = Math.PI / 2;
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    this.add(mesh);
  }
}
