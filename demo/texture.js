import { compile } from '../src/index';
import { mat4 } from 'gl-matrix';

async function loadImage(url) {
  const image = new Image();

  await new Promise(function (resolve) {
    image.onload = resolve;
    image.src = url;
  });

  return image;
}

(async function () {

  const image = await loadImage('./resource/coord.png');

  const vShader = `
precision mediump float;
attribute vec2 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;
void main() {
  gl_Position = vec4(aPosition, 0, 1);
  vTexCoord = aTexCoord;
}`;
  const fShader = `
precision mediump float;
uniform sampler2D uSample;
varying vec2 vTexCoord;
void main() {
  uSample;
  vTexCoord;
  gl_FragColor = texture2D(uSample, vTexCoord);
}`;

  const gl = document.getElementById('root').getContext('webgl');

  const { program, attributes, uniforms, fillElements, drawArrays, drawElements, createElementsBuffer } = compile({
    vShader, fShader, gl
  });

  fillElements(createElementsBuffer([0, 1, 2]));
  attributes.aPosition.fill(
    attributes.aPosition.createBuffer([-1, 1, -1, -1, 1, -1])
  );
  attributes.aTexCoord.fill(
    attributes.aTexCoord.createBuffer([0, 0, 0, 1, 1, 1])
  );
  uniforms.uSample.fill(
    uniforms.uSample.createTexture(image)
  );

  function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawElements(3);
  }
  render();

})();