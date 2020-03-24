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
let rooms = [];
let toggledClassName = "hiddenEstimates";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.get("/getUsernameAndRoomAvailability", (req, res) => {
  let msg = "ok",
    status = 200;
  let room = _getRoomById(req.query.room);

  if (_noRoomToJoin(room)) {
    msg = "noroom";
    status = 401;
  } else if (_isUsernameAlreadyUsed(room["users"], req.query.username)) {
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
    socket.room = roomServer;
    socket.user = {
      username: usernameServer,
      isAdmin: adminServer
    };

    let requestedRoom = _getRoomById(room);

    if (requestedRoom === undefined) {
      _createRoom(room, rooms);
    }

    _createUser(room, socket.user.username);

    io.to(room).emit("set username", socket.user.username);

    if (socket.user.isAdmin) {
      io.to(room).emit("set admin", "admin");
    }

    _emitUpdatedUsers(room);
    _toggleSelectedEstimatesVisibility(room);
  });

  socket.on("disconnect", () => {
    connections.splice(connections.indexOf(socket), 1);
    let room = _getRoomById(socket.room);
    if (room) {
      let user = _getUserByUsername(room["users"], socket.user.username);
      if (user) {
        user = {
          status: "disconnected",
          estimate: "-",
          hasVoted: false
        };
      }
    }

    _emitUpdatedUsers(socket.room);

    console.log(`An user disconnected`);
  });

  socket.on("update story name", ({ room, story }) => {
    io.in(room).emit("story updated", story);
  });

  socket.on("estimate selected", ({ room, username, estimate }) => {
    let users = _getUsersByRoom(room);
    let user = _getUserByUsername(users, username);

    user.estimate = estimate;
    user.hasVoted = true;

    _emitUpdatedUsers(room);
  });

  socket.on("reset estimates", room => {
    let users = _getUsersByRoom(room);
    for (let user of users) {
      user.estimate = "-";
      user.hasVoted = false;
    }

    _emitUpdatedUsers(room);

    io.in(room).emit("estimates resetted");
  });

  socket.on("toggle estimates", ({ room, className }) => {
    toggledClassName =
      className === "hiddenEstimates" ? "shownEstimates" : "hiddenEstimates";
    _toggleSelectedEstimatesVisibility(room);
  });

  socket.on("get most voted estimates", room => {
    let allEstimates = [];
    let users = _getRoomById(room)["users"];

    for (let user of users) {
      if (user.estimate !== "-") {
        allEstimates.push(user.estimate);
      }
    }

    let mostUsedEstimates = _getArrayElementsWithMostOccurrences(allEstimates);

    io.in(room).emit("most voted estimates", mostUsedEstimates);
  });

  socket.on("close most voted estimates", room => {
    io.in(room).emit("most voted estimates closed");
  });

  socket.on("remove user", ({ room, usernameToRemove }) => {
    let users = _getUsersByRoom(room);
    let user = _getUserByUsername(users, usernameToRemove);
    users.splice(users.indexOf(user), 1);

    _emitUpdatedUsers(room);

    console.log(`${usernameToRemove} was removed`);
  });
});

const _toggleSelectedEstimatesVisibility = room => {
  io.in(room).emit("estimates toggled", toggledClassName);
};

const _emitUpdatedUsers = room => {
  let roomById = _getRoomById(room);
  roomById && io.in(room).emit("users updated", roomById["users"]);
};

const _getArrayElementsWithMostOccurrences = arr => {
  let counts = arr.reduce((a, c) => {
    a[c] = (a[c] || 0) + 1;
    return a;
  }, {});
  let maxCount = Math.max(...Object.values(counts));
  return Object.keys(counts).filter(k => counts[k] === maxCount);
};

const _getRoomById = id => {
  return rooms.filter(r => r.id == id)[0];
};

const _getUsersByRoom = id => {
  return _getRoomById(id)["users"];
};

const _getUserByUsername = (users, username) => {
  return users.filter(u => u.username == username)[0];
};

const _noRoomToJoin = room => {
  return room === undefined;
};

const _isUsernameAlreadyUsed = (users, username) => {
  return _getUserByUsername(users, username) !== undefined;
};

const _createRoom = (id, rooms) => {
  rooms.push({ id: id, users: [] });
};

const _createUser = (room, username) => {
  let users = _getUsersByRoom(room);
  let user = _getUserByUsername(users, username);

  if (!user) {
    let newUser = {
      username: username,
      status: "connected",
      estimate: "-",
      hasVoted: false
    };

    users.push(newUser);
  }
};

http.listen(PORT, () => {
  console.log("listening on *:" + PORT);
});
