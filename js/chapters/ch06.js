// ch06.js - Chapter 6: Mav and the Great Gouda Getaway
//
// School drop off, a cheese shop downtown, and the school lot at the end of it.
// The mechanic is a distraction heist: four pretentious questions keep a cheese
// dealer talking for fifteen seconds while Bucktooth belly crawls along the
// counter. Running out of time is never fatal. The dealer just turns around,
// puts the beaver back, and the whole thing starts again with less clock.
//
//   c6_school   the drop off street, the altar, and the arrival of the Mustang
//   c6_shop     the artisanal wheel, the counter, the crawl, the clock
//   c6_lot      two platypus officers, a pie, three smoky donuts

NAMES.cheese_dealer = 'THE CHEESE DEALER';
NAMES.platypus_cop = 'OFFICER PLATYPUS';
NAMES.lily = 'LILY';
NAMES.chad = 'CHAD';

// sprites without a sheet yet. A PNG of the same name wins automatically.
if (!CHARS.cheese_dealer) {
  CHARS.cheese_dealer = {
    skin: '#e8b48c', hair: '#4a3524', shirt: '#6b5a7a',
    pants: '#3a3246', shoe: '#241f33', hairStyle: 'flat'
  };
}
if (!CHARS.platypus_cop) {
  CHARS.platypus_cop = {
    skin: '#7a5a3a', hair: '#5a4028', shirt: '#2f3f63',
    pants: '#243050', shoe: '#1a2438', duck: true
  };
}
if (!CHARS.lily) {
  CHARS.lily = {
    skin: '#f2c69b', hair: '#c8a24a', shirt: '#e070a0',
    pants: '#5a4a7a', shoe: '#f0e0f8', hairStyle: 'flat'
  };
}
if (!CHARS.chad) {
  CHARS.chad = {
    skin: '#e8b48c', hair: '#3a2a1a', shirt: '#3f7a4a',
    pants: '#33405e', shoe: '#20242e', hairStyle: 'flat'
  };
}

// ------------------------------------------------------------------- state

var CH6 = {
  phase: 'idle',        // idle | talk | caught | run
  t: 15,                // seconds of dealer left
  crawl: 0,             // 0..4 segments
  catches: 0,
  penalty: 0,           // seconds taken off a restart
  left: 0,              // clock left when the wheel was lifted
  lastT: 0,             // clock anchor, 0 means "start counting now"
  expired: false,
  carT: 0,
  bellT: 0,
  lotStarted: false,
  lotT: 0,
  lotTalked: false,
  carRunT: 0,
  done: false
};

var C6_HEIST_SECONDS = 15;
var C6_STEP_TILES = 3.9;

function ch6Reset() {
  CH6.phase = 'idle';
  CH6.t = C6_HEIST_SECONDS;
  CH6.crawl = 0;
  CH6.catches = 0;
  CH6.penalty = 0;
  CH6.left = 0;
  CH6.lastT = 0;
  CH6.expired = false;
  CH6.carT = 0;
  CH6.bellT = 0;
  CH6.lotStarted = false;
  CH6.lotT = 0;
  CH6.lotTalked = false;
  CH6.carRunT = 0;
  CH6.done = false;
  G.flags.c6_metKid = false;
  G.flags.c6_arrived = false;
  G.flags.c6_heist = false;
  G.flags.c6_taken = false;
  G.flags.c6_crawl = 0;
  G.flags.c6_left = 0;
  G.flags.c6_catches = 0;
  G.flags.c6_pie = false;
  G.flags.c6_splat = false;
  G.flags.c6_bell = false;
  G.flags.c6_done = false;
  G.flags.seen_c6_buck = false;
  G.flags.seen_c6_exit = false;
  G.perform = false;
}

function ch6Ent(id) {
  for (var i = 0; i < G.ents.length; i++) if (G.ents[i].id === id) return G.ents[i];
  return null;
}

// a prop can hang off a character: a beret, a cap, a log, a wheel
function ch6Anchor(e) {
  if (e.follow) {
    var t = ch6Ent(e.follow);
    if (t) return t;
  }
  return e;
}

// ------------------------------------------------------------------ scenes

SCENES.c6_school = {
  title: 'THE DROP OFF',
  spawn: { tx: 16, ty: 15, dir: 'up' },
  camZoom: 1,
  fill: 'c6Lawn',
  rects: [
    { x: 0, y: 0, w: 32, h: 4, t: 'c6Brick' },
    { x: 0, y: 4, w: 32, h: 1, t: 'c6Pave' },
    { x: 11, y: 5, w: 10, h: 2, t: 'c6Pave' },
    { x: 0, y: 7, w: 32, h: 2, t: 'c6Pave' },
    { x: 0, y: 9, w: 32, h: 4, t: 'c6Road' },
    { x: 0, y: 13, w: 32, h: 1, t: 'c6Curb' },
    { x: 0, y: 14, w: 32, h: 2, t: 'c6Pave' },
    { x: 0, y: 16, w: 32, h: 2, t: 'c6Lawn' }
  ],
  solidKinds: ['c6Brick'],
  entities: [
    { id: 'c6_school', who: null, tx: 16, ty: 4, kind: 'c6School', noSolid: true, propScale: 1 },
    { id: 'c6_sign', who: null, tx: 3, ty: 8, kind: 'c6SignZone', noSolid: true, propScale: 1, reach: 44, talk: 'ch6Sign' },
    { id: 'c6_altar', who: null, tx: 27, ty: 12, kind: 'c6Altar', solid: true, sw: 2, sh: 1, propScale: 1, reach: 64, talk: 'ch6Altar' },
    { id: 'c6_pile', who: null, tx: 5, ty: 12, kind: 'c6LogPile', solid: true, sw: 2, sh: 1, propScale: 1, reach: 56, talk: 'ch6Pile' },
    { id: 'c6_kevin', who: 'kevin', tx: 10, ty: 10, dir: 'up', reach: 44, talk: 'ch6Kevin' },
    { id: 'c6_lily', who: 'lily', tx: 6, ty: 8, dir: 'up', small: true, reach: 40, talk: 'ch6Lily' },
    { id: 'c6_chad', who: 'chad', tx: 21, ty: 8, dir: 'up', reach: 44, talk: 'ch6Chad' },
    { id: 'c6_haul1', who: 'nibbles', tx: 24, ty: 10, dir: 'up', small: true, haul: true },
    { id: 'c6_haul2', who: 'adrian', tx: 13, ty: 9, dir: 'up', haul: true },
    { id: 'c6_log1', who: null, tx: 24, ty: 9, kind: 'c6ShoulderLog', follow: 'c6_haul1', noSolid: true, propScale: 1 },
    { id: 'c6_log2', who: null, tx: 13, ty: 8, kind: 'c6ShoulderLog', follow: 'c6_haul2', noSolid: true, propScale: 1 },
    { id: 'c6_car', who: null, tx: -5, ty: 11, kind: 'c6Mustang', noSolid: true, propScale: 1 },
    { id: 'c6_buck', who: 'bucktooth', tx: 14, ty: 11, dir: 'down', hidden: true, reach: 72, talk: 'ch6BuckStreet' }
  ],
  overlay: function (c) {
    // a crosswalk and a bus lane, because it is a drop off
    for (var x = 304; x < 416; x += 14) {
      c.fillStyle = 'rgba(232,228,214,0.55)';
      c.fillRect(x, 148, 8, 50);
    }
    c.fillStyle = 'rgba(214,178,64,0.35)';
    c.fillRect(0, 141, W, 3);
    c.fillStyle = 'rgba(30,30,36,0.10)';
    c.fillRect(0, 208, W, 2);
    // a morning wash from the east, and shade under the school
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,226,160,0.14)');
    g.addColorStop(0.5, 'rgba(255,214,150,0.04)');
    g.addColorStop(1, 'rgba(40,34,24,0.16)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(30,26,20,0.16)';
    c.fillRect(0, 76, W, 8);
  }
};

SCENES.c6_shop = {
  title: 'THE ARTISANAL WHEEL',
  spawn: { tx: 16, ty: 14, dir: 'up' },
  camZoom: 1,
  fill: 'c6ShopFloor',
  rects: [
    { x: 0, y: 0, w: 32, h: 4, t: 'c6ShopWall' },
    { x: 0, y: 4, w: 1, h: 13, t: 'c6ShopWall' },
    { x: 31, y: 4, w: 1, h: 13, t: 'c6ShopWall' },
    { x: 0, y: 17, w: 32, h: 1, t: 'c6ShopWall' },
    { x: 4, y: 8, w: 24, h: 1, t: 'counter' }
  ],
  solidKinds: ['c6ShopWall', 'counter'],
  entities: [
    { id: 'c6_board', who: null, tx: 16, ty: 3, kind: 'c6Board', noSolid: true, propScale: 1 },
    { id: 'c6_window', who: null, tx: 7, ty: 3, kind: 'c6Window', noSolid: true, propScale: 1, reach: 48, talk: 'ch6Window' },
    { id: 'c6_counter', who: null, tx: 16, ty: 8, kind: 'c6Counter', noSolid: true, propScale: 1 },
    { id: 'c6_dealer', who: 'cheese_dealer', tx: 17, ty: 7, dir: 'down', reach: 78, talk: 'ch6Dealer' },
    { id: 'c6_beret', who: null, tx: 17, ty: 7, kind: 'c6Beret', follow: 'c6_dealer', noSolid: true, propScale: 1 },
    { id: 'c6_buck_shop', who: 'bucktooth', tx: 5, ty: 7, dir: 'right', reach: 56, talk: 'ch6BuckShop' },
    { id: 'c6_gouda', who: null, tx: 23, ty: 8, kind: 'c6Gouda', noSolid: true, propScale: 1, reach: 54, talk: 'ch6Gouda' },
    { id: 'c6_carry', who: null, tx: 5, ty: 8, kind: 'c6WheelCarry', follow: 'c6_buck_shop', noSolid: true, propScale: 1 },
    { id: 'c6_case', who: null, tx: 4, ty: 10, kind: 'c6Case', solid: true, sw: 3, sh: 1, propScale: 1, reach: 54, talk: 'ch6Case' },
    { id: 'c6_samples', who: null, tx: 10, ty: 12, kind: 'c6SampleTable', solid: true, sw: 2, sh: 1, propScale: 1, reach: 48, talk: 'ch6Samples' },
    { id: 'c6_shopdoor', who: null, tx: 16, ty: 17, kind: 'c6ShopDoor', noSolid: true, propScale: 1, reach: 40, talk: 'ch6ShopDoor' },
    { id: 'c6_crates', who: null, tx: 26, ty: 14, kind: 'c6Crates', solid: true, sw: 2, sh: 1, propScale: 1, reach: 48, talk: 'ch6Crates' },
    { id: 'c6_bell', who: null, tx: 18, ty: 16, kind: 'c6Bell', noSolid: true, propScale: 1 },
    { id: 'c6_exit', exit: { to: 'c6_lot', tx: 14, ty: 13, dir: 'up' }, tx: 16, ty: 16, rect: { w: 2, h: 1 }, hidden: true }
  ],
  overlay: function (c) {
    // a runner down the middle of the shop and warm lamps over the counter
    var rx = 96, ry = 176, rw = 320, rh = 74;
    c.fillStyle = 'rgba(122,70,52,0.30)';
    c.fillRect(rx, ry, rw, rh);
    c.fillStyle = 'rgba(168,96,70,0.16)';
    c.fillRect(rx + 6, ry + 6, rw - 12, rh - 12);
    var lamps = [[112, 120], [256, 118], [400, 120]];
    lamps.forEach(function (l) {
      var g = c.createRadialGradient(l[0], l[1], 6, l[0], l[1], 96);
      g.addColorStop(0, 'rgba(255,234,186,0.20)');
      g.addColorStop(1, 'rgba(255,220,160,0)');
      c.fillStyle = g;
      c.fillRect(l[0] - 96, l[1] - 96, 192, 192);
    });
    var vg = c.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.5, H * 0.9);
    vg.addColorStop(0, 'rgba(30,20,16,0)');
    vg.addColorStop(1, 'rgba(30,20,16,0.30)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
  }
};

