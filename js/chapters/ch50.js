// ch50.js - Chapter 50: Mav and the Substitute's Underworld Sabbatical
//
// Two jobs, back to back. First a sprint across Clovis before the 8:07 bell,
// then forty seconds in Room 14 keeping a substitute's temper under the red
// line by speaking up at exactly the right moment, and never in between.
//
//   c50_room    the bedroom at 8:02, a frying pan, no time
//   c50_street  the sprint, eight things in the way
//   c50_room14  Room 14, The Burt, Joel, and the book

NAMES.burt = 'THE BURT';
NAMES.joel = 'JOEL';

// ------------------------------------------------------------------- state

var CH50 = {
  speaking: false,       // the argument is running
  speak: false,          // a window is open right now
  speakT: 0,             // how long the window stays open
  nextSpeak: 0,          // when the next window opens
  rage: 0,
  argueT: 0,
  hits: 0,
  argued: false
};

var C50_ARGUE_SECONDS = 38;

function c50Reset() {
  CH50.speaking = false;
  CH50.speak = false;
  CH50.speakT = 0;
  CH50.nextSpeak = 0;
  CH50.rage = 0;
  CH50.argueT = 0;
  CH50.argued = false;
  G.flags.c50_rage = 0;
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
      k !== 'c50Scorch' && k !== 'c50School' && k !== 'c50SignBurt') return false;
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
    P(-6, -5, 3, 2, '#d8d8e0');
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
  spawn: { tx: 2, ty: 13, dir: 'right' },
  camZoom: 1,
  fill: 'c50Pave',
  rects: [
    { x: 0, y: 0, w: 32, h: 3, t: 'c50Brick' },
    { x: 0, y: 7, w: 32, h: 4, t: 'c50Road' },
    { x: 0, y: 3, w: 32, h: 1, t: 'c50Pave' },
    { x: 0, y: 11, w: 32, h: 1, t: 'c50Pave' },
    { x: 0, y: 17, w: 32, h: 1, t: 'c50Brick' }
  ],
  solidKinds: ['c50Brick'],
  entities: [
    { id: 'school50', who: null, tx: 28, ty: 14, kind: 'c50School', noSolid: true, propScale: 1, reach: 40, talk: 'ch50Late' },
    { id: 'sign50', who: null, tx: 24, ty: 13, kind: 'c50SignBurt', noSolid: true, propScale: 1 },
    // eight things in the way, all drifting
    { id: 'dog50', who: 'kevin', tx: 6, ty: 13, dir: 'down', drift: 22 },
    { id: 'nana50', who: 'wallaby', tx: 9, ty: 13, dir: 'down', drift: 12 },
    { id: 'postman50', who: 'nutkin', tx: 12, ty: 12, dir: 'down', drift: 26 },
    { id: 'skater50', who: 'adrian', tx: 15, ty: 13, dir: 'down', drift: 34 },
    { id: 'cat50', who: 'nibbles', tx: 18, ty: 12, dir: 'down', drift: 30, small: true },
    { id: 'clerk50', who: 'clerk', tx: 21, ty: 13, dir: 'down', drift: 18 },
    { id: 'gnome50', who: 'gnome', tx: 23, ty: 12, dir: 'down', drift: 15, small: true },
    { id: 'buck50b', who: 'bucktooth_puppet', tx: 4, ty: 12, dir: 'down', hidden: false },
    { id: 'exitSchool', exit: { to: 'c50_room14', tx: 16, ty: 14, dir: 'up' }, tx: 30, ty: 12, rect: { w: 2, h: 3 } }
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
    { id: 'scorch50', who: null, tx: 12, ty: 13, kind: 'c50Scorch', noSolid: true, propScale: 1, hidden: true }
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
    { who: 'narrator', text: 'CLANG. CLANG. CLANG. The Professor Bucktooth doll is standing on the pillow swinging a toddler sized frying pan at Mav\'s forehead.' },
    { who: 'bucktooth', text: 'Wake up, wake up, little fifth grade bean! The finest scholar that Clovis has seen!' },
    { who: 'maverick', text: 'Ow! Professor, stop!' },
    { who: 'narrator', text: 'The clock on the nightstand says 8:02. Homeroom started two minutes ago.' },
    { who: 'maverick', text: 'EIGHT TWO?!' },
    { who: 'bucktooth', text: 'Total schedule collapse! Abandon the waffles! Deploy the sneakers!' },
    { who: 'narrator', text: 'Mav shoved his feet into his shoes, snatched his backpack, and left the house at a speed that concerned several neighbours.' }
  ], function () {
    G.flags.c50_gone = true;
    G.flags.c50_t = 0;
    CH50.hits = 0;
    c50Reset();
    toast('objective: get to Room 14 (east, then up)');
  });
};

