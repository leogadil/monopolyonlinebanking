const playerRoutes = require('./player.routes');
const roomRoutes = require('./room.routes');
const gameRoutes = require('./game.routes');

module.exports = (app) => {
	app.use('/player', playerRoutes);
	app.use('/room', roomRoutes);
	app.use('/game', gameRoutes);
};