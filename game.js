"use strict";

/* =========================================================
   GAME ZONE
   BLOX FRUIT RPG
   CAMERA + TERRAIN + COLLISIONS + FRUITS
   ========================================================= */


/* =========================================================
   DOM
   ========================================================= */

const $ = id =>
    document.getElementById(id);


function text(id,value){

    const el=$(id);

    if(el)
        el.textContent=value;
}


function style(id,key,value){

    const el=$(id);

    if(el)
        el.style[key]=value;
}


/* =========================================================
   THREE
   ========================================================= */

const canvas=$("world");


const scene=
    new THREE.Scene();


scene.background=
    new THREE.Color(
        0x82b9df
    );


scene.fog=
    new THREE.Fog(
        0x82b9df,
        180,
        1200
    );


const camera=
    new THREE.PerspectiveCamera(
        60,
        innerWidth/
        innerHeight,
        .1,
        2000
    );


camera.position.set(
    0,
    9,
    15
);


const renderer=
    new THREE.WebGLRenderer({

        canvas,

        antialias:true,

        powerPreference:
            "high-performance"
    });


renderer.setSize(
    innerWidth,
    innerHeight
);


renderer.setPixelRatio(
    Math.min(
        devicePixelRatio,
        1.7
    )
);


renderer.shadowMap.enabled=true;


renderer.shadowMap.type=
    THREE.PCFSoftShadowMap;


/* =========================================================
   LIGHT
   ========================================================= */

const hemi=
    new THREE.HemisphereLight(
        0xffffff,
        0x35556d,
        1.7
    );


scene.add(hemi);


const sun=
    new THREE.DirectionalLight(
        0xffffff,
        2
    );


sun.position.set(
    100,
    180,
    80
);


sun.castShadow=true;


sun.shadow.mapSize.width=1024;
sun.shadow.mapSize.height=1024;


scene.add(sun);


/* =========================================================
   WORLD CONSTANTS
   ========================================================= */

const GROUND_Y=2.93;


/* =========================================================
   HELPERS
   ========================================================= */

function material(
    color,
    roughness=.8
){

    return new THREE.MeshStandardMaterial({

        color,

        roughness,

        metalness:.03
    });
}


function box(
    x,
    y,
    z,
    color
){

    const mesh=
        new THREE.Mesh(

            new THREE.BoxGeometry(
                x,
                y,
                z
            ),

            material(color)
        );


    mesh.castShadow=true;

    mesh.receiveShadow=true;


    return mesh;
}


function sphere(
    radius,
    color
){

    const mesh=
        new THREE.Mesh(

            new THREE.SphereGeometry(
                radius,
                16,
                12
            ),

            material(color)
        );


    mesh.castShadow=true;

    mesh.receiveShadow=true;


    return mesh;
}


function clamp(
    n,
    min,
    max
){

    return Math.max(
        min,
        Math.min(
            max,
            n
        )
    );
}


/* =========================================================
   OCEAN
   ========================================================= */

const ocean=
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            1800,
            1800
        ),

        material(
            0x2384b8,
            .7
        )
    );


ocean.rotation.x=
    -Math.PI/2;


ocean.position.y=0;


ocean.receiveShadow=true;


scene.add(ocean);


/* =========================================================
   ISLANDS
   ========================================================= */

const islandData=[

    {
        name:"Île Amateur",
        sea:1,
        x:0,
        z:0,
        radius:47,
        level:1,
        ground:0x57a83f,
        dirt:0x8e5e39,
        theme:"pirate"
    },

    {
        name:"Jungle",
        sea:1,
        x:105,
        z:-5,
        radius:46,
        level:25,
        ground:0x319b4d,
        dirt:0x684932,
        theme:"jungle"
    },

    {
        name:"Désert",
        sea:1,
        x:212,
        z:7,
        radius:47,
        level:80,
        ground:0xd7a943,
        dirt:0x9b682d,
        theme:"desert"
    },

    {
        name:"Village Magma",
        sea:1,
        x:321,
        z:-7,
        radius:49,
        level:350,
        ground:0x923b31,
        dirt:0x4b2824,
        theme:"magma"
    },

    {
        name:"Colonne du Destin",
        sea:1,
        x:430,
        z:7,
        radius:44,
        level:400,
        ground:0x76609e,
        dirt:0x433752,
        theme:"destiny"
    },

    {
        name:"Kingdom Rose",
        sea:2,
        x:540,
        z:-7,
        radius:51,
        level:650,
        ground:0xc96d91,
        dirt:0x75465c,
        theme:"kingdom"
    },

    {
        name:"Île des Fleurs",
        sea:2,
        x:652,
        z:7,
        radius:49,
        level:700,
        ground:0x55ad68,
        dirt:0x725038,
        theme:"flowers"
    },

    {
        name:"Frozen Village",
        sea:3,
        x:764,
        z:-7,
        radius:51,
        level:750,
        ground:0xb9e7f4,
        dirt:0x7895a5,
        theme:"ice"
    }

];


const islands=[];


/* =========================================================
   COLLIDERS
   ========================================================= */

const colliders=[];


function addCollider(
    x,
    z,
    radiusX,
    radiusZ,
    type="object"
){

    colliders.push({

        x,
        z,

        radiusX,
        radiusZ,

        type
    });
}


/* =========================================================
   ISLAND
   ========================================================= */

function createIsland(data){

    const island=
        new THREE.Group();


    island.position.set(
        data.x,
        0,
        data.z
    );


    island.userData=data;


    const shape=
        new THREE.Shape();


    const points=32;


    for(let i=0;i<points;i++){

        const angle=
            i/points*
            Math.PI*2;


        const radius=
            data.radius*
            (
                .90+
                Math.random()*.13
            );


        const x=
            Math.cos(angle)*
            radius;


        const y=
            Math.sin(angle)*
            radius;


        if(i===0){

            shape.moveTo(
                x,
                y
            );

        }else{

            shape.lineTo(
                x,
                y
            );
        }
    }


    shape.closePath();


    const geometry=
        new THREE.ExtrudeGeometry(
            shape,
            {

                depth:3,

                bevelEnabled:true,

                bevelSegments:2,

                bevelSize:.7,

                bevelThickness:.6
            }
        );


    geometry.rotateX(
        -Math.PI/2
    );


    const ground=
        new THREE.Mesh(
            geometry,
            material(data.dirt)
        );


    ground.position.y=-.5;

    ground.receiveShadow=true;

    ground.castShadow=true;


    island.add(ground);


    const grass=
        new THREE.Mesh(

            new THREE.CylinderGeometry(

                data.radius*.97,

                data.radius,

                .42,

                40
            ),

            material(data.ground)
        );


    grass.position.y=2.72;


    grass.receiveShadow=true;


    island.add(grass);


    createDecorations(
        island,
        data
    );


    scene.add(island);


    islands.push(island);


    return island;
}


islandData.forEach(
    createIsland
);


/* =========================================================
   DECORATIONS
   ========================================================= */

function createDecorations(
    island,
    data
){

    const theme=
        data.theme;


    /* =================
       HERBE / PETITES PLANTES
    ================= */

    for(let i=0;i<35;i++){

        const angle=
            Math.random()*
            Math.PI*2;


        const radius=
            Math.random()*
            data.radius*.82;


        const x=
            Math.cos(angle)*
            radius;


        const z=
            Math.sin(angle)*
            radius;


        if(
            theme==="desert" &&
            Math.random()<.8
        )
            continue;


        const plant=
            box(
                .18,
                .7+
                Math.random()*.4,
                .18,
                theme==="ice"
                    ? 0x8fd3df
                    : 0x2e7c39
            );


        plant.position.set(
            x,
            GROUND_Y+.35,
            z
        );


        plant.rotation.z=
            (Math.random()-.5)*.4;


        island.add(plant);
    }


    /* =================
       ARBRES
    ================= */

    const treeCount=
        theme==="desert"
            ? 7
            : theme==="ice"
                ? 11
                : 18;


    for(let i=0;i<treeCount;i++){

        const angle=
            Math.random()*
            Math.PI*2;


        const radius=
            8+
            Math.random()*
            data.radius*.72;


        const x=
            Math.cos(angle)*
            radius;


        const z=
            Math.sin(angle)*
            radius;


        createTree(
            island,
            x,
            z,
            theme
        );
    }


    /* =================
       ROCHERS
    ================= */

    for(let i=0;i<14;i++){

        const angle=
            Math.random()*
            Math.PI*2;


        const radius=
            8+
            Math.random()*
            data.radius*.75;


        const x=
            Math.cos(angle)*
            radius;


        const z=
            Math.sin(angle)*
            radius;


        createRock(
            island,
            x,
            z,
            theme
        );
    }


    /* =================
       MAISONS
    ================= */

    const houses=
        theme==="desert"
            ? 5
            : 7;


    for(let i=0;i<houses;i++){

        const angle=
            i/houses*
            Math.PI*2;


        const radius=
            data.radius*.48;


        const x=
            Math.cos(angle)*
            radius;


        const z=
            Math.sin(angle)*
            radius;


        createHouse(
            island,
            x,
            z,
            theme
        );
    }
}