SCENES.c6_lot = {
  title: 'THE SCHOOL LOT',
  spawn: { tx: 14, ty: 13, dir: 'up' },
  camZoom: 1,
  fill: 'c6Lot',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'c6Brick' },
    { x: 0, y: 2, w: 32, h: 1, t: 'c6Curb' },
    { x: 0, y: 0, w: 1, h: 18, t: 'hedge' },
    { x: 31, y: 0, w: 1, h: 18, t: 'hedge' },
    { x: 0, y: 17, w: 32, h: 1, t: 'hedge' }
  ],
  solidKinds: ['c6Brick', 'hedge'],
  entities: [
    { id: 'c6_altar_lot', who: null, tx: 4, ty: 6, kind: 'c6Altar', solid: true, sw: 2, sh: 1, propScale: 1, reach: 64, talk: 'ch6Altar' },
    { id: 'c6_pile_lot', who: null, tx: 8, ty: 6, kind: 'c6LogPile', solid: true, sw: 2, sh: 1, propScale: 1, reach: 56, talk: 'ch6Pile' },
    { id: 'c6_dumpster', who: null, tx: 27, ty: 6, kind: 'c6Dumpster', solid: true, sw: 2, sh: 1, propScale: 1, reach: 56, talk: 'ch6Dumpster' },
    { id: 'c6_car_a', who: null, tx: 5, ty: 10, kind: 'c6LotCar', solid: true, sw: 3, sh: 1, colour: '#4a6a8a', propScale: 1 },
    { id: 'c6_car_b', who: null, tx: 23, ty: 10, kind: 'c6LotCar', solid: true, sw: 3, sh: 1, colour: '#8a6a3a', propScale: 1 },
    { id: 'c6_car_lot', who: null, tx: 14, ty: 8, kind: 'c6Mustang', noSolid: true, propScale: 1 },
    { id: 'c6_buck_lot', who: 'bucktooth', tx: 15, ty: 11, dir: 'down', reach: 60, talk: 'ch6BuckLot' },
    { id: 'c6_pie', who: null, tx: 15, ty: 11, kind: 'c6Pie', follow: 'c6_buck_lot', noSolid: true, propScale: 1 },
    { id: 'c6_bike_a', who: null, tx: 34, ty: 12, kind: 'c6CopBike', follow: 'c6_cop_a', noSolid: true, propScale: 1 },
    { id: 'c6_bike_b', who: null, tx: 36, ty: 14, kind: 'c6CopBike', follow: 'c6_cop_b', noSolid: true, propScale: 1 },
    { id: 'c6_cop_a', who: 'platypus_cop', tx: 34, ty: 12, dir: 'left', reach: 62, talk: 'ch6CopA' },
    { id: 'c6_cop_b', who: 'platypus_cop', tx: 36, ty: 14, dir: 'left', reach: 62, talk: 'ch6CopB' },
    { id: 'c6_cap_a', who: null, tx: 34, ty: 12, kind: 'c6CopCap', follow: 'c6_cop_a', noSolid: true, propScale: 1 },
    { id: 'c6_cap_b', who: null, tx: 36, ty: 14, kind: 'c6CopCap', follow: 'c6_cop_b', noSolid: true, propScale: 1 }
  ],
  overlay: function (c) {
    // parking stalls, a speed bump, and oil where cars have been parked
    c.fillStyle = 'rgba(232,228,214,0.45)';
    for (var x = 24; x < W - 24; x += 64) {
      c.fillRect(x, 96, 2, 60);
    }
    c.fillRect(24, 96, W - 48, 2);
    c.fillRect(24, 154, W - 48, 3);
    c.fillStyle = 'rgba(214,178,64,0.30)';
    for (var bx = 40; bx < W - 40; bx += 22) c.fillRect(bx, 208, 14, 4);
    c.fillStyle = 'rgba(12,12,16,0.10)';
    var spots = [[92, 132], [160, 136], [300, 130], [372, 138], [244, 200]];
    spots.forEach(function (s) {
      c.beginPath();
      c.ellipse(s[0], s[1], 16, 5, 0, 0, Math.PI * 2);
      c.fill();
    });
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,226,170,0.14)');
    g.addColorStop(0.55, 'rgba(255,214,150,0.04)');
    g.addColorStop(1, 'rgba(24,24,30,0.18)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(20,20,26,0.18)';
    c.fillRect(0, 34, W, 6);
  }
};

