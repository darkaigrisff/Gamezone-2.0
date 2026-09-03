/* =========================================================
   GAME ZONE — SPEED RACE
   VERSION SYNCHRONISÉE HTML + CSS + JS
   ========================================================= */

(() => {

"use strict";


/* =========================================================
   OUTILS
   ========================================================= */

const $ = id => document.getElementById(id);

const clamp = (v, min, max) =>
    Math.max(min, Math.min(max, v));

const lerp = (a, b, t) =>
    a + (b - a) * t;


/* =========================================================
   VOITURES
   ========================================================= */

const cars = [

    {
        id: "long-cruiser",
        name: "Long Cruiser",
        price: 0,
        speed: 170,
        accel: 20,
        grip: 78,
        handling: .90,
        nitro: 44
    },

    {
        id: "urban-sport",
        name: "Urban Sport",
        price: 2500,
        speed: 185,
        accel: 22,
        grip: 82,
        handling: .94,
        nitro: 46
    },

    {
        id: "trail-cruiser",
        name: "Trail Cruiser",
        price: 5000,
        speed: 200,
        accel: 24,
        grip: 86,
        handling: .97,
        nitro: 48
    },

    {
        id: "grand-tour",
        name: "Grand Tour",
        price: 7500,
        speed: 215,
        accel: 26,
        grip: 88,
        handling: 1,
        nitro: 50
    },

    {
        id: "apex-sport",
        name: "Apex Sport",
        price: 11000,
        speed: 230,
        accel: 29,
        grip: 91,
        handling: 1.03,
        nitro: 52
    },

    {
        id: "velocity-gt",
        name: "Velocity GT",
        price: 15000,
        speed: 245,
        accel: 32,
        grip: 93,
        handling: 1.06,
        nitro: 55
    },

    {
        id: "storm-rs",
        name: "Storm RS",
        price: 21000,
        speed: 260,
        accel: 35,
        grip: 95,
        handling: 1.09,
        nitro: 58
    },

    {
        id: "phantom-x",
        name: "Phantom X",
        price: 30000,
        speed: 270,
        accel: 38,
        grip: 97,
        handling: 1.12,
        nitro: 62
    }

];


/* =========================================================
   CIRCUITS
   ========================================================= */

const tracks = [

    {
        id: "sunset",
        name: "SUNSET GRAND PRIX",
        description:
            "Un circuit rapide au coucher du soleil.",
        laps: 3,
        length: 4400,
        difficulty: "NORMAL",
        environment: "sunset"
    },

    {
        id: "mountain",
        name: "MOUNTAIN RING",
        description:
            "Un circuit montagneux avec de longues lignes droites.",
        laps: 3,
        length: 4700,
        difficulty: "DIFFICILE",
        environment: "mountain"
    },

    {
        id: "neon",
        name: "NEON CIRCUIT",
        description:
            "Un circuit nocturne extrêmement rapide.",
        laps: 4,
        length: 4200,
        difficulty: "EXTRÊME",
        environment: "neon"
    }

];


/* =========================================================
   ÉTAT
   ========================================================= */

let coins =
    Number(
        localStorage.getItem(
            "gameZoneSpeedCoins"
        ) || 0
    );

let ownedCars;

try {

    ownedCars =
        JSON.parse(
            localStorage.getItem(
                "gameZoneSpeedOwnedCars"
            ) ||
            '["long-cruiser"]'
        );

} catch {

    ownedCars =
        ["long-cruiser"];

}


let selectedCar =
    localStorage.getItem(
        "gameZoneSpeedSelectedCar"
    ) ||
    "long-cruiser";


let selectedTrack = null;

let race = null;

let animationId = null;

let lastTime = 0;

let canvas = null;

let ctx = null;


/* =========================================================
   SAUVEGARDE
   ========================================================= */

function save() {

    localStorage.setItem(
        "gameZoneSpeedCoins",
        String(coins)
    );

    localStorage.setItem(
        "gameZoneSpeedOwnedCars",
        JSON.stringify(ownedCars)
    );

    localStorage.setItem(
        "gameZoneSpeedSelectedCar",
        selectedCar
    );

}


/* =========================================================
   COINS
   ========================================================= */

function updateCoins() {

    [
        "lobbyCoins",
        "trackCoins",
        "garageCoins",
        "shopCoins",
        "raceCoins"
    ].forEach(id => {

        const element = $(id);

        if (element) {
            element.textContent = coins;
        }

    });

}


/* =========================================================
   ÉCRANS
   ========================================================= */

function showScreen(name) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove("active");

        });


    const target = $(name);

    if (!target) {

        console.error(
            "Écran introuvable :",
            name
        );

        return;

    }


    target.classList.add("active");


    if (name !== "race") {

        stopLoop();

    }

}


/* =========================================================
   CIRCUITS
   ========================================================= */

