import { SceneManager } from "./SceneManager";

const canvas = document.createElement('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const sceneManager = new SceneManager(canvas);

window.onresize = () => sceneManager.onResize();

document.body.appendChild(canvas);

// Trigger the first render
sceneManager.update();