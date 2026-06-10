"use strict";

const canvasWidth = 800;
const canvasHeight = 600;

let ctx;
let game;
let oldTime;
let playerSpeed = 0.3;

//Main states and scenes of the game
const SCENES = {
  VILLA: "villa",
  CASA: "casa",
  CASA_LJ: "casa_lj",
  HABITACION: "habitacion",
  COMBATE: "combate",
  UPGRADE: "upgrade",
  GAME_OVER: "game_over",
  VICTORY: "victory",

  PAUSE: "pause",
  NEXT_DAY: "next_day",
  CREDITS: "credits",
  STATS: "stats",

  DECK: "deck",
  CARD_REWARD: "card_reward",
};

const UPGRADES = [
  {
    name: "+15 HP",
    description: "Increase max life",
    color: "green",
    action: (player) => {
      player.maxHP += 15;
      player.hp = player.maxHP;
    },
  },
  {
    name: "+10 Energy",
    description: "Increase max energy",
    color: "blue",
    action: (player) => {
      player.maxEnergy += 10;
      player.energy = player.maxEnergy;
    },
  },
];

//Types of cards and defines the colors that each type has
const CARD_TYPES = {
  ATTACK: { color: "red", label: "Attack" },
  DEFENSA: { color: "lightgreen", label: "Defensive" },
  CONTROL: { color: "lightblue", label: "Control" },
};

//Pool of available cards for the combat, each card has a direct effect that affects either the player or the enemy
const API_URL = "http://localhost:3000";

let CARD_POOL = [];

async function loadCardsFromDB() {
  const response = await fetch(`${API_URL}/cards`);
  const dbCards = await response.json();

  CARD_POOL = dbCards
    .filter((card) => card.type !== "Wildcard")
    .map((card) => {
      const sprite = `../../VisualsVideogame/Cards/${card.card_ID}.png`;
      const img = new Image();
      img.src = sprite;

      return {
        card_ID: card.card_ID,
        name: card.name,
        sprite: sprite,
        image: img,
        type:
          card.type === "Attack"
            ? CARD_TYPES.ATTACK
            : card.type === "Defense"
              ? CARD_TYPES.DEFENSA
              : CARD_TYPES.CONTROL,
        cost: card.cost,
        effect: card.effect,
        action: createCardAction(card),
      };
    });
}

function createCardAction(card) {
  if (card.name === "Sharp Claw") return (p, e) => (e.hp -= 15);
  if (card.name === "Shadow Pounce") return (p, e) => (e.hp -= 20);
  if (card.name === "Purr Attack") return (p, e) => (e.hp -= 30);
  if (card.name === "Scratches") return (p, e) => (e.hp -= 40);
  if (card.name === "Love Bite") return (p, e) => (e.hp -= 55);

  if (card.name === "Lick Wounds")
    return (p, e) => (p.hp = Math.min(p.maxHP, p.hp + 10));
  if (card.name === "Tuna Can")
    return (p, e) => (p.hp = Math.min(p.maxHP, p.hp + 20));
  if (card.name === "Cat Nap")
    return (p, e) => (p.hp = Math.min(p.maxHP, p.hp + 30));
  if (card.name === "Deliciuos Treat")
    return (p, e) => (p.hp = Math.min(p.maxHP, p.hp + 45));
  if (card.name === "Nine Lives") return (p, e) => (p.evasionChance += 1);

  if (card.name === "Cat Reflexes") return (p, e) => (e.stunnedTurns += 1);
  if (card.name === "Laser Pointer") return (p, e) => (e.stunnedTurns += 2);

  return (p, e) => {};
}

//Defines de Wildcard card this card trades HP for energy
const WILDCARD = {
  name: "Wildcard",
  color: "purple",
  cost: "30 HP",
  effect: "Trade HP for 40 Energy points",
  hpCost: 30,
  action: (p, e) => {
    p.hp -= WILDCARD.hpCost;
    p.energy += 40;
    if (p.hp < 1) p.hp = 1;
  },
};

async function apiRequest(path, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body !== null) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("API error:", method, path, data);
    throw new Error(data.error || "API request failed");
  }

  return data;
}

function getLoggedPlayerID() {
  return localStorage.getItem("player_ID");
}

const keyDirections = {
  w: "up",
  a: "left",
  s: "down",
  d: "right",
  ArrowUp: "up",
  ArrowLeft: "left",
  ArrowDown: "down",
  ArrowRight: "right",
};

// Data structure with the directions a character can move, the direction sign and the related animation.
const playerMotion = {
  down: {
    status: false,
    axis: "y",
    sign: 1,
    repeat: true,
    duration: 100,
    moveFrames: [0, 3],
    idleFrames: [0, 0],
  },
  up: {
    status: false,
    axis: "y",
    sign: -1,
    repeat: true,
    duration: 100,
    moveFrames: [4, 7],
    idleFrames: [4, 4],
  },
  right: {
    status: false,
    axis: "x",
    sign: 1,
    repeat: true,
    duration: 100,
    moveFrames: [8, 11],
    idleFrames: [8, 8],
  },
  left: {
    status: false,
    axis: "x",
    sign: -1,
    repeat: true,
    duration: 100,
    moveFrames: [12, 15],
    idleFrames: [12, 12],
  },
};

//Class to create and draw the HP and energy bars during the combat scene
class combatBars {
  constructor(position, width, height, target, type, color) {
    this.position = position;
    this.width = width;
    this.height = height;
    this.target = target;
    this.type = type;
    this.barColor = color;
  }

  draw(ctx) {
    let current;
    let max;

    if (this.type === "hp") {
      current = this.target.hp;
      max = this.target.maxHP;
    } else if (this.type === "energy") {
      current = this.target.energy;
      max = this.target.maxEnergy;
    }

    let percentage = current / max;

    ctx.fillStyle = "black";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    ctx.fillStyle = this.barColor;
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.width * percentage,
      this.height,
    );

    ctx.strokeStyle = "white";
    ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      `${current} / ${max}`,
      this.position.x + this.width / 2,
      this.position.y + 17,
    );
  }
}

//Defines de character that the player plays as, controls the movement, stats, collisons and characteristics of the player.
class Player extends GameObject {
  constructor(position, width, height, color, sheetCols) {
    super(position, width, height, color, "player", sheetCols);
    this.velocity = new Vector(0, 0);

    this.maxHP = 100;
    this.hp = this.maxHP;
    this.evasionChance = 0;
    this.maxEnergy = 150;
    this.energy = this.maxEnergy;
  }

  update(deltaTime) {
    if (
      game &&
      (game.currentScene === SCENES.COMBATE ||
        game.currentScene === SCENES.UPGRADE)
    ) {
      this.velocity = new Vector(0, 0);
      return;
    }

    this.velocity = this.velocity.normalize().times(playerSpeed);

    this.previousPosition = new Vector(this.position.x, this.position.y);
    this.position = this.position.plus(this.velocity.times(deltaTime));

    this.updateCollider();
    this.clampWithinCanvas();
  }

  clampWithinCanvas() {
    if (this.position.y < 0) {
      this.position.y = 0;
    } else if (this.position.y + this.height > game.worldHeight) {
      this.position.y = game.worldHeight - this.height;
    }

    if (this.position.x < 0) {
      this.position.x = 0;
    } else if (this.position.x + this.width > game.worldWidth) {
      this.position.x = game.worldWidth - this.width;
    }
  }
}

//Defines the enemy during combat (stats of the enemy)
class Enemy extends GameObject {
  constructor(position, width, height, color) {
    super(position, width, height, color);

    this.enemyTypes = [
      {
        name: "Little Jimmy",
        hp_min: 100,
        hp_max: 120,
        dmg_min: 9,
        dmg_max: 15,
        sprite: "../assets/sprites/monster_littlejimmy.png",
      },
      {
        name: "Rotoplas",
        hp_min: 70,
        hp_max: 85,
        dmg_min: 15,
        dmg_max: 20,
        sprite: "../assets/sprites/monster_rotoplas.png",
      },
    ];

    this.enemyType = this.getRandomEnemy();

    this.enemy_name = this.enemyType.name;

    this.enemy_lvl = 1;

    this.hp_min = 0;
    this.hp_max = 0;
    this.dmg_min = 0;
    this.dmg_max = 0;
    this.maxHP = 0;
    this.hp = 0;
    this.stunnedTurns = 0;

    this.generateStats(1);
  }

  getRandomEnemy() {
    let randomIndex = Math.floor(Math.random() * this.enemyTypes.length);
    return this.enemyTypes[randomIndex];
  }

