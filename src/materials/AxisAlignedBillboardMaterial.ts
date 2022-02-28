import { DoubleSide, Texture, ShaderMaterial, Color } from "three";
import { userParameters } from "../models/parameters";

import { textures } from "../TextureManager";

// TODO: too much duplication
// TODO: z on top of heightmap

const vs = `
  varying vec2 vUV;

  uniform float heightMapLength;

  uniform sampler2D heightMap;

  void main() {
    vUV = uv;

    vec4 instancePosition = instanceMatrix * vec4(position, 1.0);

    // Compute pin position on the grid, then deduct height map UVs
    vec4 instanceGridPosition = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec2 heightMapUV = vec2(instanceGridPosition.x / heightMapLength, instanceGridPosition.y / heightMapLength) + vec2(0.5, 0.5);
    float height = texture2D(heightMap, heightMapUV).x * 0.5; // TODO: scaling

    instancePosition.z += height;
    gl_Position = projectionMatrix * modelViewMatrix * instancePosition;
  }
`;

const fs = `
  varying vec2 vUV;
  uniform sampler2D pinTexture;
  uniform vec3 color;

  void main() {
    vec4 textureColor = texture2D(pinTexture, vUV) * vec4(color.rgb, 1.0);
    float alpha = textureColor.a; // Cheap way to avoid transparency issues TODO: investigate sorting instances or depth peeling ?
    gl_FragColor = vec4(textureColor.xyz, 1.0);
    if (alpha <= 0.4) {
      discard;
    }
  }
`;

// TODO: RawShaderMaterial necessary to follow instructions to the letter ?
export class AxisAlignedBillboardMaterial extends ShaderMaterial {
  pinTexture: Texture;
  heightMapTexture: Texture;

  constructor(color: Color) {
    super({
      side: DoubleSide,
      fragmentShader: fs,
      vertexShader: vs,
      transparent: true,
    });
    // If texture loading failed, the application would have aborted TODO: make this a bit cleaner
    this.pinTexture = textures.pinTexture as Texture;
    this.heightMapTexture = textures.heightMapTexture as Texture;
    this.uniforms = {
      pinTexture: { value: this.pinTexture },
      heightMap: { value: this.heightMapTexture },
      heightMapLength: { value: userParameters.gridLength * 2 }, // TODO:
      color: { value: color },
    };
    this.transparent = true;
  }
}
