import { ShaderMaterial, DoubleSide, AdditiveBlending } from "three";

import { userParameters } from "../models/parameters";

const vs = `
  uniform float heatMapPrecision;

  void main() {
    gl_Position = vec4(position / 16., 1.0);
    gl_PointSize = heatMapPrecision;
  }
`;

const fs = `
  uniform float heatMapPrecision;

  void main() {
    // Very simplistic accumulation, range is fixed to [0,10]
    // With more time, use integer gl.RED texture then normalize

    vec2 centerVector = gl_PointCoord - vec2(0.5 * heatMapPrecision);
    gl_FragColor = vec4(0.1, 0.0, 0.0, 1.0);
    // We want circles, not squares
    if (length(centerVector) > heatMapPrecision * 0.7) {
      discard;
    }
  }
`;

export class PointCloudHeatMapMaterial extends ShaderMaterial {
  constructor() {
    super({
      side: DoubleSide,
      fragmentShader: fs,
      vertexShader: vs,
      blending: AdditiveBlending,
    });

    const uniforms = {
      heatMapPrecision: { value: userParameters.heatMapPrecision },
    };
    this.uniforms = uniforms;
    userParameters.subscribe(() => this.updateUniforms());
  }

  updateUniforms() {
    this.uniforms.heatMapPrecision.value = userParameters.heatMapPrecision;
  }
}
