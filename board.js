'use strict';
const CONSTS = require('./consts');

let board = [];    
let boardInfo = {
    numRows: CONSTS.DEFAULTROWS,
    numCols: CONSTS.DEFAULTCOLS,
    numMines: CONSTS.DEFAULTMINES,
    state: CONSTS.BOARDSTATES.READY
};

function createCell(row, col) {
    return {
	row,
	col,
	isMine: false,
	touching: -1,
	isRevealed: false,
	isFlagged: false
    };
}

function createBoard(numRows, numCols, numMines) {
    if (board.length) board = [];

    boardInfo.numRows = numRows || CONSTS.DEFAULTROWS;
    boardInfo.numCols = numCols || CONSTS.DEFAULTCOLS;
    boardInfo.numMines = numMines < (numRows * numCols) ? numMines : CONSTS.DEFAULTMINES;

    for (let row = 0; row < boardInfo.numRows; row++) {
	let curRow = [];
	for (let col = 0; col < boardInfo.numCols; col++) {
	    curRow.push(createCell(row, col));
	}
	board.push(curRow);
    }
    plantMines(boardInfo.numMines);
    updateTouching();
}

function plantMines(numMines) {
    let row;
    let col;
    let cell;

    function addMine() {
	let added = false;
	if (!cell.isMine) {
	    cell.isMine = true;
	    added = true;
	}
	return added;
    }

    while (numMines) {
	row = Math.floor((Math.random() * boardInfo.numRows));
	col = Math.floor((Math.random() * boardInfo.numCols));
	cell = board[row][col];
	const wasAdded = addMine();
	if (wasAdded) numMines--;
    }
}

function setTouching(cell) {
    cell.touching = countTouching(cell);
}

function updateTouching() {
    board.forEach((row) => {
	row.forEach((cell) => {
	    if (!cell.isMine) setTouching(cell);
	});
    });
}

function countTouching(cell) {
    const topRow = cell.row - 1;
    const bottomRow = cell.row + 1;
    const leftCol = cell.col - 1;
    const rightCol = cell.col + 1;

    let touching = 0;
    let row;
    let col;

    function isTouching() {
	return board[row] && board[row][col] && board[row][col].isMine;
    }
    
    function countTopRow() {
	row = topRow;
	col = leftCol;
	if (isTouching()) touching++;
	col = cell.col;
	if (isTouching()) touching++;
	col = rightCol;
	if (isTouching()) touching++;
    }

    function countMiddleRow() {
	row = cell.row;
	col = leftCol;
	if (isTouching()) touching++;
	col = rightCol;
	if (isTouching()) touching++;
    }

    function countBottomRow() {
	row = bottomRow
	col = leftCol;
	if (isTouching()) touching++;
	col = cell.col;
	if (isTouching()) touching++;
	col = rightCol
	if (isTouching()) touching++;
    }

    countTopRow();
    countMiddleRow();
    countBottomRow();
    return touching;
}

function toggleCellFlag(row, col) {
    let cell = board[row] && board[row][col];
    if (cell) cell.isFlagged = !cell.isFlagged;
}

function revealCell(row, col) {
    let cell = board[row] && board[row][col];
    if (cell && !cell.isRevealed && !cell.isFlagged) {
	cell.isRevealed = true;
	let topRow = cell.row - 1;
	let middleRow = cell.row;
	let bottomRow = cell.row + 1;
	let leftCol = cell.col - 1;
	let middleCol = cell.col;
	let rightCol = cell.col + 1;

	function revealTopRow() {
	    revealCell(topRow, leftCol);
	    revealCell(topRow, middleCol);
	    revealCell(topRow, rightCol);
	}

	function revealMiddleRow() {
	    revealCell(middleRow, leftCol);
	    revealCell(middleRow, rightCol);
	}

	function revealBottomRow() {
	    revealCell(bottomRow, leftCol);
	    revealCell(bottomRow, middleCol);
	    revealCell(bottomRow, rightCol);
	}

	if (cell.isMine) boardInfo.state = CONSTS.BOARDSTATES.LOST;
	if (cell.touching == 0) {
	    revealTopRow();
	    revealMiddleRow();
	    revealBottomRow();
	}
    }
}

function display() {
    board.forEach((row) => {
	let curRow = '';
	row.forEach((cell) => {
	    if (cell.isRevealed) {
		if (cell.isMine) curRow += 'M';
		else curRow += cell.touching;
	    } else {
		if (cell.isFlagged) curRow += 'F';
		else curRow += '?';
	    }
	});
	console.log(curRow);
    });
}

function getObfuscatedBoard() {
    let obfuscatedBoard = [];
    board.forEach((row) => {
	let curRow = [];
	row.forEach((cell) => {
	    if (cell.isRevealed) {
		if (cell.isMine) curRow.push('M');
		else curRow.push(cell.touching);
	    } else {
		if (cell.isFlagged) curRow.push('F');
		else curRow.push('?');
	    }
	});
	obfuscatedBoard.push(curRow);
    });
    return obfuscatedBoard;
}

function getState() {
    let state = boardInfo.state;
    function adjustState() {
	boardInfo.state = CONSTS.BOARDSTATES.WIN;
	for (let row = 0; row < boardInfo.numRows; row++) {
	    for (let col = 0; col < boardInfo.numCols; col++) {
		const cell = board[row][col];
		if (!cell.isMine && !cell.isRevealed) {
		    boardInfo.state = CONSTS.BOARDSTATES.READY;
		    break;
		}
	    }
	    if (boardInfo.state != CONSTS.BOARDSTATES.WIN) break;
	}
    }

    if (state != CONSTS.BOARDSTATES.LOST) {
	adjustState();
    }
    return boardInfo.state;
}

module.exports = {
    createBoard,
    display,
    revealCell,
    getObfuscatedBoard,
    toggleCellFlag,
    getState
}

