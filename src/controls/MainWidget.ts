import { GUI, GUIController } from "dat.gui";
import { userParameters } from "../models/parameters";
import { Color } from "three";

export class MainWidget {
  gui: GUI;
  listeners: GUIController[] = [];
  minTimeStampListener: GUIController;

  colors = {
    isoLineColor: userParameters.isoLineColor.getHex(),
  };

  constructor() {
    this.gui = new GUI();
    const mapFolder = this.gui.addFolder("Height Map");
    this.listeners.push(
      mapFolder.add(userParameters, "mapResolution", 512, 2048).listen()
    );

    const isoLineFolder = this.gui.addFolder("Isometric Lines");
    this.listeners.push(
      isoLineFolder.add(userParameters, "enableIsoLines").listen()
    );
    this.listeners.push(
      isoLineFolder.add(userParameters, "isoLineFrequency", 10, 1000).listen()
    );
    this.listeners.push(
      isoLineFolder.add(userParameters, "isoLineWidth", 1.0, 10.0, 1.0).listen()
    );
    isoLineFolder.addColor(this.colors, "isoLineColor").onChange((val) => {
      userParameters.isoLineColor = new Color(val);
      this.onChange();
    });
    isoLineFolder.open();

    const heatMapFolder = this.gui.addFolder("Heat Map");
    this.listeners.push(
      heatMapFolder.add(userParameters, "enableHeatMap").listen()
    );
    this.listeners.push(
      heatMapFolder.add(userParameters, "heatMapPrecision", 1.0, 20.0).listen()
    );
    heatMapFolder.open();

    const pinFolder = this.gui.addFolder("Markers");
    this.minTimeStampListener = pinFolder.add(
      userParameters,
      "minTimeStamp",
      userParameters.minTimeStamp,
      userParameters.maxTimeStamp,
      0.01
    );
    this.listeners.push(this.minTimeStampListener);

    this.listeners.push(
      pinFolder.add(
        userParameters,
        "maxTimeStamp",
        userParameters.minTimeStamp,
        userParameters.maxTimeStamp,
        0.01
      )
    );

    // TODO: lut
    mapFolder.open();
    pinFolder.open();

    this.listeners.forEach((listener) =>
      listener.onChange(() => this.onChange())
    );
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
