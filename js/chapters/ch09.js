// ch09.js - Chapter 9: Mav and the Cyber Goth Confection
//
// The mall. Bucktooth has a job at Wetzel's Pretzels, the yeast compound goes
// into the dough, Adrian eats a pepperoni pretzel, and the concourse fills up
// with teenagers who need neon PVC pants.
//
//   c9_pretzel    the pretzel stand, the visor, the compound
//   c9_mall       the concourse: novelty socks, Hot Topic, the fountain, the
//                 candle displays, and a mob that orbits all of it
//   c9_security   a cramped control room, nine monitors, one PA panel
//
// The mechanic is a crowd chase with a track choice. DOSE is the health bar and
// the mob is the source: stand in the crowd and it climbs, keep distance and it
// drains. If it fills, Mav dances too, the controls invert, and then he shakes
// it off. Reaching the door with any dose below full is fine. In the control
// room the PA panel offers three tracks and only one of them is "Achy Breaky
// Heart". Wrong tracks raise FRENZY and let the mob reach the door. There is no
// losing, only embarrassment.

// three neon heads for the mob. A PNG named goth.png wins over these.
if (!CHARS.goth) {
  CHARS.goth = {
    skin: '#e8c6b0', hair: '#3ad8c8', shirt: '#241f33',
    pants: '#1b1a24', shoe: '#0e0d14', hairStyle: 'messy'
  };
}
if (!CHARS.goth2) {
  CHARS.goth2 = {
    skin: '#d8b49c', hair: '#e85ac8', shirt: '#2a2036',
    pants: '#1b1a24', shoe: '#0e0d14', hairStyle: 'flat'
  };
}
if (!CHARS.goth3) {
  CHARS.goth3 = {
    skin: '#f0cbb2', hair: '#a8e83a', shirt: '#221c2c',
    pants: '#1b1a24', shoe: '#0e0d14', hairStyle: 'messy'
  };
}

NAMES.goth = 'A CYBER GOTH';

var CH9 = {
  phase: 'pretzel',   // pretzel | mall | security | done
  dose: 0,            // the health bar, and the problem
  frenzy: 0,          // how hard the mob is going
  maxDose: 0,
  wrong: 0,           // wrong tracks played on the PA
  dances: 0,
  down: 0,            // seconds left of involuntary dancing
  invuln: 0,          // grace after shaking it off
  sel: 0,             // PA selection
  right: 2,           // "Achy Breaky Heart"
  panelOn: false,
  broken: false,
  done: false,
  doorShake: 0,
  kd: [0, 0, 0]       // candle displays already on the floor
};

var CH9_TRACKS = [
  { name: 'SMOOTH JAZZ: LOBBY HOURS', tag: 'FOUR HOURS, NO SKIPS' },
  { name: 'CYBER GOTH MIX VOL. 3', tag: 'THE SAME SONG, LOUDER' },
  { name: 'ACHY BREAKY HEART', tag: 'BILLY RAY CYRUS, 1992' }
];

// ------------------------------------------------------------------- rooms

function ch9PretzelRects() {
  return [
    { x: 0, y: 0, w: 32, h: 4, t: 'c9pWall' },
    { x: 0, y: 0, w: 1, h: 18, t: 'c9pWall' },
    { x: 31, y: 0, w: 1, h: 18, t: 'c9pWall' },
    { x: 0, y: 17, w: 32, h: 1, t: 'c9pWall' },
    { x: 5, y: 4, w: 22, h: 1, t: 'c9CounterTop' },
    { x: 5, y: 5, w: 22, h: 2, t: 'c9CounterFront' }
  ];
}

function ch9PretzelProps() {
  return [
    { id: 'c9_menu', who: null, tx: 16, ty: 2, kind: 'c9_menuboard', propScale: 1, noSolid: true },
    { id: 'c9_warm', who: null, tx: 10, ty: 4, kind: 'c9_warm', propScale: 1, noSolid: true },
    { id: 'c9_reg', who: null, tx: 21, ty: 4, kind: 'c9_reg', propScale: 1, noSolid: true },
    { id: 'c9_vis', who: null, tx: 22, ty: 4, kind: 'c9_visorcase', propScale: 1, noSolid: true },
    { id: 'c9_tab1', who: null, tx: 6, ty: 11, kind: 'c9_table', propScale: 1, solid: true, sw: 2, sh: 1, reach: 44, talk: 'ch9Table' },
    { id: 'c9_tab2', who: null, tx: 25, ty: 11, kind: 'c9_table', propScale: 1, solid: true, sw: 2, sh: 1 },
    { id: 'c9_tab3', who: null, tx: 20, ty: 13, kind: 'c9_table', propScale: 1, solid: true, sw: 2, sh: 1 },
    { id: 'c9_bin1', who: null, tx: 29, ty: 6, kind: 'c9_bin', propScale: 1, solid: true },
    { id: 'c9_mop', who: null, tx: 2, ty: 8, kind: 'c9_mop', propScale: 1, solid: true },
    { id: 'c9_hire', who: null, tx: 28, ty: 9, kind: 'c9_hire', propScale: 1, solid: true, reach: 46, talk: 'ch9Hire' }
  ];
}

// the concourse. The fountain footprint is laid as basin tiles so it is solid
// without needing a four tile tall prop.
function ch9MallRects() {
  return [
    { x: 0, y: 0, w: 32, h: 3, t: 'c9Wall' },
    { x: 0, y: 0, w: 1, h: 18, t: 'c9Wall' },
    { x: 31, y: 0, w: 1, h: 18, t: 'c9Wall' },
    { x: 0, y: 17, w: 32, h: 1, t: 'c9Wall' },
    { x: 14, y: 8, w: 4, h: 3, t: 'c9Basin' }
  ];
}

function ch9MallProps() {
  return [
    { id: 'c9_door', who: null, tx: 4, ty: 2, kind: 'c9_secdoor', propScale: 1, sw: 2, reach: 62, talk: 'ch9Door' },
    { id: 'c9_hot', who: null, tx: 21, ty: 3, kind: 'c9_hottopic', propScale: 1, solid: true, sw: 4, sh: 1 },
    { id: 'c9_socks', who: null, tx: 3, ty: 7, kind: 'c9_socks', propScale: 1, solid: true, sw: 3, sh: 1, reach: 48, talk: 'ch9Socks' },
    { id: 'c9_fount', who: null, tx: 14, ty: 10, kind: 'c9_fountain', propScale: 1, noSolid: true },
    { id: 'c9_c1', who: null, tx: 11, ty: 13, kind: 'c9_candle', propScale: 1, solid: true, reach: 46, talk: 'ch9Candle1' },
    { id: 'c9_c2', who: null, tx: 7, ty: 10, kind: 'c9_candle', propScale: 1, solid: true, reach: 46, talk: 'ch9Candle2' },
    { id: 'c9_c3', who: null, tx: 21, ty: 12, kind: 'c9_candle', propScale: 1, solid: true, reach: 46, talk: 'ch9Candle3' },
    { id: 'c9_bench1', who: null, tx: 24, ty: 13, kind: 'c9_bench', propScale: 1, solid: true, sw: 2, sh: 1 },
    { id: 'c9_bench2', who: null, tx: 5, ty: 13, kind: 'c9_bench', propScale: 1, solid: true, sw: 2, sh: 1 },
    { id: 'c9_plant1', who: null, tx: 28, ty: 6, kind: 'c9_planter', propScale: 1, solid: true },
    { id: 'c9_plant2', who: null, tx: 2, ty: 12, kind: 'c9_planter', propScale: 1, solid: true },
    { id: 'c9_bin', who: null, tx: 29, ty: 15, kind: 'c9_bin', propScale: 1, solid: true },
    { id: 'c9_map', who: null, tx: 27, ty: 2, kind: 'c9_map', propScale: 1, noSolid: true }
  ];
}

// the crowd. Anchors sit in a ring around the fountain and beside the candles.
function ch9Mob() {
  var spots = [[12, 7], [19, 7], [12, 11], [19, 11], [15, 5],
               [9, 9], [22, 9], [21, 13], [11, 13], [24, 6]];
  var who = ['goth', 'goth2', 'taffy', 'goth3', 'kevin',
             'goth', 'nibbles', 'goth2', 'clerk', 'goth3'];
  var out = [];
  for (var i = 0; i < spots.length; i++) {
    out.push({
      id: 'c9_g' + i, who: who[i], tx: spots[i][0], ty: spots[i][1],
      dir: 'down', noSolid: true, small: i % 3 === 2, mob: true
    });
  }
  return out;
}

function ch9SecRects() {
  return [
    { x: 9, y: 3, w: 13, h: 11, t: 'c9SecFloor' }
  ];
}

function ch9SecProps() {
  return [
    { id: 'c9_mons', who: null, tx: 15, ty: 2, kind: 'c9_monitors', propScale: 1, noSolid: true },
    { id: 'c9_desk', who: null, tx: 12, ty: 7, kind: 'c9_desk', propScale: 1, solid: true, sw: 6, sh: 1 },
    { id: 'c9_pa', who: null, tx: 18, ty: 6, kind: 'c9_pa', propScale: 1, solid: true, reach: 52, talk: 'ch9PA' },
    { id: 'c9_chair', who: null, tx: 15, ty: 9, kind: 'c9_chair', propScale: 1, noSolid: true },
    { id: 'c9_fan', who: null, tx: 20, ty: 4, kind: 'c9_fan', propScale: 1, solid: true },
    { id: 'c9_lamp', who: null, tx: 11, ty: 6, kind: 'c9_lamp', propScale: 1, noSolid: true },
    { id: 'c9_kettle', who: null, tx: 10, ty: 5, kind: 'c9_kettle', propScale: 1, solid: true },
    { id: 'c9_inDoor', who: null, tx: 15, ty: 13, kind: 'c9_doorin', propScale: 1, noSolid: true }
  ];
}

// ------------------------------------------------------------------ scenes

SCENES.c9_pretzel = {
  title: "WETZEL'S PRETZELS",
  spawn: { tx: 16, ty: 14, dir: 'up' },
  camZoom: 1,
  fill: 'c9pFloor',
  rects: ch9PretzelRects(),
  solidKinds: ['c9pWall', 'c9CounterTop', 'c9CounterFront'],
  entities: ch9PretzelProps().concat([
    { id: 'c9_buck', who: 'bucktooth', tx: 16, ty: 4, dir: 'down', reach: 96, talk: 'ch9Buck' },
    { id: 'c9_adr', who: 'adrian', tx: 19, ty: 9, dir: 'up', reach: 48, talk: 'ch9Adrian' }
  ]),
  overlay: function (c) { ch9PaintPretzel(c); }
};

