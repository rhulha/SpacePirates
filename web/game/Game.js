// SINGLETON
define(['RaysWebGL', 'Camera', 'RaysUtils', 'Particles', 'TextureCache', 'Mesh', 'Laser', 'AudioContext', 'PlayerShip', 'enemyShip', 'Line', 'asteroidModel', 'shipModel', 'WebSocket', "SpatialNetworkPacket"], 
	function(raysWebGL, camera, raysUtils, Particles, textureCache, Mesh, laser, audioContext, PlayerShip, enemyShip, Line, asteroidModel, shipModel, webSocket, SpatialNetworkPacket){

	var myPlayerShip=null;
	
	var networkShips = [];
		
	var lastTime=0;
	function tick(timeNow) {
		requestAnimFrame(tick);
		if( lastTime == 0)
			lastTime = timeNow;
		elapsed = timeNow - lastTime;
		lastTime = timeNow;
		if( isNaN(elapsed))
		{
			console.log( "isNaN(elapsed)");
			elapsed = 0;
		}
		if( elapsed > 24)
			console.log( "high elapsed:" + elapsed);
		myPlayerShip.animate(elapsed);
        raysWebGL.animate(timeNow, elapsed);
        raysWebGL.drawScene();
    }

	function init2()
	{
		
		camera.setPos(0,0,150);
		myPlayerShip = new PlayerShip(camera);
		
		webSocket.connection.onmessage = function(e) {
			if( e.data instanceof ArrayBuffer)
			{
				var spatialNetworkPacket = new SpatialNetworkPacket(e.data);
				if( spatialNetworkPacket.getType() == 7)
				{
					var snpID = spatialNetworkPacket.getID();
					if( ! networkShips[snpID])
					{
						networkShips[snpID] = raysWebGL.programNormal.add(enemyShip.create());
					}
					networkShips[snpID].matrix.set( spatialNetworkPacket.getMatrix());
				}
			}
			else if( e.data.startsWith('+block:'))
    		{
				var cube = raysUtils.createCube();
	        	cube.texture = "textures/block.jpg";
	        	var cubeMesh = new Mesh(cube);
	        	cubeMesh.type = "block";
	        	var pos = e.data.split(':')[1].split(',');
	        	pos[0] = +pos[0];
	        	pos[1] = +pos[1];
	        	pos[2] = +pos[2];
	        	cubeMesh.setPos( pos );
	        	raysWebGL.programNormal.add(cubeMesh);
    		} else {
				console.log(e.data);
    		}
		};
		
		webSocket.send('send blocks');
		
		//camera.lookAt( [0,0,0] );

		//Line.addGuideLines( 30);

		//var lines = Line.addGuideLines( 30);
		//Line.setGuideLinesToDirectionalVectors( camera, lines);



		//raysWebGL.addPhysicsObject(new PlayerShip(camera));

		raysUtils.addSkybox( "textures/skybox_", ".png", "nx", "px", "nz", "pz", "ny", "py");

		raysWebGL.programNormal.add(new Mesh(asteroidModel));

		raysWebGL.programNormal.add(enemyShip.create()).setPos(0,0,-30);

		raysUtils.addParticles( 2000);

		//var debugTex = raysUtils.textureFromCanvas(raysUtils.createGradientImage());
		//var blueTex = raysUtils.createSolidTexture("rgba(0,0,255,255)");
		//raysWebGL.add(raysUtils.getWall(blueTex, 20));

		console.log("game starting");
		tick();
	}

	function checkTextureCache()
	{
	    //console.log("checkTextureCache");
		var notReadyCount = textureCache.check();
		if( notReadyCount > 0)
		{
    	    document.getElementById("topLeftDiv").innerText = "Loading " + notReadyCount + " Textures";
			setTimeout( checkTextureCache, 300);
		} else {
    	    document.getElementById("topLeftDiv").innerText = "";
			init2();
		}
	}

	return function()
	{
		audioContext.loadSound("sounds/laser.wav");
		textureCache.add("red", raysUtils.createSolidTexture("rgba(255,0,0,255)"));
		textureCache.add("black", raysUtils.createSolidTexture("rgba(0,0,0,255)"));
		textureCache.add("textures/skybox_nx.png");
		textureCache.add("textures/skybox_px.png");
		textureCache.add("textures/skybox_ny.png");
		textureCache.add("textures/skybox_py.png");
		textureCache.add("textures/skybox_nz.png");
		textureCache.add("textures/skybox_pz.png");
		textureCache.add("textures/block.jpg");
		textureCache.addNoClamp(shipModel.hull.texture);
		textureCache.addNoClamp(asteroidModel.texture);
		textureCache.add("textures/particle.bmp");
		textureCache.start();
		setTimeout( checkTextureCache, 1000);
	};
});
