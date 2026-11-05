// ch08.js - Chapter 8: Mav and the Midnight Gnome Thieves
//
// Three in the morning, five porcelain gnomes, one porch light and one mother
// who is trying to sleep. Creep, pry, freeze, repeat.
//
//   c8_room   the bedroom window at 3 a.m.
//   c8_lawn   Mrs. Wallaby's front lawn, in the dark

NAMES.gerald = 'GERALD BARRELED';
NAMES.mum = 'MUM';

var CH8 = {
  need: 5,
  noise: 0,        // the sleeping-mum meter
  got: 0,
  lightX: 256,     // the porch light, sweeping
  lightDir: 1,
  lightOn: false,
  caught: 0,
  done: false
};

function ch8Reset() {
  CH8.noise = 0;
  CH8.got = 0;
  CH8.caught = 0;
  CH8.done = false;
  CH8.lightOn = false;
  G.flags.c8_got = 0;
  G.flags.c8_done = false;
  G.perform = false;
}

// ------------------------------------------------------------------- props

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (k !== 'c8Mustang' && k !== 'c8Bag' && k !== 'c8PorchLamp' && k !== 'c8WindowNight') return false;
  var P = propPainter(c, e);

  if (k === 'c8Mustang') {
    // headlights off, idling, very quietly
    P(-46, -2, 92, 5, 'rgba(0,0,0,0.30)');
    P(-44, -30, 88, 28, '#7a1c1c');
    P(-42, -28, 84, 24, '#9a2626');
    P(-40, -26, 80, 8, '#b03434');
    P(-28, -18, 40, 14, '#2a1a1a');
    P(-26, -16, 15, 11, '#3a2626');
    P(-4, -16, 15, 11, '#3a2626');
    P(-44, -30, 88, 2, '#c84040');
    P(-40, -33, 11, 3, '#22222a');
    P(28, -33, 11, 3, '#22222a');
    return true;
  }

  if (k === 'c8Bag') {
    // the black velvet bag Gerald drops
    P(-11, -13, 22, 13, '#1b1a22');
    P(-10, -12, 20, 11, '#25232e');
    P(-8, -16, 16, 4, '#141319');
    P(-2, -9, 4, 3, '#8a7a4a');            // the spoon, catching light
    return true;
  }

  if (k === 'c8PorchLamp') {
    P(-7, -9, 14, 9, '#3a3a42');
    P(-6, -8, 12, 7, CH8.lightOn ? '#ffe9a8' : '#4a4a52');
    P(-2, -3, 4, 3, '#2a2a30');
    return true;
  }

  if (k === 'c8WindowNight') {
    P(-24, -30, 48, 30, '#2a2a34');
    P(-21, -27, 42, 24, '#1a2236');
    P(-14, -20, 8, 6, '#3a4a6a');          // a lamp still on inside
    P(-12, -18, 4, 3, '#5a6a8a');
    P(-1, -27, 2, 24, '#2a2a34');
    P(-21, -15, 42, 2, '#2a2a34');
    return true;
  }
  return false;
});

// ------------------------------------------------------------------ scenes

SCENES.c8_room = {
  title: '3:00 AM',
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
    { id: 'win8', who: null, tx: 20, ty: 5, kind: 'c8WindowNight', noSolid: true, propScale: 1, reach: 60, talk: 'ch8Window' },
    { id: 'bed8', who: null, tx: 8, ty: 9, kind: 'c50Bed', solid: true, sw: 4, sh: 2, propScale: 1 },
    { id: 'exit8', exit: { to: 'c8_lawn', tx: 6, ty: 13, dir: 'right' }, tx: 16, ty: 16, rect: { w: 3, h: 1 } }
  ],
  overlay: function (c) {
    // three in the morning: almost no light at all
    c.fillStyle = 'rgba(8,10,22,0.62)';
    c.fillRect(0, 0, W, H);
  }
};

