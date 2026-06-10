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
        effect: "10 - 15 damage points",
        description: "A quick and precise slash that tears through enemies with feline accuracy",
        sprite: "../../VisualsVideogame/Cards/Card_one.png"
    },
    {
        name: "Purr Attack",
        type: "Attack",
        cost: "20 energy points",
        effect: "25 - 30 damage points",
        description: "A deceptively gentle attack that confuses enemies while delivering unexpected damage",
        sprite: "../../VisualsVideogame/Cards/Card_two.png"
    },
    {
        name: "Shadow Pounce",
        type: "Attack",
        cost: "30 energy points",
        effect: "30 - 35 damage points",
        description: "Leap from the darkness and strike before the enemy can react",
        sprite: "../../VisualsVideogame/Cards/Card_three.png"
    },
    {
        name: "Scratches",
        type: "Attack",
        cost: "35 energy points",
        effect: "30 - 40 damage points",
        description: "Rapid claw attacks that overwhelm enemies with a flurry of strikes",
        sprite: "../../VisualsVideogame/Cards/Card_four.png"
    },
    {
        name: "Love Bite",
        type: "Attack",
        cost: "60 energy points",
        effect: "50 - 70 damage points",
        description: "A playful but painful bite that leaves enemies distracted and irritated.",
        sprite: "../../VisualsVideogame/Cards/Card_five.png"
    },
    {
        name: "Lick wounds",
        type: "Defense",
        cost: "0 energy points",
        effect: "Restore 10 HP",
        description: "A soothing gesture that helps recover health over time",
        sprite: "../../VisualsVideogame/Cards/Card_six.png"
    },
    {
        name: "Tuna Can",
        type: "Defense",
        cost: "15 energy points",
        effect: "Restore 15 HP",
        description: "A tasty boost that restores energy and strengthens your defenses",
        sprite: "../../VisualsVideogame/Cards/Card_seven.png"
    },
    {
        name: "Cat Nap",
        type: "Defense",
        cost: "30 energy points",
        effect: "Restore 25 HP",
        description: "Take a quick rest to regain strength and prepare for the next encounter",
        sprite: "../../VisualsVideogame/Cards/Card_eight.png"
    },
    {
        name: "Delicious treat",
        type: "Defense",
        cost: "55 energy points",
        effect: "Restore 50 HP",
        description: "A rewarding snack that restores health and improves resilience",
        sprite: "../../VisualsVideogame/Cards/Card_nine.png"
    },
    {
        name: "Nine lives",
        type: "Defense",
        cost: "60 energy points",
        effect: "Evade the next enemy attack",
        description: "A mysterious blessing that lets you endure what should have been fatal",
        sprite: "../../VisualsVideogame/Cards/Card_ten.png"
    },

    {
        name: "Laser Pointer",
        type: "Control",
        cost: "90 energy points",
        effect: "The enemy skips their next two turn",
        description: "Completely distracts the enemy, forcing them to lose focus on the battle",
        sprite: "../../VisualsVideogame/Cards/Card_twelve.png"
    },
    {
        name: "Cat Reflexes",
        type: "Control",
        cost: "45 energy points",
        effect: "The enemy skips their next turn",
        description: "Heightened instincts allow you to react instantly to incoming danger",
        sprite: "../../VisualsVideogame/Cards/Card_eleven.png"
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