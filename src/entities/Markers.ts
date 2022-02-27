import { Object3D, InstancedMesh, StaticDrawUsage } from "three";

import { PinQuad } from "../geometries/PinQuad";
import { AxisAlignedBillboardMaterial } from "../materials/AxisAlignedBillboardMaterial";

// TODO: alias not working
import eventGroups from "../../assets/position_events.json";
import { userParameters } from "../models/parameters";
import { Lut } from "three/examples/jsm/math/Lut";

interface IEvent {
  x: number;
  y: number;
  t: number;
}

export class Markers extends Object3D {
  pinScale = 0.1;
  quad: PinQuad;
  lut: Lut;
  constructor() {
    super();

    this.pinScale = userParameters.markerScale;

    this.quad = new PinQuad(1.0);
    const dummy = new Object3D();

    // Lookup-table to get consistent colors for each group
    this.lut = userParameters.groupLut;

    // For each group, create a new instanced mesh with a specific color for each
    eventGroups.forEach((events: IEvent[], groupIndex) => {
      const mesh = new InstancedMesh(
        this.quad,
        new AxisAlignedBillboardMaterial(
          this.lut.getColor(groupIndex / eventGroups.length)
        ),
        events.length
      );
      mesh.instanceMatrix.setUsage(StaticDrawUsage);
      events.forEach((event: IEvent, index) => {
        // Compute the matrix for this instance
        dummy.scale.set(this.pinScale, this.pinScale, this.pinScale);
        dummy.position.set(event.x, event.y, 0);
        dummy.rotation.x = Math.PI / 2;
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      this.add(mesh);
    });
  }

  update() {
    // TODO: handle pinscale change, lut change
  }
}
