class Tile {
  constructor(
    type,
    treasure = null,
    up = false,
    down = false,
    left = false,
    right = false,
    isOutOfBoard = false,
    position = 0
  ) {
    this.type = type; // I, T, L, X
    this.treasure = treasure;
    this.up = up;
    this.down = down;
    this.left = left;
    this.right = right;
    this.isOutOfBoard = isOutOfBoard;
    this.position = position; // 0, 1, 2...

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

// 12 tessere I
// 6 tessere T
// 16 tessere L
// 16 tessere bloccate
// const moveableTiles = [
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

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Estrae la prima tessera con cui giocare
const randomNumber = getRandomInt(0, moveableTiles.length - 1);
let randomTile = moveableTiles.splice(randomNumber, 1)[0];
randomTile.isOutOfBoard = true;

console.log(randomTile);
console.log(moveableTiles.length);

var board = moveableTiles;

const blocksTiles = [
  { pos: 33, tile: new Tile("X", "blu", true, false, true, false) },
  { pos: 32, tile: new Tile("X", "elmo", true, false, true, true) },
  { pos: 31, tile: new Tile("X", "candelabro", true, false, true, true) },
  { pos: 30, tile: new Tile("X", "verde", true, false, false, true) },
  { pos: 23, tile: new Tile("X", "spada", true, true, true, false) },
  { pos: 22, tile: new Tile("X", "smeraldo", true, true, true, false) },
  { pos: 21, tile: new Tile("X", "tesoro", true, false, true, true) },
  { pos: 20, tile: new Tile("X", "anello", true, true, false, true) },
  { pos: 13, tile: new Tile("X", "teschio", true, true, true, false) },
  { pos: 12, tile: new Tile("X", "chiavi", false, true, true, true) },
  { pos: 11, tile: new Tile("X", "corona", true, true, false, true) },
  { pos: 10, tile: new Tile("X", "mMappa", true, true, false, true) },
  { pos: 3, tile: new Tile("X", "rosso", false, true, true, false) },
  { pos: 2, tile: new Tile("X", "bottino", false, true, true, true) },
  { pos: 1, tile: new Tile("X", "libro", false, true, true, true) },
  { pos: 0, tile: new Tile("X", "giallo", false, true, false, true) },
];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

shuffle(board);
// Aggiunge le tessere bloccate
for (let i = 0; i < blocksTiles.length; i++) {
  board.splice(blocksTiles[i].pos, 0, blocksTiles[i].tile);
}
// Aggiunge position alle tessere
for (let i = 0; i < board.length; i++) {
  board[i].position = i;
}

console.log(board.length);

var body = document.getElementsByTagName("body")[0];

function renderTile(tile, ulToAppendTo) {
  var div = document.createElement("DIV");
  div.classList.add("tile");
  var newUl = document.createElement("UL");
  newUl.classList.add("subtiles");
  for (let j = 0; j < 9; j++) {
    var newLi = document.createElement("LI");
    newLi.classList.add("subtile");
    if (
      j == 4 ||
      (j == 1 && tile.up) ||
      (j == 3 && tile.left) ||
      (j == 5 && tile.right) ||
      (j == 7 && tile.down)
    ) {
      newLi.classList.add("road");
    }
    if (j == 4 && tile.treasure) {
      newLi.classList.add("treasure");
      newLi.classList.add(tile.treasure);
    }
    newUl.appendChild(newLi);
  }

  div.appendChild(newUl);
  ulToAppendTo.appendChild(div);
}

function renderBoard() {
  var boardDom = document.getElementsByClassName("board")[0];
  for (let i = 0; i < board.length; i++) {
    renderTile(board[i], boardDom);
  }
}

renderBoard();

renderTile(randomTile, document.getElementsByClassName("currentTile")[0]);

for (let i = 0; i < board.length; i++) {
  console.log(board[i]);
}

window.currentTile = document.getElementsByClassName("currentTile")[0];
window.randomTile = randomTile;

window.rotateTile = (tile) => {
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

window.renderTile = renderTile;

var rotationButton = document.getElementsByClassName("rotationButton")[0];
rotationButton.addEventListener("click", () => {
  window.rotateTile(randomTile);
  document.getElementsByClassName("currentTile")[0].innerHTML = "";
  renderTile(randomTile, document.getElementsByClassName("currentTile")[0]);
});
