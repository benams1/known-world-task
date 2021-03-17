const { Router } = require('express');
const router = Router();
const init = require('./init.json');
const moment = require('moment');
let sendUpdates = false;

router.get('/' , (req, res) => {
    sendUpdates = true;
    res.status(200).json(init)
});

router.post('/stop/updates' , (req, res) => {
    sendUpdates = false;
    console.log('Updates Stopped');
    res.status(200).json(JSON.stringify({ message: 'Updates Stopped'}))
});

const handleSocket = (socket) => {
    //handle connection
    console.log('A user connected');
    loop(socket);
};
const generateUpdate = () => {
    const randHouse = init.houses[Math.floor(Math.random() * init.houses.length)];
    const max = 10;
    const min = 5;
    const randSteps = randHouse.name !== 'Lannister'
        ? Math.floor(Math.random() * (max - min) + min) * randHouse.strength : 0;
    return {house: randHouse, steps: randSteps, score: randSteps + 100, timestamp: moment()};
};

function loop(socket) {
    const rand = Math.round(Math.random() * (3000 - 500)) + 500;
    setTimeout(function () {
        socket.emit('message', generateUpdate())
        if (sendUpdates) loop(socket);
    }, rand);
};

module.exports = { router, handleSocket };
