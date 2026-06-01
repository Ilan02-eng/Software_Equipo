//Menu for Catharsis
const aboutBtn = document.getElementById("aboutBtn");
const loginBtn = document.getElementById("loginBtn");
const startGameBtn = document.getElementById("startGameBtn");
const tutorialBtn = document.getElementById("tutorialBtn");
const statisticsBtn = document.getElementById("statisticsBtn");

aboutBtn.addEventListener("click", () => {
    window.location.href = "About.html";
});

loginBtn.addEventListener("click", () => {
    window.location.href = "Login.html";
});

startGameBtn.addEventListener("click", () => {
    window.location.href = "../scenes/map/map.html";
});

tutorialBtn.addEventListener("click", () => {
    window.location.href = "tutorial.html";
});

statisticsBtn.addEventListener("click", () => {
    window.location.href = "statistics.html";
});

logoutBtn.addEventListener("click", () => {
    window.location.href = "login.html";
});