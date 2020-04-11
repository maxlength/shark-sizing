const TILES_FOR_SIDE = 7;

class Tile {
  constructor(
    type,
    isBlock = false,
    treasure = null,
    up = false,
    down = false,
    left = false,
    right = false,
    isOutOfBoard = false,
    position = -1,
    playersOn = []
  ) {
    this.type = type;
    this.isBlock = isBlock;
    this.treasure = treasure;
    this.up = up;
    this.down = down;
    this.left = left;
    this.right = right;
    this.isOutOfBoard = isOutOfBoard;
    this.position = position;
    this.playersOn = playersOn;
    this.deg = 0;

    if (!this.isBlock) {
      this.setRandomRotation();
    }

    this.setRotationDeg();
  }

  setRandomRotation() {
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

  setRotationDeg() {
    switch (this.type) {
      case "I":
        this.deg = this.up ? "0" : "90";
        break;
      case "L":
        if (this.up && this.right) {
          this.deg = "0";
        } else if (this.right && this.down) {
          this.deg = "90";
        } else if (this.down && this.left) {
          this.deg = "180";
        } else {
          this.deg = "270";
        }
        break;
      case "T":
        if (this.left && this.right && this.down) {
          this.deg = "0";
        } else if (this.up && this.down && this.left) {
          this.deg = "90";
        } else if (this.left && this.up && this.right) {
          this.deg = "180";
        } else {
          this.deg = "270";
        }
        break;
    }
  }
}

class Player {
  constructor(color, position, cards = []) {
    this.color = color;
    this.position = position;
    this.previousPosition = position;
    this.hasMovedTile = false;
    this.cards = cards;
    this.currentCardToFind = cards[0];
  }
}

class Card {
  constructor(treasure) {
    this.treasure = treasure;
  }
}

const cards = [
  new Card("anello"),
  new Card("bottino"),
  new Card("candelabro"),
  new Card("chiavi"),
  new Card("corona"),
  new Card("drago"),
  new Card("elmo"),
  new Card("falena"),
  new Card("fantasma"),
  new Card("fata"),
  new Card("genio"),
  new Card("gnomo"),
  new Card("gufo"),
  new Card("libro"),
  new Card("mappa"),
  new Card("pipistrello"),
  new Card("ragno"),
  new Card("scarabeo"),
  new Card("scrigno"),
  new Card("smeraldo"),
  new Card("spada"),
  new Card("teschio"),
  new Card("topo"),
];

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

shuffle(cards);

const yellowPlayer = new Player("giallo", 0, [cards[0], cards[1], cards[2]]);
const redPlayer = new Player("rosso", 6, [cards[3], cards[4], cards[5]]);
const bluePlayer = new Player("blu", 48, [cards[6], cards[7], cards[8]]);
const greenPlayer = new Player("verde", 42, [cards[9], cards[10], cards[22]]);
const players = [yellowPlayer, redPlayer, bluePlayer, greenPlayer];

let currentPlayerIndex = 0;
let currentPlayer = players[(currentPlayerIndex = 0)];
const yourPlayer = yellowPlayer;

let positionToBeDisabled = -1;

let boardArray;
let tileToPlay;
let previousTileToPlay;

// DOM
const body = document.getElementsByTagName("body")[0];
const currentPlayerContainer = document.getElementsByClassName(
  "currentPlayer"
)[0];
const board = document.getElementsByClassName("board")[0];
const tileToPlayPlaceholder = document.getElementsByClassName("currentTile")[0];
const movers = document.getElementsByClassName("mover");
const treasureToFind = document.getElementsByClassName("currentTreasure")[0];
const endTurnButton = document.getElementsByClassName("endTurn")[0];

// 12 tessere I
// 6 tessere T
// 16 tessere L
const moveableTiles = [
  new Tile("T", false, "pipistrello"),
  new Tile("T", false, "fantasma"),
  new Tile("T", false, "genio"),
  new Tile("T", false, "gnomo"),
  new Tile("T", false, "drago"),
  new Tile("T", false, "fata"),
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
  new Tile("L", false, "topo"),
  new Tile("L", false, "ragno"),
  new Tile("L", false, "lucertola"),
  new Tile("L", false, "gufo"),
  new Tile("L", false, "scarabeo"),
  new Tile("L", false, "falena"),
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
    tile: new Tile("L", true, "blu", true, false, true, false, false, 0, [
      bluePlayer,
    ]),
  },
  { pos: 32, tile: new Tile("T", true, "elmo", true, false, true, true) },
  { pos: 31, tile: new Tile("T", true, "candelabro", true, false, true, true) },
  {
    pos: 30,
    tile: new Tile("L", true, "verde", true, false, false, true, false, 0, [
      greenPlayer,
    ]),
  },
  { pos: 23, tile: new Tile("T", true, "spada", true, true, true, false) },
  { pos: 22, tile: new Tile("T", true, "smeraldo", true, true, true, false) },
  { pos: 21, tile: new Tile("T", true, "scrigno", true, false, true, true) },
  { pos: 20, tile: new Tile("T", true, "anello", true, true, false, true) },
  { pos: 13, tile: new Tile("T", true, "teschio", true, true, true, false) },
  { pos: 12, tile: new Tile("T", true, "chiavi", false, true, true, true) },
  { pos: 11, tile: new Tile("T", true, "corona", true, true, false, true) },
  { pos: 10, tile: new Tile("T", true, "mappa", true, true, false, true) },
  {
    pos: 3,
    tile: new Tile("L", true, "rosso", false, true, true, false, false, 0, [
      redPlayer,
    ]),
  },
  { pos: 2, tile: new Tile("T", true, "bottino", false, true, true, true) },
  { pos: 1, tile: new Tile("T", true, "libro", false, true, true, true) },
  {
    pos: 0,
    tile: new Tile("L", true, "giallo", false, true, false, true, false, 0, [
      yellowPlayer,
    ]),
  },
];

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

