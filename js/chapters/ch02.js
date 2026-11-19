// ch02.js - Chapter 2: Mav's Great Dam Disaster (the picture book version)
//
// One scene, one job: the creek is coming back, and the dam has to be finished
// before it does. Six logs, seventy five seconds, and a beaver supervising.
//
//   p_dam2   the drained creek, the broken dam, the woodpile

NAMES.wallaby = 'MRS. WALLABY';

// the drained creek bed: cracked mud, not a black hole
TILE_HOOKS.push(function (c, kind, tx, ty) {
  if (kind !== 'creekBed') return false;
  var x = tx * TILE, y = ty * TILE, r = hash(tx, ty, 31);
  c.fillStyle = r > 0.6 ? '#8a7256' : r > 0.3 ? '#846d52' : '#8f775a';
  c.fillRect(x, y, TILE, TILE);
  c.fillStyle = 'rgba(60,45,30,0.28)';
  if (r > 0.45) c.fillRect(x + (r * 9 | 0), y + 5, 7, 1);
  if (r < 0.35) c.fillRect(x + 3, y + 11, 5, 1);
  c.fillStyle = 'rgba(200,180,150,0.30)';
  c.fillRect(x + 2, y + 2, 2, 1);
  c.fillRect(x + 11, y + 9, 2, 1);
  if (r > 0.85) { c.fillStyle = '#a89680'; c.fillRect(x + 7, y + 7, 3, 2); }
  return true;
});

SCENES.p_dam2 = {
  title: 'THE DRAINED CREEK',
  spawn: { tx: 16, ty: 12, dir: 'up' },
  camZoom: 1,
  fill: 'mud',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
    // the reservoir still sitting behind the dam
    { x: 1, y: 2, w: 30, h: 3, t: 'water' },
    // the dam wall, with the hole they are trying to fill
    { x: 1, y: 5, w: 9, h: 3, t: 'dam' },
    { x: 22, y: 5, w: 9, h: 3, t: 'dam' },
    // the drained creek bed
    { x: 1, y: 8, w: 30, h: 4, t: 'creekBed' },
    // the near bank, then the path
    { x: 1, y: 12, w: 30, h: 2, t: 'grass' },
    { x: 1, y: 14, w: 30, h: 1, t: 'path' },
    { x: 1, y: 15, w: 30, h: 1, t: 'grass' },
    { x: 0, y: 16, w: 32, h: 2, t: 'tree' }
  ],
  solidKinds: ['tree', 'water', 'dam'],
  entities: [
    { id: 'pile', who: null, tx: 4, ty: 13, kind: 'woodpile', noSolid: true, propScale: 1, reach: 52, talk: 'ch2Pile' },
    { id: 'gapSpot', who: null, tx: 16, ty: 9, kind: null, noSolid: true, reach: 112, talk: 'ch2Place' },
    { id: 'logsPlaced', who: null, tx: 16, ty: 6, kind: 'placedLogs', noSolid: true, propScale: 1 },
    { id: 'surge', who: null, tx: 16, ty: 8, kind: 'creekSurge', noSolid: true, propScale: 1 },
    { id: 'buck2a', who: 'bucktooth', tx: 26, ty: 9, dir: 'left', reach: 56, talk: 'ch2Buck' },
    { id: 'sign2', who: 'sign', tx: 8, ty: 12, kind: 'sign', talk: 'ch2Sign' }
  ],
  overlay: function (c) {
    // the dam's shadow bleeds down the wall, so repaint the bed over it and
    // then put a soft shadow back in, just under the logs
    c.fillStyle = '#8a7256';
    c.fillRect(0, 130, W, 62);          // only the bed, rows 8 to 11
    for (var i = 0; i < 260; i++) {
      var h = hash(i, 3, 41);
      var px = Math.floor(h * W), py = 132 + Math.floor(hash(i, 7, 43) * 56);
      c.fillStyle = h > 0.55 ? 'rgba(60,45,30,0.22)' : 'rgba(210,190,160,0.28)';
      c.fillRect(px, py, h > 0.8 ? 3 : 2, 1);
    }
    var g = c.createLinearGradient(0, 128, 0, 168);
    g.addColorStop(0, 'rgba(30,22,14,0.55)');
    g.addColorStop(1, 'rgba(30,22,14,0)');
    c.fillStyle = g;
    c.fillRect(0, 128, W, 40);
  }
};

