// Kacheltypen. Außer `solid` und `color` sind alle Eigenschaften frei wählbar
// und können von Verhalten ausgelesen werden (z. B. speedFactor).
export default {
  floor: { solid: false, color: '#2e7d32' },
  wall: { solid: true, color: '#4e4e4e' },
  water: { solid: true, color: '#1565c0' },
  sand: { solid: false, color: '#c2a35a', speedFactor: 0.5 },
};
