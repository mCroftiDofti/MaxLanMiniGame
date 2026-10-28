// Register: zentrale Ablage für alle austauschbaren Bausteine.
// Der Kern kennt nur Namen – was dahinter steckt, legt der Inhalt (src/content) fest.
export class Registry {
  constructor(kind) {
    this.kind = kind;
    this.items = new Map();
  }

  register(name, item) {
    this.items.set(name, item);
    return this;
  }

  registerAll(items = {}) {
    Object.entries(items).forEach(([name, item]) => this.register(name, item));
    return this;
  }

  get(name) {
    if (!this.items.has(name)) throw new Error(`${this.kind} "${name}" ist nicht registriert`);
    return this.items.get(name);
  }

  has(name) {
    return this.items.has(name);
  }

  names() {
    return [...this.items.keys()];
  }
}

export const tiles = new Registry('Kachel');
export const templates = new Registry('Vorlage');
export const behaviors = new Registry('Verhalten');
export const conditions = new Registry('Bedingung');
export const systems = new Registry('System');
