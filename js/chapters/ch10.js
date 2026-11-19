// ch10.js - Chapter 10: Mav and the Great Cheese-Rolling Conspiracy
//
// The hill is longer than the screen, so the hill comes to you: straw, racers
// and a wheel of cheese scroll up past a boy who is trying not to die.
//
//   c10_mall  the mall entrance, and a beaver with a plan
//   c10_hill  Cooper's Hill, Gloucestershire, going down
//   c10_pub   the pavement outside the pub, going nowhere

NAMES.gerald = NAMES.gerald || 'GERALD BARRELED';

var CH10 = {
  running: false,
  speed: 0,
  dist: 0,
  target: 1500,
  wipeouts: 0,
  cool: 0,
  cheeseY: -40,
  buckY: -80,
  hazards: [],
  done: false
};

function ch10Reset() {
  CH10.running = false;
  CH10.speed = 0;
  CH10.dist = 0;
  CH10.wipeouts = 0;
  CH10.cool = 0;
  CH10.cheeseY = -40;
  CH10.buckY = -80;
  CH10.done = false;
  CH10.hazards = [];
  G.flags.c10_done = false;
  G.perform = false;
}

// ------------------------------------------------------------------- props

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (k !== 'c10Straw' && k !== 'c10Cheese' && k !== 'c10Tumble' && k !== 'c10Barrier' &&
      k !== 'c10Crowd' && k !== 'c10PubDoor') return false;
  var P = propPainter(c, e);

  if (k === 'c10Straw') {
    P(-13, -2, 26, 4, 'rgba(0,0,0,0.24)');
    P(-13, -18, 26, 17, '#c9a24a');
    P(-11, -16, 22, 13, '#dbb85e');
    for (var s = 0; s < 12; s++) {
      P(-12 + (s % 6) * 4, -15 + Math.floor(s / 6) * 6, 3, 1, '#e8d07a');
      P(-10 + (s % 5) * 4, -11 + Math.floor(s / 5) * 6, 4, 1, '#b8923f');
    }
    P(-13, -3, 26, 3, '#a8842f');
    return true;
  }

  if (k === 'c10Cheese') {
    // the seven pound Double Gloucester, going about thirty
    P(-14, -14, 28, 28, 'rgba(0,0,0,0.22)');
    P(-13, -13, 26, 26, '#c98a2e');
    P(-11, -11, 22, 22, '#e0a63c');
    P(-11, -11, 22, 4, '#f0c060');
    P(-6, -8, 12, 5, '#f6d68a');
    P(-8, 2, 16, 3, '#b87a26');
    P(-13, -13, 26, 26, 'rgba(255,240,180,0.10)');
    return true;
  }

  if (k === 'c10Tumble') {
    // Bucktooth, end over end, wearing a driving cap
    P(-10, -12, 20, 14, 'rgba(0,0,0,0.20)');
    P(-11, -14, 22, 14, '#8a5a3a');
    P(-9, -12, 18, 10, '#a1704a');
    P(-6, -17, 12, 5, '#3a2e22');
    P(-7, -18, 14, 3, '#4a3a2a');
    P(-7, -9, 12, 3, '#f0e8d8');
    P(-5, -8, 3, 3, '#ffffff');
    return true;
  }

  if (k === 'c10Barrier') {
    // the start gate at the top, and the finish line at the bottom
    P(-40, -10, 80, 3, '#e8e2d0');
    P(-40, -10, 3, 14, '#c8c0a8');
    P(37, -10, 3, 14, '#c8c0a8');
    for (var f = 0; f < 10; f++) {
      P(-38 + f * 8, -8, 4, 6, f % 2 ? '#c8402f' : '#f0ece0');
    }
    return true;
  }

  if (k === 'c10Crowd') {
    P(-30, -14, 60, 14, '#6a7a5a');
    P(-30, -14, 60, 3, '#7d8d6a');
    return true;
  }
  return false;
});

// ------------------------------------------------------------------- scenes

