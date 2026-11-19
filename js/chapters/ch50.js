// ch50.js - Chapter 50: Mav and the Substitute's Underworld Sabbatical
//
// Three scenes and two jobs. A sprint across Clovis before the bell, with a
// hall pass to grab on the way, then Room 14, where a substitute and a kid with
// a bowl cut go to war and the only weapon Mav has is a hand puppet with a
// rhyme problem.
//
//   c50_room    the bedroom at 8:02, a frying pan, no time
//   c50_street  the sprint, eight neighbours, the hall pass, one pigeon
//   c50_room14  Room 14, The Burt, Joel, and the friendship hose
//
// The Room 14 game is two bars, not one. A couplet aimed at a man cools him
// down and irritates the other one, so the player has to keep swapping targets
// while dodging whatever is currently flying across the room.

NAMES.burt = 'THE BURT';
NAMES.joel = 'JOEL';
NAMES.pigeon50 = 'PIGEON';

var C50_SECONDS = 40;     // the argument runs this long before Joel snaps
var C50_RISE = 1.8;       // how fast both men get worse, per second
var C50_CALM = 19;        // a couplet aimed at a man cools him this much
var C50_SPITE = 4;        // and winds the other one up this much
var C50_COOL = 1.1;       // seconds between couplets
var C50_REACH = 70;       // how close Mav must stand to point the doll

// ------------------------------------------------------------------- state

var CH50 = {
  on: false,          // the counselling is running
  over: false,        // the book has come out
  t: 0,
  burt: 22,
  joel: 26,
  burtPeak: 22,
  joelPeak: 26,
  cool: 0,
  shots: 0,
  landed: 0,          // couplets that hit a person
  harmony: 0,         // seconds both men under a quarter
  coolSum: 0,         // integral of calm, for the score
  hits: 0,            // times Mav got hit by something thrown
  throws: [],
  nextThrow: 0,       // countdown to the next thing in the air
  warn: null,         // { sx, sy, tx, ty, t, kind }
  soaked: false,      // the sprinklers went off
  early: false,       // Joel opened the book out of boredom
  sayText: '', sayT: 0, sayX: 0, sayY: 0,
  bumpT: 0
};

var C50_COUPLETS = [
  { to: 'burt', word: 'SEAL!', line: 'Sir, your feelings are valid and real, and also your moustache looks like a seal!' },
  { to: 'burt', word: 'CHAIR!', line: 'A grown man screams, a grown man grieves, but please stop throwing the wooden chairs!' },
  { to: 'burt', word: 'PLANS!', line: 'A reservation for two is a beautiful thing, but sir, you have to stop the shouting!' },
  { to: 'joel', word: 'BREATHE!', line: 'Young man with the bowl shaped hair, put down the book and breathe some air!' },
  { to: 'joel', word: 'ARMS!', line: 'Uncross the arms, unlock the frown, you are the angriest kid in town!' },
  { to: 'joel', word: 'FRIEND!', line: 'Boredom is not a personality, friend, and this is not how the story should end!' }
];

var C50_JUNK = ['GLOBE', 'PROTRACTOR', 'PUDDING', 'ERASER', 'TEXTBOOK', 'GLUE STICK'];

var C50_BUMP_LINES = {
  dog50: 'KEVIN SAYS HI',
  nana50: 'MIND THE VEST',
  postman50: 'SPECIAL DELIVERY',
  skater50: 'MY BAD DUDE',
  cat50: 'MRRP',
  clerk50: 'WELCOME TO ARBYS',
  gnome50: 'HEE HEE',
  pigeon50: 'COO'
};

function c50Reset() {
  CH50.on = false;
  CH50.over = false;
  CH50.t = 0;
  CH50.burt = 22;
  CH50.joel = 26;
  CH50.burtPeak = 22;
  CH50.joelPeak = 26;
  CH50.cool = 0;
  CH50.shots = 0;
  CH50.landed = 0;
  CH50.harmony = 0;
  CH50.coolSum = 0;
  CH50.hits = 0;
  CH50.throws.length = 0;
  CH50.nextThrow = 3.2;
  CH50.warn = null;
  CH50.soaked = false;
  CH50.early = false;
  CH50.sayT = 0;
  G.flags.c50_burt = 0;
  G.flags.c50_joel = 0;
  G.perform = false;
}

// -------------------------------------------------------------- bedroom art

TILE_HOOKS.push(function (c, kind, tx, ty) {
  if (G.level !== 'ch50') return false;
  var x = tx * TILE, y = ty * TILE, r = hash(tx, ty, 71);
  if (kind === 'c50Wall') {
    c.fillStyle = r > 0.5 ? '#8fa8c4' : '#8aa3bf';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(255,255,255,0.10)';
    for (var i = 0; i < 3; i++) c.fillRect(x + 3 + i * 5, y + 4, 1, 1);
    if (ty === 0) { c.fillStyle = '#6d84a0'; c.fillRect(x, y, TILE, 3); }
    if (ty === 5) {
      c.fillStyle = '#f2eee2';
      c.fillRect(x, y + 12, TILE, 4);
      c.fillStyle = '#c9c2b0';
      c.fillRect(x, y + 12, TILE, 1);
    }
    return true;
  }
  if (kind === 'c50Floor') {
    c.fillStyle = r > 0.5 ? '#9a7448' : '#936e44';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(60,40,20,0.28)';
    c.fillRect(x, y + 15, TILE, 1);
    c.fillStyle = 'rgba(255,230,190,0.07)';
    if (r > 0.6) c.fillRect(x + 2, y + 6, 9, 1);
    return true;
  }
  // the street: pavement, road, then the school's brick face
  if (kind === 'c50Grass') {
    c.fillStyle = r > 0.5 ? '#6f9448' : '#6a8e44';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(150,190,110,0.20)';
    if (r > 0.55) c.fillRect(x + 3, y + 4, 2, 1);
    if (r > 0.75) c.fillRect(x + 9, y + 11, 3, 1);
    c.fillStyle = 'rgba(40,60,30,0.18)';
    c.fillRect(x, y + 15, TILE, 1);
    return true;
  }
  if (kind === 'c50Pave') {
    c.fillStyle = r > 0.5 ? '#b9b4a8' : '#b3aea2';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(80,76,68,0.18)';
    c.fillRect(x, y, TILE, 1);
    c.fillRect(x, y, 1, TILE);
    return true;
  }
  if (kind === 'c50Road') {
    c.fillStyle = r > 0.5 ? '#4a4a52' : '#45454d';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(20,20,24,0.22)';
    if (r > 0.7) c.fillRect(x + 4, y + 9, 6, 1);
    // a lane stripe down the middle of the road
    if (ty === 9 && tx % 4 < 2) {
      c.fillStyle = 'rgba(230,220,180,0.35)';
      c.fillRect(x + 1, y + 6, 13, 3);
    }
    return true;
  }
  if (kind === 'c50Brick') {
    c.fillStyle = '#8c5a4a';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(240,220,200,0.14)';
    for (var b = 0; b < 4; b++) c.fillRect(x, y + b * 4, TILE, 1);
    c.fillStyle = 'rgba(40,20,14,0.18)';
    c.fillRect(x + ((ty % 2) ? 8 : 0), y + 4, 1, 3);
    return true;
  }
  if (kind === 'c50ClassFloor') {
    c.fillStyle = r > 0.5 ? '#c8c2ae' : '#c2bca8';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(120,116,100,0.16)';
    c.fillRect(x, y, TILE, 1);
    c.fillRect(x, y, 1, TILE);
    for (var f2 = 0; f2 < 2; f2++) {
      if (hash(tx + f2, ty, 13) > 0.72) {
        c.fillStyle = 'rgba(150,146,128,0.35)';
        c.fillRect(x + 4 + f2 * 6, y + 5, 1, 1);
      }
    }
    return true;
  }
  return false;
});

