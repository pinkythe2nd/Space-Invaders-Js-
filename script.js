//-------------setting up canvas-------------//
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;
ctx.fillStyle = "white";
ctx.font = '48px serif';
ctx.fillStyle = "red";
ctx.textAlign = "center";

canvas.style.backgroundColor = "black";

//----loading texture atlas-----//
const sprite = new Image();
sprite.src = "media/sprites.png";

//--------- global variables------//
var projectileAlive = false;
const spriteArray = [];
const bugProjArray = [];
KEYS = {};
const frames = [0, 41];
var frame = 0;

//-------listening for keys------//
document.addEventListener("keydown", (event) => {
    KEYS[event.code] = event.type === "keydown";
});

document.addEventListener("keyup", (event) => {
    KEYS[event.code] = event.type === "keydown";
});


class BugProjectile{
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 5;
        this.h = 12;
    }

    update () {
        if (this.y > 600) { //border detection, removes itself from the arrays if of screen
            spriteArray.splice((spriteArray.indexOf(this)), 1);
            bugProjArray.splice((bugProjArray.indexOf(this)), 1);
        }
        this.y += 5; //go down
    }
    draw () {
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

}
class Projectile extends BugProjectile{
    constructor(x, y) {
        super(x, y);
        projectileAlive = true;
    }
    update() {
        if (this.y < 0) { //border detection, removes itself from the arrays if of screen
            projectileAlive = false;
            spriteArray.splice(spriteArray.indexOf(this), 1);
        }
        this.y -= 20; // go up
    }
    draw() {
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

class Explosion{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.w = 40;
        this.h = 30;
    }
    draw() {
        //drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight);
        ctx.drawImage(sprite, 41, 26, 40, 30, this.x, this.y, this.w, this.h);
    }
}

class Bug extends Explosion{
    constructor(x, y){
        super(x, y);
    }
    update (vx, vy){
        this.x += vx; //vx is how much to move the bugs by,
        this.y += vy; 
    }
    draw () {
        //drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight);
        ctx.drawImage(sprite, frames[frame], 0, 40, 30, this.x, this.y, this.w, this.h);
    }
}

class Player extends Explosion{
    constructor(x, y){
        super(x, y);
        this.isAlive = true;
    }
    update(){
        if (this.x > 760) { //border check, stops the player moving of screen
            this.x = 760
        } if (this.x < 0) {
            this.x = 0;
        }

    }
    draw(){
        //drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight);
        ctx.drawImage(sprite, 0, 53, 40, 30, this.x, this.y, this.w, this.h);
    }
}

class Game{
    constructor(){
        this.prevTime = 0;
        this.prevTime2 = 0;
        this.prevTime3 = 0;
        this.prevTime4 = 0;
        
        
        this.speed = 10;
        this.maxDelay = 8000;
        this.minDelay = 2000;
        this.shift = false;

        this.score = 0;
        this.scorevalue = 10;

        this.vx;
        this.pProj;

        this.bugs = [];
        this.explodedArray = [];

        this.player = new Player(400, 560)
        spriteArray.push(this.player);

        //------ filling the bug array------//
        for (let i = 0; i < 10; i++) {
            for (let t = 0; t < 5; t++) {
                this.bugs.push(new Bug(i * 50, t * 50));
            }
        }
    }

    _bugBorderCheck(){ //efficient way of checking if the bugs are at the borders of the canvas
        let firstBug = this.bugs[0];
        let lastBug = this.bugs[this.bugs.length - 1];

        if (lastBug.x >= 750) {
            this.vx = -this.speed;
            this.shift = true;
        } if (firstBug.x <= 0) {
            this.vx = this.speed;
            this.shift = true;
        }
    }

    _events(){ //key press events
        if (KEYS["ArrowLeft"]) this.player.x -= 5;
        if (KEYS["ArrowRight"]) this.player.x += 5;
        if (KEYS["ArrowUp"]) document.getElementById('player').play()
        if (KEYS["ArrowDown"]) document.getElementById('player').pause()
        if (KEYS["Space"]) {
            if (projectileAlive == false) {
                this.pProj = new Projectile(this.player.x + 20, this.player.y - 25);
                spriteArray.push(this.pProj);
            }
        }
    }

    __collide(a, b) { //axis alligned bouding box detection, passing instances of a object
        // AABB collision detection
        if (a.x > b.x + b.w) return false;
        if (a.x + a.w < b.x) return false;
        if (a.y > b.y + b.h) return false;
        if (a.y + a.h < b.y) return false;
        return true;
    }

