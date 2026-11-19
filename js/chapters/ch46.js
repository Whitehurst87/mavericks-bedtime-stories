// ch46.js - Chapter 46: Mav and the Legend of the Cheese Master
//
// The town is empty, the sky is smug, and the same afternoon keeps starting
// over. The only thing that survives a loop is what Mav remembers, which is
// the whole joke.
//
//   c46_room    the bedroom, the Ritz boxes, the doll in the laundry
//   c46_street  an empty Clovis, the mall, the Arby's, a drone
//   c46_park    the dry fountain and the thirty foot can
//   c46_house   the kitchen, Taffy, and the cowboy headed truth
//
// The mechanic is a looping countdown. When it runs out the world flashes,
// shakes, and puts Mav back in his room with the knowledge flags intact.
// Nothing here is a game over, it is only another loop.

BEDROOM_SCENES.c46_room = 1;   // share the bedroom's wallpaper and wood floor

NAMES.taffy = 'TAFFY STAMBURGER';

var CH46 = {
  LOOP: 70,          // seconds per loop, generous on purpose
  aimAt: 0.56,       // the green part of the throw bar
  aimWide: 0.12,
  throwSpeed: 0.85
};

function ch46Ent(id) {
  for (var i = 0; i < G.ents.length; i++) {
    if (G.ents[i].id === id) return G.ents[i];
  }
  return null;
}

function ch46FarFromPlayer(spots) {
  var best = spots[0], bd = -1;
  for (var i = 0; i < spots.length; i++) {
    var d = Math.hypot(spots[i][0] - G.px, spots[i][1] - G.py);
    if (d > bd) { bd = d; best = spots[i]; }
  }
  return best;
}

// ------------------------------------------------------------------- room

