//TUtorial for catharsis
const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
    window.location.href = "Run_Menu.html";
});

const userDisplay = document.getElementById("userDisplay");
const logoutBtn = document.getElementById("logoutBtn");
const username = localStorage.getItem("loggedInUser");
const cards = [
    {
        name: "Sharp Claw",
        type: "Attack",
        cost: "0 energy points",
        effect: "15 damage points",
        description: "A quick and precise slash that tears through enemies with feline accuracy",
        sprite: "../../VisualsVideogame/Cards/1.png"
    },
    {
        name: "Purr Attack",
        type: "Attack",
        cost: "15 energy points",
        effect: "30 damage points",
        description: "A deceptively gentle attack that confuses enemies while delivering unexpected damage",
        sprite: "../../VisualsVideogame/Cards/2.png"
    },
    {
        name: "Shadow Pounce",
        type: "Attack",
        cost: "10 energy points",
        effect: "20 damage points",
        description: "Leap from the darkness and strike before the enemy can react",
        sprite: "../../VisualsVideogame/Cards/3.png"
    },
    {
        name: "Scratches",
        type: "Attack",
        cost: "25 energy points",
        effect: "40 damage points",
        description: "Rapid claw attacks that overwhelm enemies with a flurry of strikes",
        sprite: "../../VisualsVideogame/Cards/4.png"
    },
    {
        name: "Love Bite",
        type: "Attack",
        cost: "35 energy points",
        effect: "55 damage points",
        description: "A playful but painful bite that leaves enemies distracted and irritated.",
        sprite: "../../VisualsVideogame/Cards/5.png"
    },
    {
        name: "Lick wounds",
        type: "Defense",
        cost: "0 energy points",
        effect: "Restore 10 HP",
        description: "A soothing gesture that helps recover health over time",
        sprite: "../../VisualsVideogame/Cards/6.png"
    },
    {
        name: "Tuna Can",
        type: "Defense",
        cost: "10 energy points",
        effect: "Restore 20 HP",
        description: "A tasty boost that restores energy and strengthens your defenses",
        sprite: "../../VisualsVideogame/Cards/7.png"
    },
    {
        name: "Cat Nap",
        type: "Defense",
        cost: "20 energy points",
        effect: "Restore 30 HP",
        description: "Take a quick rest to regain strength and prepare for the next encounter",
        sprite: "../../VisualsVideogame/Cards/8.png"
    },
    {
        name: "Delicious treat",
        type: "Defense",
        cost: "30 energy points",
        effect: "Restore 45 HP",
        description: "A rewarding snack that restores health and improves resilience",
        sprite: "../../VisualsVideogame/Cards/9.png"
    },
    {
        name: "Nine lives",
        type: "Defense",
        cost: "25 energy points",
        effect: "Evade the next enemy attack",
        description: "A mysterious blessing that lets you endure what should have been fatal",
        sprite: "../../VisualsVideogame/Cards/10.png"
    },

    {
        name: "Laser Pointer",
        type: "Control",
        cost: "35 energy points",
        effect: "The enemy skips their next two turn",
        description: "Completely distracts the enemy, forcing them to lose focus on the battle",
        sprite: "../../VisualsVideogame/Cards/11.png"
    },
    {
        name: "Cat Reflexes",
        type: "Control",
        cost: "25 energy points",
        effect: "The enemy skips their next turn",
        description: "Heightened instincts allow you to react instantly to incoming danger",
        sprite: "../../VisualsVideogame/Cards/12.png"
    },
    {
        name: "Wildcard: Low risk",
        type: "Wildcard",
        cost: "30 HP",
        effect: "You gain 40 energy points",
        description: "Heightened instincts allow you to react instantly to incoming danger",
        sprite: "../../VisualsVideogame/Cards/13.png"
    },
    {
        name: "Wildcard: Moderate risk",
        type: "Wildcard",
        cost: "40 HP",
        effect: "You gain 60 energy points",
        description: "Heightened instincts allow you to react instantly to incoming danger",
        sprite: "../../VisualsVideogame/Cards/14.png"
    },
    {
        name: "Wildcard: Low risk",
        type: "Wildcard",
        cost: "50 HP",
        effect: "You gain 80 energy points",
        description: "Heightened instincts allow you to react instantly to incoming danger",
        sprite: "../../VisualsVideogame/Cards/15.png"
    },
    {
        name: "Energy Upgrade",
        type: "Energy",
        cost: " - ",
        effect: "You gain 10 energy points",
        description: "Your luck has given you a little bit more of energy to spend the day",
        sprite: "../../VisualsVideogame/Cards/16.png"
    },
    {
        name: "Life Upgrade",
        type: "Life Card",
        cost: " -",
        effect: "You gain 15 life points",
        description: "With a fresh breathe of air we gain calm and a little bit of life",
        sprite: "../../VisualsVideogame/Cards/17.png"
    },
];

const container = document.getElementById("cardContainer");

cards.forEach(card => {
    const cardBox = document.createElement("div");
    cardBox.classList.add("card-box");

    cardBox.innerHTML = `
        <div class="card-sprite">
            <img src="${card.sprite}" alt="${card.name}">
        </div>

        <div class="card-info">
            <h3>${card.name}</h3>
            <p><strong>Type:</strong> ${card.type}</p>
            <p><strong>Energy Cost:</strong> ${card.cost}</p>
            <p><strong>Effect:</strong> ${card.effect}</p>
            <p><strong>Description:</strong> ${card.description}</p>
        </div>
    `;

    container.appendChild(cardBox);
});


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