// ------------------------------------------------------------------- props

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (!k || k.indexOf('c6') !== 0) return false;

  var a = ch6Anchor(e);
  var P = propPainter(c, a);

  if (k === 'c6School') {
    // the brick face of Clovis Elementary, four bays of windows and a sign
    P(-248, -64, 496, 64, '#8a5646');
    P(-248, -64, 496, 3, '#6f4438');
    P(-248, -30, 496, 2, '#7a4b3c');
    P(-248, -2, 496, 3, '#6f4438');
    for (var wy = 1; wy < 6; wy++) {
      P(-248, -64 + wy * 10, 496, 1, 'rgba(58,28,22,0.28)');
    }
    for (var bx = 0; bx < 25; bx++) {
      P(-244 + bx * 20, -54, 1, 7, 'rgba(58,28,22,0.20)');
      P(-234 + bx * 20, -44, 1, 7, 'rgba(58,28,22,0.20)');
      P(-244 + bx * 20, -24, 1, 7, 'rgba(58,28,22,0.20)');
    }
    // windows, lit inside
    for (var i = 0; i < 5; i++) {
      if (i === 2) continue;
      var wx = -214 + i * 96;
      P(wx, -54, 44, 24, '#3c4a58');
      P(wx + 2, -52, 40, 20, '#7fa8c8');
      P(wx + 2, -52, 40, 7, '#a6cbe6');
      P(wx + 21, -52, 2, 20, '#3c4a58');
      P(wx - 2, -28, 48, 3, '#e6dcc8');
      P(wx - 2, -28, 48, 1, '#f4ece0');
    }
    // entrance
    P(-30, -42, 60, 42, '#e6dcc8');
    P(-26, -38, 52, 38, '#4a3524');
    P(-23, -36, 23, 34, '#6d4c2b');
    P(2, -36, 23, 34, '#6d4c2b');
    P(-21, -34, 19, 12, '#8fb4c8');
    P(4, -34, 19, 12, '#8fb4c8');
    P(-21, -20, 19, 14, '#7d5936');
    P(4, -20, 19, 14, '#7d5936');
    P(-4, -24, 2, 5, '#d8c070');
    P(4, -24, 2, 5, '#d8c070');
    P(-36, -6, 72, 4, '#c8c2b0');
    P(-32, -10, 64, 4, '#d8d2c0');
    // the sign band over the doors
    P(-72, -60, 144, 13, '#2f3a4a');
    P(-70, -58, 140, 9, '#3b4a5e');
    c.save();
    c.font = 'bold 7px monospace';
    c.fillStyle = '#f0e4c8';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('CLOVIS ELEMENTARY', a.px, a.py - 53);
    c.restore();
    // a bench by the doors and a bin, both slightly crooked
    P(-104, -12, 34, 4, '#8a5e3a');
    P(-104, -16, 34, 4, '#9a6c44');
    P(-101, -8, 3, 8, '#5a5a62');
    P(-76, -8, 3, 8, '#5a5a62');
    P(74, -16, 14, 16, '#4a5a4a');
    P(73, -18, 16, 3, '#5e7260');
    return true;
  }

  if (k === 'c6SignZone') {
    // a yellow school zone diamond on a leaning post
    P(-1, -30, 2, 30, '#8a8a92');
    P(-9, -46, 18, 18, '#c8a02a');
    P(-7, -44, 14, 14, '#e8c040');
    P(-4, -40, 8, 2, '#3a3020');
    P(-4, -36, 6, 2, '#3a3020');
    P(-6, -46, 18, 2, 'rgba(0,0,0,0.18)');
    return true;
  }

  if (k === 'c6Altar') {
    // three courses of pine and a laminated sign: the Almighty Altar
    P(-32, -2, 64, 4, 'rgba(0,0,0,0.24)');
    for (var r = 0; r < 3; r++) {
      var w = 62 - r * 12;
      var y = -14 - r * 14;
      var x0 = -w / 2;
      P(x0, y, w, 12, '#7d5a30');
      P(x0, y, w, 2, '#96733f');
      P(x0, y + 9, w, 2, '#5f4526');
      P(x0 - 2, y + 2, 4, 8, '#c39a5c');
      P(x0 + w - 2, y + 2, 4, 8, '#c39a5c');
      P(x0 + 6, y + 4, 5, 1, 'rgba(80,52,26,0.45)');
      P(x0 + w - 14, y + 6, 6, 1, 'rgba(80,52,26,0.40)');
    }
    // the sign
    P(-25, -60, 50, 13, '#a5764a');
    P(-23, -58, 46, 9, '#c89a68');
    P(-23, -58, 46, 1, '#e0b484');
    c.save();
    c.font = 'bold 5px monospace';
    c.fillStyle = '#5a3a1c';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('ALMIGHTY ALTAR', a.px, a.py - 53);
    c.restore();
    P(-27, -62, 6, 4, '#8a6038');
    P(21, -62, 6, 4, '#8a6038');
    // a string of pennants, because it is a shrine and shrines have bunting
    for (var pf = 0; pf < 5; pf++) {
      P(-22 + pf * 11, -68 + (pf % 2 ? 2 : 0), 7, 5, pf % 2 ? '#c8452f' : '#e8c060');
      P(-22 + pf * 11, -68 + (pf % 2 ? 2 : 0), 7, 1, 'rgba(255,255,255,0.35)');
    }
    P(-22, -70, 54, 1, '#d8c8a4');
    // a juice box offering, left on the base
    P(-26, -14, 8, 9, '#c8452f');
    P(-26, -14, 8, 2, '#e8e2d0');
    P(-25, -17, 2, 4, '#f0e8d8');
    return true;
  }

  if (k === 'c6LogPile') {
    // rough cut pine, stacked badly and with confidence
    P(-30, -2, 60, 4, 'rgba(0,0,0,0.24)');
    var rows = [
      [-28, -10, 56],
      [-24, -19, 46],
      [-30, -28, 52]
    ];
    for (var ri = 0; ri < rows.length; ri++) {
      var rx = rows[ri][0], ry = rows[ri][1], rw = rows[ri][2];
      P(rx, ry, rw, 9, '#8a6338');
      P(rx, ry, rw, 2, '#a07a46');
      P(rx, ry + 7, rw, 2, '#5f4526');
      P(rx - 3, ry + 1, 6, 7, '#c9a066');
      P(rx + rw - 3, ry + 1, 6, 7, '#c9a066');
      P(rx - 2, ry + 2, 3, 5, '#dcb87e');
      P(rx + 2, ry + 4, 8, 1, 'rgba(80,52,26,0.40)');
    }
    // a hand saw left on top
    P(-6, -33, 20, 3, '#c8ccd4');
    P(-8, -34, 6, 5, '#8a4a2a');
    return true;
  }

  if (k === 'c6ShoulderLog') {
    // a pine trunk over a kid's shoulder, angled and slightly too big
    c.save();
    c.translate(a.px + 1, a.py - 19);
    c.rotate(-0.26);
    c.fillStyle = '#8a6338';
    c.fillRect(-24, -5, 48, 9);
    c.fillStyle = '#a07a46';
    c.fillRect(-24, -5, 48, 2);
    c.fillStyle = '#5f4526';
    c.fillRect(-24, 2, 48, 2);
    c.fillStyle = '#c9a066';
    c.fillRect(20, -6, 6, 11);
    c.fillStyle = '#dcb87e';
    c.fillRect(21, -5, 4, 9);
    c.fillStyle = 'rgba(80,52,26,0.35)';
    c.fillRect(-16, -1, 10, 1);
    c.restore();
    return true;
  }

  if (k === 'c6Mustang') {
    // the cherry red convertible, top down, still warm
    P(-46, -4, 92, 6, 'rgba(0,0,0,0.25)');
    P(-44, -34, 88, 30, '#8a1f1f');
    P(-42, -32, 84, 26, '#b02a2a');
    P(-40, -30, 80, 9, '#c83a3a');
    P(-30, -20, 44, 16, '#2a1a1a');
    P(-26, -18, 16, 12, '#3a2626');
    P(-8, -18, 16, 12, '#3a2626');
    P(-30, -24, 44, 4, '#1f1414');
    P(-24, -16, 10, 6, '#4a3232');
    P(2, -16, 10, 6, '#4a3232');
    P(-44, -34, 88, 2, '#e05656');
    P(-46, -30, 4, 10, '#d0d0d8');
    P(42, -30, 4, 10, '#d0d0d8');
    P(-38, -36, 12, 4, '#2a2a30');
    P(26, -36, 12, 4, '#2a2a30');
    P(-38, -2, 12, 4, '#2a2a30');
    P(26, -2, 12, 4, '#2a2a30');
    P(-6, -30, 12, 2, '#f0e8d0');
    P(28, -26, 6, 3, '#f8f4d8');
    P(-46, -28, 6, 3, '#e8a0a0');
    return true;
  }

  if (k === 'c6Beret') {
    // a large, floppy beret, worn with total commitment
    P(-13, -33, 26, 6, '#5a2f3a');
    P(-11, -35, 22, 4, '#6b3a46');
    P(-17, -28, 34, 3, '#4a2630');
    P(-17, -28, 34, 1, '#7a4552');
    P(-2, -38, 4, 4, '#6b3a46');
    return true;
  }

  if (k === 'c6CopCap') {
    P(-9, -34, 18, 5, '#243050');
    P(-9, -34, 18, 1, '#33405e');
    P(-12, -30, 24, 3, '#1a2438');
    P(-12, -30, 24, 1, '#0f1626');
    P(-2, -33, 5, 3, '#e0c060');
    P(-1, -32, 3, 1, '#a88a30');
    return true;
  }

  if (k === 'c6Gouda') {
    if (G.flags.c6_taken) return true;   // in the beaver's arms now
    // a wheel the size of a small tire, on the counter top at a.py - 16
    function Q(dx, dy, w, h, col) {
      c.fillStyle = col;
      c.fillRect(Math.round(a.px + dx), Math.round(a.py - 16 + dy), w, h);
    }
    Q(-24, -2, 48, 4, 'rgba(0,0,0,0.22)');
    Q(-24, -34, 48, 18, '#b8841e');           // rind, in shadow
    Q(-24, -34, 48, 3, '#d8a832');
    Q(-24, -30, 4, 12, '#c8952a');
    Q(20, -30, 4, 12, '#c8952a');
    Q(-24, -19, 48, 3, '#96701a');
    Q(-18, -25, 3, 2, '#a87a1e');
    Q(-6, -19, 4, 2, '#a87a1e');
    Q(8, -27, 3, 2, '#a87a1e');
    c.save();
    c.beginPath();                            // the top of the wheel
    c.ellipse(a.px, a.py - 34, 24, 8, 0, 0, Math.PI * 2);
    c.fillStyle = '#e8c258';
    c.fill();
    c.beginPath();
    c.ellipse(a.px, a.py - 34, 20, 6, 0, 0, Math.PI * 2);
    c.fillStyle = '#f2d878';
    c.fill();
    // a wedge has been cut out of it at some point
    c.beginPath();
    c.moveTo(a.px + 4, a.py - 34);
    c.lineTo(a.px + 17, a.py - 38);
    c.lineTo(a.px + 17, a.py - 30);
    c.closePath();
    c.fillStyle = '#fae8a0';
    c.fill();
    c.strokeStyle = 'rgba(150,112,26,0.5)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(a.px + 4, a.py - 34);
    c.lineTo(a.px + 17, a.py - 38);
    c.stroke();
    c.restore();
    // a paper tag on the rind
    Q(-2, -47, 12, 7, '#f0e2c4');
    Q(-2, -47, 12, 1, '#d8c8a4');
    Q(0, -44, 8, 1, '#8a7a58');
    return true;
  }

  if (k === 'c6WheelCarry') {
    if (!G.flags.c6_taken) return true;
    // the wheel, hugged to the chest
    c.save();
    c.beginPath();
    c.ellipse(a.px + 1, a.py - 24, 15, 6, 0, 0, Math.PI * 2);
    c.fillStyle = '#e8c258';
    c.fill();
    c.beginPath();
    c.ellipse(a.px + 1, a.py - 25, 11, 4, 0, 0, Math.PI * 2);
    c.fillStyle = '#f2d878';
    c.fill();
    c.restore();
    P(-15, -28, 31, 9, '#c8952a');
    P(-15, -28, 31, 2, '#e0b040');
    P(-15, -21, 31, 2, '#a87a1e');
    P(-12, -26, 4, 2, '#b8841e');
    P(8, -24, 3, 2, '#b8841e');
    return true;
  }

  if (k === 'c6Counter') {
    // the tasting counter: marble top, dark front, a brass foot rail
    P(-200, -22, 384, 7, '#dcd0b8');
    P(-200, -22, 384, 2, '#f0e8d4');
    P(-200, -16, 384, 18, '#4a3a2c');
    P(-200, -16, 384, 2, '#6b563f');
    for (var cp = 0; cp < 9; cp++) {
      P(-196 + cp * 44, -13, 2, 12, '#3d3024');
    }
    P(-200, -3, 384, 3, '#3a2d22');
    P(-198, -1, 380, 2, '#a08a4a');
    P(-198, -1, 380, 1, '#c8b06a');
    // a small brass plate, because it is that kind of shop
    P(-12, -14, 24, 9, '#b09448');
    P(-10, -12, 20, 5, '#c8ac5c');
    return true;
  }

  if (k === 'c6Crates') {
    // wooden shipping crates, stencilled and stacked
    P(-30, -3, 60, 4, 'rgba(0,0,0,0.22)');
    P(-28, -22, 30, 20, '#a5764a');
    P(-26, -20, 26, 16, '#bd8a58');
    P(-26, -20, 26, 2, '#cf9c68');
    P(-26, -12, 26, 1, '#8a6038');
    P(-28, -38, 26, 16, '#a5764a');
    P(-26, -36, 22, 12, '#bd8a58');
    P(-26, -36, 22, 2, '#cf9c68');
    P(2, -16, 26, 16, '#a5764a');
    P(4, -14, 22, 12, '#bd8a58');
    P(4, -14, 22, 2, '#cf9c68');
    c.save();
    c.font = 'bold 4px monospace';
    c.fillStyle = 'rgba(70,44,22,0.65)';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('WHEEL', a.px - 13, a.py - 12);
    c.fillText('WHEEL', a.px - 15, a.py - 30);
    c.restore();
    return true;
  }

  if (k === 'c6Case') {
    // a glass cheese case with brass corners and three residents
    P(-34, -3, 68, 4, 'rgba(0,0,0,0.22)');
    P(-34, -14, 68, 12, '#5a4a3a');
    P(-32, -13, 64, 10, '#6d5a46');
    P(-32, -13, 64, 2, '#8a7458');
    P(-4, -11, 8, 3, '#c8b898');
    P(-34, -40, 68, 27, 'rgba(176,208,216,0.30)');
    P(-34, -40, 68, 2, '#8a7458');
    P(-34, -40, 2, 27, '#8a7458');
    P(32, -40, 2, 27, '#8a7458');
    P(-34, -16, 68, 2, '#8a7458');
    P(-32, -34, 64, 1, 'rgba(240,250,255,0.45)');
    P(-30, -31, 56, 1, 'rgba(240,250,255,0.25)');
    // cheeses: a blue, a brie, a small orange truckle
    P(-26, -28, 16, 11, '#e8dcc0');
    P(-26, -28, 16, 2, '#f4ecd8');
    P(-24, -24, 3, 2, '#6a7a8a');
    P(-18, -22, 3, 2, '#6a7a8a');
    P(-6, -26, 18, 9, '#f0e8d0');
    P(-6, -26, 18, 2, '#fbf6e6');
    P(-6, -19, 18, 2, '#e0d4b4');
    P(16, -25, 12, 8, '#c8802e');
    P(16, -25, 12, 2, '#e09a44');
    P(24, -38, 6, 4, '#f0e2c4');
    return true;
  }

  if (k === 'c6Board') {
    // the chalkboard, all names and no prices
    P(-54, -44, 108, 44, '#6b4a2e');
    P(-52, -42, 104, 40, '#2f3a34');
    P(-52, -42, 104, 1, 'rgba(240,240,230,0.14)');
    c.save();
    c.font = 'bold 7px monospace';
    c.fillStyle = '#e8e2cc';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('THE ARTISANAL WHEEL', a.px, a.py - 36);
    c.font = '5px monospace';
    c.fillStyle = 'rgba(232,226,204,0.75)';
    c.fillText('GOUDA 1974 .......... THE EIGHTH WONDER', a.px, a.py - 27);
    c.textAlign = 'left';
    c.fillText('COMTE', a.px - 44, a.py - 18);
    c.fillText('EPOISSES', a.px - 44, a.py - 11);
    c.fillText('A BLUE ONE', a.px + 4, a.py - 18);
    c.fillText('SOMETHING OLD', a.px + 4, a.py - 11);
    c.fillStyle = 'rgba(232,226,204,0.45)';
    c.fillText('no samples   no refunds   no exceptions', a.px - 44, a.py - 4);
    c.restore();
    // chalk on the ledge
    P(-40, -2, 4, 2, '#f0ece0');
    P(30, -2, 3, 2, '#e0dcd0');
    return true;
  }

  if (k === 'c6SampleTable') {
    P(-26, -3, 52, 4, 'rgba(0,0,0,0.22)');
    P(-26, -18, 52, 15, '#7a5636');
    P(-24, -16, 48, 11, '#9a7048');
    P(-24, -16, 48, 2, '#b2865a');
    P(-22, -7, 4, 7, '#684728');
    P(18, -7, 4, 7, '#684728');
    // a board with cubes and toothpicks
    P(-20, -24, 40, 8, '#c8a878');
    P(-19, -23, 38, 6, '#e0c498');
    for (var s = 0; s < 5; s++) {
      P(-16 + s * 7, -23, 4, 4, s % 2 ? '#e8d8a0' : '#d8b050');
      P(-15 + s * 7, -25, 1, 2, '#f0ece0');
    }
    P(-24, -22, 4, 5, '#f0ece0');
    return true;
  }

  if (k === 'c6Window') {
    // the shop window, gold lettering, a street reflected badly
    P(-38, -40, 76, 40, '#6b4a2e');
    P(-35, -37, 70, 34, '#8fb2c4');
    P(-35, -37, 70, 10, '#a8c8d8');
    P(-29, -30, 20, 6, 'rgba(255,246,220,0.45)');
    P(6, -22, 24, 5, 'rgba(255,246,220,0.30)');
    P(-2, -37, 2, 34, '#6b4a2e');
    P(-35, -20, 70, 2, '#6b4a2e');
    c.save();
    c.font = 'bold 7px monospace';
    c.fillStyle = '#e8c060';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('FROMAGE', a.px, a.py - 30);
    c.restore();
    P(-42, -2, 84, 3, '#5a3f26');
    return true;
  }

  if (k === 'c6Bell') {
    // a brass bell on a bracket over the door
    P(-22, -46, 22, 2, '#8a7a5a');
    P(-2, -44, 2, 6, '#8a7a5a');
    P(-24, -48, 4, 4, '#6b5c42');
    P(-8, -38, 16, 3, '#c8a03a');
    P(-7, -36, 14, 6, '#d8b04a');
    P(-6, -30, 12, 2, '#c8a03a');
    P(-6, -32, 12, 2, '#e8c860');
    P(-1, -28, 2, 3, '#8a6a28');
    P(-2, -42, 4, 3, '#b89432');
    return true;
  }

  if (k === 'c6ShopDoor') {
    // the front door, glass in a wooden frame, with a mat
    P(-20, -40, 40, 40, '#5a3d22');
    P(-18, -38, 36, 36, '#7a5634');
    P(-15, -35, 14, 26, '#9fc4d4');
    P(1, -35, 14, 26, '#9fc4d4');
    P(-15, -35, 14, 4, '#b8d8e4');
    P(1, -35, 14, 4, '#b8d8e4');
    P(-2, -24, 2, 6, '#e0c060');
    P(0, -24, 2, 6, '#e0c060');
    P(-16, -6, 32, 4, '#8a6a3a');
    P(-22, -1, 44, 3, '#4a3a28');
    P(-22, -2, 44, 1, '#6a5540');
    return true;
  }

  if (k === 'c6Dumpster') {
    P(-30, -3, 60, 4, 'rgba(0,0,0,0.24)');
    P(-28, -26, 56, 24, '#2f5a3a');
    P(-26, -24, 52, 20, '#3a6b44');
    P(-28, -30, 56, 5, '#35734a');
    P(-28, -30, 56, 2, '#4a8a58');
    P(-20, -20, 18, 8, '#f0e8d0');
    P(-18, -18, 14, 1, '#8a8272');
    P(-18, -15, 10, 1, '#8a8272');
    P(10, -18, 3, 6, '#1f3a28');
    P(20, -6, 6, 3, '#22242a');
    return true;
  }

  if (k === 'c6LotCar') {
    // a sensible sedan, parked badly
    var body = e.colour || '#5a6a7a';
    P(-30, -4, 60, 5, 'rgba(0,0,0,0.24)');
    P(-28, -26, 56, 22, body);
    P(-26, -25, 52, 18, 'rgba(255,255,255,0.10)');
    P(-18, -32, 36, 8, '#2a2a34');
    P(-16, -31, 14, 6, '#5d7f9e');
    P(2, -31, 14, 6, '#5d7f9e');
    P(-28, -26, 56, 2, 'rgba(255,255,255,0.18)');
    P(-22, -6, 10, 5, '#20242a');
    P(12, -6, 10, 5, '#20242a');
    P(26, -20, 3, 4, '#f4ecd0');
    P(-29, -20, 3, 3, '#c8452f');
    return true;
  }

  if (k === 'c6CopBike') {
    // a police motorcycle, side on, lights going
    var on = Math.sin(G.time * 9) > 0;
    P(-26, -3, 52, 4, 'rgba(0,0,0,0.28)');
    P(-22, -14, 44, 9, '#2a2a32');
    P(-22, -14, 44, 2, '#3f3f4a');
    P(-12, -20, 24, 7, '#1f2a44');
    P(-12, -20, 24, 2, '#33405e');
    P(-18, -26, 12, 8, '#243050');
    P(-17, -25, 10, 6, '#8fb2c4');
    // wheels
    P(-26, -10, 10, 10, '#15151a');
    P(-24, -8, 6, 6, '#2f2f38');
    P(14, -10, 10, 10, '#15151a');
    P(16, -8, 6, 6, '#2f2f38');
    // handlebars and a screen
    P(-6, -30, 2, 8, '#9aa0a8');
    P(-10, -31, 12, 2, '#9aa0a8');
    P(-2, -28, 9, 6, 'rgba(180,220,240,0.55)');
    // the light bar
    P(-6, -36, 12, 5, '#20242e');
    P(-5, -35, 5, 3, on ? '#ff6a6a' : '#7a2a2a');
    P(1, -35, 5, 3, on ? '#4a6ad8' : '#26305e');
    // the word
    c.save();
    c.font = 'bold 4px monospace';
    c.fillStyle = '#e8e4d8';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('POLICE', a.px - 2, a.py - 15);
    c.restore();
    return true;
  }

  if (k === 'c6Pie') {
    if (!G.flags.c6_pie) return true;
    // a banana cream pie, perfectly assembled, in a tin
    P(-12, -30, 24, 5, '#c8ccd4');
    P(-11, -34, 22, 5, '#e0e4ea');
    P(-11, -36, 22, 4, '#f2e6c8');
    P(-9, -38, 18, 4, '#fbf0d8');
    P(-6, -40, 5, 3, '#fff6e2');
    P(4, -39, 4, 3, '#fff6e2');
    P(-8, -35, 3, 2, '#e8d090');
    P(3, -34, 4, 2, '#e8d090');
    return true;
  }

  return false;
});

