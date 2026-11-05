// ch48.js - Chapter 48: Mav and the Great Clerical Court Crisis
//
// The porch, the park court, then the sky above Clovis. The mechanic is a
// sixty second one on one at 98 to 98: it is a timing bar, not physics.
// Taffy turns the gravity down, Cheap Whiskey brings a leaf blower, and
// Bucktooth sells you a cheese wedge when Taffy leaves his feet.
//
//   c48_porch   Ritz crackers, canned cheese, a priest at a dead run
//   c48_court   the bet, the clock, the interference
//   c48_end     the puncture, the vision, the catapult, the donuts

NAMES.taffy = 'TAFFY';
NAMES.whiskey = 'CHEAP WHISKEY';
NAMES.father = 'FATHER WHATSHISBUCKET';

// the priest has no sprite sheet yet, so the procedural fallback gets a man in
// black instead of borrowing Mav's blue shirt. A PNG named father.png will win
// over this automatically.
if (!CHARS.father) {
  CHARS.father = {
    skin: '#e8b48c', hair: '#8a8a90', shirt: '#2a2a32',
    pants: '#24242c', shoe: '#15151a', hairStyle: 'flat'
  };
}

var CH48 = {
  active: false,
  phase: 'idle',        // idle | play | aim | block | won | over
  clock: 60,
  aimP: 0,              // monotonic 0..2, folded into aim (a bar can never stick)
  aim: 0,
  speed: 1.05,
  zoneA: 0.60,
  zoneB: 0.76,
  gravT: 0,
  blowT: 0,
  vx: 0, vy: 0,
  blockT: 0,
  shots: 0,
  misses: 0,
  blocks: 0,
  nextDunk: 41,
  events: [],
  fly: null,
  goudaT: 0,
  punctured: false,
  launched: false,
  windAcc: 0,
  priestRun: 0,
  priestWait: 0.8,
  arriveT: 1.5,
  done: false
};

var CH48_HOOP = { x: 446, y: 136 };
var CH48_BOUND = { x0: 54, y0: 84, x1: 466, y1: 244 };

function ch48Ent(id) {
  for (var i = 0; i < G.ents.length; i++) if (G.ents[i].id === id) return G.ents[i];
  return null;
}

function ch48ClockText() {
  var s = Math.max(0, Math.ceil(CH48.clock));
  if (G.flags.c48_score !== undefined && !CH48.active) s = 0;
  var m = Math.floor(s / 60), r = s % 60;
  return m + ':' + (r < 10 ? '0' + r : r);
}

// ------------------------------------------------------------------- porch

SCENES.c48_porch = {
  title: 'THE PORCH, WITH CRACKERS',
  spawn: { tx: 12, ty: 11, dir: 'up' },
  camZoom: 1,
  fill: 'grass',
  rects: [
    { x: 0, y: 15, w: 32, h: 3, t: 'house' },
    { x: 2, y: 10, w: 24, h: 5, t: 'c48Porch' },
    { x: 12, y: 9, w: 3, h: 1, t: 'c48Walk' },
    { x: 0, y: 7, w: 32, h: 1, t: 'c48Walk' },
    { x: 0, y: 3, w: 32, h: 4, t: 'c48Street' },
    { x: 0, y: 2, w: 32, h: 1, t: 'c48Walk' },
    { x: 1, y: 0, w: 8, h: 2, t: 'house' },
    { x: 1, y: 0, w: 8, h: 1, t: 'roof' },
    { x: 9, y: 0, w: 22, h: 2, t: 'hedge' },
    { x: 0, y: 0, w: 1, h: 3, t: 'hedge' },
    { x: 31, y: 0, w: 1, h: 3, t: 'hedge' }
  ],
  solidKinds: ['house', 'roof', 'hedge'],
  entities: [
    { id: 'c48_snacks', who: null, tx: 9, ty: 11, kind: 'c48Snacks', noSolid: true, propScale: 1, reach: 40, talk: 'ch48Snacks' },
    { id: 'c48_buck_porch', who: 'bucktooth', tx: 13, ty: 11, dir: 'left', reach: 60, talk: 'ch48Porch' },
    { id: 'c48_taffy_porch', who: 'taffy', tx: 18, ty: 7, dir: 'down', reach: 78, talk: 'ch48Taffy' },
    { id: 'c48_whiskey_porch', who: 'whiskey', tx: 21, ty: 7, dir: 'down', reach: 64, talk: 'ch48Whiskey' },
    { id: 'c48_suv', who: null, tx: 25, ty: 5, kind: 'c48Suv', solid: true, sw: 5, sh: 2, propScale: 1 },
    { id: 'c48_rectory', who: null, tx: 5, ty: 2, kind: 'c48Rectory', noSolid: true, propScale: 1 },
    { id: 'c48_porchdoor', who: null, tx: 15, ty: 17, kind: 'c48PorchDoor', noSolid: true, propScale: 1 },
    { id: 'c48_priest', who: 'father', tx: 5, ty: 2, dir: 'right' }
  ],
  overlay: function (c) {
    var x;
    // the street: crown, double yellow line, patched cracks
    c.fillStyle = 'rgba(24,24,28,0.45)';
    c.fillRect(0, 64, W, 2);
    c.fillStyle = 'rgba(214,178,64,0.55)';
    c.fillRect(0, 78, W, 2);
    c.fillRect(0, 88, W, 2);
    for (x = 0; x < W; x += 34) {
      c.fillStyle = 'rgba(60,60,66,0.35)';
      c.fillRect(x, 56, 20, 1);
      c.fillRect(x + 12, 104, 22, 1);
    }
    // sidewalk joints
    for (x = 0; x < W; x += 32) {
      c.fillStyle = 'rgba(90,88,84,0.35)';
      c.fillRect(x, 112, 1, 16);
      c.fillRect(x, 32, 1, 16);
    }
    // the lawn strip and the step up to the porch
    c.fillStyle = 'rgba(40,80,40,0.30)';
    c.fillRect(0, 152, W, 4);
    c.fillStyle = '#8a8177';
    c.fillRect(192, 144, 48, 18);
    c.fillStyle = 'rgba(40,40,44,0.35)';
    c.fillRect(192, 144, 48, 2);
    c.fillRect(192, 154, 48, 2);
    // a few marigolds in the strip, because somebody waters them
    for (x = 24; x < W; x += 47) {
      c.fillStyle = '#3f7a3a';
      c.fillRect(x + 4, 150, 1, 3);
      c.fillStyle = x % 2 ? '#e8b030' : '#e07a50';
      c.fillRect(x + 2, 148, 4, 3);
      c.fillStyle = '#f4d060';
      c.fillRect(x + 3, 149, 2, 1);
    }
    // the front railing, with a gap at the steps
    c.fillStyle = '#6b4a2e';
    c.fillRect(36, 168, 152, 3);
    c.fillRect(244, 168, 164, 3);
    c.fillStyle = '#875c38';
    c.fillRect(36, 167, 152, 1);
    c.fillRect(244, 167, 164, 1);
    for (x = 40; x < 404; x += 32) {
      if (x > 184 && x < 248) continue;
      c.fillStyle = '#5a3f26';
      c.fillRect(x, 160, 4, 12);
      c.fillStyle = '#7a5232';
      c.fillRect(x, 160, 4, 2);
    }
    // the porch roof shadow across the back of the deck
    c.fillStyle = 'rgba(30,20,14,0.28)';
    c.fillRect(30, 224, 390, 16);
    // an afternoon wash from the top left, and a soft shadow under the hedge
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,226,160,0.16)');
    g.addColorStop(0.55, 'rgba(255,210,150,0.05)');
    g.addColorStop(1, 'rgba(40,30,20,0.20)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(20,30,18,0.22)';
    c.fillRect(144, 30, 368, 6);
    // the long shadow of the rectory, thrown across the road
    c.fillStyle = 'rgba(30,30,40,0.16)';
    c.beginPath();
    c.moveTo(16, 32);
    c.lineTo(140, 32);
    c.lineTo(104, 96);
    c.lineTo(16, 96);
    c.closePath();
    c.fill();
  }
};

// ------------------------------------------------------------------- court

