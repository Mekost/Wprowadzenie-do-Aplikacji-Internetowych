// Get references to the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let points = 0;
const zombies = [];
const zombieImage = new Image();
zombieImage.src = "img/walkingdead.png";
let lives = 3;
const fullHeartImage = new Image();
const emptyHeartImage = new Image();
fullHeartImage.src = "img/full_heart.png";
emptyHeartImage.src = "img/empty_heart.png";
let gameRunning = true;
const cursorImage = new Image();
cursorImage.src = "img/aim.png";
let cursorX = 0;
let cursorY = 0;

// Zombie sprite properties
const zombieSprite = {
    frameWidth: 200, // Width of a single frame
    frameHeight: 312, // Height of a single frame
    frameCount: 10, // Total number of frames in the sprite sheet
    currentFrame: 0, // The current frame being displayed
    animationSpeed: 5, // Speed of animation (lower is faster)
    frameTimer: 0, // Timer to control animation speed
};

// Function to resize the canvas to fill the entire window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Function to draw the heart images
function drawHeart() {
    for (let i = 0; i < 3; i++) {
        const img = i < lives ? fullHeartImage : emptyHeartImage;
        ctx.drawImage(img, 10 + i * 110, 20, 100, 100); // Draw the heart
    }
}

function calculatingPoints() {
    ctx.font = "100px Arial";
    ctx.fillStyle = "white";
    if (points < 0) {
        ctx.fillText("-" + "0".repeat(4 - parseInt(Math.log10(Math.abs(points)))) + String(Math.abs(points)), window.innerWidth - 320, 100);
    }
    else {
        ctx.fillText("0".repeat(4 - parseInt(Math.log10(Math.abs(points)))) + String(points), window.innerWidth - 300, 100);
    }
}

// Ensure canvas resizes when the window is resized
window.addEventListener('resize', resizeCanvas);

// Initial resize to set the canvas size
resizeCanvas();

// Track mouse movement and update cursor position
canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    cursorX = event.clientX - rect.left; // Get mouse X relative to canvas
    cursorY = event.clientY - rect.top;  // Get mouse Y relative to canvas
});

// Draw the custom cursor in the animation loop
function drawCursor() {
    const cursorSize = 200; // Set the size of the custom cursor
    ctx.drawImage(cursorImage, cursorX - cursorSize / 2, cursorY - cursorSize / 2, cursorSize, cursorSize);
}

// Function to spawn a zombie
function spawnZombie() {
    const size = Math.random() * 50 + 100; // Random size between 30 and 80
    const yPosition = Math.random() * (canvas.height - size); // Random vertical position
    const speed = Math.random() * 2 + 10; // Random speed between 1 and 3

    zombies.push({
        x: canvas.width, // Start from the right edge of the screen
        y: yPosition,
        width: size,
        height: size,
        speed: speed,
        frame: 0, // Start with the first frame
        frameTimer: 0, // Timer for controlling frame animation
    });
}

// Function to update zombies' positions and animate them
function updateZombies() {
    for (let i = zombies.length - 1; i >= 0; i--) {
        const zombie = zombies[i];

        // Move zombie to the left
        zombie.x -= zombie.speed;

        // Update frame for animation
        zombie.frameTimer++;
        if (zombie.frameTimer >= zombieSprite.animationSpeed) {
            zombie.frame = (zombie.frame + 1) % zombieSprite.frameCount; // Cycle through frames
            zombie.frameTimer = 0;
        }

        // Remove zombies that are out of the screen
        if (zombie.x + zombie.width < 0) {
            zombies.splice(i, 1);
            lives--;
            checkGameOver();
            if (!gameRunning) return;
        }
    }
}

// Function to draw zombies with animated frames
function drawZombies() {
    zombies.forEach((zombie) => {
        const sx = zombie.frame * zombieSprite.frameWidth; // Source X in sprite sheet
        const sy = 0; // Source Y in sprite sheet (row is constant)

        ctx.drawImage(
            zombieImage,
            sx, sy, zombieSprite.frameWidth, zombieSprite.frameHeight, // Source rectangle
            zombie.x, zombie.y, zombie.width, zombie.height // Destination rectangle
        );
    });
}

function handleZombieClick(event) {
    const rect = canvas.getBoundingClientRect(); // Get canvas position
    const mouseX = event.clientX - rect.left; // Get mouse X coordinate relative to canvas
    const mouseY = event.clientY - rect.top; // Get mouse Y coordinate relative to canvas

    let zombieClicked = false; // Flag to check if a zombie was clicked

    for (let i = zombies.length - 1; i >= 0; i--) {
        const zombie = zombies[i];

        // Check if the click is within the zombie's bounding box
        if (
            mouseX >= zombie.x &&
            mouseX <= zombie.x + zombie.width &&
            mouseY >= zombie.y &&
            mouseY <= zombie.y + zombie.height
        ) {
            zombies.splice(i, 1); // Remove zombie from array
            points += 20; // Add points for clicking a zombie
            zombieClicked = true; // Set flag to true
            console.log(points);
            break; // Exit loop since only one zombie can be clicked at a time
        }
    }

    // If no zombie was clicked, reduce points
    if (!zombieClicked) {
        points -= 5;
        console.log(points);
    }
}

// Add mouse click listener to canvas
canvas.addEventListener('click', handleZombieClick);

// Main animation loop
function animate() {
    if (!gameRunning) return; // Stop the loop if the game is over
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Update and draw zombies
    updateZombies();
    drawZombies();

    drawHeart();
    calculatingPoints();

    drawCursor();

    requestAnimationFrame(animate); // Loop the animation
}

function checkGameOver() {
    if (lives <= 0) {
        endGame();
    }
}

function endGame() {
    gameRunning = false; // Stop the game
    // Display the game over screen
    const gameOverScreen = document.getElementById("gameOverScreen");
    gameOverScreen.style.display = "block";
}

function restartGame() {
    // Reset game state
    lives = 3;
    points = 0;
    zombies.length = 0; // Clear existing zombies
    gameRunning = true;

    // Hide the game over screen
    const gameOverScreen = document.getElementById("gameOverScreen");
    gameOverScreen.style.display = "none";

    // Restart the animation
    animate();
}

// Spawn zombies every 1 second
setInterval(spawnZombie, 2000);

// Start the animation loop
animate();

