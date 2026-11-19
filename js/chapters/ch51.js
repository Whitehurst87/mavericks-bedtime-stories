// ch51.js - Chapter 51: Mav and the Squirrel Sashimi Showdown
//
// The blacktop behind Clovis Elementary. Bucktooth coaches a layup, sings a
// William Hung cover badly enough to break the water fountain, and summons four
// very large squirrels. The mechanic is passing, not shooting: exactly one
// teammate is open at a time, a defender can clog the lane, so Mav has to move
// to clear the lane before he fires the pass.
//
//   c51_blacktop  the layup lesson, the song, the challenge
//   c51_court     forty four apiece, four baskets to the comeback
//   c51_end       the butterfly, the rose, Ms. Schwegel
//
// The court tile and the hoop prop come from chapter 48, which loads first.

NAMES.taffy = 'TAFFY';
NAMES.whiskey = 'CHEAP WHISKEY';
NAMES.butch = 'BUTCH';
NAMES.lily = 'LILY';
NAMES.schwegel = 'MS. SCHWEGEL';

// Ms. Schwegel has no sprite sheet yet, so she falls back to the procedural
// painter in a cardigan. A PNG named schwegel.png would win over this.
if (!CHARS.schwegel) {
  CHARS.schwegel = {
    skin: '#e8b48c', hair: '#7a5a3a', shirt: '#8a4a6a',
    pants: '#3a3448', shoe: '#241f33', hairStyle: 'flat'
  };
}

var CH51 = {
  phase: 'idle',       // idle | layup | play | done
  // the layup warm up
  shots: 0,
  swishes: 0,
  aiming: false,
  barP: 0,
  bar: 0,
  barSpeed: 1.15,
  zoneA: 0.56,
  zoneB: 0.80,
  // the game
  home: 44,
  away: 44,
  baskets: 0,
  steals: 0,
  openIdx: 0,          // 0 = Taffy is open, 1 = Cheap Whiskey
  windowT: 0,
  windowLen: 7.6,
  laneClear: true,
  cool: 0,
  pass: null,          // { t, max, x0, y0, x1, y1, phase, to, pts }
  taffyLunge: 0,
  drop: 0,             // squirrel descent, blacktop only
  endT: 0,             // delay after the bite before the next line
  done: false
};

var CH51_BOUND = { x0: 46, y0: 100, x1: 466, y1: 252 };
var CH51_RIM = { x: 449, y: 149 };
var CH51_TARGET = 54;

function ch51Ent(id) {
  for (var i = 0; i < G.ents.length; i++) if (G.ents[i].id === id) return G.ents[i];
  return null;
}

function ch51Reset() {
  CH51.phase = 'idle';
  CH51.shots = 0;
  CH51.swishes = 0;
  CH51.aiming = false;
  CH51.barP = 0;
  CH51.bar = 0;
  CH51.home = 44;
  CH51.away = 44;
  CH51.baskets = 0;
  CH51.steals = 0;
  CH51.openIdx = 0;
  CH51.windowT = 0;
  CH51.windowLen = 6.0;
  CH51.laneClear = true;
  CH51.cool = 0;
  CH51.pass = null;
  CH51.taffyLunge = 0;
  CH51.drop = 0;
  CH51.endT = 0;
  CH51.done = false;
  G.perform = false;
}

// --------------------------------------------------------------- geometry

// how far a point sits from a line segment, used for the passing lane
function ch51SegDist(px, py, ax, ay, bx, by) {
  var dx = bx - ax, dy = by - ay;
  var len = dx * dx + dy * dy;
  var t = len ? ((px - ax) * dx + (py - ay) * dy) / len : 0;
  t = Math.max(0, Math.min(1, t));
  var cx = ax + dx * t, cy = ay + dy * t;
  return Math.hypot(px - cx, py - cy);
}

function ch51OpenMate() {
  return ch51Ent(CH51.openIdx === 0 ? 'c51_taffy' : 'c51_whiskey');
}

