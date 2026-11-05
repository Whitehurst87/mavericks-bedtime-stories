// ch49.js - Chapter 49: Mav and the Revenge of Ursula Ditkovich
//
// The Clovis Multiplex. Bucktooth incites a lobby full of Spider-Man
// cosplayers over the treatment of Ursula Ditkovich, and the only way out is
// four escalating speeches delivered from the concession counter.
//
//   c49_lobby       the lobby before the trouble: posters, arcade cabinets,
//                   a popcorn machine, a pretzel warmer, a rope stanchion
//   c49_concession  the same room, one minute later, with fifteen cosplayers
//                   swinging, wrapping each other in two-ply, and a manager
//                   coming apart at the seams
//
// The mechanic is crowd control with two meters. RIOT starts at 100 and only
// four good speeches bring it down. MELTDOWN rises on its own the whole time
// and, if it fills, the manager blows his top and the night starts over. There
// is no losing, only doing it again with more shame.

var CH49 = {
  on: false,        // the crowd control loop is live
  calm: false,      // the fourth speech landed
  riot: 100,
  meltdown: 0,
  speech: 0,        // speeches successfully delivered, 0..4
  chant: false,     // the CHANT bar is sweeping
  marker: 0,        // 0..1 along the bar
  dir: 1,           // sweep direction, it bounces
  speed: 0.62,      // bar sweeps per second, faster every speech
  window: [0.42, 0.66],
  misses: 0,
  restarts: 0
};

var CH49_RATE = 0.9;       // meltdown per second, before anyone gets shouty
var CH49_MISS = 9;         // meltdown for a shout nobody heard

NAMES.whiskey = 'TOBEY MAGUIRE';   // the man in the dark jacket in the corner

// ------------------------------------------------------------------- room

// The lobby and the concession area are the same room. Both scenes share the
// floorplan and the fittings so the second one reads as the first one, ruined.
function ch49Rects() {
  return [
    { x: 0, y: 0, w: 32, h: 3, t: 'c49Wall' },
    { x: 0, y: 3, w: 32, h: 1, t: 'c49Wall' },        // a lip of wall behind the counter
    { x: 5, y: 3, w: 22, h: 1, t: 'c49CounterTop' },
    { x: 5, y: 4, w: 22, h: 2, t: 'c49CounterFront' },
    { x: 0, y: 0, w: 1, h: 18, t: 'c49Wall' },
    { x: 31, y: 0, w: 1, h: 18, t: 'c49Wall' },
    { x: 0, y: 17, w: 32, h: 1, t: 'c49Wall' }
  ];
}

// everything bolted down: the fittings, the machines, the queue
function ch49Props() {
  return [
    { id: 'c49_marquee', who: null, tx: 16, ty: 2, kind: 'c49_marquee', propScale: 1, noSolid: true },
    { id: 'c49_posterA', who: null, tx: 8, ty: 2, kind: 'c49_posterA', propScale: 1, noSolid: true },
    { id: 'c49_posterB', who: null, tx: 26, ty: 2, kind: 'c49_posterB', propScale: 1, noSolid: true },
    { id: 'c49_sign', who: null, tx: 16, ty: 3, kind: 'c49_counterSign', propScale: 1, noSolid: true },
    { id: 'c49_pretzel', who: null, tx: 6, ty: 3, kind: 'c49_pretzel', propScale: 1, solid: true, sw: 2, sh: 1 },
    { id: 'c49_soda', who: null, tx: 24, ty: 3, kind: 'c49_soda', propScale: 1, solid: true, sw: 2, sh: 1 },
    { id: 'c49_popcorn', who: null, tx: 22, ty: 3, kind: 'c49_popcorn', propScale: 1, solid: true, sw: 2, sh: 1 },
    { id: 'c49_arcade1', who: null, tx: 2, ty: 8, kind: 'c49_arcade', propScale: 1, solid: true, sw: 2, sh: 2 },
    { id: 'c49_arcade2', who: null, tx: 2, ty: 11, kind: 'c49_arcade', propScale: 1, solid: true, sw: 2, sh: 2 },
    { id: 'c49_booth', who: null, tx: 30, ty: 8, kind: 'c49_booth', propScale: 1, solid: true },
    { id: 'c49_standee', who: null, tx: 28, ty: 9, kind: 'c49_standee', propScale: 1, solid: true },
    { id: 'c49_rope', who: null, tx: 7, ty: 12, kind: 'c49_rope', propScale: 1, noSolid: true, reach: 46, talk: 'ch49Stanchion' },
    { id: 'c49_trash', who: null, tx: 28, ty: 14, kind: 'c49_trash', propScale: 1, solid: true }
  ];
}

function ch49Queue() {
  var spots = [[9, 14], [11, 14], [13, 14], [18, 14], [20, 14]];
  var who = ['taffy', 'adrian', 'kevin', 'clerk', 'nibbles'];
  var out = [];
  for (var i = 0; i < spots.length; i++) {
    out.push({
      id: 'c49_queue' + i, who: who[i], tx: spots[i][0], ty: spots[i][1],
      dir: 'up', noSolid: true, small: i % 2 === 1, talk: 'ch49Cos1'
    });
  }
  return out;
}

function ch49Crowd() {
  var spots = [
    [10, 7], [14, 7], [19, 7], [23, 7],
    [8, 8], [12, 8], [17, 8], [21, 8], [25, 8],
    [10, 9], [15, 9], [20, 9], [24, 9],
    [12, 10], [22, 10]
  ];
  var who = ['adrian', 'taffy', 'clerk', 'kevin', 'nibbles'];
  var out = [];
  for (var i = 0; i < spots.length; i++) {
    out.push({
      id: 'c49_crowd' + i, who: who[i % who.length],
      tx: spots[i][0], ty: spots[i][1],
      dir: 'up', noSolid: true, small: i % 3 === 1,
      talk: 'ch49Cos' + (1 + (i % 3))
    });
  }
  return out;
}

// ------------------------------------------------------------------ scenes

SCENES.c49_lobby = {
  title: 'THE CLOVIS MULTIPLEX',
  spawn: { tx: 16, ty: 13, dir: 'up' },
  camZoom: 1,
  fill: 'c49Carpet',
  rects: ch49Rects(),
  solidKinds: ['c49Wall', 'c49CounterFront'],
  entities: ch49Props().concat(ch49Queue()),
  overlay: function (c) { ch49Paint(c, false); }
};

