// Entity: alles, was auf der Map existiert (Charakter, Gegner, Münze, Truhe, ...).
// Eine Entity hat selbst kein Verhalten – sie bekommt es über austauschbare Verhaltens-Bausteine.
import { createBehavior, runHook } from './instance.js';

let nextId = 1;

export function overlaps(a, b) {
  return a.x < b.x + b.size && a.x + a.size > b.x && a.y < b.y + b.size && a.y + a.size > b.y;
}

export class Entity {
  constructor({ name, tags = [], x = 0, y = 0, size = 24, solid = false, appearance = {}, props = {}, behaviors = [] }) {
    this.id = nextId++;
    this.name = name;
    this.tags = new Set(tags);
    this.x = x;
    this.y = y;
    this.size = size;
    this.solid = solid;
    this.appearance = { shape: 'rect', color: '#fff', layer: 0, ...appearance };
    this.visible = true;
    this.props = structuredClone(props); // freie Daten: hp, score, path, ...
    this.spawn = { x, y };
    this.removed = false;
    this.behaviors = [];
    behaviors.forEach((spec) => this.addBehavior(spec));
  }

  get centerX() { return this.x + this.size / 2; }
  get centerY() { return this.y + this.size / 2; }

  hasTag(tag) { return this.tags.has(tag); }

  // --- Verhalten zur Laufzeit ändern ---
  addBehavior(spec) {
    const inst = createBehavior(spec);
    this.behaviors.push(inst);
    runHook([inst], 'init', { entity: this });
    return inst;
  }

  removeBehavior(type) {
    const gone = this.behaviors.filter((b) => b.type === type);
    runHook(gone, 'destroy', { entity: this });
    this.behaviors = this.behaviors.filter((b) => b.type !== type);
  }

  setBehaviors(specs) {
    runHook(this.behaviors, 'destroy', { entity: this });
    this.behaviors = [];
    specs.forEach((spec) => this.addBehavior(spec));
  }

  hasBehavior(type) {
    return this.behaviors.some((b) => b.type === type);
  }

  // Ruft einen Hook (update, onCollide, onDamage, draw, eigene ...) auf allen Verhalten auf.
  callHook(hook, ctx = {}) {
    runHook(this.behaviors, hook, { entity: this, ...ctx });
  }

  // --- Bewegung & Geometrie ---
  // Achsen getrennt, damit man an Wänden entlanggleitet. Gibt zurück, ob sich etwas bewegt hat.
  moveBy(dx, dy, world) {
    const startX = this.x;
    const startY = this.y;
    if (dx && !world.isBlocked({ x: this.x + dx, y: this.y, size: this.size }, this)) this.x += dx;
    if (dy && !world.isBlocked({ x: this.x, y: this.y + dy, size: this.size }, this)) this.y += dy;
    return this.x !== startX || this.y !== startY;
  }

  distanceTo(other) {
    return Math.hypot(other.centerX - this.centerX, other.centerY - this.centerY);
  }

  overlaps(other) {
    return overlaps(this, other);
  }

  respawn() {
    this.x = this.spawn.x;
    this.y = this.spawn.y;
  }

  draw(ctx) {
    if (!this.visible) return;
    const { shape, color } = this.appearance;
    ctx.fillStyle = color;
    if (shape === 'circle') {
      const r = this.size / 2;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    this.callHook('draw', { ctx });
  }
}
