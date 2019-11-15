define(['shipModel', 'Mesh', 'Node', 'Camera', "Laser", "CapturedInput", "Line", "Globals"], function( shipModel, Mesh, Node, camera, laser, capturedInput, Line, Globals){

	return {
		create : function()
		{

			var node = new Node();
			node.invert = true; // or the ship rotates strangely
			node.add(new Mesh(shipModel.hull));
			node.add(new Mesh(shipModel.cockpit));
			//shipHull.rotY( Math.PI);
			//shipCockpit.rotY( Math.PI);

			// 0 means retreat
			// 1 means attack
			var attackMode = -1;
			var lastLaserTime = 5000;

			//var shipGuideLines = Line.addGuideLines(30);

			node.animate = function(elapsed) {

				var cpk = capturedInput.currentlyPressedKeys;
		        if (cpk[Globals.LEFT]) {
		            node.lookLeft(0.03);
		        } else if (cpk[Globals.RIGHT]) {
		            node.lookRight(0.03);
		        }
		        if (cpk[Globals.UP]) {
		            node.lookUp(0.03);
		        } else if (cpk[Globals.DOWN]) {
		            node.lookDown(0.03);
		        }
				if( cpk[Globals.U])
				{
					node.moveForward(1);
				}
				if( cpk[Globals.J])
				{
					node.moveBackward(1);
				}
				if( cpk[Globals.H])
				{
					node.moveLeft(1);
				}
				if( cpk[Globals.K])
				{
					node.moveRight(1);
				}
				if( cpk[Globals.G])
				{
					node.lookAt( camera.getPos());
				}
				if( cpk[Globals.V])
				{
					node.lookAt( [0,0,0]);
				}
				if( cpk[Globals.C])
				{
					mat4.set( camera.matrix, node.matrix);
				}
				if( cpk[Globals.B])
				{
					node.slerp( camera, 0.01);
				}
				if( cpk[Globals.Y])
				{
					laser.add( node, -1, -0.6);
					laser.add( node, +1, -0.6);
				}


				lastLaserTime += elapsed;
				var dist = mat4.distSquaredToCamera( this.matrix, camera.matrix);
				//document.getElementById('topLeftDiv').innerText = attackMode+' '+dist;
				if( attackMode == 0)
				{
					if( dist > 100000)
					{
						attackMode = 1;
					} else {
						//mat4.slerpMatrixAwayFromPoint( node.matrix, camera.getPos(), 0.01);
						node.slerp( camera, 0.01, true);
					}

				} else if( attackMode == 1) {
					if( dist < 10000)
					{
						attackMode = 0;
						return;
					}
					// move to attack
					//var cosHalfTheta = mat4.slerpMatrixToPoint( node.matrix, camera.getPos(), 0.01);
					// the closer cosHalfTheta is to 1 the narrower the angle is between the source and target rotation  
					var cosHalfTheta = node.slerp( camera, 0.01, false);
					if( cosHalfTheta > 0.95 && lastLaserTime > 200)
		        	{
						laser.add( node, -7, -1);
						laser.add( node,  7, -1);
						//audioContext.playSound();
						lastLaserTime = 0;
		        	}							
					
				}

				if( attackMode >= 0)
					this.moveForward(1); // TODO: base this on elapsed
				//Line.setGuideLinesToDirectionalVectors(this, shipGuideLines);
			};

			return node;
		}
	};

});
