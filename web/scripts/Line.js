// CLASS
define(["glMatrix", "GetGL", "Spatial", "RaysWebGL"], function(glmat, gl, Spatial, raysWebGL){

	function Line( vertices, vertexColors)
	{
		Spatial.call( this);
		this.name ="";
		this.type ="";
		this.enabled = true;

		this.mvMatrix = mat4.create();

		// children inheret the parent matrix for its rotation and position
		this.children = [];

		this.numItems = vertices.length / 3;

		this.verticesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		this.setVertices( vertices);

		this.vertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);	

	}

	var p = Line.prototype = Object.create(Spatial.prototype); 

	p.add = function(obj) {
		this.children.push(obj);
		return obj;
	};

	p.setVertices = function( verts)
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
	};


	// overwrite to animate this object
	p.animate = function(elapsed)
	{

	};
	
	p.draw = function(program, parentMVMatrix)
	{
		mat4.set( parentMVMatrix, this.mvMatrix); // copy the mvMatrix, so we don't change the original

		mat4.multiply( this.mvMatrix, this.matrix);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
		gl.vertexAttribPointer(program.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

		gl.uniformMatrix4fv(program.mvMatrixUniform, false, this.mvMatrix);
		
		gl.drawArrays(gl.LINES, 0, this.numItems);

		for (var i = 0; i < this.children.length; i++)
		{
			this.children[i].draw( program, this.mvMatrix);
		}
	};

	Line.addGuideLines = function(length)
	{
		return {
			length : length,
			right : raysWebGL.programColor.add( new Line([0,0,0,length,0,0], [1,1,0,1, 0,1,0,1])), // GREEN
			up    : raysWebGL.programColor.add( new Line([0,0,0,0,length,0], [1,1,0,1, 1,0,0,1])), // RED
			back  : raysWebGL.programColor.add( new Line([0,0,0,0,0,length], [1,1,0,1, 0,0,1,1]))  // BLUE
		};
	};

	Line.setGuideLinesToDirectionalVectors = function( spatial, guideLines)
	{
		if( ! guideLines)
			guideLines = Line.addGuideLines( 30);
	    var pos = spatial.getPos();
		var x = pos[0], y = pos[1], z = pos[2];
		var back = spatial.getBack();
		vec3.scale( back, guideLines.length);
		guideLines.back.setVertices([x, y, z, x + back[0], y + back[1], z + back[2] ]);

		var right = spatial.getRight();
		vec3.scale( right, guideLines.length);
		guideLines.right.setVertices([x, y, z, x + right[0], y + right[1], z + right[2] ]);

		var up = spatial.getUp();
		vec3.scale( up, guideLines.length);
		guideLines.up.setVertices([x, y, z, x + up[0], y + up[1], z + up[2] ]);
	};


	return Line;

});
