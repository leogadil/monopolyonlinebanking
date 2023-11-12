const Router = require('express').Router();

const MonopolyDabatase = require('../database/monopolydb');

Router.post('/get-game', (req, res) => {
	const { gameId } = req.body;
	const game = MonopolyDabatase.getGame(gameId);
	res.json(game).status(200);
});

module.exports = Router;