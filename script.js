'use strict';

/* =========================================================
   MULTIVERSE: RIFTWALKER
   Full browser prototype
   - 7 worlds + The Hub
   - 1000 HP stat system
   - armor + pet bonuses
   - attack cooldown + animated Nova Sword combo + critical hits
   - command tutorial + one-life stages
   - Rift Credits
   - custom-drawn 2.5D visuals (no emoji game art)
   - procedural SFX + "Across the Rift" adaptive music
   - private WebRTC Bonus Mode through PeerJS
   ========================================================= */

const $ = id => document.getElementById(id);
const canvas = $('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const lerp = (a,b,t) => a+(b-a)*t;
const dist = (a,b,c,d) => Math.hypot(a-c,b-d);
const rand = (a,b) => a + Math.random()*(b-a);
const randi = (a,b) => Math.floor(rand(a,b+1));

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
  earth:{
    name:'Earth 2.0',
    width:5400,
    skyA:'#75c9ef',
    skyB:'#d9eaa4',
    ground:'#4e9d68',
    dark:'#153b39',
    boss:'Ruin Guardian',
    mechanic:'Crash Survival',
    desc:'Repair your ship, explore ancient ruins and survive the Guardian.',
    accent:'#6ee0a0'
  },

  music:{
    name:'Music Verse',
    width:5200,
    skyA:'#2a226b',
    skyB:'#bd5bbf',
    ground:'#b9429f',
    dark:'#211448',
    boss:'Silence King',
    mechanic:'Rhythm Energy',
    desc:'Restore sound to districts controlled by the Silence King.',
    accent:'#6cecff'
  },

  money:{
    name:'Money Village',
    width:5200,
    skyA:'#5aa884',
    skyB:'#e2c66f',
    ground:'#b38a3d',
    dark:'#334329',
    boss:'Greed Golem',
    mechanic:'Trade & Treasure',
    desc:'Explore markets, vaults and mines while rebuilding the village economy.',
    accent:'#f2d36d'
  },

  cosmos:{
    name:'The Cosmos',
    width:5400,
    skyA:'#07132d',
    skyB:'#32296f',
    ground:'#5c55a8',
    dark:'#080d2b',
    boss:'Gravity Maw',
    mechanic:'Low Gravity',
    desc:'Cross floating stations and recover the Astral Core.',
    accent:'#92b8ff'
  },

  war:{
    name:'The War Zone',
    width:5300,
    skyA:'#44373e',
    skyB:'#9d5a40',
    ground:'#765342',
    dark:'#2b1c1d',
    boss:'War Machine',
    mechanic:'Battle Pressure',
    desc:'Destroy war beacons and shut down the Titan Factory.',
    accent:'#ff8c61'
  },

  void:{
    name:'The Void',
    width:5200,
    skyA:'#070511',
    skyB:'#25123b',
    ground:'#2b173e',
    dark:'#030207',
    boss:'Abyss Warden',
    mechanic:'Darkness',
    desc:'Use light, pets and instinct to cross the Abyss.',
    accent:'#a478ff'
  },

  matrix:{
    name:'The Perfect Matrix',
    width:5400,
    skyA:'#071b2b',
    skyB:'#382268',
    ground:'#263c56',
    dark:'#05071a',
    boss:'Perfect Error',
    mechanic:'Reality Glitch',
    desc:'Repair corrupted reality and confront the Perfect Error.',
    accent:'#5af3ef'
  }
};


/* =========================================================
   PETS
   ========================================================= */

