// Charakter erstellen: Werte, Bewegung per Steuerung, Schaden und Respawn.
import { Entity } from './entity.js';

const PLAYER_SIZE = 24;

export class Player extends Entity {
  constructor(map, spawnTile) {
    super({ ...map.spawnPosition(spawnTile, PLAYER_SIZE), size: PLAYER_SIZE, speed: 150, color: '#ffeb3b' });
    this.maxHp = 3;
    this.hp = this.maxHp;
    this.score = 0;
    this.invulnerable = 0; // Sekunden Schutz nach einem Treffer
  }

  update(dt, input, map) {
    const dir = input.direction();
    this.moveBy(dir.x * this.speed * dt, dir.y * this.speed * dt, map);
    this.invulnerable = Math.max(0, this.invulnerable - dt);
  }

  hit() {
    if (this.invulnerable > 0) return;
    this.hp -= 1;
    this.invulnerable = 1.5;
    this.respawn();
  }

  reset() {
    this.hp = this.maxHp;
    this.score = 0;
    this.invulnerable = 0;
    this.respawn();
  }

  draw(ctx) {
    // Blinken während der Unverwundbarkeit
    if (this.invulnerable > 0 && Math.floor(this.invulnerable * 10) % 2 === 0) return;
    super.draw(ctx);
  }
}