SCENES.c8_lawn = {
  title: "MRS. WALLABY'S LAWN, 3 A.M.",
  spawn: { tx: 6, ty: 13, dir: 'right' },
  camZoom: 1,
  fill: 'grass',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 2, y: 4, w: 28, h: 3, t: 'grass' },
    { x: 2, y: 13, w: 28, h: 2, t: 'cobble' },
    { x: 0, y: 17, w: 32, h: 1, t: 'tree' }
  ],
  solidKinds: ['tree'],
  entities: [
    // the house and its porch, north
    { id: 'hedge8a', who: null, tx: 5, ty: 11, kind: 'hedgeRow', solid: true, sw: 4, sh: 1, propScale: 1 },
    { id: 'hedge8b', who: null, tx: 18, ty: 11, kind: 'hedgeRow', solid: true, sw: 4, sh: 1, propScale: 1 },
    { id: 'rose8', who: null, tx: 26, ty: 11, kind: 'roseBush', solid: true, sw: 4, sh: 1, propScale: 1 },
    { id: 'picket8a', who: null, tx: 11, ty: 11, kind: 'picket', noSolid: true, propScale: 1 },
    { id: 'picket8b', who: null, tx: 24, ty: 11, kind: 'picket', noSolid: true, propScale: 1 },
    { id: 'lamp8', who: null, tx: 16, ty: 3, kind: 'c8PorchLamp', noSolid: true, propScale: 1 },
    { id: 'win8b', who: null, tx: 16, ty: 8, kind: 'c8WindowNight', noSolid: true, propScale: 1 },
    // five gnomes, and the two thieves
    { id: 'gn8_1', who: 'gnome', tx: 5, ty: 9, dir: 'down', small: true, reach: 30, talk: 'ch8Gnome' },
    { id: 'gn8_2', who: 'gnome', tx: 10, ty: 12, dir: 'down', small: true, reach: 30, talk: 'ch8Gnome' },
    { id: 'gn8_3', who: 'gnome', tx: 15, ty: 9, dir: 'down', small: true, reach: 30, talk: 'ch8Gnome' },
    { id: 'gn8_4', who: 'gnome', tx: 21, ty: 12, dir: 'down', small: true, reach: 30, talk: 'ch8Gnome' },
    { id: 'gn8_5', who: 'gnome', tx: 27, ty: 9, dir: 'down', small: true, reach: 30, talk: 'ch8Gnome' },
    { id: 'buck8', who: 'bucktooth', tx: 12, ty: 7, dir: 'down', reach: 70, talk: 'ch8Buck' },
    { id: 'gerald8', who: 'gerald', tx: 24, ty: 7, dir: 'down', reach: 70, talk: 'ch8Gerald' },
    { id: 'mustang8', who: null, tx: 8, ty: 15, kind: 'c8Mustang', noSolid: true, propScale: 1 },
    { id: 'bag8', who: null, tx: 16, ty: 15, kind: 'c8Bag', noSolid: true, propScale: 1, hidden: true }
  ],
  overlay: function (c) {
    // night over the whole yard
    c.fillStyle = 'rgba(8,12,30,0.55)';
    c.fillRect(0, 0, W, H);
    // the porch light, sweeping across the lawn
    var lx = CH8.lightX;
    var g = c.createRadialGradient(lx, 60, 8, lx, 60, CH8.lightOn ? 120 : 78);
    g.addColorStop(0, CH8.lightOn ? 'rgba(255,236,180,0.34)' : 'rgba(255,226,160,0.14)');
    g.addColorStop(1, 'rgba(255,226,160,0)');
    c.fillStyle = g;
    c.fillRect(lx - 130, 0, 260, 240);
    // the cone on the grass
    c.fillStyle = CH8.lightOn ? 'rgba(255,236,190,0.10)' : 'rgba(255,236,190,0.05)';
    c.beginPath();
    c.moveTo(lx - 14, 60);
    c.lineTo(lx + 14, 60);
    c.lineTo(lx + 70, 230);
    c.lineTo(lx - 70, 230);
    c.closePath();
    c.fill();
  }
};

// ----------------------------------------------------------------- scripts

SCRIPT.ch8Window = function () {
  if (G.flags.c8_seen) {
    say([{ who: 'narrator', text: 'The street is quiet now. The lawn is not going to steal itself back.' }]);
    return;
  }
  G.flags.c8_seen = true;
  say([
    { who: 'narrator', text: 'CLANK. WHISPER HISS. SCRAPE. And then a very quiet vroom, from a Mustang attempting to be stealthy.' },
    { who: 'maverick', text: 'I know that sound.' },
    { who: 'narrator', text: 'Down on the street, the cherry red Mustang idles with its headlights off. Professor Bucktooth is sweeping Mrs. Wallaby\'s lawn with his own tail. A cat in a silk smoking jacket is holding a large velvet bag.' },
    { who: 'maverick', text: 'Of course. It is three in the morning.' },
    { who: 'narrator', text: '[Go outside, quietly. The front door is south.]' }
  ], function () { toast('objective: get out to the lawn'); });
};