// -------------------------------------------------------------------- props

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (k !== 'woodpile' && k !== 'placedLogs' && k !== 'creekSurge') return false;
  var P = propPainter(c, e);

  if (k === 'woodpile') {
    var left = G.flags.pileLeft === undefined ? 6 : G.flags.pileLeft;
    P(-20, -2, 42, 3, 'rgba(0,0,0,0.22)');
    // stacked timber, one log per remaining piece
    for (var i = 0; i < left; i++) {
      var row = Math.floor(i / 3), col = i % 3;
      var lx = -19 + col * 13, ly = -9 - row * 8;
      P(lx, ly, 12, 7, '#8d6b3a');
      P(lx, ly, 12, 1, '#b08a52');
      P(lx, ly + 6, 12, 1, '#5f4522');
      P(lx + 1, ly + 2, 3, 4, '#c9a066');
      P(lx + 6, ly + 4, 5, 1, 'rgba(88,58,28,0.45)');
    }
    if (left === 0) P(-18, -7, 36, 5, 'rgba(70,50,26,0.40)');
    return true;
  }

  if (k === 'placedLogs') {
    // six slots across the ten tile gap, filled left to right
    var n = G.flags.logs || 0;
    var hint = G.flags.carryLog && !DLG.active;
    for (var s = 0; s < 6; s++) {
      var sx = s * 26;
      if (s < n) {
        P(sx, -17, 25, 15, '#8d6b3a');
        P(sx, -17, 25, 2, '#b08a52');
        P(sx + 1, -14, 3, 9, '#c9a066');
        P(sx + 8, -10, 9, 1, 'rgba(88,58,28,0.45)');
        P(sx + 16, -15, 6, 1, 'rgba(88,58,28,0.35)');
      } else {
        // an empty slot reads as a dark hole in the dam, with a nudge when
        // you are actually holding a log
        c.fillStyle = 'rgba(12,18,16,0.55)';
        c.fillRect(Math.round(e.px + sx), Math.round(e.py - 17), 25, 15);
        c.fillStyle = 'rgba(10,14,12,0.75)';
        c.fillRect(Math.round(e.px + sx + 2), Math.round(e.py - 15), 21, 11);
        if (hint) {
          var pulse = 0.35 + 0.35 * Math.sin(G.time * 6 + s);
          c.fillStyle = 'rgba(240,192,96,' + pulse.toFixed(2) + ')';
          c.fillRect(Math.round(e.px + sx), Math.round(e.py - 18), 25, 1);
          c.fillRect(Math.round(e.px + sx), Math.round(e.py - 2), 25, 1);
          c.fillRect(Math.round(e.px + sx), Math.round(e.py - 18), 1, 17);
          c.fillRect(Math.round(e.px + sx + 24), Math.round(e.py - 18), 1, 17);
        }
      }
    }
    return true;
  }

  if (k === 'creekSurge') {
    // the creek coming back, creeping down from upstream
    var t = G.flags.waterT === undefined ? 75 : G.flags.waterT;
    var prog = 1 - Math.max(0, Math.min(1, t / 75));
    if (prog <= 0.01) return true;
    var top = 32, bottom = 32 + prog * 112;
    c.save();
    c.globalAlpha = 0.82;
    c.fillStyle = '#3f7fb8';
    c.fillRect(16, top, W - 32, bottom - top);
    c.fillStyle = '#5a9fd4';
    for (var wy = top; wy < bottom; wy += 6) {
      var wob = Math.sin((wy + G.time * 30) * 0.3) * 2;
      c.fillRect(16 + 6 + wob, wy + 2, 10, 1);
      c.fillRect(W - 60 + wob, wy + 4, 12, 1);
    }
    // the leading edge, so you can see how much time is left
    c.globalAlpha = 0.95;
    c.fillStyle = '#cfe8ff';
    c.fillRect(16, bottom - 2, W - 32, 2);
    c.restore();
    return true;
  }
  return false;
});

PLAYER_HOOKS.push(function (c) {
  if (G.level !== 'ch2' || !G.flags.carryLog) return;
  // a log under the arm
  var bob = Math.sin(G.time * 8) * (G.moving ? 1.2 : 0.3);
  var ox = G.dir === 'left' ? -17 : G.dir === 'right' ? 5 : -13;
  var x = G.px + ox, y = G.py - 16 + bob;
  c.fillStyle = '#8d6b3a'; c.fillRect(Math.round(x), Math.round(y), 24, 8);
  c.fillStyle = '#b08a52'; c.fillRect(Math.round(x), Math.round(y), 24, 1);
  c.fillStyle = '#c9a066'; c.fillRect(Math.round(x), Math.round(y + 2), 3, 4);
  c.fillStyle = 'rgba(88,58,28,0.4)'; c.fillRect(Math.round(x + 9), Math.round(y + 5), 7, 1);
});

