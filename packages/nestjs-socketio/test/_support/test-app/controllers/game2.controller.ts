import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ArrayType, WSController, WSOperation, WsParam } from '@opra/common';
import { Player } from '../models/player.js';
import { AuthGuard } from '../providers/auth.guard.js';
import { TestInterceptor } from '../providers/test.interceptor.js';
import { Game2Service } from '../services/game2.service.js';

@WSController()
export class Game2Controller {
  static instanceCounter = 0;

  constructor(private readonly gameService: Game2Service) {
    Game2Controller.instanceCounter++;
  }

  @WSOperation({
    event: 'game2-add-player',
    response: Player,
  })
  @UseGuards(AuthGuard)
  @UseInterceptors(TestInterceptor)
  getPlayer(@WsParam() player: Player): any {
    return this.gameService.addPlayer(player);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(TestInterceptor)
  @WSOperation({
    event: 'game2-get-players',
    response: ArrayType(Player),
  })
  getPlayers(): any[] {
    return this.gameService.getPlayers();
  }
}
