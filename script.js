'use strict';

/* =========================================================
   MULTIVERSE: RIFTWALKER
   Full browser prototype
   - 7 worlds + The Hub
   - 500 HP stat system
   - armor + pet bonuses
   - attack cooldown + animated Nova Sword combo
   - Rift Credits
   - custom-drawn 2.5D visuals
   - procedural SFX
   - "Across the Rift" adaptive music
   - private WebRTC Bonus Mode through PeerJS
   ========================================================= */

const $ = id => document.getElementById(id);

const canvas = $('gameCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (a, b, c, d) => Math.hypot(a - c, b - d);
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));


/* =========================================================
   WORLDS
========================================================= */

const WORLD_ORDER = [
  'earth',
  'music',
  'money',
  'cosmos',
  'war',
  'void',
  'matrix'
];


const WORLDS = {

  earth: {
    name: 'Earth 2.0',
    width: 5400,
    skyA: '#75c9ef',
    skyB: '#d9eaa4',
    ground: '#4e9d68',
    dark: '#153b39',
    boss: 'Ruin Guardian',
    mechanic: 'Crash Survival',
    desc: 'Repair your ship, explore ancient ruins and survive the Guardian.',
    accent: '#6ee0a0'
  },

  music: {
    name: 'Music Verse',
    width: 5200,
    skyA: '#2a226b',
    skyB: '#bd5bbf',
    ground: '#b9429f',
    dark: '#211448',
    boss: 'Silence King',
    mechanic: 'Rhythm Energy',
    desc: 'Restore sound to districts controlled by the Silence King.',
    accent: '#6cecff'
  },

  money: {
    name: 'Money Village',
    width: 5200,
    skyA: '#5aa884',
    skyB: '#e2c66f',
    ground: '#b38a3d',
    dark: '#334329',
    boss: 'Greed Golem',
    mechanic: 'Trade & Treasure',
    desc: 'Explore markets, vaults and mines while rebuilding the village economy.',
    accent: '#f2d36d'
  },

  cosmos: {
    name: 'The Cosmos',
    width: 5400,
    skyA: '#07132d',
    skyB: '#32296f',
    ground: '#5c55a8',
    dark: '#080d2b',
    boss: 'Gravity Maw',
    mechanic: 'Low Gravity',
    desc: 'Cross floating stations and recover the Astral Core.',
    accent: '#92b8ff'
  },

  war: {
    name: 'The War Zone',
    width: 5300,
    skyA: '#44373e',
    skyB: '#9d5a40',
    ground: '#765342',
    dark: '#2b1c1d',
    boss: 'War Machine',
    mechanic: 'Battle Pressure',
    desc: 'Destroy war beacons and shut down the Titan Factory.',
    accent: '#ff8c61'
  },

  void: {
    name: 'The Void',
    width: 5200,
    skyA: '#070511',
    skyB: '#25123b',
    ground: '#2b173e',
    dark: '#030207',
    boss: 'Abyss Warden',
    mechanic: 'Darkness',
    desc: 'Use light, pets and instinct to cross the Abyss.',
    accent: '#a478ff'
  },

  matrix: {
    name: 'The Perfect Matrix',
    width: 5400,
    skyA: '#071b2b',
    skyB: '#382268',
    ground: '#263c56',
    dark: '#05071a',
    boss: 'Perfect Error',
    mechanic: 'Reality Glitch',
    desc: 'Repair corrupted reality and confront the Perfect Error.',
    accent: '#5af3ef'
  }
};


/* =========================================================
   PETS
========================================================= */

const PET_ROSTERS = {

  earth: [
    'Lucky Rabbit',
    'Moss Shell',
    'Glow Gecko',
    'Sky Finch',
    'Bounce Frog',
    'Ruin Pup',
    'Crystal Fawn',
    'Terra Sprout'
  ],

  music: [
    'Beat Fox',
    'Tempo Bunny',
    'Melody Bird',
    'Bass Cat',
    'Drum Frog',
    'Harmony Butterfly',
    'Chord Whelp',
    'Echo Pup'
  ],

  money: [
    'Coin Hamster',
    'Piggy Pal',
    'Savings Squirrel',
    'Golden Duck',
    'Bargain Hound',
    'Profit Bee',
    'Merchant Fox',
    'Ledger Owl'
  ],

  cosmos: [
    'Starling',
    'Nebula Cat',
    'Cosmic Squid',
    'Galaxy Moth',
    'Star Whale Calf',
    'Comet Pup',
    'Moon Hare',
    'Astral Dragon'
  ],

  war: [
    'Scout Hound',
    'Radar Hawk',
    'Iron Shell',
    'Charge Boar',
    'Valor Eagle',
    'Battle Wolf',
    'Medic Bot',
    'Titan Lion'
  ],

  void: [
    'Void Eye',
    'Shadow Cat',
    'Null Bat',
    'Abyss Blob',
    'Rift Spider',
    'Void Pup',
    'Darkling',
    'Abyss Dragon'
  ],

  matrix: [
    'Byte Cat',
    'Pixel Rabbit',
    'Code Fox',
    'Data Serpent',
    'Vector Bird',
    'Patch Bot',
    'Glitchling',
    'Perfect Entity'
  ]
};


const PET_TYPES = {

  'Lucky Rabbit': 'Light / Nature',
  'Moss Shell': 'Nature / Earth',
  'Glow Gecko': 'Light',
  'Sky Finch': 'Light',
  'Bounce Frog': 'Nature / Earth',
  'Ruin Pup': 'Earth',
  'Crystal Fawn': 'Light',
  'Terra Sprout': 'Nature',

  'Beat Fox': 'Sound',
  'Tempo Bunny': 'Sound / Light',
  'Melody Bird': 'Sound',
  'Bass Cat': 'Sound',
  'Drum Frog': 'Sound / Earth',
  'Harmony Butterfly': 'Sound / Light',
  'Chord Whelp': 'Sound / Cosmic',
  'Echo Pup': 'Sound',

  'Coin Hamster': 'Light',
  'Piggy Pal': 'Earth',
  'Savings Squirrel': 'Light / Nature',
  'Golden Duck': 'Light',
  'Bargain Hound': 'Light / Earth',
  'Profit Bee': 'Nature / Light',
  'Merchant Fox': 'Light',
  'Ledger Owl': 'Tech / Light',

  'Starling': 'Cosmic',
  'Nebula Cat': 'Cosmic',
  'Cosmic Squid': 'Cosmic / Void',
  'Galaxy Moth': 'Cosmic / Light',
  'Star Whale Calf': 'Cosmic / Water',
  'Comet Pup': 'Cosmic / Fire',
  'Moon Hare': 'Cosmic / Light',
  'Astral Dragon': 'Cosmic / Spirit',

  'Scout Hound': 'Earth',
  'Radar Hawk': 'Tech',
  'Iron Shell': 'Earth / Tech',
  'Charge Boar': 'Fire / Earth',
  'Valor Eagle': 'Light / Fire',
  'Battle Wolf': 'Earth / Fire',
  'Medic Bot': 'Tech',
  'Titan Lion': 'Fire / Light',

  'Void Eye': 'Void',
  'Shadow Cat': 'Dark',
  'Null Bat': 'Dark / Void',
  'Abyss Blob': 'Void',
  'Rift Spider': 'Void',
  'Void Pup': 'Void / Dark',
  'Darkling': 'Dark',
  'Abyss Dragon': 'Void / Fire',

  'Byte Cat': 'Tech / Glitch',
  'Pixel Rabbit': 'Glitch / Light',
  'Code Fox': 'Glitch / Tech',
  'Data Serpent': 'Glitch',
  'Vector Bird': 'Tech / Light',
  'Patch Bot': 'Tech',
  'Glitchling': 'Glitch',
  'Perfect Entity': 'Glitch / Spirit'
};


/* =========================================================
   PET STAT BONUSES
========================================================= */

const PET_BONUS = {

  'Lucky Rabbit': {
    hp: 30,
    speed: 10
  },

  'Moss Shell': {
    hp: 100,
    def: 25,
    speed: -5
  },

  'Glow Gecko': {
    hp: 20,
    atk: 8,
    speed: 15
  },

  'Sky Finch': {
    atk: 5,
    speed: 35
  },

  'Bounce Frog': {
    hp: 40,
    def: 5,
    speed: 25
  },

  'Ruin Pup': {
    hp: 50,
    atk: 15,
    def: 12,
    speed: 5
  },

  'Crystal Fawn': {
    hp: 120,
    def: 10
  },

  'Terra Sprout': {
    hp: 150,
    def: 18,
    speed: -5
  },


  'Beat Fox': {
    hp: 20,
    atk: 25,
    speed: 15,
    cooldown: .90
  },

  'Tempo Bunny': {
    hp: 10,
    atk: 10,
    speed: 35,
    cooldown: .88
  },

  'Melody Bird': {
    atk: 14,
    speed: 18
  },

  'Bass Cat': {
    hp: 40,
    atk: 30,
    def: 5
  },

  'Drum Frog': {
    hp: 60,
    atk: 18,
    def: 12
  },

  'Harmony Butterfly': {
    hp: 60,
    atk: 5,
    def: 10,
    speed: 15
  },

  'Chord Whelp': {
    hp: 90,
    atk: 24,
    def: 10
  },

  'Echo Pup': {
    hp: 35,
    atk: 10,
    speed: 10
  },


  'Coin Hamster': {
    hp: 25,
    speed: 8
  },

  'Piggy Pal': {
    hp: 100,
    def: 14
  },

  'Savings Squirrel': {
    hp: 40,
    speed: 18
  },

  'Golden Duck': {
    hp: 55,
    def: 8
  },

  'Bargain Hound': {
    hp: 50,
    def: 10
  },

  'Profit Bee': {
    hp: 35,
    speed: 22
  },

  'Merchant Fox': {
    atk: 10,
    speed: 20
  },

  'Ledger Owl': {
    def: 8,
    speed: 14
  },


  'Starling': {
    hp: 20,
    atk: 10,
    speed: 30
  },

  'Nebula Cat': {
    hp: 40,
    atk: 15,
    def: 5,
    speed: 35
  },

  'Cosmic Squid': {
    hp: 70,
    atk: 20
  },

  'Galaxy Moth': {
    hp: 30,
    speed: 28
  },

  'Star Whale Calf': {
    hp: 180,
    def: 25,
    speed: -10
  },

  'Comet Pup': {
    atk: 25,
    speed: 30
  },

  'Moon Hare': {
    hp: 40,
    speed: 30
  },

  'Astral Dragon': {
    hp: 130,
    atk: 38,
    def: 16
  },


  'Scout Hound': {
    hp: 50,
    atk: 10,
    def: 8,
    speed: 20
  },

  'Radar Hawk': {
    atk: 10,
    speed: 25
  },

  'Iron Shell': {
    hp: 180,
    def: 35,
    speed: -15
  },

  'Charge Boar': {
    hp: 100,
    atk: 22,
    def: 10
  },

  'Valor Eagle': {
    atk: 28,
    speed: 15
  },

  'Battle Wolf': {
    hp: 70,
    atk: 30,
    def: 10,
    speed: 10
  },

  'Medic Bot': {
    hp: 140,
    def: 15
  },

  'Titan Lion': {
    hp: 140,
    atk: 35,
    def: 18
  },


  'Void Eye': {
    atk: 10,
    def: 8
  },

  'Shadow Cat': {
    hp: 20,
    atk: 20,
    speed: 35
  },

  'Null Bat': {
    atk: 22,
    speed: 18
  },

  'Abyss Blob': {
    hp: 130,
    def: 24,
    speed: -8
  },

  'Rift Spider': {
    atk: 20,
    speed: 24
  },

  'Void Pup': {
    hp: 80,
    atk: 25,
    def: 10,
    speed: 15
  },

  'Darkling': {
    atk: 18,
    speed: 22
  },

  'Abyss Dragon': {
    hp: 120,
    atk: 45,
    def: 20,
    speed: 5
  },


  'Byte Cat': {
    hp: 50,
    atk: 20,
    def: 5,
    speed: 30
  },

  'Pixel Rabbit': {
    hp: 40,
    speed: 32
  },

  'Code Fox': {
    atk: 25,
    speed: 20
  },

  'Data Serpent': {
    atk: 24,
    def: 8
  },

  'Vector Bird': {
    atk: 18,
    speed: 28
  },

  'Patch Bot': {
    hp: 120,
    def: 25
  },

  'Glitchling': {
    atk: 30,
    speed: 18
  },

  'Perfect Entity': {
    hp: 200,
    atk: 40,
    def: 35,
    speed: 30,
    cooldown: .84
  }
};


/* =========================================================
   ARMOR
========================================================= */

const ARMORS = {

  none: {
    name: 'No Armor',
    hp: 0,
    atk: 0,
    def: 0,
    speed: 0,
    price: 0,
    unlocked: true
  },

  scout: {
    name: 'Scout Armor',
    hp: 40,
    atk: 0,
    def: 8,
    speed: 25,
    price: 750,
    unlocked: false
  },

  rift: {
    name: 'Rift Armor',
    hp: 100,
    atk: 12,
    def: 20,
    speed: 0,
    price: 2500,
    unlocked: false
  },

  titan: {
    name: 'Titan Armor',
    hp: 200,
    atk: 5,
    def: 40,
    speed: -20,
    price: 6000,
    unlocked: false
  },

  void: {
    name: 'Void Armor',
    hp: 80,
    atk: 25,
    def: 18,
    speed: 15,
    price: 8500,
    unlocked: false
  },

  matrix: {
    name: 'Perfect Matrix Armor',
    hp: 150,
    atk: 35,
    def: 30,
    speed: 35,
    price: 14000,
    unlocked: false
  }
};


const MATERIALS = [
  'Crystal Fragment',
  'Ancient Metal',
  'Rift Dust',
  'Sound Crystal',
  'Golden Ore',
  'Star Dust',
  'Titan Scrap',
  'Void Essence',
  'Glitch Fragment',
  'Boss Core'
];


/* =========================================================
   GAME STATE
========================================================= */

const G = {

  scene: 'menu',

  time: 0,
  sceneTime: 0,

  paused: false,

  worldId: null,

  camera: 0,

  hubFound: false,

  unlocked: new Set(['earth']),
  completed: new Set(),

  cores: 0,

  messageTime: 0,

  screenShake: 0,
  flash: 0,

  particles: [],
  pickups: [],
  enemies: [],
  props: [],

  progress: {},

  arena: null
};


/* =========================================================
   PLAYER
========================================================= */

const P = {

  x: 460,
  y: 530,

  vx: 0,
  vy: 0,

  jump: 0,

  onGround: true,

  facing: 1,

  level: 1,
  xp: 0,

  hp: 500,

  baseMaxHP: 500,
  baseAtk: 25,
  baseDef: 10,
  baseSpeed: 250,

  weapon: null,

  weaponLevel: 1,

  armor: 'none',

  credits: 250,

  attackCooldown: 0,

  baseAttackCooldown: .45,

  attackTimer: 0,

  attackIndex: 0,

  comboTimer: 0,

  invuln: 0,

  hitFlash: 0,

  dashTimer: 0,

  dashCooldown: 0,

  anim: {
    state: 'idle',
    time: 0
  },

  materials:
    Object.fromEntries(
      MATERIALS.map(x => [x, 0])
    )
};


const PET_STATE = {

  owned: {},

  active: null
};


const keys = Object.create(null);

let justPressed = new Set();


for (const id of WORLD_ORDER) {

  G.progress[id] = {

    fragments: 0,

    bossDefeated: false,

    petFound: [],

    beacons: 0,

    storyStage: 0,

    shipParts: 0
  };
}


/* =========================================================
   SOUND EFFECTS
========================================================= */

const SFX = {

  ctx: null,

  master: null,

  muted: false,


  init() {

    if (this.ctx) return;

    const AC =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AC) return;


    this.ctx = new AC();


    this.master =
      this.ctx.createGain();


    this.master.gain.value = .48;


    this.master.connect(
      this.ctx.destination
    );
  },


  resume() {

    this.init();


    if (
      this.ctx &&
      this.ctx.state === 'suspended'
    ) {

      this.ctx.resume();
    }
  },


  tone(
    freq = 100,
    dur = .1,
    type = 'sine',
    vol = .08,
    slide = 1
  ) {

    if (
      !this.ctx ||
      this.muted
    ) return;


    const o =
      this.ctx.createOscillator();


    const g =
      this.ctx.createGain();


    const t =
      this.ctx.currentTime;


    o.type = type;


    o.frequency.setValueAtTime(
      freq,
      t
    );


    o.frequency.exponentialRampToValueAtTime(
      Math.max(
        20,
        freq * slide
      ),
      t + dur
    );


    g.gain.setValueAtTime(
      .0001,
      t
    );


    g.gain.exponentialRampToValueAtTime(
      vol,
      t + .01
    );


    g.gain.exponentialRampToValueAtTime(
      .0001,
      t + dur
    );


    o.connect(g);

    g.connect(
      this.master
    );


    o.start(t);

    o.stop(
      t + dur + .02
    );
  },


  noise(
    dur = .08,
    vol = .05,
    cut = 1000
  ) {

    if (
      !this.ctx ||
      this.muted
    ) return;


    const n =
      Math.floor(
        this.ctx.sampleRate * dur
      );


    const b =
      this.ctx.createBuffer(
        1,
        n,
        this.ctx.sampleRate
      );


    const d =
      b.getChannelData(0);


    for (
      let i = 0;
      i < n;
      i++
    ) {

      d[i] =
        (Math.random() * 2 - 1) *
        (1 - i / n);
    }


    const s =
      this.ctx.createBufferSource();


    const f =
      this.ctx.createBiquadFilter();


    const g =
      this.ctx.createGain();


    s.buffer = b;


    f.type = 'lowpass';

    f.frequency.value = cut;


    g.gain.value = vol;


    s.connect(f);

    f.connect(g);

    g.connect(
      this.master
    );


    s.start();
  },


  click() {

    this.tone(
      520,
      .05,
      'triangle',
      .04,
      1.25
    );
  },


  jump() {

    this.tone(
      230,
      .12,
      'sine',
      .06,
      1.8
    );
  },


  land() {

    this.noise(
      .07,
      .035,
      500
    );
  },


  swing() {

    this.noise(
      .08,
      .05,
      1800
    );


    this.tone(
      330,
      .1,
      'sawtooth',
      .035,
      .65
    );
  },


  hit() {

    this.noise(
      .09,
      .07,
      900
    );


    this.tone(
      130,
      .08,
      'square',
      .035,
      .65
    );
  },


  hurt() {

    this.tone(
      110,
      .15,
      'sawtooth',
      .07,
      .55
    );
  },


  coin() {

    this.tone(
      780,
      .08,
      'sine',
      .05,
      1.35
    );


    setTimeout(
      () => {

        this.tone(
          1050,
          .08,
          'sine',
          .04,
          1.2
        );

      },
      55
    );
  },


  pet() {

    this.tone(
      480,
      .1,
      'sine',
      .04,
      1.5
    );


    setTimeout(
      () => {

        this.tone(
          720,
          .12,
          'sine',
          .04,
          1.3
        );

      },
      80
    );
  },


  core() {

    this.tone(
      110,
      .3,
      'sine',
      .09,
      1.4
    );


    setTimeout(
      () => {

        this.tone(
          440,
          .35,
          'triangle',
          .06,
          1.5
        );

      },
      120
    );
  },


  portal() {

    this.tone(
      160,
      .5,
      'sine',
      .06,
      3
    );
  },


  boss() {

    this.tone(
      70,
      .45,
      'sawtooth',
      .08,
      .7
    );
  },


  toggle() {

    this.muted =
      !this.muted;


    if (this.master) {

      this.master.gain.value =
        this.muted
          ? 0
          : .48;
    }
  }
};


/* =========================================================
   MUSIC
   ACROSS THE RIFT
========================================================= */

const MUSIC = {

  ctx: null,

  master: null,

  started: false,

  muted: false,

  timer: null,

  step: 0,

  bpm: 92,

  world: 'earth',

  boss: false,

  volume: .18,


  notes: {

    C2: 65.41,

    D2: 73.42,

    F2: 87.31,

    G2: 98,

    A2: 110,

    Bb2: 116.54,

    C3: 130.81,

    D3: 146.83,

    F3: 174.61,

    G3: 196,

    A3: 220,

    Bb3: 233.08,

    C4: 261.63,

    D4: 293.66,

    F4: 349.23,

    G4: 392,

    A4: 440,

    Bb4: 466.16,

    C5: 523.25,

    D5: 587.33
  },


  melody: [

    'D4',
    null,
    'F4',
    'A4',

    null,
    'G4',
    'F4',
    null,

    'D4',
    null,
    'F4',
    'C5',

    'A4',
    null,
    'G4',
    null,

    'F4',
    null,
    'A4',
    'C5',

    null,
    'A4',
    'G4',
    'F4',

    'G4',
    null,
    'A4',
    'D5',

    'C5',
    'A4',
    'F4',
    null
  ],


  bass: [

    'D2',
    null,

    'D2',
    'A2',

    'Bb2',
    null,

    'F2',
    null,

    'F2',
    null,

    'C3',
    null,

    'C2',
    null,

    'G2',
    null
  ],


  styles: {

    hub: [
      82,
      'sine',
      .42
    ],

    earth: [
      92,
      'triangle',
      .55
    ],

    music: [
      118,
      'square',
      .72
    ],

    money: [
      104,
      'triangle',
      .62
    ],

    cosmos: [
      72,
      'sine',
      .34
    ],

    war: [
      128,
      'sawtooth',
      .68
    ],

    void: [
      58,
      'sine',
      .24
    ],

    matrix: [
      110,
      'square',
      .56
    ],

    arena: [
      132,
      'sawtooth',
      .7
    ]
  },


  init() {

    SFX.resume();


    if (!SFX.ctx) return;


    this.ctx = SFX.ctx;


    if (this.master) return;


    this.master =
      this.ctx.createGain();


    this.master.gain.value =
      this.volume;


    this.master.connect(
      this.ctx.destination
    );
  },


  start() {

    this.init();


    if (this.started) return;


    this.started = true;

    this.step = 0;


    this.schedule();
  },


  setWorld(w) {

    this.world = w;


    this.bpm =
      (
        this.styles[w] ||
        this.styles.earth
      )[0]
      +
      (
        this.boss
          ? 18
          : 0
      );
  },


  tone(
    freq,
    dur,
    type = 'sine',
    vol = .02,
    delay = 0
  ) {

    if (
      !this.ctx ||
      this.muted ||
      !freq
    ) return;


    const t =
      this.ctx.currentTime +
      delay;


    const o =
      this.ctx.createOscillator();


    const g =
      this.ctx.createGain();


    const f =
      this.ctx.createBiquadFilter();


    o.type = type;

    o.frequency.value = freq;


    f.type = 'lowpass';


    f.frequency.value =
      800 +
      (
        this.styles[this.world] ||
        this.styles.earth
      )[2] *
      2600;


    g.gain.setValueAtTime(
      .0001,
      t
    );


    g.gain.exponentialRampToValueAtTime(
      vol,
      t + .025
    );


    g.gain.exponentialRampToValueAtTime(
      .0001,
      t + dur
    );


    o.connect(f);

    f.connect(g);

    g.connect(
      this.master
    );


    o.start(t);

    o.stop(
      t + dur + .04
    );
  },


  chord() {

    const chords = [

      [
        'D3',
        'F3',
        'A3'
      ],

      [
        'Bb2',
        'D3',
        'F3'
      ],

      [
        'F3',
        'A3',
        'C4'
      ],

      [
        'C3',
        'G3',
        'C4'
      ]
    ];


    const chord =
      chords[
        Math.floor(
          this.step / 8
        ) % 4
      ];


    for (
      const note of chord
    ) {

      this.tone(
        this.notes[note],
        1.6,
        'sine',
        .012
      );


      this.tone(
        this.notes[note] * 2,
        1.2,
        'triangle',
        .004
      );
    }
  },


  melodyStep() {

    let note =
      this.melody[
        this.step %
        this.melody.length
      ];


    if (!note) return;


    if (
      this.world === 'void' &&
      this.step % 5 === 0
    ) {

      return;
    }


    let freq =
      this.notes[note];


    if (
      this.world === 'matrix' &&
      Math.random() < .12
    ) {

      freq *=
        Math.random() > .5
          ? 1.06
          : .94;
    }


    const wave =
      (
        this.styles[this.world] ||
        this.styles.earth
      )[1];


    this.tone(
      freq,
      .28,
      wave,
      this.boss
        ? .036
        : .025
    );


    if (
      this.world === 'music'
    ) {

      this.tone(
        freq * 1.5,
        .18,
        'sine',
        .009
      );
    }


    if (
      this.world === 'cosmos'
    ) {

      this.tone(
        freq * 2,
        .65,
        'sine',
        .006,
        .05
      );
    }
  },


  bassStep() {

    const note =
      this.bass[
        this.step %
        this.bass.length
      ];


    if (note) {

      this.tone(
        this.notes[note],
        .34,
        'sine',
        this.boss
          ? .034
          : .019
      );
    }
  },


  drum(power = 1) {

    if (
      !this.ctx ||
      this.muted
    ) return;


    const n =
      Math.floor(
        this.ctx.sampleRate *
        .07
      );


    const b =
      this.ctx.createBuffer(
        1,
        n,
        this.ctx.sampleRate
      );


    const d =
      b.getChannelData(0);


    for (
      let i = 0;
      i < n;
      i++
    ) {

      d[i] =
        (Math.random() * 2 - 1) *
        (1 - i / n) ** 2;
    }


    const source =
      this.ctx.createBufferSource();


    const filter =
      this.ctx.createBiquadFilter();


    const gain =
      this.ctx.createGain();


    source.buffer = b;


    filter.type =
      'lowpass';


    filter.frequency.value =
      (
        this.world === 'war' ||
        this.world === 'arena'
      )
        ? 520
        : 1000;


    gain.gain.value =
      .012 *
      power;


    source.connect(filter);

    filter.connect(gain);

    gain.connect(
      this.master
    );


    source.start();
  },


  rhythm() {

    if (
      this.world === 'war' ||
      this.world === 'arena'
    ) {

      if (
        this.step % 2 === 0
      ) {

        this.drum(1.9);
      }

    }

    else if (
      this.world === 'music'
    ) {

      if (
        this.step % 2 === 0
      ) {

        this.drum(1);
      }

    }

    else if (
      this.step % 8 === 0
    ) {

      this.drum(.3);
    }
  },


  schedule() {

    if (!this.started) return;


    if (
      this.step % 8 === 0
    ) {

      this.chord();
    }


    this.melodyStep();


    if (
      this.step % 2 === 0
    ) {

      this.bassStep();
    }


    this.rhythm();


    if (
      this.boss &&
      this.step % 2 === 0
    ) {

      this.drum(1.2);
    }


    this.step++;


    this.timer =
      setTimeout(
        () => this.schedule(),
        (
          60 /
          this.bpm /
          2
        ) *
        1000
      );
  },


  startBoss() {

    if (this.boss) return;


    this.boss = true;

    this.setWorld(
      this.world
    );


    SFX.boss();
  },


  endBoss() {

    this.boss = false;

    this.setWorld(
      this.world
    );
  },


  toggle() {

    this.muted =
      !this.muted;


    if (this.master) {

      this.master.gain.value =
        this.muted
          ? 0
          : this.volume;
    }
  }
};