SCENES.c9_mall = {
  title: 'THE CONCOURSE, AFTER THE DOUGH',
  spawn: { tx: 16, ty: 16, dir: 'up' },
  camZoom: 1,
  fill: 'c9Floor',
  rects: ch9MallRects(),
  solidKinds: ['c9Wall', 'c9Basin'],
  entities: ch9MallProps().concat(ch9Mob()),
  overlay: function (c) { ch9PaintMall(c); }
};

SCENES.c9_security = {
  title: 'SECURITY AND CONTROL',
  spawn: { tx: 15, ty: 11, dir: 'up' },
  camZoom: 1,
  fill: 'c9SecWall',
  rects: ch9SecRects(),
  solidKinds: ['c9SecWall'],
  entities: ch9SecProps(),
  overlay: function (c) { ch9PaintSec(c); }
};

// ------------------------------------------------------------------- tiles

TILE_HOOKS.push(function (c, kind, tx, ty) {
  if (kind !== 'c9pWall' && kind !== 'c9pFloor' && kind !== 'c9CounterTop' &&
      kind !== 'c9CounterFront') return false;
  var x = tx * TILE, y = ty * TILE;
  var r = hash(tx, ty, 83), r2 = hash(tx, ty, 137);
  function R(px, py, w, h, col) { c.fillStyle = col; c.fillRect(x + px, y + py, w, h); }

  if (kind === 'c9pWall') {
    R(0, 0, 16, 16, r > 0.55 ? '#e6dac2' : r > 0.25 ? '#e2d5bb' : '#e9dec8');
    // subway tile
    R(0, 7, 16, 1, 'rgba(120,96,72,0.16)');
    R(0, 15, 16, 1, 'rgba(120,96,72,0.14)');
    var off = (ty % 2) * 4;
    R((off + 3) % 16, 0, 1, 7, 'rgba(120,96,72,0.13)');
    R((off + 11) % 16, 8, 1, 7, 'rgba(120,96,72,0.13)');
    if (ty === 0) {
      R(0, 0, 16, 16, '#3a3028');
      R(0, 12, 16, 4, '#2b241e');
      if (tx % 4 === 1) { R(5, 4, 6, 3, '#4a3d31'); R(6, 5, 4, 1, '#ffe6a8'); }
    }
    if (ty === 3) {
      R(0, 8, 16, 8, '#8a6a4a');
      R(0, 8, 16, 2, '#a8845e');
      R(0, 15, 16, 1, 'rgba(30,18,10,0.28)');
    }
    return true;
  }

  if (kind === 'c9pFloor') {
    var dark = (tx + ty) % 2 === 0;
    R(0, 0, 16, 16, dark ? '#bb6c58' : '#e6d7b4');
    R(0, 0, 16, 1, dark ? 'rgba(255,230,210,0.10)' : 'rgba(255,250,235,0.22)');
    R(0, 15, 16, 1, 'rgba(90,60,40,0.14)');
    R(15, 0, 1, 16, 'rgba(90,60,40,0.10)');
    if (r > 0.82) R(4, 5, 6, 1, 'rgba(80,50,35,0.13)');
    if (r2 > 0.9) R(9, 10, 2, 2, 'rgba(80,50,35,0.16)');
    return true;
  }

  if (kind === 'c9CounterTop') {
    R(0, 0, 16, 16, '#aab2bc');
    R(0, 0, 16, 3, '#d4dbe4');
    R(0, 3, 16, 1, 'rgba(255,255,255,0.25)');
    R(0, 11, 16, 2, '#8d959f');
    R(0, 13, 16, 3, '#6f767f');
    if (r > 0.6) R(3, 6, 9, 1, 'rgba(255,255,255,0.12)');
    if (tx % 4 === 0) R(0, 0, 1, 16, 'rgba(60,66,74,0.18)');
    return true;
  }

  // c9CounterFront
  R(0, 0, 16, 16, '#7d2b2a');
  R(0, 0, 16, 2, '#5c1d1d');
  R(0, 3, 16, 1, '#e8d6b0');
  R(0, 14, 16, 2, '#4a1616');
  if (tx % 3 === 0) R(7, 5, 2, 8, 'rgba(40,10,10,0.22)');
  if (r > 0.7) R(2, 8, 12, 1, 'rgba(255,220,190,0.05)');
  R(0, 3, 16, 6, 'rgba(0,0,0,0.05)');
  return true;
});

TILE_HOOKS.push(function (c, kind, tx, ty) {
  if (kind !== 'c9Wall' && kind !== 'c9Floor' && kind !== 'c9Basin' &&
      kind !== 'c9SecWall' && kind !== 'c9SecFloor') return false;
  var x = tx * TILE, y = ty * TILE;
  var r = hash(tx, ty, 29), r2 = hash(tx, ty, 61);
  function R(px, py, w, h, col) { c.fillStyle = col; c.fillRect(x + px, y + py, w, h); }

  if (kind === 'c9Wall') {
    if (ty === 0) {
      // the skylight band running down the middle of the concourse
      var glass = tx >= 10 && tx <= 21;
      if (glass) {
        R(0, 0, 16, 16, r > 0.5 ? '#cfe0e8' : '#c6d8e2');
        R(0, 0, 16, 2, '#e8f2f6');
        R(0, 14, 16, 2, '#8fa2ae');
        if (tx % 2 === 0) R(7, 0, 2, 16, '#8fa2ae');
        return true;
      }
      R(0, 0, 16, 16, '#2c2a33');
      R(0, 11, 16, 5, '#232129');
      if (tx % 3 === 0) { R(6, 3, 4, 4, '#3a3744'); R(7, 4, 2, 2, '#ffe9b0'); }
      return true;
    }
    R(0, 0, 16, 16, r > 0.55 ? '#ded3ba' : r > 0.25 ? '#d8cdb4' : '#e3d9c2');
    R(0, 0, 16, 1, 'rgba(255,250,240,0.18)');
    R(0, 15, 16, 1, 'rgba(90,78,60,0.14)');
    if (tx % 4 === 0) R(0, 0, 1, 16, 'rgba(96,84,66,0.16)');
    if (r2 > 0.88) R(5, 9, 4, 1, 'rgba(96,84,66,0.10)');
    if (ty === 2) {
      // skirting, so the wall reads as a wall and not more floor
      R(0, 8, 16, 8, '#9a8a72');
      R(0, 8, 16, 2, '#b0a086');
      R(0, 15, 16, 1, 'rgba(50,42,32,0.38)');
    }
    return true;
  }

  if (kind === 'c9Floor') {
    R(0, 0, 16, 16, r > 0.5 ? '#b0a99a' : r > 0.25 ? '#aca596' : '#b4ad9e');
    // terrazzo chips
    if (r > 0.3) R(3, 4, 2, 1, 'rgba(255,250,240,0.35)');
    if (r2 > 0.4) R(9, 11, 1, 2, 'rgba(120,110,96,0.28)');
    if (r2 > 0.75) R(6, 7, 1, 1, 'rgba(90,80,70,0.30)');
    if (r > 0.85) R(12, 2, 2, 1, 'rgba(140,120,150,0.18)');
    R(0, 15, 16, 1, 'rgba(90,84,72,0.10)');
    return true;
  }

  if (kind === 'c9Basin') {
    R(0, 0, 16, 16, '#8d8f96');
    R(1, 1, 14, 14, '#5f8c98');
    R(2, 2, 12, 3, 'rgba(190,232,240,0.20)');
    if (r > 0.6) R(4, 8, 7, 1, 'rgba(210,240,248,0.16)');
    if (r2 > 0.8) R(9, 12, 4, 1, 'rgba(210,240,248,0.12)');
    return true;
  }

  if (kind === 'c9SecWall') {
    R(0, 0, 16, 16, '#5f665c');
    R(0, 0, 16, 1, 'rgba(20,24,20,0.35)');
    R(0, 7, 16, 1, 'rgba(20,24,20,0.30)');
    R((ty % 2) ? 4 : 11, 0, 1, 7, 'rgba(20,24,20,0.25)');
    R((ty % 2) ? 12 : 3, 8, 1, 8, 'rgba(20,24,20,0.25)');
    if (r > 0.85) R(6, 10, 5, 2, 'rgba(190,200,180,0.07)');
    return true;
  }

  // c9SecFloor
  R(0, 0, 16, 16, r > 0.5 ? '#7d8278' : '#787d73');
  if (r2 > 0.4) R(4, 6, 3, 1, 'rgba(230,236,220,0.12)');
  if (r > 0.7) R(10, 11, 2, 2, 'rgba(30,34,28,0.16)');
  R(0, 15, 16, 1, 'rgba(30,34,28,0.20)');
  if (tx % 5 === 0) R(0, 0, 1, 16, 'rgba(30,34,28,0.14)');
  return true;
});

// --------------------------------------------------------------- overlays

function ch9PaintPretzel(c) {
  var pools = [140, 264, 388];
  for (var i = 0; i < pools.length; i++) {
    var g = c.createRadialGradient(pools[i], 90, 6, pools[i], 90, 118);
    g.addColorStop(0, 'rgba(255,226,168,0.16)');
    g.addColorStop(1, 'rgba(255,226,168,0)');
    c.fillStyle = g;
    c.fillRect(pools[i] - 118, 0, 236, 200);
  }

  // the mat in front of the counter, worn in the middle
  c.fillStyle = '#7a6852';
  c.fillRect(198, 130, 116, 16);
  c.fillStyle = '#8a7760';
  c.fillRect(201, 132, 110, 12);
  c.fillStyle = 'rgba(255,240,215,0.08)';
  c.fillRect(206, 133, 100, 2);

  // the counter's shadow on the tile, so it sits down properly
  var sh = c.createLinearGradient(0, 112, 0, 146);
  sh.addColorStop(0, 'rgba(40,20,12,0.34)');
  sh.addColorStop(1, 'rgba(40,20,12,0)');
  c.fillStyle = sh;
  c.fillRect(80, 112, 352, 34);

  var vg = c.createRadialGradient(W / 2, 150, 90, W / 2, 150, 300);
  vg.addColorStop(0, 'rgba(24,14,8,0)');
  vg.addColorStop(1, 'rgba(24,14,8,0.42)');
  c.fillStyle = vg;
  c.fillRect(0, 0, W, H);
}

