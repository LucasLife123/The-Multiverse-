(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const startScreen = document.getElementById("startScreen");
  const startButton = document.getElementById("startButton");

  const hud = document.getElementById("hud");

  const cinematicText =
    document.getElementById("cinematicText");

  const questTitle =
    document.getElementById("questTitle");

  const questDescription =
    document.getElementById("questDescription");

  const interactionPrompt =
    document.getElementById("interactionPrompt");

  const interactionText =
    document.getElementById("interactionText");

  const messageBox =
    document.getElementById("messageBox");

  const messageSpeaker =
    document.getElementById("messageSpeaker");

  const messageText =
    document.getElementById("messageText");

  const levelText =
    document.getElementById("levelText");

  const coinText =
    document.getElementById("coinText");

  const coreText =
    document.getElementById("coreText");

  const hpFill =
    document.getElementById("hpFill");

  const weaponIcon =
    document.getElementById("weaponIcon");

  const weaponName =
    document.getElementById("weaponName");

  const gearName =
    document.getElementById("gearName");

  const petIcon =
    document.getElementById("petIcon");

  const petName =
    document.getElementById("petName");

  const miniMapPlayer =
    document.getElementById("miniMapPlayer");

  const discoveryScreen =
    document.getElementById("discoveryScreen");

  const continueButton =
    document.getElementById("continueButton");


  /* =====================================================
     CANVAS
  ===================================================== */

  const WIDTH = 1280;
  const HEIGHT = 720;

  canvas.width = WIDTH;
  canvas.height = HEIGHT;


  /* =====================================================
     INPUT
  ===================================================== */

  const keys = {};

  window.addEventListener("keydown", event => {
    keys[event.code] = true;

    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Space"
      ].includes(event.code)
    ) {
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", event => {
    keys[event.code] = false;
  });


  document
    .querySelectorAll("#mobileControls button")
    .forEach(button => {

      const code =
        button.dataset.key;

      button.addEventListener(
        "pointerdown",
        event => {

          event.preventDefault();

          keys[code] = true;

        }
      );

      function stop() {
        keys[code] = false;
      }

      button.addEventListener(
        "pointerup",
        stop
      );

      button.addEventListener(
        "pointercancel",
        stop
      );

      button.addEventListener(
        "pointerleave",
        stop
      );

    });


  /* =====================================================
     UTILITIES
  ===================================================== */

  function clamp(value, min, max) {
    return Math.max(
      min,
      Math.min(max, value)
    );
  }

  function lerp(a, b, amount) {
    return a + (b - a) * amount;
  }

  function distance(a, b) {

    return Math.hypot(
      a.x - b.x,
      a.y - b.y
    );

  }

  function random(min, max) {

    return (
      Math.random() *
      (max - min) +
      min
    );

  }


  /* =====================================================
     GAME STATE
  ===================================================== */

  const game = {

    mode: "menu",

    sceneTime: 0,

    time: 0,

    cameraX: 0,

    cameraShake: 0,

    messageTimer: 0,

    currentInteractable: null,

    quest: 0,

    cores: 0

  };


  /* =====================================================
     PLAYER
  ===================================================== */

  const player = {

    x: 500,
    y: 545,

    speed: 270,

    facing: 1,

    hp: 100,
    maxHp: 100,

    level: 1,

    xp: 0,

    coins: 0,

    weapon: null,

    gear: "Pilot Suit",

    pet: null,

    attackTimer: 0,

    attackCooldown: 0,

    invulnerable: 0

  };


  /* =====================================================
     EARTH 2.0
  ===================================================== */

  const earth = {

    width: 5400,

    minY: 425,

    maxY: 610

  };


  /* =====================================================
     QUEST OBJECTS
  ===================================================== */

  const crashedShip = {

    x: 430,
    y: 515,

    inspected: false

  };


  const shipParts = [

    {
      x: 820,
      y: 535,
      collected: false
    },

    {
      x: 1190,
      y: 460,
      collected: false
    },

    {
      x: 1480,
      y: 560,
      collected: false
    }

  ];


  const ancientWeapon = {

    x: 1910,
    y: 520,

    collected: false

  };


  const beatFox = {

    x: 2820,
    y: 490,

    rescued: false

  };


  const signalTower = {

    x: 3910,
    y: 510,

    activated: false

  };


  const ancientGate = {

    x: 5000,
    y: 505,

    activated: false

  };


  /* =====================================================
     ENEMIES
  ===================================================== */

  const enemies = [

    createEnemy(
      2250,
      525,
      "Sound Slime"
    ),

    createEnemy(
      2490,
      470,
      "Sound Slime"
    ),

    createEnemy(
      2660,
      540,
      "Void Bug",
      true
    ),

    createEnemy(
      2920,
      520,
      "Void Bug",
      true
    ),

    createEnemy(
      3450,
      465,
      "Riftling"
    ),

    createEnemy(
      4270,
      535,
      "Riftling"
    )

  ];


  function createEnemy(
    x,
    y,
    name,
    petGuard = false
  ) {

    return {

      x,
      y,

      startX: x,

      name,

      hp: 50,
      maxHp: 50,

      alive: true,

      facing: -1,

      attackCooldown: 0,

      hitFlash: 0,

      petGuard

    };

  }


  /* =====================================================
     PARTICLES
  ===================================================== */

  const particles = [];


  function spawnParticle(
    x,
    y,
    color,
    amount = 8
  ) {

    for (
      let i = 0;
      i < amount;
      i++
    ) {

      particles.push({

        x,
        y,

        vx:
          random(-90, 90),

        vy:
          random(-150, -20),

        life:
          random(0.4, 1),

        maxLife: 1,

        size:
          random(2, 7),

        color

      });

    }

  }


  function updateParticles(dt) {

    for (
      let i =
        particles.length - 1;
      i >= 0;
      i--
    ) {

      const p =
        particles[i];

      p.x += p.vx * dt;

      p.y += p.vy * dt;

      p.vy += 200 * dt;

      p.life -= dt;

      if (
        p.life <= 0
      ) {

        particles.splice(
          i,
          1
        );

      }

    }

  }


  /* =====================================================
     START
  ===================================================== */

  startButton.addEventListener(
    "click",
    () => {

      startScreen.classList.remove(
        "active"
      );

      game.mode =
        "flight";

      game.sceneTime = 0;

    }
  );


  continueButton.addEventListener(
    "click",
    () => {

      discoveryScreen.classList.add(
        "hidden"
      );

      showMessage(
        "UNKNOWN SIGNAL",
        "Coordinates received. Destination name unavailable."
      );

      setQuest(
        6,
        "A World Beyond",
        "Earth 2.0 is only the beginning."
      );

    }
  );


  /* =====================================================
     QUEST SYSTEM
  ===================================================== */

  function setQuest(
    stage,
    title,
    description
  ) {

    game.quest =
      stage;

    questTitle.textContent =
      title;

    questDescription.textContent =
      description;

  }


  function updateQuestProgress() {

    if (
      game.quest === 1
    ) {

      const amount =
        shipParts.filter(
          part =>
            part.collected
        ).length;

      questDescription.textContent =
        `Recover ship parts (${amount}/3)`;

      if (
        amount === 3
      ) {

        setQuest(
          2,
          "Something in the Ruins",
          "Investigate the old ruins east of the crash site."
        );

        showMessage(
          "RIFTWALKER",
          "That's everything I can salvage. Maybe those ruins have something useful."
        );

      }

    }

  }


  /* =====================================================
     DIALOG
  ===================================================== */

  function showMessage(
    speaker,
    text,
    duration = 4
  ) {

    messageSpeaker.textContent =
      speaker;

    messageText.textContent =
      text;

    messageBox.classList.remove(
      "hidden"
    );

    game.messageTimer =
      duration;

  }


  /* =====================================================
     CINEMATIC
  ===================================================== */

  function updateFlight(dt) {

    game.sceneTime +=
      dt;

    if (
      game.sceneTime < 2
    ) {

      cinematicText.textContent =
        "SECTOR 7-19";

    }

    else if (
      game.sceneTime < 4
    ) {

      cinematicText.textContent =
        "Unknown signal detected...";

    }

    else if (
      game.sceneTime < 5.6
    ) {

      cinematicText.textContent =
        "WARNING: NAVIGATION FAILURE";

      game.cameraShake =
        5;

    }

    else if (
      game.sceneTime < 7
    ) {

      cinematicText.textContent =
        "PULL UP!";

      game.cameraShake =
        10;

    }

    else {

      game.mode =
        "crash";

      game.sceneTime = 0;

      game.cameraShake =
        18;

    }

  }


  function updateCrash(dt) {

    game.sceneTime +=
      dt;

    if (
      game.sceneTime < 1.8
    ) {

      cinematicText.textContent =
        "IMPACT IMMINENT";

    }

    else {

      cinematicText.textContent =
        "";

    }

    if (
      game.sceneTime > 3.4
    ) {

      startEarth();

    }

  }


  function startEarth() {

    game.mode =
      "earth";

    game.sceneTime =
      0;

    game.cameraShake =
      0;

    player.x =
      560;

    player.y =
      540;

    hud.classList.remove(
      "hidden"
    );

    setQuest(
      0,
      "Stranded",
      "Inspect your crashed spaceship."
    );

    showMessage(
      "RIFTWALKER",
      "...Where am I?"
    );

  }


  /* =====================================================
     EARTH UPDATE
  ===================================================== */

  let eWasPressed = false;
  let attackWasPressed = false;


  function updateEarth(dt) {

    let dx = 0;
    let dy = 0;

    if (
      keys.KeyA ||
      keys.ArrowLeft
    ) {

      dx -= 1;

    }

    if (
      keys.KeyD ||
      keys.ArrowRight
    ) {

      dx += 1;

    }

    if (
      keys.KeyW ||
      keys.ArrowUp
    ) {

      dy -= 1;

    }

    if (
      keys.KeyS ||
      keys.ArrowDown
    ) {

      dy += 1;

    }


    if (
      dx !== 0 ||
      dy !== 0
    ) {

      const length =
        Math.hypot(dx, dy);

      dx /= length;
      dy /= length;

      player.x +=
        dx *
        player.speed *
        dt;

      player.y +=
        dy *
        player.speed *
        0.62 *
        dt;

      if (
        dx !== 0
      ) {

        player.facing =
          Math.sign(dx);

      }

    }


    player.x =
      clamp(
        player.x,
        80,
        earth.width - 80
      );

    player.y =
      clamp(
        player.y,
        earth.minY,
        earth.maxY
      );


    if (
      player.attackCooldown > 0
    ) {

      player.attackCooldown -= dt;

    }

    if (
      player.attackTimer > 0
    ) {

      player.attackTimer -= dt;

    }

    if (
      player.invulnerable > 0
    ) {

      player.invulnerable -= dt;

    }


    updateEnemies(dt);

    updateInteractables();

    updateParticles(dt);


    const ePressed =
      keys.KeyE;

    if (
      ePressed &&
      !eWasPressed
    ) {

      interact();

    }

    eWasPressed =
      ePressed;


    const attackPressed =
      keys.Space;

    if (
      attackPressed &&
      !attackWasPressed
    ) {

      playerAttack();

    }

    attackWasPressed =
      attackPressed;


    game.cameraX =
      lerp(
        game.cameraX,
        clamp(
          player.x -
          WIDTH * 0.43,
          0,
          earth.width - WIDTH
        ),
        0.08
      );


    if (
      game.messageTimer > 0
    ) {

      game.messageTimer -=
        dt;

      if (
        game.messageTimer <= 0
      ) {

        messageBox.classList.add(
          "hidden"
        );

      }

    }


    miniMapPlayer.style.left =
      `${clamp(
        player.x /
        earth.width *
        100,
        1,
        99
      )}%`;


    hpFill.style.width =
      `${player.hp /
        player.maxHp *
        100}%`;

  }


  /* =====================================================
     INTERACTION SYSTEM
  ===================================================== */

  function updateInteractables() {

    let target = null;

    function test(
      object,
      radius,
      label,
      action
    ) {

      if (
        target
      ) {

        return;

      }

      if (
        distance(
          player,
          object
        ) < radius
      ) {

        target = {

          object,
          label,
          action

        };

      }

    }


    if (
      !crashedShip.inspected
    ) {

      test(
        crashedShip,
        130,
        "Inspect crashed ship",
        "ship"
      );

    }


    if (
      game.quest === 1
    ) {

      shipParts.forEach(
        (part, index) => {

          if (
            !part.collected
          ) {

            test(
              part,
              70,
              "Collect ship part",
              `part${index}`
            );

          }

        }
      );

    }


    if (
      game.quest >= 2 &&
      !ancientWeapon.collected
    ) {

      test(
        ancientWeapon,
        90,
        "Take ancient weapon",
        "weapon"
      );

    }


    if (
      game.quest >= 3 &&
      !beatFox.rescued
    ) {

      test(
        beatFox,
        100,
        "Help the strange creature",
        "pet"
      );

    }


    if (
      game.quest >= 4 &&
      !signalTower.activated
    ) {

      test(
        signalTower,
        120,
        "Activate signal tower",
        "tower"
      );

    }


    if (
      game.quest >= 5 &&
      !ancientGate.activated
    ) {

      test(
        ancientGate,
        140,
        "Touch the ancient gate",
        "gate"
      );

    }


    game.currentInteractable =
      target;


    if (
      target
    ) {

      interactionPrompt.classList.remove(
        "hidden"
      );

      interactionText.textContent =
        target.label;

    }

    else {

      interactionPrompt.classList.add(
        "hidden"
      );

    }

  }


  function interact() {

    const target =
      game.currentInteractable;

    if (
      !target
    ) {

      return;

    }


    if (
      target.action === "ship"
    ) {

      crashedShip.inspected =
        true;

      setQuest(
        1,
        "Emergency Repairs",
        "Recover ship parts (0/3)"
      );

      showMessage(
        "SHIP COMPUTER",
        "Main propulsion destroyed. Three nearby components may still be recoverable."
      );

    }


    if (
      target.action.startsWith(
        "part"
      )
    ) {

      const index =
        Number(
          target.action.replace(
            "part",
            ""
          )
        );

      const part =
        shipParts[index];

      if (
        !part.collected
      ) {

        part.collected =
          true;

        player.coins +=
          10;

        spawnParticle(
          part.x,
          part.y,
          "#7cecff",
          14
        );

        showMessage(
          "SYSTEM",
          "Ship component recovered."
        );

        updateQuestProgress();

      }

    }


    if (
      target.action === "weapon"
    ) {

      ancientWeapon.collected =
        true;

      player.weapon = {
        name: "Rift Blade",
        icon: "⚔️",
        damage: 24
      };

      weaponIcon.textContent =
        "⚔️";

      weaponName.textContent =
        "Rift Blade";

      setQuest(
        3,
        "A Strange Cry",
        "Find the creature calling from deeper in the jungle."
      );

      showMessage(
        "SYSTEM",
        "RIFT BLADE ACQUIRED. This weapon feels older than the ruins themselves."
      );

      spawnParticle(
        ancientWeapon.x,
        ancientWeapon.y,
        "#b589ff",
        20
      );

    }


    if (
      target.action === "pet"
    ) {

      const guardsAlive =
        enemies.some(
          enemy =>
            enemy.alive &&
            enemy.petGuard
        );


      if (
        guardsAlive
      ) {

        showMessage(
          "BEAT FOX",
          "Yip! Yip!!"
        );

        return;

      }


      beatFox.rescued =
        true;

      player.pet = {
        name: "Beat Fox",
        icon: "🦊",
        damage: 8
      };

      petIcon.textContent =
        "🦊";

      petName.textContent =
        "Beat Fox";

      setQuest(
        4,
        "The Signal",
        "Follow the strange transmission to the eastern tower."
      );

      showMessage(
        "BEAT FOX",
        "Yip!"
      );

      spawnParticle(
        beatFox.x,
        beatFox.y,
        "#ffbd72",
        24
      );

    }


    if (
      target.action === "tower"
    ) {

      signalTower.activated =
        true;

      game.cameraShake =
        12;

      setQuest(
        5,
        "Beyond Earth",
        "Follow the beam to the ancient structure."
      );

      showMessage(
        "UNKNOWN TRANSMISSION",
        "...Riftwalker... find... the Hub..."
      );

      spawnParticle(
        signalTower.x,
        signalTower.y - 120,
        "#6edfff",
        30
      );

    }


    if (
      target.action === "gate"
    ) {

      ancientGate.activated =
        true;

      game.cores =
        1;

      coreText.textContent =
        game.cores;

      game.cameraShake =
        20;

      discoveryScreen.classList.remove(
        "hidden"
      );

    }


    coinText.textContent =
      player.coins;

  }


  /* =====================================================
     COMBAT
  ===================================================== */

  function playerAttack() {

    if (
      player.attackCooldown > 0
    ) {

      return;

    }


    player.attackCooldown =
      0.4;

    player.attackTimer =
      0.2;


    const damage =
      player.weapon
        ? player.weapon.damage
        : 8;


    enemies.forEach(
      enemy => {

        if (
          !enemy.alive
        ) {

          return;

        }


        const horizontal =
          enemy.x -
          player.x;

        const vertical =
          Math.abs(
            enemy.y -
            player.y
          );


        const inFront =
          Math.sign(horizontal) ===
          player.facing;


        if (
          Math.abs(horizontal) < 115 &&
          vertical < 70 &&
          inFront
        ) {

          enemy.hp -=
            damage;

          enemy.hitFlash =
            0.15;

          spawnParticle(
            enemy.x,
            enemy.y - 25,
            "#ffffff",
            8
          );


          if (
            enemy.hp <= 0
          ) {

            enemy.alive =
              false;

            player.coins +=
              12;

            gainXP(18);

            spawnParticle(
              enemy.x,
              enemy.y,
              "#7be8ff",
              18
            );

          }

        }

      }
    );


    coinText.textContent =
      player.coins;

  }


  function gainXP(amount) {

    player.xp +=
      amount;


    if (
      player.xp >= 100
    ) {

      player.xp -=
        100;

      player.level +=
        1;

      levelText.textContent =
        player.level;

      showMessage(
        "SYSTEM",
        `LEVEL UP! Riftwalker reached Level ${player.level}.`
      );

    }

  }


  function updateEnemies(dt) {

    enemies.forEach(
      enemy => {

        if (
          !enemy.alive
        ) {

          return;

        }


        if (
          enemy.attackCooldown > 0
        ) {

          enemy.attackCooldown -= dt;

        }


        if (
          enemy.hitFlash > 0
        ) {

          enemy.hitFlash -= dt;

        }


        const d =
          distance(
            player,
            enemy
          );


        if (
          d < 430 &&
          d > 70
        ) {

          const angle =
            Math.atan2(
              player.y -
              enemy.y,
              player.x -
              enemy.x
            );

          enemy.x +=
            Math.cos(angle) *
            70 *
            dt;

          enemy.y +=
            Math.sin(angle) *
            40 *
            dt;

          enemy.facing =
            Math.sign(
              player.x -
              enemy.x
            );

        }


        if (
          d < 75 &&
          enemy.attackCooldown <= 0
        ) {

          enemy.attackCooldown =
            1.1;


          if (
            player.invulnerable <= 0
          ) {

            player.hp -=
              8;

            player.hp =
              Math.max(
                1,
                player.hp
              );

            player.invulnerable =
              0.8;

            game.cameraShake =
              7;

          }

        }

      }
    );

  }


  /* =====================================================
     MAIN UPDATE
  ===================================================== */

  function update(dt) {

    game.time +=
      dt;


    if (
      game.cameraShake > 0
    ) {

      game.cameraShake =
        Math.max(
          0,
          game.cameraShake -
          dt * 18
        );

    }


    if (
      game.mode === "flight"
    ) {

      updateFlight(dt);

    }


    if (
      game.mode === "crash"
    ) {

      updateCrash(dt);

    }


    if (
      game.mode === "earth"
    ) {

      updateEarth(dt);

    }

  }


  /* =====================================================
     DRAW HELPERS
  ===================================================== */

  function roundRect(
    x,
    y,
    w,
    h,
    radius
  ) {

    ctx.beginPath();

    ctx.roundRect(
      x,
      y,
      w,
      h,
      radius
    );

  }


  function drawStarfield(
    offset = 0
  ) {

    ctx.fillStyle =
      "#02040d";

    ctx.fillRect(
      0,
      0,
      WIDTH,
      HEIGHT
    );


    const gradient =
      ctx.createRadialGradient(
        300,
        200,
        20,
        300,
        200,
        700
      );

    gradient.addColorStop(
      0,
      "rgba(55,79,185,.30)"
    );

    gradient.addColorStop(
      0.45,
      "rgba(80,25,130,.11)"
    );

    gradient.addColorStop(
      1,
      "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      WIDTH,
      HEIGHT
    );


    for (
      let i = 0;
      i < 140;
      i++
    ) {

      const x =
        (
          i *
          89.73 +
          offset *
          (0.12 +
          (i % 5) * 0.03)
        ) %
        WIDTH;

      const y =
        (
          i *
          47.11
        ) %
        HEIGHT;


      const size =
        i % 13 === 0
          ? 2.3
          : 1;


      ctx.globalAlpha =
        0.45 +
        Math.sin(
          game.time * 2 +
          i
        ) *
        0.25;


      ctx.fillStyle =
        i % 7 === 0
          ? "#8ee6ff"
          : "#ffffff";


      ctx.beginPath();

      ctx.arc(
        x,
        y,
        size,
        0,
        Math.PI * 2
      );

      ctx.fill();

    }


    ctx.globalAlpha = 1;

  }


  /* =====================================================
     MENU DRAW
  ===================================================== */

  function drawMenu() {

    drawStarfield(
      game.time * 18
    );


    drawPlanet(
      180,
      160,
      95,
      "#4a64d8",
      "#23306d"
    );


    drawPlanet(
      1090,
      230,
      145,
      "#a73d8f",
      "#441a52"
    );


    ctx.save();

    ctx.translate(
      640,
      365 +
      Math.sin(game.time) *
      7
    );


    ctx.shadowColor =
      "#61bfff";

    ctx.shadowBlur =
      40;


    ctx.fillStyle =
      "#e8f7ff";

    ctx.beginPath();

    ctx.moveTo(
      -180,
      20
    );

    ctx.lineTo(
      180,
      20
    );

    ctx.lineTo(
      100,
      90
    );

    ctx.lineTo(
      -100,
      90
    );

    ctx.closePath();

    ctx.fill();


    ctx.shadowBlur =
      0;


    ctx.fillStyle =
      "#7bdfff";

    ctx.fillRect(
      -12,
      -130,
      24,
      150
    );


    ctx.restore();

  }


  /* =====================================================
     SPACE CINEMATIC
  ===================================================== */

  function drawFlight() {

    drawStarfield(
      game.sceneTime *
      90
    );


    const shipX =
      360 +
      Math.sin(
        game.sceneTime *
        1.8
      ) *
      20;


    const shipY =
      355 +
      Math.sin(
        game.sceneTime *
        2.2
      ) *
      12;


    drawShip(
      shipX,
      shipY,
      1.4,
      0
    );


    if (
      game.sceneTime > 4
    ) {

      for (
        let i = 0;
        i < 8;
        i++
      ) {

        const asteroidX =
          WIDTH -
          (
            (
              game.sceneTime *
              340 +
              i * 170
            ) %
            1500
          );


        const asteroidY =
          80 +
          (
            i *
            83
          ) %
          540;


        drawAsteroid(
          asteroidX,
          asteroidY,
          18 +
          (i % 4) *
          9
        );

      }

    }


    if (
      game.sceneTime > 5.2
    ) {

      ctx.fillStyle =
        `rgba(
          255,
          45,
          45,
          ${
            0.09 +
            Math.sin(
              game.time *
              12
            ) *
            0.05
          }
        )`;

      ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
      );

    }

  }


  function drawCrash() {

    drawStarfield(
      game.time *
      60
    );


    const progress =
      clamp(
        game.sceneTime /
        3,
        0,
        1
      );


    const planetY =
      lerp(
        780,
        380,
        progress
      );


    drawPlanet(
      WIDTH / 2,
      planetY,
      lerp(
        200,
        700,
        progress
      ),
      "#49c879",
      "#155640"
    );


    const shipY =
      lerp(
        130,
        570,
        progress
      );


    drawShip(
      WIDTH / 2,
      shipY,
      1.5,
      progress * 2.1
    );


    if (
      game.sceneTime > 2.6
    ) {

      const flash =
        clamp(
          (
            game.sceneTime -
            2.6
          ) /
          0.5,
          0,
          1
        );


      ctx.fillStyle =
        `rgba(
          255,
          255,
          255,
          ${1 - flash}
        )`;


      ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
      );

    }

  }


  /* =====================================================
     PLANET
  ===================================================== */

  function drawPlanet(
    x,
    y,
    radius,
    topColor,
    bottomColor
  ) {

    const gradient =
      ctx.createRadialGradient(
        x - radius * 0.3,
        y - radius * 0.4,
        radius * 0.05,
        x,
        y,
        radius
      );


    gradient.addColorStop(
      0,
      topColor
    );

    gradient.addColorStop(
      1,
      bottomColor
    );


    ctx.save();

    ctx.shadowColor =
      topColor;

    ctx.shadowBlur =
      35;


    ctx.fillStyle =
      gradient;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();

  }


  /* =====================================================
     SHIP
  ===================================================== */

  function drawShip(
    x,
    y,
    scale = 1,
    rotation = 0
  ) {

    ctx.save();

    ctx.translate(
      x,
      y
    );

    ctx.rotate(rotation);

    ctx.scale(
      scale,
      scale
    );


    ctx.fillStyle =
      "#eef4fb";

    ctx.strokeStyle =
      "#15253c";

    ctx.lineWidth =
      5;


    ctx.beginPath();

    ctx.moveTo(
      -95,
      0
    );

    ctx.lineTo(
      20,
      -45
    );

    ctx.quadraticCurveTo(
      90,
      -25,
      115,
      0
    );

    ctx.quadraticCurveTo(
      90,
      25,
      20,
      45
    );

    ctx.closePath();

    ctx.fill();

    ctx.stroke();


    ctx.fillStyle =
      "#dd3849";

    ctx.fillRect(
      -90,
      -15,
      55,
      30
    );


    ctx.fillStyle =
      "#48b9e8";

    ctx.beginPath();

    ctx.ellipse(
      28,
      -3,
      40,
      28,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
      "#ffb33d";

    ctx.beginPath();

    ctx.moveTo(
      -97,
      -18
    );

    ctx.lineTo(
      -160 -
      Math.random() * 30,
      0
    );

    ctx.lineTo(
      -97,
      18
    );

    ctx.closePath();

    ctx.fill();


    ctx.restore();

  }


  function drawAsteroid(
    x,
    y,
    radius
  ) {

    ctx.fillStyle =
      "#51596b";

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
      "#323846";

    ctx.beginPath();

    ctx.arc(
      x - radius * 0.2,
      y - radius * 0.15,
      radius * 0.23,
      0,
      Math.PI * 2
    );

    ctx.fill();

  }


  /* =====================================================
     EARTH BACKGROUND
  ===================================================== */

  function drawEarth() {

    const camera =
      game.cameraX;


    /* SKY */

    const sky =
      ctx.createLinearGradient(
        0,
        0,
        0,
        HEIGHT
      );


    sky.addColorStop(
      0,
      "#102662"
    );

    sky.addColorStop(
      0.44,
      "#2f7ec8"
    );

    sky.addColorStop(
      0.74,
      "#91e8ed"
    );

    sky.addColorStop(
      1,
      "#ddf7de"
    );


    ctx.fillStyle =
      sky;

    ctx.fillRect(
      0,
      0,
      WIDTH,
      HEIGHT
    );


    /* SPACE STILL VISIBLE ABOVE */

    ctx.globalAlpha =
      0.72;


    for (
      let i = 0;
      i < 80;
      i++
    ) {

      const x =
        (
          i *
          183 -
          camera *
          0.03
        ) %
        1400;


      const y =
        (
          i *
          43
        ) %
        270;


      ctx.fillStyle =
        "#ffffff";

      ctx.fillRect(
        x,
        y,
        1.5,
        1.5
      );

    }


    ctx.globalAlpha = 1;


    /* HUGE DISTANT PLANET */

    drawPlanet(
      1030 -
      camera *
      0.015,
      155,
      92,
      "#b7a1ff",
      "#354479"
    );


    /* FAR MOUNTAINS */

    drawMountainLayer(
      camera,
      0.10,
      350,
      "#31657b",
      160
    );

    drawMountainLayer(
      camera,
      0.18,
      395,
      "#287a70",
      130
    );


    /* FLOATING ISLANDS */

    drawFloatingIsland(
      1000 -
      camera * 0.11,
      260,
      160,
      50
    );

    drawFloatingIsland(
      300 -
      camera * 0.07,
      300,
      100,
      34
    );


    /* GROUND */

    const ground =
      ctx.createLinearGradient(
        0,
        420,
        0,
        HEIGHT
      );


    ground.addColorStop(
      0,
      "#47b768"
    );

    ground.addColorStop(
      0.18,
      "#2a874e"
    );

    ground.addColorStop(
      1,
      "#174535"
    );


    ctx.fillStyle =
      ground;

    ctx.fillRect(
      0,
      395,
      WIDTH,
      HEIGHT - 395
    );


    /* PATH */

    ctx.fillStyle =
      "#ae895a";

    ctx.beginPath();

    ctx.moveTo(
      0,
      570
    );

    ctx.bezierCurveTo(
      300,
      510,
      700,
      600,
      WIDTH,
      525
    );

    ctx.lineTo(
      WIDTH,
      670
    );

    ctx.bezierCurveTo(
      850,
      610,
      350,
      690,
      0,
      625
    );

    ctx.closePath();

    ctx.fill();


    /* WORLD SCENERY */

    drawScenery(camera);


    /* ENTITIES */

    const drawables = [];


    enemies.forEach(
      enemy => {

        if (
          enemy.alive
        ) {

          drawables.push({

            y: enemy.y,

            draw:
              () =>
                drawEnemy(
                  enemy
                )

          });

        }

      }
    );


    drawables.push({

      y: player.y,

      draw:
        () =>
          drawStickman(
            player
          )

    });


    if (
      player.pet
    ) {

      drawables.push({

        y:
          player.y + 12,

        draw:
          drawPet

      });

    }


    drawables
      .sort(
        (a, b) =>
          a.y - b.y
      )
      .forEach(
        entry =>
          entry.draw()
      );


    drawParticles();

  }


  /* =====================================================
     PARALLAX MOUNTAINS
  ===================================================== */

  function drawMountainLayer(
    camera,
    speed,
    baseY,
    color,
    height
  ) {

    ctx.fillStyle =
      color;

    ctx.beginPath();

    ctx.moveTo(
      0,
      baseY
    );


    for (
      let x = -200;
      x <= WIDTH + 300;
      x += 160
    ) {

      const worldX =
        x -
        (
          camera *
          speed
        ) %
        160;


      ctx.lineTo(
        worldX,
        baseY -
        height *
        (
          0.55 +
          (
            (
              x /
              160
            ) %
            3
          ) *
          0.12
        )
      );


      ctx.lineTo(
        worldX + 100,
        baseY
      );

    }


    ctx.lineTo(
      WIDTH,
      baseY
    );

    ctx.closePath();

    ctx.fill();

  }


  /* =====================================================
     FLOATING ISLAND
  ===================================================== */

  function drawFloatingIsland(
    x,
    y,
    width,
    height
  ) {

    ctx.fillStyle =
      "#51b96c";

    ctx.beginPath();

    ctx.ellipse(
      x,
      y,
      width / 2,
      24,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
      "#7a5a45";

    ctx.beginPath();

    ctx.moveTo(
      x - width / 2,
      y
    );

    ctx.lineTo(
      x,
      y + height
    );

    ctx.lineTo(
      x + width / 2,
      y
    );

    ctx.closePath();

    ctx.fill();

  }


  /* =====================================================
     WORLD SCENERY
  ===================================================== */

  function drawScenery(
    camera
  ) {

    /* TREES */

    for (
      let x = 150;
      x < earth.width;
      x += 310
    ) {

      const sx =
        x - camera;

      if (
        sx < -100 ||
        sx > WIDTH + 100
      ) {

        continue;

      }

      drawTree(
        sx,
        445 +
        (
          (
            x /
            310
          ) %
          2
        ) *
        65,
        0.8 +
        (
          x %
          5
        ) *
        0.03
      );

    }


    /* CRASH SITE */

    drawCrashedShip(
      crashedShip.x -
      camera,
      crashedShip.y
    );


    /* PARTS */

    shipParts.forEach(
      part => {

        if (
          !part.collected
        ) {

          drawShipPart(
            part.x -
            camera,
            part.y
          );

        }

      }
    );


    /* RUINS */

    drawRuins(
      1870 -
      camera,
      495
    );


    if (
      !ancientWeapon.collected
    ) {

      drawWeaponPickup(
        ancientWeapon.x -
        camera,
        ancientWeapon.y
      );

    }


    /* WATERFALL */

    drawWaterfall(
      3260 -
      camera,
      400
    );


    /* TOWER */

    drawTower(
      signalTower.x -
      camera,
      signalTower.y,
      signalTower.activated
    );


    /* PORTAL */

    drawAncientGate(
      ancientGate.x -
      camera,
      ancientGate.y,
      ancientGate.activated
    );


    /* PET */

    if (
      !beatFox.rescued
    ) {

      drawFox(
        beatFox.x -
        camera,
        beatFox.y,
        1
      );

    }

  }


  /* =====================================================
     TREE
  ===================================================== */

  function drawTree(
    x,
    y,
    scale
  ) {

    ctx.save();

    ctx.translate(
      x,
      y
    );

    ctx.scale(
      scale,
      scale
    );


    ctx.fillStyle =
      "#68462d";

    roundRect(
      -10,
      -75,
      20,
      85,
      8
    );

    ctx.fill();


    ctx.fillStyle =
      "#1f7b48";

    ctx.beginPath();

    ctx.arc(
      0,
      -95,
      38,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
      "#38a85d";

    ctx.beginPath();

    ctx.arc(
      -25,
      -82,
      27,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
      25,
      -82,
      27,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.restore();

  }


  /* =====================================================
     CRASHED SHIP
  ===================================================== */

  function drawCrashedShip(
    x,
    y
  ) {

    ctx.save();

    ctx.translate(
      x,
      y
    );

    ctx.rotate(
      -0.13
    );


    ctx.fillStyle =
      "#dce6ee";

    ctx.strokeStyle =
      "#1a2938";

    ctx.lineWidth =
      4;


    ctx.beginPath();

    ctx.ellipse(
      -10,
      -25,
      115,
      48,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.stroke();


    ctx.fillStyle =
      "#c73546";

    ctx.fillRect(
      -110,
      -45,
      55,
      42
    );


    ctx.fillStyle =
      "#286b92";

    ctx.beginPath();

    ctx.ellipse(
      30,
      -45,
      44,
      29,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.strokeStyle =
      "#ffffff";

    ctx.lineWidth =
      3;

    ctx.beginPath();

    ctx.moveTo(
      12,
      -65
    );

    ctx.lineTo(
      43,
      -31
    );

    ctx.lineTo(
      60,
      -61
    );

    ctx.stroke();


    ctx.restore();


    /* smoke */

    for (
      let i = 0;
      i < 5;
      i++
    ) {

      ctx.globalAlpha =
        0.20;

      ctx.fillStyle =
        "#18202c";

      ctx.beginPath();

      ctx.arc(
        x -
        90 -
        i * 12,
        y -
        85 -
        i * 28 +
        Math.sin(
          game.time +
          i
        ) *
        5,
        22 +
        i * 4,
        0,
        Math.PI * 2
      );

      ctx.fill();

    }


    ctx.globalAlpha = 1;

  }


  function drawShipPart(
    x,
    y
  ) {

    ctx.save();

    ctx.translate(
      x,
      y
    );

    ctx.rotate(
      game.time *
      0.8
    );


    ctx.shadowColor =
      "#70dcff";

    ctx.shadowBlur =
      15;


    ctx.fillStyle =
      "#9ceaff";

    ctx.fillRect(
      -14,
      -14,
      28,
      28
    );


    ctx.fillStyle =
      "white";

    ctx.fillRect(
      -5,
      -5,
      10,
      10
    );


    ctx.restore();

  }


  /* =====================================================
     RUINS
  ===================================================== */

  function drawRuins(
    x,
    y
  ) {

    ctx.fillStyle =
      "#7d8e90";


    ctx.fillRect(
      x - 100,
      y - 75,
      28,
      90
    );

    ctx.fillRect(
      x + 72,
      y - 92,
      28,
      107
    );


    ctx.fillStyle =
      "#a2b0aa";

    ctx.fillRect(
      x - 115,
      y - 90,
      55,
      18
    );

    ctx.fillRect(
      x + 58,
      y - 106,
      55,
      18
    );


    ctx.strokeStyle =
      "#7b6cff";

    ctx.lineWidth =
      4;

    ctx.beginPath();

    ctx.arc(
      x,
      y - 10,
      52,
      Math.PI,
      0
    );

    ctx.stroke();

  }


  function drawWeaponPickup(
    x,
    y
  ) {

    ctx.save();

    ctx.translate(
      x,
      y - 30
    );

    ctx.rotate(
      -0.7
    );


    ctx.shadowColor =
      "#967cff";

    ctx.shadowBlur =
      20;


    ctx.fillStyle =
      "#d9d2ff";

    ctx.fillRect(
      -5,
      -45,
      10,
      70
    );


    ctx.fillStyle =
      "#6b4bc4";

    ctx.fillRect(
      -13,
      20,
      26,
      8
    );


    ctx.fillStyle =
      "#251d35";

    ctx.fillRect(
      -4,
      27,
      8,
      28
    );


    ctx.restore();

  }


  /* =====================================================
     WATERFALL
  ===================================================== */

  function drawWaterfall(
    x,
    y
  ) {

    ctx.fillStyle =
      "#32836d";

    ctx.fillRect(
      x - 170,
      y,
      340,
      190
    );


    ctx.fillStyle =
      "#56d6ef";

    ctx.fillRect(
      x - 45,
      y,
      90,
      190
    );


    ctx.globalAlpha =
      0.42;

    ctx.fillStyle =
      "white";


    for (
      let i = 0;
      i < 5;
      i++
    ) {

      ctx.fillRect(
        x -
        38 +
        i * 18,
        y +
        (
          game.time *
          110 +
          i * 40
        ) %
        180,
        7,
        38
      );

    }


    ctx.globalAlpha = 1;

  }


  /* =====================================================
     SIGNAL TOWER
  ===================================================== */

  function drawTower(
    x,
    y,
    active
  ) {

    ctx.fillStyle =
      "#556a80";

    ctx.fillRect(
      x - 22,
      y - 170,
      44,
      185
    );


    ctx.fillStyle =
      "#d8e8f1";

    ctx.fillRect(
      x - 32,
      y - 120,
      64,
      15
    );


    ctx.fillStyle =
      active
        ? "#65e7ff"
        : "#41546c";


    ctx.beginPath();

    ctx.arc(
      x,
      y - 185,
      25,
      0,
      Math.PI * 2
    );

    ctx.fill();


    if (
      active
    ) {

      ctx.save();

      ctx.globalAlpha =
        0.26;

      ctx.fillStyle =
        "#70e9ff";

      ctx.fillRect(
        x - 7,
        0,
        14,
        y - 180
      );

      ctx.restore();

    }

  }


  /* =====================================================
     ANCIENT GATE
  ===================================================== */

  function drawAncientGate(
    x,
    y,
    active
  ) {

    ctx.save();


    ctx.strokeStyle =
      active
        ? "#84f0ff"
        : "#75838d";


    ctx.lineWidth =
      22;


    ctx.beginPath();

    ctx.arc(
      x,
      y - 70,
      70,
      Math.PI,
      0
    );

    ctx.stroke();


    ctx.fillStyle =
      "#7c8b8e";

    ctx.fillRect(
      x - 82,
      y - 70,
      22,
      90
    );

    ctx.fillRect(
      x + 60,
      y - 70,
      22,
      90
    );


    if (
      game.quest >= 5
    ) {

      const gradient =
        ctx.createRadialGradient(
          x,
          y - 65,
          5,
          x,
          y - 65,
          60
        );


      gradient.addColorStop(
        0,
        "rgba(255,255,255,.9)"
      );

      gradient.addColorStop(
        0.3,
        "rgba(85,222,255,.7)"
      );

      gradient.addColorStop(
        1,
        "rgba(112,74,255,.12)"
      );


      ctx.fillStyle =
        gradient;


      ctx.beginPath();

      ctx.arc(
        x,
        y - 65,
        58,
        0,
        Math.PI * 2
      );

      ctx.fill();

    }


    ctx.restore();

  }


  /* =====================================================
     PLAYER
  ===================================================== */

  function drawStickman(
    p
  ) {

    const screenX =
      p.x -
      game.cameraX;


    const depth =
      (
        p.y -
        earth.minY
      ) /
      (
        earth.maxY -
        earth.minY
      );


    const scale =
      0.82 +
      depth *
      0.22;


    ctx.save();

    ctx.translate(
      screenX,
      p.y
    );

    ctx.scale(
      scale *
      p.facing,
      scale
    );


    if (
      p.invulnerable > 0 &&
      Math.sin(
        game.time *
        30
      ) > 0
    ) {

      ctx.globalAlpha =
        0.35;

    }


    /* SHADOW */

    ctx.save();

    ctx.scale(
      p.facing,
      1
    );

    ctx.globalAlpha =
      0.24;

    ctx.fillStyle =
      "#081216";

    ctx.beginPath();

    ctx.ellipse(
      0,
      4,
      38,
      11,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();


    /* LEGS */

    ctx.strokeStyle =
      "#10151e";

    ctx.lineWidth =
      10;

    ctx.lineCap =
      "round";


    ctx.beginPath();

    ctx.moveTo(
      -8,
      -53
    );

    ctx.lineTo(
      -18,
      -10
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
      8,
      -53
    );

    ctx.lineTo(
      18,
      -10
    );

    ctx.stroke();


    /* BODY */

    ctx.lineWidth =
      13;


    ctx.beginPath();

    ctx.moveTo(
      0,
      -115
    );

    ctx.lineTo(
      0,
      -50
    );

    ctx.stroke();


    /* ARMS */

    ctx.lineWidth =
      9;


    ctx.beginPath();

    ctx.moveTo(
      -2,
      -100
    );

    ctx.lineTo(
      -28,
      -69
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
      2,
      -100
    );

    ctx.lineTo(
      31,
      -78
    );

    ctx.stroke();


    /* SCARF */

    ctx.fillStyle =
      "#e52e45";


    ctx.beginPath();

    ctx.moveTo(
      -4,
      -112
    );

    ctx.lineTo(
      -58 -
      Math.sin(
        game.time *
        4
      ) *
      9,
      -104
    );

    ctx.lineTo(
      -32,
      -90
    );

    ctx.closePath();

    ctx.fill();


    ctx.fillRect(
      -17,
      -119,
      35,
      12
    );


    /* HEAD */

    ctx.fillStyle =
      "#f7fbff";

    ctx.strokeStyle =
      "#10151e";

    ctx.lineWidth =
      5;


    ctx.beginPath();

    ctx.arc(
      0,
      -145,
      33,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.stroke();


    /* FACE */

    ctx.fillStyle =
      "#10151e";


    ctx.beginPath();

    ctx.arc(
      10,
      -151,
      4,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
      -10,
      -151,
      4,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.strokeStyle =
      "#10151e";

    ctx.lineWidth =
      3;


    ctx.beginPath();

    ctx.arc(
      0,
      -142,
      13,
      0.2,
      Math.PI - 0.2
    );

    ctx.stroke();


    /* GLOVES */

    ctx.fillStyle =
      "white";

    ctx.strokeStyle =
      "#10151e";

    ctx.lineWidth =
      3;


    ctx.beginPath();

    ctx.arc(
      -30,
      -67,
      10,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.stroke();


    ctx.beginPath();

    ctx.arc(
      33,
      -77,
      10,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.stroke();


    /* SHOES */

    ctx.fillStyle =
      "#e52e45";


    ctx.beginPath();

    ctx.ellipse(
      -21,
      -7,
      20,
      11,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.ellipse(
      21,
      -7,
      20,
      11,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();


    /* WEAPON */

    if (
      p.weapon
    ) {

      ctx.save();

      ctx.translate(
        30,
        -78
      );


      if (
        p.attackTimer > 0
      ) {

        ctx.rotate(
          -1.2
        );

      }

      else {

        ctx.rotate(
          -0.45
        );

      }


      ctx.fillStyle =
        "#c8c1ff";

      ctx.fillRect(
        -3,
        -58,
        7,
        68
      );


      ctx.fillStyle =
        "#6e4fd8";

      ctx.fillRect(
        -12,
        5,
        25,
        7
      );


      ctx.restore();

    }


    ctx.restore();

  }


  /* =====================================================
     PET
  ===================================================== */

  function drawFox(
    x,
    y,
    scale = 1
  ) {

    ctx.save();

    ctx.translate(
      x,
      y
    );

    ctx.scale(
      scale,
      scale
    );


    ctx.fillStyle =
      "#ff9b43";


    ctx.beginPath();

    ctx.arc(
      0,
      -22,
      18,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(
      -13,
      -33
    );

    ctx.lineTo(
      -20,
      -56
    );

    ctx.lineTo(
      -3,
      -39
    );

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(
      13,
      -33
    );

    ctx.lineTo(
      20,
      -56
    );

    ctx.lineTo(
      3,
      -39
    );

    ctx.fill();


    ctx.fillStyle =
      "#1b1b22";


    ctx.beginPath();

    ctx.arc(
      -6,
      -24,
      2.5,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
      6,
      -24,
      2.5,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.restore();

  }


  function drawPet() {

    const offsetX =
      -65 *
      player.facing;


    const x =
      player.x -
      game.cameraX +
      offsetX;


    const y =
      player.y + 4;


    drawFox(
      x,
      y,
      0.85
    );

  }


  /* =====================================================
     ENEMIES
  ===================================================== */

  function drawEnemy(
    enemy
  ) {

    const x =
      enemy.x -
      game.cameraX;


    ctx.save();

    ctx.translate(
      x,
      enemy.y
    );


    /* shadow */

    ctx.globalAlpha =
      0.2;

    ctx.fillStyle =
      "#061019";

    ctx.beginPath();

    ctx.ellipse(
      0,
      3,
      30,
      9,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.globalAlpha = 1;


    ctx.fillStyle =
      enemy.hitFlash > 0
        ? "#ffffff"
        : enemy.name === "Void Bug"
          ? "#8b52d8"
          : "#52d39c";


    ctx.beginPath();

    ctx.arc(
      0,
      -23,
      24,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
      "#111625";


    ctx.beginPath();

    ctx.arc(
      -8,
      -26,
      4,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
      8,
      -26,
      4,
      0,
      Math.PI * 2
    );

    ctx.fill();


    /* HP */

    ctx.fillStyle =
      "#172238";

    ctx.fillRect(
      -27,
      -61,
      54,
      5
    );


    ctx.fillStyle =
      "#ff627b";

    ctx.fillRect(
      -27,
      -61,
      54 *
      enemy.hp /
      enemy.maxHp,
      5
    );


    ctx.restore();

  }


  /* =====================================================
     PARTICLES DRAW
  ===================================================== */

  function drawParticles() {

    particles.forEach(
      p => {

        ctx.globalAlpha =
          p.life /
          p.maxLife;


        ctx.fillStyle =
          p.color;


        ctx.beginPath();

        ctx.arc(
          p.x -
          game.cameraX,
          p.y,
          p.size,
          0,
          Math.PI * 2
        );

        ctx.fill();

      }
    );


    ctx.globalAlpha = 1;

  }


  /* =====================================================
     MAIN DRAW
  ===================================================== */

  function draw() {

    ctx.save();


    if (
      game.cameraShake > 0
    ) {

      ctx.translate(
        random(
          -game.cameraShake,
          game.cameraShake
        ),
        random(
          -game.cameraShake,
          game.cameraShake
        )
      );

    }


    if (
      game.mode === "menu"
    ) {

      drawMenu();

    }


    if (
      game.mode === "flight"
    ) {

      drawFlight();

    }


    if (
      game.mode === "crash"
    ) {

      drawCrash();

    }


    if (
      game.mode === "earth"
    ) {

      drawEarth();

    }


    ctx.restore();

  }


  /* =====================================================
     GAME LOOP
  ===================================================== */

  let lastTime =
    performance.now();


  function gameLoop(now) {

    const dt =
      Math.min(
        0.033,
        (
          now -
          lastTime
        ) /
        1000
      );


    lastTime =
      now;


    update(dt);

    draw();


    requestAnimationFrame(
      gameLoop
    );

  }


  requestAnimationFrame(
    gameLoop
  );

})();
