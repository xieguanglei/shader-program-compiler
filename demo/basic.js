import { compile } from '../src/index';

const vShader = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0, 1);
}`;
const fShader = `
precision mediump float;
uniform vec3 uColor;
void main() {
  gl_FragColor = vec4(uColor, 1.0);
}`;

const gl = document.getElementById('root').getContext('webgl');

const { attributes, uniforms, fillElements, drawElements, createElementsBuffer } = compile({
  vShader, fShader, gl
});

fillElements(
  createElementsBuffer([0, 1, 2])
);
attributes.aPosition.fill(
  attributes.aPosition.createBuffer([0.4, 0.5, 0.5, -0.8, -0.5, -0.2])
);
uniforms.uColor.fill([0.89, 0.49, 0.13]);

function render() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawElements(3);
}
render();