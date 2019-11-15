// CLASS
define(["glMatrix", "Spatial"], function(glmat, Spatial){

	// a Node is a Spatial without Mesh data
	function Node(child)
	{
		Spatial.call(this);
		this.name ="";
		this.type ="";
		this.enabled = true;
		this.invert = false;

		this.mvMatrix = mat4.create();

		// children inheret the parent matrix for its rotation and position
		this.children = [];

		if( child)
			this.children.push(child);
	}
	var p = Node.prototype = Object.create(Spatial.prototype); 

	p.add = function(obj) {
		this.children.push(obj);
		return obj;
	};

	// overwrite to animate this object
	p.animate = function(elapsed)
	{

	};
	
	var tempMat = mat4.create();

	p.draw = function(program, parentMVMatrix)
	{
		mat4.set( parentMVMatrix, this.mvMatrix); // copy the mvMatrix, so we don't change the original
		// funky stuff going on below, I don't know why it is needed, but otherwise ship rotation is wrong
		// found this code by trial and error
		mat4.set( this.matrix, tempMat);
		if( this.invert)
		{
			mat4.inverse(tempMat);
			mat4.copyPosition( this.matrix, tempMat);
		}
		mat4.multiply( this.mvMatrix, tempMat);

		for (var i = 0; i < this.children.length; i++)
		{
			this.children[i].draw( program, this.mvMatrix);
		}
	};
	return Node;

});
