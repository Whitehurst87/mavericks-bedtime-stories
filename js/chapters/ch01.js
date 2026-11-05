// ch01.js - Chapter 1: Mav and the Case of the Extremely Expensive Sandwich
//
// Scene set:
//   b_dam      the intact dam, the twig, and a very bad decision
//   b_dam_n    after the flood, Bucktooth wants a sandwich
//   b_road     the street to town, and the way back with the sandwich
//   b_arbys    the counter
//   b_dam_fix  the dam repaired, Penelope unimpressed
//   b_puddle   the mud pile, and the end
//
// This file is the template for every later chapter: scenes into SCENES,
// dialogue into SCRIPT, art through PROP_HOOKS, per-frame logic through
// TICK_HOOKS, HUD through HUD_HOOKS, and a CHAPTER_CONTENT entry at the bottom.

NAMES.penelope = 'PENELOPE';
NAMES.arbys_clerk = "ARBY'S";
NAMES.bucktooth = 'PROF. BUCKTOOTH';

PLAYER_HOOKS.push(function (c) {
  if (G.level !== 'ch1' || !G.flags.hasSandwich) return;
  // the Meat Mountain, carried at chest height and bobbing as he runs
  var bob = Math.sin(G.time * 9) * (G.moving ? 1.4 : 0.5);
  var ox = G.dir === 'left' ? -16 : G.dir === 'right' ? 4 : -14;
  var x = G.px + ox, y = G.py - 18 + bob;
  function P(dx, dy, w, h, col) {
    c.fillStyle = col;
    c.fillRect(Math.round(x + dx), Math.round(y + dy), w, h);
  }
  P(-1, 2, 12, 4, '#e8dcc0');      // bottom bun
  P(-1, 5, 12, 1, '#c2b090');
  P(0, -1, 10, 3, '#8a4a34');      // the meats
  P(1, 0, 3, 1, '#a85a40');
  P(5, 0, 4, 1, '#a85a40');
  P(-1, -3, 12, 2, '#3f8a4a');     // lettuce
  P(0, -5, 10, 2, '#e0b646');      // cheese
  P(-1, -8, 12, 3, '#ecd9b4');     // top bun
  P(-1, -8, 12, 1, '#f8efd8');
  P(1, -9, 2, 1, '#f8efd8');       // a sesame seed, roughly
  P(6, -9, 2, 1, '#f8efd8');
  P(4, -7, 2, 1, '#c9a878');
});

// ------------------------------------------------------------------- scenes

SCENES.b_dam = {
  title: 'PICKLE CREEK DAM',
  spawn: { tx: 12, ty: 13, dir: 'right' },
  fill: 'mud',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 16, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 1, y: 2, w: 30, h: 7, t: 'water' },
    { x: 1, y: 9, w: 30, h: 2, t: 'dam' },
    { x: 1, y: 11, w: 30, h: 2, t: 'grass' },
    { x: 1, y: 13, w: 30, h: 2, t: 'path' },
    { x: 1, y: 15, w: 30, h: 1, t: 'grass' }
  ],
  solidKinds: ['tree', 'water', 'dam'],
  entities: [
    { id: 'twig', who: null, tx: 16, ty: 11, kind: 'twigSign', noSolid: true, talk: 'ch1Twig' },
    { id: 'g1', who: 'gnome', tx: 5, ty: 9, small: true },
    { id: 'g2', who: 'gnome', tx: 24, ty: 9, small: true },
    { id: 'boat', who: null, tx: 10, ty: 6, kind: 'boat', noSolid: true },
    { id: 'stump1', who: null, tx: 4, ty: 15, kind: 'stump' },
    { id: 'bush1', who: null, tx: 27, ty: 15, kind: 'bush' },
    { id: 'exit_road', exit: { to: 'b_road', tx: 2, ty: 13, dir: 'right' }, tx: 30, ty: 13, rect: { w: 1, h: 2 } }
  ]
};

SCENES.b_dam_n = {
  title: 'THE FORMER DAM',
  spawn: { tx: 12, ty: 13, dir: 'right' },
  fill: 'mud',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 16, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 1, y: 2, w: 30, h: 7, t: 'bed' },
    { x: 1, y: 9, w: 4, h: 2, t: 'dam' },
    { x: 27, y: 9, w: 4, h: 2, t: 'dam' },
    { x: 1, y: 11, w: 30, h: 2, t: 'grass' },
    { x: 1, y: 13, w: 30, h: 2, t: 'path' },
    { x: 1, y: 15, w: 30, h: 1, t: 'grass' }
  ],
  solidKinds: ['tree', 'water', 'dam'],
  entities: [
    { id: 'buck', who: 'bucktooth', tx: 18, ty: 12, dir: 'right', pace: 15, talk: 'ch1Buck' },
    { id: 'sail', who: null, tx: 8, ty: 15, kind: 'boat', noSolid: true },
    { id: 'stump2', who: null, tx: 26, ty: 15, kind: 'stump' },
    { id: 'bush2', who: null, tx: 3, ty: 15, kind: 'bush' },
    { id: 'exit_road2', exit: { to: 'b_road', tx: 2, ty: 13, dir: 'right' }, tx: 30, ty: 13, rect: { w: 1, h: 2 } }
  ]
};