// ------------------------------------------------------------------- tiles

TILE_HOOKS.push(function (c, kind, tx, ty) {
  var x = tx * TILE, y = ty * TILE, r = hash(tx, ty, 6);
  if (kind === 'c6Lawn') {
    c.fillStyle = r > 0.5 ? '#5d9a48' : '#589344';
    c.fillRect(x, y, TILE, TILE);
    // mower stripes, so the school looks cared for
    c.fillStyle = 'rgba(210,240,190,0.06)';
    if ((tx >> 2) % 2 === 0) c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(60,110,50,0.28)';
    for (var g1 = 0; g1 < 3; g1++) {
      c.fillRect(x + Math.floor(hash(tx, ty, g1 + 2) * 13), y + 3 + Math.floor(hash(tx, ty, g1 + 12) * 10), 1, 2);
    }
    if (r > 0.94) {
      c.fillStyle = '#e8d060';
      c.fillRect(x + 7, y + 6, 2, 2);
    }
    return true;
  }
  if (kind === 'c6Pave') {
    c.fillStyle = r > 0.5 ? '#b9b4a8' : '#b3aea2';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(96,92,84,0.30)';
    c.fillRect(x, y, TILE, 1);
    c.fillRect(x, y, 1, TILE);
    c.fillStyle = 'rgba(226,222,212,0.22)';
    c.fillRect(x + 2, y + 2, 11, 1);
    if (r > 0.82) {
      c.fillStyle = 'rgba(120,116,106,0.30)';
      c.fillRect(x + 4, y + 9, 7, 2);
    }
    return true;
  }
  if (kind === 'c6Curb') {
    c.fillStyle = r > 0.5 ? '#cfc9bc' : '#c9c3b6';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(70,66,60,0.35)';
    c.fillRect(x, y, TILE, 2);
    c.fillStyle = 'rgba(240,236,226,0.30)';
    c.fillRect(x, y + 2, TILE, 1);
    c.fillStyle = 'rgba(70,66,60,0.22)';
    if (r > 0.7) c.fillRect(x + 5, y + 8, 4, 1);
    return true;
  }
  if (kind === 'c6Road') {
    c.fillStyle = r > 0.5 ? '#4a4a52' : '#45454d';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(200,200,210,0.06)';
    c.fillRect(x, y + 15, TILE, 1);
    c.fillStyle = 'rgba(20,20,24,0.22)';
    if (r > 0.72) c.fillRect(x + 3, y + 9, 7, 1);
    if (r < 0.14) c.fillRect(x + 10, y + 4, 1, 6);
    return true;
  }
  if (kind === 'c6Brick') {
    c.fillStyle = r > 0.5 ? '#8c5a4a' : '#865446';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(58,28,22,0.28)';
    for (var b = 0; b < 2; b++) {
      c.fillRect(x, y + b * 8, TILE, 1);
      c.fillRect(x + ((ty + b) % 2 ? 4 : 11), y + b * 8, 1, 8);
    }
    c.fillStyle = 'rgba(214,178,150,0.10)';
    if (r > 0.6) c.fillRect(x + 2, y + 2, 6, 1);
    return true;
  }
  if (kind === 'c6ShopFloor') {
    // checkerboard marble, cream and grey
    var q = ((tx + ty) % 2) ? 0 : 1;
    c.fillStyle = q ? '#cfc6b2' : '#8f8a80';
    c.fillRect(x, y, 8, 8);
    c.fillRect(x + 8, y + 8, 8, 8);
    c.fillStyle = q ? '#8f8a80' : '#cfc6b2';
    c.fillRect(x + 8, y, 8, 8);
    c.fillRect(x, y + 8, 8, 8);
    c.fillStyle = 'rgba(255,250,240,0.06)';
    c.fillRect(x, y, TILE, 1);
    c.fillStyle = 'rgba(40,36,30,0.10)';
    c.fillRect(x, y + 15, TILE, 1);
    if (r > 0.9) {
      c.fillStyle = 'rgba(60,54,46,0.16)';
      c.fillRect(x + 3, y + 5, 5, 1);
    }
    return true;
  }
  if (kind === 'c6ShopWall') {
    c.fillStyle = r > 0.5 ? '#6f5a4a' : '#6a5546';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(240,226,200,0.07)';
    for (var s = 0; s < 3; s++) c.fillRect(x + 3 + s * 5, y, 2, TILE);
    if (ty === 0) {
      c.fillStyle = '#4a3a2e';
      c.fillRect(x, y, TILE, 4);
      c.fillStyle = '#8a745c';
      c.fillRect(x, y + 4, TILE, 2);
    }
    if (ty === 3) {
      // wainscot along the bottom of the wall
      c.fillStyle = '#3f5142';
      c.fillRect(x, y + 4, TILE, 12);
      c.fillStyle = '#4b5f4d';
      c.fillRect(x, y + 4, TILE, 1);
      c.fillStyle = 'rgba(20,28,22,0.40)';
      c.fillRect(x, y + 8, TILE, 1);
    }
    return true;
  }
  if (kind === 'c6Lot') {
    c.fillStyle = r > 0.5 ? '#4e4e56' : '#494951';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(210,210,220,0.05)';
    for (var d = 0; d < 3; d++) {
      c.fillRect(x + Math.floor(hash(tx, ty, d + 4) * 13), y + Math.floor(hash(tx, ty, d + 14) * 13), 2, 1);
    }
    if (r > 0.9) {
      c.fillStyle = 'rgba(22,22,26,0.35)';
      c.fillRect(x + 3, y + 6, 8, 1);
      c.fillRect(x + 7, y + 7, 1, 4);
    }
    if (r < 0.08) {
      c.fillStyle = 'rgba(200,200,210,0.10)';
      c.fillRect(x + 5, y + 11, 4, 1);
    }
    return true;
  }
  return false;
});

