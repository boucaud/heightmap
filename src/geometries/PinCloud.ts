import { BufferGeometry, Float32BufferAttribute } from "three";
import { userParameters } from "../models/parameters";

export class PinCloud extends BufferGeometry {
  constructor(events: { x: number; y: number; t: number }[]) {
    super();
    const geometry: Float32Array = new Float32Array(events.length * 3); // TODO: can be optimized
    const times: Float32Array = new Float32Array(events.length);

    const inverted =
      1.0 /
      (userParameters.maxAvailableTimeStamp -
        userParameters.minAvailableTimeStamp);
    events.forEach(({ x, y, t }, index) => {
      geometry[index * 3] = x;
      geometry[index * 3 + 1] = y;
      geometry[index * 3 + 2] = 1;
      // Normalize
      times[index] = (t - userParameters.minAvailableTimeStamp) * inverted;
    });
    this.setAttribute("position", new Float32BufferAttribute(geometry, 3));
    this.setAttribute("time", new Float32BufferAttribute(times, 1));
  }
}
