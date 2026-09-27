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


/* =========================================================
   MULTIVERSE: RIFTWALKER — EXPANSION PACK
   ---------------------------------------------------------
   This expansion is merged into this script.js file, directly
   after the original game code above. Nothing else to install.

   MUSIC
   - Longer songs built from sections (intro / verse / chorus /
     bridge) with drum fills, crash cymbals and counter-melodies
   - Synthesized choir ("ooh / aah / eeh") and a sung lead voice
   - New songs: Hub, Pet Sanctuary, Rift Travel, Rift Trials,
     and a different boss theme for every world
   - Jingles: victory, stage failed, level up, secret found,
     pet found, achievement
   - Music gets muffled while the pause / map / inventory is open
   - Very loud mix with a compressor + limiter

   GAME CONTENT
   - XP + leveling (level-ups raise stats and heal you)
   - 24 weapons: world weapons plus special ones unlocked by
     Rift Trials waves, crew rescues, fusions, level and secrets.
     Includes RANGED (blaster, bow, cannon) and THROWN (boomerang)
     weapons, burning, pulling, double hits and blocking.
   - Elite enemies and ranged enemies that shoot
   - Bosses get special attacks (shockwaves, bullet rings,
     volleys) with a warning before each one
   - Dodge shots by dashing or jumping; hit shots to PARRY them
   - Health orbs dropped by enemies
   - Rift Bounties in every world
   - RIFT TRIALS: endless survival waves (gate in The Hub)
   - PETS: every pet shows stats (HP / ATK / DEF / SPD / POWER) and
     has abilities such as Attack Rise. Your active pet's abilities
     boost you. The FUSION MACHINE in The Hub fuses two pets into a
     new one, combining stats and merging abilities (matching
     abilities level up to III).
   - 25 achievements, a stats page and a SOUND TEST (key K)

   NEW WORLDS (unlock one by one after the Perfect Matrix)
   - Ocean Depths   : oxygen meter, grab air bubbles
   - Candy Kingdom  : collect candy to trigger Sugar Rush
   - Frost Peaks    : freezing cold, warm up at campfires
   - Dino Jungle    : dodge stampedes charging down a lane
   - Sky Citadel    : wind gusts and lightning strikes
   Each has its own enemies, boss, 8 pets, music, boss theme,
   weapon, armor and material.

   ROLES — only the Astronaut (you) is unlocked at first. The crash
   scattered the other 10 crew members across the worlds. Find and
   rescue each one to unlock their role. Your first rescued crew
   member becomes the builder: every time you leave The Hub for a
   world, they build houses in the Crew Village for everyone you
   have rescued. Visit a house (E) to switch roles.
   - Astronaut  : balanced
   - Adventurer : fast movement + fast attacks, lower HP
   - Guardian   : huge HP + defense, slower
   - Ninja      : high crit chance + crit damage
   - Berserker  : huge attack, low defense
   - Medic      : heals 1.5% HP per second
   - Engineer   : pet attacks twice as fast
   - Treasure Hunter : +50% credits and XP
   - Vampire    : heals 8% of damage dealt, low HP
   - Rift Mage  : +45% attack range, low defense
   - Speedster  : fastest role, dash recharges 2x, very low HP
   ========================================================= */

