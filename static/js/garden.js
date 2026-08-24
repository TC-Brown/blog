// Comprehensive Plant Data Object with 7 Key Growing Specs + Sowing Tips
const plantData = {
  forgetmenot: {
    name: "Forget-Me-Not",
    latin: "Myosotis sylvatica",
    img: "https://images.immediate.co.uk/production/volatile/sites/10/2018/10/2048x1365-Myosotis-Grow-Guide-LI3098493-0ec3f0a.jpg?resize=768,512",
    specs: {
      light: { label: "Light", val: "Partial Shade to Full Sun", icon: "☀️" },
      water: { label: "Water", val: "High (keep consistently moist)", icon: "💧" },
      soil: { label: "Soil", val: "Rich, moist organic soil (pH 6.0 - 7.0)", icon: "🪴" },
      nutrients: { label: "Nutrients", val: "Monthly compost or mild liquid feed", icon: "🧪" },
      temps: { label: "Temps", val: "55°F - 70°F (Cool weather plant)", icon: "🌡️" },
      space: { label: "Space", val: "9\" - 12\" apart", icon: "📐" },
      time: { label: "Time", val: "10-14d germ | 80-90d bloom", icon: "⏱️" }
    },
    sowing: [
      "<strong>METHOD:</strong> Sow seeds outdoors in late summer or early fall for spring bloom.",
      "<strong>DEPTH:</strong> Lightly cover seeds with 1/8\" fine compost or fine soil mix.",
      "<strong>PROPAGATION:</strong> Readily self-sows; root clumps divide easily in early spring."
    ]
  },
  marigold: {
    name: "Marigold",
    latin: "Tagetes erecta",
    img: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Tagetes_erecta_chendumalli_chedi.jpg",
    specs: {
      light: { label: "Light", val: "Full Sun (6-8 hrs daily)", icon: "☀️" },
      water: { label: "Water", val: "Low-Moderate (dry topsoil)", icon: "💧" },
      soil: { label: "Soil", val: "Well-draining garden soil (pH 6.0 - 7.5)", icon: "🪴" },
      nutrients: { label: "Nutrients", val: "Low nitrogen, high phosphorus feed", icon: "🧪" },
      temps: { label: "Temps", val: "65°F - 85°F (Frost sensitive)", icon: "🌡️" },
      space: { label: "Space", val: "10\" - 18\" apart", icon: "📐" },
      time: { label: "Time", val: "5-7d germ | 45-60d bloom", icon: "⏱️" }
    },
    sowing: [
      "<strong>METHOD:</strong> Direct sow after last frost or start indoors 4-6 weeks early.",
      "<strong>DEPTH:</strong> Plant seeds 1/4\" deep in moist, well-aerated seed starter mix.",
      "<strong>MAINTENANCE:</strong> Deadhead spent flowers regularly to extend continuous bloom."
    ]
  },
  geranium: {
    name: "Geranium",
    latin: "Pelargonium × hortorum",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7ugP9Wp2vNL_egpkQQUbvqDgz28GkAGX8nLgeWKgXKg&s=10",
    specs: {
      light: { label: "Light", val: "Full Sun to Part Shade (4-6h+)", icon: "☀️" },
      water: { label: "Water", val: "Moderate (dry slightly between)", icon: "💧" },
      soil: { label: "Soil", val: "Well-draining peat mix (pH 6.0 - 6.5)", icon: "🪴" },
      nutrients: { label: "Nutrients", val: "Liquid 20-20-20 feed every 2 wks", icon: "🧪" },
      temps: { label: "Temps", val: "65°F - 75°F (Protect from frost)", icon: "🌡️" },
      space: { label: "Space", val: "12\" - 15\" apart", icon: "📐" },
      time: { label: "Time", val: "12-15d germ | 90-110d bloom", icon: "⏱️" }
    },
    sowing: [
      "<strong>METHOD:</strong> Start indoors 12 weeks early or propagate via stem cuttings.",
      "<strong>DEPTH:</strong> Press seeds 1/8\" deep; maintain humidity and consistent warmth.",
      "<strong>ROOTING:</strong> Stem cuttings root easily in moist perlite/peat within 2-3 weeks."
    ]
  },
  petunia: {
    name: "Petunia",
    latin: "Petunia × atkinsiana",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwkT5VDIEM34ru8Xn3pFyCYejcHfKt_BhEyADhoNxMO-n9ItBNq-SO8d1-jSFCKGbuzQPkNmDPQkGKf2UnMUl2m0eTvAxjwRxJYSAzHyI&s=10",
    specs: {
      light: { label: "Light", val: "Full Sun (6+ hrs daily)", icon: "☀️" },
      water: { label: "Water", val: "Moderate (1-2x/wk, drained)", icon: "💧" },
      soil: { label: "Soil", val: "Light, well-draining soil (pH 6.0 - 7.0)", icon: "🪴" },
      nutrients: { label: "Nutrients", val: "High-potassium liquid feed bi-weekly", icon: "🧪" },
      temps: { label: "Temps", val: "60°F - 75°F (Tender annual)", icon: "🌡️" },
      space: { label: "Space", val: "12\" - 18\" apart", icon: "📐" },
      time: { label: "Time", val: "7-14d germ | 70-85d bloom", icon: "⏱️" }
    },
    sowing: [
      "<strong>METHOD:</strong> Start tiny seeds indoors 8-10 weeks prior to last spring frost.",
      "<strong>DEPTH:</strong> Surface sow; press lightly onto moist soil without covering.",
      "<strong>LIGHT:</strong> Requires direct bright ambient light and warmth (70-75°F) to sprout."
    ]
  },
  cosmos: {
    name: "Cosmos",
    latin: "Cosmos bipinnatus",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnF2av_LgehgGeZrdiLaoPtlMEdIE5xebOTBEPhz8uCcC3WnZPrgsPwJUgCuPcEXHnKzgZm-rkRhvzXYO8ouAcYaUsKK5aicXw9sIQxf6smw&s=10",
    specs: {
      light: { label: "Light", val: "Full Sun (6-8 hrs daily)", icon: "☀️" },
      water: { label: "Water", val: "Low (drought tolerant)", icon: "💧" },
      soil: { label: "Soil", val: "Average to poor light soil (pH 6.0 - 8.0)", icon: "🪴" },
      nutrients: { label: "Nutrients", val: "Minimal fertilizer (excess N delays bloom)", icon: "🧪" },
      temps: { label: "Temps", val: "65°F - 85°F (Heat & drought tough)", icon: "🌡️" },
      space: { label: "Space", val: "12\" - 18\" apart", icon: "📐" },
      time: { label: "Time", val: "7-10d germ | 50-60d bloom", icon: "⏱️" }
    },
    sowing: [
      "<strong>METHOD:</strong> Direct sow outdoors after frost risk or start 4 weeks early.",
      "<strong>DEPTH:</strong> Cover seeds with 1/4\" soil; keep warm and evenly moist.",
      "<strong>PINCHING:</strong> Pinch tips at 12-18\" tall to encourage bushier multi-stem flowers."
    ]
  },
  sunflower: {
    name: "Sunflower",
    latin: "Helianthus annuus",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT31GdSL15-59kh-o1ek6rsGFB1IrBRZniMEtNcltWehQ&s=10",
    specs: {
      light: { label: "Light", val: "Direct Full Sun (6-8+ hrs)", icon: "☀️" },
      water: { label: "Water", val: "Moderate (deep 1\"/wk watering)", icon: "💧" },
      soil: { label: "Soil", val: "Deep, loose, fertile soil (pH 6.0 - 7.5)", icon: "🪴" },
      nutrients: { label: "Nutrients", val: "Heavy feeder; N early, P-K later", icon: "🧪" },
      temps: { label: "Temps", val: "70°F - 85°F (Warm season annual)", icon: "🌡️" },
      space: { label: "Space", val: "18\" - 24\" apart", icon: "📐" },
      time: { label: "Time", val: "7-10d germ | 80-100d bloom", icon: "⏱️" }
    },
    sowing: [
      "<strong>METHOD:</strong> Direct sow seeds directly into warm garden beds after spring frost.",
      "<strong>DEPTH:</strong> Sow 1\" deep in clusters of 2-3 seeds; thin to strongest seedling.",
      "<strong>SUPPORT:</strong> Provide sturdy staking for giant varieties in windy locations."
    ]
  },
  morningGlory: {
    name: "Morning Glory",
    latin: "Ipomoea purpurea",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Ipomoea_tricolor-1.jpg/250px-Ipomoea_tricolor-1.jpg",
    specs: {
      light: { label: "Light", val: "Full Sun (6+ hrs daily)", icon: "☀️" },
      water: { label: "Water", val: "Moderate (regular well-drained)", icon: "💧" },
      soil: { label: "Soil", val: "Moist average garden soil (pH 6.0 - 7.5)", icon: "🪴" },
      nutrients: { label: "Nutrients", val: "Low fertilizer (high N reduces blooms)", icon: "🧪" },
      temps: { label: "Temps", val: "65°F - 85°F (Fast warm climber)", icon: "🌡️" },
      space: { label: "Space", val: "12\" - 15\" apart (Trellis)", icon: "📐" },
      time: { label: "Time", val: "5-10d germ | 60-75d bloom", icon: "⏱️" }
    },
    sowing: [
      "<strong>METHOD:</strong> Direct sow after late spring warming or start indoors 4 weeks early.",
      "<strong>SEED PREP:</strong> Nick seed coat with a file & soak in warm water for 24 hours.",
      "<strong>TRAINING:</strong> Erect vertical string or trellis support immediately upon sprouting."
    ]
  },
  myrtle: {
    name: "Myrtle Tree",
    latin: "Lagerstroemia indica",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSC2tnI5FJm1sNRaKiahrxe1UUqjiyGmtOJTd-xXQi90Q&s=10",
    specs: {
      light: { label: "Light", val: "Full Sun (6+ hrs for blooms)", icon: "☀️" },
      water: { label: "Water", val: "Moderate to Low (drought tough)", icon: "💧" },
      soil: { label: "Soil", val: "Adaptable, well-draining (pH 5.0 - 6.5)", icon: "🪴" },
      nutrients: { label: "Nutrients", val: "Balanced slow-release feed in spring", icon: "🧪" },
      temps: { label: "Temps", val: "70°F - 90°F (USDA Zones 6-10)", icon: "🌡️" },
      space: { label: "Space", val: "6 - 12 feet apart", icon: "📐" },
      time: { label: "Time", val: "30-90d germ | Perennial tree", icon: "⏱️" }
    },
    sowing: [
      "<strong>METHOD:</strong> Propagate via semi-hardwood summer cuttings or stratified seeds.",
      "<strong>PLANTING:</strong> Dig hole twice as wide as root ball; plant root crown level with soil.",
      "<strong>PRUNING:</strong> Prune dormant branches in late winter to boost spring bloom shoots."
    ]
  },
  tomato: {
    name: "Tomato",
    latin: "Solanum lycopersicum",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoxK33YRwG8dfCzFh99l3-FsRCnM6q0a8fRhWYn7FU3w&s=10",
    specs: {
      light: { label: "Light", val: "Full Sun (8+ hrs daily)", icon: "☀️" },
      water: { label: "Water", val: "High (1-2\"/wk consistent water)", icon: "💧" },
      soil: { label: "Soil", val: "Rich loamy soil with compost (pH 6.2-6.8)", icon: "🪴" },
      nutrients: { label: "Nutrients", val: "High Phosphorus & Calcium feed", icon: "🧪" },
      temps: { label: "Temps", val: "70°F - 85°F (Frost sensitive)", icon: "🌡️" },
      space: { label: "Space", val: "24\" - 36\" apart", icon: "📐" },
      time: { label: "Time", val: "6-10d germ | 65-85d harvest", icon: "⏱️" }
    },
    sowing: [
      "<strong>METHOD:</strong> Start seeds indoors 6-8 weeks before last spring frost date.",
      "<strong>DEPTH:</strong> Sow 1/4\" deep in trays; maintain 75-80°F bottom heat for fast germ.",
      "<strong>TRANSPLANT:</strong> Plant deep in garden soil (burying stem) to foster deep rooting."
    ]
  },
  cantaloupe: {
    name: "Cantaloupe",
    latin: "Cucumis melo",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOd10hsje03Qt0H2zmOLk_RJ5tCMs9fz76nopBYuPgcQ&s=10",
    specs: {
      light: { label: "Light", val: "Direct Full Sun (8+ hrs)", icon: "☀️" },
      water: { label: "Water", val: "High (1-2\"/wk; lower at harvest)", icon: "💧" },
      soil: { label: "Soil", val: "Warm sandy compost loam (pH 6.0-6.8)", icon: "🪴" },
      nutrients: { label: "Nutrients", val: "10-10-10 early; potassium when fruiting", icon: "🧪" },
      temps: { label: "Temps", val: "75°F - 95°F (Thrives in heat)", icon: "🌡️" },
      space: { label: "Space", val: "36\" - 48\" vine spacing", icon: "📐" },
      time: { label: "Time", val: "7-10d germ | 80-90d harvest", icon: "⏱️" }
    },
    sowing: [
      "<strong>METHOD:</strong> Direct sow into raised soil mounds or start in peat pots 3 weeks early.",
      "<strong>DEPTH:</strong> Plant 1/2\" - 1\" deep in hills of 4-6 seeds; thin to 3 strong vines.",
      "<strong>MULCHING:</strong> Apply mulch or straw to keep soil warm and keep melons off direct earth."
    ]
  },
  greenOnion: {
    name: "Green Onion",
    latin: "Allium fistulosum",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGlegUC_ntUQrp6R7excoZ9eN2wTOezSnFfH5MlBcO5Q&s=10",
    specs: {
      light: { label: "Light", val: "Full Sun to Part Shade (4-6h+)", icon: "☀️" },
      water: { label: "Water", val: "Moderate (keep evenly moist)", icon: "💧" },
      soil: { label: "Soil", val: "Loose fertile well-drained soil (pH 6.0-7.0)", icon: "🪴" },
      nutrients: { label: "Nutrients", val: "High-nitrogen liquid feed every 3-4 wks", icon: "🧪" },
      temps: { label: "Temps", val: "55°F - 75°F (Cool-hardy crop)", icon: "🌡️" },
      space: { label: "Space", val: "2\" - 4\" apart", icon: "📐" },
      time: { label: "Time", val: "7-14d germ | 50-60d harvest", icon: "⏱️" }
    },
    sowing: [
      "<strong>METHOD:</strong> Direct sow seeds outdoors, start indoors, or regrow root bottoms in water.",
      "<strong>DEPTH:</strong> Sow seeds 1/4\" deep in shallow furrows spaced 6\" apart.",
      "<strong>HARVEST:</strong> Snip green tops continuously or harvest full plant when pencil-thick."
    ]
  }
};

