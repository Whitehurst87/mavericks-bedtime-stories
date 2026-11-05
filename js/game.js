// game.js - engine, input, collision, rendering, scenes, credits.

var TILE = 16, VW = 32, VH = 18, W = VW * TILE, H = VH * TILE;
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

var SAVE_KEY = 'maverick_bucktooth_v1';   // legacy key, belongs to episode one

var LEVELS = {
  dam: {
    label: 'EPISODE ONE',
    title: 'THE REALLY BAD IDEA',
    titleLines: ['THE REALLY', 'BAD IDEA'],
    blurb: 'the river is gone and',
    blurb2: 'the beaver is guilty.',
    start: 'yard',
    scenes: ['yard', 'square', 'riverbed', 'dam', 'ending']
  },
  lemonade: {
    label: 'EPISODE THREE',
    title: 'THE BITTER-LEMONADE HUSTLE',
    titleLines: ['THE BITTER-', 'LEMONADE HUSTLE'],
    blurb: 'eight dollars, one rival booth,',
    blurb2: 'one turtle with no shame.',
    start: 'stand',
    scenes: ['stand', 'rival', 'chase', 'sewer']
  },
  beans: {
    label: 'EPISODE TWO',
    title: 'THE PATH OF THE FLATULENT PROPHET',
    titleLines: ['THE PATH OF THE', 'FLATULENT PROPHET'],
    blurb: 'adrian is in orbit and a',
    blurb2: 'scottish narrator is cheating.',
    start: 'yard2',
    scenes: ['yard2', 'grocery', 'kitchen', 'storm', 'crash', 'credits2']
  }
};
var LEVEL_ORDER = ['dam', 'beans', 'lemonade'];
var titleSel = 0;

var G = {
  mode: 'title',            // title | play | credits
  sceneId: 'yard',
  grid: null, solidGrid: null, bg: null,
  px: 0, py: 0, dir: 'down', moving: false, animT: 0, frame: 0,
  flags: {}, ents: [], banner: 0, bannerText: '', bannerTitle: '',
  fade: 1, fadeTarget: 0, pending: null,
  splash: [], toast: '', toastT: 0,
  time: 0, creditsY: 0, endingStep: 0,
  _gnomeOk: false,
  level: 'dam',
  companion: null,        // ghost beaver that follows you in episode two
  charge: 0,              // bean blast meter
  chargeMode: false,
  holdMode: null,         // 'eat' | 'charge'
  cartT: 0,               // cartwheel timer
  chaseT: 0,
  talkTarget: null,
  creditsKind: 'dam',
  shake: 0, flash: 0,
  stormTint: 0
};

// ------------------------------------------------------------------ autotile

var WANG_SET = null;   // { img, map, fw, fh }

function loadWang(name) {
  if (typeof WANG === 'undefined' || !WANG[name]) return;
  var cfg = WANG[name];
  var img = new Image();
  img.onload = function () {
    WANG_SET = { img: img, map: cfg.map, fw: cfg.fw, fh: cfg.fh };
  };
  img.src = 'assets/' + cfg.sheet;
}
loadWang('path_grass');

function isPathAt(grid, x, y, dflt) {
  if (x < 0 || y < 0 || x >= VW || y >= VH) return dflt;
  return grid[y][x] === 'path';
}

// corner wang: bit set when that corner belongs to the path
function wangIndex(grid, x, y) {
  var N = isPathAt(grid, x, y - 1, false), S = isPathAt(grid, x, y + 1, false);
  var Wl = isPathAt(grid, x - 1, y, false), E = isPathAt(grid, x + 1, y, false);
  var mask = 0;
  if (Wl || N) mask |= 1;   // NW
  if (E || N) mask |= 2;    // NE
  if (Wl || S) mask |= 4;   // SW
  if (E || S) mask |= 8;    // SE
  return WANG_SET.map[String(mask)];
}

// ------------------------------------------------------------------ helpers

function hash(x, y, s) {
  var h = x * 374761393 + y * 668265263 + (s || 0) * 1442695040;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

// ------------------------------------------------------------------- audio

var SFX = {
  ctx: null, muted: false, musicOn: true, _timer: null, _step: 0,
  init: function () {
    if (this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
  },
  tone: function (freq, dur, type, vol) {
    if (!this.ctx || this.muted) return;
    var t = this.ctx.currentTime;
    var o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'square'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol || 0.05, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  },
  text: function () { this.tone(520 + Math.random() * 90, 0.03, 'square', 0.025); },
  blip: function (f, d) { this.tone(f || 600, d || 0.06, 'square', 0.05); },
  splash: function () { this.tone(180, 0.18, 'sawtooth', 0.06); this.tone(90, 0.22, 'triangle', 0.05); },
  pickup: function () { var s = this; [660, 880, 1100].forEach(function (f, i) { setTimeout(function () { s.tone(f, 0.09, 'square', 0.05); }, i * 70); }); },
  blast: function () {
    if (!this.ctx || this.muted) return;
    var t = this.ctx.currentTime;
    var o = this.ctx.createOscillator(), g2 = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(30, t + 0.7);
    g2.gain.setValueAtTime(0.22, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(g2); g2.connect(this.ctx.destination);
    o.start(t); o.stop(t + 0.95);
    this.tone(70, 0.6, 'square', 0.1);
  },
  fanfare: function () { var s = this; [523, 659, 784, 1046, 784, 1046].forEach(function (f, i) { setTimeout(function () { s.tone(f, 0.16, 'square', 0.06); }, i * 130); }); },
  startMusic: function () {
    if (this._timer || !this.ctx) return;
    var s = this, mel = [523, 0, 659, 784, 0, 659, 523, 0, 440, 0, 523, 659, 0, 523, 440, 0];
    var bass = [131, 131, 165, 165, 147, 147, 175, 175];
    this._timer = setInterval(function () {
      if (s.muted || !s.musicOn) { s._step++; return; }
      var m = mel[s._step % mel.length];
      if (m) s.tone(m, 0.16, 'square', 0.018);
      if (s._step % 2 === 0) {
        var b = bass[(s._step / 2) % bass.length];
        if (b) s.tone(b, 0.28, 'triangle', 0.03);
      }
      s._step++;
    }, 200);
  }
};

// ------------------------------------------------------------------ input

var keys = {};
var touch = { on: false, dx: 0, dy: 0, act: false, btn: null };

document.addEventListener('keydown', function (e) {
  var k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(k) >= 0) e.preventDefault();
  keys[k] = true;
  if (e.repeat) return;                 // holding a key must not spam actions
  SFX.init();
  if (k === 'm') { SFX.muted = !SFX.muted; toast(SFX.muted ? 'sound off' : 'sound on'); }
  // a minigame can claim a key press before the world does
  for (var kh = 0; kh < KEY_HOOKS.length; kh++) {
    if (KEY_HOOKS[kh](k)) return;
  }
  if (G.mode === 'book') {
    if (k === 'arrowleft' || k === 'a') bookMove(-1, 0);
    else if (k === 'arrowright' || k === 'd') bookMove(1, 0);
    else if (k === 'arrowup' || k === 'w') bookMove(0, -1);
    else if (k === 'arrowdown' || k === 's') bookMove(0, 1);
    else if (k === 'e' || k === ' ' || k === 'enter') bookConfirm();
    else if (k === 'f') toggleFreeRead();
    else if (k === 'b' || k === 'escape') closeBook();
    return;
  }
  if (G.mode === 'title') {
    if (k === 'arrowleft' || k === 'a' || k === 'arrowright' || k === 'd') {
      var dirSel = (k === 'arrowright' || k === 'd') ? 1 : -1;
      titleSel = (titleSel + dirSel + LEVEL_ORDER.length) % LEVEL_ORDER.length;
      SFX.blip(640, 0.05);
      return;
    }
  }
  if (DLG.active) {
    if (k === 'e' || k === ' ' || k === 'enter') {
      if (DLG.current && DLG.current.choices && DLG.shown >= DLG.current.text.length) SFX.blip(800, 0.05);
      advanceDialogue();
    }
    if (k === 'arrowup' || k === 'w') moveChoice(-1);
    if (k === 'arrowdown' || k === 's') moveChoice(1);
    return;
  }
  if (k === 'e' || k === ' ' || k === 'enter') onAction();
});
document.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });

// touch / mouse controls
function canvasPos(ev) {
  var r = canvas.getBoundingClientRect();
  var p = ev.touches ? ev.touches[0] : ev;
  return { x: (p.clientX - r.left) * (W / r.width), y: (p.clientY - r.top) * (H / r.height) };
}
function inRect(p, x, y, w, h) { return p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h; }

function handleDown(ev) {
  ev.preventDefault();
  SFX.init();
  if (G.mode === 'title') {
    var pp = canvasPos(ev);
    titleSel = pp.x < W / 2 ? 0 : 1;      // tap a card to pick it, then start
    startGame(LEVEL_ORDER[titleSel]);
    return;
  }
  if (G.mode === 'book') { bookPointer(canvasPos(ev)); return; }
  if (G.mode === 'credits') { goBedroom(); return; }
  var p = canvasPos(ev);
  if (DLG.active) {
    if (DLG.current && DLG.current.choices && DLG.shown >= DLG.current.text.length) {
      // tap a choice row
      var idx = Math.floor((p.y - (H - 84 + 34)) / 15);
      if (idx >= 0 && idx < DLG.current.choices.length) { DLG.choiceIdx = idx; advanceDialogue(); return; }
    }
    advanceDialogue();
    return;
  }
  if (inRect(p, W - 74, H - 74, 66, 66)) {
    touch.act = true; touch.actT = performance.now();
    return;
  }
  touch.dx = 0; touch.dy = 0; touch.btn = { x: p.x, y: p.y };
  updateTouchDir(p);
}
function updateTouchDir(p) {
  if (!touch.btn) return;
  var cx = W - 120, cy = H - 44;
  var dx = p.x - cx, dy = p.y - cy;
  var d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (d < 10) { touch.dx = 0; touch.dy = 0; return; }
  dx /= d; dy /= d;
  if (Math.abs(dx) > Math.abs(dy)) { touch.dx = dx > 0 ? 1 : -1; touch.dy = 0; }
  else { touch.dx = 0; touch.dy = dy > 0 ? 1 : -1; }
}
function handleMove(ev) {
  if (!touch.btn) return;
  ev.preventDefault();
  updateTouchDir(canvasPos(ev));
}
function handleUp(ev) {
  if (ev) ev.preventDefault();
  touch.btn = null; touch.dx = 0; touch.dy = 0;
  if (touch.act) {
    var held = performance.now() - (touch.actT || 0);
    touch.act = false;
    if (held < 260 && !G.holdMode) onAction();   // short tap = talk, long press = hold
  }
}
canvas.addEventListener('mousedown', handleDown);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleUp);
canvas.addEventListener('touchstart', handleDown, { passive: false });
canvas.addEventListener('touchmove', handleMove, { passive: false });
canvas.addEventListener('touchend', handleUp, { passive: false });
if ('ontouchstart' in window) touch.on = true;

function inputDir() {
  var dx = 0, dy = 0;
  if (keys['arrowleft'] || keys['a']) dx -= 1;
  if (keys['arrowright'] || keys['d']) dx += 1;
  if (keys['arrowup'] || keys['w']) dy -= 1;
  if (keys['arrowdown'] || keys['s']) dy += 1;
  if (touch.dx || touch.dy) { dx = touch.dx; dy = touch.dy; }
  return { dx: dx, dy: dy };
}

function onAction() {
  if (G.holdMode && !DLG.active) return;   // E is busy holding a meter
  if (G.mode === 'book') { bookConfirm(); return; }
  if (G.mode === 'title') { startGame(LEVEL_ORDER[titleSel]); return; }
  if (G.mode === 'credits') { goBedroom(); return; }
  // a minigame can claim the action key before anything in the world does
  for (var ah = 0; ah < ACTION_HOOKS.length; ah++) {
    if (ACTION_HOOKS[ah]()) return;
  }
  var e = nearestThing();
  if (e && e.talk && SCRIPT[e.talk]) { G.talkTarget = e; SCRIPT[e.talk](); return; }
}

// ------------------------------------------------------------- scene build

