$(function() {
  const $createRoomForm = $("#createRoomForm");
  const $loginForm = $("#loginForm");

  var room = new URL(window.location.href).searchParams.get("room");
  if (room) {
    $("#room").val(room);
  }

  $createRoomForm.find('[type="submit"]').on("click", e => {
    e.preventDefault();

    const $username = $("#usernameCreateRoom");
    const username = $username.val();
    const room = Math.floor(Math.random() * 1000000) + 1;

    if (username && room) {
      $createRoomForm.attr("action", `/room/${room}`);
      $createRoomForm.submit();
    }

    return false;
  });

  $loginForm.find('[type="submit"]').on("click", e => {
    e.preventDefault();

    const $username = $("#username");
    const username = $username.val();
    const $room = $("#room");
    const room = $room.val();

    if (username && room) {
      $loginForm.attr("action", `/room/${room}`);
      $loginForm.submit();
    }

    return false;
  });
});
