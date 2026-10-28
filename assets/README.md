# Grafiken

Alle Bilder sind **PNG-Dateien**. Ordner:

```
assets/
  maps/        Map-Bilder (1 Pixel = 1 Kachel) und optionale Hintergrundbilder
  tiles/       Grafiken für Kacheltypen (z. B. 16 × 16)
  characters/  Grafiken für Charaktere, Gegner und Objekte
```

## Map zeichnen

- Bildgröße = Map-Größe in Kacheln (Beispiel `maps/level1.png`: 20 × 15 Pixel).
- Jede Farbe steht für eine Kachel oder einen Spawn-Punkt. Zuordnung in `src/levels/level1.js` unter `legend`:

| Farbe | Bedeutung |
|---|---|
| `#000000` schwarz | Wand |
| `#00ff00` grün | Boden |
| `#0000ff` blau | Wasser |
| `#ffff00` gelb | Sand (langsam) |
| `#ff0000` rot | Spawn Held |
| `#ff9900` orange | Münze |
| `#8b4513` braun | Truhe |
| `#006400` dunkelgrün | Baum |
| `#ff00ff` magenta | Spawn Geist |
| `#00ffff` cyan | Spawn Fledermaus |

- **Exakte Farben verwenden**: Stift/Bleistift-Werkzeug ohne Kantenglättung, kein Weichzeichnen, als PNG speichern (nicht JPG).
- Eine Farbe, die nicht in der Legende steht, erzeugt eine Fehlermeldung mit Position in der Browser-Konsole.
- Neue Farbe = neue Zeile in `legend`.

## Charaktere und Kacheln zeichnen

- Beliebige Größe, z. B. 16 × 16 oder 32 × 32. Hintergrund transparent lassen.
- **Animation**: Einzelbilder gleich groß **nebeneinander** in eine Datei (2 Bilder à 16 × 16 → 32 × 16), dann in der Vorlage `frames: 2` angeben.
- Charaktere nach **rechts schauend** zeichnen; `flip: true` spiegelt sie beim Laufen nach links.

## Empfohlene Programme (kostenlos)

- [Piskel](https://www.piskelapp.com) – im Browser, auch Animationen, Export als PNG/Sprite-Sheet
- [LibreSprite](https://libresprite.github.io) – Desktop-Programm
- Aseprite (kostenpflichtig, sehr beliebt)
