import type { ChatApp } from '../app.js';
import { Room } from '../models/room.js';
import { RoomOptions } from '../models/room-options.js';

export class RoomsService {
  rooms = new Map<string, Room>();

  constructor(readonly app: ChatApp) {}

  createRoom(name: string, options: RoomOptions) {
    if (this.rooms.has(name)) {
      throw new Error(`Room ${name} already exists`);
    }
    const room: Room = {
      name,
      options,
      users: [],
    };
    this.rooms.set(name, room);
    return room;
  }
}