// Render plant grid dynamically with quick-glance spec chips
function renderPlantGrid() {
  const grid = document.getElementById('plantGrid');
  if (!grid) return;

  grid.innerHTML = Object.entries(plantData).map(([key, data]) => `
    <article class="plant-tile" onclick="selectPlant('${key}', this)">
      <img class="tile-img" src="${data.img}" alt="${data.name}">
      <h3 class="tile-title">${data.name}</h3>
      <p class="tile-latin">${data.latin}</p>
      
      <div class="card-specs-preview">
        <div class="spec-chip" title="Light: ${data.specs.light.val}">
          <span class="chip-icon">${data.specs.light.icon}</span>
          <span class="chip-text">${data.specs.light.val}</span>
        </div>
        <div class="spec-chip" title="Water: ${data.specs.water.val}">
          <span class="chip-icon">${data.specs.water.icon}</span>
          <span class="chip-text">${data.specs.water.val}</span>
        </div>
        <div class="spec-chip" title="Temps: ${data.specs.temps.val}">
          <span class="chip-icon">${data.specs.temps.icon}</span>
          <span class="chip-text">${data.specs.temps.val}</span>
        </div>
        <div class="spec-chip" title="Time: ${data.specs.time.val}">
          <span class="chip-icon">${data.specs.time.icon}</span>
          <span class="chip-text">${data.specs.time.val}</span>
        </div>
      </div>

      <button class="select-btn">SELECT</button>
    </article>
  `).join('');
}

