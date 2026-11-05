// art.js - pixel art rendering. Procedural placeholders now, PNG overrides later.
// Every character is drawn on a 16x16 grid. If assets/<name>.png exists it is
// used instead, so PixelLab art can be dropped in without touching game code.

var ART = {
  scale: 1,
  overrides: {},      // name -> {img, fw, fh, cols} idle sheet
  walk: {},           // name -> {img, fw, fh, cols} walk cycle sheet, if generated
  charScale: 2,       // drawn at 2x the 16px grid so 32px PixelLab frames stay pixel-exact
  frameW: 16,
  frameH: 16
};

// assets/manifest.js defines ART_MANIFEST before this file runs
function loadManifest() {
  if (typeof ART_MANIFEST === 'undefined') return;
  Object.keys(ART_MANIFEST).forEach(function (name) {
    var m = ART_MANIFEST[name];
    var img = new Image();
    var walk = name.slice(-5) === '_walk';
    var base = walk ? name.slice(0, -5) : name;
    img.onload = function () {
      var rec = { img: img, fw: m.fw, fh: m.fh, cols: m.cols || 1 };
      if (walk) ART.walk[base] = rec; else ART.overrides[base] = rec;
    };
    img.src = 'assets/' + name + '.png';
  });
}

// how many frames the walk cycle has for a character (1 = static sheet)
function walkCols(name) {
  var w = ART.walk[name];
  return w ? w.cols : 1;
}
loadManifest();

var CHARS = {
  maverick: { skin:'#f2c69b', hair:'#6b3f22', shirt:'#3f8fd6', pants:'#2f3f63', shoe:'#20242e', hairStyle:'messy' },
  bucktooth:{ skin:'#8d5a34', hair:'#5a3517', shirt:'#00000000', pants:'#5a3517', fur:'#8d5a34', beaver:true },
  mayor:    { skin:'#e8b48c', hair:'#c8a24a', shirt:'#6f4fb0', pants:'#3a2f5a', shoe:'#241f33', hairStyle:'flat', toupee:true },
  nutkin:   { skin:'#b06a3a', hair:'#8a4a22', shirt:'#c8452f', pants:'#8a4a22', fur:'#b06a3a', squirrel:true },
  shellby:  { skin:'#9fbf7a', hair:'#7a9a5a', shirt:'#6f8f5a', pants:'#5a7048', shell:true },
  gnome:    { skin:'#f0c8a0', hair:'#f4f4f4', shirt:'#4a8f4a', pants:'#3a6a3a', gnome:true },
  kevin:    { skin:'#f4d24a', hair:'#f4d24a', shirt:'#f4d24a', pants:'#f4d24a', duck:true },
  adrian:   { skin:'#f2c69b', hair:'#e8c85a', shirt:'#e07a2a', pants:'#3f6f9e', shoe:'#f0f0f0', hairStyle:'flat' },
  clerk:    { skin:'#e8b48c', hair:'#3a2a1a', shirt:'#4a8a5a', pants:'#3a4a6a', shoe:'#241f33', hairStyle:'flat' },
  nibbles:  { skin:'#c8a878', hair:'#c8a878', shirt:'#c8a878', pants:'#a88860', fur:'#c8a878', squirrel:true }
};

// try to load a PixelLab/PNG override; silently fall back to procedural art
function loadOverride(name, src) {
  var img = new Image();
  img.onload = function () { ART.overrides[name] = img; };
  img.onerror = function () { /* keep placeholder */ };
  img.src = src;
}

function px(ctx, x, y, w, h, c, s) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x * s), Math.round(y * s), Math.round(w * s), Math.round(h * s));
}

