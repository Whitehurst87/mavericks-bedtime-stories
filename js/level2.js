// level2.js - Episode Two: The Path of the Flatulent Prophet
// Merged into SCENES and SCRIPT at load so the engine treats it like any other level.

var CAN_LINES = [
  { id: 'pinto',    color: '#c8452f', label: 'PINTO',   line: "Pinto. The reliable one. The Honda Civic of beans." },
  { id: 'navy',     color: '#3f6fb0', label: 'NAVY',    line: "Navy beans. They have a rank. I respect that." },
  { id: 'kidney',   color: '#8f4a3a', label: 'KIDNEY',  line: "Kidney beans. Shaped like the organ I am about to punish." },
  { id: 'lima',     color: '#6a9a4a', label: 'LIMA',    line: "Lima beans. Nobody's favorite. Today, everybody's hero." },
  { id: 'black',    color: '#3a3a44', label: 'BLACK',   line: "Black beans. Mysterious. In my mind they are wearing sunglasses." },
  { id: 'garbanzo', color: '#c8a44a', label: 'GARBANZO',line: "Chickpeas. Technically not a bean. Spiritually, absolutely a bean." },
  { id: 'mystery',  color: '#7a5a8a', label: 'BEANS',   line: "No label. Just BEANS written in marker. Buying it. Obviously." },
  { id: 'flavored', color: '#b06a2a', label: 'BEAN FLAVORED', line: "The label says BEAN FLAVORED. That is not a bean. That is a threat." },
  { id: 'family',   color: '#4a8a8a', label: 'FAMILY SIZE', line: "Family size. My family is me and a ghost beaver. It still counts." },
  { id: 'expired',  color: '#8a8a6a', label: 'BEST BY 1998', line: "Best by 1998. That is not a bean. That is an artifact." }
];