function ch9PaintMall(c) {
  // the skylight wash down the middle of the concourse
  var sky = c.createLinearGradient(0, 0, 0, 190);
  sky.addColorStop(0, 'rgba(226,240,248,0.20)');
  sky.addColorStop(1, 'rgba(226,240,248,0)');
  c.fillStyle = sky;
  c.fillRect(120, 0, 280, 210);

  // the wall sits down on the floor
  var ws = c.createLinearGradient(0, 48, 0, 78);
  ws.addColorStop(0, 'rgba(44,36,26,0.30)');
  ws.addColorStop(1, 'rgba(44,36,26,0)');
  c.fillStyle = ws;
  c.fillRect(0, 48, W, 30);

  // the inlay ring around the fountain
  var cx = 256, cy = 152, r = 92;
  c.save();
  c.globalAlpha = 0.4;
  c.strokeStyle = '#8d7f66';
  c.lineWidth = 2;
  c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1;
  c.beginPath(); c.arc(cx, cy, r - 6, 0, Math.PI * 2); c.stroke();
  c.globalAlpha = 0.22;
  for (var k = 0; k < 24; k++) {
    var a = (k / 24) * Math.PI * 2;
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * (r - 18), cy + Math.sin(a) * (r - 18));
    c.lineTo(cx + Math.cos(a) * (r - 8), cy + Math.sin(a) * (r - 8));
    c.stroke();
  }
  c.restore();

  // warm shopfront light along the top wall
  var top = c.createLinearGradient(0, 40, 0, 110);
  top.addColorStop(0, 'rgba(240,200,255,0.12)');
  top.addColorStop(1, 'rgba(240,200,255,0)');
  c.fillStyle = top;
  c.fillRect(300, 40, 180, 80);

  var vg = c.createRadialGradient(W / 2, 150, 96, W / 2, 150, 320);
  vg.addColorStop(0, 'rgba(20,16,24,0)');
  vg.addColorStop(1, 'rgba(20,16,24,0.46)');
  c.fillStyle = vg;
  c.fillRect(0, 0, W, H);
}

function ch9PaintSec(c) {
  c.fillStyle = 'rgba(8,12,10,0.34)';
  c.fillRect(0, 0, W, H);

  // monitor glow on the back wall
  var g = c.createRadialGradient(W / 2, 54, 8, W / 2, 54, 120);
  g.addColorStop(0, 'rgba(120,220,220,0.22)');
  g.addColorStop(1, 'rgba(120,220,220,0)');
  c.fillStyle = g;
  c.fillRect(W / 2 - 130, 0, 260, 150);

  // the desk lamp pool
  var l = c.createRadialGradient(196, 172, 10, 196, 172, 100);
  l.addColorStop(0, 'rgba(255,226,160,0.20)');
  l.addColorStop(1, 'rgba(255,226,160,0)');
  c.fillStyle = l;
  c.fillRect(80, 80, 230, 180);

  // the room edge, so it reads as a room and not a lit patch of nothing
  c.strokeStyle = 'rgba(12,16,12,0.55)';
  c.lineWidth = 4;
  c.strokeRect(144, 48, 208, 176);
  c.strokeStyle = 'rgba(150,170,150,0.10)';
  c.lineWidth = 1;
  c.strokeRect(146, 50, 204, 172);

  var vg = c.createRadialGradient(W / 2, 150, 70, W / 2, 150, 250);
  vg.addColorStop(0, 'rgba(4,6,4,0)');
  vg.addColorStop(1, 'rgba(4,6,4,0.52)');
  c.fillStyle = vg;
  c.fillRect(0, 0, W, H);
}

// ------------------------------------------------------------------ props

