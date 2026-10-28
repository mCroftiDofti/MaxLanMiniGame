// Bilder laden und zwischenspeichern; Pixel-Maps auslesen.
const pending = new Map();
const loaded = new Map();

// Fehlt ein Bild, wird gewarnt und null geliefert – dann wird stattdessen die Farbe gezeichnet.
export function loadImage(src) {
  if (!pending.has(src)) {
    pending.set(src, new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        loaded.set(src, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Bild "${src}" konnte nicht geladen werden – es wird die Farbe verwendet`);
        resolve(null);
      };
      img.src = src;
    }));
  }
  return pending.get(src);
}

// Bereits geladenes Bild (synchron, fürs Zeichnen). Unbekannte Bilder werden im Hintergrund nachgeladen.
export function getImage(src) {
  if (!src) return null;
  if (!pending.has(src)) loadImage(src);
  return loaded.get(src) ?? null;
}

export function preloadImages(srcs) {
  return Promise.all([...new Set(srcs.filter(Boolean))].map(loadImage));
}

// Liest ein Bild Pixel für Pixel: ein Pixel = eine Kachel.
// Ergebnis: Zeilen mit Farbcodes ('#rrggbb', vollständig transparente Pixel = 'transparent').
export async function readPixelMap(src) {
  const img = await loadImage(src);
  if (!img) throw new Error(`Map-Bild "${src}" konnte nicht geladen werden`);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, img.width, img.height);
  const hex = (v) => v.toString(16).padStart(2, '0');
  return Array.from({ length: img.height }, (_, y) => Array.from({ length: img.width }, (_, x) => {
    const i = (y * img.width + x) * 4;
    return data[i + 3] === 0 ? 'transparent' : `#${hex(data[i])}${hex(data[i + 1])}${hex(data[i + 2])}`;
  }));
}
