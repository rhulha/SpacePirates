// SINGLETON
// using this class usually requires to implement webSocket.connection.onmessage
define([], function() {

	var webSocket = {connected:false};
	webSocket.send = function( msg)
	{
		if( this.connected)
			this.connection.send( msg);
	};
	
	var wsurl = ((window.location.protocol == 'http:') ? 'ws://' : 'wss://')
			+ window.location.host 
			+ ( (window.location.pathname.length == 0) || (window.location.pathname == '/') ? '' : '/' + window.location.pathname.split('/')[1]) 
			+ '/websocket';

	try {
		webSocket.connection = new WebSocket(wsurl);
		webSocket.connection.binaryType = 'arraybuffer';
		webSocket.connection.onerror = function(error) {
			console.log('WebSocket Error: ' + error);
		};
		webSocket.connection.onopen = function(error) {
			console.log('WebSocket connected');
			webSocket.connected = true;
		};
		webSocket.connection.onclose = function(error) {
			console.log('WebSocket closed');
			webSocket.connected = false;
		};
	} catch (e) {
		console.log('WebSocket Exception: ' + e);
	}
	
	
	return webSocket;
	

});