var CH9_PROP = {
  c9_menuboard: 1, c9_warm: 1, c9_reg: 1, c9_visorcase: 1, c9_table: 1,
  c9_mop: 1, c9_hire: 1, c9_secdoor: 1, c9_hottopic: 1, c9_socks: 1,
  c9_fountain: 1, c9_candle: 1, c9_candleDown: 1, c9_bench: 1,
  c9_planter: 1, c9_bin: 1, c9_map: 1, c9_monitors: 1, c9_desk: 1,
  c9_pa: 1, c9_chair: 1, c9_fan: 1, c9_kettle: 1, c9_doorin: 1, c9_lamp: 1
};

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (!CH9_PROP[k]) return false;
  var P = propPainter(c, e);

  if (k === 'c9_menuboard') {
    P(-34, -36, 68, 34, '#241d18');
    P(-32, -34, 64, 30, '#15100d');
    P(-32, -34, 64, 1, 'rgba(255,230,180,0.25)');
    for (var i = 0; i < 4; i++) {
      P(-28, -29 + i * 6, 22, 2, 'rgba(240,220,170,0.62)');
      P(20, -29 + i * 6, 8, 2, '#e8b85a');
    }
    c.save();
    c.textAlign = 'center';
    c.font = 'bold 6px monospace';
    c.fillStyle = '#f2d79a';
    c.fillText("WETZEL'S", e.px, e.py - 25);
    c.restore();
    P(-40, -38, 80, 2, '#3a2c22');
    return true;
  }

  if (k === 'c9_warm') {
    P(-16, -2, 32, 2, 'rgba(0,0,0,0.18)');
    P(-15, -26, 30, 24, '#8d939c');
    P(-15, -26, 30, 2, '#b6bcc6');
    P(-13, -23, 26, 16, 'rgba(90,120,140,0.55)');
    P(-13, -23, 26, 2, 'rgba(255,200,140,0.28)');
    function pretzel(px2, py2) {
      P(px2, py2, 6, 4, '#a8642c');
      P(px2 + 1, py2 + 1, 2, 2, 'rgba(90,120,140,0.55)');
      P(px2, py2, 2, 1, '#c8843e');
    }
    pretzel(-10, -21); pretzel(-2, -20); pretzel(5, -21);
    pretzel(-9, -15); pretzel(-1, -14);
    P(-8, -28, 16, 3, '#e07a2a');
    P(-10, -31, 20, 3, '#6f757f');
    return true;
  }

  if (k === 'c9_reg') {
    P(-12, -2, 24, 2, 'rgba(0,0,0,0.18)');
    P(-11, -12, 22, 10, '#3a3f48');
    P(-11, -12, 22, 2, '#555b66');
    P(-9, -24, 16, 12, '#22262c');
    P(-8, -23, 14, 9, '#2c4a44');
    P(-7, -22, 12, 3, 'rgba(150,230,200,0.35)');
    P(-4, -16, 8, 1, 'rgba(150,230,200,0.45)');
    P(-11, -29, 2, 5, '#cfd4dc');
    P(8, -18, 4, 4, '#8a2a2a');
    return true;
  }

  if (k === 'c9_visorcase') {
    // a stack of spare visors, all of them too large for a beaver
    P(-10, -2, 20, 2, 'rgba(0,0,0,0.16)');
    P(-9, -10, 18, 8, '#d8d2c4');
    P(-9, -10, 18, 1, '#efe9dc');
    P(-9, -16, 18, 5, '#e6e0d2');
    P(-4, -15, 8, 2, '#2f3a52');
    P(-9, -22, 18, 5, '#efe9dc');
    P(-4, -21, 8, 2, '#2f3a52');
    return true;
  }

  if (k === 'c9_table') {
    // a round table seen from above, two stools, one abandoned tray
    P(-5, -3, 26, 3, 'rgba(0,0,0,0.16)');
    P(-4, -17, 26, 13, '#6a4c34');
    P(-3, -16, 24, 11, '#8a6a4a');
    P(-3, -16, 24, 2, '#a5805a');
    P(-1, -13, 20, 6, '#946f4c');
    P(-3, -5, 24, 1, '#5f422e');
    P(-8, -13, 7, 4, '#7a5c40');
    P(-8, -9, 2, 6, '#5a3f2c');
    P(24, -13, 7, 4, '#7a5c40');
    P(29, -9, 2, 6, '#5a3f2c');
    // the tray, and one napkin that has given up
    P(4, -15, 15, 4, '#b04a3a');
    P(5, -14, 5, 2, '#e8c87a');
    P(12, -14, 5, 1, '#efe9dc');
    return true;
  }

  if (k === 'c9_mop') {
    P(-6, -2, 12, 2, 'rgba(0,0,0,0.18)');
    P(-6, -12, 12, 10, '#d8a83a');
    P(-6, -12, 12, 2, '#e8bc4e');
    P(-2, -30, 3, 19, '#8a6a3a');
    P(-6, -32, 10, 3, '#c8c4b4');
    return true;
  }

  if (k === 'c9_hire') {
    P(-7, -2, 14, 2, 'rgba(0,0,0,0.18)');
    P(-8, -18, 16, 16, '#e8e0cc');
    P(-6, -16, 12, 12, '#f6f0e0');
    c.save();
    c.textAlign = 'center';
    c.font = '5px monospace';
    c.fillStyle = '#8a2a2a';
    c.fillText('HIRING', e.px, e.py - 9);
    c.font = '4px monospace';
    c.fillStyle = '#5a5348';
    c.fillText('ASK 4 BUCK', e.px, e.py - 4);
    c.restore();
    P(-8, -2, 2, 2, '#8a6a4a');
    P(6, -2, 2, 2, '#8a6a4a');
    return true;
  }

  if (k === 'c9_secdoor') {
    // steel door set into the wall, with a keypad and a bad light
    P(-8, -40, 32, 40, '#31343a');
    P(-6, -38, 28, 36, '#4a4f57');
    P(-6, -38, 28, 2, '#656b74');
    P(6, -36, 2, 32, '#3a3f46');
    P(-4, -34, 9, 12, '#5a606a');
    P(-3, -33, 7, 10, 'rgba(120,180,190,0.16)');
    P(11, -30, 7, 10, '#2b2f35');
    P(12, -29, 5, 3, '#7fe0c0');
    P(12, -25, 5, 1, '#8a9099');
    P(12, -22, 5, 1, '#8a9099');
    P(1, -14, 3, 3, '#8a9099');
    c.save();
    c.textAlign = 'center';
    c.font = '4px monospace';
    c.fillStyle = '#d8e4e8';
    c.fillText('SECURITY', e.px, e.py - 30);
    c.restore();
    P(-8, -42, 32, 3, '#22262b');
    P(2, -46, 4, 4, CH9.broken || CH9.frenzy < 40 ? '#5ac8a0' : '#e0553f');
    return true;
  }

  if (k === 'c9_hottopic') {
    // the storefront, all neon and bad decisions
    P(-8, -36, 64, 36, '#241a2e');
    P(-6, -34, 60, 32, '#120e1a');
    P(-6, -34, 60, 3, '#3a2a4a');
    P(-4, -30, 24, 26, 'rgba(120,60,180,0.14)');
    P(30, -30, 26, 26, 'rgba(120,60,180,0.10)');
    // two mannequins in the window, in neon
    P(2, -24, 8, 14, '#1e1828');
    P(3, -30, 6, 7, '#2a2236');
    P(3, -29, 6, 2, '#e85ac8');
    P(4, -18, 3, 3, '#1b1a24');
    P(36, -22, 8, 12, '#1e1828');
    P(37, -28, 6, 7, '#2a2236');
    P(37, -27, 6, 2, '#3ad8c8');
    P(38, -16, 3, 3, '#1b1a24');
    // the sign
    P(-4, -50, 56, 13, '#1a1222');
    P(-3, -49, 54, 11, '#2a1640');
    c.save();
    c.textAlign = 'center';
    c.font = 'bold 7px monospace';
    c.fillStyle = 'rgba(255,120,220,0.30)';
    c.fillText('HOT TOPIC', e.px + 24, e.py - 41);
    c.fillStyle = '#ff8ae0';
    c.fillText('HOT TOPIC', e.px + 23, e.py - 42);
    c.restore();
    P(-8, -38, 64, 2, '#3a2a4a');
    return true;
  }

  if (k === 'c9_socks') {
    // the novelty sock kiosk, three wheels and a canopy
    P(-8, -3, 48, 3, 'rgba(0,0,0,0.20)');
    P(-6, -26, 44, 23, '#5a4a3a');
    P(-6, -26, 44, 2, '#7a6852');
    P(-4, -24, 40, 16, '#3f3428');
    var cols = ['#e8607a', '#68c8e8', '#f0c060', '#9be08a', '#c89af0'];
    for (var s = 0; s < 5; s++) {
      P(-4 + s * 8, -23, 6, 9, cols[s]);
      P(-4 + s * 8, -14, 6, 2, 'rgba(255,255,255,0.15)');
    }
    P(-8, -31, 48, 6, '#b04a5a');
    P(-8, -31, 48, 2, '#c85c6c');
    P(-2, -4, 4, 2, '#2a2620');
    P(16, -4, 4, 2, '#2a2620');
    P(34, -4, 4, 2, '#2a2620');
    c.save();
    c.textAlign = 'center';
    c.font = 'bold 5px monospace';
    c.fillStyle = '#f6e6c8';
    c.fillText('SOCKS  $4', e.px + 16, e.py - 27);
    c.restore();
    return true;
  }

  if (k === 'c9_fountain') {
    // four tiles wide, three tiles of basin under it
    P(-8, -8, 64, 8, 'rgba(0,0,0,0.20)');
    // basin rim
    P(-8, -28, 64, 22, '#8d9098');
    P(-8, -28, 64, 4, '#b9bcc4');
    P(-8, -10, 64, 4, '#6f737b');
    P(-4, -24, 56, 12, '#4f7f8c');
    P(-4, -24, 56, 3, 'rgba(190,236,244,0.22)');
    P(0, -20, 20, 1, 'rgba(210,242,250,0.20)');
    P(4, -16, 28, 1, 'rgba(210,242,250,0.14)');
    // the pedestal and the top bowl
    P(18, -42, 12, 16, '#9a9da5');
    P(18, -42, 12, 2, '#c2c6ce');
    P(12, -48, 24, 7, '#b9bcc4');
    P(13, -47, 22, 3, '#5f8c98');
    P(22, -58, 2, 11, '#cfe8f0');
    P(19, -58, 8, 2, '#e8f6fa');
    // coins in the water, because everyone wishes here
    P(2, -19, 2, 1, '#c8a44a');
    P(34, -17, 2, 1, '#c8a44a');
    P(24, -21, 2, 1, '#e0bc62');
    return true;
  }

  if (k === 'c9_candle') {
    // a round display of scented candles
    P(-10, -2, 20, 2, 'rgba(0,0,0,0.20)');
    P(-9, -14, 18, 12, '#6a4a3a');
    P(-9, -14, 18, 2, '#8a6648');
    var jars = [-7, -2, 3];
    for (var j = 0; j < 3; j++) {
      P(jars[j], -21, 4, 7, '#e8e0c8');
      P(jars[j], -21, 4, 1, '#f6f0dc');
      P(jars[j] + 1, -24, 2, 3, '#f0c060');
      P(jars[j] + 1, -25, 2, 1, '#fff0a8');
    }
    P(-4, -27, 12, 3, '#c8b8a0');
    return true;
  }

  if (k === 'c9_candleDown') {
    P(-11, -2, 22, 2, 'rgba(0,0,0,0.20)');
    P(-11, -8, 22, 6, '#6a4a3a');
    P(-11, -8, 22, 2, '#7d5946');
    P(-6, -6, 12, 2, '#5a3f30');
    P(-9, -5, 3, 1, '#e8e0c8');
    P(2, -5, 3, 1, '#e8e0c8');
    P(-13, -4, 3, 1, '#e8e0c8');
    P(8, -6, 2, 2, '#f0c060');
    P(-2, -10, 1, 4, 'rgba(200,200,200,0.25)');
    P(5, -13, 1, 5, 'rgba(200,200,200,0.18)');
    return true;
  }

  if (k === 'c9_bench') {
    P(-8, -3, 32, 3, 'rgba(0,0,0,0.18)');
    P(-8, -14, 32, 4, '#8a6a4a');
    P(-8, -14, 32, 1, '#a5805a');
    P(-8, -20, 32, 4, '#7a5c40');
    P(-8, -20, 32, 1, '#96754e');
    P(-6, -10, 3, 8, '#3a3a40');
    P(27, -10, 3, 8, '#3a3a40');
    return true;
  }

  if (k === 'c9_planter') {
    P(-9, -3, 18, 3, 'rgba(0,0,0,0.18)');
    P(-8, -14, 16, 11, '#8a6a4a');
    P(-8, -14, 16, 2, '#a5805a');
    P(-7, -12, 14, 2, '#4a3a28');
    P(-10, -30, 20, 16, '#2f5a34');
    P(-6, -36, 12, 8, '#3a7040');
    P(-13, -26, 8, 6, '#356338');
    P(7, -27, 8, 7, '#356338');
    P(-2, -33, 2, 6, '#4a8a4a');
    return true;
  }

  if (k === 'c9_bin') {
    P(-7, -2, 14, 2, 'rgba(0,0,0,0.20)');
    P(-6, -20, 12, 18, '#4a4f58');
    for (var b = 0; b < 4; b++) P(-6, -18 + b * 4, 12, 1, 'rgba(0,0,0,0.20)');
    P(-8, -23, 16, 4, '#5a606a');
    P(-8, -23, 16, 1, '#7a828c');
    P(-4, -25, 8, 2, '#3a3f46');
    return true;
  }

  if (k === 'c9_map') {
    P(-11, -30, 22, 30, '#3a3a34');
    P(-9, -28, 18, 22, '#e0d8c0');
    P(-8, -26, 16, 14, '#b8c4b0');
    P(-6, -24, 4, 6, '#d8cba8');
    P(0, -22, 6, 4, '#d8cba8');
    P(-6, -16, 12, 1, '#8a9a86');
    P(-9, -6, 18, 4, '#7a2a2a');
    P(-2, -2, 4, 2, '#2a2a26');
    return true;
  }

  if (k === 'c9_monitors') {
    // nine small screens on the back wall
    P(-30, -46, 60, 34, '#20241f');
    var rows = 3, cols2 = 3, tx0 = -27, ty0 = -43;
    for (var ry = 0; ry < rows; ry++) {
      for (var rx = 0; rx < cols2; rx++) {
        var mx = tx0 + rx * 18, my = ty0 + ry * 11;
        P(mx, my, 16, 9, '#0e1410');
        var lit = CH9.broken ? '#7fc8a8' : (CH9.frenzy > 55 ? '#e07a8a' : '#5a9aa8');
        P(mx + 1, my + 1, 14, 7, 'rgba(10,20,18,0.9)');
        P(mx + 2, my + 2, 12, 5, lit);
        P(mx + 2, my + 2, 12, 1, 'rgba(255,255,255,0.22)');
        if (!CH9.broken) {
          var jt = Math.sin(G.time * 9 + rx * 2 + ry) * 2;
          P(mx + 4 + jt, my + 4, 6, 1, 'rgba(20,10,10,0.45)');
        } else {
          P(mx + 4, my + 4, 3, 2, 'rgba(20,40,30,0.35)');
          P(mx + 9, my + 5, 3, 1, 'rgba(20,40,30,0.30)');
        }
      }
    }
    P(-32, -48, 64, 3, '#2a2f28');
    P(-32, -13, 64, 2, '#151813');
    c.save();
    c.textAlign = 'center';
    c.font = '4px monospace';
    c.fillStyle = 'rgba(160,200,190,0.65)';
    c.fillText('CAM 1      CAM 2      CAM 3', e.px, e.py - 49);
    c.restore();
    return true;
  }

  if (k === 'c9_desk') {
    // six tiles long: dark laminate, one keyboard, one phone, one mug
    P(-8, -3, 96, 3, 'rgba(0,0,0,0.22)');
    P(-8, -22, 96, 20, '#5a5344');
    P(-8, -22, 96, 4, '#7a7160');
    P(-8, -6, 96, 3, '#3a362d');
    P(2, -26, 22, 5, '#2a2a2e');
    for (var kk = 0; kk < 7; kk++) P(3 + kk * 3, -25, 2, 1, 'rgba(200,210,220,0.42)');
    P(3, -25, 20, 1, 'rgba(200,210,220,0.22)');
    P(48, -29, 9, 8, '#2a2e33');
    P(49, -28, 7, 5, '#3f5a52');
    P(63, -4, 6, 2, '#4a463c');
    P(62, -12, 7, 8, '#efe9d8');
    P(63, -10, 5, 3, '#6a4a2a');
    P(74, -25, 12, 3, '#e2dccc');
    P(76, -23, 8, 1, '#8a8478');
    P(30, -25, 10, 3, '#d2ccba');
    return true;
  }

  if (k === 'c9_pa') {
    // the rack: microphone, three buttons, and one light that means everything
    P(-13, -4, 26, 4, 'rgba(0,0,0,0.24)');
    P(-12, -34, 24, 30, '#3a4048');
    P(-12, -34, 24, 2, '#5c636d');
    P(-10, -31, 20, 10, '#14171c');
    P(-9, -30, 18, 8, CH9.panelOn ? 'rgba(130,240,215,0.30)' : 'rgba(70,95,105,0.28)');
    P(-6, -28, 12, 1, 'rgba(160,245,225,0.65)');
    P(-6, -25, 8, 1, 'rgba(160,245,225,0.40)');
    for (var pb = 0; pb < 3; pb++) {
      P(-9 + pb * 7, -18, 5, 4, CH9.panelOn && CH9.sel === pb ? '#e8c060' : '#5a606a');
      P(-9 + pb * 7, -18, 5, 1, 'rgba(255,255,255,0.20)');
    }
    // microphone on a gooseneck
    P(-1, -44, 2, 11, '#9aa0a8');
    P(-3, -49, 6, 6, '#2a2c31');
    P(-2, -48, 4, 4, '#5a606a');
    c.save();
    c.textAlign = 'center';
    c.font = '4px monospace';
    c.fillStyle = CH9.broken ? '#8ae0b0' : (CH9.frenzy > 55 ? '#ff9aa8' : '#8fe8d8');
    c.fillText(CH9.broken ? 'SPELL BROKEN' : 'ON AIR', e.px, e.py - 36);
    c.restore();
    return true;
  }

  if (k === 'c9_lamp') {
    // a desk lamp, doing all the lighting work in this room
    P(-6, -2, 12, 2, 'rgba(0,0,0,0.22)');
    P(-6, -5, 12, 4, '#3a3f46');
    P(-2, -18, 3, 14, '#5a606a');
    P(-8, -26, 16, 8, '#e8c878');
    P(-6, -24, 12, 5, '#ffe9a8');
    P(-8, -18, 16, 2, '#c8a858');
    c.save();
    c.globalAlpha = 0.16;
    c.fillStyle = '#ffe9a8';
    c.beginPath();
    c.moveTo(e.px - 6, e.py - 20);
    c.lineTo(e.px + 6, e.py - 20);
    c.lineTo(e.px + 26, e.py + 2);
    c.lineTo(e.px - 26, e.py + 2);
    c.closePath();
    c.fill();
    c.restore();
    return true;
  }

  if (k === 'c9_chair') {
    P(-8, -2, 16, 2, 'rgba(0,0,0,0.18)');
    P(-7, -14, 14, 4, '#2f3238');
    P(-7, -24, 14, 10, '#3a3d44');
    P(-6, -23, 12, 8, '#4a4e56');
    P(-2, -14, 4, 6, '#2a2d33');
    P(-8, -8, 16, 2, '#23262b');
    P(-7, -3, 3, 3, '#23262b');
    P(4, -3, 3, 3, '#23262b');
    return true;
  }

  if (k === 'c9_fan') {
    P(-7, -2, 14, 2, 'rgba(0,0,0,0.18)');
    P(-2, -12, 4, 10, '#4a4f58');
    P(-6, -3, 12, 2, '#3a3f46');
    P(-7, -22, 14, 10, '#5a606a');
    P(-6, -21, 12, 8, 'rgba(120,140,150,0.35)');
    P(-1, -17, 2, 2, '#2a2d33');
    var bl = Math.sin(G.time * 22) * 3;
    P(-1 + bl, -20, 1, 6, 'rgba(200,210,220,0.35)');
    return true;
  }

  if (k === 'c9_kettle') {
    P(-6, -2, 12, 2, 'rgba(0,0,0,0.16)');
    P(-5, -10, 10, 8, '#8d939c');
    P(-5, -10, 10, 1, '#b6bcc6');
    P(-6, -12, 12, 3, '#6f757f');
    P(4, -9, 3, 2, '#6f757f');
    P(-3, -14, 6, 2, '#5a606a');
    return true;
  }

  // c9_doorin: the inside of the door, and it is taking a beating
  var shx = CH9.doorShake > 0 ? Math.round(Math.sin(G.time * 46) * 2) : 0;
  P(-16 + shx, -34, 32, 34, '#2c3038');
  P(-14 + shx, -32, 28, 30, '#454b55');
  P(-14 + shx, -32, 28, 2, '#5d646f');
  P(2 + shx, -30, 10, 8, 'rgba(140,190,200,0.16)');
  P(-12 + shx, -14, 24, 2, '#33383f');
  P(-4 + shx, -12, 8, 2, '#8a9099');
  P(-16 + shx, -36, 32, 3, '#1e2228');
  c.save();
  c.textAlign = 'center';
  c.font = '4px monospace';
  c.fillStyle = '#c8d4d8';
  c.fillText('STAFF ONLY', e.px + shx, e.py - 38);
  c.restore();
  return true;
});

