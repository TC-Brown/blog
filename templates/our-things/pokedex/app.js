/* -------------------------------------------------------------
   3RD GENERATION POKEDEX - INTERACTIVE LOGIC & SOUNDS
   ------------------------------------------------------------- */

// SOUND SYSTEM (Web Audio API Synthesizer)
class PokedexSoundSystem {
  constructor() {
    this.ctx = null;
    this.activeAudio = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Synthesize retro GBA-like beep
  playBeep(freq = 800, duration = 0.08, type = 'square') {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playBoot() {
    this.init();
    this.playBeep(523.25, 0.08, 'triangle'); // C5
    setTimeout(() => {
      this.playBeep(659.25, 0.08, 'triangle'); // E5
      setTimeout(() => {
        this.playBeep(783.99, 0.08, 'triangle'); // G5
        setTimeout(() => {
          this.playBeep(1046.50, 0.25, 'sine'); // C6
        }, 80);
      }, 80);
    }, 80);
  }

  playRadar() {
    this.init();
    let count = 0;
    const interval = setInterval(() => {
      this.playBeep(1200 - count * 100, 0.04, 'sine');
      count++;
      if (count > 5) clearInterval(interval);
    }, 50);
  }

  playModalOpen() {
    this.init();
    this.playBeep(880, 0.08, 'sine');
    setTimeout(() => this.playBeep(1200, 0.12, 'sine'), 80);
  }

  playModalClose() {
    this.init();
    this.playBeep(1000, 0.08, 'sine');
    setTimeout(() => this.playBeep(600, 0.12, 'sine'), 80);
  }

  // Play official Pokemon cry from URL
  playCry(cryUrl, onPlayCallback, onEndCallback) {
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio = null;
    }

    if (!cryUrl) return;

    const audio = new Audio(cryUrl);
    audio.volume = 0.25;
    this.activeAudio = audio;

    audio.addEventListener('play', () => {
      if (onPlayCallback) onPlayCallback();
    });

    audio.addEventListener('ended', () => {
      if (onEndCallback) onEndCallback();
      this.activeAudio = null;
    });

    audio.addEventListener('error', () => {
      if (onEndCallback) onEndCallback();
      this.activeAudio = null;
      // Fallback retro synth cry if ogg fails
      this.playBeep(300, 0.15, 'sawtooth');
      setTimeout(() => this.playBeep(180, 0.25, 'sawtooth'), 100);
    });

    audio.play().catch(err => {
      console.warn("Audio play blocked or failed: ", err);
      // Fallback
      this.playBeep(300, 0.15, 'sawtooth');
      setTimeout(() => this.playBeep(180, 0.25, 'sawtooth'), 100);
    });
  }
}

// CHARIZARD VARIANTS & POKEMON DATABASE
const CHARIZARD_MODE_DATA = [
  {
    id: "No. 006",
    name: "CHARIZARD",
    category: "Flame Pokémon",
    types: ["fire", "flying"],
    height: "5' 07\"",
    weight: "199.5 lbs",
    desc: "Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally. It loves to battle strong opponents.",
    stats: { hp: 78, atk: 84, def: 78, satk: 109, sdef: 85, spd: 100 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/6.gif",
    spriteShiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/6.gif",
    habitat: "CRATER (MT. CHIMNEY)",
    mapPos: { top: "38%", left: "45%" },
    sizeScale: 85, // px height in comparison
    evo: [
      { name: "Charmander", lvl: "Lv 16", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png" },
      { name: "Charmeleon", lvl: "Lv 36", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png" },
      { name: "Charizard", lvl: "FINAL", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" }
    ],
    cry: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/6.ogg"
  },
  {
    id: "No. 006-S",
    name: "SHNY CHARIZARD",
    category: "Flame Pokémon",
    types: ["fire", "flying"],
    height: "5' 07\"",
    weight: "199.5 lbs",
    desc: "A rare, dark-scaled variant. Its wings burn with a deep blood-red hue. Seeing one fly across the night sky is considered an omen of legendary battles.",
    stats: { hp: 78, atk: 84, def: 78, satk: 109, sdef: 85, spd: 100 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/6.gif",
    spriteShiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/6.gif",
    habitat: "VOLCANO (MT. EMBER)",
    mapPos: { top: "62%", left: "75%" },
    sizeScale: 85,
    evo: [
      { name: "Charmander", lvl: "Lv 16", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/4.png" },
      { name: "Charmeleon", lvl: "Lv 36", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/5.png" },
      { name: "Charizard", lvl: "FINAL", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png" }
    ],
    cry: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/6.ogg"
  },
  {
    id: "No. 006-X",
    name: "MEGA CHARIZARD X",
    category: "Flame Pokémon",
    types: ["fire", "dragon"],
    height: "5' 07\"",
    weight: "243.6 lbs",
    desc: "Mega Evolution overwhelms its body with black dragon power, turning its flames hot blue. Its physical strength grows to devastating levels.",
    stats: { hp: 78, atk: 130, def: 111, satk: 130, sdef: 85, spd: 100 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10034.png",
    spriteShiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10034.png",
    habitat: "JAGGED PASS",
    mapPos: { top: "42%", left: "42%" },
    sizeScale: 85,
    evo: [
      { name: "Charizard", lvl: "Kanto", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" },
      { name: "Charizardite X", lvl: "MEGA X", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10034.png" }
    ],
    cry: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/6.ogg"
  },
  {
    id: "No. 006-Y",
    name: "MEGA CHARIZARD Y",
    category: "Flame Pokémon",
    types: ["fire", "flying"],
    height: "5' 07\"",
    weight: "221.6 lbs",
    desc: "Mega Evolution hones its flight capabilities, giving it sleek horns and spiked wings. It is said to possess flying speeds that rival supersonic jet fighters.",
    stats: { hp: 78, atk: 104, def: 78, satk: 159, sdef: 115, spd: 100 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10035.png",
    spriteShiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10035.png",
    habitat: "SKY PILLAR",
    mapPos: { top: "82%", left: "68%" },
    sizeScale: 85,
    evo: [
      { name: "Charizard", lvl: "Kanto", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" },
      { name: "Charizardite Y", lvl: "MEGA Y", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10035.png" }
    ],
    cry: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/6.ogg"
  },
  {
    id: "No. 006-G",
    name: "GMAX CHARIZARD",
    category: "Flame Pokémon",
    types: ["fire", "flying"],
    height: "91' 10\"",
    weight: "??? lbs",
    desc: "Gigantamax energy has formed wings made of pure flame that burn hotter than molten magma. It incinerates opponents with massive firestorms.",
    stats: { hp: 120, atk: 110, def: 90, satk: 145, sdef: 100, spd: 100 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10186.png",
    spriteShiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10186.png",
    habitat: "MAX LAIR",
    mapPos: { top: "15%", left: "55%" },
    sizeScale: 115, // Extra large
    evo: [
      { name: "Charizard", lvl: "Dynamax", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" },
      { name: "G-Max Factor", lvl: "G-MAX", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10186.png" }
    ],
    cry: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/6.ogg"
  },
  {
    id: "No. 006-P",
    name: "PIXEL CHARIZARD",
    category: "Retro Pokémon",
    types: ["fire", "flying"],
    height: "5' 07\"",
    weight: "199.5 lbs",
    desc: "A legendary version of Charizard imported from a pixelated universe. Its flame-spitting attacks are rendered in glorious low-resolution nostalgia.",
    stats: { hp: 78, atk: 84, def: 78, satk: 109, sdef: 85, spd: 100 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/transparent/6.png",
    spriteShiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/transparent/6.png",
    habitat: "GAME BOY ADVANCE",
    mapPos: { top: "50%", left: "50%" },
    sizeScale: 75,
    evo: [
      { name: "Charmander", lvl: "GB", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/transparent/4.png" },
      { name: "Charmeleon", lvl: "GB", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/transparent/5.png" },
      { name: "Charizard", lvl: "GB", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/transparent/6.png" }
    ],
    cry: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/6.ogg"
  },
  {
    id: "No. 006-D",
    name: "DET. CHARIZARD",
    category: "Mystery Pokémon",
    types: ["fire", "normal"],
    height: "5' 07\"",
    weight: "205.0 lbs",
    desc: "Equipped with a magnifying glass and a tiny deerstalker hat, this Charizard solves mysteries in Ryme City by burning down false alibis.",
    stats: { hp: 80, atk: 90, def: 80, satk: 95, sdef: 85, spd: 90 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png", // Stand-in
    spriteShiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png",
    habitat: "RYME CITY",
    mapPos: { top: "25%", left: "30%" },
    sizeScale: 85,
    evo: [
      { name: "Charmeleon", lvl: "Solve Case", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png" },
      { name: "Detective", lvl: "INVESTIGATOR", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" }
    ],
    cry: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/6.ogg"
  }
];

const STANDARD_MODE_DATA = [
  {
    id: "No. 001",
    name: "BULBASAUR",
    category: "Seed Pokémon",
    types: ["grass", "poison"],
    height: "2' 04\"",
    weight: "15.2 lbs",
    desc: "A strange seed was planted on its back at birth. The plant sprouts and grows larger with this Pokémon.",
    stats: { hp: 45, atk: 49, def: 49, satk: 65, sdef: 65, spd: 45 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/1.gif",
    spriteShiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/1.gif",
    habitat: "GRASSLAND",
    mapPos: { top: "55%", left: "28%" },
    sizeScale: 35,
    evo: [
      { name: "Bulbasaur", lvl: "Lv 16", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" },
      { name: "Ivysaur", lvl: "Lv 32", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png" },
      { name: "Venusaur", lvl: "FINAL", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png" }
    ],
    cry: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/1.ogg"
  },
  {
    id: "No. 004",
    name: "CHARMANDER",
    category: "Lizard Pokémon",
    types: ["fire"],
    height: "2' 00\"",
    weight: "18.7 lbs",
    desc: "The flame on its tail indicates its life force. If the flame goes out, it dies. When it is healthy, its flame burns brightly.",
    stats: { hp: 39, atk: 52, def: 43, satk: 60, sdef: 50, spd: 65 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/4.gif",
    spriteShiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/4.gif",
    habitat: "VOLCANO",
    mapPos: { top: "60%", left: "70%" },
    sizeScale: 32,
    evo: [
      { name: "Charmander", lvl: "Lv 16", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png" },
      { name: "Charmeleon", lvl: "Lv 36", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png" },
      { name: "Charizard", lvl: "FINAL", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" }
    ],
    cry: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/4.ogg"
  },
  {
    id: "No. 005",
    name: "CHARMELEON",
    category: "Flame Pokémon",
    types: ["fire"],
    height: "3' 07\"",
    weight: "41.9 lbs",
    desc: "It lashes about with its tail to knock down its foe. It is hot-headed by nature, and it constantly seeks formidable opponents.",
    stats: { hp: 58, atk: 64, def: 58, satk: 80, sdef: 65, spd: 80 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/5.gif",
    spriteShiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/5.gif",
    habitat: "VOLCANO",
    mapPos: { top: "58%", left: "72%" },
    sizeScale: 55,
    evo: [
      { name: "Charmander", lvl: "Lv 16", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png" },
      { name: "Charmeleon", lvl: "Lv 36", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png" },
      { name: "Charizard", lvl: "FINAL", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" }
    ],
    cry: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/5.ogg"
  },
  {
    id: "No. 006",
    name: "CHARIZARD",
    category: "Flame Pokémon",
    types: ["fire", "flying"],
    height: "5' 07\"",
    weight: "199.5 lbs",
    desc: "Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally. It loves to battle strong opponents.",
    stats: { hp: 78, atk: 84, def: 78, satk: 109, sdef: 85, spd: 100 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/6.gif",
    spriteShiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/6.gif",
    habitat: "CRATER (MT. CHIMNEY)",
    mapPos: { top: "38%", left: "45%" },
    sizeScale: 85,
    evo: [
      { name: "Charmander", lvl: "Lv 16", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png" },
      { name: "Charmeleon", lvl: "Lv 36", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png" },
      { name: "Charizard", lvl: "FINAL", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" }
    ],
    cry: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/6.ogg"
  },
  {
    id: "No. 007",
    name: "SQUIRTLE",
    category: "Tiny Turtle Pokémon",
    types: ["water"],
    height: "1' 08\"",
    weight: "19.8 lbs",
    desc: "It shelters itself in its shell, then strikes back with spouts of high-pressure water at any opportunity.",
    stats: { hp: 44, atk: 48, def: 65, satk: 50, sdef: 64, spd: 43 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/7.gif",
    spriteShiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/7.gif",
    habitat: "OCEAN",
    mapPos: { top: "85%", left: "20%" },
    sizeScale: 28,
    evo: [
      { name: "Squirtle", lvl: "Lv 16", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png" },
      { name: "Wartortle", lvl: "Lv 36", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png" },
      { name: "Blastoise", lvl: "FINAL", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png" }
    ],
    cry: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/7.ogg"
  },
  {
    id: "No. 025",
    name: "PIKACHU",
    category: "Mouse Pokémon",
    types: ["electric"],
    height: "1' 04\"",
    weight: "13.2 lbs",
    desc: "It keeps its tail raised to monitor its surroundings. If you yank its tail, it will try to bite you or zap you.",
    stats: { hp: 35, atk: 55, def: 40, satk: 50, sdef: 50, spd: 90 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif",
    spriteShiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/25.gif",
    habitat: "FOREST",
    mapPos: { top: "25%", left: "15%" },
    sizeScale: 25,
    evo: [
      { name: "Pichu", lvl: "High Friendship", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/172.png" },
      { name: "Pikachu", lvl: "Thunder Stone", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" },
      { name: "Raichu", lvl: "FINAL", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png" }
    ],
    cry: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/25.ogg"
  }
];

// APPLICATION STATE
let isPowered = false;
let isShiny = false;
let selectedIndex = 0;
let currentTab = "info";
let isPokedexClosed = true; // starts folded! Let user open it with START or power it
let pokedexDatabase = CHARIZARD_MODE_DATA;
let activePokemon = null;

// DYNAMIC API STATE & CACHE
const pokemonCache = new Map();
let allPokemonList = [];

// Pre-populate cache with Charizard forms so they load instantly
CHARIZARD_MODE_DATA.forEach(form => {
  pokemonCache.set(form.name.toLowerCase(), form);
});

// INSTANTIATE AUDIO
const audioSystem = new PokedexSoundSystem();

// SELECT ELEMENT REFERENCES
const elements = {
  pokedex: document.getElementById("pokedex"),
  mainScreen: document.getElementById("main-screen"),
  bootOverlay: document.getElementById("screen-boot"),
  screenLoading: document.getElementById("screen-loading"),
  pokemonList: document.getElementById("pokedex-list"),
  searchInput: document.getElementById("pokemon-search"),
  
  // Header details
  pokemonId: document.getElementById("pokemon-id"),
  pokemonName: document.getElementById("pokemon-name"),
  pokemonSprite: document.getElementById("pokemon-sprite"),
  pokemonTypes: document.getElementById("pokemon-types"),
  quickHeight: document.getElementById("quick-height"),
  quickWeight: document.getElementById("quick-weight"),
  shinyStatus: document.getElementById("shiny-status"),
  
  // Tabs display
  pokemonCategory: document.getElementById("pokemon-category"),
  pokemonDesc: document.getElementById("pokemon-desc"),
  habitatName: document.getElementById("habitat-name"),
  mapMarker: document.querySelector(".map-marker"),
  sizeComparisonSprite: document.getElementById("size-comparison-sprite"),
  sizePokemonLabel: document.getElementById("size-pokemon-label"),
  
  // Evos
  evoStage1: document.getElementById("evo-stage-1"),
  evoStage2: document.getElementById("evo-stage-2"),
  evoStage3: document.getElementById("evo-stage-3"),
  evoLevels: document.querySelectorAll(".evo-level"),
  evoStages: document.querySelectorAll(".evo-stage"),

  // Buttons
  btnPower: document.getElementById("btn-power"),
  powerLed: document.getElementById("status-power-led"),
  charizardToggle: document.getElementById("charizard-mode-toggle"),
  btnCry: document.getElementById("btn-cry"),
  btnShiny: document.getElementById("btn-shiny"),
  btnStart: document.getElementById("btn-start"),
  btnSelect: document.getElementById("btn-select"),
  tabButtons: document.querySelectorAll(".tab-btn"),
  
  // LED indicators
  ledRed: document.getElementById("led-red"),
  ledYellow: document.getElementById("led-yellow"),
  ledGreen: document.getElementById("led-green"),
  mainLens: document.getElementById("main-lens"),
  speakerGrill: document.querySelector(".speaker-grill"),

  // Modal elements
  modal: document.getElementById("pokedex-modal"),
  modalTitle: document.getElementById("modal-title"),
  modalContent: document.getElementById("modal-content-area"),
  modalCloseBtn: document.getElementById("modal-close-btn"),
  modalLedYellow: document.getElementById("modal-led-yellow"),
  modalLedGreen: document.getElementById("modal-led-green")
};

// UI RENDERERS
function renderPokedexList(filter = "") {
  elements.pokemonList.innerHTML = "";
  const query = filter.toLowerCase().trim();

  pokedexDatabase.forEach((pokemon, idx) => {
    if (query && !pokemon.name.toLowerCase().includes(query)) return;

    const li = document.createElement("li");
    li.className = `list-item ${idx === selectedIndex ? "selected" : ""}`;
    li.dataset.index = idx;
    li.innerHTML = `
      <span class="item-id">${pokemon.id}</span>
      <span class="item-name">${pokemon.name}</span>
    `;

    li.addEventListener("click", () => {
      if (!isPowered) return;
      audioSystem.playBeep(800, 0.05);
      selectedIndex = idx;
      updateActivePokemon();
    });

    elements.pokemonList.appendChild(li);
  });

  // Ensure scroll is visible on selection
  const selectedItem = elements.pokemonList.querySelector(".selected");
  if (selectedItem) {
    selectedItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

async function updateActivePokemon() {
  if (pokedexDatabase.length === 0) return;
  
  // Wrap selectedIndex boundaries
  if (selectedIndex >= pokedexDatabase.length) selectedIndex = 0;
  if (selectedIndex < 0) selectedIndex = pokedexDatabase.length - 1;

  const selectedItem = pokedexDatabase[selectedIndex];

  // Update selected class in sidebar list
  const listItems = elements.pokemonList.querySelectorAll(".list-item");
  listItems.forEach((item) => {
    if (parseInt(item.dataset.index) === selectedIndex) {
      item.classList.add("selected");
      item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      item.classList.remove("selected");
    }
  });

  // If item already contains fully parsed details (like custom Charizards), load directly
  if (selectedItem.stats) {
    activePokemon = selectedItem;
    renderActivePokemonDetails();
  } else {
    // Lazy load the details from PokeAPI
    await loadSelectedPokemon(selectedItem);
  }
}

function renderActivePokemonDetails() {
  if (!activePokemon) return;

  // Update Main Display values
  elements.pokemonId.textContent = activePokemon.id;
  elements.pokemonName.textContent = activePokemon.name;
  
  // Sprite Shiny Logic
  elements.pokemonSprite.src = isShiny ? activePokemon.spriteShiny : activePokemon.sprite;
  elements.shinyStatus.textContent = isShiny ? "ON" : "OFF";
  elements.shinyStatus.className = `status-dot ${isShiny ? "green" : "red"}`;

  elements.quickHeight.textContent = activePokemon.height;
  elements.quickWeight.textContent = activePokemon.weight;
  
  // Types badge display
  elements.pokemonTypes.innerHTML = "";
  activePokemon.types.forEach(t => {
    const badge = document.createElement("span");
    badge.className = `type-badge ${t}`;
    badge.textContent = t.toUpperCase();
    elements.pokemonTypes.appendChild(badge);
  });

  // Tab 1: INFO
  elements.pokemonCategory.textContent = activePokemon.category;
  elements.pokemonDesc.textContent = activePokemon.desc;

  // Tab 2: STATS
  const stats = activePokemon.stats;
  const statIds = ["hp", "atk", "def", "satk", "sdef", "spd"];
  statIds.forEach(id => {
    const fillEl = document.querySelector(`.stat-bar-fill.${id}`);
    const numEl = document.getElementById(`stat-${id}`);
    if (fillEl && numEl) {
      const val = stats[id];
      numEl.textContent = val;
      const percentage = Math.min((val / 160) * 100, 100);
      fillEl.style.width = `${percentage}%`;
    }
  });

  // Tab 3: AREA (MAP)
  elements.habitatName.textContent = activePokemon.habitat.toUpperCase();
  if (activePokemon.mapPos) {
    elements.mapMarker.style.display = "block";
    elements.mapMarker.style.top = activePokemon.mapPos.top;
    elements.mapMarker.style.left = activePokemon.mapPos.left;
  } else {
    elements.mapMarker.style.display = "none";
  }

  // Tab 4: SIZE
  elements.sizeComparisonSprite.style.backgroundImage = `url('${isShiny ? activePokemon.spriteShiny : activePokemon.sprite}')`;
  elements.sizeComparisonSprite.style.height = `${activePokemon.sizeScale}px`;
  elements.sizeComparisonSprite.style.width = `${activePokemon.sizeScale}px`;
  elements.sizePokemonLabel.textContent = `${activePokemon.height} (${activePokemon.name})`;

  // Tab 5: EVOLUTION
  const evo = activePokemon.evo;
  if (evo && evo.length >= 3) {
    elements.evoStages.forEach(stg => stg.style.display = "flex");
    document.querySelectorAll(".evo-arrow").forEach(arr => arr.style.display = "block");

    elements.evoStage1.src = evo[0].sprite;
    elements.evoLevels[0].textContent = evo[0].lvl;
    
    elements.evoStage2.src = evo[1].sprite;
    elements.evoLevels[1].textContent = evo[1].lvl;

    elements.evoStage3.src = evo[2].sprite;
    elements.evoLevels[2].textContent = evo[2].lvl;

    elements.evoStages.forEach((el, index) => {
      const stageName = evo[index].name.toLowerCase();
      const currName = activePokemon.name.toLowerCase();
      if (currName.includes(stageName) || stageName.includes(currName)) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  } else if (evo && evo.length === 2) {
    elements.evoStages[0].style.display = "flex";
    elements.evoStages[1].style.display = "none";
    elements.evoStages[2].style.display = "flex";
    
    document.querySelectorAll(".evo-arrow")[0].style.display = "block";
    document.querySelectorAll(".evo-arrow")[1].style.display = "none";

    elements.evoStage1.src = evo[0].sprite;
    elements.evoLevels[0].textContent = evo[0].lvl;

    elements.evoStage3.src = evo[1].sprite;
    elements.evoLevels[2].textContent = evo[1].lvl;

    elements.evoStages[0].classList.remove("active");
    elements.evoStages[2].classList.add("active");
  } else if (evo && evo.length === 1) {
    elements.evoStages[0].style.display = "none";
    elements.evoStages[1].style.display = "none";
    elements.evoStages[2].style.display = "flex";
    
    document.querySelectorAll(".evo-arrow")[0].style.display = "none";
    document.querySelectorAll(".evo-arrow")[1].style.display = "none";

    elements.evoStage3.src = evo[0].sprite;
    elements.evoLevels[2].textContent = evo[0].lvl;

    elements.evoStages[2].classList.add("active");
  }

  flashLed("yellow", 200);
  triggerPokemonCry();
}

// FORMAT HELPERS FOR POKEAPI DATA
function formatHeight(decimeters) {
  const meters = decimeters / 10;
  const totalInches = Math.round(meters * 39.37);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${meters}m (${feet}' ${String(inches).padStart(2, '0')}")`;
}

function formatWeight(hectograms) {
  const kg = hectograms / 10;
  const lbs = Math.round(kg * 2.20462 * 10) / 10;
  return `${kg}kg (${lbs} lbs)`;
}

function getCoordinatesByHabitat(habitat) {
  const positions = {
    "GRASSLAND": { top: "55%", left: "28%" },
    "VOLCANO": { top: "35%", left: "42%" },
    "CRATER": { top: "38%", left: "45%" },
    "OCEAN": { top: "80%", left: "70%" },
    "FOREST": { top: "25%", left: "15%" },
    "MOUNTAIN": { top: "30%", left: "55%" },
    "ROUGH-TERRAIN": { top: "45%", left: "60%" },
    "CAVE": { top: "40%", left: "25%" },
    "SEA": { top: "75%", left: "80%" },
    "URBAN": { top: "20%", left: "40%" },
    "RYME CITY": { top: "25%", left: "30%" }
  };
  return positions[habitat] || { top: "50%", left: "50%" };
}

// DYNAMIC LAZY LOAD DETAILS FROM POKEAPI
async function loadSelectedPokemon(pokemonItem) {
  const cacheKey = pokemonItem.apiName;
  if (pokemonCache.has(cacheKey)) {
    activePokemon = pokemonCache.get(cacheKey);
    renderActivePokemonDetails();
    return;
  }

  // Show Loading Screen
  elements.screenLoading.classList.remove("hidden");
  
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonItem.apiName}`);
    if (!res.ok) throw new Error("Pokemon detail fetch failed");
    const data = await res.json();

    let desc = "NO DATABASE ENTRY DESCRIPTION AVAILABLE FOR THIS POKÉMON.";
    let category = "UNKNOWN POKÉMON";
    let habitat = "GRASSLAND";
    let evoChainUrl = "";

    try {
      const speciesRes = await fetch(data.species.url);
      if (speciesRes.ok) {
        const speciesData = await speciesRes.json();
        
        // Find English flavor text entry
        const enFlavor = speciesData.flavor_text_entries.find(entry => entry.language.name === "en");
        if (enFlavor) {
          desc = enFlavor.flavor_text.replace(/\f/g, " ").replace(/\n/g, " ").toUpperCase();
        }

        // Find English genus (category)
        const enGenus = speciesData.genera.find(g => g.language.name === "en");
        if (enGenus) {
          category = enGenus.genus.toUpperCase();
        }

        if (speciesData.habitat) {
          habitat = speciesData.habitat.name.toUpperCase();
        }
        
        evoChainUrl = speciesData.evolution_chain.url;
      }
    } catch (spErr) {
      console.warn("Could not load species description details: ", spErr);
    }

    // Fetch Evolution Chain details
    let evoList = [];
    if (evoChainUrl) {
      try {
        const evoRes = await fetch(evoChainUrl);
        if (evoRes.ok) {
          const evoData = await evoRes.json();
          
          let chain = evoData.chain;
          while (chain) {
            const speciesName = chain.species.name;
            const spMatch = chain.species.url.match(/\/pokemon-species\/(\d+)\//);
            const spId = spMatch ? spMatch[1] : "1";
            
            let lvlText = "FINAL";
            if (chain.evolution_details && chain.evolution_details.length > 0) {
              const details = chain.evolution_details[0];
              if (details.min_level) {
                lvlText = `LV ${details.min_level}`;
              } else if (details.trigger) {
                lvlText = details.trigger.name.toUpperCase().replace(/-/g, " ");
              }
            }
            
            evoList.push({
              name: speciesName.toUpperCase(),
              lvl: lvlText,
              sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spId}.png`
            });
            
            chain = chain.evolves_to[0];
          }
        }
      } catch (evoErr) {
        console.warn("Could not load evolution chain: ", evoErr);
      }
    }

    if (evoList.length === 0) {
      evoList = [
        { name: pokemonItem.name, lvl: "FINAL", sprite: data.sprites.front_default }
      ];
    }

    const pokemonDetails = {
      id: pokemonItem.id,
      realId: pokemonItem.realId,
      name: pokemonItem.name,
      category: category,
      types: data.types.map(t => t.type.name),
      height: formatHeight(data.height),
      weight: formatWeight(data.weight),
      desc: desc,
      stats: {
        hp: data.stats.find(s => s.stat.name === "hp").base_stat,
        atk: data.stats.find(s => s.stat.name === "attack").base_stat,
        def: data.stats.find(s => s.stat.name === "defense").base_stat,
        satk: data.stats.find(s => s.stat.name === "special-attack").base_stat,
        sdef: data.stats.find(s => s.stat.name === "special-defense").base_stat,
        spd: data.stats.find(s => s.stat.name === "speed").base_stat
      },
      // Use animated black-white sprite, fallback to static
      sprite: data.sprites.versions["generation-v"]["black-white"].animated.front_default || data.sprites.front_default || "",
      spriteShiny: data.sprites.versions["generation-v"]["black-white"].animated.front_shiny || data.sprites.front_shiny || data.sprites.front_default || "",
      habitat: habitat,
      mapPos: getCoordinatesByHabitat(habitat),
      sizeScale: Math.max(Math.min(data.height * 8, 120), 20),
      evo: evoList,
      cry: data.cries ? (data.cries.legacy || data.cries.latest) : `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${pokemonItem.realId}.ogg`
    };

    // Store in cache
    pokemonCache.set(cacheKey, pokemonDetails);
    activePokemon = pokemonDetails;

    renderActivePokemonDetails();

  } catch (err) {
    console.error("Error loading pokemon details: ", err);
    elements.screenLoading.classList.add("hidden");
    elements.pokemonName.textContent = "CONN. ERROR";
    elements.pokemonDesc.textContent = "FAILED TO CONNECT TO POKEAPI. PLEASE CHECK YOUR CONNECTION AND TRY AGAIN.";
  } finally {
    elements.screenLoading.classList.add("hidden");
  }
}

// FETCH FULL POKEMON LIST (NAMES & IDS)
async function fetchAllPokemonList() {
  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
    if (!res.ok) throw new Error("Failed to fetch national dex");
    const data = await res.json();
    allPokemonList = data.results.map((p, idx) => {
      const match = p.url.match(/\/pokemon\/(\d+)\//);
      const parsedId = match ? parseInt(match[1]) : (idx + 1);
      
      const displayName = p.name.toUpperCase().replace(/-/g, " ");
      const formattedId = `No. ${String(parsedId).padStart(3, '0')}`;
      return {
        id: formattedId,
        realId: parsedId,
        name: displayName,
        apiName: p.name,
        url: p.url
      };
    });
  } catch (e) {
    console.error("Failed to fetch Pokemon list: ", e);
    // Fallback to offline starter database
    allPokemonList = STANDARD_MODE_DATA.map(p => ({
      id: p.id,
      realId: parseInt(p.id.replace("No. ", "")),
      name: p.name,
      apiName: p.name.toLowerCase(),
      url: `https://pokeapi.co/api/v2/pokemon/${p.id.replace("No. ", "")}`
    }));
  }
}

function triggerPokemonCry() {
  if (!activePokemon || !isPowered) return;
  audioSystem.playCry(
    activePokemon.cry,
    () => {
      elements.speakerGrill.classList.add("animating");
      elements.mainLens.classList.add("pulse");
      elements.ledRed.classList.add("active");
    },
    () => {
      elements.speakerGrill.classList.remove("animating");
      elements.mainLens.classList.remove("pulse");
      elements.ledRed.classList.remove("active");
    }
  );
}

// LED UTIL FUNCTION
function flashLed(color, duration = 300) {
  const led = color === "red" ? elements.ledRed : (color === "yellow" ? elements.ledYellow : elements.ledGreen);
  led.classList.add("active");
  setTimeout(() => {
    if (color !== "red") {
      led.classList.remove("active");
    }
  }, duration);
}

// MODAL LOGIC & RENDERING
function toggleModal(open = null) {
  if (!isPowered) return;
  
  const shouldOpen = open !== null ? open : !elements.modal.classList.contains("active");
  
  if (shouldOpen) {
    elements.modal.classList.add("active");
    elements.modal.classList.remove("hidden");
    audioSystem.playModalOpen();
    renderModalContent();
    
    // LEDs visual alert on scan
    elements.modalLedYellow.classList.add("active");
    setTimeout(() => {
      elements.modalLedGreen.classList.add("active");
    }, 150);
  } else {
    elements.modal.classList.remove("active");
    setTimeout(() => {
      elements.modal.classList.add("hidden");
    }, 300);
    audioSystem.playModalClose();
    
    elements.modalLedYellow.classList.remove("active");
    elements.modalLedGreen.classList.remove("active");
  }
}

function getStatColor(statId) {
  const colors = {
    hp: "#ff5959",
    atk: "#f5ac78",
    def: "#fae078",
    satk: "#9db7f5",
    sdef: "#a7db8d",
    spd: "#fa92b2"
  };
  return colors[statId] || "#3b82f6";
}

function getStatsTacticalReadout(name, stats, bst) {
  const highestStat = Object.entries(stats).reduce((a, b) => a[1] > b[1] ? a : b);
  const labels = { hp: "Hit Points", atk: "Physical Attack", def: "Defense", satk: "Special Attack", sdef: "Special Defense", spd: "Speed" };
  const highestLabel = labels[highestStat[0]];
  
  let description = `${name} has a Base Stat Total of ${bst}. `;
  if (highestStat[0] === 'satk') {
    description += `It is exceptionally proficient in Special Attacks. Use special shields or type-resistant blocks to mitigate its power.`;
  } else if (highestStat[0] === 'atk') {
    description += `It features devastating Physical Attack power. Avoid direct impact and counter with defense strategies.`;
  } else if (highestStat[0] === 'spd') {
    description += `It exhibits superb speed. It will likely take the initiative and act first in most combat scenarios.`;
  } else if (highestStat[0] === 'def' || highestStat[0] === 'sdef') {
    description += `It boasts strong defensive attributes, specifically in ${highestLabel}. Breaking through its guard requires targeted attacks.`;
  } else {
    description += `It is a versatile and balanced combatant, with its highest performance peak in ${highestLabel}.`;
  }
  return description;
}

function getSizeMultiplierText(heightStr) {
  const metersMatch = heightStr.match(/^([\d.]+)m/);
  let meters = 1.7;
  if (metersMatch) {
    meters = parseFloat(metersMatch[1]);
  } else {
    const ftInMatch = heightStr.match(/(\d+)'\s*(\d+)/);
    if (ftInMatch) {
      const feet = parseInt(ftInMatch[1]);
      const inches = parseInt(ftInMatch[2]);
      meters = ((feet * 12) + inches) * 0.0254;
    }
  }
  
  const ratio = meters / 1.5;
  if (ratio > 1.8) {
    return `a colossal giant, standing ${ratio.toFixed(1)}x taller than the trainer. It commands a massive physical presence.`;
  } else if (ratio > 1.2) {
    return `significantly larger, standing ${ratio.toFixed(1)}x taller than the trainer. Exercise caution in close quarters.`;
  } else if (ratio > 0.8) {
    return `roughly equal in size (${ratio.toFixed(1)}x trainer height). It exhibits a standard human-comparable scale.`;
  } else {
    return `relatively small, standing at only ${(ratio * 100).toFixed(0)}% of the trainer's height. It presents a highly compact target.`;
  }
}

function renderModalContent() {
  if (!activePokemon) return;
  
  const tab = currentTab.toLowerCase();
  const name = activePokemon.name;
  
  const titleMap = {
    info: `${name} - PROFILE DECRYPTION`,
    stats: `${name} - COMBAT CAPABILITY MATRIX`,
    area: `${name} - HABITAT TELEMETRY REPORT`,
    size: `${name} - BIOMETRIC HEIGHT REPORT`,
    evolution: `${name} - PHYLOGENETIC DATA SCAN`
  };
  
  elements.modalTitle.textContent = titleMap[tab] || `${name} - DATA SCAN`;
  
  let html = "";
  if (tab === "info") {
    html = `
      <div class="modal-info-layout">
        <div class="modal-info-top">
          <div class="modal-sprite-card">
            <img class="modal-sprite-img" src="${isShiny ? activePokemon.spriteShiny : activePokemon.sprite}" alt="${activePokemon.name}">
            <div class="modal-scanlines"></div>
          </div>
          <div class="modal-info-header">
            <span class="modal-pkmn-id">${activePokemon.id}</span>
            <h3 class="modal-pkmn-name">${activePokemon.name}</h3>
            <span class="modal-pkmn-category">${activePokemon.category}</span>
            <div class="modal-type-badges">
              ${activePokemon.types.map(t => `<span class="type-badge ${t}">${t.toUpperCase()}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="modal-metrics-row">
          <div class="modal-metric">
            <span class="modal-metric-label">HEIGHT</span>
            <span class="modal-metric-val">${activePokemon.height}</span>
          </div>
          <div class="modal-metric">
            <span class="modal-metric-label">WEIGHT</span>
            <span class="modal-metric-val">${activePokemon.weight}</span>
          </div>
          <div class="modal-metric">
            <span class="modal-metric-label">HABITAT</span>
            <span class="modal-metric-val">${activePokemon.habitat}</span>
          </div>
        </div>
        <div class="modal-desc-box">
          <p class="modal-desc-text">${activePokemon.desc}</p>
        </div>
      </div>
    `;
  } else if (tab === "stats") {
    const stats = activePokemon.stats;
    const bst = stats.hp + stats.atk + stats.def + stats.satk + stats.sdef + stats.spd;
    
    html = `
      <div class="modal-stats-layout">
        <div class="modal-stats-header">
          <span class="modal-stats-title">BASE STAT ANALYSIS</span>
          <span class="modal-stats-total">TOTAL BST: ${bst}</span>
        </div>
        ${Object.entries(stats).map(([statId, val]) => {
          const percentage = Math.min((val / 160) * 100, 100);
          const labels = { hp: "HP", atk: "ATTACK", def: "DEFENSE", satk: "SP. ATK", sdef: "SP. DEF", spd: "SPEED" };
          const label = labels[statId] || statId.toUpperCase();
          return `
            <div class="modal-stat-row">
              <span class="modal-stat-label">${label}</span>
              <div class="modal-stat-bar-bg">
                <div class="modal-stat-bar-fill" style="width: ${percentage}%; background-color: ${getStatColor(statId)}"></div>
              </div>
              <span class="modal-stat-val">${val}</span>
            </div>
          `;
        }).join('')}
        <div class="modal-stats-summary">
          <h4 class="modal-summary-title">TACTICAL EVALUATION</h4>
          <p class="modal-summary-text">${getStatsTacticalReadout(name, stats, bst)}</p>
        </div>
      </div>
    `;
  } else if (tab === "area") {
    html = `
      <div class="modal-area-layout">
        <div class="modal-map-frame">
          <div class="modal-map-grid"></div>
          <div class="modal-map-outline"></div>
          ${activePokemon.mapPos ? `<div class="modal-map-marker" style="top: ${activePokemon.mapPos.top}; left: ${activePokemon.mapPos.left};"></div>` : ''}
          <div class="modal-scanlines"></div>
        </div>
        <div class="modal-location-report">
          <div class="modal-report-row">
            <span class="modal-report-label">SECTOR REGION:</span>
            <span class="modal-report-val">HOENN MAP INDEX</span>
          </div>
          <div class="modal-report-row">
            <span class="modal-report-label">SECTOR NAME:</span>
            <span class="modal-report-val">${activePokemon.habitat}</span>
          </div>
          <div class="modal-report-row">
            <span class="modal-report-label">GPS RADAR:</span>
            <span class="modal-report-val">${activePokemon.mapPos ? `LAT ${activePokemon.mapPos.top} / LON ${activePokemon.mapPos.left}` : 'UNKNOWN COORDINATES'}</span>
          </div>
          <div class="modal-report-row">
            <span class="modal-report-label">SURVEY REPORT:</span>
            <span class="modal-report-val">Telemetric scans indicate localized habitat activity in ${activePokemon.habitat.toLowerCase()} biomes.</span>
          </div>
        </div>
      </div>
    `;
  } else if (tab === "size") {
    html = `
      <div class="modal-size-layout">
        <div class="modal-size-canvas">
          <div class="modal-size-silhouette modal-trainer-silhouette"></div>
          <div class="modal-size-silhouette modal-pokemon-silhouette" style="background-image: url('${isShiny ? activePokemon.spriteShiny : activePokemon.sprite}'); width: ${activePokemon.sizeScale * 1.4}px; height: ${activePokemon.sizeScale * 1.4}px;"></div>
          <div class="modal-scanlines"></div>
        </div>
        <div class="modal-size-report">
          <div class="modal-size-summary">
            ${activePokemon.name} stands at ${activePokemon.height} and weighs ${activePokemon.weight}.<br><br>
            Compared to an average human trainer (1.5m / 4'11"), it is ${getSizeMultiplierText(activePokemon.height)}
          </div>
        </div>
      </div>
    `;
  } else if (tab === "evolution") {
    html = `
      <div class="modal-evo-layout">
        <div class="modal-evo-flow">
          ${activePokemon.evo.map((stg, index) => {
            const isActive = activePokemon.name.toLowerCase().includes(stg.name.toLowerCase()) || stg.name.toLowerCase().includes(activePokemon.name.toLowerCase());
            return `
              ${index > 0 ? '<span class="modal-evo-arrow">➔</span>' : ''}
              <div class="modal-evo-stage ${isActive ? 'active' : ''}">
                <img class="modal-evo-sprite" src="${stg.sprite}" alt="${stg.name}">
                <span class="modal-evo-name">${stg.name}</span>
                <span class="modal-evo-lvl">${stg.lvl}</span>
              </div>
            `;
          }).join('')}
        </div>
        <div class="modal-evo-details">
          <p>
            <strong>GENETIC RECORD:</strong> Evolutionary line: ${activePokemon.evo.map(e => e.name).join(' ➔ ')}. 
            ${activePokemon.evo.length > 1 ? `Evolution milestones trigger at: ${activePokemon.evo[activePokemon.evo.length - 1].lvl}.` : 'This species represents a terminal evolution or has no other developmental branches.'}
          </p>
        </div>
      </div>
    `;
  }
  
  elements.modalContent.innerHTML = html;
}

// TABS LOGIC
function switchTab(tabId) {
  if (!isPowered) return;
  currentTab = tabId;

  // Update tab buttons
  elements.tabButtons.forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Toggle content screens
  const contents = document.querySelectorAll(".tab-content");
  contents.forEach(content => {
    if (content.id === `tab-content-${tabId}`) {
      content.classList.remove("hidden");
      content.classList.add("active");
    } else {
      content.classList.add("hidden");
      content.classList.remove("active");
    }
  });

  flashLed("green", 150);
  audioSystem.playBeep(900, 0.06);

  if (tabId === "stats" && activePokemon) {
    // Stats grow animation trigger
    const stats = activePokemon.stats;
    const statIds = ["hp", "atk", "def", "satk", "sdef", "spd"];
    statIds.forEach(id => {
      const fillEl = document.querySelector(`.stat-bar-fill.${id}`);
      if (fillEl) {
        fillEl.style.width = "0%";
        setTimeout(() => {
          const percentage = Math.min((stats[id] / 160) * 100, 100);
          fillEl.style.width = `${percentage}%`;
        }, 50);
      }
    });
  }
}

// DEVICE POWER TOGGLE
function togglePower() {
  isPowered = !isPowered;
  audioSystem.init();

  if (isPowered) {
    elements.btnPower.style.transform = "scale(0.95)";
    elements.powerLed.classList.add("powered");
    elements.mainScreen.classList.remove("screen-off");
    elements.bootOverlay.classList.remove("hidden");
    
    elements.ledRed.classList.add("active");
    setTimeout(() => elements.ledYellow.classList.add("active"), 150);
    setTimeout(() => elements.ledGreen.classList.add("active"), 300);

    audioSystem.playBoot();

    setTimeout(() => {
      elements.bootOverlay.classList.add("hidden");
      elements.ledYellow.classList.remove("active");
      elements.ledGreen.classList.remove("active");
      
      updateActivePokemon();
    }, 1800);

  } else {
    elements.btnPower.style.transform = "none";
    elements.powerLed.classList.remove("powered");
    elements.mainScreen.classList.add("screen-off");
    elements.bootOverlay.classList.add("hidden");
    elements.screenLoading.classList.add("hidden");
    
    if (elements.modal.classList.contains("active")) {
      toggleModal(false);
    }
    
    elements.ledRed.classList.add("active");
    elements.ledYellow.classList.remove("active");
    elements.ledGreen.classList.remove("active");
    elements.mainLens.classList.remove("pulse");
    elements.speakerGrill.classList.remove("animating");

    audioSystem.playBeep(400, 0.15, 'sawtooth');
  }
}

// FLIP LID OPEN / CLOSE
function toggleLid() {
  isPokedexClosed = !isPokedexClosed;
  audioSystem.playBeep(350, 0.1, 'triangle');
  
  if (isPokedexClosed) {
    elements.pokedex.classList.add("pokedex-closed");
    if (isPowered) {
      togglePower();
    }
  } else {
    elements.pokedex.classList.remove("pokedex-closed");
    setTimeout(() => {
      if (!isPowered) {
        togglePower();
      }
    }, 400);
  }
}

// ATTACH EVENT LISTENERS
function setupEventListeners() {
  // Modal background close
  elements.modal.addEventListener("click", (e) => {
    if (e.target === elements.modal) {
      toggleModal(false);
    }
  });

  // Modal close button
  elements.modalCloseBtn.addEventListener("click", () => {
    toggleModal(false);
  });

  elements.btnPower.addEventListener("click", () => {
    if (isPokedexClosed) return;
    togglePower();
  });

  elements.btnStart.addEventListener("click", () => {
    toggleLid();
  });

  elements.btnSelect.addEventListener("click", () => {
    if (!isPowered) return;
    toggleModal();
    flashLed("yellow", 400);
    flashLed("green", 400);
    elements.mainLens.classList.add("pulse");
    setTimeout(() => elements.mainLens.classList.remove("pulse"), 500);
  });

  elements.btnCry.addEventListener("click", () => {
    if (!isPowered) return;
    audioSystem.playBeep(1100, 0.05);
    setTimeout(() => triggerPokemonCry(), 50);
  });

  elements.btnShiny.addEventListener("click", () => {
    if (!isPowered) return;
    if (elements.modal.classList.contains("active")) {
      toggleModal(false);
      return;
    }
    isShiny = !isShiny;
    audioSystem.playBeep(950, 0.08, 'sawtooth');
    updateActivePokemon();
    flashLed("yellow", 200);
  });

  // D-pad Navigation
  document.getElementById("dpad-up").addEventListener("click", () => {
    if (!isPowered) return;
    audioSystem.playBeep(700, 0.04);
    selectedIndex--;
    updateActivePokemon();
  });

  document.getElementById("dpad-down").addEventListener("click", () => {
    if (!isPowered) return;
    audioSystem.playBeep(700, 0.04);
    selectedIndex++;
    updateActivePokemon();
  });

  document.getElementById("dpad-left").addEventListener("click", () => {
    if (!isPowered) return;
    const tabs = ["info", "stats", "area", "size", "evolution"];
    let tabIndex = tabs.indexOf(currentTab) - 1;
    if (tabIndex < 0) tabIndex = tabs.length - 1;
    switchTab(tabs[tabIndex]);
  });

  document.getElementById("dpad-right").addEventListener("click", () => {
    if (!isPowered) return;
    const tabs = ["info", "stats", "area", "size", "evolution"];
    let tabIndex = tabs.indexOf(currentTab) + 1;
    if (tabIndex >= tabs.length) tabIndex = 0;
    switchTab(tabs[tabIndex]);
  });

  elements.searchInput.addEventListener("input", (e) => {
    renderPokedexList(e.target.value);
  });

  // Charizard Mode Toggle Switch
  elements.charizardToggle.addEventListener("change", async (e) => {
    audioSystem.playBeep(600, 0.08, 'triangle');
    const listTitle = document.querySelector(".list-title");
    if (e.target.checked) {
      pokedexDatabase = CHARIZARD_MODE_DATA;
      if (listTitle) listTitle.textContent = "CHARIZARD INDEX";
    } else {
      if (allPokemonList.length === 0) {
        await fetchAllPokemonList();
      }
      pokedexDatabase = allPokemonList;
      if (listTitle) listTitle.textContent = "POKÉDEX INDEX";
    }
    selectedIndex = 0;
    renderPokedexList();
    if (isPowered) {
      updateActivePokemon();
    }
  });

  elements.tabButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const tab = e.target.dataset.tab;
      switchTab(tab);
    });
  });

  // Keyboard navigation shortcuts
  window.addEventListener("keydown", (e) => {
    if (isPokedexClosed && e.key !== "Enter") return;

    if (!elements.modal.classList.contains("hidden")) {
      if (e.key === "Escape" || e.key === "s" || e.key === "S" || e.key === "Enter") {
        e.preventDefault();
        toggleModal(false);
        return;
      }
    }

    if (!isPowered) {
      if (e.key === "p" || e.key === "P") togglePower();
      if (e.key === "Enter") toggleLid();
      return;
    }

    switch(e.key) {
      case "ArrowUp":
        e.preventDefault();
        document.getElementById("dpad-up").click();
        break;
      case "ArrowDown":
        e.preventDefault();
        document.getElementById("dpad-down").click();
        break;
      case "ArrowLeft":
        e.preventDefault();
        document.getElementById("dpad-left").click();
        break;
      case "ArrowRight":
        e.preventDefault();
        document.getElementById("dpad-right").click();
        break;
      case "c":
      case "C":
        elements.btnCry.click();
        break;
      case "s":
      case "S":
        elements.btnShiny.click();
        break;
      case "Enter":
        toggleLid();
        break;
      case "Escape":
        togglePower();
        break;
    }
  });
}

// INITIAL BOOTSTRAP
async function init() {
  pokedexDatabase = CHARIZARD_MODE_DATA;
  selectedIndex = 0;
  
  elements.pokedex.classList.add("pokedex-closed");
  isPokedexClosed = true;

  renderPokedexList();
  setupEventListeners();

  // Load PokéAPI complete list in the background asynchronously
  fetchAllPokemonList();

  setTimeout(() => {
    toggleLid();
  }, 1000);
}

window.addEventListener("DOMContentLoaded", init);