/* =========================================================
   TREE
   ========================================================= */

function createTree(
    island,
    x,
    z,
    theme
){

    const tree=
        new THREE.Group();


    const trunk=
        box(
            .75,
            4,
            .75,
            theme==="ice"
                ? 0x7899a5
                : 0x694329
        );


    trunk.position.y=
        GROUND_Y+2;


    tree.add(trunk);


    let leafColor=
        0x318c43;


    if(theme==="ice")
        leafColor=0xc6f0f7;


    if(theme==="magma")
        leafColor=0x3d6339;


    if(theme==="flowers")
        leafColor=0x287e3e;


    const leaves1=
        sphere(
            2.15,
            leafColor
        );


    leaves1.position.y=
        GROUND_Y+4.4;


    tree.add(leaves1);


    const leaves2=
        sphere(
            1.65,
            leafColor
        );


    leaves2.position.set(
        .9,
        GROUND_Y+5,
        .2
    );


    tree.add(leaves2);


    const leaves3=
        sphere(
            1.5,
            leafColor
        );


    leaves3.position.set(
        -.9,
        GROUND_Y+4.9,
        -.2
    );


    tree.add(leaves3);


    tree.position.set(
        x,
        0,
        z
    );


    tree.rotation.y=
        Math.random()*
        Math.PI;


    island.add(tree);


    /*
       Collision solide.
    */

    addCollider(
        island.position.x+x,
        island.position.z+z,
        1.8,
        1.8,
        "tree"
    );
}


/* =========================================================
   ROCK
   ========================================================= */

function createRock(
    island,
    x,
    z,
    theme
){

    const width=
        1.5+
        Math.random()*1.8;


    const height=
        1+
        Math.random()*1.4;


    const rock=
        box(
            width,
            height,
            width*.85,
            theme==="ice"
                ? 0x9ccbd5
                : 0x667078
        );


    rock.position.set(
        x,
        GROUND_Y+
        height/2,
        z
    );


    rock.rotation.y=
        Math.random()*
        Math.PI;


    island.add(rock);


    addCollider(
        island.position.x+x,
        island.position.z+z,
        width*.55,
        width*.55,
        "rock"
    );
}


/* =========================================================
   HOUSE
   ========================================================= */

function createHouse(
    island,
    x,
    z,
    theme
){

    const house=
        new THREE.Group();


    let bodyColor=0x76523b;

    let roofColor=0x923d35;


    if(theme==="desert"){

        bodyColor=0xb67a42;

        roofColor=0x7d4c29;
    }


    if(theme==="magma"){

        bodyColor=0x653a35;

        roofColor=0x3f211e;
    }


    if(theme==="kingdom"){

        bodyColor=0x8b5472;

        roofColor=0xd04f86;
    }


    if(theme==="ice"){

        bodyColor=0xc9e8ef;

        roofColor=0x78c9e2;
    }


    if(theme==="flowers"){

        bodyColor=0xa4774e;

        roofColor=0xc95769;
    }


    const body=
        box(
            7,
            5,
            6,
            bodyColor
        );


    body.position.y=
        GROUND_Y+2.5;


    house.add(body);


    const roof=
        box(
            8,
            1.3,
            7,
            roofColor
        );


    roof.position.y=
        GROUND_Y+5.6;


    roof.rotation.y=
        Math.PI/4;


    house.add(roof);


    const door=
        box(
            1.4,
            2.6,
            .25,
            0x35241d
        );


    door.position.set(
        0,
        GROUND_Y+1.3,
        -3.1
    );


    house.add(door);


    const windowColor=
        theme==="ice"
            ? 0xd5fbff
            : 0x79d8ef;


    const window1=
        box(
            1.35,
            1.15,
            .2,
            windowColor
        );


    window1.position.set(
        -2,
        GROUND_Y+2.7,
        -3.1
    );


    house.add(window1);


    const window2=
        window1.clone();


    window2.position.x=2;


    house.add(window2);


    /* petite cheminée */

    if(
        theme!=="desert"
    ){

        const chimney=
            box(
                .8,
                2,
                .8,
                0x583c35
            );


        chimney.position.set(
            2,
            GROUND_Y+6,
            1
        );


        house.add(chimney);
    }


    house.position.set(
        x,
        0,
        z
    );


    house.rotation.y=
        Math.random()*
        Math.PI;


    island.add(house);


    /*
       Grande zone rectangulaire
       de collision autour de la maison.
    */

    addCollider(
        island.position.x+x,
        island.position.z+z,
        4.4,
        4,
        "house"
    );
}


/* =========================================================
   BRIDGES
   ========================================================= */

for(
    let i=0;
    i<islandData.length-1;
    i++
){

    const a=
        islandData[i];

    const b=
        islandData[i+1];


    const dx=
        b.x-a.x;


    const dz=
        b.z-a.z;


    const length=
        Math.hypot(
            dx,
            dz
        );


    const bridge=
        box(
            length,
            .6,
            8,
            0x76523b
        );


    bridge.position.set(

        (a.x+b.x)/2,

        GROUND_Y-.3,

        (a.z+b.z)/2
    );


    bridge.rotation.y=
        -Math.atan2(
            dz,
            dx
        );


    scene.add(bridge);
}


/* =========================================================
   PLAYER
   ========================================================= */

function createCharacter(){

    const root=
        new THREE.Group();


    root.userData.parts={};


    const skin=
        material(
            0xffd36e
        );


    const shirt=
        material(
            0x2581d9
        );


    const pants=
        material(
            0x3d8f45
        );


    const hair=
        material(
            0x291b12
        );


    const leftLeg=
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .62,
                .9,
                .62
            ),
            pants
        );


    leftLeg.position.set(
        -.42,
        .45,
        0
    );


    root.add(leftLeg);


    const rightLeg=
        leftLeg.clone();


    rightLeg.position.x=.42;


    root.add(rightLeg);


    const torso=
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.65,
                1.1,
                1.15
            ),
            shirt
        );


    torso.position.y=1.45;


    root.add(torso);


    const head=
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.05,
                1.05,
                1.05
            ),
            skin
        );


    head.position.y=2.5;


    root.add(head);


    const hairMesh=
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.13,
                .28,
                1.12
            ),
            hair
        );


    hairMesh.position.y=3.05;


    root.add(hairMesh);


    function eye(x){

        const white=
            sphere(
                .115,
                0xffffff
            );


        white.position.set(
            x,
            2.57,
            -.535
        );


        root.add(white);


        const pupil=
            sphere(
                .055,
                0x111111
            );


        pupil.position.set(
            x,
            2.57,
            -.635
        );


        root.add(pupil);
    }


    eye(-.23);
    eye(.23);


    const leftArm=
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .42,
                1,
                .48
            ),
            skin
        );


    leftArm.position.set(
        -1.04,
        1.45,
        0
    );


    root.add(leftArm);


    const rightArm=
        leftArm.clone();


    rightArm.position.x=1.04;


    root.add(rightArm);


    root.userData.parts={
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        torso,
        head
    };


    return root;
}


const player=
    createCharacter();


player.position.set(
    0,
    GROUND_Y,
    0
);


scene.add(player);


/* =========================================================
   STATE
   ========================================================= */

const state={

    level:1,

    hp:100,

    maxHp:100,

    xp:0,

    coins:500,

    fragments:0,

    kills:0,

    questsDone:0,

    fruit:null,

    sword:"Poings",

    quest:null,

    target:null,

    currentIsland:null,

    sea:1,

    transformed:false
};


/* =========================================================
   FRUITS
   ========================================================= */

const fruits={

    Flame:{

        name:"Flame",

        price:2500,

        rarity:"Rare",

        color:0xff4a1f,

        damage:45,

        territoryColor:0xff431c
    },

    Ice:{

        name:"Ice",

        price:3000,

        rarity:"Rare",

        color:0x64e8ff,

        damage:50,

        territoryColor:0x54dff5
    },

    Gravity:{

        name:"Gravity",

        price:5500,

        rarity:"Legendary",

        color:0x963cff,

        damage:70,

        territoryColor:0x8b35db
    },

    Kitsune:{

        name:"Kitsune",

        price:12000,

        rarity:"Mythique",

        color:0xff742f,

        damage:90,

        territoryColor:0xff5526
    },

    Venom:{

        name:"Venom",

        price:18000,

        rarity:"Mythique",

        color:0x7cff36,

        damage:100,

        territoryColor:0x5ca82e
    }
};


