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

    const canvas = document.getElementById('root');
    const gl = canvas.getContext('webgl');

    function drawFramebuffer() {

        const vShader = `
    attribute vec3 aPosition;
    void main() {
      gl_Position = vec4(aPosition, 1.0);
    }`;
        const fShader1 = `
    precision mediump float;
    uniform vec3 color;        
    void main(){
      gl_FragColor = vec4(color, 1.0);
    }
        `

        const fShader2 = `
    precision mediump float;
    uniform int id;
    void main() {
      float n = float(id);
      float n1 = fract(n / 16.0);
      n = n / 16.0 - n1;
      float n2 = fract(n / 16.0);
      n = n / 16.0 - n2;
      float n3 = fract(n / 16.0);
      n = n / 16.0 - n3;
      float n4 = fract(n / 16.0);
      gl_FragColor = vec4(n1, n2, n3, n4);
    }`;

        const { program, attributes, uniforms, fillElements, drawArrays, drawElements, createFramebuffer, createElementsBuffer } = compile({
            vShader, fShader: fShader1, gl
        });
        const { program: program2, attributes: attributes2, uniforms: uniforms2, drawElements: drawElements2 } = compile({
            vShader, fShader: fShader2, gl
        })

        fillElements(createElementsBuffer([0, 1, 2]));

        const tr1 = attributes.aPosition.createBuffer([
            -1, 1, 0.5,
            0, -1, -0.5,
            1, 1, 0.5
        ]);
        const tr2 = attributes.aPosition.createBuffer([
            -1, -1, 0.5,
            1, -1, 0.5,
            0, 1, -0.5
        ]);

        gl.clearColor(1.0, 1.0, 1.0, 1.0);

        gl.enable(gl.DEPTH_TEST);

        gl.useProgram(program);

        gl.clear(gl.COLOR_BUFFER_BIT);
        attributes.aPosition.fill(tr1);
        uniforms.color.fill([1.0, 0.0, 0.0]);
        drawElements(3);
        attributes.aPosition.fill(tr2);
        uniforms.color.fill([0.0, 0.0, 1.0]);
        drawElements(3);

        gl.useProgram(program2);

        const size = 300;
        const { framebuffer, colorTarget: renderbuffer } = createFramebuffer(size, size);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.viewport(0, 0, size, size);
        gl.clear(gl.COLOR_BUFFER_BIT);
        attributes2.aPosition.fill(tr1);
        uniforms2.id.fill([65538]);
        drawElements2(3);
        attributes2.aPosition.fill(tr2);
        uniforms2.id.fill([1]);
        drawElements2(3);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        canvas.onclick = function (e) {
            const { offsetX: x, offsetY, y } = e;
            var pixels = new Uint8Array(1 * 1 * 4);
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.readPixels(x, size - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            pixels = [...pixels];
            console.log(pixels);
            pixels = [...pixels].map(n => Math.round(n / 16));
            console.log(pixels);
            pixels = [...pixels].reduceRight((n, item) => n * 16 + item, 0);
            console.log(pixels);
        }
    }

    drawFramebuffer();

})();