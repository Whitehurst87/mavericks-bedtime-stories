// storybook.js - Maverick's bedroom (the hub) and the storybook screen.
//
// The bedroom is an ordinary scene, so the engine's walking, camera and
// collision all work unchanged. The bookshelf and the bed open the book;
// the toy chest holds the bonus stories.

// ------------------------------------------------------------------ bedroom

SCENES.bedroom = {
  title: "MAVERICK'S ROOM",
  spawn: { tx: 14, ty: 12, dir: 'up' },
  camZoom: 1,                       // the whole room on screen, like a bedroom should be
  fill: 'wood',
  rects: [
    { x: 0, y: 0, w: 32, h: 4, t: 'wall' },
    { x: 0, y: 4, w: 1, h: 13, t: 'wall' },
    { x: 31, y: 4, w: 1, h: 13, t: 'wall' },
    { x: 11, y: 8, w: 9, h: 5, t: 'rug' },
    { x: 0, y: 17, w: 32, h: 1, t: 'wall' }
  ],
  solidKinds: ['wall'],
  entities: [
    { id: 'shelf', who: null, tx: 3, ty: 9, kind: 'bedroomShelf', solid: true, sw: 3, sh: 2, propScale: 1, talk: 'hubShelf' },
    { id: 'bed', who: null, tx: 23, ty: 13, kind: 'bedroomBed', solid: true, sw: 5, sh: 3, propScale: 1, reach: 64, talk: 'hubBed' },
    { id: 'stand', who: null, tx: 28, ty: 11, kind: 'bedroomStand', solid: true, propScale: 1, talk: 'hubStand' },
    { id: 'window', who: null, tx: 7, ty: 2, kind: 'bedroomWindow', noSolid: true },
    { id: 'poster', who: null, tx: 20, ty: 2, kind: 'bedroomPoster', noSolid: true, propScale: 1 },
    { id: 'chest', who: null, tx: 7, ty: 15, kind: 'bedroomChest', solid: true, propScale: 1, talk: 'hubChest' },
    { id: 'doll', who: 'bucktooth_puppet', tx: 24, ty: 14, dir: 'up', small: true, talk: 'hubDoll' }
  ]
};

// floorboards, the rug, and this room's wallpaper
TILE_HOOKS.push(function (c, kind, tx, ty, grid) {
  var x = tx * TILE, y = ty * TILE, r = hash(tx, ty, 13), r2 = hash(tx, ty, 29);

  if (kind === 'wood') {
    // oak boards: warm and light, so dark furniture reads against it
    c.fillStyle = r > 0.66 ? '#8a5f3a' : r > 0.33 ? '#845934' : '#7d5432';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(48,28,14,0.30)';
    c.fillRect(x, y, TILE, 1);                       // plank seam
    c.fillStyle = 'rgba(255,226,180,0.07)';
    c.fillRect(x, y + 1, TILE, 1);
    var jx = Math.floor(r2 * 12) + 2;                // butt joint, staggered per row
    c.fillStyle = 'rgba(48,28,14,0.22)';
    c.fillRect(x + jx, y + 1, 1, TILE - 1);
    if (r2 > 0.9) {                                  // the odd knot
      c.fillStyle = 'rgba(58,34,16,0.35)';
      c.fillRect(x + jx + 3, y + 6, 2, 2);
    }
    return true;
  }

  if (kind === 'rug') {
    var rl = !grid || !grid[ty] || grid[ty][tx - 1] !== 'rug';
    var rr = !grid || !grid[ty] || grid[ty][tx + 1] !== 'rug';
    var rt = !grid || !grid[ty - 1] || grid[ty - 1][tx] !== 'rug';
    var rb = !grid || !grid[ty + 1] || grid[ty + 1][tx] !== 'rug';
    c.fillStyle = '#8e4450';
    c.fillRect(x, y, TILE, TILE);
    // a soft weave, not a per tile pattern
    c.fillStyle = 'rgba(240,196,150,0.10)';
    for (var w = 0; w < 4; w++) c.fillRect(x + 1 + w * 4, y, 1, TILE);
    c.fillStyle = 'rgba(52,20,26,0.10)';
    for (var w2 = 0; w2 < 2; w2++) c.fillRect(x, y + 3 + w2 * 8, TILE, 1);
    // one border around the whole rug
    c.fillStyle = '#c8a05a';
    if (rt) c.fillRect(x, y, TILE, 2);
    if (rb) c.fillRect(x, y + TILE - 2, TILE, 2);
    if (rl) c.fillRect(x, y, 2, TILE);
    if (rr) c.fillRect(x + TILE - 2, y, 2, TILE);
    c.fillStyle = 'rgba(120,60,36,0.35)';
    if (rt) c.fillRect(x, y + 2, TILE, 1);
    if (rb) c.fillRect(x, y + TILE - 3, TILE, 1);
    return true;
  }

  if (kind === 'wall' && BEDROOM_SCENES[G.sceneId]) {
    // wallpaper with a stripe, and a skirting board where it meets the floor
    c.fillStyle = '#2f3b52';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = '#36445f';
    c.fillRect(x + 2, y, 2, TILE);
    c.fillRect(x + 9, y, 2, TILE);
    c.fillStyle = 'rgba(16,20,30,0.25)';
    c.fillRect(x + 13, y, 1, TILE);
    var below = grid && grid[ty + 1] ? grid[ty + 1][tx] : null;
    if (below && below !== 'wall') {
      c.fillStyle = '#1b2130'; c.fillRect(x, y + TILE - 5, TILE, 5);
      c.fillStyle = '#3a4a66'; c.fillRect(x, y + TILE - 6, TILE, 1);
    }
    return true;
  }
  return false;
});