// ------------------------------------------------------------------ scripts

SCRIPT.ch2Sign = function () {
  say([
    { who: 'sign', text: 'PICKLE CREEK. Water levels: currently a rumour.' },
    { who: 'sign', text: 'REBUILD NOTICE: the creek returns in one minute. Please build responsibly.' }
  ]);
};

SCRIPT.ch2Pile = function () {
  if (G.flags.logs >= 6) {
    say([{ who: 'narrator', text: 'The pile is empty. So is the gap. Those two facts went together.' }]);
    return;
  }
  if (G.flags.carryLog) {
    say([{ who: 'maverick', text: 'I already have one. Carrying two would be showing off.' }]);
    return;
  }
  var left = G.flags.pileLeft === undefined ? 6 : G.flags.pileLeft;
  if (left <= 0) {
    say([{ who: 'narrator', text: 'Nothing left here. The rest of the timber is already in the dam, or in the creek.' }]);
    return;
  }
  G.flags.pileLeft = left - 1;
  G.flags.carryLog = true;
  G.speedMul = 0.72;
  SFX.pickup();
  saveGame();
  say([
    { who: 'narrator', text: 'Mav heaves a log off the pile. It is heavier than it looks, which is the whole point of logs.' },
    { who: 'maverick', text: 'Okay. Log. Got it. Walking.' }
  ]);
};

SCRIPT.ch2Place = function () {
  if (!G.flags.carryLog) {
    if (G.flags.logs >= 6) {
      say([{ who: 'narrator', text: 'The dam is whole. The creek is going to be furious about it.' }]);
      return;
    }
    say([{ who: 'narrator', text: 'Six gaps, and you have no log. The pile is back west.' }]);
    return;
  }
  G.flags.carryLog = false;
  G.speedMul = 1;
  G.flags.logs = (G.flags.logs || 0) + 1;
  SFX.pickup();
  G.shake = 0.45;
  FX.burst(G.px, G.py - 6, '#d8b070', 16, { speed: 55, life: 0.5, lift: 30 });
  FX.pop(G.px, G.py - 24, '+' + (G.flags.logs) + '/6', '#f0c060');
  saveGame();
  var n = G.flags.logs;
  if (n < 6) {
    say([{ who: 'narrator', text: 'The log slots in with a solid CHUNK. ' + (6 - n) + ' to go.' }]);
    toast('logs ' + n + '/6');
    return;
  }
  say([
    { who: 'narrator', text: 'The last log goes in. The gaps are gone. The dam stands there looking like it never had a problem.' },
    { who: 'maverick', text: 'I built a dam.' },
    { who: 'maverick', text: 'Nobody is going to believe me.' }
  ], ch2DamDone);
};

SCRIPT.ch2Buck = function () {
  var n = G.flags.logs || 0;
  if (n >= 6) {
    say([{ who: 'bucktooth', text: 'Structurally? Acceptable. Spiritually? I am moved. Do not touch anything else.' }]);
    return;
  }
  var lines = [
    { who: 'bucktooth', text: 'Six logs, boy. The creek comes back in ' + Math.ceil(G.flags.waterT || 0) + ' seconds, and it does not care about your schedule.' },
    { who: 'bucktooth', text: 'Log from the pile. Log into the gap. That is the entire craft. It has been the entire craft for eleven thousand years.' }
  ];
  if (G.flags.carryLog) {
    lines = [{ who: 'bucktooth', text: 'You have a log. The gap is that way. I am pointing with my whole body.' }];
  }
  say(lines);
};

function ch2DamDone() {
  G.flags.ch2_done = true;
  saveGame();
  SFX.fanfare();
  G.toScene('p_dam2', 16, 12, 'down');
  setTimeout(function () {
    if (G.sceneId !== 'p_dam2') return;
    say([
      { who: 'bucktooth', text: 'Behold! The tragedy is averted! Justice is served, and so was a phenomenal amount of effort!' },
      { who: 'narrator', text: 'And then, because this is a picture book, the very next drawing is a small beaver paddling up.' },
      { who: 'penelope', text: 'Ugh. Dams are boring. I am done with hydro-engineering. I am going to go play Fortnite.' },
      { who: 'bucktooth', text: 'OVER MY DEAD BODY, YOU WILL!' }
    ], ch2Boom);
  }, 600);
}

