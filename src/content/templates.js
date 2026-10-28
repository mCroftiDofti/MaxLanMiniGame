// Vorlagen für Entities. Eine Vorlage kann eine andere erweitern (extends):
// tags und behaviors werden angehängt, props und appearance zusammengeführt.
// appearance.sprite: Grafik (oder Streifen aus `frames` Bildern nebeneinander, abgespielt mit `fps`).
// Ohne Grafik wird `color`/`shape` gezeichnet – so kann man erst spielen und später malen.
const enemy = {
  tags: ['enemy'],
  size: 22,
  behaviors: [{ type: 'damageOnTouch', target: 'player' }],
};

export default {
  // --- Charakter ---
  hero: {
    tags: ['player'],
    size: 24,
    appearance: {
      color: '#ffeb3b', layer: 2,
      sprite: 'assets/characters/hero.png', frames: 2, fps: 8, spriteSize: 32, flip: true, animate: 'moving',
    },
    props: { score: 0 },
    behaviors: [
      { type: 'keyboardMove', speed: 150 },
      { type: 'health', max: 3, invulnerable: 1.5 },
    ],
  },

  // --- Objekte ---
  coin: {
    tags: ['coin', 'item'],
    size: 12,
    appearance: { shape: 'circle', color: '#ffd600', sprite: 'assets/characters/coin.png', frames: 2, fps: 3, spriteSize: 24 },
    behaviors: [{ type: 'collectible', by: 'player', give: { score: 10 } }],
  },
  chest: { tags: ['obstacle'], solid: true, size: 26, appearance: { color: '#8d6e63' } },
  tree: { tags: ['obstacle'], solid: true, size: 28, appearance: { color: '#1b5e20', shape: 'circle' } },

  // --- Gegner ---
  enemy,

  // Patrouilliert (Route aus props.path), macht ab und zu Pause.
  slime: {
    extends: 'enemy',
    appearance: { color: '#8e24aa', layer: 1 },
    behaviors: [{
      type: 'stateMachine',
      initial: 'walk',
      states: {
        walk: {
          behaviors: [{ type: 'patrol', speed: 60 }],
          transitions: [{ to: 'rest', when: { type: 'afterTime', seconds: 4 } }],
        },
        rest: {
          appearance: { color: '#5e1675' },
          transitions: [{ to: 'walk', when: { type: 'afterTime', seconds: 1.5 } }],
        },
      },
    }],
  },

  // Läuft umher und jagt den Spieler, sobald er nah genug ist.
  ghost: {
    extends: 'enemy',
    appearance: { color: '#e57373', layer: 1, sprite: 'assets/characters/ghost.png', frames: 2, fps: 4, spriteSize: 30, flip: true },
    behaviors: [{
      type: 'stateMachine',
      states: {
        roam: {
          behaviors: [{ type: 'wander', speed: 45 }],
          transitions: [{ to: 'hunt', when: { type: 'nearTarget', target: 'player', range: 160 } }],
        },
        hunt: {
          appearance: { color: '#ff1744', sprite: 'assets/characters/ghost-hunt.png' },
          behaviors: [{ type: 'chase', target: 'player', speed: 85 }],
          transitions: [{ to: 'roam', when: { type: 'farFromTarget', target: 'player', range: 220 } }],
        },
      },
    }],
  },

  // Schreckhaft: flieht, wenn der Spieler nahe kommt.
  bat: {
    extends: 'enemy',
    size: 18,
    appearance: { color: '#ff7043', layer: 1 },
    behaviors: [{
      type: 'stateMachine',
      states: {
        roam: {
          behaviors: [{ type: 'wander', speed: 90 }],
          transitions: [{ to: 'scared', when: { type: 'nearTarget', target: 'player', range: 100 } }],
        },
        scared: {
          appearance: { color: '#ffab91' },
          behaviors: [{ type: 'flee', target: 'player', speed: 120 }],
          transitions: [{ to: 'roam', when: { type: 'farFromTarget', target: 'player', range: 180 } }],
        },
      },
    }],
  },
};