SCENES.c10_mall = {
  title: 'THE MALL, AFTER EVERYTHING',
  spawn: { tx: 16, ty: 13, dir: 'up' },
  camZoom: 1,
  fill: 'c50Pave',
  rects: [
    { x: 0, y: 0, w: 32, h: 5, t: 'c50Brick' },
    { x: 0, y: 5, w: 32, h: 1, t: 'c50Pave' },
    { x: 0, y: 16, w: 32, h: 2, t: 'c50Pave' },
    { x: 0, y: 0, w: 1, h: 18, t: 'c50Brick' },
    { x: 31, y: 0, w: 1, h: 18, t: 'c50Brick' }
  ],
  solidKinds: ['c50Brick'],
  entities: [
    { id: 'adrian10', who: 'adrian', tx: 10, ty: 12, dir: 'right', reach: 60, talk: 'ch10Adrian' },
    { id: 'mustang10', who: null, tx: 22, ty: 12, kind: 'c8Mustang', noSolid: true, propScale: 1, reach: 60, talk: 'ch10Buck' },
    { id: 'exitHill', exit: { to: 'c10_hill', tx: 16, ty: 6, dir: 'down' }, tx: 16, ty: 0, rect: { w: 2, h: 1 } }
  ],
  overlay: function (c) {
    c.fillStyle = 'rgba(255,220,170,0.08)';
    c.fillRect(0, 0, W, H);
  }
};

SCENES.c10_hill = {
  title: "COOPER'S HILL",
  spawn: { tx: 16, ty: 4, dir: 'down' },
  camZoom: 1,
  fill: 'grass',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 0, w: 2, h: 18, t: 'tree' },
    { x: 30, y: 0, w: 2, h: 18, t: 'tree' },
    { x: 0, y: 16, w: 32, h: 2, t: 'tree' },
    // the course itself, a wide dirt run down the middle
    { x: 4, y: 2, w: 24, h: 15, t: 'mud' },
    { x: 3, y: 2, w: 1, h: 15, t: 'sand' },
    { x: 28, y: 2, w: 1, h: 15, t: 'sand' }
  ],
  solidKinds: ['tree'],
  entities: [
    { id: 'gate10', who: null, tx: 16, ty: 3, kind: 'c10Barrier', noSolid: true, propScale: 1 },
    { id: 'crowd10a', who: null, tx: 7, ty: 3, kind: 'c10Crowd', noSolid: true, propScale: 1 },
    { id: 'crowd10b', who: null, tx: 25, ty: 3, kind: 'c10Crowd', noSolid: true, propScale: 1 },
    { id: 'cheese10', who: null, tx: 16, ty: 0, kind: 'c10Cheese', noSolid: true, propScale: 1, hidden: true },
    { id: 'tumble10', who: null, tx: 12, ty: 0, kind: 'c10Tumble', noSolid: true, propScale: 1, hidden: true }
  ],
  overlay: function (c) {
    // an English afternoon, green and slightly damp
    c.fillStyle = 'rgba(120,170,110,0.10)';
    c.fillRect(0, 0, W, H);
  }
};

