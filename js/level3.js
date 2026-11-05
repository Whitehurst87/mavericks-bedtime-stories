// level3.js - Episode Three: The Bitter-Lemonade Hustle
// Bucktooth is a sentient hand puppet in this one.

var SCENES3 = {

  stand: {
    title: 'CLOVIS TOWN SQUARE',
    spawn: { tx: 10, ty: 10, dir: 'down' },
    fill: 'grass',
    rects: [
      { x: 0, y: 0, w: 32, h: 1, t: 'tree' }, { x: 0, y: 17, w: 32, h: 1, t: 'tree' },
      { x: 0, y: 0, w: 1, h: 18, t: 'tree' }, { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
      { x: 1, y: 9, w: 30, h: 4, t: 'path' },
      { x: 6, y: 5, w: 1, h: 1, t: 'tree' }, { x: 24, y: 4, w: 1, h: 1, t: 'tree' },
      { x: 27, y: 13, w: 1, h: 1, t: 'tree' }, { x: 4, y: 14, w: 1, h: 1, t: 'tree' }
    ],
    solidKinds: ['tree'],
    entities: [
      { id: 'stand', who: null, tx: 9, ty: 7, kind: 'lemonade', solid: true, sw: 4, sh: 2 },
      { id: 'puppet', who: 'bucktooth_puppet', tx: 12, ty: 8, dir: 'down', talk: 'puppetStand', small: true },
      { id: 'bench1', who: null, tx: 20, ty: 5, kind: 'bench', solid: true },
      { id: 'lamp1', who: null, tx: 2, ty: 8, kind: 'lamp', solid: true }
    ]
  },

  rival: {
    title: 'THE SQUARE, LATER',
    spawn: { tx: 9, ty: 11, dir: 'right' },
    fill: 'grass',
    rects: [
      { x: 0, y: 0, w: 32, h: 1, t: 'tree' }, { x: 0, y: 17, w: 32, h: 1, t: 'tree' },
      { x: 0, y: 0, w: 1, h: 18, t: 'tree' }, { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
      { x: 1, y: 9, w: 30, h: 4, t: 'path' },
      { x: 6, y: 5, w: 1, h: 1, t: 'tree' }, { x: 27, y: 13, w: 1, h: 1, t: 'tree' },
      { x: 4, y: 14, w: 1, h: 1, t: 'tree' }
    ],
    solidKinds: ['tree'],
    entities: [
      { id: 'stand2', who: null, tx: 5, ty: 7, kind: 'lemonade', solid: true, sw: 4, sh: 2 },
      { id: 'puppet2', who: 'bucktooth_puppet', tx: 8, ty: 9, dir: 'down', talk: 'puppetRival', small: true },
      { id: 'picket', who: null, tx: 8, ty: 8, kind: 'picket' },
      { id: 'booth', who: null, tx: 20, ty: 6, kind: 'booth', solid: true, sw: 5, sh: 4 },
      { id: 'pitcher2', who: null, tx: 21, ty: 10, kind: 'pitcher', talk: 'rivalPitcher' },
      { id: 'kid1', who: null, tx: 18, ty: 11, kind: 'propeller', solid: true, talk: 'cartwheel' },
      { id: 'kid2', who: null, tx: 20, ty: 12, kind: 'propeller', solid: true, talk: 'cartwheel' },
      { id: 'kid3', who: null, tx: 22, ty: 11, kind: 'propeller', solid: true, talk: 'cartwheel' },
      { id: 'buckley1', who: 'buckley', tx: 14, ty: 11, dir: 'down', talk: 'buckleyAsk', hidden: true }
    ]
  },

  chase: {
    title: 'THE CHASE',
    spawn: { tx: 8, ty: 11, dir: 'right' },
    fill: 'grass',
    rects: [
      { x: 0, y: 0, w: 32, h: 1, t: 'tree' }, { x: 0, y: 17, w: 32, h: 1, t: 'tree' },
      { x: 0, y: 0, w: 1, h: 18, t: 'tree' }, { x: 31, y: 0, w: 1, h: 18, t: 'tree' },
      { x: 1, y: 9, w: 30, h: 4, t: 'path' },
      { x: 6, y: 4, w: 1, h: 1, t: 'tree' }, { x: 26, y: 4, w: 1, h: 1, t: 'tree' }
    ],
    solidKinds: ['tree'],
    entities: [
      { id: 'running', who: 'buckley', tx: 14, ty: 11, dir: 'right', run: true, talk: null },
      { id: 'whiskey', who: 'whiskey', tx: 26, ty: 12, dir: 'left', talk: 'whiskeyIdle' },
      { id: 'taffy', who: 'taffy', tx: 4, ty: 13, dir: 'right', talk: 'taffyWatch' },
      { id: 'ball', who: null, tx: 25, ty: 11, kind: 'ball' }
    ]
  },

  sewer: {
    title: 'A DARK SEWER',
    dark: 0.45,
    spawn: { tx: 8, ty: 11, dir: 'right' },
    fill: 'sewer',
    rects: [
      { x: 0, y: 0, w: 32, h: 2, t: 'sewerwall' },
      { x: 0, y: 0, w: 1, h: 18, t: 'sewerwall' }, { x: 31, y: 0, w: 1, h: 18, t: 'sewerwall' },
      { x: 0, y: 13, w: 32, h: 4, t: 'sewerwater' },
      { x: 4, y: 6, w: 2, h: 2, t: 'grate' }, { x: 25, y: 5, w: 2, h: 2, t: 'grate' }
    ],
    solidKinds: ['sewerwall'],
    entities: [
      { id: 'lost', who: 'buckley', tx: 18, ty: 10, dir: 'down', talk: 'buckleySewer', small: true }
    ]
  }
};

var SCRIPT3 = {

  intro3: function () {
    say([
      { who: 'narrator', text: "Maverick stands behind a wooden crate in the Clovis town square." },
      { who: 'narrator', text: "On the front, in crayon and professional drafting ink:" },
      { who: 'narrator', text: '"BUCKTOOTH & MAV\'S STRUCTURALLY SUPERIOR LEMONADE - $1.00 (NO REFUNDS FOR STRUCTURAL FAILURE)"' },
      { who: 'bucktooth_puppet', text: "Maverick! We have only made four dollars!" },
      { who: 'bucktooth_puppet', text: "At this rate we will not reclaim our ten billion dollars until the year 3402!" },
      { who: 'bucktooth_puppet', text: "We need to optimize our citrus-to-sugar ratio and increase our predatory marketing!" },
      { who: 'maverick', text: "We're doing fine, Professor. People like the homemade touch." },
      { who: 'narrator', text: "[Walk up to a customer and press E to serve. Eight dollars and we close up.]" }
    ]);
  },

  resume3: function () {
    if (G.sceneId === 'chase') G.beginChase();
  },

  puppetStand: function () {
    var n = G.flags.served || 0;
    if (n >= 8) {
      say([{ who: 'bucktooth_puppet', text: "Eight dollars! We are RICH adjacent!" }]);
      return;
    }
    say([
      { who: 'bucktooth_puppet', text: "Serve the customers, Maverick! The free market is a hungry beast and it wants LEMONADE." },
      { who: 'bucktooth_puppet', text: n === 0 ? "Also somebody has been staring at our sign for six minutes and I do not trust him." :
        "Only " + (8 - n) + " more dollars until we can afford a second pitcher. Growth!" }
    ]);
  },

  serve: function () {
    var e = G.talkTarget;
    if (!e || !e.customer) return;
    if (G.flags['sold_' + e.id]) {
      return say([{ who: 'narrator', text: "Already served. They are sipping it very slowly, the way people do when they are being polite." }]);
    }
    G.flags['sold_' + e.id] = true;
    G.ents = G.ents.filter(function (x) { return x.id !== e.id; });
    G.flags.served = (G.flags.served || 0) + 1;
    G.flags.dollars = (G.flags.dollars || 0) + 1;
    SFX.pickup();
    var lines = [{ who: 'narrator', text: e.serveLine || "One dollar. The cup is mostly ice. That is the business model." }];
    if (G.flags.served >= 8) {
      lines.push({ who: 'narrator', text: "For thirty minutes, business was booming." });
      lines.push({ who: 'narrator', text: "Then the line evaporated. All at once. Like someone had turned off a tap." });
      lines.push({ who: 'maverick', text: "...Where did everybody go?" });
      lines.push({ who: 'bucktooth_puppet', text: "Maverick. Look across the path. LOOK. AT. IT." });
    }
    say(lines, function () {
      if (G.flags.served >= 8 && !G.flags.sawRival) {
        G.flags.sawRival = true;
        G.toScene('rival', 9, 11, 'right');
      }
    });
  },

  puppetRival: function () {
    if (G.flags.bitrex) {
      return say([{ who: 'bucktooth_puppet', text: "The market has corrected itself, Maverick. Corrected HARD." }]);
    }
    if (!G.flags.sawBooth) {
      G.flags.sawBooth = true;
      say([
        { who: 'bucktooth_puppet', text: "A COMPETITOR?!" },
        { who: 'bucktooth_puppet', text: "This is an act of economic warfare! Look at those signs! They lack proper kerning!" },
        { who: 'bucktooth_puppet', text: "And those hats? They provide zero aerodynamic benefit! It is a foundational mockery of the refreshment industry!" },
        { who: 'narrator', text: "The Professor grabs a picket sign that says UNFAIR TO BEAVERS and begins scuttling in circles." },
        { who: 'bucktooth_puppet', text: "TYRANNY OF THE PROPELLER HAT! TYRANNY, I SAY!" },
        { who: 'narrator', text: "The crowd does not move. The crowd is buying spritzers." },
        { who: 'bucktooth_puppet', text: "Fine. FINE. Maverick! Distract them! I am deploying the Bitrex 5000!" },
        { who: 'maverick', text: "The what now." },
        { who: 'bucktooth_puppet', text: "The world's most bitter chemical. It is in my pocket. I have a pocket. Do not ask where the pocket is." },
        { who: 'narrator', text: "[Press E near the crowd to do a cartwheel. While they are watching you, get to the rival pitcher and press E again.]" }
      ], function () { G.flags.canCart = true; });
      return;
    }
    say([{ who: 'bucktooth_puppet', text: "Cartwheel! Cartwheel like the wind! I will handle the chemistry." }]);
  },

  cartwheel: function () {
    if (!G.flags.canCart) return;
    if (G.flags.bitrex) return;
    G.doCartwheel();
  },

  rivalPitcher: function () {
    if (G.flags.bitrex) {
      return say([{ who: 'narrator', text: "The rival pitcher is empty except for a residue that could strip paint off a boat." }]);
    }
    if (!G.flags.canCart) {
      return say([
        { who: 'narrator', text: "A kid in a propeller hat steps in front of you." },
        { who: 'narrator', text: '"Hey. No cutting the line. The line is me. I am the line."' }
      ]);
    }
    if (G.distracted()) {
      return say([
        { who: 'narrator', text: "The crowd is watching Maverick cartwheel. Nobody is watching the pitcher." },
        { who: 'bucktooth_puppet', text: "NOW! The Bitrex! All of it!" },
        { who: 'narrator', text: "Maverick tips the vial into the rival pitcher. It goes PLIP. It smells like a penny that has given up." },
        { who: 'narrator', text: "Seconds later, every kid in a spinny hat lets out a strangled yelp." },
        { who: 'narrator', text: "They make the face you make when you are trying to swallow a lemon-scented battery." },
        { who: 'bucktooth_puppet', text: "VICTORY! The market has corrected itself!" },
        { who: 'maverick', text: "...I feel like we should not be proud of that." },
        { who: 'bucktooth_puppet', text: "Too late. I am already proud. It is a structural pride." }
      ], function () {
        G.flags.bitrex = true;
        G.showBuckley();
      });
      return;
    }
    say([
      { who: 'narrator', text: "The pitcher is right there, but four kids in propeller hats are guarding it like it is a national monument." },
      { who: 'maverick', text: "I need a distraction. A big, embarrassing distraction." }
    ]);
  },

  buckleyAsk: function () {
    if (G.flags.money) {
      return say([{ who: 'buckley', text: "I'm going to rush home and tell my parents! You've changed my life!" }]);
    }
    say([
      { who: 'narrator', text: "A tiny, slow-moving turtle waddles up to the ruined stand. He looks at the empty jar of coins." },
      { who: 'narrator', text: "He lets out a tiny, heartbreaking sob." },
      { who: 'buckley', text: "Oh, no. We didn't make enough." },
      { who: 'buckley', text: "Now I'll never get my special glasses. I just want to be able to read my science books without my eyes feeling like they're full of sand." },
      { who: 'buckley', text: "I guess I'll just be a humble, illiterate turtle forever." },
      { who: 'narrator', text: "Maverick and the Professor feel a sudden, sharp pang of guilt." },
      { who: 'maverick', text: "Professor. He's a turtle who wants to read. We can't be responsible for a science-less turtle." },
      { who: 'bucktooth_puppet', text: "You're right, Maverick. Education is the foundation of a solid dam." },
      { who: 'bucktooth_puppet', text: "Here, little one!" },
      { who: 'narrator', text: "Maverick reaches into their earnings and hands Buckley the remaining difference for his glasses." },
      { who: 'maverick', text: "Go on, Buckley. Get those specs. For science." },
      { who: 'buckley', text: "Oh, thank you! I'm going to rush home and tell my parents! You've changed my life!" }
    ], function () {
      G.flags.money = true;
      G.flags.buckleyRuns = true;
      G.ents = G.ents.filter(function (x) { return x.id !== 'buckley1'; });
      G.buckleyReads();
    });
  },

  buckleyCaught: function () {
    say([
      { who: 'maverick', text: "You read that sign! From FIFTY FEET!" },
      { who: 'buckley', text: "Vision is a spectrum, Maverick." },
      { who: 'maverick', text: "You don't have a SPECTRUM. You have PERFECT VISION and a little green hat of LIES." },
      { who: 'bucktooth_puppet', text: "The little scoundrel! His vision is structurally perfect! He played us for fools!" },
      { who: 'bucktooth_puppet', text: "He's a tactical hustler in a green shell!" },
      { who: 'maverick', text: "Hey! Get back here!" },
      { who: 'narrator', text: "Buckley bolts. Bucktooth flops along on Maverick's hand, squeaking with rage." },
      { who: 'narrator', text: "Maverick grabs the back of that little green shell." }
    ], function () { SCRIPT.whiskeyKick(); });
  },

  whiskeyIdle: function () {
    say([
      { who: 'whiskey', text: "Yo, monkes. Watch this legendary goal." },
      { who: 'narrator', text: "He is looking at a point roughly four feet to the left of the ball." }
    ]);
  },

  taffyWatch: function () {
    say([
      { who: 'taffy', text: "I have been watching this lemonade situation for an hour and it is the best television I have ever seen." },
      { who: 'taffy', text: "Also I sold that kid the propeller hats. Business is business." },
      { who: 'narrator', text: "Taffy Stamburger takes another bite of his taco and does not elaborate." }
    ]);
  },

  whiskeyKick: function () {
    say([
      { who: 'narrator', text: "A stray soccer ball rolls across the path and stops at a pair of sneakers." },
      { who: 'whiskey', text: "Yo, monkes! Watch this legendary goal!" },
      { who: 'narrator', text: "Cheap Whiskey winds up for a massive kick. His eyes are unfocused. He misses the ball entirely." },
      { who: 'narrator', text: "His sneaker connects squarely with the back of Buckley's shell." },
      { who: 'narrator', text: "THWACK." },
      { who: 'narrator', text: "The turtle is launched like a leafy-green frisbee, soaring across the park and vanishing over the horizon." },
      { who: 'buckley', text: "I REGRET NOTHING!" },
      { who: 'whiskey', text: "Whoops. Sorry, Mav. I had too much of Taffy's Hyper-Lemonade earlier." },
      { who: 'whiskey', text: "My depth perception is currently vibrating at a frequency I don't recognize. Why is that turtle in the air?" },
      { who: 'bucktooth_puppet', text: "He was a hustler, Whiskey! You just delivered a swift, uncoordinated strike of Beaver Justice!" },
      { who: 'whiskey', text: "I'll take it." },
      { who: 'narrator', text: "He falls over backwards into a bed of petunias and stays there." },
      { who: 'narrator', text: "They all had a big laugh. They were still nine billion, nine hundred ninety-nine million, nine hundred ninety-nine thousand, nine hundred ninety-six dollars short." },
      { who: 'maverick', text: "Same time tomorrow?" },
      { who: 'bucktooth_puppet', text: "Structurally speaking? Absolutely." }
    ], function () { G.sewerEnding(); });
  },

  buckleySewer: function () {
    say([
      { who: 'narrator', text: "Meanwhile, in a dark sewer at the edge of town, a very dizzy turtle looked around." },
      { who: 'buckley', text: "Hello? It's very damp here." },
      { who: 'buckley', text: "And I think I lost my science money." },
      { who: 'buckley', text: "Is there anyone here with a structural understanding of exits?!" },
      { who: 'narrator', text: "There is not. There is a pipe, and a smell, and one very committed puddle." },
      { who: 'maverick', text: "We should probably go get him." },
      { who: 'bucktooth_puppet', text: "Eventually. He's got a whole sewer to explore. That's basically a science book." }
    ], function () {
      G.creditsKind = 'lemonade';
      enterCredits('lemonade');
      G.fade = 0; G.fadeTarget = 0;
      SFX.fanfare();
    });
  }
};

// eight park visitors queued up for lemonade
(function buildCustomers() {
  var queue = [
    { tx: 7,  who: 'mayor',   line: "The mayor buys one and tips with a campaign button. 'For the war chest,' he says." },
    { tx: 9,  who: 'nutkin',  line: "Postmaster Nutkin drinks it in one go and immediately regrets the ice." },
    { tx: 11, who: 'shellby', line: "Old Man Shellby takes a sip. He will finish it on Thursday." },
    { tx: 13, who: 'kevin',   line: "Kevin is a duck. Kevin was always going to buy lemonade. Kevin has no money. Kevin pays in pebbles.", small: true },
    { tx: 15, who: 'gnome',   line: "The lawn gnome pays with a nickel he has been guarding since 1987. He asks for no ice. He is ceramic." },
    { tx: 17, who: 'clerk',   line: "The grocery clerk buys two. 'I'm not drinking them,' he says. 'I'm documenting them.'" },
    { tx: 19, who: 'adrian',  line: "Adrian buys one and immediately tries to pour it into a bottle rocket. It does not go well." },
    { tx: 21, who: 'whiskey', line: "Cheap Whiskey buys one, misses his own mouth twice, and gives a thumbs up anyway." }
  ];
  queue.forEach(function (c, i) {
    SCENES3.stand.entities.push({
      id: 'cust' + i, who: c.who, tx: c.tx, ty: 11, dir: 'up',
      customer: true, talk: 'serve', serveLine: c.line, small: c.small || false
    });
  });
})();

Object.keys(SCENES3).forEach(function (k) { SCENES[k] = SCENES3[k]; });
Object.keys(SCRIPT3).forEach(function (k) { SCRIPT[k] = SCRIPT3[k]; });
