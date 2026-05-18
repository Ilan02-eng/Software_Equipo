"use strict";

const canvasWidth = 800;
const canvasHeight = 600;
let ctx;
let game;
let oldTime;
let playerSpeed = 3.5;

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
    }
}

class Game {
    constructor() {
        this.createEventListeners();
        this.initObjects();
    }
    initObjects() {
        this.player = new Player(new Vector(canvasWidth / 2, canvasHeight / 2), 60, 60, "red");

        this.casa = new GameObject(new Vector(canvasWidth / 4, canvasHeight / 4), 80, 80, "grey");
        this.casa_lj = new GameObject(new Vector(canvasWidth / 4 + canvasWidth / 4, canvasHeight / 4), 80, 80, "purple");

        this.carta_inst = new GameObject(new Vector(canvasWidth / 2, canvasHeight / 2), 200, 200, "green");
        this.salida_casa = new GameObject(new Vector(canvasWidth - 780, canvasHeight - 30), 80, 80, "pink");
        this.salida_casa_lj = new GameObject(new Vector(canvasWidth - 780, canvasHeight - 30), 80, 80, "grey");

        this.room_1 = new Room(new Vector(canvasWidth / 2, canvasHeight - canvasHeight), 120, 40, "green");
        this.room_2 = new Room(new Vector(canvasWidth / 2, canvasHeight), 120, 40, "blue");
        this.room_3 = new Room(new Vector(canvasWidth - 5, canvasHeight / 2), 40, 120, "yellow");

        this.combate = new GameObject(new Vector(canvasWidth / 2, canvasHeight / 2), 200, 200, "green");

        this.actors = [this.player, this.casa, this.casa_lj];
    }

    draw(ctx) {
        for (let actor of this.actors) {
            actor.draw(ctx);
        }
        this.player.draw(ctx);
    }

    update(deltaTime) {
        this.player.update(deltaTime);
        this.player.updateCollider();

        if (boxOverlap(this.player, this.casa)) {
            this.actors = [this.player, this.carta_inst, this.salida_casa];
        } else if (boxOverlap(this.player, this.salida_casa)) {
            this.actors = [this.player, this.casa, this.casa_lj];
        } else if (boxOverlap(this.player, this.casa_lj)) {
            this.actors = [this.player, this.salida_casa_lj, this.room_1, this.room_2, this.room_3];
        } else if (boxOverlap(this.player, this.room_1) || boxOverlap(this.player, this.room_2)) {
            this.actors = [this.player, this.salida_casa_lj];
        } else if (boxOverlap(this.player, this.room_3)) {
            this.actors = [this.player, this.combate, this.salida_casa_lj];
        } else if (boxOverlap(this.player, this.salida_casa_lj)) {
            this.actors = [this.player, this.salida_casa_lj, this.room_1, this.room_2, this.room_3];
        }
        //variable que sepa en donde estoy y ya de ahi checar colisiones, separarlo por funciones 

        //lista de los lugares donde podria haber cartas y ahi aleatoriamente te lo aplica 

        //lo balanceamos 

        //upgrade de cartas 
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