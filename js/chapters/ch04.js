// ch04.js - Chapter 4: The Beaver's Guide to Questionable Fun
//
// The same afternoon as chapter three, told as a how-to guide. The mechanic is
// the guide itself: Bucktooth demonstrates a sequence of dance moves, and you
// repeat it back. Three rounds, each one longer, then the doorbell.
//
// Locations come from part1.js (p_river1, p_wallaby).

var CH4 = {
  need: 3,
  seq: [],
  idx: 0,
  round: 0,
  showing: false,
  showT: 0,
  showIdx: 0
};

var CH4_KEY = { arrowleft: 'heel', a: 'heel', arrowright: 'toe', d: 'toe', arrowdown: 'spin', s: 'spin' };
var CH4_GLYPH = { heel: '\u25C0', toe: '\u25B6', spin: '\u25BC' };
var CH4_WORD = { heel: 'HEEL', toe: 'TOE TAP', spin: 'SPIN' };

function ch4StartRound() {
  CH4.seq = [];
  var moves = ['heel', 'toe', 'spin'];
  for (var i = 0; i < 2 + CH4.round; i++) {
    CH4.seq.push(moves[Math.floor(Math.random() * 3)]);
  }
  CH4.idx = 0;
  CH4.showIdx = -1;
  CH4.showT = 0.8;
  CH4.showing = true;
  G.flags.ch4_seq = CH4.seq.slice();
  G.flags.ch4_round = CH4.round;
  G.perform = true;
  G.flags.ch4_taking = false;
  saveGame();
}

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch4' || !CH4.showing) return;
  CH4.showT -= dt;
  if (CH4.showT > 0) return;
  CH4.showIdx++;
  if (CH4.showIdx >= CH4.seq.length) {
    CH4.showing = false;
    G.flags.ch4_taking = true;
    toast('your turn');
    return;
  }
  CH4.showT = 0.65;
  var m = CH4.seq[CH4.showIdx];
  SFX.blip(m === 'heel' ? 520 : m === 'toe' ? 620 : 720, 0.06);
});

KEY_HOOKS.push(function (k) {
  if (G.level !== 'ch4' || G.mode !== 'play') return false;
  if (!G.flags.ch4_taking || CH4.showing || DLG.active) return false;
  var move = CH4_KEY[k];
  if (!move) return false;
  var want = CH4.seq[CH4.idx];
  if (move === want) {
    CH4.idx++;
    SFX.blip(600 + CH4.idx * 40, 0.05);
    FX.burst(G.px, G.py - 4, '#8fd0f0', 8, { speed: 40, life: 0.4, lift: 24 });
    if (CH4.idx >= CH4.seq.length) ch4RoundDone();
  } else {
    CH4.idx = 0;
    CH4.wrongs = (CH4.wrongs || 0) + 1;
    SFX.tone(150, 0.1, 'square', 0.05);
    FX.pop(G.px, G.py - 24, 'WRONG', '#e8607a');
    toast('wrong move, start the sequence again');
  }
  return true;
});

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch4' || (!CH4.showing && !G.flags.ch4_taking) || DLG.active) return;
  var n = CH4.seq.length;
  var bw = 24 + n * 34, bx = (W - bw) / 2, by = H - 52;
  c.fillStyle = 'rgba(18,16,28,0.88)';
  c.fillRect(bx, by, bw, 40);
  c.strokeStyle = 'rgba(244,228,192,0.45)';
  c.lineWidth = 1;
  c.strokeRect(bx + 0.5, by + 0.5, bw - 1, 39);
  c.textAlign = 'center';
  c.font = 'bold 6px monospace';
  c.fillStyle = CH4.showing ? '#f0c060' : '#a8d0a0';
  c.fillText(CH4.showing ? 'WATCH' : 'YOUR TURN', W / 2, by - 5);
  for (var i = 0; i < n; i++) {
    var gx = bx + 12 + i * 34;
    var active = CH4.showing ? (i === CH4.showIdx) : (i < CH4.idx);
    c.fillStyle = active ? 'rgba(240,192,96,0.85)' : 'rgba(200,190,170,0.18)';
    c.fillRect(gx, by + 6, 28, 20);
    c.fillStyle = active ? '#1a1420' : 'rgba(240,230,200,0.5)';
    c.font = 'bold 13px monospace';
    c.fillText(CH4_GLYPH[CH4.seq[i]], gx + 14, by + 22);
    c.font = '5px monospace';
    c.fillStyle = active ? '#5a4a20' : 'rgba(200,190,170,0.35)';
    c.fillText(CH4_WORD[CH4.seq[i]], gx + 14, by + 33);
  }
  c.textAlign = 'left';
});