// glow sticks, drawn on Mav while the beat owns him
PLAYER_HOOKS.push(function (c) {
  if (G.level !== 'ch9' || CH9.down <= 0) return;
  var x = Math.round(G.px), y = Math.round(G.py);
  var w = Math.sin(G.time * 18) * 6;
  c.fillStyle = '#e86ad0';
  c.fillRect(x - 12, y - 16 + w, 9, 2);
  c.fillStyle = '#68e8d8';
  c.fillRect(x + 4, y - 16 - w, 9, 2);
});

// ---------------------------------------------------------------- mechanic

function ch9Save() {
  G.flags.c9_dose = Math.round(CH9.dose);
  G.flags.c9_frenzy = Math.round(CH9.frenzy);
  G.flags.c9_max = Math.round(CH9.maxDose);
  G.flags.c9_wrong = CH9.wrong;
  G.flags.c9_dances = CH9.dances;
  G.flags.c9_kd1 = CH9.kd[0] ? 1 : 0;
  G.flags.c9_kd2 = CH9.kd[1] ? 1 : 0;
  G.flags.c9_kd3 = CH9.kd[2] ? 1 : 0;
  saveGame();
}

function ch9InitMob() {
  for (var i = 0; i < G.ents.length; i++) {
    var e = G.ents[i];
    if (!e.mob) continue;
    e._ax = e.px;
    e._ay = e.py;
    e._a = i * 2.399;
    e._sp = (i % 2 ? 1 : -1) * (0.42 + (i % 3) * 0.13);
    e._r = 22 + (i % 4) * 7;
    e._aggro = 0;
  }
}

function ch9SyncCandles() {
  for (var i = 0; i < G.ents.length; i++) {
    var e = G.ents[i];
    var ci = e.id === 'c9_c1' ? 0 : e.id === 'c9_c2' ? 1 : e.id === 'c9_c3' ? 2 : -1;
    if (ci < 0) continue;
    e.kind = CH9.kd[ci] ? 'c9_candleDown' : 'c9_candle';
  }
}

function ch9BeginChase() {
  CH9.phase = 'mall';
  CH9.done = false;
  ch9InitMob();
  ch9SyncCandles();
  ch9Save();
}

function ch9MallIntro() {
  if (G.level !== 'ch9' || G.sceneId !== 'c9_mall') return;
  ch9BeginChase();
  CH9.dose = 0;
  CH9.frenzy = 6;
  CH9.maxDose = 0;
  ch9Save();
  say([
    { who: 'narrator', text: 'Before Mav could fully process the gravity of chemically induced retail hysteria, a sound rolled through the concourse: the synchronized clomp-clomp-clomp of heavy platform boots.' },
    { who: 'narrator', text: 'A massive mob of teenagers rounded the corner, all aggressively bright hair, chains, and glow sticks. They had the same glazed look Adrian had. They were raving uncontrollably, and they were heading right for Mav.' },
    { who: 'goth', text: 'Look! There is the one who is not dancing!' },
    { who: 'narrator', text: 'A glow stick sword pointed directly at Mav. "MOW HIM DOWN WITH INTERPRETIVE RAGE!"' },
    { who: 'maverick', text: 'Okay. Okay. Fountain. Candles. Security door. Do not stop moving.' },
    { who: 'narrator', text: '[The pink bar is not health. It is DOSE. The crowd gives it to you and distance takes it away. The red bar is how hard they are going.]' },
    { who: 'narrator', text: '[Get to the security door in the top left corner and press E. Reaching it with any dose below full is fine.]' }
  ]);
}

// where the crowd is, and how much of it is on top of Mav
function ch9CrowdPressure() {
  var near = 0;
  for (var i = 0; i < G.ents.length; i++) {
    var e = G.ents[i];
    if (!e.mob) continue;
    var d = Math.hypot(e.px - G.px, e.py - G.py);
    if (d < 40) near += 1 - d / 40;
  }
  return near;
}

function ch9Dance() {
  if (CH9.down > 0 || CH9.done) return;
  CH9.down = 3.4;
  CH9.dances++;
  CH9.dose = 100;
  CH9.maxDose = 100;
  G.perform = true;
  G.shake = 0.35;
  G.flash = 0.3;
  SFX.blip(880, 0.08);
  setTimeout(function () { SFX.blip(660, 0.08); }, 110);
  setTimeout(function () { SFX.blip(990, 0.08); }, 220);
  FX.burst(G.px, G.py - 12, '#e86ad0', 26, { speed: 80, life: 0.9, lift: 40 });
  FX.burst(G.px, G.py - 12, '#68e8d8', 18, { speed: 65, life: 0.8, lift: 34 });
  FX.pop(G.px, G.py - 30, 'DOSE 100', '#e86ad0');
  toast('the beat has you');
  ch9Save();
}

