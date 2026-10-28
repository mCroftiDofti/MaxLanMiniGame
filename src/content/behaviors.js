// Verhaltens-Bausteine. Jeder Baustein ist ein Objekt mit optionalen Hooks:
//   init({ entity, options, state })
//   update({ entity, world, dt, options, state })
//   onCollide({ entity, world, other, options, state })
//   onDamage({ entity, world, amount, source, options, state })
//   draw({ entity, ctx, options, state })
//   destroy({ entity, options, state })
// `options` kommen aus der Beschreibung ({ type, ...options }), `state` ist privat pro Instanz.
// Fehlt eine Option, lesen viele Bausteine stattdessen entity.props (z. B. path).
import { checkCondition, createBehavior, runHook } from '../engine/instance.js';

// Bewegung mit Geschwindigkeit; berücksichtigt `speedFactor` der aktuellen Kachel.
function step(entity, dirX, dirY, speed, dt, world) {
  const factor = world.map.tileAtPixel(entity.centerX, entity.centerY)?.speedFactor ?? 1;
  return entity.moveBy(dirX * speed * factor * dt, dirY * speed * factor * dt, world);
}

// Gibt true zurück, wenn das Ziel erreicht ist.
function moveTowards(entity, tx, ty, speed, dt, world) {
  const dx = tx - entity.x;
  const dy = ty - entity.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return true;
  const s = Math.min(speed * dt, dist) / dt;
  step(entity, dx / dist, dy / dist, s, dt, world);
  return false;
}

const STATE_MACHINE_HOOKS = ['update', 'onCollide', 'onDamage', 'draw'];

export default {
  idle: {},

  // Steuerung per Tastatur. `keys` erlaubt andere Aktionen, z. B. für einen zweiten Spieler.
  keyboardMove: {
    update({ entity, world, dt, options }) {
      const dir = world.input.direction(options.keys);
      step(entity, dir.x, dir.y, options.speed ?? 150, dt, world);
    },
  },

  // Läuft Wegpunkte (Kachelkoordinaten) im Kreis ab; options.path oder entity.props.path.
  patrol: {
    update({ entity, world, dt, options, state }) {
      const path = options.path ?? entity.props.path ?? [];
      if (!path.length) return;
      state.index ??= 0;
      state.stuck ??= 0;
      const target = world.map.toPixel(path[state.index], entity.size);
      const before = entity.x + entity.y;
      const reached = moveTowards(entity, target.x, target.y, options.speed ?? 60, dt, world);
      state.stuck = entity.x + entity.y === before ? state.stuck + dt : 0;
      if (reached || state.stuck > 1) {
        state.index = (state.index + 1) % path.length;
        state.stuck = 0;
      }
    },
  },

  // Zufällige Richtung, wechselt nach Zeit oder an Hindernissen.
  wander: {
    update({ entity, world, dt, options, state }) {
      state.timer = (state.timer ?? 0) - dt;
      if (state.timer <= 0 || !state.dir) {
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [0, 0]];
        state.dir = dirs[Math.floor(Math.random() * dirs.length)];
        state.timer = (options.minTime ?? 1) + Math.random() * (options.maxTime ?? 2.5);
      }
      const [dx, dy] = state.dir;
      const moved = step(entity, dx, dy, options.speed ?? 50, dt, world);
      if ((dx || dy) && !moved) state.timer = 0;
    },
  },

  // Läuft auf die nächste Entity mit Tag/Name `target` zu.
  chase: {
    update({ entity, world, dt, options }) {
      const target = world.find(options.target ?? 'player');
      if (target) moveTowards(entity, target.x, target.y, options.speed ?? 80, dt, world);
    },
  },

  // Läuft von `target` weg.
  flee: {
    update({ entity, world, dt, options }) {
      const target = world.find(options.target ?? 'player');
      if (!target) return;
      const dx = entity.centerX - target.centerX;
      const dy = entity.centerY - target.centerY;
      const dist = Math.hypot(dx, dy) || 1;
      step(entity, dx / dist, dy / dist, options.speed ?? 80, dt, world);
    },
  },

  // Lebenspunkte. Reagiert auf den Hook onDamage, z. B. von damageOnTouch.
  health: {
    init({ entity, options, state }) {
      entity.props.hp = options.max ?? 3;
      state.cooldown = 0;
    },
    update({ entity, dt, state }) {
      state.cooldown = Math.max(0, state.cooldown - dt);
      entity.visible = state.cooldown === 0 || Math.floor(state.cooldown * 10) % 2 === 1;
    },
    onDamage({ entity, world, amount, source, options, state }) {
      if (state.cooldown > 0 || entity.props.hp <= 0) return;
      entity.props.hp = Math.max(0, entity.props.hp - amount);
      state.cooldown = options.invulnerable ?? 1.5;
      world.events.emit('damaged', { entity, amount, source });
      if (entity.props.hp <= 0) world.events.emit('died', { entity });
      else if (options.respawn ?? true) entity.respawn();
    },
  },

  // Fügt Entities mit Tag `target` Schaden zu, wenn sie berührt werden.
  damageOnTouch: {
    onCollide({ entity, world, other, options }) {
      if (other.hasTag(options.target ?? 'player')) {
        other.callHook('onDamage', { world, amount: options.amount ?? 1, source: entity });
      }
    },
  },

  // Kann von `by` eingesammelt werden; `give` addiert Werte auf dessen props.
  collectible: {
    onCollide({ entity, world, other, options }) {
      if (!other.hasTag(options.by ?? 'player')) return;
      Object.entries(options.give ?? {}).forEach(([key, value]) => {
        other.props[key] = (other.props[key] ?? 0) + value;
      });
      world.events.emit('collected', { item: entity, by: other });
      world.remove(entity);
    },
  },

  // Zustandsmaschine: jeder Zustand hat eigene Verhalten, eigenes Aussehen und Übergänge.
  // options: { initial, states: { name: { behaviors: [...], appearance: {...}, transitions: [{ to, when }] } } }
  stateMachine: {
    init({ entity, options, state }) {
      state.baseAppearance = { ...entity.appearance };
      state.instances = {};
      enterState(entity, options, state, options.initial ?? Object.keys(options.states)[0]);
    },
    ...Object.fromEntries(STATE_MACHINE_HOOKS.map((hook) => [hook, (ctx) => {
      const { entity, options, state } = ctx;
      if (hook === 'update') {
        state.time += ctx.dt;
        const transitions = options.states[state.current].transitions ?? [];
        const next = transitions.find((t) => checkCondition(t.when, { ...ctx, timeInState: state.time }));
        if (next) enterState(entity, options, state, next.to);
      }
      runHook(state.instances[state.current], hook, { ...ctx, options: undefined, state: undefined });
    }])),
  },
};

function enterState(entity, options, state, name) {
  const def = options.states[name];
  if (!def) throw new Error(`Zustand "${name}" existiert nicht`);
  // Instanzen pro Zustand bleiben erhalten, damit z. B. patrol beim Wiedereintritt weitermacht.
  if (!state.instances[name]) {
    state.instances[name] = (def.behaviors ?? []).map(createBehavior);
    runHook(state.instances[name], 'init', { entity });
  }
  state.current = name;
  state.time = 0;
  entity.appearance = { ...state.baseAppearance, ...def.appearance };
  entity.props.state = name; // für andere Bausteine sichtbar
}