SCENES.b_road = {
  title: 'CLOVIS, GOING EAST',
  spawn: { tx: 2, ty: 12, dir: 'right' },
  fill: 'grass',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 16, w: 32, h: 1, t: 'tree' },
    { x: 0, y: 0, w: 1, h: 10, t: 'tree' },
    { x: 0, y: 14, w: 1, h: 4, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 10, t: 'tree' },
    { x: 31, y: 14, w: 1, h: 4, t: 'tree' },
    { x: 1, y: 10, w: 30, h: 4, t: 'cobble' },
    { x: 22, y: 4, w: 8, h: 2, t: 'roof' },
    { x: 22, y: 6, w: 8, h: 3, t: 'house' },
    { x: 25, y: 9, w: 2, h: 2, t: 'path' },
    { x: 4, y: 3, w: 5, h: 2, t: 'roof' },
    { x: 4, y: 5, w: 5, h: 3, t: 'house' },
    { x: 12, y: 5, w: 1, h: 1, t: 'tree' },
    { x: 17, y: 4, w: 1, h: 1, t: 'tree' },
    { x: 11, y: 14, w: 1, h: 1, t: 'tree' },
    { x: 20, y: 15, w: 1, h: 1, t: 'tree' }
  ],
  solidKinds: ['tree', 'house', 'roof'],
  entities: [
    { id: 'arbysSign', who: null, tx: 26, ty: 9, kind: 'arbysSign', noSolid: true },
    { id: 'kevin2', who: 'kevin', tx: 9, ty: 11, small: true, talk: 'ch1Kevin' },
    { id: 'bench3', who: null, tx: 14, ty: 9, kind: 'bench', solid: true },
    { id: 'drift1', who: 'gnome', tx: 6, ty: 12, small: true, drift: 22, hidden: true },
    { id: 'drift2', who: 'gnome', tx: 15, ty: 13, small: true, drift: -18, hidden: true },
    { id: 'drift3', who: 'gnome', tx: 21, ty: 12, small: true, drift: 26, hidden: true },
    { id: 'exit_dam_road', exit: { to: 'b_dam_n', tx: 28, ty: 12, dir: 'left' }, tx: 0, ty: 12, rect: { w: 1, h: 2 } },
    { id: 'exit_arbys', exit: { to: 'b_arbys', tx: 16, ty: 15, dir: 'up' }, tx: 30, ty: 12, rect: { w: 1, h: 2 } }
  ]
};

SCENES.b_arbys = {
  title: "ARBY'S",
  spawn: { tx: 16, ty: 9, dir: 'up' },
  fill: 'linoleum',
  rects: [
    { x: 0, y: 0, w: 32, h: 4, t: 'wall' },
    { x: 0, y: 4, w: 1, h: 6, t: 'wall' },
    { x: 0, y: 12, w: 1, h: 5, t: 'wall' },
    { x: 31, y: 4, w: 1, h: 13, t: 'wall' },
    { x: 0, y: 17, w: 32, h: 1, t: 'wall' },
    { x: 8, y: 3, w: 15, h: 1, t: 'wall' },
    { x: 5, y: 7, w: 22, h: 2, t: 'counter' },
    { x: 3, y: 12, w: 5, h: 1, t: 'booth' },
    { x: 3, y: 14, w: 5, h: 1, t: 'booth' },
    { x: 24, y: 12, w: 5, h: 1, t: 'booth' },
    { x: 24, y: 14, w: 5, h: 1, t: 'booth' },
    { x: 5, y: 13, w: 1, h: 1, t: 'table' },
    { x: 26, y: 13, w: 1, h: 1, t: 'table' }
  ],
  solidKinds: ['wall', 'counter', 'booth', 'table', 'menu'],
  entities: [
    { id: 'clerkA', who: 'arbys_clerk', tx: 16, ty: 6, dir: 'down', reach: 54, talk: 'ch1Clerk' },
    { id: 'menuBoard', who: null, tx: 16, ty: 3, kind: 'menuBoard', noSolid: true },
    { id: 'register', who: null, tx: 19, ty: 7, kind: 'register', noSolid: true },
    { id: 'tray', who: null, tx: 13, ty: 7, kind: 'tray', noSolid: true },
    { id: 'condiments', who: null, tx: 6, ty: 13, kind: 'condiments', noSolid: true },
    { id: 'trash', who: null, tx: 29, ty: 9, kind: 'trash', solid: true, propScale: 1 },
    { id: 'mat', who: null, tx: 1, ty: 10, kind: 'mat', noSolid: true },
    { id: 'clock', who: null, tx: 27, ty: 1, kind: 'wallClock', noSolid: true },
    { id: 'poster', who: null, tx: 4, ty: 1, kind: 'wallPoster', noSolid: true },
    { id: 'queuesign', who: null, tx: 9, ty: 11, kind: 'queueSign', noSolid: true },
    { id: 'exit_arbys', exit: { to: 'b_road', tx: 28, ty: 12, dir: 'left' }, tx: 0, ty: 10, rect: { w: 1, h: 2 } }
  ],
  overlay: function (c) {
    // ceiling fixtures: warm pools of light on the floor
    var lamps = [[6, 10], [16, 9], [26, 10], [9, 4], [23, 4]];
    lamps.forEach(function (l) {
      var g = c.createRadialGradient(l[0] * TILE, l[1] * TILE, 4, l[0] * TILE, l[1] * TILE, 62);
      g.addColorStop(0, 'rgba(255,236,190,0.16)');
      g.addColorStop(0.6, 'rgba(255,226,170,0.06)');
      g.addColorStop(1, 'rgba(255,220,160,0)');
      c.fillStyle = g;
      c.fillRect(l[0] * TILE - 64, l[1] * TILE - 64, 128, 128);
    });
    // the corners sit in shadow so the room has a shape
    var vg = c.createRadialGradient(W / 2, H * 0.5, H * 0.30, W / 2, H * 0.5, H * 0.78);
    vg.addColorStop(0, 'rgba(20,14,8,0)');
    vg.addColorStop(1, 'rgba(20,14,8,0.42)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
  }
};

SCENES.b_dam_fix = {
  title: 'THE DAM, REPAIRED',
  spawn: { tx: 12, ty: 13, dir: 'right' },
  fill: 'mud',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 16, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 1, y: 2, w: 30, h: 7, t: 'water' },
    { x: 1, y: 9, w: 30, h: 2, t: 'dam' },
    { x: 1, y: 11, w: 30, h: 2, t: 'grass' },
    { x: 1, y: 13, w: 30, h: 2, t: 'path' },
    { x: 1, y: 15, w: 30, h: 1, t: 'grass' }
  ],
  solidKinds: ['tree', 'water', 'dam'],
  entities: [
    { id: 'buck2', who: 'bucktooth', tx: 17, ty: 12, dir: 'right', pace: 16, talk: null },
    { id: 'pen2', who: 'penelope', tx: 21, ty: 12, dir: 'left', pace: 13, talk: null },
    { id: 'exit_road3', exit: { to: 'b_road', tx: 2, ty: 13, dir: 'right' }, tx: 30, ty: 13, rect: { w: 1, h: 2 } }
  ]
};

