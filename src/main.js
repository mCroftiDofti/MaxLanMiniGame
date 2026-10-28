import { Game } from './engine/game.js';
import { registerContent } from './content/index.js';
import level1 from './levels/level1.js';

registerContent();
const game = new Game(document.getElementById('game'));
game.load(level1);
game.start();

// Zum Ausprobieren in der Browser-Konsole, z. B.:
//   game.world.find('hero').addBehavior({ type: 'chase', target: 'coin', speed: 100 })
window.game = game;