function renderTracks() {

    const grid =
        $("trackGrid");

    if (!grid) return;


    grid.innerHTML = "";


    tracks.forEach(
        (track, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "trackCard";

            button.dataset.track =
                track.id;


            button.innerHTML = `

                <div class="trackNumber">
                    0${index + 1}
                </div>

                <div
                    class="trackVisual ${track.environment}"
                >
                    <div class="trackRoad"></div>
                </div>

                <div class="trackInfo">

                    <small>
                        ${track.difficulty}
                    </small>

                    <h3>
                        ${track.name}
                    </h3>

                    <p>
                        ${track.description}
                    </p>

                    <div class="trackStats">

                        <span>
                            🏁 ${track.laps} TOURS
                        </span>

                        <span>
                            📏 ${track.length} m
                        </span>

                    </div>

                </div>

                <span class="trackArrow">
                    ›
                </span>
            `;


            grid.appendChild(button);

        }
    );

}


/* =========================================================
   GARAGE
   ========================================================= */

function renderGarage() {

    const grid =
        $("garageCars");

    if (!grid) return;


    grid.innerHTML = "";


    cars.forEach(car => {

        const owned =
            ownedCars.includes(car.id);


        const button =
            document.createElement(
                "button"
            );

        button.type = "button";

        button.className =
            "carCard" +
            (
                selectedCar === car.id
                    ? " selected"
                    : ""
            );


        button.innerHTML = `

            <div class="carPreview">

                <div class="miniCar">

                    <span
                        class="miniWindow"
                    ></span>

                    <span
                        class="miniWheel wheel1"
                    ></span>

                    <span
                        class="miniWheel wheel2"
                    ></span>

                </div>

            </div>

            <div class="carCardInfo">

                <small>
                    ${
                        owned
                            ? "POSSÉDÉE"
                            : "VERROUILLÉE"
                    }
                </small>

                <h3>
                    ${car.name}
                </h3>

                <div class="carStats">

                    <span>
                        ⚡ ${car.speed}
                    </span>

                    <span>
                        🏁 ${car.accel}
                    </span>

                    <span>
                        ◆ ${car.grip}
                    </span>

                </div>

            </div>
        `;


        button.addEventListener(
            "click",
            () => {

                if (!owned) return;


                selectedCar =
                    car.id;

                save();

                renderGarage();

                updateGarage();

            }
        );


        grid.appendChild(button);

    });


    updateGarage();

}


/* =========================================================
   GARAGE DÉTAILS
   ========================================================= */

function updateGarage() {

    const car =
        cars.find(
            c => c.id === selectedCar
        ) ||
        cars[0];


    if ($("garageCarName"))
        $("garageCarName").textContent =
            car.name;


    if ($("garageSpeed"))
        $("garageSpeed").textContent =
            `${car.speed} km/h`;


    if ($("garageAccel"))
        $("garageAccel").textContent =
            car.accel;


    if ($("garageGrip"))
        $("garageGrip").textContent =
            car.grip;


    drawGarageCar(car);

}


/* =========================================================
   DESSIN GARAGE
   ========================================================= */

function drawGarageCar(car) {

    const c =
        $("garageCanvas");

    if (!c) return;


    const context =
        c.getContext("2d");

    if (!context) return;


    const w = c.width;
    const h = c.height;


    context.clearRect(
        0,
        0,
        w,
        h
    );


    context.fillStyle =
        "#090b10";

    context.fillRect(
        0,
        0,
        w,
        h
    );


    context.save();

    context.translate(
        w / 2,
        h / 2
    );


    context.scale(
        2.1,
        2.1
    );


    drawCar(
        context,
        0,
        0,
        0,
        true,
        false
    );


    context.restore();

}


/* =========================================================
   BOUTIQUE
   ========================================================= */

function renderShop() {

    const grid =
        $("shopCars");

    if (!grid) return;


    grid.innerHTML = "";


    cars.forEach(car => {

        const owned =
            ownedCars.includes(car.id);


        const card =
            document.createElement(
                "div"
            );

        card.className =
            "shopCarCard";


        card.innerHTML = `

            <div class="carPreview">

                <div class="miniCar">

                    <span
                        class="miniWindow"
                    ></span>

                    <span
                        class="miniWheel wheel1"
                    ></span>

                    <span
                        class="miniWheel wheel2"
                    ></span>

                </div>

            </div>

            <div class="shopCarInfo">

                <h3>
                    ${car.name}
                </h3>

                <p>
                    Vitesse :
                    <strong>
                        ${car.speed} km/h
                    </strong>
                </p>

                <p>
                    Accélération :
                    <strong>
                        ${car.accel}
                    </strong>
                </p>

                <p>
                    Adhérence :
                    <strong>
                        ${car.grip}
                    </strong>
                </p>

                <button
                    type="button"
                    class="buyCarButton"
                    data-buy="${car.id}"
                    ${owned ? "disabled" : ""}
                >
                    ${
                        owned
                            ? "DÉJÀ POSSÉDÉE"
                            : `💰 ${car.price}`
                    }
                </button>

            </div>
        `;


        grid.appendChild(card);

    });

}


