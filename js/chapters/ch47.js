// ch47.js - Chapter 47: Mav and the Enduring Beaver Legacy
//
// The last one with the doll. A quiet start, one more heist, a chase, a mural,
// and a goodbye that has to be earned rather than announced.
//
//   c47_room    the desk, the dust, and the ankle problem
//   c47_arbys   the distraction: three questions, thirty seconds
//   c47_street  the chase, carrying the sauce
//   c47_park    the rose garden, and the Bucktooth Bucks
//   c47_river   the willow, the mural, the song

ARBYS_SCENES.c47_arbys = 1;                  // share the restaurant art

NAMES.patty = 'PATTY';

var CH47 = {
  q: 0,           // how many questions landed
  bags: 0,        // sauce bags secured
  t: 0,           // heist clock
  chase: false,
  caught: 0,      // times Patty got a hand on you
  throws: 0,
  doodles: 0
};

var C47_HEIST_SECONDS = 34;

function c47Reset() {
  CH47.q = 0; CH47.bags = 0; CH47.t = 0;
  CH47.chase = false; CH47.caught = 0; CH47.throws = 0; CH47.doodles = 0;
  G.flags.c47_bags = 0;
  G.perform = false;
}

// ------------------------------------------------------------------- props

PROP_HOOKS.push(function (c, e) {
  var k = e.kind;
  if (k !== 'c47DeskVoid' && k !== 'c47SauceBag' && k !== 'c47Bucks' &&
      k !== 'c47BoxArt' && k !== 'c47Willow' && k !== 'c47Bin' &&
      k !== 'c47Hydrant' && k !== 'c47Stand' && k !== 'c47Gate') return false;
  var P = propPainter(c, e);

  if (k === 'c47DeskVoid') {
    // the desk the doll has been sitting behind for two months
    P(-24, -2, 48, 4, 'rgba(0,0,0,0.18)');
    P(-24, -16, 48, 14, '#7a5a3a');
    P(-22, -15, 44, 10, '#96704a');
    P(-22, -4, 3, 6, '#5e442c');
    P(19, -4, 3, 6, '#5e442c');
    P(-10, -22, 16, 6, '#2f4a6a');          // a stack of notebooks
    P(-8, -26, 14, 5, '#3a5a7e');
    P(6, -20, 12, 4, '#e8e2d0');            // loose paper
    P(-26, -26, 18, 4, 'rgba(200,190,170,0.45)');   // dust on the shelf edge
    return true;
  }

  if (k === 'c47SauceBag') {
    P(-9, -16, 18, 16, '#c8a06a');
    P(-8, -15, 16, 14, '#dcb47c');
    P(-8, -18, 16, 3, '#b8905a');
    P(-3, -12, 6, 8, '#b8402f');            // a sauce packet showing
    P(3, -11, 5, 6, '#c8503a');
    return true;
  }

  if (k === 'c47Bucks') {
    // Bucktooth Bucks: fake hundreds with the Professor's face and a tiny crown
    for (var i = 0; i < 3; i++) {
      P(-12 + i * 8, -12 - i * 2, 14, 7, '#cfe0b8');
      P(-11 + i * 8, -11 - i * 2, 12, 5, '#e4f0cf');
      P(-8 + i * 8, -10 - i * 2, 5, 3, '#8a9a72');
      P(-7 + i * 8, -11 - i * 2, 3, 1, '#f0c060');   // the crown
    }
    return true;
  }

  if (k === 'c47BoxArt') {
    // the cardboard box, with the mural growing on it as you pick doodles
    P(-30, -26, 60, 26, '#a5764a');
    P(-30, -26, 60, 3, '#c08f5c');
    P(-28, -24, 56, 22, '#b98756');
    var d = e.doodles || 0;
    if (d > 0) {                            // the whale on a house
      P(-24, -20, 16, 8, '#3f6a8a');
      P(-16, -24, 6, 4, '#3f6a8a');
      P(-22, -16, 12, 4, '#c8d8e8');
      P(-25, -14, 20, 2, '#8a5a3a');
    }
    if (d > 1) {                            // the giant can of beans
      P(-2, -22, 10, 14, '#8a9a4a');
      P(-3, -23, 12, 2, '#c8d0a0');
      P(0, -18, 6, 3, '#e8e2c0');
    }
    if (d > 2) {                            // the rocket turtle
      P(12, -22, 12, 8, '#5a9a5a');
      P(14, -20, 8, 4, '#8ac08a');
      P(10, -16, 6, 3, '#c8402f');
      P(24, -18, 4, 3, '#e8a040');
    }
    return true;
  }

  if (k === 'c47Willow') {
    P(-14, -2, 28, 4, 'rgba(0,0,0,0.20)');
    P(-6, -54, 12, 54, '#5a4530');
    P(-8, -54, 4, 54, '#6d5438');
    P(-40, -70, 80, 22, '#3f6a3c');
    P(-34, -56, 70, 10, '#4a7a44');
    for (var w = 0; w < 12; w++) {
      P(-38 + w * 7, -52, 2, 18 + (w % 3) * 8, '#4a7a44');
    }
    P(-44, -74, 26, 8, '#356035');
    P(18, -72, 26, 8, '#356035');
    return true;
  }

  if (k === 'c47Bin') {
    P(-8, -18, 16, 18, '#4a5a4a');
    P(-9, -20, 18, 3, '#5e7260');
    P(-6, -14, 12, 2, '#3a483a');
    return true;
  }
  if (k === 'c47Hydrant') {
    P(-5, -14, 10, 14, '#b8342f');
    P(-7, -12, 14, 4, '#c8403a');
    P(-6, -17, 12, 4, '#b8342f');
    P(-8, -8, 3, 3, '#a02a26');
    P(5, -8, 3, 3, '#a02a26');
    return true;
  }
  if (k === 'c47Stand') {
    P(-9, -18, 18, 18, '#6a7a8a');
    P(-8, -17, 16, 10, '#8a9aa8');
    P(-6, -15, 12, 2, '#e8e2d0');
    P(-6, -11, 8, 1, '#c8c0a8');
    return true;
  }
  if (k === 'c47Gate') {
    P(-16, -20, 32, 20, 'rgba(0,0,0,0.10)');
    for (var g = 0; g < 5; g++) {
      P(-15 + g * 7, -22, 3, 22, '#e8e4d8');
      P(-15 + g * 7, -24, 3, 3, '#f4f0e4');
    }
    P(-16, -18, 32, 2, '#d8d4c6');
    P(-16, -8, 32, 2, '#d8d4c6');
    return true;
  }
  return false;
});

