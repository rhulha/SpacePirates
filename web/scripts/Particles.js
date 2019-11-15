// CLASS
define(["glMatrix", "GetGL", "TextureCache"], function(glmat, gl, textureCache){

	return function(vertices, texture)
	{
		this.name ="";
		this.type ="particles";
		this.enabled = true;
		// position
		this.x = 0;
		this.y = 0;
		this.z = 0;

		if( typeof(vertices) == "number")
		{
			vertices = new Array(3 * vertices); // multiple of 3
			for( var i=0; i < vertices.length/3; i+=3)
			{
			   vertices[i] = Math.random()*1000-500;
			   vertices[i+1] = Math.random()*1000-500;
			   vertices[i+2] = Math.random()*1000-500;
			}
		}


		this.numItems = vertices.length / 3;
		
		if( typeof(texture) == "string" )
			this.texture = textureCache.get(texture);
		else
			this.texture = texture;

		this.verticesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

		this.mvMatrix = mat4.create();

		this.draw = function(program)
		{
			mat4.set( program.mvMatrix, this.mvMatrix); // copy the mvMatrix, so we don't change the original
			
			//gl.disable(gl.DEPTH_TEST);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

			mat4.translate(this.mvMatrix, [this.x, this.y, this.z]);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
			gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.uniform1i(this.samplerUniform, 0); // how dows this work with "this" ?

			gl.uniformMatrix4fv(program.mvMatrixUniform, false, this.mvMatrix);
			gl.drawArrays(gl.POINTS, 0, this.numItems);
			gl.disable(gl.BLEND);
			gl.enable(gl.DEPTH_TEST);
		};
	};
});