/* =========================================================
   ACHAT
   ========================================================= */

function buyCar(id) {

    const car =
        cars.find(
            c => c.id === id
        );

    if (!car) return;


    if (
        ownedCars.includes(id)
    ) {
        return;
    }


    if (
        coins < car.price
    ) {

        alert(
            `Il te faut ${car.price} coins.`
        );

        return;

    }


    coins -= car.price;

    ownedCars.push(id);

    save();

    updateCoins();

    renderShop();

    renderGarage();

}


/* =========================================================
   CRÉATION CIRCUIT
   ========================================================= */

function createTrackPoints(track) {

    const points = [];

    const count = 240;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const angle =
            Math.PI * 2 *
            i / count;


        let rx = 1250;

        let ry = 760;


        if (
            track.environment ===
            "mountain"
        ) {

            rx +=
                Math.sin(
                    angle * 4
                ) * 130;

            ry +=
                Math.cos(
                    angle * 3
                ) * 90;

        }


        if (
            track.environment ===
            "neon"
        ) {

            rx +=
                Math.sin(
                    angle * 6
                ) * 90;

            ry +=
                Math.cos(
                    angle * 5
                ) * 70;

        }


        points.push({

            x:
                Math.cos(angle) *
                rx,

            y:
                Math.sin(angle) *
                ry

        });

    }


    return points;

}


/* =========================================================
   COURSE
   ========================================================= */

function startRace(track) {

    if (!track) return;


    const car =
        cars.find(
            c => c.id === selectedCar
        ) ||
        cars[0];


    selectedTrack =
        track;


    race = {

        track,

        car,

        points:
            createTrackPoints(track),


        player: {

            progress: 0,

            lateral: 0,

            speed: 0,

            nitro: 100,

            nitroActive: false,

            lap: 1,

            finished: false

        },


        opponents: [],

        countdown: 3,

        countdownTimer: 0,

        started: false,

        elapsed: 0,

        position: 1

    };


    createOpponents();


    resetControls();


    showScreen("race");


    resizeCanvas();


    updateRaceUI();


    startLoop();

}


/* =========================================================
   ADVERSAIRES
   ========================================================= */

function createOpponents() {

    race.opponents = [];


    const available =
        cars.slice(1);


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const car =
            available[
                i % available.length
            ];


        race.opponents.push({

            id: i,

            car,

            progress:
                -0.015 *
                (i + 1),

            lateral:
                (Math.random() - .5)
                * .45,

            speed:
                car.speed *
                (.87 + Math.random() * .08),

            nitro: 100,

            nitroActive: false,

            boostTimer:
                2 + Math.random() * 5

        });

    }

}


/* =========================================================
   CONTRÔLES
   ========================================================= */

const controls = {

    left: false,

    right: false,

    accelerate: false,

    brake: false,

    nitro: false

};


function resetControls() {

    Object.keys(controls)
        .forEach(key => {

            controls[key] = false;

        });

}


/* =========================================================
   CLAVIER
   ========================================================= */

function setupKeyboard() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                !race ||
                !$("race").classList.contains("active")
            ) {
                return;
            }


            const key =
                event.key.toLowerCase();


            if (
                key === "arrowleft" ||
                key === "q"
            ) {

                controls.left = true;

                event.preventDefault();

            }


            if (
                key === "arrowright" ||
                key === "d"
            ) {

                controls.right = true;

                event.preventDefault();

            }


            if (
                key === "arrowup" ||
                key === "z"
            ) {

                controls.accelerate = true;

                event.preventDefault();

            }


            if (
                key === "arrowdown" ||
                key === "s"
            ) {

                controls.brake = true;

                event.preventDefault();

            }


            if (
                key === "shift" ||
                key === "n"
            ) {

                controls.nitro = true;

                event.preventDefault();

            }

        }
    );


    document.addEventListener(
        "keyup",
        event => {

            const key =
                event.key.toLowerCase();


            if (
                key === "arrowleft" ||
                key === "q"
            )
                controls.left = false;


            if (
                key === "arrowright" ||
                key === "d"
            )
                controls.right = false;


            if (
                key === "arrowup" ||
                key === "z"
            )
                controls.accelerate = false;


            if (
                key === "arrowdown" ||
                key === "s"
            )
                controls.brake = false;


            if (
                key === "shift" ||
                key === "n"
            )
                controls.nitro = false;

        }
    );

}


/* =========================================================
   BOUTONS TACTILES
   ========================================================= */

function bindHold(id, property) {

    const button =
        $(id);

    if (!button) return;


    const down = event => {

        event.preventDefault();

        controls[property] = true;

    };


    const up = event => {

        event.preventDefault();

        controls[property] = false;

    };


    button.addEventListener(
        "pointerdown",
        down
    );

    button.addEventListener(
        "pointerup",
        up
    );

    button.addEventListener(
        "pointercancel",
        up
    );

    button.addEventListener(
        "pointerleave",
        up
    );


    button.addEventListener(
        "touchstart",
        down,
        { passive: false }
    );

    button.addEventListener(
        "touchend",
        up,
        { passive: false }
    );

}