/* =========================================================
   PLAYER STATS
========================================================= */

function activePet() {

  return PET_STATE.active
    ? PET_STATE.owned[
        PET_STATE.active
      ]
    : null;
}


function getStats() {

  const armor =
    ARMORS[P.armor] ||
    ARMORS.none;


  const pet =
    activePet();


  const pb =
    pet
      ? (
          PET_BONUS[pet.name] ||
          {}
        )
      : {};


  const level =
    P.level - 1;


  const evoBoost =
    pet
      ? 1 +
        (
          pet.level - 1
        ) *
        .015
      : 1;


  return {

    maxHP:
      Math.round(
        P.baseMaxHP +
        level * 10 +
        armor.hp +
        (pb.hp || 0) *
        evoBoost
      ),


    atk:
      Math.round(
        P.baseAtk +
        level * 2 +
        armor.atk +
        (pb.atk || 0) *
        evoBoost +
        (
          P.weapon
            ? 20 +
              (
                P.weaponLevel - 1
              ) *
              4
            : 0
        )
      ),


    def:
      Math.round(
        P.baseDef +
        Math.floor(
          level * 1.2
        ) +
        armor.def +
        (pb.def || 0) *
        evoBoost
      ),


    speed:
      clamp(
        Math.round(
          P.baseSpeed +
          armor.speed +
          (pb.speed || 0) *
          evoBoost
        ),
        150,
        390
      ),


    cooldown:
      Math.max(
        .18,
        P.baseAttackCooldown *
        (
          pb.cooldown ||
          1
        )
      )
  };
}


/* =========================================================
   RIFT CREDITS
========================================================= */

function addCredits(
  amount,
  x = P.x,
  y = P.y
) {

  amount =
    Math.max(
      0,
      Math.round(amount)
    );


  P.credits += amount;


  floatingText(
    '+' +
    amount +
    ' CREDITS',
    x,
    y - 70,
    '#8ff5ff'
  );


  SFX.coin();

  syncHUD();
}


function spendCredits(amount) {

  if (
    P.credits <
    amount
  ) {

    toast(
      'RIFT MARKET',
      'Not enough Rift Credits.'
    );

    return false;
  }


  P.credits -= amount;


  SFX.click();

  syncHUD();


  return true;
}


function addMaterial(
  name,
  amount = 1
) {

  P.materials[name] =
    (
      P.materials[name] ||
      0
    )
    +
    amount;


  floatingText(
    '+' +
    amount +
    ' ' +
    name,
    P.x,
    P.y - 70,
    '#d8c7ff'
  );
}


function preserveHealthForStatChange(
  oldMax,
  newMax
) {

  const ratio =
    oldMax > 0
      ? P.hp / oldMax
      : 1;


  P.hp =
    clamp(
      Math.round(
        newMax * ratio
      ),
      1,
      newMax
    );
}


/* =========================================================
   RESET / NEW GAME
========================================================= */

function resetGame() {

  G.scene = 'flight';

  G.sceneTime = 0;

  G.worldId = null;

  G.camera = 0;

  G.hubFound = false;

  G.unlocked =
    new Set([
      'earth'
    ]);

  G.completed =
    new Set();

  G.cores = 0;

  G.enemies = [];

  G.pickups = [];

  G.particles = [];

  G.progress = {};


  for (
    const id of
    WORLD_ORDER
  ) {

    G.progress[id] = {

      fragments: 0,

      bossDefeated: false,

      petFound: [],

      beacons: 0,

      storyStage: 0,

      shipParts: 0
    };
  }


  Object.assign(
    P,
    {

      x: 460,

      y: 530,

      vx: 0,

      vy: 0,

      jump: 0,

      onGround: true,

      facing: 1,

      level: 1,

      xp: 0,

      hp: 500,

      weapon: null,

      weaponLevel: 1,

      armor: 'none',

      credits: 250,

      attackCooldown: 0,

      attackTimer: 0,

      attackIndex: 0,

      comboTimer: 0,

      invuln: 0,

      hitFlash: 0,

      dashTimer: 0,

      dashCooldown: 0,

      materials:
        Object.fromEntries(
          MATERIALS.map(
            x => [
              x,
              0
            ]
          )
        )
    }
  );


  PET_STATE.owned = {};

  PET_STATE.active = null;


  $('startScreen')
    .classList
    .add('hidden');


  $('hud')
    .classList
    .remove('hidden');


  MUSIC.start();

  MUSIC.setWorld(
    'earth'
  );


  SFX.resume();
}


/* =========================================================
   BEGIN WORLD
========================================================= */

function beginWorld(id) {

  const world =
    WORLDS[id];


  if (!world) return;


  G.scene =
    'world';


  G.worldId =
    id;


  G.camera =
    0;


  G.sceneTime =
    0;


  P.x =
    430;


  P.y =
    530;


  P.vx =
    0;


  P.jump =
    0;


  P.onGround =
    true;


  G.enemies =
    G.enemies.filter(
      enemy =>
        enemy.world !== id
    );


  G.pickups =
    [];


  spawnWorldContent(
    id
  );


  MUSIC.setWorld(
    id
  );


  MUSIC.endBoss();


  if (
    id === 'earth'
  ) {

    updateEarthQuest();

  }

  else {

    quest(
      world.mechanic,
      'Collect 5 Rift Fragments and find the ' +
      world.boss +
      '.'
    );
  }


  syncHUD();
}


/* =========================================================
   THE HUB
========================================================= */

function beginHub() {

  G.scene =
    'hub';


  G.worldId =
    null;


  G.camera =
    0;


  G.hubFound =
    true;


  P.x =
    640;


  P.y =
    535;


  P.vx =
    0;


  P.jump =
    0;


  MUSIC.setWorld(
    'hub'
  );


  MUSIC.endBoss();


  quest(
    'THE HUB',
    'Prepare your gear, train pets and choose your next world.'
  );


  syncHUD();
}


/* =========================================================
   WORLD TRAVEL
========================================================= */

function travelTo(id) {

  if (
    !G.unlocked.has(id)
  ) return;


  closeAllOverlays();


  G.scene =
    'travel';


  G.travelTarget =
    id;


  G.sceneTime =
    0;


  SFX.portal();


  MUSIC.setWorld(
    id
  );
}


/* =========================================================
   SPAWN WORLD CONTENT
========================================================= */

function spawnWorldContent(id) {

  const world =
    WORLDS[id];


  const progress =
    G.progress[id];


  if (
    id !== 'earth'
  ) {

    for (
      let i = 0;
      i < 5;
      i++
    ) {

      if (
        i >=
        progress.fragments
      ) {

        G.pickups.push({

          kind:
            'fragment',

          x:
            950 +
            i * 720,

          y:
            510 +
            (
              i % 2
            ) *
            30,

          taken:
            false
        });
      }
    }
  }


  const roster =
    PET_ROSTERS[id];


  roster.forEach(
    (
      name,
      i
    ) => {

      if (
        !progress.petFound.includes(
          name
        )
      ) {

        G.pickups.push({

          kind:
            'pet',

          name,

          x:
            720 +
            i * 540,

          y:
            520 -
            (
              i % 3
            ) *
            18,

          taken:
            false
        });
      }
    }
  );


  const count =
    id === 'earth'
      ? 8
      : 10;


  for (
    let i = 0;
    i < count;
    i++
  ) {

    spawnEnemy(
      id,

      1050 +
      i * 430,

      520 +
      (
        i % 3
      ) *
      20,

      false
    );
  }


  if (
    id === 'war' &&
    progress.beacons < 3
  ) {

    for (
      let i =
        progress.beacons;

      i < 3;

      i++
    ) {

      G.pickups.push({

        kind:
          'beacon',

        x:
          1700 +
          i * 1050,

        y:
          520,

        taken:
          false
      });
    }
  }


  if (
    progress.bossDefeated
  ) {

    G.pickups.push({

      kind:
        'portal',

      x:
        world.width -
        420,

      y:
        500,

      taken:
        false
    });

  }

  else if (
    id !== 'earth' &&
    progress.fragments >= 5 &&
    (
      id !== 'war' ||
      progress.beacons >= 3
    )
  ) {

    spawnEnemy(
      id,
      world.width - 650,
      500,
      true
    );
  }
}


/* =========================================================
   ENEMIES
========================================================= */

function spawnEnemy(
  world,
  x,
  y,
  boss = false
) {

  const data =
    WORLDS[world];


  const worldIndex =
    WORLD_ORDER.indexOf(
      world
    );


  const normalHP =
    110 +
    worldIndex *
    25;


  const bossHP =
    650 +
    worldIndex *
    120;


  G.enemies.push({

    id:
      cryptoId(),

    world,

    x,

    y,

    vx:
      0,

    hp:
      boss
        ? bossHP
        : normalHP,

    maxHP:
      boss
        ? bossHP
        : normalHP,

    damage:
      boss
        ? 55
        : 24 +
          worldIndex *
          4,

    boss,

    alive:
      true,

    hit:
      0,

    attackCd:
      rand(
        .2,
        1.2
      ),

    phase:
      0,

    name:
      boss
        ? data.boss
        : 'Rift Creature'
  });


  if (boss) {

    MUSIC.startBoss();


    toast(
      'BOSS DETECTED',
      data.boss
    );
  }
}


function cryptoId() {

  return (
    Math.random()
      .toString(36)
      .slice(2)
    +
    Date.now()
      .toString(36)
      .slice(-4)
  );
}


/* =========================================================
   EARTH 2.0 STORY
========================================================= */

function updateEarthQuest() {

  const progress =
    G.progress.earth;


  const stage =
    progress.storyStage;


  if (
    stage === 0
  ) {

    quest(
      'STRANDED',
      'Inspect the crashed ship.'
    );
  }


  if (
    stage === 1
  ) {

    quest(
      'FIRST WEAPON',
      'Find the energy signature east of the wreck.'
    );
  }


  if (
    stage === 2
  ) {

    quest(
      'SHIP PARTS',
      'Recover 3 ship components. ' +
      progress.shipParts +
      '/3'
    );
  }


  if (
    stage === 3
  ) {

    quest(
      'SIGNAL PEAK',
      'Activate the ancient signal tower.'
    );
  }


  if (
    stage === 4
  ) {

    quest(
      'ANCIENT GATE',
      'Open the gate and face what is protecting it.'
    );
  }


  if (
    stage === 5
  ) {

    quest(
      'RUIN GUARDIAN',
      'Defeat the Ruin Guardian.'
    );
  }


  if (
    stage === 6
  ) {

    quest(
      'REPAIR THE SHIP',
      'Return to the wreck and repair your ship.'
    );
  }


  if (
    stage >= 7
  ) {

    quest(
      'THE SIGNAL',
      'Launch toward the mysterious Hub signal.'
    );
  }
}


/* =========================================================
   WORLD COMPLETION
========================================================= */

function completeWorld(id) {

  if (
    G.completed.has(id)
  ) return;


  G.completed.add(
    id
  );


  G.progress[id]
    .bossDefeated =
    true;


  G.cores++;


  addMaterial(
    'Boss Core',
    1
  );


  addCredits(
    350 +
    WORLD_ORDER.indexOf(id) *
    100
  );


  SFX.core();


  MUSIC.endBoss();


  const index =
    WORLD_ORDER.indexOf(
      id
    );


  if (
    index >= 0 &&
    index <
    WORLD_ORDER.length - 1
  ) {

    G.unlocked.add(
      WORLD_ORDER[
        index + 1
      ]
    );
  }


  if (
    id === 'earth'
  ) {

    G.progress.earth
      .storyStage =
      6;


    updateEarthQuest();

  }

  else {

    G.pickups.push({

      kind:
        'portal',

      x:
        WORLDS[id].width -
        420,

      y:
        500,

      taken:
        false
    });


    quest(
      'CORE RECOVERED',
      'Return to The Hub through the Rift portal.'
    );
  }
}


/* =========================================================
   KEYBOARD INPUT
========================================================= */

window.addEventListener(
  'keydown',
  event => {

    if (
      [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        ' '
      ].includes(
        event.key
      )
    ) {

      event.preventDefault();
    }


    const key =
      event.key.toLowerCase();


    if (
      !keys[key]
    ) {

      justPressed.add(
        key
      );
    }


    keys[key] =
      true;


    if (
      key === 'f' &&
      !G.paused
    ) {

      tryAttack();
    }


    if (
      key === 'v'
    ) {

      SFX.toggle();

      MUSIC.toggle();


      toast(
        'AUDIO',
        MUSIC.muted
          ? 'Music and effects muted.'
          : 'Music and effects on.'
      );
    }


    if (
      key === 'i'
    ) {

      toggleOverlay(
        'inventoryOverlay',
        renderInventory
      );
    }


    if (
      key === 'j'
    ) {

      toggleOverlay(
        'petsOverlay',
        renderPets
      );
    }


    if (
      key === 'm' &&
      G.scene === 'hub'
    ) {

      toggleOverlay(
        'mapOverlay',
        renderWorldMap
      );
    }


    if (
      key === 'escape'
    ) {

      togglePause();
    }
  }
);


window.addEventListener(
  'keyup',
  event => {

    keys[
      event.key.toLowerCase()
    ] = false;
  }
);


/* =========================================================
   PLAYER ANIMATION
========================================================= */

function setAnim(
  state
) {

  if (
    P.anim.state ===
    state
  ) return;


  P.anim.state =
    state;


  P.anim.time =
    0;
}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayer(
  dt,
  bounds
) {

  const stats =
    getStats();


  P.attackCooldown =
    Math.max(
      0,
      P.attackCooldown - dt
    );


  P.attackTimer =
    Math.max(
      0,
      P.attackTimer - dt
    );


  P.comboTimer =
    Math.max(
      0,
      P.comboTimer - dt
    );


  P.invuln =
    Math.max(
      0,
      P.invuln - dt
    );


  P.hitFlash =
    Math.max(
      0,
      P.hitFlash - dt
    );


  P.dashCooldown =
    Math.max(
      0,
      P.dashCooldown - dt
    );


  P.dashTimer =
    Math.max(
      0,
      P.dashTimer - dt
    );


  P.anim.time +=
    dt;


  let move =

    (
      keys['a'] ||
      keys['arrowleft']
        ? -1
        : 0
    )

    +

    (
      keys['d'] ||
      keys['arrowright']
        ? 1
        : 0
    );


  if (move) {

    P.facing =
      Math.sign(move);
  }


  if (
    justPressed.has(
      'shift'
    )
    &&
    P.dashCooldown <= 0
  ) {

    P.dashTimer =
      .16;


    P.dashCooldown =
      .75;


    SFX.tone(
      180,
      .12,
      'sawtooth',
      .04,
      2
    );


    burst(
      P.x,
      P.y - 40,
      '#75e9ff',
      10
    );
  }


  const target =
    move *
    stats.speed *
    (
      P.dashTimer > 0
        ? 2.6
        : 1
    );


  P.vx =
    lerp(
      P.vx,
      target,
      Math.min(
        1,
        dt *
        (
          P.dashTimer > 0
            ? 18
            : 10
        )
      )
    );


  if (
    !move &&
    P.dashTimer <= 0
  ) {

    P.vx *=
      Math.pow(
        .001,
        dt
      );
  }


  P.x =
    clamp(
      P.x +
      P.vx *
      dt,

      80,

      bounds - 80
    );


  if (
    (
      justPressed.has(' ') ||
      justPressed.has('w') ||
      justPressed.has('arrowup')
    )
    &&
    P.onGround
  ) {

    P.vy =
      -520;


    P.onGround =
      false;


    SFX.jump();
  }


  if (
    !P.onGround
  ) {

    P.vy +=
      1250 *
      dt;


    P.jump -=
      P.vy *
      dt;


    if (
      P.jump <= 0 &&
      P.vy > 0
    ) {

      P.jump =
        0;


      P.vy =
        0;


      P.onGround =
        true;


      SFX.land();


      burst(
        P.x,
        P.y,
        '#d5e9f2',
        6
      );
    }
  }


  if (
    P.attackTimer > 0
  ) {

    setAnim(
      'attack'
    );
  }

  else if (
    P.dashTimer > 0
  ) {

    setAnim(
      'dash'
    );
  }

  else if (
    !P.onGround
  ) {

    setAnim(
      P.vy < 0
        ? 'jump'
        : 'fall'
    );
  }

  else if (
    Math.abs(P.vx) >
    35
  ) {

    setAnim(
      'run'
    );
  }

  else {

    setAnim(
      'idle'
    );
  }
}


/* =========================================================
   NOVA SWORD ATTACK
========================================================= */

function tryAttack() {

  if (
    G.paused ||
    isOverlayOpen() ||
    ![
      'world',
      'hub',
      'arena'
    ].includes(
      G.scene
    ) ||
    !P.weapon ||
    P.attackCooldown > 0
  ) {

    return;
  }


  const stats =
    getStats();


  P.attackCooldown =
    stats.cooldown;


  P.attackTimer =
    .25;


  if (
    P.comboTimer > 0
  ) {

    P.attackIndex =
      (
        P.attackIndex + 1
      ) %
      3;

  }

  else {

    P.attackIndex =
      0;
  }


  P.comboTimer =
    .8;


  SFX.swing();


  const range =
    P.attackIndex === 2
      ? 125
      : 92;


  const damage =
    Math.round(
      stats.atk *
      (
        P.attackIndex === 2
          ? 1.45
          : 1
      )
      *
      rand(
        .9,
        1.1
      )
    );


  if (
    G.scene === 'arena'
  ) {

    arenaLocalAttack(
      range,
      damage
    );

    return;
  }


  let hit =
    false;


  for (
    const enemy of
    G.enemies
  ) {

    if (
      !enemy.alive ||
      enemy.world !==
      G.worldId
    ) {

      continue;
    }


    const dx =
      (
        enemy.x -
        P.x
      )
      *
      P.facing;


    if (
      dx > -35 &&
      dx < range &&
      Math.abs(
        enemy.y -
        P.y
      ) <
      85
    ) {

      hurtEnemy(
        enemy,
        damage
      );


      hit =
        true;
    }
  }


  if (hit) {

    G.screenShake =
      Math.max(
        G.screenShake,
        P.attackIndex === 2
          ? 8
          : 4
      );
  }
}


/* =========================================================
   DAMAGE ENEMY
========================================================= */

function hurtEnemy(
  enemy,
  damage
) {

  enemy.hp -=
    damage;


  enemy.hit =
    .15;


  SFX.hit();


  burst(
    enemy.x,
    enemy.y - 40,

    enemy.boss
      ? '#ff6e87'
      : '#7ff4ca',

    8
  );


  floatingText(
    '-' + damage,
    enemy.x,
    enemy.y - 80,
    '#ffffff'
  );


  if (
    enemy.hp <= 0
  ) {

    killEnemy(
      enemy
    );
  }
}


/* =========================================================
   ENEMY DEFEAT
========================================================= */

function killEnemy(
  enemy
) {

  enemy.alive =
    false;


  burst(
    enemy.x,
    enemy.y - 45,

    enemy.boss
      ? '#ff6e87'
      : '#72e6ff',

    22
  );


  if (
    enemy.boss
  ) {

    completeWorld(
      enemy.world
    );

  }

  else {

    addCredits(
      randi(
        6,
        18
      ),
      enemy.x,
      enemy.y
    );


    if (
      Math.random() <
      .28
    ) {

      addMaterial(
        worldMaterial(
          enemy.world
        ),
        1
      );
    }
  }
}


/* =========================================================
   WORLD MATERIALS
========================================================= */

function worldMaterial(id) {

  return {

    earth:
      'Ancient Metal',

    music:
      'Sound Crystal',

    money:
      'Golden Ore',

    cosmos:
      'Star Dust',

    war:
      'Titan Scrap',

    void:
      'Void Essence',

    matrix:
      'Glitch Fragment'

  }[id]
  ||
  'Rift Dust';
}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function hurtPlayer(
  amount,
  sourceX
) {

  if (
    P.invuln > 0
  ) return;


  const stats =
    getStats();


  const finalDamage =
    Math.max(
      1,
      Math.round(
        amount -
        stats.def *
        .55
      )
    );


  P.hp =
    Math.max(
      0,
      P.hp -
      finalDamage
    );


  P.invuln =
    .72;


  P.hitFlash =
    .18;


  P.vx =
    (
      P.x <
      sourceX
        ? -1
        : 1
    )
    *
    210;


  G.screenShake =
    8;


  G.flash =
    .08;


  SFX.hurt();


  burst(
    P.x,
    P.y - 65,
    '#ff6c7c',
    9
  );


  floatingText(
    '-' +
    finalDamage,

    P.x,

    P.y - 110,

    '#ff8290'
  );


  /*
     IMPORTANT:
     No "Impact taken" dialogue here.
     Damage is communicated through:
     HP loss
     flash
     particles
     knockback
     sound
  */


  if (
    P.hp <= 0
  ) {

    playerDefeated();
  }


  syncHUD();
}


