// Steuerung: Tasten werden auf frei benennbare Aktionen abgebildet.
export const DEFAULT_BINDINGS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  action: ['Space', 'Enter'],
};

export class Input {
  constructor(bindings = DEFAULT_BINDINGS, target = window) {
    this.bindings = { ...bindings };
    this.down = new Set();
    this.justPressed = new Set();
    target.addEventListener('keydown', (e) => {
      if (this.isBound(e.code)) e.preventDefault();
      if (!e.repeat) this.justPressed.add(e.code);
      this.down.add(e.code);
    });
    target.addEventListener('keyup', (e) => this.down.delete(e.code));
    target.addEventListener('blur', () => this.down.clear());
  }

  bind(action, codes) {
    this.bindings[action] = codes;
  }

  isBound(code) {
    return Object.values(this.bindings).some((codes) => codes.includes(code));
  }

  // Wird gehalten
  isDown(action) {
    return (this.bindings[action] ?? []).some((code) => this.down.has(code));
  }

  // Wurde in diesem Frame gedrückt
  wasPressed(action) {
    return (this.bindings[action] ?? []).some((code) => this.justPressed.has(code));
  }

  // Normalisierter Richtungsvektor aus vier Aktionen (frei wählbar, z. B. für einen zweiten Spieler).
  direction({ left = 'left', right = 'right', up = 'up', down = 'down' } = {}) {
    const x = Number(this.isDown(right)) - Number(this.isDown(left));
    const y = Number(this.isDown(down)) - Number(this.isDown(up));
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len };
  }

  endFrame() {
    this.justPressed.clear();
  }
}
