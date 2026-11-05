// ch05.js - Chapter 5: Mav and the Beaver's Secret Life
//
// Living room, curb, the Log Jam, then Arby's at night, where the mechanic is
// the only solution Bucktooth has ever had: sing at the robbers until they
// cannot take it any more.
//
//   p_living       the couch, the blanket that is Mum
//   p_curb         the cherry red Mustang
//   p_club         the Log Jam, and the rap
//   p_arbys_night  six squirrels and a song

BEDROOM_SCENES.p_living = 1;      // share the bedroom's floor and wallpaper art
ARBYS_SCENES.p_arbys_night = 1;   // share the restaurant art

NAMES.mom = 'MUM';
NAMES.lead_squirrel = 'LEAD SQUIRREL';

// ------------------------------------------------------------------ living

SCENES.p_living = {
  title: 'HOME, BRIEFLY',
  spawn: { tx: 16, ty: 14, dir: 'up' },
  camZoom: 1,
  fill: 'livingCarpet',
  rects: [
    { x: 0, y: 0, w: 32, h: 7, t: 'livingWall' },
    { x: 0, y: 0, w: 1, h: 18, t: 'livingWall' },
    { x: 31, y: 0, w: 1, h: 18, t: 'livingWall' },
    { x: 0, y: 17, w: 32, h: 1, t: 'livingWall' }
  ],
  solidKinds: ['livingWall'],
  entities: [
    { id: 'couch', who: null, tx: 16, ty: 10, kind: 'livingCouch', solid: true, sw: 6, sh: 2, propScale: 1, reach: 64, talk: 'ch5Mom' },
    { id: 'teevee', who: null, tx: 16, ty: 4, kind: 'livingTeevee', solid: true, sw: 3, sh: 1, propScale: 1 },
    { id: 'window5', who: null, tx: 6, ty: 5, kind: 'livingWindow', noSolid: true, propScale: 1 },
    { id: 'picture5', who: null, tx: 25, ty: 4, kind: 'livingPicture', noSolid: true, propScale: 1 },
    { id: 'lamp5', who: null, tx: 28, ty: 9, kind: 'livingLamp', solid: true, propScale: 1 },
    { id: 'plant5', who: null, tx: 3, ty: 9, kind: 'livingPlant', solid: true, propScale: 1 },
    { id: 'coffee5', who: null, tx: 16, ty: 12, kind: 'livingTable', solid: true, sw: 4, sh: 1, propScale: 1 },
    { id: 'exit_curb', exit: { to: 'p_curb', tx: 16, ty: 9, dir: 'down' }, tx: 16, ty: 16, rect: { w: 2, h: 1 } }
  ],
  overlay: function (c) {
    // a big patterned rug in front of the couch, so the floor is not a void
    var rx = 168, ry = 178, rw = 176, rh = 78;
    c.fillStyle = '#6b3f4a';
    c.fillRect(rx, ry, rw, rh);
    c.fillStyle = '#7d4c58';
    c.fillRect(rx + 3, ry + 3, rw - 6, rh - 6);
    c.fillStyle = '#a06570';
    c.fillRect(rx + 7, ry + 7, rw - 14, rh - 14);
    c.fillStyle = '#8a5560';
    c.fillRect(rx + 10, ry + 10, rw - 20, rh - 20);
    for (var i = 0; i < 7; i++) {
      c.fillStyle = 'rgba(232,214,190,0.30)';
      c.fillRect(rx + 18 + i * 21, ry + 20, 3, rh - 40);
    }
    c.fillStyle = 'rgba(232,214,190,0.22)';
    c.fillRect(rx + 7, ry + rh / 2 - 2, rw - 14, 3);
    var g = c.createRadialGradient(W / 2, 40, 20, W / 2, 120, 300);
    g.addColorStop(0, 'rgba(255,226,170,0.16)');
    g.addColorStop(1, 'rgba(20,14,8,0.22)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
};

// -------------------------------------------------------------------- curb

SCENES.p_curb = {
  title: 'THE CURB',
  spawn: { tx: 16, ty: 9, dir: 'down' },
  camZoom: 1,
  fill: 'grass',
  rects: [
    { x: 0, y: 0, w: 32, h: 1, t: 'tree' },
    { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 0, y: 17, w: 32, h: 1, t: 'cobble' },
    { x: 1, y: 12, w: 30, h: 2, t: 'cobble' },
    { x: 1, y: 14, w: 30, h: 3, t: 'bed' },
    { x: 4, y: 2, w: 6, h: 2, t: 'roof' },
    { x: 4, y: 4, w: 6, h: 3, t: 'house' },
    { x: 22, y: 2, w: 6, h: 2, t: 'roof' },
    { x: 22, y: 4, w: 6, h: 3, t: 'house' },
    { x: 14, y: 9, w: 4, h: 2, t: 'path' }
  ],
  solidKinds: ['tree', 'house', 'roof'],
  entities: [
    { id: 'mustang', who: null, tx: 16, ty: 13, kind: 'mustang', solid: true, sw: 4, sh: 2, propScale: 1, reach: 80, talk: 'ch5Car' },
    { id: 'buck5', who: 'bucktooth', tx: 12, ty: 13, dir: 'right', reach: 60, talk: 'ch5Car' },
    { id: 'mailbox5', who: 'sign', tx: 8, ty: 10, kind: 'sign', talk: 'ch5Mail' },
    { id: 'exit_home', exit: { to: 'p_living', tx: 16, ty: 15, dir: 'up' }, tx: 16, ty: 0, rect: { w: 2, h: 1 } }
  ]
};

// -------------------------------------------------------------------- club

SCENES.p_club = {
  title: 'THE LOG JAM',
  spawn: { tx: 16, ty: 11, dir: 'up' },
  camZoom: 1,
  fill: 'clubFloor',
  rects: [
    { x: 0, y: 0, w: 32, h: 4, t: 'clubWall' },
    { x: 0, y: 4, w: 1, h: 14, t: 'clubWall' },
    { x: 31, y: 4, w: 1, h: 14, t: 'clubWall' },
    { x: 8, y: 8, w: 16, h: 3, t: 'stage' },
    { x: 0, y: 17, w: 32, h: 1, t: 'clubWall' }
  ],
  solidKinds: ['clubWall', 'stage'],
  entities: [
    { id: 'buck5c', who: 'bucktooth', tx: 16, ty: 9, dir: 'down', reach: 60, talk: 'ch5Stage' },
    { id: 'mic', who: null, tx: 13, ty: 9, kind: 'micStand', noSolid: true, propScale: 1 },
    { id: 'jamSign', who: null, tx: 16, ty: 6, kind: 'clubSign', noSolid: true, propScale: 1 },
    { id: 'crowd1', who: 'taffy', tx: 6, ty: 12, dir: 'up', small: true },
    { id: 'crowd2', who: 'whiskey', tx: 10, ty: 12, dir: 'up', small: true },
    { id: 'crowd3', who: 'buckley', tx: 14, ty: 12, dir: 'up', small: true },
    { id: 'crowd4', who: 'nibbles', tx: 18, ty: 12, dir: 'up', small: true },
    { id: 'crowd5', who: 'kevin', tx: 22, ty: 12, dir: 'up', small: true },
    { id: 'crowd6', who: 'nutkin', tx: 25, ty: 12, dir: 'up', small: true },
    { id: 'crowd7', who: 'adrian', tx: 9, ty: 15, dir: 'up', small: true },
    { id: 'crowd8', who: 'clerk', tx: 23, ty: 15, dir: 'up', small: true },
    { id: 'exit_club', exit: { to: 'p_arbys_night', tx: 16, ty: 15, dir: 'up' }, tx: 0, ty: 15, rect: { w: 1, h: 2 } }
  ],
  overlay: function (c) {
    // a spotlight over the stage and a dark room around it
    var g = c.createRadialGradient(W / 2, 110, 10, W / 2, 110, 210);
    g.addColorStop(0, 'rgba(255,234,180,0.22)');
    g.addColorStop(0.55, 'rgba(120,90,160,0.10)');
    g.addColorStop(1, 'rgba(8,6,14,0.55)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
};

// --------------------------------------------------------------- arbys, late

SCENES.p_arbys_night = {
  title: "ARBY'S, AFTER HOURS",
  spawn: { tx: 16, ty: 13, dir: 'up' },
  camZoom: 1,
  fill: 'linoleum',
  rects: [
    { x: 0, y: 0, w: 32, h: 4, t: 'wall' },
    { x: 0, y: 4, w: 1, h: 6, t: 'wall' },
    { x: 0, y: 12, w: 1, h: 5, t: 'wall' },
    { x: 31, y: 4, w: 1, h: 13, t: 'wall' },
    { x: 0, y: 17, w: 32, h: 1, t: 'wall' },
    { x: 8, y: 3, w: 15, h: 1, t: 'wall' },
    { x: 5, y: 7, w: 22, h: 2, t: 'counter' },
    { x: 3, y: 12, w: 5, h: 1, t: 'booth' },
    { x: 3, y: 14, w: 5, h: 1, t: 'booth' },
    { x: 24, y: 12, w: 5, h: 1, t: 'booth' },
    { x: 24, y: 14, w: 5, h: 1, t: 'booth' },
    { x: 5, y: 13, w: 1, h: 1, t: 'table' },
    { x: 26, y: 13, w: 1, h: 1, t: 'table' }
  ],
  solidKinds: ['wall', 'counter', 'booth', 'table', 'menu'],
  entities: [
    { id: 'clerkN', who: 'arbys_clerk', tx: 16, ty: 6, dir: 'down', reach: 54, talk: 'ch5ClerkN' },
    { id: 'menuN', who: null, tx: 16, ty: 3, kind: 'menuBoard', noSolid: true, propScale: 1 },
    { id: 'regN', who: null, tx: 19, ty: 7, kind: 'register', noSolid: true, propScale: 1 },
    { id: 'trayN', who: null, tx: 13, ty: 7, kind: 'tray', noSolid: true, propScale: 1 },
    { id: 'buck5n', who: 'bucktooth', tx: 20, ty: 10, dir: 'left', reach: 56, talk: 'ch5Sing' },
    { id: 'matN', who: null, tx: 1, ty: 10, kind: 'mat', noSolid: true, propScale: 1 },
    { id: 'sq1', who: 'squirrel_robber', tx: 5, ty: 9, dir: 'down', hidden: true, pace: 9 },
    { id: 'sq2', who: 'squirrel_robber', tx: 9, ty: 10, dir: 'down', hidden: true },
    { id: 'sq3', who: 'squirrel_robber', tx: 24, ty: 9, dir: 'down', hidden: true, pace: 7 },
    { id: 'sq4', who: 'squirrel_robber', tx: 27, ty: 10, dir: 'down', hidden: true },
    { id: 'sq5', who: 'squirrel_robber', tx: 12, ty: 13, dir: 'up', hidden: true },
    { id: 'sq6', who: 'squirrel_robber', tx: 21, ty: 13, dir: 'up', hidden: true },
    { id: 'sqLead', who: 'squirrel_robber', tx: 16, ty: 10, dir: 'down', hidden: true, talk: 'ch5Lead' }
  ],
  overlay: function (c) {
    // after hours: the room is dark, lit by the counter strip and the car park
    c.fillStyle = 'rgba(8,10,24,0.52)';
    c.fillRect(0, 0, W, H);
    // warm wash over the counter and the menu board
    var g2 = c.createRadialGradient(W / 2, 150, 20, W / 2, 150, 190);
    g2.addColorStop(0, 'rgba(255,226,170,0.20)');
    g2.addColorStop(0.55, 'rgba(255,210,150,0.07)');
    g2.addColorStop(1, 'rgba(255,200,140,0)');
    c.fillStyle = g2;
    c.fillRect(0, 40, W, 200);
    // the car park lights through the front window, cold and blue
    var g3 = c.createRadialGradient(60, 210, 10, 60, 210, 120);
    g3.addColorStop(0, 'rgba(150,190,255,0.16)');
    g3.addColorStop(1, 'rgba(150,190,255,0)');
    c.fillStyle = g3;
    c.fillRect(0, 110, 220, 180);
    // corners into shadow
    var vg = c.createRadialGradient(W / 2, H * 0.5, H * 0.28, W / 2, H * 0.5, H * 0.85);
    vg.addColorStop(0, 'rgba(4,6,16,0)');
    vg.addColorStop(1, 'rgba(4,6,16,0.55)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
  }
};

// -------------------------------------------------------------------- props

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (k !== 'livingCouch' && k !== 'livingTeevee' && k !== 'livingLamp' && k !== 'livingPlant' &&
      k !== 'livingWindow' && k !== 'livingPicture' && k !== 'livingTable' &&
      k !== 'mustang' && k !== 'micStand' && k !== 'clubSign') {
    if (k !== 'clubFloor' && k !== 'clubWall' && k !== 'stage') return false;
  }
  var P = propPainter(c, e);

  if (k === 'livingCouch') {
    // a fat two seater, seen from the front, with Mum asleep under it
    P(-50, -3, 100, 5, 'rgba(0,0,0,0.22)');
    P(-48, -12, 96, 10, '#4a3a2a');              // plinth
    P(-48, -13, 96, 2, '#5a4834');
    // back
    P(-48, -46, 96, 22, '#6a4a3a');
    P(-46, -44, 92, 18, '#7d5946');
    for (var bq = 0; bq < 4; bq++) {             // button tufting
      P(-38 + bq * 22, -40, 3, 3, '#654434');
      P(-34 + bq * 22, -33, 3, 3, '#654434');
    }
    // seat
    P(-46, -27, 92, 16, '#5e4133');
    P(-44, -25, 44, 13, '#7d5946');              // left cushion
    P(2, -25, 44, 13, '#7d5946');                // right cushion
    P(-44, -25, 44, 2, '#8f6a54');
    P(2, -25, 44, 2, '#8f6a54');
    // arms
    P(-50, -40, 12, 30, '#6a4a3a');
    P(-50, -40, 12, 3, '#856049');
    P(40, -40, 12, 30, '#6a4a3a');
    P(40, -40, 12, 3, '#856049');
    P(-48, -2, 10, 2, '#3a2c20');                // feet
    P(38, -2, 10, 2, '#3a2c20');
    // Mum: the good blanket is a person shaped lump
    P(-40, -34, 46, 20, '#8f2f3a');
    P(-40, -40, 20, 10, '#a83a46');              // shoulder
    P(-9, -38, 15, 12, '#a83a46');               // knees
    P(-36, -30, 34, 3, '#b8484f');
    P(-40, -22, 46, 3, '#7a2530');
    // a tuft of hair and the magazine over her face
    P(-36, -46, 13, 7, '#5a4230');
    P(-37, -44, 15, 3, '#6d5138');
    P(-30, -38, 14, 8, '#f0e8d4');
    P(-28, -36, 10, 2, '#9a927c');
    P(-28, -33, 7, 1, '#9a927c');
    return true;
  }

  if (k === 'livingTeevee') {
    // a woodgrain CRT on a stand, facing the couch
    P(-24, -2, 48, 4, 'rgba(0,0,0,0.20)');
    P(-22, -20, 44, 18, '#5a3f28');              // stand
    P(-20, -18, 40, 3, '#6d4d31');
    P(-19, -8, 38, 6, '#4a3220');
    P(-16, -12, 4, 4, '#3a2618');                // knobs
    P(-10, -12, 4, 4, '#3a2618');
    P(-24, -44, 48, 26, '#2a2622');              // bezel
    P(-22, -42, 44, 22, '#3a3530');
    P(-18, -40, 36, 17, '#2b3a4a');              // glass
    P(-18, -40, 36, 6, '#3f5870');
    P(-14, -36, 12, 6, '#7fa8c8');               // whatever is on
    P(-4, -40, 3, 17, 'rgba(255,255,255,0.06)');
    P(-20, -46, 2, 6, '#8a8a92');                // antennae
    P(-14, -50, 2, 8, '#8a8a92');
    P(-26, -24, 52, 3, 'rgba(120,190,255,0.16)');
    return true;
  }

  if (k === 'livingWindow') {
    // night out the front window, curtains drawn back
    P(-26, -34, 52, 34, '#f2efe4');
    P(-23, -31, 46, 28, '#20304a');
    P(-23, -31, 46, 10, '#2c4566');
    P(-17, -26, 2, 2, '#e8e4f0');                // stars
    P(-4, -29, 2, 2, '#e8e4f0');
    P(8, -24, 2, 2, '#e8e4f0');
    P(14, -14, 8, 8, '#d8e0f0');                 // moon
    P(15, -13, 6, 6, '#f0f4ff');
    P(-1, -31, 2, 28, '#f2efe4');                // mullions
    P(-23, -18, 46, 2, '#f2efe4');
    P(-26, -2, 52, 4, '#e6e0d0');                // sill
    P(-34, -34, 10, 34, '#a8434e');              // curtains
    P(-34, -34, 10, 3, '#bf5560');
    P(24, -34, 10, 34, '#a8434e');
    P(24, -34, 10, 3, '#bf5560');
    return true;
  }

  if (k === 'livingPicture') {
    P(-14, -26, 28, 22, '#7a5a3a');
    P(-12, -24, 24, 18, '#9ac4dc');
    P(-12, -14, 24, 8, '#6a9a5a');
    P(-12, -10, 24, 4, '#4a7a45');
    P(-7, -20, 6, 4, '#f0e8a0');
    return true;
  }

  if (k === 'livingTable') {
    P(-34, -4, 68, 4, 'rgba(0,0,0,0.18)');
    P(-34, -16, 68, 12, '#6a4630');              // top
    P(-32, -14, 64, 9, '#8a5e40');
    P(-32, -14, 64, 2, '#a07450');
    P(-30, -4, 4, 6, '#5a3a28');                 // legs
    P(26, -4, 4, 6, '#5a3a28');
    P(-16, -20, 8, 6, '#f0ece0');                // mug
    P(-15, -19, 6, 4, '#c8b8a0');
    P(4, -18, 16, 4, '#e8e2d0');                 // magazine
    P(6, -17, 12, 1, '#8a8270');
    return true;
  }

  if (k === 'livingLamp') {
    P(-12, -3, 24, 4, 'rgba(0,0,0,0.20)');
    P(-11, -6, 22, 5, '#4a3a2a');
    P(-2, -34, 4, 28, '#5a4632');
    P(-12, -46, 24, 13, '#e8d178');              // shade
    P(-10, -44, 20, 9, '#fff0a8');
    P(-12, -34, 24, 2, '#c8b060');
    return true;
  }

  if (k === 'livingPlant') {
    P(-12, -5, 24, 5, 'rgba(0,0,0,0.20)');
    P(-10, -16, 20, 11, '#9a6a44');              // pot
    P(-9, -15, 18, 3, '#b07d52');
    P(-12, -17, 24, 2, '#7d5334');
    P(-14, -38, 28, 21, '#2f5a34');              // fronds
    P(-8, -46, 16, 12, '#3a7040');
    P(-18, -32, 10, 8, '#356338');
    P(9, -34, 10, 9, '#356338');
    P(-4, -42, 3, 8, '#4a8a4a');
    P(6, -36, 2, 7, '#4a8a4a');
    return true;
  }

  if (k === 'mustang') {
    // a cherry red convertible from above, with the top down
    P(-46, -4, 92, 6, 'rgba(0,0,0,0.25)');
    P(-44, -34, 88, 30, '#8a1f1f');
    P(-42, -32, 84, 26, '#b02a2a');
    P(-40, -30, 80, 10, '#c83a3a');           // bonnet highlight
    P(-30, -20, 44, 16, '#2a1a1a');           // cabin
    P(-26, -18, 16, 12, '#3a2626');           // passenger seat
    P(-8, -18, 16, 12, '#3a2626');            // driver seat
    P(-30, -24, 44, 4, '#1f1414');            // dash
    P(-24, -16, 10, 6, '#4a3232');
    P(2, -16, 10, 6, '#4a3232');
    P(-44, -34, 88, 2, '#e05656');            // chrome trim
    P(-46, -30, 4, 10, '#d0d0d8');            // bumpers
    P(42, -30, 4, 10, '#d0d0d8');
    P(-38, -36, 12, 4, '#2a2a30');            // wheels
    P(26, -36, 12, 4, '#2a2a30');
    P(-38, -2, 12, 4, '#2a2a30');
    P(26, -2, 12, 4, '#2a2a30');
    P(-6, -30, 12, 2, '#f0e8d0');             // windscreen glint
    return true;
  }

  if (k === 'micStand') {
    P(-1, -20, 2, 20, '#8a8a96');
    P(-5, -2, 10, 2, '#5a5a66');
    P(-3, -24, 6, 6, '#cfcfd8');
    P(-2, -23, 4, 4, '#9aa0a8');
    return true;
  }

  if (k === 'clubSign') {
    // marquee with real lettering, plus bulbs down the sides
    P(-34, -20, 68, 20, '#141018');
    P(-32, -18, 64, 16, '#241a2c');
    P(-32, -18, 64, 1, 'rgba(255,220,150,0.35)');
    for (var bx2 = 0; bx2 < 9; bx2++) {
      P(-31 + bx2 * 7.6, -19, 2, 2, '#f0c060');
      P(-31 + bx2 * 7.6, -3, 2, 2, '#f0c060');
    }
    c.save();
    c.fillStyle = '#f6d98a';
    c.font = 'bold 9px monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('LOG JAM', e.px, e.py - 11);
    c.restore();
    P(-34, 0, 68, 2, '#0e0a12');
    return true;
  }
  return false;
});

// living room tiles
TILE_HOOKS.push(function (c, kind, tx, ty) {
  if (G.sceneId !== 'p_living') return false;
  var x = tx * TILE, y = ty * TILE, r = hash(tx, ty, 23);
  if (kind === 'livingWall') {
    c.fillStyle = r > 0.5 ? '#c8a888' : '#c3a284';
    c.fillRect(x, y, TILE, TILE);
    // faint stripes in the paper
    c.fillStyle = 'rgba(150,110,80,0.16)';
    for (var s = 0; s < 2; s++) c.fillRect(x + 3 + s * 8, y, 2, TILE);
    c.fillStyle = 'rgba(255,240,220,0.10)';
    c.fillRect(x, y, TILE, 1);
    if (ty === 0) {                       // cornice against the ceiling
      c.fillStyle = '#a8845f';
      c.fillRect(x, y, TILE, 3);
      c.fillStyle = '#e8dcc8';
      c.fillRect(x, y + 3, TILE, 2);
    }
    if (ty === 6) {                       // skirting board at the floor
      c.fillStyle = '#e8dcc8';
      c.fillRect(x, y + 9, TILE, 7);
      c.fillStyle = '#b8a488';
      c.fillRect(x, y + 9, TILE, 2);
      c.fillStyle = 'rgba(60,40,25,0.30)';
      c.fillRect(x, y + 15, TILE, 1);
    }
    return true;
  }
  if (kind === 'livingCarpet') {
    c.fillStyle = r > 0.55 ? '#8f7a60' : r > 0.3 ? '#8a755b' : '#947e64';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(255,235,205,0.07)';
    for (var i = 0; i < 4; i++) c.fillRect(x + 2 + i * 4, y + (i % 2 ? 3 : 9), 3, 1);
    c.fillStyle = 'rgba(50,35,20,0.08)';
    if (r > 0.8) c.fillRect(x + 5, y + 6, 5, 1);
    return true;
  }
  return false;
});

// club tiles
TILE_HOOKS.push(function (c, kind, tx, ty) {
  if (G.sceneId !== 'p_club') return false;
  var x = tx * TILE, y = ty * TILE, r = hash(tx, ty, 19);
  if (kind === 'clubFloor') {
    c.fillStyle = r > 0.5 ? '#241c30' : '#201828';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(120,90,160,0.10)';
    if (r > 0.7) c.fillRect(x + 3, y + 4, 6, 1);
    if (r < 0.2) c.fillRect(x + 8, y + 11, 4, 1);
    return true;
  }
  if (kind === 'clubWall') {
    c.fillStyle = '#191222';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = 'rgba(90,60,130,0.35)';
    for (var i = 0; i < 3; i++) c.fillRect(x + 2 + i * 5, y + 2, 1, TILE - 4);
    return true;
  }
  if (kind === 'stage') {
    c.fillStyle = '#3a2a4a';
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = '#4a3660';
    c.fillRect(x, y, TILE, 3);
    c.fillStyle = 'rgba(20,12,28,0.45)';
    c.fillRect(x, y + TILE - 2, TILE, 2);
    if (r > 0.6) { c.fillStyle = 'rgba(240,192,120,0.10)'; c.fillRect(x + 4, y + 5, 8, 2); }
    return true;
  }
  return false;
});

// ------------------------------------------------------------------ scripts

SCRIPT.ch5Mom = function () {
  say([
    { who: 'narrator', text: 'Mum is on the couch under the good blanket with a magazine over her face.' },
    { who: 'maverick', text: 'Mum! The beaver made me river dance until my legs felt like noodles, then he made me ring Mrs. Wallaby\'s doorbell and run away! He was talking about a squirrel with a drill and a HEIST!' },
    { who: 'narrator', text: 'From under the blanket, without moving: "Oh, that\'s nice, honey."' },
    { who: 'narrator', text: '"As long as you keep having these little adventures, I can finally get a solid nap. Wash the mud off the porch."' },
    { who: 'maverick', text: 'She just... kicked me out? Again?' },
    { who: 'narrator', text: '[The curb is out the front door, south.]' }
  ]);
};

SCRIPT.ch5Mail = function () {
  say([{ who: 'sign', text: 'MAVERICK + FAMILY. Please stop putting frogs in the mailbox. This means you, Professor.' }]);
};

SCRIPT.ch5Car = function () {
  if (G.flags.ch5_stage !== undefined) {
    say([{ who: 'bucktooth', text: 'Get in. The evening has a schedule and the schedule is mine.' }]);
    return;
  }
  G.flags.ch5_stage = 1;
  say([
    { who: 'narrator', text: 'A cherry red classic Mustang convertible pulls up to the curb with the engine doing a low, expensive growl.' },
    { who: 'bucktooth', text: 'Hop in, accomplice! We have an evening to fill!' },
    { who: 'maverick', text: 'A Mustang? Where did you even get a Mustang?' },
    { who: 'bucktooth', text: 'A gentleman does not discuss provenance. Now. The stick shift. The only way to truly connect with the machine.' },
    { who: 'maverick', text: 'Wait. You are teaching me to drive a getaway car. This is for the squirrel heist!', choices: [
      { label: 'I refuse to be the wheel-man for rodent larceny.', reply: [
        { who: 'bucktooth', text: 'You mistake my panache for criminality! You see a beaver in a sports car and you assume heist. That is prejudice.' },
        { who: 'maverick', text: 'You suggested grand larceny!' },
        { who: 'bucktooth', text: 'I suggested a NETWORKING OPPORTUNITY. Clutch. Gas. Shift.' }
      ] },
      { label: 'Fine. But I am not insured.', reply: [
        { who: 'bucktooth', text: 'You are insured by confidence. Now: clutch, gas, shift!' }
      ] }
    ] },
    { who: 'narrator', text: 'Mav stalled it twice. On the third try the car lurched forward and the whole street smelled like burnt ambition.' },
    { who: 'bucktooth', text: 'Adequate! Hold the wheel. I know a place.' }
  ], function () {
    G.toScene('p_club', 16, 12, 'up');
    setTimeout(ch5ClubArrival, 800);
  });
};

function ch5ClubArrival() {
  if (G.sceneId !== 'p_club') return;
  say([
    { who: 'narrator', text: 'They arrived in front of a giant glowing sign that read THE LOG JAM.' },
    { who: 'bucktooth', text: 'Wear this. We must maintain an air of mystery.' },
    { who: 'narrator', text: 'He handed Mav a silky fake handlebar moustache.' },
    { who: 'narrator', text: 'A crowd of beavers, raccoons and even a few stoats rushed the car, cameras flashing.' },
    { who: 'narrator', text: '"IT\'S PROFESSOR B-BUCK! THE BUCKTOOTH BANDIT! WE LOVE YOU!"' },
    { who: 'maverick', text: 'You are FAMOUS?' },
    { who: 'bucktooth', text: 'An unfortunate side effect of my artistry. I am headlining tonight. Prepare yourself for the structural poem of my sound.' },
    { who: 'narrator', text: '[Talk to Bucktooth on stage.]' }
  ]);
}

SCRIPT.ch5Stage = function () {
  if (G.flags.rapDone) {
    say([{ who: 'bucktooth', text: 'That was the best set of my career and I have had several careers.' }]);
    return;
  }
  say([
    { who: 'bucktooth', text: 'You are on stage with me. Do not panic. Panic is for people without a moustache.' },
    { who: 'bucktooth', text: 'When the beat drops, you just keep the crowd up. I will handle the words. The words are load bearing.' }
  ], function () { ch5Rap(); });
};

function ch5Rap() {
  G.flags.rapDone = true;
  saveGame();
  SFX.fanfare();
  FX.confetti(G.px, G.py - 12);
  say([
    { who: 'narrator', text: 'The beat dropped. Professor Bucktooth grabbed the mic.' },
    { who: 'bucktooth', text: '"Yo, check the foundation, my dams are straight-laced,"' },
    { who: 'bucktooth', text: '"But I spit fire faster than water is displaced."' },
    { who: 'bucktooth', text: '"If your mortar is weak, and your timber is warped,"' },
    { who: 'bucktooth', text: '"I\'m the only Professor whose flow can\'t be stopped!"' },
    { who: 'bucktooth', text: '"Tweed on the body, the log is the beat, I fix what you break, then I charge you some meat!"' },
    { who: 'narrator', text: 'The crowd went utterly wild. Somewhere a stoat fainted with joy.' },
    { who: 'bucktooth', text: 'And now, the afterparty. There is only one logical location.' },
    { who: 'maverick', text: 'Do not say Arby\'s.' },
    { who: 'bucktooth', text: 'Arby\'s.' }
  ], function () {
    G.toScene('p_arbys_night', 16, 13, 'up');
    setTimeout(ch5Stickup, 900);
  });
}

function ch5ClerkN() {
  say([{ who: 'arbys_clerk', text: 'We are technically closed. But you two have a vibe and I am not paid enough to argue with a vibe.' }]);
}

function ch5Stickup() {
  if (G.sceneId !== 'p_arbys_night') return;
  G.flags.seen_sq1 = true; G.flags.seen_sq2 = true; G.flags.seen_sq3 = true;
  G.flags.seen_sq4 = true; G.flags.seen_sq5 = true; G.flags.seen_sq6 = true;
  G.flags.seen_sqLead = true;
  buildScene('p_arbys_night');
  SFX.tone(90, 0.3, 'sawtooth', 0.08);
  say([
    { who: 'narrator', text: 'Just as the professor was ordering his fifth side of curly fries, the front door burst open.' },
    { who: 'narrator', text: 'Six squirrels in black ski masks stormed in, carrying tiny, cartoonishly large sacks.' },
    { who: 'lead_squirrel', text: 'This is a stickup! Look at the sign! The sign says VERY SERIOUS THREATS HERE!' },
    { who: 'narrator', text: 'They locked the door.' },
    { who: 'bucktooth', text: 'Maverick. There is only one solution to this particular crisis.' },
    { who: 'maverick', text: 'What is it? A distraction? A flare gun?' },
    { who: 'bucktooth', text: 'Worse. We must sing MEMORY, from the musical CATS.' },
    { who: 'maverick', text: 'You are the worst positive influence ever!' },
    { who: 'bucktooth', text: 'Just sing, boy! With feeling!' }
  ], function () {
    G.flags.ch5_sing = true;
    G.perform = true;
    G.flags.suffering = 0;
    G.flags.singAt = G.time;
    toast('hold up / down to match the pitch');
  });
}

SCRIPT.ch5Sing = function () {
  if (!G.flags.ch5_sing) {
    say([{ who: 'bucktooth', text: 'We are about to be robbed and you want to chat?' }]);
    return;
  }
  say([{ who: 'bucktooth', text: 'Keep it in the green. Think sad. Think theatrical. Think about your high notes.' }]);
};

SCRIPT.ch5Lead = function () {
  if (G.flags.ch5_sung) {
    say([{ who: 'lead_squirrel', text: 'We are leaving and we are never speaking of this.' }]);
    return;
  }
  say([{ who: 'lead_squirrel', text: 'Sing all you want. This sack is already full of threats.' }]);
};

// ---------------------------------------------------------------- karaoke

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch5' || !G.flags.ch5_sing || G.flags.ch5_sung) return;
  if (DLG.active) return;
  G.flags.pitchTarget = 0.5 + Math.sin(G.time * 0.75) * 0.32;
  var p = G.flags.pitch === undefined ? 0.5 : G.flags.pitch;
  if (keys['arrowup'] || keys['w']) p -= dt * 0.55;
  if (keys['arrowdown'] || keys['s']) p += dt * 0.55;
  p = Math.max(0, Math.min(1, p));
  G.flags.pitch = p;
  var d = Math.abs(p - G.flags.pitchTarget);
  if (d < 0.10) {
    var before = G.flags.suffering || 0;
    G.flags.suffering = Math.min(100, before + dt * 24);
    if ((G.flags.suffering | 0) % 20 === 0) SFX.blip(300 + p * 400, 0.05);
    // a little pop every quarter of the way, so the bar feels like progress
    var mark = Math.floor(G.flags.suffering / 25);
    if (mark > (G.flags.sungMark || 0) && mark > 0) {
      G.flags.sungMark = mark;
      FX.burst(G.px, G.py - 10, '#e8c0f0', 10, { speed: 50, life: 0.5, lift: 30 });
      FX.pop(G.px, G.py - 28, mark * 25 + '%', '#f0c060');
    }
  } else if (d > 0.25) {
    G.flags.suffering = Math.max(0, (G.flags.suffering || 0) - dt * 6);
  }
  if (G.flags.suffering >= 100) ch5Sung();
});

function ch5Sung() {
  G.flags.ch5_sung = true;
  G.flags.ch5_sing = false;
  G.perform = false;
  G.flags.singSecs = Math.max(1, G.time - (G.flags.singAt || G.time));
  saveGame();
  SFX.fanfare();
  G.flash = 0.4;
  say([
    { who: 'narrator', text: 'The squirrels stood frozen, twitching their noses. Somewhere in the back, a stoat covered its ears.' },
    { who: 'lead_squirrel', text: 'Stop! Stop! It is too painful! It is too... Mav, was that you?' },
    { who: 'lead_squirrel', text: 'Your high notes need serious practice, kid. This is not worth it. Let\'s go, boys.' },
    { who: 'narrator', text: 'They unlocked the door and scampered into the night, sacks and all.' },
    { who: 'bucktooth', text: 'The power of musical theatre triumphs over petty crime. As always.' },
    { who: 'narrator', text: 'Outside, the Mustang idled. Bucktooth thanked Mav, yelled a cheerful goodbye, and accelerated to eighty eight miles per hour.' },
    { who: 'narrator', text: 'There was a flash of light. The car, and the beaver, were simply not there any more.' },
    { who: 'maverick', text: '...Sure. Okay.' },
    { who: 'narrator', text: 'Mav stood on the pavement with a peeling moustache, and started walking home.' }
  ], function () {
    var secs = Math.round(G.flags.singSecs || 12);
    var score = Math.max(40, 100 - Math.max(0, secs - 8) * 7);
    cleared(5, score, 'squirrels gone in ' + secs + 's');
  });
}

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch5' || !G.flags.ch5_sing || G.flags.ch5_sung) return;
  // vertical pitch meter
  var bx = W - 44, by = 92, bh = 96;
  c.fillStyle = 'rgba(18,16,28,0.85)';
  c.fillRect(bx - 2, by - 2, 26, bh + 4);
  c.fillStyle = '#2a2438';
  c.fillRect(bx, by, 22, bh);
  // the target band
  var ty = by + (1 - G.flags.pitchTarget) * bh;
  c.fillStyle = 'rgba(120,200,140,0.55)';
  c.fillRect(bx, ty - 10, 22, 20);
  // your voice
  var py = by + (1 - (G.flags.pitch || 0.5)) * bh;
  c.fillStyle = '#fff3c4';
  c.fillRect(bx - 3, py - 1, 28, 3);
  c.strokeStyle = 'rgba(244,228,192,0.5)';
  c.lineWidth = 1;
  c.strokeRect(bx + 0.5, by + 0.5, 21, bh - 1);
  c.font = '6px monospace';
  c.fillStyle = 'rgba(240,224,180,0.8)';
  c.textAlign = 'center';
  c.fillText('PITCH', bx + 11, by - 6);
  c.textAlign = 'left';

  // the suffering meter
  var sw = 150, sx = (W - sw) / 2, sy = H - 26;
  c.fillStyle = 'rgba(18,16,28,0.85)';
  c.fillRect(sx - 3, sy - 3, sw + 6, 13);
  c.fillStyle = '#2a2438';
  c.fillRect(sx, sy, sw, 7);
  var f = Math.max(0, Math.min(1, (G.flags.suffering || 0) / 100));
  c.fillStyle = '#c86ad0';
  c.fillRect(sx, sy, sw * f, 7);
  c.font = 'bold 7px monospace';
  c.fillStyle = '#f4efe4';
  c.textAlign = 'center';
  c.fillText('SUFFERING', W / 2, sy - 6);
  c.textAlign = 'left';
});