/* =========================================================
   PHYSIQUE JOUEUR
   ========================================================= */

function updatePlayer(dt) {

    if (
        !race ||
        !race.started
    ) {
        return;
    }


    const p =
        race.player;

    const car =
        race.car;


    /* ACCÉLÉRATION */

    if (
        controls.accelerate
    ) {

        p.speed +=
            car.accel *
            dt;

    } else {

        p.speed -=
            7 *
            dt;

    }


    /* FREIN */

    if (
        controls.brake
    ) {

        p.speed -=
            40 *
            dt;

    }


    /* NITRO */

    if (
        controls.nitro &&
        p.nitro > 1 &&
        p.speed > 35
    ) {

        p.nitroActive = true;

        p.speed +=
            car.accel *
            2.3 *
            dt;

        p.nitro -=
            30 *
            dt;

    } else {

        p.nitroActive = false;

        p.nitro +=
            11 *
            dt;

    }


    p.nitro =
        clamp(
            p.nitro,
            0,
            100
        );


    const maxSpeed =
        car.speed +
        (
            p.nitroActive
                ? car.nitro
                : 0
        );


    p.speed =
        clamp(
            p.speed,
            0,
            maxSpeed
        );


    /* DIRECTION */

    const steering =
        .72 *
        car.handling *
        (
            .35 +
            p.speed /
            car.speed
        );


    if (controls.left) {

        p.lateral -=
            steering *
            dt;

    }


    if (controls.right) {

        p.lateral +=
            steering *
            dt;

    }


    p.lateral =
        clamp(
            p.lateral,
            -.8,
            .8
        );


    if (
        !controls.left &&
        !controls.right
    ) {

        p.lateral =
            lerp(
                p.lateral,
                0,
                dt * 1.8
            );

    }


    /* PROGRESSION */

    const meters =
        p.speed /
        3.6 *
        dt;


    p.progress +=
        meters /
        race.track.length;


    p.lap =
        Math.min(
            race.track.laps,
            Math.floor(
                p.progress
            ) + 1
        );


    if (
        p.progress >=
        race.track.laps
    ) {

        p.finished = true;

        finishRace();

    }

}


/* =========================================================
   ADVERSAIRES
   ========================================================= */

function updateOpponents(dt) {

    if (
        !race ||
        !race.started
    ) {
        return;
    }


    race.opponents.forEach(
        opponent => {

            opponent.boostTimer -= dt;


            if (
                opponent.boostTimer <= 0 &&
                opponent.nitro > 25
            ) {

                opponent.nitroActive =
                    true;

                opponent.boostTimer =
                    4 +
                    Math.random() * 4;

            }


            if (
                opponent.nitroActive
            ) {

                opponent.nitro -=
                    30 *
                    dt;

                if (
                    opponent.nitro <= 0
                ) {

                    opponent.nitro = 0;

                    opponent.nitroActive =
                        false;

                }

            } else {

                opponent.nitro =
                    clamp(
                        opponent.nitro +
                        8 *
                        dt,
                        0,
                        100
                    );

            }


            const target =
                opponent.car.speed *
                .92;


            if (
                opponent.speed <
                target
            ) {

                opponent.speed +=
                    opponent.car.accel *
                    dt;

            } else {

                opponent.speed -=
                    4 *
                    dt;

            }


            const max =
                opponent.car.speed +
                (
                    opponent.nitroActive
                        ? opponent.car.nitro
                        : 0
                );


            opponent.speed =
                clamp(
                    opponent.speed,
                    0,
                    max
                );


            opponent.progress +=
                (
                    opponent.speed /
                    3.6
                ) /
                race.track.length *
                dt;


            opponent.lateral =
                Math.sin(
                    race.elapsed *
                    .6 +
                    opponent.id
                ) *
                .25;

        }
    );

}


/* =========================================================
   CLASSEMENT
   ========================================================= */

function getPosition() {

    if (!race) return 1;


    let position = 1;


    race.opponents.forEach(
        opponent => {

            if (
                opponent.progress >
                race.player.progress
            ) {

                position++;

            }

        }
    );


    return position;

}


/* =========================================================
   HUD
   ========================================================= */

function updateRaceUI() {

    if (!race) return;


    const position =
        getPosition();


    race.position =
        position;


    if ($("positionNumber"))
        $("positionNumber").textContent =
            position;


    if ($("lapText"))
        $("lapText").textContent =
            `${race.player.lap} / ${race.track.laps}`;


    if ($("speedText"))
        $("speedText").textContent =
            Math.round(
                race.player.speed
            );


    if ($("raceTrackName"))
        $("raceTrackName").textContent =
            race.track.name;


    if ($("raceCarName"))
        $("raceCarName").textContent =
            race.car.name;


    const lapProgress =
        (
            race.player.progress -
            Math.floor(
                race.player.progress
            )
        ) * 100;


    if ($("lapFill"))
        $("lapFill").style.width =
            `${clamp(
                lapProgress,
                0,
                100
            )}%`;


    updateNitro();

}


