/*
 * Class for the base Game Object used for all the actors in a scene
 *
 * The position of the object is its center.
 *
 * Gilberto Echeverria
 * 2026-02-15
 */

"use strict";

let showBBox = false;
let showColl = false;

window.addEventListener('keydown', event => {
    if (event.key == 'y') showBBox = !showBBox;
    if (event.key == 'u') showColl = !showColl;
});

class GameObject {
    constructor(position, width, height, color, type) {
        this.position = position;
        this.size = new Vector(width, height);
        this.halfSize = new Vector(width / 2, height / 2);
        this.color = color;
        this.type = type;
        this.scale = 1.0;
        this.visible = true;

        this.spriteImage = undefined;
        this.spriteRect = undefined;

        this.setCollider(width, height);
    }

    setSprite(imagePath, rect) {
        this.spriteImage = new Image();
        this.spriteImage.src = imagePath;
        if (rect) {
            this.spriteRect = rect;
        }
    }

    setScale(scale) {
        this.scale = scale;
    }

    setCollider(width, height) {
        this.xOffset = width / 2;
        this.yOffset = height / 2;
        this.colliderWidth = width;
        this.colliderHeight = height;
        this.updateCollider();
    }

    updateCollider() {
        this.collider = new Rect(this.position.x - this.xOffset,
                                 this.position.y - this.yOffset,
                                 this.colliderWidth,
                                 this.colliderHeight);
    }

    draw(ctx) {
        if (this.visible === false) return; 

        if (this.spriteImage) {
            if (this.spriteRect) {
                ctx.drawImage(this.spriteImage,
                              this.spriteRect.x,
                              this.spriteRect.y,
                              this.spriteRect.width,
                              this.spriteRect.height,
                              (this.position.x - this.halfSize.x * this.scale),
                              (this.position.y - this.halfSize.y * this.scale),
                              this.size.x * this.scale,
                              this.size.y * this.scale);
            } else {
                ctx.drawImage(this.spriteImage,
                              (this.position.x - this.halfSize.x * this.scale),
                              (this.position.y - this.halfSize.y * this.scale),
                              this.size.x * this.scale,
                              this.size.y * this.scale);
            }
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect((this.position.x - this.halfSize.x * this.scale),
                         (this.position.y - this.halfSize.y * this.scale),
                         this.size.x * this.scale,
                         this.size.y * this.scale);
        }

        if (showBBox) this.drawBoundingBox(ctx);
        if (showColl) this.drawCollider(ctx);
    }

    drawBoundingBox(ctx) {
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = "rgb(0.5, 0.5, 0.5, 0.3)";
        ctx.fillRect((this.position.x - this.halfSize.x * this.scale),
                     (this.position.y - this.halfSize.y * this.scale),
                     this.size.x * this.scale,
                     this.size.y * this.scale);
        ctx.globalCompositeOperation = "source-over";

        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.rect((this.position.x - this.halfSize.x * this.scale),
                 (this.position.y - this.halfSize.y * this.scale),
                 this.size.x * this.scale,
                 this.size.y * this.scale);
        ctx.stroke();

        ctx.fillStyle = "red";
        ctx.fillRect(this.position.x - 2, this.position.y - 2, 4, 4);
    }

    drawCollider(ctx) {
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.rect(this.collider.x,
                 this.collider.y,
                 this.collider.width,
                 this.collider.height);
        ctx.stroke();
    }

    update() {

    }
}