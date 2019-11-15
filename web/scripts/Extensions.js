define(['glMatrix'], function(glMat){

		window.requestAnimFrame = (function() {
		  return window.requestAnimationFrame ||
				 window.webkitRequestAnimationFrame ||
				 window.mozRequestAnimationFrame ||
				 window.oRequestAnimationFrame ||
				 window.msRequestAnimationFrame ||
				 function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
				   window.setTimeout(callback, 1000/60);
				 };
		})();
		
		// dst and src need to be of type ArrayBuffer
		window.memcpy = function(dst, dstOffset, src, srcOffset, length) {
			if( ! length)
				length = src.byteLength-srcOffset;
			  var dstU8 = new Uint8Array(dst, dstOffset, length);
			  var srcU8 = new Uint8Array(src, srcOffset, length);
			  dstU8.set(srcU8);
		};

		if (typeof String.prototype.startsWith != 'function') {
			  String.prototype.startsWith = function (str){
			    return this.lastIndexOf(str, 0) === 0;
			  };
		}

		var newBack = vec3.create();
		var newUp = vec3.create();
		var newRight = vec3.create();
		mat4.lookAt_alt = function(eye, target, up, dest)
		{
			if (!dest) { dest = mat4.create(); }
			if( ! up)
				up = [0,1,0];
			// vec3.direction goes from argument2 to argument1 and normalizes
			// as we want a back vector, we want from target to this spatial position
			vec3.direction( eye, target, newBack);
			vec3.normalize( vec3.cross(up, newBack, newRight));
			vec3.cross(newBack, newRight, newUp);
			dest[ 0] = newRight[0];
			dest[ 1] = newUp[0];
			dest[ 2] = newBack[0];
			dest[ 3] = 0;
			dest[ 4] = newRight[1];
			dest[ 5] = newUp[1];
			dest[ 6] = newBack[1];
			dest[ 7] = 0;
			dest[ 8] = newRight[2];
			dest[ 9] = newUp[2];
			dest[10] = newBack[2];
			dest[11] = 0;
			dest[15] = 1;
			return dest;
		};

		var currentRotationQ = quat4.create();
		var targetRotationQ = quat4.create();
		var targetRotationM4 = mat4.create();
		
		mat4.slerpMatrixToPoint = function ( mat, point, factor)
		{
			var p = mat4.getPosition( mat);
			mat4.lookAt( point, p, [0,1,0], targetRotationM4);
			return slerpMatrix( mat, factor, p, targetRotationM4);
		};

		mat4.slerpMatrixAwayFromPoint = function ( mat, point, factor)
		{
			var p = mat4.getPosition( mat);
			mat4.lookAt( p, point, [0,1,0], targetRotationM4);
			return slerpMatrix( mat, factor, p, targetRotationM4);
		};

		function slerpMatrix( mat, factor, matPos, targetRotationM4)
		{
			var p = matPos;
			quat4.fromMatrix4( mat, currentRotationQ);
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
			// slerp is fast for larger angles and slow for narrow angles
			 // we can counter this using cosHalfTheta multiplied by the factor 
			 // only works for factors < 0.5
			if( cosHalfTheta < 0.01)
				cosHalfTheta = 0.01;
			quat4.slerp( currentRotationQ, targetRotationQ, factor + (factor)*cosHalfTheta);
			mat4.fromRotationTranslation( currentRotationQ, p, mat);
			return cosHalfTheta;
		}

		mat4.translate_alt = function (mat, vec, factor) {
				factor = factor || 1;
			mat[12] += vec[0]*factor;
			mat[13] += vec[1]*factor;
			mat[14] += vec[2]*factor;
		};

		vec3.distSquared = function (vec, vec2) {
	        var x = vec2[0] - vec[0],
	            y = vec2[1] - vec[1],
	            z = vec2[2] - vec[2];
	            
	        return (x*x + y*y + z*z);
	    };

		mat4.distSquaredToCamera = function (meshMat, cameraMat) {
	        var x = meshMat[12] - cameraMat[12],
	            y = meshMat[13] - cameraMat[13],
	            z = meshMat[14] - cameraMat[14];
	            
	        return (x*x + y*y + z*z);
	    };


        quat4.fromMatrix4a = function(mat, dest) {
        	return quat4.fromRotationMatrix( mat4.toMat3( mat), dest);
        };

        quat4.fromMatrix4 = function(mat, dest) {
	        if (!dest) dest = quat4.create();
	        
	        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
	        // article "Quaternion Calculus and Fast Animation".

	        var fTrace = mat[0] + mat[5] + mat[10];
	        var fRoot;

	        if ( fTrace > 0.0 ) {
	            // |w| > 1/2, may as well choose w > 1/2
	            fRoot = Math.sqrt(fTrace + 1.0);  // 2w
	            dest[3] = 0.5 * fRoot;
	            fRoot = 0.5/fRoot;  // 1/(4w)
	            dest[0] = (mat[9]-mat[6])*fRoot;
	            dest[1] = (mat[2]-mat[8])*fRoot;
	            dest[2] = (mat[4]-mat[1])*fRoot;
	        } else {
	            // |w| <= 1/2
	            var s_iNext = quat4.fromMatrix4.s_iNext = quat4.fromMatrix4.s_iNext || [1,2,0];
	            var i = 0;
	            if ( mat[5] > mat[0] )
	              i = 1;
	            if ( mat[10] > mat[i*4+i] )
	              i = 2;
	            var j = s_iNext[i];
	            var k = s_iNext[j];
	            
	            fRoot = Math.sqrt(mat[i*4+i]-mat[j*4+j]-mat[k*4+k] + 1.0);
	            dest[i] = 0.5 * fRoot;
	            fRoot = 0.5 / fRoot;
	            dest[3] = (mat[k*4+j] - mat[j*4+k]) * fRoot;
	            dest[j] = (mat[j*4+i] + mat[i*4+j]) * fRoot;
	            dest[k] = (mat[k*4+i] + mat[i*4+k]) * fRoot;
	        }
	        
	        return dest;
	    };

        mat4.copyPosition = function (mat, dest, factor) {
        	factor = factor || 1;
	        dest[12] = mat[12] * factor;
	        dest[13] = mat[13] * factor;
	        dest[14] = mat[14] * factor;
	        return dest;
	    };

        mat4.setPosition = function (vec, dest) {
	        dest[12] = vec[0];
	        dest[13] = vec[1];
	        dest[14] = vec[2];
	        return dest;
	    };

        mat4.getPosition = function (mat, dest) {
	        if (!dest) { dest = vec3.create(); }
	        dest[0] = mat[12];
	        dest[1] = mat[13];
	        dest[2] = mat[14];
	        return dest;
	    };


	    // useful for a quaternion based Mesh class in the future
	    quat4.getVector = function (quat, name, dest) {
	        if (!dest) { dest = vec3.create(); }

	        var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
	            x2 = x + x,
	            y2 = y + y,
	            z2 = z + z,

	            xx = x * x2,
	            xy = x * y2,
	            xz = x * z2,
	            yy = y * y2,
	            yz = y * z2,
	            zz = z * z2,
	            wx = w * x2,
	            wy = w * y2,
	            wz = w * z2;

	        if( name == 'dir')
	        {
		        dest[0] = xz - wy;
		        dest[1] = yz + wx;
		        dest[2] = 1 - (xx + yy);
	        }
	        else if( name == 'left')
	        {
		        dest[0] = 1 - (yy + zz);
		        dest[1] = xy - wz;
		        dest[2] = xz + wy;
	        }
	        else if( name == 'up')
	        {
		        dest[0] = xy + wz;
		        dest[1] = 1 - (xx + zz);
		        dest[2] = yz - wx;
	        }

	        return dest;
	    };

});