// ------------------------------------------------------------------ scenes

SCENES.c47_room = {
  title: 'A QUIET COUPLE OF MONTHS LATER',
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
    { id: 'win47', who: null, tx: 22, ty: 5, kind: 'c50Window', noSolid: true, propScale: 1 },
    { id: 'desk47', who: null, tx: 16, ty: 10, kind: 'c47DeskVoid', solid: true, sw: 3, sh: 1, propScale: 1, reach: 64, talk: 'ch47Desk' },
    { id: 'bed47', who: null, tx: 6, ty: 9, kind: 'c50Bed', solid: true, sw: 4, sh: 2, propScale: 1 },
    { id: 'exit47', exit: { to: 'c47_arbys', tx: 8, ty: 14, dir: 'right' }, tx: 16, ty: 16, rect: { w: 3, h: 1 } }
  ],
  overlay: function (c) {
    // late afternoon, warm and a bit sad
    c.fillStyle = 'rgba(70,50,30,0.16)';
    c.fillRect(0, 0, W, H);
    var g = c.createRadialGradient(400, 40, 10, 400, 40, 220);
    g.addColorStop(0, 'rgba(255,208,140,0.22)');
    g.addColorStop(1, 'rgba(255,208,140,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
};

SCENES.c47_arbys = {
  title: "ARBY'S, ONE LAST TIME",
  spawn: { tx: 16, ty: 12, dir: 'up' },
  camZoom: 1,
  fill: 'linoleum',
  rects: [
    { x: 0, y: 0, w: 32, h: 4, t: 'wall' },
    { x: 0, y: 4, w: 1, h: 13, t: 'wall' },
    { x: 31, y: 4, w: 1, h: 13, t: 'wall' },
    { x: 0, y: 17, w: 32, h: 1, t: 'wall' },
    { x: 5, y: 7, w: 22, h: 2, t: 'counter' },
    { x: 3, y: 12, w: 5, h: 1, t: 'booth' },
    { x: 24, y: 12, w: 5, h: 1, t: 'booth' }
  ],
  solidKinds: ['wall', 'counter', 'booth', 'table'],
  entities: [
    { id: 'clerk47', who: 'arbys_clerk', tx: 16, ty: 6, dir: 'down', reach: 60, talk: 'ch47Clerk' },
    { id: 'buck47h', who: 'bucktooth_puppet', tx: 22, ty: 8, dir: 'down', hidden: true },
    { id: 'bag47', who: null, tx: 22, ty: 9, kind: 'c47SauceBag', noSolid: true, propScale: 1, hidden: true },
    { id: 'menu47', who: null, tx: 16, ty: 3, kind: 'menuBoard', noSolid: true, propScale: 1 },
    { id: 'tray47', who: null, tx: 12, ty: 7, kind: 'tray', noSolid: true, propScale: 1 },
    { id: 'patty47', who: 'patty', tx: 27, ty: 6, dir: 'left', hidden: true, reach: 56, talk: 'ch47Patty' },
    { id: 'exit47b', exit: { to: 'c47_street', tx: 2, ty: 12, dir: 'right' }, tx: 0, ty: 10, rect: { w: 1, h: 3 } }
  ],
  overlay: function (c) {
    var lamps = [[6, 10], [16, 9], [26, 10]];
    lamps.forEach(function (l) {
      var g = c.createRadialGradient(l[0] * TILE, l[1] * TILE, 4, l[0] * TILE, l[1] * TILE, 66);
      g.addColorStop(0, 'rgba(255,236,190,0.14)');
      g.addColorStop(1, 'rgba(255,220,160,0)');
      c.fillStyle = g;
      c.fillRect(l[0] * TILE - 68, l[1] * TILE - 68, 136, 136);
    });
  }
};

SCENES.c47_street = {
  title: 'THE CHASE',
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
    { id: 'bin1', who: null, tx: 8, ty: 12, kind: 'c47Bin', solid: true, propScale: 1 },
    { id: 'hyd1', who: null, tx: 12, ty: 12, kind: 'c47Hydrant', solid: true, propScale: 1 },
    { id: 'stand1', who: null, tx: 17, ty: 12, kind: 'c47Stand', solid: true, propScale: 1 },
    { id: 'bin2', who: null, tx: 22, ty: 12, kind: 'c47Bin', solid: true, propScale: 1 },
    { id: 'hyd2', who: null, tx: 26, ty: 12, kind: 'c47Hydrant', solid: true, propScale: 1 },
    { id: 'gate47', who: null, tx: 29, ty: 12, kind: 'c47Gate', noSolid: true, propScale: 1 },
    { id: 'pattyChase', who: 'patty', tx: 3, ty: 13, dir: 'right', hidden: true },
    { id: 'exitPark', exit: { to: 'c47_park', tx: 16, ty: 14, dir: 'up' }, tx: 30, ty: 12, rect: { w: 1, h: 3 } }
  ],
  overlay: function (c) {
    c.fillStyle = 'rgba(255,210,150,0.08)';
    c.fillRect(0, 0, W, H);
  }
};