/* =========================================================
   QUESTS
   ========================================================= */

const quests={

    "Île Amateur":{

        level:1,

        enemy:"Pirate Amateur",

        amount:3,

        reward:80,

        xp:120
    },

    "Jungle":{

        level:25,

        enemy:"Bandit Jungle",

        amount:3,

        reward:150,

        xp:250
    },

    "Désert":{

        level:80,

        enemy:"Bandit Désert",

        amount:3,

        reward:300,

        xp:450
    },

    "Village Magma":{

        level:350,

        enemy:"Soldat Magma",

        amount:3,

        reward:700,

        xp:900
    },

    "Colonne du Destin":{

        level:400,

        enemy:"Gardien du Destin",

        amount:3,

        reward:900,

        xp:1100
    },

    "Kingdom Rose":{

        level:650,

        enemy:"Kingdom Recruit",

        amount:3,

        reward:1400,

        xp:1600
    },

    "Île des Fleurs":{

        level:700,

        enemy:"Guerrier des Fleurs",

        amount:3,

        reward:1800,

        xp:2100
    },

    "Frozen Village":{

        level:750,

        enemy:"Guerrier de Glace",

        amount:3,

        reward:2500,

        xp:3000
    }
};


/* =========================================================
   MOBS
   ========================================================= */

const mobNames={

    "Île Amateur":
        "Pirate Amateur",

    "Jungle":
        "Bandit Jungle",

    "Désert":
        "Bandit Désert",

    "Village Magma":
        "Soldat Magma",

    "Colonne du Destin":
        "Gardien du Destin",

    "Kingdom Rose":
        "Kingdom Recruit",

    "Île des Fleurs":
        "Guerrier des Fleurs",

    "Frozen Village":
        "Guerrier de Glace"
};


const mobColors={

    "Île Amateur":0x344c72,

    "Jungle":0x3b6735,

    "Désert":0x9a6230,

    "Village Magma":0x812f2a,

    "Colonne du Destin":0x6c3d8e,

    "Kingdom Rose":0x9b476b,

    "Île des Fleurs":0x3f8652,

    "Frozen Village":0x497c91
};


const mobs=[];


function createMob(
    island
){

    const data=
        island.userData;


    const mob=
        createCharacter();


    /*
       Change quelques matériaux
       du personnage.
    */

    mob.userData.parts.torso.material=
        material(
            mobColors[data.name]
        );


    mob.userData.parts.leftLeg.material=
        material(0x30343b);


    mob.userData.parts.rightLeg.material=
        material(0x30343b);


    const angle=
        Math.random()*
        Math.PI*2;


    const radius=
        10+
        Math.random()*
        data.radius*.5;


    const homeX=
        data.x+
        Math.cos(angle)*
        radius;


    const homeZ=
        data.z+
        Math.sin(angle)*
        radius;


    mob.position.set(
        homeX,
        GROUND_Y,
        homeZ
    );


    mob.userData={

        type:"mob",

        name:
            mobNames[data.name],

        island,

        homeX,

        homeZ,

        alive:true,

        respawnTime:0,

        hp:
            100+
            data.level*.35,

        maxHp:
            100+
            data.level*.35,

        speed:1.4,

        animation:
            Math.random()*10,

        hurtTimer:0,

        attackTimer:0
    };


    scene.add(mob);


    mobs.push(mob);
}


for(
    const island of islands
){

    for(
        let i=0;
        i<4;
        i++
    ){

        createMob(island);
    }
}


/* =========================================================
   BOSSES
   ========================================================= */

function createBoss(
    island,
    name,
    level
){

    const boss=
        createCharacter();


    boss.scale.setScalar(
        1.65
    );


    boss.userData.parts.torso.material=
        material(0x9d2038);


    boss.userData.parts.leftLeg.material=
        material(0x252331);


    boss.userData.parts.rightLeg.material=
        material(0x252331);


    const data=
        island.userData;


    boss.position.set(
        data.x,
        GROUND_Y,
        data.z+13
    );


    boss.userData={

        type:"boss",

        name,

        level,

        island,

        homeX:data.x,

        homeZ:data.z+13,

        alive:true,

        respawnTime:0,

        hp:
            1000+
            level*4,

        maxHp:
            1000+
            level*4,

        speed:1.2,

        animation:0,

        hurtTimer:0,

        attackTimer:0
    };


    scene.add(boss);


    mobs.push(boss);
}


createBoss(
    islands[5],
    "Lieutenant Kingdom",
    680
);


createBoss(
    islands[6],
    "Orbitus",
    720
);


/* =========================================================
   NPCS
   ========================================================= */

const npcs=[];


function createNPC(
    island,
    type,
    x,
    z
){

    const npc=
        createCharacter();


    let color=0x256ad0;


    if(
        type==="Vendeur de fruits"
    )
        color=0xff5a4e;


    if(
        type==="Marchand d'épées"
    )
        color=0x7047c4;


    if(
        type==="Marchand"
    )
        color=0x9c6d35;


    if(
        type==="Dark Aigris"
    )
        color=0x17131e;


    npc.userData.parts.torso.material=
        material(color);


    npc.position.set(
        island.userData.x+x,
        GROUND_Y,
        island.userData.z+z
    );


    npc.userData={

        type:"npc",

        npcType:type,

        island,

        animation:
            Math.random()*10
    };


    scene.add(npc);


    npcs.push(npc);
}


for(
    const island of islands
){

    createNPC(
        island,
        "Maître des quêtes",
        -9,
        -8
    );


    createNPC(
        island,
        "Marchand",
        9,
        -8
    );


    createNPC(
        island,
        "Vendeur de fruits",
        -9,
        8
    );


    createNPC(
        island,
        "Marchand d'épées",
        9,
        8
    );


    createNPC(
        island,
        "Dark Aigris",
        0,
        14
    );
}


/* =========================================================
   COLLISION
   ========================================================= */

const PLAYER_RADIUS=.65;


function collidesAt(
    x,
    z
){

    for(
        const c of colliders
    ){

        const dx=
            x-c.x;


        const dz=
            z-c.z;


        const nx=
            dx/
            Math.max(
                c.radiusX,
                .01
            );


        const nz=
            dz/
            Math.max(
                c.radiusZ,
                .01
            );


        if(
            nx*nx+
            nz*nz<
            1
        ){

            return true;
        }
    }


    return false;
}


function movePlayerWithCollision(
    dx,
    dz
){

    const nextX=
        player.position.x+
        dx;


    if(
        !collidesAt(
            nextX,
            player.position.z
        )
    ){

        player.position.x=
            nextX;
    }


    const nextZ=
        player.position.z+
        dz;


    if(
        !collidesAt(
            player.position.x,
            nextZ
        )
    ){

        player.position.z=
            nextZ;
    }
}


/* =========================================================
   CAMERA SYSTEM
   ========================================================= */

let cameraYaw=0;

let cameraPitch=.35;


let cameraYawTarget=0;

let cameraPitchTarget=.35;


const cameraDistance=13;


const cameraHeight=3.8;


let cameraDragging=false;

let cameraPointerId=null;

let lastPointerX=0;

let lastPointerY=0;


/*
   Le côté droit de l'écran
   sert à regarder autour.

   Les boutons et le joystick
   restent utilisables.
*/

canvas.addEventListener(
    "pointerdown",
    event=>{

        cameraDragging=true;

        cameraPointerId=
            event.pointerId;

        lastPointerX=
            event.clientX;

        lastPointerY=
            event.clientY;

        try{
            canvas.setPointerCapture(
                event.pointerId
            );
        }catch(e){}
    }
);


canvas.addEventListener(
    "pointermove",
    event=>{

        if(
            !cameraDragging ||
            event.pointerId!==
            cameraPointerId
        )
            return;


        const dx=
            event.clientX-
            lastPointerX;


        const dy=
            event.clientY-
            lastPointerY;


        lastPointerX=
            event.clientX;


        lastPointerY=
            event.clientY;


        cameraYawTarget-=
            dx*.006;


        cameraPitchTarget+=
            dy*.004;


        cameraPitchTarget=
            clamp(
                cameraPitchTarget,
                -.05,
                1.15
            );
    }
);


function stopCameraDrag(
    event
){

    if(
        event.pointerId===
        cameraPointerId
    ){

        cameraDragging=false;

        cameraPointerId=null;
    }
}


canvas.addEventListener(
    "pointerup",
    stopCameraDrag
);


