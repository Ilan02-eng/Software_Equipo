const registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const name = document.getElementById("name").value;
  const lastname = document.getElementById("lastname").value;
  const gender = document.getElementById("gender").value;
  const age = parseInt(document.getElementById("age").value);
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  if (
    username === "" ||
    name === "" ||
    lastname === "" ||
    gender === "" ||
    password === "" ||
    isNaN(age)
  ) {
    message.textContent = "Please complete everything";
    return;
  }

  if (age <= 13) {
    message.textContent = "You must be older than 13 to create an account.";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        name,
        lastname,
        password,
        age,
        gender
      })
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.error || "Registration failed.";
      return;
    }

    localStorage.setItem("user_ID", data.user_ID);
    localStorage.setItem("player_ID", data.player_ID);

    message.textContent = "Account was created!";

    setTimeout(() => {
      window.location.href = "Login.html";
    }, 1000);

  } catch (err) {
    console.error(err);
    message.textContent = "Cannot connect to server.";
  }
});