SCRIPT.ch8Buck = function () {
  if (CH8.got >= CH8.need) { ch8Confront(); return; }
  if (CH8.noise > 55) {
    say([{ who: 'bucktooth', text: 'Maverick! Keep the noise down! Her mother senses are resting and a rested mother is a weapon!' }]);
    return;
  }
  say([
    { who: 'bucktooth', text: 'Maverick! This is highly sensitive work! We are engaged in nocturnal, unauthorized structural relocation!' },
    { who: 'maverick', text: 'You are stealing Mrs. Wallaby\'s garden gnomes!' },
    { who: 'bucktooth', text: 'Correction. We are CURATING. Five minimum. Gerald needs the click clack of porcelain for his new beat.' }
  ]);
};

SCRIPT.ch8Gerald = function () {
  if (CH8.got >= CH8.need) { ch8Confront(); return; }
  say([
    { who: 'gerald', text: 'We are curating a retrospective on the Kitsch movement. These diminutive porcelain figures are key to the piece.' },
    { who: 'gerald', text: 'Do keep your voice down. The flow is delicate and the neighbours are asleep.' }
  ]);
};

// one gnome at a time, whichever is nearest
SCRIPT.ch8Gnome = function () {
  if (CH8.done) return;
  var best = null, bd = 1e9;
  for (var i = 0; i < G.ents.length; i++) {
    var e = G.ents[i];
    if (!e.id || e.id.indexOf('gn8_') !== 0 || e.hidden) continue;
    var d = Math.hypot(e.px - G.px, e.py - G.py);
    if (d < bd) { bd = d; best = e; }
  }
  if (!best) {
    say([{ who: 'narrator', text: 'The rest of the lawn is gnome shaped and empty.' }]);
    return;
  }
  best.hidden = true;
  CH8.got++;
  G.flags.c8_got = CH8.got;
  // porcelain on grass is not quiet
  CH8.noise = Math.min(100, CH8.noise + 26);
  G.shake = 0.35;
  SFX.blip(520, 0.06);
  FX.burst(best.px, best.py - 10, '#d8d0c0', 14, { speed: 50, life: 0.6, lift: 26 });
  FX.pop(G.px, G.py - 26, CH8.got + '/' + CH8.need, '#f0c060');
  if (CH8.got >= CH8.need) {
    say([
      { who: 'bucktooth', text: 'FIVE! The residency is complete!' },
      { who: 'narrator', text: 'Mav stood up in the dark with a gnome under each arm.' }
    ], function () { ch8Confront(); });
    return;
  }
  say([{ who: 'narrator', text: 'The gnome comes up with a soft, terrible SCHLOOP. Somewhere in the house, a floorboard considers its options.' }]);
};

function ch8Confront() {
  if (CH8.done) return;
  CH8.done = true;
  CH8.noise = 100;
  say([
    { who: 'maverick', text: 'If you do not stop right now, I am going to call my mother!' },
    { who: 'maverick', text: 'And she does not mind crime. But she really hates losing sleep.' },
    { who: 'bucktooth', text: 'Abort! Abort the mission! His mother is rested! Her powers will be at their peak! We must scatter!' },
    { who: 'narrator', text: 'They scrambled into the Mustang. In the rush, Gerald dropped the black velvet bag.' },
    { who: 'maverick', text: 'The gnomes!' },
    { who: 'bucktooth', text: 'Forget them! Save the important cargo!' },
    { who: 'narrator', text: 'The Mustang peeled away, leaving Mav alone in the dark with five gnomes and a bag.' }
  ], function () {
    var bag = G.ents.filter(function (e) { return e.id === 'bag8'; })[0];
    if (bag) bag.hidden = false;
    var b = G.ents.filter(function (e) { return e.id === 'buck8'; })[0];
    if (b) b.hidden = true;
    var g = G.ents.filter(function (e) { return e.id === 'gerald8'; })[0];
    if (g) g.hidden = true;
    G.flash = 0.4;
    setTimeout(function () {
      if (G.level !== 'ch8') return;
      say([
        { who: 'narrator', text: 'Mav looked in the bag. It did not contain gnomes. It contained one single, slightly tarnished silver spoon.' },
        { who: 'narrator', text: 'The handle was engraved: B.B. Best in Advanced Water Hydraulics, 1983.' },
        { who: 'maverick', text: '...Sure. Okay.' }
      ], function () {
        var score = Math.max(40, 100 - CH8.caught * 18);
        cleared(8, score, CH8.caught ? CH8.caught + ' times mum nearly woke' : 'nobody woke up');
      });
    }, 1200);
  });
}

