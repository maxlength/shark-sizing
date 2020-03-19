var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;
let connections = [];
let users = [];
let username = "";
let room = "";
let admin = false;
let selectedSizes = {};
let toggledClassName = "hiddenEstimates";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.post("/room/:room", function(req, res) {
  res.sendFile(__dirname + "/index.html");

  username = req.body.username;
  room = req.body.room;
  admin = req.body.admin;
});

app.get("/room/:room", function(req, res) {
  res.sendFile(__dirname + "/index.html");

  username = req.body.username;
  if (!username) {
    console.log("redirect");
    res.redirect("/");
  }

  room = req.body.room;
  admin = req.body.admin;
});

io.on("connection", function(socket) {
  connections.push(socket);
  socket.username = username;
  socket.admin = admin;
  users.push(username);
  selectedSizes[socket.username] = "-";
  updateUsernamesAndSizes();
  updateToggleClassName();

  io.emit("set username", username);

  console.log("user connected");

  socket.on("disconnect", function() {
    connections.splice(connections.indexOf(socket), 1);
    users.splice(users.indexOf(socket.username), 1);
    delete selectedSizes[socket.username];
    updateUsernamesAndSizes();

    console.log("user disconnected");
  });

  socket.on("size selected", function(size) {
    selectedSizes[socket.username] = size;
    updateUsernamesAndSizes();
  });

  socket.on("reset estimates", function() {
    for (var username in selectedSizes) {
      selectedSizes[username] = "-";
    }
    updateUsernamesAndSizes();
    io.emit("estimates resetted", users);
  });

  socket.on("toggle estimates", function(className) {
    toggledClassName =
      className === "hiddenEstimates" ? "shownEstimates" : "hiddenEstimates";
    updateToggleClassName();
  });

  socket.on("get most voted estimates", function() {
    let mostVotedEstimates = [];

    for (var username in selectedSizes) {
      if (selectedSizes[username] !== "-") {
        mostVotedEstimates.push(selectedSizes[username]);
      }
    }

    let counts = mostVotedEstimates.reduce((a, c) => {
      a[c] = (a[c] || 0) + 1;
      return a;
    }, {});
    let maxCount = Math.max(...Object.values(counts));
    let mostFrequent = Object.keys(counts).filter(k => counts[k] === maxCount);

    io.emit("most voted estimates", mostFrequent);
  });

  socket.on("remove user", function(username) {
    users.splice(users.indexOf(username), 1);
    delete selectedSizes[username];
    updateUsernamesAndSizes();
  });

  function updateToggleClassName() {
    io.emit("estimates toggled", toggledClassName);
  }

  function updateUsernamesAndSizes() {
    io.emit("sizes updated", selectedSizes);
  }
});

http.listen(PORT, function() {
  console.log("listening on *:" + PORT);
});