SCENES.c47_park = {
  title: 'THE ROSE GARDEN',
  spawn: { tx: 16, ty: 14, dir: 'up' },
  camZoom: 1,
  fill: 'grass',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 3, y: 5, w: 26, h: 2, t: 'path' },
    { x: 3, y: 10, w: 26, h: 1, t: 'path' },
    { x: 0, y: 16, w: 32, h: 2, t: 'tree' }
  ],
  solidKinds: ['tree'],
  entities: [
    { id: 'rose47a', who: null, tx: 6, ty: 8, kind: 'roseBush', solid: true, sw: 4, sh: 1, propScale: 1 },
    { id: 'rose47b', who: null, tx: 14, ty: 8, kind: 'roseBush', solid: true, sw: 4, sh: 1, propScale: 1 },
    { id: 'rose47c', who: null, tx: 22, ty: 8, kind: 'roseBush', solid: true, sw: 4, sh: 1, propScale: 1 },
    { id: 'pattyPark', who: 'patty', tx: 16, ty: 6, dir: 'down', reach: 70, talk: 'ch47Cornered' },
    { id: 'exitRiver', exit: { to: 'c47_river', tx: 4, ty: 13, dir: 'right' }, tx: 31, ty: 12, rect: { w: 1, h: 2 } }
  ],
  overlay: function (c) {
    c.fillStyle = 'rgba(60,80,50,0.10)';
    c.fillRect(0, 0, W, H);
  }
};

