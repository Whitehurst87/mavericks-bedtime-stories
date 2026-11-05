// ch07.js - Chapter 7: Mav and the Unwarranted Pardon
//
// Three rooms, one wrongful arrest, one rap battle:
//   c7_class   room 4B, the pie, and the FBI
//   c7_cell    county jail, cell four, and Gerald Barreled
//   c7_curb    the mob, the pardon, and the curb
//
// The mechanic is a freestyle battle. Gerald's flow starts at 100 and the
// crowd starts at 12. Three bars are offered each round; one of them actually
// rhymes. Good bars drop his flow and lift the crowd. The round timer is
// generous and only costs crowd, never the chapter.

var CH7 = {
  t: 12,              // seconds left in the round
  sel: 0,             // highlighted bar
  locked: false,      // true while Gerald is answering
  carT: 0,            // the Mustang passing the classroom window
  touchHeld: false,
  banks: [
    {
      taunt: 'Hold up, Professor, your flow is too furry. My rhythm is smooth, I am never in a hurry.',
      goodReply: 'Okay. That one had a foundation. I am annoyed about it.',
      badReply: 'That did not rhyme. That rhymed in a different room, at a different time.',
      goodNote: 'The guard looked up from his phone. That was the first good sign.',
      bars: [
        { tag: 'STURDY DAM', bank: 'state / appreciate', good: false,
          lines: ['My dam is the sturdiest dam in the state,', 'My flow is the kind you must learn to appreciate.'] },
        { tag: 'BEAVER FACTS', bank: 'wood / fact', good: false,
          lines: ['I chew on the logs and I chew on the wood,', 'You are a cat, which is also a fact.'] },
        { tag: 'FRESH WOOD', bank: 'chips / trips', good: true,
          lines: ['My rhymes are fresh wood, not compost, not chips,', 'I fix what you break, then I charge you for trips!'] }
      ]
    },
    {
      taunt: 'Your beats are all twig-snaps, your metaphors squeak. I am Gerald, the Cat, who owns half of the week.',
      goodReply: 'Fine. FINE. The cat admits the beaver has rhythm. Do not tell the other cats.',
      badReply: 'You brought a report card to a rap battle, Professor.',
      goodNote: 'Somebody in the corridor said ohhh. It was the guard.',
      bars: [
        { tag: 'SMOOTH IS A NAP', bank: 'bore / more', good: true,
          lines: ['Smooth is a nap, and a nap is a bore,', 'I chewed through your door and I charged you for more!'] },
        { tag: 'SILK JACKET', bank: 'tweed / good', good: false,
          lines: ['Your jacket is silk and my vest is tweed,', 'On the subject of rhyming I am extremely good.'] },
        { tag: 'TREE SCIENCE', bank: 'grade / made', good: false,
          lines: ['I am a professor, I teach and I grade,', 'Your beats are all right but my dam is well made.'] }
      ]
    },
    {
      taunt: 'You are locked up for yam. I am locked up for money. Say something worth the data plan.',
      goodReply: 'That is the bar. That is the actual bar. Somebody get the guard a better phone.',
      badReply: 'You rhymed silk with a lifestyle. I am going to lie down.',
      goodNote: 'The cell block went quiet in the way that means a video is being saved.',
      bars: [
        { tag: 'STRUCTURAL POET', bank: 'precise / lights', good: false,
          lines: ['I am a structural poet, precise,', 'My bars hold the ceiling and also the lights.'] },
        { tag: 'LOCKED UP FOR YAM', bank: 'yam / dam', good: true,
          lines: ['You are locked up for money, I am locked up for yam,', 'So hand me the mic, I am the King of the dam!'] },
        { tag: 'FELINE RESPECT', bank: 'silk / chill', good: false,
          lines: ['Gerald, old pal, your jacket is silk,', 'I am a beaver who keeps it quite chill.'] }
      ]
    }
  ]
};

NAMES.henderson = 'MR. HENDERSON';
NAMES.fbi = 'FBI';
NAMES.guard = 'PRISON GUARD';
NAMES.gerald = 'GERALD BARRELED';
NAMES.kid = 'A CHILD';

// the local cast: the teacher, the feds, and the mob
CHARS.henderson = { skin: '#f0c49c', hair: '#b8b8b0', shirt: '#6a7a56', pants: '#4a4038', shoe: '#2a2a2a', hairStyle: 'flat' };
CHARS.fbi = { skin: '#e8b48c', hair: '#24262e', shirt: '#22242c', pants: '#1c1e26', shoe: '#14161c', hairStyle: 'flat' };
CHARS.kid = { skin: '#f2c69b', hair: '#8a5a2a', shirt: '#d8784a', pants: '#3a4a6a', shoe: '#2a2a2a', hairStyle: 'messy' };
CHARS.kid2 = { skin: '#c98a5e', hair: '#3a2a1a', shirt: '#6a9ad0', pants: '#3a3a4a', shoe: '#2a2a2a', hairStyle: 'flat' };

function ch7Clamp(n) { return Math.max(0, Math.min(100, n)); }

// ------------------------------------------------------------ gerald's art
// Gerald is the only character in the story with no sheet and no procedural
// arm in art.js, so he gets a small draw path of his own. A future
// assets/gerald.png wins automatically, same as every other character.

function ch7DrawGerald(ctx, dir, frame, sx, sy, s) {
  var X = sx / s, Y = sy / s;
  function P(x, y, w, h, col) { px(ctx, X + x, Y + y, w, h, col, s); }
  var l1 = frame === 1 ? 1 : 0, l2 = frame === 1 ? 0 : 1;

  P(4, 14, 8, 2, 'rgba(0,0,0,0.22)');

  // tail, always behind the facing side
  var tailX = (dir === 'left' || dir === 'up') ? 12 : 0;
  P(tailX, 9, 3, 5, '#8a6242');
  P(tailX === 0 ? 0 : 13, 7, 2, 3, '#8a6242');
  P(tailX === 0 ? 0 : 13, 6, 2, 1, '#6a4a2e');

  // feet
  P(5, 12 + l1, 2, 3, '#6a4a2e');
  P(9, 12 + l2, 2, 3, '#6a4a2e');
  P(4, 14, 3, 1, '#54391f');
  P(9, 14, 3, 1, '#54391f');

  // the smoking jacket, silk, a little too much
  P(4, 7, 8, 6, '#5a2233');
  P(5, 7, 6, 2, '#7a3046');
  P(3, 8, 2, 4, '#5a2233');
  P(11, 8, 2, 4, '#5a2233');
  P(3, 8, 1, 4, '#6e2a3d');
  P(12, 8, 1, 4, '#6e2a3d');
  P(6, 7, 2, 4, '#c8a24a');            // lapels
  P(8, 7, 2, 4, '#e0c060');            // cravat

  // head
  P(3, 1, 10, 7, '#a87a4a');
  P(3, 0, 2, 2, '#a87a4a');
  P(11, 0, 2, 2, '#a87a4a');
  P(4, 0, 1, 1, '#c89a68');
  P(12, 0, 1, 1, '#c89a68');
  // tabby stripes
  P(4, 1, 1, 2, '#7a5232');
  P(7, 1, 1, 2, '#7a5232');
  P(10, 1, 1, 2, '#7a5232');
  P(6, 5, 4, 3, '#d8b488');            // muzzle

  if (dir !== 'up') {
    // half lidded eyes, which is most of his personality
    if (dir === 'left') P(4, 4, 2, 1, '#2b2b2b');
    else if (dir === 'right') P(10, 4, 2, 1, '#2b2b2b');
    else { P(6, 4, 2, 1, '#2b2b2b'); P(9, 4, 2, 1, '#2b2b2b'); }
    P(7, 6, 1, 1, '#5a3d24');          // nose
    P(4, 6, 2, 1, 'rgba(240,230,210,0.5)');
    P(10, 6, 2, 1, 'rgba(240,230,210,0.5)');
  }
}

