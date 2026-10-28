// Objekte auf der Map: Hindernisse (solid) und einsammelbare Gegenstände (collectible).
export const OBJECT_TYPES = {
  chest: { solid: true, color: '#8d6e63', scale: 0.8 },
  tree: { solid: true, color: '#1b5e20', scale: 0.9 },
  coin: { solid: false, collectible: true, score: 10, color: '#ffd600', scale: 0.4 },
};

export class GameObject {
  constructor(type, tile, map) {
    const def = OBJECT_TYPES[type];
    if (!def) throw new Error(`Unbekannter Objekttyp: ${type}`);
    this.type = type;
    Object.assign(this, def);
    this.size = map.tileSize * def.scale;
    Object.assign(this, map.spawnPosition(tile, this.size));
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    if (this.collectible) {
      const r = this.size / 2;
      ctx.beginPath();
      ctx.arc(this.x + r, this.y + r, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }
}