(() => {
'use strict';

const CFG = {
  musicVolume: 1.6,   // 1 = normal, 1.6 = very loud, 2.5 = maximum
  sfxVolume: 1.5,
  saveKey: 'multiverse_riftwalker_ext_v1'
};


/* =========================================================
   1. MUSIC THEORY HELPERS
   ========================================================= */

const NOTE_IDX = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};

function nameToMidi(n){
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(n);
  if(!m) return null;
  return (parseInt(m[3],10)+1)*12 + NOTE_IDX[m[1]] + (m[2]==='#'?1:m[2]==='b'?-1:0);
}

const mtof = m => 440*Math.pow(2,(m-69)/12);

const CHORD_TYPES = {
  '':[0,4,7], m:[0,3,7], dim:[0,3,6], sus4:[0,5,7],
  '7':[0,4,7,10], maj7:[0,4,7,11], m7:[0,3,7,10], '5':[0,7,12]
};

function chordMidi(sym){
  const m = /^([A-G])([#b]?)(.*)$/.exec(sym);
  const semis = (NOTE_IDX[m[1]] + (m[2]==='#'?1:m[2]==='b'?-1:0) + 12) % 12;
  let root = 48 + semis;
  if(semis >= 8) root -= 12;
  return (CHORD_TYPES[m[3]] || CHORD_TYPES['']).map(i => root+i);
}

// Melody text: note = play, '-' = hold previous note, '.' = rest
function parseMel(str, bars){
  const tk = str.trim().split(/\s+/);
  const out = [];
  for(let i=0;i<tk.length;i++){
    const midi = nameToMidi(tk[i]);
    if(midi === null){ out.push(null); continue; }
    let len = 1;
    while(tk[i+len] === '-') len++;
    out.push({m:midi, len});
  }
  while(out.length < bars*16) out.push(null);
  return out;
}

function seeded(seed){
  let a = seed >>> 0;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Generates a melody that walks through the chord tones.
function genMel(chords, g){
  const rnd = seeded(g.seed || 1);
  const oct = g.oct || 5;
  const moves = [-2,-1,-1,0,1,1,2];
  const out = [];
  let idx = -1;

  chords.forEach(ch => {
    const ladder = [];
    for(const o of [oct-1, oct]){
      for(const m of ch) ladder.push((o+1)*12 + (m % 12));
    }
    const uniq = [...new Set(ladder)].sort((a,b)=>a-b);
    if(idx < 0) idx = Math.floor(uniq.length/2);

    for(let i=0;i<16;i++){
      const c = g.r[i];
      if(c === 'x'){
        idx = clamp(idx + moves[Math.floor(rnd()*moves.length)], 0, uniq.length-1);
        let len = 1;
        while(g.r[i+len] === '-' && i+len < 16) len++;
        out.push({m:uniq[idx], len});
      }else{
        out.push(null);
      }
    }
  });
  return out;
}


/* =========================================================
   2. DRUM GROOVES
   k = kick, s = snare, h = hat (x closed / o open), t = tom
   ========================================================= */

const GROOVES = {
  soft:     {k:'x.......x.......', h:'....x.......x...'},
  rock:     {k:'X.......x.x.....', s:'....X.......X...', h:'x.x.x.x.x.x.x.x.'},
  half:     {k:'X.........x.....', s:'........X.......', h:'x.x.x.x.x.x.x.x.'},
  four:     {k:'X...x...X...x...', s:'....X.......X...', h:'..o...o...o...o.'},
  shuffle:  {k:'X.....x.x.......', s:'....X.......X...', h:'x.xx.xx.xx.xx.x.'},
  march:    {k:'X..x..x.X..x..x.', s:'....X.......X..X', h:'x.x.x.x.x.x.x.x.', t:'............tt..'},
  battle:   {k:'X.x...x.X.x...xx', s:'....X.......X...', h:'xxxxxxxxxxxxxxxx'},
  blast:    {k:'X.x.X.x.X.x.X.xx', s:'....X.......X.XX', h:'x.x.x.x.x.x.x.x.', t:'........tt..tt..'},
  techno:   {k:'X...x...X...x...', s:'....X.......X...', h:'x.xxx.xxx.xxx.xx'},
  ambient:  {k:'x...............', h:'........x.......'},
  heartbeat:{k:'X..x............'}
};


/* =========================================================
   3. SONG BOOK
   Each song has sections of 4 bars and a "form" (the order
   the sections play in). Section options:
   ch = chords, mel = written melody, gen = generated melody,
   dr = groove (null = no drums), choir = 'aah'|'ooh'|'eeh',
   vox = choir sings the melody, counter = counter-melody,
   arp = arpeggio on/off
   ========================================================= */

const MAIN_SECTIONS = {
  I:{ch:['Dm','Bb','F','C'], dr:'soft', arp:true, choir:'ooh'},
  A:{ch:['Dm','Bb','F','C'], mel:
    'D4 - F4 A4 D5 - - C5 A4 - F4 - A4 - - - '+
    'Bb4 - - A4 F4 - D4 - F4 - A4 - Bb4 - - - '+
    'C5 - - A4 F4 - C5 - F5 - E5 - C5 - - - '+
    'E5 - D5 - C5 - G4 - C5 - D5 - E5 - - -'},
  B:{ch:['Bb','C','Am','Dm'], choir:'aah', counter:true, mel:
    'F5 - - - E5 - D5 - C5 - - - D5 - E5 - '+
    'G5 - - - F5 - E5 - C5 - - - D5 - E5 - '+
    'E5 - - - D5 - C5 - A4 - - - C5 - E5 - '+
    'D5 - - - - - - - A4 - D5 - F5 - A5 -'},
  C:{ch:['Gm','Dm','Bb','A'], choir:'aah', vox:true, dr:'half', mel:
    'G4 - - - A4 - Bb4 - D5 - - - C5 - Bb4 - '+
    'A4 - - - - - F4 - D4 - - - F4 - A4 - '+
    'Bb4 - - - C5 - D5 - F5 - - - E5 - D5 - '+
    'C#5 - - - - - - - E5 - - - - - - -'}
};

function bossDef(o){
  return {
    title:o.title, bpm:o.bpm,
    lead:o.lead || 'sawtooth', leadVol:.22, leadCut:o.cut || 2800,
    fat:o.fat !== false, glitch:o.glitch, harmony:'octDown',
    bass:'R R R R R R R R R R R R O O 5 5',
    bassWave:'sawtooth', bassVol:.28, bassLen:.9, bassCut:600,
    pad:'sawtooth', padVol:.045, padCut:1200,
    echo:o.echo || .12, groove:o.groove || 'battle',
    sections:{
      A: o.mel ? {ch:o.ch, mel:o.mel}
               : {ch:o.ch, gen:{r:'x-x-x-x-x---x-x-', oct:5, seed:o.seed}},
      B:{ch:o.ch2 || o.ch, gen:{r:'x---x---x-x-x-x-', oct:5, seed:o.seed+1}, choir:o.choir || 'aah', counter:true},
      C:{ch:o.ch, gen:{r:'x-------x-------', oct:5, seed:o.seed+2}, choir:o.choir || 'aah', vox:true, dr:'half'}
    },
    form:['A','A','B','A','C','B']
  };
}

const SONG_DEFS = {

  menu:{
    title:'Across the Rift (Main Theme)', bpm:100,
    lead:'triangle', leadVol:.26, leadCut:5200, harmony:'octDown',
    bass:'R . . R . . R . R . . R . . 5 .', bassWave:'sawtooth', bassVol:.24, bassCut:700,
    pad:'sawtooth', padVol:.045, padCut:1600, echo:.22, groove:'rock',
    sections:MAIN_SECTIONS,
    form:['I','A','A','B','C','B','A','B']
  },

  hub:{
    title:'Across the Rift (Hub Version)', bpm:84,
    lead:'sine', leadVol:.26, harmony:'octUp',
    bass:'R . . . . . . . 5 . . . . . . .', bassWave:'sine', bassVol:.3, bassLen:6,
    pad:'triangle', padVol:.07, padCut:2000, echo:.3, groove:'soft', grooveOverride:'soft',
    sections:MAIN_SECTIONS,
    form:['I','A','C','A']
  },

  sanctuary:{
    title:'Pet Sanctuary Lullaby', bpm:90,
    lead:'sine', leadVol:.24, harmony:'octUp',
    bass:'R . . . 5 . . . R . . . 5 . . .', bassWave:'sine', bassVol:.28, bassLen:3,
    pad:'triangle', padVol:.08, echo:.3, groove:'soft',
    sections:{
      A:{ch:['F','Dm','Bb','C'], dr:null, choir:'ooh', mel:
        'A5 - C6 - A5 - F5 - G5 - - - E5 - - - '+
        'F5 - A5 - F5 - D5 - E5 - - - C5 - - - '+
        'D5 - F5 - Bb5 - A5 - G5 - F5 - G5 - - - '+
        'E5 - - - G5 - - - C6 - - - - - - -'},
      B:{ch:['Bb','C','Am','Dm'], gen:{r:'x-x-x---x-x-x---', oct:5, seed:7}, counter:true}
    },
    form:['A','B','A','B']
  },

  travel:{
    title:'Rift Travel', bpm:132,
    lead:'triangle', leadVol:.18,
    bass:'R R R R R R R R R R R R R R R R', bassWave:'sawtooth', bassVol:.2, bassLen:.9,
    pad:'sawtooth', padVol:.05, arp:true, arpWave:'sawtooth', arpVol:.05,
    echo:.3, groove:'four',
    sections:{
      A:{ch:['Em','C','G','D'], gen:{r:'x---x---x-x-x---', oct:5, seed:61}, choir:'ooh'}
    },
    form:['A']
  },

  earth:{
    title:'First Light on Earth 2.0', bpm:112,
    lead:'triangle', leadVol:.26, harmony:'octDown',
    bass:'R . R . 5 . R . R . R . 5 . O .', bassWave:'triangle', bassVol:.32, bassCut:900,
    pad:'triangle', padVol:.05, echo:.12, groove:'rock',
    sections:{
      I:{ch:['G','C','G','D'], dr:'soft', arp:true},
      A:{ch:['G','Em','C','D'], mel:
        'G4 - B4 D5 - B4 G4 - A4 - B4 - D5 - - - '+
        'E5 - D5 B4 - G4 E4 - G4 - B4 - A4 - - - '+
        'C5 - E5 G5 - E5 C5 - D5 - E5 - G5 - - - '+
        'F#5 - E5 D5 - A4 F#4 - A4 - D5 - - - - -'},
      B:{ch:['C','D','Bm','Em'], gen:{r:'x-x-x-x-x---x-x-', oct:5, seed:11}, choir:'aah', counter:true},
      C:{ch:['Am','D','G','G'], gen:{r:'x---x---x-x-x---', oct:5, seed:4}, dr:'half', vox:true, choir:'ooh'}
    },
    form:['I','A','A','B','C','B','A']
  },

  music:{
    title:'Neon Frequency', bpm:124,
    lead:'square', leadVol:.2, leadCut:3200, fat:true,
    bass:'R . . R . . R . R . . R . . O .', bassWave:'sawtooth', bassVol:.26, bassCut:800,
    arp:true, arpWave:'square', arpVol:.05, echo:.18, groove:'four',
    sections:{
      A:{ch:['Am','F','C','G'], mel:
        'A4 - C5 - E5 - A5 - G5 - E5 - C5 - D5 - '+
        'F5 - - E5 - C5 - A4 - C5 - F5 - E5 - - '+
        'E5 - - - G5 - E5 - C5 - - - G4 - - - '+
        'B4 - D5 - G5 - - - F5 - E5 - D5 - - -'},
      B:{ch:['F','G','Em','Am'], gen:{r:'x-x-x-xxx-x-x-x-', oct:5, seed:21}, vox:true, choir:'aah', counter:true},
      C:{ch:['Dm','Am','Dm','E'], gen:{r:'x-------x-------', oct:5, seed:5}, dr:'half', choir:'ooh'}
    },
    form:['A','A','B','B','C','B']
  },

  money:{
    title:'Market Day Shuffle', bpm:118,
    lead:'square', leadVol:.18, leadCut:3800, harmony:'octUp', legato:.7,
    bass:'R . 5 . R . 5 . R . 5 . R . 5 .', bassWave:'triangle', bassVol:.34, bassLen:1.2,
    echo:.1, groove:'shuffle',
    sections:{
      A:{ch:['C','Am','F','G'], mel:
        'C5 - E5 - G5 - E5 - C5 - - - G4 - - - '+
        'A4 - C5 - E5 - C5 - A4 - - - E5 - D5 - '+
        'F4 - A4 - C5 - F5 - E5 - D5 - C5 - - - '+
        'B4 - D5 - G5 - F5 - D5 - B4 - G4 - - -'},
      B:{ch:['F','G','Em','Am'], gen:{r:'x-x-x-x-x-x-x---', oct:5, seed:9}, counter:true},
      C:{ch:['Dm7','G7','Cmaj7','A7'], gen:{r:'x-.xx-.xx-.xx---', oct:5, seed:13}, choir:'aah', vox:true}
    },
    form:['A','B','A','C','B','A']
  },

  cosmos:{
    title:'Drifting Between Stars', bpm:76,
    lead:'sine', leadVol:.28, harmony:'octUp',
    bass:'R . . . . . . . . . . . . . . .', bassWave:'sine', bassVol:.36, bassLen:14,
    pad:'triangle', padVol:.09, padCut:2400, arp:true, arpWave:'sine', arpVol:.045,
    echo:.45, groove:'ambient',
    sections:{
      I:{ch:['Fmaj7','Fmaj7','Cmaj7','Cmaj7'], choir:'ooh'},
      A:{ch:['Fmaj7','Cmaj7','Am7','G'], mel:
        'A5 - - - - - - - E5 - - - G5 - - - '+
        'E5 - - - - - - - D5 - - - C5 - - - '+
        'C5 - - - E5 - - - A5 - - - - - - - '+
        'B4 - - - D5 - - - G5 - - - - - - -'},
      B:{ch:['Dm7','Bbmaj7','F','C'], gen:{r:'x-------x---x---', oct:5, seed:2}, choir:'ooh', vox:true}
    },
    form:['I','A','B','A','B']
  },

  war:{
    title:'Titan Factory Assault', bpm:140,
    lead:'sawtooth', leadVol:.2, leadCut:2600, fat:true,
    bass:'R R R R R R R R R R R R 5 5 O O', bassWave:'sawtooth', bassVol:.26, bassLen:.9, bassCut:600,
    echo:.08, groove:'march',
    sections:{
      A:{ch:['Em','C','D','Em'], mel:
        'E4 - E4 - G4 - E4 - B4 - A4 - G4 - F#4 - '+
        'E4 - E4 - G4 - B4 - C5 - B4 - A4 - G4 - '+
        'D5 - D5 - C5 - B4 - A4 - G4 - A4 - B4 - '+
        'E5 - - - B4 - - - E4 - - - - - - -'},
      B:{ch:['C','D','Em','Em'], gen:{r:'x-x-x-x-x-x-xxxx', oct:5, seed:17}, choir:'aah', counter:true, dr:'battle'},
      C:{ch:['Am','Em','B','B'], gen:{r:'x---x---x-x-x---', oct:4, seed:6}, choir:'aah', vox:true, dr:'half'}
    },
    form:['A','A','B','C','B','A']
  },

  void:{
    title:'Heartbeat of the Abyss', bpm:64,
    lead:'sine', leadVol:.3, leadCut:1800,
    bass:'R . . . . . . . . . . . . . . .', bassWave:'sine', bassVol:.42, bassLen:15,
    pad:'sawtooth', padVol:.07, padCut:600, echo:.5, groove:'heartbeat',
    sections:{
      A:{ch:['Cm','Ab','Fm','G'], mel:
        '. . . . Eb5 - - - . . D5 - - - . . '+
        '. . . . C5 - - - - - . . G4 - - - '+
        '. . . . Ab4 - - - . . G4 - - - F4 - '+
        '. . . . G4 - - - B4 - - - - - - -'},
      B:{ch:['Fm','Db','Cm','G'], gen:{r:'x-------x-------', oct:4, seed:3}, choir:'ooh', vox:true}
    },
    form:['A','A','B','A','B']
  },

  matrix:{
    title:'Perfect Error.exe', bpm:128,
    lead:'square', leadVol:.18, leadCut:3000, glitch:true,
    bass:'R . R R . R . R R . R . R . O .', bassWave:'sawtooth', bassVol:.26, bassLen:.9,
    arp:true, arpWave:'sawtooth', arpVol:.05, echo:.2, groove:'techno',
    sections:{
      A:{ch:['Dm','Gm','Bb','A'], mel:
        'D5 - A4 - F5 - A4 - E5 - A4 - D5 - C5 - '+
        'Bb4 - G4 - D5 - G4 - F5 - E5 - D5 - - - '+
        'F5 - D5 - Bb4 - D5 - A5 - G5 - F5 - - - '+
        'E5 - C#5 - A4 - C#5 - E5 - G5 - A5 - - -'},
      B:{ch:['Gm','Dm','A','Dm'], gen:{r:'xxx.xxx.xxx.x-x-', oct:5, seed:23}, vox:true, choir:'eeh'},
      C:{ch:['Bb','C','Dm','Dm'], gen:{r:'x.......x.x.x...', oct:4, seed:31}, dr:'half', choir:'ooh'}
    },
    form:['A','B','A','C','B']
  },

  arena:{
    title:'Riftwalker Showdown', bpm:150,
    lead:'sawtooth', leadVol:.2, leadCut:3200, fat:true,
    bass:'R R O R R R O R R R O R 5 5 O 5', bassWave:'sawtooth', bassVol:.26, bassLen:.9, bassCut:650,
    groove:'battle',
    sections:{
      A:{ch:['Em','C','G','D'], mel:
        'B4 - B4 - D5 - E5 - - - D5 - B4 - A4 - '+
        'G4 - G4 - A4 - B4 - - - C5 - B4 - G4 - '+
        'D5 - D5 - E5 - F#5 - - - E5 - D5 - B4 - '+
        'A4 - A4 - B4 - A4 - F#4 - - - D4 - - -'},
      B:{ch:['C','D','Em','Em'], gen:{r:'x-x-xx-xx-x-x---', oct:5, seed:41}, choir:'aah', counter:true}
    },
    form:['A','A','B','A','B']
  },

  trials:{
    title:'Trial of the Endless Rift', bpm:138,
    lead:'sawtooth', leadVol:.2, leadCut:2800, fat:true,
    bass:'R . R R . R R . R . R R . R O .', bassWave:'sawtooth', bassVol:.26, bassLen:.9,
    pad:'sawtooth', padVol:.04, groove:'battle',
    sections:{
      A:{ch:['Gm','Eb','F','D'], gen:{r:'x-x-x-x-x---x-x-', oct:5, seed:51}},
      B:{ch:['Cm','Gm','D','D'], gen:{r:'x---x-x-x---xxxx', oct:5, seed:52}, choir:'aah', counter:true},
      C:{ch:['Eb','F','Gm','Gm'], gen:{r:'x-------x-------', oct:5, seed:53}, choir:'aah', vox:true, dr:'half'}
    },
    form:['A','A','B','C','B']
  },

  ocean:{
    title:'Songs of the Deep', bpm:88,
    lead:'sine', leadVol:.28, harmony:'octUp',
    bass:'R . . . . . 5 . R . . . . . . .', bassWave:'sine', bassVol:.34, bassLen:5,
    pad:'triangle', padVol:.08, padCut:1800, arp:true, arpWave:'sine', arpVol:.045,
    echo:.45, groove:'soft',
    sections:{
      I:{ch:['Dm7','Bbmaj7','Dm7','Bbmaj7'], choir:'ooh', dr:null},
      A:{ch:['Dm7','Bbmaj7','Fmaj7','C'], mel:
        'A4 - - - C5 - D5 - - - F5 - E5 - - - '+
        'D5 - - - - - A4 - - - F4 - A4 - - - '+
        'C5 - - - A4 - F5 - - - E5 - C5 - - - '+
        'G4 - - - - - - - E5 - - - D5 - - -'},
      B:{ch:['Gm7','Dm7','Bbmaj7','A'], gen:{r:'x-------x---x---', oct:5, seed:141}, choir:'ooh', vox:true, counter:true}
    },
    form:['I','A','A','B','A','B']
  },

  candy:{
    title:'Sugar Rush Parade', bpm:132,
    lead:'square', leadVol:.18, leadCut:4200, harmony:'octUp', legato:.75,
    bass:'R . O . R . O . R . O . 5 . O .', bassWave:'triangle', bassVol:.32, bassLen:1.1,
    arp:true, arpWave:'square', arpVol:.045, echo:.12, groove:'four',
    sections:{
      A:{ch:['F','Dm','Bb','C'], mel:
        'F5 . A5 . C6 . A5 . F5 . G5 A5 G5 . . . '+
        'D5 . F5 . A5 . F5 . D5 . E5 F5 E5 . . . '+
        'Bb4 . D5 . F5 . Bb5 . A5 . G5 . F5 . D5 . '+
        'C5 . E5 . G5 . C6 - - - - - . . . .'},
      B:{ch:['Bb','C','Am','Dm'], gen:{r:'x-x-x-x-xxx-x---', oct:5, seed:151}, choir:'eeh', vox:true, counter:true},
      C:{ch:['Gm','C','F','F'], gen:{r:'x.x.x.x.x-x-x---', oct:5, seed:152}, dr:'shuffle'}
    },
    form:['A','A','B','C','B','A']
  },

  frost:{
    title:'Frozen Summit', bpm:96,
    lead:'triangle', leadVol:.26, harmony:'octUp',
    bass:'R . . . 5 . . . R . . . O . . .', bassWave:'sine', bassVol:.32, bassLen:3,
    pad:'sawtooth', padVol:.05, padCut:1400, arp:true, arpWave:'sine', arpVol:.05,
    echo:.35, groove:'half',
    sections:{
      I:{ch:['Bm','G','D','A'], choir:'ooh', dr:'soft'},
      A:{ch:['Bm','G','D','A'], mel:
        'F#5 - - - D5 - B4 - - - C#5 - D5 - - - '+
        'B4 - - - G4 - - - D5 - - - B4 - - - '+
        'A4 - - - F#4 - A4 - D5 - - - F#5 - - - '+
        'E5 - - - - - C#5 - A4 - - - - - - -'},
      B:{ch:['Em','G','D','F#'], gen:{r:'x---x---x-x-x---', oct:5, seed:161}, choir:'aah', vox:true, counter:true}
    },
    form:['I','A','A','B','A','B']
  },

  dino:{
    title:'Jurassic Drums', bpm:120,
    lead:'sawtooth', leadVol:.19, leadCut:2400, fat:true, harmony:'octDown',
    bass:'R . R . R 5 R . R . R . 5 . O .', bassWave:'sawtooth', bassVol:.26, bassLen:1, bassCut:650,
    echo:.1, groove:'march',
    sections:{
      A:{ch:['Am','G','F','E'], mel:
        'A4 - A4 C5 - A4 E5 - D5 - C5 - B4 - A4 - '+
        'G4 - G4 B4 - G4 D5 - C5 - B4 - A4 - G4 - '+
        'F4 - F4 A4 - C5 F5 - E5 - D5 - C5 - A4 - '+
        'E4 - G#4 - B4 - E5 - - - D5 - B4 - G#4 -'},
      B:{ch:['F','G','Am','Am'], gen:{r:'x-x-x---x-x-xxx-', oct:5, seed:171}, choir:'aah', counter:true, dr:'battle'},
      C:{ch:['Dm','Am','E','E'], gen:{r:'x---x---x---x---', oct:4, seed:172}, choir:'ooh', vox:true, dr:'half'}
    },
    form:['A','A','B','C','B','A']
  },

  sky:{
    title:'Above the Clouds', bpm:108,
    lead:'triangle', leadVol:.27, harmony:'octUp',
    bass:'R . . R . . R . R . . R . . 5 .', bassWave:'triangle', bassVol:.3,
    pad:'sawtooth', padVol:.045, padCut:1800, echo:.3, groove:'rock',
    sections:{
      I:{ch:['C','G','Am','F'], dr:'soft', arp:true, choir:'aah'},
      A:{ch:['C','G','Am','F'], mel:
        'E5 - - G5 - - C6 - - - B5 - G5 - - - '+
        'D5 - - G5 - - B5 - - - A5 - G5 - - - '+
        'C5 - - E5 - - A5 - - - G5 - E5 - - - '+
        'F5 - - - E5 - - - D5 - - - C5 - - -'},
      B:{ch:['F','G','Em','Am'], gen:{r:'x-x-x-x-x---x-x-', oct:5, seed:181}, choir:'aah', vox:true, counter:true},
      C:{ch:['Dm','G','C','C'], gen:{r:'x-------x-------', oct:5, seed:182}, choir:'ooh', dr:'half'}
    },
    form:['I','A','A','B','C','B','A']
  },

  boss_ocean: bossDef({title:'The Leviathan Queen', bpm:132, seed:190, lead:'triangle', fat:false, groove:'half', echo:.3, choir:'ooh', ch:['Dm','Bb','Gm','A']}),
  boss_candy: bossDef({title:'The Sour Tyrant', bpm:150, seed:200, lead:'square', groove:'techno', ch:['Fm','Db','Eb','C']}),
  boss_frost: bossDef({title:'The Glacier Titan', bpm:140, seed:210, choir:'aah', ch:['Bm','G','Em','F#']}),
  boss_dino:  bossDef({title:'Rex Imperator', bpm:156, seed:220, groove:'blast', ch:['Am','F','G','E']}),
  boss_sky:   bossDef({title:'The Storm Seraph', bpm:160, seed:230, choir:'aah', ch:['Cm','Ab','Bb','G']}),

  boss_earth: bossDef({title:'The Ruin Guardian', bpm:150, seed:70,
    ch:['Dm','Bb','C','A'], ch2:['Bb','C','Dm','A'], mel:
    'D5 - D5 - F5 - D5 - A5 - - - G5 - F5 - '+
    'F5 - F5 - E5 - D5 - Bb4 - - - C5 - D5 - '+
    'E5 - E5 - G5 - E5 - C5 - - - D5 - E5 - '+
    'C#5 - E5 - A5 - - - A4 - C#5 - E5 - - -'}),
  boss_music:  bossDef({title:'The Silence King', bpm:150, seed:80, lead:'square', groove:'techno', ch:['Am','F','G','E']}),
  boss_money:  bossDef({title:'The Greed Golem', bpm:144, seed:90, lead:'square', ch:['Cm','Ab','Bb','G']}),
  boss_cosmos: bossDef({title:'The Gravity Maw', bpm:136, seed:100, lead:'triangle', fat:false, groove:'half', echo:.35, choir:'ooh', ch:['Fm','Db','Eb','C']}),
  boss_war:    bossDef({title:'The War Machine', bpm:160, seed:110, groove:'blast', ch:['Em','C','D','B']}),
  boss_void:   bossDef({title:'The Abyss Warden', bpm:120, seed:120, lead:'sine', fat:false, groove:'half', echo:.4, choir:'ooh', ch:['Cm','Ab','Fm','G']}),
  boss_matrix: bossDef({title:'The Perfect Error', bpm:156, seed:130, lead:'square', glitch:true, groove:'techno', ch:['Gm','Eb','Bb','F']})
};

function compileSong(key, def){
  const s = {...def, key, secs:{}, timeline:[]};
  s.bassT = def.bass.trim().split(/\s+/);

  for(const [k,sec] of Object.entries(def.sections)){
    const chords = sec.ch.map(chordMidi);
    const mel = sec.mel ? parseMel(sec.mel, chords.length)
              : sec.gen ? genMel(chords, sec.gen)
              : new Array(chords.length*16).fill(null);
    s.secs[k] = {...sec, chords, mel, bars:chords.length};
  }

  for(const k of def.form){
    const sec = s.secs[k];
    for(let b=0;b<sec.bars;b++){
      s.timeline.push({sec, b, first:b===0, last:b===sec.bars-1});
    }
  }
  return s;
}

const SONGS = {};
for(const [k,d] of Object.entries(SONG_DEFS)) SONGS[k] = compileSong(k,d);


/* ---------- one-shot jingles ---------- */

const STINGERS = {
  victory:    {bpm:150, wave:'square',   vol:.2,  fat:true, notes:'C5 E5 G5 C6 E6 G6 C7 - - - - - - - - -', chord:'C',  at:6, len:12, choir:'aah'},
  fail:       {bpm:96,  wave:'triangle', vol:.26, notes:'G4 - F#4 - F4 - E4 - - - - - - - - -', chord:'Cm', chordOct:0, at:6, len:10, choir:'ooh'},
  levelup:    {bpm:180, wave:'square',   vol:.18, notes:'G5 B5 D6 G6 - - B6 - - -', chord:'G', at:4, len:8},
  secret:     {bpm:160, wave:'sine',     vol:.24, notes:'E6 G6 B6 E7 - - B6 - E7 - - -'},
  pet:        {bpm:170, wave:'sine',     vol:.22, notes:'C6 E6 G6 C7 - - -', chord:'C', at:3, len:6, choir:'ooh'},
  achievement:{bpm:160, wave:'square',   vol:.18, fat:true, notes:'D5 F#5 A5 D6 - - A5 - D6 - - - - - - -', chord:'D', at:6, len:10, choir:'aah'}
};

for(const st of Object.values(STINGERS)) st.mel = parseMel(st.notes, 0);


/* ---------- choir vowels (formant frequencies) ---------- */

const VOWELS = {
  aah:[[800,1],[1150,.5],[2900,.25]],
  ooh:[[325,1],[700,.35],[2530,.1]],
  eeh:[[270,1],[2300,.45],[3000,.25]]
};

const VOX_CYCLE = ['aah','ooh','aah','eeh'];

const isVisible = id => {
  const el = document.getElementById(id);
  return !!el && !el.classList.contains('hidden');
};


/* =========================================================
   4. MUSIC ENGINE (replaces the MUSIC object's methods)
   ========================================================= */

const ENGINE = {

  volume:CFG.musicVolume,
  forced:null,
  current:null,
  song:null,
  step:0,
  nextTime:0,
  _ready:false,

  init(){
    SFX.resume();
    if(!SFX.ctx || this._ready) return;
    this._ready = true;

    const c = this.ctx = SFX.ctx;

    if(this.master){ try{ this.master.disconnect(); }catch{} }

    // voices -> bus -> duck -> muffle -> master -> compressor -> makeup -> limiter -> speakers
    this.bus = c.createGain();
    this.drumBus = c.createGain();
    this.drumBus.connect(this.bus);

    this.duck = c.createGain();
    this.muffle = c.createBiquadFilter();
    this.muffle.type = 'lowpass';
    this.muffle.frequency.value = 20000;

    this.master = c.createGain();
    this.master.gain.value = this.muted ? 0 : this.volume;

    this.stingBus = c.createGain();
    this.stingBus.connect(this.master);

    this.comp = c.createDynamicsCompressor();
    this.comp.threshold.value = -20;
    this.comp.knee.value = 8;
    this.comp.ratio.value = 4;
    this.comp.attack.value = .01;
    this.comp.release.value = .25;

    const makeup = c.createGain();
    makeup.gain.value = 1.5;

    this.limiter = c.createDynamicsCompressor();
    this.limiter.threshold.value = -2;
    this.limiter.knee.value = 0;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = .002;
    this.limiter.release.value = .1;

    this.bus.connect(this.duck);
    this.duck.connect(this.muffle);
    this.muffle.connect(this.master);
    this.master.connect(this.comp);
    this.comp.connect(makeup);
    makeup.connect(this.limiter);
    this.limiter.connect(c.destination);

    // echo
    this.echoIn = c.createGain();
    const delay = c.createDelay(1.5), fb = c.createGain(), tone = c.createBiquadFilter();
    delay.delayTime.value = .32;
    fb.gain.value = .38;
    tone.type = 'lowpass';
    tone.frequency.value = 2600;
    this.echoIn.connect(delay);
    delay.connect(tone);
    tone.connect(fb);
    fb.connect(delay);
    tone.connect(this.bus);

    // 2 seconds of noise for drums
    const len = c.sampleRate*2;
    this.noiseBuf = c.createBuffer(1,len,c.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for(let i=0;i<len;i++) d[i] = Math.random()*2-1;

    // louder sound effects through the same limiter
    if(SFX.master){
      try{ SFX.master.disconnect(); }catch{}
      SFX.master.connect(this.limiter);
      SFX.master.gain.value = SFX.muted ? 0 : CFG.sfxVolume;
    }
  },

  start(){
    this.init();
    if(!this.ctx) return;
    SFX.resume();
    this.applySong();
    if(this.started) return;
    this.started = true;
    this.nextTime = this.ctx.currentTime + .08;
    this.timer = setInterval(() => this.tick(), 25);
  },

  songKey(){
    if(this.forced && isVisible('recordsOverlay')) return this.forced;
    const sc = G.scene;
    if(sc==='menu' || sc==='flight' || sc==='crash') return 'menu';
    if(sc==='travel') return 'travel';
    if(isVisible('petsOverlay')) return 'sanctuary';
    if(sc==='arena') return 'arena';
    if(sc==='hub') return 'hub';
    if(this.boss){
      const k = 'boss_'+this.world;
      return SONGS[k] ? k : 'boss_war';
    }
    return SONGS[this.world] ? this.world : 'menu';
  },

  applySong(){
    const key = this.songKey();
    if(key === this.current && this.song) return;
    this.current = key;
    this.song = SONGS[key];
    this.bpm = this.song.bpm;
    this.step = 0;
    if(this.ctx) this.nextTime = Math.max(this.nextTime || 0, this.ctx.currentTime + .05);
  },

  setWorld(w){
    this.world = w;
    if(this.started) this.applySong();
  },

  tick(){
    if(!this.ctx) return;
    this.applySong();
    if(!this.song) return;

    const now = this.ctx.currentTime;

    const muff = ['pauseOverlay','inventoryOverlay','mapOverlay'].some(isVisible);
    const target = muff ? 900 : 20000;
    if(target !== this._muffT){
      this._muffT = target;
      this.muffle.frequency.setTargetAtTime(target, now, .12);
    }

    if(this.nextTime < now - .05) this.nextTime = now + .03;

    while(this.nextTime < now + .12){
      this.playStep(this.step, this.nextTime);
      this.step++;
      this.nextTime += 60/this.song.bpm/4;
    }
  },

  /* ---------- instruments ---------- */

  route(node, o){
    let out = node;
    if(o.pan && this.ctx.createStereoPanner){
      const p = this.ctx.createStereoPanner();
      p.pan.value = o.pan;
      node.connect(p);
      out = p;
    }
    out.connect(o.dest || this.bus);
    if(o.send){
      const s = this.ctx.createGain();
      s.gain.value = o.send;
      out.connect(s);
      s.connect(this.echoIn);
    }
  },

  voice(freq,t,dur,type,vol,o={}){
    if(!freq || !this.ctx) return;
    const c = this.ctx, g = c.createGain(), f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.cutoff || 5000;
    f.Q.value = o.q || .7;

    const atk = o.attack || .008, rel = o.release || .08;
    const hold = Math.max(atk+.002, dur*.55), end = t+dur+rel;
    const dets = o.fat ? [-9,9] : [0];
    const v = o.fat ? vol*.62 : vol;

    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(v,t+atk);
    g.gain.setValueAtTime(v,t+hold);
    g.gain.exponentialRampToValueAtTime(.0001,end);

    for(const d of dets){
      const osc = c.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq,t);
      osc.detune.value = d;
      osc.connect(f);
      osc.start(t);
      osc.stop(end+.05);
    }
    f.connect(g);
    this.route(g,o);
  },

  // synthesized singing voice
  sing(freq,t,dur,vol,vowel='aah',o={}){
    if(!freq || !this.ctx) return;
    const c = this.ctx, F = VOWELS[vowel] || VOWELS.aah;
    const atk = o.attack ?? .15, end = t+dur+(o.release ?? .35);

    const env = c.createGain();
    env.gain.setValueAtTime(.0001,t);
    env.gain.exponentialRampToValueAtTime(vol,t+atk);
    env.gain.setValueAtTime(vol,Math.max(t+atk+.01,t+dur*.8));
    env.gain.exponentialRampToValueAtTime(.0001,end);

    const lfo = c.createOscillator(), lg = c.createGain();
    lfo.frequency.value = 5 + Math.random()*.8;
    lg.gain.value = freq*.007;
    lfo.connect(lg);
    lfo.start(t);
    lfo.stop(end+.05);

    const mix = c.createGain();
    for(const d of [-7,7]){
      const osc = c.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq,t);
      osc.detune.value = d;
      lg.connect(osc.frequency);
      osc.connect(mix);
      osc.start(t);
      osc.stop(end+.05);
    }

    for(const [ff,gw] of F){
      const bp = c.createBiquadFilter(), g = c.createGain();
      bp.type = 'bandpass';
      bp.frequency.value = ff;
      bp.Q.value = 7;
      g.gain.value = gw*3.2;
      mix.connect(bp);
      bp.connect(g);
      g.connect(env);
    }
    this.route(env,o);
  },

  noiseHit(t,dur,vol,type,freq,offset=Math.random()*.5){
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noiseBuf;
    f.type = type;
    f.frequency.value = freq;
    g.gain.setValueAtTime(vol,t);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(f); f.connect(g); g.connect(this.drumBus);
    s.start(t,offset);
    s.stop(t+dur+.02);
  },

  kick(t,p=1){
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(155,t);
    o.frequency.exponentialRampToValueAtTime(42,t+.12);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(.95*p,t+.004);
    g.gain.exponentialRampToValueAtTime(.0001,t+.3);
    o.connect(g); g.connect(this.drumBus);
    o.start(t); o.stop(t+.32);
  },

  snare(t,p=1){
    this.noiseHit(t,.16,.5*p,'bandpass',1900);
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(200,t);
    o.frequency.exponentialRampToValueAtTime(120,t+.08);
    g.gain.setValueAtTime(.35*p,t);
    g.gain.exponentialRampToValueAtTime(.0001,t+.1);
    o.connect(g); g.connect(this.drumBus);
    o.start(t); o.stop(t+.12);
  },

  hat(t,open=false){
    this.noiseHit(t, open?.16:.04, open?.16:.13, 'highpass', 7200);
  },

  crash(t){
    this.noiseHit(t,1.1,.2,'highpass',5200,0);
  },

  tom(t){
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(130,t);
    o.frequency.exponentialRampToValueAtTime(70,t+.18);
    g.gain.setValueAtTime(.6,t);
    g.gain.exponentialRampToValueAtTime(.0001,t+.22);
    o.connect(g); g.connect(this.drumBus);
    o.start(t); o.stop(t+.25);
  },

  /* ---------- sequencer ---------- */

  playStep(step,t){
    const s = this.song, sd = 60/s.bpm/4, pos = step%16;
    const bar = s.timeline[Math.floor(step/16) % s.timeline.length];
    const sec = bar.sec, chord = sec.chords[bar.b];
    const mi = bar.b*16 + pos;

    // pad
    if(pos===0 && s.pad){
      for(const m of chord){
        this.voice(mtof(m+12), t, sd*16, s.pad, s.padVol || .05,
          {attack:.25, release:.4, cutoff:s.padCut || 1800});
      }
    }

    // choir chord
    if(pos===0 && sec.choir){
      chord.forEach((m,i) => this.sing(mtof(m+12), t, sd*16, s.choirVol || .07, sec.choir,
        {pan:[-.45,0,.45,.2][i] || 0, send:.25}));
    }

    // counter-melody
    if(sec.counter && (pos===0 || pos===8)){
      this.voice(mtof(chord[1]+24), t, sd*7.5, 'triangle', .07,
        {pan:-.3, attack:.05, send:s.echo || 0});
    }

    // bass
    const bt = s.bassT[pos % s.bassT.length];
    if(bt !== '.'){
      const m = bt==='5' ? chord[0]-5 : bt==='O' ? chord[0] : chord[0]-12;
      this.voice(mtof(m), t, sd*(s.bassLen || 1.8), s.bassWave || 'sawtooth', s.bassVol || .24,
        {cutoff:s.bassCut || 700});
    }

    // melody
    const n = sec.mel[mi];
    if(n){
      let f = mtof(n.m);
      if(s.glitch && Math.random() < .12) f *= Math.random() < .5 ? 1.059 : .944;
      const len = sd*n.len*(s.legato || .92);

      this.voice(f, t, len, s.lead, s.leadVol || .22,
        {cutoff:s.leadCut || 4500, fat:s.fat, send:s.echo || 0});

      if(s.harmony==='octDown') this.voice(f/2, t, len, 'sine', (s.leadVol || .22)*.5);
      if(s.harmony==='octUp') this.voice(f*2, t, len*.7, 'sine', (s.leadVol || .22)*.3, {send:s.echo || 0});

      if(sec.vox){
        this.sing(f, t, Math.max(len, sd*1.5), s.voxVol || .17, VOX_CYCLE[(mi>>1)%4],
          {attack:.06, release:.2, send:s.echo || .2});
      }

      if(s.glitch && Math.random() < .08) this.voice(f*2, t+sd*.5, sd*.4, 'square', .08);
    }

    // arpeggio
    if(sec.arp ?? s.arp){
      this.voice(mtof(chord[pos % chord.length]+24), t, sd*.9, s.arpWave || 'square', s.arpVol || .05,
        {cutoff:2600, pan:pos%2 ? .35 : -.35, send:(s.echo || 0)*.6});
    }

    // drums
    let gname = sec.dr === undefined ? s.groove : sec.dr;
    if(gname && s.grooveOverride) gname = s.grooveOverride;
    const g = GROOVES[gname];

    if(g){
      if(bar.first && pos===0 && g.s) this.crash(t);

      let k = g.k?.[pos], sn = g.s?.[pos], h = g.h?.[pos], tt = g.t?.[pos];

      // drum fill at the end of each section
      if(bar.last && g.s && pos >= 12){
        sn = pos%2 ? 'x' : 'X';
        tt = pos >= 14 ? 't' : tt;
        h = null;
      }

      if(k==='x' || k==='X') this.kick(t, k==='X' ? 1.15 : .9);
      if(sn==='x' || sn==='X') this.snare(t, sn==='X' ? 1.1 : .8);
      if(h==='x') this.hat(t,false);
      if(h==='o') this.hat(t,true);
      if(tt==='t') this.tom(t);
    }
  },

  /* ---------- jingles ---------- */

  stinger(name){
    this.start();
    if(!this.ctx) return;
    const st = STINGERS[name];
    if(!st) return;

    const c = this.ctx, t0 = c.currentTime+.03, sd = 60/st.bpm/4;
    let total = 0;

    st.mel.forEach((n,i) => {
      if(!n) return;
      this.voice(mtof(n.m), t0+i*sd, sd*n.len*.95, st.wave, st.vol,
        {dest:this.stingBus, fat:st.fat});
      total = Math.max(total, (i+n.len)*sd);
    });

    if(st.chord){
      const at = t0+(st.at || 0)*sd, len = (st.len || 8)*sd;
      chordMidi(st.chord).forEach((m,i) => {
        const mm = m + (st.chordOct ?? 12);
        this.voice(mtof(mm), at, len, 'triangle', .08, {dest:this.stingBus, attack:.02, release:.4});
        if(st.choir) this.sing(mtof(mm+12), at, len, .08, st.choir, {dest:this.stingBus, pan:[-.4,0,.4][i] || 0});
      });
      total = Math.max(total, (st.at || 0)*sd+len);
    }

    const d = this.duck.gain, now = c.currentTime;
    d.cancelScheduledValues(now);
    d.setValueAtTime(d.value, now);
    d.linearRampToValueAtTime(.3, now+.05);
    d.setValueAtTime(.3, t0+total);
    d.linearRampToValueAtTime(1, t0+total+.6);
  },

  /* ---------- hooks the game already calls ---------- */

  startBoss(){
    if(this.boss) return;
    this.boss = true;
    if(this.started) this.applySong();
    SFX.boss();
  },

  endBoss(){
    this.boss = false;
    if(this.started) this.applySong();
  },

  toggle(){
    this.muted = !this.muted;
    if(this.master) this.master.gain.value = this.muted ? 0 : this.volume;
  }
};

// Stop the old music loop (if any) and install the new engine.
if(MUSIC.timer){ clearTimeout(MUSIC.timer); clearInterval(MUSIC.timer); }
MUSIC.started = false;
Object.assign(MUSIC, ENGINE);

SFX.toggle = function(){
  this.muted = !this.muted;
  if(this.master) this.master.gain.value = this.muted ? 0 : CFG.sfxVolume;
};

function unlockAudio(){
  MUSIC.start();
  window.removeEventListener('pointerdown', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
}
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);


/* =========================================================
   4b. NEW WORLDS — data, pets, armor, materials
   ========================================================= */

const NEW_WORLDS = {
  ocean:{
    name:'Ocean Depths', width:5400,
    skyA:'#0b3c6e', skyB:'#1f8fb0', ground:'#c9ae74', dark:'#082440',
    boss:'Leviathan Queen', mechanic:'Oxygen', accent:'#5ff0e0',
    desc:'Dive through sunken reefs. Grab air bubbles before your oxygen runs out.',
    material:'Pearl Shell',
    enemies:['Puffer Brute','Crab Knight','Jelly Wraith'],
    intro:'Your oxygen drains underwater. Swim through air bubbles to refill it.'
  },
  candy:{
    name:'Candy Kingdom', width:5400,
    skyA:'#ffb3d9', skyB:'#c7a3ff', ground:'#8ee0c2', dark:'#5a2a4f',
    boss:'Sour Tyrant', mechanic:'Sugar Rush', accent:'#ff6fb5',
    desc:'Free a sweet kingdom from the Sour Tyrant. Candy powers you up.',
    material:'Sugar Crystal',
    enemies:['Gumdrop Blob','Candy Cane Guard','Cookie Golem'],
    intro:'Collect candy to fill the Sugar Rush meter. When it is full you get much faster.'
  },
  frost:{
    name:'Frost Peaks', width:5400,
    skyA:'#9fd3f5', skyB:'#e8f6ff', ground:'#dfeaf5', dark:'#20395a',
    boss:'Glacier Titan', mechanic:'Freezing Cold', accent:'#8fe3ff',
    desc:'Climb frozen mountains under the aurora. Stay near campfires to keep warm.',
    material:'Frost Shard',
    enemies:['Snow Wolf','Ice Golem','Frost Wisp'],
    intro:'The cold builds up and slows you down. Stand near a campfire to warm up.'
  },
  dino:{
    name:'Dino Jungle', width:5400,
    skyA:'#f6b36b', skyB:'#bfe0a0', ground:'#6d8a3e', dark:'#2d3a1c',
    boss:'Rex Imperator', mechanic:'Stampede', accent:'#ff9a3c',
    desc:'A prehistoric jungle where stampedes thunder through the trees.',
    material:'Amber Fossil',
    enemies:['Raptor','Horn Charger','Frill Spitter'],
    intro:'Watch for the STAMPEDE warning. Jump or leave the red lane before the herd arrives.'
  },
  sky:{
    name:'Sky Citadel', width:5400,
    skyA:'#5fb4ff', skyB:'#ffe6a8', ground:'#e6ecf6', dark:'#2b3f66',
    boss:'Storm Seraph', mechanic:'Storm Winds', accent:'#ffd66b',
    desc:'A floating fortress above the clouds, battered by wind and lightning.',
    material:'Storm Feather',
    enemies:['Harpy','Cloud Golem','Storm Sprite'],
    intro:'Wind gusts push you around. Leave the glowing circles before lightning strikes.'
  }
};

// [name, type, [hp, atk, def, speed]]
const NEW_PETS = {
  ocean:[['Bubble Pup','Water',[60,15,8,15]],['Coral Cat','Water / Nature',[50,22,6,30]],
         ['Pearl Bunny','Water / Light',[90,5,10,35]],['Tide Serpent','Water',[70,30,10,10]],
         ['Reef Squid','Water / Void',[80,26,12,5]],['Kelp Fox','Nature / Water',[40,28,6,28]],
         ['Sea Finch','Water / Light',[30,18,4,40]],['Trench Wolf','Water / Dark',[160,44,24,15]]],
  candy:[['Gummy Bunny','Sweet',[70,8,10,35]],['Sprinkle Cat','Sweet / Light',[50,26,6,32]],
         ['Toffee Pup','Sweet / Earth',[110,20,18,5]],['Candy Bee','Sweet / Nature',[30,24,4,38]],
         ['Licorice Serpent','Sweet / Dark',[80,34,10,10]],['Jelly Squid','Sweet / Water',[120,18,20,0]],
         ['Cocoa Fox','Sweet',[60,30,8,25]],['Sugar Butterfly','Sweet / Light',[170,40,26,30]]],
  frost:[['Snow Hare','Ice',[60,12,10,40]],['Frost Fox','Ice',[60,32,8,28]],
         ['Ice Wolf','Ice / Earth',[100,36,14,15]],['Blizzard Hawk','Ice / Wind',[40,30,6,40]],
         ['Glacier Boar','Ice / Earth',[200,24,36,-10]],['Aurora Moth','Ice / Light',[60,20,10,30]],
         ['Crystal Lion','Ice / Light',[150,42,24,10]],['Yeti Pup','Ice',[220,48,34,5]]],
  dino: [['Raptor Pup','Primal',[70,34,8,30]],['Ptero Hawk','Primal / Wind',[40,30,6,42]],
         ['Amber Bee','Primal / Light',[50,24,10,34]],['Fern Fawn','Nature',[150,10,20,15]],
         ['Tricera Boar','Primal / Earth',[220,30,38,-10]],['Jungle Cat','Primal / Nature',[70,38,8,32]],
         ['Vine Serpent','Nature',[90,34,14,10]],['Sabre Lion','Primal / Fire',[200,56,30,15]]],
  sky:  [['Cloud Bunny','Wind / Light',[90,14,14,42]],['Storm Eagle','Wind / Storm',[60,44,10,36]],
         ['Zephyr Fox','Wind',[70,36,10,40]],['Thunder Wolf','Storm',[130,46,16,20]],
         ['Sun Finch','Light / Wind',[50,30,8,45]],['Halo Moth','Light',[120,24,20,30]],
         ['Gale Hound','Wind / Earth',[140,38,24,25]],['Seraph Lion','Light / Storm',[260,64,40,35]]]
};

const NEW_ARMORS = {
  ocean:{name:'Abyssal Diver Armor', hp:180, atk:22, def:36, speed:10,  price:16000},
  candy:{name:'Sugarcoat Armor',     hp:160, atk:30, def:28, speed:40,  price:19000},
  frost:{name:'Glacier Plate',       hp:260, atk:18, def:55, speed:-15, price:22000},
  dino: {name:'Raptor Hide Armor',   hp:200, atk:45, def:36, speed:30,  price:26000},
  sky:  {name:'Seraph Mail',         hp:260, atk:55, def:48, speed:45,  price:32000}
};

for(const [id,w] of Object.entries(NEW_WORLDS)){
  if(!WORLDS[id]) WORLDS[id] = w;
  if(!WORLD_ORDER.includes(id)) WORLD_ORDER.push(id);
  PET_ROSTERS[id] = NEW_PETS[id].map(p => p[0]);
  for(const [name,type,[hp,atk,def,speed]] of NEW_PETS[id]){
    PET_TYPES[name] = type;
    PET_BONUS[name] = {hp, atk, def, speed};
  }
  if(!ARMORS[id]) ARMORS[id] = {...NEW_ARMORS[id], unlocked:false};
  if(!MATERIALS.includes(w.material)) MATERIALS.push(w.material);
}

function ensureProgress(){
  for(const id of WORLD_ORDER){
    if(!G.progress[id]){
      G.progress[id] = {fragments:0, bossDefeated:false, petFound:[], beacons:0, storyStage:0, shipParts:0};
    }
  }
}
ensureProgress();

const totalPets = () => WORLD_ORDER.reduce((n,id) => n + (PET_ROSTERS[id] || []).length, 0);

{
  const st = document.querySelector('.menuStatus span:nth-child(2)');
  if(st) st.textContent = WORLD_ORDER.length+' WORLDS DETECTED';
}


/* =========================================================
   5. EXPANSION STATE + SAVE DATA
   ========================================================= */

function freshData(){
  return {
    kills:0, crits:0, bossKills:0, creditsEarned:0, bestWave:0,
    bounties:0, dodges:0, parries:0, playTime:0,
    rushes:0, stampedes:0, role:'astronaut', crew:[], crewIntro:false,
    houses:[], builtWhileAway:[], fusions:0, lastFused:null,
    weapons:['nova'], weaponKey:'nova',
    ach:[], bounty:null, tipDodge:false
  };
}

const X = {
  data:freshData(),
  proj:[],
  waves:[],
  orbs:[],
  toasts:[],
  bolts:[],
  mech:null
};

const T = {wave:0, toSpawn:0, spawnCd:0, inter:0, cleared:true, total:1};

function saveExt(){
  try{ localStorage.setItem(CFG.saveKey, JSON.stringify(X.data)); }catch{}
}

function loadExt(){
  try{
    const raw = localStorage.getItem(CFG.saveKey);
    X.data = raw ? {...freshData(), ...JSON.parse(raw)} : freshData();
  }catch{
    X.data = freshData();
  }
  // saves from before crew rescues: keep whatever role was already in use
  if(!Array.isArray(X.data.crew)) X.data.crew = [];
  if(!Array.isArray(X.data.houses)) X.data.houses = [];
  if(!Array.isArray(X.data.builtWhileAway)) X.data.builtWhileAway = [];
  if(X.data.role && X.data.role!=='astronaut' && !X.data.crew.includes(X.data.role)){
    X.data.crew.push(X.data.role);
  }
}

function clearCombat(){
  X.proj.length = 0;
  X.waves.length = 0;
  X.orbs.length = 0;
}

function extToast(title,text,time=3){
  X.toasts.push([title,text,time]);
}


/* =========================================================
   6. WEAPONS
   ========================================================= */

const WEAPONS = {
  nova:  {name:'Nova Sword',     atk:20, cd:1,    range:1,    crit:0,   color:'#9d68ff', price:0,     unlock:null,
          desc:'Balanced Rift blade found on Earth 2.0.'},
  pulse: {name:'Pulse Blade',    atk:14, cd:.68,  range:.95,  crit:.05, color:'#6cecff', price:1800,  unlock:'music',
          desc:'Very fast strikes that ride the beat.'},
  rapier:{name:'Fortune Rapier', atk:22, cd:.85,  range:1.05, crit:.10, color:'#f2d36d', price:3000,  unlock:'money',
          desc:'+50% Rift Credits from defeated enemies.', bonusCredits:.5},
  lance: {name:'Comet Lance',    atk:28, cd:1,    range:1.45, crit:.04, color:'#92b8ff', price:4200,  unlock:'cosmos',
          desc:'Huge reach. Hits whole lines of enemies.'},
  hammer:{name:'Titan Hammer',   atk:52, cd:1.55, range:1.1,  crit:0,   critDmg:.4, color:'#ff8c61', price:5200, unlock:'war',
          desc:'Slow and crushing. Every 3rd swing sends a shockwave.', shock:true},
  scythe:{name:'Void Scythe',    atk:36, cd:1.1,  range:1.35, crit:.08, color:'#a478ff', price:7600,  unlock:'void',
          desc:'Very wide arc. Heals 3% HP on every kill.', lifesteal:.03},
  katana:{name:'Glitch Katana',  atk:42, cd:.78,  range:1.1,  crit:.18, critDmg:.5, color:'#5af3ef', price:12000, unlock:'matrix',
          desc:'The highest critical rate in the Multiverse.'},
  trident:{name:'Tidal Trident', atk:44, cd:1,    range:1.5,  crit:.06, color:'#5ff0e0', price:15000, unlock:'ocean',
          desc:'Long reach. Every hit pushes enemies back like a wave.', knock:70},
  cane:  {name:'Candy Cane Blade', atk:40, cd:.72, range:1.05, crit:.12, color:'#ff6fb5', price:18000, unlock:'candy',
          desc:'Fast and sweet. Critical hits heal 2% HP.', critHeal:.02},
  axe:   {name:'Frostbite Axe',  atk:58, cd:1.3,  range:1.15, crit:.08, color:'#8fe3ff', price:21000, unlock:'frost',
          desc:'Hits freeze enemies and delay their attacks.', freeze:1.2},
  club:  {name:'Fossil Fang Club', atk:66, cd:1.4, range:1.2, crit:.05, critDmg:.6, color:'#ff9a3c', price:24000, unlock:'dino',
          desc:'Huge knockback. Critical hits crush for extra damage.', knock:130},
  glaive:{name:'Storm Glaive',   atk:60, cd:.85,  range:1.4,  crit:.15, critDmg:.4, color:'#ffd66b', price:30000, unlock:'sky',
          desc:'Critical hits call lightning onto nearby enemies.', chain:.5},

  // ---- special weapons (unlocked by progress, not by clearing worlds) ----
  blaster:{name:'Rift Blaster',  atk:30, cd:.55, range:1, crit:.05, color:'#72e6ff', price:2500, style:'RANGED',
          desc:'Fires energy bolts across the screen.', ranged:'bolt',
          req:() => X.data.bestWave >= 5, reqText:'Reach wave 5 in the Rift Trials'},
  daggers:{name:'Twin Daggers',  atk:16, cd:.45, range:.85, crit:.12, color:'#c8d0e0', price:3000, style:'MELEE',
          desc:'Very fast. Every hit strikes twice.', twin:true,
          req:() => X.data.crew.length >= 3, reqText:'Rescue 3 crew members'},
  boomerang:{name:'Rift Boomerang', atk:34, cd:.9, range:1, crit:.06, color:'#ffb65d', price:4000, style:'THROWN',
          desc:'Thrown out and back. Hits enemies both ways.', ranged:'boomerang',
          req:() => P.level >= 10, reqText:'Reach level 10'},
  bow:   {name:'Star Bow',       atk:36, cd:.8,  range:1, crit:.12, color:'#b8c8ff', price:5000, style:'RANGED',
          desc:'Starlight arrows pierce through 3 enemies. A gift from Orion.', ranged:'arrow',
          req:() => X.data.crew.includes('mage'), reqText:'Rescue Orion in The Cosmos'},
  whip:  {name:'Chain Whip',     atk:28, cd:.9,  range:1.8, crit:.05, color:'#9aa6b8', price:6000, style:'MELEE',
          desc:'Extreme reach. Yanks enemies toward you.', pull:true,
          req:() => X.data.crew.length >= 5, reqText:'Rescue 5 crew members'},
  gauntlets:{name:'Flame Gauntlets', atk:30, cd:.55, range:.8, crit:.08, color:'#ff7a2a', price:8000, style:'MELEE',
          desc:'Rapid punches that set enemies on fire.', burn:.25,
          req:() => X.data.bestWave >= 10, reqText:'Reach wave 10 in the Rift Trials'},
  fusionBlade:{name:'Fusion Blade', atk:48, cd:.75, range:1.1, crit:.1, color:'#ff6fd8', price:10000, style:'MELEE',
          desc:'Grows stronger with your pet: adds your active pet\'s POWER to your attack.', petScale:1,
          req:() => X.data.fusions >= 3, reqText:'Perform 3 pet fusions'},
  aegis: {name:'Guardian Aegis', atk:35, cd:.9,  range:1, crit:.04, color:'#ffcf6a', price:11000, style:'MELEE',
          desc:'Sword and shield. Always -15% damage taken, -50% while swinging. A gift from Brick.', block:true,
          req:() => X.data.crew.includes('guardian'), reqText:'Rescue Brick in The War Zone'},
  gravity:{name:'Gravity Hammer', atk:70, cd:1.5, range:1.15, crit:.03, critDmg:.5, color:'#a478ff', price:16000, style:'MELEE',
          desc:'Every 3rd swing pulls nearby enemies in and sends out a shockwave.', gravity:true, shock:true,
          req:() => X.data.bestWave >= 15, reqText:'Reach wave 15 in the Rift Trials'},
  pixel: {name:'Pixel Sword',    atk:50, cd:.7,  range:1.1, crit:.25, color:'#6cff8a', price:18000, style:'MELEE',
          desc:'A legendary blade from a game that never existed. Very high crit rate.', pixel:true,
          req:() => G.easterEggs.size >= 16, reqText:'Find 16 hidden secrets'},
  cannon:{name:'Rift Cannon',    atk:58, cd:1.3, range:1, crit:.05, critDmg:.3, color:'#ff5a6a', price:25000, style:'RANGED',
          desc:'Fires explosive shells that damage every enemy in the blast.', ranged:'shell',
          req:() => X.data.crew.length >= 10, reqText:'Rescue the whole crew'},
  edge:  {name:'Multiverse Edge', atk:95, cd:.7, range:1.4, crit:.2, critDmg:.5, color:'#ffffff', price:40000, style:'LEGENDARY',
          desc:'Forged from every world. Combo finishers unleash a rift wave.', shock:true, rainbow:true,
          req:() => WORLD_ORDER.every(id => G.completed.has(id)), reqText:'Clear all 12 worlds'}
};

for(const [k,w] of Object.entries(WEAPONS)) w.key = k;

function curWeapon(){
  return WEAPONS[X.data.weaponKey] || WEAPONS.nova;
}

function restoreWeaponName(){
  if(P.weapon) P.weapon = curWeapon().name;
}

function upgradeCost(){
  return 400 + P.weaponLevel*350;
}


/* =========================================================
   7. XP + LEVELS
   ========================================================= */

const MAX_LEVEL = 60;

function xpNeed(l){
  return Math.round(90 + l*l*5 + l*35);
}

function gainXP(n){
  if(P.level >= MAX_LEVEL) return;
  n *= curRole().loot || 1;
  n *= 1 + petAbilityLevel('learner')*.15;
  P.xp = (P.xp || 0) + Math.round(n);
  let up = false;

  while(P.level < MAX_LEVEL && P.xp >= xpNeed(P.level)){
    P.xp -= xpNeed(P.level);
    P.level++;
    up = true;
    if(P.level % 5 === 0) P.baseCritChance = (P.baseCritChance ?? .1) + .01;
  }

  if(up){
    P.hp = getStats().maxHP;
    toast('LEVEL UP', 'You reached level '+P.level+'. Stats increased and health restored.', 3);
    MUSIC.stinger('levelup');
    burst(P.x, P.y-60, '#c5a3ff', 24);
    syncHUD();
  }
}


/* =========================================================
   8. ACHIEVEMENTS
   ========================================================= */

// Pets discovered (fusing uses pets up, but they stay discovered)
const petCount = () => WORLD_ORDER.reduce((n,id) => n + (G.progress[id]?.petFound?.length || 0), 0);

const ACH = [
  {id:'first_blood', name:'First Blood',        desc:'Defeat your first enemy.',          reward:50,   ok:d=>d.kills>=1},
  {id:'hunter',      name:'Rift Hunter',        desc:'Defeat 100 enemies.',               reward:400,  ok:d=>d.kills>=100},
  {id:'slayer',      name:'Multiverse Slayer',  desc:'Defeat 500 enemies.',               reward:1500, ok:d=>d.kills>=500},
  {id:'crit1',       name:'Lucky Strike',       desc:'Land a critical hit.',              reward:50,   ok:d=>d.crits>=1},
  {id:'crit100',     name:'Precision',          desc:'Land 100 critical hits.',           reward:600,  ok:d=>d.crits>=100},
  {id:'boss1',       name:'Guardian Breaker',   desc:'Defeat a world boss.',              reward:300,  ok:d=>d.bossKills>=1},
  {id:'cores',       name:'Core Collector',     desc:'Recover all 7 Core Shards.',        reward:5000, ok:()=>G.cores>=7},
  {id:'pets10',      name:'Friend of Beasts',   desc:'Befriend 10 pets.',                 reward:500,  ok:()=>petCount()>=10},
  {id:'pets56',      name:'Pet Master',         desc:'Befriend every pet in the Multiverse.', reward:8000, ok:()=>petCount()>=totalPets()},
  {id:'wave5',       name:'Trial Initiate',     desc:'Reach wave 5 in the Rift Trials.',  reward:400,  ok:d=>d.bestWave>=5},
  {id:'wave10',      name:'Trial Veteran',      desc:'Reach wave 10 in the Rift Trials.', reward:1000, ok:d=>d.bestWave>=10},
  {id:'wave20',      name:'Endless Walker',     desc:'Reach wave 20 in the Rift Trials.', reward:3000, ok:d=>d.bestWave>=20},
  {id:'arsenal1',    name:'New Toy',            desc:'Buy a new weapon.',                 reward:200,  ok:d=>d.weapons.length>=2},
  {id:'arsenalAll',  name:'Full Arsenal',       desc:'Own every weapon.',                 reward:6000, ok:d=>d.weapons.length>=Object.keys(WEAPONS).length},
  {id:'forged',      name:'Master Smith',       desc:'Upgrade your weapon to level 5.',   reward:800,  ok:()=>P.weaponLevel>=5},
  {id:'rich',        name:'Rift Tycoon',        desc:'Earn 10,000 Rift Credits in total.',reward:1000, ok:d=>d.creditsEarned>=10000},
  {id:'lvl10',       name:'Seasoned',           desc:'Reach level 10.',                   reward:700,  ok:()=>P.level>=10},
  {id:'lvl25',       name:'Legendary',          desc:'Reach level 25.',                   reward:2500, ok:()=>P.level>=25},
  {id:'bounty5',     name:'Bounty Hunter',      desc:'Complete 5 Rift Bounties.',         reward:800,  ok:d=>d.bounties>=5},
  {id:'dodger',      name:'Untouchable',        desc:'Dodge 25 enemy attacks.',           reward:500,  ok:d=>d.dodges>=25},
  {id:'secrets',     name:'Secret Hunter',      desc:'Find every hidden secret.',         reward:500,  ok:()=>!!P.secretHunter},
  {id:'explorer',    name:'Beyond the Matrix',  desc:'Clear the Ocean Depths.',           reward:2000, ok:()=>G.completed.has('ocean')},
  {id:'sugar',       name:'Sugar High',         desc:'Trigger a Sugar Rush.',             reward:300,  ok:d=>d.rushes>=1},
  {id:'herd',        name:'Herd Dodger',        desc:'Survive 5 stampedes without a hit.',reward:600,  ok:d=>d.stampedes>=5},
  {id:'allworlds',   name:'Master of the Multiverse', desc:'Clear every world.',          reward:10000, ok:()=>WORLD_ORDER.every(id=>G.completed.has(id))},
  {id:'crew1',       name:'Not Alone',          desc:'Rescue your first crew member.',    reward:200,  ok:d=>d.crew.length>=1},
  {id:'crewAll',     name:'Nobody Left Behind', desc:'Rescue the whole crew.',            reward:5000, ok:d=>d.crew.length>=10},
  {id:'village',     name:'Home Sweet Hub',     desc:'Build all 10 houses in the Crew Village.', reward:3000, ok:d=>d.houses.length>=10},
  {id:'fusion1',     name:'Mad Scientist',      desc:'Fuse two pets in the Fusion Machine.', reward:500, ok:d=>d.fusions>=1},
  {id:'fusion10',    name:'Fusion Master',      desc:'Perform 10 fusions.',               reward:3000, ok:d=>d.fusions>=10}
];

function checkAchievements(){
  for(const a of ACH){
    if(X.data.ach.includes(a.id)) continue;
    if(a.ok(X.data)){
      X.data.ach.push(a.id);
      addCredits(a.reward);
      extToast('ACHIEVEMENT UNLOCKED', a.name+' — '+a.desc+' +'+a.reward+' credits.', 3.5);
      MUSIC.stinger('achievement');
      saveExt();
    }
  }
}


/* =========================================================
   9. UI INJECTION (CSS + new HUD pieces + new panels)
   ========================================================= */

const style = document.createElement('style');
style.textContent = `
.xpTrack{height:4px;margin-top:4px;background:#040814;border-radius:99px;overflow:hidden;border:1px solid rgba(255,255,255,.08)}
.xpTrack i{display:block;height:100%;width:0;background:linear-gradient(90deg,#9b72ff,#72e6ff);box-shadow:0 0 8px rgba(155,114,255,.6);transition:width .2s}
.bountyCard{padding:10px 12px}
.bountyCard b{display:block;margin-top:3px;font-size:11px;letter-spacing:.04em}
.bountyCard span{display:block;margin-top:4px;color:#aebdd0;font-size:9px}
.bountyCard .bTrack{height:5px;margin-top:7px;background:#040814;border-radius:99px;overflow:hidden}
.bountyCard .bTrack i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffb347,#ffe38d);box-shadow:0 0 8px rgba(255,179,71,.5)}
#weaponSection{margin-bottom:22px}
.weaponIcon{width:64px;height:40px;display:block}
.weaponCard small{display:block;margin-top:5px;color:#ffcf8a;font-size:8px;letter-spacing:.1em}
.recPage{display:none}.recPage.active{display:block}
.statGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.statGrid div{padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.statGrid small{display:block;font-size:7px;letter-spacing:.17em;color:#7e91aa}
.statGrid b{font-size:15px}
.achCard.locked{opacity:.42;filter:saturate(.2)}
.trophy{width:30px;height:30px;transform:rotate(45deg);margin:4px 0 8px 6px;border:2px solid #ffe38d;background:linear-gradient(135deg,#fff7c8,#f2b84b 55%,#9a5a1c);box-shadow:0 0 14px rgba(255,210,100,.45)}
.achCard.locked .trophy{border-color:#52627a;background:#1a2538;box-shadow:none}
.soundList{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;margin-top:10px}
.soundList button{text-align:left;font-size:8px;line-height:1.5}
.soundList button.playing{border-color:#79eaff;background:linear-gradient(180deg,#193b52,#112438);color:#bdf7ff}
.soundList h3{grid-column:1/-1;margin:10px 0 0}
`;
document.head.appendChild(style);

(function injectUI(){
  // XP bar under the health bar
  const hpNum = document.querySelector('.playerInfo .hpNumbers');
  if(hpNum && !$('xpFill')){
    hpNum.insertAdjacentHTML('afterend','<div class="xpTrack"><i id="xpFill"></i></div>');
  }

  // Bounty / Trials card
  const left = document.querySelector('.leftHud');
  if(left && !$('mechCard')){
    left.insertAdjacentHTML('beforeend',
      '<div id="mechCard" class="hudCard bountyCard hidden"><small id="mechLabel">WORLD</small>'+
      '<b id="mechTitle">—</b><span id="mechText"></span><div class="bTrack"><i id="mechFill"></i></div></div>');
  }
  if(left && !$('bountyCard')){
    left.insertAdjacentHTML('beforeend',
      '<div id="bountyCard" class="hudCard bountyCard hidden"><small id="bountyLabel">RIFT BOUNTY</small>'+
      '<b id="bountyTitle">—</b><span id="bountyText"></span><div class="bTrack"><i id="bountyFill"></i></div></div>');
  }

  // Records overlay
  if(!$('recordsOverlay')){
    $('gameShell').insertAdjacentHTML('beforeend', `
      <section id="recordsOverlay" class="overlay hidden">
        <div class="panel widePanel">
          <header>
            <div><small>RIFTWALKER</small><h2>Records &amp; Sound Test</h2></div>
            <button id="recordsClose" class="closeBtn">CLOSE</button>
          </header>
          <div class="tabs">
            <button class="tab active" data-rec-tab="recStats">STATS</button>
            <button class="tab" data-rec-tab="recAch">ACHIEVEMENTS</button>
            <button class="tab" data-rec-tab="recSound">SOUND TEST</button>
          </div>
          <div id="recStats" class="recPage active"></div>
          <div id="recAch" class="recPage"></div>
          <div id="recSound" class="recPage"></div>
        </div>
      </section>`);
  }

  // Pause menu button
  const quit = $('quitBtn');
  if(quit && !$('recordsBtn')){
    quit.insertAdjacentHTML('beforebegin','<button id="recordsBtn">RECORDS &amp; SOUND TEST</button>');
  }

  // Main menu button
  const menu = document.querySelector('.menuButtons');
  if(menu && !$('recordsMenuBtn')){
    menu.insertAdjacentHTML('beforeend',
      '<button id="recordsMenuBtn"><span>RECORDS</span><small>ACHIEVEMENTS · SOUND TEST</small></button>');
  }

  const hint = document.querySelector('.menuHint');
  if(hint) hint.insertAdjacentHTML('beforeend',' · Records <b>K</b>');
})();

function openRecords(){
  MUSIC.start();
  openOverlay('recordsOverlay', renderRecords);
}

function closeRecords(){
  MUSIC.forced = null;
  closeOverlay('recordsOverlay');
}

$('recordsClose').onclick = closeRecords;
$('recordsBtn').onclick = openRecords;
$('recordsMenuBtn').onclick = openRecords;

document.querySelectorAll('[data-rec-tab]').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('[data-rec-tab]').forEach(x => x.classList.toggle('active', x===b));
    document.querySelectorAll('.recPage').forEach(x => x.classList.toggle('active', x.id===b.dataset.recTab));
    SFX.click();
  };
});