SCENES.c47_river = {
  title: 'THE WILLOW',
  spawn: { tx: 6, ty: 13, dir: 'right' },
  camZoom: 1,
  fill: 'grass',
  rects: [
    { x: 0, y: 0, w: 32, h: 2, t: 'tree' },
    { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
    { x: 1, y: 15, w: 30, h: 2, t: 'water' },
    { x: 1, y: 14, w: 30, h: 1, t: 'sand' },
    { x: 0, y: 9, w: 32, h: 1, t: 'path' }
  ],
  solidKinds: ['tree', 'water'],
  entities: [
    { id: 'willow47', who: null, tx: 20, ty: 12, kind: 'c47Willow', noSolid: true, propScale: 1 },
    { id: 'box47', who: null, tx: 14, ty: 13, kind: 'c47BoxArt', noSolid: true, propScale: 1, reach: 70, talk: 'ch47Mural' },
    { id: 'buck47r', who: 'bucktooth_puppet', tx: 11, ty: 12, dir: 'right', reach: 60, talk: 'ch47Talk' }
  ],
  overlay: function (c) {
    // evening on the water
    c.fillStyle = 'rgba(40,50,90,0.20)';
    c.fillRect(0, 0, W, H);
    var g = c.createLinearGradient(0, 200, 0, H);
    g.addColorStop(0, 'rgba(255,170,120,0)');
    g.addColorStop(1, 'rgba(255,170,120,0.22)');
    c.fillStyle = g;
    c.fillRect(0, 200, W, H - 200);
  }
};

// ----------------------------------------------------------------- scripts

SCRIPT.ch47Desk = function () {
  if (G.flags.ch47_found) {
    say([{ who: 'bucktooth', text: 'The Arby\'s is still east. I have not forgotten about the Crazy Sauce. I never forget about the Crazy Sauce.' }]);
    return;
  }
  say([
    { who: 'narrator', text: 'Behind a stack of notebooks sits the Professor Bucktooth doll, slumped over, a thin layer of Clovis dust on his felt shoulders.' },
    { who: 'maverick', text: 'Oh. Hey, Professor.' }
  ], function () {
    G.flags.ch47_found = true;
    setTimeout(function () {
      FX.burst(16 * TILE + 8, 10 * TILE - 4, '#c8bca0', 20, { speed: 40, life: 0.7, lift: 20 });
      say([
        { who: 'narrator', text: 'Mav blew the dust off the beaver\'s nose and slipped his hand inside the puppet.' },
        { who: 'bucktooth', text: 'Maverick! My internal sensors indicate a prolonged absence of high risk civil engineering projects! And... wait.' },
        { who: 'bucktooth', text: 'Your ankles are higher. The hem of your jeans is a full three inches north of where it was in February. This is a structural disaster for my eye line. You are... you are GROWING.' },
        { who: 'maverick', text: 'Yeah, Professor. I have grown a bit. We have just been busy. School is tough, and...' },
        { who: 'bucktooth', text: 'You are phasing me out! Next thing I know I will be shoved into a cardboard box and donated to the Clovis Daycare!' },
        { who: 'bucktooth', text: 'Maverick, you do not know the horrors of the Toddler Pit. It is a lawless wasteland of ninety percent saliva and ten percent unresolved aggression.' },
        { who: 'maverick', text: 'Hey. No. I would never do that. We are always going to be friends, Professor. No matter how tall I get.' },
        { who: 'bucktooth', text: 'I do not want to just cherish, Maverick! I want to BUILD!' },
        { who: 'bucktooth', text: 'We must execute one final, highly illegal artistic endeavour. We must race to the Arby\'s, seize all of their crayons and Crazy Sauce, and create a masterpiece!' },
        { who: 'maverick', text: 'Alright, Professor. One last heist. For old times sake.' }
      ], function () {
        toast('objective: get to Arby\'s, east');
        FX.confetti(G.px, G.py - 10);
      });
    }, 900);
  });
};

SCRIPT.ch47Clerk = function () {
  if (G.flags.ch47_heist) {
    say([{ who: 'arbys_clerk', text: 'You are still here. You have asked nine questions. I have answered none of them.' }]);
    return;
  }
  say([
    { who: 'maverick', text: 'Hi! Yeah. Quick question about the curly fry seasoning.' },
    { who: 'arbys_clerk', text: '...Sure.' },
    { who: 'bucktooth', text: 'GO. Keep him talking. I am going over the counter.' }
  ], function () {
    G.flags.ch47_heist = true;
    G.flags.c47_heistAt = G.time;
    CH47.q = 0; CH47.bags = 0; CH47.t = 0;
    var h = G.ents.filter(function (e) { return e.id === 'buck47h'; })[0];
    if (h) h.hidden = false;
    toast('keep him talking: pick the most specific question');
    ch47Round();
  });
};

var C47_ROUNDS = [
  [
    { label: 'Is the seasoning a wet rub or a dry rub, and does hydration affect the cling coefficient?', good: 2, say: 'I... honestly do not know. Nobody has ever asked me that.' },
    { label: 'How much sauce comes in a packet?', good: 0, say: 'Why do you want to know where the sauce is?' },
    { label: 'Do you do curly fries?', good: 1, say: 'Yeah. Sure.' }
  ],
  [
    { label: 'If the curly fry seasoning went on the bun of a Beef n Cheddar, would that be a structural problem?', good: 2, say: 'That is a good question. I have never considered the bun as a load bearing surface.' },
    { label: 'Where do you keep the sauce?', good: 0, say: 'Okay, why is everyone asking me that today.' },
    { label: 'Is the seasoning gluten free?', good: 1, say: 'Probably. I think so. Do not quote me.' }
  ],
  [
    { label: 'Is it bloomed in oil before application or dusted post fry, and which survives a twelve minute drive?', good: 2, say: 'Nobody has ever asked me that. I am going to think about it all week.' },
    { label: 'Can I have a bag?', good: 0, say: 'You want a bag? For what?' },
    { label: 'What is your favourite thing on the menu?', good: 1, say: 'The curly fries. Obviously.' }
  ]
];

function ch47Round() {
  if (CH47.q >= 3) { ch47Caught(); return; }
  var r = C47_ROUNDS[CH47.q];
  say([{
    who: 'maverick',
    text: 'Question ' + (CH47.q + 1) + '.',
    choices: r.map(function (o, i) {
      return {
        label: o.label,
        act: function () {
          if (o.good === 2) {
            CH47.q++; CH47.bags++;
            G.flags.c47_bags = CH47.bags;
            SFX.blip(760 + CH47.bags * 60, 0.06);
            FX.pop(G.px, G.py - 26, 'BAG ' + CH47.bags + '/3', '#f0c060');
          } else if (o.good === 1) {
            CH47.t += 5;
          } else {
            CH47.t += 9;
            G.shake = 0.3;
          }
        },
        reply: [{ who: 'arbys_clerk', text: o.say }]
      };
    })
  }], function () { ch47Round(); });
}

function ch47Caught() {
  if (G.flags.ch47_spotted) return;
  CH47.chase = true;
  var p = G.ents.filter(function (e) { return e.id === 'patty47'; })[0];
  if (p) p.hidden = false;
  var bag = G.ents.filter(function (e) { return e.id === 'bag47'; })[0];
  if (bag) bag.hidden = false;
  SFX.tone(200, 0.2, 'square', 0.06);
  G.shake = 1.0;
  say([
    { who: 'narrator', text: 'A voice roars from the back: STOP THOSE THIEVES!' },
    { who: 'narrator', text: 'It is Patty, the shift leader. Patty is wearing a hairnet, a very tight apron, and looks like he has not slept since the late nineties.' },
    { who: 'patty', text: 'I am on my second strike, kid! If one more packet of Crazy Sauce goes missing, Gary is demoted to the graveyard drive thru! GET BACK HERE!' },
    { who: 'bucktooth', text: 'I HAVE THE RAW MATERIALS! RUN!' }
  ], function () {
    G.flags.ch47_spotted = true;
    G.flags.c47_start = G.time;
    toast('objective: out the west door, then keep running');
  });
}

SCRIPT.ch47Patty = function () {
  say([{ who: 'patty', text: 'Do not talk to me. Run. That is the whole activity.' }]);
};

SCRIPT.ch47Cornered = function () {
  if (G.flags.ch47_bucks) {
    say([{ who: 'patty', text: 'I am still picking paper out of my hairnet. Go on. Get.' }]);
    return;
  }
  say([
    { who: 'patty', text: 'Alright. Hand over the sauce, you little punks.' },
    { who: 'bucktooth', text: 'Never!' },
    { who: 'bucktooth', text: 'Patty, I recognise a man of desperation. Take this and secure your financial foundation!' }
  ], function () {
    ch47Throw();
  });
};

function ch47Throw() {
  G.flags.ch47_throwing = true;
  CH47.throws = 0;
}

SCRIPT.ch47Mural = function () {
  if (G.flags.ch47_done) {
    say([{ who: 'narrator', text: 'The box sits by the water with four crayon masterpieces on it and one very sticky corner.' }]);
    return;
  }
  if (!G.flags.ch47_draw) {
    say([{ who: 'maverick', text: 'We should draw something. That is the whole point of the sauce.' }], function () {
      G.flags.ch47_draw = true;
      ch47Doodle();
    });
    return;
  }
  say([{ who: 'narrator', text: 'Just a box with a story on it, drying in the evening air.' }]);
};

var C47_DOODLES = [
  [
    { label: 'A whale on a house.', d: 1 },
    { label: 'A very neat spreadsheet.', d: 0 }
  ],
  [
    { label: 'The giant can of beans.', d: 2 },
    { label: 'A sensible sandwich.', d: 0 }
  ],
  [
    { label: 'The rocket turtle.', d: 3 },
    { label: 'A parking diagram.', d: 0 }
  ]
];

function ch47Doodle() {
  if (CH47.doodles >= 3) { ch47Song(); return; }
  var pick = C47_DOODLES[Math.min(2, CH47.doodles)];
  say([{
    who: 'maverick',
    text: 'What goes on the box next?',
    choices: pick.map(function (o) {
      return {
        label: o.label,
        act: function () {
          if (!o.d) return;
          CH47.doodles = Math.max(CH47.doodles + 1, o.d);
          G.flags.c47_doodles = CH47.doodles;
          var box = G.ents.filter(function (e) { return e.id === 'box47'; })[0];
          if (box) box.doodles = CH47.doodles;
          SFX.pickup();
          FX.burst(box ? box.px : G.px, (box ? box.py : G.py) - 12, '#c8402f', 12, { speed: 40, life: 0.6 });
        }
      };
    })
  }], function () { ch47Doodle(); });
}

function ch47Song() {
  if (G.flags.ch47_done) return;
  G.flags.ch47_done = true;
  say([
    { who: 'narrator', text: 'They sat under the willow and sang a beautiful, off key duet they wrote on the spot, titled The One in a Billion Beaver.' },
    { who: 'bucktooth', text: 'Maverick. When you grow up, and you are a big fancy adult who probably designs actual bridges instead of marshmallow ones, you might stop thinking about a silly puppet.' },
    { who: 'bucktooth', text: 'But whenever you do not know what to do, just remember my words of wisdom.' },
    { who: 'maverick', text: 'What are they, Professor?' },
    { who: 'bucktooth', text: 'Always solve the corners first. Never trust a walrus near your boss. And if life gets too serious... just throw a vegetable at the cheese.' },
    { who: 'maverick', text: 'I will remember, Professor.' },
    { who: 'narrator', text: 'They walked out to the edge of the grass to watch the stars come out over Clovis. Then a blue flashing light lit up the street.' },
    { who: 'narrator', text: 'A high pitched buzzing grew louder. It was Patty, riding an electric scooter at top speed, being chased by a police car.' },
    { who: 'patty', text: 'I WAS DUPED, OFFICER! HE HAD TEETH! HE WAS POLYESTER! THE BEAVER TRICKED ME!' },
    { who: 'narrator', text: 'Mav and the Professor looked at each other, and burst into a long, loud, ridiculous laugh.' }
  ], function () {
    var missed = Math.max(0, CH47.caught || 0);
    var score = Math.max(40, 100 - missed * 15 - Math.max(0, (G.flags.c47_heistTime || 0) - 40) * 0.5);
    cleared(47, score, 'the mural has ' + CH47.doodles + ' of 3 drawings');
  });
}

SCRIPT.ch47Talk = function () {
  if (G.flags.ch47_done) return;
  if (CH47.doodles >= 3) { ch47Song(); return; }
  say([{ who: 'bucktooth', text: 'Draw on the box first. A masterpiece needs a base coat and that box is doing nothing.' }]);
};

// --------------------------------------------------------------- the chase

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch47') return;

  // the heist clock: dawdling lets Patty walk out and catch you
  if (G.sceneId === 'c47_arbys' && G.flags.ch47_heist && !G.flags.ch47_spotted) {
    var heistStart = G.flags.c47_heistAt || (G.flags.c47_heistAt = G.time);
    var elapsed = G.time - heistStart + CH47.t;
    G.flags.c47_heistTime = elapsed;
    if (elapsed >= C47_HEIST_SECONDS) ch47Caught();
    return;
  }

  // the chase: Patty walks at you, and the bag slows you down
  if (G.sceneId === 'c47_street' && G.flags.ch47_spotted) {
    var p = G.ents.filter(function (e) { return e.id === 'pattyChase'; })[0];
    if (p) {
      if (p.hidden) p.hidden = false;
      var dx = G.px - p.px, dy = G.py - p.py;
      var dist = Math.hypot(dx, dy) || 1;
      var speed = 46 + CH47.caught * 4;
      var back = 6 * TILE;
      if (dist > back) {
        p.px += (dx / dist) * speed * dt;
        p.py += (dy / dist) * speed * dt;
        p.moving = true;
        p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      } else {
        p.moving = false;
      }
      if (dist < 14) {
        CH47.caught++;
        G.shake = 1.1;
        SFX.tone(150, 0.16, 'square', 0.06);
        FX.pop(G.px, G.py - 26, 'CAUGHT!', '#e8607a');
        toast('he grabbed the bag. shake him off and keep going.');
        p.px -= (dx / dist) * 40;
        p.py -= (dy / dist) * 40;
      }
    }
  }

  // the bucks: a timing throw
  if (G.sceneId === 'c47_park' && G.flags.ch47_throwing && !G.flags.ch47_bucks) {
    CH47.t = (CH47.t || 0) + dt;
  }
});

