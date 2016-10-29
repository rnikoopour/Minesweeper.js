'use strict';
const net = require('net');

let board = require('./board');

board.createBoard();

let gameSocket;
let server = net.createServer((socket) => {
    gameSocket = socket;
    socket.setEncoding('UTF-8');
    socket.on('data', (data) => {
	console.log('received:', data);
	try {
	    let shouldRespond = false;
	    const requests = JSON.parse(data);
	    requests.forEach((request) => {
		shouldRespond |= request.type ? handleRequest(request) : processCommand(request);
	    });
	    if (shouldRespond) {
		const response = createResponse();
		console.log('sending:', response);
		socket.write(response);
	    }
	} catch (e) {
	    console.log('Unexpected Data: ' + data);
	    console.log(e);
	    process.exit();
	}
    });
});

server.listen(2000, () => {
    console.log(server.address());
});

function processMessage({type, contents}) {
    switch(type) {
    case 'reveal': {
	board.revealCell(contents);
	break;
    }
    case 'toggleFlag': {
	board.toggleCellFlag(contents);
	break;
    }
    default: {
	console.log('Bad Message Type:', msgType);
	break;
    }
    }
    const shouldRespond = true;
    return shouldRespond;
}

function createResponse() {
    const obfuscatedBoard = board.getObfuscatedBoard();
    const boardState = board.getState();
    const response = {
	boardState,
	board: obfuscatedBoard
    }
    return JSON.stringify(response);
}

function handleRequest(message) {
    let response;
    if (message.type) response = processMessage(message);
    else response = processCommand(message);
    return response;
}

function processCommand(command) {
    let shouldRespond = false;;
    switch(command) {
    case 'sendBoard': {
	shouldRespond = true;
	break;
    }
    case 'display': {
	console.log('----- board state -----');
	board.display();
	console.log('-----------------------');
	break;
    }
    default: {
	console.log('Bad Command:', command);
	break;
    }
    }
    return shouldRespond;
}
