document.addEventListener('DOMContentLoaded', () => {

    const socket = io('localhost:3001');
    const outputElement = document.getElementById('output');
    const playState = document.getElementById("state");
    const turnElement = document.getElementById("turn");

    writeToOutput('Подключение стабильно', socket);
    writeState('Вы играете за O');
    turnElement.innerHTML = 'Сейчас ходит X'


    let players = [];
    let currentPlayer = '';
    let myTurn = false;

    const boardElement = document.getElementById('board');

    function writeToOutput(message) {
        outputElement.innerHTML += `<p>${message}</p>`;
    }

    function writeState(message) {
        playState.innerHTML = message;
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
            alert("Не ваш ход!"+ currentPlayer);
        }
    }

    socket.on('updatePlayers', (updatedPlayers) => {
        players = updatedPlayers;
    });

    socket.on('turnH', (turnH) =>{
        turnElement.innerHTML = `<p>Сейчас ходит ${turnH}</p>`
    })

    socket.on('yourTurn', (turn) => {
        console.log('Текущий ход: ', turn);
        writeState('Вы играете за ' + turn);
        currentPlayer = turn;
        myTurn = (socket.id === players[0] && currentPlayer === 'X') || (socket.id === players[1] && currentPlayer === 'O');
    });

    socket.on('updateBoard', (updatedBoard) => {
        updateBoard(updatedBoard);
    });

    socket.on('gameOver', ({ winner, board }) => {
        if (winner === 'draw') {
            alert('Ничья!');
        } else {
            alert(`Игрок ${winner} победил!`);
        }
        updateBoard(board);
    });

    createBoard();
});