function buildScene(id) {
  var s = SCENES[id];
  var grid = [], solid = [];
  for (var y = 0; y < VH; y++) {
    grid.push([]); solid.push([]);
    for (var x = 0; x < VW; x++) { grid[y].push(s.fill); solid[y].push(false); }
  }
  (s.rects || []).forEach(function (r) {
    for (var y = r.y; y < r.y + r.h; y++) for (var x = r.x; x < r.x + r.w; x++) {
      if (X_OK(x, y)) grid[y][x] = r.t;
    }
  });
  for (var y2 = 0; y2 < VH; y2++) for (var x2 = 0; x2 < VW; x2++) {
    solid[y2][x2] = (s.solidKinds || []).indexOf(grid[y2][x2]) >= 0;
  }
  G.grid = grid; G.solidGrid = solid;
  G.ents = [];
  (s.entities || []).forEach(function (e) {
    var cp = Object.assign({}, e);
    cp.px = e.tx * TILE + TILE / 2;
    cp.py = e.ty * TILE + TILE;
    if (e.item && G.flags['t_' + e.item]) return; // already pulled from dam
    if (e.hidden && !G.flags['seen_' + e.id]) return;        // revealed by a script
    if (cp.exit && cp.exit.req && !G.flags[cp.exit.req]) {  // locked until a flag is set
      cp.talk = 'lockedExit'; cp.noSolid = true; delete cp.exit;
    }
    if (e.solid || (cp.talk && cp.who && cp.who !== 'sign' && !e.exit && !e.small && !e.noSolid)) {
      var sw = e.sw || 1, sh = e.sh || 1;
      for (var sy3 = e.ty; sy3 < e.ty + sh; sy3++)
        for (var sx3 = e.tx; sx3 < e.tx + sw; sx3++)
          if (X_OK(sx3, sy3)) solid[sy3][sx3] = true;
    }
    G.ents.push(cp);
  });
  G.bg = renderSceneCanvas(id);
}
function X_OK(x, y) { return x >= 0 && y >= 0 && x < VW && y < VH; }

// --------------------------------------------------------------- rendering

