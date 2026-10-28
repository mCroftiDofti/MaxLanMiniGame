// Systeme = Spielregeln auf Welt-Ebene. Hooks: init({ world, options, state }), update({ world, dt, ... }), draw({ world, ctx, ... })
export default {
  // Zeigt props einer Entity an. lines: [{ label, of: 'name/tag', prop }]
  hud: {
    draw({ world, ctx, options }) {
      ctx.fillStyle = '#fff';
      ctx.font = '16px sans-serif';
      const text = (options.lines ?? [])
        .map(({ label, of, prop }) => `${label}: ${world.find(of)?.props[prop] ?? '-'}`)
        .join('   ');
      ctx.fillText(text, 8, 20);

      if (world.data.message) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, world.map.pixelHeight / 2 - 30, world.map.pixelWidth, 60);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(world.data.message, world.map.pixelWidth / 2, world.map.pixelHeight / 2 + 10);
        ctx.textAlign = 'start';
      }
    },
  },

  // Bei einem Ereignis Nachricht zeigen und Level neu starten.
  restartOn: {
    init({ world, options }) {
      world.events.on(options.event, () => endLevel(world, options));
    },
  },

  // Wenn keine Entity mit `tag` mehr übrig ist: Nachricht und Neustart.
  clearAll: {
    update({ world, options, state }) {
      if (!state.done && world.findAll(options.tag).length === 0) {
        state.done = true;
        endLevel(world, options);
      }
    },
  },
};

function endLevel(world, { message, delay = 2 }) {
  if (world.data.ending) return;
  world.data.ending = true;
  world.data.message = message;
  world.after(delay, () => world.game.restart());
}