function ch9DanceOver() {
  CH9.down = 0;
  G.perform = false;
  CH9.dose = 44;
  CH9.invuln = 2.4;
  CH9.frenzy = Math.max(0, CH9.frenzy - 12);
  ch9Save();
  SFX.blip(420, 0.06);
  FX.pop(G.px, G.py - 28, 'SHAKEN OFF', '#9be08a');
  toast('you shake it off');
  say([
    { who: 'narrator', text: 'Mav came back to himself somewhere around the second chorus, holding a glow stick he did not remember accepting.' },
    { who: 'maverick', text: 'I am not buying the pants. I am not buying the pants. I am walking. I am walking normally.' }
  ]);
}

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch9') return;

  // the control room: dose drains, the panel is the only thing that matters
  if (G.sceneId === 'c9_security') {
    if (CH9.down > 0) { CH9.down = 0; G.perform = false; }   // never carry a dance through a door
    if (CH9.dose > 0) CH9.dose = Math.max(0, CH9.dose - dt * 26);
    if (CH9.doorShake > 0) CH9.doorShake = Math.max(0, CH9.doorShake - dt);
    return;
  }

  if (G.sceneId !== 'c9_mall') return;
  if (CH9.phase !== 'mall' || CH9.done) return;
  if (G.pending) return;              // never punish a fade

  if (CH9.doorShake > 0) CH9.doorShake = Math.max(0, CH9.doorShake - dt);

  // the crowd moves whether or not Mav is watching
  var speedBoost = 1 + CH9.frenzy / 90;
  for (var i = 0; i < G.ents.length; i++) {
    var e = G.ents[i];
    if (!e.mob) continue;
    var d = Math.hypot(e.px - G.px, e.py - G.py);
    var aggroR = 46 + CH9.frenzy * 0.8;
    if (CH9.down <= 0 && d < aggroR) e._aggro = 1.2;
    else e._aggro = Math.max(0, (e._aggro || 0) - dt);

    if (e._aggro > 0) {
      var sp = (26 + CH9.frenzy * 0.55) * speedBoost;
      var vx = (G.px - e.px), vy = (G.py - e.py);
      var len = Math.hypot(vx, vy) || 1;
      var nx = e.px + (vx / len) * sp * dt;
      var ny = e.py + (vy / len) * sp * dt;
      if (!solidAt(nx, e.py - 2)) e.px = nx;
      if (!solidAt(e.px, ny - 2)) e.py = ny;
      e.dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : (vy > 0 ? 'down' : 'up');
      e.moving = true;
    } else {
      e._a += e._sp * dt * speedBoost;
      var wx = e._ax + Math.cos(e._a) * e._r;
      var wy = e._ay + Math.sin(e._a) * e._r * 0.55;
      if (!solidAt(wx, wy - 2)) { e.px = wx; e.py = wy; }
      e.moving = false;
      if (Math.abs(Math.sin(e._a)) > 0.5) e.dir = Math.cos(e._a) > 0 ? 'right' : 'left';
      else e.dir = Math.sin(e._a) > 0 ? 'down' : 'up';
    }
    e.px = clamp(e.px, 18, W - 18);
    e.py = clamp(e.py, 58, H - 22);
  }

  if (CH9.down > 0) {
    // control is inverted and the man is not in charge
    CH9.down -= dt;
    var inp = inputDir();
    var dx = -inp.dx, dy = -inp.dy;
    if (dx || dy) {
      G.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      var nx2 = G.px + dx * 58 * dt, ny2 = G.py + dy * 58 * dt;
      if (!blocked(nx2, G.py)) G.px = nx2;
      if (!blocked(G.px, ny2)) G.py = ny2;
      G.px = clamp(G.px, 8, W - 8);
      G.py = clamp(G.py, 40, H - 10);
      G.moving = true;
    } else {
      G.moving = false;
    }
    if (CH9.down <= 0) ch9DanceOver();
    return;
  }

  if (CH9.invuln > 0) CH9.invuln = Math.max(0, CH9.invuln - dt);
  CH9.frenzy = Math.max(0, CH9.frenzy - dt * 3.2);

  var near = ch9CrowdPressure();
  if (CH9.invuln <= 0) {
    if (near > 0) {
      CH9.dose = Math.min(100, CH9.dose + dt * (9 + near * 17));
      if (near > 0.45) CH9.frenzy = Math.min(100, CH9.frenzy + dt * 5.5);
    } else {
      CH9.dose = Math.max(0, CH9.dose - dt * 15);
    }
  }
  CH9.maxDose = Math.max(CH9.maxDose, CH9.dose);
  if (CH9.dose >= 100) ch9Dance();
});

// -------------------------------------------------------------- the panel

function ch9OpenPanel() {
  if (CH9.broken) return;
  CH9.panelOn = true;
  CH9.phase = 'security';
  G.perform = true;
  if (CH9.sel < 0 || CH9.sel > 2) CH9.sel = 0;
  toast('up / down to choose, E to play');
}

function ch9ClosePanel() {
  CH9.panelOn = false;
  G.perform = false;
}

function ch9Play(i) {
  if (!CH9.panelOn) return;
  ch9ClosePanel();
  if (i === CH9.right) { ch9BreakSpell(); return; }

  CH9.wrong++;
  CH9.frenzy = Math.min(100, CH9.frenzy + 30);
  CH9.doorShake = 1.8;
  G.shake = 0.55;
  SFX.tone(120, 0.32, 'sawtooth', 0.07);
  ch9Save();

  var lines;
  if (i === 0) {
    lines = [
      { who: 'narrator', text: 'The PA clicked. Smooth jazz poured out of every ceiling speaker in the building.' },
      { who: 'narrator', text: 'On monitor three, the mob slowed to a sway. Then they started to interpret the saxophone, and the saxophone did not want that.' },
      { who: 'narrator', text: 'Something heavy hit the door. The door did not enjoy it. The FRENZY bar went up anyway.' },
      { who: 'maverick', text: 'Not jazz. Jazz is worse. Jazz is so much worse.' }
    ];
  } else {
    lines = [
      { who: 'narrator', text: 'The PA clicked. A wall of distorted bass hit the corridor hard enough to move the dust.' },
      { who: 'narrator', text: 'On every monitor, the mob screamed with joy and got faster. On monitor six, a tray of pretzels went airborne.' },
      { who: 'narrator', text: 'The door bulged inward by an inch, thought about it, and held. Two pairs of platform boots appeared under it.' },
      { who: 'maverick', text: 'Wrong. That was the wrong one. That was an accelerant.' }
    ];
  }
  say(lines, function () {
    if (G.level !== 'ch9' || G.sceneId !== 'c9_security') return;
    if (!CH9.broken) ch9OpenPanel();
  });
}

// --------------------------------------------------------------- scripts

SCRIPT.ch9Buck = function () {
  if (G.flags.c9_spell) {
    say([{ who: 'bucktooth', text: 'I am on my break, Maverick. Enjoy the music. Do not touch the dipping sauce.' }]);
    return;
  }
  if (G.flags.c9_ordered) {
    say([{ who: 'bucktooth', text: 'A large Original with pepperoni. Anarchy in the culinary arts. Your friend has taste.' }]);
    return;
  }
  G.flags.c9_ordered = true;
  saveGame();
  say([
    { who: 'narrator', text: 'Behind the counter, spinning dough with unexpected finesse and wearing a visor far too large for his head, was Professor Balthazar Bucktooth.' },
    { who: 'maverick', text: 'What is the deal, Professor?! Yesterday you were robbing a cheese dealer and getting pardoned by a mob, and today you are selling baked goods?' },
    { who: 'maverick', text: 'Is this a front for a heist? Are you hiding diamonds in the dipping sauce?' },
    { who: 'bucktooth', text: 'In this economy, Maverick, a gentleman must diversify his income streams. Besides, the artisanal cheese market is too volatile.' },
    { who: 'bucktooth', text: 'I am an independent contractor now. Pretzels are the new passion. What can I get for you?' },
    { who: 'narrator', text: '[Adrian is at the table. Talk to him.]' }
  ]);
};

SCRIPT.ch9Adrian = function () {
  if (G.flags.c9_spell) {
    say([{ who: 'adrian', text: 'I feel great. I feel like I could organize a chain wallet.' }]);
    return;
  }
  if (!G.flags.c9_ordered) {
    say([{ who: 'adrian', text: 'Order first, man. I am starving. Wetzel\'s Pretzels.' }]);
    return;
  }
  G.flags.c9_spell = true;
  saveGame();
  say([
    { who: 'adrian', text: 'I will take a large Original. And Professor, can you make it interesting? Put some pepperoni on that.' },
    { who: 'bucktooth', text: 'Absolutely! Anarchy in the culinary arts! I approve!' },
    { who: 'narrator', text: 'He glued pepperoni slices onto a hot pretzel with the care of a man restoring a painting.' },
    { who: 'maverick', text: 'Dude, do not eat that. Seriously, everything this beaver touches either bursts into flames or ends up in a federal investigation.' },
    { who: 'narrator', text: 'Adrian ignored him, took a huge bite, and his eyes went wide.' },
    { who: 'adrian', text: 'Oh, man. That is hitting different.' },
    { who: 'narrator', text: 'He dropped the pretzel. His body stiffened. His eyes glazed over with a sudden, intense purpose.' },
    { who: 'adrian', text: 'Mav. I feel an urgent, overwhelming need to procure cyber goth attire at Hot Topic and commence an interpretive dance sequence using glow sticks.' },
    { who: 'adrian', text: 'My soul demands neon PVC pants.' },
    { who: 'narrator', text: 'Adrian sprinted toward the alternative clothing store.' },
    { who: 'maverick', text: 'Professor! What did you do to my friend?! He has never even worn a belt, and now he wants PVC pants! Did you put something in the pretzel?!' },
    { who: 'bucktooth', text: 'Me? Put an additive in the dough that scientifically induces a brief but intense desire for rave culture and aggressive spending? Ha! Absolutely not!' },
    { who: 'narrator', text: 'He scrubbed the counter with a cloth and produced a guilty, high pitched chuckle.' },
    { who: 'bucktooth', text: 'Fine. A small, highly secret yeast compound. The mall was suffering from low consumer engagement! People need to spend!' },
    { who: 'bucktooth', text: 'My proprietary blend causes a brief, uncontrollable urge to buy neon clothing and dance with glow sticks, thus stimulating the local economy and maximizing my commission!' }
  ], function () {
    G.toScene('c9_mall', 16, 16, 'up');
    setTimeout(ch9MallIntro, 1000);
  });
};

SCRIPT.ch9Table = function () {
  if (G.flags.c9_spell) {
    say([{ who: 'narrator', text: 'Two pretzel crumbs and a napkin. The napkin has been folded into a small, judgemental hat.' }]);
    return;
  }
  say([{ who: 'narrator', text: 'A tray, a napkin, and a laminated card that says THANK YOU FOR NOT RAVING IN THE SEATING AREA.' }]);
};

