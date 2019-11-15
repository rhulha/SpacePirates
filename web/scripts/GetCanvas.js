// SINGLETON
define(["domReady!"], function(){
   "use strict";
	console.log('getting canvas');
	var canvas = document.getElementById("webgl-canvas");
	canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
	return canvas;
});
