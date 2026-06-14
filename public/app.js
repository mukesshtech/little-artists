"use strict";
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const SCREENS = ["home", "colorPick", "color", "draw", "learn", "learnGrid", "learnView", "gallery"];
function show(id) { SCREENS.forEach((s) => $("#" + s).classList.toggle("active", s === id)); if (window.speechSynthesis) speechSynthesis.cancel(); }

/* ---------------- sound ---------------- */
let soundOn = true, actx = null;
function speak(t) { if (!soundOn || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.rate = 0.9; u.pitch = 1.25; speechSynthesis.speak(u); }
function beep(f = 600, d = 0.09) { if (!soundOn) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g = actx.createGain(); o.type = "sine"; o.frequency.value = f; o.connect(g); g.connect(actx.destination); g.gain.setValueAtTime(0.15, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + d); o.start(); o.stop(actx.currentTime + d); } catch (e) {} }
$("#soundToggle").onclick = () => { soundOn = !soundOn; $("#soundToggle").textContent = soundOn ? "🔊 Sound: On" : "🔇 Sound: Off"; if (soundOn) beep(700); };

/* ---------------- toast + confetti ---------------- */
let toastT;
function toast(msg) { let t = $("#toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); } t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200); }
function confetti() {
  const c = $("#confetti"), colors = ["#ff5a5f", "#ffd166", "#06d6a0", "#4361ee", "#8338ec", "#ff8fab", "#00bbf9"];
  for (let i = 0; i < 30; i++) {
    const d = document.createElement("div"); d.className = "cf"; d.style.background = colors[i % colors.length];
    d.style.left = (42 + Math.random() * 16) + "%"; d.style.top = "42%"; c.appendChild(d);
    const ang = Math.random() * Math.PI * 2, dist = 120 + Math.random() * 230, dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 120;
    d.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${dx}px,${dy + 320}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }], { duration: 1200 + Math.random() * 700, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => d.remove();
  }
}

/* ---------------- navigation ---------------- */
$$("[data-go]").forEach((b) => b.onclick = () => { const t = b.dataset.go; beep(620); if (t === "colorPick") buildPickGrid(); if (t === "gallery") buildGallery(); show(t); });

/* =====================================================================
   COLORING PICTURES (black outlines on white — flood-fill friendly)
   ===================================================================== */
function base(g, S) { g.fillStyle = "#fff"; g.fillRect(0, 0, S, S); g.lineWidth = Math.max(5, S * 0.014); g.strokeStyle = "#1b1b1b"; g.lineJoin = "round"; g.lineCap = "round"; }
const PICTURES = [
  { name: "Star", draw: (g, S) => { base(g, S); const cx = S / 2, cy = S / 2, R = S * 0.4, r = R * 0.42; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r : R, x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.stroke(); } },
  { name: "Heart", draw: (g, S) => { base(g, S); const cx = S / 2, cy = S * 0.44, w = S * 0.34; g.beginPath(); g.moveTo(cx, cy + w * 0.95); g.bezierCurveTo(cx - w * 1.4, cy - w * 0.4, cx - w * 0.5, cy - w * 1.15, cx, cy - w * 0.2); g.bezierCurveTo(cx + w * 0.5, cy - w * 1.15, cx + w * 1.4, cy - w * 0.4, cx, cy + w * 0.95); g.closePath(); g.stroke(); } },
  { name: "Flower", draw: (g, S) => { base(g, S); const cx = S / 2, cy = S * 0.42, pr = S * 0.12, R = S * 0.19; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; g.beginPath(); g.arc(x, y, pr, 0, 7); g.stroke(); } g.beginPath(); g.arc(cx, cy, pr * 0.95, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx, cy + pr); g.lineTo(cx, S * 0.9); g.stroke(); g.beginPath(); g.moveTo(cx, S * 0.72); g.quadraticCurveTo(cx + S * 0.14, S * 0.66, cx + S * 0.16, S * 0.78); g.quadraticCurveTo(cx + S * 0.05, S * 0.82, cx, S * 0.78); g.stroke(); } },
  { name: "Fish", draw: (g, S) => { base(g, S); const cx = S * 0.45, cy = S / 2; g.beginPath(); g.ellipse(cx, cy, S * 0.28, S * 0.18, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx + S * 0.26, cy); g.lineTo(cx + S * 0.46, cy - S * 0.14); g.lineTo(cx + S * 0.46, cy + S * 0.14); g.closePath(); g.stroke(); g.fillStyle = "#1b1b1b"; g.beginPath(); g.arc(cx - S * 0.14, cy - S * 0.04, S * 0.025, 0, 7); g.fill(); g.beginPath(); g.moveTo(cx, cy - S * 0.16); g.quadraticCurveTo(cx + S * 0.05, cy - S * 0.3, cx + S * 0.13, cy - S * 0.15); g.stroke(); } },
  { name: "Cat", draw: (g, S) => { base(g, S); const cx = S / 2, cy = S * 0.55, R = S * 0.3; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx - R * 0.7, cy - R * 0.7); g.lineTo(cx - R * 0.95, cy - R * 1.45); g.lineTo(cx - R * 0.15, cy - R * 0.95); g.stroke(); g.beginPath(); g.moveTo(cx + R * 0.7, cy - R * 0.7); g.lineTo(cx + R * 0.95, cy - R * 1.45); g.lineTo(cx + R * 0.15, cy - R * 0.95); g.stroke(); g.fillStyle = "#1b1b1b"; g.beginPath(); g.arc(cx - R * 0.35, cy - R * 0.1, S * 0.026, 0, 7); g.fill(); g.beginPath(); g.arc(cx + R * 0.35, cy - R * 0.1, S * 0.026, 0, 7); g.fill(); g.beginPath(); g.moveTo(cx, cy + R * 0.05); g.lineTo(cx - S * 0.03, cy + R * 0.2); g.lineTo(cx + S * 0.03, cy + R * 0.2); g.closePath(); g.stroke(); for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * R * 0.2, cy + R * 0.22); g.lineTo(cx + s * R * 0.95, cy + R * 0.12); g.moveTo(cx + s * R * 0.2, cy + R * 0.32); g.lineTo(cx + s * R * 0.95, cy + R * 0.4); g.stroke(); } } },
  { name: "House", draw: (g, S) => { base(g, S); const x = S * 0.22, y = S * 0.45, w = S * 0.56, h = S * 0.4; g.strokeRect(x, y, w, h); g.beginPath(); g.moveTo(x - S * 0.04, y); g.lineTo(S / 2, y - S * 0.25); g.lineTo(x + w + S * 0.04, y); g.closePath(); g.stroke(); g.strokeRect(S / 2 - S * 0.08, y + h - S * 0.2, S * 0.16, S * 0.2); g.strokeRect(x + S * 0.06, y + S * 0.06, S * 0.13, S * 0.13); g.strokeRect(x + w - S * 0.19, y + S * 0.06, S * 0.13, S * 0.13); } },
  { name: "Car", draw: (g, S) => { base(g, S); const y = S * 0.58; g.beginPath(); g.moveTo(S * 0.12, y); g.lineTo(S * 0.12, y - S * 0.09); g.lineTo(S * 0.3, y - S * 0.09); g.lineTo(S * 0.4, y - S * 0.22); g.lineTo(S * 0.68, y - S * 0.22); g.lineTo(S * 0.78, y - S * 0.09); g.lineTo(S * 0.88, y - S * 0.09); g.lineTo(S * 0.88, y); g.closePath(); g.stroke(); g.fillStyle = "#fff"; g.beginPath(); g.arc(S * 0.32, y, S * 0.085, 0, 7); g.stroke(); g.beginPath(); g.arc(S * 0.68, y, S * 0.085, 0, 7); g.stroke(); g.beginPath(); g.moveTo(S * 0.42, y - S * 0.2); g.lineTo(S * 0.55, y - S * 0.2); g.lineTo(S * 0.55, y - S * 0.1); g.lineTo(S * 0.42, y - S * 0.1); g.closePath(); g.stroke(); } },
  { name: "Butterfly", draw: (g, S) => { base(g, S); const cx = S / 2, cy = S / 2; g.beginPath(); g.moveTo(cx, cy - S * 0.17); g.lineTo(cx, cy + S * 0.17); g.stroke(); for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * S * 0.16, cy - S * 0.1, S * 0.15, S * 0.12, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(cx + s * S * 0.14, cy + S * 0.12, S * 0.12, S * 0.1, 0, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(cx - S * 0.02, cy - S * 0.17); g.lineTo(cx - S * 0.08, cy - S * 0.27); g.moveTo(cx + S * 0.02, cy - S * 0.17); g.lineTo(cx + S * 0.08, cy - S * 0.27); g.stroke(); } },
  { name: "Apple", draw: (g, S) => { base(g, S); const cx = S / 2, cy = S * 0.56, r = S * 0.26; g.beginPath(); g.moveTo(cx, cy - r * 0.6); g.bezierCurveTo(cx - r * 1.3, cy - r * 1.4, cx - r * 1.4, cy + r * 0.8, cx, cy + r); g.bezierCurveTo(cx + r * 1.4, cy + r * 0.8, cx + r * 1.3, cy - r * 1.4, cx, cy - r * 0.6); g.stroke(); g.beginPath(); g.moveTo(cx, cy - r * 0.6); g.lineTo(cx + S * 0.015, cy - r * 1.2); g.stroke(); g.beginPath(); g.ellipse(cx + S * 0.08, cy - r * 1.05, S * 0.06, S * 0.03, -0.6, 0, 7); g.stroke(); } },
  { name: "Ice Cream", draw: (g, S) => { base(g, S); const cx = S / 2; g.beginPath(); g.moveTo(cx - S * 0.13, S * 0.5); g.lineTo(cx + S * 0.13, S * 0.5); g.lineTo(cx, S * 0.85); g.closePath(); g.stroke(); g.beginPath(); g.arc(cx, S * 0.45, S * 0.14, 0, 7); g.stroke(); g.beginPath(); g.arc(cx - S * 0.08, S * 0.34, S * 0.1, 0, 7); g.stroke(); g.beginPath(); g.arc(cx + S * 0.08, S * 0.34, S * 0.1, 0, 7); g.stroke(); } },
  { name: "Balloon", draw: (g, S) => { base(g, S); const cx = S / 2, cy = S * 0.4, r = S * 0.22; g.beginPath(); g.ellipse(cx, cy, r, r * 1.15, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx, cy + r * 1.15); g.lineTo(cx - S * 0.02, cy + r * 1.15 + S * 0.03); g.lineTo(cx + S * 0.02, cy + r * 1.15 + S * 0.03); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(cx, cy + r * 1.15 + S * 0.03); g.quadraticCurveTo(cx + S * 0.07, S * 0.78, cx - S * 0.03, S * 0.9); g.stroke(); } },
  { name: "Rocket", draw: (g, S) => { base(g, S); const cx = S / 2; g.beginPath(); g.moveTo(cx, S * 0.15); g.quadraticCurveTo(cx + S * 0.16, S * 0.4, cx + S * 0.13, S * 0.7); g.lineTo(cx - S * 0.13, S * 0.7); g.quadraticCurveTo(cx - S * 0.16, S * 0.4, cx, S * 0.15); g.stroke(); g.beginPath(); g.arc(cx, S * 0.4, S * 0.07, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx - S * 0.13, S * 0.55); g.lineTo(cx - S * 0.24, S * 0.73); g.lineTo(cx - S * 0.13, S * 0.7); g.stroke(); g.beginPath(); g.moveTo(cx + S * 0.13, S * 0.55); g.lineTo(cx + S * 0.24, S * 0.73); g.lineTo(cx + S * 0.13, S * 0.7); g.stroke(); g.beginPath(); g.moveTo(cx - S * 0.07, S * 0.7); g.quadraticCurveTo(cx, S * 0.9, cx + S * 0.07, S * 0.7); g.stroke(); } },
  { name: "Sun", draw: (g, S) => { base(g, S); const cx = S / 2, cy = S / 2, r = S * 0.2; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.beginPath(); g.moveTo(cx + Math.cos(a) * r * 1.25, cy + Math.sin(a) * r * 1.25); g.lineTo(cx + Math.cos(a) * r * 1.6, cy + Math.sin(a) * r * 1.6); g.stroke(); } } },
  { name: "Tree", draw: (g, S) => { base(g, S); const cx = S / 2; g.strokeRect(cx - S * 0.05, S * 0.55, S * 0.1, S * 0.3); g.beginPath(); g.arc(cx, S * 0.42, S * 0.2, 0, 7); g.stroke(); g.beginPath(); g.arc(cx - S * 0.15, S * 0.5, S * 0.13, 0, 7); g.stroke(); g.beginPath(); g.arc(cx + S * 0.15, S * 0.5, S * 0.13, 0, 7); g.stroke(); } },
];

