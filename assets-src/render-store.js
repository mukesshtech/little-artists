// Generate Play Store assets (no emoji — pure vector so sharp renders reliably)
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const OUT = path.join(__dirname, "..", "store");
fs.mkdirSync(OUT, { recursive: true });
const F = `font-family="Arial, Helvetica, sans-serif"`;

// ---- reusable bits ----
const tile = (x, y, w, h, c1, icon, label) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="44" fill="url(#${c1})"/>
  ${icon(x + w / 2, y + h / 2 - 26)}
  <text x="${x + w / 2}" y="${y + h - 44}" ${F} font-size="40" font-weight="900" fill="#fff" text-anchor="middle">${label}</text>`;
const crayon = (cx, cy) => `<g transform="translate(${cx},${cy})"><rect x="-26" y="-46" width="52" height="76" rx="10" fill="#ffd166" stroke="#2b2d42" stroke-width="6"/><path d="M-26 -46 L0 -82 L26 -46 Z" fill="#ff7a59" stroke="#2b2d42" stroke-width="6"/></g>`;
const pencil = (cx, cy) => `<g transform="translate(${cx},${cy}) rotate(35)"><rect x="-20" y="-44" width="40" height="64" fill="#8ab6ff" stroke="#2b2d42" stroke-width="6"/><path d="M-20 20 L0 56 L20 20 Z" fill="#ffe6c7" stroke="#2b2d42" stroke-width="6"/><path d="M-8 38 L0 56 L8 38 Z" fill="#2b2d42"/></g>`;
const abc = (cx, cy) => `<text x="${cx}" y="${cy + 28}" ${F} font-size="84" font-weight="900" fill="#fff" text-anchor="middle">ABC</text>`;
const frame = (cx, cy) => `<g transform="translate(${cx},${cy})"><rect x="-54" y="-44" width="108" height="88" rx="12" fill="#fff" stroke="#2b2d42" stroke-width="6"/><circle cx="26" cy="-18" r="12" fill="#ffd166"/><path d="M-54 30 L-14 -6 L14 18 L36 0 L54 18 L54 38 L-54 38 Z" fill="#7ec87e"/></g>`;
const bucketIcon = (cx, cy, s = 1) => `<g transform="translate(${cx},${cy}) scale(${s})"><path d="M-28 -20 L28 -20 L20 34 L-20 34 Z" fill="#4361ee" stroke="#2b2d42" stroke-width="5"/><path d="M-28 -20 a28 12 0 0 0 56 0" fill="#6f8cff" stroke="#2b2d42" stroke-width="5"/></g>`;
const swatches = (cx, y, cols) => cols.map((c, i) => `<circle cx="${cx - (cols.length - 1) * 46 / 2 + i * 46}" cy="${y}" r="26" fill="${c}" stroke="#fff" stroke-width="5"/>`).join("");

// colored CAT for the coloring screenshot
const catColored = (cx, cy, s = 1) => `<g transform="translate(${cx},${cy}) scale(${s})">
  <circle cx="0" cy="0" r="150" fill="#ffb703" stroke="#1b1b1b" stroke-width="8"/>
  <path d="M-105 -105 L-140 -210 L-25 -140 Z" fill="#ffb703" stroke="#1b1b1b" stroke-width="8"/>
  <path d="M105 -105 L140 -210 L25 -140 Z" fill="#ffb703" stroke="#1b1b1b" stroke-width="8"/>
  <circle cx="-55" cy="-20" r="16" fill="#1b1b1b"/><circle cx="55" cy="-20" r="16" fill="#1b1b1b"/>
  <path d="M0 10 L-22 40 L22 40 Z" fill="#ff8fab" stroke="#1b1b1b" stroke-width="6"/>
  <path d="M-30 45 L-120 30 M-30 60 L-120 70 M30 45 L120 30 M30 60 L120 70" stroke="#1b1b1b" stroke-width="6" fill="none"/>
</g>`;
const apple = (cx, cy, s = 1) => `<g transform="translate(${cx},${cy}) scale(${s})">
  <path d="M0 -70 C-130 -150 -150 80 0 100 C150 80 130 -150 0 -70 Z" fill="#ff5a5f" stroke="#1b1b1b" stroke-width="9"/>
  <path d="M0 -70 L8 -130" stroke="#7f5539" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M8 -120 q50 -30 70 5 q-50 25 -70 -5 Z" fill="#7ec87e" stroke="#1b1b1b" stroke-width="6"/>
</g>`;

function caption(text, color) { return `<g><rect x="60" y="70" width="960" height="150" rx="36" fill="${color}"/><text x="540" y="168" ${F} font-size="56" font-weight="900" fill="#fff" text-anchor="middle">${text}</text></g>`; }
function card(x, y, w, h) { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="40" fill="#fff"/>`; }

