// Ein Level ist reine Beschreibung: Map, wer wo startet und welche Regeln gelten.
export default {
  name: 'Level 1',

  map: {
    tileSize: 32,
    // Die Map ist ein Pixelbild: 1 Pixel = 1 Kachel (hier 20 × 15 Pixel).
    image: 'assets/maps/level1.png',
    // Legende: Pixelfarbe → Kachel, optional mit Spawn (Vorlagenname oder { template, ...überschreibungen })
    legend: {
      '#000000': 'wall',
      '#00ff00': 'floor',
      '#0000ff': 'water',
      '#ffff00': 'sand',
      '#ff0000': { tile: 'floor', spawn: { template: 'hero', name: 'hero' } },
      '#ff9900': { tile: 'floor', spawn: 'coin' },
      '#8b4513': { tile: 'floor', spawn: 'chest' },
      '#006400': { tile: 'floor', spawn: 'tree' },
      '#ff00ff': { tile: 'floor', spawn: 'ghost' },
      '#00ffff': { tile: 'floor', spawn: 'bat' },
    },
    // Optional: komplett gemaltes Hintergrundbild statt Kachel-Grafiken (Kollision kommt weiter aus `image`)
    // background: 'assets/maps/level1-hintergrund.png',
  },

  // Zusätzliche Spawns mit Kachelposition und individuellen Überschreibungen
  spawns: [
    { template: 'slime', x: 13, y: 1, props: { path: [{ x: 13, y: 1 }, { x: 18, y: 1 }, { x: 18, y: 4 }, { x: 13, y: 4 }] } },
  ],

  // Spielregeln (Systeme)
  rules: [
    { type: 'hud', lines: [{ label: 'HP', of: 'player', prop: 'hp' }, { label: 'Punkte', of: 'player', prop: 'score' }] },
    { type: 'restartOn', event: 'died', message: 'Game Over' },
    { type: 'clearAll', tag: 'coin', message: 'Gewonnen!' },
  ],

  // Optional: level-eigene Bausteine (ergänzen/überschreiben die globalen)
  // tiles: {}, templates: {}, behaviors: {}, conditions: {}, systems: {},
};