function shade(c, amt) {
  var n = parseInt(c.slice(1), 16);
  var r = clamp(((n >> 16) & 255) + amt, 0, 255);
  var g = clamp(((n >> 8) & 255) + amt, 0, 255);
  var b = clamp((n & 255) + amt, 0, 255);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function paintTile(c, kind, tx, ty, grid) {
  var x = tx * TILE, y = ty * TILE, r = hash(tx, ty, 7), r2 = hash(tx, ty, 41);
  for (var hi = 0; hi < TILE_HOOKS.length; hi++) {
    if (TILE_HOOKS[hi](c, kind, tx, ty, grid)) return;
  }
  if (WANG_SET && grid && (kind === 'grass' || kind === 'path')) {
    var idx = wangIndex(grid, tx, ty);
    if (idx === undefined) idx = kind === 'path' ? 15 : 0;
    c.drawImage(WANG_SET.img, (idx % 4) * WANG_SET.fw, Math.floor(idx / 4) * WANG_SET.fh,
      WANG_SET.fw, WANG_SET.fh, x, y, TILE, TILE);
    return;
  }
  function R(px, py, w, h, col) { c.fillStyle = col; c.fillRect(x + px, y + py, w, h); }
  switch (kind) {
    case 'grass': {
      // broad, low-frequency tint so tiles merge into a field instead of a checkerboard
      var broad = hash(tx >> 3, ty >> 3, 11);
      R(0, 0, 16, 16, broad > 0.6 ? '#589646' : broad > 0.3 ? '#559140' : '#5a9847');
      for (var i = 0; i < 5; i++) {
        var hx = Math.floor(hash(tx, ty, i + 1) * 14), hy = Math.floor(hash(tx, ty, i + 21) * 13) + 2;
        var shade2 = hash(tx, ty, i + 40);
        if (shade2 > 0.55) { R(hx, hy, 1, 2, '#4d8a3c'); R(hx + 1, hy, 1, 1, '#4d8a3c'); }
        else { R(hx, hy, 1, 1, '#6bab53'); R(hx, hy + 1, 1, 1, '#65a44e'); }
      }
      if (r > 0.955) { R(6, 6, 2, 2, '#e87090'); R(7, 7, 1, 1, '#ffe060'); R(6, 9, 1, 3, '#4b8a3c'); }
      break;
    }
    case 'path': {
      R(0, 0, 16, 16, r > 0.5 ? '#c8a878' : '#c2a271');
      for (var j = 0; j < 4; j++) R(Math.floor(hash(tx, ty, j + 3) * 14), Math.floor(hash(tx, ty, j + 33) * 14), 2, 1, '#b08f66');
      R(0, 0, 16, 1, 'rgba(160,130,90,0.18)');
      break;
    }
    case 'cobble': {
      R(0, 0, 16, 16, '#8a8177');
      // four stones per tile, offset rows, low contrast grout
      var off = (ty % 2) ? 4 : 0;
      var cs = ['#948b80', '#8e857a', '#968d82', '#8b8278'];
      for (var sy2 = 0; sy2 < 2; sy2++) for (var sx2 = 0; sx2 < 2; sx2++) {
        var bx2 = sx2 * 8 + off - 4, by2 = sy2 * 8 + 1;
        var col = cs[Math.floor(hash(tx + sx2, ty + sy2, 3) * 4)];
        R(bx2 + 1, by2, 6, 6, col);
        R(bx2 + 2, by2 + 6, 4, 1, '#7e756b');
        R(bx2 + 1, by2 + 5, 1, 1, '#7e756b');
      }
      if (r > 0.94) R(5, 5, 3, 2, '#7d8a6a');
      if (r2 > 0.96) R(11, 11, 2, 2, '#9a9084');
      break;
    }
    case 'mud': {
      R(0, 0, 16, 16, r > 0.5 ? '#8a6f4e' : '#836848');
      // a highlight on some tiles only, or a whole field reads as corrugated
      if (r2 > 0.62) R(0, 0, 16, 1, 'rgba(110,88,60,0.35)');
      if (r2 < 0.12) R(0, 14, 16, 1, 'rgba(60,46,30,0.30)');
      for (var k = 0; k < 3; k++) {
        var cx = Math.floor(hash(tx, ty, k + 9) * 11) + 1, cy = Math.floor(hash(tx, ty, k + 19) * 11) + 1;
        R(cx, cy, 4 + (k % 2), 1, '#6f5838');
      }
      if (r2 > 0.82) { R(3, 5, 3, 2, '#9a8870'); R(4, 5, 1, 1, '#ab9c82'); }
      if (r > 0.94) { R(10, 12, 2, 2, '#5f4a30'); }
      break;
    }
    case 'bed': {
      // drained riverbed: wet mud, cracks, a few pale stones
      R(0, 0, 16, 16, r > 0.5 ? '#8a6a44' : '#82633f');
      R(0, 0, 16, 1, '#75592f'); R(0, 8, 16, 1, '#75592f');
      if (r > 0.55) R(3, 4, 5, 1, '#6f5330');
      if (r2 > 0.60) R(9, 11, 4, 1, '#6f5330');
      for (var m = 0; m < 2; m++) R(Math.floor(hash(tx, ty, m + 5) * 13), Math.floor(hash(tx, ty, m + 25) * 13), 2, 2, '#b9a888');
      if (r2 > 0.90) R(6, 10, 3, 2, '#6a4d28');
      break;
    }
    case 'sand': {
      R(0, 0, 16, 16, r > 0.5 ? '#dfcd97' : '#dac68f');
      R(Math.floor(r * 12), Math.floor(r * 12), 2, 1, '#c9b482');
      if (r > 0.8) R(4, 8, 1, 1, '#b8a070');
      break;
    }
    case 'water': {
      R(0, 0, 16, 16, r > 0.5 ? '#3d74bd' : '#3a70b8');
      // no per-tile edge: sparse ripples at varied heights keep it continuous
      if (r > 0.55) R(Math.floor(r2 * 10), 2 + Math.floor(r2 * 3), 5, 1, '#4f88cc');
      if (r > 0.74) R(Math.floor(r * 10), 8 + Math.floor(r2 * 5), 4, 1, '#5b96d4');
      if (r > 0.9) R(Math.floor(r2 * 11), 12, 3, 1, '#7db4e8');
      if (r < 0.12) R(Math.floor(r2 * 12), 5, 2, 1, '#34669e');
      break;
    }
    case 'stone': {
      R(0, 0, 16, 16, '#8b8580');
      R(1, 1, 14, 6, '#95908a'); R(1, 9, 14, 6, '#908a84');
      R(0, 7, 16, 2, '#7a746e'); R(0, 0, 16, 1, '#7a746e');
      if (r > 0.8) R(4, 3, 3, 1, '#a09a94');
      break;
    }
    case 'linoleum': {
      R(0, 0, 16, 16, '#9a8f7a');
      R(0, 0, 8, 8, '#a89c85'); R(8, 8, 8, 8, '#a89c85');
      R(8, 0, 8, 8, '#a2967f'); R(0, 8, 8, 8, '#a2967f');
      if (r > 0.9) R(2, 3, 4, 1, '#8f8570');
      if (r2 > 0.93) R(10, 12, 3, 1, '#b0a48c');
      break;
    }
    case 'wall': {
      R(0, 0, 16, 16, '#cbbfa8');
      R(0, 0, 16, 2, '#b3a68e'); R(0, 14, 16, 2, '#a4977f');
      R(0, 0, 1, 16, '#bcaf97'); R(15, 0, 1, 16, '#bcaf97');
      if (r > 0.75) R(4, 6, 5, 4, '#d8cdb6');
      break;
    }
    case 'shelf': {
      R(0, 0, 16, 16, '#5f5545');
      R(0, 0, 16, 2, '#a89474');            // top board
      var cols = ['#c8452f', '#3f8f5a', '#d8a838', '#4a6fb0', '#a05aa8', '#8a8a6a', '#b06a2a'];
      var nCan = hash(tx, ty, 12) > 0.35 ? 3 : 2;      // gaps so it is not wallpaper
      for (var ci = 0; ci < nCan; ci++) {
        var cx2 = ci * 5 + 1 + (nCan === 2 ? 2 : 0);
        var cc = cols[Math.floor(hash(tx, ty, ci + 3 + 7) * cols.length)];
        var hh2 = 6 + Math.floor(hash(tx, ty, ci + 91) * 2);
        R(cx2, 2 + (7 - hh2), 4, hh2, cc);
        R(cx2, 2 + (7 - hh2), 4, 1, '#e8e0d0');
        R(cx2 + 1, 4 + (7 - hh2), 2, 2, '#f0e8d8');
      }
      R(0, 10, 16, 3, '#b0a184');           // price rail
      R(1, 11, 3, 1, '#c0503c'); R(7, 11, 2, 1, '#c0503c'); R(12, 11, 3, 1, '#c0503c');
      R(0, 13, 16, 3, '#4a4236');           // gap under the shelf
      break;
    }
    case 'counter': {
      R(0, 0, 16, 16, '#8a7358');
      R(0, 2, 16, 12, '#b09a7c');
      R(0, 2, 16, 2, '#cbb694'); R(0, 12, 16, 2, '#8a7358');
      if (r > 0.7) R(4, 6, 8, 1, '#9a856a');
      break;
    }
    case 'flowerbed': {
      R(0, 0, 16, 16, '#5a6b3f');
      R(0, 0, 16, 2, '#4a5a33');
      R(2, 4, 3, 3, '#3f8a44'); R(9, 7, 3, 3, '#4a9a50');
      R(3, 2, 2, 2, '#e87090'); R(10, 5, 2, 2, '#f0d050');
      R(5, 9, 2, 2, '#c86ab0'); R(12, 11, 2, 2, '#e8e0d0');
      break;
    }
    case 'sewer': {
      R(0, 0, 16, 16, '#3c4140');
      R(1, 1, 6, 6, '#454b4a'); R(9, 1, 6, 6, '#414746');
      R(1, 9, 6, 6, '#414746'); R(9, 9, 6, 6, '#484e4d');
      R(0, 7, 16, 2, '#313635');
      if (r > 0.8) R(4, 3, 3, 1, '#2b302f');
      break;
    }
    case 'sewerwall': {
      R(0, 0, 16, 16, '#2b2f2e');
      R(0, 2, 16, 5, '#383d3c'); R(0, 9, 16, 5, '#353a39');
      R(0, 2, 16, 1, '#454b4a'); R(0, 9, 16, 1, '#424847');
      R(5, 2, 1, 5, '#222625'); R(11, 9, 1, 5, '#222625');
      if (r > 0.7) R(2, 11, 2, 3, '#3f4a3a');
      break;
    }
    case 'sewerwater': {
      R(0, 0, 16, 16, '#2c4a42');
      if (r > 0.55) R(Math.floor(r2 * 10), 3 + Math.floor(r2 * 3), 5, 1, '#3a5f54');
      if (r > 0.8) R(Math.floor(r * 10), 9 + Math.floor(r2 * 4), 4, 1, '#4a7263');
      break;
    }
    case 'grate': {
      R(0, 0, 16, 16, '#2b2f2e');
      R(2, 2, 12, 12, '#5a605c');
      for (var gi2 = 0; gi2 < 4; gi2++) {
        R(3, 3 + gi2 * 3, 10, 2, '#3f4440');
        R(3, 3 + gi2 * 3, 10, 1, '#767c76');
      }
      R(2, 2, 12, 1, '#70766f');
      break;
    }
    case 'cabinet': {
      R(0, 0, 16, 16, '#cbbfa8');
      R(1, 2, 14, 11, '#8a7358'); R(2, 3, 12, 9, '#a08a6a');
      R(2, 3, 12, 1, '#b8a184');
      R(7, 6, 2, 1, '#5f5545');           // handle
      R(0, 13, 16, 3, '#b3a68e');         // wall under the cabinet
      break;
    }
    case 'window': {
      R(0, 0, 16, 16, '#cbbfa8');
      R(1, 1, 14, 12, '#6f7f8f'); R(2, 2, 12, 10, '#9fc4dc');
      R(2, 2, 5, 4, '#c8e4f4'); R(8, 7, 4, 3, '#c8e4f4');
      R(7, 2, 1, 10, '#6f7f8f'); R(2, 6, 12, 1, '#6f7f8f');
      R(1, 13, 14, 2, '#b3a68e');
      break;
    }
    case 'stove': {
      R(0, 0, 16, 16, '#6f6f78');
      R(1, 0, 14, 11, '#8a8a94');           // continuous stovetop
      R(1, 0, 14, 1, '#a0a0aa');
      var bx2 = 2 + Math.floor(hash(tx, ty, 21) * 5), by2 = 2 + Math.floor(hash(tx, ty, 22) * 3);
      R(bx2, by2, 6, 6, '#4a4a52');          // one burner per tile
      R(bx2 + 1, by2 + 1, 4, 4, '#3a3a42');
      R(bx2 + 2, by2 + 2, 2, 2, '#8a4a3c');
      R(0, 11, 16, 5, '#5a5a62');            // oven front
      R(2, 12, 12, 3, '#4a4a52');
      R(7, 12, 2, 1, '#b0b0ba');
      break;
    }
    case 'fence': {
      R(0, 0, 16, 16, '#579544');
      R(0, 5, 16, 2, '#e2dcc8'); R(0, 9, 16, 2, '#e2dcc8');
      for (var pi = 0; pi < 3; pi++) {
        var fx2 = pi * 5 + 1;
        R(fx2, 2, 3, 11, '#f0ead6'); R(fx2, 1, 1, 2, '#f0ead6'); R(fx2 + 2, 1, 1, 2, '#f0ead6');
        R(fx2, 12, 3, 1, '#c8c2ae');
      }
      break;
    }
    case 'hedge': {
      R(0, 0, 16, 16, '#24502e');
      R(0, 2, 16, 12, r > 0.5 ? '#2b6b34' : '#286331');
      R(1, 3, 14, 3, '#39803f');
      for (var hh = 0; hh < 5; hh++) {
        R(Math.floor(hash(tx, ty, hh + 2) * 14), 5 + Math.floor(hash(tx, ty, hh + 12) * 8), 2, 2,
          hash(tx, ty, hh + 30) > 0.5 ? '#347a3a' : '#1f4a26');
      }
      R(0, 13, 16, 2, '#1c4422');
      break;
    }
    case 'tree': {
      // dense canopy: one base, leaf clusters placed per tile, no tile-sized blocks
      R(0, 0, 16, 16, '#2b6234');
      R(1, 1, 14, 14, '#316c39');
      var bx = Math.floor(hash(tx >> 1, ty >> 1, 17) * 4);
      R(2 + bx, 2, 5, 4, '#3a7a42'); R(9 - bx, 5, 4, 4, '#377440');
      R(3, 8 + (bx % 2), 4, 3, '#3a7a42');
      R(6, 11, 4, 3, '#28582f');
      if (r > 0.5) R(5, 5, 2, 2, '#468c4e');
      if (r2 > 0.7) R(11, 12, 2, 2, '#28582f');
      break;
    }
    case 'roof': {
      var top = hash(tx, ty - 1, 5) > 0.5;
      R(0, 0, 16, 16, r > 0.5 ? '#a04a3a' : '#97453a');
      R(0, 0, 16, 2, '#b85645');
      R(0, 4, 16, 1, '#7e382c'); R(0, 9, 16, 1, '#7e382c'); R(0, 13, 16, 1, '#7e382c');
      R(3, 5, 1, 4, '#8a3e30'); R(8, 5, 1, 4, '#8a3e30'); R(13, 10, 1, 3, '#8a3e30'); R(5, 10, 1, 3, '#8a3e30');
      break;
    }
    case 'house': {
      R(0, 0, 16, 16, r > 0.5 ? '#d6bc90' : '#cfb489');
      R(0, 0, 16, 2, '#8a6a42');
      R(0, 0, 2, 16, '#8a6a42'); R(14, 0, 2, 16, '#8a6a42');
      R(0, 7, 16, 2, '#8a6a42');
      if (r2 > 0.55) { // window
        R(4, 2, 6, 5, '#5d7f9e'); R(5, 3, 4, 3, '#a9cbe2'); R(6, 3, 1, 3, '#5d7f9e');
      } else { R(4, 2, 6, 5, '#c8ab7e'); }
      break;
    }
    case 'door': {
      R(0, 0, 16, 16, '#d6bc90');
      R(3, 1, 10, 15, '#6d4c2b'); R(4, 2, 8, 13, '#8a6a3a');
      R(5, 3, 6, 5, '#966f3d'); R(10, 9, 2, 2, '#e0c060');
      R(0, 0, 16, 1, '#a3927a');
      break;
    }
    case 'fountain': {
      R(0, 0, 16, 16, '#9a968e');
      R(1, 1, 14, 14, '#c9c4ba');
      R(3, 3, 10, 10, '#8f8b83');
      R(4, 4, 8, 8, '#7a766f');
      R(2, 2, 12, 1, '#ded9cf');
      break;
    }
    case 'dam': {
      // two thick logs per tile. Cut ends only where the pile actually ends,
      // otherwise every tile repeats a bright oval and it reads as brickwork.
      R(0, 0, 16, 16, '#3a2712');
      var leftEnd = !grid || !grid[ty] || grid[ty][tx - 1] !== 'dam';
      var rightEnd = !grid || !grid[ty] || grid[ty][tx + 1] !== 'dam';
      for (var row = 0; row < 2; row++) {
        var ly = row * 8;
        var lc = ['#96733f', '#9d7a45', '#8d6b3a'][Math.floor(hash(tx, ty, row + 60) * 3)];
        R(0, ly + 1, 16, 6, lc);
        R(0, ly + 1, 16, 1, '#b08a52');
        R(0, ly + 6, 16, 1, '#54391d');
        R(0, ly + 7, 16, 1, '#2e1f0e');
        // grain, broken up so neighbouring logs do not line up
        if (hash(tx, ty, row + 130) > 0.45) R(2, ly + 3, 6, 1, 'rgba(88,58,28,0.40)');
        if (hash(tx, ty, row + 170) > 0.65) R(8, ly + 4, 5, 1, 'rgba(88,58,28,0.30)');
        if (leftEnd) { R(0, ly + 1, 4, 6, '#c9a066'); R(1, ly + 2, 2, 4, '#dcb87e'); R(2, ly + 3, 1, 1, '#a8804a'); }
        if (rightEnd) { R(12, ly + 1, 4, 6, '#c9a066'); R(13, ly + 2, 2, 4, '#dcb87e'); R(13, ly + 4, 1, 1, '#a8804a'); }
      }
      if (r > 0.80) R(5, 3, 3, 2, 'rgba(60,40,20,0.45)');
      if (r2 > 0.88) R(12, 11, 2, 2, 'rgba(60,40,20,0.40)');
      break;
    }
  }
}

function renderSceneCanvas(id) {
  var cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  var c = cv.getContext('2d');
  var grid = G.grid;
  for (var y = 0; y < VH; y++) for (var x = 0; x < VW; x++) paintTile(c, grid[y][x], x, y, grid);
  // baked lighting or any static art on top of the tiles
  var s = SCENES[id];
  if (s && s.overlay) s.overlay(c);
  return cv;
}

function solidAt(px, py) {
  var tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
  if (!X_OK(tx, ty)) return true;
  return G.solidGrid[ty][tx];
}

// ------------------------------------------------------------------- props

function drawPropEntity(c, e) {
  for (var hi = 0; hi < PROP_HOOKS.length; hi++) {
    if (PROP_HOOKS[hi](c, e)) return;
  }
  var s = 1, x = e.px - 8, y = e.py - 16;
  function R(px, py, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x + px), Math.round(y + py), w, h); }
  switch (e.kind) {
    case 'mailbox':
      R(7, 8, 2, 8, '#7a5a3a'); R(2, 2, 12, 7, '#c8452f'); R(3, 0, 10, 3, '#d85a3f');
      R(10, 3, 3, 4, '#8a2a1e'); R(3, 4, 2, 2, '#e8e8e8');
      break;
    case 'sprinkler':
      R(6, 10, 4, 6, '#5a8a5a'); R(5, 6, 6, 4, '#7aa87a'); R(7, 3, 2, 3, '#9ac89a');
      R(1, 1, 1, 1, '#a8d8f0'); R(13, 2, 1, 1, '#a8d8f0');
      break;
    case 'sign':
      R(7, 8, 2, 8, '#8a6a3a'); R(1, 2, 14, 7, '#c8a06a'); R(2, 3, 12, 5, '#e0c090');
      R(3, 5, 9, 1, '#8a6a3a'); R(3, 7, 6, 1, '#8a6a3a');
      break;
    case 'fish':
      R(4, 10, 7, 4, '#e08830'); R(3, 11, 2, 2, '#f0a050'); R(11, 10, 2, 2, '#f0a050');
      R(6, 11, 1, 1, '#2b2b2b'); R(8, 10, 4, 1, '#c87018');
      break;
    case 'sticks':
      R(1, 10, 14, 2, '#8a6a3a'); R(3, 7, 11, 2, '#9a7a48'); R(5, 4, 8, 2, '#8a6a3a');
      R(7, 2, 4, 2, '#a08050');
      break;
    case 'junk': {
      // each piece of dam junk has its own look
      R(0, 6, 16, 10, '#7d5f34');
      R(1, 8, 6, 2, '#8f6d3c'); R(7, 12, 7, 2, '#6a4c28'); R(2, 3, 5, 3, '#8f6d3c');
      if (e.item === 'toupee') {
        R(4, 0, 9, 5, '#d8b24a'); R(2, 1, 3, 4, '#c9a244'); R(12, 1, 3, 4, '#c9a244');
        R(5, 1, 4, 1, '#e8c866'); R(4, 4, 8, 1, '#b8913a');
      } else if (e.item === 'mail') {
        R(3, 0, 10, 8, '#a8783f'); R(4, 1, 8, 6, '#c08a4a');
        R(5, 2, 6, 4, '#f0e8d8'); R(6, 3, 4, 1, '#a08a6a'); R(6, 4, 3, 1, '#a08a6a');
      } else if (e.item === 'glasses') {
        R(3, 1, 4, 4, '#3a2a1a'); R(4, 2, 2, 2, '#a8d8e8');
        R(9, 1, 4, 4, '#3a2a1a'); R(10, 2, 2, 2, '#a8d8e8');
        R(7, 2, 2, 1, '#3a2a1a');
      } else if (e.item === 'float') {
        R(1, 2, 14, 5, '#f07a9a'); R(2, 1, 10, 6, '#ff92ae');
        R(11, 0, 4, 3, '#f07a9a'); R(12, 0, 1, 2, '#ffffff');
        R(4, 3, 2, 1, '#ffc8d8'); R(8, 3, 2, 1, '#ffc8d8');
      }
      break;
    }
    case 'fountainBig': {
      // 5x4 tile stone basin, dry, with a small duck statue on a pedestal
      var fx = e.tx * 16, fy = e.ty * 16;
      function F(px2, py2, w2, h2, c) { ctx.fillStyle = c; ctx.fillRect(fx + px2, fy + py2, w2, h2); }
      ctx.fillStyle = 'rgba(0,0,0,0.20)';
      ctx.beginPath(); ctx.ellipse(fx + 40, fy + 57, 32, 5, 0, 0, Math.PI * 2); ctx.fill();
      F(12, 50, 56, 6, '#6f767e');              // base
      F(8, 30, 64, 22, '#8b939c');              // basin body
      F(4, 34, 72, 14, '#8b939c');
      F(6, 33, 68, 14, '#a2aab3');              // rim top face
      F(6, 33, 68, 2, '#c2cad3');               // rim highlight
      F(12, 37, 56, 12, '#565e66');             // inner wall
      F(15, 39, 50, 8, '#41474e');              // dry floor
      F(20, 41, 8, 2, '#4e555c'); F(38, 43, 10, 2, '#4e555c');
      F(30, 45, 2, 2, '#c8a44a'); F(44, 40, 2, 2, '#c8a44a');  // old coins in the bottom
      F(37, 16, 6, 18, '#b0b8c1');              // pedestal
      F(36, 15, 8, 2, '#c8d0d8');
      F(34, 31, 12, 3, '#8b939c');
      F(35, 8, 10, 8, '#e6d64e');               // duck statue
      F(44, 11, 3, 3, '#e08820');
      F(36, 10, 1, 2, '#2f2f2f');
      F(34, 6, 12, 2, '#8b939c');               // little sill above
      F(39, 5, 2, 2, '#a8d8f0');                // dry spout
      break;
    }
    case 'lamp': {
      R(7, 2, 2, 2, '#e8d888'); R(6, 0, 4, 2, '#8a8272');
      R(6, 4, 4, 4, '#b8a862'); R(5, 3, 6, 1, '#d8c870');
      R(7, 8, 2, 7, '#5a544a'); R(6, 15, 4, 1, '#4a453d');
      break;
    }
    case 'bench': {
      R(1, 6, 14, 3, '#a07a4a'); R(1, 5, 14, 1, '#b88c58');
      R(1, 9, 14, 2, '#95703f'); R(2, 11, 2, 4, '#6d5130'); R(12, 11, 2, 4, '#6d5130');
      break;
    }
    case 'bush': {
      R(2, 6, 12, 9, '#2f6b36'); R(1, 8, 14, 6, '#2f6b36');
      R(3, 4, 10, 7, '#377b3e'); R(4, 5, 7, 4, '#3f8a46');
      R(6, 3, 5, 6, '#377b3e'); R(9, 8, 4, 4, '#2a5e31');
      R(5, 6, 2, 2, '#4a9a52');
      break;
    }
    case 'log': {
      R(0, 9, 16, 7, '#7d5a30'); R(0, 9, 16, 2, '#96733f'); R(0, 14, 16, 2, '#5f4526');
      R(13, 8, 3, 8, '#c39a5c'); R(14, 10, 1, 4, '#d9b478');
      R(3, 10, 1, 5, '#6a4c28'); R(8, 11, 1, 4, '#6a4c28');
      break;
    }
    case 'stump': {
      R(4, 8, 9, 7, '#7d5a30'); R(4, 11, 9, 4, '#6a4c28');
      R(4, 6, 9, 3, '#c39a5c'); R(6, 7, 5, 2, '#a8804a'); R(7, 7, 3, 1, '#8a6534');
      break;
    }
    case 'planter': {
      R(1, 7, 14, 8, '#a8784a'); R(2, 6, 12, 2, '#c08a54'); R(1, 14, 14, 1, '#8a6038');
      R(3, 2, 4, 5, '#3f8a44'); R(9, 1, 4, 6, '#4a9a50'); R(6, 3, 3, 4, '#368040');
      R(4, 1, 2, 2, '#e87090'); R(10, 0, 2, 2, '#f0d050');
      break;
    }
    case 'catapult': {
      // empty catapult frame, no lever, a small scorch mark
      R(0, 12, 16, 2, '#5a4a34');
      R(1, 6, 3, 8, '#8a6a3a'); R(12, 6, 3, 8, '#8a6a3a');
      R(1, 5, 14, 2, '#a07c47'); R(5, 8, 6, 2, '#96733f');
      R(8, 4, 2, 3, '#c0503c'); R(9, 2, 1, 2, '#e0d060');
      R(6, 13, 4, 1, '#3a2a1a');
      break;
    }
    case 'topiary': {
      R(3, 4, 10, 10, '#2f6b36'); R(2, 6, 12, 7, '#347a3c');
      R(4, 2, 8, 8, '#3a8544'); R(5, 3, 5, 4, '#469a4e');
      R(6, 9, 4, 4, '#2a5e31'); R(7, 12, 2, 3, '#6a4c28');
      R(10, 6, 2, 2, '#3a8544');
      break;
    }
    case 'pot': {
      R(2, 5, 12, 9, '#8a8a94'); R(1, 4, 14, 2, '#b0b0ba');
      R(3, 7, 10, 2, '#6f6f78');
      R(4, 3, 8, 2, '#d8d8e0');
      if (e.steam) { R(5, 0, 2, 3, '#e8e8f0'); R(9, 0, 2, 3, '#e8e8f0'); }
      break;
    }
    case 'sink': {
      R(2, 4, 12, 8, '#c8ccd4'); R(4, 6, 8, 4, '#8a9098');
      R(7, 1, 2, 4, '#9aa0a8'); R(6, 0, 4, 2, '#c8ccd4');
      break;
    }
    case 'fridge': {
      R(2, 0, 12, 16, '#e2e6ea'); R(3, 1, 10, 6, '#eef2f6');
      R(3, 8, 10, 7, '#eef2f6'); R(11, 3, 1, 3, '#9aa0a8'); R(11, 10, 1, 3, '#9aa0a8');
      R(4, 9, 3, 2, '#e8d060');
      break;
    }
    case 'can': {
      var ccol = e.canColor || '#c8452f';
      R(3, 2, 10, 12, ccol);
      R(3, 2, 10, 2, '#d8d2c4');
      R(3, 12, 10, 2, '#9a9488');
      R(5, 6, 6, 4, '#f0e8d8');
      R(6, 7, 4, 1, '#8a8272'); R(6, 9, 3, 1, '#8a8272');
      break;
    }
    case 'cart': {
      R(1, 4, 14, 9, '#a8acb4'); R(2, 5, 12, 7, '#c0c4cc');
      R(1, 4, 14, 1, '#d0d4dc');
      for (var gi = 0; gi < 4; gi++) { R(3 + gi * 3, 5, 1, 7, '#9aa0a8'); }
      R(0, 2, 14, 2, '#8a9098'); R(12, 2, 3, 2, '#6f757d');
      R(3, 13, 2, 2, '#3a3a42'); R(11, 13, 2, 2, '#3a3a42');
      break;
    }
    case 'twig': {
      R(2, 10, 12, 2, '#8a6a3a'); R(5, 7, 2, 4, '#96733f');
      R(7, 6, 5, 2, '#a07c47'); R(6, 4, 2, 3, '#a07c47');
      R(10, 4, 3, 2, '#6a8a3a'); R(9, 2, 2, 2, '#7a9a44');
      break;
    }
    case 'wheel': {
      R(1, 3, 14, 12, '#b8bcc4');
      R(3, 5, 10, 8, '#7d828a');
      for (var si = 0; si < 4; si++) R(2 + si * 3, 9, 1, 6, '#d0d4da');
      R(6, 8, 4, 4, '#c8a878');
      break;
    }
    case 'debris': {
      R(2, 6, 12, 4, '#96733f'); R(4, 4, 8, 2, '#a88450');
      R(9, 2, 3, 3, '#c8452f');
      break;
    }
    case 'lemonade': {
      var lx = e.tx * 16, ly = e.ty * 16;
      function L(px2, py2, w2, h2, c) { ctx.fillStyle = c; ctx.fillRect(lx + px2, ly + py2, w2, h2); }
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath(); ctx.ellipse(lx + 32, ly + 31, 29, 4, 0, 0, Math.PI * 2); ctx.fill();
      // crate
      L(4, 10, 56, 22, '#9a7642');
      L(4, 10, 56, 2, '#b08a52');
      L(6, 12, 5, 20, '#866536'); L(24, 12, 5, 20, '#866536'); L(42, 12, 5, 20, '#866536');
      L(4, 30, 56, 2, '#6f5228');
      // counter top with a cloth over it
      L(2, 5, 60, 7, '#e8e0cc');
      L(2, 5, 60, 2, '#f6f0e0');
      L(2, 10, 60, 2, '#cfc6ae');
      for (var st2 = 0; st2 < 8; st2++) L(4 + st2 * 7, 11, 3, 2, '#c8452f');
      // pitcher and cups
      L(21, 0, 9, 6, '#e8d24a');
      L(22, -2, 7, 3, '#f4e06a');
      L(23, 2, 5, 2, '#fff3a0');
      L(34, 2, 5, 4, '#eeeeee'); L(41, 2, 5, 4, '#eeeeee');
      L(34, 2, 5, 1, '#ffffff'); L(41, 2, 5, 1, '#ffffff');
      // taped sign on the crate face
      L(11, 15, 42, 11, '#c9bfa6');
      L(12, 16, 40, 9, '#f7f2e4');
      L(14, 18, 15, 1, '#7a6a52'); L(14, 20, 11, 1, '#7a6a52');
      L(14, 22, 17, 1, '#9a8a70');
      // price tag
      L(40, 16, 10, 9, '#c8452f');
      L(42, 18, 2, 5, '#ffffff');
      L(44, 18, 1, 1, '#ffffff'); L(45, 19, 1, 4, '#ffffff'); L(44, 23, 3, 1, '#ffffff');
      break;
    }
    case 'booth': {
      var bx3 = e.tx * 16, by3 = e.ty * 16;
      function B(px2, py2, w2, h2, c) { ctx.fillStyle = c; ctx.fillRect(bx3 + px2, by3 + py2, w2, h2); }
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath(); ctx.ellipse(bx3 + 40, by3 + 62, 36, 4, 0, 0, Math.PI * 2); ctx.fill();
      B(2, 12, 76, 50, '#e2d84a');                 // body
      B(4, 14, 72, 46, '#f0e86a');
      for (var pi2 = 0; pi2 < 5; pi2++) B(3 + pi2 * 15, 18, 1, 40, '#cfc53a');
      B(0, 0, 80, 12, '#c8452f');                  // awning
      for (var ai = 0; ai < 7; ai++) B(ai * 12, 0, 6, 12, '#f2f2f2');
      B(0, 11, 80, 2, '#a83a28');
      for (var li = 0; li < 7; li++) {
        var on = Math.sin(G.time * 6 + li * 1.1) > 0;
        B(4 + li * 11, 13, 3, 3, on ? '#fffbe0' : '#b8a850');
      }
      B(6, 24, 68, 12, '#2a2a34');                 // sign band
      B(10, 27, 26, 2, '#7ce8f0'); B(10, 31, 38, 2, '#f0e0a0');
      B(52, 27, 16, 5, '#ff5a8a');
      B(2, 50, 76, 10, '#8a7a3a');                 // counter
      B(2, 50, 76, 2, '#b0a05a');
      B(10, 42, 9, 8, '#f4e06a'); B(60, 42, 9, 8, '#f4e06a');
      B(38, 44, 8, 6, '#f4e06a');
      // propeller hats hanging under the awning
      for (var hi = 0; hi < 3; hi++) {
        var ang = G.time * 9 + hi;
        B(16 + hi * 18, 20 + Math.round(Math.sin(ang)), 7, 2, '#d84a6a');
        B(18 + hi * 18, 18, 3, 3, '#8ad0f0');
      }
      break;
    }
    case 'picket': {
      R(3, 2, 10, 2, '#e8e0d0'); R(4, 4, 8, 5, '#f0e8d8');
      R(5, 5, 6, 1, '#a03a2a'); R(5, 7, 4, 1, '#a03a2a');
      R(7, 9, 2, 4, '#8a6a3a');
      break;
    }
    case 'propeller': {
      var sp = Math.sin(G.time * 14 + e.tx) * 3;
      R(3, 8, 10, 6, '#d84a6a'); R(4, 9, 8, 4, '#f06a8a');   // shirt
      R(4, 13, 3, 3, '#4a6fb0'); R(9, 13, 3, 3, '#4a6fb0');  // legs
      R(4, 3, 8, 6, '#f2c69b');                              // head
      R(3, 2, 10, 2, '#4a8fd6');                             // hat
      ctx.fillStyle = '#e8d04a';
      ctx.fillRect(Math.round(e.px - 5 + sp), Math.round(e.py - 24), 10, 2);
      ctx.fillStyle = '#c8a83a';
      ctx.fillRect(Math.round(e.px - 1), Math.round(e.py - 25), 2, 4);
      R(6, 5, 1, 1, '#2b2b2b'); R(9, 5, 1, 1, '#2b2b2b');
      break;
    }
    case 'pitcher': {
      R(4, 4, 8, 11, '#cfe8f4'); R(5, 5, 6, 9, '#e8d24a');
      R(4, 3, 8, 2, '#e8f4fa'); R(11, 6, 2, 4, '#cfe8f4');
      R(6, 7, 3, 1, '#fff6c0');
      break;
    }
    case 'ball': {
      R(4, 6, 9, 9, '#f0f0f0'); R(5, 7, 3, 3, '#2b2b2b');
      R(9, 11, 2, 2, '#2b2b2b'); R(6, 12, 2, 2, '#d8d8d8');
      break;
    }
    case 'fountainTop': break;
  }
}