SCENES.c10_pub = {
  title: 'THE PAVEMENT OUTSIDE THE PUB',
  spawn: { tx: 16, ty: 12, dir: 'up' },
  camZoom: 1,
  fill: 'cobble',
  rects: [
    { x: 0, y: 0, w: 32, h: 5, t: 'c50Brick' },
    { x: 0, y: 0, w: 1, h: 18, t: 'c50Brick' },
    { x: 31, y: 0, w: 1, h: 18, t: 'c50Brick' },
    { x: 0, y: 15, w: 32, h: 3, t: 'c50Pave' }
  ],
  solidKinds: ['c50Brick'],
  entities: [
    { id: 'bouncer10', who: 'clerk', tx: 16, ty: 7, dir: 'down', reach: 64, talk: 'ch10Bouncer' },
    { id: 'buck10', who: 'bucktooth', tx: 10, ty: 7, dir: 'down', reach: 60, talk: 'ch10Pub' }
  ],
  overlay: function (c) {
    // evening, warm light from the pub windows
    c.fillStyle = 'rgba(20,30,60,0.22)';
    c.fillRect(0, 0, W, H);
    var g = c.createRadialGradient(W / 2, 40, 20, W / 2, 40, 200);
    g.addColorStop(0, 'rgba(255,206,130,0.22)');
    g.addColorStop(1, 'rgba(255,206,130,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
};

// ----------------------------------------------------------------- scripts

SCRIPT.ch10Adrian = function () {
  say([
    { who: 'adrian', text: 'You know, Mav, I think I need to go home. And I think I need to do the right thing.' },
    { who: 'maverick', text: 'You mean call the cops on the beaver?' },
    { who: 'adrian', text: 'No. I mean I need to Naruto run all the way home. It is the fastest, most effective way to process my trauma.' },
    { who: 'narrator', text: 'Adrian leaned forward, arms stretched back, and sprinted away from the mall entrance looking utterly ridiculous.' }
  ]);
};

SCRIPT.ch10Buck = function () {
  if (G.flags.c10_air) {
    say([{ who: 'bucktooth', text: 'England, Maverick! Brockworth! The hill does not wait and neither does the cheese.' }]);
    return;
  }
  say([
    { who: 'bucktooth', text: 'No time, Maverick! We are going international!' },
    { who: 'narrator', text: 'One minute Mav was at the mall. The next he was somehow through airport security, strapped into a first class seat on a one way flight.' },
    { who: 'maverick', text: 'Professor! Where are we going?! And how did we get through customs without a passport?' },
    { who: 'bucktooth', text: 'A gentleman never reveals his secrets, especially involving a well placed Balthazar Bucktooth Signature Stamp!' },
    { who: 'bucktooth', text: 'We are going to Brockworth, England! For the Cooper\'s Hill Cheese Rolling Race!' },
    { who: 'maverick', text: 'The race where people chase a giant wheel of cheese down a ridiculous hill and usually get hurt?' },
    { who: 'bucktooth', text: 'Precisely! And with two racers, our chances of snagging that glorious seven pound Double Gloucester are doubled!' },
    { who: 'narrator', text: 'The plane landed. The hill was worse than advertised. It went down at an angle that suggested the ground had given up.' },
    { who: 'bucktooth', text: 'Remember the plan! You go low, roll with the momentum, and try to keep your tweed vest clean! I shall rely on sheer dental power!' },
    { who: 'narrator', text: 'The official shouted: one to be ready, two to be steady, three to roll!' }
  ], function () {
    G.flags.c10_air = true;
    toast('objective: get down the hill. arrows to steer, avoid the straw');
  });
};

SCRIPT.ch10Bouncer = function () {
  say([{ who: 'clerk', text: 'Sorry, kid. No one under eighteen allowed. House rules. Come back with a beard and a grievance.' }]);
};

SCRIPT.ch10Pub = function () {
  say([{ who: 'bucktooth', text: 'Come on, Mav! Afterparty!' }]);
};

// ------------------------------------------------------------------ the run

function ch10Start() {
  CH10.running = true;
  CH10.speed = 62;
  CH10.dist = 0;
  CH10.wipeouts = 0;
  CH10.cool = 0;
  CH10.cheeseY = -30;
  CH10.buckY = -70;
  CH10.hazards = [];
  G.flags.c10_done = false;
  var ch = G.ents.filter(function (e) { return e.id === 'cheese10'; })[0];
  if (ch) ch.hidden = false;
  var tb = G.ents.filter(function (e) { return e.id === 'tumble10'; })[0];
  if (tb) tb.hidden = false;
  // a field of straw and rivals to feed down the hill
  var lanes = [90, 140, 190, 240, 290, 340, 390, 430];
  for (var i = 0; i < 26; i++) {
    CH10.hazards.push({
      x: lanes[i % lanes.length] + (i % 3) * 8,
      y: -40 - i * 46,
      type: i % 5 === 4 ? 'racer' : 'straw',
      hit: false
    });
  }
}

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch10') return;
  if (G.sceneId !== 'c10_hill' || !CH10.running || CH10.done) return;

  // the hill gets steeper as you go, because of course it does
  CH10.speed = Math.min(190, CH10.speed + dt * 7.5);
  CH10.dist += CH10.speed * dt;
  if (CH10.cool > 0) CH10.cool -= dt;

  // the player is pinned near the bottom of the frame and steers across it
  G.py = 15 * TILE;
  G.px = Math.max(3 * TILE + 10, Math.min(29 * TILE - 10, G.px));

  // the cheese and the beaver tumble ahead of him
  CH10.cheeseY += CH10.speed * 1.02 * dt;
  if (CH10.cheeseY > H + 40) CH10.cheeseY = -40;
  CH10.buckY += CH10.speed * 0.96 * dt;
  if (CH10.buckY > H + 40) CH10.buckY = -60;
  var ch = G.ents.filter(function (e) { return e.id === 'cheese10'; })[0];
  if (ch) { ch.px = 16 * TILE + Math.sin(G.time * 1.4) * 46; ch.py = CH10.cheeseY; }
  var tb = G.ents.filter(function (e) { return e.id === 'tumble10'; })[0];
  if (tb) { tb.px = 16 * TILE - 40 + Math.sin(G.time * 2.1) * 54; tb.py = CH10.buckY; }

  // the scenery comes up to meet you
  for (var i = 0; i < CH10.hazards.length; i++) {
    var hz = CH10.hazards[i];
    hz.y -= CH10.speed * dt;
    if (hz.y < -60) {
      hz.y = H + 40 + Math.random() * 220;
      hz.x = 60 + Math.random() * 380;
      hz.type = Math.random() < 0.22 ? 'racer' : 'straw';
      hz.hit = false;
    }
    if (hz.hit) continue;
    var d = Math.hypot(hz.x - G.px, hz.y - 12 - G.py);
    if (d < 16 && CH10.cool <= 0) {
      hz.hit = true;
      CH10.wipeouts++;
      CH10.cool = 1.1;
      CH10.speed = Math.max(58, CH10.speed * 0.55);
      CH10.dist = Math.max(0, CH10.dist - 60);
      G.shake = 1.3;
      G.flash = 0.5;
      SFX.tone(120, 0.22, 'sawtooth', 0.06);
      FX.burst(hz.x, hz.y, hz.type === 'straw' ? '#e8d07a' : '#c8402f', 18, { speed: 80, life: 0.7, lift: 30 });
      FX.pop(G.px, G.py - 28, 'WIPEOUT', '#e8607a');
      toast('wipeout. the hill is winning.');
    }
  }

  if (CH10.dist >= CH10.target) ch10Finish();
});

