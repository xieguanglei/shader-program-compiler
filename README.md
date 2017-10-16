# Shader Program Compiler

When I play with webgl shader, I'm so tired of writing webgl native APIs( compileShader/) again and again. This project is generally a simple tool wrap the webgl APIs up.

## Install

```
$ npm install shader-program-compiler
```

You need import it and include in your own build progress (using Webpack, e.g).

## Usage

```
import {compile} from 'shader-program-compiler';

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

const gl = document.getElementById('your_canvas').getContext('webgl');

const { useProgram, attributes, uniforms, fillElements, drawElements } = compile({
  vShader, fShader, gl
});

useProgram();
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
```