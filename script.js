'use strict';

/* =========================================================
   MULTIVERSE: RIFTWALKER
   Full browser prototype
   - 31 worlds + The Hub
   - 1000 HP stat system
   - armor + pet bonuses
   - 93 collectible weapons + unlimited pair-based Rift Fusions + dual traits + critical hits
   - command tutorial + one-life stages
   - Rift Credits
   - custom-drawn 2.5D visuals (no emoji game art)
   - procedural SFX + "Across the Rift" adaptive music
   - private WebRTC Bonus Mode through PeerJS
   - V11 long-term progression: daily/weekly chronicles, weapon mastery, world mastery, Rift Tower, Boss Rush, anomalies and Ascension
   - V12 postgame corruption: hidden Corrupted Realm + optional corrupted versions of all 31 worlds
   - V13 divine endgame: Land of Gods + Master Mode for every original world
   - V14 Legends & Secrets: shrines, legendary hunts, treasure maps, talents, pet coliseum, arcade and world relics
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
  'frost',
  'volcano',
  'ocean',
  'jungle',
  'desert',
  'candy',
  'dream',
  'nightmare',
  'clockwork',
  'gravity',
  'tiny',
  'giant',
  'dino',
  'haunted',
  'pirate',
  'sky',
  'crystal',
  'storm',
  'robot',
  'mirror',
  'ink',
  'toybox',
  'labyrinth',
  'quantum',
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

  frost:{
    name:'Frostfall Kingdom',
    width:5600,
    skyA:'#8ed8ff',
    skyB:'#e8fbff',
    ground:'#9ccfe3',
    dark:'#173a55',
    boss:'The White Wyrm',
    mechanic:'Slippery Ice',
    gimmick:'ice',
    desc:'Cross a frozen kingdom where stopping is harder than moving. Break the White Wyrm’s endless winter.',
    accent:'#c9f5ff',
    enemyNames:[
      'Ice Fang',
      'Snow Crawler',
      'Frost Knight'
    ]
  },

  volcano:{
    name:'Magma Core',
    width:5500,
    skyA:'#35101b',
    skyB:'#d84c2e',
    ground:'#6b2b24',
    dark:'#1a090b',
    boss:'Magma Titan',
    mechanic:'Heat Waves',
    gimmick:'heat',
    desc:'The planet is cracking apart. Survive timed heat waves and shut down the Magma Titan.',
    accent:'#ff9a54',
    enemyNames:[
      'Lava Slime',
      'Cinder Hound',
      'Magma Beetle'
    ]
  },

  ocean:{
    name:'Abyssal Ocean',
    width:5700,
    skyA:'#073e68',
    skyB:'#1595b7',
    ground:'#176a7d',
    dark:'#031c31',
    boss:'Leviathan Prime',
    mechanic:'Deep Water',
    gimmick:'water',
    desc:'Dive through a drowned civilization. Movement is slower, jumps float longer, and something huge is below.',
    accent:'#63e9ff',
    enemyNames:[
      'Reef Stalker',
      'Abyss Eel',
      'Shell Brute'
    ]
  },

  jungle:{
    name:'Titan Jungle',
    width:5600,
    skyA:'#1e7748',
    skyB:'#8ed66d',
    ground:'#397a3f',
    dark:'#103321',
    boss:'Ancient Colossus',
    mechanic:'Living Vines',
    gimmick:'vines',
    desc:'The jungle itself is alive. Vines periodically grab the ground while you hunt the Ancient Colossus.',
    accent:'#9dff82',
    enemyNames:[
      'Vine Stalker',
      'Spore Beast',
      'Thorn Ape'
    ]
  },

  desert:{
    name:'Sunscar Desert',
    width:5800,
    skyA:'#ef9c4b',
    skyB:'#ffd889',
    ground:'#c88b47',
    dark:'#5a301c',
    boss:'Dune Emperor',
    mechanic:'Sandstorm',
    gimmick:'sand',
    desc:'Race between ruins as sandstorms reduce visibility and the Dune Emperor wakes beneath the dunes.',
    accent:'#ffe08a',
    enemyNames:[
      'Dune Crawler',
      'Scarab Guard',
      'Sand Wraith'
    ]
  },

  candy:{
    name:'Sugar Rush Realm',
    width:5200,
    skyA:'#ff9ed8',
    skyB:'#b8f0ff',
    ground:'#e28ac2',
    dark:'#63305e',
    boss:'Candy Crusher',
    mechanic:'Sugar Rush',
    gimmick:'sugar',
    desc:'Collecting energy makes you faster, but the whole world speeds up with you.',
    accent:'#fff08a',
    enemyNames:[
      'Gummy Goon',
      'Sour Slime',
      'Jawbreaker Beast'
    ]
  },

  dream:{
    name:'Dreamscape',
    width:5500,
    skyA:'#6250b8',
    skyB:'#f1aee8',
    ground:'#7668ae',
    dark:'#241c55',
    boss:'The Sleeper',
    mechanic:'Dream Shift',
    gimmick:'dream',
    desc:'Reality softly changes around you. Every few seconds your movement rhythm shifts inside the Sleeper’s dream.',
    accent:'#e8c5ff',
    enemyNames:[
      'Cloudling',
      'Dream Moth',
      'Sleepwalker'
    ]
  },

  nightmare:{
    name:'Nightmare Realm',
    width:5500,
    skyA:'#17091f',
    skyB:'#691b45',
    ground:'#3d1735',
    dark:'#08040d',
    boss:'Fear Eater',
    mechanic:'Fear Meter',
    gimmick:'fear',
    desc:'Stay moving. Standing still lets the darkness close in and feed the Fear Eater.',
    accent:'#ff6baf',
    enemyNames:[
      'Dreadling',
      'Night Claw',
      'Fear Hound'
    ]
  },

  clockwork:{
    name:'Clockwork City',
    width:5600,
    skyA:'#745633',
    skyB:'#e6bd72',
    ground:'#82643c',
    dark:'#2e251b',
    boss:'Grand Chronarch',
    mechanic:'Time Pulse',
    gimmick:'time',
    desc:'The city alternates between fast time and slow time while the Grand Chronarch rewinds its machines.',
    accent:'#ffd77a',
    enemyNames:[
      'Gearling',
      'Clock Guard',
      'Spring Spider'
    ]
  },

  gravity:{
    name:'Gravity Forge',
    width:5700,
    skyA:'#151b4e',
    skyB:'#7148a7',
    ground:'#4a4475',
    dark:'#0a0d28',
    boss:'Mass Sovereign',
    mechanic:'Gravity Flip',
    gimmick:'gravity',
    desc:'Gravity strength changes without warning. Master giant jumps and heavy landings to reach the Mass Sovereign.',
    accent:'#b594ff',
    enemyNames:[
      'Mass Orb',
      'Gravity Hound',
      'Forge Sentinel'
    ]
  },

  tiny:{
    name:'Micro Kingdom',
    width:5100,
    skyA:'#7acb74',
    skyB:'#e9e48c',
    ground:'#5c9149',
    dark:'#254328',
    boss:'Garden Tyrant',
    mechanic:'Tiny Scale',
    gimmick:'tiny',
    desc:'You are tiny. Grass becomes a forest, puddles become lakes, and insects become monsters.',
    accent:'#d9ff85',
    enemyNames:[
      'Ant Knight',
      'Beetle Tank',
      'Mite Raider'
    ]
  },

  giant:{
    name:'Colossus World',
    width:6000,
    skyA:'#6886a8',
    skyB:'#d6c2a1',
    ground:'#70675d',
    dark:'#2e3540',
    boss:'World Giant',
    mechanic:'Colossal Shockwaves',
    gimmick:'giant',
    desc:'Everything towers above you. Massive footsteps send shockwaves across the stage.',
    accent:'#ffc889',
    enemyNames:[
      'Stone Foot',
      'Colossus Spawn',
      'Titan Hand'
    ]
  },

  dino:{
    name:'Primeval Wilds',
    width:5800,
    skyA:'#5cae72',
    skyB:'#d7dc75',
    ground:'#5d8247',
    dark:'#1f432d',
    boss:'Rex Alpha',
    mechanic:'Stampede',
    gimmick:'stampede',
    desc:'A prehistoric world caught in a permanent stampede. Reach Rex Alpha before the herd catches you.',
    accent:'#b9ef76',
    enemyNames:[
      'Raptor',
      'Tricera Guard',
      'Ptero Hunter'
    ]
  },

  haunted:{
    name:'Haunted Hollow',
    width:5400,
    skyA:'#1e2348',
    skyB:'#605381',
    ground:'#3f455c',
    dark:'#0c1025',
    boss:'The Bell Keeper',
    mechanic:'Ghost Phase',
    gimmick:'ghost',
    desc:'Ghosts phase in and out of reality. Attack only when their forms become solid.',
    accent:'#b7d7ff',
    enemyNames:[
      'Lantern Ghost',
      'Grave Hound',
      'Phantom Knight'
    ]
  },

  pirate:{
    name:'Pirate Archipelago',
    width:5700,
    skyA:'#42a5c9',
    skyB:'#ffd08c',
    ground:'#b47a47',
    dark:'#163b4b',
    boss:'Captain Riftbeard',
    mechanic:'Cannon Barrage',
    gimmick:'cannon',
    desc:'Island forts fire warning shots before cannonballs crash down. Board Riftbeard’s flagship.',
    accent:'#ffdf7e',
    enemyNames:[
      'Deck Raider',
      'Cannon Crab',
      'Cutlass Gull'
    ]
  },

  sky:{
    name:'Sky Islands',
    width:5600,
    skyA:'#6dc9ff',
    skyB:'#eefcff',
    ground:'#7fae86',
    dark:'#28506b',
    boss:'Storm Roc',
    mechanic:'Wind Gusts',
    gimmick:'wind',
    desc:'Floating islands drift above the clouds while powerful gusts push every jump sideways.',
    accent:'#dffaff',
    enemyNames:[
      'Cloud Ray',
      'Gale Sprite',
      'Sky Talon'
    ]
  },

  crystal:{
    name:'Crystal Caverns',
    width:5500,
    skyA:'#26375d',
    skyB:'#6f56a5',
    ground:'#4d5677',
    dark:'#11182f',
    boss:'Prism Dragon',
    mechanic:'Crystal Resonance',
    gimmick:'crystal',
    desc:'Crystal walls amplify critical hits. Build resonance and shatter the Prism Dragon’s armor.',
    accent:'#8ff7ff',
    enemyNames:[
      'Shardling',
      'Prism Beetle',
      'Crystal Golem'
    ]
  },

  storm:{
    name:'Tempest Planet',
    width:5700,
    skyA:'#263149',
    skyB:'#657b8f',
    ground:'#465767',
    dark:'#101722',
    boss:'Thunder Lord',
    mechanic:'Lightning Warning',
    gimmick:'lightning',
    desc:'The ground flashes before lightning strikes. Read the warning rhythm and keep moving.',
    accent:'#fff57a',
    enemyNames:[
      'Spark Hound',
      'Volt Wisp',
      'Thunder Brute'
    ]
  },

  robot:{
    name:'Mecha Metropolis',
    width:5600,
    skyA:'#1a3c55',
    skyB:'#4d8290',
    ground:'#405866',
    dark:'#0d202b',
    boss:'Omega Unit',
    mechanic:'Security Alert',
    gimmick:'security',
    desc:'Alarms raise enemy power over time. Destroy the Omega Unit before the city reaches maximum alert.',
    accent:'#65f1e7',
    enemyNames:[
      'Patrol Bot',
      'Laser Hound',
      'Mecha Guard'
    ]
  },

  mirror:{
    name:'Mirror Dimension',
    width:5400,
    skyA:'#a9d4e6',
    skyB:'#e9d5f5',
    ground:'#8ba3b4',
    dark:'#3b4760',
    boss:'Your Reflection',
    mechanic:'Mirrored Controls',
    gimmick:'mirror',
    desc:'The dimension periodically mirrors left and right. At the end, your own reflection waits.',
    accent:'#ffffff',
    enemyNames:[
      'Mirrorling',
      'Glass Knight',
      'Echo Clone'
    ]
  },

  ink:{
    name:'Inkbound Realm',
    width:5300,
    skyA:'#e8dfc8',
    skyB:'#b9ad91',
    ground:'#77705f',
    dark:'#171714',
    boss:'The Illustrator',
    mechanic:'Ink Flood',
    gimmick:'ink',
    desc:'A hand-drawn world is being erased. Dark ink slowly floods the edges of the battlefield.',
    accent:'#f5e8c5',
    enemyNames:[
      'Ink Blob',
      'Scribble Hound',
      'Paper Knight'
    ]
  },

  toybox:{
    name:'Toybox Galaxy',
    width:5300,
    skyA:'#5fb6e8',
    skyB:'#ffd783',
    ground:'#c67d5d',
    dark:'#3d2945',
    boss:'King Playtime',
    mechanic:'Bouncy Floor',
    gimmick:'bounce',
    desc:'Everything is a toy and the floor refuses to stay still. Bounce through King Playtime’s giant playroom.',
    accent:'#ff7fb5',
    enemyNames:[
      'Block Bot',
      'Windup Dino',
      'Marble Beast'
    ]
  },

  labyrinth:{
    name:'Endless Labyrinth',
    width:5900,
    skyA:'#38444b',
    skyB:'#8a927c',
    ground:'#62685a',
    dark:'#1c2422',
    boss:'Maze Mind',
    mechanic:'Shifting Maze',
    gimmick:'maze',
    desc:'The maze changes its rules as you travel. Wrong turns awaken stronger guardians.',
    accent:'#c9e68b',
    enemyNames:[
      'Maze Hound',
      'Wall Mimic',
      'Lost Sentinel'
    ]
  },

  quantum:{
    name:'Quantum Rift',
    width:5800,
    skyA:'#121643',
    skyB:'#8b3fd1',
    ground:'#423f7e',
    dark:'#07091e',
    boss:'Probability Zero',
    mechanic:'Quantum Chance',
    gimmick:'quantum',
    desc:'Damage, speed and critical chance fluctuate as realities overlap. Collapse Probability Zero.',
    accent:'#ff8cf4',
    enemyNames:[
      'Phase Bit',
      'Quantum Wisp',
      'Chance Beast'
    ]
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
  },

  corruptrealm:{
    name:'The Corrupted Realm',
    width:9800,
    skyA:'#120018',
    skyB:'#4a073f',
    ground:'#25102d',
    dark:'#020104',
    boss:'The Corruption Heart',
    mechanic:'Corruption Storm',
    gimmick:'corruption',
    desc:'A forbidden realm born from damaged Rift code. Defeat the Corruption Heart and unlock optional Corrupted Mode.',
    accent:'#ff3bd4',
    enemyNames:[
      'Corrupted Husk',
      'Error Stalker',
      'Rift Parasite'
    ]
  },

  godrealm:{
    name:'The Land of Gods',
    width:11200,
    skyA:'#3f66a8',
    skyB:'#f7d98b',
    ground:'#a8b97a',
    dark:'#172341',
    boss:'Astraeus, First God',
    mechanic:'Divine Trials',
    gimmick:'divine',
    desc:'A hidden celestial realm beyond corruption. Survive ten divine trials and defeat Astraeus to awaken Master Mode.',
    accent:'#fff0a3',
    enemyNames:[
      'Halo Sentinel',
      'Aether Knight',
      'Divine Beast'
    ]
  }

};


/* =========================================================
   LONG WORLD SYSTEM
   Earth keeps its hand-authored opening story length. Every
   world after Earth is roughly 75% longer and split into
   three named regions, with more enemies, more fragments and
   two Rift Wells so the extra distance has real gameplay.
   ========================================================= */

const WORLD_FRAGMENT_GOAL = 8;
const WAR_BEACON_GOAL = 4;
const LONG_WORLD_SCALE = 1.75;

for(const id of WORLD_ORDER){
  if(id !== 'earth'){
    WORLDS[id].width =
      Math.round(
        WORLDS[id].width * LONG_WORLD_SCALE / 100
      ) * 100;
  }
}

const WORLD_ZONE_NAMES = {

  music:[
    'Neon Backstreets',
    'Bassline District',
    'Silent Citadel'
  ],

  money:[
    'Market Row',
    'Golden Vaults',
    'Greed Palace'
  ],

  cosmos:[
    'Orbital Docks',
    'Nebula Expanse',
    'Gravity Maw'
  ],

  war:[
    'Broken Front',
    'Titan Trenches',
    'War Factory'
  ],

  void:[
    'Shattered Edge',
    'Abyss Corridor',
    'Warden Throne'
  ],

  frost:[
    'Snowbound Village',
    'Glacier Pass',
    'Wyrm Keep'
  ],

  volcano:[
    'Ash Fields',
    'Lava Foundry',
    'Titan Crater'
  ],

  ocean:[
    'Sunken Gardens',
    'Abyss Trench',
    'Leviathan Ruins'
  ],

  jungle:[
    'Emerald Canopy',
    'Temple Wilds',
    'Colossus Grove'
  ],

  desert:[
    'Sunken Road',
    'Scarab Ruins',
    'Emperor Dunes'
  ],

  candy:[
    'Gumdrop Hills',
    'Syrup Speedway',
    'Crusher Castle'
  ],

  dream:[
    'Cloud Meadow',
    'Impossible City',
    'Sleeper Palace'
  ],

  nightmare:[
    'Whisper Woods',
    'Hall of Fear',
    'Fear Eater Lair'
  ],

  clockwork:[
    'Gear Market',
    'Chrono Works',
    'Grand Clocktower'
  ],

  gravity:[
    'Float Yard',
    'Mass Foundry',
    'Sovereign Core'
  ],

  tiny:[
    'Grassblade Forest',
    'Puddle Coast',
    'Garden Throne'
  ],

  giant:[
    'Footstep Plains',
    'Colossus Causeway',
    'World Giant Ridge'
  ],

  dino:[
    'Fern Basin',
    'Stampede Valley',
    'Rex Territory'
  ],

  haunted:[
    'Moonlit Graves',
    'Phantom Village',
    'Bell Tower'
  ],

  pirate:[
    'Driftwood Cay',
    'Cannon Strait',
    'Riftbeard Flagship'
  ],

  sky:[
    'Cloudstep Isles',
    'Gale Bridges',
    'Storm Roc Nest'
  ],

  crystal:[
    'Shard Tunnels',
    'Prism Cathedral',
    'Dragon Chamber'
  ],

  storm:[
    'Rainbreak Flats',
    'Thunder Fields',
    'Tempest Crown'
  ],

  robot:[
    'Service Sector',
    'Security Grid',
    'Omega Tower'
  ],

  mirror:[
    'Silver Shore',
    'Reflection Hall',
    'Echo Throne'
  ],

  ink:[
    'Paper Fields',
    'Scribble City',
    'Illustrator Studio'
  ],

  toybox:[
    'Block Town',
    'Windup Raceway',
    'Playtime Palace'
  ],

  labyrinth:[
    'Outer Maze',
    'Moving Corridors',
    'Maze Mind Core'
  ],

  quantum:[
    'Split Reality',
    'Probability Storm',
    'Zero Point'
  ],

  matrix:[
    'Data Fringe',
    'Perfect Grid',
    'Error Kernel'
  ],

  corruptrealm:[
    'Broken Threshold',
    'Infection Expanse',
    'Corruption Heart'
  ],

  godrealm:[
    'Golden Causeway',
    'Pantheon Heights',
    'Throne Beyond Stars'
  ]

};


/* =========================================================
   WORLD SEGMENT SYSTEM
   Every world now has between 5 and 10 numbered segments.
   Segment counts vary by world so the campaign feels less
   repetitive. There are 238 original-world segments, plus
   the Corrupted Realm and Land of Gods endgame stages.
   ========================================================= */
const WORLD_SEGMENTS={
  earth:['Crash Landing','Wreckage Trail','Overgrown Ruins','Crystal Caves','Signal Highlands','Ancient Gate','Ruin Guardian'],
  music:['Neon Backstreets','Rhythm Alley','Synth Station','Bassline District','Echo Underground','Festival Heights','Silent Citadel','Silence King'],
  money:['Market Row','Coin Canals','Merchant Quarter','Golden Mines','Vault District','Greed Palace','Greed Golem'],
  cosmos:['Orbital Docks','Moonlet Fields','Comet Highway','Nebula Expanse','Broken Station','Starforge Belt','Gravity Maw','Gravity Maw Core'],
  war:['Broken Front','Ember Trenches','Drone Yard','Iron Bridge','Bunker Line','Siege Foundry','Titan Trenches','War Factory','War Machine'],
  void:['Shattered Edge','Whisper Chasm','Null Gardens','Shadow Causeway','Rift Cathedral','Abyss Corridor','Warden Throne','Abyss Warden'],
  frost:['Snowbound Village','Frozen Pines','Ice Caverns','Glacier Pass','Aurora Lake','Wyrm Keep','The White Wyrm'],
  volcano:['Ash Fields','Cinder Ridge','Lava Tunnels','Obsidian Works','Magma Foundry','Titan Crater','Magma Titan'],
  ocean:['Coral Shelf','Sunken Gardens','Kelp Ruins','Tide Temple','Drowned City','Midnight Trench','Abyss Gate','Leviathan Ruins','Leviathan Prime'],
  jungle:['Emerald Canopy','Vine Marsh','Spore Hollow','Lost Camp','Temple Wilds','Predator Basin','Colossus Grove','Ancient Colossus'],
  desert:['Sunscar Road','Mirage Flats','Scarab Ruins','Buried Bazaar','Sandstorm Canyon','Emperor Dunes','Dune Emperor'],
  candy:['Gumdrop Hills','Taffy Town','Syrup Speedway','Soda Caverns','Crusher Castle','Candy Crusher'],
  dream:['Cloud Meadow','Floating Bedroom','Impossible City','Memory Garden','Upside-Down Station','Lucid Sea','Sleeper Palace','The Sleeper'],
  nightmare:['Whisper Woods','Crooked Village','Dread Hall','Fear Tunnels','Broken Nursery','Black Lake','Eater\'s Lair','Fear Eater'],
  clockwork:['Gear Market','Copper Avenue','Springworks','Pendulum Bridge','Minute Mines','Chrono Works','Hourglass District','Grand Clocktower','Grand Chronarch'],
  gravity:['Float Yard','Zero-G Docks','Mass Quarry','Inversion Bridge','Gravity Foundry','Sovereign Core','Mass Sovereign'],
  tiny:['Grassblade Forest','Dewdrop Marsh','Puddle Coast','Picnic Ruins','Garden Throne','Garden Tyrant'],
  giant:['Footstep Plains','Colossus Causeway','Titan Tablelands','Giant Workshop','Mountain Stair','World Giant Ridge','World Giant'],
  dino:['Fern Basin','Raptor Run','Fossil River','Ptero Cliffs','Stampede Valley','Volcanic Nest','Rex Territory','Rex Alpha'],
  haunted:['Moonlit Graves','Phantom Village','Candlewood','Haunted Manor','Spirit Crossing','Bell Tower','The Bell Keeper'],
  pirate:['Driftwood Cay','Smuggler Cove','Cannon Strait','Kraken Waters','Treasure Atoll','Fort Blackpowder','Riftbeard Flagship','Captain Riftbeard'],
  sky:['Cloudstep Isles','Feather Falls','Gale Bridges','Nimbus Port','Lightning Ladder','Storm Roc Nest','Storm Roc'],
  crystal:['Shard Tunnels','Gemstone Lake','Prism Mines','Mirror Crystals','Resonance Hall','Dragon Chamber','Prism Dragon'],
  storm:['Rainbreak Flats','Static Forest','Thunder Fields','Cyclone Pass','Stormworks','Lightning Spire','Tempest Crown','Thunder Lord'],
  robot:['Service Sector','Assembly Lane','Drone Depot','Mag-Rail District','Security Grid','Firewall Foundry','Machine Core','Omega Tower','Omega Unit'],
  mirror:['Silver Shore','Reflection Hall','Reversed City','Glass Maze','Echo Throne','Your Reflection'],
  ink:['Paper Fields','Sketch Woods','Scribble City','Ink River','Erased District','Illustrator Studio','The Illustrator'],
  toybox:['Block Town','Marble Garden','Windup Raceway','Puzzle Factory','Playtime Palace','King Playtime'],
  labyrinth:['Outer Maze','Forked Halls','Moving Corridors','False Exit','Mirror Passage','Trap Gallery','Lost Center','Impossible Stairs','Maze Mind Core','Maze Mind'],
  quantum:['Split Reality','Particle Fields','Superposition City','Chance Corridor','Entangled Station','Probability Storm','Collapse Zone','Zero Point','Probability Zero'],
  matrix:['Data Fringe','Boot Sector','Vector City','Code Canals','Glitch District','Firewall Heights','Perfect Grid','Kernel Vault','Error Kernel','Perfect Error'],
  corruptrealm:['Forbidden Signal','Broken Threshold','Static Wastes','Infection Forest','Glitch Cathedral','Null Ocean','Fractured City','Corruption Spire','Heart Chamber','The Corruption Heart'],
  godrealm:['Gate of Dawn','Golden Causeway','Cloud Colosseum','Temple of Storms','Garden of Eternity','Aether Sea','Hall of Titans','Pantheon Heights','Throne Beyond Stars','Astraeus, First God']
};

const TOTAL_WORLD_SEGMENTS=
  Object.values(WORLD_SEGMENTS)
    .reduce((n,a)=>n+a.length,0);

let WORLD_SEGMENT_INDEX=0;
let SEGMENT_BANNER_TIMER=0;

function zoneNames(id){
  return WORLD_ZONE_NAMES[id]||
    ['Outer Region','Deep Region','Core Region'];
}

function segmentNames(id){
  return WORLD_SEGMENTS[id]||
    [...zoneNames(id),WORLDS[id]?.boss||'Boss Showdown'];
}

function segmentCount(id){
  return segmentNames(id).length;
}

function worldNumber(id){
  return id==='corruptrealm'
    ?32
    :id==='godrealm'
      ?33
      :Math.max(1,WORLD_ORDER.indexOf(id)+1);
}

function segmentCode(
  id,
  index=WORLD_SEGMENT_INDEX
){
  return worldNumber(id)+'-'+(index+1);
}

function segmentIndexForX(id,x){

  const w=WORLDS[id];
  const count=segmentCount(id);

  if(!w)return 0;

  return clamp(
    Math.floor(
      clamp(x/w.width,0,.9999)*count
    ),
    0,
    count-1
  );
}

function currentSegmentName(){

  return G.worldId
    ?segmentNames(G.worldId)[WORLD_SEGMENT_INDEX]||
      'Unknown Segment'
    :'';
}

function showSegmentBanner(
  index=WORLD_SEGMENT_INDEX
){

  if(!G.worldId)return;

  WORLD_SEGMENT_INDEX=index;
  SEGMENT_BANNER_TIMER=2.7;

  const el=$('segmentBanner');

  if(!el)return;

  const code=
    segmentCode(G.worldId,index);

  const name=
    segmentNames(G.worldId)[index];

  const world=
    WORLDS[G.worldId].name;

  $('segmentCode').textContent=code;

  $('segmentName').textContent=
    name.toUpperCase();

  $('segmentWorld').textContent=
    world.toUpperCase();

  el.classList.remove('hidden');

  el.classList.remove('segmentPop');

  void el.offsetWidth;

  el.classList.add('segmentPop');
}

function freshProgress(){

  return{
    fragments:0,
    bossDefeated:false,
    petFound:[],
    beacons:0,
    storyStage:0,
    shipParts:0,
    chests:[],
    segmentRewards:[]
  };
}

function runProgress(id=G.worldId){

  if(
    P.masterRun&&
    WORLD_ORDER.includes(id)
  ){

    G.masterProgress[id]=
      G.masterProgress[id]||
      freshProgress();

    return G.masterProgress[id];
  }

  if(
    P.corruptedRun&&
    WORLD_ORDER.includes(id)
  ){

    G.corruptedProgress[id]=
      G.corruptedProgress[id]||
      freshProgress();

    return G.corruptedProgress[id];
  }

  G.progress[id]=
    G.progress[id]||
    freshProgress();

  return G.progress[id];
}

function fragmentGoal(id=G.worldId){

  return id==='godrealm'
    ?14
    :id==='corruptrealm'
      ?12
      :(
        P.masterRun
          ?12
          :P.corruptedRun
            ?10
            :WORLD_FRAGMENT_GOAL
      );
}

function updateWorldSegment(dt){

  if(SEGMENT_BANNER_TIMER>0){

    SEGMENT_BANNER_TIMER-=dt;

    if(SEGMENT_BANNER_TIMER<=0){

      $('segmentBanner')
        ?.classList
        .add('hidden');
    }
  }

  if(
    G.scene!=='world'||
    !G.worldId
  )return;

  const w=WORLDS[G.worldId];

  const pr=
    runProgress(G.worldId);

  const count=
    segmentCount(G.worldId);

  const next=
    segmentIndexForX(
      G.worldId,
      P.x
    );

  if(
    next===
    WORLD_SEGMENT_INDEX
  )return;

  WORLD_SEGMENT_INDEX=next;

  showSegmentBanner(next);

  pr.segmentRewards=
    pr.segmentRewards||[];

  if(
    next>0&&
    !pr.segmentRewards.includes(next)
  ){

    pr.segmentRewards.push(next);

    const bonus=
      30+
      worldNumber(G.worldId)*4;

    addCredits(bonus);

    floatingText(
      'SEGMENT +'+bonus,
      P.x,
      P.y-135,
      '#9ff6ff'
    );
  }

  const name=
    segmentNames(G.worldId)[next];

  if(
    G.worldId==='earth'&&
    !P.corruptedRun&&
    !P.masterRun
  ){

    updateEarthQuest();

  }else if(!pr.bossDefeated){

    if(next===count-1){

      if(
        pr.fragments>=fragmentGoal()&&
        (
          G.worldId!=='war'||
          P.corruptedRun||
          P.masterRun||
          pr.beacons>=WAR_BEACON_GOAL
        )
      ){

        quest(
          segmentCode(G.worldId,next)+
          ' • '+
          name,

          'The path is open. Defeat '+
          w.boss+
          '.'
        );

      }else{

        quest(
          segmentCode(G.worldId,next)+
          ' • '+
          name,

          'Final approach · Rift Fragments '+
          pr.fragments+
          ' / '+
          fragmentGoal()+
          '.'
        );
      }

    }else{

      quest(
        segmentCode(G.worldId,next)+
        ' • '+
        name,

        'Segment '+
        (next+1)+
        ' / '+
        count+
        ' · Rift Fragments '+
        pr.fragments+
        ' / '+
        fragmentGoal()+
        ' · Push toward '+
        w.boss+
        '.'
      );
    }
  }

  syncHUD();
}


/* =========================================================
   PET ROSTERS
   ========================================================= */

const PET_ROSTERS={

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

  frost:[
    'Snow Fox',
    'Ice Hare',
    'Frost Owl',
    'Glacier Pup'
  ],

  volcano:[
    'Ember Cub',
    'Lava Gecko',
    'Cinder Bat',
    'Magma Ram'
  ],

  ocean:[
    'Bubble Otter',
    'Reef Ray',
    'Aqua Pup',
    'Pearl Turtle'
  ],

  jungle:[
    'Leaf Monkey',
    'Vine Cat',
    'Spore Frog',
    'Jungle Cub'
  ],

  desert:[
    'Dune Fox',
    'Scarab Pal',
    'Cactus Pup',
    'Sun Hawk'
  ],

  candy:[
    'Gummy Bear',
    'Sugar Bunny',
    'Mint Fox',
    'Candy Dragon'
  ],

  dream:[
    'Cloud Cat',
    'Dream Bunny',
    'Star Sheep',
    'Pillow Wisp'
  ],

  nightmare:[
    'Dusk Pup',
    'Shadow Crow',
    'Fearling',
    'Moon Bat'
  ],

  clockwork:[
    'Gear Mouse',
    'Tick Tock Owl',
    'Spring Fox',
    'Cog Pup'
  ],

  gravity:[
    'Orbit Cat',
    'Mass Bunny',
    'Float Ray',
    'Gravity Cub'
  ],

  tiny:[
    'Pocket Ant',
    'Mini Beetle',
    'Dew Frog',
    'Seed Mouse'
  ],

  giant:[
    'Pebble Pup',
    'Titan Finch',
    'Boulder Cub',
    'Colossus Hare'
  ],

  dino:[
    'Raptor Pup',
    'Tricera Calf',
    'Ptero Chick',
    'Fern Lizard'
  ],

  haunted:[
    'Ghost Cat',
    'Lantern Pup',
    'Spirit Owl',
    'Phantom Bunny'
  ],

  pirate:[
    'Parrot Pup',
    'Treasure Crab',
    'Deck Cat',
    'Cannon Turtle'
  ],

  sky:[
    'Cloud Pup',
    'Gale Finch',
    'Nimbus Cat',
    'Sky Ray'
  ],

  crystal:[
    'Prism Fox',
    'Shard Bunny',
    'Gem Gecko',
    'Crystal Owl'
  ],

  storm:[
    'Spark Pup',
    'Volt Bunny',
    'Thunder Hawk',
    'Rain Cat'
  ],

  robot:[
    'Servo Pup',
    'Circuit Cat',
    'Drone Bird',
    'Mecha Bunny'
  ],

  mirror:[
    'Echo Cat',
    'Glass Fox',
    'Reflection Pup',
    'Silver Hare'
  ],

  ink:[
    'Doodle Cat',
    'Paper Pup',
    'Ink Bunny',
    'Sketch Bird'
  ],

  toybox:[
    'Block Pup',
    'Windup Cat',
    'Marble Bunny',
    'Plush Dragon'
  ],

  labyrinth:[
    'Compass Fox',
    'Maze Mouse',
    'Thread Cat',
    'Key Pup'
  ],

  quantum:[
    'Quark Cat',
    'Phase Bunny',
    'Photon Fox',
    'Chance Wisp'
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
  ],

  corruptrealm:[
    'Error Hound',
    'Static Seraph',
    'Null Bunny',
    'Corruption Moth',
    'Fracture Fox',
    'Virus Dragon',
    'Broken Bot',
    'Heartling'
  ],

  godrealm:[
    'Sun Lion',
    'Halo Hare',
    'Aether Owl',
    'Cloud Kirin',
    'Thunder Stag',
    'Rune Seraph',
    'Star Wolf',
    'Divine Dragon'
  ]
};


/* =========================================================
   PET TYPES
   ========================================================= */

const PET_TYPES={

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


/* =========================================================
   PET STAT BONUSES
   ========================================================= */

const PET_BONUS={

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
   UNIQUE PET DNA + SIGNATURE GIMMICKS

   Every base pet gets a deterministic visual identity and a
   two-part gameplay kit:
   one companion attack + one passive.
   ========================================================= */

const PET_WORLD_TYPES={

  earth:'Nature / Earth',
  music:'Sound / Light',
  money:'Fortune / Earth',
  cosmos:'Cosmic / Spirit',
  war:'Tech / Fire',
  void:'Void / Dark',

  frost:'Ice / Light',
  volcano:'Fire / Earth',
  ocean:'Water / Spirit',
  jungle:'Nature / Poison',
  desert:'Sun / Earth',
  candy:'Sugar / Light',

  dream:'Dream / Spirit',
  nightmare:'Dark / Fear',
  clockwork:'Time / Tech',
  gravity:'Gravity / Cosmic',
  tiny:'Nature / Mini',
  giant:'Earth / Titan',

  dino:'Primeval / Earth',
  haunted:'Spirit / Dark',
  pirate:'Water / Fortune',
  sky:'Wind / Light',
  crystal:'Crystal / Light',
  storm:'Storm / Electric',

  robot:'Tech / Electric',
  mirror:'Mirror / Light',
  ink:'Ink / Spirit',
  toybox:'Toy / Wonder',
  labyrinth:'Mystic / Earth',
  quantum:'Quantum / Cosmic',

  matrix:'Glitch / Tech',
  corruptrealm:'Corruption / Rift',
  godrealm:'Divine / Aether'
};


const PET_WORLD_PALETTES={

  earth:[
    '#79d37a',
    '#b7f08d',
    '#5fb8a0'
  ],

  music:[
    '#6cecff',
    '#ff70d8',
    '#9b7cff'
  ],

  money:[
    '#ffd65a',
    '#d99b43',
    '#8be3a3'
  ],

  cosmos:[
    '#8eb7ff',
    '#c391ff',
    '#73f1ea'
  ],

  war:[
    '#ff7b5e',
    '#9aa8b7',
    '#ffd06a'
  ],

  void:[
    '#a477ff',
    '#542d78',
    '#e39cff'
  ],

  frost:[
    '#c9f8ff',
    '#75cfff',
    '#eefeff'
  ],

  volcano:[
    '#ff7545',
    '#ffb14f',
    '#6f3340'
  ],

  ocean:[
    '#5be5ff',
    '#4e9fff',
    '#8cf0ca'
  ],

  jungle:[
    '#70dc72',
    '#b5ed67',
    '#4a9c77'
  ],

  desert:[
    '#ffd46c',
    '#e99b4d',
    '#fff0b0'
  ],

  candy:[
    '#ff7ec8',
    '#8eeeff',
    '#fff176'
  ],

  dream:[
    '#d9b2ff',
    '#8fdcff',
    '#ffe3fb'
  ],

  nightmare:[
    '#ff5ba8',
    '#6e4a9e',
    '#2f2448'
  ],

  clockwork:[
    '#ffd071',
    '#b88a55',
    '#78e9df'
  ],

  gravity:[
    '#a98cff',
    '#70d9ff',
    '#e6dcff'
  ],

  tiny:[
    '#c9ef6b',
    '#73d8a0',
    '#fff5a2'
  ],

  giant:[
    '#d7a36b',
    '#8b765f',
    '#ffc77c'
  ],

  dino:[
    '#a7df6d',
    '#5da46d',
    '#e3c56d'
  ],

  haunted:[
    '#b9dcff',
    '#a77dff',
    '#eefaff'
  ],

  pirate:[
    '#ffd568',
    '#58b7d8',
    '#9a5d43'
  ],

  sky:[
    '#dffaff',
    '#79ddff',
    '#ffffff'
  ],

  crystal:[
    '#7ef5ff',
    '#ff9df5',
    '#d8b6ff'
  ],

  storm:[
    '#fff35d',
    '#72dcff',
    '#8d7cff'
  ],

  robot:[
    '#5ef3e5',
    '#8298ad',
    '#ff6f78'
  ],

  mirror:[
    '#eefcff',
    '#c7b3ff',
    '#92dfff'
  ],

  ink:[
    '#f1e6c8',
    '#222735',
    '#77c7ff'
  ],

  toybox:[
    '#ff7eb9',
    '#ffe36e',
    '#78d9ff'
  ],

  labyrinth:[
    '#cce88c',
    '#b29b68',
    '#e9ffd4'
  ],

  quantum:[
    '#ff82f0',
    '#7cecff',
    '#a784ff'
  ],

  matrix:[
    '#62f4ff',
    '#e45cff',
    '#7cffaa'
  ],

  corruptrealm:[
    '#7c2dff',
    '#ff3eaf',
    '#e8a4ff'
  ],

  godrealm:[
    '#fff2a8',
    '#9be8ff',
    '#ffffff'
  ]
};


const PET_ATTACK_GIMMICKS=[

  {
    id:'ricochet',
    label:'Ricochet Spark',
    desc:'shot jumps to another nearby enemy'
  },

  {
    id:'burst',
    label:'Burst Bloom',
    desc:'impact splashes damage around the target'
  },

  {
    id:'freeze',
    label:'Chill Bite',
    desc:'slows the target after every companion hit'
  },

  {
    id:'stun',
    label:'Stagger Pulse',
    desc:'has a chance to briefly stun normal enemies'
  },

  {
    id:'burn',
    label:'Ember Mark',
    desc:'adds a second burst of delayed fire damage'
  },

  {
    id:'leech',
    label:'Life Thread',
    desc:'returns part of companion damage as HP'
  },

  {
    id:'execute',
    label:'Finisher Instinct',
    desc:'deals extra damage to weakened enemies'
  },

  {
    id:'boss',
    label:'Boss Breaker',
    desc:'deals extra companion damage to bosses'
  },

  {
    id:'rapid',
    label:'Double Tap',
    desc:'fires a smaller follow-up hit'
  },

  {
    id:'guard',
    label:'Guardian Ping',
    desc:'grants a short invulnerability pulse when it attacks'
  },

  {
    id:'push',
    label:'Repulse Paw',
    desc:'knocks normal enemies away from you'
  },

  {
    id:'crit',
    label:'Precision Flash',
    desc:'sometimes turns its companion hit into a critical strike'
  },

  {
    id:'heal',
    label:'Mending Note',
    desc:'heals you slightly whenever its attack lands'
  },

  {
    id:'shock',
    label:'Arc Link',
    desc:'chains electric damage to a second enemy'
  },

  {
    id:'phase',
    label:'Phase Pierce',
    desc:'can hit enemies even while they are phased'
  },

  {
    id:'nova',
    label:'Mini Nova',
    desc:'every few attacks creates a wider Rift explosion'
  },

  {
    id:'mark',
    label:'Hunter Mark',
    desc:'marks the target so its next pet hit is stronger'
  },

  {
    id:'orbit',
    label:'Orbit Strike',
    desc:'hits two nearby enemies in a rotating pattern'
  },

  {
    id:'chrono',
    label:'Time Nudge',
    desc:'slightly refreshes your weapon cooldown on hit'
  }

];


const PET_PASSIVE_GIMMICKS=[

  {
    id:'vital',
    label:'Vital Bond',
    desc:'raises maximum HP'
  },

  {
    id:'power',
    label:'Power Bond',
    desc:'raises attack'
  },

  {
    id:'guard',
    label:'Armor Bond',
    desc:'raises defense'
  },

  {
    id:'swift',
    label:'Swift Bond',
    desc:'raises movement speed'
  },

  {
    id:'focus',
    label:'Focus Bond',
    desc:'raises critical chance'
  },

  {
    id:'fury',
    label:'Fury Bond',
    desc:'raises critical damage'
  },

  {
    id:'tempo',
    label:'Tempo Bond',
    desc:'shortens weapon cooldown'
  },

  {
    id:'regen',
    label:'Second Wind',
    desc:'periodically restores a little HP'
  },

  {
    id:'credits',
    label:'Treasure Nose',
    desc:'increases Rift Credits from normal enemies'
  },

  {
    id:'materials',
    label:'Scavenger',
    desc:'improves material drop chance'
  },

  {
    id:'dash',
    label:'Rift Runner',
    desc:'recharges Rift Dash faster'
  },

  {
    id:'barrier',
    label:'Barrier Instinct',
    desc:'sometimes softens incoming damage'
  }

];


const PET_ACCESSORIES=[
  'scarf',
  'crown',
  'goggles',
  'bell',
  'backpack',
  'halo',
  'bandana',
  'rune',
  'cape',
  'headset',
  'satchel',
  'antenna',
  'gem',
  'leaf',
  'gear',
  'ribbon'
];


const PET_PATTERNS=[
  'stripe',
  'spots',
  'chevron',
  'star',
  'ring',
  'split',
  'runes',
  'spark',
  'diamond',
  'wave',
  'pixel',
  'leaf'
];


const PET_PROFILES={};


function petSeed(name){

  let h=2166136261;

  for(const ch of name){

    h^=ch.charCodeAt(0);

    h=Math.imul(
      h,
      16777619
    );
  }

  return h>>>0;
}


function petSpecies(name){

  if(
    /Bot|Drone|Servo|Circuit|Mecha|Entity/
      .test(name)
  )return 'bot';

  if(
    /Dragon|Whelp/
      .test(name)
  )return 'dragon';

  if(
    /Bird|Finch|Hawk|Eagle|Owl|Crow|Parrot|Chick|Starling/
      .test(name)
  )return 'bird';

  if(
    /Butterfly|Moth|Bee|Ant|Beetle|Spider/
      .test(name)
  )return 'insect';

  if(
    /Ray|Whale|Squid|Turtle|Shell|Crab|Otter/
      .test(name)
  )return 'aquatic';

  if(
    /Gecko|Serpent|Lizard|Raptor|Tricera|Ptero/
      .test(name)
  )return 'reptile';

  if(
    /Rabbit|Bunny|Hare/
      .test(name)
  )return 'bunny';

  if(
    /Cat|Lynx/
      .test(name)
  )return 'feline';

  if(
    /Fox|Pup|Hound|Wolf|Lion|Boar|Cub|Ram/
      .test(name)
  )return 'canine';

  if(
    /Hamster|Squirrel|Mouse/
      .test(name)
  )return 'rodent';

  if(
    /Blob|Wisp|Ghost|Spirit|Darkling|Fearling|Glitchling|Eye/
      .test(name)
  )return 'spirit';

  if(
    /Frog/
      .test(name)
  )return 'frog';

  if(
    /Sprout|Cactus|Fern|Spore|Vine|Leaf|Seed/
      .test(name)
  )return 'plant';

  if(
    /Duck/
      .test(name)
  )return 'bird';

  return 'creature';
}


function petMotif(name,world){

  const tests=[

    [
      /Snow|Ice|Frost|Glacier/,
      'snowflake'
    ],

    [
      /Ember|Lava|Cinder|Magma|Comet|Fire/,
      'flame'
    ],

    [
      /Bubble|Reef|Aqua|Pearl|Tidal/,
      'bubble'
    ],

    [
      /Leaf|Vine|Spore|Jungle|Moss|Terra|Fern|Seed/,
      'leaf'
    ],

    [
      /Dune|Scarab|Cactus|Sun/,
      'sun'
    ],

    [
      /Gummy|Sugar|Mint|Candy/,
      'candy'
    ],

    [
      /Cloud|Dream|Pillow/,
      'cloud'
    ],

    [
      /Dusk|Shadow|Fear|Night|Abyss|Void|Null|Dark/,
      'shadow'
    ],

    [
      /Gear|Tick|Spring|Cog|Clock/,
      'gear'
    ],

    [
      /Orbit|Mass|Float|Gravity|Star|Galaxy|Nebula|Astral|Moon|Cosmic/,
      'orbit'
    ],

    [
      /Pebble|Boulder|Titan|Colossus|Iron|Ruin/,
      'stone'
    ],

    [
      /Ghost|Lantern|Spirit|Phantom/,
      'ghost'
    ],

    [
      /Treasure|Deck|Cannon|Merchant|Coin|Golden|Profit|Savings|Piggy|Ledger|Bargain/,
      'coin'
    ],

    [
      /Prism|Shard|Gem|Crystal|Glow/,
      'crystal'
    ],

    [
      /Spark|Volt|Thunder|Storm|Radar/,
      'bolt'
    ],

    [
      /Servo|Circuit|Drone|Mecha|Byte|Code|Data|Vector|Patch/,
      'circuit'
    ],

    [
      /Echo|Glass|Reflection|Silver|Mirror/,
      'mirror'
    ],

    [
      /Doodle|Paper|Ink|Sketch/,
      'ink'
    ],

    [
      /Block|Windup|Marble|Plush|Toy/,
      'toy'
    ],

    [
      /Compass|Maze|Thread|Key/,
      'maze'
    ],

    [
      /Quark|Phase|Photon|Chance|Quantum|Perfect|Glitch|Pixel/,
      'quantum'
    ],

    [
      /Beat|Tempo|Melody|Bass|Drum|Harmony|Chord/,
      'music'
    ]

  ];

  for(const [re,m] of tests){

    if(re.test(name))
      return m;
  }

  return{

    earth:'leaf',
    music:'music',
    money:'coin',
    cosmos:'orbit',
    war:'stone',
    void:'shadow',

    frost:'snowflake',
    volcano:'flame',
    ocean:'bubble',
    jungle:'leaf',
    desert:'sun',
    candy:'candy',

    dream:'cloud',
    nightmare:'shadow',
    clockwork:'gear',
    gravity:'orbit',
    tiny:'leaf',
    giant:'stone',

    dino:'stone',
    haunted:'ghost',
    pirate:'coin',
    sky:'cloud',
    crystal:'crystal',
    storm:'bolt',

    robot:'circuit',
    mirror:'mirror',
    ink:'ink',
    toybox:'toy',
    labyrinth:'maze',
    quantum:'quantum',

    matrix:'quantum'

  }[world]||'rift';
}


function buildPetProfiles(){

  let globalIndex=0;

  for(
    const world of
    [...WORLD_ORDER,'corruptrealm']
  ){

    const roster=
      PET_ROSTERS[world]||[];

    roster.forEach(
      (name,localIndex)=>{

        const seed=
          petSeed(name);

        const pal=
          PET_WORLD_PALETTES[world]||
          [
            '#7ee8ff',
            '#a889ff',
            '#ffffff'
          ];

        const attack=
          PET_ATTACK_GIMMICKS[
            globalIndex%
            PET_ATTACK_GIMMICKS.length
          ];

        const passive=
          PET_PASSIVE_GIMMICKS[
            Math.floor(
              globalIndex/
              PET_ATTACK_GIMMICKS.length
            )%
            PET_PASSIVE_GIMMICKS.length
          ];

        const rank=
          1+(seed%5);

        const power=
          1+(seed%7)*.04;

        const profile={

          name,
          world,
          index:globalIndex,
          localIndex,
          seed,

          species:
            petSpecies(name),

          motif:
            petMotif(name,world),

          primary:
            pal[
              seed%
              pal.length
            ],

          secondary:
            pal[
              (seed+1)%
              pal.length
            ],

          accent:
            pal[
              (seed+2)%
              pal.length
            ],

          pattern:
            PET_PATTERNS[
              (seed>>>3)%
              PET_PATTERNS.length
            ],

          accessory:
            PET_ACCESSORIES[
              (seed>>>7)%
              PET_ACCESSORIES.length
            ],

          eye:
            (seed>>>11)%4,

          tail:
            (seed>>>13)%4,

          attack:{
            ...attack,
            power
          },

          passive:{
            ...passive,
            rank
          },

          attackRate:
            .92+
            (seed%7)*.08,

          petRange:
            315+
            (seed%6)*18
        };

        PET_PROFILES[name]=profile;

        if(!PET_TYPES[name]){

          PET_TYPES[name]=
            PET_WORLD_TYPES[world]||
            'Rift';
        }

        if(!PET_BONUS[name]){

          PET_BONUS[name]={};
        }

        const b=
          PET_BONUS[name];

        if(passive.id==='vital')
          b.hp=
            (b.hp||0)+
            35+
            rank*18;

        if(passive.id==='power')
          b.atk=
            (b.atk||0)+
            5+
            rank*3;

        if(passive.id==='guard')
          b.def=
            (b.def||0)+
            5+
            rank*3;

        if(passive.id==='swift')
          b.speed=
            (b.speed||0)+
            8+
            rank*5;

        if(passive.id==='focus')
          b.critChance=
            (b.critChance||0)+
            .015+
            rank*.008;

        if(passive.id==='fury')
          b.critDamage=
            (b.critDamage||0)+
            .06+
            rank*.035;

        if(passive.id==='tempo')
          b.cooldown=
            Math.min(
              b.cooldown||1,
              .96-rank*.018
            );

        globalIndex++;
      }
    );
  }
}


buildPetProfiles();


function corruptedPetName(base){

  return 'Corrupted '+base;
}


function isCorruptedPet(name){

  return String(name||'')
    .startsWith('Corrupted ');
}


function ensureCorruptedPetDefinition(
  name,
  base,
  world
){

  if(PET_PROFILES[name])
    return;

  const bp=
    PET_PROFILES[base]||
    {

      seed:
        petSeed(base),

      species:
        petSpecies(base),

      motif:'quantum',

      primary:'#8d42ff',
      secondary:'#ff3b8d',
      accent:'#ffffff',

      pattern:'runes',
      accessory:'rune',

      eye:2,
      tail:2,

      attack:{
        ...PET_ATTACK_GIMMICKS[0],
        power:1.2
      },

      passive:{
        ...PET_PASSIVE_GIMMICKS[0],
        rank:3
      },

      attackRate:1,
      petRange:350
    };

  const seed=
    petSeed(name);

  PET_PROFILES[name]={

    ...bp,

    name,
    seed,
    world,

    corrupted:true,

    primary:'#7a2cff',
    secondary:'#ff2f88',
    accent:'#ff7bea',

    pattern:[
      'runes',
      'split',
      'pixel',
      'spark'
    ][seed%4],

    accessory:[
      'rune',
      'visor',
      'gem',
      'halo'
    ][seed%4],

    attack:{
      ...bp.attack,
      power:
        (bp.attack.power||1)*
        1.25
    },

    passive:{
      ...bp.passive,
      rank:
        Math.min(
          7,
          (bp.passive.rank||1)+2
        )
    },

    attackRate:
      Math.max(
        .55,
        (bp.attackRate||1)*.88
      ),

    petRange:
      (bp.petRange||340)+35
  };

  PET_TYPES[name]=
    'Corrupted '+
    (
      PET_TYPES[base]||
      PET_WORLD_TYPES[world]||
      'Rift'
    );

  const b=
    PET_BONUS[base]||{};

  PET_BONUS[name]={

    hp:
      Math.round(
        (b.hp||20)*1.35+30
      ),

    atk:
      Math.round(
        (b.atk||4)*1.35+4
      ),

    def:
      Math.round(
        (b.def||3)*1.3+3
      ),

    speed:
      Math.round(
        (b.speed||0)*1.2+8
      ),

    critChance:
      (b.critChance||0)+.025,

    critDamage:
      (b.critDamage||0)+.08,

    cooldown:
      Math.min(
        b.cooldown||1,
        .94
      )
  };
}


function petProfile(name){

  return PET_PROFILES[name]||null;
}


function petGimmickText(name){

  const p=
    petProfile(name);

  return p
    ?`${p.attack.label}: ${p.attack.desc}. ${p.passive.label}: ${p.passive.desc}.`
    :'';
}


function updatePetPassive(dt){

  const ap=
    activePet();

  if(!ap)return;

  const pf=
    petProfile(ap.name);

  if(!pf)return;

  ap.passiveTimer=
    (ap.passiveTimer||0)+dt;

  if(
    pf.passive.id==='dash'
  ){

    P.dashCooldown=
      Math.max(
        0,
        P.dashCooldown-
        dt*
        (
          .18+
          pf.passive.rank*.035
        )
      );
  }

  if(
    pf.passive.id==='regen'
  ){

    const every=
      Math.max(
        5.2,
        9.5-
        pf.passive.rank*.55
      );

    if(
      ap.passiveTimer>=every
    ){

      ap.passiveTimer=0;

      const max=
        getStats().maxHP;

      const heal=
        Math.max(
          3,
          Math.round(
            max*
            (
              .008+
              pf.passive.rank*.002
            )
          )
        );

      if(P.hp<max){

        P.hp=
          Math.min(
            max,
            P.hp+heal
          );

        floatingText(
          'PET +'+heal,
          P.x,
          P.y-128,
          pf.accent
        );

        burst(
          P.x,
          P.y-55,
          pf.primary,
          5
        );

        syncHUD();
      }
    }
  }
}


function applyPetAttackGimmick(
  ap,
  target,
  baseDamage
){

  const pf=
    petProfile(ap.name);

  if(!pf)return;

  const a=pf.attack;

  const lv=
    ap.level||1;

  const bonus=
    Math.max(
      1,
      Math.round(
        baseDamage*
        (
          .20+
          (pf.seed%5)*.025
        )
      )
    );


  /* FUSION PET ECHO */

  if(pf.fused){

    ap.fusionHits=
      (ap.fusionHits||0)+1;

    if(
      ap.fusionHits%3===0&&
      target.alive
    ){

      const fd=
        Math.max(
          1,
          Math.round(
            baseDamage*.48
          )
        );

      target.hp-=fd;

      floatingText(
        'FUSION ECHO '+fd,
        target.x,
        target.y-142,
        pf.secondary||pf.accent
      );

      burst(
        target.x,
        target.y-48,
        pf.secondary||pf.accent,
        12
      );

      const other=
        G.enemies.find(
          e=>
            e.alive&&
            e!==target&&
            e.world===G.worldId&&
            Math.hypot(
              e.x-target.x,
              e.y-target.y
            )<190
        );

      if(other){

        hurtEnemy(
          other,
          Math.round(fd*.55),
          false,
          true
        );
      }

      if(target.hp<=0)
        killEnemy(target);
    }
  }


  /* CORRUPTED PET ECHO */

  if(
    pf.corrupted&&
    target.alive&&
    Math.random()<.22
  ){

    const echo=
      Math.max(
        1,
        Math.round(
          baseDamage*.42
        )
      );

    target.hp-=echo;

    floatingText(
      'CORRUPTION '+echo,
      target.x,
      target.y-132,
      '#ff64d8'
    );

    burst(
      target.x,
      target.y-45,
      '#8b32ff',
      12
    );

    if(target.hp<=0)
      killEnemy(target);
  }


  const others=()=>{

    return G.enemies.filter(
      e=>
        e.alive&&
        e!==target&&
        e.world===G.worldId
    );
  };


  /* RICOCHET / SHOCK */

  if(
    a.id==='ricochet'||
    a.id==='shock'
  ){

    const other=
      others()
        .sort(
          (x,y)=>
            Math.hypot(
              x.x-target.x,
              x.y-target.y
            )-
            Math.hypot(
              y.x-target.x,
              y.y-target.y
            )
        )[0];

    if(
      other&&
      Math.hypot(
        other.x-target.x,
        other.y-target.y
      )<230
    ){

      const d=
        Math.round(
          bonus*
          (
            a.id==='shock'
              ?1.15
              :.85
          )
        );

      hurtEnemy(
        other,
        d,
        false,
        true
      );

      floatingText(
        a.id==='shock'
          ?'ARC'
          :'BOUNCE',

        other.x,
        other.y-102,
        pf.accent
      );
    }
  }


  /* BURST / ORBIT / NOVA */

  if(
    a.id==='burst'||
    a.id==='orbit'||
    a.id==='nova'
  ){

    const radius=
      a.id==='nova'
        ?175
        :a.id==='orbit'
          ?145
          :120;

    for(const e of others()){

      if(
        Math.hypot(
          e.x-target.x,
          e.y-target.y
        )<radius
      ){

        hurtEnemy(
          e,
          Math.max(
            1,
            Math.round(
              bonus*
              (
                a.id==='nova'
                  ?.9
                  :.65
              )
            )
          ),
          false,
          true
        );
      }
    }

    burst(
      target.x,
      target.y-38,
      pf.primary,
      a.id==='nova'
        ?14
        :8
    );
  }


  /* FREEZE */

  if(a.id==='freeze'){

    target.slowTimer=
      Math.max(
        target.slowTimer||0,
        .8+
        .12*
        (pf.seed%5)
      );
  }


  /* STUN */

  if(
    a.id==='stun'&&
    !target.boss&&
    Math.random()<
      .22+
      (pf.seed%4)*.04
  ){

    target.stunTimer=
      Math.max(
        target.stunTimer||0,
        .45+
        .08*
        (pf.seed%4)
      );
  }


  /* BURN */

  if(a.id==='burn'){

    target.hp-=bonus;

    floatingText(
      'BURN '+bonus,
      target.x,
      target.y-112,
      '#ff9a62'
    );

    if(target.hp<=0)
      killEnemy(target);
  }


  /* HEAL / LEECH */

  if(
    a.id==='leech'||
    a.id==='heal'
  ){

    const max=
      getStats().maxHP;

    const heal=
      Math.max(
        2,
        Math.round(
          (
            a.id==='leech'
              ?baseDamage*.16
              :max*.006
          )+
          lv*.35
        )
      );

    P.hp=
      Math.min(
        max,
        P.hp+heal
      );

    floatingText(
      '+'+heal,
      P.x,
      P.y-126,
      pf.accent
    );
  }


  /* EXECUTION */

  if(
    a.id==='execute'&&
    target.hp/
    target.maxHP<.28
  ){

    const d=
      Math.round(
        baseDamage*.55
      );

    target.hp-=d;

    floatingText(
      'FINISH +'+d,
      target.x,
      target.y-122,
      pf.accent
    );

    if(target.hp<=0)
      killEnemy(target);
  }


  /* BOSS BREAK */

  if(
    a.id==='boss'&&
    target.boss
  ){

    const d=
      Math.round(
        baseDamage*.45
      );

    target.hp-=d;

    floatingText(
      'BOSS BREAK '+d,
      target.x,
      target.y-122,
      pf.accent
    );

    if(target.hp<=0)
      killEnemy(target);
  }


  /* RAPID */

  if(a.id==='rapid'){

    const d=
      Math.max(
        1,
        Math.round(
          baseDamage*.38
        )
      );

    target.hp-=d;

    floatingText(
      'DOUBLE '+d,
      target.x,
      target.y-108,
      pf.accent
    );

    if(target.hp<=0)
      killEnemy(target);
  }


  /* GUARD */

  if(a.id==='guard'){

    P.invuln=
      Math.max(
        P.invuln,
        .22+
        .03*
        (pf.seed%4)
      );
  }


  /* PUSH */

  if(
    a.id==='push'&&
    !target.boss
  ){

    target.x+=
      Math.sign(
        target.x-P.x
      )*
      (
        70+
        (pf.seed%5)*12
      );
  }


  /* PET CRITICAL */

  if(
    a.id==='crit'&&
    Math.random()<.28
  ){

    const d=
      Math.round(
        baseDamage*
        (
          .6+
          (pf.seed%4)*.08
        )
      );

    target.hp-=d;

    floatingText(
      'PET CRIT +'+d,
      target.x,
      target.y-118,
      '#ffe982'
    );

    if(target.hp<=0)
      killEnemy(target);
  }


  /* PHASE PIERCE */

  if(a.id==='phase'){

    target.invulnPhase=0;
  }


  /* HUNTER MARK */

  if(a.id==='mark'){

    target.petMarked=
      (target.petMarked||0)+1;

    if(
      target.petMarked>=2
    ){

      target.petMarked=0;

      const d=
        Math.round(
          baseDamage*.75
        );

      target.hp-=d;

      floatingText(
        'MARK BURST '+d,
        target.x,
        target.y-118,
        pf.accent
      );

      if(target.hp<=0)
        killEnemy(target);
    }
  }


  /* CHRONO */

  if(a.id==='chrono'){

    P.attackCooldown*=.72;
  }

  syncHUD();
}


/* =========================================================
   WEAPONS

   Every world has a signature weapon. Earth gives you the
   Nova Sword during the opening story. Defeating each later
   world boss permanently adds that world's weapon to your
   Armory for future stages.
   ========================================================= */
const WEAPONS = {
  'Nova Sword':{world:'earth',style:'sword',atk:20,cooldown:.45,range:96,crit:0,critDamage:0,speed:0,color:'#9d68ff',accent:'#f2eaff',special:'rift',desc:'Balanced Rift blade. The third combo strike releases a stronger Nova slash.'},
  'Sonic Twinblades':{world:'music',style:'twin',atk:18,cooldown:.26,range:84,crit:.04,critDamage:0,speed:22,color:'#5eeaff',accent:'#ff72dc',special:'multi',desc:'Ultra-fast paired blades. Every hit lands a smaller echo strike.'},
  'Gilded Coinblade':{world:'money',style:'sword',atk:29,cooldown:.42,range:100,crit:.03,critDamage:.10,speed:5,color:'#ffd85f',accent:'#fff5b0',special:'credits',desc:'A merchant-forged blade. Defeated enemies drop extra Rift Credits.'},
  'Astral Spear':{world:'cosmos',style:'spear',atk:34,cooldown:.52,range:154,crit:.04,critDamage:.15,speed:8,color:'#8eb7ff',accent:'#e9f0ff',special:'reach',desc:'Long cosmic spear with exceptional reach and strong critical damage.'},
  'Titan Hammer':{world:'war',style:'hammer',atk:58,cooldown:.86,range:112,crit:-.02,critDamage:.35,speed:-18,color:'#ff785e',accent:'#ffd0a8',special:'stun',desc:'Slow, crushing weapon. Combo finishers can stun enemies.'},
  'Abyss Scythe':{world:'void',style:'scythe',atk:44,cooldown:.64,range:142,crit:.05,critDamage:.25,speed:4,color:'#9c6bff',accent:'#e8dcff',special:'lifesteal',desc:'Steals a little health whenever its blade damages an enemy.'},
  'Frostfang Katana':{world:'frost',style:'katana',atk:37,cooldown:.39,range:108,crit:.09,critDamage:.10,speed:12,color:'#bff7ff',accent:'#ffffff',special:'freeze',desc:'Fast ice blade. Strikes slow enemy movement for a short time.'},
  'Magma Cleaver':{world:'volcano',style:'cleaver',atk:53,cooldown:.70,range:116,crit:0,critDamage:.20,speed:-6,color:'#ff6a38',accent:'#ffd16b',special:'burn',desc:'Heavy volcanic cleaver. Hits erupt for bonus burn damage.'},
  'Tidal Trident':{world:'ocean',style:'trident',atk:40,cooldown:.54,range:158,crit:.02,critDamage:.10,speed:8,color:'#52e9ff',accent:'#d6ffff',special:'heal',desc:'Long-range ocean weapon. Successful hits restore a small amount of HP.'},
  'Thorn Whip':{world:'jungle',style:'whip',atk:31,cooldown:.35,range:184,crit:.03,critDamage:0,speed:18,color:'#78e06f',accent:'#dfff91',special:'splash',desc:'Huge reach. Thorn bursts damage nearby enemies around your target.'},
  'Sunscar Chakram':{world:'desert',style:'chakram',atk:35,cooldown:.40,range:225,crit:.06,critDamage:.10,speed:12,color:'#ffcf58',accent:'#fff0a3',special:'reach',desc:'A blazing ring blade that can strike enemies from unusually far away.'},
  'Sugar Rush Batons':{world:'candy',style:'twin',atk:25,cooldown:.22,range:86,crit:.03,critDamage:0,speed:38,color:'#ff79c9',accent:'#fff27d',special:'multi',desc:'Ridiculously fast candy batons. Echo hits make combos explode with speed.'},
  'Dreamweaver Staff':{world:'dream',style:'staff',atk:38,cooldown:.49,range:196,crit:.05,critDamage:.15,speed:8,color:'#d7a8ff',accent:'#ffe8ff',special:'heal',desc:'Dream energy reaches distant enemies and gently restores HP on hit.'},
  'Dread Reaper':{world:'nightmare',style:'scythe',atk:55,cooldown:.73,range:148,crit:.06,critDamage:.30,speed:-2,color:'#ff4f9e',accent:'#ffd0e8',special:'execute',desc:'Deals a brutal execution strike against enemies already below 25% HP.'},
  'Chrono Rapier':{world:'clockwork',style:'rapier',atk:35,cooldown:.29,range:118,crit:.08,critDamage:.15,speed:24,color:'#ffd474',accent:'#fff4c2',special:'chrono',desc:'Extremely responsive time-forged rapier with a very short attack cooldown.'},
  'Mass Driver':{world:'gravity',style:'hammer',atk:64,cooldown:.94,range:124,crit:0,critDamage:.35,speed:-20,color:'#a887ff',accent:'#eee4ff',special:'knockback',desc:'A gravity hammer that launches normal enemies backward with every hit.'},
  'Needleblade':{world:'tiny',style:'rapier',atk:27,cooldown:.20,range:76,crit:.16,critDamage:.30,speed:32,color:'#d7ff7b',accent:'#ffffff',special:'crit',desc:'Tiny weapon, enormous precision. Very high critical chance and attack speed.'},
  'Colossus Axe':{world:'giant',style:'axe',atk:72,cooldown:1.00,range:130,crit:-.02,critDamage:.45,speed:-24,color:'#ffbd75',accent:'#fff0d0',special:'boss',desc:'Massive axe built for giant prey. Deals bonus damage to bosses.'},
  'Primeval Claws':{world:'dino',style:'claws',atk:32,cooldown:.24,range:80,crit:.08,critDamage:.10,speed:30,color:'#a7e56d',accent:'#eaffc6',special:'multi',desc:'Savage claw set. Rapid attacks tear enemies with an extra follow-up strike.'},
  'Phantom Saber':{world:'haunted',style:'saber',atk:42,cooldown:.38,range:112,crit:.07,critDamage:.20,speed:15,color:'#b9dcff',accent:'#ffffff',special:'phase',desc:'Cuts through ghost phasing. Haunted enemies cannot hide from this blade.'},
  'Riftbeard Cutlass':{world:'pirate',style:'cutlass',atk:45,cooldown:.44,range:104,crit:.05,critDamage:.15,speed:10,color:'#ffd66d',accent:'#fff4c4',special:'credits',desc:'Pirate relic that makes enemies spill extra Rift Credits.'},
  'Gale Glaive':{world:'sky',style:'glaive',atk:38,cooldown:.36,range:162,crit:.06,critDamage:.10,speed:28,color:'#dffaff',accent:'#7ce9ff',special:'knockback',desc:'Lightweight sky weapon with long reach, speed and wind knockback.'},
  'Prism Blade':{world:'crystal',style:'sword',atk:41,cooldown:.42,range:112,crit:.13,critDamage:.45,speed:8,color:'#7ef5ff',accent:'#ff9df5',special:'crit',desc:'Crystal resonance massively improves critical chance and critical damage.'},
  'Thunder Maul':{world:'storm',style:'maul',atk:59,cooldown:.77,range:114,crit:.02,critDamage:.25,speed:-10,color:'#fff35d',accent:'#d9f8ff',special:'shock',desc:'Lightning jumps from your target to another nearby enemy.'},
  'Omega Blaster':{world:'robot',style:'blaster',atk:36,cooldown:.33,range:275,crit:.05,critDamage:.10,speed:5,color:'#5ef3e5',accent:'#d7fffb',special:'reach',desc:'Compact energy blaster with the longest normal attack range in the Armory.'},
  'Mirror Edge':{world:'mirror',style:'saber',atk:44,cooldown:.40,range:114,crit:.10,critDamage:.25,speed:16,color:'#eefcff',accent:'#c8a9ff',special:'reflect',desc:'A mirrored blade that rewards precision with strong critical hits.'},
  'Inkbrush Blade':{world:'ink',style:'katana',atk:39,cooldown:.38,range:128,crit:.06,critDamage:.15,speed:14,color:'#f0e6c9',accent:'#151515',special:'splash',desc:'Paints an ink slash through clustered enemies, damaging nearby targets.'},
  'Toybox Mallet':{world:'toybox',style:'mallet',atk:47,cooldown:.47,range:108,crit:.03,critDamage:.20,speed:6,color:'#ff7eb9',accent:'#ffe36e',special:'stun',desc:'Looks silly. Hits hard. Combo finishers can leave enemies stunned.'},
  'Maze Keyblade':{world:'labyrinth',style:'keyblade',atk:49,cooldown:.43,range:122,crit:.07,critDamage:.20,speed:16,color:'#cce88c',accent:'#f8ffd8',special:'dash',desc:'Defeating an enemy instantly refreshes your Rift Dash.'},
  'Quantum Daggers':{world:'quantum',style:'dagger',atk:30,cooldown:.20,range:88,crit:.19,critDamage:.35,speed:34,color:'#ff82f0',accent:'#7cecff',special:'quantum',desc:'Fast unstable daggers with huge critical potential.'},
  'Perfect Matrix Blade':{world:'matrix',style:'matrix',atk:82,cooldown:.31,range:168,crit:.16,critDamage:.55,speed:35,color:'#5af3ef',accent:'#ffffff',special:'matrix',desc:'Final Riftwalker weapon. Fast, long, powerful and tuned for critical strikes.'},

  /* EXTRA ARMORY — martial, heavy, ranged, arcane and exotic weapons */
  'Rift Bo Staff':{world:'earth',style:'bostaff',atk:23,cooldown:.30,range:142,crit:.03,critDamage:.05,speed:18,color:'#69e7ff',accent:'#f2ffff',special:'knockback',desc:'Fast two-ended staff with long reach and reliable knockback.'},
  'Scout Tonfas':{world:'earth',style:'tonfa',atk:21,cooldown:.24,range:82,crit:.05,critDamage:.05,speed:26,color:'#7fe7c4',accent:'#eafff8',special:'multi',desc:'Close-range paired tonfas built for rapid Riftwalker combos.'},
  'Pulse Nunchucks':{world:'music',style:'nunchucks',atk:24,cooldown:.19,range:92,crit:.07,critDamage:.08,speed:34,color:'#66efff',accent:'#ff74dc',special:'multi',desc:'Neon nunchucks that strike so quickly they create echo hits.'},
  'Resonance Sai':{world:'music',style:'sai',atk:27,cooldown:.23,range:86,crit:.10,critDamage:.12,speed:24,color:'#ff77df',accent:'#d9fbff',special:'crit',desc:'Triple-pronged rhythm weapons tuned for precision critical strikes.'},
  'Vault Mace':{world:'money',style:'mace',atk:46,cooldown:.61,range:104,crit:.01,critDamage:.22,speed:-4,color:'#f5cf57',accent:'#fff3ad',special:'stun',desc:'A gold-plated vault breaker. Heavy finishers can stun targets.'},
  'Golden Boomerang':{world:'money',style:'boomerang',atk:30,cooldown:.34,range:218,crit:.06,critDamage:.10,speed:12,color:'#ffd95e',accent:'#fff6bd',special:'multi',desc:'A returning ring weapon with long reach and a second echo strike.'},
  'Comet Bow':{world:'cosmos',style:'bow',atk:36,cooldown:.43,range:252,crit:.09,critDamage:.20,speed:10,color:'#91b8ff',accent:'#f0f6ff',special:'reach',desc:'Launches condensed starlight across almost the entire combat lane.'},
  'Nebula Orb':{world:'cosmos',style:'orb',atk:39,cooldown:.48,range:235,crit:.08,critDamage:.22,speed:5,color:'#c58dff',accent:'#8eeeff',special:'splash',desc:'A floating cosmic focus that bursts nebula energy around its target.'},
  'Siege Halberd':{world:'war',style:'halberd',atk:52,cooldown:.63,range:172,crit:.02,critDamage:.25,speed:-6,color:'#ff8466',accent:'#ffd3ad',special:'boss',desc:'Long military polearm designed to tear through giant war machines.'},
  'Vanguard Rifle':{world:'war',style:'rifle',atk:43,cooldown:.39,range:290,crit:.05,critDamage:.14,speed:-2,color:'#ff8062',accent:'#ffe1b5',special:'reach',desc:'A long-range pulse rifle recovered from the Titan Factory.'},
  'Rift Kusarigama':{world:'void',style:'kusarigama',atk:43,cooldown:.41,range:205,crit:.08,critDamage:.20,speed:12,color:'#a779ff',accent:'#eadfff',special:'lifesteal',desc:'A chained void sickle that reaches far and drains life on contact.'},
  'Null Chainblade':{world:'void',style:'chainblade',atk:47,cooldown:.49,range:190,crit:.06,critDamage:.24,speed:6,color:'#8f63ff',accent:'#f0e9ff',special:'splash',desc:'Segmented blade that whips through clustered enemies.'},
  'Glacier Longbow':{world:'frost',style:'bow',atk:39,cooldown:.46,range:270,crit:.10,critDamage:.15,speed:8,color:'#c7f8ff',accent:'#ffffff',special:'freeze',desc:'Ice arrows slow enemies before they can close the distance.'},
  'Icebreaker Pickaxe':{world:'frost',style:'pickaxe',atk:48,cooldown:.58,range:108,crit:.05,critDamage:.28,speed:-3,color:'#aeeeff',accent:'#ffffff',special:'stun',desc:'A brutal climbing pick repurposed for cracking frozen armor.'},
  'Inferno Greatsword':{world:'volcano',style:'greatsword',atk:65,cooldown:.82,range:138,crit:.01,critDamage:.34,speed:-15,color:'#ff6738',accent:'#ffd36e',special:'burn',desc:'A two-handed blade carrying the heat of Magma Core.'},
  'Cinder Flail':{world:'volcano',style:'flail',atk:51,cooldown:.64,range:146,crit:.03,critDamage:.25,speed:-5,color:'#ff7a42',accent:'#ffd86e',special:'burn',desc:'A burning chained head that erupts on impact.'},
  'Reef Harpoon':{world:'ocean',style:'harpoon',atk:44,cooldown:.50,range:205,crit:.05,critDamage:.12,speed:5,color:'#5deaff',accent:'#e0ffff',special:'heal',desc:'A deep-sea harpoon that restores a little health with each strike.'},
  'Tide War Fans':{world:'ocean',style:'fans',atk:29,cooldown:.25,range:104,crit:.08,critDamage:.10,speed:30,color:'#66e7ff',accent:'#dfffff',special:'multi',desc:'Paired bladed fans that turn ocean currents into rapid combo hits.'},
  'Vine Sickles':{world:'jungle',style:'sickles',atk:33,cooldown:.28,range:105,crit:.09,critDamage:.12,speed:24,color:'#8ce477',accent:'#e6ffb1',special:'multi',desc:'Twin hooked sickles made for cutting through living vines.'},
  'Canopy Blowgun':{world:'jungle',style:'blowgun',atk:28,cooldown:.27,range:285,crit:.12,critDamage:.20,speed:18,color:'#6fcf70',accent:'#dfff9d',special:'crit',desc:'Quiet jungle ranged weapon with exceptional precision.'},
  'Sun Lance':{world:'desert',style:'lance',atk:48,cooldown:.55,range:190,crit:.06,critDamage:.20,speed:8,color:'#ffd05b',accent:'#fff0a3',special:'reach',desc:'A blazing desert lance that controls space with huge reach.'},
  'Scarab Crossbow':{world:'desert',style:'crossbow',atk:42,cooldown:.47,range:280,crit:.10,critDamage:.24,speed:3,color:'#e9b44c',accent:'#fff2aa',special:'crit',desc:'Ancient crossbow rebuilt from scarab-machine parts.'},
  'Lollipop Club':{world:'candy',style:'club',atk:42,cooldown:.46,range:102,crit:.03,critDamage:.18,speed:8,color:'#ff75c8',accent:'#fff06f',special:'stun',desc:'Absurdly sweet, surprisingly heavy, and excellent at stunning enemies.'},
  'Pop Rocket Launcher':{world:'candy',style:'launcher',atk:54,cooldown:.78,range:300,crit:.02,critDamage:.28,speed:-10,color:'#ff77c8',accent:'#fff477',special:'splash',desc:'Fires explosive candy-energy bursts that splash nearby enemies.'},
  'Lucid Wand':{world:'dream',style:'wand',atk:34,cooldown:.31,range:230,crit:.08,critDamage:.18,speed:18,color:'#ddaaff',accent:'#fff0ff',special:'heal',desc:'A dream wand that attacks at range and gently restores HP.'},
  'Moon Yo-Yo':{world:'dream',style:'yoyo',atk:31,cooldown:.27,range:178,crit:.07,critDamage:.12,speed:22,color:'#c8a8ff',accent:'#fff3ff',special:'multi',desc:'A moonlit yo-yo that snaps back for an echo hit.'},
  'Terror Chainsaw':{world:'nightmare',style:'chainsaw',atk:61,cooldown:.66,range:112,crit:.04,critDamage:.30,speed:-8,color:'#ff4f98',accent:'#ffd2e8',special:'execute',desc:'Nightmare machinery built to finish weakened enemies quickly.'},
  'Dread Morningstar':{world:'nightmare',style:'morningstar',atk:57,cooldown:.72,range:152,crit:.04,critDamage:.32,speed:-10,color:'#d84d8c',accent:'#ffd0e5',special:'stun',desc:'A spiked chained weapon that can stun on combo finishers.'},
  'Gear Pistol':{world:'clockwork',style:'pistol',atk:32,cooldown:.24,range:255,crit:.09,critDamage:.14,speed:22,color:'#e4b968',accent:'#fff0b5',special:'chrono',desc:'A compact clockwork sidearm that bends attack timing.'},
  'Pendulum Flail':{world:'clockwork',style:'flail',atk:45,cooldown:.48,range:150,crit:.06,critDamage:.20,speed:6,color:'#d8aa5f',accent:'#fff2bd',special:'chrono',desc:'Its swinging weight steals fractions of a second from each combo.'},
  'Singularity Cannon':{world:'gravity',style:'cannon',atk:69,cooldown:.96,range:315,crit:.01,critDamage:.38,speed:-24,color:'#a884ff',accent:'#efe5ff',special:'knockback',desc:'A portable gravity cannon with massive range and knockback.'},
  'Orbit Shield':{world:'gravity',style:'shield',atk:34,cooldown:.38,range:96,crit:.02,critDamage:.08,speed:2,color:'#b698ff',accent:'#f4ecff',special:'reflect',desc:'A gravity shield used offensively; critical hits trigger Mirror Guard.'},
  'Micro Knuckles':{world:'tiny',style:'knuckles',atk:24,cooldown:.16,range:66,crit:.13,critDamage:.22,speed:38,color:'#d8ff7b',accent:'#ffffff',special:'multi',desc:'Tiny powered knuckles with the fastest close-range punches in the Armory.'},
  'Needle Sai':{world:'tiny',style:'sai',atk:26,cooldown:.18,range:78,crit:.17,critDamage:.28,speed:34,color:'#e3ff8a',accent:'#ffffff',special:'crit',desc:'Miniature precision sai built around critical-hit speed.'},
  'Titan Greatsword':{world:'giant',style:'greatsword',atk:78,cooldown:1.04,range:145,crit:-.01,critDamage:.50,speed:-26,color:'#ffc47e',accent:'#fff1d0',special:'boss',desc:'An enormous two-handed blade made to bring down colossal enemies.'},
  'Colossus Club':{world:'giant',style:'club',atk:74,cooldown:1.08,range:126,crit:-.02,critDamage:.44,speed:-28,color:'#d9a56f',accent:'#ffe0b0',special:'stun',desc:'Primitive, gigantic and devastating on a combo finisher.'},
  'Raptor Gauntlets':{world:'dino',style:'gauntlets',atk:34,cooldown:.21,range:76,crit:.10,critDamage:.14,speed:32,color:'#a8e96f',accent:'#edffc6',special:'multi',desc:'Clawed combat gauntlets inspired by Primeval Wilds predators.'},
  'Bone Bow':{world:'dino',style:'bow',atk:38,cooldown:.41,range:265,crit:.11,critDamage:.22,speed:12,color:'#e6d59d',accent:'#b9ef76',special:'crit',desc:'A prehistoric longbow made from impossible fossil material.'},
  'Spirit War Fans':{world:'haunted',style:'fans',atk:35,cooldown:.29,range:112,crit:.10,critDamage:.18,speed:24,color:'#c4e2ff',accent:'#ffffff',special:'phase',desc:'Ghost-cutting war fans that can damage enemies while they phase.'},
  'Grave Lantern':{world:'haunted',style:'lantern',atk:39,cooldown:.43,range:225,crit:.06,critDamage:.20,speed:4,color:'#b8dcff',accent:'#f8ffff',special:'phase',desc:'A spectral lantern that burns through phased spirits from a distance.'},
  'Flintlock Pistol':{world:'pirate',style:'pistol',atk:39,cooldown:.42,range:260,crit:.11,critDamage:.24,speed:8,color:'#f2c461',accent:'#fff1bc',special:'credits',desc:'Riftbeard-style sidearm that makes defeated enemies spill more Credits.'},
  'Anchor Flail':{world:'pirate',style:'flail',atk:55,cooldown:.70,range:158,crit:.03,critDamage:.30,speed:-9,color:'#86b9c7',accent:'#ffe087',special:'knockback',desc:'A miniature anchor on a chain. It sends normal enemies flying.'},
  'Cloud Bow':{world:'sky',style:'bow',atk:35,cooldown:.35,range:285,crit:.09,critDamage:.15,speed:26,color:'#e3fbff',accent:'#78e9ff',special:'reach',desc:'An almost weightless bow with exceptional range and movement speed.'},
  'Wind Tonfas':{world:'sky',style:'tonfa',atk:31,cooldown:.22,range:88,crit:.07,critDamage:.10,speed:36,color:'#dffaff',accent:'#72e8ff',special:'knockback',desc:'Wind-charged tonfas that push enemies away while you stay mobile.'},
  'Prism Wand':{world:'crystal',style:'wand',atk:38,cooldown:.32,range:235,crit:.15,critDamage:.38,speed:10,color:'#83f5ff',accent:'#ff9cf4',special:'crit',desc:'A crystal focus built entirely around devastating critical hits.'},
  'Shard Crossbow':{world:'crystal',style:'crossbow',atk:46,cooldown:.45,range:285,crit:.14,critDamage:.40,speed:2,color:'#7cf2ff',accent:'#ffa0f6',special:'crit',desc:'Fires razor-sharp prism bolts with extreme critical potential.'},
  'Volt Nunchucks':{world:'storm',style:'nunchucks',atk:36,cooldown:.20,range:96,crit:.08,critDamage:.14,speed:32,color:'#fff35d',accent:'#d9f8ff',special:'shock',desc:'Lightning nunchucks that can chain electricity into nearby enemies.'},
  'Lightning Lance':{world:'storm',style:'lance',atk:51,cooldown:.51,range:200,crit:.06,critDamage:.22,speed:12,color:'#fff66a',accent:'#dffbff',special:'shock',desc:'A long storm lance that arcs lightning between enemies.'},
  'Plasma Rifle':{world:'robot',style:'rifle',atk:44,cooldown:.34,range:310,crit:.07,critDamage:.16,speed:5,color:'#5ef3e5',accent:'#d7fffb',special:'reach',desc:'High-velocity plasma rifle with enormous effective range.'},
  'Mecha Gauntlets':{world:'robot',style:'gauntlets',atk:40,cooldown:.23,range:78,crit:.06,critDamage:.12,speed:24,color:'#66eee5',accent:'#e4fffc',special:'multi',desc:'Servo-assisted gauntlets that punch with rapid mechanical follow-ups.'},
  'Reflection Shield':{world:'mirror',style:'shield',atk:37,cooldown:.36,range:92,crit:.11,critDamage:.26,speed:8,color:'#edfaff',accent:'#c9abff',special:'reflect',desc:'A mirrored shield that grants a brief guard after critical hits.'},
  'Glass Sai':{world:'mirror',style:'sai',atk:38,cooldown:.25,range:88,crit:.15,critDamage:.30,speed:22,color:'#eafaff',accent:'#c9aaff',special:'crit',desc:'Crystal-clear sai that reward precision with frequent critical strikes.'},
  'Brush Staff':{world:'ink',style:'bostaff',atk:37,cooldown:.33,range:150,crit:.05,critDamage:.12,speed:18,color:'#f0e5c7',accent:'#171717',special:'splash',desc:'A giant ink brush used like a staff; each hit splashes nearby enemies.'},
  'Ink War Fans':{world:'ink',style:'fans',atk:34,cooldown:.27,range:110,crit:.08,critDamage:.15,speed:22,color:'#eee3c7',accent:'#151515',special:'splash',desc:'Paired paper fans that paint damaging arcs through enemy groups.'},
  'Spring Yo-Yo':{world:'toybox',style:'yoyo',atk:33,cooldown:.24,range:185,crit:.06,critDamage:.12,speed:28,color:'#ff7db9',accent:'#ffe56f',special:'multi',desc:'A toy weapon with a dangerous return trip.'},
  'Block Bat':{world:'toybox',style:'bat',atk:45,cooldown:.43,range:106,crit:.04,critDamage:.20,speed:10,color:'#ff8abb',accent:'#ffe56d',special:'stun',desc:'A chunky toy bat that can stun enemies with combo finishers.'},
  'Maze Bo Staff':{world:'labyrinth',style:'bostaff',atk:42,cooldown:.31,range:158,crit:.07,critDamage:.15,speed:20,color:'#cce88c',accent:'#f8ffd8',special:'dash',desc:'Defeating an enemy with this staff immediately refreshes Rift Dash.'},
  'Minotaur Battle Axe':{world:'labyrinth',style:'axe',atk:61,cooldown:.74,range:126,crit:.04,critDamage:.32,speed:-10,color:'#b8d277',accent:'#f5ffd2',special:'boss',desc:'Heavy maze-forged axe built to carve through guardians and bosses.'},
  'Phase Pistols':{world:'quantum',style:'pistol',atk:34,cooldown:.18,range:275,crit:.17,critDamage:.30,speed:30,color:'#ff83ef',accent:'#7deeff',special:'quantum',desc:'Paired quantum sidearms that sometimes collapse into bonus damage.'},
  'Entanglement Orb':{world:'quantum',style:'orb',atk:43,cooldown:.38,range:250,crit:.15,critDamage:.34,speed:16,color:'#f87ff1',accent:'#78edff',special:'quantum',desc:'An unstable orb that can trigger unpredictable quantum bonus strikes.'},
  'Data Nunchucks':{world:'matrix',style:'nunchucks',atk:48,cooldown:.17,range:102,crit:.16,critDamage:.35,speed:38,color:'#5af3ef',accent:'#ffffff',special:'matrix',desc:'Perfected digital nunchucks. Finishers release a Matrix pulse.'},
  'Architect Railgun':{world:'matrix',style:'rifle',atk:66,cooldown:.46,range:330,crit:.18,critDamage:.48,speed:12,color:'#5af3ef',accent:'#ffffff',special:'matrix',desc:'Endgame precision railgun with extreme range, power and critical damage.'},
  'Corruption Scythe':{world:'corruptrealm',style:'scythe',atk:96,cooldown:.52,range:190,crit:.18,critDamage:.62,speed:12,color:'#8a2cff',accent:'#ff4dc4',special:'corruption',desc:'A forbidden scythe carved from the Corruption Heart.'},
  'Error Nunchucks':{world:'corruptrealm',style:'nunchucks',atk:61,cooldown:.14,range:112,crit:.22,critDamage:.48,speed:46,color:'#ff3b9f',accent:'#9a4dff',special:'corruption',desc:'Unstable chained weapons that tear small errors into reality.'},
  'Null Cannon':{world:'corruptrealm',style:'cannon',atk:108,cooldown:.82,range:370,crit:.12,critDamage:.72,speed:-12,color:'#54206f',accent:'#ff5ad2',special:'corruption',desc:'A massive endgame cannon powered by compressed Corruption Essence.'},
  'Godbreaker Spear':{world:'godrealm',style:'spear',atk:124,cooldown:.46,range:225,crit:.20,critDamage:.75,speed:20,color:'#fff0a3',accent:'#a9efff',special:'boss',desc:'A divine spear forged to challenge beings that thought themselves untouchable.'},
  'Halo Chakrams':{world:'godrealm',style:'chakram',atk:88,cooldown:.19,range:285,crit:.24,critDamage:.55,speed:44,color:'#ffe77d',accent:'#ffffff',special:'multi',desc:'Twin rings of condensed starlight that return through enemies again and again.'},
  'Aether Greatsword':{world:'godrealm',style:'greatsword',atk:148,cooldown:.76,range:178,crit:.16,critDamage:.95,speed:-4,color:'#dff9ff',accent:'#fff0a3',special:'splash',desc:'A colossal blade carrying the pressure of the upper heavens.'}
};

const CORRUPTED_WEAPONS={};

function buildCorruptedWeapons(){
  for(const [name,w] of Object.entries(WEAPONS)){
    if(!WORLD_ORDER.includes(w.world))continue;

    const cn='Corrupted '+name;

    CORRUPTED_WEAPONS[cn]={
      ...w,
      atk:Math.round(w.atk*1.34+8),
      cooldown:Math.max(.13,w.cooldown*.94),
      range:Math.round(w.range*1.08),
      crit:(w.crit||0)+.045,
      critDamage:(w.critDamage||0)+.18,
      speed:(w.speed||0)+6,
      color:'#7f2dff',
      accent:'#ff4fbf',
      special:'corruption',
      special2:w.special,
      corrupted:true,
      baseWeapon:name,
      desc:'Corrupted evolution of '+name+'. Keeps its original trait and adds Corruption Rupture.'
    };
  }
}

buildCorruptedWeapons();

const WORLD_WEAPON={};

for(const [name,w] of Object.entries(WEAPONS)){
  if(!WORLD_WEAPON[w.world]){
    WORLD_WEAPON[w.world]=name;
  }
}

const WEAPON_FAMILY={
  sword:'BLADES',
  katana:'BLADES',
  saber:'BLADES',
  cutlass:'BLADES',
  cleaver:'BLADES',
  matrix:'BLADES',
  greatsword:'BLADES',
  dagger:'BLADES',
  rapier:'BLADES',
  keyblade:'BLADES',
  twin:'BLADES',

  nunchucks:'MARTIAL',
  tonfa:'MARTIAL',
  sai:'MARTIAL',
  bostaff:'MARTIAL',
  claws:'MARTIAL',
  knuckles:'MARTIAL',
  gauntlets:'MARTIAL',
  fans:'MARTIAL',

  hammer:'HEAVY',
  maul:'HEAVY',
  mallet:'HEAVY',
  mace:'HEAVY',
  flail:'HEAVY',
  morningstar:'HEAVY',
  club:'HEAVY',
  bat:'HEAVY',
  axe:'HEAVY',
  pickaxe:'HEAVY',
  chainsaw:'HEAVY',

  spear:'POLEARMS',
  glaive:'POLEARMS',
  trident:'POLEARMS',
  halberd:'POLEARMS',
  lance:'POLEARMS',
  harpoon:'POLEARMS',
  sickles:'POLEARMS',
  kusarigama:'POLEARMS',
  chainblade:'POLEARMS',
  whip:'POLEARMS',
  scythe:'POLEARMS',

  blaster:'RANGED',
  bow:'RANGED',
  crossbow:'RANGED',
  pistol:'RANGED',
  rifle:'RANGED',
  shotgun:'RANGED',
  cannon:'RANGED',
  launcher:'RANGED',
  blowgun:'RANGED',
  boomerang:'RANGED',
  chakram:'RANGED',

  staff:'ARCANE',
  wand:'ARCANE',
  orb:'ARCANE',
  lantern:'ARCANE',

  yoyo:'EXOTIC',
  shield:'EXOTIC'
};

let weaponFilter='ALL';

let fusionCoreName='';
let fusionCatalystName='';

const FUSION_COST={
  credits:500,
  bossCores:1
};

function allWeapons(){
  return{
    ...WEAPONS,
    ...CORRUPTED_WEAPONS,
    ...(P.fusedWeapons||{})
  };
}

function weaponFamily(w){
  return w?.fused
    ?'FUSION'
    :(WEAPON_FAMILY[w?.style]||'EXOTIC');
}

function getWeapon(){
  return P.weapon
    ?allWeapons()[P.weapon]||null
    :null;
}

function weaponOwned(name){
  return !!P.weaponsOwned?.[name]||
    !!P.fusedWeapons?.[name];
}

function weaponHasSpecial(w,special){
  return !!w&&(
    w.special===special||
    w.special2===special
  );
}

function fusionKey(a,b){
  return[a,b]
    .sort()
    .join('::');
}

function fusionWord(name){
  return String(name||'Rift')
    .split(/\s+/)[0]
    .replace(/[^A-Za-z0-9-]/g,'')||
    'Rift';
}

function fusionName(a,b){

  const base=
    fusionWord(a)+
    '-'+
    fusionWord(b)+
    ' Fusion';

  let name=base;
  let n=2;

  while(
    (
      WEAPONS[name]||
      CORRUPTED_WEAPONS[name]||
      P.fusedWeapons?.[name]
    )&&
    P.fusedWeapons?.[name]?.fusionKey!==
      fusionKey(a,b)
  ){
    name=base+' '+n++;
  }

  return name;
}

function makeFusionWeapon(
  aName,
  bName
){

  const a=
    WEAPONS[aName]||
    CORRUPTED_WEAPONS[aName];

  const b=
    WEAPONS[bName]||
    CORRUPTED_WEAPONS[bName];

  if(
    !a||
    !b||
    aName===bName
  )return null;

  const sameTrait=
    a.special===b.special;

  return{
    world:a.world,
    style:a.style,
    secondaryStyle:b.style,

    atk:
      Math.round(
        Math.max(a.atk,b.atk)+
        Math.min(a.atk,b.atk)*.30
      ),

    cooldown:
      clamp(
        (
          (a.cooldown+b.cooldown)/2
        )*.92,
        .16,
        1.05
      ),

    range:
      Math.round(
        Math.max(a.range,b.range)*.92+
        Math.min(a.range,b.range)*.20
      ),

    crit:
      clamp(
        (
          (a.crit||0)+
          (b.crit||0)
        )/2+.025,
        -.04,
        .28
      ),

    critDamage:
      (
        (a.critDamage||0)+
        (b.critDamage||0)
      )/2+.10,

    speed:
      Math.round(
        (
          (a.speed||0)+
          (b.speed||0)
        )/2+5
      ),

    color:a.color,
    accent:b.color||b.accent,

    special:a.special,
    special2:
      sameTrait
        ?null
        :b.special,

    fusionAmp:
      sameTrait
        ?1.10
        :1,

    fused:true,

    fusionKey:
      fusionKey(
        aName,
        bName
      ),

    sourceA:aName,
    sourceB:bName,

    desc:
      'Rift Fusion of '+
      aName+
      ' and '+
      bName+
      '. Keeps both weapon traits and releases a Fusion Burst on combo finishers.'
  };
}

function existingFusion(a,b){

  const key=
    fusionKey(a,b);

  return Object.entries(
    P.fusedWeapons||{}
  ).find(
    ([,w])=>
      w.fusionKey===key
  )||null;
}

function grantCorruptedWorldWeapons(world){

  const unlocked=[];

  for(
    const [name,w]
    of Object.entries(
      CORRUPTED_WEAPONS
    )
  ){

    if(
      w.world!==world||
      weaponOwned(name)
    )continue;

    P.weaponsOwned[name]=true;

    unlocked.push(name);
  }

  if(unlocked.length){

    SFX.core();

    toast(
      'CORRUPTED ARSENAL',
      unlocked.length+
      ' corrupted '+
      WORLDS[world].name+
      ' weapons awakened in your Armory!',
      5
    );
  }
}

function grantWorldWeapon(world){

  const unlocked=[];

  for(
    const [name,w]
    of Object.entries(WEAPONS)
  ){

    if(
      w.world!==world||
      name==='Nova Sword'||
      weaponOwned(name)
    )continue;

    P.weaponsOwned[name]=true;

    unlocked.push(name);
  }

  if(!unlocked.length)return;

  SFX.core();

  const msg=
    unlocked.length===1
      ?unlocked[0]+
       ' added to your Armory.'
      :unlocked.length+
       ' new '+
       WORLDS[world].name+
       ' weapons added to your Armory!';

  toast(
    'NEW WEAPONS UNLOCKED',
    msg,
    4.5
  );
}


/* =========================================================
   ARMOR SYSTEM
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
    rift:{name:'Rift Armor',hp:100,atk:12,def:20,speed:0,price:2500,unlocked:false},
  titan:{name:'Titan Armor',hp:200,atk:5,def:40,speed:-20,price:6000,unlocked:false},
  void:{name:'Void Armor',hp:80,atk:25,def:18,speed:15,price:8500,unlocked:false},
  matrix:{name:'Perfect Matrix Armor',hp:150,atk:35,def:30,speed:35,price:14000,unlocked:false},
  corrupt:{name:'Corruption Armor',hp:240,atk:48,def:38,speed:24,price:25000,unlocked:false},
  divine:{name:'Godforged Armor',hp:340,atk:70,def:55,speed:34,price:50000,unlocked:false}
};


/* =========================================================
   ARMOR FUSION + PET FUSION

   Both fusion machines keep the original items/companions.
   ========================================================= */

const ARMOR_FUSION_COST={
  credits:1500,
  bossCores:2
};

const PET_FUSION_COST={
  credits:1200,
  dust:5
};


function allArmors(){

  return{
    ...ARMORS,
    ...(P?.fusedArmors||{})
  };
}


function getArmor(id=P.armor){

  return allArmors()[id]||
    ARMORS.none;
}


function armorOwned(id){

  const a=
    allArmors()[id];

  return !!a&&(
    id==='none'||
    a.fused||
    a.unlocked||
    a.owned
  );
}


function armorFusionKey(a,b){

  return[a,b]
    .sort()
    .join('::');
}


function armorFusionName(a,b){

  const A=
    getArmor(a)
      .name
      .replace(/ Armor$/,'')
      .replace(/Godforged/,'God');

  const B=
    getArmor(b)
      .name
      .replace(/ Armor$/,'')
      .replace(/Godforged/,'God');

  return A+
    '-'+
    B+
    ' Aegis';
}


function existingArmorFusion(a,b){

  const key=
    armorFusionKey(a,b);

  return Object.entries(
    P.fusedArmors||{}
  ).find(
    ([,v])=>
      v.fusionKey===key
  )||null;
}


function makeArmorFusion(
  aId,
  bId
){

  const a=
    getArmor(aId);

  const b=
    getArmor(bId);

  const key=
    armorFusionKey(
      aId,
      bId
    );

  const seed=
    petSeed(key);

  const cols=[
    '#6cecff',
    '#a477ff',
    '#ff6d9e',
    '#ffe36e',
    '#72f1c6',
    '#ff8f5f'
  ];

  return{

    name:
      armorFusionName(
        aId,
        bId
      ),

    fused:true,

    fusionKey:key,

    parents:[
      aId,
      bId
    ],

    hp:
      Math.round(
        (a.hp+b.hp)*.68+
        45
      ),

    atk:
      Math.round(
        (a.atk+b.atk)*.72+
        5
      ),

    def:
      Math.round(
        (a.def+b.def)*.70+
        5
      ),

    speed:
      Math.round(
        (a.speed+b.speed)*.55+
        7
      ),

    price:0,

    unlocked:true,

    owned:true,

    crit:.025,

    cooldown:.96,

    color:
      cols[
        seed%
        cols.length
      ],

    accent:
      cols[
        (seed+2)%
        cols.length
      ],

    trait:'Twin Core'
  };
}


function createArmorFusion(
  aId,
  bId
){

  ensureHubProgress();

  if(
    !aId||
    !bId||
    aId===bId
  ){

    toast(
      'ARMOR FUSION',
      'Choose two different owned armors.'
    );

    return null;
  }

  if(
    !armorOwned(aId)||
    !armorOwned(bId)
  ){

    toast(
      'ARMOR FUSION',
      'Both armors must be owned first.'
    );

    return null;
  }

  const old=
    existingArmorFusion(
      aId,
      bId
    );

  if(old){

    toast(
      'ARMOR FUSION',
      'That armor fusion already exists.'
    );

    return old[0];
  }

  if(
    P.credits<
    ARMOR_FUSION_COST.credits
  ){

    toast(
      'ARMOR FUSION',
      'Need '+
      ARMOR_FUSION_COST
        .credits
        .toLocaleString()+
      ' Rift Credits.'
    );

    return null;
  }

  if(
    (
      P.materials[
        'Boss Core'
      ]||0
    )<
    ARMOR_FUSION_COST
      .bossCores
  ){

    toast(
      'ARMOR FUSION',
      'Need '+
      ARMOR_FUSION_COST
        .bossCores+
      ' Boss Cores.'
    );

    return null;
  }

  P.credits-=
    ARMOR_FUSION_COST
      .credits;

  P.materials[
    'Boss Core'
  ]-=
    ARMOR_FUSION_COST
      .bossCores;

  const id=
    'armor_fusion_'+
    Date.now()
      .toString(36)+
    '_'+
    Object.keys(
      P.fusedArmors||{}
    ).length;

  const a=
    makeArmorFusion(
      aId,
      bId
    );

  P.fusedArmors[id]=a;

  SFX.core();

  toast(
    'ARMOR FUSION COMPLETE',
    a.name+
    ' forged. Originals were kept.',
    4
  );

  syncHUD();

  return id;
}


/* =========================================================
   PET FUSION
   ========================================================= */

function petFusionKey(a,b){

  return[a,b]
    .sort()
    .join('::');
}


function petFusionShort(name){

  return String(name)
    .replace(
      /^Corrupted /,
      'C. '
    )
    .replace(
      /^Fusion /,
      ''
    )
    .split(/\s+/)
    .slice(0,2)
    .join(' ');
}


function petFusionName(a,b){

  const h=
    petSeed(
      petFusionKey(a,b)
    )%997;

  return 'Fusion '+
    petFusionShort(a)+
    '-'+
    petFusionShort(b)+
    ' '+
    String(h)
      .padStart(3,'0');
}


function existingPetFusion(a,b){

  const key=
    petFusionKey(a,b);

  return Object.entries(
    PET_STATE.owned||{}
  ).find(
    ([,v])=>
      v?.fusionKey===key
  )||null;
}


function ensureFusedPetDefinition(pet){

  if(
    !pet?.fused||
    !pet.parents?.length
  )return;

  const name=
    pet.name;

  if(
    PET_PROFILES[name]
  )return;

  const[
    aName,
    bName
  ]=pet.parents;


  if(
    PET_STATE
      .owned[aName]
      ?.fused&&
    !PET_PROFILES[aName]
  ){

    ensureFusedPetDefinition(
      PET_STATE.owned[aName]
    );
  }


  if(
    PET_STATE
      .owned[bName]
      ?.fused&&
    !PET_PROFILES[bName]
  ){

    ensureFusedPetDefinition(
      PET_STATE.owned[bName]
    );
  }


  const a=
    petProfile(aName);

  const b=
    petProfile(bName);

  if(
    !a||
    !b
  )return;


  const seed=
    petSeed(name);

  const ab=
    PET_BONUS[aName]||{};

  const bb=
    PET_BONUS[bName]||{};


  PET_TYPES[name]=
    'Fusion · '+
    (
      PET_TYPES[aName]||
      'Rift'
    )+
    ' / '+
    (
      PET_TYPES[bName]||
      'Rift'
    );


  PET_BONUS[name]={

    hp:
      Math.round(
        (
          (ab.hp||0)+
          (bb.hp||0)
        )*.62+
        35
      ),

    atk:
      Math.round(
        (
          (ab.atk||0)+
          (bb.atk||0)
        )*.62+
        5
      ),

    def:
      Math.round(
        (
          (ab.def||0)+
          (bb.def||0)
        )*.62+
        4
      ),

    speed:
      Math.round(
        (
          (ab.speed||0)+
          (bb.speed||0)
        )*.58+
        8
      ),

    critChance:
      (ab.critChance||0)+
      (bb.critChance||0)+
      .02,

    critDamage:
      (ab.critDamage||0)+
      (bb.critDamage||0)+
      .08,

    cooldown:
      Math.min(
        ab.cooldown||1,
        bb.cooldown||1,
        .94
      )
  };


  PET_PROFILES[name]={

    ...a,

    name,
    seed,

    world:'fusion',

    fused:true,

    fusionParents:[
      aName,
      bName
    ],

    species:
      a.species,

    primary:
      a.primary,

    secondary:
      b.primary,

    accent:
      b.accent||
      a.accent,

    pattern:
      b.pattern||
      a.pattern,

    accessory:
      a.accessory,

    motif:
      a.motif,

    secondaryMotif:
      b.motif,

    attack:{
      ...a.attack,

      power:
        (
          a.attack.power||
          1
        )*
        1.12
    },

    secondaryAttack:{
      ...b.attack,

      power:
        b.attack.power||
        1
    },

    passive:{
      ...b.passive,

      rank:
        Math.max(
          a.passive?.rank||1,
          b.passive?.rank||1
        )
    },

    attackRate:
      Math.max(
        .55,

        Math.min(
          a.attackRate||1,
          b.attackRate||1
        )*.92
      ),

    petRange:
      Math.round(
        (
          (
            a.petRange||
            340
          )+
          (
            b.petRange||
            340
          )
        )/2+
        25
      )
  };
}


function createPetFusion(
  aName,
  bName
){

  ensureHubProgress();


  if(
    !aName||
    !bName||
    aName===bName
  ){

    toast(
      'PET FUSION',
      'Choose two different companions.'
    );

    return null;
  }


  const aPet=
    PET_STATE.owned[aName];

  const bPet=
    PET_STATE.owned[bName];


  if(
    !aPet||
    !bPet
  ){

    toast(
      'PET FUSION',
      'Both companions must already be in your collection.'
    );

    return null;
  }


  const old=
    existingPetFusion(
      aName,
      bName
    );


  if(old){

    toast(
      'PET FUSION',
      'That companion fusion already exists.'
    );

    return old[0];
  }


  if(
    P.credits<
    PET_FUSION_COST.credits
  ){

    toast(
      'PET FUSION',
      'Need '+
      PET_FUSION_COST
        .credits
        .toLocaleString()+
      ' Rift Credits.'
    );

    return null;
  }


  if(
    (
      P.materials[
        'Rift Dust'
      ]||0
    )<
    PET_FUSION_COST.dust
  ){

    toast(
      'PET FUSION',
      'Need '+
      PET_FUSION_COST.dust+
      ' Rift Dust.'
    );

    return null;
  }


  P.credits-=
    PET_FUSION_COST
      .credits;

  P.materials[
    'Rift Dust'
  ]-=
    PET_FUSION_COST
      .dust;


  const name=
    petFusionName(
      aName,
      bName
    );


  const pet={

    name,

    level:
      Math.max(
        1,

        Math.floor(
          (
            (aPet.level||1)+
            (bPet.level||1)
          )/2
        )
      ),

    bond:
      Math.floor(
        (
          (aPet.bond||0)+
          (bPet.bond||0)
        )/3
      ),

    bondXP:0,

    x:P.x-60,
    y:P.y,

    attackCd:0,

    gear:{
      head:null,
      body:null,
      charm:null,
      paws:null
    },

    fused:true,

    fusionKey:
      petFusionKey(
        aName,
        bName
      ),

    parents:[
      aName,
      bName
    ],

    fusionHits:0
  };


  PET_STATE.owned[name]=pet;

  ensureFusedPetDefinition(
    pet
  );


  if(
    !PET_STATE.active
  ){

    PET_STATE.active=name;
  }


  SFX.pet();


  toast(
    'PET FUSION COMPLETE',
    name+
    ' awakened. Both original pets were kept.',
    4
  );


  renderPets();

  syncHUD();

  return name;
}


/* =========================================================
   MATERIALS
   ========================================================= */

const MATERIALS=[
  'Crystal Fragment',
  'Ancient Metal',
  'Rift Dust',
  'Sound Crystal',
  'Golden Ore',
  'Star Dust',
  'Titan Scrap',
  'Void Essence',
  'Glitch Fragment',
  'Corruption Essence',
  'Divine Essence',
  'Master Sigil',
  'Boss Core'
];
const MATERIALS = ['Crystal Fragment','Ancient Metal','Rift Dust','Sound Crystal','Golden Ore','Star Dust','Titan Scrap','Void Essence','Glitch Fragment','Corruption Essence','Divine Essence','Master Sigil','Boss Core'];

/* =========================================================
   EASTER EGGS / SECRETS
   31 hidden world/Hub secrets + 1 secret input code.
   They are deliberately small and easy to walk past.
   ========================================================= */
const EASTER_EGGS = [
  // Earth 2.0
  {id:'earth_scarf',world:'earth',x:820,y:455,name:'Prototype Scarf',msg:'A tiny red scarf is tied to an old branch. The tag reads: V0.1.',art:'scarf',reward:75},
  {id:'earth_cart',world:'earth',x:1880,y:610,name:'Ancient Game Cartridge',msg:'Somehow this survived the old world. The label only says: INSERT COIN.',art:'cartridge',reward:100},
  {id:'earth_smile',world:'earth',x:3090,y:445,name:'Smiling Ruin',msg:'Someone carved a smile into the ruins long before you arrived.',art:'smile',reward:90},
  {id:'earth_coffee',world:'earth',x:4380,y:605,name:'Cold Developer Coffee',msg:'Still cold. Still unfinished. Somehow still powerful.',art:'coffee',reward:125},

  // Music Verse
  {id:'music_silent',world:'music',x:760,y:610,name:'The Silent Note',msg:'A musical note that makes absolutely no sound.',art:'note',reward:100},
  {id:'music_record',world:'music',x:1760,y:445,name:'Backwards Record',msg:'The record spins backwards. You swear it whispered your name.',art:'record',reward:125},
  {id:'music_metro',world:'music',x:3210,y:610,name:'Golden Metronome',msg:'It ticks perfectly in time with your footsteps.',art:'metronome',reward:150},
  {id:'music_pixel',world:'music',x:4470,y:450,name:'8-Bit Melody',msg:'Four tiny pixels play a melody from a game that never existed.',art:'pixel',reward:175},

  // Money Village
  {id:'money_coin',world:'money',x:690,y:450,name:'The First Rift Credit',msg:'Serial number: 00000001. Definitely not for spending.',art:'coin',reward:111},
  {id:'money_pig',world:'money',x:1670,y:610,name:'Emergency Piggy',msg:'A secret piggy bank marked: DO NOT BREAK UNLESS BOSS FIGHT.',art:'pig',reward:150},
  {id:'money_receipt',world:'money',x:3020,y:445,name:'Infinite Receipt',msg:'The receipt keeps printing. Total: somehow still zero.',art:'receipt',reward:175},
  {id:'money_cat',world:'money',x:4380,y:610,name:'Market Cat',msg:'It has been watching every transaction. Suspiciously wealthy.',art:'cat',reward:200},

  // Cosmos
  {id:'cosmos_flag',world:'cosmos',x:780,y:610,name:'Tiny Explorer Flag',msg:'A tiny flag from an explorer who clearly got here first.',art:'flag',reward:150},
  {id:'cosmos_helmet',world:'cosmos',x:1920,y:450,name:'Lost Space Helmet',msg:'The visor reflects a star that is not in the sky.',art:'helmet',reward:175},
  {id:'cosmos_sat',world:'cosmos',x:3360,y:605,name:'Pocket Satellite',msg:'It is broadcasting one message: HELLO, RIFTWALKER.',art:'satellite',reward:200},
  {id:'cosmos_whale',world:'cosmos',x:4690,y:450,name:'Star Whale Toy',msg:'A tiny carved whale drifts as if gravity forgot about it.',art:'whale',reward:225},

  // War Zone
  {id:'war_sword',world:'war',x:730,y:610,name:'Cardboard Sword',msg:'A legendary weapon made from extremely non-legendary cardboard.',art:'sword',reward:150},
  {id:'war_duck',world:'war',x:1850,y:445,name:'Armored Bath Duck',msg:'Its tiny helmet has three confirmed scratches and zero fear.',art:'duck',reward:175},
  {id:'war_radio',world:'war',x:3260,y:610,name:'Old Field Radio',msg:'Static... then a voice says: You found me.',art:'radio',reward:200},
  {id:'war_flower',world:'war',x:4540,y:450,name:'Impossible Flower',msg:'A single flower growing where nothing else survived.',art:'flower',reward:250},

  // The Void
  {id:'void_eye',world:'void',x:720,y:610,name:'The Eye That Blinked',msg:'You looked at it. It looked back. That seems bad.',art:'eye',reward:175},
  {id:'void_candle',world:'void',x:1740,y:445,name:'Unending Candle',msg:'A flame burns here without heat, fuel or explanation.',art:'candle',reward:200},
  {id:'void_door',world:'void',x:3110,y:610,name:'Tiny Door',msg:'It is far too small for you. Something knocked from the other side.',art:'door',reward:250},
  {id:'void_star',world:'void',x:4420,y:450,name:'Lost Star',msg:'A star fell into the Void and apparently decided to stay.',art:'star',reward:300},

  // The Perfect Matrix
  {id:'matrix_bug',world:'matrix',x:750,y:610,name:'Actual Bug',msg:'Not a software bug. An actual tiny bug. The Matrix is confused.',art:'bug',reward:250},
  {id:'matrix_floppy',world:'matrix',x:1890,y:445,name:'Ancient Save Icon',msg:'A physical copy of the symbol everyone keeps pressing to save.',art:'floppy',reward:300},
  {id:'matrix_cube',world:'matrix',x:3290,y:610,name:'Developer Cube',msg:'Perfectly square. Completely unexplained. Probably important.',art:'cube',reward:350},
  {id:'matrix_zero',world:'matrix',x:4700,y:450,name:'Zero Division',msg:'The display reads 1 / 0. Reality flickers politely.',art:'zero',reward:500},

  // The Hub
  {id:'hub_mug',world:'hub',x:180,y:585,name:'Forgotten Hub Mug',msg:'Property of A.R. The coffee inside is somehow still warm.',art:'coffee',reward:100},
  {id:'hub_helmet',world:'hub',x:650,y:615,name:'First Riftwalker Helmet',msg:'An older Riftwalker visor. The cyan eyes flicker when you approach.',art:'helmet',reward:200},
  {id:'hub_ship',world:'hub',x:1130,y:585,name:'Miniature Ship',msg:'It looks exactly like your ship, including the crash damage.',art:'ship',reward:300}
];

const EASTER_TOTAL=EASTER_EGGS.length+1; // + secret input code

const SECRET_CODE=[
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

let secretCodeIndex=0;

function eggById(id){
  return EASTER_EGGS.find(e=>e.id===id)
}

function collectEasterEgg(egg){
  if(!egg||G.easterEggs.has(egg.id))return;

  G.easterEggs.add(egg.id);

  addCredits(
    egg.reward||100,
    egg.x,
    egg.y
  );

  SFX.core();

  burst(
    egg.x,
    egg.y-35,
    '#ffe98a',
    18
  );

  G.screenShake=
    Math.max(
      G.screenShake,
      5
    );

  toast(
    'SECRET FOUND · '+
    G.easterEggs.size+
    '/'+
    EASTER_TOTAL,

    egg.name+
    ' — '+
    egg.msg,

    4.2
  );

  if(
    G.easterEggs.size===
    EASTER_TOTAL
  ){

    P.secretHunter=true;

    addCredits(2000);

    toast(
      'SECRET HUNTER',
      'You found every hidden secret in the Multiverse. Bonus: 2,000 Rift Credits.',
      5
    )
  }

  renderJournal();
}

function checkSecretCode(k){

  if(
    k===
    SECRET_CODE[
      secretCodeIndex
    ]
  ){

    secretCodeIndex++;

  }else{

    secretCodeIndex=
      k===SECRET_CODE[0]
        ?1
        :0;
  }

  if(
    secretCodeIndex>=
    SECRET_CODE.length
  ){

    secretCodeIndex=0;

    if(
      !G.easterEggs.has(
        'rift_code'
      )
    ){

      G.easterEggs.add(
        'rift_code'
      );

      addCredits(777);

      SFX.core();

      toast(
        'RIFT CODE ACCEPTED',
        'An ancient sequence unlocked 777 Rift Credits. Secret '+
        G.easterEggs.size+
        '/'+
        EASTER_TOTAL+
        '.',
        4.5
      );

      if(
        G.easterEggs.size===
        EASTER_TOTAL
      ){

        P.secretHunter=true;

        addCredits(2000);

        toast(
          'SECRET HUNTER',
          'You found every hidden secret in the Multiverse. Bonus: 2,000 Rift Credits.',
          5
        )
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

  unlocked:
    new Set(['earth']),

  completed:
    new Set(),

  corruptedCompleted:
    new Set(),

  corruptedProgress:{},

  corruptionAwakened:false,
  corruptedRealmCleared:false,
  landOfGodsCleared:false,
  masterModeUnlocked:false,

  masterCompleted:
    new Set(),

  masterProgress:{},

  cores:0,

  easterEggs:
    new Set(),

  tutorialDone:false,
  tutorialActive:false,
  tutorialStep:0,

  messageTime:0,
  screenShake:0,
  flash:0,
  hitStop:0,
  impactFrame:0,
  impactX:640,
  impactY:360,

  particles:[],
  pickups:[],
  enemies:[],
  props:[],

  progress:{},
  arena:null
};


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

  weaponsOwned:{},
  fusedWeapons:{},
  fusedArmors:{},
  fusedPetGear:{},

  armor:'none',

  credits:250,

  attackCooldown:0,
  baseAttackCooldown:.45,

  attackTimer:0,
  attackAnimMax:.25,
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
      MATERIALS.map(
        x=>[x,0]
      )
    )
};


const PET_STATE = {
  owned:{},
  active:null
};


const PET_GEAR_SLOTS=[
  'head',
  'body',
  'charm',
  'paws'
];


const PET_GEAR_RARITY={
  common:'#a9bfd2',
  rare:'#69d9ff',
  epic:'#b28cff',
  legendary:'#ffd86b',
  corrupted:'#ff59cf',
  divine:'#fff0a0',
  master:'#ffdf6e'
};


/* =========================================================
   PET GEAR
   ========================================================= */

const PET_GEAR={

  trail_goggles:{
    name:'Trail Goggles',
    slot:'head',
    set:'Trailblazer',
    rarity:'common',
    cost:250,
    mat:'Rift Dust',
    qty:2,
    speed:8,
    range:18,
    visual:'goggles'
  },

  scout_harness:{
    name:'Scout Harness',
    slot:'body',
    set:'Trailblazer',
    rarity:'common',
    cost:280,
    mat:'Rift Dust',
    qty:2,
    hp:18,
    def:2,
    visual:'harness'
  },

  rift_bell:{
    name:'Rift Bell',
    slot:'charm',
    set:'Trailblazer',
    rarity:'common',
    cost:220,
    mat:'Rift Dust',
    qty:1,
    atk:2,
    bond:.10,
    visual:'bell'
  },

  runner_paws:{
    name:'Runner Paws',
    slot:'paws',
    set:'Trailblazer',
    rarity:'common',
    cost:260,
    mat:'Rift Dust',
    qty:2,
    speed:12,
    haste:.04,
    visual:'boots'
  },

  echo_headset:{
    name:'Echo Headset',
    slot:'head',
    set:'Resonance',
    rarity:'rare',
    cost:650,
    mat:'Sound Crystal',
    qty:2,
    crit:.018,
    haste:.05,
    visual:'headset'
  },

  resonance_vest:{
    name:'Resonance Vest',
    slot:'body',
    set:'Resonance',
    rarity:'rare',
    cost:700,
    mat:'Sound Crystal',
    qty:3,
    hp:28,
    petPower:.06,
    visual:'vest'
  },

  tempo_charm:{
    name:'Tempo Charm',
    slot:'charm',
    set:'Resonance',
    rarity:'rare',
    cost:620,
    mat:'Sound Crystal',
    qty:2,
    haste:.07,
    bond:.12,
    visual:'note'
  },

  beat_paws:{
    name:'Beat Paws',
    slot:'paws',
    set:'Resonance',
    rarity:'rare',
    cost:680,
    mat:'Sound Crystal',
    qty:2,
    speed:18,
    haste:.05,
    visual:'boots'
  },

  guardian_helm:{
    name:'Guardian Helm',
    slot:'head',
    set:'Guardian',
    rarity:'epic',
    cost:1200,
    mat:'Crystal Fragment',
    qty:4,
    def:5,
    hp:22,
    visual:'helm'
  },

  aegis_plate:{
    name:'Aegis Plate',
    slot:'body',
    set:'Guardian',
    rarity:'epic',
    cost:1350,
    mat:'Crystal Fragment',
    qty:5,
    hp:55,
    def:6,
    visual:'plate'
  },

  core_pendant:{
    name:'Core Pendant',
    slot:'charm',
    set:'Guardian',
    rarity:'epic',
    cost:1150,
    mat:'Crystal Fragment',
    qty:3,
    atk:4,
    def:3,
    visual:'core'
  },

  bulwark_greaves:{
    name:'Bulwark Greaves',
    slot:'paws',
    set:'Guardian',
    rarity:'epic',
    cost:1250,
    mat:'Crystal Fragment',
    qty:4,
    hp:25,
    def:4,
    visual:'greaves'
  },

  apex_crown:{
    name:'Apex Crown',
    slot:'head',
    set:'Apex',
    rarity:'legendary',
    cost:2400,
    mat:'Boss Core',
    qty:1,
    crit:.035,
    petPower:.08,
    visual:'crown'
  },

  hunter_mantle:{
    name:'Hunter Mantle',
    slot:'body',
    set:'Apex',
    rarity:'legendary',
    cost:2600,
    mat:'Boss Core',
    qty:1,
    atk:7,
    petPower:.10,
    visual:'mantle'
  },

  fang_talisman:{
    name:'Fang Talisman',
    slot:'charm',
    set:'Apex',
    rarity:'legendary',
    cost:2300,
    mat:'Boss Core',
    qty:1,
    atk:6,
    crit:.025,
    visual:'fang'
  },

  predator_claws:{
    name:'Predator Claws',
    slot:'paws',
    set:'Apex',
    rarity:'legendary',
    cost:2500,
    mat:'Boss Core',
    qty:1,
    speed:20,
    petPower:.08,
    visual:'claws'
  },

  error_visor:{
    name:'Error Visor',
    slot:'head',
    set:'Corruption',
    rarity:'corrupted',
    cost:3300,
    mat:'Corruption Essence',
    qty:5,
    crit:.04,
    petPower:.10,
    visual:'visor'
  },

  corruption_carapace:{
    name:'Corruption Carapace',
    slot:'body',
    set:'Corruption',
    rarity:'corrupted',
    cost:3600,
    mat:'Corruption Essence',
    qty:6,
    hp:65,
    atk:7,
    visual:'carapace'
  },

  null_reactor:{
    name:'Null Reactor',
    slot:'charm',
    set:'Corruption',
    rarity:'corrupted',
    cost:3200,
    mat:'Corruption Essence',
    qty:4,
    petPower:.14,
    range:35,
    visual:'reactor'
  },

  glitch_talons:{
    name:'Glitch Talons',
    slot:'paws',
    set:'Corruption',
    rarity:'corrupted',
    cost:3400,
    mat:'Corruption Essence',
    qty:5,
    speed:24,
    haste:.08,
    visual:'talons'
  },

  seraph_halo:{
    name:'Seraph Halo',
    slot:'head',
    set:'Celestial',
    rarity:'divine',
    cost:4800,
    mat:'Divine Essence',
    qty:5,
    hp:35,
    crit:.04,
    visual:'halo'
  },

  godweave_armor:{
    name:'Godweave Armor',
    slot:'body',
    set:'Celestial',
    rarity:'divine',
    cost:5200,
    mat:'Divine Essence',
    qty:6,
    hp:90,
    def:8,
    visual:'godweave'
  },

  starheart:{
    name:'Starheart',
    slot:'charm',
    set:'Celestial',
    rarity:'divine',
    cost:4600,
    mat:'Divine Essence',
    qty:4,
    atk:9,
    petPower:.14,
    visual:'starheart'
  },

  cloudstep:{
    name:'Cloudstep Paws',
    slot:'paws',
    set:'Celestial',
    rarity:'divine',
    cost:4900,
    mat:'Divine Essence',
    qty:5,
    speed:30,
    haste:.09,
    visual:'cloudstep'
  },

  master_crest:{
    name:'Grandmaster Crest',
    slot:'head',
    set:'Grandmaster',
    rarity:'master',
    cost:7000,
    mat:'Master Sigil',
    qty:6,
    atk:8,
    crit:.05,
    visual:'crest'
  },

  riftlord_plate:{
    name:'Riftlord Plate',
    slot:'body',
    set:'Grandmaster',
    rarity:'master',
    cost:7600,
    mat:'Master Sigil',
    qty:8,
    hp:120,
    def:10,
    visual:'riftplate'
  },

  infinity_core:{
    name:'Infinity Core',
    slot:'charm',
    set:'Grandmaster',
    rarity:'master',
    cost:6800,
    mat:'Master Sigil',
    qty:6,
    petPower:.18,
    range:50,
    bond:.20,
    visual:'infinity'
  },

  masterstep:{
    name:'Masterstep Paws',
    slot:'paws',
    set:'Grandmaster',
    rarity:'master',
    cost:7200,
    mat:'Master Sigil',
    qty:7,
    speed:36,
    haste:.12,
    petPower:.08,
    visual:'masterstep'
  }
};


const PET_GEAR_SET_COLORS={
  Trailblazer:'#73e7ff',
  Resonance:'#ff78d8',
  Guardian:'#91b9ff',
  Apex:'#ffd86b',
  Corruption:'#ff4fc8',
  Celestial:'#fff0a0',
  Grandmaster:'#ffe36e',
  Soulforge:'#77f7e0'
};

PET_GEAR_RARITY.fusion='#77f7e0';


/* =========================================================
   PET ARMOR FUSION
   ========================================================= */

const PET_GEAR_FUSION_COST={
  credits:900,
  dust:3
};


function allPetGear(){
  return{
    ...PET_GEAR,
    ...(P?.fusedPetGear||{})
  }
}


function getPetGear(id){
  return allPetGear()[id]||null
}


function petGearIsOwned(id){
  const g=getPetGear(id);

  return !!g&&(
    !!g.fused||
    !!P.petGearOwned?.[id]
  )
}


function petGearFusionKey(a,b){
  return[a,b]
    .sort()
    .join('::')
}


function existingPetGearFusion(a,b){

  const key=
    petGearFusionKey(a,b);

  return Object.entries(
    P.fusedPetGear||{}
  ).find(
    ([,g])=>
      g.fusionKey===key
  )||null
}


function petGearFusionName(
  aId,
  bId
){

  const a=
    getPetGear(aId);

  const b=
    getPetGear(bId);

  const slot=
    a?.slot||
    b?.slot||
    'gear';

  const suffix={
    head:'Soulhelm',
    body:'Soulplate',
    charm:'Soulcore',
    paws:'Soulstep'
  }[slot]||'Soulgear';

  const short=n=>
    String(n||'Rift')
      .replace(
        /Grandmaster /,
        'Grand '
      )
      .replace(
        /Corruption /,
        'Corrupt '
      )
      .split(/\s+/)
      .slice(0,2)
      .join(' ');

  return short(a?.name)+
    ' + '+
    short(b?.name)+
    ' '+
    suffix;
}


function makePetGearFusion(
  aId,
  bId
){

  const a=
    getPetGear(aId);

  const b=
    getPetGear(bId);

  if(
    !a||
    !b||
    a.slot!==b.slot
  )return null;


  const add=(
    k,
    scale=.72,
    bonus=0
  )=>{

    const v=
      (a[k]||0)+
      (b[k]||0);

    return v
      ?Math.round(
        v*scale+bonus
      )
      :0;
  };


  const frac=(
    k,
    scale=.76,
    bonus=0
  )=>{

    const v=
      (a[k]||0)+
      (b[k]||0);

    return v
      ?+(
        v*scale+bonus
      ).toFixed(3)
      :0;
  };


  const seed=
    petSeed(
      petGearFusionKey(
        aId,
        bId
      )
    );


  const cols=[
    '#77f7e0',
    '#6cecff',
    '#ff83df',
    '#a98cff',
    '#ffe47b',
    '#7effa9'
  ];


  return{

    name:
      petGearFusionName(
        aId,
        bId
      ),

    slot:a.slot,

    set:'Soulforge',

    rarity:'fusion',

    fused:true,

    fusionKey:
      petGearFusionKey(
        aId,
        bId
      ),

    parents:[
      aId,
      bId
    ],

    visual:a.visual,
    visual2:b.visual,

    color:
      cols[
        seed%
        cols.length
      ],

    accent:
      cols[
        (seed+2)%
        cols.length
      ],

    hp:
      add(
        'hp',
        .72,
        6
      ),

    atk:
      add(
        'atk',
        .74,
        1
      ),

    def:
      add(
        'def',
        .74,
        1
      ),

    speed:
      add(
        'speed',
        .72,
        3
      ),

    crit:
      frac(
        'crit',
        .78,
        .004
      ),

    petPower:
      frac(
        'petPower',
        .78,
        .025
      ),

    haste:
      frac(
        'haste',
        .78,
        .02
      ),

    range:
      add(
        'range',
        .72,
        8
      ),

    bond:
      frac(
        'bond',
        .72,
        .03
      ),

    trait:'Twin Soul'
  };
}


function createPetGearFusion(
  aId,
  bId
){

  ensureHubProgress();

  const a=
    getPetGear(aId);

  const b=
    getPetGear(bId);


  if(
    !a||
    !b||
    aId===bId
  ){

    toast(
      'PET ARMOR FUSION',
      'Choose two different owned gear pieces.'
    );

    return null
  }


  if(
    !petGearIsOwned(aId)||
    !petGearIsOwned(bId)
  ){

    toast(
      'PET ARMOR FUSION',
      'Both pet gear pieces must be owned.'
    );

    return null
  }


  if(
    a.slot!==b.slot
  ){

    toast(
      'PET ARMOR FUSION',
      'Fuse matching slots only: Head + Head, Body + Body, Charm + Charm or Paws + Paws.'
    );

    return null
  }


  const old=
    existingPetGearFusion(
      aId,
      bId
    );


  if(old){

    toast(
      'PET ARMOR FUSION',
      'That pet gear fusion already exists.'
    );

    return old[0]
  }


  if(
    P.credits<
    PET_GEAR_FUSION_COST
      .credits
  ){

    toast(
      'PET ARMOR FUSION',
      'Need '+
      PET_GEAR_FUSION_COST
        .credits
        .toLocaleString()+
      ' Rift Credits.'
    );

    return null
  }


  if(
    (
      P.materials[
        'Rift Dust'
      ]||0
    )<
    PET_GEAR_FUSION_COST
      .dust
  ){

    toast(
      'PET ARMOR FUSION',
      'Need '+
      PET_GEAR_FUSION_COST
        .dust+
      ' Rift Dust.'
    );

    return null
  }


  P.credits-=
    PET_GEAR_FUSION_COST
      .credits;

  P.materials[
    'Rift Dust'
  ]-=
    PET_GEAR_FUSION_COST
      .dust;


  const id=
    'petgear_fusion_'+
    Date.now()
      .toString(36)+
    '_'+
    Object.keys(
      P.fusedPetGear||{}
    ).length;


  const g=
    makePetGearFusion(
      aId,
      bId
    );


  P.fusedPetGear[id]=g;

  P.petGearOwned[id]=true;


  SFX.pet();


  toast(
    'PET ARMOR FUSION COMPLETE',
    g.name+
    ' forged. Both original pieces were kept.',
    4
  );


  renderPetGear();

  syncHUD();

  return id;
}


function ensurePetGearState(pet){

  if(!pet)return null;

  pet.gear=
    pet.gear||
    {
      head:null,
      body:null,
      charm:null,
      paws:null
    };

  for(
    const slot of
    PET_GEAR_SLOTS
  ){

    if(
      !(slot in pet.gear)
    ){

      pet.gear[slot]=null;
    }
  }

  return pet.gear
}


function petGearUnlockedByProgress(g){

  if(
    g.rarity==='common'
  )return true;

  if(
    g.rarity==='rare'
  )return G.completed.size>=3;

  if(
    g.rarity==='epic'
  )return G.completed.size>=10;

  if(
    g.rarity==='legendary'
  )return G.completed.size>=20;

  if(
    g.rarity==='corrupted'
  )return !!G.corruptionAwakened;

  if(
    g.rarity==='divine'
  )return !!P.corruptionMaster;

  if(
    g.rarity==='master'
  )return !!G.masterModeUnlocked;

  return false;
}


function petGearStats(
  pet=activePet()
){

  const out={
    hp:0,
    atk:0,
    def:0,
    speed:0,
    crit:0,
    petPower:1,
    haste:1,
    range:0,
    bond:1,
    set:null,
    setCount:0
  };

  if(!pet)return out;


  const eq=
    ensurePetGearState(pet);

  const sets={};


  for(
    const slot of
    PET_GEAR_SLOTS
  ){

    const id=
      eq[slot];

    const g=
      getPetGear(id);

    if(!g)continue;


    out.hp+=g.hp||0;
    out.atk+=g.atk||0;
    out.def+=g.def||0;
    out.speed+=g.speed||0;
    out.crit+=g.crit||0;

    out.petPower+=
      g.petPower||0;

    out.haste+=
      g.haste||0;

    out.range+=
      g.range||0;

    out.bond+=
      g.bond||0;

    sets[g.set]=
      (sets[g.set]||0)+1;
  }


  const best=
    Object.entries(sets)
      .sort(
        (a,b)=>
          b[1]-a[1]
      )[0];


  if(best){

    out.set=best[0];
    out.setCount=best[1];
  }


  if(
    out.setCount>=4
  ){

    if(
      out.set==='Trailblazer'
    ){
      out.speed+=18;
      out.range+=35;
    }

    if(
      out.set==='Resonance'
    ){
      out.haste+=.15;
      out.petPower+=.08;
    }

    if(
      out.set==='Guardian'
    ){
      out.hp+=80;
      out.def+=8;
    }

    if(
      out.set==='Apex'
    ){
      out.crit+=.05;
      out.petPower+=.18;
    }

    if(
      out.set==='Corruption'
    ){
      out.petPower+=.22;
      out.haste+=.08;
    }

    if(
      out.set==='Celestial'
    ){
      out.hp+=100;
      out.petPower+=.20;
      out.bond+=.15;
    }

    if(
      out.set==='Grandmaster'
    ){
      out.hp+=120;
      out.atk+=10;
      out.def+=10;
      out.speed+=25;
      out.crit+=.05;
      out.petPower+=.25;
      out.haste+=.10;
    }

    if(
      out.set==='Soulforge'
    ){
      out.hp+=70;
      out.atk+=7;
      out.def+=7;
      out.speed+=20;
      out.crit+=.035;
      out.petPower+=.16;
      out.haste+=.08;
      out.range+=30;
      out.bond+=.10;
    }
  }

  return out;
}


function petGearScore(pet){

  const g=
    petGearStats(pet);

  return Math.round(
    g.hp*.15+
    g.atk*4+
    g.def*3+
    g.speed*.8+
    g.crit*500+
    (g.petPower-1)*180+
    (g.haste-1)*160+
    g.range*.3
  )
}


function petGearSetText(pet){

  const g=
    petGearStats(pet);

  return g.setCount>=4
    ?g.set+' 4/4 SET BONUS'
    :g.set
      ?g.set+' '+g.setCount+'/4'
      :'No set bonus'
}


function forgePetGear(id){

  ensureHubProgress();

  const g=
    getPetGear(id);

  if(
    !g||
    P.petGearOwned[id]
  )return;


  if(
    !petGearUnlockedByProgress(g)
  ){

    toast(
      'PET GEAR',
      'Progress farther through the Multiverse to forge this gear.'
    );

    return
  }


  if(
    (
      P.materials[g.mat]||0
    )<
    g.qty
  ){

    toast(
      'PET GEAR',
      'Need '+
      g.qty+
      ' '+
      g.mat+
      '.'
    );

    return
  }


  if(
    P.credits<
    g.cost
  ){

    toast(
      'PET GEAR',
      'Need '+
      g.cost.toLocaleString()+
      ' Rift Credits.'
    );

    return
  }


  P.materials[g.mat]-=
    g.qty;

  P.credits-=
    g.cost;

  P.petGearOwned[id]=true;

  SFX.core();

  toast(
    'PET GEAR FORGED',
    g.name+
    ' can now be equipped by your companions.'
  );

  renderPetGear();

  syncHUD()
}


function equipPetGear(id){

  const ap=
    activePet();

  const g=
    getPetGear(id);

  if(
    !ap||
    !g||
    !petGearIsOwned(id)
  )return;


  const old=
    getStats().maxHP;

  ensurePetGearState(ap)[
    g.slot
  ]=id;

  preserveHealthForStatChange(
    old,
    getStats().maxHP
  );

  SFX.pet();

  renderPets();

  syncHUD()
}


function unequipPetGear(slot){

  const ap=
    activePet();

  if(!ap)return;


  const old=
    getStats().maxHP;

  ensurePetGearState(ap)[
    slot
  ]=null;

  preserveHealthForStatChange(
    old,
    getStats().maxHP
  );

  SFX.click();

  renderPets();

  syncHUD()
}


function maybeDropPetGear(e){

  if(!e)return;

  ensureHubProgress();


  const chance=
    e.boss
      ?.32
      :e.legendary
        ?.58
        :e.elite
          ?.055
          :0;


  if(
    !chance||
    Math.random()>chance
  )return;


  const pool=
    Object.entries(PET_GEAR)
      .filter(
        ([id,g])=>
          !P.petGearOwned[id]&&
          petGearUnlockedByProgress(g)
      );


  if(!pool.length)return;


  const[id,g]=
    pool[
      Math.floor(
        Math.random()*
        pool.length
      )
    ];


  P.petGearOwned[id]=true;

  SFX.core();


  floatingText(
    'PET GEAR!',
    e.x,
    e.y-165,
    PET_GEAR_RARITY[
      g.rarity
    ]||'#fff'
  );


  toast(
    'RARE COMPANION DROP',
    g.name+
    ' blueprint discovered!'
  );
}


function drawEquippedPetGear(
  c,
  name,
  time=0
){

  const pet=
    PET_STATE.owned[name];

  if(!pet)return;


  const eq=
    ensurePetGearState(pet);


  c.save();

  c.lineJoin='round';
  c.lineCap='round';


  const drawOne=(
    id,
    slot
  )=>{

    const g=
      getPetGear(id);

    if(!g)return;


    const col=
      g.color||
      PET_GEAR_SET_COLORS[
        g.set
      ]||
      '#9feaff';

    const accent=
      g.accent||
      '#ffffff';

    const dark=
      '#182333';


    c.save();

    c.strokeStyle=dark;
    c.lineWidth=2.5;

    c.shadowColor=col;

    c.shadowBlur=
      g.fused
        ?12
        :g.rarity==='legendary'||
         [
           'corrupted',
           'divine',
           'master'
         ].includes(g.rarity)
          ?8
          :2;


    if(
      slot==='head'
    ){

      if(
        [
          'goggles',
          'headset',
          'visor'
        ].includes(g.visual)
      ){

        c.strokeStyle=col;
        c.lineWidth=3;

        c.beginPath();

        c.arc(
          0,
          -31,
          23,
          Math.PI,
          0
        );

        c.stroke();


        ellipse(
          c,
          -9,
          -31,
          7,
          5,
          g.visual==='visor'
            ?'rgba(255,70,205,.72)'
            :'rgba(150,245,255,.72)',
          dark,
          2
        );


        ellipse(
          c,
          9,
          -31,
          7,
          5,
          g.visual==='visor'
            ?'rgba(255,70,205,.72)'
            :'rgba(150,245,255,.72)',
          dark,
          2
        );

      }else if(
        g.visual==='halo'
      ){

        c.strokeStyle=col;
        c.lineWidth=4;

        c.beginPath();

        c.ellipse(
          0,
          -63,
          20,
          6,
          0,
          0,
          Math.PI*2
        );

        c.stroke();

      }else if(
        g.visual==='crown'||
        g.visual==='crest'
      ){

        c.fillStyle=col;

        c.beginPath();

        c.moveTo(-16,-45);
        c.lineTo(-11,-60);
        c.lineTo(-3,-51);
        c.lineTo(4,-65);
        c.lineTo(11,-51);
        c.lineTo(17,-46);

        c.closePath();

        c.fill();
        c.stroke();

      }else{

        c.fillStyle=col;

        c.beginPath();

        c.arc(
          0,
          -34,
          24,
          Math.PI,
          0
        );

        c.lineTo(
          20,
          -25
        );

        c.lineTo(
          -20,
          -25
        );

        c.closePath();

        c.fill();
        c.stroke();


        if(
          g.visual==='helm'
        ){

          c.fillStyle=
            '#d9f3ff';

          c.fillRect(
            -12,
            -34,
            24,
            4
          );
        }
      }

    }else if(
      slot==='body'
    ){

      c.globalAlpha=.9;

      c.strokeStyle=col;

      c.lineWidth=
        g.visual.includes(
          'plate'
        )||
        g.visual==='carapace'
          ?5
          :3;


      c.beginPath();

      c.moveTo(
        -24,
        -17
      );

      c.quadraticCurveTo(
        0,
        -2,
        24,
        -17
      );

      c.lineTo(
        18,
        1
      );

      c.quadraticCurveTo(
        0,
        8,
        -18,
        1
      );

      c.closePath();

      c.stroke();


      if(
        g.visual==='mantle'||
        g.visual==='godweave'
      ){

        c.fillStyle=col;
        c.globalAlpha=.35;

        c.beginPath();

        c.moveTo(-22,-14);
        c.lineTo(-31,8);
        c.lineTo(30,7);
        c.lineTo(21,-14);

        c.closePath();

        c.fill();
      }

    }else if(
      slot==='charm'
    ){

      c.strokeStyle=col;
      c.lineWidth=2;

      c.beginPath();

      c.arc(
        0,
        -8,
        13,
        .15,
        Math.PI-.15
      );

      c.stroke();

      c.fillStyle=col;


      if(
        g.visual==='bell'
      ){

        ellipse(
          c,
          0,
          0,
          6,
          6,
          col,
          dark,
          2
        );

      }else if(
        g.visual==='note'
      ){

        c.font=
          '900 15px system-ui';

        c.textAlign=
          'center';

        c.fillText(
          '♪',
          0,
          3
        );

      }else if(
        g.visual==='fang'
      ){

        c.beginPath();

        c.moveTo(-5,-1);
        c.lineTo(0,12);
        c.lineTo(6,-1);

        c.closePath();

        c.fill();
        c.stroke();

      }else if(
        g.visual==='infinity'
      ){

        c.font=
          '900 16px system-ui';

        c.textAlign=
          'center';

        c.fillText(
          '∞',
          0,
          4
        );

      }else{

        drawPetMotif(
          c,
          g.visual==='starheart'
            ?'star'
            :g.visual==='reactor'
              ?'quantum'
              :'crystal',
          0,
          1,
          7,
          col
        );
      }

    }else if(
      slot==='paws'
    ){

      c.fillStyle=col;


      for(
        const side of[-1,1]
      ){

        rr(
          c,
          side*13-9,
          -1,
          18,
          10,
          4,
          col,
          dark,
          2
        );


        if(
          g.visual==='claws'||
          g.visual==='talons'
        ){

          c.strokeStyle=
            '#fff3bf';


          for(
            let i=0;
            i<3;
            i++
          ){

            c.beginPath();

            c.moveTo(
              side*13-6+i*5,
              7
            );

            c.lineTo(
              side*13-8+i*5,
              13
            );

            c.stroke();
          }
        }
      }


      if(
        g.visual==='cloudstep'
      ){

        c.globalAlpha=.45;

        ellipse(
          c,
          -14,
          9,
          14,
          5,
          '#fff'
        );

        ellipse(
          c,
          14,
          9,
          14,
          5,
          '#fff'
        );
      }
    }


    if(g.fused){

      c.save();

      c.globalAlpha=.9;

      c.shadowColor=accent;
      c.shadowBlur=10;

      c.fillStyle=accent;
      c.strokeStyle='#102033';
      c.lineWidth=1.5;


      if(
        slot==='head'
      ){

        drawPetMotif(
          c,
          'crystal',
          0,
          -47,
          5,
          accent
        );

      }else if(
        slot==='body'
      ){

        drawPetMotif(
          c,
          'star',
          0,
          -9,
          5,
          accent
        );

      }else if(
        slot==='charm'
      ){

        drawPetMotif(
          c,
          'crystal',
          0,
          1,
          4,
          accent
        );

      }else{

        ellipse(
          c,
          -14,
          4,
          4,
          2,
          accent
        );

        ellipse(
          c,
          14,
          4,
          4,
          2,
          accent
        );
      }

      c.restore();
    }


    c.restore();
  };


  for(
    const slot of[
      'body',
      'paws',
      'charm',
      'head'
    ]
  ){

    drawOne(
      eq[slot],
      slot
    );
  }


  c.restore();
}
const HUB_WIDTH=12420;
const HUB_SPAWN_X=2880;
const HUB_SPOTS={
  sanctuary:{x:250,y:500,label:'PET SANCTUARY'},
  dojo:{x:570,y:500,label:'COMBAT DOJO'},
  arena:{x:900,y:500,label:'BONUS MODE · RIFT ARENA'},
  armory:{x:1230,y:500,label:'ARMOR WORKSHOP'},
  research:{x:1560,y:500,label:'RIFT RESEARCH LAB'},
  missions:{x:1890,y:500,label:'MISSION BOARD'},
  medbay:{x:2220,y:500,label:'RIFT MED BAY'},
  foundry:{x:2550,y:500,label:'MATERIAL FOUNDRY'},
  market:{x:2880,y:500,label:'RIFT MARKET'},
  observatory:{x:3210,y:500,label:'RIFT OBSERVATORY'},
  petgarden:{x:3540,y:500,label:'PET BOND GARDEN'},
  style:{x:3870,y:500,label:'STYLE STUDIO'},
  challenge:{x:4200,y:500,label:'CHALLENGE CHAMBER'},
  library:{x:4530,y:500,label:'RIFT LIBRARY'},
  hangar:{x:4860,y:500,label:'SHIP HANGAR'},
  archive:{x:5190,y:500,label:'TROPHY ARCHIVE'},
  artifact:{x:5520,y:500,label:'ARTIFACT VAULT'},
  drones:{x:5850,y:500,label:'DRONE WORKSHOP'},
  kitchen:{x:6180,y:500,label:'RIFT KITCHEN'},
  guild:{x:6510,y:500,label:'EXPEDITION GUILD'},
  lounge:{x:6840,y:500,label:'MUSIC LOUNGE'},
  chronicle:{x:7170,y:500,label:'RIFT CHRONICLE'},
  mastery:{x:7500,y:500,label:'MASTERY HALL'},
  tower:{x:7830,y:500,label:'RIFT TOWER'},
  bossrush:{x:8160,y:500,label:'BOSS RUSH GATE'},
  anomaly:{x:8490,y:500,label:'ANOMALY SCANNER'},
  ascension:{x:8820,y:500,label:'ASCENSION CHAMBER'},
  skillnexus:{x:9150,y:500,label:'SKILL NEXUS'},
  huntlodge:{x:9480,y:500,label:'LEGENDARY HUNT LODGE'},
  cartography:{x:9810,y:500,label:'CARTOGRAPHY BAY'},
  petcoliseum:{x:10140,y:500,label:'PET COLISEUM'},
  arcade:{x:10470,y:500,label:'RIFT ARCADE'},
  relicmuseum:{x:10800,y:500,label:'WORLD RELIC MUSEUM'},
  armorforge:{x:11130,y:500,label:'ARMOR FUSION FORGE'},
  petfusion:{x:11460,y:500,label:'PET FUSION LAB'},
  petgearforge:{x:11790,y:500,label:'PET ARMOR FUSION'},
  terminal:{x:12120,y:500,label:'WORLD TERMINAL'}
};

const HUB_UPGRADES={
  vitality:{name:'Vitality Matrix',desc:'+30 maximum HP per level.',max:5,base:450},
  power:{name:'Power Conduit',desc:'+2 ATK per level.',max:5,base:525},
  guard:{name:'Defense Weave',desc:'+2 DEF per level.',max:5,base:500},
  focus:{name:'Focus Lens',desc:'+1% critical chance per level.',max:5,base:600},
  mobility:{name:'Dash Reactor',desc:'Dash recharges 0.04s faster per level.',max:5,base:575}
};

const RIFT_RELICS={
  'Core Prism':{cost:900,desc:'+80 maximum HP.',hp:80,color:'#72eaff'},
  'Hunter Lens':{cost:1100,desc:'+5% critical chance.',crit:.05,color:'#ffe57a'},
  'Aegis Plate':{cost:1050,desc:'+6 DEF.',def:6,color:'#8fffc6'},
  'Power Sigil':{cost:1150,desc:'+7 ATK.',atk:7,color:'#ff8c7a'},
  'Velocity Coil':{cost:950,desc:'+24 movement speed.',speed:24,color:'#b795ff'},
  'Chrono Chip':{cost:1400,desc:'Weapon cooldowns are 8% faster.',cooldown:.92,color:'#8df5ff'}
};

const RIFT_MEALS={
  titan:{name:'Titan Stew',cost:280,desc:'+120 max HP for the next expedition.',hp:120},
  nova:{name:'Nova Noodles',cost:320,desc:'+8 ATK for the next expedition.',atk:8},
  swift:{name:'Sky Tea',cost:260,desc:'+32 SPD for the next expedition.',speed:32},
  lucky:{name:'Prism Mochi',cost:340,desc:'+6% CRIT for the next expedition.',crit:.06}
};

const SKILL_BRANCHES={
  vanguard:{name:'VANGUARD',tag:'WEAPON POWER',color:'#ff786f'},
  hunter:{name:'HUNTER',tag:'SPEED + LOOT',color:'#ffe06b'},
  guardian:{name:'GUARDIAN',tag:'SURVIVAL',color:'#6fe8ff'},
  seer:{name:'SEER',tag:'RIFT + COMPANIONS',color:'#b58cff'}
};

const RIFT_TALENTS={
  root:{name:'Rift Core',desc:'The center of your skill network. All four paths begin here.',max:1,branch:'core',x:560,y:350,icon:'CORE'},

  fury:{name:'Rift Fury',desc:'+2% total ATK per rank.',max:5,branch:'vanguard',x:450,y:270,icon:'ATK',req:[['root',1]]},
  combo:{name:'Flow Combo',desc:'Combo finishers deal +8% damage per rank.',max:3,branch:'vanguard',x:335,y:220,icon:'III',req:[['fury',2]]},
  breaker:{name:'Core Breaker',desc:'Deal +6% damage to bosses per rank.',max:3,branch:'vanguard',x:335,y:320,icon:'BRK',req:[['fury',2]]},
  execution:{name:'Execution Edge',desc:'Raises the execute threshold and finishing damage.',max:3,branch:'vanguard',x:215,y:175,icon:'EX',req:[['combo',2]]},
  overdrive:{name:'Weapon Overdrive',desc:'Weapon cooldowns are 3% faster per rank.',max:3,branch:'vanguard',x:215,y:325,icon:'OD',req:[['breaker',2]]},
  novaheart:{name:'Nova Heart',desc:'Vanguard capstone: +25% critical damage and stronger combo finishers.',max:1,branch:'vanguard',x:90,y:250,icon:'NOVA',req:[['execution',3],['overdrive',3]],capstone:true},

  fortune:{name:'Treasure Sense',desc:'+8% credits from enemy defeats per rank.',max:5,branch:'hunter',x:450,y:440,icon:'CR',req:[['root',1]]},
  velocity:{name:'Phase Steps',desc:'+10 movement speed per rank.',max:5,branch:'hunter',x:335,y:410,icon:'SPD',req:[['fortune',2]]},
  precision:{name:'Hunter Focus',desc:'+1.5% critical chance per rank.',max:3,branch:'hunter',x:335,y:510,icon:'CRT',req:[['fortune',2]]},
  dashhunter:{name:'Rift Runner',desc:'Dash recharge is 0.04s faster per rank.',max:3,branch:'hunter',x:215,y:405,icon:'DASH',req:[['velocity',3]]},
  scavenger:{name:'Scavenger Eye',desc:'+5% material drop chance per rank.',max:3,branch:'hunter',x:215,y:535,icon:'DROP',req:[['precision',2]]},
  apexhunter:{name:'Apex Hunter',desc:'Hunter capstone: +30% damage to Elite and Legendary enemies.',max:1,branch:'hunter',x:90,y:470,icon:'APEX',req:[['dashhunter',3],['scavenger',3]],capstone:true},

  bulwark:{name:'Core Bulwark',desc:'+3% max HP and +1 DEF per rank.',max:5,branch:'guardian',x:670,y:270,icon:'DEF',req:[['root',1]]},
  regen:{name:'Core Renewal',desc:'Regenerate a small amount of HP during combat.',max:3,branch:'guardian',x:785,y:220,icon:'HP',req:[['bulwark',2]]},
  barrier:{name:'Aegis Pulse',desc:'Chance to reduce an incoming hit by 35%.',max:3,branch:'guardian',x:785,y:320,icon:'SH',req:[['bulwark',2]]},
  secondwind:{name:'Second Wind',desc:'Once per expedition, survive a lethal hit and recover HP.',max:3,branch:'guardian',x:905,y:175,icon:'II',req:[['regen',2]]},
  fortress:{name:'Last Fortress',desc:'Gain +6% DEF per rank while below half HP.',max:3,branch:'guardian',x:905,y:325,icon:'FORT',req:[['barrier',2]]},
  immortal:{name:'Immortal Core',desc:'Guardian capstone: +10% max HP and +8% DEF.',max:1,branch:'guardian',x:1030,y:250,icon:'MAX',req:[['secondwind',3],['fortress',3]],capstone:true},

  companion:{name:'Companion Link',desc:'+4% active pet stat scaling per rank.',max:5,branch:'seer',x:670,y:440,icon:'PET',req:[['root',1]]},
  leech:{name:'Victory Pulse',desc:'Heal 1% max HP after every enemy defeat per rank.',max:5,branch:'seer',x:785,y:410,icon:'LIFE',req:[['companion',2]]},
  pettempo:{name:'Soul Tempo',desc:'Active pet attacks 5% faster per rank.',max:3,branch:'seer',x:785,y:510,icon:'PET+',req:[['companion',2]]},
  resonance:{name:'Rift Resonance',desc:'Active pet attacks deal +7% damage per rank.',max:3,branch:'seer',x:905,y:405,icon:'LINK',req:[['leech',3]]},
  chronosight:{name:'Chrono Sight',desc:'Your weapon cooldown is 2% faster per rank.',max:3,branch:'seer',x:905,y:535,icon:'TIME',req:[['pettempo',2]]},
  oracle:{name:'Rift Oracle',desc:'Seer capstone: +20% critical damage and +12% pet power.',max:1,branch:'seer',x:1030,y:470,icon:'EYE',req:[['resonance',3],['chronosight',3]],capstone:true}
};

const SHRINE_BLESSINGS=[
  {id:'power',name:'SHRINE OF POWER',desc:'+12% ATK for this expedition.'},
  {id:'aegis',name:'SHRINE OF AEGIS',desc:'+10 DEF for this expedition.'},
  {id:'haste',name:'SHRINE OF HASTE',desc:'+45 SPD for this expedition.'},
  {id:'focus',name:'SHRINE OF FOCUS',desc:'+8% CRIT for this expedition.'},
  {id:'vitality',name:'SHRINE OF VITALITY',desc:'+12% max HP for this expedition.'},
  {id:'fortune',name:'SHRINE OF FORTUNE',desc:'Enemy credit drops +35% for this expedition.'}
];

function talentLevel(id){
  ensureHubProgress();
  return P.talents[id]||0
}

function skillPointsSpent(){
  return Object.entries(RIFT_TALENTS)
    .reduce(
      (n,[id])=>
        id==='root'
          ?n
          :n+(P.talents?.[id]||0),
      0
    )
}

function skillPointMilestones(){
  const normal=G.completed?.size||0,
        corrupt=G.corruptedCompleted?.size||0,
        master=G.masterCompleted?.size||0;

  const tower=
    Math.floor(
      (P.longTerm?.tower?.best||0)/5
    ),

    mastery=
      Math.floor(
        Object.values(
          P.longTerm?.worldClears||{}
        ).reduce(
          (a,b)=>a+(b||0),
          0
        )/3
      );

  return 5+
    normal+
    corrupt+
    master*2+
    tower+
    mastery+
    (G.corruptedRealmCleared?3:0)+
    (G.landOfGodsCleared?4:0)+
    (P.riftGrandmaster?5:0);
}

function skillPointsEarned(){
  return skillPointMilestones()+
    (P.skillPointBonus||0)
}

function skillPointsAvailable(){
  return Math.max(
    0,
    skillPointsEarned()-
    skillPointsSpent()
  )
}

function talentReqMet(id){
  const d=RIFT_TALENTS[id];

  return !d?.req||
    d.req.every(
      ([rid,rank])=>
        talentLevel(rid)>=rank
    )
}

function talentReqText(id){
  const d=RIFT_TALENTS[id];

  if(!d?.req?.length)
    return 'Rift Core';

  return d.req
    .map(
      ([rid,rank])=>
        RIFT_TALENTS[rid].name+
        ' '+
        rank
    )
    .join(' + ')
}

function talentCost(id){
  return id==='root'
    ?0
    :1
}

function worldRelicName(id){
  return(
    WORLDS[id]?.name||
    id
  )+' Relic'
}


function ensureHubProgress(){

  P.hubUpgrades=
    P.hubUpgrades||
    {
      vitality:0,
      power:0,
      guard:0,
      focus:0,
      mobility:0
    };

  for(
    const k of
    Object.keys(HUB_UPGRADES)
  ){
    P.hubUpgrades[k]=
      P.hubUpgrades[k]||0;
  }

  P.shipLevel=
    Math.max(
      1,
      P.shipLevel||1
    );

  P.hubStats=
    P.hubStats||
    {
      kills:0,
      fragments:0,
      bosses:0
    };

  P.hubStats.bosses=
    Math.max(
      P.hubStats.bosses||0,
      G.completed?.size||0
    );

  P.hubStats.fragments=
    Math.max(
      P.hubStats.fragments||0,

      Object.values(
        G.progress||{}
      ).reduce(
        (n,v)=>
          n+(v?.fragments||0),
        0
      )
    );

  P.hubClaims=
    P.hubClaims||{};

  P.nanoShields=
    Math.max(
      0,
      P.nanoShields||0
    );

  P.expeditionBuff=
    P.expeditionBuff||null;

  P.activeExpeditionBuff=
    P.activeExpeditionBuff||null;

  P.challengeProtocol=
    P.challengeProtocol||null;

  P.activeChallenge=
    P.activeChallenge||null;

  P.scarfColor=
    P.scarfColor||
    '#e94759';

  P.relicsOwned=
    P.relicsOwned||{};

  P.relic=
    P.relic||null;

  P.droneLevel=
    Math.max(
      0,
      P.droneLevel||0
    );

  P.droneCd=
    P.droneCd||0;

  P.mealBuff=
    P.mealBuff||null;

  P.activeMeal=
    P.activeMeal||null;

  P.musicMode=
    P.musicMode||
    'dynamic';

  P.fusedArmors=
    P.fusedArmors||{};

  P.fusedPetGear=
    P.fusedPetGear||{};

  P.talents=
    P.talents||{};

  for(
    const k of
    Object.keys(RIFT_TALENTS)
  ){
    P.talents[k]=
      Math.max(
        0,
        Math.min(
          RIFT_TALENTS[k].max,
          P.talents[k]||0
        )
      );
  }

  P.talents.root=1;

  if(
    P.skillPointBonus===
    undefined
  ){

    const legacySpent=
      Object.entries(
        P.talents
      ).reduce(
        (n,[k,v])=>
          k==='root'
            ?n
            :n+(v||0),
        0
      );

    P.skillPointBonus=
      Math.max(
        0,
        legacySpent-
        skillPointMilestones()
      );
  }

  P.petGearOwned=
    P.petGearOwned||{};

  for(
    const id of[
      'trail_goggles',
      'scout_harness',
      'rift_bell',
      'runner_paws'
    ]
  ){
    if(
      P.petGearOwned[id]===
      undefined
    ){
      P.petGearOwned[id]=true;
    }
  }

  for(
    const pet of
    Object.values(
      PET_STATE.owned||{}
    )
  ){
    ensurePetGearState(pet);
  }

  P.legendaryHunt=
    P.legendaryHunt||null;

  P.legendaryMarks=
    Math.max(
      0,
      P.legendaryMarks||0
    );

  P.treasureMapWorld=
    P.treasureMapWorld||null;

  P.runShrines=
    P.runShrines||[];

  P.worldRelics=
    P.worldRelics||{};

  P.petArena=
    P.petArena||
    {
      division:0,
      wins:0
    };

  P.arcade=
    P.arcade||
    {
      day:'',
      played:false,
      total:0
    };

  P.hubStats.legendaryKills=
    P.hubStats.legendaryKills||0;

  P.hubStats.elites=
    P.hubStats.elites||0;

  P.hubStats.creditsEarned=
    P.hubStats.creditsEarned||0;

  P.hubStats.chests=
    P.hubStats.chests||0;

  P.hubStats.clears=
    P.hubStats.clears||0;

  P.hubStats.bossKills=
    Math.max(
      P.hubStats.bossKills||0,
      G.completed?.size||0
    );

  P.longTerm=
    P.longTerm||{};

  const lt=P.longTerm;

  lt.weaponXP=
    lt.weaponXP||{};

  lt.worldClears=
    lt.worldClears||{};

  lt.daily=
    lt.daily||{};

  lt.weekly=
    lt.weekly||{};

  lt.anomalyClaims=
    lt.anomalyClaims||{};

  lt.tower=
    lt.tower||
    {
      best:0,
      tokens:0,
      runs:0
    };

  lt.bossRush=
    lt.bossRush||
    {
      best:0,
      clears:0
    };

  lt.ascension=
    Math.max(
      0,
      lt.ascension||0
    );

  P.riftTokens=
    Math.max(
      0,
      P.riftTokens||
      lt.tower.tokens||
      0
    );

  lt.tower.tokens=
    P.riftTokens;

  P.materials=
    P.materials||{};

  for(
    const m of MATERIALS
  ){
    P.materials[m]=
      P.materials[m]||0;
  }

  G.corruptedProgress=
    G.corruptedProgress||{};

  G.corruptedCompleted=
    G.corruptedCompleted instanceof Set
      ?G.corruptedCompleted
      :new Set(
        G.corruptedCompleted||[]
      );

  G.masterProgress=
    G.masterProgress||{};

  G.masterCompleted=
    G.masterCompleted instanceof Set
      ?G.masterCompleted
      :new Set(
        G.masterCompleted||[]
      );

  for(
    const id of WORLD_ORDER
  ){

    G.corruptedProgress[id]=
      G.corruptedProgress[id]||
      freshProgress();

    G.masterProgress[id]=
      G.masterProgress[id]||
      freshProgress();
  }

  G.landOfGodsCleared=
    !!G.landOfGodsCleared;

  G.masterModeUnlocked=
    !!G.masterModeUnlocked;

  ensureChronicles();
}


function dayKey(
  d=new Date()
){
  return d.getFullYear()+
    '-'+
    String(
      d.getMonth()+1
    ).padStart(2,'0')+
    '-'+
    String(
      d.getDate()
    ).padStart(2,'0')
}


function weekKey(
  d=new Date()
){

  const x=
    new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    );

  const day=
    (x.getDay()+6)%7;

  x.setDate(
    x.getDate()-day
  );

  return dayKey(x)
}


function statSnapshot(){

  return{
    kills:
      P.hubStats?.kills||0,

    elites:
      P.hubStats?.elites||0,

    credits:
      P.hubStats?.creditsEarned||0,

    chests:
      P.hubStats?.chests||0,

    bosses:
      P.hubStats?.bossKills||
      P.hubStats?.bosses||
      0,

    clears:
      P.hubStats?.clears||0,

    fragments:
      P.hubStats?.fragments||0
  }
}


function ensureChronicles(){

  if(!P.longTerm)return;

  const lt=P.longTerm,
        dk=dayKey(),
        wk=weekKey();

  if(
    lt.daily.key!==dk
  ){
    lt.daily={
      key:dk,
      start:statSnapshot(),
      claims:{}
    };
  }

  if(
    lt.weekly.key!==wk
  ){
    lt.weekly={
      key:wk,
      start:statSnapshot(),
      claims:{}
    };
  }
}


function progressSince(
  period,
  stat
){

  ensureChronicles();

  const rec=
    P.longTerm[period],

    now=
      statSnapshot();

  return Math.max(
    0,
    (now[stat]||0)-
    (rec.start?.[stat]||0)
  )
}


function weaponMasteryXP(
  name=P.weapon
){

  ensureHubProgress();

  return name
    ?(
      P.longTerm
        .weaponXP[name]||0
    )
    :0
}


function weaponMasteryLevel(
  name=P.weapon
){

  const xp=
    weaponMasteryXP(name);

  return Math.min(
    30,
    1+
    Math.floor(
      Math.sqrt(xp/5)
    )
  )
}


function gainWeaponMastery(
  amount
){

  if(!P.weapon)return;

  ensureHubProgress();

  const before=
    weaponMasteryLevel(
      P.weapon
    );

  P.longTerm
    .weaponXP[P.weapon]=
      (
        P.longTerm
          .weaponXP[P.weapon]||0
      )+
      amount;

  const after=
    weaponMasteryLevel(
      P.weapon
    );

  if(
    after>before
  ){

    SFX.core();

    toast(
      'WEAPON MASTERY',
      P.weapon+
      ' reached Mastery '+
      after+
      '.'
    );
  }
}


function gainPetBondXP(
  amount
){

  const ap=
    activePet();

  if(!ap)return;

  amount*=
    petGearStats(ap).bond;

  ap.bondXP=
    (ap.bondXP||0)+
    amount;

  const before=
    ap.bond||0,

    after=
      Math.min(
        20,
        Math.floor(
          ap.bondXP/35
        )
      );

  if(
    after>before
  ){

    ap.bond=after;

    SFX.pet();

    toast(
      'PET BOND',
      ap.name+
      ' reached Bond '+
      after+
      '.'
    );
  }
}


function masteryRank(
  clears
){

  return clears>=25
    ?'MYTHIC'
    :clears>=15
      ?'DIAMOND'
      :clears>=10
        ?'PLATINUM'
        :clears>=6
          ?'GOLD'
          :clears>=3
            ?'SILVER'
            :clears>=1
              ?'BRONZE'
              :'UNRANKED'
}


function todayAnomaly(){

  const key=
    dayKey(),

    seed=
      [...key].reduce(
        (a,c)=>
          a+c.charCodeAt(0),
        0
      ),

    pool=
      G.completed?.size
        ?WORLD_ORDER.filter(
          id=>
            G.completed.has(id)
        )
        :WORLD_ORDER.filter(
          id=>
            G.unlocked?.has(id)
        ),

    world=
      (
        pool.length
          ?pool
          :WORLD_ORDER
      )[
        seed%
        (
          pool.length||
          WORLD_ORDER.length
        )
      ],

    mods=[
      {
        id:'frenzy',
        name:'FRENZY RIFT',
        desc:'Enemies hit harder, but mastery and credits are doubled.',
        reward:2
      },
      {
        id:'elite',
        name:'ELITE SURGE',
        desc:'Extra elite enemies appear. Rewards are heavily increased.',
        reward:2.25
      },
      {
        id:'glass',
        name:'GLASS CORE',
        desc:'You deal more damage but maximum HP is reduced.',
        reward:2.1
      },
      {
        id:'treasure',
        name:'TREASURE STORM',
        desc:'The rift is overflowing with bonus credits and materials.',
        reward:1.8
      },
      {
        id:'speed',
        name:'HYPER RIFT',
        desc:'Everything moves faster. Clear it for a large mastery reward.',
        reward:2
      }
    ];

  return{
    key,
    world,
    ...mods[
      (seed*7)%
      mods.length
    ]
  }
}


function hubUpgradeLevel(id){

  ensureHubProgress();

  return P.hubUpgrades[id]||0
}


function hubUpgradeCost(id){

  const d=
    HUB_UPGRADES[id],

    lv=
      hubUpgradeLevel(id);

  return Math.round(
    d.base*
    (
      1+
      lv*.65
    )
  )
}


function travelDuration(){

  ensureHubProgress();

  return Math.max(
    .85,
    2.2-
    (P.shipLevel-1)*.27
  )
}
/* =========================================================
   ONE-LIFE STAGE SYSTEM
   Every world is one stage. You get exactly one life per
   attempt. If HP reaches 0, the whole stage restarts from
   the state you had when you entered it.
   ========================================================= */

const STAGE_RUN = {
  worldId:null,
  life:1,
  snapshot:null,
  restarting:false
};

function cloneData(value){
  return JSON.parse(JSON.stringify(value))
}

function captureStageSnapshot(id){

  STAGE_RUN.worldId=id;
  STAGE_RUN.life=1;
  STAGE_RUN.restarting=false;

  STAGE_RUN.snapshot={

    P:cloneData({
      ...P,
      anim:{
        state:'idle',
        time:0
      }
    }),

    pets:cloneData(PET_STATE),

    progress:
      cloneData(G.progress),

    corruptedProgress:
      cloneData(
        G.corruptedProgress
      ),

    unlocked:
      [...G.unlocked],

    completed:
      [...G.completed],

    corruptedCompleted:
      [...G.corruptedCompleted],

    corruptionAwakened:
      G.corruptionAwakened,

    corruptedRealmCleared:
      G.corruptedRealmCleared,

    landOfGodsCleared:
      G.landOfGodsCleared,

    masterModeUnlocked:
      G.masterModeUnlocked,

    masterCompleted:
      [...G.masterCompleted],

    masterProgress:
      cloneData(
        G.masterProgress
      ),

    cores:G.cores,

    easterEggs:
      [...G.easterEggs],

    armors:
      Object.fromEntries(
        Object.entries(
          ARMORS
        ).map(
          ([k,v])=>[
            k,
            {
              unlocked:
                !!v.unlocked,

              owned:
                !!v.owned
            }
          ]
        )
      )
  };
}


function restoreStageSnapshot(id){

  const snap=
    STAGE_RUN.snapshot;

  if(
    !snap||
    STAGE_RUN.worldId!==id
  )return;

  const spentNano=
    P.nanoShields||0;

  Object.assign(
    P,
    cloneData(
      snap.P
    )
  );

  P.nanoShields=
    Math.min(
      P.nanoShields||0,
      spentNano
    );

  P.anim={
    state:'idle',
    time:0
  };


  PET_STATE.owned=
    cloneData(
      snap.pets.owned||{}
    );

  PET_STATE.active=
    snap.pets.active||null;


  G.progress=
    cloneData(
      snap.progress
    );

  G.corruptedProgress=
    cloneData(
      snap.corruptedProgress||{}
    );

  G.masterProgress=
    cloneData(
      snap.masterProgress||{}
    );

  G.unlocked=
    new Set(
      snap.unlocked
    );

  G.completed=
    new Set(
      snap.completed
    );

  G.corruptedCompleted=
    new Set(
      snap.corruptedCompleted||[]
    );

  G.masterCompleted=
    new Set(
      snap.masterCompleted||[]
    );

  G.corruptionAwakened=
    !!snap.corruptionAwakened;

  G.corruptedRealmCleared=
    !!snap.corruptedRealmCleared;

  G.landOfGodsCleared=
    !!snap.landOfGodsCleared;

  G.masterModeUnlocked=
    !!snap.masterModeUnlocked;

  G.cores=
    snap.cores;

  G.easterEggs=
    new Set(
      snap.easterEggs||[]
    );


  for(
    const[k,v]
    of Object.entries(
      snap.armors||{}
    )
  ){

    if(ARMORS[k]){

      ARMORS[k].unlocked=
        !!v.unlocked;

      ARMORS[k].owned=
        !!v.owned;
    }
  }


  STAGE_RUN.life=1;
}


/* =========================================================
   KEYBOARD STATE
   ========================================================= */

const keys=
  Object.create(null);

let justPressed=
  new Set();


for(
  const id of
  WORLD_ORDER
){

  G.progress[id]={
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

    if(this.ctx)return;

    const AC=
      window.AudioContext||
      window.webkitAudioContext;

    if(!AC)return;

    this.ctx=
      new AC();

    this.master=
      this.ctx.createGain();

    this.master.gain.value=
      .48;

    this.master.connect(
      this.ctx.destination
    );
  },


  resume(){

    this.init();

    if(
      this.ctx?.state===
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
      !this.ctx||
      this.muted
    )return;


    const o=
      this.ctx.createOscillator(),

      g=
        this.ctx.createGain(),

      t=
        this.ctx.currentTime;


    o.type=
      type;

    o.frequency.setValueAtTime(
      freq,
      t
    );

    o.frequency.exponentialRampToValueAtTime(
      Math.max(
        20,
        freq*slide
      ),
      t+dur
    );


    g.gain.setValueAtTime(
      .0001,
      t
    );

    g.gain.exponentialRampToValueAtTime(
      vol,
      t+.01
    );

    g.gain.exponentialRampToValueAtTime(
      .0001,
      t+dur
    );


    o.connect(g);

    g.connect(
      this.master
    );

    o.start(t);

    o.stop(
      t+dur+.02
    );
  },


  noise(
    dur=.08,
    vol=.05,
    cut=1000
  ){

    if(
      !this.ctx||
      this.muted
    )return;


    const n=
      Math.floor(
        this.ctx.sampleRate*
        dur
      ),

      b=
        this.ctx.createBuffer(
          1,
          n,
          this.ctx.sampleRate
        ),

      d=
        b.getChannelData(0);


    for(
      let i=0;
      i<n;
      i++
    ){

      d[i]=
        (
          Math.random()*2-1
        )*
        (
          1-i/n
        );
    }


    const s=
      this.ctx.createBufferSource(),

      f=
        this.ctx.createBiquadFilter(),

      g=
        this.ctx.createGain();


    s.buffer=b;

    f.type=
      'lowpass';

    f.frequency.value=
      cut;

    g.gain.value=
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
      ()=>
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
      ()=>
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
      ()=>
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
      ()=>
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

    this.muted=
      !this.muted;

    if(this.master){

      this.master.gain.value=
        this.muted
          ?0
          :.48;
    }
  }
};


/* =========================================================
   ADAPTIVE MULTIVERSE MUSIC
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


  bass:[
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

    frost:[
      76,
      'sine',
      .38
    ],

    volcano:[
      126,
      'sawtooth',
      .66
    ],

    ocean:[
      68,
      'sine',
      .32
    ],

    jungle:[
      102,
      'triangle',
      .52
    ],

    desert:[
      96,
      'triangle',
      .48
    ],

    candy:[
      136,
      'square',
      .72
    ],

    dream:[
      64,
      'sine',
      .30
    ],

    nightmare:[
      74,
      'sawtooth',
      .36
    ],

    clockwork:[
      116,
      'square',
      .58
    ],

    gravity:[
      84,
      'sine',
      .46
    ],

    tiny:[
      142,
      'triangle',
      .62
    ],

    giant:[
      66,
      'sawtooth',
      .48
    ],

    dino:[
      112,
      'triangle',
      .58
    ],

    haunted:[
      62,
      'sine',
      .28
    ],

    pirate:[
      108,
      'triangle',
      .62
    ],

    sky:[
      94,
      'sine',
      .42
    ],

    crystal:[
      104,
      'triangle',
      .50
    ],

    storm:[
      132,
      'sawtooth',
      .72
    ],

    robot:[
      120,
      'square',
      .64
    ],

    mirror:[
      88,
      'sine',
      .40
    ],

    ink:[
      78,
      'triangle',
      .34
    ],

    toybox:[
      138,
      'square',
      .70
    ],

    labyrinth:[
      86,
      'triangle',
      .42
    ],

    quantum:[
      124,
      'square',
      .66
    ],

    matrix:[
      110,
      'square',
      .56
    ],

    corruptrealm:[
      96,
      'sawtooth',
      .72
    ],

    godrealm:[
      108,
      'triangle',
      .68
    ],

    arena:[
      132,
      'sawtooth',
      .70
    ]
  },


  init(){

    SFX.resume();

    if(!SFX.ctx)return;

    this.ctx=
      SFX.ctx;

    if(this.master)return;

    this.master=
      this.ctx.createGain();

    this.master.gain.value=
      this.volume;

    this.master.connect(
      this.ctx.destination
    );
  },


  start(){

    this.init();

    if(this.started)return;

    this.started=true;
    this.step=0;

    this.schedule();
  },


  setWorld(w){

    this.world=w;

    const mode=
      (
        typeof P!==
        'undefined'&&
        P.musicMode
      )||
      'dynamic';

    const mod=
      mode==='chill'
        ?-16
        :mode==='battle'
          ?18
          :mode==='hyper'
            ?30
            :0;


    this.bpm=
      Math.max(
        48,

        (
          this.styles[w]||
          this.styles.earth
        )[0]+
        (
          this.boss
            ?18
            :0
        )+
        mod
      );


    if(this.master){

      this.master.gain.value=
        this.muted
          ?0
          :mode==='chill'
            ?.27
            :mode==='battle'
              ?.39
              :mode==='hyper'
                ?.42
                :this.volume;
    }
  },


  tone(
    freq,
    dur,
    type='sine',
    vol=.02,
    delay=0
  ){

    if(
      !this.ctx||
      this.muted||
      !freq
    )return;


    const t=
      this.ctx.currentTime+
      delay,

      o=
        this.ctx.createOscillator(),

      g=
        this.ctx.createGain(),

      f=
        this.ctx.createBiquadFilter();


    o.type=
      type;

    o.frequency.value=
      freq;


    f.type=
      'lowpass';

    f.frequency.value=
      800+
      (
        this.styles[this.world]||
        this.styles.earth
      )[2]*2600;


    g.gain.setValueAtTime(
      .0001,
      t
    );

    g.gain.exponentialRampToValueAtTime(
      vol,
      t+.025
    );

    g.gain.exponentialRampToValueAtTime(
      .0001,
      t+dur
    );


    o.connect(f);

    f.connect(g);

    g.connect(
      this.master
    );


    o.start(t);

    o.stop(
      t+dur+.04
    );
  },


  chord(){

    const chords=[
      ['D3','F3','A3'],
      ['Bb2','D3','F3'],
      ['F3','A3','C4'],
      ['C3','G3','C4']
    ],

    c=
      chords[
        Math.floor(
          this.step/8
        )%4
      ];


    for(const n of c){

      this.tone(
        this.notes[n],
        1.6,
        'sine',
        .012
      );

      this.tone(
        this.notes[n]*2,
        1.2,
        'triangle',
        .004
      );
    }
  },


  melodyStep(){

    let n=
      this.melody[
        this.step%
        this.melody.length
      ];

    if(!n)return;


    if(
      this.world==='void'&&
      this.step%5===0
    )return;


    let f=
      this.notes[n];


    if(
      this.world==='matrix'&&
      Math.random()<.12
    ){

      f*=
        Math.random()>.5
          ?1.06
          :.94;
    }


    const wave=
      (
        this.styles[this.world]||
        this.styles.earth
      )[1];


    this.tone(
      f,
      .28,
      wave,
      this.boss
        ?.036
        :.025
    );


    if(
      this.world==='music'
    ){

      this.tone(
        f*1.5,
        .18,
        'sine',
        .009
      );
    }


    if(
      this.world==='cosmos'
    ){

      this.tone(
        f*2,
        .65,
        'sine',
        .006,
        .05
      );
    }
  },


  bassStep(){

    const n=
      this.bass[
        this.step%
        this.bass.length
      ];

    if(n){

      this.tone(
        this.notes[n],
        .34,
        'sine',
        this.boss
          ?.034
          :.019
      );
    }
  },


  drum(power=1){

    if(
      !this.ctx||
      this.muted
    )return;


    const n=
      Math.floor(
        this.ctx.sampleRate*
        .07
      ),

      b=
        this.ctx.createBuffer(
          1,
          n,
          this.ctx.sampleRate
        ),

      d=
        b.getChannelData(0);


    for(
      let i=0;
      i<n;
      i++
    ){

      d[i]=
        (
          Math.random()*2-1
        )*
        (
          1-i/n
        )**2;
    }


    const s=
      this.ctx.createBufferSource(),

      f=
        this.ctx.createBiquadFilter(),

      g=
        this.ctx.createGain();


    s.buffer=b;

    f.type=
      'lowpass';

    f.frequency.value=
      this.world==='war'||
      this.world==='arena'
        ?520
        :1000;

    g.gain.value=
      .012*power;


    s.connect(f);

    f.connect(g);

    g.connect(
      this.master
    );

    s.start();
  },


  rhythm(){

    if(
      this.world==='war'||
      this.world==='arena'
    ){

      if(
        this.step%2===0
      ){

        this.drum(1.9);
      }

    }else if(
      this.world==='music'
    ){

      if(
        this.step%2===0
      ){

        this.drum(1);
      }

    }else if(
      this.step%8===0
    ){

      this.drum(.3);
    }
  },


  schedule(){

    if(!this.started)return;


    if(
      this.step%8===0
    ){

      this.chord();
    }


    this.melodyStep();


    if(
      this.step%2===0
    ){

      this.bassStep();
    }


    this.rhythm();


    if(
      this.boss&&
      this.step%2===0
    ){

      this.drum(1.2);
    }


    this.step++;


    this.timer=
      setTimeout(
        ()=>
          this.schedule(),

        (
          60/
          this.bpm/
          2
        )*1000
      );
  },


  startBoss(){

    if(this.boss)return;

    this.boss=true;

    this.setWorld(
      this.world
    );

    SFX.boss();
  },


  endBoss(){

    this.boss=false;

    this.setWorld(
      this.world
    );
  },


  toggle(){

    this.muted=
      !this.muted;

    if(this.master){

      this.master.gain.value=
        this.muted
          ?0
          :this.volume;
    }
  }
};
/* =========================================================
   STATS / ECONOMY
   ========================================================= */
function activePet(){return PET_STATE.active ? PET_STATE.owned[PET_STATE.active] : null}
function getStats(){
  ensureHubProgress();
  const armor=getArmor(), pet=activePet(), pb=pet?(PET_BONUS[pet.name]||{}):{}, weapon=getWeapon(), pgb=petGearStats(pet);
  const level=P.level-1,bond=pet?(pet.bond||0):0,evoBoost=pet?(1+(pet.level-1)*.015)*(1+bond*.03)*(1+talentLevel('companion')*.04):1;
  let maxHP=P.baseMaxHP+level*10+armor.hp+(pb.hp||0)*evoBoost+hubUpgradeLevel('vitality')*30+pgb.hp;
  let atk=P.baseAtk+level*2+armor.atk+(pb.atk||0)*evoBoost+(weapon?weapon.atk+(P.weaponLevel-1)*4:0)+hubUpgradeLevel('power')*2+pgb.atk;
  let def=P.baseDef+Math.floor(level*1.2)+armor.def+(pb.def||0)*evoBoost+hubUpgradeLevel('guard')*2+pgb.def;
  let speed=P.baseSpeed+armor.speed+(pb.speed||0)*evoBoost+(weapon?.speed||0)+pgb.speed;
  let crit=(P.baseCritChance??.10)+(pb.critChance||0)+(weapon?.crit||0)+(armor.crit||0)+hubUpgradeLevel('focus')*.01+pgb.crit;
  const relic=P.relic?RIFT_RELICS[P.relic]:null,meal=P.activeMeal?RIFT_MEALS[P.activeMeal]:null;
  if(relic){maxHP+=relic.hp||0;atk+=relic.atk||0;def+=relic.def||0;speed+=relic.speed||0;crit+=relic.crit||0}
  if(meal){maxHP+=meal.hp||0;atk+=meal.atk||0;def+=meal.def||0;speed+=meal.speed||0;crit+=meal.crit||0}
  const scan=P.activeExpeditionBuff;
  if(scan?.id==='power')atk*=1.08;
  if(scan?.id==='guard')def+=8;
  if(scan?.id==='speed')speed+=25;
  if(scan?.id==='focus')crit+=.05;
  const ch=P.activeChallenge;
  if(ch?.id==='berserker'){atk*=1.18;def*=.85}
  if(ch?.id==='blitz'){maxHP*=.90;speed+=35;crit+=.05}
  if(ch?.id==='survival'){maxHP*=.78;def*=1.12}
  const mastery=weapon?weaponMasteryLevel(P.weapon):1,asc=P.longTerm?.ascension||0;
  atk*=1+(mastery-1)*.004;maxHP*=1+asc*.02;atk*=1+asc*.02;def*=1+asc*.02;
  if(P.activeAnomaly?.id==='glass'){maxHP*=.68;atk*=1.32}
  if(P.activeAnomaly?.id==='speed')speed+=45;
  if(P.corruptionMaster){maxHP*=1.08;atk*=1.08;def*=1.08;crit+=.03}
  const shrines=P.runShrines||[];if(shrines.includes('power'))atk*=1.12;if(shrines.includes('aegis'))def+=10;if(shrines.includes('haste'))speed+=45;if(shrines.includes('focus'))crit+=.08;if(shrines.includes('vitality'))maxHP*=1.12;
  atk*=1+talentLevel('fury')*.02;maxHP*=1+talentLevel('bulwark')*.03;def+=talentLevel('bulwark');speed+=talentLevel('velocity')*10;crit+=talentLevel('precision')*.015;
  if(P.hp>0&&P.hp<maxHP*.5)def*=1+talentLevel('fortress')*.06;
  if(talentLevel('immortal')){maxHP*=1.10;def*=1.08}
  let skillCritDamage=talentLevel('novaheart')*.25+talentLevel('oracle')*.20;
  return {
    maxHP:Math.round(maxHP),atk:Math.round(atk),def:Math.round(def),speed:clamp(Math.round(speed),150,500),
    critChance:clamp(crit,.02,.8),
    critDamage:Math.max(1.5,(P.baseCritDamage??2)+(pb.critDamage||0)+(weapon?.critDamage||0)+skillCritDamage),
    cooldown:Math.max(.14,(weapon?.cooldown||P.baseAttackCooldown)*(pb.cooldown||1)*(armor.cooldown||1)*(relic?.cooldown||1)*(1-Math.min(.08,(mastery-1)*.003))*(1-talentLevel('overdrive')*.03)*(1-talentLevel('chronosight')*.02))
  };
}
function addCredits(n,x=P.x,y=P.y){n=Math.max(0,Math.round(n));P.credits+=n;ensureHubProgress();P.hubStats.creditsEarned=(P.hubStats.creditsEarned||0)+n;floatingText('+'+n+' CREDITS',x,y-70,'#8ff5ff');SFX.coin();syncHUD()}
function spendCredits(n){if(P.credits<n){toast('RIFT MARKET','Not enough Rift Credits.');return false}P.credits-=n;SFX.click();syncHUD();return true}
function addMaterial(name,n=1){P.materials[name]=(P.materials[name]||0)+n;floatingText('+'+n+' '+name,P.x,P.y-70,'#d8c7ff')}
function preserveHealthForStatChange(oldMax,newMax){const ratio=oldMax>0?P.hp/oldMax:1;P.hp=clamp(Math.round(newMax*ratio),1,newMax)}

/* =========================================================
   GAME SETUP / STORY
   ========================================================= */
function resetGame(){
  STAGE_RUN.worldId=null;STAGE_RUN.life=1;STAGE_RUN.snapshot=null;STAGE_RUN.restarting=false;
  G.scene='flight';G.sceneTime=0;G.worldId=null;G.camera=0;G.hubFound=false;G.unlocked=new Set(['earth']);G.completed=new Set();G.corruptedCompleted=new Set();G.corruptedProgress={};G.corruptionAwakened=false;G.corruptedRealmCleared=false;G.landOfGodsCleared=false;G.masterModeUnlocked=false;G.masterCompleted=new Set();G.masterProgress={};G.cores=0;G.easterEggs=new Set();G.tutorialDone=false;G.tutorialActive=false;G.tutorialStep=0;G.enemies=[];G.pickups=[];G.particles=[];G.progress={};
  for(const id of WORLD_ORDER){G.progress[id]=freshProgress();G.corruptedProgress[id]=freshProgress();G.masterProgress[id]=freshProgress()}G.progress.corruptrealm=freshProgress();G.progress.godrealm=freshProgress();
  Object.assign(P,{x:460,y:530,vx:0,vy:0,depthV:0,jump:0,onGround:true,facing:1,
  dashDirX:1,dashDirY:0,level:1,xp:0,hp:1000,baseCritChance:.10,baseCritDamage:2,secretHunter:false,weapon:null,weaponLevel:1,weaponsOwned:{},fusedWeapons:{},armor:'none',credits:250,hubUpgrades:{vitality:0,power:0,guard:0,focus:0,mobility:0},shipLevel:1,hubStats:{kills:0,fragments:0,bosses:0},hubClaims:{},nanoShields:0,expeditionBuff:null,activeExpeditionBuff:null,challengeProtocol:null,activeChallenge:null,scarfColor:'#e94759',relicsOwned:{},relic:null,droneLevel:0,droneCd:0,mealBuff:null,activeMeal:null,musicMode:'dynamic',talents:{},legendaryHunt:null,legendaryMarks:0,treasureMapWorld:null,runShrines:[],worldRelics:{},petArena:{division:0,wins:0},arcade:{day:'',played:false,total:0},petGearOwned:{trail_goggles:true,scout_harness:true,rift_bell:true,runner_paws:true},corruptedRun:false,masterRun:false,corruptionMaster:false,attackCooldown:0,attackTimer:0,attackIndex:0,comboTimer:0,invuln:0,hitFlash:0,dashTimer:0,dashCooldown:0,materials:Object.fromEntries(MATERIALS.map(x=>[x,0]))});
  PET_STATE.owned={};PET_STATE.active=null;
  $('startScreen').classList.add('hidden');$('hud').classList.remove('hidden');
  MUSIC.start();MUSIC.setWorld('earth');SFX.resume();
}

function beginWorld(id){
  const w=WORLDS[id];if(!w)return;
  G.scene='world';G.worldId=id;G.camera=0;G.sceneTime=0;P.x=430;P.y=530;P.vx=0;P.vy=0;P.depthV=0;P.jump=0;P.onGround=true;

  // Observatory scans and challenge protocols are consumed when an expedition begins.
  ensureHubProgress();

  const rp=runProgress(id);rp.chests=rp.chests||[];rp.segmentRewards=rp.segmentRewards||[];

  if(!STAGE_RUN.restarting){
    P.activeExpeditionBuff=P.expeditionBuff?cloneData(P.expeditionBuff):null;P.expeditionBuff=null;
    P.activeChallenge=P.challengeProtocol?cloneData(P.challengeProtocol):null;P.challengeProtocol=null;
    P.activeMeal=P.mealBuff||null;P.mealBuff=null;
    if(!P.anomalyRun)P.activeAnomaly=null;
  }

  // Every stage starts with exactly one life and full health.
  P.runShrines=[];
  P.hp=getStats().maxHP;P.invuln=0;P.hitFlash=0;P.attackCooldown=0;P.attackTimer=0;P.dashTimer=0;P.dashCooldown=0;P.skillSecondWindUsed=false;P.skillRegenTimer=0;

  WORLD_GIMMICK.timer=0;WORLD_GIMMICK.phase=0;WORLD_GIMMICK.corruptTimer=0;WORLD_SEGMENT_INDEX=0;SEGMENT_BANNER_TIMER=0;

  captureStageSnapshot(id);

  G.enemies=G.enemies.filter(e=>e.world!==id);G.pickups=[];

  spawnWorldContent(id);

  if(P.activeAnomaly?.id==='elite'&&P.anomalyRun){
    for(let i=0;i<4;i++)spawnEnemy(id,1300+i*850,480+(i%3)*35,false,true)
  }

  MUSIC.setWorld(id);MUSIC.endBoss();

  if(id==='earth'&&!P.corruptedRun&&!P.masterRun){
    updateEarthQuest();
  }else{
    const firstSegment=segmentNames(id)[0],prefix=P.masterRun?'MASTER · ':P.corruptedRun?'CORRUPTED · ':id==='corruptrealm'?'FORBIDDEN · ':id==='godrealm'?'DIVINE · ':'';
    const shardName=P.masterRun?'Master Seals':(P.corruptedRun||id==='corruptrealm')?'Corruption Fragments':id==='godrealm'?'Divine Sigils':'Rift Fragments';

    quest(
      prefix+segmentCode(id,0)+' • '+firstSegment,
      'Segment 1 / '+segmentCount(id)+' · Collect '+fragmentGoal(id)+' '+shardName+' and reach '+w.boss+'.'
    );
  }

  showSegmentBanner(0);

  toast(
    id==='godrealm'
      ?'THE LAND OF GODS'
      :id==='corruptrealm'
        ?'THE CORRUPTED REALM'
        :P.masterRun
          ?'MASTER MODE'
          :P.corruptedRun
            ?'CORRUPTED MODE'
            :'ONE LIFE STAGE',

    id==='godrealm'
      ?'The 33rd realm has opened. Complete the ten Divine Trials and defeat Astraeus.'
      :id==='corruptrealm'
        ?'The forbidden 32nd realm has opened. Survive the Corruption Heart.'
        :P.masterRun
          ?'No mercy. Stronger enemies, more elites, Master Seals and a two-phase boss await.'
          :P.corruptedRun
            ?'Optional Corrupted Mode is active. The normal world remains untouched.'
            :'You have 1 life. If you fall, this world attempt restarts.',

    4
  );

  syncHUD();

  if(id==='earth'&&!P.corruptedRun&&!P.masterRun&&!G.tutorialDone&&!G.tutorialActive)
    setTimeout(()=>{
      if(G.scene==='world'&&G.worldId==='earth')startTutorial(false)
    },1800);
}

function beginHub(){
  STAGE_RUN.worldId=null;STAGE_RUN.life=1;STAGE_RUN.snapshot=null;STAGE_RUN.restarting=false;

  G.scene='hub';G.worldId=null;G.camera=clamp(HUB_SPAWN_X-W*.5,0,HUB_WIDTH-W);G.hubFound=true;

  ensureHubProgress();

  P.activeExpeditionBuff=null;P.activeChallenge=null;P.activeMeal=null;P.activeAnomaly=null;P.anomalyRun=false;P.masteryTrialWorld=null;P.corruptedRun=false;P.masterRun=false;

  P.x=HUB_SPAWN_X;P.y=535;P.vx=0;P.depthV=0;P.jump=0;

  MUSIC.setWorld('hub');MUSIC.endBoss();

  quest(
    'THE HUB',
    G.masterModeUnlocked
      ?'MASTER MODE AWAKENED. Every original world now has a Master version in World Navigation.'
      :P.corruptionMaster&&!G.landOfGodsCleared
        ?'A divine 33rd signal has appeared: THE LAND OF GODS.'
        :G.corruptionAwakened
          ?'Normal worlds are safe. Optional Corrupted Mode is available beside them in World Navigation.'
          :'Explore 37 facilities including Armor Fusion, Pet Fusion, Pet Armor Fusion, Legendary Hunts, Treasure Maps, Skill Nexus, Pet Coliseum, Chronicles, Tower and Mastery.'
  );

  syncHUD();
}

function travelTo(id){
  if(!['corruptrealm','godrealm'].includes(id)&&!G.unlocked.has(id))return;
  if(id==='corruptrealm'&&G.completed.size<WORLD_ORDER.length)return;
  if(id==='godrealm'&&!P.corruptionMaster)return;

  P.corruptedRun=false;
  P.masterRun=false;

  closeAllOverlays();

  G.scene='travel';
  G.travelTarget=id;
  G.sceneTime=0;

  SFX.portal();
  MUSIC.setWorld(id)
}

function travelToCorrupted(id){
  if(!G.corruptionAwakened||!WORLD_ORDER.includes(id)||!G.completed.has(id))return;

  G.corruptedProgress[id]=G.corruptedProgress[id]||freshProgress();

  const keepPets=[...(G.corruptedProgress[id].petFound||[])];

  G.corruptedProgress[id]=freshProgress();
  G.corruptedProgress[id].petFound=keepPets;

  P.masterRun=false;
  P.corruptedRun=true;

  closeAllOverlays();

  G.scene='travel';
  G.travelTarget=id;
  G.sceneTime=0;

  SFX.portal();
  MUSIC.setWorld(id)
}

function travelToMaster(id){
  if(!G.masterModeUnlocked||!WORLD_ORDER.includes(id)||!G.completed.has(id))return;

  G.masterProgress[id]=G.masterProgress[id]||freshProgress();

  const keepPets=[...(G.masterProgress[id].petFound||[])];

  G.masterProgress[id]=freshProgress();
  G.masterProgress[id].petFound=keepPets;

  P.corruptedRun=false;
  P.masterRun=true;

  closeAllOverlays();

  G.scene='travel';
  G.travelTarget=id;
  G.sceneTime=0;

  SFX.portal();
  MUSIC.setWorld(id)
}

function spawnWorldContent(id){
  const w=WORLDS[id],pr=runProgress(id);

  if(id!=='earth'||P.corruptedRun||P.masterRun){
    const goal=fragmentGoal(id),firstX=1050,lastX=w.width-1450;
    const gap=(lastX-firstX)/(goal-1);

    for(let i=0;i<goal;i++){
      if(i>=pr.fragments)
        G.pickups.push({
          kind:'fragment',
          x:firstX+i*gap,
          y:500+((i%3)-1)*28,
          taken:false
        });
    }

    // Two optional healing stations make the longer one-life stages fair,
    // but they do not act as checkpoints. Dying still restarts the stage.
    G.pickups.push({
      kind:'riftWell',
      x:Math.round(w.width*.35),
      y:515,
      taken:false
    });

    G.pickups.push({
      kind:'riftWell',
      x:Math.round(w.width*.69),
      y:515,
      taken:false
    });
  }

  pr.chests=pr.chests||[];

  const chestCount=id==='earth'?2:3;

  for(let i=0;i<chestCount;i++){
    if(!pr.chests.includes(i)){
      const frac=(i+1)/(chestCount+1);

      G.pickups.push({
        kind:'chest',
        chestId:i,
        x:Math.round(w.width*frac+((i%2)*90-45)),
        y:535-((i%2)*24),
        taken:false
      });
    }
  }

  const baseRoster=PET_ROSTERS[id]||[],
        roster=(P.corruptedRun&&WORLD_ORDER.includes(id))
          ?baseRoster.map(corruptedPetName)
          :baseRoster;

  if(P.corruptedRun)
    baseRoster.forEach(base=>
      ensureCorruptedPetDefinition(
        corruptedPetName(base),
        base,
        id
      )
    );

  const petStart=id==='earth'&&!P.corruptedRun&&!P.masterRun?720:900;
  const petEnd=id==='earth'?4500:w.width-1100;
  const petGap=roster.length>1?(petEnd-petStart)/(roster.length-1):0;

  roster.forEach((name,i)=>{
    if(!pr.petFound.includes(name))
      G.pickups.push({
        kind:'pet',
        name,
        x:petStart+i*petGap,
        y:520-((i%3)*18),
        taken:false
      });
  });

  const count=
    id==='godrealm'
      ?30
      :id==='corruptrealm'
        ?26
        :P.masterRun
          ?28
          :P.corruptedRun
            ?22
            :(id==='earth'?8:18);

  const enemyStart=id==='earth'&&!P.corruptedRun&&!P.masterRun?1050:850;
  const enemyEnd=id==='earth'&&!P.corruptedRun&&!P.masterRun?4060:w.width-900;
  const enemyGap=count>1?(enemyEnd-enemyStart)/(count-1):0;

  for(let i=0;i<count;i++){
    const elite=
      P.masterRun
        ?(i%5===3)
        :id==='godrealm'
          ?(i%6===4)
          :id==='earth'
            ?i===5
            :(i===5||i===12);

    spawnEnemy(
      id,
      enemyStart+i*enemyGap,
      500+(i%4)*22,
      false,
      elite
    );
  }

  if(id==='war'&&!P.corruptedRun&&!P.masterRun&&pr.beacons<WAR_BEACON_GOAL){
    const start=1700,end=w.width-1700,gap=(end-start)/(WAR_BEACON_GOAL-1);

    for(let i=pr.beacons;i<WAR_BEACON_GOAL;i++)
      G.pickups.push({
        kind:'beacon',
        x:start+i*gap,
        y:520,
        taken:false
      });
  }

  // V14: optional shrines add run-building decisions to long stages.
  if(id!=='earth'||P.corruptedRun||P.masterRun){
    G.pickups.push({
      kind:'shrine',
      shrineId:0,
      x:Math.round(w.width*.27),
      y:520,
      taken:false
    });

    G.pickups.push({
      kind:'shrine',
      shrineId:1,
      x:Math.round(w.width*.61),
      y:520,
      taken:false
    });
  }

  // A purchased treasure map creates three bonus vaults in its target world.
  if(P.treasureMapWorld===id&&!P.corruptedRun&&!P.masterRun){
    for(let i=0;i<3;i++)
      G.pickups.push({
        kind:'mapCache',
        mapId:i,
        x:Math.round(w.width*(.22+i*.27)),
        y:500+(i%2)*28,
        taken:false
      });

    P.treasureMapWorld=null;
  }

  // Legendary Hunts are replayable miniboss contracts and work even after the normal boss is cleared.
  if(P.legendaryHunt===id&&WORLD_ORDER.includes(id)&&!P.corruptedRun&&!P.masterRun){
    spawnEnemy(
      id,
      Math.round(w.width*.74),
      485,
      false,
      true
    );

    const le=G.enemies[G.enemies.length-1];

    le.legendary=true;
    le.name='Legendary '+enemyName(id,2);
    le.hp=Math.round(le.hp*3.25);
    le.maxHP=le.hp;
    le.damage=Math.round(le.damage*1.55);

    toast(
      'LEGENDARY PRESENCE',
      le.name+' is somewhere in this world.',
      4
    );
  }

  if(pr.bossDefeated){
    G.pickups.push({
      kind:'portal',
      x:w.width-420,
      y:500,
      taken:false
    });
  }else if(
    (id!=='earth'||P.corruptedRun||P.masterRun)&&
    pr.fragments>=fragmentGoal(id)&&
    (id!=='war'||P.corruptedRun||P.masterRun||pr.beacons>=WAR_BEACON_GOAL)
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
    earth:['Moss Stalker','Crystal Beetle','Ruin Crawler'],
    music:['Amp Spider','Beat Brute','Sound Phantom'],
    money:['Coin Mimic','Vault Gremlin','Goldback Bandit'],
    cosmos:['Star Crawler','Meteor Crab','Nebula Wisp'],
    war:['Battle Droid','Siege Hound','Razor Drone'],
    void:['Shadow Stalker','Rift Spider','Abyss Wraith'],
    matrix:['Glitch Beast','Data Serpent','Fragment Bot'],
    corruptrealm:['Corrupted Husk','Error Stalker','Rift Parasite']
  };

  return(
    names[world]||
    WORLDS[world]?.enemyNames||
    ['Rift Creature']
  )[v%3];
}

function spawnEnemy(world,x,y,boss=false,elite=false){
  const w=WORLDS[world],
        variant=randi(0,2),
        wi=world==='godrealm'
          ?32
          :world==='corruptrealm'
            ?31
            :Math.max(0,WORLD_ORDER.indexOf(world)),
        corrupted=P.corruptedRun||world==='corruptrealm',
        master=P.masterRun&&WORLD_ORDER.includes(world),
        baseHp=boss?650+wi*120:110+wi*25,
        baseDmg=boss?55:24+wi*4,
        corruptScale=corrupted?(boss?1.48:1.32):1,
        masterScale=master?(boss?2.25:1.82):1,
        godScale=world==='godrealm'?(boss?1.75:1.45):1,
        hp=Math.round(
          baseHp*
          (elite&&!boss?1.75:1)*
          corruptScale*
          masterScale*
          godScale
        ),
        damage=Math.round(
          baseDmg*
          (elite&&!boss?1.25:1)*
          (corrupted?1.18:1)*
          (master?1.55:1)*
          (world==='godrealm'?1.28:1)
        );

  const rawName=
    boss
      ?w.boss
      :(elite
        ?'Elite '+enemyName(world,variant)
        :enemyName(world,variant)),

        name=
          corrupted&&world!=='corruptrealm'
            ?'Corrupted '+rawName
            :rawName;

  G.enemies.push({
    id:cryptoId(),
    world,
    x,
    y,
    vx:0,
    hp,
    maxHP:hp,
    damage,
    boss,
    elite:elite&&!boss,
    corrupted,
    master,
    alive:true,
    hit:0,
    attackCd:rand(.2,1.2),
    phase:0,
    variant,
    name
  });

  if(boss){
    MUSIC.startBoss();
    toast('BOSS DETECTED',w.boss)
  }
}

function cryptoId(){
  return Math.random().toString(36).slice(2)+
    Date.now().toString(36).slice(-4)
}

function updateEarthQuest(){
  const p=G.progress.earth,s=p.storyStage;

  if(s===0)quest('STRANDED','Inspect the crashed ship.');
  if(s===1)quest('FIRST WEAPON','Find the energy signature east of the wreck.');
  if(s===2)quest('SHIP PARTS','Recover 3 ship components. '+p.shipParts+'/3');
  if(s===3)quest('SIGNAL PEAK','Activate the ancient signal tower.');
  if(s===4)quest('ANCIENT GATE','Open the gate and face what is protecting it.');
  if(s===5)quest('RUIN GUARDIAN','Defeat the Ruin Guardian.');
  if(s===6)quest('REPAIR THE SHIP','Return to the wreck and repair your ship.');
  if(s>=7)quest('THE SIGNAL','Launch toward the mysterious Hub signal.');
}

function completeCorruptedRealm(){
  if(G.corruptedRealmCleared)return;

  const pr=runProgress('corruptrealm');

  pr.bossDefeated=true;
  G.corruptedRealmCleared=true;
  G.corruptionAwakened=true;
  G.cores+=3;

  addMaterial('Boss Core',3);
  addMaterial('Corruption Essence',25);
  addCredits(6500);

  grantWorldWeapon('corruptrealm');

  ARMORS.corrupt.unlocked=true;

  SFX.core();
  MUSIC.endBoss();

  G.pickups.push({
    kind:'portal',
    x:WORLDS.corruptrealm.width-420,
    y:500,
    taken:false
  });

  quest(
    'CORRUPTED MODE UNLOCKED',
    'The Heart is destroyed. The 31 normal worlds remain safe, but optional Corrupted versions can now be entered from World Navigation.'
  );

  toast(
    'CORRUPTED MODE UNLOCKED',
    'Normal worlds are unchanged. Challenge their separate corrupted versions for corrupted pets, bosses and weapons.',
    7
  );
}

function completeCorruptedWorld(id){
  const pr=runProgress(id);

  pr.bossDefeated=true;

  const first=!G.corruptedCompleted.has(id);

  G.corruptedCompleted.add(id);

  addMaterial(
    'Corruption Essence',
    first?5:2
  );

  addCredits(
    900+worldNumber(id)*85
  );

  grantCorruptedWorldWeapons(id);

  SFX.core();
  MUSIC.endBoss();

  G.pickups.push({
    kind:'portal',
    x:WORLDS[id].width-420,
    y:500,
    taken:false
  });

  quest(
    'CORRUPTION PURGED',
    WORLDS[id].name+' has been stabilized. Corrupted weapons from this world are now available.'
  );

  toast(
    'CORRUPTED WORLD CLEARED',
    G.corruptedCompleted.size+' / '+WORLD_ORDER.length+' corrupted worlds purified.',
    4.5
  );

  if(G.corruptedCompleted.size>=WORLD_ORDER.length&&!P.corruptionMaster){
    P.corruptionMaster=true;

    addCredits(20000);
    addMaterial('Boss Core',10);
    addMaterial('Corruption Essence',50);

    toast(
      'CORRUPTION MASTER',
      'All 31 corrupted worlds cleared! A 33rd signal has appeared: THE LAND OF GODS.',
      8
    )
  }
}

function completeLandOfGods(){
  if(G.landOfGodsCleared)return;

  const pr=runProgress('godrealm');

  pr.bossDefeated=true;
  G.landOfGodsCleared=true;
  G.masterModeUnlocked=true;
  G.cores+=5;

  addMaterial('Boss Core',5);
  addMaterial('Divine Essence',30);
  addCredits(12000);

  grantWorldWeapon('godrealm');

  ARMORS.divine.unlocked=true;

  SFX.core();
  MUSIC.endBoss();

  G.pickups.push({
    kind:'portal',
    x:WORLDS.godrealm.width-420,
    y:500,
    taken:false
  });

  quest(
    'MASTER MODE AWAKENED',
    'Astraeus has fallen. Every original world now has a MASTER MODE version in World Navigation.'
  );

  toast(
    'MASTER MODE UNLOCKED',
    'All 31 worlds gained a Master version: stronger enemies, more elites, two-phase bosses and Master Sigils.',
    8
  );
}

function completeMasterWorld(id){
  const pr=runProgress(id);

  pr.bossDefeated=true;

  const first=!G.masterCompleted.has(id);

  G.masterCompleted.add(id);

  addMaterial(
    'Master Sigil',
    first?3:1
  );

  addMaterial(
    'Boss Core',
    first?2:1
  );

  addCredits(
    1800+worldNumber(id)*120
  );

  SFX.core();
  MUSIC.endBoss();

  G.pickups.push({
    kind:'portal',
    x:WORLDS[id].width-420,
    y:500,
    taken:false
  });

  quest(
    'MASTER STAGE CONQUERED',
    WORLDS[id].name+' Master Mode cleared.'
  );

  toast(
    'MASTER CLEAR',
    G.masterCompleted.size+' / '+WORLD_ORDER.length+' worlds mastered.',
    4.5
  );

  if(G.masterCompleted.size>=WORLD_ORDER.length&&!P.riftGrandmaster){
    P.riftGrandmaster=true;

    addCredits(50000);
    addMaterial('Master Sigil',25);

    toast(
      'RIFT GRANDMASTER',
      'Every world has been conquered in Master Mode. +50,000 credits and 25 Master Sigils.',
      8
    )
  }
}

function completeWorld(id){
  if(id==='godrealm'){
    completeLandOfGods();
    return
  }

  if(id==='corruptrealm'){
    completeCorruptedRealm();
    return
  }

  if(P.masterRun){
    completeMasterWorld(id);
    return
  }

  if(P.corruptedRun){
    completeCorruptedWorld(id);
    return
  }

  if(G.completed.has(id))return;

  G.completed.add(id);
  G.progress[id].bossDefeated=true;
  G.cores++;

  ensureHubProgress();

  P.hubStats.bosses=Math.max(
    P.hubStats.bosses||0,
    G.completed.size
  );

  P.hubStats.clears=
    (P.hubStats.clears||0)+1;

  addMaterial('Boss Core',1);

  const rewardMult=
    P.activeChallenge?.reward||1;

  addCredits(
    Math.round(
      (350+WORLD_ORDER.indexOf(id)*100)*
      rewardMult
    )
  );

  SFX.core();
  MUSIC.endBoss();

  if(rewardMult>1)
    toast(
      'CHALLENGE BONUS',
      'Protocol reward multiplier x'+rewardMult.toFixed(2)+' applied.'
    );

  grantWorldWeapon(id);

  const idx=WORLD_ORDER.indexOf(id);

  if(idx>=0&&idx<WORLD_ORDER.length-1)
    G.unlocked.add(
      WORLD_ORDER[idx+1]
    );

  if(G.completed.size>=WORLD_ORDER.length&&!G.corruptedRealmCleared)
    toast(
      'UNKNOWN 32ND SIGNAL',
      'World Navigation has detected a forbidden realm: THE CORRUPTED REALM.',
      6
    );

  if(id==='earth'){
    G.progress.earth.storyStage=6;
    updateEarthQuest();
  }else{
    G.pickups.push({
      kind:'portal',
      x:WORLDS[id].width-420,
      y:500,
      taken:false
    });

    quest(
      'CORE RECOVERED',
      'Return to The Hub through the Rift portal.'
    )
  }
}

function beginMasteryTrial(id,anomaly=false){
  if(!G.completed.has(id)){
    toast(
      'MASTERY HALL',
      'Defeat this world normally first.'
    );
    return
  }

  closeAllOverlays();

  P.masteryTrialWorld=id;
  P.anomalyRun=!!anomaly;
  P.activeAnomaly=
    anomaly
      ?todayAnomaly()
      :null;

  beginWorld(id);

  G.pickups=
    G.pickups.filter(
      p=>p.kind!=='portal'
    );

  spawnEnemy(
    id,
    WORLDS[id].width-650,
    500,
    true
  );

  quest(
    anomaly
      ?'DAILY ANOMALY'
      :'WORLD MASTERY',

    WORLDS[id].name+
    ' replay · defeat '+
    WORLDS[id].boss+
    ' again for permanent mastery.'
  );

  if(anomaly)
    toast(
      P.activeAnomaly.name,
      P.activeAnomaly.desc,
      4
    )
}

function completeMasteryRun(id){
  ensureHubProgress();

  const lt=P.longTerm,
        old=lt.worldClears[id]||0,
        now=old+1;

  lt.worldClears[id]=now;

  P.hubStats.clears=
    (P.hubStats.clears||0)+1;

  let mult=P.activeAnomaly?.reward||1,
      reward=Math.round(
        (
          260+
          worldNumber(id)*35+
          now*22
        )*
        mult
      );

  addCredits(reward);

  if(now%3===0)
    addMaterial(
      'Boss Core',
      1
    );

  if(P.anomalyRun){
    lt.anomalyClaims[dayKey()]=true;

    P.riftTokens+=3;
    lt.tower.tokens=P.riftTokens;

    addMaterial(
      worldMaterial(id),
      3
    );

    toast(
      'ANOMALY CLEARED',
      reward+
      ' credits · 3 Rift Tokens · '+
      masteryRank(now)+
      ' mastery.',
      4
    );

  }else{
    toast(
      'MASTERY CLEAR',
      WORLDS[id].name+
      ' is now '+
      masteryRank(now)+
      ' · '+
      now+
      ' clears.',
      4
    );
  }

  P.masteryTrialWorld=null;
  P.anomalyRun=false;
  P.activeAnomaly=null;

  STAGE_RUN.snapshot=null;

  MUSIC.endBoss();

  G.pickups.push({
    kind:'portal',
    x:WORLDS[id].width-420,
    y:500,
    taken:false
  });

  quest(
    'TRIAL COMPLETE',
    'Return to The Hub or keep exploring.'
  )
}
/* =========================================================
   INPUT / MOVEMENT / COMBAT
   ========================================================= */
const TUTORIAL_STEPS=[
  {title:'Move Through the World',text:'Use WASD or the Arrow Keys. You can move forward, backward, left, right and diagonally.',keys:['W','A','S','D'],accept:k=>['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)},
  {title:'Jump',text:'Press Space to jump. You can keep moving while you are in the air.',keys:['SPACE'],accept:k=>k===' '},
  {title:'Rift Dash',text:'Press Shift to dash. Hold a movement direction first to dash that way.',keys:['SHIFT'],accept:k=>k==='shift'},
  {title:'Interact',text:'Press E when the interaction prompt appears to inspect, collect or activate something.',keys:['E'],accept:k=>k==='e'},
  {title:'Attack',text:'Press F to attack with your equipped weapon. Critical hits can deal double damage.',keys:['F'],accept:k=>k==='f'},
  {title:'Rift Interface',text:'Use I for inventory, J for pets and V to toggle audio. You can replay this tutorial from Pause.',keys:['I','J','V'],accept:k=>['i','j','v'].includes(k)}
];

function startTutorial(force=false){
  if(!force&&G.tutorialDone)return;
  G.tutorialActive=true;
  G.tutorialStep=0;

  const panel=$('tutorialPanel');
  if(panel)panel.classList.remove('hidden');

  renderTutorialStep();
}

function renderTutorialStep(){
  if(!G.tutorialActive)return;

  const step=TUTORIAL_STEPS[G.tutorialStep];

  if(!step)return finishTutorial();

  $('tutorialTitle').textContent=step.title;
  $('tutorialText').textContent=step.text;
  $('tutorialProgress').textContent=(G.tutorialStep+1)+' / '+TUTORIAL_STEPS.length;

  $('tutorialBarFill').style.width=
    ((G.tutorialStep+1)/TUTORIAL_STEPS.length*100)+'%';

  $('tutorialKeys').innerHTML=
    step.keys.map(k=>'<kbd>'+k+'</kbd>').join('');
}

function handleTutorialKey(k){
  if(!G.tutorialActive)return;

  const step=TUTORIAL_STEPS[G.tutorialStep];

  if(step&&step.accept(k)){
    G.tutorialStep++;
    SFX.click();

    if(G.tutorialStep>=TUTORIAL_STEPS.length)
      finishTutorial();
    else
      renderTutorialStep();
  }
}

function finishTutorial(){
  G.tutorialActive=false;
  G.tutorialDone=true;
  G.tutorialStep=0;

  if($('tutorialPanel'))
    $('tutorialPanel').classList.add('hidden');

  toast(
    'TRAINING COMPLETE',
    'Controls unlocked. Explore Earth 2.0 and find the Nova Sword.',
    3
  );
}

if($('tutorialSkipBtn'))
  $('tutorialSkipBtn').onclick=()=>finishTutorial();

if($('tutorialNextBtn'))
  $('tutorialNextBtn').onclick=()=>finishTutorial();


window.addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))
    e.preventDefault();

  const k=e.key.toLowerCase();

  if(!keys[k])
    justPressed.add(k);

  keys[k]=true;

  checkSecretCode(k);
  handleTutorialKey(k);

  if(k==='f'&&!G.paused)
    tryAttack();

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

  if(k==='i')
    toggleOverlay('inventoryOverlay',renderInventory);

  if(k==='j')
    toggleOverlay('petsOverlay',renderPets);

  if(k==='m'&&G.scene==='hub')
    toggleOverlay('mapOverlay',renderWorldMap);

  if(k==='escape')
    togglePause();
});

window.addEventListener(
  'keyup',
  e=>keys[e.key.toLowerCase()]=false
);


function setAnim(state){
  if(P.anim.state===state)return;

  P.anim.state=state;
  P.anim.time=0;
}


const WORLD_GIMMICK={
  timer:0,
  phase:0,
  lastNotice:'',
  corruptTimer:0
};


function worldModifiers(){
  const g=WORLDS[G.worldId]?.gimmick;
  const t=G.time||0;

  const m={
    speed:1,
    gravity:1,
    jump:1,
    cooldown:1,
    crit:0
  };

  if(g==='ice')
    m.speed=1.12;

  if(g==='water'){
    m.speed=.72;
    m.gravity=.48;
    m.jump=.82;
  }

  if(g==='sugar')
    m.speed=1.35;

  if(g==='time')
    m.speed=Math.sin(t*.8)>0?1.35:.68;

  if(g==='gravity'){
    m.gravity=Math.sin(t*.7)>0?1.65:.45;
    m.jump=m.gravity>1?1.18:.82;
  }

  if(g==='tiny'){
    m.speed=1.18;
    m.jump=.88;
  }

  if(g==='giant')
    m.speed=.86;

  if(g==='wind')
    m.speed=1.08;

  if(g==='crystal')
    m.crit=.18;

  if(g==='security')
    m.speed=.95;

  if(g==='mirror'&&Math.floor(t/6)%2===1)
    m.mirror=true;

  if(g==='bounce')
    m.jump=1.32;

  if(g==='quantum'){
    m.speed=.78+((Math.sin(t*1.7)+1)/2)*.7;
    m.crit=.05+((Math.sin(t*2.3)+1)/2)*.2;
  }

  return m;
}


function updateWorldGimmick(dt){
  if(G.scene!=='world'||!G.worldId)return;

  const g=WORLDS[G.worldId]?.gimmick;

  if(P.masterRun){
    WORLD_GIMMICK.corruptTimer=
      (WORLD_GIMMICK.corruptTimer||0)+dt;

    if(WORLD_GIMMICK.corruptTimer>6){
      WORLD_GIMMICK.corruptTimer=0;
      G.flash=.10;
      G.screenShake=6;

      if(Math.random()<.38)
        hurtPlayer(42,P.x+1);

      for(const e of G.enemies)
        if(e.alive&&e.world===G.worldId&&!e.boss)
          e.attackCd=Math.max(0,e.attackCd-.35);

      toast(
        'MASTER PRESSURE',
        'The stage surges. Enemy attack windows accelerate.'
      );
    }
  }

  if(P.corruptedRun||G.worldId==='corruptrealm'){
    WORLD_GIMMICK.corruptTimer=
      (WORLD_GIMMICK.corruptTimer||0)+dt;

    if(WORLD_GIMMICK.corruptTimer>7.2){
      WORLD_GIMMICK.corruptTimer=0;
      G.flash=.11;

      const hit=Math.random()<.42;

      if(hit)
        hurtPlayer(
          G.worldId==='corruptrealm'?48:34,
          P.x+1
        );

      for(const e of G.enemies){
        if(
          e.alive&&
          e.world===G.worldId&&
          !e.boss&&
          Math.random()<.18
        ){
          e.hp=Math.min(
            e.maxHP,
            e.hp+Math.round(e.maxHP*.08)
          );

          e.damage+=1;
        }
      }

      toast(
        'CORRUPTION SURGE',
        hit
          ?'Reality ruptured through your position.'
          :'The corruption shifted. Enemies are mutating.'
      );
    }
  }

  if(!g)return;

  WORLD_GIMMICK.timer+=dt;

  const moving=
    Math.abs(P.vx)+Math.abs(P.depthV)>30;

  if(g==='heat'&&WORLD_GIMMICK.timer>7){
    WORLD_GIMMICK.timer=0;
    hurtPlayer(42,P.x+1);

    toast(
      'HEAT WAVE',
      'The magma world erupts. Keep your HP ready.'
    );
  }

  if(g==='vines'&&WORLD_GIMMICK.timer>6){
    WORLD_GIMMICK.timer=0;
    P.vx*=.12;
    P.depthV*=.12;

    toast(
      'LIVING VINES',
      'The jungle grabs the ground beneath you.'
    );
  }

  if(g==='sand'&&WORLD_GIMMICK.timer>8){
    WORLD_GIMMICK.timer=0;
    G.flash=.14;
    P.vx-=P.facing*120;

    toast(
      'SANDSTORM',
      'A wall of sand sweeps across the ruins.'
    );
  }

  if(g==='dream'&&WORLD_GIMMICK.timer>7){
    WORLD_GIMMICK.timer=0;

    P.x=clamp(
      P.x+rand(-220,220),
      100,
      WORLDS[G.worldId].width-100
    );

    toast(
      'DREAM SHIFT',
      'The dream rearranged the path around you.'
    );
  }

  if(g==='fear'&&!moving&&WORLD_GIMMICK.timer>3){
    WORLD_GIMMICK.timer=0;
    hurtPlayer(24,P.x+1);

    toast(
      'FEAR RISING',
      'Keep moving. The darkness feeds on hesitation.'
    );

  }else if(g==='fear'&&moving){
    WORLD_GIMMICK.timer=
      Math.max(
        0,
        WORLD_GIMMICK.timer-dt*2
      );
  }

  if(g==='giant'&&WORLD_GIMMICK.timer>6.5){
    WORLD_GIMMICK.timer=0;
    G.screenShake=15;

    if(P.onGround)
      hurtPlayer(30,P.x+1);

    toast(
      'COLOSSAL STEP',
      'Jump when the giant shockwave hits.'
    );
  }

  if(g==='stampede'&&WORLD_GIMMICK.timer>5.5){
    WORLD_GIMMICK.timer=0;
    P.vx+=210;
    G.screenShake=10;

    toast(
      'STAMPEDE',
      'The herd is charging from behind!'
    );
  }

  if(g==='ghost'&&WORLD_GIMMICK.timer>6){
    WORLD_GIMMICK.timer=0;

    for(const e of G.enemies)
      if(e.world===G.worldId&&!e.boss)
        e.invulnPhase=1.8;

    toast(
      'GHOST PHASE',
      'The spirits fade out for a moment.'
    );
  }

  for(const e of G.enemies)
    if(e.invulnPhase)
      e.invulnPhase=
        Math.max(
          0,
          e.invulnPhase-dt
        );

  if(g==='cannon'&&WORLD_GIMMICK.timer>5){
    WORLD_GIMMICK.timer=0;
    G.screenShake=9;

    if(Math.random()<.55)
      hurtPlayer(
        34,
        P.x+rand(-1,1)
      );

    toast(
      'CANNON BARRAGE',
      'Riftbeard’s fleet opens fire.'
    );
  }

  if(g==='wind')
    P.vx+=Math.sin(G.time*1.3)*75*dt;

  if(g==='lightning'&&WORLD_GIMMICK.timer>4.8){
    WORLD_GIMMICK.timer=0;
    G.flash=.2;

    if(Math.random()<.45)
      hurtPlayer(38,P.x+1);

    toast(
      'LIGHTNING',
      'The flash was your warning. Keep moving.'
    );
  }

  if(g==='security'&&WORLD_GIMMICK.timer>9){
    WORLD_GIMMICK.timer=0;

    for(const e of G.enemies){
      if(e.world===G.worldId&&e.alive){
        e.damage+=2;
        e.hp=Math.min(
          e.maxHP,
          e.hp+15
        );
      }
    }

    toast(
      'SECURITY LEVEL UP',
      'Mecha Metropolis has reinforced its patrols.'
    );
  }

  if(g==='ink'&&WORLD_GIMMICK.timer>8){
    WORLD_GIMMICK.timer=0;
    hurtPlayer(20,P.x+1);

    toast(
      'INK FLOOD',
      'The drawing is being erased from the edges inward.'
    );
  }

  if(g==='maze'&&WORLD_GIMMICK.timer>10){
    WORLD_GIMMICK.timer=0;

    P.x=clamp(
      P.x+rand(-350,350),
      100,
      WORLDS[G.worldId].width-100
    );

    toast(
      'MAZE SHIFT',
      'The corridors moved while you were inside them.'
    );
  }
}


function updatePlayer(dt,bounds){
  const s=getStats(),
        wm=worldModifiers();

  P.attackCooldown=
    Math.max(0,P.attackCooldown-dt);

  P.attackTimer=
    Math.max(0,P.attackTimer-dt);

  P.comboTimer=
    Math.max(0,P.comboTimer-dt);

  P.invuln=
    Math.max(0,P.invuln-dt);

  P.hitFlash=
    Math.max(0,P.hitFlash-dt);

  P.dashCooldown=
    Math.max(0,P.dashCooldown-dt);

  P.dashTimer=
    Math.max(0,P.dashTimer-dt);

  const renewal=
    talentLevel('regen');

  if(
    renewal>0&&
    ['world','tower','bossrush'].includes(G.scene)
  ){
    P.skillRegenTimer=
      (P.skillRegenTimer||0)+dt;

    if(
      P.skillRegenTimer>=
      Math.max(
        4.2,
        7-renewal*.6
      )
    ){
      P.skillRegenTimer=0;

      const mx=s.maxHP;

      if(P.hp<mx){
        const heal=
          Math.max(
            2,
            Math.round(
              mx*
              (.004+renewal*.003)
            )
          );

        P.hp=Math.min(
          mx,
          P.hp+heal
        );

        floatingText(
          'CORE +'+heal,
          P.x,
          P.y-132,
          '#83f5d0'
        );
      }
    }
  }

  P.anim.time+=dt;

  updatePetPassive(dt);

  // 2.5D movement:
  // A / D = left / right
  // W / S = forward / backward on the ground
  // Space = jump
  let moveX=
    (keys['a']||keys['arrowleft']?-1:0)+
    (keys['d']||keys['arrowright']?1:0);

  let moveY=
    (keys['w']||keys['arrowup']?-1:0)+
    (keys['s']||keys['arrowdown']?1:0);

  // Stop diagonal movement from being faster than straight movement.
  const moveLength=
    Math.hypot(moveX,moveY);

  if(moveLength>1){
    moveX/=moveLength;
    moveY/=moveLength;
  }

  if(wm.mirror)
    moveX*=-1;

  if(moveX!==0)
    P.facing=Math.sign(moveX);

  // Dash in the direction the player is currently moving.
  if(
    justPressed.has('shift')&&
    P.dashCooldown<=0
  ){
    if(moveX===0&&moveY===0){
      P.dashDirX=P.facing;
      P.dashDirY=0;
    }else{
      P.dashDirX=moveX;
      P.dashDirY=moveY;
    }

    P.dashTimer=.16;

    P.dashCooldown=
      Math.max(
        .30,
        .75-
        hubUpgradeLevel('mobility')*.04-
        talentLevel('dashhunter')*.04
      );

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
    P.dashTimer>0?2.6:1;

  const dirX=
    P.dashTimer>0
      ?P.dashDirX
      :moveX;

  const dirY=
    P.dashTimer>0
      ?P.dashDirY
      :moveY;

  // Depth movement is slightly slower to make the 2.5D perspective feel natural.
  const targetX=
    dirX*s.speed*wm.speed*dash;

  const targetDepth=
    dirY*s.speed*.72*dash;

  const smooth=
    Math.min(
      1,
      dt*(P.dashTimer>0?18:10)
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

  if(moveX===0&&P.dashTimer<=0)
    P.vx*=Math.pow(.001,dt);

  if(moveY===0&&P.dashTimer<=0)
    P.depthV*=Math.pow(.001,dt);

  P.x=
    clamp(
      P.x+P.vx*dt,
      80,
      bounds-80
    );

  // Keep the player on the visible walkable floor.
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
      P.y+P.depthV*dt,
      minY,
      maxY
    );

  // Jump is now SPACE ONLY. W is free for forward movement.
  if(
    justPressed.has(' ')&&
    P.onGround
  ){
    P.vy=-520*wm.jump;
    P.onGround=false;
    SFX.jump();
  }

  if(!P.onGround){
    P.vy+=1250*wm.gravity*dt;
    P.jump-=P.vy*dt;

    if(P.jump<=0&&P.vy>0){
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

  if(P.attackTimer>0)
    setAnim('attack');
  else if(P.dashTimer>0)
    setAnim('dash');
  else if(!P.onGround)
    setAnim(
      P.vy<0
        ?'jump'
        :'fall'
    );
  else if(
    Math.abs(P.vx)>35||
    Math.abs(P.depthV)>25
  )
    setAnim('run');
  else
    setAnim('idle');
}


function rollCritical(
  stats,
  comboIndex=P.attackIndex
){
  const bonus=
    comboIndex===2
      ?.08
      :0;

  return Math.random()<
    clamp(
      stats.critChance+
      bonus+
      (worldModifiers().crit||0),
      0,
      .8
    );
}


function tryAttack(){
  if(
    G.paused||
    isOverlayOpen()||
    ![
      'world',
      'hub',
      'arena',
      'tower',
      'bossrush'
    ].includes(G.scene)||
    !P.weapon||
    P.attackCooldown>0
  )return;

  const s=getStats(),
        w=getWeapon()||
          WEAPONS['Nova Sword'];

  P.attackCooldown=s.cooldown;

  P.attackAnimMax=
    clamp(
      s.cooldown*.72,
      .16,
      .36
    );

  P.attackTimer=
    P.attackAnimMax;

  if(P.comboTimer>0)
    P.attackIndex=
      (P.attackIndex+1)%3;
  else
    P.attackIndex=0;

  P.comboTimer=.8;

  SFX.swing();

  const finisher=
    P.attackIndex===2;

  const range=
    Math.round(
      w.range*
      (finisher?1.18:1)
    );

  const comboSkill=
    talentLevel('combo');

  const finisherMult=
    weaponHasSpecial(w,'rift')&&finisher
      ?1.62+comboSkill*.08
      :finisher
        ?1.42+comboSkill*.08
        :1;

  const baseDamage=
    Math.round(
      s.atk*
      finisherMult*
      rand(.9,1.1)
    );

  if(G.scene==='arena'){
    const critical=
      rollCritical(s);

    const damage=
      Math.round(
        baseDamage*
        (critical?s.critDamage:1)
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
      !e.alive||
      e.world!==G.worldId
    )continue;

    const dx=
      (e.x-P.x)*P.facing;

    if(
      dx>-38&&
      dx<range&&
      Math.abs(e.y-P.y)<90
    ){
      const critical=
        rollCritical(s);

      let damage=
        Math.round(
          baseDamage*
          (
            critical
              ?s.critDamage
              :1
          )
        );

      if(
        weaponHasSpecial(w,'boss')&&
        e.boss
      )
        damage=
          Math.round(
            damage*1.28
          );

      if(
        e.boss&&
        talentLevel('breaker')
      )
        damage=
          Math.round(
            damage*
            (
              1+
              talentLevel('breaker')*.06
            )
          );

      if(
        e.elite&&
        talentLevel('apexhunter')
      )
        damage=
          Math.round(
            damage*1.30
          );

      if(
        e.legendary&&
        talentLevel('apexhunter')
      )
        damage=
          Math.round(
            damage*1.30
          );

      const execRank=
        talentLevel('execution');

      const execThreshold=
        .25+execRank*.03;

      if(
        (
          weaponHasSpecial(w,'execute')||
          execRank>0
        )&&
        e.hp/e.maxHP<
        execThreshold
      )
        damage=
          Math.round(
            damage*
            (
              1.45+
              execRank*.05
            )
          );

      if(
        finisher&&
        talentLevel('novaheart')
      )
        damage=
          Math.round(
            damage*1.12
          );

      if(w.fused)
        damage=
          Math.round(
            damage*
            (w.fusionAmp||1)
          );

      const landed=
        hurtEnemy(
          e,
          damage,
          critical,
          weaponHasSpecial(
            w,
            'phase'
          )
        );

      if(landed){
        applyWeaponSpecial(
          e,
          damage,
          w,
          finisher,
          critical
        );

        hit=true;
      }
    }
  }

  if(hit)
    G.screenShake=
      Math.max(
        G.screenShake,
        finisher?8:4
      );
}


function applyWeaponSpecial(
  e,
  damage,
  w,
  finisher,
  critical=false
){
  if(
    !e||
    !w||
    !e.alive
  )return;

  const specials=[
    w.special,
    w.special2
  ].filter(
    (v,i,a)=>
      v&&a.indexOf(v)===i
  );

  for(const special of specials){

    if(special==='multi'){
      const echo=
        Math.max(
          1,
          Math.round(
            damage*.24
          )
        );

      e.hp-=echo;

      floatingText(
        'ECHO '+echo,
        e.x,
        e.y-112,
        w.accent
      );

      burst(
        e.x,
        e.y-42,
        w.color,
        5
      );

      if(e.hp<=0)
        killEnemy(e);
    }

    if(special==='burn'){
      const burn=
        Math.max(
          1,
          Math.round(
            damage*.22
          )
        );

      e.hp-=burn;

      floatingText(
        'BURN '+burn,
        e.x,
        e.y-112,
        '#ff9a55'
      );

      burst(
        e.x,
        e.y-35,
        '#ff6a38',
        8
      );

      if(e.hp<=0)
        killEnemy(e);
    }

    if(special==='freeze'){
      e.slowTimer=2.4;

      floatingText(
        'FROZEN',
        e.x,
        e.y-112,
        '#c9f8ff'
      );
    }

    if(
      special==='stun'&&
      finisher
    ){
      e.stunTimer=1.15;

      floatingText(
        'STUN',
        e.x,
        e.y-112,
        '#ffe49b'
      );
    }

    if(
      special==='knockback'&&
      !e.boss
    )
      e.x=
        clamp(
          e.x+
          P.facing*105,
          80,
          WORLDS[e.world].width-80
        );

    if(special==='lifesteal'){
      const heal=
        Math.max(
          1,
          Math.round(
            damage*.06
          )
        );

      P.hp=
        Math.min(
          getStats().maxHP,
          P.hp+heal
        );

      floatingText(
        '+'+heal+' HP',
        P.x,
        P.y-125,
        '#87ffc2'
      );
    }

    if(special==='heal'){
      const heal=
        Math.max(
          2,
          Math.round(
            damage*.035
          )
        );

      P.hp=
        Math.min(
          getStats().maxHP,
          P.hp+heal
        );

      floatingText(
        '+'+heal+' HP',
        P.x,
        P.y-125,
        '#87ffc2'
      );
    }

    if(special==='shock'){
      const other=
        G.enemies.find(
          x=>
            x.alive&&
            x!==e&&
            x.world===G.worldId&&
            Math.hypot(
              x.x-e.x,
              x.y-e.y
            )<240
        );

      if(other){
        const zap=
          Math.max(
            1,
            Math.round(
              damage*.42
            )
          );

        other.hp-=zap;

        burst(
          other.x,
          other.y-40,
          '#fff35d',
          9
        );

        floatingText(
          'CHAIN '+zap,
          other.x,
          other.y-92,
          '#fff57a'
        );

        if(other.hp<=0)
          killEnemy(other);
      }
    }

    if(special==='splash'){
      for(const other of G.enemies){
        if(
          other.alive&&
          other!==e&&
          other.world===G.worldId&&
          Math.hypot(
            other.x-e.x,
            other.y-e.y
          )<125
        ){
          const splash=
            Math.max(
              1,
              Math.round(
                damage*.28
              )
            );

          other.hp-=splash;

          burst(
            other.x,
            other.y-35,
            w.color,
            4
          );

          if(other.hp<=0)
            killEnemy(other);
        }
      }
    }

    if(special==='guard'){
      P.invuln=
        Math.max(
          P.invuln,
          .28
        );

      floatingText(
        'GUARD',
        P.x,
        P.y-125,
        w.accent
      );
    }

    if(
      special==='pull'&&
      !e.boss
    ){
      e.x=
        lerp(
          e.x,
          P.x+
          P.facing*70,
          .55
        );

      floatingText(
        'PULL',
        e.x,
        e.y-112,
        w.accent
      );
    }

    if(
      special==='chrono'&&
      finisher
    ){
      P.attackCooldown*=.35;

      floatingText(
        'TIME CUT',
        P.x,
        P.y-125,
        w.accent
      );
    }

    if(
      special==='reflect'&&
      critical
    ){
      P.invuln=
        Math.max(
          P.invuln,
          .35
        );

      floatingText(
        'MIRROR GUARD',
        P.x,
        P.y-125,
        w.accent
      );
    }

    if(
      special==='quantum'&&
      Math.random()<.34
    ){
      const q=
        Math.max(
          1,
          Math.round(
            damage*
            rand(.25,.65)
          )
        );

      e.hp-=q;

      floatingText(
        'QUANTUM +'+q,
        e.x,
        e.y-120,
        w.accent
      );

      burst(
        e.x,
        e.y-45,
        w.color,
        10
      );

      if(e.hp<=0)
        killEnemy(e);
    }

    if(
      special==='matrix'&&
      finisher
    ){
      for(const other of G.enemies){
        if(
          other.alive&&
          other!==e&&
          other.world===G.worldId&&
          Math.hypot(
            other.x-e.x,
            other.y-e.y
          )<220
        ){
          const pulse=
            Math.max(
              1,
              Math.round(
                damage*.35
              )
            );

          other.hp-=pulse;

          burst(
            other.x,
            other.y-40,
            w.color,
            7
          );

          if(other.hp<=0)
            killEnemy(other);
        }
      }
    }

    if(
      special==='corruption'&&
      (
        finisher||
        Math.random()<.18
      )
    ){
      const rupture=
        Math.max(
          1,
          Math.round(
            damage*.38
          )
        );

      e.hp-=rupture;

      floatingText(
        'RUPTURE '+rupture,
        e.x,
        e.y-132,
        '#ff55cb'
      );

      burst(
        e.x,
        e.y-45,
        '#7f2dff',
        14
      );

      addCombatStyle(
        12,
        'CORRUPTION RUPTURE'
      );

      if(e.hp<=0)
        killEnemy(e);
    }
  }

  if(w.fused&&finisher){
    const pulse=
      Math.max(
        1,
        Math.round(
          damage*.20
        )
      );

    for(const other of G.enemies){
      if(
        other.alive&&
        other!==e&&
        other.world===G.worldId&&
        Math.hypot(
          other.x-e.x,
          other.y-e.y
        )<175
      ){
        other.hp-=pulse;

        burst(
          other.x,
          other.y-40,
          w.accent,
          7
        );

        floatingText(
          'FUSION '+pulse,
          other.x,
          other.y-96,
          w.color
        );

        if(other.hp<=0)
          killEnemy(other);
      }
    }

    burst(
      e.x,
      e.y-45,
      w.color,
      10
    );

    burst(
      e.x,
      e.y-45,
      w.accent,
      10
    );

    G.screenShake=
      Math.max(
        G.screenShake,
        8
      );

    floatingText(
      'FUSION BURST',
      e.x,
      e.y-135,
      w.accent
    );
  }

  syncHUD();
}


function hurtEnemy(
  e,
  dmg,
  critical=false,
  ignorePhase=false
){
  if(
    e.invulnPhase>0&&
    !ignorePhase
  ){
    floatingText(
      'PHASED',
      e.x,
      e.y-90,
      '#d9e8ff'
    );

    return false;
  }

  e.hp-=dmg;

  e.hit=
    critical
      ?.24
      :.15;

  addCombatStyle(
    critical?16:6,
    critical
      ?'PRECISION'
      :''
  );

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

    G.hitStop=
      Math.max(
        G.hitStop,
        .055
      );

    G.impactFrame=
      Math.max(
        G.impactFrame,
        .075
      );

    G.impactX=
      G.scene==='world'
        ?e.x-G.camera
        :e.x;

    G.impactY=
      e.y-42;

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

  }else{
    SFX.hit();

    G.hitStop=
      Math.max(
        G.hitStop,
        .025
      );

    G.impactFrame=
      Math.max(
        G.impactFrame,
        .028
      );

    G.impactX=
      G.scene==='world'
        ?e.x-G.camera
        :e.x;

    G.impactY=
      e.y-40;

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

  if(
    e.boss&&
    e.master&&
    !e.masterPhase2&&
    e.hp>0&&
    e.hp<=e.maxHP*.5
  ){
    e.masterPhase2=true;

    e.hp=
      Math.round(
        e.maxHP*.68
      );

    e.damage=
      Math.round(
        e.damage*1.22
      );

    e.stunTimer=0;
    e.slowTimer=0;

    G.screenShake=18;
    G.flash=.18;

    burst(
      e.x,
      e.y-55,
      '#ffe889',
      30
    );

    floatingText(
      'MASTER PHASE II',
      e.x,
      e.y-145,
      '#fff0a3'
    );

    toast(
      'MASTER BOSS AWAKENED',
      e.name+
      ' restored part of its core and entered Phase II!',
      3.5
    );
  }

  if(e.hp<=0)
    killEnemy(e);

  return true;
}


function styleRank(){
  const s=G.combatStyle||0;

  return s>=260
    ?'SSS'
    :s>=200
      ?'SS'
      :s>=145
        ?'S'
        :s>=95
          ?'A'
          :s>=55
            ?'B'
            :s>=25
              ?'C'
              :'D';
}


function addCombatStyle(
  points,
  label=''
){
  if(
    ![
      'world',
      'tower',
      'bossrush'
    ].includes(G.scene)
  )return;

  G.combatStyle=
    clamp(
      (G.combatStyle||0)+points,
      0,
      300
    );

  G.combatChain=
    (G.combatChain||0)+1;

  G.styleTimer=3.2;

  if(
    label&&
    G.combatChain%4===0
  )
    floatingText(
      label,
      P.x,
      P.y-150,
      '#ffe98a'
    );
}


function updateCombatStyle(dt){
  if(
    ![
      'world',
      'tower',
      'bossrush'
    ].includes(G.scene)
  )return;

  if((G.styleTimer||0)>0)
    G.styleTimer-=dt;
  else
    G.combatStyle=
      Math.max(
        0,
        (G.combatStyle||0)-18*dt
      );

  if((G.combatStyle||0)<1)
    G.combatChain=0;
}


function killEnemy(e){
  if(!e.alive)return;

  e.alive=false;

  ensureHubProgress();

  if(e.boss)
    P.hubStats.bossKills=
      (P.hubStats.bossKills||0)+1;

  if(e.legendary){
    P.hubStats.legendaryKills++;
    P.legendaryMarks++;

    const first=
      !P.worldRelics[e.world];

    P.worldRelics[e.world]=true;
    P.legendaryHunt=null;

    addCredits(
      1200+
      worldNumber(e.world)*55
    );

    addMaterial(
      'Boss Core',
      1
    );

    SFX.core();

    burst(
      e.x,
      e.y-55,
      '#ffe36e',
      42
    );

    floatingText(
      'LEGENDARY MARK',
      e.x,
      e.y-155,
      '#fff0a0'
    );

    toast(
      'LEGENDARY HUNT COMPLETE',
      e.name+
      ' defeated! '+
      (
        first
          ?worldRelicName(e.world)+' recovered.'
          :'Duplicate relic converted into bonus rewards.'
      ),
      5
    );
  }

  gainWeaponMastery(
    e.boss
      ?10
      :e.legendary
        ?8
        :e.elite
          ?4
          :1
  );

  gainPetBondXP(
    e.boss
      ?10
      :e.legendary
        ?8
        :e.elite
          ?4
          :1
  );

  addCombatStyle(
    e.boss
      ?70
      :e.legendary
        ?55
        :e.elite
          ?38
          :22,

    e.boss
      ?'BOSS BREAK'
      :e.legendary
        ?'LEGEND BREAK'
        :e.elite
          ?'ELITE DOWN'
          :'RIFT FLOW'
  );

  burst(
    e.x,
    e.y-45,
    e.boss
      ?'#ff6e87'
      :e.legendary
        ?'#ffe36e'
        :e.elite
          ?'#ffe875'
          :'#72e6ff',
    e.legendary
      ?40
      :e.elite
        ?30
        :22
  );

  maybeDropPetGear(e);

  if(e.boss){

    if(G.scene==='tower'){
      G.towerBossDown=true;

    }else if(G.scene==='bossrush'){
      G.bossRushBossDown=true;

    }else if(P.masteryTrialWorld===e.world){
      completeMasteryRun(e.world);

    }else if(e.world==='godrealm'){
      completeLandOfGods();

    }else if(e.world==='corruptrealm'){
      completeCorruptedRealm();

    }else if(P.masterRun){
      completeMasterWorld(e.world);

    }else if(P.corruptedRun){
      completeCorruptedWorld(e.world);

    }else{
      completeWorld(e.world);
    }

  }else{
    P.hubStats.kills++;

    if(e.elite)
      P.hubStats.elites=
        (P.hubStats.elites||0)+1;

    let reward=
      randi(6,18);

    reward=
      Math.round(
        reward*
        (
          1+
          talentLevel('fortune')*.08
        )
      );

    if(
      (P.runShrines||[])
        .includes('fortune')
    )
      reward=
        Math.round(
          reward*1.35
        );

    if(P.activeAnomaly?.id==='treasure')
      reward=
        Math.round(
          reward*2.2
        );

    if(P.activeAnomaly?.id==='frenzy')
      reward=
        Math.round(
          reward*1.6
        );

    if(e.elite){
      reward=
        Math.round(
          reward*4
        );

      addMaterial(
        worldMaterial(e.world),
        2
      );

      floatingText(
        'ELITE CACHE',
        e.x,
        e.y-130,
        '#ffe875'
      );
    }

    const w=getWeapon(),
          ap=activePet(),
          pf=ap
            ?petProfile(ap.name)
            :null;

    if(weaponHasSpecial(w,'credits'))
      reward=
        Math.round(
          reward*1.65
        );

    if(pf?.passive.id==='credits')
      reward=
        Math.round(
          reward*
          (
            1.12+
            pf.passive.rank*.035
          )
        );

    addCredits(
      reward,
      e.x,
      e.y
    );

    if(weaponHasSpecial(w,'dash'))
      P.dashCooldown=0;

    let drop=
      .28+
      talentLevel('scavenger')*.05;

    if(P.activeAnomaly?.id==='treasure')
      drop+=.35;

    if(pf?.passive.id==='materials')
      drop+=
        .08+
        pf.passive.rank*.025;

    if(Math.random()<drop)
      addMaterial(
        worldMaterial(e.world),
        1
      );

    const leech=
      talentLevel('leech');

    if(leech>0){
      const heal=
        Math.max(
          1,
          Math.round(
            getStats().maxHP*
            .01*
            leech
          )
        );

      P.hp=
        Math.min(
          getStats().maxHP,
          P.hp+heal
        );

      floatingText(
        '+'+heal+' HP',
        P.x,
        P.y-118,
        '#8fffc1'
      );
    }
  }
}


function worldMaterial(id){
  if(P.masterRun)
    return 'Master Sigil';

  if(id==='godrealm')
    return 'Divine Essence';

  if(
    P.corruptedRun||
    id==='corruptrealm'
  )
    return 'Corruption Essence';

  return{
    earth:'Ancient Metal',
    music:'Sound Crystal',
    money:'Golden Ore',
    cosmos:'Star Dust',
    war:'Titan Scrap',
    void:'Void Essence',
    matrix:'Glitch Fragment',
    crystal:'Crystal Fragment',
    robot:'Titan Scrap',
    clockwork:'Ancient Metal',
    quantum:'Glitch Fragment'
  }[id]||'Rift Dust';
}


function hurtPlayer(
  amount,
  sourceX
){
  if(P.invuln>0)return;

  G.combatStyle=
    Math.max(
      0,
      (G.combatStyle||0)*.55
    );

  G.combatChain=0;
  G.styleTimer=0;

  const s=getStats(),
        ap=activePet(),
        pf=ap
          ?petProfile(ap.name)
          :null;

  let final=
    Math.max(
      1,
      Math.round(
        amount-
        s.def*.55
      )
    );

  const aegis=
    talentLevel('barrier');

  if(
    aegis>0&&
    Math.random()<
    .05+aegis*.04
  ){
    final=
      Math.max(
        1,
        Math.round(
          final*.65
        )
      );

    floatingText(
      'AEGIS PULSE',
      P.x,
      P.y-148,
      '#7defff'
    );

    burst(
      P.x,
      P.y-62,
      '#6fe8ff',
      10
    );
  }

  const armor=
    getArmor();

  if(
    armor.fused&&
    Math.random()<.12
  ){
    final=
      Math.max(
        1,
        Math.round(
          final*.72
        )
      );

    floatingText(
      'TWIN CORE GUARD',
      P.x,
      P.y-150,
      armor.accent||'#9eefff'
    );

    burst(
      P.x,
      P.y-65,
      armor.color||'#6cecff',
      9
    );
  }

  if(
    pf?.passive.id==='barrier'&&
    Math.random()<
    .12+
    pf.passive.rank*.025
  ){
    final=
      Math.max(
        1,
        Math.round(
          final*
          (
            .62-
            pf.passive.rank*.025
          )
        )
      );

    floatingText(
      'PET BARRIER',
      P.x,
      P.y-138,
      pf.accent
    );

    burst(
      P.x,
      P.y-62,
      pf.primary,
      8
    );
  }

  const secondWind=
    talentLevel('secondwind');

  if(
    [
      'world',
      'tower',
      'bossrush'
    ].includes(G.scene)&&
    P.hp-final<=0&&
    secondWind>0&&
    !P.skillSecondWindUsed
  ){
    P.skillSecondWindUsed=true;

    P.hp=
      Math.max(
        1,
        Math.round(
          s.maxHP*
          (
            .14+
            secondWind*.06
          )
        )
      );

    P.invuln=1.4;
    P.hitFlash=.25;
    G.screenShake=10;
    G.flash=.12;

    SFX.core();

    burst(
      P.x,
      P.y-60,
      '#9fffe0',
      24
    );

    floatingText(
      'SECOND WIND',
      P.x,
      P.y-138,
      '#caffef'
    );

    toast(
      'SECOND WIND',
      'Your Guardian skill prevented defeat.'
    );

    syncHUD();
    return;
  }

  if(
    G.scene==='world'&&
    P.hp-final<=0&&
    (P.nanoShields||0)>0
  ){
    P.nanoShields--;

    P.hp=
      Math.max(
        1,
        Math.round(
          s.maxHP*.28
        )
      );

    P.invuln=1.5;
    P.hitFlash=.35;
    G.screenShake=12;
    G.flash=.14;

    SFX.core();

    burst(
      P.x,
      P.y-60,
      '#8fffe2',
      26
    );

    floatingText(
      'NANO SHIELD',
      P.x,
      P.y-130,
      '#9affea'
    );

    toast(
      'MED BAY SAFEGUARD',
      'A Nano Shield prevented the lethal hit. '+
      P.nanoShields+
      ' remaining.'
    );

    syncHUD();
    return;
  }

  P.hp=
    Math.max(
      0,
      P.hp-final
    );

  P.invuln=.72;
  P.hitFlash=.18;

  P.vx=
    (P.x<sourceX?-1:1)*210;

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

  if(P.hp<=0)
    playerDefeated();

  syncHUD();
}


function playerDefeated(){
  if(
    G.scene==='tower'||
    G.scene==='bossrush'
  ){
    const mode=G.scene;

    if(mode==='tower')
      P.longTerm.tower.best=
        Math.max(
          P.longTerm.tower.best||0,
          (G.towerFloor||1)-1
        );

    $('cinematic')
      .classList
      .remove('hidden');

    $('cinematic').textContent=
      mode==='tower'
        ?'TOWER RUN ENDED'
        :'BOSS RUSH ENDED';

    G.paused=true;

    setTimeout(()=>{
      $('cinematic')
        .classList
        .add('hidden');

      G.paused=false;

      beginHub();

      toast(
        mode==='tower'
          ?'RIFT TOWER'
          :'BOSS RUSH',
        'Run saved. Return stronger and push farther.'
      );
    },900);

    return;
  }

  if(
    G.scene==='world'&&
    G.worldId&&
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

      if(
        P.masteryTrialWorld===
        failedWorld
      ){
        G.pickups=
          G.pickups.filter(
            p=>p.kind!=='portal'
          );

        spawnEnemy(
          failedWorld,
          WORLDS[failedWorld].width-650,
          500,
          true
        );

        quest(
          P.anomalyRun
            ?'DAILY ANOMALY'
            :'WORLD MASTERY',

          WORLDS[failedWorld].name+
          ' replay · defeat '+
          WORLDS[failedWorld].boss+
          ' again.'
        );
      }

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

  const stats=getStats();

  P.hp=stats.maxHP;

  P.x=
    G.scene==='hub'
      ?HUB_SPAWN_X
      :430;

  P.jump=0;
  P.vy=0;

  toast(
    'RIFT STABILIZED',
    'You were returned to safety.'
  );
}


function updateEnemies(dt){
  for(const e of G.enemies){
    if(
      !e.alive||
      e.world!==G.worldId
    )continue;

    e.hit=
      Math.max(
        0,
        e.hit-dt
      );

    e.attackCd-=dt;

    e.slowTimer=
      Math.max(
        0,
        (e.slowTimer||0)-dt
      );

    e.stunTimer=
      Math.max(
        0,
        (e.stunTimer||0)-dt
      );

    const dx=P.x-e.x;
    const dy=P.y-e.y;

    const dist=
      Math.hypot(
        dx,
        dy
      );

    // Enemies now chase the player in BOTH horizontal and depth directions.
    if(dist<620){
      const speed=
        (e.boss?110:85)*
        (e.slowTimer>0?.46:1)*
        (P.activeAnomaly?.id==='speed'?1.28:1)*
        (e.master?1.22:1)*
        (e.world==='godrealm'?1.12:1);

      if(
        dist>1&&
        e.stunTimer<=0
      ){
        e.x+=
          dx/dist*
          speed*
          dt;

        e.y+=
          dy/dist*
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

      if(e.boss)
        e.phase=
          e.hp/e.maxHP<.45
            ?2
            :1;
    }

    const range=
      e.boss
        ?100
        :62;

    if(
      dist<range&&
      e.attackCd<=0&&
      e.stunTimer<=0
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
        Math.round(
          e.damage*
          (
            P.activeAnomaly?.id==='frenzy'
              ?1.28
              :1
          )
        ),
        e.x
      );
    }
  }

  const ap=
    activePet();

  if(ap){
    const pf=
      petProfile(ap.name);

    ap.attackCd=
      (ap.attackCd||0)-dt;

    if(ap.attackCd<=0){
      const targets=
        G.enemies
          .filter(
            e=>
              e.alive&&
              e.world===G.worldId
          )
          .sort(
            (a,b)=>
              Math.hypot(
                a.x-P.x,
                a.y-P.y
              )-
              Math.hypot(
                b.x-P.x,
                b.y-P.y
              )
          );

      const target=targets[0],
            pg=petGearStats(ap),
            range=
              (pf?.petRange||360)+
              pg.range;

      if(
        target&&
        Math.hypot(
          target.x-P.x,
          target.y-P.y
        )<range
      ){
        const pb=
          PET_BONUS[ap.name]||{};

        let d=
          Math.round(
            (
              8+
              (pb.atk||5)*.45+
              ap.level*1.5
            )*
            (pf?.attack.power||1)*
            (
              1+
              (ap.bond||0)*.04
            )*
            pg.petPower*
            (
              1+
              talentLevel('resonance')*.07
            )*
            (
              talentLevel('oracle')
                ?1.12
                :1
            )
          );

        if(target.petMarked)
          d=
            Math.round(
              d*
              (
                1+
                .08*target.petMarked
              )
            );

        const pierce=
          pf?.attack.id==='phase';

        hurtEnemy(
          target,
          d,
          false,
          pierce
        );

        applyPetAttackGimmick(
          ap,
          target,
          d
        );

        ap.attackCd=
          (pf?.attackRate||1.25)/
          Math.max(1,pg.haste)/
          (
            1+
            talentLevel('pettempo')*.05
          );

        burst(
          target.x,
          target.y-30,
          pf?.primary||'#b6f8ff',
          5
        );
      }
    }
  }

  ensureHubProgress();

  if((P.droneLevel||0)>0){
    P.droneCd=
      (P.droneCd||0)-dt;

    if(P.droneCd<=0){
      const target=
        G.enemies
          .filter(
            e=>
              e.alive&&
              e.world===G.worldId
          )
          .sort(
            (a,b)=>
              Math.hypot(
                a.x-P.x,
                a.y-P.y
              )-
              Math.hypot(
                b.x-P.x,
                b.y-P.y
              )
          )[0];

      if(
        target&&
        Math.hypot(
          target.x-P.x,
          target.y-P.y
        )<430
      ){
        const dmg=
          10+
          P.droneLevel*7;

        hurtEnemy(
          target,
          dmg,
          false,
          true
        );

        burst(
          target.x,
          target.y-55,
          '#79efff',
          6
        );

        floatingText(
          'DRONE '+dmg,
          target.x,
          target.y-112,
          '#a8f8ff'
        );

        P.droneCd=
          Math.max(
            .65,
            2.35-
            P.droneLevel*.22
          );
      }
    }
  }
}
/* =========================================================
   INTERACTIONS
   ========================================================= */
function nearestInteraction(){
  const distanceTo=(x,y)=>Math.hypot(P.x-x,P.y-y);

  if(G.scene==='hub'){
    const spots=[
      {x:HUB_SPOTS.sanctuary.x,y:500,label:HUB_SPOTS.sanctuary.label,fn:()=>openOverlay('petsOverlay',renderPets)},
      {x:HUB_SPOTS.dojo.x,y:500,label:HUB_SPOTS.dojo.label,fn:()=>openHubFacility('dojo')},
      {x:HUB_SPOTS.arena.x,y:500,label:HUB_SPOTS.arena.label,fn:()=>openBonus(true)},
      {x:HUB_SPOTS.armory.x,y:500,label:HUB_SPOTS.armory.label,fn:()=>openOverlay('inventoryOverlay',renderInventory)},
      {x:HUB_SPOTS.research.x,y:500,label:HUB_SPOTS.research.label,fn:()=>openHubFacility('research')},
      {x:HUB_SPOTS.missions.x,y:500,label:HUB_SPOTS.missions.label,fn:()=>openHubFacility('missions')},
      {x:HUB_SPOTS.medbay.x,y:500,label:HUB_SPOTS.medbay.label,fn:()=>openHubFacility('medbay')},
      {x:HUB_SPOTS.foundry.x,y:500,label:HUB_SPOTS.foundry.label,fn:()=>openHubFacility('foundry')},
      {x:HUB_SPOTS.market.x,y:500,label:HUB_SPOTS.market.label,fn:()=>openHubFacility('market')},
      {x:HUB_SPOTS.observatory.x,y:500,label:HUB_SPOTS.observatory.label,fn:()=>openHubFacility('observatory')},
      {x:HUB_SPOTS.petgarden.x,y:500,label:HUB_SPOTS.petgarden.label,fn:()=>openHubFacility('petgarden')},
      {x:HUB_SPOTS.style.x,y:500,label:HUB_SPOTS.style.label,fn:()=>openHubFacility('style')},
      {x:HUB_SPOTS.challenge.x,y:500,label:HUB_SPOTS.challenge.label,fn:()=>openHubFacility('challenge')},
      {x:HUB_SPOTS.library.x,y:500,label:HUB_SPOTS.library.label,fn:()=>openHubFacility('library')},
      {x:HUB_SPOTS.hangar.x,y:500,label:HUB_SPOTS.hangar.label,fn:()=>openHubFacility('hangar')},
      {x:HUB_SPOTS.archive.x,y:500,label:HUB_SPOTS.archive.label,fn:()=>openHubFacility('archive')},
      {x:HUB_SPOTS.artifact.x,y:500,label:HUB_SPOTS.artifact.label,fn:()=>openHubFacility('artifact')},
      {x:HUB_SPOTS.drones.x,y:500,label:HUB_SPOTS.drones.label,fn:()=>openHubFacility('drones')},
      {x:HUB_SPOTS.kitchen.x,y:500,label:HUB_SPOTS.kitchen.label,fn:()=>openHubFacility('kitchen')},
      {x:HUB_SPOTS.guild.x,y:500,label:HUB_SPOTS.guild.label,fn:()=>openHubFacility('guild')},
      {x:HUB_SPOTS.lounge.x,y:500,label:HUB_SPOTS.lounge.label,fn:()=>openHubFacility('lounge')},
      {x:HUB_SPOTS.chronicle.x,y:500,label:HUB_SPOTS.chronicle.label,fn:()=>openHubFacility('chronicle')},
      {x:HUB_SPOTS.mastery.x,y:500,label:HUB_SPOTS.mastery.label,fn:()=>openHubFacility('mastery')},
      {x:HUB_SPOTS.tower.x,y:500,label:HUB_SPOTS.tower.label,fn:()=>openHubFacility('tower')},
      {x:HUB_SPOTS.bossrush.x,y:500,label:HUB_SPOTS.bossrush.label,fn:()=>openHubFacility('bossrush')},
      {x:HUB_SPOTS.anomaly.x,y:500,label:HUB_SPOTS.anomaly.label,fn:()=>openHubFacility('anomaly')},
      {x:HUB_SPOTS.ascension.x,y:500,label:HUB_SPOTS.ascension.label,fn:()=>openHubFacility('ascension')},
      {x:HUB_SPOTS.skillnexus.x,y:500,label:HUB_SPOTS.skillnexus.label,fn:()=>openHubFacility('skillnexus')},
      {x:HUB_SPOTS.huntlodge.x,y:500,label:HUB_SPOTS.huntlodge.label,fn:()=>openHubFacility('huntlodge')},
      {x:HUB_SPOTS.cartography.x,y:500,label:HUB_SPOTS.cartography.label,fn:()=>openHubFacility('cartography')},
      {x:HUB_SPOTS.petcoliseum.x,y:500,label:HUB_SPOTS.petcoliseum.label,fn:()=>openHubFacility('petcoliseum')},
      {x:HUB_SPOTS.arcade.x,y:500,label:HUB_SPOTS.arcade.label,fn:()=>openHubFacility('arcade')},
      {x:HUB_SPOTS.relicmuseum.x,y:500,label:HUB_SPOTS.relicmuseum.label,fn:()=>openHubFacility('relicmuseum')},
      {x:HUB_SPOTS.armorforge.x,y:500,label:HUB_SPOTS.armorforge.label,fn:()=>openHubFacility('armorforge')},
      {x:HUB_SPOTS.petfusion.x,y:500,label:HUB_SPOTS.petfusion.label,fn:()=>openHubFacility('petfusion')},
      {x:HUB_SPOTS.petgearforge.x,y:500,label:HUB_SPOTS.petgearforge.label,fn:()=>openHubFacility('petgearforge')},
      {x:HUB_SPOTS.terminal.x,y:500,label:HUB_SPOTS.terminal.label,fn:()=>openOverlay('mapOverlay',renderWorldMap)}
    ];

    for(const egg of EASTER_EGGS)
      if(egg.world==='hub'&&!G.easterEggs.has(egg.id))
        spots.push({
          x:egg.x,
          y:egg.y,
          label:'INVESTIGATE ???',
          fn:()=>collectEasterEgg(egg)
        });

    return spots
      .map(s=>({...s,d:distanceTo(s.x,s.y)}))
      .sort((a,b)=>a.d-b.d)[0];
  }

  if(G.scene!=='world')return null;

  const pr=runProgress(G.worldId),list=[];

  for(const egg of EASTER_EGGS){
    if(egg.world===G.worldId&&!G.easterEggs.has(egg.id))
      list.push({
        x:egg.x,
        y:egg.y,
        label:'INVESTIGATE ???',
        fn:()=>collectEasterEgg(egg),
        d:distanceTo(egg.x,egg.y)
      });
  }

  for(const p of G.pickups){
    if(!p.taken){
      list.push({
        x:p.x,
        y:p.y,
        label:interactionLabel(p),
        obj:p,
        fn:()=>interactPickup(p),
        d:distanceTo(p.x,p.y)
      });
    }
  }

  if(G.worldId==='earth'&&!P.corruptedRun&&!P.masterRun){
    const stage=pr.storyStage;
    const addStory=(x,y,label,fn)=>
      list.push({
        x,
        y,
        label,
        fn,
        d:distanceTo(x,y)
      });

    if(stage===0)
      addStory(480,510,'INSPECT WRECK',()=>{
        pr.storyStage=1;

        toast(
          'RIFTWALKER',
          'The ship is badly damaged. A strange energy signal is nearby.'
        );

        updateEarthQuest();
      });

    if(stage===1)
      addStory(1180,505,'TAKE NOVA SWORD',()=>{
        P.weapon='Nova Sword';
        P.weaponsOwned['Nova Sword']=true;
        pr.storyStage=2;

        addMaterial('Rift Dust',2);

        SFX.core();

        toast(
          'NOVA SWORD',
          'A Rift-powered blade responds to your Core.'
        );

        updateEarthQuest();
      });

    if(stage===2){
      [
        [1550,505],
        [2200,535],
        [2750,505]
      ].forEach(([x,y],i)=>{
        if(i>=pr.shipParts)
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

              if(pr.shipParts>=3)
                pr.storyStage=3;

              updateEarthQuest();
            }
          );
      });
    }

    if(stage===3)
      addStory(3350,525,'ACTIVATE SIGNAL TOWER',()=>{
        pr.storyStage=4;

        SFX.portal();

        toast(
          'UNKNOWN SIGNAL',
          'A structure called THE HUB is responding.'
        );

        updateEarthQuest();
      });

    if(stage===4)
      addStory(4050,525,'OPEN ANCIENT GATE',()=>{
        pr.storyStage=5;

        spawnEnemy(
          'earth',
          4650,
          500,
          true
        );

        updateEarthQuest();
      });

    if(stage===6)
      addStory(480,510,'REPAIR SHIP',()=>{
        pr.storyStage=7;

        toast(
          'SHIP ONLINE',
          'Navigation has locked onto the mysterious Hub signal.'
        );

        updateEarthQuest();
      });

    if(stage>=7)
      addStory(480,510,'LAUNCH TO THE HUB',()=>{
        G.unlocked.add('music');

        beginHub();

        toast(
          'THE HUB',
          'You have discovered the Riftwalker base.'
        );
      });
  }

  return list
    .sort((a,b)=>a.d-b.d)[0]||
    null;
}


function interactionLabel(p){
  return{
    pet:'BEFRIEND '+p.name,

    fragment:
      P.masterRun
        ?'COLLECT MASTER SEAL'
        :G.worldId==='godrealm'
          ?'COLLECT DIVINE SIGIL'
          :P.corruptedRun||
           G.worldId==='corruptrealm'
            ?'COLLECT CORRUPTION FRAGMENT'
            :'COLLECT RIFT FRAGMENT',

    beacon:'DESTROY WAR BEACON',
    riftWell:'USE RIFT WELL',
    chest:'OPEN RIFT CACHE',
    mapCache:'OPEN TREASURE VAULT',
    shrine:'ACTIVATE ANCIENT SHRINE',
    portal:'RETURN TO THE HUB'

  }[p.kind]||'INTERACT';
}


function interactPickup(p){
  const pr=runProgress(G.worldId);

  if(p.kind==='pet'){
    p.taken=true;

    pr.petFound.push(p.name);

    if(isCorruptedPet(p.name)){
      const base=p.name.slice(10);

      ensureCorruptedPetDefinition(
        p.name,
        base,
        G.worldId
      );
    }

    PET_STATE.owned[p.name]={
      name:p.name,
      level:1,
      x:P.x-60,
      y:P.y,
      attackCd:0,
      gear:{
        head:null,
        body:null,
        charm:null,
        paws:null
      }
    };

    if(!PET_STATE.active)
      PET_STATE.active=p.name;

    SFX.pet();

    toast(
      isCorruptedPet(p.name)
        ?'CORRUPTED PET CAPTURED'
        :'NEW PET',
      p.name+
      ' joined your collection.'
    );

    renderPets();
    syncHUD();
  }

  if(p.kind==='fragment'){
    p.taken=true;
    pr.fragments++;

    ensureHubProgress();

    addMaterial(
      worldMaterial(G.worldId),
      1
    );

    SFX.core();

    toast(
      P.masterRun
        ?'MASTER SEAL'
        :G.worldId==='godrealm'
          ?'DIVINE SIGIL'
          :P.corruptedRun||
           G.worldId==='corruptrealm'
            ?'CORRUPTION FRAGMENT'
            :'RIFT FRAGMENT',

      pr.fragments+
      ' / '+
      fragmentGoal()+
      ' recovered.'
    );

    if(
      pr.fragments>=fragmentGoal()&&
      (
        G.worldId!=='war'||
        P.corruptedRun||
        P.masterRun||
        pr.beacons>=WAR_BEACON_GOAL
      )
    ){
      spawnEnemy(
        G.worldId,
        WORLDS[G.worldId].width-650,
        500,
        true
      );

      quest(
        P.masterRun
          ?'MASTER BOSS'
          :G.worldId==='godrealm'
            ?'DIVINE BOSS'
            :P.corruptedRun
              ?'CORRUPTED BOSS'
              :'WORLD BOSS',

        'Defeat '+
        (
          P.masterRun
            ?'Master '
            :P.corruptedRun
              ?'Corrupted '
              :''
        )+
        WORLDS[G.worldId].boss+
        '.'
      );
    }
  }

  if(p.kind==='beacon'){
    p.taken=true;
    pr.beacons++;

    SFX.noise?.();

    toast(
      'WAR BEACON DESTROYED',
      pr.beacons+
      ' / '+
      WAR_BEACON_GOAL+
      ' offline.'
    );

    if(
      pr.beacons>=WAR_BEACON_GOAL&&
      pr.fragments>=WORLD_FRAGMENT_GOAL
    )
      spawnEnemy(
        'war',
        WORLDS.war.width-650,
        500,
        true
      );
  }

  if(p.kind==='riftWell'){
    p.taken=true;

    const max=getStats().maxHP,
          heal=
            Math.max(
              1,
              Math.round(
                max*.35
              )
            );

    P.hp=
      Math.min(
        max,
        P.hp+heal
      );

    P.attackCooldown=0;
    P.dashCooldown=0;

    SFX.core();

    burst(
      P.x,
      P.y-45,
      '#7ff6ff',
      22
    );

    floatingText(
      '+'+heal+' HP',
      P.x,
      P.y-110,
      '#8fffd0'
    );

    toast(
      'RIFT WELL',
      'Core stabilized. HP restored and combat cooldowns refreshed.'
    );

    syncHUD();
  }

  if(p.kind==='chest'){
    p.taken=true;

    pr.chests=
      pr.chests||[];

    if(
      !pr.chests.includes(
        p.chestId
      )
    )
      pr.chests.push(
        p.chestId
      );

    ensureHubProgress();

    P.hubStats.chests=
      (P.hubStats.chests||0)+1;

    const credits=
      randi(90,220)+
      worldNumber(G.worldId)*8,

      mat=
        worldMaterial(G.worldId),

      qty=
        randi(1,3);

    addCredits(credits);
    addMaterial(mat,qty);

    if(Math.random()<.35)
      addMaterial(
        'Rift Dust',
        randi(1,2)
      );

    SFX.core();

    burst(
      p.x,
      p.y-40,
      WORLDS[G.worldId].accent,
      24
    );

    toast(
      'RIFT CACHE OPENED',
      credits+
      ' credits · '+
      qty+
      ' '+
      mat+
      ' recovered.'
    );
  }

  if(p.kind==='mapCache'){
    p.taken=true;

    const credits=
      420+
      worldNumber(G.worldId)*22,

      mat=
        worldMaterial(G.worldId);

    addCredits(credits);
    addMaterial(mat,3);
    addMaterial('Rift Dust',2);

    SFX.core();

    burst(
      p.x,
      p.y-45,
      '#ffe477',
      30
    );

    toast(
      'TREASURE VAULT',
      credits+
      ' credits · 3 '+
      mat+
      ' · 2 Rift Dust.'
    );
  }

  if(p.kind==='shrine'){
    p.taken=true;

    const choices=
      SHRINE_BLESSINGS.filter(
        b=>
          !(P.runShrines||[])
            .includes(b.id)
      );

    const b=
      choices[
        (
          worldNumber(G.worldId)*7+
          p.shrineId*11+
          (P.runShrines?.length||0)
        )%
        choices.length
      ];

    const old=
      getStats().maxHP;

    P.runShrines.push(
      b.id
    );

    const now=
      getStats().maxHP;

    if(b.id==='vitality')
      P.hp=
        Math.min(
          now,
          P.hp+
          Math.round(
            (now-old)*.8
          )
        );

    SFX.core();

    burst(
      p.x,
      p.y-55,
      WORLDS[G.worldId].accent,
      26
    );

    toast(
      b.name,
      b.desc,
      4
    );

    syncHUD();
  }

  if(p.kind==='portal')
    beginHub();
}


function updateInteraction(){
  const n=
    nearestInteraction();

  if(
    n&&
    n.d<115
  ){
    $('interactPrompt')
      .classList
      .remove('hidden');

    $('interactText')
      .textContent=
        n.label;

    if(
      justPressed.has('e')
    )
      n.fn();

  }else{
    $('interactPrompt')
      .classList
      .add('hidden');
  }
}


/* =========================================================
   UI / OVERLAYS
   ========================================================= */

function quest(title,text){
  $('questTitle').textContent=title;
  $('questText').textContent=text;
}


function toast(
  title,
  text,
  time=2.5
){
  $('toastTitle').textContent=title;
  $('toastText').textContent=text;

  $('toast')
    .classList
    .remove('hidden');

  G.messageTime=time;
}


function syncHUD(){
  const s=getStats();

  if($('lifeText'))
    $('lifeText').textContent=
      G.scene==='world'
        ?STAGE_RUN.life
        :[
          'tower',
          'bossrush'
        ].includes(G.scene)
          ?'1'
          :'SAFE';

  P.hp=
    clamp(
      P.hp,
      0,
      s.maxHP
    );

  $('levelText').textContent=P.level;

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

  $('atkText').textContent=s.atk;
  $('defText').textContent=s.def;
  $('spdText').textContent=s.speed;

  if($('critText'))
    $('critText').textContent=
      Math.round(
        s.critChance*100
      )+'%';

  $('armorText').textContent=
    getArmor()
      .name
      .toUpperCase();

  $('creditText').textContent=
    P.credits.toLocaleString();

  $('coreText').textContent=
    G.cores;

  $('weaponText').textContent=
    (
      P.weapon||
      'Fists'
    ).toUpperCase();

  if($('attackLabel'))
    $('attackLabel').textContent=
      (
        P.weapon||
        'UNARMED'
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
        :G.scene==='tower'
          ?'RIFT TOWER · FLOOR '+
           (G.towerFloor||1)
          :G.scene==='bossrush'
            ?'BOSS RUSH · '+
             (
               (G.bossRushIndex||0)+1
             )
            :G.worldId
              ?(
                (
                  (
                    P.masterRun
                      ?'MASTER · '
                      :P.corruptedRun
                        ?'CORRUPTED · '
                        :''
                  )+
                  (
                    WORLDS[G.worldId]
                      ?.name||
                    'DEEP SPACE'
                  )+
                  ' • '+
                  segmentCode(
                    G.worldId
                  )
                ).toUpperCase()
              )
              :'DEEP SPACE';

  const cd=s.cooldown,
        ready=
          1-
          clamp(
            P.attackCooldown/cd,
            0,
            1
          );

  $('cooldownFill')
    .style.width=
      (ready*100)+'%';

  $('cooldownText')
    .textContent=
      P.attackCooldown<=0
        ?'READY'
        :P.attackCooldown
          .toFixed(1)+
         's';

  const sm=
    $('styleMeter');

  if(sm){
    sm.classList.toggle(
      'hidden',
      ![
        'world',
        'tower',
        'bossrush'
      ].includes(G.scene)
    );

    $('styleRank')
      .textContent=
        styleRank();

    $('styleFill')
      .style.width=
        (
          clamp(
            (G.combatStyle||0)/300,
            0,
            1
          )*
          100
        )+'%';

    $('styleText')
      .textContent=
        (G.combatChain||0)>1
          ?(
            G.combatChain+
            ' HIT FLOW · KEEP MOVING'
          )
          :'LAND HITS TO BUILD STYLE';

    sm.dataset.rank=
      styleRank();
  }

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
  c.translate(17,17);

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
  c.strokeStyle='#bdf7ff';
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

  c.fillStyle='#fff';

  c.fillRect(
    -4,
    -4,
    8,
    8
  );

  c.restore();
}


function openOverlay(
  id,
  render
){
  if(G.scene==='arena')
    return;

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

  if(render)
    render();

  SFX.click();
}


function closeOverlay(id){
  $(id)
    .classList
    .add('hidden');

  G.paused=false;

  SFX.click();
}


function toggleOverlay(
  id,
  render
){
  if(
    G.scene==='menu'||
    G.scene==='flight'||
    G.scene==='crash'||
    G.scene==='travel'||
    G.scene==='arena'
  )return;

  if(
    $(id)
      .classList
      .contains('hidden')
  )
    openOverlay(
      id,
      render
    );
  else
    closeOverlay(id);
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
  )return;

  if(
    !$('pauseOverlay')
      .classList
      .contains('hidden')
  )
    closeOverlay(
      'pauseOverlay'
    );
  else
    openOverlay(
      'pauseOverlay'
    );
}


document
  .querySelectorAll('[data-close]')
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

if($('tutorialReplayBtn'))
  $('tutorialReplayBtn').onclick=
    ()=>{
      closeOverlay(
        'pauseOverlay'
      );

      startTutorial(true);
    };

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


function renderFusionForge(){
  const forge=
    $('fusionForge'),

    core=
      $('fusionCoreSelect'),

    cat=
      $('fusionCatalystSelect'),

    btn=
      $('fuseWeaponBtn');

  if(
    !forge||
    !core||
    !cat||
    !btn
  )return;

  P.fusedWeapons=
    P.fusedWeapons||{};

  const owned=[
    ...Object.keys(WEAPONS),
    ...Object.keys(
      CORRUPTED_WEAPONS
    )
  ].filter(
    weaponOwned
  );

  if(
    !fusionCoreName||
    !owned.includes(
      fusionCoreName
    )
  )
    fusionCoreName=
      owned[0]||'';

  if(
    !fusionCatalystName||
    !owned.includes(
      fusionCatalystName
    )||
    fusionCatalystName===
    fusionCoreName
  )
    fusionCatalystName=
      owned.find(
        n=>
          n!==fusionCoreName
      )||'';

  const fill=(
    sel,
    value
  )=>{
    sel.innerHTML='';

    if(!owned.length){
      const o=
        document.createElement(
          'option'
        );

      o.textContent=
        'NO WEAPONS OWNED';

      o.value='';

      sel.appendChild(o);

      return;
    }

    for(const name of owned){
      const o=
        document.createElement(
          'option'
        );

      o.value=name;
      o.textContent=name;
      o.selected=
        name===value;

      sel.appendChild(o);
    }
  };

  fill(
    core,
    fusionCoreName
  );

  fill(
    cat,
    fusionCatalystName
  );

  core.onchange=()=>{
    fusionCoreName=
      core.value;

    if(
      fusionCatalystName===
      fusionCoreName
    )
      fusionCatalystName=
        owned.find(
          n=>
            n!==fusionCoreName
        )||'';

    renderFusionForge();
  };

  cat.onchange=()=>{
    fusionCatalystName=
      cat.value;

    if(
      fusionCatalystName===
      fusionCoreName
    )
      fusionCoreName=
        owned.find(
          n=>
            n!==fusionCatalystName
        )||'';

    renderFusionForge();
  };

  const a=
    allWeapons()[
      fusionCoreName
    ],

    b=
      allWeapons()[
        fusionCatalystName
      ],

    preview=
      a&&
      b&&
      fusionCoreName!==
      fusionCatalystName
        ?makeFusionWeapon(
          fusionCoreName,
          fusionCatalystName
        )
        :null;

  $('fusionCoreTrait')
    .textContent=
      a
        ?(
          a.style.toUpperCase()+
          ' · '+
          String(
            a.special||
            'RIFT'
          ).toUpperCase()
        )
        :'Choose an owned weapon';

  $('fusionCatalystTrait')
    .textContent=
      b
        ?(
          b.style.toUpperCase()+
          ' · '+
          String(
            b.special||
            'RIFT'
          ).toUpperCase()
        )
        :'Choose a different weapon';

  const cv=
    $('fusionPreview'),

    cx=
      cv.getContext('2d');

  cx.clearRect(
    0,
    0,
    cv.width,
    cv.height
  );

  if(preview){
    const existing=
      existingFusion(
        fusionCoreName,
        fusionCatalystName
      ),

      name=
        existing
          ?existing[0]
          :fusionName(
            fusionCoreName,
            fusionCatalystName
          );

    $('fusionPreviewName')
      .textContent=
        name.toUpperCase();

    $('fusionPreviewStats')
      .textContent=
        'ATK +'+
        preview.atk+
        ' · '+
        preview.cooldown.toFixed(2)+
        's · RNG '+
        preview.range+
        ' · '+
        String(
          preview.special
        ).toUpperCase()+
        (
          preview.special2
            ?' + '+
             String(
               preview.special2
             ).toUpperCase()
            :' AMPLIFIED'
        );

    drawWeaponIcon(
      cx,
      60,
      66,
      preview,
      .68
    );

    $('fusionCostText')
      .textContent=
        existing
          ?'ALREADY FORGED · EQUIP IT AGAIN'
          :'COST: '+
           FUSION_COST.credits+
           ' RIFT CREDITS + '+
           FUSION_COST.bossCores+
           ' BOSS CORE';

    btn.textContent=
      existing
        ?'EQUIP FUSION'
        :'FUSE WEAPONS';

  }else{
    $('fusionPreviewName')
      .textContent=
        'SELECT TWO WEAPONS';

    $('fusionPreviewStats')
      .textContent=
        'Dual traits + Fusion Burst';

    $('fusionCostText')
      .textContent=
        'COST: '+
        FUSION_COST.credits+
        ' RIFT CREDITS + '+
        FUSION_COST.bossCores+
        ' BOSS CORE';

    btn.textContent=
      'FUSE WEAPONS';
  }

  const hubReady=
    G.scene==='hub'&&
    G.hubFound;

  forge.classList.toggle(
    'fusionLocked',
    !hubReady
  );

  btn.disabled=
    !preview||
    !hubReady||
    (
      !existingFusion(
        fusionCoreName,
        fusionCatalystName
      )&&
      (
        P.credits<
        FUSION_COST.credits||
        (
          P.materials[
            'Boss Core'
          ]||0
        )<
        FUSION_COST.bossCores
      )
    );

  btn.onclick=
    fuseSelectedWeapons;
}


function fuseSelectedWeapons(){
  if(
    G.scene!=='hub'||
    !G.hubFound
  ){
    toast(
      'FUSION FORGE',
      'Weapon fusion is only stable inside The Hub.'
    );

    return;
  }

  const a=
    fusionCoreName,

    b=
      fusionCatalystName;

  if(
    !a||
    !b||
    a===b
  ){
    toast(
      'FUSION FORGE',
      'Choose two different owned weapons.'
    );

    return;
  }

  if(
    !weaponOwned(a)||
    !weaponOwned(b)||
    !WEAPONS[a]||
    !WEAPONS[b]
  ){
    toast(
      'FUSION FORGE',
      'Both source weapons must be unlocked first.'
    );

    return;
  }

  const existing=
    existingFusion(
      a,
      b
    );

  if(existing){
    P.weapon=
      existing[0];

    SFX.click();

    renderInventory();
    syncHUD();

    toast(
      'FUSION EQUIPPED',
      existing[0]+
      ' is ready.'
    );

    return;
  }

  if(
    (
      P.materials[
        'Boss Core'
      ]||0
    )<
    FUSION_COST.bossCores
  ){
    toast(
      'FUSION FORGE',
      'You need a Boss Core. Defeat another world boss.'
    );

    return;
  }

  if(
    P.credits<
    FUSION_COST.credits
  ){
    toast(
      'FUSION FORGE',
      'You need '+
      FUSION_COST.credits+
      ' Rift Credits.'
    );

    return;
  }

  const fused=
    makeFusionWeapon(
      a,
      b
    );

  if(!fused)
    return;

  P.credits-=
    FUSION_COST.credits;

  P.materials[
    'Boss Core'
  ]-=
    FUSION_COST.bossCores;

  P.fusedWeapons=
    P.fusedWeapons||{};

  const name=
    fusionName(
      a,
      b
    );

  P.fusedWeapons[name]=
    fused;

  P.weaponsOwned[name]=true;
  P.weapon=name;

  SFX.core();

  burst(
    P.x,
    P.y-55,
    fused.color,
    18
  );

  burst(
    P.x,
    P.y-55,
    fused.accent,
    18
  );

  toast(
    'WEAPON FUSION COMPLETE',
    name+
    ' forged with two traits and Fusion Burst.',
    4.5
  );

  renderInventory();
  syncHUD();
}


function renderInventory(){
  P.fusedWeapons=
    P.fusedWeapons||{};

  renderFusionForge();

  const wg=
    $('weaponGrid'),

    filters=
      $('weaponFilters'),

    countBadge=
      $('weaponCountBadge');

  if(countBadge)
    countBadge.textContent=
      (
        Object.keys(
          WEAPONS
        ).length+
        Object.keys(
          CORRUPTED_WEAPONS
        ).length
      )+
      (
        Object.keys(
          P.fusedWeapons
        ).length
          ?(
            ' + '+
            Object.keys(
              P.fusedWeapons
            ).length+
            ' FUSION'
          )
          :''
      );

  if(filters){
    const families=[
      'ALL',
      'FUSION',
      'BLADES',
      'MARTIAL',
      'HEAVY',
      'POLEARMS',
      'RANGED',
      'ARCANE',
      'EXOTIC'
    ];

    filters.innerHTML='';

    for(const family of families){
      const b=
        document.createElement(
          'button'
        );

      b.className=
        'weaponFilterBtn '+
        (
          weaponFilter===family
            ?'active'
            :''
        );

      b.textContent=
        family;

      b.onclick=()=>{
        weaponFilter=family;
        renderInventory();
      };

      filters.appendChild(b);
    }
  }

  if(wg){
    wg.innerHTML='';

    for(
      const[name,w]
      of Object.entries(
        allWeapons()
      )
    ){
      const family=
        weaponFamily(w);

      if(
        weaponFilter!=='ALL'&&
        family!==weaponFilter
      )
        continue;

      const owned=
        weaponOwned(name);

      const card=
        document.createElement(
          'div'
        );

      card.className=
        'itemCard weaponCard '+
        (
          w.fused
            ?'fusionWeapon '
            :''
        )+
        (
          P.weapon===name
            ?'selected'
            :''
        )+
        (
          !owned
            ?' lockedWeapon'
            :''
        );

      card.dataset.family=
        family;

      const cv=
        document.createElement(
          'canvas'
        );

      cv.width=96;
      cv.height=64;
      cv.className='weaponArt';

      card.appendChild(cv);

      if(w.fused){
        card.insertAdjacentHTML(
          'beforeend',
          `<h4>${name}</h4><p class="weaponType">FUSION · ${w.style.toUpperCase()} + ${String(w.secondaryStyle||'rift').toUpperCase()}</p><p>ATK +${w.atk} · ${w.cooldown.toFixed(2)}s · RNG ${w.range}</p><p>${w.sourceA} + ${w.sourceB}<br>Traits: ${String(w.special).toUpperCase()}${w.special2?' + '+String(w.special2).toUpperCase():' · AMPLIFIED'} · FINISHER: FUSION BURST</p>`
        );

      }else{
        const source=
          w.corrupted
            ?'Clear Corrupted '+
             WORLDS[w.world].name
            :(
              w.world==='earth'
                ?(
                  name==='Nova Sword'
                    ?'Earth story'
                    :'Defeat '+
                     WORLDS.earth.boss
                )
                :'Defeat '+
                 WORLDS[w.world].boss
            );

        card.insertAdjacentHTML(
          'beforeend',
          `<h4>${name}</h4><p class="weaponType">${WORLDS[w.world].name} · ${w.style.toUpperCase()}</p><p>ATK +${w.atk} · ${w.cooldown.toFixed(2)}s · RNG ${w.range}</p><p>${w.desc}</p>`
        );

        card.dataset.source=
          source;
      }

      const btn=
        document.createElement(
          'button'
        );

      const source=
        w.fused
          ?'Rift Fusion'
          :(
            card.dataset.source||
            'Locked'
          );

      btn.textContent=
        owned
          ?(
            P.weapon===name
              ?'EQUIPPED'
              :'EQUIP'
          )
          :'LOCKED · '+
           source.toUpperCase();

      btn.disabled=
        !owned||
        P.weapon===name;

      btn.onclick=()=>{
        if(!owned)
          return;

        P.weapon=name;

        SFX.click();

        renderInventory();
        syncHUD();
      };

      card.appendChild(btn);
      wg.appendChild(card);

      drawWeaponIcon(
        cv.getContext('2d'),
        48,
        51,
        w,
        .68
      );
    }
  }

  const grid=
    $('armorGrid');

  grid.innerHTML='';

  for(
    const[id,a]
    of Object.entries(
      allArmors()
    )
  ){
    const unlocked=
      a.fused||
      a.unlocked||
      G.completed.has(id)||
      id==='none'||
      (
        id==='scout'&&
        G.hubFound
      )||
      (
        id==='rift'&&
        G.completed.has('music')
      )||
      (
        id==='titan'&&
        G.completed.has('war')
      )||
      (
        id==='void'&&
        G.completed.has('void')
      )||
      (
        id==='matrix'&&
        G.completed.has('matrix')
      )||
      (
        id==='corrupt'&&
        G.corruptedRealmCleared
      )||
      (
        id==='divine'&&
        G.landOfGodsCleared
      );

    const owned=
      armorOwned(id);

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
      `<div class="armorIcon"></div><h4>${a.name}</h4><p>${a.fused?'FUSION · TWIN CORE · ':''}HP +${a.hp} · ATK +${a.atk} · DEF +${a.def} · SPD ${a.speed>=0?'+':''}${a.speed}${a.fused?' · CRIT +'+Math.round((a.crit||0)*100)+'%':''}</p>`;

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

      btn.onclick=()=>{
        const old=
          getStats().maxHP;

        P.armor=id;

        preserveHealthForStatChange(
          old,
          getStats().maxHP
        );

        renderInventory();
        syncHUD();
      };

    }else{
      btn.textContent=
        unlocked
          ?'BUY · '+
           a.price.toLocaleString()
          :'LOCKED';

      btn.disabled=
        !unlocked;

      btn.onclick=()=>{
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

  for(const name of MATERIALS){
    const card=
      document.createElement(
        'div'
      );

    card.className=
      'itemCard';

    card.innerHTML=
      `<div class="materialIcon"></div><h4>${name}</h4><p>Owned: <b>${P.materials[name]||0}</b></p>`;

    mg.appendChild(card);
  }
}


function renderPets(){
  const grid=
    $('petGrid');

  grid.innerHTML='';

  const names=
    Object.keys(
      PET_STATE.owned
    );

  if(!names.length)
    grid.innerHTML=
      '<p class="panelNote">You have not befriended a pet yet. Explore the worlds to find them.</p>';

  for(const name of names){
    const o=
      PET_STATE.owned[name];

    if(o?.fused)
      ensureFusedPetDefinition(o);

    if(
      isCorruptedPet(name)&&
      !PET_PROFILES[name]
    ){
      const base=
        name.slice(10),

        world=
          Object.keys(
            PET_ROSTERS
          ).find(
            w=>
              (
                PET_ROSTERS[w]||
                []
              ).includes(base)
          )||
          'void';

      ensureCorruptedPetDefinition(
        name,
        base,
        world
      );
    }

    const b=
      PET_BONUS[name]||{},

      pf=
        petProfile(name),

      card=
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

    cv.width=84;
    cv.height=70;
    cv.className='petArt';

    card.appendChild(cv);

    card.insertAdjacentHTML(
      'beforeend',
      `<h4>${name}</h4><p>${PET_TYPES[name]||'Rift Companion'} · LV ${o.level}${o.fused?' · FUSION':''}</p><p>HP +${b.hp||0} · ATK +${b.atk||0} · DEF +${b.def||0} · SPD ${b.speed||0}</p><p class="petGearMini">GEAR ${Object.values(ensurePetGearState(o)).filter(Boolean).length}/4 · SCORE ${petGearScore(o)}</p><p class="petGimmick"><b>${pf?.attack.label||'Companion Strike'}</b> · ${pf?.attack.desc||'attacks nearby enemies'}.</p><p class="petPassive"><b>${pf?.passive.label||'Bond'}</b> · ${pf?.passive.desc||'supports the Riftwalker'}.</p>`
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

    btn.onclick=()=>{
      const old=
        getStats().maxHP;

      PET_STATE.active=name;

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
      42,
      54,
      name,
      .62,
      0
    );
  }

  renderJournal();
  renderTraining();
  renderPetGear();
}


function renderPetGear(){
  const panel=
    $('petGearPanel');

  if(!panel)
    return;

  ensureHubProgress();

  panel.innerHTML='';

  const ap=
    activePet();

  if(!ap){
    panel.innerHTML=
      '<p class="panelNote">Equip a pet first. Each companion can wear four gear pieces: Head, Body, Charm and Paws.</p>';

    return;
  }

  ensurePetGearState(ap);

  const stats=
    petGearStats(ap),

    top=
      document.createElement(
        'div'
      );

  top.className=
    'petGearHero';

  const cv=
    document.createElement(
      'canvas'
    );

  cv.width=220;
  cv.height=180;

  top.appendChild(cv);

  const info=
    document.createElement(
      'div'
    );

  info.className=
    'petGearHeroInfo';

  info.innerHTML=
    `<small>ACTIVE COMPANION</small><h3>${ap.name}</h3><p>${petGearSetText(ap)} · Gear Score ${petGearScore(ap)}</p><p>Gear Bonus: HP +${stats.hp} · ATK +${stats.atk} · DEF +${stats.def} · SPD +${stats.speed} · PET POWER +${Math.round((stats.petPower-1)*100)}% · HASTE +${Math.round((stats.haste-1)*100)}%</p>`;

  top.appendChild(info);
  panel.appendChild(top);

  drawPetSprite(
    cv.getContext('2d'),
    110,
    128,
    ap.name,
    1.45,
    G.time
  );

  const slots=
    document.createElement(
      'div'
    );

  slots.className=
    'petGearSlots';

  for(const slot of PET_GEAR_SLOTS){
    const id=
      ap.gear[slot],

      g=
        getPetGear(id),

      box=
        document.createElement(
          'div'
        );

    box.className=
      'petGearSlot '+
      (
        g
          ?'filled'
          :''
      );

    box.innerHTML=
      `<small>${slot.toUpperCase()}</small><b>${g?g.name:'EMPTY'}</b><span>${g?g.rarity.toUpperCase():'No gear equipped'}</span>`;

    if(g){
      const btn=
        document.createElement(
          'button'
        );

      btn.textContent=
        'UNEQUIP';

      btn.onclick=
        ()=>
          unequipPetGear(
            slot
          );

      box.appendChild(btn);
    }

    slots.appendChild(box);
  }

  panel.appendChild(slots);

  const note=
    document.createElement(
      'p'
    );

  note.className=
    'panelNote';

  note.textContent=
    'Forge gear blueprints once, then any pet can equip them. Bosses, elites and Legendary Hunts can also discover gear blueprints.';

  panel.appendChild(note);

  const grid=
    document.createElement(
      'div'
    );

  grid.className=
    'petGearGrid';

  for(
    const[id,g]
    of Object.entries(
      allPetGear()
    )
  ){
    const owned=
      petGearIsOwned(id),

      progress=
        petGearUnlockedByProgress(g),

      equipped=
        ap.gear[g.slot]===id,

      card=
        document.createElement(
          'div'
        );

    card.className=
      'petGearCard '+
      g.rarity+
      (
        equipped
          ?' equipped'
          :''
      );

    card.style.setProperty(
      '--gearColor',
      PET_GEAR_RARITY[
        g.rarity
      ]||
      '#fff'
    );

    const stat=[];

    if(g.hp)
      stat.push(
        'HP +'+g.hp
      );

    if(g.atk)
      stat.push(
        'ATK +'+g.atk
      );

    if(g.def)
      stat.push(
        'DEF +'+g.def
      );

    if(g.speed)
      stat.push(
        'SPD +'+g.speed
      );

    if(g.crit)
      stat.push(
        'CRIT +'+
        Math.round(
          g.crit*100
        )+
        '%'
      );

    if(g.petPower)
      stat.push(
        'PET +'+
        Math.round(
          g.petPower*100
        )+
        '%'
      );

    if(g.haste)
      stat.push(
        'HASTE +'+
        Math.round(
          g.haste*100
        )+
        '%'
      );

    if(g.range)
      stat.push(
        'RANGE +'+g.range
      );

    card.innerHTML=
      `<div class="petGearIcon">${g.slot==='head'?'H':g.slot==='body'?'B':g.slot==='charm'?'C':'P'}</div><small>${g.rarity.toUpperCase()} · ${g.slot.toUpperCase()}</small><h4>${g.name}</h4><p>${g.set} Set${g.fused?' · FUSED':''}</p><p>${stat.join(' · ')}</p>`;

    const btn=
      document.createElement(
        'button'
      );

    if(equipped){
      btn.textContent=
        'EQUIPPED';

      btn.disabled=true;

    }else if(owned){
      btn.textContent=
        'EQUIP';

      btn.onclick=
        ()=>
          equipPetGear(id);

    }else if(progress){
      btn.textContent=
        `FORGE · ${g.cost.toLocaleString()} + ${g.qty} ${g.mat}`;

      btn.onclick=
        ()=>
          forgePetGear(id);

    }else{
      btn.textContent=
        'LOCKED';

      btn.disabled=true;
    }

    card.appendChild(btn);
    grid.appendChild(card);
  }

  panel.appendChild(grid);
}


function renderJournal(){
  let ownedNames=
        Object.keys(
          PET_STATE.owned
        ),

      found=
        ownedNames.filter(
          n=>
            !isCorruptedPet(n)
        ).length,

      corruptFound=
        ownedNames.filter(
          isCorruptedPet
        ).length,

      total=
        Object.values(
          PET_ROSTERS
        ).reduce(
          (n,a)=>
            n+a.length,
          0
        ),

      corruptTotal=
        WORLD_ORDER.reduce(
          (n,id)=>
            n+
            (
              PET_ROSTERS[id]
                ?.length||
              0
            ),
          0
        );

  $('journalSummary')
    .textContent=
      `BASE PET DISCOVERY: ${found} / ${total} · CORRUPTED PETS: ${corruptFound} / ${G.corruptionAwakened?corruptTotal:'???'} · HIDDEN SECRETS: ${G.easterEggs.size} / ${EASTER_TOTAL}`;

  $('journalGrid')
    .innerHTML='';

  for(
    const id of[
      ...WORLD_ORDER,
      ...(
        G.completed.size>=
        WORLD_ORDER.length
          ?['corruptrealm']
          :[]
      ),
      ...(
        P.corruptionMaster
          ?['godrealm']
          :[]
      )
    ]
  ){
    const box=
      document.createElement(
        'div'
      );

    box.className=
      'journalWorld';

    const display=
      id==='matrix'&&
      !G.completed.has('matrix')
        ?'( ........ ...... )'
        :WORLDS[id].name;

    box.innerHTML=
      `<h3>${display}</h3><div class="journalNames"></div>`;

    const row=
      box.querySelector(
        '.journalNames'
      );

    for(
      const name of
      PET_ROSTERS[id]
    ){
      const s=
        document.createElement(
          'span'
        ),

        known=
          !!PET_STATE.owned[name];

      s.className=
        known
          ?'found'
          :'';

      s.textContent=
        id==='matrix'&&
        !G.completed.has(
          'matrix'
        )&&
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
    activePet(),

    c=
      $('trainingPet')
        .getContext('2d');

  c.clearRect(
    0,
    0,
    220,
    180
  );

  if(!ap){
    $('trainingName')
      .textContent=
        'No active pet';

    $('trainingStats')
      .textContent=
        'Find and equip a pet first.';

    $('trainPetBtn')
      .disabled=true;

    return;
  }

  const pf=
    petProfile(ap.name);

  drawPetSprite(
    c,
    110,
    125,
    ap.name,
    1.45,
    G.time
  );

  $('trainingName')
    .textContent=
      ap.name+
      ' · LV '+
      ap.level;

  $('trainingStats')
    .textContent=
      (
        pf
          ?pf.attack.label+
           ' — '+
           pf.attack.desc+
           '. '+
           pf.passive.label+
           ' — '+
           pf.passive.desc+
           '. '
          :''
      )+
      'Training strengthens this pet’s stats and companion damage.';

  $('trainPetBtn')
    .disabled=false;
}


$('trainPetBtn').onclick=()=>{
  const ap=
    activePet();

  if(
    !ap||
    !spendCredits(300)
  )return;

  const old=
    getStats().maxHP;

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
      b.onclick=()=>{
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
          training:'petTraining',
          gear:'petGear'
        }[b.dataset.petTab])
          .classList
          .add('active');
      }
  );
function renderSkillTree(body,refresh){
  const total=skillPointsEarned(),spent=skillPointsSpent(),available=skillPointsAvailable();
  const wrap=document.createElement('div');wrap.className='skillTreeShell';
  wrap.innerHTML=`<div class="skillTreeTop"><div><small>RIFT ABILITY NETWORK</small><b>${available}</b><span>SKILL POINT${available===1?'':'S'} AVAILABLE</span></div><p>Earn points from first-time world clears, Corrupted clears, Master clears, Tower milestones and World Mastery. Click an available node to invest 1 point.</p><div class="skillTreeCount">${spent} SPENT <i></i> ${total} EARNED</div></div><div class="skillTreeViewport"><div class="skillTreeCanvas"><svg class="skillTreeLines" viewBox="0 0 1120 700" preserveAspectRatio="none"></svg><div class="skillTreeBranchLabels"></div><div class="skillTreeNodes"></div></div></div><div class="skillTreeLegend"><span><i class="nodeDot available"></i>AVAILABLE</span><span><i class="nodeDot owned"></i>INVESTED</span><span><i class="nodeDot locked"></i>LOCKED</span><span>CAPSTONES require both branch paths.</span></div>`;
  body.appendChild(wrap);

  const canvas=wrap.querySelector('.skillTreeCanvas'),
        svg=wrap.querySelector('.skillTreeLines'),
        nodes=wrap.querySelector('.skillTreeNodes'),
        labels=wrap.querySelector('.skillTreeBranchLabels');

  const centers={};

  for(const [id,d] of Object.entries(RIFT_TALENTS))
    centers[id]={x:d.x,y:d.y};

  for(const [id,d] of Object.entries(RIFT_TALENTS)){
    if(id==='root')continue;

    for(const [rid,rank] of d.req||[]){
      const a=centers[rid],
            b=centers[id],
            ok=talentLevel(rid)>=rank;

      const line=document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );

      line.setAttribute('x1',a.x);
      line.setAttribute('y1',a.y);
      line.setAttribute('x2',b.x);
      line.setAttribute('y2',b.y);

      line.setAttribute(
        'class',
        'skillLink '+(ok?'active':'locked')
      );

      line.style.setProperty(
        '--branch',
        SKILL_BRANCHES[d.branch]?.color||'#9eefff'
      );

      svg.appendChild(line);
    }
  }

  const labelPos={
    vanguard:[85,78],
    hunter:[85,610],
    guardian:[900,78],
    seer:[925,610]
  };

  for(const [key,b] of Object.entries(SKILL_BRANCHES)){
    const el=document.createElement('div');

    el.className='skillBranchLabel';
    el.style.left=labelPos[key][0]+'px';
    el.style.top=labelPos[key][1]+'px';
    el.style.setProperty('--branch',b.color);

    el.innerHTML=
      `<b>${b.name}</b><small>${b.tag}</small>`;

    labels.appendChild(el);
  }

  for(const [id,d] of Object.entries(RIFT_TALENTS)){
    const lv=talentLevel(id),
          root=id==='root',
          maxed=lv>=d.max,
          req=talentReqMet(id),
          can=!root&&!maxed&&req&&available>0;

    const n=document.createElement('button');

    n.type='button';

    n.className=
      'skillNode '+
      (
        root
          ?'root owned'
          :maxed
            ?'owned'
            :lv>0
              ?'owned partial'
              :can
                ?'available'
                :'locked'
      )+
      (d.capstone?' capstone':'');

    n.style.left=d.x+'px';
    n.style.top=d.y+'px';

    n.style.setProperty(
      '--branch',
      root
        ?'#fff0a0'
        :SKILL_BRANCHES[d.branch]?.color||'#9eefff'
    );

    n.style.setProperty(
      '--fill',
      (lv/d.max*360)+'deg'
    );

    n.innerHTML=
      `<span class="skillNodeIcon">${d.icon}</span><span class="skillNodeRank">${root?'CORE':lv+'/'+d.max}</span><span class="skillNodeTip"><b>${d.name}</b><em>${d.desc}</em><small>${root?'THE RIFTWALKER CORE':maxed?'MASTERED':req?'Requires 1 Skill Point':'Requires '+talentReqText(id)}</small></span>`;

    n.disabled=
      root||
      maxed||
      !req||
      available<=0;

    n.onclick=()=>{
      if(
        !talentReqMet(id)||
        skillPointsAvailable()<1||
        talentLevel(id)>=d.max
      )return;

      const old=getStats().maxHP;

      P.talents[id]=(P.talents[id]||0)+1;

      preserveHealthForStatChange(
        old,
        getStats().maxHP
      );

      SFX.core();

      toast(
        'SKILL UNLOCKED',
        d.name+
        ' · Rank '+
        P.talents[id]+
        '/'+
        d.max
      );

      refresh();
      syncHUD();
    };

    nodes.appendChild(n);
  }

  const coreRing=document.createElement('div');

  coreRing.className='skillCoreOrbit';
  coreRing.style.left='560px';
  coreRing.style.top='350px';

  canvas.appendChild(coreRing);
}


function openHubFacility(type){
  if(G.scene!=='hub')return;

  openOverlay(
    'hubFacilityOverlay',
    ()=>renderHubFacility(type)
  );
}


function hubFacilityCard(
  title,
  desc,
  meta,
  button,
  action,
  disabled=false
){
  const card=document.createElement('div');

  card.className='facilityCard';

  card.innerHTML=
    `<div class="facilityIcon"></div><div class="facilityCopy"><h3>${title}</h3><p>${desc}</p><small>${meta||''}</small></div>`;

  if(button){
    const b=document.createElement('button');

    b.textContent=button;
    b.disabled=disabled;
    b.onclick=action;

    card.appendChild(b);
  }

  return card;
}


function renderHubFacility(type){
  ensureHubProgress();

  const title=$('hubFacilityTitle'),
        sub=$('hubFacilitySub'),
        body=$('hubFacilityBody');

  body.innerHTML='';

  $('hubFacilityOverlay')
    .classList
    .toggle(
      'skillTreeOpen',
      type==='skillnexus'
    );

  body.classList.toggle(
    'skillTreeBody',
    type==='skillnexus'
  );

  const refresh=()=>
    renderHubFacility(type);


  if(type==='dojo'){
    title.textContent='Combat Dojo';
    sub.textContent='TRAINING DECK // WEAPON MASTERY';

    body.appendChild(
      hubFacilityCard(
        'Rift Recovery',
        'Restore HP and reset your combat cooldowns before your next expedition.',
        'Free while inside The Hub',
        'RECOVER',
        ()=>{
          P.hp=getStats().maxHP;
          P.attackCooldown=0;
          P.dashCooldown=0;

          SFX.core();

          toast(
            'DOJO',
            'Riftwalker fully recovered.'
          );

          syncHUD();
        }
      )
    );

    const cost=
      450+
      Math.max(
        0,
        P.weaponLevel-1
      )*
      250;

    body.appendChild(
      hubFacilityCard(
        'Weapon Mastery',
        'Improve the damage scaling of every equipped weapon.',
        'Current mastery: LV '+
        P.weaponLevel+
        ' / 10 · Cost: '+
        cost+
        ' credits',

        P.weaponLevel>=10
          ?'MAXED'
          :'TRAIN MASTERY',

        ()=>{
          if(
            P.weaponLevel>=10||
            !spendCredits(cost)
          )return;

          P.weaponLevel++;

          SFX.hit();

          toast(
            'WEAPON MASTERY',
            'Weapon mastery increased to level '+
            P.weaponLevel+
            '.'
          );

          refresh();
          syncHUD();
        },

        P.weaponLevel>=10
      )
    );

    body.appendChild(
      hubFacilityCard(
        'Sparring Simulator',
        'Enter a practice fight against the training bot. Exit at any time to return directly to the Combat Dojo.',
        'Rift Arena training simulation',
        'START SPARRING',
        ()=>{
          closeOverlay(
            'hubFacilityOverlay'
          );

          practiceArena(true);
        }
      )
    );


  }else if(type==='research'){
    title.textContent='Rift Research Lab';
    sub.textContent='PERMANENT RIFTWALKER UPGRADES';

    for(
      const[id,d]
      of Object.entries(
        HUB_UPGRADES
      )
    ){
      const lv=
        hubUpgradeLevel(id),

        maxed=
          lv>=d.max,

        cost=
          maxed
            ?0
            :hubUpgradeCost(id);

      body.appendChild(
        hubFacilityCard(
          d.name,
          d.desc,

          'Research level '+
          lv+
          ' / '+
          d.max+
          (
            maxed
              ?' · Complete'
              :' · Cost: '+
               cost+
               ' credits'
          ),

          maxed
            ?'MAXED'
            :'RESEARCH',

          ()=>{
            if(maxed)return;

            const old=
              getStats().maxHP;

            if(!spendCredits(cost))
              return;

            P.hubUpgrades[id]++;

            preserveHealthForStatChange(
              old,
              getStats().maxHP
            );

            SFX.core();

            toast(
              'RESEARCH COMPLETE',
              d.name+
              ' is now level '+
              P.hubUpgrades[id]+
              '.'
            );

            refresh();
            syncHUD();
          },

          maxed
        )
      );
    }


  }else if(type==='missions'){
    title.textContent='Mission Board';
    sub.textContent='BOUNTIES // MILESTONES // EXTRA REWARDS';

    const missions=[
      {
        id:'hunter25',
        name:'Rift Hunter',
        desc:'Defeat 25 normal enemies across the Multiverse.',
        now:P.hubStats.kills,
        goal:25,
        reward:'600 credits',
        give:()=>addCredits(600)
      },

      {
        id:'shards20',
        name:'Shard Seeker',
        desc:'Recover 20 Rift Fragments.',
        now:P.hubStats.fragments,
        goal:20,
        reward:'450 credits + 3 Rift Dust',
        give:()=>{
          addCredits(450);
          addMaterial('Rift Dust',3);
        }
      },

      {
        id:'worlds3',
        name:'World Walker',
        desc:'Defeat the bosses of 3 different worlds.',
        now:G.completed.size,
        goal:3,
        reward:'900 credits + 1 Boss Core',
        give:()=>{
          addCredits(900);
          addMaterial('Boss Core',1);
        }
      },

      {
        id:'bosses10',
        name:'Core Breaker',
        desc:'Defeat 10 world bosses.',
        now:P.hubStats.bosses,
        goal:10,
        reward:'2,000 credits + 2 Boss Cores',
        give:()=>{
          addCredits(2000);
          addMaterial('Boss Core',2);
        }
      }
    ];

    for(const m of missions){
      const claimed=
        !!P.hubClaims[m.id],

        ready=
          m.now>=m.goal;

      body.appendChild(
        hubFacilityCard(
          m.name,
          m.desc,

          Math.min(
            m.now,
            m.goal
          )+
          ' / '+
          m.goal+
          ' · Reward: '+
          m.reward,

          claimed
            ?'CLAIMED'
            :ready
              ?'CLAIM REWARD'
              :'IN PROGRESS',

          ()=>{
            if(
              claimed||
              !ready
            )return;

            P.hubClaims[m.id]=true;

            m.give();

            SFX.core();

            toast(
              'MISSION COMPLETE',
              m.name+
              ' reward claimed.'
            );

            refresh();
          },

          claimed||
          !ready
        )
      );
    }


  }else if(type==='medbay'){
    title.textContent='Rift Med Bay';
    sub.textContent='RECOVERY // NANO SAFEGUARDS';

    body.appendChild(
      hubFacilityCard(
        'Full Recovery',
        'Restore your Riftwalker to full HP before travelling.',
        'Free Hub medical service',
        'RESTORE HP',
        ()=>{
          P.hp=getStats().maxHP;

          SFX.core();

          toast(
            'MED BAY',
            'HP fully restored.'
          );

          syncHUD();
        }
      )
    );

    const cost=650,
          full=P.nanoShields>=3;

    body.appendChild(
      hubFacilityCard(
        'Nano Shield',
        'Prevents one lethal hit during a world run and restores 28% HP.',
        'Stored: '+
        P.nanoShields+
        ' / 3 · '+
        cost+
        ' credits each',

        full
          ?'STORAGE FULL'
          :'BUY NANO SHIELD',

        ()=>{
          if(
            full||
            !spendCredits(cost)
          )return;

          P.nanoShields++;

          SFX.core();

          toast(
            'NANO SHIELD',
            'Emergency safeguard stored.'
          );

          refresh();
        },

        full
      )
    );

    body.appendChild(
      hubFacilityCard(
        'Combat Scan',
        'Review your current survivability before departure.',
        'HP '+
        P.hp+
        ' / '+
        getStats().maxHP+
        ' · DEF '+
        getStats().def+
        ' · Nano Shields '+
        P.nanoShields
      )
    );


  }else if(type==='foundry'){
    title.textContent='Material Foundry';
    sub.textContent='REFINE // RECYCLE // TRANSMUTE';

    const dust=
      P.materials['Rift Dust']||0,

      commons=
        MATERIALS.filter(
          x=>
            x!=='Boss Core'&&
            x!=='Rift Dust'
        ),

      commonTotal=
        commons.reduce(
          (n,k)=>
            n+
            (
              P.materials[k]||0
            ),
          0
        );

    body.appendChild(
      hubFacilityCard(
        'Refine Rift Dust',
        'Compress unstable Rift Dust into a random world material.',
        'Cost: 4 Rift Dust · Owned: '+
        dust,
        'REFINE',

        ()=>{
          if(
            (
              P.materials[
                'Rift Dust'
              ]||0
            )<4
          ){
            toast(
              'FOUNDRY',
              'You need 4 Rift Dust.'
            );

            return;
          }

          P.materials[
            'Rift Dust'
          ]-=4;

          const mat=
            commons[
              randi(
                0,
                commons.length-1
              )
            ];

          addMaterial(
            mat,
            1
          );

          SFX.core();

          toast(
            'MATERIAL REFINED',
            'Created 1 '+
            mat+
            '.'
          );

          refresh();
        },

        dust<4
      )
    );

    body.appendChild(
      hubFacilityCard(
        'Recycle Materials',
        'Break down 5 non-boss world materials into Rift Credits.',
        'Available common materials: '+
        commonTotal+
        ' · Reward: 300 credits',
        'RECYCLE 5',

        ()=>{
          let need=5;

          for(const k of commons){
            const take=
              Math.min(
                need,
                P.materials[k]||0
              );

            P.materials[k]-=take;
            need-=take;

            if(!need)break;
          }

          if(need){
            toast(
              'FOUNDRY',
              'You need 5 world materials.'
            );

            return;
          }

          addCredits(300);

          toast(
            'FOUNDRY',
            'Materials recycled into 300 Rift Credits.'
          );

          refresh();
        },

        commonTotal<5
      )
    );

    body.appendChild(
      hubFacilityCard(
        'Rift Cache',
        'Compress Rift Dust into a three-material expedition cache. Boss Cores still have to be earned from bosses.',
        'Cost: 10 Rift Dust · Creates 3 random world materials',
        'FORGE CACHE',

        ()=>{
          if(
            (
              P.materials[
                'Rift Dust'
              ]||0
            )<10
          ){
            toast(
              'FOUNDRY',
              'You need 10 Rift Dust.'
            );

            return;
          }

          P.materials[
            'Rift Dust'
          ]-=10;

          for(let i=0;i<3;i++)
            addMaterial(
              commons[
                randi(
                  0,
                  commons.length-1
                )
              ],
              1
            );

          SFX.core();

          toast(
            'CACHE FORGED',
            'Three world materials created.'
          );

          refresh();
        },

        dust<10
      )
    );


  }else if(type==='observatory'){
    title.textContent='Rift Observatory';
    sub.textContent='SCAN THE NEXT EXPEDITION';

    const scans=[
      [
        'power',
        'Power Alignment',
        '+8% ATK for your next world run.'
      ],
      [
        'guard',
        'Guardian Alignment',
        '+8 DEF for your next world run.'
      ],
      [
        'speed',
        'Velocity Alignment',
        '+25 SPD for your next world run.'
      ],
      [
        'focus',
        'Precision Alignment',
        '+5% critical chance for your next world run.'
      ]
    ];

    for(
      const[
        id,
        name,
        desc
      ] of scans
    )
      body.appendChild(
        hubFacilityCard(
          name,
          desc,

          P.expeditionBuff?.id===id
            ?'SELECTED FOR NEXT EXPEDITION'
            :'One scan may be prepared at a time',

          P.expeditionBuff?.id===id
            ?'SELECTED'
            :'PREPARE SCAN',

          ()=>{
            P.expeditionBuff={
              id,
              name
            };

            SFX.core();

            toast(
              'OBSERVATORY',
              name+
              ' prepared.'
            );

            refresh();
          },

          P.expeditionBuff?.id===id
        )
      );


  }else if(type==='petgarden'){
    title.textContent='Pet Bond Garden';
    sub.textContent='BOND // PLAY // COMPANION SYNERGY';

    const ap=activePet();

    if(!ap){
      body.appendChild(
        hubFacilityCard(
          'No Active Companion',
          'Equip a pet at the Pet Sanctuary before using the Bond Garden.',
          'Pet Sanctuary is at the west wing'
        )
      );

    }else{
      ap.bond=ap.bond||0;

      ap.bondXP=
        ap.bondXP||
        ap.bond*35;

      const maxed=
        ap.bond>=20,

        cost=
          250+
          ap.bond*125;

      body.appendChild(
        hubFacilityCard(
          ap.name+
          ' Bond',

          'Spend time training and playing with your active companion. Bond also grows naturally while fighting together.',

          'Bond '+
          ap.bond+
          ' / 20 · '+
          ap.bondXP+
          ' bond XP · Cost: '+
          cost+
          ' credits',

          maxed
            ?'MAX BOND'
            :'BOND SESSION',

          ()=>{
            if(
              maxed||
              !spendCredits(cost)
            )return;

            const old=
              getStats().maxHP;

            ap.bond++;

            preserveHealthForStatChange(
              old,
              getStats().maxHP
            );

            SFX.pet();

            toast(
              'PET BOND',
              ap.name+
              ' reached Bond '+
              ap.bond+
              '.'
            );

            refresh();
            syncHUD();
          },

          maxed
        )
      );

      body.appendChild(
        hubFacilityCard(
          'Companion Gimmick',
          petGimmickText(
            ap.name
          ),
          'Bond bonus: +'+
          (
            ap.bond*3
          )+
          '% pet stat scaling and +'+
          (
            ap.bond*4
          )+
          '% companion attack scaling'
        )
      );
    }


  }else if(type==='style'){
    title.textContent='Rift Style Studio';
    sub.textContent='RIFTWALKER COSMETICS // SCARF COLORS';

    const colors=[
      ['Rift Red','#e94759'],
      ['Nova Cyan','#55dff5'],
      ['Void Violet','#9d72ff'],
      ['Solar Gold','#f3c85f'],
      ['Flux Mint','#70e6b5'],
      ['Ghost White','#eef8ff']
    ];

    for(
      const[
        name,
        color
      ] of colors
    ){
      const selected=
        P.scarfColor===color;

      const card=
        hubFacilityCard(
          name,
          'Change the Riftwalker energy scarf without changing your stats.',

          selected
            ?'CURRENT STYLE'
            :'Cosmetic only',

          selected
            ?'EQUIPPED'
            :'EQUIP',

          ()=>{
            P.scarfColor=color;

            SFX.click();

            toast(
              'STYLE UPDATED',
              name+
              ' scarf equipped.'
            );

            refresh();
          },

          selected
        );

      card.style.borderColor=
        color;

      body.appendChild(card);
    }


  }else if(type==='challenge'){
    title.textContent='Challenge Chamber';
    sub.textContent='OPTIONAL NEXT-WORLD MODIFIERS // BONUS REWARDS';

    const protocols=[
      {
        id:'berserker',
        name:'Berserker Protocol',
        desc:'+18% ATK, but -15% DEF.',
        reward:1.25
      },
      {
        id:'blitz',
        name:'Blitz Protocol',
        desc:'+35 SPD and +5% CRIT, but -10% max HP.',
        reward:1.20
      },
      {
        id:'survival',
        name:'Survival Protocol',
        desc:'+12% DEF, but max HP is reduced by 22%.',
        reward:1.35
      }
    ];

    for(const ch of protocols){
      const selected=
        P.challengeProtocol?.id===
        ch.id;

      body.appendChild(
        hubFacilityCard(
          ch.name,
          ch.desc,

          'Boss clear reward x'+
          ch.reward.toFixed(2)+
          ' · Applies to next world only',

          selected
            ?'ARMED'
            :'ARM PROTOCOL',

          ()=>{
            P.challengeProtocol={
              ...ch
            };

            SFX.boss();

            toast(
              'CHALLENGE ARMED',
              ch.name+
              ' will activate on your next expedition.'
            );

            refresh();
          },

          selected
        )
      );
    }

    body.appendChild(
      hubFacilityCard(
        'Standard Expedition',
        'Remove the currently prepared challenge protocol.',
        'No challenge modifiers or bonus multiplier',
        'CLEAR PROTOCOL',

        ()=>{
          P.challengeProtocol=null;

          SFX.click();

          toast(
            'CHALLENGE CHAMBER',
            'Next expedition returned to standard rules.'
          );

          refresh();
        },

        !P.challengeProtocol
      )
    );


  }else if(type==='library'){
    title.textContent='Rift Library';
    sub.textContent='WORLD LORE // BOSS RECORDS // RECOVERED DATA';

    const known=
      WORLD_ORDER.filter(
        id=>
          G.unlocked.has(id)||
          G.completed.has(id)
      );

    const entries=
      known.slice(
        Math.max(
          0,
          known.length-8
        )
      );

    for(const id of entries){
      const w=WORLDS[id],
            done=
              G.completed.has(id);

      body.appendChild(
        hubFacilityCard(
          w.name,

          done
            ?w.desc
            :'Partial signal recovered. Complete this world to archive the full boss record.',

          done
            ?'BOSS FILE: '+
             w.boss+
             ' · CORE RECOVERED'
            :'BOSS FILE ENCRYPTED'
        )
      );
    }

    body.appendChild(
      hubFacilityCard(
        'Archive Index',
        'The library expands automatically as new worlds are discovered.',
        'Known worlds: '+
        known.length+
        ' / '+
        WORLD_ORDER.length+
        ' · Completed: '+
        G.completed.size
      )
    );


  }else if(type==='artifact'){
    title.textContent='Artifact Vault';
    sub.textContent='RELICS // ONE EQUIPPED PASSIVE';

    for(
      const[
        name,
        r
      ] of Object.entries(
        RIFT_RELICS
      )
    ){
      const owned=
        !!P.relicsOwned[name],

        equipped=
          P.relic===name;

      body.appendChild(
        hubFacilityCard(
          name,
          r.desc,

          equipped
            ?'EQUIPPED RELIC'
            :owned
              ?'Owned · choose one relic at a time'
              :r.cost+
               ' credits',

          equipped
            ?'EQUIPPED'
            :owned
              ?'EQUIP'
              :'UNLOCK · '+
               r.cost,

          ()=>{
            if(
              !owned&&
              !spendCredits(
                r.cost
              )
            )return;

            P.relicsOwned[name]=true;

            const old=
              getStats().maxHP;

            P.relic=name;

            preserveHealthForStatChange(
              old,
              getStats().maxHP
            );

            SFX.core();

            toast(
              'ARTIFACT VAULT',
              name+
              ' synchronized.'
            );

            refresh();
            syncHUD();
          },

          equipped
        )
      );
    }


  }else if(type==='drones'){
    title.textContent='Drone Workshop';
    sub.textContent='SUPPORT DRONE // AUTO FIRE';

    const lv=P.droneLevel||0,
          max=5,
          cost=500+lv*450;

    body.appendChild(
      hubFacilityCard(
        'Rift Support Drone',

        'A floating companion drone automatically fires at nearby enemies during world runs.',

        'DRONE MK '+
        lv+
        ' / '+
        max+
        (
          lv
            ?' · Damage '+
             (
               10+
               lv*7
             )+
             ' · Fire rate '+
             Math.max(
               .65,
               2.35-lv*.22
             ).toFixed(2)+
             's'
            :' · Offline'
        ),

        lv>=max
          ?'MAXED'
          :lv
            ?'UPGRADE · '+
             cost
            :'BUILD · '+
             cost,

        ()=>{
          if(
            lv>=max||
            !spendCredits(cost)
          )return;

          P.droneLevel++;

          SFX.core();

          toast(
            'DRONE WORKSHOP',
            'Support Drone upgraded to MK '+
            P.droneLevel+
            '.'
          );

          refresh();
        },

        lv>=max
      )
    );

    body.appendChild(
      hubFacilityCard(
        'Drone Diagnostics',
        'The drone follows above your shoulder and targets the nearest enemy within 430 range.',
        'No pet slot required · Works together with your active pet'
      )
    );


  }else if(type==='kitchen'){
    title.textContent='Rift Kitchen';
    sub.textContent='EXPEDITION MEALS // NEXT RUN BUFF';

    for(
      const[
        id,
        m
      ] of Object.entries(
        RIFT_MEALS
      )
    ){
      const selected=
        P.mealBuff===id;

      body.appendChild(
        hubFacilityCard(
          m.name,
          m.desc,

          selected
            ?'PACKED FOR NEXT EXPEDITION'
            :m.cost+
             ' credits',

          selected
            ?'PACKED'
            :'PREPARE · '+
             m.cost,

          ()=>{
            if(selected)
              return;

            if(
              !spendCredits(
                m.cost
              )
            )return;

            P.mealBuff=id;

            SFX.coin();

            toast(
              'RIFT KITCHEN',
              m.name+
              ' packed for your next world.'
            );

            refresh();
          },

          selected
        )
      );
    }


  }else if(type==='guild'){
    title.textContent='Expedition Guild';
    sub.textContent='LONG-TERM CONTRACTS // BIG REWARDS';

    const contracts=[
      [
        'hunter',
        'Rift Hunter',
        50,
        'kills',
        650
      ],
      [
        'fragment',
        'Shard Collector',
        25,
        'fragments',
        850
      ],
      [
        'walker',
        'World Walker',
        5,
        'bosses',
        1200
      ],
      [
        'veteran',
        'Veteran Riftwalker',
        15,
        'bosses',
        2600
      ],
      [
        'legend',
        'Multiverse Legend',
        31,
        'bosses',
        6000
      ]
    ];

    for(
      const[
        id,
        name,
        goal,
        stat,
        reward
      ] of contracts
    ){
      const value=
        P.hubStats[stat]||0,

        key=
          'guild_'+id,

        claimed=
          !!P.hubClaims[key],

        ready=
          value>=goal;

      body.appendChild(
        hubFacilityCard(
          name,

          'Permanent Guild contract. Progress is tracked across every expedition.',

          Math.min(
            value,
            goal
          )+
          ' / '+
          goal+
          ' '+
          stat.toUpperCase()+
          ' · Reward '+
          reward+
          ' credits',

          claimed
            ?'CLAIMED'
            :ready
              ?'CLAIM REWARD'
              :'IN PROGRESS',

          ()=>{
            if(
              !ready||
              claimed
            )return;

            P.hubClaims[key]=true;

            addCredits(reward);

            addMaterial(
              'Rift Dust',
              Math.max(
                1,
                Math.floor(
                  goal/10
                )
              )
            );

            SFX.core();

            toast(
              'GUILD CONTRACT',
              name+
              ' completed.'
            );

            refresh();
          },

          claimed||
          !ready
        )
      );
    }


  }else if(type==='lounge'){
    title.textContent='Music Lounge';
    sub.textContent='JUKEBOX // SOUNDTRACK ENERGY';

    const modes=[
      [
        'dynamic',
        'Dynamic Mix',
        'Original world tempo and intensity.'
      ],
      [
        'chill',
        'Chill Rift',
        'Slower, softer exploration mix.'
      ],
      [
        'battle',
        'Battle Drive',
        'Faster and louder soundtrack.'
      ],
      [
        'hyper',
        'Hyperverse',
        'Maximum tempo for chaotic runs.'
      ]
    ];

    for(
      const[
        id,
        name,
        desc
      ] of modes
    ){
      const selected=
        P.musicMode===id;

      body.appendChild(
        hubFacilityCard(
          name,
          desc,

          selected
            ?'CURRENT SOUNDTRACK MODE'
            :'Changes music globally',

          selected
            ?'PLAYING'
            :'SELECT',

          ()=>{
            P.musicMode=id;

            MUSIC.setWorld(
              G.scene==='hub'
                ?'hub'
                :G.worldId||
                 'earth'
            );

            SFX.click();

            toast(
              'MUSIC LOUNGE',
              name+
              ' selected.'
            );

            refresh();
          },

          selected
        )
      );
    }


  }else if(type==='chronicle'){
    title.textContent='Rift Chronicle';
    sub.textContent='DAILY + WEEKLY CONTRACTS // ROTATING GOALS';

    ensureChronicles();

    const daily=[
      [
        'd_kills',
        'Daily Hunt',
        'kills',
        20,
        350,
        1
      ],
      [
        'd_elites',
        'Elite Breaker',
        'elites',
        3,
        500,
        2
      ],
      [
        'd_credits',
        'Rift Earner',
        'credits',
        800,
        450,
        1
      ],
      [
        'd_chests',
        'Cache Seeker',
        'chests',
        2,
        400,
        1
      ]
    ];

    const weekly=[
      [
        'w_kills',
        'Weekly Hunter',
        'kills',
        120,
        1400,
        5
      ],
      [
        'w_boss',
        'Boss Week',
        'bosses',
        3,
        1800,
        6
      ],
      [
        'w_clear',
        'World Walker',
        'clears',
        5,
        2200,
        8
      ],
      [
        'w_chest',
        'Treasure Route',
        'chests',
        12,
        1600,
        5
      ]
    ];

    for(
      const[
        period,
        arr
      ] of[
        ['daily',daily],
        ['weekly',weekly]
      ]
    )
      for(
        const[
          id,
          name,
          stat,
          goal,
          reward,
          tokens
        ] of arr
      ){
        const rec=
          P.longTerm[period],

          now=
            progressSince(
              period,
              stat
            ),

          claimed=
            !!rec.claims[id],

          ready=
            now>=goal;

        body.appendChild(
          hubFacilityCard(
            name,

            (
              period==='daily'
                ?'Daily'
                :'Weekly'
            )+
            ' Chronicle contract. Rotates automatically with the calendar.',

            Math.min(
              now,
              goal
            )+
            ' / '+
            goal+
            ' · '+
            reward+
            ' credits · '+
            tokens+
            ' Rift Tokens',

            claimed
              ?'CLAIMED'
              :ready
                ?'CLAIM'
                :'IN PROGRESS',

            ()=>{
              if(
                claimed||
                !ready
              )return;

              rec.claims[id]=true;

              addCredits(reward);

              P.riftTokens+=tokens;
              P.longTerm.tower.tokens=
                P.riftTokens;

              SFX.core();

              toast(
                'CHRONICLE COMPLETE',
                name+
                ' rewards claimed.'
              );

              refresh();
            },

            claimed||
            !ready
          )
        );
      }


  }else if(type==='mastery'){
    title.textContent='Mastery Hall';
    sub.textContent='WEAPON PROFICIENCY // WORLD REPLAYS';

    const w=getWeapon();

    body.appendChild(
      hubFacilityCard(
        w
          ?(
            P.weapon+
            ' · MASTERY '+
            weaponMasteryLevel(
              P.weapon
            )
          )
          :'No Weapon Equipped',

        w
          ?'Every enemy defeated with this weapon builds permanent proficiency. Mastery slightly increases ATK and attack speed.'
          :'Equip a weapon in the Armory first.',

        w
          ?(
            weaponMasteryXP(
              P.weapon
            )+
            ' mastery XP · Max level 30'
          )
          :'',

        '',
        null,
        true
      )
    );

    for(
      const id of
      WORLD_ORDER.filter(
        x=>
          G.completed.has(x)
      )
    ){
      const clears=
        P.longTerm
          .worldClears[id]||0;

      body.appendChild(
        hubFacilityCard(
          WORLDS[id].name+
          ' · '+
          masteryRank(clears),

          'Replay the full world with its boss restored. Repeated clears raise this world from Bronze to Mythic.',

          clears+
          ' mastery clears · next clear rewards scale upward',

          'START MASTERY RUN',

          ()=>
            beginMasteryTrial(
              id,
              false
            )
        )
      );
    }


  }else if(type==='tower'){
    title.textContent='Rift Tower';
    sub.textContent='ENDLESS FLOORS // CHECKPOINTS // TOWER TOKENS';

    const t=
      P.longTerm.tower;

    body.appendChild(
      hubFacilityCard(
        'Enter Rift Tower',

        'Climb an endless sequence of combat floors. Every fifth floor is a boss. Difficulty and rewards keep scaling.',

        'Best floor: '+
        t.best+
        ' · Rift Tokens: '+
        P.riftTokens+
        ' · Runs: '+
        t.runs,

        'START FROM FLOOR '+
        Math.max(
          1,
          Math.floor(
            t.best/5
          )*
          5+
          1
        ),

        ()=>
          startRiftTower()
      )
    );

    body.appendChild(
      hubFacilityCard(
        'Tower Exchange',
        'Trade 10 Rift Tokens for a Boss Core.',
        'You have '+
        P.riftTokens+
        ' Rift Tokens',
        'TRADE 10 TOKENS',

        ()=>{
          if(P.riftTokens<10){
            toast(
              'RIFT TOWER',
              'You need 10 Rift Tokens.'
            );

            return;
          }

          P.riftTokens-=10;
          t.tokens=P.riftTokens;

          addMaterial(
            'Boss Core',
            1
          );

          SFX.core();
          refresh();
        },

        P.riftTokens<10
      )
    );

    body.appendChild(
      hubFacilityCard(
        'Dust Cache',
        'Trade 4 Rift Tokens for 8 Rift Dust.',
        'Useful for fusion and crafting.',
        'TRADE 4 TOKENS',

        ()=>{
          if(P.riftTokens<4)
            return;

          P.riftTokens-=4;
          t.tokens=P.riftTokens;

          addMaterial(
            'Rift Dust',
            8
          );

          refresh();
        },

        P.riftTokens<4
      )
    );


  }else if(type==='bossrush'){
    title.textContent='Boss Rush Gate';
    sub.textContent='ALL DEFEATED BOSSES // ONE LIFE';

    const b=
      P.longTerm.bossRush,

      available=
        WORLD_ORDER.filter(
          id=>
            G.completed.has(id)
        ).length;

    body.appendChild(
      hubFacilityCard(
        'Boss Rush',

        'Fight every boss you have defeated back-to-back. You heal a little between fights, but there are no checkpoints.',

        available+
        ' bosses available · Best streak '+
        b.best+
        ' · Full clears '+
        b.clears,

        'ENTER BOSS RUSH',

        ()=>
          startBossRush(),

        available<1
      )
    );


  }else if(type==='anomaly'){
    title.textContent='Anomaly Scanner';
    sub.textContent='ONE SPECIAL RIFT EVERY DAY';

    const a=
      todayAnomaly(),

      claimed=
        !!P.longTerm
          .anomalyClaims[a.key],

      clears=
        P.longTerm
          .worldClears[a.world]||
        0;

    body.appendChild(
      hubFacilityCard(
        a.name+
        ' · '+
        WORLDS[a.world].name,

        a.desc,

        'Daily reward x'+
        a.reward.toFixed(2)+
        ' · 3 Rift Tokens · Current mastery '+
        masteryRank(clears),

        claimed
          ?'CLEARED TODAY'
          :'ENTER ANOMALY',

        ()=>
          beginMasteryTrial(
            a.world,
            true
          ),

        claimed||
        !G.completed.has(
          a.world
        )
      )
    );

    if(
      !G.completed.has(
        a.world
      )
    )
      body.appendChild(
        hubFacilityCard(
          'Anomaly Locked',

          'Defeat '+
          WORLDS[a.world].name+
          ' normally before its anomaly replay becomes available.',

          'The scanner will select another world tomorrow.'
        )
      );


  }else if(type==='ascension'){
    title.textContent='Ascension Chamber';
    sub.textContent='POSTGAME PERMANENT RANKS';

    const rank=
      P.longTerm.ascension||0,

      maxed=
        rank>=10,

      costCores=
        5+
        rank*2,

      costCredits=
        5000+
        rank*2500,

      ready=
        G.completed.size>=
        WORLD_ORDER.length;

    body.appendChild(
      hubFacilityCard(
        'Rift Ascension · Rank '+
        rank,

        'After mastering the full Multiverse, convert endgame resources into permanent power. Each rank grants +2% max HP, ATK and DEF. Nothing is reset.',

        ready
          ?(
            'Cost: '+
            costCores+
            ' Boss Cores + '+
            costCredits+
            ' credits · Max Rank 10'
          )
          :'Recover all 31 World Cores first.',

        maxed
          ?'MAX ASCENSION'
          :ready
            ?'ASCEND'
            :'LOCKED',

        ()=>{
          if(
            maxed||
            !ready
          )return;

          if(
            (
              P.materials[
                'Boss Core'
              ]||0
            )<
            costCores||
            P.credits<
            costCredits
          ){
            toast(
              'ASCENSION',
              'Not enough Boss Cores or Rift Credits.'
            );

            return;
          }

          P.materials[
            'Boss Core'
          ]-=costCores;

          P.credits-=costCredits;

          P.longTerm.ascension++;

          SFX.core();

          toast(
            'RIFT ASCENSION',
            'Ascension Rank '+
            P.longTerm.ascension+
            ' achieved. Permanent stats increased.'
          );

          refresh();
          syncHUD();
        },

        maxed||
        !ready
      )
    );


  }else if(type==='market'){
    title.textContent='Rift Market';
    sub.textContent='SUPPLIES // MATERIALS // EXPEDITION GOODS';

    body.appendChild(
      hubFacilityCard(
        'Rift Dust Pack',
        'A small cache used for crafting and fusion experiments.',
        '3 Rift Dust · 180 credits',
        'BUY',

        ()=>{
          if(
            !spendCredits(180)
          )return;

          addMaterial(
            'Rift Dust',
            3
          );

          toast(
            'RIFT MARKET',
            'Purchased 3 Rift Dust.'
          );

          refresh();
        }
      )
    );

    body.appendChild(
      hubFacilityCard(
        'Explorer Material Crate',
        'Contains four non-boss materials pulled from discovered rifts.',
        '4 random materials · 420 credits',
        'BUY',

        ()=>{
          if(
            !spendCredits(420)
          )return;

          const pool=
            MATERIALS.filter(
              x=>
                x!=='Boss Core'
            );

          for(let i=0;i<4;i++)
            addMaterial(
              pool[
                randi(
                  0,
                  pool.length-1
                )
              ],
              1
            );

          toast(
            'RIFT MARKET',
            'Explorer crate opened.'
          );

          refresh();
        }
      )
    );

    body.appendChild(
      hubFacilityCard(
        'Pet Training Treat',
        'Instantly gives your active companion one training level.',
        'Requires an active pet · 350 credits',
        'BUY & TRAIN',

        ()=>{
          const ap=activePet();

          if(!ap){
            toast(
              'RIFT MARKET',
              'Equip a pet first.'
            );

            return;
          }

          if(
            !spendCredits(350)
          )return;

          const old=
            getStats().maxHP;

          ap.level++;

          preserveHealthForStatChange(
            old,
            getStats().maxHP
          );

          SFX.pet();

          toast(
            'PET TREAT',
            ap.name+
            ' reached level '+
            ap.level+
            '.'
          );

          refresh();
          syncHUD();
        },

        !activePet()
      )
    );


  }else if(type==='hangar'){
    title.textContent='Ship Hangar';
    sub.textContent='RIFT DRIVE // SHIP BAY';

    const max=6,
          lv=P.shipLevel,
          cost=700*lv;

    body.appendChild(
      hubFacilityCard(
        'Rift Drive MK '+
        lv,

        'Upgrade the ship to shorten the travel sequence between The Hub and worlds.',

        'Travel time: '+
        travelDuration().toFixed(2)+
        's · Ship level '+
        lv+
        ' / '+
        max,

        lv>=max
          ?'MAXED'
          :'UPGRADE · '+
           cost+
           ' CREDITS',

        ()=>{
          if(
            lv>=max||
            !spendCredits(cost)
          )return;

          P.shipLevel++;

          SFX.core();

          toast(
            'SHIP UPGRADED',
            'Rift Drive upgraded to MK '+
            P.shipLevel+
            '.'
          );

          refresh();
        },

        lv>=max
      )
    );

    body.appendChild(
      hubFacilityCard(
        'Launch Diagnostics',
        'Run a full systems check on your ship and Rift Drive.',

        'Hull stable · Navigation linked · Core synchronization '+
        Math.round(
          72+
          P.shipLevel*4
        )+
        '%',

        'RUN DIAGNOSTIC',

        ()=>{
          SFX.click();

          toast(
            'HANGAR DIAGNOSTIC',
            'All launch systems are stable. Rift Drive MK '+
            P.shipLevel+
            ' ready.'
          );
        }
      )
    );


  }else if(type==='skillnexus'){
    title.textContent='Riftwalker Skill Tree';
    sub.textContent='FOUR PATHS // 24 SKILLS // CAPSTONES';

    renderSkillTree(
      body,
      refresh
    );


  }else if(type==='huntlodge'){
    title.textContent='Legendary Hunt Lodge';
    sub.textContent='REPLAY WORLDS // HUNT UNIQUE MINIBOSSES // COLLECT RELICS';

    body.appendChild(
      hubFacilityCard(
        'Hunter Record',
        'Only one hunt can be tracked at a time. Enter the selected NORMAL world and search deep into the stage.',

        'Legendary Marks: '+
        P.legendaryMarks+
        ' · Hunts defeated: '+
        (
          P.hubStats.legendaryKills||
          0
        )+
        ' · Relics: '+
        Object.keys(
          P.worldRelics||{}
        ).filter(
          k=>
            P.worldRelics[k]
        ).length+
        ' / 31'
      )
    );

    const worlds=
      WORLD_ORDER.filter(
        id=>
          G.completed.has(id)
      );

    for(const id of worlds){
      const active=
        P.legendaryHunt===id,

        got=
          !!P.worldRelics[id];

      body.appendChild(
        hubFacilityCard(
          'Hunt: '+
          WORLDS[id].name,

          'Track a Legendary '+
          enemyName(
            id,
            2
          )+
          ' hidden inside this world.',

          got
            ?'WORLD RELIC RECOVERED · Repeat hunts still give marks'
            :'Relic reward: '+
             worldRelicName(id),

          active
            ?'TRACKING'
            :'TRACK HUNT',

          ()=>{
            P.legendaryHunt=id;

            SFX.boss();

            toast(
              'HUNT TRACKED',
              'Legendary signal locked in '+
              WORLDS[id].name+
              '.'
            );

            refresh();
          },

          active
        )
      );
    }


  }else if(type==='cartography'){
    title.textContent='Cartography Bay';
    sub.textContent='TREASURE MAPS // BONUS VAULTS';

    body.appendChild(
      hubFacilityCard(
        'Active Treasure Map',

        'A map creates three large treasure vaults during the next NORMAL run of its target world.',

        P.treasureMapWorld
          ?WORLDS[
            P.treasureMapWorld
          ].name
          :'No map prepared'
      )
    );

    for(
      const id of
      WORLD_ORDER.filter(
        id=>
          G.completed.has(id)
      )
    ){
      const active=
        P.treasureMapWorld===id,

        cost=
          420+
          worldNumber(id)*18;

      body.appendChild(
        hubFacilityCard(
          WORLDS[id].name+
          ' Treasure Map',

          'Adds 3 hidden treasure vaults to the next run. Each vault contains credits and materials.',

          active
            ?'MAP READY'
            :cost+
             ' credits',

          active
            ?'READY'
            :'BUY MAP',

          ()=>{
            if(active)return;

            if(
              !spendCredits(cost)
            )return;

            P.treasureMapWorld=id;

            SFX.click();

            toast(
              'MAP PREPARED',
              'Three treasure vaults marked in '+
              WORLDS[id].name+
              '.'
            );

            refresh();
          },

          active
        )
      );
    }


  }else if(type==='petcoliseum'){
    title.textContent='Pet Coliseum';
    sub.textContent='COMPANION DIVISIONS // BOND + LEVEL TRIALS';

    const ap=activePet();

    if(!ap){
      body.appendChild(
        hubFacilityCard(
          'No Active Pet',
          'Equip a companion before entering the Coliseum.',
          'Pet Sanctuary required'
        )
      );

    }else{
      const div=
        P.petArena.division||0,

        power=
          (ap.level||1)+
          (ap.bond||0)*2;

      body.appendChild(
        hubFacilityCard(
          ap.name+
          ' Team',

          'Your companion earns permanent Coliseum titles by meeting level + bond requirements.',

          'Pet power '+
          power+
          ' · Division '+
          div+
          ' / 10 · Wins '+
          (
            P.petArena.wins||
            0
          )
        )
      );

      for(
        let d=div+1;
        d<=Math.min(
          10,
          div+3
        );
        d++
      ){
        const need=
          4+d*4,

          ready=
            power>=need,

          reward=
            250+d*120;

        body.appendChild(
          hubFacilityCard(
            'Division '+
            d+
            ' Trial',

            'Required pet power: '+
            need+
            '. Train levels and Bond to qualify.',

            'Reward: '+
            reward+
            ' credits · '+
            (
              d%3===0
                ?'1 Boss Core'
                :'2 Rift Dust'
            ),

            ready
              ?'ENTER TRIAL'
              :'LOCKED',

            ()=>{
              if(!ready)
                return;

              P.petArena.division=d;
              P.petArena.wins++;

              addCredits(reward);

              if(d%3===0)
                addMaterial(
                  'Boss Core',
                  1
                );
              else
                addMaterial(
                  'Rift Dust',
                  2
                );

              gainPetBondXP(
                18+d*2
              );

              SFX.pet();

              toast(
                'PET COLISEUM WIN',
                ap.name+
                ' cleared Division '+
                d+
                '!'
              );

              refresh();
            },

            !ready
          )
        );
      }
    }


  }else if(type==='arcade'){
    title.textContent='Rift Arcade';
    sub.textContent='DAILY PRISM PICK // RIFT TOKEN GAMES';

    const dk=dayKey();

    if(P.arcade.day!==dk){
      P.arcade.day=dk;
      P.arcade.played=false;
    }

    body.appendChild(
      hubFacilityCard(
        'Prism Pick',

        'Once per day, choose one of five unstable prisms. Every prism pays something; one contains the jackpot.',

        P.arcade.played
          ?'Played today · return tomorrow'
          :'Daily play available'
      )
    );

    for(let i=1;i<=5;i++){
      body.appendChild(
        hubFacilityCard(
          'Prism '+i,

          'Crack this prism and reveal today’s reward.',

          P.arcade.played
            ?'SEALED UNTIL TOMORROW'
            :'Daily choice',

          P.arcade.played
            ?'USED'
            :'PICK PRISM',

          ()=>{
            if(P.arcade.played)
              return;

            const seed=
              [...dk].reduce(
                (a,c)=>
                  a+
                  c.charCodeAt(0),
                0
              ),

              jackpot=
                (seed%5)+1,

              reward=
                i===jackpot
                  ?1500
                  :180+i*55;

            P.arcade.played=true;

            P.arcade.total=
              (
                P.arcade.total||
                0
              )+
              reward;

            addCredits(reward);

            if(i===jackpot){
              P.riftTokens+=2;

              toast(
                'ARCADE JACKPOT',
                reward+
                ' credits + 2 Rift Tokens!',
                4
              );

            }else{
              toast(
                'PRISM OPENED',
                reward+
                ' credits recovered.'
              );
            }

            refresh();
          },

          P.arcade.played
        )
      );
    }

    body.appendChild(
      hubFacilityCard(
        'Token Converter',
        'Trade 3 Rift Tokens for a high-grade material bundle.',
        'Owned: '+
        P.riftTokens+
        ' Rift Tokens',
        'CONVERT 3',

        ()=>{
          if(P.riftTokens<3){
            toast(
              'RIFT ARCADE',
              'You need 3 Rift Tokens.'
            );

            return;
          }

          P.riftTokens-=3;

          addMaterial(
            'Rift Dust',
            6
          );

          addMaterial(
            'Boss Core',
            1
          );

          toast(
            'TOKEN CONVERTER',
            'Received 6 Rift Dust + 1 Boss Core.'
          );

          refresh();
        },

        P.riftTokens<3
      )
    );


  }else if(type==='armorforge'){
    title.textContent='Armor Fusion Forge';
    sub.textContent='TWIN-CORE ARMOR // KEEP BOTH ORIGINALS';

    const owned=
      Object.entries(
        allArmors()
      ).filter(
        ([id,a])=>
          id!=='none'&&
          armorOwned(id)
      );

    if(owned.length<2){
      body.appendChild(
        hubFacilityCard(
          'Fusion Forge Offline',
          'Own at least two armor sets before attempting a Twin-Core fusion.',
          'Owned armor: '+
          owned.length+
          ' / 2'
        )
      );

    }else{
      const panel=
        document.createElement(
          'div'
        );

      panel.className=
        'fusionMachinePanel armorFusionMachine';

      panel.innerHTML=
        `<div class="fusionMachineCore"><small>ARMOR CORE</small><select class="fusionA"></select></div><div class="fusionMachinePlus">+</div><div class="fusionMachineCore"><small>ARMOR CATALYST</small><select class="fusionB"></select></div><div class="fusionMachineResult"><small>TWIN-CORE RESULT</small><b class="fusionMachineName">SELECT TWO ARMORS</b><span class="fusionMachineStats">Stats and both visual energies will merge.</span></div><button class="fusionMachineBtn">FUSE ARMOR</button>`;

      const sa=
        panel.querySelector(
          '.fusionA'
        ),

        sb=
          panel.querySelector(
            '.fusionB'
          ),

        nm=
          panel.querySelector(
            '.fusionMachineName'
          ),

        st=
          panel.querySelector(
            '.fusionMachineStats'
          ),

        btn=
          panel.querySelector(
            '.fusionMachineBtn'
          );

      for(
        const[
          id,
          a
        ] of owned
      ){
        for(const sel of[sa,sb]){
          const o=
            document.createElement(
              'option'
            );

          o.value=id;
          o.textContent=a.name;

          sel.appendChild(o);
        }
      }

      if(owned.length>1)
        sb.selectedIndex=1;

      const preview=()=>{
        if(sa.value===sb.value){
          nm.textContent=
            'CHOOSE DIFFERENT ARMORS';

          st.textContent=
            'The Core and Catalyst cannot be the same.';

          btn.disabled=true;

          return;
        }

        const old=
          existingArmorFusion(
            sa.value,
            sb.value
          ),

          a=
            makeArmorFusion(
              sa.value,
              sb.value
            );

        nm.textContent=a.name;

        st.textContent=
          `HP +${a.hp} · ATK +${a.atk} · DEF +${a.def} · SPD ${a.speed>=0?'+':''}${a.speed} · CRIT +${Math.round(a.crit*100)}% · 12% Twin-Core Guard`;

        btn.disabled=!!old;

        btn.textContent=
          old
            ?'ALREADY FUSED'
            :'FUSE · 1,500 CREDITS + 2 BOSS CORES';
      };

      sa.onchange=preview;
      sb.onchange=preview;

      btn.onclick=()=>{
        const id=
          createArmorFusion(
            sa.value,
            sb.value
          );

        if(id){
          P.armor=id;

          renderInventory();
          refresh();
          syncHUD();
        }
      };

      preview();

      body.appendChild(panel);

      body.appendChild(
        hubFacilityCard(
          'Twin-Core Rule',

          'Armor fusion never destroys the two source armors. A fused suit gets merged stats, +2.5% CRIT, faster attacks and a chance to reduce incoming damage.',

          'Created fusions: '+
          Object.keys(
            P.fusedArmors||{}
          ).length
        )
      );
    }


  }else if(type==='petfusion'){
    title.textContent='Pet Fusion Lab';
    sub.textContent='HYBRID COMPANIONS // DUAL DNA // KEEP BOTH PETS';

    const pets=
      Object.keys(
        PET_STATE.owned||{}
      );

    if(pets.length<2){
      body.appendChild(
        hubFacilityCard(
          'Fusion Lab Waiting',
          'Befriend at least two pets before creating a hybrid companion.',
          'Owned pets: '+
          pets.length+
          ' / 2'
        )
      );

    }else{
      const panel=
        document.createElement(
          'div'
        );

      panel.className=
        'fusionMachinePanel petFusionMachine';

      panel.innerHTML=
        `<div class="fusionMachineCore"><small>CORE PET</small><select class="fusionA"></select></div><div class="fusionMachinePlus">+</div><div class="fusionMachineCore"><small>CATALYST PET</small><select class="fusionB"></select></div><div class="fusionMachineResult"><small>HYBRID RESULT</small><b class="fusionMachineName">SELECT TWO PETS</b><span class="fusionMachineStats">Body + attack from Core, colors + passive DNA from Catalyst.</span></div><button class="fusionMachineBtn">FUSE PETS</button>`;

      const sa=
        panel.querySelector(
          '.fusionA'
        ),

        sb=
          panel.querySelector(
            '.fusionB'
          ),

        nm=
          panel.querySelector(
            '.fusionMachineName'
          ),

        st=
          panel.querySelector(
            '.fusionMachineStats'
          ),

        btn=
          panel.querySelector(
            '.fusionMachineBtn'
          );

      for(const name of pets){
        for(const sel of[sa,sb]){
          const o=
            document.createElement(
              'option'
            );

          o.value=name;
          o.textContent=name;

          sel.appendChild(o);
        }
      }

      if(pets.length>1)
        sb.selectedIndex=1;

      const preview=()=>{
        if(sa.value===sb.value){
          nm.textContent=
            'CHOOSE DIFFERENT PETS';

          st.textContent=
            'A companion cannot fuse with itself.';

          btn.disabled=true;

          return;
        }

        const old=
          existingPetFusion(
            sa.value,
            sb.value
          ),

          a=
            petProfile(
              sa.value
            ),

          b=
            petProfile(
              sb.value
            );

        nm.textContent=
          petFusionName(
            sa.value,
            sb.value
          );

        st.textContent=
          (
            a?.attack?.label||
            'Core Attack'
          )+
          ' + '+
          (
            b?.passive?.label||
            'Catalyst Passive'
          )+
          ' + FUSION ECHO every 3 pet hits';

        btn.disabled=!!old;

        btn.textContent=
          old
            ?'ALREADY FUSED'
            :'FUSE · 1,200 CREDITS + 5 RIFT DUST';
      };

      sa.onchange=preview;
      sb.onchange=preview;

      btn.onclick=()=>{
        const name=
          createPetFusion(
            sa.value,
            sb.value
          );

        if(name){
          const old=
            getStats().maxHP;

          PET_STATE.active=name;

          preserveHealthForStatChange(
            old,
            getStats().maxHP
          );

          refresh();
          syncHUD();
        }
      };

      preview();

      body.appendChild(panel);

      body.appendChild(
        hubFacilityCard(
          'Hybrid Companion Rule',

          'Pet fusion keeps both parents. The hybrid inherits the Core pet’s body and signature attack, the Catalyst pet’s colors and passive, plus a Fusion Echo every third companion hit.',

          'Fusion pets can equip the same 4-slot pet gear as every other companion.'
        )
      );
    }


  }else if(type==='petgearforge'){
    title.textContent='Pet Armor Fusion Machine';
    sub.textContent='FUSE COMPANION GEAR // MATCHING SLOTS // KEEP BOTH ORIGINALS';

    const owned=
      Object.entries(
        allPetGear()
      ).filter(
        ([id,g])=>
          petGearIsOwned(id)
      );

    if(owned.length<2){
      body.appendChild(
        hubFacilityCard(
          'Companion Forge Waiting',

          'Own at least two pet gear pieces before using the fusion machine.',

          'Owned pet gear: '+
          owned.length+
          ' / 2'
        )
      );

    }else{
      const panel=
        document.createElement(
          'div'
        );

      panel.className=
        'fusionMachinePanel petGearFusionMachine';

      panel.innerHTML=
        `<div class="fusionMachineCore"><small>CORE PET ARMOR</small><select class="fusionA"></select></div><div class="fusionMachinePlus">+</div><div class="fusionMachineCore"><small>CATALYST PET ARMOR</small><select class="fusionB"></select></div><div class="fusionMachineResult"><small>SOULFORGE RESULT</small><b class="fusionMachineName">SELECT TWO MATCHING SLOTS</b><span class="fusionMachineStats">Head + Head, Body + Body, Charm + Charm or Paws + Paws.</span></div><button class="fusionMachineBtn">FUSE PET ARMOR</button>`;

      const sa=
        panel.querySelector(
          '.fusionA'
        ),

        sb=
          panel.querySelector(
            '.fusionB'
          ),

        nm=
          panel.querySelector(
            '.fusionMachineName'
          ),

        st=
          panel.querySelector(
            '.fusionMachineStats'
          ),

        btn=
          panel.querySelector(
            '.fusionMachineBtn'
          );

      for(
        const[
          id,
          g
        ] of owned
      ){
        for(const sel of[sa,sb]){
          const o=
            document.createElement(
              'option'
            );

          o.value=id;

          o.textContent=
            g.slot.toUpperCase()+
            ' · '+
            g.name;

          sel.appendChild(o);
        }
      }

      if(owned.length>1){
        let idx=
          owned.findIndex(
            (
              [id,g],
              i
            )=>
              i>0&&
              g.slot===
              owned[0][1].slot
          );

        sb.selectedIndex=
          idx>0
            ?idx
            :1;
      }

      const preview=()=>{
        const a=
          getPetGear(
            sa.value
          ),

          b=
            getPetGear(
              sb.value
            );

        if(
          !a||
          !b||
          sa.value===sb.value
        ){
          nm.textContent=
            'CHOOSE DIFFERENT GEAR';

          st.textContent=
            'The Core and Catalyst cannot be the same piece.';

          btn.disabled=true;

          return;
        }

        if(a.slot!==b.slot){
          nm.textContent=
            'SLOTS DO NOT MATCH';

          st.textContent=
            'Fuse '+
            a.slot.toUpperCase()+
            ' gear with another '+
            a.slot.toUpperCase()+
            ' piece.';

          btn.disabled=true;

          return;
        }

        const old=
          existingPetGearFusion(
            sa.value,
            sb.value
          ),

          g=
            makePetGearFusion(
              sa.value,
              sb.value
            );

        nm.textContent=g.name;

        const bits=[];

        if(g.hp)
          bits.push(
            'HP +'+g.hp
          );

        if(g.atk)
          bits.push(
            'ATK +'+g.atk
          );

        if(g.def)
          bits.push(
            'DEF +'+g.def
          );

        if(g.speed)
          bits.push(
            'SPD +'+g.speed
          );

        if(g.crit)
          bits.push(
            'CRIT +'+
            Math.round(
              g.crit*100
            )+
            '%'
          );

        if(g.petPower)
          bits.push(
            'PET +'+
            Math.round(
              g.petPower*100
            )+
            '%'
          );

        if(g.haste)
          bits.push(
            'HASTE +'+
            Math.round(
              g.haste*100
            )+
            '%'
          );

        st.textContent=
          bits.join(' · ')+
          ' · TWIN SOUL';

        btn.disabled=!!old;

        btn.textContent=
          old
            ?'ALREADY FUSED'
            :'FUSE · 900 CREDITS + 3 RIFT DUST';
      };

      sa.onchange=preview;
      sb.onchange=preview;

      btn.onclick=()=>{
        const id=
          createPetGearFusion(
            sa.value,
            sb.value
          );

        if(id){
          const ap=
            activePet(),

            g=
              getPetGear(id);

          if(ap&&g){
            const oldHP=
              getStats().maxHP;

            ensurePetGearState(
              ap
            )[g.slot]=id;

            preserveHealthForStatChange(
              oldHP,
              getStats().maxHP
            );
          }

          refresh();
          renderPets();
          syncHUD();
        }
      };

      preview();

      body.appendChild(panel);

      body.appendChild(
        hubFacilityCard(
          'Soulforge Rule',

          'Pet armor fusion keeps both source pieces. The result blends their stats, visuals and energy into stronger Soulforge gear.',

          'Created pet armor fusions: '+
          Object.keys(
            P.fusedPetGear||{}
          ).length+
          ' · A full 4-piece Soulforge set unlocks a special set bonus.'
        )
      );

      body.appendChild(
        hubFacilityCard(
          'Recursive Fusion',

          'Fused pet armor can be fused again with another owned piece of the same slot, allowing rare custom endgame builds.',

          'Fusion pieces can be equipped by any pet, including hybrid and corrupted pets.'
        )
      );
    }


  }else if(type==='relicmuseum'){
    title.textContent='World Relic Museum';
    sub.textContent='31 LEGENDARY RELICS // COLLECTION MILESTONES';

    const count=
      Object.keys(
        P.worldRelics||{}
      ).filter(
        k=>
          P.worldRelics[k]
      ).length;

    body.appendChild(
      hubFacilityCard(
        'Relic Collection',

        'Legendary Hunts can recover one unique relic from each original world.',

        'Recovered '+
        count+
        ' / 31 · Legendary Marks '+
        P.legendaryMarks
      )
    );

    for(const goal of[5,15,31]){
      const key=
        'relic_milestone_'+
        goal,

        claimed=
          !!P.hubClaims[key],

        ready=
          count>=goal,

        reward=
          goal===5
            ?'2,500 credits'
            :goal===15
              ?'7,500 credits + 3 Boss Cores'
              :'20,000 credits + 10 Boss Cores';

      body.appendChild(
        hubFacilityCard(
          goal+
          ' Relic Milestone',

          'Permanent collection reward for legendary exploration.',

          reward,

          claimed
            ?'CLAIMED'
            :ready
              ?'CLAIM'
              :'LOCKED',

          ()=>{
            if(
              claimed||
              !ready
            )return;

            P.hubClaims[key]=true;

            addCredits(
              goal===5
                ?2500
                :goal===15
                  ?7500
                  :20000
            );

            if(goal>=15)
              addMaterial(
                'Boss Core',
                goal===15
                  ?3
                  :10
              );

            SFX.core();

            toast(
              'MUSEUM MILESTONE',
              goal+
              ' world relics archived.'
            );

            refresh();
          },

          claimed||
          !ready
        )
      );
    }

    for(const id of WORLD_ORDER){
      body.appendChild(
        hubFacilityCard(
          worldRelicName(id),

          P.worldRelics[id]
            ?'Recovered from the Legendary Hunt in '+
             WORLDS[id].name+
             '.'
            :'Unknown relic signature. Defeat this world’s Legendary Hunt to recover it.',

          P.worldRelics[id]
            ?'ARCHIVED'
            :'MISSING'
        )
      );
    }


  }else{
    title.textContent='Trophy Archive';
    sub.textContent='YOUR MULTIVERSE RECORD';

    const pets=
      Object.keys(
        PET_STATE.owned
      ).length,

      totalPets=
        Object.values(
          PET_ROSTERS
        ).reduce(
          (n,a)=>
            n+a.length,
          0
        ),

      weapons=
        Object.keys(
          allWeapons()
        ).filter(
          weaponOwned
        ).length;

    const stats=[
      [
        'World Cores Recovered',
        G.completed.size+
        ' / '+
        WORLD_ORDER.length
      ],
      [
        'Pets Discovered',
        pets+
        ' / '+
        totalPets
      ],
      [
        'Weapons Unlocked',
        weapons+
        ' / '+
        Object.keys(
          allWeapons()
        ).length
      ],
      [
        'Fusion Weapons',
        Object.keys(
          P.fusedWeapons||{}
        ).length
      ],
      [
        'Hidden Secrets',
        G.easterEggs.size+
        ' / '+
        EASTER_TOTAL
      ],
      [
        'Riftwalker Level',
        'LV '+P.level
      ]
    ];

    for(const[a,b] of stats)
      body.appendChild(
        hubFacilityCard(
          a,
          'Archive record synchronized with your current save.',
          b
        )
      );
  }
}


/* =========================================================
   RIFT TOWER
   ========================================================= */

function startRiftTower(){
  closeAllOverlays();
  ensureHubProgress();

  P.longTerm.tower.runs++;

  G.scene='tower';

  G.towerFloor=
    Math.max(
      1,
      Math.floor(
        (
          P.longTerm.tower.best||
          0
        )/
        5
      )*
      5+
      1
    );

  G.towerClearing=false;

  P.activeAnomaly=null;
  P.masteryTrialWorld=null;

  P.x=260;
  P.y=535;
  P.jump=0;
  P.vx=0;
  P.depthV=0;
  P.hp=getStats().maxHP;

  spawnTowerFloor();
}


function spawnTowerFloor(){
  const f=
    G.towerFloor,

    id=
      WORLD_ORDER[
        (f-1)%
        WORLD_ORDER.length
      ];

  G.worldId=id;
  G.enemies=[];
  G.pickups=[];
  G.towerBossDown=false;

  MUSIC.setWorld(id);
  MUSIC.endBoss();

  const boss=
    f%5===0,

    count=
      boss
        ?1
        :Math.min(
          8,
          2+
          Math.floor(
            f/4
          )
        );

  if(boss){
    spawnEnemy(
      id,
      920,
      510,
      true
    );

    const e=
      G.enemies[
        G.enemies.length-1
      ];

    e.hp=
      Math.round(
        e.hp*
        (
          1+
          f*.035
        )
      );

    e.maxHP=e.hp;

    e.damage=
      Math.round(
        e.damage*
        (
          1+
          f*.018
        )
      );

  }else{
    for(let i=0;i<count;i++){
      spawnEnemy(
        id,
        650+i*70,
        470+(i%3)*45,
        false,
        f>8&&i%4===0
      );

      const e=
        G.enemies[
          G.enemies.length-1
        ];

      e.hp=
        Math.round(
          e.hp*
          (
            1+
            f*.045
          )
        );

      e.maxHP=e.hp;

      e.damage=
        Math.round(
          e.damage*
          (
            1+
            f*.018
          )
        );
    }
  }

  quest(
    'RIFT TOWER · FLOOR '+f,

    (
      boss
        ?'BOSS FLOOR · '
        :''
    )+
    WORLDS[id].name+
    ' · defeat everything to climb.'
  );

  toast(
    'RIFT TOWER',
    'Floor '+
    f+
    (
      boss
        ?' · BOSS FLOOR'
        :''
    )
  );
}


function finishTowerFloor(){
  if(G.towerClearing)
    return;

  G.towerClearing=true;

  const f=
    G.towerFloor,

    boss=
      f%5===0,

    reward=
      70+
      f*18;

  addCredits(reward);

  const tokens=
    boss
      ?3
      :1;

  P.riftTokens+=tokens;

  P.longTerm.tower.tokens=
    P.riftTokens;

  P.longTerm.tower.best=
    Math.max(
      P.longTerm.tower.best||
      0,
      f
    );

  if(boss)
    addMaterial(
      'Boss Core',
      1
    );

  setTimeout(
    ()=>{
      if(G.scene!=='tower')
        return;

      G.towerFloor++;
      G.towerClearing=false;

      P.hp=
        Math.min(
          getStats().maxHP,
          P.hp+
          Math.round(
            getStats().maxHP*
            .18
          )
        );

      P.x=260;
      P.y=535;

      spawnTowerFloor();
    },
    650
  );
}


function updateRiftTower(dt){
  updatePlayer(
    dt,
    1180
  );

  updateCombatStyle(dt);
  updateEnemies(dt);

  if(
    !G.enemies.some(
      e=>
        e.alive&&
        e.world===G.worldId
    )
  )
    finishTowerFloor();
}


/* =========================================================
   BOSS RUSH
   ========================================================= */

function startBossRush(){
  const worlds=
    WORLD_ORDER.filter(
      id=>
        G.completed.has(id)
    );

  if(!worlds.length)
    return;

  closeAllOverlays();

  G.scene='bossrush';

  G.bossRushWorlds=worlds;
  G.bossRushIndex=0;
  G.bossRushBossDown=false;

  P.x=260;
  P.y=535;
  P.jump=0;
  P.hp=getStats().maxHP;

  spawnBossRushBoss();
}


function spawnBossRushBoss(){
  if(
    G.bossRushIndex>=
    G.bossRushWorlds.length
  ){
    P.longTerm
      .bossRush
      .clears=
        (
          P.longTerm
            .bossRush
            .clears||
          0
        )+
        1;

    P.riftTokens+=10;

    P.longTerm.tower.tokens=
      P.riftTokens;

    addCredits(
      2500+
      G.bossRushWorlds.length*
      180
    );

    addMaterial(
      'Boss Core',
      3
    );

    SFX.core();

    beginHub();

    toast(
      'BOSS RUSH COMPLETE',
      'Full clear! +10 Rift Tokens and 3 Boss Cores.',
      5
    );

    return;
  }

  const id=
    G.bossRushWorlds[
      G.bossRushIndex
    ];

  G.worldId=id;
  G.enemies=[];
  G.pickups=[];
  G.bossRushBossDown=false;

  MUSIC.endBoss();
  MUSIC.setWorld(id);

  spawnEnemy(
    id,
    920,
    510,
    true
  );

  const e=
    G.enemies[0],

    scale=
      1+
      G.bossRushIndex*.08;

  e.hp=
    Math.round(
      e.hp*
      scale
    );

  e.maxHP=e.hp;

  e.damage=
    Math.round(
      e.damage*
      (
        1+
        G.bossRushIndex*.035
      )
    );

  quest(
    'BOSS RUSH · '+
    (
      G.bossRushIndex+1
    )+
    ' / '+
    G.bossRushWorlds.length,

    WORLDS[id].boss+
    ' · no checkpoints.'
  );
}


function updateBossRush(dt){
  updatePlayer(
    dt,
    1180
  );

  updateCombatStyle(dt);
  updateEnemies(dt);

  if(
    G.bossRushBossDown&&
    !G.enemies.some(
      e=>
        e.alive&&
        e.world===G.worldId
    )
  ){
    G.bossRushBossDown=false;
    G.bossRushIndex++;

    P.longTerm
      .bossRush
      .best=
        Math.max(
          P.longTerm
            .bossRush
            .best||
          0,
          G.bossRushIndex
        );

    P.hp=
      Math.min(
        getStats().maxHP,
        P.hp+
        Math.round(
          getStats().maxHP*
          .16
        )
      );

    P.riftTokens+=1;

    P.longTerm.tower.tokens=
      P.riftTokens;

    setTimeout(
      ()=>{
        if(
          G.scene===
          'bossrush'
        )
          spawnBossRushBoss();
      },
      550
    );
  }
}


function drawEndlessMode(
  label,
  sub
){
  const w=
    WORLDS[G.worldId]||
    WORLDS.earth;

  drawWorldBackground(
    w,
    0
  );

  drawWorldAmbience(
    w,
    0
  );

  ctx.save();

  ctx.fillStyle=
    'rgba(7,13,25,.35)';

  ctx.fillRect(
    0,
    0,
    W,
    H
  );

  ctx.restore();

  for(const e of G.enemies)
    if(
      e.alive&&
      e.world===G.worldId
    )
      drawEnemy(
        e,
        0
      );

  if(activePet())
    drawFollowerPet(0);

  if(P.droneLevel>0)
    drawSupportDrone(0);

  drawRiftwalker(
    P.x,
    P.y-P.jump,
    1,
    false
  );

  ctx.save();

  rr(
    ctx,
    420,
    30,
    440,
    54,
    14,
    'rgba(5,14,27,.84)',
    'rgba(120,235,255,.32)',
    2
  );

  ctx.fillStyle='#eafcff';
  ctx.font='900 18px system-ui';
  ctx.textAlign='center';

  ctx.fillText(
    label,
    640,
    53
  );

  ctx.fillStyle='#9ec4d8';
  ctx.font='800 10px system-ui';

  ctx.fillText(
    sub,
    640,
    72
  );

  ctx.textAlign='left';

  ctx.restore();

  drawCinematicGrade();
}
function renderWorldMap(){
  const grid=$('worldGrid');grid.innerHTML='';
  for(const id of WORLD_ORDER){
    const w=WORLDS[id],unlocked=G.unlocked.has(id),hidden=id==='matrix'&&!G.unlocked.has('matrix'),card=document.createElement('div');
    card.className='worldCard '+(!unlocked?'locked ':'')+(G.completed.has(id)?'completed ':'')+(G.corruptionAwakened?'corruptionAvailable ':'')+(G.corruptedCompleted.has(id)?'corruptionCleared':'');card.dataset.world=id;
    const orb=document.createElement('div');orb.className='worldOrb';orb.style.background=`radial-gradient(circle at 30% 25%,${w.accent},${w.skyB} 45%,${w.dark})`;card.appendChild(orb);
    const worldNo=worldNumber(id),count=segmentCount(id),stageText=`${worldNo}-1 → ${worldNo}-${count}`;
    card.insertAdjacentHTML('beforeend',`<h4>${hidden?'( ........ ...... )':w.name}</h4><div class="segmentRange">${hidden?'?':count} SEGMENTS · ${hidden?'?-? → ?-?':stageText}</div><p>${hidden?'Signal corrupted.':w.desc}</p>${G.corruptionAwakened&&unlocked?`<div class="corruptionStatus">${G.corruptedCompleted.has(id)?'CORRUPTED MODE CLEARED':'OPTIONAL CORRUPTED MODE'}</div>`:''}${G.masterModeUnlocked&&unlocked?`<div class="masterStatus">${G.masterCompleted.has(id)?'MASTER MODE CLEARED':'MASTER MODE AVAILABLE'}</div>`:''}`);
    const btn=document.createElement('button');btn.textContent=unlocked?'NORMAL':'LOCKED';btn.disabled=!unlocked;btn.onclick=()=>travelTo(id);card.appendChild(btn);
    if(G.corruptionAwakened&&unlocked){const cb=document.createElement('button');cb.className='corruptedTravelBtn';cb.textContent=G.corruptedCompleted.has(id)?'REPLAY CORRUPTED':'ENTER CORRUPTED';cb.onclick=()=>travelToCorrupted(id);card.appendChild(cb)}
    if(G.masterModeUnlocked&&unlocked){const mb=document.createElement('button');mb.className='masterTravelBtn';mb.textContent=G.masterCompleted.has(id)?'REPLAY MASTER':'ENTER MASTER';mb.onclick=()=>travelToMaster(id);card.appendChild(mb)}
    grid.appendChild(card);
  }

  if(G.completed.size>=WORLD_ORDER.length){
    const w=WORLDS.corruptrealm,card=document.createElement('div');card.className='worldCard corruptedRealmCard '+(G.corruptedRealmCleared?'completed':'');card.dataset.world='corruptrealm';
    const orb=document.createElement('div');orb.className='worldOrb corruptedOrb';orb.style.background=`radial-gradient(circle at 32% 28%,#ff6bdd,#7d20a8 42%,#09000e 76%)`;card.appendChild(orb);
    card.insertAdjacentHTML('beforeend',`<h4>THE CORRUPTED REALM</h4><div class="segmentRange">10 SEGMENTS · 32-1 → 32-10</div><p>${G.corruptedRealmCleared?'The Heart is gone. Normal worlds remain safe; optional Corrupted Mode is now available.':'A forbidden 32nd signal appeared after the Perfect Matrix fell.'}</p><div class="corruptionStatus">${G.corruptedRealmCleared?'CORRUPTED MODE UNLOCKED':'POSTGAME WORLD'}</div>`);
    const btn=document.createElement('button');btn.className='corruptedTravelBtn';btn.textContent=G.corruptedRealmCleared?'REVISIT REALM':'ENTER FORBIDDEN REALM';btn.onclick=()=>travelTo('corruptrealm');card.appendChild(btn);grid.appendChild(card);
  }

  if(P.corruptionMaster){
    const w=WORLDS.godrealm,card=document.createElement('div');card.className='worldCard godRealmCard '+(G.landOfGodsCleared?'completed':'');card.dataset.world='godrealm';
    const orb=document.createElement('div');orb.className='worldOrb godOrb';orb.style.background='radial-gradient(circle at 32% 28%,#ffffff,#ffe88a 34%,#75cfff 62%,#1a2850 82%)';card.appendChild(orb);
    card.insertAdjacentHTML('beforeend',`<h4>THE LAND OF GODS</h4><div class="segmentRange">10 SEGMENTS · 33-1 → 33-10</div><p>${G.landOfGodsCleared?'Astraeus has fallen. Master Mode has awakened across all 31 worlds.':'A celestial 33rd signal appeared after you became the Corruption Master.'}</p><div class="masterStatus">${G.landOfGodsCleared?'MASTER MODE AWAKENED':'DIVINE ENDGAME WORLD'}</div>`);
    const btn=document.createElement('button');btn.className='masterTravelBtn';btn.textContent=G.landOfGodsCleared?'REVISIT LAND OF GODS':'ENTER THE PANTHEON';btn.onclick=()=>travelTo('godrealm');card.appendChild(btn);grid.appendChild(card);
  }
}

function saveGame(){
  const data={
    G:{
      hubFound:G.hubFound,
      unlocked:[...G.unlocked],
      completed:[...G.completed],
      corruptedCompleted:[...G.corruptedCompleted],
      corruptedProgress:G.corruptedProgress,
      corruptionAwakened:G.corruptionAwakened,
      corruptedRealmCleared:G.corruptedRealmCleared,
      landOfGodsCleared:G.landOfGodsCleared,
      masterModeUnlocked:G.masterModeUnlocked,
      masterCompleted:[...G.masterCompleted],
      masterProgress:G.masterProgress,
      cores:G.cores,
      easterEggs:[...G.easterEggs],
      tutorialDone:G.tutorialDone,
      progress:G.progress,
      scene:G.scene,
      worldId:G.worldId
    },
    P:{
      ...P,
      anim:undefined
    },
    pets:PET_STATE,
    armors:Object.fromEntries(
      Object.entries(ARMORS).map(
        ([k,v])=>[k,!!v.owned]
      )
    )
  };

  localStorage.setItem(
    'multiverse_riftwalker_v4',
    JSON.stringify(data)
  );

  $('saveStatus').textContent='Game saved.';

  toast(
    'SYSTEM',
    'Game saved.'
  );
}

function loadGame(){
  const raw=localStorage.getItem('multiverse_riftwalker_v4');

  if(!raw){
    $('saveStatus').textContent='No save found.';
    return false;
  }

  try{
    const d=JSON.parse(raw);

    G.hubFound=d.G.hubFound;
    G.unlocked=new Set(d.G.unlocked);
    G.completed=new Set(d.G.completed);

    G.corruptedCompleted=
      new Set(
        d.G.corruptedCompleted||[]
      );

    G.corruptedProgress=
      d.G.corruptedProgress||{};

    G.corruptionAwakened=
      !!d.G.corruptionAwakened;

    G.corruptedRealmCleared=
      !!d.G.corruptedRealmCleared;

    G.landOfGodsCleared=
      !!d.G.landOfGodsCleared;

    G.masterModeUnlocked=
      !!d.G.masterModeUnlocked;

    G.masterCompleted=
      new Set(
        d.G.masterCompleted||[]
      );

    G.masterProgress=
      d.G.masterProgress||{};

    G.cores=d.G.cores;

    G.easterEggs=
      new Set(
        d.G.easterEggs||[]
      );

    G.tutorialDone=
      !!d.G.tutorialDone;

    G.tutorialActive=false;
    G.tutorialStep=0;

    G.progress=d.G.progress;

    Object.assign(P,d.P);

    P.weaponsOwned=
      P.weaponsOwned||{};

    P.fusedWeapons=
      P.fusedWeapons||{};

    P.fusedArmors=
      P.fusedArmors||{};

    P.fusedPetGear=
      P.fusedPetGear||{};

    P.masterRun=false;

    ensureHubProgress();

    for(const id of WORLD_ORDER){
      G.progress[id]=
        G.progress[id]||
        freshProgress();

      G.progress[id].chests=
        G.progress[id].chests||
        [];

      G.progress[id].segmentRewards=
        G.progress[id].segmentRewards||
        [];

      G.corruptedProgress[id]=
        G.corruptedProgress[id]||
        freshProgress();

      G.masterProgress[id]=
        G.masterProgress[id]||
        freshProgress();
    }

    G.progress.corruptrealm=
      G.progress.corruptrealm||
      freshProgress();

    G.progress.godrealm=
      G.progress.godrealm||
      freshProgress();

    if(P.weapon)
      P.weaponsOwned[P.weapon]=true;

    for(const name of Object.keys(P.fusedWeapons))
      P.weaponsOwned[name]=true;

    for(const wid of G.completed){
      for(const [wn,ww] of Object.entries(WEAPONS))
        if(ww.world===wid)
          P.weaponsOwned[wn]=true;
    }

    P.baseMaxHP=1000;
    P.baseCritChance=P.baseCritChance??.10;
    P.baseCritDamage=P.baseCritDamage??2;

    P.anim={
      state:'idle',
      time:0
    };

    Object.assign(
      PET_STATE,
      d.pets
    );

    for(const pet of Object.values(PET_STATE.owned||{})){
      ensurePetGearState(pet);

      if(pet?.fused)
        ensureFusedPetDefinition(pet);
    }

    for(const name of Object.keys(PET_STATE.owned||{})){
      if(isCorruptedPet(name)){
        const base=name.slice(10);

        const world=
          Object.keys(PET_ROSTERS).find(
            w=>
              (PET_ROSTERS[w]||[])
                .includes(base)
          )||
          'void';

        ensureCorruptedPetDefinition(
          name,
          base,
          world
        );
      }
    }

    for(const [k,v] of Object.entries(d.armors||{}))
      if(ARMORS[k])
        ARMORS[k].owned=v;

    $('startScreen')
      .classList
      .add('hidden');

    $('hud')
      .classList
      .remove('hidden');

    closeAllOverlays();

    MUSIC.start();

    if(
      [
        'hub',
        'tower',
        'bossrush'
      ].includes(d.G.scene)
    ){
      beginHub();

    }else{
      STAGE_RUN.restarting=true;

      beginWorld(
        d.G.worldId||
        'earth'
      );

      STAGE_RUN.restarting=false;
    }

    P.hp=
      clamp(
        P.hp,
        1,
        getStats().maxHP
      );

    syncHUD();

    return true;

  }catch(err){
    console.error(err);

    $('saveStatus').textContent=
      'Save could not be loaded.';

    return false;
  }
}


/* =========================================================
   PARTICLES / TEXT
   ========================================================= */

function burst(x,y,color,n=8){
  for(let i=0;i<n;i++)
    G.particles.push({
      kind:'particle',
      x,
      y,
      vx:rand(-120,120),
      vy:rand(-180,20),
      life:rand(.25,.7),
      max:.7,
      color,
      size:rand(2,6)
    });
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
  for(const p of G.particles){
    p.life-=dt;
    p.x+=p.vx*dt;
    p.y+=p.vy*dt;

    if(p.kind==='particle')
      p.vy+=260*dt;
  }

  G.particles=
    G.particles.filter(
      p=>p.life>0
    );
}


/* =========================================================
   DRAWING HELPERS / SHADING
   ========================================================= */

function rr(c,x,y,w,h,r,fill,stroke,lw=2){
  c.beginPath();
  c.roundRect(x,y,w,h,r);

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

function ellipse(c,x,y,rx,ry,fill,stroke,lw=2){
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

  ctx.translate(x,y);
  ctx.scale(1,h/w);

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

function space(off=0){
  ctx.fillStyle='#02050d';
  ctx.fillRect(0,0,W,H);

  for(let i=0;i<150;i++){
    const x=
      (
        i*89.7+
        off*
        (
          .08+
          (i%4)*.03
        )
      )%W,

      y=
        (i*47.2)%H;

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

function drawPlanet(x,y,r,a,b){
  const g=
    ctx.createRadialGradient(
      x-r*.3,
      y-r*.35,
      5,
      x,
      y,
      r
    );

  g.addColorStop(0,a);
  g.addColorStop(.45,b);
  g.addColorStop(1,'#0a1022');

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


function drawShip(x,y,s=1,rot=0){
  const t=G.time||0;

  const flying=
    [
      'flight',
      'travel',
      'crash'
    ].includes(G.scene);

  const wrecked=
    G.scene==='world'&&
    G.worldId==='earth'&&
    s<1;

  const engineOn=
    flying&&
    (!wrecked)&&
    (
      G.scene!=='crash'||
      Math.sin(t*19)>-.35
    );

  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(rot);
  ctx.scale(s,s);

  // Engine glow and exhaust sit behind the hull.
  if(engineOn){
    const pulse=
      .82+
      Math.sin(t*18)*.12;

    ctx.save();

    ctx.globalCompositeOperation=
      'lighter';

    for(const ey of[-22,22]){
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

  // Soft ship shadow / silhouette glow.
  ctx.shadowColor=
    'rgba(76,220,255,.32)';

  ctx.shadowBlur=22;

  // Rear wings.
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
  ctx.strokeStyle='#172438';
  ctx.lineWidth=5;
  ctx.lineJoin='round';

  ctx.beginPath();

  ctx.moveTo(-72,-17);
  ctx.lineTo(-35,-72);
  ctx.lineTo(35,-43);
  ctx.lineTo(10,-12);

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();

  ctx.moveTo(-72,17);
  ctx.lineTo(-35,72);
  ctx.lineTo(35,43);
  ctx.lineTo(10,12);

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Main armored fuselage.
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
  ctx.strokeStyle='#172438';
  ctx.lineWidth=6;

  ctx.beginPath();

  ctx.moveTo(-105,0);

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

  // Red Riftwalker identity stripe.
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
  ctx.strokeStyle='#7b2332';
  ctx.lineWidth=3;

  ctx.beginPath();

  ctx.moveTo(-92,-16);
  ctx.lineTo(-25,-25);
  ctx.lineTo(18,-17);
  ctx.lineTo(-2,-4);
  ctx.lineTo(-90,8);

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cockpit canopy.
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
  ctx.strokeStyle='#17304a';
  ctx.lineWidth=5;

  ctx.beginPath();

  ctx.moveTo(7,-29);

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
  ctx.strokeStyle='#e9ffff';
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

  // Nose armor and cyan Rift Core.
  ctx.fillStyle='#25394f';

  ctx.beginPath();

  ctx.moveTo(92,-17);
  ctx.lineTo(122,0);
  ctx.lineTo(92,17);
  ctx.lineTo(77,7);

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.save();

  ctx.translate(-10,5);
  ctx.rotate(Math.PI/4);

  ctx.shadowColor='#64efff';
  ctx.shadowBlur=18;

  ctx.fillStyle='#dfffff';
  ctx.strokeStyle='#4dcbe7';
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

  // Twin engine housings.
  for(const ey of[-22,22]){
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

  // Panel seams and small running lights.
  ctx.strokeStyle=
    'rgba(28,49,70,.65)';

  ctx.lineWidth=2;

  ctx.beginPath();

  ctx.moveTo(-46,-32);
  ctx.lineTo(-31,30);

  ctx.moveTo(2,-39);
  ctx.lineTo(13,31);

  ctx.stroke();

  for(
    const[
      lx,
      ly,
      c
    ] of[
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

  // Landing gear and crash damage only on the Earth wreck.
  if(wrecked){
    ctx.strokeStyle='#1a2636';
    ctx.lineWidth=6;

    ctx.beginPath();

    ctx.moveTo(-38,32);
    ctx.lineTo(-48,54);

    ctx.moveTo(48,29);
    ctx.lineTo(58,52);

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

    ctx.strokeStyle='#56353a';
    ctx.lineWidth=4;

    ctx.beginPath();

    ctx.moveTo(35,-5);
    ctx.lineTo(52,10);
    ctx.lineTo(39,21);

    ctx.moveTo(-18,-35);
    ctx.lineTo(-4,-19);

    ctx.stroke();

    ctx.save();

    ctx.globalAlpha=
      .28+
      .12*
      Math.sin(t*2.4);

    for(let i=0;i<4;i++){
      const sx=
        -74+
        i*9,

        sy=
          -43-
          i*13-
          (
            t*8%
            (
              18+
              i*5
            )
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


function drawMiniRiftwalker(c,x,y,s=.5){
  c.save();
  c.translate(x,y);
  c.scale(s,s);

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
    P.scarfColor||
    '#e94759';

  c.beginPath();

  c.moveTo(-18,-55);
  c.lineTo(-65,-45);
  c.lineTo(-25,-30);

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


/* =========================================================
   ROUGH ANIMATION COMBAT LOOK
   Inspired by hand-drawn keyframe fight animation: strong poses,
   pencil-line boil, smear frames, speed lines and readable impacts.
   ========================================================= */

function sketchRand(seed){
  const frame=
    Math.floor(
      G.time*12
    );

  const v=
    Math.sin(
      seed*12.9898+
      frame*78.233
    )*
    43758.5453;

  return(
    v-
    Math.floor(v)
  )-.5;
}


function sketchLine(
  c,
  x1,
  y1,
  x2,
  y2,
  color='rgba(17,25,38,.58)',
  width=2,
  passes=2,
  jitter=1.35,
  seed=1
){
  c.save();

  c.strokeStyle=color;
  c.lineCap='round';
  c.lineJoin='round';

  for(let i=0;i<passes;i++){
    const jx=
      sketchRand(
        seed+i*7
      )*
      jitter,

      jy=
        sketchRand(
          seed+i*11
        )*
        jitter;

    c.globalAlpha=
      i===0
        ?.72
        :.28;

    c.lineWidth=
      Math.max(
        .7,
        width-
        (i*.35)
      );

    c.beginPath();

    c.moveTo(
      x1+jx,
      y1+jy
    );

    c.lineTo(
      x2-jx*.5,
      y2-jy*.5
    );

    c.stroke();
  }

  c.restore();
}


function weaponMotionFamily(style='sword'){
  if(
    [
      'hammer',
      'maul',
      'mallet',
      'axe',
      'club',
      'bat',
      'mace',
      'morningstar',
      'flail',
      'greatsword',
      'cleaver',
      'chainsaw'
    ].includes(style)
  )
    return 'heavy';

  if(
    [
      'spear',
      'glaive',
      'trident',
      'halberd',
      'lance',
      'harpoon',
      'bostaff',
      'staff'
    ].includes(style)
  )
    return 'pole';

  if(
    [
      'blaster',
      'rifle',
      'pistol',
      'launcher',
      'cannon',
      'bow',
      'crossbow',
      'blowgun',
      'orb',
      'wand'
    ].includes(style)
  )
    return 'ranged';

  if(
    [
      'nunchucks',
      'tonfa',
      'sai',
      'fans',
      'sickles',
      'knuckles',
      'gauntlets',
      'claws'
    ].includes(style)
  )
    return 'martial';

  if(
    [
      'whip',
      'kusarigama',
      'chainblade',
      'yoyo'
    ].includes(style)
  )
    return 'chain';

  return 'blade';
}


function combatPose(
  family,
  index,
  phase
){
  const p=
    Math.max(
      0,
      Math.min(
        1,
        phase
      )
    );

  const ease=
    p*p*
    (
      3-
      2*p
    );

  let pose={
    lean:0,
    crouch:0,
    head:0,
    rx:42,
    ry:-60,
    lx:-42,
    ly:-58,
    angle:-.35,
    reach:0
  };

  if(family==='heavy'){
    pose.lean=.10;

    pose.crouch=
      7*
      Math.sin(
        Math.PI*p
      );

    pose.rx=
      36+
      58*ease;

    pose.ry=
      -122+
      94*ease;

    pose.lx=-15;
    pose.ly=-76;

    pose.angle=
      -1.72+
      2.35*ease;

    pose.head=-.08;

  }else if(family==='pole'){
    pose.lean=
      -.08+
      ease*.18;

    pose.rx=
      38+
      74*ease;

    pose.ry=-73;

    pose.lx=
      2+
      38*ease;

    pose.ly=-67;

    pose.angle=
      -1.45+
      1.55*ease;

    pose.reach=18;

  }else if(family==='ranged'){
    const recoil=
      Math.sin(
        Math.PI*p
      )*
      10;

    pose.lean=-.06;

    pose.rx=
      62-
      recoil;

    pose.ry=-72;

    pose.lx=
      30-
      recoil*.5;

    pose.ly=-67;
    pose.angle=-1.53;
    pose.head=-.04;

  }else if(family==='martial'){
    const spin=
      Math.sin(
        p*
        Math.PI*
        2+
        (index||0)*1.7
      );

    pose.lean=
      spin*.10;

    pose.crouch=
      5*
      Math.sin(
        Math.PI*p
      );

    pose.rx=
      48+
      34*
      Math.sin(
        p*Math.PI
      );

    pose.ry=
      -66-
      38*
      Math.cos(
        p*
        Math.PI*
        2
      );

    pose.lx=
      -30+
      24*
      Math.cos(
        p*
        Math.PI*
        2
      );

    pose.ly=
      -60+
      28*
      Math.sin(
        p*
        Math.PI*
        2
      );

    pose.angle=
      -1.4+
      p*3.5+
      (index||0)*.6;

  }else if(family==='chain'){
    pose.lean=
      .08*
      Math.sin(
        p*
        Math.PI*
        2
      );

    pose.rx=
      54+
      24*
      Math.sin(
        p*Math.PI
      );

    pose.ry=
      -76-
      28*
      Math.cos(
        p*
        Math.PI*
        2
      );

    pose.lx=-25;
    pose.ly=-68;

    pose.angle=
      -1.6+
      p*4.4;

  }else{
    if(index===0){
      pose.lean=.10;

      pose.rx=
        45+
        40*ease;

      pose.ry=
        -116+
        72*ease;

      pose.lx=-30;
      pose.ly=-72;

      pose.angle=
        -1.75+
        2.15*ease;

    }else if(index===1){
      pose.lean=
        -.10+
        ease*.18;

      pose.rx=
        34+
        58*ease;

      pose.ry=
        -42-
        46*ease;

      pose.lx=-26;
      pose.ly=-74;

      pose.angle=
        .72-
        2.3*ease;

    }else{
      pose.lean=
        .16*
        Math.sin(
          p*
          Math.PI*
          2
        );

      pose.crouch=
        8*
        Math.sin(
          Math.PI*p
        );

      pose.rx=
        52+
        35*
        Math.sin(
          p*Math.PI
        );

      pose.ry=-82;
      pose.lx=-12;
      pose.ly=-82;

      pose.angle=
        -1.95+
        p*4.6;
    }
  }

  return pose;
}


function drawWeaponSmear(
  c,
  w,
  family,
  phase,
  index
){
  if(!w)return;

  c.save();

  c.globalAlpha=
    .18+
    .26*
    Math.sin(
      Math.PI*
      Math.min(
        1,
        phase
      )
    );

  c.strokeStyle=w.accent;
  c.shadowColor=w.color;
  c.shadowBlur=18;
  c.lineCap='round';

  if(family==='ranged'){
    c.lineWidth=4;

    for(let i=0;i<4;i++){
      c.beginPath();

      c.moveTo(
        55+i*9,
        -72+i*2
      );

      c.lineTo(
        150+i*18,
        -72+i*2
      );

      c.stroke();
    }

  }else if(
    family==='martial'||
    family==='chain'
  ){
    c.lineWidth=4;

    for(let i=0;i<3;i++){
      c.beginPath();

      c.arc(
        28,
        -70,
        54+i*14,
        -2.4+
        phase*2.4,
        -.2+
        phase*2.4
      );

      c.stroke();
    }

  }else if(family==='pole'){
    c.lineWidth=5;

    for(let i=0;i<3;i++){
      c.beginPath();

      c.moveTo(
        45,
        -86+i*7
      );

      c.lineTo(
        160,
        -86+i*7
      );

      c.stroke();
    }

  }else{
    c.lineWidth=
      family==='heavy'
        ?13
        :index===2
          ?10
          :6;

    for(let i=0;i<3;i++){
      c.beginPath();

      c.arc(
        18,
        -72,
        72+i*15,
        -2.25+
        phase*.65,
        .55+
        phase*.65
      );

      c.stroke();
    }
  }

  c.restore();
}


function drawRiftwalker(
  x,
  y,
  scale=1,
  remote=false
){
  const t=G.time,

        run=
          P.anim.state==='run'
            ?Math.sin(
              P.anim.time*14
            )
            :0,

        idle=
          Math.sin(t*3)*2,

        attack=
          P.attackTimer>0,

        ai=
          P.attackIndex;

  const weapon=
    remote
      ?WEAPONS['Nova Sword']
      :(
        getWeapon()||
        WEAPONS['Nova Sword']
      );

  const family=
    weaponMotionFamily(
      weapon?.style
    );

  const animMax=
    P.attackAnimMax||
    .25;

  const phase=
    attack
      ?clamp(
        1-
        P.attackTimer/
        animMax,
        0,
        1
      )
      :0;

  const pose=
    attack
      ?combatPose(
        family,
        ai,
        phase
      )
      :{
        lean:run*.035,
        crouch:0,
        head:run*.02,
        rx:42,
        ry:-60,
        lx:-42,
        ly:-58,
        angle:-.35,
        reach:0
      };

  const dashLean=
    P.dashTimer>0
      ?.18
      :0;

  ctx.save();

  ctx.translate(x,y);

  ctx.scale(
    P.facing*scale,
    scale
  );

  ctx.rotate(
    pose.lean+
    dashLean
  );

  if(
    !remote&&
    P.hitFlash>0
  )
    ctx.globalAlpha=
      .55+
      Math.sin(t*70)*.35;

  // Rough animation after-image / smear silhouette.
  if(
    attack||
    P.dashTimer>0
  ){
    ctx.save();

    ctx.globalAlpha=.11;

    ctx.translate(
      -P.facing*
      (
        attack
          ?18
          :34
      ),
      4
    );

    ctx.strokeStyle=
      weapon?.color||
      '#75eaff';

    ctx.lineWidth=6;

    ctx.beginPath();

    ctx.ellipse(
      0,
      -82,
      39,
      76,
      0,
      0,
      Math.PI*2
    );

    ctx.stroke();
    ctx.restore();
  }

  shadow(
    0,
    8,
    62,
    14,
    .28
  );

  const leg=
    run*12,

    crouch=
      pose.crouch;

  ctx.strokeStyle='#182333';
  ctx.lineWidth=14;
  ctx.lineCap='round';

  ctx.beginPath();

  ctx.moveTo(
    -11,
    -35+crouch
  );

  ctx.lineTo(
    -18-leg,
    0
  );

  ctx.moveTo(
    11,
    -35+crouch
  );

  ctx.lineTo(
    18+leg,
    0
  );

  ctx.stroke();

  ellipse(
    ctx,
    -21-leg,
    4,
    23,
    10,
    '#d94859',
    '#182333',
    4
  );

  ellipse(
    ctx,
    21+leg,
    4,
    23,
    10,
    '#d94859',
    '#182333',
    4
  );

  sketchLine(
    ctx,
    -12,
    -34+crouch,
    -19-leg,
    0,
    'rgba(13,20,31,.65)',
    2,
    2,
    1.7,
    11
  );

  sketchLine(
    ctx,
    12,
    -34+crouch,
    19+leg,
    0,
    'rgba(13,20,31,.65)',
    2,
    2,
    1.7,
    17
  );

  const body=
    ctx.createLinearGradient(
      -30,
      -95,
      30,
      -25
    );

  body.addColorStop(
    0,
    '#627d99'
  );

  body.addColorStop(
    .45,
    '#2a4261'
  );

  body.addColorStop(
    1,
    '#10192a'
  );

  rr(
    ctx,
    -29,
    -96+idle+crouch,
    58,
    65,
    22,
    body,
    '#182333',
    6
  );

  rr(
    ctx,
    -35,
    -88+idle+crouch,
    18,
    25,
    8,
    '#3c587b',
    '#172131',
    4
  );

  rr(
    ctx,
    17,
    -88+idle+crouch,
    18,
    25,
    8,
    '#3c587b',
    '#172131',
    4
  );

  // Extra pencil construction strokes make the sprite feel hand-drawn instead of vector-perfect.
  sketchLine(
    ctx,
    -26,
    -93+crouch,
    22,
    -92+crouch,
    'rgba(20,28,42,.5)',
    1.5,
    2,
    1.5,
    31
  );

  sketchLine(
    ctx,
    -23,
    -42+crouch,
    23,
    -45+crouch,
    'rgba(20,28,42,.42)',
    1.3,
    2,
    1.4,
    37
  );

  // Armor silhouette. Fused armor carries two visible energy signatures.
  const equippedArmor=
    getArmor();

  if(P.armor!=='none'){
    ctx.save();

    const ac=
      equippedArmor.color||
      (
        P.armor==='corrupt'
          ?'#ff4fc8'
          :P.armor==='divine'
            ?'#ffe98a'
            :'#72eaff'
      ),

      aa=
        equippedArmor.accent||
        (
          equippedArmor.fused
            ?'#d8b6ff'
            :'#b9f7ff'
        );

    ctx.globalAlpha=
      equippedArmor.fused
        ?.9
        :.55;

    ctx.strokeStyle=ac;

    ctx.lineWidth=
      equippedArmor.fused
        ?5
        :3;

    ctx.shadowColor=ac;

    ctx.shadowBlur=
      equippedArmor.fused
        ?15
        :6;

    rr(
      ctx,
      -33,
      -92+crouch,
      66,
      49,
      18,
      null,
      ac,
      equippedArmor.fused
        ?4
        :2
    );

    rr(
      ctx,
      -42,
      -88+crouch,
      16,
      23,
      7,
      ac,
      '#182333',
      2
    );

    rr(
      ctx,
      26,
      -88+crouch,
      16,
      23,
      7,
      aa,
      '#182333',
      2
    );

    if(equippedArmor.fused){
      ctx.strokeStyle=aa;
      ctx.lineWidth=3;

      ctx.beginPath();

      ctx.moveTo(
        -22,
        -84+crouch
      );

      ctx.lineTo(
        0,
        -48+crouch
      );

      ctx.lineTo(
        22,
        -84+crouch
      );

      ctx.stroke();

      ellipse(
        ctx,
        0,
        -66+crouch,
        7,
        7,
        aa,
        ac,
        2
      );
    }

    ctx.restore();
  }

  ctx.save();

  ctx.translate(
    0,
    -64+idle+crouch
  );

  ctx.rotate(
    Math.PI/4
  );

  ctx.shadowColor='#65eaff';
  ctx.shadowBlur=15;

  ctx.fillStyle='#dffcff';

  ctx.fillRect(
    -7,
    -7,
    14,
    14
  );

  ctx.strokeStyle='#4bbbd8';
  ctx.lineWidth=2;

  ctx.strokeRect(
    -7,
    -7,
    14,
    14
  );

  ctx.restore();

  // Long scarf with frame-to-frame pencil boil and stronger movement during attacks.
  const scarfKick=
    (
      attack
        ?Math.sin(
          phase*Math.PI
        )*28
        :0
    )+
    (
      P.dashTimer>0
        ?34
        :0
    );

  ctx.fillStyle=
    P.scarfColor||
    '#e94759';

  ctx.strokeStyle='#7e2435';
  ctx.lineWidth=4;

  ctx.beginPath();

  ctx.moveTo(
    -18,
    -108+idle+crouch
  );

  ctx.bezierCurveTo(
    -48,
    -118-scarfKick*.15,
    -76-scarfKick,
    -96+run*5,
    -96-scarfKick,
    -82+run*9
  );

  ctx.lineTo(
    -39,
    -77+idle
  );

  ctx.lineTo(
    -12,
    -88+idle
  );

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  sketchLine(
    ctx,
    -19,
    -106,
    -78-scarfKick,
    -91,
    'rgba(86,28,40,.6)',
    1.7,
    3,
    2.2,
    53
  );

  const rightX=
    pose.rx,

    rightY=
      pose.ry+crouch,

    leftX=
      pose.lx,

    leftY=
      pose.ly+crouch;

  ctx.strokeStyle='#172131';
  ctx.lineWidth=13;

  ctx.beginPath();

  ctx.moveTo(
    -21,
    -80+idle+crouch
  );

  ctx.lineTo(
    leftX,
    leftY+run*6
  );

  ctx.moveTo(
    21,
    -80+idle+crouch
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

  sketchLine(
    ctx,
    -20,
    -80+crouch,
    leftX,
    leftY,
    'rgba(11,18,29,.55)',
    2,
    2,
    1.6,
    61
  );

  sketchLine(
    ctx,
    20,
    -80+crouch,
    rightX,
    rightY,
    'rgba(11,18,29,.55)',
    2,
    2,
    1.6,
    67
  );

  const headY=
    -129+
    idle+
    crouch+
    pose.head*12;

  const head=
    ctx.createRadialGradient(
      -12,
      headY-9,
      3,
      0,
      headY,
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
    '#aeb9c7'
  );

  ellipse(
    ctx,
    0,
    headY,
    42,
    43,
    head,
    '#172131',
    6
  );

  rr(
    ctx,
    -28,
    headY-13,
    56,
    25,
    12,
    '#111b2c',
    '#172131',
    4
  );

  ctx.shadowColor='#62eaff';
  ctx.shadowBlur=12;

  ellipse(
    ctx,
    -12,
    headY,
    6,
    3,
    '#7af1ff'
  );

  ellipse(
    ctx,
    12,
    headY,
    6,
    3,
    '#7af1ff'
  );

  ctx.shadowBlur=0;

  // Rough duplicate head contour like pencil cleanup lines.
  ctx.save();

  ctx.globalAlpha=.22;
  ctx.strokeStyle='#0e1725';
  ctx.lineWidth=1.5;

  ctx.beginPath();

  ctx.ellipse(
    sketchRand(71)*2,
    headY+
    sketchRand(72)*2,
    44,
    45,
    0,
    0,
    Math.PI*2
  );

  ctx.stroke();
  ctx.restore();

  if(
    P.weapon||
    remote
  ){
    ctx.save();

    ctx.translate(
      rightX,
      rightY-run*6
    );

    ctx.rotate(
      pose.angle
    );

    drawWeaponModel(
      ctx,
      weapon,
      1
    );

    ctx.restore();
  }

  if(attack)
    drawWeaponSmear(
      ctx,
      weapon,
      family,
      phase,
      ai
    );

  // Hand-drawn speed strokes around the fighter during attacks and dashes.
  if(
    attack||
    P.dashTimer>0
  ){
    const count=
      attack
        ?8
        :12;

    for(let i=0;i<count;i++){
      const yy=
        -145+
        i*18+
        sketchRand(90+i)*9;

      const len=
        (
          attack
            ?45
            :80
        )+
        i*4;

      sketchLine(
        ctx,
        -75-len,
        yy,
        -72,
        yy+
        sketchRand(120+i)*8,
        'rgba(21,29,41,.35)',
        1.4,
        2,
        2.5,
        100+i
      );
    }
  }

  ctx.restore();
}
function drawWeaponModel(c,w,scale=1){
  if(w?.fused&&!w._fusionPass){
    const primary={...w,fused:false,_fusionPass:true};
    const secondary={
      ...w,
      fused:false,
      _fusionPass:true,
      style:w.secondaryStyle||w.style,
      color:w.accent||w.color,
      accent:w.color
    };

    c.save();

    drawWeaponModel(c,primary,scale);

    c.save();
    c.globalAlpha=.58;
    c.translate(13*scale,-5*scale);
    c.rotate(.20);
    drawWeaponModel(c,secondary,scale*.58);
    c.restore();

    c.save();
    c.scale(scale,scale);
    c.shadowColor=w.accent;
    c.shadowBlur=20;
    c.fillStyle=w.color;
    c.strokeStyle=w.accent;
    c.lineWidth=2;
    c.translate(0,-22);
    c.rotate(Math.PI/4);
    c.fillRect(-7,-7,14,14);
    c.strokeRect(-7,-7,14,14);
    c.restore();

    c.restore();
    return;
  }

  c.save();
  c.scale(scale,scale);
  c.shadowColor=w.color;
  c.shadowBlur=20;
  c.lineCap='round';
  c.lineJoin='round';

  const blade=(len=78,width=7)=>{
    const g=c.createLinearGradient(0,-len,0,6);

    g.addColorStop(0,w.accent);
    g.addColorStop(.35,'#ffffff');
    g.addColorStop(.68,w.color);
    g.addColorStop(1,'#26324a');

    c.fillStyle=g;
    c.strokeStyle='#26324a';
    c.lineWidth=3;

    c.beginPath();
    c.moveTo(-width,-len+10);
    c.lineTo(0,-len);
    c.lineTo(width,-len+10);
    c.lineTo(width-1,7);
    c.lineTo(-width+1,7);
    c.closePath();
    c.fill();
    c.stroke();
  };

  const handle=(y=7,len=30)=>{
    c.shadowBlur=0;

    rr(
      c,-14,y,28,7,4,
      w.color,
      '#26324a',
      3
    );

    rr(
      c,-5,y+6,10,len,4,
      '#26324a',
      '#101827',
      2
    );
  };

  switch(w.style){

    case 'twin':
      blade(66,5);
      handle(5,23);

      c.save();
      c.translate(18,8);
      c.rotate(.35);
      blade(58,4);
      handle(4,19);
      c.restore();
      break;


    case 'spear':
    case 'glaive':
    case 'trident':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';
      c.lineWidth=8;

      c.beginPath();
      c.moveTo(0,30);
      c.lineTo(0,-78);
      c.stroke();

      c.shadowColor=w.color;
      c.shadowBlur=18;
      c.fillStyle=w.color;
      c.strokeStyle='#26324a';
      c.lineWidth=3;

      c.beginPath();

      if(w.style==='trident'){
        c.moveTo(0,-105);
        c.lineTo(9,-78);
        c.lineTo(3,-82);
        c.lineTo(0,-68);
        c.lineTo(-3,-82);
        c.lineTo(-9,-78);
        c.closePath();

      }else{
        c.moveTo(0,-105);
        c.lineTo(13,-77);
        c.lineTo(0,-84);
        c.lineTo(-13,-77);
        c.closePath();
      }

      c.fill();
      c.stroke();
      break;


    case 'hammer':
    case 'maul':
    case 'mallet':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';
      c.lineWidth=10;

      c.beginPath();
      c.moveTo(0,30);
      c.lineTo(0,-55);
      c.stroke();

      c.shadowColor=w.color;
      c.shadowBlur=18;

      rr(
        c,-27,-82,54,30,8,
        w.color,
        '#26324a',
        4
      );

      if(w.style==='maul'){
        rr(
          c,-18,-91,36,10,4,
          w.accent,
          '#26324a',
          2
        );
      }
      break;


    case 'scythe':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';
      c.lineWidth=8;

      c.beginPath();
      c.moveTo(0,30);
      c.lineTo(0,-78);
      c.stroke();

      c.shadowColor=w.color;
      c.shadowBlur=20;
      c.fillStyle=w.color;
      c.strokeStyle='#26324a';
      c.lineWidth=3;

      c.beginPath();
      c.moveTo(0,-78);
      c.quadraticCurveTo(46,-104,58,-73);
      c.quadraticCurveTo(31,-88,2,-58);
      c.closePath();
      c.fill();
      c.stroke();
      break;


    case 'whip':

      c.strokeStyle=w.color;
      c.lineWidth=7;

      c.beginPath();
      c.moveTo(0,18);
      c.bezierCurveTo(
        10,-30,
        48,-45,
        22,-95
      );
      c.stroke();

      handle(15,22);
      break;


    case 'chakram':

      c.strokeStyle=w.color;
      c.lineWidth=9;

      c.beginPath();
      c.arc(
        0,-45,29,
        0,
        Math.PI*2
      );
      c.stroke();

      c.strokeStyle=w.accent;
      c.lineWidth=3;

      c.beginPath();
      c.arc(
        0,-45,20,
        0,
        Math.PI*2
      );
      c.stroke();
      break;


    case 'staff':

      c.shadowBlur=0;
      c.strokeStyle='#35415d';
      c.lineWidth=8;

      c.beginPath();
      c.moveTo(0,30);
      c.lineTo(0,-70);
      c.stroke();

      c.shadowColor=w.color;
      c.shadowBlur=24;

      ellipse(
        c,
        0,-86,
        15,15,
        w.color,
        w.accent,
        3
      );
      break;


    case 'axe':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';
      c.lineWidth=9;

      c.beginPath();
      c.moveTo(0,30);
      c.lineTo(0,-65);
      c.stroke();

      c.shadowColor=w.color;
      c.shadowBlur=18;
      c.fillStyle=w.color;
      c.strokeStyle='#26324a';
      c.lineWidth=3;

      c.beginPath();
      c.moveTo(-3,-72);
      c.lineTo(38,-88);
      c.lineTo(31,-48);
      c.lineTo(-3,-56);
      c.closePath();
      c.fill();
      c.stroke();
      break;


    case 'claws':

      for(const x of [-10,0,10]){
        c.strokeStyle=w.color;
        c.lineWidth=5;

        c.beginPath();
        c.moveTo(x,5);
        c.lineTo(x+5,-55);
        c.stroke();
      }

      rr(
        c,-17,3,34,18,7,
        '#26324a',
        w.color,
        3
      );
      break;


    case 'blaster':

      c.shadowBlur=0;

      rr(
        c,-12,-45,24,58,8,
        '#26324a',
        w.color,
        3
      );

      rr(
        c,-6,8,12,28,5,
        '#182033',
        '#0c1320',
        2
      );

      c.shadowColor=w.color;
      c.shadowBlur=18;

      ellipse(
        c,0,-48,9,9,
        w.accent,
        w.color,
        2
      );
      break;


    case 'dagger':

      blade(48,6);
      handle(5,18);

      c.save();
      c.translate(17,7);
      c.rotate(.25);
      blade(43,5);
      handle(4,15);
      c.restore();
      break;


    case 'keyblade':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';
      c.lineWidth=8;

      c.beginPath();
      c.moveTo(0,30);
      c.lineTo(0,-65);
      c.stroke();

      c.shadowColor=w.color;
      c.shadowBlur=18;

      rr(
        c,-8,-84,16,25,4,
        w.color,
        '#26324a',
        3
      );

      rr(
        c,5,-82,22,8,3,
        w.accent,
        '#26324a',
        2
      );
      break;


    case 'rapier':

      blade(86,4);
      handle(5,27);

      c.strokeStyle=w.color;
      c.lineWidth=4;

      c.beginPath();
      c.arc(
        0,8,15,
        Math.PI,
        0
      );
      c.stroke();
      break;


    case 'greatsword':

      blade(96,12);
      handle(7,38);

      rr(
        c,-24,4,48,9,4,
        w.accent,
        '#26324a',
        3
      );
      break;


    case 'bostaff':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';
      c.lineWidth=12;

      c.beginPath();
      c.moveTo(0,38);
      c.lineTo(0,-92);
      c.stroke();

      c.strokeStyle=w.color;
      c.lineWidth=6;

      c.beginPath();
      c.moveTo(0,34);
      c.lineTo(0,-88);
      c.stroke();

      rr(
        c,-7,-18,14,38,6,
        w.accent,
        '#26324a',
        2
      );
      break;


    case 'nunchucks':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';
      c.lineWidth=11;

      c.beginPath();
      c.moveTo(-16,28);
      c.lineTo(-5,-25);
      c.moveTo(22,-50);
      c.lineTo(31,-96);
      c.stroke();

      c.strokeStyle=w.color;
      c.lineWidth=6;

      c.beginPath();
      c.moveTo(-16,27);
      c.lineTo(-5,-24);
      c.moveTo(22,-49);
      c.lineTo(31,-95);
      c.stroke();

      c.strokeStyle=w.accent;
      c.lineWidth=3;
      c.setLineDash([3,4]);

      c.beginPath();
      c.moveTo(-5,-25);
      c.quadraticCurveTo(
        8,-45,
        22,-50
      );
      c.stroke();

      c.setLineDash([]);
      break;


    case 'tonfa':

      for(const side of [-1,1]){
        c.save();

        c.translate(
          side*10,
          0
        );

        c.rotate(
          side*.12
        );

        rr(
          c,-5,-62,10,92,5,
          w.color,
          '#26324a',
          3
        );

        rr(
          c,
          side<0?-20:5,
          -18,
          15,8,4,
          w.accent,
          '#26324a',
          2
        );

        c.restore();
      }
      break;


    case 'sai':

      for(const side of [-1,1]){
        c.save();

        c.translate(
          side*9,
          0
        );

        blade(64,3);
        handle(3,23);

        c.strokeStyle=w.color;
        c.lineWidth=4;

        c.beginPath();
        c.moveTo(0,-5);
        c.lineTo(side*13,-22);
        c.moveTo(0,-5);
        c.lineTo(-side*13,-22);
        c.stroke();

        c.restore();
      }
      break;


    case 'mace':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';
      c.lineWidth=9;

      c.beginPath();
      c.moveTo(0,30);
      c.lineTo(0,-55);
      c.stroke();

      c.shadowColor=w.color;
      c.shadowBlur=18;

      ellipse(
        c,
        0,-70,
        21,21,
        w.color,
        '#26324a',
        4
      );

      for(let i=0;i<8;i++){
        const a=i*Math.PI/4;

        c.strokeStyle=w.accent;
        c.lineWidth=4;

        c.beginPath();

        c.moveTo(
          Math.cos(a)*18,
          -70+Math.sin(a)*18
        );

        c.lineTo(
          Math.cos(a)*29,
          -70+Math.sin(a)*29
        );

        c.stroke();
      }
      break;


    case 'boomerang':

      c.strokeStyle='#26324a';
      c.lineWidth=15;

      c.beginPath();
      c.moveTo(-31,-75);
      c.lineTo(0,-45);
      c.lineTo(33,-79);
      c.stroke();

      c.strokeStyle=w.color;
      c.lineWidth=9;

      c.beginPath();
      c.moveTo(-31,-75);
      c.lineTo(0,-45);
      c.lineTo(33,-79);
      c.stroke();
      break;


    case 'bow':

      c.shadowBlur=0;
      c.strokeStyle=w.color;
      c.lineWidth=7;

      c.beginPath();
      c.moveTo(0,-98);
      c.quadraticCurveTo(
        45,-45,
        0,24
      );
      c.stroke();

      c.strokeStyle=w.accent;
      c.lineWidth=2;

      c.beginPath();
      c.moveTo(0,-98);
      c.lineTo(0,24);
      c.stroke();

      c.strokeStyle='#26324a';
      c.lineWidth=4;

      c.beginPath();
      c.moveTo(-4,-34);
      c.lineTo(42,-34);
      c.stroke();

      c.fillStyle=w.accent;

      c.beginPath();
      c.moveTo(45,-34);
      c.lineTo(34,-40);
      c.lineTo(34,-28);
      c.closePath();
      c.fill();
      break;


    case 'orb':

      c.shadowColor=w.color;
      c.shadowBlur=28;

      ellipse(
        c,
        0,-48,
        27,27,
        w.color,
        w.accent,
        3
      );

      c.strokeStyle=w.accent;
      c.lineWidth=3;

      c.beginPath();
      c.ellipse(
        0,-48,
        39,14,
        .35,
        0,
        Math.PI*2
      );
      c.stroke();

      c.beginPath();
      c.ellipse(
        0,-48,
        39,14,
        -.35,
        0,
        Math.PI*2
      );
      c.stroke();
      break;


    case 'halberd':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';
      c.lineWidth=9;

      c.beginPath();
      c.moveTo(0,32);
      c.lineTo(0,-82);
      c.stroke();

      c.shadowColor=w.color;
      c.shadowBlur=18;
      c.fillStyle=w.color;
      c.strokeStyle='#26324a';
      c.lineWidth=3;

      c.beginPath();
      c.moveTo(0,-108);
      c.lineTo(10,-80);
      c.lineTo(42,-91);
      c.lineTo(27,-61);
      c.lineTo(0,-70);
      c.lineTo(-8,-82);
      c.closePath();
      c.fill();
      c.stroke();
      break;


    case 'rifle':

      c.shadowBlur=0;

      rr(
        c,-9,-72,18,78,7,
        '#26324a',
        w.color,
        3
      );

      rr(
        c,-19,-37,38,18,6,
        w.color,
        '#26324a',
        3
      );

      rr(
        c,-5,0,14,28,5,
        '#172238',
        '#26324a',
        2
      );

      c.shadowColor=w.color;
      c.shadowBlur=16;

      ellipse(
        c,
        0,-76,
        7,7,
        w.accent,
        w.color,
        2
      );
      break;


    case 'kusarigama':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';
      c.lineWidth=8;

      c.beginPath();
      c.moveTo(-13,28);
      c.lineTo(-3,-58);
      c.stroke();

      c.shadowColor=w.color;
      c.shadowBlur=18;
      c.fillStyle=w.color;

      c.beginPath();
      c.moveTo(-3,-58);
      c.quadraticCurveTo(
        30,-86,
        43,-58
      );
      c.quadraticCurveTo(
        22,-69,
        1,-43
      );
      c.closePath();
      c.fill();
      c.stroke();

      c.strokeStyle=w.accent;
      c.lineWidth=3;
      c.setLineDash([4,4]);

      c.beginPath();
      c.moveTo(-13,20);
      c.quadraticCurveTo(
        30,22,
        27,-22
      );
      c.stroke();

      c.setLineDash([]);

      ellipse(
        c,
        28,-25,
        9,9,
        w.color,
        '#26324a',
        2
      );
      break;


    case 'chainblade':

      c.shadowBlur=0;

      for(let i=0;i<7;i++){
        c.save();

        c.translate(
          Math.sin(i*.65)*9,
          -i*13
        );

        c.rotate(
          Math.sin(i*.7)*.22
        );

        rr(
          c,
          -7,-11,
          14,21,4,
          i%2?w.color:w.accent,
          '#26324a',
          2
        );

        c.restore();
      }

      handle(8,25);
      break;


    case 'pickaxe':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';
      c.lineWidth=9;

      c.beginPath();
      c.moveTo(0,30);
      c.lineTo(0,-62);
      c.stroke();

      c.strokeStyle=w.color;
      c.lineWidth=8;

      c.beginPath();
      c.moveTo(-35,-70);
      c.quadraticCurveTo(
        0,-92,
        38,-68
      );
      c.stroke();
      break;


    case 'flail':
    case 'morningstar':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';
      c.lineWidth=8;

      c.beginPath();
      c.moveTo(0,30);
      c.lineTo(0,-28);
      c.stroke();

      c.strokeStyle=w.accent;
      c.lineWidth=3;
      c.setLineDash([4,4]);

      c.beginPath();
      c.moveTo(0,-28);
      c.lineTo(13,-66);
      c.stroke();

      c.setLineDash([]);

      ellipse(
        c,
        15,-78,
        w.style==='morningstar'?19:16,
        w.style==='morningstar'?19:16,
        w.color,
        '#26324a',
        3
      );

      if(w.style==='morningstar'){
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3;

          c.strokeStyle=w.accent;
          c.lineWidth=3;

          c.beginPath();

          c.moveTo(
            15+Math.cos(a)*15,
            -78+Math.sin(a)*15
          );

          c.lineTo(
            15+Math.cos(a)*26,
            -78+Math.sin(a)*26
          );

          c.stroke();
        }
      }
      break;


    case 'harpoon':
    case 'lance':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';
      c.lineWidth=8;

      c.beginPath();
      c.moveTo(0,34);
      c.lineTo(0,-82);
      c.stroke();

      c.shadowColor=w.color;
      c.shadowBlur=18;
      c.fillStyle=w.color;
      c.strokeStyle='#26324a';
      c.lineWidth=3;

      c.beginPath();
      c.moveTo(0,-111);
      c.lineTo(11,-78);
      c.lineTo(0,-85);
      c.lineTo(-11,-78);
      c.closePath();
      c.fill();
      c.stroke();

      if(w.style==='harpoon'){
        c.beginPath();
        c.moveTo(0,-98);
        c.lineTo(18,-87);
        c.moveTo(0,-98);
        c.lineTo(-18,-87);
        c.stroke();
      }
      break;


    case 'fans':

      for(const side of [-1,1]){
        c.save();

        c.translate(
          side*9,
          -10
        );

        c.rotate(
          side*.18
        );

        c.fillStyle=w.color;
        c.strokeStyle='#26324a';
        c.lineWidth=3;

        c.beginPath();
        c.moveTo(0,12);
        c.arc(
          0,12,38,
          -2.45,
          -.7
        );
        c.closePath();
        c.fill();
        c.stroke();

        c.strokeStyle=w.accent;
        c.lineWidth=2;

        for(let i=0;i<4;i++){
          const a=
            -2.35+
            i*.5;

          c.beginPath();
          c.moveTo(0,12);

          c.lineTo(
            Math.cos(a)*34,
            12+Math.sin(a)*34
          );

          c.stroke();
        }

        c.restore();
      }
      break;


    case 'sickles':

      for(const side of [-1,1]){
        c.save();

        c.translate(
          side*10,
          0
        );

        c.rotate(
          side*.15
        );

        handle(4,22);

        c.strokeStyle=w.color;
        c.lineWidth=8;

        c.beginPath();

        c.arc(
          side*8,
          -50,
          28,
          side<0
            ?-1.2
            :Math.PI+.2,
          side<0
            ?1.0
            :Math.PI*2-1.0
        );

        c.stroke();
        c.restore();
      }
      break;


    case 'blowgun':

      c.strokeStyle='#26324a';
      c.lineWidth=10;

      c.beginPath();
      c.moveTo(0,28);
      c.lineTo(0,-95);
      c.stroke();

      c.strokeStyle=w.color;
      c.lineWidth=5;

      c.beginPath();
      c.moveTo(0,27);
      c.lineTo(0,-94);
      c.stroke();

      rr(
        c,-9,-22,18,10,4,
        w.accent,
        '#26324a',
        2
      );
      break;


    case 'crossbow':

      c.shadowBlur=0;

      rr(
        c,-7,-60,14,90,6,
        '#26324a',
        w.color,
        3
      );

      c.strokeStyle=w.color;
      c.lineWidth=7;

      c.beginPath();
      c.moveTo(-40,-58);
      c.quadraticCurveTo(
        0,-25,
        40,-58
      );
      c.stroke();

      c.strokeStyle=w.accent;
      c.lineWidth=2;

      c.beginPath();
      c.moveTo(-40,-58);
      c.lineTo(40,-58);
      c.stroke();
      break;


    case 'club':
    case 'bat':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';

      c.lineWidth=
        w.style==='club'
          ?20
          :15;

      c.beginPath();
      c.moveTo(0,31);
      c.lineTo(0,-75);
      c.stroke();

      c.strokeStyle=w.color;

      c.lineWidth=
        w.style==='club'
          ?13
          :9;

      c.beginPath();
      c.moveTo(0,28);
      c.lineTo(0,-72);
      c.stroke();
      break;


    case 'launcher':
    case 'cannon':

      c.shadowBlur=0;

      rr(
        c,-15,-82,30,93,9,
        '#26324a',
        w.color,
        3
      );

      rr(
        c,-23,-71,46,25,8,
        w.color,
        '#26324a',
        3
      );

      rr(
        c,-6,5,15,30,5,
        '#182238',
        '#26324a',
        2
      );

      c.shadowColor=w.color;
      c.shadowBlur=20;

      ellipse(
        c,
        0,-84,
        11,8,
        w.accent,
        w.color,
        2
      );
      break;


    case 'wand':

      c.shadowBlur=0;
      c.strokeStyle='#26324a';
      c.lineWidth=7;

      c.beginPath();
      c.moveTo(0,28);
      c.lineTo(0,-62);
      c.stroke();

      c.strokeStyle=w.color;
      c.lineWidth=4;

      c.beginPath();
      c.moveTo(0,25);
      c.lineTo(0,-60);
      c.stroke();

      c.shadowColor=w.color;
      c.shadowBlur=22;

      ellipse(
        c,
        0,-73,
        12,12,
        w.accent,
        w.color,
        2
      );
      break;


    case 'yoyo':

      c.strokeStyle=w.accent;
      c.lineWidth=3;

      c.beginPath();
      c.moveTo(0,18);
      c.quadraticCurveTo(
        20,-18,
        5,-58
      );
      c.stroke();

      ellipse(
        c,
        5,-73,
        18,18,
        w.color,
        w.accent,
        3
      );

      handle(12,18);
      break;


    case 'chainsaw':

      c.shadowBlur=0;

      rr(
        c,-13,-79,26,87,8,
        w.color,
        '#26324a',
        4
      );

      rr(
        c,-8,6,16,27,5,
        '#26324a',
        w.accent,
        2
      );

      c.strokeStyle=w.accent;
      c.lineWidth=3;

      for(let y=-73;y<-4;y+=10){
        c.beginPath();
        c.moveTo(-13,y);
        c.lineTo(-20,y-5);
        c.moveTo(13,y);
        c.lineTo(20,y-5);
        c.stroke();
      }
      break;


    case 'pistol':

      c.shadowBlur=0;

      rr(
        c,-10,-52,20,55,7,
        '#26324a',
        w.color,
        3
      );

      rr(
        c,-5,-2,13,35,5,
        '#182238',
        '#26324a',
        2
      );

      c.shadowColor=w.color;
      c.shadowBlur=16;

      ellipse(
        c,
        0,-55,
        8,6,
        w.accent,
        w.color,
        2
      );
      break;


    case 'shield':

      c.shadowColor=w.color;
      c.shadowBlur=18;
      c.fillStyle=w.color;
      c.strokeStyle='#26324a';
      c.lineWidth=4;

      c.beginPath();
      c.moveTo(0,-92);
      c.lineTo(34,-72);
      c.lineTo(28,-22);
      c.lineTo(0,12);
      c.lineTo(-28,-22);
      c.lineTo(-34,-72);
      c.closePath();
      c.fill();
      c.stroke();

      c.strokeStyle=w.accent;
      c.lineWidth=4;

      c.beginPath();
      c.moveTo(0,-76);
      c.lineTo(0,-8);
      c.moveTo(-20,-50);
      c.lineTo(20,-50);
      c.stroke();
      break;


    case 'knuckles':
    case 'gauntlets':

      for(const side of [-1,1]){
        c.save();

        c.translate(
          side*14,
          -20
        );

        rr(
          c,-12,-17,24,35,9,
          w.color,
          '#26324a',
          3
        );

        for(let i=-1;i<=1;i++){
          ellipse(
            c,
            i*7,-20,
            6,7,
            w.accent,
            '#26324a',
            2
          );
        }

        c.restore();
      }
      break;


    case 'lantern':

      c.shadowBlur=0;

      rr(
        c,-15,-56,30,44,8,
        '#26324a',
        w.color,
        3
      );

      c.shadowColor=w.color;
      c.shadowBlur=28;

      ellipse(
        c,
        0,-35,
        11,15,
        w.accent,
        w.color,
        2
      );

      c.strokeStyle='#26324a';
      c.lineWidth=5;

      c.beginPath();
      c.arc(
        0,-58,
        18,
        Math.PI,
        0
      );
      c.stroke();

      rr(
        c,-5,-12,10,42,4,
        '#26324a',
        w.color,
        2
      );
      break;


    case 'katana':
    case 'saber':
    case 'cutlass':
    case 'cleaver':
    case 'matrix':
    case 'sword':
    default:

      blade(
        w.style==='cleaver'
          ?72
          :w.style==='matrix'
            ?92
            :80,

        w.style==='cleaver'
          ?11
          :w.style==='rapier'
            ?4
            :7
      );

      handle(6,28);
      break;
  }

  c.restore();
}


function drawWeaponIcon(c,x,y,w,scale=.7){
  c.clearRect(
    0,
    0,
    c.canvas.width,
    c.canvas.height
  );

  c.save();
  c.translate(x,y);
  c.rotate(.55);

  drawWeaponModel(
    c,
    w,
    scale
  );

  c.restore();
}


function hashColor(name){
  let h=0;

  for(const ch of name)
    h=(
      h*31+
      ch.charCodeAt(0)
    )>>>0;

  return `hsl(${h%360} 62% 64%)`;
}


function drawPetSprite(
  c,
  x,
  y,
  name,
  scale=1,
  time=0
){
  const pf=
    petProfile(name)||
    {
      seed:petSeed(name),
      species:petSpecies(name),
      motif:'rift',
      primary:hashColor(name),
      secondary:'#dff7ff',
      accent:'#ffffff',
      pattern:'stripe',
      accessory:'scarf',
      eye:0,
      tail:0
    };

  const seed=pf.seed||1,
        species=pf.species||'creature',

        fly=[
          'bird',
          'insect',
          'dragon',
          'spirit'
        ].includes(species),

        bob=
          Math.sin(
            time*4+
            (seed%17)
          )*2.8,

        wing=
          Math.sin(
            time*8+
            (seed%11)
          )*.18;

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

  c.scale(scale,scale);
  c.lineJoin='round';
  c.lineCap='round';

  // Signature aura.
  c.save();

  c.globalAlpha=
    .10+
    .035*
    Math.sin(
      time*3+
      seed%9
    );

  c.strokeStyle=pf.accent;
  c.lineWidth=2;

  const auraR=
    31+
    (seed%8);

  c.beginPath();

  if(seed%3===0){
    c.rect(
      -auraR*.72,
      -48,
      auraR*1.44,
      auraR*1.25
    );

  }else{
    c.ellipse(
      0,
      -20,
      auraR,
      auraR*.78,
      0,
      0,
      Math.PI*2
    );
  }

  c.stroke();
  c.restore();


  // Ground shadow.
  c.globalAlpha=.17;
  c.fillStyle='#06101a';

  c.beginPath();

  c.ellipse(
    0,
    8,
    25+(seed%6),
    6,
    0,
    0,
    Math.PI*2
  );

  c.fill();
  c.globalAlpha=1;


  const outline='#182333',
        p=pf.primary,
        s=pf.secondary,
        a=pf.accent;

  const body=(
    bx,
    by,
    rx,
    ry,
    fill=p
  )=>
    ellipse(
      c,
      bx,
      by,
      rx,
      ry,
      fill,
      outline,
      4
    );


  const eye=(
    ex,
    ey,
    dir=1
  )=>{
    const styles=[
      ['#102034',3,3],
      ['#ffffff',4,5],
      [a,3,5],
      ['#111827',2,5]
    ];

    const st=
      styles[
        pf.eye%
        styles.length
      ];

    ellipse(
      c,
      ex,
      ey,
      st[1],
      st[2],
      st[0],
      outline,
      1
    );

    if(pf.eye%2===1){
      ellipse(
        c,
        ex+dir,
        ey,
        1.4,
        1.8,
        '#10131b'
      );
    }
  };


  // Tail / wing layer behind body.
  c.strokeStyle=outline;
  c.lineWidth=4;

  if(
    species==='canine'||
    species==='feline'||
    species==='rodent'||
    species==='creature'
  ){
    c.fillStyle=s;

    c.beginPath();

    const side=
      pf.tail%2
        ?1
        :-1;

    c.moveTo(
      side*18,
      -15
    );

    c.quadraticCurveTo(
      side*
      (
        43+
        pf.tail*3
      ),
      -36,

      side*
      (
        35+
        pf.tail*4
      ),
      -5
    );

    c.quadraticCurveTo(
      side*27,
      0,
      side*17,
      -7
    );

    c.closePath();
    c.fill();
    c.stroke();
  }


  if(
    species==='bird'||
    species==='insect'||
    species==='dragon'
  ){
    c.save();
    c.rotate(wing);
    c.fillStyle=s;

    c.beginPath();

    c.ellipse(
      -24,-24,
      18+(seed%7),
      9,
      -.5,
      0,
      Math.PI*2
    );

    c.ellipse(
      24,-24,
      18+(seed%7),
      9,
      .5,
      0,
      Math.PI*2
    );

    c.fill();
    c.stroke();
    c.restore();
  }


  if(species==='aquatic'){
    c.fillStyle=s;

    c.beginPath();
    c.moveTo(-21,-16);
    c.lineTo(-42,-30);
    c.lineTo(-35,-9);
    c.closePath();
    c.fill();
    c.stroke();

    c.beginPath();
    c.moveTo(22,-16);
    c.lineTo(41,-29);
    c.lineTo(35,-8);
    c.closePath();
    c.fill();
    c.stroke();
  }


  if(species==='spirit'){
    c.globalAlpha=.82;
    c.fillStyle=p;

    c.beginPath();

    c.moveTo(-25,-32);

    c.quadraticCurveTo(
      0,-55,
      25,-32
    );

    c.lineTo(22,0);
    c.lineTo(12,-8);
    c.lineTo(3,1);
    c.lineTo(-7,-8);
    c.lineTo(-17,1);

    c.closePath();
    c.fill();
    c.stroke();

    c.globalAlpha=1;

  }else if(species==='bot'){

    rr(
      c,-25,-43,50,42,11,
      '#879caf',
      outline,
      4
    );

    rr(
      c,-19,-37,38,21,7,
      p,
      outline,
      3
    );

    c.fillStyle=a;
    c.fillRect(
      -13,-29,
      26,5
    );

    for(const side of [-1,1]){
      rr(
        c,
        side*25-5,
        -27,
        10,24,4,
        s,
        outline,
        3
      );

      c.strokeStyle=a;

      c.beginPath();

      c.moveTo(
        side*29,
        -44
      );

      c.lineTo(
        side*35,
        -57
      );

      c.stroke();
    }

  }else if(species==='aquatic'){

    body(
      0,-20,
      29,19,
      p
    );

    c.fillStyle=s;

    c.beginPath();
    c.moveTo(-26,-19);
    c.lineTo(-45,-35);
    c.lineTo(-42,-5);
    c.closePath();
    c.fill();
    c.stroke();

    c.beginPath();
    c.moveTo(25,-20);
    c.lineTo(45,-34);
    c.lineTo(41,-6);
    c.closePath();
    c.fill();
    c.stroke();

  }else if(species==='insect'){

    body(
      0,-20,
      20,24,
      p
    );

    c.strokeStyle=a;
    c.lineWidth=3;

    for(const side of [-1,1]){
      for(const yy of [-30,-20,-10]){
        c.beginPath();

        c.moveTo(
          side*15,
          yy
        );

        c.lineTo(
          side*31,
          yy+
          (
            yy%2
              ?7
              :-5
          )
        );

        c.stroke();
      }
    }

    c.beginPath();

    c.moveTo(-7,-42);

    c.quadraticCurveTo(
      -14,-57,
      -22,-55
    );

    c.moveTo(7,-42);

    c.quadraticCurveTo(
      14,-57,
      22,-55
    );

    c.stroke();

  }else if(species==='reptile'){

    body(
      -2,-18,
      31,18,
      p
    );

    c.fillStyle=s;

    c.beginPath();
    c.moveTo(-28,-18);

    c.quadraticCurveTo(
      -51,-4,
      -48,8
    );

    c.quadraticCurveTo(
      -32,0,
      -19,-7
    );

    c.closePath();
    c.fill();
    c.stroke();

    for(let i=0;i<4;i++){
      c.fillStyle=a;

      c.beginPath();

      c.moveTo(
        -15+i*10,
        -35
      );

      c.lineTo(
        -10+i*10,
        -48-
        (i%2)*5
      );

      c.lineTo(
        -5+i*10,
        -34
      );

      c.closePath();
      c.fill();
      c.stroke();
    }

  }else if(species==='frog'){

    body(
      0,-17,
      27,20,
      p
    );

    ellipse(
      c,-16,-35,
      9,9,
      s,
      outline,
      3
    );

    ellipse(
      c,16,-35,
      9,9,
      s,
      outline,
      3
    );

    c.strokeStyle=outline;
    c.lineWidth=5;

    c.beginPath();
    c.moveTo(-18,-4);
    c.lineTo(-34,6);
    c.moveTo(18,-4);
    c.lineTo(34,6);
    c.stroke();

  }else if(species==='plant'){

    body(
      0,-16,
      23,22,
      p
    );

    c.strokeStyle=outline;
    c.lineWidth=3;

    for(const side of [-1,1]){
      c.fillStyle=s;

      c.beginPath();

      c.ellipse(
        side*9,
        -44,
        9,17,
        side*.55,
        0,
        Math.PI*2
      );

      c.fill();
      c.stroke();
    }

    ellipse(
      c,
      0,-40,
      6,10,
      a,
      outline,
      2
    );

  }else{

    body(
      0,-18,

      species==='bunny'
        ?24
        :species==='rodent'
          ?27
          :29,

      species==='bird'
        ?22
        :24,

      p
    );
  }


  // Species-specific head silhouettes.
  if(species==='bunny'){
    rr(
      c,-18,-57,
      11,31,7,
      s,
      outline,
      3
    );

    rr(
      c,7,-57,
      11,31,7,
      s,
      outline,
      3
    );

    body(
      0,-27,
      22,20,
      p
    );
  }


  if(
    species==='canine'||
    species==='feline'
  ){
    c.fillStyle=s;

    c.beginPath();

    c.moveTo(-22,-34);
    c.lineTo(
      -15,
      -54-(seed%7)
    );

    c.lineTo(-5,-37);
    c.lineTo(5,-37);

    c.lineTo(
      15,
      -54-(seed%5)
    );

    c.lineTo(22,-34);
    c.closePath();
    c.fill();
    c.stroke();

    body(
      0,-25,
      23,20,
      p
    );
  }


  if(species==='rodent'){
    ellipse(
      c,-19,-35,
      10,10,
      s,
      outline,
      3
    );

    ellipse(
      c,19,-35,
      10,10,
      s,
      outline,
      3
    );

    body(
      0,-24,
      24,20,
      p
    );
  }


  if(species==='bird'){
    body(
      0,-25,
      22,22,
      p
    );

    c.fillStyle=a;

    c.beginPath();
    c.moveTo(19,-24);
    c.lineTo(34,-18);
    c.lineTo(19,-13);
    c.closePath();
    c.fill();
    c.stroke();
  }


  if(species==='dragon'){
    body(
      0,-25,
      24,22,
      p
    );

    c.fillStyle=a;

    for(const side of [-1,1]){
      c.beginPath();

      c.moveTo(
        side*9,
        -43
      );

      c.lineTo(
        side*18,
        -61
      );

      c.lineTo(
        side*22,
        -40
      );

      c.closePath();
      c.fill();
      c.stroke();
    }

    c.fillStyle=s;

    c.beginPath();
    c.moveTo(-22,-12);

    c.quadraticCurveTo(
      -48,-3,
      -45,11
    );

    c.lineTo(-17,0);
    c.closePath();
    c.fill();
    c.stroke();
  }


  // Eyes / face.
  if(species!=='bot'){
    eye(-8,-27,-1);
    eye(8,-27,1);

    if(
      species!=='spirit'&&
      species!=='reptile'
    ){
      c.strokeStyle=outline;
      c.lineWidth=2;

      c.beginPath();

      c.arc(
        0,-18,
        5,
        .2,
        Math.PI-.2
      );

      c.stroke();
    }
  }


  // Unique coat / panel pattern.
  c.save();

  c.globalAlpha=.75;
  c.strokeStyle=a;
  c.fillStyle=a;
  c.lineWidth=2.5;

  const pat=pf.pattern;

  if(pat==='stripe'){
    for(let i=-1;i<=1;i++){
      c.beginPath();

      c.moveTo(
        i*8-4,
        -8
      );

      c.lineTo(
        i*8+3,
        -28
      );

      c.stroke();
    }
  }

  if(pat==='spots'){
    for(let i=0;i<3;i++){
      ellipse(
        c,
        -12+i*12,
        -11-(i%2)*8,
        3+(seed+i)%3,
        3+(seed+i)%3,
        a
      );
    }
  }

  if(pat==='chevron'){
    c.beginPath();
    c.moveTo(-12,-12);
    c.lineTo(0,-4);
    c.lineTo(12,-12);
    c.stroke();
  }

  if(pat==='star'){
    drawPetMotif(
      c,
      'star',
      0,-8,
      7,
      a
    );
  }

  if(pat==='ring'){
    c.beginPath();
    c.arc(
      0,-15,
      12,
      0,
      Math.PI*2
    );
    c.stroke();
  }

  if(pat==='split'){
    c.fillRect(
      -2,-35,
      4,27
    );
  }

  if(pat==='runes'){
    c.font='900 10px monospace';
    c.textAlign='center';
    c.fillText(
      'R',
      0,-8
    );
  }

  if(pat==='spark'){
    c.beginPath();
    c.moveTo(-8,-4);
    c.lineTo(0,-17);
    c.lineTo(4,-10);
    c.lineTo(11,-25);
    c.stroke();
  }

  if(pat==='diamond'){
    c.save();
    c.translate(0,-11);
    c.rotate(Math.PI/4);
    c.fillRect(-5,-5,10,10);
    c.restore();
  }

  if(pat==='wave'){
    c.beginPath();
    c.moveTo(-15,-10);

    c.quadraticCurveTo(
      -7,-20,
      0,-10
    );

    c.quadraticCurveTo(
      7,0,
      15,-10
    );

    c.stroke();
  }

  if(pat==='pixel'){
    c.fillRect(
      -14,-14,
      6,6
    );

    c.fillRect(
      5,-8,
      8,5
    );
  }

  if(pat==='leaf'){
    c.beginPath();

    c.ellipse(
      0,-10,
      5,10,
      .6,
      0,
      Math.PI*2
    );

    c.fill();
  }

  c.restore();


  drawPetMotif(
    c,
    pf.motif,
    0,-52,
    8,
    a
  );

  drawPetAccessory(
    c,
    pf.accessory,
    p,
    s,
    a,
    seed
  );

  drawEquippedPetGear(
    c,
    name,
    time
  );


  // Motif particles.
  c.save();
  c.globalAlpha=.55;

  for(let i=0;i<2;i++){
    const ang=
      time*
      (
        .8+
        i*.35
      )+
      (seed%13)+
      i*Math.PI,

      rrr=
        34+
        i*5;

    ellipse(
      c,
      Math.cos(ang)*rrr,
      -22+
      Math.sin(ang)*12,
      2+i,
      2+i,
      i?a:s
    );
  }

  c.restore();


  // Fusion pet aura.
  if(pf.fused){
    c.save();

    c.globalAlpha=.72;

    c.strokeStyle=
      pf.secondary||
      pf.accent;

    c.lineWidth=3;

    c.shadowColor=
      pf.secondary||
      pf.accent;

    c.shadowBlur=10;

    c.beginPath();

    c.arc(
      0,-21,
      38+
      Math.sin(time*4)*3,
      -1.15,
      1.15
    );

    c.stroke();

    c.strokeStyle=pf.primary;

    c.beginPath();

    c.arc(
      0,-21,
      38+
      Math.sin(time*4)*3,
      Math.PI-1.15,
      Math.PI+1.15
    );

    c.stroke();

    drawPetMotif(
      c,
      pf.secondaryMotif||
      'quantum',
      25,-50,
      6,
      pf.secondary||
      pf.accent
    );

    c.restore();
  }


  // Corrupted pet visual glitches.
  if(pf.corrupted){
    c.save();

    c.globalAlpha=.75;
    c.strokeStyle='#ff4fc8';
    c.lineWidth=2;

    for(let i=0;i<4;i++){
      const yy=
        -52+
        i*16+
        Math.sin(
          time*8+i
        )*3;

      c.beginPath();

      c.moveTo(
        -34+
        (i%2)*8,
        yy
      );

      c.lineTo(
        34-
        (i%3)*7,
        yy
      );

      c.stroke();
    }

    c.fillStyle='#7c2dff';

    for(let i=0;i<5;i++){
      c.fillRect(
        -35+
        (
          (seed+i*17)%70
        ),

        -58+
        (
          (seed+i*29)%65
        ),

        3+
        (i%2)*3,

        2
      );
    }

    c.restore();
  }

  c.restore();
}


function drawPetMotif(
  c,
  m,
  x,
  y,
  r,
  color
){
  c.save();
  c.translate(x,y);

  c.fillStyle=color;
  c.strokeStyle='#182333';
  c.lineWidth=2;

  if(m==='snowflake'){
    c.beginPath();

    for(let i=0;i<3;i++){
      const a=
        i*Math.PI/3;

      c.moveTo(
        Math.cos(a)*r,
        Math.sin(a)*r
      );

      c.lineTo(
        -Math.cos(a)*r,
        -Math.sin(a)*r
      );
    }

    c.stroke();

  }else if(m==='flame'){

    c.beginPath();
    c.moveTo(0,-r);

    c.quadraticCurveTo(
      r,r*.1,
      0,r
    );

    c.quadraticCurveTo(
      -r*.8,r*.1,
      0,-r
    );

    c.fill();
    c.stroke();

  }else if(m==='bubble'){

    c.globalAlpha=.65;

    c.beginPath();
    c.arc(
      0,0,
      r*.7,
      0,
      Math.PI*2
    );
    c.stroke();

    ellipse(
      c,
      r*.55,
      -r*.7,
      2,2,
      color
    );

  }else if(m==='leaf'){

    c.beginPath();

    c.ellipse(
      0,0,
      r*.55,
      r,
      .55,
      0,
      Math.PI*2
    );

    c.fill();
    c.stroke();

  }else if(m==='sun'){

    c.beginPath();
    c.arc(
      0,0,
      r*.55,
      0,
      Math.PI*2
    );
    c.fill();

    for(let i=0;i<8;i++){
      const a=
        i*Math.PI/4;

      c.moveTo(
        Math.cos(a)*r*.7,
        Math.sin(a)*r*.7
      );

      c.lineTo(
        Math.cos(a)*r*1.2,
        Math.sin(a)*r*1.2
      );
    }

    c.stroke();

  }else if(m==='candy'){

    c.rotate(.45);

    rr(
      c,
      -r*.8,
      -r*.45,
      r*1.6,
      r*.9,
      4,
      color,
      '#182333',
      2
    );

    c.beginPath();
    c.moveTo(-r*.8,0);
    c.lineTo(-r*1.4,-r*.6);
    c.lineTo(-r*1.4,r*.6);
    c.closePath();
    c.fill();
    c.stroke();

    c.beginPath();
    c.moveTo(r*.8,0);
    c.lineTo(r*1.4,-r*.6);
    c.lineTo(r*1.4,r*.6);
    c.closePath();
    c.fill();
    c.stroke();

  }else if(m==='cloud'){

    ellipse(
      c,
      -r*.45,0,
      r*.55,r*.42,
      color,
      '#182333',
      2
    );

    ellipse(
      c,
      r*.25,0,
      r*.7,r*.5,
      color,
      '#182333',
      2
    );

    ellipse(
      c,
      0,-r*.35,
      r*.55,r*.55,
      color,
      '#182333',
      2
    );

  }else if(
    m==='shadow'||
    m==='ghost'
  ){

    c.globalAlpha=.75;

    c.beginPath();
    c.arc(
      0,-2,
      r*.7,
      Math.PI,
      0
    );

    c.lineTo(
      r*.7,
      r*.7
    );

    c.lineTo(
      0,
      r*.2
    );

    c.lineTo(
      -r*.7,
      r*.7
    );

    c.closePath();
    c.fill();
    c.stroke();

  }else if(m==='gear'){

    c.beginPath();
    c.arc(
      0,0,
      r*.72,
      0,
      Math.PI*2
    );
    c.stroke();

    for(let i=0;i<8;i++){
      const a=
        i*Math.PI/4;

      c.moveTo(
        Math.cos(a)*r*.75,
        Math.sin(a)*r*.75
      );

      c.lineTo(
        Math.cos(a)*r*1.15,
        Math.sin(a)*r*1.15
      );
    }

    c.stroke();

    ellipse(
      c,
      0,0,
      r*.25,r*.25,
      '#182333'
    );

  }else if(m==='orbit'){

    ellipse(
      c,
      0,0,
      r*.45,r*.45,
      color,
      '#182333',
      2
    );

    c.beginPath();

    c.ellipse(
      0,0,
      r*1.25,
      r*.45,
      .35,
      0,
      Math.PI*2
    );

    c.stroke();

    ellipse(
      c,
      r*.95,
      r*.15,
      2.5,2.5,
      color
    );

  }else if(m==='stone'){

    c.beginPath();
    c.moveTo(-r,0);
    c.lineTo(-r*.4,-r);
    c.lineTo(r*.7,-r*.6);
    c.lineTo(r,r*.5);
    c.lineTo(0,r);
    c.closePath();
    c.fill();
    c.stroke();

  }else if(m==='coin'){

    ellipse(
      c,
      0,0,
      r,r,
      color,
      '#182333',
      2
    );

    c.fillStyle='#182333';
    c.font=`900 ${r}px system-ui`;
    c.textAlign='center';

    c.fillText(
      'R',
      0,
      r*.35
    );

  }else if(m==='crystal'){

    c.beginPath();
    c.moveTo(0,-r*1.2);
    c.lineTo(r*.75,-r*.2);
    c.lineTo(r*.45,r);
    c.lineTo(-r*.45,r);
    c.lineTo(-r*.75,-r*.2);
    c.closePath();
    c.fill();
    c.stroke();

  }else if(m==='bolt'){

    c.beginPath();
    c.moveTo(r*.2,-r);
    c.lineTo(-r*.55,r*.1);
    c.lineTo(0,r*.1);
    c.lineTo(-r*.2,r);
    c.lineTo(r*.65,-r*.2);
    c.lineTo(r*.1,-r*.2);
    c.closePath();
    c.fill();
    c.stroke();

  }else if(m==='circuit'){

    rr(
      c,
      -r,
      -r*.65,
      r*2,
      r*1.3,
      3,
      '#26384c',
      '#182333',
      2
    );

    c.strokeStyle=color;

    c.beginPath();

    c.moveTo(-r*.6,0);
    c.lineTo(-r*.1,0);
    c.lineTo(-r*.1,-r*.35);

    c.moveTo(r*.6,0);
    c.lineTo(r*.1,0);
    c.lineTo(r*.1,r*.35);

    c.stroke();

  }else if(m==='mirror'){

    c.fillStyle=
      'rgba(225,248,255,.8)';

    c.beginPath();
    c.moveTo(0,-r);
    c.lineTo(r*.7,-r*.25);
    c.lineTo(r*.5,r);
    c.lineTo(-r*.5,r);
    c.lineTo(-r*.7,-r*.25);
    c.closePath();
    c.fill();
    c.stroke();

  }else if(m==='ink'){

    c.globalAlpha=.8;

    ellipse(
      c,
      0,0,
      r*.65,r*.85,
      color
    );

    for(let i=0;i<3;i++){
      ellipse(
        c,
        -r+i*r,
        r*.7+
        (i%2)*3,
        2,3,
        color
      );
    }

  }else if(m==='toy'){

    rr(
      c,
      -r*.8,
      -r*.8,
      r*1.6,
      r*1.6,
      2,
      color,
      '#182333',
      2
    );

    c.strokeStyle='#fff';

    c.beginPath();
    c.moveTo(-r*.5,0);
    c.lineTo(r*.5,0);
    c.moveTo(0,-r*.5);
    c.lineTo(0,r*.5);
    c.stroke();

  }else if(m==='maze'){

    c.strokeStyle=color;
    c.lineWidth=2;

    c.strokeRect(
      -r,-r,
      r*2,r*2
    );

    c.beginPath();
    c.moveTo(-r*.7,-r*.4);
    c.lineTo(r*.3,-r*.4);
    c.lineTo(r*.3,r*.3);
    c.lineTo(-r*.2,r*.3);
    c.lineTo(-r*.2,r*.7);
    c.stroke();

  }else if(m==='quantum'){

    c.strokeStyle=color;

    c.beginPath();

    c.ellipse(
      0,0,
      r*1.1,
      r*.38,
      .5,
      0,
      Math.PI*2
    );

    c.ellipse(
      0,0,
      r*1.1,
      r*.38,
      -.5,
      0,
      Math.PI*2
    );

    c.stroke();

    ellipse(
      c,
      0,0,
      3,3,
      color
    );

  }else if(m==='music'){

    c.strokeStyle=color;
    c.lineWidth=3;

    c.beginPath();

    c.moveTo(
      2,-r
    );

    c.lineTo(
      2,r*.4
    );

    c.lineTo(
      r*.8,
      r*.1
    );

    c.moveTo(
      2,-r
    );

    c.lineTo(
      r*.8,
      -r*.7
    );

    c.stroke();

    ellipse(
      c,
      -2,
      r*.55,
      5,4,
      color
    );

  }else{

    c.save();
    c.rotate(Math.PI/4);

    c.fillRect(
      -r*.55,
      -r*.55,
      r*1.1,
      r*1.1
    );

    c.restore();
  }

  c.restore();
}


function drawPetAccessory(
  c,
  kind,
  p,
  s,
  a,
  seed
){
  c.save();

  c.strokeStyle='#182333';
  c.lineWidth=2.5;

  if(kind==='scarf'){

    c.fillStyle=a;

    rr(
      c,
      -20,-8,
      40,7,
      4,
      a,
      '#182333',
      2
    );

    c.beginPath();
    c.moveTo(13,-5);
    c.lineTo(34,4);
    c.lineTo(16,7);
    c.closePath();
    c.fill();
    c.stroke();

  }else if(kind==='crown'){

    c.fillStyle=a;

    c.beginPath();
    c.moveTo(-13,-46);
    c.lineTo(-8,-59);
    c.lineTo(0,-50);
    c.lineTo(8,-61);
    c.lineTo(14,-46);
    c.closePath();
    c.fill();
    c.stroke();

  }else if(kind==='goggles'){

    ellipse(
      c,
      -9,-31,
      7,5,
      'rgba(180,245,255,.8)',
      '#182333',
      2
    );

    ellipse(
      c,
      9,-31,
      7,5,
      'rgba(180,245,255,.8)',
      '#182333',
      2
    );

    c.beginPath();
    c.moveTo(-2,-31);
    c.lineTo(2,-31);
    c.stroke();

  }else if(kind==='bell'){

    ellipse(
      c,
      0,-2,
      6,6,
      a,
      '#182333',
      2
    );

    c.strokeStyle=a;

    c.beginPath();
    c.arc(
      0,-10,
      10,
      .2,
      Math.PI-.2
    );
    c.stroke();

  }else if(
    kind==='backpack'||
    kind==='satchel'
  ){

    rr(
      c,
      18,-26,
      15,22,
      5,
      s,
      '#182333',
      2
    );

    c.strokeStyle=a;

    c.beginPath();

    c.moveTo(
      17,-23
    );

    c.quadraticCurveTo(
      29,-36,
      34,-18
    );

    c.stroke();

  }else if(kind==='halo'){

    c.strokeStyle=a;
    c.lineWidth=3;

    c.beginPath();

    c.ellipse(
      0,-58,
      17,5,
      0,
      0,
      Math.PI*2
    );

    c.stroke();

  }else if(kind==='bandana'){

    rr(
      c,
      -23,-39,
      46,7,
      3,
      a,
      '#182333',
      2
    );

    c.fillStyle=a;

    c.beginPath();
    c.moveTo(20,-37);
    c.lineTo(36,-31);
    c.lineTo(24,-24);
    c.closePath();
    c.fill();
    c.stroke();

  }else if(kind==='rune'){

    drawPetMotif(
      c,
      'quantum',
      0,-7,
      6,
      a
    );

  }else if(kind==='cape'){

    c.fillStyle=s;

    c.beginPath();
    c.moveTo(-19,-22);
    c.lineTo(-30,5);
    c.lineTo(22,2);
    c.lineTo(18,-20);
    c.closePath();
    c.fill();
    c.stroke();

  }else if(kind==='headset'){

    c.strokeStyle=a;
    c.lineWidth=4;

    c.beginPath();

    c.arc(
      0,-30,
      22,
      Math.PI,
      0
    );

    c.stroke();

    rr(
      c,
      -25,-33,
      7,14,
      3,
      a,
      '#182333',
      2
    );

    rr(
      c,
      18,-33,
      7,14,
      3,
      a,
      '#182333',
      2
    );

  }else if(kind==='antenna'){

    c.strokeStyle=a;

    c.beginPath();

    c.moveTo(
      0,-44
    );

    c.lineTo(
      (seed%2?1:-1)*8,
      -61
    );

    c.stroke();

    ellipse(
      c,
      (seed%2?1:-1)*8,
      -63,
      4,4,
      a,
      '#182333',
      2
    );

  }else if(kind==='gem'){

    drawPetMotif(
      c,
      'crystal',
      0,-5,
      7,
      a
    );

  }else if(kind==='leaf'){

    drawPetMotif(
      c,
      'leaf',
      0,-48,
      7,
      a
    );

  }else if(kind==='gear'){

    drawPetMotif(
      c,
      'gear',
      19,-11,
      7,
      a
    );

  }else if(kind==='ribbon'){

    c.fillStyle=a;

    c.beginPath();
    c.moveTo(-4,-42);
    c.lineTo(-20,-50);
    c.lineTo(-16,-34);
    c.lineTo(0,-39);
    c.lineTo(16,-50);
    c.lineTo(18,-34);
    c.closePath();
    c.fill();
    c.stroke();
  }

  c.restore();
}
function drawEnemy(e,cam){
  const x=e.x-cam,y=e.y,bob=Math.sin(G.time*4+e.x*.01)*3;
  const hitKick=e.hit>0?Math.sin(G.time*70)*7:0;
  const lean=e.hit>0?(P.x<e.x?.12:-.12):0;

  shadow(
    x,y+8,
    e.boss?128:e.legendary?112:e.elite?92:72,
    e.boss?27:e.legendary?24:e.elite?20:15,
    e.boss?.38:e.legendary?.38:e.elite?.34:.26
  );

  if(e.legendary){
    ctx.save();
    ctx.globalAlpha=.30+.12*Math.sin(G.time*7);
    ctx.strokeStyle='#ffe36e';
    ctx.shadowColor='#ffb83d';
    ctx.shadowBlur=28;
    ctx.lineWidth=6;
    ctx.beginPath();
    ctx.arc(x,y-50,68+Math.sin(G.time*4)*5,0,Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  if(e.master){
    ctx.save();
    ctx.globalAlpha=.22+.08*Math.sin(G.time*6);
    ctx.strokeStyle='#ffe889';
    ctx.shadowColor='#ffe889';
    ctx.shadowBlur=22;
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.arc(
      x,y-48,
      (e.boss?88:54)+Math.sin(G.time*4)*4,
      0,Math.PI*2
    );
    ctx.stroke();
    ctx.restore();
  }

  if(e.elite){
    ctx.save();
    ctx.globalAlpha=.18+.08*Math.sin(G.time*5);
    ctx.strokeStyle='#ffe875';
    ctx.shadowColor='#ffe875';
    ctx.shadowBlur=20;
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.arc(x,y-48,52+Math.sin(G.time*3)*3,0,Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(x+hitKick,y);
  ctx.rotate(lean);

  if(e.hit>0)
    ctx.globalAlpha=.72+Math.sin(G.time*80)*.22;

  if(e.boss)
    drawBossCreature(e,bob);
  else
    drawWorldCreature(e,bob);

  // Loose pencil contours and hurt-frame scratches.
  ctx.save();
  ctx.globalAlpha=.24;
  ctx.strokeStyle='#111927';
  ctx.lineWidth=1.5;
  ctx.beginPath();
  ctx.ellipse(
    sketchRand(e.x*.1)*3,
    -45+sketchRand(e.x*.2)*2,
    e.boss?70:40,
    e.boss?88:53,
    0,0,Math.PI*2
  );
  ctx.stroke();
  ctx.restore();

  if(e.hit>0){
    for(let i=0;i<7;i++){
      const sy=-92+i*18;

      sketchLine(
        ctx,
        -78,sy,
        -42,sy-8,
        'rgba(16,20,28,.55)',
        2,2,2.8,
        e.x+i
      );
    }
  }

  ctx.restore();

  const ratio=clamp(e.hp/e.maxHP,0,1),
        bw=e.boss?124:e.legendary?108:e.elite?88:68,
        by=y-(e.boss?158:e.legendary?140:e.elite?124:108);

  rr(
    ctx,
    x-bw/2,by,
    bw,8,4,
    'rgba(4,8,18,.9)',
    'rgba(255,255,255,.12)',
    1
  );

  rr(
    ctx,
    x-bw/2+1,
    by+1,
    (bw-2)*ratio,
    6,3,
    e.boss?'#ff657d':'#69e3a1'
  );

  if(
    e.boss||
    e.elite||
    e.legendary||
    e.corrupted||
    e.master
  ){
    ctx.fillStyle=
      e.legendary?'#fff0a3':
      e.master?'#fff0a3':
      e.boss?'#fff':
      e.corrupted?'#ff9be4':
      '#ffe98a';

    ctx.font=
      '900 '+(e.boss?11:9)+'px system-ui';

    ctx.textAlign='center';
    ctx.fillText(e.name,x,by-10);
    ctx.textAlign='left';
  }

  if(e.corrupted){
    ctx.save();

    ctx.globalAlpha=
      .45+
      .15*Math.sin(G.time*9+e.x);

    ctx.strokeStyle='#ff3fbd';
    ctx.lineWidth=2;
    ctx.shadowColor='#7d27ff';
    ctx.shadowBlur=12;

    ctx.beginPath();

    ctx.ellipse(
      x,
      y-48,
      e.boss?82:48,
      e.boss?108:64,
      0,
      0,
      Math.PI*2
    );

    ctx.stroke();

    for(let i=0;i<4;i++){
      ctx.fillStyle=
        i%2
          ?'#ff4fc8'
          :'#7c31ff';

      ctx.fillRect(
        x-45+((i*29+e.x)%90),
        y-105+i*19,
        10+i*2,
        3
      );
    }

    ctx.restore();
  }
}


function enemyEyes(
  y=-48,
  color='#dffcff',
  spread=10
){
  ctx.shadowColor=color;
  ctx.shadowBlur=10;

  ellipse(
    ctx,
    -spread,y,
    4,3,
    color
  );

  ellipse(
    ctx,
    spread,y,
    4,3,
    color
  );

  ctx.shadowBlur=0;
}


function drawWorldCreature(e,bob){
  const v=e.variant||0,
        hit=e.hit>0?'#ffffff':null;

  ctx.lineJoin='round';
  ctx.lineCap='round';

  if(e.world==='earth'){
    // Moss stalker / beetle / ruin crawler.
    const body=
      hit||
      [
        '#4f9b65',
        '#66866c',
        '#7b7b68'
      ][v];

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

    const g=
      ctx.createLinearGradient(
        -38,-70,
        40,-18
      );

    g.addColorStop(
      0,
      hit||'#a7df86'
    );

    g.addColorStop(
      1,
      body
    );

    ellipse(
      ctx,
      0,-42+bob,
      40,27,
      g,
      '#17372e',
      5
    );

    ctx.fillStyle=
      hit||'#8ee6d1';

    ctx.strokeStyle='#315a55';
    ctx.lineWidth=3;

    for(let i=-1;i<=1;i++){
      ctx.beginPath();

      ctx.moveTo(
        i*18,
        -60+bob
      );

      ctx.lineTo(
        i*18+9,
        -88-(i===0?8:0)+bob
      );

      ctx.lineTo(
        i*18+16,
        -58+bob
      );

      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ellipse(
      ctx,
      35,-47+bob,
      19,17,
      hit||'#5c8d62',
      '#17372e',
      4
    );

    enemyEyes(
      -50+bob,
      '#caff9c',
      7
    );

  }else if(e.world==='music'){

    // Amp spider.
    ctx.strokeStyle='#17142e';
    ctx.lineWidth=8;

    for(const side of[-1,1]){
      for(let i=0;i<3;i++){
        const yy=
          -50+i*14+bob;

        ctx.beginPath();

        ctx.moveTo(
          side*25,
          yy
        );

        ctx.lineTo(
          side*(45+i*4),
          yy-10
        );

        ctx.lineTo(
          side*(57+i*5),
          yy+7
        );

        ctx.stroke();
      }
    }

    const g=
      ctx.createLinearGradient(
        -35,-78,
        35,-15
      );

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
      -34,-77+bob,
      68,61,18,
      g,
      '#17142e',
      5
    );

    ctx.shadowColor='#6cecff';
    ctx.shadowBlur=12;

    ellipse(
      ctx,
      0,-47+bob,
      20,20,
      '#15182b',
      '#7b70ff',
      4
    );

    ellipse(
      ctx,
      0,-47+bob,
      8,8,
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
        i%2
          ?'#ff70d8'
          :'#68efff'
      );
    }

  }else if(e.world==='money'){

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

    const g=
      ctx.createLinearGradient(
        -38,-75,
        38,-10
      );

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
      -40,-65+bob,
      80,52,10,
      g,
      '#49321e',
      5
    );

    rr(
      ctx,
      -42,-78+bob,
      84,24,12,
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
      0,-72+bob,
      11,11,
      '#f0d16b',
      '#70572a',
      3
    );

    ctx.fillStyle='#5a4025';
    ctx.font='900 11px system-ui';
    ctx.textAlign='center';
    ctx.fillText('R',0,-68+bob);
    ctx.textAlign='left';

    enemyEyes(
      -51+bob,
      '#fff2a6',
      17
    );

  }else if(e.world==='cosmos'){

    // Meteor crab.
    ctx.strokeStyle='#22264e';
    ctx.lineWidth=7;

    for(const side of[-1,1]){
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
        15,11,
        hit||'#6e72bb',
        '#292c58',
        4
      );
    }

    const g=
      ctx.createRadialGradient(
        -10,-58,3,
        0,-45,42
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
      0,-42+bob,
      39,31,
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

    ctx.rotate(Math.PI/4);

    ctx.fillStyle='#dffcff';

    ctx.fillRect(
      -8,-8,
      16,16
    );

    ctx.restore();

    ctx.shadowBlur=0;

    enemyEyes(
      -58+bob,
      '#dffcff',
      13
    );

  }else if(e.world==='war'){

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

    const g=
      ctx.createLinearGradient(
        -32,-90,
        32,-20
      );

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
      -33,-88+bob,
      66,64,12,
      g,
      '#2b2326',
      5
    );

    rr(
      ctx,
      -23,-105+bob,
      46,26,9,
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
      30,5
    );

    ctx.shadowBlur=0;

    rr(
      ctx,
      45,-53+bob,
      28,12,5,
      '#3a3033',
      '#201b1d',
      4
    );

  }else if(e.world==='void'){

    // Shadow hound / wraith.
    ctx.strokeStyle='#10091a';
    ctx.lineWidth=9;

    ctx.beginPath();

    ctx.moveTo(-22,-28+bob);
    ctx.lineTo(-31,3);

    ctx.moveTo(18,-28+bob);
    ctx.lineTo(26,3);

    ctx.stroke();

    const g=
      ctx.createLinearGradient(
        -42,-72,
        40,-16
      );

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
      -4,-43+bob,
      39,25,
      g,
      '#10091a',
      5
    );

    ellipse(
      ctx,
      30,-52+bob,
      22,20,
      hit||'#3a1c50',
      '#10091a',
      5
    );

    ctx.fillStyle=
      hit||'#6f49a1';

    ctx.beginPath();

    ctx.moveTo(18,-68+bob);
    ctx.lineTo(25,-92+bob);
    ctx.lineTo(33,-68+bob);

    ctx.moveTo(35,-68+bob);
    ctx.lineTo(49,-88+bob);
    ctx.lineTo(48,-61+bob);

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

  }else if(e.world==='corruptrealm'){

    // Corruption husk.
    ctx.strokeStyle='#16051f';
    ctx.lineWidth=8;

    for(const side of[-1,1]){
      ctx.beginPath();

      ctx.moveTo(
        side*18,
        -28+bob
      );

      ctx.lineTo(
        side*31,
        3
      );

      ctx.moveTo(
        side*28,
        -58+bob
      );

      ctx.lineTo(
        side*55,
        -43+bob
      );

      ctx.stroke();
    }

    const g=
      ctx.createLinearGradient(
        -36,-96,
        38,-16
      );

    g.addColorStop(
      0,
      hit||'#ff4fbd'
    );

    g.addColorStop(
      .45,
      hit||'#7029a8'
    );

    g.addColorStop(
      1,
      hit||'#25102f'
    );

    ctx.fillStyle=g;
    ctx.strokeStyle='#16051f';
    ctx.lineWidth=5;

    ctx.beginPath();

    ctx.moveTo(-33,-86+bob);
    ctx.lineTo(-13,-104+bob);
    ctx.lineTo(7,-92+bob);
    ctx.lineTo(28,-105+bob);
    ctx.lineTo(40,-67+bob);
    ctx.lineTo(28,-25+bob);
    ctx.lineTo(-30,-22+bob);
    ctx.lineTo(-43,-58+bob);

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor='#ff43c7';
    ctx.shadowBlur=18;

    ellipse(
      ctx,
      -9,-66+bob,
      5,4,
      '#ff8cdd'
    );

    ellipse(
      ctx,
      12,-62+bob,
      7,3,
      '#a66cff'
    );

    ctx.shadowBlur=0;

    ctx.fillStyle='#ff4fc8';

    for(let i=0;i<4;i++){
      ctx.fillRect(
        -45+i*24,
        -48+(i%2)*12+bob,
        15,3
      );
    }

  }else{

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

    const g=
      ctx.createLinearGradient(
        -34,-90,
        34,-20
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

    ctx.moveTo(-30,-84+bob);
    ctx.lineTo(25,-92+bob);
    ctx.lineTo(38,-58+bob);
    ctx.lineTo(24,-24+bob);
    ctx.lineTo(-34,-30+bob);
    ctx.lineTo(-42,-61+bob);

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    rr(
      ctx,
      -22,-76+bob,
      44,22,6,
      '#071927',
      '#163c4d',
      3
    );

    ctx.fillStyle='#6efff2';

    ctx.fillRect(
      -14,
      -68+bob,
      10,4
    );

    ctx.fillStyle='#e46dff';

    ctx.fillRect(
      5,
      -68+bob,
      14,4
    );

    ctx.globalAlpha=.5;
    ctx.fillStyle='#65f4ff';

    ctx.fillRect(
      -48,
      -49+bob,
      20,4
    );

    ctx.fillStyle='#e45cff';

    ctx.fillRect(
      25,
      -35+bob,
      30,4
    );

    ctx.globalAlpha=1;
  }
}


function drawBossCreature(e,bob){
  const accent=
    WORLDS[e.world]?.accent||
    '#ff7589',

        hit=
          e.hit>0
            ?'#fff'
            :accent;

  ctx.scale(1.45,1.45);

  ctx.strokeStyle='#171422';
  ctx.lineWidth=8;

  // Heavy legs and arms.
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
      -48,-120,
      48,-20
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

  ctx.moveTo(-45,-98+bob);
  ctx.lineTo(-22,-122+bob);
  ctx.lineTo(0,-112+bob);
  ctx.lineTo(22,-122+bob);
  ctx.lineTo(45,-98+bob);
  ctx.lineTo(50,-45+bob);
  ctx.lineTo(27,-22+bob);
  ctx.lineTo(-28,-22+bob);
  ctx.lineTo(-50,-45+bob);

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  rr(
    ctx,
    -34,-103+bob,
    68,30,10,
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

  ctx.rotate(Math.PI/4);

  ctx.fillStyle='#fff';
  ctx.strokeStyle=accent;
  ctx.lineWidth=3;

  ctx.fillRect(
    -9,-9,
    18,18
  );

  ctx.strokeRect(
    -9,-9,
    18,18
  );

  ctx.restore();

  ctx.shadowBlur=0;

  // World-specific boss silhouette details.
  ctx.fillStyle=hit;
  ctx.strokeStyle='#171422';
  ctx.lineWidth=4;

  if(
    e.world==='earth'||
    e.world==='void'
  ){
    ctx.beginPath();

    ctx.moveTo(-36,-105+bob);
    ctx.lineTo(-52,-138+bob);
    ctx.lineTo(-20,-114+bob);

    ctx.moveTo(36,-105+bob);
    ctx.lineTo(52,-138+bob);
    ctx.lineTo(20,-114+bob);

    ctx.fill();
    ctx.stroke();
  }

  if(e.world==='war'){
    rr(
      ctx,
      -76,-52+bob,
      34,16,5,
      '#4b3a3d',
      '#171422',
      4
    );

    rr(
      ctx,
      42,-52+bob,
      34,16,5,
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
      28,5
    );

    ctx.fillStyle='#e45cff';

    ctx.fillRect(
      35,
      -42+bob,
      32,5
    );

    ctx.globalAlpha=1;
  }
}


function drawProp(type,x,y,cam,world){
  x-=cam;

  ctx.save();
  ctx.translate(x,y);
  ctx.lineJoin='round';
  ctx.lineCap='round';

  const k=type%4;

  if(world==='earth'){

    if(k===0){
      const trunk=
        ctx.createLinearGradient(
          -18,-120,
          18,0
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
        -17,-112,
        34,116,13,
        trunk,
        '#2f2b26',
        4
      );

      for(
        const[
          dx,
          dy,
          r
        ] of[
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
          dx,dy,
          r,r*.72,
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
          3,6,
          '#7de6b0'
        );
      }

    }else if(k===1){

      const stone=
        ctx.createLinearGradient(
          -45,-150,
          45,8
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
        -35,-140,
        70,145,13,
        stone,
        '#484c48',
        5
      );

      rr(
        ctx,
        -50,-158,
        100,24,8,
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
        -58,-55,
        -38,-86
      );

      ctx.quadraticCurveTo(
        -20,-58,
        -20,-18
      );

      ctx.fill();

    }else if(k===2){

      ctx.save();
      ctx.shadowColor='#8ef4ff';
      ctx.shadowBlur=20;

      for(
        const[
          dx,
          h
        ] of[
          [-24,58],
          [0,86],
          [24,48]
        ]
      ){
        const cg=
          ctx.createLinearGradient(
            0,-h,
            0,0
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

        ctx.moveTo(dx,-h);
        ctx.lineTo(dx+13,-8);
        ctx.lineTo(dx+7,4);
        ctx.lineTo(dx-9,2);
        ctx.lineTo(dx-13,-10);

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();

    }else{

      rr(
        ctx,
        -48,-68,
        96,72,14,
        '#415a61',
        '#1f3438',
        5
      );

      rr(
        ctx,
        -34,-55,
        68,18,6,
        '#6ed7be',
        '#274b49',
        3
      );

      ctx.fillStyle='#b7d1a4';
      ctx.fillRect(-28,-27,56,5);

      ctx.strokeStyle='#283a3e';

      ctx.beginPath();
      ctx.moveTo(-35,-68);
      ctx.lineTo(-15,-88);
      ctx.lineTo(23,-81);
      ctx.stroke();
    }

  }else if(world==='music'){

    if(k===0){
      const sg=
        ctx.createLinearGradient(
          -45,-135,
          45,5
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
        -42,-132,
        84,136,14,
        sg,
        '#11152c',
        5
      );

      for(
        const[
          yy,
          r
        ] of[
          [-98,24],
          [-42,30]
        ]
      ){
        ctx.shadowColor='#6cecff';
        ctx.shadowBlur=10;

        ellipse(
          ctx,
          0,yy,
          r,r,
          '#15182b',
          '#7b70ff',
          5
        );

        ellipse(
          ctx,
          0,yy,
          r*.42,
          r*.42,
          '#65efff',
          '#26294b',
          3
        );
      }

      ctx.shadowBlur=0;

    }else if(k===1){

      rr(
        ctx,
        -34,-150,
        68,154,10,
        '#201742',
        '#101127',
        5
      );

      for(let yy=-132;yy<-15;yy+=18){
        rr(
          ctx,
          -23,yy,
          46,9,3,
          yy%36===0
            ?'#ff70d8'
            :'#68efff'
        );
      }

      ctx.shadowColor='#ff70d8';
      ctx.shadowBlur=14;

      ellipse(
        ctx,
        0,-165,
        15,15,
        '#ff78d8',
        '#542454',
        3
      );

      ctx.shadowBlur=0;

    }else if(k===2){

      ctx.save();

      ctx.translate(
        0,
        -70+
        Math.sin(
          G.time*3+
          x*.01
        )*6
      );

      ctx.rotate(G.time*.25);

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

    }else{

      rr(
        ctx,
        -52,-62,
        104,66,16,
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
          8,h,2,
          i%2
            ?'#ff6fd4'
            :'#67ecff'
        );
      }
    }

  }else if(world==='money'){

    if(k===0){
      rr(
        ctx,
        -52,-76,
        104,80,10,
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
          20,31
        );
      }

    }else if(k===1){

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
        0,-122,
        24,24,
        '#f4d16b',
        '#7c6229',
        4
      );

      ctx.fillStyle='#fff2a6';
      ctx.font='900 19px system-ui';
      ctx.textAlign='center';
      ctx.fillText('R',0,-115);

      ctx.shadowBlur=0;

    }else if(k===2){

      rr(
        ctx,
        -48,-112,
        96,116,14,
        '#7c8b83',
        '#35433c',
        5
      );

      ellipse(
        ctx,
        0,-52,
        32,32,
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

    }else{

      rr(
        ctx,
        -48,-48,
        96,52,10,
        '#9d7540',
        '#4b3824',
        5
      );

      rr(
        ctx,
        -37,-38,
        30,28,5,
        '#c89a50',
        '#5f4526',
        3
      );

      rr(
        ctx,
        7,-38,
        30,28,5,
        '#c89a50',
        '#5f4526',
        3
      );

      ellipse(
        ctx,
        0,-58,
        12,12,
        '#f1d16b',
        '#6e5725',
        3
      );
    }

  }else if(world==='cosmos'){

    if(k===0){
      rr(
        ctx,
        -16,-90,
        32,94,9,
        '#768ba8',
        '#27354c',
        4
      );

      ctx.strokeStyle='#d8efff';
      ctx.lineWidth=5;

      ctx.beginPath();
      ctx.arc(
        0,-105,
        34,
        .15,
        Math.PI-.15
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0,-104);
      ctx.lineTo(22,-128);
      ctx.stroke();

      ctx.shadowColor='#73efff';
      ctx.shadowBlur=14;

      ellipse(
        ctx,
        24,-131,
        7,7,
        '#dffcff'
      );

      ctx.shadowBlur=0;

    }else if(k===1){

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

    }else if(k===2){

      rr(
        ctx,
        -47,-74,
        94,78,16,
        '#394e6b',
        '#17253b',
        5
      );

      ellipse(
        ctx,
        0,-38,
        27,22,
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

    }else{

      rr(
        ctx,
        -48,-56,
        96,60,12,
        '#27384f',
        '#101a2a',
        5
      );

      rr(
        ctx,
        -35,-43,
        70,14,5,
        '#6cecff',
        '#24475f',
        3
      );

      for(let i=0;i<4;i++){
        ellipse(
          ctx,
          -24+i*16,
          -13,
          4,4,
          i===2
            ?'#ff6d8c'
            :'#a7f7ff'
        );
      }
    }

  }else if(world==='war'){

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
          12,48
        );
      }

    }else if(k===1){

      rr(
        ctx,
        -35,-52,
        70,56,12,
        '#4a4f4d',
        '#202625',
        5
      );

      ellipse(
        ctx,
        0,-62,
        30,22,
        '#626864',
        '#202625',
        4
      );

      rr(
        ctx,
        12,-70,
        68,14,6,
        '#3b403f',
        '#1c2020',
        4
      );

      ctx.shadowColor='#ff735c';
      ctx.shadowBlur=10;

      ellipse(
        ctx,
        75,-63,
        5,5,
        '#ff8b68'
      );

      ctx.shadowBlur=0;

    }else if(k===2){

      for(
        const[
          dx,
          dy
        ] of[
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
          44,26,12,
          '#8a7456',
          '#453b2d',
          3
        );
      }

    }else{

      ctx.save();
      ctx.rotate(-.18);

      rr(
        ctx,
        -48,-60,
        96,62,13,
        '#50575b',
        '#242a2d',
        5
      );

      ellipse(
        ctx,
        -18,-28,
        18,18,
        '#22292c',
        '#8c4e3d',
        4
      );

      ctx.strokeStyle='#d46c4e';
      ctx.lineWidth=5;

      ctx.beginPath();
      ctx.moveTo(20,-49);
      ctx.lineTo(48,-75);
      ctx.stroke();

      ctx.restore();
    }

  }else if(world==='void'){

    if(k===0){
      const vg=
        ctx.createLinearGradient(
          -32,-145,
          32,5
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

    }else if(k===1){

      ctx.save();
      ctx.shadowColor='#a66cff';
      ctx.shadowBlur=24;

      for(
        const[
          dx,
          h
        ] of[
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

    }else if(k===2){

      ctx.strokeStyle='#19111f';
      ctx.lineWidth=14;

      ctx.beginPath();

      ctx.moveTo(0,4);

      ctx.quadraticCurveTo(
        -18,-65,
        -4,-130
      );

      ctx.stroke();

      ctx.lineWidth=7;

      for(const side of[-1,1]){
        ctx.beginPath();

        ctx.moveTo(-4,-92);

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
        0,-72,
        8,8,
        '#a778ff'
      );

      ctx.shadowBlur=0;

    }else{

      rr(
        ctx,
        -48,-58,
        96,62,10,
        '#151020',
        '#09070d',
        5
      );

      ctx.shadowColor='#9f70ff';
      ctx.shadowBlur=18;

      ellipse(
        ctx,
        0,-29,
        20,20,
        '#3d245d',
        '#9d70ff',
        4
      );

      ellipse(
        ctx,
        0,-29,
        7,7,
        '#d8c5ff'
      );

      ctx.shadowBlur=0;
    }

  }else{

    // Perfect Matrix props.
    if(k===0){
      rr(
        ctx,
        -30,-132,
        60,136,8,
        '#102c3a',
        '#43d7d2',
        4
      );

      for(let yy=-112;yy<-12;yy+=20){
        rr(
          ctx,
          -19,yy,
          38,7,2,
          yy%40===0
            ?'#58f1ec'
            :'#8a73ff'
        );
      }

    }else if(k===1){

      ctx.save();

      ctx.translate(
        0,
        -64
      );

      ctx.rotate(G.time*.45);

      ctx.shadowColor='#59f5ef';
      ctx.shadowBlur=20;
      ctx.strokeStyle='#7afaf5';
      ctx.lineWidth=4;

      ctx.strokeRect(
        -30,-30,
        60,60
      );

      ctx.rotate(Math.PI/4);

      ctx.strokeRect(
        -20,-20,
        40,40
      );

      ctx.restore();

    }else if(k===2){

      rr(
        ctx,
        -50,-66,
        100,70,12,
        '#0c2230',
        '#31586a',
        5
      );

      ctx.fillStyle='#8efcf8';
      ctx.font='900 12px monospace';

      ctx.fillText(
        '0101 1100',
        -32,-35
      );

      ctx.fillText(
        '0010 0111',
        -32,-16
      );

    }else{

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
        const[
          dx,
          dy
        ] of[
          [0,-105],
          [-40,-108],
          [44,-94]
        ]
      ){
        ellipse(
          ctx,
          dx,dy,
          9,9,
          '#8afcf7',
          '#173f4b',
          3
        );
      }
    }
  }

  ctx.restore();
}


function drawWorldBackground(w,cam){
  const id=G.worldId,
        t=G.time||0;

  const sky=
    ctx.createLinearGradient(
      0,0,
      0,H
    );

  sky.addColorStop(0,w.skyA);
  sky.addColorStop(.58,w.skyB);
  sky.addColorStop(1,w.ground);

  ctx.fillStyle=sky;
  ctx.fillRect(0,0,W,H);


  if(id==='earth'){
    const sun=
      ctx.createRadialGradient(
        1035,115,5,
        1035,115,92
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
    ctx.arc(1035,115,92,0,Math.PI*2);
    ctx.fill();

    for(let i=0;i<7;i++){
      let x=
        (
          (
            i*235-
            cam*.035
          )%
          1700+
          1700
        )%
        1700-
        160,

        y=
          90+
          (i%3)*48;

      ctx.globalAlpha=.5;
      ctx.fillStyle='#f5fbef';

      ellipse(ctx,x,y,58,18);
      ellipse(ctx,x+45,y+5,42,15);
      ellipse(ctx,x-42,y+7,35,13);
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
      ctx.moveTo(0,410);

      for(let i=0;i<7;i++){
        const x=
          i*240-
          (
            cam*
            (
              .035+
              layer*.035
            )
          )%
          240-
          120,

          y=
            270-
            layer*15-
            (
              (i+layer)%3
            )*
            45;

        ctx.lineTo(x,y);
        ctx.lineTo(x+150,390);
      }

      ctx.lineTo(W,410);
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
          )%
          1800+
          1800
        )%
        1800-
        100,

        h=
          35+
          (i%5)*18;

      ctx.fillRect(
        x,
        370-h,
        75,h
      );

      if(i%3===0){
        ctx.clearRect(
          x+18,
          370-h+12,
          16,12
        );
      }
    }
  }


  if(id==='music'){
    const moon=
      ctx.createRadialGradient(
        1080,125,8,
        1080,125,105
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
    ctx.arc(1080,125,105,0,Math.PI*2);
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
          )%
          1900+
          1900
        )%
        1900-
        80,

        h=
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
        54,h
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
          34,5
        );
      }
    }

    ctx.strokeStyle=
      'rgba(210,240,255,.18)';

    ctx.lineWidth=2;

    for(let yy=180;yy<300;yy+=24){
      ctx.beginPath();
      ctx.moveTo(0,yy);
      ctx.lineTo(W,yy);
      ctx.stroke();
    }
  }


  if(id==='money'){
    const sun=
      ctx.createRadialGradient(
        1020,120,5,
        1020,120,95
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
    ctx.arc(1020,120,95,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle=
      'rgba(50,90,59,.28)';

    ctx.beginPath();
    ctx.moveTo(0,390);

    for(let i=0;i<=8;i++){
      const x=
        i*190-
        (
          cam*.05
        )%
        190,

        y=
          275+
          Math.sin(i*1.7)*45;

      ctx.quadraticCurveTo(
        x+95,
        y-35,
        x+190,
        350
      );
    }

    ctx.lineTo(W,420);
    ctx.lineTo(0,420);
    ctx.fill();

    for(let i=0;i<12;i++){
      const x=
        (
          (
            i*150-
            cam*.11
          )%
          1900+
          1900
        )%
        1900-
        80,

        base=395,

        h=
          38+
          (i%4)*15;

      ctx.fillStyle=
        'rgba(90,69,42,.5)';

      ctx.fillRect(
        x,
        base-h,
        90,h
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
        12,14
      );

      ctx.fillRect(
        x+57,
        base-h+12,
        12,14
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
      150,70
    );
  }


  if(id==='cosmos'){
    ctx.fillStyle='#020611';
    ctx.fillRect(0,0,W,H);

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
          )%
          1500+
          1500
        )%
        1500,

        y=
          (i*47.2)%390;

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
        x,y,
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
        370,180,20,
        370,180,280
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
    ctx.fillRect(0,0,760,430);

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
          )%
          1900+
          1900
        )%
        1900-
        100,

        y=
          315+
          (i%3)*32;

      ctx.fillStyle=
        'rgba(92,82,144,.55)';

      ctx.beginPath();

      ctx.moveTo(x-55,y);
      ctx.lineTo(x-25,y-28);
      ctx.lineTo(x+38,y-20);
      ctx.lineTo(x+62,y+4);
      ctx.lineTo(x+8,y+18);

      ctx.closePath();
      ctx.fill();
    }
  }


  if(id==='war'){
    const redSun=
      ctx.createRadialGradient(
        1040,145,5,
        1040,145,95
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
    ctx.arc(1040,145,95,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle=
      'rgba(40,31,32,.62)';

    for(let i=0;i<12;i++){
      const x=
        (
          (
            i*145-
            cam*.09
          )%
          1800+
          1800
        )%
        1800-
        100,

        h=
          55+
          (i%4)*35;

      ctx.fillRect(
        x,
        395-h,
        90,h
      );

      if(i%3===0){
        ctx.fillRect(
          x+20,
          395-h-80,
          18,80
        );

        ctx.globalAlpha=.15;

        ellipse(
          ctx,
          x+29,
          395-h-100,
          42,18,
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
        )%
        W,

        y=
          70+
          (i*61)%320;

      ctx.globalAlpha=
        .25+
        (i%4)*.1;

      ctx.fillStyle='#ff9a63';

      ctx.fillRect(
        x,y,
        2,2
      );
    }

    ctx.globalAlpha=1;
  }


  if(id==='void'){
    ctx.fillStyle='#040208';
    ctx.fillRect(0,0,W,H);

    const rift=
      ctx.createRadialGradient(
        1040,160,12,
        1040,160,155
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
      1040,160,
      160,95,
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
        1040,160,
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
          )%
          1900+
          1900
        )%
        1900-
        80,

        y=
          390-
          (i%3)*35;

      ctx.fillStyle=
        'rgba(31,17,45,.78)';

      ctx.beginPath();

      ctx.moveTo(x-24,y);
      ctx.lineTo(
        x-38,
        y-120-(i%2)*55
      );

      ctx.lineTo(
        x,
        y-165-(i%3)*30
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
        W,40
      );
    }

    ctx.restore();
  }


  if(id==='matrix'){
    ctx.fillStyle='#04121d';
    ctx.fillRect(0,0,W,H);

    const glow=
      ctx.createRadialGradient(
        640,280,10,
        640,280,380
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
    ctx.fillRect(0,0,W,500);

    for(let i=0;i<20;i++){
      const x=
        (
          (
            i*95-
            cam*.12
          )%
          1700+
          1700
        )%
        1700-
        80,

        h=
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
        68,h
      );

      ctx.strokeStyle=
        'rgba(90,243,239,.42)';

      ctx.lineWidth=2;

      ctx.strokeRect(
        x,
        400-h,
        68,h
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
          48,4
        );
      }
    }

    ctx.strokeStyle=
      'rgba(90,243,239,.2)';

    ctx.lineWidth=1;

    for(let y=405;y<H;y+=34){
      ctx.beginPath();
      ctx.moveTo(0,y);
      ctx.lineTo(W,y);
      ctx.stroke();
    }

    for(let x=-W;x<W*2;x+=80){
      ctx.beginPath();
      ctx.moveTo(W/2,395);
      ctx.lineTo(x,H);
      ctx.stroke();
    }

    ctx.save();
    ctx.globalAlpha=.18;

    for(let i=0;i<12;i++){
      const x=
        (
          i*137+
          t*18
        )%
        W,

        y=
          70+
          (i*79)%290;

      ctx.fillStyle=
        i%2
          ?'#59f5ef'
          :'#9d7aff';

      ctx.fillRect(
        x,y,
        25+(i%3)*16,
        3
      );
    }

    ctx.restore();
  }


  if(
    ![
      'earth',
      'music',
      'money',
      'cosmos',
      'war',
      'void',
      'matrix'
    ].includes(id)
  ){
    const pulse=
      .5+
      .5*Math.sin(t*.7);

    ctx.save();
    ctx.globalAlpha=.22;

    const halo=
      ctx.createRadialGradient(
        1030,125,8,
        1030,125,95
      );

    halo.addColorStop(
      0,
      w.accent
    );

    halo.addColorStop(
      1,
      'rgba(0,0,0,0)'
    );

    ctx.fillStyle=halo;

    ctx.beginPath();
    ctx.arc(1030,125,95,0,Math.PI*2);
    ctx.fill();

    for(let i=0;i<16;i++){
      const x=
        (
          (
            i*115-
            cam*.08
          )%
          1900+
          1900
        )%
        1900-
        100,

        h=
          35+
          (
            (i*41)%150
          );

      ctx.fillStyle=
        i%2
          ?w.dark
          :w.accent;

      ctx.globalAlpha=
        i%2
          ?.35
          :.13+.08*pulse;

      ctx.fillRect(
        x,
        400-h,
        72,h
      );
    }

    ctx.restore();
  }


  // Ground / walkable plane.
  ctx.fillStyle=w.ground;

  ctx.globalAlpha=
    id==='cosmos'||
    id==='void'||
    id==='matrix'
      ?.82
      :1;

  ctx.fillRect(
    0,400,
    W,320
  );

  ctx.globalAlpha=1;

  const ground=
    ctx.createLinearGradient(
      0,400,
      0,H
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
  ctx.fillRect(0,400,W,320);


  if(id==='earth'){
    ctx.strokeStyle=
      'rgba(219,236,185,.18)';

    ctx.lineWidth=3;

    for(let i=0;i<9;i++){
      const yy=
        430+i*34;

      ctx.beginPath();

      ctx.moveTo(
        0,yy
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
          cam*.35
        )%
        100,

        h=
          16+
          Math.abs(
            Math.sin(
              t*2+i
            )
          )*
          34;

      ctx.fillStyle=
        i%2
          ?'rgba(108,236,255,.18)'
          :'rgba(255,111,216,.18)';

      ctx.fillRect(
        x,410,
        65,h
      );
    }
  }


  if(id==='money'){
    ctx.strokeStyle=
      'rgba(83,62,35,.18)';

    ctx.lineWidth=2;

    for(let y=420;y<H;y+=34){
      for(
        let x=
          (
            (y/34)%2
          )*
          35-
          70;
        x<W;
        x+=70
      ){
        rr(
          ctx,
          x,y,
          62,24,8,
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

    for(let x=-100;x<W+100;x+=120){
      ctx.beginPath();
      ctx.moveTo(x,400);
      ctx.lineTo(x+70,H);
      ctx.stroke();
    }

    for(let y=430;y<H;y+=55){
      ctx.beginPath();
      ctx.moveTo(0,y);
      ctx.lineTo(W,y);
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
        )%
        W,

        y=
          430+
          (i*47)%250;

      ctx.beginPath();

      ctx.moveTo(
        x-22,y
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
        )%
        W,

        y=
          430+
          (i*53)%250;

      ctx.globalAlpha=.12;

      ellipse(
        ctx,
        x,y,
        18+(i%3)*10,
        5,
        '#a879ff'
      );
    }

    ctx.globalAlpha=1;
  }
}


function drawSegmentMarkers(w,cam){
  if(!G.worldId)return;

  const names=
    segmentNames(G.worldId);

  const count=
    segmentCount(G.worldId);

  for(let i=1;i<count;i++){
    const wx=
      w.width*
      (
        i/count
      ),

      x=
        wx-cam;

    if(
      x<-90||
      x>W+90
    )continue;

    ctx.save();
    ctx.globalAlpha=.72;

    const accent=
      w.accent||
      '#6cecff';

    ctx.strokeStyle=accent;
    ctx.lineWidth=3;
    ctx.shadowColor=accent;
    ctx.shadowBlur=14;

    ctx.beginPath();
    ctx.moveTo(x,430);
    ctx.lineTo(x,610);
    ctx.stroke();

    ctx.shadowBlur=0;

    ctx.fillStyle=
      'rgba(5,13,25,.88)';

    ctx.strokeStyle=accent;
    ctx.lineWidth=2;

    rr(
      ctx,
      x-48,438,
      96,38,12,
      'rgba(5,13,25,.88)',
      accent,
      2
    );

    ctx.fillStyle='#eafcff';
    ctx.font='1000 13px system-ui';
    ctx.textAlign='center';

    ctx.fillText(
      segmentCode(
        G.worldId,
        i
      ),
      x,
      454
    );

    ctx.fillStyle=
      'rgba(220,244,255,.72)';

    ctx.font='800 7px system-ui';

    ctx.fillText(
      (
        names[i]||
        'NEXT SEGMENT'
      )
      .toUpperCase()
      .slice(0,18),
      x,
      467
    );

    ctx.textAlign='left';
    ctx.restore();
  }
}


function drawWorldAmbience(w,cam){
  const id=G.worldId,
        t=G.time,
        g=w.gimmick||id;

  ctx.save();
  ctx.globalAlpha=.55;

  const count=34;

  for(let i=0;i<count;i++){
    let x=
      (
        (
          i*173+
          t*
          (
            18+
            (i%5)*9
          )-
          cam*.05
        )%
        (W+120)+
        W+120
      )%
      (W+120)-
      60,

      y=
        (
          i*97+
          t*
          (
            12+
            (i%3)*7
          )
        )%
        430;

    if(g==='ice'){
      ctx.fillStyle='#efffff';

      ctx.fillRect(
        x,y,
        2+(i%2),
        2+(i%2)
      );

    }else if(
      g==='heat'||
      id==='war'
    ){
      ctx.fillStyle=
        i%3
          ?'#ff9b58'
          :'#ffd27a';

      ctx.fillRect(
        x,
        H-y*.55,
        2,4
      );

    }else if(g==='water'){
      ctx.strokeStyle=
        'rgba(210,255,255,.75)';

      ctx.lineWidth=1.5;

      ctx.beginPath();

      ctx.arc(
        x,
        410-y*.7,
        2+i%4,
        0,
        Math.PI*2
      );

      ctx.stroke();

    }else if(
      g==='vines'||
      id==='jungle'
    ){
      ctx.fillStyle='#d6ff87';

      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(t+i);
      ctx.fillRect(-4,-1,8,2);
      ctx.restore();

    }else if(g==='sand'){
      ctx.fillStyle='#ffe0a0';

      ctx.fillRect(
        x,
        120+
        (
          i*53+
          t*55
        )%
        390,
        5,1
      );

    }else if(g==='lightning'){
      ctx.fillStyle=
        i%5
          ?'#d8efff'
          :'#fff76f';

      ctx.fillRect(
        x,y,
        2,5
      );

    }else if(g==='ghost'){
      ctx.fillStyle=
        'rgba(220,239,255,.55)';

      ellipse(
        ctx,
        x,y,
        3+i%3,
        2,
        'rgba(220,239,255,.45)'
      );

    }else if(g==='ink'){
      ctx.fillStyle=
        'rgba(20,20,18,.32)';

      ellipse(
        ctx,
        x,y,
        2+i%4,
        2+i%4,
        'rgba(20,20,18,.28)'
      );

    }else if(
      g==='quantum'||
      id==='matrix'||
      g==='security'
    ){
      ctx.fillStyle=
        i%2
          ?w.accent
          :'#fff';

      ctx.fillRect(
        x,y,
        2+(i%4)*3,
        1
      );

    }else if(
      g==='dream'||
      g==='sugar'||
      g==='bounce'
    ){
      ctx.fillStyle=
        i%2
          ?w.accent
          :'#fff';

      ellipse(
        ctx,
        x,y,
        2+i%3,
        2+i%3,
        ctx.fillStyle
      );

    }else{
      ctx.fillStyle=
        'rgba(255,255,255,.38)';

      ctx.fillRect(
        x,y,
        1+(i%2),
        1+(i%2)
      );
    }
  }

  ctx.restore();
}


function drawSupportDrone(cam=0){
  if(!(P.droneLevel>0))return;

  const x=
    P.x-
    cam+
    P.facing*-48,

    y=
      P.y-
      P.jump-
      112+
      Math.sin(G.time*4)*7;

  ctx.save();
  ctx.translate(x,y);

  ctx.shadowColor='#72eaff';
  ctx.shadowBlur=16;

  ellipse(
    ctx,
    0,0,
    19,11,
    '#263d55',
    '#9bf6ff',
    3
  );

  ellipse(
    ctx,
    0,1,
    7,5,
    '#bffcff'
  );

  ctx.strokeStyle='#83edff';
  ctx.lineWidth=3;

  ctx.beginPath();

  ctx.moveTo(-18,0);
  ctx.lineTo(-30,8);

  ctx.moveTo(18,0);
  ctx.lineTo(30,8);

  ctx.stroke();

  ctx.globalAlpha=.55;

  ellipse(
    ctx,
    0,15,
    12,3,
    '#72eaff'
  );

  ctx.restore();
}


function drawWorldMiniMap(){
  if(!G.worldId)return;

  const w=WORLDS[G.worldId],
        x=430,
        y=690,
        width=420;

  ctx.save();

  rr(
    ctx,
    x,y,
    width,12,6,
    'rgba(4,11,22,.76)',
    'rgba(170,238,255,.22)',
    1
  );

  const px=
    x+
    clamp(
      P.x/w.width,
      0,
      1
    )*
    width;

  ctx.fillStyle=
    'rgba(110,232,255,.20)';

  rr(
    ctx,
    x+2,
    y+2,
    Math.max(
      3,
      px-x-2
    ),
    8,4,
    'rgba(110,232,255,.20)'
  );

  for(const p of G.pickups){
    if(p.taken)continue;

    const qx=
      x+
      clamp(
        p.x/w.width,
        0,
        1
      )*
      width;

    if(p.kind==='fragment'){
      ctx.fillStyle='#dffcff';
      ctx.fillRect(qx-1,y+3,3,6);
    }

    if(
      p.kind==='chest'||
      p.kind==='mapCache'
    ){
      ctx.fillStyle='#ffe17b';
      ctx.fillRect(qx-2,y+2,4,8);
    }

    if(p.kind==='shrine'){
      ctx.fillStyle='#c6a6ff';
      ctx.fillRect(qx-1,y+1,3,10);
    }
  }

  ctx.shadowColor='#fff';
  ctx.shadowBlur=8;
  ctx.fillStyle='#fff';

  ctx.beginPath();
  ctx.arc(px,y+6,4,0,Math.PI*2);
  ctx.fill();

  ctx.shadowBlur=0;

  ctx.fillStyle='#b8cce0';
  ctx.font='800 7px system-ui';
  ctx.textAlign='center';

  ctx.fillText(
    segmentCode(G.worldId)+
    ' · '+
    currentSegmentName().toUpperCase(),
    x+width/2,
    y-5
  );

  ctx.textAlign='left';
  ctx.restore();
}


function drawCinematicGrade(){
  ctx.save();

  const v=
    ctx.createRadialGradient(
      W/2,H*.48,180,
      W/2,H*.48,760
    );

  v.addColorStop(
    0,
    'rgba(0,0,0,0)'
  );

  v.addColorStop(
    .72,
    'rgba(3,7,18,.03)'
  );

  v.addColorStop(
    1,
    'rgba(2,5,14,.26)'
  );

  ctx.fillStyle=v;
  ctx.fillRect(0,0,W,H);

  ctx.globalAlpha=.05;

  for(let y=0;y<H;y+=4){
    ctx.fillStyle='#fff';
    ctx.fillRect(0,y,W,1);
  }

  ctx.restore();
}


function drawCorruptionAtmosphere(
  cam,
  foreground=false
){
  if(
    !(
      P.corruptedRun||
      G.worldId==='corruptrealm'
    )
  )return;

  const t=G.time||0;

  ctx.save();

  if(!foreground){
    const g=
      ctx.createLinearGradient(
        0,0,
        W,H
      );

    g.addColorStop(
      0,
      'rgba(91,18,128,.16)'
    );

    g.addColorStop(
      .5,
      'rgba(255,28,143,.05)'
    );

    g.addColorStop(
      1,
      'rgba(12,0,20,.24)'
    );

    ctx.fillStyle=g;
    ctx.fillRect(0,0,W,H);

    for(let i=0;i<22;i++){
      const x=
        (
          (
            i*173+
            t*
            (
              18+i%3
            )*
            (
              (i%2)
                ?1
                :-1
            )-
            cam*.03
          )%
          1500+
          1500
        )%
        1500-
        100,

        y=
          80+
          (i*47)%500;

      ctx.globalAlpha=
        .16+
        (i%4)*.04;

      ctx.fillStyle=
        i%2
          ?'#ff43c0'
          :'#7938ff';

      ctx.fillRect(
        x,y,
        8+(i%5)*5,
        2+(i%3)*2
      );
    }

  }else{
    ctx.globalAlpha=.13;
    ctx.fillStyle='#ff39b8';

    for(let y=40;y<H;y+=31){
      ctx.fillRect(
        0,
        y+
        Math.sin(
          t*4+y
        )*
        2,
        W,1
      );
    }

    ctx.globalAlpha=.18;

    const vg=
      ctx.createRadialGradient(
        W/2,H/2,120,
        W/2,H/2,720
      );

    vg.addColorStop(
      0,
      'rgba(0,0,0,0)'
    );

    vg.addColorStop(
      1,
      'rgba(40,0,45,.9)'
    );

    ctx.fillStyle=vg;
    ctx.fillRect(0,0,W,H);
  }

  ctx.restore();
}


function drawMasterAtmosphere(
  cam,
  foreground=false
){
  if(!P.masterRun)return;

  const t=G.time||0;

  ctx.save();

  if(!foreground){
    const g=
      ctx.createLinearGradient(
        0,0,
        0,H
      );

    g.addColorStop(
      0,
      'rgba(255,232,120,.12)'
    );

    g.addColorStop(
      .55,
      'rgba(255,255,255,.025)'
    );

    g.addColorStop(
      1,
      'rgba(80,48,0,.13)'
    );

    ctx.fillStyle=g;
    ctx.fillRect(0,0,W,H);

    for(let i=0;i<26;i++){
      const x=
        (
          (
            i*149+
            t*
            (
              22+i%4
            )-
            cam*.025
          )%
          1500+
          1500
        )%
        1500-
        100,

        y=
          60+
          (i*61)%520;

      ctx.globalAlpha=
        .18+
        (i%4)*.05;

      ctx.fillStyle=
        i%3
          ?'#fff1a3'
          :'#ffffff';

      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(t*.8+i);

      ctx.fillRect(
        -5,-1,
        10,2
      );

      ctx.fillRect(
        -1,-5,
        2,10
      );

      ctx.restore();
    }

  }else{
    ctx.globalAlpha=.10;
    ctx.strokeStyle='#ffe889';
    ctx.lineWidth=2;

    for(let i=0;i<5;i++){
      ctx.beginPath();

      ctx.arc(
        W/2,
        H/2,
        250+
        i*70+
        Math.sin(
          t*2+i
        )*
        8,
        0,
        Math.PI*2
      );

      ctx.stroke();
    }
  }

  ctx.restore();
}


function drawWorld(){
  const w=WORLDS[G.worldId],
        cam=G.camera,
        pr=runProgress(G.worldId);

  drawWorldBackground(w,cam);
  drawWorldAmbience(w,cam);
  drawCorruptionAtmosphere(cam,false);
  drawMasterAtmosphere(cam,false);
  drawSegmentMarkers(w,cam);

  const drawables=[];

  for(let i=0;i<9;i++){
    drawables.push({
      y:470+(i%3)*38,
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

  // Story objects.
  if(
    G.worldId==='earth'&&
    !P.corruptedRun&&
    !P.masterRun
  ){
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
      egg.world===G.worldId&&
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
      e.alive&&
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

  const ap=activePet();

  if(ap){
    drawables.push({
      y:P.y+3,
      fn:()=>
        drawFollowerPet(cam)
    });
  }

  if(P.droneLevel>0){
    drawables.push({
      y:P.y-1,
      fn:()=>
        drawSupportDrone(cam)
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

  if(G.worldId==='void'){
    const ap=activePet(),

          types=
            ap
              ?PET_TYPES[ap.name]
              :'',

          rad=
            types.includes('Void')||
            types.includes('Dark')
              ?320
              :200;

    ctx.save();

    ctx.fillStyle=
      'rgba(0,0,0,.82)';

    ctx.fillRect(0,0,W,H);

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
  drawCorruptionAtmosphere(cam,true);
  drawMasterAtmosphere(cam,true);
  drawWorldMiniMap();
  drawCinematicGrade();
}


function drawSwordPickup(x,y){
  ctx.save();
  ctx.translate(x,y-35);
  ctx.rotate(.55);

  ctx.shadowColor='#9b72ff';
  ctx.shadowBlur=24;

  const g=
    ctx.createLinearGradient(
      0,-80,
      0,0
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
    -7,-80,
    14,72,6,
    g,
    '#6047bd',
    3
  );

  rr(
    ctx,
    -18,-8,
    36,9,4,
    '#6d4bd3',
    '#2b1d5b',
    3
  );

  ctx.restore();
}


function drawTower(x,y){
  rr(
    ctx,
    x-35,y-190,
    70,195,15,
    '#66727c',
    '#303946',
    5
  );

  ctx.shadowColor='#65eaff';
  ctx.shadowBlur=20;

  ellipse(
    ctx,
    x,y-205,
    28,28,
    '#78efff',
    '#294c5e',
    4
  );

  ctx.shadowBlur=0;
}


function drawGate(x,y){
  rr(
    ctx,
    x-75,y-180,
    45,185,12,
    '#77746c',
    '#403e3a',
    5
  );

  rr(
    ctx,
    x+30,y-180,
    45,185,12,
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
  const x=p.x-cam,
        y=p.y;

  if(p.kind==='pet'){
    drawPetSprite(
      ctx,
      x,y,
      p.name,
      .8,
      G.time
    );

    return;
  }

  if(p.kind==='fragment'){
    ctx.save();
    ctx.translate(x,y-35);
    ctx.rotate(G.time);

    const corrupt=
      P.corruptedRun||
      G.worldId==='corruptrealm',

          master=
            P.masterRun,

          god=
            G.worldId==='godrealm';

    ctx.shadowColor=
      master||god
        ?'#ffe889'
        :corrupt
          ?'#ff43c7'
          :'#79eaff';

    ctx.shadowBlur=18;

    ctx.fillStyle=
      master||god
        ?'#fff5bf'
        :corrupt
          ?'#ff9be8'
          :'#dffcff';

    ctx.strokeStyle=
      master||god
        ?'#b58b24'
        :corrupt
          ?'#7129b8'
          :'#6e59dd';

    ctx.lineWidth=3;

    ctx.beginPath();

    ctx.moveTo(0,-18);
    ctx.lineTo(13,0);
    ctx.lineTo(0,18);
    ctx.lineTo(-13,0);

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  if(p.kind==='beacon'){
    rr(
      ctx,
      x-24,y-110,
      48,115,10,
      '#333b46',
      '#7e3c35',
      5
    );

    ellipse(
      ctx,
      x,y-124,
      20,20,
      '#ff6b57',
      '#6f2b2b',
      4
    );
  }

  if(p.kind==='chest'){
    ctx.save();
    ctx.translate(x,y-26);

    const a=
      WORLDS[G.worldId]?.accent||
      '#6cecff';

    ctx.shadowColor=a;

    ctx.shadowBlur=
      16+
      Math.sin(G.time*4)*4;

    rr(
      ctx,
      -31,-20,
      62,38,9,
      '#17263a',
      '#0b1220',
      4
    );

    rr(
      ctx,
      -34,-27,
      68,18,9,
      '#40566d',
      a,
      3
    );

    rr(
      ctx,
      -7,-13,
      14,20,4,
      a,
      '#eaffff',
      2
    );

    ctx.globalAlpha=
      .45+
      .25*Math.sin(G.time*3);

    ellipse(
      ctx,
      0,-37,
      26,7,
      a
    );

    ctx.restore();
  }

  if(p.kind==='mapCache'){
    ctx.save();
    ctx.translate(x,y-30);

    ctx.shadowColor='#ffe36e';
    ctx.shadowBlur=28;

    rr(
      ctx,
      -38,-24,
      76,46,11,
      '#3d2b18',
      '#ffe36e',
      4
    );

    rr(
      ctx,
      -42,-33,
      84,20,10,
      '#755022',
      '#fff0a3',
      3
    );

    ctx.fillStyle='#fff1a1';
    ctx.font='900 18px system-ui';
    ctx.textAlign='center';

    ctx.fillText(
      '✦',
      0,5
    );

    ctx.textAlign='left';
    ctx.restore();
  }

  if(p.kind==='shrine'){
    ctx.save();
    ctx.translate(x,y);

    const a=
      WORLDS[G.worldId]?.accent||
      '#79eaff';

    ctx.shadowColor=a;
    ctx.shadowBlur=22;

    ctx.fillStyle='#1a2436';
    ctx.strokeStyle=a;
    ctx.lineWidth=4;

    ctx.beginPath();

    ctx.moveTo(-34,0);
    ctx.lineTo(-24,-72);
    ctx.lineTo(0,-98);
    ctx.lineTo(24,-72);
    ctx.lineTo(34,0);

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha=
      .65+
      .25*
      Math.sin(
        G.time*4+
        p.shrineId
      );

    ellipse(
      ctx,
      0,-58,
      15,24,
      a,
      '#fff',
      2
    );

    ctx.restore();
  }

  if(p.kind==='riftWell'){
    ctx.save();
    ctx.translate(x,y-42);

    ctx.shadowColor='#6cecff';
    ctx.shadowBlur=22;

    ellipse(
      ctx,
      0,25,
      42,12,
      'rgba(64,231,255,.24)',
      '#6cecff',
      3
    );

    ctx.strokeStyle='#9af6ff';
    ctx.lineWidth=5;

    ctx.beginPath();
    ctx.arc(0,0,25,Math.PI,0);
    ctx.stroke();

    ctx.globalAlpha=
      .72+
      .22*Math.sin(G.time*4);

    ctx.fillStyle='#eaffff';

    ctx.beginPath();

    ctx.moveTo(0,-18);
    ctx.lineTo(12,0);
    ctx.lineTo(0,18);
    ctx.lineTo(-12,0);

    ctx.closePath();
    ctx.fill();

    ctx.restore();
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


function drawEasterEgg(egg,cam=0){
  const x=egg.x-cam,
        y=egg.y,
        bob=
          Math.sin(
            G.time*2.6+
            egg.x*.01
          )*2;

  ctx.save();
  ctx.translate(x,y+bob);
  ctx.globalAlpha=.82;

  ctx.save();

  ctx.globalAlpha=
    .12+
    .08*Math.sin(G.time*4);

  ctx.fillStyle='#fff4a8';

  ctx.beginPath();
  ctx.ellipse(0,5,24,6,0,0,Math.PI*2);
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
        0,-28,
        18,-16
      );

      ctx.lineTo(8,-7);

      ctx.quadraticCurveTo(
        -3,-15,
        -20,-7
      );

      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;


    case 'cartridge':
      rr(
        ctx,
        -17,-27,
        34,30,5,
        '#26364b',
        '#111a27',
        3
      );

      rr(
        ctx,
        -10,-19,
        20,10,2,
        '#65eaff'
      );
      break;


    case 'smile':
      ellipse(
        ctx,
        0,-13,
        19,16,
        '#8f927e',
        '#44483f',
        3
      );

      ellipse(ctx,-7,-16,2,2,'#222');
      ellipse(ctx,7,-16,2,2,'#222');

      ctx.beginPath();

      ctx.arc(
        0,-12,
        9,
        .25,
        Math.PI-.25
      );

      ctx.stroke();
      break;


    case 'coffee':
      rr(
        ctx,
        -13,-25,
        25,24,4,
        '#e7e0cf',
        '#4c4a46',
        3
      );

      ctx.beginPath();

      ctx.arc(
        13,-14,
        8,
        -Math.PI/2,
        Math.PI/2
      );

      ctx.stroke();

      ctx.strokeStyle=
        'rgba(255,255,255,.55)';

      ctx.beginPath();

      ctx.moveTo(-5,-30);

      ctx.quadraticCurveTo(
        0,-40,
        5,-30
      );

      ctx.stroke();
      break;


    case 'note':
      ctx.strokeStyle='#d9f9ff';
      ctx.lineWidth=5;

      ctx.beginPath();

      ctx.moveTo(6,-34);
      ctx.lineTo(6,-10);
      ctx.lineTo(18,-14);

      ctx.stroke();

      ellipse(
        ctx,
        0,-6,
        8,6,
        '#c7f8ff'
      );

      ellipse(
        ctx,
        18,-10,
        8,6,
        '#c7f8ff'
      );
      break;


    case 'record':
      ellipse(
        ctx,
        0,-14,
        20,20,
        '#171a29',
        '#5e62a0',
        3
      );

      ellipse(
        ctx,
        0,-14,
        6,6,
        '#ff7ad8'
      );

      ellipse(
        ctx,
        0,-14,
        2,2,
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
      ctx.moveTo(0,-8);
      ctx.lineTo(8,-30);
      ctx.stroke();
      break;


    case 'pixel':
      for(
        const[
          dx,
          dy,
          c
        ] of[
          [-14,-24,'#6cecff'],
          [0,-24,'#ff7ad8'],
          [-7,-10,'#fff0a0'],
          [7,-10,'#9d83ff']
        ]
      ){
        ctx.fillStyle=c;
        ctx.fillRect(dx,dy,11,11);
      }
      break;


    case 'coin':
      ellipse(
        ctx,
        0,-14,
        17,17,
        '#f1d267',
        '#806622',
        3
      );

      ctx.fillStyle='#fff0a0';
      ctx.font='900 16px system-ui';
      ctx.textAlign='center';
      ctx.fillText('1',0,-8);
      break;


    case 'pig':
      ellipse(
        ctx,
        0,-12,
        21,15,
        '#e9a3b7',
        '#6e4554',
        3
      );

      ellipse(
        ctx,
        16,-13,
        8,7,
        '#efb3c4',
        '#6e4554',
        2
      );

      ellipse(
        ctx,
        -9,-27,
        5,7,
        '#e9a3b7',
        '#6e4554',
        2
      );
      break;


    case 'receipt':
      rr(
        ctx,
        -12,-34,
        24,35,2,
        '#eef4ef',
        '#6d7370',
        2
      );

      ctx.strokeStyle='#777';
      ctx.lineWidth=2;

      for(let yy=-26;yy<-4;yy+=7){
        ctx.beginPath();
        ctx.moveTo(-7,yy);
        ctx.lineTo(7,yy);
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

      ellipse(ctx,-6,-13,2,2,'#ffe96c');
      ellipse(ctx,6,-13,2,2,'#ffe96c');
      break;


    case 'flag':
      ctx.strokeStyle='#dbe8f5';
      ctx.lineWidth=3;

      ctx.beginPath();
      ctx.moveTo(-10,1);
      ctx.lineTo(-10,-37);
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
      ctx.arc(0,-14,20,Math.PI,0);
      ctx.lineTo(18,0);
      ctx.lineTo(-18,0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      rr(
        ctx,
        -14,-20,
        28,12,6,
        '#19304c',
        '#6cecff',
        2
      );
      break;


    case 'satellite':
      rr(
        ctx,
        -8,-23,
        16,16,3,
        '#c7d6e4',
        '#3c4b5a',
        2
      );

      ctx.fillStyle='#6486aa';
      ctx.fillRect(-28,-21,18,12);
      ctx.fillRect(10,-21,18,12);

      ctx.strokeStyle='#dffcff';

      ctx.beginPath();
      ctx.moveTo(0,-23);
      ctx.lineTo(8,-34);
      ctx.stroke();
      break;


    case 'whale':
      ctx.fillStyle='#88b9e8';

      ctx.beginPath();
      ctx.ellipse(-2,-13,21,11,0,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(17,-13);
      ctx.lineTo(30,-23);
      ctx.lineTo(28,-9);
      ctx.closePath();
      ctx.fill();
      break;


    case 'sword':
      ctx.save();
      ctx.rotate(-.5);

      rr(
        ctx,
        -3,-36,
        6,30,2,
        '#ddd8c6',
        '#765c3a',
        2
      );

      rr(
        ctx,
        -11,-8,
        22,5,2,
        '#9b7750',
        '#523a27',
        2
      );

      ctx.restore();
      break;


    case 'duck':
      ellipse(
        ctx,
        0,-10,
        18,12,
        '#f4d65c',
        '#735f2b',
        3
      );

      ellipse(
        ctx,
        8,-25,
        10,10,
        '#f4d65c',
        '#735f2b',
        3
      );

      ctx.fillStyle='#dd6c3e';

      ctx.beginPath();
      ctx.moveTo(16,-25);
      ctx.lineTo(27,-21);
      ctx.lineTo(16,-18);
      ctx.closePath();
      ctx.fill();
      break;


    case 'radio':
      rr(
        ctx,
        -20,-28,
        40,29,5,
        '#5c665f',
        '#222b2b',
        3
      );

      ctx.strokeStyle='#b9c7c1';

      ctx.beginPath();
      ctx.moveTo(-12,-29);
      ctx.lineTo(10,-42);
      ctx.stroke();

      ellipse(
        ctx,
        9,-13,
        8,8,
        '#202929'
      );
      break;


    case 'flower':
      ctx.strokeStyle='#6ea75d';
      ctx.lineWidth=3;

      ctx.beginPath();
      ctx.moveTo(0,2);
      ctx.lineTo(0,-22);
      ctx.stroke();

      for(let a=0;a<Math.PI*2;a+=Math.PI/2){
        ellipse(
          ctx,
          Math.cos(a)*8,
          -24+Math.sin(a)*8,
          6,6,
          '#f2a6ca',
          '#764d66',
          2
        );
      }

      ellipse(
        ctx,
        0,-24,
        5,5,
        '#ffe477'
      );
      break;


    case 'eye':
      ctx.fillStyle='#d9c8ff';

      ctx.beginPath();

      ctx.moveTo(-22,-14);

      ctx.quadraticCurveTo(
        0,-34,
        22,-14
      );

      ctx.quadraticCurveTo(
        0,6,
        -22,-14
      );

      ctx.fill();
      ctx.stroke();

      ellipse(
        ctx,
        0,-14,
        7,7,
        '#6d43c9'
      );

      ellipse(
        ctx,
        0,-14,
        3,3,
        '#111'
      );
      break;


    case 'candle':
      rr(
        ctx,
        -7,-22,
        14,23,3,
        '#ddd4c4',
        '#6c6255',
        2
      );

      ctx.fillStyle='#aa78ff';

      ctx.beginPath();

      ctx.moveTo(0,-42);

      ctx.quadraticCurveTo(
        12,-29,
        0,-22
      );

      ctx.quadraticCurveTo(
        -12,-29,
        0,-42
      );

      ctx.fill();
      break;


    case 'door':
      rr(
        ctx,
        -13,-35,
        26,36,3,
        '#382949',
        '#120d19',
        3
      );

      ellipse(
        ctx,
        7,-17,
        2,2,
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
          i*Math.PI/5,

          r=
            i%2
              ?7
              :18,

          px=
            Math.cos(a)*r,

          py=
            -15+
            Math.sin(a)*r;

        i
          ?ctx.lineTo(px,py)
          :ctx.moveTo(px,py);
      }

      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur=0;
      break;


    case 'bug':
      ellipse(
        ctx,
        0,-14,
        11,14,
        '#75f4c8',
        '#163b35',
        2
      );

      ctx.strokeStyle='#75f4c8';

      for(const side of[-1,1]){
        for(const yy of[-20,-13,-6]){
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
        -16,-31,
        32,32,3,
        '#6f7c91',
        '#1a2432',
        3
      );

      rr(
        ctx,
        -9,-27,
        18,10,1,
        '#c5d3df'
      );

      rr(
        ctx,
        -10,-11,
        20,9,1,
        '#29374a'
      );
      break;


    case 'cube':
      ctx.fillStyle='#73e9ff';
      ctx.fillRect(-15,-29,30,30);
      ctx.strokeRect(-15,-29,30,30);

      ctx.strokeStyle='#d9fbff';

      ctx.beginPath();

      ctx.moveTo(-15,-29);
      ctx.lineTo(0,-40);
      ctx.lineTo(15,-29);

      ctx.moveTo(15,-29);
      ctx.lineTo(27,-38);
      ctx.lineTo(0,-40);

      ctx.stroke();
      break;


    case 'zero':
      rr(
        ctx,
        -20,-31,
        40,28,4,
        '#091b25',
        '#5af3ef',
        2
      );

      ctx.fillStyle='#aefcf8';
      ctx.font='900 13px monospace';
      ctx.textAlign='center';

      ctx.fillText(
        '1/0',
        0,-12
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
        -14,-15,
        11,7,2,
        '#d94d60'
      );
      break;
  }

  ctx.restore();
}


function drawFollowerPet(cam){
  const ap=activePet();

  if(!ap)return;

  ap.x=
    lerp(
      ap.x??
      P.x-65,
      P.x-
      P.facing*72,
      .08
    );

  ap.y=
    lerp(
      ap.y??
      P.y,
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


function drawForeground(w){
  const id=G.worldId,
        t=G.time||0;

  ctx.save();

  const grad=
    ctx.createLinearGradient(
      0,H-165,
      0,H
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
    W,170
  );


  if(id==='earth'){
    ctx.fillStyle=
      'rgba(18,74,51,.72)';

    for(let x=-10;x<W+20;x+=26){
      const h=
        18+
        Math.sin(x*.12)*8;

      ctx.beginPath();

      ctx.moveTo(x,H);
      ctx.lineTo(x+7,H-h);
      ctx.lineTo(x+12,H);

      ctx.fill();
    }

    ctx.fillStyle=
      'rgba(74,130,73,.5)';

    for(let x=12;x<W;x+=95){
      ctx.beginPath();

      ctx.moveTo(x,H);

      ctx.quadraticCurveTo(
        x+9,
        H-38,
        x+18,
        H
      );

      ctx.fill();
    }

  }else if(id==='music'){

    ctx.globalAlpha=.25;

    for(let x=0;x<W;x+=90){
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
        )*
        26;

      ctx.fillRect(
        x,
        H-h,
        54,h
      );
    }

    ctx.globalAlpha=1;

  }else if(id==='money'){

    ctx.fillStyle=
      'rgba(82,61,31,.42)';

    for(let x=-30;x<W+40;x+=70){
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

  }else if(id==='cosmos'){

    ctx.strokeStyle=
      'rgba(126,210,255,.35)';

    ctx.lineWidth=3;

    ctx.beginPath();
    ctx.moveTo(0,H-18);
    ctx.lineTo(W,H-18);
    ctx.stroke();

    for(let x=30;x<W;x+=150){
      ctx.shadowColor='#6cecff';
      ctx.shadowBlur=10;

      ellipse(
        ctx,
        x,H-22,
        4,4,
        '#9ff9ff'
      );
    }

    ctx.shadowBlur=0;

  }else if(id==='war'){

    ctx.fillStyle=
      'rgba(31,26,25,.55)';

    for(let x=-30;x<W+40;x+=115){
      ctx.beginPath();

      ctx.moveTo(x,H);
      ctx.lineTo(x+18,H-34);
      ctx.lineTo(x+36,H);

      ctx.fill();
    }

    for(let i=0;i<12;i++){
      const x=
        (
          i*117+
          t*42
        )%
        W;

      ctx.fillStyle=
        'rgba(255,128,79,.45)';

      ctx.fillRect(
        x,
        H-80-
        (i%4)*22,
        2,2
      );
    }

  }else if(id==='void'){

    ctx.fillStyle=
      'rgba(11,5,18,.78)';

    for(let x=-20;x<W+20;x+=80){
      const h=
        24+
        (x%5)*3;

      ctx.beginPath();

      ctx.moveTo(x,H);
      ctx.lineTo(x+18,H-h);
      ctx.lineTo(x+35,H);

      ctx.fill();
    }

    ctx.globalAlpha=.18;
    ctx.fillStyle='#9f70ff';

    ctx.fillRect(
      0,
      H-32,
      W,32
    );

    ctx.globalAlpha=1;

  }else if(
    ![
      'earth',
      'music',
      'money',
      'cosmos',
      'war',
      'void',
      'matrix'
    ].includes(id)
  ){

    ctx.globalAlpha=.22;
    ctx.fillStyle=w.accent;

    for(let x=0;x<W;x+=84){
      const h=
        10+
        Math.abs(
          Math.sin(
            t*2+
            x*.03
          )
        )*
        22;

      ctx.fillRect(
        x,
        H-h,
        48,h
      );
    }

    ctx.globalAlpha=1;

  }else if(id==='matrix'){

    ctx.globalAlpha=.3;
    ctx.fillStyle='#58f1ec';

    for(let i=0;i<10;i++){
      const x=
        (
          i*151+
          t*30
        )%
        W;

      ctx.fillRect(
        x,
        H-18-
        (i%3)*7,
        42,3
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

  // Distant space remains screen-fixed while the station scrolls.
  drawPlanet(1110-(G.camera*.035)%180,145,95,'#a67eff','#2e286d');
  drawPlanet(155-(G.camera*.02)%120,105,48,'#9ff4df','#285d66');

  ctx.save();
  ctx.globalAlpha=.14;
  ctx.strokeStyle='#6cecff';
  ctx.lineWidth=2;

  for(let i=0;i<6;i++){
    ctx.beginPath();
    ctx.arc(640,350,160+i*82,Math.PI*.08,Math.PI*.92);
    ctx.stroke();
  }

  ctx.restore();

  ctx.save();
  ctx.translate(-G.camera,0);

  const cx=HUB_WIDTH/2;

  // Huge two-deck floating station.
  shadow(cx,626,HUB_WIDTH-150,105,.44);

  const rim=ctx.createLinearGradient(0,410,0,690);

  rim.addColorStop(0,'#f7fbff');
  rim.addColorStop(.28,'#a9c1d2');
  rim.addColorStop(.68,'#4d6680');
  rim.addColorStop(1,'#18283d');

  ctx.fillStyle=rim;
  ctx.strokeStyle='#4f7591';
  ctx.lineWidth=7;

  rr(
    ctx,
    70,430,
    HUB_WIDTH-140,205,
    78,
    rim,
    '#4f7591',
    7
  );

  const under=ctx.createLinearGradient(0,580,0,705);

  under.addColorStop(0,'rgba(54,78,105,.9)');
  under.addColorStop(1,'rgba(8,17,31,.98)');

  ctx.fillStyle=under;

  ctx.beginPath();
  ctx.moveTo(110,605);
  ctx.lineTo(HUB_WIDTH-110,605);
  ctx.lineTo(HUB_WIDTH-300,690);
  ctx.lineTo(300,690);
  ctx.closePath();
  ctx.fill();

  // Long animated energy rails make the station feel connected.
  ctx.save();

  ctx.globalAlpha=.55+.18*Math.sin(G.time*3);
  ctx.strokeStyle='#6cecff';
  ctx.shadowColor='#6cecff';
  ctx.shadowBlur=16;
  ctx.lineWidth=4;

  ctx.beginPath();
  ctx.moveTo(125,594);
  ctx.lineTo(HUB_WIDTH-125,594);
  ctx.stroke();

  ctx.restore();

  for(let x=135;x<HUB_WIDTH-120;x+=62){
    drawHubLight(
      x,
      603,
      (x/62|0)%2===0
    );
  }

  // Main transit spine and district pads.
  const hubStops=[
    HUB_SPOTS.sanctuary.x,
    HUB_SPOTS.dojo.x,
    HUB_SPOTS.arena.x,
    HUB_SPOTS.armory.x,
    HUB_SPOTS.research.x,
    HUB_SPOTS.missions.x,
    HUB_SPOTS.medbay.x,
    HUB_SPOTS.foundry.x,
    HUB_SPOTS.market.x,
    HUB_SPOTS.observatory.x,
    HUB_SPOTS.petgarden.x,
    HUB_SPOTS.style.x,
    HUB_SPOTS.challenge.x,
    HUB_SPOTS.library.x,
    HUB_SPOTS.hangar.x,
    HUB_SPOTS.archive.x,
    HUB_SPOTS.artifact.x,
    HUB_SPOTS.drones.x,
    HUB_SPOTS.kitchen.x,
    HUB_SPOTS.guild.x,
    HUB_SPOTS.lounge.x,
    HUB_SPOTS.chronicle.x,
    HUB_SPOTS.mastery.x,
    HUB_SPOTS.tower.x,
    HUB_SPOTS.bossrush.x,
    HUB_SPOTS.anomaly.x,
    HUB_SPOTS.ascension.x,
    HUB_SPOTS.skillnexus.x,
    HUB_SPOTS.huntlodge.x,
    HUB_SPOTS.cartography.x,
    HUB_SPOTS.petcoliseum.x,
    HUB_SPOTS.arcade.x,
    HUB_SPOTS.relicmuseum.x,
    HUB_SPOTS.armorforge.x,
    HUB_SPOTS.petfusion.x,
    HUB_SPOTS.petgearforge.x,
    HUB_SPOTS.terminal.x
  ];

  for(let i=0;i<hubStops.length-1;i++){
    drawHubPath(
      hubStops[i],
      hubStops[i+1],
      510
    );
  }

  for(const x of hubStops){
    ctx.save();

    ctx.globalAlpha=.18;
    ctx.fillStyle='#6cecff';

    ctx.beginPath();
    ctx.ellipse(x,542,122,42,0,0,Math.PI*2);
    ctx.fill();

    ctx.restore();
  }

  // Thirty-seven usable facilities make The Hub a real explorable base.
  drawHubSanctuary(HUB_SPOTS.sanctuary.x,500);
  drawHubDojo(HUB_SPOTS.dojo.x,500);
  drawHubArena(HUB_SPOTS.arena.x,500);
  drawHubArmory(HUB_SPOTS.armory.x,500);
  drawHubResearch(HUB_SPOTS.research.x,500);

  drawHubUtility(
    HUB_SPOTS.missions.x,
    500,
    'MISSION BOARD',
    '#ffcf6b',
    'mission'
  );

  drawHubUtility(
    HUB_SPOTS.medbay.x,
    500,
    'RIFT MED BAY',
    '#72f1c6',
    'med'
  );

  drawHubUtility(
    HUB_SPOTS.foundry.x,
    500,
    'MATERIAL FOUNDRY',
    '#ff9b62',
    'foundry'
  );

  drawHubMarket(HUB_SPOTS.market.x,500);

  drawHubCoreMonument(2880,378);

  drawHubUtility(
    HUB_SPOTS.observatory.x,
    500,
    'OBSERVATORY',
    '#7ec8ff',
    'observatory'
  );

  drawHubUtility(
    HUB_SPOTS.petgarden.x,
    500,
    'PET BOND GARDEN',
    '#8de39d',
    'garden'
  );

  drawHubUtility(
    HUB_SPOTS.style.x,
    500,
    'STYLE STUDIO',
    '#ff8fd4',
    'style'
  );

  drawHubUtility(
    HUB_SPOTS.challenge.x,
    500,
    'CHALLENGE',
    '#ff6d79',
    'challenge'
  );

  drawHubUtility(
    HUB_SPOTS.library.x,
    500,
    'RIFT LIBRARY',
    '#c4a5ff',
    'library'
  );

  drawHubHangar(HUB_SPOTS.hangar.x,500);
  drawHubArchive(HUB_SPOTS.archive.x,500);

  drawHubUtility(
    HUB_SPOTS.artifact.x,
    500,
    'ARTIFACT VAULT',
    '#ffe07a',
    'artifact'
  );

  drawHubUtility(
    HUB_SPOTS.drones.x,
    500,
    'DRONE WORKSHOP',
    '#72eaff',
    'drone'
  );

  drawHubUtility(
    HUB_SPOTS.kitchen.x,
    500,
    'RIFT KITCHEN',
    '#ffad72',
    'kitchen'
  );

  drawHubUtility(
    HUB_SPOTS.guild.x,
    500,
    'EXPEDITION GUILD',
    '#8ff0b2',
    'guild'
  );

  drawHubUtility(
    HUB_SPOTS.lounge.x,
    500,
    'MUSIC LOUNGE',
    '#d58cff',
    'lounge'
  );

  drawHubUtility(
    HUB_SPOTS.chronicle.x,
    500,
    'RIFT CHRONICLE',
    '#ffd36e',
    'mission'
  );

  drawHubUtility(
    HUB_SPOTS.mastery.x,
    500,
    'MASTERY HALL',
    '#82f3ff',
    'artifact'
  );

  drawHubUtility(
    HUB_SPOTS.tower.x,
    500,
    'RIFT TOWER',
    '#b997ff',
    'challenge'
  );

  drawHubUtility(
    HUB_SPOTS.bossrush.x,
    500,
    'BOSS RUSH',
    '#ff737d',
    'challenge'
  );

  drawHubUtility(
    HUB_SPOTS.anomaly.x,
    500,
    'ANOMALY SCANNER',
    '#6fffd4',
    'observatory'
  );

  drawHubUtility(
    HUB_SPOTS.ascension.x,
    500,
    'ASCENSION',
    '#ffe37d',
    'artifact'
  );

  drawHubUtility(
    HUB_SPOTS.skillnexus.x,
    500,
    'SKILL NEXUS',
    '#79f2ff',
    'artifact'
  );

  drawHubUtility(
    HUB_SPOTS.huntlodge.x,
    500,
    'LEGENDARY HUNTS',
    '#ffcf65',
    'challenge'
  );

  drawHubUtility(
    HUB_SPOTS.cartography.x,
    500,
    'CARTOGRAPHY',
    '#79cfff',
    'library'
  );

  drawHubUtility(
    HUB_SPOTS.petcoliseum.x,
    500,
    'PET COLISEUM',
    '#8ff0a8',
    'garden'
  );

  drawHubUtility(
    HUB_SPOTS.arcade.x,
    500,
    'RIFT ARCADE',
    '#ff8fe8',
    'style'
  );

  drawHubUtility(
    HUB_SPOTS.relicmuseum.x,
    500,
    'RELIC MUSEUM',
    '#ffe58a',
    'archive'
  );

  drawHubUtility(
    HUB_SPOTS.armorforge.x,
    500,
    'ARMOR FUSION',
    '#7cecff',
    'foundry'
  );

  drawHubUtility(
    HUB_SPOTS.petfusion.x,
    500,
    'PET FUSION LAB',
    '#ff8fe8',
    'garden'
  );

  drawHubUtility(
    HUB_SPOTS.petgearforge.x,
    500,
    'PET ARMOR FUSION',
    '#77f7e0',
    'foundry'
  );

  drawHubTerminal(
    HUB_SPOTS.terminal.x,
    500
  );

  // Sector signs and little service drones add life to the base.
  for(const [x,label] of [
    [405,'COMPANION WING'],
    [900,'RIFT ARENA'],
    [1395,'FORGE + RESEARCH'],
    [2055,'MISSIONS + MED BAY'],
    [2715,'FOUNDRY + MARKET'],
    [3375,'SCAN + PET BOND'],
    [4035,'STYLE + CHALLENGE'],
    [4695,'LIBRARY + HANGAR'],
    [5355,'ARCHIVE + RELICS'],
    [6015,'DRONES + KITCHEN'],
    [6675,'GUILD + MUSIC'],
    [7335,'CHRONICLE + MASTERY'],
    [7995,'TOWER + BOSS RUSH'],
    [8655,'ANOMALY + ASCENSION'],
    [9315,'SKILLS + HUNTS'],
    [9975,'MAPS + PET ARENA'],
    [10635,'ARCADE + RELICS'],
    [11295,'FUSION DISTRICT'],
    [12120,'WORLD NAVIGATION']
  ]){
    ctx.fillStyle='rgba(7,19,34,.72)';

    rr(
      ctx,
      x-78,618,
      156,25,
      8,
      'rgba(7,19,34,.72)',
      'rgba(113,232,255,.3)',
      1
    );

    ctx.fillStyle='#aeefff';
    ctx.font='800 8px system-ui';
    ctx.textAlign='center';

    ctx.fillText(
      label,
      x,
      634
    );

    ctx.textAlign='left';
  }

  for(let i=0;i<15;i++){
    const x=
      390+
      i*585+
      Math.sin(
        G.time*.7+i
      )*38,

      y=
        455+
        Math.sin(
          G.time*2+i
        )*10;

    ctx.save();

    ctx.shadowColor='#7deaff';
    ctx.shadowBlur=12;

    ellipse(
      ctx,
      x,y,
      10,5,
      '#9ff5ff'
    );

    ctx.fillStyle='#243d55';

    ctx.fillRect(
      x-6,
      y-2,
      12,5
    );

    ctx.restore();
  }

  for(const egg of EASTER_EGGS){
    if(
      egg.world==='hub'&&
      !G.easterEggs.has(egg.id)
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

  if(P.droneLevel>0){
    drawSupportDrone(0);
  }

  drawRiftwalker(
    P.x,
    P.y-P.jump,
    1,
    false
  );

  // Foreground railing segments pass in front of the player for 2.5D depth.
  ctx.save();

  ctx.strokeStyle='rgba(26,45,65,.82)';
  ctx.lineWidth=7;
  ctx.lineCap='round';

  for(let x=100;x<HUB_WIDTH-100;x+=330){
    ctx.beginPath();

    ctx.moveTo(
      x,
      650
    );

    ctx.lineTo(
      Math.min(
        x+220,
        HUB_WIDTH-100
      ),
      666
    );

    ctx.stroke();
  }

  ctx.strokeStyle='rgba(105,231,255,.48)';
  ctx.lineWidth=2;

  for(let x=100;x<HUB_WIDTH-100;x+=330){
    ctx.beginPath();

    ctx.moveTo(
      x,
      643
    );

    ctx.lineTo(
      Math.min(
        x+220,
        HUB_WIDTH-100
      ),
      659
    );

    ctx.stroke();
  }

  ctx.restore();
  ctx.restore();

  // Screen-fixed hub navigation strip.
  ctx.save();

  rr(
    ctx,
    390,674,
    500,26,
    13,
    'rgba(5,14,27,.72)',
    'rgba(112,233,255,.18)',
    1
  );

  ctx.fillStyle='#a9bfd4';
  ctx.font='800 8px system-ui';
  ctx.textAlign='center';

  ctx.fillText(
    'LIVING HUB  •  36 FACILITIES  •  LEGENDARY HUNTS  •  TREASURE MAPS  •  PET COLISEUM  •  SKILL NEXUS  •  E TO ENTER',
    640,
    691
  );

  ctx.textAlign='left';
  ctx.restore();
}


function drawHubArena(x,y){
  ctx.save();

  shadow(
    x,
    y+14,
    214,32,
    .36
  );

  // Dark arena bunker with a huge glowing combat portal.
  const shell=
    ctx.createLinearGradient(
      x-105,
      y-145,
      x+105,
      y+8
    );

  shell.addColorStop(
    0,
    '#2a2548'
  );

  shell.addColorStop(
    .5,
    '#171d35'
  );

  shell.addColorStop(
    1,
    '#0b1325'
  );

  rr(
    ctx,
    x-108,
    y-116,
    216,118,
    24,
    shell,
    '#14172a',
    6
  );

  rr(
    ctx,
    x-82,
    y-148,
    164,43,
    18,
    '#492d65',
    '#b67cff',
    5
  );

  // Portal ring.
  ctx.save();

  ctx.translate(
    x,
    y-54
  );

  ctx.shadowColor='#a86fff';
  ctx.shadowBlur=26;

  ctx.strokeStyle='#b78cff';
  ctx.lineWidth=9;

  ctx.beginPath();
  ctx.arc(0,0,48,0,Math.PI*2);
  ctx.stroke();

  ctx.strokeStyle='#6cecff';
  ctx.lineWidth=4;

  ctx.setLineDash([14,10]);
  ctx.lineDashOffset=-G.time*35;

  ctx.beginPath();
  ctx.arc(0,0,37,0,Math.PI*2);
  ctx.stroke();

  ctx.setLineDash([]);

  const pg=
    ctx.createRadialGradient(
      0,0,3,
      0,0,34
    );

  pg.addColorStop(
    0,
    'rgba(240,255,255,.95)'
  );

  pg.addColorStop(
    .35,
    'rgba(105,235,255,.78)'
  );

  pg.addColorStop(
    1,
    'rgba(122,72,255,.18)'
  );

  ellipse(
    ctx,
    0,0,
    33,33,
    pg
  );

  // Two simple dueling silhouettes inside the portal.
  ctx.shadowBlur=0;
  ctx.strokeStyle='#10162a';
  ctx.lineWidth=5;
  ctx.lineCap='round';

  ctx.beginPath();

  ctx.arc(
    -13,-8,
    6,
    0,
    Math.PI*2
  );

  ctx.moveTo(-13,-2);
  ctx.lineTo(-18,16);

  ctx.moveTo(-16,4);
  ctx.lineTo(-31,10);

  ctx.moveTo(-18,15);
  ctx.lineTo(-28,28);

  ctx.moveTo(-18,15);
  ctx.lineTo(-8,28);

  ctx.stroke();

  ctx.beginPath();

  ctx.arc(
    14,-8,
    6,
    0,
    Math.PI*2
  );

  ctx.moveTo(14,-2);
  ctx.lineTo(19,16);

  ctx.moveTo(17,4);
  ctx.lineTo(31,10);

  ctx.moveTo(19,15);
  ctx.lineTo(9,28);

  ctx.moveTo(19,15);
  ctx.lineTo(29,28);

  ctx.stroke();

  ctx.strokeStyle='#f4fbff';
  ctx.lineWidth=3;

  ctx.beginPath();

  ctx.moveTo(-29,8);
  ctx.lineTo(3,-20);

  ctx.moveTo(29,8);
  ctx.lineTo(-3,-20);

  ctx.stroke();

  ctx.restore();

  // Side pylons and status lights.
  for(const dx of [-82,82]){
    rr(
      ctx,
      x+dx-14,
      y-90,
      28,92,
      9,
      '#253451',
      '#111827',
      4
    );

    ctx.save();

    ctx.shadowColor='#ff6f9f';
    ctx.shadowBlur=12;

    ellipse(
      ctx,
      x+dx,
      y-68,
      5,5,
      '#ff83ad'
    );

    ctx.restore();
  }

  drawHubSign(
    x,
    y-177,
    'BONUS MODE · RIFT ARENA',
    '#b98cff'
  );

  ctx.restore();
}


function drawHubUtility(
  x,
  y,
  label,
  accent,
  kind
){
  ctx.save();

  shadow(
    x,
    y+12,
    196,29,
    .31
  );

  const g=
    ctx.createLinearGradient(
      x-100,
      y-145,
      x+100,
      y
    );

  g.addColorStop(
    0,
    '#dbe7ef'
  );

  g.addColorStop(
    .45,
    '#71869a'
  );

  g.addColorStop(
    1,
    '#26384b'
  );

  rr(
    ctx,
    x-99,
    y-108,
    198,110,
    20,
    g,
    '#1b2c3f',
    5
  );

  // Each new facility gets a different roof silhouette.
  ctx.fillStyle=accent;
  ctx.strokeStyle='#25384b';
  ctx.lineWidth=5;

  if(kind==='observatory'){
    ctx.beginPath();

    ctx.arc(
      x,
      y-103,
      66,
      Math.PI,
      0
    );

    ctx.lineTo(
      x+66,
      y-94
    );

    ctx.lineTo(
      x-66,
      y-94
    );

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  }else if(kind==='garden'){
    ctx.beginPath();

    ctx.moveTo(
      x-96,
      y-102
    );

    ctx.quadraticCurveTo(
      x,
      y-170,
      x+96,
      y-102
    );

    ctx.lineTo(
      x+72,
      y-82
    );

    ctx.lineTo(
      x-72,
      y-82
    );

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  }else if(kind==='challenge'){
    ctx.beginPath();

    ctx.moveTo(
      x,
      y-157
    );

    ctx.lineTo(
      x+94,
      y-103
    );

    ctx.lineTo(
      x+70,
      y-78
    );

    ctx.lineTo(
      x-70,
      y-78
    );

    ctx.lineTo(
      x-94,
      y-103
    );

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  }else{
    rr(
      ctx,
      x-72,
      y-145,
      144,45,
      15,
      accent,
      '#25384b',
      5
    );
  }

  rr(
    ctx,
    x-31,
    y-70,
    62,72,
    13,
    '#12263a',
    accent,
    4
  );

  ctx.save();

  ctx.translate(
    x,
    y-101
  );

  ctx.strokeStyle='#f5fbff';
  ctx.fillStyle='#f5fbff';
  ctx.lineWidth=5;
  ctx.lineCap='round';
  ctx.lineJoin='round';

  if(kind==='mission'){
    ctx.strokeRect(
      -19,-17,
      38,34
    );

    ctx.beginPath();

    ctx.moveTo(-11,-4);
    ctx.lineTo(-3,4);
    ctx.lineTo(12,-10);

    ctx.stroke();

  }else if(kind==='med'){
    ctx.fillRect(
      -6,-21,
      12,42
    );

    ctx.fillRect(
      -21,-6,
      42,12
    );

  }else if(kind==='foundry'){
    ctx.beginPath();

    ctx.moveTo(-24,6);
    ctx.lineTo(18,6);
    ctx.lineTo(27,-5);
    ctx.lineTo(3,-5);
    ctx.lineTo(3,-17);
    ctx.lineTo(-8,-17);
    ctx.lineTo(-8,-5);
    ctx.lineTo(-24,-5);

    ctx.closePath();
    ctx.fill();

    ctx.fillRect(
      -4,6,
      8,19
    );

  }else if(kind==='observatory'){
    ctx.beginPath();

    ctx.arc(
      -4,0,
      16,
      Math.PI*.15,
      Math.PI*1.55
    );

    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(6,10);
    ctx.lineTo(22,22);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-18,18);
    ctx.lineTo(18,18);
    ctx.stroke();

  }else if(kind==='garden'){
    ellipse(
      ctx,
      0,6,
      12,9,
      '#f5fbff'
    );

    for(const [dx,dy] of [
      [-14,-7],
      [0,-13],
      [14,-7]
    ]){
      ellipse(
        ctx,
        dx,dy,
        6,7,
        '#f5fbff'
      );
    }

  }else if(kind==='style'){
    ctx.beginPath();

    ctx.moveTo(-20,-13);

    ctx.quadraticCurveTo(
      0,-24,
      20,-12
    );

    ctx.lineTo(10,1);
    ctx.lineTo(26,17);
    ctx.lineTo(6,19);
    ctx.lineTo(-3,5);
    ctx.lineTo(-20,5);

    ctx.closePath();
    ctx.fill();

  }else if(kind==='challenge'){
    ctx.beginPath();

    ctx.moveTo(0,-23);
    ctx.lineTo(22,0);
    ctx.lineTo(0,23);
    ctx.lineTo(-22,0);

    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-8,0);
    ctx.lineTo(8,0);
    ctx.stroke();

  }else if(kind==='library'){
    ctx.strokeRect(
      -22,-18,
      17,36
    );

    ctx.strokeRect(
      5,-18,
      17,36
    );

    ctx.beginPath();
    ctx.moveTo(0,-14);
    ctx.lineTo(0,19);
    ctx.stroke();

  }else if(kind==='artifact'){
    ctx.beginPath();

    ctx.moveTo(0,-23);
    ctx.lineTo(18,-3);
    ctx.lineTo(0,23);
    ctx.lineTo(-18,-3);

    ctx.closePath();
    ctx.stroke();

    ellipse(
      ctx,
      0,-2,
      5,5,
      '#f5fbff'
    );

  }else if(kind==='drone'){
    ellipse(
      ctx,
      0,-3,
      18,10,
      null,
      '#f5fbff',
      4
    );

    ctx.beginPath();

    ctx.moveTo(-17,-2);
    ctx.lineTo(-28,9);

    ctx.moveTo(17,-2);
    ctx.lineTo(28,9);

    ctx.stroke();

    ellipse(
      ctx,
      0,-2,
      4,3,
      '#f5fbff'
    );

  }else if(kind==='kitchen'){
    ctx.beginPath();

    ctx.arc(
      0,5,
      20,
      Math.PI,
      0
    );

    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-23,5);
    ctx.lineTo(23,5);
    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(-8,-5);

    ctx.quadraticCurveTo(
      -16,-16,
      -7,-22
    );

    ctx.moveTo(8,-5);

    ctx.quadraticCurveTo(
      16,-16,
      7,-22
    );

    ctx.stroke();

  }else if(kind==='guild'){
    ctx.beginPath();

    ctx.moveTo(0,-23);
    ctx.lineTo(19,-12);
    ctx.lineTo(15,15);
    ctx.lineTo(0,23);
    ctx.lineTo(-15,15);
    ctx.lineTo(-19,-12);

    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(-8,1);
    ctx.lineTo(-1,8);
    ctx.lineTo(10,-7);

    ctx.stroke();

  }else if(kind==='lounge'){
    ctx.beginPath();

    ctx.arc(
      -8,9,
      7,
      0,
      Math.PI*2
    );

    ctx.arc(
      13,4,
      7,
      0,
      Math.PI*2
    );

    ctx.moveTo(-1,8);
    ctx.lineTo(-1,-22);
    ctx.lineTo(20,-16);
    ctx.lineTo(20,4);

    ctx.stroke();
  }

  ctx.restore();

  for(const dx of [-69,69]){
    ctx.save();

    ctx.globalAlpha=
      .65+
      .25*Math.sin(
        G.time*4+dx
      );

    ctx.shadowColor=accent;
    ctx.shadowBlur=13;

    ellipse(
      ctx,
      x+dx,
      y-48,
      7,15,
      accent
    );

    ctx.restore();
  }

  drawHubSign(
    x,
    y-174,
    label,
    accent
  );

  ctx.restore();
}


function drawHubDojo(x,y){
  ctx.save();

  shadow(
    x,
    y+12,
    190,28,
    .3
  );

  rr(
    ctx,
    x-94,y-102,
    188,104,
    18,
    '#ddd5ca',
    '#3b4655',
    5
  );

  rr(
    ctx,
    x-70,y-135,
    140,45,
    18,
    '#8f4050',
    '#41232e',
    5
  );

  ctx.strokeStyle='#e9c88d';
  ctx.lineWidth=7;

  ctx.beginPath();

  ctx.moveTo(
    x-64,
    y-84
  );

  ctx.lineTo(
    x-64,
    y-5
  );

  ctx.moveTo(
    x+64,
    y-84
  );

  ctx.lineTo(
    x+64,
    y-5
  );

  ctx.stroke();

  rr(
    ctx,
    x-30,y-70,
    60,72,
    8,
    '#17263a',
    '#e4bf7c',
    4
  );

  ctx.fillStyle='#ffda8d';
  ctx.font='900 18px system-ui';
  ctx.textAlign='center';

  ctx.fillText(
    'II',
    x,
    y-27
  );

  ctx.textAlign='left';

  ctx.strokeStyle='#d7e8f3';
  ctx.lineWidth=5;

  ctx.beginPath();

  ctx.moveTo(
    x-78,
    y-117
  );

  ctx.lineTo(
    x-45,
    y-92
  );

  ctx.moveTo(
    x+78,
    y-117
  );

  ctx.lineTo(
    x+45,
    y-92
  );

  ctx.stroke();

  drawHubSign(
    x,
    y-164,
    'COMBAT DOJO',
    '#ffca7d'
  );

  ctx.restore();
}


function drawHubResearch(x,y){
  ctx.save();

  shadow(
    x,
    y+12,
    195,28,
    .3
  );

  rr(
    ctx,
    x-98,y-112,
    196,114,
    22,
    '#d7edf0',
    '#29445b',
    5
  );

  rr(
    ctx,
    x-62,y-146,
    124,48,
    18,
    '#284d66',
    '#6cecff',
    4
  );

  for(const dx of [-58,58]){
    ctx.save();

    ctx.shadowColor='#7cf3ff';
    ctx.shadowBlur=18;

    ellipse(
      ctx,
      x+dx,
      y-62,
      18,42,
      'rgba(104,235,255,.55)'
    );

    ellipse(
      ctx,
      x+dx,
      y-62,
      8,30,
      '#d8fdff'
    );

    ctx.restore();
  }

  rr(
    ctx,
    x-28,y-66,
    56,68,
    14,
    '#13283d',
    '#83efff',
    4
  );

  ctx.save();

  ctx.translate(
    x,
    y-102
  );

  ctx.rotate(
    G.time*.5
  );

  ctx.strokeStyle='#bffbff';
  ctx.lineWidth=3;

  ctx.beginPath();

  ctx.arc(
    0,0,
    20,
    0,
    Math.PI*1.5
  );

  ctx.stroke();

  ctx.restore();

  drawHubSign(
    x,
    y-174,
    'RIFT RESEARCH',
    '#7defff'
  );

  ctx.restore();
}


function drawHubMarket(x,y){
  ctx.save();

  shadow(
    x,
    y+12,
    200,30,
    .31
  );

  rr(
    ctx,
    x-102,y-94,
    204,96,
    20,
    '#6d5d83',
    '#2a3045',
    5
  );

  ctx.fillStyle='#f2c86d';

  ctx.beginPath();

  ctx.moveTo(
    x-116,
    y-92
  );

  ctx.lineTo(
    x+116,
    y-92
  );

  ctx.lineTo(
    x+82,
    y-137
  );

  ctx.lineTo(
    x-82,
    y-137
  );

  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle='#5d4351';
  ctx.lineWidth=5;
  ctx.stroke();

  for(let i=-2;i<=2;i++){
    ctx.fillStyle=
      i%2
        ?'#6cecff'
        :'#b58cff';

    ctx.fillRect(
      x+i*33-13,
      y-130,
      26,31
    );
  }

  rr(
    ctx,
    x-35,y-64,
    70,66,
    10,
    '#15273a',
    '#f2d483',
    4
  );

  for(const dx of [-70,70]){
    ctx.save();

    ctx.shadowColor='#ffe188';
    ctx.shadowBlur=12;

    ellipse(
      ctx,
      x+dx,
      y-47,
      10,10,
      '#ffe59b'
    );

    ctx.restore();
  }

  drawHubSign(
    x,
    y-164,
    'RIFT MARKET',
    '#ffd77d'
  );

  ctx.restore();
}


function drawHubHangar(x,y){
  ctx.save();

  shadow(
    x,
    y+14,
    230,32,
    .34
  );

  ctx.fillStyle='#465c72';
  ctx.strokeStyle='#1a2a3b';
  ctx.lineWidth=6;

  ctx.beginPath();

  ctx.moveTo(
    x-116,
    y
  );

  ctx.lineTo(
    x-105,
    y-104
  );

  ctx.lineTo(
    x-60,
    y-145
  );

  ctx.lineTo(
    x+60,
    y-145
  );

  ctx.lineTo(
    x+105,
    y-104
  );

  ctx.lineTo(
    x+116,
    y
  );

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  rr(
    ctx,
    x-72,y-84,
    144,86,
    22,
    '#0e1b2b',
    '#7cecff',
    4
  );

  ctx.save();

  ctx.translate(
    x,
    y-42
  );

  ctx.fillStyle='#b8dce7';

  ctx.beginPath();

  ctx.moveTo(-48,8);
  ctx.lineTo(0,-22);
  ctx.lineTo(48,8);
  ctx.lineTo(20,15);
  ctx.lineTo(0,5);
  ctx.lineTo(-20,15);

  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle='#6cecff';
  ctx.stroke();

  ctx.restore();

  for(const dx of [-94,94]){
    ctx.save();

    ctx.shadowColor='#ffb05d';
    ctx.shadowBlur=14;

    ellipse(
      ctx,
      x+dx,
      y-78,
      7,19,
      '#ffd38a'
    );

    ctx.restore();
  }

  drawHubSign(
    x,
    y-174,
    'SHIP HANGAR',
    '#7deaff'
  );

  ctx.restore();
}


function drawHubArchive(x,y){
  ctx.save();

  shadow(
    x,
    y+12,
    194,29,
    .3
  );

  rr(
    ctx,
    x-98,y-115,
    196,117,
    16,
    '#d9d1b9',
    '#4a4351',
    5
  );

  for(const dx of [-63,0,63]){
    rr(
      ctx,
      x+dx-20,
      y-95,
      40,97,
      7,
      '#17273a',
      '#b9a66f',
      3
    );

    ctx.save();

    ctx.shadowColor='#ffd875';
    ctx.shadowBlur=14;

    ellipse(
      ctx,
      x+dx,
      y-66,
      10,15,
      '#ffe49b'
    );

    ctx.restore();
  }

  ctx.fillStyle='#5b476b';

  ctx.beginPath();

  ctx.moveTo(
    x-108,
    y-112
  );

  ctx.lineTo(
    x,
    y-164
  );

  ctx.lineTo(
    x+108,
    y-112
  );

  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle='#c8b5e7';
  ctx.lineWidth=4;
  ctx.stroke();

  drawHubSign(
    x,
    y-181,
    'TROPHY ARCHIVE',
    '#d5b8ff'
  );

  ctx.restore();
}


function drawHubPath(x1,x2,y){
  const mid=(x1+x2)/2,
        w=Math.abs(x2-x1)-100;

  const g=
    ctx.createLinearGradient(
      0,y-10,
      0,y+55
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
    w,58,
    18,
    g,
    'rgba(49,77,101,.85)',
    4
  );

  ctx.save();

  ctx.strokeStyle='rgba(99,233,255,.65)';
  ctx.lineWidth=3;
  ctx.setLineDash([18,15]);

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


function drawHubLight(x,y,alt=false){
  const pulse=
    .65+
    .35*Math.sin(
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
    x,y,
    5,3,
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
    x-78,
    y-15,
    156,30,
    10,
    'rgba(9,21,37,.9)',
    accent,
    2
  );

  ctx.shadowBlur=0;

  ctx.fillStyle='#f4fbff';
  ctx.font='900 9px system-ui';
  ctx.textAlign='center';

  ctx.fillText(
    text,
    x,
    y+4
  );

  ctx.textAlign='left';

  ctx.restore();
}


function drawHubSanctuary(x,y){
  shadow(
    x,
    y+10,
    190,28,
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
    55,90,
    24,
    pod,
    '#355667',
    5
  );

  rr(
    ctx,
    x+50,
    y-88,
    55,90,
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
  ctx.strokeStyle='rgba(226,255,249,.55)';
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
  ctx.fillStyle='#6fcf8e';

  for(const dx of [-48,-26,32,50]){
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
    54,65,
    22,
    door,
    '#73e9df',
    4
  );

  ctx.shadowColor='#6ef1df';
  ctx.shadowBlur=16;

  ctx.strokeStyle='#9ffcef';
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
    .2*Math.sin(
      G.time*3
    );

  ctx.shadowColor='#9ffcef';
  ctx.shadowBlur=18;

  ellipse(
    ctx,
    0,8,
    10,8,
    '#c8fff5'
  );

  ellipse(
    ctx,
    -13,-4,
    5,6,
    '#c8fff5'
  );

  ellipse(
    ctx,
    0,-9,
    5,6,
    '#c8fff5'
  );

  ellipse(
    ctx,
    13,-4,
    5,6,
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


function drawHubArmory(x,y){
  shadow(
    x,
    y+10,
    200,30,
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
    34,112,
    9,
    '#3e5267',
    '#1a2939',
    5
  );

  rr(
    ctx,
    x+78,
    y-112,
    34,112,
    9,
    '#3e5267',
    '#1a2939',
    5
  );

  for(const sx of [x-95,x+95]){
    ctx.save();

    ctx.globalAlpha=
      .7+
      .25*Math.sin(
        G.time*5+sx
      );

    ctx.shadowColor='#ffb35c';
    ctx.shadowBlur=18;

    ellipse(
      ctx,
      sx,
      y-91,
      8,18,
      '#ffd08a'
    );

    ctx.restore();
  }

  // Central armored door.
  rr(
    ctx,
    x-38,
    y-79,
    76,80,
    12,
    '#172638',
    '#0c1724',
    5
  );

  ctx.strokeStyle='#6cecff';
  ctx.lineWidth=3;

  ctx.shadowColor='#6cecff';
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
    24,58,
    7,
    '#24394e',
    '#7292aa',
    3
  );

  rr(
    ctx,
    x+48,
    y-77,
    24,58,
    7,
    '#24394e',
    '#7292aa',
    3
  );

  ctx.strokeStyle='#dceaff';
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
    .2*Math.sin(
      G.time*3.5
    );

  ctx.shadowColor='#6cecff';
  ctx.shadowBlur=15;

  ctx.fillStyle='#b9f7ff';
  ctx.strokeStyle='#31556d';
  ctx.lineWidth=2;

  ctx.beginPath();

  ctx.moveTo(-14,-12);
  ctx.lineTo(14,-12);
  ctx.lineTo(20,2);
  ctx.lineTo(0,20);
  ctx.lineTo(-20,2);

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


function drawHubTerminal(x,y){
  shadow(
    x,
    y+10,
    205,30,
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
    44,130,
    15,
    tower,
    '#23384d',
    5
  );

  rr(
    ctx,
    x+47,
    y-128,
    44,130,
    15,
    tower,
    '#23384d',
    5
  );

  ctx.strokeStyle='#42657c';
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
    54,70,
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

  ctx.strokeStyle='rgba(202,252,255,.8)';
  ctx.lineWidth=2;

  ctx.beginPath();

  ctx.ellipse(
    0,0,
    42,17,
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
    0,0,
    42,17,
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
      i*Math.PI*2/5,

      rx=74,

      px=
        x+
        Math.cos(a)*rx,

      py=
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
      -5,-5,
      10,10
    );

    ctx.restore();
  }

  // Control console.
  rr(
    ctx,
    x-55,
    y-29,
    110,32,
    9,
    '#13273b',
    '#6cecff',
    3
  );

  ctx.fillStyle='#8ff3ff';

  for(let i=0;i<4;i++){
    ctx.fillRect(
      x-39+i*22,
      y-18,
      12,4
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


function drawHubCoreMonument(x,y){
  ctx.save();

  shadow(
    x,
    y+88,
    105,20,
    .22
  );

  // pedestal
  rr(
    ctx,
    x-34,
    y+35,
    68,55,
    13,
    '#354b62',
    '#17293c',
    5
  );

  rr(
    ctx,
    x-48,
    y+75,
    96,18,
    8,
    '#5f7d93',
    '#20354a',
    4
  );

  // floating diamond core
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
    .16*Math.sin(
      G.time*4
    );

  ctx.shadowColor='#6cecff';
  ctx.shadowBlur=28;

  const g=
    ctx.createLinearGradient(
      -18,-18,
      18,18
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
  ctx.strokeStyle='#d7fbff';
  ctx.lineWidth=3;

  ctx.fillRect(
    -17,-17,
    34,34
  );

  ctx.strokeRect(
    -17,-17,
    34,34
  );

  ctx.restore();
}


function drawParticles(cam=0){
  for(const p of G.particles){
    ctx.save();

    ctx.globalAlpha=
      clamp(
        p.life/p.max,
        0,
        1
      );

    if(p.kind==='text'){
      ctx.fillStyle=p.color;

      ctx.font=
        '900 '+
        p.size+
        'px system-ui';

      ctx.textAlign='center';

      ctx.fillText(
        p.text,
        p.x-cam,
        p.y
      );

      ctx.textAlign='left';

    }else{
      ctx.fillStyle=p.color;
      ctx.shadowColor=p.color;
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

let peer = null,
    connection = null,
    isHost = false;

const arena = {
  active: false,
  bot: false,
  returnToHub: false,
  returnWeapon: null,

  remote: {
    x: 900,
    y: 530,
    hp: 1000,
    maxHP: 1000,
    facing: -1,
    attack: 0,
    name: 'RIVAL'
  },

  local: {
    hp: 1000,
    maxHP: 1000
  },

  round: 1,
  wins: 0,
  losses: 0,
  lastSend: 0
};


function openBonus(fromHub = G.scene === 'hub') {
  arena.returnToHub = !!fromHub;

  closeAllOverlays();

  $('bonusOverlay').classList.remove('hidden');
  $('bonusHome').classList.add('active');
  $('bonusLobby').classList.remove('active');

  G.paused = true;

  SFX.resume();
  MUSIC.start();

  $('networkStatus').textContent =
    arena.returnToHub
      ? 'Rift Arena linked to The Hub. Exiting a fight will return you to the station.'
      : 'Online arena ready when internet access is available.';

  const code =
    new URLSearchParams(location.search).get('fight');

  if (code) {
    $('roomCodeInput').value = code;

    $('networkStatus').textContent =
      'Invite detected. Press JOIN FROM LINK / CODE.';
  }
}


function closeBonus() {
  disconnectPeer();

  $('bonusOverlay').classList.add('hidden');

  G.paused = false;
}


function createFight() {
  if (typeof Peer === 'undefined') {
    networkMessage(
      'PeerJS could not load. Check your internet connection.'
    );
    return;
  }

  disconnectPeer();

  isHost = true;
  peer = new Peer();

  networkMessage(
    'Creating private arena...'
  );

  $('bonusHome').classList.remove('active');
  $('bonusLobby').classList.add('active');

  peer.on('open', id => {
    const base =
      location.href
        .split('?')[0]
        .split('#')[0];

    const link =
      base +
      '?fight=' +
      encodeURIComponent(id);

    $('roomCodeText').textContent = id;
    $('inviteLink').value = link;

    $('lobbyStatus').textContent =
      'Waiting for opponent...';
  });

  peer.on('connection', conn => {
    connection = conn;

    setupConnection(conn);
  });

  peer.on('error', err =>
    networkMessage(
      'Connection error: ' + err.type
    )
  );
}


function joinFight() {
  const id =
    $('roomCodeInput').value.trim() ||
    new URLSearchParams(location.search).get('fight');

  if (!id) {
    networkMessage(
      'Paste a room code or open an invite link first.'
    );
    return;
  }

  if (typeof Peer === 'undefined') {
    networkMessage(
      'PeerJS could not load. Check your internet connection.'
    );
    return;
  }

  disconnectPeer();

  isHost = false;
  peer = new Peer();

  networkMessage(
    'Connecting to arena...'
  );

  peer.on('open', () => {
    connection =
      peer.connect(
        id,
        {
          reliable: true
        }
      );

    setupConnection(
      connection
    );
  });

  peer.on('error', err =>
    networkMessage(
      'Connection error: ' + err.type
    )
  );
}


function setupConnection(conn) {
  conn.on('open', () => {
    conn.send({
      type: 'hello',
      name: 'RIFTWALKER'
    });

    startArena(false);
  });

  conn.on(
    'data',
    handleArenaData
  );

  conn.on('close', () => {
    if (arena.active) {
      toast(
        'RIFT ARENA',
        'Opponent disconnected.'
      );

      endArenaToMenu();
    }
  });
}


function handleArenaData(d) {
  if (
    !d ||
    typeof d !== 'object'
  ) {
    return;
  }

  if (d.type === 'state') {
    arena.remote.x = d.x;
    arena.remote.y = d.y;
    arena.remote.facing = d.facing;
    arena.remote.hp = d.hp;
    arena.remote.attack = d.attack || 0;
    arena.remote.name = d.name || 'RIVAL';
  }

  if (d.type === 'attack') {
    arena.remote.attack = .25;

    const dx =
      (P.x - arena.remote.x) *
      arena.remote.facing;

    if (
      dx > -40 &&
      dx < d.range &&
      Math.abs(
        P.y - arena.remote.y
      ) < 90
    ) {
      arenaDamageLocal(
        d.damage
      );
    }
  }

  if (d.type === 'round') {
    arena.remote.hp =
      d.hp || 1000;
  }
}


function practiceArena(
  returnToHub = false
) {
  disconnectPeer();

  arena.bot = true;
  arena.returnToHub =
    !!returnToHub;

  startArena(true);
}


function startArena(bot) {
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

  G.scene = 'arena';
  G.paused = false;
  G.worldId = null;

  arena.active = true;
  arena.bot = bot;

  arena.returnWeapon =
    P.weapon;

  arena.local.hp = 1000;
  arena.local.maxHP = 1000;

  arena.remote = {
    x: 900,
    y: 530,
    hp: 1000,
    maxHP: 1000,
    facing: -1,
    attack: 0,
    name: bot
      ? 'TRAINING BOT'
      : 'RIVAL'
  };

  P.x = 330;
  P.y = 530;
  P.hp = 1000;
  P.weapon = 'Nova Sword';
  P.attackCooldown = 0;

  MUSIC.setWorld(
    'arena'
  );

  $('arenaP2Name').textContent =
    arena.remote.name;

  $('roundText').textContent =
    'ROUND ' + arena.round;

  syncArenaHud();

  toast(
    'RIFT ARENA',
    'Fight!'
  );
}


function updateArena(dt) {
  updatePlayer(
    dt,
    1280
  );

  arena.remote.attack =
    Math.max(
      0,
      arena.remote.attack - dt
    );

  if (arena.bot) {
    const r =
      arena.remote;

    const dx =
      P.x - r.x;

    const dy =
      P.y - r.y;

    const dist =
      Math.hypot(
        dx,
        dy
      );

    if (
      Math.abs(dx) > 8
    ) {
      r.facing =
        dx > 0
          ? 1
          : -1;
    }

    if (dist > 78) {
      r.x +=
        dx / dist *
        155 *
        dt;

      r.y +=
        dy / dist *
        112 *
        dt;

      r.y =
        clamp(
          r.y,
          435,
          620
        );
    }

    r.botCd =
      (r.botCd || .5) -
      dt;

    if (
      dist < 105 &&
      r.botCd <= 0
    ) {
      r.botCd = .65;
      r.attack = .25;

      arenaDamageLocal(
        randi(
          30,
          45
        )
      );
    }

  } else if (
    connection?.open
  ) {
    arena.lastSend -= dt;

    if (
      arena.lastSend <= 0
    ) {
      arena.lastSend = .05;

      connection.send({
        type: 'state',

        x: P.x,
        y: P.y,

        facing:
          P.facing,

        hp:
          arena.local.hp,

        attack:
          P.attackTimer,

        name:
          'RIFTWALKER'
      });
    }
  }

  if (
    arena.local.hp <= 0 ||
    arena.remote.hp <= 0
  ) {
    finishArenaRound();
  }
}


function arenaLocalAttack(
  range,
  damage,
  critical = false
) {
  const r =
    arena.remote;

  const dx =
    (r.x - P.x) *
    P.facing;

  if (
    dx > -40 &&
    dx < range &&
    Math.abs(
      r.y - P.y
    ) < 90
  ) {
    if (arena.bot) {
      r.hp =
        Math.max(
          0,
          r.hp - damage
        );

      burst(
        r.x,
        r.y - 50,
        critical
          ? '#ffe88b'
          : '#ff7589',
        critical
          ? 16
          : 8
      );

      if (critical) {
        SFX.crit();

        floatingText(
          'CRITICAL! ' + damage,
          r.x,
          r.y - 100,
          '#ffe88b'
        );

        G.screenShake = 11;

      } else {
        SFX.hit();
      }
    }
  }

  if (
    connection?.open
  ) {
    connection.send({
      type: 'attack',
      range,
      damage,
      critical
    });
  }
}


function arenaDamageLocal(dmg) {
  arena.local.hp =
    Math.max(
      0,
      arena.local.hp -
      Math.max(
        1,
        Math.round(
          dmg -
          getStats().def *
          .25
        )
      )
    );

  P.hitFlash = .18;

  G.screenShake = 7;

  SFX.hurt();

  burst(
    P.x,
    P.y - 55,
    '#ff7589',
    8
  );

  syncArenaHud();
}


function finishArenaRound() {
  const won =
    arena.remote.hp <= 0 &&
    arena.local.hp > 0;

  if (won) {
    arena.wins++;
  } else {
    arena.losses++;
  }

  toast(
    won
      ? 'ROUND WON'
      : 'ROUND LOST',

    `Score ${arena.wins} - ${arena.losses}`,

    2
  );

  arena.round++;

  arena.local.hp = 1000;
  arena.remote.hp = 1000;

  P.x = 330;

  arena.remote.x = 900;

  if (
    connection?.open
  ) {
    connection.send({
      type: 'round',
      hp: 1000
    });
  }

  $('roundText').textContent =
    'ROUND ' + arena.round;

  syncArenaHud();
}


function syncArenaHud() {
  const a =
    arena.local.hp /
    arena.local.maxHP;

  const b =
    arena.remote.hp /
    arena.remote.maxHP;

  $('arenaP1Hp')
    .style
    .width =
    (a * 100) + '%';

  $('arenaP2Hp')
    .style
    .width =
    (b * 100) + '%';

  $('arenaP1Text')
    .textContent =
    arena.local.hp +
    ' / ' +
    arena.local.maxHP;

  $('arenaP2Text')
    .textContent =
    arena.remote.hp +
    ' / ' +
    arena.remote.maxHP;
}


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

  ctx.fillStyle = g;

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

  for (
    let i = 0;
    i < 8;
    i++
  ) {
    ctx.globalAlpha =
      .18;

    ctx.fillStyle =
      i % 2
        ? '#6cecff'
        : '#9b72ff';

    ctx.beginPath();

    ctx.moveTo(
      i * 180,
      400
    );

    ctx.lineTo(
      i * 180 + 100,
      250
    );

    ctx.lineTo(
      i * 180 + 200,
      400
    );

    ctx.fill();
  }

  ctx.globalAlpha = 1;

  drawRiftwalker(
    P.x,
    P.y - P.jump,
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
) {
  const saveFacing =
    P.facing;

  const saveAttack =
    P.attackTimer;

  const saveIndex =
    P.attackIndex;

  P.facing =
    r.facing;

  P.attackTimer =
    r.attack;

  P.attackIndex = 1;

  drawRiftwalker(
    x,
    y,
    1,
    true
  );

  P.facing =
    saveFacing;

  P.attackTimer =
    saveAttack;

  P.attackIndex =
    saveIndex;
}


function endArenaToMenu() {
  const back =
    arena.returnToHub;

  arena.active = false;
  arena.bot = false;
  arena.returnToHub = false;

  disconnectPeer();

  $('arenaHud')
    .classList
    .add('hidden');

  if (
    arena.returnWeapon !==
    undefined
  ) {
    P.weapon =
      arena.returnWeapon;
  }

  arena.returnWeapon = null;

  if (back) {
    $('startScreen')
      .classList
      .add('hidden');

    $('hud')
      .classList
      .remove('hidden');

    beginHub();

    toast(
      'RIFT ARENA',
      'Match ended. Returned to The Hub.'
    );

  } else {
    $('hud')
      .classList
      .add('hidden');

    $('startScreen')
      .classList
      .remove('hidden');

    G.scene = 'menu';

    MUSIC.setWorld(
      'hub'
    );
  }
}


function disconnectPeer() {
  try {
    connection?.close();
  } catch {}

  try {
    peer?.destroy();
  } catch {}

  connection = null;
  peer = null;
}


function networkMessage(t) {
  $('networkStatus')
    .textContent = t;

  $('lobbyStatus')
    .textContent = t;
}


/* =========================================================
   BONUS MODE BUTTONS
   ========================================================= */

$('bonusBtn').onclick =
  () => openBonus(false);

$('closeBonus').onclick =
  closeBonus;

$('createFightBtn').onclick =
  createFight;

$('joinFightBtn').onclick =
  joinFight;

$('practiceBtn').onclick =
  () =>
    practiceArena(
      arena.returnToHub
    );

if (
  $('arenaExitBtn')
) {
  $('arenaExitBtn').onclick =
    endArenaToMenu;
}

$('cancelLobbyBtn').onclick =
  () => {
    disconnectPeer();

    $('bonusLobby')
      .classList
      .remove('active');

    $('bonusHome')
      .classList
      .add('active');
  };

$('copyInviteBtn').onclick =
  async () => {
    try {
      await navigator.clipboard.writeText(
        $('inviteLink').value
      );

      $('copyInviteBtn')
        .textContent =
        'COPIED';

      setTimeout(
        () =>
          $('copyInviteBtn')
            .textContent =
            'COPY LINK',
        1200
      );

    } catch {
      $('inviteLink').select();

      networkMessage(
        'Select and copy the link manually.'
      );
    }
  };


/* =========================================================
   ROUGH-FRAME OVERLAY
   Adds paper grain, pencil hatching, speed streaks and single-frame
   impact flashes without replacing each world's own color identity.
   ========================================================= */

function drawRoughAnimationOverlay() {
  if (
    ![
      'world',
      'hub',
      'arena',
      'tower',
      'bossrush'
    ].includes(G.scene)
  ) {
    return;
  }

  ctx.save();

  // Very light paper wash so the colored worlds still read clearly.
  ctx.fillStyle =
    'rgba(246,244,235,.025)';

  ctx.fillRect(
    0,
    0,
    W,
    H
  );

  const frame =
    Math.floor(
      G.time * 6
    );

  for (
    let i = 0;
    i < 46;
    i++
  ) {
    const x =
      (
        i * 173 +
        frame * 19
      ) % W;

    const y =
      (
        i * 97 +
        frame * 7
      ) % H;

    ctx.globalAlpha =
      .035 +
      (i % 3) *
      .012;

    ctx.strokeStyle =
      i % 4 === 0
        ? '#ffffff'
        : '#0c1420';

    ctx.lineWidth = .7;

    ctx.beginPath();

    ctx.moveTo(
      x,
      y
    );

    ctx.lineTo(
      x +
      8 +
      (i % 5) * 4,

      y +
      sketchRand(
        i + frame
      ) * 4
    );

    ctx.stroke();
  }

  ctx.globalAlpha = 1;

  const px =
    (
      G.scene === 'world' ||
      G.scene === 'hub'
    )
      ? P.x - G.camera
      : P.x;

  const py =
    P.y - P.jump;

  if (
    P.attackTimer > 0 ||
    P.dashTimer > 0
  ) {
    const w =
      getWeapon() ||
      WEAPONS['Nova Sword'];

    const attack =
      P.attackTimer > 0;

    ctx.lineCap =
      'round';

    for (
      let i = 0;
      i <
      (
        attack
          ? 15
          : 22
      );
      i++
    ) {
      const yy =
        py -
        145 +
        i * 13 +
        sketchRand(
          i + 200
        ) * 18;

      const start =
        px -
        P.facing *
        (
          attack
            ? 180
            : 250
        ) -
        sketchRand(
          i + 230
        ) * 60;

      const end =
        px -
        P.facing *
        (
          attack
            ? 55
            : 85
        );

      ctx.strokeStyle =
        i % 4 === 0
          ? (
              w?.color ||
              '#72e6ff'
            )
          : 'rgba(12,18,27,.34)';

      ctx.globalAlpha =
        i % 4 === 0
          ? .24
          : .18;

      ctx.lineWidth =
        i % 5 === 0
          ? 3
          : 1.4;

      ctx.beginPath();

      ctx.moveTo(
        start,
        yy
      );

      ctx.lineTo(
        end,
        yy +
        sketchRand(
          i + 260
        ) * 16
      );

      ctx.stroke();
    }
  }

  if (
    G.impactFrame > 0
  ) {
    const a =
      clamp(
        G.impactFrame /
        .075,
        0,
        1
      );

    ctx.globalAlpha =
      .20 * a;

    ctx.fillStyle =
      '#fffdf3';

    ctx.fillRect(
      0,
      0,
      W,
      H
    );

    ctx.globalAlpha =
      .55 * a;

    ctx.strokeStyle =
      '#111722';

    ctx.lineWidth = 2;

    const ix =
      G.impactX || px;

    const iy =
      G.impactY ||
      py - 45;

    for (
      let i = 0;
      i < 24;
      i++
    ) {
      const ang =
        i *
        Math.PI *
        2 /
        24 +
        sketchRand(
          i + 400
        ) * .13;

      const r1 =
        35 +
        (i % 4) * 9;

      const r2 =
        110 +
        (i % 6) * 25;

      ctx.beginPath();

      ctx.moveTo(
        ix +
        Math.cos(ang) *
        r1,

        iy +
        Math.sin(ang) *
        r1
      );

      ctx.lineTo(
        ix +
        Math.cos(ang) *
        r2,

        iy +
        Math.sin(ang) *
        r2
      );

      ctx.stroke();
    }
  }

  ctx.restore();
}


/* =========================================================
   MAIN UPDATE / DRAW LOOP
   ========================================================= */

function update(dt) {
  G.time += dt;

  if (G.paused) {
    justPressed.clear();
    return;
  }

  G.screenShake =
    Math.max(
      0,
      G.screenShake -
      dt * 24
    );

  G.flash =
    Math.max(
      0,
      G.flash - dt
    );

  G.impactFrame =
    Math.max(
      0,
      (G.impactFrame || 0) -
      dt
    );

  if (
    (G.hitStop || 0) > 0
  ) {
    G.hitStop =
      Math.max(
        0,
        G.hitStop - dt
      );

    justPressed.clear();
    return;
  }

  updateParticles(dt);

  if (
    G.messageTime > 0
  ) {
    G.messageTime -= dt;

    if (
      G.messageTime <= 0
    ) {
      $('toast')
        .classList
        .add('hidden');
    }
  }

  if (
    G.scene === 'flight'
  ) {
    G.sceneTime += dt;

    $('cinematic')
      .classList
      .remove('hidden');

    $('cinematic').textContent =
      G.sceneTime < 2
        ? 'DEEP SPACE'
        : G.sceneTime < 4
          ? 'UNKNOWN SIGNAL DETECTED'
          : G.sceneTime < 6
            ? 'NAVIGATION FAILURE'
            : 'PULL UP!';

    if (
      G.sceneTime > 7
    ) {
      G.scene = 'crash';
      G.sceneTime = 0;
    }

    justPressed.clear();
    return;
  }

  if (
    G.scene === 'crash'
  ) {
    G.sceneTime += dt;

    $('cinematic').textContent =
      G.sceneTime < 1.5
        ? 'IMPACT IMMINENT'
        : '';

    if (
      G.sceneTime > 3
    ) {
      $('cinematic')
        .classList
        .add('hidden');

      beginWorld(
        'earth'
      );
    }

    justPressed.clear();
    return;
  }

  if (
    G.scene === 'travel'
  ) {
    G.sceneTime += dt;

    if (
      G.sceneTime >
      travelDuration()
    ) {
      beginWorld(
        G.travelTarget
      );
    }

    justPressed.clear();
    return;
  }

  if (
    G.scene === 'arena'
  ) {
    updateArena(dt);
    syncHUD();

    justPressed.clear();
    return;
  }

  if (
    G.scene === 'tower'
  ) {
    updateRiftTower(dt);
    syncHUD();

    justPressed.clear();
    return;
  }

  if (
    G.scene === 'bossrush'
  ) {
    updateBossRush(dt);
    syncHUD();

    justPressed.clear();
    return;
  }

  if (
    G.scene === 'hub'
  ) {
    updatePlayer(
      dt,
      HUB_WIDTH
    );

    G.camera =
      lerp(
        G.camera,
        clamp(
          P.x - W * .5,
          0,
          HUB_WIDTH - W
        ),
        .09
      );

    updateInteraction();
  }

  if (
    G.scene === 'world'
  ) {
    updatePlayer(
      dt,
      WORLDS[G.worldId].width
    );

    updateWorldGimmick(dt);
    updateWorldSegment(dt);
    updateCombatStyle(dt);
    updateEnemies(dt);

    G.camera =
      lerp(
        G.camera,
        clamp(
          P.x - W * .44,
          0,
          WORLDS[G.worldId].width - W
        ),
        .08
      );

    updateInteraction();
  }

  syncHUD();

  justPressed.clear();
}


function draw() {
  ctx.save();

  if (
    G.screenShake > 0
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
    G.scene === 'menu'
  ) {
    space(
      G.time * 8
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

  } else if (
    G.scene === 'flight'
  ) {
    space(
      G.sceneTime * 85
    );

    drawShip(
      370,
      360,
      1.35,
      0
    );

  } else if (
    G.scene === 'crash'
  ) {
    space(
      G.time * 60
    );

    const p =
      clamp(
        G.sceneTime / 3,
        0,
        1
      );

    drawPlanet(
      W / 2,

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
      W / 2,

      lerp(
        130,
        560,
        p
      ),

      1.45,

      p * 2
    );

  } else if (
    G.scene === 'travel'
  ) {
    space(
      G.time * 110
    );

    drawShip(
      W / 2,
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

      520 *
      clamp(
        G.sceneTime /
        travelDuration(),
        0,
        1
      ),

      14,
      7,
      '#6fe1ff'
    );

    ctx.fillStyle =
      '#fff';

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

  } else if (
    G.scene === 'hub'
  ) {
    drawHub();

    drawParticles(
      G.camera
    );

    drawCinematicGrade();

  } else if (
    G.scene === 'world'
  ) {
    drawWorld();

    drawParticles(
      G.camera
    );

  } else if (
    G.scene === 'tower'
  ) {
    drawEndlessMode(
      'RIFT TOWER · FLOOR ' +
      (G.towerFloor || 1),

      'BEST ' +
      (
        P.longTerm?.tower?.best ||
        0
      ) +
      ' · ' +
      (
        P.riftTokens ||
        0
      ) +
      ' RIFT TOKENS'
    );

  } else if (
    G.scene === 'bossrush'
  ) {
    drawEndlessMode(
      'BOSS RUSH · ' +
      (
        (G.bossRushIndex || 0) +
        1
      ) +
      ' / ' +
      (
        G.bossRushWorlds?.length ||
        0
      ),

      'BEST STREAK ' +
      (
        P.longTerm
          ?.bossRush
          ?.best ||
        0
      )
    );

  } else if (
    G.scene === 'arena'
  ) {
    drawArena();
  }

  drawRoughAnimationOverlay();

  if (
    G.flash > 0
  ) {
    ctx.fillStyle =
      `rgba(255,255,255,${G.flash * 4})`;

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

$('newBtn').onclick =
  () => {
    SFX.resume();
    resetGame();
  };

$('loadBtn').onclick =
  () => {
    SFX.resume();

    if (
      !loadGame()
    ) {
      toast(
        'SYSTEM',
        'No save game found.'
      );
    }
  };


function resizeCanvasCss() {
  /*
    Canvas keeps 16:9 internal resolution;
    CSS handles responsive fit.
  */
}


window.addEventListener(
  'resize',
  resizeCanvasCss
);


const fightParam =
  new URLSearchParams(
    location.search
  ).get('fight');

if (fightParam) {
  setTimeout(
    () =>
      openBonus(false),
    50
  );
}


let last =
  performance.now();


function loop(now) {
  const dt =
    Math.min(
      .033,
      (now - last) /
      1000
    );

  last = now;

  update(dt);
  draw();

  requestAnimationFrame(
    loop
  );
}


syncHUD();

requestAnimationFrame(
  loop
);
