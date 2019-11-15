define(function(){


	var obj = {};

	obj.get = function(width, height)
	{
		var framebuffer = gl.createFramebuffer();
		var renderbuffer = gl.createRenderbuffer();
		var texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
   
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		return {
			framebuffer : framebuffer,
			renderbuffer : renderbuffer,
			texture : texture,
			width : width,
			height : height,
		};

   	};

	return obj;


});

