// Handling the Vertex and the Normals Buffers

function initBuffers() {
	// Vertex Coordinates
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems = vertices.length / 3;

	// Associating to the vertex shader
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// Vertex Normal Vectors
	triangleVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	triangleVertexNormalBuffer.itemSize = 3;
	triangleVertexNormalBuffer.numItems = normals.length / 3;

	// Associating to the vertex shader
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, triangleVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
}
