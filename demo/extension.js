import { compile } from '../src/index';
import { mat4 } from 'gl-matrix';

const matrix = mat4.create();
mat4.fromZRotation(matrix, -Math.PI / 4);

(async function () {

  const vShader = `
precision mediump float;
attribute vec2 aPosition;
varying vec2 vPosition;
uniform mat4 uModelMatrix;
void main() {
  vPosition = aPosition;
  gl_Position = uModelMatrix * vec4(aPosition, 0, 1);
}`;
  const fShader = `
#extension GL_OES_standard_derivatives: enable
precision mediump float;
varying vec2 vPosition;
void main() {
  vec2 st = vPosition;
  vec2 s = (sin(vec2(st.x*10.0, st.y*10.0))+1.0)/2.0;
  s = dFdy(s)*80.0;
  gl_FragColor = vec4(s.x, s.y, 0.0, 1.0);
}`;

  const gl = document.getElementById('root').getContext('webgl');

  console.log(gl.getExtension('OES_standard_derivatives'));
  

  const { program, attributes, uniforms, fillElements, drawArrays, drawElements, createElementsBuffer } = compile({
    vShader, fShader, gl
  });

  fillElements(createElementsBuffer([0, 1, 2]));
  attributes.aPosition.fill(attributes.aPosition.createBuffer([0, 0.9, 0.9, -0.9, -0.9, -0.9]));
  uniforms.uModelMatrix.fill(matrix);


  function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawElements(3);
  }
  render();

})();