// throwing the fake money needs a key of its own
ACTION_HOOKS.push(function () {
  if (G.level !== 'ch47') return false;
  if (G.sceneId !== 'c47_park' || !G.flags.ch47_throwing || G.flags.ch47_bucks) return false;

  // the throw is best when the meter is in the middle of its swing
  var phase = (Math.sin(G.time * 6) + 1) / 2;
  var good = phase > 0.45 && phase < 0.75;
  G.flags.ch47_throwing = false;
  if (good) {
    G.flags.ch47_bucks = true;
    SFX.pickup();
    FX.confetti(G.px, G.py - 12);
    FX.pop(G.px, G.py - 28, 'BUCKTOOTH BUCKS!', '#f0c060');
    say([
      { who: 'narrator', text: 'A fistful of crisp green bills hit Patty square in the face. On every one of them, the Professor wears a tiny crown.' },
      { who: 'patty', text: 'Wait. Hundreds? Three of them? I can pay off my scooter insurance!' },
      { who: 'narrator', text: 'Before Patty could look closely enough to notice the president had whiskers, Mav and the Professor were over the park fence and gone.' }
    ], function () { toast('objective: the riverbank, east'); });
  } else {
    CH47.caught++;
    SFX.tone(160, 0.12, 'square', 0.06);
    FX.pop(G.px, G.py - 26, 'MISSED', '#e8607a');
    toast('the bills went everywhere. try again.');
    setTimeout(function () {
      if (G.level === 'ch47' && !G.flags.ch47_bucks) G.flags.ch47_throwing = true;
    }, 700);
  }
  return true;
});

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch47') return;

  // the heist: how many bags, and how long the clerk will keep talking
  if (G.sceneId === 'c47_arbys' && G.flags.ch47_heist && !G.flags.ch47_spotted) {
    var elapsed = (G.time - (G.flags.c47_heistAt || G.time)) + CH47.t;
    var left = Math.max(0, C47_HEIST_SECONDS - elapsed);
    var bw = 160, bx = (W - bw) / 2, by = 22;
    c.fillStyle = 'rgba(18,16,28,0.82)';
    c.fillRect(bx - 2, by - 2, bw + 4, 12);
    c.fillStyle = '#2a2434';
    c.fillRect(bx, by, bw, 8);
    c.fillStyle = left < 8 ? '#e8404f' : '#e8c060';
    c.fillRect(bx, by, bw * (left / C47_HEIST_SECONDS), 8);
    c.font = '6px monospace';
    c.fillStyle = '#f0e4c8';
    c.textAlign = 'center';
    c.fillText('CRAZY SAUCE ' + CH47.bags + '/3', W / 2, by - 4);
    c.textAlign = 'left';
    return;
  }

  // the throw meter
  if (G.sceneId === 'c47_park' && G.flags.ch47_throwing && !G.flags.ch47_bucks) {
    var phase = (Math.sin(G.time * 6) + 1) / 2;
    var bx2 = W / 2 - 80, by2 = 26, bw2 = 160;
    c.fillStyle = 'rgba(18,16,28,0.82)';
    c.fillRect(bx2 - 2, by2 - 2, bw2 + 4, 12);
    c.fillStyle = '#2a2434';
    c.fillRect(bx2, by2, bw2, 8);
    c.fillStyle = 'rgba(155,224,138,0.55)';
    c.fillRect(bx2 + bw2 * 0.45, by2, bw2 * 0.3, 8);
    c.fillStyle = '#f6ecd8';
    c.fillRect(bx2 + bw2 * phase - 1, by2 - 2, 2, 12);
    c.font = '6px monospace';
    c.fillStyle = '#f0e4c8';
    c.textAlign = 'center';
    c.fillText('THROW THE BUCKS  [E]', W / 2, by2 - 4);
    c.textAlign = 'left';
  }
});