(function () {
  var prev = drawChar;
  drawChar = function (ctx, who, dir, frame, sx, sy, s, set) {
    var ov = (typeof ART !== 'undefined') && (ART.overrides.gerald || ART.walk.gerald);
    if (who === 'gerald' && !ov) { ch7DrawGerald(ctx, dir, frame, sx, sy, s); return; }
    prev(ctx, who, dir, frame, sx, sy, s, set);
  };
})();

// -------------------------------------------------------------- the pie

PLAYER_HOOKS.push(function (c) {
  if (G.level !== 'ch7' || !G.flags.ch7_sticky) return;
  var ox = G.dir === 'left' ? -6 : G.dir === 'right' ? 2 : -3;
  c.fillStyle = 'rgba(250,246,232,0.95)';
  c.fillRect(Math.round(G.px + ox), Math.round(G.py - 14), 5, 3);
  c.fillStyle = 'rgba(240,214,120,0.95)';
  c.fillRect(Math.round(G.px + ox), Math.round(G.py - 12), 3, 1);
});

// ------------------------------------------------------------------ scenes

SCENES.c7_class = {
  title: 'ROOM 4B, THIRD PERIOD',
  spawn: { tx: 16, ty: 13, dir: 'up' },
  camZoom: 1,
  fill: 'c7Floor',
  rects: [
    { x: 0, y: 0, w: 32, h: 3, t: 'c7Wall' },
    { x: 0, y: 3, w: 1, h: 14, t: 'c7Wall' },
    { x: 31, y: 3, w: 1, h: 14, t: 'c7Wall' },
    { x: 0, y: 17, w: 32, h: 1, t: 'c7Wall' }
  ],
  solidKinds: ['c7Wall'],
  entities: [
    { id: 'window7', who: null, tx: 6, ty: 2, kind: 'c7Window', noSolid: true, propScale: 1 },
    { id: 'board7', who: null, tx: 16, ty: 2, kind: 'c7Board', noSolid: true, propScale: 1 },
    { id: 'clock7', who: null, tx: 24, ty: 2, kind: 'c7Clock', noSolid: true, propScale: 1 },
    { id: 'door7', who: null, tx: 30, ty: 4, kind: 'c7Door', noSolid: true, propScale: 1 },
    { id: 'shelf7', who: null, tx: 2, ty: 4, kind: 'c7Shelf', solid: true, sw: 1, sh: 2, propScale: 1 },
    { id: 'plant7', who: null, tx: 29, ty: 13, kind: 'c7Plant', solid: true, propScale: 1 },
    { id: 'henderson7', who: 'henderson', tx: 16, ty: 4, dir: 'down', reach: 46, talk: 'ch7Henderson' },
    { id: 'desk1', who: null, tx: 6, ty: 7, kind: 'c7Desk', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'desk2', who: null, tx: 11, ty: 7, kind: 'c7Desk', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'desk3', who: null, tx: 16, ty: 7, kind: 'c7Desk', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'desk4', who: null, tx: 21, ty: 7, kind: 'c7Desk', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'desk5', who: null, tx: 26, ty: 7, kind: 'c7Desk', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'desk6', who: null, tx: 8, ty: 10, kind: 'c7Desk', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'desk7', who: null, tx: 14, ty: 10, kind: 'c7Desk', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'desk8', who: null, tx: 20, ty: 10, kind: 'c7Desk', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'desk9', who: null, tx: 26, ty: 10, kind: 'c7Desk', solid: true, sw: 2, sh: 1, propScale: 1 },
    { id: 'agentA', who: 'fbi', tx: 26, ty: 4, dir: 'left', reach: 44, talk: 'ch7Agent', hidden: true },
    { id: 'agentB', who: 'fbi', tx: 28, ty: 5, dir: 'left', reach: 44, talk: 'ch7Agent', hidden: true },
    { id: 'car7', who: null, tx: -9, ty: 2, kind: 'c7Mustang', noSolid: true, propScale: 1 }
  ],
  overlay: function (c) {
    // daylight from the window wall, and a soft shadow where it meets the floor
    var g = c.createLinearGradient(0, 0, 0, 140);
    g.addColorStop(0, 'rgba(255,238,196,0.22)');
    g.addColorStop(1, 'rgba(255,238,196,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, 140);
    c.fillStyle = 'rgba(40,26,14,0.20)';
    c.fillRect(0, 48, W, 3);
    c.fillStyle = 'rgba(40,26,14,0.10)';
    c.fillRect(0, 51, W, 4);
  }
};

SCENES.c7_cell = {
  title: 'COUNTY JAIL, CELL FOUR',
  spawn: { tx: 13, ty: 12, dir: 'left' },
  camZoom: 1,
  fill: 'jailFloor',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'jailWall' },
    { x: 0, y: 2, w: 1, h: 14, t: 'jailWall' },
    { x: 31, y: 2, w: 1, h: 14, t: 'jailWall' },
    { x: 0, y: 16, w: 32, h: 2, t: 'jailWall' },
    { x: 8, y: 2, w: 2, h: 13, t: 'jailBars' }
  ],
  solidKinds: ['jailWall', 'jailBars'],
  entities: [
    { id: 'sign7', who: null, tx: 11, ty: 1, kind: 'c7CellSign', noSolid: true, propScale: 1, talk: 'ch7Sign' },
    { id: 'cellwin7', who: null, tx: 18, ty: 1, kind: 'c7CellWindow', noSolid: true, propScale: 1 },
    { id: 'tally7', who: null, tx: 13, ty: 1, kind: 'c7Tally', noSolid: true, propScale: 1, talk: 'ch7Tally' },
    { id: 'bunk7', who: null, tx: 25, ty: 4, kind: 'c7Bunk', solid: true, sw: 4, sh: 2, propScale: 1 },
    { id: 'stool7', who: null, tx: 22, ty: 8, kind: 'c7Stool', solid: true, propScale: 1 },
    { id: 'gerald7', who: 'gerald', tx: 20, ty: 8, dir: 'left', reach: 67, talk: 'ch7Gerald' },
    { id: 'toilet7', who: null, tx: 29, ty: 13, kind: 'c7Toilet', solid: true, propScale: 1, talk: 'ch7Toilet' },
    { id: 'guard7', who: null, tx: 7, ty: 9, kind: 'c7Guard', noSolid: true, propScale: 1, talk: 'ch7Guard' }
  ],
  overlay: function (c) {
    // one caged bulb over the corridor, everything else in shadow
    var g = c.createRadialGradient(160, 46, 8, 160, 100, 260);
    g.addColorStop(0, 'rgba(255,230,170,0.18)');
    g.addColorStop(0.5, 'rgba(60,70,80,0.10)');
    g.addColorStop(1, 'rgba(6,8,12,0.42)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    var vg = c.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.86);
    vg.addColorStop(0, 'rgba(4,6,10,0)');
    vg.addColorStop(1, 'rgba(4,6,10,0.5)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
  }
};

SCENES.c7_curb = {
  title: 'THE CURB OUTSIDE COUNTY JAIL',
  spawn: { tx: 17, ty: 9, dir: 'up' },
  camZoom: 1,
  fill: 'cobble',
  rects: [
    { x: 2, y: 0, w: 28, h: 6, t: 'jailWall' },
    { x: 0, y: 6, w: 32, h: 3, t: 'path' }
  ],
  solidKinds: ['jailWall'],
  entities: [
    { id: 'doorCurb', who: null, tx: 16, ty: 6, kind: 'c7Door', noSolid: true, propScale: 1 },
    { id: 'speaker7', who: null, tx: 27, ty: 4, kind: 'c7Speaker', noSolid: true, propScale: 1 },
    { id: 'jailwinA', who: null, tx: 8, ty: 3, kind: 'c7CellWindow', noSolid: true, propScale: 1 },
    { id: 'jailwinB', who: null, tx: 24, ty: 3, kind: 'c7CellWindow', noSolid: true, propScale: 1 },
    { id: 'signCurb', who: null, tx: 11, ty: 7, kind: 'c7Protest', noSolid: true, propScale: 1 },
    { id: 'kidA', who: 'kid', tx: 5, ty: 8, dir: 'up', small: true, talk: 'ch7Kid' },
    { id: 'kidB', who: 'kid2', tx: 8, ty: 7, dir: 'up', small: true },
    { id: 'kidC', who: 'kid', tx: 13, ty: 8, dir: 'up', small: true },
    { id: 'kidD', who: 'kid2', tx: 19, ty: 7, dir: 'up', small: true },
    { id: 'kidE', who: 'kid', tx: 21, ty: 8, dir: 'down', small: true },
    { id: 'kidF', who: 'kid2', tx: 27, ty: 8, dir: 'up', small: true },
    { id: 'catA', who: 'gerald', tx: 6, ty: 7, dir: 'right', small: true },
    { id: 'catB', who: 'gerald', tx: 15, ty: 7, dir: 'up', small: true },
    { id: 'catC', who: 'gerald', tx: 25, ty: 7, dir: 'left', small: true },
    { id: 'kidG', who: 'kid', tx: 3, ty: 9, dir: 'up', small: true },
    { id: 'kidH', who: 'kid2', tx: 9, ty: 9, dir: 'up', small: true },
    { id: 'kidI', who: 'kid', tx: 15, ty: 8, dir: 'up', small: true },
    { id: 'kidJ', who: 'kid2', tx: 24, ty: 8, dir: 'down', small: true },
    { id: 'kidK', who: 'kid', tx: 29, ty: 9, dir: 'up', small: true },
    { id: 'catD', who: 'gerald', tx: 12, ty: 9, dir: 'right', small: true },
    { id: 'catE', who: 'gerald', tx: 18, ty: 8, dir: 'left', small: true },
    { id: 'buckCurb', who: 'bucktooth', tx: 19, ty: 10, dir: 'down', reach: 84, talk: 'ch7BuckEnd', hidden: true },
    { id: 'geraldCurb', who: 'gerald', tx: 21, ty: 10, dir: 'down', reach: 60, hidden: true },
    { id: 'carCurb', who: null, tx: 24, ty: 12, kind: 'c7Mustang', solid: true, sw: 5, sh: 2, propScale: 1, hidden: true }
  ],
  overlay: function (c) {
    // late afternoon, a warm sky over a gray building
    var g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(255,206,150,0.18)');
    g.addColorStop(0.5, 'rgba(255,206,150,0.05)');
    g.addColorStop(1, 'rgba(10,12,24,0.22)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
};

// ------------------------------------------------------------------- props

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (k !== 'c7Window' && k !== 'c7Board' && k !== 'c7Clock' && k !== 'c7Door' &&
      k !== 'c7Desk' && k !== 'c7Shelf' && k !== 'c7Plant' && k !== 'c7Mustang' &&
      k !== 'c7Bunk' && k !== 'c7Stool' && k !== 'c7Toilet' && k !== 'c7CellWindow' &&
      k !== 'c7CellSign' && k !== 'c7Tally' && k !== 'c7Speaker' && k !== 'c7Protest' &&
      k !== 'c7Guard') return false;
  var P = propPainter(c, e);

  if (k === 'c7Window') {
    // the classroom window, and the thing that drives past it
    P(-58, -40, 116, 40, '#efe7d4');
    P(-54, -36, 108, 32, '#8fb8d4');
    P(-54, -24, 108, 20, '#a4c6de');
    P(-54, -36, 108, 3, '#c8dce8');
    P(-44, -31, 18, 5, '#eef4f8');
    P(-40, -29, 14, 3, '#f6fafc');
    P(-1, -36, 3, 32, '#efe7d4');
    P(-54, -22, 108, 3, '#efe7d4');
    P(-60, -3, 120, 4, '#d8d0bc');
    P(-60, 1, 120, 1, 'rgba(60,40,20,0.25)');
    return true;
  }

  if (k === 'c7Board') {
    P(-58, -42, 116, 42, '#6a4a30');
    P(-55, -39, 110, 36, '#2c4038');
    P(-55, -39, 110, 2, '#37504a');
    P(-53, -35, 46, 1, 'rgba(238,240,230,0.45)');
    P(-53, -31, 34, 1, 'rgba(238,240,230,0.35)');
    P(-53, -27, 40, 1, 'rgba(238,240,230,0.30)');
    P(6, -34, 1, 20, 'rgba(238,240,230,0.35)');    // the dam diagram
    P(14, -34, 1, 20, 'rgba(238,240,230,0.35)');
    P(6, -20, 9, 1, 'rgba(238,240,230,0.35)');
    P(-53, -14, 30, 1, 'rgba(238,240,230,0.30)');
    c.save();
    c.fillStyle = 'rgba(240,242,230,0.55)';
    c.font = '5px monospace';
    c.textAlign = 'left';
    c.fillText('HYDRAULICS 101', e.px - 51, e.py - 36);
    c.fillText('DAM: LAB 4', e.px + 4, e.py - 24);
    c.restore();
    P(-58, -1, 116, 3, '#8a6a44');                 // chalk tray
    P(-52, -2, 8, 1, '#f0ece0');
    P(-38, -2, 5, 1, '#e8e0c8');
    return true;
  }

  if (k === 'c7Clock') {
    // a plain round wall clock, forever five minutes into third period
    c.save();
    c.fillStyle = '#5a4a34';
    c.beginPath(); c.arc(e.px, e.py - 17, 10, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#f2ecdc';
    c.beginPath(); c.arc(e.px, e.py - 17, 8, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#3a3128';
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(e.px, e.py - 17); c.lineTo(e.px, e.py - 22); c.stroke();
    c.beginPath(); c.moveTo(e.px, e.py - 17); c.lineTo(e.px + 4, e.py - 15); c.stroke();
    c.restore();
    P(-2, -2, 4, 1, '#4a3a26');
    return true;
  }

  if (k === 'c7Door') {
    P(-14, -42, 28, 42, '#7a5232');
    P(-12, -40, 24, 38, '#a87848');
    P(-12, -40, 24, 2, '#c08a52');
    P(-8, -33, 16, 11, '#9cc0d8');
    P(-7, -32, 14, 9, '#b4d4e8');
    P(-1, -32, 2, 9, '#a87848');
    P(5, -19, 3, 3, '#e0c060');
    P(-8, -22, 11, 3, '#c8a24a');
    P(-9, -1, 18, 1, 'rgba(0,0,0,0.25)');
    return true;
  }

  if (k === 'c7Desk') {
    P(-17, -2, 34, 3, 'rgba(0,0,0,0.18)');
    P(-6, -25, 12, 9, '#8a5f3a');                 // chair back behind the desk
    P(-6, -25, 12, 2, '#a07450');
    P(-3, -20, 6, 2, '#6a4628');
    P(-17, -16, 34, 7, '#5a3c22');                // desk top
    P(-16, -15, 32, 4, '#d09a62');
    P(-16, -11, 32, 9, '#8a5f3a');                // front panel
    P(-15, -10, 30, 2, '#a5764c');
    P(-16, -3, 32, 1, '#4a3018');
    P(-14, -2, 3, 3, '#585864');                  // legs
    P(11, -2, 3, 3, '#585864');
    P(-9, -17, 12, 3, '#f0ece0');                 // notebook
    P(-9, -17, 12, 1, '#c8c4b8');
    P(5, -17, 7, 1, '#e0b040');                   // pencil
    return true;
  }

  if (k === 'c7Shelf') {
    // a tall bookcase, mostly full of the same textbook
    P(-14, -2, 28, 3, 'rgba(0,0,0,0.18)');
    P(-15, -46, 30, 44, '#6a4a30');
    P(-13, -44, 26, 40, '#4a3220');
    for (var sh = 0; sh < 3; sh++) {
      var sy = -38 + sh * 13;
      P(-13, sy, 26, 2, '#8a6238');
      for (var bk = 0; bk < 5; bk++) {
        var bc = ['#8a3a3a', '#3a5a7a', '#6a7a3a', '#8a6a2a', '#5a3a6a'][(bk + sh) % 5];
        P(-11 + bk * 5, sy - 9, 4, 9, bc);
        P(-11 + bk * 5, sy - 9, 4, 1, 'rgba(255,255,255,0.18)');
      }
    }
    P(-15, -46, 30, 2, '#8a6238');
    return true;
  }

  if (k === 'c7Plant') {
    P(-11, -4, 22, 4, 'rgba(0,0,0,0.20)');
    P(-9, -14, 18, 10, '#9a6a44');
    P(-8, -13, 16, 2, '#b07d52');
    P(-12, -38, 24, 24, '#2f5a34');
    P(-7, -46, 14, 12, '#3a7040');
    P(-16, -32, 9, 8, '#356338');
    P(8, -34, 9, 9, '#356338');
    P(-4, -42, 3, 9, '#4a8a4a');
    P(5, -36, 2, 8, '#4a8a4a');
    return true;
  }

  if (k === 'c7Mustang') {
    // a cherry red convertible, side on, top down, no plan
    P(-40, -8, 80, 5, 'rgba(0,0,0,0.22)');
    P(-38, -22, 76, 14, '#8a1f1f');
    P(-36, -24, 72, 8, '#b02a2a');
    P(-36, -23, 72, 2, '#e05656');                // chrome edge
    P(-42, -18, 4, 9, '#d0d0d8');                 // bumpers
    P(38, -18, 4, 9, '#d0d0d8');
    P(-20, -33, 30, 10, '#241818');               // open cabin
    P(-18, -30, 12, 7, '#3a2626');                // seats
    P(-4, -30, 12, 7, '#3a2626');
    P(-20, -34, 30, 2, '#1c1212');
    P(0, -32, 3, 9, 'rgba(150,190,220,0.35)');    // windscreen
    P(-30, -18, 60, 1, '#c83a3a');                // door seam and swage line
    P(6, -15, 1, 6, 'rgba(60,20,20,0.45)');
    P(-24, -26, 8, 6, '#9a2222');                 // rear deck
    P(14, -26, 14, 6, '#9a2222');                 // bonnet
    P(-30, -9, 13, 9, '#1a1a20');                 // wheels
    P(-27, -6, 7, 4, '#8a8a94');
    P(18, -9, 13, 9, '#1a1a20');
    P(21, -6, 7, 4, '#8a8a94');
    P(34, -21, 5, 3, '#f6f0c0');                  // headlight
    P(-40, -14, 4, 3, '#c83a3a');                 // tail light
    P(-14, -35, 2, 3, '#d0d0d8');                 // mirror
    return true;
  }

  if (k === 'c7Bunk') {
    P(-33, -2, 66, 3, 'rgba(0,0,0,0.2)');
    P(-33, -36, 3, 36, '#6a7078');                // posts
    P(30, -36, 3, 36, '#6a7078');
    P(-33, -37, 3, 2, '#8a9098');
    P(30, -37, 3, 2, '#8a9098');
    P(-31, -34, 61, 7, '#b8b2a0');                // top mattress
    P(-31, -27, 61, 3, '#4a5058');
    P(-31, -16, 61, 7, '#b8b2a0');                // bottom mattress
    P(-31, -9, 61, 3, '#4a5058');
    P(-31, -34, 26, 7, '#7a8a9a');                // blanket
    P(-31, -31, 26, 2, '#8fa0b0');
    P(14, -34, 15, 5, '#e6e0d0');                 // pillow
    P(14, -33, 15, 1, '#f4eee0');
    P(25, -27, 2, 20, '#8a9098');                 // ladder
    P(25, -22, 5, 1, '#a8b0b8');
    P(25, -17, 5, 1, '#a8b0b8');
    P(-12, -33, 8, 1, '#9a9484');                 // stains
    P(4, -15, 10, 1, '#9a9484');
    return true;
  }

  if (k === 'c7Stool') {
    P(-7, -3, 14, 3, 'rgba(0,0,0,0.20)');
    P(-7, -12, 14, 3, '#8a9098');
    P(-7, -13, 14, 1, '#a8b0b8');
    P(-6, -9, 2, 7, '#6a7078');
    P(4, -9, 2, 7, '#6a7078');
    P(-1, -9, 2, 6, '#5a6068');
    return true;
  }

  if (k === 'c7Toilet') {
    P(-8, -2, 16, 2, 'rgba(0,0,0,0.2)');
    P(-7, -16, 14, 6, '#b8bec6');
    P(-8, -18, 16, 3, '#c8ced6');
    P(-6, -12, 12, 6, '#a8aeb6');
    P(-5, -6, 10, 4, '#98a0a8');
    P(-6, -9, 12, 1, '#7f878f');
    return true;
  }

  if (k === 'c7CellWindow') {
    P(-15, -28, 30, 28, '#4a5058');
    P(-12, -25, 24, 22, '#8fa8c0');
    P(-12, -25, 24, 5, '#a8c0d4');
    P(-4, 0, 8, 22, 'rgba(255,240,200,0.10)');    // a shaft of daylight
    P(-9, -25, 2, 22, '#2a2e34');
    P(-3, -25, 2, 22, '#2a2e34');
    P(3, -25, 2, 22, '#2a2e34');
    P(9, -25, 2, 22, '#2a2e34');
    P(-15, -3, 30, 3, '#6a7078');
    return true;
  }

  if (k === 'c7CellSign') {
    P(-19, -13, 38, 13, '#6a7078');
    P(-17, -11, 34, 9, '#c8ccd2');
    c.save();
    c.fillStyle = '#2a2e34';
    c.font = '5px monospace';
    c.textAlign = 'center';
    c.fillText('CELL 4', e.px, e.py - 4);
    c.restore();
    return true;
  }

  if (k === 'c7Tally') {
    // four years of nothing to do, counted in groups of five
    for (var g = 0; g < 3; g++) {
      for (var i2 = 0; i2 < 4; i2++) {
        P(-26 + g * 12 + i2 * 3, -14, 1, 11, 'rgba(210,206,192,0.45)');
      }
      P(-26 + g * 12, -8, 10, 1, 'rgba(210,206,192,0.45)');
    }
    return true;
  }

  if (k === 'c7Speaker') {
    P(-1, -36, 2, 36, '#6a7078');
    P(-9, -46, 18, 11, '#8a9098');
    P(-11, -44, 4, 7, '#b0b8c0');
    P(-8, -45, 16, 2, '#a0a8b0');
    P(-1, -35, 2, 3, '#4a5058');
    return true;
  }

  if (k === 'c7Protest') {
    P(-1, -26, 2, 26, '#8a6a3a');
    P(-16, -44, 32, 19, '#e8e0cc');
    P(-16, -44, 32, 2, '#c8c0a8');
    P(-14, -42, 28, 15, '#f4ecd8');
    c.save();
    c.fillStyle = '#8a2a2a';
    c.font = 'bold 5px monospace';
    c.textAlign = 'center';
    c.fillText('FREE B-BUCK', e.px, e.py - 34);
    c.fillText('FREE GERALD', e.px, e.py - 28);
    c.restore();
    P(-4, -24, 3, 2, '#8a2a2a');                  // a paw print
    P(-5, -22, 5, 2, '#8a2a2a');
    return true;
  }

  if (k === 'c7Guard') {
    // the bored guard, phone up, outside the bars. proportions match drawChar
    P(-6, -2, 12, 3, 'rgba(0,0,0,0.22)');
    P(-5, -12, 10, 8, '#3a4a6a');                 // uniform
    P(-5, -12, 10, 2, '#4a5c80');
    P(-7, -10, 2, 6, '#3a4a6a');                  // arms
    P(5, -10, 2, 6, '#3a4a6a');
    P(-4, -4, 3, 4, '#2a3348');                   // legs
    P(1, -4, 3, 4, '#2a3348');
    P(-4, -17, 8, 7, '#e8b48c');                  // head
    P(-4, -18, 8, 2, '#3a2a1a');
    P(-3, -15, 1, 1, '#2b2b2b');
    P(2, -15, 1, 1, '#2b2b2b');
    P(4, -12, 5, 6, '#2b2b2b');                   // phone, held too high
    P(5, -11, 3, 4, '#8fd0e8');
    return true;
  }

  return false;
});

// ------------------------------------------------------------------- tiles

TILE_HOOKS.push(function (c, kind, tx, ty) {
  var x = tx * TILE, y = ty * TILE, r = hash(tx, ty, 31);
  function R(px, py, w, h, col) { c.fillStyle = col; c.fillRect(x + px, y + py, w, h); }

  if (kind === 'c7Wall') {
    R(0, 0, 16, 16, r > 0.5 ? '#d8c8a6' : '#d3c3a1');
    R(0, 0, 16, 1, 'rgba(255,246,226,0.18)');
    R(0, 15, 16, 1, 'rgba(90,64,38,0.16)');
    if (r > 0.82) R(3, 5, 5, 1, 'rgba(150,120,84,0.16)');
    if (r < 0.14) R(9, 10, 4, 1, 'rgba(255,248,232,0.18)');
    if (ty === 0) {                                  // cornice
      R(0, 0, 16, 3, '#b09873');
      R(0, 3, 16, 2, '#e8dcc4');
    }
    if (ty >= 16) {                                  // skirting
      R(0, 6, 16, 10, '#a8845f');
      R(0, 6, 16, 2, '#c8a276');
      R(0, 15, 16, 1, 'rgba(60,40,20,0.35)');
    }
    return true;
  }

  if (kind === 'c7Floor') {
    // warm school planks, dark enough to separate from the wall
    R(0, 0, 16, 16, r > 0.5 ? '#8a6238' : '#855d34');
    R(0, 0, 16, 1, '#9a7042');
    R(0, 6, 16, 1, 'rgba(70,44,22,0.45)');
    R(0, 14, 16, 1, 'rgba(70,44,22,0.35)');
    if (r > 0.7) R(3 + Math.floor(r * 6), 2, 7, 1, 'rgba(110,80,46,0.35)');
    if (r < 0.2) R(2, 9, 5, 1, 'rgba(120,88,52,0.30)');
    if (r > 0.94) R(11, 10, 2, 1, '#6b4a28');        // a knot
    return true;
  }

  if (kind === 'jailFloor') {
    R(0, 0, 16, 16, r > 0.5 ? '#7d7e76' : '#797a72');
    R(0, 0, 16, 1, 'rgba(255,255,255,0.04)');
    if (r > 0.86) R(4, 6, 6, 1, '#6c6d66');
    if (r < 0.12) R(10, 3, 3, 1, '#87887f');
    if (tx % 8 === 0) R(0, 0, 1, 16, 'rgba(50,52,48,0.26)');
    if (ty % 8 === 0) R(0, 0, 16, 1, 'rgba(50,52,48,0.26)');
    if (r > 0.97) { R(6, 11, 4, 1, '#5f615a'); R(7, 12, 1, 2, '#5f615a'); }
    return true;
  }

  if (kind === 'jailWall') {
    R(0, 0, 16, 16, r > 0.5 ? '#6a6f6a' : '#666b66');
    // cinder blocks, offset every other row
    var off = (ty % 2) ? 8 : 0;
    R(0, 0, 16, 1, '#7c817b');
    R(0, 7, 16, 1, '#545952');
    R(0, 15, 16, 1, '#4e534c');
    R(off, 0, 1, 7, '#545952');
    R((off + 8) % 16, 8, 1, 7, '#545952');
    R(2, 2, 5, 1, 'rgba(255,255,255,0.05)');
    if (r > 0.9) R(6, 10, 5, 2, 'rgba(40,44,40,0.30)');
    if (ty >= 16) R(0, 0, 16, 2, 'rgba(20,24,20,0.25)');
    return true;
  }

  if (kind === 'jailBars') {
    // a cell front: bright bars over the dark corridor, so the gate reads
    R(0, 0, 16, 16, '#22262b');
    R(0, 0, 16, 3, '#2e333a');
    for (var b = 0; b < 16; b += 6) {
      R(b + 1, 0, 3, 16, '#8a919b');
      R(b + 1, 0, 1, 16, '#b4bbc4');
      R(b + 3, 0, 1, 16, '#5f666f');
    }
    R(0, 2, 16, 2, '#747b85');                      // cross rails
    R(0, 13, 16, 2, '#747b85');
    R(0, 2, 16, 1, '#9aa1ab');
    R(0, 13, 16, 1, '#9aa1ab');
    return true;
  }

  return false;
});

// ------------------------------------------------------------------ battle

function ch7Ent(id) {
  for (var i = 0; i < G.ents.length; i++) if (G.ents[i].id === id) return G.ents[i];
  return null;
}

function ch7RoundStart() {
  if (G.level !== 'ch7' || !G.flags.ch7_battle || G.flags.ch7_won) return;
  CH7.t = 12;
  CH7.sel = 0;
  CH7.locked = false;
  G.perform = true;
  var bank = CH7.banks[(G.flags.ch7_round || 0) % CH7.banks.length];
  var taunt = bank.taunt;
  if ((G.flags.ch7_round || 0) >= 3 && !CH7.saidRunback) {
    CH7.saidRunback = true;
    taunt = 'Run it back. I have not even taken my jacket off.';
  }
  say([{ who: 'gerald', text: taunt }]);
}

function ch7BattleStart() {
  G.flags.ch7_battle = true;
  G.flags.ch7_flow = 100;
  G.flags.ch7_crowd = 12;
  G.flags.ch7_round = 0;
  G.flags.ch7_rounds = 0;
  G.flags.ch7_won = false;
  CH7.saidRunback = false;
  saveGame();
  SFX.tone(96, 0.22, 'triangle', 0.06);
  toast('up / down to pick, E to spit');
  ch7RoundStart();
}

function ch7Pick(i) {
  if (G.level !== 'ch7' || !G.flags.ch7_battle || G.flags.ch7_won) return;
  if (DLG.active || CH7.locked) return;
  var bank = CH7.banks[(G.flags.ch7_round || 0) % CH7.banks.length];
  var bar = bank.bars[i];
  if (!bar) return;

  CH7.locked = true;
  if (bar.good) {
    G.flags.ch7_flow = ch7Clamp((G.flags.ch7_flow || 0) - 36);
    G.flags.ch7_crowd = ch7Clamp((G.flags.ch7_crowd || 0) + 26);
    G.flags.ch7_rounds = (G.flags.ch7_rounds || 0) + 1;
    SFX.pickup();
    FX.burst(G.px, G.py - 16, '#f0c060', 14, { speed: 60, life: 0.6, lift: 34 });
    FX.pop(G.px, G.py - 30, 'FLOW -36', '#9be08a');
  } else {
    G.flags.ch7_flow = ch7Clamp((G.flags.ch7_flow || 0) + 12);
    G.flags.ch7_crowd = ch7Clamp((G.flags.ch7_crowd || 0) - 6);
    SFX.tone(140, 0.14, 'square', 0.05);
    FX.pop(G.px, G.py - 30, 'FLOW +12', '#e8607a');
  }
  saveGame();

  var lines = [
    { who: 'bucktooth', text: bar.lines[0] },
    { who: 'bucktooth', text: bar.lines[1] },
    { who: 'gerald', text: bar.good ? bank.goodReply : bank.badReply }
  ];
  if (bar.good) lines.push({ who: 'narrator', text: bank.goodNote });

  say(lines, function () {
    CH7.locked = false;
    if (G.flags.ch7_flow <= 0 || G.flags.ch7_crowd >= 100) { ch7Win(); return; }
    G.flags.ch7_round = (G.flags.ch7_round || 0) + 1;
    ch7RoundStart();
  });
}

function ch7Timeout() {
  if (!G.flags.ch7_battle || G.flags.ch7_won || CH7.locked || DLG.active) return;
  CH7.locked = true;
  G.flags.ch7_crowd = ch7Clamp((G.flags.ch7_crowd || 0) - 8);
  G.flags.ch7_flow = ch7Clamp((G.flags.ch7_flow || 0) + 8);
  SFX.tone(120, 0.2, 'square', 0.05);
  FX.pop(G.px, G.py - 30, 'TOO SLOW', '#e8607a');
  saveGame();
  say([
    { who: 'gerald', text: 'Take your time. I am only getting smoother.' },
    { who: 'narrator', text: 'The crowd checked its phone. The crowd meter sagged.' }
  ], function () {
    if (G.flags.ch7_won) return;
    CH7.locked = false;
    CH7.t = 12;
    CH7.sel = 0;
  });
}

KEY_HOOKS.push(function (k) {
  if (G.level !== 'ch7' || !G.flags.ch7_battle || G.flags.ch7_won) return false;
  if (DLG.active) return false;
  if (k === 'arrowup' || k === 'w') { CH7.sel = (CH7.sel + 2) % 3; SFX.blip(720, 0.04); return true; }
  if (k === 'arrowdown' || k === 's') { CH7.sel = (CH7.sel + 1) % 3; SFX.blip(720, 0.04); return true; }
  if (k === '1' || k === '2' || k === '3') {
    var n = parseInt(k, 10) - 1;
    if (!CH7.locked) { CH7.sel = n; ch7Pick(n); }
    return true;
  }
  return false;
});

ACTION_HOOKS.push(function () {
  if (G.level !== 'ch7' || !G.flags.ch7_battle || G.flags.ch7_won) return false;
  if (DLG.active || CH7.locked) return false;
  ch7Pick(CH7.sel);
  return true;
});

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch7') return;
  // a hidden tab or a long frame must not eat the whole round
  dt = Math.min(dt || 0, 0.1);

  // the Mustang crossing the classroom window
  if (CH7.carT > 0) {
    CH7.carT -= dt;
    var car = ch7Ent('car7');
    if (car) {
      car.px += dt * 250;
      if (car.px > W + 90 || CH7.carT <= 0) { car.px = -140; CH7.carT = 0; }
    }
  }

  if (!G.flags.ch7_battle || G.flags.ch7_won) return;

  // he recovers while he is talking, and slowly while you are choosing
  G.flags.ch7_flow = ch7Clamp((G.flags.ch7_flow || 0) + dt * (DLG.active ? 1.5 : 0.5));

  // a held d-pad on a touch screen still has to move the highlight
  if (typeof touch !== 'undefined' && touch.on && !DLG.active) {
    if (touch.dy !== 0 && !CH7.touchHeld) {
      CH7.sel = (CH7.sel + (touch.dy > 0 ? 1 : 2)) % 3;
      CH7.touchHeld = true;
      SFX.blip(720, 0.04);
    } else if (touch.dy === 0) {
      CH7.touchHeld = false;
    }
  }

  if (DLG.active || CH7.locked) return;
  CH7.t -= dt;
  if (CH7.t <= 0) ch7Timeout();
});

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch7' || !G.flags.ch7_battle || G.flags.ch7_won) return;
  var flow = ch7Clamp(G.flags.ch7_flow || 0);
  var crowd = ch7Clamp(G.flags.ch7_crowd || 0);
  var bx = 10, by = 22, bw = 136;

  c.fillStyle = 'rgba(18,16,28,0.86)';
  c.fillRect(bx - 4, by - 2, bw + 8, 50);
  c.strokeStyle = 'rgba(244,228,192,0.35)';
  c.lineWidth = 1;
  c.strokeRect(bx - 3.5, by - 1.5, bw + 7, 49);

  c.font = '6px monospace';
  c.fillStyle = '#f0a8b4';
  c.fillText('GERALD FLOW', bx, by + 5);
  c.textAlign = 'right';
  c.fillStyle = '#f4efe4';
  c.fillText('' + Math.round(flow), bx + bw, by + 5);
  c.textAlign = 'left';

  c.fillStyle = '#2a2438';
  c.fillRect(bx, by + 8, bw, 6);
  c.fillStyle = '#e8607a';
  c.fillRect(bx, by + 8, bw * flow / 100, 6);

  c.fillStyle = '#f0c060';
  c.font = '6px monospace';
  c.fillText('CROWD', bx, by + 23);
  c.textAlign = 'right';
  c.fillStyle = '#f4efe4';
  c.fillText('' + Math.round(crowd), bx + bw, by + 23);
  c.textAlign = 'left';

  c.fillStyle = '#2a2438';
  c.fillRect(bx, by + 26, bw, 6);
  c.fillStyle = '#f0c060';
  c.fillRect(bx, by + 26, bw * crowd / 100, 6);

  var t = Math.max(0, Math.min(12, CH7.t));
  c.fillStyle = 'rgba(244,228,192,0.72)';
  c.font = '6px monospace';
  c.fillText('ROUND ' + ((G.flags.ch7_round || 0) + 1), bx, by + 42);
  c.textAlign = 'right';
  c.fillStyle = t < 4 ? '#e8607a' : 'rgba(244,228,192,0.72)';
  c.fillText(Math.ceil(t) + 's', bx + bw, by + 42);
  c.textAlign = 'left';
  c.fillStyle = '#2a2438';
  c.fillRect(bx, by + 44, bw, 2);
  c.fillStyle = t < 4 ? '#e8607a' : '#9be08a';
  c.fillRect(bx, by + 44, bw * t / 12, 2);

  if (DLG.active) return;

  // the word bank: three cards along the bottom, one of them rhymes
  var bank = CH7.banks[(G.flags.ch7_round || 0) % CH7.banks.length];
  var cw = 148, gap = 9, total = cw * 3 + gap * 2;
  var ox = (W - total) / 2, oy = 160, chh = 38;

  for (var i = 0; i < bank.bars.length; i++) {
    var row = ox + i * (cw + gap), bar = bank.bars[i], sel = i === CH7.sel;
    c.fillStyle = sel ? 'rgba(60,44,26,0.92)' : 'rgba(18,16,28,0.88)';
    c.fillRect(row, oy, cw, chh);
    c.strokeStyle = sel ? 'rgba(240,192,96,0.95)' : 'rgba(244,228,192,0.20)';
    c.lineWidth = 1;
    c.strokeRect(row + 0.5, oy + 0.5, cw - 1, chh - 1);
    if (sel) {
      c.fillStyle = '#f0c060';
      c.fillRect(row + 1, oy + 1, cw - 2, 3);
    }
    c.font = 'bold 8px monospace';
    c.fillStyle = sel ? '#fff6e0' : '#ded4be';
    c.fillText(bar.tag, row + 9, oy + 15);
    c.font = '7px monospace';
    c.fillStyle = sel ? 'rgba(255,244,214,0.85)' : 'rgba(206,196,176,0.62)';
    c.fillText(bar.bank, row + 9, oy + 27);
    c.textAlign = 'right';
    c.font = '6px monospace';
    c.fillStyle = sel ? '#f0c060' : 'rgba(200,190,170,0.45)';
    c.fillText(sel ? '[E]' : '' + (i + 1), row + cw - 9, oy + 15);
    c.textAlign = 'left';
  }
});