// ----------------------------------------------------------------- scripts

SCRIPT.ch6Kevin = function () {
  if (G.flags.c6_metKid) {
    say([{ who: 'kevin', text: 'We are up to the third course. The Professor said he would throw us curly fries. That was four hours ago.' }]);
    return;
  }
  G.flags.c6_metKid = true;
  say([
    { who: 'narrator', text: 'Kevin is straining under a pine trunk roughly the size of Kevin.' },
    { who: 'maverick', text: 'Hey, Kevin, what is with the wood? Are you guys redoing the fence?' },
    { who: 'kevin', text: 'No, Mav! We are building Professor Bucktooth his Almighty Altar! He is a structural hero, a music sensation, and he deserves a shrine of pure timber!' },
    { who: 'kevin', text: 'We are hoping he throws us some curly fries later!' },
    { who: 'narrator', text: 'A stream of children carried heavy lumber toward the drop off circle with the joy of people who have been promised fries.' },
    { who: 'maverick', text: 'I was about to tell him the Professor is a terrible person, or beaver, when the engine noise started.' }
  ]);
};

SCRIPT.ch6Lily = function () {
  G.flags.c6_metKid = true;
  say([
    { who: 'lily', text: 'I am in kindergarten and this log is bigger than my whole future.' },
    { who: 'maverick', text: 'That is a real sentence, Lily.' },
    { who: 'lily', text: 'The Professor says the altar needs a foundation. I am the foundation.' }
  ]);
};

SCRIPT.ch6Chad = function () {
  G.flags.c6_metKid = true;
  say([
    { who: 'chad', text: 'I am in seventh grade. I could carry two of these. I am carrying one so nobody feels bad.' },
    { who: 'maverick', text: 'That is the most emotionally intelligent thing anybody has said on this street.' },
    { who: 'chad', text: 'The fries are going to be so good, Mav.' }
  ]);
};

SCRIPT.ch6Sign = function () {
  say([{ who: 'sign', text: 'SCHOOL ZONE. KIDS CARRYING LUMBER. NO MUSICAL THEATRE BEFORE 9 AM.' }]);
};

SCRIPT.ch6Altar = function () {
  say([
    { who: 'narrator', text: 'The Almighty Altar is three courses of pine, a laminated sign, and a juice box left as an offering.' },
    { who: 'maverick', text: 'It is load bearing. That is the worst part. It is actually load bearing.' }
  ]);
};

SCRIPT.ch6Pile = function () {
  say([{ who: 'narrator', text: 'A pile of rough cut pine. Somebody has written a number on the end of each log in marker, as if measurements were the problem.' }]);
};

SCRIPT.ch6BuckStreet = function () {
  if (G.flags.c6_arrived) {
    say([
      { who: 'bucktooth', text: 'The afternoon is idling, Mav. Get in. The Gouda is downtown and the Gouda is not going to age itself.' },
      { who: 'maverick', text: 'No more crime or musicals, promise?' },
      { who: 'bucktooth', text: 'I promise only an elegant afternoon.' }
    ], function () {
      G.toScene('c6_shop', 16, 14, 'up');
    });
    return;
  }
  say([{ who: 'narrator', text: 'The engine is still running. The Professor is still arriving.' }]);
};

SCRIPT.ch6Dealer = function () {
  if (G.flags.c6_taken) {
    say([{ who: 'cheese_dealer', text: 'And that is why the cave must breathe. Are you listening? You have gone very quiet.' }]);
    return;
  }
  if (CH6.phase === 'talk') {
    say([{ who: 'cheese_dealer', text: 'Do not interrupt. I am in the middle of a very important sentence about humidity.' }]);
    return;
  }
  if (CH6.phase === 'caught') {
    say([{ who: 'cheese_dealer', text: 'One moment. I am dealing with a beaver shaped problem.' }]);
    return;
  }
  say([
    { who: 'narrator', text: 'The cheese dealer is an earnest man in a large, floppy beret. He is already holding a small knife and a story about mold.' },
    { who: 'bucktooth', text: 'Oh, drat! I have forgotten my wallet! It is the size of a tiny brick, and yet I forgot it!' },
    { who: 'bucktooth', text: 'Mav, my boy, you must engage this man in conversation about the micro climate necessary for optimal aging. Distract him with data!' },
    { who: 'maverick', text: 'I know exactly where this is going. I am going anyway, because of the Gouda.' }
  ], function () {
    G.flags.c6_heist = true;
    saveGame();
    ch6StartHeist();
    ch6HeistRound();
  });
};

SCRIPT.ch6BuckShop = function () {
  if (G.flags.c6_taken) {
    say([{ who: 'bucktooth', text: 'Gouda secured! Get in the car, accomplice! The front door is behind you and the afternoon is ahead of us.' }]);
    return;
  }
  if (CH6.phase === 'talk') {
    say([{ who: 'bucktooth', text: 'Keep talking! I am at segment ' + CH6.crawl + '! Do not look at me! Looking is how they find you!' }]);
    return;
  }
  say([{ who: 'bucktooth', text: 'Talk to the man with the beret. Ask him something elaborate. I will handle the floor level work.' }]);
};