SCENES.c49_concession = {
  title: 'CONCESSIONS, UNDER SIEGE',
  spawn: { tx: 16, ty: 14, dir: 'up' },
  camZoom: 1,
  fill: 'c49Carpet',
  rects: ch49Rects(),
  solidKinds: ['c49Wall', 'c49CounterFront'],
  entities: ch49Props().concat([
    { id: 'c49_nacho', who: null, tx: 18, ty: 3, kind: 'c49_nacho', propScale: 1, noSolid: true },
    { id: 'buck49', who: 'bucktooth', tx: 18, ty: 3, dir: 'down', noSolid: true, reach: 104, talk: 'ch49Shout', hidden: true },
    { id: 'c49_manager', who: 'arbys_clerk', tx: 25, ty: 6, dir: 'down', noSolid: true, talk: 'ch49Manager' },
    { id: 'c49_tobey', who: 'whiskey', tx: 28, ty: 7, dir: 'left', noSolid: true },
    { id: 'c49_tp1', who: null, tx: 12, ty: 7, kind: 'c49_tp', propScale: 1, noSolid: true, hidden: true },
    { id: 'c49_tp2', who: null, tx: 21, ty: 8, kind: 'c49_tp', propScale: 1, noSolid: true, hidden: true },
    { id: 'c49_tp3', who: null, tx: 9, ty: 10, kind: 'c49_tp', propScale: 1, noSolid: true, hidden: true },
    { id: 'c49_butter', who: null, tx: 24, ty: 9, kind: 'c49_butter', propScale: 1, noSolid: true, hidden: true },
    { id: 'pile49', who: null, tx: 18, ty: 6, kind: 'c49_pile', propScale: 1, noSolid: true, hidden: true }
  ]).concat(ch49Crowd()),
  overlay: function (c) { ch49Paint(c, true); }
};

// --------------------------------------------------------------- the paint

TILE_HOOKS.push(function (c, kind, tx, ty) {
  if (kind !== 'c49Wall' && kind !== 'c49Carpet' && kind !== 'c49CounterTop' && kind !== 'c49CounterFront') return false;
  var x = tx * TILE, y = ty * TILE;
  var r = hash(tx, ty, 53), r2 = hash(tx, ty, 71);
  function R(px, py, w, h, col) { c.fillStyle = col; c.fillRect(x + px, y + py, w, h); }

  if (kind === 'c49Wall') {
    R(0, 0, 16, 16, r > 0.55 ? '#3b2f4c' : r > 0.25 ? '#372b47' : '#3f3352');
    R(2, 0, 1, 16, 'rgba(255,235,210,0.03)');
    R(11, 0, 1, 16, 'rgba(0,0,0,0.06)');
    if (tx % 4 === 0) R(0, 0, 1, 16, 'rgba(0,0,0,0.20)');
    if (ty === 0) {
      // ceiling band with a row of little downlights
      R(0, 0, 16, 16, '#241d31');
      R(0, 13, 16, 3, '#1a1424');
      if (tx % 3 === 0) {
        R(6, 3, 4, 4, '#3a2f3c');
        R(7, 4, 2, 2, '#ffe9a0');
      }
    }
    if (ty === 2) {
      // brass rail along the back of the counter
      R(0, 13, 16, 1, '#8a6a2a');
      R(0, 14, 16, 2, '#c8a44a');
    }
    if (r2 > 0.86) R(5, 8, 1, 1, 'rgba(240,220,180,0.05)');
    return true;
  }

  if (kind === 'c49Carpet') {
    var broad = hash(tx >> 2, ty >> 2, 91);
    R(0, 0, 16, 16, broad > 0.55 ? '#742634' : broad > 0.3 ? '#6c2130' : '#70232f');
    R(0, 0, 16, 1, 'rgba(255,220,200,0.03)');
    if (r > 0.5) {
      // a sparse gold motif worked into the carpet, not a checkerboard
      c.fillStyle = 'rgba(226,190,120,0.14)';
      c.fillRect(x + 7, y + 5, 2, 2);
      c.fillRect(x + 6, y + 7, 4, 1);
      c.fillRect(x + 7, y + 8, 2, 1);
    }
    if (r2 > 0.9) R(0, 15, 16, 1, 'rgba(0,0,0,0.10)');
    if (r2 < 0.12) R(3, 11, 4, 1, 'rgba(255,200,180,0.03)');
    return true;
  }

  if (kind === 'c49CounterTop') {
    R(0, 0, 16, 16, '#c19a68');
    R(0, 0, 16, 3, '#d8b285');
    R(0, 13, 16, 3, '#8a6a44');
    if (r > 0.4) R(2, 6, 12, 1, 'rgba(120,86,50,0.18)');
    if (r2 > 0.55) R(4, 9, 9, 1, 'rgba(120,86,50,0.12)');
    R(3, 4, 4, 8, 'rgba(255,255,255,0.05)');
    return true;
  }

  // c49CounterFront
  R(0, 0, 16, 16, '#43161f');
  R(0, 3, 16, 10, '#55212b');
  R(0, 3, 16, 1, 'rgba(255,190,150,0.08)');
  R(0, 0, 16, 2, '#e0bc6c');
  R(0, 2, 16, 1, '#a8802f');
  R(0, 14, 16, 2, '#2c0d13');
  if (tx % 2 === 0) R(0, 3, 1, 11, 'rgba(0,0,0,0.20)');
  R(2, 6, 12, 6, 'rgba(255,180,140,0.04)');
  if (r > 0.7) R(3, 5, 10, 1, 'rgba(0,0,0,0.10)');
  return true;
});

// baked light, the carpet medallion, and the front doors
function ch49Paint(c, hot) {
  var pools = [120, 264, 400];
  for (var i = 0; i < pools.length; i++) {
    var g = c.createRadialGradient(pools[i], 96, 8, pools[i], 96, 124);
    g.addColorStop(0, 'rgba(255,226,170,0.15)');
    g.addColorStop(1, 'rgba(255,226,170,0)');
    c.fillStyle = g;
    c.fillRect(pools[i] - 124, 0, 248, 210);
  }

  // the medallion in the middle of the lobby carpet
  var cx = 256, cy = 196, r = 62;
  c.save();
  c.globalAlpha = 0.5;
  c.strokeStyle = '#c8a44a';
  c.lineWidth = 2;
  c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1;
  c.beginPath(); c.arc(cx, cy, r - 7, 0, Math.PI * 2); c.stroke();
  c.beginPath();
  for (var k = 0; k < 16; k++) {
    var a = (k / 16) * Math.PI * 2 - Math.PI / 2;
    var rr = k % 2 === 0 ? r - 16 : r - 40;
    var qx = cx + Math.cos(a) * rr, qy = cy + Math.sin(a) * rr;
    if (k === 0) c.moveTo(qx, qy); else c.lineTo(qx, qy);
  }
  c.closePath();
  c.strokeStyle = 'rgba(226,196,130,0.8)';
  c.stroke();
  c.restore();

  // the counter's shadow on the carpet, so the fittings have weight
  var sh = c.createLinearGradient(0, 96, 0, 126);
  sh.addColorStop(0, 'rgba(20,8,14,0.40)');
  sh.addColorStop(1, 'rgba(20,8,14,0)');
  c.fillStyle = sh;
  c.fillRect(80, 96, 352, 30);

  // corner shadow, so the room has a shape
  var vg = c.createRadialGradient(W / 2, 150, 90, W / 2, 150, 300);
  vg.addColorStop(0, 'rgba(10,6,16,0)');
  vg.addColorStop(1, 'rgba(10,6,16,0.55)');
  c.fillStyle = vg;
  c.fillRect(0, 0, W, H);

  if (hot) {
    // the riot lights: house lights half up, everything a little red
    c.fillStyle = 'rgba(170,30,40,0.10)';
    c.fillRect(0, 0, W, H);
  }

  // the front doors, with the Clovis sunset coming through
  c.fillStyle = '#1a1420';
  c.fillRect(222, 262, 68, 26);
  c.fillStyle = 'rgba(255,178,108,0.30)';
  c.fillRect(226, 266, 28, 22);
  c.fillRect(258, 266, 28, 22);
  c.fillStyle = 'rgba(255,216,164,0.55)';
  c.fillRect(230, 270, 9, 9);
  c.fillRect(262, 270, 9, 9);
  c.fillStyle = '#3a2a34';
  c.fillRect(256, 264, 2, 24);
  c.fillStyle = 'rgba(255,190,120,0.10)';
  c.fillRect(214, 258, 84, 6);
}

