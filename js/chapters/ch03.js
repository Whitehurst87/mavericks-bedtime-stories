// ch03.js - Chapter 3: Mav and the Beaver's Bad Influences
//
// Three stages, each worse than the last, which is the entire joke:
//   1. riverdance   tap E on the beat, eight times
//   2. doorbell     ring the bell, then get behind a bush before the door opens
//   3. the heist    refuse, out loud, with feeling
//
// Locations come from part1.js (p_river1, p_wallaby).

var CH3 = { marker: 0, sweet: [0.40, 0.70], need: 8 };

// --------------------------------------------------------------- the dance

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch3' || G.flags.ch3_stage !== 1 || DLG.active) return;
  CH3.marker = (CH3.marker + dt * 0.62) % 1;
});

ACTION_HOOKS.push(function () {
  if (G.level !== 'ch3') return false;
  if (G.flags.ch3_stage !== 1 || DLG.active) return false;
  var m = CH3.marker;
  if (m > CH3.sweet[0] && m < CH3.sweet[1]) {
    G.flags.dance = (G.flags.dance || 0) + 1;
    SFX.blip(680 + G.flags.dance * 30, 0.05);
    FX.burst(G.px, G.py - 4, '#9be08a', 10, { speed: 45, life: 0.45, lift: 26 });
    if (G.flags.dance >= CH3.need) {
      CH3.marker = 0;
      ch3DanceDone();
      return true;
    }
    if (G.flags.dance % 4 === 0) FX.pop(G.px, G.py - 26, 'ON THE BEAT', '#c8f0a0');
    CH3.marker = 0;                     // a hit starts the next bar
    return true;
  } else {
    // a miss must not reset the beat, or tapping early locks you out forever
    CH3.misses = (CH3.misses || 0) + 1;
    SFX.tone(150, 0.08, 'square', 0.04);
    FX.pop(G.px, G.py - 22, 'OFF', '#e8607a');
    toast('off the beat');
  }
  return true;
});

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch3' || G.flags.ch3_stage !== 1 || DLG.active) return;
  var bw = 220, bh = 12, bx = (W - bw) / 2, by = H - 34;
  c.fillStyle = 'rgba(18,16,28,0.88)';
  c.fillRect(bx - 3, by - 3, bw + 6, bh + 6);
  c.fillStyle = '#2a2438';
  c.fillRect(bx, by, bw, bh);
  // the sweet spot
  c.fillStyle = 'rgba(120,200,140,0.45)';
  c.fillRect(bx + bw * CH3.sweet[0], by, bw * (CH3.sweet[1] - CH3.sweet[0]), bh);
  // the beat marker
  var mx = bx + bw * Math.min(1, CH3.marker);
  c.fillStyle = '#fff3c4';
  c.fillRect(mx - 1, by - 2, 3, bh + 4);
  c.strokeStyle = 'rgba(244,228,192,0.5)';
  c.lineWidth = 1;
  c.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
  c.textAlign = 'center';
  c.font = 'bold 7px monospace';
  c.fillStyle = '#f4efe4';
  c.fillText('RIVERDANCE  ' + (G.flags.dance || 0) + '/' + CH3.need + '   TAP E ON THE GREEN', W / 2, by - 7);
  c.textAlign = 'left';
});

// ---------------------------------------------------------------- mischief

function ch3Mischief(n) {
  G.flags.mischief = Math.max(G.flags.mischief || 0, n);
  saveGame();
}

HUD_HOOKS.push(function (c) {
  if (G.level !== 'ch3' || G.flags.ch3_stage === 1) return;
  var n = G.flags.mischief || 0;
  var x = W - 78, y = 6;
  c.fillStyle = 'rgba(18,16,28,0.6)';
  c.fillRect(x - 4, y - 1, 74, 13);
  c.font = '6px monospace';
  c.fillStyle = 'rgba(240,224,180,0.75)';
  c.fillText('MISCHIEF', x, y + 8);
  for (var i = 0; i < 3; i++) {
    c.fillStyle = i < n ? '#e06050' : 'rgba(200,190,170,0.25)';
    c.fillRect(x + 38 + i * 8, y + 3, 6, 6);
  }
});

// --------------------------------------------------------------- chapter