canvas.addEventListener(
    "pointercancel",
    stopCameraDrag
);


/* souris */

window.addEventListener(
    "mousemove",
    event=>{

        if(
            innerWidth<=700
        )
            return;

        if(
            !cameraDragging
        )
            return;


        const dx=
            event.movementX;


        const dy=
            event.movementY;


        cameraYawTarget-=
            dx*.004;


        cameraPitchTarget+=
            dy*.003;


        cameraPitchTarget=
            clamp(
                cameraPitchTarget,
                -.05,
                1.15
            );
    }
);


/* =========================================================
   CAMERA VECTOR
   ========================================================= */

function getCameraForward(){

    const forward=
        new THREE.Vector3(
            0,
            0,
            -1
        );


    forward.applyAxisAngle(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        cameraYaw
    );


    return forward.normalize();
}


function getCameraRight(){

    const right=
        new THREE.Vector3(
            1,
            0,
            0
        );


    right.applyAxisAngle(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        cameraYaw
    );


    return right.normalize();
}


/* =========================================================
   PLAYER MOVEMENT
   ========================================================= */

const keys={

    up:false,

    down:false,

    left:false,

    right:false
};


const velocity=
    new THREE.Vector3();


const movement={

    speed:10,

    acceleration:35,

    braking:30,

    rotationSpeed:12
};


let verticalVelocity=0;

let grounded=true;


function updateMovement(
    delta
){

    let inputX=0;

    let inputZ=0;


    if(keys.left)
        inputX-=1;


    if(keys.right)
        inputX+=1;


    if(keys.up)
        inputZ+=1;


    if(keys.down)
        inputZ-=1;


    let moving=
        inputX!==0 ||
        inputZ!==0;


    let moveDirection=
        new THREE.Vector3();


    if(moving){

        const length=
            Math.hypot(
                inputX,
                inputZ
            );


        inputX/=length;

        inputZ/=length;


        /*
           AVANT =
           direction de la caméra.
        */

        const forward=
            getCameraForward();


        const right=
            getCameraRight();


        moveDirection
            .add(
                forward.clone()
                    .multiplyScalar(
                        inputZ
                    )
            )
            .add(
                right.clone()
                    .multiplyScalar(
                        inputX
                    )
            )
            .normalize();


        velocity.x=
            THREE.MathUtils.lerp(
                velocity.x,
                moveDirection.x*
                movement.speed,
                Math.min(
                    1,
                    movement.acceleration*
                    delta
                )
            );


        velocity.z=
            THREE.MathUtils.lerp(
                velocity.z,
                moveDirection.z*
                movement.speed,
                Math.min(
                    1,
                    movement.acceleration*
                    delta
                )
            );


        /*
           Le personnage regarde
           dans sa direction de marche.
        */

        const targetRotation=
            Math.atan2(
                moveDirection.x,
                -moveDirection.z
            );


        let difference=
            targetRotation-
            player.rotation.y;


        while(
            difference>Math.PI
        )
            difference-=Math.PI*2;


        while(
            difference<-Math.PI
        )
            difference+=Math.PI*2;


        player.rotation.y+=
            difference*
            Math.min(
                1,
                movement.rotationSpeed*
                delta
            );

    }else{

        velocity.x=
            THREE.MathUtils.lerp(
                velocity.x,
                0,
                Math.min(
                    1,
                    movement.braking*
                    delta
                )
            );


        velocity.z=
            THREE.MathUtils.lerp(
                velocity.z,
                0,
                Math.min(
                    1,
                    movement.braking*
                    delta
                )
            );
    }


    movePlayerWithCollision(
        velocity.x*delta,
        velocity.z*delta
    );


    /*
       gravité
    */

    verticalVelocity-=30*delta;


    player.position.y+=
        verticalVelocity*delta;


    if(
        player.position.y<=
        GROUND_Y
    ){

        player.position.y=
            GROUND_Y;

        verticalVelocity=0;

        grounded=true;
    }


    /*
       Animation
    */

    const speed=
        Math.hypot(
            velocity.x,
            velocity.z
        );


    animateCharacter(
        player,
        speed>.3,
        performance.now()/1000
    );
}


/* =========================================================
   CHARACTER ANIMATION
   ========================================================= */

function animateCharacter(
    character,
    moving,
    time
){

    const parts=
        character.userData.parts;


    if(!parts)
        return;


    if(moving){

        const swing=
            Math.sin(
                time*9
            )*.5;


        parts.leftLeg.rotation.x=
            swing;


        parts.rightLeg.rotation.x=
            -swing;


        parts.leftArm.rotation.x=
            -swing*.7;


        parts.rightArm.rotation.x=
            swing*.7;

    }else{

        const idle=
            Math.sin(
                time*2
            )*.025;


        parts.leftLeg.rotation.x=
            idle;


        parts.rightLeg.rotation.x=
            -idle;


        parts.leftArm.rotation.x=
            idle;


        parts.rightArm.rotation.x=
            -idle;
    }
}


/* =========================================================
   JUMP
   ========================================================= */

function jump(){

    if(!grounded)
        return;


    verticalVelocity=12;

    grounded=false;
}


/* =========================================================
   CAMERA UPDATE
   ========================================================= */

function updateCamera(
    delta
){

    cameraYaw=
        THREE.MathUtils.lerp(
            cameraYaw,
            cameraYawTarget,
            Math.min(
                1,
                10*delta
            )
        );


    cameraPitch=
        THREE.MathUtils.lerp(
            cameraPitch,
            cameraPitchTarget,
            Math.min(
                1,
                10*delta
            )
        );


    const target=
        player.position.clone();


    target.y+=
        2.1;


    const horizontal=
        cameraDistance*
        Math.cos(
            cameraPitch
        );


    const desired=
        new THREE.Vector3(

            target.x+
            Math.sin(
                cameraYaw
            )*
            horizontal,

            target.y+
            Math.sin(
                cameraPitch
            )*
            cameraDistance+
            cameraHeight,

            target.z+
            Math.cos(
                cameraYaw
            )*
            horizontal
        );


    camera.position.x=
        THREE.MathUtils.lerp(
            camera.position.x,
            desired.x,
            Math.min(
                1,
                7*delta
            )
        );


    camera.position.y=
        THREE.MathUtils.lerp(
            camera.position.y,
            desired.y,
            Math.min(
                1,
                7*delta
            )
        );


    camera.position.z=
        THREE.MathUtils.lerp(
            camera.position.z,
            desired.z,
            Math.min(
                1,
                7*delta
            )
        );


    camera.lookAt(
        target
    );
}


/* =========================================================
   XP
   ========================================================= */

function xpRequired(){

    return 100+
        (state.level-1)*75;
}


function addXP(
    amount
){

    state.xp+=amount;


    while(
        state.xp>=
        xpRequired()
    ){

        state.xp-=
            xpRequired();


        state.level++;


        state.maxHp+=15;


        state.hp=
            state.maxHp;


        toast(
            "⬆️ Niveau "+
            state.level+
            " !"
        );
    }


    updateUI();
}


/* =========================================================
   QUEST
   ========================================================= */

function startQuest(
    island
){

    const data=
        quests[
            island.userData.name
        ];


    if(!data)
        return;


    if(
        state.level<
        data.level
    ){

        toast(
            "🔒 Niveau "+
            data.level+
            " requis."
        );

        return;
    }


    state.quest={

        island:
            island.userData.name,

        enemy:
            data.enemy,

        amount:
            data.amount,

        progress:0,

        reward:
            data.reward,

        xp:
            data.xp
    };


    state.target=
        island;


    toast(
        "📜 Quête commencée !"
    );


    updateUI();
}


function registerQuestKill(
    mob
){

    if(!state.quest)
        return;


    if(
        state.quest.island!==
        mob.userData
            .island
            .userData
            .name
    )
        return;


    if(
        state.quest.enemy!==
        mob.userData.name
    )
        return;


    state.quest.progress++;


    if(
        state.quest.progress>=
        state.quest.amount
    ){

        state.coins+=
            state.quest.reward;


        addXP(
            state.quest.xp
        );


        state.questsDone++;


        toast(
            "✅ Quête terminée ! +"+
            state.quest.reward+
            " 🪙"
        );


        state.quest=null;

        state.target=null;
    }


    updateUI();
}


/* =========================================================
   EFFECTS
   ========================================================= */

const effects=[];


function addEffect(
object,
life,
velocity=null,
type=""
){

    scene.add(object);


    effects.push({

        object,

        life,

        maxLife:life,

        velocity,

        type
    });
}


/* =========================================================
   EXPLOSION
   ========================================================= */

