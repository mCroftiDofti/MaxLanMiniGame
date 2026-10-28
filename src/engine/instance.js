// Erzeugt Instanzen von Verhalten/Systemen aus einer Beschreibung und ruft ihre Hooks auf.
// Beschreibung: 'name' oder { type: 'name', ...optionen }
import { behaviors, conditions } from './registry.js';

export function normalizeSpec(spec) {
  return typeof spec === 'string' ? { type: spec } : spec;
}

export function createInstance(registry, spec) {
  const { type, ...options } = normalizeSpec(spec);
  return { type, def: registry.get(type), options, state: {} };
}

export function createBehavior(spec) {
  return createInstance(behaviors, spec);
}

// Ruft `hook` auf allen Instanzen auf. Jede bekommt den gemeinsamen Kontext plus eigene options/state.
export function runHook(instances, hook, ctx) {
  for (const inst of [...instances]) {
    inst.def[hook]?.({ ...ctx, options: inst.options, state: inst.state });
  }
}

export function checkCondition(spec, ctx) {
  const { type, ...options } = normalizeSpec(spec);
  return Boolean(conditions.get(type)({ ...ctx, options }));
}
