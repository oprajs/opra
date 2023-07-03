import { ResponseHost } from '../response.host.js';
import { HttpResponseMessage } from './http-response-message.js';

export class HttpResponseHost extends ResponseHost {

  constructor(
      init: ResponseHost.Initiator,
      protected _outgoing: HttpResponseMessage
  ) {
    super(init);
  }

  switchToHttp(): HttpResponseMessage {
    return this._outgoing;
  }

}
