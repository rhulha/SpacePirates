// SINGLETON
define(["GetGL", "Mesh", "RaysWebGL", "Cylinder", "Cube", "TextureCache", "Particles", "Line"], function(gl, Mesh, raysWebGL, createCylinder, createCube, textureCache, Particles, Line){

	return {
		createCylinder : createCylinder,
		createCube : createCube,

		addParticles : function( vertices )
		{
			raysWebGL.programPointSprites.add( new Particles(vertices, "textures/particle.bmp"));
		},
	
		addLine : function( vec1, vec2 )
		{
			raysWebGL.programColor.add( new Line([vec1[0], vec1[1], vec1[2],vec2[0], vec2[1], vec2[2]], [1,1,0,1, 0,1,1,1])); // GREEN
		},
	
		addSkybox : function( prefix, suffix, nx, px, nz, pz, ny, py)
		{
			nx = textureCache.get(prefix+nx+suffix);
			px = textureCache.get(prefix+px+suffix);
			nz = textureCache.get(prefix+nz+suffix);
			pz = textureCache.get(prefix+pz+suffix);
			ny = textureCache.get(prefix+ny+suffix);
			py = textureCache.get(prefix+py+suffix);

			var skybox_nx = this.getWall(nx, 1004);
			skybox_nx.setPos(-2,2,-1000);
			raysWebGL.programNormal.addFollowCameraObjects(skybox_nx);

			var skybox_px = this.getWall(px, 1004);
			skybox_px.setPos(-2,2,1000);
			skybox_px.rotY( Math.PI);
			raysWebGL.programNormal.addFollowCameraObjects(skybox_px);

			var skybox_nz = this.getWall(nz, 1004);
			skybox_nz.setPos(-1000,2,-2);
			skybox_nz.rotY(0.5*Math.PI);
			raysWebGL.programNormal.addFollowCameraObjects(skybox_nz);

			var skybox_pz = this.getWall(pz, 1004);
			skybox_pz.setPos(1000,2,-2);
			skybox_pz.rotY( 1.5*Math.PI);
			raysWebGL.programNormal.addFollowCameraObjects(skybox_pz);

			var skybox_ny = this.getWall(ny, 1004);
			skybox_ny.setPos( -2,-1000,-2);
			skybox_ny.rotX( 1.5*Math.PI);
			skybox_ny.rotZ( 1.5*Math.PI);
			raysWebGL.programNormal.addFollowCameraObjects(skybox_ny);

			var skybox_py = this.getWall(py, 1004);
			skybox_py.setPos( -2,1000,-2);
			skybox_py.rotX( 0.5*Math.PI);
			skybox_py.rotZ( 0.5*Math.PI);
			raysWebGL.programNormal.addFollowCameraObjects(skybox_py);

			
		},

		getWall: function(texture, size)
		{
			var verts = new Array(
				-1.0*size, -1.0*size,  0.0,
				 1.0*size, -1.0*size,  0.0,
				 1.0*size,  1.0*size,  0.0,
				-1.0*size,  1.0*size,  0.0
			);
			
			var textureCoords = new Array(
			  0.0, 0.0,
			  1.0, 0.0,
			  1.0, 1.0,
			  0.0, 1.0
			);
			
			 var vertexIndices = new Array(
				0, 1, 2,
				0, 2, 3
			);
			return new Mesh( {vertices:verts, textureCoords:textureCoords, vertexIndices:vertexIndices, texture:texture});
		},


		degToRad: function(degrees) {
			return degrees * Math.PI / 180;
		},

		createSolidTexture: function(fillStyle) {
			return this.textureFromCanvas( this.createDynamicImage(fillStyle));
		},

		// doesn't seem to work...
		createSolidTexture2: function(r, g, b, a) {
			var data = new Uint8Array([r, g, b, a]);
			var texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			texture.ready = true;
			return texture;
		},
		
		textureFromPixelArray: function(dataArray, type, width, height) {
			var dataTypedArray = new Uint8Array(dataArray); // Don't need to do this if the data is already in a typed array
			var texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, type, width, height, 0, type, gl.UNSIGNED_BYTE, dataTypedArray);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // _MIPMAP_NEAREST
			texture.ready = true;
			return texture;
		},

		textureFromCanvas: function(canvas) {
			//var dataTypedArray = new Uint8Array(dataArray); // Don't need to do this if the data is already in a typed array
			var texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // _MIPMAP_NEAREST
			texture.ready = true;
			return texture;
		},

		handleLoadedTexture: function(texture) {
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // _MIPMAP_NEAREST
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // this fixes glitch on skybox seams
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			//gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
			texture.ready = true;
		},
	
		textureFromImageURL: function(src) {
			that = this;
			var tex = gl.createTexture();
			tex.image = new Image();
			tex.ready = false;
			tex.image.onload = function () {
				that.handleLoadedTexture(tex);
			};
			tex.image.src = src;
			return tex;
		},

		createDynamicImage: function(fillStyle, opt_width, opt_height)
		{
			var canvas = document.createElement("canvas");
			canvas.width = opt_width || 1;
			canvas.height = opt_height || 1;
			var ctx = canvas.getContext('2d');
			ctx.fillStyle = fillStyle;
			ctx.fillRect(0,0,canvas.width,canvas.height);
			return canvas;
		},

		createGradientImage: function(opt_width, opt_height)
		{
			var canvas = document.createElement("canvas");
			canvas.width = opt_width || 256;
			canvas.height = opt_height || 256;
			var ctx = canvas.getContext('2d');

			var cxlg=ctx.createLinearGradient(0, 0, canvas.width, 0);
			cxlg.addColorStop(0, '#f00');
			cxlg.addColorStop(0.5, '#0f0');
			cxlg.addColorStop(1.0, '#00f');

			ctx.fillStyle = cxlg;
			ctx.fillRect(0,0,canvas.width,canvas.height);
			return canvas;
		},

		createDynamicImage2: function()
		{
			var canvas = document.createElement("canvas");
			canvas.width = 128;
			canvas.height = 128;
			var ctx = canvas.getContext('2d');
			ctx.fillRect(25,25,100,100);
			ctx.clearRect(45,45,60,60);
			ctx.strokeRect(50,50,50,50);
			return ctx.getImageData(0, 0, 128, 128);
		},

		createDynamicImage3: function()
		{
			var canvas = document.createElement("canvas");
			canvas.width = 1;
			canvas.height = 1;
			return canvas.getContext('2d').getImageData(0, 0, 1, 1);
		}

	};
});