/* =========================================================
   PLAYER DEFEATED
========================================================= */

function playerDefeated() {

  const stats =
    getStats();


  P.hp =
    stats.maxHP;


  P.x =
    G.scene === 'hub'
      ? 640
      : 430;


  P.jump =
    0;


  P.vy =
    0;


  toast(
    'RIFT STABILIZED',
    'You were pulled back to the last safe point.'
  );


  P.credits =
    Math.max(
      0,
      P.credits - 50
    );
}


/* =========================================================
   ENEMY AI + PET COMBAT
========================================================= */

function updateEnemies(dt) {

  for (
    const enemy of
    G.enemies
  ) {

    if (
      !enemy.alive ||
      enemy.world !==
      G.worldId
    ) {

      continue;
    }


    enemy.hit =
      Math.max(
        0,
        enemy.hit - dt
      );


    enemy.attackCd -=
      dt;


    const dx =
      P.x -
      enemy.x;


    const distance =
      Math.abs(dx);


    if (
      distance < 620 &&
      !enemy.boss
    ) {

      enemy.vx =
        clamp(
          dx * 1.4,
          -85,
          85
        );


      enemy.x +=
        enemy.vx *
        dt;

    }

    else if (
      enemy.boss
    ) {

      enemy.vx =
        clamp(
          dx * 1.1,
          -110,
          110
        );


      enemy.x +=
        enemy.vx *
        dt;


      enemy.phase =
        enemy.hp /
        enemy.maxHP <
        .45
          ? 2
          : 1;
    }


    const range =
      enemy.boss
        ? 95
        : 58;


    if (
      distance < range &&
      enemy.attackCd <= 0
    ) {

      enemy.attackCd =
        enemy.boss
          ? (
              enemy.phase === 2
                ? .65
                : .9
            )
          : 1.15;


      hurtPlayer(
        enemy.damage,
        enemy.x
      );
    }
  }


  /* PET AUTO ATTACK */

  const pet =
    activePet();


  if (pet) {

    pet.attackCd =
      (
        pet.attackCd ||
        0
      )
      -
      dt;


    if (
      pet.attackCd <= 0
    ) {

      const targets =
        G.enemies
          .filter(
            enemy =>
              enemy.alive &&
              enemy.world ===
              G.worldId
          )
          .sort(
            (
              a,
              b
            ) =>
              Math.abs(
                a.x -
                P.x
              )
              -
              Math.abs(
                b.x -
                P.x
              )
          );


      const target =
        targets[0];


      if (
        target &&
        Math.abs(
          target.x -
          P.x
        )
        <
        360
      ) {

        const bonus =
          PET_BONUS[
            pet.name
          ]
          ||
          {};


        const damage =
          Math.round(
            8 +
            (
              bonus.atk ||
              5
            )
            *
            .45
            +
            pet.level *
            1.5
          );


        hurtEnemy(
          target,
          damage
        );


        pet.attackCd =
          1.25;


        burst(
          target.x,
          target.y - 30,
          '#b6f8ff',
          4
        );
      }
    }
  }
}
/* =========================================================
   PART 2 OF 3
   - World interaction system
   - Earth 2.0 story progression
   - Collectibles
   - Rift Credits pickups
   - Pet collection
   - Pet training
   - Inventory
   - Armor
   - Pet Journal
   - World map
   - HUD
   - Notifications
   - Particles
   - Saving / loading
   - Overlay system
========================================================= */


/* =========================================================
   QUEST UI
========================================================= */

function quest(
  title,
  text
) {

  const titleEl =
    $('questTitle');

  const textEl =
    $('questText');


  if (titleEl) {

    titleEl.textContent =
      title;
  }


  if (textEl) {

    textEl.textContent =
      text;
  }
}


/* =========================================================
   TOAST MESSAGE
========================================================= */

let toastTimer = null;


function toast(
  title,
  text,
  duration = 2600
) {

  const box =
    $('toast');


  if (!box) return;


  $('toastTitle').textContent =
    title;


  $('toastText').textContent =
    text;


  box.classList.remove(
    'hidden'
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        box.classList.add(
          'hidden'
        );

      },
      duration
    );
}


/* =========================================================
   FLOATING TEXT
========================================================= */

function floatingText(
  text,
  x,
  y,
  color = '#ffffff'
) {

  G.particles.push({

    type:
      'text',

    text,

    x,

    y,

    vx:
      rand(
        -8,
        8
      ),

    vy:
      -35,

    life:
      1,

    maxLife:
      1,

    color,

    size:
      15
  });
}


/* =========================================================
   PARTICLE BURST
========================================================= */

function burst(
  x,
  y,
  color,
  count = 8
) {

  for (
    let i = 0;
    i < count;
    i++
  ) {

    const angle =
      rand(
        0,
        Math.PI * 2
      );


    const speed =
      rand(
        40,
        190
      );


    G.particles.push({

      type:
        'spark',

      x,

      y,

      vx:
        Math.cos(angle) *
        speed,

      vy:
        Math.sin(angle) *
        speed,

      gravity:
        rand(
          60,
          220
        ),

      life:
        rand(
          .35,
          .8
        ),

      maxLife:
        .8,

      size:
        rand(
          2,
          7
        ),

      color
    });
  }
}


/* =========================================================
   RIFT PARTICLES
========================================================= */

function riftBurst(
  x,
  y,
  count = 14
) {

  const colors = [

    '#73eaff',

    '#9c75ff',

    '#ffffff',

    '#6751df'
  ];


  for (
    let i = 0;
    i < count;
    i++
  ) {

    const angle =
      rand(
        0,
        Math.PI * 2
      );


    const speed =
      rand(
        25,
        140
      );


    G.particles.push({

      type:
        'rift',

      x,

      y,

      vx:
        Math.cos(angle) *
        speed,

      vy:
        Math.sin(angle) *
        speed,

      life:
        rand(
          .5,
          1.1
        ),

      maxLife:
        1.1,

      size:
        rand(
          2,
          6
        ),

      color:
        colors[
          randi(
            0,
            colors.length - 1
          )
        ]
    });
  }
}


/* =========================================================
   PARTICLE UPDATE
========================================================= */

function updateParticles(dt) {

  for (
    const particle of
    G.particles
  ) {

    particle.life -=
      dt;


    particle.x +=
      particle.vx *
      dt;


    particle.y +=
      particle.vy *
      dt;


    if (
      particle.gravity
    ) {

      particle.vy +=
        particle.gravity *
        dt;
    }
  }


  G.particles =
    G.particles.filter(
      particle =>
        particle.life > 0
    );
}


/* =========================================================
   CREATE PHYSICAL RIFT CREDIT PICKUPS
========================================================= */

function spawnCreditDrops(
  x,
  y,
  amount
) {

  const number =
    clamp(
      Math.ceil(
        amount / 10
      ),
      1,
      10
    );


  let remaining =
    amount;


  for (
    let i = 0;
    i < number;
    i++
  ) {

    const value =
      i === number - 1
        ? remaining
        : Math.max(
            1,
            Math.floor(
              amount /
              number
            )
          );


    remaining -=
      value;


    G.pickups.push({

      kind:
        'credit',

      x:
        x +
        rand(
          -35,
          35
        ),

      y:
        y -
        rand(
          20,
          70
        ),

      baseY:
        y,

      vx:
        rand(
          -80,
          80
        ),

      vy:
        rand(
          -180,
          -80
        ),

      value,

      age:
        0,

      taken:
        false
    });
  }
}


/* =========================================================
   UPDATE PHYSICAL PICKUPS
========================================================= */

function updatePickups(dt) {

  for (
    const item of
    G.pickups
  ) {

    if (
      item.taken
    ) continue;


    if (
      item.kind ===
      'credit'
    ) {

      item.age +=
        dt;


      item.vy +=
        620 *
        dt;


      item.x +=
        item.vx *
        dt;


      item.y +=
        item.vy *
        dt;


      if (
        item.y >
        item.baseY
      ) {

        item.y =
          item.baseY;


        item.vy *=
          -.35;


        item.vx *=
          .75;
      }


      const distance =
        dist(
          item.x,
          item.y,
          P.x,
          P.y
        );


      if (
        distance < 150
      ) {

        const pull =
          clamp(
            1 -
            distance /
            150,
            0,
            1
          );


        item.x +=
          (
            P.x -
            item.x
          )
          *
          pull *
          dt *
          9;


        item.y +=
          (
            P.y -
            35 -
            item.y
          )
          *
          pull *
          dt *
          9;
      }


      if (
        distance < 32
      ) {

        item.taken =
          true;


        addCredits(
          item.value,
          item.x,
          item.y
        );
      }
    }
  }


  G.pickups =
    G.pickups.filter(
      item =>
        !item.taken ||
        item.kind !==
        'credit'
    );
}


/* =========================================================
   INTERACTION PROMPT
========================================================= */

let currentInteraction = null;


function setInteraction(
  text,
  action,
  distanceValue = 80
) {

  currentInteraction = {

    text,

    action,

    distance:
      distanceValue
  };


  const prompt =
    $('interactPrompt');


  const label =
    $('interactText');


  if (prompt) {

    prompt.classList.remove(
      'hidden'
    );
  }


  if (label) {

    label.textContent =
      text;
  }
}


function clearInteraction() {

  currentInteraction =
    null;


  const prompt =
    $('interactPrompt');


  if (prompt) {

    prompt.classList.add(
      'hidden'
    );
  }
}


/* =========================================================
   HANDLE INTERACTION BUTTON
========================================================= */

function handleInteraction() {

  if (
    !currentInteraction
  ) return;


  if (
    justPressed.has('e')
  ) {

    SFX.click();


    currentInteraction
      .action();
  }
}


/* =========================================================
   WORLD INTERACTIONS
========================================================= */

function updateInteractions() {

  clearInteraction();


  if (
    G.scene === 'hub'
  ) {

    updateHubInteractions();

    handleInteraction();

    return;
  }


  if (
    G.scene !== 'world'
  ) {

    return;
  }


  if (
    G.worldId === 'earth'
  ) {

    updateEarthInteractions();


    if (
      currentInteraction
    ) {

      handleInteraction();

      return;
    }
  }


  updatePickupInteractions();


  handleInteraction();
}


/* =========================================================
   GENERIC PICKUP INTERACTIONS
========================================================= */

function updatePickupInteractions() {

  let nearest =
    null;


  let nearestDistance =
    Infinity;


  for (
    const item of
    G.pickups
  ) {

    if (
      item.taken ||
      item.kind ===
      'credit'
    ) {

      continue;
    }


    const d =
      dist(
        P.x,
        P.y,
        item.x,
        item.y
      );


    if (
      d <
      nearestDistance
    ) {

      nearest =
        item;


      nearestDistance =
        d;
    }
  }


  if (
    !nearest ||
    nearestDistance > 100
  ) {

    return;
  }


  if (
    nearest.kind ===
    'fragment'
  ) {

    setInteraction(
      'COLLECT RIFT FRAGMENT',

      () =>
        collectFragment(
          nearest
        )
    );
  }


  else if (
    nearest.kind ===
    'pet'
  ) {

    setInteraction(
      'APPROACH ' +
      nearest.name.toUpperCase(),

      () =>
        collectPet(
          nearest
        )
    );
  }


  else if (
    nearest.kind ===
    'beacon'
  ) {

    setInteraction(
      'DESTROY WAR BEACON',

      () =>
        destroyBeacon(
          nearest
        )
    );
  }


  else if (
    nearest.kind ===
    'portal'
  ) {

    setInteraction(
      'RETURN TO THE HUB',

      () => {

        nearest.taken =
          true;


        riftBurst(
          P.x,
          P.y - 50,
          28
        );


        SFX.portal();


        beginHub();
      }
    );
  }
}


/* =========================================================
   COLLECT RIFT FRAGMENT
========================================================= */

function collectFragment(
  item
) {

  if (
    item.taken
  ) return;


  item.taken =
    true;


  const progress =
    G.progress[
      G.worldId
    ];


  progress.fragments =
    Math.min(
      5,
      progress.fragments + 1
    );


  riftBurst(
    item.x,
    item.y - 20,
    16
  );


  SFX.tone(
    400,
    .2,
    'triangle',
    .05,
    1.8
  );


  addCredits(
    35,
    item.x,
    item.y
  );


  toast(
    'RIFT FRAGMENT',
    progress.fragments +
    ' / 5 recovered.'
  );


  if (
    progress.fragments >= 5
  ) {

    if (
      G.worldId === 'war' &&
      progress.beacons < 3
    ) {

      quest(
        'WAR BEACONS',
        'Destroy all 3 War Beacons before confronting the War Machine.'
      );

    }

    else {

      quest(
        'BOSS SIGNAL',
        WORLDS[
          G.worldId
        ].boss +
        ' has appeared.'
      );


      const existingBoss =
        G.enemies.find(
          enemy =>
            enemy.alive &&
            enemy.world ===
            G.worldId &&
            enemy.boss
        );


      if (
        !existingBoss
      ) {

        spawnEnemy(
          G.worldId,

          WORLDS[
            G.worldId
          ].width -
          650,

          500,

          true
        );
      }
    }

  }

  else {

    quest(
      WORLDS[
        G.worldId
      ].mechanic,

      'Recover Rift Fragments. ' +
      progress.fragments +
      '/5'
    );
  }
}


/* =========================================================
   DESTROY WAR BEACON
========================================================= */

function destroyBeacon(
  beacon
) {

  if (
    beacon.taken
  ) return;


  beacon.taken =
    true;


  const progress =
    G.progress.war;


  progress.beacons =
    Math.min(
      3,
      progress.beacons + 1
    );


  G.screenShake =
    10;


  burst(
    beacon.x,
    beacon.y - 70,
    '#ff7b62',
    25
  );


  SFX.noise(
    .25,
    .1,
    700
  );


  addCredits(
    75,
    beacon.x,
    beacon.y
  );


  toast(
    'WAR BEACON DESTROYED',
    progress.beacons +
    ' / 3 disabled.'
  );


  if (
    progress.beacons >= 3 &&
    progress.fragments >= 5
  ) {

    const existingBoss =
      G.enemies.find(
        enemy =>
          enemy.alive &&
          enemy.world ===
          'war' &&
          enemy.boss
      );


    if (
      !existingBoss
    ) {

      spawnEnemy(
        'war',

        WORLDS.war.width -
        650,

        500,

        true
      );
    }


    quest(
      'WAR MACHINE',
      'The Titan Factory is exposed. Defeat the War Machine.'
    );

  }

  else {

    quest(
      'WAR BEACONS',
      'Destroy War Beacons. ' +
      progress.beacons +
      '/3'
    );
  }
}


/* =========================================================
   EARTH 2.0 STORY OBJECTS
========================================================= */

function earthStoryData() {

  const progress =
    G.progress.earth;


  if (
    !progress.collectedParts
  ) {

    progress.collectedParts =
      [];
  }


  return progress;
}


/* =========================================================
   EARTH INTERACTIONS
========================================================= */

function updateEarthInteractions() {

  const progress =
    earthStoryData();


  const stage =
    progress.storyStage;


  /* -----------------------------------------
     STAGE 0
     INSPECT CRASH
  ----------------------------------------- */

  if (
    stage === 0
  ) {

    const crashX =
      310;


    if (
      Math.abs(
        P.x -
        crashX
      )
      <
      115
    ) {

      setInteraction(
        'INSPECT CRASHED SHIP',

        () => {

          progress.storyStage =
            1;


          toast(
            'SHIP SYSTEM',
            'Main drive offline. Emergency weapon signal detected nearby.'
          );


          riftBurst(
            crashX,
            480,
            10
          );


          updateEarthQuest();
        }
      );
    }


    return;
  }


  /* -----------------------------------------
     STAGE 1
     FIND NOVA SWORD
  ----------------------------------------- */

  if (
    stage === 1
  ) {

    const swordX =
      950;


    if (
      Math.abs(
        P.x -
        swordX
      )
      <
      90
    ) {

      setInteraction(
        'TAKE NOVA SWORD',

        () => {

          P.weapon =
            'Nova Sword';


          P.weaponLevel =
            1;


          progress.storyStage =
            2;


          riftBurst(
            swordX,
            455,
            30
          );


          SFX.tone(
            220,
            .35,
            'sine',
            .08,
            2.5
          );


          toast(
            'NOVA SWORD ACQUIRED',
            'A Rift-forged energy blade. Attack with F.'
          );


          updateEarthQuest();

          syncHUD();
        }
      );
    }


    return;
  }


  /* -----------------------------------------
     STAGE 2
     FIND 3 SHIP COMPONENTS
  ----------------------------------------- */

  if (
    stage === 2
  ) {

    const parts = [

      {
        id:
          'drive',

        x:
          1480,

        name:
          'RIFT DRIVE COIL'
      },

      {
        id:
          'stabilizer',

        x:
          2350,

        name:
          'FLIGHT STABILIZER'
      },

      {
        id:
          'core',

        x:
          3250,

        name:
          'POWER CORE'
      }
    ];


    for (
      const part of parts
    ) {

      if (
        progress.collectedParts
          .includes(
            part.id
          )
      ) {

        continue;
      }


      if (
        Math.abs(
          P.x -
          part.x
        )
        <
        85
      ) {

        setInteraction(
          'RECOVER ' +
          part.name,

          () => {

            progress.collectedParts
              .push(
                part.id
              );


            progress.shipParts =
              progress
                .collectedParts
                .length;


            burst(
              part.x,
              470,
              '#72e6ff',
              14
            );


            SFX.tone(
              520,
              .12,
              'triangle',
              .05,
              1.5
            );


            addMaterial(
              'Ancient Metal',
              2
            );


            addCredits(
              40,
              part.x,
              500
            );


            toast(
              'SHIP COMPONENT',
              progress.shipParts +
              ' / 3 recovered.'
            );


            if (
              progress.shipParts >=
              3
            ) {

              progress.storyStage =
                3;
            }


            updateEarthQuest();
          }
        );


        return;
      }
    }


    return;
  }


  /* -----------------------------------------
     STAGE 3
     SIGNAL TOWER
  ----------------------------------------- */

  if (
    stage === 3
  ) {

    const towerX =
      3920;


    if (
      Math.abs(
        P.x -
        towerX
      )
      <
      120
    ) {

      setInteraction(
        'ACTIVATE SIGNAL TOWER',

        () => {

          progress.storyStage =
            4;


          G.screenShake =
            5;


          riftBurst(
            towerX,
            360,
            32
          );


          SFX.portal();


          toast(
            'UNKNOWN SIGNAL',
            'A structure beyond the ruins is responding.'
          );


          updateEarthQuest();
        }
      );
    }


    return;
  }


  /* -----------------------------------------
     STAGE 4
     ANCIENT GATE
  ----------------------------------------- */

  if (
    stage === 4
  ) {

    const gateX =
      4520;


    if (
      Math.abs(
        P.x -
        gateX
      )
      <
      120
    ) {

      setInteraction(
        'OPEN ANCIENT GATE',

        () => {

          progress.storyStage =
            5;


          riftBurst(
            gateX,
            430,
            40
          );


          G.screenShake =
            10;


          const existing =
            G.enemies.find(
              enemy =>
                enemy.alive &&
                enemy.world ===
                'earth' &&
                enemy.boss
            );


          if (
            !existing
          ) {

            spawnEnemy(
              'earth',

              4920,

              500,

              true
            );
          }


          toast(
            'ANCIENT GUARDIAN',
            'Something has awakened beyond the gate.'
          );


          updateEarthQuest();
        }
      );
    }


    return;
  }


  /* -----------------------------------------
     STAGE 5
     BOSS ACTIVE
  ----------------------------------------- */

  if (
    stage === 5
  ) {

    const bossAlive =
      G.enemies.some(
        enemy =>
          enemy.alive &&
          enemy.world ===
          'earth' &&
          enemy.boss
      );


    if (
      !bossAlive &&
      !progress.bossDefeated
    ) {

      spawnEnemy(
        'earth',

        4920,

        500,

        true
      );
    }


    return;
  }


  /* -----------------------------------------
     STAGE 6
     RETURN TO SHIP
  ----------------------------------------- */

  if (
    stage === 6
  ) {

    const crashX =
      310;


    if (
      Math.abs(
        P.x -
        crashX
      )
      <
      120
    ) {

      setInteraction(
        'REPAIR CRASHED SHIP',

        () => {

          progress.storyStage =
            7;


          addCredits(
            250,
            crashX,
            500
          );


          riftBurst(
            crashX,
            450,
            35
          );


          toast(
            'SHIP REPAIRED',
            'Navigation has locked onto the mysterious signal.'
          );


          updateEarthQuest();
        }
      );
    }


    return;
  }


  /* -----------------------------------------
     STAGE 7
     LAUNCH TO HUB
  ----------------------------------------- */

  if (
    stage >= 7
  ) {

    const crashX =
      310;


    if (
      Math.abs(
        P.x -
        crashX
      )
      <
      120
    ) {

      setInteraction(
        'LAUNCH SHIP',

        () => {

          G.scene =
            'hubFlight';


          G.sceneTime =
            0;


          SFX.portal();


          MUSIC.setWorld(
            'hub'
          );


          toast(
            'NAVIGATION',
            'Following unknown Rift signal...'
          );
        }
      );
    }
  }
}


/* =========================================================
   HUB INTERACTIONS
========================================================= */

function updateHubInteractions() {

  /* PET SANCTUARY */

  if (
    Math.abs(
      P.x -
      350
    )
    <
    100
  ) {

    setInteraction(
      'ENTER PET SANCTUARY',

      () => {

        openOverlay(
          'petsOverlay'
        );


        renderPets();
      }
    );


    return;
  }


  /* ARMOR WORKSHOP */

  if (
    Math.abs(
      P.x -
      620
    )
    <
    95
  ) {

    setInteraction(
      'OPEN ARMOR WORKSHOP',

      () => {

        openOverlay(
          'inventoryOverlay'
        );


        renderInventory();
      }
    );


    return;
  }


  /* RIFT MAP TERMINAL */

  if (
    Math.abs(
      P.x -
      980
    )
    <
    110
  ) {

    setInteraction(
      'OPEN WORLD MAP',

      () => {

        openOverlay(
          'mapOverlay'
        );


        renderWorldMap();
      }
    );


    return;
  }


  /* ASTRA NPC */

  if (
    Math.abs(
      P.x -
      760
    )
    <
    70
  ) {

    setInteraction(
      'TALK TO ASTRA',

      () => {

        if (
          G.cores === 0
        ) {

          toast(
            'ASTRA',
            'The Multiverse is breaking apart. Each world is holding a fragment of the Rift Core.'
          );

        }

        else if (
          G.cores <
          6
        ) {

          toast(
            'ASTRA',
            'You have recovered ' +
            G.cores +
            ' Core Shard' +
            (
              G.cores === 1
                ? ''
                : 's'
            ) +
            '. Keep going.'
          );

        }

        else if (
          !G.completed.has(
            'matrix'
          )
        ) {

          toast(
            'ASTRA',
            'The corrupted coordinates are stabilizing. Something is waiting beyond the Void.'
          );

        }

        else {

          toast(
            'ASTRA',
            'The Rift is stable again. But the Multiverse still has secrets left to find.'
          );
        }
      }
    );
  }
}


/* =========================================================
   PET COLLECTION
========================================================= */

function collectPet(
  pickup
) {

  if (
    pickup.taken
  ) return;


  pickup.taken =
    true;


  const name =
    pickup.name;


  if (
    !PET_STATE.owned[
      name
    ]
  ) {

    PET_STATE.owned[
      name
    ] = {

      name,

      world:
        G.worldId,

      level:
        1,

      xp:
        0,

      form:
        name,

      nickname:
        name,

      attackCd:
        0
    };
  }


  const progress =
    G.progress[
      G.worldId
    ];


  if (
    !progress.petFound
      .includes(
        name
      )
  ) {

    progress.petFound.push(
      name
    );
  }


  if (
    !PET_STATE.active
  ) {

    PET_STATE.active =
      name;
  }


  riftBurst(
    pickup.x,
    pickup.y - 35,
    22
  );


  SFX.pet();


  toast(
    'NEW PET DISCOVERED',
    name +
    ' joined your collection.'
  );


  floatingText(
    'PET FOUND',
    pickup.x,
    pickup.y - 80,
    '#bff7ff'
  );


  addCredits(
    50,
    pickup.x,
    pickup.y
  );


  syncHUD();
}