function explosion(
position,
color=0xff7028,
power=1
){

    for(
        let i=0;
        i<24;
        i++
    ){

        const particle=
            sphere(
                .12+
                Math.random()*.22,
                color
            );


        particle.position.copy(
            position
        );


        const direction=
            new THREE.Vector3(

                Math.random()-.5,

                Math.random(),

                Math.random()-.5
            ).normalize();


        const velocity=
            direction.multiplyScalar(
                (5+
                Math.random()*8)*
                power
            );


        addEffect(
            particle,
            .7+
            Math.random()*.7,
            velocity
        );
    }
}


/* =========================================================
   FIREBALL
   ========================================================= */

function createFireball(
position,
direction,
color,
scale=1
){

    const group=
        new THREE.Group();


    const core=
        sphere(
            .5*scale,
            0xfff08a
        );


    group.add(core);


    const flame=
        sphere(
            .9*scale,
            color
        );


    flame.material.transparent=true;

    flame.material.opacity=.5;


    group.add(flame);


    group.position.copy(
        position
    );


    const velocity=
        direction.clone()
            .normalize()
            .multiplyScalar(
                26
            );


    addEffect(
        group,
        1.6,
        velocity,
        "fireball"
    );


    return group;
}


/* =========================================================
   ICE PROJECTILE
   ========================================================= */

function createIceProjectile(
position,
direction
){

    const crystal=
        new THREE.Mesh(

            new THREE.ConeGeometry(
                .65,
                2.2,
                6
            ),

            material(
                0x69eaff
            )
        );


    crystal.rotation.x=
        Math.PI/2;


    crystal.position.copy(
        position
    );


    const velocity=
        direction.clone()
            .normalize()
            .multiplyScalar(
                23
            );


    addEffect(
        crystal,
        1.5,
        velocity,
        "ice"
    );
}


/* =========================================================
   BIG TERRITORY
   ========================================================= */

function createTerritory(
position,
color,
radius=8,
life=3,
type="territory"
){

    const group=
        new THREE.Group();


    const ring=
        new THREE.Mesh(

            new THREE.RingGeometry(
                radius*.65,
                radius,
                64
            ),

            new THREE.MeshBasicMaterial({

                color,

                transparent:true,

                opacity:.48,

                side:
                    THREE.DoubleSide
            })
        );


    ring.rotation.x=
        -Math.PI/2;


    ring.position.y=.05;


    group.add(ring);


    const inner=
        new THREE.Mesh(

            new THREE.CircleGeometry(
                radius*.65,
                64
            ),

            new THREE.MeshBasicMaterial({

                color,

                transparent:true,

                opacity:.16,

                side:
                    THREE.DoubleSide
            })
        );


    inner.rotation.x=
        -Math.PI/2;


    inner.position.y=.06;


    group.add(inner);


    /*
       Anneau extérieur animé.
    */

    group.position.copy(
        position
    );


    addEffect(
        group,
        life,
        null,
        type
    );


    return group;
}


/* =========================================================
   FLAME TERRITORY
   ========================================================= */

function flameTerritory(){

    const position=
        player.position.clone();


    position.y=
        GROUND_Y;


    const zone=
        createTerritory(
            position,
            0xff481f,
            11,
            5,
            "flameTerritory"
        );


    /*
       Colonnes de flammes
       autour du cercle.
    */

    for(
        let i=0;
        i<18;
        i++
    ){

        const angle=
            i/18*
            Math.PI*2;


        const radius=
            8.5;


        const flame=
            sphere(
                .7,
                0xff5a20
            );


        flame.position.set(

            position.x+
            Math.cos(angle)*
            radius,

            GROUND_Y+
            .7,

            position.z+
            Math.sin(angle)*
            radius
        );


        addEffect(
            flame,
            5,
            new THREE.Vector3(
                0,
                .4,
                0
            ),
            "flame"
        );
    }


    damageArea(
        position,
        11,
        75
    );


    toast(
        "🔥 TERRITOIRE DE FLAMME !"
    );
}


/* =========================================================
   ICE TERRITORY
   ========================================================= */

function iceTerritory(){

    const position=
        player.position.clone();


    position.y=
        GROUND_Y;


    createTerritory(
        position,
        0x62eaff,
        10,
        5,
        "iceTerritory"
    );


    for(
        let i=0;
        i<16;
        i++
    ){

        const angle=
            i/16*
            Math.PI*2;


        const radius=
            4+
            Math.random()*5;


        const spike=
            new THREE.Mesh(

                new THREE.ConeGeometry(
                    .35+
                    Math.random()*.3,

                    2+
                    Math.random()*2,

                    6
                ),

                material(
                    0x73edff
                )
            );


        spike.position.set(

            position.x+
            Math.cos(angle)*
            radius,

            GROUND_Y+
            1,

            position.z+
            Math.sin(angle)*
            radius
        );


        addEffect(
            spike,
            5,
            null,
            "iceSpike"
        );
    }


    damageArea(
        position,
        10,
        80
    );


    toast(
        "❄️ TERRITOIRE DE GLACE !"
    );
}


/* =========================================================
   GRAVITY TERRITORY
   ========================================================= */

function gravityTerritory(){

    const position=
        player.position.clone();


    position.y=
        GROUND_Y;


    createTerritory(
        position,
        0x9b3cff,
        10,
        5,
        "gravityTerritory"
    );


    damageArea(
        position,
        10,
        100
    );


    toast(
        "🪐 GRAVITÉ ABSOLUE !"
    );
}


/* =========================================================
   DAMAGE AREA
   ========================================================= */

function damageArea(
position,
radius,
damage
){

    for(
        const mob of mobs
    ){

        const data=
            mob.userData;


        if(!data.alive)
            continue;


        const distance=
            mob.position.distanceTo(
                position
            );


        if(
            distance<=radius
        ){

            data.hp-=damage;

            data.hurtTimer=.3;


            if(
                data.hp<=0
            ){

                killMob(
                    mob
                );
            }
        }
    }
}


/* =========================================================
   KILL MOB
   ========================================================= */

function killMob(
mob
){

    const data=
        mob.userData;


    if(!data.alive)
        return;


    data.alive=false;


    mob.visible=false;


    /*
       EXACTEMENT 5 SECONDES.
    */

    data.respawnTime=
        performance.now()+
        5000;


    state.kills++;


    state.coins+=50;


    addXP(30);


    registerQuestKill(
        mob
    );


    explosion(
        mob.position.clone()
            .add(
                new THREE.Vector3(
                    0,
                    1.5,
                    0
                )
            ),
        data.type==="boss"
            ? 0xa43cff
            : 0xff842d,
        data.type==="boss"
            ? 2
            : 1
    );


    toast(
        "💥 "+
        data.name+
        " vaincu ! +50 🪙"
    );


    updateUI();
}


/* =========================================================
   RESPAWN
   ========================================================= */

function respawnMob(
mob
){

    const data=
        mob.userData;


    data.alive=true;

    data.hp=
        data.maxHp;


    data.hurtTimer=0;


    data.attackTimer=0;


    /*
       Retour au point d'origine.
    */

    mob.position.set(

        data.homeX,

        GROUND_Y,

        data.homeZ
    );


    mob.visible=true;
}


/* =========================================================
   MOBS UPDATE
   ========================================================= */

function updateMobs(
delta
){

    const now=
        performance.now();


    for(
        const mob of mobs
    ){

        const data=
            mob.userData;


        if(
            !data.alive
        ){

            if(
                now>=
                data.respawnTime
            ){

                respawnMob(
                    mob
                );
            }


            continue;
        }


        data.animation+=delta;


        const dx=
            player.position.x-
            mob.position.x;


        const dz=
            player.position.z-
            mob.position.z;


        const distance=
            Math.hypot(
                dx,
                dz
            );


        let moving=false;


        /*
           IA simple :
           les ennemis poursuivent
           le joueur uniquement
           lorsqu'il est proche.
        */

        if(
            distance<14 &&
            distance>2.5
        ){

            const length=
                Math.max(
                    distance,
                    .001
                );


            const moveX=
                dx/length;


            const moveZ=
                dz/length;


            /*
               Collision légère
               entre ennemi et décor.
            */

            const nextX=
                mob.position.x+
                moveX*
                data.speed*
                delta;


            const nextZ=
                mob.position.z+
                moveZ*
                data.speed*
                delta;


            if(
                !collidesAt(
                    nextX,
                    mob.position.z
                )
            ){

                mob.position.x=
                    nextX;
            }


            if(
                !collidesAt(
                    mob.position.x,
                    nextZ
                )
            ){

                mob.position.z=
                    nextZ;
            }


            mob.rotation.y=
                Math.atan2(
                    moveX,
                    -moveZ
                );


            moving=true;

        }else{

            const hx=
                data.homeX-
                mob.position.x;


            const hz=
                data.homeZ-
                mob.position.z;


            const homeDistance=
                Math.hypot(
                    hx,
                    hz
                );


            if(
                homeDistance>.8
            ){

                const length=
                    Math.max(
                        homeDistance,
                        .001
                    );


                const moveX=
                    hx/length;


                const moveZ=
                    hz/length;


                mob.position.x+=
                    moveX*
                    data.speed*
                    delta;


                mob.position.z+=
                    moveZ*
                    data.speed*
                    delta;


                mob.rotation.y=
                    Math.atan2(
                        moveX,
                        -moveZ
                    );


                moving=true;
            }
        }


        animateCharacter(
            mob,
            moving,
            data.animation
        );
    }
}


