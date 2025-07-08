let sinVal = [];
let cosVal = [];
let layers = [];
let startFrame = 0;
let centerX, centerY;
let currentCountry = "";
let combinedData = {};

// --- Mapping Deutsch → Englisch ---
const countryMapping = {
  "Deutschland": "Germany",
  "Frankreich": "France",
  "Spanien": "Spain",
  "Italien": "Italy",
  "Österreich": "Austria",
  "Schweiz": "Switzerland",
  "Niederlande": "Netherlands",
  "Belgien": "Belgium",
  "Polen": "Poland",
  "Tschechien": "Czechia",
  "Ungarn": "Hungary",
  "Slowakei": "Slovakia",
  "Slowenien": "Slovenia",
  "Kroatien": "Croatia",
  "Rumänien": "Romania",
  "Bulgarien": "Bulgaria",
  "Griechenland": "Greece",
  "Portugal": "Portugal",
  "Schweden": "Sweden",
  "Norwegen": "Norway",
  "Finnland": "Finland",
  "Dänemark": "Denmark",
  "Irland": "Ireland",
  "Vereinigtes Königreich": "United Kingdom",
  "Island": "Iceland",
  "Lettland": "Latvia",
  "Litauen": "Lithuania",
  "Estland": "Estonia",
  "Russland": "Russia",
  "Ukraine": "Ukraine",
  "Weißrussland": "Belarus",
  "Moldau": "Moldova",
  "Albanien": "Albania",
  "Bosnien und Herzegowina": "Bosnia and Herzegovina",
  "Montenegro": "Montenegro",
  "Serbien": "Serbia",
  "Nordmazedonien": "North Macedonia",
  "Türkei": "Turkey",
  "Georgien": "Georgia",
  "Armenien": "Armenia",
  "Aserbaidschan": "Azerbaijan",
  "Kasachstan": "Kazakhstan",
  "Zypern": "Cyprus",
  "Malta": "Malta",
  "Luxemburg": "Luxembourg",
  "Liechtenstein": "Liechtenstein",
  "Monaco": "Monaco",
  "San Marino": "San Marino",
  "Andorra": "Andorra",
  "Vatikan": "Vatican"
};

// --- Helpers ---
function getURLParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function combineCountryData() {
  console.log("Combining country data...");

  const safeAirData = typeof airData !== 'undefined' ? airData : {};
  const safeBiodiversityData = typeof biodiversityData !== 'undefined' ? biodiversityData : {};
  const safeCountryData = typeof countryData !== 'undefined' ? countryData : {};
  const safeRenewablesData = typeof renewablesData !== 'undefined' ? renewablesData : {};
  const safeWasteData = typeof wasteData !== 'undefined' ? wasteData : {};
  const safeWaterData = typeof waterData !== 'undefined' ? waterData : {};

  const allCountries = new Set([
    ...Object.keys(safeAirData),
    ...Object.keys(safeBiodiversityData),
    ...Object.keys(safeCountryData),
    ...Object.keys(safeRenewablesData),
    ...Object.keys(safeWasteData),
    ...Object.keys(safeWaterData)
  ]);

  allCountries.forEach(country => {
    combinedData[country] = {
      co2: safeCountryData[country]?.co2 || 5.0,
      air: safeAirData[country]?.air || 15.0,
      biodiversity: safeBiodiversityData[country]?.kba_pct || 50.0,
      renewables: safeRenewablesData[country] || 20.0,
      waste: safeWasteData[country]?.plasticWaste || 1.0,
      water: safeWaterData[country]?.water || 100.0,
      transparency: 50
    };
  });

  console.log("Combined data for", Object.keys(combinedData).length, "countries");
}

// --- p5.js ---
function setup() {
  combineCountryData();
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  background("#000000");
  centerX = width / 2;
  centerY = height / 2;
  noFill();

  for (let i = 0; i < 360; i++) {
    sinVal[i] = sin(i);
    cosVal[i] = cos(i);
  }

  const selectedCountry = getURLParameter('country') || 'Germany';
  initFlowerLayers(selectedCountry);
}

