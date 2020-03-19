var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;
let connections = [];
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

app.post("/room/:room", (req, res) => {
  res.sendFile(__dirname + "/index.html");

  username = req.body.username;
  room = req.params.room;
  admin = req.body.admin;
});

app.get("/room/:room", (req, res) => {
  res.redirect("/?room=" + req.params.room);
});

io.on("connection", socket => {
  connections.push(socket);
  socket.username = username;
  socket.admin = admin;
  selectedSizes[socket.username] = { status: "connected", estimate: "-" };
  updateUsernamesAndSizes();
  updateToggleClassName();

  io.emit("set username", username);

  socket.on("disconnect", () => {
    connections.splice(connections.indexOf(socket), 1);
    selectedSizes[socket.username] = { status: "disconnected", estimate: "-" };
    updateUsernamesAndSizes();
  });

  socket.on("size selected", estimate => {
    selectedSizes[socket.username].estimate = estimate;
    updateUsernamesAndSizes();
  });

  socket.on("reset estimates", () => {
    for (var username in selectedSizes) {
      selectedSizes[username].estimate = "-";
    }
    updateUsernamesAndSizes();
    io.emit("estimates resetted");
  });

  socket.on("toggle estimates", className => {
    toggledClassName =
      className === "hiddenEstimates" ? "shownEstimates" : "hiddenEstimates";
    updateToggleClassName();
  });

  socket.on("get most voted estimates", () => {
    let mostVotedEstimates = [];

    for (var username in selectedSizes) {
      if (selectedSizes[username].estimate !== "-") {
        mostVotedEstimates.push(selectedSizes[username].estimate);
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

  socket.on("remove user", username => {
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
