//TUtorial for catharsis
const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
    window.location.href = "Run_Menu.html";
});

const userDisplay = document.getElementById("userDisplay");
const logoutBtn = document.getElementById("logoutBtn");

const username = localStorage.getItem("loggedInUser");

if(username){
    userDisplay.textContent = "Welcome " + username;
}

if(logoutBtn){
    logoutBtn.addEventListener("click", (event) => {

        event.preventDefault();

        localStorage.removeItem("loggedInUser");

        window.location.href = "Run_Menu.html";
    });
}