SCENES.c48_court = {
  title: 'THE PARK COURT',
  spawn: { tx: 16, ty: 14, dir: 'up' },
  camZoom: 1,
  fill: 'grass',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'hedge' },
    { x: 0, y: 0, w: 1, h: 18, t: 'hedge' },
    { x: 31, y: 0, w: 1, h: 18, t: 'hedge' },
    { x: 0, y: 17, w: 32, h: 1, t: 'hedge' },
    { x: 2, y: 3, w: 28, h: 14, t: 'c48Court' }
  ],
  solidKinds: ['hedge'],
  entities: [
    { id: 'c48_hoop_r', who: null, tx: 28, ty: 14, kind: 'c48Hoop', noSolid: true, propScale: 1 },
    { id: 'c48_hoop_l', who: null, tx: 3, ty: 14, kind: 'c48Hoop', mirror: true, noSolid: true, propScale: 1 },
    { id: 'c48_board', who: null, tx: 16, ty: 4, kind: 'c48Scoreboard', noSolid: true, propScale: 1 },
    { id: 'c48_taffy', who: 'taffy', tx: 25, ty: 8, dir: 'left', reach: 70, talk: 'ch48TaffyCourt' },
    { id: 'c48_whiskey', who: 'whiskey', tx: 6, ty: 5, dir: 'right', reach: 64, talk: 'ch48WhiskeyCourt' },
    { id: 'c48_buck_court', who: 'bucktooth', tx: 6, ty: 15, dir: 'up', reach: 60, talk: 'ch48BuckCourt' },
    { id: 'c48_bench', who: null, tx: 11, ty: 15, kind: 'c48Bench', solid: true, sw: 3, sh: 1, propScale: 1 },
    { id: 'c48_blower', who: null, tx: 8, ty: 5, kind: 'c48Blower', noSolid: true, propScale: 1 },
    { id: 'c48_ball', who: null, tx: 17, ty: 13, kind: 'c48BallProp', noSolid: true, propScale: 1 }
  ],
  overlay: function (c) {
    ch48CourtLines(c);
    // late afternoon coming in low from the left
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,220,150,0.13)');
    g.addColorStop(0.6, 'rgba(255,210,150,0.03)');
    g.addColorStop(1, 'rgba(20,26,30,0.12)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    // chain link behind the top line, faint so it does not fight the board
    c.strokeStyle = 'rgba(200,206,210,0.10)';
    c.lineWidth = 1;
    for (var i = -40; i < W + 40; i += 9) {
      c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 44, 44); c.stroke();
      c.beginPath(); c.moveTo(i, 44); c.lineTo(i + 44, 0); c.stroke();
    }
    c.fillStyle = 'rgba(120,124,130,0.55)';
    for (var p = 12; p < W; p += 96) c.fillRect(p, 0, 3, 50);
    c.fillRect(0, 0, W, 3);
    c.fillRect(0, 46, W, 2);
  }
};

function ch48CourtLines(c) {
  var x0 = 44, y0 = 62, x1 = 470, y1 = 258;
  c.strokeStyle = 'rgba(232,224,198,0.55)';
  c.lineWidth = 2;
  c.strokeRect(x0, y0, x1 - x0, y1 - y0);
  // half court
  c.beginPath();
  c.moveTo((x0 + x1) / 2, y0);
  c.lineTo((x0 + x1) / 2, y1);
  c.stroke();
  c.beginPath();
  c.arc((x0 + x1) / 2, (y0 + y1) / 2, 34, 0, Math.PI * 2);
  c.stroke();
  // the paint, right end
  c.strokeRect(400, 100, x1 - 400, 72);
  c.beginPath();
  c.arc(400, 136, 22, 0, Math.PI * 2);
  c.stroke();
  c.strokeStyle = 'rgba(232,224,198,0.30)';
  c.lineWidth = 1;
  c.beginPath();
  c.arc(CH48_HOOP.x, CH48_HOOP.y, 24, 0, Math.PI * 2);
  c.stroke();
  // scuffs, so the asphalt has a history
  c.fillStyle = 'rgba(24,24,28,0.22)';
  c.fillRect(150, 200, 26, 3);
  c.fillRect(300, 96, 18, 2);
  c.fillRect(214, 132, 30, 2);
  c.fillStyle = 'rgba(232,224,198,0.14)';
  c.fillRect(96, 236, 40, 2);
}

// -------------------------------------------------------------------- end

SCENES.c48_end = {
  title: 'THE COURT, AFTER THE PUNCTURE',
  spawn: { tx: 16, ty: 14, dir: 'up' },
  camZoom: 1,
  fill: 'grass',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'hedge' },
    { x: 0, y: 0, w: 1, h: 18, t: 'hedge' },
    { x: 31, y: 0, w: 1, h: 18, t: 'hedge' },
    { x: 0, y: 17, w: 32, h: 1, t: 'hedge' },
    { x: 2, y: 3, w: 28, h: 14, t: 'c48Court' }
  ],
  solidKinds: ['hedge'],
  entities: [
    { id: 'c48_hoop_r_end', who: null, tx: 28, ty: 14, kind: 'c48Hoop', noSolid: true, propScale: 1 },
    { id: 'c48_hoop_l_end', who: null, tx: 3, ty: 14, kind: 'c48Hoop', mirror: true, noSolid: true, propScale: 1 },
    { id: 'c48_board_end', who: null, tx: 16, ty: 4, kind: 'c48Scoreboard', noSolid: true, propScale: 1 },
    { id: 'c48_priest_end', who: 'father', tx: 19, ty: 13, dir: 'down' },
    { id: 'c48_ball_end', who: null, tx: 18, ty: 13, kind: 'c48FlatBall', noSolid: true, propScale: 1 },
    { id: 'c48_catapult', who: null, tx: 10, ty: 14, kind: 'c48Catapult', noSolid: true, propScale: 1 },
    { id: 'c48_donuts', who: null, tx: 23, ty: 13, kind: 'c48Donuts', noSolid: true, propScale: 1 },
    { id: 'c48_taffy_end', who: 'taffy', tx: 21, ty: 12, dir: 'left', reach: 60, talk: 'ch48TaffyEnd' },
    { id: 'c48_whiskey_end', who: 'whiskey', tx: 25, ty: 15, dir: 'up', reach: 60, talk: 'ch48WhiskeyEnd' },
    { id: 'c48_buck_end', who: 'bucktooth', tx: 14, ty: 13, dir: 'right', reach: 60, talk: 'ch48BuckEnd' },
    { id: 'c48_flying', who: null, tx: 25, ty: 3, kind: 'c48FlyingPriest', noSolid: true, propScale: 1 }
  ],
  overlay: function (c) {
    ch48CourtLines(c);
    // the sun has dropped. long amber light and a lot of blue in the corners
    c.fillStyle = 'rgba(40,24,64,0.26)';
    c.fillRect(0, 0, W, H);
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,180,90,0.24)');
    g.addColorStop(0.45, 'rgba(255,150,90,0.10)');
    g.addColorStop(1, 'rgba(30,20,50,0.24)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    // long shadows for the hoops
    c.fillStyle = 'rgba(18,12,30,0.30)';
    c.beginPath();
    c.moveTo(456, 192);
    c.lineTo(470, 192);
    c.lineTo(392, 258);
    c.lineTo(376, 258);
    c.closePath();
    c.fill();
    var rg = c.createRadialGradient(120, 40, 10, 120, 40, 260);
    rg.addColorStop(0, 'rgba(255,200,120,0.18)');
    rg.addColorStop(1, 'rgba(255,200,120,0)');
    c.fillStyle = rg;
    c.fillRect(0, 0, W, H);
  }
};

