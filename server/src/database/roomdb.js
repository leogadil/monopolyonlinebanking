const { v4: uuidv4 } = require('uuid');
const crud = require('./crud');

const GameDatabase = require('./gamedb');

const {
	roomState,
	playerState,
} = require('./variable');

const database = new crud({
	players: [],
	rooms: [],
	games: [],
});

class RoomDatabase {
	constructor(id, name, owner, banker, players, state, avatars, game, createdAt) {
		this._id = id;
		this.name = name;
		this.owner = owner;
		this.banker = banker;
		this.players = players;
		this.state = state;
		this.avaliableAvatars = avatars;
		this.game = game;
		this.createdAt = createdAt;
	}

	createGame(roomId) {
		const room = database.read('rooms').find(room => room._id === roomId);
		if(!room) {
			return;
		}

		const game = {
			_id: uuidv4(),
			banker: room.banker,
			players: [],
			startingMoney: 15 * 100 * 1000,
			salary: 2 * 100 * 1000,
			startedAt: Date.now(),
			endedAt: null,
		}

		database.update('games', [...database.read('games'), game]);

		return game;
	}

	startGame() {
		this.state = roomState.STARTED;

		const game = this.createGame(this._id);

		this.game = game._id;

		return this;
	}

	getGame() {
		const game = database.read('games').find(game => game._id === this.game);
		if(!game) {
			return;
		}

		return new GameDatabase(game._id, game.banker, game.players, game.startingMoney, game.salary, game.startedAt, game.endedAt);
	}


	addPlayer(player, isHost = false) {
		if(!player) {
			return this;
		}

		const playerExists = this.players.find(p => p._id === player._id);

		if(playerExists) {
			this.setPlayerState(player._id, playerState.CONNECTED);

			return this;
		}

		const newPlayer = {
			_id: player._id,
			name: player.name,
			avatar: this.avaliableAvatars.shift(),
			playerState: playerState.CONNECTED,
			ready: false,
			isHost: isHost,
		}

		this.players.push(newPlayer);

		return this;
	}

	hasPlayer(playerId) {
		return !!this.getPlayer(playerId);
	}

	removePlayer(playerId) {
		//if lobby is started, do not remove player

		if(this.state === roomState.STARTED) {

			// change player state to disconnected
			this.players = this.players.map(player => {
				if(player._id === playerId) {
					player.playerState = playerState.DISCONNECTED;
				}
				return player;
			});

			return this;
		}

		// add avatar back to avaliable avatars
		const player = this.getPlayer(playerId);
		if(player) {
			this.avaliableAvatars.push(player.avatar);
		}
		
		this.players = this.players.filter(player => player._id !== playerId);

		return this;
	}

	getPlayer(playerId) {
		return this.players.find(player => player._id === playerId);
	}

	getPlayers() {
		return this.players;
	}

	setPlayerReady(playerId, isReady) {
		this.players = this.players.map(player => {
			if(player._id === playerId) {
				player.ready = isReady;
			}
			return player;
		});

		return this;
	}

	setPlayerState(playerId, playerState) {
		this.players = this.players.map(player => {
			if(player._id === playerId) {
				player.playerState = playerState;
			}
			return player;
		});

		return this;
	}

	changePlayerAvatar(playerId, avatar) {
		// check if avatar is avaliable
		if(!this.avaliableAvatars.includes(avatar)) {
			return this;
		}

		// check if player exists
		const player = this.getPlayer(playerId);
		if(!player) {
			return this;
		}

		// check if player already has this avatar
		if(player.avatar === avatar) {
			return this;
		}

		// check if avatar is already taken
		const playerWithAvatar = this.players.find(player => player.avatar === avatar);

		// swapping is not allowed
		if(playerWithAvatar) {
			return this;
		}

		// remove avatar from avaliable avatars
		this.avaliableAvatars = this.avaliableAvatars.filter(a => a !== avatar);
		// add old avatar to avaliable avatars
		this.avaliableAvatars.push(player.avatar);

		// change avatar
		this.players = this.players.map(player => {
			if(player._id === playerId) {
				player.avatar = avatar;
			}
			return player;
		});

		return this;
	}

	kickPlayer(playerId) {
		this.players = this.players.filter(player => player._id !== playerId);
		return this;
	}

	save() {
		database.update('rooms', database.read('rooms').map(room => {
			if(room._id === this._id) {
				return this;
			}
			return true;
		}));

		return false;
	}
}

module.exports = RoomDatabase;