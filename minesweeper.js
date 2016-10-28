'use strict';
const readline = require('readline');

const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const numRows = 5;
const numCols = 5;
const numMines = 3;

function createCell(row, col) {
    return {
	row,
	col,
	isMine: false,
	touching: -1,
	isRevealed: false
    };
}

function createBoard(numRows, numCols) {
    let board = [];    
    for (let i = 0; i < numRows; i++) {
	let row = [];
	for (let j = 0; j < numCols; j++) {
	    row.push(createCell(i, j));
	}
	board.push(row);
    }
    return board;
}

function addMine(board, row, col) {
    let added = false;
    let cell = board[row][col];
    if (!cell.isMine) {
	cell.isMine = true;
	added = true;
    }
    return added;
}

function plantMines(board, numMines) {
    while (numMines) {
	const randRow = Math.floor((Math.random() * numRows));
	const randCol = Math.floor((Math.random() * numCols));
	const added = addMine(board, randRow, randCol);
	if (added) numMines--;
    }
}

function updateTouching(board) {
    board.forEach((row) => {
	row.forEach((cell) => {
	    if (!cell.isMine) setTouching(board, cell);
	});
    });
}

function setTouching(board, cell) {
    cell.touching = countTouching(board, cell);
}

function countTouching(board, cell) {
    let row;
    let col;
    let touching = 0;
    function isTouching() {
	return board[row] && board[row][col] && board[row][col].isMine;
    }
    // Top Row
    row = cell.row - 1;
    col = cell.col - 1;
    if (isTouching()) touching++;
    col = cell.col;
    if (isTouching()) touching++;
    col = cell.col + 1;
    if (isTouching()) touching++;

    // Center Row
    row = cell.row
    col = cell.col - 1;
    if (isTouching()) touching++;
    col = cell.col + 1;
    if (isTouching()) touching++;

    // Bottom Row
    row = cell.row + 1;
    col = cell.col - 1;
    if (isTouching()) touching++;
    col = cell.col;
    if (isTouching()) touching++;
    col = cell.col + 1;
    if (isTouching()) touching++;

    return touching;
}

function displayBoard(board) {
    console.log();
    board.forEach((row) => {
	let curRow = '';
	row.forEach((cell) => {
	    if (cell.isRevealed) {
		if (cell.isMine) curRow += 'M';
		else curRow += cell.touching;
	    } else {
		curRow += '?'
	    }
	});
	console.log(curRow);
    });
}

function promptUser(board) {
    displayBoard(board);
    if (!board.gameOver) {
	prompt.question('Click Cell: ', (ans) => {
	    let row, col;
	    [row, col] = ans.split(' ');
	    revealCell(board, row, col);
	    if (checkWin(board)) winner(board);
	    else promptUser(board);
	});
    } else {
	console.log('GAME OVER :(');
    }
}

function winner(board) {
    displayBoard(board);
    console.log('WINNER!!!!');
}

function checkWin(board) {
    let win = true;
    board.forEach((row) => {
	row.forEach((cell) => {
	    if (!cell.isMine && !cell.isRevealed) win = false;
	});
    });
    return win;
}

function revealCell(board, row, col) {
    let cell = board[row] && board[row][col];
    if (cell && !cell.isRevealed) {
	cell.isRevealed = true;
	if (cell.isMine) board.gameOver = true;
	if (cell.touching == 0) {
	    // Top
	    revealCell(board, cell.row - 1, cell.col - 1);
	    revealCell(board, cell.row - 1, cell.col);
	    revealCell(board, cell.row - 1, cell.col + 1);

	    // Center
	    revealCell(board, cell.row, cell.col - 1);
	    revealCell(board, cell.row, cell.col + 1);

	    // Bottom
	    revealCell(board, cell.row + 1, cell.col - 1);
	    revealCell(board, cell.row + 1, cell.col);
	    revealCell(board, cell.row + 1, cell.col + 1);
	}
    }
}

let board = createBoard(numRows, numCols);
plantMines(board, numMines);
updateTouching(board);
board.gameOver = false;
promptUser(board);
