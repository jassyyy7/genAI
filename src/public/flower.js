let sinVal = [];
let cosVal = [];
let layers = [];
let startFrame = 0;
let centerX, centerY;
let currentCountry = "";
let combinedData = {};

// Mapping von deutschen zu englischen Ländernamen
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

const urlCountryCodeMapping = {
  "GB-GBN": "United Kingdom",
};

// URL-Parameter auslesen
function getURLParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Land-Name von Deutsch zu Englisch konvertieren
function getEnglishCountryName(germanName) {
  return countryMapping[germanName] || germanName;
}

// Daten kombinieren - mit Fehlerbehandlung
function combineCountryData() {
  console.log("Combining country data...");
  
  // Fallback für fehlende Daten-Objekte
  const safeAirData = typeof airData !== 'undefined' ? airData : {};
  const safeBiodiversityData = typeof biodiversityData !== 'undefined' ? biodiversityData : {};
  const safeCountryData = typeof countryData !== 'undefined' ? countryData : {};
  const safeRenewablesData = typeof renewablesData !== 'undefined' ? renewablesData : {};
  const safeWasteData = typeof wasteData !== 'undefined' ? wasteData : {};
  const safeWaterData = typeof waterData !== 'undefined' ? waterData : {};

  // Debug: Datenstrukturen prüfen
  console.log("Data structures:");
  console.log("Air data sample:", Object.keys(safeAirData).slice(0,3).map(k => k + ': ' + JSON.stringify(safeAirData[k])));
  console.log("Renewables data sample:", Object.keys(safeRenewablesData).slice(0,3).map(k => k + ': ' + JSON.stringify(safeRenewablesData[k])));

  // Alle verfügbaren Länder sammeln
  const allCountries = new Set([
    ...Object.keys(safeAirData),
    ...Object.keys(safeBiodiversityData),
    ...Object.keys(safeCountryData),
    ...Object.keys(safeRenewablesData),
    ...Object.keys(safeWasteData),
    ...Object.keys(safeWaterData)
  ]);

  console.log("Found countries:", allCountries.size);
  console.log("Sample countries:", Array.from(allCountries).slice(0, 5));

  // Für jedes Land die Daten kombinieren
  allCountries.forEach(country => {
    combinedData[country] = {
      co2: safeCountryData[country]?.co2 || 5.0,
      air: safeAirData[country]?.air || 15.0,
      biodiversity: safeBiodiversityData[country]?.kba_pct || 50.0,
      renewables: safeRenewablesData[country] || 20.0, // renewables hat bereits direkte Werte
      waste: safeWasteData[country]?.plasticWaste || 1.0,
      water: safeWaterData[country]?.water || 100.0,
      //transparency: 50
    };
    
    // Debug: Erste paar Länder ausgeben
    if (Array.from(allCountries).indexOf(country) < 3) {
      console.log(`Data for ${country}:`, combinedData[country]);
    }
  });
  
  // Spezielle Debug-Info für United Kingdom
  if (combinedData['United Kingdom']) {
    console.log("United Kingdom data found:", combinedData['United Kingdom']);
  } else {
    console.warn("United Kingdom data NOT found in combinedData!");
  }
  
  console.log("Combined data for", Object.keys(combinedData).length, "countries");
}

function setup() {
  console.log("🌸 Setting up flower visualization...");
  
  // Daten kombinieren
  combineCountryData();
  
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  background("#000000");
  centerX = width / 2;
  centerY = height / 2;
  noFill();

  console.log("Canvas created:", width, "x", height);

  // Sinus- und Kosinuswerte vorab berechnen (für Performance)
  for (let i = 0; i < 360; i++) {
    sinVal[i] = sin(i);
    cosVal[i] = cos(i);
  }

  // Land aus URL-Parameter lesen (bereits auf Englisch)
  //const selectedCountry = getURLParameter('country') || 'Germany'; ++++++++++ HIIIIIIEEEERRR
  const urlParam = getURLParameter('country');
  const mappedFromUrl = urlCountryCodeMapping[urlParam];         // z. B. "GB-GBN" → "United Kingdom"
  const mappedFromGerman = getEnglishCountryName(urlParam);      // z. B. "Deutschland" → "Germany"
  const selectedCountry = mappedFromUrl || mappedFromGerman || 'Germany';
  console.log("Selected country:", selectedCountry);
  
  initFlowerLayers(selectedCountry);
}

