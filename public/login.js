$(() => {
  const roomFromQuery = new URL(window.location.href).searchParams.get("room");

  const $username = $("#username");
  const $room = $("#room");

  if (roomFromQuery) {
    $room.val(roomFromQuery);
  }

  const $createRoomForm = $("#createRoomForm");

  $createRoomForm.find("[type='submit']").on("click", e => {
    e.preventDefault();

    if ($("#usernameCreateRoom").val()) {
      $.ajax("/getNewRoom")
      .success(newRoom => {
        $createRoomForm.attr("action", `/room/${newRoom}`).submit();
      });
    }

    return false;
  });

  const $loginForm = $("#loginForm");

  $loginForm.find("[type='submit']").on("click", e => {
    e.preventDefault();

    const username = $username.val();
    const room = $room.val();

    if (username && room) {
      $(".error").remove();

      $.ajax("/getUsernameAndRoomAvailability", {
        data: {
          username,
          room
        }
      })
        .success(res => {
          $loginForm.attr("action", `/room/${room}`).submit();
        })
        .error(res => {
          if (res.status === 401) {
            const error = res.responseText;
            if (error === "noroom") {
              $room.after(
                `<span class="error">Sorry the room doesn't exist :(</span>`
              );
            }
            if (error === "usernameunavailable") {
              $username.after(
                `<span class="error">Sorry, the name is already used :(</span>`
              );
            }
          }
        });
    }
    return false;
  });
});
