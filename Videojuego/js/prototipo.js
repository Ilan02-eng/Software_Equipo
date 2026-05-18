"use strict";

const canvasWidth = 800;
const canvasHeight = 600;
let ctx;
let game;
let oldTime;
let playerSpeed = 3.5;

const SCENES = {
    VILLA: 'villa',
    CASA: 'casa',
    CASA_LJ: 'casa_lj',
    HABITACION: 'habitacion',
    COMBATE: 'combate'
};

class Player extends GameObject {
    constructor(position, width, height, color, sheetCols) {
        super(position, width, height, color, "player", sheetCols);
        this.velocity = new Vector(0, 0);
    }

    update(deltaTime) {
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
        this.currentScene = SCENES.VILLA;
        this.actors = [];
        this.transitionCooldown = 0;
        this.createEventListeners();
        this.initObjects();
        this.loadScene(SCENES.VILLA);
    }

    initObjects() {
        this.player = new Player(new Vector(canvasWidth / 2, canvasHeight / 2), 60, 60, "red");

        this.casa         = new GameObject(new Vector(canvasWidth / 4, canvasHeight / 4), 80, 80, "grey");
        this.casa_lj      = new GameObject(new Vector(canvasWidth / 4 + canvasWidth / 4, canvasHeight / 4), 80, 80, "purple");

        this.carta_inst   = new GameObject(new Vector(canvasWidth / 2, canvasHeight / 2), 200, 200, "green");
        this.salida_casa  = new GameObject(new Vector(canvasWidth - 780, canvasHeight - 30), 80, 80, "pink");
        this.salida_casa_lj = new GameObject(new Vector(canvasWidth - 780, canvasHeight - 30), 80, 80, "grey");

        this.room_1  = new Room(new Vector(canvasWidth / 2, canvasHeight - canvasHeight), 120, 40, "green");
        this.room_2  = new Room(new Vector(canvasWidth / 2, canvasHeight), 120, 40, "blue");
        this.room_3  = new Room(new Vector(canvasWidth - 5, canvasHeight / 2), 40, 120, "yellow");

        this.combate = new GameObject(new Vector(canvasWidth / 2, canvasHeight / 2), 200, 200, "green");
    }

    loadScene(scene) {
        this.currentScene = scene;
        this.transitionCooldown = 60; 

        switch (scene) {
            case SCENES.VILLA:
                this.actors = [this.player, this.casa, this.casa_lj];
                break;

            case SCENES.CASA:
                this.actors = [this.player, this.carta_inst, this.salida_casa];
                break;

            case SCENES.CASA_LJ:
                this.actors = [this.player, this.salida_casa_lj, this.room_1, this.room_2, this.room_3];
                break;

            case SCENES.HABITACION:
                this.actors = [this.player, this.salida_casa_lj];
                break;

            case SCENES.COMBATE:
                this.actors = [this.player, this.combate, this.salida_casa_lj];
                break;
        }
    }

    draw(ctx) {
        for (let actor of this.actors) {
            actor.draw(ctx);
        }
    }

    update(deltaTime) {
        this.player.update(deltaTime);
        this.player.updateCollider();

        if (this.transitionCooldown > 0) {
            this.transitionCooldown--;
            return;
        }

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
                    this.loadScene(SCENES.HABITACION);
                } else if (boxOverlap(this.player, this.room_2)) {
                    this.loadScene(SCENES.HABITACION);
                } else if (boxOverlap(this.player, this.room_3)) {
                    this.loadScene(SCENES.COMBATE);
                }
                break;

            case SCENES.HABITACION:
            case SCENES.COMBATE:
                if (boxOverlap(this.player, this.salida_casa_lj)) {
                    this.loadScene(SCENES.CASA_LJ);
                }
                break;
        }
    }

    createEventListeners() {
        window.addEventListener('keydown', (event) => {
            if (event.key == 'w') {
                this.player.velocity.y = -playerSpeed;
            } else if (event.key == 'a') {
                this.player.velocity.x = -playerSpeed;
            } else if (event.key == 's') {
                this.player.velocity.y = playerSpeed;
            } else if (event.key == 'd') {
                this.player.velocity.x = playerSpeed;
            }
        });

        window.addEventListener('keyup', (event) => {
            if (event.key == 'w') {
                this.player.velocity.y = 0;
            } else if (event.key == 'a') {
                this.player.velocity.x = 0;
            } else if (event.key == 's') {
                this.player.velocity.y = 0;
            } else if (event.key == 'd') {
                this.player.velocity.x = 0;
            }
        });
    }
}

function main() {
    const canvas = document.getElementById('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');
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