window.addEventListener('keydown', e => {
  if(e.key.toLowerCase() !== 'k') return;
  if(['arena','flight','crash','travel'].includes(G.scene)) return;
  if(isVisible('recordsOverlay')) closeRecords();
  else openRecords();
});

function fmtTime(s){
  s = Math.floor(s);
  const h = Math.floor(s/3600), m = Math.floor(s%3600/60);
  return h ? h+'h '+m+'m' : m+'m '+(s%60)+'s';
}

function renderRecords(){
  const d = X.data;
  const stats = [
    ['ROLE', curRole().name.toUpperCase()],
    ['CREW RESCUED', X.data.crew.length+' / 10'],
    ['LEVEL', P.level],
    ['EXPERIENCE', (P.xp || 0)+' / '+xpNeed(P.level)],
    ['ENEMIES DEFEATED', d.kills],
    ['CRITICAL HITS', d.crits],
    ['BOSSES DEFEATED', d.bossKills],
    ['CORE SHARDS', G.cores+' / '+WORLD_ORDER.length],
    ['CREDITS EARNED', d.creditsEarned.toLocaleString()],
    ['BEST TRIAL WAVE', d.bestWave],
    ['BOUNTIES DONE', d.bounties],
    ['DODGES', d.dodges],
    ['PARRIES', d.parries],
    ['PETS', petCount()+' / '+totalPets()],
    ['FUSIONS', X.data.fusions],
    ['SECRETS', G.easterEggs.size+' / '+EASTER_TOTAL],
    ['WEAPONS', d.weapons.length+' / '+Object.keys(WEAPONS).length],
    ['ACHIEVEMENTS', d.ach.length+' / '+ACH.length],
    ['PLAY TIME', fmtTime(d.playTime)]
  ];
  $('recStats').innerHTML = '<div class="statGrid">'+
    stats.map(([k,v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')+'</div>';

  $('recAch').innerHTML = '<div class="cardGrid">'+ACH.map(a => {
    const got = d.ach.includes(a.id);
    return `<div class="itemCard achCard ${got?'':'locked'}"><div class="trophy"></div>
      <h4>${a.name}</h4><p>${a.desc}</p><p>${got?'UNLOCKED':'Reward: '+a.reward+' credits'}</p></div>`;
  }).join('')+'</div>';

  renderSoundTest();
}

function renderSoundTest(){
  const box = $('recSound');
  box.innerHTML = '<p class="panelNote">Pick any track to preview it. Music returns to normal when you close this panel.</p>';
  const list = document.createElement('div');
  list.className = 'soundList';

  const add = (label, sub, fn, playing=false) => {
    const b = document.createElement('button');
    b.innerHTML = label+'<br><span style="opacity:.6">'+sub+'</span>';
    if(playing) b.classList.add('playing');
    b.onclick = fn;
    list.appendChild(b);
  };

  list.insertAdjacentHTML('beforeend','<h3>Soundtrack</h3>');
  for(const [k,s] of Object.entries(SONGS)){
    add(s.title.toUpperCase(), s.bpm+' BPM', () => {
      MUSIC.start();
      MUSIC.forced = k;
      MUSIC.applySong();
      renderSoundTest();
    }, MUSIC.forced===k);
  }
  add('STOP PREVIEW', 'Back to normal music', () => {
    MUSIC.forced = null;
    MUSIC.applySong();
    renderSoundTest();
  });

  list.insertAdjacentHTML('beforeend','<h3>Jingles</h3>');
  for(const k of Object.keys(STINGERS)){
    add(k.toUpperCase(), 'One-shot jingle', () => MUSIC.stinger(k));
  }
  box.appendChild(list);
}


/* ---------- weapon shop inside the inventory ---------- */

function drawWeaponIcon(c, key){
  const w = WEAPONS[key];
  c.clearRect(0,0,64,40);
  c.save();
  c.translate(32,20);
  c.rotate(-.55);
  c.shadowColor = w.color;
  c.shadowBlur = 10;
  c.lineCap = 'round';

  const blade = (len,width) => {
    const g = c.createLinearGradient(-len/2,0,len/2,0);
    g.addColorStop(0,w.color);
    g.addColorStop(1,'#ffffff');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-6,-width/2);
    c.lineTo(len-6,-width/2);
    c.lineTo(len,0);
    c.lineTo(len-6,width/2);
    c.lineTo(-6,width/2);
    c.closePath();
    c.fill();
  };
  const handle = (len) => {
    c.strokeStyle = '#3e2a77';
    c.lineWidth = 5;
    c.beginPath(); c.moveTo(-6,0); c.lineTo(-6-len,0); c.stroke();
  };

  if(key==='hammer'){
    handle(16);
    c.strokeStyle = '#6b4b3a'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-6,0); c.lineTo(20,0); c.stroke();
    c.fillStyle = w.color;
    c.fillRect(16,-11,14,22);
  }else if(key==='scythe'){
    c.strokeStyle = '#2b1d45'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-24,0); c.lineTo(22,0); c.stroke();
    c.strokeStyle = w.color; c.lineWidth = 5;
    c.beginPath(); c.arc(14,12,14,-Math.PI*.9,-Math.PI*.15); c.stroke();
  }else if(key==='lance'){
    c.strokeStyle = '#51607a'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-26,0); c.lineTo(18,0); c.stroke();
    c.fillStyle = w.color;
    c.beginPath(); c.moveTo(18,-6); c.lineTo(32,0); c.lineTo(18,6); c.closePath(); c.fill();
  }else if(key==='rapier'){
    handle(10);
    c.strokeStyle = w.color; c.lineWidth = 2;
    c.beginPath(); c.arc(-6,0,6,0,Math.PI*2); c.stroke();
    blade(32,3);
  }else if(key==='trident'){
    c.strokeStyle = '#3c6a7a'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-26,0); c.lineTo(18,0); c.stroke();
    c.strokeStyle = w.color; c.lineWidth = 3;
    c.beginPath();
    c.moveTo(18,-9); c.lineTo(18,9);
    c.moveTo(18,-9); c.lineTo(31,-9);
    c.moveTo(18,0);  c.lineTo(33,0);
    c.moveTo(18,9);  c.lineTo(31,9);
    c.stroke();
  }else if(key==='cane'){
    c.lineWidth = 7;
    c.strokeStyle = '#ffffff';
    c.beginPath(); c.moveTo(-24,0); c.lineTo(16,0); c.arc(16,-8,8,Math.PI/2,-Math.PI/2,true); c.stroke();
    c.strokeStyle = w.color;
    c.setLineDash([5,5]);
    c.beginPath(); c.moveTo(-24,0); c.lineTo(16,0); c.arc(16,-8,8,Math.PI/2,-Math.PI/2,true); c.stroke();
    c.setLineDash([]);
  }else if(key==='axe'){
    c.strokeStyle = '#5a4636'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-24,0); c.lineTo(20,0); c.stroke();
    c.fillStyle = w.color;
    c.beginPath(); c.moveTo(12,-3); c.quadraticCurveTo(22,-18,32,-14); c.lineTo(28,6); c.quadraticCurveTo(20,4,12,3); c.closePath(); c.fill();
  }else if(key==='club'){
    c.fillStyle = '#e8dcc0';
    c.beginPath(); c.moveTo(-24,-3); c.lineTo(20,-9); c.lineTo(28,0); c.lineTo(20,9); c.lineTo(-24,3); c.closePath(); c.fill();
    c.fillStyle = w.color;
    for(const x of [2,12,22]){ c.beginPath(); c.moveTo(x,-7); c.lineTo(x+3,-15); c.lineTo(x+6,-7); c.closePath(); c.fill(); }
  }else if(key==='glaive'){
    c.strokeStyle = '#6a6f8a'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-26,0); c.lineTo(14,0); c.stroke();
    c.fillStyle = w.color;
    c.beginPath(); c.moveTo(12,-2); c.quadraticCurveTo(26,-16,34,-4); c.quadraticCurveTo(28,2,12,4); c.closePath(); c.fill();
  }else if(key==='blaster' || key==='cannon'){
    const big = key==='cannon';
    c.rotate(.55);
    rr(c, -20, -8, big ? 44 : 36, big ? 16 : 12, 5, '#34485e', '#16263a', 2);
    rr(c, -14, 2, 10, 14, 3, '#23384d', '#16263a', 2);
    c.fillStyle = w.color;
    c.fillRect(big ? 16 : 10, -5, big ? 10 : 8, big ? 10 : 6);
    ellipse(c, -6, -2, 3, 3, w.color);
  }else if(key==='bow'){
    c.rotate(.55);
    c.strokeStyle = w.color; c.lineWidth = 4;
    c.beginPath(); c.arc(-4, 0, 18, -Math.PI/2.3, Math.PI/2.3); c.stroke();
    c.strokeStyle = '#ffffff'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(3,-16); c.lineTo(3,16); c.stroke();
    c.strokeStyle = '#dbe7f5'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-14,0); c.lineTo(26,0); c.stroke();
    c.fillStyle = w.color;
    c.beginPath(); c.moveTo(26,-4); c.lineTo(32,0); c.lineTo(26,4); c.closePath(); c.fill();
  }else if(key==='boomerang'){
    c.rotate(.55);
    c.strokeStyle = w.color; c.lineWidth = 8;
    c.beginPath(); c.moveTo(-18,10); c.lineTo(2,-10); c.lineTo(22,10); c.stroke();
  }else if(key==='daggers'){
    for(const a of [-.5,.5]){
      c.save(); c.rotate(a);
      c.fillStyle = '#5a4636'; c.fillRect(-20,-2,10,4);
      c.fillStyle = w.color;
      c.beginPath(); c.moveTo(-10,-4); c.lineTo(18,0); c.lineTo(-10,4); c.closePath(); c.fill();
      c.restore();
    }
  }else if(key==='whip'){
    c.strokeStyle = '#5a4636'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(-26,0); c.lineTo(-14,0); c.stroke();
    c.strokeStyle = w.color; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-14,0);
    for(let i=0;i<=8;i++) c.lineTo(-14 + i*6, Math.sin(i*1.2)*7);
    c.stroke();
  }else if(key==='gauntlets'){
    c.rotate(.55);
    rr(c, -12, -10, 24, 20, 6, '#7a4a2a', '#3a2010', 2);
    c.fillStyle = w.color;
    c.beginPath(); c.moveTo(-8,-10); c.quadraticCurveTo(-4,-26,2,-30); c.quadraticCurveTo(8,-22,10,-10); c.closePath(); c.fill();
    c.fillStyle = '#ffd36a';
    c.beginPath(); c.moveTo(-3,-10); c.quadraticCurveTo(0,-20,3,-22); c.quadraticCurveTo(6,-16,6,-10); c.closePath(); c.fill();
  }else if(key==='aegis'){
    handle(10);
    blade(24, 6);
    c.rotate(-.55);
    c.fillStyle = w.color; c.strokeStyle = '#8a6a1a'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-26,-12); c.lineTo(-12,-12); c.lineTo(-13,2); c.lineTo(-19,8); c.lineTo(-25,2); c.closePath(); c.fill(); c.stroke();
  }else if(key==='gravity'){
    c.strokeStyle = '#3a3a5a'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-24,0); c.lineTo(18,0); c.stroke();
    rr(c, 12, -12, 16, 24, 4, '#4a4a6a', '#1a1a2a', 2);
    ellipse(c, 20, 0, 5, 5, w.color);
  }else if(key==='pixel'){
    c.fillStyle = '#5a4636'; c.fillRect(-22,-2,8,4);
    c.fillStyle = '#ffd66b'; c.fillRect(-14,-6,4,12);
    const cols = ['#6cff8a','#3ad06a','#aaffb8'];
    for(let i=0;i<8;i++){ c.fillStyle = cols[i%3]; c.fillRect(-10 + i*5, -3, 5, 6); }
    c.fillStyle = '#ffffff'; c.fillRect(30,-2,4,4);
  }else if(key==='fusionBlade' || key==='edge'){
    handle(12);
    c.fillStyle = '#34485e'; c.fillRect(-8,-9,4,18);
    const g = c.createLinearGradient(-6,0,32,0);
    if(key==='edge'){
      ['#ff6175','#ffd66b','#6ee0a0','#72e6ff','#9b72ff','#ffffff'].forEach((col,i,a) => g.addColorStop(i/(a.length-1), col));
    }else{
      g.addColorStop(0,'#ff6fd8'); g.addColorStop(.5,'#ffffff'); g.addColorStop(1,'#72e6ff');
    }
    c.fillStyle = g;
    c.beginPath(); c.moveTo(-6, key==='edge' ? -6 : -4); c.lineTo(28,-3); c.lineTo(36,0); c.lineTo(28,3); c.lineTo(-6, key==='edge' ? 6 : 4); c.closePath(); c.fill();
  }else{
    handle(12);
    c.fillStyle = '#7650db';
    c.fillRect(-8,-8,4,16);
    blade(key==='pulse'?26:key==='katana'?32:28, key==='katana'?4:7);
  }
  c.restore();
}

function ensureWeaponSection(){
  if($('weaponSection')) return;
  const layout = document.querySelector('#inventoryOverlay .inventoryLayout');
  if(!layout) return;
  const box = document.createElement('div');
  box.id = 'weaponSection';
  box.innerHTML = '<h3>Weapons</h3><div id="weaponGrid" class="cardGrid"></div>';
  layout.parentNode.insertBefore(box, layout);
}

function renderWeapons(){
  ensureWeaponSection();
  const grid = $('weaponGrid');
  if(!grid) return;
  grid.innerHTML = '';

  for(const [key,w] of Object.entries(WEAPONS)){
    const owned = X.data.weapons.includes(key);
    const unlocked = w.req ? w.req() : (!w.unlock || G.completed.has(w.unlock));
    const hasSword = !!P.weapon;
    const equipped = hasSword && X.data.weaponKey===key;

    const card = document.createElement('div');
    card.className = 'itemCard weaponCard'+(equipped?' selected':'');

    const cv = document.createElement('canvas');
    cv.width = 64; cv.height = 40;
    cv.className = 'weaponIcon';
    card.appendChild(cv);

    const spd = w.cd < .8 ? 'FAST' : w.cd < 1.2 ? 'NORMAL' : 'SLOW';
    const unlockText = w.reqText ? 'Unlock: '+w.reqText
      : w.unlock ? 'Unlocks after clearing '+WORLDS[w.unlock].name : 'Found on Earth 2.0';
    const style = w.style || 'MELEE';
    const styleCol = {MELEE:'#9fb0c7', RANGED:'#72e6ff', THROWN:'#ffb65d', LEGENDARY:'#ffe38d'}[style];

    card.insertAdjacentHTML('beforeend', `
      <h4>${w.name}${equipped?' · LV '+P.weaponLevel:''}
        <span class="abChip" style="border-color:${styleCol};color:${styleCol};margin:0 0 0 4px">${style}</span></h4>
      <p>ATK +${w.atk} · ${spd}${w.ranged ? '' : ' · RANGE x'+w.range} · CRIT +${Math.round(w.crit*100)}%</p>
      <p>${w.desc}</p>
      ${unlocked ? '' : '<small>'+unlockText.toUpperCase()+'</small>'}`);

    const btn = document.createElement('button');

    if(!hasSword){
      btn.textContent = 'FIND THE NOVA SWORD FIRST';
      btn.disabled = true;
    }else if(owned){
      btn.textContent = equipped ? 'EQUIPPED' : 'EQUIP';
      btn.disabled = equipped;
      btn.onclick = () => {
        X.data.weaponKey = key;
        restoreWeaponName();
        SFX.swing();
        saveExt();
        renderInventory();
        syncHUD();
      };
    }else{
      btn.textContent = unlocked ? 'BUY · '+w.price.toLocaleString() : 'LOCKED';
      btn.disabled = !unlocked;
      btn.onclick = () => {
        if(spendCredits(w.price)){
          X.data.weapons.push(key);
          X.data.weaponKey = key;
          restoreWeaponName();
          toast('NEW WEAPON', w.name+' equipped.');
          MUSIC.stinger('pet');
          saveExt();
          renderInventory();
        }
      };
    }
    card.appendChild(btn);

    if(equipped){
      const up = document.createElement('button');
      if(P.weaponLevel >= 10){
        up.textContent = 'MAX LEVEL';
        up.disabled = true;
      }else{
        up.textContent = 'UPGRADE TO LV '+(P.weaponLevel+1)+' · '+upgradeCost().toLocaleString();
        up.onclick = () => {
          if(spendCredits(upgradeCost())){
            P.weaponLevel++;
            SFX.core();
            toast('WEAPON UPGRADED', w.name+' is now level '+P.weaponLevel+'.');
            renderInventory();
            syncHUD();
          }
        };
      }
      card.appendChild(up);
    }

    grid.appendChild(card);
    drawWeaponIcon(cv.getContext('2d'), key);
  }
}


/* =========================================================
   10. RIFT TRIALS (endless survival waves)
   ========================================================= */

WORLDS.trials = {
  name:'Rift Trials', width:2600,
  skyA:'#0a0718', skyB:'#3b1a3f', ground:'#2a2438', dark:'#07050f',
  boss:'Trial Champion', mechanic:'Endless Waves',
  desc:'Survive as many waves as you can.', accent:'#ffb347'
};

const TRIAL_GATE = {x:175, y:470};

function enterTrials(){
  closeAllOverlays();
  G.scene = 'travel';
  G.travelTarget = 'trials';
  G.sceneTime = 0;
  SFX.portal();
  MUSIC.setWorld('trials');
}

function startWave(n){
  T.wave = n;
  T.cleared = false;
  T.toSpawn = Math.min(3 + n*2, 18);
  T.total = T.toSpawn + (n%5===0 ? 1 : 0);
  T.spawnCd = .3;

  if(n % 5 === 0) spawnTrialBoss(n);

  toast('WAVE '+n, n%5===0 ? 'A Trial Champion has entered the arena!' : T.toSpawn+' enemies incoming.', 2);
  SFX.portal();
}

function trialSpawnX(){
  const side = Math.random() < .5 ? -1 : 1;
  return clamp(P.x + side*rand(380,650), 140, WORLDS.trials.width-140);
}

function spawnTrialEnemy(){
  const n = T.wave;
  spawnEnemy('trials', trialSpawnX(), rand(455,605), false);
  const e = G.enemies[G.enemies.length-1];
  const mult = e.elite ? 2.4 : 1;
  e.maxHP = e.hp = Math.round((85 + n*24)*mult);
  e.damage = Math.round((16 + n*3)*(e.elite ? 1.3 : 1));
  e.name = e.elite ? 'Elite Construct' : 'Rift Construct';
  burst(e.x, e.y-40, '#ffb347', 12);
}

function spawnTrialBoss(n){
  spawnEnemy('trials', trialSpawnX(), 520, true);
  const e = G.enemies[G.enemies.length-1];
  e.maxHP = e.hp = 500 + n*110;
  e.damage = 38 + n*2;
  e.name = 'Trial Champion · Wave '+n;
}

function waveCleared(){
  const n = T.wave;
  X.data.bestWave = Math.max(X.data.bestWave, n);
  addCredits(40*n);
  gainXP(18*n);
  const s = getStats();
  P.hp = Math.min(s.maxHP, P.hp + Math.round(s.maxHP*.25));
  toast('WAVE '+n+' CLEARED', '+'+(40*n)+' credits and 25% health restored. Next wave soon.', 2.6);
  MUSIC.stinger('achievement');
  saveExt();
}

function updateTrials(dt){
  if(T.toSpawn > 0){
    T.spawnCd -= dt;
    if(T.spawnCd <= 0){
      spawnTrialEnemy();
      T.toSpawn--;
      T.spawnCd = .45;
    }
    return;
  }

  const alive = G.enemies.some(e => e.alive && e.world==='trials');
  if(alive) return;

  if(!T.cleared){
    T.cleared = true;
    if(T.wave > 0) waveCleared();
    T.inter = 3.2;
  }

  T.inter -= dt;
  if(T.inter <= 0) startWave(T.wave + 1);
}

function endTrials(){
  const wave = T.wave;
  X.data.bestWave = Math.max(X.data.bestWave, wave - 1);
  for(const e of G.enemies) if(e.world==='trials') e.alive = false;
  clearCombat();
  MUSIC.endBoss();
  P.hp = getStats().maxHP;
  beginHub();
  toast('TRIALS OVER', 'You fell on wave '+wave+'. Best cleared wave: '+X.data.bestWave+'.', 4);
  MUSIC.stinger('fail');
  saveExt();
}


/* =========================================================
   11. BOUNTIES
   ========================================================= */

function newBounty(id){
  const idx = WORLD_ORDER.indexOf(id);
  if(idx < 0) return;
  const need = 6 + idx*2, reward = 150 + idx*90;
  X.data.bounty = {world:id, need, got:0, reward, done:false};
  extToast('RIFT BOUNTY', 'Defeat '+need+' enemies in '+WORLDS[id].name+' for '+reward+' credits.', 3.2);
}

function bountyKill(e){
  const b = X.data.bounty;
  if(!b || b.done || b.world!==e.world || e.boss) return;
  b.got++;
  if(b.got >= b.need){
    b.done = true;
    X.data.bounties++;
    addCredits(b.reward);
    gainXP(60 + WORLD_ORDER.indexOf(b.world)*25);
    extToast('BOUNTY COMPLETE', '+'+b.reward+' Rift Credits. A new bounty appears next time you enter a world.', 3);
    MUSIC.stinger('achievement');
    saveExt();
  }
}


/* =========================================================
   12. COMBAT: PROJECTILES, SHOCKWAVES, ORBS, BOSS ATTACKS
   ========================================================= */

const aimAngle = e => Math.atan2((P.y - e.y)/.6, P.x - e.x);

function fire(src, a, speed, dmg, color){
  X.proj.push({
    x:src.x, y:src.y, h:src.boss ? 80 : 55,
    vx:Math.cos(a)*speed, vy:Math.sin(a)*speed*.6,
    dmg, color, life:4.5, r:src.boss ? 11 : 8
  });
}

function worldColor(e){
  const w = e.world==='trials' ? (e.skin || 'war') : e.world;
  return WORLDS[w]?.accent || '#ff7589';
}

function updateRanged(dt){
  for(const e of G.enemies){
    if(!e.alive || !e.ranged || e.world!==G.worldId) continue;
    const dx = P.x-e.x, dy = P.y-e.y, d = Math.hypot(dx,dy);

    // keep distance
    if(d < 230 && d > 1){
      e.x -= dx/d*150*dt;
      e.y = clamp(e.y - dy/d*100*dt, 445, 615);
    }

    e.shootCd -= dt;
    if(d < 520 && e.shootCd <= 0){
      e.shootCd = rand(1.8,2.8);
      fire(e, aimAngle(e), 300, Math.round(e.damage*.8), worldColor(e));
      SFX.tone(520,.08,'square',.03,.6);
      if(!X.data.tipDodge){
        X.data.tipDodge = true;
        extToast('TIP', 'Dash (SHIFT) or jump (SPACE) to dodge shots. Attack a shot to PARRY it.', 4);
      }
    }
  }
}

function bossSpecial(e){
  const w = e.world==='trials' ? (e.skin || 'war') : e.world;
  const pats = {
    earth:['slam'], music:['ring'], money:['volley'], cosmos:['ring','volley'],
    war:['volley','slam'], void:['slam','ring'], matrix:['ring','volley','slam'],
    ocean:['ring','volley'], candy:['volley','ring'], frost:['slam','volley'],
    dino:['slam','volley'], sky:['ring','volley','slam']
  }[w] || ['volley'];
  const p = pats[randi(0,pats.length-1)];
  const rage = e.hp/e.maxHP < .45;
  const dmg = Math.round(e.damage*.7);
  const col = worldColor(e);

  if(p==='slam'){
    X.waves.push({x:e.x, y:e.y, r:24, max:rage?640:520, speed:rage?470:400, dmg, color:col});
    if(rage) X.waves.push({x:e.x, y:e.y, r:-140, max:640, speed:470, dmg, color:col});
    G.screenShake = Math.max(G.screenShake, 12);
    SFX.noise(.3,.12,300);
  }

  if(p==='ring'){
    const n = rage ? 16 : 11;
    for(let i=0;i<n;i++) fire(e, i*Math.PI*2/n + G.time, 260, dmg, col);
    SFX.tone(300,.3,'sine',.06,2);
  }

  if(p==='volley'){
    const n = rage ? 7 : 5, base = aimAngle(e);
    for(let i=0;i<n;i++) fire(e, base + (i-(n-1)/2)*.16, 360, dmg, col);
    SFX.tone(200,.2,'sawtooth',.05,1.6);
  }
}

function updateBosses(dt){
  for(const e of G.enemies){
    if(!e.alive || !e.boss || e.world!==G.worldId) continue;

    if(e.charge > 0){
      e.charge -= dt;
      if(e.charge <= 0) bossSpecial(e);
      continue;
    }

    e.specialCd = (e.specialCd ?? 3) - dt;
    const d = Math.hypot(P.x-e.x, P.y-e.y);

    if(e.specialCd <= 0 && d < 720){
      e.charge = .75;
      e.specialCd = e.hp/e.maxHP < .45 ? 2.6 : 4.2;
      SFX.tone(90,.5,'sawtooth',.06,1.8);
    }
  }
}

function registerDodge(obj){
  if(obj.dodged) return;
  obj.dodged = true;
  X.data.dodges++;
  floatingText('DODGE', P.x, P.y-125, '#9ff9ff');
}

function updateProjectiles(dt){
  for(const p of X.proj){
    p.x += p.vx*dt;
    p.y += p.vy*dt;
    p.life -= dt;
    if(p.y < 400 || p.y > 660) p.life = 0;
    if(p.life <= 0) continue;

    if(Math.abs(p.x-P.x) < 30 && Math.abs(p.y-P.y) < 24){
      if(P.dashTimer > 0 || P.jump > 45){
        registerDodge(p);
      }else if(P.invuln <= 0){
        p.life = 0;
        burst(p.x, p.y-p.h, p.color, 8);
        hurtPlayer(p.dmg, p.x);
      }
    }
  }
  X.proj = X.proj.filter(p => p.life > 0);
}

function updateWaves(dt){
  for(const w of X.waves){
    w.r += w.speed*dt;
    if(w.r > w.max) w.dead = true;
    if(w.r <= 0 || w.dead) continue;

    if(w.visualOnly) continue;
    if(w.friendly){
      for(const e of G.enemies){
        if(!e.alive || e.world!==G.worldId || w.hit.has(e.id)) continue;
        const d = Math.hypot(e.x-w.x, (e.y-w.y)/.35);
        if(Math.abs(d-w.r) < 26){
          w.hit.add(e.id);
          hurtEnemy(e, w.dmg, false);
        }
      }
    }else if(!w.hit){
      const d = Math.hypot(P.x-w.x, (P.y-w.y)/.35);
      if(Math.abs(d-w.r) < 22){
        if(P.jump > 18 || P.dashTimer > 0){
          registerDodge(w);
        }else if(P.invuln <= 0){
          w.hit = true;
          hurtPlayer(w.dmg, w.x);
        }
      }
    }
  }
  X.waves = X.waves.filter(w => !w.dead);
}

function dropOrb(x,y){
  X.orbs.push({x, y:clamp(y,450,610), life:18, t:0});
}

function updateOrbs(dt){
  for(const o of X.orbs){
    o.life -= dt;
    o.t += dt;
    if(o.life > 0 && Math.hypot(P.x-o.x, P.y-o.y) < 55){
      const s = getStats();
      const heal = Math.round(s.maxHP*.12);
      P.hp = Math.min(s.maxHP, P.hp+heal);
      floatingText('+'+heal+' HP', P.x, P.y-120, '#7dffb0');
      burst(o.x, o.y-25, '#7dffb0', 10);
      SFX.pet();
      o.life = 0;
    }
  }
  X.orbs = X.orbs.filter(o => o.life > 0);
}


/* =========================================================
   12b. NEW WORLD MECHANICS
   ========================================================= */

const propSpot = i => ({x:850 + i*560, y:470 + (i%3)*38});

function setupMechanic(id){
  X.mech = null;
  const w = WORLDS[id];

  if(id==='ocean'){
    const items = [];
    for(let x=750; x<w.width-300; x+=430) items.push({x, y:rand(460,600), cd:0, t:rand(0,6)});
    X.mech = {kind:'ocean', o2:100, items, warned:false};
  }
  if(id==='candy'){
    const items = [];
    for(let x=650; x<w.width-300; x+=360) items.push({x, y:rand(455,605), cd:0, t:rand(0,6), hue:randi(0,4)});
    X.mech = {kind:'candy', sugar:0, rush:0, items};
  }
  if(id==='frost'){
    const fires = [];
    for(let i=1;i<9;i+=2) fires.push(propSpot(i));
    X.mech = {kind:'frost', cold:0, fires, warm:false};
  }
  if(id==='dino'){
    X.mech = {kind:'dino', next:7, warn:0, lane:520, dir:1, herd:[], hitDone:false};
  }
  if(id==='sky'){
    X.mech = {kind:'sky', gust:0, gustT:5, dir:1, strikes:[], strikeT:3};
  }

  if(X.mech) extToast(w.mechanic.toUpperCase(), w.intro, 4.5);
}

function addSugar(m, n){
  if(m.rush > 0) return;
  m.sugar += n;
  if(m.sugar >= 100){
    m.sugar = 0;
    m.rush = 7;
    X.data.rushes++;
    toast('SUGAR RUSH!', 'Movement and attack speed boosted for 7 seconds.', 2);
    MUSIC.stinger('levelup');
  }
}

