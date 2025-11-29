import { WSController } from '@opra/common';
import type { ChatApp } from '../app.js';

@WSController({})
export class RoomController {
  constructor(readonly app: ChatApp) {}
}
