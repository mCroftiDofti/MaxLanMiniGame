// Gegner erstellen, Spawn-Punkte und Verhaltensweisen.
import { Entity } from './entity.js';

// Gegnertypen: Werte pro Typ. `aggressive` = verfolgt den Spieler, sobald er in Sichtweite ist.
export const ENEMY_TYPES = {
  slime: { size: 22, speed: 60, color: '#8e24aa', viewRange: 0, aggressive: false },
  ghost: { size: 22, speed: 85, color: '#e53935', viewRange: 160, aggressive: true },
  bat: { size: 18, speed: 110, color: '#ff7043', viewRange: 120, aggressive: true },
};

// Bewegt einen Gegner Richtung Ziel; gibt true zurück, wenn das Ziel erreicht ist.
function moveTowards(enemy, tx, ty, dt, map) {
  const dx = tx - enemy.x;
  const dy = ty - enemy.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return true;
  const step = Math.min(enemy.speed * dt, dist);
  enemy.moveBy((dx / dist) * step, (dy / dist) * step, map);
  return false;
}

// Verhaltensweisen: jede Funktion steuert den Gegner für einen Frame.
// Neue Verhalten einfach hier ergänzen und im Level per `behavior` zuweisen.
export const BEHAVIORS = {
  idle() {},

  // Läuft eine feste Route ab (Wegpunkte im Level).
  patrol(enemy, dt, { map }) {
    if (!enemy.path.length) return;
    const target = enemy.path[enemy.pathIndex];
    if (moveTowards(enemy, target.x, target.y, dt, map)) {
      enemy.pathIndex = (enemy.pathIndex + 1) % enemy.path.length;
    }
  },

  // Läuft zufällig umher und wechselt regelmäßig oder bei Hindernissen die Richtung.
  wander(enemy, dt, { map }) {
    enemy.wanderTimer -= dt;
    if (enemy.wanderTimer <= 0) {
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [0, 0]];
      enemy.wanderDir = dirs[Math.floor(Math.random() * dirs.length)];
      enemy.wanderTimer = 1 + Math.random() * 1.5;
    }
    const [dx, dy] = enemy.wanderDir;
    const before = { x: enemy.x, y: enemy.y };
    enemy.moveBy(dx * enemy.speed * 0.5 * dt, dy * enemy.speed * 0.5 * dt, map);
    if ((dx || dy) && enemy.x === before.x && enemy.y === before.y) enemy.wanderTimer = 0;
  },

  // Verfolgt den Spieler direkt.
  chase(enemy, dt, { map, player }) {
    moveTowards(enemy, player.x, player.y, dt, map);
  },
};

export class Enemy extends Entity {
  constructor(def, map) {
    const type = ENEMY_TYPES[def.type];
    if (!type) throw new Error(`Unbekannter Gegnertyp: ${def.type}`);
    super({ ...map.spawnPosition(def, type.size), ...type });
    this.type = def.type;
    this.viewRange = type.viewRange;
    this.aggressive = type.aggressive;
    this.baseBehavior = def.behavior ?? 'idle';
    this.state = this.baseBehavior;
    this.path = (def.path ?? []).map((p) => map.spawnPosition(p, type.size));
    this.pathIndex = 0;
    this.wanderTimer = 0;
    this.wanderDir = [0, 0];
  }

  // Einfache Zustandsmaschine: Grundverhalten ↔ Verfolgen, je nach Sichtweite.
  update(dt, world) {
    const seesPlayer = this.aggressive && this.distanceTo(world.player) <= this.viewRange;
    this.state = seesPlayer ? 'chase' : this.baseBehavior;
    BEHAVIORS[this.state](this, dt, world);
  }

  respawn() {
    super.respawn();
    this.pathIndex = 0;
    this.state = this.baseBehavior;
  }

  draw(ctx) {
    super.draw(ctx);
    if (this.state === 'chase') {
      ctx.fillStyle = '#fff';
      ctx.fillText('!', this.centerX - 2, this.y - 4);
    }
  }
}
