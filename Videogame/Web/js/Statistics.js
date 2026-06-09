// Statistics for Catharsis

document.getElementById("runsCompleted").textContent =
    localStorage.getItem("runsCompleted") || 0;

document.getElementById("neighborsHelped").textContent =
    localStorage.getItem("neighborsHelped") || 0;

document.getElementById("cardsCollected").textContent =
    localStorage.getItem("cardsCollected") || 0;

document.getElementById("highestLevel").textContent =
    localStorage.getItem("highestLevel") || 0;

document.getElementById("playTime").textContent =
    (localStorage.getItem("playTime") || 0) + " Hours";

document.getElementById("bossesDefeated").textContent =
    localStorage.getItem("bossesDefeated") || 0;

const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
    window.location.href = "Run_Menu.html";
});