// ------------------------------------------------------------------ props

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (k !== 'c48Snacks' && k !== 'c48Suv' && k !== 'c48Rectory' && k !== 'c48Hoop' &&
      k !== 'c48Scoreboard' && k !== 'c48BallProp' && k !== 'c48Bench' && k !== 'c48Blower' &&
      k !== 'c48Catapult' && k !== 'c48Donuts' && k !== 'c48FlatBall' && k !== 'c48FlyingPriest' &&
      k !== 'c48PorchDoor') return false;

  var P = propPainter(c, e);
  var t = G.time;

  if (k === 'c48Snacks') {
    // a low porch table: a plate of Ritz and a can of cheese with a nozzle
    P(-26, -2, 52, 4, 'rgba(0,0,0,0.22)');
    P(-26, -14, 52, 13, '#7a5636');
    P(-24, -12, 48, 10, '#9a7048');
    P(-24, -12, 48, 2, '#b2865a');
    P(-21, -6, 4, 6, '#684728');
    P(17, -6, 4, 6, '#684728');
    // plate
    P(-18, -17, 22, 4, '#e8e4d8');
    P(-16, -18, 18, 5, '#f4f0e6');
    P(-15, -18, 16, 2, '#ffffff');
    // crackers, stacked and one fallen
    P(-14, -21, 6, 4, '#e0b070');
    P(-14, -21, 6, 1, '#f0c88a');
    P(-8, -22, 6, 5, '#e0b070');
    P(-8, -22, 6, 1, '#f0c88a');
    P(-3, -20, 5, 4, '#d8a868');
    P(-19, -16, 5, 3, '#e0b070');
    // the can, nozzle up
    P(4, -24, 9, 13, '#d8d0b8');
    P(4, -24, 9, 3, '#c0453a');
    P(6, -22, 5, 4, '#f0e8d0');
    P(7, -30, 3, 6, '#b8b0a0');
    P(6, -32, 5, 2, '#8a8478');
    P(4, -13, 9, 1, '#9a9484');
    // a napkin that did not survive
    P(-26, -14, 8, 4, '#f0ece0');
    P(-26, -14, 8, 1, '#d8d2c4');
    return true;
  }

  if (k === 'c48Suv') {
    // the gold plated SUV, side on, with a leopard stripe along the door
    P(-48, -5, 96, 6, 'rgba(0,0,0,0.24)');
    P(-44, -36, 88, 32, '#7a5a1c');
    P(-43, -35, 86, 31, '#d8ac50');
    P(-43, -35, 86, 4, '#eecd76');            // roof highlight
    P(-43, -7, 86, 3, '#a87c28');             // rocker shadow
    P(-43, -20, 3, 13, '#b08a34');            // door seams
    P(-12, -20, 2, 13, '#b08a34');
    P(20, -20, 2, 13, '#b08a34');
    // cabin: rear quarter, two side windows, windscreen
    P(-42, -33, 10, 13, '#2a2a34');
    P(-38, -32, 6, 11, '#46536a');
    P(-30, -33, 20, 13, '#2a2a34');
    P(-28, -32, 16, 11, '#46536a');
    P(-8, -33, 18, 13, '#2a2a34');
    P(-6, -32, 14, 11, '#46536a');
    P(12, -33, 14, 13, '#2a2a34');
    P(13, -32, 12, 11, '#4d5b74');
    // the bonnet, stepped down at the front
    P(26, -30, 18, 23, '#e0b45c');
    P(26, -30, 18, 2, '#f2d488');
    P(44, -28, 3, 10, '#c8c8d0');             // grille
    P(41, -26, 4, 4, '#f8f4d8');              // headlight
    P(41, -14, 4, 3, '#d85a3f');              // tail of the grille
    // leopard stripe along the door
    P(-40, -18, 78, 6, '#141418');
    for (var sp = 0; sp < 11; sp++) {
      P(-38 + sp * 7, -18 + (sp % 2), 3, 3, sp % 3 ? '#c8b48a' : '#5a4a2a');
      P(-35 + sp * 7, -16 + (sp % 2), 2, 2, '#3a3026');
    }
    // wheels, gold spokes
    P(-36, -9, 18, 9, '#15151a');
    P(-34, -8, 14, 7, '#2a2a32');
    P(-30, -6, 6, 3, '#d8ac50');
    P(22, -9, 18, 9, '#15151a');
    P(24, -8, 14, 7, '#2a2a32');
    P(28, -6, 6, 3, '#d8ac50');
    // the roof rack, because of course
    P(-34, -42, 30, 3, '#8a8a92');
    P(-34, -42, 30, 1, '#b8b8c0');
    P(-30, -39, 2, 4, '#7a7a84');
    P(-4, -39, 2, 4, '#7a7a84');
    return true;
  }

  if (k === 'c48PorchDoor') {
    // the front door, set into the house wall behind the deck
    P(-19, -50, 38, 50, '#5a3d22');
    P(-17, -48, 34, 46, '#7a5634');
    P(-13, -43, 26, 16, '#8f6a42');
    P(-13, -23, 26, 18, '#8f6a42');
    P(-13, -43, 26, 1, '#a07a4e');
    P(-13, -23, 26, 1, '#a07a4e');
    P(9, -25, 3, 3, '#e0c060');
    P(-19, -3, 38, 3, '#4a3220');
    P(-17, -54, 34, 4, '#6b4a2e');
    return true;
  }

  if (k === 'c48Rectory') {
    // a rectory door and a small white cross above it
    P(-16, -30, 32, 30, '#6d4c2b');
    P(-14, -28, 28, 26, '#8a6a3a');
    P(-11, -25, 22, 10, '#966f3d');
    P(-11, -14, 22, 10, '#966f3d');
    P(8, -16, 3, 3, '#e0c060');
    P(-2, -44, 4, 13, '#f0ece0');
    P(-7, -39, 14, 4, '#f0ece0');
    P(-16, -1, 32, 2, '#5a3f22');
    return true;
  }

  if (k === 'c48Hoop') {
    // mir 1: rim points left (a hoop on the right side of the court)
    var mir = e.mirror ? -1 : 1;
    function Q(x, y, w, h, col) {
      P(mir > 0 ? x : -x - w, y, w, h, col);
    }
    Q(-9, -10, 18, 10, '#45454e');         // base
    Q(-7, -12, 14, 3, '#5c5c66');
    Q(-4, -110, 8, 110, '#5a5a64');        // pole
    Q(-1, -110, 2, 110, '#78787f');
    Q(-30, -146, 60, 38, '#5e5e68');       // backboard frame
    Q(-28, -144, 56, 34, '#e8e4d6');
    Q(-28, -144, 56, 2, '#ffffff');
    Q(-26, -142, 52, 30, '#dcd8c8');
    // the shooter's square, in the same red as the rim
    Q(-11, -134, 22, 2, '#c8501e');
    Q(-11, -118, 22, 2, '#c8501e');
    Q(-11, -134, 2, 18, '#c8501e');
    Q(9, -134, 2, 18, '#c8501e');
    Q(-30, -110, 60, 3, '#4a4a54');        // board underside
    Q(-19, -108, 24, 4, '#c8501e');        // rim
    Q(-19, -108, 24, 1, '#ff7a3a');
    Q(-17, -104, 20, 1, '#8a3410');
    // net
    for (var n = 0; n < 5; n++) {
      Q(-17 + n * 4, -104, 1, 10, 'rgba(240,240,232,0.70)');
      Q(-17 + n * 4, -96, 4, 1, 'rgba(240,240,232,0.45)');
    }
    Q(-18, -94, 22, 1, 'rgba(240,240,232,0.55)');
    return true;
  }

  if (k === 'c48Scoreboard') {
    var home = 98, vis = 98;
    if (G.flags.c48_score !== undefined) { home = 99; }
    P(-58, -40, 116, 40, '#1c1c24');
    P(-56, -38, 112, 36, '#2c2c38');
    P(-56, -38, 112, 1, 'rgba(255,220,150,0.25)');
    // hanging brackets
    P(-30, -46, 4, 8, '#4a4a54');
    P(26, -46, 4, 8, '#4a4a54');
    c.save();
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = 'bold 6px monospace';
    c.fillStyle = 'rgba(232,224,200,0.65)';
    c.fillText('HOME', e.px - 38, e.py - 31);
    c.fillText('VIS', e.px + 38, e.py - 31);
    c.fillText('CLOCK', e.px, e.py - 31);
    c.font = 'bold 13px monospace';
    c.fillStyle = '#f6ecd8';
    c.fillText(String(home), e.px - 38, e.py - 16);
    c.fillText(String(vis), e.px + 38, e.py - 16);
    c.font = 'bold 9px monospace';
    var low = CH48.active && CH48.clock <= 10;
    c.fillStyle = low ? (Math.sin(t * 12) > 0 ? '#ff8f8f' : '#ffd8c8') : '#f0c060';
    c.fillText(ch48ClockText(), e.px, e.py - 15);
    c.restore();
    P(-56, -8, 112, 3, '#14141c');
    return true;
  }

  if (k === 'c48BallProp') {
    if (CH48.active || CH48.phase === 'won') return true;   // Mav has it
    var bob = Math.sin(t * 3) * 1;
    P(-4, -4 + bob, 8, 8, '#c96a26');
    P(-3, -3 + bob, 6, 6, '#e08336');
    P(-3, -1 + bob, 6, 1, '#7a3a12');
    P(-1, -3 + bob, 1, 6, '#7a3a12');
    return true;
  }

  if (k === 'c48Bench') {
    P(-24, -2, 48, 4, 'rgba(0,0,0,0.20)');
    P(-24, -16, 48, 4, '#8a5e3a');
    P(-24, -20, 48, 3, '#9a6c44');
    P(-24, -12, 48, 3, '#8a5e3a');
    P(-21, -8, 3, 8, '#4a4a52');
    P(18, -8, 3, 8, '#4a4a52');
    P(-22, -22, 2, 6, '#5a5a62');
    P(20, -22, 2, 6, '#5a5a62');
    return true;
  }

  if (k === 'c48Blower') {
    // Cheap Whiskey's morale tool
    P(-12, -3, 24, 4, 'rgba(0,0,0,0.20)');
    P(-12, -14, 15, 11, '#b0402e');
    P(-11, -13, 13, 8, '#d0523a');
    P(-10, -18, 6, 5, '#8a8a92');
    P(2, -13, 12, 8, '#6a6a74');
    P(12, -12, 8, 6, '#4a4a52');
    P(14, -11, 6, 4, '#2a2a30');
    P(-12, -12, 2, 7, '#3a3a42');
    P(6, -5, 3, 3, '#8a8a92');
    return true;
  }

  if (k === 'c48Catapult') {
    // a medieval wooden catapult, pulled out of the back of the SUV
    P(-34, -4, 68, 5, 'rgba(0,0,0,0.24)');
    P(-30, -12, 60, 9, '#6a4a2c');
    P(-30, -12, 60, 2, '#8a6238');
    P(-26, -34, 8, 24, '#7d5730');
    P(18, -34, 8, 24, '#7d5730');
    P(-28, -38, 56, 5, '#8a6238');
    P(-24, -2, 10, 5, '#4a3a24');
    P(14, -2, 10, 5, '#4a3a24');
    // the throwing arm, cocked back until it fires
    var a = CH48.launched ? -0.9 : 0.55;
    c.save();
    c.translate(e.px + 4, e.py - 36);
    c.rotate(a);
    c.fillStyle = '#9a6f3e';
    c.fillRect(-4, -74, 8, 78);
    c.fillStyle = '#b8864e';
    c.fillRect(-3, -74, 4, 78);
    c.fillStyle = '#5a3a20';
    c.fillRect(-10, -78, 20, 8);
    c.fillStyle = '#6a4a2c';
    c.fillRect(-12, -74, 24, 4);
    c.restore();
    // leather pad and the tension rope
    P(-14, -96, 24, 6, '#5a3a22');
    P(-12, -95, 20, 4, '#7a4f2e');
    c.strokeStyle = 'rgba(200,180,140,0.55)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(e.px - 26, e.py - 36);
    c.lineTo(e.px + 34, e.py - 20);
    c.stroke();
    P(-32, -18, 4, 8, '#4a3a24');
    P(28, -18, 4, 8, '#4a3a24');
    return true;
  }

  if (k === 'c48Donuts') {
    // the victory donuts, maple glazed, in an open box
    P(-26, -3, 52, 4, 'rgba(0,0,0,0.22)');
    P(-26, -14, 52, 12, '#b8986a');
    P(-24, -13, 48, 10, '#f0e4c8');
    P(-24, -13, 48, 2, '#d8c8a8');
    P(-26, -16, 52, 4, '#a8885c');           // back of the box
    P(-26, -32, 52, 5, '#c8a878');           // open lid, standing up
    P(-24, -30, 48, 3, '#e0c8a0');
    for (var d = 0; d < 4; d++) {
      P(-22 + d * 11, -12, 9, 9, '#8f5418');
      P(-21 + d * 11, -11, 7, 7, '#e0a044');
      P(-20 + d * 11, -11, 5, 2, '#f0bc6a');
      P(-19 + d * 11, -8, 2, 2, '#8a5418');
    }
    P(-26, -16, 2, 8, '#a8885c');
    P(24, -16, 2, 8, '#a8885c');
    return true;
  }

  if (k === 'c48FlatBall') {
    // inflated before the puncture, a sad pancake after
    if (!CH48.punctured) {
      P(-7, -13, 14, 13, '#c96a26');
      P(-6, -12, 12, 11, '#e08336');
      P(-6, -8, 12, 1, '#7a3a12');
      P(-1, -12, 1, 11, '#7a3a12');
      return true;
    }
    P(-22, -8, 44, 8, '#8a4416');
    P(-20, -8, 40, 6, '#b85c1e');
    P(-18, -8, 34, 3, '#cf6a2a');
    P(-20, -3, 40, 1, 'rgba(40,20,8,0.55)');
    P(-20, -8, 40, 1, 'rgba(240,180,120,0.30)');
    P(2, -9, 4, 2, '#3a1a06');
    P(-6, -6, 6, 1, '#7a3a12');
    P(-12, -4, 8, 1, '#7a3a12');
    // a little escaping air
    P(8, -14, 2, 4, 'rgba(230,230,220,0.40)');
    P(12, -20, 2, 4, 'rgba(230,230,220,0.26)');
    P(15, -26, 2, 3, 'rgba(230,230,220,0.14)');
    return true;
  }

  if (k === 'c48FlyingPriest') {
    if (!CH48.launched) return true;
    var fy = e.py + Math.sin(t * 2.2) * 3;
    var fx = e.px + Math.sin(t * 1.1) * 2;
    // motion streaks
    P(-3, 20, 6, 26, 'rgba(240,240,230,0.18)');
    P(-9, 30, 3, 18, 'rgba(240,240,230,0.12)');
    P(6, 28, 3, 16, 'rgba(240,240,230,0.12)');
    c.save();
    c.translate(fx, fy);
    // robe
    c.fillStyle = '#26262e';
    c.fillRect(-6, -8, 12, 16);
    c.fillStyle = '#33333d';
    c.fillRect(-5, -7, 10, 14);
    // collar and face
    c.fillStyle = '#f0ece0';
    c.fillRect(-3, -10, 6, 3);
    c.fillStyle = '#e8b48c';
    c.fillRect(-4, -16, 8, 7);
    c.fillStyle = '#8a8a90';
    c.fillRect(-4, -18, 8, 3);
    // arms out, one pair of giant silver scissors
    c.fillStyle = '#e8b48c';
    c.fillRect(-11, -6, 5, 3);
    c.fillRect(6, -6, 5, 3);
    c.strokeStyle = '#cfd6e0';
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(10, -6); c.lineTo(20, -12); c.stroke();
    c.beginPath(); c.moveTo(10, -4); c.lineTo(20, 2); c.stroke();
    c.restore();
    // a twinkle where the sun catches the blades
    if (Math.sin(t * 6) > 0.6) {
      P(24, -14, 2, 2, '#fff6c0');
      P(27, -10, 1, 1, '#fff6c0');
    }
    return true;
  }

  return false;
});

