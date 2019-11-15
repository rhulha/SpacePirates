define([],function()
{

	var capturedInput = {

		currentlyPressedKeys : {},
		currentlyPressedMouseButtons : {},
		clientX:0,
		clientY:0,
		mouseX:0,
		mouseY:0

	};

	document.addEventListener("mousemove", function(e) {
        e = e ? e : window.event;
		e.preventDefault();
		capturedInput.clientX = e.clientX; 
		capturedInput.clientY = window.innerHeight - e.clientY; 
        capturedInput.mouseX = e.clientX-(window.innerWidth/2);
        capturedInput.mouseY = -(e.clientY-(window.innerHeight/2));
		//document.all.hud.innerText = x + ' ' + y;
    }, false);


	document.addEventListener("mousedown", function(e) {
        e = e ? e : window.event;
		e.preventDefault();
		var rightclick=e.which ? e.which == 3 : e.button ? e.button == 2 : false;
		if( rightclick)
			capturedInput.currentlyPressedMouseButtons['right'] = true;
		else
			capturedInput.currentlyPressedMouseButtons['left'] = true;
    }, false);

	document.addEventListener("mouseup", function(e) {
        e = e ? e : window.event;
		e.preventDefault();
		var rightclick=e.which ? e.which == 3 : e.button ? e.button == 2 : false;
		if( rightclick)
			capturedInput.currentlyPressedMouseButtons['right'] = false;
		else
			capturedInput.currentlyPressedMouseButtons['left'] = false;
    }, false);

	document.addEventListener("keydown", function(e) {
	   capturedInput.currentlyPressedKeys[e.keyCode] = true;
    }, false);

	document.addEventListener("keyup", function(e) {
	    capturedInput.currentlyPressedKeys[e.keyCode] = false;
    }, false);

   return capturedInput;
});