SCRIPT.ch50Late = function () {
  say([{ who: 'narrator', text: 'Clovis Elementary. The doors, then the hallway, then Room 14. Do not stop to explain yourself.' }]);
};

SCRIPT.ch50Burt = function () {
  if (!CH50.speaking && !CH50.argued) {
    say([{ who: 'burt', text: 'Sit down, kid. We are on page seventy two and you are on my last nerve.' }]);
    return;
  }
  if (CH50.argued) {
    say([{ who: 'burt', text: 'Do not talk to me. I am having a moment about my romantic life.' }]);
    return;
  }
  say([{ who: 'burt', text: 'Zip it. Joel and I are in the middle of something.' }]);
};

SCRIPT.ch50Joel = function () {
  if (!CH50.speaking && !CH50.argued) {
    say([{ who: 'joel', text: 'Watch this. He hates it when the book falls.' }]);
    return;
  }
  if (CH50.argued) {
    say([{ who: 'joel', text: 'I have a book that solves problems. It is not this one.' }]);
    return;
  }
  say([{ who: 'joel', text: 'He called my house four times. FOUR. Times.' }]);
};

// The Burt reaches the podium. The argument starts on arrival.
function c50ClassArrival() {
  say([
    { who: 'maverick', text: 'Ms. Schwegel, I am so, so sorry! My internal temporal awareness suffered a complete breakdown!' },
    { who: 'burt', text: 'I am no Schwegel.' },
    { who: 'narrator', text: 'The voice sounded like two cinderblocks grinding together inside a cement mixer.' },
    { who: 'burt', text: 'I am The Burt. And if you do not pay attention, I will bring the hurt. Sit down, kid.' },
    { who: 'bucktooth', text: 'Maverick. His facial geometry lacks any structural compassion. Do not make eye contact with the moustache.' }
  ], function () {
    if (G.level !== 'ch50' || G.sceneId !== 'c50_room14') return;
    c50ClassStart();
    setTimeout(function () {
      if (G.level !== 'ch50' || G.sceneId !== 'c50_room14' || CH50.argued) return;
      say([
        { who: 'narrator', text: 'At the back of the room, Joel pushed his textbook off the desk with one finger.' },
        { who: 'narrator', text: 'THUD. The substitute\'s left eye twitched. The room went dead silent.' },
        { who: 'burt', text: 'Not this again, Joel. Pick up your book. Right this minute.' }
      ]);
    }, 3000);
  });
}

function c50ClassStart() {
  CH50.speaking = true;
  CH50.rage = 20 + Math.min(40, (G.flags.c50_late || 0) * 8);
  CH50.argueT = 0;
  CH50.nextSpeak = 3.5;
  G.flags.c50_rage = CH50.rage;
  toast('the argument has started');
}

function c50ArgueEnd() {
  CH50.speaking = false;
  CH50.argued = true;
  G.flags.c50_rage = CH50.rage;
  if (CH50.rage >= 100) {
    // he blew up before the book came out: run the page again
    say([
      { who: 'narrator', text: 'Something in the substitute\'s neck goes a colour not found in nature, and the entire class decides to have a do over.' }
    ], function () {
      c50Reset();
      c50ClassStart();
    });
    return;
  }
  ch50Necronomicon();
}

