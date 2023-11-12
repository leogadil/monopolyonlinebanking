const MonopolyDatabase = require('../database/monopolydb');

const onStartGame = (socket, data) => {
	const { roomId } = data;

	let room = MonopolyDatabase.getRoom(roomId);

	room = room.startGame();
	room.save();

	let game = room.getGame();

	console.log(`game started in room ${room.name}`);
	console.log(`game id: ${game._id}`);

	game.save();

	socket.emit('game-started', game);
	socket.emit('lobby-updated', room);
	socket.emit('game-updated', game);
	socket.to(roomId).emit('game-started', game);
	socket.to(game._id).emit('game-updated', game);
	socket.to(roomId).emit('lobby-updated', room);
	socket.broadcast.emit('room-updated', room);
}

const onJoinGame = (socket, data) => {
	const { roomId, playerId } = data;

	const room = MonopolyDatabase.getRoom(roomId);

	if(!room) {
		console.log(`room does not exist`);
		return;
	}

	const game = room.getGame();

	if(!game) {
		console.log(`game does not exist`);
		return;
	}

	const player = room.getPlayer(playerId);
	game.addPlayer(player).save();

	console.log(`user ${player.name} joined game ${game._id}`);

	socket.join(game._id);
	socket.emit('game-joined', game);
	socket.emit('game-updated', game);
	socket.to(game._id).emit('game-updated', game);
}

module.exports = {
	onStartGame,
	onJoinGame
}