// ------------------------------------------------------------------- tiles

TILE_HOOKS.push(function (c, kind, tx, ty) {
  var x = tx * TILE, y = ty * TILE, r = hash(tx, ty, 48);
  if (kind === 'c48Street') {
    c.fillStyle = r > 0.5 ? '#3c3c44' : '#393940';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(180,180,190,0.10)';
    for (var i = 0; i < 3; i++) {
      c.fillRect(x + Math.floor(hash(tx, ty, i + 3) * 12), y + Math.floor(hash(tx, ty, i + 13) * 14), 2, 1);
    }
    if (r > 0.86) {
      c.fillStyle = 'rgba(20,20,24,0.45)';
      c.fillRect(x + 2, y + 4, 9, 1);
      c.fillRect(x + 6, y + 5, 1, 5);
    }
    return true;
  }
  if (kind === 'c48Walk') {
    c.fillStyle = r > 0.5 ? '#9d9a90' : '#98958b';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(120,118,110,0.40)';
    c.fillRect(x, y, TILE, 1);
    c.fillRect(x, y, 1, TILE);
    c.fillStyle = 'rgba(220,216,204,0.16)';
    if (r > 0.55) c.fillRect(x + 3, y + 5, 5, 1);
    return true;
  }
  if (kind === 'c48Porch') {
    c.fillStyle = r > 0.5 ? '#8a6440' : '#85603c';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(60,40,22,0.40)';
    c.fillRect(x, y + 7, TILE, 1);
    c.fillRect(x, y + 15, TILE, 1);
    c.fillStyle = 'rgba(196,152,102,0.28)';
    c.fillRect(x + 2, y + 1, 10, 1);
    c.fillRect(x + 6, y + 9, 8, 1);
    c.fillStyle = 'rgba(40,26,14,0.45)';
    c.fillRect(x + 13, y + 4, 1, 2);
    return true;
  }
  if (kind === 'c48Court') {
    c.fillStyle = r > 0.5 ? '#5e5e69' : '#595964';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(28,28,34,0.35)';
    if (r > 0.62) c.fillRect(x, y, TILE, 1);
    if (r < 0.28) c.fillRect(x, y, 1, TILE);
    c.fillStyle = 'rgba(190,190,200,0.10)';
    for (var j = 0; j < 3; j++) {
      c.fillRect(x + Math.floor(hash(tx, ty, j + 41) * 13), y + Math.floor(hash(tx, ty, j + 61) * 13), 2, 1);
    }
    if (r > 0.93) {
      c.fillStyle = 'rgba(30,30,36,0.30)';
      c.fillRect(x + 4, y + 10, 7, 2);
    }
    return true;
  }
  return false;
});

