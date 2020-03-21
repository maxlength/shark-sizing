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
let users = {};
let toggledClassName = "hiddenEstimates";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.post("/room/:room", (req, res) => {
  username = req.body.username;
  room = req.params.room;
  admin = req.body.admin;

  res.sendFile(__dirname + "/index.html");
});

app.get("/room/:room", (req, res) => {
  res.redirect("/?room=" + req.params.room);
});

io.on("connection", socket => {
  connections.push(socket);
  socket.username = username;
  socket.admin = admin;

  console.log(`${username} connected`);

  socket.on("join", room => {
    socket.join(room);
    socket.room = room;

    io.to(room).emit("set username", username);

    if (users[room] === undefined) {
      users[room] = {};
    }

    users[room][socket.username] = {
      status: "connected",
      estimate: "-",
      hasVoted: false
    };

    if (socket.admin) {
      io.to(room).emit("set admin", "admin");
    }

    updateUsers(room);
    toggleSelectedEstimatesVisibility(room);
  });

  socket.on("disconnect", () => {
    connections.splice(connections.indexOf(socket), 1);
    if (users[socket.room]) {
      users[socket.room][socket.username] = {
        status: "disconnected",
        estimate: "-",
        hasVoted: false
      };
    }

    updateUsers(socket.room);

    console.log(`${socket.username} disconnected`);
  });

  socket.on("update story name", ({ room, story }) => {
    io.in(room).emit("story updated", story);
  });

  socket.on("estimate selected", ({ room, estimate }) => {
    users[room][socket.username].estimate = estimate;
    users[room][socket.username].hasVoted = true;
    updateUsers(room);
  });

  socket.on("reset estimates", room => {
    for (var username in users[room]) {
      users[room][username].estimate = "-";
      users[room][username].hasVoted = false;
    }
    updateUsers(room);
    io.in(room).emit("estimates resetted");
  });

  socket.on("toggle estimates", ({ room, className }) => {
    toggledClassName =
      className === "hiddenEstimates" ? "shownEstimates" : "hiddenEstimates";
    toggleSelectedEstimatesVisibility(room);
  });

  socket.on("get most voted estimates", room => {
    let allEstimates = [];

    for (var username in users[room]) {
      if (users[room][username].estimate !== "-") {
        allEstimates.push(users[room][username].estimate);
      }
    }

    let mostUsedEstimates = _getArrayElementsWithMostOccurrences(allEstimates);

    io.in(room).emit("most voted estimates", mostUsedEstimates);
  });

  socket.on("remove user", ({ room, usernameToRemove }) => {
    delete users[room][usernameToRemove];
    updateUsers(room);

    console.log(`${usernameToRemove} was removed`);
  });
});

function toggleSelectedEstimatesVisibility(room) {
  io.in(room).emit("estimates toggled", toggledClassName);
}

function updateUsers(room) {
  io.in(room).emit("users updated", users[room]);
}

function _getArrayElementsWithMostOccurrences(arr) {
  let counts = arr.reduce((a, c) => {
    a[c] = (a[c] || 0) + 1;
    return a;
  }, {});
  let maxCount = Math.max(...Object.values(counts));
  return Object.keys(counts).filter(k => counts[k] === maxCount);
}

http.listen(PORT, function() {
  console.log("listening on *:" + PORT);
});
