import { Texture, TextureLoader } from "three";

import colormap from "assets/colormap.jpg";
import heightmap from "assets/heightmap.jpg";

// A singleton to load textures before the scene is initialized
class TextureManager {
  colorMapTexture: Texture | null = null;
  heightMapTexture: Texture | null = null;

  private loader: TextureLoader;

  constructor() {
    this.loader = new TextureLoader();
  }

  // Wrap TextureLoader.load within a promise
  private async load(url: string) {
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
  async loadAllTextures() {
    return Promise.all([
      this.load(colormap).then(
        (texture: Texture) => (this.colorMapTexture = texture)
      ),
      this.load(heightmap).then(
        (texture: Texture) => (this.heightMapTexture = texture)
      ),
    ]);
  }
}

// Export a single instance
const textures = new TextureManager();
export { textures };