// ----------------------------------------------------------------- scripts

SCRIPT.ch48Snacks = function () {
  say([{ who: 'narrator', text: 'Ritz crackers. Canned cheese. The nozzle has dried into a shape that suggests a previous incident.' }]);
};

SCRIPT.ch48Porch = function () {
  if (G.flags.c48_bet) {
    say([{ who: 'bucktooth', text: 'The bet is made. Go and be structurally sound on the court.' }]);
    return;
  }
  say([
    { who: 'bucktooth', text: 'Look at him go. Every seven minutes, exactly. I have timed it. Do not ask me what a minute is.' },
    { who: 'maverick', text: 'He has got the shears again.' },
    { who: 'bucktooth', text: 'A man running at that velocity with cutlery is not gardening, Maverick. That is a delivery system.' },
    { who: 'narrator', text: '[Talk to Taffy at the gold SUV. He has a theory about the hedge and a bet in his pocket.]' }
  ]);
};

SCRIPT.ch48Whiskey = function () {
  if (G.flags.c48_bet) {
    say([{ who: 'whiskey', text: 'I am warming up the leaf blower. It is a morale tool. The morale is mine.' }]);
    return;
  }
  say([
    { who: 'whiskey', text: 'Benchwarmer number one. I have been on the bench since the bench was invented.' },
    { who: 'whiskey', text: 'Ask Taffy about the hedge. He gets loud about the hedge.' }
  ]);
};

SCRIPT.ch48Taffy = function () {
  if (G.flags.c48_bet) {
    say([{ who: 'taffy', text: 'Clock is running, monkes. Court is four blocks of narrative convenience away.' }], function () {
      G.flags.c48_pending = 'start';
      G.toScene('c48_court', 16, 14, 'up');
    });
    return;
  }
  G.flags.c48_bet = true;
  saveGame();
  say([
    { who: 'taffy', text: 'Yo, monkes. The priest is running with shears because he is trying to cut down my secret signal tower. If he cuts it, my gold spoke bikes lose their narrative Wi-Fi.' },
    { who: 'bucktooth', text: 'Nonsense! He is clearly running because he has discovered a structural flaw in the sidewalk and is trying to dissect the concrete!' },
    { who: 'whiskey', text: 'I bet you everything we own that he is doing it to stop us from playing hoops. If we win a game of basketball, the truth shall set us free!' },
    { who: 'maverick', text: 'You are on! We bet everything! My white cheddar, the Professor\'s beret, your pimp coats, and the gold plated SUV!' },
    { who: 'taffy', text: 'Then get in, monkes. First basket wins. The park court. Try to look expensive.' },
    { who: 'narrator', text: 'They immediately marched down to the local park court. The stakes were impossibly high.' }
  ], function () {
    G.flags.c48_pending = 'start';
    G.toScene('c48_court', 16, 14, 'up');
  });
};

SCRIPT.ch48TaffyCourt = function () {
  if (CH48.active) return;
  say([{ who: 'taffy', text: 'Ninety eight to ninety eight, monkes. The clock is a formality and the formality is mine.' }]);
};

SCRIPT.ch48WhiskeyCourt = function () {
  if (CH48.active) return;
  say([{ who: 'whiskey', text: 'If the ball goes near the sideline I am allowed to use the blower. That is in the rules. I wrote the rules.' }]);
};

SCRIPT.ch48BuckCourt = function () {
  if (CH48.active) return;
  say([{ who: 'bucktooth', text: 'Win this and I will personally audit the structural integrity of the trophy. I will find it lacking. I will award it anyway.' }]);
};

SCRIPT.ch48TaffyEnd = function () {
  say([{ who: 'taffy', text: 'The ball is a pancake, monkes. The bet is off. The donuts are not.' }]);
};

SCRIPT.ch48WhiskeyEnd = function () {
  say([{ who: 'whiskey', text: 'I would like it noted that the leaf blower never got a fair trial.' }]);
};

SCRIPT.ch48BuckEnd = function () {
  say([{ who: 'bucktooth', text: 'Sabotage of a high stakes sporting contract. I have launched a man for less. I have launched a man for exactly this, in fact.' }]);
};

// -------------------------------------------------------------- the game

function ch48StartGame() {
  CH48.active = true;
  CH48.phase = 'play';
  CH48.clock = 60;
  CH48.aimP = 0;
  CH48.aim = 0;
  CH48.speed = 1.05;
  CH48.zoneA = 0.60;
  CH48.zoneB = 0.76;
  CH48.gravT = 0;
  CH48.blowT = 0;
  CH48.vx = 0;
  CH48.vy = 0;
  CH48.blockT = 0;
  CH48.shots = 0;
  CH48.misses = 0;
  CH48.blocks = 0;
  CH48.nextDunk = 41;
  CH48.events = [
    { t: 46, kind: 'grav' },
    { t: 34, kind: 'blower' },
    { t: 24, kind: 'grav' },
    { t: 14, kind: 'blower' }
  ];
  CH48.fly = null;
  CH48.goudaT = 0;
  CH48.windAcc = 0;
  G.perform = true;
  G.px = 264;
  G.py = 232;
  G.dir = 'right';
  G.moving = false;
  G.frame = 0;
  toast('sixty seconds. arrows move, E shoots');
  saveGame();
}

function ch48CourtArrival() {
  say([
    { who: 'narrator', text: 'Maverick and the Professor Bucktooth doll against Taffy Stamburger and Cheap Whiskey. One basket. Sixty seconds. The scoreboard already reads ninety eight to ninety eight and nobody is sure who entered it.' },
    { who: 'taffy', text: 'First basket wins, monkes. Clock says sixty. The clock says whatever I want it to say.' },
    { who: 'whiskey', text: 'I brought a leaf blower. For morale.' },
    { who: 'bucktooth', text: 'Maverick. The fundamentals. Walk. Stop. Shoot. And if the man with the pom poms leaves his feet, I will handle the cheese.' },
    { who: 'narrator', text: '[ARROWS to move. E starts a shot, E again stops the bar in the green. When Taffy goes up for a dunk, SPACE or E blocks him.]' }
  ], ch48StartGame);
}

function ch48Interfere(kind) {
  if (kind === 'grav') {
    CH48.gravT = 3.0;
    CH48.vx = 0;
    CH48.vy = 0;
    SFX.blip(880, 0.08);
    SFX.blip(660, 0.09);
    toast('Taffy snaps: gravity at ten percent');
    FX.pop(G.px, G.py - 42, 'GRAVITY 10%', '#c8a0f0');
    FX.burst(G.px, G.py - 10, '#c8a0f0', 10, { speed: 30, life: 0.7, lift: 40, g: -20 });
    return;
  }
  CH48.blowT = 3.4;
  CH48.vx = Math.min(CH48.vx, 0) - 50;
  SFX.tone(220, 0.25, 'sawtooth', 0.05);
  toast('Cheap Whiskey: leaf blower');
  FX.pop(G.px, G.py - 42, 'LEAF BLOWER', '#a8d8f0');
}

function ch48StartDunk() {
  CH48.phase = 'block';
  CH48.blockT = 1.5;
  SFX.blip(420, 0.09);
  SFX.blip(360, 0.09);
  toast('SPACE! BLOCK HIM!');
}

function ch48Blocked() {
  CH48.phase = 'play';
  CH48.blocks++;
  CH48.clock = Math.min(75, CH48.clock + 4);
  CH48.goudaT = 1.0;
  G.flash = 0.3;
  G.shake = 0.5;
  SFX.blip(760, 0.1);
  SFX.blip(980, 0.12);
  FX.confetti(CH48_HOOP.x, CH48_HOOP.y - 10);
  FX.pop(CH48_HOOP.x - 26, CH48_HOOP.y - 8, 'GOUDA', '#f0d060');
  toast("'Excellent density, Taffy!'");
}

function ch48DunkLanded() {
  CH48.phase = 'play';
  CH48.clock = Math.max(0, CH48.clock - 4);
  G.shake = 0.4;
  SFX.tone(150, 0.16, 'square', 0.05);
  FX.pop(CH48_HOOP.x - 20, CH48_HOOP.y - 4, 'CLANG', '#e8b070');
  toast('the rim rejects him. four seconds of arguing');
}

function ch48StartAim() {
  CH48.phase = 'aim';
  CH48.aimP = 0;
  CH48.aim = 0;
  CH48.zoneA = 0.52 + Math.random() * 0.22;
  CH48.zoneB = Math.min(0.94, CH48.zoneA + 0.20);
  CH48.speed = Math.min(1.3, 0.9 + CH48.shots * 0.04);
  SFX.blip(520, 0.05);
}