function updateMechanic(dt){
  const m = X.mech;
  if(!m || G.worldId !== m.kind) return;
  const s = getStats();

  const drain = pct => {
    X.drainAcc = (X.drainAcc || 0) + s.maxHP*pct*dt;
    const whole = Math.floor(X.drainAcc);
    if(whole > 0){
      X.drainAcc -= whole;
      P.hp -= whole;
    }
    P.hitFlash = Math.max(P.hitFlash, .05);
    if(P.hp <= 0){
      P.hp = 0;
      playerDefeated();
    }
  };

  if(m.kind==='ocean'){
    m.o2 = Math.max(0, m.o2 - 4*dt);
    for(const b of m.items){
      b.t += dt;
      if(b.cd > 0){ b.cd -= dt; continue; }
      if(Math.hypot(P.x-b.x, P.y-b.y) < 55){
        m.o2 = Math.min(100, m.o2+40);
        b.cd = 9;
        burst(b.x, b.y-40, '#bff8ff', 12);
        SFX.tone(700,.12,'sine',.05,1.8);
      }
    }
    if(m.o2 < 25 && !m.warned){
      m.warned = true;
      toast('LOW OXYGEN', 'Find an air bubble fast!', 2);
    }
    if(m.o2 > 40) m.warned = false;
    if(m.o2 <= 0) drain(.05);
  }

  if(m.kind==='candy'){
    m.rush = Math.max(0, m.rush - dt);
    for(const c of m.items){
      c.t += dt;
      if(c.cd > 0){ c.cd -= dt; continue; }
      if(Math.hypot(P.x-c.x, P.y-c.y) < 50){
        if(c.temp) c.dead = true;
        c.cd = 14;
        addSugar(m, 22);
        burst(c.x, c.y-30, ['#ff6fb5','#ffd66b','#7cd4ff','#a0f0a0','#c79bff'][c.hue], 10);
        SFX.coin();
      }
    }
    m.items = m.items.filter(c => !c.dead);
    if(m.rush > 0 && Math.random() < .5){
      burst(P.x, P.y-50, ['#ff6fb5','#ffd66b','#7cd4ff','#a0f0a0'][randi(0,3)], 1);
    }
  }

  if(m.kind==='frost'){
    m.warm = m.fires.some(f => Math.abs(P.x-f.x) < 150 && Math.abs(P.y-f.y) < 100);
    m.cold = clamp(m.cold + (m.warm ? -30 : 4.5)*dt, 0, 100);
    if(m.cold >= 100) drain(.035);
  }

  if(m.kind==='dino'){
    m.next -= dt;

    if(m.warn <= 0 && !m.herd.length && m.next <= 0){
      m.warn = 1.7;
      m.lane = clamp(P.y + rand(-30,30), 450, 610);
      m.dir = Math.random() < .5 ? 1 : -1;
      m.hitDone = false;
      toast('STAMPEDE!', 'A herd is charging through. Jump or leave the red lane!', 1.6);
      SFX.tone(80,.8,'sawtooth',.08,.6);
    }

    if(m.warn > 0){
      m.warn -= dt;
      G.screenShake = Math.max(G.screenShake, 2);
      if(m.warn <= 0){
        const startX = G.camera + (m.dir > 0 ? -200 : W+200);
        m.herd = [0,1,2,3,4].map(i => ({
          x:startX - m.dir*i*120, y:m.lane + rand(-12,12), hit:new Set(), p:rand(0,6), big:i===2
        }));
      }
    }

    if(m.herd.length){
      G.screenShake = Math.max(G.screenShake, 3);
      for(const d of m.herd){
        d.x += m.dir*950*dt;
        d.p += dt*20;

        if(!m.hitDone && Math.abs(d.x-P.x) < 60 && Math.abs(d.y-P.y) < 34 &&
           P.jump < 40 && P.dashTimer <= 0 && P.invuln <= 0){
          m.hitDone = true;
          hurtPlayer(Math.round(s.maxHP*.12 + 60), d.x - m.dir*50);
          P.vx = m.dir*500;
        }

        for(const e of G.enemies){
          if(e.alive && e.world==='dino' && !e.boss && !d.hit.has(e.id) &&
             Math.abs(d.x-e.x) < 60 && Math.abs(d.y-e.y) < 34){
            d.hit.add(e.id);
            hurtEnemy(e, 120, false);
            e.x += m.dir*80;
          }
        }
      }

      const cam = G.camera;
      if(m.herd.every(d => m.dir > 0 ? d.x > cam+W+300 : d.x < cam-300)){
        if(!m.hitDone) X.data.stampedes++;
        m.herd = [];
        m.next = rand(9,13);
      }
    }
  }

  if(m.kind==='sky'){
    m.gustT -= dt;
    if(m.gust > 0){
      m.gust -= dt;
      P.x = clamp(P.x + m.dir*150*dt, 80, WORLDS.sky.width-80);
      if(m.gust <= 0) m.gustT = rand(5,8);
    }else if(m.gustT <= 0){
      m.gust = 3.5;
      m.dir = Math.random() < .5 ? 1 : -1;
      toast('WIND GUST', m.dir > 0 ? 'The wind is pushing you right!' : 'The wind is pushing you left!', 1.5);
    }

    m.strikeT -= dt;
    if(m.strikeT <= 0){
      m.strikeT = rand(2.6,4);
      m.strikes.push({x:P.x + rand(-160,160), y:clamp(P.y + rand(-50,50), 450, 610), t:1, r:75});
    }

    for(const k of m.strikes){
      if(!k.done){
        k.t -= dt;
        if(k.t <= 0){
          k.done = true;
          k.flash = .3;
          SFX.noise(.25,.14,2500);
          G.flash = Math.max(G.flash, .05);
          G.screenShake = Math.max(G.screenShake, 6);
          const inside = Math.hypot(P.x-k.x, (P.y-k.y)/.4) < k.r;
          if(inside){
            if(P.dashTimer > 0) registerDodge(k);
            else if(P.invuln <= 0) hurtPlayer(Math.round(s.maxHP*.1 + 40), k.x);
          }
          for(const e of G.enemies){
            if(e.alive && e.world==='sky' && Math.hypot(e.x-k.x, (e.y-k.y)/.4) < k.r) hurtEnemy(e, 150, false);
          }
        }
      }else{
        k.flash -= dt;
      }
    }
    m.strikes = m.strikes.filter(k => !k.done || k.flash > 0);
  }
}

function updateMechHud(){
  const card = $('mechCard');
  if(!card) return;
  const m = X.mech;

  if(!m || G.scene!=='world' || G.worldId!==m.kind){
    card.classList.add('hidden');
    return;
  }
  card.classList.remove('hidden');

  let label = '', title = '', text = '', fill = 0, col = '';

  if(m.kind==='ocean'){
    label = 'OXYGEN';
    title = Math.ceil(m.o2)+'%';
    text = m.o2 <= 0 ? 'Drowning! Find an air bubble.' : 'Swim through air bubbles to refill.';
    fill = m.o2/100;
    col = m.o2 < 25 ? '#ff6175' : 'linear-gradient(90deg,#3fd0ff,#bff8ff)';
  }
  if(m.kind==='candy'){
    label = 'SUGAR RUSH';
    title = m.rush > 0 ? 'RUSHING · '+m.rush.toFixed(1)+'s' : Math.round(m.sugar)+'%';
    text = m.rush > 0 ? 'Faster movement and attacks.' : 'Collect candy to fill the meter.';
    fill = m.rush > 0 ? m.rush/7 : m.sugar/100;
    col = 'linear-gradient(90deg,#ff6fb5,#ffd66b,#7cf0c8)';
  }
  if(m.kind==='frost'){
    label = 'COLD';
    title = Math.round(m.cold)+'%'+(m.warm ? ' · WARMING UP' : '');
    text = m.cold >= 100 ? 'Freezing! Get to a campfire.' : 'Cold slows you down. Campfires warm you.';
    fill = m.cold/100;
    col = 'linear-gradient(90deg,#bff3ff,#5aa9ff)';
  }
  if(m.kind==='dino'){
    label = 'STAMPEDE';
    title = m.warn > 0 ? 'INCOMING!' : m.herd.length ? 'CHARGING!' : 'NEXT IN '+Math.max(0,Math.ceil(m.next))+'s';
    text = 'Jump or move out of the red lane.';
    fill = (m.warn > 0 || m.herd.length) ? 1 : clamp(1 - m.next/13, 0, 1);
    col = 'linear-gradient(90deg,#ff9a3c,#ff5a3c)';
  }
  if(m.kind==='sky'){
    label = 'STORM WINDS';
    title = m.gust > 0 ? (m.dir > 0 ? 'GUST PUSHING RIGHT' : 'GUST PUSHING LEFT') : 'CALM';
    text = 'Leave glowing circles before lightning hits.';
    fill = m.gust > 0 ? m.gust/3.5 : 0;
    col = 'linear-gradient(90deg,#ffd66b,#fff4c2)';
  }

  $('mechLabel').textContent = label;
  $('mechTitle').textContent = title;
  $('mechText').textContent = text;
  $('mechFill').style.width = clamp(fill,0,1)*100+'%';
  $('mechFill').style.background = col;
}

function drawBolt(x1, y1, x2, y2, color, width=4){
  ctx.save();
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const n = 7;
  for(let i=1;i<n;i++){
    ctx.lineTo(lerp(x1,x2,i/n) + rand(-18,18), lerp(y1,y2,i/n));
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = width*.4;
  ctx.stroke();
  ctx.restore();
}

function drawDinoRunner(x, y, dir, p, big){
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir*(big ? 1.3 : 1), big ? 1.3 : 1);
  shadow(0, 6, 90, 16, .3);
  const leg = Math.sin(p)*14;
  ctx.strokeStyle = '#3d2a1a';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8,-28); ctx.lineTo(-8-leg,0);
  ctx.moveTo(10,-28); ctx.lineTo(10+leg,0);
  ctx.stroke();
  const g = ctx.createLinearGradient(-40,-70,40,-20);
  g.addColorStop(0, '#d98a4a');
  g.addColorStop(1, '#8a4a22');
  ellipse(ctx, 0, -42, 40, 20, g, '#3d2a1a', 4);
  ctx.fillStyle = '#8a4a22';
  ctx.beginPath();
  ctx.moveTo(-36,-46); ctx.lineTo(-78,-58); ctx.lineTo(-36,-34);
  ctx.closePath(); ctx.fill();
  ellipse(ctx, 42, -58, 20, 13, '#d98a4a', '#3d2a1a', 4);
  ctx.fillStyle = '#fff4d8';
  for(let i=0;i<3;i++){
    ctx.beginPath(); ctx.moveTo(46+i*6,-50); ctx.lineTo(49+i*6,-44); ctx.lineTo(52+i*6,-50); ctx.fill();
  }
  ellipse(ctx, 48, -62, 3, 3, '#1a1008');
  ctx.restore();
}

function drawMechanic(cam){
  const m = X.mech;
  const t = G.time;

  // chain-lightning bolts from the Storm Glaive
  for(const b of X.bolts){
    drawBolt(b.x-cam+rand(-20,20), b.y-260, b.x-cam, b.y-40, '#ffd66b', 3);
  }

  if(!m || G.worldId !== m.kind) return;

  if(m.kind==='ocean'){
    for(const b of m.items){
      if(b.cd > 0) continue;
      const x = b.x-cam, y = b.y - 42 + Math.sin(b.t*2)*6;
      if(x < -50 || x > W+50) continue;
      ctx.save();
      const g = ctx.createRadialGradient(x-6, y-6, 2, x, y, 20);
      g.addColorStop(0, 'rgba(255,255,255,.9)');
      g.addColorStop(.35, 'rgba(180,245,255,.35)');
      g.addColorStop(1, 'rgba(120,220,255,.15)');
      ctx.fillStyle = g;
      ctx.strokeStyle = 'rgba(220,252,255,.9)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#bff8ff';
      ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(x, y, 19, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('O2', x, y+3);
      ctx.restore();
    }
  }

  if(m.kind==='candy'){
    const cols = ['#ff6fb5','#ffd66b','#7cd4ff','#a0f0a0','#c79bff'];
    for(const c of m.items){
      if(c.cd > 0) continue;
      const x = c.x-cam, y = c.y - 30 + Math.sin(c.t*3)*4;
      if(x < -50 || x > W+50) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(c.t*2)*.3);
      ctx.fillStyle = cols[c.hue];
      ctx.strokeStyle = '#5a2a4f';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-12,0); ctx.lineTo(-22,-9); ctx.lineTo(-22,9); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12,0); ctx.lineTo(22,-9); ctx.lineTo(22,9); ctx.closePath(); ctx.fill(); ctx.stroke();
      ellipse(ctx, 0, 0, 13, 10, cols[c.hue], '#5a2a4f', 2);
      ctx.strokeStyle = 'rgba(255,255,255,.8)';
      ctx.beginPath(); ctx.arc(-3,-3,5,Math.PI,Math.PI*1.6); ctx.stroke();
      ctx.restore();
    }

    if(m.rush > 0){
      ctx.save();
      ctx.globalAlpha = .55;
      cols.forEach((c,i) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(P.x-cam, P.y-P.jump-60, 50+i*6+Math.sin(t*10+i)*3, 70+i*6, 0, 0, Math.PI*2);
        ctx.stroke();
      });
      ctx.restore();
    }
  }

  if(m.kind==='frost' && m.cold > 55){
    ctx.save();
    const a = (m.cold-55)/45*.55;
    const g = ctx.createRadialGradient(W/2, H/2, 220, W/2, H/2, 760);
    g.addColorStop(0, 'rgba(180,230,255,0)');
    g.addColorStop(1, `rgba(200,240,255,${a})`);
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);
    ctx.restore();
  }

  if(m.kind==='dino'){
    if(m.warn > 0){
      ctx.save();
      ctx.globalAlpha = .25 + .2*Math.sin(t*20);
      ctx.fillStyle = '#ff3b2f';
      ctx.fillRect(0, m.lane-34, W, 68);
      ctx.globalAlpha = .9;
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 22px system-ui';
      ctx.textAlign = 'center';
      const arrow = m.dir > 0 ? '>>>' : '<<<';
      for(let x=120; x<W; x+=260) ctx.fillText(arrow, x, m.lane+8);
      ctx.restore();
    }
    for(const d of m.herd) drawDinoRunner(d.x-cam, d.y, m.dir, d.p, d.big);
  }

  if(m.kind==='sky'){
    if(m.gust > 0){
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.55)';
      ctx.lineWidth = 2;
      for(let i=0;i<28;i++){
        const len = 60 + (i%4)*30;
        const x = ((i*173 + t*700*m.dir) % (W+200) + W+200) % (W+200) - 100;
        const y = 80 + (i*67) % 560;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - m.dir*len, y); ctx.stroke();
      }
      ctx.restore();
    }
    for(const k of m.strikes){
      const x = k.x-cam;
      if(!k.done){
        ctx.save();
        const p = 1 - k.t;
        ctx.strokeStyle = '#ffd66b';
        ctx.fillStyle = `rgba(255,214,107,${.12 + p*.25})`;
        ctx.shadowColor = '#ffd66b';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(x, k.y, k.r, k.r*.4, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(x, k.y, k.r*p, k.r*.4*p, 0, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
      }else{
        drawBolt(x + rand(-30,30), -10, x, k.y, '#fff4b0', 7);
        ctx.save();
        ctx.globalAlpha = k.flash/.3;
        ellipse(ctx, x, k.y, k.r, k.r*.4, 'rgba(255,240,180,.6)');
        ctx.restore();
      }
    }
  }
}


/* =========================================================
   13. HUD EXTRAS
   ========================================================= */

function updateHudExtras(){
  const xpFill = $('xpFill');
  if(xpFill){
    xpFill.style.width = P.level >= MAX_LEVEL ? '100%'
      : clamp((P.xp || 0)/xpNeed(P.level),0,1)*100+'%';
  }

  const card = $('bountyCard');
  if(!card) return;

  if(G.scene==='world' && G.worldId==='trials'){
    card.classList.remove('hidden');
    const alive = G.enemies.filter(e => e.alive && e.world==='trials').length;
    const left = alive + T.toSpawn;
    $('bountyLabel').textContent = 'RIFT TRIALS';
    $('bountyTitle').textContent = T.wave ? 'WAVE '+T.wave : 'GET READY';
    $('bountyText').textContent = left+' enemies left · Best wave '+X.data.bestWave;
    $('bountyFill').style.width = (T.wave ? clamp(1-left/T.total,0,1)*100 : 0)+'%';
    return;
  }

  const b = X.data.bounty;
  if(G.scene==='world' && b && b.world===G.worldId){
    card.classList.remove('hidden');
    $('bountyLabel').textContent = 'RIFT BOUNTY';
    $('bountyTitle').textContent = b.done ? 'BOUNTY COMPLETE' : 'DEFEAT '+b.need+' ENEMIES';
    $('bountyText').textContent = b.done ? 'Reward claimed.' : b.got+' / '+b.need+' · Reward '+b.reward+' credits';
    $('bountyFill').style.width = clamp(b.got/b.need,0,1)*100+'%';
  }else{
    card.classList.add('hidden');
  }
}


/* =========================================================
   14. DRAWING: NEW EFFECTS, HUB GATE, TRIALS WORLD
   ========================================================= */