SCENES.c46_room = {
  title: "MAVERICK'S ROOM, AGAIN",
  spawn: { tx: 16, ty: 13, dir: 'up' },
  camZoom: 1,
  fill: 'wood',
  rects: [
    { x: 0, y: 0, w: 32, h: 4, t: 'wall' },
    { x: 0, y: 4, w: 1, h: 13, t: 'wall' },
    { x: 31, y: 4, w: 1, h: 13, t: 'wall' },
    { x: 0, y: 17, w: 32, h: 1, t: 'wall' },
    { x: 11, y: 8, w: 9, h: 5, t: 'rug' }
  ],
  solidKinds: ['wall'],
  entities: [
    { id: 'bed46', who: null, tx: 23, ty: 13, kind: 'bedroomBed', solid: true, sw: 5, sh: 3, propScale: 1 },
    { id: 'shelf46', who: null, tx: 3, ty: 9, kind: 'bedroomShelf', solid: true, sw: 3, sh: 2, propScale: 1 },
    { id: 'stand46', who: null, tx: 28, ty: 11, kind: 'bedroomStand', solid: true, propScale: 1 },
    { id: 'chest46', who: null, tx: 7, ty: 15, kind: 'bedroomChest', solid: true, propScale: 1 },
    { id: 'window46', who: null, tx: 7, ty: 2, kind: 'bedroomWindow', noSolid: true, propScale: 1 },
    { id: 'poster46', who: null, tx: 20, ty: 2, kind: 'bedroomPoster', noSolid: true, propScale: 1 },
    { id: 'door46', who: null, tx: 1, ty: 8, kind: 'c46Door', noSolid: true, propScale: 1 },
    { id: 'ritz46', who: null, tx: 14, ty: 13, kind: 'c46Ritz', noSolid: true, propScale: 1, reach: 54, talk: 'ch46Ritz' },
    { id: 'laundry46', who: null, tx: 17, ty: 15, kind: 'c46Laundry', noSolid: true, propScale: 1, reach: 54, talk: 'ch46Laundry' },
    { id: 'buck46', who: 'bucktooth_puppet', tx: 19, ty: 14, dir: 'up', small: true, reach: 62, talk: 'ch46Buck' },
    { id: 'exit_house46', exit: { to: 'c46_house', tx: 3, ty: 12, dir: 'right' }, tx: 1, ty: 8, rect: { w: 1, h: 2 } },
    { id: 'exit_street46', exit: { to: 'c46_street', tx: 15, ty: 3, dir: 'down' }, tx: 16, ty: 16, rect: { w: 2, h: 1 } }
  ],
  overlay: function (c) {
    // the afternoon is still coming through the window, even if nobody is
    var wx = 7 * TILE + TILE / 2, wy = 2 * TILE + TILE;
    var g = c.createRadialGradient(wx, wy, 8, wx, wy, 180);
    g.addColorStop(0, 'rgba(255,236,190,0.20)');
    g.addColorStop(0.55, 'rgba(255,224,170,0.07)');
    g.addColorStop(1, 'rgba(255,220,160,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    // a shaft of light on the floorboards
    c.fillStyle = 'rgba(255,238,196,0.055)';
    c.beginPath();
    c.moveTo(96, 48);
    c.lineTo(150, 48);
    c.lineTo(196, 200);
    c.lineTo(124, 200);
    c.closePath();
    c.fill();
    // corners darken, the room is a bit too quiet
    var vg = c.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 300);
    vg.addColorStop(0, 'rgba(20,14,8,0)');
    vg.addColorStop(1, 'rgba(20,14,8,0.34)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
  }
};

// ----------------------------------------------------------------- street

SCENES.c46_street = {
  title: 'CLOVIS, POPULATION: TWO',
  spawn: { tx: 15, ty: 3, dir: 'down' },
  camZoom: 1,
  fill: 'grass',
  rects: [
    { x: 0, y: 0, w: 32, h: 1, t: 'tree' },
    { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 0, y: 17, w: 32, h: 1, t: 'tree' },
    // the mall, shut and huge
    { x: 2, y: 1, w: 10, h: 2, t: 'roof' },
    { x: 2, y: 3, w: 10, h: 3, t: 'house' },
    // the Arby's, also shut, the real tragedy
    { x: 20, y: 1, w: 9, h: 2, t: 'roof' },
    { x: 20, y: 3, w: 9, h: 3, t: 'house' },
    // the road and its sidewalks
    { x: 1, y: 8, w: 30, h: 4, t: 'cobble' },
    { x: 1, y: 7, w: 30, h: 1, t: 'path' },
    { x: 1, y: 12, w: 30, h: 2, t: 'path' },
    { x: 14, y: 6, w: 4, h: 2, t: 'path' },
    { x: 14, y: 14, w: 4, h: 2, t: 'path' }
  ],
  solidKinds: ['tree', 'house', 'roof'],
  entities: [
    { id: 'mallSign46', who: null, tx: 7, ty: 6, kind: 'c46MallSign', noSolid: true, propScale: 1, reach: 54, talk: 'ch46MallSign' },
    { id: 'arbysSign46', who: null, tx: 24, ty: 6, kind: 'c46ArbysSign', noSolid: true, propScale: 1, reach: 54, talk: 'ch46ArbysSign' },
    { id: 'drone46', who: null, tx: 13, ty: 4, kind: 'c46Drone', noSolid: true, propScale: 1, reach: 90, talk: 'ch46Drone' },
    { id: 'lamp46a', who: null, tx: 5, ty: 13, kind: 'c46LampPost', solid: true, propScale: 1 },
    { id: 'lamp46b', who: null, tx: 27, ty: 13, kind: 'c46LampPost', solid: true, propScale: 1 },
    { id: 'hydrant46', who: null, tx: 11, ty: 13, kind: 'c46Hydrant', solid: true, propScale: 1 },
    { id: 'bench46', who: null, tx: 21, ty: 13, kind: 'c46Bench', solid: true, propScale: 1 },
    { id: 'cart46', who: null, tx: 9, ty: 11, kind: 'c46Cart', noSolid: true, propScale: 1 },
    { id: 'buck46s', who: 'bucktooth', tx: 17, ty: 11, dir: 'left', reach: 64, talk: 'ch46StreetBuck' },
    { id: 'exit_room46', exit: { to: 'c46_room', tx: 15, ty: 14, dir: 'up' }, tx: 15, ty: 1, rect: { w: 2, h: 1 } },
    { id: 'exit_park46', exit: { to: 'c46_park', tx: 3, ty: 12, dir: 'right' }, tx: 30, ty: 10, rect: { w: 1, h: 2 } }
  ],
  overlay: function (c) {
    // flat, bright, nobody-around light
    c.fillStyle = 'rgba(255,244,214,0.06)';
    c.fillRect(0, 0, W, H);
    // the buildings throw long shadows across the road
    c.fillStyle = 'rgba(40,44,36,0.16)';
    c.beginPath();
    c.moveTo(32, 96);
    c.lineTo(192, 96);
    c.lineTo(236, 144);
    c.lineTo(32, 144);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(320, 96);
    c.lineTo(464, 96);
    c.lineTo(500, 144);
    c.lineTo(320, 144);
    c.closePath();
    c.fill();
    // a heat haze line down the middle of the road
    c.fillStyle = 'rgba(255,250,230,0.05)';
    for (var i = 0; i < 5; i++) c.fillRect(0, 132 + i * 7, W, 1);
    var vg = c.createRadialGradient(W / 2, H / 2, 130, W / 2, H / 2, 320);
    vg.addColorStop(0, 'rgba(30,30,20,0)');
    vg.addColorStop(1, 'rgba(30,30,20,0.24)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
  }
};

// ------------------------------------------------------------------- park

SCENES.c46_park = {
  title: 'THE PARK FOUNTAIN',
  spawn: { tx: 3, ty: 12, dir: 'right' },
  camZoom: 1,
  fill: 'grass',
  rects: [
    { x: 0, y: 0, w: 32, h: 1, t: 'tree' },
    { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 0, y: 17, w: 32, h: 1, t: 'tree' },
    { x: 7, y: 8, w: 18, h: 8, t: 'path' },
    { x: 4, y: 4, w: 2, h: 2, t: 'tree' },
    { x: 26, y: 4, w: 2, h: 2, t: 'tree' },
    { x: 5, y: 15, w: 1, h: 2, t: 'tree' },
    { x: 27, y: 15, w: 1, h: 2, t: 'tree' }
  ],
  solidKinds: ['tree'],
  entities: [
    { id: 'fountain46', who: null, tx: 14, ty: 11, kind: 'fountainBig', solid: true, sw: 5, sh: 4 },
    { id: 'can46', who: null, tx: 16, ty: 14, kind: 'c46WhizCan', solid: true, sw: 3, sh: 1, propScale: 1, reach: 92, talk: 'ch46Can' },
    { id: 'buck46p', who: 'bucktooth', tx: 11, ty: 14, dir: 'right', reach: 64, talk: 'ch46ParkBuck' },
    { id: 'bench46a', who: null, tx: 8, ty: 8, kind: 'c46Bench', solid: true, propScale: 1 },
    { id: 'bench46b', who: null, tx: 23, ty: 8, kind: 'c46Bench', solid: true, propScale: 1 },
    { id: 'bin46', who: null, tx: 21, ty: 9, kind: 'c46Bin', solid: true, propScale: 1 },
    { id: 'mouse1', who: null, tx: 8, ty: 14, kind: 'c46Mouse', noSolid: true, propScale: 1, hidden: true },
    { id: 'mouse2', who: null, tx: 9, ty: 14, kind: 'c46Mouse', noSolid: true, propScale: 1, hidden: true },
    { id: 'mouse3', who: null, tx: 10, ty: 15, kind: 'c46Mouse', noSolid: true, propScale: 1, hidden: true },
    { id: 'mouse4', who: null, tx: 11, ty: 15, kind: 'c46Mouse', noSolid: true, propScale: 1, hidden: true },
    { id: 'mouse5', who: null, tx: 19, ty: 15, kind: 'c46Mouse', noSolid: true, propScale: 1, hidden: true },
    { id: 'mouse6', who: null, tx: 20, ty: 15, kind: 'c46Mouse', noSolid: true, propScale: 1, hidden: true },
    { id: 'exit_street46', exit: { to: 'c46_street', tx: 28, ty: 11, dir: 'left' }, tx: 1, ty: 12, rect: { w: 1, h: 2 } }
  ],
  overlay: function (c) {
    // the can is the only light source in Clovis
    var cx = 16 * TILE + 8, cy = 14 * TILE - 46;
    var g = c.createRadialGradient(cx, cy, 8, cx, cy, 170);
    g.addColorStop(0, 'rgba(255,222,90,0.26)');
    g.addColorStop(0.4, 'rgba(255,210,80,0.10)');
    g.addColorStop(1, 'rgba(255,200,60,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    // long late shadows from the trees
    c.fillStyle = 'rgba(36,46,28,0.18)';
    for (var i = 0; i < 4; i++) c.fillRect(0, 214 + i * 9, W, 3);
    var vg = c.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 310);
    vg.addColorStop(0, 'rgba(18,16,10,0)');
    vg.addColorStop(1, 'rgba(18,16,10,0.30)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
  }
};

// ------------------------------------------------------------------ house

SCENES.c46_house = {
  title: 'THE KITCHEN, AND THE OTHER ROOM',
  spawn: { tx: 3, ty: 12, dir: 'right' },
  camZoom: 1,
  fill: 'linoleum',
  rects: [
    { x: 0, y: 0, w: 32, h: 4, t: 'wall' },
    { x: 0, y: 4, w: 1, h: 13, t: 'wall' },
    { x: 31, y: 4, w: 1, h: 13, t: 'wall' },
    { x: 0, y: 17, w: 32, h: 1, t: 'wall' },
    { x: 2, y: 4, w: 11, h: 2, t: 'counter' },
    { x: 24, y: 4, w: 6, h: 2, t: 'counter' },
    { x: 4, y: 11, w: 8, h: 4, t: 'rug' }
  ],
  solidKinds: ['wall', 'counter'],
  entities: [
    { id: 'fridge46', who: null, tx: 25, ty: 7, kind: 'c46Fridge', solid: true, sw: 2, sh: 2, propScale: 1, reach: 66, talk: 'ch46Fridge' },
    { id: 'table46', who: null, tx: 15, ty: 10, kind: 'c46Table', solid: true, sw: 4, sh: 1, propScale: 1 },
    { id: 'wine46', who: null, tx: 15, ty: 10, kind: 'c46Wine', noSolid: true, propScale: 1, reach: 58, talk: 'ch46Wine' },
    { id: 'drawer46', who: null, tx: 5, ty: 7, kind: 'c46Drawer', solid: true, sw: 2, sh: 1, propScale: 1, reach: 60, talk: 'ch46Foil' },
    { id: 'teevee46', who: null, tx: 9, ty: 7, kind: 'c46Teevee', noSolid: true, propScale: 1 },
    { id: 'sofa46', who: null, tx: 7, ty: 12, kind: 'c46Sofa', solid: true, sw: 3, sh: 1, propScale: 1 },
    { id: 'door46h', who: null, tx: 30, ty: 9, kind: 'c46Door', noSolid: true, propScale: 1 },
    { id: 'buck46h', who: 'bucktooth', tx: 11, ty: 9, dir: 'right', reach: 64, talk: 'ch46HouseBuck' },
    { id: 'taffy46', who: 'taffy', tx: 20, ty: 8, dir: 'down', noSolid: true, hidden: true, reach: 62, talk: 'ch46Taffy' },
    { id: 'vecna46', who: 'vecna_cowboy', tx: 24, ty: 8, dir: 'left', hidden: true },
    { id: 'mouse7', who: null, tx: 21, ty: 13, kind: 'c46Mouse', noSolid: true, propScale: 1, hidden: true },
    { id: 'mouse8', who: null, tx: 22, ty: 14, kind: 'c46Mouse', noSolid: true, propScale: 1, hidden: true },
    { id: 'exit_room46h', exit: { to: 'c46_room', tx: 3, ty: 9, dir: 'right' }, tx: 30, ty: 10, rect: { w: 1, h: 2 } }
  ],
  overlay: function (c) {
    // a warm kitchen with one cold, yellow problem in the corner
    var g = c.createRadialGradient(240, 150, 30, 240, 150, 250);
    g.addColorStop(0, 'rgba(255,226,170,0.16)');
    g.addColorStop(0.6, 'rgba(255,214,150,0.05)');
    g.addColorStop(1, 'rgba(30,20,12,0.30)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    if (G.flags.c46_reveal) {
      // the fridge is open, and something tall is standing in the light
      var f = c.createRadialGradient(25 * TILE, 6 * TILE, 6, 25 * TILE, 6 * TILE, 120);
      f.addColorStop(0, 'rgba(255,238,130,0.30)');
      f.addColorStop(0.5, 'rgba(220,220,120,0.10)');
      f.addColorStop(1, 'rgba(220,220,120,0)');
      c.fillStyle = f;
      c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(40,60,30,0.16)';
      c.beginPath();
      c.moveTo(380, 120);
      c.lineTo(512, 90);
      c.lineTo(512, 240);
      c.lineTo(350, 260);
      c.closePath();
      c.fill();
    }
  }
};

// ------------------------------------------------------------------ props

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (!k || k.indexOf('c46') !== 0) return false;
  var P = propPainter(c, e);

  function T(txt, dx, dy, size, col) {
    c.save();
    c.font = 'bold ' + size + 'px monospace';
    c.fillStyle = col;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(txt, e.px + dx, e.py + dy);
    c.restore();
  }

  if (k === 'c46Ritz') {
    P(-18, 1, 36, 3, 'rgba(0,0,0,0.20)');
    P(-16, -6, 32, 7, '#8f2a24');
    P(-15, -5, 30, 5, '#a8342c');
    P(-12, -4, 13, 3, '#e8dcc8');
    P(-10, -3, 8, 1, '#a8342c');
    P(-13, -13, 27, 7, '#9a2e28');
    P(-12, -12, 25, 5, '#b03a30');
    P(-8, -11, 11, 3, '#efe2c8');
    P(-8, -20, 18, 7, '#8f2a24');
    P(-7, -19, 16, 5, '#a8342c');
    P(-5, -18, 8, 2, '#efe2c8');
    // one box leaned against the stack, because Mav sleeps like a dropped coat
    P(14, -10, 11, 10, '#7f2822');
    P(15, -9, 9, 8, '#9a2e28');
    P(17, -6, 5, 2, '#e8dcc8');
    P(-20, -2, 3, 2, '#c8a878');
    P(12, -1, 3, 1, '#c8a878');
    return true;
  }

  if (k === 'c46Laundry') {
    P(-22, 1, 44, 3, 'rgba(0,0,0,0.18)');
    P(-19, -7, 38, 8, '#5f6f8a');
    P(-15, -13, 23, 7, '#7a8aa4');
    P(-9, -17, 15, 6, '#c8c0b0');
    P(4, -11, 14, 8, '#8a5a6a');
    P(-2, -8, 9, 4, '#a87888');
    P(-17, -5, 10, 3, '#6a7a92');
    // a sock trying to escape
    P(15, -3, 9, 4, '#e8e2d0');
    P(22, -2, 4, 3, '#e8e2d0');
    P(23, -2, 2, 1, '#b8b0a0');
    // the doll's dent
    P(-12, -14, 12, 3, 'rgba(60,70,92,0.55)');
    return true;
  }

  if (k === 'c46Door') {
    P(-9, -42, 18, 42, '#3a2a1c');
    P(-7, -40, 14, 38, '#6a4a30');
    P(-7, -40, 14, 2, '#8a6440');
    P(-7, -22, 14, 1, 'rgba(42,26,14,0.55)');
    P(2, -24, 3, 3, '#d8b44a');
    P(-7, -2, 14, 2, 'rgba(255,226,170,0.30)');
    return true;
  }

  if (k === 'c46MallSign') {
    P(-2, -20, 4, 20, '#6a6a72');
    P(-34, -52, 68, 32, '#22222c');
    P(-32, -50, 64, 28, '#33333f');
    P(-32, -50, 64, 1, 'rgba(255,240,200,0.22)');
    T('CLOVIS MALL', 0, -43, 9, '#e8dcc0');
    T('CLOSED FOREVER', 0, -33, 6, '#c8a06a');
    P(-32, -22, 64, 1, 'rgba(0,0,0,0.4)');
    return true;
  }

  if (k === 'c46ArbysSign') {
    P(-2, -20, 4, 20, '#6a5a52');
    // the hat
    P(-28, -46, 56, 6, '#a83a2c');
    P(-20, -58, 40, 14, '#c8452f');
    P(-20, -58, 40, 3, '#e05a40');
    P(-28, -46, 56, 2, '#7f2822');
    T("ARBY'S", 0, -51, 10, '#f6ecd8');
    P(-26, -38, 52, 16, '#22222c');
    P(-24, -36, 48, 12, '#33333f');
    T('DESERTED', 0, -30, 7, '#c8a06a');
    return true;
  }

  if (k === 'c46Drone') {
    var bob = Math.sin(G.time * 2.1 + e.tx) * 2;
    // rotors
    P(-16, -34 + bob, 10, 2, '#3a3a44');
    P(6, -34 + bob, 10, 2, '#3a3a44');
    P(-13, -36 + bob, 3, 2, '#6a6a74');
    P(10, -36 + bob, 3, 2, '#6a6a74');
    // body
    P(-5, -30 + bob, 10, 4, '#5a5a66');
    P(-8, -26 + bob, 16, 7, '#8a8a96');
    P(-7, -25 + bob, 14, 2, '#c8c8d0');
    P(-3, -19 + bob, 6, 2, '#4a4a54');
    // the sticker
    P(-6, -23 + bob, 12, 6, '#f4f0e4');
    P(-5, -22 + bob, 10, 1, '#9a9488');
    P(-5, -20 + bob, 8, 1, '#9a9488');
    P(0, -16 + bob, 1, 1, '#e8605a');
    return true;
  }

  if (k === 'c46LampPost') {
    P(-9, 1, 18, 3, 'rgba(0,0,0,0.22)');
    P(-4, -6, 8, 6, '#3a3a42');
    P(-1, -54, 3, 49, '#4a4a52');
    P(-5, -45, 11, 3, '#3a3a42');
    P(-8, -62, 16, 7, '#5a5a64');
    P(-8, -62, 16, 2, '#3a3a42');
    P(-5, -60, 10, 3, '#f0e2a0');
    P(-4, -59, 8, 1, '#fff4c8');
    return true;
  }

  if (k === 'c46Hydrant') {
    P(-6, 0, 12, 2, 'rgba(0,0,0,0.20)');
    P(-5, -12, 10, 12, '#b83228');
    P(-4, -16, 8, 4, '#c84034');
    P(-6, -15, 12, 3, '#d85a44');
    P(-2, -19, 4, 3, '#c84034');
    P(-7, -10, 3, 4, '#8f241c');
    P(4, -10, 3, 4, '#8f241c');
    P(-5, -7, 10, 2, '#8f241c');
    return true;
  }

  if (k === 'c46Bench') {
    P(-22, 1, 44, 3, 'rgba(0,0,0,0.20)');
    P(-20, -10, 40, 4, '#7a5a3a');
    P(-20, -6, 40, 3, '#6a4a2c');
    P(-20, -20, 40, 4, '#7a5a3a');
    P(-20, -16, 40, 3, '#6a4a2c');
    P(-18, -4, 3, 5, '#4a3a2a');
    P(15, -4, 3, 5, '#4a3a2a');
    P(-18, -10, 3, 6, '#4a3a2a');
    P(15, -10, 3, 6, '#4a3a2a');
    return true;
  }

  if (k === 'c46Cart') {
    // a shopping trolley on its side, wheels still turning
    P(-18, -8, 36, 3, 'rgba(0,0,0,0.18)');
    P(-16, -18, 32, 14, '#9aa0aa');
    P(-14, -16, 28, 10, '#b8bec8');
    for (var gx = 0; gx < 5; gx++) P(-13 + gx * 6, -16, 1, 10, 'rgba(90,96,108,0.55)');
    P(-20, -12, 4, 4, '#6a707a');
    P(16, -12, 4, 4, '#6a707a');
    P(-16, -4, 4, 4, '#2f333a');
    P(12, -4, 4, 4, '#2f333a');
    P(14, -22, 10, 2, '#8a909a');
    return true;
  }

  if (k === 'c46Bin') {
    P(-9, 1, 18, 3, 'rgba(0,0,0,0.20)');
    P(-8, -20, 16, 20, '#4a5a4a');
    P(-9, -22, 18, 3, '#5f705f');
    P(-6, -17, 12, 2, '#3a4a3a');
    P(-1, -14, 2, 8, '#3a4a3a');
    return true;
  }

  if (k === 'c46WhizCan') {
    // thirty feet of cheese product, and it knows it
    var cx = e.px, cy = e.py - 64;
    var glow = c.createRadialGradient(cx, cy, 6, cx, cy, 92);
    glow.addColorStop(0, 'rgba(255,236,130,0.34)');
    glow.addColorStop(0.55, 'rgba(255,214,70,0.12)');
    glow.addColorStop(1, 'rgba(255,200,40,0)');
    c.fillStyle = glow;
    c.fillRect(cx - 100, cy - 100, 200, 200);
    P(-24, -6, 48, 6, 'rgba(0,0,0,0.24)');
    P(-22, -122, 44, 112, '#b8860a');
    P(-19, -119, 38, 106, '#f0c62a');
    P(-19, -119, 38, 9, '#d8a818');
    P(-19, -110, 38, 3, '#f8dc62');
    // lid
    P(-22, -128, 44, 7, '#c8ccd2');
    P(-20, -127, 40, 3, '#eef0f4');
    P(-22, -121, 44, 2, '#8f939a');
    // label
    P(-19, -92, 38, 32, '#f6e6a0');
    P(-17, -90, 34, 28, '#fbf0c0');
    T('CHEEZ', 0, -81, 9, '#a8541e');
    T('WHIZ', 0, -71, 10, '#a8541e');
    P(-12, -64, 24, 2, '#c8942a');
    T('30 FT', 0, -59, 5, '#8a6a2a');
    // a big drip of product, because it is not real cheese
    P(-6, -62, 12, 9, '#f0b41e');
    P(-3, -55, 6, 5, '#f0b41e');
    P(-1, -51, 2, 4, '#e0a410');
    // the author's sticker, of course
    P(8, -112, 13, 9, '#f6f2e4');
    P(9, -111, 11, 1, '#9a9488');
    P(9, -109, 9, 1, '#9a9488');
    P(9, -107, 7, 1, '#9a9488');
    // the rim catches the light
    P(-19, -119, 38, 1, '#ffe98a');
    return true;
  }

  if (k === 'c46Mouse') {
    var tw = Math.sin(G.time * 5 + e.tx) * 1;
    P(-6, -2, 10, 2, 'rgba(0,0,0,0.18)');
    P(-5, -7, 10, 6, '#8a8a94');
    P(-3, -10, 6, 4, '#9a9aa6');
    P(-4, -11, 3, 3, '#b0b0bc');
    P(1, -11, 3, 3, '#b0b0bc');
    P(-1, -9, 1, 1, '#2a2a32');
    P(6, -4, 6 + tw, 1, '#c8a8a0');
    return true;
  }

  if (k === 'c46Fridge') {
    var open = !!G.flags.c46_reveal;
    P(-24, 1, 48, 3, 'rgba(0,0,0,0.22)');
    P(-23, -80, 46, 80, '#b8bcc4');
    P(-21, -78, 42, 76, '#eef2f4');
    P(-21, -78, 42, 2, '#fafcfe');
    P(-21, -42, 42, 2, '#c8ccd4');
    P(15, -68, 3, 12, '#a8acb4');
    P(15, -34, 3, 12, '#a8acb4');
    if (open) {
      P(-21, -78, 30, 76, '#fff2b0');
      P(-19, -40, 26, 36, '#f8e6a0');
      P(-17, -54, 22, 3, '#c8b880');
      P(-17, -70, 22, 3, '#c8b880');
      P(-17, -70, 22, 2, '#e0d09a');
      // the cheese shaped hole where a three pound block used to be
      P(-10, -52, 14, 8, '#d8a818');
      P(-9, -51, 12, 6, '#f0c62a');
      T('?', 5, -48, 7, '#8a6a2a');
    } else {
      // a note held on by a magnet
      P(-6, -66, 14, 10, '#f6f2e0');
      P(-5, -65, 12, 1, '#a8a294');
      P(-5, -63, 10, 1, '#a8a294');
      P(-5, -61, 8, 1, '#a8a294');
      P(-2, -68, 4, 2, '#c8452f');
    }
    return true;
  }

  if (k === 'c46Table') {
    P(-38, 1, 76, 3, 'rgba(0,0,0,0.20)');
    P(-36, -36, 72, 4, '#8a5e40');
    P(-36, -32, 72, 3, '#6a4630');
    P(-34, -36, 68, 1, '#a07450');
    P(-32, -30, 5, 30, '#5a3a28');
    P(27, -30, 5, 30, '#5a3a28');
    P(-32, -6, 5, 6, '#4a2e1f');
    P(27, -6, 5, 6, '#4a2e1f');
    // a bowl of something that is not cheese
    P(-22, -42, 14, 6, '#c8c0a8');
    P(-21, -41, 12, 4, '#e0d8c0');
    P(-20, -40, 10, 2, '#8a9a5a');
    return true;
  }

  if (k === 'c46Wine') {
    if (G.flags.c46_wine) {
      // on its side, bleeding into the tablecloth
      P(-18, -38, 26, 9, '#2f4a2c');
      P(-16, -37, 22, 3, '#4a6a40');
      P(8, -35, 10, 6, '#2f4a2c');
      P(16, -34, 4, 4, '#4a3a1e');
      P(-2, -32, 18, 3, '#e8e2d0');
      P(4, -30, 15, 2, '#8a1f30');
      P(18, -29, 8, 2, '#8a1f30');
      P(24, -27, 3, 10, '#7a1a2a');
      P(25, -18, 2, 6, '#6a1622');
      P(-12, -40, 5, 1, 'rgba(255,240,220,0.25)');
    } else {
      P(-5, -62, 10, 26, '#2f4a2c');
      P(-4, -61, 8, 24, '#3f5e36');
      P(-3, -44, 6, 9, '#e8e2d0');
      P(-2, -43, 4, 1, '#8a8272');
      P(-2, -41, 4, 1, '#8a8272');
      P(-3, -35, 6, 3, '#2f4a2c');
      P(-2, -66, 4, 4, '#6a4a2c');
      P(-1, -68, 2, 2, '#d8b44a');
      P(-3, -58, 1, 16, 'rgba(255,240,220,0.18)');
    }
    return true;
  }

  if (k === 'c46Drawer') {
    P(-24, 1, 48, 3, 'rgba(0,0,0,0.20)');
    P(-22, -32, 44, 32, '#7a5a3a');
    P(-20, -30, 40, 9, '#a07c56');
    P(-20, -19, 40, 9, '#a07c56');
    P(-20, -8, 40, 7, '#a07c56');
    P(-18, -29, 36, 1, '#c09a70');
    P(-18, -18, 36, 1, '#c09a70');
    P(-18, -7, 36, 1, '#c09a70');
    P(-3, -26, 6, 2, '#5a3a22');
    P(-3, -15, 6, 2, '#5a3a22');
    P(-3, -5, 6, 2, '#5a3a22');
    // a scrap of foil catching the light
    P(12, -28, 6, 5, '#dfe4ea');
    P(13, -27, 4, 3, '#f4f7fa');
    return true;
  }

  if (k === 'c46Teevee') {
    P(-20, 1, 40, 3, 'rgba(0,0,0,0.18)');
    P(-16, -14, 32, 14, '#5a3f28');
    P(-16, -38, 32, 24, '#2a2622');
    P(-14, -36, 28, 20, '#3a3530');
    P(-12, -34, 24, 16, '#20222a');
    P(-10, -32, 20, 3, '#2f3a4a');
    P(-8, -27, 4, 4, '#7fa8c8');
    P(4, -29, 2, 6, '#5a7a98');
    P(-18, -44, 2, 6, '#8a8a92');
    P(-12, -46, 2, 8, '#8a8a92');
    return true;
  }

  if (k === 'c46Sofa') {
    P(-46, 1, 92, 3, 'rgba(0,0,0,0.20)');
    P(-44, -14, 88, 15, '#3f4f60');
    P(-44, -14, 88, 2, '#53657a');
    P(-44, -40, 88, 28, '#4a5a6a');
    P(-42, -38, 84, 24, '#5f7285');
    P(-40, -32, 38, 14, '#6a7f92');
    P(2, -32, 38, 14, '#6a7f92');
    P(-48, -36, 10, 28, '#3a4858');
    P(38, -36, 10, 28, '#3a4858');
    P(-48, -36, 10, 3, '#4f6072');
    P(38, -36, 10, 3, '#4f6072');
    P(-40, -36, 38, 2, '#7a8fa2');
    P(2, -36, 38, 2, '#7a8fa2');
    // the cushion Mav was told not to put his shoes on
    P(-10, -28, 14, 10, '#8a5a3a');
    P(-9, -27, 12, 8, '#a06a46');
    return true;
  }

  return false;
});

// -------------------------------------------------------------- player bits

PLAYER_HOOKS.push(function (c) {
  if (G.level !== 'ch46') return;
  if (G.flags.c46_foil) {
    // two squares of kitchen foil, worn with enormous confidence
    var hy = G.py - 10;
    var lx = G.px - 8, rx = G.px + 5;
    if (G.dir === 'left') { lx = G.px - 10; rx = G.px + 2; }
    if (G.dir === 'right') { lx = G.px - 4; rx = G.px + 8; }
    c.fillStyle = '#c8d0d8';
    c.fillRect(Math.round(lx), Math.round(hy), 4, 4);
    c.fillRect(Math.round(rx), Math.round(hy), 4, 4);
    c.fillStyle = '#f0f4f8';
    c.fillRect(Math.round(lx) + 1, Math.round(hy) + 1, 2, 1);
    c.fillRect(Math.round(rx) + 1, Math.round(hy) + 1, 2, 1);
    c.fillStyle = 'rgba(255,255,255,0.55)';
    c.fillRect(Math.round(lx) + 3, Math.round(hy) + 2, 1, 1);
    c.fillRect(Math.round(rx) + 3, Math.round(hy) + 2, 1, 1);
  }
  if (G.flags.c46_aim) {
    // the asparagus, held like a javelin and a mistake
    var ax = G.px + (G.dir === 'left' ? -12 : 6);
    var ay = G.py - 16;
    c.fillStyle = '#3f6a34';
    c.fillRect(Math.round(ax), Math.round(ay), 2, 12);
    c.fillStyle = '#4f8a40';
    c.fillRect(Math.round(ax) + 2, Math.round(ay) + 1, 2, 10);
    c.fillStyle = '#6aa050';
    c.fillRect(Math.round(ax) + 4, Math.round(ay) + 3, 2, 7);
    c.fillStyle = '#8a6a3a';
    c.fillRect(Math.round(ax) - 1, Math.round(ay) + 10, 4, 2);
    c.fillStyle = '#2f4f28';
    c.fillRect(Math.round(ax) + 1, Math.round(ay) - 2, 1, 3);
    c.fillRect(Math.round(ax) + 3, Math.round(ay) + 1, 1, 3);
  }
});

// ----------------------------------------------------------------- scripts

SCRIPT.ch46Ritz = function () {
  say([
    { who: 'narrator', text: 'A stack of empty Ritz boxes. Mav was sleeping on them. Structurally they are the most honest thing in the room.' }
  ]);
};

SCRIPT.ch46Laundry = function () {
  say([
    { who: 'narrator', text: 'A pile of laundry with a doll shaped dent in it. The dent is still warm, which is a whole other problem.' }
  ]);
};

SCRIPT.ch46Buck = function () {
  if (G.flags.c46_thrown) {
    say([
      { who: 'bucktooth', text: 'The asparagus is still out there, frozen, being smug. We need a different frequency.' },
      { who: 'maverick', text: 'Kate Bush?' },
      { who: 'bucktooth', text: 'Kate Bush. But not in here. The acoustics are in the kitchen.' },
      { who: 'narrator', text: '[The kitchen is through the west door.]' }
    ]);
    return;
  }
  if (G.flags.c46_wine) {
    say([
      { who: 'bucktooth', text: 'Foil mittens, a chant, and a witness in a pimp coat. This is the most structured plan I have ever had.' },
      { who: 'maverick', text: 'Taffy said to throw a vegetable at it.' },
      { who: 'bucktooth', text: 'Then throw a vegetable at it. Aim for the label. The label is the load bearing part.' },
      { who: 'narrator', text: '[The park is east, past the mall.]' }
    ]);
    return;
  }
  if (G.flags.c46_knowsFountain) {
    say([
      { who: 'maverick', text: 'Professor. There is a thirty foot can of Cheez Whiz on the fountain in the park.' },
      { who: 'bucktooth', text: 'Maverick, we have not been to the park. The narrative has not taken us there.' },
      { who: 'maverick', text: 'I know. That is the problem.' },
      { who: 'bucktooth', text: 'Then the kitchen. Aluminum. Foil mittens. It is the only way to shield our frequencies.' },
      { who: 'narrator', text: '[The kitchen is through the west door.]' }
    ]);
    return;
  }
  if (G.flags.c46_met) {
    say([
      { who: 'bucktooth', text: 'The street is empty and my theatrical range is going unverified. This is the worst audience I have ever had.' },
      { who: 'narrator', text: '[South to the street. West to the kitchen.]' }
    ]);
    return;
  }
  G.flags.c46_met = 1;
  say([
    { who: 'bucktooth', text: 'But my internal sensors suggest a massive drop in local social-density! We must clear our palates with the rhythmic frequencies of Kate Bush!' },
    { who: 'bucktooth', text: 'We shall sing to the first citizen we encounter!' },
    { who: 'maverick', text: "Great idea, Professor. I have been practicing the high notes for 'Running Up That Hill' since Tuesday." },
    { who: 'narrator', text: 'They stepped onto the porch. Clovis was silent. Not a car, not a dog, not even a menacing otter was in sight.' },
    { who: 'narrator', text: '[The front door is south. The kitchen is west.]' }
  ]);
};

SCRIPT.ch46MallSign = function () {
  say([
    { who: 'sign', text: 'CLOVIS MALL. SORRY, WE ARE CLOSED FOREVER. The FOREVER is new.' }
  ]);
};

SCRIPT.ch46ArbysSign = function () {
  say([
    { who: 'sign', text: "ARBY'S. THE REAL TRAGEDY. A single curly fry sits in the car park, undisturbed, like a small monument." }
  ]);
};

SCRIPT.ch46Drone = function () {
  if (G.flags.c46_drone) {
    say([
      { who: 'narrator', text: 'The drone is still there, hovering at the same patient height, with the same sticker.' }
    ]);
    return;
  }
  G.flags.c46_drone = 1;
  say([
    { who: 'narrator', text: 'A high tech drone hovered over the empty street. It had a white sticker: PROPERTY OF THE AUTHOR. DO NOT FEED THE PROTAGONISTS.' },
    { who: 'bucktooth', text: 'Aha! A breach in the fourth wall! Take us home, you flying tin-can! This plot arc has lost its foundational stability! We wish to finish our journey!' },
    { who: 'narrator', text: 'A deep cosmic voice whispered from the clouds: "Nuh-uh."' },
    { who: 'narrator', text: 'The drone rotated one degree and said nothing else for the rest of the afternoon.' }
  ]);
};

SCRIPT.ch46StreetBuck = function () {
  if (G.flags.c46_knowsFountain) {
    say([
      { who: 'bucktooth', text: 'We have already sung this street once. I can tell by the acoustics. They are guilty.' },
      { who: 'narrator', text: '[The park is east. Home is north.]' }
    ]);
    return;
  }
  say([
    { who: 'narrator', text: 'They walked through the neighborhood, belting out: "And if I only could... I would make a deal with the Author..."' },
    { who: 'narrator', text: "No one responded. They checked the mall. Empty. They checked the Arby's. Deserted, which was the real tragedy." },
    { who: 'bucktooth', text: 'The structural abandonment of the planet is at 100%! There is no one to witness my theatrical range!' },
    { who: 'narrator', text: 'They considered Taffy\'s gold spoke bicycles and Madagascar. Then they decided the park was closer.' },
    { who: 'narrator', text: '[The park is east.]' }
  ]);
};

SCRIPT.ch46ParkBuck = function () {
  if (G.flags.c46_thrown) {
    say([
      { who: 'bucktooth', text: 'The vegetable is hovering. The can is gloating. I have never been so unemployed in a crisis.' }
    ]);
    return;
  }
  if (G.flags.c46_wine) {
    say([
      { who: 'bucktooth', text: 'There it is. The source. A foundational lie with a label.' },
      { who: 'maverick', text: 'Taffy said to throw a vegetable at the cheese product.' },
      { who: 'bucktooth', text: 'Then throw one. I will stand here and provide commentary.' },
      { who: 'narrator', text: '[Talk to the can to take the throw.]' }
    ]);
    return;
  }
  say([
    { who: 'bucktooth', text: 'Maverick. That can is thirty feet tall and glowing like a nightlight for bad decisions.' },
    { who: 'maverick', text: 'Cheez Whiz does not even count as real cheese. It is a foundational lie.' },
    { who: 'bucktooth', text: 'Agreed. We should tell someone with a plan. Preferably someone in a pimp coat.' }
  ]);
};

SCRIPT.ch46Can = function () {
  if (G.flags.c46_done) return;
  if (!G.flags.c46_knowsFountain) {
    G.flags.c46_knowsFountain = 1;
    SFX.blip(180, 0.2);
    say([
      { who: 'narrator', text: "It was thirty feet tall and glowing with an artificial yellow radiance. The World's Largest Can of Cheez Whiz, sitting on the dry fountain like it had been there all along." },
      { who: 'maverick', text: 'Ugh! Cheez Whiz? That does not even count as real cheese! It is a foundational lie!' },
      { who: 'bucktooth', text: 'Exactly! The Author is clearly insane! He has no respect for the integrity of a sharp cheddar!' },
      { who: 'narrator', text: 'Mav reached out and touched the can.' },
      { who: 'narrator', text: 'A deep, cosmic voice whispered from the clouds: "Nuh-uh, child."' },
      { who: 'narrator', text: 'The world went white.' }
    ], function () { ch46ResetLoop(); });
    return;
  }
  if (!G.flags.c46_wine) {
    say([
      { who: 'bucktooth', text: 'We are standing at the source of the loop with no plan, no foil and no witness. This is the part where the narrator usually sends us a sign.' },
      { who: 'narrator', text: 'A pigeon did not arrive. The can hummed, smugly.' },
      { who: 'maverick', text: 'The kitchen. Taffy. Somebody. Let us go home.' }
    ]);
    return;
  }
  if (!G.flags.c46_thrown) {
    say([
      { who: 'narrator', text: 'Mav reached into his backpack and pulled out the biggest, most aggressive bunch of asparagus he could find.' },
      { who: 'bucktooth', text: 'A biological anomaly! Aim for the label! The label is the load bearing part!' },
      { who: 'maverick', text: 'I am going to throw a vegetable at a can of cheese product. My life has become a sentence I do not understand.' },
      { who: 'narrator', text: '[Press E when the needle is in the green.]' }
    ], function () { ch46BeginAim(); });
    return;
  }
  say([
    { who: 'narrator', text: 'The asparagus is still hanging there, six inches from the label, frozen in time and judgment.' }
  ]);
};

SCRIPT.ch46Wine = function () {
  if (G.flags.c46_done) return;
  if (G.flags.c46_wine) {
    say([
      { who: 'narrator', text: 'The bottle is on its side. The good tablecloth is a casualty. Taffy is examining his coat like it owes him money.' }
    ]);
    return;
  }
  G.flags.c46_wine = 1;
  G.flags.seen_taffy46 = 1;
  G.flags.seen_mouse1 = 1; G.flags.seen_mouse2 = 1; G.flags.seen_mouse3 = 1;
  G.flags.seen_mouse4 = 1; G.flags.seen_mouse5 = 1; G.flags.seen_mouse6 = 1;
  G.flags.seen_mouse7 = 1; G.flags.seen_mouse8 = 1;
  buildScene('c46_house');
  FX.burst(G.px, G.py - 10, '#c8a0d8', 22, { speed: 70, life: 0.7, lift: 40 });
  SFX.pickup();
  var lines = [
    { who: 'narrator', text: 'Mav backed into the table and knocked over the bottle of wine. POOF.' },
    { who: 'taffy', text: 'Yo, monkes. Why are you wasting good grape-juice?' }
  ];
  if (G.flags.c46_foil) {
    lines.push({ who: 'taffy', text: 'And why are you wearing baked-potato gloves?' });
    lines.push({ who: 'bucktooth', text: 'They are foil mittens. They shield our frequencies.' });
  } else {
    lines.push({ who: 'taffy', text: 'And why are you dressed like a normal Tuesday?' });
    lines.push({ who: 'bucktooth', text: 'We were about to fix that. Foil is the only shield.' });
  }
  lines.push(
    { who: 'bucktooth', text: 'Taffy! We are trapped in a loop by the Cheese Master! The world is empty and the narrative is sagging!' },
    { who: 'taffy', text: 'Feeling a bit bleu, are we? Brie-lieve me, I have seen worse. You want out? You gotta find the source.' },
    { who: 'narrator', text: 'Taffy pulled a golden flute from the pocket of his pimp coat and played a trill that sounded like a squeaky hinge. Hundreds of mice poured out of the floorboards.' },
    { who: 'taffy', text: 'The only way to break the loop is to introduce a Biological Anomaly. Throw a vegetable at the cheese product!' },
    { who: 'maverick', text: 'I have asparagus. It has been in my bag since the sorbet incident.' },
    { who: 'taffy', text: 'Then follow the mice, monkes. The fountain. And try not to think about the can.' },
    { who: 'narrator', text: '[The mice are heading east. The park is through the street.]' }
  );
  say(lines);
};

SCRIPT.ch46Taffy = function () {
  say([
    { who: 'taffy', text: 'Still here. Still bleu. The mice know the way, monkes. Follow the little guys.' }
  ]);
};

SCRIPT.ch46Foil = function () {
  if (G.flags.c46_foil) {
    say([
      { who: 'narrator', text: "The drawer is empty. Mav's hands are already wrapped. He looks like a confused astronaut." }
    ]);
    return;
  }
  G.flags.c46_foil = 1;
  FX.burst(G.px, G.py - 10, '#dfe4ea', 16, { speed: 55, life: 0.6, lift: 30 });
  SFX.pickup();
  say([
    { who: 'bucktooth', text: 'Foil mittens! Wrap your hands in every scrap of aluminum in the kitchen! It is the only way to shield our frequencies!' },
    { who: 'maverick', text: 'I look like a confused astronaut.' },
    { who: 'bucktooth', text: 'You look like a warrior. Now, the Chant of the Curd.' }
  ]);
};

SCRIPT.ch46Fridge = function () {
  if (G.flags.c46_reveal) {
    say([
      { who: 'narrator', text: 'The fridge door is open. There is a cheese shaped hole on the shelf and a smell like a damp basement with opinions.' }
    ]);
    return;
  }
  say([
    { who: 'narrator', text: 'The fridge is covered in notes. One says DO NOT EAT THE GOOD CHEDDAR. Another says THIS MEANS YOU, MAV.' }
  ]);
};

SCRIPT.ch46HouseBuck = function () {
  if (G.flags.c46_done) return;
  if (G.flags.c46_reveal) {
    say([{ who: 'bucktooth', text: 'GIVE US THE CHEDDAR, YOU INTERDIMENSIONAL NIBBLER!' }]);
    return;
  }
  if (!G.flags.c46_wine) {
    if (!G.flags.c46_foil) {
      say([
        { who: 'bucktooth', text: 'The Cheese Master is a rival narrator with a preference for processed dairy. We need Foil Mittens! Wrap your hands in every scrap of aluminum in the kitchen!' },
        { who: 'maverick', text: 'That is the drawer by the counter.' },
        { who: 'narrator', text: '[Search the kitchen drawer for foil.]' }
      ]);
      return;
    }
    G.flags.c46_chant = 1;
    say([
      { who: 'bucktooth', text: 'Now, we perform the Chant of the Curd! Shake your mittens and wiggle your tail-bone!' },
      { who: 'maverick', text: 'Brie! Gouda! Gorgonzola!' },
      { who: 'bucktooth', text: 'Brie! Gouda! Gorgonzola!' },
      { who: 'narrator', text: 'They danced around the living room, chanting, for twenty minutes. Nothing happened. Then nothing happened a little harder.' },
      { who: 'bucktooth', text: 'The chant requires a spill. A sacrifice. Something with a cork.' },
      { who: 'narrator', text: '[Knock over the wine bottle on the table.]' }
    ]);
    return;
  }
  if (!G.flags.c46_thrown) {
    say([
      { who: 'bucktooth', text: 'The mice are already in the street. Follow them east. Throw the vegetable. Try to look foundational.' },
      { who: 'narrator', text: '[The park is east.]' }
    ]);
    return;
  }
  if (!G.flags.c46_canSing) {
    G.flags.c46_canSing = 1;
    say([
      { who: 'bucktooth', text: 'Maverick. The doll is a vessel. I am inside it. Sing Kate Bush and hold the note, and I will see through whatever is wearing the room.' },
      { who: 'maverick', text: 'That is the weirdest sentence you have ever said, and you once described a dam as load bearing.' },
      { who: 'bucktooth', text: 'Stand close. Hold E. Think high. Think Tuesday.' },
      { who: 'narrator', text: '[Hold E near Professor Bucktooth.]' }
    ]);
    return;
  }
  say([
    { who: 'bucktooth', text: 'Hold the note. Do not let go. It is Kate Bush, not a suggestion.' }
  ]);
};

// ---------------------------------------------------------------- mechanic

function ch46ResetLoop() {
  if (G.level !== 'ch46' || G.flags.c46_done) return;
  if (G.flags.c46_resetCd && G.time < G.flags.c46_resetCd) return;
  G.flags.c46_resetCd = G.time + 1.6;
  G.flags.c46_loop = (G.flags.c46_loop || 1) + 1;
  G.flags.c46_t = CH46.LOOP;
  G.flags.c46_aim = 0;
  G.flags.c46_aimPos = 0;
  G.flags.c46_singCharge = 0;
  G.flags.c46_canSing = 0;
  G.perform = false;
  G.flash = 1;
  G.shake = 0.9;
  SFX.tone(70, 0.4, 'sawtooth', 0.07);
  SFX.tone(120, 0.5, 'triangle', 0.05);
  FX.burst(G.px, G.py - 10, '#ffe9a0', 28, { speed: 110, life: 0.8, lift: 30 });
  toast('LOOP ' + G.flags.c46_loop + ': only you remember');
  G.toScene('c46_room', SCENES.c46_room.spawn.tx, SCENES.c46_room.spawn.ty, 'up');
}

function ch46BeginAim() {
  G.flags.c46_aim = 1;
  G.flags.c46_aimPos = 0;
  G.flags.c46_aimDir = 1;
  toast('press E in the green');
}

function ch46Throw() {
  var d = Math.abs((G.flags.c46_aimPos || 0) - CH46.aimAt);
  var q = d < 0.06 ? 'perfect' : d < CH46.aimWide ? 'good' : 'wild';
  G.flags.c46_aim = 0;
  G.flags.c46_thrown = 1;
  G.perform = false;
  saveGame();
  FX.burst(G.px + 6, G.py - 18, '#6aa050', 12, { speed: 60, life: 0.5, lift: 20 });
  SFX.blip(q === 'perfect' ? 900 : 640, 0.08);
  var line = q === 'perfect'
    ? 'The asparagus left his hand at a speed that impressed everyone present, which was two people and a can.'
    : q === 'good'
      ? 'The asparagus left his hand at a respectable speed and a slight wobble.'
      : 'The asparagus left his hand at an ambitious angle that was going to miss anyway.';
  say([
    { who: 'narrator', text: line },
    { who: 'narrator', text: 'It stopped mid air. Frozen. Perfectly still, six inches from the label.' },
    { who: 'bucktooth', text: 'It is not moving. I have seen many things not move. This is the worst one.' },
    { who: 'narrator', text: 'The voice from the sky returned, sounding even more smug: "Nuh-uh, child."' },
    { who: 'narrator', text: 'FLASH.' }
  ], function () {
    G.flash = 1;
    G.shake = 1;
    SFX.tone(60, 0.6, 'sawtooth', 0.09);
    setTimeout(function () {
      if (G.level === 'ch46') ch46ResetLoop();
    }, 520);
  });
}

function ch46Reveal() {
  if (G.flags.c46_reveal) return;
  G.flags.c46_reveal = 1;
  G.flags.c46_canSing = 0;
  G.flags.c46_singCharge = 0;
  G.flags.c46_t = CH46.LOOP;
  G.flags.seen_vecna46 = 1;
  buildScene('c46_house');
  G.flash = 0.6;
  SFX.tone(220, 0.3, 'sine', 0.06);
  SFX.tone(110, 0.5, 'triangle', 0.05);
  say([
    { who: 'narrator', text: 'Bucktooth began to hum. Then he began to sing Kate Bush again. As he sang, his voice began to distort, becoming deeper and more... squelchy.' },
    { who: 'bucktooth', text: 'Maverick... look at the... vines... look at the... clock...' },
    { who: 'maverick', text: 'Professor?' },
    { who: 'bucktooth', text: 'AHA! I see through the structural illusion! It was not a Cheese Master! It was VECNA!' },
    { who: 'bucktooth', text: 'He used his mind powers to create a fake loop so we would be too distracted to notice him stealing the Extra Sharp White Cheddar from your fridge!' },
    { who: 'narrator', text: 'Mav looked toward the kitchen. There was Vecna, still wearing the Willie Jenkins Cowboy Head, trying to cram a three pound block of cheese into his fleshy face vines.' },
    { who: 'maverick', text: 'YOU STEALER!' },
    { who: 'narrator', text: 'Vecna froze, the cowboy head tilting to the side. "Curses. I almost had the perfect dairy heist. And I would have gotten away with it if you did not have such a high affinity for Kate Bush\'s discography."' },
    { who: 'bucktooth', text: 'GET HIM!' }
  ], function () {
    G.flags.c46_chase = 1;
    G.flags.c46_tags = 0;
    toast('catch the cowboy lich');
  });
}

function ch46Tag(v) {
  G.flags.c46_tags = (G.flags.c46_tags || 0) + 1;
  G.flags.c46_tagCd = G.time + 1.2;
  G.shake = 0.4;
  FX.burst(v.px, v.py - 24, '#f0c060', 16, { speed: 80, life: 0.6, lift: 40 });
  SFX.blip(520, 0.08);
  if (G.flags.c46_tags >= 3) {
    ch46Ending();
    return;
  }
  var line = G.flags.c46_tags === 1
    ? 'Mav grabbed a fistful of robe. Vecna slipped out of it like a wet noodle and kept running.'
    : 'Bucktooth sank his felt teeth into a vine. Vecna shrieked, "The head! Mind the cowboy head! It is a rental!"';
  say([{ who: 'narrator', text: line }], function () {
    var s = ch46FarFromPlayer([[58, 100], [442, 100], [66, 242], [438, 242]]);
    var v2 = ch46Ent('vecna46');
    if (v2) {
      v2.px = s[0];
      v2.py = s[1];
      FX.burst(v2.px, v2.py - 20, '#c8e07a', 12, { speed: 60, life: 0.5, lift: 30 });
    }
  });
}

function ch46Ending() {
  if (G.flags.c46_done) return;
  G.flags.c46_done = 1;
  G.flags.c46_chase = 0;
  G.perform = false;
  var n = G.flags.c46_loop || 1;
  var score = n <= 3 ? 100 : n === 4 ? 70 : 40;
  say([
    { who: 'narrator', text: 'Mav, the Professor, and a laughing Taffy Stamburger chased the Cowboy-Lich around the house.' },
    { who: 'narrator', text: 'Vecna sprinted away, his vines flapping and the cowboy head bobbing. They all burst into a big, hearty laugh at the sheer absurdity of the cheese based mind games.' },
    { who: 'bucktooth', text: 'GIVE US THE CHEDDAR, YOU INTERDIMENSIONAL NIBBLER!' },
    { who: 'narrator', text: 'They vanished into the garden. The cheese did not.' }
  ], function () {
    cleared(46, score, 'vecna caught, loop ' + n);
  });
}

// -------------------------------------------------------------------- tick

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch46' || G.flags.c46_done) return;

  // the loop clock. it keeps running while you aim, so a bad throw cannot
  // leave you standing in the park forever
  if (!G.flags.c46_reveal) {
    if (G.flags.c46_t === undefined) G.flags.c46_t = CH46.LOOP;
    G.flags.c46_t -= dt;
    if (G.flags.c46_t <= 0) {
      G.flags.c46_t = 0;
      ch46ResetLoop();
    }
  }

  // the throw bar
  if (G.flags.c46_aim) {
    var p = (G.flags.c46_aimPos || 0) + (G.flags.c46_aimDir || 1) * dt * CH46.throwSpeed;
    if (p >= 1) { p = 1; G.flags.c46_aimDir = -1; }
    if (p <= 0) { p = 0; G.flags.c46_aimDir = 1; }
    G.flags.c46_aimPos = p;
  }

  // holding the note
  if (G.flags.c46_canSing && !G.flags.c46_reveal && G.sceneId === 'c46_house') {
    var holding = keys['e'] || keys[' '] || touch.act;
    var before = G.flags.c46_singCharge || 0;
    if (holding) {
      G.flags.c46_singCharge = Math.min(1, before + dt / 1.7);
      if (Math.floor(G.flags.c46_singCharge * 10) > Math.floor(before * 10)) {
        SFX.blip(340 + G.flags.c46_singCharge * 520, 0.06);
      }
      if (G.flags.c46_singCharge >= 1) ch46Reveal();
    } else if (before > 0.02) {
      G.flags.c46_singCharge = 0;
      SFX.blip(170, 0.12);
      toast('hold E. all the way. it is Kate Bush.');
    }
  }

  // the chase
  if (G.flags.c46_chase && G.sceneId === 'c46_house') {
    var v = ch46Ent('vecna46');
    if (!v) return;
    var dx = v.px - G.px, dy = v.py - G.py;
    var d = Math.hypot(dx, dy) || 1;
    v.px = clamp(v.px + (dx / d) * 46 * dt, 40, 472);
    v.py = clamp(v.py + (dy / d) * 46 * dt, 84, 252);
    if (Math.abs(dx) > Math.abs(dy)) v.dir = dx > 0 ? 'right' : 'left';
    else v.dir = dy > 0 ? 'down' : 'up';
    if (d < 20 && G.time > (G.flags.c46_tagCd || 0)) ch46Tag(v);
  }
});