SCENES.b_puddle = {
  title: 'THIRTY FEET DOWNSTREAM',
  spawn: { tx: 8, ty: 9, dir: 'right' },
  fill: 'mud',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 2, y: 12, w: 28, h: 4, t: 'water' },
    { x: 2, y: 10, w: 28, h: 2, t: 'sand' },
    { x: 5, y: 3, w: 1, h: 1, t: 'tree' },
    { x: 26, y: 4, w: 1, h: 1, t: 'tree' }
  ],
  solidKinds: ['tree', 'water'],
  entities: [
    { id: 'pbuck', who: 'bucktooth', tx: 13, ty: 10, dir: 'down', talk: null },
    { id: 'ppen', who: 'penelope', tx: 19, ty: 10, dir: 'down', talk: null },
    { id: 'pgnome', who: 'gnome', tx: 22, ty: 9, small: true },
    { id: 'pboat', who: null, tx: 6, ty: 13, kind: 'boat', noSolid: true }
  ],
  overlay: function (c) {
    // wet sand along the waterline, so the mud field has an edge
    var g = c.createLinearGradient(0, 150, 0, 200);
    g.addColorStop(0, 'rgba(150,126,92,0)');
    g.addColorStop(1, 'rgba(150,126,92,0.55)');
    c.fillStyle = g;
    c.fillRect(0, 150, W, 50);
    // shallow puddles catching the sky
    var pools = [[60, 120, 34, 10], [150, 96, 46, 12], [268, 132, 40, 9], [392, 108, 52, 12], [470, 140, 30, 8]];
    pools.forEach(function (p) {
      c.fillStyle = 'rgba(96,132,164,0.55)';
      c.beginPath();
      c.ellipse(p[0], p[1], p[2], p[3], 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = 'rgba(178,208,232,0.42)';
      c.beginPath();
      c.ellipse(p[0] - p[2] * 0.2, p[1] - p[3] * 0.35, p[2] * 0.6, p[3] * 0.45, 0, 0, Math.PI * 2);
      c.fill();
    });
    // driftwood and stones
    c.fillStyle = '#6a5236';
    c.fillRect(96, 142, 26, 4);
    c.fillRect(120, 144, 12, 3);
    c.fillStyle = '#8f8272';
    c.fillRect(210, 156, 9, 5);
    c.fillRect(330, 148, 6, 4);
    c.fillStyle = '#b9b0a0';
    c.fillRect(212, 156, 5, 2);
  }
};

// -------------------------------------------------------------------- props

// ------------------------------------------------- Arby's interior art
// Everything here is scoped to the restaurant so no other chapter changes.

