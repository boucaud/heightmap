import { Color } from "three";
import { Lut } from "three/examples/jsm/math/Lut";
import eventGroups from "../../assets/position_events.json";

class Parameters {
  mapResolution = 1280;
  gridLength = 16.0;
  heightMapScaleFactor = 0.5;
  enableIsoLines = false;
  isoLineWidth = 2.0;
  isoLineFrequency = 100.0;
  isoLineColor: Color = new Color(0.0, 0.5, 0.5);

  groupLut: Lut = new Lut("rainbow", eventGroups.length);
  markerScale = 0.1;

  enableHeatMap = false;
  heatMapPrecision = 10.0;

  // Timestamps are normalized in the buffers, to avoid using int64 buffers
  // Ideally, gui values would not
  private times = eventGroups
    .flat(1)
    .map((event: { x: number; y: number; t: number }) => event.t);
  maxAvailableTimeStamp = Math.max(...this.times);
  minAvailableTimeStamp = Math.min(...this.times);

  minTimeStamp = 0.0;
  maxTimeStamp = 1.0;

  subscriptions: (() => void)[] = [];
  subscribe(callback: () => void) {
    this.subscriptions.push(callback);
  }
  changed() {
    this.subscriptions.forEach((callback) => callback());
  }
}

const userParameters = new Parameters();
export { userParameters };