// ------------------------------------------------------------------ action

ACTION_HOOKS.push(function () {
  if (G.level !== 'ch46' || RESULT.active) return false;
  if (G.flags.c46_aim) {
    ch46Throw();
    return true;
  }
  if (G.sceneId === 'c46_house' && G.flags.c46_canSing && !G.flags.c46_reveal) {
    var b = ch46Ent('buck46h');
    if (b && Math.hypot(b.px - G.px, b.py - G.py) < 72) {
      if (!G.flags.c46_singCharge) G.flags.c46_singCharge = 0.01;
      return true;
    }
  }
  return false;
});

// --------------------------------------------------------------------- hud

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch46' || G.flags.c46_done) return;

  // once the illusion is broken the clock is just a prop, so say so
  if (G.flags.c46_reveal) {
    var rbw = 150, rbx = W - rbw - 10, rby = 21;
    c.fillStyle = 'rgba(18,16,28,0.80)';
    c.fillRect(rbx - 4, rby - 1, rbw + 8, 26);
    c.font = 'bold 9px monospace';
    c.textAlign = 'center';
    c.fillStyle = '#9be08a';
    c.fillText('LOOP BROKEN', rbx + rbw / 2, rby + 10);
    c.font = '5px monospace';
    c.fillStyle = 'rgba(240,224,180,0.55)';
    c.fillText('THE SKY STOPPED COUNTING', rbx + rbw / 2, rby + 19);
    c.textAlign = 'left';
    return;
  }

  // the loop meter, top right, because the sky is counting
  var bw = 150, bx = W - bw - 10, by = 32;
  var t = G.flags.c46_t === undefined ? CH46.LOOP : G.flags.c46_t;
  var f = clamp(t / CH46.LOOP, 0, 1);
  c.fillStyle = 'rgba(18,16,28,0.80)';
  c.fillRect(bx - 4, by - 11, bw + 8, 26);
  c.fillStyle = '#2a2438';
  c.fillRect(bx, by, bw, 6);
  c.fillStyle = t < 12 ? '#e8605a' : '#e8c060';
  c.fillRect(bx, by, bw * f, 6);
  c.strokeStyle = 'rgba(244,228,192,0.45)';
  c.lineWidth = 1;
  c.strokeRect(bx + 0.5, by + 0.5, bw - 1, 5);
  c.font = 'bold 7px monospace';
  c.textAlign = 'left';
  c.fillStyle = t < 12 ? '#ff9a90' : '#f0e4c8';
  c.fillText('LOOP ' + (G.flags.c46_loop || 1), bx, by - 3);
  c.textAlign = 'right';
  c.fillStyle = 'rgba(240,224,180,0.75)';
  c.fillText(Math.ceil(t) + 's', bx + bw, by - 3);
  c.textAlign = 'center';
  c.font = '5px monospace';
  c.fillStyle = 'rgba(240,224,180,0.45)';
  c.fillText('THE SKY IS COUNTING', bx + bw / 2, by + 12);
  c.textAlign = 'left';

  // the throw bar
  if (G.flags.c46_aim && !DLG.active) {
    var aw = 190, ax = (W - aw) / 2, ay = H - 36;
    c.fillStyle = 'rgba(18,16,28,0.88)';
    c.fillRect(ax - 5, ay - 14, aw + 10, 30);
    c.fillStyle = '#2a2438';
    c.fillRect(ax, ay, aw, 8);
    var zx = ax + (CH46.aimAt - CH46.aimWide) * aw;
    c.fillStyle = 'rgba(120,200,140,0.55)';
    c.fillRect(zx, ay, CH46.aimWide * 2 * aw, 8);
    c.fillStyle = 'rgba(120,200,140,0.90)';
    c.fillRect(zx, ay, CH46.aimWide * 2 * aw, 1);
    var nx = ax + (G.flags.c46_aimPos || 0) * aw;
    c.fillStyle = '#fff3c4';
    c.fillRect(nx - 1, ay - 3, 3, 14);
    c.font = 'bold 7px monospace';
    c.textAlign = 'center';
    c.fillStyle = '#f0e4c8';
    c.fillText('THROW THE ASPARAGUS (E)', W / 2, ay - 6);
    c.textAlign = 'left';
  }

  // the Kate Bush meter
  var sing = G.flags.c46_singCharge || 0;
  if (G.flags.c46_canSing && !G.flags.c46_reveal && !DLG.active) {
    var sw = 190, sx = (W - sw) / 2, sy = H - 36;
    c.fillStyle = 'rgba(18,16,28,0.88)';
    c.fillRect(sx - 5, sy - 14, sw + 10, 30);
    c.fillStyle = '#2a2438';
    c.fillRect(sx, sy, sw, 8);
    c.fillStyle = sing >= 1 ? '#fff6c0' : '#c86ad0';
    c.fillRect(sx, sy, sw * sing, 8);
    c.strokeStyle = 'rgba(244,228,192,0.5)';
    c.strokeRect(sx + 0.5, sy + 0.5, sw - 1, 7);
    c.font = 'bold 7px monospace';
    c.textAlign = 'center';
    c.fillStyle = sing >= 1 ? '#fff6c0' : '#d8d0c0';
    c.fillText('KATE BUSH, HOLD E', W / 2, sy - 6);
    c.textAlign = 'left';
  }
});

