import { ShaderMaterial, DoubleSide, AdditiveBlending } from "three";

import { userParameters } from "../models/parameters";

const vs = `
  attribute float time;

  uniform float heatMapRadius;

  varying float vTime;

  const float denominator = 1.0 / 16.0;

  void main() {
    vTime = time;
    gl_Position = vec4(position * denominator, 1.0);
    gl_PointSize = heatMapRadius;
  }
`;

const fs = `
  uniform float heatIncrement;
  uniform float maxTime;
  uniform float minTime;
  varying float vTime;

  void main() {
    // Very simplistic accumulation, range is fixed to [0,10]
    // With more time, use integer gl.RED texture then normalize

    vec2 fragmentPointToCenterPoint = gl_PointCoord - vec2(0.5);
    gl_FragColor = vec4(heatIncrement, 0.0, 0.0, 1.0);
    // We want circles, not squares
    if (length(fragmentPointToCenterPoint) > 0.5 ||  vTime < minTime || vTime > maxTime) {
      discard;
    }
  }
`;

/**
 * Uses additive blending to draw a heatmap from a point cloud
 * Values in the red channel
 * Filters points with the time window
 */
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
      heatIncrement: { value: 1.0 / userParameters.heatMapRangeMax },
    };
    this.uniforms = uniforms;
    userParameters.subscribe(() => this.updateUniforms());
  }

  updateUniforms() {
    this.uniforms.heatMapRadius.value = userParameters.heatMapRadius;
    this.uniforms.minTime.value = userParameters.minTimeStamp;
    this.uniforms.maxTime.value = userParameters.maxTimeStamp;
    this.uniforms.heatIncrement.value = 1.0 / userParameters.heatMapRangeMax;
  }
}