// ------------------------------------------------------------------ props

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (k !== 'c51Tether' && k !== 'c51Fountain' && k !== 'c51Bleachers' && k !== 'c51Oak' &&
      k !== 'c51Pigeon' && k !== 'c51Scoreboard' && k !== 'c51Butterfly' && k !== 'c51Sweatband' &&
      k !== 'c51Chase' && k !== 'c51Rose') return false;

  var P = propPainter(c, e);
  var t = G.time;

  if (k === 'c51Tether') {
    // the pole the pigeons are about to discover
    P(-9, -2, 18, 4, 'rgba(0,0,0,0.24)');
    P(-5, -3, 10, 3, '#6d6d76');
    P(-2, -74, 4, 72, '#8a8a94');
    P(-1, -74, 1, 72, '#a8a8b2');
    P(-4, -76, 8, 3, '#6d6d76');
    // the rope leans with the last swing, and the ball is still going
    var sw = Math.sin(t * 1.7) * 5;
    var bx = 12 + sw, by = -66 + Math.abs(sw) * 0.4;
    c.strokeStyle = 'rgba(226,220,200,0.75)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(e.px, e.py - 74);
    c.lineTo(e.px + bx, e.py + by);
    c.stroke();
    P(bx - 3, by - 2, 7, 7, '#e8d05a');
    P(bx - 2, by - 1, 5, 5, '#f4e488');
    P(bx - 1, by, 2, 2, '#c8a83a');
    return true;
  }

  if (k === 'c51Fountain') {
    // a school water fountain, or what is left of it
    P(-14, -2, 28, 4, 'rgba(0,0,0,0.22)');
    if (G.flags.c51_burst) {
      P(-12, -22, 11, 20, '#b6bcc4');        // the half still standing
      P(-11, -20, 9, 4, '#cfd6de');
      P(2, -9, 12, 8, '#9aa2ac');            // the half on the ground
      P(3, -8, 10, 2, '#c2cad2');
      P(-6, -3, 16, 2, 'rgba(150,190,220,0.35)');
      P(-3, -1, 5, 3, 'rgba(150,190,220,0.28)');
      P(9, -1, 4, 2, 'rgba(150,190,220,0.22)');
      // the pipe, still squirting a little
      P(6, -18, 2, 9, '#8d949c');
      var dy = (t * 26) % 12;
      P(7, -20 + dy, 1, 4, 'rgba(200,230,250,0.55)');
      return true;
    }
    P(-11, -26, 22, 24, '#b6bcc4');          // body
    P(-10, -24, 20, 20, '#c8ced6');
    P(-9, -22, 18, 3, '#e4eaf0');            // the bowl
    P(-8, -19, 16, 5, '#9aa2ac');
    P(-6, -18, 12, 3, 'rgba(140,190,225,0.55)');
    P(-2, -30, 4, 6, '#a2aab2');             // the spout
    P(-12, -6, 24, 4, '#8d949c');
    P(-9, -13, 18, 1, '#7f868e');
    return true;
  }

  if (k === 'c51Bleachers') {
    // three aluminium rows, and whoever came to watch
    for (var r = 0; r < 3; r++) {
      var yy = -30 + r * 10;
      P(-44, yy, 88, 8, r % 2 ? '#9aa0a8' : '#a6acb4');
      P(-44, yy, 88, 2, '#c2c8d0');
      P(-44, yy + 7, 88, 2, '#787f87');
    }
    P(-46, -32, 3, 34, '#7f868e');
    P(43, -32, 3, 34, '#7f868e');
    P(-44, -2, 88, 2, 'rgba(0,0,0,0.22)');
    // kids: heads and shoulders, some with hands up
    var cols = ['#e07a50', '#5aa0d0', '#e8c85a', '#8ac06a', '#c87ab0'];
    for (var i = 0; i < 7; i++) {
      var hx = -38 + i * 12 + (i % 2) * 2;
      var hy = -36 + (i % 3) * 10;
      P(hx, hy, 7, 7, cols[i % cols.length]);
      P(hx + 1, hy - 4, 5, 4, '#f2c69b');
      P(hx + 1, hy - 5, 5, 2, '#4a3220');
      if (i % 3 === 1) P(hx + 8, hy - 3, 2, 6, '#f2c69b');
    }
    return true;
  }

  if (k === 'c51Oak') {
    // one big oak, the kind a squirrel can be dropped out of
    P(-16, -3, 34, 5, 'rgba(0,0,0,0.22)');
    P(-7, -50, 14, 48, '#4a3520');
    P(-5, -50, 5, 48, '#5c4328');
    P(-7, -34, 14, 2, '#3a2818');
    P(-34, -70, 68, 26, '#2f5a2e');
    P(-28, -78, 56, 22, '#37672f');
    P(-22, -84, 44, 18, '#3d7136');
    P(-12, -88, 26, 12, '#457c3a');
    for (var i = 0; i < 14; i++) {
      var lx = -30 + (i * 11) % 60, ly = -82 + (i * 7) % 22;
      P(lx, ly, 4, 3, i % 2 ? '#4e8a42' : '#2b522a');
    }
    return true;
  }

  if (k === 'c51Pigeon') {
    // grey, unimpressed, and about to make a poor decision
    P(-4, -1, 8, 2, 'rgba(0,0,0,0.20)');
    P(-3, -7, 7, 6, '#8f95a0');
    P(-3, -8, 5, 3, '#a7adb8');
    P(2, -9, 3, 3, '#767c88');
    P(4, -8, 2, 1, '#e8b070');
    P(0, -6, 1, 1, '#2a2a32');
    P(-2, -3, 4, 1, '#767c88');
    return true;
  }

  if (k === 'c51Scoreboard') {
    // hangs over the court on two brackets, and lies about nothing
    P(-60, -44, 120, 44, '#1b1b22');
    P(-58, -42, 116, 40, '#2b2b36');
    P(-58, -42, 116, 1, 'rgba(255,220,150,0.28)');
    P(-34, -50, 4, 8, '#4a4a54');
    P(30, -50, 4, 8, '#4a4a54');
    c.textAlign = 'center';
    c.font = 'bold 9px monospace';
    c.fillStyle = '#f0e4a0';
    c.fillText('MAV', e.px - 34, e.py - 26);
    c.fillText('NUTS', e.px + 34, e.py - 26);
    c.font = 'bold 17px monospace';
    c.fillStyle = CH51.home >= CH51.away ? '#9be08a' : '#f0e4a0';
    c.fillText(String(CH51.home), e.px - 34, e.py - 10);
    c.fillStyle = CH51.away > CH51.home ? '#9be08a' : '#f0e4a0';
    c.fillText(String(CH51.away), e.px + 34, e.py - 10);
    c.font = 'bold 8px monospace';
    c.fillStyle = 'rgba(240,228,192,0.45)';
    c.fillText('to', e.px, e.py - 12);
    c.fillStyle = 'rgba(255,255,255,0.05)';
    c.fillRect(-58, -42, 116, 18);
    c.textAlign = 'left';
    return true;
  }

  if (k === 'c51Butterfly') {
    // shiny, blue, and structurally the most dangerous thing in this chapter
    var fx = Math.sin(t * 1.4) * 16;
    var fy = Math.sin(t * 2.9) * 7 - 26;
    var flap = Math.abs(Math.sin(t * 9));
    P(fx - 2, fy - 1, 4, 3, '#2a3a6a');
    c.globalAlpha = 0.75 + 0.25 * flap;
    P(fx - 6, fy - 4 - flap * 2, 5, 6, '#4a86e0');
    P(fx + 2, fy - 4 - flap * 2, 5, 6, '#4a86e0');
    P(fx - 5, fy - 3 - flap * 2, 3, 3, '#8ac6ff');
    P(fx + 3, fy - 3 - flap * 2, 3, 3, '#8ac6ff');
    c.globalAlpha = 1;
    return true;
  }

  if (k === 'c51Sweatband') {
    // somebody lost this, and nobody is claiming it
    P(-7, -1, 14, 2, 'rgba(0,0,0,0.20)');
    P(-6, -3, 12, 3, '#3f6a8a');
    P(-5, -3, 10, 1, '#5f8aa8');
    P(2, -3, 2, 3, '#e8e0c8');
    return true;
  }

  if (k === 'c51Chase') {
    // in the far background: a leopard print coat gaining on a squirrel
    var x = e.chaseX || 0;
    P(-40 + x, -16, 10, 10, '#8d5a34');            // the squirrel
    P(-37 + x, -22, 7, 7, '#a1704a');
    P(-36 + x, -24, 5, 3, '#6a3a22');
    P(-24 + x, -18, 12, 12, '#c8a24a');            // the coat
    P(-22 + x, -14, 8, 6, '#3a3026');
    P(-26 + x, -8, 4, 6, '#c8a24a');
    P(-23 + x, -22, 7, 6, '#6a4a2a');
    if (Math.abs(Math.sin(t * 12)) > 0.6) {
      P(-44 + x, -6, 4, 2, 'rgba(200,190,170,0.5)');
    }
    return true;
  }

  if (k === 'c51Rose') {
    // a rose, held out sideways at doll height
    var sway = Math.sin(G.time * 1.6) * 1;
    P(10, -26, 11, 1, '#3f7a3a');
    P(19, -30 + sway, 1, 5, '#3f7a3a');
    P(18, -25, 3, 1, '#4e8a42');
    P(18, -36 + sway, 5, 5, '#c8402f');
    P(19, -35 + sway, 3, 3, '#e8607a');
    P(20, -34 + sway, 1, 1, '#f8a8b4');
    return true;
  }

  return false;
});

// ------------------------------------------------------------------ scenes