function buildPickGrid() {
  const grid = $("#pickGrid"); if (grid.dataset.built) return; grid.dataset.built = "1";
  PICTURES.forEach((p, i) => {
    const card = document.createElement("div"); card.className = "pickcard";
    const cv = document.createElement("canvas"); cv.width = cv.height = 200; p.draw(cv.getContext("2d"), 200);
    const nm = document.createElement("div"); nm.className = "nm"; nm.textContent = p.name;
    card.appendChild(cv); card.appendChild(nm); card.onclick = () => openColoring(i);
    grid.appendChild(card);
  });
}
function openColoring(i) { beep(660); $("#colorTitle").textContent = PICTURES[i].name; show("color"); colorPaint.loadPicture(PICTURES[i].draw); }

/* =====================================================================
   PAINT ENGINE (shared by Coloring + Free Draw)
   ===================================================================== */
const PALETTE = ["#ff5a5f", "#ff8fab", "#ff9e00", "#ffd166", "#06d6a0", "#2ec4b6", "#118ab2", "#4361ee", "#8ab6ff", "#8338ec", "#c77dff", "#f15bb5", "#7f5539", "#2b2d42", "#9d9d9d", "#ffffff"];
const SIZES = [10, 26, 48];
const STICKERS = ["⭐", "❤️", "🌈", "🐶", "🐱", "🌸", "🦋", "🎈", "☀️", "🍓", "🚗", "👑", "🐠", "🌟", "🍦"];
const BRUSHES = [{ id: "crayon", label: "🖍️" }, { id: "marker", label: "🖊️" }, { id: "neon", label: "✨" }, { id: "rainbow", label: "🌈" }];
function hexRgb(h) { return { r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) }; }

