import { compile } from '../src/index';

const vShader = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0, 1);
}`;
const fShader = `
precision mediump float;
uniform vec3 uColor[2];
uniform int uType[2];
void main() {
  if(uType[1] == 2){
    gl_FragColor = vec4(uColor[0].yz, uColor[1].y, 1.0);    
  }else{
    gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
  }
}`;

const gl = document.getElementById('root').getContext('webgl');

const { useProgram, attributes, uniforms, fillElements, drawElements } = compile({
  vShader, fShader, gl
});

useProgram();
fillElements([0, 1, 2]);
attributes.aPosition.fill([0.4, 0.5, 0.5, -0.8, -0.5, -0.2]);
uniforms.uColor.fill([0.0, 0.0, 0.9, 0.9, 0.0, 0.0]);
uniforms.uType.fill([1, 2]);

function render() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawElements();
}
render();