SCENES.c51_blacktop = {
  title: 'THE BLACKTOP BEHIND CLOVIS ELEMENTARY',
  spawn: { tx: 20, ty: 11, dir: 'left' },
  camZoom: 1,
  fill: 'grass',
  rects: [
    { x: 0, y: 0, w: 32, h: 3, t: 'tree' },
    { x: 0, y: 3, w: 32, h: 14, t: 'c48Court' },
    { x: 0, y: 17, w: 32, h: 1, t: 'path' },
    { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 18, t: 'tree' }
  ],
  solidKinds: ['tree'],
  entities: [
    { id: 'c51_hoop', who: null, tx: 28, ty: 15, kind: 'c48Hoop', noSolid: true, propScale: 1 },
    { id: 'c51_oak_w', who: null, tx: 6, ty: 3, kind: 'c51Oak', noSolid: true, propScale: 1 },
    { id: 'c51_oak_e', who: null, tx: 24, ty: 3, kind: 'c51Oak', noSolid: true, propScale: 1 },
    { id: 'c51_tether', who: null, tx: 9, ty: 8, kind: 'c51Tether', noSolid: true, propScale: 1 },
    { id: 'c51_fountain', who: null, tx: 3, ty: 14, kind: 'c51Fountain', noSolid: true, propScale: 1 },
    { id: 'c51_bleachers', who: null, tx: 13, ty: 4, kind: 'c51Bleachers', noSolid: true, propScale: 1 },
    { id: 'c51_band', who: null, tx: 24, ty: 12, kind: 'c51Sweatband', noSolid: true, propScale: 1 },
    { id: 'c51_pigeon1', who: null, tx: 14, ty: 5, kind: 'c51Pigeon', noSolid: true, propScale: 1 },
    { id: 'c51_pigeon2', who: null, tx: 17, ty: 5, kind: 'c51Pigeon', noSolid: true, propScale: 1 },
    { id: 'c51_pigeon3', who: null, tx: 20, ty: 5, kind: 'c51Pigeon', noSolid: true, propScale: 1 },
    { id: 'c51_buck', who: 'bucktooth', tx: 17, ty: 13, dir: 'right', reach: 60, talk: 'ch51Buck' },
    { id: 'c51_butch', who: 'butch', tx: 19, ty: 12, dir: 'down', noSolid: true },
    { id: 'c51_sq1', who: 'butch', tx: 11, ty: 10, dir: 'down', small: true, noSolid: true },
    { id: 'c51_sq2', who: 'butch', tx: 15, ty: 9, dir: 'down', small: true, noSolid: true },
    { id: 'c51_sq3', who: 'butch', tx: 24, ty: 11, dir: 'down', small: true, noSolid: true }
  ],
  overlay: function (c) {
    // the school wall behind the trees, a fence, and one faded court
    c.fillStyle = '#8a7a62';
    c.fillRect(0, 0, W, 10);
    c.fillStyle = '#6f5f4a';
    c.fillRect(0, 10, W, 3);
    // chain link along the north edge
    c.strokeStyle = 'rgba(206,210,216,0.14)';
    c.lineWidth = 1;
    for (var i = -30; i < W + 30; i += 8) {
      c.beginPath(); c.moveTo(i, 44); c.lineTo(i + 34, 4); c.stroke();
      c.beginPath(); c.moveTo(i, 4); c.lineTo(i + 34, 44); c.stroke();
    }
    c.fillStyle = 'rgba(120,124,130,0.5)';
    for (var p = 20; p < W; p += 120) c.fillRect(p, 0, 3, 46);
    // painted lines, half worn off
    c.strokeStyle = 'rgba(232,224,198,0.34)';
    c.lineWidth = 2;
    c.strokeRect(40, 62, 424, 210);
    c.beginPath();
    c.arc(449, 149, 26, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.moveTo(300, 62);
    c.lineTo(300, 272);
    c.stroke();
    c.strokeStyle = 'rgba(232,224,198,0.20)';
    c.strokeRect(392, 108, 72, 84);
    // shadows under the trees, and an afternoon that is nearly over
    c.fillStyle = 'rgba(20,40,24,0.26)';
    c.fillRect(0, 46, W, 8);
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,214,150,0.14)');
    g.addColorStop(0.6, 'rgba(255,200,140,0.04)');
    g.addColorStop(1, 'rgba(30,26,20,0.16)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
};

SCENES.c51_court = {
  title: 'THE BLACKTOP, GAME ON',
  spawn: { tx: 16, ty: 13, dir: 'up' },
  camZoom: 1,
  fill: 'grass',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'hedge' },
    { x: 0, y: 0, w: 1, h: 18, t: 'hedge' },
    { x: 31, y: 0, w: 1, h: 18, t: 'hedge' },
    { x: 0, y: 2, w: 32, h: 16, t: 'c48Court' }
  ],
  solidKinds: ['hedge'],
  entities: [
    { id: 'c51_hoop_r', who: null, tx: 28, ty: 15, kind: 'c48Hoop', noSolid: true, propScale: 1 },
    { id: 'c51_hoop_l', who: null, tx: 3, ty: 15, kind: 'c48Hoop', mirror: true, noSolid: true, propScale: 1 },
    { id: 'c51_board', who: null, tx: 12, ty: 4, kind: 'c51Scoreboard', noSolid: true, propScale: 1 },
    { id: 'c51_bench_w', who: null, tx: 4, ty: 16, kind: 'c51Bleachers', noSolid: true, propScale: 1 },
    { id: 'c51_bench_e', who: null, tx: 26, ty: 16, kind: 'c51Bleachers', noSolid: true, propScale: 1 },
    { id: 'c51_lily', who: 'squirrel_robber', tx: 25, ty: 15, dir: 'down', small: true, noSolid: true },
    { id: 'c51_barb', who: null, tx: 20, ty: 2, kind: 'c51Sweatband', noSolid: true, propScale: 1 },
    { id: 'c51_buck_c', who: 'bucktooth', tx: 20, ty: 16, dir: 'up', small: true, noSolid: true },
    { id: 'c51_taffy', who: 'taffy', tx: 8, ty: 11, dir: 'right', noSolid: true },
    { id: 'c51_whiskey', who: 'whiskey', tx: 24, ty: 12, dir: 'left', noSolid: true },
    { id: 'c51_butch', who: 'butch', tx: 20, ty: 10, dir: 'left', noSolid: true, sq: true },
    { id: 'c51_sq1', who: 'butch', tx: 12, ty: 8, dir: 'down', small: true, noSolid: true, sq: true },
    { id: 'c51_sq2', who: 'butch', tx: 16, ty: 12, dir: 'down', small: true, noSolid: true, sq: true },
    { id: 'c51_sq3', who: 'butch', tx: 22, ty: 14, dir: 'down', small: true, noSolid: true, sq: true },
    { id: 'c51_fly', who: null, tx: 16, ty: 12, kind: 'c51Butterfly', noSolid: true, propScale: 1, hidden: false }
  ],
  overlay: function (c) {
    // full court lines over the blacktop tile
    c.strokeStyle = 'rgba(232,224,198,0.52)';
    c.lineWidth = 2;
    c.strokeRect(44, 62, 424, 210);
    c.beginPath();
    c.moveTo(256, 62);
    c.lineTo(256, 272);
    c.stroke();
    c.beginPath();
    c.arc(256, 167, 32, 0, Math.PI * 2);
    c.stroke();
    c.strokeRect(392, 110, 76, 82);
    c.strokeRect(56, 110, 76, 82);
    c.beginPath();
    c.arc(449, 149, 26, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(62, 149, 26, 0, Math.PI * 2);
    c.stroke();
    // chain link and the school behind it
    c.strokeStyle = 'rgba(206,210,216,0.11)';
    c.lineWidth = 1;
    for (var i = -30; i < W + 30; i += 9) {
      c.beginPath(); c.moveTo(i, 32); c.lineTo(i + 30, 2); c.stroke();
      c.beginPath(); c.moveTo(i, 2); c.lineTo(i + 30, 32); c.stroke();
    }
    c.fillStyle = 'rgba(120,124,130,0.5)';
    for (var p = 24; p < W; p += 128) c.fillRect(p, 0, 3, 34);
    // late afternoon, warm on one side
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,206,140,0.16)');
    g.addColorStop(0.55, 'rgba(255,196,130,0.05)');
    g.addColorStop(1, 'rgba(24,20,32,0.18)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(24,24,28,0.16)';
    c.fillRect(150, 196, 30, 3);
    c.fillRect(300, 96, 20, 2);
  }
};

SCENES.c51_end = {
  title: 'THE SIDEWALK OUT FRONT',
  spawn: { tx: 16, ty: 13, dir: 'up' },
  camZoom: 1,
  fill: 'grass',
  rects: [
    { x: 0, y: 0, w: 32, h: 4, t: 'house' },
    { x: 0, y: 4, w: 32, h: 3, t: 'c48Walk' },
    { x: 0, y: 7, w: 32, h: 5, t: 'c48Court' },
    { x: 0, y: 12, w: 32, h: 6, t: 'grass' },
    { x: 0, y: 0, w: 2, h: 4, t: 'hedge' },
    { x: 30, y: 0, w: 2, h: 4, t: 'hedge' }
  ],
  solidKinds: ['house', 'hedge'],
  entities: [
    { id: 'c51_schwegel', who: 'schwegel', tx: 16, ty: 5, dir: 'down', noSolid: true },
    { id: 'c51_buck_end', who: 'bucktooth', tx: 13, ty: 14, dir: 'right', noSolid: true },
    { id: 'c51_rose_end', who: null, tx: 13, ty: 14, kind: 'c51Rose', noSolid: true, propScale: 1 },
    { id: 'c51_kid1', who: 'adrian', tx: 21, ty: 9, dir: 'left', small: true, noSolid: true },
    { id: 'c51_kid2', who: 'clerk', tx: 24, ty: 10, dir: 'left', small: true, noSolid: true },
    { id: 'c51_kid3', who: 'patty', tx: 27, ty: 9, dir: 'left', small: true, noSolid: true },
    { id: 'c51_chase', who: null, tx: 4, ty: 6, kind: 'c51Chase', noSolid: true, propScale: 1, chaseX: 0 },
    { id: 'c51_band_end', who: null, tx: 19, ty: 11, kind: 'c51Sweatband', noSolid: true, propScale: 1 },
    { id: 'c51_fly_end', who: null, tx: 16, ty: 12, kind: 'c51Butterfly', noSolid: true, propScale: 1 }
  ],
  overlay: function (c) {
    // the school doors, shut, and a lot of afternoon left in the day
    c.fillStyle = '#7d6d56';
    c.fillRect(0, 0, W, 6);
    c.fillStyle = '#5f513d';
    c.fillRect(0, 6, W, 3);
    // the double doors
    c.fillStyle = '#4a4438';
    c.fillRect(214, 8, 84, 56);
    c.fillStyle = '#6f6a58';
    c.fillRect(218, 12, 38, 52);
    c.fillRect(260, 12, 34, 52);
    c.fillStyle = 'rgba(190,214,232,0.30)';
    c.fillRect(224, 18, 26, 20);
    c.fillRect(266, 18, 22, 20);
    c.fillStyle = '#3a352c';
    c.fillRect(255, 12, 3, 52);
    // sidewalk joints and a hopscotch board somebody drew
    for (var x = 0; x < W; x += 32) {
      c.fillStyle = 'rgba(90,88,84,0.35)';
      c.fillRect(x, 64, 1, 48);
    }
    c.fillStyle = 'rgba(232,224,198,0.20)';
    c.fillRect(360, 80, 16, 4);
    c.fillRect(364, 88, 16, 4);
    c.fillRect(356, 96, 16, 4);
    // long shadows, because the afternoon is going
    c.fillStyle = 'rgba(24,20,32,0.20)';
    c.beginPath();
    c.moveTo(214, 64);
    c.lineTo(298, 64);
    c.lineTo(360, 112);
    c.lineTo(256, 112);
    c.closePath();
    c.fill();
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,206,150,0.16)');
    g.addColorStop(0.6, 'rgba(255,196,140,0.05)');
    g.addColorStop(1, 'rgba(26,22,34,0.18)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
};

// ----------------------------------------------------------------- scripts

SCRIPT.ch51Buck = function () {
  if (G.flags.c51_lesson) {
    if (G.flags.c51_sing) {
      say([{ who: 'bucktooth', text: 'The bridge needs two pillars, Maverick, and the clock is a coward. Onward!' }]);
      return;
    }
    say([
      { who: 'bucktooth', text: 'Three layups, Maverick. Left foot, elbow like a cantilever, kiss the glass. Then we sing.' }
    ]);
    return;
  }
  say([
    { who: 'bucktooth', text: 'Maverick! Your approach angle is a structural disaster. You are bouncing off the wrong foot and addressing the backboard with your shoulder.' },
    { who: 'maverick', text: 'I am trying, Professor. My coordination is still recovering from The Burt.' },
    { who: 'bucktooth', text: 'Nonsense. Bounce off the left foot, extend the elbow like a cantilever bridge, and softly kiss the glass.' },
    { who: 'narrator', text: 'Mav missed the backboard by four feet, chased the ball down, and came back for another go.' },
    { who: 'bucktooth', text: 'We shall approach this the way we approach every structural problem. With musical accompaniment.' },
    { who: 'narrator', text: '[Walk to the hoop and press E. Press E again when the bar is in the green. Three layups.]' }
  ], function () {
    G.flags.c51_lesson = true;
    CH51.phase = 'layup';
    toast('objective: three layups at the hoop');
    saveGame();
  });
};

SCRIPT.ch51Schwegel = function () {
  say([
    { who: 'schwegel', text: 'I graded forty two spelling tests, and eleven of them spelled the word correctly in a way I did not know was possible.' },
    { who: 'schwegel', text: "You're all nuts." }
  ]);
};

SCRIPT.ch51EndBuck = function () {
  say([
    { who: 'bucktooth', text: 'Peanut butter, Maverick. The reliable spread. Chunky for structure, smooth for finish.' },
    { who: 'maverick', text: 'I keep telling you, the crackers are the whole point. The peanut butter is a rumor.' }
  ]);
};

SCRIPT.ch51Lily = function () {
  say([{ who: 'narrator', text: 'Lily is holding a red rose and staring at the oak trees.' }]);
};

// --------------------------------------------------------- the layup warm up

function ch51NearHoop() {
  return Math.hypot(G.px - 440, G.py - 236) < 104;
}

function ch51LayupAction() {
  if (!ch51NearHoop()) return false;
  if (!CH51.aiming) {
    CH51.aiming = true;
    CH51.barP = 0;
    CH51.bar = 0;
    CH51.zoneA = 0.5 + Math.random() * 0.2;
    CH51.zoneB = Math.min(0.94, CH51.zoneA + 0.24);
    CH51.barSpeed = 1.0 + CH51.shots * 0.08;
    SFX.blip(520, 0.05);
    return true;
  }
  var hit = CH51.bar >= CH51.zoneA && CH51.bar <= CH51.zoneB;
  CH51.aiming = false;
  CH51.shots++;
  if (hit) {
    CH51.swishes++;
    SFX.blip(760, 0.09);
    SFX.blip(980, 0.11);
    FX.confetti(CH51_RIM.x - 20, CH51_RIM.y);
    FX.pop(CH51_RIM.x - 46, CH51_RIM.y - 8, 'SWISH', '#9be08a');
    G.flash = 0.25;
    toast(['kiss off the glass', 'left foot, elbow, glass. structural', 'that one had a permit'][CH51.shots % 3]);
  } else {
    SFX.tone(180, 0.14, 'square', 0.05);
    G.shake = 0.25;
    FX.pop(CH51_RIM.x - 46, CH51_RIM.y - 8, 'CLANG', '#e8b070');
    FX.burst(CH51_RIM.x - 24, CH51_RIM.y + 4, '#e8b070', 8, { speed: 40, life: 0.4 });
    toast(['the approach angle is a disaster', 'the cantilever was not cantilevered', 'we do not speak of that one'][CH51.shots % 3]);
  }
  if (CH51.shots >= 3) setTimeout(ch51Sing, 900);
  return true;
}

function ch51Sing() {
  if (G.level !== 'ch51' || G.sceneId !== 'c51_blacktop') return;
  if (G.flags.c51_sing) return;
  G.flags.c51_sing = true;
  CH51.aiming = false;
  CH51.phase = 'sing';
  saveGame();
  say([
    { who: 'bucktooth', text: 'And now, Maverick, the vertical rhythm. To help you find it, I shall sing.' },
    { who: 'narrator', text: '"I bE-lIeVe I cAn FlYyYy! I bE-lIeVe I cAn ToUcH tHe SkYyYy! Think about it every night and daaaay!"' },
    { who: 'maverick', text: 'Professor. Professor. The pigeons are leaving. Why are the pigeons leaving?' },
    { who: 'narrator', text: 'The singing was so shrill and so aggressively off key that the water fountain came apart at the seam and three pigeons flew directly into the tetherball pole.' }
  ], function () {
    ch51FountainBurst();
    ch51PigeonsFly();
    CH51.drop = 1.6;
    ch51SquirrelsArrive();
  });
}

function ch51FountainBurst() {
  G.flags.c51_burst = true;
  var f = ch51Ent('c51_fountain');
  if (!f) return;
  G.shake = 0.8;
  G.flash = 0.4;
  SFX.tone(120, 0.3, 'sawtooth', 0.06);
  SFX.tone(320, 0.16, 'square', 0.05);
  FX.burst(f.px, f.py - 18, '#cfe6f6', 26, { speed: 90, life: 0.9, lift: 40 });
  FX.burst(f.px, f.py - 14, '#9aa2ac', 14, { speed: 70, life: 0.7, lift: 20 });
  FX.pop(f.px, f.py - 40, 'SNAP', '#a8d8f0');
  toast('the water fountain has resigned');
}

function ch51PigeonsFly() {
  G.flags.c51_pigeon = G.time;
  var pole = ch51Ent('c51_tether');
  if (!pole) return;
  for (var i = 1; i <= 3; i++) {
    var p = ch51Ent('c51_pigeon' + i);
    if (!p) continue;
    p.flyT = 0.55 + i * 0.18;
    p.flyMax = p.flyT;
    p.x0 = p.px;
    p.y0 = p.py;
    p.x1 = pole.px + (i - 2) * 9;
    p.y1 = pole.py - 6;
    p.flying = true;
  }
}

function ch51SquirrelsArrive() {
  say([
    { who: 'narrator', text: 'Four enormous rodents dropped out of the oaks, all biceps and tiny leather vests, and landed like a delivery of brick refrigerators.' },
    { who: 'butch', text: 'Hey, polyester face. Your singing is ruining our bench press sets.' },
    { who: 'maverick', text: 'I did not sing. I have never sung. I have been standing here trying to do a layup.' },
    { who: 'butch', text: 'We are challenging you to a game of hoops. Winner takes the court, and the losers forfeit their lives.' },
    { who: 'bucktooth', text: 'CHALLENGE ACCEPTED! We shall defend the structural integrity of this blacktop!' },
    { who: 'maverick', text: 'Professor, are you crazy? They are built like brick refrigerators. We do not even know how to do a layup.' },
    { who: 'bucktooth', text: 'Fear not, Splinter. I am deploying backup.' },
    { who: 'narrator', text: 'Bucktooth snapped his felt paws. Grape scented smoke rolled off the blacktop, and Taffy Stamburger and Cheap Whiskey were standing on the court.' },
    { who: 'taffy', text: 'Yo, monkes. Did somebody say high stakes rodent athletics?' },
    { who: 'whiskey', text: 'I found this juice box. It is empty. I love it.' },
    { who: 'bucktooth', text: 'Maverick. A bridge cannot stand on a single pillar. Play as a team. Pass the rock.' },
    { who: 'narrator', text: '[ARROWS to move. One monke is open at a time. If a squirrel clogs the lane, walk until the line goes GREEN, then press E to pass.]' }
  ], function () {
    if (G.level !== 'ch51') return;
    G.flags.c51_gate = true;
    G.toScene('c51_court', 16, 13, 'up');
  });
}

// ----------------------------------------------------------------- the game

function ch51StartGame() {
  CH51.phase = 'play';
  CH51.home = 44;
  CH51.away = 44;
  CH51.baskets = 0;
  CH51.steals = 0;
  CH51.openIdx = 0;
  CH51.windowLen = 7.6;
  CH51.windowT = CH51.windowLen;
  CH51.cool = 0.6;
  CH51.pass = null;
  CH51.done = false;
  G.perform = true;
  G.px = 140;
  G.py = 210;
  G.dir = 'right';
  G.moving = false;
  // the three minions each keep an orbit, so the lane keeps changing
  var orbits = [
    { ox: 200, oy: 150, rx: 62, ry: 30, sp: 0.5, ph: 0 },
    { ox: 300, oy: 196, rx: 70, ry: 26, sp: 0.62, ph: 2.1 },
    { ox: 384, oy: 148, rx: 54, ry: 34, sp: 0.44, ph: 4.0 }
  ];
  for (var i = 0; i < 3; i++) {
    var m = ch51Ent('c51_sq' + (i + 1));
    if (!m) continue;
    m.ox = orbits[i].ox; m.oy = orbits[i].oy;
    m.rx = orbits[i].rx; m.ry = orbits[i].ry;
    m.sp = orbits[i].sp; m.ph = orbits[i].ph;
  }
  var b = ch51Ent('c51_butch');
  if (b) { b.px = 380; b.py = 120; }
  toast('forty four apiece. pass to the open monke');
  saveGame();
}

function ch51Move(dt) {
  var inp = inputDir();
  var spd = 84;
  var dx = inp.dx * spd * dt, dy = inp.dy * spd * dt;
  G.px = clamp(G.px + dx, CH51_BOUND.x0, CH51_BOUND.x1);
  G.py = clamp(G.py + dy, CH51_BOUND.y0, CH51_BOUND.y1);
  if (inp.dx || inp.dy) {
    if (Math.abs(inp.dx) >= Math.abs(inp.dy)) G.dir = inp.dx > 0 ? 'right' : 'left';
    else G.dir = inp.dy > 0 ? 'down' : 'up';
  }
  G.moving = !!(inp.dx || inp.dy);
  if (G.moving) {
    G.animT += dt;
    var cols = walkCols('maverick');
    G.frame = cols > 1 ? Math.floor(G.animT * 12) % cols : Math.floor(G.animT * 8) % 2;
  } else {
    G.idleT = (G.idleT || 0) + dt;
    G.frame = 0;
  }
}

function ch51LaneClearNow() {
  var m = ch51OpenMate();
  if (!m) return true;
  var ax = G.px, ay = G.py - 18, bx = m.px, by = m.py - 18;
  for (var i = 0; i < G.ents.length; i++) {
    var e = G.ents[i];
    if (!e.sq) continue;
    if (ch51SegDist(e.px, e.py - 14, ax, ay, bx, by) < 15) return false;
  }
  return true;
}

function ch51OpenWindow() {
  CH51.openIdx = 1 - CH51.openIdx;
  CH51.windowT = CH51.windowLen;
}

function ch51Pass() {
  var m = ch51OpenMate();
  if (!m) return;
  if (!CH51.laneClear) {
    ch51Turnover('STOLEN');
    return;
  }
  var pts = CH51.openIdx === 1 ? 3 : 2;
  CH51.pass = {
    t: 0.32, max: 0.32,
    x0: G.px, y0: G.py - 26,
    x1: m.px, y1: m.py - 26,
    phase: 'mate', to: m, pts: pts
  };
  CH51.cool = 0.9;
  SFX.blip(700, 0.06);
  FX.pop(G.px, G.py - 42, 'PASS', '#9be08a');
  toast(CH51.openIdx === 1 ? 'bounce pass, right between the legs' : 'alley oop, coat out like a parachute');
}

function ch51PassLand() {
  var p = CH51.pass;
  if (!p) return;
  if (p.phase === 'mate') {
    p.phase = 'rim';
    p.t = 0.42;
    p.max = 0.42;
    p.x0 = p.x1;
    p.y0 = p.y1;
    p.x1 = CH51_RIM.x;
    p.y1 = CH51_RIM.y;
    return;
  }
  CH51.pass = null;
  CH51.cool = 0.5;
  CH51.home += p.pts;
  CH51.baskets++;
  CH51.windowLen = Math.max(5.2, CH51.windowLen - 0.25);
  G.flash = 0.26;
  G.shake = 0.32;
  SFX.tone(660, 0.1, 'triangle', 0.05);
  SFX.blip(1000, 0.1);
  FX.confetti(CH51_RIM.x - 16, CH51_RIM.y);
  FX.pop(CH51_RIM.x - 70, CH51_RIM.y - 6, '+' + p.pts, '#f0d060');
  toast(p.pts === 3 ? 'Cheap Whiskey trips over a shoelace and banks in a three' : 'Taffy glides it in off the glass');
  ch51OpenWindow();
  if (CH51.home >= CH51_TARGET) ch51LastShot();
}

function ch51Turnover(kind) {
  CH51.away += 2;
  CH51.steals++;
  CH51.cool = 1.1;
  CH51.pass = null;
  CH51.windowLen = Math.max(5.2, CH51.windowLen - 0.15);
  G.shake = 0.6;
  G.flash = 0.2;
  SFX.tone(150, 0.2, 'square', 0.06);
  FX.pop(G.px, G.py - 40, kind, '#e8607a');
  FX.burst(G.px, G.py - 20, '#e8607a', 12, { speed: 60, life: 0.5 });
  toast(kind === 'STOLEN' ? 'a furry wall takes the ball' : 'the shot clock ran out. the squirrels are delighted');
  ch51OpenWindow();
  if (CH51.away >= CH51_TARGET) ch51LastShot();
}

function ch51LastShot() {
  if (CH51.phase === 'done') return;
  CH51.phase = 'done';
  CH51.pass = null;
  G.perform = false;
  G.flash = 0.4;
  G.shake = 0.7;
  SFX.tone(220, 0.3, 'triangle', 0.05);
  saveGame();
  var behind = CH51.home <= CH51.away;
  say([
    { who: 'narrator', text: 'Three seconds left. The board reads ' + CH51.home + ' to ' + CH51.away + ', and nobody on this blacktop is breathing.' },
    { who: 'butch', text: behind ? 'Say goodnight, fifth graders!' : 'One basket and the story changes, fifth grader. Watch the ceiling.' },
    { who: 'narrator', text: 'Butch snatched the rebound, muscled past Cheap Whiskey, and jumped ten feet straight up from the three point line.' },
    { who: 'maverick', text: 'He cannot do that. Nobody can do that. The ground is right there and he is not on it.' }
  ], ch51Bite);
}

function ch51Bite() {
  G.flash = 0.7;
  G.shake = 1.1;
  CH51.taffyLunge = 1.2;
  SFX.tone(90, 0.35, 'sawtooth', 0.07);
  SFX.tone(150, 0.28, 'square', 0.05);
  var b = ch51Ent('c51_butch');
  if (b) FX.burst(b.px, b.py - 20, '#c8a24a', 16, { speed: 70, life: 0.7, lift: 30 });
  say([
    { who: 'narrator', text: 'Taffy Stamburger went up without a run up, took a mouthful out of Butch\'s shoulder, and the ball dropped to the asphalt.' },
    { who: 'narrator', text: 'CHOMP.' },
    { who: 'maverick', text: 'TAFFY, WHAT ARE YOU DOING? You cannot just bite the other team!' },
    { who: 'taffy', text: 'Look, kid. I have not had squirrel sashimi since my days sailing the fjords, and all this cardio has built up quite the appetite.' },
    { who: 'narrator', text: 'Absolute pandemonium. Every kid on the playground started screaming with their whole body.' },
    { who: 'taffy', text: 'Who has the soy sauce? Somebody get me a napkin and a small dish of wasabi!' },
    { who: 'narrator', text: 'Taffy chased the other three squirrels around the court, trying to scoop them up like appetizers.' },
    { who: 'maverick', text: 'Taffy. Taffy. I do not know how to explain any of this to a court of law.' }
  ], function () {
    if (G.level !== 'ch51') return;
    G.flags.c51_endgate = true;
    G.toScene('c51_end', 16, 13, 'up');
  });
}

// ------------------------------------------------------------------- ticks

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch51') return;
  if (G.sceneId === 'c51_blacktop') ch51BlacktopTick(dt);
  else if (G.sceneId === 'c51_court') ch51CourtTick(dt);
  else if (G.sceneId === 'c51_end') ch51EndTick(dt);
});

