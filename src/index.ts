import { SceneManager } from "./SceneManager";
import { textures } from "./TextureManager";

async function load() {
  return textures.loadAllTextures();
}

function start() {
  // Create the canvas
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  // Initialize the scene
  const sceneManager = new SceneManager(canvas);

  // Bind events
  window.onresize = () => sceneManager.onResize();

  // Trigger the first render
  sceneManager.update(true);
}

// Load textures, then start
load()
  .then(start)
  .catch((error: ErrorEvent) => {
    // Report the error to the user
    const p = document.createElement("p");
    p.textContent = `Failed to load textures. ${
      error.message || error.error || ""
    }`;
    document.body.appendChild(p);
  });
