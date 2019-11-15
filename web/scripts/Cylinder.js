// see also: https://github.com/evanw/csg.js/blob/master/csg.js

define(function(){

	// single color cylinder
	// uv mapping is weird to help with debugging
	return function( radius, height, radialSubdivisions)
	{
		"use strict";
		var halfHeight = height / 2;
		
		var vertices = new Array(), uvs = new Array(), vertIndices = new Array();
		
		// top center
		vertices.push( 0, halfHeight, 0 );		
		uvs.push( 0, 0 );
		// bottom center
		vertices.push( 0, -halfHeight, 0 );		
		uvs.push( 1, 1 );

		// we start at 2 because we used vertIndices 0 and 1 for the centers above
		for ( var i = 0; i < radialSubdivisions; i++ )
		{

			var u = i / radialSubdivisions;

			var xpos = radius * Math.sin( u * Math.PI * 2 );
			var zpos = radius * Math.cos( u * Math.PI * 2 );

			vertices.push( xpos, halfHeight, zpos );
			uvs.push( u, u);
			vertices.push( xpos, -halfHeight, zpos );
			uvs.push( 1, u);

			if( i > 0)
			{
				var p = (i*2) +2; // add offset for "top center" and "bottom center"
				// triangle in top circle
				vertIndices.push( 0, p-2, p);
				// triangle in bottom circle
				vertIndices.push( 1, p-1, p+1 );
				// triangle from two verts top to one vert bottom
				vertIndices.push( p-2, p, p+1 );
				// triangle from two verts bottom to one vert top
				vertIndices.push( p-1, p+1, p-2 );
			}
		}

		// close the last gap
		if( true) {
			var i = radialSubdivisions;
			var p = (i*2) +2;
			// triangle in top circle
			vertIndices.push( 0, p-2, 2 );
			// triangle in bottom circle
			vertIndices.push( 1, p-1, 3 );
			// triangle from two verts top to one vert bottom
			vertIndices.push( p-2, 2, 3 );
			// triangle from two verts bottom to one vert top
			vertIndices.push( p-1, 3, p-2 );
		}
		return { 
			vertices : vertices,
			textureCoords : uvs,
			vertexIndices : vertIndices
		};
			
	};


});

