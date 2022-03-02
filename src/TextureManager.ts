import { Texture, TextureLoader } from "three";

import colormap from "assets/colormap.jpg";
import heightmap from "assets/heightmap.jpg";
import pin from "assets/pin.png";

/**
 * A singleton to load textures before the scene is initialized
 * Allows texture sharing across materials
 */
class TextureManager {
  colorMapTexture: Texture | null = null;
  heightMapTexture: Texture | null = null;
  pinTexture: Texture | null = null;
  heatMapTexture: Texture | null = null;

  private loader: TextureLoader;

  constructor() {
    this.loader = new TextureLoader();
  }

  // Wrap TextureLoader.load within a promise
  private load(url: string) {
    return new Promise<Texture>((resolve, reject) => {
      this.loader.load(
        url,
        resolve,
        () => {
          /* ignore progress */
        },
        reject
      );
    });
  }

  // Load all required textures
  loadAllTextures() {
    return Promise.all([
      this.load(colormap).then(
        (texture: Texture) => (this.colorMapTexture = texture)
      ),
      this.load(heightmap).then(
        (texture: Texture) => (this.heightMapTexture = texture)
      ),
      this.load(pin).then((texture: Texture) => (this.pinTexture = texture)),
    ]);
  }
}

// Export a single instance
const textures = new TextureManager();
export { textures };
