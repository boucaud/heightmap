import { ShaderMaterial, DoubleSide, Texture, Color } from "three";

import { textures } from "../TextureManager";

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

  uniform bool enableIsoLines;
  uniform float isoLineWidth;
  uniform float isoLineFrequency;
  uniform vec3 isoLineColor;

  void main() {
    float f = fract(height * isoLineFrequency);
    // ignore very flat areas
    f = max(0.0001, f);
    float df = fwidth(height * isoLineFrequency);
    float fstep = smoothstep(df, df * isoLineWidth, f);

    // If isolines are disabled, force fstep to 1
    fstep = mix(1.0, fstep, float(enableIsoLines));

    vec4 textureColor = texture2D(colorMap, vUV);
    gl_FragColor = mix(vec4(isoLineColor, 1.0), textureColor, fstep);

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
      enableIsoLines: { value: false},
      isoLineWidth: {value: 2.0 },
      isoLineFrequency: {value: 100.0},
      isoLineColor: {value: new Color(0.0, 0.5, 0.5)}
    };
    this.uniforms = uniforms;
  }
}
