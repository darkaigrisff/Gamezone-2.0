"use strict";

/*
=========================================================
 GAME ZONE — SPACE BATTLE
 MOTEUR 2D HORIZONTAL
=========================================================
*/

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gameMusic = document.getElementById("gameMusic");

const lobbyScreen = document.getElementById("lobbyScreen");
const chapterScreen = document.getElementById("chapterScreen");
const levelScreen = document.getElementById("levelScreen");
const gameScreen = document.getElementById("gameScreen");

const startButton = document.getElementById("startButton");
const levelGrid = document.getElementById("levelGrid");

const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const restartButton = document.getElementById("restartButton");
const quitButton = document.getElementById("quitButton");

const pauseOverlay = document.getElementById("pauseOverlay");
const resultOverlay = document.getElementById("resultOverlay");

const nextLevelButton =
    document.getElementById("nextLevelButton");

const returnLevelsButton =
    document.getElementById("returnLevelsButton");


/* =========================================================
   CANVAS
========================================================= */

let W = innerWidth;
let H = innerHeight;
let DPR = Math.min(devicePixelRatio || 1, 2);

function resizeCanvas() {

    W = innerWidth;
    H = innerHeight;

    DPR = Math.min(devicePixelRatio || 1, 2);

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(
        DPR, 0, 0, DPR, 0, 0
    );
}

addEventListener("resize", resizeCanvas);
resizeCanvas();


/* =========================================================
   CHAPITRES
========================================================= */

const CHAPTERS = {

    1: {
        name: "PLANÈTE NOCTURNE",
        icon: "🌑",
        description:
            "Stations abandonnées, créatures du vide et drones.",
        music: "the_elder.mp3"
    },

    2: {
        name: "ROYAUME DE GLACE",
        icon: "❄️",
        description:
            "Tempêtes, glaciers et créatures glacées.",
        music: "my.mp3"
    },

    3: {
        name: "MONDE SAUVAGE",
        icon: "🌳",
        description:
            "Jungle, marais, racines et créatures.",
        music: "my.mp3"
    },

    4: {
        name: "TERRE RPG",
        icon: "🔮",
        description:
            "Ruines, magie, cristaux et dragons.",
        music: "rpg.mp3"
    },

    5: {
        name: "GUERRE DES BOSS",
        icon: "👑",
        description:
            "Des combats gigantesques contre les Boss.",
        music: "the_elder.mp3"
    }

};


/* =========================================================
   ÉTAT
========================================================= */

const game = {

    chapter: 1,
    level: 1,

    worldWidth: 7200,
    worldHeight: 720,

    paused: false,
    finished: false,
    dead: false,

    cameraX: 0,
    cameraY: 0,

    coins:
        Number(localStorage.getItem(
            "spaceBattleCoins"
        )) || 0,

    fragments:
        Number(localStorage.getItem(
            "spaceBattleFragments"
        )) || 0,

    platforms: [],
    enemies: [],
    projectiles: [],
    enemyProjectiles: [],
    particles: [],
    decorations: [],

    goalX: 6700,

    shake: 0,

    lastTime: 0,

    attackCooldown: 0,

    levelRewardCoins: 0,
    levelRewardFragments: 0

};


/* =========================================================
   PHYSIQUE
========================================================= */

const SOL_Y = 520;

const GRAVITY = 0.72;

const PLAYER_WIDTH = 46;
const PLAYER_HEIGHT = 76;

const PLAYER_SPEED = 5.8;
const PLAYER_ACCELERATION = 38;
const PLAYER_FRICTION = 34;

const JUMP_POWER = 14.5;


/* =========================================================
   JOUEUR
========================================================= */

const player = {

    x: 180,

    y:
        SOL_Y -
        PLAYER_HEIGHT,

    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,

    vx: 0,
    vy: 0,

    grounded: true,

    direction: 1,

    hearts: 4,
    maxHearts: 4,

    invincible: 0,

    attackTimer: 0,
    attackDuration: 0,

    animTime: 0,

    state: "idle"

};


/* =========================================================
   INPUT
========================================================= */

const keys = {

    left: false,
    right: false,

    jumpPressed: false,
    attackPressed: false

};

document.addEventListener("keydown", event => {

    if (
        event.code === "ArrowLeft" ||
        event.code === "KeyA"
    ) {

        keys.left = true;
        event.preventDefault();

    }

    if (
        event.code === "ArrowRight" ||
        event.code === "KeyD"
    ) {

        keys.right = true;
        event.preventDefault();

    }

    if (
        event.code === "Space" ||
        event.code === "ArrowUp" ||
        event.code === "KeyW"
    ) {

        if (!event.repeat) {
            keys.jumpPressed = true;
        }

        event.preventDefault();

    }

    if (
        event.code === "KeyZ" ||
        event.code === "Enter"
    ) {

        if (!event.repeat) {
            keys.attackPressed = true;
        }

        event.preventDefault();

    }

    unlockAudio();

});


document.addEventListener("keyup", event => {

    if (
        event.code === "ArrowLeft" ||
        event.code === "KeyA"
    ) {
        keys.left = false;
    }

    if (
        event.code === "ArrowRight" ||
        event.code === "KeyD"
    ) {
        keys.right = false;
    }

});


/* =========================================================
   AUDIO
========================================================= */

let audioUnlocked = false;

function unlockAudio() {

    if (audioUnlocked) return;

    audioUnlocked = true;

    if (!gameMusic) return;

    gameMusic.volume = 0.42;

    gameMusic.play().catch(() => {});

}


function playChapterMusic() {

    if (!gameMusic) return;

    const track =
        CHAPTERS[game.chapter].music;

    if (
        gameMusic.getAttribute("src") !== track
    ) {

        gameMusic.src = track;

    }

    gameMusic.play().catch(() => {});

}


/* =========================================================
   UTILITAIRES
========================================================= */

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );

}


function lerp(a, b, amount) {

    return a + (b - a) * amount;

}


function random(min, max) {

    return (
        Math.random() *
        (max - min)
    ) + min;

}


function rectsOverlap(a, b) {

    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function showScreen(screen) {

    document
        .querySelectorAll(".screen")
        .forEach(s =>
            s.classList.remove("active")
        );

    screen.classList.add("active");

}


function openChapters() {

    updateCurrencies();

    showScreen(chapterScreen);

}


function openLevels(chapter) {

    game.chapter = chapter;

    const data = CHAPTERS[chapter];

    document.getElementById(
        "levelChapterLabel"
    ).textContent =
        "CHAPITRE " + chapter;

    document.getElementById(
        "levelChapterName"
    ).textContent =
        data.name;

    document.getElementById(
        "levelDescription"
    ).textContent =
        data.description;

    document.getElementById(
        "selectedChapterIcon"
    ).textContent =
        data.icon;

    buildLevelButtons();

    updateCurrencies();

    showScreen(levelScreen);

}


function openGame() {

    showScreen(gameScreen);

    resetLevel();

    playChapterMusic();

}


/* =========================================================
   NIVEAUX
========================================================= */

function levelCount(chapter) {

    return chapter === 5
        ? 5
        : 10;

}


function completedKey(chapter, level) {

    return (
        "spaceBattleCompleted_" +
        chapter +
        "_" +
        level
    );

}


function isLevelCompleted(chapter, level) {

    return (
        localStorage.getItem(
            completedKey(chapter, level)
        ) === "1"
    );

}


function isLevelUnlocked(chapter, level) {

    if (
        chapter === 1 &&
        level === 1
    ) {
        return true;
    }

    if (level > 1) {

        return isLevelCompleted(
            chapter,
            level - 1
        );

    }

    const previousChapter =
        chapter - 1;

    if (previousChapter < 1) {
        return true;
    }

    return isLevelCompleted(
        previousChapter,
        levelCount(previousChapter)
    );

}


function buildLevelButtons() {

    levelGrid.innerHTML = "";

    const count =
        levelCount(game.chapter);

    for (
        let level = 1;
        level <= count;
        level++
    ) {

        const button =
            document.createElement("button");

        const boss =
            level === 10 ||
            game.chapter === 5;

        const unlocked =
            isLevelUnlocked(
                game.chapter,
                level
            );

        button.className =
            "levelCard" +
            (boss ? " bossLevel" : "") +
            (!unlocked ? " locked" : "");

        button.innerHTML = `
            <span class="levelNumber">
                ${level}
            </span>

            <small>
                ${
                    boss
                        ? "BOSS"
                        : unlocked
                            ? "DISPONIBLE"
                            : "VERROUILLÉ"
                }
            </small>
        `;

        button.addEventListener(
            "click",
            () => {

                if (!unlocked) return;

                game.level = level;

                openGame();

            }
        );

        levelGrid.appendChild(button);

    }

}


/* =========================================================
   MONNAIES
========================================================= */

function saveCurrencies() {

    localStorage.setItem(
        "spaceBattleCoins",
        String(game.coins)
    );

    localStorage.setItem(
        "spaceBattleFragments",
        String(game.fragments)
    );

}


function updateCurrencies() {

    const ids = [

        ["lobbyCoins", game.coins],
        ["lobbyFragments", game.fragments],
        ["chapterCoins", game.coins],
        ["levelCoins", game.coins],
        ["gameCoins", game.coins],
        ["gameFragments", game.fragments]

    ];

    ids.forEach(([id, value]) => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    });

}