// draw a character sprite. dir: 'down','up','left','right'. frame: 0/1 for walk.
function drawChar(ctx, who, dir, frame, sx, sy, s, set) {
  var ov = (set === 'walk' && ART.walk[who]) ? ART.walk[who] : ART.overrides[who];
  if (ov) { // spritesheet: 4 rows (down,left,right,up) x cols frames
    var rows = { down: 0, left: 1, right: 2, up: 3 };
    var col = (frame || 0) % ov.cols;
    var cell = 16 * s;
    var dw = cell * ART.charScale;              // width stays 2 tiles, so pixels stay 1:1
    var dh = dw * (ov.fh / ov.fw);              // taller frames (walk arcs) grow upward
    var dx = Math.round(sx + cell / 2 - dw / 2);
    var dy = Math.round(sy + cell - dh);
    ctx.drawImage(ov.img, col * ov.fw, (rows[dir] || 0) * ov.fh, ov.fw, ov.fh, dx, dy, dw, dh);
    return;
  }
  var d = CHARS[who] || CHARS.maverick;
  var X = sx / s, Y = sy / s; // work in 16px grid units
  function P(x, y, w, h, c) { px(ctx, X + x, Y + y, w, h, c, s); }
  var bob = 0;
  var flip = dir === 'left';

  // shadow
  P(4, 14, 8, 2, 'rgba(0,0,0,0.22)');

  if (d.beaver) { drawBeaver(ctx, dir, frame, sx, sy, s); return; }

  if (d.duck) {
    P(4, 9 + bob, 8, 5, d.skin);            // body
    P(3, 8 + bob, 6, 4, d.skin);            // head
    if (dir !== 'up') P(8, 9 + bob, 3, 2, '#e08820'); // beak
    if (dir === 'down' || dir === 'left' || dir === 'right') {
      P(dir === 'left' ? 6 : 5, 9 + bob, 1, 2, '#2b2b2b');
    }
    if (dir !== 'up') P(4, 12 + bob, 7, 1, '#d8b83a');
    return;
  }

  if (d.shell) { // tortoise: shell sits over the body
    P(3, 6 + bob, 10, 7, '#6f9a4f');
    P(4, 7 + bob, 8, 5, '#87b463');
    P(5, 8 + bob, 2, 2, '#6f9a4f'); P(9, 10 + bob, 2, 2, '#6f9a4f');
  }

  // legs
  var l1 = frame === 1 ? 1 : 0, l2 = frame === 1 ? 0 : 1;
  P(5, 11 + l1, 2, 3 - l1, d.pants);
  P(9, 11 + l2, 2, 3 - l2, d.pants);
  if (d.shoe) { P(5, 14 + l1 - 1, 2, 1, d.shoe); P(9, 14 + l2 - 1, 2, 1, d.shoe); }

  // body
  var bodyC = d.fur || d.shirt;
  P(4, 7 + bob, 8, 5, bodyC);
  if (d.beaver) { P(5, 7 + bob, 6, 5, '#a06a40'); P(6, 8 + bob, 4, 3, '#b0784a'); }

  // arms
  var armSwing = frame === 1 ? 1 : 0;
  if (!d.shell) { P(2, 8 + bob + armSwing, 2, 4, bodyC); P(12, 8 + bob + (1 - armSwing), 2, 4, bodyC); }

  // tails / accessories behind the head
  if (d.beaver) {
    if (dir === 'down') { P(1, 8 + bob, 3, 5, '#6b4326'); P(1, 9 + bob, 2, 3, '#7a4f2d'); }
    else if (dir === 'up') { P(12, 7 + bob, 4, 6, '#6b4326'); P(13, 9 + bob, 2, 3, '#7a4f2d'); }
    else if (flip) { P(12, 8 + bob, 4, 5, '#6b4326'); }
    else { P(0, 8 + bob, 4, 5, '#6b4326'); }
  }
  if (d.squirrel) {
    var tx = flip ? 12 : 1;
    P(tx, 3 + bob, 3, 3, '#c06a3a'); P(flip ? 13 : 0, 4 + bob, 3, 5, '#c06a3a');
    P(flip ? 12 : 1, 8 + bob, 3, 3, '#d07a48');
  }

  // head
  P(4, 1 + bob, 8, 6, d.skin);
  if (d.beaver) { P(4, 1 + bob, 8, 2, '#a06a40'); } // round ears/head shading

  // hair
  if (d.gnome) {
    P(3, 0 + bob, 10, 2, '#d04030'); P(4, -3 + bob, 8, 4, '#d04030'); // pointy hat
    P(6, -5 + bob, 4, 3, '#e05040');
    P(4, 6 + bob, 8, 2, '#f4f4f4'); // beard
  } else if (d.toupee) {
    P(3, 0 + bob, 10, 2, d.hair); P(2, 1 + bob, 2, 2, d.hair); P(12, 1 + bob, 2, 2, d.hair);
  } else if (d.beaver || d.squirrel) {
    P(4, 0 + bob, 8, 2, d.fur); P(3, 1 + bob, 2, 2, d.fur); P(11, 1 + bob, 2, 2, d.fur);
  } else {
    P(3, 0 + bob, 10, 2, d.hair);
    if (d.hairStyle === 'messy') { P(3, 0 + bob, 2, 3, d.hair); P(11, -1 + bob, 2, 3, d.hair); }
    else { P(2, 1 + bob, 2, 3, d.hair); P(12, 1 + bob, 2, 3, d.hair); }
  }

  // face
  if (dir !== 'up') {
    var ey = 4 + bob;
    if (dir === 'left') { P(5, ey, 1, 2, '#2b2b2b'); }
    else if (dir === 'right') { P(9, ey, 1, 2, '#2b2b2b'); }
    else { P(6, ey, 1, 2, '#2b2b2b'); P(9, ey, 1, 2, '#2b2b2b'); }
    if (d.beaver) { // big buck teeth
      P(6, 6 + bob, 4, 3, '#ffffff'); P(8, 6 + bob, 1, 3, '#d8d8d8');
      if (dir === 'left') { P(5, 6 + bob, 3, 3, '#ffffff'); P(6, 6 + bob, 1, 3, '#d8d8d8'); }
      if (dir === 'right') { P(8, 6 + bob, 3, 3, '#ffffff'); P(9, 6 + bob, 1, 3, '#d8d8d8'); }
    } else if (d.gnome) {
      P(7, 5 + bob, 2, 1, '#c09070');
    }
  }
  if (d.squirrel) { // mail bag
    P(12, 8 + bob, 3, 4, '#8a6a3a'); P(12, 8 + bob, 3, 1, '#6a4a2a');
  }
}