// ----------------------------------------------------------------- scripts

SCRIPT.ch7Henderson = function () {
  if (G.flags.ch7_stage !== undefined) {
    say([{ who: 'henderson', text: 'Back to your seat, Mav. You are dripping on the floor and it is not even your floor.' }]);
    return;
  }
  G.flags.ch7_sticky = true;
  say([
    { who: 'narrator', text: 'Mav wiped the banana cream pie off his face. Most of it. A white streak stayed on his cheek, which he chose to consider a badge.' },
    { who: 'henderson', text: 'Well, Mav, you look remarkably sweet today! Did you have a bake sale disaster?' },
    { who: 'maverick', text: 'No, sir. I had a beaver disaster.', choices: [
      { label: 'A beaver disaster, sir.', reply: [
        { who: 'maverick', text: 'He is a terrible influence. He teaches me to steal cheese and he is probably a fugitive.' },
        { who: 'henderson', text: 'Nonsense, Mav. Professor Bucktooth? Why, he was one of the brightest students ever to grace these halls!' },
        { who: 'henderson', text: 'Top of his class in advanced water hydraulics, back in his day. A gentleman of learning, that beaver!' }
      ] },
      { label: 'A bake sale. I lost.', reply: [
        { who: 'henderson', text: 'A bake sale casualty! We have all been there, son.' },
        { who: 'maverick', text: 'It was not a bake sale. It was a beaver. He used the staff parking lot as a personal donut arena.' },
        { who: 'henderson', text: 'Nonsense. Professor Bucktooth was one of the brightest students ever to grace these halls. A gentleman of learning!' }
      ] }
    ] },
    { who: 'maverick', text: 'He is a gentleman who just did a donut in the staff parking lot.' },
    { who: 'narrator', text: 'Then the door banged open hard enough to rattle the chalk tray.' }
  ], function () {
    G.flags.ch7_stage = 1;
    G.flags.seen_agentA = true;
    G.flags.seen_agentB = true;
    saveGame();
    buildScene('c7_class');
    ch7FBI();
  });
};

