$(function() {
  let socket = io();

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
    socket.emit("size selected", $button.data("size"));
  });

  $deleteEstimates.on("click", e => {
    if (
      confirm("Are you sure you want to delete all estimates in this room?")
    ) {
      socket.emit("reset estimates");
    }
  });

  socket.on("estimates resetted", function(selectedSizes) {
    $sizes.find(".size").removeClass("selected");
    $mostVotedPanel.html("");
  });

  $toggleEstimates.on("click", e => {
    socket.emit("toggle estimates", $("#sizingPanel").attr("class"));
  });

  socket.on("estimates toggled", function(className) {
    $("#sizingPanel").attr("class", className);
  });

  $mostVotedEstimates.on("click", e => {
    socket.emit("get most voted estimates");
  });

  socket.on("most voted estimates", function(mostVotedEstimates) {
    mostVotedEstimates.length &&
      $mostVotedPanel.html(
        `Most voted estimate(s): <span>${mostVotedEstimates.toString()}</span>`
      );
  });

  socket.once("set username", function(username) {
    $username.text(username);
  });

  socket.on("sizes updated", function(selectedSizes) {
    $usernamesAndSizes.find("[data-username]").remove();
    for (var username in selectedSizes) {
      $usernamesAndSizes.append(`<li data-username="${username}">
                            <span class='username'>${username}</span>
                            <span class='estimate'>${selectedSizes[username]}</span>
                            <span class='hiddenEstimate'>?</span>
                            <button>Remove</button>
                        </li>`);
    }
  });

  $usernamesAndSizes.on("click", "button", e => {
    var usernameToRemove = $(e.target)
      .closest("[data-username]")
      .data("username");

    socket.emit("remove user", usernameToRemove);
  });
});
