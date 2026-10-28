// Map: Kachel-Raster aus Level-Daten. Kacheltypen kommen aus dem Kachel-Register.
import { tiles } from './registry.js';
import { getImage } from './assets.js';

export class GameMap {
  // config: { tileSize, legend, layout, background }
  // layout: Zeilen (Text oder Arrays von Schlüsseln, z. B. Farbcodes aus einem Map-Bild)
  //         ODER Funktion (tx, ty) => Schlüssel (dann mit width/height)
  // background: optionales Bild, das statt der Kacheln gezeichnet wird (Kacheln gelten weiter für Kollision)
  constructor({ tileSize = 32, legend, layout, width, height, background }) {
    this.tileSize = tileSize;
    this.background = background;
    const rows = typeof layout === 'function'
      ? Array.from({ length: height }, (_, ty) => Array.from({ length: width }, (_, tx) => layout(tx, ty)))
      : layout;
    // Farbcodes ohne Rücksicht auf Groß-/Kleinschreibung
    const lookup = Object.fromEntries(Object.entries(legend).map(([key, entry]) => [key.startsWith('#') ? key.toLowerCase() : key, entry]));

    this.grid = [];
    this.markers = []; // Spawn-Marker, die direkt im Layout stehen
    rows.forEach((row, ty) => {
      this.grid[ty] = [...row].map((key, tx) => {
        const entry = lookup[key.startsWith('#') ? key.toLowerCase() : key];
        if (!entry) throw new Error(`"${key}" (Spalte ${tx}, Zeile ${ty}) fehlt in der Legende`);
        const { tile, spawn } = typeof entry === 'string' ? { tile: entry } : entry;
        if (spawn) this.markers.push({ ...(typeof spawn === 'string' ? { template: spawn } : spawn), x: tx, y: ty });
        tiles.get(tile); // früh prüfen, ob der Kacheltyp existiert
        return tile;
      });
    });
    this.height = this.grid.length;
    this.width = this.grid[0].length;
  }

  get pixelWidth() { return this.width * this.tileSize; }
  get pixelHeight() { return this.height * this.tileSize; }

  // Kacheltyp an Kachel-Position; null außerhalb der Map
  tileAt(tx, ty) {
    const name = this.grid[ty]?.[tx];
    return name ? tiles.get(name) : null;
  }

  tileAtPixel(px, py) {
    return this.tileAt(Math.floor(px / this.tileSize), Math.floor(py / this.tileSize));
  }

  // Map zur Laufzeit verändern (Tür öffnen, Brücke bauen, ...)
  setTile(tx, ty, name) {
    tiles.get(name);
    this.grid[ty][tx] = name;
  }

  // Kachel-Position → Pixel-Position, zentriert für ein Objekt der Größe `size`
  toPixel({ x, y }, size) {
    const offset = (this.tileSize - size) / 2;
    return { x: x * this.tileSize + offset, y: y * this.tileSize + offset };
  }

  // Blockiert, wenn das Rechteck eine solide Kachel berührt oder die Map verlässt.
  isBlocked({ x, y, size }) {
    const ts = this.tileSize;
    for (let ty = Math.floor(y / ts); ty <= Math.floor((y + size - 1) / ts); ty++) {
      for (let tx = Math.floor(x / ts); tx <= Math.floor((x + size - 1) / ts); tx++) {
        const tile = this.tileAt(tx, ty);
        if (!tile || tile.solid) return true;
      }
    }
    return false;
  }

  draw(ctx) {
    const ts = this.tileSize;
    const background = getImage(this.background);
    if (background) {
      ctx.drawImage(background, 0, 0, this.pixelWidth, this.pixelHeight);
      return;
    }
    for (let ty = 0; ty < this.height; ty++) {
      for (let tx = 0; tx < this.width; tx++) {
        const tile = this.tileAt(tx, ty);
        const sprite = getImage(tile.sprite);
        if (tile.draw) {
          tile.draw(ctx, tx * ts, ty * ts, ts);
        } else if (sprite) {
          ctx.drawImage(sprite, tx * ts, ty * ts, ts, ts);
        } else {
          ctx.fillStyle = tile.color ?? '#000';
          ctx.fillRect(tx * ts, ty * ts, ts, ts);
        }
      }
    }
  }
}
