const express = require('express');
const http = require('http');
const { router, handleSocket } = require('./router');
const app = express();

const server = http.Server(app);

const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());

const appendPort = '8080-';
const base = process.env.GITPOD_WORKSPACE_URL;

const ClientURL = base ? [base.slice(0, 8), appendPort, base.slice(8)].join('') : 'http://localhost:8080';
console.log("Expecting requests from origin: " + ClientURL);

app.use(cors({origin: ClientURL}));

app.use((req, res, next) => {
    // Website you wish to allow to connect: enable expected FE port
    res.setHeader('Access-Control-Allow-Origin', ClientURL);
	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
	// Pass to next layer of middleware
	next();

});
app.use('/api', router)
const io = require('socket.io')(server,{
	cors: {
		origin: ClientURL,
		methods: ["GET", "POST"]
	},
});

io.on('connection', handleSocket);
const port = 3000;

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});


