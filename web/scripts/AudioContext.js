// SINGLETON
// http://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js
define([], function(){
   "use strict";
	console.log('getting audio context');

	window.myAudioContext = (function() {
		  return window.AudioContext || window.webkitAudioContext;
		})();
	
	return new function() {

		try {
			this.context = new myAudioContext();
		} catch(e) {
			alert('Web Audio API is not supported in this browser.');
		}


		this.loadSound = function (url) {
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';
			var that = this;

			// Decode asynchronously
			request.onload = function() {
				that.context.decodeAudioData(request.response, function(buffer){that.buffer = buffer;});
			};
			request.send();
		};

		this.playSound = function () {
			var source = this.context.createBufferSource();
			source.buffer = this.buffer;
			source.connect(this.context.destination);
			source.noteOn(0);
		};

	};
	
});