// -------------------------------------------------------------------- entry

CHAPTER_CONTENT[47] = {
  start: 'c47_room',

  intro: function () {
    chapterCard('CHAPTER FORTY SEVEN', 'The Enduring Beaver Legacy', 3.2);
    c47Reset();
    G.flags.ch47_found = false;
    G.flags.ch47_heist = false;
    G.flags.ch47_heistAt = 0;
    G.flags.ch47_spotted = false;
    G.flags.ch47_throwing = false;
    G.flags.ch47_bucks = false;
    G.flags.ch47_draw = false;
    G.flags.ch47_done = false;
    G.flags.c47_doodles = 0;
    setTimeout(function () {
      if (G.level !== 'ch47') return;
      say([
        { who: 'narrator', text: 'Chapter forty seven. A quiet couple of months in Clovis, and a desk with something dusty on it.' }
      ]);
    }, 900);
  },

  resume: function () {
    G.perform = false;
    G.flags.ch47_throwing = false;
  },

  objective: function () {
    if (G.sceneId === 'c47_room') return G.flags.ch47_found ? 'objective: out the door to Arby\'s (south)' : 'objective: look at the desk';
    if (G.sceneId === 'c47_arbys') {
      if (G.flags.ch47_spotted) return 'objective: out the west door';
      if (!G.flags.ch47_heist) return 'objective: talk to the clerk';
      return 'objective: keep him talking, get three bags';
    }
    if (G.sceneId === 'c47_street') return 'objective: reach the park gate, east';
    if (G.sceneId === 'c47_park') return G.flags.ch47_bucks ? 'objective: over the fence, east' : 'objective: talk to Patty';
    if (G.sceneId === 'c47_river') return G.flags.ch47_done ? '' : (CH47.doodles >= 3 ? 'objective: talk to the Professor' : 'objective: draw on the box');
    return '';
  }
};
