const Router = require('express').Router();

const MonopolyDabatase = require('../database/monopolydb');

Router.post('/create-new', (req, res) => {
	const { roomName, roomOwnerId } = req.body;
	const room = MonopolyDabatase.createRoom(roomName, roomOwnerId);

	console.log(`Created new room: ${roomName} with id: ${room._id}`);
	// req.ws.emit('room-created', room);

	res.json(room).status(200);
});

Router.post('/get-room', (req, res) => {
	const { roomId } = req.body;
	const room = MonopolyDabatase.getRoom(roomId);
	res.json(room).status(200);
});

Router.get('/get-rooms', (req, res) => {
	const rooms = MonopolyDabatase.getRooms();
	res.json(rooms).status(200);
});

module.exports = Router;