const renderTile = (tile, containerToAppendTo) => {
  let tileContainer = document.createElement("DIV");
  tileContainer.classList.add("tile");
  if (tile.treasure) {
    let treasureContainer = document.createElement("DIV");
    treasureContainer.classList.add("treasure", tile.treasure);
    tileContainer.appendChild(treasureContainer);
  }

  tileContainer.dataset["position"] = tile.position;
  tileContainer.dataset["type"] = tile.type;
  tileContainer.dataset["deg"] = tile.deg;

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

const renderTreasureToFind = (player) => {
  if (player.currentCardToFind) {
    treasureToFind.innerHTML = "";
    const treasureDom = document.createElement("DIV");
    treasureDom.classList.add(
      "treasureCard",
      player.currentCardToFind.treasure
    );
    treasureToFind.appendChild(treasureDom);
    let leftPos = 20;
    let zIndex = -1;
    for (let i = 1; i < player.cards.length; i++) {
      let treasureHidden = document.createElement("DIV");
      treasureHidden.classList.add("treasureCard", "hiddenTreasureCard");
      treasureHidden.style.left = leftPos + "px";
      treasureHidden.style.zIndex = zIndex;
      treasureToFind.appendChild(treasureHidden);
      leftPos += 20;
      zIndex--;
    }
  }
};

const playerOnTreasure = (player, currentTile) => {
  if (
    player.currentCardToFind &&
    player.currentCardToFind.treasure === currentTile.treasure
  ) {
    console.log("You founded: " + currentTile.treasure);
    player.cards.splice(player.cards.indexOf(player.currentCardToFind), 1);
    player.currentCardToFind = player.cards[0];
    if (player.currentCardToFind === undefined) {
      console.log("Come back to home!");
    } else {
      renderTreasureToFind(player);
    }
    endTurnButton.click();
  }
};

const playerOnHome = (player, currentTile) => {
  if (player.color === currentTile.treasure) {
    if (player.cards.length === 0) {
      console.log(player.color + "  won the game!");
    }
  }
};

const renderPlayer = (player) => {
  const tileWherePlayerIs = document.querySelector(
    `.tile[data-position="${player.position}"]`
  );
  const tileWherePlayerWas = document.querySelector(
    `.tile[data-position="${player.previousPosition}"]`
  );

  const currentTile = boardArray[player.position];

  if (currentTile.playersOn.length > 1) {
    tileWherePlayerIs.classList.add("morePlayers");
  }

  if (boardArray[player.previousPosition].playersOn.length < 2) {
    tileWherePlayerWas.classList.remove("morePlayers");
  }

  tileWherePlayerIs.classList.add(`player-${player.color}`);

  playerOnTreasure(player, currentTile);
  playerOnHome(player, currentTile);
};

const renderPlayers = () => {
  for (let i = 0; i < players.length; i++) {
    renderPlayer(players[i]);
  }
};

const renderCurrentPlayer = () => {
  currentPlayerContainer.innerHTML = currentPlayer.color;
  body.classList = [currentPlayer.color];
};

const renderElementsGame = () => {
  renderBoard();
  renderTileToPlay();
  renderPlayers();
  renderTreasureToFind(yourPlayer);
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

const updatePlayerOutOfBoardPosition = (insertTilePosition) => {
  if (tileToPlay.playersOn.length) {
    for (let i = 0; i < tileToPlay.playersOn.length; i++) {
      tileToPlay.playersOn[i].position = insertTilePosition;
      boardArray[insertTilePosition].playersOn.push(tileToPlay.playersOn[i]);
    }
    previousTileToPlay.playersOn = [];
    tileToPlay.playersOn = [];
  }
};

const moveTiles = (insertTilePosition) => {
  let from = getTileFromMovement(insertTilePosition);

  extractTileToPlay(insertTilePosition, from);
  updateBoardTilesPosition(insertTilePosition, from);
  setTileToPlayInPosition(insertTilePosition);
  updatePlayerOutOfBoardPosition(insertTilePosition);

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
  tileToPlay.setRotationDeg();
  renderTileToPlay();
});

board.addEventListener("click", (e) => {
  if (!currentPlayer.hasMovedTile) return;
  const tileTo = e.target.classList.contains("tile")
    ? e.target
    : e.target.closest(".tile");
  if (tileTo) {
    const tileToPosition = parseInt(tileTo.dataset.position);
    if (canPlayerGoToTile(tileToPosition)) {
      currentPlayer.previousPosition = currentPlayer.position;
      currentPlayer.position = tileToPosition;

      let tileWherePlayerWas = document.querySelector(
        `.player-${currentPlayer.color}`
      );
      tileWherePlayerWas.classList.remove(`player-${currentPlayer.color}`);

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
    if (currentPlayer.hasMovedTile) return;
    const position = e.target.dataset.position;
    if (position !== positionToBeDisabled) {
      moveTiles(parseInt(position));
      updateDisabledMovement(e.target);
      currentPlayer.hasMovedTile = true;
    }
  });
}

endTurnButton.addEventListener("click", () => {
  if (!currentPlayer.hasMovedTile) return;
  currentPlayer.hasMovedTile = false;
  if (currentPlayerIndex < players.length - 1) {
    currentPlayerIndex++;
  } else {
    currentPlayerIndex = 0;
  }
  currentPlayer = players[currentPlayerIndex];
  renderCurrentPlayer();
});

renderElementsGame();
renderCurrentPlayer();
