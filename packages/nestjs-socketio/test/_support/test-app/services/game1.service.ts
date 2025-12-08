import { Injectable } from '@nestjs/common';
import { Player } from '../models/player.js';

@Injectable()
export class Game1Service {
  static instanceCounter = 0;
  static counters = {
    getPlayers: 0,
    addPlayer: 0,
    pingAll: 0,
  };

  constructor() {
    Game1Service.instanceCounter++;
  }

  getPlayers(): Player[] {
    Game1Service.counters.getPlayers++;
    return [
      { id: 1, name: 'Player 1', age: 22 },
      { id: 1, name: 'Player 2', age: 28 },
    ];
  }

  addPlayer(player: Player): Player {
    Game1Service.counters.addPlayer++;
    return player;
  }

  pingAll() {
    Game1Service.counters.pingAll++;
  }
}