// ------------------------------------------------------------------ props

var CH49_PROP = {
  c49_marquee: 1, c49_posterA: 1, c49_posterB: 1, c49_counterSign: 1,
  c49_pretzel: 1, c49_popcorn: 1, c49_soda: 1, c49_arcade: 1,
  c49_booth: 1, c49_standee: 1, c49_rope: 1, c49_trash: 1,
  c49_tp: 1, c49_butter: 1, c49_nacho: 1, c49_pile: 1
};

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (!CH49_PROP[k]) return false;
  var P = propPainter(c, e);

  if (k === 'c49_marquee') {
    P(-62, -26, 124, 26, '#120d18');
    P(-60, -24, 120, 22, '#1f1628');
    P(-60, -24, 120, 2, 'rgba(255,214,150,0.22)');
    P(-60, -4, 120, 2, 'rgba(0,0,0,0.35)');
    for (var b = 0; b < 11; b++) {
      P(-58 + b * 11.6, -26, 2, 2, '#f0c060');
      P(-58 + b * 11.6, -2, 2, 2, '#e0a840');
    }
    c.save();
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = 'bold 8px monospace';
    c.fillStyle = '#3a2a10';
    c.fillText('CLOVIS MULTIPLEX', e.px + 1, e.py - 16);
    c.fillStyle = '#f6d98a';
    c.fillText('CLOVIS MULTIPLEX', e.px, e.py - 17);
    c.font = '5px monospace';
    c.fillStyle = 'rgba(240,224,180,0.70)';
    c.fillText('MADAME WEB   /   SPIDER-MAN 3', e.px, e.py - 8);
    c.restore();
    return true;
  }

  if (k === 'c49_posterA') {
    // Madame Web, in a frame, on the wall
    P(-19, -44, 38, 44, '#241a2e');
    P(-17, -42, 34, 40, '#e6dcc8');
    P(-15, -40, 30, 30, '#3a1f4a');
    P(-15, -40, 30, 3, '#2a1438');
    P(-6, -40, 1, 30, 'rgba(220,200,235,0.22)');
    P(-15, -28, 30, 1, 'rgba(220,200,235,0.18)');
    P(-15, -22, 30, 1, 'rgba(220,200,235,0.12)');
    P(-9, -30, 13, 13, '#6a2440');
    P(-7, -28, 9, 9, '#a83a4a');
    P(-5, -25, 2, 2, '#f0e8d0');
    P(-1, -25, 2, 2, '#f0e8d0');
    P(-15, -10, 30, 10, '#1a1024');
    c.save();
    c.textAlign = 'center';
    c.font = 'bold 5px monospace';
    c.fillStyle = '#c8a2e8';
    c.fillText('MADAME WEB', e.px, e.py - 3);
    c.restore();
    return true;
  }

  if (k === 'c49_posterB') {
    // Spider-Man 3, red and blue, slightly sun faded
    P(-19, -44, 38, 44, '#241a2e');
    P(-17, -42, 34, 40, '#e6dcc8');
    P(-15, -40, 30, 30, '#8a1f1f');
    P(-15, -40, 30, 3, '#6a1414');
    P(-11, -34, 22, 18, '#2f4a8a');
    P(-8, -38, 16, 8, '#c8352f');
    P(-15, -30, 30, 1, 'rgba(20,10,20,0.35)');
    P(-15, -24, 30, 1, 'rgba(20,10,20,0.30)');
    P(-6, -36, 2, 2, '#e8e8f0');
    P(2, -36, 2, 2, '#e8e8f0');
    P(-15, -10, 30, 10, '#1a1024');
    c.save();
    c.textAlign = 'center';
    c.font = 'bold 5px monospace';
    c.fillStyle = '#f0c0a0';
    c.fillText('SPIDER-MAN 3', e.px, e.py - 3);
    c.restore();
    return true;
  }

  if (k === 'c49_counterSign') {
    c.save();
    c.textAlign = 'center';
    c.font = 'bold 7px monospace';
    c.fillStyle = 'rgba(0,0,0,0.45)';
    c.fillText('CONCESSIONS', e.px + 1, e.py + 8);
    c.fillStyle = '#e8c878';
    c.fillText('CONCESSIONS', e.px, e.py + 7);
    c.restore();
    for (var b2 = 0; b2 < 9; b2++) P(-46 + b2 * 11.5, 11, 2, 2, '#f0d080');
    return true;
  }

  if (k === 'c49_pretzel') {
    // the pretzel warmer, recently cleaned
    P(-16, -3, 32, 3, 'rgba(0,0,0,0.22)');
    P(-15, -32, 30, 32, '#8a8f99');
    P(-15, -32, 30, 2, '#b0b6c0');
    P(-13, -30, 26, 24, '#3a4450');
    P(-13, -28, 26, 4, 'rgba(255,180,90,0.28)');
    function pretzel(px2, py2) {
      P(px2, py2, 6, 4, '#a2622a');
      P(px2 + 1, py2 + 1, 2, 2, '#3a4450');
      P(px2, py2, 1, 1, '#c8843e');
    }
    pretzel(-10, -26); pretzel(-2, -26); pretzel(5, -25);
    pretzel(-9, -18); pretzel(-1, -19); pretzel(6, -18);
    P(-13, -14, 26, 1, '#8a8f99');
    P(-15, -10, 30, 1, 'rgba(255,180,90,0.12)');
    P(-3, -34, 6, 3, '#e07a2a');
    P(-16, -36, 32, 2, '#6a707c');
    return true;
  }

  if (k === 'c49_popcorn') {
    P(-19, -3, 38, 3, 'rgba(0,0,0,0.25)');
    P(-17, -16, 34, 14, '#8a2a2e');
    P(-17, -16, 34, 2, '#b03a3e');
    P(-15, -46, 30, 30, '#2a2a34');
    P(-13, -44, 26, 26, 'rgba(255,230,170,0.10)');
    P(-13, -38, 26, 20, '#f0d878');
    P(-11, -40, 4, 4, '#f8e49a');
    P(-5, -41, 4, 3, '#f8e49a');
    P(2, -39, 4, 4, '#e8c868');
    P(8, -40, 4, 3, '#f8e49a');
    P(-13, -30, 26, 12, '#e0c060');
    P(-15, -46, 30, 2, '#c8a84a');
    P(-4, -52, 8, 5, '#ffe9a0');
    P(-2, -51, 4, 3, '#fff8d0');
    P(15, -34, 4, 8, '#8a8f99');
    return true;
  }

  if (k === 'c49_soda') {
    P(-13, -3, 26, 3, 'rgba(0,0,0,0.22)');
    P(-12, -8, 24, 6, '#3a3f48');
    P(-11, -34, 22, 26, '#5a626e');
    P(-11, -34, 22, 2, '#7a828e');
    for (var n = 0; n < 3; n++) {
      P(-9 + n * 8, -40, 3, 6, '#8a8f99');
      P(-9 + n * 8, -41, 3, 2, '#c8ced8');
    }
    P(-9, -31, 4, 3, '#e8607a');
    P(-3, -31, 4, 3, '#68c8e8');
    P(3, -31, 4, 3, '#9be08a');
    P(-12, -12, 24, 4, '#2a2f36');
    return true;
  }

  if (k === 'c49_arcade') {
    var tint = hash(e.tx, e.ty, 5) > 0.5 ? '#68c8e8' : '#e8607a';
    P(-18, -3, 36, 3, 'rgba(0,0,0,0.25)');
    P(-17, -56, 34, 53, '#241a2e');
    P(-17, -56, 34, 2, '#3a2a44');
    P(-15, -54, 30, 8, tint);
    P(-15, -54, 30, 2, 'rgba(255,255,255,0.25)');
    P(-14, -44, 28, 20, '#0c1218');
    P(-13, -43, 26, 18, '#10283a');
    P(-9, -40, 6, 4, 'rgba(150,230,255,0.55)');
    P(-1, -37, 9, 3, 'rgba(150,230,255,0.30)');
    P(-13, -38, 26, 1, 'rgba(0,0,0,0.25)');
    P(-13, -33, 26, 1, 'rgba(0,0,0,0.25)');
    P(-16, -22, 32, 6, '#3a2a44');
    P(-16, -22, 32, 1, '#4e3a5c');
    P(-11, -28, 2, 6, '#8a8f99');
    P(-11, -30, 4, 3, '#c8ced8');
    P(2, -27, 3, 3, '#e8607a');
    P(7, -27, 3, 3, '#f0c060');
    P(-3, -15, 6, 4, '#141018');
    P(-2, -14, 1, 2, '#f0c060');
    P(-16, -46, 32, 24, 'rgba(120,200,255,0.05)');
    return true;
  }

  if (k === 'c49_booth') {
    // the ticket window, closed, because everyone is already inside
    P(-16, -44, 32, 44, '#3a2430');
    P(-14, -42, 28, 40, '#241722');
    P(-13, -40, 26, 24, '#142430');
    P(-13, -40, 26, 3, 'rgba(160,220,255,0.18)');
    P(-4, -40, 2, 24, '#3a2430');
    P(-13, -14, 26, 4, '#6a4a2a');
    P(-14, -46, 28, 4, '#c8a44a');
    c.save();
    c.textAlign = 'center';
    c.font = 'bold 5px monospace';
    c.fillStyle = '#2a1a10';
    c.fillText('TICKETS', e.px, e.py - 43);
    c.restore();
    return true;
  }

  if (k === 'c49_standee') {
    // a life size cardboard Spider-Man, slightly warped
    P(-18, -2, 36, 3, 'rgba(0,0,0,0.22)');
    P(-16, -4, 32, 4, '#3a3038');
    P(-13, -60, 26, 56, '#e8e4d8');
    P(-11, -58, 22, 52, '#c8352f');
    P(-11, -34, 22, 8, '#2f4a8a');
    P(-8, -58, 16, 10, '#c8352f');
    P(-6, -68, 12, 10, '#c8352f');
    P(-4, -66, 8, 6, '#2a2a34');
    P(-4, -65, 3, 2, '#e8e8f0');
    P(2, -65, 3, 2, '#e8e8f0');
    P(-11, -50, 22, 1, 'rgba(20,10,20,0.35)');
    P(-11, -42, 22, 1, 'rgba(20,10,20,0.30)');
    P(-9, -20, 7, 16, '#2f4a8a');
    P(2, -20, 7, 16, '#2f4a8a');
    P(11, -54, 8, 4, '#c8352f');
    P(-13, -70, 26, 2, '#d8d4c4');
    return true;
  }

  if (k === 'c49_rope') {
    function post(dx) {
      P(dx - 5, -2, 10, 3, '#4a3a2a');
      P(dx - 2, -30, 4, 30, '#c8a44a');
      P(dx - 2, -30, 1, 30, '#e0c070');
      P(dx - 4, -34, 8, 5, '#d8b45a');
    }
    post(-44);
    post(44);
    for (var s = 0; s < 10; s++) {
      var t = s / 9;
      var xx = -44 + t * 84;
      var yy = -32 + Math.sin(t * Math.PI) * 8;
      P(xx, yy, 9, 2, '#8a1f2f');
      P(xx, yy, 9, 1, '#a83a46');
    }
    return true;
  }

  if (k === 'c49_trash') {
    P(-11, -2, 22, 2, 'rgba(0,0,0,0.22)');
    P(-10, -26, 20, 25, '#4a4f5a');
    P(-10, -26, 20, 2, '#6a707c');
    for (var t2 = 0; t2 < 3; t2++) P(-10, -20 + t2 * 6, 20, 1, 'rgba(0,0,0,0.18)');
    P(-12, -30, 24, 5, '#6a707c');
    P(-12, -30, 24, 1, '#8a909c');
    P(-14, -2, 6, 2, '#f0e0a0');
    P(9, -3, 5, 2, '#f0e0a0');
    P(8, -8, 7, 6, '#f2efe4');
    P(8, -8, 7, 1, '#d8d4c4');
    return true;
  }

  if (k === 'c49_tp') {
    // a streamer of two ply, thrown with great confidence
    for (var i = 0; i < 15; i++) {
      var t3 = i / 14;
      var yy2 = -76 + t3 * 74;
      var xx2 = Math.sin(t3 * 5 + e.tx * 0.7) * 8;
      P(xx2 - 1, yy2, 4, 6, '#f4f1e6');
      P(xx2 - 1, yy2 + 4, 4, 2, 'rgba(210,205,190,0.55)');
    }
    for (var j = 0; j < 8; j++) {
      var t4 = j / 7;
      P(6 + Math.sin(t4 * 4 + e.ty) * 5, -50 + t4 * 44, 2, 5, '#e8e4d6');
    }
    return true;
  }

  if (k === 'c49_butter') {
    P(-11, -3, 22, 3, 'rgba(0,0,0,0.18)');
    P(-12, -4, 26, 3, '#e8c24a');
    P(-9, -12, 14, 9, '#c8a84a');
    P(-9, -12, 14, 2, '#e0c070');
    P(4, -9, 5, 2, '#8a8f99');
    P(-6, -16, 5, 4, '#8a8f99');
    return true;
  }

  if (k === 'c49_nacho') {
    // the tub stack the professor is standing on
    P(-9, -3, 18, 3, 'rgba(0,0,0,0.20)');
    P(-8, -13, 16, 10, '#e0a83a');
    P(-8, -13, 16, 2, '#f0c060');
    P(-7, -11, 14, 3, '#8a5a1a');
    P(-7, -24, 14, 10, '#e0a83a');
    P(-7, -24, 14, 2, '#f0c060');
    P(-6, -22, 12, 3, '#8a5a1a');
    P(4, -30, 3, 8, '#8a8f99');
    return true;
  }

  if (k === 'c49_pile') {
    // a mound of popcorn with one extremely offended doll in it
    P(-20, -2, 40, 3, 'rgba(0,0,0,0.18)');
    P(-19, -10, 38, 9, '#f0e0a0');
    P(-16, -14, 12, 6, '#f8e8b0');
    P(-4, -13, 14, 6, '#e8d490');
    P(10, -11, 8, 6, '#f8e8b0');
    P(-6, -20, 12, 8, '#8d5a34');
    P(-7, -22, 4, 3, '#8d5a34');
    P(3, -22, 4, 3, '#8d5a34');
    P(-4, -19, 3, 2, '#3a2414');
    P(1, -19, 3, 2, '#3a2414');
    P(-8, -18, 6, 1, '#1a1424');
    P(2, -17, 6, 1, '#1a1424');
    P(-3, -14, 6, 3, '#f4efe4');
    P(-2, -15, 2, 1, '#ffffff');
    P(0, -15, 2, 1, '#ffffff');
    P(-12, -8, 5, 4, '#f8e8b0');
    P(8, -7, 6, 4, '#f8e8b0');
    return true;
  }

  return false;
});