function ch7FBI() {
  say([
    { who: 'fbi', text: 'Freeze! Federal Bureau of Investigation!' },
    { who: 'narrator', text: 'Two agents in sharp suits rushed in. They were wearing clip-on sunglasses indoors, which is how you know they meant business.' },
    { who: 'fbi', text: 'Is that banana cream pie residue?' },
    { who: 'narrator', text: 'The lead agent pointed dramatically at Mav\'s face.' },
    { who: 'fbi', text: 'We have credible intelligence that Professor Balthazar Bucktooth is a contaminated source! Beavers are strictly prohibited within a five-mile radius of a school cafeteria, per FDA statute 404-B!' },
    { who: 'maverick', text: 'You are arresting him for cafeteria contamination?' },
    { who: 'fbi', text: 'Precisely! He may have caused a food safety incident with his structural debris! We cannot have beaver-borne germs near the children\'s meals!' },
    { who: 'narrator', text: 'Outside the window, a cherry red Mustang rolled past at a speed that suggested no brakes and no plan.' }
  ], function () {
    var car = ch7Ent('car7');
    if (car) { car.px = -70; car.py = 2 * TILE; }
    CH7.carT = 2.4;
    SFX.tone(180, 0.5, 'sawtooth', 0.05);
    say([
      { who: 'narrator', text: 'Professor Bucktooth, having apparently circled back, zoomed right past the classroom window and gave a cheerful wave.' },
      { who: 'bucktooth', text: 'Wait! The statute of limitations must have expired on beaver-based food crimes!' },
      { who: 'fbi', text: 'I do not care!' },
      { who: 'narrator', text: 'The agent executed a sudden, impressive backflip and landed perfectly in front of the car.' },
      { who: 'narrator', text: 'He produced a set of comically large handcuffs.' },
      { who: 'maverick', text: 'That is not a legal maneuver.' },
      { who: 'henderson', text: 'It is not, but it is very committed.' }
    ], ch7Arrest);
  });
}

