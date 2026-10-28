// Einstiegspunkt: baut die Welt aus den Level-Daten und startet den Game-Loop.
import { level1 } from './levels/level1.js';
import { GameMap } from './map.js';
import { GameObject } from './objects.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Input } from './input.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function createWorld(level) {
  // 1. Map aufbauen
  const map = new GameMap(level);
  // 2. Objekte auf der Map platzieren
  level.objects.forEach((o) => map.placeObject(new GameObject(o.type, o, map)));
  // 3. Charakter erstellen und am Spawn-Punkt setzen
  const player = new Player(map, level.playerSpawn);
  // 4. Gegner erstellen und an ihren Spawn-Punkten setzen
  const enemies = level.enemySpawns.map((def) => new Enemy(def, map));
  return { level, map, player, enemies };
}

let world = createWorld(level1);
const input = new Input();
canvas.width = world.map.pixelWidth;
canvas.height = world.map.pixelHeight;

function update(dt) {
  const { map, player, enemies } = world;
  player.update(dt, input, map);
  enemies.forEach((e) => e.update(dt, world));

  // Spieler ↔ Objekte: Einsammeln
  map.objects
    .filter((o) => o.collectible && player.overlaps(o))
    .forEach((o) => {
      player.score += o.score;
      map.removeObject(o);
    });

  // Spieler ↔ Gegner: Schaden
  if (enemies.some((e) => player.overlaps(e))) {
    player.hit();
    if (player.hp <= 0) world = createWorld(world.level); // Game Over → Level neu starten
  }

  if (!map.objects.some((o) => o.collectible)) world = createWorld(world.level); // Gewonnen → neu
}

function draw() {
  const { map, player, enemies } = world;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  map.draw(ctx);
  enemies.forEach((e) => e.draw(ctx));
  player.draw(ctx);

  ctx.fillStyle = '#fff';
  ctx.font = '16px sans-serif';
  ctx.fillText(`HP: ${'♥'.repeat(player.hp)}   Punkte: ${player.score}`, 8, 20);
}

let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05); // dt begrenzen, z. B. nach Tab-Wechsel
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
