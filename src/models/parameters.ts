import { Color, Vector3 } from "three";
import { Lut } from "three/examples/jsm/math/Lut";
import eventGroups from "../../assets/position_events.json";

class Parameters {
  mapResolution = 1280;
  gridLength = 16.0;
  heightMapScaleFactor = 1.0;
  enableIsoLines = false;
  isoLineWidth = 1.0;
  isoLineFrequency = 50.0;
  isoLineColor: Color = new Color(0.8, 0.8, 1.0);

  groupLut: Lut = new Lut("rainbow", eventGroups.length);
  markerScale = 0.25;

  enableHeatMap = false;
  heatMapRadius = 20.0;
  heatMapRangeMax = 20.0;

  // Timestamps are normalized in the buffers, to avoid using int64 buffers
  // Ideally, gui values would not
  private times = eventGroups
    .flat(1)
    .map((event: { x: number; y: number; t: number }) => event.t);
  maxAvailableTimeStamp = Math.max(...this.times);
  minAvailableTimeStamp = Math.min(...this.times);

  minTimeStamp = 0.0;
  maxTimeStamp = 1.0;

  ambientColor: Color = new Color(0.1, 0.1, 0.1);
  diffuseColor: Color = new Color(1.0, 1.0, 1.0);

  lightPosition = new Vector3(0.0, 0.0, 0.0);
  lightDistance = 35.0;
  lightAngle = 60;

  constructor() {
    this.updateLightPosition();
  }

  subscriptions: (() => void)[] = [];
  subscribe(callback: () => void) {
    this.subscriptions.push(callback);
  }
  changed() {
    this.subscriptions.forEach((callback) => callback());
  }

  updateLightPosition() {
    this.lightPosition.x =
      this.lightDistance * Math.cos((this.lightAngle * Math.PI) / 180);
    this.lightPosition.z =
      this.lightDistance * Math.sin((this.lightAngle * Math.PI) / 180);
  }

  lightAngleChanged() {
    this.updateLightPosition();
    this.changed();
  }
}

const userParameters = new Parameters();
export { userParameters };