function ch48ResolveShot() {
  var hit = CH48.aim >= CH48.zoneA && CH48.aim <= CH48.zoneB;
  CH48.shots++;
  CH48.phase = 'play';
  if (hit) {
    ch48Score();
    return;
  }
  CH48.misses++;
  CH48.clock = Math.max(0, CH48.clock - 5);
  G.shake = 0.3;
  SFX.tone(180, 0.14, 'square', 0.05);
  FX.pop(CH48_HOOP.x - 18, CH48_HOOP.y - 6, 'CLANG', '#e8b070');
  FX.burst(CH48_HOOP.x - 10, CH48_HOOP.y, '#e8b070', 8, { speed: 40, life: 0.4 });
  CH48.fly = { t: 0.5, max: 0.5, x0: G.px, y0: G.py - 30 };
  toast('off the rim. five seconds gone');
}

function ch48Score() {
  CH48.phase = 'won';
  CH48.active = false;
  G.perform = false;
  G.flash = 0.4;
  G.shake = 0.6;
  SFX.fanfare();
  FX.confetti(CH48_HOOP.x, CH48_HOOP.y);
  FX.confetti(G.px, G.py - 14);
  var left = Math.max(0, Math.min(60, CH48.clock));
  var score = Math.max(5, Math.round(left / 60 * 100));
  G.flags.c48_score = score;
  G.flags.c48_left = Math.max(0, Math.ceil(left));
  G.flags.c48_blocks = CH48.blocks;
  saveGame();
  say([
    { who: 'narrator', text: 'Mav planted his feet, let the bar come back around into the green, and shot over a pair of sparkling pom poms.' },
    { who: 'narrator', text: 'Nothing but net. Ninety eight to ninety nine.' },
    { who: 'bucktooth', text: 'THE ARCHITECTURE! LOOK AT THE ARC ON THAT!' },
    { who: 'taffy', text: '...That was not regulation, monkes.' },
    { who: 'maverick', text: 'Somebody write it down. Somebody write all of it down.' },
    { who: 'narrator', text: 'It was at this precise moment that the bushes behind the court began to rustle.' }
  ], function () {
    G.flags.c48_pending = 'end';
    G.toScene('c48_end', 16, 14, 'up');
  });
}

function ch48Expire() {
  CH48.phase = 'over';
  CH48.active = false;
  G.perform = false;
  G.shake = 0.9;
  SFX.tone(110, 0.5, 'square', 0.08);
  SFX.tone(82, 0.6, 'triangle', 0.06);
  say([
    { who: 'narrator', text: 'BUZZER. Ninety eight to ninety eight, and the ball is still in Mav\'s hands.' },
    { who: 'taffy', text: 'The clock is a structural coward, monkes. Run it back.' },
    { who: 'narrator', text: 'Somebody rolled the ball back out. The clock reset itself, the way park clocks do.' }
  ], function () {
    G.flags.c48_restart = true;
    G.toScene('c48_court', 16, 14, 'up');
  });
}

function ch48Move(dt) {
  var inp = inputDir();
  var spd = 76;
  if (CH48.gravT > 0) {
    // low gravity: you accelerate into a drift and coast out of it
    var k = Math.min(1, dt * 6);
    CH48.vx += (inp.dx * 82 - CH48.vx) * k;
    CH48.vy += (inp.dy * 82 - CH48.vy) * k;
  } else {
    CH48.vx = inp.dx * spd;
    CH48.vy = inp.dy * spd;
  }
  var dx = CH48.vx * dt;
  var dy = CH48.vy * dt;
  if (CH48.blowT > 0) {
    dx -= 52 * dt;
    CH48.windAcc += dt;
    if (CH48.windAcc > 0.07) {
      CH48.windAcc = 0;
      FX.burst(G.px + 10, G.py - 12, '#cfe8f0', 3, { speed: 40, life: 0.35, lift: 4, g: 10, angle: 0, spread: 1.4 });
    }
  }
  G.px = clamp(G.px + dx, CH48_BOUND.x0, CH48_BOUND.x1);
  G.py = clamp(G.py + dy, CH48_BOUND.y0, CH48_BOUND.y1);
  if (Math.abs(CH48.vx) > Math.abs(CH48.vy)) {
    if (CH48.vx > 6) G.dir = 'right';
    else if (CH48.vx < -6) G.dir = 'left';
  } else {
    if (CH48.vy > 6) G.dir = 'down';
    else if (CH48.vy < -6) G.dir = 'up';
  }
  G.moving = Math.abs(CH48.vx) + Math.abs(CH48.vy) > 14;
  if (G.moving) {
    G.animT += dt;
    var cols = walkCols('maverick');
    G.frame = cols > 1 ? Math.floor(G.animT * 12) % cols : Math.floor(G.animT * 8) % 2;
  } else {
    G.frame = 0;
  }
}

// ------------------------------------------------------------------ ticks

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch48') return;
  if (G.sceneId === 'c48_porch') ch48PorchTick(dt);
  else if (G.sceneId === 'c48_court') ch48CourtTick(dt);
  else if (G.sceneId === 'c48_end') ch48EndTick(dt);
});

function ch48PorchTick(dt) {
  // the gold SUV arrives once, before the bet, with both of them aboard
  if (!G.flags.c48_arrived) {
    CH48.arriveT -= dt;
    var kk = 1 - Math.max(0, CH48.arriveT) / 1.5;
    var ease = 1 - (1 - kk) * (1 - kk);
    var suv = ch48Ent('c48_suv');
    var tfp = ch48Ent('c48_taffy_porch');
    var wkp = ch48Ent('c48_whiskey_porch');
    if (suv) suv.px = 620 + (392 - 620) * ease;
    if (tfp) { tfp.px = 520 + (296 - 520) * ease; tfp.moving = kk < 0.98; }
    if (wkp) { wkp.px = 560 + (336 - 560) * ease; wkp.moving = kk < 0.98; }
    if (kk > 0.25 && Math.random() < 0.28) {
      FX.burst(360, 84, '#b8a888', 2, { speed: 30, life: 0.4, lift: 10 });
    }
    if (CH48.arriveT <= 0) {
      G.flags.c48_arrived = true;
      if (suv) suv.px = 392;
      if (tfp) { tfp.px = 296; tfp.moving = false; }
      if (wkp) { wkp.px = 336; wkp.moving = false; }
      SFX.tone(140, 0.25, 'sawtooth', 0.06);
      FX.burst(356, 92, '#c8b898', 10, { speed: 50, life: 0.5, lift: 20 });
      toast('the gold SUV has arrived, loudly');
    }
  }

  var p = ch48Ent('c48_priest');
  CH48.priestWait -= dt;
  if (CH48.priestWait <= 0 && CH48.priestRun <= 0) {
    CH48.priestRun = 1.7;
    CH48.priestWait = 7;
    SFX.tone(300, 0.08, 'square', 0.03);
  }
  if (CH48.priestRun > 0) {
    CH48.priestRun -= dt;
    var k = 1 - Math.max(0, CH48.priestRun) / 1.7;
    if (p) {
      p.px = 118 + k * 190;
      p.py = 46;
      p.dir = 'right';
      p.moving = true;
      if (Math.random() < 0.25) {
        FX.burst(p.px - 6, p.py - 2, '#b8a888', 2, { speed: 24, life: 0.35, lift: 6 });
      }
    }
    if (CH48.priestRun <= 0) {
      if (p) p.px = -80;
      if (!G.flags.c48_saw_run) {
        G.flags.c48_saw_run = true;
        toast('there he goes again');
      }
    }
  }
}