var SCENES2 = {

  yard2: {
    title: "MAVERICK'S BACKYARD",
    spawn: { tx: 5, ty: 12, dir: 'down' },
    fill: 'grass',
    rects: [
      { x: 0, y: 0, w: 32, h: 2, t: 'tree' },
      { x: 0, y: 0, w: 1, h: 18, t: 'tree' }, { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
      { x: 1, y: 15, w: 30, h: 1, t: 'fence' },
      { x: 2, y: 3, w: 7, h: 2, t: 'roof' },
      { x: 2, y: 5, w: 7, h: 2, t: 'house' },
      { x: 4, y: 7, w: 1, h: 1, t: 'door' },
      { x: 4, y: 8, w: 1, h: 3, t: 'path' },
      { x: 7, y: 10, w: 18, h: 4, t: 'path' },
      { x: 13, y: 4, w: 1, h: 1, t: 'tree' }, { x: 25, y: 5, w: 1, h: 1, t: 'tree' },
      { x: 28, y: 13, w: 1, h: 1, t: 'tree' }, { x: 2, y: 13, w: 1, h: 1, t: 'tree' }
    ],
    solidKinds: ['tree', 'house', 'roof', 'fence'],
    entities: [
      { id: 'catapult', who: null, tx: 12, ty: 9, kind: 'catapult', solid: true, propScale: 2.5, talk: 'catapult' },
      { id: 'topiary', who: null, tx: 21, ty: 12, kind: 'topiary', solid: true, propScale: 2.2, talk: 'topiary' },
      { id: 'exit_grocery', exit: { to: 'grocery', tx: 2, ty: 8, dir: 'right' }, tx: 30, ty: 11, rect: { w: 1, h: 2 } }
    ]
  },

  grocery: {
    title: 'CLOVIS GROCERY-O-RAMA',
    spawn: { tx: 2, ty: 8, dir: 'right' },
    fill: 'linoleum',
    rects: [
      { x: 0, y: 0, w: 32, h: 1, t: 'wall' }, { x: 0, y: 17, w: 32, h: 1, t: 'wall' },
      { x: 0, y: 0, w: 1, h: 18, t: 'wall' }, { x: 31, y: 0, w: 1, h: 18, t: 'wall' },
      { x: 2, y: 1, w: 27, h: 2, t: 'shelf' },
      { x: 1, y: 5, w: 29, h: 3, t: 'shelf' },
      { x: 1, y: 10, w: 29, h: 3, t: 'shelf' },
      { x: 20, y: 14, w: 7, h: 2, t: 'counter' }
    ],
    solidKinds: ['wall', 'shelf', 'counter'],
    entities: [
      { id: 'clerk', who: 'clerk', tx: 23, ty: 13, dir: 'down', talk: 'clerk' },
      { id: 'cart', who: null, tx: 5, ty: 15, kind: 'cart', solid: true, talk: 'cart' },
      { id: 'exit_yard2', exit: { to: 'yard2', tx: 29, ty: 10, dir: 'left' }, tx: 0, ty: 8, rect: { w: 1, h: 2 } },
      { id: 'exit_kitchen', exit: { to: 'kitchen', tx: 2, ty: 11, dir: 'right' }, tx: 30, ty: 8, rect: { w: 1, h: 2 } }
    ]
  },

  kitchen: {
    title: "MAVERICK'S KITCHEN",
    spawn: { tx: 3, ty: 11, dir: 'right' },
    fill: 'linoleum',
    rects: [
      { x: 0, y: 0, w: 32, h: 1, t: 'wall' }, { x: 0, y: 17, w: 32, h: 1, t: 'wall' },
      { x: 0, y: 0, w: 1, h: 18, t: 'wall' }, { x: 31, y: 0, w: 1, h: 18, t: 'wall' },
      { x: 2, y: 4, w: 10, h: 2, t: 'cabinet' },
      { x: 12, y: 4, w: 3, h: 2, t: 'window' },
      { x: 15, y: 4, w: 6, h: 2, t: 'cabinet' },
      { x: 22, y: 4, w: 4, h: 2, t: 'cabinet' },
      { x: 2, y: 6, w: 10, h: 2, t: 'counter' },
      { x: 12, y: 6, w: 3, h: 2, t: 'stove' },
      { x: 15, y: 6, w: 6, h: 2, t: 'counter' },
      { x: 6, y: 12, w: 7, h: 2, t: 'counter' }
    ],
    solidKinds: ['wall', 'counter', 'stove'],
    entities: [
      { id: 'pot', who: null, tx: 13, ty: 6, kind: 'pot', noSolid: true, talk: 'pot' },
      { id: 'sink', who: null, tx: 5, ty: 6, kind: 'sink', noSolid: true, talk: 'sink' },
      { id: 'fridge', who: null, tx: 28, ty: 6, kind: 'fridge', solid: true, propScale: 2.3, talk: 'fridge' },
      { id: 'exit_grocery2', exit: { to: 'grocery', tx: 28, ty: 8, dir: 'left' }, tx: 0, ty: 11, rect: { w: 1, h: 2 } },
      { id: 'exit_storm', exit: { to: 'storm', tx: 5, ty: 12, dir: 'down', req: 'ate' }, tx: 30, ty: 11, rect: { w: 1, h: 2 } }
    ]
  },

  storm: {
    title: 'THE NARRATIVE STORM',
    spawn: { tx: 5, ty: 12, dir: 'right' },
    fill: 'grass',
    storm: true,
    rects: [
      { x: 0, y: 0, w: 32, h: 2, t: 'tree' },
      { x: 0, y: 0, w: 1, h: 18, t: 'tree' }, { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
      { x: 1, y: 15, w: 30, h: 1, t: 'fence' },
      { x: 2, y: 3, w: 7, h: 2, t: 'roof' },
      { x: 2, y: 5, w: 7, h: 2, t: 'house' },
      { x: 4, y: 7, w: 1, h: 1, t: 'door' },
      { x: 7, y: 10, w: 18, h: 4, t: 'path' },
      { x: 22, y: 13, w: 1, h: 1, t: 'tree' }, { x: 27, y: 6, w: 1, h: 1, t: 'tree' }
    ],
    solidKinds: ['tree', 'house', 'roof', 'fence'],
    entities: [
      { id: 's_debris1', who: null, tx: 10, ty: 13, kind: 'debris' },
      { id: 's_debris2', who: null, tx: 20, ty: 11, kind: 'debris' }
    ]
  },

  crash: {
    title: 'THE SEVENTH FLOOD',
    spawn: { tx: 6, ty: 12, dir: 'right' },
    fill: 'water',
    rects: [
      { x: 0, y: 0, w: 32, h: 2, t: 'tree' },
      { x: 0, y: 0, w: 1, h: 18, t: 'tree' }, { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
      { x: 0, y: 2, w: 32, h: 10, t: 'water' },
      { x: 0, y: 12, w: 32, h: 4, t: 'sand' },
      { x: 26, y: 3, w: 1, h: 1, t: 'tree' }, { x: 3, y: 3, w: 1, h: 1, t: 'tree' }
    ],
    solidKinds: ['tree'],
    entities: [
      { id: 'c_adrian', who: 'adrian', tx: 14, ty: 11, dir: 'down', talk: 'adrianCrash' },
      { id: 'c_twig', who: null, tx: 18, ty: 10, kind: 'twig', talk: 'twig' },
      { id: 'c_nibbles', who: 'nibbles', tx: 22, ty: 10, dir: 'down', talk: 'nibbles', small: true },

      { id: 'c_mayor', who: 'mayor', tx: 21, ty: 13, dir: 'up', talk: null },
      { id: 'c_nutkin', who: 'nutkin', tx: 27, ty: 13, dir: 'up', talk: null },
      { id: 'c_shellby', who: 'shellby', tx: 9, ty: 13, dir: 'up', talk: null },
      { id: 'c_kevin', who: 'kevin', tx: 30, ty: 11, dir: 'down', talk: null, small: true }
    ]
  }
};

// cans get placed on the shelves here so the data stays readable
(function buildCans() {
  var spots = [[4, 7], [8, 7], [12, 7], [16, 7], [24, 7], [5, 10], [10, 10], [15, 10], [21, 10], [26, 10]];
  CAN_LINES.forEach(function (c, i) {
    var s = spots[i];
    SCENES2.grocery.entities.push({
      id: 'can_' + c.id, who: null, tx: s[0], ty: s[1], kind: 'can',
      can: c.id, canColor: c.color, canLabel: c.label, line: c.line, talk: 'beanPull'
    });
  });
})();

var SCRIPT2 = {

  beansIntro: function () {
    say([
      { who: 'narrator', text: "Maverick's backyard. A wooden frame stands where a medieval catapult stood nine seconds ago." },
      { who: 'maverick', text: "Adrian, wait! The physics of that lever are--" },
      { who: 'narrator', text: "TWANG." },
      { who: 'maverick', text: "...and there he goes." },
      { who: 'narrator', text: "A small orange hoodie becomes a dot, then a rumor, heading roughly for the North Atlantic." },
      { who: 'maverick', text: "Okay. I'm handling the logistics from this end." },
      { who: 'narrator', text: "The air goes cold. It smells like a damp cedar closet. The topiary bush begins to shimmer." },
      { who: 'bucktooth', text: "MAVERICK! I have returned from the floral dimension!" },
      { who: 'maverick', text: "You're a ghost." },
      { who: 'bucktooth', text: "I am a SPECTRE with a shopping list. Observe. Chocolate covered strawberries. Dandelions. A peace offering for Mrs. Nibbles, to repair the structural damage to her honeymoon." },
      { who: 'bucktooth', text: "I acquired them by possessing a local florist named Gary for twenty minutes. He will be fine. He has a story now." },
      { who: 'maverick', text: "Professor. Gerbils can't eat chocolate. That is a tiny, delicious execution kit." },
      { who: 'bucktooth', text: "Nonsense! A gerbil's digestive tract is a marvel of foundational resilience. She needs the antioxidants to cope with the humidity of her current situation!" },
      { who: 'maverick', text: "Her current situation is a wheel in a flooded house." },
      { who: 'bucktooth', text: "Exactly. Humidity." },
      { who: 'maverick', text: "Why are you here, though? I have a Scottish narrator to stop. Every time I get close to his Secret Bean Box he snaps his fingers and I'm back here, the town floods, and I have to explain the fake mustache to the police." },
      { who: 'bucktooth', text: "To stop the Architect, Maverick, you must BECOME the Architect." },
      { who: 'maverick', text: "I'm listening." },
      { who: 'bucktooth', text: "BEANS. The bean is the foundational stone of all creative whimsy. To out-narrate Stephen Dalton you must eat legumes like a man possessed and film terrible, nonsensical bedtime stories for the internet." },
      { who: 'maverick', text: "You want me to flood the internet with bad content." },
      { who: 'bucktooth', text: "I want you to be UNSTOPPABLE." },
      { who: 'maverick', text: "...Fine. Let's get the beans." },
      { who: 'narrator', text: "[HOLD E to charge the bean power later. For now: the Grocery-O-Rama is east. Bucktooth floats along behind you.]" }
    ], function () {
      G.flags.metGhost = true;
      G.spawnCompanion();
    });
  },

  resumeBeans: function () {
    if (G.flags.metGhost) G.spawnCompanion();
    if (G.sceneId === 'storm') G.beginStorm();
  },

  catapult: function () {
    say([
      { who: 'narrator', text: "The catapult is gone. The lever is gone. Adrian is gone. There is a scorch mark shaped like a sneaker." },
      { who: 'narrator', text: "Taped to the frame: 'BACK IN 20 MINUTES. DO NOT TOUCH LEVER. - A'" },
      { who: 'maverick', text: "He wrote that before he touched the lever, didn't he." }
    ]);
  },

  topiary: function () {
    if (G.flags.metGhost) {
      say([{ who: 'narrator', text: "The topiary still smells like a damp cedar closet. It will never recover." }]);
    } else {
      say([
        { who: 'narrator', text: "The topiary is shaking. Topiaries do not shake. This one is shaking." },
        { who: 'maverick', text: "Hello?" },
        { who: 'narrator', text: "Nothing. Just leaves. And a faint smell of damp cedar." }
      ]);
    }
  },

  beanPull: function () {
    var e = G.talkTarget;
    if (!e || !e.can) return;
    var got = G.flags.beans || 0;
    if (G.flags['can_' + e.can]) {
      return say([{ who: 'narrator', text: "That shelf spot is empty now. You took everything." }]);
    }
    G.flags['can_' + e.can] = true;
    G.flags.beans = got + 1;
    G.ents = G.ents.filter(function (x) { return x.id !== e.id; });
    SFX.pickup();
    var lines = [{ who: 'narrator', text: e.line }];
    if (G.flags.beans === 10) {
      lines.push({ who: 'maverick', text: "That's every can of beans in the building." });
      lines.push({ who: 'bucktooth', text: "EVERY CAN. Maverick, do you understand what you are holding?" });
      lines.push({ who: 'maverick', text: "Thirty one dollars and eleven cents of consequences." });
    } else {
      lines.push({ who: 'narrator', text: "[" + G.flags.beans + " of 10 cans. Clovis Grocery-O-Rama thanks you for your service.]" });
    }
    say(lines);
  },

  clerk: function () {
    if (!G.flags.clerk) {
      G.flags.clerk = true;
      say([
        { who: 'clerk', text: "You're buying every can of beans in the store." },
        { who: 'maverick', text: "Yeah." },
        { who: 'clerk', text: "Are you okay?" },
        { who: 'maverick', text: "Define okay." },
        { who: 'clerk', text: "That'll be thirty one dollars and eleven cents." },
        { who: 'maverick', text: "Put it on the whale insurance." },
        { who: 'clerk', text: "The what." },
        { who: 'maverick', text: "Whale-Damaged Home Insurance. They cover floods. They have to. It's the whole business model." },
        { who: 'clerk', text: "...I'm not allowed to say no. The card went through." },
        { who: 'clerk', text: "Also, sir, there's a ghost beaver floating behind you and he's touching the deli case." },
        { who: 'bucktooth', text: "I am INSPECTING it." }
      ]);
    } else {
      say([{ who: 'clerk', text: "Kitchen's through the back. Please take the ghost with you." }]);
    }
  },

  cart: function () {
    say([
      { who: 'narrator', text: "A shopping cart with one wheel that goes in a different direction than the other three." },
      { who: 'maverick', text: "Not today. I have enough problems and one of them is Scottish." }
    ]);
  },

  sink: function () {
    say([{ who: 'narrator', text: "The sink is full of clean dishes. This is the last normal thing in the house and it knows it." }]);
  },

  fridge: function () {
    say([
      { who: 'narrator', text: "The fridge contains: one waffle, a cheese stick, a jar of something, and a note that says DO NOT EAT THE JAR." },
      { who: 'maverick', text: "I'm a cheese-and-waffle guy. I want you all to know that about me." }
    ]);
  },

  pot: function () {
    if (G.flags.ate) {
      return say([{ who: 'narrator', text: "An empty pot. Sixteen cans. A wooden spoon standing straight up in the residue like a flag." }]);
    }
    if (!G.flags.cooked) {
      if ((G.flags.beans || 0) < 10) {
        return say([
          { who: 'narrator', text: "The pot is ready. Your bean supply is not." },
          { who: 'maverick', text: "I need all ten cans. Bucktooth says a partial prophet is just a guy with gas." }
        ]);
      }
      G.flags.cooked = true;
      say([
        { who: 'narrator', text: "You open ten cans and pour them in. The kitchen fills with the smell of simmering legumes and bad decisions." },
        { who: 'bucktooth', text: "Stir counterclockwise. It is very important and I will not explain why." },
        { who: 'maverick', text: "It's bean soup, Professor." },
        { who: 'bucktooth', text: "It's a PROPHECY, Maverick, and it is almost ready." },
        { who: 'narrator', text: "Then the light through the window goes bruised and purple." },
        { who: 'bucktooth', text: "He knows. Stephen Dalton has detected a disturbance in the Fiber!" },
        { who: 'narrator', text: "[HOLD E to eat. Ten cans is not going to eat itself.]" }
      ], function () { G.beginEating(); });
      return;
    }
    if (!G.flags.ate) {
      return say([{ who: 'narrator', text: "The pot is hot and waiting. Hold E to keep eating." }],
        function () { G.beginEating(); });
    }
  },

  // ------------------------------------------------------------- the storm

  stormIntro: function () {
    say([
      { who: 'narrator', text: "The sky over Clovis is the color of a bruise that has opinions." },
      { who: 'narrator', text: "Massive clouds roll in, smelling like lightning and aggressive shortbread." },
      { who: 'narrator', text: "And somewhere above all of it, a voice with an accent you could cut with a spurtle:" },
      { who: 'narrator', text: '"Now then, lad. I have been narratin\' this town for seven hundred years, and I will NOT be out-written by a boy with a spoon."' },
      { who: 'maverick', text: "Stephen Dalton." },
      { who: 'narrator', text: '"Aye. And you\'ve gone and made yourself a prophet of the legume. Do you know what I do to prophets?"' },
      { who: 'maverick', text: "Flood them?" },
      { who: 'narrator', text: '"Flood them. Every time. It is my signature."' },
      { who: 'bucktooth', text: "MAVERICK. The power is in your chest. Hold it. BUILD it. And when it is too big to hold, let the whole West Coast hear about it." },
      { who: 'narrator', text: "[HOLD E to charge. RELEASE at full power. Do not release early. Actually, do whatever you like.]" }
    ], function () { G.beginStorm(); });
  },

  twig: function () {
    say([
      { who: 'narrator', text: "The Master Twig. It is a twig. It is not even a good twig." },
      { who: 'maverick', text: "If anyone touches that, the whole town floods again." },
      { who: 'narrator', text: "[Adrian is currently falling toward it at approximately the speed of a bad idea.]" }
    ]);
  },

  adrianCrash: function () {
    if (G.flags.adrian) return say([{ who: 'adrian', text: "I saw a cloud from the inside, Mav. It was mostly water." }]);
    G.flags.adrian = true;
    say([
      { who: 'narrator', text: "Adrian is lying face down on the bank with his glasses on sideways." },
      { who: 'adrian', text: "Did I get it? Did I do the thing?" },
      { who: 'maverick', text: "You flew to Greenland." },
      { who: 'adrian', text: "So I did the thing." },
      { who: 'maverick', text: "You also fell out of the sky and landed next to the dam." },
      { who: 'adrian', text: "On purpose. Mostly." },
      { who: 'adrian', text: "Hey, is that the famous twig?" },
      { who: 'maverick', text: "Don't. Adrian. Do not touch the--" },
      { who: 'narrator', text: "K-RACK." },
      { who: 'narrator', text: "The seventh flood of the month surges through the streets, instantly levelling the three houses that were rebuilt this morning." },
      { who: 'narrator', text: "The townspeople, watching from their porches and now from their porches floating away, begin to cheer and whistle." },
      { who: 'mayor', text: "A RECORD! He's beaten the 1974 record held by that guy who ate the giant burrito!" },
      { who: 'adrian', text: "Was that good? I feel like that was good." }
    ], function () { G.startBeanEnding(); });
  },

  lockedExit: function () {
    say([
      { who: 'narrator', text: "The back door is locked. Outside, the sky looks like it has plans." },
      { who: 'maverick', text: "Not yet. The pot is still full and I am still a normal guy with a mustache." }
    ]);
  },

  nibbles: function () {
    say([
      { who: 'narrator', text: "Mrs. Nibbles floats by in her soundproof wheel, letting out a series of deep, weirdly satisfied burps." },
      { who: 'maverick', text: "That's either the chocolate strawberries or the sonic pressure of my victory." },
      { who: 'bucktooth', text: "She's FINE, Maverick. Look at her. Thriving." },
      { who: 'narrator', text: "She does, in fact, look thriving. This is somehow the worst part." }
    ]);
  }
};

// merge into the engine's tables
Object.keys(SCENES2).forEach(function (k) { SCENES[k] = SCENES2[k]; });
Object.keys(SCRIPT2).forEach(function (k) { SCRIPT[k] = SCRIPT2[k]; });
