// part1.js - shared places and art for Part One (chapters 3 and 4).
//
// Chapters 3 and 4 are two retellings of the same afternoon, so they share the
// same two locations: the river (riverdance, then the argument) and Mrs.
// Wallaby's front yard (the doorbell, then the hiding). The scenes live here
// once; each chapter brings its own dialogue and mechanics.
//
//   p_river1     the freshly polished dam
//   p_wallaby    the pastel green house, the hedge, the rosebush

var P1 = { hideSpot: null };

// ------------------------------------------------------------------- river

SCENES.p_river1 = {
  title: 'THE POLISHED DAM',
  spawn: { tx: 6, ty: 13, dir: 'right' },
  camZoom: 1,
  fill: 'mud',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 16, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 1, y: 2, w: 30, h: 7, t: 'water' },
    { x: 1, y: 9, w: 30, h: 2, t: 'dam' },
    { x: 1, y: 11, w: 30, h: 2, t: 'grass' },
    { x: 1, y: 13, w: 30, h: 2, t: 'path' },
    { x: 1, y: 15, w: 30, h: 1, t: 'grass' }
  ],
  solidKinds: ['tree', 'water', 'dam'],
  entities: [
    { id: 'buck1', who: 'bucktooth', tx: 20, ty: 12, dir: 'left', reach: 60, talk: 'p1Buck' },
    { id: 'duster', who: null, tx: 23, ty: 12, kind: 'duster', noSolid: true, propScale: 1 },
    { id: 'stash', who: null, tx: 27, ty: 14, kind: 'stash', noSolid: true, propScale: 1 },
    { id: 'r1sign', who: 'sign', tx: 5, ty: 11, kind: 'sign', talk: 'p1Sign' },
    { id: 'exit_wallaby', exit: { to: 'p_wallaby', tx: 2, ty: 14, dir: 'right' }, tx: 30, ty: 13, rect: { w: 1, h: 2 } }
  ],
  overlay: function (c) {
    // the dam is freshly polished, so the top edge catches the light
    for (var x = 16; x < W - 16; x += 37) {
      c.fillStyle = 'rgba(255,250,220,0.20)';
      c.fillRect(x, 9 * TILE + 1, 14, 1);
    }
  }
};

// -------------------------------------------------------------- the house

SCENES.p_wallaby = {
  title: "MRS. WALLABY'S HOUSE",
  spawn: { tx: 2, ty: 14, dir: 'right' },
  camZoom: 1,                       // one screen per room, like the bedroom
  fill: 'grass',
  rects: [
    { x: 0, y: 0, w: 32, h: 1, t: 'tree' },
    { x: 0, y: 0, w: 1, h: 13, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 0, y: 17, w: 32, h: 1, t: 'tree' },
    { x: 10, y: 7, w: 13, h: 1, t: 'path' },
    { x: 15, y: 8, w: 3, h: 6, t: 'path' },
    { x: 1, y: 14, w: 30, h: 2, t: 'cobble' },
    { x: 4, y: 3, w: 1, h: 1, t: 'tree' },
    { x: 28, y: 3, w: 1, h: 1, t: 'tree' },
    { x: 3, y: 16, w: 1, h: 1, t: 'tree' },
    { x: 29, y: 16, w: 1, h: 1, t: 'tree' }
  ],
  solidKinds: ['tree'],
  entities: [
    { id: 'houseArt', who: null, tx: 16, ty: 9, kind: 'wallabyHouse', noSolid: true, propScale: 1, reach: 84, talk: 'p1Door' },
    { id: 'houseBlock', who: null, tx: 16, ty: 3, kind: null, solid: true, sw: 14, sh: 6 },
    { id: 'hedge', who: null, tx: 4, ty: 10, kind: 'hedgeRow', solid: true, sw: 4, sh: 1, propScale: 1, reach: 48, talk: 'p1Hedge' },
    { id: 'rose', who: null, tx: 27, ty: 10, kind: 'roseBush', solid: true, sw: 4, sh: 1, propScale: 1, reach: 48, talk: 'p1Rose' },
    { id: 'fence1', who: null, tx: 9, ty: 10, kind: 'picket', noSolid: true, propScale: 1 },
    { id: 'fence2', who: null, tx: 22, ty: 10, kind: 'picket', noSolid: true, propScale: 1 },
    { id: 'gnome1', who: 'gnome', tx: 8, ty: 12, small: true },
    { id: 'sprinkler1', who: null, tx: 21, ty: 12, kind: 'gardenSprinkler', noSolid: true, propScale: 1 },
    { id: 'wallaby', who: 'wallaby', tx: 16, ty: 8, dir: 'down', hidden: true, talk: null },
    { id: 'exit_river', exit: { to: 'p_river1', tx: 28, ty: 13, dir: 'left' }, tx: 0, ty: 14, rect: { w: 1, h: 2 } }
  ],
  overlay: function (c) {
    // long late afternoon shadows across the lawn
    c.fillStyle = 'rgba(40,60,40,0.10)';
    for (var i = 0; i < 6; i++) {
      c.fillRect(0, 190 + i * 16, W, 6);
    }
  }
};