function ch7Arrest() {
  G.flags.ch7_stage = 2;
  saveGame();
  say([
    { who: 'narrator', text: 'Minutes later, Professor Bucktooth was booked and sent to the local county jail.' },
    { who: 'narrator', text: 'Mav was not under arrest. Mav was, according to the paperwork, evidence.' },
    { who: 'narrator', text: '[County jail, cell four. Talk to the cat.]' }
  ], function () {
    G.toScene('c7_cell', 13, 12, 'left');
    setTimeout(ch7CellArrival, 900);
  });
}

function ch7CellArrival() {
  if (G.sceneId !== 'c7_cell') return;
  say([
    { who: 'narrator', text: 'Cell four smelled like bleach, regret, and one very expensive cologne.' },
    { who: 'narrator', text: 'Bucktooth paced. In the corner, a large tabby cat in a silk smoking jacket regarded them both like a bad review.' },
    { who: 'maverick', text: 'Are you the lawyer?' },
    { who: 'gerald', text: 'I am the cellmate. The lawyer is a parrot and he is late.' }
  ]);
}

SCRIPT.ch7Gerald = function () {
  if (G.flags.ch7_won) {
    say([{ who: 'gerald', text: 'I am still not saying you won. I am saying I am tired of standing.' }]);
    return;
  }
  if (G.flags.ch7_battle) {
    say([{ who: 'gerald', text: 'Pick a bar, Professor. The guard is still filming.' }]);
    return;
  }
  say([
    { who: 'gerald', text: 'So, food safety violations, eh? I am in for tax evasion and a severe lack of chill. Name is Gerald. I used to produce beats.' },
    { who: 'bucktooth', text: 'Beats? I am the Bucktooth Bandit! A structural poet of sound!' },
    { who: 'narrator', text: 'And right there, in the local prison cell, the two launched into the silliest, most intricate freestyle rap battle the jail had ever witnessed.' },
    { who: 'maverick', text: 'I am not a participant. I am a witness. And apparently I am the ghostwriter.' },
    { who: 'narrator', text: '[Pick a bar with up and down. Press E to spit it. Keep the crowd up. Keep Gerald down.]' }
  ], ch7BattleStart);
};