function ch4RoundDone() {
  CH4.round++;
  G.flags.ch4_round = CH4.round;
  G.flags.ch4_taking = false;
  G.perform = false;
  SFX.fanfare();
  if (CH4.round >= CH4.need) {
    ch4DanceDone();
    return;
  }
  // hand the next round to the tick loop rather than a timer, so an open
  // dialogue can never swallow it
  G.flags.ch4_nextRound = true;
  toast('round ' + (CH4.round + 1) + ' of ' + CH4.need);
}

TICK_HOOKS.push(function () {
  if (G.level !== 'ch4' || !G.flags.ch4_nextRound) return;
  if (DLG.active || CH4.showing || G.flags.ch4_taking) return;
  G.flags.ch4_nextRound = false;
  ch4StartRound();
});

function ch4DanceDone() {
  G.flags.ch4_stage = 2;
  G.flags.mischief = 2;
  saveGame();
  say([
    { who: 'bucktooth', text: 'Triumph! A moderate success! Your arms stayed stiff for almost the whole thing.' },
    { who: 'maverick', text: 'My feet are suing me for emotional distress.' },
    { who: 'bucktooth', text: 'Now for the next evolution of fun. A highly sophisticated urban maneuver.' },
    { who: 'bucktooth', text: 'THE DOORBELL DITCH.' },
    { who: 'maverick', text: 'Isn\'t that, like, frowned upon by society?' },
    { who: 'bucktooth', text: 'Frowning is the sign of a poor getaway driver!' },
    { who: 'narrator', text: '[The pastel green house is east. Ring the bell, then dive behind the ROSEBUSH before the door opens.]' }
  ]);
}

function ch4Buck() {
  if (G.flags.ch4_stage === undefined) {
    G.flags.ch4_stage = 0;
    say([
      { who: 'bucktooth', text: 'Ah! A pupil. Excellent. Today, the guide.' },
      { who: 'maverick', text: 'The guide to what?' },
      { who: 'bucktooth', text: 'The single most furious, high-velocity form of foot-tapping known to hydro-fauna: IRISH RIVER DANCING.' },
      { who: 'maverick', text: 'It just looks like you are angry at the water, sir.' },
      { who: 'bucktooth', text: 'Nonsense! It is precision! It is PASSION! Arms stiff, expression serious, and you repeat exactly what I do.' },
      { who: 'bucktooth', text: 'Heel. Toe tap. Spin. Watch me, then do it back: left arrow, right arrow, down arrow.' }
    ], function () {
      G.flags.ch4_stage = 1;
      CH4.round = 0;
      ch4StartRound();
    });
    return;
  }
  if (G.flags.ch4_stage === 1) {
    say([{ who: 'bucktooth', text: 'Repeat the sequence. Left is heel, right is toe, down is spin. It is a very simple guide.' }]);
    return;
  }
  if (G.flags.ch4_stage === 2) {
    say([{ who: 'bucktooth', text: 'The house is east. Remember: bell first, then bush. The rosebush has thorns. Consider it a lesson.' }]);
    return;
  }
  say([{ who: 'bucktooth', text: 'The jetpack is fuelled. This is a good day.' }]);
}

function ch4Door() {
  if (G.flags.ch4_stage !== 2) {
    if (G.flags.ch4_stage === 1) {
      say([{ who: 'narrator', text: 'Finish the lesson first. Bucktooth is watching and he takes attendance.' }]);
      return;
    }
    say([{ who: 'narrator', text: 'Mrs. Wallaby\'s front door. Aggressively pastel, as advertised.' }]);
    return;
  }
  if (G.flags.doorRung) {
    say([{ who: 'narrator', text: 'Already rung. Get behind the rosebush.' }]);
    return;
  }
  G.flags.doorRung = true;
  G.flags.hidden = false;
  saveGame();
  SFX.blip(880, 0.1);
  say([
    { who: 'narrator', text: 'DING DONG.' },
    { who: 'maverick', text: 'That was louder than I expected. Everything is louder than I expected.' }
  ], function () {
    G.flags.doorT = 3.4;
  });
}

function ch4Hide(which) {
  if (!G.flags.doorRung) {
    say([{ who: 'narrator', text: 'A bush. Later it will be useful. Right now it is just a bush.' }]);
    return;
  }
  if (which === 'rose') {
    say([{ who: 'narrator', text: 'You and a beaver fold yourselves behind the rosebush. The roses are not thrilled.' }]);
  } else {
    say([{ who: 'narrator', text: 'The hedge works too. Hiding is hiding, and the guide did not specify.' }]);
  }
  G.flags.hidden = true;
  saveGame();
}

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch4' || !G.flags.doorT) return;
  G.flags.doorT -= dt;
  if (G.flags.doorT > 0) return;
  G.flags.doorT = 0;
  G.flags.seen_wallaby = true;
  if (G.sceneId === 'p_wallaby') buildScene('p_wallaby');
  if (G.flags.hidden) ch4Caught(true); else ch4Caught(false);
});

