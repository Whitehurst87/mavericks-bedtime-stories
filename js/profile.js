// profile.js - storybook progress. One save for all 50 stories, separate from
// the per-episode saves the engine already keeps.
//
// Shape:
//   { v: 1, done: { "1": 1712345678901, ... }, last: 3, freeRead: false,
//     seenIntro: false }
//
// A story is open when it is chapter one, already read, or the one after a
// story you finished. freeRead throws the order away and opens everything.

var PROFILE_KEY = 'mav_storybook_v1';

var PROFILE = {
  data: null,

  fresh: function () {
    return { v: 1, done: {}, last: 0, freeRead: false, seenIntro: false, stats: {} };
  },

  load: function () {
    if (this.data) return this.data;
    var d = null;
    try { d = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch (e) { d = null; }
    if (!d || typeof d !== 'object') d = this.fresh();
    if (!d.done) d.done = {};
    if (!d.stats) d.stats = {};
    if (typeof d.freeRead !== 'boolean') d.freeRead = false;
    this.data = d;
    return d;
  },

  save: function () {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(this.data)); } catch (e) {}
  }
};

function profile() { return PROFILE.load(); }

function chapterIsDone(n) { return !!profile().done[String(n)]; }

// A story that exists is a story you can play. Order is not a gate any more:
// the shelf shows the whole saga, and the unwritten ones stay locked because
// there is nothing behind them yet.
function chapterIsBuilt(n) {
  var c = CHAPTERS[n];
  return !!c && c.engine !== 'stub';
}

function chapterIsOpen(n) {
  var p = profile();
  if (chapterIsBuilt(n)) return true;
  if (p.freeRead) return true;
  return !!p.done[String(n)];
}

function markChapterDone(n) {
  var p = profile();
  if (!p.done[String(n)]) {
    p.done[String(n)] = Date.now();
    SFX.blip(880, 0.09);
  }
  p.last = n;
  PROFILE.save();
}

function setLastChapter(n) {
  var p = profile();
  p.last = n;
  PROFILE.save();
}

function chaptersRead() {
  return Object.keys(profile().done).length;
}

// ---------------------------------------------------------------- scoring
// Every chapter reports a 0-100 score for its main challenge. Best and play
// count live in the profile, so the shelf can show a medal on a finished book
// and the card can show what to beat.

function chapterStat(n) {
  return profile().stats[String(n)] || null;
}

function recordScore(n, score) {
  var p = profile();
  var key = String(n), s = Math.max(0, Math.min(100, Math.round(score)));
  if (!p.stats[key]) p.stats[key] = { best: 0, plays: 0 };
  var st = p.stats[key];
  st.plays++;
  var newBest = s > (st.best || 0);
  if (newBest) st.best = s;
  PROFILE.save();
  return { score: s, best: st.best, plays: st.plays, newBest: newBest };
}

function totalMedals() {
  var p = profile(), t = { gold: 0, silver: 0, bronze: 0 };
  Object.keys(p.stats).forEach(function (k) {
    var m = p.stats[k].best || 0;
    if (m >= 90) t.gold++;
    else if (m >= 70) t.silver++;
    else if (m >= 50) t.bronze++;
  });
  return t;
}

function toggleFreeRead() {
  var p = profile();
  p.freeRead = !p.freeRead;
  PROFILE.save();
  toast(p.freeRead ? 'preview on: unwritten stories show their notes' : 'preview off: only the written stories show');
  return p.freeRead;
}

// the story to point at when the book opens
function nextUnreadChapter() {
  for (var i = 1; i <= CHAPTER_COUNT; i++) if (chapterIsBuilt(i) && !chapterIsDone(i)) return i;
  return CHAPTER_COUNT;
}
