const http = require('http');
const { Server } = require('socket.io');
const { onLinkPlayer, onJoinRoom, onLeaveRoom, onToggleReady, onChangeAvatar, onKickAllPlayers, onDeleteRoom, onDisconnect } = require('./sockets/lobby.socket');
const { onStartGame, onJoinGame } = require('./sockets/game.socket');
module.exports = (app) => {
	const server = http.createServer(app);
	const io = new Server(server, {
		cors: {
			origin: '*',
		}
	});

	io.on('connection', onConnection);

	app.use((req, res, next) => {
		req.ws = io;
		next();
	});

	return server;
}

const onConnection = (socket) => {
	console.log('a user connected to the socket');

	socket.on('join-room', (data) => onJoinRoom(socket, data));
	socket.on('leave-room', (data) => onLeaveRoom(socket, data));
	socket.on('link-player', (data) => onLinkPlayer(socket, data));
	socket.on('delete-room', (data) => onDeleteRoom(socket, data));
	socket.on('kick-all-players', (data) => onKickAllPlayers(socket, data));
	socket.on('toggle-ready', (data) => onToggleReady(socket, data));
	socket.on('change-avatar', (data) => onChangeAvatar(socket, data));


	socket.on('start-game', (data) => onStartGame(socket, data));
	socket.on('join-game', (data) => onJoinGame(socket, data));











	
	socket.on('disconnect', () => onDisconnect(socket));
}