SCRIPT.ch6Case = function () {
  say([
    { who: 'narrator', text: 'Three cheeses under glass. Each one has a little wooden tag, and each tag has a sentence on it.' },
    { who: 'maverick', text: 'The blue one says it was raised by a family. I am not going to be able to eat that.' }
  ]);
};

SCRIPT.ch6Crates = function () {
  say([
    { who: 'narrator', text: 'Three shipping crates, all stencilled WHEEL. Two of them are empty. The third is making a sound that could be a mouse or could be a very young cheese.' },
    { who: 'maverick', text: 'I am not opening that.' }
  ]);
};

SCRIPT.ch6Samples = function () {
  say([{ who: 'narrator', text: 'A sample board with five cubes and five toothpicks. There is a handwritten sign that says ONE EACH, in a tone that suggests it has been a long year.' }]);
};

SCRIPT.ch6Window = function () {
  say([{ who: 'narrator', text: 'Through the glass: a bus, a bin, and a man walking a very small dog past a very large wheel of cheese in the window of a different shop.' }]);
};

SCRIPT.ch6ShopDoor = function () {
  if (G.flags.c6_taken) {
    say([{ who: 'narrator', text: 'The door is right there. So is the car. So is the cheese.' }]);
    return;
  }
  say([{ who: 'bucktooth', text: 'We are not leaving without the eighth wonder of the dairy world. Stand near the counter and be interesting.' }]);
};

SCRIPT.ch6Gouda = function () {
  if (G.flags.c6_taken) {
    say([{ who: 'narrator', text: 'There is a clean circle in the dust where the wheel used to be. It looks like an accusation.' }]);
    return;
  }
  say([
    { who: 'narrator', text: 'A wheel of Gouda the size of a small tire. Golden, slightly sweating, entirely unguarded for reasons that will become clear.' },
    { who: 'maverick', text: 'That is not a cheese. That is a commitment.' }
  ]);
};

SCRIPT.ch6Dumpster = function () {
  say([{ who: 'narrator', text: 'The dumpster smells like a school, a bakery, and a decision.' }]);
};

SCRIPT.ch6BuckLot = function () {
  if (G.flags.c6_splat) {
    say([{ who: 'bucktooth', text: 'Splendid afternoon. Ten out of ten. I would steal from that man again, and I would do it slower.' }]);
    return;
  }
  if (G.flags.c6_pie) {
    say([{ who: 'bucktooth', text: 'Hold still. This is a reward and rewards require a steady hand.' }]);
    return;
  }
  say([{ who: 'bucktooth', text: 'Say nothing. Let me do the talking. I have a voice for official occasions.' }]);
};

SCRIPT.ch6CopA = function () {
  say([{ who: 'platypus_cop', text: 'Drive safe. Return the Gouda before it reaches room temperature. That is not a joke, it is a texture problem.' }]);
};

SCRIPT.ch6CopB = function () {
  say([{ who: 'platypus_cop', text: 'We have filed nothing. We have written nothing down. We are going to go and think about our afternoon.' }]);
};

// ------------------------------------------------------------------- heist

var C6_ROUNDS = [
  {
    prompt: 'Excuse me, sir. A question about the aging environment.',
    opts: [
      {
        kind: 'good',
        label: 'What relative humidity does a hard cheese want, versus a semi soft?',
        reply: [
          { who: 'cheese_dealer', text: 'Ah. AH. Nobody asks that. A hard cheese wants a cave at eighty five, and a semi soft wants it damp and slightly apologetic. Let me get the chart.' },
          { who: 'narrator', text: 'He produced a laminated chart from somewhere behind the counter.' }
        ]
      },
      {
        kind: 'weak',
        label: 'Is the big wheel on sale?',
        reply: [{ who: 'cheese_dealer', text: 'Sale is a word we do not use in this room.' }]
      },
      {
        kind: 'rude',
        label: 'Do you have normal cheese? Orange, in a block?',
        reply: [
          { who: 'cheese_dealer', text: 'Get out of my shop. No. Stay. I am sorry. I am passionate about this and you caught me at a difficult hour.' },
          { who: 'narrator', text: 'Behind him, the beaver lost a segment to the surprise.' }
        ]
      }
    ]
  },
  {
    prompt: 'Follow up question, if I may.',
    opts: [
      {
        kind: 'good',
        label: 'Where does humidity stop being climate and start being personality?',
        reply: [
          { who: 'cheese_dealer', text: 'Conservatively? Year three. After year three the cave has opinions. We do not argue with the cave.' },
          { who: 'narrator', text: 'He put both hands on the counter and settled in for the long version.' }
        ]
      },
      {
        kind: 'weak',
        label: 'Do you do samples? Tiny ones are fine.',
        reply: [{ who: 'cheese_dealer', text: 'There is a board. There is a sign on the board. The sign says one each.' }]
      },
      {
        kind: 'rude',
        label: 'Is the mold included, or is that extra?',
        reply: [{ who: 'cheese_dealer', text: 'The mold is the point. The mold is the entire point. I am going to need a moment.' }]
      }
    ]
  },
  {
    prompt: 'One more. This one is important.',
    opts: [
      {
        kind: 'good',
        label: 'Does the rind breathe? What is it breathing in there?',
        reply: [
          { who: 'cheese_dealer', text: 'The rind breathes the room. The room breathes the street. The street breathes the bus, which idles outside for reasons nobody has explained.' },
          { who: 'narrator', text: 'Somewhere behind him, a tail went past the sample table.' }
        ]
      },
      {
        kind: 'weak',
        label: 'How long has this shop been here?',
        reply: [{ who: 'cheese_dealer', text: 'Long enough that the floor knows my footsteps. Two years.' }]
      },
      {
        kind: 'rude',
        label: 'Can I just hold the big one for a second?',
        reply: [{ who: 'cheese_dealer', text: 'No. Nobody holds the eighth wonder. People have asked. People have been asked to leave.' }]
      }
    ]
  },
  {
    prompt: 'Last one. I have been saving it.',
    opts: [
      {
        kind: 'good',
        label: 'Two degrees apart, same curd. Do I taste the difference, or the confidence?',
        reply: [
          { who: 'cheese_dealer', text: 'You taste the confidence. The difference is for the invoice. You are the first person to ask me that in eleven years.' },
          { who: 'narrator', text: 'He took off his glasses and cleaned them, which bought a great deal of time.' }
        ]
      },
      {
        kind: 'weak',
        label: 'So is this a shop or a museum?',
        reply: [{ who: 'cheese_dealer', text: 'It is a shop. The museum is my personality.' }]
      },
      {
        kind: 'rude',
        label: 'My friend is crawling behind you right now, actually.',
        reply: [{ who: 'cheese_dealer', text: 'That is a strange thing to say to a man with a knife and a story about mold.' }]
      }
    ]
  }
];

function ch6PlaceBuck() {
  var b = ch6Ent('c6_buck_shop');
  if (!b) return;
  b.px = 5 * TILE + 8 + CH6.crawl * C6_STEP_TILES * TILE;
  b.py = 8 * TILE - 2;
  b.dir = 'right';
  b.moving = CH6.crawl > 0;
}

function ch6StartHeist() {
  CH6.phase = 'talk';
  CH6.t = Math.max(6, C6_HEIST_SECONDS - CH6.penalty);
  CH6.crawl = 0;
  CH6.expired = false;
  CH6.lastT = 0;
  CH6.left = 0;
  G.flags.c6_taken = false;
  G.flags.c6_crawl = 0;
  ch6PlaceBuck();
  if (CH6.penalty > 0) toast('run it back: ' + Math.round(CH6.t) + ' seconds this time');
  else toast('keep him talking: pick the most elaborate question');
}

function ch6HeistRound() {
  if (CH6.phase !== 'talk') return;
  if (CH6.expired) return;
  if (CH6.crawl >= 4) { ch6Success(); return; }
  var r = C6_ROUNDS[Math.min(C6_ROUNDS.length - 1, CH6.crawl)];
  var opts = r.opts.map(function (o) {
    return {
      label: o.label,
      act: function () {
        if (CH6.phase !== 'talk' || CH6.expired) return;
        if (o.kind === 'good') {
          CH6.crawl = Math.min(4, CH6.crawl + 1);
          CH6.t = Math.min(C6_HEIST_SECONDS, CH6.t + 3);
          G.flags.c6_crawl = CH6.crawl;
          SFX.blip(620 + CH6.crawl * 70, 0.07);
          FX.burst(5 * TILE + CH6.crawl * 60, 8 * TILE, '#f0d060', 8, { speed: 30, life: 0.5, lift: 20 });
          FX.pop(G.px, G.py - 44, 'HE IS STILL TALKING', '#f0c060');
        } else {
          CH6.t -= (o.kind === 'rude' ? 4 : 2.5);
          CH6.crawl = Math.max(0, CH6.crawl - 1);
          G.flags.c6_crawl = CH6.crawl;
          if (o.kind === 'rude') {
            G.shake = 0.4;
            SFX.tone(170, 0.14, 'square', 0.05);
            FX.pop(G.px, G.py - 44, 'THAT WAS RUDE', '#e8607a');
          } else {
            SFX.blip(280, 0.09);
            FX.pop(G.px, G.py - 44, 'HE IS WRAPPING UP', '#e8a070');
          }
          if (CH6.t <= 0) { CH6.t = 0; CH6.expired = true; }
        }
        ch6PlaceBuck();
      },
      reply: o.reply
    };
  });
  say([
    { who: 'maverick', text: r.prompt },
    { who: 'maverick', text: '', choices: opts }
  ], function () { ch6HeistRound(); });
}

