// dialogue.js - typewriter dialogue box with portraits and branching choices.

var DLG = {
  active: false,
  queue: [],        // remaining nodes
  current: null,    // {who, text, choices}
  shown: 0,         // characters revealed
  speed: 55,        // chars per second
  choiceIdx: 0,
  onDone: null,
  blip: 0
};

var NAMES = {
  maverick: 'MAVERICK',
  bucktooth: 'PROF. BUCKTOOTH',
  mayor: 'MAYOR TUBA',
  nutkin: 'POSTMASTER NUTKIN',
  shellby: 'OLD MAN SHELLBY',
  gnome: 'LAWN GNOME',
  kevin: 'KEVIN',
  narrator: '',
  sign: 'A SIGN'
};

// start a conversation. lines = [{who, text} | {who, text, choices:[{label, reply:[...]}]}]
function say(lines, onDone) {
  DLG.queue = lines.slice();
  DLG.onDone = onDone || null;
  DLG.active = true;
  nextLine();
}

function nextLine() {
  if (!DLG.queue.length) {
    DLG.active = false;
    DLG.current = null;
    var cb = DLG.onDone; DLG.onDone = null;
    if (cb) cb();
    return;
  }
  DLG.current = DLG.queue.shift();
  DLG.shown = 0;
  DLG.choiceIdx = 0;
  if (DLG.current.who && DLG.current.text) DLG.blip = 0;
}

function advanceDialogue() {
  if (!DLG.active || !DLG.current) return;
  var c = DLG.current;
  if (DLG.shown < c.text.length) { DLG.shown = c.text.length; return; } // skip typing
  if (c.choices) { // pick current choice
    var pick = c.choices[DLG.choiceIdx];
    var more = pick.reply || [];
    if (pick.act) pick.act();
    DLG.queue = more.concat(DLG.queue);
    nextLine();
    return;
  }
  nextLine();
}

function moveChoice(dir) {
  if (!DLG.active || !DLG.current || !DLG.current.choices) return;
  var n = DLG.current.choices.length;
  DLG.choiceIdx = (DLG.choiceIdx + dir + n) % n;
  SFX.blip(700, 0.04);
}

function updateDialogue(dt) {
  if (!DLG.active || !DLG.current) return;
  var c = DLG.current;
  if (DLG.shown < c.text.length) {
    var before = Math.floor(DLG.shown);
    DLG.shown = Math.min(c.text.length, DLG.shown + DLG.speed * dt);
    if (Math.floor(DLG.shown) > before && Math.floor(DLG.shown) % 3 === 0) SFX.text();
  }
}

function wrapText(ctx, text, maxW) {
  var words = text.split(' ');
  var lines = [], line = '';
  for (var i = 0; i < words.length; i++) {
    var t = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = words[i]; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function drawDialogue(ctx, W, H) {
  if (!DLG.active || !DLG.current) return;
  var c = DLG.current;
  var boxH = 78, boxY = H - boxH - 6, boxX = 6, boxW = W - 12;

  ctx.fillStyle = 'rgba(18,16,28,0.92)';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = '#f4e4c0'; ctx.lineWidth = 2;
  ctx.strokeRect(boxX + 1, boxY + 1, boxW - 2, boxH - 2);
  ctx.strokeStyle = 'rgba(244,228,192,0.35)'; ctx.lineWidth = 1;
  ctx.strokeRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8);

  var textX = boxX + 12;
  if (c.who && c.who !== 'narrator') {
    // portrait
    ctx.save();
    ctx.fillStyle = '#2a2438';
    ctx.fillRect(boxX + 8, boxY + 10, 56, 56);
    drawPortrait(ctx, c.who, boxX + 20, boxY + 22, 32);
    ctx.restore();
    textX = boxX + 74;
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#f0c060';
    ctx.fillText(NAMES[c.who] || c.who.toUpperCase(), textX, boxY + 18);
  }

  ctx.font = '10px monospace';
  ctx.fillStyle = '#f4efe4';
  var full = c.text.slice(0, Math.floor(DLG.shown));
  var lines = wrapText(ctx, full, boxW - (textX - boxX) - 14);
  var ty = boxY + (c.who && c.who !== 'narrator' ? 32 : 22);
  for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], textX, ty + i * 13);

  if (c.choices && DLG.shown >= c.text.length) {
    var cy = boxY + 34;
    for (var k = 0; k < c.choices.length; k++) {
      var sel = k === DLG.choiceIdx;
      if (sel) { ctx.fillStyle = 'rgba(240,192,96,0.18)'; ctx.fillRect(textX - 4, cy + k * 15 - 10, boxW - (textX - boxX) - 8, 14); }
      ctx.fillStyle = sel ? '#ffffff' : '#cfc6b4';
      ctx.fillText((sel ? '> ' : '  ') + c.choices[k].label, textX, cy + k * 15);
    }
  } else if (DLG.shown >= c.text.length) {
    var t = Date.now() / 400;
    ctx.fillStyle = 'rgba(240,192,96,' + (0.5 + 0.5 * Math.sin(t)) + ')';
    ctx.fillText('[E]', boxX + boxW - 34, boxY + boxH - 10);
  }
}