// furniture. Everything gets a dark outline and a shadow so it separates
// from the floor instead of melting into it.
PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (k !== 'bedroomShelf' && k !== 'bedroomBed' && k !== 'bedroomStand' &&
      k !== 'bedroomPoster' && k !== 'bedroomChest' && k !== 'bedroomWindow') return false;
  var P = propPainter(c, e);

  if (k === 'bedroomShelf') {
    P(-26, -2, 52, 3, 'rgba(0,0,0,0.20)');            // shadow
    P(-25, -49, 50, 49, '#2a1c12');                   // outline
    P(-24, -48, 48, 47, '#5b3a22');                   // carcass
    P(-22, -46, 44, 43, '#3f2716');                   // inside
    for (var s = 0; s < 3; s++) {
      var sy = -44 + s * 14;
      P(-22, sy + 11, 44, 2, '#71482a');              // shelf plank
      P(-22, sy + 13, 44, 1, '#241608');
      for (var b = 0; b < 9; b++) {
        var hh = 7 + ((b * 5 + s * 3) % 4);
        var bw = 3 + ((b + s) % 2);
        var cols = ['#a8543f', '#4a7fa4', '#9a8438', '#568a56', '#9a4468', '#7358a0', '#b06a3a'];
        P(-20 + b * 5, sy + (11 - hh), bw, hh, cols[(b + s * 2) % 7]);
        P(-20 + b * 5, sy + (11 - hh), 1, hh, 'rgba(255,240,210,0.18)');
      }
    }
    P(-26, -51, 52, 4, '#71482a');                    // top trim
    P(-26, -51, 52, 1, '#8f5f38');
    P(-25, -49, 50, 1, '#241608');
    return true;
  }

  if (k === 'bedroomBed') {
    P(-40, -7, 80, 7, 'rgba(0,0,0,0.22)');
    P(-41, -56, 82, 56, '#2a1c12');                   // outline
    P(-40, -50, 80, 50, '#4a2f1c');                   // frame
    P(-36, -46, 72, 42, '#d8c8a8');                   // mattress
    P(-36, -28, 72, 24, '#3f6a9a');                   // blanket
    P(-36, -30, 72, 3, '#2f5172');
    P(-36, -46, 72, 2, '#f0e4cc');
    P(-31, -42, 26, 12, '#f6efdf');                   // pillow
    P(-31, -42, 26, 2, '#fffaf0');
    P(-31, -31, 26, 1, '#c9bda6');
    P(-40, -56, 80, 7, '#6a4426');                    // headboard
    P(-40, -56, 80, 2, '#8a5c34');
    P(-2, -26, 4, 4, 'rgba(40,60,90,0.5)');           // a fold in the blanket
    return true;
  }

  if (k === 'bedroomStand') {
    P(-10, -2, 20, 3, 'rgba(0,0,0,0.20)');
    P(-10, -23, 20, 23, '#2a1c12');
    P(-9, -22, 18, 21, '#5b3a22');
    P(-8, -20, 16, 8, '#4a2f1c');                     // drawer
    P(-2, -17, 4, 2, '#c8a040');                      // handle
    P(-8, -9, 16, 1, '#3a2416');
    P(-6, -34, 12, 12, '#f0d878');                    // lamp glow
    P(-5, -33, 10, 10, '#ffe89a');
    P(-3, -30, 6, 7, '#e8c050');
    P(-7, -24, 14, 2, '#8a6a3a');                     // lamp base
    return true;
  }

  if (k === 'bedroomWindow') {
    // one window, not four: a night sky with a moon, framed in wood
    P(-34, -42, 68, 42, '#2a1c12');
    P(-32, -40, 64, 38, '#3f5a7a');
    var sky = c.createLinearGradient(e.px - 32, e.py - 40, e.px - 32, e.py - 2);
    sky.addColorStop(0, '#16213a');
    sky.addColorStop(1, '#2f4a6a');
    c.fillStyle = sky;
    c.fillRect(e.px - 31, e.py - 39, 62, 36);
    // moon and a few stars
    c.fillStyle = '#f4ecc8';
    c.beginPath(); c.arc(e.px + 14, e.py - 26, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2f4a6a';
    c.beginPath(); c.arc(e.px + 18, e.py - 29, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(240,236,208,0.85)';
    P(-24, -34, 1, 1); P(-18, -22, 1, 1); P(-26, -14, 1, 1);
    P(-8, -33, 1, 1); P(2, -18, 1, 1); P(22, -12, 1, 1);
    // frame and mullions
    P(-2, -39, 4, 36, '#6a4426');
    P(-31, -22, 62, 3, '#6a4426');
    P(-32, -40, 64, 2, '#8a5c34');
    P(-34, -3, 68, 3, '#4a2f1c');
    return true;
  }

  if (k === 'bedroomPoster') {
    P(-12, -1, 24, 2, 'rgba(0,0,0,0.18)');
    P(-13, -30, 26, 30, '#1b1420');
    P(-12, -29, 24, 28, '#243a5c');                   // poster field
    P(-12, -29, 24, 2, '#3a5c8a');
    P(-6, -25, 12, 9, '#8ac0e8');                     // a rocket, roughly
    P(-3, -16, 6, 3, '#f0d060');
    P(-8, -12, 16, 1, '#6f8fb0');
    P(-8, -9, 11, 1, '#6f8fb0');
    P(-1, -7, 2, 4, '#f0d060');
    return true;
  }

  if (k === 'bedroomChest') {
    P(-16, -2, 32, 3, 'rgba(0,0,0,0.20)');
    P(-16, -22, 32, 22, '#2a1c12');
    P(-15, -21, 30, 20, '#6a4a2a');
    P(-15, -25, 30, 5, '#7d5732');                    // lid
    P(-15, -25, 30, 1, '#9a703f');
    P(-15, -9, 30, 2, '#4a2f1c');
    P(-3, -14, 6, 5, '#c8a040');                      // latch
    P(-12, -19, 13, 6, '#f0e4c4');                    // BONUS label
    P(-11, -17, 8, 1, '#a08060');
    P(-11, -15, 5, 1, '#a08060');
    return true;
  }
  return false;
});

