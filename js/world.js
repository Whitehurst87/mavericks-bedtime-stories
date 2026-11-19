// world.js - scene layout and all dialogue. Tiles are 16px, scenes are 32x18 tiles.

var SCENES = {

  yard: {
    title: "MAVERICK'S YARD",
    spawn: { tx: 6, ty: 10, dir: 'down' },
    fill: 'grass',
    rects: [
      { x: 0, y: 0, w: 32, h: 1, t: 'tree' }, { x: 0, y: 17, w: 32, h: 1, t: 'tree' },
      { x: 0, y: 0, w: 1, h: 18, t: 'tree' }, { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
      { x: 2, y: 2, w: 8, h: 2, t: 'roof' },
      { x: 2, y: 4, w: 8, h: 3, t: 'house' },
      { x: 5, y: 6, w: 1, h: 1, t: 'door' },
      { x: 5, y: 7, w: 1, h: 2, t: 'path' },
      { x: 5, y: 9, w: 26, h: 2, t: 'path' },
      { x: 13, y: 3, w: 1, h: 1, t: 'tree' }, { x: 25, y: 4, w: 1, h: 1, t: 'tree' },
      { x: 17, y: 13, w: 1, h: 1, t: 'tree' }, { x: 27, y: 12, w: 1, h: 1, t: 'tree' },
      { x: 12, y: 15, w: 1, h: 1, t: 'tree' }, { x: 22, y: 16, w: 1, h: 1, t: 'tree' },
      { x: 3, y: 13, w: 1, h: 1, t: 'tree' }, { x: 9, y: 13, w: 1, h: 1, t: 'tree' }
    ],
    solidKinds: ['tree', 'house', 'roof'],
    props: [],
    entities: [
      { id: 'mailbox', who: 'sign', tx: 10, ty: 11, kind: 'mailbox', talk: 'mailboxNote' },
      { id: 'sprinkler', who: null, tx: 8, ty: 7, kind: 'sprinkler', talk: 'sprinkler' },
      { id: 'exit_town', exit: { to: 'square', tx: 2, ty: 9, dir: 'right' }, tx: 30, ty: 9, rect: { w: 1, h: 2 } }
    ]
  },

  square: {
    title: 'PICKLE CREEK SQUARE',
    spawn: { tx: 2, ty: 9, dir: 'right' },
    fill: 'grass',
    rects: [
      { x: 0, y: 0, w: 32, h: 1, t: 'tree' }, { x: 0, y: 17, w: 32, h: 1, t: 'tree' },
      { x: 0, y: 0, w: 1, h: 18, t: 'tree' }, { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
      { x: 4, y: 5, w: 24, h: 9, t: 'cobble' },
      { x: 4, y: 4, w: 24, h: 1, t: 'hedge' },
      { x: 4, y: 14, w: 24, h: 1, t: 'hedge' },
      { x: 3, y: 5, w: 1, h: 4, t: 'hedge' }, { x: 3, y: 11, w: 1, h: 3, t: 'hedge' },
      { x: 28, y: 5, w: 1, h: 4, t: 'hedge' }, { x: 28, y: 11, w: 1, h: 3, t: 'hedge' },
      { x: 1, y: 9, w: 3, h: 2, t: 'path' }, { x: 28, y: 9, w: 3, h: 2, t: 'path' },
      { x: 7, y: 1, w: 6, h: 2, t: 'roof' }, { x: 7, y: 3, w: 6, h: 1, t: 'house' },
      { x: 19, y: 1, w: 6, h: 2, t: 'roof' }, { x: 19, y: 3, w: 6, h: 1, t: 'house' },
      { x: 14, y: 7, w: 5, h: 4, t: 'stone' },
      { x: 2, y: 2, w: 1, h: 1, t: 'tree' }, { x: 14, y: 2, w: 1, h: 1, t: 'tree' },
      { x: 26, y: 2, w: 1, h: 1, t: 'tree' }, { x: 30, y: 6, w: 1, h: 1, t: 'tree' },
      { x: 30, y: 15, w: 1, h: 1, t: 'tree' }, { x: 2, y: 15, w: 1, h: 1, t: 'tree' },
      { x: 13, y: 16, w: 1, h: 1, t: 'tree' }, { x: 24, y: 16, w: 1, h: 1, t: 'tree' }
    ],
    solidKinds: ['tree', 'house', 'roof', 'hedge', 'stone'],
    props: [],
    entities: [
      { id: 'mayor', who: 'mayor', tx: 20, ty: 8, dir: 'down', talk: 'mayor' },
      { id: 'nutkin', who: 'nutkin', tx: 9, ty: 6, dir: 'down', talk: 'nutkin' },
      { id: 'shellby', who: 'shellby', tx: 8, ty: 11, dir: 'down', talk: 'shellby' },
      { id: 'kevin', who: 'kevin', tx: 22, ty: 12, dir: 'down', talk: 'kevin', small: true },
      { id: 'fountain_basin', who: null, tx: 14, ty: 7, kind: 'fountainBig', noSolid: true },
      { id: 'fountain', who: null, tx: 16, ty: 10, kind: null, talk: 'fountain' },
      { id: 'lamp1', who: null, tx: 5, ty: 5, kind: 'lamp', solid: true },
      { id: 'lamp2', who: null, tx: 26, ty: 5, kind: 'lamp', solid: true },
      { id: 'bench1', who: null, tx: 9, ty: 13, kind: 'bench', solid: true },
      { id: 'bench2', who: null, tx: 21, ty: 13, kind: 'bench', solid: true },
      { id: 'planter1', who: null, tx: 5, ty: 13, kind: 'planter', solid: true },
      { id: 'planter2', who: null, tx: 26, ty: 12, kind: 'planter', solid: true },
      { id: 'exit_yard', exit: { to: 'yard', tx: 29, ty: 9, dir: 'left' }, tx: 0, ty: 9, rect: { w: 1, h: 2 } },
      { id: 'exit_river', exit: { to: 'riverbed', tx: 2, ty: 9, dir: 'right' }, tx: 30, ty: 9, rect: { w: 1, h: 2 } }
    ]
  },

  riverbed: {
    title: 'THE (FORMER) PICKLE CREEK',
    spawn: { tx: 2, ty: 9, dir: 'right' },
    fill: 'mud',
    rects: [
      { x: 0, y: 0, w: 32, h: 2, t: 'tree' }, { x: 0, y: 16, w: 32, h: 2, t: 'tree' },
      { x: 0, y: 0, w: 1, h: 18, t: 'tree' }, { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
      { x: 1, y: 7, w: 30, h: 5, t: 'bed' },
      { x: 1, y: 3, w: 9, h: 3, t: 'grass' }, { x: 20, y: 3, w: 11, h: 3, t: 'grass' },
      { x: 1, y: 13, w: 11, h: 3, t: 'grass' }, { x: 23, y: 13, w: 8, h: 3, t: 'grass' },
      { x: 6, y: 3, w: 1, h: 1, t: 'tree' }, { x: 14, y: 4, w: 1, h: 1, t: 'tree' },
      { x: 26, y: 4, w: 1, h: 1, t: 'tree' }, { x: 6, y: 14, w: 1, h: 1, t: 'tree' },
      { x: 18, y: 14, w: 1, h: 1, t: 'tree' }, { x: 27, y: 3, w: 1, h: 1, t: 'tree' }
    ],
    solidKinds: ['tree'],
    props: [],
    entities: [
      { id: 'sign', who: 'sign', tx: 5, ty: 6, kind: 'sign', talk: 'creekSign' },
      { id: 'gerald', who: null, tx: 13, ty: 9, kind: 'fish', talk: 'gerald', small: true },
      { id: 'sticks', who: null, tx: 21, ty: 9, kind: 'sticks', talk: 'sticks' },
      { id: 'exit_square', exit: { to: 'square', tx: 28, ty: 9, dir: 'left' }, tx: 0, ty: 9, rect: { w: 1, h: 2 } },
      { id: 'r_bush1', who: null, tx: 22, ty: 5, kind: 'bush' },
      { id: 'r_bush2', who: null, tx: 9, ty: 14, kind: 'bush' },
      { id: 'r_log', who: null, tx: 17, ty: 14, kind: 'log' },
      { id: 'r_stump', who: null, tx: 8, ty: 4, kind: 'stump' },
      { id: 'exit_dam', exit: { to: 'dam', tx: 2, ty: 9, dir: 'right' }, tx: 30, ty: 9, rect: { w: 1, h: 2 } }
    ]
  },

  dam: {
    title: 'THE FORTRESS OF SPLASHITUDE',
    spawn: { tx: 2, ty: 9, dir: 'right' },
    fill: 'mud',
    rects: [
      { x: 0, y: 0, w: 32, h: 1, t: 'tree' }, { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
      { x: 31, y: 0, w: 1, h: 18, t: 'tree' }, { x: 0, y: 17, w: 32, h: 1, t: 'tree' },
      { x: 4, y: 11, w: 24, h: 3, t: 'dam' },
      { x: 0, y: 14, w: 32, h: 3, t: 'water' },
      { x: 1, y: 2, w: 8, h: 2, t: 'grass' }, { x: 24, y: 2, w: 7, h: 2, t: 'grass' },
      { x: 9, y: 3, w: 1, h: 1, t: 'tree' }, { x: 20, y: 2, w: 1, h: 1, t: 'tree' },
      { x: 3, y: 7, w: 1, h: 1, t: 'tree' }, { x: 28, y: 7, w: 1, h: 1, t: 'tree' }
    ],
    solidKinds: ['tree', 'dam', 'water'],
    props: [],
    entities: [
      { id: 'bucktooth', who: 'bucktooth', tx: 17, ty: 10, dir: 'down', talk: 'bucktooth' },
      { id: 'j_toupee', who: null, tx: 8, ty: 11, kind: 'junk', item: 'toupee', talk: 'itemToupee' },
      { id: 'j_mail', who: null, tx: 11, ty: 11, kind: 'junk', item: 'mail', talk: 'itemMail' },
      { id: 'j_glasses', who: null, tx: 14, ty: 11, kind: 'junk', item: 'glasses', talk: 'itemGlasses' },
      { id: 'gnome', who: 'gnome', tx: 21, ty: 11, kind: null, item: 'gnome', talk: 'itemGnome' },
      { id: 'j_float', who: null, tx: 24, ty: 11, kind: 'junk', item: 'float', talk: 'itemFloat' },
      { id: 'fortress', who: 'sign', tx: 15, ty: 8, kind: 'sign', talk: 'fortressSign' },
      { id: 'd_bush1', who: null, tx: 5, ty: 4, kind: 'bush' },
      { id: 'd_bush2', who: null, tx: 27, ty: 5, kind: 'bush' },
      { id: 'd_bush3', who: null, tx: 12, ty: 2, kind: 'bush' },
      { id: 'd_log1', who: null, tx: 9, ty: 7, kind: 'log' },
      { id: 'd_log2', who: null, tx: 23, ty: 6, kind: 'log' },
      { id: 'd_stump', who: null, tx: 3, ty: 5, kind: 'stump' },
      { id: 'exit_riverbed', exit: { to: 'riverbed', tx: 28, ty: 9, dir: 'left' }, tx: 0, ty: 9, rect: { w: 1, h: 2 } }
    ]
  },

  ending: {
    title: 'THE SWIMMING HOLE',
    spawn: { tx: 8, ty: 9, dir: 'down' },
    fill: 'grass',
    rects: [
      { x: 0, y: 0, w: 32, h: 2, t: 'tree' }, { x: 0, y: 0, w: 1, h: 18, t: 'tree' },
      { x: 31, y: 0, w: 1, h: 18, t: 'tree' }, { x: 0, y: 17, w: 32, h: 1, t: 'tree' },
      { x: 2, y: 12, w: 28, h: 5, t: 'water' },
      { x: 3, y: 10, w: 26, h: 2, t: 'sand' },
      { x: 6, y: 2, w: 1, h: 1, t: 'tree' }, { x: 25, y: 2, w: 1, h: 1, t: 'tree' },
      { x: 4, y: 5, w: 1, h: 1, t: 'tree' }, { x: 28, y: 6, w: 1, h: 1, t: 'tree' },
      { x: 2, y: 8, w: 1, h: 1, t: 'tree' }, { x: 30, y: 9, w: 1, h: 1, t: 'tree' }
    ],
    solidKinds: ['tree', 'water'],
    props: [],
    entities: [
      { id: 'e_mayor', who: 'mayor', tx: 22, ty: 9, dir: 'down', talk: null },
      { id: 'e_nutkin', who: 'nutkin', tx: 26, ty: 8, dir: 'down', talk: null },
      { id: 'e_shellby', who: 'shellby', tx: 19, ty: 9, dir: 'down', talk: null },
      { id: 'e_kevin', who: 'kevin', tx: 15, ty: 11, dir: 'down', talk: null, small: true },
      { id: 'e_bucktooth', who: 'bucktooth', tx: 11, ty: 9, dir: 'down', talk: null }
    ]
  }
};

// ---------------------------------------------------------------- dialogue

var SCRIPT = {

  mailboxNote: function () {
    say([
      { who: 'narrator', text: "A note is taped to the mailbox in beaver handwriting, which is mostly teeth marks." },
      { who: 'narrator', text: '"MAVERICK. GONE TO BUILD SOMETHING AWESOME. DO NOT FOLLOW. (please follow) P.S. bring snacks. - Prof. B"' },
      { who: 'maverick', text: "He capitalized AWESOME. That is never a good sign." },
      { who: 'maverick', text: "Also he spelled 'snacks' with four k's. He's excited. That's worse." }
    ], function () { G.flags.readNote = true; });
  },

  sprinkler: function () {
    say([
      { who: 'narrator', text: "The sprinkler makes a sad little dribble and then thinks better of it." },
      { who: 'maverick', text: "The water's gone. The whole creek is gone." },
      { who: 'maverick', text: "There are giant wet footprints. Coming from town. Going... that way." }
    ]);
  },

  fountain: function () {
    say([
      { who: 'narrator', text: "The town fountain is doing a small impression of a desert." },
      { who: 'narrator', text: "Someone has put a coin in it anyway. The sign says THANK YOU FOR WISHING." }
    ]);
  },

  mayor: function () {
    if (!G.flags.mayor) {
      G.flags.mayor = true;
      say([
        { who: 'mayor', text: "CITIZENS! The river is GONE. I have checked twice. It is not behind the bakery. I looked." },
        { who: 'maverick', text: "Sir, there's only me here." },
        { who: 'mayor', text: "Then you are the citizen. Congratulations. The pay is terrible." },
        { who: 'mayor', text: "My toupee is also missing. I am choosing to believe these two facts are unrelated." },
        { who: 'mayor', text: "Find whoever did this. It has been my experience that it is always the beaver.", choices: [
          { label: "You think a beaver did this?", reply: [
            { who: 'mayor', text: "It is ALWAYS the beaver, son. I have been mayor for nineteen years. I have never once been wrong." },
            { who: 'mayor', text: "Well. Once. It was a very ambitious squirrel." }
          ] },
          { label: "Your toupee is very nice.", reply: [
            { who: 'mayor', text: "Thank you. It is gone. Please stop looking at my head." }
          ] }
        ] }
      ]);
    } else {
      say([{ who: 'mayor', text: "The beaver. Up the creek bed. West of here. Or east. One of the two." }]);
    }
  },

  nutkin: function () {
    if (!G.flags.nutkin) {
      G.flags.nutkin = true;
      say([
        { who: 'nutkin', text: "Do you know how hard it is to deliver mail when the river ate the bridge, the mailbox, and my DIGNITY?" },
        { who: 'nutkin', text: "Six hundred letters. SIX. HUNDRED. Every single one is addressed to me because everyone moved." },
        { who: 'maverick', text: "That seems like a lot of letters." },
        { who: 'nutkin', text: "It's mostly coupons. If you find a beaver, tell him Postmaster Nutkin has OPINIONS.", choices: [
          { label: "What kind of opinions?", reply: [
            { who: 'nutkin', text: "Loud ones. Alphabetized." }
          ] },
          { label: "Do all six hundred say the same thing?", reply: [
            { who: 'nutkin', text: "...Yes. It says SORRY. Somebody keeps mailing everyone SORRY and not signing it." },
            { who: 'maverick', text: "Huh." }
          ] }
        ] }
      ]);
    } else {
      say([{ who: 'nutkin', text: "Uphill. Follow the mud. Mind the gnome." }]);
    }
  },

  shellby: function () {
    if (!G.flags.shellby) {
      G.flags.shellby = true;
      say([
        { who: 'shellby', text: "I....... have....... a....... theory." },
        { who: 'maverick', text: "I can wait." },
        { who: 'shellby', text: "It....... is....... the....... beaver." },
        { who: 'maverick', text: "Because it always is?" },
        { who: 'shellby', text: "Because....... he....... built....... me....... a....... ramp." },
        { who: 'shellby', text: "For....... my....... feet." },
        { who: 'shellby', text: "He....... is....... a....... MENACE....... but....... he....... is....... a....... kind....... one." },
        { who: 'maverick', text: "...Nobody's ever put it that way before." }
      ]);
    } else {
      say([{ who: 'shellby', text: "Still....... the....... beaver............ probably." }]);
    }
  },

  kevin: function () {
    say([
      { who: 'kevin', text: "Quack." },
      { who: 'narrator', text: "[Kevin does not elaborate.]" },
      { who: 'maverick', text: "Fair enough." },
      { who: 'narrator', text: "Kevin is sitting in the puddle where the fountain used to be. He seems fine. He is always fine." }
    ]);
  },

  creekSign: function () {
    say([
      { who: 'sign', text: "PICKLE CREEK - officially wet since 1954. Currently: a rumor." },
      { who: 'narrator', text: "Someone has drawn a beaver on it with a little hard hat and a big smile." },
      { who: 'maverick', text: "That does look like him." }
    ]);
  },

  gerald: function () {
    say([
      { who: 'narrator', text: "A fish is lying in two inches of water. He does not seem alarmed about it." },
      { who: 'maverick', text: "You okay, buddy?" },
      { who: 'narrator', text: '[The fish is pretending this is fine.]' },
      { who: 'narrator', text: "...This is fine. This is FINE." },
      { who: 'maverick', text: "Okay. Solid coping strategy." }
    ]);
  },

  sticks: function () {
    say([
      { who: 'narrator', text: "A pile of sticks. Neat. Deliberate. Extremely well-engineered." },
      { who: 'narrator', text: "One stick has a tiny sign on it. It says BRANCH OFFICE." },
      { who: 'maverick', text: "He's been here a while." }
    ]);
  },

  fortressSign: function () {
    if (!G.flags.fortressSign) {
      G.flags.fortressSign = true;
      say([
        { who: 'sign', text: 'FORTRESS OF SPLASHITUDE. Management: Prof. B.' },
        { who: 'sign', text: 'NO GIRLS ALLOWED. NO BOYS ALLOWED. NO ADULTS ALLOWED. NO DUCKS ALLOWED.' },
        { who: 'narrator', text: "Underneath, in much smaller handwriting:" },
        { who: 'sign', text: '"no anyone allowed"' },
        { who: 'narrator', text: "Then, smaller still, almost scratched out:" },
        { who: 'sign', text: '"you can come in if you want"' },
        { who: 'maverick', text: "..." },
        { who: 'maverick', text: "Yeah. Okay. I think I get it now." }
      ]);
    } else {
      say([{ who: 'sign', text: 'FORTRESS OF SPLASHITUDE. Still no anyone allowed. (Door is open.)' }]);
    }
  },

  // ---------------------------------------------------------- the dam items

  itemToupee: function () {
    if (G.flags['t_toupee']) return say([{ who: 'narrator', text: "Just a blond-shaped hole in the dam now." }]);
    G.pullItem('toupee');
    say([
      { who: 'narrator', text: "You pull. Something blond and furry comes loose with a wet SPLORT." },
      { who: 'maverick', text: "That's the mayor's toupee." },
      { who: 'maverick', text: "I'm going to pretend I never saw this. I'm going to carry it. I'm going to be fine." }
    ]);
  },

  itemMail: function () {
    if (G.flags['t_mail']) return say([{ who: 'narrator', text: "The gap where the mail sack was is now just... a gap." }]);
    G.pullItem('mail');
    say([
      { who: 'narrator', text: "You pull out a mail sack. Six hundred letters explode into the air like very boring confetti." },
      { who: 'narrator', text: "Every single one says the same thing, in beaver handwriting:" },
      { who: 'narrator', text: "SORRY." },
      { who: 'maverick', text: "He wrote six hundred apology letters. And then shoved them in a dam." },
      { who: 'maverick', text: "That's the saddest craft project I've ever seen." }
    ]);
  },

  itemGlasses: function () {
    if (G.flags['t_glasses']) return say([{ who: 'narrator', text: "Nothing here but a very confused spider." }]);
    G.pullItem('glasses');
    say([
      { who: 'narrator', text: "A pair of tiny round glasses, wet and slightly chewed." },
      { who: 'maverick', text: "Old Man Shellby's. He's been walking around looking at the wrong things all week." },
      { who: 'maverick', text: "Which explains why he waved at a mailbox for ten minutes." }
    ]);
  },

  itemFloat: function () {
    if (G.flags['t_float']) return say([{ who: 'narrator', text: "The flamingo has been freed. It floats on regardless, honking internally." }]);
    G.pullItem('float');
    say([
      { who: 'narrator', text: "You tug a pink flamingo pool float out of the dam. It honks. You did not make it honk." },
      { who: 'maverick', text: "I'm not asking. We're past asking." }
    ]);
  },

  itemGnome: function () {
    if (G.flags['t_gnome']) return say([{ who: 'gnome', text: "I am no longer load-bearing. I have never felt so useless." }]);
    if (G.flags.gnomeSorry) {
      G.pullItem('gnome');
      return say([
        { who: 'gnome', text: "Thank you. Carry me. Gently. I am ceramic." },
        { who: 'narrator', text: "The gnome is now in your backpack. He is narrating the trip." },
        { who: 'gnome', text: "Ooh. Is that the fountain? I remember the fountain. It was a Tuesday." }
      ]);
    }
    say([
      { who: 'gnome', text: "Do NOT pull me out." },
      { who: 'maverick', text: "You're a lawn gnome." },
      { who: 'gnome', text: "I am a load-bearing lawn gnome. I have been holding up this entire structure since TUESDAY." },
      { who: 'gnome', text: "Also, nobody has apologized." },
      { who: 'maverick', text: "Apologized for what?" },
      { who: 'gnome', text: "The hedge incident.", choices: [
        { label: "I'm sorry about the hedge incident.", act: function () { G._gnomeOk = true; }, reply: [
          { who: 'gnome', text: "...You don't even know what it was, do you." },
          { who: 'maverick', text: "Not even a little bit." },
          { who: 'gnome', text: "That's the most honest apology I've had in forty years. Fine. Pull me out." },
          { who: 'gnome', text: "But I want it on the record that I was the best part of this dam." }
        ] },
        { label: "Nice hat, though.", reply: [
          { who: 'gnome', text: "It IS a nice hat. It is also NOT an apology. Try again." },
          { who: 'narrator', text: "[The gnome has gone back to load-bearing out of spite.]" }
        ] },
        { label: "You're literally a lawn ornament.", reply: [
          { who: 'gnome', text: "I am literally a PILLAR OF THIS COMMUNITY." },
          { who: 'narrator', text: "[The gnome will not be moving. Ever. Possibly out of principle.]" }
        ] }
      ] }
    ], function () {
      if (G._gnomeOk && !G.flags['t_gnome']) {
        G._gnomeOk = false;
        G.pullItem('gnome');
        say([
          { who: 'gnome', text: "Easy! EASY. I am ceramic, not load-bearing anymore." },
          { who: 'narrator', text: "The gnome is now in your backpack. He is narrating the trip." },
          { who: 'gnome', text: "Ooh. Is that the fountain? I remember the fountain. It was a Tuesday." }
        ]);
      }
    });
  },

  // ------------------------------------------------------ the big conversation

  bucktooth: function () {
    var got = G.itemCount();
    if (got < 5) {
      var left = 5 - got;
      say([
        { who: 'bucktooth', text: "Hey! HEY. That's load-bearing!" },
        { who: 'bucktooth', text: "Also hi. Also I missed you. Also put that back." },
        { who: 'maverick', text: "Bucktooth, you dammed an entire river." },
        { who: 'bucktooth', text: "I dammed an entire river CORRECTLY. There's a difference.", choices: [
          { label: "What's the difference?", reply: [
            { who: 'bucktooth', text: "The difference is CRAFTSMANSHIP, Maverick." }
          ] },
          { label: "Why is there a gnome in it?", reply: [
            { who: 'bucktooth', text: "He's holding it together. Emotionally. Also structurally." }
          ] }
        ] },
        { who: 'narrator', text: "[" + left + " piece" + (left === 1 ? '' : 's') + " of dam left to undo.]" }
      ]);
      return;
    }
    // all five pulled - the real conversation
    say([
      { who: 'bucktooth', text: "Okay. Okay! You got me. I built a dam. A really GOOD dam.", },
      { who: 'bucktooth', text: "Structurally, it was my masterpiece." },
      { who: 'maverick', text: "You took the whole town's water." },
      { who: 'bucktooth', text: "I dammed the whole river. The water going missing is what happens when a genius skips the paperwork." },
      { who: 'maverick', text: "...Why? Why would you do all this?" },
      { who: 'bucktooth', text: "Because everybody here has STUFF, Maverick.", },
      { who: 'bucktooth', text: "You have school. The mayor has mayor stuff. Nutkin has six hundred letters. Kevin has... whatever Kevin does." },
      { who: 'bucktooth', text: "And I have a really good idea every eleven minutes and absolutely nobody to tell it to." },
      { who: 'maverick', text: "So you dammed a river." },
      { who: 'bucktooth', text: "I dammed a river because I was LONELY. Bored was the cover story." },
      { who: 'bucktooth', text: "I wrote six hundred apology letters and then I couldn't mail them because I ruined the mail. It's a whole thing." },
      { who: 'maverick', text: "You could have just asked me to hang out." },
      { who: 'bucktooth', text: "Asking is scary. Damming is easy." },
      { who: 'bucktooth', text: "I'm a beaver, Maverick. It's literally my whole thing." },
      { who: 'maverick', text: "Okay. Here's what we're going to do.", choices: [
        { label: "Let's build something together. Not in the river.", reply: [
          { who: 'bucktooth', text: "...You'd actually do that? With me?" },
          { who: 'maverick', text: "Yeah. But we're asking permission first. That's the whole thing I'm teaching you." },
          { who: 'bucktooth', text: "Permission. Right. Is that the paper with the stamps on it?" },
          { who: 'maverick', text: "Close enough. Bring the gnome." }
        ] },
        { label: "Next time, just ask me to hang out.", reply: [
          { who: 'bucktooth', text: "Deal. But I'm keeping the gnome." },
          { who: 'maverick', text: "Obviously you're keeping the gnome." },
          { who: 'bucktooth', text: "And the flamingo. The flamingo's mine now. We have a bond." }
        ] }
      ] },
      { who: 'narrator', text: "[The dam comes apart in one long, satisfying, very wet SHLOOMP.]" },
      { who: 'narrator', text: "[And the creek comes home.]" }
    ], function () { G.startEnding(); });
  }
};
