import { compile } from '../src/index';
import { mat4 } from 'gl-matrix';

async function loadImage(url) {
  const image = new Image();
  image.crossOrigin = true;

  await new Promise(function (resolve) {
    image.onload = resolve;
    image.src = url;
  });

  return image;
}

(async function () {

  const image = await loadImage('//img.alicdn.com/tfs/TB1apiEb8HH8KJjy0FbXXcqlpXa-1024-1024.png');

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

  fillElements(createElementsBuffer([0, 1, 2, 0, 2, 3]));
  attributes.aPosition.fill(
    attributes.aPosition.createBuffer([-1, 1, -1, -1, 1, -1, 1, 1])
  );
  attributes.aTexCoord.fill(
    attributes.aTexCoord.createBuffer([0, 1, 0, 0, 1, 0, 1, 1])
  );

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const tex = uniforms.uSample.createTexture(image);
  uniforms.uSample.fill(tex);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawElements(6);
  }
  render();

})();