function drawEnt(c, e) {
  if (e.exit) return;
  if (e.who && e.who !== 'sign') {
    var sc = e.small ? 0.7 : 1;
    var f = 0;
    // a moving NPC uses its walk sheet; everyone else breathes on the idle sheet
    var walking = e.moving && ART.walk[e.who];
    var sheet = walking ? ART.walk[e.who] : ART.overrides[e.who];
    var ic2 = sheet ? sheet.cols : 1;
    if (ic2 > 1) f = Math.floor((G.time * (walking ? 8 : 3) + e.tx * 0.7 + e.ty * 0.3) % ic2);
    else {
      var dx = e.px - G.px, dy = e.py - G.py;
      if (Math.abs(dx) + Math.abs(dy) < 64) f = Math.floor((G.time * 2 + e.tx) % 2);
    }
    drawChar(c, e.who, e.dir || 'down', f, e.px - 8 * sc, e.py - 16 * sc, sc, walking ? 'walk' : 'idle');
  } else if (e.who === 'sign') {
    drawPropEntity(c, Object.assign({}, e, { kind: 'sign' }));
  } else if (e.kind) {
    if (e.kind === 'fountainBig') { drawPropEntity(c, e); return; }
    var ps = e.propScale || (e.can ? 2.3 : (e.kind === 'pot' || e.kind === 'sink' || e.kind === 'wheel') ? 2.2 : 1.75);
    if (e.can) {   // interactive items get a little bob and shine
      var bobb = Math.sin(G.time * 4 + e.tx) * 1.5;
      c.save();
      c.globalAlpha = 0.4 + 0.3 * Math.sin(G.time * 5 + e.tx);
      c.fillStyle = '#fff6c0';
      c.beginPath(); c.arc(e.px, e.py - 22 + bobb, 3, 0, Math.PI * 2); c.fill();
      c.restore();
      c.save();
      c.translate(e.px, e.py + bobb);
      c.scale(ps, ps);
      c.translate(-e.px, -e.py);
      drawPropEntity(c, e);
      c.restore();
      return;
    }
    c.save();
    c.translate(e.px, e.py);
    c.scale(ps, ps);
    c.translate(-e.px, -e.py);
    drawPropEntity(c, e);
    c.restore();
  }
}

