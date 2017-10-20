function compile({ vShader, fShader, gl }) {

    function createShaderProgram(vShaderSource, fShaderSource, gl) {

        function loadShader(gl, type, source) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                throw 'An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader);
            }
            return shader;
        }

        const fShader = loadShader(gl, gl.FRAGMENT_SHADER, fShaderSource);
        const vShader = loadShader(gl, gl.VERTEX_SHADER, vShaderSource);

        const program = gl.createProgram();
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw 'Unable to initialize the shader program: ' + gl.getProgramInfoLog(program);
        }

        const uniforms = [];
        const attributes = [];

        const attributeCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        for (let i = 0; i < attributeCount; i++) {
            const attribute = gl.getActiveAttrib(program, i);
            attributes.push(attribute);
        }
        const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            const uniform = gl.getActiveUniform(program, i);
            uniforms.push(uniform);
        }

        return {
            program: program,
            uniforms, attributes
        };
    }

    function getType(value, gl) {
        const types = [
            'FLOAT', 'FLOAT_VEC2', 'FLOAT_VEC3', 'FLOAT_VEC4', 'FLOAT_MAT2', 'FLOAT_MAT3', 'FLOAT_MAT4',
            'INT', 'INT_VEC2', 'INT_VEC3', 'INT_VEC4',
            'BOOL', 'BOOL_VEC2', 'BOOL_VEC3', 'BOOL_VEC4',
            'SAMPLER_2D', 'SAMPLER_CUBE'
        ];

        for (let i = 0; i < types.length; i++) {
            if (gl[types[i]] === value) {
                return types[i]
            }
        }

        throw 'get type failed ' + value;
    }

    function attributeManager(attribute, program, gl) {
        const manager = {};
        const type = getType(attribute.type, gl);
        const position = gl.getAttribLocation(program, attribute.name);

        const baseType = type.split('_')[0];
        const vecType = type.split('_').length > 1 ? type.split('_')[1] : 'VEC1';
        const vecSize = Number(vecType[3]);

        const arrayTypeMap = {
            'FLOAT': Float32Array,
            'INT': Int16Array,
            'BOOL': Uint8Array
        }
        const ArrayType = arrayTypeMap[baseType];

        manager.fill = function (data) {
            const length = data.length / vecSize;
            if (length - Math.floor(length) !== 0) {
                throw new Error(`attribute ${attribute.name}'s length invalid, expect times of ${vecSize} but ${data.length}`)
            }

            if (attributeLength) {
                if (attributeLength === data.length / vecSize) {
                    // ok, do nothing
                } else {
                    throw new Error(`attribute ${attribute.name}'s length invalid, expect ${attributeLength} but ${data.length}`);
                }
            } else {
                attributeLength = data.length / vecSize;
            }

            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new ArrayType(data), gl.STATIC_DRAW);
            gl.vertexAttribPointer(position, vecSize, gl[baseType], false, 0, 0);
            gl.enableVertexAttribArray(position);
        }

        return {
            type, ...manager
        }
    }

    function uniformManager(uniform, program, gl) {
        const manager = {};
        const type = getType(uniform.type, gl);
        const position = gl.getUniformLocation(program, uniform.name);

        const baseType = type.split('_')[0];
        const vecType = type.split('_').length > 1 ? type.split('_')[1] : 'VEC1';
        const baseVecType = vecType.substr(0, 3);
        const vecSize = Number(vecType[3]);

        const arrayTypeMap = {
            'FLOAT': Float32Array,
            'INT': Int16Array,
            'BOOL': Uint8Array
        }
        const ArrayType = arrayTypeMap[baseType];

        let uniformMethodName;
        switch (baseVecType) {
            case 'VEC':
                uniformMethodName = ['uniform', vecSize, baseType === 'FLOAT' ? 'f' : 'i', 'v'].join('');
                manager.fill = function (data) {
                    gl[uniformMethodName](position, new ArrayType(data));
                }
                break;
            case 'MAT':
                uniformMethodName = ['uniform', 'Matrix', vecSize, 'fv'].join('');
                manager.fill = function (data) {
                    gl[uniformMethodName](position, false, new ArrayType(data));
                }
                break;
            case '2D': {
                const textureUnitIndex = textureCount;
                const textureUnitName = `TEXTURE${textureUnitIndex}`;
                if (textureCount === maxTextureImageUnits) {
                    throw 'texture size exceed max texture image units';
                } else {
                    textureCount++;
                }

                uniformMethodName = ['uniform', '1', 'i'].join('');
                const texture = gl.createTexture();
                manager.fill = function (image) {
                    gl.activeTexture(gl[textureUnitName]);
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    gl.uniform1i(position, textureUnitIndex);
                }
                manager.update = function (image) {
                    gl.activeTexture(gl[textureUnitName]);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                }
                break;
            }
            default:
                throw 'baseVecType invalid';
        }

        return { type, ...manager }
    }

    let attributeLength, elementLength, textureCount = 0;
    const maxTextureImageUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

    const { program, attributes: attributeList, uniforms: uniformList } = createShaderProgram(vShader, fShader, gl);

    const attributes = {};
    const uniforms = {};
    attributeList.forEach(function (attribute) {
        attributes[attribute.name] = attributeManager(attribute, program, gl);
    });
    uniformList.forEach(function (uniform) {
        uniforms[uniform.name] = uniformManager(uniform, program, gl);
    });

    return {
        program, uniforms, attributes,
        useProgram: function () {
            gl.useProgram(program);
        },
        drawArrays: function () {
            gl.drawArrays(gl.TRIANGLES, 0, attributeLength);
        },
        drawElements: function () {
            gl.drawElements(gl.TRIANGLES, elementLength, gl.UNSIGNED_SHORT, 0);
        },
        fillElements: function (data) {
            elementLength = data.length;
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
            return buffer;
        }
    };
}

export { compile };