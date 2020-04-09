const TILES_FOR_SIDE = 7;

class Tile {
  constructor(
    type,
    treasure = null,
    up = false,
    down = false,
    left = false,
    right = false,
    isOutOfBoard = false,
    position = -1,
    playersOn = []
  ) {
    this.type = type; // I, T, L, X
    this.treasure = treasure;
    this.up = up;
    this.down = down;
    this.left = left;
    this.right = right;
    this.isOutOfBoard = isOutOfBoard;
    this.position = position; // 0, 1, 2...
    this.playersOn = playersOn;

    this.orientate();
  }

  orientate() {
    switch (this.type) {
      case "I":
        this.up = this.down = Boolean(Math.round(Math.random()));
        this.left = this.right = !this.up;
        break;
      case "L":
        this.up = Boolean(Math.round(Math.random()));
        this.left = Boolean(Math.round(Math.random()));
        this.down = !this.up;
        this.right = !this.left;
        break;
      case "T":
        this.up = Boolean(Math.round(Math.random()));
        this.down = Boolean(Math.round(Math.random()));
        if (this.up && this.down) {
          this.left = Boolean(Math.round(Math.random()));
          this.right = !this.left;
        } else if (!this.up || !this.down) {
          this.left = this.right = true;

          if (!this.up && !this.down) {
            this.up = Boolean(Math.round(Math.random()));
            this.down = !this.up;
          }
        }
        break;
    }
  }
}

class Player {
  constructor(color, position) {
    this.color = color;
    this.position = position;
    this.previousPosition = position;
  }
}

const yellowPlayer = new Player("giallo", 0);
const redPlayer = new Player("rosso", 6);
const bluePlayer = new Player("blu", 48);
const greenPlayer = new Player("verde", 42);
const players = [yellowPlayer, redPlayer, bluePlayer, greenPlayer];

let currentPlayerIndex = 0;
let currentPlayer = players[(currentPlayerIndex = 0)];

let positionToBeDisabled = -1;

let boardArray;
let tileToPlay;
let previousTileToPlay;

// DOM
const body = document.getElementsByTagName("body")[0];
const board = document.getElementsByClassName("board")[0];
const tileToPlayPlaceholder = document.getElementsByClassName("currentTile")[0];
const movers = document.getElementsByClassName("mover");
const endTurnButton = document.getElementsByClassName("endTurn")[0];

// 12 tessere I
// 6 tessere T
// 16 tessere L
const moveableTiles = [
  new Tile("T", "pipistrello"),
  new Tile("T", "fantasma"),
  new Tile("T", "genio"),
  new Tile("T", "gnomo"),
  new Tile("T", "drago"),
  new Tile("T", "fata"),
  new Tile("I"),
  new Tile("I"),
  new Tile("I"),
  new Tile("I"),
  new Tile("I"),
  new Tile("I"),
  new Tile("I"),
  new Tile("I"),
  new Tile("I"),
  new Tile("I"),
  new Tile("I"),
  new Tile("I"),
  new Tile("L", "topo"),
  new Tile("L", "ragno"),
  new Tile("L", "lucertola"),
  new Tile("L", "gufo"),
  new Tile("L", "scarabeo"),
  new Tile("L", "falena"),
  new Tile("L"),
  new Tile("L"),
  new Tile("L"),
  new Tile("L"),
  new Tile("L"),
  new Tile("L"),
  new Tile("L"),
  new Tile("L"),
  new Tile("L"),
  new Tile("L"),
];

