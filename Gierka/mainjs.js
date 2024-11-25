const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let points = 0;
let lives = 3;
let gameRunning = true;
let cursorX = 0;
let cursorY = 0;
const zombies = [];
const zombieImage = new Image();
zombieImage.src = "img/walkingdead.png";
const fullHeartImage = new Image();
fullHeartImage.src = "img/full_heart.png";
const emptyHeartImage = new Image();
emptyHeartImage.src = "img/empty_heart.png";
const cursorImage = new Image();
cursorImage.src = "img/aim.png";
const sadMusic = document.getElementById("sadMusic");

const zombieSprite = {
    frameWidth: 200, 
    frameHeight: 312, 
    frameCount: 10,
    currentFrame: 0, 
    animationSpeed: 5, 
    frameTimer: 0, 
};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawHeart() {
    for (let i = 0; i < 3; i++) {
        const img = i < lives ? fullHeartImage : emptyHeartImage;
        ctx.drawImage(img, 10 + i * 110, 20, 100, 100); 
    }
}

function calculatingPoints() {
    ctx.font = "100px Arial";
    ctx.fillStyle = "white";
    if (points < 0) {
        ctx.fillText("-" + "0".repeat(4 - parseInt(Math.log10(Math.abs(points)))) + String(Math.abs(points)), window.innerWidth - 320, 100);
    }
    else if (points > 0) {
        ctx.fillText("0".repeat(4 - parseInt(Math.log10(Math.abs(points)))) + String(points), window.innerWidth - 300, 100);
    }
    else {
        ctx.fillText("00000", window.innerWidth - 300, 100);
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    cursorX = event.clientX - rect.left; 
    cursorY = event.clientY - rect.top; 
});

function drawCursor() {
    const cursorSize = 200; 
    ctx.drawImage(cursorImage, cursorX - cursorSize / 2, cursorY - cursorSize / 2, cursorSize, cursorSize);
}

function spawnZombie() {
    const size = Math.random() * 50 + 100; 
    const yPosition = Math.random() * (canvas.height - size);
    const speed = Math.random() * 2 + 5; 

    zombies.push({
        x: canvas.width, 
        y: yPosition,
        width: size,
        height: size,
        speed: speed,
        frame: 0, 
        frameTimer: 0, 
    });
}

function updateZombies() {
    for (let i = zombies.length - 1; i >= 0; i--) {
        const zombie = zombies[i];

        zombie.x -= zombie.speed;

        zombie.frameTimer++;
        if (zombie.frameTimer >= zombieSprite.animationSpeed) {
            zombie.frame = (zombie.frame + 1) % zombieSprite.frameCount;
            zombie.frameTimer = 0;
        }

        if (zombie.x + zombie.width < 0) {
            zombies.splice(i, 1);
            lives--;
            checkGameOver();
            if (!gameRunning) return;
        }
    }
}

function drawZombies() {
    zombies.forEach((zombie) => {
        const sx = zombie.frame * zombieSprite.frameWidth;
        const sy = 0; 

        ctx.drawImage(
            zombieImage,
            sx, sy, zombieSprite.frameWidth, zombieSprite.frameHeight,
            zombie.x, zombie.y, zombie.width, zombie.height
        );
    });
}

function handleZombieClick(event) {
    const rect = canvas.getBoundingClientRect(); 
    const mouseX = event.clientX - rect.left; 
    const mouseY = event.clientY - rect.top; 

    let zombieClicked = false; 

    for (let i = zombies.length - 1; i >= 0; i--) {
        const zombie = zombies[i];
        if (
            mouseX >= zombie.x &&
            mouseX <= zombie.x + zombie.width &&
            mouseY >= zombie.y &&
            mouseY <= zombie.y + zombie.height
        ) {
            zombies.splice(i, 1);
            points += 20; 
            zombieClicked = true; 
            break;
        }
    }

    if (!zombieClicked) {
        points -= 5;
        console.log(points);
    }
}


canvas.addEventListener('click', handleZombieClick);


function animate() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    updateZombies();
    drawZombies();

    drawHeart();
    calculatingPoints();

    drawCursor();

    requestAnimationFrame(animate);
}

function checkGameOver() {
    if (lives <= 0) {
        endGame();
    }
}

function endGame() {
    gameRunning = false;
    const gameOverScreen = document.getElementById("gameOverScreen");
    gameOverScreen.style.display = "block";
    sadMusic.currentTime = 0; 
    sadMusic.play();
}

function restartGame() {
    lives = 3;
    points = 0;
    zombies.length = 0; 
    gameRunning = true;

    const gameOverScreen = document.getElementById("gameOverScreen");
    gameOverScreen.style.display = "none";

    sadMusic.pause();
    sadMusic.currentTime = 0;

    animate();
}

setInterval(spawnZombie, 2000);

animate();