    _collisions() { //checks all collision throught the game
        if (projectileAlive == true) { //collisions between the bugs and the players projectile
            for (let i = 0; i < this.bugs.length; i++) {
                if (this.__collide(this.pProj, this.bugs[i])) {

                    this.explodedArray.push(new Explosion(this.bugs[i].x, this.bugs[i].y)); //make explosion at bug x and y
                    this.bugs.splice(i, 1);
                    
                    spriteArray.splice(spriteArray.indexOf(this.pProj), 1);
                    projectileAlive = false;
                    this.score += this.scorevalue;
                    document.getElementById("score").innerHTML = this.score;
                    break
                }
            }
        }
        for (let i = 0; i < bugProjArray.length; i++){//collisions between bug projectiles and the player
            if (this.__collide(this.player, bugProjArray[i])) {
                this.explodedArray.push(new Explosion(this.player.x, this.player.y));

                spriteArray.splice(spriteArray.indexOf(bugProjArray[i]), 1);
                bugProjArray.splice(i, 1);

                this.player.isAlive = false;

                break
            }
        }
    }

    __randomNumGen(min, max) { //little random num gen function
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min - 1) + min);
    }

    _bugFire(timestamp) { //function to create bug projectiles
        if (timestamp - this.prevTime4 > this.__randomNumGen(this.minDelay, this.maxDelay)) { //so projectiles are fired at semi randomly timing intervals
            this.prevTime4 = timestamp;

            let bugAtRandomIndex = this.bugs[this.__randomNumGen(0, this.bugs.length)];
            let tempBugProj = new BugProjectile(bugAtRandomIndex.x + 20, bugAtRandomIndex.y + 20)

            spriteArray.push(tempBugProj);
            bugProjArray.push(tempBugProj);
            }
    }

    update(timestamp){ //basically all the game logic
        if (timestamp - this.prevTime3 > 25) {
            this.prevTime3 = timestamp;
            if (this.bugs.length != 0){ //level complete condition
                this._bugBorderCheck();
                this._bugFire(timestamp);
                this._events();
                this._collisions();

                for (let i = 0; i < spriteArray.length; i++) {
                    spriteArray[i].update()
                }
            } else { //make the game harder!
                if (this.speed < 50) {
                    this.speed += 10;
                }
                if (this.maxDelay > 2000) {
                    this.maxDelay -= 1000;
                }
                if (this.minDelay > 400) {
                    this.minDelay -= 200;
                }
                this.scorevalue += 10;
                //new bugs
                for (let i = 0; i < 10; i++) {
                    for (let t = 0; t < 5; t++) {
                        this.bugs.push(new Bug(i * 50, t * 50));
                    }
                }

            }
        }
    }

    animate(timestamp){ //animates all the bugs every 700ms
        if (timestamp - this.prevTime > 700) {
            this.prevTime = timestamp;
            frame = (frame + 1) % frames.length;
            if (this.shift == true){
                this.bugs.forEach(s => {
                    s.update(this.vx, 40);
                    if (s.y > 550) {
                        this.player.isAlive = false;
                    }
                });
                this.shift = false;
            }else{
                this.bugs.forEach(s => {
                    s.update(this.vx, 0);
                });
            }
        }
    }

    _explodedCheck() { //any explosions need to be drawn?
        if (this.explodedArray.length != 0) {
            this.explodedArray[0].draw()
            this.explodedArray.pop()
        }
    }

    drawFrame(timestamp) { //draws everything every 60ms
        if (timestamp - this.prevTime2 > 60) {
            this.prevTime2 = timestamp;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this._explodedCheck(); //checks if there are any explosion need to be drawn
            this.bugs.forEach(s => {
                s.draw();
            });
            for (let i = 0; i < spriteArray.length; i++) {
                spriteArray[i].draw()
            }
        }
    }

    deathScreen(timestamp){
        if (timestamp - this.prevTime2 > 250) {
            if (this.explodedArray.length < 1){ //this is i want a explosion to be rendered at the end.. but theres a bug were sometimes the explosion isnt drawn, so this is a work around
                this.explodedArray.push(new Explosion(this.player.x, this.player.y));
            }
            this.prevTime2 = timestamp;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frame = (frame + 1) % frames.length;
            this.bugs.forEach(s => {
                s.update(0, 0);
            });

            this.explodedArray.forEach(s => {
                s.draw()
            });
            this.bugs.forEach(s => {
                s.draw();
            });

            ctx.fillText('YOU DIED!', canvas.width / 2, canvas.height - canvas.height / 4);
            ctx.fillText('R to restart', canvas.width / 2, canvas.height - canvas.height / 4 + 50);
        }
    }
}

function gameloop(timestamp) {
    if (g.player.isAlive) {
        g.update(timestamp); /*update function looks for border check, makes new bugs projectiles
        then events, and then collisions in that order, update() runs the most out of all the functions*/

        g.animate(timestamp); //animates the bugs every 700ms

        g.drawFrame(timestamp); // draws everything to the screen every 60ms, the 60ms is to recreate the old feel :)

    } else {
        g.deathScreen(timestamp);
        if (KEYS["KeyR"]) {
            spriteArray.length = 0;
            bugProjArray.length = 0;
            projectileAlive = false;
            g = new Game();
        }
    }
    requestAnimationFrame(gameloop);
}

var g = new Game()


gameloop();
