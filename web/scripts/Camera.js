// A camera for a FPS space ship
// keep in mind, that the matrix used here is inverted, as we need to do the opposite movements and translations to objects to place them correctly.
// SINGLETON
define(["glMatrix", "Spatial"],function(glmat, Spatial)
{
   function Camera()
   {
   		Spatial.call(this);
   		this.tempMatrix = mat4.create();
   		this.type ="camera";
         console.log('Camera created');
   }
   
   var p = Camera.prototype = Object.create(Spatial.prototype);

   p.getMVMatrix = function(mat, translate)
   {
		for( var i = 0; i<16; i++)
		{
			this.tempMatrix[i] = this.matrix[i] * ( i < 12 ? 1 : -1);
		}
		//mat4.inverse( this.matrix, );
		mat4.toRotationMat( this.tempMatrix, mat);
		if( translate) {

			if( false)
			{
				mat[12] = this.matrix[12];
				mat[13] = this.matrix[13];
				mat[14] = this.matrix[14];
				mat[15] = this.matrix[15];
			} else {
				mat4.translate( mat, [this.tempMatrix[12], this.tempMatrix[13], this.tempMatrix[14]]);
			}

		}
      return mat;
   };

   return new Camera();
   
   
});

