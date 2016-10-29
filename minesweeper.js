'use strict';
const net = require('net');

let board = require('./board');

board.createBoard();

let server = net.createServer((socket) => {
    socket.setEncoding('UTF-8');
    socket.on('data', (data) => {
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
    let response;
    switch(msgType) {
    case 'reveal':
	const {row, col} = message.contents;
	board.revealCell(row, col);
	board.display();
	const obfuscatedBoard = board.getObfuscatedBoard();
	const boardState = board.getState();
	response = {
	    boardState,
	    board: obfuscatedBoard
	}
	break;
    default:
	console.log('Bad Message Type:', msgType);
	break;
    }
    return response
}