SCRIPT.ch7Agent = function () {
  if (G.flags.ch7_stage >= 2) {
    say([{ who: 'fbi', text: 'The beaver is in holding. Do not touch the pie. Do not be the pie.' }]);
    return;
  }
  say([{ who: 'fbi', text: 'We are Federal. We are Bureau. We are Investigation. Please sit down.' }]);
};

SCRIPT.ch7Guard = function () {
  if (G.flags.ch7_won) {
    say([{ who: 'guard', text: 'You are at four million views. My thumb hurts. Keep going.' }]);
    return;
  }
  say([{ who: 'guard', text: 'Keep it down. Or do not. I am recording either way.' }]);
};

SCRIPT.ch7Sign = function () {
  say([{ who: 'narrator', text: 'CELL 4. OCCUPANTS: one beaver, one cat, one witness.' }]);
};

SCRIPT.ch7Tally = function () {
  say([{ who: 'narrator', text: 'Someone counted the days on this wall in groups of five. Then stopped at fourteen, which is the most Gerald thing in the room.' }]);
};

SCRIPT.ch7Toilet = function () {
  say([{ who: 'maverick', text: 'I am not using that. I am not even looking at that.' }]);
};

SCRIPT.ch7Kid = function () {
  say([{ who: 'kid', text: 'Free B-Buck! He is the only one who says hi to us at the fence!' }]);
};