  generateStats(level) {
    this.enemy_lvl = level;
    this.enemy_name = this.enemyType.name;

    this.hp_min = this.enemyType.hp_min + (level - 1) * 30;
    this.hp_max = this.enemyType.hp_max + (level - 1) * 40;

    this.dmg_min = this.enemyType.dmg_min + (level - 1) * 5;
    this.dmg_max = this.enemyType.dmg_max + (level - 1) * 7;

    this.maxHP = this.randomNumber(this.hp_min, this.hp_max);
    this.hp = this.maxHP;
    this.stunnedTurns = 0;

    this.setSprite(
    this.enemyType.sprite,
    new Rect(0, 0, 1000, 1000)
  );
  }

  randomDamage() {
    return this.randomNumber(this.dmg_min, this.dmg_max);
  }

  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

//Represents the interior areas of the map
class Room extends GameObject {
  constructor(position, width, height, color, sheetCols) {
    super(position, width, height, color, "room", sheetCols);
    this.velocity = new Vector(0, 0);
  }

  update(deltaTime) {
    this.velocity = this.velocity.normalize().times(playerSpeed);
    this.position = this.position.plus(this.velocity.times(deltaTime));
    this.player.updateCollider();
  }
}

//Defines the random generation of the 9 rooms of the house
class MapHouse {
  constructor() {
    this.map_transitions = [
      [9, 3],
      [3, 0],
      [3, 4],
      [3, 6],
      [0, 1],
      [1, 2],
      [1, 4],
      [2, 5],
      [4, 5],
      [4, 7],
      [5, 8],
      [6, 7],
      [7, 8],
    ];

    this.roomPositions = {
      9: { x: 0, y: 1 },
      0: { x: 1, y: 0 },
      3: { x: 1, y: 1 },
      6: { x: 1, y: 2 },
      1: { x: 2, y: 0 },
      4: { x: 2, y: 1 },
      7: { x: 2, y: 2 },
      2: { x: 3, y: 0 },
      5: { x: 3, y: 1 },
      8: { x: 3, y: 2 },
    };

    this.rooms = [0, 3, 4, 6, 9];
    this.randomRooms = [1, 2, 5, 7, 8];
    this.enemyRooms = [2, 5, 8];

    this.activeRooms = [];
    this.enemyRoomID = null;
  }

  //Generates all the "normal" rooms of the house
  randomMap() {
    this.activeRooms = [];

    for (let i = 0; i < this.rooms.length; i++) {
      this.activeRooms.push(this.rooms[i]);
    }

    for (let i = 0; i < this.randomRooms.length; i++) {
      let random = Math.floor(Math.random() * 100);

      if (random < 75) {
        this.activeRooms.push(this.randomRooms[i]);
      }
    }

    this.randomEnemyRoom();
  }

  //Generates the random room in which the enemy will be spawn (it can only spawn in the rooms 2, 5 and 8)
  randomEnemyRoom() {
    let possibleRooms = [];

    for (let i = 0; i < this.enemyRooms.length; i++) {
      if (this.activeRooms.includes(this.enemyRooms[i])) {
        possibleRooms.push(this.enemyRooms[i]);
      }
    }

    if (possibleRooms.length === 0) {
      this.activeRooms.push(2);
      possibleRooms.push(2);
    }

    let random = Math.floor(Math.random() * possibleRooms.length);
    this.enemyRoomID = possibleRooms[random];
  }

  //Lets the player go from one room to the other and the other way around
  canPass(fromRoom, toRoom) {
    if (!this.activeRooms.includes(toRoom)) {
      return false;
    }

    for (let i = 0; i < this.map_transitions.length; i++) {
      let roomA = this.map_transitions[i][0];
      let roomB = this.map_transitions[i][1];

      if (roomA === fromRoom && roomB === toRoom) return true;
      if (roomA === toRoom && roomB === fromRoom) return true;
    }

    return false;
  }

  //Defines the position of each door in the new room
  getDoorsFrom(roomID) {
    let doors = [];

    for (let i = 0; i < this.map_transitions.length; i++) {
      let roomA = this.map_transitions[i][0];
      let roomB = this.map_transitions[i][1];

      if (roomA === roomID && this.activeRooms.includes(roomB)) {
        doors.push(roomB);
      }

      if (roomB === roomID && this.activeRooms.includes(roomA)) {
        doors.push(roomA);
      }
    }

    return doors;
  }

  getDirection(fromRoom, toRoom) {
    let from = this.roomPositions[fromRoom];
    let to = this.roomPositions[toRoom];

    if (to.x > from.x) return "right";
    if (to.x < from.x) return "left";
    if (to.y > from.y) return "bottom";
    if (to.y < from.y) return "top";

    return "";
  }
}

//Controls all the logic and mechanics of the game such as the combat, cards, flow, collisions, etc.
class Game {
  constructor() {
    this.currentScene = SCENES.CASA;
    this.actors = [];
    this.transitionCooldown = 0;

    this.enemy = null;

    // Database IDs and counters
    this.player_ID = getLoggedPlayerID();
    this.run_ID = null;
    this.combat_ID = null;
    this.runFinished = false;
    this.combatStats = null;
    this.runPromise = this.startRunInDB();

    this.day = 1;
    this.maxDay = 3;

    this.mapHouse = new MapHouse();
    this.mapHouse.randomMap();
    this.enemyRoomID = this.mapHouse.enemyRoomID;
    this.randomEnemyLocation();
    this.currentRoom = 3;

    this.cards = [];
    this.unlockedCards = [];
    this.collectedRoomUpgrades = {};
    this.wildcard = null;
    this.hasWildcard = false;
    this.wildcardRoom = null;
    this.isPlayerTurn = true;

    this.dmg_done = 0;
    this.dmg_receive = 0;
    this.hp_recovered = 0;
    this.cards_used = 0;

    this.upgradeButtons = [];
    this.upgradeReturnScene = SCENES.HABITACION;

    this.camera = { x: 0, y: 0 };
    this.worldWidth = canvasWidth * 3;
    this.worldHeight = canvasHeight * 3;

    this.music = {
      villa: new Audio("../assets/audio/villa.wav"),
      casa: new Audio("../assets/audio/casa.wav"),
      casa_lj: new Audio("../assets/audio/casalj.mp3"),
      habitacion: new Audio("../assets/audio/casa.wav"),
      combate: new Audio("../assets/audio/combate.wav"),
    };

    this.sounds = {
      card: new Audio("../assets/audio/unacarta.wav"),
    };

    this.currentMusic = null;

    this.createEventListeners();
    this.initObjects();
    this.loadScene(SCENES.CASA);
    this.livebars = [];
    this.message = "";
    this.messageTimer = 0;

    this.username = localStorage.getItem("username") || "Guest";

    for (let key in this.music) {
      this.music[key].loop = true;
      this.music[key].volume = 0.35;
    }

    this.sounds.card.volume = 0.7;

    this.rewardCard = null;
    this.rewardCardImage = null;
    this.loadGame();
  }

  async startRunInDB() {
    if (!this.player_ID) {
      console.warn("No player_ID found. Login first to save stats.");
      return null;
    }

    try {
      const data = await apiRequest("/runs", "POST", {
        player_ID: this.player_ID,
      });
      this.run_ID = data.run_ID;
      return this.run_ID;
    } catch (error) {
      console.error("Could not start run in DB:", error);
      return null;
    }
  }

  async ensureRunInDB() {
    if (this.run_ID) return this.run_ID;
    if (this.runPromise) await this.runPromise;
    if (this.run_ID) return this.run_ID;
    return await this.startRunInDB();
  }

  async startCombatInDB() {
    try {
      const run_ID = await this.ensureRunInDB();
      if (!run_ID || !this.enemy) return;

      const data = await apiRequest("/combats", "POST", {
        run_ID,
        enemy_name: this.enemy.enemy_name,
        enemy_lvl: this.enemy.enemy_lvl,
      });

      this.combat_ID = data.combat_ID;
    } catch (error) {
      console.error("Could not create combat in DB:", error);
    }
  }
  drawUsername(ctx) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(560, 15, 160, 40);

    ctx.strokeStyle = "white";
    ctx.strokeRect(560, 15, 160, 40);

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";

    ctx.fillText(this.username, 610, 40);
  }

deleteSave() {
  if (!this.player_ID) return;
  localStorage.removeItem(this.getSaveKey());
}

getSaveKey() {
  return "catharsisSave_" + this.player_ID;
}

  resetCombatStats() {
    this.combatStats = {
      dmg_done: 0,
      dmg_receive: 0,
      hp_recovered: 0,
      cards_used: 0,
    };
  }

