//Login for catharsis
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", () => {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    if(username === "" || password === ""){
        message.textContent = "Please fill all fields";
        return;
    }

    message.textContent = "Login successful";

    localStorage.setItem("username", username);

    setTimeout(() => {
        window.location.href = "Run_Menu.html";
    }, 1000);

});