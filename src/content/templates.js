// Vorlagen für Entities. Eine Vorlage kann eine andere erweitern (extends):
// tags und behaviors werden angehängt, props und appearance zusammengeführt.
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
    appearance: { color: '#ffeb3b', layer: 2 },
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
    appearance: { shape: 'circle', color: '#ffd600' },
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
    appearance: { color: '#e57373', layer: 1 },
    behaviors: [{
      type: 'stateMachine',
      states: {
        roam: {
          behaviors: [{ type: 'wander', speed: 45 }],
          transitions: [{ to: 'hunt', when: { type: 'nearTarget', target: 'player', range: 160 } }],
        },
        hunt: {
          appearance: { color: '#ff1744' },
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