/* =========================================================
   PET TRAINING
========================================================= */

function trainActivePet() {

  const pet =
    activePet();


  if (!pet) {

    toast(
      'PET SANCTUARY',
      'Choose an active pet first.'
    );

    return;
  }


  const cost =
    300 +
    Math.max(
      0,
      pet.level - 1
    ) *
    75;


  if (
    !spendCredits(
      cost
    )
  ) {

    return;
  }


  pet.level++;


  SFX.pet();


  riftBurst(
    P.x,
    P.y - 50,
    18
  );


  toast(
    'PET TRAINING',
    pet.name +
    ' reached Level ' +
    pet.level +
    '.'
  );


  renderPets();

  syncHUD();
}


/* =========================================================
   EQUIP PET
========================================================= */

function equipPet(
  name
) {

  if (
    !PET_STATE.owned[
      name
    ]
  ) {

    return;
  }


  const oldStats =
    getStats();


  PET_STATE.active =
    name;


  const newStats =
    getStats();


  preserveHealthForStatChange(
    oldStats.maxHP,
    newStats.maxHP
  );


  SFX.pet();


  toast(
    'ACTIVE PET',
    name +
    ' will now travel with you.'
  );


  renderPets();

  syncHUD();
}


/* =========================================================
   BUY / EQUIP ARMOR
========================================================= */

function selectArmor(
  id
) {

  const armor =
    ARMORS[id];


  if (!armor) return;


  if (
    !armor.unlocked
  ) {

    if (
      !spendCredits(
        armor.price
      )
    ) {

      return;
    }


    armor.unlocked =
      true;


    toast(
      'ARMOR UNLOCKED',
      armor.name +
      ' has been added to your loadout.'
    );
  }


  const oldStats =
    getStats();


  P.armor =
    id;


  const newStats =
    getStats();


  preserveHealthForStatChange(
    oldStats.maxHP,
    newStats.maxHP
  );


  SFX.click();


  renderInventory();

  syncHUD();
}


/* =========================================================
   RENDER INVENTORY
========================================================= */

function renderInventory() {

  const armorGrid =
    $('armorGrid');


  const materialGrid =
    $('materialGrid');


  if (
    !armorGrid ||
    !materialGrid
  ) {

    return;
  }


  armorGrid.innerHTML =
    '';


  for (
    const [
      id,
      armor
    ]
    of
    Object.entries(
      ARMORS
    )
  ) {

    const card =
      document.createElement(
        'article'
      );


    card.className =
      'itemCard' +
      (
        P.armor === id
          ? ' selected'
          : ''
      );


    const status =
      armor.unlocked
        ? (
            P.armor === id
              ? 'EQUIPPED'
              : 'EQUIP'
          )
        : (
            'BUY · ' +
            armor.price.toLocaleString() +
            ' CREDITS'
          );


    card.innerHTML = `

      <div class="armorIcon"></div>

      <h4>
        ${armor.name}
      </h4>

      <p>
        HP ${signed(armor.hp)}
        · ATK ${signed(armor.atk)}
        · DEF ${signed(armor.def)}
        · SPD ${signed(armor.speed)}
      </p>

      <button
        data-armor="${id}"
        ${P.armor === id ? 'disabled' : ''}
      >
        ${status}
      </button>

    `;


    armorGrid.appendChild(
      card
    );
  }


  armorGrid
    .querySelectorAll(
      '[data-armor]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            selectArmor(
              button.dataset.armor
            );
          }
        );
      }
    );


  materialGrid.innerHTML =
    '';


  for (
    const material of
    MATERIALS
  ) {

    const card =
      document.createElement(
        'article'
      );


    card.className =
      'itemCard';


    card.innerHTML = `

      <div class="materialIcon"></div>

      <h4>
        ${material}
      </h4>

      <p>
        Owned:
        <strong>
          ${P.materials[material] || 0}
        </strong>
      </p>

    `;


    materialGrid.appendChild(
      card
    );
  }
}


/* =========================================================
   SIGNED NUMBER
========================================================= */

function signed(
  value
) {

  if (
    value > 0
  ) {

    return (
      '+' +
      value
    );
  }


  return String(
    value
  );
}


/* =========================================================
   RENDER PET SANCTUARY
========================================================= */

function renderPets() {

  renderPetCollection();

  renderPetJournal();

  renderPetTraining();
}


/* =========================================================
   PET COLLECTION PAGE
========================================================= */

function renderPetCollection() {

  const grid =
    $('petGrid');


  if (!grid) return;


  grid.innerHTML =
    '';


  const allPets =
    Object.values(
      PET_STATE.owned
    );


  if (
    allPets.length === 0
  ) {

    const empty =
      document.createElement(
        'article'
      );


    empty.className =
      'petCard';


    empty.innerHTML = `

      <h4>
        No pets discovered yet
      </h4>

      <p>
        Explore the worlds and approach wild pets to add them to your Sanctuary.
      </p>

    `;


    grid.appendChild(
      empty
    );


    return;
  }


  for (
    const pet of
    allPets
  ) {

    const card =
      document.createElement(
        'article'
      );


    card.className =
      'petCard' +
      (
        PET_STATE.active ===
        pet.name
          ? ' selected'
          : ''
      );


    const canvasId =
      'pet-art-' +
      safeId(
        pet.name
      );


    card.innerHTML = `

      <canvas
        class="petArt"
        id="${canvasId}"
        width="124"
        height="104"
      ></canvas>

      <h4>
        ${pet.nickname || pet.name}
      </h4>

      <p>
        ${PET_TYPES[pet.name] || 'Unknown'}
        <br>
        Level ${pet.level}
      </p>

      <button
        data-pet="${pet.name}"
        ${PET_STATE.active === pet.name ? 'disabled' : ''}
      >
        ${
          PET_STATE.active === pet.name
            ? 'ACTIVE'
            : 'SET ACTIVE'
        }
      </button>

    `;


    grid.appendChild(
      card
    );


    requestAnimationFrame(
      () => {

        const portrait =
          $(canvasId);


        if (portrait) {

          drawPetPortrait(
            portrait,
            pet.name
          );
        }
      }
    );
  }


  grid
    .querySelectorAll(
      '[data-pet]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            equipPet(
              button.dataset.pet
            );
          }
        );
      }
    );
}


/* =========================================================
   PET JOURNAL
========================================================= */

function renderPetJournal() {

  const summary =
    $('journalSummary');


  const grid =
    $('journalGrid');


  if (
    !summary ||
    !grid
  ) {

    return;
  }


  const found =
    Object.keys(
      PET_STATE.owned
    ).length;


  const total =
    WORLD_ORDER.length *
    8;


  const percent =
    Math.round(
      found /
      total *
      100
    );


  summary.textContent =
    'Base pets discovered: ' +
    found +
    ' / ' +
    total +
    ' · Overall discovery: ' +
    percent +
    '% · Evolution forms and secret forms will also appear here.';


  grid.innerHTML =
    '';


  for (
    const worldId of
    WORLD_ORDER
  ) {

    const section =
      document.createElement(
        'section'
      );


    section.className =
      'journalWorld';


    const hiddenMatrix =
      worldId === 'matrix' &&
      !G.completed.has(
        'void'
      );


    const title =
      hiddenMatrix
        ? '( ........ ...... )'
        : WORLDS[
            worldId
          ].name;


    section.innerHTML = `

      <h3>
        ${title}
      </h3>

      <div class="journalNames">

        ${
          PET_ROSTERS[
            worldId
          ]
          .map(
            name => {

              const foundPet =
                !!PET_STATE
                  .owned[
                    name
                  ];


              let display =
                name;


              if (
                hiddenMatrix &&
                !foundPet
              ) {

                display =
                  '???';
              }


              return `

                <span
                  class="${foundPet ? 'found' : ''}"
                >
                  ${
                    foundPet
                      ? display
                      : (
                          hiddenMatrix
                            ? '???'
                            : '???'
                        )
                  }
                </span>

              `;
            }
          )
          .join('')
        }

      </div>

    `;


    grid.appendChild(
      section
    );
  }
}


/* =========================================================
   PET TRAINING PAGE
========================================================= */

function renderPetTraining() {

  const pet =
    activePet();


  const nameEl =
    $('trainingName');


  const statsEl =
    $('trainingStats');


  const button =
    $('trainPetBtn');


  if (
    !nameEl ||
    !statsEl ||
    !button
  ) {

    return;
  }


  const trainingCanvas =
    $('trainingPet');


  if (!pet) {

    nameEl.textContent =
      'No active pet';


    statsEl.textContent =
      'Find and equip a pet first.';


    button.disabled =
      true;


    if (
      trainingCanvas
    ) {

      const c =
        trainingCanvas
          .getContext('2d');


      c.clearRect(
        0,
        0,
        trainingCanvas.width,
        trainingCanvas.height
      );
    }


    return;
  }


  button.disabled =
    false;


  const bonus =
    PET_BONUS[
      pet.name
    ] ||
    {};


  const cost =
    300 +
    Math.max(
      0,
      pet.level - 1
    ) *
    75;


  nameEl.textContent =
    pet.name +
    ' · LV ' +
    pet.level;


  statsEl.textContent =
    (
      PET_TYPES[
        pet.name
      ] ||
      'Unknown'
    )
    +
    ' · HP ' +
    signed(
      bonus.hp ||
      0
    )
    +
    ' · ATK ' +
    signed(
      bonus.atk ||
      0
    )
    +
    ' · DEF ' +
    signed(
      bonus.def ||
      0
    )
    +
    ' · SPD ' +
    signed(
      bonus.speed ||
      0
    );


  button.textContent =
    'TRAIN PET · ' +
    cost.toLocaleString() +
    ' CREDITS';


  if (
    trainingCanvas
  ) {

    drawPetPortrait(
      trainingCanvas,
      pet.name,
      true
    );
  }
}


/* =========================================================
   SAFE DOM ID
========================================================= */

function safeId(
  text
) {

  return text
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      '-'
    );
}


/* =========================================================
   PET TABS
========================================================= */

document
  .querySelectorAll(
    '[data-pet-tab]'
  )
  .forEach(
    button => {

      button.addEventListener(
        'click',
        () => {

          SFX.click();


          document
            .querySelectorAll(
              '[data-pet-tab]'
            )
            .forEach(
              tab =>
                tab.classList.remove(
                  'active'
                )
            );


          document
            .querySelectorAll(
              '.petPage'
            )
            .forEach(
              page =>
                page.classList.remove(
                  'active'
                )
            );


          button.classList.add(
            'active'
          );


          const tab =
            button.dataset.petTab;


          const page = {

            collection:
              $('petCollection'),

            journal:
              $('petJournal'),

            training:
              $('petTraining')

          }[tab];


          if (page) {

            page.classList.add(
              'active'
            );
          }
        }
      );
    }
  );


/* =========================================================
   TRAIN PET BUTTON
========================================================= */

if (
  $('trainPetBtn')
) {

  $('trainPetBtn')
    .addEventListener(
      'click',
      trainActivePet
    );
}


/* =========================================================
   WORLD MAP
========================================================= */

function renderWorldMap() {

  const grid =
    $('worldGrid');


  if (!grid) return;


  grid.innerHTML =
    '';


  for (
    const id of
    WORLD_ORDER
  ) {

    const world =
      WORLDS[id];


    const unlocked =
      G.unlocked.has(
        id
      );


    const completed =
      G.completed.has(
        id
      );


    const matrixHidden =
      id === 'matrix' &&
      !G.completed.has(
        'void'
      );


    const card =
      document.createElement(
        'article'
      );


    card.className =
      'worldCard' +
      (
        !unlocked
          ? ' locked'
          : ''
      )
      +
      (
        completed
          ? ' completed'
          : ''
      );


    const displayName =
      matrixHidden
        ? '( ........ ...... )'
        : world.name;


    const description =
      matrixHidden
        ? 'Coordinates corrupted.'
        : world.desc;


    const buttonText =
      completed
        ? 'RETURN'
        : (
            unlocked
              ? 'TRAVEL'
              : 'LOCKED'
          );


    card.innerHTML = `

      <div
        class="worldOrb"
        style="
          background:
          radial-gradient(
            circle at 30% 25%,
            ${world.accent},
            ${world.ground} 45%,
            ${world.dark}
          );
        "
      ></div>

      <h4>
        ${displayName}
      </h4>

      <p>
        ${description}
      </p>

      <button
        data-world="${id}"
        ${!unlocked ? 'disabled' : ''}
      >
        ${buttonText}
      </button>

    `;


    grid.appendChild(
      card
    );
  }


  grid
    .querySelectorAll(
      '[data-world]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            const id =
              button.dataset.world;


            if (
              G.unlocked.has(id)
            ) {

              travelTo(
                id
              );
            }
          }
        );
      }
    );
}


/* =========================================================
   MATRIX UNLOCK CHECK
========================================================= */

function checkMatrixUnlock() {

  if (
    G.completed.has(
      'void'
    )
    &&
    G.cores >= 6
  ) {

    if (
      !G.unlocked.has(
        'matrix'
      )
    ) {

      G.unlocked.add(
        'matrix'
      );


      toast(
        'CORRUPTED COORDINATES FOUND',
        'A hidden world has appeared on the Rift Network.'
      );


      SFX.portal();
    }
  }
}


/* =========================================================
   OVERLAY SYSTEM
========================================================= */

const OVERLAY_IDS = [

  'inventoryOverlay',

  'petsOverlay',

  'mapOverlay',

  'bonusOverlay',

  'pauseOverlay'
];


function isOverlayOpen() {

  return OVERLAY_IDS
    .some(
      id => {

        const element =
          $(id);


        return (
          element &&
          !element.classList
            .contains(
              'hidden'
            )
        );
      }
    );
}


function openOverlay(
  id
) {

  const overlay =
    $(id);


  if (!overlay) return;


  if (
    id !== 'pauseOverlay'
  ) {

    for (
      const otherId of
      OVERLAY_IDS
    ) {

      if (
        otherId === id ||
        otherId ===
        'pauseOverlay'
      ) {

        continue;
      }


      const other =
        $(otherId);


      if (other) {

        other.classList.add(
          'hidden'
        );
      }
    }
  }


  overlay.classList.remove(
    'hidden'
  );


  SFX.click();
}


function closeOverlay(
  id
) {

  const overlay =
    $(id);


  if (!overlay) return;


  overlay.classList.add(
    'hidden'
  );


  SFX.click();
}


function closeAllOverlays() {

  for (
    const id of
    OVERLAY_IDS
  ) {

    const overlay =
      $(id);


    if (overlay) {

      overlay.classList.add(
        'hidden'
      );
    }
  }
}


function toggleOverlay(
  id,
  renderFunction
) {

  if (
    G.scene === 'menu' &&
    id !== 'bonusOverlay'
  ) {

    return;
  }


  const overlay =
    $(id);


  if (!overlay) return;


  const opening =
    overlay.classList
      .contains(
        'hidden'
      );


  if (opening) {

    closeAllOverlays();


    overlay.classList.remove(
      'hidden'
    );


    if (
      renderFunction
    ) {

      renderFunction();
    }


    SFX.click();

  }

  else {

    overlay.classList.add(
      'hidden'
    );


    SFX.click();
  }
}


/* =========================================================
   GENERIC CLOSE BUTTONS
========================================================= */

document
  .querySelectorAll(
    '[data-close]'
  )
  .forEach(
    button => {

      button.addEventListener(
        'click',
        () => {

          closeOverlay(
            button.dataset.close
          );
        }
      );
    }
  );


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

  if (
    G.scene === 'menu'
  ) {

    return;
  }


  if (
    !$('pauseOverlay')
  ) {

    return;
  }


  if (
    !$('pauseOverlay')
      .classList
      .contains(
        'hidden'
      )
  ) {

    G.paused =
      false;


    closeOverlay(
      'pauseOverlay'
    );


    return;
  }


  closeAllOverlays();


  G.paused =
    true;


  openOverlay(
    'pauseOverlay'
  );
}


/* =========================================================
   PAUSE BUTTONS
========================================================= */

if (
  $('resumeBtn')
) {

  $('resumeBtn')
    .addEventListener(
      'click',
      () => {

        G.paused =
          false;


        closeOverlay(
          'pauseOverlay'
        );
      }
    );
}


if (
  $('saveBtn')
) {

  $('saveBtn')
    .addEventListener(
      'click',
      () => {

        saveGame();

        $('saveStatus')
          .textContent =
          'Game saved.';
      }
    );
}


if (
  $('pauseLoadBtn')
) {

  $('pauseLoadBtn')
    .addEventListener(
      'click',
      () => {

        if (
          loadGame()
        ) {

          G.paused =
            false;


          closeAllOverlays();
        }
      }
    );
}


if (
  $('quitBtn')
) {

  $('quitBtn')
    .addEventListener(
      'click',
      () => {

        saveGame();

        G.paused =
          false;


        G.scene =
          'menu';


        closeAllOverlays();


        $('hud')
          .classList
          .add(
            'hidden'
          );


        $('arenaHud')
          .classList
          .add(
            'hidden'
          );


        $('startScreen')
          .classList
          .remove(
            'hidden'
          );


        MUSIC.setWorld(
          'hub'
        );
      }
    );
}


/* =========================================================
   HUD
========================================================= */

function syncHUD() {

  const stats =
    getStats();


  P.hp =
    clamp(
      P.hp,
      0,
      stats.maxHP
    );


  if (
    $('levelText')
  ) {

    $('levelText')
      .textContent =
      P.level;
  }


  if (
    $('hpText')
  ) {

    $('hpText')
      .textContent =
      Math.round(
        P.hp
      )
      +
      ' / ' +
      stats.maxHP;
  }


  const hpFill =
    $('hpFill');


  if (hpFill) {

    const ratio =
      clamp(
        P.hp /
        stats.maxHP,
        0,
        1
      );


    hpFill.style.width =
      ratio *
      100 +
      '%';


    hpFill.classList.remove(
      'warning',
      'critical'
    );


    if (
      ratio <= .25
    ) {

      hpFill.classList.add(
        'critical'
      );

    }

    else if (
      ratio <= .5
    ) {

      hpFill.classList.add(
        'warning'
      );
    }
  }


  if (
    $('armorText')
  ) {

    $('armorText')
      .textContent =
      (
        ARMORS[
          P.armor
        ] ||
        ARMORS.none
      )
      .name
      .toUpperCase();
  }


  if (
    $('atkText')
  ) {

    $('atkText')
      .textContent =
      stats.atk;
  }


  if (
    $('defText')
  ) {

    $('defText')
      .textContent =
      stats.def;
  }


  if (
    $('spdText')
  ) {

    $('spdText')
      .textContent =
      stats.speed;
  }


  if (
    $('creditText')
  ) {

    $('creditText')
      .textContent =
      P.credits
        .toLocaleString();
  }


  if (
    $('coreText')
  ) {

    $('coreText')
      .textContent =
      G.cores;
  }


  if (
    $('weaponText')
  ) {

    $('weaponText')
      .textContent =
      P.weapon
        ? (
            P.weapon +
            ' LV.' +
            P.weaponLevel
          )
        : 'FISTS';
  }


  if (
    $('petText')
  ) {

    $('petText')
      .textContent =
      PET_STATE.active ||
      'NO PET';
  }


  if (
    $('locationText')
  ) {

    let location =
      'UNKNOWN';


    if (
      G.scene === 'hub'
    ) {

      location =
        'THE HUB';

    }

    else if (
      G.scene === 'arena'
    ) {

      location =
        'RIFT ARENA';

    }

    else if (
      G.worldId &&
      WORLDS[
        G.worldId
      ]
    ) {

      location =
        WORLDS[
          G.worldId
        ].name;
    }


    $('locationText')
      .textContent =
      location.toUpperCase();
  }


  const cooldownFill =
    $('cooldownFill');


  const cooldownText =
    $('cooldownText');


  if (
    cooldownFill
  ) {

    const max =
      Math.max(
        .01,
        stats.cooldown
      );


    const ready =
      clamp(
        1 -
        P.attackCooldown /
        max,
        0,
        1
      );


    cooldownFill
      .style
      .width =
      ready *
      100 +
      '%';
  }


  if (
    cooldownText
  ) {

    cooldownText.textContent =
      P.attackCooldown <= 0
        ? 'READY'
        : (
            P.attackCooldown
              .toFixed(2) +
            's'
          );
  }
}


/* =========================================================
   SAVE GAME
========================================================= */

const SAVE_KEY =
  'multiverse_riftwalker_v4';


function saveGame() {

  try {

    const data = {

      version:
        4,

      player: {

        x:
          P.x,

        y:
          P.y,

        level:
          P.level,

        xp:
          P.xp,

        hp:
          P.hp,

        weapon:
          P.weapon,

        weaponLevel:
          P.weaponLevel,

        armor:
          P.armor,

        credits:
          P.credits,

        materials:
          P.materials
      },


      game: {

        scene:
          G.scene,

        worldId:
          G.worldId,

        hubFound:
          G.hubFound,

        unlocked:
          [
            ...G.unlocked
          ],

        completed:
          [
            ...G.completed
          ],

        cores:
          G.cores,

        progress:
          G.progress
      },


      pets: {

        owned:
          PET_STATE.owned,

        active:
          PET_STATE.active
      },


      armors:
        Object.fromEntries(
          Object.entries(
            ARMORS
          )
          .map(
            (
              [
                id,
                armor
              ]
            ) => [

              id,

              !!armor.unlocked
            ]
          )
        )
    };


    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(
        data
      )
    );


    return true;

  }

  catch (
    error
  ) {

    console.error(
      'Save failed:',
      error
    );


    toast(
      'SAVE ERROR',
      'The game could not be saved.'
    );


    return false;
  }
}


/* =========================================================
   LOAD GAME
========================================================= */

function loadGame() {

  let data;


  try {

    const raw =
      localStorage.getItem(
        SAVE_KEY
      );


    if (!raw) {

      toast(
        'NO SAVE FOUND',
        'Start a New Game first.'
      );


      return false;
    }


    data =
      JSON.parse(
        raw
      );

  }

  catch (
    error
  ) {

    console.error(
      'Load failed:',
      error
    );


    toast(
      'LOAD ERROR',
      'The save file could not be read.'
    );


    return false;
  }


  SFX.resume();

  MUSIC.start();


  const player =
    data.player ||
    {};


  const game =
    data.game ||
    {};


  const pets =
    data.pets ||
    {};


  P.level =
    player.level ??
    1;


  P.xp =
    player.xp ??
    0;


  P.weapon =
    player.weapon ??
    null;


  P.weaponLevel =
    player.weaponLevel ??
    1;


  P.armor =
    player.armor ??
    'none';


  /*
     Save migration:
     Older builds may have "coins".
  */

  P.credits =
    player.credits ??
    player.coins ??
    250;


  P.materials = {

    ...Object.fromEntries(
      MATERIALS.map(
        material => [
          material,
          0
        ]
      )
    ),

    ...(
      player.materials ||
      {}
    )
  };


  G.hubFound =
    game.hubFound ??
    false;


  G.unlocked =
    new Set(
      game.unlocked ||
      [
        'earth'
      ]
    );


  G.completed =
    new Set(
      game.completed ||
      []
    );


  G.cores =
    game.cores ??
    0;


  G.progress =
    game.progress ||
    {};


  for (
    const id of
    WORLD_ORDER
  ) {

    G.progress[id] = {

      fragments:
        0,

      bossDefeated:
        false,

      petFound:
        [],

      beacons:
        0,

      storyStage:
        0,

      shipParts:
        0,

      ...(
        G.progress[id] ||
        {}
      )
    };
  }


  PET_STATE.owned =
    pets.owned ||
    {};


  PET_STATE.active =
    pets.active ||
    null;


  if (
    data.armors
  ) {

    for (
      const [
        id,
        unlocked
      ]
      of
      Object.entries(
        data.armors
      )
    ) {

      if (
        ARMORS[id]
      ) {

        ARMORS[id]
          .unlocked =
          !!unlocked;
      }
    }
  }


  ARMORS.none.unlocked =
    true;


  const savedScene =
    game.scene;


  const savedWorld =
    game.worldId;


  if (
    savedScene === 'hub' ||
    (
      !savedWorld &&
      G.hubFound
    )
  ) {

    beginHub();

  }

  else if (
    savedWorld &&
    WORLDS[
      savedWorld
    ]
  ) {

    beginWorld(
      savedWorld
    );

  }

  else {

    beginWorld(
      'earth'
    );
  }


  P.x =
    player.x ??
    P.x;


  P.y =
    player.y ??
    P.y;


  const stats =
    getStats();


  P.hp =
    clamp(
      player.hp ??
      stats.maxHP,

      1,

      stats.maxHP
    );


  $('startScreen')
    .classList
    .add(
      'hidden'
    );


  $('hud')
    .classList
    .remove(
      'hidden'
    );


  closeAllOverlays();


  checkMatrixUnlock();

  syncHUD();


  toast(
    'SAVE LOADED',
    'Welcome back, Riftwalker.'
  );


  return true;
}