function ch6Success() {
  if (CH6.phase !== 'talk') return;
  if (CH6.expired || CH6.t <= 0) { ch6Caught(); return; }
  CH6.phase = 'run';
  CH6.left = Math.max(0, Math.min(C6_HEIST_SECONDS, CH6.t));
  G.flags.c6_left = Math.round(CH6.left * 10) / 10;
  G.flags.c6_taken = true;
  G.flags.seen_c6_exit = true;
  saveGame();
  var b = ch6Ent('c6_buck_shop');
  if (b) { b.px = 22 * TILE + 4; b.py = 8 * TILE - 2; b.dir = 'up'; b.moving = false; }
  SFX.pickup();
  FX.confetti(22 * TILE, 7 * TILE);
  FX.pop(22 * TILE, 5 * TILE, 'GOUDA SECURED', '#f0c060');
  say([
    { who: 'narrator', text: 'Professor Bucktooth executed a perfect, stealthy belly crawl, lifted the entire wheel of Gouda, which was the size of a small tire, and whispered:' },
    { who: 'bucktooth', text: 'Gouda secured! Get in the car, accomplice!' },
    { who: 'cheese_dealer', text: 'And that is why the cave must breathe. Are you listening? You have gone very quiet.' },
    { who: 'maverick', text: 'Still here. Beautiful cave. Keep going.' }
  ], function () {
    buildScene('c6_shop');
    var bb = ch6Ent('c6_buck_shop');
    if (bb) { bb.px = 15 * TILE + 4; bb.py = 15 * TILE; bb.dir = 'down'; }
    toast('the bell is going to ring on the way out');
  });
}

function ch6Caught() {
  if (CH6.phase !== 'talk') return;
  CH6.phase = 'caught';
  CH6.expired = false;
  CH6.catches++;
  CH6.penalty = Math.min(7, CH6.penalty + 2);
  G.flags.c6_catches = CH6.catches;
  G.shake = 0.7;
  SFX.tone(150, 0.22, 'square', 0.06);
  FX.pop(16 * TILE, 8 * TILE, 'SPOTTED', '#e8607a');
  saveGame();
  say([
    { who: 'narrator', text: 'The dealer stopped mid sentence. He turned around very slowly, the way a man turns around when he has heard a floorboard.' },
    { who: 'cheese_dealer', text: 'Is that beaver... crawling?' },
    { who: 'bucktooth', text: 'I am inspecting the floor! Structurally! It is a very load bearing floor!' },
    { who: 'narrator', text: 'The dealer walked over, took the Professor by the tail, and set him back down at the far end of the counter.' },
    { who: 'cheese_dealer', text: 'We will start again. I have all afternoon. You have less of it.' }
  ], function () { ch6RestartHeist(); });
}

function ch6RestartHeist() {
  CH6.crawl = 0;
  CH6.left = 0;
  G.flags.c6_taken = false;
  G.flags.c6_crawl = 0;
  if (G.sceneId === 'c6_shop') buildScene('c6_shop');
  CH6.phase = 'idle';
  ch6StartHeist();
  ch6HeistRound();
}

// ---------------------------------------------------------------- the lot

function ch6LotTalk() {
  if (CH6.lotTalked) return;
  CH6.lotTalked = true;
  SFX.tone(220, 0.16, 'square', 0.05);
  say([
    { who: 'narrator', text: 'Two motorcycle sirens blared. Two police officers pulled them over.' },
    { who: 'narrator', text: 'The officers were platypuses. Stern ones. Uniformed ones. Their bills looked official.' },
    { who: 'platypus_cop', text: 'License and registration, please. And why, sir, is your young passenger wearing a moustache and covered in the residue of a baked good?' },
    { who: 'bucktooth', text: 'It was a cultural exchange! And this is a therapy animal! He calms me when I drive!' },
    { who: 'narrator', text: 'The two platypuses exchanged a long, silent, billed look.' },
    { who: 'platypus_cop', text: 'Son, we have been observing this professor. He teaches minors to River Dance, runs from Mrs. Wallaby, and steals cheese. Our official assessment: he is a bad influence. You need to stop hanging out with him.' },
    { who: 'maverick', text: 'I have been trying! I told my mom! I tried to get arrested! No one cares! I am the only person on Earth who thinks this beaver has no redeeming qualities whatsoever!' }
  ], ch6LotChoice);
}

function ch6LotChoice() {
  say([
    { who: 'maverick', text: 'The platypus is waiting. So is the Gouda, in the back seat, getting warmer.' },
    {
      who: 'maverick',
      text: '',
      choices: [
        {
          label: 'Ask whether the Gouda can be logged as evidence.',
          act: function () { G.flags.c6_evidence = true; },
          reply: [
            { who: 'platypus_cop', text: 'It can be logged as evidence of a very good afternoon. Return it before it reaches room temperature.' },
            { who: 'bucktooth', text: 'It is already at room temperature. That is the correct temperature for eating.' },
            { who: 'narrator', text: 'The platypuses shrugged, started their engines, and left.' }
          ]
        },
        {
          label: 'Say nothing and let the beaver handle it.',
          act: function () {},
          reply: [
            { who: 'bucktooth', text: 'Officers, consider the structural poetry of a wheel. It is a circle. Circles do not commit crimes. They roll.' },
            { who: 'platypus_cop', text: 'Well. We tried.' },
            { who: 'narrator', text: 'The platypuses shrugged, wrote nothing down, and left.' }
          ]
        }
      ]
    }
  ], ch6PieBeat);
}

function ch6PieBeat() {
  G.flags.c6_pie = true;
  say([
    { who: 'narrator', text: 'Back at the school, the other kids were still hauling logs. Nobody had been paid in fries yet.' },
    { who: 'bucktooth', text: 'You know, Mav, despite the cheese fiasco, you did well today. You deserve a reward. A consolation prize!' },
    { who: 'narrator', text: 'The Professor reached into the back seat and produced a perfectly assembled banana cream pie.' },
    { who: 'bucktooth', text: 'Here, kid! A token of my...' }
  ], ch6PieSmack);
}

function ch6PieSmack() {
  G.flags.c6_pie = false;
  G.flags.c6_splat = true;
  G.shake = 0.8;
  SFX.splash();
  SFX.tone(320, 0.12, 'square', 0.05);
  FX.burst(G.px + 4, G.py - 22, '#f2e6c8', 26, { speed: 90, life: 0.8, lift: 30 });
  FX.burst(G.px + 4, G.py - 22, '#e8c880', 14, { speed: 70, life: 0.7, lift: 20 });
  FX.pop(G.px, G.py - 46, 'SMACK', '#f6ecd8');
  say([
    { who: 'narrator', text: 'He handed it forward with such enthusiasm and speed that it did not land in Mav\'s hands.' },
    { who: 'narrator', text: 'It smacked him squarely in the face. Banana cream and crust exploded everywhere.' },
    { who: 'bucktooth', text: 'Oops! Too fast! Butterfingers! Well, gotta run!' },
    { who: 'narrator', text: 'He executed three perfect, smoky donuts in the middle of the school parking lot and vanished in a cloud of rubber and Gouda dust.' }
  ], ch6Donuts);
}

function ch6Donuts() {
  if (CH6.done) return;
  CH6.done = true;
  CH6.carRunT = 1.4;
  SFX.tone(120, 0.6, 'sawtooth', 0.07);
  SFX.tone(90, 0.5, 'square', 0.05);
  G.shake = 0.5;
  toast('THREE PERFECT DONUTS');
  FX.burst(14 * TILE, 9 * TILE, '#cfc6ae', 24, { speed: 90, life: 0.9, lift: 20 });
  say([
    { who: 'narrator', text: 'Mav stood there, covered in pie and completely baffled, while the log carrying kids stared at him with awe.' },
    { who: 'maverick', text: 'It was a cultural exchange.' },
    { who: 'narrator', text: 'He wiped the cream off his eyes and walked back inside, utterly confused about the morality of his life choices.' }
  ], function () {
    if (G.flags.c6_done) return;
    G.flags.c6_done = true;
    var secs = Math.max(0, Math.round(G.flags.c6_left || 0));
    var score = Math.max(0, Math.min(100, Math.round(secs / C6_HEIST_SECONDS * 100)));
    cleared(6, score, 'Gouda secured, ' + secs + 's left');
  });
}

// ------------------------------------------------------------------- ticks

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch6') return;
  if (G.sceneId === 'c6_school') ch6SchoolTick(dt);
  else if (G.sceneId === 'c6_shop') ch6ShopTick(dt);
  else if (G.sceneId === 'c6_lot') ch6LotTick(dt);
});

function ch6SchoolTick(dt) {
  // the haulers walk their logs toward the altar and loop
  for (var i = 0; i < G.ents.length; i++) {
    var e = G.ents[i];
    if (!e.haul) continue;
    var speed = e.small ? 9 : 12;
    e.py -= speed * dt;
    if (e.py < 5 * TILE + TILE) {
      e.py = 12 * TILE + TILE;
      e.px = 8 * TILE + (i % 3) * 56;
    }
    e.moving = true;
    e.dir = 'up';
  }

  // the Mustang arrives once Mav has heard about the altar
  if (!G.flags.c6_arrived) {
    var car = ch6Ent('c6_car');
    if (G.flags.c6_metKid) {
      CH6.carT += dt;
      var k = Math.min(1, CH6.carT / 1.4);
      var ease = 1 - (1 - k) * (1 - k);
      if (car) car.px = -72 + 272 * ease;
      if (CH6.carT > 0.6 && Math.random() < 0.3) {
        FX.burst((car ? car.px : 0) - 20, 11 * TILE + 4, '#cfc6ae', 3, { speed: 40, life: 0.4, lift: 10 });
      }
      if (k >= 1) ch6CarArrive();
    }
    return;
  }

  var car2 = ch6Ent('c6_car');
  if (car2) { car2.px = 200; car2.py = 11 * TILE + TILE; }
}

