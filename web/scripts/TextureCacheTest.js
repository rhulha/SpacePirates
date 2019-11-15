// SINGLETON
define(["GetGL"], function(gl){
    "use strict";

	var textureCache = {};


	function ImageLoader( texObj)
	{
		this.transfer = function()
		{
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.bindTexture(gl.TEXTURE_2D, texObj.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texObj.image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // _MIPMAP_NEAREST
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // this fixes glitch on skybox seams
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			//gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
			texObj.image = null;
			texObj.ready = true;
		};
	}

	
	return {
	
		add : function( url, tex) {
			textureCache[url] = tex || 1;
		},
	
		get : function( url) {
			return textureCache[url].texture;
		},

	    start : function() {
			for( var url in textureCache )
			{
			   if( textureCache[url] != 1)
			   	 continue;
			   textureCache[url] = {};
			   textureCache[url].url = url;
			   textureCache[url].image = new Image();
			   textureCache[url].ready = false;
			   textureCache[url].texture = gl.createTexture();
			   var il = new ImageLoader(textureCache[url]);
			   textureCache[url].onload = il.transfer;
			   textureCache[url].src = url;
			}
		},
		
		check : function () {
			console.log("check");
			var notReadyCount = 0;
			for( var url in textureCache )
			{
				console.log("check: " + url + " : " + textureCache[url].ready);
				if( ! textureCache[url].ready)
				{
					notReadyCount++;
				}
			}
			return notReadyCount;
		}
	};

});