/* =========================================================
   RESET NIVEAU
========================================================= */

function resetLevel() {

    game.paused = false;
    game.finished = false;
    game.dead = false;

    game.cameraX = 0;
    game.cameraY = 0;

    game.platforms = [];
    game.enemies = [];
    game.projectiles = [];
    game.enemyProjectiles = [];
    game.particles = [];
    game.decorations = [];

    game.goalX =
        game.chapter === 5 ||
        game.level === 10
            ? 6250
            : 6700;

    game.shake = 0;

    player.x = 180;

    player.y =
        SOL_Y -
        PLAYER_HEIGHT;

    player.vx = 0;
    player.vy = 0;

    player.grounded = true;

    player.direction = 1;

    player.hearts =
        player.maxHearts;

    player.invincible = 0;

    player.attackTimer = 0;
    player.attackDuration = 0;

    player.state = "idle";

    game.levelRewardCoins = 0;
    game.levelRewardFragments = 0;

    generateLevel();

    updateCamera();

    updateHUD();

    pauseOverlay.classList.remove("show");
    resultOverlay.classList.remove("show");

}


/* =========================================================
   PLATEFORMES
========================================================= */

function addPlatform(
    x,
    y,
    width,
    height = 18
) {

    game.platforms.push({
        x,
        y,
        width,
        height
    });

}


function generatePlatforms() {

    const positions = [

        [520, 410, 180],
        [920, 350, 210],
        [1370, 420, 190],
        [1780, 335, 230],
        [2260, 395, 210],
        [2700, 315, 190],
        [3150, 390, 240],
        [3650, 335, 190],
        [4110, 420, 210],
        [4550, 320, 230],
        [5000, 380, 200],
        [5450, 300, 220],
        [5900, 390, 220],
        [6350, 330, 240]

    ];

    positions.forEach(p =>
        addPlatform(
            p[0],
            p[1],
            p[2]
        )
    );

}


/* =========================================================
   DÉCORATIONS
========================================================= */

function generateDecorations() {

    for (
        let x = 100;
        x < game.worldWidth;
        x += random(220, 390)
    ) {

        game.decorations.push({

            x,

            y:
                SOL_Y -
                random(30, 100),

            size:
                random(35, 80),

            type:
                game.chapter

        });

    }

}


/* =========================================================
   ENNEMIS
========================================================= */

const ENEMY_TYPES = {

    skeleton: {
        name: "SQUELETTE",
        color: "#d8d8d8",
        accent: "#777777",
        projectile: "#e5e5e5"
    },

    alien: {
        name: "ALIEN",
        color: "#72e37e",
        accent: "#257a39",
        projectile: "#72ff91"
    },

    purple: {
        name: "CRÉATURE POURPRE",
        color: "#b35cff",
        accent: "#592080",
        projectile: "#d06cff"
    },

    strange: {
        name: "CRÉATURE ÉTRANGE",
        color: "#f08cff",
        accent: "#4e2360",
        projectile: "#ff78e8"
    },

    machine: {
        name: "DRONE MÉCANIQUE",
        color: "#8da4c7",
        accent: "#263b5c",
        projectile: "#65dfff"
    },

    dragon: {
        name: "DRAGON DU VIDE",
        color: "#ff704f",
        accent: "#721e29",
        projectile: "#ff5533"
    }

};


function enemyTypeForChapter(
    chapter,
    index
) {

    const sets = {

        1: [
            "alien",
            "strange",
            "alien",
            "machine"
        ],

        2: [
            "skeleton",
            "alien",
            "strange",
            "machine"
        ],

        3: [
            "purple",
            "strange",
            "purple",
            "alien"
        ],

        4: [
            "skeleton",
            "purple",
            "strange",
            "dragon"
        ],

        5: [
            "skeleton",
            "alien",
            "purple",
            "strange",
            "dragon"
        ]

    };

    const set =
        sets[chapter] ||
        sets[1];

    return set[
        index % set.length
    ];

}


function difficulty() {

    const lv =
        clamp(
            game.level,
            1,
            9
        );

    return {

        count:
            Math.floor(
                7 +
                (lv - 1) * 5
            ),

        speed:
            1.15 +
            (lv - 1) * .13,

        attackDelay:
            Math.max(
                600,
                1800 -
                (lv - 1) * 130
            ),

        chase:
            250 +
            (lv - 1) * 25

    };

}


/* =========================================================
   AJOUT ENNEMI
========================================================= */

function addEnemy(
    x,
    type,
    isBoss = false
) {

    const d =
        difficulty();

    const enemyLevel =
        isBoss
            ? game.chapter * 10 + 10
            : game.chapter * 10 + game.level;

    let width =
        isBoss ? 115 : 48;

    let height =
        isBoss ? 135 : 72;

    const enemy = {

        x,

        y:
            SOL_Y -
            height,

        width,
        height,

        vx: 0,
        vy: 0,

        grounded: true,

        type,

        level: enemyLevel,

        isBoss,

        hp:
            isBoss
                ? 900 + game.level * 80
                : 100,

        maxHp:
            isBoss
                ? 900 + game.level * 80
                : 100,

        speed:
            isBoss
                ? 1.35
                : d.speed,

        attackDelay:
            isBoss
                ? 750
                : d.attackDelay,

        attackTimer:
            random(250, 900),

        chase:
            isBoss
                ? 700
                : d.chase,

        hitFlash: 0,

        phase:
            random(
                0,
                Math.PI * 2
            ),

        direction: -1,

        alive: true,

        shotCooldown:
            random(500, 1200),

        attackRange:
            isBoss
                ? 520
                : 430

    };


    const platform =
        findSpawnPlatform(
            x,
            width
        );

    if (platform) {

        enemy.y =
            platform.y -
            height;

    }

    game.enemies.push(enemy);

}


function findSpawnPlatform(
    x,
    width
) {

    for (
        const platform
        of game.platforms
    ) {

        if (
            x + width > platform.x &&
            x < platform.x + platform.width
        ) {

            return platform;

        }

    }

    return null;

}


/* =========================================================
   GÉNÉRATION DES ENNEMIS
========================================================= */