/* =========================================================
   AUTOSAVE
========================================================= */

let autosaveTimer =
  0;


function updateAutosave(
  dt
) {

  if (
    G.scene === 'menu' ||
    G.scene === 'flight' ||
    G.scene === 'hubFlight' ||
    G.scene === 'arena'
  ) {

    return;
  }


  autosaveTimer +=
    dt;


  if (
    autosaveTimer >=
    30
  ) {

    autosaveTimer =
      0;


    saveGame();
  }
}


/* =========================================================
   LEVEL / XP
========================================================= */

function addXP(
  amount
) {

  P.xp +=
    amount;


  let required =
    xpRequired(
      P.level
    );


  while (
    P.xp >=
    required
  ) {

    P.xp -=
      required;


    const oldStats =
      getStats();


    P.level++;


    const newStats =
      getStats();


    P.hp +=
      newStats.maxHP -
      oldStats.maxHP;


    P.hp =
      clamp(
        P.hp,
        1,
        newStats.maxHP
      );


    toast(
      'LEVEL UP',
      'Riftwalker reached Level ' +
      P.level +
      '.'
    );


    riftBurst(
      P.x,
      P.y - 55,
      30
    );


    SFX.tone(
      330,
      .3,
      'triangle',
      .06,
      2
    );


    required =
      xpRequired(
        P.level
      );
  }


  syncHUD();
}


function xpRequired(
  level
) {

  return (
    100 +
    (
      level - 1
    ) *
    65
  );
}


/* =========================================================
   HEALTH REGEN FROM CRYSTAL FAWN
========================================================= */

function updatePetPassive(
  dt
) {

  const pet =
    activePet();


  if (!pet) return;


  const stats =
    getStats();


  if (
    pet.name ===
    'Crystal Fawn'
  ) {

    const danger =
      G.enemies.some(
        enemy =>
          enemy.alive &&
          enemy.world ===
          G.worldId &&
          Math.abs(
            enemy.x -
            P.x
          )
          <
          450
      );


    if (
      !danger &&
      P.hp <
      stats.maxHP
    ) {

      P.hp =
        Math.min(
          stats.maxHP,
          P.hp +
          5 *
          dt
        );
    }
  }


  if (
    pet.name ===
    'Medic Bot'
  ) {

    pet.healTimer =
      (
        pet.healTimer ||
        0
      )
      -
      dt;


    if (
      pet.healTimer <= 0 &&
      P.hp <
      stats.maxHP *
      .55
    ) {

      P.hp =
        Math.min(
          stats.maxHP,
          P.hp + 45
        );


      pet.healTimer =
        14;


      floatingText(
        '+45 HP',
        P.x,
        P.y - 100,
        '#78f1b0'
      );


      burst(
        P.x,
        P.y - 50,
        '#78f1b0',
        8
      );
    }
  }
}


/* =========================================================
   SCREEN EFFECT UPDATE
========================================================= */

function updateScreenEffects(
  dt
) {

  G.screenShake =
    Math.max(
      0,
      G.screenShake -
      dt *
      35
    );


  G.flash =
    Math.max(
      0,
      G.flash -
      dt
    );
}


/* =========================================================
   CAMERA
========================================================= */

function updateCamera(
  dt
) {

  let worldWidth =
    1280;


  if (
    G.scene === 'world' &&
    G.worldId
  ) {

    worldWidth =
      WORLDS[
        G.worldId
      ].width;

  }

  else if (
    G.scene === 'hub'
  ) {

    worldWidth =
      1500;
  }


  const target =
    clamp(
      P.x -
      W *
      .5,

      0,

      Math.max(
        0,
        worldWidth -
        W
      )
    );


  G.camera =
    lerp(
      G.camera,
      target,
      Math.min(
        1,
        dt * 5
      )
    );
}


/* =========================================================
   MAIN WORLD UPDATE
   Drawing is in Part 3.
========================================================= */

function updateWorld(
  dt
) {

  const world =
    WORLDS[
      G.worldId
    ];


  if (!world) return;


  updatePlayer(
    dt,
    world.width
  );


  updateEnemies(
    dt
  );


  updatePickups(
    dt
  );


  updatePetPassive(
    dt
  );


  updateInteractions();


  updateCamera(
    dt
  );


  updateParticles(
    dt
  );


  updateScreenEffects(
    dt
  );


  updateAutosave(
    dt
  );


  checkMatrixUnlock();


  syncHUD();
}


/* =========================================================
   HUB UPDATE
========================================================= */

function updateHub(
  dt
) {

  updatePlayer(
    dt,
    1500
  );


  updatePetPassive(
    dt
  );


  updateInteractions();


  updateCamera(
    dt
  );


  updateParticles(
    dt
  );


  updateScreenEffects(
    dt
  );


  updateAutosave(
    dt
  );


  checkMatrixUnlock();


  syncHUD();
}


/* =========================================================
   TRAVEL UPDATE
========================================================= */

function updateTravel(
  dt
) {

  G.sceneTime +=
    dt;


  updateParticles(
    dt
  );


  if (
    G.sceneTime >
    .35 &&
    Math.random() <
    .25
  ) {

    G.particles.push({

      type:
        'rift',

      x:
        rand(
          0,
          W
        ),

      y:
        rand(
          0,
          H
        ),

      vx:
        rand(
          -40,
          40
        ),

      vy:
        rand(
          150,
          420
        ),

      life:
        rand(
          .4,
          .9
        ),

      maxLife:
        .9,

      size:
        rand(
          2,
          7
        ),

      color:
        Math.random() >
        .5
          ? '#72e6ff'
          : '#9b72ff'
    });
  }


  if (
    G.sceneTime >
    1.65
  ) {

    beginWorld(
      G.travelTarget
    );
  }
}


/* =========================================================
   OPENING FLIGHT UPDATE
========================================================= */

function updateOpeningFlight(
  dt
) {

  G.sceneTime +=
    dt;


  if (
    Math.random() <
    .25
  ) {

    G.particles.push({

      type:
        'star',

      x:
        W +
        20,

      y:
        rand(
          20,
          H - 20
        ),

      vx:
        rand(
          -700,
          -280
        ),

      vy:
        0,

      life:
        2.5,

      maxLife:
        2.5,

      size:
        rand(
          1,
          4
        ),

      color:
        '#ffffff'
    });
  }


  updateParticles(
    dt
  );


  if (
    G.sceneTime >
    2.2 &&
    G.sceneTime <
    2.3
  ) {

    SFX.tone(
      180,
      .3,
      'square',
      .05,
      .6
    );
  }


  if (
    G.sceneTime >
    4.8
  ) {

    G.scene =
      'crash';


    G.sceneTime =
      0;


    G.screenShake =
      18;


    SFX.noise(
      .45,
      .14,
      650
    );
  }
}


/* =========================================================
   CRASH UPDATE
========================================================= */

function updateCrash(
  dt
) {

  G.sceneTime +=
    dt;


  updateParticles(
    dt
  );


  G.screenShake =
    Math.max(
      0,
      G.screenShake -
      dt *
      20
    );


  if (
    G.sceneTime >
    1.6
  ) {

    beginWorld(
      'earth'
    );


    G.progress.earth
      .storyStage =
      0;


    updateEarthQuest();


    toast(
      'EARTH 2.0',
      'Ship systems offline. Find a way to survive.'
    );
  }
}


/* =========================================================
   HUB DISCOVERY FLIGHT
========================================================= */

function updateHubFlight(
  dt
) {

  G.sceneTime +=
    dt;


  if (
    Math.random() <
    .22
  ) {

    G.particles.push({

      type:
        'rift',

      x:
        rand(
          0,
          W
        ),

      y:
        rand(
          0,
          H
        ),

      vx:
        rand(
          -100,
          100
        ),

      vy:
        rand(
          180,
          420
        ),

      life:
        .8,

      maxLife:
        .8,

      size:
        rand(
          2,
          8
        ),

      color:
        Math.random() >
        .5
          ? '#7eeeff'
          : '#b096ff'
    });
  }


  updateParticles(
    dt
  );


  if (
    G.sceneTime >
    2.8
  ) {

    beginHub();


    toast(
      'THE HUB DISCOVERED',
      'A safe place between worlds.'
    );


    saveGame();
  }
}


/* =========================================================
   UPDATE ACTIVE PET FOLLOW POSITION
========================================================= */

function updatePetFollower(
  dt
) {

  const pet =
    activePet();


  if (!pet) return;


  if (
    pet.fx === undefined
  ) {

    pet.fx =
      P.x -
      P.facing *
      70;


    pet.fy =
      P.y -
      25;
  }


  const targetX =
    P.x -
    P.facing *
    72;


  const targetY =
    P.y -
    26 +
    Math.sin(
      G.time *
      4
    ) *
    4;


  pet.fx =
    lerp(
      pet.fx,
      targetX,
      Math.min(
        1,
        dt * 5
      )
    );


  pet.fy =
    lerp(
      pet.fy,
      targetY,
      Math.min(
        1,
        dt * 5
      )
    );
}


/* =========================================================
   PART 2 COMPLETE

   PART 3 WILL CONTINUE DIRECTLY FROM HERE WITH:

   - full 2.5D shading system
   - animated Riftwalker renderer
   - scarf animation
   - armor visibly changing the player
   - Nova Sword glow
   - 3-hit sword animations
   - custom pet drawings
   - enemy drawings
   - bosses
   - Earth scenery
   - Music Verse scenery
   - Money Village scenery
   - Cosmos scenery
   - War Zone scenery
   - Void scenery
   - Perfect Matrix scenery
   - foreground occlusion
   - Hub rendering
   - opening cinematic rendering
   - Rift travel animation
   - Bonus Mode
   - Practice Bot
   - private invite-link multiplayer
   - arena animations
   - main game loop
========================================================= */
/* =========================================================
   PART 3 OF 3
   Drawing, Bonus Mode and main loop
========================================================= */


/* =========================================================
   DRAWING HELPERS
========================================================= */

function rr(
  c,
  x,
  y,
  w,
  h,
  r,
  fill,
  stroke,
  lw = 2
) {

  c.beginPath();

  c.roundRect(
    x,
    y,
    w,
    h,
    r
  );


  if (fill) {

    c.fillStyle =
      fill;

    c.fill();
  }


  if (stroke) {

    c.strokeStyle =
      stroke;

    c.lineWidth =
      lw;

    c.stroke();
  }
}


function ellipse(
  c,
  x,
  y,
  rx,
  ry,
  fill,
  stroke,
  lw = 2
) {

  c.beginPath();

  c.ellipse(
    x,
    y,
    rx,
    ry,
    0,
    0,
    Math.PI * 2
  );


  if (fill) {

    c.fillStyle =
      fill;

    c.fill();
  }


  if (stroke) {

    c.strokeStyle =
      stroke;

    c.lineWidth =
      lw;

    c.stroke();
  }
}


/* =========================================================
   CONTACT SHADOW
========================================================= */

