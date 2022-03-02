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
  precision highp float;
  varying vec2 vUV;
  varying float height;
  uniform float gridLength;
  uniform sampler2D heightMap;
  uniform float heightScaleFactor;

  uniform vec3 lightPosition;
  varying vec3 vNormal;
  varying vec3 vLightVector;
  varying vec3 vViewVector;

  void main() {
    vUV = vec2(position.x / gridLength, position.y / gridLength) + vec2(0.5, 0.5);
    height = texture(heightMap, vUV).x * heightScaleFactor;
    vec4 bumpedPosition = vec4(position.xy, height, 1.0);

    // Normal in view space TODO: lots of optimizations to do
    const ivec3 offsets = ivec3 (-1, 0, 1);
    float epsilon = 32.0 / 1280.0;
    // Sample heights in an ABCD square around us
    //     D
    //  A  P  C
    //     B
    float heightA = textureOffset(heightMap, vUV, offsets.xy).x * heightScaleFactor;
    float heightB = textureOffset(heightMap, vUV, offsets.yx).x * heightScaleFactor;
    float heightC = textureOffset(heightMap, vUV, offsets.zy).x * heightScaleFactor;
    float heightD = textureOffset(heightMap, vUV, offsets.yz).x * heightScaleFactor;
    vec3 bumpedNormal = vec3((heightA - heightB) / epsilon, (heightB - heightD) / epsilon, 1.0);
    vNormal = normalMatrix * normalize(bumpedNormal);

    vec4 mvPosition = modelViewMatrix * bumpedPosition;

    vLightVector = normalize((viewMatrix * vec4(lightPosition, 1.0) - mvPosition).xyz);

    vViewVector = -normalize(mvPosition.xyz);

    gl_Position = projectionMatrix * mvPosition;

  }
`;

const fs = `
  precision highp float;

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

  uniform vec3 ambientLight;
  uniform vec3 diffuseLight;
  varying vec3 vNormal;
  varying vec3 vLightVector;
  varying vec3 vViewVector;

  void main() {
    // Compute isoline steps
    // Isoline density
    float f = fract(height * isoLineFrequency);
    // Ignore very flat areas (the sea level)
    f = max(0.0001, f);
    // Smooth lines
    float df = fwidth(height * isoLineFrequency);
    float fstep = smoothstep(df, df * isoLineWidth, f);

    // Compute heat color
    float heat = texture(heatMapTexture, vUV).r;
    vec3 heatColor = texture(lutTexture, vec2(heat, 0.5)).rgb;


    // Phong shading
    vec4 materialColor = texture2D(colorMap, vUV);
    // Make the sea more specular than the rest
    vec3 materialSpecular = mix(vec3(0.2), vec3(0.8), float(height == 0.0));
    float materialSpecularPower = 128.0;

    // Diffuse
    vec3 diffuse = max(dot(vNormal, vLightVector), 0.0) * diffuseLight;

    // Specular
    vec3 reflection = reflect(-vLightVector, vNormal);
    vec3 specular = pow(max(dot(reflection, vViewVector), 0.0), materialSpecularPower) * materialSpecular;

    // Shaded color
    vec3 color = (ambientLight + diffuse + specular) * materialColor.xyz;


    // (Non-zero heatmap areas and isolines should be 'emissive' for more clarity, ignore shading if heat > 0 or on iso line)
    // Use heat color if enabled and > 0
    color = mix(color, heatColor, float(enableHeatMap && heat > 0.0));

    // Use isoline color if we're on a step
    color = mix(isoLineColor, color, float(enableIsoLines) * fstep + float(!enableIsoLines));

    gl_FragColor = vec4(color, materialColor.a);
  }
`;

/**
 * Draws the heightmap on a grid
 * Handles elevation from the heightmap texture
 * Handles heatmap from the heatmap texture
 * Handles isolines
 * Applies phong shading
 */
export class HeightMapMaterial extends ShaderMaterial {
  private colorTexture: Texture;
  private heightMapTexture: Texture;

  constructor() {
    super({
      side: DoubleSide,
      fragmentShader: fs,
      vertexShader: vs,
    });
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
      ambientLight: { value: userParameters.ambientColor },
      diffuseLight: { value: userParameters.diffuseColor },
      lightPosition: { value: userParameters.lightPosition },
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
    this.uniforms.ambientLight.value = userParameters.ambientColor;
    this.uniforms.diffuseLight.value = userParameters.diffuseColor;
    this.uniforms.lightPosition.value = userParameters.lightPosition;
  }
}
