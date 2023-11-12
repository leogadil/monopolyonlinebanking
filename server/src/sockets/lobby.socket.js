const {
	playerState
} = require('../database/variable');
const MonopolyDatabase = require('../database/monopolydb');

const onLinkPlayer = (socket, data) => {
	const playerId = data;

	if(!playerId) {
		console.log('playerId is not defined');
		return;
	}

	const player = MonopolyDatabase.getPlayer(playerId);

	if(!player) {
		console.log(`player ${playerId} does not exist`);
		return;
	}

	MonopolyDatabase.linkPlayerToSocket(playerId, socket.id);

	console.log(`user ${player.name} connected to the socket`);

	socket.emit('player-linked', player);
	socket.broadcast.emit('room-updated');
}

const onJoinRoom = (socket, data) => {
	const { roomId, playerId } = data;

	const room = MonopolyDatabase.getRoom(roomId);
	const player = MonopolyDatabase.getPlayer(playerId);

	if(!room) {
		console.log(`room ${roomId} does not exist`);
		return;
	}

	if(!player) {
		console.log(`player ${playerId} does not exist`);
		return;
	}

	socket.join(roomId);

	room?.addPlayer(player, room.owner === player._id).save();

	console.log(`user ${player.name} joined room ${room.name}`);

	socket.to(roomId).emit('lobby-updated', room);
	socket.emit('room-joined', room);

	socket.broadcast.emit('room-updated', room);
}

const onLeaveRoom = (socket, data) => {
	const { roomId, playerId } = data;

	const room = MonopolyDatabase.getRoom(roomId);
	const player = MonopolyDatabase.getPlayer(playerId);

	if(!room) {
		console.log(`room ${roomId} does not exist`);
		socket.to(roomId).emit('lobby-updated', room);
		socket.emit('room-left', room);
		socket.leave(roomId);

		socket.broadcast.emit('room-updated', room);
		return;
	}

	if(!player) {
		console.log(`player ${playerId} does not exist`);
		return;
	}

	if(room.owner === player._id) {

		socket.to(roomId).emit('kicked-from-room', {
			type: 2
		});

		socket.to(roomId).emit('room-left', room);
		socket.emit('room-left', room);
		MonopolyDatabase.deleteRoom(roomId);

		socket.broadcast.emit('room-updated', room);

		return;
	}

	room.removePlayer(playerId).save();

	console.log(`user ${player.name} left room ${room.name}`);

	socket.emit('room-left', room);
	socket.to(roomId).emit('lobby-updated', room);
	socket.leave(roomId);

	socket.broadcast.emit('room-updated', room);
}

const onToggleReady = (socket, data) => {
	const { roomId, playerId, isReady } = data;

	const room = MonopolyDatabase.getRoom(roomId);
	const player = MonopolyDatabase.getPlayer(playerId);

	room.setPlayerReady(playerId, isReady).save();

	console.log(`user ${player.name} is ${isReady ? 'ready' : 'not ready'}`);

	socket.emit('player-ready-toggled', room);
	socket.to(roomId).emit('lobby-updated', room);
}

const onChangeAvatar = (socket, data) => {
	const { roomId, playerId, avatar } = data;

	const room = MonopolyDatabase.getRoom(roomId);
	const player = MonopolyDatabase.getPlayer(playerId);

	room.changePlayerAvatar(playerId, avatar).save();

	console.log(`user ${player.name} changed avatar to ${avatar}`);

	socket.emit('avatar-changed', room);
	socket.to(roomId).emit('lobby-updated', room);
}

const onKickAllPlayers = (socket, data) => {
	const { roomId } = data;

	const room = MonopolyDatabase.getRoom(roomId);

	const players = room.getPlayers();

	players.forEach(player => {
		// if player is owner, do not kick
		if(player._id === room.owner) {
			return;
		}

		const socketId = MonopolyDatabase.getSocketIdByPlayerId(player._id);
		socket.to(socketId).emit('kicked-from-room', {
			type: 2
		});
		socket.to(socketId).emit('room-left', room);
	});

	console.log(`all players kicked from room ${room.name}`);

	socket.emit('kicked-all-players', room);
	socket.emit('lobby-updated', room);
	socket.to(roomId).emit('lobby-updated', room);
	socket.broadcast.emit('room-updated', room);
}

const onDeleteRoom = (socket, data) => {
	const { roomId } = data;

	const room = MonopolyDatabase.getRoom(roomId);

	const players = room.getPlayers();

	players.forEach(player => {
		const socketId = MonopolyDatabase.getSocketIdByPlayerId(player._id);
		socket.to(socketId).emit('kicked-from-room', room);
	});

	MonopolyDatabase.deleteRoom(roomId);

	socket.emit('kicked-from-room', room);
	socket.broadcast.emit('room-updated');

	console.log(`room ${room.name} deleted`);
}


const onDisconnect = (socket) => {
	const rooms = MonopolyDatabase.getRooms();
	const player = MonopolyDatabase.getPlayerBySocketId(socket.id);

	rooms.forEach(room => {
		const currentRoom = MonopolyDatabase.getRoom(room._id);

		if(currentRoom?.hasPlayer(player?._id)) {
			room?.setPlayerState(player._id, playerState.DISCONNECTED).setPlayerReady(player._id, false).save();
			socket.broadcast.to(room._id).emit('lobby-updated', room);
			socket.broadcast.emit('room-updated', room);
		}
	});

	// remove socketId from player
	if(player) {
		MonopolyDatabase.unlinkPlayerFromSocket(player._id);
	}

	console.log('user disconnected from the socket');
}

module.exports = {
	onLinkPlayer,
	onJoinRoom,
	onLeaveRoom,
	onToggleReady,
	onChangeAvatar,
	onKickAllPlayers,
	onDeleteRoom,
	onDisconnect,
}