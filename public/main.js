$(() => {
  const socket = io();
  const href = window.location.href;
  const room = href.substring(href.lastIndexOf("/") + 1);

  socket.emit("join", room);

  let $username = $(".username");
  let $storyToEstimate = $(".storyToEstimate");
  let $story = $storyToEstimate.find('[name="story"]');
  let $resetStoryButton = $storyToEstimate.find("button");
  let $storyPlaceholder = $storyToEstimate.find("h2");
  let $estimatesList = $(".sizes");
  let $usersList = $(".usernamesAndSizes");
  let $resetEstimatesButton = $(".deleteEstimates");
  let $toggleEstimatesButton = $(".toggleEstimates");
  let $mostVotedEstimatesButton = $(".mostVotedEstimates");
  let $mostVotedPanel = $(".mostVotedPanel");
  let $link = $("header > button");
  let $copiedLink = $(".copiedLink");

  // Set username in header

  socket.once("set username", username => {
    $username.text(username);
  });

  // Set admin class for privileges

  socket.once("set admin", admin => {
    $("body").addClass(admin);
  });

  $link.on("click", () => {
    _copyToClipboard();
    $copiedLink.show();
    setTimeout(() => {
      $copiedLink.hide();
    }, 1000);
  });

  // Enter or update User story name

  $story.on("keyup", e => {
    socket.emit("update story name", { room, story: e.target.value });
  });

  $resetStoryButton.on("click", () => {
    $story.val("").trigger("keyup");
  });

  socket.on("story updated", story => {
    $storyPlaceholder.text(story);
  });

  // Choose an estimate

  $estimatesList.on("click", "button", e => {
    let $estimateButton = $(e.target);
    $estimatesList.find(".size").removeClass("selected");
    $estimateButton.closest(".size").addClass("selected");
    socket.emit("estimate selected", {
      room,
      estimate: $estimateButton.data("size")
    });
  });

  // Reset all estimates

  $resetEstimatesButton.on("click", e => {
    if (
      confirm("Are you sure you want to delete all estimates in this room?")
    ) {
      socket.emit("reset estimates", room);
    }
  });

  socket.on("estimates resetted", () => {
    $estimatesList.find(".size").removeClass("selected");
    $mostVotedPanel.html("");
  });

  // Show or hide all estimates

  $toggleEstimatesButton.on("click", e => {
    socket.emit("toggle estimates", {
      room,
      className: $("#sizingPanel").attr("class")
    });
  });

  socket.on("estimates toggled", className => {
    $("#sizingPanel").attr("class", className);
  });

  // Show the most voted estimate(s)

  $mostVotedEstimatesButton.on("click", e => {
    socket.emit("get most voted estimates", room);
  });

  socket.on("most voted estimates", mostVotedEstimates => {
    mostVotedEstimates.length &&
      $mostVotedPanel.html(
        `Most voted estimate(s): <span>${mostVotedEstimates.toString()}</span>`
      );
  });

  // Update list of the users, the estimates, the status of the users

  socket.on("users updated", room => {
    $usersList.find("[data-username]").remove();
    for (let username in room) {
      let user = room[username];
      let hasVotedClass = user.hasVoted ? "hasVoted" : "";
      $usersList.append(`<li data-username="${username}" class="${hasVotedClass}">
                            <span class='username ${user.status}'>${username}</span>
                            <span class='estimate'>${user.estimate}</span>
                            <span class='hiddenEstimate'>?</span>
                            <button>Remove</button>
                        </li>`);
    }
  });

  // Remove an user

  $usersList.on("click", "button", e => {
    const usernameToRemove = $(e.target)
      .closest("[data-username]")
      .data("username");

    socket.emit("remove user", { room, usernameToRemove });
  });

  const _copyToClipboard = () => {
    const tempTextarea = document.createElement("textarea");
    tempTextarea.value = href;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    document.body.removeChild(tempTextarea);
  };
});