// --------------------------------------------------------------- game flow

// a chapter ends here: mark it read, then fall through to the credits scroll
function enterCredits(kind) {
  if (G.chapter && CHAPTERS[G.chapter]) markChapterDone(G.chapter);
  G.mode = 'credits';
  G.creditsY = H;
  G.fadeTarget = 1; G.fadeDelay = 0;
  if (kind) G.creditsKind = kind;
}

// a story chapter ends here: fade back to the bedroom and open the book again
function finishChapter(n, quiet) {
  if (n && CHAPTERS[n]) markChapterDone(n);
  G.fadeTarget = 1; G.fadeDelay = quiet ? 0.2 : 0.8;
  G.pending = function () {
    goBedroom();
    openBook();
    BOOK.sel = Math.min(CHAPTER_COUNT, (n || 0) + 1);
  };
}

function toast(t) { G.toast = t; G.toastT = 1.6; }

function saveKey(level) { return 'maverick_save_' + (level || G.level); }

function saveGame() {
  try {
    localStorage.setItem(saveKey(), JSON.stringify({
      level: G.level, scene: G.sceneId, flags: G.flags,
      tx: Math.floor(G.px / TILE), ty: Math.floor(G.py / TILE)
    }));
  } catch (e) {}
}
function loadSave(level) {
  level = level || G.level;
  try {
    var d = JSON.parse(localStorage.getItem(saveKey(level)) || 'null');
    if (d) return d;
    if (level === 'dam') return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    return null;
  } catch (e) { return null; }
}

function startGame(level) {
  G.level = level || LEVEL_ORDER[titleSel] || 'dam';
  var sv = loadSave(G.level);
  G.mode = 'play';
  SFX.init(); SFX.startMusic();
  G.charge = 0; G.chargeMode = false; G.companion = null; G.shake = 0; G.flash = 0;

  if (sv && sv.flags && sv.flags.started) {
    G.flags = sv.flags; G.flags.started = true;
    loadScene(sv.scene, sv.tx, sv.ty, 'down');
    toast('picking up where you left off');
    if (G.level === 'beans') SCRIPT.resumeBeans();
    if (G.level === 'lemonade' && SCRIPT.resume3) SCRIPT.resume3();
    return;
  }

  G.flags = { started: true };
  if (G.level === 'lemonade') {
    loadScene('stand', SCENES.stand.spawn.tx, SCENES.stand.spawn.ty, 'down');
    setTimeout(function () { SCRIPT.intro3(); }, 400);
  } else if (G.level === 'beans') {
    loadScene('yard2', SCENES.yard2.spawn.tx, SCENES.yard2.spawn.ty, 'down');
    setTimeout(function () { SCRIPT.beansIntro(); }, 400);
  } else {
    loadScene('yard', SCENES.yard.spawn.tx, SCENES.yard.spawn.ty, 'down');
    setTimeout(function () {
      say([
        { who: 'narrator', text: "It's a normal Saturday in Pickle Creek. Birds. Sun. Somewhere, a lawnmower." },
        { who: 'narrator', text: "Then the sprinkler stops mid-spray. Then the fountain in town stops. Then, faintly, a duck sounds upset." },
        { who: 'maverick', text: "Huh." },
        { who: 'narrator', text: "[WASD or arrows to walk. E or tap to look, talk, and grab.]" }
      ]);
    }, 400);
  }
}

function loadScene(id, tx, ty, dir) {
  G.sceneId = id;
  buildScene(id);
  G.px = tx * TILE + TILE / 2;
  G.py = ty * TILE + TILE - 1;
  G.dir = dir || 'down';
  G.banner = 2.6;
  G.bannerText = SCENES[id].title;
  saveGame();
  if (id !== 'storm') { G.holdMode = null; G.charge = 0; }
  if (id === 'storm' && !G.flags.stormStarted) {
    G.flags.stormStarted = true;
    setTimeout(function () { if (G.sceneId === 'storm') SCRIPT.stormIntro(); }, 700);
  }
}

function itemCount() {
  var n = 0;
  ['toupee', 'mail', 'glasses', 'gnome', 'float'].forEach(function (k) { if (G.flags['t_' + k]) n++; });
  return n;
}
G.itemCount = itemCount;

G.pullItem = function (id) {
  G.flags['t_' + id] = true;
  G.ents = G.ents.filter(function (e) { return e.item !== id; });
  SFX.pickup();
  for (var i = 0; i < 14; i++) {
    G.splash.push({
      x: G.px, y: G.py - 8,
      vx: (Math.random() - 0.5) * 90, vy: -Math.random() * 120 - 20,
      life: 0.6 + Math.random() * 0.4,
      c: ['#9ac8f0', '#6fa8e0', '#e0e0e0'][Math.floor(Math.random() * 3)]
    });
  }
  saveGame();
};

G.startEnding = function () {
  G.fadeTarget = 1; G.fadeDelay = 0.6;
  G.pending = function () {
    buildScene('ending');
    G.sceneId = 'ending';
    G.toast = ''; G.toastT = 0;
    G.px = SCENES.ending.spawn.tx * TILE + 8;
    G.py = SCENES.ending.spawn.ty * TILE + 15;
    G.dir = 'down';
    G.banner = 3; G.bannerText = SCENES.ending.title;
    G.fadeTarget = 0; G.fadeDelay = 0;
    SFX.fanfare();
    setTimeout(function () {
      say([
        { who: 'narrator', text: "Two days later, Pickle Creek has a brand new swimming hole." },
        { who: 'narrator', text: "It is the correct size. It is in the correct place. The paperwork is laminated." },
        { who: 'mayor', text: "CITIZENS! I declare this the best dam day in the history of Pickle Creek." },
        { who: 'bucktooth', text: "He said dam." },
        { who: 'maverick', text: "He did." },
        { who: 'bucktooth', text: "I'm going to remember this forever." },
        { who: 'narrator', text: "The mayor is wearing his toupee again. Bucktooth is wearing the flamingo. Nobody mentions either." },
        { who: 'gnome', text: "I have been appointed lifeguard. I cannot swim. I will be watching." }
      ], function () { enterCredits('dam'); });
    }, 2600);
  };
};

function nearestThing() {
  var best = null, bd = Infinity;
  for (var i = 0; i < G.ents.length; i++) {
    var e = G.ents[i];
    if (e.exit || !e.talk) continue;
    var lim = e.reach || 34;              // big furniture can be talked to from further away
    var d = Math.hypot(e.px - G.px, (e.py - 10) - (G.py - 10));
    if (d < lim && d < bd) { bd = d; best = e; }
  }
  return best;
}

// ---------------------------------------------------------------- movement

function movePlayer(dt) {
  if (G.perform) return;          // a minigame owns the controls
  var inp = inputDir();
  var spd = 74 * (G.speedMul || 1);
  var wasMoving = false;
  if (inp.dx || inp.dy) {
    if (Math.abs(inp.dx) >= Math.abs(inp.dy)) G.dir = inp.dx > 0 ? 'right' : 'left';
    else G.dir = inp.dy > 0 ? 'down' : 'up';
    var nx = G.px + inp.dx * spd * dt;
    var ny = G.py + inp.dy * spd * dt;
    // horizontal
    if (!blocked(nx, G.py)) G.px = nx; else { G.px += inp.dx * 0.1; }
    if (!blocked(G.px, ny)) G.py = ny; else { G.py += inp.dy * 0.1; }
    G.px = clamp(G.px, 8, W - 8); G.py = clamp(G.py, 10, H - 4);
    wasMoving = true;
  }
  G.moving = wasMoving;
  if (wasMoving) {
    G.animT += dt;
    var cols = walkCols('maverick');
    G.frame = cols > 1 ? Math.floor(G.animT * 12) % cols : Math.floor(G.animT * 8) % 2;
  } else {
    // breathing idle: slow cycle through the idle sheet's frames
    G.idleT = (G.idleT || 0) + dt;
    var ic = ART.overrides.maverick ? ART.overrides.maverick.cols : 1;
    G.frame = ic > 1 ? Math.floor(G.idleT * 3) % ic : 0;
  }
}

function blocked(x, y) {
  var hw = 5, hh = 3;
  var pts = [[x - hw, y - hh], [x + hw, y - hh], [x - hw, y - 1], [x + hw, y - 1], [x, y - hh]];
  for (var i = 0; i < pts.length; i++) if (solidAt(pts[i][0], pts[i][1])) return true;
  return false;
}

