require.config({
	urlArgs: "bust=" +  (new Date()).getTime(),
	paths: {
        glMatrix: 'gl-matrix-min',
        Laser : '../game/Laser',
        Game : '../game/Game',
        PlayerShip : '../game/PlayerShip',
        enemyShip : '../game/EnemyShip',
        shipModel : '../models/ship',
        asteroidModel : '../models/asteroid'
    }
});

require(['Game'], function(game){

	game();

});
