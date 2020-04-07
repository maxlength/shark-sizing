const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;
let connections = [];
let usernameServer = "";
let poolServer = "";
let adminServer = false;
let pools = [];
let toggledClassName = "hiddenEstimates";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.get("/getUsernameAndPoolAvailability", (req, res) => {
  let msg = "ok",
    status = 200;
  let pool = _getPoolById(req.query.pool);

  if (_noPoolToJoin(pool)) {
    msg = "nopool";
    status = 401;
  } else if (_isUsernameAlreadyUsed(pool["users"], req.query.username)) {
    msg = "usernameunavailable";
    status = 401;
  }

  res.status(status).send(msg);
});

app.get("/getNewPool", (req, res) => {
  let isPoolAlreadyExisting = true;
  let newPoolId;

  while (isPoolAlreadyExisting) {
    newPoolId = Math.floor(Math.random() * 1000000) + 1;
    let existingPool = _getPoolById(newPoolId);
    if (!existingPool) {
      isPoolAlreadyExisting = false;
    }
  }

  res.status(200).send(newPoolId.toString());
});

app.get("/pool/:pool", (req, res) => {
  res.redirect("/?pool=" + req.params.pool);
});

app.post("/pool/:pool", (req, res) => {
  usernameServer = req.body.username;
  poolServer = req.params.pool;
  adminServer = req.body.admin;

  res.sendFile(__dirname + "/index.html");
});

app.get("/labirinto", (req, res) => {
  res.sendFile(__dirname + "/labirinto.html");
});

io.on("connection", (socket) => {
  connections.push(socket);

  console.log(`An user connected`);

  socket.on("join", (pool) => {
    socket.join(pool);
    socket.pool = poolServer;
    socket.user = {
      username: usernameServer,
      isAdmin: adminServer,
    };

    let requestedPool = _getPoolById(pool);

    if (requestedPool === undefined) {
      _createPool(pool, pools);
    }

    _createUser(pool, socket.user.username);

    io.to(pool).emit("set username", socket.user.username);

    if (socket.user.isAdmin) {
      io.to(pool).emit("set admin", "admin");
    }

    _emitUpdatedUsers(pool);
    _emitUpdatedStory(pool);
    _toggleSelectedEstimatesVisibility(pool);
  });

  socket.on("disconnect", () => {
    connections.splice(connections.indexOf(socket), 1);
    let pool = _getPoolById(socket.pool);
    if (pool && pool["users"]) {
      let user = _getUserByUsername(pool["users"], socket.user.username);
      if (user) {
        pool["users"].splice(pool["users"].indexOf(user), 1);
      }

      if (pool["users"].length === 0) {
        pools.splice(pools.indexOf(pool), 1);
      } else {
        _emitUpdatedUsers(socket.pool);
      }
    }

    console.log(`An user disconnected`);
  });

  socket.on("update story name", ({ pool, story }) => {
    _emitUpdatedStory(pool, story);
  });

  socket.on("estimate selected", ({ pool, username, estimate }) => {
    let users = _getUsersByPool(pool);
    let user = _getUserByUsername(users, username);

    user.estimate = estimate;
    user.hasVoted = true;

    _emitUpdatedUsers(pool);
  });

  socket.on("reset estimates", (pool) => {
    let users = _getUsersByPool(pool);
    for (let user of users) {
      user.estimate = "-";
      user.hasVoted = false;
    }

    _emitUpdatedUsers(pool);

    io.in(pool).emit("estimates resetted");
  });

  socket.on("toggle estimates", ({ pool, className }) => {
    toggledClassName =
      className === "hiddenEstimates" ? "shownEstimates" : "hiddenEstimates";
    _toggleSelectedEstimatesVisibility(pool);
  });

  socket.on("get most voted estimates", (pool) => {
    let allEstimates = [];
    let users = _getPoolById(pool)["users"];

    for (let user of users) {
      if (user.estimate !== "-") {
        allEstimates.push(user.estimate);
      }
    }

    let mostUsedEstimates = _getArrayElementsWithMostOccurrences(allEstimates);

    io.in(pool).emit("most voted estimates", mostUsedEstimates);
  });

  socket.on("close most voted estimates", (pool) => {
    io.in(pool).emit("most voted estimates closed");
  });

  socket.on("remove user", ({ pool, usernameToRemove }) => {
    let users = _getUsersByPool(pool);
    let user = _getUserByUsername(users, usernameToRemove);
    users.splice(users.indexOf(user), 1);

    _emitUpdatedUsers(pool);

    console.log(`${usernameToRemove} was removed`);
  });
});

const _toggleSelectedEstimatesVisibility = (pool) => {
  io.in(pool).emit("estimates toggled", toggledClassName);
};

const _emitUpdatedUsers = (pool) => {
  let poolById = _getPoolById(pool);
  poolById && io.in(pool).emit("users updated", poolById["users"]);
};

const _emitUpdatedStory = (pool, updatedStory) => {
  let poolById = _getPoolById(pool);
  if (poolById) {
    if (updatedStory) {
      poolById.story = updatedStory;
    }
    io.in(pool).emit("story updated", poolById.story);
  }
};

const _getArrayElementsWithMostOccurrences = (arr) => {
  let counts = arr.reduce((a, c) => {
    a[c] = (a[c] || 0) + 1;
    return a;
  }, {});
  let maxCount = Math.max(...Object.values(counts));
  return Object.keys(counts).filter((k) => counts[k] === maxCount);
};

const _getPoolById = (id) => {
  return pools.filter((r) => r.id == id)[0];
};

const _getUsersByPool = (id) => {
  return _getPoolById(id)["users"];
};

const _getUserByUsername = (users, username) => {
  return users.filter((u) => u.username == username)[0];
};

const _noPoolToJoin = (pool) => {
  return pool === undefined;
};

const _isUsernameAlreadyUsed = (users, username) => {
  return _getUserByUsername(users, username) !== undefined;
};

const _createPool = (id, pools) => {
  pools.push({ id: id, users: [], story: "" });
};

const _createUser = (pool, username) => {
  let users = _getUsersByPool(pool);
  let user = _getUserByUsername(users, username);

  if (!user) {
    let newUser = {
      username: username,
      status: "connected",
      estimate: "-",
      hasVoted: false,
    };

    users.push(newUser);
  }
};

http.listen(PORT, () => {
  console.log("listening on *:" + PORT);
});
