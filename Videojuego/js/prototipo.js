"use strict";

const canvasWidth = 800;
const canvasHeight = 600;
let ctx;
let game;
let oldTime;
let playerSpeed = 3.5;

const SCENES = {
  VILLA: "villa",
  CASA: "casa",
  CASA_LJ: "casa_lj",
  HABITACION: "habitacion",
  COMBATE: "combate",
  GAME_OVER: "game_over"
};

const CARD_TYPES = {
  ATTACK: { color: "red", label: "Attack" },
  DEFENSA: { color: "lightgreen", label: "Defensive" },
  CONTROL: { color: "lightblue", label: "Control" },
};

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

class combatBars {
  constructor(position, width, height, target, type, color) {
    
    this.position = position;
    this.width = width;
    this.height = height;
    this.target = target;
    this.type = type;
    this.barColor = color;
  }

  draw(ctx){
    let current;
    let max;

    if(this.type === "hp"){
        current = this.target.hp;
        max = this.target.maxHP;
    }
    else if(this.type === "energy"){
        current = this.target.energy;
        max = this.target.maxEnergy;
    }

    let percentage = current / max;

    ctx.fillStyle = "black";
    ctx. fillRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
    );

    ctx.fillStyle = this.barColor;
    ctx.fillRect(
        this.position.x,
        this.position.y,
        this.width * percentage,
        this.height
    );

    ctx.strokeStyle = "white";
    ctx.strokeRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
    );

    ctx.fillStyle = "white";
    ctx.font= "14px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        `${current} / ${max}`,
        this.position.x + this.width / 2,
        this.position.y + 17
    );
  }
}

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
    if (game && game.currentScene === SCENES.COMBATE) {
      this.velocity = new Vector(0, 0);
      return;
    }

    this.velocity = this.velocity.normalize().times(playerSpeed);
    this.position = this.position.plus(this.velocity.times(deltaTime));
    this.clampWithinCanvas();
  }

  clampWithinCanvas() {
    if (this.position.y < 0) {
      this.position.y = 0;
    } else if (this.position.y + this.height > canvasHeight) {
      this.position.y = canvasHeight - this.height;
    }

    if (this.position.x < 0) {
      this.position.x = 0;
    } else if (this.position.x + this.width > canvasWidth) {
      this.position.x = canvasWidth - this.width;
    }
  }
}

class Enemy extends GameObject {
  constructor(position, width, height, color) {
    super(position, width, height, color);
    this.maxHP = 100;
    this.hp = this.maxHP;
    this.stunnedTurns = 0;
  }
}

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

class Game {
  constructor() {
    this.currentScene = SCENES.CASA;
    this.actors = [];
    this.transitionCooldown = 0;

    this.enemy = null;
    this.enemyRoomID = 1;
    this.cards = [];
    this.wildcard = null;
    this.isPlayerTurn = true;

    this.createEventListeners();
    this.initObjects();
    this.loadScene(SCENES.CASA);
    this.currentRoom = 0;
    this.livebars = [];
  }

  initObjects() {
    this.player = new Player(new Vector(canvasWidth / 2, canvasHeight / 2),55,55,"red");

    this.casa = new GameObject(new Vector(canvasWidth / 4, canvasHeight / 8),185,150,"grey");
    this.casa_lj = new GameObject(new Vector(canvasWidth - 70, canvasHeight - 200),150,185,"purple");

    this.salida_casa = new GameObject(new Vector(canvasWidth / 2, 590),120,40,"grey");
    this.salida_casa_lj = new GameObject(new Vector(20, canvasHeight / 2),40,120,"grey");
    this.exit_room2 = new GameObject(new Vector(canvasWidth / 2, canvasHeight - canvasHeight),120,40,"grey");
    this.exit_room1 = new GameObject(new Vector(canvasWidth / 2, canvasHeight),120,40,"grey");

    this.room_1 = new Room(new Vector(canvasWidth / 2, canvasHeight - canvasHeight),120,40,"green");
    this.room_2 = new Room(new Vector(canvasWidth / 2, canvasHeight),120,40,"blue");
    this.room_3 = new Room(new Vector(canvasWidth - 5, canvasHeight / 2),40,120,"yellow");

    this.enemy = new Enemy(new Vector(canvasWidth - 160, canvasHeight * 0.3),70,70,"orange");
  }

