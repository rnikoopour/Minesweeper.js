'use strict';
const net = require('net');

let board = require('./board');

board.createBoard();

let server = net.createServer((socket) => {
    socket.setEncoding('UTF-8');
    socket.on('data', (data) => {
	if (data.trim() == 'display') board.display();
	try {
	    const message = JSON.parse(data);
	    const response = handleMessage(message);
	    socket.write(JSON.stringify(response));
	} catch (e) {
	    socket.write('Unexpected Message: ' + data);
	}
    });
});

server.listen(2000, () => {
    console.log(server.address());
});

function handleMessage(message) {
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
    board.display();
    const obfuscatedBoard = board.getObfuscatedBoard();
    const boardState = board.getState();
    const response = {
	boardState,
	board: obfuscatedBoard
    }
    return response
}
