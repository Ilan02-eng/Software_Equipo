"use strict";

const canvasWidth = 800; //Fixed width of the game canvas in pixels
const canvasHeight = 600; //Fixed height of tne game canvas in pixels

let ctx; //Canvas 2D rendering conext
let game; //Main game object
let oldTime; //Time of previous frame
let playerSpeed = 0.3; //Base movement speed for the player

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

//Array that has the available character upgrades
//and their stat affected
const UPGRADES = [
  {
    name: "+15 HP",
    description: "Increase max life",
    color: "green",
    action: (player) => {
      //Increases max HP by 15
      player.maxHP += 15;
      player.hp = player.maxHP;
    },
  },
  {
    name: "+10 Energy",
    description: "Increase max energy",
    color: "blue",
    action: (player) => {
      //Increases max energy by 10
      player.maxEnergy += 10;
      player.energy = player.maxEnergy;
    },
  },
];

//Types of cards available for constant use
const CARD_TYPES = {
  ATTACK: { color: "red", label: "Attack" },
  DEFENSA: { color: "lightgreen", label: "Defensive" },
  CONTROL: { color: "lightblue", label: "Control" },
};

//API to connect the game to the database
const API_URL = "http://localhost:3000";

//Array of cards empty that updates depending on the cards the player finds
//during a run
let CARD_POOL = [];

