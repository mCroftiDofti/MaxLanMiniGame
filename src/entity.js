// Gemeinsame Basis für Charakter und Gegner: Position, Bewegung mit Kollision, Spawn.
export class Entity {
  constructor({ x, y, size, speed, color }) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.color = color;
    this.spawn = { x, y };
  }

  get centerX() { return this.x + this.size / 2; }
  get centerY() { return this.y + this.size / 2; }

  // Achsen getrennt bewegen, damit man an Wänden entlanggleiten kann.
  moveBy(dx, dy, map) {
    if (dx && !map.isBlocked(this.x + dx, this.y, this.size, this.size)) this.x += dx;
    if (dy && !map.isBlocked(this.x, this.y + dy, this.size, this.size)) this.y += dy;
  }

  distanceTo(other) {
    return Math.hypot(other.centerX - this.centerX, other.centerY - this.centerY);
  }

  overlaps(other) {
    return this.x < other.x + other.size && this.x + this.size > other.x
      && this.y < other.y + other.size && this.y + this.size > other.y;
  }

  respawn() {
    this.x = this.spawn.x;
    this.y = this.spawn.y;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}
