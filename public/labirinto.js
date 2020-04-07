class Tile {
  constructor(
    type,
    treasure = null,
    position = 0,
    up = 0,
    down = 0,
    left = 0,
    right = 0,
    isOutOfBoard = false
  ) {
    this.type = type; // I, T, L, X
    this.treasure = treasure;
    this.position = position; // 0, 1, 2...
    this.up = up;
    this.down = down;
    this.left = left;
    this.right = right;
    this.isOutOfBoard = isOutOfBoard;
  }
}

// 12 tessere I
// 6 tessere T
// 16 tessere L
// 16 tessere bloccate
// const moveableTiles = [
const moveableTiles = [
  new Tile("T", "Pipistrello"),
  new Tile("T", "Fantasma"),
  new Tile("T", "Genio"),
  new Tile("T", "Gnomo"),
  new Tile("T", "Drago"),
  new Tile("T", "Fata"),
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
  new Tile("L", "Topo"),
  new Tile("L", "Ragno"),
  new Tile("L", "Lucertola"),
  new Tile("L", "Gufo"),
  new Tile("L", "Scarabeo"),
  new Tile("L", "Falena"),
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
  { pos: 33, tile: new Tile("X", "Blue") },
  { pos: 32, tile: new Tile("X", "Elmo") },
  { pos: 31, tile: new Tile("X", "Candelabro") },
  { pos: 30, tile: new Tile("X", "Verde") },
  { pos: 23, tile: new Tile("X", "Spada") },
  { pos: 22, tile: new Tile("X", "Smeraldo") },
  { pos: 21, tile: new Tile("X", "Tesoro") },
  { pos: 20, tile: new Tile("X", "Anello") },
  { pos: 13, tile: new Tile("X", "Teschio") },
  { pos: 12, tile: new Tile("X", "Chiavi") },
  { pos: 11, tile: new Tile("X", "Corona") },
  { pos: 10, tile: new Tile("X", "Mappa") },
  { pos: 3, tile: new Tile("X", "Rosso") },
  { pos: 2, tile: new Tile("X", "Bottino") },
  { pos: 1, tile: new Tile("X", "Libro") },
  { pos: 0, tile: new Tile("X", "Giallo") },
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

function renderBoard() {
  var ul = document.createElement("UL");
  for (let i = 0; i < board.length; i++) {
    var li = document.createElement("LI");
    var liText = document.createTextNode(board[i].type);
    li.appendChild(liText);
    ul.appendChild(li);
  }
  body.appendChild(ul);
}

renderBoard();

// for (let i = 0; i < board.length; i++) {
//   console.log(board[i]);
// }