SCRIPT.ch9Hire = function () {
  say([
    { who: 'sign', text: 'NOW HIRING. MUST BE COMFORTABLE WEARING A VISOR THAT DOES NOT FIT.' },
    { who: 'maverick', text: 'That is a very specific requirement.' }
  ]);
};

SCRIPT.ch9Socks = function () {
  say([
    { who: 'narrator', text: 'The kiosk is called SOCK IT TO ME and sells novelty socks at four dollars a pair.' },
    { who: 'narrator', text: 'There is a pair printed with tiny beavers in tiny suits. Mav looks at them for a long moment.' },
    { who: 'maverick', text: 'No. We are not supporting that.' }
  ]);
};

SCRIPT.ch9Candle1 = function () {
  if (CH9.kd[0]) {
    say([{ who: 'narrator', text: 'VANILLA DRIFT is now a floor. The floor smells great.' }]);
    return;
  }
  CH9.kd[0] = 1;
  ch9SyncCandles();
  CH9.frenzy = Math.min(100, CH9.frenzy + 30);
  G.shake = 0.3;
  SFX.tone(200, 0.18, 'triangle', 0.05);
  FX.burst(11 * 16 + 8, 13 * 16 + 14, '#e8dcc0', 16, { speed: 55, life: 0.7, lift: 26 });
  ch9Save();
  say([
    { who: 'narrator', text: 'Mav clipped the corner of a scented candle display. Twenty jars of VANILLA DRIFT went over like a shelf of tiny church bells.' },
    { who: 'narrator', text: 'The mob took it as a beat drop. FRENZY UP.' }
  ]);
};

SCRIPT.ch9Candle2 = function () {
  if (CH9.kd[1]) {
    say([{ who: 'narrator', text: 'AUTUMN HAYRIDE has joined VANILLA DRIFT on the tile.' }]);
    return;
  }
  CH9.kd[1] = 1;
  ch9SyncCandles();
  CH9.frenzy = Math.min(100, CH9.frenzy + 30);
  G.shake = 0.3;
  SFX.tone(180, 0.2, 'triangle', 0.05);
  FX.burst(7 * 16 + 8, 10 * 16 + 14, '#e8dcc0', 16, { speed: 55, life: 0.7, lift: 26 });
  ch9Save();
  say([
    { who: 'narrator', text: 'The display said AUTUMN HAYRIDE. It now says nothing, because it is a floor.' },
    { who: 'narrator', text: 'Somewhere in the crowd, a goth found the rhythm in it. FRENZY UP.' }
  ]);
};

SCRIPT.ch9Candle3 = function () {
  if (CH9.kd[2]) {
    say([{ who: 'narrator', text: 'The last display held one candle labelled MOM. It is under the fountain now.' }]);
    return;
  }
  CH9.kd[2] = 1;
  ch9SyncCandles();
  CH9.frenzy = Math.min(100, CH9.frenzy + 30);
  G.shake = 0.3;
  SFX.tone(160, 0.2, 'triangle', 0.05);
  FX.burst(21 * 16 + 8, 12 * 16 + 14, '#e8dcc0', 16, { speed: 55, life: 0.7, lift: 26 });
  ch9Save();
  say([
    { who: 'narrator', text: 'The third display held exactly one candle, labelled MOM. It rolled under the fountain and stayed there.' },
    { who: 'narrator', text: 'The mob screamed with renewed interpretive purpose. FRENZY UP.' }
  ]);
};

SCRIPT.ch9Door = function () {
  if (CH9.done) {
    say([{ who: 'narrator', text: 'The door is behind him now. So is the whole afternoon.' }]);
    return;
  }
  if (CH9.down > 0) {
    say([{ who: 'narrator', text: 'Mav is still dancing. The door is four feet away and completely unusable.' }]);
    return;
  }
  var hot = CH9.dose > 60;
  say([
    { who: 'narrator', text: hot
      ? 'Mav hit the crash bar with his whole shoulder, fell into the corridor, and dragged the door shut behind him. The window filled with hair.'
      : 'Mav hit the crash bar at a dead run and shouldered his way into the corridor.' },
    { who: 'narrator', text: 'The only sanctuary he knew: the mall security and control room. It smelled like dust and old coffee.' }
  ], function () {
    G.toScene('c9_security', 15, 11, 'up');
    setTimeout(ch9SecIntro, 1000);
  });
};

function ch9SecIntro() {
  if (G.level !== 'ch9' || G.sceneId !== 'c9_security') return;
  CH9.phase = 'security';
  CH9.dose = Math.min(CH9.dose, 100);
  say([
    { who: 'narrator', text: 'Mav burst into the dusty room, grabbed the microphone for the public address system, and scrolled through the digital music library.' },
    { who: 'narrator', text: 'He needed a weapon of sonic destruction. Behind him, the door took another hit.' },
    { who: 'maverick', text: 'Come on, come on. Three tracks. There are three tracks in this entire mall.' }
  ], function () {
    if (G.level !== 'ch9' || G.sceneId !== 'c9_security') return;
    ch9OpenPanel();
    say([{ who: 'narrator', text: '[Up and down choose a track. E plays it. Only one of these has ever stopped a rave.]' }]);
  });
}

SCRIPT.ch9PA = function () {
  if (CH9.broken) {
    say([{ who: 'narrator', text: 'The panel is still warm. The microphone is still on. Somewhere out there, a mall is quietly reorganizing its chain wallets.' }]);
    return;
  }
  if (CH9.panelOn) {
    say([{ who: 'narrator', text: 'The panel is already open and waiting on him.' }]);
    return;
  }
  ch9OpenPanel();
  say([{ who: 'narrator', text: 'The panel hums. Three tracks, one microphone, and a volume knob that somebody has already turned to the far side of reasonable.' }]);
};

// ---------------------------------------------------------------- ending

function ch9BreakSpell() {
  CH9.broken = true;
  CH9.done = true;
  CH9.panelOn = false;
  CH9.frenzy = 0;
  CH9.doorShake = 0;
  G.perform = false;
  G.flags.c9_done = 1;
  ch9Save();
  SFX.tone(392, 0.12, 'square', 0.05);
  setTimeout(function () { SFX.tone(494, 0.12, 'square', 0.05); }, 130);
  setTimeout(function () { SFX.tone(587, 0.16, 'square', 0.05); }, 260);
  G.flash = 0.4;

  say([
    { who: 'narrator', text: 'Mav hit play.' },
    { who: 'narrator', text: 'The tinny, inescapable chords of Billy Ray Cyrus and "Achy Breaky Heart" blared out of every speaker in the shopping centre, including the small ones in the toilets.' },
    { who: 'narrator', text: 'On monitor two, the cyber goth mob stopped dead. They clutched their ears. Their faces contorted in agony. The aggressive rave spell was broken by the sheer emotional terror of bad country music.' },
    { who: 'narrator', text: 'On monitor four, Adrian staggered out of Hot Topic holding a neon harness.' },
    { who: 'adrian', text: 'Ugh. What am I wearing? Why do I smell like sadness and cheap perfume?' },
    { who: 'narrator', text: 'The microphone was still open. The whole mall heard Mav point dramatically at the pretzel stand.' },
    { who: 'maverick', text: 'It was the beaver! He put mind altering chemicals in your pepperoni pretzel!' },
    { who: 'narrator', text: 'On six different cameras, the cyber goths and Adrian looked at the beaver. Then they shrugged.' },
    { who: 'adrian', text: 'Well, it was the best pretzel I have ever had.' },
    { who: 'narrator', text: 'The goths muttered about needing to go home and organize their chain wallets. Nobody seemed to mind the illicit mind control.' },
    { who: 'narrator', text: 'Mav marched back to the stand, ready to unleash a decade of pent up anger at Professor Bucktooth.' },
    { who: 'narrator', text: 'The Professor was already packing up his equipment.' },
    { who: 'bucktooth', text: 'Ah, Mav! A solid effort with the anti rave music! My shift is over! See you later, you little hooligan!' },
    { who: 'narrator', text: 'Before Mav could yell, the Professor hopped into his Mustang, executed three perfect, high speed donuts right in the food court parking lot, and vanished in a puff of tweed and tire smoke.' },
    { who: 'adrian', text: 'Want a pretzel, Mav?' },
    { who: 'narrator', text: 'Mav rolled his eyes and walked back to school, the faint sound of "Achy Breaky Heart" still echoing in his soul.' }
  ], function () {
    var score = ch9Score();
    var label;
    var dose = Math.round(CH9.maxDose);
    if (!CH9.wrong && !CH9.dances && dose < 30) label = 'clean, first track';
    else if (!CH9.wrong) label = 'first track, ' + dose + '% dose';
    else label = CH9.wrong + (CH9.wrong === 1 ? ' wrong track' : ' wrong tracks') + ', ' + dose + '% dose';
    cleared(9, score, label);
  });
}

function ch9Score() {
  var s = 100 - Math.round(CH9.maxDose * 0.5) - CH9.wrong * 14 - CH9.dances * 6;
  return Math.max(20, Math.min(100, s));
}

