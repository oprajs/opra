import { Injectable, Scope } from '@nestjs/common';
import { Player } from '../models/player.js';

@Injectable({ scope: Scope.REQUEST })
export class Game2Service {
  static instanceCounter = 0;
  static counters = {
    getPlayers: 0,
    addPlayer: 0,
    pingAll: 0,
  };

  constructor() {
    Game2Service.instanceCounter++;
  }

  getPlayers(): Player[] {
    Game2Service.counters.getPlayers++;
    return [
      { id: 1, name: 'Player 1', age: 22 },
      { id: 1, name: 'Player 2', age: 28 },
    ];
  }

  addPlayer(player: Player): Player {
    Game2Service.counters.addPlayer++;
    return player;
  }

  pingAll() {
    Game2Service.counters.pingAll++;
  }
}