  async saveCombatStatsInDB() {
    if (!this.combat_ID || !this.combatStats) return;

    try {
      await apiRequest(
        `/combats/${this.combat_ID}/stats`,
        "POST",
        this.combatStats,
      );
    } catch (error) {
      console.error("Could not save combat stats in DB:", error);
    }
  }

  async saveCardUsedInDB(cardName) {
    try {
      const run_ID = await this.ensureRunInDB();
      if (!run_ID || !this.combat_ID || !cardName) return;

      await apiRequest(`/runs/${run_ID}/cards`, "POST", {
        card_name: cardName,
        combat_ID: this.combat_ID,
      });
    } catch (error) {
      console.error("Could not save used card in DB:", error);
    }
  }

  async savePlayerStatsInDB() {
    if (!this.player_ID || !this.player) return;

    try {
      await apiRequest(`/players/${this.player_ID}`, "PATCH", {
        hp: this.player.hp,
        energy: this.player.energy,
      });
    } catch (error) {
      console.error("Could not save player stats in DB:", error);
    }
  }

  async finishRunInDB(result) {
    if (this.runFinished) return;
    this.runFinished = true;

    try {
      const run_ID = await this.ensureRunInDB();
      if (!run_ID) return;

      await this.savePlayerStatsInDB();
      await apiRequest(`/runs/${run_ID}/finish`, "PATCH", {
        run_result: result,
      });
    } catch (error) {
      console.error("Could not finish run in DB:", error);
    }
  }

  //Creates all the objects of the game includes the player, enemy, rooms, houses, etc.
  initObjects() {
    this.player = new AnimatedPlayer(
      new Vector(canvasWidth / 2, canvasHeight / 2),
      80,
      80,
      "red",
      4,
      playerMotion,
    );
    this.player.setSprite(
      "../assets/sprites/character.png",
      new Rect(0, 0, 831, 831),
    );
    this.player.setSpeed(playerSpeed);
    this.player.maxHP = 100;
    this.player.hp = 100;
    this.player.evasionChance = 0;
    this.player.maxEnergy = 150;
    this.player.energy = 150;

    this.casa = new GameObject(
      new Vector(canvasWidth / 4 + 450, canvasHeight + 300),
      400,
      300,
      "grey",
    );
    this.casa.setSprite(
      "../assets/sprites/house.png",
      new Rect(-200, 0, 1250, 1050),
    );
    this.casa.setCollider(300, 250);

    this.casa_lj = new GameObject(
      new Vector(canvasWidth * 2 + 200, canvasHeight + 700),
      380,
      280,
      "purple",
    );
    this.casa_lj.setSprite(
      "../assets/sprites/house_LJ.png",
      new Rect(-45, 0, 1200, 1100),
    );
    this.casa_lj.setCollider(380, 200);

    this.salida_casa = new GameObject(
      new Vector(canvasWidth / 2, 590),
      120,
      100,
      "rgba(0,0,0,0)",
    );

    this.salida_casa_lj = new GameObject(
      new Vector(20, canvasHeight / 2),
      90,
      120,
      "rgba(0,0,0,0)",
    );

    this.exit_room1 = new GameObject(
      new Vector(canvasWidth / 2, canvasHeight),
      200,
      120,
      "rgba(0,0,0,0)",
    );

    this.exit_room2 = new GameObject(
      new Vector(canvasWidth / 2, canvasHeight - canvasHeight),
      200,
      120,
      "rgba(0,0,0,0)",
    );

    this.exit_room3 = new GameObject(
      new Vector(0, canvasHeight / 2),
      120,
      200,
      "rgba(0,0,0,0)",
    );

    this.room_1 = new Room(
      new Vector(canvasWidth / 2 + 60, canvasHeight - canvasHeight + 60),
      200,
      120,
      "rgba(0,0,0,0)",
    );

    this.room_2 = new Room(
      new Vector(canvasWidth / 2, canvasHeight),
      200,
      120,
      "rgba(0,0,0,0)",
    );

    this.room_3 = new Room(
      new Vector(canvasWidth - 5, canvasHeight / 2),
      120,
      200,
      "rgba(0,0,0,0)",
    );

    this.enemy = new Enemy(
      new Vector(canvasWidth - 170, 195),
      200,
      200,
      "orange",
    );

    this.roomUpgrade = new GameObject(new Vector(350, 250), 90, 90, "yellow");

    this.roomUpgrade.setSprite(
      "../assets/sprites/chest.png",
      new Rect(-180, -200, 1064, 1064),
    );
    this.roomUpgrade.setCollider(70, 60);

    this.bushes = [];
    const bushSprites = [
      { src: "../assets/sprites/bush.png", rect: new Rect(0, 0, 1284, 1020) },
      { src: "../assets/sprites/bush2.png", rect: new Rect(0, 0, 1280, 640) },
      { src: "../assets/sprites/bush3.png", rect: new Rect(0, 0, 1920, 960) },
    ];

    for (let i = 0; i < 10; i++) {
      let bush;
      let tries = 0;

      do {
        let randomX = Math.random() * (this.worldWidth - 100) + 50;
        let randomY = Math.random() * (this.worldHeight - 100) + 50;

        bush = new GameObject(new Vector(randomX, randomY), 90, 70, "green");
        tries++;
      } while (
        tries < 100 &&
        (boxOverlap(bush, this.casa) ||
          boxOverlap(bush, this.casa_lj) ||
          this.bushes.some((bushData) => boxOverlap(bush, bushData.bush)))
      );

      let randomSprite =
        bushSprites[Math.floor(Math.random() * bushSprites.length)];

      bush.setSprite(randomSprite.src, randomSprite.rect);

      this.bushes.push({
        bush: bush,
        hasCard: true,
        collected: false,
      });
    }
    this.backgroundVilla = new GameObject(
      new Vector(0, 0),
      canvasWidth,
      canvasHeight,
      "green",
    );

    this.backgroundCasa = new Image();
    this.backgroundCasa.src = "../assets/sprites/Your_Room.png";

    this.backgroundCasa_enemy = new Image();
    this.backgroundCasa_enemy.src = "../assets/sprites/villain_room.jpg";

    this.backgroundHabitacion = new Image();
    this.backgroundHabitacion.src = "../assets/sprites/verde.png";

    this.backgroundMeca = new Image();
    this.backgroundMeca.src = "../assets/sprites/meca.png";

    this.backgroundBackro = new Image();
    this.backgroundBackro.src = "../assets/sprites/backro.png";

    this.tileVilla = new Image();
    this.tileVilla.src = "../assets/sprites/villa.png";

    this.pauseScreen = new Image();
    this.pauseScreen.src = "../assets/screens/pantalladepausa.png";

    this.gameOverScreen = new Image();
    this.gameOverScreen.src = "../assets/screens/Game Over.png";

    this.nextDayScreen = new Image();
    this.nextDayScreen.src = "../assets/screens/Next day.png";

    this.creditsScreen = new Image();
    this.creditsScreen.src = "../assets/screens/Credits.png";
  }

  playMusic(name) {
    if (name === SCENES.HABITACION) name = "casa_lj";

    if (!this.music || !this.music[name]) return;

    if (this.currentMusic === name) return;

    Object.values(this.music).forEach((song) => {
      song.pause();
      song.currentTime = 0;
    });

    let song = this.music[name];
    song.loop = true;
    song.volume = 0.35;

    song.play().catch((error) => {
      console.log("No se pudo reproducir música:", error);
    });

    this.currentMusic = name;
  }

  updateCamera() {
    this.camera.x = this.player.position.x - canvasWidth / 2;
    this.camera.y = this.player.position.y - canvasHeight / 2;

    // Clamping para no salir del mundo
    this.camera.x = Math.max(
      0,
      Math.min(this.camera.x, this.worldWidth - canvasWidth),
    );
    this.camera.y = Math.max(
      0,
      Math.min(this.camera.y, this.worldHeight - canvasHeight),
    );
  }

  //Random generation fo the enemy in the rooms of the house
  randomEnemyLocation() {
    this.mapHouse.randomEnemyRoom();
    this.enemyRoomID = this.mapHouse.enemyRoomID;
    let possibleRooms = this.mapHouse.activeRooms.filter(
      (room) => room !== 9 && room !== this.enemyRoomID,
    );

    this.wildcardRoom =
      possibleRooms[Math.floor(Math.random() * possibleRooms.length)];
  }