/* =========================================================
   NITRO UI
   ========================================================= */

function updateNitro() {

    if (!race) return;


    if ($("nitroFill"))
        $("nitroFill").style.width =
            `${race.player.nitro}%`;


    if ($("nitroButton")) {

        $("nitroButton")
            .classList.toggle(
                "nitroActive",
                race.player.nitroActive
            );


        $("nitroButton").disabled =
            race.player.nitro <= 1;

    }

}


/* =========================================================
   CANVAS
   ========================================================= */

function resizeCanvas() {

    canvas =
        $("raceCanvas");

    if (!canvas) return;


    ctx =
        canvas.getContext(
            "2d"
        );

    if (!ctx) return;


    const rect =
        canvas.getBoundingClientRect();


    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    canvas.width =
        Math.max(
            1,
            Math.floor(
                rect.width *
                dpr
            )
        );


    canvas.height =
        Math.max(
            1,
            Math.floor(
                rect.height *
                dpr
            )
        );


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

}


/* =========================================================
   POINT CIRCUIT
   ========================================================= */

function getPoint(progress) {

    const points =
        race.points;


    const wrapped =
        (
            progress -
            Math.floor(progress)
        ) *
        points.length;


    const index =
        Math.floor(
            wrapped
        ) %
        points.length;


    const next =
        (
            index + 1
        ) %
        points.length;


    const t =
        wrapped -
        Math.floor(
            wrapped
        );


    return {

        x:
            lerp(
                points[index].x,
                points[next].x,
                t
            ),

        y:
            lerp(
                points[index].y,
                points[next].y,
                t
            )

    };

}


/* =========================================================
   ANGLE
   ========================================================= */

function getAngle(progress) {

    const a =
        getPoint(
            progress
        );

    const b =
        getPoint(
            progress + .003
        );


    return Math.atan2(
        b.y - a.y,
        b.x - a.x
    );

}


/* =========================================================
   DESSIN
   ========================================================= */

function drawRace() {

    if (
        !canvas ||
        !ctx ||
        !race
    ) return;


    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    drawBackground(
        width,
        height
    );


    drawWorld(
        width,
        height
    );


    drawCars(
        width,
        height
    );


    if (
        race.player.nitroActive
    ) {

        drawNitroEffects(
            width,
            height
        );

    }


    drawCountdown(
        width,
        height
    );

}


/* =========================================================
   FOND
   ========================================================= */

function drawBackground(
    width,
    height
) {

    let top =
        "#111827";

    let bottom =
        "#46505e";


    if (
        race.track.environment ===
        "sunset"
    ) {

        top =
            "#100e25";

        bottom =
            "#b45e43";

    }


    if (
        race.track.environment ===
        "mountain"
    ) {

        top =
            "#08121b";

        bottom =
            "#46575d";

    }


    if (
        race.track.environment ===
        "neon"
    ) {

        top =
            "#05050c";

        bottom =
            "#17163b";

    }


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            height
        );


    gradient.addColorStop(
        0,
        top
    );

    gradient.addColorStop(
        1,
        bottom
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        width,
        height
    );

}


/* =========================================================
   MONDE
   ========================================================= */

function drawWorld(
    width,
    height
) {

    const center =
        getPoint(
            race.player.progress
        );


    ctx.save();


    ctx.translate(
        width / 2 -
            center.x * .55,

        height / 2 -
            center.y * .55
    );


    ctx.fillStyle =
        race.track.environment ===
        "neon"
            ? "#111126"
            : "#354431";


    ctx.fillRect(
        -5000,
        -5000,
        10000,
        10000
    );


    drawRoad();


    drawDecor();


    ctx.restore();

}


/* =========================================================
   ROUTE
   ========================================================= */

function drawRoad() {

    const points =
        race.points;


    function road(
        width,
        color
    ) {

        ctx.beginPath();


        points.forEach(
            (point, index) => {

                if (
                    index === 0
                ) {

                    ctx.moveTo(
                        point.x,
                        point.y
                    );

                } else {

                    ctx.lineTo(
                        point.x,
                        point.y
                    );

                }

            }
        );


        ctx.closePath();


        ctx.lineJoin =
            "round";

        ctx.lineCap =
            "round";

        ctx.lineWidth =
            width;

        ctx.strokeStyle =
            color;

        ctx.stroke();

    }


    road(
        430,
        "#eeeeee"
    );


    road(
        395,
        "#17191d"
    );


    road(
        350,
        "#303237"
    );


    ctx.beginPath();


    points.forEach(
        (point, index) => {

            if (
                index % 7 !== 0
            ) return;


            if (
                index === 0
            ) {

                ctx.moveTo(
                    point.x,
                    point.y
                );

            } else {

                ctx.lineTo(
                    point.x,
                    point.y
                );

            }

        }
    );


    ctx.lineWidth = 5;

    ctx.strokeStyle =
        "rgba(255,255,255,.28)";

    ctx.setLineDash(
        [30,25]
    );

    ctx.stroke();

    ctx.setLineDash([]);

}