// ------------------------------------------------------------------ the book

var BOOK = {
  sel: 1,
  scrollPart: 1,
  cols: 10,
  rows: 5
};

function bookLayout() {
  var x0 = 22, w = 44, gap = 3, h = 17, rowH = 28, y0 = 40;
  return { x0: x0, w: w, gap: gap, h: h, rowH: rowH, y0: y0, cols: 10, rows: 5 };
}

function bookSpineRect(n) {
  var L = bookLayout();
  var idx = n - 1;
  var col = idx % L.cols, row = Math.floor(idx / L.cols);
  return {
    x: L.x0 + col * (L.w + L.gap),
    y: L.y0 + row * L.rowH,
    w: L.w,
    h: L.h,
    row: row,
    col: col
  };
}

function openBook() {
  var p = profile();
  G.mode = 'book';
  BOOK.sel = p.last && chapterIsOpen(p.last) ? p.last : nextUnreadChapter();
  SFX.blip(660, 0.07);
  if (SFX.music) SFX.blip(520, 0.05);
}

function closeBook() {
  G.mode = 'play';
  G.fade = 0;
  SFX.blip(420, 0.06);
}

function bookRow(n) { return Math.floor((n - 1) / 10); }

function bookMove(dx, dy) {
  var n = BOOK.sel;
  if (dx) {
    n += dx;
    if (n < 1) n = CHAPTER_COUNT;
    if (n > CHAPTER_COUNT) n = 1;
  }
  if (dy) {
    n += dy * 10;
    if (n < 1) n += CHAPTER_COUNT;
    if (n > CHAPTER_COUNT) n -= CHAPTER_COUNT;
  }
  if (n !== BOOK.sel) { BOOK.sel = n; SFX.blip(700, 0.04); }
}

