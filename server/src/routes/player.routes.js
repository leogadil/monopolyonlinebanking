const Router = require('express').Router();

const MonopolyDabatase = require('../database/monopolydb');

Router.post('/create-new', (req, res) => {
	const { playerName } = req.body;
	const player = MonopolyDabatase.createPlayer(playerName);

	console.log(`Created new player: ${playerName} with id: ${player._id}`);

	res.json(player).status(200);
});

Router.post('/delete-player', (req, res) => {
	const { playerId } = req.body;
	MonopolyDabatase.deletePlayer(playerId);

	console.log(`Deleted player with id: ${playerId}`);

	res.sendStatus(200);
});

Router.post('/get-player', (req, res) => {
	const { playerId } = req.body;
	const player = MonopolyDabatase.getPlayer(playerId);

	if(!player) {
		console.log(`Player with id: ${playerId} not found`);
		return res.send({ error: 'Player not found' }).status(404);
	}

	console.log(`Sending player with id: ${playerId}`);

	res.json(player).status(200);
})

module.exports = Router;