// -------------------------------------------------------------------- props

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (k !== 'duster' && k !== 'stash' && k !== 'wallabyHouse' &&
      k !== 'hedgeRow' && k !== 'roseBush' && k !== 'picket' && k !== 'gardenSprinkler') return false;
  var P = propPainter(c, e);

  if (k === 'duster') {
    P(-2, -14, 2, 14, '#8a6a3a');
    P(-7, -20, 12, 7, '#e8e0d0');
    P(-6, -19, 10, 5, '#f6f0e4');
    P(-5, -16, 8, 1, '#d8d0bc');
    return true;
  }

  if (k === 'stash') {
    // the log Bucktooth keeps his supplies behind
    P(-18, -12, 36, 12, '#8d6b3a');
    P(-18, -12, 36, 2, '#b08a52');
    P(-16, -9, 4, 7, '#c9a066');
    P(-4, -8, 20, 1, 'rgba(88,58,28,0.45)');
    return true;
  }

  if (k === 'wallabyHouse') {
    var W2 = 224;
    // compact profile: the whole frontage has to fit the camera band
    P(-W2 / 2 + 4, -84, 14, 20, '#8a6a5a');          // chimney
    P(-W2 / 2 + 4, -84, 14, 3, '#a08070');
    P(-W2 / 2 - 2, -82, W2 + 4, 6, '#3f4f48');        // ridge
    P(-W2 / 2 - 6, -76, W2 + 12, 12, '#4a5a52');      // roof slope
    P(-W2 / 2 - 6, -64, W2 + 12, 4, '#546860');       // eave
    P(-W2 / 2 - 8, -60, W2 + 16, 3, '#3a4a43');
    // walls
    P(-W2 / 2, -57, W2, 57, '#b8d8b4');
    P(-W2 / 2, -57, W2, 2, '#f2f4ec');
    for (var s = 0; s < 5; s++) {
      P(-W2 / 2, -50 + s * 11, W2, 1, 'rgba(120,150,120,0.30)');
    }
    P(-W2 / 2, -57, 6, 57, '#f2f4ec');                // corner boards
    P(W2 / 2 - 6, -57, 6, 57, '#f2f4ec');
    // windows
    [[-84, -46], [54, -46]].forEach(function (w) {
      P(w[0], w[1], 30, 24, '#f2f4ec');
      P(w[0] + 3, w[1] + 3, 24, 18, '#9fc4dc');
      P(w[0] + 3, w[1] + 3, 24, 18, 'rgba(255,225,150,0.40)');
      P(w[0] + 14, w[1] + 3, 2, 18, '#f2f4ec');
      P(w[0] + 3, w[1] + 10, 24, 2, '#f2f4ec');
      P(w[0] - 3, w[1] + 24, 36, 3, '#f2f4ec');
    });
    // porch
    P(-42, -32, 6, 32, '#f2f4ec');
    P(36, -32, 6, 32, '#f2f4ec');
    P(-46, -36, 92, 5, '#f2f4ec');
    P(-46, -36, 92, 2, '#ffffff');
    // door
    P(-16, -42, 32, 42, '#f2f4ec');
    P(-13, -39, 26, 39, '#e8ecdf');
    P(-13, -39, 26, 7, '#f6f8f0');
    P(-9, -28, 18, 13, '#9fc4dc');
    P(-9, -28, 18, 13, 'rgba(255,225,150,0.35)');
    P(-10, -13, 20, 11, '#e2e6d8');
    P(9, -21, 4, 4, '#d8b44a');
    P(-2, -48, 10, 6, '#f2f4ec');
    P(-1, -47, 8, 4, '#5a6f66');
    // step
    P(-30, -6, 60, 6, '#cfc6ae');
    P(-34, 0, 68, 4, '#b9b09a');
    return true;
  }

  if (k === 'hedgeRow') {
    // a clipped hedge, four tiles wide, with a shadow
    P(-32, 2, 64, 4, 'rgba(0,0,0,0.20)');
    P(-32, -20, 64, 22, '#2f5a34');
    P(-32, -20, 64, 4, '#3f7040');
    for (var b = 0; b < 20; b++) {
      var hx = -31 + (b % 10) * 6.4, hy = -17 + Math.floor(b / 10) * 9;
      P(hx, hy, 5, 6, b % 3 === 0 ? '#3a6a3c' : '#356335');
      P(hx, hy, 4, 1, '#4f8a4f');
      if (b % 4 === 0) P(hx + 1, hy + 2, 2, 2, '#2a4f2b');
    }
    P(-32, -3, 64, 3, '#24451f');
    return true;
  }

  if (k === 'roseBush') {
    // a rounded bush, not a crate, with readable blooms
    P(-30, 3, 60, 4, 'rgba(0,0,0,0.20)');
    // silhouette built from stacked bands so the top and corners round off
    var bands = [[-22, 12], [-27, 18], [-30, 22], [-32, 26], [-33, 30], [-33, 32], [-32, 34], [-30, 34], [-27, 34], [-24, 33], [-20, 32], [-16, 30]];
    for (var b2 = 0; b2 < bands.length; b2++) {
      P(bands[b2][0], -34 + b2 * 3, bands[b2][1], 4, b2 < 4 ? '#3a6a3c' : '#2b4f2c');
    }
    for (var r = 0; r < 26; r++) {
      var rx = -26 + (r * 7) % 52, ry = -30 + ((r * 5) % 26);
      P(rx, ry, 5, 4, r % 4 === 0 ? '#3f7040' : '#336038');
    }
    var blooms = [[-20, -28], [-10, -31], [0, -25], [10, -29], [18, -24], [-16, -18], [-6, -20], [4, -17], [14, -19], [20, -28]];
    blooms.forEach(function (p) {
      P(p[0], p[1], 6, 5, '#a82f42');
      P(p[0] + 1, p[1] + 1, 4, 3, '#d84a5e');
      P(p[0] + 2, p[1] + 2, 2, 1, '#f07a88');
    });
    P(-28, -2, 56, 4, 'rgba(20,40,20,0.45)');
    return true;
  }

  if (k === 'picket') {
    // three fence panels wide, so it reads as garden edging
    P(-24, -12, 48, 12, 'rgba(0,0,0,0.10)');
    for (var p = 0; p < 9; p++) {
      P(-24 + p * 5, -16, 3, 16, '#eceadc');
      P(-24 + p * 5, -18, 3, 3, '#f6f4ea');
    }
    P(-25, -10, 50, 2, '#dedbcb');
    P(-25, -4, 50, 2, '#dedbcb');
    return true;
  }

  if (k === 'gardenSprinkler') {
    P(-6, -2, 12, 3, '#6a8a6a');
    P(-2, -10, 4, 9, '#5f8f5f');
    P(-5, -14, 10, 5, '#7ab07a');
    P(-4, -13, 8, 2, '#8fc48f');
    P(-9, -16, 1, 1, 'rgba(160,216,240,0.9)');
    P(8, -18, 1, 1, 'rgba(160,216,240,0.9)');
    P(-10, -12, 1, 1, 'rgba(160,216,240,0.7)');
    return true;
  }
  return false;
});