// the popcorn tub and the doll in the hoodie pocket
PLAYER_HOOKS.push(function (c) {
  if (G.level !== 'ch49' || G.sceneId !== 'c49_lobby') return;
  var x = Math.round(G.px), y = Math.round(G.py);
  // tub, striped, absurdly expensive
  c.fillStyle = '#f0ece0';
  c.fillRect(x + 3, y - 10, 7, 8);
  c.fillStyle = '#c8452f';
  c.fillRect(x + 3, y - 10, 7, 2);
  c.fillRect(x + 3, y - 6, 7, 1);
  c.fillStyle = '#f6d878';
  c.fillRect(x + 3, y - 13, 2, 3);
  c.fillRect(x + 6, y - 14, 2, 4);
  c.fillRect(x + 9, y - 12, 2, 2);
  // the doll, wedged in the pocket, radiating grievance
  c.fillStyle = '#8d5a34';
  c.fillRect(x - 9, y - 14, 6, 5);
  c.fillStyle = '#7a4c2c';
  c.fillRect(x - 10, y - 16, 2, 2);
  c.fillRect(x - 4, y - 16, 2, 2);
  c.fillStyle = '#3a2414';
  c.fillRect(x - 8, y - 13, 2, 1);
  c.fillRect(x - 5, y - 13, 2, 1);
  c.fillStyle = '#1a1424';
  c.fillRect(x - 9, y - 12, 3, 1);
  c.fillRect(x - 5, y - 12, 3, 1);
});

