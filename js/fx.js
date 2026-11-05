// fx.js - juice. Particles, floating score pops, and the end of chapter card.
//
// Everything here is optional: a chapter that never calls FX still plays. The
// entry point chapters use is cleared(n, score, label), which records the
// score, throws confetti, shows the result card and then hands back to the
// book after a beat.
//
// Draw paths:
//   world space   FX.drawWorld(ctx)  one call from the engine, after entities
//   screen space  HUD_HOOKS          the result card, over the play view

var FX = {
  parts: [],
  pops: [],
  MAX: 260,

  // a spray of square pixels at a world position
  burst: function (x, y, colour, n, opts) {
    opts = opts || {};
    var count = Math.min(n || 14, this.MAX - this.parts.length);
    for (var i = 0; i < count; i++) {
      var a = opts.angle === undefined ? Math.random() * Math.PI * 2 : opts.angle + (Math.random() - 0.5) * (opts.spread || 1.2);
      var sp = (opts.speed || 40) * (0.35 + Math.random() * 0.9);
      var life = (opts.life || 0.55) * (0.6 + Math.random() * 0.7);
      this.parts.push({
        x: x, y: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - (opts.lift || 18),
        g: opts.g === undefined ? 90 : opts.g,
        life: life, max: life,
        c: colour,
        s: opts.size || (Math.random() < 0.3 ? 2 : 1)
      });
    }
  },

  // confetti: a wide burst of party colours, used when a chapter is cleared
  confetti: function (x, y) {
    var cols = ['#f0c060', '#e8607a', '#68c8e8', '#9be08a', '#fff0c0', '#c89af0'];
    for (var i = 0; i < 6; i++) {
      this.burst(x + (Math.random() - 0.5) * 60, y - 10, cols[i], 9, {
        speed: 70, life: 1.1, lift: 55, g: 120, size: 2
      });
    }
  },

  // a word that floats up and fades: "+1 LOG", "NICE", "PERFECT"
  pop: function (x, y, text, colour) {
    this.pops.push({ x: x, y: y, text: text, c: colour || '#f6ecd8', life: 1.0, max: 1.0 });
  },

  tick: function (dt) {
    for (var i = this.parts.length - 1; i >= 0; i--) {
      var p = this.parts[i];
      p.life -= dt;
      if (p.life <= 0) { this.parts.splice(i, 1); continue; }
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    for (var j = this.pops.length - 1; j >= 0; j--) {
      var q = this.pops[j];
      q.life -= dt;
      if (q.life <= 0) { this.pops.splice(j, 1); continue; }
      q.y -= 14 * dt;
    }
    if (RESULT.active) {
      RESULT.t -= dt;
      if (RESULT.t <= 0) RESULT.active = false;
    }
  },

  drawWorld: function (c) {
    for (var i = 0; i < this.parts.length; i++) {
      var p = this.parts[i];
      var a = Math.max(0, Math.min(1, p.life / p.max));
      c.globalAlpha = a;
      c.fillStyle = p.c;
      c.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
    }
    c.globalAlpha = 1;
    for (var j = 0; j < this.pops.length; j++) {
      var q = this.pops[j];
      var b = Math.max(0, Math.min(1, q.life / q.max));
      c.globalAlpha = b;
      c.font = 'bold 8px monospace';
      c.textAlign = 'center';
      c.fillStyle = '#1a1424';
      c.fillText(q.text, q.x + 1, q.y + 1);
      c.fillStyle = q.c;
      c.fillText(q.text, q.x, q.y);
      c.textAlign = 'left';
      c.globalAlpha = 1;
    }
  },

  clear: function () {
    this.parts.length = 0;
    this.pops.length = 0;
  }
};

// ------------------------------------------------------------------ results

var RESULT = { active: false, t: 0, kicker: '', title: '', sub: '', medal: '', best: false };

var MEDALS = [
  { at: 90, name: 'GOLD', colour: '#f0c060' },
  { at: 70, name: 'SILVER', colour: '#cfd6e0' },
  { at: 50, name: 'BRONZE', colour: '#c88a5a' }
];

function medalFor(score) {
  for (var i = 0; i < MEDALS.length; i++) if (score >= MEDALS[i].at) return MEDALS[i];
  return { at: 0, name: 'CLEARED', colour: '#9aa0ac' };
}

// End a chapter properly: record the score, celebrate, then hand back the book.
// Chapters call this instead of finishChapter(n).
function cleared(n, score, label) {
  var got = recordScore(n, score);
  var m = medalFor(score);
  RESULT.active = true;
  RESULT.t = 2.6;
  RESULT.kicker = 'CHAPTER ' + (n < 10 ? '0' : '') + n + ' CLEARED';
  RESULT.medal = m.name;
  RESULT.colour = m.colour;
  RESULT.title = label || '';
  RESULT.sub = got.newBest ? 'NEW BEST  ' + got.score : 'best ' + got.best;
  RESULT.best = got.newBest;
  RESULT.score = got.score;

  FX.confetti(G.px, G.py - 12);
  SFX.fanfare();
  G.flash = 0.5;

  // the card waits for a press, but never traps you: six seconds and it closes
  RESULT.level = G.level;
  RESULT.chapter = n;
  RESULT.done = false;
  setTimeout(function () {
    if (!RESULT.done) closeResult();
  }, 6000);
}

function closeResult() {
  if (RESULT.done) return;
  RESULT.done = true;
  RESULT.active = false;
  var n = RESULT.chapter;
  if (G.level === RESULT.level) finishChapter(n);
}

KEY_HOOKS.push(function (k) {
  if (!RESULT.active) return false;
  if (k === 'e' || k === ' ' || k === 'enter') { closeResult(); return true; }
  return false;
});

HUD_HOOKS.push(function (c) {
  if (!RESULT.active) return;
  var a = Math.min(1, RESULT.t * 2.2, (3.4 - RESULT.t) * 3.0 + 0.1);
  if (a <= 0) return;
  c.globalAlpha = Math.max(0, Math.min(1, a));
  var cx = W / 2, cy = H / 2 + 6;
  c.fillStyle = 'rgba(12,10,18,0.92)';
  c.fillRect(cx - 96, cy - 34, 192, 68);
  c.strokeStyle = 'rgba(240,192,96,0.6)';
  c.lineWidth = 1;
  c.strokeRect(cx - 96.5, cy - 34.5, 193, 69);

  c.textAlign = 'center';
  c.font = '7px monospace';
  c.fillStyle = '#f0c060';
  c.fillText(RESULT.kicker, cx, cy - 23);

  // medal disc
  c.beginPath();
  c.arc(cx - 66, cy - 2, 11, 0, Math.PI * 2);
  c.fillStyle = RESULT.colour;
  c.fill();
  c.beginPath();
  c.arc(cx - 66, cy - 2, 7, 0, Math.PI * 2);
  c.fillStyle = 'rgba(20,16,26,0.55)';
  c.fill();
  c.fillStyle = RESULT.colour;
  c.font = 'bold 6px monospace';
  c.fillText(RESULT.medal.slice(0, 1), cx - 66, cy + 1);

  // medal name over the detail line, both left aligned beside the disc
  c.textAlign = 'left';
  c.font = 'bold 9px monospace';
  c.fillStyle = RESULT.colour;
  c.fillText(RESULT.medal, cx - 48, cy - 7);
  c.font = '7px monospace';
  c.fillStyle = '#f6ecd8';
  var tline = RESULT.title.length > 26 ? RESULT.title.slice(0, 25) + '.' : RESULT.title;
  c.fillText(tline, cx - 48, cy + 5);

  c.textAlign = 'center';
  c.font = '6px monospace';
  c.fillStyle = RESULT.best ? '#9be08a' : 'rgba(210,205,195,0.75)';
  c.fillText(RESULT.sub, cx, cy + 24);
  c.textAlign = 'left';
  c.globalAlpha = 1;
});