function ch4Caught(hidden) {
  if (!hidden) {
    G.flags.doorRung = false;
    G.flags.hidden = false;
    saveGame();
    say([
      { who: 'narrator', text: 'The door opens while you are still on the lawn, at a full sprint, extremely visible.' },
      { who: 'wallaby', text: 'You are not even TRYING to hide, Maverick.' },
      { who: 'maverick', text: 'In my defence, the guide did not cover this part.' },
      { who: 'wallaby', text: 'The rosebush, dear. It is right there.' }
    ]);
    return;
  }
  G.flags.ch4_stage = 3;
  saveGame();
  say([
    { who: 'narrator', text: 'Mrs. Wallaby steps out, hands on hips, and addresses the sky.' },
    { who: 'wallaby', text: 'I know you are out there! May your shoes always be filled with sand and all your cereal bowls be slightly chipped!' },
    { who: 'wallaby', text: 'And may your television remote always be just out of reach!' },
    { who: 'narrator', text: 'Two shapes behind the rosebush shake with silent laughter.' },
    { who: 'bucktooth', text: 'Magnificent. Now, the grand finale. A squirrel with a very large drill is staging a minor financial heist tonight.' },
    { who: 'maverick', text: 'We went from polite, albeit wet, tap shoes to grand larceny in thirty minutes! What is wrong with you?' },
    { who: 'bucktooth', text: 'It is a soft target! Mostly old tax forms and biscuits!' },
    { who: 'maverick', text: 'Why are the activities getting progressively worse? Why are you being a bad influence?', choices: [
      { label: 'You are being a bad influence.', reply: [
        { who: 'bucktooth', text: 'I am an ecosystem engineer with a post-Meat Mountain crash. I am not a certified youth counsellor!' }
      ] },
      { label: 'I am asking a beaver for moral guidance.', reply: [
        { who: 'bucktooth', text: 'Yes! You are! Why are YOU, a child, relying on a beaver for moral fun?' },
        { who: 'maverick', text: 'That is a fair question and I hate it.' }
      ] }
    ] },
    { who: 'bucktooth', text: 'Here. Knock yourself out. This requires focus. It is highly stabilizing.' }
  ], function () {
    SFX.blast();
    say([
      { who: 'narrator', text: 'He hurled a heavy navy blue Sudoku book at Mav\'s chest, strapped on an enormous chrome jetpack, and soared into the sky.' },
      { who: 'bucktooth', text: 'GOOD LUCK WITH THE SQUIRREL GUY!' },
      { who: 'narrator', text: 'Mav stood in the mud with the book, shook his head, laughed, and walked home with it.' }
    ], function () {
      var w = CH4.wrongs || 0;
      var label = w === 0 ? 'FLAWLESS, no wrong moves' : w + (w === 1 ? ' wrong move' : ' wrong moves');
      cleared(4, Math.max(40, 100 - w * 15), label);
    });
  });
}

CHAPTER_CONTENT[4] = {
  start: 'p_river1',

  intro: function () {
    chapterCard('CHAPTER FOUR', 'The Beaver\'s Guide to Questionable Fun', 3.2);
    setTimeout(function () {
      if (G.level !== 'ch4') return;
      G.flags.ch4_stage = undefined;
      G.flags.mischief = 0;
      CH4.round = 0;
      CH4.showing = false;
      G.perform = false;
      say([
        { who: 'narrator', text: 'Chapter four. The same afternoon, told properly, as a guide, with diagrams.' }
      ]);
    }, 900);
  },

  resume: function () {
    G.perform = false;
    CH4.showing = false;
  },

  objective: function () {
    if (G.flags.ch4_stage === 1) return 'objective: repeat the dance (' + (G.flags.ch4_round || 0) + '/3 rounds)';
    if (G.flags.ch4_stage === 2 && !G.flags.doorRung) return 'objective: ring the bell at the house, east';
    if (G.flags.ch4_stage === 2 && G.flags.doorRung && !G.flags.hidden) return 'objective: dive behind the rosebush';
    if (G.flags.ch4_stage === 2 && G.flags.hidden) return 'objective: stay down';
    if (!G.flags.ch4_stage) return 'objective: talk to Bucktooth';
    return '';
  }
};
