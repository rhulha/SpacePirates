define([], function(){

	function SpatialNetworkPacket(buffer)
	{
		this.buffer = buffer || new ArrayBuffer(69);  
		this.matrix = new Float32Array( this.buffer, 0, 16); // second parameter must be a multiple of 4 ( BYTES_PER_ELEMENT )
		this.id = new Uint32Array( this.buffer, 64, 1); // second parameter must be a multiple of 4 ( BYTES_PER_ELEMENT )
		this.type = new Uint8Array( this.buffer, 68, 1);
	}
	
	SpatialNetworkPacket.prototype.setType = function( type)
	{
		this.type[0] = type;
	};
	SpatialNetworkPacket.prototype.setID = function( id)
	{
		this.id[0] = id;
	};
	SpatialNetworkPacket.prototype.setMatrix = function( matrix)
	{
		this.matrix.set( matrix);
	};

	SpatialNetworkPacket.prototype.getType = function()
	{
		return this.type[0];
	};
	SpatialNetworkPacket.prototype.getID = function()
	{
		return this.id[0];
	};
	SpatialNetworkPacket.prototype.getMatrix = function()
	{
		return this.matrix;
	};

	return SpatialNetworkPacket;

});
