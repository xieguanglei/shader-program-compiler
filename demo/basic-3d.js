import { compile } from '../src/index';
import { mat4 } from 'gl-matrix';

const matrix = mat4.create();
mat4.fromZRotation(matrix, -Math.PI / 4);

(async function () {

  const vShader = `
precision mediump float;
attribute vec2 aPosition;
uniform mat4 uModelMatrix;
void main() {
  gl_Position = uModelMatrix * vec4(aPosition, 0, 1);
}`;
  const fShader = `
precision mediump float;
void main() {
  gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
}`;

  const gl = document.getElementById('root').getContext('webgl');

  const { program, attributes, uniforms, fillElements, drawArrays, drawElements } = compile({
    vShader, fShader, gl
  });
  gl.useProgram(program);
  fillElements([0, 1, 2]);
  attributes.aPosition.fill([0, 0.5, 0.4, -0.3, -0.4, -0.3]);
  uniforms.uModelMatrix.fill(matrix);

  function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawElements();
  }
  render();

})();