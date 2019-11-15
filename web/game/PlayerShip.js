define(["CapturedInput", "Camera", "Laser", "AudioContext", "Line", "Globals", "RaysUtils", "RaysWebGL", "Mesh", "PickRay", "GetCanvas", "WebSocket"], 
		function(capturedInput, camera, laser, audioContext, Line, Globals, raysUtils, raysWebGL, Mesh, pickRay, canvas, webSocket){

	return function()
	{

		this.momentum = vec3.create();
		this.lastLaserTime = 5000;

		function printMatrix(mat) {
		    var c, r, t;
		    t = document.createElement('table');
		    t.setAttribute('border', '1');
		    t.setAttribute('cellspacing', '0');
			for( var i=0;i<4;i++)
			{
			    r = t.insertRow(-1); 
				for( var j=0;j<4;j++)
				{
				    c = r.insertCell(-1);
				    c.innerHTML = ''+mat[i*4+j].toFixed(2);
				}
			}
			var tld = document.getElementById('topLeftDiv');
			if( tld.firstChild !== null)
			    tld.replaceChild( t, tld.firstChild);
			else
			    tld.appendChild( t);
		}

		var lineStart = vec3.create();
		var lineEnd = vec3.create();
		var viewport = vec4.create();
		var tempMVMat = mat4.create();
		var boxCorner1 = vec3.create();
		var boxCorner2 = vec3.create();
		var Hit = vec3.create();

		this.animate = function(elapsed) {

			//printMatrix( camera.matrix);
			var cpk = capturedInput.currentlyPressedKeys;
			var cpmb = capturedInput.currentlyPressedMouseButtons;

	       	this.lastLaserTime += elapsed;
	        if (cpmb['left']) {
	        	if( this.lastLaserTime > 200)
	        	{
					laser.add( camera, -1, -0.6);
					laser.add( camera, +1, -0.6);
					//audioContext.playSound();
					this.lastLaserTime = 0;	
	        	}
	        }

	        if (cpmb['right']) {
	        	// add a building block, if we hit a block with a pick ray, build a block next to it.

	        	viewport[2] = canvas.width;
	        	viewport[3] = canvas.height;
	        	camera.getMVMatrix(tempMVMat, true);

		        lineStart[0] = lineEnd[0] = capturedInput.clientX;
		        lineStart[1] = lineEnd[1] = capturedInput.clientY;
		        lineStart[2] = 0;
		        lineEnd[2] = 0.999;
		        // make a line from mouse click into space (around 10 meters).
		        vec3.unproject( lineStart, tempMVMat, raysWebGL.pMatrix, viewport);
		        vec3.unproject( lineEnd, tempMVMat, raysWebGL.pMatrix, viewport);

		        //raysUtils.addLine( lineStart, lineEnd);

	        	var objects = raysWebGL.programNormal.objects;
	        	var found = false;
	        	var currentDistance=1000;
	        	var currentBlock = null;
	        	var currentSide = null;
	        	var currentHit = vec3.create();
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
								currentSide = hitSide;
								vec3.set( Hit, currentHit);
				        	}
							found = true;
						}
					}
				}

	        	var cube = raysUtils.createCube();
	        	cube.texture = "textures/block.jpg";
	        	var cubeMesh = new Mesh(cube);
	        	cubeMesh.type = "block";

		        if( ! found)
				{
		        	lineEnd[0] = capturedInput.clientX;
			        lineEnd[1] = capturedInput.clientY;
			        lineEnd[2] = 0.996;
			        vec3.unproject( lineEnd, tempMVMat, raysWebGL.pMatrix, viewport);
			        cubeMesh.setPos( lineEnd);
		        	cubeMesh.matrix[Globals.POSX] -= cubeMesh.matrix[Globals.POSX] % 2;
		        	cubeMesh.matrix[Globals.POSY] -= cubeMesh.matrix[Globals.POSY] % 2;
		        	cubeMesh.matrix[Globals.POSZ] -= cubeMesh.matrix[Globals.POSZ] % 2;
				} else {

					//raysUtils.addParticles( currentHit );

	        		cubeMesh.setPos( currentBlock.getPos());
	        		switch( currentSide)
	        		{
						case 1:cubeMesh.translate([-2,0,0]);break; // LEFT
						case 2:cubeMesh.translate([0,-2,0]);break; // BOTTOM
						case 3:cubeMesh.translate([0,0,-2]);break; // FRONT
						case 4:cubeMesh.translate([2,0,0]);break;  // RIGHT
						case 5:cubeMesh.translate([0,2,0]);break;  // TOP
						case 6:cubeMesh.translate([0,0,2]);break; // BACK
	        		}
				}
	        	raysWebGL.programNormal.add(cubeMesh);
	        	webSocket.send( '+block:'+cubeMesh.matrix[Globals.POSX]+','+cubeMesh.matrix[Globals.POSY]+','+cubeMesh.matrix[Globals.POSZ] );
	        	cpmb['right'] = false;
	        }

	        // http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
	        if (cpk[Globals.A]) {
	            this.moveLeft(0.03);
	        } else if (cpk[Globals.D]) {
	            this.moveRight(0.03);
	        }
	        if (cpk[Globals.W]) {
	            this.moveForward(0.03);
	        } else if (cpk[Globals.S]) {
	            this.moveBackward(0.03);
	        }
	        if (cpk[Globals.SHIFT]) {
	        	this.moveUp(0.03);
	        }
	        if (cpk[Globals.F]) {
	        	this.moveDown(0.03);
	        }
	        if (cpk[Globals.LEFT]) {
	            //camera.lookLeft(0.03);
	        } else if (cpk[Globals.RIGHT]) {
	            //camera.lookRight(0.03);
	        }
	        if (cpk[Globals.UP]) {
	            //camera.lookUp(0.03);
	        } else if (cpk[Globals.DOWN]) {
	            //camera.lookDown(0.03);
	        }
	        if( cpk[Globals.Q]) {
	        	camera.rollRight(0.03);
	        }
	        if( cpk[Globals.E]) {
	        	camera.rollLeft(0.03);
	        }
	        if( cpk[Globals.R]) {
	        	vec3.set( [0,0,0], this.momentum );
	        	camera.setPos( 0,0,150);
	        	camera.lookAt( [0,0,0] );
	        }
	        if( cpk[Globals.P]) {
	        	camera.lookAt( [0,0,0] );
	        }
	        if( cpk[Globals.L]) {
	        	Line.setGuideLinesToDirectionalVectors(camera);
	        }
	        if( cpk[Globals.SPACE]) {
	        	vec3.scale( this.momentum, 0.92 );
	        }
			if( capturedInput.mouseY!=0)
				camera.lookUp(capturedInput.mouseY*0.00006);
			if( capturedInput.mouseX!=0)
				camera.lookLeft(-capturedInput.mouseX*0.00003);

			camera.translate( this.momentum );
		};

		window.pos=0;

		this.moveForward = function(amount) {
			var back = camera.getBack();
			vec3.negate( back);
			vec3.lerp( this.momentum, back, amount);
		};
		this.moveBackward = function(amount) {
			var back = camera.getBack();
			vec3.lerp( this.momentum, back, amount);
		};
		this.moveUp = function(amount) {
			var up = camera.getUp();
			vec3.lerp( this.momentum, up, amount);
		};
		this.moveDown = function(amount) {
			var up = camera.getUp();
			vec3.negate( up);
			vec3.lerp( this.momentum, up, amount);
		};
		this.moveLeft = function(amount) {
			var right = camera.getRight();
			vec3.negate( right);
			vec3.lerp( this.momentum, right, amount);
		};
		this.moveRight = function(amount) {
			var right = camera.getRight();
			vec3.lerp( this.momentum, right, amount);
		};

	};

});