function initFlowerLayers(englishCountryName) {
  currentCountry = englishCountryName;

  if (!combinedData[englishCountryName]) {
    englishCountryName = 'Germany';
    currentCountry = 'Germany';
  }

  const data = combinedData[englishCountryName];

  // --- Green Score ---
  const normalizedValues = {
    co2: Math.min(data.co2 / 12, 1),                    // hoch = schlecht (angepasster Grenzwert)
    air: Math.min(data.air / 30, 1),                    // KORRIGIERT: hoch = schlecht für PM2.5
    water: Math.min(data.water / 800, 1),               // angepasster Grenzwert für Europa
    waste: Math.min(data.waste / 20, 1),                // hoch = schlecht (angepasst)
    biodiversity: 1 - Math.min(data.biodiversity / 100, 1), // hoch = gut
    renewables: 1 - Math.min(data.renewables / 100, 1),     // hoch = gut
    transparency: 1 - Math.min(data.transparency / 100, 1)  // hoch = gut
  };

  // Gewichtete Berechnung mit weniger Gewicht auf Wasserverbrauch für wasserreiche Länder
  const isWaterRich = ["Norway", "Finland", "Sweden", "Iceland"].includes(englishCountryName);
  const waterWeight = isWaterRich ? 0.5 : 1.0; // Reduzierte Gewichtung für wasserreiche Länder
  
  const greenScore = 1 - (
    normalizedValues.co2 +
    normalizedValues.air +                               // KORRIGIERT: nicht mehr invertiert
    (normalizedValues.water * waterWeight) +
    normalizedValues.waste +
    normalizedValues.biodiversity +
    normalizedValues.renewables +
    normalizedValues.transparency
  ) / (6 + waterWeight); // Angepasster Divisor

  const greenScorePercent = (greenScore * 100).toFixed(1);

  if (document.getElementById("country-name")) {
    document.getElementById("country-name").innerText = englishCountryName;
  }

  const badge = document.getElementById("green-score");
  if (badge) {
    badge.innerText = `${greenScorePercent}%`;
    badge.classList.remove("green", "medium", "low");
    if (greenScore >= 0.75) {
      badge.classList.add("green");
    } else if (greenScore >= 0.5) {
      badge.classList.add("medium");
    } else {
      badge.classList.add("low");
    }
  }

  console.log(`🌿 ${englishCountryName} → Green Score: ${greenScorePercent}%`);

  // --- Layers ---
  let rawLayers = [
    { label: `CO₂: ${data.co2}t`, intensity: normalizedValues.co2, color: color(255, 0, 0, 120) },
    { label: `Air: ${data.air}`, intensity: normalizedValues.air, color: color(255, 255, 0, 120) }, // KORRIGIERT
    { label: `Water: ${data.water} L`, intensity: normalizedValues.water, color: color(0, 150, 255, 120) },
    { label: `Waste: ${data.waste} kg`, intensity: normalizedValues.waste, color: color(255, 165, 0, 120) },
    { label: `Biodiversity: ${data.biodiversity.toFixed(1)}%`, intensity: normalizedValues.biodiversity, color: color(180, 0, 255, 120) },
    { label: `Renewables: ${data.renewables.toFixed(1)}%`, intensity: normalizedValues.renewables, color: color(0, 200, 100, 120) },
    { label: `Transparency: ${data.transparency}`, intensity: normalizedValues.transparency, color: color(255, 255, 255, 80) }
  ];

  rawLayers.sort((a, b) => b.intensity - a.intensity);

  layers = rawLayers.map((l, i) => {
    const radiusMultiplier = 1 + (l.intensity * 2.5);
    const targetRadius = 200 * radiusMultiplier;
    return {
      label: l.label,
      color: l.color,
      intensity: l.intensity,
      baseRadius: targetRadius,
      noiseMax: 1.0 + (l.intensity * 3.0),
      rotateSpeed: 0.05 * (i % 2 === 0 ? 1 : -1),
      growth: 0,
      targetGrowth: targetRadius,
      delay: i * 40
    };
  });

  startFrame = frameCount;
}

// --- Main Loop ---
function draw() {
  background("#000000");
  translate(centerX, centerY);
  drawBlendedLayers();
  drawTooltip();
}

function drawBlendedLayers() {
  if (layers[0] && layers[0].growth < layers[0].targetGrowth) {
    layers[0].growth += 4.0;
  }

  for (let i = 0; i < layers.length - 1; i++) {
    let l1 = layers[i];
    let l2 = layers[i + 1];
    if (frameCount - startFrame > l2.delay) {
      if (l2.growth < l2.targetGrowth) l2.growth += 3.0;
    }

    for (let j = 0; j <= 8; j++) {
      let t = j / 8;
      let interpolatedLayer = {
        growth: lerp(l1.growth, l2.growth, t),
        noiseMax: lerp(l1.noiseMax, l2.noiseMax, t),
        color: lerpColor(l1.color, l2.color, t),
        intensity: lerp(l1.intensity, l2.intensity, t)
      };
      stroke(interpolatedLayer.color);
      fill(interpolatedLayer.color);
      strokeWeight(0.8);
      drawInterpolatedLayer(interpolatedLayer);
    }
  }
}

function drawInterpolatedLayer(layer) {
  beginShape();
  for (let a = 0; a < 360; a += 2) {
    let xoff = map(sinVal[a], -1, 1, 0, layer.noiseMax);
    let yoff = map(cosVal[a], -1, 1, 0, layer.noiseMax);
    let n = pow(noise(xoff, yoff, frameCount * 0.005), 2);

    let spikeIntensity = 1.0 + (layer.intensity * 2.0);
    let spikeFactor = sin(a * 3.7) * cos(a * 2.3) * sin(a * 5.1);
    spikeFactor = pow(abs(spikeFactor), 1.0) * spikeIntensity;

    let sharpNoise = noise(a * 0.1, frameCount * 0.01);
    sharpNoise = pow(sharpNoise, 1.8) * spikeIntensity;

    let baseRadius = map(n, 0, 1, layer.growth * 0.3, layer.growth * 1.1);
    let spikeRadius = baseRadius * (0.4 + 0.5 * spikeFactor + 0.3 * sharpNoise);

    let x = spikeRadius * cos(a);
    let y = spikeRadius * sin(a);
    vertex(x, y);
  }
  endShape(CLOSE);
}

function drawTooltip() {
  let d = dist(mouseX, mouseY, centerX, centerY);
  if (d < 200) {
    resetMatrix();
    fill(255, 230);
    stroke(0);
    strokeWeight(0.3);

    let tooltipHeight = 40 + layers.length * 18;
    rect(mouseX + 12, mouseY - 10, 240, tooltipHeight, 6);

    fill(0);
    noStroke();
    textSize(12);
    textAlign(LEFT);

    textStyle(BOLD);
    text(currentCountry, mouseX + 20, mouseY + 10);
    textStyle(NORMAL);

    for (let i = 0; i < layers.length; i++) {
      let y = mouseY + 30 + i * 18;
      fill(layers[i].color);
      ellipse(mouseX + 26, y - 4, 8, 8);
      fill(0);
      noStroke();
      text(layers[i].label, mouseX + 40, y);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerX = width / 2;
  centerY = height / 2;
}