// hazards are drawn by a player hook so they sit over the hill
PLAYER_HOOKS.push(function (c) {
  if (G.level !== 'ch10' || G.sceneId !== 'c10_hill' || !CH10.running) return;
  for (var i = 0; i < CH10.hazards.length; i++) {
    var hz = CH10.hazards[i];
    if (hz.hit) continue;
    if (hz.type === 'straw') {
      c.fillStyle = 'rgba(0,0,0,0.22)';
      c.fillRect(hz.x - 13, hz.y - 2, 26, 4);
      c.fillStyle = '#c9a24a';
      c.fillRect(hz.x - 13, hz.y - 18, 26, 17);
      c.fillStyle = '#dbb85e';
      c.fillRect(hz.x - 11, hz.y - 16, 22, 12);
      c.fillStyle = '#e8d07a';
      for (var s = 0; s < 5; s++) c.fillRect(hz.x - 10 + s * 4, hz.y - 14 + (s % 2) * 4, 4, 1);
    } else {
      // a rival, face down, going faster than is sensible
      c.fillStyle = 'rgba(0,0,0,0.22)';
      c.fillRect(hz.x - 9, hz.y - 1, 18, 3);
      c.fillStyle = '#3a5a8a';
      c.fillRect(hz.x - 8, hz.y - 14, 16, 13);
      c.fillStyle = '#d8b48a';
      c.fillRect(hz.x - 4, hz.y - 19, 8, 6);
      c.fillStyle = '#6a3a2a';
      c.fillRect(hz.x - 5, hz.y - 21, 10, 3);
    }
  }
});

