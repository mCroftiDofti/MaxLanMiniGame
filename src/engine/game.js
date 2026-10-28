// Game: lädt Levels und betreibt den Game-Loop.
import { GameMap } from './map.js';
import { World } from './world.js';
import { Input } from './input.js';
import { behaviors, conditions, systems, templates, tiles } from './registry.js';
import { preloadImages, readPixelMap } from './assets.js';

export class Game {
  constructor(canvas, { bindings } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(bindings);
    this.world = null;
    this.level = null;
  }

  // Ein Level darf eigene Bausteine mitbringen; sie ergänzen/überschreiben die registrierten.
  // Asynchron, weil vorher alle Bilder geladen werden.
  async load(level) {
    this.level = level;
    tiles.registerAll(level.tiles);
    templates.registerAll(level.templates);
    behaviors.registerAll(level.behaviors);
    conditions.registerAll(level.conditions);
    systems.registerAll(level.systems);

    // Map aus einem Pixelbild: jeder Pixel ist eine Kachel, die Farbe wird über die Legende zugeordnet.
    const mapConfig = level.map.image
      ? { ...level.map, layout: await readPixelMap(level.map.image) }
      : level.map;
    await preloadImages([
      level.map.background,
      ...tiles.names().map((name) => tiles.get(name).sprite),
      ...templates.names().map((name) => templates.get(name).appearance?.sprite),
    ]);

    const map = new GameMap(mapConfig);
    const world = new World({ map, input: this.input, game: this });
    this.world = world;
    map.markers.forEach((marker) => world.spawn(marker));
    (level.spawns ?? []).forEach((spec) => world.spawn(spec));
    (level.rules ?? []).forEach((spec) => world.addSystem(spec));

    this.canvas.width = map.pixelWidth;
    this.canvas.height = map.pixelHeight;
    world.events.emit('levelLoaded', { level });
    return world;
  }

  restart() {
    return this.load(this.level);
  }

  start() {
    let last = null;
    const loop = (now) => {
      const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.05); // dt begrenzen, z. B. nach Tab-Wechsel
      last = now;
      const world = this.world;
      world.update(dt);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.imageSmoothingEnabled = false; // Pixel-Grafik scharf skalieren
      world.draw(this.ctx);
      this.input.endFrame();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
