let sinVal = [];
let cosVal = [];
let layers = [];
let startFrame = 0;
let centerX, centerY;
let currentCountry = "";

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  background("#000000");
  centerX = width / 2;
  centerY = height / 2;
  noFill();

  // Sinus- und Kosinuswerte vorab berechnen (für Performance)
  for (let i = 0; i < 360; i++) {
    sinVal[i] = sin(i);
    cosVal[i] = cos(i);
  }

  initFlowerLayers("Germany"); // Startland (Demo: Deutschland)
}

function initFlowerLayers(countryName) {
  currentCountry = countryName;
  const data = countryData[countryName]; // Werte für das gewählte Land

  // Umweltkategorien, Mapping schlechter Werte auf größere Zahlen
  let rawLayers = [
    {
      label: `CO₂: ${data.co2}t`,
      value: map(data.co2, 0, 20, 0, 1), // viel CO₂ = schlecht = größerer Wert
      color: color(255, 0, 0, 90) // Rot
    },
    {
      label: `Waste: ${data.waste} kg`,
      value: map(data.waste, 0, 1000, 0, 1),
      color: color(255, 165, 0, 90) // Orange
    },
    {
      label: `Water: ${data.water} L`,
      value: map(data.water, 0, 300, 0, 1),
      color: color(0, 150, 255, 90) // Blau
    },
    {
      label: `Air Quality: ${data.air}`,
      value: map(100 - data.air, 0, 100, 0, 1), // niedrige Luftqualität = schlecht
      color: color(255, 255, 0, 90) // Gelb
    },
    {
      label: `Biodiversity: ${data.biodiversity}`,
      value: map(100 - data.biodiversity, 0, 100, 0, 1),
      color: color(180, 0, 255, 90) // Lila
    },
    {
      label: `Transparency: ${data.transparency}`,
      value: map(100 - data.transparency, 0, 100, 0, 1),
      color: color(255, 255, 255, 90) // Weiß
    },
    {
      label: `Renewables: ${data.renewables}%`,
      value: map(100 - data.renewables, 0, 100, 0, 1),
      color: color(0, 200, 100, 90) // Grün
    }
  ];

  // Sortierung: schlechteste Werte (größte Zahl) zuerst = innerste Schicht
  rawLayers.sort((a, b) => b.value - a.value);

  // Layer konfigurieren
  layers = rawLayers.map((l, i) => {
    return {
      label: l.label,
      color: l.color,
      baseRadius: lerp(200, 700, l.value), // Radius je nach Umweltwert
      noiseMax: lerp(1.5, 3.5, l.value),   // Unregelmäßigkeit
      rotateSpeed: 0.05 * (i % 2 === 0 ? 1 : -1), // Rotation im Wechsel
      growth: 0,
      targetGrowth: lerp(200, 700, l.value), // Endgröße
      delay: i * 80 // Zeitliche Verzögerung
    };
  });

  startFrame = frameCount;
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

  // Erste Schicht sofort starten
  if (layers[0].growth < layers[0].targetGrowth) {
    layers[0].growth += 1.2;
  }

  // Alle Schichten nacheinander wachsen lassen und ineinander überblenden
  for (let i = 0; i < layers.length - 1; i++) {
    let l1 = layers[i];
    let l2 = layers[i + 1];

    if (frameCount - startFrame > l2.delay) {
      if (l2.growth < l2.targetGrowth) {
        l2.growth += 0.8;
      }
    }

    // Zwischenlayer für fließende Übergänge berechnen
    for (let j = 0; j <= 10; j++) {
      let t = j / 10;
      let interpolatedLayer = {
        growth: lerp(l1.growth, l2.growth, t),
        noiseMax: lerp(l1.noiseMax, l2.noiseMax, t),
        color: lerpColor(l1.color, l2.color, t)
      };

      stroke(interpolatedLayer.color);
      fill(interpolatedLayer.color);
      strokeWeight(0.5);
      drawInterpolatedLayer(interpolatedLayer);
    }
  }
}

// Schichtform (mit organischem Wackeln) zeichnen
function drawInterpolatedLayer(layer) {
  beginShape();
  for (let a = 0; a < 360; a++) {
    let xoff = map(sinVal[a], -1, 1, 0, layer.noiseMax);
    let yoff = map(cosVal[a], -1, 1, 0, layer.noiseMax);
    let n = pow(noise(xoff, yoff, frameCount * 0.005), 2); // weichere Wellen
    let r = map(n, 0, 1, layer.growth * 0.4, layer.growth * 1.2);
    let x = r * cos(a);
    let y = r * sin(a);
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