const PET_ROSTERS = {
  earth:[
    'Lucky Rabbit',
    'Moss Shell',
    'Glow Gecko',
    'Sky Finch',
    'Bounce Frog',
    'Ruin Pup',
    'Crystal Fawn',
    'Terra Sprout'
  ],

  music:[
    'Beat Fox',
    'Tempo Bunny',
    'Melody Bird',
    'Bass Cat',
    'Drum Frog',
    'Harmony Butterfly',
    'Chord Whelp',
    'Echo Pup'
  ],

  money:[
    'Coin Hamster',
    'Piggy Pal',
    'Savings Squirrel',
    'Golden Duck',
    'Bargain Hound',
    'Profit Bee',
    'Merchant Fox',
    'Ledger Owl'
  ],

  cosmos:[
    'Starling',
    'Nebula Cat',
    'Cosmic Squid',
    'Galaxy Moth',
    'Star Whale Calf',
    'Comet Pup',
    'Moon Hare',
    'Astral Dragon'
  ],

  war:[
    'Scout Hound',
    'Radar Hawk',
    'Iron Shell',
    'Charge Boar',
    'Valor Eagle',
    'Battle Wolf',
    'Medic Bot',
    'Titan Lion'
  ],

  void:[
    'Void Eye',
    'Shadow Cat',
    'Null Bat',
    'Abyss Blob',
    'Rift Spider',
    'Void Pup',
    'Darkling',
    'Abyss Dragon'
  ],

  matrix:[
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
  'Lucky Rabbit':'Light / Nature',
  'Moss Shell':'Nature / Earth',
  'Glow Gecko':'Light',
  'Sky Finch':'Light',
  'Bounce Frog':'Nature / Earth',
  'Ruin Pup':'Earth',
  'Crystal Fawn':'Light',
  'Terra Sprout':'Nature',

  'Beat Fox':'Sound',
  'Tempo Bunny':'Sound / Light',
  'Melody Bird':'Sound',
  'Bass Cat':'Sound',
  'Drum Frog':'Sound / Earth',
  'Harmony Butterfly':'Sound / Light',
  'Chord Whelp':'Sound / Cosmic',
  'Echo Pup':'Sound',

  'Coin Hamster':'Light',
  'Piggy Pal':'Earth',
  'Savings Squirrel':'Light / Nature',
  'Golden Duck':'Light',
  'Bargain Hound':'Light / Earth',
  'Profit Bee':'Nature / Light',
  'Merchant Fox':'Light',
  'Ledger Owl':'Tech / Light',

  'Starling':'Cosmic',
  'Nebula Cat':'Cosmic',
  'Cosmic Squid':'Cosmic / Void',
  'Galaxy Moth':'Cosmic / Light',
  'Star Whale Calf':'Cosmic / Water',
  'Comet Pup':'Cosmic / Fire',
  'Moon Hare':'Cosmic / Light',
  'Astral Dragon':'Cosmic / Spirit',

  'Scout Hound':'Earth',
  'Radar Hawk':'Tech',
  'Iron Shell':'Earth / Tech',
  'Charge Boar':'Fire / Earth',
  'Valor Eagle':'Light / Fire',
  'Battle Wolf':'Earth / Fire',
  'Medic Bot':'Tech',
  'Titan Lion':'Fire / Light',

  'Void Eye':'Void',
  'Shadow Cat':'Dark',
  'Null Bat':'Dark / Void',
  'Abyss Blob':'Void',
  'Rift Spider':'Void',
  'Void Pup':'Void / Dark',
  'Darkling':'Dark',
  'Abyss Dragon':'Void / Fire',

  'Byte Cat':'Tech / Glitch',
  'Pixel Rabbit':'Glitch / Light',
  'Code Fox':'Glitch / Tech',
  'Data Serpent':'Glitch',
  'Vector Bird':'Tech / Light',
  'Patch Bot':'Tech',
  'Glitchling':'Glitch',
  'Perfect Entity':'Glitch / Spirit'
};


const PET_BONUS = {
  'Lucky Rabbit':{
    hp:30,
    speed:10
  },

  'Moss Shell':{
    hp:100,
    def:25,
    speed:-5
  },

  'Glow Gecko':{
    hp:20,
    atk:8,
    speed:15
  },

  'Sky Finch':{
    atk:5,
    speed:35
  },

  'Bounce Frog':{
    hp:40,
    def:5,
    speed:25
  },

  'Ruin Pup':{
    hp:50,
    atk:15,
    def:12,
    speed:5
  },

  'Crystal Fawn':{
    hp:120,
    def:10
  },

  'Terra Sprout':{
    hp:150,
    def:18,
    speed:-5
  },

  'Beat Fox':{
    hp:20,
    atk:25,
    speed:15,
    cooldown:.90
  },

  'Tempo Bunny':{
    hp:10,
    atk:10,
    speed:35,
    cooldown:.88
  },

  'Melody Bird':{
    atk:14,
    speed:18
  },

  'Bass Cat':{
    hp:40,
    atk:30,
    def:5
  },

  'Drum Frog':{
    hp:60,
    atk:18,
    def:12
  },

  'Harmony Butterfly':{
    hp:60,
    atk:5,
    def:10,
    speed:15
  },

  'Chord Whelp':{
    hp:90,
    atk:24,
    def:10
  },

  'Echo Pup':{
    hp:35,
    atk:10,
    speed:10
  },

  'Coin Hamster':{
    hp:25,
    speed:8
  },

  'Piggy Pal':{
    hp:100,
    def:14
  },

  'Savings Squirrel':{
    hp:40,
    speed:18
  },

  'Golden Duck':{
    hp:55,
    def:8
  },

  'Bargain Hound':{
    hp:50,
    def:10
  },

  'Profit Bee':{
    hp:35,
    speed:22
  },

  'Merchant Fox':{
    atk:10,
    speed:20
  },

  'Ledger Owl':{
    def:8,
    speed:14
  },

  'Starling':{
    hp:20,
    atk:10,
    speed:30
  },

  'Nebula Cat':{
    hp:40,
    atk:15,
    def:5,
    speed:35
  },

  'Cosmic Squid':{
    hp:70,
    atk:20
  },

  'Galaxy Moth':{
    hp:30,
    speed:28
  },

  'Star Whale Calf':{
    hp:180,
    def:25,
    speed:-10
  },

  'Comet Pup':{
    atk:25,
    speed:30
  },

  'Moon Hare':{
    hp:40,
    speed:30
  },

  'Astral Dragon':{
    hp:130,
    atk:38,
    def:16
  },

  'Scout Hound':{
    hp:50,
    atk:10,
    def:8,
    speed:20
  },

  'Radar Hawk':{
    atk:10,
    speed:25
  },

  'Iron Shell':{
    hp:180,
    def:35,
    speed:-15
  },

  'Charge Boar':{
    hp:100,
    atk:22,
    def:10
  },

  'Valor Eagle':{
    atk:28,
    speed:15
  },

  'Battle Wolf':{
    hp:70,
    atk:30,
    def:10,
    speed:10
  },

  'Medic Bot':{
    hp:140,
    def:15
  },

  'Titan Lion':{
    hp:140,
    atk:35,
    def:18
  },

  'Void Eye':{
    atk:10,
    def:8
  },

  'Shadow Cat':{
    hp:20,
    atk:20,
    speed:35
  },

  'Null Bat':{
    atk:22,
    speed:18
  },

  'Abyss Blob':{
    hp:130,
    def:24,
    speed:-8
  },

  'Rift Spider':{
    atk:20,
    speed:24
  },

  'Void Pup':{
    hp:80,
    atk:25,
    def:10,
    speed:15
  },

  'Darkling':{
    atk:18,
    speed:22
  },

  'Abyss Dragon':{
    hp:120,
    atk:45,
    def:20,
    speed:5
  },

  'Byte Cat':{
    hp:50,
    atk:20,
    def:5,
    speed:30
  },

  'Pixel Rabbit':{
    hp:40,
    speed:32
  },

  'Code Fox':{
    atk:25,
    speed:20
  },

  'Data Serpent':{
    atk:24,
    def:8
  },

  'Vector Bird':{
    atk:18,
    speed:28
  },

  'Patch Bot':{
    hp:120,
    def:25
  },

  'Glitchling':{
    atk:30,
    speed:18
  },

  'Perfect Entity':{
    hp:200,
    atk:40,
    def:35,
    speed:30,
    cooldown:.84
  }
};


/* =========================================================
   ARMOR
   ========================================================= */

const ARMORS = {
  none:{
    name:'No Armor',
    hp:0,
    atk:0,
    def:0,
    speed:0,
    price:0,
    unlocked:true
  },

  scout:{
    name:'Scout Armor',
    hp:40,
    atk:0,
    def:8,
    speed:25,
    price:750,
    unlocked:false
  },

  rift:{
    name:'Rift Armor',
    hp:100,
    atk:12,
    def:20,
    speed:0,
    price:2500,
    unlocked:false
  },

  titan:{
    name:'Titan Armor',
    hp:200,
    atk:5,
    def:40,
    speed:-20,
    price:6000,
    unlocked:false
  },

  void:{
    name:'Void Armor',
    hp:80,
    atk:25,
    def:18,
    speed:15,
    price:8500,
    unlocked:false
  },

  matrix:{
    name:'Perfect Matrix Armor',
    hp:150,
    atk:35,
    def:30,
    speed:35,
    price:14000,
    unlocked:false
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
   EASTER EGGS / SECRETS
   ========================================================= */

const EASTER_EGGS = [

  // EARTH 2.0

  {
    id:'earth_scarf',
    world:'earth',
    x:820,
    y:455,
    name:'Prototype Scarf',
    msg:'A tiny red scarf is tied to an old branch. The tag reads: V0.1.',
    art:'scarf',
    reward:75
  },

  {
    id:'earth_cart',
    world:'earth',
    x:1880,
    y:610,
    name:'Ancient Game Cartridge',
    msg:'Somehow this survived the old world. The label only says: INSERT COIN.',
    art:'cartridge',
    reward:100
  },

  {
    id:'earth_smile',
    world:'earth',
    x:3090,
    y:445,
    name:'Smiling Ruin',
    msg:'Someone carved a smile into the ruins long before you arrived.',
    art:'smile',
    reward:90
  },

  {
    id:'earth_coffee',
    world:'earth',
    x:4380,
    y:605,
    name:'Cold Developer Coffee',
    msg:'Still cold. Still unfinished. Somehow still powerful.',
    art:'coffee',
    reward:125
  },

  // MUSIC VERSE

  {
    id:'music_silent',
    world:'music',
    x:760,
    y:610,
    name:'The Silent Note',
    msg:'A musical note that makes absolutely no sound.',
    art:'note',
    reward:100
  },

  {
    id:'music_record',
    world:'music',
    x:1760,
    y:445,
    name:'Backwards Record',
    msg:'The record spins backwards. You swear it whispered your name.',
    art:'record',
    reward:125
  },

  {
    id:'music_metro',
    world:'music',
    x:3210,
    y:610,
    name:'Golden Metronome',
    msg:'It ticks perfectly in time with your footsteps.',
    art:'metronome',
    reward:150
  },

  {
    id:'music_pixel',
    world:'music',
    x:4470,
    y:450,
    name:'8-Bit Melody',
    msg:'Four tiny pixels play a melody from a game that never existed.',
    art:'pixel',
    reward:175
  },

  // MONEY VILLAGE

  {
    id:'money_coin',
    world:'money',
    x:690,
    y:450,
    name:'The First Rift Credit',
    msg:'Serial number: 00000001. Definitely not for spending.',
    art:'coin',
    reward:111
  },

  {
    id:'money_pig',
    world:'money',
    x:1670,
    y:610,
    name:'Emergency Piggy',
    msg:'A secret piggy bank marked: DO NOT BREAK UNLESS BOSS FIGHT.',
    art:'pig',
    reward:150
  },

  {
    id:'money_receipt',
    world:'money',
    x:3020,
    y:445,
    name:'Infinite Receipt',
    msg:'The receipt keeps printing. Total: somehow still zero.',
    art:'receipt',
    reward:175
  },

  {
    id:'money_cat',
    world:'money',
    x:4380,
    y:610,
    name:'Market Cat',
    msg:'It has been watching every transaction. Suspiciously wealthy.',
    art:'cat',
    reward:200
  },

  // THE COSMOS

  {
    id:'cosmos_flag',
    world:'cosmos',
    x:780,
    y:610,
    name:'Tiny Explorer Flag',
    msg:'A tiny flag from an explorer who clearly got here first.',
    art:'flag',
    reward:150
  },

  {
    id:'cosmos_helmet',
    world:'cosmos',
    x:1920,
    y:450,
    name:'Lost Space Helmet',
    msg:'The visor reflects a star that is not in the sky.',
    art:'helmet',
    reward:175
  },

  {
    id:'cosmos_sat',
    world:'cosmos',
    x:3360,
    y:605,
    name:'Pocket Satellite',
    msg:'It is broadcasting one message: HELLO, RIFTWALKER.',
    art:'satellite',
    reward:200
  },

  {
    id:'cosmos_whale',
    world:'cosmos',
    x:4690,
    y:450,
    name:'Star Whale Toy',
    msg:'A tiny carved whale drifts as if gravity forgot about it.',
    art:'whale',
    reward:225
  },

  // WAR ZONE

  {
    id:'war_sword',
    world:'war',
    x:730,
    y:610,
    name:'Cardboard Sword',
    msg:'A legendary weapon made from extremely non-legendary cardboard.',
    art:'sword',
    reward:150
  },

  {
    id:'war_duck',
    world:'war',
    x:1850,
    y:445,
    name:'Armored Bath Duck',
    msg:'Its tiny helmet has three confirmed scratches and zero fear.',
    art:'duck',
    reward:175
  },

  {
    id:'war_radio',
    world:'war',
    x:3260,
    y:610,
    name:'Old Field Radio',
    msg:'Static... then a voice says: You found me.',
    art:'radio',
    reward:200
  },

  {
    id:'war_flower',
    world:'war',
    x:4540,
    y:450,
    name:'Impossible Flower',
    msg:'A single flower growing where nothing else survived.',
    art:'flower',
    reward:250
  },

  // THE VOID

  {
    id:'void_eye',
    world:'void',
    x:720,
    y:610,
    name:'The Eye That Blinked',
    msg:'You looked at it. It looked back. That seems bad.',
    art:'eye',
    reward:175
  },

  {
    id:'void_candle',
    world:'void',
    x:1740,
    y:445,
    name:'Unending Candle',
    msg:'A flame burns here without heat, fuel or explanation.',
    art:'candle',
    reward:200
  },

  {
    id:'void_door',
    world:'void',
    x:3110,
    y:610,
    name:'Tiny Door',
    msg:'It is far too small for you. Something knocked from the other side.',
    art:'door',
    reward:250
  },

  {
    id:'void_star',
    world:'void',
    x:4420,
    y:450,
    name:'Lost Star',
    msg:'A star fell into the Void and apparently decided to stay.',
    art:'star',
    reward:300
  },

  // PERFECT MATRIX

  {
    id:'matrix_bug',
    world:'matrix',
    x:750,
    y:610,
    name:'Actual Bug',
    msg:'Not a software bug. An actual tiny bug. The Matrix is confused.',
    art:'bug',
    reward:250
  },

  {
    id:'matrix_floppy',
    world:'matrix',
    x:1890,
    y:445,
    name:'Ancient Save Icon',
    msg:'A physical copy of the symbol everyone keeps pressing to save.',
    art:'floppy',
    reward:300
  },

  {
    id:'matrix_cube',
    world:'matrix',
    x:3290,
    y:610,
    name:'Developer Cube',
    msg:'Perfectly square. Completely unexplained. Probably important.',
    art:'cube',
    reward:350
  },

  {
    id:'matrix_zero',
    world:'matrix',
    x:4700,
    y:450,
    name:'Zero Division',
    msg:'The display reads 1 / 0. Reality flickers politely.',
    art:'zero',
    reward:500
  },

  // THE HUB

  {
    id:'hub_mug',
    world:'hub',
    x:180,
    y:585,
    name:'Forgotten Hub Mug',
    msg:'Property of A.R. The coffee inside is somehow still warm.',
    art:'coffee',
    reward:100
  },

  {
    id:'hub_helmet',
    world:'hub',
    x:650,
    y:615,
    name:'First Riftwalker Helmet',
    msg:'An older Riftwalker visor. The cyan eyes flicker when you approach.',
    art:'helmet',
    reward:200
  },

  {
    id:'hub_ship',
    world:'hub',
    x:1130,
    y:585,
    name:'Miniature Ship',
    msg:'It looks exactly like your ship, including the crash damage.',
    art:'ship',
    reward:300
  }
];


const EASTER_TOTAL = EASTER_EGGS.length + 1;

const SECRET_CODE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a'
];

let secretCodeIndex = 0;


function eggById(id){
  return EASTER_EGGS.find(e => e.id === id);
}


function collectEasterEgg(egg){

  if(!egg || G.easterEggs.has(egg.id)) return;

  G.easterEggs.add(egg.id);

  addCredits(
    egg.reward || 100,
    egg.x,
    egg.y
  );

  SFX.core();

  burst(
    egg.x,
    egg.y - 35,
    '#ffe98a',
    18
  );

  G.screenShake = Math.max(
    G.screenShake,
    5
  );

  toast(
    'SECRET FOUND · ' +
    G.easterEggs.size +
    '/' +
    EASTER_TOTAL,

    egg.name +
    ' — ' +
    egg.msg,

    4.2
  );

  if(G.easterEggs.size === EASTER_TOTAL){

    P.secretHunter = true;

    addCredits(2000);

    toast(
      'SECRET HUNTER',
      'You found every hidden secret in the Multiverse. Bonus: 2,000 Rift Credits.',
      5
    );
  }

  renderJournal();
}


function checkSecretCode(k){

  if(k === SECRET_CODE[secretCodeIndex]){
    secretCodeIndex++;
  }
  else{
    secretCodeIndex =
      k === SECRET_CODE[0]
        ? 1
        : 0;
  }

  if(secretCodeIndex >= SECRET_CODE.length){

    secretCodeIndex = 0;

    if(!G.easterEggs.has('rift_code')){

      G.easterEggs.add('rift_code');

      addCredits(777);

      SFX.core();

      toast(
        'RIFT CODE ACCEPTED',
        'An ancient sequence unlocked 777 Rift Credits. Secret ' +
        G.easterEggs.size +
        '/' +
        EASTER_TOTAL +
        '.',
        4.5
      );

      if(G.easterEggs.size === EASTER_TOTAL){

        P.secretHunter = true;

        addCredits(2000);

        toast(
          'SECRET HUNTER',
          'You found every hidden secret in the Multiverse. Bonus: 2,000 Rift Credits.',
          5
        );
      }
    }
  }
}


/* =========================================================
   MAIN GAME STATE
   ========================================================= */

const G = {
  scene:'menu',
  time:0,
  sceneTime:0,
  paused:false,
  worldId:null,
  camera:0,

  hubFound:false,

  unlocked:new Set([
    'earth'
  ]),

  completed:new Set(),

  cores:0,

  easterEggs:new Set(),

  tutorialDone:false,
  tutorialActive:false,
  tutorialStep:0,

  messageTime:0,
  screenShake:0,
  flash:0,

  particles:[],
  pickups:[],
  enemies:[],
  props:[],

  progress:{},

  arena:null
};


/* =========================================================
   PLAYER
   ========================================================= */

const P = {

  x:460,
  y:530,

  vx:0,
  vy:0,
  depthV:0,

  jump:0,
  onGround:true,

  facing:1,

  dashDirX:1,
  dashDirY:0,

  level:1,
  xp:0,

  hp:1000,
  baseMaxHP:1000,

  baseAtk:25,
  baseDef:10,
  baseSpeed:250,

  baseCritChance:.10,
  baseCritDamage:2,

  weapon:null,
  weaponLevel:1,

  armor:'none',

  credits:250,

  attackCooldown:0,
  baseAttackCooldown:.45,

  attackTimer:0,
  attackIndex:0,
  comboTimer:0,

  invuln:0,
  hitFlash:0,

  dashTimer:0,
  dashCooldown:0,

  anim:{
    state:'idle',
    time:0
  },

  materials:
    Object.fromEntries(
      MATERIALS.map(x => [x,0])
    )
};


const PET_STATE = {
  owned:{},
  active:null
};


/* =========================================================
   ONE-LIFE STAGE SYSTEM
   ========================================================= */

const STAGE_RUN = {
  worldId:null,
  life:1,
  snapshot:null,
  restarting:false
};


function cloneData(value){
  return JSON.parse(
    JSON.stringify(value)
  );
}


function captureStageSnapshot(id){

  STAGE_RUN.worldId = id;
  STAGE_RUN.life = 1;
  STAGE_RUN.restarting = false;

  STAGE_RUN.snapshot = {

    P:cloneData({
      ...P,
      anim:{
        state:'idle',
        time:0
      }
    }),

    pets:cloneData(PET_STATE),

    progress:cloneData(G.progress),

    unlocked:[
      ...G.unlocked
    ],

    completed:[
      ...G.completed
    ],

    cores:G.cores,

    easterEggs:[
      ...G.easterEggs
    ],

    armors:
      Object.fromEntries(
        Object.entries(ARMORS).map(
          ([k,v]) => [
            k,
            {
              unlocked:!!v.unlocked,
              owned:!!v.owned
            }
          ]
        )
      )
  };
}


function restoreStageSnapshot(id){

  const snap = STAGE_RUN.snapshot;

  if(
    !snap ||
    STAGE_RUN.worldId !== id
  ){
    return;
  }

  Object.assign(
    P,
    cloneData(snap.P)
  );

  P.anim = {
    state:'idle',
    time:0
  };

  PET_STATE.owned =
    cloneData(
      snap.pets.owned || {}
    );

  PET_STATE.active =
    snap.pets.active || null;

  G.progress =
    cloneData(
      snap.progress
    );

  G.unlocked =
    new Set(
      snap.unlocked
    );

  G.completed =
    new Set(
      snap.completed
    );

  G.cores = snap.cores;

  G.easterEggs =
    new Set(
      snap.easterEggs || []
    );

  for(
    const [k,v]
    of Object.entries(
      snap.armors || {}
    )
  ){
    if(ARMORS[k]){
      ARMORS[k].unlocked =
        !!v.unlocked;

      ARMORS[k].owned =
        !!v.owned;
    }
  }

  STAGE_RUN.life = 1;
}


const keys =
  Object.create(null);

let justPressed =
  new Set();


for(const id of WORLD_ORDER){

  G.progress[id] = {

    fragments:0,

    bossDefeated:false,

    petFound:[],

    beacons:0,

    storyStage:0,

    shipParts:0
  };
}


/* =========================================================
   AUDIO
   ========================================================= */

const SFX = {

  ctx:null,
  master:null,
  muted:false,

  init(){

    if(this.ctx) return;

    const AC =
      window.AudioContext ||
      window.webkitAudioContext;

    if(!AC) return;

    this.ctx =
      new AC();

    this.master =
      this.ctx.createGain();

    this.master.gain.value =
      .48;

    this.master.connect(
      this.ctx.destination
    );
  },


  resume(){

    this.init();

    if(
      this.ctx?.state ===
      'suspended'
    ){
      this.ctx.resume();
    }
  },


  tone(
    freq=.1,
    dur=.1,
    type='sine',
    vol=.08,
    slide=1
  ){

    if(
      !this.ctx ||
      this.muted
    ){
      return;
    }

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
    dur=.08,
    vol=.05,
    cut=1000
  ){

    if(
      !this.ctx ||
      this.muted
    ){
      return;
    }

    const n =
      Math.floor(
        this.ctx.sampleRate *
        dur
      );

    const b =
      this.ctx.createBuffer(
        1,
        n,
        this.ctx.sampleRate
      );

    const d =
      b.getChannelData(0);

    for(
      let i=0;
      i<n;
      i++
    ){
      d[i] =
        (Math.random()*2-1) *
        (1-i/n);
    }

    const s =
      this.ctx.createBufferSource();

    const f =
      this.ctx.createBiquadFilter();

    const g =
      this.ctx.createGain();

    s.buffer = b;

    f.type =
      'lowpass';

    f.frequency.value =
      cut;

    g.gain.value =
      vol;

    s.connect(f);

    f.connect(g);

    g.connect(
      this.master
    );

    s.start();
  },


  click(){
    this.tone(
      520,
      .05,
      'triangle',
      .04,
      1.25
    );
  },


  crit(){

    this.noise(
      .12,
      .09,
      1500
    );

    this.tone(
      180,
      .13,
      'sawtooth',
      .07,
      2.5
    );

    setTimeout(
      () =>
        this.tone(
          920,
          .1,
          'triangle',
          .05,
          1.25
        ),
      35
    );
  },


  jump(){
    this.tone(
      230,
      .12,
      'sine',
      .06,
      1.8
    );
  },


  land(){
    this.noise(
      .07,
      .035,
      500
    );
  },


  swing(){

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


  hit(){

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


  hurt(){

    this.tone(
      110,
      .15,
      'sawtooth',
      .07,
      .55
    );
  },


  coin(){

    this.tone(
      780,
      .08,
      'sine',
      .05,
      1.35
    );

    setTimeout(
      () =>
        this.tone(
          1050,
          .08,
          'sine',
          .04,
          1.2
        ),
      55
    );
  },


  pet(){

    this.tone(
      480,
      .1,
      'sine',
      .04,
      1.5
    );

    setTimeout(
      () =>
        this.tone(
          720,
          .12,
          'sine',
          .04,
          1.3
        ),
      80
    );
  },


  core(){

    this.tone(
      110,
      .3,
      'sine',
      .09,
      1.4
    );

    setTimeout(
      () =>
        this.tone(
          440,
          .35,
          'triangle',
          .06,
          1.5
        ),
      120
    );
  },


  portal(){
    this.tone(
      160,
      .5,
      'sine',
      .06,
      3
    );
  },


  boss(){
    this.tone(
      70,
      .45,
      'sawtooth',
      .08,
      .7
    );
  },


  toggle(){

    this.muted =
      !this.muted;

    if(this.master){

      this.master.gain.value =
        this.muted
          ? 0
          : .48;
    }
  }
};


/* =========================================================
   BACKGROUND MUSIC
   ========================================================= */

const MUSIC = {

  ctx:null,
  master:null,

  started:false,
  muted:false,

  timer:null,
  step:0,

  bpm:92,

  world:'earth',

  boss:false,

  volume:.34,

  notes:{
    C2:65.41,
    D2:73.42,
    F2:87.31,
    G2:98,
    A2:110,
    Bb2:116.54,

    C3:130.81,
    D3:146.83,
    F3:174.61,
    G3:196,
    A3:220,
    Bb3:233.08,

    C4:261.63,
    D4:293.66,
    F4:349.23,
    G4:392,
    A4:440,
    Bb4:466.16,

    C5:523.25,
    D5:587.33
  },

  melody:[
    'D4',null,
    'F4','A4',
    null,'G4',
    'F4',null,

    'D4',null,
    'F4','C5',
    'A4',null,
    'G4',null,

    'F4',null,
    'A4','C5',
    null,'A4',
    'G4','F4',

    'G4',null,
    'A4','D5',
    'C5','A4',
    'F4',null
  ],

  bass:[
    'D2',null,
    'D2','A2',
    'Bb2',null,
    'F2',null,

    'F2',null,
    'C3',null,
    'C2',null,
    'G2',null
  ],

  styles:{
    hub:[
      82,
      'sine',
      .42
    ],

    earth:[
      92,
      'triangle',
      .55
    ],

    music:[
      118,
      'square',
      .72
    ],

    money:[
      104,
      'triangle',
      .62
    ],

    cosmos:[
      72,
      'sine',
      .34
    ],

    war:[
      128,
      'sawtooth',
      .68
    ],

    void:[
      58,
      'sine',
      .24
    ],

    matrix:[
      110,
      'square',
      .56
    ],

    arena:[
      132,
      'sawtooth',
      .7
    ]
  },


  init(){

    SFX.resume();

    if(!SFX.ctx){
      return;
    }

    this.ctx =
      SFX.ctx;

    if(this.master){
      return;
    }

    this.master =
      this.ctx.createGain();

    this.master.gain.value =
      this.volume;

    this.master.connect(
      this.ctx.destination
    );
  },


  start(){

    this.init();

    if(this.started){
      return;
    }

    this.started = true;

    this.step = 0;

    this.schedule();
  },


  setWorld(w){

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
    type='sine',
    vol=.02,
    delay=0
  ){

    if(
      !this.ctx ||
      this.muted ||
      !freq
    ){
      return;
    }

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

    o.frequency.value =
      freq;

    f.type =
      'lowpass';

    f.frequency.value =
      800 +
      (
        this.styles[this.world] ||
        this.styles.earth
      )[2] * 2600;

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


  chord(){

    const chords = [
      ['D3','F3','A3'],
      ['Bb2','D3','F3'],
      ['F3','A3','C4'],
      ['C3','G3','C4']
    ];

    const c =
      chords[
        Math.floor(
          this.step / 8
        ) % 4
      ];

    for(const n of c){

      this.tone(
        this.notes[n],
        1.6,
        'sine',
        .012
      );

      this.tone(
        this.notes[n] * 2,
        1.2,
        'triangle',
        .004
      );
    }
  },


  melodyStep(){

    let n =
      this.melody[
        this.step %
        this.melody.length
      ];

    if(!n){
      return;
    }

    if(
      this.world === 'void' &&
      this.step % 5 === 0
    ){
      return;
    }

    let f =
      this.notes[n];

    if(
      this.world === 'matrix' &&
      Math.random() < .12
    ){
      f *=
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
      f,
      .28,
      wave,
      this.boss
        ? .036
        : .025
    );

    if(
      this.world === 'music'
    ){
      this.tone(
        f * 1.5,
        .18,
        'sine',
        .009
      );
    }

    if(
      this.world === 'cosmos'
    ){
      this.tone(
        f * 2,
        .65,
        'sine',
        .006,
        .05
      );
    }
  },


  bassStep(){

    const n =
      this.bass[
        this.step %
        this.bass.length
      ];

    if(n){

      this.tone(
        this.notes[n],
        .34,
        'sine',
        this.boss
          ? .034
          : .019
      );
    }
  },


  drum(power=1){

    if(
      !this.ctx ||
      this.muted
    ){
      return;
    }

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

    for(
      let i=0;
      i<n;
      i++
    ){
      d[i] =
        (Math.random()*2-1) *
        (1-i/n) ** 2;
    }

    const s =
      this.ctx.createBufferSource();

    const f =
      this.ctx.createBiquadFilter();

    const g =
      this.ctx.createGain();

    s.buffer = b;

    f.type =
      'lowpass';

    f.frequency.value =
      (
        this.world === 'war' ||
        this.world === 'arena'
      )
        ? 520
        : 1000;

    g.gain.value =
      .012 * power;

    s.connect(f);

    f.connect(g);

    g.connect(
      this.master
    );

    s.start();
  },


  rhythm(){

    if(
      this.world === 'war' ||
      this.world === 'arena'
    ){

      if(
        this.step % 2 === 0
      ){
        this.drum(1.9);
      }
    }

    else if(
      this.world === 'music'
    ){

      if(
        this.step % 2 === 0
      ){
        this.drum(1);
      }
    }

    else if(
      this.step % 8 === 0
    ){
      this.drum(.3);
    }
  },


  schedule(){

    if(!this.started){
      return;
    }

    if(
      this.step % 8 === 0
    ){
      this.chord();
    }

    this.melodyStep();

    if(
      this.step % 2 === 0
    ){
      this.bassStep();
    }

    this.rhythm();

    if(
      this.boss &&
      this.step % 2 === 0
    ){
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
        ) * 1000
      );
  },


  startBoss(){

    if(this.boss){
      return;
    }

    this.boss = true;

    this.setWorld(
      this.world
    );

    SFX.boss();
  },


  endBoss(){

    this.boss = false;

    this.setWorld(
      this.world
    );
  },


  toggle(){

    this.muted =
      !this.muted;

    if(this.master){

      this.master.gain.value =
        this.muted
          ? 0
          : this.volume;
    }
  }
};


/* =========================================================
   STATS / ECONOMY
   ========================================================= */

function activePet(){

  return PET_STATE.active
    ? PET_STATE.owned[
        PET_STATE.active
      ]
    : null;
}


function getStats(){

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
        (pet.level - 1) *
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
              (P.weaponLevel - 1) *
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

    critChance:
      clamp(
        (P.baseCritChance ?? .10) +
        (pb.critChance || 0),
        .02,
        .65
      ),

    critDamage:
      Math.max(
        1.5,
        (P.baseCritDamage ?? 2) +
        (pb.critDamage || 0)
      ),

    cooldown:
      Math.max(
        .18,
        P.baseAttackCooldown *
        (pb.cooldown || 1)
      )
  };
}
function preserveHealthForStatChange(oldMax,newMax){
  const ratio=oldMax>0?P.hp/oldMax:1;
  P.hp=clamp(Math.round(newMax*ratio),1,newMax)
}

/* =========================================================
   GAME SETUP / STORY
   ========================================================= */

function resetGame(){
  STAGE_RUN.worldId=null;
  STAGE_RUN.life=1;
  STAGE_RUN.snapshot=null;
  STAGE_RUN.restarting=false;

  G.scene='flight';
  G.sceneTime=0;
  G.worldId=null;
  G.camera=0;
  G.hubFound=false;
  G.unlocked=new Set(['earth']);
  G.completed=new Set();
  G.cores=0;
  G.easterEggs=new Set();
  G.tutorialDone=false;
  G.tutorialActive=false;
  G.tutorialStep=0;
  G.enemies=[];
  G.pickups=[];
  G.particles=[];
  G.progress={};

  for(const id of WORLD_ORDER){
    G.progress[id]={
      fragments:0,
      bossDefeated:false,
      petFound:[],
      beacons:0,
      storyStage:0,
      shipParts:0
    };
  }

  Object.assign(P,{
    x:460,
    y:530,
    vx:0,
    vy:0,
    depthV:0,
    jump:0,
    onGround:true,
    facing:1,

    dashDirX:1,
    dashDirY:0,

    level:1,
    xp:0,

    hp:1000,

    baseCritChance:.10,
    baseCritDamage:2,

    secretHunter:false,

    weapon:null,
    weaponLevel:1,

    armor:'none',

    credits:250,

    attackCooldown:0,
    attackTimer:0,
    attackIndex:0,
    comboTimer:0,

    invuln:0,
    hitFlash:0,

    dashTimer:0,
    dashCooldown:0,

    materials:
      Object.fromEntries(
        MATERIALS.map(x=>[x,0])
      )
  });

  PET_STATE.owned={};
  PET_STATE.active=null;

  $('startScreen').classList.add('hidden');
  $('hud').classList.remove('hidden');

  MUSIC.start();
  MUSIC.setWorld('earth');
  SFX.resume();
}


function beginWorld(id){

  const w=WORLDS[id];

  if(!w)return;

  G.scene='world';
  G.worldId=id;
  G.camera=0;
  G.sceneTime=0;

  P.x=430;
  P.y=530;

  P.vx=0;
  P.vy=0;
  P.depthV=0;

  P.jump=0;
  P.onGround=true;

  // Every stage starts with exactly one life and full health.

  P.hp=getStats().maxHP;

  P.invuln=0;
  P.hitFlash=0;

  P.attackCooldown=0;
  P.attackTimer=0;

  P.dashTimer=0;
  P.dashCooldown=0;

  captureStageSnapshot(id);

  G.enemies=
    G.enemies.filter(
      e=>e.world!==id
    );

  G.pickups=[];

  spawnWorldContent(id);

  MUSIC.setWorld(id);
  MUSIC.endBoss();

  if(id==='earth'){
    updateEarthQuest();
  }
  else{
    quest(
      w.mechanic,
      'Collect 5 Rift Fragments and find the '+w.boss+'.'
    );
  }

  toast(
    'ONE LIFE STAGE',
    'You have 1 life. If you fall, this stage restarts.'
  );

  syncHUD();

  if(
    id==='earth' &&
    !G.tutorialDone &&
    !G.tutorialActive
  ){
    setTimeout(()=>{
      if(
        G.scene==='world' &&
        G.worldId==='earth'
      ){
        startTutorial(false);
      }
    },250);
  }
}


function beginHub(){

  STAGE_RUN.worldId=null;
  STAGE_RUN.life=1;
  STAGE_RUN.snapshot=null;
  STAGE_RUN.restarting=false;

  G.scene='hub';
  G.worldId=null;
  G.camera=0;

  G.hubFound=true;

  P.x=640;
  P.y=535;

  P.vx=0;
  P.depthV=0;
  P.jump=0;

  MUSIC.setWorld('hub');
  MUSIC.endBoss();

  quest(
    'THE HUB',
    'Prepare your gear, train pets and choose your next world.'
  );

  syncHUD();
}


function travelTo(id){

  if(!G.unlocked.has(id)){
    return;
  }

  closeAllOverlays();

  G.scene='travel';
  G.travelTarget=id;
  G.sceneTime=0;

  SFX.portal();

  MUSIC.setWorld(id);
}


function spawnWorldContent(id){

  const w=WORLDS[id];
  const pr=G.progress[id];

  if(id!=='earth'){

    for(let i=0;i<5;i++){

      if(i>=pr.fragments){

        G.pickups.push({
          kind:'fragment',
          x:950+i*720,
          y:510+((i%2)*30),
          taken:false
        });
      }
    }
  }

  const roster=PET_ROSTERS[id];

  roster.forEach((name,i)=>{

    if(!pr.petFound.includes(name)){

      G.pickups.push({
        kind:'pet',
        name,
        x:720+i*540,
        y:520-((i%3)*18),
        taken:false
      });
    }
  });

  const count=
    id==='earth'
      ?8
      :10;

  for(let i=0;i<count;i++){

    spawnEnemy(
      id,
      1050+i*430,
      520+(i%3)*20,
      false
    );
  }

  if(
    id==='war' &&
    pr.beacons<3
  ){

    for(
      let i=pr.beacons;
      i<3;
      i++
    ){

      G.pickups.push({
        kind:'beacon',
        x:1700+i*1050,
        y:520,
        taken:false
      });
    }
  }

  if(pr.bossDefeated){

    G.pickups.push({
      kind:'portal',
      x:w.width-420,
      y:500,
      taken:false
    });
  }

  else if(
    id!=='earth' &&
    pr.fragments>=5 &&
    (
      id!=='war' ||
      pr.beacons>=3
    )
  ){

    spawnEnemy(
      id,
      w.width-650,
      500,
      true
    );
  }
}


function enemyName(world,v=0){

  const names={

    earth:[
      'Moss Stalker',
      'Crystal Beetle',
      'Ruin Crawler'
    ],

    music:[
      'Amp Spider',
      'Beat Brute',
      'Sound Phantom'
    ],

    money:[
      'Coin Mimic',
      'Vault Gremlin',
      'Goldback Bandit'
    ],

    cosmos:[
      'Star Crawler',
      'Meteor Crab',
      'Nebula Wisp'
    ],

    war:[
      'Battle Droid',
      'Siege Hound',
      'Razor Drone'
    ],

    void:[
      'Shadow Stalker',
      'Rift Spider',
      'Abyss Wraith'
    ],

    matrix:[
      'Glitch Beast',
      'Data Serpent',
      'Fragment Bot'
    ]
  };

  return(
    names[world] ||
    ['Rift Creature']
  )[v%3];
}


function spawnEnemy(world,x,y,boss=false){

  const w=WORLDS[world];

  const variant=
    randi(0,2);

  G.enemies.push({

    id:cryptoId(),

    world,

    x,
    y,

    vx:0,

    hp:
      boss
        ?650+
          WORLD_ORDER.indexOf(world)*120
        :110+
          WORLD_ORDER.indexOf(world)*25,

    maxHP:
      boss
        ?650+
          WORLD_ORDER.indexOf(world)*120
        :110+
          WORLD_ORDER.indexOf(world)*25,

    damage:
      boss
        ?55
        :24+
          WORLD_ORDER.indexOf(world)*4,

    boss,

    alive:true,

    hit:0,

    attackCd:
      rand(.2,1.2),

    phase:0,

    variant,

    name:
      boss
        ?w.boss
        :enemyName(
          world,
          variant
        )
  });

  if(boss){

    MUSIC.startBoss();

    toast(
      'BOSS DETECTED',
      w.boss
    );
  }
}


function cryptoId(){

  return(
    Math.random()
      .toString(36)
      .slice(2)
    +
    Date.now()
      .toString(36)
      .slice(-4)
  );
}


function updateEarthQuest(){

  const p=G.progress.earth;

  const s=p.storyStage;

  if(s===0){
    quest(
      'STRANDED',
      'Inspect the crashed ship.'
    );
  }

  if(s===1){
    quest(
      'FIRST WEAPON',
      'Find the energy signature east of the wreck.'
    );
  }

  if(s===2){
    quest(
      'SHIP PARTS',
      'Recover 3 ship components. '+
      p.shipParts+
      '/3'
    );
  }

  if(s===3){
    quest(
      'SIGNAL PEAK',
      'Activate the ancient signal tower.'
    );
  }

  if(s===4){
    quest(
      'ANCIENT GATE',
      'Open the gate and face what is protecting it.'
    );
  }

  if(s===5){
    quest(
      'RUIN GUARDIAN',
      'Defeat the Ruin Guardian.'
    );
  }

  if(s===6){
    quest(
      'REPAIR THE SHIP',
      'Return to the wreck and repair your ship.'
    );
  }

  if(s>=7){
    quest(
      'THE SIGNAL',
      'Launch toward the mysterious Hub signal.'
    );
  }
}


function completeWorld(id){

  if(G.completed.has(id)){
    return;
  }

  G.completed.add(id);

  G.progress[id].bossDefeated=true;

  G.cores++;

  addMaterial(
    'Boss Core',
    1
  );

  addCredits(
    350+
    WORLD_ORDER.indexOf(id)*100
  );

  SFX.core();

  MUSIC.endBoss();

  const idx=
    WORLD_ORDER.indexOf(id);

  if(
    idx>=0 &&
    idx<WORLD_ORDER.length-1
  ){
    G.unlocked.add(
      WORLD_ORDER[idx+1]
    );
  }

  if(id==='earth'){

    G.progress.earth.storyStage=6;

    updateEarthQuest();
  }

  else{

    G.pickups.push({
      kind:'portal',
      x:WORLDS[id].width-420,
      y:500,
      taken:false
    });

    quest(
      'CORE RECOVERED',
      'Return to The Hub through the Rift portal.'
    );
  }
}


/* =========================================================
   INPUT / MOVEMENT / COMBAT
   ========================================================= */

const TUTORIAL_STEPS=[

  {
    title:'Move Through the World',

    text:
      'Use WASD or the Arrow Keys. You can move forward, backward, left, right and diagonally.',

    keys:[
      'W',
      'A',
      'S',
      'D'
    ],

    accept:k=>
      [
        'w',
        'a',
        's',
        'd',
        'arrowup',
        'arrowdown',
        'arrowleft',
        'arrowright'
      ].includes(k)
  },

  {
    title:'Jump',

    text:
      'Press Space to jump. You can keep moving while you are in the air.',

    keys:[
      'SPACE'
    ],

    accept:k=>
      k===' '
  },

  {
    title:'Rift Dash',

    text:
      'Press Shift to dash. Hold a movement direction first to dash that way.',

    keys:[
      'SHIFT'
    ],

    accept:k=>
      k==='shift'
  },

  {
    title:'Interact',

    text:
      'Press E when the interaction prompt appears to inspect, collect or activate something.',

    keys:[
      'E'
    ],

    accept:k=>
      k==='e'
  },

  {
    title:'Attack',

    text:
      'Press F to attack with your equipped weapon. Critical hits can deal double damage.',

    keys:[
      'F'
    ],

    accept:k=>
      k==='f'
  },

  {
    title:'Rift Interface',

    text:
      'Use I for inventory, J for pets and V to toggle audio. You can replay this tutorial from Pause.',

    keys:[
      'I',
      'J',
      'V'
    ],

    accept:k=>
      [
        'i',
        'j',
        'v'
      ].includes(k)
  }
];


function startTutorial(force=false){

  if(
    !force &&
    G.tutorialDone
  ){
    return;
  }

  G.tutorialActive=true;

  G.tutorialStep=0;

  const panel=
    $('tutorialPanel');

  if(panel){
    panel.classList.remove(
      'hidden'
    );
  }

  renderTutorialStep();
}


function renderTutorialStep(){

  if(!G.tutorialActive){
    return;
  }

  const step=
    TUTORIAL_STEPS[
      G.tutorialStep
    ];

  if(!step){
    return finishTutorial();
  }

  $('tutorialTitle').textContent=
    step.title;

  $('tutorialText').textContent=
    step.text;

  $('tutorialProgress').textContent=
    (G.tutorialStep+1)+
    ' / '+
    TUTORIAL_STEPS.length;

  $('tutorialBarFill').style.width=
    (
      (G.tutorialStep+1) /
      TUTORIAL_STEPS.length *
      100
    )+'%';

  $('tutorialKeys').innerHTML=
    step.keys
      .map(
        k=>'<kbd>'+k+'</kbd>'
      )
      .join('');
}


function handleTutorialKey(k){

  if(!G.tutorialActive){
    return;
  }

  const step=
    TUTORIAL_STEPS[
      G.tutorialStep
    ];

  if(
    step &&
    step.accept(k)
  ){

    G.tutorialStep++;

    SFX.click();

    if(
      G.tutorialStep>=
      TUTORIAL_STEPS.length
    ){
      finishTutorial();
    }

    else{
      renderTutorialStep();
    }
  }
}


function finishTutorial(){

  G.tutorialActive=false;

  G.tutorialDone=true;

  G.tutorialStep=0;

  if($('tutorialPanel')){

    $('tutorialPanel')
      .classList
      .add('hidden');
  }

  toast(
    'TRAINING COMPLETE',
    'Controls unlocked. Explore Earth 2.0 and find the Nova Sword.',
    3
  );
}


if($('tutorialSkipBtn')){

  $('tutorialSkipBtn').onclick=
    ()=>finishTutorial();
}


if($('tutorialNextBtn')){

  $('tutorialNextBtn').onclick=
    ()=>finishTutorial();
}


window.addEventListener(
  'keydown',
  e=>{

    if(
      [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        ' '
      ].includes(e.key)
    ){
      e.preventDefault();
    }

    const k=
      e.key.toLowerCase();

    if(!keys[k]){
      justPressed.add(k);
    }

    keys[k]=true;

    checkSecretCode(k);

    handleTutorialKey(k);

    if(
      k==='f' &&
      !G.paused
    ){
      tryAttack();
    }

    if(k==='v'){

      SFX.toggle();

      MUSIC.toggle();

      toast(
        'AUDIO',
        MUSIC.muted
          ?'Music and effects muted.'
          :'Music and effects on.'
      );
    }

    if(k==='i'){
      toggleOverlay(
        'inventoryOverlay',
        renderInventory
      );
    }

    if(k==='j'){
      toggleOverlay(
        'petsOverlay',
        renderPets
      );
    }

    if(
      k==='m' &&
      G.scene==='hub'
    ){
      toggleOverlay(
        'mapOverlay',
        renderWorldMap
      );
    }

    if(k==='escape'){
      togglePause();
    }
  }
);


window.addEventListener(
  'keyup',
  e=>
    keys[
      e.key.toLowerCase()
    ]=false
);


function setAnim(state){

  if(P.anim.state===state){
    return;
  }

  P.anim.state=state;

  P.anim.time=0;
}


function updatePlayer(dt,bounds){

  const s=getStats();

  P.attackCooldown=
    Math.max(
      0,
      P.attackCooldown-dt
    );

  P.attackTimer=
    Math.max(
      0,
      P.attackTimer-dt
    );

  P.comboTimer=
    Math.max(
      0,
      P.comboTimer-dt
    );

  P.invuln=
    Math.max(
      0,
      P.invuln-dt
    );

  P.hitFlash=
    Math.max(
      0,
      P.hitFlash-dt
    );

  P.dashCooldown=
    Math.max(
      0,
      P.dashCooldown-dt
    );

  P.dashTimer=
    Math.max(
      0,
      P.dashTimer-dt
    );

  P.anim.time+=dt;

  /*
     2.5D MOVEMENT

     A / D = left / right
     W / S = forward / backward
     Space = jump
  */

  let moveX=
    (
      keys['a'] ||
      keys['arrowleft']
        ?-1
        :0
    )
    +
    (
      keys['d'] ||
      keys['arrowright']
        ?1
        :0
    );

  let moveY=
    (
      keys['w'] ||
      keys['arrowup']
        ?-1
        :0
    )
    +
    (
      keys['s'] ||
      keys['arrowdown']
        ?1
        :0
    );


  // Prevent diagonal movement from being faster.

  const moveLength=
    Math.hypot(
      moveX,
      moveY
    );

  if(moveLength>1){

    moveX/=moveLength;

    moveY/=moveLength;
  }


  if(moveX!==0){

    P.facing=
      Math.sign(moveX);
  }


  // DASH

  if(
    justPressed.has('shift') &&
    P.dashCooldown<=0
  ){

    if(
      moveX===0 &&
      moveY===0
    ){

      P.dashDirX=P.facing;

      P.dashDirY=0;
    }

    else{

      P.dashDirX=moveX;

      P.dashDirY=moveY;
    }

    P.dashTimer=.16;

    P.dashCooldown=.75;

    SFX.tone(
      180,
      .12,
      'sawtooth',
      .04,
      2
    );

    burst(
      P.x,
      P.y-40,
      '#75e9ff',
      10
    );
  }


  const dash=
    P.dashTimer>0
      ?2.6
      :1;


  const dirX=
    P.dashTimer>0
      ?P.dashDirX
      :moveX;


  const dirY=
    P.dashTimer>0
      ?P.dashDirY
      :moveY;


  const targetX=
    dirX*
    s.speed*
    dash;


  const targetDepth=
    dirY*
    s.speed*
    .72*
    dash;


  const smooth=
    Math.min(
      1,
      dt*
      (
        P.dashTimer>0
          ?18
          :10
      )
    );


  P.vx=
    lerp(
      P.vx,
      targetX,
      smooth
    );


  P.depthV=
    lerp(
      P.depthV,
      targetDepth,
      smooth
    );


  if(
    moveX===0 &&
    P.dashTimer<=0
  ){

    P.vx*=
      Math.pow(
        .001,
        dt
      );
  }


  if(
    moveY===0 &&
    P.dashTimer<=0
  ){

    P.depthV*=
      Math.pow(
        .001,
        dt
      );
  }


  P.x=
    clamp(
      P.x+
      P.vx*dt,
      80,
      bounds-80
    );


  // WALKABLE 2.5D FLOOR

  const minY=
    G.scene==='arena'
      ?435
      :G.scene==='hub'
        ?440
        :445;


  const maxY=
    G.scene==='arena'
      ?620
      :G.scene==='hub'
        ?605
        :615;


  P.y=
    clamp(
      P.y+
      P.depthV*dt,
      minY,
      maxY
    );


  // JUMP

  if(
    justPressed.has(' ') &&
    P.onGround
  ){

    P.vy=-520;

    P.onGround=false;

    SFX.jump();
  }


  if(!P.onGround){

    P.vy+=
      1250*dt;


    P.jump-=
      P.vy*dt;


    if(
      P.jump<=0 &&
      P.vy>0
    ){

      P.jump=0;

      P.vy=0;

      P.onGround=true;

      SFX.land();

      burst(
        P.x,
        P.y,
        '#d5e9f2',
        6
      );
    }
  }


  // PLAYER ANIMATION

  if(P.attackTimer>0){

    setAnim('attack');
  }

  else if(P.dashTimer>0){

    setAnim('dash');
  }

  else if(!P.onGround){

    setAnim(
      P.vy<0
        ?'jump'
        :'fall'
    );
  }

  else if(
    Math.abs(P.vx)>35 ||
    Math.abs(P.depthV)>25
  ){

    setAnim('run');
  }

  else{

    setAnim('idle');
  }
}


/* =========================================================
   CRITICAL HITS
   ========================================================= */

function rollCritical(
  stats,
  comboIndex=P.attackIndex
){

  // Third Nova Sword combo attack has
  // an additional 8% critical chance.

  const bonus=
    comboIndex===2
      ?.08
      :0;


  return(
    Math.random() <
    clamp(
      stats.critChance+bonus,
      0,
      .8
    )
  );
}


/* =========================================================
   PLAYER ATTACK
   ========================================================= */

function tryAttack(){

  if(
    G.paused ||
    isOverlayOpen() ||
    ![
      'world',
      'hub',
      'arena'
    ].includes(G.scene) ||
    !P.weapon ||
    P.attackCooldown>0
  ){
    return;
  }


  const s=getStats();


  P.attackCooldown=
    s.cooldown;


  P.attackTimer=.25;


  if(P.comboTimer>0){

    P.attackIndex=
      (P.attackIndex+1)%3;
  }

  else{

    P.attackIndex=0;
  }


  P.comboTimer=.8;


  SFX.swing();


  const range=
    P.attackIndex===2
      ?125
      :92;


  const baseDamage=
    Math.round(
      s.atk*
      (
        P.attackIndex===2
          ?1.45
          :1
      )*
      rand(.9,1.1)
    );


  // ARENA ATTACK

  if(G.scene==='arena'){

    const critical=
      rollCritical(s);


    const damage=
      Math.round(
        baseDamage*
        (
          critical
            ?s.critDamage
            :1
        )
      );


    arenaLocalAttack(
      range,
      damage,
      critical
    );


    return;
  }


  let hit=false;


  for(const e of G.enemies){

    if(
      !e.alive ||
      e.world!==G.worldId
    ){
      continue;
    }


    const dx=
      (e.x-P.x)*
      P.facing;


    if(
      dx>-35 &&
      dx<range &&
      Math.abs(e.y-P.y)<85
    ){

      const critical=
        rollCritical(s);


      const damage=
        Math.round(
          baseDamage*
          (
            critical
              ?s.critDamage
              :1
          )
        );


      hurtEnemy(
        e,
        damage,
        critical
      );


      hit=true;
    }
  }


  if(hit){

    G.screenShake=
      Math.max(
        G.screenShake,
        P.attackIndex===2
          ?8
          :4
      );
  }
}


/* =========================================================
   ENEMY DAMAGE
   ========================================================= */

function hurtEnemy(
  e,
  dmg,
  critical=false
){

  e.hp-=dmg;


  e.hit=
    critical
      ?.24
      :.15;


  if(critical){

    SFX.crit();


    G.screenShake=
      Math.max(
        G.screenShake,
        11
      );


    G.flash=
      Math.max(
        G.flash,
        .06
      );


    burst(
      e.x,
      e.y-42,
      '#ffe88b',
      16
    );


    burst(
      e.x,
      e.y-42,
      '#c5a3ff',
      12
    );


    floatingText(
      'CRITICAL! '+dmg,
      e.x,
      e.y-92,
      '#ffe88b'
    );
  }

  else{

    SFX.hit();


    burst(
      e.x,
      e.y-40,
      e.boss
        ?'#ff6e87'
        :'#7ff4ca',
      8
    );


    floatingText(
      '-'+dmg,
      e.x,
      e.y-80,
      '#ffffff'
    );
  }


  if(e.hp<=0){

    killEnemy(e);
  }
}


function killEnemy(e){

  e.alive=false;


  burst(
    e.x,
    e.y-45,
    e.boss
      ?'#ff6e87'
      :'#72e6ff',
    22
  );


  if(e.boss){

    completeWorld(
      e.world
    );
  }

  else{

    addCredits(
      randi(6,18),
      e.x,
      e.y
    );


    if(Math.random()<.28){

      addMaterial(
        worldMaterial(e.world),
        1
      );
    }
  }
}


function worldMaterial(id){

  return{

    earth:'Ancient Metal',

    music:'Sound Crystal',

    money:'Golden Ore',

    cosmos:'Star Dust',

    war:'Titan Scrap',

    void:'Void Essence',

    matrix:'Glitch Fragment'

  }[id] || 'Rift Dust';
}


/* =========================================================
   PLAYER DAMAGE
   ========================================================= */

function hurtPlayer(
  amount,
  sourceX
){

  if(P.invuln>0){
    return;
  }


  const s=getStats();


  const final=
    Math.max(
      1,
      Math.round(
        amount-
        s.def*.55
      )
    );


  P.hp=
    Math.max(
      0,
      P.hp-final
    );


  P.invuln=.72;

  P.hitFlash=.18;


  P.vx=
    (
      P.x<sourceX
        ?-1
        :1
    )*210;


  G.screenShake=8;

  G.flash=.08;


  SFX.hurt();


  burst(
    P.x,
    P.y-65,
    '#ff6c7c',
    9
  );


  floatingText(
    '-'+final,
    P.x,
    P.y-110,
    '#ff8290'
  );


  if(P.hp<=0){

    playerDefeated();
  }


  syncHUD();
}


/* =========================================================
   ONE LIFE DEFEAT
   ========================================================= */

function playerDefeated(){

  if(
    G.scene==='world' &&
    G.worldId &&
    !STAGE_RUN.restarting
  ){

    const failedWorld=
      G.worldId;


    STAGE_RUN.life=0;

    STAGE_RUN.restarting=true;


    syncHUD();


    G.paused=true;

    G.screenShake=14;

    G.flash=.16;


    $('cinematic')
      .classList
      .remove('hidden');


    $('cinematic').textContent=
      'STAGE FAILED';


    SFX.noise(
      .32,
      .1,
      520
    );


    setTimeout(()=>{

      restoreStageSnapshot(
        failedWorld
      );


      beginWorld(
        failedWorld
      );


      $('cinematic')
        .classList
        .add('hidden');


      G.paused=false;

      STAGE_RUN.restarting=false;


      toast(
        'STAGE RESTARTED',
        'Your one life was used. The stage has restarted from the beginning.',
        3.2
      );


      syncHUD();

    },1200);


    return;
  }


  const stats=
    getStats();


  P.hp=
    stats.maxHP;


  P.x=
    G.scene==='hub'
      ?640
      :430;


  P.jump=0;

  P.vy=0;


  toast(
    'RIFT STABILIZED',
    'You were returned to safety.'
  );
}


/* =========================================================
   ENEMY AI
   ========================================================= */

function updateEnemies(dt){

  for(const e of G.enemies){

    if(
      !e.alive ||
      e.world!==G.worldId
    ){
      continue;
    }


    e.hit=
      Math.max(
        0,
        e.hit-dt
      );


    e.attackCd-=dt;


    const dx=
      P.x-e.x;


    const dy=
      P.y-e.y;


    const distance=
      Math.hypot(
        dx,
        dy
      );


    // Monsters chase the player in both
    // horizontal and depth directions.

    if(distance<620){

      const speed=
        e.boss
          ?110
          :85;


      if(distance>1){

        e.x+=
          dx/
          distance*
          speed*
          dt;


        e.y+=
          dy/
          distance*
          speed*
          .72*
          dt;


        e.y=
          clamp(
            e.y,
            445,
            615
          );
      }


      if(e.boss){

        e.phase=
          e.hp/e.maxHP<.45
            ?2
            :1;
      }
    }


    const range=
      e.boss
        ?100
        :62;


    if(
      distance<range &&
      e.attackCd<=0
    ){

      e.attackCd=
        e.boss
          ?(
            e.phase===2
              ?.65
              :.9
          )
          :1.15;


      hurtPlayer(
        e.damage,
        e.x
      );
    }
  }


  // ACTIVE PET ATTACK

  const ap=
    activePet();


  if(ap){

    ap.attackCd=
      (ap.attackCd||0)-dt;


    if(ap.attackCd<=0){

      const targets=
        G.enemies
          .filter(
            e=>
              e.alive &&
              e.world===G.worldId
          )
          .sort(
            (a,b)=>
              Math.hypot(
                a.x-P.x,
                a.y-P.y
              )
              -
              Math.hypot(
                b.x-P.x,
                b.y-P.y
              )
          );


      const target=
        targets[0];


      if(
        target &&
        Math.hypot(
          target.x-P.x,
          target.y-P.y
        )<360
      ){

        const pb=
          PET_BONUS[ap.name]||
          {};


        const d=
          Math.round(
            8+
            (pb.atk||5)*.45+
            ap.level*1.5
          );


        hurtEnemy(
          target,
          d
        );


        ap.attackCd=1.25;


        burst(
          target.x,
          target.y-30,
          '#b6f8ff',
          4
        );
      }
    }
  }
}


/* =========================================================
   INTERACTIONS
   ========================================================= */

function nearestInteraction(){

  const distanceTo=
    (x,y)=>
      Math.hypot(
        P.x-x,
        P.y-y
      );


  /* -------------------------
     HUB INTERACTIONS
     ------------------------- */

  if(G.scene==='hub'){

    const spots=[

      {
        x:340,
        y:500,
        label:'PET SANCTUARY',

        fn:()=>
          openOverlay(
            'petsOverlay',
            renderPets
          )
      },

      {
        x:650,
        y:500,
        label:'ARMOR WORKSHOP',

        fn:()=>
          openOverlay(
            'inventoryOverlay',
            renderInventory
          )
      },

      {
        x:980,
        y:500,
        label:'WORLD TERMINAL',

        fn:()=>
          openOverlay(
            'mapOverlay',
            renderWorldMap
          )
      }
    ];


    // Hidden Hub Easter eggs.

    for(const egg of EASTER_EGGS){

      if(
        egg.world==='hub' &&
        !G.easterEggs.has(egg.id)
      ){

        spots.push({

          x:egg.x,
          y:egg.y,

          label:'INVESTIGATE ???',

          fn:()=>
            collectEasterEgg(
              egg
            )
        });
      }
    }


    return spots
      .map(
        s=>({
          ...s,
          d:distanceTo(
            s.x,
            s.y
          )
        })
      )
      .sort(
        (a,b)=>a.d-b.d
      )[0];
  }


  if(G.scene!=='world'){
    return null;
  }


  const pr=
    G.progress[
      G.worldId
    ];


  const list=[];


  /* -------------------------
     WORLD EASTER EGGS
     ------------------------- */

  for(const egg of EASTER_EGGS){

    if(
      egg.world===G.worldId &&
      !G.easterEggs.has(egg.id)
    ){

      list.push({

        x:egg.x,
        y:egg.y,

        label:'INVESTIGATE ???',

        fn:()=>
          collectEasterEgg(
            egg
          ),

        d:distanceTo(
          egg.x,
          egg.y
        )
      });
    }
  }


  /* -------------------------
     NORMAL PICKUPS
     ------------------------- */

  for(const p of G.pickups){

    if(!p.taken){

      list.push({

        x:p.x,
        y:p.y,

        label:
          interactionLabel(p),

        obj:p,

        fn:()=>
          interactPickup(p),

        d:distanceTo(
          p.x,
          p.y
        )
      });
    }
  }


  /* -------------------------
     EARTH 2.0 STORY
     ------------------------- */

  if(G.worldId==='earth'){

    const stage=
      pr.storyStage;


    const addStory=
      (
        x,
        y,
        label,
        fn
      )=>
        list.push({
          x,
          y,
          label,
          fn,
          d:distanceTo(x,y)
        });


    if(stage===0){

      addStory(
        480,
        510,
        'INSPECT WRECK',
        ()=>{

          pr.storyStage=1;


          toast(
            'RIFTWALKER',
            'The ship is badly damaged. A strange energy signal is nearby.'
          );


          updateEarthQuest();
        }
      );
    }


    if(stage===1){

      addStory(
        1180,
        505,
        'TAKE NOVA SWORD',
        ()=>{

          P.weapon=
            'Nova Sword';


          pr.storyStage=2;


          addMaterial(
            'Rift Dust',
            2
          );


          SFX.core();


          toast(
            'NOVA SWORD',
            'A Rift-powered blade responds to your Core.'
          );


          updateEarthQuest();
        }
      );
    }


    if(stage===2){

      [
        [1550,505],
        [2200,535],
        [2750,505]
      ].forEach(
        ([x,y],i)=>{

          if(i>=pr.shipParts){

            addStory(
              x,
              y,
              'RECOVER SHIP COMPONENT',
              ()=>{

                pr.shipParts++;


                addMaterial(
                  'Ancient Metal',
                  1
                );


                SFX.coin();


                if(
                  pr.shipParts>=3
                ){

                  pr.storyStage=3;
                }


                updateEarthQuest();
              }
            );
          }
        }
      );
    }


    if(stage===3){

      addStory(
        3350,
        525,
        'ACTIVATE SIGNAL TOWER',
        ()=>{

          pr.storyStage=4;


          SFX.portal();


          toast(
            'UNKNOWN SIGNAL',
            'A structure called THE HUB is responding.'
          );


          updateEarthQuest();
        }
      );
    }


    if(stage===4){

      addStory(
        4050,
        525,
        'OPEN ANCIENT GATE',
        ()=>{

          pr.storyStage=5;


          spawnEnemy(
            'earth',
            4650,
            500,
            true
          );


          updateEarthQuest();
        }
      );
    }


    if(stage===6){

      addStory(
        480,
        510,
        'REPAIR SHIP',
        ()=>{

          pr.storyStage=7;


          toast(
            'SHIP ONLINE',
            'Navigation has locked onto the mysterious Hub signal.'
          );


          updateEarthQuest();
        }
      );
    }


    if(stage>=7){

      addStory(
        480,
        510,
        'LAUNCH TO THE HUB',
        ()=>{

          G.unlocked.add(
            'music'
          );


          beginHub();


          toast(
            'THE HUB',
            'You have discovered the Riftwalker base.'
          );
        }
      );
    }
  }


  return(
    list
      .sort(
        (a,b)=>a.d-b.d
      )[0]
    ||
    null
  );
}


function interactionLabel(p){

  return{

    pet:
      'BEFRIEND '+p.name,

    fragment:
      'COLLECT RIFT FRAGMENT',

    beacon:
      'DESTROY WAR BEACON',

    portal:
      'RETURN TO THE HUB'

  }[p.kind]
  ||
  'INTERACT';
}


function interactPickup(p){

  const pr=
    G.progress[
      G.worldId
    ];


  /* PET */

  if(p.kind==='pet'){

    p.taken=true;


    pr.petFound.push(
      p.name
    );


    PET_STATE.owned[p.name]={

      name:p.name,

      level:1,

      x:P.x-60,

      y:P.y,

      attackCd:0
    };


    if(!PET_STATE.active){

      PET_STATE.active=
        p.name;
    }


    SFX.pet();


    toast(
      'NEW PET',
      p.name+
      ' joined your collection.'
    );


    renderPets();

    syncHUD();
  }


  /* RIFT FRAGMENT */

  if(p.kind==='fragment'){

    p.taken=true;


    pr.fragments++;


    addMaterial(
      worldMaterial(
        G.worldId
      ),
      1
    );


    SFX.core();


    toast(
      'RIFT FRAGMENT',
      pr.fragments+
      ' / 5 recovered.'
    );


    if(
      pr.fragments>=5 &&
      (
        G.worldId!=='war' ||
        pr.beacons>=3
      )
    ){

      spawnEnemy(
        G.worldId,
        WORLDS[G.worldId].width-650,
        500,
        true
      );


      quest(
        'WORLD BOSS',
        'Defeat '+
        WORLDS[G.worldId].boss+
        '.'
      );
    }
  }


  /* WAR BEACON */

  if(p.kind==='beacon'){

    p.taken=true;


    pr.beacons++;


    SFX.noise?.();


    toast(
      'WAR BEACON DESTROYED',
      pr.beacons+
      ' / 3 offline.'
    );


    if(
      pr.beacons>=3 &&
      pr.fragments>=5
    ){

      spawnEnemy(
        'war',
        WORLDS.war.width-650,
        500,
        true
      );
    }
  }


  /* RETURN PORTAL */

  if(p.kind==='portal'){

    beginHub();
  }
}


function updateInteraction(){

  const n=
    nearestInteraction();


  if(
    n &&
    n.d<115
  ){

    $('interactPrompt')
      .classList
      .remove('hidden');


    $('interactText').textContent=
      n.label;


    if(
      justPressed.has('e')
    ){

      n.fn();
    }
  }

  else{

    $('interactPrompt')
      .classList
      .add('hidden');
  }
}
/* =========================================================
   ECONOMY HELPERS
   ========================================================= */

function addCredits(n,x=P.x,y=P.y){
  n=Math.max(0,Math.round(n));
  P.credits+=n;

  floatingText(
    '+'+n+' CREDITS',
    x,
    y-70,
    '#8ff5ff'
  );

  SFX.coin();
  syncHUD();
}


function spendCredits(n){

  if(P.credits<n){

    toast(
      'RIFT MARKET',
      'Not enough Rift Credits.'
    );

    return false;
  }

  P.credits-=n;

  SFX.click();

  syncHUD();

  return true;
}


function addMaterial(name,n=1){

  P.materials[name]=
    (P.materials[name]||0)+n;

  floatingText(
    '+'+n+' '+name,
    P.x,
    P.y-70,
    '#d8c7ff'
  );
}


/* =========================================================
   UI / OVERLAYS
   ========================================================= */

function quest(title,text){
  $('questTitle').textContent=title;
  $('questText').textContent=text;
}


function toast(title,text,time=2.5){

  $('toastTitle').textContent=title;

  $('toastText').textContent=text;

  $('toast')
    .classList
    .remove('hidden');

  G.messageTime=time;
}


function syncHUD(){

  const s=getStats();

  if($('lifeText')){
    $('lifeText').textContent=
      G.scene==='world'
        ?STAGE_RUN.life
        :'SAFE';
  }

  P.hp=
    clamp(
      P.hp,
      0,
      s.maxHP
    );

  $('levelText').textContent=
    P.level;

  $('hpText').textContent=
    P.hp+
    ' / '+
    s.maxHP;

  $('hpFill').style.width=
    (
      P.hp/
      s.maxHP*
      100
    )+'%';

  $('hpFill').className=
    P.hp/s.maxHP<.25
      ?'critical'
      :P.hp/s.maxHP<.5
        ?'warning'
        :'';

  $('atkText').textContent=
    s.atk;

  $('defText').textContent=
    s.def;

  $('spdText').textContent=
    s.speed;

  if($('critText')){
    $('critText').textContent=
      Math.round(
        s.critChance*100
      )+'%';
  }

  $('armorText').textContent=
    ARMORS[P.armor]
      .name
      .toUpperCase();

  $('creditText').textContent=
    P.credits
      .toLocaleString();

  $('coreText').textContent=
    G.cores;

  $('weaponText').textContent=
    (
      P.weapon||
      'Fists'
    ).toUpperCase();

  $('petText').textContent=
    (
      PET_STATE.active||
      'No Pet'
    ).toUpperCase();

  $('locationText').textContent=
    G.scene==='hub'
      ?'THE HUB'
      :G.scene==='arena'
        ?'RIFT ARENA'
        :(
          WORLDS[G.worldId]?.name||
          'DEEP SPACE'
        ).toUpperCase();


  const cd=
    s.cooldown;

  const ready=
    1-
    clamp(
      P.attackCooldown/cd,
      0,
      1
    );

  $('cooldownFill').style.width=
    (
      ready*100
    )+'%';

  $('cooldownText').textContent=
    P.attackCooldown<=0
      ?'READY'
      :P.attackCooldown
        .toFixed(1)+'s';

  drawSmallIcons();
}


function drawSmallIcons(){

  const a=
    $('hudAvatar')
      .getContext('2d');

  a.clearRect(
    0,
    0,
    58,
    58
  );

  drawMiniRiftwalker(
    a,
    29,
    45,
    .32
  );


  const c=
    $('creditIcon')
      .getContext('2d');

  c.clearRect(
    0,
    0,
    34,
    34
  );

  c.save();

  c.translate(
    17,
    17
  );

  let g=
    c.createRadialGradient(
      -4,
      -5,
      1,
      0,
      0,
      14
    );

  g.addColorStop(
    0,
    '#fff'
  );

  g.addColorStop(
    .38,
    '#69e7ff'
  );

  g.addColorStop(
    1,
    '#4937b6'
  );

  c.fillStyle=g;

  c.strokeStyle=
    '#bdf7ff';

  c.lineWidth=2;

  c.beginPath();

  c.arc(
    0,
    0,
    13,
    0,
    Math.PI*2
  );

  c.fill();
  c.stroke();

  c.rotate(
    Math.PI/4
  );

  c.fillStyle=
    '#fff';

  c.fillRect(
    -4,
    -4,
    8,
    8
  );

  c.restore();
}


/* =========================================================
   OVERLAY CONTROLS
   ========================================================= */

function openOverlay(id,render){

  if(G.scene==='arena'){
    return;
  }

  document
    .querySelectorAll('.overlay')
    .forEach(
      o=>
        o.classList.add(
          'hidden'
        )
    );

  $(id)
    .classList
    .remove('hidden');

  G.paused=true;

  if(render){
    render();
  }

  SFX.click();
}


function closeOverlay(id){

  $(id)
    .classList
    .add('hidden');

  G.paused=false;

  SFX.click();
}


function toggleOverlay(id,render){

  if(
    G.scene==='menu' ||
    G.scene==='flight' ||
    G.scene==='crash' ||
    G.scene==='travel' ||
    G.scene==='arena'
  ){
    return;
  }

  if(
    $(id)
      .classList
      .contains('hidden')
  ){
    openOverlay(
      id,
      render
    );
  }

  else{
    closeOverlay(id);
  }
}


function closeAllOverlays(){

  document
    .querySelectorAll('.overlay')
    .forEach(
      o=>
        o.classList.add(
          'hidden'
        )
    );

  G.paused=false;
}


function isOverlayOpen(){

  return[
    ...document
      .querySelectorAll('.overlay')
  ].some(
    o=>
      !o.classList
        .contains('hidden')
  );
}


function togglePause(){

  if(
    [
      'menu',
      'flight',
      'crash',
      'travel',
      'arena'
    ].includes(G.scene)
  ){
    return;
  }

  if(
    !$('pauseOverlay')
      .classList
      .contains('hidden')
  ){
    closeOverlay(
      'pauseOverlay'
    );
  }

  else{
    openOverlay(
      'pauseOverlay'
    );
  }
}


document
  .querySelectorAll(
    '[data-close]'
  )
  .forEach(
    b=>
      b.addEventListener(
        'click',
        ()=>
          closeOverlay(
            b.dataset.close
          )
      )
  );


$('resumeBtn').onclick=
  ()=>
    closeOverlay(
      'pauseOverlay'
    );


$('saveBtn').onclick=
  saveGame;


if($('tutorialReplayBtn')){

  $('tutorialReplayBtn').onclick=
    ()=>{

      closeOverlay(
        'pauseOverlay'
      );

      startTutorial(true);
    };
}


$('pauseLoadBtn').onclick=
  loadGame;


$('quitBtn').onclick=
  ()=>{

    closeAllOverlays();

    G.scene='menu';

    $('hud')
      .classList
      .add('hidden');

    $('startScreen')
      .classList
      .remove('hidden');

    MUSIC.setWorld('hub');
  };


/* =========================================================
   INVENTORY
   ========================================================= */

function renderInventory(){

  const grid=
    $('armorGrid');

  grid.innerHTML='';


  for(
    const [id,a]
    of Object.entries(ARMORS)
  ){

    const unlocked=
      a.unlocked ||
      G.completed.has(id) ||
      id==='none' ||
      (
        id==='scout' &&
        G.hubFound
      ) ||
      (
        id==='rift' &&
        G.completed.has('music')
      ) ||
      (
        id==='titan' &&
        G.completed.has('war')
      ) ||
      (
        id==='void' &&
        G.completed.has('void')
      ) ||
      (
        id==='matrix' &&
        G.completed.has('matrix')
      );


    const owned=
      a.unlocked ||
      a.owned ||
      id==='none';


    const card=
      document.createElement(
        'div'
      );


    card.className=
      'itemCard '+
      (
        P.armor===id
          ?'selected'
          :''
      );


    card.innerHTML=
      `
      <div class="armorIcon"></div>

      <h4>
        ${a.name}
      </h4>

      <p>
        HP +${a.hp}
        · ATK +${a.atk}
        · DEF +${a.def}
        · SPD ${a.speed>=0?'+':''}${a.speed}
      </p>
      `;


    const btn=
      document.createElement(
        'button'
      );


    if(owned){

      btn.textContent=
        P.armor===id
          ?'EQUIPPED'
          :'EQUIP';


      btn.disabled=
        P.armor===id;


      btn.onclick=
        ()=>{

          const old=
            getStats()
              .maxHP;

          P.armor=id;

          preserveHealthForStatChange(
            old,
            getStats().maxHP
          );

          renderInventory();

          syncHUD();
        };
    }

    else{

      btn.textContent=
        unlocked
          ?'BUY · '+
            a.price
              .toLocaleString()
          :'LOCKED';


      btn.disabled=
        !unlocked;


      btn.onclick=
        ()=>{

          if(
            spendCredits(
              a.price
            )
          ){

            a.owned=true;

            renderInventory();
          }
        };
    }


    card.appendChild(btn);

    grid.appendChild(card);
  }


  const mg=
    $('materialGrid');

  mg.innerHTML='';


  for(
    const name
    of MATERIALS
  ){

    const card=
      document.createElement(
        'div'
      );


    card.className=
      'itemCard';


    card.innerHTML=
      `
      <div class="materialIcon"></div>

      <h4>
        ${name}
      </h4>

      <p>
        Owned:
        <b>
          ${P.materials[name]||0}
        </b>
      </p>
      `;


    mg.appendChild(card);
  }
}


/* =========================================================
   PET SANCTUARY
   ========================================================= */

function renderPets(){

  const grid=
    $('petGrid');

  grid.innerHTML='';


  const names=
    Object.keys(
      PET_STATE.owned
    );


  if(!names.length){

    grid.innerHTML=
      '<p class="panelNote">You have not befriended a pet yet. Explore the worlds to find them.</p>';
  }


  for(const name of names){

    const o=
      PET_STATE.owned[name];

    const b=
      PET_BONUS[name]||{};

    const card=
      document.createElement(
        'div'
      );


    card.className=
      'petCard '+
      (
        PET_STATE.active===name
          ?'selected'
          :''
      );


    const cv=
      document.createElement(
        'canvas'
      );


    cv.width=70;
    cv.height=58;

    cv.className=
      'petArt';

    card.appendChild(cv);


    card.insertAdjacentHTML(
      'beforeend',
      `
      <h4>
        ${name}
      </h4>

      <p>
        ${PET_TYPES[name]}
        · LV ${o.level}
      </p>

      <p>
        HP +${b.hp||0}
        · ATK +${b.atk||0}
        · DEF +${b.def||0}
        · SPD ${b.speed||0}
      </p>
      `
    );


    const btn=
      document.createElement(
        'button'
      );


    btn.textContent=
      PET_STATE.active===name
        ?'ACTIVE'
        :'SET ACTIVE';


    btn.disabled=
      PET_STATE.active===name;


    btn.onclick=
      ()=>{

        const old=
          getStats()
            .maxHP;


        PET_STATE.active=
          name;


        preserveHealthForStatChange(
          old,
          getStats().maxHP
        );


        renderPets();

        syncHUD();
      };


    card.appendChild(btn);

    grid.appendChild(card);


    drawPetSprite(
      cv.getContext('2d'),
      35,
      43,
      name,
      .55,
      0
    );
  }


  renderJournal();

  renderTraining();
}


function renderJournal(){

  let found=
    Object.keys(
      PET_STATE.owned
    ).length;


  const total=56;


  $('journalSummary').textContent=
    `BASE PET DISCOVERY: ${found} / ${total} · ${Math.round(found/total*100)}% · HIDDEN SECRETS: ${G.easterEggs.size} / ${EASTER_TOTAL} · Evolution forms will expand the journal beyond 100 discoveries.`;


  $('journalGrid').innerHTML='';


  for(
    const id
    of WORLD_ORDER
  ){

    const box=
      document.createElement(
        'div'
      );


    box.className=
      'journalWorld';


    const display=
      id==='matrix' &&
      !G.completed.has('matrix')
        ?'( ........ ...... )'
        :WORLDS[id].name;


    box.innerHTML=
      `
      <h3>
        ${display}
      </h3>

      <div class="journalNames"></div>
      `;


    const row=
      box.querySelector(
        '.journalNames'
      );


    for(
      const name
      of PET_ROSTERS[id]
    ){

      const s=
        document.createElement(
          'span'
        );


      const known=
        !!PET_STATE.owned[name];


      s.className=
        known
          ?'found'
          :'';


      s.textContent=
        id==='matrix' &&
        !G.completed.has('matrix') &&
        !known
          ?'???'
          :known
            ?name
            :'Unknown Pet';


      row.appendChild(s);
    }


    $('journalGrid')
      .appendChild(box);
  }
}


function renderTraining(){

  const ap=
    activePet();


  const c=
    $('trainingPet')
      .getContext('2d');


  c.clearRect(
    0,
    0,
    220,
    180
  );


  if(!ap){

    $('trainingName').textContent=
      'No active pet';


    $('trainingStats').textContent=
      'Find and equip a pet first.';


    $('trainPetBtn').disabled=
      true;


    return;
  }


  drawPetSprite(
    c,
    110,
    125,
    ap.name,
    1.45,
    G.time
  );


  $('trainingName').textContent=
    ap.name+
    ' · LV '+
    ap.level;


  $('trainingStats').textContent=
    'Training strengthens this pet’s stat bonuses and companion attack.';


  $('trainPetBtn').disabled=
    false;
}


$('trainPetBtn').onclick=
  ()=>{

    const ap=
      activePet();


    if(
      !ap ||
      !spendCredits(300)
    ){
      return;
    }


    const old=
      getStats()
        .maxHP;


    ap.level++;


    preserveHealthForStatChange(
      old,
      getStats().maxHP
    );


    SFX.pet();

    renderPets();

    syncHUD();
  };


document
  .querySelectorAll(
    '[data-pet-tab]'
  )
  .forEach(
    b=>
      b.onclick=
        ()=>{

          document
            .querySelectorAll(
              '[data-pet-tab]'
            )
            .forEach(
              x=>
                x.classList.toggle(
                  'active',
                  x===b
                )
            );


          document
            .querySelectorAll(
              '.petPage'
            )
            .forEach(
              x=>
                x.classList.remove(
                  'active'
                )
            );


          $({
            collection:'petCollection',
            journal:'petJournal',
            training:'petTraining'
          }[b.dataset.petTab])
            .classList
            .add('active');
        }
  );


/* =========================================================
   WORLD MAP
   ========================================================= */

function renderWorldMap(){

  const grid=
    $('worldGrid');

  grid.innerHTML='';


  for(
    const id
    of WORLD_ORDER
  ){

    const w=
      WORLDS[id];


    const unlocked=
      G.unlocked.has(id);


    const hidden=
      id==='matrix' &&
      !G.completed.has('void');


    const card=
      document.createElement(
        'div'
      );


    card.className=
      'worldCard '+
      (
        !unlocked
          ?'locked '
          :''
      )+
      (
        G.completed.has(id)
          ?'completed'
          :''
      );


    card.dataset.world=id;


    const orb=
      document.createElement(
        'div'
      );


    orb.className=
      'worldOrb';


    orb.style.background=
      `radial-gradient(circle at 30% 25%,${w.accent},${w.skyB} 45%,${w.dark})`;


    card.appendChild(orb);


    card.insertAdjacentHTML(
      'beforeend',
      `
      <h4>
        ${hidden?'( ........ ...... )':w.name}
      </h4>

      <p>
        ${hidden?'Signal corrupted.':w.desc}
      </p>
      `
    );


    const btn=
      document.createElement(
        'button'
      );


    btn.textContent=
      unlocked
        ?'TRAVEL'
        :'LOCKED';


    btn.disabled=
      !unlocked;


    btn.onclick=
      ()=>
        travelTo(id);


    card.appendChild(btn);

    grid.appendChild(card);
  }
}


/* =========================================================
   SAVE / LOAD
   ========================================================= */

function saveGame(){

  const data={

    G:{
      hubFound:G.hubFound,

      unlocked:[
        ...G.unlocked
      ],

      completed:[
        ...G.completed
      ],

      cores:G.cores,

      easterEggs:[
        ...G.easterEggs
      ],

      tutorialDone:
        G.tutorialDone,

      progress:
        G.progress,

      scene:
        G.scene,

      worldId:
        G.worldId
    },


    P:{
      ...P,
      anim:undefined
    },


    pets:
      PET_STATE,


    armors:
      Object.fromEntries(
        Object.entries(
          ARMORS
        ).map(
          ([k,v])=>[
            k,
            !!v.owned
          ]
        )
      )
  };


  localStorage.setItem(
    'multiverse_riftwalker_v4',
    JSON.stringify(data)
  );


  $('saveStatus').textContent=
    'Game saved.';


  toast(
    'SYSTEM',
    'Game saved.'
  );
}


function loadGame(){

  const raw=
    localStorage.getItem(
      'multiverse_riftwalker_v4'
    );


  if(!raw){

    $('saveStatus').textContent=
      'No save found.';

    return false;
  }


  try{

    const d=
      JSON.parse(raw);


    G.hubFound=
      d.G.hubFound;


    G.unlocked=
      new Set(
        d.G.unlocked
      );


    G.completed=
      new Set(
        d.G.completed
      );


    G.cores=
      d.G.cores;


    G.easterEggs=
      new Set(
        d.G.easterEggs||[]
      );


    G.tutorialDone=
      !!d.G.tutorialDone;


    G.tutorialActive=false;

    G.tutorialStep=0;


    G.progress=
      d.G.progress;


    Object.assign(
      P,
      d.P
    );


    P.baseMaxHP=1000;

    P.baseCritChance=
      P.baseCritChance??.10;

    P.baseCritDamage=
      P.baseCritDamage??2;


    P.anim={
      state:'idle',
      time:0
    };


    Object.assign(
      PET_STATE,
      d.pets
    );


    for(
      const [k,v]
      of Object.entries(
        d.armors||{}
      )
    ){

      if(ARMORS[k]){
        ARMORS[k].owned=v;
      }
    }


    $('startScreen')
      .classList
      .add('hidden');


    $('hud')
      .classList
      .remove('hidden');


    closeAllOverlays();

    MUSIC.start();


    if(d.G.scene==='hub'){

      beginHub();
    }

    else{

      beginWorld(
        d.G.worldId||
        'earth'
      );
    }


    P.hp=
      clamp(
        P.hp,
        1,
        getStats().maxHP
      );


    syncHUD();

    return true;
  }

  catch(err){

    console.error(err);


    $('saveStatus').textContent=
      'Save could not be loaded.';


    return false;
  }
}


/* =========================================================
   PARTICLES / TEXT
   ========================================================= */

function burst(
  x,
  y,
  color,
  n=8
){

  for(
    let i=0;
    i<n;
    i++
  ){

    G.particles.push({

      kind:'particle',

      x,
      y,

      vx:
        rand(
          -120,
          120
        ),

      vy:
        rand(
          -180,
          20
        ),

      life:
        rand(
          .25,
          .7
        ),

      max:.7,

      color,

      size:
        rand(
          2,
          6
        )
    });
  }
}


function floatingText(
  text,
  x,
  y,
  color='#fff'
){

  G.particles.push({

    kind:'text',

    text,

    x,
    y,

    vx:0,

    vy:-42,

    life:.9,

    max:.9,

    color,

    size:12
  });
}


function updateParticles(dt){

  for(
    const p
    of G.particles
  ){

    p.life-=dt;

    p.x+=
      p.vx*dt;

    p.y+=
      p.vy*dt;


    if(
      p.kind==='particle'
    ){

      p.vy+=
        260*dt;
    }
  }


  G.particles=
    G.particles.filter(
      p=>p.life>0
    );
}


/* =========================================================
   DRAWING HELPERS / SHADING
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
  lw=2
){

  c.beginPath();

  c.roundRect(
    x,
    y,
    w,
    h,
    r
  );

  if(fill){

    c.fillStyle=fill;

    c.fill();
  }

  if(stroke){

    c.strokeStyle=stroke;

    c.lineWidth=lw;

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
  lw=2
){

  c.beginPath();

  c.ellipse(
    x,
    y,
    rx,
    ry,
    0,
    0,
    Math.PI*2
  );

  if(fill){

    c.fillStyle=fill;

    c.fill();
  }

  if(stroke){

    c.strokeStyle=stroke;

    c.lineWidth=lw;

    c.stroke();
  }
}


function shadow(
  x,
  y,
  w=52,
  h=13,
  a=.28
){

  ctx.save();


  const g=
    ctx.createRadialGradient(
      x,
      y,
      2,
      x,
      y,
      w/2
    );


  g.addColorStop(
    0,
    `rgba(3,8,18,${a})`
  );


  g.addColorStop(
    1,
    'rgba(3,8,18,0)'
  );


  ctx.translate(
    x,
    y
  );


  ctx.scale(
    1,
    h/w
  );


  ctx.fillStyle=g;


  ctx.beginPath();


  ctx.arc(
    0,
    0,
    w/2,
    0,
    Math.PI*2
  );


  ctx.fill();


  ctx.restore();
}


/* =========================================================
   SPACE BACKGROUND
   ========================================================= */

function space(off=0){

  ctx.fillStyle=
    '#02050d';

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  for(
    let i=0;
    i<150;
    i++
  ){

    const x=
      (
        i*89.7+
        off*
        (
          .08+
          (i%4)*.03
        )
      )%W;


    const y=
      (
        i*47.2
      )%H;


    ctx.globalAlpha=
      .35+
      (i%5)*.1;


    ctx.fillStyle=
      i%13===0
        ?'#7beaff'
        :'#fff';


    ctx.beginPath();


    ctx.arc(
      x,
      y,
      i%17===0
        ?2
        :1,
      0,
      Math.PI*2
    );


    ctx.fill();
  }


  ctx.globalAlpha=1;
}


function drawPlanet(
  x,
  y,
  r,
  a,
  b
){

  const g=
    ctx.createRadialGradient(
      x-r*.3,
      y-r*.35,
      5,
      x,
      y,
      r
    );


  g.addColorStop(
    0,
    a
  );


  g.addColorStop(
    .45,
    b
  );


  g.addColorStop(
    1,
    '#0a1022'
  );


  ctx.fillStyle=g;


  ctx.beginPath();


  ctx.arc(
    x,
    y,
    r,
    0,
    Math.PI*2
  );


  ctx.fill();
}


/* =========================================================
   UPGRADED SPACESHIP
   ========================================================= */

function drawShip(
  x,
  y,
  s=1,
  rot=0
){

  const t=
    G.time||0;


  const flying=
    [
      'flight',
      'travel',
      'crash'
    ].includes(
      G.scene
    );


  const wrecked=
    G.scene==='world' &&
    G.worldId==='earth' &&
    s<1;


  const engineOn=
    flying &&
    !wrecked &&
    (
      G.scene!=='crash' ||
      Math.sin(t*19)>-.35
    );


  ctx.save();


  ctx.translate(
    x,
    y
  );


  ctx.rotate(rot);


  ctx.scale(
    s,
    s
  );


  /* ENGINE GLOW */

  if(engineOn){

    const pulse=
      .82+
      Math.sin(t*18)*.12;


    ctx.save();


    ctx.globalCompositeOperation=
      'lighter';


    for(
      const ey
      of [-22,22]
    ){

      const eg=
        ctx.createRadialGradient(
          -91,
          ey,
          2,
          -91,
          ey,
          32
        );


      eg.addColorStop(
        0,
        'rgba(255,255,255,.95)'
      );


      eg.addColorStop(
        .28,
        'rgba(99,238,255,.9)'
      );


      eg.addColorStop(
        1,
        'rgba(82,91,255,0)'
      );


      ctx.fillStyle=eg;


      ctx.beginPath();


      ctx.ellipse(
        -94,
        ey,
        38*pulse,
        15*pulse,
        0,
        0,
        Math.PI*2
      );


      ctx.fill();


      const flame=
        ctx.createLinearGradient(
          -150,
          ey,
          -82,
          ey
        );


      flame.addColorStop(
        0,
        'rgba(118,74,255,0)'
      );


      flame.addColorStop(
        .45,
        'rgba(103,126,255,.48)'
      );


      flame.addColorStop(
        1,
        'rgba(169,251,255,.95)'
      );


      ctx.fillStyle=flame;


      ctx.beginPath();


      ctx.moveTo(
        -145-rand(0,10),
        ey
      );


      ctx.quadraticCurveTo(
        -112,
        ey-10,
        -78,
        ey-7
      );


      ctx.lineTo(
        -78,
        ey+7
      );


      ctx.quadraticCurveTo(
        -112,
        ey+10,
        -145-rand(0,10),
        ey
      );


      ctx.fill();
    }


    ctx.restore();
  }


  /* SHIP GLOW */

  ctx.shadowColor=
    'rgba(76,220,255,.32)';

  ctx.shadowBlur=22;


  /* REAR WINGS */

  const wing=
    ctx.createLinearGradient(
      -90,
      -60,
      35,
      70
    );


  wing.addColorStop(
    0,
    '#dce8f1'
  );


  wing.addColorStop(
    .55,
    '#778aa0'
  );


  wing.addColorStop(
    1,
    '#314258'
  );


  ctx.fillStyle=wing;

  ctx.strokeStyle=
    '#172438';

  ctx.lineWidth=5;

  ctx.lineJoin=
    'round';


  ctx.beginPath();

  ctx.moveTo(
    -72,
    -17
  );

  ctx.lineTo(
    -35,
    -72
  );

  ctx.lineTo(
    35,
    -43
  );

  ctx.lineTo(
    10,
    -12
  );

  ctx.closePath();

  ctx.fill();

  ctx.stroke();


  ctx.beginPath();

  ctx.moveTo(
    -72,
    17
  );

  ctx.lineTo(
    -35,
    72
  );

  ctx.lineTo(
    35,
    43
  );

  ctx.lineTo(
    10,
    12
  );

  ctx.closePath();

  ctx.fill();

  ctx.stroke();


  /* MAIN HULL */

  const hull=
    ctx.createLinearGradient(
      -105,
      -45,
      115,
      48
    );


  hull.addColorStop(
    0,
    '#f9fdff'
  );


  hull.addColorStop(
    .22,
    '#d8e4ec'
  );


  hull.addColorStop(
    .58,
    '#8da1b5'
  );


  hull.addColorStop(
    1,
    '#40556d'
  );


  ctx.fillStyle=hull;

  ctx.strokeStyle=
    '#172438';

  ctx.lineWidth=6;


  ctx.beginPath();


  ctx.moveTo(
    -105,
    0
  );


  ctx.quadraticCurveTo(
    -70,
    -35,
    -8,
    -45
  );


  ctx.quadraticCurveTo(
    70,
    -40,
    122,
    0
  );


  ctx.quadraticCurveTo(
    70,
    40,
    -8,
    45
  );


  ctx.quadraticCurveTo(
    -70,
    35,
    -105,
    0
  );


  ctx.closePath();

  ctx.fill();

  ctx.stroke();


  /* RED RIFTWALKER STRIPE */

  const stripe=
    ctx.createLinearGradient(
      -88,
      -18,
      22,
      20
    );


  stripe.addColorStop(
    0,
    '#9d2338'
  );


  stripe.addColorStop(
    .45,
    '#e84a5d'
  );


  stripe.addColorStop(
    1,
    '#ff7b7b'
  );


  ctx.fillStyle=stripe;

  ctx.strokeStyle=
    '#7b2332';

  ctx.lineWidth=3;


  ctx.beginPath();

  ctx.moveTo(
    -92,
    -16
  );

  ctx.lineTo(
    -25,
    -25
  );

  ctx.lineTo(
    18,
    -17
  );

  ctx.lineTo(
    -2,
    -4
  );

  ctx.lineTo(
    -90,
    8
  );

  ctx.closePath();

  ctx.fill();

  ctx.stroke();


  /* COCKPIT */

  ctx.shadowBlur=0;


  const canopy=
    ctx.createLinearGradient(
      20,
      -34,
      72,
      26
    );


  canopy.addColorStop(
    0,
    '#d8ffff'
  );


  canopy.addColorStop(
    .25,
    '#69eaff'
  );


  canopy.addColorStop(
    .68,
    '#267ba8'
  );


  canopy.addColorStop(
    1,
    '#102c4b'
  );


  ctx.fillStyle=canopy;

  ctx.strokeStyle=
    '#17304a';

  ctx.lineWidth=5;


  ctx.beginPath();


  ctx.moveTo(
    7,
    -29
  );


  ctx.quadraticCurveTo(
    44,
    -45,
    78,
    -20
  );


  ctx.quadraticCurveTo(
    93,
    -8,
    98,
    0
  );


  ctx.quadraticCurveTo(
    72,
    8,
    22,
    9
  );


  ctx.closePath();

  ctx.fill();

  ctx.stroke();


  ctx.save();

  ctx.globalAlpha=.55;

  ctx.strokeStyle=
    '#e9ffff';

  ctx.lineWidth=3;

  ctx.beginPath();

  ctx.moveTo(
    28,
    -27
  );

  ctx.quadraticCurveTo(
    50,
    -35,
    69,
    -22
  );

  ctx.stroke();

  ctx.restore();


  /* NOSE ARMOR */

  ctx.fillStyle=
    '#25394f';


  ctx.beginPath();

  ctx.moveTo(
    92,
    -17
  );

  ctx.lineTo(
    122,
    0
  );

  ctx.lineTo(
    92,
    17
  );

  ctx.lineTo(
    77,
    7
  );

  ctx.closePath();

  ctx.fill();

  ctx.stroke();


  /* SHIP RIFT CORE */

  ctx.save();

  ctx.translate(
    -10,
    5
  );

  ctx.rotate(
    Math.PI/4
  );

  ctx.shadowColor=
    '#64efff';

  ctx.shadowBlur=18;

  ctx.fillStyle=
    '#dfffff';

  ctx.strokeStyle=
    '#4dcbe7';

  ctx.lineWidth=3;

  ctx.fillRect(
    -9,
    -9,
    18,
    18
  );

  ctx.strokeRect(
    -9,
    -9,
    18,
    18
  );

  ctx.restore();


  /* TWIN ENGINES */

  for(
    const ey
    of [-22,22]
  ){

    const eg=
      ctx.createLinearGradient(
        -102,
        ey-12,
        -65,
        ey+12
      );


    eg.addColorStop(
      0,
      '#27374c'
    );


    eg.addColorStop(
      1,
      '#111c2c'
    );


    rr(
      ctx,
      -105,
      ey-11,
      42,
      22,
      8,
      eg,
      '#172438',
      4
    );


    ellipse(
      ctx,
      -98,
      ey,
      8,
      7,
      engineOn
        ?'#bffcff'
        :'#40546a',
      '#172438',
      2
    );
  }


  /* PANEL DETAILS */

  ctx.strokeStyle=
    'rgba(28,49,70,.65)';

  ctx.lineWidth=2;

  ctx.beginPath();

  ctx.moveTo(
    -46,
    -32
  );

  ctx.lineTo(
    -31,
    30
  );

  ctx.moveTo(
    2,
    -39
  );

  ctx.lineTo(
    13,
    31
  );

  ctx.stroke();


  for(
    const [lx,ly,c]
    of [
      [-52,-31,'#6cecff'],
      [-52,31,'#6cecff'],
      [57,25,'#ff667d']
    ]
  ){

    ctx.shadowColor=c;

    ctx.shadowBlur=9;

    ellipse(
      ctx,
      lx,
      ly,
      3,
      3,
      c
    );
  }


  ctx.shadowBlur=0;


  /* CRASHED SHIP DETAILS */

  if(wrecked){

    ctx.strokeStyle=
      '#1a2636';

    ctx.lineWidth=6;

    ctx.beginPath();

    ctx.moveTo(
      -38,
      32
    );

    ctx.lineTo(
      -48,
      54
    );

    ctx.moveTo(
      48,
      29
    );

    ctx.lineTo(
      58,
      52
    );

    ctx.stroke();


    ellipse(
      ctx,
      -49,
      56,
      14,
      5,
      '#17202d'
    );


    ellipse(
      ctx,
      59,
      54,
      14,
      5,
      '#17202d'
    );


    ctx.strokeStyle=
      '#56353a';

    ctx.lineWidth=4;

    ctx.beginPath();

    ctx.moveTo(
      35,
      -5
    );

    ctx.lineTo(
      52,
      10
    );

    ctx.lineTo(
      39,
      21
    );

    ctx.moveTo(
      -18,
      -35
    );

    ctx.lineTo(
      -4,
      -19
    );

    ctx.stroke();


    ctx.save();

    ctx.globalAlpha=
      .28+
      .12*
      Math.sin(
        t*2.4
      );


    for(
      let i=0;
      i<4;
      i++
    ){

      const sx=
        -74+i*9;


      const sy=
        -43-
        i*13-
        (
          t*8%
          (18+i*5)
        );


      ellipse(
        ctx,
        sx,
        sy,
        11+i*3,
        8+i*2,
        '#2d3440'
      );
    }


    ctx.restore();
  }


  ctx.restore();
}


/* =========================================================
   RIFTWALKER CHARACTER
   ========================================================= */

function drawMiniRiftwalker(
  c,
  x,
  y,
  s=.5
){

  c.save();

  c.translate(
    x,
    y
  );

  c.scale(
    s,
    s
  );


  ellipse(
    c,
    0,
    -80,
    34,
    37,
    '#f7fbff',
    '#182333',
    6
  );


  rr(
    c,
    -23,
    -55,
    46,
    55,
    18,
    '#233957',
    '#182333',
    6
  );


  c.fillStyle=
    '#e94759';


  c.beginPath();

  c.moveTo(
    -18,
    -55
  );

  c.lineTo(
    -65,
    -45
  );

  c.lineTo(
    -25,
    -30
  );

  c.closePath();

  c.fill();


  ellipse(
    c,
    -11,
    -84,
    5,
    3,
    '#6ceaff'
  );


  ellipse(
    c,
    11,
    -84,
    5,
    3,
    '#6ceaff'
  );


  c.restore();
}


function drawRiftwalker(
  x,
  y,
  scale=1,
  remote=false
){

  const t=
    G.time;


  const run=
    P.anim.state==='run'
      ?Math.sin(
        P.anim.time*14
      )
      :0;


  const idle=
    Math.sin(
      t*3
    )*2;


  const attack=
    P.attackTimer>0;


  const ai=
    P.attackIndex;


  ctx.save();


  ctx.translate(
    x,
    y
  );


  ctx.scale(
    P.facing*scale,
    scale
  );


  if(
    !remote &&
    P.hitFlash>0
  ){

    ctx.globalAlpha=
      .55+
      Math.sin(t*70)*.35;
  }


  shadow(
    0,
    8,
    60,
    14,
    .34
  );


  /* LEGS */

  const leg=
    run*10;


  ctx.strokeStyle=
    '#182333';

  ctx.lineWidth=14;

  ctx.lineCap=
    'round';


  ctx.beginPath();


  ctx.moveTo(
    -11,
    -35
  );

  ctx.lineTo(
    -16-leg,
    0
  );


  ctx.moveTo(
    11,
    -35
  );

  ctx.lineTo(
    16+leg,
    0
  );


  ctx.stroke();


  ellipse(
    ctx,
    -19-leg,
    4,
    22,
    10,
    '#d94859',
    '#182333',
    4
  );


  ellipse(
    ctx,
    19+leg,
    4,
    22,
    10,
    '#d94859',
    '#182333',
    4
  );


  /* BODY */

  const body=
    ctx.createLinearGradient(
      -30,
      -95,
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
    -96+idle,
    58,
    65,
    22,
    body,
    '#182333',
    6
  );


  /* SHOULDER ARMOR */

  rr(
    ctx,
    -35,
    -88+idle,
    18,
    25,
    8,
    '#334d70',
    '#172131',
    4
  );


  rr(
    ctx,
    17,
    -88+idle,
    18,
    25,
    8,
    '#334d70',
    '#172131',
    4
  );


  /* RIFT CORE */

  ctx.save();

  ctx.translate(
    0,
    -64+idle
  );

  ctx.rotate(
    Math.PI/4
  );

  ctx.shadowColor=
    '#65eaff';

  ctx.shadowBlur=15;

  ctx.fillStyle=
    '#dffcff';

  ctx.fillRect(
    -7,
    -7,
    14,
    14
  );

  ctx.strokeStyle=
    '#4bbbd8';

  ctx.lineWidth=2;

  ctx.strokeRect(
    -7,
    -7,
    14,
    14
  );

  ctx.restore();


  /* RED ENERGY SCARF */

  ctx.fillStyle=
    '#e94759';

  ctx.strokeStyle=
    '#7e2435';

  ctx.lineWidth=4;


  ctx.beginPath();


  ctx.moveTo(
    -18,
    -108+idle
  );


  ctx.lineTo(
    -78-
    Math.sin(t*5)*10,
    -100+idle
  );


  ctx.lineTo(
    -40,
    -78+idle
  );


  ctx.lineTo(
    -12,
    -88+idle
  );


  ctx.closePath();

  ctx.fill();

  ctx.stroke();


  /* ARMS */

  let rightX=42;

  let rightY=-60;

  let leftX=-42;

  let leftY=-58;


  if(attack){

    const phase=
      1-
      P.attackTimer/.25;


    if(ai===0){

      rightX=55;

      rightY=
        -100+
        phase*40;
    }

    else if(ai===1){

      rightX=62;

      rightY=
        -48-
        phase*45;
    }

    else{

      rightX=58;

      rightY=-85;
    }
  }


  ctx.strokeStyle=
    '#172131';

  ctx.lineWidth=13;


  ctx.beginPath();


  ctx.moveTo(
    -21,
    -80+idle
  );


  ctx.lineTo(
    leftX,
    leftY+run*6
  );


  ctx.moveTo(
    21,
    -80+idle
  );


  ctx.lineTo(
    rightX,
    rightY-run*6
  );


  ctx.stroke();


  ellipse(
    ctx,
    leftX,
    leftY+run*6,
    9,
    9,
    '#dbe9f4',
    '#172131',
    3
  );


  ellipse(
    ctx,
    rightX,
    rightY-run*6,
    9,
    9,
    '#dbe9f4',
    '#172131',
    3
  );


  /* HEAD */

  const head=
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
    '#fff'
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
    -129+idle,
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
    -142+idle,
    56,
    25,
    12,
    '#111b2c',
    '#172131',
    4
  );


  ctx.shadowColor=
    '#62eaff';

  ctx.shadowBlur=12;


  ellipse(
    ctx,
    -12,
    -130+idle,
    6,
    3,
    '#7af1ff'
  );


  ellipse(
    ctx,
    12,
    -130+idle,
    6,
    3,
    '#7af1ff'
  );


  ctx.shadowBlur=0;


  /* NOVA SWORD */

  if(
    P.weapon ||
    remote
  ){

    ctx.save();


    ctx.translate(
      rightX,
      rightY-run*6
    );


    let ang=-.35;


    if(attack){

      const ph=
        1-
        P.attackTimer/.25;


      ang=
        ai===0
          ?-1.5+
            ph*1.8

          :ai===1
            ?.5-
              ph*2

            :-1.7+
              ph*3.4;
    }


    ctx.rotate(ang);


    ctx.shadowColor=
      '#9d68ff';

    ctx.shadowBlur=22;


    const sg=
      ctx.createLinearGradient(
        0,
        -72,
        0,
        5
      );


    sg.addColorStop(
      0,
      '#fff'
    );


    sg.addColorStop(
      .35,
      '#e7ddff'
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
      -82
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


    ctx.fillStyle=sg;

    ctx.fill();


    ctx.strokeStyle=
      '#5a45b7';

    ctx.lineWidth=3;

    ctx.stroke();


    ctx.shadowBlur=0;


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


  /* ATTACK SLASH */

  if(attack){

    ctx.save();


    ctx.globalAlpha=.65;


    ctx.strokeStyle=
      ai===2
        ?'#e6d9ff'
        :'#9d7aff';


    ctx.lineWidth=
      ai===2
        ?12
        :7;


    ctx.shadowColor=
      '#9c6fff';

    ctx.shadowBlur=18;


    ctx.beginPath();


    ctx.arc(
      20,
      -70,
      ai===2
        ?92
        :70,
      -1.9,
      .7
    );


    ctx.stroke();


    ctx.restore();
  }


  ctx.restore();
}


/* =========================================================
   PET DRAWING
   ========================================================= */

function hashColor(name){

  let h=0;


  for(
    const ch
    of name
  ){

    h=
      (
        h*31+
        ch.charCodeAt(0)
      )>>>0;
  }


  return(
    `hsl(${h%360} 62% 64%)`
  );
}


function drawPetSprite(
  c,
  x,
  y,
  name,
  scale=1,
  time=0
){

  const color=
    hashColor(name);


  const type=
    PET_TYPES[name]||'';


  const fly=
    /Bird|Finch|Hawk|Eagle|Butterfly|Moth|Starling|Bee/
      .test(name);


  const bot=
    /Bot/
      .test(name);


  const long=
    /Serpent|Squid|Spider/
      .test(name);


  const bob=
    Math.sin(
      time*4+
      (name.length%5)
    )*3;


  c.save();


  c.translate(
    x,
    y+
    (
      fly
        ?-12+bob
        :0
    )
  );


  c.scale(
    scale,
    scale
  );


  /* SHADOW */

  c.globalAlpha=.18;

  c.fillStyle=
    '#06101a';

  c.beginPath();

  c.ellipse(
    0,
    7,
    26,
    7,
    0,
    0,
    Math.PI*2
  );

  c.fill();

  c.globalAlpha=1;


  /* WINGS */

  if(fly){

    c.fillStyle=color;

    c.strokeStyle=
      '#192438';

    c.lineWidth=4;


    c.beginPath();


    c.ellipse(
      -22,
      -18,
      18,
      10,
      -.5,
      0,
      Math.PI*2
    );


    c.ellipse(
      22,
      -18,
      18,
      10,
      .5,
      0,
      Math.PI*2
    );


    c.fill();

    c.stroke();
  }


  /* LONG PET BODY */

  if(long){

    c.strokeStyle=color;

    c.lineWidth=17;

    c.lineCap=
      'round';


    c.beginPath();


    c.moveTo(
      -24,
      -5
    );


    c.quadraticCurveTo(
      0,
      14,
      24,
      -7
    );


    c.stroke();
  }


  /* MAIN BODY */

  const bodyGrad=
    c.createLinearGradient(
      -20,
      -35,
      22,
      5
    );


  bodyGrad.addColorStop(
    0,
    '#f8fbff'
  );


  bodyGrad.addColorStop(
    .18,
    color
  );


  bodyGrad.addColorStop(
    1,
    '#40506b'
  );


  c.fillStyle=
    bodyGrad;


  c.strokeStyle=
    '#182333';


  c.lineWidth=4;


  c.beginPath();


  c.ellipse(
    0,
    -14,
    bot
      ?24
      :25,
    bot
      ?22
      :24,
    0,
    0,
    Math.PI*2
  );


  c.fill();

  c.stroke();


  /* RABBIT EARS */

  if(
    /Rabbit|Bunny|Hare/
      .test(name)
  ){

    rr(
      c,
      -18,
      -48,
      10,
      28,
      7,
      color,
      '#182333',
      3
    );


    rr(
      c,
      8,
      -48,
      10,
      28,
      7,
      color,
      '#182333',
      3
    );
  }


  /* ANIMAL EARS */

  if(
    /Cat|Fox|Pup|Hound|Wolf|Lion|Fawn|Boar/
      .test(name)
  ){

    c.fillStyle=color;

    c.strokeStyle=
      '#182333';


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

  if(bot){

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


    c.fillStyle=
      '#67ecff';


    c.fillRect(
      -10,
      -21,
      20,
      5
    );
  }

  else{

    c.fillStyle=
      '#102034';


    c.beginPath();


    c.arc(
      -8,
      -18,
      3,
      0,
      Math.PI*2
    );


    c.arc(
      8,
      -18,
      3,
      0,
      Math.PI*2
    );


    c.fill();


    c.strokeStyle=
      '#102034';


    c.lineWidth=2;


    c.beginPath();


    c.arc(
      0,
      -10,
      6,
      .2,
      Math.PI-.2
    );


    c.stroke();
  }


  /* MATRIX GLITCH */

  if(
    type.includes(
      'Glitch'
    )
  ){

    c.globalAlpha=.45;


    c.fillStyle=
      '#62f4ff';


    c.fillRect(
      -32,
      -35,
      18,
      4
    );


    c.fillStyle=
      '#e45cff';


    c.fillRect(
      14,
      -5,
      22,
      4
    );
  }


  c.restore();
}


/* =========================================================
   ENEMY DRAWING
   ========================================================= */

function drawEnemy(e,cam){

  const x=
    e.x-cam;


  const y=
    e.y;


  const bob=
    Math.sin(
      G.time*4+
      e.x*.01
    )*3;


  shadow(
    x,
    y+8,
    e.boss
      ?128
      :72,
    e.boss
      ?27
      :15,
    e.boss
      ?.42
      :.3
  );


  ctx.save();


  ctx.translate(
    x,
    y
  );


  if(e.hit>0){

    ctx.globalAlpha=
      .78+
      Math.sin(
        G.time*80
      )*.2;
  }


  if(e.boss){

    drawBossCreature(
      e,
      bob
    );
  }

  else{

    drawWorldCreature(
      e,
      bob
    );
  }


  ctx.restore();


  const ratio=
    clamp(
      e.hp/e.maxHP,
      0,
      1
    );


  const bw=
    e.boss
      ?124
      :68;


  const by=
    y-
    (
      e.boss
        ?158
        :108
    );


  rr(
    ctx,
    x-bw/2,
    by,
    bw,
    8,
    4,
    'rgba(4,8,18,.9)',
    'rgba(255,255,255,.12)',
    1
  );


  rr(
    ctx,
    x-bw/2+1,
    by+1,
    (bw-2)*ratio,
    6,
    3,
    e.boss
      ?'#ff657d'
      :'#69e3a1'
  );


  if(e.boss){

    ctx.fillStyle=
      '#fff';


    ctx.font=
      '900 11px system-ui';


    ctx.textAlign=
      'center';


    ctx.fillText(
      e.name,
      x,
      by-10
    );


    ctx.textAlign=
      'left';
  }
}


function enemyEyes(
  y=-48,
  color='#dffcff',
  spread=10
){

  ctx.shadowColor=
    color;


  ctx.shadowBlur=10;


  ellipse(
    ctx,
    -spread,
    y,
    4,
    3,
    color
  );


  ellipse(
    ctx,
    spread,
    y,
    4,
    3,
    color
  );


  ctx.shadowBlur=0;
}
function drawWorldCreature(e,bob){
  const v=e.variant||0,hit=e.hit>0?'#ffffff':null;
  ctx.lineJoin='round';ctx.lineCap='round';

  if(e.world==='earth'){
    // Moss stalker / beetle / ruin crawler.
    const body=hit||['#4f9b65','#66866c','#7b7b68'][v];

    ctx.strokeStyle='#18382f';
    ctx.lineWidth=7;

    ctx.beginPath();
    ctx.moveTo(-25,-30+bob);
    ctx.lineTo(-39,0);

    ctx.moveTo(-7,-27+bob);
    ctx.lineTo(-12,4);

    ctx.moveTo(20,-27+bob);
    ctx.lineTo(33,3);

    ctx.moveTo(34,-31+bob);
    ctx.lineTo(48,-1);
    ctx.stroke();

    const g=ctx.createLinearGradient(-38,-70,40,-18);
    g.addColorStop(0,hit||'#a7df86');
    g.addColorStop(1,body);

    ellipse(
      ctx,
      0,
      -42+bob,
      40,
      27,
      g,
      '#17372e',
      5
    );

    ctx.fillStyle=hit||'#8ee6d1';
    ctx.strokeStyle='#315a55';
    ctx.lineWidth=3;

    for(let i=-1;i<=1;i++){
      ctx.beginPath();
      ctx.moveTo(i*18,-60+bob);
      ctx.lineTo(i*18+9,-88-(i===0?8:0)+bob);
      ctx.lineTo(i*18+16,-58+bob);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ellipse(
      ctx,
      35,
      -47+bob,
      19,
      17,
      hit||'#5c8d62',
      '#17372e',
      4
    );

    enemyEyes(
      -50+bob,
      '#caff9c',
      7
    );
  }

  else if(e.world==='music'){
    // Amp spider.

    ctx.strokeStyle='#17142e';
    ctx.lineWidth=8;

    for(const side of [-1,1]){
      for(let i=0;i<3;i++){

        const yy=-50+i*14+bob;

        ctx.beginPath();
        ctx.moveTo(side*25,yy);
        ctx.lineTo(side*(45+i*4),yy-10);
        ctx.lineTo(side*(57+i*5),yy+7);
        ctx.stroke();
      }
    }

    const g=ctx.createLinearGradient(-35,-78,35,-15);

    g.addColorStop(
      0,
      hit||'#6c59b9'
    );

    g.addColorStop(
      1,
      hit||'#2b2456'
    );

    rr(
      ctx,
      -34,
      -77+bob,
      68,
      61,
      18,
      g,
      '#17142e',
      5
    );

    ctx.shadowColor='#6cecff';
    ctx.shadowBlur=12;

    ellipse(
      ctx,
      0,
      -47+bob,
      20,
      20,
      '#15182b',
      '#7b70ff',
      4
    );

    ellipse(
      ctx,
      0,
      -47+bob,
      8,
      8,
      hit||'#67efff',
      '#2a3159',
      2
    );

    ctx.shadowBlur=0;

    for(let i=-2;i<=2;i++){
      rr(
        ctx,
        i*9-3,
        -13-Math.abs(i)*4+bob,
        6,
        10+Math.abs(i)*4,
        2,
        i%2?'#ff70d8':'#68efff'
      );
    }
  }

  else if(e.world==='money'){
    // Coin mimic.

    ctx.strokeStyle='#4c3421';
    ctx.lineWidth=7;

    ctx.beginPath();

    ctx.moveTo(-24,-20+bob);
    ctx.lineTo(-33,2);
    ctx.lineTo(-44,5);

    ctx.moveTo(24,-20+bob);
    ctx.lineTo(33,2);
    ctx.lineTo(44,5);

    ctx.stroke();

    const g=ctx.createLinearGradient(-38,-75,38,-10);

    g.addColorStop(
      0,
      hit||'#d4a958'
    );

    g.addColorStop(
      1,
      hit||'#72502d'
    );

    rr(
      ctx,
      -40,
      -65+bob,
      80,
      52,
      10,
      g,
      '#49321e',
      5
    );

    rr(
      ctx,
      -42,
      -78+bob,
      84,
      24,
      12,
      hit||'#a97b3f',
      '#49321e',
      5
    );

    ctx.fillStyle='#f7e6bd';

    for(let i=-2;i<=2;i++){

      ctx.beginPath();

      ctx.moveTo(
        i*13-5,
        -47+bob
      );

      ctx.lineTo(
        i*13,
        -35+bob
      );

      ctx.lineTo(
        i*13+5,
        -47+bob
      );

      ctx.fill();
    }

    ellipse(
      ctx,
      0,
      -72+bob,
      11,
      11,
      '#f0d16b',
      '#70572a',
      3
    );

    ctx.fillStyle='#5a4025';
    ctx.font='900 11px system-ui';
    ctx.textAlign='center';

    ctx.fillText(
      'R',
      0,
      -68+bob
    );

    ctx.textAlign='left';

    enemyEyes(
      -51+bob,
      '#fff2a6',
      17
    );
  }

  else if(e.world==='cosmos'){
    // Meteor crab.

    ctx.strokeStyle='#22264e';
    ctx.lineWidth=7;

    for(const side of [-1,1]){

      ctx.beginPath();

      ctx.moveTo(
        side*22,
        -27+bob
      );

      ctx.lineTo(
        side*42,
        -2
      );

      ctx.lineTo(
        side*53,
        2
      );

      ctx.stroke();

      ctx.beginPath();

      ctx.moveTo(
        side*30,
        -49+bob
      );

      ctx.lineTo(
        side*56,
        -64+bob
      );

      ctx.stroke();

      ellipse(
        ctx,
        side*63,
        -67+bob,
        15,
        11,
        hit||'#6e72bb',
        '#292c58',
        4
      );
    }

    const g=ctx.createRadialGradient(
      -10,
      -58,
      3,
      0,
      -45,
      42
    );

    g.addColorStop(
      0,
      hit||'#b7c9ff'
    );

    g.addColorStop(
      .45,
      hit||'#6469aa'
    );

    g.addColorStop(
      1,
      hit||'#343764'
    );

    ellipse(
      ctx,
      0,
      -42+bob,
      39,
      31,
      g,
      '#22264e',
      5
    );

    ctx.shadowColor='#9eeeff';
    ctx.shadowBlur=14;

    ctx.save();

    ctx.translate(
      0,
      -43+bob
    );

    ctx.rotate(
      Math.PI/4
    );

    ctx.fillStyle='#dffcff';

    ctx.fillRect(
      -8,
      -8,
      16,
      16
    );

    ctx.restore();

    ctx.shadowBlur=0;

    enemyEyes(
      -58+bob,
      '#dffcff',
      13
    );
  }

  else if(e.world==='war'){
    // Battle droid.

    ctx.strokeStyle='#251f22';
    ctx.lineWidth=9;

    ctx.beginPath();

    ctx.moveTo(-15,-28+bob);
    ctx.lineTo(-20,3);

    ctx.moveTo(15,-28+bob);
    ctx.lineTo(20,3);

    ctx.moveTo(-30,-58+bob);
    ctx.lineTo(-52,-33+bob);

    ctx.moveTo(30,-58+bob);
    ctx.lineTo(55,-45+bob);

    ctx.stroke();

    const g=ctx.createLinearGradient(-32,-90,32,-20);

    g.addColorStop(
      0,
      hit||'#9b7b6f'
    );

    g.addColorStop(
      1,
      hit||'#4b3c3d'
    );

    rr(
      ctx,
      -33,
      -88+bob,
      66,
      64,
      12,
      g,
      '#2b2326',
      5
    );

    rr(
      ctx,
      -23,
      -105+bob,
      46,
      26,
      9,
      hit||'#6e5b59',
      '#2b2326',
      4
    );

    ctx.fillStyle='#ff765f';
    ctx.shadowColor='#ff765f';
    ctx.shadowBlur=12;

    ctx.fillRect(
      -15,
      -95+bob,
      30,
      5
    );

    ctx.shadowBlur=0;

    rr(
      ctx,
      45,
      -53+bob,
      28,
      12,
      5,
      '#3a3033',
      '#201b1d',
      4
    );
  }

  else if(e.world==='void'){
    // Shadow hound.

    ctx.strokeStyle='#10091a';
    ctx.lineWidth=9;

    ctx.beginPath();

    ctx.moveTo(-22,-28+bob);
    ctx.lineTo(-31,3);

    ctx.moveTo(18,-28+bob);
    ctx.lineTo(26,3);

    ctx.stroke();

    const g=ctx.createLinearGradient(-42,-72,40,-16);

    g.addColorStop(
      0,
      hit||'#6c4b8f'
    );

    g.addColorStop(
      1,
      hit||'#21112f'
    );

    ellipse(
      ctx,
      -4,
      -43+bob,
      39,
      25,
      g,
      '#10091a',
      5
    );

    ellipse(
      ctx,
      30,
      -52+bob,
      22,
      20,
      hit||'#3a1c50',
      '#10091a',
      5
    );

    ctx.fillStyle=
      hit||'#6f49a1';

    ctx.beginPath();

    ctx.moveTo(
      18,
      -68+bob
    );

    ctx.lineTo(
      25,
      -92+bob
    );

    ctx.lineTo(
      33,
      -68+bob
    );

    ctx.moveTo(
      35,
      -68+bob
    );

    ctx.lineTo(
      49,
      -88+bob
    );

    ctx.lineTo(
      48,
      -61+bob
    );

    ctx.fill();

    ctx.strokeStyle='#7b54b0';
    ctx.lineWidth=8;

    ctx.beginPath();

    ctx.moveTo(
      -40,
      -45+bob
    );

    ctx.quadraticCurveTo(
      -70,
      -70+bob,
      -82,
      -42+bob
    );

    ctx.stroke();

    enemyEyes(
      -54+bob,
      '#d99cff',
      8
    );
  }

  else{
    // Matrix fragment bot.

    ctx.strokeStyle='#071c27';
    ctx.lineWidth=8;

    ctx.beginPath();

    ctx.moveTo(-20,-28+bob);
    ctx.lineTo(-30,2);

    ctx.moveTo(20,-28+bob);
    ctx.lineTo(31,2);

    ctx.moveTo(-30,-57+bob);
    ctx.lineTo(-52,-45+bob);

    ctx.moveTo(30,-57+bob);
    ctx.lineTo(53,-68+bob);

    ctx.stroke();

    const g=ctx.createLinearGradient(
      -34,
      -90,
      34,
      -20
    );

    g.addColorStop(
      0,
      hit||'#61eee6'
    );

    g.addColorStop(
      .45,
      hit||'#3c74a3'
    );

    g.addColorStop(
      1,
      hit||'#352c72'
    );

    ctx.fillStyle=g;
    ctx.strokeStyle='#071c27';
    ctx.lineWidth=5;

    ctx.beginPath();

    ctx.moveTo(
      -30,
      -84+bob
    );

    ctx.lineTo(
      25,
      -92+bob
    );

    ctx.lineTo(
      38,
      -58+bob
    );

    ctx.lineTo(
      24,
      -24+bob
    );

    ctx.lineTo(
      -34,
      -30+bob
    );

    ctx.lineTo(
      -42,
      -61+bob
    );

    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    rr(
      ctx,
      -22,
      -76+bob,
      44,
      22,
      6,
      '#071927',
      '#163c4d',
      3
    );

    ctx.fillStyle='#6efff2';

    ctx.fillRect(
      -14,
      -68+bob,
      10,
      4
    );

    ctx.fillStyle='#e46dff';

    ctx.fillRect(
      5,
      -68+bob,
      14,
      4
    );

    ctx.globalAlpha=.5;

    ctx.fillStyle='#65f4ff';

    ctx.fillRect(
      -48,
      -49+bob,
      20,
      4
    );

    ctx.fillStyle='#e45cff';

    ctx.fillRect(
      25,
      -35+bob,
      30,
      4
    );

    ctx.globalAlpha=1;
  }
}


/* =========================================================
   BOSS CREATURES
   ========================================================= */

function drawBossCreature(e,bob){

  const accent=
    WORLDS[e.world]?.accent||
    '#ff7589';

  const hit=
    e.hit>0
      ?'#fff'
      :accent;

  ctx.scale(
    1.45,
    1.45
  );

  ctx.strokeStyle='#171422';
  ctx.lineWidth=8;

  ctx.beginPath();

  ctx.moveTo(-28,-34+bob);
  ctx.lineTo(-38,2);

  ctx.moveTo(28,-34+bob);
  ctx.lineTo(38,2);

  ctx.moveTo(-42,-72+bob);
  ctx.lineTo(-68,-44+bob);

  ctx.moveTo(42,-72+bob);
  ctx.lineTo(68,-44+bob);

  ctx.stroke();

  const g=
    ctx.createLinearGradient(
      -48,
      -120,
      48,
      -20
    );

  g.addColorStop(
    0,
    hit
  );

  g.addColorStop(
    .38,
    e.world==='void'
      ?'#6f43a4'
      :'#a04d58'
  );

  g.addColorStop(
    1,
    '#352039'
  );

  ctx.fillStyle=g;

  ctx.strokeStyle='#171422';

  ctx.lineWidth=6;

  ctx.beginPath();

  ctx.moveTo(
    -45,
    -98+bob
  );

  ctx.lineTo(
    -22,
    -122+bob
  );

  ctx.lineTo(
    0,
    -112+bob
  );

  ctx.lineTo(
    22,
    -122+bob
  );

  ctx.lineTo(
    45,
    -98+bob
  );

  ctx.lineTo(
    50,
    -45+bob
  );

  ctx.lineTo(
    27,
    -22+bob
  );

  ctx.lineTo(
    -28,
    -22+bob
  );

  ctx.lineTo(
    -50,
    -45+bob
  );

  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  rr(
    ctx,
    -34,
    -103+bob,
    68,
    30,
    10,
    '#111526',
    '#25203d',
    4
  );

  enemyEyes(
    -88+bob,
    '#ffe1d8',
    15
  );

  ctx.shadowColor=accent;
  ctx.shadowBlur=18;

  ctx.save();

  ctx.translate(
    0,
    -55+bob
  );

  ctx.rotate(
    Math.PI/4
  );

  ctx.fillStyle='#fff';
  ctx.strokeStyle=accent;
  ctx.lineWidth=3;

  ctx.fillRect(
    -9,
    -9,
    18,
    18
  );

  ctx.strokeRect(
    -9,
    -9,
    18,
    18
  );

  ctx.restore();

  ctx.shadowBlur=0;

  ctx.fillStyle=hit;
  ctx.strokeStyle='#171422';
  ctx.lineWidth=4;

  if(
    e.world==='earth' ||
    e.world==='void'
  ){

    ctx.beginPath();

    ctx.moveTo(
      -36,
      -105+bob
    );

    ctx.lineTo(
      -52,
      -138+bob
    );

    ctx.lineTo(
      -20,
      -114+bob
    );

    ctx.moveTo(
      36,
      -105+bob
    );

    ctx.lineTo(
      52,
      -138+bob
    );

    ctx.lineTo(
      20,
      -114+bob
    );

    ctx.fill();
    ctx.stroke();
  }

  if(e.world==='war'){

    rr(
      ctx,
      -76,
      -52+bob,
      34,
      16,
      5,
      '#4b3a3d',
      '#171422',
      4
    );

    rr(
      ctx,
      42,
      -52+bob,
      34,
      16,
      5,
      '#4b3a3d',
      '#171422',
      4
    );
  }

  if(e.world==='matrix'){

    ctx.globalAlpha=.55;

    ctx.fillStyle='#61eee6';

    ctx.fillRect(
      -62,
      -70+bob,
      28,
      5
    );

    ctx.fillStyle='#e45cff';

    ctx.fillRect(
      35,
      -42+bob,
      32,
      5
    );

    ctx.globalAlpha=1;
  }
}


/* =========================================================
   WORLD PROPS
   ========================================================= */

function drawProp(type,x,y,cam,world){

  x-=cam;

  ctx.save();

  ctx.translate(
    x,
    y
  );

  ctx.lineJoin='round';
  ctx.lineCap='round';

  const k=
    type%4;


  /* EARTH */

  if(world==='earth'){

    if(k===0){

      const trunk=
        ctx.createLinearGradient(
          -18,
          -120,
          18,
          0
        );

      trunk.addColorStop(
        0,
        '#a77a4d'
      );

      trunk.addColorStop(
        1,
        '#493426'
      );

      rr(
        ctx,
        -17,
        -112,
        34,
        116,
        13,
        trunk,
        '#2f2b26',
        4
      );

      for(
        const [dx,dy,r]
        of [
          [-34,-122,38],
          [25,-125,43],
          [-2,-162,47]
        ]
      ){

        const g=
          ctx.createRadialGradient(
            dx-10,
            dy-13,
            3,
            dx,
            dy,
            r
          );

        g.addColorStop(
          0,
          '#c7f19a'
        );

        g.addColorStop(
          .5,
          '#5fbf72'
        );

        g.addColorStop(
          1,
          '#236246'
        );

        ellipse(
          ctx,
          dx,
          dy,
          r,
          r*.72,
          g,
          '#214c3b',
          4
        );
      }

      ctx.fillStyle='#7de6b0';

      for(let i=0;i<5;i++){

        ellipse(
          ctx,
          -28+i*14,
          -78+(i%2)*8,
          3,
          6,
          '#7de6b0'
        );
      }
    }

    else if(k===1){

      const stone=
        ctx.createLinearGradient(
          -45,
          -150,
          45,
          8
        );

      stone.addColorStop(
        0,
        '#e9e2c9'
      );

      stone.addColorStop(
        .5,
        '#aaa990'
      );

      stone.addColorStop(
        1,
        '#686b63'
      );

      rr(
        ctx,
        -35,
        -140,
        70,
        145,
        13,
        stone,
        '#484c48',
        5
      );

      rr(
        ctx,
        -50,
        -158,
        100,
        24,
        8,
        '#ddd5ba',
        '#4c504b',
        5
      );

      ctx.strokeStyle='#5d655c';
      ctx.lineWidth=3;

      ctx.beginPath();

      ctx.moveTo(-12,-130);
      ctx.lineTo(4,-99);
      ctx.lineTo(-8,-72);

      ctx.moveTo(20,-55);
      ctx.lineTo(3,-33);

      ctx.stroke();

      ctx.fillStyle='#4c8b5b';

      ctx.beginPath();

      ctx.moveTo(-35,-25);

      ctx.quadraticCurveTo(
        -58,
        -55,
        -38,
        -86
      );

      ctx.quadraticCurveTo(
        -20,
        -58,
        -20,
        -18
      );

      ctx.fill();
    }

    else if(k===2){

      ctx.save();

      ctx.shadowColor='#8ef4ff';
      ctx.shadowBlur=20;

      for(
        const [dx,h]
        of [
          [-24,58],
          [0,86],
          [24,48]
        ]
      ){

        const cg=
          ctx.createLinearGradient(
            0,
            -h,
            0,
            0
          );

        cg.addColorStop(
          0,
          '#eaffff'
        );

        cg.addColorStop(
          .35,
          '#6cecff'
        );

        cg.addColorStop(
          1,
          '#4f5ac7'
        );

        ctx.fillStyle=cg;

        ctx.strokeStyle='#334076';

        ctx.lineWidth=4;

        ctx.beginPath();

        ctx.moveTo(
          dx,
          -h
        );

        ctx.lineTo(
          dx+13,
          -8
        );

        ctx.lineTo(
          dx+7,
          4
        );

        ctx.lineTo(
          dx-9,
          2
        );

        ctx.lineTo(
          dx-13,
          -10
        );

        ctx.closePath();

        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    else{

      rr(
        ctx,
        -48,
        -68,
        96,
        72,
        14,
        '#415a61',
        '#1f3438',
        5
      );

      rr(
        ctx,
        -34,
        -55,
        68,
        18,
        6,
        '#6ed7be',
        '#274b49',
        3
      );

      ctx.fillStyle='#b7d1a4';

      ctx.fillRect(
        -28,
        -27,
        56,
        5
      );

      ctx.strokeStyle='#283a3e';

      ctx.beginPath();

      ctx.moveTo(
        -35,
        -68
      );

      ctx.lineTo(
        -15,
        -88
      );

      ctx.lineTo(
        23,
        -81
      );

      ctx.stroke();
    }
  }


  /* MUSIC */

  else if(world==='music'){

    if(k===0){

      const sg=
        ctx.createLinearGradient(
          -45,
          -135,
          45,
          5
        );

      sg.addColorStop(
        0,
        '#342b68'
      );

      sg.addColorStop(
        1,
        '#161630'
      );

      rr(
        ctx,
        -42,
        -132,
        84,
        136,
        14,
        sg,
        '#11152c',
        5
      );

      for(
        const [yy,r]
        of [
          [-98,24],
          [-42,30]
        ]
      ){

        ctx.shadowColor='#6cecff';
        ctx.shadowBlur=10;

        ellipse(
          ctx,
          0,
          yy,
          r,
          r,
          '#15182b',
          '#7b70ff',
          5
        );

        ellipse(
          ctx,
          0,
          yy,
          r*.42,
          r*.42,
          '#65efff',
          '#26294b',
          3
        );
      }

      ctx.shadowBlur=0;
    }

    else if(k===1){

      rr(
        ctx,
        -34,
        -150,
        68,
        154,
        10,
        '#201742',
        '#101127',
        5
      );

      for(
        let yy=-132;
        yy<-15;
        yy+=18
      ){

        rr(
          ctx,
          -23,
          yy,
          46,
          9,
          3,
          yy%36===0
            ?'#ff70d8'
            :'#68efff'
        );
      }

      ctx.shadowColor='#ff70d8';
      ctx.shadowBlur=14;

      ellipse(
        ctx,
        0,
        -165,
        15,
        15,
        '#ff78d8',
        '#542454',
        3
      );

      ctx.shadowBlur=0;
    }

    else if(k===2){

      ctx.save();

      ctx.translate(
        0,
        -70+
        Math.sin(
          G.time*3+
          x*.01
        )*6
      );

      ctx.rotate(
        G.time*.25
      );

      ctx.shadowColor='#a77cff';
      ctx.shadowBlur=22;

      ctx.fillStyle='#e7ddff';
      ctx.strokeStyle='#6b4fcb';
      ctx.lineWidth=4;

      ctx.beginPath();

      ctx.moveTo(0,-42);
      ctx.lineTo(25,0);
      ctx.lineTo(0,42);
      ctx.lineTo(-25,0);

      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    else{

      rr(
        ctx,
        -52,
        -62,
        104,
        66,
        16,
        '#2b2250',
        '#14132d',
        5
      );

      for(let i=0;i<7;i++){

        const h=
          12+
          (i%4)*7;

        rr(
          ctx,
          -39+i*12,
          -10-h,
          8,
          h,
          2,
          i%2
            ?'#ff6fd4'
            :'#67ecff'
        );
      }
    }
  }


  /* MONEY */

  else if(world==='money'){

    if(k===0){

      rr(
        ctx,
        -52,
        -76,
        104,
        80,
        10,
        '#765637',
        '#3d3026',
        5
      );

      ctx.fillStyle='#f0d06a';

      ctx.beginPath();

      ctx.moveTo(-62,-76);
      ctx.lineTo(-48,-111);
      ctx.lineTo(48,-111);
      ctx.lineTo(62,-76);

      ctx.closePath();

      ctx.fill();

      ctx.strokeStyle='#5a452d';
      ctx.lineWidth=5;
      ctx.stroke();

      for(let i=-2;i<=2;i++){

        ctx.fillStyle=
          i%2
            ?'#f7e4a4'
            :'#b95d4f';

        ctx.fillRect(
          i*20-10,
          -108,
          20,
          31
        );
      }
    }

    else if(k===1){

      ctx.strokeStyle='#4c3b24';
      ctx.lineWidth=8;

      ctx.beginPath();

      ctx.moveTo(0,3);
      ctx.lineTo(0,-105);

      ctx.stroke();

      ctx.shadowColor='#ffe68a';
      ctx.shadowBlur=18;

      ellipse(
        ctx,
        0,
        -122,
        24,
        24,
        '#f4d16b',
        '#7c6229',
        4
      );

      ctx.fillStyle='#fff2a6';

      ctx.font=
        '900 19px system-ui';

      ctx.textAlign=
        'center';

      ctx.fillText(
        'R',
        0,
        -115
      );

      ctx.shadowBlur=0;
    }

    else if(k===2){

      rr(
        ctx,
        -48,
        -112,
        96,
        116,
        14,
        '#7c8b83',
        '#35433c',
        5
      );

      ellipse(
        ctx,
        0,
        -52,
        32,
        32,
        '#394c45',
        '#d8bd64',
        5
      );

      ctx.strokeStyle='#d8bd64';
      ctx.lineWidth=5;

      ctx.beginPath();

      ctx.moveTo(-22,-52);
      ctx.lineTo(22,-52);

      ctx.moveTo(0,-74);
      ctx.lineTo(0,-30);

      ctx.stroke();
    }

    else{

      rr(
        ctx,
        -48,
        -48,
        96,
        52,
        10,
        '#9d7540',
        '#4b3824',
        5
      );

      rr(
        ctx,
        -37,
        -38,
        30,
        28,
        5,
        '#c89a50',
        '#5f4526',
        3
      );

      rr(
        ctx,
        7,
        -38,
        30,
        28,
        5,
        '#c89a50',
        '#5f4526',
        3
      );

      ellipse(
        ctx,
        0,
        -58,
        12,
        12,
        '#f1d16b',
        '#6e5725',
        3
      );
    }
  }


  /* COSMOS */

  else if(world==='cosmos'){

    if(k===0){

      rr(
        ctx,
        -16,
        -90,
        32,
        94,
        9,
        '#768ba8',
        '#27354c',
        4
      );

      ctx.strokeStyle='#d8efff';
      ctx.lineWidth=5;

      ctx.beginPath();

      ctx.arc(
        0,
        -105,
        34,
        .15,
        Math.PI-.15
      );

      ctx.stroke();

      ctx.beginPath();

      ctx.moveTo(
        0,
        -104
      );

      ctx.lineTo(
        22,
        -128
      );

      ctx.stroke();

      ctx.shadowColor='#73efff';
      ctx.shadowBlur=14;

      ellipse(
        ctx,
        24,
        -131,
        7,
        7,
        '#dffcff'
      );

      ctx.shadowBlur=0;
    }

    else if(k===1){

      ctx.fillStyle='#3d3b63';
      ctx.strokeStyle='#20213c';
      ctx.lineWidth=5;

      ctx.beginPath();

      ctx.moveTo(-45,2);
      ctx.lineTo(-34,-46);
      ctx.lineTo(-5,-65);
      ctx.lineTo(36,-48);
      ctx.lineTo(48,-5);
      ctx.lineTo(22,10);

      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      ctx.shadowColor='#a88cff';
      ctx.shadowBlur=18;

      ctx.fillStyle='#d8d2ff';

      ctx.beginPath();

      ctx.moveTo(0,-82);
      ctx.lineTo(16,-45);
      ctx.lineTo(0,-19);
      ctx.lineTo(-16,-45);

      ctx.closePath();

      ctx.fill();

      ctx.shadowBlur=0;
    }

    else if(k===2){

      rr(
        ctx,
        -47,
        -74,
        94,
        78,
        16,
        '#394e6b',
        '#17253b',
        5
      );

      ellipse(
        ctx,
        0,
        -38,
        27,
        22,
        '#7beeff',
        '#24455f',
        4
      );

      ctx.strokeStyle='#bfefff';
      ctx.lineWidth=3;

      ctx.beginPath();

      ctx.moveTo(-47,-20);
      ctx.lineTo(-70,-42);

      ctx.moveTo(47,-20);
      ctx.lineTo(70,-42);

      ctx.stroke();
    }

    else{

      rr(
        ctx,
        -48,
        -56,
        96,
        60,
        12,
        '#27384f',
        '#101a2a',
        5
      );

      rr(
        ctx,
        -35,
        -43,
        70,
        14,
        5,
        '#6cecff',
        '#24475f',
        3
      );

      for(let i=0;i<4;i++){

        ellipse(
          ctx,
          -24+i*16,
          -13,
          4,
          4,
          i===2
            ?'#ff6d8c'
            :'#a7f7ff'
        );
      }
    }
  }


  /* WAR */

  else if(world==='war'){

    if(k===0){

      ctx.fillStyle='#54443b';
      ctx.strokeStyle='#241f1e';
      ctx.lineWidth=5;

      ctx.beginPath();

      ctx.moveTo(-60,0);
      ctx.lineTo(-40,-62);
      ctx.lineTo(40,-62);
      ctx.lineTo(60,0);

      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      for(let i=-2;i<=2;i++){

        ctx.fillStyle='#b85b42';

        ctx.fillRect(
          i*20-8,
          -55,
          12,
          48
        );
      }
    }

    else if(k===1){

      rr(
        ctx,
        -35,
        -52,
        70,
        56,
        12,
        '#4a4f4d',
        '#202625',
        5
      );

      ellipse(
        ctx,
        0,
        -62,
        30,
        22,
        '#626864',
        '#202625',
        4
      );

      rr(
        ctx,
        12,
        -70,
        68,
        14,
        6,
        '#3b403f',
        '#1c2020',
        4
      );

      ctx.shadowColor='#ff735c';
      ctx.shadowBlur=10;

      ellipse(
        ctx,
        75,
        -63,
        5,
        5,
        '#ff8b68'
      );

      ctx.shadowBlur=0;
    }

    else if(k===2){

      for(
        const [dx,dy]
        of [
          [-32,-18],
          [0,-18],
          [32,-18],
          [-16,-42],
          [16,-42]
        ]
      ){

        rr(
          ctx,
          dx-22,
          dy-13,
          44,
          26,
          12,
          '#8a7456',
          '#453b2d',
          3
        );
      }
    }

    else{

      ctx.save();

      ctx.rotate(-.18);

      rr(
        ctx,
        -48,
        -60,
        96,
        62,
        13,
        '#50575b',
        '#242a2d',
        5
      );

      ellipse(
        ctx,
        -18,
        -28,
        18,
        18,
        '#22292c',
        '#8c4e3d',
        4
      );

      ctx.strokeStyle='#d46c4e';
      ctx.lineWidth=5;

      ctx.beginPath();

      ctx.moveTo(
        20,
        -49
      );

      ctx.lineTo(
        48,
        -75
      );

      ctx.stroke();

      ctx.restore();
    }
  }


  /* VOID */

  else if(world==='void'){

    if(k===0){

      const vg=
        ctx.createLinearGradient(
          -32,
          -145,
          32,
          5
        );

      vg.addColorStop(
        0,
        '#302047'
      );

      vg.addColorStop(
        1,
        '#0b0812'
      );

      ctx.shadowColor='#8f65ff';
      ctx.shadowBlur=14;

      ctx.fillStyle=vg;
      ctx.strokeStyle='#5b3d89';
      ctx.lineWidth=5;

      ctx.beginPath();

      ctx.moveTo(-28,3);
      ctx.lineTo(-37,-112);
      ctx.lineTo(0,-154);
      ctx.lineTo(37,-112);
      ctx.lineTo(28,3);

      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur=0;

      ctx.strokeStyle='#b88cff';
      ctx.lineWidth=3;

      ctx.beginPath();

      ctx.moveTo(0,-122);
      ctx.lineTo(-11,-87);
      ctx.lineTo(8,-65);
      ctx.lineTo(0,-32);

      ctx.stroke();
    }

    else if(k===1){

      ctx.save();

      ctx.shadowColor='#a66cff';
      ctx.shadowBlur=24;

      for(
        const [dx,h]
        of [
          [-22,62],
          [4,94],
          [26,51]
        ]
      ){

        ctx.fillStyle='#b88cff';
        ctx.strokeStyle='#3c245f';
        ctx.lineWidth=4;

        ctx.beginPath();

        ctx.moveTo(dx,-h);
        ctx.lineTo(dx+14,-8);
        ctx.lineTo(dx,4);
        ctx.lineTo(dx-13,-8);

        ctx.closePath();

        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    else if(k===2){

      ctx.strokeStyle='#19111f';
      ctx.lineWidth=14;

      ctx.beginPath();

      ctx.moveTo(0,4);

      ctx.quadraticCurveTo(
        -18,
        -65,
        -4,
        -130
      );

      ctx.stroke();

      ctx.lineWidth=7;

      for(const side of [-1,1]){

        ctx.beginPath();

        ctx.moveTo(
          -4,
          -92
        );

        ctx.quadraticCurveTo(
          side*45,
          -120,
          side*55,
          -154
        );

        ctx.stroke();
      }

      ctx.shadowColor='#7d50d4';
      ctx.shadowBlur=14;

      ellipse(
        ctx,
        0,
        -72,
        8,
        8,
        '#a778ff'
      );

      ctx.shadowBlur=0;
    }

    else{

      rr(
        ctx,
        -48,
        -58,
        96,
        62,
        10,
        '#151020',
        '#09070d',
        5
      );

      ctx.shadowColor='#9f70ff';
      ctx.shadowBlur=18;

      ellipse(
        ctx,
        0,
        -29,
        20,
        20,
        '#3d245d',
        '#9d70ff',
        4
      );

      ellipse(
        ctx,
        0,
        -29,
        7,
        7,
        '#d8c5ff'
      );

      ctx.shadowBlur=0;
    }
  }


  /* PERFECT MATRIX */

  else{

    if(k===0){

      rr(
        ctx,
        -30,
        -132,
        60,
        136,
        8,
        '#102c3a',
        '#43d7d2',
        4
      );

      for(
        let yy=-112;
        yy<-12;
        yy+=20
      ){

        rr(
          ctx,
          -19,
          yy,
          38,
          7,
          2,
          yy%40===0
            ?'#58f1ec'
            :'#8a73ff'
        );
      }
    }

    else if(k===1){

      ctx.save();

      ctx.translate(
        0,
        -64
      );

      ctx.rotate(
        G.time*.45
      );

      ctx.shadowColor='#59f5ef';
      ctx.shadowBlur=20;

      ctx.strokeStyle='#7afaf5';
      ctx.lineWidth=4;

      ctx.strokeRect(
        -30,
        -30,
        60,
        60
      );

      ctx.rotate(
        Math.PI/4
      );

      ctx.strokeRect(
        -20,
        -20,
        40,
        40
      );

      ctx.restore();
    }

    else if(k===2){

      rr(
        ctx,
        -50,
        -66,
        100,
        70,
        12,
        '#0c2230',
        '#31586a',
        5
      );

      ctx.fillStyle='#8efcf8';

      ctx.font=
        '900 12px monospace';

      ctx.fillText(
        '0101 1100',
        -32,
        -35
      );

      ctx.fillText(
        '0010 0111',
        -32,
        -16
      );
    }

    else{

      ctx.strokeStyle='#53e5df';
      ctx.lineWidth=7;

      ctx.beginPath();

      ctx.moveTo(0,3);
      ctx.lineTo(0,-100);

      ctx.moveTo(0,-70);
      ctx.lineTo(-38,-105);

      ctx.moveTo(0,-52);
      ctx.lineTo(42,-91);

      ctx.stroke();

      for(
        const [dx,dy]
        of [
          [0,-105],
          [-40,-108],
          [44,-94]
        ]
      ){

        ellipse(
          ctx,
          dx,
          dy,
          9,
          9,
          '#8afcf7',
          '#173f4b',
          3
        );
      }
    }
  }

  ctx.restore();
}


/* =========================================================
   WORLD BACKGROUNDS
   ========================================================= */

function drawWorldBackground(w,cam){

  const id=G.worldId;
  const t=G.time||0;

  const sky=
    ctx.createLinearGradient(
      0,
      0,
      0,
      H
    );

  sky.addColorStop(
    0,
    w.skyA
  );

  sky.addColorStop(
    .58,
    w.skyB
  );

  sky.addColorStop(
    1,
    w.ground
  );

  ctx.fillStyle=sky;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  /* EARTH 2.0 */

  if(id==='earth'){

    const sun=
      ctx.createRadialGradient(
        1035,
        115,
        5,
        1035,
        115,
        92
      );

    sun.addColorStop(
      0,
      'rgba(255,250,210,.95)'
    );

    sun.addColorStop(
      .35,
      'rgba(255,232,157,.55)'
    );

    sun.addColorStop(
      1,
      'rgba(255,232,157,0)'
    );

    ctx.fillStyle=sun;

    ctx.beginPath();

    ctx.arc(
      1035,
      115,
      92,
      0,
      Math.PI*2
    );

    ctx.fill();


    for(let i=0;i<7;i++){

      let x=
        (
          (
            i*235-
            cam*.035
          )%1700+
          1700
        )%1700-
        160;

      let y=
        90+
        (i%3)*48;

      ctx.globalAlpha=.5;

      ctx.fillStyle='#f5fbef';

      ellipse(
        ctx,
        x,
        y,
        58,
        18
      );

      ellipse(
        ctx,
        x+45,
        y+5,
        42,
        15
      );

      ellipse(
        ctx,
        x-42,
        y+7,
        35,
        13
      );
    }

    ctx.globalAlpha=1;


    for(let layer=0;layer<3;layer++){

      ctx.fillStyle=
        layer===0
          ?'rgba(34,91,76,.18)'
          :layer===1
            ?'rgba(30,78,66,.28)'
            :'rgba(24,66,56,.42)';

      ctx.beginPath();

      ctx.moveTo(
        0,
        410
      );

      for(let i=0;i<7;i++){

        const x=
          i*240-
          (
            (
              cam*
              (
                .035+
                layer*.035
              )
            )%240
          )-
          120;

        const y=
          270-
          layer*15-
          (
            (i+layer)%3
          )*45;

        ctx.lineTo(
          x,
          y
        );

        ctx.lineTo(
          x+150,
          390
        );
      }

      ctx.lineTo(
        W,
        410
      );

      ctx.closePath();

      ctx.fill();
    }


    ctx.fillStyle=
      'rgba(31,65,61,.34)';

    for(let i=0;i<13;i++){

      const x=
        (
          (
            i*135-
            cam*.11
          )%1800+
          1800
        )%1800-
        100;

      const h=
        35+
        (i%5)*18;

      ctx.fillRect(
        x,
        370-h,
        75,
        h
      );

      if(i%3===0){

        ctx.clearRect(
          x+18,
          370-h+12,
          16,
          12
        );
      }
    }
  }


  /* MUSIC VERSE */

  if(id==='music'){

    const moon=
      ctx.createRadialGradient(
        1080,
        125,
        8,
        1080,
        125,
        105
      );

    moon.addColorStop(
      0,
      'rgba(255,224,255,.95)'
    );

    moon.addColorStop(
      .3,
      'rgba(255,111,216,.48)'
    );

    moon.addColorStop(
      1,
      'rgba(108,86,255,0)'
    );

    ctx.fillStyle=moon;

    ctx.beginPath();

    ctx.arc(
      1080,
      125,
      105,
      0,
      Math.PI*2
    );

    ctx.fill();


    ctx.save();

    ctx.globalAlpha=.14;

    for(let i=0;i<6;i++){

      ctx.fillStyle=
        i%2
          ?'#6cecff'
          :'#ff73da';

      ctx.beginPath();

      ctx.moveTo(
        130+i*210,
        0
      );

      ctx.lineTo(
        350+i*150,
        400
      );

      ctx.lineTo(
        420+i*150,
        400
      );

      ctx.closePath();

      ctx.fill();
    }

    ctx.restore();


    for(let i=0;i<26;i++){

      const x=
        (
          (
            i*72-
            cam*.14
          )%1900+
          1900
        )%1900-
        80;

      const h=
        45+
        (
          (i*37)%160
        );

      ctx.fillStyle=
        i%2
          ?'rgba(37,28,83,.68)'
          :'rgba(52,30,94,.72)';

      ctx.fillRect(
        x,
        400-h,
        54,
        h
      );

      ctx.fillStyle=
        i%3
          ?'rgba(104,236,255,.55)'
          :'rgba(255,111,216,.55)';

      for(
        let yy=400-h+14;
        yy<392;
        yy+=24
      ){

        ctx.fillRect(
          x+10,
          yy,
          34,
          5
        );
      }
    }


    ctx.strokeStyle=
      'rgba(210,240,255,.18)';

    ctx.lineWidth=2;

    for(
      let yy=180;
      yy<300;
      yy+=24
    ){

      ctx.beginPath();

      ctx.moveTo(
        0,
        yy
      );

      ctx.lineTo(
        W,
        yy
      );

      ctx.stroke();
    }
  }


  /* MONEY VILLAGE */

  if(id==='money'){

    const sun=
      ctx.createRadialGradient(
        1020,
        120,
        5,
        1020,
        120,
        95
      );

    sun.addColorStop(
      0,
      'rgba(255,247,190,.95)'
    );

    sun.addColorStop(
      .38,
      'rgba(255,210,91,.55)'
    );

    sun.addColorStop(
      1,
      'rgba(255,210,91,0)'
    );

    ctx.fillStyle=sun;

    ctx.beginPath();

    ctx.arc(
      1020,
      120,
      95,
      0,
      Math.PI*2
    );

    ctx.fill();


    ctx.fillStyle=
      'rgba(50,90,59,.28)';

    ctx.beginPath();

    ctx.moveTo(
      0,
      390
    );

    for(let i=0;i<=8;i++){

      const x=
        i*190-
        (
          cam*.05%
          190
        );

      const y=
        275+
        Math.sin(
          i*1.7
        )*45;

      ctx.quadraticCurveTo(
        x+95,
        y-35,
        x+190,
        350
      );
    }

    ctx.lineTo(
      W,
      420
    );

    ctx.lineTo(
      0,
      420
    );

    ctx.fill();


    for(let i=0;i<12;i++){

      const x=
        (
          (
            i*150-
            cam*.11
          )%1900+
          1900
        )%1900-
        80;

      const base=395;

      const h=
        38+
        (i%4)*15;

      ctx.fillStyle=
        'rgba(90,69,42,.5)';

      ctx.fillRect(
        x,
        base-h,
        90,
        h
      );

      ctx.beginPath();

      ctx.moveTo(
        x-8,
        base-h
      );

      ctx.lineTo(
        x+45,
        base-h-35
      );

      ctx.lineTo(
        x+98,
        base-h
      );

      ctx.fill();

      ctx.fillStyle=
        'rgba(255,223,113,.55)';

      ctx.fillRect(
        x+18,
        base-h+12,
        12,
        14
      );

      ctx.fillRect(
        x+57,
        base-h+12,
        12,
        14
      );
    }


    ctx.strokeStyle=
      'rgba(90,79,50,.45)';

    ctx.lineWidth=12;

    ctx.beginPath();

    ctx.arc(
      650-cam*.025,
      330,
      75,
      Math.PI,
      0
    );

    ctx.stroke();

    ctx.fillStyle=
      'rgba(78,71,50,.32)';

    ctx.fillRect(
      575-cam*.025,
      330,
      150,
      70
    );
  }


  /* COSMOS */

  if(id==='cosmos'){

    ctx.fillStyle='#020611';

    ctx.fillRect(
      0,
      0,
      W,
      H
    );

    for(let i=0;i<170;i++){

      const x=
        (
          (
            i*89.7-
            cam*
            (
              .012+
              (i%4)*.008
            )
          )%1500+
          1500
        )%1500;

      const y=
        (
          i*47.2
        )%390;

      ctx.globalAlpha=
        .25+
        (i%5)*.12;

      ctx.fillStyle=
        i%11===0
          ?'#8beeff'
          :i%17===0
            ?'#c6a6ff'
            :'#fff';

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        i%19===0
          ?2
          :1,
        0,
        Math.PI*2
      );

      ctx.fill();
    }

    ctx.globalAlpha=1;


    const neb=
      ctx.createRadialGradient(
        370,
        180,
        20,
        370,
        180,
        280
      );

    neb.addColorStop(
      0,
      'rgba(113,80,210,.34)'
    );

    neb.addColorStop(
      .45,
      'rgba(65,95,196,.17)'
    );

    neb.addColorStop(
      1,
      'rgba(10,14,40,0)'
    );

    ctx.fillStyle=neb;

    ctx.fillRect(
      0,
      0,
      760,
      430
    );

    drawPlanet(
      1080-cam*.018,
      145,
      100,
      '#b0c8ff',
      '#4c3d93'
    );

    drawPlanet(
      170-cam*.008,
      90,
      42,
      '#8ff0d8',
      '#1c6472'
    );


    for(let i=0;i<8;i++){

      const x=
        (
          (
            i*260-
            cam*.07
          )%1900+
          1900
        )%1900-
        100;

      const y=
        315+
        (i%3)*32;

      ctx.fillStyle=
        'rgba(92,82,144,.55)';

      ctx.beginPath();

      ctx.moveTo(
        x-55,
        y
      );

      ctx.lineTo(
        x-25,
        y-28
      );

      ctx.lineTo(
        x+38,
        y-20
      );

      ctx.lineTo(
        x+62,
        y+4
      );

      ctx.lineTo(
        x+8,
        y+18
      );

      ctx.closePath();

      ctx.fill();
    }
  }


  /* WAR ZONE */

  if(id==='war'){

    const redSun=
      ctx.createRadialGradient(
        1040,
        145,
        5,
        1040,
        145,
        95
      );

    redSun.addColorStop(
      0,
      'rgba(255,204,145,.85)'
    );

    redSun.addColorStop(
      .4,
      'rgba(235,98,66,.35)'
    );

    redSun.addColorStop(
      1,
      'rgba(110,40,32,0)'
    );

    ctx.fillStyle=redSun;

    ctx.beginPath();

    ctx.arc(
      1040,
      145,
      95,
      0,
      Math.PI*2
    );

    ctx.fill();


    ctx.fillStyle=
      'rgba(40,31,32,.62)';

    for(let i=0;i<12;i++){

      const x=
        (
          (
            i*145-
            cam*.09
          )%1800+
          1800
        )%1800-
        100;

      const h=
        55+
        (i%4)*35;

      ctx.fillRect(
        x,
        395-h,
        90,
        h
      );

      if(i%3===0){

        ctx.fillRect(
          x+20,
          395-h-80,
          18,
          80
        );

        ctx.globalAlpha=.15;

        ellipse(
          ctx,
          x+29,
          395-h-100,
          42,
          18,
          '#332a2b'
        );

        ctx.globalAlpha=1;
      }
    }


    ctx.save();

    ctx.globalAlpha=.12;

    ctx.fillStyle='#ffb16f';

    for(let i=0;i<4;i++){

      ctx.beginPath();

      ctx.moveTo(
        80+i*320,
        0
      );

      ctx.lineTo(
        230+i*280,
        400
      );

      ctx.lineTo(
        280+i*280,
        400
      );

      ctx.closePath();

      ctx.fill();
    }

    ctx.restore();


    for(let i=0;i<30;i++){

      const x=
        (
          i*73+
          t*28
        )%W;

      const y=
        70+
        (i*61)%320;

      ctx.globalAlpha=
        .25+
        (i%4)*.1;

      ctx.fillStyle='#ff9a63';

      ctx.fillRect(
        x,
        y,
        2,
        2
      );
    }

    ctx.globalAlpha=1;
  }


  /* VOID */

  if(id==='void'){

    ctx.fillStyle='#040208';

    ctx.fillRect(
      0,
      0,
      W,
      H
    );


    const rift=
      ctx.createRadialGradient(
        1040,
        160,
        12,
        1040,
        160,
        155
      );

    rift.addColorStop(
      0,
      'rgba(245,232,255,.9)'
    );

    rift.addColorStop(
      .12,
      'rgba(171,112,255,.72)'
    );

    rift.addColorStop(
      .38,
      'rgba(92,42,151,.32)'
    );

    rift.addColorStop(
      1,
      'rgba(30,10,50,0)'
    );

    ctx.fillStyle=rift;

    ctx.beginPath();

    ctx.ellipse(
      1040,
      160,
      160,
      95,
      0,
      0,
      Math.PI*2
    );

    ctx.fill();


    ctx.strokeStyle=
      'rgba(176,120,255,.32)';

    ctx.lineWidth=6;

    for(let i=0;i<4;i++){

      ctx.beginPath();

      ctx.ellipse(
        1040,
        160,
        85+i*25,
        38+i*16,
        t*.05+i*.2,
        0,
        Math.PI*2
      );

      ctx.stroke();
    }


    for(let i=0;i<9;i++){

      const x=
        (
          (
            i*220-
            cam*.06
          )%1900+
          1900
        )%1900-
        80;

      const y=
        390-
        (i%3)*35;

      ctx.fillStyle=
        'rgba(31,17,45,.78)';

      ctx.beginPath();

      ctx.moveTo(
        x-24,
        y
      );

      ctx.lineTo(
        x-38,
        y-120-
        (i%2)*55
      );

      ctx.lineTo(
        x,
        y-165-
        (i%3)*30
      );

      ctx.lineTo(
        x+35,
        y-110
      );

      ctx.lineTo(
        x+25,
        y
      );

      ctx.closePath();

      ctx.fill();
    }


    ctx.save();

    ctx.globalAlpha=.12;

    for(let i=0;i<5;i++){

      const mg=
        ctx.createLinearGradient(
          0,
          300+i*25,
          0,
          470+i*20
        );

      mg.addColorStop(
        0,
        'rgba(180,110,255,0)'
      );

      mg.addColorStop(
        1,
        'rgba(160,80,255,.8)'
      );

      ctx.fillStyle=mg;

      ctx.fillRect(
        0,
        300+i*24,
        W,
        40
      );
    }

    ctx.restore();
  }


  /* MATRIX */

  if(id==='matrix'){

    ctx.fillStyle='#04121d';

    ctx.fillRect(
      0,
      0,
      W,
      H
    );


    const glow=
      ctx.createRadialGradient(
        640,
        280,
        10,
        640,
        280,
        380
      );

    glow.addColorStop(
      0,
      'rgba(67,238,230,.17)'
    );

    glow.addColorStop(
      1,
      'rgba(40,20,90,0)'
    );

    ctx.fillStyle=glow;

    ctx.fillRect(
      0,
      0,
      W,
      500
    );


    for(let i=0;i<20;i++){

      const x=
        (
          (
            i*95-
            cam*.12
          )%1700+
          1700
        )%1700-
        80;

      const h=
        50+
        (
          (i*47)%190
        );

      ctx.fillStyle=
        i%3===0
          ?'rgba(74,43,132,.48)'
          :'rgba(10,49,65,.7)';

      ctx.fillRect(
        x,
        400-h,
        68,
        h
      );

      ctx.strokeStyle=
        'rgba(90,243,239,.42)';

      ctx.lineWidth=2;

      ctx.strokeRect(
        x,
        400-h,
        68,
        h
      );

      for(
        let yy=400-h+14;
        yy<390;
        yy+=22
      ){

        ctx.fillStyle=
          i%2
            ?'rgba(90,243,239,.48)'
            :'rgba(159,110,255,.45)';

        ctx.fillRect(
          x+10,
          yy,
          48,
          4
        );
      }
    }


    ctx.strokeStyle=
      'rgba(90,243,239,.2)';

    ctx.lineWidth=1;

    for(
      let y=405;
      y<H;
      y+=34
    ){

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


    for(
      let x=-W;
      x<W*2;
      x+=80
    ){

      ctx.beginPath();

      ctx.moveTo(
        W/2,
        395
      );

      ctx.lineTo(
        x,
        H
      );

      ctx.stroke();
    }


    ctx.save();

    ctx.globalAlpha=.18;

    for(let i=0;i<12;i++){

      const x=
        (
          i*137+
          t*18
        )%W;

      const y=
        70+
        (i*79)%290;

      ctx.fillStyle=
        i%2
          ?'#59f5ef'
          :'#9d7aff';

      ctx.fillRect(
        x,
        y,
        25+
        (i%3)*16,
        3
      );
    }

    ctx.restore();
  }


  /* WALKABLE GROUND */

  ctx.fillStyle=
    w.ground;

  ctx.globalAlpha=
    id==='cosmos' ||
    id==='void' ||
    id==='matrix'
      ?.82
      :1;

  ctx.fillRect(
    0,
    400,
    W,
    320
  );

  ctx.globalAlpha=1;


  const ground=
    ctx.createLinearGradient(
      0,
      400,
      0,
      H
    );

  ground.addColorStop(
    0,
    'rgba(255,255,255,.10)'
  );

  ground.addColorStop(
    .22,
    'rgba(0,0,0,.02)'
  );

  ground.addColorStop(
    1,
    'rgba(0,0,0,.42)'
  );

  ctx.fillStyle=ground;

  ctx.fillRect(
    0,
    400,
    W,
    320
  );


  if(id==='earth'){

    ctx.strokeStyle=
      'rgba(219,236,185,.18)';

    ctx.lineWidth=3;

    for(let i=0;i<9;i++){

      const yy=
        430+
        i*34;

      ctx.beginPath();

      ctx.moveTo(
        0,
        yy
      );

      ctx.quadraticCurveTo(
        W*.45,
        yy+
        12*
        Math.sin(
          i+
          cam*.002
        ),
        W,
        yy-4
      );

      ctx.stroke();
    }
  }


  if(id==='music'){

    for(let i=0;i<14;i++){

      const x=
        i*100-
        (
          cam*.35%
          100
        );

      const h=
        16+
        Math.abs(
          Math.sin(
            t*2+i
          )
        )*34;

      ctx.fillStyle=
        i%2
          ?'rgba(108,236,255,.18)'
          :'rgba(255,111,216,.18)';

      ctx.fillRect(
        x,
        410,
        65,
        h
      );
    }
  }


  if(id==='money'){

    ctx.strokeStyle=
      'rgba(83,62,35,.18)';

    ctx.lineWidth=2;

    for(
      let y=420;
      y<H;
      y+=34
    ){

      for(
        let x=
          (
            (y/34)%2
          )*35-70;
        x<W;
        x+=70
      ){

        rr(
          ctx,
          x,
          y,
          62,
          24,
          8,
          null,
          'rgba(83,62,35,.18)',
          2
        );
      }
    }
  }


  if(id==='cosmos'){

    ctx.strokeStyle=
      'rgba(137,190,255,.22)';

    ctx.lineWidth=2;

    for(
      let x=-100;
      x<W+100;
      x+=120
    ){

      ctx.beginPath();

      ctx.moveTo(
        x,
        400
      );

      ctx.lineTo(
        x+70,
        H
      );

      ctx.stroke();
    }

    for(
      let y=430;
      y<H;
      y+=55
    ){

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


  if(id==='war'){

    ctx.strokeStyle=
      'rgba(45,31,28,.28)';

    ctx.lineWidth=4;

    for(let i=0;i<18;i++){

      const x=
        (
          i*93-
          cam*.25
        )%W;

      const y=
        430+
        (i*47)%250;

      ctx.beginPath();

      ctx.moveTo(
        x-22,
        y
      );

      ctx.lineTo(
        x+18,
        y-8
      );

      ctx.lineTo(
        x+34,
        y+6
      );

      ctx.stroke();
    }
  }


  if(id==='void'){

    for(let i=0;i<20;i++){

      const x=
        (
          i*79-
          cam*.18
        )%W;

      const y=
        430+
        (i*53)%250;

      ctx.globalAlpha=.12;

      ellipse(
        ctx,
        x,
        y,
        18+
        (i%3)*10,
        5,
        '#a879ff'
      );
    }

    ctx.globalAlpha=1;
  }
}


/* =========================================================
   WORLD RENDERING
   ========================================================= */

function drawWorld(){

  const w=
    WORLDS[G.worldId];

  const cam=
    G.camera;

  const pr=
    G.progress[G.worldId];

  drawWorldBackground(
    w,
    cam
  );


  const drawables=[];


  for(let i=0;i<9;i++){

    drawables.push({

      y:
        470+
        (i%3)*38,

      fn:()=>
        drawProp(
          i,
          850+i*560,
          470+(i%3)*38,
          cam,
          G.worldId
        )
    });
  }


  if(G.worldId==='earth'){

    drawables.push({

      y:530,

      fn:()=>
        drawShip(
          480-cam,
          500,
          .65,
          .05
        )
    });


    if(pr.storyStage===1){

      drawables.push({

        y:515,

        fn:()=>
          drawSwordPickup(
            1180-cam,
            500
          )
      });
    }


    if(pr.storyStage===3){

      drawables.push({

        y:520,

        fn:()=>
          drawTower(
            3350-cam,
            520
          )
      });
    }


    if(pr.storyStage>=4){

      drawables.push({

        y:520,

        fn:()=>
          drawGate(
            4050-cam,
            520
          )
      });
    }
  }


  for(const egg of EASTER_EGGS){

    if(
      egg.world===G.worldId &&
      !G.easterEggs.has(egg.id)
    ){

      drawables.push({

        y:egg.y,

        fn:()=>
          drawEasterEgg(
            egg,
            cam
          )
      });
    }
  }


  for(const p of G.pickups){

    if(!p.taken){

      drawables.push({

        y:p.y,

        fn:()=>
          drawPickup(
            p,
            cam
          )
      });
    }
  }


  for(const e of G.enemies){

    if(
      e.alive &&
      e.world===G.worldId
    ){

      drawables.push({

        y:e.y,

        fn:()=>
          drawEnemy(
            e,
            cam
          )
      });
    }
  }


  const ap=
    activePet();


  if(ap){

    drawables.push({

      y:P.y+3,

      fn:()=>
        drawFollowerPet(
          cam
        )
    });
  }


  drawables.push({

    y:P.y,

    fn:()=>
      drawRiftwalker(
        P.x-cam,
        P.y-P.jump,
        1,
        false
      )
  });


  drawables
    .sort(
      (a,b)=>
        a.y-b.y
    )
    .forEach(
      d=>d.fn()
    );


  /* VOID LIGHT RADIUS */

  if(G.worldId==='void'){

    const ap=
      activePet();

    const types=
      ap
        ?PET_TYPES[ap.name]
        :'';

    const rad=
      types.includes('Void') ||
      types.includes('Dark')
        ?320
        :200;

    ctx.save();

    ctx.fillStyle=
      'rgba(0,0,0,.82)';

    ctx.fillRect(
      0,
      0,
      W,
      H
    );

    ctx.globalCompositeOperation=
      'destination-out';

    const vg=
      ctx.createRadialGradient(
        P.x-cam,
        P.y-P.jump-55,
        30,
        P.x-cam,
        P.y-P.jump-55,
        rad
      );

    vg.addColorStop(
      0,
      'rgba(0,0,0,1)'
    );

    vg.addColorStop(
      1,
      'rgba(0,0,0,0)'
    );

    ctx.fillStyle=vg;

    ctx.beginPath();

    ctx.arc(
      P.x-cam,
      P.y-P.jump-55,
      rad,
      0,
      Math.PI*2
    );

    ctx.fill();

    ctx.restore();
  }


  drawForeground(w);
}


/* =========================================================
   WORLD OBJECTS
   ========================================================= */

function drawSwordPickup(x,y){

  ctx.save();

  ctx.translate(
    x,
    y-35
  );

  ctx.rotate(.55);

  ctx.shadowColor='#9b72ff';
  ctx.shadowBlur=24;

  const g=
    ctx.createLinearGradient(
      0,
      -80,
      0,
      0
    );

  g.addColorStop(
    0,
    '#fff'
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

  ctx.restore();
}


function drawTower(x,y){

  rr(
    ctx,
    x-35,
    y-190,
    70,
    195,
    15,
    '#66727c',
    '#303946',
    5
  );

  ctx.shadowColor='#65eaff';
  ctx.shadowBlur=20;

  ellipse(
    ctx,
    x,
    y-205,
    28,
    28,
    '#78efff',
    '#294c5e',
    4
  );

  ctx.shadowBlur=0;
}


function drawGate(x,y){

  rr(
    ctx,
    x-75,
    y-180,
    45,
    185,
    12,
    '#77746c',
    '#403e3a',
    5
  );

  rr(
    ctx,
    x+30,
    y-180,
    45,
    185,
    12,
    '#77746c',
    '#403e3a',
    5
  );

  ctx.strokeStyle='#7761e8';
  ctx.lineWidth=10;

  ctx.beginPath();

  ctx.arc(
    x,
    y-140,
    70,
    Math.PI,
    0
  );

  ctx.stroke();
}


function drawPickup(p,cam){

  const x=p.x-cam;
  const y=p.y;


  if(p.kind==='pet'){

    drawPetSprite(
      ctx,
      x,
      y,
      p.name,
      .8,
      G.time
    );

    return;
  }


  if(p.kind==='fragment'){

    ctx.save();

    ctx.translate(
      x,
      y-35
    );

    ctx.rotate(
      G.time
    );

    ctx.shadowColor='#79eaff';
    ctx.shadowBlur=18;

    ctx.fillStyle='#dffcff';
    ctx.strokeStyle='#6e59dd';
    ctx.lineWidth=3;

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


  if(p.kind==='beacon'){

    rr(
      ctx,
      x-24,
      y-110,
      48,
      115,
      10,
      '#333b46',
      '#7e3c35',
      5
    );

    ellipse(
      ctx,
      x,
      y-124,
      20,
      20,
      '#ff6b57',
      '#6f2b2b',
      4
    );
  }


  if(p.kind==='portal'){

    ctx.save();

    ctx.strokeStyle='#79eaff';

    ctx.shadowColor='#6cecff';

    ctx.shadowBlur=24;

    ctx.lineWidth=14;

    ctx.beginPath();

    ctx.arc(
      x,
      y-55,
      58,
      Math.PI,
      0
    );

    ctx.stroke();

    ctx.restore();
  }
}


/* =========================================================
   EASTER EGG GRAPHICS
   ========================================================= */

function drawEasterEgg(egg,cam=0){

  const x=
    egg.x-cam;

  const y=
    egg.y;

  const bob=
    Math.sin(
      G.time*2.6+
      egg.x*.01
    )*2;


  ctx.save();

  ctx.translate(
    x,
    y+bob
  );

  ctx.globalAlpha=.82;


  ctx.save();

  ctx.globalAlpha=
    .12+
    .08*
    Math.sin(
      G.time*4
    );

  ctx.fillStyle='#fff4a8';

  ctx.beginPath();

  ctx.ellipse(
    0,
    5,
    24,
    6,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.restore();


  ctx.strokeStyle='#182333';
  ctx.lineWidth=3;
  ctx.lineCap='round';
  ctx.lineJoin='round';


  switch(egg.art){

    case 'scarf':

      ctx.fillStyle='#e94759';

      ctx.beginPath();

      ctx.moveTo(-18,-18);

      ctx.quadraticCurveTo(
        0,
        -28,
        18,
        -16
      );

      ctx.lineTo(
        8,
        -7
      );

      ctx.quadraticCurveTo(
        -3,
        -15,
        -20,
        -7
      );

      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      break;


    case 'cartridge':

      rr(
        ctx,
        -17,
        -27,
        34,
        30,
        5,
        '#26364b',
        '#111a27',
        3
      );

      rr(
        ctx,
        -10,
        -19,
        20,
        10,
        2,
        '#65eaff'
      );

      break;


    case 'smile':

      ellipse(
        ctx,
        0,
        -13,
        19,
        16,
        '#8f927e',
        '#44483f',
        3
      );

      ellipse(
        ctx,
        -7,
        -16,
        2,
        2,
        '#222'
      );

      ellipse(
        ctx,
        7,
        -16,
        2,
        2,
        '#222'
      );

      ctx.beginPath();

      ctx.arc(
        0,
        -12,
        9,
        .25,
        Math.PI-.25
      );

      ctx.stroke();

      break;


    case 'coffee':

      rr(
        ctx,
        -13,
        -25,
        25,
        24,
        4,
        '#e7e0cf',
        '#4c4a46',
        3
      );

      ctx.beginPath();

      ctx.arc(
        13,
        -14,
        8,
        -Math.PI/2,
        Math.PI/2
      );

      ctx.stroke();

      ctx.strokeStyle=
        'rgba(255,255,255,.55)';

      ctx.beginPath();

      ctx.moveTo(
        -5,
        -30
      );

      ctx.quadraticCurveTo(
        0,
        -40,
        5,
        -30
      );

      ctx.stroke();

      break;


    case 'note':

      ctx.strokeStyle='#d9f9ff';
      ctx.lineWidth=5;

      ctx.beginPath();

      ctx.moveTo(
        6,
        -34
      );

      ctx.lineTo(
        6,
        -10
      );

      ctx.lineTo(
        18,
        -14
      );

      ctx.stroke();

      ellipse(
        ctx,
        0,
        -6,
        8,
        6,
        '#c7f8ff'
      );

      ellipse(
        ctx,
        18,
        -10,
        8,
        6,
        '#c7f8ff'
      );

      break;


    case 'record':

      ellipse(
        ctx,
        0,
        -14,
        20,
        20,
        '#171a29',
        '#5e62a0',
        3
      );

      ellipse(
        ctx,
        0,
        -14,
        6,
        6,
        '#ff7ad8'
      );

      ellipse(
        ctx,
        0,
        -14,
        2,
        2,
        '#fff'
      );

      break;


    case 'metronome':

      ctx.fillStyle='#d6b14f';

      ctx.beginPath();

      ctx.moveTo(-18,2);
      ctx.lineTo(-10,-34);
      ctx.lineTo(10,-34);
      ctx.lineTo(18,2);

      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      ctx.beginPath();

      ctx.moveTo(
        0,
        -8
      );

      ctx.lineTo(
        8,
        -30
      );

      ctx.stroke();

      break;


    case 'pixel':

      for(
        const [dx,dy,c]
        of [
          [-14,-24,'#6cecff'],
          [0,-24,'#ff7ad8'],
          [-7,-10,'#fff0a0'],
          [7,-10,'#9d83ff']
        ]
      ){

        ctx.fillStyle=c;

        ctx.fillRect(
          dx,
          dy,
          11,
          11
        );
      }

      break;


    case 'coin':

      ellipse(
        ctx,
        0,
        -14,
        17,
        17,
        '#f1d267',
        '#806622',
        3
      );

      ctx.fillStyle='#fff0a0';

      ctx.font=
        '900 16px system-ui';

      ctx.textAlign='center';

      ctx.fillText(
        '1',
        0,
        -8
      );

      break;


    case 'pig':

      ellipse(
        ctx,
        0,
        -12,
        21,
        15,
        '#e9a3b7',
        '#6e4554',
        3
      );

      ellipse(
        ctx,
        16,
        -13,
        8,
        7,
        '#efb3c4',
        '#6e4554',
        2
      );

      ellipse(
        ctx,
        -9,
        -27,
        5,
        7,
        '#e9a3b7',
        '#6e4554',
        2
      );

      break;


    case 'receipt':

      rr(
        ctx,
        -12,
        -34,
        24,
        35,
        2,
        '#eef4ef',
        '#6d7370',
        2
      );

      ctx.strokeStyle='#777';
      ctx.lineWidth=2;

      for(
        let yy=-26;
        yy<-4;
        yy+=7
      ){

        ctx.beginPath();

        ctx.moveTo(
          -7,
          yy
        );

        ctx.lineTo(
          7,
          yy
        );

        ctx.stroke();
      }

      break;


    case 'cat':

      ctx.fillStyle='#303746';

      ctx.beginPath();

      ctx.moveTo(-16,-5);
      ctx.lineTo(-13,-28);
      ctx.lineTo(-5,-20);
      ctx.lineTo(5,-20);
      ctx.lineTo(13,-28);
      ctx.lineTo(16,-5);

      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      ellipse(
        ctx,
        -6,
        -13,
        2,
        2,
        '#ffe96c'
      );

      ellipse(
        ctx,
        6,
        -13,
        2,
        2,
        '#ffe96c'
      );

      break;


    case 'flag':

      ctx.strokeStyle='#dbe8f5';
      ctx.lineWidth=3;

      ctx.beginPath();

      ctx.moveTo(
        -10,
        1
      );

      ctx.lineTo(
        -10,
        -37
      );

      ctx.stroke();

      ctx.fillStyle='#7fe9ff';

      ctx.beginPath();

      ctx.moveTo(-8,-35);
      ctx.lineTo(18,-29);
      ctx.lineTo(-8,-20);

      ctx.closePath();

      ctx.fill();

      break;


    case 'helmet':

      ctx.fillStyle='#d8e2ec';

      ctx.beginPath();

      ctx.arc(
        0,
        -14,
        20,
        Math.PI,
        0
      );

      ctx.lineTo(
        18,
        0
      );

      ctx.lineTo(
        -18,
        0
      );

      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      rr(
        ctx,
        -14,
        -20,
        28,
        12,
        6,
        '#19304c',
        '#6cecff',
        2
      );

      break;


    case 'satellite':

      rr(
        ctx,
        -8,
        -23,
        16,
        16,
        3,
        '#c7d6e4',
        '#3c4b5a',
        2
      );

      ctx.fillStyle='#6486aa';

      ctx.fillRect(
        -28,
        -21,
        18,
        12
      );

      ctx.fillRect(
        10,
        -21,
        18,
        12
      );

      ctx.strokeStyle='#dffcff';

      ctx.beginPath();

      ctx.moveTo(
        0,
        -23
      );

      ctx.lineTo(
        8,
        -34
      );

      ctx.stroke();

      break;


    case 'whale':

      ctx.fillStyle='#88b9e8';

      ctx.beginPath();

      ctx.ellipse(
        -2,
        -13,
        21,
        11,
        0,
        0,
        Math.PI*2
      );

      ctx.fill();
      ctx.stroke();

      ctx.beginPath();

      ctx.moveTo(
        17,
        -13
      );

      ctx.lineTo(
        30,
        -23
      );

      ctx.lineTo(
        28,
        -9
      );

      ctx.closePath();

      ctx.fill();

      break;


    case 'sword':

      ctx.save();

      ctx.rotate(-.5);

      rr(
        ctx,
        -3,
        -36,
        6,
        30,
        2,
        '#ddd8c6',
        '#765c3a',
        2
      );

      rr(
        ctx,
        -11,
        -8,
        22,
        5,
        2,
        '#9b7750',
        '#523a27',
        2
      );

      ctx.restore();

      break;


    case 'duck':

      ellipse(
        ctx,
        0,
        -10,
        18,
        12,
        '#f4d65c',
        '#735f2b',
        3
      );

      ellipse(
        ctx,
        8,
        -25,
        10,
        10,
        '#f4d65c',
        '#735f2b',
        3
      );

      ctx.fillStyle='#dd6c3e';

      ctx.beginPath();

      ctx.moveTo(
        16,
        -25
      );

      ctx.lineTo(
        27,
        -21
      );

      ctx.lineTo(
        16,
        -18
      );

      ctx.closePath();

      ctx.fill();

      break;


    case 'radio':

      rr(
        ctx,
        -20,
        -28,
        40,
        29,
        5,
        '#5c665f',
        '#222b2b',
        3
      );

      ctx.strokeStyle='#b9c7c1';

      ctx.beginPath();

      ctx.moveTo(
        -12,
        -29
      );

      ctx.lineTo(
        10,
        -42
      );

      ctx.stroke();

      ellipse(
        ctx,
        9,
        -13,
        8,
        8,
        '#202929'
      );

      break;


    case 'flower':

      ctx.strokeStyle='#6ea75d';
      ctx.lineWidth=3;

      ctx.beginPath();

      ctx.moveTo(
        0,
        2
      );

      ctx.lineTo(
        0,
        -22
      );

      ctx.stroke();

      for(
        let a=0;
        a<Math.PI*2;
        a+=Math.PI/2
      ){

        ellipse(
          ctx,
          Math.cos(a)*8,
          -24+
          Math.sin(a)*8,
          6,
          6,
          '#f2a6ca',
          '#764d66',
          2
        );
      }

      ellipse(
        ctx,
        0,
        -24,
        5,
        5,
        '#ffe477'
      );

      break;


    case 'eye':

      ctx.fillStyle='#d9c8ff';

      ctx.beginPath();

      ctx.moveTo(
        -22,
        -14
      );

      ctx.quadraticCurveTo(
        0,
        -34,
        22,
        -14
      );

      ctx.quadraticCurveTo(
        0,
        6,
        -22,
        -14
      );

      ctx.fill();
      ctx.stroke();

      ellipse(
        ctx,
        0,
        -14,
        7,
        7,
        '#6d43c9'
      );

      ellipse(
        ctx,
        0,
        -14,
        3,
        3,
        '#111'
      );

      break;


    case 'candle':

      rr(
        ctx,
        -7,
        -22,
        14,
        23,
        3,
        '#ddd4c4',
        '#6c6255',
        2
      );

      ctx.fillStyle='#aa78ff';

      ctx.beginPath();

      ctx.moveTo(
        0,
        -42
      );

      ctx.quadraticCurveTo(
        12,
        -29,
        0,
        -22
      );

      ctx.quadraticCurveTo(
        -12,
        -29,
        0,
        -42
      );

      ctx.fill();

      break;


    case 'door':

      rr(
        ctx,
        -13,
        -35,
        26,
        36,
        3,
        '#382949',
        '#120d19',
        3
      );

      ellipse(
        ctx,
        7,
        -17,
        2,
        2,
        '#c3a6ff'
      );

      break;


    case 'star':

      ctx.fillStyle='#e9e1ff';
      ctx.shadowColor='#a77cff';
      ctx.shadowBlur=12;

      ctx.beginPath();

      for(let i=0;i<10;i++){

        const a=
          -Math.PI/2+
          i*Math.PI/5;

        const r=
          i%2
            ?7
            :18;

        const px=
          Math.cos(a)*r;

        const py=
          -15+
          Math.sin(a)*r;

        if(i){
          ctx.lineTo(
            px,
            py
          );
        }
        else{
          ctx.moveTo(
            px,
            py
          );
        }
      }

      ctx.closePath();

      ctx.fill();

      ctx.shadowBlur=0;

      break;


    case 'bug':

      ellipse(
        ctx,
        0,
        -14,
        11,
        14,
        '#75f4c8',
        '#163b35',
        2
      );

      ctx.strokeStyle='#75f4c8';

      for(const side of [-1,1]){

        for(
          const yy
          of [
            -20,
            -13,
            -6
          ]
        ){

          ctx.beginPath();

          ctx.moveTo(
            side*8,
            yy
          );

          ctx.lineTo(
            side*18,
            yy-5
          );

          ctx.stroke();
        }
      }

      break;


    case 'floppy':

      rr(
        ctx,
        -16,
        -31,
        32,
        32,
        3,
        '#6f7c91',
        '#1a2432',
        3
      );

      rr(
        ctx,
        -9,
        -27,
        18,
        10,
        1,
        '#c5d3df'
      );

      rr(
        ctx,
        -10,
        -11,
        20,
        9,
        1,
        '#29374a'
      );

      break;


    case 'cube':

      ctx.fillStyle='#73e9ff';

      ctx.fillRect(
        -15,
        -29,
        30,
        30
      );

      ctx.strokeRect(
        -15,
        -29,
        30,
        30
      );

      ctx.strokeStyle='#d9fbff';

      ctx.beginPath();

      ctx.moveTo(
        -15,
        -29
      );

      ctx.lineTo(
        0,
        -40
      );

      ctx.lineTo(
        15,
        -29
      );

      ctx.moveTo(
        15,
        -29
      );

      ctx.lineTo(
        27,
        -38
      );

      ctx.lineTo(
        0,
        -40
      );

      ctx.stroke();

      break;


    case 'zero':

      rr(
        ctx,
        -20,
        -31,
        40,
        28,
        4,
        '#091b25',
        '#5af3ef',
        2
      );

      ctx.fillStyle='#aefcf8';

      ctx.font=
        '900 13px monospace';

      ctx.textAlign='center';

      ctx.fillText(
        '1/0',
        0,
        -12
      );

      break;


    case 'ship':

      ctx.fillStyle='#c8d6e4';

      ctx.beginPath();

      ctx.moveTo(-23,-10);
      ctx.lineTo(5,-29);
      ctx.lineTo(25,-10);
      ctx.lineTo(4,-2);

      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      rr(
        ctx,
        -14,
        -15,
        11,
        7,
        2,
        '#d94d60'
      );

      break;
  }

  ctx.restore();
}


/* =========================================================
   FOLLOWER PET
   ========================================================= */

function drawFollowerPet(cam){

  const ap=
    activePet();

  if(!ap){
    return;
  }

  ap.x=
    lerp(
      ap.x??P.x-65,
      P.x-P.facing*72,
      .08
    );

  ap.y=
    lerp(
      ap.y??P.y,
      P.y,
      .08
    );

  drawPetSprite(
    ctx,
    ap.x-cam,
    ap.y,
    ap.name,
    .78,
    G.time
  );
}


/* =========================================================
   FOREGROUND DEPTH
   ========================================================= */

function drawForeground(w){

  const id=
    G.worldId;

  const t=
    G.time||0;

  ctx.save();


  const grad=
    ctx.createLinearGradient(
      0,
      H-165,
      0,
      H
    );

  grad.addColorStop(
    0,
    'rgba(0,0,0,0)'
  );

  grad.addColorStop(
    1,
    'rgba(4,8,16,.38)'
  );

  ctx.fillStyle=grad;

  ctx.fillRect(
    0,
    H-170,
    W,
    170
  );


  if(id==='earth'){

    ctx.fillStyle=
      'rgba(18,74,51,.72)';

    for(
      let x=-10;
      x<W+20;
      x+=26
    ){

      const h=
        18+
        Math.sin(
          x*.12
        )*8;

      ctx.beginPath();

      ctx.moveTo(
        x,
        H
      );

      ctx.lineTo(
        x+7,
        H-h
      );

      ctx.lineTo(
        x+12,
        H
      );

      ctx.fill();
    }


    ctx.fillStyle=
      'rgba(74,130,73,.5)';

    for(
      let x=12;
      x<W;
      x+=95
    ){

      ctx.beginPath();

      ctx.moveTo(
        x,
        H
      );

      ctx.quadraticCurveTo(
        x+9,
        H-38,
        x+18,
        H
      );

      ctx.fill();
    }
  }


  else if(id==='music'){

    ctx.globalAlpha=.25;

    for(
      let x=0;
      x<W;
      x+=90
    ){

      ctx.fillStyle=
        (x/90)%2
          ?'#6cecff'
          :'#ff70d8';

      const h=
        12+
        Math.abs(
          Math.sin(
            t*3+
            x*.02
          )
        )*26;

      ctx.fillRect(
        x,
        H-h,
        54,
        h
      );
    }

    ctx.globalAlpha=1;
  }


  else if(id==='money'){

    ctx.fillStyle=
      'rgba(82,61,31,.42)';

    for(
      let x=-30;
      x<W+40;
      x+=70
    ){

      ctx.beginPath();

      ctx.arc(
        x,
        H+5,
        38,
        Math.PI,
        0
      );

      ctx.fill();
    }
  }


  else if(id==='cosmos'){

    ctx.strokeStyle=
      'rgba(126,210,255,.35)';

    ctx.lineWidth=3;

    ctx.beginPath();

    ctx.moveTo(
      0,
      H-18
    );

    ctx.lineTo(
      W,
      H-18
    );

    ctx.stroke();


    for(
      let x=30;
      x<W;
      x+=150
    ){

      ctx.shadowColor='#6cecff';
      ctx.shadowBlur=10;

      ellipse(
        ctx,
        x,
        H-22,
        4,
        4,
        '#9ff9ff'
      );
    }

    ctx.shadowBlur=0;
  }


  else if(id==='war'){

    ctx.fillStyle=
      'rgba(31,26,25,.55)';

    for(
      let x=-30;
      x<W+40;
      x+=115
    ){

      ctx.beginPath();

      ctx.moveTo(
        x,
        H
      );

      ctx.lineTo(
        x+18,
        H-34
      );

      ctx.lineTo(
        x+36,
        H
      );

      ctx.fill();
    }


    for(let i=0;i<12;i++){

      const x=
        (
          i*117+
          t*42
        )%W;

      ctx.fillStyle=
        'rgba(255,128,79,.45)';

      ctx.fillRect(
        x,
        H-80-
        (i%4)*22,
        2,
        2
      );
    }
  }


  else if(id==='void'){

    ctx.fillStyle=
      'rgba(11,5,18,.78)';

    for(
      let x=-20;
      x<W+20;
      x+=80
    ){

      const h=
        24+
        (x%5)*3;

      ctx.beginPath();

      ctx.moveTo(
        x,
        H
      );

      ctx.lineTo(
        x+18,
        H-h
      );

      ctx.lineTo(
        x+35,
        H
      );

      ctx.fill();
    }

    ctx.globalAlpha=.18;

    ctx.fillStyle='#9f70ff';

    ctx.fillRect(
      0,
      H-32,
      W,
      32
    );

    ctx.globalAlpha=1;
  }


  else if(id==='matrix'){

    ctx.globalAlpha=.3;

    ctx.fillStyle='#58f1ec';

    for(let i=0;i<10;i++){

      const x=
        (
          i*151+
          t*30
        )%W;

      ctx.fillRect(
        x,
        H-18-
        (i%3)*7,
        42,
        3
      );
    }

    ctx.globalAlpha=1;
  }


  ctx.restore();
}
/* =========================================================
   THE HUB - BUILDING GLOW UP
   Each building now has its own silhouette, animated lighting,
   signage, windows, doors and 2.5D platform details.
   ========================================================= */

function drawHub(){

  space(G.time*7);

  // Deep-space skyline behind the station.

  drawPlanet(
    1110,
    145,
    95,
    '#a67eff',
    '#2e286d'
  );

  drawPlanet(
    155,
    105,
    48,
    '#9ff4df',
    '#285d66'
  );


  ctx.save();

  ctx.globalAlpha=.18;

  ctx.strokeStyle='#6cecff';

  ctx.lineWidth=2;


  for(let i=0;i<5;i++){

    ctx.beginPath();

    ctx.arc(
      640,
      340,
      150+i*75,
      Math.PI*.08,
      Math.PI*.92
    );

    ctx.stroke();
  }

  ctx.restore();


  // Floating Hub island.

  shadow(
    640,
    620,
    1040,
    100,
    .42
  );


  const rim=
    ctx.createLinearGradient(
      0,
      420,
      0,
      680
    );


  rim.addColorStop(
    0,
    '#f7fbff'
  );

  rim.addColorStop(
    .34,
    '#a9c1d2'
  );

  rim.addColorStop(
    .72,
    '#4d6680'
  );

  rim.addColorStop(
    1,
    '#18283d'
  );


  ctx.fillStyle=rim;

  ctx.strokeStyle='#4f7591';

  ctx.lineWidth=7;


  ctx.beginPath();

  ctx.ellipse(
    640,
    535,
    575,
    170,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.stroke();


  // Underside gives the island actual thickness.

  const under=
    ctx.createLinearGradient(
      0,
      545,
      0,
      690
    );


  under.addColorStop(
    0,
    'rgba(54,78,105,.85)'
  );

  under.addColorStop(
    1,
    'rgba(8,17,31,.98)'
  );


  ctx.fillStyle=under;


  ctx.beginPath();

  ctx.moveTo(
    92,
    545
  );

  ctx.quadraticCurveTo(
    640,
    760,
    1188,
    545
  );

  ctx.quadraticCurveTo(
    640,
    690,
    92,
    545
  );

  ctx.fill();


  // Animated energy ring around the Hub.

  ctx.save();

  ctx.globalAlpha=
    .55+
    .18*
    Math.sin(
      G.time*3
    );

  ctx.strokeStyle='#6cecff';

  ctx.shadowColor='#6cecff';

  ctx.shadowBlur=18;

  ctx.lineWidth=5;


  ctx.beginPath();

  ctx.ellipse(
    640,
    535,
    548,
    148,
    0,
    0,
    Math.PI*2
  );

  ctx.stroke();

  ctx.restore();


  // Walkways connect the three facilities.

  drawHubPath(
    340,
    650,
    500
  );

  drawHubPath(
    650,
    980,
    500
  );


  // Small animated runway lights.

  for(
    let x=180;
    x<=1100;
    x+=58
  ){

    drawHubLight(
      x,
      566,
      (x/58|0)%2===0
    );
  }


  // Unique buildings instead of three identical boxes.

  drawHubSanctuary(
    340,
    500
  );

  drawHubArmory(
    650,
    500
  );

  drawHubTerminal(
    980,
    500
  );


  // Central Rift Core monument makes the Hub feel like a base.

  drawHubCoreMonument(
    650,
    390
  );


  for(
    const egg
    of EASTER_EGGS
  ){

    if(
      egg.world==='hub' &&
      !G.easterEggs.has(
        egg.id
      )
    ){

      drawEasterEgg(
        egg,
        0
      );
    }
  }


  if(activePet()){

    drawFollowerPet(0);
  }


  drawRiftwalker(
    P.x,
    P.y-P.jump,
    1,
    false
  );


  // Foreground railings create extra 2.5D depth/occlusion.

  ctx.save();

  ctx.strokeStyle=
    'rgba(26,45,65,.8)';

  ctx.lineWidth=7;

  ctx.lineCap='round';


  ctx.beginPath();

  ctx.moveTo(
    110,
    618
  );

  ctx.lineTo(
    330,
    650
  );

  ctx.moveTo(
    950,
    650
  );

  ctx.lineTo(
    1170,
    618
  );

  ctx.stroke();


  ctx.strokeStyle=
    'rgba(105,231,255,.5)';

  ctx.lineWidth=2;


  ctx.beginPath();

  ctx.moveTo(
    110,
    611
  );

  ctx.lineTo(
    330,
    643
  );

  ctx.moveTo(
    950,
    643
  );

  ctx.lineTo(
    1170,
    611
  );

  ctx.stroke();

  ctx.restore();
}


/* =========================================================
   HUB WALKWAYS
   ========================================================= */

function drawHubPath(
  x1,
  x2,
  y
){

  const mid=
    (x1+x2)/2;


  const w=
    Math.abs(
      x2-x1
    )-100;


  const g=
    ctx.createLinearGradient(
      0,
      y-10,
      0,
      y+55
    );


  g.addColorStop(
    0,
    'rgba(223,241,247,.88)'
  );

  g.addColorStop(
    1,
    'rgba(83,111,136,.72)'
  );


  rr(
    ctx,
    mid-w/2,
    y-5,
    w,
    58,
    18,
    g,
    'rgba(49,77,101,.85)',
    4
  );


  ctx.save();

  ctx.strokeStyle=
    'rgba(99,233,255,.65)';

  ctx.lineWidth=3;

  ctx.setLineDash([
    18,
    15
  ]);


  ctx.beginPath();

  ctx.moveTo(
    mid-w/2+22,
    y+24
  );

  ctx.lineTo(
    mid+w/2-22,
    y+24
  );

  ctx.stroke();

  ctx.restore();
}


function drawHubLight(
  x,
  y,
  alt=false
){

  const pulse=
    .65+
    .35*
    Math.sin(
      G.time*4+
      x*.03
    );


  ctx.save();

  ctx.globalAlpha=pulse;


  ctx.shadowColor=
    alt
      ?'#70efff'
      :'#a889ff';


  ctx.shadowBlur=13;


  ellipse(
    ctx,
    x,
    y,
    5,
    3,
    alt
      ?'#baf8ff'
      :'#d8c8ff'
  );


  ctx.restore();
}


function drawHubSign(
  x,
  y,
  text,
  accent
){

  ctx.save();

  ctx.shadowColor=accent;

  ctx.shadowBlur=13;


  rr(
    ctx,
    x-62,
    y-15,
    124,
    30,
    10,
    'rgba(9,21,37,.9)',
    accent,
    2
  );


  ctx.shadowBlur=0;


  ctx.fillStyle=
    '#f4fbff';


  ctx.font=
    '900 10px system-ui';


  ctx.textAlign=
    'center';


  ctx.fillText(
    text,
    x,
    y+4
  );


  ctx.textAlign=
    'left';


  ctx.restore();
}


/* =========================================================
   PET SANCTUARY BUILDING
   ========================================================= */

function drawHubSanctuary(
  x,
  y
){

  shadow(
    x,
    y+10,
    190,
    28,
    .32
  );


  ctx.save();


  // Side habitat pods.

  const pod=
    ctx.createLinearGradient(
      x-100,
      y-110,
      x+100,
      y
    );


  pod.addColorStop(
    0,
    '#d7f2dc'
  );

  pod.addColorStop(
    .5,
    '#9ccaa9'
  );

  pod.addColorStop(
    1,
    '#587d6c'
  );


  rr(
    ctx,
    x-105,
    y-88,
    55,
    90,
    24,
    pod,
    '#355667',
    5
  );


  rr(
    ctx,
    x+50,
    y-88,
    55,
    90,
    24,
    pod,
    '#355667',
    5
  );


  // Main glass dome.

  const dome=
    ctx.createRadialGradient(
      x-28,
      y-118,
      8,
      x,
      y-82,
      105
    );


  dome.addColorStop(
    0,
    'rgba(235,255,248,.98)'
  );

  dome.addColorStop(
    .45,
    'rgba(139,226,205,.92)'
  );

  dome.addColorStop(
    1,
    'rgba(48,104,105,.95)'
  );


  ctx.fillStyle=dome;

  ctx.strokeStyle='#294d5d';

  ctx.lineWidth=6;


  ctx.beginPath();

  ctx.arc(
    x,
    y-56,
    82,
    Math.PI,
    0
  );

  ctx.lineTo(
    x+82,
    y
  );

  ctx.lineTo(
    x-82,
    y
  );

  ctx.closePath();

  ctx.fill();

  ctx.stroke();


  // Glass ribs.

  ctx.strokeStyle=
    'rgba(226,255,249,.55)';

  ctx.lineWidth=3;


  ctx.beginPath();

  ctx.arc(
    x,
    y-56,
    55,
    Math.PI,
    0
  );

  ctx.stroke();


  ctx.beginPath();

  ctx.moveTo(
    x,
    y-137
  );

  ctx.lineTo(
    x,
    y-7
  );

  ctx.stroke();


  // Habitat plants visible through glass.

  ctx.fillStyle=
    '#6fcf8e';


  for(
    const dx
    of [
      -48,
      -26,
      32,
      50
    ]
  ){

    ctx.beginPath();

    ctx.moveTo(
      x+dx,
      y-10
    );

    ctx.quadraticCurveTo(
      x+dx-12,
      y-48,
      x+dx+2,
      y-63
    );

    ctx.quadraticCurveTo(
      x+dx+15,
      y-42,
      x+dx,
      y-10
    );

    ctx.fill();
  }


  // Door.

  const door=
    ctx.createLinearGradient(
      x-24,
      y-66,
      x+24,
      y
    );


  door.addColorStop(
    0,
    '#16304a'
  );

  door.addColorStop(
    1,
    '#274f64'
  );


  rr(
    ctx,
    x-27,
    y-63,
    54,
    65,
    22,
    door,
    '#73e9df',
    4
  );


  ctx.shadowColor=
    '#6ef1df';

  ctx.shadowBlur=16;


  ctx.strokeStyle=
    '#9ffcef';

  ctx.lineWidth=3;


  ctx.beginPath();

  ctx.moveTo(
    x,
    y-54
  );

  ctx.lineTo(
    x,
    y-10
  );

  ctx.stroke();


  ctx.shadowBlur=0;


  // Paw hologram.

  ctx.save();

  ctx.translate(
    x,
    y-105
  );


  ctx.globalAlpha=
    .75+
    .2*
    Math.sin(
      G.time*3
    );


  ctx.shadowColor=
    '#9ffcef';

  ctx.shadowBlur=18;


  ellipse(
    ctx,
    0,
    8,
    10,
    8,
    '#c8fff5'
  );


  ellipse(
    ctx,
    -13,
    -4,
    5,
    6,
    '#c8fff5'
  );


  ellipse(
    ctx,
    0,
    -9,
    5,
    6,
    '#c8fff5'
  );


  ellipse(
    ctx,
    13,
    -4,
    5,
    6,
    '#c8fff5'
  );


  ctx.restore();


  drawHubSign(
    x,
    y-155,
    'PET SANCTUARY',
    '#76eadb'
  );


  ctx.restore();
}


/* =========================================================
   ARMOR WORKSHOP
   ========================================================= */

function drawHubArmory(
  x,
  y
){

  shadow(
    x,
    y+10,
    200,
    30,
    .34
  );


  ctx.save();


  // Heavy angular frame.

  const body=
    ctx.createLinearGradient(
      x-95,
      y-145,
      x+95,
      y
    );


  body.addColorStop(
    0,
    '#b8c7d4'
  );

  body.addColorStop(
    .45,
    '#667d93'
  );

  body.addColorStop(
    1,
    '#26384d'
  );


  ctx.fillStyle=body;

  ctx.strokeStyle='#1a2b3d';

  ctx.lineWidth=6;


  ctx.beginPath();

  ctx.moveTo(
    x-95,
    y
  );

  ctx.lineTo(
    x-82,
    y-105
  );

  ctx.lineTo(
    x-48,
    y-145
  );

  ctx.lineTo(
    x+48,
    y-145
  );

  ctx.lineTo(
    x+82,
    y-105
  );

  ctx.lineTo(
    x+95,
    y
  );

  ctx.closePath();

  ctx.fill();

  ctx.stroke();


  // Forge towers.

  rr(
    ctx,
    x-112,
    y-112,
    34,
    112,
    9,
    '#3e5267',
    '#1a2939',
    5
  );


  rr(
    ctx,
    x+78,
    y-112,
    34,
    112,
    9,
    '#3e5267',
    '#1a2939',
    5
  );


  for(
    const sx
    of [
      x-95,
      x+95
    ]
  ){

    ctx.save();


    ctx.globalAlpha=
      .7+
      .25*
      Math.sin(
        G.time*5+
        sx
      );


    ctx.shadowColor=
      '#ffb35c';

    ctx.shadowBlur=18;


    ellipse(
      ctx,
      sx,
      y-91,
      8,
      18,
      '#ffd08a'
    );


    ctx.restore();
  }


  // Central armored door.

  rr(
    ctx,
    x-38,
    y-79,
    76,
    80,
    12,
    '#172638',
    '#0c1724',
    5
  );


  ctx.strokeStyle=
    '#6cecff';

  ctx.lineWidth=3;

  ctx.shadowColor=
    '#6cecff';

  ctx.shadowBlur=12;


  ctx.beginPath();

  ctx.moveTo(
    x-25,
    y-64
  );

  ctx.lineTo(
    x,
    y-42
  );

  ctx.lineTo(
    x+25,
    y-64
  );

  ctx.stroke();


  ctx.shadowBlur=0;


  // Display racks.

  rr(
    ctx,
    x-72,
    y-77,
    24,
    58,
    7,
    '#24394e',
    '#7292aa',
    3
  );


  rr(
    ctx,
    x+48,
    y-77,
    24,
    58,
    7,
    '#24394e',
    '#7292aa',
    3
  );


  ctx.strokeStyle=
    '#dceaff';

  ctx.lineWidth=4;


  ctx.beginPath();

  ctx.moveTo(
    x-60,
    y-68
  );

  ctx.lineTo(
    x-60,
    y-33
  );

  ctx.moveTo(
    x+60,
    y-68
  );

  ctx.lineTo(
    x+60,
    y-33
  );

  ctx.stroke();


  // Armor crest hologram.

  ctx.save();

  ctx.translate(
    x,
    y-112
  );


  ctx.globalAlpha=
    .72+
    .2*
    Math.sin(
      G.time*3.5
    );


  ctx.shadowColor=
    '#6cecff';

  ctx.shadowBlur=15;


  ctx.fillStyle=
    '#b9f7ff';

  ctx.strokeStyle=
    '#31556d';

  ctx.lineWidth=2;


  ctx.beginPath();

  ctx.moveTo(
    -14,
    -12
  );

  ctx.lineTo(
    14,
    -12
  );

  ctx.lineTo(
    20,
    2
  );

  ctx.lineTo(
    0,
    20
  );

  ctx.lineTo(
    -20,
    2
  );

  ctx.closePath();

  ctx.fill();

  ctx.stroke();

  ctx.restore();


  drawHubSign(
    x,
    y-166,
    'ARMOR WORKSHOP',
    '#75eaff'
  );


  ctx.restore();
}


/* =========================================================
   RIFT TERMINAL
   ========================================================= */

function drawHubTerminal(
  x,
  y
){

  shadow(
    x,
    y+10,
    205,
    30,
    .34
  );


  ctx.save();


  // Tall Rift arch.

  const tower=
    ctx.createLinearGradient(
      x-90,
      y-170,
      x+90,
      y
    );


  tower.addColorStop(
    0,
    '#dff8fb'
  );

  tower.addColorStop(
    .4,
    '#5faebd'
  );

  tower.addColorStop(
    1,
    '#29445c'
  );


  rr(
    ctx,
    x-91,
    y-128,
    44,
    130,
    15,
    tower,
    '#23384d',
    5
  );


  rr(
    ctx,
    x+47,
    y-128,
    44,
    130,
    15,
    tower,
    '#23384d',
    5
  );


  ctx.strokeStyle=
    '#42657c';

  ctx.lineWidth=18;


  ctx.beginPath();

  ctx.arc(
    x,
    y-116,
    70,
    Math.PI,
    0
  );

  ctx.stroke();


  // Portal interior.

  const portal=
    ctx.createRadialGradient(
      x,
      y-67,
      8,
      x,
      y-67,
      70
    );


  portal.addColorStop(
    0,
    'rgba(239,255,255,.95)'
  );

  portal.addColorStop(
    .25,
    'rgba(105,238,255,.75)'
  );

  portal.addColorStop(
    .62,
    'rgba(126,91,237,.4)'
  );

  portal.addColorStop(
    1,
    'rgba(22,31,65,.08)'
  );


  ctx.fillStyle=portal;

  ctx.shadowColor='#72ecff';

  ctx.shadowBlur=26;


  ctx.beginPath();

  ctx.ellipse(
    x,
    y-65,
    54,
    70,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.shadowBlur=0;


  // Rotating holographic rings.

  ctx.save();

  ctx.translate(
    x,
    y-70
  );

  ctx.rotate(
    G.time*.35
  );


  ctx.strokeStyle=
    'rgba(202,252,255,.8)';

  ctx.lineWidth=2;


  ctx.beginPath();

  ctx.ellipse(
    0,
    0,
    42,
    17,
    0,
    0,
    Math.PI*2
  );

  ctx.stroke();


  ctx.rotate(
    Math.PI/3
  );


  ctx.beginPath();

  ctx.ellipse(
    0,
    0,
    42,
    17,
    0,
    0,
    Math.PI*2
  );

  ctx.stroke();

  ctx.restore();


  // Floating map shards.

  for(let i=0;i<5;i++){

    const a=
      G.time*.55+
      i*Math.PI*2/5;


    const rx=74;


    const px=
      x+
      Math.cos(a)*rx;


    const py=
      y-70+
      Math.sin(a)*22;


    ctx.save();

    ctx.translate(
      px,
      py
    );

    ctx.rotate(a);

    ctx.globalAlpha=.65;

    ctx.shadowColor='#a887ff';

    ctx.shadowBlur=10;

    ctx.fillStyle=
      i%2
        ?'#baf8ff'
        :'#c6b3ff';


    ctx.fillRect(
      -5,
      -5,
      10,
      10
    );


    ctx.restore();
  }


  // Control console.

  rr(
    ctx,
    x-55,
    y-29,
    110,
    32,
    9,
    '#13273b',
    '#6cecff',
    3
  );


  ctx.fillStyle=
    '#8ff3ff';


  for(let i=0;i<4;i++){

    ctx.fillRect(
      x-39+i*22,
      y-18,
      12,
      4
    );
  }


  drawHubSign(
    x,
    y-174,
    'RIFT TERMINAL',
    '#8befff'
  );


  ctx.restore();
}


/* =========================================================
   HUB CORE MONUMENT
   ========================================================= */

function drawHubCoreMonument(
  x,
  y
){

  ctx.save();


  shadow(
    x,
    y+88,
    105,
    20,
    .22
  );


  // Pedestal.

  rr(
    ctx,
    x-34,
    y+35,
    68,
    55,
    13,
    '#354b62',
    '#17293c',
    5
  );


  rr(
    ctx,
    x-48,
    y+75,
    96,
    18,
    8,
    '#5f7d93',
    '#20354a',
    4
  );


  // Floating diamond core.

  ctx.translate(
    x,
    y+15
  );


  ctx.rotate(
    Math.PI/4+
    G.time*.35
  );


  ctx.globalAlpha=
    .82+
    .16*
    Math.sin(
      G.time*4
    );


  ctx.shadowColor=
    '#6cecff';

  ctx.shadowBlur=28;


  const g=
    ctx.createLinearGradient(
      -18,
      -18,
      18,
      18
    );


  g.addColorStop(
    0,
    '#ffffff'
  );

  g.addColorStop(
    .45,
    '#86efff'
  );

  g.addColorStop(
    1,
    '#8b6dff'
  );


  ctx.fillStyle=g;

  ctx.strokeStyle=
    '#d7fbff';

  ctx.lineWidth=3;


  ctx.fillRect(
    -17,
    -17,
    34,
    34
  );


  ctx.strokeRect(
    -17,
    -17,
    34,
    34
  );


  ctx.restore();
}


/* =========================================================
   PARTICLE RENDERING
   ========================================================= */

function drawParticles(
  cam=0
){

  for(
    const p
    of G.particles
  ){

    ctx.save();


    ctx.globalAlpha=
      clamp(
        p.life/p.max,
        0,
        1
      );


    if(p.kind==='text'){

      ctx.fillStyle=
        p.color;


      ctx.font=
        '900 '+
        p.size+
        'px system-ui';


      ctx.textAlign=
        'center';


      ctx.fillText(
        p.text,
        p.x-cam,
        p.y
      );


      ctx.textAlign=
        'left';
    }

    else{

      ctx.fillStyle=
        p.color;


      ctx.shadowColor=
        p.color;


      ctx.shadowBlur=8;


      ctx.beginPath();


      ctx.arc(
        p.x-cam,
        p.y,
        p.size,
        0,
        Math.PI*2
      );


      ctx.fill();
    }


    ctx.restore();
  }
}


/* =========================================================
   BONUS MODE / PEER-TO-PEER ARENA
   ========================================================= */

let peer=null;

let connection=null;

let isHost=false;


const arena={

  active:false,

  bot:false,

  remote:{
    x:900,
    y:530,
    hp:1000,
    maxHP:1000,
    facing:-1,
    attack:0,
    name:'RIVAL'
  },

  local:{
    hp:1000,
    maxHP:1000
  },

  round:1,

  wins:0,

  losses:0,

  lastSend:0
};


function openBonus(){

  closeAllOverlays();


  $('bonusOverlay')
    .classList
    .remove('hidden');


  $('bonusHome')
    .classList
    .add('active');


  $('bonusLobby')
    .classList
    .remove('active');


  G.paused=true;


  SFX.resume();

  MUSIC.start();


  const code=
    new URLSearchParams(
      location.search
    ).get('fight');


  if(code){

    $('roomCodeInput').value=
      code;


    $('networkStatus').textContent=
      'Invite detected. Press JOIN FROM LINK / CODE.';
  }
}


function closeBonus(){

  disconnectPeer();


  $('bonusOverlay')
    .classList
    .add('hidden');


  G.paused=false;
}


function createFight(){

  if(typeof Peer==='undefined'){

    networkMessage(
      'PeerJS could not load. Check your internet connection.'
    );

    return;
  }


  disconnectPeer();


  isHost=true;


  peer=
    new Peer();


  networkMessage(
    'Creating private arena...'
  );


  $('bonusHome')
    .classList
    .remove('active');


  $('bonusLobby')
    .classList
    .add('active');


  peer.on(
    'open',
    id=>{

      const base=
        location.href
          .split('?')[0]
          .split('#')[0];


      const link=
        base+
        '?fight='+
        encodeURIComponent(id);


      $('roomCodeText').textContent=
        id;


      $('inviteLink').value=
        link;


      $('lobbyStatus').textContent=
        'Waiting for opponent...';
    }
  );


  peer.on(
    'connection',
    conn=>{

      connection=conn;

      setupConnection(conn);
    }
  );


  peer.on(
    'error',
    err=>
      networkMessage(
        'Connection error: '+
        err.type
      )
  );
}


function joinFight(){

  const id=
    $('roomCodeInput')
      .value
      .trim()
    ||
    new URLSearchParams(
      location.search
    ).get('fight');


  if(!id){

    networkMessage(
      'Paste a room code or open an invite link first.'
    );

    return;
  }


  if(typeof Peer==='undefined'){

    networkMessage(
      'PeerJS could not load. Check your internet connection.'
    );

    return;
  }


  disconnectPeer();


  isHost=false;


  peer=
    new Peer();


  networkMessage(
    'Connecting to arena...'
  );


  peer.on(
    'open',
    ()=>{

      connection=
        peer.connect(
          id,
          {
            reliable:true
          }
        );


      setupConnection(
        connection
      );
    }
  );


  peer.on(
    'error',
    err=>
      networkMessage(
        'Connection error: '+
        err.type
      )
  );
}


function setupConnection(
  conn
){

  conn.on(
    'open',
    ()=>{

      conn.send({
        type:'hello',
        name:'RIFTWALKER'
      });


      startArena(false);
    }
  );


  conn.on(
    'data',
    handleArenaData
  );


  conn.on(
    'close',
    ()=>{

      if(arena.active){

        toast(
          'RIFT ARENA',
          'Opponent disconnected.'
        );


        endArenaToMenu();
      }
    }
  );
}


function handleArenaData(d){

  if(
    !d ||
    typeof d!=='object'
  ){
    return;
  }


  if(d.type==='state'){

    arena.remote.x=
      d.x;

    arena.remote.y=
      d.y;

    arena.remote.facing=
      d.facing;

    arena.remote.hp=
      d.hp;

    arena.remote.attack=
      d.attack||0;

    arena.remote.name=
      d.name||
      'RIVAL';
  }


  if(d.type==='attack'){

    arena.remote.attack=.25;


    const dx=
      (
        P.x-
        arena.remote.x
      )*
      arena.remote.facing;


    if(
      dx>-40 &&
      dx<d.range &&
      Math.abs(
        P.y-
        arena.remote.y
      )<90
    ){

      arenaDamageLocal(
        d.damage
      );
    }
  }


  if(d.type==='round'){

    arena.remote.hp=
      d.hp||
      1000;
  }
}


function practiceArena(){

  disconnectPeer();

  arena.bot=true;

  startArena(true);
}


function startArena(
  bot
){

  closeAllOverlays();


  $('startScreen')
    .classList
    .add('hidden');


  $('hud')
    .classList
    .add('hidden');


  $('arenaHud')
    .classList
    .remove('hidden');


  G.scene='arena';

  G.paused=false;

  G.worldId=null;


  arena.active=true;

  arena.bot=bot;


  arena.local.hp=1000;

  arena.local.maxHP=1000;


  arena.remote={

    x:900,

    y:530,

    hp:1000,

    maxHP:1000,

    facing:-1,

    attack:0,

    name:
      bot
        ?'TRAINING BOT'
        :'RIVAL'
  };


  P.x=330;

  P.y=530;

  P.hp=1000;

  P.weapon='Nova Sword';

  P.attackCooldown=0;


  MUSIC.setWorld(
    'arena'
  );


  $('arenaP2Name').textContent=
    arena.remote.name;


  $('roundText').textContent=
    'ROUND '+
    arena.round;


  syncArenaHud();


  toast(
    'RIFT ARENA',
    'Fight!'
  );
}


function updateArena(dt){

  updatePlayer(
    dt,
    1280
  );


  arena.remote.attack=
    Math.max(
      0,
      arena.remote.attack-dt
    );


  if(arena.bot){

    const r=
      arena.remote;


    const dx=
      P.x-r.x;


    const dy=
      P.y-r.y;


    const distance=
      Math.hypot(
        dx,
        dy
      );


    if(
      Math.abs(dx)>8
    ){

      r.facing=
        dx>0
          ?1
          :-1;
    }


    if(distance>78){

      r.x+=
        dx/
        distance*
        155*
        dt;


      r.y+=
        dy/
        distance*
        112*
        dt;


      r.y=
        clamp(
          r.y,
          435,
          620
        );
    }


    r.botCd=
      (
        r.botCd||
        .5
      )-dt;


    if(
      distance<105 &&
      r.botCd<=0
    ){

      r.botCd=.65;

      r.attack=.25;


      arenaDamageLocal(
        randi(
          30,
          45
        )
      );
    }
  }

  else if(
    connection?.open
  ){

    arena.lastSend-=dt;


    if(
      arena.lastSend<=0
    ){

      arena.lastSend=.05;


      connection.send({

        type:'state',

        x:P.x,

        y:P.y,

        facing:P.facing,

        hp:arena.local.hp,

        attack:P.attackTimer,

        name:'RIFTWALKER'
      });
    }
  }


  if(
    arena.local.hp<=0 ||
    arena.remote.hp<=0
  ){

    finishArenaRound();
  }
}


function arenaLocalAttack(
  range,
  damage,
  critical=false
){

  const r=
    arena.remote;


  const dx=
    (
      r.x-P.x
    )*
    P.facing;


  if(
    dx>-40 &&
    dx<range &&
    Math.abs(
      r.y-P.y
    )<90
  ){

    if(arena.bot){

      r.hp=
        Math.max(
          0,
          r.hp-damage
        );


      burst(
        r.x,
        r.y-50,
        critical
          ?'#ffe88b'
          :'#ff7589',
        critical
          ?16
          :8
      );


      if(critical){

        SFX.crit();


        floatingText(
          'CRITICAL! '+
          damage,
          r.x,
          r.y-100,
          '#ffe88b'
        );


        G.screenShake=11;
      }

      else{

        SFX.hit();
      }
    }
  }


  if(
    connection?.open
  ){

    connection.send({

      type:'attack',

      range,

      damage,

      critical
    });
  }
}


function arenaDamageLocal(
  dmg
){

  arena.local.hp=
    Math.max(
      0,
      arena.local.hp-
      Math.max(
        1,
        Math.round(
          dmg-
          getStats().def*.25
        )
      )
    );


  P.hitFlash=.18;

  G.screenShake=7;


  SFX.hurt();


  burst(
    P.x,
    P.y-55,
    '#ff7589',
    8
  );


  syncArenaHud();
}


function finishArenaRound(){

  const won=
    arena.remote.hp<=0 &&
    arena.local.hp>0;


  if(won){

    arena.wins++;
  }

  else{

    arena.losses++;
  }


  toast(
    won
      ?'ROUND WON'
      :'ROUND LOST',

    `Score ${arena.wins} - ${arena.losses}`,

    2
  );


  arena.round++;


  arena.local.hp=1000;

  arena.remote.hp=1000;


  P.x=330;

  arena.remote.x=900;


  if(
    connection?.open
  ){

    connection.send({
      type:'round',
      hp:1000
    });
  }


  $('roundText').textContent=
    'ROUND '+
    arena.round;


  syncArenaHud();
}


function syncArenaHud(){

  const a=
    arena.local.hp/
    arena.local.maxHP;


  const b=
    arena.remote.hp/
    arena.remote.maxHP;


  $('arenaP1Hp').style.width=
    (
      a*100
    )+'%';


  $('arenaP2Hp').style.width=
    (
      b*100
    )+'%';


  $('arenaP1Text').textContent=
    arena.local.hp+
    ' / '+
    arena.local.maxHP;


  $('arenaP2Text').textContent=
    arena.remote.hp+
    ' / '+
    arena.remote.maxHP;
}


function drawArena(){

  const g=
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


  ctx.fillStyle=g;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  ctx.fillStyle=
    '#26384a';


  ctx.fillRect(
    0,
    400,
    W,
    320
  );


  for(let i=0;i<8;i++){

    ctx.globalAlpha=.18;


    ctx.fillStyle=
      i%2
        ?'#6cecff'
        :'#9b72ff';


    ctx.beginPath();

    ctx.moveTo(
      i*180,
      400
    );

    ctx.lineTo(
      i*180+100,
      250
    );

    ctx.lineTo(
      i*180+200,
      400
    );

    ctx.fill();
  }


  ctx.globalAlpha=1;


  drawRiftwalker(
    P.x,
    P.y-P.jump,
    1,
    false
  );


  drawRemoteRiftwalker(
    arena.remote.x,
    arena.remote.y,
    arena.remote
  );


  drawParticles(0);


  syncArenaHud();
}


function drawRemoteRiftwalker(
  x,
  y,
  r
){

  const saveFacing=
    P.facing;


  const saveAttack=
    P.attackTimer;


  const saveIndex=
    P.attackIndex;


  P.facing=
    r.facing;


  P.attackTimer=
    r.attack;


  P.attackIndex=1;


  drawRiftwalker(
    x,
    y,
    1,
    true
  );


  P.facing=
    saveFacing;


  P.attackTimer=
    saveAttack;


  P.attackIndex=
    saveIndex;
}


function endArenaToMenu(){

  arena.active=false;

  arena.bot=false;


  disconnectPeer();


  $('arenaHud')
    .classList
    .add('hidden');


  $('hud')
    .classList
    .add('hidden');


  $('startScreen')
    .classList
    .remove('hidden');


  G.scene='menu';


  MUSIC.setWorld(
    'hub'
  );
}


function disconnectPeer(){

  try{
    connection?.close();
  }
  catch{}


  try{
    peer?.destroy();
  }
  catch{}


  connection=null;

  peer=null;
}


function networkMessage(t){

  $('networkStatus').textContent=
    t;


  $('lobbyStatus').textContent=
    t;
}


/* =========================================================
   BONUS BUTTONS
   ========================================================= */

$('bonusBtn').onclick=
  openBonus;


$('closeBonus').onclick=
  closeBonus;


$('createFightBtn').onclick=
  createFight;


$('joinFightBtn').onclick=
  joinFight;


$('practiceBtn').onclick=
  practiceArena;


$('cancelLobbyBtn').onclick=
  ()=>{

    disconnectPeer();


    $('bonusLobby')
      .classList
      .remove('active');


    $('bonusHome')
      .classList
      .add('active');
  };


$('copyInviteBtn').onclick=
  async()=>{

    try{

      await navigator.clipboard
        .writeText(
          $('inviteLink').value
        );


      $('copyInviteBtn').textContent=
        'COPIED';


      setTimeout(
        ()=>
          $('copyInviteBtn').textContent=
            'COPY LINK',
        1200
      );
    }

    catch{

      $('inviteLink').select();


      networkMessage(
        'Select and copy the link manually.'
      );
    }
  };
/* =========================================================
   MAIN UPDATE / DRAW LOOP
   ========================================================= */

function update(dt){

  G.time+=dt;

  if(G.paused){
    justPressed.clear();
    return;
  }


  G.screenShake=
    Math.max(
      0,
      G.screenShake-dt*24
    );


  G.flash=
    Math.max(
      0,
      G.flash-dt
    );


  updateParticles(dt);


  if(G.messageTime>0){

    G.messageTime-=dt;

    if(G.messageTime<=0){

      $('toast')
        .classList
        .add('hidden');
    }
  }


  /* OPENING SPACE FLIGHT */

  if(G.scene==='flight'){

    G.sceneTime+=dt;


    $('cinematic')
      .classList
      .remove('hidden');


    $('cinematic').textContent=

      G.sceneTime<2
        ?'DEEP SPACE'

        :G.sceneTime<4
          ?'UNKNOWN SIGNAL DETECTED'

          :G.sceneTime<6
            ?'NAVIGATION FAILURE'

            :'PULL UP!';


    if(G.sceneTime>7){

      G.scene='crash';

      G.sceneTime=0;
    }


    justPressed.clear();

    return;
  }


  /* CRASH SEQUENCE */

  if(G.scene==='crash'){

    G.sceneTime+=dt;


    $('cinematic').textContent=
      G.sceneTime<1.5
        ?'IMPACT IMMINENT'
        :'';


    if(G.sceneTime>3){

      $('cinematic')
        .classList
        .add('hidden');


      beginWorld('earth');
    }


    justPressed.clear();

    return;
  }


  /* WORLD TRAVEL */

  if(G.scene==='travel'){

    G.sceneTime+=dt;


    if(G.sceneTime>2.2){

      beginWorld(
        G.travelTarget
      );
    }


    justPressed.clear();

    return;
  }


  /* RIFT ARENA */

  if(G.scene==='arena'){

    updateArena(dt);

    syncHUD();

    justPressed.clear();

    return;
  }


  /* HUB */

  if(G.scene==='hub'){

    updatePlayer(
      dt,
      1280
    );


    updateInteraction();
  }


  /* NORMAL WORLD */

  if(G.scene==='world'){

    updatePlayer(
      dt,
      WORLDS[G.worldId].width
    );


    updateEnemies(dt);


    G.camera=
      lerp(
        G.camera,

        clamp(
          P.x-W*.44,
          0,
          WORLDS[G.worldId].width-W
        ),

        .08
      );


    updateInteraction();
  }


  syncHUD();


  justPressed.clear();
}


/* =========================================================
   MAIN DRAW
   ========================================================= */

function draw(){

  ctx.save();


  /* SCREEN SHAKE */

  if(G.screenShake>0){

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


  /* MAIN MENU */

  if(G.scene==='menu'){

    space(
      G.time*8
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


  /* OPENING SHIP FLIGHT */

  else if(G.scene==='flight'){

    space(
      G.sceneTime*85
    );


    drawShip(
      370,
      360,
      1.35,
      0
    );
  }


  /* CRASH */

  else if(G.scene==='crash'){

    space(
      G.time*60
    );


    const p=
      clamp(
        G.sceneTime/3,
        0,
        1
      );


    drawPlanet(

      W/2,

      lerp(
        760,
        380,
        p
      ),

      lerp(
        200,
        700,
        p
      ),

      '#79dd94',

      '#1c5b42'
    );


    drawShip(

      W/2,

      lerp(
        130,
        560,
        p
      ),

      1.45,

      p*2
    );
  }


  /* RIFT TRAVEL */

  else if(G.scene==='travel'){

    space(
      G.time*110
    );


    drawShip(
      W/2,
      360,
      1.35,
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

      520*
      clamp(
        G.sceneTime/2.2,
        0,
        1
      ),

      14,
      7,
      '#6fe1ff'
    );


    ctx.fillStyle='#fff';


    ctx.font=
      '900 14px system-ui';


    ctx.textAlign=
      'center';


    ctx.fillText(
      'TRAVELLING THROUGH THE RIFT',
      W/2,
      590
    );


    ctx.textAlign=
      'left';
  }


  /* HUB */

  else if(G.scene==='hub'){

    drawHub();

    drawParticles(0);
  }


  /* WORLD */

  else if(G.scene==='world'){

    drawWorld();

    drawParticles(
      G.camera
    );
  }


  /* ARENA */

  else if(G.scene==='arena'){

    drawArena();
  }


  /* SCREEN HIT FLASH */

  if(G.flash>0){

    ctx.fillStyle=
      `rgba(255,255,255,${G.flash*4})`;


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
   BUTTONS / INITIALIZATION
   ========================================================= */

$('newBtn').onclick=
  ()=>{

    SFX.resume();

    resetGame();
  };


$('loadBtn').onclick=
  ()=>{

    SFX.resume();


    if(!loadGame()){

      toast(
        'SYSTEM',
        'No save game found.'
      );
    }
  };


function resizeCanvasCss(){

  /*
    Canvas keeps its internal 1280 x 720
    16:9 resolution.

    CSS handles responsive scaling.
  */
}


window.addEventListener(
  'resize',
  resizeCanvasCss
);


/* =========================================================
   AUTOMATIC FIGHT INVITE DETECTION
   ========================================================= */

const fightParam=
  new URLSearchParams(
    location.search
  ).get('fight');


if(fightParam){

  setTimeout(
    openBonus,
    50
  );
}


/* =========================================================
   GAME LOOP
   ========================================================= */

let last=
  performance.now();


function loop(now){

  const dt=
    Math.min(
      .033,
      (now-last)/1000
    );


  last=now;


  update(dt);


  draw();


  requestAnimationFrame(
    loop
  );
}


/* =========================================================
   START
   ========================================================= */

syncHUD();


requestAnimationFrame(
  loop
);