function contactShadow(
  x,
  y,
  w = 60,
  h = 15,
  alpha = .3
) {

  ctx.save();

  ctx.translate(
    x,
    y
  );


  ctx.scale(
    1,
    h / w
  );


  const g =
    ctx.createRadialGradient(
      0,
      0,
      1,
      0,
      0,
      w / 2
    );


  g.addColorStop(
    0,
    `rgba(3,8,18,${alpha})`
  );


  g.addColorStop(
    1,
    'rgba(3,8,18,0)'
  );


  ctx.fillStyle =
    g;


  ctx.beginPath();

  ctx.arc(
    0,
    0,
    w / 2,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.restore();
}


/* =========================================================
   SPACE BACKGROUND
========================================================= */

function drawSpace(
  offset = 0
) {

  ctx.fillStyle =
    '#02050d';


  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  for (
    let i = 0;
    i < 145;
    i++
  ) {

    const depth =
      .05 +
      (
        i % 5
      ) *
      .025;


    const x =
      (
        (
          i *
          89.7
        )
        -
        offset *
        depth
        +
        W *
        5
      )
      %
      W;


    const y =
      (
        i *
        47.2
      )
      %
      H;


    ctx.globalAlpha =
      .3 +
      (
        i % 5
      )
      *
      .12;


    ctx.fillStyle =
      i % 13 === 0
        ? '#74e9ff'
        : '#ffffff';


    ctx.beginPath();

    ctx.arc(
      x,
      y,
      i % 17 === 0
        ? 2
        : 1,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }


  ctx.globalAlpha =
    1;
}


/* =========================================================
   PLANET
========================================================= */

function drawPlanet(
  x,
  y,
  r,
  light,
  mid
) {

  const g =
    ctx.createRadialGradient(
      x -
      r *
      .35,

      y -
      r *
      .38,

      4,

      x,
      y,
      r
    );


  g.addColorStop(
    0,
    light
  );


  g.addColorStop(
    .5,
    mid
  );


  g.addColorStop(
    1,
    '#071020'
  );


  ctx.fillStyle =
    g;


  ctx.beginPath();

  ctx.arc(
    x,
    y,
    r,
    0,
    Math.PI * 2
  );

  ctx.fill();
}


/* =========================================================
   SPACESHIP
========================================================= */

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


  ctx.rotate(
    rotation
  );


  ctx.scale(
    scale,
    scale
  );


  ctx.shadowColor =
    'rgba(94,229,255,.35)';


  ctx.shadowBlur =
    22;


  const body =
    ctx.createLinearGradient(
      -95,
      -40,
      110,
      42
    );


  body.addColorStop(
    0,
    '#ffffff'
  );


  body.addColorStop(
    .5,
    '#aebbd0'
  );


  body.addColorStop(
    1,
    '#53667f'
  );


  ctx.fillStyle =
    body;


  ctx.strokeStyle =
    '#18263a';


  ctx.lineWidth =
    5;


  ctx.beginPath();

  ctx.moveTo(
    -100,
    0
  );


  ctx.lineTo(
    18,
    -43
  );


  ctx.quadraticCurveTo(
    92,
    -30,
    118,
    0
  );


  ctx.quadraticCurveTo(
    92,
    30,
    18,
    43
  );


  ctx.closePath();

  ctx.fill();

  ctx.stroke();


  rr(
    ctx,
    -96,
    -15,
    60,
    30,
    8,
    '#d94057',
    '#18263a',
    4
  );


  ellipse(
    ctx,
    31,
    -5,
    40,
    25,
    '#6de5ff',
    '#18263a',
    4
  );


  ctx.shadowBlur =
    0;


  ctx.fillStyle =
    '#77efff';


  ctx.beginPath();

  ctx.moveTo(
    -99,
    -12
  );


  ctx.lineTo(
    -145,
    0
  );


  ctx.lineTo(
    -99,
    12
  );


  ctx.closePath();

  ctx.fill();


  ctx.restore();
}


/* =========================================================
   HUD ART
========================================================= */

function drawHudIcons() {

  const avatar =
    $('hudAvatar');


  if (avatar) {

    const c =
      avatar.getContext(
        '2d'
      );


    c.clearRect(
      0,
      0,
      avatar.width,
      avatar.height
    );


    drawMiniRiftwalker(
      c,
      avatar.width / 2,
      avatar.height - 2,
      .3
    );
  }


  const coin =
    $('creditIcon');


  if (coin) {

    const c =
      coin.getContext(
        '2d'
      );


    c.clearRect(
      0,
      0,
      coin.width,
      coin.height
    );


    const g =
      c.createRadialGradient(
        11,
        8,
        2,
        17,
        17,
        16
      );


    g.addColorStop(
      0,
      '#e8fdff'
    );


    g.addColorStop(
      .45,
      '#66e5ff'
    );


    g.addColorStop(
      1,
      '#5a43c8'
    );


    c.fillStyle =
      g;


    c.strokeStyle =
      '#18233a';


    c.lineWidth =
      3;


    c.beginPath();

    c.arc(
      17,
      17,
      14,
      0,
      Math.PI * 2
    );

    c.fill();

    c.stroke();


    c.save();

    c.translate(
      17,
      17
    );


    c.rotate(
      Math.PI / 4
    );


    c.fillStyle =
      '#ffffff';


    c.fillRect(
      -5,
      -5,
      10,
      10
    );


    c.restore();
  }
}


/* =========================================================
   SMALL RIFTWALKER
========================================================= */

function drawMiniRiftwalker(
  c,
  x,
  y,
  s = .5
) {

  c.save();


  c.translate(
    x,
    y
  );


  c.scale(
    s,
    s
  );


  rr(
    c,
    -23,
    -82,
    46,
    56,
    18,
    '#233957',
    '#182333',
    6
  );


  c.fillStyle =
    '#e94759';


  c.beginPath();

  c.moveTo(
    -17,
    -79
  );

  c.lineTo(
    -66,
    -67
  );

  c.lineTo(
    -27,
    -48
  );

  c.closePath();

  c.fill();


  ellipse(
    c,
    0,
    -105,
    34,
    37,
    '#f7fbff',
    '#182333',
    6
  );


  rr(
    c,
    -24,
    -115,
    48,
    21,
    10,
    '#111b2c',
    '#182333',
    4
  );


  ellipse(
    c,
    -10,
    -104,
    5,
    3,
    '#6ceaff'
  );


  ellipse(
    c,
    10,
    -104,
    5,
    3,
    '#6ceaff'
  );


  c.restore();
}


/* =========================================================
   RIFTWALKER
========================================================= */

function drawRiftwalker(
  x,
  y,
  scale = 1,
  remote = false,
  remoteData = null
) {

  const t =
    G.time;


  const state =
    remoteData?.state ||
    P.anim.state;


  const animTime =
    remoteData?.animTime ??
    P.anim.time;


  const facing =
    remoteData?.facing ??
    P.facing;


  const attackTimer =
    remoteData?.attack ??
    P.attackTimer;


  const attackIndex =
    remoteData?.attackIndex ??
    P.attackIndex;


  const run =
    state === 'run'
      ? Math.sin(
          animTime *
          14
        )
      : 0;


  const idle =
    Math.sin(
      t *
      3
    )
    *
    2;


  const attack =
    attackTimer >
    0;


  const jumpLift =
    state === 'jump'
      ? 4
      : (
          state === 'fall'
            ? -2
            : 0
        );


  ctx.save();


  ctx.translate(
    x,
    y
  );


  ctx.scale(
    facing *
    scale,
    scale
  );


  if (
    !remote &&
    P.hitFlash > 0
  ) {

    ctx.globalAlpha =
      .55 +
      Math.sin(
        t *
        70
      )
      *
      .35;
  }


  contactShadow(
    0,
    8,
    state === 'dash'
      ? 78
      : 62,
    15,
    .34
  );


  /* LEGS */

  const leg =
    run *
    11;


  ctx.strokeStyle =
    '#182333';


  ctx.lineWidth =
    14;


  ctx.lineCap =
    'round';


  ctx.beginPath();


  ctx.moveTo(
    -11,
    -35 +
    jumpLift
  );


  ctx.lineTo(
    -16 -
    leg,
    0
  );


  ctx.moveTo(
    11,
    -35 +
    jumpLift
  );


  ctx.lineTo(
    16 +
    leg,
    0
  );


  ctx.stroke();


  ellipse(
    ctx,
    -19 -
    leg,
    4,
    22,
    10,
    '#d94859',
    '#182333',
    4
  );


  ellipse(
    ctx,
    19 +
    leg,
    4,
    22,
    10,
    '#d94859',
    '#182333',
    4
  );


  /* BODY */

  const body =
    ctx.createLinearGradient(
      -30,
      -100,
      30,
      -25
    );


  body.addColorStop(
    0,
    '#496786'
  );


  body.addColorStop(
    .45,
    '#233957'
  );


  body.addColorStop(
    1,
    '#0e1729'
  );


  rr(
    ctx,
    -29,
    -96 +
    idle +
    jumpLift,
    58,
    65,
    22,
    body,
    '#182333',
    6
  );


  drawEquippedArmor(
    idle +
    jumpLift,

    remote
      ? (
          remoteData?.armor ||
          'none'
        )
      : P.armor
  );


  /* RIFT CORE */

  ctx.save();


  ctx.translate(
    0,
    -64 +
    idle +
    jumpLift
  );


  ctx.rotate(
    Math.PI / 4
  );


  ctx.shadowColor =
    '#65eaff';


  ctx.shadowBlur =
    16;


  ctx.fillStyle =
    '#dffcff';


  ctx.fillRect(
    -7,
    -7,
    14,
    14
  );


  ctx.strokeStyle =
    '#4bbbd8';


  ctx.lineWidth =
    2;


  ctx.strokeRect(
    -7,
    -7,
    14,
    14
  );


  ctx.restore();


  /* SCARF */

  const scarfWave =
    Math.sin(
      t *
      5
    )
    *
    10
    +
    Math.abs(
      P.vx
    )
    *
    .025;


  ctx.fillStyle =
    '#e94759';


  ctx.strokeStyle =
    '#7e2435';


  ctx.lineWidth =
    4;


  ctx.beginPath();


  ctx.moveTo(
    -18,
    -108 +
    idle
  );


  ctx.lineTo(
    -76 -
    scarfWave,
    -102 +
    idle +
    Math.sin(
      t *
      7
    )
    *
    5
  );


  ctx.lineTo(
    -42 -
    scarfWave *
    .25,
    -78 +
    idle
  );


  ctx.lineTo(
    -12,
    -88 +
    idle
  );


  ctx.closePath();

  ctx.fill();

  ctx.stroke();


  /* ARMS */

  let rightX =
    42;


  let rightY =
    -60;


  let leftX =
    -42;


  let leftY =
    -58;


  if (attack) {

    const phase =
      1 -
      attackTimer /
      .25;


    if (
      attackIndex ===
      0
    ) {

      rightX =
        55;


      rightY =
        -100 +
        phase *
        40;
    }


    else if (
      attackIndex ===
      1
    ) {

      rightX =
        62;


      rightY =
        -48 -
        phase *
        45;
    }


    else {

      rightX =
        58;


      rightY =
        -85;
    }
  }


  ctx.strokeStyle =
    '#172131';


  ctx.lineWidth =
    13;


  ctx.beginPath();


  ctx.moveTo(
    -21,
    -80 +
    idle
  );


  ctx.lineTo(
    leftX,
    leftY +
    run *
    6
  );


  ctx.moveTo(
    21,
    -80 +
    idle
  );


  ctx.lineTo(
    rightX,
    rightY -
    run *
    6
  );


  ctx.stroke();


  ellipse(
    ctx,
    leftX,
    leftY +
    run *
    6,
    9,
    9,
    '#dbe9f4',
    '#172131',
    3
  );


  ellipse(
    ctx,
    rightX,
    rightY -
    run *
    6,
    9,
    9,
    '#dbe9f4',
    '#172131',
    3
  );


  /* HEAD */

  const head =
    ctx.createRadialGradient(
      -12,
      -138,
      3,
      0,
      -128,
      42
    );


  head.addColorStop(
    0,
    '#ffffff'
  );


  head.addColorStop(
    .52,
    '#edf3f8'
  );


  head.addColorStop(
    1,
    '#9daabc'
  );


  ellipse(
    ctx,
    0,
    -129 +
    idle,
    42,
    43,
    head,
    '#172131',
    6
  );


  /* VISOR */

  rr(
    ctx,
    -28,
    -142 +
    idle,
    56,
    25,
    12,
    '#111b2c',
    '#172131',
    4
  );


  ctx.shadowColor =
    '#62eaff';


  ctx.shadowBlur =
    12;


  ellipse(
    ctx,
    -12,
    -130 +
    idle,
    6,
    3,
    '#7af1ff'
  );


  ellipse(
    ctx,
    12,
    -130 +
    idle,
    6,
    3,
    '#7af1ff'
  );


  ctx.shadowBlur =
    0;


  /* NOVA SWORD */

  if (
    P.weapon ||
    remote
  ) {

    ctx.save();


    ctx.translate(
      rightX,
      rightY -
      run *
      6
    );


    let angle =
      -.35;


    if (attack) {

      const ph =
        1 -
        attackTimer /
        .25;


      if (
        attackIndex ===
        0
      ) {

        angle =
          -1.5 +
          ph *
          1.8;
      }


      else if (
        attackIndex ===
        1
      ) {

        angle =
          .5 -
          ph *
          2;
      }


      else {

        angle =
          -1.7 +
          ph *
          3.4;
      }
    }


    ctx.rotate(
      angle
    );


    ctx.shadowColor =
      '#9d68ff';


    ctx.shadowBlur =
      24;


    const sg =
      ctx.createLinearGradient(
        0,
        -82,
        0,
        8
      );


    sg.addColorStop(
      0,
      '#ffffff'
    );


    sg.addColorStop(
      .3,
      '#eee8ff'
    );


    sg.addColorStop(
      .72,
      '#a36aff'
    );


    sg.addColorStop(
      1,
      '#6238c7'
    );


    ctx.beginPath();

    ctx.moveTo(
      -7,
      -68
    );

    ctx.lineTo(
      0,
      -84
    );

    ctx.lineTo(
      7,
      -68
    );

    ctx.lineTo(
      6,
      8
    );

    ctx.lineTo(
      -6,
      8
    );

    ctx.closePath();


    ctx.fillStyle =
      sg;


    ctx.fill();


    ctx.strokeStyle =
      '#5a45b7';


    ctx.lineWidth =
      3;


    ctx.stroke();


    ctx.shadowBlur =
      0;


    rr(
      ctx,
      -17,
      7,
      34,
      8,
      4,
      '#7650db',
      '#332260',
      3
    );


    rr(
      ctx,
      -5,
      14,
      10,
      28,
      4,
      '#3e2a77',
      '#211542',
      3
    );


    ctx.restore();
  }


  /* SLASH EFFECT */

  if (attack) {

    ctx.save();


    ctx.globalAlpha =
      .65;


    ctx.strokeStyle =
      attackIndex === 2
        ? '#eee4ff'
        : '#9d7aff';


    ctx.lineWidth =
      attackIndex === 2
        ? 12
        : 7;


    ctx.shadowColor =
      '#9c6fff';


    ctx.shadowBlur =
      18;


    ctx.beginPath();


    ctx.arc(
      20,
      -70,
      attackIndex === 2
        ? 94
        : 70,
      -1.9,
      .7
    );


    ctx.stroke();


    ctx.restore();
  }


  /* DASH TRAIL */

  if (
    state === 'dash'
  ) {

    ctx.save();


    ctx.globalAlpha =
      .18;


    for (
      let i = 1;
      i <= 3;
      i++
    ) {

      ellipse(
        ctx,
        -i *
        34,
        -65,
        28,
        52,
        '#6cecff'
      );
    }


    ctx.restore();
  }


  ctx.restore();
}


/* =========================================================
   VISIBLE ARMOR
========================================================= */

function drawEquippedArmor(
  offset = 0,
  armorId = P.armor
) {

  if (
    armorId ===
    'none'
  ) {

    return;
  }


  if (
    armorId ===
    'scout'
  ) {

    rr(
      ctx,
      -38,
      -91 +
      offset,
      18,
      27,
      7,
      '#6987a9',
      '#172131',
      4
    );


    rr(
      ctx,
      20,
      -91 +
      offset,
      18,
      27,
      7,
      '#6987a9',
      '#172131',
      4
    );
  }


  else if (
    armorId ===
    'rift'
  ) {

    rr(
      ctx,
      -23,
      -89 +
      offset,
      46,
      34,
      11,
      '#344f79',
      '#172131',
      4
    );


    ctx.strokeStyle =
      '#62eaff';


    ctx.lineWidth =
      3;


    ctx.beginPath();

    ctx.moveTo(
      -15,
      -72 +
      offset
    );


    ctx.lineTo(
      0,
      -84 +
      offset
    );


    ctx.lineTo(
      15,
      -72 +
      offset
    );


    ctx.stroke();
  }


  else if (
    armorId ===
    'titan'
  ) {

    rr(
      ctx,
      -39,
      -94 +
      offset,
      24,
      33,
      8,
      '#5f6d7b',
      '#172131',
      5
    );


    rr(
      ctx,
      15,
      -94 +
      offset,
      24,
      33,
      8,
      '#5f6d7b',
      '#172131',
      5
    );


    rr(
      ctx,
      -27,
      -88 +
      offset,
      54,
      43,
      12,
      '#465666',
      '#172131',
      5
    );
  }


  else if (
    armorId ===
    'void'
  ) {

    ctx.strokeStyle =
      '#b073ff';


    ctx.lineWidth =
      4;


    ctx.shadowColor =
      '#8b56ff';


    ctx.shadowBlur =
      10;


    ctx.beginPath();


    ctx.moveTo(
      -20,
      -87 +
      offset
    );


    ctx.lineTo(
      -5,
      -72 +
      offset
    );


    ctx.lineTo(
      -18,
      -55 +
      offset
    );


    ctx.moveTo(
      20,
      -87 +
      offset
    );


    ctx.lineTo(
      5,
      -72 +
      offset
    );


    ctx.lineTo(
      18,
      -55 +
      offset
    );


    ctx.stroke();


    ctx.shadowBlur =
      0;
  }


  else if (
    armorId ===
    'matrix'
  ) {

    ctx.fillStyle =
      '#7ff7f2';


    ctx.strokeStyle =
      '#172131';


    ctx.lineWidth =
      3;


    const pieces = [

      [
        -36,
        -87,
        11
      ],

      [
        36,
        -80,
        9
      ],

      [
        -30,
        -48,
        8
      ],

      [
        30,
        -50,
        10
      ]
    ];


    for (
      const [
        x,
        y,
        s
      ]
      of
      pieces
    ) {

      ctx.save();


      ctx.translate(
        x,
        y +
        offset
      );


      ctx.rotate(
        G.time +
        x
      );


      ctx.fillRect(
        -s / 2,
        -s / 2,
        s,
        s
      );


      ctx.strokeRect(
        -s / 2,
        -s / 2,
        s,
        s
      );


      ctx.restore();
    }
  }
}


/* =========================================================
   PET COLOUR
========================================================= */

function hashColor(
  name
) {

  let h =
    0;


  for (
    const ch of
    name
  ) {

    h =
      (
        h *
        31 +
        ch.charCodeAt(0)
      )
      >>>
      0;
  }


  return (
    `hsl(${h % 360} 62% 64%)`
  );
}


/* =========================================================
   CUSTOM PET DRAWING
========================================================= */

function drawPetSprite(
  c,
  x,
  y,
  name,
  scale = 1,
  time = 0
) {

  const color =
    hashColor(
      name
    );


  const type =
    PET_TYPES[
      name
    ] ||
    '';


  const fly =
    /Bird|Finch|Hawk|Eagle|Butterfly|Moth|Starling|Bee/
      .test(
        name
      );


  const bot =
    /Bot/
      .test(
        name
      );


  const longBody =
    /Serpent|Squid|Spider/
      .test(
        name
      );


  const rabbit =
    /Rabbit|Bunny|Hare/
      .test(
        name
      );


  const ears =
    /Cat|Fox|Pup|Hound|Wolf|Lion|Fawn|Boar/
      .test(
        name
      );


  const bob =
    Math.sin(
      time *
      4 +
      name.length
    )
    *
    3;


  c.save();


  c.translate(
    x,
    y +
    (
      fly
        ? -12 + bob
        : 0
    )
  );


  c.scale(
    scale,
    scale
  );


  /* SHADOW */

  c.globalAlpha =
    .18;


  c.fillStyle =
    '#06101a';


  c.beginPath();

  c.ellipse(
    0,
    7,
    27,
    7,
    0,
    0,
    Math.PI * 2
  );

  c.fill();


  c.globalAlpha =
    1;


  /* WINGS */

  if (fly) {

    c.fillStyle =
      color;


    c.strokeStyle =
      '#192438';


    c.lineWidth =
      4;


    c.beginPath();


    c.ellipse(
      -22,
      -18,
      18,
      10,
      -.5 +
      Math.sin(
        time *
        8
      )
      *
      .12,
      0,
      Math.PI * 2
    );


    c.ellipse(
      22,
      -18,
      18,
      10,
      .5 -
      Math.sin(
        time *
        8
      )
      *
      .12,
      0,
      Math.PI * 2
    );


    c.fill();

    c.stroke();
  }


  if (longBody) {

    c.strokeStyle =
      color;


    c.lineWidth =
      17;


    c.lineCap =
      'round';


    c.beginPath();

    c.moveTo(
      -25,
      -4
    );


    c.quadraticCurveTo(
      0,
      15,
      26,
      -8
    );


    c.stroke();
  }


  /* BODY */

  const body =
    c.createLinearGradient(
      -20,
      -38,
      23,
      7
    );


  body.addColorStop(
    0,
    '#fbfdff'
  );


  body.addColorStop(
    .2,
    color
  );


  body.addColorStop(
    1,
    '#40506b'
  );


  c.fillStyle =
    body;


  c.strokeStyle =
    '#182333';


  c.lineWidth =
    4;


  c.beginPath();


  c.ellipse(
    0,
    -14,
    bot
      ? 24
      : 25,
    bot
      ? 22
      : 24,
    0,
    0,
    Math.PI * 2
  );


  c.fill();

  c.stroke();


  /* RABBIT EARS */

  if (rabbit) {

    rr(
      c,
      -18,
      -49,
      10,
      29,
      7,
      color,
      '#182333',
      3
    );


    rr(
      c,
      8,
      -49,
      10,
      29,
      7,
      color,
      '#182333',
      3
    );
  }


  /* POINTED EARS */

  if (ears) {

    c.fillStyle =
      color;


    c.strokeStyle =
      '#182333';


    c.lineWidth =
      3;


    c.beginPath();


    c.moveTo(
      -22,
      -31
    );


    c.lineTo(
      -14,
      -50
    );


    c.lineTo(
      -5,
      -34
    );


    c.moveTo(
      22,
      -31
    );


    c.lineTo(
      14,
      -50
    );


    c.lineTo(
      5,
      -34
    );


    c.fill();

    c.stroke();
  }


  /* FACE */

  if (bot) {

    rr(
      c,
      -15,
      -28,
      30,
      23,
      6,
      '#8aa5bd',
      '#182333',
      3
    );


    c.fillStyle =
      '#67ecff';


    c.fillRect(
      -10,
      -21,
      20,
      5
    );
  }


  else {

    c.fillStyle =
      '#102034';


    c.beginPath();

    c.arc(
      -8,
      -18,
      3,
      0,
      Math.PI * 2
    );


    c.arc(
      8,
      -18,
      3,
      0,
      Math.PI * 2
    );


    c.fill();


    c.strokeStyle =
      '#102034';


    c.lineWidth =
      2;


    c.beginPath();

    c.arc(
      0,
      -10,
      6,
      .2,
      Math.PI - .2
    );

    c.stroke();
  }


  /* GLITCH EFFECT */

  if (
    type.includes(
      'Glitch'
    )
  ) {

    c.globalAlpha =
      .48;


    c.fillStyle =
      '#62f4ff';


    c.fillRect(
      -32,
      -35,
      18,
      4
    );


    c.fillStyle =
      '#e45cff';


    c.fillRect(
      14,
      -5,
      22,
      4
    );
  }


  /* VOID AURA */

  if (
    type.includes(
      'Void'
    )
  ) {

    c.shadowColor =
      '#a26bff';


    c.shadowBlur =
      12;


    c.strokeStyle =
      '#a26bff';


    c.lineWidth =
      2;


    c.beginPath();

    c.arc(
      0,
      -14,
      31,
      0,
      Math.PI * 2
    );

    c.stroke();
  }


  c.restore();
}


/* =========================================================
   PET PORTRAIT
========================================================= */

function drawPetPortrait(
  canvasEl,
  name,
  large = false
) {

  const c =
    canvasEl.getContext(
      '2d'
    );


  c.clearRect(
    0,
    0,
    canvasEl.width,
    canvasEl.height
  );


  drawPetSprite(
    c,
    canvasEl.width / 2,
    canvasEl.height * .72,
    name,
    large
      ? 2
      : .85,
    G.time
  );
}


/* =========================================================
   ENEMY DRAWING
========================================================= */

function drawEnemy(
  enemy,
  cam
) {

  const x =
    enemy.x -
    cam;


  const y =
    enemy.y;


  contactShadow(
    x,
    y + 7,
    enemy.boss
      ? 120
      : 58,
    enemy.boss
      ? 25
      : 13,
    enemy.boss
      ? .42
      : .28
  );


  ctx.save();


  ctx.translate(
    x,
    y
  );


  const s =
    enemy.boss
      ? 1.7
      : 1;


  const bob =
    Math.sin(
      G.time *
      4 +
      enemy.x *
      .01
    )
    *
    3;


  ctx.scale(
    s,
    s
  );


  const g =
    ctx.createLinearGradient(
      -30,
      -65,
      30,
      0
    );


  g.addColorStop(
    0,

    enemy.hit > 0
      ? '#ffffff'
      : (
          enemy.boss
            ? '#ff8b78'
            : '#8ae6bd'
        )
  );


  g.addColorStop(
    1,

    enemy.boss
      ? '#7d2945'
      : '#315c55'
  );


  ellipse(
    ctx,
    0,
    -32 +
    bob,
    27,
    28,
    g,
    '#182333',
    5
  );


  ctx.fillStyle =
    '#172131';


  ctx.beginPath();


  ctx.moveTo(
    -22,
    -49 +
    bob
  );


  ctx.lineTo(
    -12,
    -70 +
    bob
  );


  ctx.lineTo(
    -3,
    -52 +
    bob
  );


  ctx.moveTo(
    22,
    -49 +
    bob
  );


  ctx.lineTo(
    12,
    -70 +
    bob
  );


  ctx.lineTo(
    3,
    -52 +
    bob
  );


  ctx.fill();


  ellipse(
    ctx,
    -9,
    -34 +
    bob,
    4,
    3,

    enemy.boss
      ? '#ffe1d8'
      : '#d8fff0'
  );


  ellipse(
    ctx,
    9,
    -34 +
    bob,
    4,
    3,

    enemy.boss
      ? '#ffe1d8'
      : '#d8fff0'
  );


  if (
    enemy.boss
  ) {

    ctx.strokeStyle =
      '#ffb0a0';


    ctx.lineWidth =
      5;


    ctx.beginPath();

    ctx.arc(
      0,
      -30 +
      bob,
      38,
      -.8,
      .8
    );

    ctx.stroke();
  }


  ctx.restore();


  /* ENEMY HP */

  const ratio =
    clamp(
      enemy.hp /
      enemy.maxHP,
      0,
      1
    );


  const barW =
    enemy.boss
      ? 120
      : 60;


  rr(
    ctx,
    x -
    barW / 2,
    y -
    (
      enemy.boss
        ? 132
        : 82
    ),
    barW,
    7,
    4,
    '#0b1020'
  );


  rr(
    ctx,
    x -
    barW / 2,
    y -
    (
      enemy.boss
        ? 132
        : 82
    ),
    barW *
    ratio,
    7,
    4,

    enemy.boss
      ? '#ff657d'
      : '#6ce7ad'
  );


  if (
    enemy.boss
  ) {

    ctx.fillStyle =
      '#ffffff';


    ctx.font =
      '900 11px system-ui';


    ctx.textAlign =
      'center';


    ctx.fillText(
      enemy.name,
      x,
      y - 146
    );


    ctx.textAlign =
      'left';
  }
}


/* =========================================================
   TREES
========================================================= */

function drawTree(
  x,
  y,
  cam,
  worldId,
  foreground = false
) {

  x -=
    cam;


  const sway =
    Math.sin(
      G.time *
      1.7 +
      x *
      .01
    )
    *
    3;


  ctx.save();


  ctx.translate(
    x,
    y
  );


  const trunk =
    ctx.createLinearGradient(
      -15,
      -110,
      15,
      0
    );


  trunk.addColorStop(
    0,
    '#916b49'
  );


  trunk.addColorStop(
    1,
    '#4b3427'
  );


  rr(
    ctx,
    -15,
    -110,
    30,
    115,
    12,
    trunk,
    '#33261f',
    4
  );


  const leafDark =
    worldId === 'void'
      ? '#38234d'
      : (
          worldId === 'music'
            ? '#7b3a9a'
            : '#26744e'
        );


  const leaves = [

    [
      -27,
      -120,
      35
    ],

    [
      22,
      -120,
      39
    ],

    [
      sway,
      -154,
      43
    ]
  ];


  for (
    const [
      dx,
      dy,
      r
    ]
    of
    leaves
  ) {

    const g =
      ctx.createRadialGradient(
        dx - 8,
        dy - 10,
        2,
        dx,
        dy,
        r
      );


    g.addColorStop(
      0,

      worldId ===
      'music'
        ? '#e883e8'
        : '#a4ec93'
    );


    g.addColorStop(
      1,
      leafDark
    );


    ellipse(
      ctx,
      dx,
      dy,
      r,
      r *
      .78,
      g,
      '#1b4434',
      4
    );
  }


  if (foreground) {

    ctx.globalAlpha =
      .94;
  }


  ctx.restore();
}


/* =========================================================
   RUINS
========================================================= */

function drawRuin(
  x,
  y,
  cam
) {

  x -=
    cam;


  const g =
    ctx.createLinearGradient(
      x - 35,
      y - 145,
      x + 35,
      y
    );


  g.addColorStop(
    0,
    '#eee9d9'
  );


  g.addColorStop(
    1,
    '#777a80'
  );


  rr(
    ctx,
    x - 31,
    y - 135,
    62,
    145,
    14,
    g,
    '#4d5260',
    5
  );


  rr(
    ctx,
    x - 44,
    y - 151,
    88,
    22,
    8,
    '#e9e3d0',
    '#4d5260',
    5
  );
}


/* =========================================================
   WORLD BACKGROUNDS
========================================================= */

function drawWorldBackground(
  world,
  cam
) {

  const sky =
    ctx.createLinearGradient(
      0,
      0,
      0,
      H
    );


  sky.addColorStop(
    0,
    world.skyA
  );


  sky.addColorStop(
    1,
    world.skyB
  );


  ctx.fillStyle =
    sky;


  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  /* SPACE STARS */

  if (
    G.worldId === 'cosmos' ||
    G.worldId === 'void' ||
    G.worldId === 'matrix'
  ) {

    for (
      let i = 0;
      i < 80;
      i++
    ) {

      ctx.globalAlpha =
        .2 +
        (
          i % 4
        )
        *
        .13;


      ctx.fillStyle =
        i % 9 === 0
          ? world.accent
          : '#ffffff';


      ctx.beginPath();


      ctx.arc(
        (
          (
            i *
            93
            -
            cam *
            .08
          )
          %
          (
            W +
            100
          )
        )
        -
        50,

        30 +
        (
          i *
          57
        )
        %
        340,

        i % 17 === 0
          ? 2
          : 1,

        0,
        Math.PI * 2
      );


      ctx.fill();
    }


    ctx.globalAlpha =
      1;
  }


  /* EARTH MOUNTAINS */

  if (
    G.worldId ===
    'earth'
  ) {

    ctx.fillStyle =
      'rgba(36,94,79,.24)';


    ctx.beginPath();


    ctx.moveTo(
      0,
      390
    );


    for (
      let x = 0;
      x <= W;
      x += 80
    ) {

      ctx.lineTo(
        x,

        330 +
        Math.sin(
          (
            x +
            cam *
            .12
          )
          *
          .006
        )
        *
        55
      );
    }


    ctx.lineTo(
      W,
      520
    );


    ctx.lineTo(
      0,
      520
    );


    ctx.closePath();

    ctx.fill();
  }


  /* MUSIC VERSE */

  if (
    G.worldId ===
    'music'
  ) {

    for (
      let i = 0;
      i < 12;
      i++
    ) {

      const h =
        60 +
        Math.sin(
          G.time *
          3 +
          i
        )
        *
        25;


      ctx.fillStyle =
        `rgba(105,235,255,${
          .08 +
          (
            i % 3
          )
          *
          .03
        })`;


      ctx.fillRect(
        i *
        110
        -
        (
          cam *
          .12
          %
          110
        ),
        400 -
        h,
        70,
        h
      );
    }
  }


  /* MONEY VILLAGE */

  if (
    G.worldId ===
    'money'
  ) {

    ctx.fillStyle =
      'rgba(255,232,145,.16)';


    for (
      let i = 0;
      i < 9;
      i++
    ) {

      ctx.beginPath();


      ctx.arc(
        i *
        170
        -
        cam *
        .1,

        120 +
        (
          i % 3
        )
        *
        50,

        45,

        0,
        Math.PI * 2
      );


      ctx.fill();
    }
  }


  /* WAR ZONE */

  if (
    G.worldId ===
    'war'
  ) {

    ctx.fillStyle =
      'rgba(40,25,28,.3)';


    for (
      let i = 0;
      i < 8;
      i++
    ) {

      ctx.fillRect(
        i *
        190
        -
        cam *
        .16,

        250 +
        (
          i % 2
        )
        *
        40,

        95,
        220
      );
    }
  }


  /* MATRIX GRID */

  if (
    G.worldId ===
    'matrix'
  ) {

    ctx.strokeStyle =
      'rgba(92,246,239,.13)';


    ctx.lineWidth =
      1;


    for (
      let x =
        -cam %
        70;

      x < W;

      x += 70
    ) {

      ctx.beginPath();

      ctx.moveTo(
        x,
        0
      );


      ctx.lineTo(
        x,
        H
      );


      ctx.stroke();
    }


    for (
      let y = 0;
      y < H;
      y += 70
    ) {

      ctx.beginPath();

      ctx.moveTo(
        0,
        y
      );


      ctx.lineTo(
        W,
        y
      );


      ctx.stroke();
    }
  }


  /* GROUND */

  const ground =
    ctx.createLinearGradient(
      0,
      410,
      0,
      H
    );


  ground.addColorStop(
    0,
    world.ground
  );


  ground.addColorStop(
    1,
    world.dark
  );


  ctx.fillStyle =
    ground;


  ctx.fillRect(
    0,
    410,
    W,
    H - 410
  );
}


/* =========================================================
   WORLD PROPS
========================================================= */

function drawWorldProps(
  world,
  cam
) {

  const width =
    world.width;


  for (
    let x = 600;
    x < width;
    x += 520
  ) {

    if (
      x % 1040 ===
      600
    ) {

      drawTree(
        x,
        525,
        cam,
        G.worldId,
        false
      );

    }

    else {

      drawRuin(
        x,
        525,
        cam
      );
    }
  }


  /* MUSIC SPEAKERS */

  if (
    G.worldId ===
    'music'
  ) {

    for (
      let x = 1000;
      x < width;
      x += 900
    ) {

      const sx =
        x -
        cam;


      ctx.shadowColor =
        '#e15ee2';


      ctx.shadowBlur =
        18;


      rr(
        ctx,
        sx - 35,
        405,
        70,
        120,
        12,
        '#17182e',
        '#5f53c9',
        5
      );


      ellipse(
        ctx,
        sx,
        450,
        23,
        23,
        '#e957d4',
        '#51245b',
        4
      );


      ctx.shadowBlur =
        0;
    }
  }


  /* COSMOS PLATFORMS */

  if (
    G.worldId ===
    'cosmos'
  ) {

    for (
      let x = 900;
      x < width;
      x += 850
    ) {

      const sx =
        x -
        cam;


      ctx.fillStyle =
        '#6f6aa8';


      ctx.strokeStyle =
        '#282447';


      ctx.lineWidth =
        4;


      ctx.beginPath();


      ctx.ellipse(
        sx,
        500,
        80,
        25,
        -.1,
        0,
        Math.PI * 2
      );


      ctx.fill();

      ctx.stroke();


      ctx.shadowColor =
        '#78eaff';


      ctx.shadowBlur =
        16;


      ellipse(
        ctx,
        sx,
        475,
        12,
        12,
        '#9af6ff'
      );


      ctx.shadowBlur =
        0;
    }
  }
}


/* =========================================================
   EARTH STORY OBJECTS
========================================================= */

function drawEarthStoryObjects(
  cam
) {

  const p =
    G.progress.earth;


  const crashX =
    310 -
    cam;


  drawCrashedShip(
    crashX,
    510
  );


  if (
    p.storyStage ===
    1
  ) {

    drawSwordPickup(
      950 -
      cam,
      505
    );
  }


  if (
    p.storyStage ===
    2
  ) {

    const parts = [

      [
        'drive',
        1480
      ],

      [
        'stabilizer',
        2350
      ],

      [
        'core',
        3250
      ]
    ];


    for (
      const [
        id,
        x
      ]
      of
      parts
    ) {

      if (
        !(
          p.collectedParts ||
          []
        )
        .includes(
          id
        )
      ) {

        drawShipPart(
          x -
          cam,
          505,
          id
        );
      }
    }
  }


  drawTower(
    3920 -
    cam,
    525,
    p.storyStage >=
    3
  );


  drawGate(
    4520 -
    cam,
    525,
    p.storyStage >=
    4
  );
}


/* =========================================================
   CRASHED SHIP
========================================================= */

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
    -.16
  );


  ctx.globalAlpha =
    .95;


  drawShip(
    0,
    -20,
    .72,
    0
  );


  for (
    let i = 0;
    i < 4;
    i++
  ) {

    ellipse(
      ctx,
      -80 +
      i *
      24,
      -50 -
      i *
      8,
      18 +
      i *
      4,
      10 +
      i *
      3,
      'rgba(40,45,52,.45)'
    );
  }


  ctx.restore();
}


