// Welt: hält Map, Entities und Systeme, erzeugt Entities aus Vorlagen und erkennt Kollisionen.
import { Entity, overlaps } from './entity.js';
import { EventBus } from './events.js';
import { createInstance, runHook } from './instance.js';
import { systems, templates } from './registry.js';

// Regeln zum Zusammenführen von Vorlagen (extends) und Spawn-Überschreibungen:
// tags und behaviors werden angehängt, props und appearance zusammengeführt, alles andere überschrieben.
export function mergeDefs(base, extra) {
  return {
    ...base,
    ...extra,
    tags: [...(base.tags ?? []), ...(extra.tags ?? [])],
    props: { ...base.props, ...extra.props },
    appearance: { ...base.appearance, ...extra.appearance },
    behaviors: [...(base.behaviors ?? []), ...(extra.behaviors ?? [])],
  };
}

export function resolveTemplate(name) {
  const { extends: parent, ...def } = templates.get(name);
  return parent ? mergeDefs(resolveTemplate(parent), def) : def;
}

export class World {
  constructor({ map, input, game }) {
    this.map = map;
    this.input = input;
    this.game = game;
    this.events = new EventBus();
    this.entities = [];
    this.systems = [];
    this.timers = [];
    this.data = {}; // freier, gemeinsamer Spielzustand
    this.time = 0;
  }

  // spec: 'vorlage' oder { template, x, y (Kachel), ...überschreibungen }
  spawn(spec) {
    const { template, x = 0, y = 0, ...overrides } = typeof spec === 'string' ? { template: spec } : spec;
    const def = mergeDefs(template ? resolveTemplate(template) : {}, overrides);
    const pos = this.map.toPixel({ x, y }, def.size ?? 24);
    return this.add(new Entity({ name: template, ...def, ...pos }));
  }

  add(entity) {
    this.entities.push(entity);
    this.events.emit('spawn', { entity });
    return entity;
  }

  remove(entity) {
    if (entity.removed) return;
    entity.removed = true;
    this.events.emit('remove', { entity });
  }

  addSystem(spec) {
    const inst = createInstance(systems, spec);
    this.systems.push(inst);
    runHook([inst], 'init', { world: this });
    return inst;
  }

  // Erste Entity mit diesem Namen oder Tag
  find(nameOrTag) {
    return this.entities.find((e) => !e.removed && (e.name === nameOrTag || e.hasTag(nameOrTag)));
  }

  findAll(tag) {
    return this.entities.filter((e) => !e.removed && e.hasTag(tag));
  }

  // Funktion nach `seconds` Sekunden ausführen
  after(seconds, fn) {
    this.timers.push({ at: this.time + seconds, fn });
  }

  isBlocked(rect, ignore) {
    return this.map.isBlocked(rect)
      || this.entities.some((e) => e.solid && e !== ignore && !e.removed && overlaps(rect, e));
  }

  update(dt) {
    this.time += dt;
    this.entities.forEach((e) => {
      e.moving = false;
      if (!e.removed) e.callHook('update', { world: this, dt });
    });

    // Kollisionen: jedes überlappende Paar bekommt onCollide (beide Seiten) + Ereignis
    const active = this.entities.filter((e) => !e.removed);
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i];
        const b = active[j];
        if (a.removed || b.removed || !a.overlaps(b)) continue;
        a.callHook('onCollide', { world: this, other: b });
        b.callHook('onCollide', { world: this, other: a });
        this.events.emit('collide', { a, b });
      }
    }

    this.entities = this.entities.filter((e) => !e.removed);
    runHook(this.systems, 'update', { world: this, dt });

    const due = this.timers.filter((t) => t.at <= this.time);
    this.timers = this.timers.filter((t) => t.at > this.time);
    due.forEach((t) => t.fn());
  }

  draw(ctx) {
    this.map.draw(ctx);
    [...this.entities]
      .sort((a, b) => a.appearance.layer - b.appearance.layer)
      .forEach((e) => e.draw(ctx, this.time));
    runHook(this.systems, 'draw', { world: this, ctx });
  }
}
