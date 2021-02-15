"use strict";

var canvas;
var gl;

var positions = [];

var numTimesToSubdivide = 5;
var angleDegrees = 60;
var angleRadians = angleDegrees * Math.PI / 180;
var r1 = Math.sin(angleRadians);
var c1 = Math.cos(angleRadians);


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) { alert("WebGL 2.0 isn't available"); }


    var vertices = [
        vec2(-0.5, -0.5),
        vec2(0, 0.5),
        vec2(0.5, -0.5)
    ];

    //triangle(vertices[0], vertices[1], vertices[2])
    koch_flake(vertices[0], vertices[1], vertices[2], numTimesToSubdivide);


    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    render();
};

function triangle(a, b, c) {
    positions.push(a, b, c);
}
function koch_flake(a, b, c, count) {
    divideLine(a, b, count);
    divideLine(b, c, count);
    divideLine(c, a, count);
}
function divideLine(a, b, count) {
    // check for end of recursion

    if (count === 0) {
        var left;//c
        var right;//p
        left = mix(a, b, 1 / 3);
        right = mix(a, b, 2 / 3);
        var x1 = (right[0] - left[0]) * c1 - (right[1] - left[1]) * r1 + left[0];
        var y1 = (right[0] - left[0]) * r1 + (right[1] - left[1]) * c1 + left[1];
        var final = vec2(x1,y1);
        positions.push(a, left);
        positions.push(left, final);
        positions.push(final, right);
        positions.push(right, b);

    }
    else {

        //bisect the sides

        var ab = mix(a, b, 0.3333); //left
        var ba = mix(b, a, 0.3333); //right
        var x2 = (ba[0] - ab[0]) * c1 - (ba[1] - ab[1]) * r1 + ab[0];
        var y2 = (ba[0] - ab[0]) * r1 + (ba[1] - ab[1]) * c1 + ab[1];

        var final1 = vec2(x2, y2);
        --count;

        divideLine(a, ab, count);
        divideLine(ba, b, count);
        divideLine(ab, final1, count);
        divideLine(final1, ba, count);
    }
    return final;
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, positions.length);
}