function ch6CarArrive() {
  G.flags.c6_arrived = true;
  G.flags.seen_c6_buck = true;
  SFX.tone(120, 0.35, 'sawtooth', 0.05);
  G.shake = 0.35;
  FX.burst(200, 11 * TILE + 6, '#cfc6ae', 12, { speed: 50, life: 0.6, lift: 16 });
  buildScene('c6_school');
  var car = ch6Ent('c6_car');
  if (car) { car.px = 200; car.py = 11 * TILE + TILE; }
  say([
    { who: 'narrator', text: 'A cherry red convertible slid to a stop beside him, one wheel on the kerb, the engine doing a low, expensive growl.' },
    { who: 'bucktooth', text: 'Good morning, my strangely un lumber toting companion! We have no time for school and its structured environment!' },
    { who: 'bucktooth', text: 'I have heard rumours of an artisanal cheese tasting downtown. They have a Gouda that is said to be the eighth wonder of the dairy world!' },
    { who: 'maverick', text: 'Cheese is definitely better than carrying enormous logs for a beaver cult.' },
    { who: 'maverick', text: 'Fine. Let us go. But no more crime or musicals, promise?' },
    { who: 'bucktooth', text: 'I promise only an elegant afternoon.' },
    { who: 'narrator', text: '[Talk to the Professor to get in the car.]' }
  ]);
}

function ch6ShopTick(dt) {
  // the bell over the door, once
  if (CH6.bellT <= 0 && !G.flags.c6_bell) {
    CH6.bellT = 0.7;
    G.flags.c6_bell = true;
  }
  if (CH6.bellT > 0) {
    CH6.bellT -= dt;
    if (CH6.bellT <= 0) {
      SFX.tone(1180, 0.09, 'square', 0.035);
      SFX.tone(1560, 0.12, 'square', 0.03);
    }
  }

  // the clock ran out while a dialogue was open: pick it up once it closes
  if (CH6.expired && !DLG.active) { ch6Caught(); return; }

  // after the wheel is lifted, the beaver trots to the door
  if (CH6.phase === 'run') {
    var b = ch6Ent('c6_buck_shop');
    if (b) {
      var tx = 15 * TILE + 4, ty = 15 * TILE;
      var dx = tx - b.px, dy = ty - b.py;
      var d = Math.hypot(dx, dy);
      if (d > 4) {
        b.px += (dx / d) * 52 * dt;
        b.py += (dy / d) * 52 * dt;
        b.moving = true;
        b.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      } else {
        b.moving = false;
        b.dir = 'down';
      }
    }
  }
}

function ch6LotTick(dt) {
  if (!CH6.lotStarted) {
    CH6.lotStarted = true;
    CH6.lotT = 1.5;
    return;
  }

  var a = ch6Ent('c6_cop_a');
  var b = ch6Ent('c6_cop_b');

  if (CH6.lotT > 0) {
    CH6.lotT -= dt;
    var k = 1 - Math.max(0, CH6.lotT) / 1.5;
    var ease = 1 - (1 - k) * (1 - k);
    if (a) {
      a.px = 560 + (392 - 560) * ease;
      a.py = 12 * TILE + TILE;
      a.moving = k < 0.97;
      a.dir = 'left';
    }
    if (b) {
      b.px = 600 + (440 - 600) * ease;
      b.py = 14 * TILE + TILE;
      b.moving = k < 0.97;
      b.dir = 'left';
    }
    if (k > 0.2 && Math.random() < 0.2) {
      FX.burst((a ? a.px : 0) - 18, 12 * TILE + 10, '#cfc6ae', 2, { speed: 30, life: 0.4, lift: 8 });
    }
    if (CH6.lotT <= 0) {
      if (a) { a.px = 392; a.moving = false; }
      if (b) { b.px = 440; b.moving = false; }
      SFX.tone(300, 0.12, 'square', 0.04);
      ch6LotTalk();
    }
    return;
  }

  // the donuts, then gone
  if (CH6.carRunT > 0) {
    CH6.carRunT -= dt;
    var car = ch6Ent('c6_car_lot');
    if (car) {
      car.px += 290 * dt;
      if (Math.random() < 0.5) {
        FX.burst(car.px - 26, car.py - 6, '#cfc6ae', 3, { speed: 40, life: 0.5, lift: 12 });
      }
    }
  }
}

// -------------------------------------------------------------------- HUD

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch6') return;

  // the clock is driven here so it keeps running while a dialogue is open,
  // which is the only time it matters. lastT always advances, so a restart
  // can never inherit a stale gap.
  var now = G.time;
  if (!CH6.lastT) CH6.lastT = now;
  var step = now - CH6.lastT;
  CH6.lastT = now;
  if (CH6.phase === 'talk' && G.sceneId === 'c6_shop' && !RESULT.active) {
    if (step > 0 && step < 0.25) {
      CH6.t -= step;
      if (CH6.t <= 0) { CH6.t = 0; CH6.expired = true; }
    }
  }

  if (G.sceneId !== 'c6_shop' || CH6.phase !== 'talk') return;

  var left = Math.max(0, CH6.t);
  var pw = 126, pxx = W - pw - 12, pyy = 30;

  // a compact panel in the corner, clear of the objective, the toast and the
  // chalkboard, because those are the three things it used to sit on
  c.fillStyle = 'rgba(18,16,28,0.80)';
  c.fillRect(pxx - 7, pyy - 11, pw + 14, 44);
  c.strokeStyle = 'rgba(240,192,96,0.30)';
  c.lineWidth = 1;
  c.strokeRect(pxx - 6.5, pyy - 10.5, pw + 13, 43);

  c.fillStyle = '#2a2434';
  c.fillRect(pxx, pyy, pw, 7);
  c.fillStyle = left < 4 ? (Math.sin(G.time * 14) > 0 ? '#ff8f8f' : '#e8404f') : '#e8c060';
  c.fillRect(pxx, pyy, pw * (left / C6_HEIST_SECONDS), 7);
  c.strokeStyle = 'rgba(244,228,192,0.35)';
  c.strokeRect(pxx + 0.5, pyy + 0.5, pw - 1, 6);

  c.font = '6px monospace';
  c.textAlign = 'right';
  c.fillStyle = left < 4 ? '#ffb0b0' : '#f0e4c8';
  c.fillText('DEALER TALKING  ' + Math.ceil(left) + 's', pxx + pw, pyy - 5);

  // the crawl, four segments
  var seg = (pw - 3 * 5) / 4;
  c.font = '5px monospace';
  c.textAlign = 'left';
  c.fillStyle = 'rgba(240,224,180,0.65)';
  c.fillText('BUCKTOOTH', pxx, pyy + 20);
  for (var i = 0; i < 4; i++) {
    var sx = pxx + i * (seg + 5), sy = pyy + 24;
    var full = i < CH6.crawl;
    c.fillStyle = 'rgba(10,8,16,0.75)';
    c.fillRect(sx - 1, sy - 1, seg + 2, 10);
    c.fillStyle = full ? '#e8c258' : '#2a2434';
    c.fillRect(sx, sy, seg, 8);
    if (full) {
      c.fillStyle = 'rgba(255,246,214,0.55)';
      c.fillRect(sx, sy, seg, 1);
    }
    c.strokeStyle = 'rgba(244,228,192,0.22)';
    c.strokeRect(sx + 0.5, sy + 0.5, seg - 1, 7);
  }
  c.textAlign = 'left';
});

// ----------------------------------------------------------------- player

PLAYER_HOOKS.push(function (c) {
  if (G.level !== 'ch6' || !G.flags.c6_splat) return;
  // a face full of banana cream
  c.save();
  c.fillStyle = '#f2e6c8';
  c.fillRect(G.px - 8, G.py - 27, 16, 9);
  c.fillRect(G.px - 11, G.py - 23, 22, 5);
  c.fillStyle = '#fbf0d8';
  c.fillRect(G.px - 5, G.py - 28, 9, 5);
  c.fillStyle = '#e8c880';
  c.fillRect(G.px - 9, G.py - 22, 5, 3);
  c.fillRect(G.px + 3, G.py - 24, 4, 3);
  c.fillStyle = '#c9a06a';
  c.fillRect(G.px + 6, G.py - 26, 4, 3);
  // a drip that has given up
  c.fillStyle = 'rgba(242,230,200,0.75)';
  c.fillRect(G.px - 6, G.py - 16, 2, 5);
  c.fillRect(G.px + 4, G.py - 17, 2, 3);
  c.restore();
});

// ---------------------------------------------------------------- chapter

CHAPTER_CONTENT[6] = {
  start: 'c6_school',

  intro: function () {
    chapterCard('CHAPTER SIX', 'The Great Gouda Getaway', 3.2);
    ch6Reset();
    setTimeout(function () {
      if (G.level !== 'ch6') return;
      say([
        { who: 'narrator', text: 'The night before, Mav had told his mother about the club, the terrible rap, the stickup and the Cats performance.' },
        { who: 'narrator', text: '"Sounds like a very full evening, sweetie. Honestly, a little spontaneous musical theatre is probably better for your brain than video games."' },
        { who: 'narrator', text: '"But he taught me to drive a stick shift!" "Well, you know, it is a useful life skill. Now, go to bed."' },
        { who: 'narrator', text: 'Mav felt utterly defeated. No one cared that the beaver was a menace. He got a decent night of sleep anyway.' },
        { who: 'narrator', text: 'The moment he walked out the door the next morning, he knew something was very, very wrong.' },
        { who: 'narrator', text: 'Every single kid on his street, from Lily in kindergarten to Chad in seventh grade, was walking toward school under the weight of an enormous, roughly cut wooden log.' }
      ]);
    }, 900);
  },

  resume: function () {
    G.perform = false;
    CH6.phase = 'idle';
    CH6.expired = false;
    CH6.lastT = 0;
    CH6.bellT = 0;
    if (G.sceneId === 'c6_lot') {
      CH6.lotStarted = false;
      CH6.lotTalked = false;
      CH6.lotT = 0;
    }
  },

  objective: function () {
    if (G.sceneId === 'c6_school') {
      if (G.flags.c6_arrived) return 'objective: get in the Mustang';
      return 'objective: talk to Kevin about the lumber';
    }
    if (G.sceneId === 'c6_shop') {
      if (G.flags.c6_taken) return 'objective: out the front door, south';
      if (CH6.phase === 'caught') return 'objective: the dealer is turning around';
      if (CH6.phase === 'talk') {
        if (CH6.crawl >= 3) return 'objective: one more question, he is almost there';
        return 'objective: keep him talking, fill the crawl';
      }
      return 'objective: talk to the cheese dealer';
    }
    if (G.sceneId === 'c6_lot') {
      if (G.flags.c6_splat) return '';
      if (CH6.lotTalked) return '';
      return 'objective: wait for the sirens';
    }
    return '';
  }
};