function bookConfirm() {
  var n = BOOK.sel;
  if (!chapterIsOpen(n)) {
    SFX.tone(180, 0.12, 'square', 0.05);
    toast('that one comes after chapter ' + (n - 1));
    return;
  }
  startChapter(n);
}

function bookPointer(p) {
  for (var n = 1; n <= CHAPTER_COUNT; n++) {
    var r = bookSpineRect(n);
    if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y - 2 && p.y <= r.y + r.h) {
      BOOK.sel = n;
      bookConfirm();
      return true;
    }
  }
  return false;
}

// --------------------------------------------------------------- starting

function startChapter(n) {
  var c = CHAPTERS[n];
  if (!c) return false;
  DLG.active = false; DLG.queue = []; DLG.current = null; DLG.onDone = null;
  setLastChapter(n);
  G.chapter = n;

  if (c.engine === 'level') {
    startGame(c.level);
    G.chapter = n;
    return true;
  }

  if (c.engine === 'chapter') {
    var cc = CHAPTER_CONTENT[n];
    if (!cc) { toast('this story is not written yet'); return false; }
    G.mode = 'play';
    G.level = 'ch' + n;
    G.fade = 1; G.fadeTarget = 0; G.fadeDelay = 0; G.pending = null;
    G.charge = 0; G.chargeMode = false; G.companion = null;
    G.shake = 0; G.flash = 0; G.holdMode = null;
    SFX.init(); SFX.startMusic();
    var sv = loadSave(G.level);
    if (sv && sv.flags && sv.flags.started) {
      G.flags = sv.flags; G.flags.started = true;
      loadScene(sv.scene, sv.tx, sv.ty, sv.dir || 'down');
      toast('picking up where you left off');
      if (cc.resume) cc.resume();
    } else {
      G.flags = { started: true };
      var startId = cc.start;
      loadScene(startId, SCENES[startId].spawn.tx, SCENES[startId].spawn.ty, 'down');
      if (cc.intro) setTimeout(function () {
        if (G.level === 'ch' + n) cc.intro();
      }, 420);
    }
    return true;
  }

  SFX.tone(180, 0.12, 'square', 0.05);
  toast('this story is not written yet');
  return false;
}

function startBonus(id) {
  var b = null;
  for (var i = 0; i < BONUS_STORIES.length; i++) if (BONUS_STORIES[i].id === id) b = BONUS_STORIES[i];
  if (!b) return false;
  G.chapter = 0;
  startGame(b.level);
  return true;
}

