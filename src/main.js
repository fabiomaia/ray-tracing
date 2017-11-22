var gl = null;
var shaderProgram = null;
var triangleVertexPositionBuffer = null;
var triangleVertexColorBuffer = null;

// The GLOBAL transformation parameters

var globalAngleYY = 0.0;
var globalTz = 0.0;

// The local transformation parameters

// The translation vector

var tx = 0.0;
var ty = 0.0;
var tz = 0.0;

// The rotation angles in degrees

var angleXX = 0.0;
var angleYY = 0.0;
var angleZZ = 0.0;

// The scaling factors

var sx = 0.5;
var sy = 0.5;
var sz = 0.5;

// GLOBAL Animation controls

var globalRotationYY_ON = 1;
var globalRotationYY_DIR = 1;
var globalRotationYY_SPEED = 1;

// Local Animation controls

var rotationXX_ON = 1;
var rotationXX_DIR = 1;
var rotationXX_SPEED = 1;
var rotationYY_ON = 1;
var rotationYY_DIR = 1;
var rotationYY_SPEED = 1;
var rotationZZ_ON = 1;
var rotationZZ_DIR = 1;
var rotationZZ_SPEED = 1;

// To allow choosing the way of drawing the model triangles
var primitiveType = null;

// To allow choosing the projection type
var projectionType = 0;

// Initial model has just ONE TRIANGLE
var vertices = [
		// FRONTAL TRIANGLE
		-0.5, -0.5,  0.5,
		 0.5, -0.5,  0.5,
		 0.5,  0.5,  0.5,
];

var normals = [
		// FRONTAL TRIANGLE
		 0.0,  0.0,  1.0,
		 0.0,  0.0,  1.0,
		 0.0,  0.0,  1.0,
];

// Initial color values just for testing!!
var colors = [
		 // FRONTAL TRIANGLE
		 1.00,  0.00,  0.00,
		 1.00,  0.00,  0.00,
		 1.00,  0.00,  0.00,
];

// Handling the Vertex and the Color Buffers

function initBuffers() {
	// Coordinates
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems = vertices.length / 3;

	// Associating to the vertex shader
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// Colors
	triangleVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	triangleVertexColorBuffer.itemSize = 3;
	triangleVertexColorBuffer.numItems = colors.length / 3;

	// Associating to the vertex shader
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
}

function drawModel(angleXX, angleYY, angleZZ, sx, sy, sz, tx, ty, tz, mvMatrix, primitiveType) {
	// The the global model transformation is an input
	// Concatenate with the particular model transformations
    // Pay attention to transformation order !!
	mvMatrix = mult(mvMatrix, translationMatrix(tx, ty, tz));
	mvMatrix = mult(mvMatrix, rotationZZMatrix(angleZZ ));
	mvMatrix = mult(mvMatrix, rotationYYMatrix(angleYY ));
	mvMatrix = mult(mvMatrix, rotationXXMatrix(angleXX ));
	mvMatrix = mult(mvMatrix, scalingMatrix(sx, sy, sz ));

	// Passing the Model View Matrix to apply the current transformation
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

	// NEW - Aux. Function for computing the illumination
	computeIllumination(mvMatrix);

	// Associating the data to the vertex shader
	// TODO: This can be done in a better way !!
	initBuffers();

	// Drawing
	// primitiveType allows drawing as filled triangles / wireframe / vertices
	if(primitiveType == gl.LINE_LOOP) {
		// To simulate wireframe drawing!
		// No faces are defined! There are no hidden lines!
		// Taking the vertices 3 by 3 and drawing a LINE_LOOP
		for(var i = 0; i < triangleVertexPositionBuffer.numItems / 3; i++) {
			gl.drawArrays( primitiveType, 3 * i, 3 );
		}
	} else {
		gl.drawArrays(primitiveType, 0, triangleVertexPositionBuffer.numItems);
	}
}

// Animation --- Updating transformation parameters

var lastTime = 0;

function animate() {
	var timeNow = new Date().getTime();

	if(lastTime != 0) {
		var elapsed = timeNow - lastTime;
		// Global rotation
		if(globalRotationYY_ON ) {
			globalAngleYY += globalRotationYY_DIR * globalRotationYY_SPEED * (90 * elapsed) / 1000.0;
	    }

		// Local rotations
		if(rotationXX_ON) {
			angleXX += rotationXX_DIR * rotationXX_SPEED * (90 * elapsed) / 1000.0;
	    }

		if(rotationYY_ON) {
			angleYY += rotationYY_DIR * rotationYY_SPEED * (90 * elapsed) / 1000.0;
	    }

		if(rotationZZ_ON) {
			angleZZ += rotationZZ_DIR * rotationZZ_SPEED * (90 * elapsed) / 1000.0;
	    }

		// Rotating the light sources
		for(var i = 0; i < lightSources.length; i++ ) {
			if(lightSources[i].isRotYYOn()) {
				var angle = lightSources[i].getRotAngleYY() + lightSources[i].getRotationSpeed() * (90 * elapsed) / 1000.0;
				lightSources[i].setRotAngleYY( angle );
			}
		}
	}
	lastTime = timeNow;
}

function tick() {
    requestAnimationFrame(tick);

    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	drawScene();
	animate();
}

function initWebGL( canvas ) {
	try {
		gl = canvas.getContext("webgl2");

        var color = [Math.random(), Math.random(), Math.random(), 1];
        gl.clearColor(...color);

		primitiveType = gl.TRIANGLES;

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.enable(gl.DEPTH_TEST);
	} catch (e) { }

	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}
}

function runWebGL() {
	var canvas = document.getElementById("canvas");
	initWebGL(canvas);
	shaderProgram = initShaders(gl);
	initBuffers();
	tick();
}