function ch51BlacktopTick(dt) {
  // before the song, the squirrels are still up the trees and out of sight
  var ids = ['c51_butch', 'c51_sq1', 'c51_sq2', 'c51_sq3'];
  var homes = [[300, 198], [180, 168], [248, 150], [384, 182]];
  for (var i = 0; i < ids.length; i++) {
    var e = ch51Ent(ids[i]);
    if (!e) continue;
    if (!G.flags.c51_sing) { e.px = -300; e.py = -300; continue; }
    if (CH51.drop > 0) {
      var k = 1 - Math.max(0, CH51.drop) / 1.6;
      var ease = k * k;
      e.px = homes[i][0];
      e.py = -50 + (homes[i][1] + 50) * ease;
      e.moving = true;
    } else {
      e.px = homes[i][0];
      e.py = homes[i][1] + Math.sin(G.time * 2 + i) * 1.5;
      e.moving = false;
    }
  }
  if (CH51.drop > 0) {
    var was = CH51.drop;
    CH51.drop = Math.max(0, CH51.drop - dt);
    if (was > 0 && CH51.drop === 0) {
      G.shake = 0.7;
      SFX.tone(120, 0.22, 'square', 0.05);
      for (var j = 0; j < homes.length; j++) {
        FX.burst(homes[j][0], homes[j][1], '#b8a888', 12, { speed: 60, life: 0.6, lift: 14 });
      }
    }
  }

  // the pigeons, on their way to the pole
  for (var p = 1; p <= 3; p++) {
    var pg = ch51Ent('c51_pigeon' + p);
    if (!pg || !pg.flying) continue;
    pg.flyT -= dt;
    var q = 1 - Math.max(0, pg.flyT) / pg.flyMax;
    pg.px = pg.x0 + (pg.x1 - pg.x0) * q;
    pg.py = pg.y0 + (pg.y1 - pg.y0) * q - Math.sin(q * Math.PI) * 26;
    if (pg.flyT <= 0) {
      pg.flying = false;
      pg.px = pg.x1;
      pg.py = pg.y1;
      SFX.blip(320, 0.06);
      FX.burst(pg.px, pg.py - 4, '#c8ccd4', 6, { speed: 30, life: 0.4, lift: 10 });
    }
  }

  // the hoop shows its ring while a layup is on offer
  if (CH51.phase === 'layup' && CH51.aiming) {
    CH51.barP = (CH51.barP + dt * CH51.barSpeed) % 2;
    CH51.bar = CH51.barP > 1 ? 2 - CH51.barP : CH51.barP;
  }
}

