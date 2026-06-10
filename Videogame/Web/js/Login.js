const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  if (username === "" || password === "") {
    message.textContent = "Please fill complete everything";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.error || "Invalid credentials.";
      return;
    }

    localStorage.setItem("user_ID", data.user.user_ID);
    localStorage.setItem("player_ID", data.player.player_ID);
    localStorage.setItem("username", data.user.username);

    window.location.href = "Run_Menu.html";

  } catch (err) {
    console.error(err);
    message.textContent = "Cannot connect to server.";
  }
});