function ch50Necronomicon() {
  SFX.blast();
  G.shake = 1.8; G.flash = 0.9;
  say([
    { who: 'narrator', text: 'Then Joel reached into his backpack and pulled out an ancient leather book wrapped in pulsing purple veins.' },
    { who: 'maverick', text: 'Wait, where did he get that?!' },
    { who: 'joel', text: 'KLAATU... VERATA... NIC TO!' },
    { who: 'narrator', text: 'The linoleum under the desk cracked open with a flash of crimson brimstone. Two enormous multi eyed horrors came up through the floor.' },
    { who: 'narrator', text: 'One scooped up the substitute by the waistband of his slacks. The other snagged Joel by the backpack straps.' },
    { who: 'burt', text: 'I STILL HAVE HER NUMBER, JOEL!' },
    { who: 'joel', text: 'SHE BLOCKED YOU ON FACEBOOK, BURT!' },
    { who: 'narrator', text: 'FWOOSH. The floor snapped shut with a hollow click, leaving a scorch mark and the faint smell of sulphur and cinnamon.' }
  ], function () {
    if (G.sceneId !== 'c50_room14') return;
    var sc = G.ents.filter(function (e) { return e.id === 'scorch50'; })[0];
    if (sc) { sc.hidden = false; }
    var b = G.ents.filter(function (e) { return e.id === 'burt50'; })[0];
    if (b) { b.hidden = true; }
    var j = G.ents.filter(function (e) { return e.id === 'joel50'; })[0];
    if (j) { j.hidden = true; }
    FX.burst(12 * TILE + 8, 13 * TILE, '#7a4a8a', 30, { speed: 70, life: 0.9, lift: 40 });
    setTimeout(function () {
      say([
        { who: 'narrator', text: 'The classroom sat in stunned, paralysed silence. Outside, the broken window let in a cool autumn breeze.' },
        { who: 'maverick', text: 'Well. Even unholy friendships can be sweet.' },
        { who: 'narrator', text: 'The class instantly divided down the middle. Half of them howled with laughter. The other half sobbed, deeply grieving the interdimensional loss of a substitute teacher.' }
      ], function () {
        var rage = Math.round(CH50.rage);
        var score = Math.max(40, Math.round(100 - rage * 0.45 - (G.flags.c50_late || 0) * 6));
        cleared(50, score, 'Burt\'s meter peaked at ' + rage);
      });
    }, 1400);
  });
}

// ------------------------------------------------------------- the arguing

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch50') return;

  // the sprint: a clock that only goes one way
  if (G.sceneId === 'c50_street' && G.flags.c50_gone) {
    G.flags.c50_t = (G.flags.c50_t || 0) + dt;
    // bumping into anyone costs you four seconds of story time
    for (var i = 0; i < G.ents.length; i++) {
      var e = G.ents[i];
      if (!e.drift) continue;
      if (e.c50_cool > 0) { e.c50_cool -= dt; continue; }
      var d = Math.hypot(e.px - G.px, e.py - G.py);
      if (d < 12) {
        e.c50_cool = 1.2;
        CH50.hits++;
        G.flags.c50_t += 4;
        G.shake = 0.5;
        SFX.tone(160, 0.1, 'square', 0.05);
        FX.pop(G.px, G.py - 24, '+4s', '#e8607a');
        toast('you lost four seconds');
      }
    }
  }

  // walking into Room 14 starts the lesson, once per run
  if (G.sceneId === 'c50_room14' && !G.flags.c50_arrived && !DLG.active) {
    G.flags.c50_arrived = true;
    G.flags.c50_late = Math.max(0, Math.round((G.flags.c50_t || 0) / 12) - 2);
    c50ClassArrival();
  }

  // Room 14: the argument
  if (G.sceneId === 'c50_room14' && CH50.speaking && !DLG.active) {
    CH50.argueT += dt;
    CH50.rage = Math.min(140, CH50.rage + dt * 6.8);
    G.flags.c50_rage = CH50.rage;

    if (!CH50.speak) {
      CH50.nextSpeak -= dt;
      if (CH50.nextSpeak <= 0) {
        CH50.speak = true;
        CH50.speakT = 1.6;
        SFX.blip(760, 0.05);
      }
    } else {
      CH50.speakT -= dt;
      if (CH50.speakT <= 0) {
        CH50.speak = false;
        CH50.nextSpeak = 3.2 + Math.random() * 1.6;
        CH50.rage = Math.min(140, CH50.rage + 8);   // you missed your chance
        SFX.tone(200, 0.08, 'square', 0.04);
      }
    }

    if (CH50.rage >= 100 || CH50.argueT >= C50_ARGUE_SECONDS) c50ArgueEnd();
  }
});