function generateEnemies() {

    const bossLevel =
        game.level === 10 ||
        game.chapter === 5;

    if (bossLevel) {

        const bossTypes = [
            "skeleton",
            "alien",
            "purple",
            "strange",
            "dragon"
        ];

        if (game.chapter === 5) {

            const positions = [
                1400,
                2700,
                4000,
                5300
            ];

            positions.forEach(
                (x, index) => {

                    addEnemy(
                        x,
                        bossTypes[
                            index %
                            bossTypes.length
                        ],
                        true
                    );

                }
            );

        } else {

            addEnemy(
                5200,
                enemyTypeForChapter(
                    game.chapter,
                    4
                ),
                true
            );

        }

        return;

    }


    const d =
        difficulty();

    const spacing =
        (
            game.goalX - 900
        ) / d.count;

    for (
        let i = 0;
        i < d.count;
        i++
    ) {

        addEnemy(
            750 + i * spacing,
            enemyTypeForChapter(
                game.chapter,
                i
            )
        );

    }

}


/* =========================================================
   NIVEAU
========================================================= */

function generateLevel() {

    generatePlatforms();

    generateDecorations();

    generateEnemies();

}


/* =========================================================
   COLLISION JOUEUR
========================================================= */

function resolvePlayerGround(
    previousBottom
) {

    const currentBottom =
        player.y +
        player.height;

    if (
        player.vy >= 0 &&
        previousBottom <= SOL_Y &&
        currentBottom >= SOL_Y
    ) {

        player.y =
            SOL_Y -
            player.height;

        player.vy = 0;
        player.grounded = true;

        return true;

    }

    return false;

}


function resolvePlayerPlatforms(
    previousBottom
) {

    if (player.vy < 0) {
        return false;
    }

    const currentBottom =
        player.y +
        player.height;

    for (
        const platform
        of game.platforms
    ) {

        const horizontal =
            player.x +
            player.width >
            platform.x &&
            player.x <
            platform.x +
            platform.width;

        if (!horizontal) continue;

        if (
            previousBottom <= platform.y &&
            currentBottom >= platform.y
        ) {

            player.y =
                platform.y -
                player.height;

            player.vy = 0;
            player.grounded = true;

            return true;

        }

    }

    return false;

}


/* =========================================================
   JOUEUR
========================================================= */

function updatePlayer(dt) {

    if (game.dead) return;

    const seconds =
        dt / 1000;

    player.animTime += dt;

    if (player.invincible > 0) {
        player.invincible -= dt;
    }

    if (player.attackTimer > 0) {
        player.attackTimer -= dt;
    }

    if (player.attackDuration > 0) {
        player.attackDuration -= dt;
    }


    let targetVelocity = 0;

    if (keys.left) {

        targetVelocity =
            -PLAYER_SPEED;

        player.direction = -1;

    }

    if (keys.right) {

        targetVelocity =
            PLAYER_SPEED;

        player.direction = 1;

    }


    if (targetVelocity !== 0) {

        const acceleration =
            PLAYER_ACCELERATION *
            seconds;

        if (
            player.vx <
            targetVelocity
        ) {

            player.vx =
                Math.min(
                    player.vx + acceleration,
                    targetVelocity
                );

        } else if (
            player.vx >
            targetVelocity
        ) {

            player.vx =
                Math.max(
                    player.vx - acceleration,
                    targetVelocity
                );

        }

    } else {

        const friction =
            PLAYER_FRICTION *
            seconds;

        if (player.vx > 0) {

            player.vx =
                Math.max(
                    0,
                    player.vx - friction
                );

        }

        if (player.vx < 0) {

            player.vx =
                Math.min(
                    0,
                    player.vx + friction
                );

        }

    }


    if (
        keys.jumpPressed &&
        player.grounded
    ) {

        player.vy =
            -JUMP_POWER;

        player.grounded = false;

        player.state = "jump";

        createJumpParticles();

    }

    keys.jumpPressed = false;


    player.x += player.vx;

    player.x =
        clamp(
            player.x,
            0,
            game.worldWidth -
            player.width
        );


    const previousBottom =
        player.y +
        player.height;

    player.vy += GRAVITY;

    player.vy =
        Math.min(
            player.vy,
            22
        );

    player.y += player.vy;

    player.grounded = false;


    const landed =
        resolvePlayerPlatforms(
            previousBottom
        );

    if (!landed) {

        resolvePlayerGround(
            previousBottom
        );

    }


    if (!player.grounded) {

        player.state = "jump";

    } else if (
        Math.abs(player.vx) > .3
    ) {

        player.state = "run";

    } else {

        player.state = "idle";

    }


    if (keys.attackPressed) {
        attack();
    }

    keys.attackPressed = false;

}


/* =========================================================
   ATTAQUE JOUEUR
========================================================= */

function attack() {

    if (
        game.paused ||
        game.finished ||
        game.dead
    ) {
        return;
    }

    if (game.attackCooldown > 0) {
        return;
    }

    game.attackCooldown = 280;

    player.attackTimer = 280;
    player.attackDuration = 220;
    player.state = "attack";

    const range = 105;

    const attackBox = {

        x:
            player.direction === 1
                ? player.x + player.width - 5
                : player.x - range + 5,

        y:
            player.y + 18,

        width: range,
        height: 45

    };


    for (
        const enemy
        of game.enemies
    ) {

        if (!enemy.alive) continue;

        if (
            !rectsOverlap(
                attackBox,
                enemy
            )
        ) {
            continue;
        }

        const damage =
            enemy.isBoss
                ? 55
                : 100;

        enemy.hp -= damage;

        enemy.hitFlash = 130;

        createHitParticles(
            enemy.x +
            enemy.width / 2,
            enemy.y +
            enemy.height / 2
        );

        game.shake =
            enemy.isBoss
                ? 8
                : 3;

        if (enemy.hp <= 0) {
            killEnemy(enemy);
        }

    }

}


/* =========================================================
   MORT ENNEMI
========================================================= */

function killEnemy(enemy) {

    if (!enemy.alive) return;

    enemy.alive = false;
    enemy.hp = 0;

    if (enemy.isBoss) {

        game.coins += 500;
        game.fragments += 100;

        game.levelRewardCoins += 500;
        game.levelRewardFragments += 100;

    } else {

        game.coins += 20;
        game.levelRewardCoins += 20;

    }

    createExplosion(
        enemy.x +
        enemy.width / 2,
        enemy.y +
        enemy.height / 2,
        enemy.isBoss
    );

    saveCurrencies();

    checkBossVictory();

}


/* =========================================================
   ATTAQUES ENNEMIES
========================================================= */

function enemyShoot(enemy) {

    if (!enemy.alive) return;

    const targetX =
        player.x +
        player.width / 2;

    const targetY =
        player.y +
        player.height / 2;

    const startX =
        enemy.x +
        enemy.width / 2;

    const startY =
        enemy.y +
        enemy.height * .42;

    const dx =
        targetX -
        startX;

    const dy =
        targetY -
        startY;

    const length =
        Math.hypot(dx, dy) || 1;

    const speed =
        enemy.isBoss
            ? 7
            : 5.2;

    const typeData =
        ENEMY_TYPES[
            enemy.type
        ] ||
        ENEMY_TYPES.alien;

    game.enemyProjectiles.push({

        x: startX,
        y: startY,

        vx:
            dx / length *
            speed,

        vy:
            dy / length *
            speed,

        radius:
            enemy.isBoss
                ? 9
                : 6,

        damage:
            enemy.isBoss
                ? 2
                : 1,

        life: 1800,

        color:
            typeData.projectile,

        type:
            enemy.type

    });

    createParticle(
        startX,
        startY,
        {
            vx: 0,
            vy: 0,
            life: 180,
            size: 8,
            color:
                typeData.projectile
        }
    );

}