// ---------------------------------------------------------------- mechanic

function ch49Save() {
  G.flags.c49_riot = CH49.riot;
  G.flags.c49_melt = CH49.meltdown;
  G.flags.c49_speech = CH49.speech;
  G.flags.c49_calm = CH49.calm ? 1 : 0;
  saveGame();
}

function ch49Score() {
  var s = 100 - Math.round(CH49.meltdown);
  return Math.max(0, Math.min(100, s));
}

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch49') return;
  if (G.sceneId !== 'c49_concession') return;
  if (!CH49.on || CH49.calm) return;
  if (G.pending) return;                    // never punish a fade
  CH49.meltdown = Math.min(100, CH49.meltdown + dt * CH49_RATE);
  if (CH49.meltdown >= 100) { ch49ManagerPops(); return; }
  if (!CH49.chant) return;
  CH49.marker += dt * CH49.speed * CH49.dir;
  if (CH49.marker >= 1) { CH49.marker = 1; CH49.dir = -1; }
  else if (CH49.marker <= 0) { CH49.marker = 0; CH49.dir = 1; }
});

ACTION_HOOKS.push(function () {
  if (G.level !== 'ch49') return false;
  if (!CH49.chant || CH49.calm) return false;
  if (DLG.active) return false;
  if (CH49.marker >= CH49.window[0] && CH49.marker <= CH49.window[1]) {
    ch49Heard();
  } else {
    ch49Unheard();
  }
  return true;
});

function ch49Heard() {
  CH49.chant = false;
  CH49.riot = Math.max(0, CH49.riot - 25);
  var idx = CH49.speech;
  CH49.speech++;
  ch49Save();
  SFX.blip(720, 0.05);
  setTimeout(function () { SFX.blip(920, 0.05); }, 70);
  FX.burst(G.px, G.py - 12, '#ffe9a0', 16, { speed: 60, life: 0.6, lift: 30 });
  FX.pop(G.px, G.py - 30, 'HEARD', '#9be08a');
  G.shake = Math.max(G.shake, 0.18);
  say(CH49_LINES[idx].out, ch49AfterSpeech);
}

function ch49Unheard() {
  CH49.misses++;
  CH49.meltdown = Math.min(100, CH49.meltdown + CH49_MISS);
  ch49Save();
  SFX.tone(150, 0.1, 'square', 0.05);
  FX.pop(G.px, G.py - 26, 'UNHEARD', '#e8607a');
  toast('the crowd talks over you');
  if (CH49.meltdown >= 100) ch49ManagerPops();
}

function ch49AfterSpeech() {
  if (CH49.speech >= 4) { ch49Calm(); return; }
  CH49.marker = 0;
  CH49.dir = 1;
  CH49.speed = 0.62 + CH49.speech * 0.09;
  CH49.chant = true;
  toast('speech ' + (CH49.speech + 1) + ' of 4');
}

function ch49BeginSpeech() {
  if (CH49.calm || CH49.speech >= 4) return;
  CH49.on = true;
  CH49.chant = true;
  CH49.marker = 0;
  CH49.dir = 1;
  CH49.speed = 0.62 + CH49.speech * 0.09;
  G.perform = true;
  G.px = 15 * TILE + TILE / 2;
  G.py = 3 * TILE + TILE - 1;
  G.dir = 'down';
  SFX.blip(520, 0.05);
  toast('press E in the green');
}

// the manager's meter fills and the evening starts again from the top
function ch49ManagerPops() {
  CH49.chant = false;
  CH49.on = false;
  CH49.calm = true;              // hold the tick while he shouts
  G.perform = true;
  G.shake = 0.9;
  G.flash = 0.5;
  SFX.blast();
  FX.burst(G.px, G.py - 20, '#e0553f', 22, { speed: 90, life: 0.8, lift: 40 });
  say([
    { who: 'narrator', text: 'The manager went very still. Then he went very loud.' },
    { who: 'narrator', text: '"THAT IS IT! I HAVE HAD IT WITH THE RENT SPEECHES! EVERYBODY OUT OF MY LOBBY!"' },
    { who: 'narrator', text: 'He pulled his hair clean out of its arrangement, kicked over a bucket of popcorn, and detonated in a cloud of coupon confetti. Nobody was hurt. The carpet was not so lucky.' },
    { who: 'narrator', text: 'The house lights came up. The mess was somehow still there. The night reset itself, the way bad evenings do.' }
  ], ch49Restart);
}

