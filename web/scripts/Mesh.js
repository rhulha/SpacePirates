// CLASS
define(["glMatrix", "GetGL", "TextureCache", "Spatial"], function(glmat, gl, textureCache, Spatial){

	function Mesh(dataObj)
	{
		// execute the super constructor
		Spatial.call(this);

		this.mvMatrix = mat4.create();

		this.name ="";
		this.type ="";
		this.enabled = true;

		// children inheret the parent matrix for its rotation and position
		this.children = [];

		this.setTexture(dataObj.texture);

		this.numItems = dataObj.vertexIndices.length;

		this.verticesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dataObj.vertices), gl.STATIC_DRAW);

		this.textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dataObj.textureCoords), gl.STATIC_DRAW);	
		
		this.vertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dataObj.vertexIndices), gl.STATIC_DRAW);

	}

	var p = Mesh.prototype = Object.create(Spatial.prototype); // new Spatial(false);

	p.add = function(obj) {
		this.children.push(obj);
		return obj;
	};

	// overwrite to animate this object
	p.animate = function(elapsed)
	{

	};

	p.setTexture = function( tex)
	{
		if( typeof(tex) === "string" )
			this.texture = textureCache.get(tex);
		else
			this.texture = tex;
	};

	var tempMat = mat4.create();

	p.draw = function(program, parentMVMatrix)
	{
		mat4.set( parentMVMatrix, this.mvMatrix); // copy the mvMatrix, so we don't change the original

		//mat4.multiply( this.mvMatrix, this.matrix);
		
		mat4.set( this.matrix, tempMat);
		if( this.invert)
		{
			mat4.inverse(tempMat);
			mat4.copyPosition( this.matrix, tempMat);
		}
		mat4.multiply( this.mvMatrix, tempMat);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
		gl.vertexAttribPointer(program.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(program.samplerUniform, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		gl.uniformMatrix4fv(program.mvMatrixUniform, false, this.mvMatrix);
		gl.drawElements(gl.TRIANGLES, this.numItems, gl.UNSIGNED_SHORT, 0);

		for (var i = 0; i < this.children.length; i++)
		{
			this.children[i].draw( program, this.mvMatrix);
		}
	};

	return Mesh;

});
