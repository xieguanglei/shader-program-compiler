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

  const gl = document.getElementById('root').getContext('webgl');

  async function drawFramebuffer() {

    const image = await loadImage('./resource/coord.png');

    const vShader = `
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
      gl_FragColor = texture2D(uSample, vTexCoord);
    }`;

    const { program, attributes, uniforms, fillElements, drawArrays, drawElements, frameBuffer } = compile({
      vShader, fShader, gl
    });

    gl.useProgram(program);
    fillElements([0, 1, 2]);
    attributes.aPosition.fill([-1, 1, -1, -1, 1, -1, 1, 1]);
    attributes.aTexCoord.fill([0, 0, 0, 1, 1, 1, 1, 0]);
    uniforms.uSample.fill(image);
    const tex = frameBuffer();
    gl.clearColor(0.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawElements();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return tex;
  }

  const fb = await drawFramebuffer();

  async function drawCanvas() {

    const image = await loadImage('./resource/coord.png');

    const vShader = `
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
          gl_FragColor = texture2D(uSample, vTexCoord);
        }`;

    const { program, attributes, uniforms, fillElements, drawArrays, drawElements } = compile({
      vShader, fShader, gl
    });

    gl.useProgram(program);
    fillElements([0, 1, 2, 0, 2, 3]);
    attributes.aPosition.fill([-1, 1, -1, -1, 1, -1, 1, 1]);
    attributes.aTexCoord.fill([0, 0, 0, 1, 1, 1, 1, 0]);
    uniforms.uSample.fill(fb);
    // uniforms.uSample.fill(image);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, 300, 300);
    drawElements();
  }

  drawCanvas();
})();