// dialogue portrait: 1:1 pixels, no scaling mush
function drawPortrait(ctx, who, x, y, size) {
  size = size || 32;
  var ov = ART.overrides[who];
  if (ov && ov.img && ov.img.complete && ov.img.naturalWidth) {
    ctx.drawImage(ov.img, 0, 0, ov.fw, ov.fh, Math.round(x), Math.round(y), size, size);
    return;
  }
  var px0 = size / 16;
  drawChar(ctx, who, 'down', 0, x, y + (size - size), px0 * 0.5);
}

// Professor Bucktooth gets his own draw path: flat paddle tail, big front teeth.
function drawBeaver(ctx, dir, frame, sx, sy, s) {
  var X = sx / s, Y = sy / s;
  function P(x, y, w, h, c) { px(ctx, X + x, Y + y, w, h, c, s); }
  var FUR = '#8d5a34', FURD = '#6b4326', FURL = '#a87550', DARK = '#3a2414';
  var l1 = frame === 1 ? 1 : 0, l2 = frame === 1 ? 0 : 1;

  P(4, 14, 8, 2, 'rgba(0,0,0,0.22)');

  // flat paddle tail, always opposite the facing side
  var tx = (dir === 'left' || dir === 'up') ? 11 : 0;
  P(tx, 9, 5, 5, FURD);
  P(tx + 1, 8, 4, 6, '#7a4f2d');
  if (dir === 'down' || dir === 'up') { P(tx + 1, 10, 3, 1, '#5a3517'); P(tx + 1, 12, 3, 1, '#5a3517'); }

  // legs
  P(4, 12 + l1, 3, 4 - l1, FURD); P(9, 12 + l2, 3, 4 - l2, FURD);
  P(4, 15, 3, 1, '#4a2a14'); P(9, 15, 3, 1, '#4a2a14');

  // body + belly
  P(3, 8, 10, 5, FUR); P(5, 9, 6, 3, FURL);
  P(2, 9 + (frame === 1 ? 1 : 0), 2, 3, FUR);
  P(12, 9 + (frame === 1 ? 0 : 1), 2, 3, FUR);

  // head, ears, muzzle
  P(3, 2, 10, 7, FUR); P(3, 2, 10, 2, FURL);
  P(2, 1, 2, 2, FUR); P(12, 1, 2, 2, FUR);
  P(5, 5, 6, 4, FURL);

  if (dir !== 'up') {
    if (dir === 'left') P(4, 3, 2, 2, DARK);
    else if (dir === 'right') P(10, 3, 2, 2, DARK);
    else { P(5, 3, 2, 2, DARK); P(9, 3, 2, 2, DARK); }
    P(7, 5, 2, 1, DARK);
    var bx = dir === 'left' ? 4 : dir === 'right' ? 9 : 6;
    P(bx, 7, 4, 4, '#ffffff');
    P(bx + 1, 7, 1, 4, '#dcdcd0');
  }
}

