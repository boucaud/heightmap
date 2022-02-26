import { Object3D, InstancedMesh, StaticDrawUsage } from "three";
import { Lut } from "three/examples/jsm/math/Lut";

import { PinQuad } from "../geometries/PinQuad";
import { AxisAlignedBillboardMaterial } from "../materials/AxisAlignedBillboardMaterial";

// TODO: alias not working
import eventGroups from "../../assets/position_events.json";

interface IEvent {
  x: number;
  y: number;
  t: number;
}
console.log("eventGroups ", eventGroups);
export class Markers extends Object3D {
  constructor() {
    super();

    const pinScale = 0.1;

    // Testing non instanced with one group
    const quad = new PinQuad(pinScale, 1.0, 1.0);
    quad.computeVertexNormals();
    const dummy = new Object3D();

    // Lookup-table to get consistent colors for each group
    const lut = new Lut("rainbow", eventGroups.length);

    // For each group, create a new instanced mesh with a specific color for each
    eventGroups.forEach((events: IEvent[], groupIndex) => {
      const mesh = new InstancedMesh(
        quad,
        new AxisAlignedBillboardMaterial(
          lut.getColor(groupIndex / eventGroups.length),
          pinScale
        ),
        events.length
      );
      mesh.instanceMatrix.setUsage(StaticDrawUsage);
      events.forEach((event: IEvent, index) => {
        // Compute the matrix for this instance
        dummy.position.set(event.x, event.y, 0);
        dummy.rotation.x = Math.PI / 2;
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      this.add(mesh);
    });
  }
}