ACTION_HOOKS.push(function () {
  if (G.level !== 'ch50' || G.sceneId !== 'c50_room14') return false;
  if (!CH50.speaking || DLG.active) return false;
  if (CH50.speak) {
    CH50.speak = false;
    CH50.speakT = 0;
    CH50.nextSpeak = 3.4 + Math.random() * 1.4;
    CH50.rage = Math.max(0, CH50.rage - 22);
    G.flags.c50_rage = CH50.rage;
    SFX.blip(900, 0.06);
    FX.burst(G.px, G.py - 8, '#9be08a', 12, { speed: 50, life: 0.5, lift: 26 });
    FX.pop(G.px, G.py - 26, 'DEFUSED', '#c8f0a0');
  } else {
    CH50.rage = Math.min(140, CH50.rage + 24);
    G.flags.c50_rage = CH50.rage;
    SFX.tone(140, 0.12, 'square', 0.06);
    G.shake = 0.5;
    FX.pop(G.px, G.py - 26, 'BAD TIMING', '#e8607a');
    toast('he was mid sentence, that made it worse');
  }
  return true;
});

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
    c.fillText(clock, W / 2, 22);
    var bw = 180, bx = (W - bw) / 2, by = 28;
    c.fillStyle = 'rgba(18,16,28,0.75)';
    c.fillRect(bx, by, bw, 9);
    var f = Math.min(1, t / 60);
    c.fillStyle = t > 60 ? '#c8404f' : '#8ac06a';
    c.fillRect(bx + 1, by + 1, (bw - 2) * f, 7);
    c.fillStyle = 'rgba(255,255,255,0.25)';
    c.fillRect(bx + bw * 0.83, by, 1, 9);          // the 8:07 mark
    c.textAlign = 'left';
    return;
  }

  // the substitute's meter
  if (G.sceneId === 'c50_room14' && CH50.speaking) {
    var bx2 = W / 2 - 90, by2 = 24, bw2 = 180, bh2 = 10;
    c.fillStyle = 'rgba(18,16,28,0.82)';
    c.fillRect(bx2 - 2, by2 - 2, bw2 + 4, bh2 + 4);
    c.fillStyle = '#2a2434';
    c.fillRect(bx2, by2, bw2, bh2);
    var rage = Math.min(1, CH50.rage / 100);
    c.fillStyle = rage > 0.75 ? '#e8404f' : rage > 0.45 ? '#e8a040' : '#8ac06a';
    c.fillRect(bx2, by2, bw2 * rage, bh2);
    c.fillStyle = 'rgba(255,255,255,0.30)';
    for (var i = 1; i < 4; i++) c.fillRect(bx2 + (bw2 / 4) * i, by2, 1, bh2);
    c.font = '6px monospace';
    c.fillStyle = '#f0e4c8';
    c.textAlign = 'center';
    c.fillText('THE BURT', W / 2, by2 - 5);
    c.textAlign = 'left';

    // the window you can speak in
    if (CH50.speak) {
      var pulse = 0.6 + 0.4 * Math.sin(G.time * 18);
      c.globalAlpha = pulse;
      c.fillStyle = '#9be08a';
      c.fillRect(W / 2 - 34, 44, 68, 12);
      c.globalAlpha = 1;
      c.fillStyle = '#12200f';
      c.font = 'bold 7px monospace';
      c.textAlign = 'center';
      c.fillText('SPEAK UP  [E]', W / 2, 52);
      c.textAlign = 'left';
    }
  }
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
    setTimeout(function () {
      if (G.level !== 'ch50') return;
      say([
        { who: 'narrator', text: 'Chapter fifty. In which our hero is late, and then things get worse in a way nobody could have scheduled.' }
      ]);
    }, 900);
  },

  resume: function () {
    if (G.sceneId === 'c50_room14' && !CH50.argued) {
      CH50.speaking = false;
      CH50.speak = false;
      CH50.rage = 0;
    }
  },

  objective: function () {
    if (G.sceneId === 'c50_room') return G.flags.c50_gone ? 'objective: out the door (south)' : 'objective: wake up, talk to the Professor';
    if (G.sceneId === 'c50_street') return 'objective: run east to Room 14';
    if (G.sceneId === 'c50_room14') {
      if (CH50.argued) return '';
      if (!CH50.speaking) return 'objective: sit down before he notices you';
      return 'objective: speak up in the green window, keep his meter down';
    }
    return '';
  }
};