/* =========================================================
   NOVA SWORD PICKUP
========================================================= */

function drawSwordPickup(
  x,
  y
) {

  ctx.save();


  ctx.translate(
    x,
    y - 35
  );


  ctx.rotate(
    .55
  );


  ctx.shadowColor =
    '#9b72ff';


  ctx.shadowBlur =
    24;


  const g =
    ctx.createLinearGradient(
      0,
      -80,
      0,
      0
    );


  g.addColorStop(
    0,
    '#ffffff'
  );


  g.addColorStop(
    1,
    '#7750ed'
  );


  rr(
    ctx,
    -7,
    -80,
    14,
    72,
    6,
    g,
    '#6047bd',
    3
  );


  rr(
    ctx,
    -18,
    -8,
    36,
    9,
    4,
    '#6d4bd3',
    '#2b1d5b',
    3
  );


  rr(
    ctx,
    -5,
    0,
    10,
    28,
    4,
    '#3d2a72',
    '#20153d',
    3
  );


  ctx.restore();
}


/* =========================================================
   SHIP COMPONENT
========================================================= */

function drawShipPart(
  x,
  y,
  id
) {

  contactShadow(
    x,
    y + 4,
    50,
    10,
    .22
  );


  ctx.save();


  ctx.translate(
    x,
    y - 28
  );


  ctx.rotate(
    Math.sin(
      G.time *
      2 +
      x
    )
    *
    .08
  );


  const g =
    ctx.createLinearGradient(
      -22,
      -22,
      22,
      22
    );


  g.addColorStop(
    0,
    '#dbe6ef'
  );


  g.addColorStop(
    1,
    '#50637a'
  );


  rr(
    ctx,
    -24,
    -20,
    48,
    40,
    10,
    g,
    '#1b293b',
    4
  );


  ctx.shadowColor =
    '#67eaff';


  ctx.shadowBlur =
    12;


  ellipse(
    ctx,
    0,
    0,
    8,
    8,

    id === 'core'
      ? '#b178ff'
      : '#67eaff',

    '#264c61',
    2
  );


  ctx.restore();
}


/* =========================================================
   SIGNAL TOWER
========================================================= */

function drawTower(
  x,
  y,
  active
) {

  rr(
    ctx,
    x - 35,
    y - 190,
    70,
    195,
    15,
    '#66727c',
    '#303946',
    5
  );


  ctx.shadowColor =
    active
      ? '#65eaff'
      : '#53616a';


  ctx.shadowBlur =
    active
      ? 22
      : 0;


  ellipse(
    ctx,
    x,
    y - 205,
    28,
    28,

    active
      ? '#78efff'
      : '#69747b',

    '#294c5e',
    4
  );


  ctx.shadowBlur =
    0;
}


/* =========================================================
   ANCIENT GATE
========================================================= */

function drawGate(
  x,
  y,
  active
) {

  rr(
    ctx,
    x - 75,
    y - 180,
    45,
    185,
    12,
    '#77746c',
    '#403e3a',
    5
  );


  rr(
    ctx,
    x + 30,
    y - 180,
    45,
    185,
    12,
    '#77746c',
    '#403e3a',
    5
  );


  ctx.strokeStyle =
    active
      ? '#8b70ff'
      : '#4c4c55';


  ctx.lineWidth =
    10;


  if (active) {

    ctx.shadowColor =
      '#7761e8';


    ctx.shadowBlur =
      18;
  }


  ctx.beginPath();


  ctx.arc(
    x,
    y - 140,
    70,
    Math.PI,
    0
  );


  ctx.stroke();


  ctx.shadowBlur =
    0;
}


/* =========================================================
   PICKUPS
========================================================= */

function drawPickup(
  item,
  cam
) {

  const x =
    item.x -
    cam;


  const y =
    item.y;


  if (
    item.kind ===
    'pet'
  ) {

    drawPetSprite(
      ctx,
      x,
      y,
      item.name,
      .82,
      G.time
    );
  }


  else if (
    item.kind ===
    'fragment'
  ) {

    ctx.save();


    ctx.translate(
      x,
      y - 35
    );


    ctx.rotate(
      G.time
    );


    ctx.shadowColor =
      '#79eaff';


    ctx.shadowBlur =
      18;


    ctx.fillStyle =
      '#dffcff';


    ctx.strokeStyle =
      '#6e59dd';


    ctx.lineWidth =
      3;


    ctx.beginPath();


    ctx.moveTo(
      0,
      -18
    );


    ctx.lineTo(
      13,
      0
    );


    ctx.lineTo(
      0,
      18
    );


    ctx.lineTo(
      -13,
      0
    );


    ctx.closePath();

    ctx.fill();

    ctx.stroke();


    ctx.restore();
  }


  else if (
    item.kind ===
    'beacon'
  ) {

    rr(
      ctx,
      x - 24,
      y - 110,
      48,
      115,
      10,
      '#333b46',
      '#7e3c35',
      5
    );


    ctx.shadowColor =
      '#ff6b57';


    ctx.shadowBlur =
      18;


    ellipse(
      ctx,
      x,
      y - 124,
      20,
      20,
      '#ff6b57',
      '#6f2b2b',
      4
    );


    ctx.shadowBlur =
      0;
  }


  else if (
    item.kind ===
    'portal'
  ) {

    ctx.save();


    ctx.strokeStyle =
      '#79eaff';


    ctx.shadowColor =
      '#6cecff';


    ctx.shadowBlur =
      24;


    ctx.lineWidth =
      14;


    ctx.beginPath();


    ctx.arc(
      x,
      y - 55,
      58,
      Math.PI,
      0
    );


    ctx.stroke();


    ctx.restore();
  }


  else if (
    item.kind ===
    'credit'
  ) {

    ctx.save();


    ctx.translate(
      x,
      y - 12
    );


    ctx.rotate(
      G.time *
      2 +
      item.x
    );


    ctx.shadowColor =
      '#72e6ff';


    ctx.shadowBlur =
      12;


    const g =
      ctx.createRadialGradient(
        -4,
        -5,
        2,
        0,
        0,
        13
      );


    g.addColorStop(
      0,
      '#ffffff'
    );


    g.addColorStop(
      .45,
      '#70ecff'
    );


    g.addColorStop(
      1,
      '#5c43cc'
    );


    ellipse(
      ctx,
      0,
      0,
      13,
      13,
      g,
      '#19253d',
      3
    );


    ctx.rotate(
      Math.PI / 4
    );


    ctx.fillStyle =
      '#ffffff';


    ctx.fillRect(
      -4,
      -4,
      8,
      8
    );


    ctx.restore();
  }
}


/* =========================================================
   FOLLOWER PET
========================================================= */

function drawFollowerPet(
  cam
) {

  const pet =
    activePet();


  if (!pet) return;


  drawPetSprite(
    ctx,

    (
      pet.fx ??
      P.x - 70
    )
    -
    cam,

    pet.fy ??
    P.y - 25,

    pet.name,

    .8,

    G.time
  );
}


/* =========================================================
   WORLD SHADING
========================================================= */

function drawWorldShade() {

  const g =
    ctx.createLinearGradient(
      0,
      0,
      0,
      H
    );


  g.addColorStop(
    0,
    'rgba(0,0,0,0)'
  );


  g.addColorStop(
    .7,
    'rgba(5,9,18,.02)'
  );


  g.addColorStop(
    1,

    G.worldId === 'void'
      ? 'rgba(1,1,8,.52)'
      : 'rgba(3,8,18,.24)'
  );


  ctx.fillStyle =
    g;


  ctx.fillRect(
    0,
    0,
    W,
    H
  );
}


/* =========================================================
   FOREGROUND OCCLUSION
========================================================= */

function drawForegroundWorld(
  cam
) {

  if (
    G.worldId ===
    'earth'
  ) {

    ctx.fillStyle =
      'rgba(13,55,45,.72)';


    for (
      let x = -20;
      x < W + 30;
      x += 28
    ) {

      const h =
        18 +
        Math.sin(
          (
            x +
            cam
          )
          *
          .12
        )
        *
        7;


      ctx.beginPath();


      ctx.moveTo(
        x,
        H
      );


      ctx.lineTo(
        x + 8,
        H - h
      );


      ctx.lineTo(
        x + 14,
        H
      );


      ctx.fill();
    }


    for (
      let x = 1250;
      x <
      WORLDS.earth.width;
      x += 1600
    ) {

      drawTree(
        x,
        620,
        cam,
        'earth',
        true
      );
    }
  }


  if (
    G.worldId ===
    'void'
  ) {

    const fog =
      ctx.createLinearGradient(
        0,
        H - 170,
        0,
        H
      );


    fog.addColorStop(
      0,
      'rgba(20,10,38,0)'
    );


    fog.addColorStop(
      1,
      'rgba(13,5,28,.72)'
    );


    ctx.fillStyle =
      fog;


    ctx.fillRect(
      0,
      H - 170,
      W,
      170
    );
  }


  if (
    G.worldId ===
    'cosmos'
  ) {

    for (
      let i = 0;
      i < 12;
      i++
    ) {

      const x =
        (
          i *
          127 +
          G.time *
          18
        )
        %
        W;


      const y =
        H -
        70 -
        (
          i % 4
        )
        *
        25;


      ctx.globalAlpha =
        .25;


      ellipse(
        ctx,
        x,
        y,
        4,
        4,
        '#9cefff'
      );
    }


    ctx.globalAlpha =
      1;
  }


  if (
    G.worldId ===
    'matrix'
  ) {

    ctx.globalAlpha =
      .14 +
      Math.random() *
      .04;


    ctx.fillStyle =
      '#63f4ef';


    for (
      let i = 0;
      i < 4;
      i++
    ) {

      ctx.fillRect(
        rand(
          0,
          W
        ),

        rand(
          80,
          H - 80
        ),

        rand(
          30,
          120
        ),

        3
      );
    }


    ctx.globalAlpha =
      1;
  }
}


/* =========================================================
   DRAW WORLD
========================================================= */

function drawWorld() {

  const world =
    WORLDS[
      G.worldId
    ];


  const cam =
    G.camera;


  drawWorldBackground(
    world,
    cam
  );


  drawWorldProps(
    world,
    cam
  );


  if (
    G.worldId ===
    'earth'
  ) {

    drawEarthStoryObjects(
      cam
    );
  }


  /*
     Everything is sorted by Y.
     This creates the 2.5D depth effect.
  */

  const renderables =
    [];


  for (
    const item of
    G.pickups
  ) {

    if (
      !item.taken
    ) {

      renderables.push({

        y:
          item.y,

        draw:
          () =>
            drawPickup(
              item,
              cam
            )
      });
    }
  }


  for (
    const enemy of
    G.enemies
  ) {

    if (
      enemy.alive &&
      enemy.world ===
      G.worldId
    ) {

      renderables.push({

        y:
          enemy.y,

        draw:
          () =>
            drawEnemy(
              enemy,
              cam
            )
      });
    }
  }


  if (
    activePet()
  ) {

    renderables.push({

      y:
        activePet().fy ??
        P.y,

      draw:
        () =>
          drawFollowerPet(
            cam
          )
    });
  }


  renderables.push({

    y:
      P.y,

    draw:
      () =>
        drawRiftwalker(
          P.x -
          cam,

          P.y -
          P.jump,

          1,

          false
        )
  });


  renderables.sort(
    (
      a,
      b
    ) =>
      a.y -
      b.y
  );


  for (
    const renderable of
    renderables
  ) {

    renderable.draw();
  }


  drawWorldShade();


  drawForegroundWorld(
    cam
  );
}


/* =========================================================
   HUB BUILDINGS
========================================================= */

function drawHubBuilding(
  x,
  y,
  label,
  color,
  symbol
) {

  contactShadow(
    x,
    y + 8,
    140,
    26,
    .3
  );


  const g =
    ctx.createLinearGradient(
      x - 75,
      y - 125,
      x + 75,
      y
    );


  g.addColorStop(
    0,
    '#fbfdfd'
  );


  g.addColorStop(
    1,
    color
  );


  rr(
    ctx,
    x - 72,
    y - 118,
    144,
    120,
    22,
    g,
    '#42536a',
    5
  );


  ctx.fillStyle =
    '#132035';


  ctx.font =
    '900 11px system-ui';


  ctx.textAlign =
    'center';


  ctx.fillText(
    label,
    x,
    y - 58
  );


  ctx.textAlign =
    'left';


  ctx.save();


  ctx.translate(
    x,
    y - 91
  );


  ctx.strokeStyle =
    '#18324b';


  ctx.lineWidth =
    4;


  if (
    symbol ===
    'paw'
  ) {

    ellipse(
      ctx,
      0,
      4,
      10,
      8,
      '#6cecff',
      '#18324b',
      2
    );


    ellipse(
      ctx,
      -12,
      -7,
      5,
      6,
      '#6cecff'
    );


    ellipse(
      ctx,
      0,
      -11,
      5,
      6,
      '#6cecff'
    );


    ellipse(
      ctx,
      12,
      -7,
      5,
      6,
      '#6cecff'
    );
  }


  else if (
    symbol ===
    'armor'
  ) {

    ctx.fillStyle =
      '#6cecff';


    ctx.beginPath();


    ctx.moveTo(
      -13,
      -12
    );


    ctx.lineTo(
      13,
      -12
    );


    ctx.lineTo(
      18,
      2
    );


    ctx.lineTo(
      0,
      18
    );


    ctx.lineTo(
      -18,
      2
    );


    ctx.closePath();

    ctx.fill();

    ctx.stroke();
  }


  else {

    ctx.rotate(
      Math.PI / 4
    );


    ctx.fillStyle =
      '#6cecff';


    ctx.fillRect(
      -10,
      -10,
      20,
      20
    );


    ctx.strokeRect(
      -10,
      -10,
      20,
      20
    );
  }


  ctx.restore();
}


/* =========================================================
   ASTRA
========================================================= */

function drawAstra(
  x,
  y
) {

  contactShadow(
    x,
    y + 5,
    48,
    11,
    .22
  );


  ctx.save();


  ctx.translate(
    x,
    y
  );


  ellipse(
    ctx,
    0,
    -74,
    27,
    29,
    '#f5f0ff',
    '#33284f',
    4
  );


  rr(
    ctx,
    -20,
    -49,
    40,
    50,
    15,
    '#7d68b5',
    '#33284f',
    4
  );


  ctx.shadowColor =
    '#b58cff';


  ctx.shadowBlur =
    10;


  ellipse(
    ctx,
    -8,
    -76,
    3,
    3,
    '#d7c6ff'
  );


  ellipse(
    ctx,
    8,
    -76,
    3,
    3,
    '#d7c6ff'
  );


  ctx.restore();
}


/* =========================================================
   DRAW HUB
========================================================= */

function drawHub() {

  drawSpace(
    G.time *
    25
  );


  drawPlanet(
    1110,
    150,
    95,
    '#a67eff',
    '#2e286d'
  );


  drawPlanet(
    160,
    115,
    60,
    '#7ce6b1',
    '#245a50'
  );


  ctx.fillStyle =
    '#eef3f2';


  ctx.strokeStyle =
    '#5d7593';


  ctx.lineWidth =
    6;


  ctx.beginPath();


  ctx.ellipse(
    750 -
    G.camera,
    545,
    690,
    170,
    0,
    0,
    Math.PI * 2
  );


  ctx.fill();

  ctx.stroke();


  const island =
    ctx.createLinearGradient(
      0,
      410,
      0,
      700
    );


  island.addColorStop(
    0,
    'rgba(110,230,255,.06)'
  );


  island.addColorStop(
    1,
    'rgba(24,45,72,.25)'
  );


  ctx.fillStyle =
    island;


  ctx.beginPath();


  ctx.ellipse(
    750 -
    G.camera,
    545,
    680,
    160,
    0,
    0,
    Math.PI * 2
  );


  ctx.fill();


  drawHubBuilding(
    350 -
    G.camera,
    505,
    'PET SANCTUARY',
    '#d4b56f',
    'paw'
  );


  drawHubBuilding(
    620 -
    G.camera,
    505,
    'ARMOR',
    '#6a7fa1',
    'armor'
  );


  drawAstra(
    760 -
    G.camera,
    520
  );


  drawHubBuilding(
    980 -
    G.camera,
    505,
    'RIFT MAP',
    '#5fc6d8',
    'rift'
  );


  if (
    activePet()
  ) {

    drawFollowerPet(
      G.camera
    );
  }


  drawRiftwalker(
    P.x -
    G.camera,
    P.y -
    P.jump,
    1,
    false
  );
}


/* =========================================================
   DRAW PARTICLES
========================================================= */

function drawParticles(
  cam = 0
) {

  for (
    const p of
    G.particles
  ) {

    ctx.save();


    ctx.globalAlpha =
      clamp(
        p.life /
        p.maxLife,
        0,
        1
      );


    if (
      p.type ===
      'text'
    ) {

      ctx.fillStyle =
        p.color;


      ctx.font =
        `900 ${p.size}px system-ui`;


      ctx.textAlign =
        'center';


      ctx.fillText(
        p.text,
        p.x -
        cam,
        p.y
      );


      ctx.textAlign =
        'left';
    }


    else if (
      p.type ===
      'star'
    ) {

      ctx.strokeStyle =
        p.color;


      ctx.lineWidth =
        p.size;


      ctx.beginPath();


      ctx.moveTo(
        p.x,
        p.y
      );


      ctx.lineTo(
        p.x + 22,
        p.y
      );


      ctx.stroke();
    }


    else {

      ctx.fillStyle =
        p.color;


      ctx.shadowColor =
        p.color;


      ctx.shadowBlur =
        p.type === 'rift'
          ? 12
          : 7;


      ctx.beginPath();


      ctx.arc(
        p.x -
        cam,
        p.y,
        p.size,
        0,
        Math.PI * 2
      );


      ctx.fill();
    }


    ctx.restore();
  }
}


/* =========================================================
   BONUS MODE
   PRIVATE RIFT ARENA
========================================================= */

const arena = {

  active:
    false,

  bot:
    false,

  remote: {

    x:
      900,

    y:
      530,

    hp:
      500,

    maxHP:
      500,

    facing:
      -1,

    attack:
      0,

    attackIndex:
      0,

    name:
      'RIVAL',

    state:
      'idle',

    animTime:
      0,

    armor:
      'none',

    pet:
      null
  },

  local: {

    hp:
      500,

    maxHP:
      500
  },

  round:
    1,

  wins:
    0,

  losses:
    0,

  lastSend:
    0,

  roundLock:
    0
};


let peer =
  null;


let connection =
  null;


let isHost =
  false;


/* =========================================================
   OPEN BONUS MODE
========================================================= */

function openBonus() {

  closeAllOverlays();


  $('bonusOverlay')
    .classList
    .remove(
      'hidden'
    );


  $('bonusHome')
    .classList
    .add(
      'active'
    );


  $('bonusLobby')
    .classList
    .remove(
      'active'
    );


  G.paused =
    true;


  SFX.resume();

  MUSIC.start();


  const code =
    new URLSearchParams(
      location.search
    )
    .get(
      'fight'
    );


  if (code) {

    $('roomCodeInput')
      .value =
      code;


    networkMessage(
      'Invite detected. Press JOIN FROM LINK / CODE.'
    );
  }
}


/* =========================================================
   CLOSE BONUS MODE
========================================================= */

function closeBonus() {

  disconnectPeer();


  $('bonusOverlay')
    .classList
    .add(
      'hidden'
    );


  G.paused =
    false;
}


/* =========================================================
   CREATE PRIVATE FIGHT
========================================================= */

function createFight() {

  if (
    typeof Peer ===
    'undefined'
  ) {

    networkMessage(
      'Online library could not load. Check your internet connection.'
    );


    return;
  }


  disconnectPeer();


  isHost =
    true;


  peer =
    new Peer();


  networkMessage(
    'Creating private arena...'
  );


  $('bonusHome')
    .classList
    .remove(
      'active'
    );


  $('bonusLobby')
    .classList
    .add(
      'active'
    );


  peer.on(
    'open',
    id => {

      const base =
        location.href
          .split('?')[0]
          .split('#')[0];


      const link =
        base +
        '?fight=' +
        encodeURIComponent(
          id
        );


      $('roomCodeText')
        .textContent =
        id;


      $('inviteLink')
        .value =
        link;


      $('lobbyStatus')
        .textContent =
        'Waiting for opponent...';
    }
  );


  peer.on(
    'connection',
    conn => {

      if (
        connection?.open
      ) {

        conn.close();

        return;
      }


      connection =
        conn;


      setupConnection(
        conn
      );
    }
  );


  peer.on(
    'error',
    err => {

      networkMessage(
        'Connection error: ' +
        err.type
      );
    }
  );
}


/* =========================================================
   JOIN PRIVATE FIGHT
========================================================= */

function joinFight() {

  const id =
    $('roomCodeInput')
      .value
      .trim()

    ||

    new URLSearchParams(
      location.search
    )
    .get(
      'fight'
    );


  if (!id) {

    networkMessage(
      'Paste a room code or open an invite link first.'
    );


    return;
  }


  if (
    typeof Peer ===
    'undefined'
  ) {

    networkMessage(
      'Online library could not load. Check your internet connection.'
    );


    return;
  }


  disconnectPeer();


  isHost =
    false;


  peer =
    new Peer();


  networkMessage(
    'Connecting to arena...'
  );


  peer.on(
    'open',
    () => {

      connection =
        peer.connect(
          id,
          {
            reliable:
              true
          }
        );


      setupConnection(
        connection
      );
    }
  );


  peer.on(
    'error',
    err => {

      networkMessage(
        'Connection error: ' +
        err.type
      );
    }
  );
}


/* =========================================================
   NETWORK CONNECTION
========================================================= */