function makePaint(canvas, toolsEl, mode) {
  const S = 900; canvas.width = canvas.height = S;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, S, S);
  let color = "#ff5a5f", size = SIZES[1], tool = mode === "color" ? "fill" : "brush", brush = "crayon", sticker = STICKERS[0], hue = 0;
  let drawing = false, last = null, currentDrawer = null;
  const history = []; let baseImg = null;

  function pushHistory() { try { history.push(ctx.getImageData(0, 0, S, S)); if (history.length > 12) history.shift(); } catch (e) {} }
  function loadPicture(fn) { currentDrawer = fn; fn(ctx, S); baseImg = ctx.getImageData(0, 0, S, S); history.length = 0; }
  function clearAll() { pushHistory(); if (mode === "color" && currentDrawer) currentDrawer(ctx, S); else { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, S, S); } beep(400); }
  function undo() { if (!history.length) return; ctx.putImageData(history.pop(), 0, 0); beep(500); }

  function pos(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * (S / r.width), y: (e.clientY - r.top) * (S / r.height) }; }

  function floodFill(sx, sy, fill) {
    sx = Math.floor(sx); sy = Math.floor(sy); if (sx < 0 || sy < 0 || sx >= S || sy >= S) return;
    const img = ctx.getImageData(0, 0, S, S), d = img.data, idx = (x, y) => (y * S + x) * 4;
    const s = idx(sx, sy), tr = d[s], tg = d[s + 1], tb = d[s + 2], fc = hexRgb(fill), tol = 48;
    if (Math.abs(tr - fc.r) < 4 && Math.abs(tg - fc.g) < 4 && Math.abs(tb - fc.b) < 4) return;
    const match = (i) => Math.abs(d[i] - tr) <= tol && Math.abs(d[i + 1] - tg) <= tol && Math.abs(d[i + 2] - tb) <= tol;
    const stack = [[sx, sy]];
    while (stack.length) {
      const [cx, cy] = stack.pop(); let nx = cx; while (nx >= 0 && match(idx(nx, cy))) nx--; nx++;
      let up = false, dn = false;
      while (nx < S && match(idx(nx, cy))) { const i = idx(nx, cy); d[i] = fc.r; d[i + 1] = fc.g; d[i + 2] = fc.b; d[i + 3] = 255;
        if (cy > 0) { if (match(idx(nx, cy - 1))) { if (!up) { stack.push([nx, cy - 1]); up = true; } } else up = false; }
        if (cy < S - 1) { if (match(idx(nx, cy + 1))) { if (!dn) { stack.push([nx, cy + 1]); dn = true; } } else dn = false; }
        nx++;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function strokeTo(p) {
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = size; ctx.shadowBlur = 0;
    let col = color;
    if (tool === "eraser") col = "#ffffff";
    else if (brush === "rainbow" && mode === "draw") { hue = (hue + 8) % 360; col = `hsl(${hue},85%,55%)`; }
    if (brush === "neon" && mode === "draw" && tool !== "eraser") { ctx.shadowBlur = size; ctx.shadowColor = col; }
    ctx.strokeStyle = col; ctx.globalAlpha = (brush === "crayon" && tool !== "eraser" && mode === "draw") ? 0.85 : 1;
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.quadraticCurveTo(last.x, last.y, (last.x + p.x) / 2, (last.y + p.y) / 2); ctx.lineTo(p.x, p.y); ctx.stroke();
    ctx.globalAlpha = 1; ctx.shadowBlur = 0; last = p;
  }
  function dot(p) { ctx.fillStyle = tool === "eraser" ? "#ffffff" : color; ctx.beginPath(); ctx.arc(p.x, p.y, size / 2, 0, 7); ctx.fill(); }
  function stamp(p) { ctx.font = (size * 2.4) + "px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(sticker, p.x, p.y); }

  canvas.addEventListener("pointerdown", (e) => { e.preventDefault(); const p = pos(e); pushHistory();
    if (tool === "fill") { floodFill(p.x, p.y, color); beep(700); }
    else if (tool === "sticker") { stamp(p); beep(820); }
    else { drawing = true; last = p; dot(p); }
  });
  canvas.addEventListener("pointermove", (e) => { if (!drawing) return; e.preventDefault(); strokeTo(pos(e)); });
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => canvas.addEventListener(ev, () => { drawing = false; }));

  /* ---- build tool UI ---- */
  const pal = document.createElement("div"); pal.className = "palette";
  PALETTE.forEach((c, i) => { const sw = document.createElement("div"); sw.className = "swatch" + (i === 0 ? " on" : ""); sw.style.background = c; if (c === "#ffffff") sw.style.borderColor = "#ddd"; sw.onclick = () => { color = c; if (tool === "fill" || tool === "sticker") {} else if (mode === "color") tool = "brush"; $$(".swatch", pal).forEach((x) => x.classList.remove("on")); sw.classList.add("on"); beep(560); }; pal.appendChild(sw); });
  toolsEl.appendChild(pal);

  if (mode === "draw") {
    const br = document.createElement("div"); br.className = "stickrow";
    BRUSHES.forEach((b, i) => { const el = document.createElement("button"); el.className = "stk" + (i === 0 ? " on" : ""); el.textContent = b.label; el.onclick = () => { brush = b.id; tool = "brush"; $$(".stk", br).forEach((x) => x.classList.remove("on")); el.classList.add("on"); syncTools(); beep(600); }; br.appendChild(el); });
    toolsEl.appendChild(br);
  }

  const sizeRow = document.createElement("div"); sizeRow.className = "sizes";
  SIZES.forEach((sz, i) => { const b = document.createElement("button"); b.className = "sz" + (i === 1 ? " on" : ""); const dotEl = document.createElement("i"); const px = 8 + i * 9; dotEl.style.width = dotEl.style.height = px + "px"; b.appendChild(dotEl); b.onclick = () => { size = sz; $$(".sz", sizeRow).forEach((x) => x.classList.remove("on")); b.classList.add("on"); beep(560); }; sizeRow.appendChild(b); });
  toolsEl.appendChild(sizeRow);

  const stk = document.createElement("div"); stk.className = "stickrow";
  STICKERS.forEach((s, i) => { const b = document.createElement("button"); b.className = "stk"; b.textContent = s; b.onclick = () => { sticker = s; tool = "sticker"; syncTools(); beep(820); }; stk.appendChild(b); });
  toolsEl.appendChild(stk);

  const row = document.createElement("div"); row.className = "toolrow";
  const tools = [["fill", "🪣", "Fill"], ["brush", "🖌️", "Brush"], ["sticker", "😀", "Sticker"], ["eraser", "🧽", "Eraser"], ["undo", "↩️", "Undo"], ["clear", "🗑️", "Clear"]];
  const tbtns = {};
  tools.forEach(([id, ic, lb]) => { const b = document.createElement("button"); b.className = "tbtn"; b.innerHTML = ic + `<span class="tl">${lb}</span>`; b.onclick = () => {
      if (id === "undo") return undo(); if (id === "clear") return clearAll();
      tool = id; syncTools(); beep(600);
    }; row.appendChild(b); tbtns[id] = b; });
  toolsEl.appendChild(row);

  function syncTools() { ["fill", "brush", "sticker", "eraser"].forEach((id) => tbtns[id].classList.toggle("on", tool === id)); $$(".stk", stk).forEach((x) => x.classList.toggle("on", tool === "sticker" && x.textContent === sticker)); }
  syncTools();

  return { canvas, loadPicture, getURL: () => canvas.toDataURL("image/png") };
}

const colorPaint = makePaint($("#cCanvas"), $("#cTools"), "color");
const drawPaint = makePaint($("#dCanvas"), $("#dTools"), "draw");
colorPaint.loadPicture(PICTURES[0].draw);

/* ---------------- save to gallery ---------------- */
function saveArt(canvas) {
  const off = document.createElement("canvas"); off.width = off.height = 520; const g = off.getContext("2d");
  g.fillStyle = "#fff"; g.fillRect(0, 0, 520, 520); g.drawImage(canvas, 0, 0, 520, 520);
  const url = off.toDataURL("image/jpeg", 0.85);
  const gal = JSON.parse(localStorage.getItem("la_gallery") || "[]"); gal.unshift(url);
  localStorage.setItem("la_gallery", JSON.stringify(gal.slice(0, 18)));
  confetti(); beep(900); speak("Saved! Great job!"); toast("Saved to Gallery! 🎉");
}
$("#cSave").onclick = () => saveArt($("#cCanvas"));
$("#dSave").onclick = () => saveArt($("#dCanvas"));

function buildGallery() {
  const grid = $("#galGrid"), gal = JSON.parse(localStorage.getItem("la_gallery") || "[]");
  grid.innerHTML = ""; $("#galEmpty").style.display = gal.length ? "none" : "block";
  gal.forEach((url, i) => {
    const card = document.createElement("div"); card.className = "galcard";
    const img = new Image(); img.src = url;
    const act = document.createElement("div"); act.className = "galact";
    const shr = document.createElement("button"); shr.className = "shr"; shr.textContent = "📤"; shr.onclick = () => shareArt(url);
    const del = document.createElement("button"); del.className = "del"; del.textContent = "🗑️"; del.onclick = () => { const g = JSON.parse(localStorage.getItem("la_gallery") || "[]"); g.splice(i, 1); localStorage.setItem("la_gallery", JSON.stringify(g)); buildGallery(); beep(400); };
    act.appendChild(shr); act.appendChild(del); card.appendChild(img); card.appendChild(act); grid.appendChild(card);
  });
}
async function shareArt(url) {
  try { const blob = await (await fetch(url)).blob(); const file = new File([blob], "my-art.jpg", { type: "image/jpeg" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "My Art 🎨" }); return; } } catch (e) {}
  const a = document.createElement("a"); a.href = url; a.download = "my-art.jpg"; a.click(); toast("Saved to your device 📥");
}

/* =====================================================================
   LEARNING
   ===================================================================== */
const ABC = [["A", "Apple", "🍎"], ["B", "Ball", "⚽"], ["C", "Cat", "🐱"], ["D", "Dog", "🐶"], ["E", "Elephant", "🐘"], ["F", "Fish", "🐟"], ["G", "Grapes", "🍇"], ["H", "Hat", "🎩"], ["I", "Ice cream", "🍦"], ["J", "Juice", "🧃"], ["K", "Kite", "🪁"], ["L", "Lion", "🦁"], ["M", "Monkey", "🐒"], ["N", "Nest", "🪺"], ["O", "Orange", "🍊"], ["P", "Panda", "🐼"], ["Q", "Queen", "👑"], ["R", "Rainbow", "🌈"], ["S", "Sun", "☀️"], ["T", "Tiger", "🐯"], ["U", "Umbrella", "☂️"], ["V", "Van", "🚐"], ["W", "Watermelon", "🍉"], ["X", "Xylophone", "🎶"], ["Y", "Yoyo", "🪀"], ["Z", "Zebra", "🦓"]];
const NUMS = [["1", "One", "🍎"], ["2", "Two", "🎈"], ["3", "Three", "⭐"], ["4", "Four", "🍓"], ["5", "Five", "🐠"], ["6", "Six", "🌸"], ["7", "Seven", "🚗"], ["8", "Eight", "🦋"], ["9", "Nine", "🍪"], ["10", "Ten", "🌟"]];
const SHAPES = [["⭕", "Circle"], ["🟦", "Square"], ["🔺", "Triangle"], ["⭐", "Star"], ["❤️", "Heart"], ["🔷", "Diamond"], ["🥚", "Oval"], ["🟫", "Rectangle"]];
const ANIMALS = [["🐶", "Dog", "woof woof"], ["🐱", "Cat", "meow"], ["🐮", "Cow", "moo"], ["🦁", "Lion", "roar"], ["🦆", "Duck", "quack quack"], ["🐸", "Frog", "ribbit"], ["🐑", "Sheep", "baa"], ["🐴", "Horse", "neigh"], ["🐷", "Pig", "oink oink"], ["🐵", "Monkey", "ooh ooh aah"], ["🐘", "Elephant", "pawoo"], ["🐝", "Bee", "buzz buzz"], ["🐍", "Snake", "hiss"], ["🦉", "Owl", "hoot hoot"], ["🐤", "Chick", "cheep cheep"], ["🐯", "Tiger", "roar"]];
const CATS = { abc: { title: "🔠 ABC", data: ABC }, num: { title: "🔢 Numbers", data: NUMS }, shape: { title: "⭐ Shapes", data: SHAPES }, animal: { title: "🐶 Animals", data: ANIMALS } };
let curCat = "abc", curIdx = 0;

$$("[data-learn]").forEach((b) => b.onclick = () => openCat(b.dataset.learn));
function openCat(cat) {
  curCat = cat; beep(660); const c = CATS[cat]; $("#learnTitle").textContent = c.title;
  const grid = $("#lGrid"); grid.innerHTML = "";
  c.data.forEach((it, i) => { const b = document.createElement("button"); b.className = "lcard"; b.textContent = cat === "abc" ? it[0] : cat === "num" ? it[0] : it[0]; if (cat === "abc" || cat === "num") b.style.fontSize = "clamp(30px,9vw,46px)"; b.onclick = () => openItem(i); grid.appendChild(b); });
  show("learnGrid");
}
function openItem(i) {
  curIdx = i; const c = CATS[curCat], it = c.data[i]; show("learnView"); confetti();
  let big = "", word = "", count = "", say = "";
  if (curCat === "abc") { big = it[0]; word = it[2] + " " + it[1]; say = it[0] + ". " + it[1]; }
  else if (curCat === "num") { big = it[0]; word = it[1]; count = it[2].repeat(Number(it[0])); say = it[0] + ". Let's count. " + Array.from({ length: Number(it[0]) }, (_, k) => k + 1).join(" "); }
  else if (curCat === "shape") { big = it[0]; word = it[1]; say = it[1]; }
  else { big = it[0]; word = it[1]; count = "“" + it[2] + "”"; say = it[1] + ". The " + it[1] + " says " + it[2]; }
  $("#lvTitle").textContent = c.title; $("#lvBig").textContent = big; $("#lvBig").style.animation = "none"; void $("#lvBig").offsetWidth; $("#lvBig").style.animation = "pop .35s";
  $("#lvWord").textContent = word; $("#lvCount").textContent = count;
  $("#lvSpeak").dataset.say = say; beep(760); speak(say);
}
$("#lvBack").onclick = () => { beep(620); show("learnGrid"); };
$("#lvSpeak").onclick = () => { beep(700); speak($("#lvSpeak").dataset.say || ""); };
$("#lvBig").onclick = () => speak($("#lvSpeak").dataset.say || "");
$("#lvPrev").onclick = () => { const n = CATS[curCat].data.length; openItem((curIdx - 1 + n) % n); };
$("#lvNext").onclick = () => { const n = CATS[curCat].data.length; openItem((curIdx + 1) % n); };

/* prevent page scroll/zoom on canvas */
document.addEventListener("gesturestart", (e) => e.preventDefault());
document.addEventListener("touchmove", (e) => { if (e.target.tagName === "CANVAS") e.preventDefault(); }, { passive: false });
