// Bedingungen für Zustandsübergänge: Funktion ({ entity, world, dt, timeInState, options }) => boolean
import { checkCondition } from '../engine/instance.js';

function distanceToTarget(entity, world, target) {
  const other = world.find(target ?? 'player');
  return other ? entity.distanceTo(other) : Infinity;
}

export default {
  always: () => true,
  never: () => false,
  nearTarget: ({ entity, world, options }) => distanceToTarget(entity, world, options.target) <= (options.range ?? 100),
  farFromTarget: ({ entity, world, options }) => distanceToTarget(entity, world, options.target) > (options.range ?? 100),
  afterTime: ({ timeInState, options }) => timeInState >= (options.seconds ?? 1),
  chance: ({ dt, options }) => Math.random() < (options.perSecond ?? 0.5) * dt,
  actionPressed: ({ world, options }) => world.input.wasPressed(options.action ?? 'action'),
  propAtLeast: ({ entity, options }) => (entity.props[options.prop] ?? 0) >= options.value,
  not: ({ options, ...ctx }) => !checkCondition(options.condition, ctx),
  all: ({ options, ...ctx }) => options.conditions.every((c) => checkCondition(c, ctx)),
  any: ({ options, ...ctx }) => options.conditions.some((c) => checkCondition(c, ctx)),
};