function ch49Restart() {
  // the whole loop resets: full riot, a fresh manager, no speeches delivered
  CH49.riot = 100;
  CH49.meltdown = 12;
  CH49.speech = 0;
  CH49.marker = 0;
  CH49.dir = 1;
  CH49.chant = false;
  CH49.misses = 0;
  CH49.calm = false;
  CH49.on = true;
  CH49.restarts = (CH49.restarts || 0) + 1;
  G.perform = false;
  ch49Save();
  G.toScene('c49_concession', 16, 14, 'up');
  setTimeout(function () {
    if (G.level !== 'ch49' || G.sceneId !== 'c49_concession') return;
    toast('the night starts over');
    say([
      { who: 'narrator', text: 'The manager is back behind the counter with his hair perfectly arranged, pretending nothing happened. The mob has generously agreed to riot again from the top.' },
      { who: 'maverick', text: 'Okay. Counter. Speech. Do not dawdle.' }
    ]);
  }, 900);
}

// ------------------------------------------------------------------- HUD

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch49') return;
  if (typeof RESULT !== 'undefined' && RESULT.active) return;
  if (G.sceneId !== 'c49_concession' || !CH49.on || CH49.calm) return;

  var px0 = W - 172;
  c.fillStyle = 'rgba(18,16,28,0.72)';
  c.fillRect(px0, 4, 164, 36);

  // RIOT, draining
  c.textAlign = 'left';
  c.font = '5px monospace';
  c.fillStyle = 'rgba(240,224,180,0.78)';
  c.fillText('RIOT', px0 + 4, 14);
  c.fillStyle = '#2a2438';
  c.fillRect(px0 + 34, 6, 104, 8);
  var rf = Math.max(0, Math.min(1, CH49.riot / 100));
  c.fillStyle = '#e8a04a';
  c.fillRect(px0 + 34, 6, 104 * rf, 8);
  c.fillStyle = 'rgba(255,240,210,0.65)';
  c.fillRect(px0 + 34, 6, 104 * rf, 1);
  c.font = '5px monospace';
  c.fillStyle = '#f6ecd8';
  c.textAlign = 'right';
  c.fillText(Math.round(CH49.riot) + '%', px0 + 160, 14);

  // MELTDOWN, filling, and it does not stop for anybody
  c.textAlign = 'left';
  c.fillStyle = 'rgba(240,224,180,0.78)';
  c.fillText('MELTDOWN', px0 + 4, 28);
  c.fillStyle = '#2a2438';
  c.fillRect(px0 + 34, 20, 104, 8);
  var mf = Math.max(0, Math.min(1, CH49.meltdown / 100));
  var hot = CH49.meltdown > 70;
  c.fillStyle = hot && Math.sin(G.time * 12) > 0 ? '#ff8a5a' : '#d8452f';
  c.fillRect(px0 + 34, 20, 104 * mf, 8);
  c.fillStyle = 'rgba(255,220,200,0.55)';
  c.fillRect(px0 + 34, 20, 104 * mf, 1);
  c.fillStyle = '#f6ecd8';
  c.textAlign = 'right';
  c.fillText(Math.round(CH49.meltdown) + '%', px0 + 160, 28);
  c.textAlign = 'left';

  // the room goes red as he comes apart
  if (hot) {
    var a = (CH49.meltdown - 70) / 30 * (0.10 + 0.06 * Math.sin(G.time * 9));
    c.fillStyle = 'rgba(210,40,40,' + Math.max(0, a).toFixed(3) + ')';
    c.fillRect(0, 0, W, 9);
    c.fillRect(0, H - 9, W, 9);
    c.fillRect(0, 0, 9, H);
    c.fillRect(W - 9, 0, 9, H);
  }

  if (!CH49.chant) return;

  // the CHANT bar
  var cw = 240, ch = 12, cx = (W - cw) / 2, cy = H - 34;
  c.fillStyle = 'rgba(18,16,28,0.88)';
  c.fillRect(cx - 6, cy - 18, cw + 12, ch + 24);
  c.fillStyle = '#2a2438';
  c.fillRect(cx, cy, cw, ch);
  c.fillStyle = 'rgba(120,200,140,0.55)';
  c.fillRect(cx + cw * CH49.window[0], cy, cw * (CH49.window[1] - CH49.window[0]), ch);
  var mx = cx + cw * Math.min(1, CH49.marker);
  c.fillStyle = '#fff3c4';
  c.fillRect(mx - 1, cy - 2, 3, ch + 4);
  c.strokeStyle = 'rgba(244,228,192,0.5)';
  c.lineWidth = 1;
  c.strokeRect(cx + 0.5, cy + 0.5, cw - 1, ch - 1);

  c.textAlign = 'center';
  c.font = 'bold 7px monospace';
  c.fillStyle = '#f4efe4';
  c.fillText('CHANT ' + (CH49.speech + 1) + '/4   ' + CH49_LINES[CH49.speech].tag, W / 2, cy - 7);
  c.textAlign = 'left';
});

// --------------------------------------------------------------- speeches

var CH49_LINES = [
  {
    tag: 'WAIT! STOP!',
    out: [
      { who: 'maverick', text: 'WAIT! EVERYONE STOP!' },
      { who: 'narrator', text: 'The mob paused mid-toilet-paper-throw. A teenager stood on a trash can with one arm cocked back, holding a roll of two-ply like a grenade.' },
      { who: 'maverick', text: 'Listen to me! Please! Just for one minute!' }
    ]
  },
  {
    tag: 'THINK ABOUT IT',
    out: [
      { who: 'maverick', text: 'Think about it! Maybe Ursula is living an even BETTER life without Peter Parker!' },
      { who: 'narrator', text: 'The crowd gasped. On top of the counter, a beaver doll blinked his button eyes.' },
      { who: 'bucktooth', text: 'A better life? Without the web-slinger?' },
      { who: 'maverick', text: 'Think about it!' }
    ]
  },
  {
    tag: 'THE BAKERY CHAIN',
    out: [
      { who: 'maverick', text: 'If she stayed with Peter Parker, she would be living in a tiny apartment where the door lock is permanently broken.' },
      { who: 'maverick', text: 'Eating cold soup while he dances down the street in a black suit, being weird at strangers! Ursula dodged a bullet!' },
      { who: 'maverick', text: "Today she probably owns a nationwide bakery chain called Ursula's Chocolate and Milk." },
      { who: 'narrator', text: 'A silence fell over the theater. A man in an authentic 2002 Spider-Man suit began to weep softly into his mask. "She... she is happy?"' },
      { who: 'narrator', text: 'She is probably married to a nice, stable guy who pays his rent on time, does not fight green goblins, and treats her like a queen.' }
    ]
  },
  {
    tag: 'SHE IS WINNING',
    out: [
      { who: 'maverick', text: 'She is WINNING! She has a loving family, a 401(k), and ZERO symbiote drama!' },
      { who: 'narrator', text: 'The entire crowd let out a collective, gushy "Awwwwww!" People began hugging each other, wiping away tears, and putting the toilet paper rolls back in the restrooms.' },
      { who: 'maverick', text: 'She never had to fix that door. She never had to wonder where he was. She got out.' }
    ]
  }
];

