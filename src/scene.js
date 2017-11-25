function drawModel(vertices, normals, colors, angleXX, angleYY, angleZZ, sx, sy, sz, tx, ty, tz, mvMatrix, primitiveType) {
	// The global model transformation is an input
	// Concatenate with the particular model transformations
    // Pay attention to transformation order
	mvMatrix = mult(mvMatrix, translationMatrix(tx, ty, tz));
	mvMatrix = mult(mvMatrix, rotationZZMatrix(angleZZ));
	mvMatrix = mult(mvMatrix, rotationYYMatrix(angleYY));
	mvMatrix = mult(mvMatrix, rotationXXMatrix(angleXX));
	mvMatrix = mult(mvMatrix, scalingMatrix(sx, sy, sz));

	// Passing the Model View Matrix to apply the current transformation
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

    // Multiplying the reflection coefficents
    var ambientProduct = mult(kAmbi, lightSources[0].getAmbIntensity());
    var diffuseProduct = mult(kDiff, lightSources[0].getIntensity());
    var specularProduct = mult(kSpec, lightSources[0].getIntensity());


	// Associating the data to the vertex shader
	initBuffers(vertices, normals, colors);

	// Partial illumonation terms and shininess Phong coefficient
	gl.uniform3fv(gl.getUniformLocation(shaderProgram, "ambientProduct"), flatten(ambientProduct));
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "specularProduct"), flatten(specularProduct));
	gl.uniform1f(gl.getUniformLocation(shaderProgram, "shininess"), nPhong);

	//Position of the Light Source
	gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lightPosition"), flatten(lightSources[0].getPosition()));

    // Position of the viewer
    var posViewer = [0.0, 0.0, 0.0, 1.0];
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "viewerPosition"), flatten(posViewer));

	// primitiveType allows drawing as filled triangles / wireframe / vertices
	if(primitiveType == gl.LINE_LOOP) {
		// To simulate wireframe drawing!
		// No faces are defined! There are no hidden lines!
		// Taking the vertices 3 by 3 and drawing a LINE_LOOP
		for(var i = 0; i < triangleVertexPositionBuffer.numItems / 3; i++) {
			gl.drawArrays(primitiveType, 3 * i, 3);
		}
	} else {
		gl.drawArrays(primitiveType, 0, triangleVertexPositionBuffer.numItems);
	}
}

function drawScene() {
	let floor_v_c = getCheckeredFloor(25,1);
    let frustumSize = 1;
    let frustum = [
        [-frustumSize/2, 0, frustumSize/2],
        [frustumSize/2, 0, frustumSize/2],
        [frustumSize/2, 0, -frustumSize/2],
        [-frustumSize/2, 0, -frustumSize/2],
        [0, 1, 0],
    ];

	let objs = {
		sphere0:{
			vertices: sphere,
			colors: flatten(Array(36864).fill(COLORS.RED.slice(0, 3))),
			normals: [],
			tx: 0,
			ty: 0,
			tz: 0,
			sx: 0.5,
			sy: 0.5,
			sz: 0.5,
			angleXX: 0,
			angleYY: 0,
			angleZZ: 0,
            primitiveType: gl.TRIANGLES
		},
		sphere1:{
			vertices: sphere,
			colors: flatten(Array(36864).fill(COLORS.GREEN.slice(0, 3))),
			normals: [],
			tx: 1,
			ty: 1,
			tz: -5,
			sx: 0.5,
			sy: 0.5,
			sz: 0.5,
			angleXX: 30,
			angleYY: 0,
			angleZZ: 0,
            primitiveType: gl.TRIANGLES
		},
		checkered_floor:
		{
			vertices:floor_v_c["vertices"],
			colors:floor_v_c["colors"],
			normals:[],
			tx:0,
			ty:-10,
			tz:-10,
			sx:1,
			sy:1,
			sz:1,
			angleXX:0,
			angleYY:0,
			angleZZ:0,
			primitiveType: gl.TRIANGLES
		},
        frustum: {
			vertices: [
                ...frustum[0],
                ...frustum[3],
                ...frustum[2],

                ...frustum[0],
                ...frustum[2],
                ...frustum[1],

                ...frustum[1],
                ...frustum[2],
                ...frustum[4],

                ...frustum[2],
                ...frustum[3],
                ...frustum[4],

                ...frustum[3],
                ...frustum[0],
                ...frustum[4],

                ...frustum[0],
                ...frustum[1],
                ...frustum[4]
            ],
			colors: flatten(Array(6*3).fill([0,1,1])),
			normals: [],
			tx: 0,
			ty: 0,
			tz: 2,
			sx: 0.5,
			sy: 0.5,
			sz: 0.5,
			angleXX: 0,
			angleYY: Math.PI * 2.8,
			angleZZ: Math.PI * 1.5,
            primitiveType: gl.LINE_LOOP
        }
	};

	var pMatrix;
	var mvMatrix;
    var globalTz;

	// Clearing the frame-buffer and the depth-buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Computing the Projection Matrix
	if(projectionType == 0) {
		// For now, the default orthogonal view volume
		pMatrix = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);

		// Global transformation
		globalTz = 0.0;

		// TODO: Allow the user to control the size of the view volume
	} else {
		// A standard view volume.
		// Viewer is at (0,0,0)
		// TODO: Ensure that the model is "inside" the view volume
		pMatrix = perspective(100, 1, 0.05, 50);

		// Global transformation
		globalTz = -4.5;
	}

	// Passing the Projection Matrix to apply the current projection
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));

	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	mvMatrix = translationMatrix(0, 0, globalTz);

    for(obj of Object.values(objs)) {
        drawModel(
            obj.vertices,
            computeVertexNormals(obj.vertices),
            obj.colors,
            obj.angleXX, obj.angleYY, obj.angleZZ,
            obj.sx, obj.sy, obj.sz,
            obj.tx, obj.ty, obj.tz,
            mvMatrix,
            obj.primitiveType
        );
    }
}


// dimen: Number of squares  
// size: Dimension of each square
function getCheckeredFloor(dimen,size){

	var coord_square = size/2
	
	//origin at center
	base_vertices = [
		 -coord_square,  0.0,   coord_square,
		 coord_square,  0.0,   coord_square,
		 -coord_square,  0.0,   -coord_square,
		 
		 coord_square,  0.0,  coord_square,
		 coord_square,  0.0,  -coord_square,
		 -coord_square,  0.0, -coord_square,	 		 
	];
	

	let base_color2= repeat([0.0,0.0,0.0], base_vertices.length / 3);
	let base_color1= repeat(COLORS.WHITE.slice(0,3), base_vertices.length / 3);
	

	let vertices = []
	let colors = []
	
	floor_v = -dimen*size / 2;

	for(var i = 0; i < dimen; i++){
		for(var j = 0; j < dimen; j++){

	 		vertices.push(squareAt(base_vertices,[floor_v+j*size,0,floor_v+i*size]))
	 		colors.push((j+i)%2 == 0 ? base_color1 : base_color2);

	 	}

	}

	vertices = flatten(vertices)
	colors = flatten(colors)

	return {

		"vertices": vertices,
		"colors": colors,

	}	
}


function squareAt(m3, v) {
 var retm = []
 for(var i= 0; i < m3.length; i++)
     retm.push(m3[i] + v[i%3]);
 
 return retm;
}

function repeat(arr, n){
  var a = [];
  for (var i=0;i<n;[i++].push.apply(a,arr));
  return a;
}




