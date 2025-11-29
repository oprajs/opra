import { WSController, WSOperation, WsParam } from '@opra/common';
import { SocketioContext } from '@opra/socketio';
import type { ChatApp } from '../app.js';
import { Room } from '../models/room.js';
import { RoomOptions } from '../models/room-options.js';

@WSController({})
export class MainController {
  constructor(readonly app: ChatApp) {}

  @WSOperation({
    event: 'create-room',
    response: Room,
  })
  createRoom(
    ctx: SocketioContext,
    @WsParam()
    name: string,
    @WsParam()
    options: RoomOptions,
  ) {
    return this.app.roomService.createRoom(name, options);
  }

  // @WSOperation({
  //   event: 'create-room',
  //   response: Room,
  // })
  // listRooms() {
  //   this.app.roomService.rooms.values()
  //   return this.app.roomService.createRoom(name, options);
  // }

  joinRoom() {}
}
