import {
  ShaderMaterial,
  DoubleSide,
  Texture,
  DataTexture,
  NearestFilter,
} from "three";

import { textures } from "../TextureManager";

import { userParameters } from "../models/parameters";
import { Lut } from "three/examples/jsm/math/Lut";
const vs = `
  varying vec2 vUV;
  varying float height;
  uniform float gridLength;
  uniform sampler2D heightMap;
  uniform float heightScaleFactor;
  void main() {
    vUV = vec2(position.x / gridLength, position.y / gridLength) + vec2(0.5, 0.5);
    height = texture2D(heightMap, vUV).x * heightScaleFactor;
    vec4 bumpedPosition = vec4(position.xy, height, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * bumpedPosition;
  }
`;

const fs = `
  varying vec2 vUV;
  varying float height;
  uniform float gridLength;
  uniform sampler2D colorMap;
  uniform sampler2D lutTexture;
  uniform sampler2D heatMapTexture;
  uniform float heightScaleFactor;

  uniform bool enableIsoLines;
  uniform bool enableHeatMap;
  uniform float isoLineWidth;
  uniform float isoLineFrequency;
  uniform vec3 isoLineColor;

  void main() {
    // Isoline density
    float f = fract(height * isoLineFrequency);
    // Ignore very flat areas
    f = max(0.0001, f);
    // Smooth lines
    float df = fwidth(height * isoLineFrequency);
    float fstep = smoothstep(df, df * isoLineWidth, f);

    // If isolines are disabled, force fstep to 1
    fstep = mix(1.0, fstep, float(enableIsoLines));

    vec4 textureColor = texture2D(colorMap, vUV);
    float heat = texture(heatMapTexture, vUV).r;
    vec4 heatColor = vec4(texture(lutTexture, vec2(heat, 0.5)).rgb, 1.0);
    // Replace colormap with heat color if enabled.
    vec4 color = mix(textureColor, heatColor, float(enableHeatMap));

    gl_FragColor = mix(vec4(isoLineColor, 1.0), color, fstep);
  }
`;

// TODO: RawShaderMaterial necessary to follow instructions to the letter ?
export class HeightMapMaterial extends ShaderMaterial {
  colorTexture: Texture;
  heightMapTexture: Texture;
  constructor() {
    super({
      side: DoubleSide,
      fragmentShader: fs,
      vertexShader: vs,
    });
    // If texture loading failed, the application would have aborted TODO: make this a bit cleaner
    this.colorTexture = textures.colorMapTexture as Texture;
    this.heightMapTexture = textures.heightMapTexture as Texture;
    const uniforms = {
      gridLength: { value: userParameters.gridLength * 2 },
      colorMap: { value: this.colorTexture },
      heightMap: { value: this.heightMapTexture },
      heightScaleFactor: { value: userParameters.heightMapScaleFactor },
      enableIsoLines: { value: userParameters.enableIsoLines },
      isoLineWidth: { value: userParameters.isoLineWidth },
      isoLineFrequency: { value: userParameters.isoLineFrequency },
      isoLineColor: { value: userParameters.isoLineColor },
      lutTexture: { value: this.getLutTexture() },
      enableHeatMap: { value: userParameters.enableHeatMap },
      heatMapTexture: { value: textures.heatMapTexture },
    };
    this.uniforms = uniforms;
    userParameters.subscribe(() => this.updateUniforms());
  }

  // Build a 1D texture to be used as lookup table for heatmap colors
  getLutTexture() {
    const lut = new Lut("jet");
    const buffer = new Uint8Array(32 * 4);
    lut.lut.forEach(({ r, g, b }, index) => {
      const multiplier = 255;
      buffer[index * 4] = Math.floor(r * multiplier);
      buffer[index * 4 + 1] = Math.floor(g * multiplier);
      buffer[index * 4 + 2] = Math.floor(b * multiplier);
      buffer[index * 4 + 3] = 1;
    });

    const lutTexture = new DataTexture(buffer, 32, 1);
    lutTexture.needsUpdate = true;
    lutTexture.magFilter = NearestFilter;
    return lutTexture;
  }

  updateUniforms() {
    this.uniforms.gridLength.value = userParameters.gridLength * 2;
    this.uniforms.heightScaleFactor.value = userParameters.heightMapScaleFactor;
    this.uniforms.enableIsoLines.value = userParameters.enableIsoLines;
    this.uniforms.isoLineWidth.value = userParameters.isoLineWidth;
    this.uniforms.isoLineFrequency.value = userParameters.isoLineFrequency;
    this.uniforms.isoLineColor.value = userParameters.isoLineColor;
    this.uniforms.enableHeatMap.value = userParameters.enableHeatMap;
  }
}