/* =========================================================
   BASIC ATTACK
   ========================================================= */

let attackCooldown=0;


function getPlayerForward(){

    return new THREE.Vector3(
        0,
        0,
        -1
    )
    .applyQuaternion(
        player.quaternion
    )
    .normalize();
}


function attack(){

    if(
        attackCooldown>0
    )
        return;


    attackCooldown=.38;


    const direction=
        getPlayerForward();


    const hitPosition=
        player.position.clone();


    hitPosition.add(
        direction.clone()
            .multiplyScalar(2)
    );


    explosion(
        hitPosition,
        0xffd24d,
        .35
    );


    for(
        const mob of mobs
    ){

        const data=
            mob.userData;


        if(
            !data.alive
        )
            continue;


        const distance=
            player.position.distanceTo(
                mob.position
            );


        if(
            distance>6
        )
            continue;


        const toMob=
            mob.position.clone()
                .sub(
                    player.position
                );


        toMob.y=0;


        if(
            toMob.lengthSq()===0
        )
            continue;


        toMob.normalize();


        if(
            direction.dot(
                toMob
            )<-.25
        )
            continue;


        /*
           Dégâts de base.
        */

        const damage=
            25+
            state.level*
            1.5;


        data.hp-=damage;


        data.hurtTimer=.18;


        if(
            data.hp<=0
        ){

            killMob(
                mob
            );
        }
    }
}


/* =========================================================
   SKILLS
   ========================================================= */

const cooldowns={

    Z:0,

    X:0,

    C:0,

    V:0
};


function useSkill(
skill
){

    if(
        cooldowns[skill]>0
    ){

        toast(
            "⏳ Compétence en recharge."
        );

        return;
    }


    cooldowns[skill]=
        skill==="V"
            ? 15
            : skill==="C"
                ? 6
                : skill==="X"
                    ? 4
                    : 2;


    const direction=
        getPlayerForward();


    const start=
        player.position.clone();


    start.y+=1.6;


    /* ======================
       FLAME
    ====================== */

    if(
        state.fruit==="Flame"
    ){

        if(skill==="Z"){

            createFireball(
                start,
                direction,
                0xff421f,
                1.2
            );


            damageArea(
                player.position,
                5,
                55
            );


            toast(
                "🔥 FLAME Z"
            );

            return;
        }


        if(skill==="X"){

            for(
                let i=-2;
                i<=2;
                i++
            ){

                const spread=
                    direction.clone();


                spread.x+=
                    i*.14;


                spread.normalize();


                createFireball(
                    start.clone(),
                    spread,
                    0xff5a20,
                    .75
                );
            }


            damageArea(
                player.position,
                7,
                70
            );


            toast(
                "🔥 FLAME X — RAFale !"
            );

            return;
        }


        if(skill==="C"){

            flameTerritory();

            return;
        }


        if(skill==="V"){

            state.transformed=
                !state.transformed;


            player.scale.setScalar(
                state.transformed
                    ? 1.3
                    : 1
            );


            explosion(
                player.position.clone()
                    .add(
                        new THREE.Vector3(
                            0,
                            1.5,
                            0
                        )
                    ),
                0xff5423,
                2
            );


            toast(
                state.transformed
                    ? "🔥 FORME FLAMME !"
                    : "Forme normale."
            );


            return;
        }
    }


    /* ======================
       ICE
    ====================== */

    if(
        state.fruit==="Ice"
    ){

        if(skill==="Z"){

            createIceProjectile(
                start,
                direction
            );


            damageArea(
                player.position,
                5,
                55
            );


            toast(
                "❄️ ICE Z"
            );


            return;
        }


        if(skill==="X"){

            iceTerritory();

            return;
        }


        if(skill==="C"){

            for(
                let i=0;
                i<12;
                i++
            ){

                const spike=
                    sphere(
                        .25+
                        Math.random()*.25,
                        0x7beeff
                    );


                spike.position.set(

                    player.position.x+
                    (Math.random()-.5)*12,

                    GROUND_Y+
                    .4,

                    player.position.z+
                    (Math.random()-.5)*12
                );


                addEffect(
                    spike,
                    3,
                    new THREE.Vector3(
                        0,
                        4+
                        Math.random()*5,
                        0
                    )
                );
            }


            damageArea(
                player.position,
                10,
                85
            );


            toast(
                "❄️ PLUIE DE GLACE !"
            );


            return;
        }


        if(skill==="V"){

            state.transformed=
                !state.transformed;


            player.scale.setScalar(
                state.transformed
                    ? 1.25
                    : 1
            );


            explosion(
                player.position,
                0x69eaff,
                1.7
            );


            toast(
                state.transformed
                    ? "❄️ FORME ICE !"
                    : "Forme normale."
            );


            return;
        }
    }


    /* ======================
       GRAVITY
    ====================== */

    if(
        state.fruit==="Gravity"
    ){

        if(skill==="Z"){

            createFireball(
                start,
                direction,
                0x9d3cff,
                1
            );


            damageArea(
                player.position,
                7,
                90
            );


            toast(
                "🪐 GRAVITY Z"
            );


            return;
        }


        if(skill==="X"){

            gravityTerritory();

            return;
        }


        if(skill==="C"){

            explosion(
                player.position,
                0xa53cff,
                2
            );


            damageArea(
                player.position,
                13,
                120
            );


            toast(
                "🪐 IMPACT GRAVITATIONNEL !"
            );


            return;
        }


        if(skill==="V"){

            state.transformed=
                !state.transformed;


            player.scale.setScalar(
                state.transformed
                    ? 1.3
                    : 1
            );


            toast(
                "🪐 GRAVITÉ ACTIVE !"
            );


            return;
        }
    }


    /* ======================
       KITSUNE
    ====================== */

    if(
        state.fruit==="Kitsune"
    ){

        if(skill==="Z"){

            /*
               GROSSE BOULE DE FEU.
            */

            createFireball(
                start,
                direction,
                0xff6b2e,
                2.3
            );


            damageArea(
                player.position,
                8,
                120
            );


            explosion(
                start,
                0xff6b2e,
                2
            );


            toast(
                "🦊 KITSUNE Z — BOULE DE FEU !"
            );


            return;
        }


        if(skill==="X"){

            for(
                let i=0;
                i<8;
                i++
            ){

                const angle=
                    i/8*
                    Math.PI*2;


                const p=
                    player.position.clone();


                p.x+=
                    Math.cos(angle)*4;


                p.z+=
                    Math.sin(angle)*4;


                createFireball(
                    p,
                    direction,
                    0xff7433,
                    .8
                );
            }


            damageArea(
                player.position,
                10,
                110
            );


            toast(
                "🦊 KITSUNE X !"
            );


            return;
        }


        if(skill==="C"){

            flameTerritory();

            toast(
                "🦊 TERRITOIRE KITSUNE !"
            );


            return;
        }


        if(skill==="V"){

            state.transformed=
                !state.transformed;


            player.scale.setScalar(
                state.transformed
                    ? 1.45
                    : 1
            );


            explosion(
                player.position,
                0xff742f,
                3
            );


            toast(
                state.transformed
                    ? "🦊 TRANSFORMATION KITSUNE !"
                    : "Transformation terminée."
            );


            return;
        }
    }


    /* ======================
       VENOM
       PRÉPARÉ POUR PLUS TARD
    ====================== */

    if(
        state.fruit==="Venom"
    ){

        toast(
            "☠️ Venom sera développé dans une prochaine évolution."
        );

        return;
    }


    /* ======================
       SANS FRUIT
    ====================== */

    if(
        !state.fruit
    ){

        if(skill==="Z"){

            attack();

            return;
        }


        if(skill==="X"){

            damageArea(
                player.position,
                5,
                45
            );


            toast(
                "⚡ ATTAQUE X"
            );


            return;
        }


        if(skill==="C"){

            damageArea(
                player.position,
                7,
                60
            );


            toast(
                "💥 ATTAQUE C"
            );


            return;
        }


        if(skill==="V"){

            toast(
                "🍈 Équipe d'abord un fruit."
            );
        }
    }
}