function checkExits() {
  if (G.pending) return;              // already fading to another scene, do not re-arm
  for (var i = 0; i < G.ents.length; i++) {
    var e = G.ents[i];
    if (!e.exit) continue;
    var r = e.rect || { w: 1, h: 1 };
    var ex = e.tx * TILE, ey = e.ty * TILE, ew = r.w * TILE, eh = r.h * TILE;
    if (G.px > ex - 4 && G.px < ex + ew + 4 && G.py > ey - 4 && G.py < ey + eh + 4) {
      var t = e.exit;
      G.fadeTarget = 1; G.fadeDelay = 0.18;
      G.pending = function () {
        loadScene(t.to, t.tx, t.ty, t.dir);
        G.fadeTarget = 0;
      };
      return;
    }
  }
}

// ------------------------------------------------------------------ update

function update(dt) {
  G.time += dt;
  if (G.toastT > 0) G.toastT -= dt;
  if (G.banner > 0) G.banner -= dt;
  if (G.card) { G.card.t -= dt; if (G.card.t <= 0) G.card = null; }

  // splash particles
  for (var i = G.splash.length - 1; i >= 0; i--) {
    var p = G.splash[i];
    p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt;
    if (p.life <= 0) G.splash.splice(i, 1);
  }

  if (G.pending && G.fade > 0.99) {
    // fade finished: run the queued transition once the delay expires
    if (G.fadeDelay > 0) G.fadeDelay -= dt;
    else { var fn = G.pending; G.pending = null; fn(); }
  } else if (G.fade !== G.fadeTarget) {
    var sp = 4;
    if (G.fade < G.fadeTarget) G.fade = Math.min(G.fadeTarget, G.fade + sp * dt);
    else G.fade = Math.max(G.fadeTarget, G.fade - sp * dt);
  }

  if (G.mode === 'credits') { G.creditsY -= 22 * dt; return; }
  if (G.mode === 'book') return;
  if (G.mode !== 'play') return;

  if (G.flash > 0) G.flash = Math.max(0, G.flash - dt * 2.2);
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 2.0);

  updateDialogue(dt);
  if (DLG.active) return;

  updateCompanion(dt);
  updateHold(dt);
  updateChase(dt);
  if (G.cartT > 0) G.cartT = Math.max(0, G.cartT - dt);
  movePlayer(dt);
  checkExits();
  for (var ti = 0; ti < TICK_HOOKS.length; ti++) TICK_HOOKS[ti](dt);
  if (typeof FX !== 'undefined') FX.tick(dt);
}

// ----------------------------------------------------- episode three mechanics

G.toScene = function (id, tx, ty, dir) {
  G.fadeTarget = 1; G.fadeDelay = 0.15;
  G.pending = function () {
    loadScene(id, tx, ty, dir || 'down');
    G.fadeTarget = 0; G.fadeDelay = 0;
  };
};

G.doCartwheel = function () {
  G.cartT = 0.9;
  G.flags.distractedUntil = G.time + 6;
  SFX.blip(520, 0.08);
  for (var i = 0; i < 8; i++) {
    G.splash.push({
      x: G.px + (Math.random() - 0.5) * 12, y: G.py - 2,
      vx: (Math.random() - 0.5) * 40, vy: -Math.random() * 30,
      life: 0.4 + Math.random() * 0.3, c: '#d8cdb0'
    });
  }
  toast('cartwheel!');
};

G.distracted = function () { return (G.flags.distractedUntil || 0) > G.time; };

G.showBuckley = function () {
  G.flags.seen_buckley1 = true;
  if (G.sceneId === 'rival') buildScene('rival');   // the turtle walks in
  toast('someone is sobbing at the stand');
};

G.beginChase = function () {
  G.chaseT = 0;
  G.toScene('chase', 8, 11, 'right');
};

G.buckleyReads = function () {
  say([
    { who: 'narrator', text: "Buckley turns and begins to speed-waddle away. About fifty feet out, he stops." },
    { who: 'narrator', text: "He squints at a small sign by the park exit." },
    { who: 'buckley', text: "Let's see... the sign says 'Park Closes at 8:00 PM'..." },
    { who: 'buckley', text: "Oh no, I'm late for my favorite show!" },
    { who: 'narrator', text: "Maverick freezes." },
    { who: 'maverick', text: "Wait. Did he just read that sign? From fifty feet away?" },
    { who: 'bucktooth_puppet', text: "The little scoundrel!" },
    { who: 'maverick', text: "HEY! GET BACK HERE!" }
  ], function () { G.beginChase(); });
};

G.sewerEnding = function () {
  G.toScene('sewer', 8, 11, 'right');
  setTimeout(function () {
    if (G.sceneId === 'sewer') SCRIPT.buckleySewer();
  }, 900);
};

// a runner that keeps away from the player until caught
function updateChase(dt) {
  if (G.sceneId !== 'chase' || DLG.active) return;
  var r = G.ents.filter(function (e) { return e.run; })[0];
  if (!r) return;
  G.chaseT += dt;
  var dx = r.px - G.px, dy = r.py - G.py;
  var d = Math.hypot(dx, dy) || 1;
  if (d < 16) {                       // caught
    r.run = false;
    SFX.blip(700, 0.12);
    SCRIPT.buckleyCaught();
    return;
  }
  var spd = 62;                        // slower than the player, so it is catchable
  var ax = dx / d, ay = dy / d;
  var nx = r.px + ax * spd * dt, ny = r.py + ay * spd * dt;
  // keep him on the path band and inside the park
  nx = Math.max(40, Math.min(W - 40, nx));
  ny = Math.max(150, Math.min(200, ny));
  r.px = nx; r.py = ny;
  r.dir = Math.abs(ax) > Math.abs(ay) ? (ax > 0 ? 'right' : 'left') : (ay > 0 ? 'down' : 'up');
  r.frame = Math.floor(G.time * 10) % 2;
}

// ------------------------------------------------------- episode two mechanics

G.spawnCompanion = function () {
  G.companion = { who: 'bucktooth', x: G.px - 26, y: G.py, t: 0, dir: 'down' };
};

function updateCompanion(dt) {
  var c = G.companion;
  if (!c) return;
  c.t += dt;
  var tx, ty;
  if (G.dir === 'left') { tx = G.px + 24; ty = G.py - 6; }
  else if (G.dir === 'right') { tx = G.px - 24; ty = G.py - 6; }
  else if (G.dir === 'down') { tx = G.px - 20; ty = G.py - 30; }
  else { tx = G.px + 20; ty = G.py + 12; }
  c.x += (tx - c.x) * Math.min(1, dt * 4.5);
  c.y += (ty - c.y) * Math.min(1, dt * 4.5);
  c.dir = G.dir;
}

G.beginEating = function () {
  G.holdMode = 'eat';
  G.charge = 0;
  G.flags.bites = G.flags.bites || 0;
  toast('hold E to eat');
};

G.biteEaten = function () {
  G.flags.bites = (G.flags.bites || 0) + 1;
  SFX.blip(300, 0.1);
  var n = G.flags.bites;
  var lines = {
    1: [{ who: 'narrator', text: "Bite one. It tastes like responsibility." }],
    2: [{ who: 'narrator', text: "Bite two. Something in your chest starts to hum." }],
    3: [{ who: 'bucktooth', text: "YES. I can feel it from here. Your eyes are doing a thing." }],
    4: [{ who: 'narrator', text: "Bite four. The air around you smells faintly of prophecy." }]
  };
  if (n < 5) {
    if (lines[n]) say(lines[n]);
    return;
  }
  G.flags.ate = true;
  G.holdMode = null;
  G.charge = 0;
  G.flash = 1;
  SFX.fanfare();
  say([
    { who: 'narrator', text: "Ten cans. Maverick had never liked beans. He was a cheese-and-waffle guy." },
    { who: 'narrator', text: "But for Adrian, and for the honor of his mustache, he finished the pot." },
    { who: 'narrator', text: "His eyes begin to glow with a faint, gassy light." },
    { who: 'bucktooth', text: "THE PROPHECY! The Great Legume-Bearer has arisen!" },
    { who: 'narrator', text: "Outside, the sky turns the color of a bruise. The back door is open." }
  ], function () {
    buildScene(G.sceneId);   // rebuild so the gated exit appears
    toast('the back door is open');
  });
};

G.beginStorm = function () {
  G.holdMode = 'charge';
  G.charge = 0;
  if (!G.flags.stormNag) G.flags.stormNag = 0;
};

G.blast = function () {
  G.flash = 1.4; G.shake = 1.6;
  SFX.blast();
  for (var i = 0; i < 40; i++) {
    G.splash.push({
      x: G.px + (Math.random() - 0.5) * 30, y: G.py - 10,
      vx: (Math.random() - 0.5) * 260, vy: -Math.random() * 190 - 30,
      life: 0.5 + Math.random() * 0.7,
      c: ['#d8d0c0', '#b8b0a0', '#f0e0a0'][Math.floor(Math.random() * 3)]
    });
  }
  G.holdMode = null;
  say([
    { who: 'narrator', text: "Maverick stepped outside, took a deep breath, and let out the largest, loudest, most structurally devastating fart the West Coast had ever recorded." },
    { who: 'narrator', text: "The sound broke windows in Fresno." },
    { who: 'narrator', text: "The smell caused three squirrels to retire from climbing trees." },
    { who: 'narrator', text: "But the townspeople of Clovis, watching from their porches, began to cheer and whistle." },
    { who: 'mayor', text: "A RECORD! He's beaten the 1974 record held by that guy who ate the giant burrito!" },
    { who: 'narrator', text: "The storm clouds overhead grew weak and confused, unable to handle the sheer density of Maverick's newfound power." },
    { who: 'bucktooth', text: "You have the arsenal. You have the aroma. Holy smokes, Maverick, look UP." }
  ], function () { G.toCrash(); });
};

G.toCrash = function () {
  G.fadeTarget = 1; G.fadeDelay = 0.5;
  G.pending = function () {
    buildScene('crash'); G.sceneId = 'crash';
    G.px = SCENES.crash.spawn.tx * TILE + 8;
    G.py = SCENES.crash.spawn.ty * TILE + 15;
    G.dir = 'right';
    G.banner = 3; G.bannerText = SCENES.crash.title;
    G.fadeTarget = 0; G.fadeDelay = 0;
    G.companion = null;
    saveGame();
    SFX.blast();
    setTimeout(function () {
      say([
        { who: 'narrator', text: "And then, with a leathery CRASH, something pterodactyl-shaped slammed into the ground right next to the dam." },
        { who: 'narrator', text: "It was Adrian. He stood up, dizzy, and his hand brushed against the Master Twig." },
        { who: 'narrator', text: "K-RACK." }
      ], function () { G.companion = null; SCRIPT.adrianCrash(); });
    }, 1400);
  };
};

G.startBeanEnding = function () {
  say([
    { who: 'narrator', text: "At this point, the destruction of their property was the most entertaining thing on television." },
    { who: 'bucktooth', text: "Well done, Maverick. You have the arsenal. You have the aroma. You are ready to face Stephen Dalton in the final showdown of the storytellers." },
    { who: 'maverick', text: "Scotland doesn't know what's coming." },
    { who: 'narrator', text: "It does not. But it is going to find out." },
    { who: 'narrator', text: "Somewhere above the clouds, a Scottish voice stops narrating for a moment, and says, quietly: '...ach. Fine. That was a good one.'" }
  ], function () {
    G.creditsKind = 'beans';
    enterCredits('beans');
    G.fade = 0; G.fadeTarget = 0;
    SFX.fanfare();
  });
};

// hold-to-charge shared by eating and the bean blast
function updateHold(dt) {
  if (!G.holdMode) return;
  var holding = !!keys['e'] || !!keys[' '] || !!touch.act;
  var inp = inputDir();
  if (inp.dx || inp.dy) {           // walking away cancels the hold
    G.charge = 0;
    return;
  }
  if (holding) {
    G.charge = Math.min(1, G.charge + dt * (G.holdMode === 'eat' ? 1.15 : 0.42));
    if (G.charge >= 1 && !G._readyChime) { G._readyChime = true; SFX.blip(980, 0.12); }
  } else if (G.charge > 0.03) {
    G._readyChime = false;
    releaseHold();
  }
}

