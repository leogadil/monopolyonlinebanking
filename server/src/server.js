const express = require('express');
const server = require('./socket');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8888;

const serverModule = server(app);

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from this origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

app.use(express.json());

routes(app);

serverModule.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});