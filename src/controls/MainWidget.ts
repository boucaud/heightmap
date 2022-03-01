import { GUI, GUIController } from "dat.gui";
import { userParameters } from "../models/parameters";

export class MainWidget {
  gui: GUI;
  listeners: GUIController[] = [];
  minTimeStampListener: GUIController;
  maxTimeStampListener: GUIController;

  colors = {
    isoLineColor: userParameters.isoLineColor.getHex(),
    ambient: userParameters.ambientColor.getHex(),
    diffuse: userParameters.diffuseColor.getHex(),
  };

  animation = {
    // How much time values will change per frame
    animationIncrement: 0.001,
    animate: false,
    disableMinAnimation: true,
  };

  constructor() {
    this.gui = new GUI();
    const mapFolder = this.gui.addFolder("Height Map");
    this.listeners.push(
      mapFolder.add(userParameters, "mapResolution", 512, 2048)
    );

    this.listeners.push(
      mapFolder.add(userParameters, "heightMapScaleFactor", 0.0, 5.0)
    );

    const isoLineFolder = this.gui.addFolder("Isometric Lines");
    this.listeners.push(isoLineFolder.add(userParameters, "enableIsoLines"));
    this.listeners.push(
      isoLineFolder.add(userParameters, "isoLineFrequency", 10, 1000)
    );
    this.listeners.push(
      isoLineFolder.add(userParameters, "isoLineWidth", 1.0, 10.0, 1.0)
    );
    isoLineFolder.addColor(this.colors, "isoLineColor").onChange((val) => {
      userParameters.isoLineColor.set(val);
      this.onChange();
    });

    const heatMapFolder = this.gui.addFolder("Heat Map");
    this.listeners.push(heatMapFolder.add(userParameters, "enableHeatMap"));
    this.listeners.push(
      heatMapFolder.add(userParameters, "heatMapRadius", 1.0, 30.0)
    );
    this.listeners.push(
      heatMapFolder.add(userParameters, "heatMapRangeMax", 0, 100, 10)
    );

    const pinFolder = this.gui.addFolder("Markers");
    this.listeners.push(pinFolder.add(userParameters, 'markerScale', 0.0, 10));
    this.minTimeStampListener = pinFolder.add(
      userParameters,
      "minTimeStamp",
      userParameters.minTimeStamp,
      userParameters.maxTimeStamp,
      0.01
    );
    this.listeners.push(this.minTimeStampListener);

    this.maxTimeStampListener = pinFolder.add(
      userParameters,
      "maxTimeStamp",
      userParameters.minTimeStamp,
      userParameters.maxTimeStamp,
      0.01
    );
    this.listeners.push(this.maxTimeStampListener);

    pinFolder.add(this.animation, "animationIncrement", 0.0, 0.1);
    pinFolder.add(this.animation, "animate").onChange(() => {
      // If we're only animating the max, reset it automatically
      if (
        userParameters.maxTimeStamp >= 1.0 &&
        this.animation.disableMinAnimation
      ) {
        userParameters.maxTimeStamp = 0.0;
      }
      this.animate();
    });
    pinFolder.add(this.animation, "disableMinAnimation");
    // TODO: lut

    const lightFolder = this.gui.addFolder("Lighting");
    lightFolder.addColor(this.colors, "ambient").onChange((val) => {
      userParameters.ambientColor.set(val);
      this.onChange();
    });
    lightFolder.addColor(this.colors, "diffuse").onChange((val) => {
      userParameters.diffuseColor.set(val);
      this.onChange();
    });
    lightFolder
      .add(userParameters, "lightAngle", 10, 170)
      .onChange(() => userParameters.lightAngleChanged());
    lightFolder
      .add(userParameters, "lightDistance", 0, 1000)
      .onChange(() => userParameters.lightAngleChanged());

    isoLineFolder.open();
    mapFolder.open();
    heatMapFolder.open();
    pinFolder.open();
    lightFolder.open();

    this.listeners.forEach((listener) =>
      listener.onChange(() => this.onChange())
    );
  }

  // Animate the timestamp window
  // Since we dont' have a render loop as only parameter changes trigger renders,
  // we can directly animate the parameters
  animate() {
    if (this.animation.animate) {
      requestAnimationFrame(() => this.animate());
    }
    if (!this.animation.disableMinAnimation) {
      userParameters.minTimeStamp += this.animation.animationIncrement;
      userParameters.minTimeStamp = Math.min(
        userParameters.maxTimeStamp,
        userParameters.minTimeStamp
      );
    }

    userParameters.maxTimeStamp += this.animation.animationIncrement;
    userParameters.maxTimeStamp = Math.min(1.0, userParameters.maxTimeStamp);
    if (
      userParameters.maxTimeStamp >= 1.0 &&
      (userParameters.minTimeStamp >= userParameters.maxTimeStamp ||
        this.animation.disableMinAnimation)
    ) {
      this.animation.animate = false;
    }
    this.minTimeStampListener.updateDisplay();
    this.maxTimeStampListener.updateDisplay();
    this.onChange();
  }

  onChange() {
    // Make sure min stays below max
    if (userParameters.minTimeStamp > userParameters.maxTimeStamp) {
      userParameters.minTimeStamp = userParameters.maxTimeStamp;
      this.minTimeStampListener.updateDisplay();
    }

    userParameters.changed();
  }
}