// ----------------------------------------------------------------- chapter

function ch46ResetFlags() {
  G.flags.c46_loop = 1;
  G.flags.c46_t = CH46.LOOP;
  G.flags.c46_met = 0;
  G.flags.c46_knowsFountain = 0;
  G.flags.c46_wine = 0;
  G.flags.c46_foil = 0;
  G.flags.c46_chant = 0;
  G.flags.c46_thrown = 0;
  G.flags.c46_canSing = 0;
  G.flags.c46_singCharge = 0;
  G.flags.c46_aim = 0;
  G.flags.c46_aimPos = 0;
  G.flags.c46_reveal = 0;
  G.flags.c46_chase = 0;
  G.flags.c46_done = 0;
  G.flags.c46_tags = 0;
  G.flags.c46_resetCd = 0;
  G.flags.c46_tagCd = 0;
  G.flags.c46_drone = 0;
  G.flags.seen_taffy46 = 0;
  G.flags.seen_vecna46 = 0;
  for (var i = 1; i <= 8; i++) G.flags['seen_mouse' + i] = 0;
}

function ch46Intro() {
  chapterCard('CHAPTER FORTY SIX', 'The Legend of the Cheese Master', 3.4);
  setTimeout(function () {
    if (G.level !== 'ch46') return;
    ch46ResetFlags();
    say([
      { who: 'narrator', text: 'Maverick woke up on his bedroom floor, his head resting on a stack of empty Ritz cracker boxes.' },
      { who: 'narrator', text: 'The Professor Bucktooth doll was face-down in a pile of laundry, looking particularly un-foundational.' },
      { who: 'bucktooth', text: 'Maverick! We have survived the sorbet of the void!' },
      { who: 'narrator', text: '[Talk to Professor Bucktooth.]' }
    ]);
  }, 1100);
}