function ch7Win() {
  G.flags.ch7_won = true;
  G.flags.ch7_battle = false;
  G.perform = false;
  G.flash = 0.35;
  saveGame();
  SFX.fanfare();
  FX.confetti(G.px, G.py - 12);
  say([
    { who: 'gerald', text: 'Okay. Okay. The cat concedes. That last one had a foundation.' },
    { who: 'bucktooth', text: 'I have been saying that for years.' },
    { who: 'narrator', text: 'The cell went quiet. Then a bored prison guard looked up from his phone.' },
    { who: 'guard', text: 'Do that again. I was recording.' },
    { who: 'narrator', text: 'He had been recording the whole thing for his Instagram.' },
    { who: 'narrator', text: 'The clip went viral instantly. Millions of views. The hashtag was #BeaverAndTheCat.' },
    { who: 'guard', text: 'You are at four million. My thumb hurts.' },
    { who: 'narrator', text: 'Within the hour, a massive mob of feral children and enthusiastic cats surrounded the prison.' },
    { who: 'narrator', text: '[Outside. Something is happening.]' }
  ], ch7WinExit);
}

function ch7WinExit() {
  G.toScene('c7_curb', 17, 9, 'up');
  setTimeout(ch7CurbArrival, 900);
}

function ch7CurbArrival() {
  if (G.sceneId !== 'c7_curb') return;
  G.flags.ch7_stage = 3;
  saveGame();
  say([
    { who: 'narrator', text: 'The mob pressed against the front of the county jail, chanting in one enormous, badly timed voice.' },
    { who: 'narrator', text: '"FREE B-BUCK! FREE GERALD! WE DEMAND MORE TWEED AND MORE BEATS!"' },
    { who: 'maverick', text: 'Stop! Listen to me!', choices: [
      { label: 'These two are a menace!', reply: [
        { who: 'maverick', text: 'They are bad influences! The professor just stole a wheel of gouda! They should stay locked up for the good of society!' },
        { who: 'narrator', text: 'The mob of children and cats shrugged collectively, totally unimpressed by the truth.' }
      ] },
      { label: 'Please disperse. I am sticky.', reply: [
        { who: 'maverick', text: 'I am covered in pie and I have had a very long day. Please go home.' },
        { who: 'narrator', text: 'A small child handed Mav a napkin, then went back to chanting. The mob was not moved.' }
      ] },
      { label: 'Free B-Buck, I guess.', reply: [
        { who: 'maverick', text: 'Free B-Buck. I guess. I do not know why I said that.' },
        { who: 'narrator', text: 'The mob cheered. Mav felt his soul leave through his shoes.' }
      ] }
    ] },
    { who: 'narrator', text: 'Then a loudspeaker crackled to life.' },
    { who: 'narrator', text: '"Due to overwhelming public pressure and a highly profitable viral video, a full executive pardon has been issued for Professor Bucktooth and Gerald Barreled!"' }
  ], function () {
    G.flags.seen_buckCurb = true;
    G.flags.seen_geraldCurb = true;
    G.flags.seen_carCurb = true;
    saveGame();
    buildScene('c7_curb');
    SFX.fanfare();
    FX.confetti(20 * TILE, 10 * TILE);
    say([
      { who: 'narrator', text: 'The beaver and the cat were released to a roaring crowd.' },
      { who: 'narrator', text: 'Professor Bucktooth beamed and hopped into the Mustang. Gerald rode shotgun, still adjusting his smoking jacket.' },
      { who: 'gerald', text: 'I am only here for the air conditioning.' },
      { who: 'narrator', text: '[Talk to Bucktooth at the Mustang.]' }
    ]);
  });
}