function ch48CourtTick(dt) {
  if (G.flags.c48_pending === 'start' && !DLG.active && !G.pending) {
    G.flags.c48_pending = null;
    ch48CourtArrival();
    return;
  }
  if (G.flags.c48_restart && !DLG.active && !G.pending) {
    G.flags.c48_restart = false;
    ch48StartGame();
    return;
  }
  if (!CH48.active) {
    if (CH48.goudaT > 0) CH48.goudaT = Math.max(0, CH48.goudaT - dt);
    return;
  }

  if (CH48.goudaT > 0) CH48.goudaT = Math.max(0, CH48.goudaT - dt);
  if (CH48.fly) {
    CH48.fly.t -= dt;
    if (CH48.fly.t <= 0) CH48.fly = null;
  }
  if (CH48.gravT > 0) CH48.gravT = Math.max(0, CH48.gravT - dt);
  if (CH48.blowT > 0) CH48.blowT = Math.max(0, CH48.blowT - dt);

  CH48.clock -= dt;
  if (CH48.clock <= 0) {
    CH48.clock = 0;
    ch48Expire();
    return;
  }

  while (CH48.events.length && CH48.clock <= CH48.events[0].t) {
    ch48Interfere(CH48.events.shift().kind);
  }

  // Taffy hovers at the rim, and rises for a dunk on schedule
  var tf = ch48Ent('c48_taffy');
  if (tf) {
    var lift = CH48.phase === 'block' ? (1.5 - CH48.blockT) * 44 : 0;
    tf.px = 424;
    tf.py = 132 + Math.sin(G.time * 2.2) * 4 - lift;
    tf.dir = 'left';
  }

  if (CH48.phase === 'block') {
    CH48.blockT -= dt;
    if (CH48.blockT <= 0) ch48DunkLanded();
    G.moving = false;
    return;
  }

  if (CH48.phase === 'aim') {
    CH48.aimP = (CH48.aimP + dt * CH48.speed) % 2;
    CH48.aim = CH48.aimP > 1 ? 2 - CH48.aimP : CH48.aimP;
    G.moving = false;
    G.frame = 0;
    return;
  }

  if (CH48.phase !== 'play') return;

  if (CH48.clock <= CH48.nextDunk) {
    CH48.nextDunk -= 13;
    ch48StartDunk();
    return;
  }

  ch48Move(dt);
}

function ch48EndTick(dt) {
  if (G.flags.c48_pending !== 'end' || DLG.active || G.pending) return;
  G.flags.c48_pending = null;
  ch48Ending();
}

// ----------------------------------------------------------------- input

ACTION_HOOKS.push(function () {
  if (G.level !== 'ch48' || G.sceneId !== 'c48_court' || DLG.active) return false;
  if (!CH48.active) return false;
  if (CH48.phase === 'play') { ch48StartAim(); return true; }
  if (CH48.phase === 'aim') { ch48ResolveShot(); return true; }
  if (CH48.phase === 'block') { ch48Blocked(); return true; }
  return true;
});

// ------------------------------------------------------------------- HUD

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch48' || G.sceneId !== 'c48_court' || !CH48.active) return;
  var s = Math.max(0, Math.ceil(CH48.clock));

  // clock, top right, clear of the objective line and the toast
  c.fillStyle = 'rgba(18,16,28,0.80)';
  c.fillRect(W - 76, 22, 68, 26);
  c.strokeStyle = 'rgba(240,192,96,0.45)';
  c.lineWidth = 1;
  c.strokeRect(W - 75.5, 22.5, 67, 25);
  c.textAlign = 'center';
  c.font = '5px monospace';
  c.fillStyle = 'rgba(240,224,180,0.7)';
  c.fillText('CLOCK', W - 42, 31);
  c.font = 'bold 12px monospace';
  c.fillStyle = s <= 10 ? (Math.sin(G.time * 12) > 0 ? '#ff8f8f' : '#ffd8c8') : '#f6ecd8';
  c.fillText(ch48ClockText(), W - 42, 44);

  // interference banner
  var msg = '';
  if (CH48.gravT > 0) msg = 'GRAVITY 10%';
  else if (CH48.blowT > 0) msg = 'LEAF BLOWER';
  if (msg) {
    c.font = 'bold 7px monospace';
    var w = c.measureText(msg).width + 14;
    c.fillStyle = 'rgba(18,16,28,0.72)';
    c.fillRect(6, 22, w, 14);
    c.fillStyle = CH48.gravT > 0 ? '#c8a0f0' : '#a8d8f0';
    c.textAlign = 'left';
    c.fillText(msg, 13, 32);
  }

  if (CH48.phase === 'aim') {
    var bw = 190, bh = 12, bx = (W - bw) / 2, by = H - 40;
    c.fillStyle = 'rgba(18,16,28,0.88)';
    c.fillRect(bx - 3, by - 3, bw + 6, bh + 6);
    c.fillStyle = '#2a2438';
    c.fillRect(bx, by, bw, bh);
    c.fillStyle = 'rgba(120,200,140,0.75)';
    c.fillRect(bx + CH48.zoneA * bw, by, (CH48.zoneB - CH48.zoneA) * bw, bh);
    c.fillStyle = 'rgba(255,255,255,0.12)';
    c.fillRect(bx, by, bw, 1);
    var nx = bx + CH48.aim * bw;
    c.fillStyle = '#fff3c4';
    c.fillRect(nx - 1.5, by - 5, 3, bh + 10);
    c.strokeStyle = 'rgba(244,228,192,0.55)';
    c.lineWidth = 1;
    c.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
    c.textAlign = 'center';
    c.font = 'bold 7px monospace';
    c.fillStyle = '#f4efe4';
    c.fillText('STOP IT IN THE GREEN', W / 2, by - 8);
  } else if (CH48.phase === 'play') {
    c.textAlign = 'center';
    c.font = '6px monospace';
    c.fillStyle = 'rgba(240,232,204,0.55)';
    c.fillText('E: SHOOT', W / 2, H - 12);
  } else if (CH48.phase === 'block') {
    var pw = 150, px2 = (W - pw) / 2, py2 = H - 62;
    c.fillStyle = 'rgba(18,16,28,0.86)';
    c.fillRect(px2, py2, pw, 34);
    c.strokeStyle = Math.sin(G.time * 16) > 0 ? 'rgba(240,192,96,0.9)' : 'rgba(240,192,96,0.35)';
    c.lineWidth = 2;
    c.strokeRect(px2 + 1, py2 + 1, pw - 2, 32);
    c.textAlign = 'center';
    c.font = 'bold 10px monospace';
    c.fillStyle = '#ffe066';
    c.fillText('BLOCK HIM!', W / 2, py2 + 14);
    c.font = '6px monospace';
    c.fillStyle = '#f4efe4';
    c.fillText('SPACE / E', W / 2, py2 + 26);
    c.fillStyle = 'rgba(240,192,96,0.35)';
    c.fillRect(px2 + 4, py2 + 30, (pw - 8) * Math.max(0, CH48.blockT / 1.5), 2);
  }
  c.textAlign = 'left';
});

// ------------------------------------------------------------- player fx

