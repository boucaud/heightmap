import { MeshBasicMaterial, DoubleSide, Texture } from "three";

import { textures } from "../TextureManager";

export class HeightMapMaterial extends MeshBasicMaterial {
  colorTexture: Texture;
  heightMapTexture: Texture;
  constructor() {
    super({ side: DoubleSide });
    // If texture loading failed, the application would have aborted TODO: make this a bit cleaner
    this.colorTexture = textures.colorMapTexture as Texture;
    this.heightMapTexture = textures.heightMapTexture as Texture;
    this.map = this.colorTexture;
  }
}