function ch3Buck() {
  if (G.flags.ch3_stage === undefined) {
    G.flags.ch3_stage = 0;
    say([
      { who: 'bucktooth', text: 'Do not talk to me while I am polishing. It is a whole activity.' },
      { who: 'maverick', text: 'My screen time got cancelled. All of it. Phone, tablet, watch.' },
      { who: 'bucktooth', text: 'Ah. Maintenance. The grown-up word.' },
      { who: 'maverick', text: 'I need entertainment. You owe me. What do wild animals do for fun?', choices: [
        { label: 'What do wild animals do for fun?', reply: [
          { who: 'bucktooth', text: 'Since we are near the river, we must perform the most ancient and highly aggressive form of water-based fun known to the beaver folk.' },
          { who: 'bucktooth', text: 'IRISH RIVER DANCING.' }
        ] },
        { label: 'Please do not say something weird.', reply: [
          { who: 'bucktooth', text: 'IRISH RIVER DANCING.' },
          { who: 'maverick', text: 'That is exactly the amount of weird I expected.' }
        ] }
      ] },
      { who: 'narrator', text: 'He pulled a tiny pair of hard-soled shoes out of his vest and strapped them to his webbed feet with intense focus.' },
      { who: 'bucktooth', text: 'Arms stiff! Expression serious! Tap when the beat is green, boy. Eight taps and you are a dancer.' }
    ], function () {
      G.flags.ch3_stage = 1;
      G.flags.dance = 0;
      G.perform = true;
      CH3.marker = 0;
      saveGame();
    });
    return;
  }
  if (G.flags.ch3_stage === 1) {
    say([{ who: 'bucktooth', text: 'TAP! Green zone! Your feet are having a crisis of confidence.' }]);
    return;
  }
  if (G.flags.ch3_stage === 2) {
    say([{ who: 'bucktooth', text: 'The doorbell is that way. East. Try to look innocent, which for you is a stretch.' }]);
    return;
  }
  say([{ who: 'bucktooth', text: 'The jetpack is loaded. The Sudoku is heavy. Do not do anything I would do.' }]);
}

function ch3DanceDone() {
  G.perform = false;
  ch3Mischief(1);
  SFX.fanfare();
  G.flags.ch3_stage = 2;
  saveGame();
  say([
    { who: 'bucktooth', text: 'Triumph! A moderate success! Your feet have stopped suing you?' },
    { who: 'maverick', text: 'They are considering it.' },
    { who: 'bucktooth', text: 'Excellent. Now for the next evolution of fun. A highly sophisticated urban maneuver.' },
    { who: 'bucktooth', text: 'DOORBELL DITCH.' },
    { who: 'maverick', text: 'Isn\'t that, like, bad?' },
    { who: 'bucktooth', text: 'Only if you get caught, which is why we must run like tiny, panicked cheetahs.' },
    { who: 'narrator', text: '[The pastel green house is east. Ring the bell, then get behind a bush before the door opens.]' }
  ]);
}

function ch3Door() {
  if (G.flags.ch3_stage !== 2) {
    if (G.flags.ch3_stage === 1) {
      say([{ who: 'narrator', text: 'The house is not going anywhere. Neither is the dance. Finish the dance.' }]);
      return;
    }
    say([{ who: 'narrator', text: 'Mrs. Wallaby\'s house. The bell looks extremely ringable and the mat says GO AWAY in friendly letters.' }]);
    return;
  }
  if (G.flags.doorRung) {
    say([{ who: 'narrator', text: 'You already rang it. The dash is the whole point. RUN.' }]);
    return;
  }
  G.flags.doorRung = true;
  G.flags.hidden = false;
  saveGame();
  SFX.blip(880, 0.1);
  say([
    { who: 'narrator', text: 'DING DONG.' },
    { who: 'maverick', text: 'Okay okay okay GO.' }
  ], function () {
    // three seconds to get behind something
    G.flags.doorT = 3.4;
  });
}

function ch3Hide(which) {
  if (!G.flags.doorRung) {
    say([{ who: 'narrator', text: 'A perfectly good bush. Nothing to hide from yet.' }]);
    return;
  }
  if (which !== 'hedge') {
    say([{ who: 'narrator', text: 'The rosebush has thorns. You are behind it anyway. Hiding is hiding.' }]);
  } else {
    say([{ who: 'narrator', text: 'You and a beaver compress yourselves behind the hedge. The hedge is doing most of the work.' }]);
  }
  G.flags.hidden = true;
  saveGame();
}

TICK_HOOKS.push(function (dt) {
  if (G.level !== 'ch3' || !G.flags.doorT) return;
  G.flags.doorT -= dt;
  if (G.flags.doorT > 0) return;
  G.flags.doorT = 0;
  // the door opens
  G.flags.seen_wallaby = true;
  if (G.sceneId === 'p_wallaby') buildScene('p_wallaby');
  if (G.flags.hidden) ch3Caught(true); else ch3Caught(false);
});

