const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;
let connections = [];
let usernameServer = "";
let roomServer = "";
let adminServer = false;
let rooms = {};
let toggledClassName = "hiddenEstimates";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.get("/getUsernameAndRoomAvailability", (req, res) => {
  usernameFromQuery = req.query.username;
  roomFromQuery = req.query.room;

  let msg = "ok",
    status = 200;

  if (rooms[roomFromQuery] === undefined) {
    msg = "noroom";
    status = 401;
  } else if (
    rooms[roomFromQuery] !== undefined &&
    rooms[roomFromQuery][usernameFromQuery] !== undefined
  ) {
    msg = "usernameunavailable";
    status = 401;
  }

  res.status(status).send(msg);
});

app.get("/room/:room", (req, res) => {
  res.redirect("/?room=" + req.params.room);
});

app.post("/room/:room", (req, res) => {
  usernameServer = req.body.username;
  roomServer = req.params.room;
  adminServer = req.body.admin;

  res.sendFile(__dirname + "/index.html");
});

io.on("connection", socket => {
  connections.push(socket);

  console.log(`An user connected`);

  socket.on("join", room => {
    socket.join(room);

    if (rooms[room] === undefined) {
      rooms[room] = {};
    }

    rooms[room][usernameServer] = {
      status: "connected",
      estimate: "-",
      hasVoted: false
    };

    io.to(room).emit("set username", usernameServer);

    if (adminServer) {
      io.to(room).emit("set admin", "admin");
    }

    _updateUsers(room);
    _toggleSelectedEstimatesVisibility(room);
  });

  socket.on("disconnect", () => {
    connections.splice(connections.indexOf(socket), 1);
    if (rooms[roomServer]) {
      rooms[roomServer][usernameServer] = {
        status: "disconnected",
        estimate: "-",
        hasVoted: false
      };
    }

    _updateUsers(roomServer);

    console.log(`An user disconnected`);
  });

  socket.on("update story name", ({ room, story }) => {
    io.in(room).emit("story updated", story);
  });

  socket.on("estimate selected", ({ room, estimate }) => {
    rooms[room][usernameServer].estimate = estimate;
    rooms[room][usernameServer].hasVoted = true;
    _updateUsers(room);
  });

  socket.on("reset estimates", room => {
    for (let username in rooms[room]) {
      rooms[room][username].estimate = "-";
      rooms[room][username].hasVoted = false;
    }
    _updateUsers(room);
    io.in(room).emit("estimates resetted");
  });

  socket.on("toggle estimates", ({ room, className }) => {
    toggledClassName =
      className === "hiddenEstimates" ? "shownEstimates" : "hiddenEstimates";
    _toggleSelectedEstimatesVisibility(room);
  });

  socket.on("get most voted estimates", room => {
    let allEstimates = [];

    for (let username in rooms[room]) {
      if (rooms[room][username].estimate !== "-") {
        allEstimates.push(rooms[room][username].estimate);
      }
    }

    let mostUsedEstimates = _getArrayElementsWithMostOccurrences(allEstimates);

    io.in(room).emit("most voted estimates", mostUsedEstimates);
  });

  socket.on("remove user", ({ room, usernameToRemove }) => {
    delete rooms[room][usernameToRemove];
    _updateUsers(room);

    console.log(`${usernameToRemove} was removed`);
  });
});

const _toggleSelectedEstimatesVisibility = room => {
  io.in(room).emit("estimates toggled", toggledClassName);
};

const _updateUsers = room => {
  io.in(room).emit("users updated", rooms[room]);
};

const _getArrayElementsWithMostOccurrences = arr => {
  let counts = arr.reduce((a, c) => {
    a[c] = (a[c] || 0) + 1;
    return a;
  }, {});
  let maxCount = Math.max(...Object.values(counts));
  return Object.keys(counts).filter(k => counts[k] === maxCount);
};

http.listen(PORT, () => {
  console.log("listening on *:" + PORT);
});