CHAPTER_CONTENT[46] = {
  start: 'c46_room',

  intro: function () {
    ch46Intro();
  },

  resume: function () {
    G.flags.c46_aim = 0;
    G.flags.c46_aimPos = 0;
    G.flags.c46_singCharge = 0;
    G.flags.c46_canSing = 0;
    G.flags.c46_resetCd = 0;
    G.perform = false;
    if (!G.flags.c46_t) G.flags.c46_t = CH46.LOOP;
    if (G.flags.c46_done) {
      // a finished save should start the joke again, not sit on the results card
      ch46ResetFlags();
      loadScene('c46_room', SCENES.c46_room.spawn.tx, SCENES.c46_room.spawn.ty, 'up');
      ch46Intro();
    }
  },

  objective: function () {
    if (G.flags.c46_done) return '';
    if (G.sceneId === 'c46_room') {
      if (!G.flags.c46_knowsFountain) return 'objective: work out where everyone went';
      if (!G.flags.c46_wine) return 'objective: the kitchen has answers (west door)';
      if (!G.flags.c46_thrown) return 'objective: the park fountain (east)';
      if (!G.flags.c46_reveal) return 'objective: the kitchen. sing Kate Bush.';
      return 'objective: catch Vecna';
    }
    if (G.sceneId === 'c46_street') {
      if (!G.flags.c46_knowsFountain) return 'objective: follow the empty street east to the park';
      if (!G.flags.c46_wine) return 'objective: go home, the kitchen has answers';
      if (!G.flags.c46_thrown) return 'objective: the park fountain';
      return 'objective: go home and sing';
    }
    if (G.sceneId === 'c46_park') {
      if (!G.flags.c46_knowsFountain) return 'objective: look at the fountain';
      if (!G.flags.c46_wine) return 'objective: we need a plan. the kitchen.';
      if (!G.flags.c46_thrown) return 'objective: throw the asparagus at the can';
      return 'objective: go home and sing';
    }
    if (G.sceneId === 'c46_house') {
      if (!G.flags.c46_wine) return G.flags.c46_foil ? 'objective: chant the Curd, then knock over the wine' : 'objective: find the foil (kitchen drawer)';
      if (!G.flags.c46_thrown) return 'objective: follow the mice to the fountain';
      if (!G.flags.c46_reveal) return G.flags.c46_canSing ? 'objective: hold E near Bucktooth and sing' : 'objective: talk to Bucktooth';
      return 'objective: catch Vecna';
    }
    return '';
  }
};
