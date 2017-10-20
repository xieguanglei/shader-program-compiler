import { compile } from '../src/index';

const vShader = `
attribute vec2 aPosition;
attribute vec4 aColor;
varying vec4 vColor;
void main() {
  gl_Position = vec4(aPosition, 0, 1);
  vColor = aColor;
}`;
const fShader = `
precision mediump float;
varying vec4 vColor;
void main() {
  gl_FragColor = vColor;
}`;

const gl = document.getElementById('root').getContext('webgl');

const { useProgram, attributes, uniforms, fillElements, drawElements } = compile({
    vShader, fShader, gl
});

useProgram();
fillElements([0, 1, 2, 3, 4, 5]);
attributes.aPosition.fill([
    0, 0,
    1, 0,
    0, 1, 
    1, 1,
    1, 0,
    0, 0,
]);
attributes.aColor.fill([
    1, 0, 0, 0.7,
    1, 0, 0, 0.7,
    1, 0, 0, 0.7,
    0, 0, 1, 0.4,
    0, 0, 1, 0.4,
    0, 0, 1, 0.4
]);

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawElements();
}
render();