// ------------------------------------------------------------------ chapter

CHAPTER_CONTENT[5] = {
  start: 'p_living',

  intro: function () {
    chapterCard('CHAPTER FIVE', "The Beaver's Secret Life", 3.2);
    setTimeout(function () {
      if (G.level !== 'ch5') return;
      G.flags.ch5_stage = undefined;
      G.flags.ch5_sing = false;
      G.flags.ch5_sung = false;
      G.flags.suffering = 0;
      G.perform = false;
      say([
        { who: 'narrator', text: 'Chapter five. In which Mav comes home to tell on a beaver and discovers that nobody is listening.' }
      ]);
    }, 900);
  },

  resume: function () {
    G.perform = false;
  },

  objective: function () {
    if (G.flags.ch5_sung) return '';
    if (G.flags.ch5_sing) return 'objective: hold up / down to match the pitch';
    if (G.sceneId === 'p_living') return G.flags.readMom ? 'objective: out the front door (south)' : 'objective: tell Mum what happened';
    if (G.sceneId === 'p_curb') return 'objective: get in the Mustang';
    if (G.sceneId === 'p_club') return G.flags.rapDone ? 'objective: leave through the west door' : 'objective: get on stage with Bucktooth';
    if (G.sceneId === 'p_arbys_night') return 'objective: talk to Bucktooth';
    return '';
  }
};