/* =========================================================
   DÉCOR
   ========================================================= */

function drawDecor() {

    for (
        let i = 0;
        i < 90;
        i++
    ) {

        const p =
            getPoint(
                i / 90
            );


        const angle =
            i * .73;


        const distance =
            620 +
            (
                i % 5
            ) * 120;


        drawTree(
            p.x +
                Math.cos(angle) *
                distance,

            p.y +
                Math.sin(angle) *
                distance
        );

    }

}


function drawTree(x,y) {

    ctx.save();

    ctx.translate(
        x,
        y
    );


    ctx.fillStyle =
        "#47342a";

    ctx.fillRect(
        -6,
        5,
        12,
        45
    );


    ctx.beginPath();

    ctx.arc(
        0,
        0,
        35,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "#25452d";

    ctx.fill();


    ctx.restore();

}


/* =========================================================
   VOITURE
   ========================================================= */

function drawCar(
    context,
    x,
    y,
    angle,
    player,
    nitro
) {

    context.save();


    context.translate(
        x,
        y
    );


    context.rotate(
        angle
    );


    const scale =
        player
            ? .82
            : .62;


    context.scale(
        scale,
        scale
    );


    /* OMBRE */

    context.fillStyle =
        "rgba(0,0,0,.4)";


    context.beginPath();

    context.ellipse(
        0,
        13,
        52,
        19,
        0,
        0,
        Math.PI * 2
    );


    context.fill();


    /* NITRO */

    if (nitro) {

        context.beginPath();

        context.moveTo(
            -42,
            -7
        );

        context.lineTo(
            -85,
            0
        );

        context.lineTo(
            -42,
            7
        );

        context.closePath();


        context.fillStyle =
            "#3edcff";


        context.fill();


        context.beginPath();

        context.moveTo(
            -45,
            -3
        );

        context.lineTo(
            -72,
            0
        );

        context.lineTo(
            -45,
            3
        );

        context.closePath();


        context.fillStyle =
            "#ffffff";


        context.fill();

    }


    /* CARROSSERIE */

    context.fillStyle =
        player
            ? "#e33d3d"
            : "#4477b9";


    roundRect(
        context,
        -50,
        -18,
        100,
        36,
        10
    );


    context.fill();


    /* TOIT */

    context.fillStyle =
        player
            ? "#a52228"
            : "#2d4d7b";


    roundRect(
        context,
        -25,
        -14,
        46,
        28,
        8
    );


    context.fill();


    /* VITRE */

    context.fillStyle =
        "#9bd7e6";


    roundRect(
        context,
        -17,
        -10,
        30,
        20,
        5
    );


    context.fill();


    /* PHARES */

    context.fillStyle =
        "#fff0a4";


    context.fillRect(
        41,
        -11,
        7,
        7
    );


    context.fillRect(
        41,
        4,
        7,
        7
    );


    /* ROUES */

    drawWheel(
        context,
        -28,
        -19
    );

    drawWheel(
        context,
        -28,
        19
    );

    drawWheel(
        context,
        27,
        -19
    );

    drawWheel(
        context,
        27,
        19
    );


    context.restore();

}


function drawWheel(
    context,
    x,
    y
) {

    context.fillStyle =
        "#090909";


    roundRect(
        context,
        x - 6,
        y - 5,
        12,
        10,
        3
    );


    context.fill();

}


/* =========================================================
   RECTANGLE COMPATIBLE
   ========================================================= */

function roundRect(
    context,
    x,
    y,
    width,
    height,
    radius
) {

    const r =
        Math.min(
            radius,
            width / 2,
            height / 2
        );


    context.beginPath();


    context.moveTo(
        x + r,
        y
    );


    context.lineTo(
        x + width - r,
        y
    );


    context.quadraticCurveTo(
        x + width,
        y,
        x + width,
        y + r
    );


    context.lineTo(
        x + width,
        y + height - r
    );


    context.quadraticCurveTo(
        x + width,
        y + height,
        x + width - r,
        y + height
    );


    context.lineTo(
        x + r,
        y + height
    );


    context.quadraticCurveTo(
        x,
        y + height,
        x,
        y + height - r
    );


    context.lineTo(
        x,
        y + r
    );


    context.quadraticCurveTo(
        x,
        y,
        x + r,
        y
    );


    context.closePath();

}


/* =========================================================
   VOITURES DE COURSE
   ========================================================= */

function drawCars(
    width,
    height
) {

    const playerPoint =
        getPoint(
            race.player.progress
        );


    const playerAngle =
        getAngle(
            race.player.progress
        );


    const centerX =
        width / 2;


    const centerY =
        height / 2;


    race.opponents.forEach(
        opponent => {

            const distance =
                opponent.progress -
                race.player.progress;


            if (
                Math.abs(distance) >
                .13
            ) return;


            const point =
                getPoint(
                    opponent.progress
                );


            const angle =
                getAngle(
                    opponent.progress
                );


            const x =
                centerX +
                (
                    point.x -
                    playerPoint.x
                ) * .55 +
                opponent.lateral *
                70;


            const y =
                centerY +
                (
                    point.y -
                    playerPoint.y
                ) * .55;


            drawCar(
                ctx,
                x,
                y,
                angle,
                false,
                opponent.nitroActive
            );

        }
    );


    drawCar(
        ctx,
        centerX +
            race.player.lateral *
            100,

        centerY,

        playerAngle,

        true,

        race.player.nitroActive
    );

}


/* =========================================================
   EFFETS NITRO
   ========================================================= */

function drawNitroEffects(
    width,
    height
) {

    ctx.save();


    for (
        let i = 0;
        i < 22;
        i++
    ) {

        const y =
            height / 2 +
            (
                Math.random() -
                .5
            ) * 80;


        const length =
            30 +
            Math.random() *
            110;


        ctx.beginPath();


        ctx.moveTo(
            width / 2 - 45,
            y
        );


        ctx.lineTo(
            width / 2 -
                45 -
                length,
            y
        );


        ctx.strokeStyle =
            "rgba(90,220,255,.45)";


        ctx.lineWidth =
            1 +
            Math.random() * 3;


        ctx.stroke();

    }


    ctx.restore();

}


/* =========================================================
   COMPTE À REBOURS
   ========================================================= */

function drawCountdown(
    width,
    height
) {

    if (
        race.started
    ) return;


    const number =
        Math.ceil(
            race.countdown
        );


    ctx.save();


    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    ctx.font =
        "900 90px Arial";


    ctx.shadowColor =
        "#000";

    ctx.shadowBlur =
        25;


    ctx.fillStyle =
        "#fff";


    ctx.fillText(
        number > 0
            ? number
            : "GO!",
        width / 2,
        height / 2
    );


    ctx.restore();

}


/* =========================================================
   BOUCLE
   ========================================================= */

function startLoop() {

    stopLoop();


    lastTime =
        performance.now();


    animationId =
        requestAnimationFrame(
            loop
        );

}


function stopLoop() {

    if (
        animationId !== null
    ) {

        cancelAnimationFrame(
            animationId
        );

        animationId = null;

    }

}


function loop(time) {

    if (
        !race ||
        !$("race").classList.contains(
            "active"
        )
    ) {

        return;

    }


    let dt =
        (
            time -
            lastTime
        ) / 1000;


    lastTime =
        time;


    dt =
        clamp(
            dt,
            0,
            .05
        );


    if (
        !race.started
    ) {

        race.countdownTimer +=
            dt;


        race.countdown =
            3 -
            race.countdownTimer;


        if (
            race.countdown <= 0
        ) {

            race.countdown = 0;

            race.started = true;

        }

    } else {

        race.elapsed += dt;

        updatePlayer(dt);

        updateOpponents(dt);

        updateRaceUI();

    }


    drawRace();


    animationId =
        requestAnimationFrame(
            loop
        );

}


/* =========================================================
   FIN COURSE
   ========================================================= */

function finishRace() {

    if (
        !race ||
        race.finished
    ) return;


    race.finished = true;


    stopLoop();


    const position =
        getPosition();


    let reward = 250;

    let medal = "🏅";


    if (
        position === 1
    ) {

        reward = 1500;
        medal = "🥇";

    } else if (
        position === 2
    ) {

        reward = 1000;
        medal = "🥈";

    } else if (
        position === 3
    ) {

        reward = 500;
        medal = "🥉";

    } else if (
        position === 4
    ) {

        reward = 350;

    } else if (
        position === 5
    ) {

        reward = 300;

    }


    coins += reward;


    save();

    updateCoins();


    if ($("resultIcon"))
        $("resultIcon").textContent =
            medal;


    if ($("resultTitle"))
        $("resultTitle").textContent =
            position === 1
                ? "VICTOIRE !"
                : "COURSE TERMINÉE";


    if ($("resultMessage"))
        $("resultMessage").textContent =
            `Tu termines ${position}${position === 1 ? "er" : "e"} sur 8.`;


    if ($("rewardCoins"))
        $("rewardCoins").textContent =
            reward;


    const overlay =
        $("resultOverlay");


    if (overlay)
        overlay.classList.add(
            "show"
        );

}


/* =========================================================
   PAUSE
   ========================================================= */

function pauseRace() {

    if (!race) return;


    const overlay =
        $("pauseOverlay");


    if (overlay)
        overlay.classList.add(
            "show"
        );


    stopLoop();

}


function resumeRace() {

    const overlay =
        $("pauseOverlay");


    if (overlay)
        overlay.classList.remove(
            "show"
        );


    startLoop();

}


function restartRace() {

    if (
        selectedTrack
    ) {

        const overlay =
            $("pauseOverlay");


        if (overlay)
            overlay.classList.remove(
                "show"
            );


        startRace(
            selectedTrack
        );

    }

}


function quitRace() {

    stopLoop();


    race = null;


    if ($("pauseOverlay"))
        $("pauseOverlay")
            .classList.remove(
                "show"
            );


    if ($("resultOverlay"))
        $("resultOverlay")
            .classList.remove(
                "show"
            );


    showScreen(
        "tracks"
    );


    renderTracks();

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {


    /* COMMENCER */

    const start =
        $("startButton");


    if (start) {

        start.addEventListener(
            "click",
            event => {

                event.preventDefault();

                renderTracks();

                updateCoins();

                showScreen(
                    "tracks"
                );

            }
        );

    }


    /* GARAGE */

    const garage =
        $("garageButton");


    if (garage) {

        garage.addEventListener(
            "click",
            () => {

                renderGarage();

                updateCoins();

                showScreen(
                    "garage"
                );

            }
        );

    }


    /* BOUTIQUE */

    const shop =
        $("shopButton");


    if (shop) {

        shop.addEventListener(
            "click",
            () => {

                renderShop();

                updateCoins();

                showScreen(
                    "shop"
                );

            }
        );

    }


    /* CIRCUITS */

    const grid =
        $("trackGrid");


    if (grid) {

        grid.addEventListener(
            "click",
            event => {

                const card =
                    event.target.closest(
                        ".trackCard"
                    );


                if (!card) return;


                const track =
                    tracks.find(
                        t =>
                            t.id ===
                            card.dataset.track
                    );


                if (!track) return;


                startRace(
                    track
                );

            }
        );

    }


    /* RETOUR */

    document
        .querySelectorAll(
            "[data-back]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const target =
                            button.dataset.back;


                        if (
                            target ===
                            "lobby"
                        ) {

                            showScreen(
                                "lobby"
                            );

                            updateCoins();

                        }

                    }
                );

            }
        );


    /* PAUSE */

    if ($("pauseRaceButton"))
        $("pauseRaceButton")
            .addEventListener(
                "click",
                pauseRace
            );


    if ($("resumeButton"))
        $("resumeButton")
            .addEventListener(
                "click",
                resumeRace
            );


    if ($("restartButton"))
        $("restartButton")
            .addEventListener(
                "click",
                restartRace
            );


    if ($("quitButton"))
        $("quitButton")
            .addEventListener(
                "click",
                quitRace
            );


    /* RESULTAT */

    if ($("returnTracksButton"))
        $("returnTracksButton")
            .addEventListener(
                "click",
                () => {

                    if ($("resultOverlay"))
                        $("resultOverlay")
                            .classList.remove(
                                "show"
                            );


                    showScreen(
                        "tracks"
                    );


                    renderTracks();

                }
            );


    if ($("nextRaceButton"))
        $("nextRaceButton")
            .addEventListener(
                "click",
                () => {

                    if ($("resultOverlay"))
                        $("resultOverlay")
                            .classList.remove(
                                "show"
                            );


                    const index =
                        tracks.findIndex(
                            t =>
                                t.id ===
                                selectedTrack?.id
                        );


                    const next =
                        tracks[
                            index + 1
                        ];


                    if (next) {

                        startRace(
                            next
                        );

                    } else {

                        showScreen(
                            "tracks"
                        );

                        renderTracks();

                    }

                }
            );

}


