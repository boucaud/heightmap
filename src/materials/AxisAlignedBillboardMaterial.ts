import { DoubleSide, Texture, ShaderMaterial, Color } from "three";

import { textures } from "../TextureManager";

// TODO: too much duplication
// TODO: z on top of heightmap

const vs = `
  varying vec2 vUV;
  uniform float gridLength;

  void main() {
    vUV = vec2(position.x / gridLength, position.y / gridLength) + vec2(0.5, 0.5);
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

const fs = `
  varying vec2 vUV;
  uniform sampler2D pinTexture;
  uniform vec3 color;

  void main() {
    vec4 textureColor = texture2D(pinTexture, vUV) * vec4(color.rgb, 1.0);
    gl_FragColor = textureColor;
  }
`;

// TODO: RawShaderMaterial necessary to follow instructions to the letter ?
export class AxisAlignedBillboardMaterial extends ShaderMaterial {
  pinTexture: Texture;
  heightMapTexture: Texture;

  constructor(color: Color, scale: number) {
    super({
      side: DoubleSide,
      depthTest: false, // Always in front of the map
      fragmentShader: fs,
      vertexShader: vs,
      transparent: true,
    });
    // If texture loading failed, the application would have aborted TODO: make this a bit cleaner
    this.pinTexture = textures.pinTexture as Texture;
    this.heightMapTexture = textures.heightMapTexture as Texture;
    this.uniforms = {
      gridLength: { value: scale },
      pinTexture: { value: this.pinTexture },
      color: { value: color },
    };
    this.transparent = true;
  }
}
