# Konzept: Grundgerüst für ein JavaScript-Minispiel

Ziel ist ein kleines, leicht erweiterbares 2D-Top-Down-Spiel (Canvas, reines JavaScript mit ES-Modulen, keine Abhängigkeiten).
Grundidee: **Level = Daten, Module = Logik.** Ein Level beschreibt nur *was* wo ist; die Module wissen, *wie* es funktioniert.

## Projektstruktur

```
index.html            Canvas + Einbindung von src/main.js
src/
  main.js             Welt aus Level erzeugen, Game-Loop (update → draw)
  levels/level1.js    Level-Daten: Layout, Objekte, Spawn-Punkte, Gegnerverhalten
  map.js              Map aufbauen, Kacheltypen, Kollision, Objekte verwalten
  objects.js          Objekttypen (Hindernisse, einsammelbare Gegenstände)
  entity.js           Basisklasse für alles, was sich bewegt
  player.js           Charakter
  enemy.js            Gegnertypen + Verhaltensweisen
  input.js            Steuerung (Tastatur)
```

## Die Bausteine

### 1. Map aufbauen (`map.js`)
- Die Map ist ein Raster aus Kacheln (`tileSize` = 32 px), im Level als Text-Zeilen beschrieben:
  `#` Wand, `.` Boden, `~` Wasser.
- `TILES` legt pro Zeichen fest, ob die Kachel **solid** (nicht begehbar) ist und wie sie aussieht.
- `isBlocked(x, y, w, h)` prüft ein Rechteck gegen solide Kacheln **und** solide Objekte. Diese eine Funktion nutzen Spieler und Gegner für die Kollision.
- Neue Kachel = ein neuer Eintrag in `TILES` (z. B. `'^': { solid: false, damage: 1 }` für Stacheln).

### 2. Charakter erstellen (`player.js`, `entity.js`)
- `Entity` enthält das Gemeinsame: Position, Größe, Geschwindigkeit, `moveBy()` mit Kollision (Achsen getrennt → an Wänden entlanggleiten), `overlaps()`, `distanceTo()`, `respawn()`.
- `Player extends Entity` ergänzt Lebenspunkte, Punkte und kurze Unverwundbarkeit nach einem Treffer.

### 3. Objekte auf der Map platzieren (`objects.js`)
- Objekttypen werden zentral in `OBJECT_TYPES` definiert: `chest`, `tree` (solid), `coin` (collectible, gibt Punkte).
- Im Level stehen nur Typ + Kachelposition: `{ type: 'coin', x: 8, y: 8 }`.
- Beim Erzeugen der Welt wird jedes Objekt per `map.placeObject()` auf die Map gesetzt.

### 4. Charakter-Spawn-Punkt setzen
- Im Level: `playerSpawn: { x: 2, y: 2 }` (Kachelkoordinaten).
- `map.spawnPosition(tile, size)` rechnet in Pixel um und zentriert die Figur in der Kachel.
- Der Spawn wird in der Entity gespeichert; nach einem Treffer setzt `respawn()` den Charakter dorthin zurück.

### 5. Gegner erstellen (`enemy.js`)
- `ENEMY_TYPES` definiert Werte pro Typ: Größe, Tempo, Farbe, Sichtweite, `aggressive`.
  - `slime` – langsam, patrouilliert stur
  - `ghost` – läuft umher, verfolgt den Spieler bei Sichtkontakt
  - `bat` – schnell, kleine Sichtweite
- `Enemy extends Entity`, d. h. Bewegung und Kollision sind dieselben wie beim Spieler.

### 6. Gegner-Spawn-Punkte setzen
- Im Level als Liste `enemySpawns`, jeder Eintrag mit Typ, Position und Grundverhalten:
  ```js
  { type: 'slime', x: 13, y: 1, behavior: 'patrol', path: [{ x: 13, y: 1 }, { x: 18, y: 1 }, ...] }
  ```
- Mehrere Gegner gleichen Typs = mehrere Einträge.

### 7. Gegner-Verhaltensweisen
- Jedes Verhalten ist eine Funktion in `BEHAVIORS`, die den Gegner für einen Frame steuert:
  | Verhalten | Beschreibung |
  |-----------|--------------|
  | `idle`    | bleibt stehen |
  | `patrol`  | läuft Wegpunkte (`path`) im Kreis ab |
  | `wander`  | wählt alle 1–2,5 s eine zufällige Richtung, bei Hindernis sofort eine neue |
  | `chase`   | läuft direkt auf den Spieler zu |
- **Einfache Zustandsmaschine** in `Enemy.update()`: Aggressive Gegner wechseln in `chase`, wenn der Spieler innerhalb von `viewRange` ist, und kehren sonst zum Grundverhalten zurück. Ein `!` über dem Gegner zeigt den Verfolgungszustand.
- Neues Verhalten (z. B. `flee`, `guard`) = neue Funktion in `BEHAVIORS`, im Level per `behavior` zuweisen.

### 8. Steuerung Charakter (`input.js`)
- `Input` speichert gedrückte Tasten (`keydown`/`keyup`) und löscht sie bei Fokusverlust.
- Tastenbelegung zentral in `KEYS` (Pfeiltasten + WASD), leicht änderbar.
- `direction()` liefert einen normalisierten Richtungsvektor, damit Diagonal-Laufen nicht schneller ist.
- Der Spieler fragt die Richtung jeden Frame ab und bewegt sich mit `speed * dt`.

## Ablauf (Game-Loop in `main.js`)

```
createWorld(level)
  → Map aufbauen → Objekte platzieren → Spieler am Spawn → Gegner an Spawns

jeden Frame (requestAnimationFrame):
  dt = vergangene Zeit (max. 0,05 s)
  update(dt):
    Spieler bewegen (Steuerung)
    Gegner updaten (Verhalten)
    Kollision Spieler ↔ Münzen  → einsammeln, Punkte
    Kollision Spieler ↔ Gegner  → Treffer, Respawn; HP = 0 → Level neu
    alle Münzen gesammelt       → Level neu
  draw():
    Map + Objekte → Gegner → Spieler → HUD
```

Alle Bewegungen werden mit `dt` (Delta-Zeit) multipliziert, damit das Spiel auf 60-Hz- und 144-Hz-Bildschirmen gleich schnell läuft.

## Starten

ES-Module funktionieren nicht über `file://`, daher einen lokalen Server nutzen:

```bash
python3 -m http.server 8000
# oder: npx serve
```

Dann `http://localhost:8000` öffnen.

## Mögliche nächste Schritte
- Sprites/Animationen statt farbiger Rechtecke (`ctx.drawImage`)
- Kamera/Scrolling für Maps, die größer als der Bildschirm sind
- Pathfinding (A*) für `chase`, damit Gegner um Wände herumlaufen
- Angriff des Spielers (z. B. Leertaste) und Gegner-Lebenspunkte
- Mehrere Level und ein Level-Wechsel über ein Ausgangs-Objekt
- Sound, Start-/Game-Over-Bildschirm, Touch-Steuerung