TILE_HOOKS.push(function (c, kind, tx, ty, grid) {
  if (!ARBYS_SCENES[G.sceneId]) return false;
  var x = tx * TILE, y = ty * TILE, r = hash(tx, ty, 31), r2 = hash(tx, ty, 57);

  if (kind === 'linoleum') {
    // terrazzo: warm, low contrast, with a soft two tile pattern
    c.fillStyle = ((tx + ty) % 2) ? '#cbbfa6' : '#c6baa1';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(110,96,72,0.10)';
    c.fillRect(x, y, TILE, 1);
    c.fillRect(x, y, 1, TILE);
    for (var i = 0; i < 3; i++) {
      var h = hash(tx * 7 + i, ty * 13, 5);
      c.fillStyle = h > 0.5 ? 'rgba(140,124,96,0.30)' : 'rgba(246,238,220,0.35)';
      c.fillRect(x + 2 + Math.floor(h * 11), y + 2 + Math.floor(hash(tx + i, ty * 3, 9) * 11), 1, 1);
    }
    if (r > 0.93) { c.fillStyle = 'rgba(110,96,72,0.16)'; c.fillRect(x + 4, y + 6, 5, 1); }
    return true;
  }

  if (kind === 'wall') {
    c.fillStyle = '#e7ddc6';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(206,192,164,0.35)';
    c.fillRect(x + 3, y, 1, TILE);
    c.fillRect(x + 11, y, 1, TILE);

    // the row directly above the floor is the dado, so the wall has a base
    var below = grid && grid[ty + 1] ? grid[ty + 1][tx] : null;
    if (below && below !== 'wall' && below !== 'menu') {
      c.fillStyle = '#7d5636'; c.fillRect(x, y + 3, TILE, TILE - 3);
      c.fillStyle = '#8f6540'; c.fillRect(x, y + 3, TILE, 2);
      c.fillStyle = '#4a3120'; c.fillRect(x, y + TILE - 4, TILE, 4);
      c.fillStyle = 'rgba(255,240,210,0.10)'; c.fillRect(x, y + TILE - 5, TILE, 1);
    }
    // a shadow down the inner face of the side walls
    if (grid) {
      if (grid[ty] && grid[ty][tx + 1] && grid[ty][tx + 1] !== 'wall') {
        c.fillStyle = 'rgba(40,26,14,0.35)'; c.fillRect(x + TILE - 3, y, 3, TILE);
      }
      if (grid[ty] && grid[ty][tx - 1] && grid[ty][tx - 1] !== 'wall') {
        c.fillStyle = 'rgba(40,26,14,0.28)'; c.fillRect(x, y, 2, TILE);
      }
    }
    return true;
  }

  if (kind === 'menu') {
    return false;
  }

  if (kind === 'counter') {
    // the back row is the steel surface, the row below it is the red front
    var isFront = grid && grid[ty - 1] && grid[ty - 1][tx] === 'counter';
    if (isFront) {
      c.fillStyle = '#8a3a2a'; c.fillRect(x, y, TILE, TILE);
      c.fillStyle = '#a84a34'; c.fillRect(x, y, TILE, 2);
      c.fillStyle = 'rgba(255,150,120,0.18)'; c.fillRect(x, y + 2, TILE, 1);
      c.fillStyle = '#5f2a20'; c.fillRect(x, y + TILE - 2, TILE, 2);
      c.fillStyle = 'rgba(20,8,6,0.25)'; c.fillRect(x, y, 1, TILE);
    } else {
      c.fillStyle = '#b0b6ba'; c.fillRect(x, y, TILE, TILE);
      c.fillStyle = '#c2c8cc'; c.fillRect(x, y + 2, TILE, 8);
      // sneeze guard: a glass strip standing along the back edge
      c.fillStyle = 'rgba(196,226,240,0.45)'; c.fillRect(x, y, TILE, 3);
      c.fillStyle = 'rgba(240,252,255,0.75)'; c.fillRect(x, y, TILE, 1);
      c.fillStyle = 'rgba(90,96,100,0.35)'; c.fillRect(x, y + 10, TILE, 1);
      c.fillStyle = 'rgba(255,255,255,0.30)'; c.fillRect(x, y + 11, TILE, 1);
    }
    return true;
  }

  if (kind === 'booth') {
    // vinyl bench: a back rail at the top and a cushion below
    c.fillStyle = '#5f2626'; c.fillRect(x, y, TILE, TILE);
    c.fillStyle = '#7a3232'; c.fillRect(x, y + 2, TILE, TILE - 2);
    c.fillStyle = '#a84a4a'; c.fillRect(x + 1, y + 3, TILE - 2, 9);
    c.fillStyle = '#c05a5a'; c.fillRect(x + 1, y + 3, TILE - 2, 1);
    c.fillStyle = 'rgba(60,20,20,0.45)';
    c.fillRect(x + 4, y + 6, 1, 4); c.fillRect(x + 11, y + 6, 1, 4);
    c.fillStyle = '#3f1919'; c.fillRect(x, y + TILE - 3, TILE, 3);
    return true;
  }

  if (kind === 'table') {
    // a round fast food table with a chrome edge
    c.fillStyle = 'rgba(0,0,0,0.16)';
    c.beginPath(); c.arc(x + 8, y + 9, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#8f857a';
    c.beginPath(); c.arc(x + 8, y + 8, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#c3b49a';
    c.beginPath(); c.arc(x + 8, y + 8, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#d8cbb2';
    c.beginPath(); c.arc(x + 7, y + 7, 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,240,0.5)';
    c.fillRect(x + 6, y + 5, 2, 1);
    return true;
  }
  return false;
});

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (k !== 'condiments' && k !== 'trash' && k !== 'mat' &&
      k !== 'wallClock' && k !== 'wallPoster' && k !== 'queueSign' &&
      k !== 'menuBoard') return false;
  var P = propPainter(c, e);

  if (k === 'menuBoard') {
    var mw = 240, mh = 24;
    P(-mw / 2, -22, mw, mh, '#1e1710');
    P(-mw / 2 + 2, -20, mw - 4, mh - 4, '#33261a');
    P(-mw / 2 + 2, -20, mw - 4, 1, '#8a5f3a');
    // header
    P(-mw / 2 + 9, -16, 54, 4, '#c8452f');
    P(-mw / 2 + 69, -16, 38, 4, '#f0e8d8');
    P(mw / 2 - 44, -16, 34, 4, 'rgba(240,192,96,0.8)');
    // two columns of items, each with a price tick
    for (var row = 0; row < 3; row++) {
      for (var col = 0; col < 2; col++) {
        var bx = -mw / 2 + 10 + col * 112;
        var by = -9 + row * 4;
        P(bx, by, 62, 1, 'rgba(238,220,182,0.55)');
        P(bx + 84, by, 16, 1, 'rgba(240,192,96,0.85)');
      }
    }
    return true;
  }

  if (k === 'wallClock') {
    P(-8, -18, 16, 16, '#2a2a32');
    P(-7, -17, 14, 14, '#e8e4d8');
    P(-1, -15, 1, 5, '#2a2a32');
    P(0, -11, 5, 1, '#2a2a32');
    P(-1, -11, 2, 2, '#b03a2a');
    for (var t2 = 0; t2 < 4; t2++) {
      P(-1, -16 + t2 * 3, 1, 1, 'rgba(60,60,70,0.4)');
    }
    return true;
  }

  if (k === 'wallPoster') {
    P(-10, -20, 20, 20, '#2a1c12');
    P(-9, -19, 18, 18, '#c8452f');
    P(-7, -16, 14, 3, '#f6ecd8');
    P(-7, -11, 10, 2, '#f6ecd8');
    P(-7, -7, 12, 1, '#f6ecd8');
    P(-7, -4, 7, 1, '#f6ecd8');
    return true;
  }

  if (k === 'queueSign') {
    P(-4, -3, 8, 2, '#5a5a66');
    P(-1, -16, 2, 14, '#8a8a96');
    P(-10, -30, 20, 13, '#2a2a32');
    P(-9, -29, 18, 11, '#f0e8d8');
    P(-7, -26, 14, 1, '#4a4a54');
    P(-7, -23, 9, 1, '#4a4a54');
    P(-7, -20, 11, 1, '#b03a2a');
    return true;
  }

  if (k === 'condiments') {
    P(-7, -4, 14, 4, '#9a9aa8');            // caddy base
    P(-6, -11, 3, 7, '#c8452f');            // ketchup
    P(-6, -12, 3, 2, '#e8e0d0');
    P(-1, -10, 3, 6, '#e8c02a');            // mustard
    P(-1, -11, 3, 2, '#f0e0a0');
    P(4, -9, 3, 5, '#4a7a4a');              // the green one nobody trusts
    return true;
  }

  if (k === 'trash') {
    P(-7, -2, 14, 3, 'rgba(0,0,0,0.20)');
    P(-7, -18, 14, 18, '#3a3a42');
    P(-6, -17, 12, 16, '#4a4a54');
    P(-5, -16, 10, 3, '#22222a');           // the flap
    P(-4, -13, 8, 1, '#5c5c66');
    P(-2, -18, 4, 1, '#8a8a96');
    return true;
  }

  if (k === 'mat') {
    P(-9, -12, 18, 12, '#2f3a44');
    P(-8, -11, 16, 10, '#3d4a54');
    for (var i = 0; i < 4; i++) {
      P(-6 + i * 4, -9, 2, 6, 'rgba(200,205,210,0.22)');
    }
    return true;
  }
  return false;
});

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (k !== 'twigSign' && k !== 'boat' && k !== 'arbysSign' && k !== 'menu' &&
      k !== 'register' && k !== 'tray') return false;
  var P = propPainter(c, e);

  if (k === 'register') {
    P(-8, -20, 16, 12, '#c8c8d0');
    P(-7, -19, 14, 10, '#e0e0e8');
    P(-5, -17, 10, 5, '#2a3040');
    P(-4, -16, 8, 3, '#4a8ab0');
    P(-8, -9, 16, 9, '#9a9aa8');
    P(-6, -7, 12, 1, '#6a6a78');
    return true;
  }

  if (k === 'tray') {
    P(-9, -4, 18, 4, '#b03a2a');
    P(-7, -6, 6, 2, '#e0d8b8');
    P(0, -6, 7, 2, '#e0d8b8');
    P(-1, -8, 4, 2, '#c8a040');
    return true;
  }

  if (k === 'twigSign') {
    P(-1, -20, 3, 20, '#7a5a34');
    P(-8, -30, 17, 11, '#d8c890');
    P(-7, -29, 15, 9, '#f0e8c8');
    P(-5, -26, 11, 1, '#8a7a5a');
    P(-5, -23, 8, 1, '#8a7a5a');
    P(-4, -20, 5, 1, '#b03030');
    if (!G.flags.ch1_twig) {
      var g = 0.35 + 0.25 * Math.sin(G.time * 4);
      c.globalAlpha = g; c.fillStyle = '#fff6c0';
      c.fillRect(Math.round(e.px) - 2, Math.round(e.py) - 34, 2, 2);
      c.globalAlpha = 1;
    }
    return true;
  }

  if (k === 'boat') {
    P(-10, -8, 20, 5, '#3970c0');
    P(-8, -6, 16, 2, '#4f8ad8');
    P(-1, -18, 2, 10, '#c8b090');
    P(1, -18, 8, 7, '#f4f4f4');
    P(1, -13, 8, 2, '#e05858');
    return true;
  }

  if (k === 'arbysSign') {
    P(-14, -34, 28, 14, '#8a2f22');
    P(-13, -33, 26, 12, '#c8452f');
    P(-10, -29, 20, 3, '#f4e8d0');
    P(-8, -24, 16, 2, '#f4e8d0');
    P(-2, -20, 4, 20, '#6a3a22');
    return true;
  }

  if (k === 'menu') {
    P(-26, -34, 52, 16, '#2a2018');
    P(-25, -33, 50, 14, '#3a2c20');
    for (var i = 0; i < 4; i++) {
      P(-22, -30 + i * 3, 22, 1, 'rgba(240,220,180,0.55)');
      P(16, -30 + i * 3, 6, 1, 'rgba(240,200,120,0.7)');
    }
    return true;
  }
  return false;
});

