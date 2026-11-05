// hooks.js - the extension points chapters use instead of editing the engine.
// Loaded before any chapter file so a chapter can register at parse time.

var TILE_HOOKS = [];      // fn(ctx, kind, tx, ty, grid) -> true when it drew the tile
var PROP_HOOKS = [];      // fn(ctx, ent) -> true when it drew the prop
var TICK_HOOKS = [];      // fn(dt), runs each frame while playing
var HUD_HOOKS = [];       // fn(ctx), drawn over the play HUD
var PLAYER_HOOKS = [];    // fn(ctx), drawn with the player (carried items, effects)
var ACTION_HOOKS = [];    // fn() -> true when it consumed the action key
var KEY_HOOKS = [];       // fn(key) -> true when it consumed a key press
var CHAPTER_CONTENT = {}; // n -> { start, intro, objective, ... }

// props are drawn in world pixels around the entity's feet, so a hook keeps
// full control of size. propScale must be 1 on entities a hook draws.

// Scenes that reuse an existing room's art. A chapter adds itself here rather
// than copying a tile painter.
var BEDROOM_SCENES = { bedroom: 1 };
var ARBYS_SCENES = { b_arbys: 1 };
function propPainter(ctx, e) {
  return function P(dx, dy, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(e.px + dx), Math.round(e.py + dy), w, h);
  };
}
