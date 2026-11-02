/* ==========================================
   CINEMATIC PIXEL STARFIELD
   ========================================== */

// ---------- EASY SETTINGS ----------

const CONFIG = {
    starCount: 1000,

    // Complete one revolution every 120 seconds
    rotationDuration: 60,

    // Orbit center: near the character
    centerX: 0.50,
    centerY: 0.48,

    // Sky boundary
    skyHeight: 0.74,

    // Star sizes in pixels
    minSize: 1,
    maxSize: 3,

    // Brightness range
    minBrightness: 0.35,
    maxBrightness: 0.90,

    // Character exclusion zone
    characterRadiusX: 0.065,
    characterRadiusY: 0.19,

    // Space between character and stars
    characterPadding: 0.025
};


// ---------- CANVAS SETUP ----------

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

const scene = document.querySelector(".scene");

let width;
let height;

let stars = [];
let animationAngle = 0;
let previousTime = null;


// ---------- RESIZE ----------

function resizeCanvas() {

    const rect = scene.getBoundingClientRect();

    width = rect.width;
    height = rect.height;

    canvas.width = width;
    canvas.height = height;

    createStars();
}


// ---------- GENERATE STARFIELD ----------

function createStars() {

    stars = [];

    const centerX = width * CONFIG.centerX;
    const centerY = height * CONFIG.centerY;

    const maxRadius = Math.max(width, height);

    for (let i = 0; i < CONFIG.starCount; i++) {

        const angle = Math.random() * Math.PI * 2;

        // Circular distribution around the center
        const radius = Math.sqrt(Math.random()) * maxRadius;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        stars.push({

            // Fixed original position
            x: x,
            y: y,

            size:
                CONFIG.minSize +
                Math.random() *
                (CONFIG.maxSize - CONFIG.minSize),

            brightness:
                CONFIG.minBrightness +
                Math.random() *
                (CONFIG.maxBrightness -
                 CONFIG.minBrightness)

        });
    }
}


// ---------- CHARACTER EXCLUSION ----------

function isInsideCharacter(x, y) {

    const centerX = width * CONFIG.centerX;
    const centerY = height * CONFIG.centerY;

    const radiusX =
        width *
        (CONFIG.characterRadiusX +
         CONFIG.characterPadding);

    const radiusY =
        height *
        (CONFIG.characterRadiusY +
         CONFIG.characterPadding);

    const dx = (x - centerX) / radiusX;
    const dy = (y - centerY) / radiusY;

    // Elliptical exclusion zone
    return dx * dx + dy * dy < 1;
}


// ---------- ANIMATION ----------

function animate(time) {

    if (previousTime === null) {
        previousTime = time;
    }

    const deltaTime = time - previousTime;

    previousTime = time;

    // Smooth, continuous rotation
    animationAngle +=
        (Math.PI * 2 * deltaTime) /
        (CONFIG.rotationDuration * 1000);

    // Keep angle within one revolution
    animationAngle %= Math.PI * 2;

    ctx.clearRect(0, 0, width, height);

    // Clip stars to the sky
    ctx.save();

    ctx.beginPath();

    ctx.rect(
        0,
        0,
        width,
        height * CONFIG.skyHeight
    );

    ctx.clip();

    const centerX = width * CONFIG.centerX;
    const centerY = height * CONFIG.centerY;

    const cos = Math.cos(animationAngle);
    const sin = Math.sin(animationAngle);

    // Rotate entire starfield as one unit
    stars.forEach(star => {

        const x =
            centerX +
            star.x * cos -
            star.y * sin;

        const y =
            centerY +
            star.x * sin +
            star.y * cos;

        // Exclude the character
        if (isInsideCharacter(x, y)) {
            return;
        }

        // Exclude anything below the sky
        if (y >= height * CONFIG.skyHeight) {
            return;
        }

        ctx.globalAlpha = star.brightness;

        ctx.fillStyle = "#ffffff";

        // Sharp pixel edges
        ctx.fillRect(
            Math.round(x),
            Math.round(y),
            Math.max(1, Math.round(star.size)),
            Math.max(1, Math.round(star.size))
        );

    });

    ctx.restore();

    ctx.globalAlpha = 1;

    requestAnimationFrame(animate);
}


// ---------- START ----------

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

requestAnimationFrame(animate);