// Handle plant selection and detail modal display
function selectPlant(key, element) {
  const tiles = document.querySelectorAll('.plant-tile');
  tiles.forEach(tile => tile.classList.remove('active'));

  if (element) {
    element.classList.add('active');
  }

  const data = plantData[key];
  if (!data) return;

  // Update Header Content
  document.getElementById('detailImg').src = data.img;
  document.getElementById('detailName').innerText = data.name;
  document.getElementById('detailLatin').innerText = data.latin;

  // Render 7 Care Metrics Specs Cards in Modal
  const specsGrid = document.getElementById('detailSpecsGrid');
  if (specsGrid) {
    specsGrid.innerHTML = Object.values(data.specs).map(spec => `
      <div class="spec-card">
        <div class="spec-card-icon">${spec.icon}</div>
        <div class="spec-card-content">
          <span class="spec-card-label">${spec.label}</span>
          <span class="spec-card-val">${spec.val}</span>
        </div>
      </div>
    `).join('');
  }

  // Update Sowing / Propagation Box
  const sowingBox = document.getElementById('sowingTipBox');
  if (sowingBox) {
    sowingBox.innerHTML = `<h3>🌱 Sowing / Propagation</h3>` + data.sowing.map(tip => `<p>${tip}</p>`).join('');
  }

  // Open Modal
  const modalOverlay = document.getElementById('plantModalOverlay');
  if (modalOverlay) {
    modalOverlay.classList.add('open');
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  renderPlantGrid();

  const modalOverlay = document.getElementById('plantModalOverlay');
  const closeBtn = document.getElementById('modalCloseBtn');
  const backBtn = document.getElementById('modalBackBtn');

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove('open');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backBtn) backBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
});
