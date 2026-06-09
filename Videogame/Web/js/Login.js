//Login for catharsis
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", () => {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const savedUsername = localStorage.getItem("username");
    const savedPassword = localStorage.getItem("password");
    const message = document.getElementById("message");

    if(username === "" || password === ""){
        message.textContent = "Please fill complete everything";
        return;
    }
    
    if(username === savedUsername && password === savedPassword){
    localStorage.setItem("loggedInUser", username);
    window.location.href = "Run_Menu.html";
    return;
}

    localStorage.setItem("loggedInUser", username);

    setTimeout(() => {
        window.location.href = "Run_Menu.html";
    }, 1000);

});