function ch51CourtTick(dt) {
  // arrive from the blacktop: the tip off line, then the ball
  if (G.flags.c51_gate && !DLG.active && !G.pending) {
    G.flags.c51_gate = false;
    say([
      { who: 'narrator', text: 'The whistle blew. Forty four apiece, and the squirrels came out setting screens that felt like concrete.' },
      { who: 'bucktooth', text: 'Maverick! Stop hogging the orange sphere! A bridge cannot stand on a single pillar!' }
    ], ch51StartGame);
    return;
  }

  if (CH51.taffyLunge > 0) CH51.taffyLunge = Math.max(0, CH51.taffyLunge - dt);
  if (CH51.cool > 0) CH51.cool = Math.max(0, CH51.cool - dt);

  // cheap whiskey wanders, taffy circles, and both of them are always moving
  var t = G.time;
  var tf = ch51Ent('c51_taffy');
  var wk = ch51Ent('c51_whiskey');
  if (tf) {
    var lunge = CH51.taffyLunge > 0 ? CH51.taffyLunge * 30 : 0;
    tf.px = 196 + Math.cos(t * 0.62) * 92;
    tf.py = 176 + Math.sin(t * 0.85) * 32 - lunge;
    tf.dir = Math.cos(t * 0.62) > 0 ? 'right' : 'left';
  }
  if (wk) {
    wk.px = 320 + Math.cos(t * 0.5 + 2.4) * 82;
    wk.py = 198 + Math.sin(t * 0.63 + 0.8) * 28;
    wk.dir = Math.cos(t * 0.5 + 2.4) > 0 ? 'right' : 'left';
  }

  // the butterfly does not exist until the game is already lost
  var bf = ch51Ent('c51_fly');
  if (bf) {
    if (CH51.phase === 'done') { bf.px = 300 + Math.sin(t * 0.9) * 40; bf.py = 190; }
    else bf.px = -300;
  }

  // butch hounds Mav, the minions keep their orbits
  var b = ch51Ent('c51_butch');
  if (b) {
    var dx = G.px - b.px, dy = G.py - b.py, dd = Math.hypot(dx, dy) || 1;
    // he closes on Mav but slower than Mav can walk, so standing still lets
    // him clog the lane and walking away is always the answer
    b.px += (dx / dd) * 30 * dt;
    b.py += (dy / dd) * 20 * dt;
    b.dir = dx > 0 ? 'right' : 'left';
    b.moving = true;
  }
  for (var i = 1; i <= 3; i++) {
    var m = ch51Ent('c51_sq' + i);
    if (!m || m.ox === undefined) continue;
    m.px = m.ox + Math.cos(t * m.sp + m.ph) * m.rx;
    m.py = m.oy + Math.sin(t * m.sp * 0.8 + m.ph) * m.ry;
    m.dir = Math.cos(t * m.sp + m.ph) > 0 ? 'right' : 'left';
    m.moving = true;
  }

  if (CH51.phase !== 'play') return;

  ch51Move(dt);

  // the ball, and the passing lane
  if (CH51.pass) {
    CH51.pass.t -= dt;
    if (CH51.pass.t <= 0) ch51PassLand();
    CH51.laneClear = ch51LaneClearNow();
    return;
  }

  CH51.laneClear = ch51LaneClearNow();
  if (CH51.cool > 0) return;
  // a coach on the sideline, for the kid who stands in the red
  if (!CH51.laneClear) {
    CH51.nudgeT = (CH51.nudgeT || 0) + dt;
    if (CH51.nudgeT > 3.4) {
      CH51.nudgeT = 0;
      toast('the line is red. walk until it goes green, then press E');
      FX.pop(G.px, G.py - 46, 'MOVE!', '#ff9a9a');
    }
  } else {
    CH51.nudgeT = 0;
  }
  CH51.windowT -= dt;
  if (CH51.windowT <= 0) ch51Turnover('SHOT CLOCK');
}