// ------------------------------------------------------------------- HUD

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch9') return;
  if (typeof RESULT !== 'undefined' && RESULT.active) return;
  if (CH9.phase === 'pretzel') return;
  if (CH9.done) return;

  var bw = 120, bh = 8;

  // DOSE: the health bar, which is also the problem
  var dx0 = 6, dy0 = H - 26;
  c.fillStyle = 'rgba(18,16,28,0.74)';
  c.fillRect(dx0, dy0 - 13, 198, bh + 21);
  c.textAlign = 'left';
  c.font = 'bold 6px monospace';
  c.fillStyle = '#f0e0e8';
  c.fillText('DOSE', dx0 + 6, dy0 - 3);
  c.fillStyle = '#2a2438';
  c.fillRect(dx0 + 40, dy0 - 9, bw, bh);
  var df = Math.max(0, Math.min(1, CH9.dose / 100));
  var hot = CH9.dose > 66;
  c.fillStyle = hot && Math.sin(G.time * 12) > 0 ? '#ff6ab0' : (CH9.dose > 33 ? '#e8609a' : '#c85a90');
  c.fillRect(dx0 + 40, dy0 - 9, bw * df, bh);
  c.fillStyle = 'rgba(255,230,245,0.55)';
  c.fillRect(dx0 + 40, dy0 - 9, bw * df, 1);
  c.font = '6px monospace';
  c.fillStyle = '#f6e4ee';
  c.textAlign = 'right';
  c.fillText(Math.round(CH9.dose) + '%', dx0 + 192, dy0 - 2);

  // FRENZY, filling
  var fx0 = W - 6 - 198;
  c.fillStyle = 'rgba(18,16,28,0.74)';
  c.fillRect(fx0, dy0 - 13, 198, bh + 21);
  c.textAlign = 'left';
  c.fillStyle = '#f0e0e8';
  c.font = 'bold 6px monospace';
  c.fillText('FRENZY', fx0 + 6, dy0 - 3);
  c.fillStyle = '#2a2438';
  c.fillRect(fx0 + 46, dy0 - 9, bw, bh);
  var ff = Math.max(0, Math.min(1, CH9.frenzy / 100));
  c.fillStyle = CH9.frenzy > 60 && Math.sin(G.time * 10) > 0 ? '#ff8a5a' : '#d8452f';
  c.fillRect(fx0 + 46, dy0 - 9, bw * ff, bh);
  c.fillStyle = 'rgba(255,220,200,0.5)';
  c.fillRect(fx0 + 46, dy0 - 9, bw * ff, 1);
  c.textAlign = 'right';
  c.fillText(Math.round(CH9.frenzy) + '%', fx0 + 192, dy0 - 2);
  c.textAlign = 'left';

  // the room goes pink while he is dancing
  if (CH9.down > 0) {
    var a = 0.16 + 0.08 * Math.sin(G.time * 14);
    c.fillStyle = 'rgba(220,60,180,' + Math.max(0, a).toFixed(3) + ')';
    c.fillRect(0, 0, W, H);
    c.textAlign = 'center';
    c.font = 'bold 9px monospace';
    c.fillStyle = 'rgba(255,240,250,0.9)';
    c.fillText('YOU ARE DANCING', W / 2, 40);
    c.font = '6px monospace';
    c.fillStyle = 'rgba(255,240,250,0.7)';
    c.fillText('controls are inverted, this is not a metaphor', W / 2, 50);
    c.textAlign = 'left';
  }

  if (!CH9.panelOn) return;

  // the PA panel
  var pw = 300, ph = 104, px0 = (W - pw) / 2, py0 = 84;
  c.fillStyle = 'rgba(10,14,12,0.92)';
  c.fillRect(px0, py0, pw, ph);
  c.strokeStyle = 'rgba(120,220,200,0.55)';
  c.lineWidth = 1;
  c.strokeRect(px0 + 0.5, py0 + 0.5, pw - 1, ph - 1);
  c.textAlign = 'left';
  c.font = 'bold 7px monospace';
  c.fillStyle = '#7fd8c8';
  c.fillText('MALL PA  /  MUSIC LIBRARY  /  3 TRACKS', px0 + 10, py0 + 14);
  c.font = '5px monospace';
  c.fillStyle = 'rgba(160,200,190,0.6)';
  c.fillText('ONE OF THESE HAS STOPPED A RAVE BEFORE', px0 + 10, py0 + 23);

  for (var i = 0; i < 3; i++) {
    var ry = py0 + 32 + i * 22;
    var sel = i === CH9.sel;
    if (sel) {
      c.fillStyle = 'rgba(120,220,200,0.16)';
      c.fillRect(px0 + 8, ry - 9, pw - 16, 20);
    }
    c.fillStyle = sel ? '#f6fff8' : 'rgba(214,226,216,0.72)';
    c.font = 'bold 7px monospace';
    c.fillText((sel ? '> ' : '  ') + (i + 1) + '. ' + CH9_TRACKS[i].name, px0 + 12, ry);
    c.font = '5px monospace';
    c.fillStyle = sel ? 'rgba(150,240,220,0.8)' : 'rgba(150,170,160,0.5)';
    c.fillText(CH9_TRACKS[i].tag, px0 + 30, ry + 8);
  }

  c.textAlign = 'center';
  c.font = '6px monospace';
  c.fillStyle = 'rgba(240,192,96,0.9)';
  c.fillText('UP / DOWN TO CHOOSE   E TO PLAY', W / 2, py0 + ph - 7);
  c.textAlign = 'left';
});

// ------------------------------------------------------------ panel input

KEY_HOOKS.push(function (k) {
  if (G.level !== 'ch9' || G.sceneId !== 'c9_security') return false;
  if (!CH9.panelOn) return false;
  if (DLG.active) return false;
  if (typeof RESULT !== 'undefined' && RESULT.active) return false;
  if (k === 'arrowup' || k === 'w') { CH9.sel = (CH9.sel + 2) % 3; SFX.blip(680, 0.04); return true; }
  if (k === 'arrowdown' || k === 's') { CH9.sel = (CH9.sel + 1) % 3; SFX.blip(680, 0.04); return true; }
  if (k === 'e' || k === ' ' || k === 'enter') { ch9Play(CH9.sel); return true; }
  return false;
});

ACTION_HOOKS.push(function () {
  if (G.level !== 'ch9' || G.sceneId !== 'c9_security') return false;
  if (!CH9.panelOn || DLG.active) return false;
  ch9Play(CH9.sel);
  return true;
});

// --------------------------------------------------------------- chapter

CHAPTER_CONTENT[9] = {
  start: 'c9_pretzel',

  intro: function () {
    chapterCard('CHAPTER NINE', 'Mav and the Cyber Goth Confection', 3.4);
    setTimeout(function () {
      if (G.level !== 'ch9') return;
      G.flags.c9_ordered = false;
      G.flags.c9_spell = false;
      G.flags.c9_done = 0;
      G.flags.c9_dose = 0;
      G.flags.c9_frenzy = 0;
      G.flags.c9_max = 0;
      G.flags.c9_wrong = 0;
      G.flags.c9_dances = 0;
      G.flags.c9_kd1 = 0;
      G.flags.c9_kd2 = 0;
      G.flags.c9_kd3 = 0;
      CH9.phase = 'pretzel';
      CH9.dose = 0;
      CH9.frenzy = 0;
      CH9.maxDose = 0;
      CH9.wrong = 0;
      CH9.dances = 0;
      CH9.down = 0;
      CH9.invuln = 0;
      CH9.sel = 0;
      CH9.panelOn = false;
      CH9.broken = false;
      CH9.done = false;
      CH9.doorShake = 0;
      CH9.kd = [0, 0, 0];
      G.perform = false;
      say([
        { who: 'narrator', text: 'The next day, Mav decided he needed a dose of normalcy, and the only known source of normalcy was his friend, Adrian.' },
        { who: 'narrator', text: 'They met at the entrance of the local shopping mall, which smelled like cinnamon, chlorine, and a candle store that had recently overestimated itself.' },
        { who: 'maverick', text: 'Dude, my mom said the beaver who taught me to drive a stick shift is a positive influence.' },
        { who: 'narrator', text: 'They walked past a kiosk selling novelty socks. Adrian, in a perfectly normal hoodie, shrugged.' },
        { who: 'adrian', text: 'Yeah, my dad said the cat he was with has a really good beat. Anyway, I am starving. Wetzel\'s Pretzels?' },
        { who: 'narrator', text: 'Mav\'s mouth instantly watered. A warm, buttery pretzel was exactly what he needed to forget about stolen Gouda and prison rap battles.' },
        { who: 'narrator', text: 'They approached the pretzel stand. Mav stopped dead in his tracks.' },
        { who: 'narrator', text: '[Walk up to the counter and press E.]' }
      ]);
    }, 900);
  },

  resume: function () {
    G.perform = false;
    CH9.panelOn = false;
    CH9.down = 0;
    CH9.invuln = 0;

    if (G.sceneId === 'c9_pretzel') {
      CH9.phase = 'pretzel';
      return;
    }

    if (G.sceneId === 'c9_mall') {
      CH9.phase = 'mall';
      CH9.done = false;
      CH9.dose = G.flags.c9_dose || 0;
      CH9.frenzy = G.flags.c9_frenzy || 0;
      CH9.maxDose = G.flags.c9_max || CH9.dose;
      CH9.wrong = G.flags.c9_wrong || 0;
      CH9.dances = G.flags.c9_dances || 0;
      CH9.kd = [G.flags.c9_kd1 ? 1 : 0, G.flags.c9_kd2 ? 1 : 0, G.flags.c9_kd3 ? 1 : 0];
      CH9.broken = false;
      ch9InitMob();
      ch9SyncCandles();
      // never strand a reload at full dose, and give him a moment to run
      if (CH9.dose >= 96) CH9.dose = 40;
      CH9.invuln = 3.0;
      setTimeout(function () {
        if (G.level !== 'ch9' || G.sceneId !== 'c9_mall') return;
        toast('the crowd is still out there');
      }, 800);
      return;
    }

    if (G.sceneId === 'c9_security') {
      CH9.phase = 'security';
      CH9.dose = Math.min(CH9.dose, 30);
      CH9.wrong = G.flags.c9_wrong || 0;
      CH9.maxDose = G.flags.c9_max || 0;
      CH9.dances = G.flags.c9_dances || 0;
      if (G.flags.c9_done) {
        CH9.broken = true;
        CH9.done = true;
        setTimeout(function () {
          if (G.level !== 'ch9' || G.sceneId !== 'c9_security') return;
          ch9BreakSpell();
        }, 700);
        return;
      }
      setTimeout(function () {
        if (G.level !== 'ch9' || G.sceneId !== 'c9_security' || CH9.panelOn) return;
        toast('the door is still taking hits');
      }, 800);
    }
  },

  objective: function () {
    if (G.sceneId === 'c9_pretzel') {
      if (G.flags.c9_spell) return 'objective: get to Hot Topic';
      return G.flags.c9_ordered ? 'objective: talk to Adrian' : 'objective: talk to the beaver behind the counter';
    }
    if (G.sceneId === 'c9_mall') {
      if (CH9.down > 0) return 'objective: stop dancing';
      return 'objective: get to the security door (top left)';
    }
    if (G.sceneId === 'c9_security') {
      if (CH9.done) return '';
      if (CH9.panelOn) return 'objective: pick a track, press E to play it';
      return 'objective: use the PA panel';
    }
    return '';
  }
};