// ------------------------------------------------------------------ scripts

SCRIPT.ch1Twig = function () {
  say([
    { who: 'narrator', text: 'Mav was sauntering home from school, dragging a backpack that was mostly old peanut butter and ancient gym socks.' },
    { who: 'narrator', text: 'Then he came across a truly majestic sight: a wooden dam that looked suspiciously like a giant, slightly damp log pancake.' },
    { who: 'maverick', text: 'Huh.' },
    { who: 'narrator', text: 'One twig stuck out of it. A very important-looking twig, with a tiny glittery sign: DO NOT TOUCH. Seriously. - B.B.' },
    { who: 'maverick', text: 'Well. Now I have to.', choices: [
      { label: 'Pull the twig.', reply: [
        { who: 'narrator', text: 'He pulled the twig.' }
      ] },
      { label: 'Pull it with both hands, for confidence.', reply: [
        { who: 'narrator', text: 'He pulled the twig with both hands. Confidence was supplied. Nothing else was.' }
      ] },
      { label: 'Be responsible for once.', reply: [
        { who: 'narrator', text: 'Mav considered being responsible. He gave it a full second.' },
        { who: 'maverick', text: 'Yeah, no.' }
      ] }
    ] }
  ], chapterOneFlood);
};

function chapterOneFlood() {
  G.flags.ch1_twig = true;
  saveGame();
  SFX.blast();
  G.shake = 1.4; G.flash = 0.6;
  for (var i = 0; i < 40; i++) {
    G.splash.push({
      x: G.px + (Math.random() - 0.5) * 120, y: G.py - 20 - Math.random() * 40,
      vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 90,
      life: 0.7 + Math.random() * 0.6, c: ['#9ac8f0', '#6fa8e0', '#e0e0e0'][Math.floor(Math.random() * 3)]
    });
  }
  say([
    { who: 'narrator', text: 'The sound was not rushing water. It was a giant wooden zipper.' },
    { who: 'narrator', text: 'The dam unzipped. A torrent took three decorative garden gnomes and one miniature sailboat with it.' },
    { who: 'maverick', text: 'Oh no.' },
    { who: 'narrator', text: 'Mav started backing away when a very cross-looking beaver in a tiny, perfectly pressed tweed vest popped up out of the foam.' }
  ], function () {
    G.toScene('b_dam_n', 12, 12, 'right');
    setTimeout(chapterOneBuckAppears, 900);
  });
}

