import { DoubleSide, Texture, ShaderMaterial, Color } from "three";
import { userParameters } from "../models/parameters";

import { textures } from "../TextureManager";

const vs = `
  attribute float time;

  varying float vTime;
  varying vec2 vUV;

  uniform sampler2D heightMap;
  uniform float heightMapIncrement;
  uniform float heightScaleFactor;

  uniform float scale;

  void main() {
    vUV = uv;
    vTime = time;

    // Compute pin position on the grid, then deduct height map UVs
    vec4 instanceGridPosition = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec2 heightMapUV = vec2(instanceGridPosition.x * heightMapIncrement, instanceGridPosition.y * heightMapIncrement) + vec2(0.5, 0.5);
    float height = texture2D(heightMap, heightMapUV).x * heightScaleFactor;

    instanceGridPosition.z += height;

    // Billboards
    vec4 mvInstancePosition = modelViewMatrix * instanceGridPosition;
    mvInstancePosition.xy += position.xy * vec2 (scale, scale);

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
    float alpha = textureColor.a; // Cheap way to avoid transparency issues
    gl_FragColor = vec4(textureColor.xyz, 1.0);
    if (alpha <= 0.4 || vTime < minTime || vTime > maxTime) {
      discard;
    }
  }
`;

/**
 * Material to draw pins as billboards
 * Handles pin height from the height texture
 * Discards pins that are out of the time window
 */
export class BillboardMaterial extends ShaderMaterial {
  private pinTexture: Texture;
  private heightMapTexture: Texture;

  constructor(color: Color) {
    super({
      side: DoubleSide,
      fragmentShader: fs,
      vertexShader: vs,
      transparent: true,
    });
    this.pinTexture = textures.pinTexture as Texture;
    this.heightMapTexture = textures.heightMapTexture as Texture;
    this.uniforms = {
      pinTexture: { value: this.pinTexture },
      scale: { value: userParameters.markerScale },
      heightMap: { value: this.heightMapTexture },
      heightMapIncrement: { value: 1.0 / (userParameters.gridLength * 2) },
      color: { value: color },
      minTime: { value: userParameters.minTimeStamp },
      maxTime: { value: userParameters.maxTimeStamp },
      heightScaleFactor: { value: userParameters.heightMapScaleFactor },
    };
    this.transparent = true;
    userParameters.subscribe(() => this.updateUniforms());
  }

  updateUniforms() {
    this.uniforms.minTime.value = userParameters.minTimeStamp;
    this.uniforms.maxTime.value = userParameters.maxTimeStamp;
    this.uniforms.heightScaleFactor.value = userParameters.heightMapScaleFactor;
    this.uniforms.scale.value = userParameters.markerScale;
  }
}
