import { WSController, WSOperation, WsParam } from '@opra/common';
import { SocketioContext } from '@opra/socketio';
import type { ChatApp } from '../app.js';

@WSController({})
export class RoomController {
  constructor(readonly app: ChatApp) {}

  @WSOperation({
    event: 'send-message',
    response: Boolean,
  })
  sendMessage(
    ctx: SocketioContext,
    @WsParam()
    roomName: string,
    @WsParam()
    message: string,
  ) {
    const room = this.app.roomService.rooms.get(roomName);
    if (!room) throw new Error(`Room ${roomName} does not exist`);
    if (!room.users.includes(ctx.socket.data.user))
      room.users.push(ctx.socket.data.user);
    ctx.__controller;
    return true;
  }
}