// --------------------------------------------------------------- dispatch
// Both chapters share these two places, so the talk handlers branch on which
// chapter is running.

SCRIPT.p1Sign = function () {
  say([
    { who: 'sign', text: 'PICKLE CREEK. Please do not pull the twig. (The twig has been replaced. It is a different twig.)' }
  ]);
};

SCRIPT.p1Buck = function () {
  if (G.level === 'ch3' && typeof ch3Buck === 'function') return ch3Buck();
  if (G.level === 'ch4' && typeof ch4Buck === 'function') return ch4Buck();
  say([{ who: 'bucktooth', text: 'I am polishing. It is a whole activity. You would not understand.' }]);
};

SCRIPT.p1Door = function () {
  if (G.level === 'ch3' && typeof ch3Door === 'function') return ch3Door();
  if (G.level === 'ch4' && typeof ch4Door === 'function') return ch4Door();
  say([{ who: 'narrator', text: 'A white door with a brass bell and a mat that says GO AWAY in friendly letters.' }]);
};

SCRIPT.p1Hedge = function () {
  if (typeof p1Hide === 'function') return p1Hide('hedge');
};

SCRIPT.p1Rose = function () {
  if (typeof p1Hide === 'function') return p1Hide('rose');
};

// diving behind either bush works; the chapter decides which one it counts for
function p1Hide(which) {
  P1.hideSpot = which;
  if (G.level === 'ch3' && typeof ch3Hide === 'function') return ch3Hide(which);
  if (G.level === 'ch4' && typeof ch4Hide === 'function') return ch4Hide(which);
  say([{ who: 'narrator', text: 'You crouch behind the bush. It is a good bush.' }]);
}
