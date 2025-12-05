import { ArrayType, WSController, WSOperation, WsParam } from '@opra/common';
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

  @WSOperation({
    event: 'list-rooms',
    response: ArrayType(Room),
  })
  listRooms() {
    return Array.from(this.app.roomService.rooms.values());
  }

  @WSOperation({
    event: 'join-room',
    response: Boolean,
  })
  joinRoom(
    ctx: SocketioContext,
    @WsParam()
    roomName: string,
  ) {
    const room = this.app.roomService.rooms.get(roomName);
    if (!room) throw new Error(`Room ${roomName} does not exist`);
    if (!room.users.includes(ctx.socket.data.user))
      room.users.push(ctx.socket.data.user);
    return true;
  }
}
