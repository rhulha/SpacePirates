define(["WebSocket"], function(webSocket){

	
	webSocket.connection.onmessage = function(e) {
		console.log(e.data);
	};
	
	document.getElementById("testButton").addEventListener("click", function(e){
		webSocket.send("test");
	}, false);

});
