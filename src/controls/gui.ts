import { GUI, GUIController } from "dat.gui";
import { userParameters } from "../models/parameters";
import { Color } from "three";

export class MainWidget {
  gui: GUI;
  listeners: GUIController[] = [];
  minTimeStampListener: GUIController;

  colors = {
    isoLineColor: userParameters.isoLineColor.getHex()
  }

  constructor() {
    this.gui = new GUI();
    const mapFolder = this.gui.addFolder("Height Map");
    this.listeners.push(
      mapFolder.add(userParameters, "mapResolution", 512, 2048).listen()
    );
    this.listeners.push(
      mapFolder.add(userParameters, "enableIsoLines").listen()
    );
    this.listeners.push(
      mapFolder.add(userParameters, "isoLineFrequency", 10, 1000).listen()
    );
    this.listeners.push(
      mapFolder.add(userParameters, "isoLineWidth", 1.0, 10.0, 1.0).listen()
    );

    mapFolder
        .addColor(this.colors, "isoLineColor")
        .onChange((val) => {
          userParameters.isoLineColor = new Color(val);
          this.onChange();
        })

    const pinFolder = this.gui.addFolder("Markers");
    this.minTimeStampListener = pinFolder.add(
      userParameters,
      "minTimeStamp",
      userParameters.minTimeStamp,
      userParameters.maxTimeStamp
    );
    this.listeners.push(this.minTimeStampListener);

    this.listeners.push(
      pinFolder.add(
        userParameters,
        "maxTimeStamp",
        userParameters.minTimeStamp,
        userParameters.maxTimeStamp
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