function goBedroom() {
  var p = profile();
  // a chapter's delayed dialogue must not bleed into the room
  DLG.active = false; DLG.queue = []; DLG.current = null; DLG.onDone = null;
  G.mode = 'play';
  G.level = 'hub';
  G.chapter = 0;
  G.flags = {};
  G.companion = null;
  G.holdMode = null;
  G.charge = 0;
  G.banner = 0;
  G.fade = 1; G.fadeTarget = 0; G.fadeDelay = 0; G.pending = null;
  loadScene('bedroom', 14, 11, 'up');
  G.banner = 0;
  if (!p.seenIntro) {
    p.seenIntro = true;
    PROFILE.save();
    setTimeout(hubIntro, 500);
  }
}

function hubIntro() {
  say([
    { who: 'narrator', text: 'Saturday night. A whole shelf of stories, and one beaver doll sitting on the bed like he pays rent.' },
    { who: 'bucktooth', text: 'You are awake. EXCELLENT. Do you know how long I have been waiting to be narrated back into existence?' },
    { who: 'maverick', text: 'It is nine. We have school.' },
    { who: 'bucktooth', text: 'School is a MORNING problem. The shelf is a right-now problem.' },
    { who: 'narrator', text: '[Walk with WASD or the arrows. Press E to look at things. The bookshelf and the bed both open your stories.]' }
  ]);
}

// ------------------------------------------------------------------ scripts

SCRIPT.hubShelf = function () {
  say([
    { who: 'narrator', text: 'Fifty stories, held up by a shelf that was assembled with a lot of confidence and very few screws.' },
    { who: 'maverick', text: 'Fifty. That is a lot of Tuesdays.' }
  ], function () { openBook(); });
};

SCRIPT.hubBed = function () {
  say([
    { who: 'narrator', text: 'The blanket is the good blanket. The pillow has been folded into a shape that is technically a pillow.' },
    { who: 'maverick', text: 'One story. Then sleep. That is the deal.' },
    { who: 'bucktooth', text: 'The deal has historically been four stories. I am just noting the historical record.' }
  ], function () { openBook(); });
};

SCRIPT.hubDoll = function () {
  if (!chapterIsDone(1)) {
    say([
      { who: 'bucktooth', text: 'Start with chapter one. It has a sandwich in it. A STRUCTURAL sandwich. You will understand when you get there.' }
    ]);
    return;
  }
  say([
    { who: 'bucktooth', text: 'You have read ' + chaptersRead() + ' of ' + CHAPTER_COUNT + '. That is not zero. I have decided to be proud of you in a way that also mentions the remaining number.' }
  ]);
};

SCRIPT.hubStand = function () {
  say([
    { who: 'narrator', text: 'A glass of water, a lamp shaped like a duck, and one sock that has clearly been through something.' }
  ]);
};

SCRIPT.hubChest = function () {
  say([
    { who: 'narrator', text: 'The toy chest. On top, a shoebox with BONUS written on it in marker, twice, by two different people.' },
    { who: 'maverick', text: 'The first one. Before any of the fifty. The one where the whole creek goes missing.' }
  ], function () {
    say([
      { who: 'bucktooth', text: 'Ah. The origin story. Guilt, water, one load-bearing gnome. Play it.' }
    ], function () { startBonus('ep1'); });
  });
};

// ------------------------------------------------------------------ drawing

function bookColour(n, i) {
  var hues = ['#8a4a3a', '#3f6a8a', '#7a6a30', '#4a7a4a', '#6a3a7a', '#8a5a2a', '#3a7a6a', '#7a3a5a'];
  return hues[(n + i * 3) % hues.length];
}

function wrapLines(ctx, text, maxW, maxLines) {
  var words = String(text).split(' '), lines = [], line = '';
  for (var i = 0; i < words.length; i++) {
    var t = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = words[i]; }
    else line = t;
  }
  if (line) lines.push(line);
  if (maxLines && lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = lines[maxLines - 1].replace(/[,.]?$/, '') + '...';
  }
  return lines;
}