function ch2Boom() {
  SFX.blast();
  G.shake = 1.6; G.flash = 0.8;
  setTimeout(function () {
    say([
      { who: 'narrator', text: 'He leaped head first, tweed vest and all, into the centre of the brand new dam.' },
      { who: 'narrator', text: 'Page eleven is just the word BOOM, very large, with logs in the air.' }
    ], function () {
      G.toScene('b_puddle', 8, 9, 'right');
      setTimeout(function () {
        if (G.sceneId !== 'b_puddle') return;
        say([
          { who: 'narrator', text: 'Thirty feet downstream, in a large giggling pile of mud, the beaver family reassembles itself.' },
          { who: 'maverick', text: 'I rebuilt that. For twelve whole seconds, I rebuilt that.' },
          { who: 'bucktooth', text: 'And it was a fine twelve seconds. Structurally? The best twelve seconds of the afternoon.' },
          { who: 'penelope', text: 'I am still playing Fortnite.' },
          { who: 'narrator', text: 'Mav climbed out, shook a small fish out of his shoe, and walked all the way home. Page twelve.' }
        ], function () {
          var left = Math.round(G.flags.waterT || 0);
          cleared(2, left / 75 * 100, left + 's before the creek');
        });
      }, 900);
    });
  }, 700);
}

// ------------------------------------------------------------------ ticking

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch2' || G.flags.ch2_done) return;
  if (G.flags.waterT === undefined) G.flags.waterT = 75;
  G.flags.waterT -= dt;
  if (G.flags.waterT <= 0) {
    // the creek wins this round. no progress lost, just the logs
    G.flags.waterT = 75;
    var had = G.flags.logs || 0;
    G.flags.logs = 0;
    G.flags.carryLog = false;
    G.speedMul = 1;
    G.flags.pileLeft = 6;
    G.flags.washes = (G.flags.washes || 0) + 1;
    saveGame();
    SFX.tone(120, 0.4, 'sawtooth', 0.08);
    G.shake = 1.2;
    toast('the creek took the logs back');
    if (had > 0) {
      say([
        { who: 'narrator', text: 'The creek comes down the channel and takes every log you set, plus one that you were standing on.' },
        { who: 'bucktooth', text: 'That is why we build FAST. Try again. The water is patient but it is not polite.' }
      ]);
    }
  }
});

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch2' || G.flags.ch2_done) return;
  var bw = 150, bh = 7, bx = (W - bw) / 2, by = H - 26;
  c.fillStyle = 'rgba(18,16,28,0.85)';
  c.fillRect(bx - 3, by - 3, bw + 6, bh + 6);
  c.fillStyle = '#2a2438';
  c.fillRect(bx, by, bw, bh);
  var f = Math.max(0, Math.min(1, (G.flags.waterT || 0) / 75));
  c.fillStyle = f > 0.4 ? '#6fb0d8' : f > 0.2 ? '#f0c060' : '#e06050';
  c.fillRect(bx, by, bw * f, bh);
  c.strokeStyle = 'rgba(244,228,192,0.5)';
  c.lineWidth = 1;
  c.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
  c.textAlign = 'center';
  c.font = 'bold 7px monospace';
  c.fillStyle = '#f4efe4';
  c.fillText('CREEK RETURNS  ' + Math.ceil(G.flags.waterT || 0) + 's    LOGS ' + (G.flags.logs || 0) + '/6', W / 2, by - 6);
  c.textAlign = 'left';
});

// ------------------------------------------------------------------ chapter

CHAPTER_CONTENT[2] = {
  start: 'p_dam2',

  intro: function () {
    chapterCard('CHAPTER TWO', "Mav's Great Dam Disaster", 3.2);
    setTimeout(function () {
      if (G.level !== 'ch2') return;
      G.flags.waterT = 75;
      G.flags.logs = 0;
      G.flags.pileLeft = 6;
      say([
        { who: 'narrator', text: 'This one is told as a picture book, so everything happens about twice as fast and the drawings do the shouting.' },
        { who: 'narrator', text: 'Page one: the dam is gone. Page two: the beaver has opinions about it.' },
        { who: 'bucktooth', text: 'It is always easier to RUIN something beautiful than to build it from the ground up. So. Build it. From the ground up.' },
        { who: 'bucktooth', text: 'The creek returns in one minute. Six logs. The pile is west, the gap is there. GO.' }
      ]);
    }, 900);
  },

  resume: function () {
    if (G.flags.carryLog) G.speedMul = 0.72;
    if (G.flags.waterT === undefined) G.flags.waterT = 75;
  },

  objective: function () {
    if (G.flags.ch2_done) return '';
    if (G.flags.logs >= 6) return 'objective: talk to Bucktooth';
    if (G.flags.carryLog) return 'objective: put the log in the gap (east of the pile)';
    if ((G.flags.logs || 0) === 0) return 'objective: take a log from the pile (west)';
    return 'objective: another log from the pile';
  }
};
