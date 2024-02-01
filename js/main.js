
// when animating on canvas, it is best to use requestAnimationFrame instead of setTimeout or setInterval
// not supported in all browsers though and sometimes needs a prefix, so we need a shim
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
// now we will setup our basic variables for the demo
var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    // full screen dimensions
    cw = window.innerWidth,
    ch = window.innerHeight,
    // firework collection
    hearts = [],
    // particle collection
    particles = [],
    // starting hue
    hue = 120,
    // when launching hearts with a click, too many get launched at once without a limiter, one launch per 5 loop ticks
    limiterTotal = 5,
    limiterTick = 0,
    // this will time the auto launches of hearts, one launch per 80 loop ticks
    timerTotal = 80,
    timerTick = 0,
    mousedown = false,
    // mouse x coordinate,
    mx,
    // mouse y coordinate
    my;
// set canvas dimensions
canvas.width = cw;
canvas.height = ch;
// now we are going to setup our function placeholders for the entire demo
// get a random number within a range
function random(min, max) {
    return Math.random() * (max - min) + min;
}
// calculate the distance between two points
function calculateDistance(p1x, p1y, p2x, p2y) {
    var xDistance = p1x - p2x,
        yDistance = p1y - p2y;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}
// create firework
// Tạo hình trái tim
class Heart {
    constructor() {
        this.draw = function () {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.size);
            ctx.bezierCurveTo(this.x, this.y, this.x - this.size, this.y, this.x - this.size, this.y + this.size);
            ctx.bezierCurveTo(this.x - this.size, this.y + this.size * 2, this.x, this.y + this.size * 3, this.x, this.y + this.size * 3);
            ctx.bezierCurveTo(this.x + this.size, this.y + this.size * 3, this.x + this.size, this.y + this.size * 2, this.x + this.size, this.y + this.size);
            ctx.bezierCurveTo(this.x + this.size, this.y, this.x, this.y, this.x, this.y + this.size);
            ctx.fillStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
            ctx.fill();
        };
    }
    // Cập nhật và vẽ hình trái tim
    update(index) {
        this.brightness = random(50, 70);
        this.x = random(0, cw);
        this.y = random(0, ch);
        this.size = random(5, 45);
        this.draw();
    }
}

// create particle
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        // set a random angle in all possible directions, in radians
        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 10);
        // friction will slow the particle down
        this.friction = 0.95;
        // gravity will be applied and pull the particle down
        this.gravity = 1;
        // set the hue to a random number +-20 of the overall hue variable
        this.hue = random(hue - 20, hue + 20);
        this.brightness = random(50, 80);
        this.alpha = 1;
        // set how fast the particle fades out
        this.decay = random(0.015, 0.03);
    }
    // update particle
    update(index) {
        // remove last item in coordinates array
        this.coordinates.pop();
        // add current coordinates to the start of the array
        this.coordinates.unshift([this.x, this.y]);
        // slow down the particle
        this.speed *= this.friction;
        // apply velocity
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        // fade out the particle
        this.alpha -= this.decay;
        // remove the particle once the alpha is low enough, based on the passed in index
        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }
    // draw particle
    draw() {
        ctx.beginPath();
        // move to the last tracked coordinates in the set, then draw a line to the current x and y
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
        ctx.stroke();
    }
}
// create particle group/explosion
function createParticles(x, y) {
    // increase the particle count for a bigger explosion, beware of the canvas performance hit with the increased particles though
    var particleCount = 30;
    while (particleCount--) {
        particles.push(new Particle(x, y));
    }
}
// Tạo hình trái tim mới
function createHearts() {
    var heart = new Heart();
    heart.update();
}
// main demo loop
function loop() {
    // this function will run endlessly with requestAnimationFrame
    requestAnimFrame(loop);
    // increase the hue to get different colored hearts over time
    hue += 0.5;
    // normally, clearRect() would be used to clear the canvas
    // we want to create a trailing effect though
    // setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
    ctx.globalCompositeOperation = 'destination-out';
    // decrease the alpha property to create more prominent trails
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillRect(0, 0, cw, ch);
    // change the composite operation back to our main mode
    // lighter creates bright highlight points as the hearts and particles overlap each other
    ctx.globalCompositeOperation = 'lighter';
    // loop over each firework, draw it, update it
    var i = hearts.length; // Số lượng hình trái tim
    while (i--) {
        createHearts(); // Tạo hình trái tim ngẫu nhiên
        /* hearts[i].draw();
        hearts[i].update(i); */
    }
    // loop over each particle, draw it, update it
    var i = particles.length;
    while (i--) {
        particles[i].draw();
        particles[i].update(i);
    }
    // launch hearts automatically to random coordinates, when the mouse isn't down
    if (timerTick >= timerTotal) {
        if (!mousedown) {
            // start the firework at the bottom middle of the screen, then set the random target coordinates, the random y coordinates will be set within the range of the top half of the screen
            hearts.push(new Heart(cw / 2, ch, random(0, cw), random(0, ch / 2)));
            timerTick = 0;
        }
    } else {
        timerTick++;
    }
    // limit the rate at which hearts get launched when mouse is down
    if (limiterTick >= limiterTotal) {
        if (mousedown) {
            // start the firework at the bottom middle of the screen, then set the current mouse coordinates as the target
            hearts.push(new Heart(cw / 2, ch, mx, my));
            limiterTick = 0;
        }
    } else {
        limiterTick++;
    }
}
// mouse event bindings
// update the mouse coordinates on mousemove
canvas.addEventListener('mousemove', function (e) {
    mx = e.pageX - canvas.offsetLeft;
    my = e.pageY - canvas.offsetTop;
});
// toggle mousedown state and prevent canvas from being selected
canvas.addEventListener('mousedown', function (e) {
    e.preventDefault();
    mousedown = true;
});
canvas.addEventListener('mouseup', function (e) {
    e.preventDefault();
    mousedown = false;
});
// once the window loads, we are ready for some hearts!
window.onload = loop;