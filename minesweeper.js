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
	    const message = JSON.parse(data);
	    const response = handleMessage(message);
	    if (response) {
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

function processMessage(message) {
    const msgType = message.type;
    switch(msgType) {
    case 'reveal': {
	const {row, col} = message.contents;
	board.revealCell(row, col);
	break;
    }
    case 'toggleFlag': {
	const {row, col} = message.contents;
	board.toggleCellFlag(row, col);
	break;
    }
    default: {
	console.log('Bad Message Type:', msgType);
	break;
    }
    }
    const response = createResponse();
    return response;
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

function handleMessage(message) {
    let response;
    if (message.type) response = processMessage(message);
    else response = processCommand(message);
    return response;
}

function processCommand(command) {
    let response;
    switch(command) {
    case 'sendBoard': {
	response = createResponse();
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
    return response;
}
