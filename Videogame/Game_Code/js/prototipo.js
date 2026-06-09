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
const CARD_POOL = [
  {
    name: "Sharp Claw",
    type: CARD_TYPES.ATTACK,
    cost: 0,
    effect: "Damage the enemy for 15 HP",
    action: (p, e) => {
      e.hp -= 15;
    },
  },
  {
    name: "Shadow Pounce",
    type: CARD_TYPES.ATTACK,
    cost: 15,
    effect: "Damage the enemy for 25 HP",
    action: (p, e) => {
      e.hp -= 25;
    },
  },
  {
    name: "Purr Attack",
    type: CARD_TYPES.ATTACK,
    cost: 25,
    effect: "Damage the enemy for 35 HP",
    action: (p, e) => {
      e.hp -= 35;
    },
  },

  {
    name: "Tuna Can",
    type: CARD_TYPES.DEFENSA,
    cost: 0,
    effect: "Heals you for 15 HP",
    action: (p, e) => {
      p.hp = Math.min(p.maxHP, p.hp + 15);
    },
  },
  {
    name: "Nine Lives",
    type: CARD_TYPES.DEFENSA,
    cost: 35,
    effect: "Evade the next enemy attack",
    action: (p, e) => {
      p.evasionChance += 1.0;
    },
  },

  {
    name: "Cat Reflexes",
    type: CARD_TYPES.CONTROL,
    cost: 30,
    effect: "Enemy Stun 1 Turn",
    action: (p, e) => {
      e.stunnedTurns += 1;
    },
  },
  {
    name: "Laser Pointer",
    type: CARD_TYPES.CONTROL,
    cost: 40,
    effect: "Enemy Stun 2 Turns",
    action: (p, e) => {
      e.stunnedTurns += 2;
    },
  },
];

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


const keyDirections = {
    w: 'up',
    a: 'left',
    s: 'down',
    d: 'right',
    ArrowUp: 'up',
    ArrowLeft: 'left',
    ArrowDown: 'down',
    ArrowRight: 'right',
};

