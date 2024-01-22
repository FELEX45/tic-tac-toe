document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM is ready');

    const socket = io('http://localhost:3001');
    console.log('Socket connected:', socket);

    let players = [];
    let currentPlayer = '';
    let myTurn = false;

    const boardElement = document.getElementById('board');

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
        console.log('Received updated players:', updatedPlayers);
        players = updatedPlayers;
    });

    socket.on('yourTurn', (turn) => {
        console.log('Received your turn:', turn);
        currentPlayer = turn;
        myTurn = (socket.id === players[0] && currentPlayer === 'X') || (socket.id === players[1] && currentPlayer === 'O');
    });

    socket.on('updateBoard', (updatedBoard) => {
        console.log('Received updated board:', updatedBoard);
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