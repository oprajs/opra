import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ArrayType, WSController, WSOperation, WsParam } from '@opra/common';
import { SocketioContext } from '@opra/socketio';
import { Player } from '../models/player.js';
import { AuthGuard } from '../providers/auth.guard.js';
import { TestInterceptor } from '../providers/test.interceptor.js';
import { Game1Service } from '../services/game1.service.js';

@WSController()
export class Game1Controller {
  static instanceCounter = 0;

  constructor(private readonly gameService: Game1Service) {
    Game1Controller.instanceCounter++;
  }

  @WSOperation({
    event: 'game1-add-player',
    response: Player,
  })
  @UseGuards(AuthGuard)
  @UseInterceptors(TestInterceptor)
  getPlayer(ctx: SocketioContext, @WsParam() player: Player): any {
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