// 16 tessere bloccate X
const blocksTiles = [
  {
    pos: 33,
    tile: new Tile("X", "blu", true, false, true, false, false, 0, [
      bluePlayer,
    ]),
  },
  { pos: 32, tile: new Tile("X", "elmo", true, false, true, true) },
  { pos: 31, tile: new Tile("X", "candelabro", true, false, true, true) },
  {
    pos: 30,
    tile: new Tile("X", "verde", true, false, false, true, false, 0, [
      greenPlayer,
    ]),
  },
  { pos: 23, tile: new Tile("X", "spada", true, true, true, false) },
  { pos: 22, tile: new Tile("X", "smeraldo", true, true, true, false) },
  { pos: 21, tile: new Tile("X", "tesoro", true, false, true, true) },
  { pos: 20, tile: new Tile("X", "anello", true, true, false, true) },
  { pos: 13, tile: new Tile("X", "teschio", true, true, true, false) },
  { pos: 12, tile: new Tile("X", "chiavi", false, true, true, true) },
  { pos: 11, tile: new Tile("X", "corona", true, true, false, true) },
  { pos: 10, tile: new Tile("X", "mappa", true, true, false, true) },
  {
    pos: 3,
    tile: new Tile("X", "rosso", false, true, true, false, false, 0, [
      redPlayer,
    ]),
  },
  { pos: 2, tile: new Tile("X", "bottino", false, true, true, true) },
  { pos: 1, tile: new Tile("X", "libro", false, true, true, true) },
  {
    pos: 0,
    tile: new Tile("X", "giallo", false, true, false, true, false, 0, [
      yellowPlayer,
    ]),
  },
];

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const extractRandomTile = () => {
  const randomNumber = getRandomInt(0, moveableTiles.length - 1);
  tileToPlay = moveableTiles.splice(randomNumber, 1)[0];
  tileToPlay.isOutOfBoard = true;
  previousTileToPlay = tileToPlay;
};

const buildBoardArray = () => {
  boardArray = moveableTiles;

  shuffle(boardArray);

  // Aggiunge le tessere bloccate
  for (let i = 0; i < blocksTiles.length; i++) {
    boardArray.splice(blocksTiles[i].pos, 0, blocksTiles[i].tile);
  }
  // Aggiunge position alle tessere
  for (let i = 0; i < boardArray.length; i++) {
    boardArray[i].position = i;
  }
};

extractRandomTile();
buildBoardArray();

const isARoad = (index, tile) => {
  return (
    index == 4 ||
    (index == 1 && tile.up) ||
    (index == 3 && tile.left) ||
    (index == 5 && tile.right) ||
    (index == 7 && tile.down)
  );
};

const hasATreasure = (index, tile) => {
  return index == 4 && tile.treasure;
};

const createSubtiles = (tile, tileContainer) => {
  let subtilesList = document.createElement("UL");
  subtilesList.classList.add("subtiles");

  for (let i = 0; i < 9; i++) {
    let subtile = document.createElement("LI");
    subtile.classList.add("subtile");

    if (isARoad(i, tile)) {
      subtile.classList.add("road");
    }
    if (hasATreasure(i, tile)) {
      subtile.classList.add("treasure", tile.treasure);
    }
    subtilesList.appendChild(subtile);
  }

  tileContainer.appendChild(subtilesList);
};

const renderTile = (tile, containerToAppendTo) => {
  let tileContainer = document.createElement("DIV");
  tileContainer.classList.add("tile");
  tileContainer.dataset["position"] = tile.position;
  tileContainer.dataset["type"] = tile.type;

  if (tile.type !== "E") {
    createSubtiles(tile, tileContainer);
  } else {
    tileContainer.classList.add("empty");
  }

  containerToAppendTo.appendChild(tileContainer);
};

const renderTileToPlay = () => {
  tileToPlayPlaceholder.innerHTML = "";
  renderTile(tileToPlay, tileToPlayPlaceholder);
};

const renderBoard = () => {
  board.innerHTML = "";
  for (let i = 0; i < boardArray.length; i++) {
    if (boardArray[i]) {
      renderTile(boardArray[i], board);
    }
  }
};

const renderPlayer = (player) => {
  document
    .querySelector(`.tile[data-position="${player.position}"]`)
    .classList.add(player.color, "player");
};

const renderPlayers = () => {
  for (let i = 0; i < players.length; i++) {
    renderPlayer(players[i]);
  }
};

const renderElementsGame = () => {
  renderBoard();
  renderTileToPlay();
  renderPlayers();
};

