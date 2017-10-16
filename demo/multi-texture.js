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

async function loadVideo(url) {

  return new Promise(function (resolve) {

    const video = document.createElement('video');
    video.style.display = 'none';
    video.setAttribute('playsinline', true);
    video.setAttribute('webkit-playsinline', true);
    video.crossOrigin = 'anonymous';

    let playing = false;
    let timeupdate = false;

    video.autoplay = true;
    video.muted = true;
    video.loop = true;

    video.addEventListener('playing', function () {
      playing = true;
      checkReady();
    }, true);
    video.addEventListener('timeupdate', function () {
      timeupdate = true;
      checkReady();
    }, true);

    function checkReady() {
      if (playing && timeupdate) {
        resolve(video);
      }
    }

    video.src = url;
    video.play();

  });
}

(async function () {

  const image = await loadImage('./resource/coord.png');
  const video = await loadVideo('./resource/firefox.mp4');

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
uniform sampler2D uVideo;
uniform sampler2D uImage;
varying vec2 vTexCoord;
void main() {
  vec4 colorVideo = texture2D(uVideo, vTexCoord);
  vec4 colorImage = texture2D(uImage, vTexCoord);
  gl_FragColor = colorVideo * colorImage;
}`;

  const gl = document.getElementById('root').getContext('webgl');

  const { program, attributes, uniforms, fillElements, drawArrays, drawElements } = compile({
    vShader, fShader, gl
  });

  gl.useProgram(program);
  fillElements([0, 1, 2, 0, 2, 3]);
  attributes.aPosition.fill([-1, 1, -1, -1, 1, -1, 1, 1]);
  attributes.aTexCoord.fill([0, 0, 0, 1, 1, 1, 1, 0]);
  uniforms.uVideo.fill(video);
  uniforms.uImage.fill(image);

  function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    uniforms.uVideo.update(video);
    drawElements();
    requestAnimationFrame(render);
  }
  render();

})();