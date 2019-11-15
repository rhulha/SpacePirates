// A spatial in this context shall mean an object that encapsulates a 4 dimensional matrix designating position and rotation
// It is designed to be inherited from Camera and Mesh and Node etc.
// SINGLETON

define(["glMatrix"],function(glmat)
{

	function Spatial()
	{
		// position and rotation
		// the idea to use a matrix4 for this might be problematic, as the values degenerate over time. Might be better to use Quaternions anyways
		// regular lookAt calls could "repair" the matrix
		this.matrix = mat4.identity();

		// temp variables to avoid creating new objects:
		this.pos = vec3.create();
		this.back = vec3.create();
		this.up = vec3.create();
		this.right = vec3.create();

	}

	var p = Spatial.prototype;

	var currentRotationQ = quat4.create();
	var targetRotationQ = quat4.create();
	var targetRotationM4 = mat4.create();

	p.lookAt=function( target, up)
	{
		if( ! up)
			up = [0,1,0];
		if( target.matrix)
			target = target.getPos();
		mat4.lookAt_alt( this.getPos(), target, up, this.matrix);
	};

	p.slerp=function( targetSpatial, factor, away)
	{
		var from = this.getPos();
		var to = targetSpatial.getPos();
		if( away )
		{
			from = targetSpatial.getPos();
			to = this.getPos();
		}
		mat4.lookAt_alt( from, to, targetSpatial.getUp(), targetRotationM4);
		quat4.fromMatrix4( this.matrix, currentRotationQ);
		quat4.fromMatrix4( targetRotationM4, targetRotationQ);
		quat4.normalize(currentRotationQ);
		quat4.normalize(targetRotationQ);
		quat4.conjugate(currentRotationQ);
		quat4.conjugate(targetRotationQ);

		var cosHalfTheta = quat4.dot( currentRotationQ, targetRotationQ);
        // cosHalfTheta is < 0 when the angle between the two quats is bigger than 180 degrees
        if( cosHalfTheta < 0 )
        {
            // we then turn the quat4 180 degrees around by negating it
            // so we always slerp the shortest possible route
            quat4.scale(targetRotationQ, -1);
        }

		cosHalfTheta = quat4.dot( currentRotationQ, targetRotationQ);
		// slerp with updated start rotation is fast for larger angles and slow for narrow angles
		 // we can counter this using cosHalfTheta multiplied by the factor 
		 // only works for factors < 0.5
		if( cosHalfTheta < 0.01)
			cosHalfTheta = 0.01;
		quat4.slerp( currentRotationQ, targetRotationQ, factor + (factor)*cosHalfTheta);
		mat4.fromRotationTranslation( currentRotationQ, this.getPos(), this.matrix);
		return cosHalfTheta;
	};

	p.translate=function( vec)
	{
		mat4.translate_alt( this.matrix, vec);
	};

	// return ReadOnly vec3
	p.getPos=function()
	{
		this.pos[0] = this.matrix[12];
		this.pos[1] = this.matrix[13];
		this.pos[2] = this.matrix[14];
		return this.pos;
	};

	p.setPos = function(vec)
	{
		if( arguments.length == 3)
		{
			vec = Array.prototype.slice.apply(arguments);
		}
		this.matrix[12] = vec[0];
		this.matrix[13] = vec[1];
		this.matrix[14] = vec[2];
		return this;
	};

	// get the values from column 2. They represent the trail direction of this matrx
	// return ReadOnly vec3
	p.getBack = function()
	{
		var mat = this.matrix;
		this.back[0] = mat[2],
		this.back[1] = mat[6],
		this.back[2] = mat[10];
		return this.back;
	};

	// get the values from column 1. They represent the up vector of this matrx
	// return ReadOnly vec3
	p.getUp = function()
	{
		var mat = this.matrix;
		this.up[0] = mat[1],
		this.up[1] = mat[5],
		this.up[2] = mat[9];
		return this.up;
	};

	// get the values from column 0. They represent the right vector of this matrx
	// return ReadOnly vec3
	p.getRight = function()
	{
		var mat = this.matrix;
		this.right[0] = mat[0],
		this.right[1] = mat[4],
		this.right[2] = mat[8];
		return this.right;
	};

	p.moveForward = function(amount)
	{
		this.moveBackward(-amount);
	};

	p.moveBackward = function(amount)
	{
		var back = this.getBack();
		vec3.scale(back, amount);
		this.translate( back);
	};

	p.moveUp = function(amount)
	{
		var up = this.getUp();
		vec3.scale(up, amount);
		this.translate( up);
	};

	p.moveLeft = function(amount)
	{
		this.moveRight(-amount);
	};

	p.moveRight = function(amount)
	{
		var right = this.getRight();
		vec3.scale( right, amount);
		this.translate( right);
	};

	p.rotX = function(angle)
	{
		mat4.rotateX(this.matrix, angle);
	};
	p.rotY = function(angle)
	{
		mat4.rotateY(this.matrix, angle);
	};
	p.rotZ = function(angle)
	{
		mat4.rotateZ(this.matrix, angle);
	};

	p.lookUp = function(amount)
	{
		mat4.rotate( this.matrix, -amount, this.getRight());
	};
	p.lookDown = function(amount)
	{
		mat4.rotate( this.matrix, amount, this.getRight());
	};
	p.rollLeft = function(amount)
	{
		mat4.rotate( this.matrix, -amount, this.getBack());
	};
	p.rollRight = function(amount)
	{
		mat4.rotate( this.matrix, amount, this.getBack());
	};
	p.lookLeft = function(amount)
	{
		mat4.rotate( this.matrix, -amount, this.getUp());
	};
	p.lookRight = function(amount)
	{
		mat4.rotate( this.matrix, amount, this.getUp());
	};
	p.resetRotation = function()
	{
		var dest = this.matrix;
        dest[0] = 1;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = 1;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = 0;
        dest[9] = 0;
        dest[10] = 1;
        dest[11] = 0;
	};

	return Spatial;
   
});