function setupConnection(
  conn
) {

  conn.on(
    'open',
    () => {

      conn.send({

        type:
          'hello',

        name:
          'RIFTWALKER'
      });


      startArena(
        false
      );
    }
  );


  conn.on(
    'data',
    handleArenaData
  );


  conn.on(
    'close',
    () => {

      if (
        arena.active
      ) {

        toast(
          'RIFT ARENA',
          'Opponent disconnected.'
        );


        setTimeout(
          endArenaToMenu,
          900
        );
      }
    }
  );
}


/* =========================================================
   RECEIVE MULTIPLAYER DATA
========================================================= */

function handleArenaData(
  data
) {

  if (
    !data ||
    typeof data !==
    'object'
  ) {

    return;
  }


  if (
    data.type ===
    'hello'
  ) {

    arena.remote.name =
      data.name ||
      'RIVAL';
  }


  if (
    data.type ===
    'state'
  ) {

    arena.remote.x =
      data.x;


    arena.remote.y =
      data.y;


    arena.remote.facing =
      data.facing;


    arena.remote.hp =
      data.hp;


    arena.remote.maxHP =
      data.maxHP ||
      arena.remote.maxHP;


    arena.remote.attack =
      data.attack ||
      0;


    arena.remote.attackIndex =
      data.attackIndex ||
      0;


    arena.remote.state =
      data.state ||
      'idle';


    arena.remote.animTime =
      data.animTime ||
      0;


    arena.remote.name =
      data.name ||
      arena.remote.name;


    arena.remote.armor =
      data.armor ||
      'none';


    arena.remote.pet =
      data.pet ||
      null;
  }


  if (
    data.type ===
    'attack'
  ) {

    arena.remote.attack =
      .25;


    arena.remote.attackIndex =
      data.attackIndex ||
      0;


    const dx =
      (
        P.x -
        arena.remote.x
      )
      *
      arena.remote.facing;


    if (
      dx > -40 &&
      dx < data.range &&
      Math.abs(
        P.y -
        arena.remote.y
      )
      <
      90
    ) {

      arenaDamageLocal(
        data.damage
      );
    }
  }


  if (
    data.type ===
    'reset'
  ) {

    resetArenaPositions(
      false
    );
  }
}


/* =========================================================
   PRACTICE BOT
========================================================= */

function practiceArena() {

  disconnectPeer();


  arena.bot =
    true;


  startArena(
    true
  );
}


/* =========================================================
   START ARENA
========================================================= */

function startArena(
  bot
) {

  closeAllOverlays();


  $('startScreen')
    .classList
    .add(
      'hidden'
    );


  $('hud')
    .classList
    .add(
      'hidden'
    );


  $('arenaHud')
    .classList
    .remove(
      'hidden'
    );


  G.scene =
    'arena';


  G.paused =
    false;


  G.worldId =
    null;


  arena.active =
    true;


  arena.bot =
    bot;


  arena.round =
    1;


  arena.wins =
    0;


  arena.losses =
    0;


  arena.roundLock =
    0;


  /*
     Bonus Mode reads your Story loadout.
     Story progress itself is not changed by losing.
  */

  P.weapon =
    'Nova Sword';


  const arenaStats =
    getStats();


  arena.local = {

    hp:
      arenaStats.maxHP,

    maxHP:
      arenaStats.maxHP
  };


  arena.remote = {

    x:
      900,

    y:
      530,

    hp:
      bot
        ? 560
        : 500,

    maxHP:
      bot
        ? 560
        : 500,

    facing:
      -1,

    attack:
      0,

    attackIndex:
      0,

    name:
      bot
        ? 'TRAINING BOT'
        : 'RIVAL',

    state:
      'idle',

    animTime:
      0,

    armor:
      bot
        ? 'scout'
        : 'none',

    pet:
      bot
        ? 'Beat Fox'
        : null
  };


  P.x =
    330;


  P.y =
    530;


  P.jump =
    0;


  P.vy =
    0;


  P.onGround =
    true;


  P.hp =
    arena.local.hp;


  P.attackCooldown =
    0;


  MUSIC.setWorld(
    'arena'
  );


  $('arenaP2Name')
    .textContent =
    arena.remote.name;


  $('roundText')
    .textContent =
    'ROUND 1';


  syncArenaHud();


  toast(
    'RIFT ARENA',
    'Fight!'
  );
}


/* =========================================================
   RESET ARENA
========================================================= */

function resetArenaPositions(
  send = true
) {

  arena.local.hp =
    arena.local.maxHP;


  arena.remote.hp =
    arena.remote.maxHP;


  P.x =
    isHost ||
    arena.bot
      ? 330
      : 900;


  P.facing =
    isHost ||
    arena.bot
      ? 1
      : -1;


  P.jump =
    0;


  P.vy =
    0;


  P.onGround =
    true;


  arena.remote.x =
    isHost ||
    arena.bot
      ? 900
      : 330;


  arena.remote.facing =
    isHost ||
    arena.bot
      ? -1
      : 1;


  if (
    send &&
    connection?.open
  ) {

    connection.send({

      type:
        'reset'
    });
  }
}


/* =========================================================
   UPDATE ARENA
========================================================= */

function updateArena(
  dt
) {

  updatePlayer(
    dt,
    1280
  );


  updatePetFollower(
    dt
  );


  updateParticles(
    dt
  );


  updateScreenEffects(
    dt
  );


  arena.remote.attack =
    Math.max(
      0,
      arena.remote.attack -
      dt
    );


  arena.remote.animTime +=
    dt;


  arena.roundLock =
    Math.max(
      0,
      arena.roundLock -
      dt
    );


  /* BOT */

  if (
    arena.bot
  ) {

    const r =
      arena.remote;


    const dx =
      P.x -
      r.x;


    r.facing =
      dx > 0
        ? 1
        : -1;


    if (
      Math.abs(dx) >
      78
    ) {

      r.x +=
        clamp(
          dx *
          1.35,
          -165,
          165
        )
        *
        dt;


      r.state =
        'run';

    }

    else {

      r.state =
        'idle';
    }


    r.botCd =
      (
        r.botCd ||
        .5
      )
      -
      dt;


    if (
      Math.abs(dx) <
      105
      &&
      r.botCd <= 0
      &&
      arena.roundLock <= 0
    ) {

      r.botCd =
        rand(
          .55,
          .85
        );


      r.attack =
        .25;


      r.attackIndex =
        (
          r.attackIndex +
          1
        )
        %
        3;


      r.state =
        'attack';


      arenaDamageLocal(
        randi(
          32,
          48
        )
      );
    }
  }


  /* ONLINE */

  else if (
    connection?.open
  ) {

    arena.lastSend -=
      dt;


    if (
      arena.lastSend <=
      0
    ) {

      arena.lastSend =
        .05;


      connection.send({

        type:
          'state',

        x:
          P.x,

        y:
          P.y,

        facing:
          P.facing,

        hp:
          arena.local.hp,

        maxHP:
          arena.local.maxHP,

        attack:
          P.attackTimer,

        attackIndex:
          P.attackIndex,

        state:
          P.anim.state,

        animTime:
          P.anim.time,

        name:
          'RIFTWALKER',

        armor:
          P.armor,

        pet:
          PET_STATE.active
      });
    }
  }


  if (
    arena.roundLock <= 0
    &&
    (
      arena.local.hp <= 0 ||
      arena.remote.hp <= 0
    )
  ) {

    finishArenaRound();
  }


  syncArenaHud();
}


/* =========================================================
   ARENA PLAYER ATTACK
========================================================= */

function arenaLocalAttack(
  range,
  damage
) {

  const r =
    arena.remote;


  const dx =
    (
      r.x -
      P.x
    )
    *
    P.facing;


  if (
    dx > -40 &&
    dx < range &&
    Math.abs(
      r.y -
      P.y
    )
    <
    90
  ) {

    if (
      arena.bot
    ) {

      r.hp =
        Math.max(
          0,
          r.hp -
          damage
        );


      burst(
        r.x,
        r.y - 50,
        '#ff7589',
        8
      );


      SFX.hit();


      G.screenShake =
        P.attackIndex === 2
          ? 8
          : 4;
    }
  }


  if (
    connection?.open
  ) {

    connection.send({

      type:
        'attack',

      range,

      damage,

      attackIndex:
        P.attackIndex
    });
  }
}


/* =========================================================
   ARENA DAMAGE
========================================================= */

function arenaDamageLocal(
  damage
) {

  if (
    arena.roundLock >
    0
  ) {

    return;
  }


  const finalDamage =
    Math.max(
      1,

      Math.round(
        damage -
        getStats().def *
        .25
      )
    );


  arena.local.hp =
    Math.max(
      0,
      arena.local.hp -
      finalDamage
    );


  P.hitFlash =
    .18;


  G.screenShake =
    7;


  G.flash =
    .06;


  SFX.hurt();


  burst(
    P.x,
    P.y - 55,
    '#ff7589',
    8
  );


  floatingText(
    '-' +
    finalDamage,
    P.x,
    P.y - 105,
    '#ff8794'
  );


  syncArenaHud();
}


/* =========================================================
   FINISH ARENA ROUND
========================================================= */

function finishArenaRound() {

  arena.roundLock =
    1.1;


  const won =
    arena.remote.hp <= 0 &&
    arena.local.hp > 0;


  if (won) {

    arena.wins++;

  }

  else {

    arena.losses++;
  }


  $('roundText')
    .textContent =
    won
      ? 'ROUND WON'
      : 'ROUND LOST';


  toast(
    won
      ? 'ROUND WON'
      : 'ROUND LOST',

    `Score ${arena.wins} - ${arena.losses}`
  );


  setTimeout(
    () => {

      if (
        !arena.active
      ) {

        return;
      }


      /* BEST OF 3 */

      if (
        arena.wins >= 2 ||
        arena.losses >= 2
      ) {

        const matchWon =
          arena.wins >= 2;


        $('roundText')
          .textContent =
          matchWon
            ? 'MATCH WON'
            : 'MATCH LOST';


        toast(
          matchWon
            ? 'RIFT VICTORY'
            : 'MATCH COMPLETE',

          `Final score ${arena.wins} - ${arena.losses}`,

          3500
        );


        setTimeout(
          () => {

            arena.round =
              1;


            arena.wins =
              0;


            arena.losses =
              0;


            resetArenaPositions();


            $('roundText')
              .textContent =
              'REMATCH · ROUND 1';

          },
          2200
        );

      }

      else {

        arena.round++;


        resetArenaPositions();


        $('roundText')
          .textContent =
          'ROUND ' +
          arena.round;
      }

    },
    1100
  );
}


/* =========================================================
   ARENA HUD
========================================================= */

function syncArenaHud() {

  const a =
    clamp(
      arena.local.hp /
      arena.local.maxHP,
      0,
      1
    );


  const b =
    clamp(
      arena.remote.hp /
      arena.remote.maxHP,
      0,
      1
    );


  $('arenaP1Hp')
    .style
    .width =
    a *
    100 +
    '%';


  $('arenaP2Hp')
    .style
    .width =
    b *
    100 +
    '%';


  $('arenaP1Text')
    .textContent =
    Math.round(
      arena.local.hp
    )
    +
    ' / ' +
    arena.local.maxHP;


  $('arenaP2Text')
    .textContent =
    Math.round(
      arena.remote.hp
    )
    +
    ' / ' +
    arena.remote.maxHP;


  $('arenaP2Name')
    .textContent =
    arena.remote.name;
}


/* =========================================================
   DRAW RIFT ARENA
========================================================= */

function drawArena() {

  const g =
    ctx.createLinearGradient(
      0,
      0,
      0,
      H
    );


  g.addColorStop(
    0,
    '#151d3b'
  );


  g.addColorStop(
    .55,
    '#334b70'
  );


  g.addColorStop(
    1,
    '#1b2736'
  );


  ctx.fillStyle =
    g;


  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  ctx.fillStyle =
    '#26384a';


  ctx.fillRect(
    0,
    400,
    W,
    320
  );


  /* BACKGROUND LIGHTS */

  for (
    let i = 0;
    i < 8;
    i++
  ) {

    ctx.globalAlpha =
      .16;


    ctx.fillStyle =
      i % 2
        ? '#6cecff'
        : '#9b72ff';


    ctx.beginPath();


    ctx.moveTo(
      i *
      180,
      400
    );


    ctx.lineTo(
      i *
      180 +
      100,
      250
    );


    ctx.lineTo(
      i *
      180 +
      200,
      400
    );


    ctx.fill();
  }


  ctx.globalAlpha =
    1;


  /* FLOOR GRID */

  ctx.strokeStyle =
    'rgba(112,232,255,.2)';


  ctx.lineWidth =
    2;


  for (
    let x = 0;
    x < W;
    x += 80
  ) {

    ctx.beginPath();


    ctx.moveTo(
      x,
      400
    );


    ctx.lineTo(
      x + 130,
      H
    );


    ctx.stroke();
  }


  /* PETS */

  if (
    PET_STATE.active
  ) {

    drawPetSprite(
      ctx,

      P.x -
      P.facing *
      72,

      P.y - 18,

      PET_STATE.active,

      .72,

      G.time
    );
  }


  if (
    arena.remote.pet
  ) {

    drawPetSprite(
      ctx,

      arena.remote.x -
      arena.remote.facing *
      72,

      arena.remote.y - 18,

      arena.remote.pet,

      .72,

      G.time
    );
  }


  /* FIGHTERS */

  drawRiftwalker(
    P.x,
    P.y -
    P.jump,
    1,
    false
  );


  drawRiftwalker(
    arena.remote.x,
    arena.remote.y,
    1,
    true,
    arena.remote
  );


  drawParticles(
    0
  );


  syncArenaHud();
}


/* =========================================================
   END ARENA
========================================================= */

function endArenaToMenu() {

  arena.active =
    false;


  arena.bot =
    false;


  disconnectPeer();


  $('arenaHud')
    .classList
    .add(
      'hidden'
    );


  $('hud')
    .classList
    .add(
      'hidden'
    );


  $('startScreen')
    .classList
    .remove(
      'hidden'
    );


  G.scene =
    'menu';


  G.paused =
    false;


  MUSIC.setWorld(
    'hub'
  );
}


/* =========================================================
   DISCONNECT ONLINE
========================================================= */

function disconnectPeer() {

  try {

    connection?.close();

  }

  catch (_) {}


  try {

    peer?.destroy();

  }

  catch (_) {}


  connection =
    null;


  peer =
    null;
}


/* =========================================================
   NETWORK MESSAGE
========================================================= */

function networkMessage(
  text
) {

  if (
    $('networkStatus')
  ) {

    $('networkStatus')
      .textContent =
      text;
  }


  if (
    $('lobbyStatus')
  ) {

    $('lobbyStatus')
      .textContent =
      text;
  }
}


/* =========================================================
   BUTTON EVENTS
========================================================= */

$('newBtn')
  .addEventListener(
    'click',
    () => {

      SFX.resume();

      MUSIC.start();

      resetGame();
    }
  );


$('loadBtn')
  .addEventListener(
    'click',
    () => {

      SFX.resume();

      MUSIC.start();

      loadGame();
    }
  );


$('bonusBtn')
  .addEventListener(
    'click',
    openBonus
  );


$('closeBonus')
  .addEventListener(
    'click',
    closeBonus
  );


$('createFightBtn')
  .addEventListener(
    'click',
    createFight
  );


$('joinFightBtn')
  .addEventListener(
    'click',
    joinFight
  );


$('practiceBtn')
  .addEventListener(
    'click',
    practiceArena
  );


$('cancelLobbyBtn')
  .addEventListener(
    'click',
    () => {

      disconnectPeer();


      $('bonusLobby')
        .classList
        .remove(
          'active'
        );


      $('bonusHome')
        .classList
        .add(
          'active'
        );
    }
  );


$('copyInviteBtn')
  .addEventListener(
    'click',
    async () => {

      try {

        await navigator
          .clipboard
          .writeText(
            $('inviteLink')
              .value
          );


        $('copyInviteBtn')
          .textContent =
          'COPIED';


        setTimeout(
          () => {

            $('copyInviteBtn')
              .textContent =
              'COPY LINK';

          },
          1200
        );

      }

      catch (_) {

        $('inviteLink')
          .select();


        networkMessage(
          'Select the link and copy it manually.'
        );
      }
    }
  );


/* =========================================================
   MAIN UPDATE
========================================================= */

function update(
  dt
) {

  G.time +=
    dt;


  if (
    G.paused
  ) {

    drawHudIcons();

    justPressed.clear();

    return;
  }


  if (
    G.scene ===
    'flight'
  ) {

    updateOpeningFlight(
      dt
    );
  }


  else if (
    G.scene ===
    'crash'
  ) {

    updateCrash(
      dt
    );
  }


  else if (
    G.scene ===
    'hubFlight'
  ) {

    updateHubFlight(
      dt
    );
  }


  else if (
    G.scene ===
    'travel'
  ) {

    updateTravel(
      dt
    );
  }


  else if (
    G.scene ===
    'hub'
  ) {

    updatePetFollower(
      dt
    );


    updateHub(
      dt
    );
  }


  else if (
    G.scene ===
    'world'
  ) {

    updatePetFollower(
      dt
    );


    updateWorld(
      dt
    );
  }


  else if (
    G.scene ===
    'arena'
  ) {

    updateArena(
      dt
    );
  }


  drawHudIcons();


  justPressed.clear();
}


/* =========================================================
   OPENING CINEMATIC
========================================================= */

function drawOpeningFlight() {

  drawSpace(
    G.sceneTime *
    120
  );


  drawPlanet(
    1080,
    120,
    70,
    '#a27aff',
    '#332463'
  );


  drawShip(
    380,
    360,
    1.25,
    Math.sin(
      G.time
    )
    *
    .02
  );


  const text =
    G.sceneTime < 1.3
      ? 'DEEP SPACE'
      : (
          G.sceneTime < 2.8
            ? 'UNKNOWN SIGNAL DETECTED'
            : (
                G.sceneTime < 4
                  ? 'SYSTEM FAILURE'
                  : 'RIFT COLLISION'
              )
        );


  ctx.fillStyle =
    '#ffffff';


  ctx.font =
    '900 24px system-ui';


  ctx.textAlign =
    'center';


  ctx.fillText(
    text,
    W / 2,
    100
  );


  ctx.textAlign =
    'left';
}


/* =========================================================
   CRASH CINEMATIC
========================================================= */

function drawCrash() {

  const p =
    clamp(
      G.sceneTime /
      1.6,
      0,
      1
    );


  const sky =
    ctx.createLinearGradient(
      0,
      0,
      0,
      H
    );


  sky.addColorStop(
    0,
    '#1a2841'
  );


  sky.addColorStop(
    1,
    '#7bbd9d'
  );


  ctx.fillStyle =
    sky;


  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  drawPlanet(
    W / 2,

    lerp(
      850,
      470,
      p
    ),

    lerp(
      240,
      760,
      p
    ),

    '#91e6a3',

    '#255d48'
  );


  drawShip(
    W / 2,

    lerp(
      120,
      560,
      p
    ),

    1.35,

    p *
    2.2
  );


  ctx.fillStyle =
    '#ffffff';


  ctx.font =
    '900 26px system-ui';


  ctx.textAlign =
    'center';


  ctx.fillText(
    'IMPACT IMMINENT',
    W / 2,
    90
  );


  ctx.textAlign =
    'left';
}


/* =========================================================
   HUB DISCOVERY FLIGHT
========================================================= */

function drawHubFlight() {

  drawSpace(
    G.time *
    130
  );


  const p =
    clamp(
      G.sceneTime /
      2.8,
      0,
      1
    );


  ctx.shadowColor =
    '#7ceeff';


  ctx.shadowBlur =
    30;


  ctx.strokeStyle =
    '#7ceeff';


  ctx.lineWidth =
    12;


  ctx.beginPath();


  ctx.arc(
    W / 2,
    340,
    80 +
    p *
    170,
    0,
    Math.PI * 2
  );


  ctx.stroke();


  ctx.shadowBlur =
    0;


  drawShip(
    W / 2,

    520 -
    p *
    120,

    1.1 -
    p *
    .25,

    -Math.PI / 2
  );


  ctx.fillStyle =
    '#ffffff';


  ctx.font =
    '900 18px system-ui';


  ctx.textAlign =
    'center';


  ctx.fillText(
    'FOLLOWING UNKNOWN SIGNAL',
    W / 2,
    90
  );


  ctx.textAlign =
    'left';
}


/* =========================================================
   RIFT TRAVEL
========================================================= */

function drawTravel() {

  drawSpace(
    G.time *
    160
  );


  for (
    let i = 0;
    i < 8;
    i++
  ) {

    ctx.strokeStyle =
      i % 2
        ? 'rgba(108,236,255,.24)'
        : 'rgba(156,114,255,.22)';


    ctx.lineWidth =
      3;


    ctx.beginPath();


    ctx.arc(
      W / 2,
      H / 2,

      80 +
      i *
      55
      +
      Math.sin(
        G.time *
        4 +
        i
      )
      *
      10,

      0,
      Math.PI * 2
    );


    ctx.stroke();
  }


  drawShip(
    W / 2,
    360,
    1.2,
    0
  );


  rr(
    ctx,
    380,
    610,
    520,
    14,
    7,
    '#122039'
  );


  rr(
    ctx,
    380,
    610,

    520 *
    clamp(
      G.sceneTime /
      1.65,
      0,
      1
    ),

    14,
    7,
    '#6fe1ff'
  );


  ctx.fillStyle =
    '#ffffff';


  ctx.font =
    '900 14px system-ui';


  ctx.textAlign =
    'center';


  ctx.fillText(
    'TRAVELLING THROUGH THE RIFT',
    W / 2,
    590
  );


  ctx.textAlign =
    'left';
}


/* =========================================================
   MAIN DRAW
========================================================= */

function draw() {

  ctx.save();


  if (
    G.screenShake >
    0
  ) {

    ctx.translate(

      rand(
        -G.screenShake,
        G.screenShake
      ),

      rand(
        -G.screenShake,
        G.screenShake
      )
    );
  }


  if (
    G.scene ===
    'menu'
  ) {

    drawSpace(
      G.time *
      25
    );


    drawPlanet(
      180,
      170,
      95,
      '#77d99a',
      '#1f5e48'
    );


    drawPlanet(
      1080,
      210,
      145,
      '#b06bdf',
      '#3a245e'
    );
  }


  else if (
    G.scene ===
    'flight'
  ) {

    drawOpeningFlight();
  }


  else if (
    G.scene ===
    'crash'
  ) {

    drawCrash();
  }


  else if (
    G.scene ===
    'hubFlight'
  ) {

    drawHubFlight();
  }


  else if (
    G.scene ===
    'travel'
  ) {

    drawTravel();
  }


  else if (
    G.scene ===
    'hub'
  ) {

    drawHub();


    drawParticles(
      G.camera
    );
  }


  else if (
    G.scene ===
    'world'
  ) {

    drawWorld();


    drawParticles(
      G.camera
    );
  }


  else if (
    G.scene ===
    'arena'
  ) {

    drawArena();
  }


  if (
    G.flash >
    0
  ) {

    ctx.fillStyle =
      `rgba(255,255,255,${
        G.flash *
        4
      })`;


    ctx.fillRect(
      0,
      0,
      W,
      H
    );
  }


  ctx.restore();
}


/* =========================================================
   AUTO DETECT FIGHT LINK
========================================================= */

const fightParam =
  new URLSearchParams(
    location.search
  )
  .get(
    'fight'
  );


if (
  fightParam
) {

  setTimeout(
    openBonus,
    80
  );
}


/* =========================================================
   MAIN GAME LOOP
========================================================= */

let lastFrame =
  performance.now();


function gameLoop(
  now
) {

  const dt =
    Math.min(
      .033,

      Math.max(
        0,
        (
          now -
          lastFrame
        )
        /
        1000
      )
    );


  lastFrame =
    now;


  update(
    dt
  );


  draw();


  requestAnimationFrame(
    gameLoop
  );
}


/* =========================================================
   START
========================================================= */

syncHUD();

drawHudIcons();

requestAnimationFrame(
  gameLoop
);
