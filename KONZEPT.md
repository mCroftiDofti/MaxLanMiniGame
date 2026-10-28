# Konzept: Dynamisches Grundgerüst für ein JavaScript-Minispiel

Das Gerüst legt sich **nicht** auf ein Spiel fest. Es liefert nur drei Dinge:

1. eine **Map**, die aus Daten aufgebaut wird,
2. **Entities** (Charakter, Gegner, Objekte – technisch alles dasselbe),
3. **austauschbares Verhalten**, das man Entities beliebig zuweisen, kombinieren und zur Laufzeit ändern kann.

Was daraus wird (Labyrinth, Sammelspiel, Zelda-artig, Pac-Man-artig, ...), entscheidet allein der Inhalt.

## Leitprinzipien

| Prinzip | Bedeutung |
|---|---|
| **Kern kennt kein Spiel** | `src/engine/` enthält kein Wort über Münzen, Gegner oder Lebenspunkte. |
| **Alles ist eine Entity** | Spieler, Gegner, Münze, Truhe, Tür – Unterschiede entstehen nur durch Tags, Werte und Verhalten. |
| **Verhalten ist ein Baustein** | Steuerung, KI, Einsammeln, Schaden ... sind kleine, kombinierbare Bausteine. |
| **Daten statt Code** | Level, Vorlagen und Verhaltenskombinationen sind reine Objekte (später auch als JSON ladbar). |
| **Register statt Imports** | Bausteine werden unter einem Namen registriert und per Name benutzt – austauschbar, erweiterbar. |
| **Ereignisse statt Abhängigkeiten** | Bausteine reden über Ereignisse (`died`, `collected`, ...), ohne sich zu kennen. |

## Projektstruktur

```
src/
  engine/              Spielunabhängiger Kern (muss selten angefasst werden)
    registry.js        Register: tiles, templates, behaviors, conditions, systems
    map.js             Map aus Legende + Layout, Kollision mit Kacheln, setTile()
    entity.js          Entity: Position, Tags, props, Verhalten hinzufügen/entfernen/ersetzen
    instance.js        Baustein-Instanzen erzeugen, Hooks aufrufen, Bedingungen prüfen
    world.js           Spawnen aus Vorlagen, Suche, Kollisionen, Systeme, Timer
    events.js          Ereignis-Bus
    input.js           Tasten → frei benennbare Aktionen
    game.js            Level laden, Game-Loop
  content/             Spielspezifischer Inhalt (austauschbar)
    tiles.js           Kacheltypen
    templates.js       Entity-Vorlagen (Charakter, Gegner, Objekte)
    behaviors.js       Verhaltens-Bausteine
    conditions.js      Bedingungen für Zustandswechsel
    systems.js         Spielregeln (HUD, Sieg, Niederlage)
    index.js           registriert alles
  levels/level1.js     Ein Level als reine Beschreibung
  main.js              Inhalte registrieren, Level laden, starten
```

---

## 1. Map

Eine Map besteht aus einer **Legende** (Zeichen → Kachel, optional mit Spawn) und einem **Layout**.

```js
map: {
  tileSize: 32,
  legend: {
    '#': 'wall',
    '.': 'floor',
    '_': 'sand',
    'P': { tile: 'floor', spawn: { template: 'hero', name: 'hero' } }, // Charakter-Spawnpunkt
    'g': { tile: 'floor', spawn: 'ghost' },                             // Gegner-Spawnpunkt
    'c': { tile: 'floor', spawn: 'coin' },                              // Objekt
  },
  layout: [
    '##########',
    '#P..c..g.#',
    '##########',
  ],
}
```

- **Layout als Funktion** für generierte Maps: `layout: (x, y) => (x === 0 || y === 0 ? '#' : '.')` mit `width`/`height`.
- **Kacheltypen** (`content/tiles.js`) haben `solid` und `color` – und **beliebige weitere Eigenschaften**, die Verhalten auslesen können. Beispiel: `sand: { speedFactor: 0.5 }` halbiert die Geschwindigkeit. Eigene Optik: `draw(ctx, x, y, size)`.
- **Zur Laufzeit ändern**: `world.map.setTile(x, y, 'floor')` (Tür öffnen, Brücke bauen, Wand zerstören).

