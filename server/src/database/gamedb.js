const crud = require('./crud');

const database = new crud({
	players: [],
	rooms: [],
	games: [],
});

class GameDatabase {
	constructor(id, banker, players, startingMoney, salary, startedAt, endedAt) {
		this._id = id;
		this.banker = banker;
		this.players = players;
		this.startingMoney = startingMoney;
		this.salary = salary;
		this.startedAt = startedAt;
		this.endedAt = endedAt;
		this.log = [];
	}

	addPlayer(player) {
		if(!player) {
			return this;
		}

		const playerExists = this.players.find(p => p._id === player._id);

		if(playerExists) {
			return this;
		}

		const newPlayer = {
			_id: player._id,
			name: player.name,
			avatar: player.avatar,
			money: this.startingMoney,
			totalMoney: this.startingMoney,
		}

		this.players.push(newPlayer);

		return this;
	}

	getPlayer(playerId) {
		return this.players.find(player => player._id === playerId);
	}

	hasPlayer(playerId) {
		return !!this.getPlayer(playerId);
	}

	save() {
		database.update('games', database.read('games').map(game => {
			if(game._id === this._id) {
				return this;
			}

			return true;
		}));

		return false;
	}
}

// this class is responsible for managing the game
// it will be responsible for:
// - managing the game state
// - acting like the bank like in the Monopoly Ultimate Banking game
// - adding money to players
// - removing money from players
// - transfering money between players
// - 

module.exports = GameDatabase;