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

  const gl = document.getElementById('root').getContext('webgl');


  function drawFramebuffer() {

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

    const { program, attributes, uniforms, fillElements, drawArrays, drawElements, createFramebuffer, createElementsBuffer } = compile({
      vShader, fShader, gl
    });

    gl.useProgram(program);
    fillElements(createElementsBuffer([0, 1, 2]));
    attributes.aPosition.fill(
      attributes.aPosition.createBuffer([-1, 1, -1, -1, 1, -1, 1, 1])
    );
    attributes.aTexCoord.fill(
      attributes.aTexCoord.createBuffer([0, 0, 0, 1, 1, 1, 1, 0])
    );
    uniforms.uSample.fill(uniforms.uSample.createTexture(image));

    const { framebuffer, texture } = createFramebuffer();

    gl.clearColor(0.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawElements(3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    return texture;
  }

  const texture = drawFramebuffer();

  function drawCanvas() {

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

    const { program, attributes, uniforms, fillElements, drawArrays, drawElements, createElementsBuffer } = compile({
      vShader, fShader, gl
    });

    gl.useProgram(program);
    fillElements(createElementsBuffer([0, 1, 2, 0, 2, 3]));
    attributes.aPosition.fill(
      attributes.aPosition.createBuffer([-1, 1, -1, -1, 1, -1, 1, 1])
    );
    attributes.aTexCoord.fill(
      attributes.aTexCoord.createBuffer([0, 0, 0, 1, 1, 1, 1, 0])
    );
    uniforms.uSample.fill(texture);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, 300, 300);
    drawElements(6);
  }

  drawCanvas();
})();