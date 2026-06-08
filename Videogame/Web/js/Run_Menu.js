// Menu for Catharsis

const startGameBtn = document.getElementById("startGameBtn");
const tutorialBtn = document.getElementById("tutorialBtn");
const statsBtn = document.getElementById("statisticsBtn");
const userDisplay = document.getElementById("userDisplay");
const username = localStorage.getItem("username");

if(username){
    userDisplay.textContent = "Welcome " + username;
}

startGameBtn.addEventListener("click", () => {
    window.location.href = "../scenes/map/map.html";
});

tutorialBtn.addEventListener("click", () => {
    window.location.href = "Tutorial.html";
});

statsBtn.addEventListener("click", () => {
    window.location.href = "Statistics.html";
});