PLAYER_HOOKS.push(function (c) {
  if (G.level !== 'ch48' || G.sceneId !== 'c48_court' || !CH48.active) return;

  // low gravity: a violet ring under the shoes and a slow drift of dust
  if (CH48.gravT > 0) {
    c.save();
    c.globalAlpha = 0.28 + 0.16 * Math.sin(G.time * 8);
    c.fillStyle = '#c8a0f0';
    c.translate(G.px, G.py + 1);
    c.scale(1, 0.4);
    c.beginPath();
    c.arc(0, 0, 13, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  // the ball in Mav's hands
  if (CH48.phase === 'play' || CH48.phase === 'aim') {
    var bob = Math.sin(G.time * 6) * 1.4;
    c.fillStyle = '#c96a26';
    c.beginPath();
    c.arc(G.px + 9, G.py - 18 + bob, 4, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#e08336';
    c.beginPath();
    c.arc(G.px + 8.5, G.py - 19 + bob, 3, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#7a3a12';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(G.px + 5, G.py - 18 + bob);
    c.lineTo(G.px + 13, G.py - 18 + bob);
    c.stroke();
  }

  // a miss: the ball clangs off the rim and drops out of frame
  if (CH48.fly) {
    var p = 1 - CH48.fly.t / CH48.fly.max;
    var x = CH48.fly.x0 + (CH48_HOOP.x - CH48.fly.x0) * p;
    var y = CH48.fly.y0 + (CH48_HOOP.y - CH48.fly.y0) * p - Math.sin(p * Math.PI) * 44;
    c.fillStyle = '#c96a26';
    c.beginPath();
    c.arc(x, y, 4, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#e08336';
    c.beginPath();
    c.arc(x - 0.5, y - 1, 2.5, 0, Math.PI * 2);
    c.fill();
  }

  // the Gouda wedge, 26 inches of structural density
  if (CH48.goudaT > 0) {
    var a = Math.min(1, CH48.goudaT * 3);
    c.globalAlpha = a;
    var gx = CH48_HOOP.x - 30, gy = CH48_HOOP.y + 6;
    c.fillStyle = '#e8b830';
    c.beginPath();
    c.moveTo(gx, gy);
    c.lineTo(gx + 44, gy - 10);
    c.lineTo(gx + 44, gy + 22);
    c.closePath();
    c.fill();
    c.fillStyle = '#f6d860';
    c.beginPath();
    c.moveTo(gx + 2, gy + 1);
    c.lineTo(gx + 42, gy - 8);
    c.lineTo(gx + 42, gy + 19);
    c.closePath();
    c.fill();
    c.fillStyle = '#c89a20';
    c.beginPath();
    c.arc(gx + 14, gy + 8, 2.4, 0, Math.PI * 2);
    c.arc(gx + 26, gy + 4, 1.8, 0, Math.PI * 2);
    c.arc(gx + 32, gy + 13, 2.2, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;
  }
});

// ------------------------------------------------------------------ ending

function ch48Ending() {
  if (CH48.done) return;
  CH48.done = true;
  SFX.tone(200, 0.2, 'sawtooth', 0.06);
  say([
    { who: 'narrator', text: 'Ninety eight to ninety nine. Taffy was still arguing with the scoreboard.' },
    { who: 'taffy', text: 'It counts, monkes. I am simply saying it should not.' },
    { who: 'narrator', text: 'Then the bushes behind the court began to rustle.' },
    { who: 'narrator', text: 'HIYAAAAAA!' }
  ], ch48Dive);
}

function ch48Dive() {
  CH48.punctured = true;
  G.shake = 0.9;
  G.flash = 0.3;
  SFX.tone(90, 0.3, 'sawtooth', 0.08);
  SFX.splash();
  FX.burst(300, 214, '#d8d0b0', 18, { speed: 70, life: 0.6, lift: 30 });
  FX.pop(300, 190, 'PUNCTURE', '#f0c060');
  toast('HISSSSSSS...');
  var p = ch48Ent('c48_priest_end');
  if (p) { p.px = 300; p.py = 216; p.dir = 'down'; }
  say([
    { who: 'narrator', text: 'Father Whatshisbucket burst onto the court. His robes were flapping, his collar was crooked, and he was wielding a pair of massive silver scissors.' },
    { who: 'narrator', text: 'He dived through the air like an action movie star and landed squarely on the basketball.' },
    { who: 'narrator', text: 'The ball deflated into a sad, rubbery pancake.' },
    { who: 'maverick', text: 'Father! What are you doing?! Everything was on the line! My cheddar!' },
    { who: 'bucktooth', text: 'Why did you destroy the primary projectile?! The pneumatic pressure of that ball was mathematically perfect!' },
    { who: 'narrator', text: 'Father Whatshisbucket stood up, dusted off his robes, and adjusted his glasses.' }
  ], ch48Vision);
}

function ch48Vision() {
  say([
    { who: 'father', text: 'I had to do it, children. I had a vision. A vision of the future.' },
    { who: 'father', text: 'I saw a group of absolute hooligans. Specifically a boy in a mustache, a sentient stuffed beaver, a pimp coated genie, and a kid named after budget alcohol, starting a massive ruckus on this very court.' },
    { who: 'father', text: 'I had to preemptively stop anyone from ever playing basketball again, to preserve the peace of Clovis.' },
    { who: 'whiskey', text: 'But we were already playing!' },
    { who: 'father', text: 'Precisely! And look how peaceful it is now that the ball is flat! My work here is done!' },
    { who: 'narrator', text: 'The group stared at him in stunned, silent disbelief.' }
  ], ch48Laugh);
}

function ch48Laugh() {
  SFX.blip(700, 0.09);
  FX.pop(300, 176, 'HA!', '#fff0c0');
  FX.pop(340, 186, 'HA!', '#fff0c0');
  say([
    { who: 'narrator', text: 'Then Maverick, Taffy and Cheap Whiskey burst into a giant, roaring laugh. The sheer, backwards logic of the priest was too funny to ignore.' },
    { who: 'maverick', text: 'You are a total nutcase, Father!' },
    { who: 'narrator', text: 'Professor Bucktooth, however, was not laughing. His button eyes flared with a manic, vengeful light.' },
    { who: 'bucktooth', text: 'I do not tolerate the sabotage of a high stakes sporting contract! This is a foundational breach of trust!' },
    { who: 'narrator', text: 'Before anyone could stop him, the doll scuttled across the court and pulled a medieval wooden catapult out of Taffy\'s open SUV trunk, which was still full of random props.' }
  ], ch48Load);
}

function ch48Load() {
  var p = ch48Ent('c48_priest_end');
  if (p) { p.px = 244; p.py = 210; p.dir = 'down'; }
  SFX.tone(150, 0.12, 'square', 0.05);
  say([
    { who: 'narrator', text: 'With a burst of supernatural beaver strength, the doll shoved Father Whatshisbucket onto the leather launching pad.' },
    { who: 'bucktooth', text: 'PREPARE FOR ORBITAL CLERICAL RE-ALIGNMENT!' },
    { who: 'narrator', text: 'TWANG.' }
  ], ch48Twang);
}

function ch48Twang() {
  CH48.launched = true;
  G.shake = 1.2;
  G.flash = 0.35;
  SFX.tone(220, 0.5, 'sawtooth', 0.09);
  SFX.tone(440, 0.35, 'square', 0.05);
  FX.burst(244, 196, '#d8c8a0', 26, { speed: 110, life: 0.8, lift: 40 });
  toast('TWANG');
  var p = ch48Ent('c48_priest_end');
  if (p) { p.px = -120; p.py = 216; }
  say([
    { who: 'narrator', text: 'Father Whatshisbucket was launched into the stratosphere, his scissors glinting in the afternoon sun as he soared toward outer space.' },
    { who: 'father', text: 'I CAN SEE THE GRANDFATHER CLOCKS FROM HEREEEE!' },
    { who: 'maverick', text: 'Uh... Professor? Is he going to be okay up there?' },
    { who: 'bucktooth', text: 'He has his robes for insulation, Maverick! He will be fine! And besides, his flight path is incredibly aerodynamic!' },
    { who: 'narrator', text: 'Taffy Stamburger chuckled, unzipped his leopard print coat, and revealed a box of victory donuts.' },
    { who: 'taffy', text: 'Well, monkes, since the ball is dead, I guess the bet is off. Who wants maple glazed?' },
    { who: 'narrator', text: 'Mav took a donut and looked up at the sky. A priest had just been flung into orbit and his basketball was a pancake, but as they all walked back to the house sharing pastries, it felt like a win anyway.' },
    { who: 'bucktooth', text: 'Toodaloo, Father! May the scissors be with you!' }
  ], function () {
    G.perform = false;
    var score = G.flags.c48_score === undefined ? 40 : G.flags.c48_score;
    cleared(48, score, '98 to 99, ' + (G.flags.c48_left || 0) + 's left');
  });
}

// ----------------------------------------------------------------- chapter

CHAPTER_CONTENT[48] = {
  start: 'c48_porch',

  intro: function () {
    chapterCard('CHAPTER FORTY EIGHT', 'The Great Clerical Court Crisis', 3.4);
    setTimeout(function () {
      if (G.level !== 'ch48') return;
      CH48.active = false;
      CH48.phase = 'idle';
      CH48.done = false;
      CH48.punctured = false;
      CH48.launched = false;
      CH48.priestRun = 0;
      CH48.priestWait = 0.8;
      CH48.arriveT = 1.5;
      G.perform = false;
      say([
        { who: 'narrator', text: 'Maverick and the Professor Bucktooth doll were sitting on the porch, peacefully enjoying a plate of Ritz crackers with canned cheese.' },
        { who: 'narrator', text: 'Every seven minutes, the local priest, Father Whatshisbucket, would burst out of the rectory doors, sprint at a dead run across the asphalt with a pair of giant shiny hedge shears, and disappear into the bushes.' },
        { who: 'bucktooth', text: 'Maverick! This is a structural catastrophe of the highest order! He is running at a velocity that exceeds the recommended speed limit for sharp cutlery! The wind resistance alone is putting his ears at risk!' },
        { who: 'maverick', text: 'I think he is just really passionate about trimming those hedges.' },
        { who: 'narrator', text: '[Talk to Bucktooth for the professional opinion, or to the gold SUV across the street for the bet.]' }
      ]);
    }, 900);
  },

  resume: function () {
    G.perform = false;
    CH48.active = false;
    CH48.phase = 'idle';
    if (G.sceneId === 'c48_end') {
      CH48.done = false;
      G.flags.c48_pending = 'end';
    } else if (G.sceneId === 'c48_court' && G.flags.c48_score === undefined) {
      G.flags.c48_pending = 'start';
    }
  },

  objective: function () {
    if (G.sceneId === 'c48_porch') {
      if (G.flags.c48_bet) return 'objective: into the gold SUV';
      return 'objective: talk to Taffy at the gold SUV';
    }
    if (G.sceneId === 'c48_court') {
      if (!CH48.active) return G.flags.c48_score !== undefined ? '' : 'objective: get on the court';
      if (CH48.phase === 'aim') return 'objective: stop the bar in the green';
      if (CH48.phase === 'block') return 'objective: BLOCK HIM';
      return 'objective: score once before the clock runs out';
    }
    if (G.sceneId === 'c48_end') return '';
    return '';
  }
};
