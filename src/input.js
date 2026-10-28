// Steuerung: merkt sich gedrückte Tasten und liefert eine Bewegungsrichtung.
const KEYS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
};

export class Input {
  constructor(target = window) {
    this.pressed = new Set();
    target.addEventListener('keydown', (e) => {
      if (Object.values(KEYS).flat().includes(e.code)) e.preventDefault();
      this.pressed.add(e.code);
    });
    target.addEventListener('keyup', (e) => this.pressed.delete(e.code));
    // Fenster verliert Fokus → keine "hängenden" Tasten
    target.addEventListener('blur', () => this.pressed.clear());
  }

  isDown(action) {
    return KEYS[action].some((code) => this.pressed.has(code));
  }

  // Normalisierter Richtungsvektor, damit diagonal nicht schneller ist.
  direction() {
    const x = Number(this.isDown('right')) - Number(this.isDown('left'));
    const y = Number(this.isDown('down')) - Number(this.isDown('up'));
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len };
  }
}