function chapterOneBuckAppears() {
  if (G.sceneId !== 'b_dam_n') return;
  say([
    { who: 'bucktooth', text: 'Young man! Do you realize what you have done? That dam was a masterpiece! A structural poem!' },
    { who: 'bucktooth', text: 'My daughter Penelope spent ALL MORNING arranging those sticks. She will be inconsolable. Her emotional dam will burst!' },
    { who: 'maverick', text: 'Professor Balthazar Bucktooth. If it falls apart when a kid pulls a twig, maybe Penelope needs a less snappable poem.' },
    { who: 'bucktooth', text: 'It is always easier to ruin something beautiful than to construct something from the ground up. That is the tragedy of art, and also probably structural engineering.' },
    { who: 'maverick', text: 'Fine. What do I owe you? Five bucks? A high-five?' },
    { who: 'bucktooth', text: 'I need no money! I require only one thing. The most exquisite architectural marvel of our time.' },
    { who: 'bucktooth', text: 'Bring me a MEAT MOUNTAIN from Arby\'s. All the meats, piled high, and I shall fix this tragedy with the tear-soaked wood of my own supply.' },
    { who: 'narrator', text: '[He is completely serious. He has a permit and everything. It says BORED on it.]' },
    { who: 'maverick', text: 'A deli platter disguised as a sandwich. Sure. That is a normal price for a flood.' }
  ], function () {
    G.flags.ch1_quest = true;
    saveGame();
    toast('objective: Arby\'s, east');
  });
}