// ---------------------------------------------------------------- scripts

SCRIPT.ch49Stanchion = function () {
  if (G.sceneId !== 'c49_lobby') {
    say([{ who: 'narrator', text: 'The rope is on the floor. Somebody is wearing it as a belt.' }]);
    return;
  }
  if (G.flags.c49_incited) {
    // a reload between the incitement and the riot must not strand the player
    say([{ who: 'narrator', text: 'The lobby is already a wreck and the doll is already on the counter. Someone should go and talk him down.' }], function () {
      G.toScene('c49_concession', 16, 14, 'up');
      setTimeout(ch49RiotIntro, 1100);
    });
    return;
  }
  G.flags.c49_incited = true;
  saveGame();
  say([
    { who: 'narrator', text: 'Something small and furious scuttles up the rope, over the brass post, and onto the top of the concession stand.' },
    { who: 'bucktooth', text: 'CITIZENS OF CLOVIS! Are you going to stand by while the narrative legacy of Ursula Ditkovich is ERASED?!' },
    { who: 'bucktooth', text: 'She offered him milk, people! MILK! We must tear down this theater in the name of unrequited landlord-filial devotion!' },
    { who: 'maverick', text: 'No. No no no. Professor, get down off that counter.' },
    { who: 'narrator', text: "To Mav's horror, the crowd of hyped-up moviegoers actually listened." },
    { who: 'narrator', text: '"FOR URSULA!" a teenager screamed, leaping off a trash can and trying to web-sling by throwing a roll of two-ply toilet paper across the lobby.' }
  ], function () {
    G.toScene('c49_concession', 16, 14, 'up');
    setTimeout(ch49RiotIntro, 1100);
  });
};

function ch49RiotIntro() {
  if (G.level !== 'ch49' || G.sceneId !== 'c49_concession') return;
  CH49.on = true;
  CH49.calm = false;
  CH49.chant = false;
  CH49.riot = 100;
  CH49.meltdown = 0;
  CH49.speech = 0;
  CH49.marker = 0;
  CH49.dir = 1;
  CH49.misses = 0;
  G.flags.seen_buck49 = true;
  G.flags.seen_pile49 = false;
  G.flags.seen_c49_tp1 = true;
  G.flags.seen_c49_tp2 = true;
  G.flags.seen_c49_tp3 = true;
  G.flags.seen_c49_butter = true;
  ch49Save();
  buildScene('c49_concession');
  say([
    { who: 'narrator', text: 'Absolute chaos. Teenagers and grown men in full Spider-Man costumes swung from the light fixtures, crashed head first into cardboard posters of Madame Web, and knocked over butter dispensers.' },
    { who: 'narrator', text: 'People wrapped each other in toilet paper webs, screamed about rent, and did high-speed tactical rolls into the arcade machines.' },
    { who: 'narrator', text: '"WHAT IS HAPPENING?!" The theater manager sprinted out of his office. "Why are you trashing my concession stand?! We just cleaned the pretzel warmer!"' },
    { who: 'bucktooth', text: 'BECAUSE THE STRUCTURAL INTEGRITY OF PETER PARKER ROMANTIC CHOICES IS FLAWED!' },
    { who: 'narrator', text: 'Mav knew he had to put an end to this before the Badger FBI got involved again.' },
    { who: 'narrator', text: '[Get to the counter and press E to shout them down. Then press E inside the green.]' }
  ]);
}

SCRIPT.ch49Shout = function () {
  if (CH49.calm) {
    say([{ who: 'bucktooth', text: 'Let the man enjoy his Snickers, Maverick.' }]);
    return;
  }
  if (CH49.speech > 0) {
    say([{ who: 'bucktooth', text: 'You are mid-speech, boy. Do not lose the crowd now.' }]);
    return;
  }
  if (!CH49.on) { ch49BeginSpeech(); return; }
  say([
    { who: 'narrator', text: 'Maverick climbed onto the counter, knocking over a stack of nacho cheese tubs.' },
    { who: 'maverick', text: 'Everyone! Please! I have a thing to say and it is about rent!' }
  ], function () { ch49BeginSpeech(); });
};

SCRIPT.ch49Manager = function () {
  if (CH49.calm) {
    say([{ who: 'narrator', text: 'The manager is staring at the pretzel warmer with the calm of a man who has already quit in his heart.' }]);
    return;
  }
  say([
    { who: 'narrator', text: 'The manager is holding a clipboard he has stopped reading. "I just need one night," he says. "One. Night."' }
  ]);
};

SCRIPT.ch49Cos1 = function () {
  var lines = [
    'A cosplayer in a store-bought suit: "She brought him MILK, man. Milk!"',
    'A cosplayer with a web drawn on his cheek: "I am not crying, the mask is just tight."',
    'Somebody is wrapping a stranger in two-ply. It is going well for nobody.'
  ];
  say([{ who: 'narrator', text: lines[Math.floor(G.time) % lines.length] }]);
};

SCRIPT.ch49Cos2 = function () {
  if (CH49.calm) {
    say([{ who: 'narrator', text: 'Two cosplayers are hugging. One of them is still holding a toilet paper roll and has forgotten why.' }]);
    return;
  }
  say([{ who: 'narrator', text: 'A man in a very authentic 2002 suit is doing a tactical roll into the arcade machines. He has done this four times.' }]);
};

SCRIPT.ch49Cos3 = function () {
  if (CH49.speech >= 2) {
    say([{ who: 'narrator', text: '"Wait," says a cosplayer, lowering a roll of two-ply. "Does she have a 401(k)?"' }]);
    return;
  }
  say([{ who: 'narrator', text: 'A teenager on a trash can is trying to web-sling with a roll of toilet paper. The physics are not with him.' }]);
};

// ----------------------------------------------------------------- ending

function ch49Calm() {
  CH49.calm = true;
  CH49.on = false;
  CH49.chant = false;
  CH49.riot = 0;
  ch49Save();
  G.perform = true;
  SFX.fanfare();

  // the rolls go back in the restrooms
  G.flags.seen_c49_tp1 = false;
  G.flags.seen_c49_tp2 = false;
  G.flags.seen_c49_tp3 = false;
  G.flags.seen_c49_butter = false;
  buildScene('c49_concession');

  say([
    { who: 'narrator', text: 'A silence fell over the theater. The last roll of toilet paper bounced once and rolled under a seat.' },
    { who: 'narrator', text: 'The Bucktooth doll sat down on a box of Junior Mints and rubbed his felt snout.' },
    { who: 'bucktooth', text: 'You know... when you lay out the structural trajectory of her independence like that, Maverick... you might be right.' },
    { who: 'bucktooth', text: 'Perhaps I did not need a riot. Perhaps I just needed a concession.' },
    { who: 'narrator', text: 'The doll looked at the theater manager.' },
    { who: 'bucktooth', text: 'Honestly, I think I was just hangry.' }
  ], ch49Snickers);
}