function drawBook() {
  var t = G.time;
  // the room, dimmed
  ctx.fillStyle = '#171522';
  ctx.fillRect(0, 0, W, H);
  var vg = ctx.createRadialGradient(W / 2, 60, 20, W / 2, 120, 320);
  vg.addColorStop(0, 'rgba(90,70,120,0.30)');
  vg.addColorStop(1, 'rgba(10,8,16,0)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  // title
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#1a1424';
  ctx.fillText("MAVERICK'S BEDTIME STORIES", W / 2 + 1, 21);
  ctx.fillStyle = '#f4e4c0';
  ctx.fillText("MAVERICK'S BEDTIME STORIES", W / 2, 20);
  ctx.textAlign = 'left';

  var L = bookLayout();

  // where you are, and how far you have got
  var selRange = partRange(CHAPTERS[BOOK.sel].part);
  ctx.font = '6px monospace';
  ctx.fillStyle = 'rgba(240,224,180,0.55)';
  ctx.fillText('PART ' + ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'][CHAPTERS[BOOK.sel].part - 1] +
    '  ·  CHAPTERS ' + selRange.from + '-' + selRange.to, 22, 32);
  ctx.textAlign = 'right';
  var tm = totalMedals();
  var medalTxt = (tm.gold + tm.silver + tm.bronze) > 0
    ? '  ·  ' + tm.gold + ' GOLD ' + tm.silver + ' SILVER ' + tm.bronze + ' BRONZE'
    : '';
  ctx.fillText(chaptersRead() + ' OF ' + CHAPTER_COUNT + ' READ' + medalTxt, W - 14, 32);
  ctx.textAlign = 'left';

  // shelves
  for (var row = 0; row < L.rows; row++) {
    var part = row + 1;
    var range = partRange(part);
    var label = ['I', 'II', 'III', 'IV', 'V'][row];
    ctx.font = 'bold 7px monospace';
    ctx.fillStyle = 'rgba(240,224,180,0.45)';
    ctx.fillText(label, 9, L.y0 + row * L.rowH + 12);

    // shelf board
    ctx.fillStyle = '#3a2416';
    ctx.fillRect(14, L.y0 + row * L.rowH + L.h + 1, W - 28, 4);
    ctx.fillStyle = 'rgba(255,220,170,0.10)';
    ctx.fillRect(14, L.y0 + row * L.rowH + L.h + 1, W - 28, 1);

    for (var col = 0; col < L.cols; col++) {
      var n = range.from + col;
      if (n > range.to) break;
      var r = bookSpineRect(n);
      var sel = n === BOOK.sel;
      var done = chapterIsDone(n);
      var open = chapterIsOpen(n);
      var y = r.y - (sel ? 3 : 0);

      // spine
      var base = bookColour(n, row);
      ctx.fillStyle = open ? base : '#2a2531';
      ctx.fillRect(r.x, y, r.w, r.h);
      ctx.fillStyle = open ? 'rgba(255,240,210,0.18)' : 'rgba(255,240,210,0.05)';
      ctx.fillRect(r.x, y, 2, r.h);
      ctx.fillStyle = 'rgba(0,0,0,0.30)';
      ctx.fillRect(r.x + r.w - 2, y, 2, r.h);

      // number
      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = open ? 'rgba(255,248,232,0.92)' : 'rgba(200,200,210,0.35)';
      ctx.fillText((n < 10 ? '0' : '') + n, r.x + 4, y + 11);

      // band + status
      if (open) {
        ctx.fillStyle = 'rgba(255,240,210,0.30)';
        ctx.fillRect(r.x + 3, y + 13, r.w - 6, 1);
      }
      if (done) {
        // finished: a solid medal chip, so the colour reads at spine size
        var st = chapterStat(n);
        var mcol = st ? medalFor(st.best || 0).colour : '#f0c060';
        ctx.fillStyle = 'rgba(18,14,24,0.75)';
        ctx.fillRect(r.x + r.w - 10, y + 2, 7, 7);
        ctx.fillStyle = mcol;
        ctx.fillRect(r.x + r.w - 9, y + 3, 5, 5);
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillRect(r.x + r.w - 8, y + 4, 1, 1);
      } else if (!open) {
        ctx.fillStyle = 'rgba(150,150,170,0.5)';
        ctx.fillRect(r.x + r.w - 9, y + 6, 4, 3);
        ctx.fillRect(r.x + r.w - 8, y + 4, 2, 2);
      }

      if (sel) {
        var glow = 0.55 + 0.45 * Math.sin(t * 5);
        ctx.globalAlpha = glow;
        ctx.strokeStyle = '#fff3c4';
        ctx.lineWidth = 1;
        ctx.strokeRect(r.x + 0.5, y + 0.5, r.w - 1, r.h - 1);
        ctx.globalAlpha = 1;
      }
    }
  }

  // ------------------------------------------------------------- detail card
  var n2 = BOOK.sel, c2 = CHAPTERS[n2];
  var px = 10, py = 180, pw = W - 20, ph = 84;
  ctx.fillStyle = 'rgba(16,14,24,0.92)';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = 'rgba(240,192,96,0.55)';
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);

  ctx.font = '6px monospace';
  ctx.fillStyle = '#f0c060';
  var statLine = '';
  var st2 = chapterStat(n2);
  if (st2 && st2.best) {
    var m2 = medalFor(st2.best);
    statLine = m2.name + '  ' + st2.best + '  ·  ' + (st2.plays || 1) + (st2.plays === 1 ? ' play' : ' plays');
  }
  ctx.fillText('CHAPTER ' + (n2 < 10 ? '0' : '') + n2 + '   ' + (chapterIsDone(n2) ? 'READ' : chapterIsOpen(n2) ? 'NEW' : 'LOCKED'), px + 8, py + 11);
  if (statLine) {
    ctx.textAlign = 'right';
    ctx.fillStyle = m2 ? m2.colour : '#f0c060';
    ctx.fillText(statLine, px + pw - 8, py + 11);
    ctx.textAlign = 'left';
  }

  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = chapterIsOpen(n2) ? '#ffffff' : 'rgba(220,220,230,0.5)';
  var titleLines = wrapLines(ctx, c2.short, pw - 16, 2);
  for (var i = 0; i < titleLines.length; i++) ctx.fillText(titleLines[i], px + 8, py + 24 + i * 10);

  ctx.font = '6px monospace';
  ctx.fillStyle = 'rgba(200,196,186,0.78)';
  var blurbLines = wrapLines(ctx, c2.blurb, pw - 16, 1);
  var y0 = py + 24 + titleLines.length * 10 + 3;
  for (var b2 = 0; b2 < blurbLines.length; b2++) ctx.fillText(blurbLines[b2], px + 8, y0 + b2 * 8);

  ctx.fillStyle = '#a8d0a0';
  var mechLines = wrapLines(ctx, c2.mechanic, pw - 16, 2);
  for (var m = 0; m < mechLines.length; m++) ctx.fillText(mechLines[m], px + 8, y0 + 9 + m * 8);

  // where it happens, and who is in it
  ctx.fillStyle = 'rgba(180,196,220,0.62)';
  ctx.fillText(wrapLines(ctx, 'where: ' + c2.setting, pw - 16, 1)[0], px + 8, y0 + 25);
  ctx.fillStyle = 'rgba(210,190,160,0.55)';
  ctx.fillText(wrapLines(ctx, 'who: ' + c2.cast.slice(0, 4).join(', '), pw - 16, 1)[0], px + 8, y0 + 34);

  // footer
  ctx.textAlign = 'center';
  ctx.font = '7px monospace';
  ctx.fillStyle = 'rgba(210,205,195,0.65)';
  var hint = 'arrows pick   E read   F preview unwritten';
  if (profile().freeRead) hint = 'arrows pick   E read   F preview unwritten (ON)';
  ctx.fillText(hint + '   B back to the room', W / 2, H - 8);
  ctx.textAlign = 'left';
}