SCRIPT.ch1Buck = function () {
  if (G.flags.ch1_fed) {
    say([{ who: 'bucktooth', text: 'The dam is fixed. The poem is restored. Do not pull anything else.' }]);
    return;
  }
  if (!G.flags.hasSandwich) {
    say([
      { who: 'bucktooth', text: 'Where is my sandwich, Maverick? The wood is getting emotional.' },
      { who: 'maverick', text: 'Working on it. East. Arby\'s. Big sign. Very red.' }
    ]);
    return;
  }
  // the handover
  G.flags.hasSandwich = false;
  G.flags.ch1_left = Math.max(0, G.floodT || 0);
  FX.burst(G.px, G.py - 10, '#f0c060', 18, { speed: 60, life: 0.7 });
  FX.pop(G.px, G.py - 26, 'DELIVERED', '#9be08a');
  SFX.pickup();
  say([
    { who: 'bucktooth', text: 'Is that... is that a Meat Mountain? It is GLISTENING. It is a monument.' },
    { who: 'maverick', text: 'It cost three dollars and my dignity.' },
    { who: 'narrator', text: 'Professor Bucktooth devoured the sandwich in three rapid, messy chomps.' },
    { who: 'bucktooth', text: 'BEHOLD! The tragedy is averted! Justice is served, and so was a phenomenal amount of brisket!' },
    { who: 'narrator', text: 'He fixed the dam in under ten seconds. It looked exactly like it did before, except slightly more emotional.' }
  ], function () {
    G.flags.ch1_fed = true;
    saveGame();
    G.toScene('b_dam_fix', 12, 12, 'right');
    setTimeout(chapterOnePenelope, 800);
  });
};

function chapterOnePenelope() {
  if (G.sceneId !== 'b_dam_fix') return;
  say([
    { who: 'narrator', text: 'Just then, Penelope the daughter beaver paddled up. She took one look at the freshly repaired dam and sniffed.' },
    { who: 'penelope', text: 'Ugh. Dams are boring. I am done with hydro-engineering. I am just going to go play Fortnite.' },
    { who: 'bucktooth', text: 'Over my dead body, you will!' },
    { who: 'narrator', text: 'Professor Bucktooth leaped head-first, tweed vest and all, right into the center of the dam.' }
  ], function () {
    SFX.blast();
    G.shake = 1.6; G.flash = 0.8;
    setTimeout(function () {
      say([
        { who: 'narrator', text: 'There was a deafening BOOM. The dam did not just break. It exploded.' },
        { who: 'narrator', text: 'A tidal wave of water, logs, gnomes and one fully inflated Arby\'s bag went straight over everyone.' }
      ], function () {
        G.toScene('b_puddle', 8, 9, 'right');
        setTimeout(chapterOneEnding, 900);
      });
    }, 700);
  });
}

function chapterOneEnding() {
  if (G.sceneId !== 'b_puddle') return;
  say([
    { who: 'narrator', text: 'Mav, Professor Bucktooth and Penelope were washed about thirty feet downstream and landed in a very large, giggling pile of mud.' },
    { who: 'maverick', text: 'Well.' },
    { who: 'maverick', text: 'That was certainly a thing that happened.' },
    { who: 'bucktooth', text: 'Structurally, that was the best thing that has happened to this family all year.' },
    { who: 'penelope', text: 'I am still playing Fortnite.' },
    { who: 'bucktooth', text: 'I know. I have made peace with it. Mostly. Not at all.' },
    { who: 'narrator', text: 'Mav waved at the very damp, still-chortling beaver family and finally, weirdly, happily, walked home.' }
  ], function () {
    var left = Math.round(G.flags.ch1_left || 0);
    cleared(1, left / 45 * 100, left + 's to spare');
  });
}

SCRIPT.ch1Kevin = function () {
  say([
    { who: 'kevin', text: 'Quack.' },
    { who: 'narrator', text: '[Kevin is standing in the middle of a road, in front of a fast food restaurant, being fine about it.]' },
    { who: 'maverick', text: 'Sandwich emergency. Talk later.' },
    { who: 'kevin', text: 'Quack.' }
  ]);
};

SCRIPT.ch1Clerk = function () {
  if (G.flags.hasSandwich) {
    say([{ who: 'arbys_clerk', text: 'You already have one. We do not do refunds and we definitely do not do seconds.' }]);
    return;
  }
  say([
    { who: 'arbys_clerk', text: 'Welcome to Arby\'s. We have the meats.' },
    { who: 'maverick', text: 'I need a Meat Mountain.' },
    { who: 'arbys_clerk', text: 'Nobody has ever ordered that. It is not on the menu. It is a rumor with a price.' },
    { who: 'maverick', text: 'What is the price?', choices: [
      { label: 'Three dollars and my dignity.', act: function () { G._ch1pay = 'dignity'; }, reply: [
        { who: 'arbys_clerk', text: 'Correct. That is exactly the price. Do not ask how I know.' }
      ] },
      { label: 'Do you take wet leaves?', act: function () { G._ch1pay = 'leaves'; }, reply: [
        { who: 'arbys_clerk', text: 'We do not. But I respect the honesty.' }
      ] },
      { label: 'Put it on the beaver\'s tab.', act: function () { G._ch1pay = 'tab'; }, reply: [
        { who: 'arbys_clerk', text: 'The beaver has a tab? The beaver has a TAB. I am going to think about that all day.' }
      ] }
    ] },
    { who: 'narrator', text: 'Mav wrestled a massive, glistening monument of meat into a bag and hauled it back out the door.' },
    { who: 'arbys_clerk', text: 'It is going to get heavier. That is not a threat, it is thermodynamics.' }
  ], function () {
    G.flags.hasSandwich = true;
    G.floodT = 45;
    G.speedMul = 0.66;
    G.flags['seen_drift1'] = true;
    G.flags['seen_drift2'] = true;
    G.flags['seen_drift3'] = true;
    saveGame();
    toast('hold on to the sandwich');
  });
};

