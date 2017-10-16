import { compile } from '../src/index';

async function loadImage(url) {
  const image = new Image();

  await new Promise(function (resolve) {
    image.onload = resolve;
    image.src = url;
  });

  return image;
}

(async function () {

  const vShader = `
precision mediump float;
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

  const { program, attributes, uniforms, fillElements, drawArrays, drawElements } = compile({
    vShader, fShader, gl
  });
  gl.useProgram(program);
  fillElements([0, 1, 2]);
  attributes.aPosition.fill([0.4, 0.5, 0.5, -0.8, -0.5, -0.2]);
  uniforms.uColor.fill([0.89, 0.49, 0.13]);

  function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawElements();
  }
  render();

})();