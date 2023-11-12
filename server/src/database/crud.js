const fs = require('fs');
const { dirname } = require('path');

class CRUD {
	constructor(defaultData = {}, databasePath = './database.json') {
		if(CRUD.instance) {
			return CRUD.instance;
		}

		this.databasePath = databasePath
		this.data = defaultData;
		this.isWatching = false;
		this.load();

		fs.watchFile(this.databasePath, {
			persistent: false, interval: 1000
		}, (curr, prev) => {
			if(!this.isWatching) {
				console.log('File changed');
				this.load();
			}
		});

		CRUD.instance = this;
	}

	load() {
		try {
			const data = fs.readFileSync(this.databasePath, 'utf8');
			this.data = JSON.parse(data);
		} catch (err) {
			if(err.code === 'ENOENT') {
				const dir = dirname(this.databasePath);
				fs.mkdirSync(dir, { recursive: true });
				this.save();
				return;
			}
		}
	}

	save() {
		this.isWatching = true;
		fs.unwatchFile(this.databasePath);
		fs.writeFileSync(this.databasePath, JSON.stringify(this.data, null, 2), 'utf8');
		fs.watchFile(this.databasePath, {
			persistent: false, interval: 1000
		}, (curr, prev) => {
			if(!this.isWatching) {
				console.log('File changed');
				this.load();
			}
		});
		this.isWatching = false;
	}

	read(key) {
		return this.data[key];
	}

	update(key, value) {
		this.data[key] = value;
		this.save();
	}

	delete(key) {
		delete this.data[key];
		this.save();
	}
}

module.exports = CRUD;