/* =========================================================
   BOUTIQUE
   ========================================================= */

function setupShop() {

    const shop =
        $("shopCars");


    if (!shop) return;


    shop.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-buy]"
                );


            if (!button) return;


            buyCar(
                button.dataset.buy
            );

        }
    );

}


/* =========================================================
   AUTRES
   ========================================================= */

function setupResize() {

    window.addEventListener(
        "resize",
        () => {

            if (
                $("race") &&
                $("race").classList.contains(
                    "active"
                )
            ) {

                resizeCanvas();

            }

        }
    );

}


function setupVisibility() {

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden
            ) {

                resetControls();

            }

        }
    );

}


/* =========================================================
   INITIALISATION
   ========================================================= */

function init() {

    console.log(
        "🏁 GAME ZONE — SPEED RACE OK"
    );


    save();


    updateCoins();


    renderTracks();

    renderGarage();

    renderShop();


    setupNavigation();

    setupShop();

    setupKeyboard();

    setupTouchControls();

    setupResize();

    setupVisibility();


    showScreen(
        "lobby"
    );

}


/* =========================================================
   CONTRÔLES TACTILES
   ========================================================= */

function setupTouchControls() {

    bindHold(
        "steerLeft",
        "left"
    );

    bindHold(
        "steerRight",
        "right"
    );

    bindHold(
        "brakeButton",
        "brake"
    );

    bindHold(
        "acceleratorButton",
        "accelerate"
    );

    bindHold(
        "nitroButton",
        "nitro"
    );

}


/* =========================================================
   DÉMARRAGE DOM
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        init,
        {
            once: true
        }
    );

} else {

    init();

}

})();