  //Detects when a player is entering another room and defines which room or place is
  enterRoom(roomID) {
    if (!this.mapHouse.canPass(this.currentRoom, roomID)) {
      return;
    }

    let previousRoom = this.currentRoom;

    if (roomID === 9) {
      this.currentRoom = 3;
      this.player.velocity = new Vector(0, 0);

      this.player.position = new Vector(canvasWidth - 220, canvasHeight - 170);

      this.loadScene(SCENES.VILLA);
      return;
    }

    this.currentRoom = roomID;
    this.player.velocity = new Vector(0, 0);
    this.setPlayerPositionFromDoor(previousRoom, roomID);

    if (roomID === this.enemyRoomID) {
      this.loadScene(SCENES.COMBATE);
      return;
    }

    this.loadScene(SCENES.HABITACION);
  }

  //Position of the other of the house
  getDoorByDirection(direction) {
    if (direction === "top") return this.room_1;
    if (direction === "bottom") return this.room_2;
    if (direction === "left") return this.salida_casa_lj;
    if (direction === "right") return this.room_3;
    return null;
  }

  giveRandomCard() {
    if (this.unlockedCards.length >= 10) {
      this.message = "Deck Full! (10/10)";
      this.messageTimer = 120;
      return;
    }

    let randomCard = CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)];
    if (!randomCard) return;

    this.unlockedCards.push(randomCard);
    this.saveGame();
    this.playSound("card");

    this.rewardCard = randomCard;
    this.rewardCardImage = randomCard.image || new Image();

    if (!randomCard.image) {
      this.rewardCardImage.src = randomCard.sprite;
    }

    this.message =
      randomCard.name + " acquired! (" + this.unlockedCards.length + "/10)";

    this.messageTimer = 120;
    this.loadScene(SCENES.CARD_REWARD);
  }
  //Loads the door of each room in the house
  loadHouseDoors() {
    let doors = this.mapHouse.getDoorsFrom(this.currentRoom);

    this.room_1.roomID = undefined;
    this.room_2.roomID = undefined;
    this.room_3.roomID = undefined;
    this.salida_casa_lj.roomID = undefined;
    this.actors = [this.player];

    for (let i = 0; i < doors.length; i++) {
      let roomID = doors[i];
      let direction = this.mapHouse.getDirection(this.currentRoom, roomID);
      let door = this.getDoorByDirection(direction);

      if (door !== null) {
        door.roomID = roomID;
        this.actors.push(door);
      }
    }
  }

  //Defines the distance and position of the player when going through a door
  setPlayerPositionFromDoor(fromRoom, toRoom) {
    let direction = this.mapHouse.getDirection(fromRoom, toRoom);
    if (direction === "top") {
      this.player.position = new Vector(canvasWidth / 2, canvasHeight - 140);
    } else if (direction === "bottom") {
      this.player.position = new Vector(canvasWidth / 2, 100);
    } else if (direction === "left") {
      this.player.position = new Vector(canvasWidth - 170, canvasHeight / 2);
    } else if (direction === "right") {
      this.player.position = new Vector(120, canvasHeight / 2);
    }
  }

  async saveCombatStatsDB() {
    if (!this.combat_ID) return;

    await fetch(`${API_URL}/combats/${this.combat_ID}/stats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dmg_done: this.dmg_done,
        dmg_receive: this.dmg_receive,
        hp_recovered: this.hp_recovered,
        cards_used: this.cards_used,
      }),
    });
  }

  //Generates a random card form CARD_POOL and adds it to a specific position of the combat UI
  getRandomCard(posX) {
    if (this.unlockedCards.length === 0) {
      return null;
    }

    let cardsInCombat = this.cards.map((card) => card.name);

    let availableCards = this.unlockedCards.filter(
      (card) => !cardsInCombat.includes(card.name),
    );

    if (availableCards.length === 0) {
      return null;
    }

    let randomIndex = Math.floor(Math.random() * availableCards.length);
    let randomCard = availableCards[randomIndex];

    return {
      x: posX,
      y: 460,
      w: 110,
      h: 130,
      name: randomCard.name,
      color: randomCard.type.color,
      effect: randomCard.effect,
      cost: randomCard.cost,
      action: randomCard.action,
      sprite: randomCard.sprite,
      image: randomCard.image,
      isWildcard: false,
    };
  }

  //Generates de special card "Wildcard" for the combat UI
  getWildcard() {
    return {
      x: 650,
      y: 460,
      w: 110,
      h: 130,
      name: WILDCARD.name,
      color: WILDCARD.color,
      cost: WILDCARD.cost,
      effect: WILDCARD.effect,
      action: WILDCARD.action,
      isWildcard: true,
    };
  }

  enemyDefeated() {
    this.saveCombatStatsInDB();
    this.savePlayerStatsInDB();

    if (this.day >= this.maxDay) {
      this.finishRunInDB("Win");
      this.loadScene(SCENES.VICTORY);
      return;
    }

    this.day++;
    this.saveGame();
    this.resetBushCards();

    this.randomEnemyLocation();
    this.enemy.enemyType = this.enemy.getRandomEnemy();
    this.enemy.generateStats(this.day);

    this.loadScene(SCENES.NEXT_DAY);
  }

  //Starts the combat (resets the HP and energy, generates de 4 cards of the deck, HP and energy bars and generates the enemy)
  combatHand() {
    this.cards = [];
    this.wildcardUsed = false;
    this.combat_ID = null;
    this.resetCombatStats();
    this.startCombatInDB();
    this.isPlayerTurn = true;
    this.player.energy = this.player.maxEnergy;
    this.player.hp = this.player.maxHP;
    this.player.evasionChance = 0;
    this.enemy.hp = this.enemy.maxHP;
    this.enemy.stunnedTurns = 0;
    this.combatFinished = false;

    for (let i = 0; i < 4; i++) {
      let posX = 40 + i * 140;
      let card = this.getRandomCard(posX);

      if (card !== null) {
        this.cards.push(card);
      }
    }

    this.wildcard = this.hasWildcard ? this.getWildcard() : null;

    this.playerHPBar = new combatBars(
      new Vector(40, 40),
      250,
      25,
      this.player,
      "hp",
      "green",
    );
    this.playerEnergyBar = new combatBars(
      new Vector(40, 80),
      250,
      25,
      this.player,
      "energy",
      "blue",
    );
    this.enemyHPBar = new combatBars(
      new Vector(510, 80),
      250,
      25,
      this.enemy,
      "hp",
      "red",
    );
  }

  //Changes the states of the game to specific scenes
  loadScene(scene) {
    this.currentScene = scene;
    this.playMusic(this.currentScene);
    this.transitionCooldown = 30;

    if (this.player) {
      this.player.velocity = new Vector(0, 0);
      this.player.keys = [];
    }

    switch (scene) {
      case SCENES.VILLA:
        this.player.velocity = new Vector(0, 0);
        this.actors = [this.player, this.casa, this.casa_lj];

        for (let bushData of this.bushes) {
          this.actors.push(bushData.bush);
        }
        break;

      case SCENES.CASA:
        this.player.velocity = new Vector(0, 0);

        this.player.position = new Vector(canvasWidth / 2, canvasHeight - 120);

        this.actors = [this.player];
        break;

      case SCENES.CASA_LJ:
        this.player.velocity = new Vector(0, 0);
        this.loadHouseDoors();
        this.hiddenDoors = this.actors.filter((a) => a !== this.player);
        this.actors = [this.player];
        break;

      case SCENES.HABITACION:
        this.player.velocity = new Vector(0, 0);
        this.loadHouseDoors();
        if (!this.collectedRoomUpgrades[this.currentRoom]) {
          this.actors.push(this.roomUpgrade);
        }
        break;

      case SCENES.COMBATE:
        this.actors = [this.player, this.enemy];
        this.player.position = new Vector(150, canvasHeight * 0.3);
        this.combatHand();
        break;

      case SCENES.CARD_REWARD:
        this.player.velocity = new Vector(0, 0);
        this.actors = [];
        break;

      case SCENES.UPGRADE:
        this.player.velocity = new Vector(0, 0);

        if (this.upgradeReturnScene === SCENES.VILLA) {
          this.actors = [this.player];
          for (let bushData of this.bushes) {
            this.actors.push(bushData.bush);
          }
        } else {
          this.loadHouseDoors();
          if (!this.collectedRoomUpgrades[this.currentRoom]) {
            this.actors.push(this.roomUpgrade);
          }
        }

        this.upgradeButtons = [
          {
            x: 160,
            y: 260,
            w: 230,
            h: 140,
            upgrade: UPGRADES[0],
          },
          {
            x: 410,
            y: 260,
            w: 230,
            h: 140,
            upgrade: UPGRADES[1],
          },
        ];
        break;
    }
  }

  drawUpgradeScreen(ctx) {
    ctx.fillStyle = "rgba(80, 80, 80, 0.65)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "white";
    ctx.font = "bold 38px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Choose an Upgrade", canvasWidth / 2, 150);

    for (let button of this.upgradeButtons) {
      let upgrade = button.upgrade;

      ctx.fillStyle = upgrade.color;
      ctx.fillRect(button.x, button.y, button.w, button.h);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.strokeRect(button.x, button.y, button.w, button.h);

      ctx.fillStyle = "white";
      ctx.font = "bold 28px Arial";
      ctx.fillText(upgrade.name, button.x + button.w / 2, button.y + 58);

      ctx.font = "16px Arial";
      ctx.fillText(upgrade.description, button.x + button.w / 2, button.y + 95);
    }
  }

  drawPauseButton(ctx) {
    if (
      this.currentScene === SCENES.PAUSE ||
      this.currentScene === SCENES.GAME_OVER ||
      this.currentScene === SCENES.CREDITS ||
      this.currentScene === SCENES.NEXT_DAY ||
      this.currentScene === SCENES.VICTORY ||
      this.currentScene === SCENES.CARD_REWARD
    ) {
      return;
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(735, 15, 50, 40);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(735, 15, 50, 40);

    ctx.fillStyle = "white";
    ctx.font = "bold 26px Arial";
    ctx.textAlign = "center";
    ctx.fillText("II", 760, 43);
  }
  drawDeckScreen(ctx) {
    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "white";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("MY DECK", canvasWidth / 2, 50);

    ctx.font = "bold 22px Arial";
    ctx.fillText(
      "Cards: " + this.unlockedCards.length + "/10",
      canvasWidth / 2,
      90,
    );

    let startX = 60;
    let startY = 115;
    let cardW = 130;
    let cardH = 135;
    let gapX = 20;
    let gapY = 15;

    for (let i = 0; i < this.unlockedCards.length; i++) {
      let card = this.unlockedCards[i];

      let col = i % 5;
      let row = Math.floor(i / 5);

      let x = startX + col * (cardW + gapX);
      let y = startY + row * (cardH + gapY);

      ctx.fillStyle = card.type.color;
      ctx.fillRect(x, y, cardW, cardH);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cardW, cardH);

      if (card.image && card.image.complete && card.image.naturalWidth > 0) {
        ctx.drawImage(
          card.image,
          x + 5,
          y + 5,
          cardW - 10,
          70
        );
      } else if (card.sprite) {
        let img = new Image();
        img.src = card.sprite;
        card.image = img;
      }

      ctx.fillStyle = "white";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(card.name, x + cardW / 2, y + 95);

      ctx.font = "11px Arial";
      ctx.fillText(card.effect, x + cardW / 2, y + 115);

      ctx.fillStyle = "black";
      ctx.fillRect(x + cardW - 32, y + cardH - 28, 24, 20);

      ctx.fillStyle = "white";
      ctx.font = "bold 14px Arial";
      ctx.fillText("X", x + cardW - 20, y + cardH - 13);
    }

    ctx.fillStyle = "white";
    ctx.font = "bold 26px Arial";
    ctx.textAlign = "center";
    ctx.fillText("UPGRADES", canvasWidth / 2, 415);

    ctx.font = "20px Arial";
    ctx.fillText("Max HP: " + this.player.maxHP, canvasWidth / 2, 450);
    ctx.fillText("Max Energy: " + this.player.maxEnergy, canvasWidth / 2, 480);

    ctx.fillStyle = this.hasWildcard ? "purple" : "gray";
    ctx.fillRect(300, 500, 200, 45);

    ctx.strokeStyle = "white";
    ctx.strokeRect(300, 500, 200, 45);

    ctx.fillStyle = "white";
    ctx.font = "bold 18px Arial";
    ctx.fillText(this.hasWildcard ? "Wildcard: YES" : "Wildcard: NO", 400, 530);

    ctx.fillStyle = "red";
    ctx.fillRect(20, 520, 130, 50);

    ctx.strokeStyle = "white";
    ctx.strokeRect(20, 520, 130, 50);

    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.fillText("BACK", 85, 552);
  }

  //Draws the actors, messages and UIs of the game
  draw(ctx) {
    if (this.currentScene === SCENES.CARD_REWARD) {
      ctx.fillStyle = "rgba(0,0,0,0.9)";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      ctx.fillStyle = "gold";
      ctx.font = "bold 40px Arial";
      ctx.textAlign = "center";
      ctx.fillText("NEW CARD!", canvasWidth / 2, 80);

      if (
        this.rewardCardImage &&
        this.rewardCardImage.complete &&
        this.rewardCardImage.naturalWidth > 0
      ) {
        ctx.drawImage(this.rewardCardImage, 300, 120, 200, 280);
      } else {
        ctx.fillStyle = "gray";
        ctx.fillRect(300, 120, 200, 280);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("NO SPRITE", 400, 260);
      }

      if (this.rewardCard) {
        ctx.fillStyle = "white";
        ctx.font = "bold 30px Arial";
        ctx.fillText(this.rewardCard.name, canvasWidth / 2, 450);

        ctx.font = "20px Arial";
        ctx.fillText(this.rewardCard.effect, canvasWidth / 2, 490);
      }

      ctx.fillStyle = "yellow";
      ctx.font = "24px Arial";
      ctx.fillText("Click to continue", canvasWidth / 2, 550);
      return;
    }

    if (this.currentScene === SCENES.DECK) {
      this.drawDeckScreen(ctx);
      return;
    }

    if (this.currentScene === SCENES.NEXT_DAY) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      if (
        this.nextDayScreen &&
        this.nextDayScreen.complete &&
        this.nextDayScreen.naturalWidth > 0
      ) {
        ctx.drawImage(this.nextDayScreen, 0, 0, canvasWidth, canvasHeight);
      } else {
        ctx.fillStyle = "white";
        ctx.font = "bold 50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("NEXT DAY", canvasWidth / 2, canvasHeight / 2);
      }
      return;
    }

    if (this.currentScene === SCENES.GAME_OVER) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      if (
        this.gameOverScreen &&
        this.gameOverScreen.complete &&
        this.gameOverScreen.naturalWidth > 0
      ) {
        ctx.drawImage(this.gameOverScreen, 0, 0, canvasWidth, canvasHeight);
      } else {
        ctx.fillStyle = "red";
        ctx.font = "bold 50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2);
      }
      return;
    }

    if (this.currentScene === SCENES.PAUSE) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      if (
        this.pauseScreen &&
        this.pauseScreen.complete &&
        this.pauseScreen.naturalWidth > 0
      ) {
        ctx.drawImage(this.pauseScreen, 0, 0, canvasWidth, canvasHeight);
      } else {
        ctx.fillStyle = "white";
        ctx.font = "bold 50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvasWidth / 2, canvasHeight / 2);
      }
      return;
    }

    if (this.currentScene === SCENES.CREDITS) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      if (
        this.creditsScreen &&
        this.creditsScreen.complete &&
        this.creditsScreen.naturalWidth > 0
      ) {
        ctx.drawImage(this.creditsScreen, 0, 0, canvasWidth, canvasHeight);
      } else {
        ctx.fillStyle = "white";
        ctx.font = "bold 50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("CREDITS", canvasWidth / 2, canvasHeight / 2);
      }
      return;
    }

    if (this.currentScene == SCENES.UPGRADE) {
      if (this.upgradeReturnScene === SCENES.HABITACION) {
        let doors = this.mapHouse.getDoorsFrom(this.currentRoom);
        let directions = doors.map((d) =>
          this.mapHouse.getDirection(this.currentRoom, d),
        );

        let bg = this.backgroundMeca;
        let angle = 0;

        if (directions.length >= 4) {
          bg = this.backgroundBackro;
          angle = 0;
        } else if (directions.length === 3) {
          bg = this.backgroundHabitacion;

          if (!directions.includes("bottom")) {
            angle = 0;
          } else if (!directions.includes("top")) {
            angle = Math.PI;
          } else if (!directions.includes("left")) {
            angle = -Math.PI / 2;
          } else if (!directions.includes("right")) {
            angle = Math.PI / 2;
          }
        }

        ctx.save();
        ctx.translate(canvasWidth / 2, canvasHeight / 2);
        ctx.rotate(angle);
        ctx.drawImage(
          bg,
          -canvasWidth / 2,
          -canvasHeight / 2,
          canvasWidth,
          canvasHeight,
        );
        ctx.restore();

        for (let actor of this.actors) {
          actor.draw(ctx);
        }
      } else {
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);

        if (this.tileVilla.complete) {
          ctx.drawImage(
            this.tileVilla,
            0,
            0,
            this.worldWidth,
            this.worldHeight,
          );
        }

        for (let actor of this.actors) {
          actor.draw(ctx);
        }

        ctx.restore();
      }

      this.drawUpgradeScreen(ctx);
      return;
    }

    if (this.currentScene == SCENES.VILLA) {
      ctx.save();
      ctx.translate(-this.camera.x, -this.camera.y);

      if (this.tileVilla.complete) {
        ctx.drawImage(this.tileVilla, 0, 0, this.worldWidth, this.worldHeight);
      }

      for (let actor of this.actors) {
        actor.draw(ctx);
      }

      ctx.restore();

      if (this.messageTimer > 0) {
        ctx.fillStyle = "black";
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.message, canvasWidth / 2, 80);
      }

      this.drawPauseButton(ctx);
      this.drawDeckButton(ctx);
      this.drawUsername(ctx);
      return;
    }

    if (this.currentScene == SCENES.CASA) {
      ctx.drawImage(this.backgroundCasa, 0, 0, canvasWidth, canvasHeight);
      this.player.draw(ctx);
      this.drawPauseButton(ctx);
      this.drawDeckButton(ctx);
      return;
    }

    if (this.currentScene == SCENES.CASA_LJ) {
      ctx.drawImage(this.backgroundCasa_enemy, 0, 0, canvasWidth, canvasHeight);
      this.player.draw(ctx);
      this.drawPauseButton(ctx);
      this.drawDeckButton(ctx);
      return;
    }

    if (this.currentScene == SCENES.HABITACION) {
      let doors = this.mapHouse.getDoorsFrom(this.currentRoom);
      let directions = doors.map((d) =>
        this.mapHouse.getDirection(this.currentRoom, d),
      );

      let bg = this.backgroundMeca;
      let angle = 0;

      if (directions.length >= 4) {
        bg = this.backgroundBackro;
        angle = 0;
      } else if (directions.length === 3) {
        bg = this.backgroundHabitacion;

        if (!directions.includes("bottom")) {
          angle = 0;
        } else if (!directions.includes("top")) {
          angle = Math.PI;
        } else if (!directions.includes("left")) {
          angle = -Math.PI / 2;
        } else if (!directions.includes("right")) {
          angle = Math.PI / 2;
        }
      }

      ctx.save();
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate(angle);
      ctx.drawImage(
        bg,
        -canvasWidth / 2,
        -canvasHeight / 2,
        canvasWidth,
        canvasHeight,
      );
      ctx.restore();

      for (let actor of this.actors) {
        actor.draw(ctx);
      }

      if (this.messageTimer > 0) {
        ctx.fillStyle = "black";
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.message, canvasWidth / 2, 80);
      }

      this.drawPauseButton(ctx);
      this.drawDeckButton(ctx);
      return;
    }

    if (this.currentScene == SCENES.COMBATE) {
      ctx.fillStyle = "#2b2b2b";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      for (let actor of this.actors) {
        actor.draw(ctx);
      }

      if (this.playerHPBar) this.playerHPBar.draw(ctx);
      if (this.playerEnergyBar) this.playerEnergyBar.draw(ctx);
      if (this.enemyHPBar) this.enemyHPBar.draw(ctx);

      // Render de cartas en combate
        this.drawCombatUI(ctx);
      return;
    }
  }

  drawDeckButton(ctx) {
    if (
      this.currentScene === SCENES.PAUSE ||
      this.currentScene === SCENES.GAME_OVER ||
      this.currentScene === SCENES.CREDITS ||
      this.currentScene === SCENES.NEXT_DAY ||
      this.currentScene === SCENES.CARD_REWARD
    ) {
      return;
    }

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(15, 15, 80, 40);

    ctx.strokeStyle = "white";
    ctx.strokeRect(15, 15, 80, 40);

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("DECK", 55, 40);
  }

  //Render of each card individually
  drawCardItem(ctx, card) {
    let disabledWildcard = card.isWildcard && this.wildcardUsed;

    ctx.fillStyle = disabledWildcard ? "black" : card.color;
ctx.fillStyle = "#222";
ctx.fillRect(card.x, card.y, card.w, card.h);

ctx.strokeStyle = "white";
ctx.lineWidth = 2;
ctx.strokeRect(card.x, card.y, card.w, card.h);

if (card.image && card.image.complete) {
  ctx.drawImage(
    card.image,
    card.x + 5,
    card.y + 5,
    card.w - 10,
    70
  );
}

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 11px Arial";

ctx.font = "bold 11px Arial";
ctx.fillText(card.name, card.x + card.w / 2, card.y + 92);

ctx.font = "9px Arial";
ctx.fillText(card.effect, card.x + card.w / 2, card.y + 108);

    ctx.fillText(card.effect, card.x + card.w / 2, card.y + 78);

    if (disabledWildcard) {
      ctx.fillStyle = "white";
      ctx.font = "bold 22px Arial";
      ctx.textAlign = "center";

      ctx.fillText("USED", card.x + card.w / 2, card.y + card.h / 2 + 10);
    } else {
      ctx.fillStyle = card.isWildcard ? "#cc0000" : "#e6b800";

      ctx.beginPath();

      ctx.arc(card.x + 22, card.y + 105, 14, 0, 2 * Math.PI);

      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "white";
      ctx.font = "bold 10px Arial";

      ctx.fillText(card.cost, card.x + 22, card.y + 109);
    }
  }

  //UI of the combat scene
  drawCombatUI(ctx) {
    this.playerHPBar.draw(ctx);
    this.playerEnergyBar.draw(ctx);
    this.enemyHPBar.draw(ctx);

    for (let card of this.cards) {
      this.drawCardItem(ctx, card);
    }

    if (this.wildcard) {
      this.drawCardItem(ctx, this.wildcard);
    }

    ctx.fillStyle = "black";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    if (this.isPlayerTurn) {
      ctx.fillText("Select a Card", canvasWidth / 2, 420);
    } else {
      ctx.fillText("Enemy turn...", canvasWidth / 2, 420);
    }

    ctx.fillStyle = "black";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.enemy.enemy_name, 635, 55);
  }

  //Controls the turns of the enemy during combat
  enemyTurn() {
    if (this.currentScene !== SCENES.COMBATE) {
      return;
    }

    setTimeout(() => {
      if (this.currentScene !== SCENES.COMBATE) {
        return;
      }

      if (this.enemy.stunnedTurns > 0) {
        this.enemy.stunnedTurns--;
        this.player.evasionChance = 0;
        this.endTurn();
        return;
      }

      let randomRoll = Math.random();

      if (randomRoll < this.player.evasionChance) {
      } else {
        let hpBefore = this.player.hp;
        let damage = this.enemy.randomDamage();
        this.player.hp -= damage;
        let realDamage = Math.max(0, hpBefore - Math.max(this.player.hp, 0));
        if (this.combatStats) {
          this.combatStats.dmg_receive += realDamage;
        }

        this.playerDeath();

        if (this.currentScene === SCENES.GAME_OVER) {
          return;
        }
      }

      this.player.evasionChance = 0;
      this.endTurn();
    }, 2000);
  }

  //Gives the turn back to the player
  endTurn() {
    this.isPlayerTurn = true;
  }

  //Restarts the run in case of player's death
  restartRun() {
    this.saveCombatStatsInDB();
    this.finishRunInDB("Loss");

    this.deleteSave();
    this.day = 1;
    this.run_ID = null;
    this.combat_ID = null;
    this.runFinished = false;
    this.runPromise = this.startRunInDB();

    this.mapHouse.randomMap();
    this.enemyRoomID = this.mapHouse.enemyRoomID;
    this.currentRoom = 3;

    this.enemy.enemyType = this.enemy.getRandomEnemy();
    this.enemy.generateStats(this.day);

    this.player.hp = this.player.maxHP;
    this.player.energy = this.player.maxEnergy;
    this.player.evasionChance = 0;

    this.cards = [];
    this.wildcard = null;
    this.isPlayerTurn = true;

    this.message = "";
    this.messageTimer = 0;

    this.loadScene(SCENES.CASA);

    this.unlockedCards = [];
    this.collectedRoomUpgrades = {};
    this.hasWildcard = false;
    this.wildcardRoom = null;
    this.resetBushCards();
    this.randomEnemyLocation();
  }

  //Detects the death of the player when the HP bar reaches 0 during combat
  playerDeath() {
    if (this.player.hp <= 0) {
      this.player.hp = 0;
      this.saveCombatStatsInDB();
      this.finishRunInDB("Loss");
      this.loadScene(SCENES.GAME_OVER);
    }
  }

  //Controls the collisions of the game and what happens when the player collides with an object in each of the scenes ans states
  update(deltaTime) {
    if (
      this.currentScene === SCENES.GAME_OVER ||
      this.currentScene === SCENES.PAUSE ||
      this.currentScene === SCENES.CREDITS ||
      this.currentScene === SCENES.NEXT_DAY ||
      this.currentScene === SCENES.VICTORY ||
      this.currentScene === SCENES.CARD_REWARD
    ) {
      return;
    }

    this.player.update(deltaTime, ctx.canvas);

    if (this.player.updateCollider) {
      this.player.updateCollider();
    }

    if (this.transitionCooldown > 0) {
      this.transitionCooldown--;
      return;
    }

    switch (this.currentScene) {
      case SCENES.VILLA:
        this.updateCamera();
        for (let bushData of this.bushes) {
          if (boxOverlap(this.player, bushData.bush)) {
            if (!bushData.collected) {
              bushData.collected = true;

              this.player.velocity = new Vector(0, 0);
              if (bushData.hasCard) {
                this.giveRandomCard();
              }
            } else {
              this.player.position = new Vector(
                this.player.position.x - this.player.velocity.x * deltaTime,
                this.player.position.y - this.player.velocity.y * deltaTime,
              );

              this.player.velocity = new Vector(0, 0);
            }

            break;
          }
        }

        if (boxOverlap(this.player, this.casa)) {
          this.player.velocity = new Vector(0, 0);

          this.player.position = new Vector(
            canvasWidth / 2 - this.player.width / 2,
            480,
          );

          this.loadScene(SCENES.CASA);
        } else if (boxOverlap(this.player, this.casa_lj)) {
          this.player.velocity = new Vector(0, 0);

          this.currentRoom = 3;
          this.player.position = new Vector(120, canvasHeight / 2);

          this.loadScene(SCENES.CASA_LJ);
        }

        break;

      case SCENES.CASA:
        if (boxOverlap(this.player, this.salida_casa)) {
          this.player.velocity = new Vector(0, 0);

          this.player.position = new Vector(
            canvasWidth - 200,
            canvasHeight + 600,
          );

          this.loadScene(SCENES.VILLA);
        }

        break;

      case SCENES.CASA_LJ:
        if (
          this.salida_casa_lj.roomID !== undefined &&
          boxOverlap(this.player, this.salida_casa_lj)
        ) {
          this.enterRoom(this.salida_casa_lj.roomID);
        } else if (
          this.room_1.roomID !== undefined &&
          boxOverlap(this.player, this.room_1)
        ) {
          this.enterRoom(this.room_1.roomID);
        } else if (
          this.room_2.roomID !== undefined &&
          boxOverlap(this.player, this.room_2)
        ) {
          this.enterRoom(this.room_2.roomID);
        } else if (
          this.room_3.roomID !== undefined &&
          boxOverlap(this.player, this.room_3)
        ) {
          this.enterRoom(this.room_3.roomID);
        }
        break;

      case SCENES.HABITACION:
        if (
          !this.collectedRoomUpgrades[this.currentRoom] &&
          boxOverlap(this.player, this.roomUpgrade)
        ) {
          this.collectedRoomUpgrades[this.currentRoom] = true;

          if (this.currentRoom === this.wildcardRoom) {
            this.hasWildcard = true;
            this.message = "Wildcard Found!";
            this.messageTimer = 180;
            this.loadScene(SCENES.HABITACION);
            return;
          }

          this.savedPosition = new Vector(
            this.player.position.x,
            this.player.position.y,
          );

          this.upgradeReturnScene = SCENES.HABITACION;
          this.loadScene(SCENES.UPGRADE);

          return;
        }

        if (
          this.salida_casa_lj.roomID !== undefined &&
          boxOverlap(this.player, this.salida_casa_lj)
        ) {
          this.enterRoom(this.salida_casa_lj.roomID);
        } else if (
          this.room_1.roomID !== undefined &&
          boxOverlap(this.player, this.room_1)
        ) {
          this.enterRoom(this.room_1.roomID);
        } else if (
          this.room_2.roomID !== undefined &&
          boxOverlap(this.player, this.room_2)
        ) {
          this.enterRoom(this.room_2.roomID);
        } else if (
          this.room_3.roomID !== undefined &&
          boxOverlap(this.player, this.room_3)
        ) {
          this.enterRoom(this.room_3.roomID);
        }
        break;

      case SCENES.COMBATE:
        if (this.enemy.hp <= 0 && !this.combatFinished) {
          this.combatFinished = true;
          this.enemyDefeated();
        }
        break;
    }
  }
  saveGame() {
    if (!this.player_ID) return;
  const saveData = {
    day: this.day,

    unlockedCards: this.unlockedCards.map(card => card.name),

    maxHP: this.player.maxHP,
    hp: this.player.hp,

    maxEnergy: this.player.maxEnergy,
    energy: this.player.energy,

    hasWildcard: this.hasWildcard,

    collectedRoomUpgrades: this.collectedRoomUpgrades
  };

localStorage.setItem(this.getSaveKey(), JSON.stringify(saveData));
}
loadGame() {

    if (!this.player_ID) return;

  const save = localStorage.getItem(this.getSaveKey());

  if (!save) return;

  const data = JSON.parse(save);

  this.day = data.day || 1;

  this.player.maxHP = data.maxHP || 100;
  this.player.hp = data.hp || this.player.maxHP;

  this.player.maxEnergy = data.maxEnergy || 150;
  this.player.energy = data.energy || this.player.maxEnergy;

  this.hasWildcard = data.hasWildcard || false;

  this.collectedRoomUpgrades =
    data.collectedRoomUpgrades || {};

  this.unlockedCards = [];

  if (data.unlockedCards) {

    for (let cardName of data.unlockedCards) {

      let card = CARD_POOL.find(
        c => c.name === cardName
      );

      if (card) {
        this.unlockedCards.push(card);
      }
    }
  }
}

  resetBushCards() {
    for (let bushData of this.bushes) {
      bushData.hasCard = true;
      bushData.collected = false;
    }
  }

  //Detects if the player selected a card with the CLICK
  combatClick(mouseX, mouseY) {
    if (
      this.currentScene !== SCENES.COMBATE ||
      !this.isPlayerTurn ||
      this.player.hp <= 0
    )
      return;

    for (let i = 0; i < this.cards.length; i++) {
      let card = this.cards[i];
      if (
        mouseX >= card.x &&
        mouseX <= card.x + card.w &&
        mouseY >= card.y &&
        mouseY <= card.y + card.h
      ) {
        this.executeCard(i, false);
        return;
      }
    }

    let wild = this.wildcard;
    if (
      wild &&
      !this.wildcardUsed &&
      this.player.hp > WILDCARD.hpCost &&
      mouseX >= wild.x &&
      mouseX <= wild.x + wild.w &&
      mouseY >= wild.y &&
      mouseY <= wild.y + wild.h
    ) {
      this.executeCard(-1, true);
    }
  }

  playSound(name) {
    if (!this.sounds || !this.sounds[name]) return;

    const sound = this.sounds[name];

    sound.pause();
    sound.currentTime = 0;
    sound.volume = 0.6;

    sound.play().catch((error) => {
      console.log("No se pudo reproducir sonido:", error);
    });
  }

  //Executes the selected card by the player during combat and turn
  executeCard(index, isWildcard) {
    let selectedCard = isWildcard ? this.wildcard : this.cards[index];
    if (!selectedCard) return;

    if (isWildcard) {
      if (this.wildcardUsed) return;
      if (this.player.hp <= WILDCARD.hpCost) return;

      this.wildcardUsed = true;
    } else {
      if (this.player.energy < selectedCard.cost) return;

      this.player.energy -= selectedCard.cost;

      if (this.player.energy <= 20) {
        this.restartRun();
        return;
      }
    }

    let enemyHPBefore = this.enemy.hp;
    let playerHPBefore = this.player.hp;

    selectedCard.action(this.player, this.enemy);

    this.cards_used++;

    if (enemyHPBefore > this.enemy.hp) {
      this.dmg_done += enemyHPBefore - this.enemy.hp;
    }

    if (this.player.hp > playerHPBefore) {
      this.hp_recovered += this.player.hp - playerHPBefore;
    }
    this.playSound("card");

    let damageDone = Math.max(0, enemyHPBefore - Math.max(this.enemy.hp, 0));
    let hpRecovered = Math.max(0, this.player.hp - playerHPBefore);

    if (this.combatStats) {
      this.combatStats.dmg_done += damageDone;
      this.combatStats.hp_recovered += hpRecovered;
      this.combatStats.cards_used += 1;
    }

    this.saveCardUsedInDB(selectedCard.name);

    this.player.energy = Math.min(this.player.energy, this.player.maxEnergy);

    if (!isWildcard) {
      let oldX = selectedCard.x;
      let newCard = this.getRandomCard(oldX);

      if (newCard !== null) {
        this.cards[index] = newCard;
      } else {
        this.cards.splice(index, 1);
      }
    }

    if (this.enemy.hp <= 0) {
      return;
    }

    this.isPlayerTurn = false;
    this.enemyTurn();
  }

  upgradeClick(mouseX, mouseY) {
    if (this.currentScene !== SCENES.UPGRADE) {
      return;
    }

    for (let button of this.upgradeButtons) {
      if (
        mouseX >= button.x &&
        mouseX <= button.x + button.w &&
        mouseY >= button.y &&
        mouseY <= button.y + button.h
      ) {
        button.upgrade.action(this.player);
        this.saveGame();
        this.savePlayerStatsInDB();

        this.message = button.upgrade.name + " Upgrade!";
        this.messageTimer = 120;

        this.loadScene(this.upgradeReturnScene || SCENES.HABITACION);

        if (this.savedPosition) {
          this.player.position = new Vector(
            this.savedPosition.x,
            this.savedPosition.y,
          );
        }

        this.player.velocity = new Vector(0, 0);
        this.player.updateCollider();
        this.updateCamera();

        return;
      }
    }
  }

  screenClick(mouseX, mouseY) {
    if (this.currentScene === SCENES.DECK) {
      let startX = 60;
      let startY = 115;
      let cardW = 130;
      let cardH = 135;
      let gapX = 20;
      let gapY = 15;

      for (let i = 0; i < this.unlockedCards.length; i++) {
        let col = i % 5;
        let row = Math.floor(i / 5);

        let x = startX + col * (cardW + gapX);
        let y = startY + row * (cardH + gapY);

        if (
          mouseX >= x + cardW - 32 &&
          mouseX <= x + cardW - 8 &&
          mouseY >= y + cardH - 28 &&
          mouseY <= y + cardH - 8
        ) {
          this.unlockedCards.splice(i, 1);
          return;
        }
      }

      if (mouseX >= 20 && mouseX <= 150 && mouseY >= 520 && mouseY <= 570) {
        this.loadScene(this.previousScene || SCENES.VILLA);
      }

      return;
    }

    if (
      this.currentScene !== SCENES.PAUSE &&
      this.currentScene !== SCENES.GAME_OVER &&
      this.currentScene !== SCENES.CREDITS &&
      this.currentScene !== SCENES.NEXT_DAY &&
      this.currentScene !== SCENES.VICTORY &&
      this.currentScene !== SCENES.UPGRADE &&
      mouseX >= 15 &&
      mouseX <= 105 &&
      mouseY >= 15 &&
      mouseY <= 55
    ) {
      this.previousScene = this.currentScene;
      this.loadScene(SCENES.DECK);
      return;
    }
    // NEXT DAY: cualquier clic continúa
    if (this.currentScene === SCENES.NEXT_DAY) {
      this.loadScene(SCENES.CASA);
      return;
    }

    // CARD_REWARD: cualquier clic continúa a la villa
    if (this.currentScene === SCENES.CARD_REWARD) {
      this.loadScene(SCENES.VILLA);
      return;
    }

    // Botón de pausa arriba derecha
    if (
      this.currentScene !== SCENES.PAUSE &&
      this.currentScene !== SCENES.GAME_OVER &&
      this.currentScene !== SCENES.CREDITS &&
      this.currentScene !== SCENES.NEXT_DAY &&
      mouseX >= 735 &&
      mouseX <= 785 &&
      mouseY >= 15 &&
      mouseY <= 55
    ) {
      this.previousScene = this.currentScene;
      this.loadScene(SCENES.PAUSE);
      return;
    }
    // CREDITS: RETURN
    if (this.currentScene === SCENES.CREDITS) {
      if (mouseX >= 15 && mouseX <= 200 && mouseY >= 520 && mouseY <= 600) {
        this.loadScene(SCENES.GAME_OVER);
      }
      return;
    }

    // GAME OVER
    if (this.currentScene === SCENES.GAME_OVER) {
      // RETRY
      if (mouseX >= 45 && mouseX <= 400 && mouseY >= 120 && mouseY <= 210) {
        this.restartRun();
        return;
      }

      // CREDITS
      if (mouseX >= 45 && mouseX <= 400 && mouseY >= 230 && mouseY <= 320) {
        this.loadScene(SCENES.CREDITS);
        return;
      }

      // STATS
      if (mouseX >= 45 && mouseX <= 400 && mouseY >= 340 && mouseY <= 430) {
        window.location.href = "../../Web/html/estadisticas.html";
        return;
      }
    }

    // PAUSA
    if (this.currentScene === SCENES.PAUSE) {
      // TURN OFF MUSIC
      if (mouseX >= 210 && mouseX <= 610 && mouseY >= 135 && mouseY <= 215) {
        console.log("Toggle music");
        return;
      }

      // TURN OFF SOUND
      if (mouseX >= 210 && mouseX <= 610 && mouseY >= 255 && mouseY <= 335) {
        console.log("Toggle sound");
        return;
      }

      // RETURN
      if (mouseX >= 210 && mouseX <= 610 && mouseY >= 375 && mouseY <= 455) {
        this.loadScene(this.previousScene || SCENES.CASA);
        return;
      }

      // SAVE AND EXIT
      if (mouseX >= 210 && mouseX <= 610 && mouseY >= 495 && mouseY <= 575) {
        this.saveCombatStatsInDB();
        this.savePlayerStatsInDB();
        this.saveGame();
        window.location.href = "../../Web/html/Run_Menu.html";
        return;
      }
    }
  }

  //The controls of the game for movement, restarting and selecting cards during combat
  createEventListeners() {
    window.addEventListener("keydown", (event) => {
      this.playMusic(this.currentScene);
      if (event.key === "Escape" || event.key.toLowerCase() === "p") {
        if (this.currentScene === SCENES.PAUSE) {
          this.loadScene(this.previousScene || SCENES.CASA);
        } else if (
          this.currentScene !== SCENES.GAME_OVER &&
          this.currentScene !== SCENES.CREDITS &&
          this.currentScene !== SCENES.NEXT_DAY &&
          this.currentScene !== SCENES.VICTORY
        ) {
          this.previousScene = this.currentScene;
          this.loadScene(SCENES.PAUSE);
        }
        return;
      }

      if (this.currentScene === SCENES.GAME_OVER && event.key === " ") {
        this.restartRun();
        return;
      }

      if (this.currentScene === SCENES.COMBATE) return;

      if (event.key in keyDirections) {
        this.addKey(keyDirections[event.key]);
        this.player.startMovement(keyDirections[event.key]);
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.key in keyDirections) {
        this.delKey(keyDirections[event.key]);
        this.player.stopMovement(keyDirections[event.key]);
      }
    });

    window.addEventListener("mousedown", (event) => {
      this.playMusic(this.currentScene);

      const canvas = document.getElementById("canvas");
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mouseX = (event.clientX - rect.left) * scaleX;
      const mouseY = (event.clientY - rect.top) * scaleY;

      this.screenClick(mouseX, mouseY);
      this.combatClick(mouseX, mouseY);
      this.upgradeClick(mouseX, mouseY);
    });
  }
  addKey(direction) {
    if (!this.player.keys.includes(direction)) {
      this.player.keys.push(direction);
    }
  }

  delKey(direction) {
    if (this.player.keys.includes(direction)) {
      this.player.keys.splice(this.player.keys.indexOf(direction), 1);
    }
  }
}

async function main() {
  await loadCardsFromDB();

  const canvas = document.getElementById("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  game = new Game();
  drawScene(0);
}

function drawScene(newTime) {
  if (oldTime == undefined) {
    oldTime = newTime;
  }
  let deltaTime = newTime - oldTime;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  game.update(deltaTime);
  game.draw(ctx);

  oldTime = newTime;
  requestAnimationFrame(drawScene);
}