//Fetches the card data from the API and populates the CARD_POOL array
async function loadCardsFromDB() {
  //Retrieves the JSON list of cards from the database
  const response = await fetch(`${API_URL}/cards`);
  const dbCards = await response.json();

  //Filters out the wildcards  and formats the remaining cards for use in game
  CARD_POOL = dbCards
    .filter((card) => card.type !== "Wildcard")
    .map((card) => {
      //Loads the visual sprite of each of the cards
      const sprite = `../../VisualsVideogame/Cards/${card.card_ID}.png`;
      const img = new Image();
      img.src = sprite;

      return {
        card_ID: card.card_ID,
        name: card.name,
        sprite: sprite,
        image: img,
        //Maps the database card types to the game
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

//Backup function for cards actions
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

//Back function for wildcard
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

//Helper function to handle API request and error handling
async function apiRequest(path, method = "GET", body = null) {
  //Sets up the request with the HTTP method and JSON
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  //Gives a seriess to the apyload into a JSON string
  if (body !== null) {
    options.body = JSON.stringify(body);
  }

  //Executes the fetch request and parses the JSON
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  //Logs the error in casa of request failed
  if (!response.ok) {
    console.error("API error:", method, path, data);
    throw new Error(data.error || "API request failed");
  }

  return data;
}

//Retrives the currently logged player's information ID from the browser storage
function getLoggedPlayerID() {
  return localStorage.getItem("player_ID");
}

//Maps the keyboard inputs (WASD and arrow keys) for the standard movement directions
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

//Configuration object for the movement physics and animation frames
const playerMotion = {
  //Handles downward movement along with positive Y axis
  down: {
    status: false,
    axis: "y",
    sign: 1,
    repeat: true,
    duration: 100,
    moveFrames: [0, 3],
    idleFrames: [0, 0],
  },
  //Handles upward movement along with negative Y axis
  up: {
    status: false,
    axis: "y",
    sign: -1,
    repeat: true,
    duration: 100,
    moveFrames: [4, 7],
    idleFrames: [4, 4],
  },
  //Handles rightward movement along with positive X axis
  right: {
    status: false,
    axis: "x",
    sign: 1,
    repeat: true,
    duration: 100,
    moveFrames: [8, 11],
    idleFrames: [8, 8],
  },
  //Handles leftward movement along with negative X axis
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

//Class responsible for rendering HP and energy UI bars for the combat state
class combatBars {
  //Initializes the bar's dimensions, target, stat type (HP or Energy) and color
  constructor(position, width, height, target, type, color) {
    this.position = position;
    this.width = width;
    this.height = height;
    this.target = target;
    this.type = type;
    this.barColor = color;
  }

  //Calculates the stat percentage and renders the bar
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

//Controls the player character's movement, stats and collisions
class Player extends GameObject {
  //Initializes player base stats, velocity and visual properties
  constructor(position, width, height, color, sheetCols) {
    super(position, width, height, color, "player", sheetCols);
    this.velocity = new Vector(0, 0);

    this.maxHP = 100;
    this.hp = this.maxHP;
    this.evasionChance = 0; //Stat that allows the player to block an dincoming attack
    this.maxEnergy = 150;
    this.energy = this.maxEnergy;
  }

  //Updates movement per frame
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

  //Prevents the player from movimg outside the map boundaries/limits
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

//Defines the enemy during combat, handles their random generation, stat scaling
//and damage calculation per attack during combat
class Enemy extends GameObject {
  //Initializes the enemy with a random type from a predefined list
  //and generates stats
  constructor(position, width, height, color) {
    super(position, width, height, color);

    this.enemyTypes = [
      {
        //Little Jimmy stats (has more HP and less damage) and sprite
        name: "Little Jimmy",
        hp_min: 100,
        hp_max: 120,
        dmg_min: 9,
        dmg_max: 15,
        sprite: "../assets/sprites/monster_littlejimmy.png",
      },
      {
        //Rotoplas stats (has more damage and less HP) and sprite
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

  //Selects and returns a random enemy type from the pool
  getRandomEnemy() {
    let randomIndex = Math.floor(Math.random() * this.enemyTypes.length);
    return this.enemyTypes[randomIndex];
  }

  //Calculates and assigns maximum HP and damage ranges scaled by enemy's level
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

    this.setSprite(this.enemyType.sprite, new Rect(0, 0, 1000, 1000));
  }

  //returns  a random damage amount based on the nemy's calculating damage ranges
  randomDamage() {
    return this.randomNumber(this.dmg_min, this.dmg_max);
  }

  //Helper function that returns integer value between ranges min and max
  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

///Represents interior map areas, amanaging physics and collisions in it
class Room extends GameObject {
  //Initializes room properties inclidong dimensions and apperance
  constructor(position, width, height, color, sheetCols) {
    super(position, width, height, color, "room", sheetCols);
    this.velocity = new Vector(0, 0);
  }

  //Updates room movement based on delta time and respawns the player and collisions
  update(deltaTime) {
    this.velocity = this.velocity.normalize().times(playerSpeed);
    this.position = this.position.plus(this.velocity.times(deltaTime));
    this.player.updateCollider();
  }
}

//Manages the generation, layout and room conections for the house map
class MapHouse {
  //Defines map and room transitions, coordinate positions and categorization
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

  //Populates the map with fixed rooms assigns a spawn chance to random rooms
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

  //Validates if movement between 2 adjacent active rooms is valid
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

  //Returns array of active adjacent rooms connected to the room ID
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

  //Calculates and returns the cardinaldirection from one rooom to another
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

//Central controller for game logic, managing scenes, actors, state and database interactions
class Game {
  //Initializes game state, database variables, map generation, stats and visual/audio assets
  constructor() {
    this.currentScene = SCENES.CASA;
    this.actors = [];
    this.transitionCooldown = 0;

    this.enemy = null;

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
      villa: new Audio("../assets/audio/villa.wav"), //Music for the outside map (VILLA)
      casa: new Audio("../assets/audio/casa.wav"), //Music for the player's house
      casa_lj: new Audio("../assets/audio/casalj.mp3"), //Music for the enemy house
      habitacion: new Audio("../assets/audio/casa.wav"), //Music for each room
      combate: new Audio("../assets/audio/combate.wav"), //Music for combat state
    };
    this.sounds = {
      card: new Audio("../assets/audio/unacarta.wav"), //Audio when finding a new card
    };

    this.currentMusic = null;
    this.musicEnabled = true;
    this.soundEnabled = true;

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
    this.justExitedCasaLJ = false;

    this.wildcardType = null;
  }

  //Initializes a new game run in the databse for the logged player and generates the run ID
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

  //Ensures a valid run ID exists, waiting pending initialization or creating a new run if needed
  async ensureRunInDB() {
    if (this.run_ID) return this.run_ID;
    if (this.runPromise) await this.runPromise;
    if (this.run_ID) return this.run_ID;
    return await this.startRunInDB();
  }

  //Creates a new combat record in the database for the current run and enemy
  //returns the combat ID
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

  //Renders a UI displayimg the username on the canvas
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

  //Deletes current player's save data from the browser's storage
  deleteSave() {
    if (!this.player_ID) return;
    localStorage.removeItem(this.getSaveKey());
  }

  //Generates a unique storage key used to save and load current player's data
  getSaveKey() {
    return "catharsisSave_" + this.player_ID;
  }

  //Resets the tarcking metrics for the current combat to 0
  resetCombatStats() {
    this.combatStats = {
      dmg_done: 0,
      dmg_receive: 0,
      hp_recovered: 0,
      cards_used: 0,
    };
  }

  //Sends and saves the tracked statistics for the current combat to the database
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

  //logs a played card to the database with the current run and combat
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

  //Updates the current player's HP and energy stats in the database
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

  //Marks the run as finished, saves and updates final player statistics to the database with the run's result
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

  //Configures all game entities (player, enemies, houses, rooms, bushes)
  initObjects() {
    //Creates main character , sets initial stats, assigns spites and defines movement
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

    //Creates and sets up the main game strcutures (character's house and enemy house)
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

    //Defines the trigger and collision areas used for scene stransitions
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

    //Defines room limits
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

    //Creates the enemy entity and it's sprite
    this.enemy = new Enemy(
      new Vector(canvasWidth - 170, 195),
      200,
      200,
      "orange",
    );

    //Creates treasure chest objects inside the rooms to find upgrades or wildcards and it's sprite
    this.roomUpgrade = new GameObject(new Vector(350, 250), 90, 90, "yellow");

    this.roomUpgrade.setSprite(
      "../assets/sprites/chest.png",
      new Rect(-180, -200, 1064, 1064),
    );
    this.roomUpgrade.setCollider(70, 60);

    //Generates the bushes accross the exterior map, ensuring no overlap with houses and card drops
    this.bushes = [];

    const bushSprites = [
      { src: "../assets/sprites/bush.png", rect: new Rect(-20, 0, 500, 350) },
      { src: "../assets/sprites/bush2.png", rect: new Rect(-5, 0, 500, 350) },
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
        hasCard: Math.random() < 0.4,
        collected: false,
      });
    }
    //Loads allrequired sprites for backgrounds and screens of the game
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

    this.backgroundCombat = new Image();
    this.backgroundCombat.src = "../assets/sprites/battle_room.png";

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

    this.hpUpgradeImg = new Image();
    this.hpUpgradeImg.src = "../../VisualsVideogame/Cards/17.png";

    this.energyUpgradeImg = new Image();
    this.energyUpgradeImg.src = "../../VisualsVideogame/Cards/16.png";

    //Creates the wildcards and assigns the sprite of each one
    this.wildcardImages = {
      1: new Image(),
      2: new Image(),
      3: new Image(),
    };

    this.wildcardImages[1].src = "../../VisualsVideogame/Cards/13.png";
    this.wildcardImages[2].src = "../../VisualsVideogame/Cards/14.png";
    this.wildcardImages[3].src = "../../VisualsVideogame/Cards/15.png";
  }

  //handles the audio playback logic, ensurin only one track is playing at a time
  //Sets the music for each scene transition
  playMusic(name) {
    if (!this.musicEnabled) return;
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

  //Updates the camera postions to follow the player within the map
  updateCamera() {
    this.camera.x = this.player.position.x - canvasWidth / 2;
    this.camera.y = this.player.position.y - canvasHeight / 2;

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

  //Manages the logic miving between rooms and triggering transitions
  enterRoom(roomID) {
    //Checks if the movement to the target room is allowed based on the house map configuration
    if (!this.mapHouse.canPass(this.currentRoom, roomID)) {
      return;
    }

    let previousRoom = this.currentRoom;

    //Handles specific logic for exiting the house
    if (roomID === 9) {
      this.currentRoom = 3;
      this.player.velocity = new Vector(0, 0);

      this.loadScene(SCENES.VILLA);

      this.player.position = new Vector(1850, 1550);

      this.player.updateCollider();
      this.updateCamera();

      this.justExitedCasaLJ = true;
      this.transitionCooldown = 60;

      return;
    }

    //Updates room state and repostions the player based on the entry door
    this.currentRoom = roomID;
    this.player.velocity = new Vector(0, 0);
    this.setPlayerPositionFromDoor(previousRoom, roomID);

    //Transitions to combat or interior room scenes based on the room ID
    if (roomID === this.enemyRoomID) {
      this.loadScene(SCENES.COMBATE);
      return;
    }
    this.loadScene(SCENES.HABITACION);
  }

  //Maps a navigation direction to its corresponding room or exit
  getDoorByDirection(direction) {
    if (direction === "top") return this.room_1;
    if (direction === "bottom") return this.room_2;
    if (direction === "left") return this.salida_casa_lj;
    if (direction === "right") return this.room_3;
    return null;
  }

  //selects a random card from the available pool and triggers the rewards scene
  giveRandomCard() {
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
    this.loadScene(SCENES.CARD_REWARD);
  }

  //Configures exit doors for the current room based on the map generation
  loadHouseDoors() {
    let doors = this.mapHouse.getDoorsFrom(this.currentRoom);

    //Reset current room's exit trggers
    this.room_1.roomID = undefined;
    this.room_2.roomID = undefined;
    this.room_3.roomID = undefined;
    this.salida_casa_lj.roomID = undefined;
    this.actors = [this.player];

    //Assign new room IDs to active doors and adds them into the actors list interactions
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

  //Sets the player's entry position and oriantation based on the direction they entered the new room
  setPlayerPositionFromDoor(fromRoom, toRoom) {
    let direction = this.mapHouse.getDirection(fromRoom, toRoom);
    let faceDirection = "down";

    //Calculates entry point based on the direction of the door
    if (direction === "top") {
      this.player.position = new Vector(canvasWidth / 2, canvasHeight - 140);
      faceDirection = "up";
    } else if (direction === "bottom") {
      this.player.position = new Vector(canvasWidth / 2, 100);
      faceDirection = "down";
    } else if (direction === "left") {
      this.player.position = new Vector(canvasWidth - 170, canvasHeight / 2);
      faceDirection = "left";
    } else if (direction === "right") {
      this.player.position = new Vector(120, canvasHeight / 2);
      faceDirection = "right";
    }

    //Stops the player movement
    this.player.velocity = new Vector(0, 0);
    this.player.keys = [];

    //Sets animation ,atching entry direction
    if (this.player.motion && this.player.motion[faceDirection]) {
      this.player.currentFrame =
        this.player.motion[faceDirection].idleFrames[0];
      this.player.currentAnimation = faceDirection;
    }

    //Collision box for the new position
    this.player.updateCollider();
  }

  //Saves and posts the current cpmbat stats to the database
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

  //Generates a random (non-duplicate) card from the available pool of card of the run
  getRandomCard(posX) {
    //Ensure there are available cards
    if (this.unlockedCards.length === 0) {
      return null;
    }

    //Filter to prevent drawing cards thata are already in the current combat hand
    let cardsInCombat = this.cards.map((card) => card.name);
    let availableCards = this.unlockedCards.filter(
      (card) => !cardsInCombat.includes(card.name),
    );

    if (availableCards.length === 0) {
      return null;
    }

    //Selects a random card and puts it the specific UI positioning and properties (and spite)
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

  //Generates and gives the format to the wildcard object with its fixed UI and sprite
  getWildcard() {
    //Fixed positioning and dimensions for the wildcard slot of the UI
    return {
      x: 650,
      y: 460,
      w: 110,
      h: 130,

      //Properties inherited from the wildcard contant
      name: WILDCARD.name,
      color: WILDCARD.color,
      cost: WILDCARD.cost,
      effect: WILDCARD.effect,
      action: WILDCARD.action,

      //Assigns the specific visual based on the current wildcard
      image: this.wildcardImages[this.wildcardType],

      isWildcard: true,
    };
  }

  //Handles post-combat logic upon defeating an enemy, managing victory conditions
  //or advancing to the next day/level
  enemyDefeated() {
    //Log the results of the recent combat and update player stats in the database
    this.saveCombatStatsInDB();
    this.savePlayerStatsInDB();

    //If the max day is reached, registers the win and has a transition to the victory screen
    if (this.day >= this.maxDay) {
      this.finishRunInDB("Win");
      this.loadScene(SCENES.VICTORY);
      return;
    }

    //Advences to the next day and resets the map for the bushes rewards
    this.day++;
    this.saveGame();
    this.resetBushCards();

    //Relocates the enemy to a new room and increases it's stats for the new level difficulty
    this.randomEnemyLocation();
    this.enemy.enemyType = this.enemy.getRandomEnemy();
    this.enemy.generateStats(this.day);

    //Shows the next day screen
    this.loadScene(SCENES.NEXT_DAY);
  }

  //Initializes a new combat encounter by ressetting stats and setting up UI elemnts for the combat
  combatHand() {
    //Clears previus combat data, restores stats and effects and logs to the database
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

    //Creates the player´s hand with up to 4 cards
    for (let i = 0; i < 4; i++) {
      let posX = 40 + i * 140;
      let card = this.getRandomCard(posX);

      if (card !== null) {
        this.cards.push(card);
      }
    }

    //Conditionally loads the wildcard into the hand if the players has found it
    this.wildcard = this.hasWildcard ? this.getWildcard() : null;

    //Generates the visual HP and energy bars for both player and enemy
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

  //Handles the transition logic between different game scenes, updating actors, music and player state
  loadScene(scene) {
    //Updates the current scene state and triggers music, makes the transition and stops the player movement
    this.currentScene = scene;
    this.playMusic(this.currentScene);
    this.transitionCooldown = 30;

    if (this.player) {
      this.player.velocity = new Vector(0, 0);
      this.player.keys = [];
    }

    //Configures the enviroment and active actors based on the scene
    switch (scene) {
      case SCENES.VILLA:
        //Exterior map: loads player, houses and bushes
        this.player.velocity = new Vector(0, 0);
        this.actors = [this.player, this.casa, this.casa_lj];

        for (let bushData of this.bushes) {
          this.actors.push(bushData.bush);
        }
        break;

      case SCENES.CASA:
        //Player's house: centers the player near the entrance
        this.player.velocity = new Vector(0, 0);

        this.player.position = new Vector(canvasWidth / 2, canvasHeight - 120);

        this.actors = [this.player];
        break;

      case SCENES.CASA_LJ:
        //Enemy house: Generates the doors
        this.player.velocity = new Vector(0, 0);
        this.loadHouseDoors();
        this.hiddenDoors = this.actors.filter((a) => a !== this.player);
        this.actors = [this.player];
        break;

      case SCENES.HABITACION:
        //Standar room: loads doors and spawns the upgrade chests
        this.player.velocity = new Vector(0, 0);
        this.loadHouseDoors();
        if (!this.collectedRoomUpgrades[this.currentRoom]) {
          this.actors.push(this.roomUpgrade);
        }
        break;

      case SCENES.COMBATE:
        //Combat: repositions the player and starts the combat state
        this.actors = [this.player, this.enemy];
        this.player.position = new Vector(150, canvasHeight * 0.3);
        this.combatHand();
        break;

      case SCENES.CARD_REWARD:
        //Reward card: displays the UI of the card the players has found
        this.player.velocity = new Vector(0, 0);
        this.actors = [];
        break;

      case SCENES.UPGRADE:
        //Upgrade slection: defines the UI buttons for the upgrades.
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
            h: 260,
            upgrade: UPGRADES[0],
          },
          {
            x: 410,
            y: 260,
            w: 230,
            h: 260,
            upgrade: UPGRADES[1],
          },
        ];
        break;
    }
  }

  //Renders the upgrade UI with information of each upgrade and their sprites
  drawUpgradeScreen(ctx) {
    ctx.fillStyle = "rgba(80, 80, 80, 0.65)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "white";
    ctx.font = "bold 38px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Choose an Upgrade", canvasWidth / 2, 150);

    //Iterates the upgrade options to draw their graphics and labels
    for (let button of this.upgradeButtons) {
      let upgrade = button.upgrade;

      //Determines which sprite to display based on the upgrade type
      let sprite =
        upgrade.name === "+15 HP" ? this.hpUpgradeImg : this.energyUpgradeImg;

      //Renders the sprite and the description below it
      if (sprite && sprite.complete) {
        ctx.drawImage(sprite, button.x + 15, button.y, 200, 200);
      }
      ctx.fillStyle = "white";
      ctx.textAlign = "center";

      ctx.font = "bold 30px Arial";

      if (upgrade.name === "+15 HP") {
        ctx.fillText("+15 Max HP", button.x + button.w / 2, button.y + 225);
      } else {
        ctx.fillText("+10 Max Energy", button.x + button.w / 2, button.y + 225);
      }
    }
  }

  //Renders the pause button UIand initializes the screen
  drawPauseButton(ctx) {
    //Prevents the button from being drawn durin non-interactive screens
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

  //Renders the deck managment screen, displaying the player's found cards and stats
  drawDeckScreen(ctx) {
    //Sets up the main UIand displays the card inventory count
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

    //Iterates over unlocked cardsto drw them in a 5 column layout
    //Generates an "X" button so the player can delete a card if they want to from their inventory
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

      ctx.fillStyle = "#222";
      ctx.fillRect(x, y, cardW, cardH);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cardW, cardH);

      if (card.image && card.image.complete && card.image.naturalWidth > 0) {
        ctx.drawImage(card.image, x + 3, y + 3, cardW - 6, cardH - 6);
      } else if (card.sprite) {
        let img = new Image();
        img.src = card.sprite;
        card.image = img;
      }

      const bx = x + cardW - 30;
      const by = y + cardH - 30;

      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(bx, by, 24, 24);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, 24, 24);

      ctx.fillStyle = "white";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("X", bx + 12, by + 17);
    }

    //Shows the player's current HP and energy, and if they have unlocked the wildcard
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

  //Acts as the main function that draw calls for background, actors, UI and screens
  draw(ctx) {
    //Draws the reward card screen highlighting the newly acquired card and its effects
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

    //Draws the deck screen that shows the acquired cards of the player and their stats
    if (this.currentScene === SCENES.DECK) {
      this.drawDeckScreen(ctx);
      return;
    }

    //Draws the screen that indicates the player that they have passed to the next day/level
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

    //Draws the game over screen for when the player has lost the combat encounter
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

    //Draws the pause screen for the player to stop the game for a moment
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

    //Draws the screen scree that shows the names of the team members and inspirations for the game
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

    //Draws the upgrade screen where the player can choose which upgrade they want to choose
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

    //Applies the camera  translations to handle scrolling, renders the actors and UI buttons
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

      this.drawPauseButton(ctx);
      this.drawDeckButton(ctx);
      this.drawUsername(ctx);
      return;
    }

    //Draws the background along with the players as an actor and UI
    if (this.currentScene == SCENES.CASA) {
      ctx.drawImage(this.backgroundCasa, 0, 0, canvasWidth, canvasHeight);
      this.player.draw(ctx);
      this.drawPauseButton(ctx);
      this.drawDeckButton(ctx);
      return;
    }

    //Draws the background along with the players as an actor and UI
    if (this.currentScene == SCENES.CASA_LJ) {
      ctx.drawImage(this.backgroundCasa_enemy, 0, 0, canvasWidth, canvasHeight);
      this.player.draw(ctx);
      this.drawPauseButton(ctx);
      this.drawDeckButton(ctx);
      return;
    }

    //Calculates the door layout to select the proper backgound image, then draws the actors
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

    //Renders the combat backgound, entities, combat UI and the card hand of the player
    if (this.currentScene == SCENES.COMBATE) {
      if (this.backgroundCombat && this.backgroundCombat.complete) {
        ctx.drawImage(this.backgroundCombat, 0, 0, canvasWidth, canvasHeight);
      } else {
        ctx.fillStyle = "#2b2b2b";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

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

  //Renders the deck acces button
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

  //Renders an individual card within the UI, handling its visual state and asset sprite
  drawCardItem(ctx, card) {
    //Checks if the card is a used wildcard to change its apperance
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
        card.h - 10,
      );
    }
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

  //Renders the interactive UI elements specific for the combat state
  drawCombatUI(ctx) {
    //Renders HP and energy progress bars for both player and enemy
    this.playerHPBar.draw(ctx);
    this.playerEnergyBar.draw(ctx);
    this.enemyHPBar.draw(ctx);

    //Iterates the active deck to draw the cards, and adds the wildcard if it's available
    for (let card of this.cards) {
      this.drawCardItem(ctx, card);
    }
    if (this.wildcard) {
      this.drawCardItem(ctx, this.wildcard);
    }

    //Combat messages and enemy name
    ctx.fillStyle = "white";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    if (this.isPlayerTurn) {
      ctx.fillText("Select a Card", canvasWidth / 2, 420);
    } else {
      ctx.fillText("Enemy turn...", canvasWidth / 2, 420);
    }

    ctx.fillStyle = "white";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.enemy.enemy_name, 635, 55);
  }

  //Executes the enemy's turn logic with an artificial delay, handling status effects and turn transitions
  enemyTurn() {
    //Makes sure the game is still in combat screen before scheduling a turn
    if (this.currentScene !== SCENES.COMBATE) {
      return;
    }
    //Introduces a 2 seconds delay to give a sense of time pace during the combat
    setTimeout(() => {
      //Revalidates that the state in casa de scene changed during the timeoit
      if (this.currentScene !== SCENES.COMBATE) {
        return;
      }
      //Checks if the nemy has any status effects of control, if so the effect counter is decrease and skip the attack
      if (this.enemy.stunnedTurns > 0) {
        this.enemy.stunnedTurns--;
        this.player.evasionChance = 0;
        this.endTurn();
        return;
      }
      //Determines if the attack hits
      let randomRoll = Math.random();
      //If the player has an evsaion effect they succesfully take 0 damage
      if (randomRoll < this.player.evasionChance) {
      } else {
        //If they don't have an evasion effect calculates damage and is applied to the players HP and statistics
        let hpBefore = this.player.hp;
        let damage = this.enemy.randomDamage();
        this.player.hp -= damage;
        let realDamage = Math.max(0, hpBefore - Math.max(this.player.hp, 0));
        if (this.combatStats) {
          this.combatStats.dmg_receive += realDamage;
        }
        //Determines if the damage was enough to kill the player to transition to the game over screen
        this.playerDeath();

        if (this.currentScene === SCENES.GAME_OVER) {
          return;
        }
      }
      //Resets the players effects (evasion) and pass control back to the player
      this.player.evasionChance = 0;
      this.endTurn();
    }, 2000);
  }

  //Gives the turn back to the player after the enemy turn
  endTurn() {
    this.isPlayerTurn = true;
  }

  //Handles the restart of the game after a player's death, logging the loss and starting a new run
  restartRun() {
    //Finalizes the current combat and registers a Loss in the database
    this.saveCombatStatsInDB();
    this.finishRunInDB("Loss");
    //Resets the day counter and beging a new run tracking session in the database
    this.day = 1;
    this.run_ID = null;
    this.combat_ID = null;
    this.runFinished = false;
    this.runPromise = this.startRunInDB();
    //Rabdomizes the house layout again and slects a new enemy with day 1 stats
    this.mapHouse.randomMap();
    this.enemyRoomID = this.mapHouse.enemyRoomID;
    this.currentRoom = 3;
    this.enemy.enemyType = this.enemy.getRandomEnemy();
    this.enemy.generateStats(this.day);
    //Restores the player
    this.player.hp = this.player.maxHP;
    this.player.energy = this.player.maxEnergy;
    this.player.evasionChance = 0;

    this.cards = [];
    this.wildcard = null;
    this.isPlayerTurn = true;

    this.message = "";
    this.messageTimer = 0;
    //Loads the initial spawn scene
    this.loadScene(SCENES.CASA);
    //Reverts the deck to starter cards only, removes the collected upgrades and resets the stats
    this.unlockedCards = this.unlockedCards.slice(0, 2);
    this.collectedRoomUpgrades = {};
    this.hasWildcard = false;

    this.player.maxHP = 100;
    this.player.hp = 100;
    this.player.maxEnergy = 150;
    this.player.energy = 150;

    this.saveGame();

    this.wildcardRoom = null;
    this.resetBushCards();
    this.randomEnemyLocation();
  }

  //Evaluates if the player's HP has been depleted triggering the game over sequence
  playerDeath() {
    //Verifies if the HP has dorpped to 0 or below
    if (this.player.hp <= 0) {
      this.player.hp = 0;
      //Commits the final combat statistics and registers the overall run as a Loss
      this.saveCombatStatsInDB();
      this.finishRunInDB("Loss");
      //Loads the game over screen
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
        }
        if (this.justExitedCasaLJ) {
          if (!boxOverlap(this.player, this.casa_lj)) {
            this.justExitedCasaLJ = false;
          }
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
            this.wildcardType = Math.floor(Math.random() * 3) + 1;
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

  //Stores the current game progression and player stats into local storage for the session persistence
  saveGame() {
    //Ensures the valid player session exists before attempting to save
    if (!this.player_ID) return;
    //Extracts the essential run data
    const saveData = {
      day: this.day,

      unlockedCards: this.unlockedCards.map((card) => card.name),

      maxHP: this.player.maxHP,
      hp: this.player.hp,

      maxEnergy: this.player.maxEnergy,
      energy: this.player.energy,

      hasWildcard: this.hasWildcard,

      collectedRoomUpgrades: this.collectedRoomUpgrades,
      wildcardType: this.wildcardType,
    };
    //Converts the payload to a JSON string and saves it to the browser using a generated key
    localStorage.setItem(this.getSaveKey(), JSON.stringify(saveData));
  }

  //Retrives and restores a previosly saved game state from the local storage
  loadGame() {
    //Aborts if no player session exists and attempts to fetch the save payload if no data is found
    if (!this.player_ID) return;

    const save = localStorage.getItem(this.getSaveKey());

    if (!save) return;

    const data = JSON.parse(save);
    //Reassigns core progression and player attributes and cards
    this.day = data.day || 1;

    this.player.maxHP = data.maxHP || 100;
    this.player.hp = data.hp || this.player.maxHP;

    this.player.maxEnergy = data.maxEnergy || 150;
    this.player.energy = data.energy || this.player.maxEnergy;

    this.hasWildcard = data.hasWildcard || false;

    this.collectedRoomUpgrades = data.collectedRoomUpgrades || {};

    this.unlockedCards = [];

    this.wildcardType = data.wildcardType || null;

    if (data.unlockedCards) {
      for (let cardName of data.unlockedCards) {
        let card = CARD_POOL.find((c) => c.name === cardName);

        if (card) {
          this.unlockedCards.push(card);
        }
      }
    }
  }

  //Iterates through the map the interactable bushes to randomize their cards and interactions for a new day
  resetBushCards() {
    //Loops through all bushes reseting their collected flagso the can be interacted with again
    for (let bushData of this.bushes) {
      bushData.hasCard = Math.random() < 0.4;
      bushData.collected = false;
    }
  }

  //Processes mouse clicks during the combat scene to detect card selections
  combatClick(mouseX, mouseY) {
    //Ignores inputs if the game is not in active combat or if the enemy is attacking
    if (
      this.currentScene !== SCENES.COMBATE ||
      !this.isPlayerTurn ||
      this.player.hp <= 0
    )
      return;
    //Iterates over the player's active hand, checking if the mouse coordinates with the card's box
    //and executes the selected card
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
    //Separetly evaluates the wildcard ensuring it exists and hasn't been used
    //Validates if the player meets the HP cost
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

  //Handles the playback of specific sound effects
  playSound(name) {
    //Verifies that audio is globally enabled and that the requested audio asset exits
    if (!this.soundEnabled) return;
    if (!this.sounds || !this.sounds[name]) return;

    const sound = this.sounds[name];
    //Pauses and rewinds the tarck to the beginning like a loop
    sound.pause();
    sound.currentTime = 0;
    sound.volume = 0.6;

    sound.play().catch((error) => {
      console.log("No se pudo reproducir sonido:", error);
    });
  }

  //Processes the logic for a player playing card, handling costs, card effects, tracking statistics and advancing turn
  executeCard(index, isWildcard) {
    //Identifies the card being played and verifies the player can afford its cost
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
    //Triggers the card effects related to Hp values
    let enemyHPBefore = this.enemy.hp;
    let playerHPBefore = this.player.hp;

    selectedCard.action(this.player, this.enemy);
    //Calculates the damage dealt or HP recovered and plays the card sound effect
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
    //Ensures palyer's energy doesn't exceed maximums
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
    //Checks if the enemy was defeated by the attack to stop any actions, otherwise gives the turn to the enemy
    if (this.enemy.hp <= 0) {
      return;
    }

    this.isPlayerTurn = false;
    this.enemyTurn();
  }

  //Processes player inpit on the upgrade screen, applying the selected upgrade
  upgradeClick(mouseX, mouseY) {
    //Ensures click events are only processed if the active screen sis Upgrade
    if (this.currentScene !== SCENES.UPGRADE) {
      return;
    }
    //Evaluates the mouse coordinates with the bounding boxes of the upgrade options
    for (let button of this.upgradeButtons) {
      if (
        mouseX >= button.x &&
        mouseX <= button.x + button.w &&
        mouseY >= button.y &&
        mouseY <= button.y + button.h
      ) {
        //Applies the specific upgrade effect and saves it locally and to the database
        button.upgrade.action(this.player);
        this.saveGame();
        this.savePlayerStatsInDB();
        //Transitions back to the scene from which the upgrade was found
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

  //Handles click acts triggering intercations and scene transitions on the current active state
  screenClick(mouseX, mouseY) {
    //handles clicking the X buttonto remove a card or the back button to the previous scene
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
        const scene = this.previousScene || SCENES.VILLA;
        this.loadScene(scene);

        if (scene === SCENES.VILLA) {
          this.player.position = this.savedDeckPosition || this.player.position;
          this.updateCamera();
        }

        return;
      }

      return;
    }

    //Detects clicks on thepersistent UI durin active gamplay saving the player's position before opening the menu
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
      this.savedDeckPosition = new Vector(
        this.player.position.x,
        this.player.position.y,
      );
      this.loadScene(SCENES.DECK);
      return;
    }
    if (this.currentScene === SCENES.NEXT_DAY) {
      this.loadScene(SCENES.CASA);
      return;
    }
    //Detects clicks on the active new card screen
    if (this.currentScene === SCENES.CARD_REWARD) {
      this.loadScene(SCENES.VILLA);
      return;
    }
    //Detects clickson the persistent UI element during gameplay
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
    //Handles the navigation back to the game over screen
    if (this.currentScene === SCENES.CREDITS) {
      if (mouseX >= 15 && mouseX <= 200 && mouseY >= 520 && mouseY <= 600) {
        this.loadScene(SCENES.GAME_OVER);
      }
      return;
    }
    //Routes clicks to the corresponding menu (Restart, Credits or Web page of stats)
    if (this.currentScene === SCENES.GAME_OVER) {
      if (mouseX >= 45 && mouseX <= 400 && mouseY >= 120 && mouseY <= 210) {
        this.restartRun();
        return;
      }

      if (mouseX >= 45 && mouseX <= 400 && mouseY >= 230 && mouseY <= 320) {
        this.loadScene(SCENES.CREDITS);
        return;
      }

      if (mouseX >= 45 && mouseX <= 400 && mouseY >= 340 && mouseY <= 430) {
        window.location.href = "../../Web/html/estadisticas.html";
        return;
      }
    }
    //Manages the game's audio toggle, resuming the game and returning to the main menu
    if (this.currentScene === SCENES.PAUSE) {
      if (mouseX >= 210 && mouseX <= 610 && mouseY >= 135 && mouseY <= 215) {
        this.musicEnabled = !this.musicEnabled;

        if (!this.musicEnabled) {
          Object.values(this.music).forEach((song) => {
            song.pause();
          });
        } else {
          this.playMusic(this.previousScene || this.currentScene);
        }

        return;
      }

      if (mouseX >= 210 && mouseX <= 610 && mouseY >= 135 && mouseY <= 215) {
        this.musicEnabled = !this.musicEnabled;

        if (!this.musicEnabled) {
          Object.values(this.music).forEach((song) => {
            song.pause();
          });
        } else {
          this.playMusic(this.previousScene || this.currentScene);
        }

        return;
      }
      //resumes game
      if (mouseX >= 210 && mouseX <= 610 && mouseY >= 375 && mouseY <= 455) {
        this.loadScene(this.previousScene || SCENES.CASA);
        return;
      }
      //Save and exit
      if (mouseX >= 210 && mouseX <= 610 && mouseY >= 495 && mouseY <= 575) {
        this.saveCombatStatsInDB();
        this.savePlayerStatsInDB();
        this.saveGame();
        window.location.href = "../../Web/html/Run_Menu.html";
        return;
      }
    }
  }

  //Initializes global event listenrs to capture player inputs via keyboard and mouse
  //Assings the proper game actions to each event listener like movement or clicks
  createEventListeners() {
    //Handles UI state toggles and player movement
    window.addEventListener("keydown", (event) => {
      //Unlocks browser audio context upon first user intecation
      this.playMusic(this.currentScene);
      //Pause menu toggle, escape or p to pause/resume the game
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
    //Captures the key releases to halt player momentum in the corresponding direction
    window.addEventListener("keyup", (event) => {
      if (event.key in keyDirections) {
        this.delKey(keyDirections[event.key]);
        this.player.stopMovement(keyDirections[event.key]);
      }
    });
    //calculates relative clicks
    window.addEventListener("mousedown", (event) => {
      this.playMusic(this.currentScene);

      const canvas = document.getElementById("canvas");
      if (!canvas) return;
      //Transforms raw browser coordinates into accurate canvas coordinates
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
  //Registers an active directional input to the player's movemt array
  addKey(direction) {
    if (!this.player.keys.includes(direction)) {
      this.player.keys.push(direction);
    }
  }
  //Removes an active directional input to the player's movemt array
  delKey(direction) {
    if (this.player.keys.includes(direction)) {
      this.player.keys.splice(this.player.keys.indexOf(direction), 1);
    }
  }
}

//Core initialization of the game
async function main() {
  //Halts any initialization until the card pool is succesfully retrieve from the database
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