// Data structure with the directions a character can move, the direction sign and the related animation.
const playerMotion = {
    down:  { status:false, axis:"y", sign: 1, repeat:true, duration:100, moveFrames:[0,3],  idleFrames:[0,0]  },
    up:    { status:false, axis:"y", sign:-1, repeat:true, duration:100, moveFrames:[4,7],  idleFrames:[4,4]  },
    right: { status:false, axis:"x", sign: 1, repeat:true, duration:100, moveFrames:[8,11], idleFrames:[8,8]  },
    left:  { status:false, axis:"x", sign:-1, repeat:true, duration:100, moveFrames:[12,15],idleFrames:[12,12]},
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
      (game.currentScene === SCENES.COMBATE || game.currentScene === SCENES.UPGRADE)
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
        hp_max: 140,
        dmg_min: 9,
        dmg_max: 15,
      },
      {
        name: "Rotoplas",
        hp_min: 70,
        hp_max: 100,
        dmg_min: 15,
        dmg_max: 25,
      },
    ];

    this.enemyType = this.getRandomEnemy();

    this.enemy_name= this.enemyType.name;

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

  getRandomEnemy(){
    let randomIndex = Math.floor(Math.random() * this.enemyTypes.length);
    return this.enemyTypes[randomIndex];
  }

  generateStats(level){
    this.enemy_lvl = level;
    this.enemy_name = this.enemyType.name;

    this.hp_min = this.enemyType.hp_min + (level - 1) * 30;
    this.hp_max = this.enemyType.hp_max + (level - 1) * 40;

    this.dmg_min = this.enemyType.dmg_min + (level - 1) * 5;
    this.dmg_max = this.enemyType.dmg_max + (level - 1) * 7;

    this.maxHP = this.randomNumber(this.hp_min, this.hp_max);
    this.hp = this.maxHP;
    this.stunnedTurns = 0;
  }

  randomDamage(){
    return this.randomNumber(this.dmg_min, this.dmg_max);
  }

  randomNumber(min, max){
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
      [3, 0],[3, 4],[3, 6],
      [0, 1],
      [1, 2],[1, 4],
      [2, 5],
      [4, 5],[4, 7],
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

    this.day = 1;
    this.maxDay = 3;

    this.mapHouse = new MapHouse();
    this.mapHouse.randomMap();
    this.enemyRoomID = this.mapHouse.enemyRoomID;
    this.currentRoom = 3;

    this.cards = [];
    this.wildcard = null;
    this.isPlayerTurn = true;

    this.upgradeButtons = [];

    this.camera = { x: 0, y: 0 };
    this.worldWidth = canvasWidth * 3;
    this.worldHeight = canvasHeight * 3;

    this.createEventListeners();
    this.initObjects();
    this.loadScene(SCENES.CASA);
    this.livebars = [];
    this.message = "";
    this.messageTimer = 0;
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
      new Vector(canvasWidth / 4, canvasHeight / 8),
      280,
      150,
      "grey",
    );
    this.casa.setSprite(
      "../assets/sprites/house.png",
      new Rect(0, 0, 1250, 1050),
    );
    this.casa_lj = new GameObject(
      new Vector(canvasWidth - 90, canvasHeight - 200),
      190,
      185,
      "purple",
    );
    this.casa_lj.setSprite(
      "../assets/sprites/house_LJ.png",
      new Rect(0, 0, 1000, 1300),
    );

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
    this.enemy.setSprite(
      "../assets/sprites/monster_littlejimmy.png",
      new Rect(0, 0, 1000, 1000),
    );

    this.bushes = [];
    const bushSprites = [
      { src: "../assets/sprites/bush.png", rect: new Rect(0, 0, 1284, 1020) },
      { src: "../assets/sprites/bush2.png", rect: new Rect(0, 0, 1280, 640) },
      { src: "../assets/sprites/bush3.png", rect: new Rect(0, 0, 1920, 960) },
    ];

    for (let i = 0; i < 10; i++) {
      let randomX = Math.random() * (this.worldWidth - 100) + 50;
      let randomY = Math.random() * (this.worldHeight - 100) + 50;
      let randomSprite =
        bushSprites[Math.floor(Math.random() * bushSprites.length)];

      let bush = new GameObject(new Vector(randomX, randomY), 90, 70, "green");
      bush.setSprite(randomSprite.src, randomSprite.rect);

      this.bushes.push({
        bush: bush,
        hasCard: i < 5,
        hasUpgrade: i >= 5 && i < 8,
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

    this.tileVilla = new Image();
    this.tileVilla.src = "../assets/sprites/villa.png";
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

  //Generates a random card form CARD_POOL and adds it to a specific position of the combat UI
  getRandomCard(posX) {
    let randomIndex = Math.floor(Math.random() * CARD_POOL.length);
    let randomCard = CARD_POOL[randomIndex];
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
    if (this.day >= this.maxDay) {
      this.loadScene(SCENES.VICTORY);
      return;
    }

    this.day++;

    this.randomEnemyLocation();
    this.enemy.generateStats(this.day);

    this.message = "Day " + this.day;
    this.messageTimer = 120;

    this.loadScene(SCENES.CASA);
  }

  //Starts the combat (resets the HP and energy, generates de 4 cards of the deck, HP and energy bars and generates the enemy)
  combatHand() {
    this.cards = [];
    this.wildcardUsed = false;
    this.isPlayerTurn = true;
    this.player.energy = this.player.maxEnergy;
    this.player.hp = this.player.maxHP;
    this.player.evasionChance = 0;
    this.enemy.hp = this.enemy.maxHP;
    this.enemy.stunnedTurns = 0;

    for (let i = 0; i < 4; i++) {
      let posX = 40 + i * 140;
      this.cards.push(this.getRandomCard(posX));
    }

    this.wildcard = this.getWildcard();

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
        break;

      case SCENES.COMBATE:
        this.actors = [this.player, this.enemy];
        this.player.position = new Vector(150, canvasHeight * 0.3);
        this.combatHand();
        break;

      case SCENES.UPGRADE:
        this.player.velocity = new Vector(0, 0);

        this.actors = [this.player, this.casa, this.casa_lj];

        for (let bushData of this.bushes) {
          this.actors.push(bushData.bush);
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
    ctx.fillStyle = "rgba(80, 80, 80, 0.65";
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

  //Draws the actors, messages and UIs of the game
  draw(ctx) {
    if (this.currentScene == SCENES.UPGRADE) {
      ctx.save();
      ctx.translate(-this.camera.x, -this.camera.y);

      if (this.tileVilla.complete) {
        let pattern = ctx.createPattern(this.tileVilla, "repeat");
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);
      }

      for (let actor of this.actors) {
        actor.draw(ctx);
      }

      ctx.restore();

      this.drawUpgradeScreen(ctx);
      return;
    }

    if (this.currentScene == SCENES.VILLA) {
      ctx.save();
      ctx.translate(-this.camera.x, -this.camera.y);

      if (this.tileVilla.complete) {
        let pattern = ctx.createPattern(this.tileVilla, "repeat");
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);
      }

      for (let actor of this.actors) {
        actor.draw(ctx);
      }

      ctx.restore();
      return;
    }

    if (this.currentScene == SCENES.CASA) {
      ctx.drawImage(this.backgroundCasa, 0, 0, canvasWidth, canvasHeight);
    }

    if (this.currentScene == SCENES.CASA_LJ) {
      ctx.drawImage(this.backgroundCasa_enemy, 0, 0, canvasWidth, canvasHeight);
    }

    if (this.currentScene == SCENES.HABITACION) {
      let doors = this.mapHouse.getDoorsFrom(this.currentRoom);
      let directions = doors.map((d) =>
        this.mapHouse.getDirection(this.currentRoom, d),
      );
      let angle = 0;

      if (doors.length >= 3) {
        angle = 0;
      } else {
        if (directions.includes("bottom") && directions.includes("left")) {
          angle = 0;
        } else if (directions.includes("top") && directions.includes("right")) {
          angle = Math.PI;
        } else if (
          directions.includes("bottom") &&
          directions.includes("right")
        ) {
          angle = -Math.PI / 2;
        } else if (directions.includes("top") && directions.includes("left")) {
          angle = Math.PI / 2;
        }
      }

      let bg =
        doors.length >= 3 ? this.backgroundHabitacion : this.backgroundMeca;

      ctx.save();
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate(angle);

      if (angle === Math.PI / 2 || angle === -Math.PI / 2) {
        ctx.drawImage(
          bg,
          -canvasHeight / 2,
          -canvasWidth / 2,
          canvasHeight,
          canvasWidth,
        );
      } else {
        ctx.drawImage(
          bg,
          -canvasWidth / 2,
          -canvasHeight / 2,
          canvasWidth,
          canvasHeight,
        );
      }

      ctx.restore();
    }

    for (let actor of this.actors) {
      actor.draw(ctx);
    }

    if (this.messageTimer > 0) {
      ctx.fillStyle = "black";
      ctx.font = "bold 30px Arial";
      ctx.textAlign = "center";
      ctx.fillText(this.message, canvasWidth / 2, 80);
      this.messageTimer--;
    }

    if (this.currentScene === SCENES.COMBATE) {
      this.drawCombatUI(ctx);
    }

    if (this.currentScene === SCENES.GAME_OVER) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      ctx.fillStyle = "red";
      ctx.font = "bold 55px Arial";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvasWidth / 2, 220);

      ctx.fillStyle = "white";
      ctx.font = "28px Arial";
      ctx.fillText("Press SPACE to start again", canvasWidth / 2, 320);
      return;
    }

    if (this.currentScene === SCENES.VICTORY) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      ctx.fillStyle = "gold";
      ctx.font = "bold 55px Arial";
      ctx.textAlign = "center";
      ctx.fillText("YOU WIN", canvasWidth / 2, 240);

      ctx.fillStyle = "white";
      ctx.font = "28px Arial";
      ctx.fillText("You survived 3 days", canvasWidth / 2, 320);
      return;
    }
  }

  //Render of each card individually
  drawCardItem(ctx, card) {
    let disabledWildcard = card.isWildcard && this.wildcardUsed;

    ctx.fillStyle = disabledWildcard ? "black" : card.color;

    ctx.fillRect(card.x, card.y, card.w, card.h);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(card.x, card.y, card.w, card.h);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 11px Arial";

    ctx.fillText(card.name, card.x + card.w / 2, card.y + 25);

    ctx.font = "bold 7px Arial";
    ctx.fillStyle = "white";

    ctx.fillText(card.effect, card.x + card.w / 2, card.y + 60);

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
        let damage = this.enemy.randomDamage();
        this.player.hp -= damage;

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
    this.day = 1;

    this.mapHouse.randomMap();
    this.enemyRoomID = this.mapHouse.enemyRoomID;
    this.currentRoom = 3;

    this.enemy.enemyType = this.enemy.getRandomEnemy();
    this.enemy.generateStats(this.day);
    this.enemy.enemyType = this.enemy.getRandomEnemy();

    this.player.hp = this.player.maxHP;
    this.player.energy = this.player.maxEnergy;
    this.player.evasionChance = 0;

    this.cards = [];
    this.wildcard = null;
    this.isPlayerTurn = true;

    this.message = "";
    this.messageTimer = 0;

    this.loadScene(SCENES.CASA);
  }

  //Detects the death of the player when the HP bar reaches 0 during combat
  playerDeath() {
    if (this.player.hp <= 0) {
      this.player.hp = 0;

      this.currentScene = SCENES.GAME_OVER;
    }
  }

  //Controls the collisions of the game and what happens when the player collides with an object in each of the scenes ans states
  update(deltaTime) {
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

              if (bushData.hasUpgrade) {
                this.loadScene(SCENES.UPGRADE);
                return;
              }

              if (bushData.hasCard) {
                this.message = "New card!";
                this.messageTimer = 120;
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
            canvasWidth / 4 + 90,
            canvasHeight / 8 + 160,
          );

          this.loadScene(SCENES.VILLA);
        }

        break;

      case SCENES.CASA_LJ:
      case SCENES.HABITACION:
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
        if (this.enemy.hp <= 0) {
          this.enemyDefeated();
        }
        break;
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

      if (this.player.energy < 0) {
        this.player.energy = 0;
      }
    }

    selectedCard.action(this.player, this.enemy);

    this.player.energy = Math.min(this.player.energy, this.player.maxEnergy);

    if (!isWildcard) {
      let oldX = selectedCard.x;
      this.cards[index] = this.getRandomCard(oldX);
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

        this.message = button.upgrade.name + " Upgrade!";
        this.messageTimer = 120;

        this.currentScene = SCENES.VILLA;
        this.player.velocity = new Vector(0, 0);
        this.player.updateCollider();
        this.updateCamera();

        return;
      }
    }
  }

  //The controls of the game for movement, restarting and selecting cards during combat
  createEventListeners() {
    if (this.currentScene === SCENES.COMBATE) return;
    window.addEventListener("keydown", (event) => {
      if (this.currentScene === SCENES.COMBATE) return;
      if (this.currentScene === SCENES.GAME_OVER && event.key === " ") {
        this.restartRun();
        return;
      }
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
      const canvas = document.getElementById("canvas");
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mouseX = (event.clientX - rect.left) * scaleX;
      const mouseY = (event.clientY - rect.top) * scaleY;
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


function main() {
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