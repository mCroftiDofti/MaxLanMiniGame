// Map aufbauen: Kachel-Raster, Kollisionsabfragen und platzierte Objekte.
export const TILES = {
  '#': { name: 'wall', solid: true, color: '#4e4e4e' },
  '.': { name: 'floor', solid: false, color: '#2e7d32' },
  '~': { name: 'water', solid: true, color: '#1565c0' },
};

export class GameMap {
  constructor(level) {
    this.tileSize = level.tileSize;
    this.tiles = level.layout.map((row) => row.split(''));
    this.height = this.tiles.length;
    this.width = this.tiles[0].length;
    this.objects = [];
  }

  get pixelWidth() { return this.width * this.tileSize; }
  get pixelHeight() { return this.height * this.tileSize; }

  tileAt(tx, ty) {
    const row = this.tiles[ty];
    return row ? TILES[row[tx]] : undefined;
  }

  // Außerhalb der Map gilt als blockiert.
  isSolidTile(tx, ty) {
    const tile = this.tileAt(tx, ty);
    return !tile || tile.solid;
  }

  placeObject(obj) {
    this.objects.push(obj);
  }

  removeObject(obj) {
    this.objects = this.objects.filter((o) => o !== obj);
  }

  // Wandelt eine Kachel-Position in eine Pixel-Position um, zentriert für ein Objekt der Größe `size`.
  spawnPosition(tile, size) {
    const offset = (this.tileSize - size) / 2;
    return { x: tile.x * this.tileSize + offset, y: tile.y * this.tileSize + offset };
  }

  // Prüft, ob ein Rechteck (in Pixeln) mit soliden Kacheln oder Objekten kollidiert.
  isBlocked(x, y, w, h) {
    const ts = this.tileSize;
    const left = Math.floor(x / ts);
    const right = Math.floor((x + w - 1) / ts);
    const top = Math.floor(y / ts);
    const bottom = Math.floor((y + h - 1) / ts);
    for (let ty = top; ty <= bottom; ty++) {
      for (let tx = left; tx <= right; tx++) {
        if (this.isSolidTile(tx, ty)) return true;
      }
    }
    return this.objects.some((o) => o.solid
      && x < o.x + o.size && x + w > o.x && y < o.y + o.size && y + h > o.y);
  }

  draw(ctx) {
    const ts = this.tileSize;
    for (let ty = 0; ty < this.height; ty++) {
      for (let tx = 0; tx < this.width; tx++) {
        ctx.fillStyle = this.tileAt(tx, ty).color;
        ctx.fillRect(tx * ts, ty * ts, ts, ts);
      }
    }
    this.objects.forEach((o) => o.draw(ctx));
  }
}
