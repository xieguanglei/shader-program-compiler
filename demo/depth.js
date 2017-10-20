import { compile } from '../src/index';

const vShader = `
attribute vec3 aPosition;
attribute vec3 aColor;
varying vec3 vColor;
void main() {
  gl_Position = vec4(aPosition, 1);
  vColor = aColor;
}`;
const fShader = `
precision mediump float;
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor, 1.0);
}`;

const gl = document.getElementById('root').getContext('webgl');

const { useProgram, attributes, uniforms, fillElements, drawElements } = compile({
    vShader, fShader, gl
});

useProgram();
fillElements([0, 1, 2, 3, 4, 5]);
attributes.aPosition.fill([
    0, 0, -0.8,
    1, 0, -0.8,
    0, 1, -0.8,
    1, 1, 0,
    1, 0, 0,
    0, 0, 0
]);
attributes.aColor.fill([
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1
]);

function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawElements();
}
render();