function releaseHold() {
  var c = G.charge;
  G.charge = 0;
  G._readyChime = false;
  if (!c) return;
  if (G.holdMode === 'eat') {
    if (c >= 0.99) G.biteEaten();
    else toast('keep holding to finish the bite');
    return;
  }
  if (G.holdMode === 'charge') {
    if (c >= 0.99) { G.blast(); return; }
    SFX.blip(180, 0.18);
    G.shake = 0.35;
    if (!G.flags.stormNag) {
      G.flags.stormNag = 1;
      G.flash = 0.9;
      say([
        { who: 'narrator', text: '"Ach. Was that it? Lad, I have narrated BIRTHDAYS with more force."' },
        { who: 'narrator', text: "He snaps his fingers. The air goes cold and you stumble back three feet." },
        { who: 'maverick', text: "Okay. HOLD it this time. All of it." }
      ], function () {
        G.px -= 26; G.py += 10;
      });
    } else {
      toast('not enough. hold it all the way');
    }
  }
}

// ------------------------------------------------------------------ camera
var CAM = { z: 1.5, x: 0, y: 0, w: W / 1.5, h: H / 1.5 };

function updateCamera() {
  // a scene can zoom out to show the whole room (the hub does)
  var sc = SCENES[G.sceneId];
  var wantZ = (sc && sc.camZoom) || 1.5;
  CAM.z = wantZ;                     // snap, so pixels stay on whole-number scales
  var vw = W / CAM.z, vh = H / CAM.z;
  CAM.x = clamp(G.px - vw / 2, 0, W - vw);
  CAM.y = clamp(G.py - 12 - vh / 2, 0, H - vh);
  CAM.x = Math.round(CAM.x); CAM.y = Math.round(CAM.y);
}

// ------------------------------------------------------------------ render

function render() {
  ctx.fillStyle = '#1a1a22';
  ctx.fillRect(0, 0, W, H);

  if (G.mode === 'title') { drawTitle(); drawFade(); return; }
  if (G.mode === 'book') { drawBook(); drawFade(); return; }
  if (G.mode === 'credits') { drawCredits(); drawFade(); return; }

  updateCamera();
  var shx = 0, shy = 0;
  if (G.shake > 0) {
    shx = Math.round((Math.random() - 0.5) * G.shake * 7);
    shy = Math.round((Math.random() - 0.5) * G.shake * 7);
  }
  ctx.save();
  ctx.scale(CAM.z, CAM.z);
  ctx.translate(-CAM.x + shx, -CAM.y + shy);

  if (G.bg) ctx.drawImage(G.bg, 0, 0);

  // animated water shimmer
  if (G.grid) {
    for (var y = 0; y < VH; y++) for (var x = 0; x < VW; x++) {
      if (G.grid[y][x] !== 'water') continue;
      if (x * TILE < CAM.x - TILE || x * TILE > CAM.x + W / CAM.z) continue;
      var ph = Math.sin(G.time * 1.8 + x * 0.7 + y * 0.4);
      if (ph > 0.75) {
        ctx.fillStyle = 'rgba(160,210,255,0.55)';
        ctx.fillRect(x * TILE + 3, y * TILE + 5, 5, 1);
        ctx.fillRect(x * TILE + 9, y * TILE + 11, 4, 1);
      }
    }
  }

  // entities and player, sorted by feet position
  var drawList = [];
  G.ents.forEach(function (e) { if (!e.exit) drawList.push({ y: e.py, fn: function () { drawEnt(ctx, e); } }); });
  if (G.companion) {
    var co = G.companion;
    drawList.push({ y: co.y, fn: function () {
      var bobc = Math.sin(co.t * 3) * 2;
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = '#8ad8ff';
      ctx.beginPath(); ctx.arc(co.x, co.y - 16 + bobc, 13, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.62;
      var gc = ART.overrides[co.who] ? ART.overrides[co.who].cols : 1;
      drawChar(ctx, co.who, co.dir || 'down', gc > 1 ? Math.floor(co.t * 3) % gc : 0,
               co.x - 8, co.y - 20 + bobc, 1);
      ctx.restore();
    } });
  }
  drawList.push({ y: G.py, fn: function () {
    if (G.cartT > 0) {
      var k = Math.abs(Math.cos(G.cartT * 14));
      ctx.save();
      ctx.translate(G.px, G.py);
      ctx.scale(Math.max(0.15, k), 1);
      ctx.translate(-G.px, -G.py);
      drawChar(ctx, 'maverick', G.dir, 0, G.px - 8, G.py - 16, 1, 'idle');
      ctx.restore();
      return;
    }
    drawChar(ctx, 'maverick', G.dir, G.frame, G.px - 8, G.py - 16, 1, G.moving ? 'walk' : 'idle');
    if (G.flags['t_gnome']) { // gnome rides along
      drawChar(ctx, 'gnome', 'down', 0, G.px - 20, G.py - 14, 0.55);
    }
    for (var ph = 0; ph < PLAYER_HOOKS.length; ph++) PLAYER_HOOKS[ph](ctx);
  } });
  drawList.sort(function (a, b) { return a.y - b.y; });
  drawList.forEach(function (d) { d.fn(); });

  // splash particles
  G.splash.forEach(function (p) {
    ctx.fillStyle = p.c;
    ctx.globalAlpha = clamp(p.life * 2, 0, 1);
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    ctx.globalAlpha = 1;
  });

  // chapter effects live in world space, so they sit under the weather and HUD
  if (typeof FX !== 'undefined') FX.drawWorld(ctx);

  ctx.restore();

  // storm sky over the world
  var scene = SCENES[G.sceneId];
  if (scene && scene.storm && G.mode === 'play') {
    ctx.fillStyle = 'rgba(52,22,88,0.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(198,214,255,0.55)';
    ctx.lineWidth = 1;
    for (var rn = 0; rn < 110; rn++) {
      var rx = (rn * 53 + G.time * 240) % (W + 60) - 30;
      var ry = (rn * 37 + G.time * 780) % (H + 60) - 30;
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 12); ctx.stroke();
    }
    // lightning, so it feels like weather instead of a filter
    if (!G._nextBolt) G._nextBolt = G.time + 3 + Math.random() * 3;
    if (G.time > G._nextBolt) {
      G.flash = 0.55;
      G._nextBolt = G.time + 4 + Math.random() * 5;
      SFX.tone(70, 0.5, 'sawtooth', 0.05);
    }
  }
  if (scene && scene.dark) {
    ctx.fillStyle = 'rgba(6,10,12,' + scene.dark + ')';
    ctx.fillRect(0, 0, W, H);
  }
  if (G.flash > 0) {
    ctx.fillStyle = 'rgba(255,250,230,' + Math.min(0.75, G.flash * 0.7) + ')';
    ctx.fillRect(0, 0, W, H);
  }

  // vignette so the HUD area reads
  var vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  drawHUD();
  drawHudHooks();
  drawHoldMeter();
  drawCard();
  drawDialogue(ctx, W, H);
  if (touch.on && !DLG.active) drawTouch();
  drawBanner();
  drawFade();
}

function drawHUD() {
  var obj = objective();
  if (!obj) return;
  ctx.font = '8px monospace';
  var w = ctx.measureText(obj).width + 14;
  ctx.fillStyle = 'rgba(18,16,28,0.6)';
  ctx.fillRect(4, 4, w, 14);
  ctx.fillStyle = '#f0e4c8';
  ctx.fillText(obj, 11, 14);
  if (G.level === 'lemonade' && (G.sceneId === 'stand' || G.sceneId === 'rival')) {
    var jar = 'jar: $' + (G.flags.dollars || 0) + (G.sceneId === 'stand' ? '   served ' + (G.flags.served || 0) + '/8' : '');
    ctx.font = '8px monospace';
    var jw = ctx.measureText(jar).width + 14;
    ctx.fillStyle = 'rgba(18,16,28,0.6)';
    ctx.fillRect(W - jw - 4, 22, jw, 14);
    ctx.fillStyle = '#f0e08a';
    ctx.fillText(jar, W - jw + 3, 32);
  }
  if (G.toastT > 0) {
    ctx.fillStyle = 'rgba(18,16,28,0.7)';
    var tw = ctx.measureText(G.toast).width + 12;
    ctx.fillRect(W - tw - 6, 4, tw, 14);
    ctx.fillStyle = '#a8e0a8';
    ctx.fillText(G.toast, W - tw, 14);
  }
  if (G.chapter && CHAPTERS[G.chapter]) {
    ctx.font = '6px monospace';
    ctx.fillStyle = 'rgba(240,224,180,0.55)';
    var tag = 'chapter ' + G.chapter + ' / ' + CHAPTER_COUNT + '   ' + CHAPTERS[G.chapter].short;
    ctx.fillText(tag, 6, H - 5);
  }
}

// chapter HUDs draw even when there is no objective line, or a result card or
// a minigame meter would disappear at exactly the moment it matters
function drawHudHooks() {
  for (var hh = 0; hh < HUD_HOOKS.length; hh++) HUD_HOOKS[hh](ctx);
}

function objective() {
  if (G.chapter && CHAPTER_CONTENT[G.chapter] && CHAPTER_CONTENT[G.chapter].objective) {
    var co = CHAPTER_CONTENT[G.chapter].objective();
    if (co !== undefined) return co;
  }
  if (G.level === 'lemonade') {
    if (G.sceneId === 'stand') return 'objective: serve the queue (' + (G.flags.served || 0) + '/8)';
    if (G.sceneId === 'rival') {
      if (G.flags.bitrex) return 'objective: talk to the little turtle';
      if (!G.flags.canCart) return 'objective: talk to Bucktooth';
      if (G.distracted()) return 'objective: dump the Bitrex in their pitcher, NOW';
      return 'objective: cartwheel at the crowd, then get to their pitcher';
    }
    if (G.sceneId === 'chase') return 'objective: catch the turtle';
    return '';
  }
  if (G.level === 'beans') {
    var n = G.flags.beans || 0;
    if (G.sceneId === 'yard2') return 'objective: get to the Grocery-O-Rama (east)';
    if (G.sceneId === 'grocery') return 'objective: buy every bean (' + n + '/10)';
    if (G.sceneId === 'kitchen') {
      if (G.flags.ate) return 'objective: go outside';
      if (G.flags.cooked) return 'objective: hold E to eat (' + (G.flags.bites || 0) + '/5)';
      return n < 10 ? 'objective: back to the store, you need all ten' : 'objective: cook the beans';
    }
    if (G.sceneId === 'storm') return G.holdMode ? 'hold E. build it. release at full.' : 'the narrator is waiting';
    return '';
  }
  if (G.sceneId === 'dam') {
    var n = itemCount();
    return n < 5 ? 'objective: pull the junk out of the dam (' + n + '/5)' : 'objective: talk to Bucktooth';
  }
  if (G.sceneId === 'yard') return G.flags.readNote ? 'objective: follow the wet footprints' : 'objective: check the mailbox';
  if (G.sceneId === 'square') return 'objective: ask around town';
  if (G.sceneId === 'riverbed') return 'objective: follow the creek bed uphill';
  return '';
}

function drawHoldMeter() {
  if (!G.holdMode || DLG.active) return;
  var bw = 170, bh = 12, bx = (W - bw) / 2, by = H - 30;
  ctx.fillStyle = 'rgba(18,16,28,0.85)';
  ctx.fillRect(bx - 3, by - 3, bw + 6, bh + 6);
  ctx.fillStyle = '#2a2438';
  ctx.fillRect(bx, by, bw, bh);
  var full = G.charge >= 0.99;
  var col = full ? (Math.sin(G.time * 14) > 0 ? '#ffe066' : '#fff6c0') : G.charge > 0.6 ? '#f0c060' : '#8ad07a';
  ctx.fillStyle = col;
  ctx.fillRect(bx, by, bw * G.charge, bh);
  ctx.strokeStyle = 'rgba(244,228,192,0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
  // notches so the goal is legible
  for (var i = 1; i < 4; i++) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(bx + (bw / 4) * i, by + 1, 1, bh - 2);
  }
  ctx.textAlign = 'center';
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = full ? '#fff6c0' : '#d8d0c0';
  var label = G.holdMode === 'eat'
    ? (full ? 'RELEASE TO SWALLOW' : 'HOLD E TO EAT  (' + (G.flags.bites || 0) + '/5)')
    : (full ? 'RELEASE! NOW!' : 'HOLD E TO CHARGE THE BEAN POWER');
  ctx.fillText(label, W / 2, by - 7);
  ctx.textAlign = 'left';
}

