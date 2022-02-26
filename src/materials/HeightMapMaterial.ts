import { ShaderMaterial, DoubleSide, Texture } from "three";

import { textures } from "../TextureManager";

const vs = `
  varying vec2 vUV;
  uniform float gridLength;
  uniform sampler2D heightMap;
  uniform float heightScaleFactor;
  void main() {
    vUV = vec2(position.x / gridLength, position.y / gridLength) + vec2(0.5, 0.5);
    float height = texture2D(heightMap, vUV).x * heightScaleFactor;
    vec4 bumpedPosition = vec4(position.xy, height, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * bumpedPosition;
  }
`;

const fs = `
  varying vec2 vUV;
  uniform float gridLength;
  uniform sampler2D colorMap;

  void main() {
    gl_FragColor = texture2D(colorMap, vUV);
  }
`;

// TODO: RawShaderMaterial necessary to follow instructions to the letter ?
export class HeightMapMaterial extends ShaderMaterial {
  colorTexture: Texture;
  heightMapTexture: Texture;
  constructor() {
    super({ side: DoubleSide, fragmentShader: fs, vertexShader: vs });
    // If texture loading failed, the application would have aborted TODO: make this a bit cleaner
    this.colorTexture = textures.colorMapTexture as Texture;
    this.heightMapTexture = textures.heightMapTexture as Texture;
    const uniforms = {
      gridLength: { value: 16.0 },
      colorMap: { value: this.colorTexture },
      heightMap: { value: this.heightMapTexture },
      heightScaleFactor: { value: 0.5 },
    };
    this.uniforms = uniforms;
  }
}