SCRIPT.ch7BuckEnd = function () {
  if (G.flags.ch7_done) {
    say([{ who: 'narrator', text: 'The curb is empty. The Mustang is a rumour. You are still sticky.' }]);
    return;
  }
  G.flags.ch7_done = true;
  saveGame();
  var rounds = G.flags.ch7_rounds || 0;
  var crowd = Math.round(ch7Clamp(G.flags.ch7_crowd || 0));
  say([
    { who: 'bucktooth', text: 'Perfect timing, Mav! Gerald knows a guy. A parrot with a counterfeit money printing setup!' },
    { who: 'bucktooth', text: 'We are staging a glorious, non-violent, but slightly illegal currency exchange. Hop in!' },
    { who: 'maverick', text: 'Why? Why do I keep getting wrapped up in this? Will a good-hearted, non-criminal friend ever show up in my life?' },
    { who: 'bucktooth', text: 'Do not worry about that, kid! You are having a story!' },
    { who: 'narrator', text: 'And with a peel of tires, the Mustang, carrying a beaver and a cat, sped off.' },
    { who: 'narrator', text: 'It left Mav utterly bewildered, alone on the curb, and still slightly sticky.' }
  ], function () {
    var score = Math.max(0, Math.min(100, Math.round(rounds * 12 + crowd * 0.6)));
    var label = rounds + ' rounds, crowd ' + crowd;
    cleared(7, score, label);
  });
};

// ----------------------------------------------------------------- chapter

CHAPTER_CONTENT[7] = {
  start: 'c7_class',

  intro: function () {
    chapterCard('CHAPTER SEVEN', 'The Unwarranted Pardon', 3.2);
    setTimeout(function () {
      if (G.level !== 'ch7') return;
      G.flags.ch7_stage = undefined;
      G.flags.ch7_sticky = true;
      G.flags.ch7_battle = false;
      G.flags.ch7_won = false;
      G.flags.ch7_flow = 100;
      G.flags.ch7_crowd = 12;
      G.flags.ch7_round = 0;
      G.flags.ch7_rounds = 0;
      G.flags.ch7_done = false;
      G.perform = false;
      CH7.carT = 0;
      CH7.locked = false;
      say([
        { who: 'narrator', text: 'Chapter seven. In which the federal government takes a personal interest in a beaver, and Mav is once again legally adjacent to a felony.' }
      ]);
    }, 900);
  },

  resume: function () {
    G.perform = !!(G.flags.ch7_battle && !G.flags.ch7_won);
    CH7.locked = false;
    if (G.flags.ch7_battle && !G.flags.ch7_won) {
      setTimeout(function () {
        if (G.level === 'ch7' && G.flags.ch7_battle && !G.flags.ch7_won) ch7RoundStart();
      }, 700);
    }
    // saved between the win and the walk outside: pick the exit back up
    if (G.flags.ch7_won && G.sceneId === 'c7_cell') {
      setTimeout(function () {
        if (G.level === 'ch7' && G.sceneId === 'c7_cell' && G.flags.ch7_won) ch7WinExit();
      }, 900);
    }
  },

  objective: function () {
    if (G.sceneId === 'c7_class') {
      if (G.flags.ch7_stage === undefined) return 'objective: talk to Mr Henderson';
      return 'objective: watch the parking lot';
    }
    if (G.sceneId === 'c7_cell') {
      if (G.flags.ch7_won) return 'objective: watch the guard';
      if (G.flags.ch7_battle) return 'objective: pick a bar (round ' + ((G.flags.ch7_round || 0) + 1) + ')';
      return 'objective: talk to Gerald';
    }
    if (G.sceneId === 'c7_curb') {
      if (G.flags.ch7_done) return '';
      if (!G.flags.seen_buckCurb) return 'objective: watch the crowd';
      return 'objective: talk to Bucktooth at the Mustang';
    }
    return '';
  }
};
