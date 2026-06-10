// Menu for Catharsis

console.log("Run_Menu.js loaded");
const startGameBtn = document.getElementById("startGameBtn");
const tutorialBtn = document.getElementById("tutorialBtn");
const statsBtn = document.getElementById("statisticsBtn");
const userDisplay = document.getElementById("userDisplay");
const username = localStorage.getItem("loggedInUser");
const logoutBtn = document.getElementById("logoutBtn");

if(logoutBtn){
    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("username");
        localStorage.removeItem("user_ID");
        localStorage.removeItem("player_ID");
        localStorage.removeItem("role");

        window.location.href = "Login.html";
    });
}

const role = localStorage.getItem("role");
const adminStatsBtn = document.getElementById("adminStatsBtn");

if (adminStatsBtn && role !== "admin") {
    adminStatsBtn.style.display = "none";
}

if(username){
    userDisplay.textContent = "Welcome " + username;
}

if(startGameBtn){
    startGameBtn.addEventListener("click", () => {
        console.log("Start button clicked");
        window.location.href = "../../Game_Code/html/prototipo.html";
    });
}

tutorialBtn.addEventListener("click", () => {
    window.location.href = "Tutorial.html";
});

statsBtn.addEventListener("click", () => {
    window.location.href = "Statistics.html";
});
