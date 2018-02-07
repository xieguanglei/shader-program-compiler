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

const { program, attributes, uniforms, fillElements, drawElements, createElementsBuffer } = compile({
  vShader, fShader, gl
});

const { program: p2, uniforms: u2, attributes: a2 } = compile({
  vShader, fShader, gl
})

const elementsBuffer = createElementsBuffer([0, 1, 2, 0, 1, 3])
const aPositionBuffer = attributes.aPosition.createBuffer([0.4, 0.5, 0.5, -0.8, -0.5, -0.2, 1.0, 0.5]);
const elementsBuffer2 = createElementsBuffer([0, 1, 2])
const aPositionBuffer2 = attributes.aPosition.createBuffer([-1.0, -1.0, -0.8, -1.0, -1.0, -0.8]);


function render() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  uniforms.uColor.fill([0.89, 0.49, 0.13]);

  fillElements(elementsBuffer);
  attributes.aPosition.fill(aPositionBuffer);
  drawElements(6);

  fillElements(elementsBuffer2);
  attributes.aPosition.fill(aPositionBuffer2);
  drawElements(3);

  gl.useProgram(p2);

  u2.uColor.fill([0.13, 0.49, 0.89]);
  
  fillElements(elementsBuffer);
  a2.aPosition.fill(aPositionBuffer);
  // drawElements(6);
  fillElements(elementsBuffer2);
  a2.aPosition.fill(aPositionBuffer2);
  // drawElements(3);

  requestAnimationFrame(render);
}
render();