function updateEnemyProjectiles(dt) {

    for (
        const projectile
        of game.enemyProjectiles
    ) {

        projectile.x +=
            projectile.vx *
            (dt / 16.666);

        projectile.y +=
            projectile.vy *
            (dt / 16.666);

        projectile.life -= dt;

        const target = {

            x:
                projectile.x -
                projectile.radius,

            y:
                projectile.y -
                projectile.radius,

            width:
                projectile.radius * 2,

            height:
                projectile.radius * 2

        };

        if (
            rectsOverlap(
                target,
                player
            )
        ) {

            damagePlayer(
                projectile.damage
            );

            projectile.life = 0;

            createExplosion(
                projectile.x,
                projectile.y,
                false
            );

        }

    }

    game.enemyProjectiles =
        game.enemyProjectiles.filter(
            projectile =>
                projectile.life > 0 &&
                projectile.x > -200 &&
                projectile.x <
                    game.worldWidth + 200 &&
                projectile.y > -200 &&
                projectile.y <
                    game.worldHeight + 200
        );

}


function drawEnemyProjectiles() {

    for (
        const projectile
        of game.enemyProjectiles
    ) {

        const x =
            sx(projectile.x);

        const y =
            sy(projectile.y);

        ctx.save();

        ctx.globalAlpha = .25;

        ctx.fillStyle =
            projectile.color;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            projectile.radius * 2.2,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.globalAlpha = 1;

        ctx.fillStyle =
            projectile.color;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            projectile.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    }

}


/* =========================================================
   ENNEMIS
========================================================= */

function resolveEnemyGround(enemy) {

    const previousBottom =
        enemy.y +
        enemy.height -
        enemy.vy;

    const currentBottom =
        enemy.y +
        enemy.height;

    enemy.grounded = false;


    if (
        enemy.vy >= 0 &&
        previousBottom <= SOL_Y &&
        currentBottom >= SOL_Y
    ) {

        enemy.y =
            SOL_Y -
            enemy.height;

        enemy.vy = 0;
        enemy.grounded = true;

        return true;

    }


    if (enemy.vy >= 0) {

        for (
            const platform
            of game.platforms
        ) {

            const horizontal =
                enemy.x +
                enemy.width >
                platform.x &&
                enemy.x <
                platform.x +
                platform.width;

            if (!horizontal) continue;

            if (
                previousBottom <= platform.y &&
                currentBottom >= platform.y
            ) {

                enemy.y =
                    platform.y -
                    enemy.height;

                enemy.vy = 0;
                enemy.grounded = true;

                return true;

            }

        }

    }

    return false;

}


/* =========================================================
   IA ENNEMIE
========================================================= */

function updateEnemies(dt) {

    for (
        const enemy
        of game.enemies
    ) {

        if (!enemy.alive) continue;

        const dx =
            player.x -
            enemy.x;

        const horizontalDistance =
            Math.abs(dx);

        const verticalDistance =
            Math.abs(
                player.y -
                enemy.y
            );

        enemy.phase +=
            dt * .004;

        if (enemy.hitFlash > 0) {
            enemy.hitFlash -= dt;
        }


        /*
        =====================================================
        POURSUITE
        =====================================================
        */

        if (
            horizontalDistance <
            enemy.chase
        ) {

            if (dx > 12) {

                enemy.direction = 1;

                enemy.vx =
                    lerp(
                        enemy.vx,
                        enemy.speed,
                        .09
                    );

            } else if (dx < -12) {

                enemy.direction = -1;

                enemy.vx =
                    lerp(
                        enemy.vx,
                        -enemy.speed,
                        .09
                    );

            } else {

                enemy.vx *= .75;

            }

        } else {

            enemy.vx *= .94;

        }


        enemy.x += enemy.vx;

        enemy.x =
            clamp(
                enemy.x,
                0,
                game.worldWidth -
                enemy.width
            );


        /*
        =====================================================
        GRAVITÉ
        =====================================================
        */

        enemy.vy += GRAVITY;

        enemy.vy =
            Math.min(
                enemy.vy,
                20
            );

        enemy.y += enemy.vy;

        resolveEnemyGround(enemy);


        /*
        =====================================================
        ATTAQUE À DISTANCE
        =====================================================
        */

        enemy.shotCooldown -= dt;

        const canShoot =
            horizontalDistance <
            enemy.attackRange &&
            verticalDistance <
            250;

        if (
            canShoot &&
            enemy.shotCooldown <= 0
        ) {

            enemyShoot(enemy);

            enemy.shotCooldown =
                enemy.isBoss
                    ? 650
                    : Math.max(
                        800,
                        enemy.attackDelay
                    );

        }


        /*
        =====================================================
        ATTAQUE AU CONTACT
        =====================================================
        */

        enemy.attackTimer -= dt;

        if (
            enemy.attackTimer <= 0
        ) {

            if (
                rectsOverlap(
                    enemy,
                    player
                )
            ) {

                damagePlayer(
                    enemy.isBoss
                        ? 2
                        : 1
                );

            }

            enemy.attackTimer =
                enemy.attackDelay;

        }

    }

}


/* =========================================================
   DÉGÂTS JOUEUR
========================================================= */

function damagePlayer(amount) {

    if (
        player.invincible > 0 ||
        game.dead
    ) {
        return;
    }

    player.hearts -= amount;

    player.invincible = 1000;

    game.shake = 8;

    createHitParticles(
        player.x +
        player.width / 2,
        player.y +
        player.height / 2
    );

    updateHUD();

    if (
        player.hearts <= 0
    ) {

        player.hearts = 0;

        playerDeath();

    }

}


function playerDeath() {

    if (game.dead) return;

    game.dead = true;

    player.vx = 0;
    player.vy = -8;

    setTimeout(
        () => {

            if (!game.finished) {
                resetLevel();
            }

        },
        1100
    );

}


/* =========================================================
   CAMÉRA
========================================================= */

function updateCamera() {

    const targetX =
        player.x -
        W * .36;

    const maxCameraX =
        Math.max(
            0,
            game.worldWidth - W
        );

    game.cameraX =
        lerp(
            game.cameraX,
            clamp(
                targetX,
                0,
                maxCameraX
            ),
            .12
        );


    const targetY =
        SOL_Y -
        H * .74;

    const maxCameraY =
        Math.max(
            0,
            game.worldHeight - H
        );

    game.cameraY =
        clamp(
            targetY,
            0,
            maxCameraY
        );

}


/* =========================================================
   COORDONNÉES
========================================================= */

function sx(x) {
    return x - game.cameraX;
}

function sy(y) {
    return y - game.cameraY;
}


/* =========================================================
   BACKGROUND
========================================================= */

function drawBackground() {

    if (game.chapter === 1) {
        drawChapter1Background();
    }
    else if (game.chapter === 2) {
        drawChapter2Background();
    }
    else if (game.chapter === 3) {
        drawChapter3Background();
    }
    else if (game.chapter === 4) {
        drawChapter4Background();
    }
    else {
        drawChapter5Background();
    }

}


/* =========================================================
   CHAPITRE 1
========================================================= */

