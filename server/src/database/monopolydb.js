const { v4: uuidv4 } = require('uuid');
const crud = require('./crud');
const RoomDatabase = require('./roomdb');
const GameDatabase = require('./gamedb');
const {
	roomState,
	avatar
} = require('./variable');

const database = new crud({
	players: [],
	rooms: [],
	games: [],
});

class MonopolyDabatase {

	constructor() {
		if(MonopolyDabatase.instance) {
			return MonopolyDabatase.instance;
		}

		this.rooms = database.read('rooms').map(room => room._id);
		this.players = database.read('players').map(player => player._id);
		this.games = database.read('games').map(game => game._id);
		
		MonopolyDabatase.instance = this;
	}

	getGame(gameId) {
		const game = database.read('games').find(game => game._id === gameId);
		if(!game) {
			return;
		}

		return new GameDatabase(game._id, game.banker, game.players, game.startingMoney, game.salary, game.startedAt, game.endedAt);
	
	}

	getRooms() {
		return database.read('rooms');
	}

	getRoom(roomId) {
		const room = database.read('rooms').find(room => room._id === roomId);
		if(!room) {
			return;
		}

		return new RoomDatabase(room._id, room.name, room.owner, room.banker, room.players, room.state, room.avaliableAvatars, room.game, room.createAt);
	}

	createRoom(roomName, roomOwnerId) {

		// get roomOwner
		const roomOwner = this.getPlayer(roomOwnerId);

		// check if roomOwner exists
		if(!roomOwner) {
			return;
		}

		if(!roomName) {
			roomName = `${roomOwner.name}'s room`;
		}

		if(this.rooms.includes(roomName)) {
			let i = 1;
			while(this.rooms.includes(`${roomName} (${i})`)) {
				i++;
			}
			roomName = `${roomName} (${i})`;
		}

		const id = uuidv4();

		const room = {
			_id : id,
			name: roomName,
			owner: roomOwnerId,
			banker: roomOwnerId,
			players: [],
			state: roomState.LOBBY,
			avaliableAvatars: [...avatar],
			game: null,
			createAt: Date.now(),
		};

		database.update('rooms', [...database.read('rooms'), room]);

		this.rooms.push(roomName);

		return room;
	}

	deleteRoom(roomId) {
		const room = database.read('rooms').find(room => room._id === roomId);
		if(!room) {
			return;
		}

		database.update('rooms', database.read('rooms').filter(room => room._id !== roomId));

		return room;
	}

	getPlayer(playerId) {
		return database.read('players').find(player => player._id === playerId);
	}

	getPlayerBySocketId(socketId) {
		return database.read('players').find(player => player.socketId === socketId);
	}

	getSocketIdByPlayerId(playerId) {
		const player = database.read('players').find(player => player._id === playerId);
		if(!player) {
			return;
		}

		return player.socketId;
	}

	updatePlayer(playerId, player) {
		console.log('updating player');
		database.update('players', database.read('players').map(p => {
			if(p._id === playerId) {
				return player;
			}
			return p;
		}));
	}

	createPlayer(playerName) {
		const id = uuidv4();

		const player = {
			_id: id,
			name: playerName,
			socketId: null,
			createdAt: Date.now(),
		};

		database.update('players', [...database.read('players'), player]);

		return player;
	}

	linkPlayerToSocket(playerId, socket) {
		database.update('players', database.read('players').map(player => {
			if(player._id === playerId) {
				player.socketId = socket;
			}
			return player;
		}));

		return false;
	}

	unlinkPlayerFromSocket(playerId) {
		database.update('players', database.read('players').map(player => {
			if(player._id === playerId) {
				player.socketId = null;
			}
			return player;
		}));

		return false;
	}

	deletePlayer(playerId) {
		database.update('players', database.read('players').filter(player => player._id !== playerId));
	}
}

module.exports = new MonopolyDabatase();