// ------------------------------------------------------------------ ticking

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch8' || CH8.done) return;
  if (G.sceneId !== 'c8_lawn') return;

  // the porch light sweeps, and it is faster when mum is stirring
  var speed = 26 + CH8.noise * 0.5;
  CH8.lightX += CH8.lightDir * speed * dt;
  if (CH8.lightX > 430) { CH8.lightX = 430; CH8.lightDir = -1; }
  if (CH8.lightX < 82) { CH8.lightX = 82; CH8.lightDir = 1; }
  CH8.lightOn = CH8.noise > 62;

  var inLight = Math.abs(G.px - CH8.lightX) < 34 && G.py < 210;
  var moving = !!(keys['arrowleft'] || keys['arrowright'] || keys['arrowup'] || keys['arrowdown'] ||
                  keys['a'] || keys['d'] || keys['w'] || keys['s']);

  var gain = 0;
  if (inLight) gain += 34;
  if (moving) gain += 11;
  if (gain > 0) CH8.noise = Math.min(100, CH8.noise + gain * dt);
  else CH8.noise = Math.max(0, CH8.noise - 17 * dt);

  if (CH8.noise >= 100 && !CH8.done) ch8MumWakes();
});

function ch8MumWakes() {
  if (CH8.done) return;
  CH8.caught++;
  CH8.noise = 34;
  G.shake = 1.2;
  G.flash = 0.7;
  SFX.blip(180, 0.2);
  // one gnome goes back where it came from
  if (CH8.got > 0) {
    CH8.got--;
    G.flags.c8_got = CH8.got;
    var back = null;
    for (var i = 1; i <= CH8.need; i++) {
      var e = G.ents.filter(function (x) { return x.id === 'gn8_' + i; })[0];
      if (e && e.hidden) { back = e; break; }
    }
    if (back) back.hidden = false;
  }
  say([
    { who: 'narrator', text: 'A window bangs open upstairs. A voice that has been asleep for four hours says one word, and the word is "MAVERICK".' },
    { who: 'bucktooth', text: 'SCATTER! She is RESTED!' },
    { who: 'narrator', text: 'In the confusion a gnome is put back exactly where it came from. Nobody will ever admit to it.' }
  ], function () {
    if (G.level === 'ch8' && !CH8.done) toast('one gnome went back. the light is on her side now.');
  });
}

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch8' || G.chapter !== 8) return;
  if (G.sceneId !== 'c8_lawn' || CH8.done) return;

  // the mum meter
  var bw = 150, bx = (W - bw) / 2, by = 38;
  c.fillStyle = 'rgba(18,16,28,0.80)';
  c.fillRect(bx - 2, by - 2, bw + 4, 12);
  c.fillStyle = '#2a2434';
  c.fillRect(bx, by, bw, 8);
  var f = Math.max(0, Math.min(1, CH8.noise / 100));
  c.fillStyle = f > 0.8 ? '#e8404f' : f > 0.5 ? '#e8a040' : '#7ac0a0';
  c.fillRect(bx, by, bw * f, 8);
  c.font = '6px monospace';
  c.fillStyle = '#f0e4c8';
  c.textAlign = 'center';
  c.fillText('MUM ASLEEP', W / 2, by - 4);
  c.textAlign = 'left';

  // gnomes and the light warning
  c.font = '8px monospace';
  c.fillStyle = '#f0e4c8';
  c.fillText('GNOMES ' + CH8.got + '/' + CH8.need, 8, H - 12);
  if (CH8.lightOn) {
    c.fillStyle = '#ffd88a';
    c.textAlign = 'right';
    c.fillText('IN THE LIGHT', W - 8, H - 12);
    c.textAlign = 'left';
  }
});

// -------------------------------------------------------------------- entry

CHAPTER_CONTENT[8] = {
  start: 'c8_room',

  intro: function () {
    chapterCard('CHAPTER EIGHT', 'The Midnight Gnome Thieves', 3.2);
    ch8Reset();
    G.flags.c8_seen = false;
    setTimeout(function () {
      if (G.level !== 'ch8') return;
      say([
        { who: 'narrator', text: 'Chapter eight. In which the noises outside are extremely familiar and it is far too late for any of this.' }
      ]);
    }, 900);
  },

  resume: function () {
    G.perform = false;
  },

  objective: function () {
    if (CH8.done) return '';
    if (G.sceneId === 'c8_room') return G.flags.c8_seen ? 'objective: out the front door (south)' : 'objective: look out the window';
    if (G.sceneId === 'c8_lawn') {
      if (CH8.got >= CH8.need) return 'objective: talk to Bucktooth';
      return 'objective: pry up the gnomes, ' + (CH8.need - CH8.got) + ' to go. keep out of the light';
    }
    return '';
  }
};