## 2. Entities & Vorlagen (Charakter, Gegner, Objekte)

Eine Vorlage beschreibt eine Entity-Art:

```js
hero: {
  tags: ['player'],                    // Gruppen, nach denen andere suchen (find('player'))
  size: 24,
  solid: false,                        // blockiert andere?
  appearance: { color: '#ffeb3b', shape: 'rect', layer: 2 },
  props: { score: 0 },                 // freie Werte – alles, was das Spiel braucht
  behaviors: [
    { type: 'keyboardMove', speed: 150 },
    { type: 'health', max: 3 },
  ],
}
```

**Vererbung** mit `extends`: `tags` und `behaviors` werden angehängt, `props` und `appearance` zusammengeführt, der Rest überschrieben.

```js
enemy: { tags: ['enemy'], behaviors: [{ type: 'damageOnTouch', target: 'player' }] },
ghost: { extends: 'enemy', appearance: { color: 'red' }, behaviors: [/* ... */] },
```

Objekte sind ebenfalls Entities: eine Truhe ist `{ solid: true }` ohne Verhalten, eine Münze hat das Verhalten `collectible`.

## 3. Spawn-Punkte

Zwei gleichwertige Wege:

- **Im Layout** über die Legende (siehe oben) – praktisch zum „Malen“ von Levels.
- **Als Liste** `spawns` – mit individuellen Überschreibungen pro Exemplar:

```js
spawns: [
  { template: 'slime', x: 13, y: 1, props: { path: [{ x: 13, y: 1 }, { x: 18, y: 1 }] } },
  { template: 'ghost', x: 5, y: 5, appearance: { color: 'cyan' }, behaviors: ['idle'] },
]
```

Positionen sind Kachelkoordinaten; die Entity wird in der Kachel zentriert. `entity.respawn()` setzt sie an ihren Spawn zurück. Zur Laufzeit: `world.spawn({ template, x, y, ... })`.

## 4. Verhalten (der dynamische Kern)

Ein Verhalten ist ein Objekt mit optionalen **Hooks**:

| Hook | Wann |
|---|---|
| `init({ entity, options, state })` | beim Hinzufügen |
| `update({ entity, world, dt, options, state })` | jeden Frame |
| `onCollide({ entity, world, other, ... })` | bei Berührung mit einer anderen Entity |
| `onDamage({ entity, world, amount, source, ... })` | wenn jemand Schaden zufügt |
| `draw({ entity, ctx, ... })` | nach dem Zeichnen der Entity |
| `destroy({ entity, ... })` | beim Entfernen |

`options` kommen aus der Beschreibung (`{ type: 'wander', speed: 50 }`), `state` ist privat pro Instanz. Eigene Hooks sind möglich: `entity.callHook('onInteract', { world })`.

**Vorhandene Bausteine** (`content/behaviors.js`):

| Baustein | Funktion |
|---|---|
| `idle` | nichts |
| `keyboardMove` | Steuerung per Tastatur (`keys` für andere Belegung, z. B. 2. Spieler) |
| `patrol` | läuft Wegpunkte ab (`path` oder `props.path`) |
| `wander` | läuft zufällig umher |
| `chase` / `flee` | läuft zu / weg von `target` (Name oder Tag) |
| `health` | Lebenspunkte, Unverwundbarkeit, Respawn, Ereignis `died` |
| `damageOnTouch` | fügt `target` bei Berührung Schaden zu |
| `collectible` | wird von `by` eingesammelt, `give` addiert Werte auf dessen props |
| `stateMachine` | Zustände mit eigenen Verhalten, Aussehen und Übergängen |

Eigener Baustein = ein neuer Eintrag, z. B.:

```js
blink: {
  update({ entity, world, options }) {
    entity.visible = Math.floor(world.time * (options.rate ?? 2)) % 2 === 0;
  },
},
```

### Zustandsmaschine: Verhalten, das sich selbst verändert

```js
{
  type: 'stateMachine',
  initial: 'roam',
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
}
```

