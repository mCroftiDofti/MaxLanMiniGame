// Level-Daten: reine Daten, keine Logik.
// Alle Positionen sind in Kachel-Koordinaten (Spalte x, Zeile y) angegeben.
export const level1 = {
  tileSize: 32,

  // Legende: # = Wand, . = Boden, ~ = Wasser (siehe TILES in map.js)
  layout: [
    '####################',
    '#..........#.......#',
    '#..........#.......#',
    '#...~~.....#.......#',
    '#...~~.............#',
    '#..................#',
    '#######..#####..####',
    '#..................#',
    '#..................#',
    '#....#.......~~~...#',
    '#....#.......~~~...#',
    '#....#.............#',
    '#....#.............#',
    '#..................#',
    '####################',
  ],

  // Objekte, die auf der Map platziert werden (siehe OBJECT_TYPES in objects.js)
  objects: [
    { type: 'chest', x: 9, y: 2 },
    { type: 'tree', x: 15, y: 4 },
    { type: 'tree', x: 3, y: 12 },
    { type: 'coin', x: 17, y: 2 },
    { type: 'coin', x: 8, y: 8 },
    { type: 'coin', x: 16, y: 12 },
    { type: 'coin', x: 2, y: 8 },
  ],

  // Spawn-Punkt des Charakters
  playerSpawn: { x: 2, y: 2 },

  // Spawn-Punkte der Gegner inkl. Grundverhalten (siehe BEHAVIORS in enemy.js)
  enemySpawns: [
    {
      type: 'slime', x: 13, y: 1, behavior: 'patrol',
      path: [{ x: 13, y: 1 }, { x: 18, y: 1 }, { x: 18, y: 4 }, { x: 13, y: 4 }],
    },
    { type: 'ghost', x: 10, y: 11, behavior: 'wander' },
    { type: 'bat', x: 16, y: 8, behavior: 'wander' },
  ],
};