const W = 1080, H = 1920;
const defs = `<defs>
  <radialGradient id="bg" cx="30%" cy="20%" r="90%"><stop offset="0%" stop-color="#ffe5d0"/><stop offset="55%" stop-color="#ffd6e8"/><stop offset="100%" stop-color="#d9f0ff"/></radialGradient>
  <linearGradient id="t1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8fab"/><stop offset="1" stop-color="#ff5a5f"/></linearGradient>
  <linearGradient id="t2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ad7c8"/><stop offset="1" stop-color="#18b3a0"/></linearGradient>
  <linearGradient id="t3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd166"/><stop offset="1" stop-color="#ff9e00"/></linearGradient>
  <linearGradient id="t4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ab6ff"/><stop offset="1" stop-color="#4361ee"/></linearGradient>
  <linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9e6d"/><stop offset="1" stop-color="#ff5a8a"/></linearGradient>
</defs>`;

// ---- Screenshot 1: Home ----
const ss1 = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <text x="540" y="300" ${F} font-size="100" font-weight="900" fill="#ff5a5f" text-anchor="middle">Little <tspan fill="#4361ee">Artists</tspan></text>
  <text x="540" y="370" ${F} font-size="44" font-weight="800" fill="#6b5b7a" text-anchor="middle">Color  •  Draw  •  Learn  •  Play</text>
  ${tile(110, 470, 410, 410, "t1", crayon, "Coloring Book")}
  ${tile(560, 470, 410, 410, "t2", pencil, "Free Draw")}
  ${tile(110, 920, 410, 410, "t3", abc, "Learning")}
  ${tile(560, 920, 410, 410, "t4", frame, "My Gallery")}
  <rect x="120" y="1500" width="840" height="170" rx="40" fill="#ffffffcc"/>
  <text x="540" y="1575" ${F} font-size="48" font-weight="900" fill="#ff5a5f" text-anchor="middle">100% Kid-Safe</text>
  <text x="540" y="1635" ${F} font-size="38" font-weight="700" fill="#6b5b7a" text-anchor="middle">No ads  •  No internet needed</text>
</svg>`;

// ---- Screenshot 2: Coloring ----
const ss2 = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="#f0f4f8"/>
  ${caption("Tap to Fill • 14 Pictures!", "#ff7a59")}
  ${card(90, 290, 900, 900)}
  ${catColored(540, 740, 1.7)}
  <rect x="90" y="1240" width="900" height="120" rx="30" fill="#fff"/>
  ${swatches(540, 1300, ["#ff5a5f", "#ff9e00", "#ffd166", "#06d6a0", "#118ab2", "#4361ee", "#8338ec", "#2b2d42"])}
  <rect x="90" y="1400" width="900" height="150" rx="30" fill="#fff"/>
  ${bucketIcon(230, 1475, 1.3)}<text x="230" y="1530" ${F} font-size="30" font-weight="800" fill="#555" text-anchor="middle">Fill</text>
  <g transform="translate(420,1455)"><rect x="-30" y="-30" width="14" height="70" rx="6" fill="#8338ec"/><rect x="-16" y="-40" width="40" height="22" rx="8" fill="#8338ec"/></g><text x="420" y="1530" ${F} font-size="30" font-weight="800" fill="#555" text-anchor="middle">Brush</text>
  <g transform="translate(620,1455)"><rect x="-34" y="-22" width="68" height="44" rx="12" fill="#ff8fab" stroke="#2b2d42" stroke-width="5"/></g><text x="620" y="1530" ${F} font-size="30" font-weight="800" fill="#555" text-anchor="middle">Sticker</text>
  <g transform="translate(820,1455)"><rect x="-34" y="-22" width="68" height="44" rx="10" fill="#dfe6ee" stroke="#2b2d42" stroke-width="5"/></g><text x="820" y="1530" ${F} font-size="30" font-weight="800" fill="#555" text-anchor="middle">Eraser</text>
  <rect x="120" y="1610" width="840" height="150" rx="40" fill="#fff7e6"/>
  <text x="540" y="1700" ${F} font-size="46" font-weight="900" fill="#ff7a59" text-anchor="middle">Magic one-tap colour fill!</text>
</svg>`;

// ---- Screenshot 3: Free Draw ----
const scribble = `
  <path d="M200 600 q120 -160 260 0 t260 0" stroke="#ff5a5f" stroke-width="26" fill="none" stroke-linecap="round"/>
  <path d="M220 760 q140 120 320 30 t300 -20" stroke="#06d6a0" stroke-width="26" fill="none" stroke-linecap="round"/>
  <path d="M260 920 C400 820 520 1020 700 900" stroke="#8338ec" stroke-width="30" fill="none" stroke-linecap="round"/>
  <path d="M250 1060 q150 -90 300 0 t260 -10" stroke="#ffb703" stroke-width="24" fill="none" stroke-linecap="round"/>
  ${[..."01234"].map((n, i) => `<path d="M220 ${1140} q160 -120 320 0" stroke="hsl(${i * 60},85%,55%)" stroke-width="10" fill="none" transform="translate(0,${i * 14})"/>`).join("")}
  <g transform="translate(760,640)"><path d="M0 -60 L18 -18 L62 -18 L26 8 L40 52 L0 24 L-40 52 L-26 8 L-62 -18 L-18 -18 Z" fill="#ffd166" stroke="#ff9e00" stroke-width="6"/></g>`;
