$(() => {
  const poolFromQuery = new URL(window.location.href).searchParams.get("pool");

  const $username = $("#username");
  const $pool = $("#pool");

  if (poolFromQuery) {
    $pool.val(poolFromQuery);
  }

  const $createPoolForm = $("#createPoolForm");

  $createPoolForm.find("[type='submit']").on("click", e => {
    e.preventDefault();

    if ($("#usernameCreatePool").val()) {
      $.ajax("/getNewPool")
      .success(newPool => {
        $createPoolForm.attr("action", `/pool/${newPool}`).submit();
      });
    }

    return false;
  });

  const $loginForm = $("#loginForm");

  $loginForm.find("[type='submit']").on("click", e => {
    e.preventDefault();

    const username = $username.val();
    const pool = $pool.val();

    if (username && pool) {
      $(".error").remove();

      $.ajax("/getUsernameAndPoolAvailability", {
        data: {
          username,
          pool
        }
      })
        .success(res => {
          $loginForm.attr("action", `/pool/${pool}`).submit();
        })
        .error(res => {
          if (res.status === 401) {
            const error = res.responseText;
            if (error === "nopool") {
              $pool.after(
                `<span class="error">Sorry the pool doesn't exist :(</span>`
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