function ch51EndTick(dt) {
  if (G.flags.c51_endgate) {
    if (DLG.active || G.pending) return;
    G.flags.c51_endgate = false;
    say([
      { who: 'narrator', text: 'Mav opened his mouth to stop him properly. Then a shiny blue butterfly fluttered past his nose.' },
      { who: 'maverick', text: 'Wait. What was I doing? Oh man. I left my peanut butter crackers on the kitchen counter.' },
      { who: 'narrator', text: 'Completely forgetting the life or death basketball game behind him, he turned around and jogged home at a pleasant speed.' },
      { who: 'narrator', text: 'The Bucktooth doll watched him go, shrugged his felt shoulders, and waddled over to Lily on the bleachers with a single red rose from somewhere.' },
      { who: 'bucktooth', text: 'My condolences for your muscle bound beau, madam. Toodaloo!' },
      { who: 'narrator', text: 'Behind them the last squirrels scrambled up the oaks. All except Butch, who was being chased toward the parking lot by a napkin wielding Taffy Stamburger.' },
      { who: 'narrator', text: 'The heavy metal doors of the school swung open. Ms. Schwegel stepped out with a stack of graded spelling tests, and surveyed the screaming, the stray sweatbands, and the leopard print coat.' },
      { who: 'schwegel', text: "You're all nuts." },
      { who: 'narrator', text: 'The kids stopped crying, looked at each other, and burst out laughing. Around the corner, a boy and a beaver doll were already deep in a debate about peanut butter.' }
    ], ch51Finish);
  }
}