const ss3 = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="#f0f4f8"/>
  ${caption("Crayon • Neon • Rainbow!", "#18b3a0")}
  ${card(90, 290, 900, 940)}
  ${scribble}
  <rect x="90" y="1280" width="900" height="120" rx="30" fill="#fff"/>
  ${swatches(540, 1340, ["#ff5a5f", "#ff9e00", "#ffd166", "#06d6a0", "#118ab2", "#4361ee", "#8338ec", "#2b2d42"])}
  <rect x="90" y="1440" width="900" height="150" rx="30" fill="#fff"/>
  ${["Crayon", "Marker", "Neon", "Rainbow"].map((b, i) => `<g><rect x="${150 + i * 200}" y="1470" width="160" height="90" rx="20" fill="#eef2f7"/><text x="${230 + i * 200}" y="1525" ${F} font-size="34" font-weight="900" fill="#18b3a0" text-anchor="middle">${b}</text></g>`).join("")}
  <rect x="120" y="1650" width="840" height="150" rx="40" fill="#e7fbf5"/>
  <text x="540" y="1740" ${F} font-size="46" font-weight="900" fill="#18b3a0" text-anchor="middle">Draw anything you imagine!</text>
</svg>`;

// ---- Screenshot 4: Learning ----
const ss4 = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${caption("ABC • 123 • Shapes • Animals", "#4361ee")}
  <text x="540" y="700" ${F} font-size="340" font-weight="900" fill="#ff5a5f" text-anchor="middle">A</text>
  ${apple(540, 1020, 1.25)}
  <text x="540" y="1320" ${F} font-size="84" font-weight="900" fill="#4361ee" text-anchor="middle">Apple</text>
  <rect x="320" y="1390" width="440" height="120" rx="60" fill="#ffd166"/>
  <text x="540" y="1468" ${F} font-size="46" font-weight="900" fill="#6b4e00" text-anchor="middle">Hear it spoken</text>
  <rect x="120" y="1600" width="840" height="160" rx="40" fill="#ffffffcc"/>
  <text x="540" y="1675" ${F} font-size="46" font-weight="900" fill="#4361ee" text-anchor="middle">Talking letters &amp; animals</text>
  <text x="540" y="1730" ${F} font-size="36" font-weight="700" fill="#6b5b7a" text-anchor="middle">Tap to learn &amp; listen</text>
</svg>`;

// ---- Feature graphic 1024x500 ----
const feat = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500">${defs}
  <rect width="1024" height="500" fill="url(#fg)"/>
  <g transform="translate(180,250) scale(0.62) translate(-256,-256)">
    <rect width="512" height="512" rx="110" fill="#fff7e6"/>
    <circle cx="170" cy="186" r="40" fill="#ff5a5f"/><circle cx="300" cy="160" r="40" fill="#ffb703"/><circle cx="372" cy="262" r="40" fill="#2ec4b6"/><circle cx="210" cy="300" r="40" fill="#4361ee"/><circle cx="318" cy="332" r="40" fill="#8338ec"/>
    <rect x="120" y="372" width="272" height="26" rx="13" fill="#2b2d42"/>
    <path d="M300 372 l44 -150 26 14 -44 150z" fill="#ffd166" stroke="#2b2d42" stroke-width="8"/><path d="M300 372 l-14 26 40 -12z" fill="#2b2d42"/>
  </g>
  <text x="430" y="220" ${F} font-size="92" font-weight="900" fill="#fff">Little Artists</text>
  <text x="432" y="300" ${F} font-size="46" font-weight="800" fill="#fff7e6">Color, Draw &amp; Learn — for Kids</text>
  <text x="432" y="370" ${F} font-size="36" font-weight="700" fill="#ffe3d8">No ads • Offline • Safe</text>
</svg>`;

(async () => {
  await sharp(Buffer.from(ss1)).png().toFile(path.join(OUT, "screenshot-1-home.png"));
  await sharp(Buffer.from(ss2)).png().toFile(path.join(OUT, "screenshot-2-coloring.png"));
  await sharp(Buffer.from(ss3)).png().toFile(path.join(OUT, "screenshot-3-draw.png"));
  await sharp(Buffer.from(ss4)).png().toFile(path.join(OUT, "screenshot-4-learning.png"));
  await sharp(Buffer.from(feat)).png().toFile(path.join(OUT, "feature-graphic-1024x500.png"));
  await sharp(path.join(__dirname, "..", "assets", "icon-only.png")).resize(512, 512).png().toFile(path.join(OUT, "app-icon-512.png"));
  console.log("Store assets generated in /store");
})().catch((e) => { console.error(e); process.exit(1); });