function extDraw(){
  if(G.scene !== 'world') return;
  const cam = G.camera;
  ctx.save();

  // shockwaves
  for(const w of X.waves){
    if(w.r <= 0) continue;
    const a = 1 - w.r/w.max;
    ctx.globalAlpha = .2 + .65*a;
    ctx.strokeStyle = w.friendly ? '#ffcf8a' : w.color;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 16;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(w.x-cam, w.y, w.r, w.r*.35, 0, 0, Math.PI*2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // health orbs
  for(const o of X.orbs){
    const x = o.x-cam, y = o.y - 28 + Math.sin(o.t*4)*4;
    const blink = o.life < 4 && Math.sin(o.t*20) > 0;
    if(blink) continue;
    ctx.shadowColor = '#7dffb0';
    ctx.shadowBlur = 18;
    ellipse(ctx, x, y, 11, 11, '#2fcf7d', '#c8ffe0', 2);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x-2, y-6, 4, 12);
    ctx.fillRect(x-6, y-2, 12, 4);
  }

  // projectiles
  for(const p of X.proj){
    const x = p.x-cam;
    ctx.globalAlpha = .25;
    ellipse(ctx, x, p.y, p.r, p.r*.35, '#000');
    ctx.globalAlpha = .45;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = p.r;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, p.y-p.h);
    ctx.lineTo(x - p.vx*.05, p.y - p.h - p.vy*.05);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 18;
    ellipse(ctx, x, p.y-p.h, p.r, p.r, p.color);
    ellipse(ctx, x, p.y-p.h, p.r*.45, p.r*.45, '#ffffff');
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function drawTrialGate(){
  const {x,y} = TRIAL_GATE, t = G.time;
  shadow(x, y+8, 130, 22, .32);

  rr(ctx, x-54, y-122, 22, 126, 7, '#4a3a55', '#1e1628', 4);
  rr(ctx, x+32, y-122, 22, 126, 7, '#4a3a55', '#1e1628', 4);

  ctx.save();
  ctx.strokeStyle = '#5d4670';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(x, y-112, 43, Math.PI, 0);
  ctx.stroke();

  const g = ctx.createRadialGradient(x, y-60, 4, x, y-60, 55);
  g.addColorStop(0, 'rgba(255,245,220,.95)');
  g.addColorStop(.3, 'rgba(255,160,70,.8)');
  g.addColorStop(.7, 'rgba(200,60,80,.45)');
  g.addColorStop(1, 'rgba(60,20,50,.05)');
  ctx.fillStyle = g;
  ctx.shadowColor = '#ffb347';
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.ellipse(x, y-60, 31, 56, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,230,190,.7)';
  ctx.lineWidth = 2;
  for(let i=0;i<3;i++){
    ctx.beginPath();
    ctx.ellipse(x, y-60, 22-i*6, 42-i*11, t*(1+i*.4), 0, Math.PI*1.4);
    ctx.stroke();
  }
  ctx.restore();

  drawHubSign(x, y-172, 'RIFT TRIALS', '#ffb347');

  ctx.save();
  ctx.fillStyle = '#ffcf8a';
  ctx.font = '900 9px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('BEST WAVE '+X.data.bestWave, x, y-145);
  ctx.restore();
}

function drawTrialsBg(w, cam){
  const t = G.time;

  const sky = ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0, '#0a0718');
  sky.addColorStop(.45, '#3b1a3f');
  sky.addColorStop(.62, '#8a3b2e');
  sky.addColorStop(1, '#1a1420');
  ctx.fillStyle = sky;
  ctx.fillRect(0,0,W,H);

  // the great rift in the sky
  const rx = 640 - cam*.02, ry = 150;
  const rg = ctx.createRadialGradient(rx, ry, 8, rx, ry, 170);
  rg.addColorStop(0, 'rgba(255,240,210,.95)');
  rg.addColorStop(.18, 'rgba(255,160,70,.7)');
  rg.addColorStop(.5, 'rgba(180,50,90,.3)');
  rg.addColorStop(1, 'rgba(40,10,40,0)');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.ellipse(rx, ry, 190, 110, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = 'rgba(255,190,120,.35)';
  ctx.lineWidth = 4;
  for(let i=0;i<4;i++){
    ctx.beginPath();
    ctx.ellipse(rx, ry, 90+i*28, 36+i*15, -t*.06 - i*.2, 0, Math.PI*2);
    ctx.stroke();
  }
  ctx.restore();

  // colosseum arches (two parallax layers)
  for(const [spd, base, col, h] of [[.05, 380, 'rgba(40,20,45,.75)', 150], [.13, 400, 'rgba(26,14,30,.9)', 110]]){
    const off = ((cam*spd) % 120 + 120) % 120;
    ctx.fillStyle = col;
    ctx.fillRect(0, base-h, W, h);
    ctx.fillStyle = 'rgba(255,140,70,.18)';
    for(let x=-off; x<W+120; x+=120){
      ctx.beginPath();
      ctx.moveTo(x+30, base);
      ctx.lineTo(x+30, base-h*.55);
      ctx.arc(x+60, base-h*.55, 30, Math.PI, 0);
      ctx.lineTo(x+90, base);
      ctx.closePath();
      ctx.fill();
    }
  }

  // arena floor
  ctx.fillStyle = w.ground;
  ctx.fillRect(0, 400, W, 320);
  const fl = ctx.createLinearGradient(0,400,0,H);
  fl.addColorStop(0, 'rgba(255,170,90,.12)');
  fl.addColorStop(1, 'rgba(0,0,0,.45)');
  ctx.fillStyle = fl;
  ctx.fillRect(0, 400, W, 320);

  ctx.strokeStyle = 'rgba(255,170,90,.12)';
  ctx.lineWidth = 2;
  for(let y=430; y<H; y+=40){
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
  }

  // glowing rune circles on the floor
  ctx.save();
  ctx.strokeStyle = 'rgba(255,179,71,.35)';
  ctx.shadowColor = '#ffb347';
  ctx.shadowBlur = 12;
  ctx.lineWidth = 3;
  for(let k=0; k<6; k++){
    const x = 300 + k*520 - cam;
    if(x < -200 || x > W+200) continue;
    ctx.beginPath(); ctx.ellipse(x, 530, 150, 50, 0, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, 530, 95, 30, 0, 0, Math.PI*2); ctx.stroke();
  }
  ctx.restore();
}

function drawTrialProp(type, x, y, cam){
  x -= cam;
  ctx.save();
  ctx.translate(x, y);

  if(type % 2 === 0){
    rr(ctx, -20, -150, 40, 154, 6, '#4b3f58', '#1d1624', 4);
    rr(ctx, -28, -162, 56, 16, 5, '#5e4f6e', '#1d1624', 4);
    ctx.shadowColor = '#ffb347';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ffcf8a';
    ctx.beginPath();
    ctx.moveTo(0,-110); ctx.lineTo(8,-95); ctx.lineTo(0,-80); ctx.lineTo(-8,-95);
    ctx.closePath();
    ctx.fill();
  }else{
    rr(ctx, -8, -70, 16, 74, 4, '#3a3040', '#17121c', 3);
    rr(ctx, -26, -84, 52, 18, 7, '#56465f', '#17121c', 4);
    const f = 1 + Math.sin(G.time*14 + x)*.12;
    ctx.shadowColor = '#ff8c3a';
    ctx.shadowBlur = 22;
    ctx.fillStyle = '#ff8c3a';
    ctx.beginPath();
    ctx.moveTo(-18,-84);
    ctx.quadraticCurveTo(-10,-120*f,0,-132*f);
    ctx.quadraticCurveTo(10,-120*f,18,-84);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffe2a8';
    ctx.beginPath();
    ctx.moveTo(-8,-84);
    ctx.quadraticCurveTo(0,-110*f,8,-84);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}


/* =========================================================
   14b. NEW WORLD ART
   ========================================================= */

const wrapX = (base, cam, spd, period, margin=150) =>
  ((base - cam*spd) % period + period) % period - margin;

function hills(cam, spd, base, amp, color, step=180, seed=0){
  const off = ((cam*spd) % step + step) % step;
  const k0 = Math.floor(cam*spd/step);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-off-step, base);
  let k = -1;
  for(let x=-off-step; x<W+step; x+=step, k++){
    const h = amp*(.55 + .45*Math.sin((k0+k)*1.7 + seed));
    ctx.quadraticCurveTo(x+step/2, base-h*2, x+step, base);
  }
  ctx.lineTo(W+step, base+30);
  ctx.lineTo(-step, base+30);
  ctx.closePath();
  ctx.fill();
}

/* ---------- backgrounds (drawn on top of the base sky + ground) ---------- */

const NEW_BG = {

  ocean(cam){
    const t = G.time;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for(let i=0;i<6;i++){
      const x = wrapX(i*260, cam, .05, 1560, 200), sway = Math.sin(t*.5+i)*30;
      ctx.fillStyle = 'rgba(180,240,255,.06)';
      ctx.beginPath();
      ctx.moveTo(x+sway,0); ctx.lineTo(x+sway+90,0); ctx.lineTo(x+220,400); ctx.lineTo(x+60,400);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    hills(cam, .04, 400, 40, 'rgba(10,60,100,.55)', 160, 1);
    hills(cam, .1, 400, 28, 'rgba(12,80,110,.7)', 120, 3);

    ctx.lineCap = 'round';
    for(let i=0;i<14;i++){
      const x = wrapX(i*120+40, cam, .16, 1680, 100), h = 120 + (i*37)%110;
      ctx.strokeStyle = i%2 ? 'rgba(40,140,90,.75)' : 'rgba(30,110,80,.75)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x, 405);
      for(let k=1;k<=6;k++) ctx.lineTo(x + Math.sin(t*1.4+i+k*.8)*10*k/3, 405 - h*k/6);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(8,40,70,.5)';
    for(let i=0;i<9;i++){
      const x = wrapX(i*47 + t*40, 0, 0, 1500, 100), y = 150 + (i%3)*22 + Math.sin(t*2+i)*6;
      ctx.beginPath(); ctx.ellipse(x, y, 12, 5, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x-10,y); ctx.lineTo(x-18,y-6); ctx.lineTo(x-18,y+6); ctx.fill();
    }

    ctx.strokeStyle = 'rgba(120,90,50,.18)';
    ctx.lineWidth = 3;
    for(let i=0;i<8;i++){
      const y = 430 + i*36;
      ctx.beginPath();
      for(let x=0;x<=W;x+=40){
        const yy = y + Math.sin((x+cam*.8)*.02 + i)*5;
        x ? ctx.lineTo(x,yy) : ctx.moveTo(x,yy);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(220,250,255,.45)';
    ctx.lineWidth = 1.5;
    for(let i=0;i<24;i++){
      const x = wrapX(i*67, cam, .3, 1600, 40), y = H - ((t*40 + i*83) % (H+40));
      ctx.beginPath(); ctx.arc(x + Math.sin(t*2+i)*6, y, 2+(i%3), 0, Math.PI*2); ctx.stroke();
    }
  },

  candy(cam){
    const t = G.time;
    for(let i=0;i<7;i++){
      const x = wrapX(i*230, cam, .03, 1610, 160), y = 80 + (i%3)*45;
      ctx.fillStyle = i%2 ? 'rgba(255,220,240,.9)' : 'rgba(210,235,255,.9)';
      for(const [dx,dy,r] of [[-40,6,28],[0,-6,38],[42,4,30],[18,14,26]]){
        ctx.beginPath(); ctx.arc(x+dx, y+dy, r, 0, Math.PI*2); ctx.fill();
      }
    }

    for(const [spd,base,c1,c2,r,step] of [[.05,400,'#f7a8d0','#fff0f7',130,300],[.11,405,'#b9e9ff','#ffffff',95,230]]){
      for(let x=wrapX(0,cam,spd,step,0)-step; x<W+step; x+=step){
        const cx = x + step/2;
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, base, r, Math.PI, 0); ctx.closePath(); ctx.clip();
        ctx.fillStyle = c1;
        ctx.fillRect(cx-r, base-r, r*2, r);
        ctx.strokeStyle = c2;
        ctx.lineWidth = 12;
        for(let k=-4;k<6;k++){
          ctx.beginPath(); ctx.moveTo(cx-r+k*36, base); ctx.lineTo(cx-r+k*36+r, base-r); ctx.stroke();
        }
        ctx.restore();
      }
    }

    for(let i=0;i<6;i++){
      const x = wrapX(i*300+100, cam, .15, 1800, 120), h = 150 + (i%3)*30;
      ctx.strokeStyle = 'rgba(255,255,255,.85)';
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(x,402); ctx.lineTo(x,402-h); ctx.stroke();
      ctx.save();
      ctx.translate(x, 402-h-30);
      ctx.rotate(t*.5+i);
      ctx.fillStyle = ['#ff6fb5','#7cd4ff','#ffd66b'][i%3];
      ctx.beginPath(); ctx.arc(0,0,32,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.85)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      for(let a=0;a<Math.PI*6;a+=.3) ctx.lineTo(Math.cos(a)*a*1.6, Math.sin(a)*a*1.6);
      ctx.stroke();
      ctx.restore();
    }

    const cols = ['#ff6fb5','#ffd66b','#7cd4ff','#ffffff','#c79bff'];
    for(let i=0;i<70;i++){
      const x = wrapX(i*53, cam, 1, 3710, 20), y = 420 + (i*97)%290;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(i);
      ctx.fillStyle = cols[i%5];
      ctx.fillRect(-6,-2,12,4);
      ctx.restore();
    }
  },

  frost(cam){
    const t = G.time;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for(let b=0;b<3;b++){
      const c = ['rgba(90,255,190,','rgba(140,120,255,','rgba(90,220,255,'][b];
      const g = ctx.createLinearGradient(0,40,0,230);
      g.addColorStop(0, c+'0)'); g.addColorStop(.5, c+'.3)'); g.addColorStop(1, c+'0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 220);
      for(let x=0;x<=W;x+=40) ctx.lineTo(x, 80 + b*30 + Math.sin(x*.006 + t*.6 + b)*40);
      for(let x=W;x>=0;x-=40) ctx.lineTo(x, 160 + b*30 + Math.sin(x*.006 + t*.6 + b + 1)*40);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    const mount = (spd, base, h, col, cap, step, seed) => {
      const off = wrapX(0, cam, spd, step, 0), k0 = Math.floor(cam*spd/step);
      let k = -2;
      for(let x=off-step*2; x<W+step; x+=step, k++){
        const hh = h*(.7 + .3*Math.sin((k0+k)*2.3 + seed));
        const px = x + step/2, top = base - hh, hw = step*.7;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.moveTo(px-hw, base); ctx.lineTo(px, top); ctx.lineTo(px+hw, base); ctx.closePath(); ctx.fill();
        ctx.fillStyle = cap;
        ctx.beginPath();
        ctx.moveTo(px, top);
        ctx.lineTo(px - hw*.35, top + hh*.35);
        ctx.lineTo(px - hw*.12, top + hh*.27);
        ctx.lineTo(px + hw*.06, top + hh*.37);
        ctx.lineTo(px + hw*.35, top + hh*.35);
        ctx.closePath(); ctx.fill();
      }
    };
    mount(.03, 400, 230, '#8fb3d6', '#ffffff', 420, 1);
    mount(.08, 400, 160, '#6d93bb', '#f4fbff', 300, 4);

    for(let i=0;i<16;i++){
      const x = wrapX(i*105, cam, .16, 1680, 60), h = 50 + (i*31)%45;
      ctx.fillStyle = '#35597a';
      ctx.beginPath(); ctx.moveTo(x, 402-h); ctx.lineTo(x-h*.35, 402); ctx.lineTo(x+h*.35, 402); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.beginPath(); ctx.moveTo(x, 402-h); ctx.lineTo(x-h*.12, 402-h*.66); ctx.lineTo(x+h*.12, 402-h*.66); ctx.closePath(); ctx.fill();
    }

    for(let i=0;i<10;i++){
      const x = wrapX(i*211, cam, 1, 2110, 120), y = 440 + (i*71)%250;
      const g = ctx.createLinearGradient(x-90,y,x+90,y);
      g.addColorStop(0,'rgba(170,220,255,.1)'); g.addColorStop(.5,'rgba(230,248,255,.6)'); g.addColorStop(1,'rgba(170,220,255,.1)');
      ellipse(ctx, x, y, 90, 16, g);
    }
  },

  dino(cam){
    const t = G.time;
    const sg = ctx.createRadialGradient(980,150,10,980,150,140);
    sg.addColorStop(0,'rgba(255,240,190,.95)'); sg.addColorStop(.4,'rgba(255,170,90,.5)'); sg.addColorStop(1,'rgba(255,170,90,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(980,150,140,0,Math.PI*2); ctx.fill();

    const vx = 320 - cam*.02;
    ctx.fillStyle = '#5b4a3a';
    ctx.beginPath(); ctx.moveTo(vx-260,402); ctx.lineTo(vx-50,170); ctx.lineTo(vx+50,170); ctx.lineTo(vx+260,402); ctx.closePath(); ctx.fill();
    ctx.save();
    ctx.fillStyle = '#ff6a2a';
    ctx.shadowColor = '#ff6a2a';
    ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.moveTo(vx-50,170); ctx.lineTo(vx+50,170); ctx.lineTo(vx+30,190); ctx.lineTo(vx+10,240); ctx.lineTo(vx-5,195); ctx.lineTo(vx-35,185); ctx.closePath(); ctx.fill();
    ctx.restore();
    for(let i=0;i<6;i++){
      const p = (t*.15 + i/6) % 1;
      ctx.fillStyle = `rgba(70,60,60,${.45*(1-p)})`;
      ctx.beginPath(); ctx.arc(vx + Math.sin(i*2+t*.3)*20 + p*60, 165 - p*150, 22 + p*40, 0, Math.PI*2); ctx.fill();
    }

    ctx.fillStyle = 'rgba(40,35,40,.7)';
    for(let i=0;i<4;i++){
      const x = wrapX(i*420 + t*60, 0, 0, 1700, 120), y = 110 + i*28 + Math.sin(t+i)*10, f = Math.sin(t*6+i)*10;
      ctx.beginPath(); ctx.moveTo(x-30,y-f); ctx.lineTo(x,y); ctx.lineTo(x+30,y-f); ctx.lineTo(x+8,y+4); ctx.lineTo(x-8,y+4); ctx.closePath(); ctx.fill();
    }

    hills(cam, .07, 402, 55, 'rgba(46,90,50,.8)', 170, 2);

    for(let i=0;i<12;i++){
      const x = wrapX(i*140, cam, .14, 1680, 120);
      ctx.fillStyle = i%2 ? '#2f5e2c' : '#3b6f32';
      for(let k=0;k<5;k++){
        ctx.save();
        ctx.translate(x, 402);
        ctx.rotate((k-2)*.45);
        ctx.beginPath(); ctx.ellipse(0,-55,14,58,0,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }
    }

    for(let i=0;i<14;i++){
      const x = wrapX(i*151, cam, 1, 2114, 60), y = 450 + (i*67)%230;
      ellipse(ctx, x, y, 9, 6, 'rgba(60,45,25,.28)');
      for(const [dx,dy] of [[-9,-8],[0,-11],[9,-8]]) ellipse(ctx, x+dx, y+dy, 3.5, 3, 'rgba(60,45,25,.28)');
    }
  },

  sky(cam){
    const t = G.time;
    const sg = ctx.createRadialGradient(1050,120,10,1050,120,150);
    sg.addColorStop(0,'rgba(255,250,220,.95)'); sg.addColorStop(.4,'rgba(255,220,130,.45)'); sg.addColorStop(1,'rgba(255,220,130,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(1050,120,150,0,Math.PI*2); ctx.fill();

    const island = (x,y,s) => {
      ctx.save();
      ctx.translate(x,y); ctx.scale(s,s);
      ctx.fillStyle = 'rgba(120,120,170,.75)';
      ctx.beginPath(); ctx.moveTo(-80,0); ctx.lineTo(80,0); ctx.lineTo(40,50); ctx.lineTo(10,90); ctx.lineTo(-20,60); ctx.lineTo(-50,30); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(120,200,120,.95)';
      ctx.fillRect(-80,-8,160,10);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fillRect(30,0,5,110);
      ctx.restore();
    };
    for(let i=0;i<5;i++) island(wrapX(i*340, cam, .03, 1700, 150), 130 + (i%3)*50 + Math.sin(t*.6+i)*6, .6 + (i%2)*.25);

    const cx = wrapX(700, cam, .06, 2200, 300);
    for(const [dx,w,h] of [[-70,30,140],[-30,40,200],[20,34,170],[60,26,120]]){
      ctx.fillStyle = 'rgba(235,240,255,.95)';
      ctx.fillRect(cx+dx, 380-h, w, h);
      ctx.fillStyle = 'rgba(120,150,210,.5)';
      ctx.fillRect(cx+dx+w/2-3, 380-h+20, 6, 14);
      ctx.fillStyle = '#f5c95a';
      ctx.beginPath(); ctx.moveTo(cx+dx-4, 380-h); ctx.lineTo(cx+dx+w/2, 380-h-40); ctx.lineTo(cx+dx+w+4, 380-h); ctx.closePath(); ctx.fill();
    }

    for(let layer=0;layer<2;layer++){
      ctx.fillStyle = layer ? 'rgba(255,255,255,.97)' : 'rgba(240,245,255,.85)';
      for(let i=0;i<14;i++){
        const x = wrapX(i*130, cam, .08 + layer*.08, 1820, 120);
        ctx.beginPath(); ctx.arc(x, 398 - layer*6, 50 + (i%3)*14, Math.PI, 0); ctx.fill();
      }
    }

    ctx.strokeStyle = 'rgba(200,170,90,.35)';
    ctx.lineWidth = 2;
    for(let y=440;y<H;y+=50){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    for(let i=0;i<30;i++){
      const x = wrapX(i*90, cam, 1, 2700, 0);
      ctx.beginPath(); ctx.moveTo(x, 410); ctx.lineTo(x + (x-W/2)*.3, H); ctx.stroke();
    }
  }
};

/* ---------- props ---------- */

function drawNewProp(type, x, y, cam, world){
  x -= cam;
  if(x < -250 || x > W+250) return;
  const t = G.time, k = type % 4;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if(world==='ocean'){
    if(k===0){
      shadow(0,4,110,16,.25);
      const br = (x0,y0,a,len,w,d) => {
        if(d > 3) return;
        const x1 = x0 + Math.cos(a)*len, y1 = y0 + Math.sin(a)*len;
        ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
        br(x1,y1,a-.5,len*.72,w*.7,d+1);
        br(x1,y1,a+.45,len*.7,w*.7,d+1);
      };
      ctx.strokeStyle = '#a3345e'; br(0,0,-Math.PI/2,52,17,0);
      ctx.strokeStyle = '#ff7fa8'; br(0,0,-Math.PI/2,52,12,0);
    }else if(k===1){
      for(let i=0;i<3;i++){
        ctx.strokeStyle = i===1 ? '#2f9a5e' : '#23784a';
        ctx.lineWidth = 9;
        ctx.beginPath(); ctx.moveTo(-18+i*18, 2);
        for(let s=1;s<=7;s++) ctx.lineTo(-18+i*18 + Math.sin(t*1.5+i+s*.7)*8, 2 - s*24);
        ctx.stroke();
      }
    }else if(k===2){
      shadow(0,4,110,16,.3);
      ctx.fillStyle = '#7a5aa8'; ctx.strokeStyle = '#3a2758'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(0,-8,48,14,0,0,Math.PI); ctx.fill(); ctx.stroke();
      const open = .5 + .15*Math.sin(t*1.2);
      ctx.save(); ctx.translate(0,-8); ctx.rotate(-open*.6);
      ctx.beginPath(); ctx.ellipse(0,0,48,30,0,Math.PI,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.restore();
      ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 18;
      ellipse(ctx, 0, -18, 12, 12, '#f8f4ff', '#b8a8d8', 2);
      ctx.shadowBlur = 0;
    }else{
      ctx.strokeStyle = '#3d4a55'; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(0,-120); ctx.lineTo(0,-10); ctx.stroke();
      ctx.beginPath(); ctx.arc(0,-40,40,.15*Math.PI,.85*Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-24,-100); ctx.lineTo(24,-100); ctx.stroke();
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(0,-130,12,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle = 'rgba(120,90,50,.8)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0,-142); ctx.quadraticCurveTo(30,-200,10,-260); ctx.stroke();
    }
  }

  else if(world==='candy'){
    if(k===0){
      shadow(0,4,60,12,.2);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(0,2); ctx.lineTo(0,-110); ctx.stroke();
      ctx.save(); ctx.translate(0,-145); ctx.rotate(t*.6);
      ctx.fillStyle = '#ff6fb5'; ctx.strokeStyle = '#8a2a5f'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0,0,38,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6;
      ctx.beginPath(); for(let a=0;a<Math.PI*6;a+=.3) ctx.lineTo(Math.cos(a)*a*1.9, Math.sin(a)*a*1.9); ctx.stroke();
      ctx.restore();
    }else if(k===1){
      shadow(0,4,60,12,.2);
      const cane = () => { ctx.beginPath(); ctx.moveTo(0,2); ctx.lineTo(0,-110); ctx.arc(26,-110,26,Math.PI,0); ctx.lineTo(52,-90); ctx.stroke(); };
      ctx.strokeStyle = '#8a2a3f'; ctx.lineWidth = 20; cane();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 15; cane();
      ctx.strokeStyle = '#ef3b5a'; ctx.setLineDash([12,12]); cane(); ctx.setLineDash([]);
    }else if(k===2){
      shadow(0,4,120,18,.25);
      ctx.fillStyle = '#f7c77a'; ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-50,-60); ctx.lineTo(50,-60); ctx.lineTo(40,2); ctx.lineTo(-40,2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(138,90,42,.5)'; ctx.lineWidth = 2;
      for(let i=-3;i<=3;i++){ ctx.beginPath(); ctx.moveTo(i*14,-60); ctx.lineTo(i*11.5,2); ctx.stroke(); }
      ctx.fillStyle = '#ffb3d9'; ctx.strokeStyle = '#b8467e'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-58,-58);
      for(let i=0;i<=6;i++) ctx.quadraticCurveTo(-58+i*19.3-9, -80-(i%2)*10, -58+i*19.3, -62);
      ctx.quadraticCurveTo(20,-150,0,-150); ctx.quadraticCurveTo(-30,-150,-58,-58);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ellipse(ctx, 0, -158, 10, 10, '#e8243c', '#7a1020', 3);
      rr(ctx, -12, -34, 24, 36, 10, '#8a5a2a', '#5a3a1a', 3);
    }else{
      shadow(0,4,80,14,.2);
      const c = ['rgba(255,90,120,.8)','rgba(120,220,120,.8)','rgba(255,200,60,.8)'][type%3];
      ctx.fillStyle = c; ctx.strokeStyle = 'rgba(80,20,40,.6)'; ctx.lineWidth = 3;
      ellipse(ctx, 0, -40, 30, 38, c, 'rgba(80,20,40,.6)', 3);
      ellipse(ctx, 0, -92, 24, 22, c, 'rgba(80,20,40,.6)', 3);
      ellipse(ctx, -18, -110, 9, 9, c, 'rgba(80,20,40,.6)', 3);
      ellipse(ctx, 18, -110, 9, 9, c, 'rgba(80,20,40,.6)', 3);
      ellipse(ctx, -8, -95, 3, 3, '#3a1020');
      ellipse(ctx, 8, -95, 3, 3, '#3a1020');
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.beginPath(); ctx.ellipse(-10,-52,6,14,-.3,0,Math.PI*2); ctx.fill();
    }
  }

  else if(world==='frost'){
    if(type%2===1){
      // campfire (also a warm-up spot)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(0,-30,5,0,-30,150);
      g.addColorStop(0,'rgba(255,170,80,.45)'); g.addColorStop(1,'rgba(255,120,40,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0,-30,150,0,Math.PI*2); ctx.fill();
      ctx.restore();
      for(let i=0;i<7;i++){
        const a = i/7*Math.PI*2;
        ellipse(ctx, Math.cos(a)*34, Math.sin(a)*10, 9, 6, '#7d8894', '#3e4650', 2);
      }
      ctx.strokeStyle = '#6a4222'; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(-26,4); ctx.lineTo(24,-10); ctx.moveTo(-24,-10); ctx.lineTo(26,4); ctx.stroke();
      const f = 1 + Math.sin(t*14 + x)*.12;
      ctx.save();
      ctx.shadowColor = '#ff8c3a'; ctx.shadowBlur = 24;
      ctx.fillStyle = '#ff7a2a';
      ctx.beginPath(); ctx.moveTo(-20,-6); ctx.quadraticCurveTo(-14,-50*f,0,-70*f); ctx.quadraticCurveTo(14,-50*f,20,-6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffd36a';
      ctx.beginPath(); ctx.moveTo(-10,-6); ctx.quadraticCurveTo(-4,-34*f,0,-44*f); ctx.quadraticCurveTo(6,-30*f,10,-6); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#ffb35a';
      for(let i=0;i<4;i++){
        const p = (t*.8 + i/4) % 1;
        ctx.globalAlpha = 1-p;
        ctx.fillRect(Math.sin(i*3+t*3)*14, -60 - p*90, 3, 3);
      }
      ctx.globalAlpha = 1;
    }else if(k===0){
      shadow(0,4,100,16,.25);
      rr(ctx, -9, -30, 18, 34, 4, '#5a3d28', '#2e1e14', 3);
      for(let i=0;i<4;i++){
        const w = 70 - i*14, y0 = -24 - i*36;
        ctx.fillStyle = '#2f5a4a'; ctx.strokeStyle = '#1a3a30'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, y0-52); ctx.lineTo(-w, y0); ctx.lineTo(w, y0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(0, y0-52); ctx.lineTo(-w*.55, y0-22); ctx.quadraticCurveTo(0, y0-12, w*.55, y0-22); ctx.closePath(); ctx.fill();
      }
    }else{
      ctx.save();
      ctx.shadowColor = '#bff3ff'; ctx.shadowBlur = 18;
      for(const [dx,h,a] of [[-24,70,-.25],[0,110,0],[24,60,.3]]){
        ctx.save(); ctx.translate(dx,0); ctx.rotate(a);
        const g = ctx.createLinearGradient(0,-h,0,0);
        g.addColorStop(0,'#ffffff'); g.addColorStop(.4,'#a8ecff'); g.addColorStop(1,'#4a8ed0');
        ctx.fillStyle = g; ctx.strokeStyle = '#2e5e8e'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0,-h); ctx.lineTo(13,-h*.25); ctx.lineTo(8,4); ctx.lineTo(-8,4); ctx.lineTo(-13,-h*.25); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }
  }

  else if(world==='dino'){
    if(k===0){
      for(let i=0;i<7;i++){
        ctx.save(); ctx.rotate((i-3)*.32);
        ctx.fillStyle = i%2 ? '#3f8a3a' : '#2f7030';
        ctx.beginPath(); ctx.ellipse(0,-70,15,72,0,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(20,50,20,.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0,-2); ctx.lineTo(0,-138); ctx.stroke();
        ctx.restore();
      }
    }else if(k===1){
      shadow(0,4,160,20,.2);
      ctx.strokeStyle = '#efe4c8'; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(-90,-20); ctx.quadraticCurveTo(0,-60,90,-20); ctx.stroke();
      for(let i=-3;i<=3;i++){
        ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(i*24, -38 + Math.abs(i)*4); ctx.quadraticCurveTo(i*34, -90+Math.abs(i)*10, i*20+ (i<0?-8:8), 0); ctx.stroke();
      }
      ellipse(ctx, 110, -14, 26, 16, '#efe4c8', '#b8a88a', 3);
      ellipse(ctx, 118, -18, 4, 4, '#3a2a1a');
    }else if(k===2){
      shadow(0,4,110,16,.3);
      ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 6;
      for(let i=0;i<9;i++){ ctx.beginPath(); ctx.moveTo(-50+i*12, 2); ctx.lineTo(-40+i*10, -18); ctx.stroke(); }
      for(const [dx,s] of [[-20,1],[4,1.15],[26,.95]]){
        ellipse(ctx, dx, -26*s, 15*s, 21*s, '#f2ead0', '#9a8a60', 3);
        ctx.fillStyle = '#8fae5a';
        for(let i=0;i<4;i++) ellipse(ctx, dx - 6 + (i%2)*10, -34*s + i*7, 2.5, 2.5, '#8fae5a');
      }
    }else{
      shadow(0,4,100,16,.25);
      ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.moveTo(0,2); ctx.quadraticCurveTo(10,-60,-4,-140); ctx.stroke();
      ctx.strokeStyle = 'rgba(40,20,10,.4)'; ctx.lineWidth = 2;
      for(let y=-10;y>-135;y-=12){ ctx.beginPath(); ctx.moveTo(-8,y); ctx.lineTo(8,y-3); ctx.stroke(); }
      for(let i=0;i<8;i++){
        const a = -Math.PI/2 + (i-3.5)*.42 + Math.sin(t+i)*.04;
        ctx.save(); ctx.translate(-4,-140); ctx.rotate(a + Math.PI/2);
        ctx.fillStyle = i%2 ? '#4a9a3a' : '#3a8030';
        ctx.beginPath(); ctx.ellipse(0,-50,12,54,0,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }
    }
  }

  else if(world==='sky'){
    if(k===0){
      shadow(0,4,80,14,.2);
      const g = ctx.createLinearGradient(-20,0,20,0);
      g.addColorStop(0,'#c8d0e0'); g.addColorStop(.5,'#ffffff'); g.addColorStop(1,'#b0b8cc');
      rr(ctx, -18, -150, 36, 150, 4, g, '#8a92a8', 3);
      ctx.strokeStyle = 'rgba(140,150,170,.5)'; ctx.lineWidth = 2;
      for(const dx of [-8,0,8]){ ctx.beginPath(); ctx.moveTo(dx,-145); ctx.lineTo(dx,-5); ctx.stroke(); }
      rr(ctx, -28, -164, 56, 16, 4, '#f5c95a', '#a8822a', 3);
      rr(ctx, -26, -8, 52, 12, 3, '#e8ecf4', '#8a92a8', 3);
    }else if(k===1){
      rr(ctx, -6, -120, 12, 122, 4, '#8a7a5a', '#4a3a2a', 3);
      ctx.save(); ctx.translate(0,-124); ctx.rotate(t*3);
      for(let i=0;i<4;i++){
        ctx.rotate(Math.PI/2);
        ctx.fillStyle = i%2 ? '#ffd66b' : '#ffffff'; ctx.strokeStyle = '#8a6a2a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(10,-40); ctx.lineTo(-6,-38); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
      ellipse(ctx, 0, -124, 6, 6, '#f5c95a', '#8a6a2a', 2);
    }else if(k===2){
      shadow(0,4,70,12,.2);
      ctx.save();
      ctx.translate(0, -90 + Math.sin(t*2 + x*.01)*8);
      ctx.shadowColor = '#ffd66b'; ctx.shadowBlur = 22;
      const g = ctx.createLinearGradient(-20,-40,20,40);
      g.addColorStop(0,'#ffffff'); g.addColorStop(.5,'#ffe08a'); g.addColorStop(1,'#e0a030');
      ctx.fillStyle = g; ctx.strokeStyle = '#a8742a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0,-40); ctx.lineTo(20,0); ctx.lineTo(0,40); ctx.lineTo(-20,0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,230,160,.8)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0,0,40,10,t,0,Math.PI*2); ctx.stroke();
      ctx.restore();
    }else{
      rr(ctx, -4, -170, 8, 172, 3, '#d8dce8', '#8a92a8', 2);
      ellipse(ctx, 0, -174, 7, 7, '#f5c95a', '#a8822a', 2);
      ctx.fillStyle = '#4a6ad8'; ctx.strokeStyle = '#2a3a8a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(4,-166);
      for(let i=0;i<=8;i++) ctx.lineTo(4 + i*8, -166 + Math.sin(t*4 + i*.8)*5*(i/8));
      for(let i=8;i>=0;i--) ctx.lineTo(4 + i*8, -120 + Math.sin(t*4 + i*.8)*5*(i/8));
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffd66b';
      ctx.beginPath(); ctx.moveTo(36,-154); ctx.lineTo(44,-143); ctx.lineTo(36,-132); ctx.lineTo(28,-143); ctx.closePath(); ctx.fill();
    }
  }

  ctx.restore();
}

/* ---------- enemies ---------- */

function drawNewCreature(e, bob, world){
  const v = e.variant || 0, hit = e.hit > 0 ? '#ffffff' : null, t = G.time;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if(world==='ocean'){
    if(v===0){
      const r = 32 + Math.sin(t*3+e.x)*3;
      ctx.strokeStyle = '#8a5a1a'; ctx.lineWidth = 4;
      for(let i=0;i<14;i++){
        const a = i/14*Math.PI*2;
        ctx.beginPath(); ctx.moveTo(Math.cos(a)*r, -48+bob+Math.sin(a)*r); ctx.lineTo(Math.cos(a)*(r+12), -48+bob+Math.sin(a)*(r+12)); ctx.stroke();
      }
      const g = ctx.createRadialGradient(-10,-60+bob,4,0,-48+bob,r);
      g.addColorStop(0, hit || '#fff0a0'); g.addColorStop(1, hit || '#e8a030');
      ellipse(ctx, 0, -48+bob, r, r, g, '#8a5a1a', 4);
      ellipse(ctx, -r-6, -48+bob, 10, 6, hit || '#e8a030', '#8a5a1a', 3);
      enemyEyes(-54+bob, '#1a2a3a', 11);
      ctx.strokeStyle = '#8a5a1a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0,-38+bob,7,.1,Math.PI-.1); ctx.stroke();
    }else if(v===1){
      ctx.strokeStyle = '#6a1a1a'; ctx.lineWidth = 6;
      for(const s of [-1,1]) for(let i=0;i<3;i++){
        ctx.beginPath(); ctx.moveTo(s*20, -28+bob); ctx.lineTo(s*(40+i*6), -18+i*6); ctx.lineTo(s*(46+i*6), 2); ctx.stroke();
      }
      const g = ctx.createLinearGradient(-40,-70,40,-20);
      g.addColorStop(0, hit || '#ff7a5a'); g.addColorStop(1, hit || '#b8322a');
      ellipse(ctx, 0, -40+bob, 42, 24, g, '#6a1a1a', 5);
      for(const s of [-1,1]){
        ctx.strokeStyle = '#6a1a1a'; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(s*34,-50+bob); ctx.lineTo(s*58,-76+bob); ctx.stroke();
        ctx.fillStyle = hit || '#ff6a4a'; ctx.strokeStyle = '#6a1a1a'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.ellipse(s*64,-86+bob,16,12,s*.5,0,Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s*62,-86+bob); ctx.lineTo(s*80,-92+bob); ctx.stroke();
      }
      ctx.strokeStyle = '#6a1a1a'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-10,-60+bob); ctx.lineTo(-12,-76+bob); ctx.moveTo(10,-60+bob); ctx.lineTo(12,-76+bob); ctx.stroke();
      ellipse(ctx,-12,-78+bob,6,6,'#ffffff','#6a1a1a',2);
      ellipse(ctx,12,-78+bob,6,6,'#ffffff','#6a1a1a',2);
      ellipse(ctx,-12,-78+bob,2.5,2.5,'#111');
      ellipse(ctx,12,-78+bob,2.5,2.5,'#111');
    }else{
      const fy = -70 + bob + Math.sin(t*2+e.x)*8;
      ctx.strokeStyle = hit || 'rgba(200,150,255,.7)'; ctx.lineWidth = 4;
      for(let i=0;i<6;i++){
        ctx.beginPath(); ctx.moveTo(-25+i*10, fy+10);
        for(let s=1;s<=5;s++) ctx.lineTo(-25+i*10 + Math.sin(t*4+i+s)*7, fy+10+s*13);
        ctx.stroke();
      }
      ctx.save();
      ctx.shadowColor = '#d08aff'; ctx.shadowBlur = 20;
      const g = ctx.createRadialGradient(0,fy-10,4,0,fy,42);
      g.addColorStop(0, hit || 'rgba(255,220,255,.95)'); g.addColorStop(1, hit || 'rgba(160,90,230,.6)');
      ctx.fillStyle = g; ctx.strokeStyle = 'rgba(90,40,140,.9)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, fy+10, 40, 36, 0, Math.PI, Math.PI*2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      enemyEyes(fy-6, '#fff0ff', 12);
    }
  }

  else if(world==='candy'){
    if(v===0){
      const sq = 1 + Math.sin(t*5+e.x)*.06;
      const col = ['#ff5a8a','#5ad08a','#ffb83a'][Math.abs(Math.round(e.x))%3];
      ctx.save(); ctx.translate(0, bob); ctx.scale(1/sq, sq);
      ctx.fillStyle = hit || col; ctx.strokeStyle = 'rgba(80,20,40,.8)'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-40,0); ctx.quadraticCurveTo(-44,-80,0,-86); ctx.quadraticCurveTo(44,-80,40,0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      for(let i=0;i<14;i++) ctx.fillRect(-30 + (i*17)%60, -72 + (i*23)%64, 3, 3);
      ctx.restore();
      enemyEyes(-48+bob, '#3a1020', 12);
      ctx.strokeStyle = '#3a1020'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0,-34+bob,8,Math.PI+.3,-.3); ctx.stroke();
    }else if(v===1){
      ctx.strokeStyle = '#6a1a2a'; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(-12,-26+bob); ctx.lineTo(-14,2); ctx.moveTo(12,-26+bob); ctx.lineTo(14,2); ctx.stroke();
      ctx.save();
      rr(ctx, -24, -80+bob, 48, 56, 12, hit || '#ffffff', '#6a1a2a', 4);
      ctx.beginPath(); ctx.roundRect(-24,-80+bob,48,56,12); ctx.clip();
      ctx.strokeStyle = '#ef3b5a'; ctx.lineWidth = 8;
      for(let i=-3;i<4;i++){ ctx.beginPath(); ctx.moveTo(-30+i*16,-24+bob); ctx.lineTo(-30+i*16+40,-84+bob); ctx.stroke(); }
      ctx.restore();
      ellipse(ctx, 0, -98+bob, 22, 20, hit || '#7ad05a', '#2a5a1a', 4);
      enemyEyes(-100+bob, '#ffffff', 8);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(34,4); ctx.lineTo(34,-110+bob); ctx.arc(46,-110+bob,12,Math.PI,0); ctx.stroke();
      ctx.strokeStyle = '#ef3b5a'; ctx.setLineDash([8,8]);
      ctx.beginPath(); ctx.moveTo(34,4); ctx.lineTo(34,-110+bob); ctx.arc(46,-110+bob,12,Math.PI,0); ctx.stroke();
      ctx.setLineDash([]);
    }else{
      ctx.strokeStyle = '#6a4222'; ctx.lineWidth = 11;
      ctx.beginPath(); ctx.moveTo(-40,-50+bob); ctx.lineTo(-60,-20+bob); ctx.moveTo(40,-50+bob); ctx.lineTo(62,-24+bob);
      ctx.moveTo(-16,-14+bob); ctx.lineTo(-20,2); ctx.moveTo(16,-14+bob); ctx.lineTo(20,2); ctx.stroke();
      const g = ctx.createRadialGradient(-12,-66+bob,4,0,-54+bob,46);
      g.addColorStop(0, hit || '#f2c07a'); g.addColorStop(1, hit || '#c07a3a');
      ellipse(ctx, 0, -54+bob, 44, 42, g, '#6a4222', 5);
      for(const [dx,dy] of [[-18,-70],[14,-78],[22,-44],[-24,-38],[0,-30],[4,-58]]){
        ellipse(ctx, dx, dy+bob, 6, 5, '#4a2a14');
      }
      enemyEyes(-60+bob, '#ffdd88', 14);
      ctx.strokeStyle = '#4a2a14'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-22,-72+bob); ctx.lineTo(-6,-66+bob); ctx.moveTo(22,-72+bob); ctx.lineTo(6,-66+bob); ctx.stroke();
    }
  }

  else if(world==='frost'){
    if(v===0){
      ctx.strokeStyle = '#4a6a8a'; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(-22,-28+bob); ctx.lineTo(-31,3); ctx.moveTo(18,-28+bob); ctx.lineTo(26,3); ctx.stroke();
      const g = ctx.createLinearGradient(-42,-72,40,-16);
      g.addColorStop(0, hit || '#ffffff'); g.addColorStop(1, hit || '#a8c8e8');
      ellipse(ctx, -4, -43+bob, 39, 25, g, '#4a6a8a', 5);
      ellipse(ctx, 30, -52+bob, 22, 20, hit || '#f0f8ff', '#4a6a8a', 5);
      ctx.fillStyle = hit || '#e0f0ff';
      ctx.beginPath(); ctx.moveTo(18,-68+bob); ctx.lineTo(25,-92+bob); ctx.lineTo(33,-68+bob); ctx.moveTo(35,-68+bob); ctx.lineTo(49,-88+bob); ctx.lineTo(48,-61+bob); ctx.fill();
      ctx.strokeStyle = '#d8ecff'; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(-40,-45+bob); ctx.quadraticCurveTo(-70,-70+bob,-80,-44+bob); ctx.stroke();
      enemyEyes(-54+bob, '#5ad8ff', 8);
    }else if(v===1){
      const blk = (x,y,w,h) => {
        const g = ctx.createLinearGradient(x,y,x+w,y+h);
        g.addColorStop(0, hit || '#e8f8ff'); g.addColorStop(1, hit || '#6aaee0');
        rr(ctx, x, y, w, h, 6, g, '#2e5e8e', 4);
      };
      blk(-22,-30+bob,18,30); blk(4,-30+bob,18,30);
      blk(-38,-96+bob,76,62);
      blk(-64,-92+bob,24,50); blk(40,-92+bob,24,50);
      blk(-22,-128+bob,44,34);
      ctx.save(); ctx.shadowColor = '#bff3ff'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(-30,-96+bob); ctx.lineTo(-24,-116+bob); ctx.lineTo(-16,-96+bob); ctx.fill();
      ctx.beginPath(); ctx.moveTo(16,-96+bob); ctx.lineTo(26,-120+bob); ctx.lineTo(32,-96+bob); ctx.fill();
      ctx.restore();
      enemyEyes(-112+bob, '#5ad8ff', 10);
    }else{
      const fy = -80 + bob + Math.sin(t*2+e.x)*10;
      ctx.save();
      ctx.translate(0, fy);
      ctx.rotate(t*.8);
      ctx.shadowColor = '#bff3ff'; ctx.shadowBlur = 20;
      ctx.strokeStyle = hit || '#e8faff'; ctx.lineWidth = 5;
      for(let i=0;i<6;i++){
        ctx.rotate(Math.PI/3);
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-38);
        ctx.moveTo(0,-22); ctx.lineTo(-10,-30); ctx.moveTo(0,-22); ctx.lineTo(10,-30);
        ctx.stroke();
      }
      ctx.restore();
      ellipse(ctx, 0, fy, 14, 14, hit || '#a8ecff', '#4a8ed0', 3);
      enemyEyes(fy-2, '#1a3a5a', 5);
    }
  }

  else if(world==='dino'){
    if(v===0){
      ctx.strokeStyle = '#2a3a1a'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(-8,-30+bob); ctx.lineTo(-14,-12); ctx.lineTo(-6,2); ctx.moveTo(10,-30+bob); ctx.lineTo(4,-12); ctx.lineTo(14,2); ctx.stroke();
      const g = ctx.createLinearGradient(-40,-70,40,-20);
      g.addColorStop(0, hit || '#9ad05a'); g.addColorStop(1, hit || '#4a7a2a');
      ctx.fillStyle = hit || '#4a7a2a';
      ctx.beginPath(); ctx.moveTo(-26,-50+bob); ctx.lineTo(-80,-66+bob); ctx.lineTo(-26,-34+bob); ctx.closePath(); ctx.fill();
      ellipse(ctx, 0, -44+bob, 34, 18, g, '#2a3a1a', 4);
      ctx.save(); ctx.translate(34,-68+bob); ctx.rotate(-.2);
      ellipse(ctx, 0, 0, 22, 12, hit || '#9ad05a', '#2a3a1a', 4);
      ctx.fillStyle = '#ffffff';
      for(let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(4+i*5,6); ctx.lineTo(6+i*5,12); ctx.lineTo(8+i*5,6); ctx.fill(); }
      ellipse(ctx, 8, -4, 3, 3, '#ffdd33');
      ctx.restore();
      ctx.strokeStyle = '#2a3a1a'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(22,-50+bob); ctx.lineTo(32,-40+bob); ctx.stroke();
      ctx.fillStyle = '#c0442a';
      for(let i=0;i<4;i++) ellipse(ctx, -16+i*10, -58+bob, 3, 3, '#c0442a');
    }else if(v===1){
      ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 12;
      for(const dx of [-30,-10,14,32]){ ctx.beginPath(); ctx.moveTo(dx,-30+bob); ctx.lineTo(dx,2); ctx.stroke(); }
      const g = ctx.createLinearGradient(-50,-80,50,-20);
      g.addColorStop(0, hit || '#b88a5a'); g.addColorStop(1, hit || '#6a4a2a');
      ellipse(ctx, -6, -48+bob, 52, 30, g, '#3a2a1a', 5);
      ctx.fillStyle = hit || '#e07a3a'; ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(46,-64+bob,26,34,-.3,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ellipse(ctx, 58, -46+bob, 24, 17, hit || '#b88a5a', '#3a2a1a', 4);
      ctx.fillStyle = '#fff4d8';
      ctx.beginPath(); ctx.moveTo(62,-58+bob); ctx.lineTo(92,-80+bob); ctx.lineTo(68,-52+bob); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(48,-62+bob); ctx.lineTo(70,-96+bob); ctx.lineTo(56,-58+bob); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(76,-42+bob); ctx.lineTo(90,-46+bob); ctx.lineTo(78,-36+bob); ctx.fill();
      ellipse(ctx, 62, -52+bob, 3, 3, '#111');
    }else{
      ctx.strokeStyle = '#1a3a3a'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(-10,-30+bob); ctx.lineTo(-14,2); ctx.moveTo(10,-30+bob); ctx.lineTo(14,2); ctx.stroke();
      ctx.fillStyle = hit || '#3a8a7a';
      ctx.beginPath(); ctx.moveTo(-20,-44+bob); ctx.lineTo(-64,-30+bob); ctx.lineTo(-20,-30+bob); ctx.closePath(); ctx.fill();
      ellipse(ctx, 0, -46+bob, 26, 22, hit || '#5aaa8a', '#1a3a3a', 4);
      ctx.strokeStyle = '#1a3a3a'; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(10,-60+bob); ctx.lineTo(22,-94+bob); ctx.stroke();
      const open = .5 + .5*Math.sin(t*3+e.x);
      ctx.save(); ctx.translate(24,-100+bob);
      ctx.fillStyle = hit || '#ff5a8a'; ctx.strokeStyle = '#6a1a3a'; ctx.lineWidth = 3;
      for(let i=0;i<7;i++){
        const a = -Math.PI*.9 + i*(Math.PI*.8/6);
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*(22+open*16), Math.sin(a)*(22+open*16)); ctx.lineTo(Math.cos(a+.2)*(22+open*16), Math.sin(a+.2)*(22+open*16)); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ellipse(ctx, 6, 2, 16, 11, hit || '#5aaa8a', '#1a3a3a', 3);
      ellipse(ctx, 10, -1, 3, 3, '#ffdd33');
      ctx.restore();
    }
  }

  else if(world==='sky'){
    if(v===0){
      const flap = Math.sin(t*10+e.x)*.5;
      for(const s of [-1,1]){
        ctx.save(); ctx.translate(s*14,-70+bob); ctx.rotate(s*(-.4+flap));
        ctx.fillStyle = hit || '#8a7ad8'; ctx.strokeStyle = '#3a2a6a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(s*50,-40,s*70,-10); ctx.lineTo(s*56,-2); ctx.lineTo(s*62,8); ctx.lineTo(s*44,6); ctx.lineTo(s*46,16); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.strokeStyle = '#8a6a2a'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-8,-36+bob); ctx.lineTo(-10,0); ctx.lineTo(-18,4); ctx.moveTo(8,-36+bob); ctx.lineTo(10,0); ctx.lineTo(18,4); ctx.stroke();
      ellipse(ctx, 0, -58+bob, 20, 26, hit || '#b8a8f0', '#3a2a6a', 4);
      ellipse(ctx, 0, -92+bob, 16, 16, hit || '#f0d8c0', '#3a2a6a', 4);
      ctx.fillStyle = '#f5c95a';
      ctx.beginPath(); ctx.moveTo(-4,-90+bob); ctx.lineTo(16,-86+bob); ctx.lineTo(-4,-82+bob); ctx.fill();
      enemyEyes(-96+bob, '#ff5a8a', 6);
    }else if(v===1){
      ctx.save();
      ctx.fillStyle = hit || '#f4f6ff';
      ctx.strokeStyle = '#8a92b8'; ctx.lineWidth = 3;
      for(const [dx,dy,r] of [[-26,-40,24],[24,-42,24],[0,-66,32],[-20,-86,20],[20,-88,22],[0,-104,20]]){
        ctx.beginPath(); ctx.arc(dx, dy+bob, r, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
      enemyEyes(-98+bob, '#ffd66b', 9);
      if(Math.sin(t*6+e.x) > .6){
        drawBolt(-30, -50+bob, -46, 0, '#ffd66b', 2);
        drawBolt(30, -50+bob, 46, 0, '#ffd66b', 2);
      }
    }else{
      const fy = -76 + bob + Math.sin(t*3+e.x)*10;
      ctx.save();
      ctx.shadowColor = '#ffd66b'; ctx.shadowBlur = 24;
      ctx.strokeStyle = hit || '#ffe89a'; ctx.lineWidth = 3;
      for(let i=0;i<8;i++){
        const a = i/8*Math.PI*2 + t*2;
        ctx.beginPath(); ctx.moveTo(Math.cos(a)*18, fy+Math.sin(a)*18);
        ctx.lineTo(Math.cos(a+.2)*28, fy+Math.sin(a+.2)*28);
        ctx.lineTo(Math.cos(a)*36, fy+Math.sin(a)*36);
        ctx.stroke();
      }
      const g = ctx.createRadialGradient(0,fy-4,2,0,fy,20);
      g.addColorStop(0,'#ffffff'); g.addColorStop(1, hit || '#ffc83a');
      ellipse(ctx, 0, fy, 18, 18, g, '#a8742a', 3);
      ctx.restore();
      enemyEyes(fy-2, '#5a3a0a', 6);
    }
  }
}

/* ---------- boss decorations (drawn on top of the base boss) ---------- */

function drawBossExtras(world, e, bob){
  const t = G.time;
  ctx.save();

  if(world==='ocean'){
    ctx.fillStyle = '#f5c95a'; ctx.strokeStyle = '#8a6a1a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-30,-122+bob);
    for(let i=0;i<5;i++){ ctx.lineTo(-30+i*15+7, -148+bob); ctx.lineTo(-30+(i+1)*15, -122+bob); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    for(const s of [-1,1]){
      ctx.fillStyle = '#3ad0c0'; ctx.strokeStyle = '#1a5a5a';
      ctx.beginPath(); ctx.moveTo(s*48,-80+bob); ctx.quadraticCurveTo(s*90,-110+bob+Math.sin(t*3)*8,s*84,-50+bob); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  if(world==='candy'){
    const cols = ['#ff6fb5','#7cd4ff','#ffd66b','#a0f0a0','#c79bff'];
    for(let i=0;i<5;i++){
      ellipse(ctx, -36+i*18, -126+bob, 9, 11, cols[i], '#5a2a4f', 2);
    }
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(72,0); ctx.lineTo(72,-120+bob); ctx.stroke();
    ctx.save(); ctx.translate(72,-140+bob); ctx.rotate(t);
    ctx.fillStyle = '#6aff5a'; ctx.beginPath(); ctx.arc(0,0,22,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4;
    ctx.beginPath(); for(let a=0;a<Math.PI*5;a+=.3) ctx.lineTo(Math.cos(a)*a*1.3, Math.sin(a)*a*1.3); ctx.stroke();
    ctx.restore();
  }
  if(world==='frost'){
    ctx.shadowColor = '#bff3ff'; ctx.shadowBlur = 16;
    ctx.fillStyle = '#dff8ff'; ctx.strokeStyle = '#4a8ed0'; ctx.lineWidth = 3;
    for(const [dx,h] of [[-34,34],[-17,48],[0,60],[17,48],[34,34]]){
      ctx.beginPath(); ctx.moveTo(dx-7,-118+bob); ctx.lineTo(dx,-118-h+bob); ctx.lineTo(dx+7,-118+bob); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    for(const s of [-1,1]){
      ctx.beginPath(); ctx.moveTo(s*44,-96+bob); ctx.lineTo(s*70,-130+bob); ctx.lineTo(s*58,-90+bob); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  if(world==='dino'){
    ctx.fillStyle = '#ff9a3c'; ctx.strokeStyle = '#6a3a1a'; ctx.lineWidth = 3;
    for(let i=0;i<5;i++){
      const x = -50 + i*8, y = -110 + i*14 + bob;
      ctx.beginPath(); ctx.moveTo(x-12,y+6); ctx.lineTo(x-28,y-12); ctx.lineTo(x-4,y-4); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = '#fff4d8';
    for(let i=0;i<6;i++){
      ctx.beginPath(); ctx.moveTo(-26+i*10,-74+bob); ctx.lineTo(-21+i*10,-62+bob); ctx.lineTo(-16+i*10,-74+bob); ctx.fill();
    }
  }
  if(world==='sky'){
    const flap = Math.sin(t*4)*.2;
    for(const s of [-1,1]){
      ctx.save(); ctx.translate(s*40,-90+bob); ctx.rotate(s*(-.3+flap));
      ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = '#c8a84a'; ctx.lineWidth = 3;
      for(let f=0;f<4;f++){
        ctx.beginPath(); ctx.ellipse(s*(30+f*14), -10+f*10, 34-f*4, 10, s*(.4+f*.2), 0, Math.PI*2); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    }
    ctx.shadowColor = '#ffd66b'; ctx.shadowBlur = 18;
    ctx.strokeStyle = '#ffd66b'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(0,-136+bob,34,9,0,0,Math.PI*2); ctx.stroke();
  }

  ctx.restore();
}

/* ---------- foreground ---------- */

const NEW_FG = {
  ocean(){
    const t = G.time;
    ctx.save();
    ctx.fillStyle = 'rgba(20,90,160,.12)';
    ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(160,240,255,.08)';
    ctx.lineWidth = 3;
    for(let i=0;i<10;i++){
      ctx.beginPath();
      for(let x=0;x<=W;x+=60){
        const y = 430 + i*28 + Math.sin(x*.015 + t*1.5 + i)*8;
        x ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
      }
      ctx.stroke();
    }
    ctx.restore();
  },
  candy(){
    const cols = ['#ff6fb5','#7cd4ff','#ffd66b','#a0f0a0','#c79bff'];
    for(let x=-10;x<W+40;x+=46){
      ellipse(ctx, x, H+6, 22, 26, cols[Math.abs(Math.round(x/46))%5], 'rgba(80,20,40,.5)', 2);
    }
  },
  frost(){
    const t = G.time;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for(let i=0;i<90;i++){
      const sp = 40 + (i%4)*25;
      const x = ((i*97 + Math.sin(t+i)*30 + t*20) % W + W) % W;
      const y = (i*53 + t*sp) % H;
      ctx.beginPath(); ctx.arc(x, y, 1 + (i%3), 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(240,248,255,.9)';
    for(let x=-30;x<W+60;x+=90){
      ctx.beginPath(); ctx.arc(x, H+10, 40 + (Math.abs(x)%3)*8, Math.PI, 0); ctx.fill();
    }
    ctx.restore();
  },
  dino(){
    ctx.save();
    ctx.fillStyle = 'rgba(20,50,20,.75)';
    for(let x=-20;x<W+40;x+=140){
      for(let k=0;k<4;k++){
        ctx.save(); ctx.translate(x + k*14, H+10); ctx.rotate(-.6 + k*.4);
        ctx.beginPath(); ctx.ellipse(0,-40,10,46,0,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  },
  sky(){
    const t = G.time;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    for(let i=0;i<10;i++){
      const x = ((i*160 + t*25) % (W+200)) - 100;
      ctx.beginPath(); ctx.ellipse(x, H - 10 - (i%3)*14, 90, 22, 0, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
};


/* =========================================================
   15. HOOKING INTO THE GAME
   Each original function is kept and wrapped, so all the
   original behaviour still runs.
   ========================================================= */

const base = {
  getStats, tryAttack, hurtEnemy, killEnemy, completeWorld, spawnEnemy,
  spawnWorldContent, beginWorld, beginHub, playerDefeated, nearestInteraction,
  drawHubCoreMonument, drawWorldBackground, drawProp, drawEnemy,
  drawWorldCreature, drawBossCreature, renderInventory, update, draw,
  saveGame, loadGame, resetGame, collectEasterEgg, interactPickup, addCredits,
  drawForeground, enemyName, worldMaterial, renderJournal, drawRiftwalker
};

// Weapon stats (not applied in the PvP arena, to keep it fair)
window.getStats = function(){
  const s = base.getStats();
  if(P.weapon && G.scene !== 'arena'){
    const w = curWeapon();
    s.atk += w.atk - 20;
    if(w.petScale && activePet()) s.atk += Math.round(petScaledStats(activePet().name).power*w.petScale);
    s.critChance = clamp(s.critChance + (w.crit || 0), .02, .75);
    s.critDamage += w.critDmg || 0;
    s.cooldown = Math.max(.15, s.cooldown*(w.cd || 1));
  }

  // world mechanics
  const m = X.mech;
  if(m && G.scene==='world' && G.worldId===m.kind){
    if(m.kind==='ocean') s.speed = Math.round(s.speed*.88);
    if(m.kind==='candy' && m.rush > 0){
      s.speed = Math.round(s.speed*1.4);
      s.cooldown = Math.max(.12, s.cooldown*.6);
    }
    if(m.kind==='frost') s.speed = Math.round(s.speed*(1 - m.cold/100*.45));
  }

  // role
  if(G.scene !== 'arena'){
    applyPetAbilities(s);
    applyRole(s);
  }
  return s;
};

// Attack with weapon range, parries and hammer shockwaves
window.tryAttack = function(){
  if(G.paused || isOverlayOpen() || !['world','hub','arena'].includes(G.scene) ||
     !P.weapon || P.attackCooldown > 0) return;

  const s = getStats();
  const w = G.scene==='arena' ? WEAPONS.nova : curWeapon();

  P.attackCooldown = s.cooldown;
  P.attackTimer = .25;
  P.attackIndex = P.comboTimer > 0 ? (P.attackIndex+1)%3 : 0;
  P.comboTimer = .8;
  SFX.swing();

  const range = (P.attackIndex===2 ? 125 : 92)*(w.range || 1)*(G.scene==='arena' ? 1 : (curRole().range || 1));
  const baseDamage = Math.round(s.atk*(P.attackIndex===2 ? 1.45 : 1)*rand(.9,1.1));

  burst(P.x + P.facing*55, P.y-75, w.color, 5);

  if(G.scene==='arena'){
    const critical = rollCritical(s);
    arenaLocalAttack(range, Math.round(baseDamage*(critical ? s.critDamage : 1)), critical);
    return;
  }

  // ranged and thrown weapons fire a projectile instead of swinging
  if(w.ranged){
    fireWeapon(w, s, baseDamage);
    return;
  }

  // parry enemy shots
  for(const p of X.proj){
    const dx = (p.x-P.x)*P.facing;
    if(dx > -30 && dx < range && Math.abs(p.y-P.y) < 70){
      p.life = 0;
      X.data.parries++;
      burst(p.x, p.y-p.h, '#ffffff', 8);
      floatingText('PARRY', p.x, p.y-p.h-20, '#ffffff');
      SFX.tone(1200,.08,'triangle',.05,1.4);
    }
  }

  const arcY = w.key==='scythe' ? 115 : 85;

  // Training dummies in The Hub
  if(G.scene==='hub'){
    for(const d of X.dummies){
      const dx = (d.x-P.x)*P.facing;
      if(dx > -35 && dx < range && Math.abs(d.y-P.y) < arcY){
        const critical = rollCritical(s);
        const dmg = Math.round(baseDamage*(critical ? s.critDamage : 1));
        hitDummy(d, dmg, critical);
        if(w.twin) hitDummy(d, Math.round(dmg*.5), false);
        if(w.pixel) burst(d.x, d.y-80, ['#6cff8a','#72e6ff','#ffe38d'][randi(0,2)], 8);
      }
    }
    return;
  }
  let hit = false;

  for(const e of G.enemies){
    if(!e.alive || e.world!==G.worldId) continue;
    const dx = (e.x-P.x)*P.facing;
    if(dx > -35 && dx < range && Math.abs(e.y-P.y) < arcY){
      const critical = rollCritical(s);
      const dmg = Math.round(baseDamage*(critical ? s.critDamage : 1));
      hurtEnemy(e, dmg, critical);
      if(w.twin && e.alive) hurtEnemy(e, Math.round(dmg*.5), false);
      if(w.pixel) burst(e.x, e.y-50, ['#6cff8a','#72e6ff','#ffe38d'][randi(0,2)], 8);
      if(w.rainbow) burst(e.x, e.y-50, ['#ff6175','#ffd66b','#6ee0a0','#72e6ff','#9b72ff'][randi(0,4)], 6);
      if(w.burn && e.alive) e.burn = {t:3, tick:.5, dmg:Math.max(1, Math.round(dmg*w.burn))};
      if(w.pull && e.alive && !e.boss) e.x += (P.x + P.facing*45 - e.x)*.5;
      if(curRole().leech || petAbilityLevel('drain')){
        const st = getStats();
        const pct = (curRole().leech || 0) + petAbilityLevel('drain')*.02;
        P.hp = Math.min(st.maxHP, P.hp + Math.max(1, Math.round(dmg*pct)));
      }
      if(e.alive && !e.boss){
        if(w.key==='hammer') e.x += P.facing*40;
        if(w.knock) e.x += P.facing*w.knock;
      }
      if(w.freeze && e.alive){
        e.attackCd = Math.max(e.attackCd, w.freeze);
        e.frozen = 1.2;
      }
      if(critical && w.critHeal){
        const st = getStats();
        P.hp = Math.min(st.maxHP, P.hp + Math.round(st.maxHP*w.critHeal));
      }
      if(critical && w.chain){
        for(const o of G.enemies){
          if(o!==e && o.alive && o.world===G.worldId && Math.hypot(o.x-e.x, o.y-e.y) < 230){
            hurtEnemy(o, Math.round(dmg*w.chain), false);
            X.bolts.push({x:o.x, y:o.y, t:.25});
          }
        }
        X.bolts.push({x:e.x, y:e.y, t:.25});
      }
      hit = true;
    }
  }

  if(w.gravity && P.attackIndex===2 && G.scene==='world'){
    for(const e of G.enemies){
      if(e.alive && e.world===G.worldId && !e.boss && Math.hypot(e.x-P.x, e.y-P.y) < 340){
        e.x += (P.x + P.facing*50 - e.x)*.6;
        e.y += (P.y - e.y)*.5;
      }
    }
    burst(P.x + P.facing*50, P.y-50, '#a478ff', 22);
  }

  if(w.shock && P.attackIndex===2 && G.scene==='world'){
    X.waves.push({friendly:true, x:P.x+P.facing*40, y:P.y, r:10, max:240, speed:520,
      dmg:Math.round(s.atk*.8), hit:new Set()});
    G.screenShake = Math.max(G.screenShake, 10);
    SFX.noise(.2,.1,400);
  }

  if(hit) G.screenShake = Math.max(G.screenShake, P.attackIndex===2 ? 8 : 4);
};

window.hurtEnemy = function(e, dmg, critical=false){
  if(critical) X.data.crits++;
  base.hurtEnemy(e, dmg, critical);
};

window.killEnemy = function(e){
  // Trial Champion: no world completion, custom reward
  if(e.world==='trials' && e.boss){
    e.alive = false;
    burst(e.x, e.y-45, '#ffb347', 26);
    burst(e.x, e.y-45, '#ffffff', 14);
    X.data.kills++;
    X.data.bossKills++;
    addCredits(150 + T.wave*30, e.x, e.y);
    gainXP(120 + T.wave*10);
    dropOrb(e.x, e.y);
    MUSIC.endBoss();
    MUSIC.stinger('victory');
    SFX.core();
    return;
  }

  base.killEnemy(e);

  X.data.kills++;
  const idx = Math.max(0, WORLD_ORDER.indexOf(e.world));
  const w = curWeapon();

  if(!e.boss){
    gainXP((14 + idx*4)*(e.elite ? 3 : 1));
    if(w.bonusCredits && P.weapon) addCredits(Math.round(randi(6,18)*w.bonusCredits), e.x, e.y-20);
    if(e.elite) addCredits(40 + idx*15, e.x, e.y);
    if(e.elite || Math.random() < .16) dropOrb(e.x, e.y);
  }

  if(w.lifesteal && P.weapon){
    const s = getStats();
    P.hp = Math.min(s.maxHP, P.hp + Math.round(s.maxHP*w.lifesteal));
  }

  if(X.mech?.kind==='candy' && e.world==='candy' && Math.random() < .45){
    X.mech.items.push({x:e.x, y:e.y, cd:0, t:0, hue:randi(0,4), temp:true});
  }

  bountyKill(e);
};

window.completeWorld = function(id){
  const was = G.completed.has(id);
  base.completeWorld(id);
  if(!was){
    X.data.bossKills++;
    gainXP(260 + WORLD_ORDER.indexOf(id)*40);
    clearCombat();
    MUSIC.stinger('victory');
    saveExt();
  }
};

window.spawnEnemy = function(world, x, y, boss=false){
  base.spawnEnemy(world, x, y, boss);
  const e = G.enemies[G.enemies.length-1];
  if(!e) return;

  if(world==='trials'){
    e.skin = WORLD_ORDER[randi(0, WORLD_ORDER.length-1)];
    if(boss) e.name = 'Trial Champion';
  }

  if(boss){
    e.specialCd = 2.5;
    e.charge = 0;
    return;
  }

  const idx = Math.max(0, WORLD_ORDER.indexOf(world));
  if(Math.random() < .12){
    e.elite = true;
    e.maxHP = e.hp = Math.round(e.hp*2.4);
    e.damage = Math.round(e.damage*1.3);
    e.name = 'Elite '+(e.name || 'Creature');
  }else if((idx >= 1 || world==='trials') && Math.random() < .3){
    e.ranged = true;
    e.shootCd = rand(1.2,2.6);
  }
};

window.spawnWorldContent = function(id){
  if(id==='trials'){
    G.pickups.push({kind:'portal', x:230, y:520, taken:false});
    return;
  }
  base.spawnWorldContent(id);
};

window.beginWorld = function(id){
  ensureProgress();
  clearCombat();
  X.bolts.length = 0;
  X.mech = null;
  base.beginWorld(id);
  restoreWeaponName();

  if(id==='trials'){
    Object.assign(T, {wave:0, toSpawn:0, spawnCd:0, inter:2.5, cleared:true, total:1});
    quest('RIFT TRIALS', 'Survive endless waves. Leave through the portal at any time.');
    toast('RIFT TRIALS', 'Survive as many waves as you can. Dash or jump to dodge shots.', 3);
  }else{
    const b = X.data.bounty;
    if(!b || b.world!==id || b.done) newBounty(id);
    setupMechanic(id);
  }
};

window.beginHub = function(){
  clearCombat();
  X.mech = null;
  base.beginHub();
  restoreWeaponName();
};

window.playerDefeated = function(){
  clearCombat();
  if(G.scene==='world' && G.worldId==='trials'){
    endTrials();
    return;
  }
  if(G.scene==='world') MUSIC.stinger('fail');
  base.playerDefeated();
};

window.nearestInteraction = function(){
  const n = base.nearestInteraction();
  const options = n ? [n] : [];

  if(G.scene==='hub'){
    const d = Math.hypot(P.x-TRIAL_GATE.x, P.y-TRIAL_GATE.y);
    options.push({x:TRIAL_GATE.x, y:TRIAL_GATE.y, label:'ENTER RIFT TRIALS', fn:enterTrials, d});
  }
  options.push(...crewInteractions());

  return options.sort((a,b) => a.d - b.d)[0] || null;
};

window.drawHubCoreMonument = function(x, y){
  base.drawHubCoreMonument(x, y);
  drawTrialGate();
  drawHubCrew();
};

window.drawWorldBackground = function(w, cam){
  if(G.worldId==='trials') return drawTrialsBg(w, cam);
  base.drawWorldBackground(w, cam);
  if(NEW_BG[G.worldId]) NEW_BG[G.worldId](cam);
};

window.drawProp = function(type, x, y, cam, world){
  if(world==='trials') return drawTrialProp(type, x, y, cam);
  if(NEW_WORLDS[world]) return drawNewProp(type, x, y, cam, world);
  base.drawProp(type, x, y, cam, world);
};

window.drawForeground = function(w){
  base.drawForeground(w);
  if(NEW_FG[G.worldId]) NEW_FG[G.worldId]();
};

window.enemyName = function(world, v=0){
  if(NEW_WORLDS[world]) return NEW_WORLDS[world].enemies[v%3];
  return base.enemyName(world, v);
};

window.worldMaterial = function(id){
  return NEW_WORLDS[id]?.material || base.worldMaterial(id);
};

window.renderJournal = function(){
  base.renderJournal();
  const found = petCount(), total = totalPets();
  $('journalSummary').textContent =
    `PET DISCOVERY: ${found} / ${total} · ${Math.round(found/total*100)}% · HIDDEN SECRETS: ${G.easterEggs.size} / ${EASTER_TOTAL}` +
    (X.data.fusions ? ` · FUSIONS: ${X.data.fusions}` : '');

  // Pets used up in fusions still count as discovered
  const blocks = document.querySelectorAll('#journalGrid .journalWorld');
  WORLD_ORDER.forEach((id, wi) => {
    const block = blocks[wi];
    if(!block) return;
    const spans = block.querySelectorAll('.journalNames span');
    const seen = G.progress[id]?.petFound || [];
    (PET_ROSTERS[id] || []).forEach((name, i) => {
      const s = spans[i];
      if(s && seen.includes(name)){
        s.className = 'found';
        s.textContent = name;
      }
    });
  });
};

window.drawWorldCreature = function(e, bob){
  const real = e.world==='trials' ? (e.skin || 'war') : e.world;
  if(NEW_WORLDS[real]) return drawNewCreature(e, bob, real);
  const w = e.world;
  e.world = real;
  base.drawWorldCreature(e, bob);
  e.world = w;
};

window.drawBossCreature = function(e, bob){
  const real = e.world==='trials' ? (e.skin || 'war') : e.world;
  const w = e.world;
  e.world = real;
  base.drawBossCreature(e, bob);
  if(NEW_WORLDS[real]) drawBossExtras(real, e, bob);
  e.world = w;
};

window.drawEnemy = function(e, cam){
  const x = e.x-cam, y = e.y;

  if(e.elite){
    ctx.save();
    const g = ctx.createRadialGradient(x, y-45, 5, x, y-45, 70);
    g.addColorStop(0, 'rgba(255,215,110,.35)');
    g.addColorStop(1, 'rgba(255,215,110,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y-45, 70, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  if(e.charge > 0){
    ctx.save();
    const p = 1 - e.charge/.75;
    ctx.strokeStyle = '#ff4f6a';
    ctx.shadowColor = '#ff4f6a';
    ctx.shadowBlur = 16;
    ctx.globalAlpha = .4 + .5*p;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x, y+6, 60+p*70, (60+p*70)*.35, 0, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  base.drawEnemy(e, cam);

  if(e.frozen > 0){
    ctx.save();
    ctx.globalAlpha = .45*Math.min(1, e.frozen);
    ctx.fillStyle = '#bff3ff';
    ctx.shadowColor = '#bff3ff';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.ellipse(x, y-48, e.boss ? 80 : 46, e.boss ? 90 : 52, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  if(e.elite){
    ctx.save();
    ctx.translate(x, y-(e.boss ? 175 : 124));
    ctx.rotate(Math.PI/4);
    ctx.shadowColor = '#ffe38d';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffe38d';
    ctx.fillRect(-5,-5,10,10);
    ctx.restore();
  }

  if(e.ranged){
    ctx.save();
    const bob = Math.sin(G.time*5 + e.x)*4;
    const c = worldColor(e);
    ctx.shadowColor = c;
    ctx.shadowBlur = 14;
    ctx.translate(x - 32, y - 92 + bob);
    ctx.rotate(G.time*2);
    ctx.fillStyle = c;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0,-9); ctx.lineTo(8,0); ctx.lineTo(0,9); ctx.lineTo(-8,0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  if(e.charge > 0){
    ctx.save();
    ctx.fillStyle = '#ff4f6a';
    ctx.font = '900 30px system-ui';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff4f6a';
    ctx.shadowBlur = 14;
    ctx.fillText('!', x, y-(e.boss ? 200 : 140));
    ctx.restore();
  }
};

window.renderInventory = function(){
  base.renderInventory();
  renderWeapons();
  renderRoleSection();
};

window.update = function(dt){
  base.update(dt);
  if(G.paused) return;

  if(X.toasts.length && G.messageTime <= .2){
    const [a,b,c] = X.toasts.shift();
    toast(a,b,c);
  }

  const inWorld = G.scene==='world', inHub = G.scene==='hub';
  if(inWorld || inHub) X.data.playTime += dt;

  // role + pet abilities
  if(inWorld || inHub){
    const r = curRole();
    const regenRate = (r.regen || 0) + petAbilityLevel('regen')*.004;
    if(regenRate > 0 && P.hp > 0){
      const mx = getStats().maxHP;
      X.hpAcc = (X.hpAcc || 0) + mx*regenRate*dt;
      const whole = Math.floor(X.hpAcc);
      if(whole > 0){
        X.hpAcc -= whole;
        P.hp = Math.min(mx, P.hp + whole);
      }
    }
    const petBoost = (r.petSpeed ? r.petSpeed-1 : 0) + petAbilityLevel('rapid')*.3;
    if(petBoost > 0){
      const ap = activePet();
      if(ap) ap.attackCd = (ap.attackCd || 0) - dt*petBoost;
    }
    if(r.dash && P.dashCooldown > 0){
      P.dashCooldown = Math.max(0, P.dashCooldown - dt*(r.dash-1));
    }
  }

  if(inWorld){
    updateRanged(dt);
    updateBosses(dt);
    updateProjectiles(dt);
    updateWaves(dt);
    updateOrbs(dt);
    updateMechanic(dt);
    for(const e of G.enemies) if(e.frozen > 0) e.frozen -= dt;
    for(const b of X.bolts) b.t -= dt;
    X.bolts = X.bolts.filter(b => b.t > 0);
    if(G.worldId==='trials') updateTrials(dt);
  }

  updateHudExtras();
  updateMechHud();
  updateRoleHud();

  X.achTimer = (X.achTimer || 0) - dt;
  if(X.achTimer <= 0 && (inWorld || inHub)){
    X.achTimer = .5;
    checkAchievements();
  }
};

window.draw = function(){
  base.draw();
  extDraw();
  if(G.scene==='world') drawMechanic(G.camera);
};

window.saveGame = function(){
  base.saveGame();
  saveExt();
};

window.loadGame = function(){
  const ok = base.loadGame();
  if(ok){
    registerFusedPets();
    loadExt();
    ensureProgress();
    restoreWeaponName();
    syncHUD();
  }
  return ok;
};

window.resetGame = function(){
  X.data = freshData();
  X.data.role = X.pendingRole || 'astronaut';
  clearCombat();
  X.mech = null;
  base.resetGame();
  P.hp = getStats().maxHP;
};

window.collectEasterEgg = function(egg){
  const had = !egg || G.easterEggs.has(egg.id);
  base.collectEasterEgg(egg);
  if(!had) MUSIC.stinger('secret');
};

window.interactPickup = function(p){
  const kind = p.kind;
  base.interactPickup(p);
  if(kind==='pet') MUSIC.stinger('pet');
};

window.addCredits = function(n, x, y){
  if(G.scene==='world' || G.scene==='hub') n *= (curRole().loot || 1)*(1 + petAbilityLevel('lucky')*.15);
  X.data.creditsEarned += Math.max(0, Math.round(n));
  base.addCredits(n, x, y);
};

/* =========================================================
   16. ROLES
   Chosen when starting a New Game. Can be changed at The Hub
   from the Inventory (I).
   ========================================================= */

const ROLES = {
  astronaut:{
    name:'Astronaut', color:'#72e6ff',
    desc:'Balanced in every stat. A reliable all-rounder.',
    hp:1, atk:1, def:1, speed:1, cd:1, crit:0, critDmg:0
  },
  adventurer:{
    name:'Adventurer', color:'#6ee0a0',
    desc:'Very fast movement and quick attacks, but lower HP.',
    hp:.78, atk:1, def:.9, speed:1.25, cd:.72, crit:0, critDmg:0
  },
  guardian:{
    name:'Guardian', color:'#ffb65d',
    desc:'Huge HP and defense. Moves and swings more slowly.',
    hp:1.4, atk:.95, def:1.5, speed:.86, cd:1.15, crit:0, critDmg:0
  },
  ninja:{
    name:'Ninja', color:'#c79bff',
    desc:'High critical chance and critical damage. A little fragile.',
    hp:.88, atk:.95, def:.9, speed:1.12, cd:.9, crit:.12, critDmg:.5
  },
  berserker:{
    name:'Berserker', color:'#ff6175',
    desc:'Massive attack power, but low defense.',
    hp:1.05, atk:1.35, def:.7, speed:1, cd:1.05, crit:.03, critDmg:0
  },
  medic:{
    name:'Medic', color:'#7dffb0',
    desc:'Weaker attacks, but heals over time.',
    perk:'Regenerates 1.5% HP every second.',
    hp:1.05, atk:.85, def:1, speed:1, cd:1, crit:0, critDmg:0, regen:.015
  },
  engineer:{
    name:'Engineer', color:'#ffd66b',
    desc:'Tough and clever. Pets become far more dangerous.',
    perk:'Your pet attacks twice as fast.',
    hp:1.1, atk:.9, def:1.15, speed:.95, cd:1, crit:0, critDmg:0, petSpeed:2
  },
  hunter:{
    name:'Treasure Hunter', color:'#f2b84b',
    desc:'Always finds more loot than everyone else.',
    perk:'+50% Rift Credits and +50% XP.',
    hp:.95, atk:.92, def:.95, speed:1.08, cd:1, crit:.02, critDmg:0, loot:1.5
  },
  vampire:{
    name:'Vampire', color:'#c0304a',
    desc:'Fragile, but steals life with every strike.',
    perk:'Heals 8% of the damage you deal.',
    hp:.75, atk:1.12, def:.85, speed:1.08, cd:.95, crit:.05, critDmg:.2, leech:.08
  },
  mage:{
    name:'Rift Mage', color:'#9b72ff',
    desc:'Attacks reach much farther. Low defense.',
    perk:'+45% attack range.',
    hp:.9, atk:1.1, def:.75, speed:1, cd:1.05, crit:.04, critDmg:0, range:1.45
  },
  speedster:{
    name:'Speedster', color:'#5af3ef',
    desc:'The fastest Riftwalker alive. Very low HP.',
    perk:'Dash recharges twice as fast.',
    hp:.68, atk:.95, def:.8, speed:1.45, cd:.8, crit:.03, critDmg:0, dash:2
  }
};

function curRole(){
  return ROLES[X.data.role] || ROLES.astronaut;
}

function applyRole(s){
  const r = curRole();
  s.maxHP = Math.round(s.maxHP*r.hp);
  s.atk = Math.round(s.atk*r.atk);
  s.def = Math.round(s.def*r.def);
  s.speed = Math.round(clamp(s.speed*r.speed, 140, 460));
  s.cooldown = Math.max(.12, s.cooldown*r.cd);
  s.critChance = clamp(s.critChance + (r.crit || 0), .02, .8);
  s.critDamage += r.critDmg || 0;
}

const roleStyle = document.createElement('style');
roleStyle.textContent = `
.roleGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
.roleCard{text-align:left}
.roleCard canvas{display:block;margin:0 auto 4px;width:90px;height:90px}
.roleCard h4{font-size:13px!important}
.roleBars{display:grid;gap:4px;margin:8px 0 2px}
.roleBars div{display:grid;grid-template-columns:54px 1fr;align-items:center;gap:6px;font-size:7px;letter-spacing:.12em;color:#8ea0b8}
.roleBars span{height:5px;border-radius:99px;background:#07101e;overflow:hidden;display:block}
.roleBars i{display:block;height:100%;border-radius:inherit}
#roleSection{margin-bottom:22px}
#roleSection .itemCard{display:flex;align-items:center;gap:14px}
#roleSection .itemCard > div{flex:1}
#roleSection .itemCard button{width:auto;margin-top:0}
`;
document.head.appendChild(roleStyle);

$('gameShell').insertAdjacentHTML('beforeend', `
  <section id="roleOverlay" class="overlay hidden">
    <div class="panel widePanel">
      <header>
        <div><small>RIFTWALKER PROTOCOL</small><h2 id="roleHeading">Choose Your Role</h2></div>
        <button id="roleClose" class="closeBtn">BACK</button>
      </header>
      <p class="panelNote" id="roleNote">Each role changes your stats. You can switch roles later at The Hub.</p>
      <div id="roleGrid" class="roleGrid"></div>
    </div>
  </section>`);

let roleMode = 'new';

function openRolePicker(mode){
  roleMode = mode;
  openOverlay('roleOverlay', renderRoles);
}

$('roleClose').onclick = () => closeOverlay('roleOverlay');

function roleBar(label, value, color){
  return `<div>${label}<span><i style="width:${clamp(value/1.5,0,1)*100}%;background:${color}"></i></span></div>`;
}

function renderRoles(){
  $('roleHeading').textContent = roleMode==='new' ? 'Choose Your Role' : 'Crew Roles';
  $('roleNote').textContent = 'Rescued crew: '+X.data.crew.length+' / 10. '+
    'Locked roles belong to crew members lost in other worlds. Your health percentage is kept when you switch.';
  const grid = $('roleGrid');
  grid.innerHTML = '';

  for(const [key,r] of Object.entries(ROLES)){
    const current = roleMode==='switch' && X.data.role===key;
    const unlocked = isRoleUnlocked(key);
    const crew = CREW[key];
    const card = document.createElement('div');
    card.className = 'itemCard roleCard'+(current ? ' selected' : '')+(unlocked ? '' : ' locked');
    card.style.borderColor = current ? r.color : '';

    const cv = document.createElement('canvas');
    cv.width = 90; cv.height = 90;
    card.appendChild(cv);

    const who = key==='astronaut' ? 'You · the Captain' : crew.name+(unlocked ? ' · rescued' : '');
    const lockText = unlocked ? '' :
      `<p class="lockNote">LOST IN ${WORLDS[crew.world].name.toUpperCase()}. Rescue ${crew.name} to unlock.</p>`;

    card.insertAdjacentHTML('beforeend', `
      <h4 style="color:${r.color}">${r.name.toUpperCase()}</h4>
      <p style="color:#dbe7f5">${who}</p>
      <p>${r.desc}</p>
      ${r.perk ? `<p style="color:${r.color};margin-top:4px">ABILITY: ${r.perk}</p>` : ''}
      ${lockText}
      <div class="roleBars">
        ${roleBar('HP', r.hp, r.color)}
        ${roleBar('ATTACK', r.atk, r.color)}
        ${roleBar('DEFENSE', r.def, r.color)}
        ${roleBar('SPEED', r.speed, r.color)}
        ${roleBar('SWING', 1/r.cd, r.color)}
        ${roleBar('CRIT', 1 + (r.crit||0)*4 + (r.critDmg||0), r.color)}
      </div>`);

    const btn = document.createElement('button');
    btn.textContent = !unlocked ? 'LOCKED' : current ? 'CURRENT ROLE' : 'SWITCH TO '+r.name.toUpperCase();
    btn.disabled = current || !unlocked;
    btn.onclick = () => pickRole(key);
    card.appendChild(btn);
    grid.appendChild(card);

    const c = cv.getContext('2d');
    const g = c.createRadialGradient(45,50,4,45,50,44);
    g.addColorStop(0, r.color+'66');
    g.addColorStop(1, r.color+'00');
    c.fillStyle = g;
    c.fillRect(0,0,90,90);
    c.strokeStyle = r.color;
    c.lineWidth = 2;
    c.beginPath(); c.ellipse(45,80,26,7,0,0,Math.PI*2); c.stroke();
    drawMiniRiftwalker(c, 45, 78, .55);
    if(!unlocked){
      c.fillStyle = 'rgba(4,8,18,.55)';
      c.fillRect(0,0,90,90);
      drawLockIcon(c, 45, 44);
    }
  }
}

function drawLockIcon(c, x, y){
  c.save();
  c.strokeStyle = '#cfd8e6';
  c.lineWidth = 4;
  c.beginPath(); c.arc(x, y-6, 9, Math.PI, 0); c.stroke();
  c.fillStyle = '#cfd8e6';
  c.fillRect(x-13, y-6, 26, 20);
  c.fillStyle = '#1a2234';
  c.fillRect(x-2, y, 4, 8);
  c.restore();
}

function pickRole(key){
  SFX.click();
  if(roleMode==='new'){
    X.pendingRole = key;
    closeOverlay('roleOverlay');
    resetGame();
    return;
  }
  const old = getStats().maxHP;
  X.data.role = key;
  preserveHealthForStatChange(old, getStats().maxHP);
  saveExt();
  toast('ROLE CHANGED', 'You are now a '+ROLES[key].name+'.', 2.4);
  MUSIC.stinger('levelup');
  closeOverlay('roleOverlay');
  syncHUD();
}

function renderRoleSection(){
  let box = $('roleSection');
  if(!box){
    const anchor = $('weaponSection');
    if(!anchor) return;
    box = document.createElement('div');
    box.id = 'roleSection';
    anchor.parentNode.insertBefore(box, anchor);
  }
  const r = curRole();
  const inHub = G.scene==='hub';
  box.innerHTML = `<h3>Role</h3>
    <div class="itemCard selected" style="border-color:${r.color}">
      <div><h4 style="color:${r.color}">${r.name.toUpperCase()}</h4><p>${r.desc}</p>${r.perk ? `<p style="color:${r.color}">ABILITY: ${r.perk}</p>` : ''}</div>
    </div>`;
  const btn = document.createElement('button');
  btn.textContent = inHub ? 'CHANGE ROLE' : 'CHANGE AT THE HUB';
  btn.disabled = !inHub;
  btn.onclick = () => openRolePicker('switch');
  box.querySelector('.itemCard').appendChild(btn);
}

let lastRoleHud = '';
function updateRoleHud(){
  const r = curRole();
  if(lastRoleHud === r.name) return;
  lastRoleHud = r.name;
  const el = document.querySelector('.nameRow strong');
  if(el){
    el.textContent = r.name.toUpperCase();
    el.style.color = r.color;
  }
}

window.drawRiftwalker = function(x, y, scale=1, remote=false){
  if(!remote && (G.scene==='world' || G.scene==='hub')){
    const r = curRole();
    ctx.save();
    ctx.globalAlpha = .6;
    ctx.strokeStyle = r.color;
    ctx.shadowColor = r.color;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y + P.jump + 8, 38*scale, 11*scale, 0, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }
  base.drawRiftwalker(x, y, scale, remote);
};

/* =========================================================
   17. THE LOST CREW
   The crash scattered 10 crew members across the worlds.
   Each one unlocks a role when rescued.
   ========================================================= */

const CREW = {
  adventurer:{name:'Rio',      world:'earth',  line:'Captain! I thought nobody else survived the crash.'},
  speedster: {name:'Zip',      world:'music',  line:'The Silence King tried to stop me moving. Nobody stops me.'},
  hunter:    {name:'Goldie',   world:'money',  line:'I found treasure... and then the treasure found me. Thanks, Captain.'},
  mage:      {name:'Orion',    world:'cosmos', line:'The stars kept whispering you would come. They were right.'},
  guardian:  {name:'Brick',    world:'war',    line:'I held this position for days. Ready to hold the next one.'},
  vampire:   {name:'Nyx',      world:'void',   line:'The dark was quiet. Too quiet. Take me home.'},
  engineer:  {name:'Bolt',     world:'matrix', line:'This reality has so many bugs. I can fix our ship instead.'},
  medic:     {name:'Dr. Mira', world:'ocean',  line:'I was almost out of air. Let me patch up the crew.'},
  ninja:     {name:'Kage',     world:'frost',  line:'I stayed hidden in the snow. You nearly walked past me.'},
  berserker: {name:'Tora',     world:'dino',   line:'These dinosaurs picked the wrong crew member to chase!'}
};

const CREW_SPOT = {x:2620, y:470};
// Crew Village plots in the expanded Hub (one house per crew member)
const HOUSE_X = Array.from({length:10}, (_,i) => 1390 + i*145);
const HOUSE_SCALE = 1.15;

const crewStyle = document.createElement('style');
crewStyle.textContent = `
.roleCard.locked{opacity:.62}
.roleCard.locked h4{filter:saturate(.3)}
.lockNote{color:#ffcf8a!important;margin-top:5px!important;font-weight:800}
.crewNote{margin-top:6px!important;font-weight:800}
`;
document.head.appendChild(crewStyle);

function isRoleUnlocked(key){
  return key==='astronaut' || X.data.crew.includes(key);
}

function crewInWorld(id){
  const key = Object.keys(CREW).find(k => CREW[k].world===id);
  return key ? {key, ...CREW[key]} : null;
}

function rescueCrew(key){
  if(X.data.crew.includes(key)) return;
  const c = CREW[key], r = ROLES[key];
  X.data.crew.push(key);
  X.beams.push({x:CREW_SPOT.x, y:CREW_SPOT.y, t:1.2, color:r.color});
  burst(CREW_SPOT.x, CREW_SPOT.y-50, r.color, 28);
  burst(CREW_SPOT.x, CREW_SPOT.y-50, '#ffffff', 14);
  G.screenShake = Math.max(G.screenShake, 6);
  MUSIC.stinger('victory');
  toast('CREW RESCUED · '+X.data.crew.length+' / 10',
    c.name+': "'+c.line+'"  NEW ROLE UNLOCKED: '+r.name.toUpperCase()+'.', 5.5);
  if(X.data.crew.length===1){
    extToast('THE BUILDER',
      c.name+' will build the Crew Village. Each time you leave The Hub for a world, new houses get built for rescued crew.', 5);
  }else{
    extToast('CREW', c.name+' is heading to The Hub. '+builderName()+' will build their house next time you leave for a world.', 4.5);
  }
  saveExt();
}

function builderName(){
  return X.data.crew.length ? CREW[X.data.crew[0]].name : 'Your first crew member';
}

function crewInteractions(){
  const out = [];

  if(G.scene==='world'){
    const c = crewInWorld(G.worldId);
    if(c && !X.data.crew.includes(c.key)){
      out.push({
        x:CREW_SPOT.x, y:CREW_SPOT.y,
        label:'RESCUE '+c.name.toUpperCase(),
        fn:() => rescueCrew(c.key),
        d:Math.hypot(P.x-CREW_SPOT.x, P.y-CREW_SPOT.y)
      });
    }
  }

  if(G.scene==='hub'){
    Object.keys(CREW).forEach((key,i) => {
      if(!X.data.houses.includes(key)) return;
      const x = HOUSE_X[i], y = 520;
      out.push({
        x, y,
        label:'VISIT '+CREW[key].name.toUpperCase()+"'S HOUSE",
        fn:() => {
          toast(CREW[key].name.toUpperCase(), 'Welcome in, Captain! Need a different role? Pick any crew member you have rescued.', 3);
          openRolePicker('switch');
        },
        d:Math.hypot(P.x-x, P.y-y)
      });
    });
  }

  return out;
}

function drawCrewMember(x, y, key, scale=.5, bobSeed=0){
  const r = ROLES[key];
  const bob = Math.sin(G.time*3 + bobSeed)*2;
  shadow(x, y+4, 42*scale*2, 10*scale*2, .3);
  ctx.save();
  ctx.globalAlpha = .7;
  ctx.strokeStyle = r.color;
  ctx.shadowColor = r.color;
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(x, y+4, 40*scale, 11*scale, 0, 0, Math.PI*2);
  ctx.stroke();
  ctx.restore();
  drawMiniRiftwalker(ctx, x, y + bob, scale);
  // role-coloured scarf band so each crew member looks different
  ctx.save();
  ctx.fillStyle = r.color;
  ctx.fillRect(x - 22*scale, y - 58*scale + bob, 44*scale, 7*scale);
  ctx.restore();
}

function drawNameTag(x, y, text, color){
  ctx.save();
  ctx.font = '900 10px system-ui';
  const w = ctx.measureText(text).width + 14;
  rr(ctx, x - w/2, y - 13, w, 18, 7, 'rgba(6,12,24,.85)', color, 1.5);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
  ctx.restore();
}

/* ---------- Crew Village (houses built while you are away) ---------- */

function drawRoleEmblem(key, x, y){
  const r = ROLES[key];
  ctx.save();
  ctx.translate(x, y);
  ellipse(ctx, 0, 0, 13, 13, '#f6f1df', r.color, 3);
  ctx.fillStyle = r.color;
  ctx.strokeStyle = r.color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  switch(key){
    case 'adventurer':
      ctx.beginPath(); ctx.moveTo(-4,7); ctx.lineTo(-4,-7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-3,-7); ctx.lineTo(7,-4); ctx.lineTo(-3,0); ctx.closePath(); ctx.fill();
      break;
    case 'speedster':
      ctx.beginPath(); ctx.moveTo(2,-8); ctx.lineTo(-5,1); ctx.lineTo(1,1); ctx.lineTo(-2,8); ctx.lineTo(6,-2); ctx.lineTo(0,-2); ctx.closePath(); ctx.fill();
      break;
    case 'hunter':
      ellipse(ctx, 0, 0, 7, 7, r.color);
      ctx.fillStyle = '#f6f1df'; ctx.fillRect(-1,-4,2,8);
      break;
    case 'mage':
      ctx.beginPath();
      for(let i=0;i<10;i++){
        const a = -Math.PI/2 + i*Math.PI/5, rad = i%2 ? 3.5 : 8;
        i ? ctx.lineTo(Math.cos(a)*rad, Math.sin(a)*rad) : ctx.moveTo(Math.cos(a)*rad, Math.sin(a)*rad);
      }
      ctx.closePath(); ctx.fill();
      break;
    case 'guardian':
      ctx.beginPath(); ctx.moveTo(-7,-7); ctx.lineTo(7,-7); ctx.lineTo(6,2); ctx.lineTo(0,8); ctx.lineTo(-6,2); ctx.closePath(); ctx.fill();
      break;
    case 'vampire':
      ctx.beginPath(); ctx.arc(0,0,8,.9,Math.PI*2-.9); ctx.arc(4,0,6,Math.PI*2-1.1,1.1,true); ctx.closePath(); ctx.fill();
      break;
    case 'engineer':
      for(let i=0;i<8;i++){ ctx.save(); ctx.rotate(i*Math.PI/4); ctx.fillRect(-2,-9,4,4); ctx.restore(); }
      ellipse(ctx, 0, 0, 6, 6, r.color); ellipse(ctx, 0, 0, 2.5, 2.5, '#f6f1df');
      break;
    case 'medic':
      ctx.fillRect(-2.5,-8,5,16); ctx.fillRect(-8,-2.5,16,5);
      break;
    case 'ninja':
      for(let i=0;i<4;i++){ ctx.save(); ctx.rotate(i*Math.PI/2); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(3,-3); ctx.lineTo(0,-9); ctx.lineTo(-3,-3); ctx.closePath(); ctx.fill(); ctx.restore(); }
      break;
    case 'berserker':
      ctx.beginPath(); ctx.moveTo(-6,-6); ctx.lineTo(6,6); ctx.moveTo(6,-6); ctx.lineTo(-6,6); ctx.stroke();
      break;
  }
  ctx.restore();
}

function drawCrewHouse(key, x, y, isNew){
  const r = ROLES[key], t = G.time, i = Object.keys(CREW).indexOf(key);
  shadow(x, y+6, 120, 20, .3);

  // walls: each house gets a slightly different shade
  const walls = ['#f2ead8','#e6eef8','#f6e6e6','#e8f4ea','#efe8f6'][i%5];
  rr(ctx, x-46, y-82, 92, 84, 8, walls, '#3a4658', 4);

  // chimney + smoke
  rr(ctx, x+18, y-128, 14, 34, 3, '#7a6a5a', '#3a3028', 3);
  for(let k=0;k<3;k++){
    const p = (t*.35 + k/3 + i*.13) % 1;
    ctx.fillStyle = `rgba(220,230,240,${.5*(1-p)})`;
    ctx.beginPath(); ctx.arc(x+25 + Math.sin(p*6+i)*6, y-132 - p*50, 5 + p*9, 0, Math.PI*2); ctx.fill();
  }

  // roof in the crew member's colour
  ctx.fillStyle = r.color;
  ctx.strokeStyle = '#2a3242';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x-58, y-78); ctx.lineTo(x, y-130); ctx.lineTo(x+58, y-78); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.18)';
  ctx.lineWidth = 2;
  for(let k=1;k<4;k++){
    ctx.beginPath(); ctx.moveTo(x-58+k*9, y-78-k*8); ctx.lineTo(x+58-k*9, y-78-k*8); ctx.stroke();
  }

  drawRoleEmblem(key, x, y-100);

  // door
  rr(ctx, x-13, y-46, 26, 48, 10, '#8a5a3a', '#4a3020', 3);
  ellipse(ctx, x+6, y-22, 2.5, 2.5, '#f5c95a');

  // windows (warm light — the crew member is home)
  for(const wx of [x-32, x+20]){
    ctx.save();
    ctx.shadowColor = '#ffd88a';
    ctx.shadowBlur = 12;
    rr(ctx, wx, y-68, 16, 16, 3, '#ffe2a0', '#3a4658', 3);
    ctx.restore();
  }

  // the crew member peeks out of the window now and then
  const peek = Math.sin(t*.7 + i*1.9);
  if(peek > .55){
    const px = x-24, py = y-58 + (1-peek)*18;
    ctx.save();
    ctx.beginPath(); ctx.rect(x-32, y-68, 16, 16); ctx.clip();
    ellipse(ctx, px, py, 7, 7, '#f7fbff', '#182333', 2);
    rr(ctx, px-5, py-3, 10, 4, 2, '#111b2c');
    ellipse(ctx, px-2, py-1, 1.2, 1, '#7af1ff');
    ellipse(ctx, px+2, py-1, 1.2, 1, '#7af1ff');
    ctx.restore();
  }

  drawNameTag(x, y-146, CREW[key].name.toUpperCase()+"'S HOUSE", r.color);

  if(isNew){
    ctx.save();
    ctx.globalAlpha = .6 + .4*Math.sin(t*6);
    ctx.fillStyle = '#ffe38d';
    ctx.font = '900 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('NEW!', x, y-168);
    for(let k=0;k<4;k++){
      const a = t*2 + k*Math.PI/2;
      ellipse(ctx, x + Math.cos(a)*62, y-60 + Math.sin(a)*40, 2.5, 2.5, '#fff4b0');
    }
    ctx.restore();
  }
}

function drawConstructionSite(key, x, y){
  const r = ROLES[key], t = G.time;
  shadow(x, y+6, 120, 20, .25);

  // foundation
  rr(ctx, x-50, y-8, 100, 12, 3, '#8a929e', '#3a4658', 3);

  // half-built wall frame
  ctx.strokeStyle = '#b08a5a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x-42, y-8); ctx.lineTo(x-42, y-70);
  ctx.moveTo(x+42, y-8); ctx.lineTo(x+42, y-52);
  ctx.moveTo(x-42, y-70); ctx.lineTo(x+10, y-70);
  ctx.moveTo(x-42, y-40); ctx.lineTo(x+42, y-40);
  ctx.stroke();

  // scaffolding
  ctx.strokeStyle = '#6a7a8e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x-54, y); ctx.lineTo(x-54, y-96);
  ctx.moveTo(x+54, y); ctx.lineTo(x+54, y-96);
  ctx.moveTo(x-54, y-96); ctx.lineTo(x+54, y-96);
  ctx.moveTo(x-54, y-50); ctx.lineTo(x+54, y-96);
  ctx.stroke();

  // crate of materials
  rr(ctx, x+14, y-26, 24, 20, 3, '#c89a50', '#6a4a22', 2);

  // hazard sign
  rr(ctx, x-30, y-138, 60, 26, 6, '#f5c95a', '#2a2a2a', 2);
  ctx.save();
  ctx.fillStyle = '#2a2a2a';
  ctx.font = '900 8px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('BUILDING', x, y-127);
  ctx.fillText('SOON', x, y-117);
  ctx.restore();

  drawNameTag(x, y-152, CREW[key].name.toUpperCase()+"'S PLOT", r.color);

  ctx.save();
  ctx.globalAlpha = .55 + .25*Math.sin(t*3);
  ctx.fillStyle = '#dbe7f5';
  ctx.font = '800 8px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('BUILT WHEN YOU LEAVE', x, y+22);
  ctx.restore();
}

function drawEmptyPlot(x, y){
  ctx.save();
  ctx.setLineDash([8,6]);
  ctx.strokeStyle = 'rgba(160,190,220,.45)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x-48, y-12, 96, 22, 6); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(160,190,220,.55)';
  ctx.font = '900 20px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('?', x, y-26);
  ctx.font = '800 8px system-ui';
  ctx.fillText('EMPTY PLOT', x, y+24);
  ctx.restore();
}

function drawVillageSign(x, y){
  shadow(x, y+4, 60, 12, .25);
  rr(ctx, x-4, y-150, 8, 152, 3, '#39506a', '#1a2a3e', 2);
  drawHubSign(x, y-168, 'CREW VILLAGE', '#7dffb0');
  rr(ctx, x-72, y-140, 144, 42, 8, 'rgba(9,21,37,.92)', '#7dffb0', 2);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#b8ffd6';
  ctx.font = '900 10px system-ui';
  ctx.fillText('HOUSES BUILT: '+X.data.houses.length+' / 10', x, y-122);
  ctx.fillStyle = '#dbe7f5';
  ctx.font = '800 8px system-ui';
  ctx.fillText(X.data.crew.length ? 'BUILDER: '+builderName().toUpperCase() : 'RESCUE CREW TO START BUILDING', x, y-106);
  ctx.restore();
}

function drawHubCrew(){
  Object.keys(CREW).forEach((key,i) => {
    ctx.save();
    ctx.translate(HOUSE_X[i], 500);
    ctx.scale(HOUSE_SCALE, HOUSE_SCALE);
    if(X.data.houses.includes(key)) drawCrewHouse(key, 0, 0, X.newHouses.includes(key));
    else if(X.data.crew.includes(key)) drawConstructionSite(key, 0, 0);
    else drawEmptyPlot(0, 0);
    ctx.restore();
  });
  drawVillageSign(1240, 500);
}

function drawStrandedCrew(cam){
  const c = crewInWorld(G.worldId);
  if(c && !X.data.crew.includes(c.key)){
    const x = CREW_SPOT.x - cam, y = CREW_SPOT.y, t = G.time;
    if(x > -120 && x < W+120){
      const r = ROLES[c.key];

      // trapped inside a rift crystal
      ctx.save();
      ctx.globalAlpha = .35 + .1*Math.sin(t*3);
      ctx.fillStyle = r.color;
      ctx.shadowColor = r.color;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(x, y-120); ctx.lineTo(x+42, y-60); ctx.lineTo(x+30, y+6); ctx.lineTo(x-30, y+6); ctx.lineTo(x-42, y-60);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      drawCrewMember(x, y, c.key, .6, 1);

      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y-120); ctx.lineTo(x+42, y-60); ctx.lineTo(x+30, y+6); ctx.lineTo(x-30, y+6); ctx.lineTo(x-42, y-60);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // "HELP!" speech bubble
      const by = y - 150 + Math.sin(t*4)*3;
      rr(ctx, x - 30, by - 16, 60, 24, 9, '#ffffff', r.color, 2);
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(x-6, by+8); ctx.lineTo(x+6, by+8); ctx.lineTo(x, by+16); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1a2234';
      ctx.font = '900 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('HELP!', x, by + 1);
      ctx.restore();

      drawNameTag(x, y + 28, c.name.toUpperCase()+' · '+r.name.toUpperCase(), r.color);
    }

    // arrow at the screen edge pointing to the lost crew member
    if(x < -40 || x > W+40){
      const ax = x < 0 ? 40 : W-40, dir = x < 0 ? -1 : 1;
      ctx.save();
      ctx.fillStyle = ROLES[c.key].color;
      ctx.globalAlpha = .6 + .3*Math.sin(G.time*5);
      ctx.beginPath();
      ctx.moveTo(ax + dir*16, 360); ctx.lineTo(ax - dir*6, 346); ctx.lineTo(ax - dir*6, 374);
      ctx.closePath();
      ctx.fill();
      ctx.font = '900 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('CREW', ax - dir*2, 392);
      ctx.restore();
    }
  }

  // rescue teleport beams
  for(const b of X.beams){
    const bx = b.x - cam;
    ctx.save();
    ctx.globalAlpha = clamp(b.t, 0, 1);
    const g = ctx.createLinearGradient(bx-30, 0, bx+30, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(.5, b.color);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(bx-30, 0, 60, b.y+6);
    ctx.restore();
  }
}

X.beams = [];
X.newHouses = [];

// Leaving The Hub for a world lets the builder put up new houses
const travelToBase = travelTo;
window.travelTo = function(id){
  const fromHub = G.scene==='hub';
  travelToBase(id);
  if(fromHub && G.scene==='travel') buildWhileAway();
};

function buildWhileAway(){
  if(!X.data.crew.length) return;
  const todo = X.data.crew.filter(k => !X.data.houses.includes(k));
  if(!todo.length) return;
  X.data.houses.push(...todo);
  X.data.builtWhileAway.push(...todo);
  saveExt();
}

const beginHubVillage = window.beginHub;
window.beginHub = function(){
  beginHubVillage();
  const built = X.data.builtWhileAway;
  if(built.length){
    X.newHouses = [...built];
    const names = built.map(k => CREW[k].name);
    const list = names.length > 1 ? names.slice(0,-1).join(', ')+' and '+names.at(-1) : names[0];
    const self = built.includes(X.data.crew[0]) && built.length===1;
    extToast('WELCOME BACK',
      builderName()+(self ? ' built their own house' : ' built new houses for '+list)+' in the Crew Village while you were away!', 5);
    MUSIC.stinger('achievement');
    X.data.builtWhileAway = [];
    saveExt();
  }else{
    X.newHouses = [];
  }
};

// Crew-related additions to world entry and the world map
const beginWorldWithCrew = window.beginWorld;
window.beginWorld = function(id){
  X.beams.length = 0;
  beginWorldWithCrew(id);
  if(id==='earth' && !X.data.crewIntro){
    X.data.crewIntro = true;
    extToast('CREW MISSING',
      'The crash scattered your 10 crew members across the worlds. Rescue them to unlock their roles.', 5);
  }
  const c = crewInWorld(id);
  if(c && !X.data.crew.includes(c.key)){
    extToast('SIGNAL DETECTED', c.name+' ('+ROLES[c.key].name+') is trapped somewhere in this world. Follow the arrow.', 4);
  }
};

const renderWorldMapBase = renderWorldMap;
window.renderWorldMap = function(){
  renderWorldMapBase();
  document.querySelectorAll('#worldGrid .worldCard').forEach(card => {
    const c = crewInWorld(card.dataset.world);
    if(!c) return;
    const saved = X.data.crew.includes(c.key);
    const btn = card.querySelector('button');
    const p = document.createElement('p');
    p.className = 'crewNote';
    p.style.color = saved ? '#69e3a1' : ROLES[c.key].color;
    p.textContent = saved ? 'CREW RESCUED: '+c.name.toUpperCase() : 'CREW LOST HERE: '+c.name.toUpperCase()+' ('+ROLES[c.key].name.toUpperCase()+')';
    card.insertBefore(p, btn);
  });
};

// Beams fade out over time
const updateWithCrew = window.update;
window.update = function(dt){
  updateWithCrew(dt);
  if(G.paused) return;
  for(const b of X.beams) b.t -= dt;
  X.beams = X.beams.filter(b => b.t > 0);
};

const drawWithCrew = window.draw;
window.draw = function(){
  drawWithCrew();
  if(G.scene==='world') drawStrandedCrew(G.camera);
};

// New Game starts as the Captain (Astronaut); other roles must be rescued
$('newBtn').onclick = () => {
  SFX.resume();
  MUSIC.start();
  X.pendingRole = 'astronaut';
  resetGame();
};


/* =========================================================
   18. THE EXPANDED HUB
   The Hub is now a long space station with a scrolling
   camera. The original area is on the left; walk east for
   the Crew Village, Training Grounds, the Hangar and the
   Observatory.
   ========================================================= */

const HUB_W = 4420;
X.hubCam = 0;
X.dummies = [
  {x:3190, y:520, wob:0},
  {x:3290, y:555, wob:0},
  {x:3390, y:520, wob:0}
];
X.dps = [];
X.lastHit = 0;

const HUB_SPOTS = {
  fusion:  {x:2960, y:500},
  training:{x:3290, y:500},
  hangar:  {x:3700, y:500},
  observe: {x:4020, y:500}
};

function hubFacilities(){
  if(G.scene !== 'hub') return [];
  const list = [
    {x:HUB_SPOTS.fusion.x,   y:520, label:'FUSION MACHINE', fn:openFusion},
    {x:HUB_SPOTS.hangar.x,   y:510, label:'BOARD SHIP · WORLD MAP', fn:() => openOverlay('mapOverlay', renderWorldMap)},
    {x:HUB_SPOTS.observe.x,  y:510, label:'OBSERVATORY · RECORDS', fn:openRecords}
  ];
  return list.map(o => ({...o, d:Math.hypot(P.x-o.x, P.y-o.y)}));
}

const nearestWithHub = window.nearestInteraction;
window.nearestInteraction = function(){
  const n = nearestWithHub();
  const options = n ? [n, ...hubFacilities()] : hubFacilities();
  return options.sort((a,b) => a.d - b.d)[0] || null;
};

// Wider walking area in The Hub
const updatePlayerBase = updatePlayer;
window.updatePlayer = function(dt, bounds){
  if(G.scene==='hub') bounds = HUB_W;
  updatePlayerBase(dt, bounds);
};

// Particles and damage numbers follow the Hub camera
const drawParticlesBase = drawParticles;
window.drawParticles = function(cam=0){
  if(G.scene==='hub') cam = X.hubCam;
  drawParticlesBase(cam);
};

const hubCamTarget = () => clamp(P.x - W*.44, 0, HUB_W - W);

const beginHubBig = window.beginHub;
window.beginHub = function(){
  beginHubBig();
  X.hubCam = hubCamTarget();
  if(!X.data.hubIntro){
    X.data.hubIntro = true;
    extToast('THE HUB HAS EXPANDED',
      'Walk east to find the Crew Village, Training Grounds, Hangar and Observatory.', 4.5);
  }
};

const updateHubBig = window.update;
window.update = function(dt){
  updateHubBig(dt);
  if(G.paused) return;
  if(G.scene==='hub'){
    X.hubCam = lerp(X.hubCam, hubCamTarget(), Math.min(1, dt*6));
  }
  for(const d of X.dummies) d.wob = Math.max(0, d.wob - dt*2.5);
  X.dps = X.dps.filter(h => G.time - h.t < 4);
};

/* ---------- Hub drawing ---------- */

function drawHubDeck(){
  const x0 = 40, x1 = HUB_W-40, top = 380, bot = 688;

  const rim = ctx.createLinearGradient(0, top, 0, bot+20);
  rim.addColorStop(0, '#f7fbff');
  rim.addColorStop(.34, '#a9c1d2');
  rim.addColorStop(.72, '#4d6680');
  rim.addColorStop(1, '#18283d');

  rr(ctx, x0+50, bot-20, x1-x0-100, 50, 20, '#101c2e');
  rr(ctx, x0, top, x1-x0, bot-top, 150, rim, '#4f7591', 7);

  ctx.save();
  ctx.globalAlpha = .55 + .18*Math.sin(G.time*3);
  ctx.strokeStyle = '#6cecff';
  ctx.shadowColor = '#6cecff';
  ctx.shadowBlur = 18;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(x0+26, top+22, x1-x0-52, bot-top-44, 130);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = 'rgba(79,117,145,.22)';
  ctx.lineWidth = 2;
  for(let x=x0+160; x<x1-120; x+=160){
    ctx.beginPath(); ctx.moveTo(x, top+40); ctx.lineTo(x, bot-40); ctx.stroke();
  }

  // district floor markings
  const zones = [
    [1170, 2790, 'rgba(125,255,176,.10)'],
    [2810, 3110, 'rgba(255,111,216,.12)'],
    [3080, 3490, 'rgba(255,154,106,.12)'],
    [3530, 3870, 'rgba(139,239,255,.10)'],
    [3890, 4160, 'rgba(199,155,255,.10)']
  ];
  for(const [a,b,c] of zones) rr(ctx, a, 430, b-a, 190, 40, c);
}

function drawCrewQuarters(x, y){
  shadow(x, y+10, 480, 40, .3);

  const body = ctx.createLinearGradient(0, y-120, 0, y);
  body.addColorStop(0, '#d0e0ee');
  body.addColorStop(1, '#5a7894');
  rr(ctx, x-230, y-112, 460, 114, 24, body, '#23384d', 5);

  ctx.fillStyle = '#8aa6c0';
  ctx.strokeStyle = '#23384d';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x-236, y-106);
  ctx.quadraticCurveTo(x, y-200, x+236, y-106);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const count = X.data.crew.length;
  let i = 0;
  for(let wx=x-200; wx<=x+200; wx+=50){
    if(Math.abs(wx-x) < 50) continue;
    const lit = i < count;
    ctx.save();
    if(lit){ ctx.shadowColor = '#ffd88a'; ctx.shadowBlur = 14; }
    rr(ctx, wx-16, y-92, 32, 30, 8, lit ? '#ffe2a0' : '#243650', '#23384d', 3);
    ctx.restore();
    i++;
  }

  rr(ctx, x-30, y-80, 60, 82, 14, '#16304a', '#7dffb0', 3);
  ctx.save();
  ctx.strokeStyle = '#b8ffd6';
  ctx.shadowColor = '#7dffb0';
  ctx.shadowBlur = 12;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y-70); ctx.lineTo(x, y-8); ctx.stroke();
  ctx.restore();

  drawHubSign(x, y-205, 'CREW QUARTERS', '#7dffb0');
  ctx.save();
  ctx.fillStyle = '#b8ffd6';
  ctx.font = '900 10px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('CREW HOME: '+count+' / 10', x, y-172);
  ctx.restore();
}

function drawDummy(d){
  ctx.save();
  ctx.translate(d.x, d.y);
  shadow(0, 4, 64, 14, .3);
  rr(ctx, -5, -62, 10, 64, 3, '#8a6a4a', '#4a3a2a', 2);
  ctx.rotate(Math.sin(G.time*30)*d.wob*.25);
  ellipse(ctx, 0, -82, 26, 34, '#e8d8b0', '#6a5a3a', 4);
  ellipse(ctx, 0, -82, 17, 22, '#e84a5a');
  ellipse(ctx, 0, -82, 10, 13, '#ffffff');
  ellipse(ctx, 0, -82, 4, 5, '#e84a5a');
  ellipse(ctx, 0, -128, 15, 15, '#e8d8b0', '#6a5a3a', 4);
  ctx.strokeStyle = '#6a5a3a';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-6,-132); ctx.lineTo(-2,-128); ctx.moveTo(-2,-132); ctx.lineTo(-6,-128);
  ctx.moveTo(2,-132); ctx.lineTo(6,-128); ctx.moveTo(6,-132); ctx.lineTo(2,-128); ctx.stroke();
  ctx.restore();
}

function drawTraining(x, y){
  ellipse(ctx, x, y+40, 230, 62, 'rgba(255,140,90,.16)', 'rgba(255,160,110,.55)', 3);

  rr(ctx, x-86, y-120, 8, 124, 3, '#39506a', '#1a2a3e', 2);
  rr(ctx, x+78, y-120, 8, 124, 3, '#39506a', '#1a2a3e', 2);
  rr(ctx, x-120, y-196, 240, 84, 12, 'rgba(9,21,37,.94)', '#ff9a6a', 2);

  const hits = X.dps;
  const span = hits.length ? Math.max(1, G.time - hits[0].t) : 1;
  const dps = hits.length ? Math.round(hits.reduce((n,h) => n + h.d, 0)/Math.min(4, span)) : 0;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff9a6a';
  ctx.font = '900 9px system-ui';
  ctx.fillText('DAMAGE PER SECOND', x, y-176);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 30px system-ui';
  ctx.fillText(String(dps), x, y-144);
  ctx.fillStyle = '#aebdd0';
  ctx.font = '800 9px system-ui';
  ctx.fillText('LAST HIT '+X.lastHit+' · ATTACK THE DUMMIES (F)', x, y-122);
  ctx.restore();

  drawHubSign(x, y-222, 'TRAINING GROUNDS', '#ff9a6a');
  for(const d of X.dummies) drawDummy(d);
}

function drawHangar(x, y){
  shadow(x, y+10, 380, 40, .32);

  const wall = ctx.createLinearGradient(0, y-200, 0, y);
  wall.addColorStop(0, '#0f1b2c');
  wall.addColorStop(1, '#22344e');
  ctx.fillStyle = wall;
  ctx.beginPath();
  ctx.moveTo(x-170, y+2);
  ctx.lineTo(x-170, y-120);
  ctx.quadraticCurveTo(x, y-250, x+170, y-120);
  ctx.lineTo(x+170, y+2);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.fillStyle = '#9ff4ff';
  ctx.shadowColor = '#6cecff';
  ctx.shadowBlur = 10;
  for(let i=-3;i<=3;i++) ellipse(ctx, x + i*40, y-150 + Math.abs(i)*9, 4, 3, '#bff8ff');
  ctx.restore();

  drawShip(x, y-78, .78, 0);

  ctx.strokeStyle = '#1c2c40';
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.moveTo(x-170, y+2); ctx.lineTo(x-170, y-120);
  ctx.quadraticCurveTo(x, y-250, x+170, y-120); ctx.lineTo(x+170, y+2);
  ctx.stroke();
  ctx.strokeStyle = '#7f9ab4';
  ctx.lineWidth = 12;
  ctx.stroke();

  ctx.save();
  ctx.beginPath(); ctx.rect(x-150, y-14, 300, 14); ctx.clip();
  for(let i=-8;i<8;i++){
    ctx.fillStyle = i%2 ? '#f5c95a' : '#1a2234';
    ctx.beginPath(); ctx.moveTo(x+i*20, y); ctx.lineTo(x+i*20+14, y-14); ctx.lineTo(x+i*20+28, y-14); ctx.lineTo(x+i*20+14, y); ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  drawHubSign(x, y-262, 'HANGAR', '#8befff');
}

function drawObservatory(x, y){
  shadow(x, y+10, 280, 34, .3);
  const t = G.time;

  const g = ctx.createLinearGradient(0, y-200, 0, y);
  g.addColorStop(0, '#e2e8f2');
  g.addColorStop(1, '#5a6e88');
  rr(ctx, x-110, y-100, 220, 102, 14, g, '#23384d', 5);

  ctx.fillStyle = g;
  ctx.strokeStyle = '#23384d';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x, y-100, 100, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#101a2c';
  ctx.beginPath(); ctx.moveTo(x-16, y-100); ctx.lineTo(x-16, y-196); ctx.lineTo(x+16, y-196); ctx.lineTo(x+16, y-100); ctx.closePath(); ctx.fill();

  ctx.save();
  ctx.translate(x, y-120);
  ctx.rotate(-.35 + Math.sin(t*.3)*.25);
  rr(ctx, -11, -104, 22, 104, 6, '#39506a', '#1a2a3e', 3);
  ctx.shadowColor = '#c79bff';
  ctx.shadowBlur = 16;
  ellipse(ctx, 0, -106, 13, 6, '#e6d8ff', '#6a4fcb', 2);
  ctx.restore();

  rr(ctx, x-26, y-70, 52, 72, 12, '#1a2a44', '#c79bff', 3);

  ctx.save();
  for(let i=0;i<7;i++){
    const a = i*.9 + t*.4;
    const sx = x + Math.cos(a)*150, sy = y - 200 + Math.sin(a*1.3)*40;
    ctx.globalAlpha = .4 + .4*Math.sin(t*3 + i);
    ellipse(ctx, sx, sy, 2.5, 2.5, '#f0e6ff');
  }
  ctx.restore();

  drawHubSign(x, y-240, 'OBSERVATORY', '#c79bff');
}

function drawHubRails(){
  ctx.save();
  ctx.lineCap = 'round';
  for(let x=110; x<HUB_W-160; x+=420){
    ctx.strokeStyle = 'rgba(26,45,65,.85)';
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(x, 662); ctx.lineTo(x+300, 662); ctx.stroke();
    ctx.strokeStyle = 'rgba(105,231,255,.5)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, 655); ctx.lineTo(x+300, 655); ctx.stroke();
  }
  ctx.restore();
}

window.drawHub = function(){
  const cam = X.hubCam, t = G.time;

  space(t*7 + cam*.15);
  drawPlanet(1110 - cam*.06, 145, 95, '#a67eff', '#2e286d');
  drawPlanet(155 - cam*.04, 105, 48, '#9ff4df', '#285d66');
  drawPlanet(2000 - cam*.06, 110, 70, '#ffd6a0', '#7a3a2a');

  ctx.save();
  ctx.globalAlpha = .16;
  ctx.strokeStyle = '#6cecff';
  ctx.lineWidth = 2;
  for(let i=0;i<5;i++){
    ctx.beginPath();
    ctx.arc(640 - cam*.3, 340, 150+i*75, Math.PI*.08, Math.PI*.92);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(-cam, 0);

  drawHubDeck();

  drawHubPath(340, 650, 500);
  drawHubPath(650, 980, 500);
  drawHubPath(980, 1240, 500);
  drawHubPath(3060, 3290, 500);
  drawHubPath(3470, 3700, 500);
  drawHubPath(3870, 4020, 500);

  for(let x=180; x<=HUB_W-180; x+=58){
    if(x > cam-60 && x < cam+W+60) drawHubLight(x, 640, (x/58|0)%2===0);
  }

  drawHubSanctuary(340, 500);
  drawHubArmory(650, 500);
  drawHubTerminal(980, 500);
  drawFusionMachine(HUB_SPOTS.fusion.x, 500);
  drawTraining(HUB_SPOTS.training.x, 500);
  drawHangar(HUB_SPOTS.hangar.x, 500);
  drawObservatory(HUB_SPOTS.observe.x, 500);

  // Core monument, Rift Trials gate and rescued crew
  drawHubCoreMonument(650, 390);

  for(const egg of EASTER_EGGS){
    if(egg.world==='hub' && !G.easterEggs.has(egg.id)) drawEasterEgg(egg, 0);
  }

  if(activePet()) drawFollowerPet(0);
  drawRiftwalker(P.x, P.y-P.jump, 1, false);

  drawHubRails();
  ctx.restore();

  // hints that the Hub continues off-screen
  ctx.save();
  ctx.font = '900 10px system-ui';
  ctx.fillStyle = '#bdf7ff';
  ctx.globalAlpha = .55 + .3*Math.sin(t*3);
  if(cam < HUB_W - W - 20){
    ctx.textAlign = 'right';
    ctx.fillText('MORE OF THE HUB  >>', W-24, 700);
  }
  if(cam > 20){
    ctx.textAlign = 'left';
    ctx.fillText('<<  MORE OF THE HUB', 24, 700);
  }
  ctx.restore();
};


/* =========================================================
   19. PET STATS, ABILITIES + FUSION MACHINE
   Every pet has stats (HP / ATK / DEF / SPD / POWER) and
   abilities. The active pet's abilities boost you. The Fusion
   Machine in The Hub merges two pets into a new one: stats are
   combined and abilities are merged (matching ones level up).
   ========================================================= */

const ABILITIES = {
  atkRise:  {name:'Attack Rise',  color:'#ff6175', desc:'+8% attack per level'},
  guardUp:  {name:'Guard Up',     color:'#ffb65d', desc:'+10% defense per level'},
  swift:    {name:'Swift Step',   color:'#5af3ef', desc:'+6% movement speed per level'},
  vital:    {name:'Vital Boost',  color:'#69e3a1', desc:'+6% max HP per level'},
  critEye:  {name:'Crit Eye',     color:'#ffe38d', desc:'+4% critical chance per level'},
  critPower:{name:'Crit Power',   color:'#ff9a3c', desc:'+15% critical damage per level'},
  quick:    {name:'Quick Hands',  color:'#9b72ff', desc:'6% faster attacks per level'},
  regen:    {name:'Regeneration', color:'#7dffb0', desc:'Heal 0.4% HP per second per level'},
  lucky:    {name:'Lucky Find',   color:'#f2d36d', desc:'+15% Rift Credits per level'},
  rapid:    {name:'Rapid Pet',    color:'#72e6ff', desc:'Pet attacks 30% faster per level'},
  learner:  {name:'Fast Learner', color:'#c79bff', desc:'+15% XP per level'},
  drain:    {name:'Life Drain',   color:'#c0304a', desc:'Heal 2% of damage dealt per level'}
};

const ROMAN = ['','I','II','III','IV','V','VI','VII','VIII','IX','X'];
const MAX_ABILITY_LVL = 3;

const TYPE_POOL = {
  Fire:['atkRise','critPower'], Earth:['guardUp','vital'], Light:['lucky','critEye'],
  Sound:['quick','swift'], Cosmic:['critPower','learner'], Tech:['rapid','quick'],
  Void:['drain','critEye'], Dark:['drain','swift'], Nature:['regen','vital'],
  Water:['vital','regen'], Glitch:['critEye','quick'], Ice:['guardUp','critPower'],
  Wind:['swift','rapid'], Sweet:['lucky','regen'], Primal:['atkRise','swift'],
  Storm:['critPower','atkRise'], Spirit:['learner','drain']
};

function strHash(s){
  let h = 0;
  for(const ch of s) h = (h*31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

// Abilities for every normal pet (derived from its type)
const BASE_PET_ABILITIES = {};
for(const id of WORLD_ORDER){
  (PET_ROSTERS[id] || []).forEach((name, i) => {
    const types = (PET_TYPES[name] || 'Light').split(' / ');
    const pool = TYPE_POOL[types[0]] || TYPE_POOL.Light;
    const first = pool[strHash(name) % pool.length];
    const list = [{id:first, lvl: i===7 ? 2 : 1}];
    if(i===7){
      // legendary pets get a second ability
      const pool2 = TYPE_POOL[types[1]] || pool;
      let second = pool2[(strHash(name)+1) % pool2.length];
      if(second===first) second = pool.find(a => a!==first) || 'vital';
      list.push({id:second, lvl:1});
    }
    BASE_PET_ABILITIES[name] = list;
  });
}

function petAbilities(name){
  const o = PET_STATE.owned[name];
  if(o && o.abilities) return o.abilities;
  return BASE_PET_ABILITIES[name] || [];
}

function petAbilityLevel(id){
  if(G.scene==='arena') return 0;
  const ap = activePet();
  if(!ap) return 0;
  return petAbilities(ap.name).filter(a => a.id===id).reduce((n,a) => n + a.lvl, 0);
}

function applyPetAbilities(s){
  const L = petAbilityLevel;
  s.atk = Math.round(s.atk*(1 + L('atkRise')*.08));
  s.def = Math.round(s.def*(1 + L('guardUp')*.10));
  s.speed = Math.round(s.speed*(1 + L('swift')*.06));
  s.maxHP = Math.round(s.maxHP*(1 + L('vital')*.06));
  s.critChance = clamp(s.critChance + L('critEye')*.04, .02, .85);
  s.critDamage += L('critPower')*.15;
  s.cooldown = Math.max(.12, s.cooldown*(1 - L('quick')*.06));
}

function isBasePet(name){
  return WORLD_ORDER.some(id => (PET_ROSTERS[id] || []).includes(name));
}

// Fused pets keep their stats in the save; re-register them after loading
function registerFusedPets(){
  for(const o of Object.values(PET_STATE.owned)){
    if(o && o.fused){
      PET_BONUS[o.name] = {...o.stats};
      PET_TYPES[o.name] = o.type;
    }
  }
}

function petScaledStats(name){
  const o = PET_STATE.owned[name];
  const lvl = o ? o.level : 1;
  const b = PET_BONUS[name] || {};
  const boost = 1 + (lvl-1)*.015;
  return {
    hp:Math.round((b.hp || 0)*boost),
    atk:Math.round((b.atk || 0)*boost),
    def:Math.round((b.def || 0)*boost),
    speed:Math.round((b.speed || 0)*boost),
    power:Math.round(8 + (b.atk || 5)*.45 + lvl*1.5),
    lvl
  };
}

function abilityChips(list){
  if(!list.length) return '<span class="abChip" style="border-color:#52627a;color:#8ea0b8">NO ABILITY</span>';
  return list.map(a => {
    const A = ABILITIES[a.id];
    return `<span class="abChip" title="${A.desc}" style="border-color:${A.color};color:${A.color}">${A.name.toUpperCase()} ${ROMAN[a.lvl]}</span>`;
  }).join('');
}

function statLine(st){
  const sgn = v => (v >= 0 ? '+' : '')+v;
  return `HP ${sgn(st.hp)} · ATK ${sgn(st.atk)} · DEF ${sgn(st.def)} · SPD ${sgn(st.speed)} · POWER ${st.power}`;
}

/* ---------- fusion rules ---------- */

function fuseName(a, b){
  const strip = s => s.replace(/\s+(II|III|IV|V|VI|VII|VIII|IX|X|\d+)$/,'');
  const wa = strip(a).split(' '), wb = strip(b).split(' ');
  let base;
  if(wa.length===1 && wb.length===1){
    base = wa[0].slice(0, Math.ceil(wa[0].length/2)) + wb[0].slice(Math.floor(wb[0].length/2));
  }else{
    base = wa[0] + ' ' + wb[wb.length-1];
  }
  let name = base, n = 2;
  while(PET_STATE.owned[name] || isBasePet(name) || name===a || name===b){
    name = base+' '+(ROMAN[n] || n);
    n++;
  }
  return name;
}

function computeFusion(a, b){
  const oa = PET_STATE.owned[a], ob = PET_STATE.owned[b];
  const sa = PET_BONUS[a] || {}, sb = PET_BONUS[b] || {};

  const stats = {};
  for(const k of ['hp','atk','def','speed']){
    stats[k] = Math.round(((sa[k] || 0) + (sb[k] || 0))*.85 + (k==='speed' ? 0 : 5));
  }

  const merged = {};
  for(const ab of [...petAbilities(a), ...petAbilities(b)]){
    merged[ab.id] = Math.min(MAX_ABILITY_LVL, (merged[ab.id] || 0) + ab.lvl);
  }
  const abilities = Object.entries(merged)
    .map(([id,lvl]) => ({id, lvl}))
    .sort((x,y) => y.lvl - x.lvl)
    .slice(0, 4);

  const types = [...new Set([...(PET_TYPES[a] || '').split(' / '), ...(PET_TYPES[b] || '').split(' / ')])]
    .filter(Boolean).slice(0, 3).join(' / ');

  const gen = Math.max(oa?.gen || 0, ob?.gen || 0) + 1;

  return {
    name:fuseName(a, b),
    stats, abilities, type:types, gen,
    level:Math.max(oa?.level || 1, ob?.level || 1),
    cost:600*gen,
    parents:[a, b]
  };
}

function performFusion(a, b){
  const f = computeFusion(a, b);
  if(!spendCredits(f.cost)) return;

  const old = getStats().maxHP;
  const wasActive = PET_STATE.active===a || PET_STATE.active===b;

  delete PET_STATE.owned[a];
  delete PET_STATE.owned[b];

  PET_STATE.owned[f.name] = {
    name:f.name, level:f.level, x:P.x-60, y:P.y, attackCd:0,
    fused:true, gen:f.gen, stats:f.stats, abilities:f.abilities, type:f.type, parents:f.parents
  };
  PET_BONUS[f.name] = {...f.stats};
  PET_TYPES[f.name] = f.type;

  if(wasActive || !PET_STATE.active || !PET_STATE.owned[PET_STATE.active]) PET_STATE.active = f.name;
  preserveHealthForStatChange(old, getStats().maxHP);

  X.data.fusions++;
  X.data.lastFused = f.name;
  X.fuseFx = 2;
  X.fuseA = null;
  X.fuseB = null;

  MUSIC.stinger('victory');
  SFX.core();
  burst(HUB_SPOTS.fusion.x, 380, '#ff9ff0', 30);
  burst(HUB_SPOTS.fusion.x, 380, '#9ff4ff', 20);
  toast('FUSION COMPLETE', f.name+' was born! '+f.abilities.map(x => ABILITIES[x.id].name+' '+ROMAN[x.lvl]).join(', ')+'.', 4.5);

  saveExt();
  syncHUD();
  renderFusion();
}

/* ---------- Fusion Machine screen ---------- */

const fusionStyle = document.createElement('style');
fusionStyle.textContent = `
.abChip{display:inline-block;font-size:7px;font-weight:900;letter-spacing:.08em;padding:3px 6px;border-radius:6px;background:rgba(6,14,26,.7);border:1px solid;margin:4px 4px 0 0}
.petExtra{margin-top:6px}
.petExtra .pwr{color:#dbe7f5;font-size:8px;font-weight:900;letter-spacing:.1em}
.fusedBadge{display:inline-block;margin-left:6px;font-size:7px;padding:2px 6px;border-radius:6px;background:linear-gradient(90deg,#ff6fd8,#7a61f2);color:#fff;letter-spacing:.1em;vertical-align:middle}
.fuseTop{display:grid;grid-template-columns:1fr 1.3fr 1fr;gap:12px;margin-bottom:14px}
.fuseSlot,.fuseMid{border-radius:16px;padding:12px;text-align:center;min-height:200px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.035)}
.fuseSlot{cursor:pointer}
.fuseSlot.empty{display:flex;align-items:center;justify-content:center;color:#8ea0b8;font-size:10px;border-style:dashed}
.fuseMid{border-color:rgba(255,111,216,.45);background:linear-gradient(160deg,rgba(255,111,216,.08),rgba(122,97,242,.08))}
.fuseSlot h4,.fuseMid h4{margin:6px 0 2px;font-size:12px}
.fuseSlot p,.fuseMid p{margin:3px 0;color:#9fb0c7;font-size:9px;line-height:1.45}
.fuseMid button{margin-top:10px;width:100%}
.fusePetGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px}
.fusePet{cursor:pointer;padding:10px;border-radius:14px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);transition:border-color .15s,transform .15s}
.fusePet:hover{border-color:rgba(255,111,216,.5)}
.fusePet.picked{border-color:#ff6fd8;box-shadow:0 0 16px rgba(255,111,216,.2)}
.fusePet h4{margin:4px 0 2px;font-size:10px}
.fusePet p{margin:0;color:#9fb0c7;font-size:8px;line-height:1.45}
.fusePet canvas,.fuseSlot canvas,.fuseMid canvas{display:block;margin:0 auto}
@media(max-width:820px){.fuseTop{grid-template-columns:1fr}}
`;
document.head.appendChild(fusionStyle);

$('gameShell').insertAdjacentHTML('beforeend', `
  <section id="fusionOverlay" class="overlay hidden">
    <div class="panel widePanel">
      <header>
        <div><small>THE HUB · FUSION LAB</small><h2>Fusion Machine</h2></div>
        <button id="fusionClose" class="closeBtn">CLOSE</button>
      </header>
      <p class="panelNote">Pick two pets. The machine merges their stats and abilities into one new pet.
        Matching abilities level up (max III). Both pets are used up, but stay in your Journal.</p>
      <div class="fuseTop">
        <div id="fuseSlotA" class="fuseSlot"></div>
        <div id="fuseMid" class="fuseMid"></div>
        <div id="fuseSlotB" class="fuseSlot"></div>
      </div>
      <h3>Your Pets</h3>
      <div id="fusePetGrid" class="fusePetGrid"></div>
    </div>
  </section>`);

X.fuseA = null;
X.fuseB = null;
X.fuseFx = 0;

function openFusion(){
  X.fuseA = null;
  X.fuseB = null;
  openOverlay('fusionOverlay', renderFusion);
}

$('fusionClose').onclick = () => closeOverlay('fusionOverlay');

function petCanvas(name, size=70, scale=.8){
  const cv = document.createElement('canvas');
  cv.width = size; cv.height = Math.round(size*.8);
  drawPetSprite(cv.getContext('2d'), size/2, cv.height*.78, name, scale, G.time);
  return cv;
}

function renderSlot(el, name, which){
  el.innerHTML = '';
  if(!name || !PET_STATE.owned[name]){
    el.className = 'fuseSlot empty';
    el.textContent = which==='A' ? 'SLOT 1 · pick a pet below' : 'SLOT 2 · pick a pet below';
    return;
  }
  el.className = 'fuseSlot';
  el.appendChild(petCanvas(name, 90, 1));
  const st = petScaledStats(name);
  el.insertAdjacentHTML('beforeend', `
    <h4>${name}${PET_STATE.owned[name].fused ? '<span class="fusedBadge">FUSED</span>' : ''}</h4>
    <p>${PET_TYPES[name] || ''} · LV ${st.lvl}</p>
    <p>${statLine(st)}</p>
    <div>${abilityChips(petAbilities(name))}</div>
    <p style="margin-top:8px;color:#6f84a0">Click to remove</p>`);
  el.onclick = () => {
    if(which==='A') X.fuseA = null; else X.fuseB = null;
    SFX.click();
    renderFusion();
  };
}

function renderFusion(){
  renderSlot($('fuseSlotA'), X.fuseA, 'A');
  renderSlot($('fuseSlotB'), X.fuseB, 'B');

  const mid = $('fuseMid');
  mid.innerHTML = '';
  const owned = Object.keys(PET_STATE.owned);

  if(X.fuseA && X.fuseB){
    const f = computeFusion(X.fuseA, X.fuseB);
    const cv = document.createElement('canvas');
    cv.width = 110; cv.height = 90;
    const c = cv.getContext('2d');
    const g = c.createRadialGradient(55,50,4,55,50,50);
    g.addColorStop(0,'rgba(255,111,216,.45)');
    g.addColorStop(1,'rgba(122,97,242,0)');
    c.fillStyle = g;
    c.fillRect(0,0,110,90);
    drawPetSprite(c, 55, 72, f.name, 1, G.time);
    mid.appendChild(cv);

    const sa = PET_BONUS[X.fuseA] || {}, sb = PET_BONUS[X.fuseB] || {};
    const cmp = k => {
      const best = Math.max(sa[k] || 0, sb[k] || 0), v = f.stats[k];
      const col = v > best ? '#69e3a1' : v < best ? '#ff9aaa' : '#dbe7f5';
      return `<b style="color:${col}">${k==='speed' ? 'SPD' : k.toUpperCase()} ${v >= 0 ? '+' : ''}${v}</b>`;
    };

    mid.insertAdjacentHTML('beforeend', `
      <h4 style="color:#ffb3ec">${f.name} <span class="fusedBadge">GEN ${f.gen}</span></h4>
      <p>${f.type} · LV ${f.level}</p>
      <p>${cmp('hp')} · ${cmp('atk')} · ${cmp('def')} · ${cmp('speed')} · POWER ${Math.round(8 + (f.stats.atk || 5)*.45 + f.level*1.5)}</p>
      <div>${abilityChips(f.abilities)}</div>
      <p style="margin-top:6px">Cost: <b style="color:#8ff5ff">${f.cost.toLocaleString()} Rift Credits</b> · You have ${P.credits.toLocaleString()}</p>`);

    const btn = document.createElement('button');
    btn.className = 'primary';
    btn.textContent = 'FUSE PETS';
    btn.disabled = P.credits < f.cost;
    btn.onclick = () => performFusion(X.fuseA, X.fuseB);
    mid.appendChild(btn);
  }else{
    mid.insertAdjacentHTML('beforeend', `
      <h4 style="color:#ffb3ec">FUSION PREVIEW</h4>
      <p>${owned.length < 2
        ? 'You need at least two pets. Befriend more pets in the worlds first.'
        : 'Choose two pets to see the fused result: its name, stats and merged abilities.'}</p>
      <p style="margin-top:10px">Stats: parents are added together (x0.85) plus a small bonus.</p>
      <p>Abilities: both lists are merged. The same ability on both pets levels up.</p>
      <p>Fused pets can be fused again for even stronger results.</p>`);
  }

  const grid = $('fusePetGrid');
  grid.innerHTML = '';
  if(!owned.length){
    grid.innerHTML = '<p class="panelNote">No pets yet. Explore the worlds to befriend some.</p>';
  }
  for(const name of owned){
    const st = petScaledStats(name);
    const card = document.createElement('div');
    const picked = X.fuseA===name || X.fuseB===name;
    card.className = 'fusePet'+(picked ? ' picked' : '');
    card.appendChild(petCanvas(name, 70, .7));
    card.insertAdjacentHTML('beforeend', `
      <h4>${name}${PET_STATE.owned[name].fused ? '<span class="fusedBadge">FUSED</span>' : ''}${PET_STATE.active===name ? ' <span style="color:#8ff5ff;font-size:7px">ACTIVE</span>' : ''}</h4>
      <p>LV ${st.lvl} · ${statLine(st)}</p>
      <div>${abilityChips(petAbilities(name))}</div>`);
    card.onclick = () => {
      if(picked){
        if(X.fuseA===name) X.fuseA = null; else X.fuseB = null;
      }else if(!X.fuseA){
        X.fuseA = name;
      }else if(!X.fuseB){
        X.fuseB = name;
      }else{
        X.fuseB = name;
      }
      SFX.click();
      renderFusion();
    };
    grid.appendChild(card);
  }
}

/* ---------- Pet Sanctuary shows stats + abilities ---------- */

const renderPetsBase = renderPets;
window.renderPets = function(){
  renderPetsBase();
  document.querySelectorAll('#petGrid .petCard').forEach(card => {
    const h = card.querySelector('h4');
    if(!h) return;
    const name = h.textContent.trim();
    if(!PET_STATE.owned[name]) return;
    const st = petScaledStats(name);
    if(PET_STATE.owned[name].fused) h.insertAdjacentHTML('beforeend', '<span class="fusedBadge">FUSED</span>');
    const btn = card.querySelector('button');
    const extra = document.createElement('div');
    extra.className = 'petExtra';
    extra.innerHTML = `<div class="pwr">PET POWER ${st.power}</div><div>${abilityChips(petAbilities(name))}</div>`;
    card.insertBefore(extra, btn);
  });
};

/* ---------- fused pets glow ---------- */

const drawPetSpriteBase = drawPetSprite;
window.drawPetSprite = function(c, x, y, name, scale=1, time=0){
  const fused = !!PET_STATE.owned[name]?.fused;
  if(fused){
    c.save();
    const g = c.createRadialGradient(x, y-14*scale, 2, x, y-14*scale, 40*scale);
    g.addColorStop(0, 'rgba(255,111,216,.45)');
    g.addColorStop(1, 'rgba(122,97,242,0)');
    c.fillStyle = g;
    c.beginPath(); c.arc(x, y-14*scale, 40*scale, 0, Math.PI*2); c.fill();
    c.restore();
  }
  drawPetSpriteBase(c, x, y, name, scale, time);
  if(fused){
    c.save();
    c.translate(x, y - 50*scale);
    c.rotate(Math.PI/4);
    c.fillStyle = '#ffb3ec';
    c.strokeStyle = '#7a2a6a';
    c.lineWidth = 1.5;
    c.fillRect(-4*scale, -4*scale, 8*scale, 8*scale);
    c.strokeRect(-4*scale, -4*scale, 8*scale, 8*scale);
    c.restore();
  }
};

/* ---------- the machine in The Hub ---------- */

function drawFusionMachine(x, y){
  const t = G.time, fx = X.fuseFx || 0;
  shadow(x, y+10, 320, 36, .32);

  rr(ctx, x-150, y-32, 300, 36, 10, '#34485e', '#16263a', 4);

  // pipes
  ctx.save();
  ctx.strokeStyle = '#5a6e88';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x-80, y-110); ctx.quadraticCurveTo(x-60, y-150, x-40, y-126);
  ctx.moveTo(x+80, y-110); ctx.quadraticCurveTo(x+60, y-150, x+40, y-126);
  ctx.stroke();
  ctx.restore();

  // two input tubes
  for(const [tx, col] of [[x-104, '#6cecff'], [x+104, '#ff6fd8']]){
    rr(ctx, tx-26, y-190, 52, 160, 20, 'rgba(200,240,255,.14)', '#9fc4dc', 4);
    const lg = ctx.createLinearGradient(0, y-150, 0, y-30);
    lg.addColorStop(0, col+'55');
    lg.addColorStop(1, col+'dd');
    rr(ctx, tx-21, y-146 + Math.sin(t*2 + tx)*4, 42, 112, 16, lg);
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    for(let i=0;i<5;i++){
      const p = (t*.6 + i/5) % 1;
      ctx.beginPath(); ctx.arc(tx - 10 + (i*9)%22, y-40 - p*100, 2 + (i%2), 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
    rr(ctx, tx-32, y-202, 64, 18, 6, '#5a6e88', '#23384d', 3);
    rr(ctx, tx-32, y-38, 64, 14, 5, '#5a6e88', '#23384d', 3);
  }

  // fusion core
  const pulse = .8 + .2*Math.sin(t*4) + fx*.4;
  ctx.save();
  ctx.shadowColor = '#ff6fd8';
  ctx.shadowBlur = 30*pulse;
  const cg = ctx.createRadialGradient(x-10, y-134, 4, x, y-120, 48);
  cg.addColorStop(0, 'rgba(255,240,255,.95)');
  cg.addColorStop(.4, 'rgba(255,111,216,.55)');
  cg.addColorStop(1, 'rgba(90,70,220,.35)');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.arc(x, y-120, 46, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(255,220,255,.7)';
  ctx.lineWidth = 2;
  for(let i=0;i<3;i++){
    ctx.beginPath();
    ctx.ellipse(x, y-120, 40, 14, t*(1+i*.5) + i, 0, Math.PI*2);
    ctx.stroke();
  }
  ctx.restore();

  if(X.data.lastFused && PET_STATE.owned[X.data.lastFused]){
    drawPetSprite(ctx, x, y-102, X.data.lastFused, .55, t);
  }

  ctx.save();
  ctx.strokeStyle = '#c8d8f0';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(x, y-120, 48, 0, Math.PI*2); ctx.stroke();
  ctx.restore();

  // control console
  rr(ctx, x-54, y-66, 108, 34, 8, '#13273b', '#ff6fd8', 2);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '900 11px system-ui';
  ctx.fillStyle = Math.sin(t*4) > 0 ? '#ffb3ec' : '#ff6fd8';
  ctx.fillText('FUSE', x, y-45);
  ctx.restore();

  if(fx > 0){
    drawBolt(x-104, y-120, x-40, y-120, '#9ff4ff', 3);
    drawBolt(x+104, y-120, x+40, y-120, '#ff9ff0', 3);
  }

  drawHubSign(x, y-238, 'FUSION MACHINE', '#ff6fd8');
  ctx.save();
  ctx.fillStyle = '#ffb3ec';
  ctx.font = '900 10px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('FUSIONS: '+X.data.fusions, x, y-208);
  ctx.restore();
}

const updateFusion = window.update;
window.update = function(dt){
  updateFusion(dt);
  if(!G.paused) X.fuseFx = Math.max(0, (X.fuseFx || 0) - dt);
};


/* =========================================================
   20. WEAPON PROJECTILES, BURNING + BLOCKING
   Ranged / thrown weapons fire projectiles that hit enemies
   in worlds and the training dummies in The Hub.
   ========================================================= */

X.pproj = [];

function hitDummy(d, dmg, critical){
  d.wob = 1;
  X.dps.push({t:G.time, d:dmg});
  X.lastHit = dmg;
  floatingText((critical ? 'CRITICAL! ' : '')+dmg, d.x, d.y-135, critical ? '#ffe88b' : '#ffffff');
  burst(d.x, d.y-80, critical ? '#ffe88b' : '#ffd0a0', critical ? 12 : 6);
  critical ? SFX.crit() : SFX.hit();
}

function fireWeapon(w, s, baseDamage){
  const shots = [];
  const x = P.x + P.facing*50, y = P.y;
  const crit = rollCritical(s);
  const dmg = Math.round(baseDamage*(crit ? s.critDamage : 1));

  if(w.ranged==='bolt'){
    shots.push({kind:'bolt', vx:P.facing*900, dist:760, pierce:0, r:8});
    SFX.tone(880,.08,'square',.05,.5);
  }
  if(w.ranged==='arrow'){
    shots.push({kind:'arrow', vx:P.facing*1100, dist:900, pierce:2, r:6});
    SFX.tone(1400,.06,'triangle',.05,.6);
  }
  if(w.ranged==='boomerang'){
    shots.push({kind:'boomerang', vx:P.facing*700, dist:430, pierce:99, r:14, out:true});
    SFX.tone(300,.2,'sawtooth',.04,1.6);
  }
  if(w.ranged==='shell'){
    shots.push({kind:'shell', vx:P.facing*650, dist:620, pierce:0, r:11, explode:130});
    SFX.noise(.18,.12,600);
    G.screenShake = Math.max(G.screenShake, 5);
    P.vx -= P.facing*120;
  }

  for(const sh of shots){
    X.pproj.push({...sh, x, y, h:70, sx:x, dmg, crit, color:w.color, hit:new Set(), spin:0, life:3});
  }
  burst(x, y-70, w.color, 6);
}

function projTargets(){
  if(G.scene==='hub') return X.dummies.map((d,i) => ({ref:d, id:'dummy'+i, x:d.x, y:d.y, dummy:true}));
  return G.enemies.filter(e => e.alive && e.world===G.worldId).map(e => ({ref:e, id:e.id, x:e.x, y:e.y}));
}

function projHit(p, t){
  if(t.dummy){
    hitDummy(t.ref, p.dmg, p.crit);
  }else{
    hurtEnemy(t.ref, p.dmg, p.crit);
    const r = curRole(), drain = (r.leech || 0) + petAbilityLevel('drain')*.02;
    if(drain){
      const st = getStats();
      P.hp = Math.min(st.maxHP, P.hp + Math.max(1, Math.round(p.dmg*drain)));
    }
  }
}

function explodeShell(p){
  burst(p.x, p.y-40, '#ff5a6a', 24);
  burst(p.x, p.y-40, '#ffd36a', 16);
  G.screenShake = Math.max(G.screenShake, 10);
  SFX.noise(.35,.16,500);
  X.waves.push({friendly:true, x:p.x, y:p.y, r:10, max:p.explode, speed:600, dmg:0, hit:new Set(), visualOnly:true});
  for(const t of projTargets()){
    if(Math.hypot(t.x-p.x, (t.y-p.y)/.5) < p.explode + 30) projHit(p, t);
  }
  p.dead = true;
}

function updatePlayerProjectiles(dt){
  for(const p of X.pproj){
    p.life -= dt;
    p.spin += dt*20;

    if(p.kind==='boomerang' && !p.out){
      const dx = P.x - p.x, dy = P.y - p.y, d = Math.hypot(dx, dy);
      p.x += dx/Math.max(1,d)*800*dt;
      p.y += dy/Math.max(1,d)*800*dt*.7;
      if(d < 40){ p.dead = true; continue; }
    }else{
      p.x += p.vx*dt;
      if(Math.abs(p.x - p.sx) > p.dist){
        if(p.kind==='boomerang'){ p.out = false; p.hit.clear(); }
        else if(p.explode){ explodeShell(p); continue; }
        else { p.dead = true; continue; }
      }
    }

    for(const t of projTargets()){
      if(p.hit.has(t.id)) continue;
      if(Math.abs(t.x - p.x) < 34 && Math.abs(t.y - p.y) < 55){
        if(p.explode){ explodeShell(p); break; }
        p.hit.add(t.id);
        projHit(p, t);
        if(p.pierce-- <= 0 && p.kind!=='boomerang'){ p.dead = true; break; }
      }
    }
    if(p.life <= 0) p.dead = true;
  }
  X.pproj = X.pproj.filter(p => !p.dead);
}

function drawPlayerProjectiles(cam){
  for(const p of X.pproj){
    const x = p.x - cam, y = p.y - p.h;
    ctx.save();
    ctx.globalAlpha = .25;
    ellipse(ctx, x, p.y, p.r, p.r*.35, '#000');
    ctx.globalAlpha = 1;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 16;

    if(p.kind==='bolt' || p.kind==='shell'){
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = .5;
      ctx.lineWidth = p.r*1.4;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.sign(p.vx)*40, y); ctx.stroke();
      ctx.globalAlpha = 1;
      ellipse(ctx, x, y, p.r, p.r, p.color);
      ellipse(ctx, x, y, p.r*.45, p.r*.45, '#ffffff');
    }
    if(p.kind==='arrow'){
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      const d = Math.sign(p.vx);
      ctx.beginPath(); ctx.moveTo(x - d*34, y); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.moveTo(x + d*10, y); ctx.lineTo(x - d*2, y-6); ctx.lineTo(x - d*2, y+6); ctx.closePath(); ctx.fill();
    }
    if(p.kind==='boomerang'){
      ctx.translate(x, y);
      ctx.rotate(p.spin);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-16,10); ctx.lineTo(0,-8); ctx.lineTo(16,10); ctx.stroke();
    }
    ctx.restore();
  }
}

// Burning enemies (Flame Gauntlets)
function updateBurning(dt){
  for(const e of G.enemies){
    if(!e.alive || !e.burn) continue;
    e.burn.t -= dt;
    e.burn.tick -= dt;
    if(Math.random() < .3) burst(e.x + rand(-20,20), e.y - rand(30,80), Math.random() < .5 ? '#ff7a2a' : '#ffd36a', 1);
    if(e.burn.tick <= 0){
      e.burn.tick = .5;
      hurtEnemy(e, e.burn.dmg, false);
    }
    if(e.burn && e.burn.t <= 0) e.burn = null;
  }
}

// Guardian Aegis blocks part of incoming damage
const hurtPlayerBase = hurtPlayer;
window.hurtPlayer = function(amount, sourceX){
  if(P.weapon && G.scene !== 'arena' && curWeapon().block){
    const blocking = P.attackTimer > 0;
    amount = Math.round(amount*(blocking ? .5 : .85));
    if(blocking && P.invuln <= 0){
      floatingText('BLOCK', P.x, P.y-140, '#ffcf6a');
      burst(P.x + P.facing*40, P.y-70, '#ffcf6a', 8);
    }
  }
  hurtPlayerBase(amount, sourceX);
};

const updateWeapons = window.update;
window.update = function(dt){
  updateWeapons(dt);
  if(G.paused) return;
  if(G.scene==='world' || G.scene==='hub') updatePlayerProjectiles(dt);
  else X.pproj.length = 0;
  if(G.scene==='world') updateBurning(dt);
};

const drawWeapons = window.draw;
window.draw = function(){
  drawWeapons();
  if(G.scene==='world') drawPlayerProjectiles(G.camera);
};

const drawHubWeapons = window.drawHub;
window.drawHub = function(){
  drawHubWeapons();
  ctx.save();
  ctx.translate(-X.hubCam, 0);
  drawPlayerProjectiles(0);
  ctx.restore();
};

const beginWorldWeapons = window.beginWorld;
window.beginWorld = function(id){
  X.pproj.length = 0;
  beginWorldWeapons(id);
};

const beginHubWeapons = window.beginHub;
window.beginHub = function(){
  X.pproj.length = 0;
  beginHubWeapons();
};


// Buttons that stored the old functions directly
$('saveBtn').onclick = window.saveGame;
$('pauseLoadBtn').onclick = window.loadGame;

})();