function initFlowerLayers(englishCountryName, displayName) {
  currentCountry = englishCountryName; // Immer englischer Name
  console.log("Initializing flower for:", englishCountryName);
  
  let hasData = true;
  let data;
  
  // Prüfen ob Daten für das Land vorhanden sind
  if (!combinedData[englishCountryName]) {
    console.warn(`No data for ${englishCountryName} - showing neutral gray flower`);
    hasData = false;
    currentCountry = englishCountryName + " (No Data Available)";
    
    // Neutrale Dummy-Daten für gräuliche Blume
    data = {
      co2: 0,
      air: 0,
      biodiversity: 0,
      renewables: 0,
      waste: 0,
      water: 0,
      //transparency: 0
    };
  } else {
    data = combinedData[englishCountryName];
  }

  console.log("Using data for", englishCountryName, ":", data);

  // Wenn keine Daten vorhanden, erstelle gräuliche Blume
  if (!hasData) {
    // Simple gray layers for "No Data"
    let rawLayers = [
      {
        label: `No environmental data available`,
        value: 0.2,
        intensity: 0.2,
        color: color(120, 120, 120, 80), // Gray
        baseRadius: 120
      },
      {
        label: `Data being collected`,
        value: 0.15,
        intensity: 0.15,
        color: color(100, 100, 100, 60), // Darker gray
        baseRadius: 140
      },
      {
        label: `Please check back later`,
        value: 0.1,
        intensity: 0.1,
        color: color(80, 80, 80, 40), // Even darker gray
        baseRadius: 160
      }
    ];

    // Configure layers
    layers = rawLayers.map((l, i) => {
      return {
        label: l.label,
        color: l.color,
        intensity: l.intensity,
        baseRadius: l.baseRadius,
        noiseMax: 0.4, // Little chaos for calm display
        rotateSpeed: 0.01 * (i % 2 === 0 ? 1 : -1), // Slow rotation
        growth: 0,
        targetGrowth: l.baseRadius,
        delay: i * 50 // Slower staggered animation
      };
    });

    console.log("Created neutral gray flower for missing data");
    
    // Show "No Data" for Green Score when no environmental data available
    displayNoDataGreenScore(englishCountryName);
    
    startFrame = frameCount;
    return;
  }

  // Calculate positive values (0-1 scale, where higher values = better environmental performance)
  const positiveValues = {
    lowCO2: 1 - Math.min(data.co2 / 15, 1),           // Low CO2 = good
    cleanAir: 1 - Math.min(data.air / 30, 1),         // Low air pollution = good  
    waterEfficiency: 1 - Math.min(data.water / 1000, 1), // Low water consumption = good
    lowWaste: 1 - Math.min(data.waste / 25, 1),       // Low waste = good
    biodiversity: Math.min(data.biodiversity / 100, 1), // High biodiversity = good
    renewables: Math.min(data.renewables / 100, 1),   // High renewable energy = good
    //transparency: Math.min((data.transparency || 50) / 100, 1) // High transparency = good
  };

  console.log("Positive environmental values:", positiveValues);

  // Environmental categories - better values lead to larger, more prominent layers
  let rawLayers = [
    {
      label: `Low CO₂: ${data.co2}t`,
      value: positiveValues.lowCO2,
      intensity: positiveValues.lowCO2,
      color: color(255, 0, 0, 120), // Red
      baseRadius: 180
    },
    {
      label: `Clean Air: ${data.air}`,
      value: positiveValues.cleanAir,
      intensity: positiveValues.cleanAir,
      color: color(255, 255, 0, 120), // Yellow
      baseRadius: 180
    },
    {
      label: `Low Water: ${data.water} L`,
      value: positiveValues.waterEfficiency,
      intensity: positiveValues.waterEfficiency,
      color: color(0, 150, 255, 120), // Blue
      baseRadius: 180
    },
    {
      label: `Low Waste: ${data.waste} kg`,
      value: positiveValues.lowWaste,
      intensity: positiveValues.lowWaste,
      color: color(255, 165, 0, 120), // Orange
      baseRadius: 180
    },
    {
      label: `Biodiversity: ${data.biodiversity.toFixed(1)}%`,
      value: positiveValues.biodiversity,
      intensity: positiveValues.biodiversity,
      color: color(180, 0, 255, 120), // Purple
      baseRadius: 180
    },
    {
      label: `Renewables: ${data.renewables.toFixed(1)}%`,
      value: positiveValues.renewables,
      intensity: positiveValues.renewables,
      color: color(0, 200, 100, 120), // Green
      baseRadius: 180
    }
  ];

  // Sorting: best values (highest intensity) first = outermost layer
  rawLayers.sort((a, b) => b.intensity - a.intensity);

  // Configure layers with proportional sizes
  layers = rawLayers.map((l, i) => {
    // Radius based on positive intensity: better value = larger layer
    const radiusMultiplier = 0.5 + (l.intensity * 2.5); // 0.5x to 3x enlargement
    const targetRadius = l.baseRadius * radiusMultiplier;
    
    // Smoother forms for better values (less chaotic)
    const smoothnessIntensity = 0.3 + (l.intensity * 0.7); // Smoother forms for better values
    
    return {
      label: l.label,
      color: l.color,
      intensity: l.intensity,
      baseRadius: targetRadius,
      noiseMax: smoothnessIntensity, // Less chaos = prettier forms
      rotateSpeed: 0.03 * (i % 2 === 0 ? 1 : -1), // Slower, more elegant rotation
      growth: 0,
      targetGrowth: targetRadius,
      delay: i * 30 // Faster animation for better visibility
    };
  });

  console.log("Created layers with positive values:", 
    layers.map(l => `${l.label.split(':')[0]}: ${(l.intensity*100).toFixed(0)}% good (${l.targetGrowth.toFixed(0)}px radius)`));
  
  // --- Calculate and display Green Score ---
  calculateAndDisplayGreenScore(englishCountryName, data);
  
  startFrame = frameCount;
}