// ------------------------------------------------------------------- ticking

// NPCs with a `pace` value walk a short beat back and forth, which is what the
// walk sheets are for. They pause while anyone is talking.
TICK_HOOKS.push(function (dt) {
  if (DLG.active) return;
  for (var i = 0; i < G.ents.length; i++) {
    var e = G.ents[i];
    if (!e.pace) continue;
    if (e._pdir === undefined) { e._pdir = 1; e._pfrom = e.px - 20; e._pto = e.px + 20; }
    e.px += e._pdir * e.pace * dt;
    if (e.px > e._pto) { e.px = e._pto; e._pdir = -1; }
    if (e.px < e._pfrom) { e.px = e._pfrom; e._pdir = 1; }
    e.dir = e._pdir > 0 ? 'right' : 'left';
    e.moving = true;
  }
});

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch1' || !G.flags.hasSandwich || DLG.active) return;

  G.floodT -= dt;

  // gnomes washing down the road want a bite
  for (var i = 0; i < G.ents.length; i++) {
    var e = G.ents[i];
    if (!e.drift) continue;
    e.px += e.drift * dt;
    if (e.px < 24) { e.px = 24; e.drift = Math.abs(e.drift); }
    if (e.px > W - 24) { e.px = W - 24; e.drift = -Math.abs(e.drift); }
    var dx = e.px - G.px, dy = e.py - G.py;
    if (Math.abs(dx) < 13 && Math.abs(dy) < 16 && (!G.gnomeHitT || G.time > G.gnomeHitT)) {
      G.gnomeHitT = G.time + 1.6;
      G.floodT = Math.max(1, G.floodT - 3);
      e.drift = -e.drift;
      G.shake = 0.5;
      toast('a gnome got a bite of the sandwich');
      SFX.tone(180, 0.12, 'square', 0.05);
    }
  }

  if (G.floodT <= 0) {
    G.floodT = 45;
    G.flags.retries = (G.flags.retries || 0) + 1;
    saveGame();
    toast('the water got away. back to the counter.');
    G.toScene('b_arbys', 8, 14, 'right');
  }
});

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch1' || !G.flags.hasSandwich) return;
  var bw = 150, bh = 7, bx = (W - bw) / 2, by = H - 26;
  c.fillStyle = 'rgba(18,16,28,0.85)';
  c.fillRect(bx - 3, by - 3, bw + 6, bh + 6);
  c.fillStyle = '#2a2438';
  c.fillRect(bx, by, bw, bh);
  var f = Math.max(0, Math.min(1, G.floodT / 45));
  c.fillStyle = f > 0.4 ? '#8ad07a' : f > 0.2 ? '#f0c060' : '#e06050';
  c.fillRect(bx, by, bw * f, bh);
  c.strokeStyle = 'rgba(244,228,192,0.5)';
  c.lineWidth = 1;
  c.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
  c.textAlign = 'center';
  c.font = 'bold 7px monospace';
  c.fillStyle = '#f4efe4';
  c.fillText('SANDWICH RUN  ' + Math.ceil(G.floodT) + 's', W / 2, by - 6);
  c.textAlign = 'left';
});

// ------------------------------------------------------------------ chapter

CHAPTER_CONTENT[1] = {
  start: 'b_dam',

  intro: function () {
    chapterCard('CHAPTER ONE', 'The Case of the Extremely Expensive Sandwich', 3.4);
    setTimeout(function () {
      if (G.level !== 'ch1') return;
      say([
        { who: 'narrator', text: 'In which a twig is pulled, a river is released, and a beaver charges a very specific sandwich.' }
      ]);
    }, 900);
  },

  resume: function () {
    if (G.flags.hasSandwich) { G.speedMul = 0.66; toast('you still have the sandwich'); }
  },

  objective: function () {
    if (G.flags.hasSandwich) return 'objective: get the Meat Mountain to the dam (' + Math.ceil(G.floodT) + 's)';
    if (G.flags.ch1_fed) return '';
    if (G.sceneId === 'b_dam' && !G.flags.ch1_twig) return 'objective: that twig is asking for it';
    if (G.sceneId === 'b_arbys') return 'objective: talk to the counter';
    if (G.sceneId === 'b_road') return 'objective: Arby\'s is east';
    if (G.flags.ch1_quest) return 'objective: bring Bucktooth the Meat Mountain';
    return '';
  }
};