function ch51Finish() {
  if (CH51.done) return;
  CH51.done = true;
  G.perform = false;
  var score = Math.max(40, 100 - CH51.steals * 15);
  var label = CH51.baskets + (CH51.baskets === 1 ? ' basket' : ' baskets') + ', ' +
              CH51.steals + (CH51.steals === 1 ? ' steal' : ' steals');
  saveGame();
  cleared(51, score, label);
}

// ------------------------------------------------------------------- input

ACTION_HOOKS.push(function () {
  if (G.level !== 'ch51' || DLG.active) return false;
  if (G.sceneId === 'c51_blacktop' && CH51.phase === 'layup') return ch51LayupAction();
  if (G.sceneId === 'c51_court' && CH51.phase === 'play' && CH51.cool <= 0 && !CH51.pass) {
    ch51Pass();
    return true;
  }
  return false;
});

// --------------------------------------------------------------------- HUD

// a small dark plate so a prompt stays readable over the blacktop
function ch51Plate(c, text, colour) {
  c.textAlign = 'center';
  c.font = 'bold 7px monospace';
  var w = c.measureText(text).width + 16;
  c.fillStyle = 'rgba(18,16,28,0.82)';
  c.fillRect(W / 2 - w / 2, H - 58, w, 14);
  c.fillStyle = colour;
  c.fillText(text, W / 2, H - 48);
  c.textAlign = 'left';
}

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch51') return;

  if (G.sceneId === 'c51_blacktop' && CH51.phase === 'layup') {
    c.textAlign = 'center';
    c.font = 'bold 8px monospace';
    c.fillStyle = 'rgba(18,16,28,0.72)';
    c.fillRect(W / 2 - 52, 20, 104, 12);
    c.fillStyle = '#f0e4c0';
    c.fillText('LAYUPS ' + Math.min(CH51.shots, 3) + ' / 3   SWISH ' + CH51.swishes, W / 2, 29);
    if (CH51.aiming) {
      var bw = 190, bh = 12, bx = (W - bw) / 2, by = H - 40;
      c.fillStyle = 'rgba(18,16,28,0.88)';
      c.fillRect(bx - 3, by - 3, bw + 6, bh + 6);
      c.fillStyle = '#2a2438';
      c.fillRect(bx, by, bw, bh);
      c.fillStyle = 'rgba(120,200,140,0.75)';
      c.fillRect(bx + CH51.zoneA * bw, by, (CH51.zoneB - CH51.zoneA) * bw, bh);
      c.fillStyle = 'rgba(255,255,255,0.12)';
      c.fillRect(bx, by, bw, 1);
      var nx = bx + CH51.bar * bw;
      c.fillStyle = '#fff3c4';
      c.fillRect(nx - 1.5, by - 5, 3, bh + 10);
      c.strokeStyle = 'rgba(244,228,192,0.55)';
      c.lineWidth = 1;
      c.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      c.font = 'bold 7px monospace';
      c.fillStyle = '#f4efe4';
      c.fillText('STOP IT IN THE GREEN', W / 2, by - 8);
    } else if (ch51NearHoop()) {
      ch51Plate(c, 'E: SHOOT THE LAYUP', '#f6ecd8');
    } else if (!CH51.done) {
      ch51Plate(c, 'walk to the hoop', 'rgba(230,224,204,0.9)');
    }
    c.textAlign = 'left';
    return;
  }

  if (G.sceneId === 'c51_court' && (CH51.phase === 'play' || CH51.phase === 'done')) {
    // one panel bottom left: the scoreline and the two numbers behind the medal
    var bx2 = 6, by2 = H - 58, bw2 = 118, bh2 = 30;
    c.fillStyle = 'rgba(18,16,28,0.84)';
    c.fillRect(bx2, by2, bw2, bh2);
    c.strokeStyle = 'rgba(240,192,96,0.35)';
    c.lineWidth = 1;
    c.strokeRect(bx2 + 0.5, by2 + 0.5, bw2 - 1, bh2 - 1);
    c.textAlign = 'left';
    c.font = 'bold 8px monospace';
    c.fillStyle = '#9be08a';
    c.fillText('MAV ' + CH51.home, bx2 + 6, by2 + 11);
    c.fillStyle = '#f0a0a0';
    c.fillText('NUTS ' + CH51.away, bx2 + 64, by2 + 11);
    c.font = '5px monospace';
    c.fillStyle = 'rgba(240,228,192,0.72)';
    c.fillText('BASKETS ' + CH51.baskets, bx2 + 6, by2 + 22);
    c.fillText('STEALS ' + CH51.steals, bx2 + 66, by2 + 22);

    if (CH51.phase === 'play') {
      if (CH51.laneClear) {
        ch51Plate(c, 'E: PASS IT', '#9be08a');
      } else {
        ch51Plate(c, 'LANE BLOCKED. MOVE!', Math.sin(G.time * 12) > 0 ? '#ff9a9a' : '#e88080');
      }
    }
    c.textAlign = 'left';
  }
});

