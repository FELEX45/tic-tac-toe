document.addEventListener('DOMContentLoaded', () => {

    const socket = io('localhost:3001');
    const outputElement = document.getElementById('output');
    writeToOutput('Socket connected:', socket);

    let players = [];
    let currentPlayer = '';
    let myTurn = false;

    const boardElement = document.getElementById('board');

    function writeToOutput(message) {
        outputElement.innerHTML += `<p>${message}</p>`;
    }

    function createBoard() {
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => handleCellClick(i));
            boardElement.appendChild(cell);
        }
    }

    function updateBoard(updatedBoard) {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = updatedBoard[index];
        });
    }

    function handleCellClick(index) {
        if (myTurn) {
            socket.emit('makeMove', index);
        } else {
            alert("It's not your turn!");
        }
    }

    socket.on('updatePlayers', (updatedPlayers) => {
        writeToOutput('Received updated players:', updatedPlayers);
        players = updatedPlayers;
    });

    socket.on('yourTurn', (turn) => {
        writeToOutput('Received your turn:', turn);
        currentPlayer = turn;
        myTurn = (socket.id === players[0] && currentPlayer === 'X') || (socket.id === players[1] && currentPlayer === 'O');
    });

    socket.on('updateBoard', (updatedBoard) => {
        writeToOutput('Received updated board:', updatedBoard);
        updateBoard(updatedBoard);
    });

    socket.on('gameOver', ({ winner, board }) => {
        if (winner === 'draw') {
            alert('It\'s a draw!');
        } else {
            alert(`Player ${winner} wins!`);
        }
        updateBoard(board);
    });


    createBoard();
});
