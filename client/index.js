document.addEventListener("DOMContentLoaded", () => {
  const socket = io("localhost:3001");
  const outputElement = document.getElementById("output");
  const playState = document.getElementById("state");
  const turnElement = document.getElementById("turn");

  const modal = document.querySelector(".modal");
  const overlay = document.querySelector(".overlay");
  const closeModalBtn = document.querySelector(".btn-close");

  writeToOutput("Подключение стабильно", socket);
  writeState("Вы играете за O");
  turnElement.innerHTML = "Сейчас ходит X";

  let players = [];
  let currentPlayer = "";
  let myTurn = false;

  const boardElement = document.getElementById("board");

  function writeToOutput(message) {
    outputElement.innerHTML += `<p>${message}</p>`;
  }

  function writeState(message) {
    playState.innerHTML = message;
  }

  function createBoard() {
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.index = i;
      cell.addEventListener("click", () => handleCellClick(i));
      boardElement.appendChild(cell);
    }
  }

  function updateBoard(updatedBoard) {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
      cell.textContent = updatedBoard[index];
    });
  }

  function handleCellClick(index) {
    if (myTurn) {
      socket.emit("makeMove", index);
    } else {
      modal.innerHTML = "";
      modal.innerHTML += `Не ваш ход!`;
    }
  }

  socket.on("updatePlayers", (updatedPlayers) => {
    players = updatedPlayers;
  });

  socket.on("turnH", (turnH) => {
    turnElement.innerHTML = `<p>Сейчас ходит ${turnH}</p>`;
  });

  socket.on("yourTurn", (turn) => {
    console.log("Текущий ход: ", turn);
    writeState("Вы играете за " + turn);
    currentPlayer = turn;
    myTurn =
      (socket.id === players[0] && currentPlayer === "X") ||
      (socket.id === players[1] && currentPlayer === "O");
  });

  socket.on("updateBoard", (updatedBoard) => {
    updateBoard(updatedBoard);
  });

  socket.on("gameOver", ({ winner, board }) => {
    if (winner === "draw") {
      modal.innerHTML = "";
      modal.innerHTML += `НИЧЬЯ`;
      // alert('Ничья!');
      openModal();
    } else {
      // alert(`Игрок ${winner} победил!`);
      modal.innerHTML = "";
      modal.innerHTML += `Игрок ${winner} победил!`;
      openModal();
    }
    updateBoard(board);
  });

  createBoard();

  // close modal function
  const closeModal = function () {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
  };

  // close the modal when the close button and overlay is clicked
  closeModalBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  // close modal when the Esc key is pressed
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  // open modal function
  const openModal = function () {
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
  };
});