function ch10Finish() {
  if (CH10.done) return;
  CH10.done = true;
  CH10.running = false;
  G.flags.c10_done = true;
  SFX.fanfare();
  FX.confetti(G.px, G.py - 12);
  G.flash = 0.5;
  say([
    { who: 'narrator', text: 'Professor Bucktooth tumbled past the finish line end over end, a blur of tweed and teeth, and collided with a small pile of straw.' },
    { who: 'narrator', text: 'They won.' },
    { who: 'narrator', text: 'The crowd erupted. Photographers swarmed. Somebody measured the structural integrity of the vest and gave it a ten.' },
    { who: 'bucktooth', text: 'Because sometimes, Maverick, it is necessary to abide by the rules! Just occasionally!' },
    { who: 'maverick', text: 'Why risk everything for a single wheel of cheese when you know how to steal a bigger one?' },
    { who: 'bucktooth', text: 'I promised to share half the winnings with my noble accomplice. Here. The shoulder of the wheel. The best part.' }
  ], function () {
    G.toScene('c10_pub', 16, 12, 'up');
    setTimeout(function () {
      if (G.level !== 'ch10' || G.sceneId !== 'c10_pub') return;
      say([
        { who: 'narrator', text: 'The crowd hoisted the victorious Professor onto their shoulders and carried him toward the nearest pub.' },
        { who: 'bucktooth', text: 'Come on, Mav! Afterparty!' },
        { who: 'clerk', text: 'Sorry, kid. No one under eighteen allowed.' },
        { who: 'narrator', text: 'Mav was left on the pavement holding a giant chunk of cheese, watching his friend be celebrated by strangers.' },
        { who: 'narrator', text: 'A kind passer by, seeing the boy\'s confusion, handed him a small, shiny, slightly chipped rock.' },
        { who: 'maverick', text: '...Thank you?' }
      ], function () {
        var score = Math.max(40, 100 - CH10.wipeouts * 14);
        cleared(10, score, CH10.wipeouts ? CH10.wipeouts + ' wipeouts' : 'clean run down the hill');
      });
    }, 1200);
  });
}

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch10' || G.sceneId !== 'c10_hill' || !CH10.running) return;
  // how far down, and how badly
  var bw = 160, bx = (W - bw) / 2, by = 38;
  c.fillStyle = 'rgba(18,16,28,0.80)';
  c.fillRect(bx - 2, by - 2, bw + 4, 12);
  c.fillStyle = '#2a2434';
  c.fillRect(bx, by, bw, 8);
  var f = Math.min(1, CH10.dist / CH10.target);
  c.fillStyle = '#8ac06a';
  c.fillRect(bx, by, bw * f, 8);
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.fillRect(bx + bw - 3, by - 3, 3, 14);
  c.font = '6px monospace';
  c.fillStyle = '#f0e4c8';
  c.textAlign = 'center';
  c.fillText('DOWN THE HILL', W / 2, by - 4);
  c.textAlign = 'left';

  c.font = '8px monospace';
  c.fillStyle = '#f0e4c8';
  c.fillText('WIPEOUTS ' + CH10.wipeouts, 8, H - 12);
  c.textAlign = 'right';
  c.fillStyle = 'rgba(240,228,200,0.65)';
  c.fillText(Math.round(CH10.speed) + ' MPH', W - 8, H - 12);
  c.textAlign = 'left';
});

// -------------------------------------------------------------------- entry

CHAPTER_CONTENT[10] = {
  start: 'c10_mall',

  intro: function () {
    chapterCard('CHAPTER TEN', 'The Great Cheese-Rolling Conspiracy', 3.2);
    ch10Reset();
    G.flags.c10_air = false;
    setTimeout(function () {
      if (G.level !== 'ch10') return;
      say([
        { who: 'narrator', text: 'Chapter ten. In which a hill in Gloucestershire is attempted by a boy and a beaver, and only one of them enjoys it.' }
      ]);
    }, 900);
  },

  resume: function () {
    G.perform = false;
    if (G.sceneId === 'c10_hill') { CH10.running = false; toast('step back onto the hill to run it again'); }
  },

  objective: function () {
    if (G.sceneId === 'c10_mall') return G.flags.c10_air ? 'objective: get to the hill (through the north doors)' : 'objective: talk to Bucktooth at the Mustang';
    if (G.sceneId === 'c10_hill') return CH10.running ? 'objective: get down the hill, avoid the straw' : 'objective: start the run';
    if (G.sceneId === 'c10_pub') return '';
    return '';
  }
};

// stepping onto the hill starts the race
TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch10' || G.sceneId !== 'c10_hill') return;
  if (!G.flags.c10_air || CH10.running || CH10.done) return;
  if (DLG.active) return;
  ch10Start();
  toast('one to be ready, two to be steady, three to roll');
});