const rotateTile = (tile) => {
  switch (tile.type) {
    case "I":
      tile.up = !tile.up;
      tile.down = !tile.down;
      tile.left = !tile.left;
      tile.right = !tile.right;
      break;
    case "L":
      if (tile.up && tile.left) {
        tile.left = false;
        tile.right = true;
      } else if (tile.up && tile.right) {
        tile.up = false;
        tile.down = true;
      } else if (tile.right && tile.down) {
        tile.right = false;
        tile.left = true;
      } else if (tile.down && tile.left) {
        tile.down = false;
        tile.up = true;
      }
      break;
    case "T":
      if (!tile.up) {
        tile.up = true;
        tile.right = false;
      } else if (!tile.down) {
        tile.down = true;
        tile.left = false;
      } else if (!tile.left) {
        tile.left = true;
        tile.up = false;
      } else if (!tile.right) {
        tile.right = true;
        tile.down = false;
      }
      break;
  }
};

const setTileToPlayInPosition = (pos) => {
  previousTileToPlay.position = pos;
  previousTileToPlay.isOutOfBoard = false;
  boardArray[pos] = previousTileToPlay;
  previousTileToPlay = tileToPlay;
};

const extractTileToPlay = (pos, from) => {
  let comingOutTilePosition = -1;
  if (from === "top") {
    comingOutTilePosition = pos + (TILES_FOR_SIDE - 1) * TILES_FOR_SIDE;
  } else if (from === "bottom") {
    comingOutTilePosition = pos - (TILES_FOR_SIDE - 1) * TILES_FOR_SIDE;
  } else if (from === "left") {
    comingOutTilePosition = pos + TILES_FOR_SIDE - 1;
  } else if (from === "right") {
    comingOutTilePosition = pos - TILES_FOR_SIDE + 1;
  }
  const comingOutTile = boardArray[comingOutTilePosition];
  comingOutTile.isOutOfBoard = true;
  comingOutTile.position = -1;

  const emptyTile = new Tile("E");
  emptyTile.position = comingOutTilePosition;
  boardArray[comingOutTilePosition] = emptyTile;

  tileToPlay = comingOutTile;
};

const updateTilePosition = (prevPosition, currentPos) => {
  const tileToMove = boardArray[prevPosition];
  tileToMove.position = currentPos;
  boardArray[currentPos] = tileToMove;

  const emptyTile = new Tile("E");
  emptyTile.position = prevPosition;
  boardArray[prevPosition] = emptyTile;

  const playersOn = tileToMove.playersOn;
  if (playersOn.length) {
    for (let i = 0; i < playersOn.length; i++) {
      playersOn[i].previousPosition = playersOn[i].position;
      playersOn[i].position = tileToMove.position;
    }
  }
};

const updateBoardTilesPosition = (pos, from) => {
  let lastTilePosition = -1;
  let previousTilePosition;

  switch (from) {
    case "top":
      lastTilePosition = pos + (TILES_FOR_SIDE - 1) * TILES_FOR_SIDE;
      for (
        currentTilePosition = lastTilePosition;
        currentTilePosition > 6;
        currentTilePosition = currentTilePosition - TILES_FOR_SIDE
      ) {
        previousTilePosition = currentTilePosition - TILES_FOR_SIDE;
        updateTilePosition(previousTilePosition, currentTilePosition);
      }
      break;
    case "bottom":
      lastTilePosition = pos - (TILES_FOR_SIDE - 1) * TILES_FOR_SIDE;
      for (
        currentTilePosition = lastTilePosition;
        currentTilePosition < 41;
        currentTilePosition = currentTilePosition + TILES_FOR_SIDE
      ) {
        previousTilePosition = currentTilePosition + TILES_FOR_SIDE;
        updateTilePosition(previousTilePosition, currentTilePosition);
      }
      break;
    case "left":
      lastTilePosition = pos + TILES_FOR_SIDE - 1;
      for (
        currentTilePosition = lastTilePosition;
        currentTilePosition > lastTilePosition - TILES_FOR_SIDE + 1;
        currentTilePosition = currentTilePosition - 1
      ) {
        previousTilePosition = currentTilePosition - 1;
        updateTilePosition(previousTilePosition, currentTilePosition);
      }
      break;
    case "right":
      lastTilePosition = pos - TILES_FOR_SIDE + 1;
      for (
        currentTilePosition = lastTilePosition;
        currentTilePosition < lastTilePosition + TILES_FOR_SIDE - 1;
        currentTilePosition = currentTilePosition + 1
      ) {
        previousTilePosition = currentTilePosition + 1;
        updateTilePosition(previousTilePosition, currentTilePosition);
      }
      break;
  }
};