  randomEnemyLocation() {
    this.enemyRoomID = Math.floor(Math.random() * 3) + 1;
  }

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

    this.playerHPBar = new combatBars(new Vector(40, 40),250,25,this.player, "hp", "green");
    this.playerEnergyBar = new combatBars(new Vector(40, 80), 250, 25, this.player, "energy", "blue");
    this.enemyHPBar = new combatBars(new Vector(510, 80), 250, 25, this.enemy, "hp", "red");
  }

  loadScene(scene) {
    this.currentScene = scene;
    this.transitionCooldown = 30;

    if (this.player) {
      this.player.velocity = new Vector(0, 0);
    }

    switch (scene) {
      case SCENES.VILLA:
        this.actors = [this.player, this.casa, this.casa_lj];
        this.player.position = new Vector(canvasWidth / 2, canvasHeight / 2);
        break;

      case SCENES.CASA:
        this.actors = [this.player, this.salida_casa];
        break;

      case SCENES.CASA_LJ:
        this.actors = [
          this.player,
          this.salida_casa_lj,
          this.exit_room1,
          this.exit_room2,
          this.room_1,
          this.room_2,
          this.room_3,
        ];
        break;

      case SCENES.HABITACION:
        if(this.currentRoom === 1){
            this.actors = [this.player, this.exit_room1];
        }
        else if(this.currentRoom === 2){
            this.actors = [ this.player, this.exit_room2];
        }
        break;

      case SCENES.COMBATE:
        this.actors = [this.player, this.enemy];
        this.player.position = new Vector(150, canvasHeight * 0.3);
        this.combatHand();
        break;
    }
  }

  draw(ctx, card) {
    for (let actor of this.actors) {
      actor.draw(ctx);
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
  }

  drawCardItem(ctx, card) {
    let disabledWildcard = card.isWildcard && this.wildcardUsed;

    ctx.fillStyle = disabledWildcard ? "black" : card.color;

    ctx.fillRect(card.x, card.y, card.w, card.h);

    ctx.strokeStyle = "black"
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
      ctx.fillText("Your turn, select a card...", canvasWidth / 2, 420);
    } else {
      ctx.fillText("Enemy turn...", canvasWidth / 2, 420);
    }
  }

  enemyTurn() {
    if (this.enemy.stunnedTurns > 0) {
      this.enemy.stunnedTurns--;
      setTimeout(() => {
        this.endTurn();
      }, 1200);
      return;
    }

    setTimeout(() => {
      if (this.currentScene !== SCENES.COMBATE) return;

      let randomRoll = Math.random();
      if (randomRoll < this.player.evasionChance) {
      } else {
        let damage = 20;
        this.player.hp -= damage;
        this.playerDeath();
        if(this.currentScene === SCENES.GAME_OVER) return;
      }

      this.player.evasionChance = 0;

      setTimeout(() => {
        this.endTurn();
      }, 1200);
    }, 800);
  }

  endTurn() {
    this.isPlayerTurn = true;
  }

  restartRun(){
    this.player.hp = this.player.maxHP;
    this.player.energy = this.player.maxEnergy;
    this.player.evasionChance = 0;
    this.enemy.hp = this.enemy.maxHP;
    this.enemy.stunnedTurns = 0;
    this.cards = [];
    this.wildcard = null;

    this.loadScene(SCENES.VILLA)
  }

  playerDeath(){
    if(this.player.hp <= 0){
        this.player.hp = 0;

        this.currentScene = SCENES.GAME_OVER;
    }
  }

  update(deltaTime) {
    this.player.update(deltaTime);
    if (this.player.updateCollider) this.player.updateCollider();

    if (this.transitionCooldown > 0) {
      this.transitionCooldown--;
    }

    if (this.transitionCooldown > 0) return;

    switch (this.currentScene) {
      case SCENES.VILLA:
        if (boxOverlap(this.player, this.casa)) {
          this.loadScene(SCENES.CASA);
        } else if (boxOverlap(this.player, this.casa_lj)) {
          this.loadScene(SCENES.CASA_LJ);
        }
        break;

      case SCENES.CASA:
        if (boxOverlap(this.player, this.salida_casa)) {
          this.loadScene(SCENES.VILLA);
        }
        break;

      case SCENES.CASA_LJ:
        if (boxOverlap(this.player, this.salida_casa_lj)) {
          this.loadScene(SCENES.VILLA);
        } else if (boxOverlap(this.player, this.room_1)) {
            this.currentRoom = 1;
            this.loadScene(SCENES.HABITACION);
        } else if (boxOverlap(this.player, this.room_2)) {
            this.currentRoom = 2;
            this.loadScene(SCENES.HABITACION);
        } else if (boxOverlap(this.player, this.room_3)) {
          this.loadScene(SCENES.COMBATE);
        }
        break;

      case SCENES.HABITACION:
        if(this.currentRoom === 1 && boxOverlap(this.player, this.exit_room1)){
            this.loadScene(SCENES.CASA_LJ);
        }
        else if(this.currentRoom === 2 && boxOverlap(this.player, this.exit_room2)){
            this.loadScene(SCENES.CASA_LJ);
        }
        break;

      case SCENES.COMBATE:
        if (this.enemy.hp <= 0) {
          this.randomEnemyLocation();
          this.loadScene(SCENES.CASA);
        }
        break;
    }
  }

  combatClick(mouseX, mouseY) {
    if (this.currentScene !== SCENES.COMBATE || !this.isPlayerTurn || this.player.hp <= 0) return;

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

  executeCard(index, isWildcard) {
    let selectedCard = isWildcard ? this.wildcard : this.cards[index];
    if (!selectedCard) return;

    if (isWildcard) {
      if (this.wildcardUsed) return;
      if(this.player.hp <= WILDCARD.hpCost) return;
      this.wildcardUsed = true;
    } else{
        if(this.player.energy < selectedCard.cost) return;
        this.player.energy -= selectedCard.cost;
        if(this.player.energy < 0){
            this.player.energy = 0;
        }
    }

    selectedCard.action(this.player, this.enemy);

   this.player.energy = Math.min(this.player.energy, this.player.maxEnergy);
   if(!isWildcard){
    let oldX = selectedCard.x;
    this.cards[index] = this.getRandomCard(oldX);
   }

    this.isPlayerTurn = false;
    this.enemyTurn();
  }

  createEventListeners() {
    window.addEventListener("keydown", (event) => {
      if (this.currentScene === SCENES.COMBATE) return;
      if (this.currentScene === SCENES.GAME_OVER && event.key === " ") {
        this.restartRun();
        return;
      }
      if (event.key == "w") {
        this.player.velocity.y = -playerSpeed;
      } else if (event.key == "a") {
        this.player.velocity.x = -playerSpeed;
      } else if (event.key == "s") {
        this.player.velocity.y = playerSpeed;
      } else if (event.key == "d") {
        this.player.velocity.x = playerSpeed;
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.key == "w") {
        this.player.velocity.y = 0;
      } else if (event.key == "a") {
        this.player.velocity.x = 0;
      } else if (event.key == "s") {
        this.player.velocity.y = 0;
      } else if (event.key == "d") {
        this.player.velocity.x = 0;
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
    });
  }
}

function main() {
  const canvas = document.getElementById("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx = canvas.getContext("2d");
  game = new Game();
  drawScene(0);
}

function drawScene(newTime) {
  let deltaTime = 1;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  game.update(deltaTime);
  game.draw(ctx);

  oldTime = newTime;
  requestAnimationFrame(drawScene);
}