// ------------------------------------------------------------------- props

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (k !== 'c50Bed' && k !== 'c50Clock' && k !== 'c50Window' && k !== 'c50Desk' &&
      k !== 'c50Board' && k !== 'c50Podium' && k !== 'c50DeskRow' &&
      k !== 'c50Scorch' && k !== 'c50School' && k !== 'c50SignBurt' &&
      k !== 'c50Pass' && k !== 'c50Fence' && k !== 'c50Applebees' &&
      k !== 'c50Pigeon' && k !== 'c50Bag' && k !== 'c50Tree' &&
      k !== 'c50Window14' && k !== 'c50Poster') return false;
  var P = propPainter(c, e);

  if (k === 'c50Bed') {
    P(-26, -4, 52, 6, 'rgba(0,0,0,0.20)');
    P(-28, -12, 56, 10, '#6a4a34');
    P(-28, -30, 56, 20, '#8b6a4c');
    P(-26, -28, 52, 16, '#c8d8ee');
    P(-24, -26, 30, 12, '#dfeaf8');
    P(-8, -24, 30, 10, '#e8f0fa');
    P(-26, -32, 20, 8, '#f4f8ff');       // pillow
    P(-28, -12, 4, 10, '#5a3e2a');
    P(24, -12, 4, 10, '#5a3e2a');
    return true;
  }

  if (k === 'c50Window') {
    // morning out the window, so the wall is not a flat blue field
    P(-26, -36, 52, 36, '#f2eee2');
    P(-23, -33, 46, 30, '#8fb4d8');
    P(-23, -33, 46, 12, '#b6d0e8');
    P(-14, -26, 10, 5, '#fdfaf0');           // a cloud
    P(-12, -27, 6, 3, '#ffffff');
    P(-1, -33, 2, 30, '#f2eee2');            // mullions
    P(-23, -19, 46, 2, '#f2eee2');
    P(-26, -2, 52, 4, '#e6e0d0');            // sill
    P(-30, -38, 8, 40, '#6d84a0');           // curtains
    P(22, -38, 8, 40, '#6d84a0');
    return true;
  }

  if (k === 'c50Clock') {
    P(-9, -16, 18, 16, '#2a2a32');
    P(-8, -15, 16, 9, '#8a1f1f');
    P(-7, -14, 14, 7, '#c03030');
    P(-6, -13, 4, 2, '#ff9a9a');
    P(-9, -6, 18, 5, '#3a3a44');
    c.save();
    c.fillStyle = '#ffd0d0';
    c.font = 'bold 5px monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('8:02', e.px, e.py - 10.5);
    c.restore();
    return true;
  }

  if (k === 'c50Desk') {
    P(-20, -2, 40, 4, 'rgba(0,0,0,0.18)');
    P(-20, -12, 40, 10, '#7a5a3a');
    P(-18, -11, 36, 7, '#96704a');
    P(-18, -3, 3, 5, '#5e442c');
    P(15, -3, 3, 5, '#5e442c');
    P(-6, -16, 12, 4, '#e8e2d0');        // notebook
    return true;
  }

  if (k === 'c50Bag') {
    // the backpack, heavier than it should be
    P(-8, -2, 16, 3, 'rgba(0,0,0,0.20)');
    P(-8, -16, 16, 14, '#3f5a86');
    P(-6, -14, 12, 10, '#4d6c9e');
    P(-6, -9, 12, 3, '#33496f');
    P(-3, -19, 6, 3, '#2c3f5f');
    return true;
  }

  if (k === 'c50School') {
    // the school frontage, so the sprint has a destination you can see
    P(-92, -70, 184, 70, '#8c5a4a');
    P(-92, -70, 184, 6, '#6d4438');
    P(-92, -70, 6, 70, '#a06a58');
    P(86, -70, 6, 70, '#a06a58');
    for (var wy = 0; wy < 2; wy++) {
      for (var wx = 0; wx < 4; wx++) {
        P(-74 + wx * 40, -56 + wy * 26, 22, 18, '#3a4a5a');
        P(-73 + wx * 40, -55 + wy * 26, 20, 16, '#5a7488');
        P(-64 + wx * 40, -55 + wy * 26, 2, 16, '#3a4a5a');
      }
    }
    P(-16, -34, 32, 34, '#5a3a2a');       // doors
    P(-14, -32, 28, 30, '#7a5238');
    P(-2, -32, 3, 30, '#4a2e20');
    P(-30, -78, 60, 10, '#c8bca0');       // sign board
    P(-27, -75, 54, 4, '#5a5040');
    c.save();
    c.fillStyle = '#4a4030';
    c.font = 'bold 5px monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('CLOVIS ELEMENTARY', e.px, e.py - 73);
    c.restore();
    return true;
  }

  if (k === 'c50Board') {
    // the blackboard, one wide prop so the chalk lines do not tile
    P(-80, -58, 160, 58, '#463c2c');
    P(-77, -55, 154, 52, '#2f3d34');
    P(-77, -55, 154, 2, '#4a5c50');
    P(-70, -46, 60, 1, 'rgba(240,240,230,0.55)');
    P(-70, -40, 92, 1, 'rgba(240,240,230,0.40)');
    P(-70, -34, 48, 1, 'rgba(240,240,230,0.35)');
    P(-70, -28, 76, 1, 'rgba(240,240,230,0.30)');
    P(-74, -8, 148, 4, '#6a5a40');        // chalk rail
    P(-30, -7, 10, 3, '#f0ece0');
    P(24, -7, 8, 3, '#e8d060');
    return true;
  }

  if (k === 'c50Podium') {
    P(-18, -2, 36, 4, 'rgba(0,0,0,0.20)');
    P(-16, -26, 32, 24, '#6a4a30');
    P(-14, -24, 28, 8, '#8a6442');
    P(-20, -28, 40, 4, '#96704a');
    P(-6, -32, 12, 4, '#e8e2d0');         // the textbook
    return true;
  }

  if (k === 'c50DeskRow') {
    // a pupil desk, seen from the front, built to sit in rows
    P(-14, -2, 28, 4, 'rgba(0,0,0,0.16)');
    P(-14, -14, 28, 8, '#a9855c');
    P(-12, -13, 24, 5, '#c9a373');
    P(-12, -6, 2, 5, '#6a5038');
    P(10, -6, 2, 5, '#6a5038');
    P(-10, -7, 20, 1, '#6a5038');
    return true;
  }

  if (k === 'c50Scorch') {
    P(-16, -6, 32, 8, 'rgba(30,20,16,0.55)');
    P(-11, -9, 22, 5, 'rgba(60,30,20,0.45)');
    P(-6, -11, 12, 3, 'rgba(20,12,10,0.40)');
    return true;
  }

  if (k === 'c50SignBurt') {
    P(-22, -14, 44, 14, '#f0e8d0');
    P(-20, -12, 40, 10, '#d8342f');
    c.save();
    c.fillStyle = '#fff4e0';
    c.font = 'bold 7px monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('ROOM 14', e.px, e.py - 6);
    c.restore();
    return true;
  }

  if (k === 'c50Applebees') {
    // the tripod sign on the corner, and the whole backstory in four lines
    P(-3, -30, 2, 30, '#8a8a92');          // pole
    P(-11, -2, 22, 3, '#6a6a72');          // feet
    P(-14, -34, 28, 22, '#f0ece4');
    P(-13, -33, 26, 20, '#b8322c');
    c.save();
    c.fillStyle = '#fff2e0';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = 'bold 4px monospace';
    c.fillText('APPLEBEES', e.px, e.py - 30);
    c.font = 'bold 3px monospace';
    c.fillText('RESERVED 8 PM', e.px, e.py - 25);
    c.fillStyle = '#f6d878';
    c.fillText('THE BURT', e.px, e.py - 20);
    c.restore();
    return true;
  }

  if (k === 'c50Fence') {
    // chain link, with the official Room 14 hall pass hooked over the top
    P(-20, -3, 40, 4, 'rgba(0,0,0,0.18)');
    P(-19, -36, 3, 36, '#8a8f96');
    P(17, -36, 3, 36, '#8a8f96');
    P(-19, -36, 39, 2, '#a8aeb6');
    P(-19, -22, 39, 1, '#6f757c');
    P(-19, -6, 39, 1, '#6f757c');
    c.save();
    c.strokeStyle = 'rgba(160,166,174,0.32)';
    c.lineWidth = 0.5;
    for (var fx = -17; fx < 17; fx += 6) {
      c.beginPath(); c.moveTo(e.px + fx, e.py - 34); c.lineTo(e.px + fx + 6, e.py); c.stroke();
      c.beginPath(); c.moveTo(e.px + fx + 6, e.py - 34); c.lineTo(e.px + fx, e.py); c.stroke();
    }
    c.restore();
    if (!G.flags.c50_pass) {
      // a wooden toilet seat, painted by someone who hated the job, and a
      // highlight so it never reads as fence decoration
      var glow = 0.35 + 0.25 * Math.sin(G.time * 4);
      c.save();
      c.globalAlpha = glow;
      c.strokeStyle = '#f6e08a';
      c.lineWidth = 1.5;
      c.beginPath(); c.ellipse(e.px, e.py - 15, 15, 13, 0, 0, Math.PI * 2); c.stroke();
      c.restore();
      c.save();
      c.translate(e.px, e.py - 15);
      c.fillStyle = 'rgba(0,0,0,0.25)';
      c.beginPath(); c.ellipse(1, 1, 11, 9, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#e0c89c';
      c.beginPath(); c.ellipse(0, 0, 11, 9, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#f4e6c8';
      c.beginPath(); c.ellipse(-1, -1, 10, 8, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#8a7450';
      c.beginPath(); c.ellipse(0, 0, 5, 4, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#f4efe0';
      c.font = 'bold 4px monospace';
      c.textAlign = 'center';
      c.fillText('ROOM 14', 0, -11);
      c.restore();
    }
    return true;
  }

  if (k === 'c50Tree') {
    P(-3, -6, 6, 6, 'rgba(0,0,0,0.20)');
    P(-2, -26, 4, 24, '#6a4a30');          // trunk
    P(-4, -28, 8, 4, '#7a5a3a');
    c.fillStyle = '#4a7a3a';
    c.beginPath(); c.arc(e.px, e.py - 34, 13, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#5a8e46';
    c.beginPath(); c.arc(e.px - 6, e.py - 38, 9, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(e.px + 7, e.py - 36, 8, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(180,220,140,0.35)';
    c.fillRect(Math.round(e.px - 4), Math.round(e.py - 44), 3, 2);
    return true;
  }

  if (k === 'c50Window14') {
    // the rear window, and the hole a five pound textbook made in it
    P(-22, -34, 44, 34, '#efe9da');
    P(-20, -32, 40, 30, '#7fa8cc');
    P(-20, -32, 40, 10, '#a8c4dc');
    P(-1, -32, 2, 30, '#efe9da');
    P(-20, -19, 40, 2, '#efe9da');
    P(-22, -2, 44, 4, '#e0d8c4');
    // shattered pane, upper right
    c.fillStyle = '#2a3a4a';
    c.beginPath();
    c.moveTo(e.px + 2, e.py - 31);
    c.lineTo(e.px + 18, e.py - 28);
    c.lineTo(e.px + 12, e.py - 22);
    c.lineTo(e.px + 19, e.py - 19);
    c.lineTo(e.px + 2, e.py - 20);
    c.closePath();
    c.fill();
    c.strokeStyle = 'rgba(240,248,255,0.55)';
    c.lineWidth = 0.5;
    c.beginPath(); c.moveTo(e.px + 2, e.py - 31); c.lineTo(e.px + 8, e.py - 26); c.stroke();
    c.beginPath(); c.moveTo(e.px + 18, e.py - 28); c.lineTo(e.px + 14, e.py - 24); c.stroke();
    return true;
  }

  if (k === 'c50Poster') {
    // a laminated poster about the water cycle, slightly older than the school
    P(-11, -22, 22, 22, '#e8e0c8');
    P(-10, -21, 20, 20, '#dfe8f0');
    c.fillStyle = '#5a8ec0';
    c.fillRect(Math.round(e.px - 8), Math.round(e.py - 18), 16, 5);
    c.fillStyle = '#7ab06a';
    c.fillRect(Math.round(e.px - 8), Math.round(e.py - 12), 16, 8);
    c.fillStyle = '#c8a040';
    c.fillRect(Math.round(e.px - 6), Math.round(e.py - 3), 12, 1);
    return true;
  }

  if (k === 'c50Pigeon') {
    // tiny, unbothered, going places
    var hop = Math.sin(G.time * 3 + (e.tx || 0)) * 1.5;
    var bx = Math.round(e.px), by = Math.round(e.py - 8 + hop);
    P(-3, -1, 6, 1, 'rgba(0,0,0,0.22)');
    c.fillStyle = '#8d94a0';
    c.beginPath(); c.ellipse(bx, by, 4.5, 3.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#6f7682';
    c.beginPath(); c.ellipse(bx - 3, by - 2, 2.2, 2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#e8c060';
    c.fillRect(bx - 5, by - 2, 2, 1);
    c.fillStyle = '#c85a4a';
    c.fillRect(bx - 4, by - 4, 1, 1);
    c.fillStyle = '#6f7682';
    c.fillRect(bx + 3, by - 1, 2, 1);
    return true;
  }
  return false;
});

// ------------------------------------------------------------------ scenes

SCENES.c50_room = {
  title: '8:02 AM',
  spawn: { tx: 16, ty: 14, dir: 'up' },
  camZoom: 1,
  fill: 'c50Floor',
  rects: [
    { x: 0, y: 0, w: 32, h: 6, t: 'c50Wall' },
    { x: 0, y: 6, w: 1, h: 12, t: 'c50Wall' },
    { x: 31, y: 6, w: 1, h: 12, t: 'c50Wall' },
    { x: 0, y: 17, w: 32, h: 1, t: 'c50Wall' }
  ],
  solidKinds: ['c50Wall'],
  entities: [
    { id: 'win50', who: null, tx: 16, ty: 5, kind: 'c50Window', noSolid: true, propScale: 1 },
    { id: 'bed50', who: null, tx: 7, ty: 9, kind: 'c50Bed', solid: true, sw: 4, sh: 2, propScale: 1 },
    { id: 'clock50', who: null, tx: 11, ty: 9, kind: 'c50Clock', noSolid: true, propScale: 1 },
    { id: 'desk50', who: null, tx: 24, ty: 9, kind: 'c50Desk', solid: true, sw: 3, sh: 1, propScale: 1 },
    { id: 'bag50', who: null, tx: 24, ty: 8, kind: 'c50Bag', noSolid: true, propScale: 1 },
    { id: 'buck50', who: 'bucktooth_puppet', tx: 20, ty: 10, dir: 'down', reach: 60, talk: 'ch50Pan' },
    { id: 'exit50', exit: { to: 'c50_street', tx: 2, ty: 13, dir: 'right' }, tx: 16, ty: 16, rect: { w: 3, h: 1 } }
  ],
  overlay: function (c) {
    // early morning light through the window, and the room still dim
    c.fillStyle = 'rgba(30,40,70,0.18)';
    c.fillRect(0, 0, W, H);
    var g = c.createRadialGradient(150, 40, 10, 150, 40, 190);
    g.addColorStop(0, 'rgba(255,232,180,0.18)');
    g.addColorStop(1, 'rgba(255,232,180,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
};

SCENES.c50_street = {
  title: 'THE SPRINT',
  spawn: { tx: 2, ty: 14, dir: 'right' },
  camZoom: 1,
  fill: 'c50Pave',
  rects: [
    { x: 0, y: 0, w: 32, h: 4, t: 'c50Brick' },   // the houses
    { x: 0, y: 4, w: 32, h: 3, t: 'c50Grass' },   // front lawns
    { x: 0, y: 7, w: 32, h: 1, t: 'c50Pave' },    // near curb
    { x: 0, y: 8, w: 32, h: 4, t: 'c50Road' },    // the road
    { x: 0, y: 12, w: 32, h: 1, t: 'c50Pave' },   // far curb
    { x: 0, y: 13, w: 32, h: 4, t: 'c50Pave' },   // school side sidewalk
    { x: 0, y: 17, w: 32, h: 1, t: 'c50Brick' }
  ],
  solidKinds: ['c50Brick'],
  entities: [
    { id: 'tree1', who: null, tx: 5, ty: 5, kind: 'c50Tree', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'tree2', who: null, tx: 12, ty: 5, kind: 'c50Tree', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'tree3', who: null, tx: 24, ty: 5, kind: 'c50Tree', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'school50', who: null, tx: 28, ty: 15, kind: 'c50School', noSolid: true, propScale: 1, reach: 40, talk: 'ch50Late' },
    { id: 'sign50', who: null, tx: 26, ty: 14, kind: 'c50SignBurt', noSolid: true, propScale: 1 },
    // the whole backstory, on a tripod, on the corner
    { id: 'applebee50', who: null, tx: 15, ty: 13, kind: 'c50Applebees', noSolid: true, propScale: 1, reach: 34, talk: 'ch50Sign' },
    // the hall pass, hanging on a fence, on the way
    { id: 'fence50', who: null, tx: 20, ty: 13, kind: 'c50Fence', noSolid: true, propScale: 1, reach: 34, talk: 'ch50Pass' },
    { id: 'pigeon50', who: null, tx: 6, ty: 15, kind: 'c50Pigeon', noSolid: true, propScale: 1, hidden: true },
    // eight things in the way, all drifting
    { id: 'dog50', who: 'kevin', tx: 6, ty: 15, dir: 'down', drift: 22 },
    { id: 'nana50', who: 'wallaby', tx: 9, ty: 14, dir: 'down', drift: 12 },
    { id: 'postman50', who: 'nutkin', tx: 12, ty: 15, dir: 'down', drift: 26 },
    { id: 'skater50', who: 'adrian', tx: 16, ty: 14, dir: 'down', drift: 34 },
    { id: 'cat50', who: 'nibbles', tx: 18, ty: 16, dir: 'down', drift: 30, small: true },
    { id: 'clerk50', who: 'clerk', tx: 22, ty: 15, dir: 'down', drift: 18 },
    { id: 'gnome50', who: 'gnome', tx: 24, ty: 16, dir: 'down', drift: 15, small: true },
    { id: 'buck50b', who: 'bucktooth_puppet', tx: 4, ty: 14, dir: 'down', hidden: false },
    { id: 'exitSchool', exit: { to: 'c50_room14', tx: 16, ty: 14, dir: 'up' }, tx: 30, ty: 13, rect: { w: 2, h: 3 } }
  ],
  overlay: function (c) {
    // morning, long shadows, and the school waiting at the end of the street
    c.fillStyle = 'rgba(255,214,150,0.10)';
    c.fillRect(0, 0, W, H);
    for (var i = 0; i < 6; i++) {
      c.fillStyle = 'rgba(255,236,190,0.07)';
      c.fillRect(220 + i * 34, 150, 20, 90);
    }
  }
};

SCENES.c50_room14 = {
  title: 'ROOM 14',
  spawn: { tx: 16, ty: 15, dir: 'up' },
  camZoom: 1,
  fill: 'c50ClassFloor',
  rects: [
    { x: 0, y: 0, w: 32, h: 8, t: 'c50Wall' },
    { x: 0, y: 0, w: 1, h: 18, t: 'c50Wall' },
    { x: 31, y: 0, w: 1, h: 18, t: 'c50Wall' },
    { x: 0, y: 17, w: 32, h: 1, t: 'c50Wall' }
  ],
  solidKinds: ['c50Wall'],
  entities: [
    { id: 'board50', who: null, tx: 16, ty: 4, kind: 'c50Board', noSolid: true, propScale: 1 },
    { id: 'win14', who: null, tx: 25, ty: 5, kind: 'c50Window14', noSolid: true, propScale: 1 },
    { id: 'poster14', who: null, tx: 4, ty: 5, kind: 'c50Poster', noSolid: true, propScale: 1 },
    { id: 'podium50', who: null, tx: 10, ty: 8, kind: 'c50Podium', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'burt50', who: 'burt', tx: 10, ty: 7, dir: 'down', reach: 64, talk: 'ch50Burt' },
    { id: 'joel50', who: 'joel', tx: 26, ty: 10, dir: 'left', reach: 56, talk: 'ch50Joel' },
    { id: 'row1a', who: null, tx: 7, ty: 11, kind: 'c50DeskRow', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'row1b', who: null, tx: 12, ty: 11, kind: 'c50DeskRow', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'row1c', who: null, tx: 17, ty: 11, kind: 'c50DeskRow', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'row2a', who: null, tx: 7, ty: 14, kind: 'c50DeskRow', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'row2b', who: null, tx: 13, ty: 14, kind: 'c50DeskRow', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'row2c', who: null, tx: 20, ty: 14, kind: 'c50DeskRow', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'kid50a', who: 'kevin', tx: 8, ty: 10, dir: 'down', small: true },
    { id: 'kid50b', who: 'nibbles', tx: 14, ty: 10, dir: 'down', small: true },
    { id: 'kid50c', who: 'adrian', tx: 20, ty: 10, dir: 'down', small: true },
    { id: 'scorch50', who: null, tx: 12, ty: 13, kind: 'c50Scorch', noSolid: true, propScale: 1, hidden: true },
    { id: 'pigeon50b', who: null, tx: 12, ty: 13, kind: 'c50Pigeon', noSolid: true, propScale: 1, hidden: true }
  ],
  overlay: function (c) {
    // fluorescent strip lights, and the window light on the left
    var g = c.createLinearGradient(0, 0, 0, 60);
    g.addColorStop(0, 'rgba(255,255,240,0.12)');
    g.addColorStop(1, 'rgba(255,255,240,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, 60);
    c.fillStyle = 'rgba(20,24,40,0.10)';
    c.fillRect(0, 0, W, H);
  }
};

// ----------------------------------------------------------------- scripts

SCRIPT.ch50Pan = function () {
  if (G.flags.c50_gone) {
    say([{ who: 'bucktooth', text: 'Go! Go! The bell is not a suggestion, it is a countdown!' }]);
    return;
  }
  say([
    { who: 'narrator', text: 'The frying pan arrived before the alarm did. It is yellow, it is plastic, and it is being swung by a beaver puppet standing on the pillow.' },
    { who: 'bucktooth', text: 'Wake up, wake up, you load bearing boy! The day has arrived and it brought zero joy!' },
    { who: 'maverick', text: 'Ow. Professor.' },
    { who: 'bucktooth', text: 'Your socks are missing, your shoes are a crime, get up, get dressed, we are out of time!' },
    { who: 'maverick', text: 'Zero joy. It is Tuesday.' },
    { who: 'bucktooth', text: 'The joy is scheduled for Thursday. I rhyme ahead.' },
    { who: 'narrator', text: 'The clock says 8:02. Homeroom started at 8:00. Mav spends one second doing the arithmetic, which is the longest second in the fifth grade.' },
    { who: 'bucktooth', text: 'The schedule has collapsed. Abandon the waffles. The waffles understand.' },
    { who: 'narrator', text: 'Mav finds one shoe, then the other shoe in the shoe place, which is the floor. The backpack weighs more than a backpack should. He blames the science project.' }
  ], function () {
    G.flags.c50_gone = true;
    G.flags.c50_t = 0;
    CH50.hits = 0;
    c50Reset();
    toast('the waffles understand');
  });
};

SCRIPT.ch50Late = function () {
  var lines = [{ who: 'narrator', text: 'Clovis Elementary. The doors have a sign about hall passes. Room 14 is down the hall, and you are already five minutes into a very bad morning.' }];
  if (!G.flags.c50_pass) {
    lines.push({ who: 'narrator', text: 'Mav holds up nothing in particular. The door lets him in anyway, because it is a door and not a lawyer.' });
    lines.push({ who: 'bucktooth', text: 'We will be hearing about this later. I am filing it under Consequences.' });
  }
  say(lines);
};

SCRIPT.ch50Sign = function () {
  if (G.flags.c50_sign) {
    say([{ who: 'bucktooth', text: 'I have not stopped thinking about that sign. A man with a plan and a gift card.' }]);
    return;
  }
  say([
    { who: 'narrator', text: 'A plastic sign on a tripod outside the Applebee\'s reads: RESERVED. 8 PM. THE BURT.' },
    { who: 'bucktooth', text: 'Maverick. That is a man with plans.' },
    { who: 'maverick', text: 'Plans for what?' },
    { who: 'bucktooth', text: 'For later. File it. Comedy is mostly filing.' }
  ], function () {
    G.flags.c50_sign = true;
  });
};

SCRIPT.ch50Pass = function () {
  var e = G.ents.filter(function (x) { return x.id === 'fence50'; })[0];
  if (G.flags.c50_pass) {
    say([{ who: 'bucktooth', text: 'You have the pass. It is around your neck. It is magnificent.' }]);
    return;
  }
  say([
    { who: 'narrator', text: 'The official Room 14 hall pass is hooked over the fence. It is a wooden toilet seat with ROOM 14 painted on it by somebody who hated the job.' },
    { who: 'maverick', text: 'Why is it a toilet seat?' },
    { who: 'bucktooth', text: 'Do not ask questions about school funding. Take the seat.' },
    { who: 'narrator', text: 'Mav takes the hall pass and puts it around his neck, where it settles like a very wooden medal.' }
  ], function () {
    G.flags.c50_pass = true;
    SFX.pickup();
    FX.burst(e ? e.px : G.px, e ? e.py - 12 : G.py - 12, '#f0e0b0', 12, { speed: 50, life: 0.6 });
    toast('hall pass secured. the school will respect this.');
  });
};

SCRIPT.ch50Burt = function () {
  if (CH50.over) {
    say([{ who: 'burt', text: 'Do not talk to me. I am having a moment about my romantic life.' }]);
    return;
  }
  if (!CH50.on) {
    say([{ who: 'burt', text: 'Sit down, kid. We are on page seventy two and you are on my last nerve.' }]);
    return;
  }
  say([{ who: 'burt', text: 'Do not point that puppet at me. I have been pointed at by better puppets.' }]);
};

SCRIPT.ch50Joel = function () {
  if (CH50.over) {
    say([{ who: 'joel', text: 'I have a book that solves problems. It is not this one.' }]);
    return;
  }
  if (!CH50.on) {
    say([{ who: 'joel', text: 'Watch this. He hates it when the book falls.' }]);
    return;
  }
  say([{ who: 'joel', text: 'He called my house four times. FOUR. Times.' }]);
};

// The Burt reaches the podium. The argument starts on arrival.
function c50ClassArrival() {
  say([
    { who: 'maverick', text: 'I am so, so sorry. My internal temporal awareness suffered a complete breakdown, the dog did not eat my homework but the universe conspired against my socks.' },
    { who: 'burt', text: 'I am no Schwegel.' },
    { who: 'narrator', text: 'The voice sounds like two cinderblocks grinding together inside a cement mixer.' },
    { who: 'burt', text: 'I am The Burt. And if you do not pay attention, I will bring the hurt. Sit down, kid.' },
    { who: 'bucktooth', text: 'Maverick. His facial geometry lacks any structural compassion. Do not make eye contact with the moustache.' }
  ], function () {
    if (G.level !== 'ch50' || G.sceneId !== 'c50_room14') return;
    setTimeout(function () {
      if (G.level !== 'ch50' || G.sceneId !== 'c50_room14' || CH50.over) return;
      say([
        { who: 'narrator', text: 'In the back corner, Joel pushes his textbook off his desk with one finger.' },
        { who: 'narrator', text: 'THUD. The substitute\'s left eye twitches. The room goes dead silent.' },
        { who: 'burt', text: 'Not this again, Joel. Pick up your book. Right this minute.' },
        { who: 'narrator', text: 'Joel lifts it three inches off the linoleum and slams it back down. SMACK.' },
        { who: 'burt', text: 'I swear, Joel, your mom is sick of me calling the house.' },
        { who: 'joel', text: 'SHE DOES NOT WANT TO GO OUT WITH YOU! STOP CALLING!' },
        { who: 'narrator', text: 'The book goes over Burt\'s head, through the back window with an explosive SHATTER, and out into the courtyard among the pigeons.' },
        { who: 'narrator', text: 'What happens next is not an argument. It is a weather event.' },
        { who: 'bucktooth', text: 'Maverick! Deploy me! I am a licensed counsellor in the state of Ohio!' }
      ], function () {
        if (G.level !== 'ch50' || G.sceneId !== 'c50_room14') return;
        c50Start();
      });
    }, 2200);
  });
}

function c50Start() {
  c50Reset();
  CH50.on = true;
  CH50.burt = 20 + Math.min(30, (G.flags.c50_late || 0) * 7);
  CH50.joel = 24;
  CH50.burtPeak = CH50.burt;
  CH50.joelPeak = CH50.joel;
  CH50.nextThrow = 2.6;
  G.flags.c50_burt = CH50.burt;
  G.flags.c50_joel = CH50.joel;
  toast('point the doll and press E. keep BOTH bars down.');
}

// --------------------------------------------------------- the friendship hose

function c50Person(id) {
  for (var i = 0; i < G.ents.length; i++) if (G.ents[i].id === id) return G.ents[i];
  return null;
}

// the man the doll is currently pointed at: nearest within reach, and when both
// are in reach, whoever is more in front. Aim assist, because he is ten.
function c50Target() {
  var b = c50Person('burt50'), j = c50Person('joel50');
  var fx = G.dir === 'left' ? -1 : G.dir === 'right' ? 1 : 0;
  var fy = G.dir === 'up' ? -1 : G.dir === 'down' ? 1 : 0;
  var best = null, bestScore = 1e9;
  [b, j].forEach(function (e) {
    if (!e) return;
    var d = Math.hypot(e.px - G.px, e.py - G.py);
    if (d > C50_REACH) return;
    var front = d > 0.001 ? ((e.px - G.px) * fx + (e.py - G.py) * fy) / d : 1;
    var score = d - front * 22;         // in front wins ties, but near wins
    if (score < bestScore) { best = e; bestScore = score; }
  });
  return best;
}

function c50Fire() {
  if (!CH50.on || DLG.active) return;
  if (CH50.cool > 0) {
    SFX.tone(180, 0.06, 'square', 0.03);
    FX.pop(G.px, G.py - 30, 'THINKING', '#c8c0a0');
    return;
  }
  var t = c50Target();
  if (!t) {
    // out of range: a small nudge, never a wasted second of the argument
    CH50.cool = 0.3;
    SFX.tone(160, 0.07, 'square', 0.03);
    FX.pop(G.px, G.py - 30, 'TOO FAR', '#c8c0a0');
    return;
  }
  CH50.cool = C50_COOL;
  CH50.shots++;
  var isBurt = t.id === 'burt50';
  var pick = null, pool = [];
  for (var i = 0; i < C50_COUPLETS.length; i++) {
    if (C50_COUPLETS[i].to === (isBurt ? 'burt' : 'joel')) pool.push(C50_COUPLETS[i]);
  }
  pick = pool[Math.floor(Math.random() * pool.length)];

  if (isBurt) { CH50.burt = Math.max(0, CH50.burt - C50_CALM); CH50.joel = Math.min(100, CH50.joel + C50_SPITE); }
  else { CH50.joel = Math.max(0, CH50.joel - C50_CALM); CH50.burt = Math.min(100, CH50.burt + C50_SPITE); }

  CH50.landed++;
  CH50.sayText = pick.word;
  CH50.sayT = 1.4;
  CH50.sayX = t.px;
  CH50.sayY = t.py - 30;
  SFX.blip(880, 0.05);
  FX.burst(t.px, t.py - 20, '#cfe8b0', 10, { speed: 40, life: 0.5, lift: 22 });
  FX.pop(t.px, t.py - 34, pick.word, '#d8f0b0');
  G.flags.c50_burt = CH50.burt;
  G.flags.c50_joel = CH50.joel;
}

function c50ThrowStart() {
  var fromBurt = Math.random() < 0.5;
  var b = c50Person('burt50'), j = c50Person('joel50');
  if (!b || !j) return;
  var s = fromBurt ? b : j, d = fromBurt ? j : b;
  CH50.warn = {
    sx: s.px, sy: s.py - 20, tx: d.px, ty: d.py - 18,
    t: 0.85, kind: C50_JUNK[Math.floor(Math.random() * C50_JUNK.length)]
  };
}

function c50ThrowLaunch() {
  var w = CH50.warn;
  CH50.warn = null;
  if (!w) return;
  var dx = w.tx - w.sx, dy = w.ty - w.sy, len = Math.hypot(dx, dy) || 1;
  var sp = 190;
  CH50.throws.push({
    x: w.sx, y: w.sy, tx: w.tx, ty: w.ty,
    vx: dx / len * sp, vy: dy / len * sp,
    kind: w.kind, life: 2.6, spin: Math.random() * 6, dead: false
  });
  SFX.tone(320, 0.05, 'square', 0.03);
}

function c50ThrowTick(dt) {
  if (CH50.warn) {
    CH50.warn.t -= dt;
    if (CH50.warn.t <= 0) c50ThrowLaunch();
  }
  CH50.nextThrow -= dt;
  if (CH50.nextThrow <= 0) {
    c50ThrowStart();
    // and the air gets busier as the argument heats up
    CH50.nextThrow = Math.max(1.8, 3.4 - CH50.t / 22) + Math.random() * 1.6;
  }

  for (var i = CH50.throws.length - 1; i >= 0; i--) {
    var t = CH50.throws[i];
    t.life -= dt;
    t.x += t.vx * dt;
    t.y += t.vy * dt;
    t.spin += dt * 9;

    // hit Mav? a forgiving box around his chest
    if (!t.dead && Math.abs(t.x - G.px) < 10 && Math.abs(t.y - (G.py - 8)) < 9) {
      t.dead = true;
      CH50.hits++;
      CH50.burt = Math.min(100, CH50.burt + 6);
      CH50.joel = Math.min(100, CH50.joel + 6);
      G.shake = 0.7;
      SFX.tone(120, 0.16, 'sawtooth', 0.06);
      FX.burst(t.x, t.y, '#e8dcc0', 12, { speed: 60, life: 0.6, lift: 30 });
      FX.pop(G.px, G.py - 34, t.kind + 'D!', '#e8607a');
      // knocked back a step, never out of the room
      var kx = G.px + (G.px - t.x) * 0.6, ky = G.py + (G.py - t.y) * 0.6;
      if (!blocked(kx, G.py)) G.px = kx;
      if (!blocked(G.px, ky)) G.py = ky;
    }

    // reached the other man, or the wall: gone, with a taunt
    var arrived = Math.abs(t.x - t.tx) < 12 && Math.abs(t.y - t.ty) < 12;
    if (t.life <= 0 || arrived || t.dead) {
      if (!t.dead) FX.pop(t.tx, t.ty - 12, 'THUNK', '#c8b89a');
      CH50.throws.splice(i, 1);
    }
  }
}

function c50End(final) {
  if (!CH50.on) return;
  CH50.on = false;
  var avg = CH50.t > 0.01 ? CH50.coolSum / CH50.t : 0;
  var acc = CH50.shots > 0 ? CH50.landed / CH50.shots : 0;
  var harmony = Math.min(20, CH50.harmony) / 20;
  var score = Math.round(45 * avg + 35 * acc + 20 * harmony);
  score = Math.max(25, Math.min(100, score));
  G.flags.c50_score = score;
  G.flags.c50_burt = Math.round(CH50.burtPeak);
  G.flags.c50_joel = Math.round(CH50.joelPeak);
  if (final) c50Book();
}

// one deadpan line about how the argument went, before the card
function c50Quip() {
  var b = Math.round(CH50.burtPeak), j = Math.round(CH50.joelPeak);
  var out = 'The Burt peaked at ' + b + '. Joel peaked at ' + j + '.';
  if (CH50.soaked) out += ' The sprinklers were involved.';
  if (CH50.early) out += ' Joel opened the book early because you bored him.';
  if (b < 60 && j < 60 && !CH50.soaked) out += ' For one minute, Room 14 was the calmest room in Clovis.';
  return out;
}

// ------------------------------------------------------------- the book itself

function c50Book() {
  CH50.over = true;
  var pass = !!G.flags.c50_pass;
  var lines = [
    { who: 'narrator', text: CH50.early
        ? 'Joel stops being bored, which is worse. He reaches into his backpack and pulls out an ancient leather book wrapped in pulsing purple veins.'
        : 'Joel reaches into his backpack and pulls out an ancient leather book wrapped in pulsing purple veins.' },
    { who: 'maverick', text: 'Wait. Where did he get that?!' },
    { who: 'narrator', text: 'Joel winds up to throw it at Burt\'s head. Mav, who has spent the last minute learning exactly how to catch things, catches it.' },
    { who: 'narrator', text: 'The book falls open in his hands. The page has a word on it that is much too long and completely the wrong colour.' },
    { who: 'bucktooth', text: 'Do not read it.' },
    { who: 'narrator', text: 'Mav reads it. He is ten.' },
    { who: 'joel', text: 'KLAATU... VERATA... NIC TO!' }
  ];
  say(lines, function () {
    if (G.sceneId !== 'c50_room14') return;
    SFX.blast();
    G.shake = 1.8; G.flash = 0.9;
    var sc = c50Person('scorch50');
    if (sc) sc.hidden = false;
    FX.burst(12 * TILE + 8, 13 * TILE, '#7a4a8a', 34, { speed: 70, life: 0.9, lift: 40 });

    say([
      { who: 'narrator', text: 'The linoleum under the desk cracks open with a flash of crimson brimstone. Two enormous, slimy, multi eyed horrors come up through the floor.' },
      { who: 'narrator', text: 'One scoops up the substitute by the waistband of his slacks. The other snags Joel by his backpack straps.' },
      { who: 'narrator', text: 'A third, much smaller horror comes up through the same hole, sniffs the air, goes straight for Mav\'s backpack, and leaves with the tuna sandwich from Thursday. Nobody mourns the sandwich.' },
      { who: 'burt', text: 'I STILL HAVE HER NUMBER, JOEL!' },
      { who: 'joel', text: 'SHE BLOCKED YOU ON FACEBOOK, BURT!' },
      { who: 'narrator', text: 'As Burt sinks, something flutters up out of his shirt pocket: a small plastic Applebee\'s gift card. Joel catches it one handed, looks at it, and puts it in his own pocket. Nobody mentions it.' }
    ], function () {
      if (G.sceneId !== 'c50_room14') return;
      var b = c50Person('burt50');
      if (b) b.hidden = true;
      var j = c50Person('joel50');
      if (j) j.hidden = true;

      var passLines = pass
        ? [
            { who: 'burt', text: 'AND YOU! YOU DON\'T EVEN HAVE A HALL PASS!' },
            { who: 'narrator', text: 'Mav lifts the toilet seat off his neck and holds it up. The left horror squints at it.' },
            { who: 'narrator', text: '"Carry on, citizen," it says, in a voice like a garbage disposal full of gravel.' }
          ]
        : [
            { who: 'burt', text: 'AND YOU! YOU ARE LATE AND YOU DON\'T EVEN HAVE A HALL PASS!' },
            { who: 'narrator', text: 'The left horror looks at Mav, then at the door, then back at Mav.' },
            { who: 'narrator', text: '"No pass. No entry," it says. "You get to keep your dimension."' }
          ];

      say(passLines, function () {
        if (G.sceneId !== 'c50_room14') return;
        SFX.blast();
        G.flash = 0.6;
        say([
          { who: 'narrator', text: 'FWOOSH. The floor snaps shut with a hollow click, leaving a scorch mark and the faint smell of sulphur and cinnamon.' },
          { who: 'narrator', text: 'The classroom sits in stunned, paralysed silence. Outside, the broken window lets in a cool autumn breeze.' },
          { who: 'narrator', text: 'Then the pigeon from the courtyard hops in through the broken window and lands on the scorch mark, unbothered.' },
          { who: 'narrator', text: c50Quip() },
          { who: 'maverick', text: 'Well. Somebody still has to teach us fractions.' },
          { who: 'narrator', text: 'The class divides cleanly down the middle. Half of them howl with laughter. The other half sob, grieving the interdimensional loss of a substitute teacher. Nobody argues with the pigeon.' }
        ], function () {
          if (G.sceneId !== 'c50_room14') return;
          var p = c50Person('pigeon50b');
          if (p) p.hidden = false;
          FX.burst(12 * TILE + 8, 13 * TILE - 10, '#e8dcc0', 16, { speed: 40, life: 0.7, lift: 30 });
          setTimeout(function () {
            if (G.level !== 'ch50' || G.sceneId !== 'c50_room14') return;
            var score = G.flags.c50_score || 50;
            var label = 'Burt ' + Math.round(CH50.burtPeak) + ' / Joel ' + Math.round(CH50.joelPeak);
            cleared(50, score, label);
          }, 1200);
        });
      });
    });
  });
}

// ------------------------------------------------------------------ the tick

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch50') return;

  // the sprint: a clock that only goes one way
  if (G.sceneId === 'c50_street' && G.flags.c50_gone) {
    G.flags.c50_t = (G.flags.c50_t || 0) + dt;
    // the pigeon tags along, one hop behind
    var pg = c50Person('pigeon50');
    if (pg) {
      pg.hidden = (G.flags.c50_t || 0) < 2;
      if (pg.hidden) pg.tx = 3; else pg.tx = Math.max(2, Math.round(G.px / TILE) - 2);
      pg.ty = 14;
      pg.px = pg.tx * TILE + 8;
      pg.py = pg.ty * TILE + 14;
    }
    // bumping into anyone costs four seconds and gets you a comment
    for (var i = 0; i < G.ents.length; i++) {
      var e = G.ents[i];
      if (!e.drift || e.c50_cool > 0) { if (e.c50_cool > 0) e.c50_cool -= dt; continue; }
      var d = Math.hypot(e.px - G.px, e.py - G.py);
      if (d < 13) {
        e.c50_cool = 1.4;
        CH50.hits++;
        G.flags.c50_t += 4;
        G.shake = 0.5;
        SFX.tone(160, 0.1, 'square', 0.05);
        FX.pop(G.px, G.py - 26, '+4s ' + (C50_BUMP_LINES[e.id] || 'SORRY'), '#e8607a');
        CH50.bumpT++;
        if (CH50.bumpT % 3 === 0) {
          toast('Mav: those are bathmats, Professor');
        }
      }
    }
  }

  // walking into Room 14 starts the lesson, once per run
  if (G.sceneId === 'c50_room14' && !G.flags.c50_arrived && !DLG.active) {
    G.flags.c50_arrived = true;
    G.flags.c50_late = Math.max(0, Math.round((G.flags.c50_t || 0) / 12) - 2);
    c50ClassArrival();
  }

  // Room 14: the argument is a two bar juggling act
  if (G.sceneId === 'c50_room14' && CH50.on) {
    CH50.t += dt;
    // it gets worse faster the longer it runs, so no one can coast
    var ramp = 1 + CH50.t / 34;
    CH50.burt = Math.min(100, CH50.burt + dt * C50_RISE * ramp);
    CH50.joel = Math.min(100, CH50.joel + dt * C50_RISE * ramp);
    if (CH50.burt > CH50.burtPeak) CH50.burtPeak = CH50.burt;
    if (CH50.joel > CH50.joelPeak) CH50.joelPeak = CH50.joel;
    if (CH50.cool > 0) CH50.cool = Math.max(0, CH50.cool - dt);

    var worst = Math.max(CH50.burt, CH50.joel);
    CH50.coolSum += Math.max(0, 1 - worst / 100) * dt;
    if (CH50.burt < 25 && CH50.joel < 25) CH50.harmony += dt;
    if (CH50.sayT > 0) CH50.sayT -= dt;

    c50ThrowTick(dt);

    G.flags.c50_burt = CH50.burt;
    G.flags.c50_joel = CH50.joel;

    if (CH50.burt >= 100 && !CH50.soaked) {
      // no do over, no scolding: the sprinklers do the work
      CH50.soaked = true;
      CH50.burt = 55;
      CH50.throws.length = 0;
      CH50.warn = null;
      SFX.tone(500, 0.4, 'sine', 0.05);
      G.flash = 0.5;
      FX.burst(G.px, G.py - 40, '#a8d8f0', 24, { speed: 80, life: 1.0, lift: 20 });
      FX.pop(G.px, G.py - 44, 'SPRINKLERS', '#a8d8f0');
      toast('the moustache is now a gag. he can only say MMMF');
      if (c50Person('burt50')) c50Person('burt50').dir = 'down';
    }
    if (CH50.joel >= 100) {
      CH50.early = true;
      c50End(true);
      return;
    }
    if (CH50.t >= C50_SECONDS) c50End(true);
  }
});

ACTION_HOOKS.push(function () {
  if (G.level !== 'ch50' || G.sceneId !== 'c50_room14') return false;
  if (!CH50.on || DLG.active) return false;
  c50Fire();
  return true;
});

// the doll, the cone, and everything currently in the air
PLAYER_HOOKS.push(function (c) {
  if (G.level !== 'ch50' || G.sceneId !== 'c50_room14') return;

  if (CH50.on) {
    // the cone of sincerity
    var fx = G.dir === 'left' ? -1 : G.dir === 'right' ? 1 : 0;
    var fy = G.dir === 'up' ? -1 : G.dir === 'down' ? 1 : 0;
    var len = 56, half = 22;
    var tipx = G.px + fx * len, tipy = G.py - 8 + fy * len;
    c.save();
    c.globalAlpha = 0.26 + 0.06 * Math.sin(G.time * 6);
    c.fillStyle = '#9be08a';
    c.beginPath();
    c.moveTo(G.px, G.py - 8);
    c.lineTo(tipx - fy * half, tipy - fx * half);
    c.lineTo(tipx + fy * half, tipy + fx * half);
    c.closePath();
    c.fill();
    c.globalAlpha = 0.75;
    c.strokeStyle = 'rgba(200,245,170,0.65)';
    c.lineWidth = 0.8;
    c.stroke();
    c.restore();

    // the doll itself, held out to one side so it never covers his face
    var dollW = 26;
    var off = G.dir === 'left' ? -10 - dollW : 10;
    var bob = CH50.sayT > 0 ? Math.sin(G.time * 30) * 1.5 : 0;
    drawChar(c, 'bucktooth_puppet', G.dir === 'up' ? 'up' : 'down', 0,
             G.px + off, G.py - 24 + bob, 0.8);

    // a ring on whoever the doll is pointed at, and a nudge when nobody is
    var t = c50Target();
    if (!t) {
      c.save();
      c.globalAlpha = 0.5 + 0.25 * Math.sin(G.time * 4);
      c.fillStyle = '#e8d8a8';
      c.font = '5px monospace';
      c.textAlign = 'center';
      c.fillText('get closer', G.px, G.py - 28);
      c.restore();
    }
    if (t) {
      var pulse = 0.55 + 0.35 * Math.sin(G.time * 8);
      c.save();
      c.globalAlpha = pulse;
      c.strokeStyle = '#d8f0b0';
      c.lineWidth = 1;
      c.beginPath(); c.ellipse(t.px, t.py - 2, 13, 5, 0, 0, Math.PI * 2); c.stroke();
      c.restore();
      if (CH50.sayT > 0) {
        c.save();
        c.globalAlpha = Math.min(1, CH50.sayT * 2);
        c.fillStyle = '#12200f';
        c.font = 'bold 5px monospace';
        c.textAlign = 'center';
        c.fillText(CH50.sayText, t.px, t.py - 38);
        c.restore();
      }
    }
  }

  // the telegraph: a red lane across the room, then the thing itself
  if (CH50.warn) {
    var w = CH50.warn;
    c.save();
    c.globalAlpha = 0.35 + 0.35 * Math.sin(G.time * 22);
    c.strokeStyle = '#e8607a';
    c.lineWidth = 1;
    c.setLineDash([3, 3]);
    c.beginPath(); c.moveTo(w.sx, w.sy); c.lineTo(w.tx, w.ty); c.stroke();
    c.setLineDash([]);
    c.globalAlpha = 0.85;
    c.fillStyle = '#e8607a';
    c.fillRect(w.sx - 2, w.sy - 2, 4, 4);
    c.restore();
  }

  for (var i = 0; i < CH50.throws.length; i++) {
    var t2 = CH50.throws[i];
    c.save();
    c.translate(t2.x, t2.y);
    c.rotate(t2.spin);
    if (t2.kind === 'GLOBE') {
      c.fillStyle = '#2a3a52'; c.beginPath(); c.arc(0, 0, 6.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#4a7ab8'; c.beginPath(); c.arc(0, 0, 5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#6ac06a'; c.fillRect(-4, -2, 4, 4);
      c.fillStyle = '#8ad8ff'; c.fillRect(-1, -4, 2, 2);
    } else if (t2.kind === 'PUDDING') {
      c.fillStyle = '#3a3222'; c.fillRect(-4, -5, 8, 10);
      c.fillStyle = '#e8d070'; c.fillRect(-3, -4, 6, 8);
      c.fillStyle = '#c8a840'; c.fillRect(-3, -4, 6, 2);
    } else if (t2.kind === 'ERASER') {
      c.fillStyle = '#4a4030'; c.fillRect(-6, -4, 12, 8);
      c.fillStyle = '#b8a888'; c.fillRect(-5, -3, 10, 6);
      c.fillStyle = '#8a7a60'; c.fillRect(-5, 1, 10, 2);
    } else {
      c.fillStyle = '#4a4030'; c.fillRect(-6, -4, 12, 8);
      c.fillStyle = '#d8c8a8'; c.fillRect(-5, -3, 10, 6);
      c.fillStyle = '#a09070'; c.fillRect(-5, 1, 10, 1);
    }
    c.restore();
  }
});

// ------------------------------------------------------------------- the HUD

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch50') return;

  // the clock during the sprint
  if (G.sceneId === 'c50_street' && G.flags.c50_gone) {
    var t = G.flags.c50_t || 0;
    var mins = Math.floor(t / 12), secs = Math.floor((t % 12) * 5);
    var clock = '8:' + ('0' + (2 + mins)).slice(-2) + ' and ' + ('0' + secs).slice(-2);
    c.font = 'bold 8px monospace';
    c.textAlign = 'center';
    c.fillStyle = t > 60 ? '#e8607a' : '#f6ecd8';
    c.fillText(clock, W / 2, 42);
    var bw = 180, bx = (W - bw) / 2, by = 47;
    c.fillStyle = 'rgba(18,16,28,0.75)';
    c.fillRect(bx, by, bw, 9);
    var f = Math.min(1, t / 60);
    c.fillStyle = t > 60 ? '#c8404f' : '#8ac06a';
    c.fillRect(bx + 1, by + 1, (bw - 2) * f, 7);
    c.fillStyle = 'rgba(255,255,255,0.25)';
    c.fillRect(bx + bw * 0.83, by, 1, 9);          // the 8:07 mark
    if (G.flags.c50_pass) {
      c.font = '5px monospace';
      c.fillStyle = '#f0e0b0';
      c.textAlign = 'left';
      c.fillText('HALL PASS: yes, around the neck', 8, 64);
    } else {
      c.font = '5px monospace';
      c.fillStyle = '#e8a0a0';
      c.textAlign = 'left';
      c.fillText('HALL PASS: no (the door reads the sign out loud)', 8, 64);
    }
    c.textAlign = 'left';
    return;
  }

  if (G.sceneId !== 'c50_room14' || !CH50.on) return;

  // two bars, top left and top right, because you cannot fix both men
  function bar(x, y, w, h, v, col, label, icon) {
    c.fillStyle = 'rgba(18,16,28,0.82)';
    c.fillRect(x - 2, y - 2, w + 4, h + 4);
    c.fillStyle = '#2a2434';
    c.fillRect(x, y, w, h);
    c.fillStyle = col;
    c.fillRect(x, y, w * Math.min(1, v), h);
    c.fillStyle = 'rgba(255,255,255,0.28)';
    for (var i = 1; i < 4; i++) c.fillRect(x + (w / 4) * i, y, 1, h);
    c.font = '6px monospace';
    c.fillStyle = '#f0e4c8';
    c.textAlign = 'left';
    c.fillText(label + '  ' + Math.round(v * 100), x, y - 5);
    c.textAlign = 'left';
  }

  var bw2 = 128;
  bar(14, 40, bw2, 9, CH50.burt / 100,
      CH50.burt > 75 ? '#e8404f' : CH50.burt > 45 ? '#e8a040' : '#8ac06a',
      'BURT / RAGE');
  bar(W - 14 - bw2, 40, bw2, 9, CH50.joel / 100,
      CH50.joel > 75 ? '#e8404f' : CH50.joel > 45 ? '#e8a040' : '#8ac06a',
      'JOEL / BORED');

  // one dark pill in the middle: the harmony clock and the E prompt
  var calm = CH50.burt < 25 && CH50.joel < 25;
  c.fillStyle = 'rgba(14,12,20,0.80)';
  c.fillRect(W / 2 - 44, 34, 88, 18);
  c.strokeStyle = calm ? 'rgba(155,224,138,0.8)' : 'rgba(160,150,140,0.5)';
  c.lineWidth = 1;
  c.strokeRect(W / 2 - 44, 34, 88, 18);
  c.font = '5px monospace';
  c.textAlign = 'center';
  c.fillStyle = calm ? '#9be08a' : '#d8d0c0';
  c.fillText((calm ? 'HARMONY ' : 'PEACE ') + Math.floor(CH50.harmony) + 's', W / 2, 42);
  if (CH50.cool > 0) {
    c.fillStyle = '#5a5464';
    c.fillRect(W / 2 - 30, 46, 60, 3);
    c.fillStyle = '#8a8478';
    c.fillRect(W / 2 - 30, 46, 60 * (1 - CH50.cool / C50_COOL), 3);
  } else {
    var pulse = 0.6 + 0.4 * Math.sin(G.time * 8);
    c.globalAlpha = pulse;
    c.fillStyle = '#d8f0b0';
    c.fillRect(W / 2 - 30, 46, 60, 3);
    c.globalAlpha = 1;
  }
  c.textAlign = 'left';
});

// -------------------------------------------------------------------- entry

CHAPTER_CONTENT[50] = {
  start: 'c50_room',

  intro: function () {
    chapterCard('CHAPTER FIFTY', "The Substitute's Underworld Sabbatical", 3.2);
    c50Reset();
    G.flags.c50_gone = false;
    G.flags.c50_late = 0;
    G.flags.c50_arrived = false;
    G.flags.c50_pass = false;
    G.flags.c50_sign = false;
    G.flags.c50_score = 0;
    setTimeout(function () {
      if (G.level !== 'ch50') return;
      say([
        { who: 'narrator', text: 'Chapter fifty. In which our hero is late, and then things get worse in a way nobody could have scheduled.' }
      ]);
    }, 900);
  },

  resume: function () {
    // coming back into the middle of Room 14 restarts the counselling rather
    // than freezing it with two bars and no way to move them
    if (G.sceneId === 'c50_room14' && !CH50.over && G.flags.c50_arrived) {
      c50Start();
      toast('the argument is still going. point the doll.');
    }
  },

  objective: function () {
    if (G.sceneId === 'c50_room') return G.flags.c50_gone ? 'objective: out the door (south)' : 'objective: wake up, talk to the Professor';
    if (G.sceneId === 'c50_street') {
      if (!G.flags.c50_pass) return 'objective: grab the hall pass on the fence';
      return 'objective: run east to Room 14';
    }
    if (G.sceneId === 'c50_room14') {
      if (CH50.over) return '';
      if (!CH50.on) return 'objective: sit down before he notices you';
      return 'objective: point the doll, press E, do not let either bar fill';
    }
    return '';
  }
};
