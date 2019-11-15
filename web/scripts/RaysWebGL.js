// SINGLETON
// we include Extensions here, so they are available for all.
define(["GetCanvas", "GetGL", "Camera", "ProgramNormal", "ProgramPointSprites", "ProgramColor", "Extensions", "FrameBuffer", "WebSocket", "SpatialNetworkPacket"],
		function(canvas, gl, camera, programNormal, programPointSprites, programColor, extensions, frameBuffer, webSocket, SpatialNetworkPacket){
    "use strict";

	return new function()
	{
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.lineWidth(5);

		this.programNormal = programNormal;
		this.programPointSprites = programPointSprites;
		this.programColor = programColor;

		this.physicsObjects = [];

		this.addPhysicsObject = function(obj) {
			this.physicsObjects.push( obj);
		};

		this.pMatrix = mat4.create();

		var millihertz = 1000/60;

		var networkTime = 0;
		var spatialNetworkPacket = new SpatialNetworkPacket();
		this.animate = function (currentTime, elapsed) {
            for (var i = 0; i < this.physicsObjects.length; i++)
			{
				var obj = this.physicsObjects[i];
				obj.animate( elapsed); // constant physics time: http://fabiensanglard.net/timer_and_framerate
			}
   			programNormal.animate(elapsed);
			programPointSprites.animate(elapsed);

			while( networkTime < currentTime) {
				networkTime += 100;
				spatialNetworkPacket.setType( 7);
				spatialNetworkPacket.setID( 33);
				spatialNetworkPacket.setMatrix( camera.matrix);
				webSocket.send( spatialNetworkPacket.buffer);
			}
		};

		var simulationTime = 0;
		this.animate0 = function (currentTime, elapsed) {
			var count = 0;
			while( simulationTime < currentTime) {
	        	count++;
	        	if( count > 1)
	        		console.log('count: ' + count);
				simulationTime += millihertz;
	            for (var i = 0; i < this.physicsObjects.length; i++)
				{
					var obj = this.physicsObjects[i];
					obj.animate( millihertz); // constant physics time: http://fabiensanglard.net/timer_and_framerate
				}
       			programNormal.animate(millihertz);
				programPointSprites.animate(millihertz);
			}
		};

		var timey = 0;
		this.animate1 = function (currentTime, elapsed) {
			if( elapsed < 1000)
				timey += elapsed;
			else
				console.log('high elapsed value: ' + elapsed);
			var count = 0;
	        while( timey > millihertz) {
	        	count++;
	        	if( count > 2)
	        		console.log('count: ' + count);
	        	if( timey > millihertz*2)
	        		console.log('while timey: ' + timey);
	        	timey -= millihertz;
	            for (var i = 0; i < this.physicsObjects.length; i++)
				{
					var obj = this.physicsObjects[i];
					obj.animate( millihertz); // constant physics time: http://fabiensanglard.net/timer_and_framerate
				}
       			programNormal.animate(millihertz);
				programPointSprites.animate(millihertz);
	        }
	        if( timey > millihertz)
		        console.log('timey > millihertz: ' + timey);
		};

		this.lastWidth = 0;
		this.lastHeight = 0;

		var myframebuffer=null;

		this.drawPickScene = function() {
			if( ! myframebuffer)
			{
				myframebuffer = frameBuffer.get(512, 512);

			}
			gl.viewport(0, 0, myframebuffer.width, myframebuffer.height);
			mat4.perspective(50, myframebuffer.width / myframebuffer.height, 0.1, 2020.0, this.pMatrix);
			gl.bindFramebuffer(gl.FRAMEBUFFER, myframebuffer.framebuffer);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			programNormal.draw(this.pMatrix);
			var canRead = gl.checkFramebufferStatus() == gl.FRAMEBUFFER_COMPLETE;
			var pixelValues = false;
			if (canRead) {
				pixelValues = new Uint8Array(4);
				// preserveDrawingBuffer
				gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelValues);
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			return pixelValues;
		};

		this.drawScene = function() {
			if( this.lastWidth != canvas.width || this.lastHeight != canvas.height)
			{
				console.log("setting viewport");
				gl.viewport(0, 0, canvas.width, canvas.height);
				mat4.perspective(50, canvas.width / canvas.height, 0.1, 2020.0, this.pMatrix);
				this.lastWidth = canvas.width;
				this.lastHeight = canvas.height;
			}
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			

			programNormal.draw(this.pMatrix);
			programPointSprites.draw(this.pMatrix);
			programColor.draw(this.pMatrix);

		};
	};

});