// ---------------------------------------------------------------- the maps
function drawProp(ctx, kind, sx, sy, s, t) {
  var X = sx / s, Y = sy / s;
  function P(x, y, w, h, c) { px(ctx, X + x, Y + y, w, h, c, s); }
  if (kind === 'house') {
    P(0, 0, 48, 32, '#c8a06a'); P(0, 28, 48, 4, '#a07848');
    P(-2, 0, 52, 8, '#8a4a3a'); P(2, -4, 44, 6, '#a05a44'); P(4, -8, 40, 6, '#b06a50');
    P(8, 12, 10, 10, '#6a8fb0'); P(9, 13, 8, 8, '#a8c8e0');
    P(30, 14, 8, 18, '#6a4a2a'); P(31, 15, 6, 16, '#8a6a3a'); P(36, 22, 1, 1, '#e0c060');
    P(20, 30, 8, 2, '#b09060');
  } else if (kind === 'fountain') {
    P(0, 8, 40, 16, '#9a9a9a'); P(2, 10, 36, 12, '#c0c0c0'); P(4, 12, 32, 8, '#8a8a8a');
    P(16, 0, 8, 10, '#b0b0b0'); P(14, 2, 12, 1, '#909090');
  } else if (kind === 'sign') {
    P(8, 8, 3, 14, '#8a6a3a'); P(0, 0, 22, 10, '#c8a06a'); P(1, 1, 20, 8, '#e0c090');
  } else if (kind === 'junk') {
    var cols = ['#8a6a3a', '#b04040', '#4070b0', '#40a060', '#c0a040'];
    for (var i = 0; i < 5; i++) {
      P((i * 7) % 20, (i * 5) % 14, 10, 6, cols[i]);
      P(((i * 7) % 20) + 2, ((i * 5) % 14) + 1, 4, 3, cols[(i + 2) % 5]);
    }
  } else if (kind === 'tuft') {
    P(4, 12, 1, 4, '#4f8f3a'); P(6, 11, 1, 5, '#5f9f45'); P(8, 12, 1, 4, '#4f8f3a');
  } else if (kind === 'flower') {
    P(6, 12, 1, 4, '#4f8f3a'); P(5, 10, 3, 3, '#e07090'); P(6, 11, 1, 1, '#ffe060');
  } else if (kind === 'house-window') {
    P(0, 0, 16, 16, '#6a8fb0');
  }
}