const getTileFromMovement = (insertTilePosition) => {
  let from = "";
  switch (insertTilePosition) {
    case 1:
    case 3:
    case 5:
      from = "top";
      break;
    case 43:
    case 45:
    case 47:
      from = "bottom";
      break;
    case 7:
    case 21:
    case 35:
      from = "left";
      break;
    case 13:
    case 27:
    case 41:
      from = "right";
      break;
  }
  return from;
};

const moveTiles = (insertTilePosition) => {
  let from = getTileFromMovement(insertTilePosition);

  extractTileToPlay(insertTilePosition, from);
  updateBoardTilesPosition(insertTilePosition, from);
  setTileToPlayInPosition(insertTilePosition);

  renderElementsGame();
};

const updateDisabledMovement = (mover) => {
  let disabledMover = document.querySelector(".mover.disabled");
  if (disabledMover) {
    disabledMover.classList.remove("disabled");
  }
  positionToBeDisabled = mover.dataset.disablePosition;
  document
    .querySelector(`[data-position="${positionToBeDisabled}"]`)
    .classList.add("disabled");
};

const canPlayerMoveRight = (tileToPosition) => {
  return (
    tileToPosition === currentPlayer.position + 1 &&
    boardArray[currentPlayer.position].right &&
    boardArray[tileToPosition].left
  );
};

const canPlayerMoveDown = (tileToPosition) => {
  return (
    tileToPosition === currentPlayer.position + 7 &&
    boardArray[currentPlayer.position].down &&
    boardArray[tileToPosition].up
  );
};

const canPlayerMoveLeft = (tileToPosition) => {
  return (
    tileToPosition === currentPlayer.position - 1 &&
    boardArray[currentPlayer.position].left &&
    boardArray[tileToPosition].right
  );
};

const canPlayerMoveUp = (tileToPosition) => {
  return (
    tileToPosition === currentPlayer.position - 7 &&
    boardArray[currentPlayer.position].up &&
    boardArray[tileToPosition].down
  );
};

const canPlayerGoToTile = (tileToPosition) => {
  return (
    canPlayerMoveUp(tileToPosition) ||
    canPlayerMoveDown(tileToPosition) ||
    canPlayerMoveLeft(tileToPosition) ||
    canPlayerMoveRight(tileToPosition)
  );
};

// EVENTS

tileToPlayPlaceholder.addEventListener("click", () => {
  rotateTile(tileToPlay);
  renderTileToPlay();
});

board.addEventListener("click", (e) => {
  const tileTo = e.target.classList.contains("tile")
    ? e.target
    : e.target.closest(".tile");
  if (tileTo) {
    const tileToPosition = parseInt(tileTo.dataset.position);
    if (canPlayerGoToTile(tileToPosition)) {
      currentPlayer.previousPosition = currentPlayer.position;
      currentPlayer.position = tileToPosition;
      document
        .querySelector(`.player.${currentPlayer.color}`)
        .classList.remove("player", currentPlayer.color);

      boardArray[currentPlayer.position].playersOn.push(currentPlayer);

      let prevTilePlayers =
        boardArray[currentPlayer.previousPosition].playersOn;
      prevTilePlayers.splice(prevTilePlayers.indexOf(currentPlayer), 1);

      renderPlayer(currentPlayer);
    }
  }
});

for (let i = 0; i < movers.length; i++) {
  movers[i].addEventListener("click", (e) => {
    const position = e.target.dataset.position;
    if (position !== positionToBeDisabled) {
      moveTiles(parseInt(position));
      updateDisabledMovement(e.target);
    }
  });
}

endTurnButton.addEventListener("click", () => {
  if (currentPlayerIndex < players.length - 1) {
    currentPlayerIndex++;
  } else {
    currentPlayerIndex = 0;
  }
  currentPlayer = players[currentPlayerIndex];
});

renderElementsGame();