**Bedingungen** (`content/conditions.js`): `always`, `never`, `nearTarget`, `farFromTarget`, `afterTime`, `chance`, `actionPressed`, `propAtLeast` und die Kombinierer `not`, `all`, `any`. Damit lassen sich z. B. Spieler-Modi bauen (`actionPressed` → Zustand „rennen“).

### Verhalten zur Laufzeit ändern

```js
const hero = game.world.find('hero');
hero.addBehavior({ type: 'chase', target: 'coin', speed: 100 }); // Autopilot
hero.removeBehavior('keyboardMove');                              // Steuerung weg
game.world.find('ghost').setBehaviors(['idle']);                  // Gegner einfrieren
```

(`window.game` ist zum Ausprobieren in der Browser-Konsole verfügbar.)

## 5. Steuerung

Tasten werden auf **Aktionen** abgebildet; Verhalten fragen nur Aktionen ab, nie Tasten.

```js
new Game(canvas, { bindings: { left: ['KeyA'], right: ['KeyD'], up: ['KeyW'], down: ['KeyS'], action: ['Space'] } });
game.input.bind('p2Left', ['ArrowLeft']);  // jederzeit erweiterbar
```

`isDown(action)`, `wasPressed(action)`, `direction({ left, right, up, down })`. Touch/Gamepad lassen sich später als weitere Quelle ergänzen, ohne Verhalten zu ändern.

## 6. Systeme (Spielregeln)

Regeln, die nicht zu einer einzelnen Entity gehören, sind Systeme mit `init`/`update`/`draw`. Im Level unter `rules`:

```js
rules: [
  { type: 'hud', lines: [{ label: 'HP', of: 'player', prop: 'hp' }] },
  { type: 'restartOn', event: 'died', message: 'Game Over' },
  { type: 'clearAll', tag: 'coin', message: 'Gewonnen!' },
]
```

Wer kein Ziel braucht, lässt `rules` einfach leer – dann ist es eine freie Sandbox.

## Ablauf

```
Game.load(level)
  ├─ level-eigene Bausteine registrieren (optional)
  ├─ Map aus Legende + Layout bauen, Spawn-Marker sammeln
  ├─ Entities spawnen (Marker + spawns) → Vorlage auflösen → Verhalten init
  └─ Systeme (rules) anlegen

jeden Frame:
  world.update(dt)
    ├─ alle Entities: Hook update
    ├─ Kollisionen: Hook onCollide (beide Seiten) + Ereignis 'collide'
    ├─ entfernte Entities aufräumen
    ├─ Systeme: update
    └─ fällige Timer (world.after)
  world.draw(ctx): Map → Entities (nach layer) → Systeme
```

## Ein anderes Spiel daraus machen – Beispiele

| Idee | Was man ändert |
|---|---|
| **Labyrinth-Flucht** | Layout ändern, Vorlage `exit` mit eigenem Verhalten `onCollide → world.events.emit('won')`, Regel `restartOn: 'won'` |
| **Pac-Man-artig** | Viele `coin`-Marker, Geister mit `stateMachine` (chase ↔ flee bei Power-Up über `propAtLeast`) |
| **Zelda-artig** | Verhalten `attack` (bei `actionPressed` Schwert-Entity spawnen), Gegner bekommen `health` |
| **Zwei Spieler** | Zweite Vorlage mit `keyboardMove { keys: { left: 'p2Left', ... } }` |
| **Prozedurale Welt** | `layout` als Funktion mit Zufall/Noise |

Der Kern bleibt dabei unverändert.

## Starten

ES-Module funktionieren nicht über `file://`, daher einen lokalen Server nutzen:

```bash
python3 -m http.server 8000   # oder: npx serve
```

Dann `http://localhost:8000` öffnen.

## Mögliche nächste Schritte (Kern)

- Sprites/Animationen (`appearance.sprite`) statt Rechtecken
- Kamera/Scrolling für große Maps
- Pathfinding (A*) als Baustein, damit `chase` um Wände herumläuft
- Level/Vorlagen als JSON-Dateien laden, später ein einfacher Map-Editor
- Räumliches Raster für Kollisionen, falls es sehr viele Entities werden