/* =========================================================
   EFFECT UPDATE
   ========================================================= */

function updateEffects(
delta
){

    for(
        let i=effects.length-1;
        i>=0;
        i--
    ){

        const effect=
            effects[i];


        effect.life-=delta;


        if(
            effect.velocity
        ){

            effect.object.position.add(
                effect.velocity
                    .clone()
                    .multiplyScalar(
                        delta
                    )
            );


            if(
                effect.type==="fireball"
            ){

                effect.velocity.multiplyScalar(
                    Math.pow(
                        .97,
                        delta*60
                    )
                );
            }
        }


        if(
            effect.type==="flameTerritory" ||
            effect.type==="iceTerritory" ||
            effect.type==="gravityTerritory"
        ){

            effect.object.rotation.y+=
                delta*.7;


            const pulse=
                1+
                Math.sin(
                    performance.now()*
                    .005
                )*.04;


            effect.object.scale.setScalar(
                pulse
            );
        }


        if(
            effect.type==="flame"
        ){

            effect.object.scale.y=
                1+
                Math.sin(
                    performance.now()*
                    .012+
                    i
                )*.3;
        }


        if(
            effect.life<=0
        ){

            scene.remove(
                effect.object
            );


            if(
                effect.object.geometry
            )
                effect.object.geometry.dispose();


            if(
                effect.object.material
            )
                effect.object.material.dispose();


            effects.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   NPC
   ========================================================= */

let nearbyNPC=null;


function findNearbyNPC(){

    nearbyNPC=null;


    let best=Infinity;


    for(
        const npc of npcs
    ){

        const distance=
            npc.position.distanceTo(
                player.position
            );


        if(
            distance<7 &&
            distance<best
        ){

            best=distance;

            nearbyNPC=npc;
        }
    }


    const interaction=
        $("interaction");


    if(
        !interaction
    )
        return;


    if(
        nearbyNPC
    ){

        interaction.style.display=
            "flex";


        text(
            "interactionText",
            nearbyNPC.userData.npcType
        );

    }else{

        interaction.style.display=
            "none";
    }
}


/* =========================================================
   DIALOGUE
   ========================================================= */

function openNPCDialog(
npc
){

    if(!npc)
        return;


    const type=
        npc.userData.npcType;


    text(
        "dialogNpc",
        type
    );


    text(
        "dialogTitle",
        type
    );


    text(
        "npcIcon",

        type==="Dark Aigris"
            ? "🌑"
        : type==="Maître des quêtes"
            ? "📜"
        : type==="Vendeur de fruits"
            ? "🍈"
        : type==="Marchand d'épées"
            ? "⚔️"
        : "🛒"
    );


    const dialogText=
        $("dialogText");


    const choices=
        $("dialogChoices");


    choices.innerHTML="";


    if(
        type==="Maître des quêtes"
    ){

        const island=
            npc.userData.island;


        const q=
            quests[
                island.userData.name
            ];


        dialogText.textContent=
            q
                ? `Niveau requis : ${q.level}. Élimine ${q.amount} ${q.enemy}.`
                : "Aucune quête disponible.";


        addChoice(
            "📜 Prendre la quête",
            ()=>{

                startQuest(
                    island
                );

                closeDialog();
            }
        );

    }


    else if(
        type==="Vendeur de fruits"
    ){

        dialogText.textContent=
            "Choisis un fruit.";


        for(
            const key in fruits
        ){

            const fruit=
                fruits[key];


            /*
               Venom reste préparé
               mais non actif pour
               cette version.
            */

            if(
                key==="Venom"
            )
                continue;


            addChoice(
                `🍈 ${fruit.name} — ${fruit.price} 🪙`,
                ()=>{

                    buyFruit(
                        key
                    );
                }
            );
        }

    }


    else if(
        type==="Dark Aigris"
    ){

        dialogText.textContent=
            "Bienvenue dans le Gacha. La chance peut t'offrir un fruit.";


        addChoice(
            "🎰 Gacha — 1000 🪙",
            gacha
        );

    }


    else if(
        type==="Marchand"
    ){

        dialogText.textContent=
            "Bienvenue ! Explore l'île et découvre ses secrets.";

    }


    else{

        dialogText.textContent=
            "Je possède des équipements pour les aventuriers.";
    }


    addChoice(
        "Fermer",
        closeDialog
    );


    $("dialog").style.display=
        "flex";
}


function addChoice(
label,
callback
){

    const button=
        document.createElement(
            "button"
        );


    button.className=
        "dialogChoice";


    button.textContent=
        label;


    button.onclick=
        callback;


    $("dialogChoices")
        .appendChild(
            button
        );
}


function closeDialog(){

    $("dialog").style.display=
        "none";
}


/* =========================================================
   FRUIT
   ========================================================= */

function buyFruit(
name
){

    const fruit=
        fruits[name];


    if(!fruit)
        return;


    if(
        state.coins<
        fruit.price
    ){

        toast(
            "❌ Pas assez de pièces."
        );

        return;
    }


    state.coins-=
        fruit.price;


    state.fruit=
        name;


    state.transformed=false;


    player.scale.setScalar(1);


    toast(
        "🍈 Fruit obtenu : "+
        name
    );


    updateUI();


    closeDialog();
}


/* =========================================================
   GACHA
   ========================================================= */

function gacha(){

    if(
        state.coins<1000
    ){

        toast(
            "❌ Il faut 1000 pièces."
        );

        return;
    }


    state.coins-=1000;


    const available=[
        "Flame",
        "Ice",
        "Gravity",
        "Kitsune"
    ];


    const result=
        available[
            Math.floor(
                Math.random()*
                available.length
            )
        ];


    state.fruit=
        result;


    toast(
        "🎰 GACHA : "+
        result+
        " !"
    );


    updateUI();


    closeDialog();
}


/* =========================================================
   UI
   ========================================================= */

function updateUI(){

    text(
        "level",
        state.level
    );


    text(
        "menuLevel",
        state.level
    );


    text(
        "coins",
        state.coins
    );


    text(
        "fragments",
        state.fragments
    );


    text(
        "kills",
        state.kills
    );


    text(
        "questsDone",
        state.questsDone
    );


    const hpPercent=
        state.hp/
        state.maxHp*
        100;


    style(
        "hpBar",
        "width",
        clamp(
            hpPercent,
            0,
            100
        )+
        "%"
    );


    text(
        "hpText",
        `${Math.ceil(state.hp)} / ${state.maxHp}`
    );


    const required=
        xpRequired();


    const xpPercent=
        state.xp/
        required*
        100;


    style(
        "xpBar",
        "width",
        clamp(
            xpPercent,
            0,
            100
        )+
        "%"
    );


    text(
        "xpText",
        `${Math.floor(state.xp)} / ${required}`
    );


    if(
        state.quest
    ){

        text(
            "questName",
            state.quest.enemy
        );


        text(
            "questProgress",
            `${state.quest.progress} / ${state.quest.amount}`
        );

    }else{

        text(
            "questName",
            "Aucune quête"
        );


        text(
            "questProgress",
            "Parle à un Maître des quêtes."
        );
    }


    if(
        state.currentIsland
    ){

        text(
            "currentIsland",
            state.currentIsland
                .userData
                .name
        );


        text(
            "currentSea",
            "Sea "+
            state.currentIsland
                .userData
                .sea
        );
    }
}


/* =========================================================
   ISLAND DETECTION
   ========================================================= */

function updateIsland(){

    let nearest=null;

    let best=Infinity;


    for(
        const island of islands
    ){

        const data=
            island.userData;


        const dx=
            player.position.x-
            data.x;


        const dz=
            player.position.z-
            data.z;


        const distance=
            Math.hypot(
                dx,
                dz
            );


        if(
            distance<
            data.radius+8 &&
            distance<
            best
        ){

            best=distance;

            nearest=island;
        }
    }


    if(
        nearest
    ){

        state.currentIsland=
            nearest;


        state.sea=
            nearest.userData.sea;


        updateUI();
    }
}


/* =========================================================
   COMPASS
   ========================================================= */

function updateCompass(){

    if(
        !state.target
    ){

        text(
            "destinationName",
            "Aucun objectif"
        );


        text(
            "destinationDistance",
            "— m"
        );


        return;
    }


    const target=
        new THREE.Vector3(

            state.target
                .userData
                .x,

            GROUND_Y,

            state.target
                .userData
                .z
        );


    const dx=
        target.x-
        player.position.x;


    const dz=
        target.z-
        player.position.z;


    const distance=
        Math.hypot(
            dx,
            dz
        );


    text(
        "destinationName",
        state.target
            .userData
            .name
    );


    text(
        "destinationDistance",
        Math.floor(
            distance
        )+
        " m"
    );


    const targetAngle=
        Math.atan2(
            dx,
            -dz
        );


    style(
        "compassArrow",
        "transform",
        `rotate(${targetAngle}rad)`
    );
}


/* =========================================================
   PANELS
   ========================================================= */

function openPanel(
type
){

    const content=
        $("panelContent");


    content.innerHTML="";


    if(
        type==="stats"
    ){

        text(
            "panelTitle",
            "📊 Stats"
        );


        panelItem(
            "Niveau",
            state.level
        );


        panelItem(
            "PV",
            `${Math.floor(state.hp)} / ${state.maxHp}`
        );


        panelItem(
            "XP",
            `${Math.floor(state.xp)} / ${xpRequired()}`
        );


        panelItem(
            "Fruit",
            state.fruit || "Aucun"
        );


        panelItem(
            "Ennemis vaincus",
            state.kills
        );
    }


    if(
        type==="inventory"
    ){

        text(
            "panelTitle",
            "🎒 Inventaire"
        );


        panelItem(
            "Fruit",
            state.fruit || "Aucun"
        );


        panelItem(
            "Arme actuelle",
            state.sword
        );
    }


    if(
        type==="fruits"
    ){

        text(
            "panelTitle",
            "🍈 Fruits"
        );


        for(
            const key in fruits
        ){

            const fruit=
                fruits[key];


            panelItem(
                fruit.name,
                fruit.rarity
            );
        }
    }


    if(
        type==="shops"
    ){

        text(
            "panelTitle",
            "🛒 Boutiques"
        );


        panelItem(
            "🍈 Fruits",
            "Vendeur de fruits"
        );


        panelItem(
            "🎰 Gacha",
            "Dark Aigris"
        );


        panelItem(
            "🛒 Marchand",
            "Présent sur les îles"
        );
    }


    $("panel").style.display=
        "flex";
}


function panelItem(
label,
value
){

    const row=
        document.createElement(
            "div"
        );


    row.className=
        "panelItem";


    const strong=
        document.createElement(
            "strong"
        );


    strong.textContent=
        label;


    const span=
        document.createElement(
            "span"
        );


    span.textContent=
        value;


    row.appendChild(
        strong
    );


    row.appendChild(
        span
    );


    $("panelContent")
        .appendChild(
            row
        );
}


function closePanel(){

    $("panel").style.display=
        "none";
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer;


function toast(
message
){

    const element=
        $("toast");


    element.textContent=
        message;


    element.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer=
        setTimeout(
            ()=>{

                element.classList.remove(
                    "show"
                );

            },
            2200
        );
}


/* =========================================================
   CONTROLS
   ========================================================= */

document
.querySelectorAll(
    "[data-key]"
)
.forEach(
    button=>{

        const key=
            button.dataset.key;


        button.addEventListener(
            "pointerdown",
            event=>{

                event.preventDefault();

                keys[key]=true;
            }
        );


        button.addEventListener(
            "pointerup",
            event=>{

                event.preventDefault();

                keys[key]=false;
            }
        );


        button.addEventListener(
            "pointercancel",
            ()=>{
                keys[key]=false;
            }
        );


        button.addEventListener(
            "pointerleave",
            ()=>{
                keys[key]=false;
            }
        );
    }
);


$("jumpButton")
.addEventListener(
    "pointerdown",
    event=>{

        event.preventDefault();

        jump();
    }
);


$("attackButton")
.addEventListener(
    "pointerdown",
    event=>{

        event.preventDefault();

        attack();
    }
);


document
.querySelectorAll(
    "[data-skill]"
)
.forEach(
    button=>{

        button.addEventListener(
            "pointerdown",
            event=>{

                event.preventDefault();

                useSkill(
                    button.dataset.skill
                );
            }
        );
    }
);


/* =========================================================
   KEYBOARD
   ========================================================= */

window.addEventListener(
    "keydown",
    event=>{

        if(
            event.key==="ArrowUp"
        )
            keys.up=true;


        if(
            event.key==="ArrowDown"
        )
            keys.down=true;


        if(
            event.key==="ArrowLeft"
        )
            keys.left=true;


        if(
            event.key==="ArrowRight"
        )
            keys.right=true;


        if(
            event.key===" "
        )
            jump();


        const key=
            event.key.toLowerCase();


        if(key==="z")
            useSkill("Z");


        if(key==="x")
            useSkill("X");


        if(key==="c")
            useSkill("C");


        if(key==="v")
            useSkill("V");


        if(key==="f")
            attack();


        if(
            key==="e" &&
            nearbyNPC
        )
            openNPCDialog(
                nearbyNPC
            );
    }
);


window.addEventListener(
    "keyup",
    event=>{

        if(
            event.key==="ArrowUp"
        )
            keys.up=false;


        if(
            event.key==="ArrowDown"
        )
            keys.down=false;


        if(
            event.key==="ArrowLeft"
        )
            keys.left=false;


        if(
            event.key==="ArrowRight"
        )
            keys.right=false;
    }
);


/* =========================================================
   MENU EVENTS
   ========================================================= */

$("menuButton").onclick=
    ()=>{
        $("menu").style.display=
            "flex";
    };


$("closeMenu").onclick=
    ()=>{
        $("menu").style.display=
            "none";
    };


$("closePanel").onclick=
    closePanel;


$("closeDialog").onclick=
    closeDialog;


$("interactionButton").onclick=
    ()=>{

        if(
            nearbyNPC
        )
            openNPCDialog(
                nearbyNPC
            );
    };


document
.querySelectorAll(
    ".menuAction"
)
.forEach(
    button=>{

        button.onclick=
            ()=>{

                openPanel(
                    button.dataset.panel
                );
            };
    }
);


/* =========================================================
   MUSIC
   ========================================================= */

const gameMusic=
    $("gameMusic");


let audioUnlocked=false;


function unlockAudio(){

    if(
        audioUnlocked ||
        !gameMusic
    )
        return;


    gameMusic.volume=.35;


    gameMusic
        .play()
        .then(
            ()=>{
                audioUnlocked=true;
            }
        )
        .catch(
            ()=>{
                audioUnlocked=false;
            }
        );
}


window.addEventListener(
    "pointerdown",
    unlockAudio
);


window.addEventListener(
    "keydown",
    unlockAudio
);


/* =========================================================
   LOADING
   ========================================================= */

let loadingProgress=0;


const loadingInterval=
    setInterval(
        ()=>{

            loadingProgress+=4;


            if(
                loadingProgress>100
            )
                loadingProgress=100;


            style(
                "loadBar",
                "width",
                loadingProgress+
                "%"
            );


            text(
                "loadText",

                loadingProgress<30
                    ? "Création du monde..."

                : loadingProgress<55
                    ? "Construction des îles..."

                : loadingProgress<75
                    ? "Plantation des arbres..."

                : loadingProgress<90
                    ? "Installation des PNJ et mobs..."

                : "Préparation du joueur..."
            );


            if(
                loadingProgress>=100
            ){

                clearInterval(
                    loadingInterval
                );


                setTimeout(
                    ()=>{

                        $("loading")
                            .style
                            .display="none";


                        state.currentIsland=
                            islands[0];


                        updateUI();


                        toast(
                            "🌍 Bienvenue dans GAME ZONE !"
                        );

                    },
                    500
                );
            }

        },
        35
    );


/* =========================================================
   UPDATE COOLDOWNS
   ========================================================= */

function updateCooldowns(
delta
){

    for(
        const key in cooldowns
    ){

        cooldowns[key]=
            Math.max(
                0,
                cooldowns[key]-
                delta
            );
    }


    attackCooldown=
        Math.max(
            0,
            attackCooldown-
            delta
        );
}


/* =========================================================
   MAIN LOOP
   ========================================================= */

let previous=
    performance.now();


function animate(
now
){

    requestAnimationFrame(
        animate
    );


    let delta=
        (now-previous)/
        1000;


    previous=now;


    delta=
        Math.min(
            delta,
            .05
        );


    updateMovement(
        delta
    );


    updateMobs(
        delta
    );


    updateCooldowns(
        delta
    );


    updateEffects(
        delta
    );


    updateIsland();


    updateCompass();


    findNearbyNPC();


    updateCamera(
        delta
    );


    renderer.render(
        scene,
        camera
    );
}


animate(
    performance.now()
);


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    ()=>{

        camera.aspect=
            innerWidth/
            innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            innerWidth,
            innerHeight
        );
    }
);


/* =========================================================
   INITIAL
   ========================================================= */

updateUI();