function ch49Snickers() {
  SFX.blip(540, 0.06);
  FX.burst(296, 44, '#c88a3a', 12, { speed: 55, life: 0.6, lift: 26 });
  say([
    { who: 'narrator', text: 'The exhausted manager glared at the doll, reached into a box, and chucked a Snickers bar directly at his face.' },
    { who: 'bucktooth', text: 'Actually, I do not really care for chocolate...' },
    { who: 'narrator', text: 'He caught it. He looked at the wrapper. He was still talking.' }
  ], ch49Log);
}

function ch49Log() {
  G.shake = 0.6;
  G.flash = 0.25;
  SFX.blast();
  FX.burst(296, 46, '#8a6a3a', 24, { speed: 100, life: 0.8, lift: 40 });
  FX.burst(296, 46, '#b08a50', 14, { speed: 70, life: 0.7, lift: 30 });
  // the doll goes into the popcorn, and the pile shows up in his place
  G.flags.seen_buck49 = false;
  G.flags.seen_pile49 = true;
  buildScene('c49_concession');
  say([
    { who: 'narrator', text: 'THWACK!' },
    { who: 'narrator', text: 'An actual, four-foot cedar log flew out of nowhere and hit the Bucktooth doll straight in the face, knocking him off the counter into a pile of popcorn.' },
    { who: 'narrator', text: 'The entire lobby burst into a fit of hysterical laughter. Even the Professor, popping his head out of the popcorn pile, let out a squeaky chuckle.' },
    { who: 'bucktooth', text: 'I have notes. I have several notes.' }
  ], ch49Tobey);
}

function ch49Tobey() {
  say([
    { who: 'narrator', text: 'Just then, a man sitting in the corner in a dark jacket, eating a box of Twizzlers, stood up and chuckled along with the crowd. Everyone turned and gasped.' },
    { who: 'narrator', text: 'It was Tobey Maguire.' },
    { who: 'narrator', text: 'He looked at the ruined concession stand. He looked at the butter-covered beaver doll. He adjusted his collar and pointed two aggressive finger-guns at Maverick.' },
    { who: 'whiskey', text: "I'm gonna put some dirt in your eye." },
    { who: 'narrator', text: 'Mav and the Professor just froze as he strut-danced out the front doors and into the Clovis sunset, leaving everyone in total, majestic confusion.' }
  ], function () {
    var score = ch49Score();
    var label;
    if (CH49.misses === 0 && !CH49.restarts) label = 'perfect, nobody popped';
    else if (CH49.misses === 0) label = 'clean, one meltdown';
    else label = 'calm in four, ' + CH49.misses + ' unheard';
    cleared(49, score, label);
  });
}

// --------------------------------------------------------------- chapter

CHAPTER_CONTENT[49] = {
  start: 'c49_lobby',

  intro: function () {
    chapterCard('CHAPTER FORTY-NINE', 'Mav and the Revenge of Ursula Ditkovich', 3.4);
    setTimeout(function () {
      if (G.level !== 'ch49') return;
      G.flags.c49_incited = false;
      G.flags.c49_riot = undefined;
      G.flags.c49_melt = undefined;
      G.flags.c49_speech = undefined;
      G.flags.c49_calm = 0;
      G.flags.seen_buck49 = false;
      G.flags.seen_pile49 = false;
      G.flags.seen_c49_tp1 = false;
      G.flags.seen_c49_tp2 = false;
      G.flags.seen_c49_tp3 = false;
      G.flags.seen_c49_butter = false;
      CH49.on = false;
      CH49.calm = false;
      CH49.chant = false;
      CH49.riot = 100;
      CH49.meltdown = 0;
      CH49.speech = 0;
      CH49.marker = 0;
      CH49.dir = 1;
      CH49.misses = 0;
      CH49.restarts = 0;
      G.perform = false;
      say([
        { who: 'narrator', text: 'The lobby of the Clovis Multiplex. The carpet is patterned in a way that suggests a casino had a baby with a birthday party.' },
        { who: 'narrator', text: "In Mav's hands: a tub of buttered popcorn that cost more than a small used car. In his hoodie pocket: one Professor Bucktooth, wearing tiny 3D glasses and sulking intensely." },
        { who: 'maverick', text: "What's wrong, Professor? We're finally going to see the new Spider-Man movie! You love web-slinging!" },
        { who: 'bucktooth', text: 'I am harboring a profound, deep-seated resentment, Maverick! Peter Parker never gave Ursula Ditkovich a chance!' },
        { who: 'bucktooth', text: "She was a sweet girl! She baked him chocolate cake! She brought him glass after glass of milk! And what did that rent-dodging schmuck do? He ignored her! He yelled at her about fixin' the damn door!" },
        { who: 'maverick', text: 'Professor, Spider-Man 3 came out almost twenty years ago. I am sure everyone has learned their lesson by now.' },
        { who: 'bucktooth', text: "He learned DIDDLY, Maverick! Not a single word about Ursula in No Way Home! It is a foundational injustice!" },
        { who: 'narrator', text: '[Walk left to the rope stanchion by the ticket queue, then press E.]' }
      ]);
    }, 900);
  },

  resume: function () {
    G.perform = false;
    CH49.chant = false;
    CH49.calm = !!G.flags.c49_calm;
    CH49.on = false;
    if (G.sceneId !== 'c49_concession') return;
    CH49.riot = G.flags.c49_riot === undefined ? 100 : G.flags.c49_riot;
    CH49.meltdown = G.flags.c49_melt || 0;
    CH49.speech = G.flags.c49_speech || 0;
    if (CH49.calm) {
      // saved during the ending: pick the last beat back up rather than
      // leaving the player standing on a counter with nothing to do
      setTimeout(function () {
        if (G.level !== 'ch49' || G.sceneId !== 'c49_concession' || !CH49.calm) return;
        G.perform = true;
        if (G.flags.seen_pile49) ch49Tobey();
        else ch49Snickers();
      }, 700);
      return;
    }
    CH49.on = true;
    if (CH49.speech > 0 && CH49.speech < 4) {
      // mid-run: back on the counter, next chant already sweeping
      CH49.chant = true;
      CH49.marker = 0;
      CH49.dir = 1;
      CH49.speed = 0.62 + CH49.speech * 0.09;
      G.px = 15 * TILE + TILE / 2;
      G.py = 3 * TILE + TILE - 1;
      G.dir = 'down';
      G.perform = true;
    }
  },

  objective: function () {
    if (G.sceneId === 'c49_lobby') {
      return G.flags.c49_incited ? 'objective: find the doll in the concession' : 'objective: get to the rope stanchion';
    }
    if (G.sceneId === 'c49_concession') {
      if (CH49.calm) return '';
      if (CH49.chant) return 'objective: shout over the crowd, press E in the green';
      if (CH49.speech > 0) return 'objective: shout them down (' + CH49.speech + '/4)';
      return 'objective: get to the counter and shout them down';
    }
    return '';
  }
};
