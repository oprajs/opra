import { ApiDocument, ApiDocumentFactory } from '@opra/common';
import { SocketioAdapter } from '@opra/socketio';
import { MainController } from './api/main-controller.js';
import { RoomController } from './api/room-controller.js';
import { Room } from './models/room.js';
import { RoomOptions } from './models/room-options.js';
import { RoomsService } from './services/rooms.service.js';

export class ChatApp {
  declare adapter: SocketioAdapter;
  declare document: ApiDocument;
  declare roomService: RoomsService;

  constructor() {
    this.roomService = new RoomsService(this);
  }

  async start() {
    this.document = await ApiDocumentFactory.createDocument({
      info: {
        title: 'Customer Application',
        version: '1.0',
      },
      types: [RoomOptions, Room],
      api: {
        name: 'ChatApi',
        transport: 'ws',
        controllers: [new MainController(this), new RoomController(this)],
      },
    });
    this.adapter = new SocketioAdapter(this.document, {
      scope: 'api',
    } as SocketioAdapter.Options);
    this.adapter.listen(6001);
  }
}

export const app = new ChatApp();