// Green Score calculation and display
function calculateAndDisplayGreenScore(englishCountryName, data) {
  // --- Green Score ---
  const normalizedValues = {
    co2: Math.min(data.co2 / 15, 1),                  // high = bad
    air: 1 - Math.min(data.air / 30, 1),              // high = good
    water: Math.min(data.water / 1000, 1),            // high = bad
    waste: Math.min(data.waste / 25, 1),              // high = bad
    biodiversity: 1 - Math.min(data.biodiversity / 100, 1), // high = good
    renewables: 1 - Math.min(data.renewables / 100, 1),     // high = good
    transparency: 1 - Math.min((data.transparency || 50) / 100, 1)  // high = good
  };

  const greenScore = 1 - (
    normalizedValues.co2 +
    normalizedValues.water +
    normalizedValues.waste +
    normalizedValues.biodiversity +
    normalizedValues.renewables +
    normalizedValues.transparency +
    normalizedValues.air
  ) / 7;

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
}

// Display "No Data" for countries without environmental data
function displayNoDataGreenScore(englishCountryName) {
  if (document.getElementById("country-name")) {
    document.getElementById("country-name").innerText = englishCountryName;
  }

  const badge = document.getElementById("green-score");
  if (badge) {
    badge.innerText = "No Data";
    badge.classList.remove("green", "medium", "low");
    badge.classList.add("no-data");
  }

  console.log(`⚪ ${englishCountryName} → No environmental data available`);
}

function draw() {
  background("#000000");
  translate(centerX, centerY);
  drawBlendedLayers(); // Schichten zeichnen
  drawTooltip();       // Tooltip bei Hover anzeigen
}

function drawBlendedLayers() {
  let ctx = drawingContext;
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // Erste Schicht sofort starten (schneller)
  if (layers[0] && layers[0].growth < layers[0].targetGrowth) {
    layers[0].growth += 4.0; // Schnelles Wachstum
  }

  // Alle Schichten nacheinander wachsen lassen und ineinander überblenden
  for (let i = 0; i < layers.length - 1; i++) {
    let l1 = layers[i];
    let l2 = layers[i + 1];

    if (frameCount - startFrame > l2.delay) {
      if (l2.growth < l2.targetGrowth) {
        l2.growth += 3.0; // Schnelles Wachstum
      }
    }

    // Weniger Zwischenlayer für Performance, aber immer noch sanfte Übergänge
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

// Schichtform (mit organischem Wackeln) zeichnen
function drawInterpolatedLayer(layer) {
  beginShape();
  for (let a = 0; a < 360; a += 2) { // Etwas höhere Auflösung für schönere Formen
    let xoff = map(sinVal[a], -1, 1, 0, layer.noiseMax);
    let yoff = map(cosVal[a], -1, 1, 0, layer.noiseMax);
    let n = pow(noise(xoff, yoff, frameCount * 0.005), 2);
    
    // Spitzen werden intensiver mit höherer Problemintensität
    let spikeIntensity = 1.0 + (layer.intensity * 2.0);
    let spikeFactor = sin(a * 3.7) * cos(a * 2.3) * sin(a * 5.1);
    spikeFactor = pow(abs(spikeFactor), 1.0) * spikeIntensity;
    
    // Noise-basierte Spitzen verstärkt durch Intensität
    let sharpNoise = noise(a * 0.1, frameCount * 0.01);
    sharpNoise = pow(sharpNoise, 1.8) * spikeIntensity;
    
    // Basis-Radius mit spitzer Modulation
    let baseRadius = map(n, 0, 1, layer.growth * 0.3, layer.growth * 1.1);
    let spikeRadius = baseRadius * (0.4 + 0.5 * spikeFactor + 0.3 * sharpNoise);
    
    let x = spikeRadius * cos(a);
    let y = spikeRadius * sin(a);
    vertex(x, y);
  }
  endShape(CLOSE);
}

// Tooltip beim Hovern über die Blume
function drawTooltip() {
  let d = dist(mouseX, mouseY, centerX, centerY);
  if (d < 200) {
    resetMatrix();
    fill(255, 230);
    stroke(0);
    strokeWeight(0.3);
    rect(mouseX + 12, mouseY - 10, 240, 200, 6);

    fill(0);
    noStroke();
    textSize(12);
    textAlign(LEFT);

    textStyle(BOLD);
    text(currentCountry, mouseX + 20, mouseY + 10);
    textStyle(NORMAL);

    // Farbliche Anzeige aller Kategorien von "schlecht" (oben) bis "gut" (unten)
    for (let i = 0; i < layers.length; i++) {
      let y = mouseY + 30 + i * 18;
      fill(layers[i].color);
      ellipse(mouseX + 26, y - 4, 8, 8); // Farbpunkte
      fill(0);
      noStroke();
      text(layers[i].label, mouseX + 40, y);
    }
  }
}

// Canvas neu skalieren bei Fenstergrößenänderung
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerX = width / 2;
  centerY = height / 2;
  background("#000000");
  draw();
}