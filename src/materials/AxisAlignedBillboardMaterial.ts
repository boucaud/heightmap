import { DoubleSide, Texture, ShaderMaterial, Color } from "three";
import { userParameters } from "../models/parameters";

import { textures } from "../TextureManager";

// TODO: too much duplication
// TODO: z on top of heightmap

const vs = `
  attribute float time;

  varying float vTime;
  varying vec2 vUV;

  uniform sampler2D heightMap;
  uniform float heightMapLength;

  void main() {
    vUV = uv;
    vTime = time;

    // Compute pin position on the grid, then deduct height map UVs
    vec4 instanceGridPosition = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec2 heightMapUV = vec2(instanceGridPosition.x / heightMapLength, instanceGridPosition.y / heightMapLength) + vec2(0.5, 0.5);
    float height = texture2D(heightMap, heightMapUV).x * 0.5; // TODO: scaling

    instanceGridPosition.z += height;

    // Billboards
    vec4 mvInstancePosition = modelViewMatrix * instanceGridPosition;
    mvInstancePosition.xy += position.xy;

    gl_Position = projectionMatrix * mvInstancePosition;
  }
`;

const fs = `
  uniform vec3 color;
  uniform float maxTime;
  uniform float minTime;
  uniform sampler2D pinTexture;

  varying float vTime;
  varying vec2 vUV;

  void main() {
    vec4 textureColor = texture2D(pinTexture, vUV) * vec4(color.rgb, 1.0);
    float alpha = textureColor.a; // Cheap way to avoid transparency issues TODO: investigate sorting instances or depth peeling ?
    gl_FragColor = vec4(textureColor.xyz, 1.0);
    if (alpha <= 0.4 || vTime < minTime || vTime > maxTime) {
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
      minTime: { value: userParameters.minTimeStamp },
      maxTime: { value: userParameters.maxTimeStamp },
    };
    this.transparent = true;
    userParameters.subscribe(() => this.updateUniforms());
  }

  updateUniforms() {
    this.uniforms.minTime.value = userParameters.minTimeStamp;
    this.uniforms.maxTime.value = userParameters.maxTimeStamp;
  }
}
