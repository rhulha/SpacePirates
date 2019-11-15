// SINGLETON
define(["GetGL"], function(gl){
    "use strict";

	var textureCache = {};

	
	return {
	
		add : function( url, tex) {
			if( tex )
			{
				textureCache[url] = {};
				textureCache[url].texture = tex;
				textureCache[url].ready = true;
			} else {
				textureCache[url] = 1;
			}
		},
	
		addNoClamp : function( url) {
			textureCache[url] = 2;
		},

		get : function( url) {
			return textureCache[url].texture;
		},

	    start : function() {
			for( var url in textureCache )
			{
				var clamp = true;
				if( textureCache[url] != 1 && textureCache[url] != 2)
					continue;
				if( textureCache[url] == 2)
					clamp = false;
				textureCache[url] = new Image();
				textureCache[url].clamp = clamp;
				textureCache[url].ready = false;
				textureCache[url].texture = gl.createTexture();
				textureCache[url].onload = function () {
					gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
					gl.bindTexture(gl.TEXTURE_2D, this.texture);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // _MIPMAP_NEAREST
					if( this.clamp )
					{
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // this fixes glitch on skybox seams
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
					}
					//gl.generateMipmap(gl.TEXTURE_2D);
					gl.bindTexture(gl.TEXTURE_2D, null);
					this.ready = true;
			   };
			   textureCache[url].src = url;
			}
		},
		
		check : function () {
			console.log("check");
			var notReadyCount = 0;
			for( var url in textureCache )
			{
				//console.log("check: " + url + " : " + textureCache[url].ready);
				if( ! textureCache[url].ready)
				{
					notReadyCount++;
				}
			}
			return notReadyCount;
		}
	};

});