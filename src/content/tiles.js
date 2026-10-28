// Kacheltypen. Außer `solid` und `color` sind alle Eigenschaften frei wählbar
// und können von Verhalten ausgelesen werden (z. B. speedFactor).
// `sprite`: Grafik der Kachel (beliebige Größe, wird auf tileSize skaliert). Fehlt sie, wird `color` gezeichnet.
export default {
  floor: { solid: false, color: '#2e7d32', sprite: 'assets/tiles/grass.png' },
  wall: { solid: true, color: '#4e4e4e', sprite: 'assets/tiles/wall.png' },
  water: { solid: true, color: '#1565c0', sprite: 'assets/tiles/water.png' },
  sand: { solid: false, color: '#c2a35a', sprite: 'assets/tiles/sand.png', speedFactor: 0.5 },
};