// a chapter title card: chapterCard('CHAPTER ONE', 'The Case of...', 3)
function chapterCard(kicker, title, seconds) {
  G.card = { kicker: kicker, title: title, t: seconds || 3, life: seconds || 3 };
}

function drawCard() {
  if (!G.card) return;
  var a = Math.min(1, G.card.t * 1.6, (G.card.life - G.card.t) * 3.2 + 0.15);
  ctx.globalAlpha = Math.max(0, a);
  ctx.fillStyle = 'rgba(12,10,18,0.72)';
  ctx.fillRect(0, H / 2 - 46, W, 84);
  ctx.strokeStyle = 'rgba(240,192,96,0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W / 2 - 120, H / 2 - 40.5); ctx.lineTo(W / 2 + 120, H / 2 - 40.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 - 120, H / 2 + 33.5); ctx.lineTo(W / 2 + 120, H / 2 + 33.5); ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '7px monospace';
  ctx.fillStyle = '#f0c060';
  ctx.fillText(G.card.kicker, W / 2, H / 2 - 22);
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#f6ecd8';
  var lines = wrapText(ctx, G.card.title, W - 80);
  for (var i = 0; i < lines.length && i < 2; i++) {
    ctx.fillText(lines[i], W / 2, H / 2 + 2 + i * 15);
  }
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

function drawBanner() {
  if (G.banner <= 0) return;
  var a = clamp(G.banner, 0, 1);
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(18,16,28,0.75)';
  ctx.fillRect(0, H / 2 - 22, W, 26);
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#f4e4c0';
  var t = G.bannerText, tw = ctx.measureText(t).width;
  ctx.fillText(t, (W - tw) / 2, H / 2 - 3);
  ctx.globalAlpha = 1;
}

function drawFade() {
  if (G.fade <= 0.001) return;
  ctx.fillStyle = 'rgba(0,0,0,' + clamp(G.fade, 0, 1) + ')';
  ctx.fillRect(0, 0, W, H);
}

function drawTouch() {
  var cx = W - 120, cy = H - 44;
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = '#2a2438';
  ctx.beginPath(); ctx.arc(cx + touch.dx * 12, cy + touch.dy * 12, 11, 0, Math.PI * 2); ctx.fill();
  // action button
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = '#f0c060';
  ctx.beginPath(); ctx.arc(W - 38, H - 40, 26, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#2a2438'; ctx.font = 'bold 14px monospace';
  ctx.fillText('A', W - 44, H - 35);
}

function drawTitle() {
  var t = G.time;
  // night sky
  ctx.fillStyle = '#2f4a6a'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#28405c';
  for (var i = 0; i < 70; i++) {
    var x = (hash(i, 3, 1) * W), y = hash(i, 7, 2) * H * 0.5;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.fillStyle = '#f4e4c0';
  ctx.beginPath(); ctx.arc(W - 54, 40, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2f4a6a';
  ctx.beginPath(); ctx.arc(W - 61, 34, 13, 0, Math.PI * 2); ctx.fill();
  // ground
  ctx.fillStyle = '#1f3a2a'; ctx.fillRect(0, H - 62, W, 62);
  ctx.fillStyle = '#24452f';
  for (var j = 0; j < 40; j++) ctx.fillRect(j * 14, H - 62 - Math.floor(hash(j, 5, 9) * 8), 12, 10);

  var bob = Math.sin(t * 2) * 1.4;
  var mc = ART.overrides.maverick ? ART.overrides.maverick.cols : 2;
  var bc = ART.overrides.bucktooth ? ART.overrides.bucktooth.cols : 2;
  drawChar(ctx, 'maverick', 'down', Math.floor(t * 3) % mc, 214, 118 + bob, 1);
  drawChar(ctx, 'bucktooth', 'down', Math.floor(t * 3 + 1) % bc, 262, 118 - bob, 1);

  ctx.textAlign = 'center';
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = '#0f0d16';
  ctx.fillText('MAVERICK', W / 2 + 2, 40);
  ctx.fillStyle = '#f4e4c0';
  ctx.fillText('MAVERICK', W / 2, 38);
  ctx.font = '8px monospace';
  ctx.fillStyle = '#c8c0b0';
  var partWords = ['', 'one part', 'two parts', 'three parts', 'four parts', 'five parts'];
  ctx.fillText('a very small adventure in ' + (partWords[LEVEL_ORDER.length] || LEVEL_ORDER.length + ' parts'), W / 2, 54);

  // one card per episode, laid out to fit however many there are
  var nCards = LEVEL_ORDER.length, cGap = 12, cW = Math.floor((W - 32 - cGap * (nCards - 1)) / nCards);
  var cards = [];
  for (var ci3 = 0; ci3 < nCards; ci3++) cards.push({ x: 16 + ci3 * (cW + cGap), w: cW });
  var cy = 146, ch = 92;
  for (var k = 0; k < nCards; k++) {
    var lv = LEVELS[LEVEL_ORDER[k]];
    var c = cards[k], sel = (k === titleSel);
    ctx.fillStyle = sel ? 'rgba(40,36,56,0.96)' : 'rgba(24,22,32,0.82)';
    ctx.fillRect(c.x, cy, c.w, ch);
    ctx.strokeStyle = sel ? '#f0c060' : 'rgba(200,190,170,0.3)';
    ctx.lineWidth = sel ? 2 : 1;
    ctx.strokeRect(c.x + 1, cy + 1, c.w - 2, ch - 2);

    ctx.textAlign = 'left';
    ctx.font = '7px monospace';
    ctx.fillStyle = sel ? '#f0c060' : 'rgba(240,224,180,0.55)';
    ctx.fillText(lv.label, c.x + 10, cy + 16);

    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = sel ? '#ffffff' : 'rgba(244,228,192,0.7)';
    ctx.fillText(lv.titleLines[0], c.x + 10, cy + 32);
    ctx.fillText(lv.titleLines[1], c.x + 10, cy + 44);

    ctx.font = '6px monospace';
    ctx.fillStyle = sel ? '#b8b0a0' : 'rgba(184,176,160,0.55)';
    ctx.fillText(lv.blurb, c.x + 10, cy + 60);
    ctx.fillText(lv.blurb2, c.x + 10, cy + 68);

    var sv = loadSave(LEVEL_ORDER[k]);
    var started = sv && sv.flags && sv.flags.started;
    var status = started ? 'CONTINUE' : 'NEW';
    if (sel) {
      var blink = 0.72 + 0.28 * Math.sin(t * 4);
      ctx.globalAlpha = blink;
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('E   ' + status, c.x + 10, cy + ch - 8);
      ctx.globalAlpha = 1;
    } else {
      ctx.font = '7px monospace';
      ctx.fillStyle = 'rgba(200,200,200,0.45)';
      ctx.fillText(status, c.x + 10, cy + ch - 8);
    }
    if (sel) {  // selection arrows
      ctx.fillStyle = '#f0c060';
      ctx.beginPath();
      ctx.moveTo(c.x + c.w / 2 - 4, cy - 8); ctx.lineTo(c.x + c.w / 2 + 4, cy - 8); ctx.lineTo(c.x + c.w / 2, cy - 2);
      ctx.fill();
    }
  }

  ctx.textAlign = 'center';
  ctx.font = '7px monospace';
  ctx.fillStyle = 'rgba(200,200,200,0.6)';
  ctx.fillText('left / right to choose   .   M for sound   .   made for Maverick', W / 2, H - 12);
  ctx.textAlign = 'left';
}

function itemCountFromFlags(f) {
  var n = 0;
  ['toupee', 'mail', 'glasses', 'gnome', 'float'].forEach(function (k) { if (f['t_' + k]) n++; });
  return n;
}

function drawCredits() {
  ctx.fillStyle = '#0f0d16'; ctx.fillRect(0, 0, W, H);
  var lines;
  if (G.creditsKind === 'lemonade') {
    lines = [
      '', '',
      'MAVERICK', 'and the BITTER-LEMONADE HUSTLE', '', '',
      'starring', 'MAVERICK', 'as the last honest man in citrus', '',
      'PROFESSOR BUCKTOOTH', 'as a sentient hand puppet (he has a pocket)', '',
      'BUCKLEY', 'as a tactical hustler in a green shell', '',
      'CHEAP WHISKEY', 'as a man whose depth perception is vibrating', '',
      'and TAFFY STAMBURGER', 'eating a taco, watching, judgement free', '', '',
      'citrus-to-sugar ratio ... optimized', 'kerning ................ a war crime',
      'revenue ................ $4, minus $4', 'distance flown .......... over the horizon', '', '',
      'no turtles were harmed', 'in the making of this episode (one was launched)', '', '',
      'pixel art .............. PixelLab', 'extra pixels ........... hand placed', '',
      'made for Maverick', '', '',
      'episode four: the sewer', 'has a structural understanding of exits', ''
    ];
  } else if (G.creditsKind === 'beans') {
    lines = [
      '', '',
      'MAVERICK', 'and the PATH OF THE FLATULENT PROPHET', '', '',
      'starring', 'MAVERICK', 'as the Great Legume-Bearer', '',
      'PROFESSOR BALTHAZAR BUCKTOOTH', 'as a spectre with a shopping list', '',
      'ADRIAN', 'as a small orange dot, briefly', '',
      'MRS. NIBBLES', 'as a gerbil in a soundproof wheel', '',
      'and STEPHEN DALTON', 'as the narrator (uncredited, unrepentant)', '', '',
      'bean supply .......... the Grocery-O-Rama', 'whale insurance ..... approved',
      'windows broken ....... Fresno', 'squirrels retired .... three', '', '',
      'with apologies to', 'the 1974 giant burrito record holder', '', '',
      'pixel art ............ PixelLab', 'extra pixels ......... hand placed', '',
      'made for Maverick', '', '', '',
      'episode three: Scotland', 'does not know what is coming', ''
    ];
  } else {
    lines = [
      '', '',
      'MAVERICK', 'and the REALLY BAD IDEA', '', '',
      'starring', 'MAVERICK', 'as himself', '',
      'and PROFESSOR BUCKTOOTH', 'as a beaver with a plan', '', '',
      'also starring', 'MAYOR TUBA ......... a mayor', 'POSTMASTER NUTKIN .. has opinions',
      'OLD MAN SHELLBY ..... takes his time', 'KEVIN ............... quack', 'THE LAWN GNOME ...... load-bearing', '', '',
      'story ............... Bucktooth (allegedly)', 'structural engineering ... Bucktooth',
      'paperwork ............ laminated', '', '',
      'pixel art ............ PixelLab', 'extra pixels ......... hand placed', '',
      'made for Maverick', '', '', '',
      'thanks for playing', ''
    ];
  }
  ctx.textAlign = 'center';
  for (var i = 0; i < lines.length; i++) {
    var y = G.creditsY + i * 14;
    if (y < -20 || y > H + 20) continue;
    var big = lines[i] === 'MAVERICK' || lines[i] === 'and the REALLY BAD IDEA';
    ctx.font = big ? 'bold 16px monospace' : '9px monospace';
    ctx.fillStyle = big ? '#f4e4c0' : '#c8c0b0';
    ctx.fillText(lines[i], W / 2, y);
  }
  ctx.textAlign = 'left';
  if (G.creditsY + lines.length * 14 < H - 20) {
    ctx.textAlign = 'center'; ctx.font = '8px monospace'; ctx.fillStyle = '#f0c060';
    ctx.fillText('PRESS E OR TAP TO GO BACK TO YOUR ROOM', W / 2, H - 16); ctx.textAlign = 'left';
  }
}

// --------------------------------------------------------------- main loop

var last = performance.now();
function frame(now) {
  var dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

function resize() {
  var s = Math.min(window.innerWidth / W, window.innerHeight / H);
  s = Math.max(0.5, Math.floor(s * 2) / 2);
  canvas.style.width = (W * s) + 'px';
  canvas.style.height = (H * s) + 'px';
}
window.addEventListener('resize', resize);
resize();

// boot into the bedroom; the storybook is the way in
goBedroom();
G.fade = 1; G.fadeTarget = 0;
requestAnimationFrame(frame);
