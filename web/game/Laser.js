// SINGLETON
define(["Mesh", "RaysWebGL", "RaysUtils", "CapturedInput", "Camera", "Node", "PickRay", "Globals", "WebSocket"],
		function(Mesh, raysWebGL, raysUtils, capturedInput, camera, Node, pickRay, Globals, webSocket){

	return {
		add : function( spatial, moveLeft, moveUp)
	    {
			var laserNode;
			var found = false;
			var objects = raysWebGL.programNormal.objects;

			for (var i = 0; i < objects.length; i++)
			{
				laserNode = objects[i];
				if( "laser" === laserNode.type && laserNode.enabled === false)
				{
					found = true;
					break;
				}
			}

			if( found === true)
			{
				//console.log("laser found in cache");
				laserNode.enabled=true;
				mat4.identity( laserNode.matrix);
			} else {
				//console.log("laser cache miss");
				var cylDataObj = raysUtils.createCylinder( 0.1, Globals.LASER_LENGTH*2, 20);
				cylDataObj.texture = "red";
				var laserMesh = new Mesh( cylDataObj);
				mat4.rotate( laserMesh.matrix, 0.5*Math.PI, laserMesh.getRight()); // point the cylinder forward
				laserNode = new Node( laserMesh);
				laserNode.type = "laser";
				laserNode.invert = true;
			}

			mat4.set( spatial.matrix, laserNode.matrix);
			laserNode.moveLeft( moveLeft);
			laserNode.moveUp( moveUp);

			if( spatial.type === "camera")
			{
				// shoot the laser to where the mouse is pointing (like FreeLancer)
				laserNode.lookUp(capturedInput.mouseY*0.0012);
				laserNode.lookLeft(-capturedInput.mouseX*0.0009);
			} else {
				// make the laser lookAt the player ship !
				laserNode.moveForward( 1);
				laserNode.lookAt( camera, spatial.getUp());
			}


			var boxCorner1 = vec3.create();
			var boxCorner2 = vec3.create();
			var lineStart = vec3.create();
			var lineEnd = vec3.create();
			var Hit = vec3.create();
			
			laserNode.lifeTime = 10 * 1000; // 10 secs
			laserNode.animate = function(elapsed) {
				this.lifeTime -= elapsed;
				if( this.lifeTime < 0 )
				{
					this.enabled = false;
					return;
				}
				this.moveForward( (elapsed/2.0));
				
				vec3.set( this.getPos(), lineStart);
				vec3.set( this.getPos(), lineEnd);
				var back = this.getBack();
				vec3.scale(back, Globals.LASER_LENGTH);
				vec3.add( lineStart, back);
				vec3.subtract( lineEnd, back);

				var found = false;
	        	var currentDistance=1000;
	        	var currentBlock = null;

	        	for (var i = 0; i < objects.length; i++)
				{
					var object = objects[i];
					if( "block" === object.type && object.enabled === true)
					{
						vec3.set( object.getPos(), boxCorner1);
						vec3.set( object.getPos(), boxCorner2);
						boxCorner1[0] -= 1;
						boxCorner1[1] -= 1;
						boxCorner1[2] -= 1;
						boxCorner2[0] += 1;
						boxCorner2[1] += 1;
						boxCorner2[2] += 1;
						var hitSide = pickRay.checkLineBox( boxCorner1, boxCorner2, lineStart, lineEnd, Hit);
						if( hitSide > 0)
						{
							console.log( hitSide + ' ' + vec3.str( Hit));
							var d = vec3.dist(  lineStart, Hit);
							if( d < currentDistance )
							{
								currentDistance = d;
								currentBlock = object;
				        	}
							found = true;
						}
					}
				}
	        	
		        if(found)
				{
		        	currentBlock.enabled = false;
		        	webSocket.send("-block:"+currentBlock.matrix[Globals.POSX]+','+currentBlock.matrix[Globals.POSY]+','+currentBlock.matrix[Globals.POSZ]);
		        	this.lifeTime = 0;
				}
					
			};

			if( found !== true)
				raysWebGL.programNormal.add(laserNode);
	    }
	};
});
