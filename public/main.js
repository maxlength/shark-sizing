$(function() {
  let socket = io();
  let href = window.location.href;
  var room = href.substring(href.lastIndexOf("/") + 1);

  socket.emit("join", room);

  let $username = $(".username");
  let $storyToEstimate = $(".storyToEstimate");
  let $story = $storyToEstimate.find('[name="story"]');
  let $storyDeleteButton = $storyToEstimate.find("button");
  let $storyPlaceholder = $storyToEstimate.find("h2");
  let $sizes = $(".sizes");
  let $usernamesAndSizes = $(".usernamesAndSizes");
  let $deleteEstimates = $(".deleteEstimates");
  let $toggleEstimates = $(".toggleEstimates");
  let $mostVotedEstimates = $(".mostVotedEstimates");
  let $mostVotedPanel = $(".mostVotedPanel");
  let $link = $("header > button");
  let $copiedLink = $(".copiedLink");

  $link.on("click", () => {
    copyToClipboard();
    $copiedLink.show();
    setTimeout(() => {
      $copiedLink.hide();
    }, 1000);
  });

  $story.on("keyup", e => {
    console.log(e.target.value);
    socket.emit("update story name", { room, story: e.target.value });
  });

  $storyDeleteButton.on("click", () => {
    $story.val("").trigger("keyup");
  });

  socket.on("story updated", story => {
    $storyPlaceholder.text(story);
  });

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

  socket.on("users updated", users => {
    $usernamesAndSizes.find("[data-username]").remove();
    for (var username in users) {
      let user = users[username];
      let hasVotedClass = user.hasVoted ? "hasVoted" : "";
      $usernamesAndSizes.append(`<li data-username="${username}" class="${hasVotedClass}">
                            <span class='username ${user.status}'>${username}</span>
                            <span class='estimate'>${user.estimate}</span>
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

  function copyToClipboard() {
    const tempTextarea = document.createElement("textarea");
    tempTextarea.value = href;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    document.body.removeChild(tempTextarea);
  }
});
