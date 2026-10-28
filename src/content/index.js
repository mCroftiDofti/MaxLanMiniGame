// Registriert alle Inhalte. Für ein anderes Spiel einfach andere Inhalte registrieren.
import { behaviors, conditions, systems, templates, tiles } from '../engine/registry.js';
import tileDefs from './tiles.js';
import behaviorDefs from './behaviors.js';
import conditionDefs from './conditions.js';
import systemDefs from './systems.js';
import templateDefs from './templates.js';

export function registerContent() {
  tiles.registerAll(tileDefs);
  behaviors.registerAll(behaviorDefs);
  conditions.registerAll(conditionDefs);
  systems.registerAll(systemDefs);
  templates.registerAll(templateDefs);
}
