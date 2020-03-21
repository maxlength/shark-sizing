$(function() {
  let socket = io();
  let href = window.location.href;
  var room = href.substring(href.lastIndexOf("/") + 1);

  socket.emit("join", room);

  let $username = $(".username");
  let $sizes = $(".sizes");
  let $usernamesAndSizes = $(".usernamesAndSizes");
  let $deleteEstimates = $(".deleteEstimates");
  let $toggleEstimates = $(".toggleEstimates");
  let $mostVotedEstimates = $(".mostVotedEstimates");
  let $mostVotedPanel = $(".mostVotedPanel");

  $sizes.on("click", "button", e => {
    let $button = $(e.target);
    $sizes.find(".size").removeClass("selected");
    $button.closest(".size").addClass("selected");
    socket.emit("estimate selected", {
      room,
      estimate: $button.data("size")
    });
  });

  $deleteEstimates.on("click", e => {
    if (
      confirm("Are you sure you want to delete all estimates in this room?")
    ) {
      socket.emit("reset estimates", room);
    }
  });

  socket.on("estimates resetted", () => {
    $sizes.find(".size").removeClass("selected");
    $mostVotedPanel.html("");
  });

  $toggleEstimates.on("click", e => {
    socket.emit("toggle estimates", {
      room,
      className: $("#sizingPanel").attr("class")
    });
  });

  socket.on("estimates toggled", className => {
    $("#sizingPanel").attr("class", className);
  });

  $mostVotedEstimates.on("click", e => {
    socket.emit("get most voted estimates", room);
  });

  socket.on("most voted estimates", mostVotedEstimates => {
    mostVotedEstimates.length &&
      $mostVotedPanel.html(
        `Most voted estimate(s): <span>${mostVotedEstimates.toString()}</span>`
      );
  });

  socket.once("set username", username => {
    $username.text(username);
  });

  socket.once("set admin", admin => {
    $("body").addClass(admin);
  });

  socket.on("sizes updated", selectedSizes => {
    $usernamesAndSizes.find("[data-username]").remove();
    for (var username in selectedSizes) {
      $usernamesAndSizes.append(`<li data-username="${username}">
                            <span class='username ${selectedSizes[username].status}'>${username}</span>
                            <span class='estimate'>${selectedSizes[username].estimate}</span>
                            <span class='hiddenEstimate'>?</span>
                            <button>Remove</button>
                        </li>`);
    }
  });

  $usernamesAndSizes.on("click", "button", e => {
    var usernameToRemove = $(e.target)
      .closest("[data-username]")
      .data("username");

    socket.emit("remove user", { room, usernameToRemove });
  });
});