// ------------------------------------------------------------------ in world

PLAYER_HOOKS.push(function (c) {
  if (G.level !== 'ch51') return;

  // ---- blacktop: the ball at Mav's hip, and a ring on the rim
  if (G.sceneId === 'c51_blacktop') {
    var bob = Math.sin(G.time * 5) * 1.5;
    c.fillStyle = '#c8642a';
    c.beginPath();
    c.arc(G.px + (G.dir === 'left' ? -12 : 12), G.py - 14 + bob, 4, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#8a3a12';
    c.lineWidth = 1;
    c.beginPath();
    c.arc(G.px + (G.dir === 'left' ? -12 : 12), G.py - 14 + bob, 4, 0, Math.PI * 2);
    c.stroke();
    if (CH51.phase === 'layup' && !CH51.aiming) {
      var near = ch51NearHoop();
      c.save();
      c.globalAlpha = near ? 0.55 + 0.35 * Math.sin(G.time * 7) : 0.18;
      c.strokeStyle = near ? '#9be08a' : 'rgba(240,228,192,0.6)';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(CH51_RIM.x, CH51_RIM.y + 4, near ? 16 : 12, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }
    return;
  }

  if (G.sceneId !== 'c51_court') return;

  // ---- the lane, drawn from Mav to whichever monke is open
  var m = ch51OpenMate();
  if (m && CH51.phase === 'play') {
    var clear = CH51.laneClear;
    var ax = G.px, ay = G.py - 18, bx = m.px, by = m.py - 18;
    var len = Math.hypot(bx - ax, by - ay);
    var nx = (bx - ax) / (len || 1), ny = (by - ay) / (len || 1);
    c.strokeStyle = clear ? 'rgba(155,224,138,0.55)' : 'rgba(255,132,132,0.55)';
    c.lineWidth = 1;
    for (var d = 10; d < len - 6; d += 10) {
      c.beginPath();
      c.moveTo(ax + nx * d, ay + ny * d);
      c.lineTo(ax + nx * (d + 5), ay + ny * (d + 5));
      c.stroke();
    }
    // the open monke gets a ring and a countdown
    var pulse = 0.45 + 0.35 * Math.sin(G.time * 6);
    c.save();
    c.globalAlpha = pulse;
    c.strokeStyle = clear ? '#9be08a' : '#ff8484';
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(m.px, m.py - 1, 15, 6, 0, 0, Math.PI * 2);
    c.stroke();
    c.restore();
    // window bar over their head
    var wlen = 34, wx = m.px - wlen / 2, wy = m.py - 46;
    c.fillStyle = 'rgba(18,16,28,0.75)';
    c.fillRect(wx - 1, wy - 1, wlen + 2, 5);
    c.fillStyle = CH51.windowT / CH51.windowLen > 0.35 ? '#8ac06a' : '#e8a060';
    c.fillRect(wx, wy, wlen * Math.max(0, Math.min(1, CH51.windowT / CH51.windowLen)), 3);
    c.textAlign = 'center';
    c.font = 'bold 6px monospace';
    c.fillStyle = clear ? '#9be08a' : '#ff9a9a';
    c.fillText(clear ? 'OPEN' : 'COVERED', m.px, wy - 4);
    c.textAlign = 'left';
  }

  // ---- the ball: in Mav's hands, then in the air
  if (CH51.pass) {
    var p = CH51.pass;
    var q = 1 - Math.max(0, p.t) / p.max;
    var bx2 = p.x0 + (p.x1 - p.x0) * q;
    var by2 = p.y0 + (p.y1 - p.y0) * q - Math.sin(q * Math.PI) * 26;
    c.fillStyle = '#c8642a';
    c.beginPath();
    c.arc(bx2, by2, 4, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#7a3410';
    c.lineWidth = 1;
    c.beginPath();
    c.arc(bx2, by2, 4, 0, Math.PI * 2);
    c.stroke();
    return;
  }
  if (CH51.phase === 'play' || CH51.phase === 'done') {
    var bob2 = Math.sin(G.time * 6) * 1.6;
    var hx = G.px + (G.dir === 'left' ? -13 : 13);
    c.fillStyle = '#c8642a';
    c.beginPath();
    c.arc(hx, G.py - 15 + bob2, 4, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#7a3410';
    c.lineWidth = 1;
    c.beginPath();
    c.arc(hx, G.py - 15 + bob2, 4, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.moveTo(hx - 4, G.py - 15 + bob2);
    c.lineTo(hx + 4, G.py - 15 + bob2);
    c.stroke();
  }
});

// the chase in the background of the last scene keeps running
TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch51' || G.sceneId !== 'c51_end') return;
  var ch = ch51Ent('c51_chase');
  if (!ch) return;
  ch.chaseX = ((ch.chaseX || 0) + dt * 26) % 380;
  var kid = ch51Ent('c51_kid1');
  if (kid) kid.moving = false;
});

// ----------------------------------------------------------------- chapter

CHAPTER_CONTENT[51] = {
  start: 'c51_blacktop',

  intro: function () {
    chapterCard('CHAPTER FIFTY ONE', 'The Squirrel Sashimi Showdown', 3.2);
    ch51Reset();
    G.flags.c51_lesson = false;
    G.flags.c51_sing = false;
    G.flags.c51_burst = false;
    G.flags.c51_gate = false;
    setTimeout(function () {
      if (G.level !== 'ch51') return;
      say([
        { who: 'narrator', text: 'Chapter fifty one. In which a beaver doll sings, a fountain gives up, and one squirrel is bitten in front of a school.' },
        { who: 'narrator', text: 'After a chaotic day of fifth grade, Mav and the Professor headed straight for the blacktop behind Clovis Elementary to work on their fundamentals.' }
      ]);
    }, 900);
  },

  resume: function () {
    CH51.aiming = false;
    if (G.sceneId === 'c51_court' && !CH51.done) {
      CH51.phase = 'idle';
      G.perform = false;
      G.flags.c51_gate = true;
    } else if (G.sceneId === 'c51_end') {
      G.flags.c51_endgate = true;
    } else if (G.sceneId === 'c51_blacktop') {
      CH51.phase = G.flags.c51_sing ? 'sing' : (G.flags.c51_lesson ? 'layup' : 'idle');
      G.perform = false;
    }
  },

  objective: function () {
    if (G.sceneId === 'c51_blacktop') {
      if (G.flags.c51_sing) return 'objective: talk to Bucktooth';
      if (!G.flags.c51_lesson) return 'objective: talk to Professor Bucktooth';
      return CH51.aiming ? 'objective: stop the bar in the green' : 'objective: three layups (press E by the hoop)';
    }
    if (G.sceneId === 'c51_court') {
      if (CH51.phase === 'play') return 'objective: pass to the open monke, first to ' + CH51_TARGET;
      return '';
    }
    return '';
  }
};
