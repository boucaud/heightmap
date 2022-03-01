import { ShaderMaterial, DoubleSide, AdditiveBlending } from "three";

import { userParameters } from "../models/parameters";

const vs = `
  precision highp float;
  attribute float time;

  uniform float heatMapRadius;

  varying float vTime;

  void main() {
    vTime = time;
    gl_Position = vec4(position / 16., 1.0);
    gl_PointSize = heatMapRadius;
  }
`;

const fs = `
  precision highp float;
  uniform float heatMapRadius;
  uniform float maxTime;
  uniform float minTime;

  varying float vTime;

  void main() {
    // Very simplistic accumulation, range is fixed to [0,10]
    // With more time, use integer gl.RED texture then normalize

    vec2 centerVector = gl_PointCoord - vec2(0.5 * heatMapRadius);
    gl_FragColor = vec4(0.05, 0.0, 0.0, 1.0);
    // We want circles, not squares TODO: fix
    if (length(centerVector) > heatMapRadius * 0.7 ||  vTime < minTime || vTime > maxTime) {
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
      heatMapRadius: { value: userParameters.heatMapRadius },
      minTime: { value: userParameters.minTimeStamp },
      maxTime: { value: userParameters.maxTimeStamp },
    };
    this.uniforms = uniforms;
    userParameters.subscribe(() => this.updateUniforms());
  }

  updateUniforms() {
    this.uniforms.heatMapRadius.value = userParameters.heatMapRadius;
    this.uniforms.minTime.value = userParameters.minTimeStamp;
    this.uniforms.maxTime.value = userParameters.maxTimeStamp;
  }
}
