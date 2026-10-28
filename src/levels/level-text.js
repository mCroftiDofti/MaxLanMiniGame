// Beispiel: dasselbe Level als Text-Layout statt als Pixelbild (in main.js importieren, um es zu nutzen).
export default {
  name: 'Level 1 (Text)',

  map: {
    tileSize: 32,
    // Legende: Zeichen → Kachel, optional mit Spawn (Vorlagenname oder { template, ...überschreibungen })
    legend: {
      '#': 'wall',
      '.': 'floor',
      '~': 'water',
      '_': 'sand',
      'P': { tile: 'floor', spawn: { template: 'hero', name: 'hero' } },
      'c': { tile: 'floor', spawn: 'coin' },
      'C': { tile: 'floor', spawn: 'chest' },
      'T': { tile: 'floor', spawn: 'tree' },
      'g': { tile: 'floor', spawn: 'ghost' },
      'b': { tile: 'floor', spawn: 'bat' },
    },
    layout: [
      '####################',
      '#..........#.....c.#',
      '#.P......C.#.......#',
      '#...~~.....#...T...#',
      '#...~~.............#',
      '#........___.......#',
      '#######..#####..####',
      '#.......___........#',
      '#.c.....c.......b..#',
      '#....#.......~~~...#',
      '#....#.......~~~...#',
      '#....#....g........#',
      '#..T.#..........c..#',
      '#..................#',
      '####################',
    ],
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