function drawChapter1Background() {

    const gradient =
        ctx.createLinearGradient(
            0, 0, 0, H
        );

    gradient.addColorStop(
        0,
        "#050619"
    );

    gradient.addColorStop(
        .55,
        "#17184b"
    );

    gradient.addColorStop(
        1,
        "#282042"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle =
        "rgba(255,255,255,.75)";

    for (
        let i = 0;
        i < 100;
        i++
    ) {

        const x =
            (
                i * 137 -
                game.cameraX * .08
            ) %
            (W + 100);

        const y =
            (
                i * 53
            ) %
            Math.max(
                120,
                SOL_Y -
                game.cameraY -
                100
            );

        ctx.fillRect(
            x < 0 ? x + W + 100 : x,
            y,
            1.5,
            1.5
        );

    }


    const planetX =
        W * .72 -
        game.cameraX * .03;

    const planetY =
        120 -
        game.cameraY * .05;

    ctx.fillStyle =
        "#383d76";

    ctx.beginPath();

    ctx.arc(
        planetX,
        planetY,
        105,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


/* =========================================================
   CHAPITRE 2
========================================================= */

function drawChapter2Background() {

    const gradient =
        ctx.createLinearGradient(
            0, 0, 0, H
        );

    gradient.addColorStop(
        0,
        "#b8d9ef"
    );

    gradient.addColorStop(
        .5,
        "#709bc1"
    );

    gradient.addColorStop(
        1,
        "#344f6b"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0, 0, W, H
    );


    ctx.fillStyle =
        "#405c78";

    for (
        let i = -2;
        i < 10;
        i++
    ) {

        const x =
            i * 190 -
            game.cameraX * .12;

        ctx.beginPath();

        ctx.moveTo(
            x,
            SOL_Y -
            game.cameraY
        );

        ctx.lineTo(
            x + 100,
            150 -
            game.cameraY
        );

        ctx.lineTo(
            x + 220,
            SOL_Y -
            game.cameraY
        );

        ctx.closePath();

        ctx.fill();

    }

}


/* =========================================================
   CHAPITRE 3
========================================================= */

function drawChapter3Background() {

    const gradient =
        ctx.createLinearGradient(
            0, 0, 0, H
        );

    gradient.addColorStop(
        0,
        "#102c26"
    );

    gradient.addColorStop(
        .55,
        "#28654b"
    );

    gradient.addColorStop(
        1,
        "#102b20"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0, 0, W, H
    );


    for (
        let i = -2;
        i < 12;
        i++
    ) {

        const x =
            i * 145 -
            game.cameraX * .16;

        const base =
            SOL_Y -
            game.cameraY;

        ctx.fillStyle =
            "#123e2c";

        ctx.fillRect(
            x,
            base - 150,
            28,
            150
        );

        ctx.beginPath();

        ctx.arc(
            x + 15,
            base - 160,
            55,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}


/* =========================================================
   CHAPITRE 4
========================================================= */

function drawChapter4Background() {

    const gradient =
        ctx.createLinearGradient(
            0, 0, 0, H
        );

    gradient.addColorStop(
        0,
        "#100c22"
    );

    gradient.addColorStop(
        .6,
        "#25194b"
    );

    gradient.addColorStop(
        1,
        "#100c20"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0, 0, W, H
    );


    for (
        let i = -1;
        i < 12;
        i++
    ) {

        const x =
            i * 160 -
            game.cameraX * .22;

        const base =
            SOL_Y -
            game.cameraY;

        ctx.fillStyle =
            i % 2
                ? "#8b4cff"
                : "#4c7cff";

        ctx.beginPath();

        ctx.moveTo(x, base);

        ctx.lineTo(
            x + 35,
            base - 150
        );

        ctx.lineTo(
            x + 75,
            base
        );

        ctx.closePath();

        ctx.fill();

    }

}


/* =========================================================
   CHAPITRE 5
========================================================= */

function drawChapter5Background() {

    const gradient =
        ctx.createLinearGradient(
            0, 0, 0, H
        );

    gradient.addColorStop(
        0,
        "#120514"
    );

    gradient.addColorStop(
        .5,
        "#40103c"
    );

    gradient.addColorStop(
        1,
        "#160715"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0, 0, W, H
    );


    ctx.strokeStyle =
        "rgba(210,75,255,.25)";

    ctx.lineWidth = 2;

    for (
        let i = 0;
        i < 15;
        i++
    ) {

        const x =
            (
                i * 190 -
                game.cameraX * .3
            ) %
            (W + 200);

        ctx.beginPath();

        ctx.moveTo(x, 100);

        ctx.lineTo(
            x + 60,
            SOL_Y -
            game.cameraY -
            20
        );

        ctx.stroke();

    }

}


/* =========================================================
   SOL
========================================================= */

function drawGround() {

    const y =
        SOL_Y -
        game.cameraY;

    ctx.fillStyle =
        "#151a28";

    ctx.fillRect(
        0,
        y,
        W,
        H - y
    );

    ctx.fillStyle =
        "#75839a";

    ctx.fillRect(
        0,
        y,
        W,
        5
    );

    ctx.fillStyle =
        "#293246";

    ctx.fillRect(
        0,
        y + 5,
        W,
        12
    );

    ctx.fillStyle =
        "#202838";

    ctx.fillRect(
        0,
        y + 17,
        W,
        H - y - 17
    );

}


/* =========================================================
   PLATEFORMES
========================================================= */

function drawPlatforms() {

    for (
        const platform
        of game.platforms
    ) {

        const x =
            sx(platform.x);

        const y =
            sy(platform.y);

        if (
            x + platform.width < 0 ||
            x > W
        ) continue;

        ctx.fillStyle =
            "#313b52";

        ctx.fillRect(
            x,
            y,
            platform.width,
            platform.height
        );

        ctx.fillStyle =
            "#91a0b8";

        ctx.fillRect(
            x,
            y,
            platform.width,
            4
        );

    }

}


/* =========================================================
   DÉCORATIONS
========================================================= */

function drawDecorations() {

    for (
        const d
        of game.decorations
    ) {

        const x = sx(d.x);
        const y = sy(d.y);

        if (
            x < -120 ||
            x > W + 120
        ) continue;


        if (d.type === 1) {

            ctx.fillStyle =
                "#252b42";

            ctx.fillRect(
                x,
                y - d.size,
                d.size * .5,
                d.size
            );

        }

        else if (d.type === 2) {

            ctx.fillStyle =
                "#8bc6e8";

            ctx.beginPath();

            ctx.moveTo(x, y);

            ctx.lineTo(
                x + d.size * .4,
                y - d.size
            );

            ctx.lineTo(
                x + d.size * .8,
                y
            );

            ctx.closePath();

            ctx.fill();

        }

        else if (d.type === 3) {

            ctx.fillStyle =
                "#55351f";

            ctx.fillRect(
                x + 20,
                y - d.size,
                14,
                d.size
            );

            ctx.fillStyle =
                "#174f36";

            ctx.beginPath();

            ctx.arc(
                x + 27,
                y - d.size,
                d.size * .45,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

        else if (d.type === 4) {

            ctx.fillStyle =
                "#814dff";

            ctx.beginPath();

            ctx.moveTo(x, y);

            ctx.lineTo(
                x + 25,
                y - d.size
            );

            ctx.lineTo(
                x + 48,
                y
            );

            ctx.closePath();

            ctx.fill();

        }

        else {

            ctx.fillStyle =
                "#4e173f";

            ctx.fillRect(
                x,
                y - d.size,
                25,
                d.size
            );

        }

    }

}


/* =========================================================
   JOUEUR — DESSIN
========================================================= */

function drawPlayer() {

    const x = sx(player.x);
    const y = sy(player.y);

    if (
        x + player.width < -100 ||
        x > W + 100
    ) return;


    if (
        player.invincible > 0 &&
        Math.floor(
            player.invincible / 80
        ) % 2 === 0
    ) {

        ctx.globalAlpha = .45;

    }


    const running =
        player.state === "run";

    const attacking =
        player.state === "attack";

    const bob =
        running
            ? Math.sin(
                player.animTime * .018
            ) * 2
            : 0;


    ctx.globalAlpha *= .3;

    ctx.fillStyle = "#000";

    ctx.beginPath();

    ctx.ellipse(
        x + player.width / 2,
        sy(SOL_Y) - 3,
        27,
        7,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.globalAlpha = 1;


    const legMove =
        running
            ? Math.sin(
                player.animTime * .025
            ) * 5
            : 0;


    ctx.fillStyle =
        "#263c78";

    ctx.fillRect(
        x + 8,
        y + 47 + bob,
        12,
        27
    );

    ctx.fillRect(
        x + 27,
        y + 47 - bob,
        12,
        27
    );


    ctx.fillStyle =
        "#111827";

    ctx.fillRect(
        x + 5,
        y + 69,
        16,
        7
    );

    ctx.fillRect(
        x + 26,
        y + 69,
        16,
        7
    );


    ctx.fillStyle =
        "#3e70d9";

    ctx.fillRect(
        x + 7,
        y + 27 + bob,
        32,
        28
    );


    ctx.fillStyle =
        "#8de6ff";

    ctx.fillRect(
        x + 17,
        y + 34 + bob,
        12,
        7
    );


    ctx.fillStyle =
        "#70a5e8";

    ctx.fillRect(
        x - 1,
        y + 29 + bob + legMove * .25,
        9,
        27
    );

    ctx.fillRect(
        x + 38,
        y + 29 + bob - legMove * .25,
        9,
        27
    );


    ctx.fillStyle =
        "#f1c7a0";

    ctx.fillRect(
        x + 9,
        y + 2 + bob,
        28,
        27
    );


    ctx.fillStyle =
        "#17233d";

    ctx.fillRect(
        x + 7,
        y,
        32,
        11
    );


    ctx.fillStyle =
        "#8de6ff";

    ctx.fillRect(
        x + 12,
        y + 10,
        22,
        9
    );


    ctx.fillStyle =
        "#101827";

    ctx.fillRect(
        x + 17,
        y + 13,
        3,
        3
    );

    ctx.fillRect(
        x + 27,
        y + 13,
        3,
        3
    );


    if (attacking) {

        ctx.save();

        ctx.translate(
            x + player.width / 2,
            y + 42
        );

        if (player.direction === -1) {
            ctx.scale(-1, 1);
        }

        ctx.rotate(-.75);

        ctx.fillStyle =
            "#dcecff";

        ctx.fillRect(
            18,
            -3,
            48,
            6
        );

        ctx.fillStyle =
            "#ffd75a";

        ctx.fillRect(
            9,
            -7,
            7,
            14
        );

        ctx.restore();


        ctx.strokeStyle =
            "rgba(150,220,255,.8)";

        ctx.lineWidth = 4;

        ctx.beginPath();

        if (player.direction === 1) {

            ctx.arc(
                x + 35,
                y + 39,
                38,
                -.9,
                .65
            );

        } else {

            ctx.arc(
                x + 11,
                y + 39,
                38,
                Math.PI - .65,
                Math.PI + .9
            );

        }

        ctx.stroke();

    }


    ctx.globalAlpha = 1;

}


/* =========================================================
   ENNEMIS
========================================================= */

function drawEnemies() {

    for (
        const enemy
        of game.enemies
    ) {

        if (!enemy.alive) continue;

        const x = sx(enemy.x);
        const y = sy(enemy.y);

        if (
            x + enemy.width < -120 ||
            x > W + 120
        ) continue;

        if (enemy.isBoss) {

            drawBoss(enemy, x, y);

        } else {

            drawNormalEnemy(
                enemy,
                x,
                y
            );

        }

    }

}


function drawNormalEnemy(
    enemy,
    x,
    y
) {

    drawHealthBar(
        x,
        y - 19,
        enemy.width,
        6,
        enemy.hp,
        enemy.maxHp
    );


    ctx.font =
        "bold 9px Arial";

    ctx.textAlign =
        "center";

    ctx.fillStyle =
        "#ffffff";

    ctx.fillText(
        "NIV. " + enemy.level,
        x + enemy.width / 2,
        y - 25
    );

    ctx.textAlign =
        "left";


    if (enemy.type === "skeleton") {

        drawSkeleton(
            x,
            y,
            enemy
        );

    }

    else if (enemy.type === "purple") {

        drawPurpleCreature(
            x,
            y,
            enemy
        );

    }

    else if (enemy.type === "strange") {

        drawStrangeCreature(
            x,
            y,
            enemy
        );

    }

    else if (enemy.type === "machine") {

        drawMachine(
            x,
            y,
            enemy
        );

    }

    else if (enemy.type === "dragon") {

        drawDragon(
            x,
            y,
            enemy
        );

    }

    else {

        drawAlien(
            x,
            y,
            enemy
        );

    }

}


/* =========================================================
   SQUELETTE
========================================================= */

function drawSkeleton(
    x,
    y,
    enemy
) {

    ctx.fillStyle =
        enemy.hitFlash > 0
            ? "#ffffff"
            : "#d7d7d7";

    ctx.fillRect(
        x + 10,
        y + 18,
        28,
        30
    );

    ctx.beginPath();

    ctx.arc(
        x + 24,
        y + 14,
        16,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        x + 16,
        y + 10,
        6,
        7
    );

    ctx.fillRect(
        x + 27,
        y + 10,
        6,
        7
    );


    ctx.fillStyle =
        "#bdbdbd";

    ctx.fillRect(
        x + 7,
        y + 25,
        7,
        27
    );

    ctx.fillRect(
        x + 34,
        y + 25,
        7,
        27
    );

    ctx.fillRect(
        x + 12,
        y + 47,
        8,
        23
    );

    ctx.fillRect(
        x + 29,
        y + 47,
        8,
        23
    );

}


/* =========================================================
   ALIEN
========================================================= */

function drawAlien(
    x,
    y,
    enemy
) {

    ctx.fillStyle =
        enemy.hitFlash > 0
            ? "#ffffff"
            : "#72e37e";

    ctx.beginPath();

    ctx.ellipse(
        x + 24,
        y + 27,
        24,
        31,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#122518";

    ctx.beginPath();

    ctx.ellipse(
        x + 24,
        y + 19,
        14,
        10,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#eaffff";

    ctx.beginPath();

    ctx.arc(
        x + 19,
        y + 19,
        4,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 29,
        y + 19,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#257a39";

    ctx.fillRect(
        x + 4,
        y + 40,
        8,
        25
    );

    ctx.fillRect(
        x + 36,
        y + 40,
        8,
        25
    );

}


/* =========================================================
   CRÉATURE POURPRE
========================================================= */

function drawPurpleCreature(
    x,
    y,
    enemy
) {

    ctx.fillStyle =
        enemy.hitFlash > 0
            ? "#ffffff"
            : "#b35cff";

    ctx.beginPath();

    ctx.moveTo(
        x + 24,
        y + 2
    );

    ctx.lineTo(
        x + 45,
        y + 20
    );

    ctx.lineTo(
        x + 38,
        y + 60
    );

    ctx.lineTo(
        x + 9,
        y + 60
    );

    ctx.lineTo(
        x + 3,
        y + 20
    );

    ctx.closePath();

    ctx.fill();


    ctx.fillStyle =
        "#24112f";

    ctx.beginPath();

    ctx.arc(
        x + 16,
        y + 25,
        5,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 32,
        y + 25,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


/* =========================================================
   CRÉATURE ÉTRANGE
========================================================= */

function drawStrangeCreature(
    x,
    y,
    enemy
) {

    ctx.fillStyle =
        enemy.hitFlash > 0
            ? "#ffffff"
            : "#ef8cff";

    ctx.beginPath();

    ctx.arc(
        x + 24,
        y + 30,
        25,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#311331";

    ctx.beginPath();

    ctx.arc(
        x + 15,
        y + 25,
        6,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 34,
        y + 25,
        6,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.strokeStyle =
        "#311331";

    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.arc(
        x + 24,
        y + 34,
        10,
        0,
        Math.PI
    );

    ctx.stroke();


    ctx.strokeStyle =
        "#ef8cff";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
        x + 8,
        y + 14
    );

    ctx.lineTo(
        x - 5,
        y - 3
    );

    ctx.moveTo(
        x + 40,
        y + 14
    );

    ctx.lineTo(
        x + 53,
        y - 3
    );

    ctx.stroke();

}


/* =========================================================
   DRONE MÉCANIQUE
========================================================= */

function drawMachine(
    x,
    y,
    enemy
) {

    ctx.fillStyle =
        enemy.hitFlash > 0
            ? "#ffffff"
            : "#8da4c7";

    ctx.fillRect(
        x + 7,
        y + 12,
        34,
        42
    );

    ctx.fillStyle =
        "#263b5c";

    ctx.fillRect(
        x + 13,
        y + 21,
        22,
        10
    );

    ctx.fillStyle =
        "#65dfff";

    ctx.fillRect(
        x + 16,
        y + 23,
        5,
        5
    );

    ctx.fillRect(
        x + 27,
        y + 23,
        5,
        5
    );

    ctx.fillStyle =
        "#60728e";

    ctx.fillRect(
        x,
        y + 25,
        8,
        20
    );

    ctx.fillRect(
        x + 40,
        y + 25,
        8,
        20
    );

}


/* =========================================================
   DRAGON
========================================================= */

function drawDragon(
    x,
    y,
    enemy
) {

    const pulse =
        Math.sin(enemy.phase) * 3;

    ctx.fillStyle =
        enemy.hitFlash > 0
            ? "#ffffff"
            : "#ff704f";

    ctx.beginPath();

    ctx.ellipse(
        x + 25,
        y + 35,
        28,
        25 + pulse,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#721e29";

    ctx.beginPath();

    ctx.moveTo(
        x + 5,
        y + 25
    );

    ctx.lineTo(
        x - 12,
        y + 2
    );

    ctx.lineTo(
        x + 18,
        y + 18
    );

    ctx.closePath();

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(
        x + 42,
        y + 25
    );

    ctx.lineTo(
        x + 60,
        y + 2
    );

    ctx.lineTo(
        x + 34,
        y + 18
    );

    ctx.closePath();

    ctx.fill();


    ctx.fillStyle =
        "#fff";

    ctx.fillRect(
        x + 14,
        y + 28,
        6,
        6
    );

    ctx.fillRect(
        x + 30,
        y + 28,
        6,
        6
    );

}


/* =========================================================
   BOSS
========================================================= */

function drawBoss(
    enemy,
    x,
    y
) {

    const data =
        ENEMY_TYPES[
            enemy.type
        ] ||
        ENEMY_TYPES.strange;

    const pulse =
        Math.sin(
            enemy.phase * 2
        ) * 4;


    ctx.fillStyle =
        "rgba(210,70,255,.12)";

    ctx.beginPath();

    ctx.arc(
        x + enemy.width / 2,
        y + enemy.height / 2,
        enemy.width * .7 +
        pulse,
        0,
        Math.PI * 2
    );

    ctx.fill();


    drawHealthBar(
        x,
        y - 30,
        enemy.width,
        9,
        enemy.hp,
        enemy.maxHp
    );


    ctx.textAlign =
        "center";

    ctx.font =
        "bold 12px Arial";

    ctx.fillStyle =
        "#ffd76b";

    ctx.fillText(
        "BOSS • NIV. " +
        enemy.level,
        x + enemy.width / 2,
        y - 38
    );


    ctx.fillStyle =
        enemy.hitFlash > 0
            ? "#ffffff"
            : data.color;

    ctx.beginPath();

    ctx.arc(
        x + enemy.width / 2,
        y + 60,
        52,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#171020";

    ctx.beginPath();

    ctx.arc(
        x + enemy.width / 2,
        y + 39,
        35,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#ff3cff";

    ctx.fillRect(
        x + 30,
        y + 32,
        13,
        7
    );

    ctx.fillRect(
        x + 72,
        y + 32,
        13,
        7
    );


    ctx.strokeStyle =
        data.color;

    ctx.lineWidth = 18;

    ctx.beginPath();

    ctx.moveTo(
        x + 12,
        y + 70
    );

    ctx.lineTo(
        x - 20,
        y + 105
    );

    ctx.moveTo(
        x + enemy.width - 12,
        y + 70
    );

    ctx.lineTo(
        x + enemy.width + 20,
        y + 105
    );

    ctx.stroke();


    ctx.textAlign =
        "left";

}


/* =========================================================
   BARRE HP
========================================================= */

function drawHealthBar(
    x,
    y,
    width,
    height,
    hp,
    maxHp
) {

    const ratio =
        clamp(
            hp / maxHp,
            0,
            1
        );

    ctx.fillStyle =
        "rgba(0,0,0,.7)";

    ctx.fillRect(
        x - 1,
        y - 1,
        width + 2,
        height + 2
    );

    ctx.fillStyle =
        "#e63d51";

    ctx.fillRect(
        x,
        y,
        width * ratio,
        height
    );

}


/* =========================================================
   PARTICULES
========================================================= */

function createParticle(
    x,
    y,
    options = {}
) {

    game.particles.push({

        x,
        y,

        vx:
            options.vx ??
            random(-2, 2),

        vy:
            options.vy ??
            random(-3, 1),

        life:
            options.life ??
            500,

        maxLife:
            options.life ??
            500,

        size:
            options.size ??
            random(2, 5),

        color:
            options.color ??
            "#ffffff"

    });

}


function createHitParticles(
    x,
    y
) {

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        createParticle(
            x,
            y,
            {

                vx:
                    random(-4, 4),

                vy:
                    random(-5, 2),

                life:
                    random(250, 550),

                size:
                    random(2, 5),

                color:
                    i % 2
                        ? "#ffffff"
                        : "#8de6ff"

            }
        );

    }

}


function createExplosion(
    x,
    y,
    boss = false
) {

    const amount =
        boss
            ? 45
            : 20;

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        createParticle(
            x,
            y,
            {

                vx:
                    random(-7, 7),

                vy:
                    random(-7, 4),

                life:
                    random(450, 950),

                size:
                    random(
                        3,
                        boss ? 9 : 6
                    ),

                color:
                    boss
                        ? (
                            i % 2
                                ? "#d878ff"
                                : "#ffffff"
                        )
                        : (
                            i % 2
                                ? "#ffcc55"
                                : "#ffffff"
                        )

            }
        );

    }

}


function createJumpParticles() {

    for (
        let i = 0;
        i < 8;
        i++
    ) {

        createParticle(
            player.x +
            player.width / 2,
            SOL_Y - 2,
            {

                vx:
                    random(-3, 3),

                vy:
                    random(-2, -.5),

                life:
                    random(250, 450),

                size:
                    random(2, 5),

                color:
                    "#9aa8bd"

            }
        );

    }

}


function updateParticles(dt) {

    for (
        const particle
        of game.particles
    ) {

        particle.x +=
            particle.vx;

        particle.y +=
            particle.vy;

        particle.vy += .12;

        particle.life -= dt;

    }

    game.particles =
        game.particles.filter(
            p => p.life > 0
        );

}


function drawParticles() {

    for (
        const particle
        of game.particles
    ) {

        const alpha =
            clamp(
                particle.life /
                particle.maxLife,
                0,
                1
            );

        ctx.globalAlpha =
            alpha;

        ctx.fillStyle =
            particle.color;

        ctx.beginPath();

        ctx.arc(
            sx(particle.x),
            sy(particle.y),
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    ctx.globalAlpha = 1;

}


/* =========================================================
   OBJECTIF
========================================================= */

function drawGoal() {

    const x =
        sx(game.goalX);

    const y =
        sy(SOL_Y);

    if (
        x < -100 ||
        x > W + 100
    ) return;


    ctx.fillStyle =
        "#72e8ff";

    ctx.fillRect(
        x,
        y - 150,
        8,
        150
    );


    ctx.fillStyle =
        "rgba(114,232,255,.18)";

    ctx.beginPath();

    ctx.arc(
        x + 4,
        y - 150,
        35 +
        Math.sin(
            performance.now() * .004
        ) * 5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 11px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "OBJECTIF",
        x + 4,
        y - 165
    );

    ctx.textAlign =
        "left";

}


/* =========================================================
   COMBAT
========================================================= */

function updateCombat(dt) {

    if (
        game.attackCooldown > 0
    ) {

        game.attackCooldown -= dt;

    }

}


/* =========================================================
   OBJECTIF
========================================================= */

function checkGoal() {

    const bossLevel =
        game.level === 10 ||
        game.chapter === 5;

    if (bossLevel) return;

    if (
        player.x +
        player.width >
        game.goalX
    ) {

        finishLevel(false);

    }

}


/* =========================================================
   BOSS
========================================================= */

function checkBossVictory() {

    const bossLevel =
        game.level === 10 ||
        game.chapter === 5;

    if (!bossLevel) return;

    const bossAlive =
        game.enemies.some(
            enemy =>
                enemy.alive &&
                enemy.isBoss
        );

    if (!bossAlive) {

        finishLevel(true);

    }

}


/* =========================================================
   FIN NIVEAU
========================================================= */

function finishLevel(
    bossVictory
) {

    if (game.finished) return;

    game.finished = true;

    localStorage.setItem(
        completedKey(
            game.chapter,
            game.level
        ),
        "1"
    );

    saveCurrencies();


    document.getElementById(
        "resultIcon"
    ).textContent =
        bossVictory
            ? "👑"
            : "★";


    document.getElementById(
        "resultTitle"
    ).textContent =
        bossVictory
            ? "BOSS VAINCU"
            : "NIVEAU TERMINÉ";


    document.getElementById(
        "resultMessage"
    ).textContent =
        bossVictory
            ? "Tu as remporté le combat."
            : "Tu as atteint l'objectif.";


    document.getElementById(
        "rewardCoins"
    ).textContent =
        game.levelRewardCoins;


    document.getElementById(
        "rewardFragments"
    ).textContent =
        game.levelRewardFragments;


    const count =
        levelCount(
            game.chapter
        );

    if (
        game.level >= count
    ) {

        nextLevelButton.style.display =
            "none";

    } else {

        nextLevelButton.style.display =
            "flex";

    }


    resultOverlay.classList.add("show");

    updateCurrencies();

}


/* =========================================================
   NIVEAU SUIVANT
========================================================= */

function nextLevel() {

    const count =
        levelCount(
            game.chapter
        );

    if (
        game.level < count
    ) {

        game.level++;

        resultOverlay.classList.remove(
            "show"
        );

        resetLevel();

        return;

    }


    resultOverlay.classList.remove(
        "show"
    );

    buildLevelButtons();

    showScreen(levelScreen);

}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    const hp =
        clamp(
            player.hearts /
            player.maxHearts,
            0,
            1
        );

    const healthFill =
        document.getElementById(
            "healthFill"
        );

    const healthText =
        document.getElementById(
            "healthText"
        );

    if (healthFill) {

        healthFill.style.width =
            (hp * 100) + "%";

    }

    if (healthText) {

        healthText.textContent =
            player.hearts +
            " / " +
            player.maxHearts;

    }

    const chapterHud =
        document.getElementById(
            "chapterHud"
        );

    const levelHud =
        document.getElementById(
            "levelHud"
        );

    if (chapterHud) {

        chapterHud.textContent =
            "CHAPTER " +
            game.chapter;

    }

    if (levelHud) {

        levelHud.textContent =
            "LEVEL " +
            game.level;

    }

    updateCurrencies();

}


/* =========================================================
   PAUSE
========================================================= */

function setPaused(value) {

    game.paused = value;

    if (value) {

        pauseOverlay.classList.add(
            "show"
        );

    } else {

        pauseOverlay.classList.remove(
            "show"
        );

        unlockAudio();

    }

}


pauseButton.addEventListener(
    "click",
    () => {

        setPaused(
            !game.paused
        );

    }
);


resumeButton.addEventListener(
    "click",
    () => {

        setPaused(false);

    }
);


restartButton.addEventListener(
    "click",
    () => {

        setPaused(false);

        resetLevel();

    }
);


quitButton.addEventListener(
    "click",
    () => {

        setPaused(false);

        resultOverlay.classList.remove(
            "show"
        );

        buildLevelButtons();

        showScreen(levelScreen);

    }
);


returnLevelsButton.addEventListener(
    "click",
    () => {

        resultOverlay.classList.remove(
            "show"
        );

        buildLevelButtons();

        showScreen(levelScreen);

    }
);


nextLevelButton.addEventListener(
    "click",
    nextLevel
);


/* =========================================================
   CHAPITRES
========================================================= */

document
    .querySelectorAll(".chapterCard")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const chapter =
                    Number(
                        button.dataset.chapter
                    );

                openLevels(chapter);

            }
        );

    });


/* =========================================================
   RETOURS
========================================================= */

document
    .querySelectorAll("[data-back]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const back =
                    button.dataset.back;

                if (
                    back === "lobby"
                ) {

                    showScreen(
                        lobbyScreen
                    );

                }

                if (
                    back === "chapter"
                ) {

                    openChapters();

                }

            }
        );

    });


/* =========================================================
   LOBBY
========================================================= */

startButton.addEventListener(
    "click",
    () => {

        unlockAudio();

        openChapters();

    }
);


/* =========================================================
   TOUCH
========================================================= */

function bindControl(
    element,
    action
) {

    function press(event) {

        event.preventDefault();

        element.classList.add(
            "pressed"
        );

        unlockAudio();

        if (action === "left") {
            keys.left = true;
        }

        if (action === "right") {
            keys.right = true;
        }

        if (action === "jump") {
            keys.jumpPressed = true;
        }

        if (action === "attack") {
            keys.attackPressed = true;
        }

    }


    function release(event) {

        event.preventDefault();

        element.classList.remove(
            "pressed"
        );

        if (action === "left") {
            keys.left = false;
        }

        if (action === "right") {
            keys.right = false;
        }

    }


    element.addEventListener(
        "pointerdown",
        press
    );

    element.addEventListener(
        "pointerup",
        release
    );

    element.addEventListener(
        "pointercancel",
        release
    );

    element.addEventListener(
        "pointerleave",
        release
    );

}


document
    .querySelectorAll("[data-control]")
    .forEach(button => {

        bindControl(
            button,
            button.dataset.control
        );

    });


/* =========================================================
   DESSIN
========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );

    /*
       Le tremblement reste graphique.
    */

    let shakeX = 0;
    let shakeY = 0;

    if (game.shake > 0) {

        shakeX =
            random(
                -game.shake,
                game.shake
            );

        shakeY =
            random(
                -game.shake,
                game.shake
            );

        game.shake *= .88;

        if (game.shake < .1) {
            game.shake = 0;
        }

    }

    ctx.save();

    ctx.translate(
        shakeX,
        shakeY
    );

    drawBackground();

    drawDecorations();

    drawPlatforms();

    drawGround();

    drawGoal();

    drawEnemyProjectiles();

    drawEnemies();

    drawPlayer();

    drawParticles();

    ctx.restore();

}


/* =========================================================
   BOUCLE
========================================================= */

function update(dt) {

    if (
        game.paused ||
        game.finished
    ) {
        return;
    }

    updatePlayer(dt);

    updateEnemies(dt);

    updateEnemyProjectiles(dt);

    updateParticles(dt);

    updateCombat(dt);

    updateCamera();

    checkGoal();

    updateHUD();

}


function loop(timestamp) {

    if (!game.lastTime) {

        game.lastTime =
            timestamp;

    }

    const dt =
        Math.min(
            timestamp -
            game.lastTime,
            33
        );

    game.lastTime =
        timestamp;

    update(dt);

    draw();

    requestAnimationFrame(loop);

}


requestAnimationFrame(loop);


/* =========================================================
   VISIBILITÉ
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) {

            if (gameMusic) {
                gameMusic.pause();
            }

        } else {

            if (
                !game.paused &&
                gameMusic
            ) {

                gameMusic.play().catch(
                    () => {}
                );

            }

        }

    }
);


/* =========================================================
   CONTEXT MENU
========================================================= */

document.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

    }
);


/* =========================================================
   INITIALISATION
========================================================= */

updateCurrencies();

showScreen(
    lobbyScreen
);