function ch3Caught(hidden) {
  if (hidden) {
    ch3Mischief(2);
    G.flags.ch3_stage = 3;
    saveGame();
    say([
      { who: 'narrator', text: 'The door flies open. Mrs. Wallaby steps onto the porch with her hands on her hips.' },
      { who: 'wallaby', text: 'I KNOW you are out there, you rascals!' },
      { who: 'wallaby', text: 'May your shoes always be filled with sand, and your trousers always stick to your legs, and your cereal bowls be slightly chipped!' },
      { who: 'narrator', text: 'Behind the hedge, two shapes shake silently with the effort of not laughing.' },
      { who: 'narrator', text: 'The door closes. Somewhere behind you, a beaver dusts off his vest.' },
      { who: 'bucktooth', text: 'Magnificent! Now, the grand finale.' },
      { who: 'bucktooth', text: 'I know a guy. A squirrel with a very large drill. He is looking to stage a minor financial heist tonight.' },
      { who: 'maverick', text: 'WHOA. WHOA. Enough! Riverdancing was weird. Ringing the bell was questionable. A HEIST?' },
      { who: 'maverick', text: 'The activities are getting progressively worse!', choices: [
        { label: 'I am not doing a heist.', reply: [
          { who: 'bucktooth', text: 'It is a soft target! Mostly old tax forms and biscuits!' },
          { who: 'maverick', text: 'I am not doing a heist.' }
        ] },
        { label: 'Why are you like this?', reply: [
          { who: 'bucktooth', text: 'You asked a wild animal to entertain you for a day! What did you expect, a nice game of checkers?!' },
          { who: 'maverick', text: 'Honestly? Yes. A little.' }
        ] }
      ] },
      { who: 'bucktooth', text: 'This was not my idea. Little boys should not be relying on wild, tweed-wearing animals for moral guidance or amusement.' },
      { who: 'narrator', text: 'He reached behind the log and pulled out a heavy navy blue Sudoku puzzle book and a truly enormous jetpack.' },
      { who: 'bucktooth', text: 'Here! Knock yourself out, you tiny hooligan! Try a moderate puzzle. It requires focus!' }
    ], ch3Ending);
  } else {
    G.flags.doorRung = false;
    G.flags.hidden = false;
    saveGame();
    say([
      { who: 'narrator', text: 'The door opens while you are still in the middle of the lawn, mid-run, arms out, extremely visible.' },
      { who: 'wallaby', text: 'I can SEE you, Maverick. I have always been able to see you.' },
      { who: 'maverick', text: '...Hi, Mrs. Wallaby.' },
      { who: 'wallaby', text: 'If you are going to ring my bell, you had better be behind that hedge before the door opens. Run it again. Properly.' },
      { who: 'narrator', text: 'She closes the door. The bell can be rung again.' }
    ]);
  }
}

function ch3Ending() {
  G.flags.ch3_stage = 4;
  SFX.blast();
  say([
    { who: 'narrator', text: 'With a loud WHOOSH, the beaver strapped on the jetpack and soared into the sky, tweed vest flapping.' },
    { who: 'bucktooth', text: 'TELL NO ONE ABOUT THE SQUIRREL GUY!' },
    { who: 'narrator', text: 'Mav stood in the mud holding a Sudoku book, shook his head, laughed, and walked home with it.' }
  ], function () {
    var misses = CH3.misses || 0;
    var label = misses === 0 ? 'PERFECT SET, no misses' : CH3.need + ' beats, ' + misses + ' off beat';
    cleared(3, Math.max(40, 100 - misses * 8), label);
  });
}

CHAPTER_CONTENT[3] = {
  start: 'p_river1',

  intro: function () {
    chapterCard('CHAPTER THREE', "The Beaver's Bad Influences", 3.2);
    setTimeout(function () {
      if (G.level !== 'ch3') return;
      G.flags.dance = 0;
      G.flags.mischief = 0;
      G.flags.ch3_stage = undefined;
      G.perform = false;
      say([
        { who: 'narrator', text: 'Chapter three. In which a bored boy asks a wild animal for entertainment, and gets exactly what he asked for.' }
      ]);
    }, 900);
  },

  resume: function () {
    G.perform = false;
  },

  objective: function () {
    if (G.flags.ch3_stage === 1) return 'objective: tap E on the green (' + (G.flags.dance || 0) + '/8)';
    if (G.flags.ch3_stage === 2 && !G.flags.doorRung) return 'objective: ring the bell at the house, east';
    if (G.flags.ch3_stage === 2 && G.flags.doorRung && !G.flags.hidden) return 'objective: GET BEHIND A BUSH';
    if (G.flags.ch3_stage === 2 && G.flags.hidden) return 'objective: stay hidden';
    if (G.flags.ch3_stage === 3) return 'objective: say no to the heist';
    if (!G.flags.ch3_stage) return 'objective: talk to Bucktooth';
    return '';
  }
};
