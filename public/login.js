$(function() {
  var url = new URL(window.location.href);
  var roomFromQuery = url.searchParams.get("room");
  var usernameFromQuery = url.searchParams.get("username");
  var error = url.searchParams.get("error");

  const $username = $("#username");
  const $room = $("#room");

  if (roomFromQuery) {
    $room.val(roomFromQuery);
  }

  if (usernameFromQuery) {
    $username.val(usernameFromQuery);
  }

  if (error) {
    $room.after(
      `<span class="error">Sorry ${usernameFromQuery}, the room ${roomFromQuery} doesn't exist :(</span>`
    );
  }

  const $createRoomForm = $("#createRoomForm");
  const $loginForm = $("#loginForm");

  $createRoomForm.find('[type="submit"]').on("click", e => {
    e.preventDefault();

    const $userAdmin = $("#usernameCreateRoom");
    const newRoom = Math.floor(Math.random() * 1000000) + 1;

    if ($userAdmin.val() && newRoom) {
      $createRoomForm.attr("action", `/room/${newRoom}`).submit();
    }

    return false;
  });

  $loginForm.find('[type="submit"]').on("click", e => {
    e.preventDefault();

    const room = $room.val();

    if ($username.val() && room) {
      $loginForm.attr("action", `/room/${room}`).submit();
    }

    return false;
  });
});
