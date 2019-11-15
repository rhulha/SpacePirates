
define([], function(){
   "use strict";
    
    window.fillCanvas = function ()
    {
        var canvas = document.getElementById("webgl-canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    return function() {
        var videoElement = document.getElementById("body");
        var canvas = document.getElementById("webgl-canvas");
        if (!document.mozFullScreen && !document.webkitIsFullScreen) {
            if (videoElement.mozRequestFullScreen) {
                videoElement.mozRequestFullScreen();
                videoElement.onmozfullscreenchange = function() {
                    if(document.mozIsFullScreen) {
                        canvas.width = screen.width;
                        canvas.height = screen.height;
                    } else {
                        window.setTimeout(fillCanvas,200);
                    }
                };
            } else {
                videoElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                videoElement.onwebkitfullscreenchange = function() {
                    if(document.webkitIsFullScreen) {
                        canvas.width = screen.width;
                        canvas.height = screen.height;
                    } else {
                        window.setTimeout(fillCanvas,200);
                    }
                };
            }
        } else {
            if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else {
                document.webkitCancelFullScreen();
            }
        }
    };
  

});
