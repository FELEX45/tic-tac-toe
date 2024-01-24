const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('client'));

let players = [];
let board = Array(9).fill(null);
let currentPlayer = 'X';

io.on('connection', (socket) => {
    console.log('Подключился пользователь ID:', socket.id);
    if (players.length < 2 ) {
        resetGame()
    }

    players.push(socket.id);
    io.emit('updatePlayers', players);

    io.to(players[0]).emit('yourTurn', currentPlayer);

    socket.on('makeMove', (index) => {
        if (socket.id === players[0] && currentPlayer === 'X' && board[index] === null) {
            board[index] = 'X';
            io.emit('updateBoard', board);
            checkWinner();
            currentPlayer = 'O';
            io.to(players[1]).emit('yourTurn', currentPlayer);
        } else if (socket.id === players[1] && currentPlayer === 'O' && board[index] === null) {
            board[index] = 'O';
            io.emit('updateBoard', board);
            checkWinner();
            currentPlayer = 'X';
            io.to(players[0]).emit('yourTurn', currentPlayer);
        }
    });

    socket.on('disconnect', () => {
        players = players.filter(player => player !== socket.id);
        io.emit('updatePlayers', players);
        console.log('Отключился пользователь ID:', socket.id);
    });
});

function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;

        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            const winner = board[a];
            io.emit('gameOver', { winner, board });
            resetGame();
            return;
        }
    }

    if (board.every(cell => cell !== null)) {
        io.emit('gameOver', { winner: 'draw', board });
        resetGame();
    }
}

function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    io.emit('updateBoard', board);
    io.to(players[0]).emit('yourTurn', currentPlayer);
}

const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log(`Сервер начал работу на PORT: ${port}`);
});
