import { GUI, GUIController } from "dat.gui";
import { userParameters } from "../models/parameters";

export class MainWidget {
  gui: GUI;
  listeners: GUIController[] = [];
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
    // TODO: colors, lut
    mapFolder.open();

    this.listeners.forEach((listener) =>
      listener.onChange(() => this.onChange())
    );
  }

  onChange() {
    userParameters.changed();
  }
}
