import { HttpResponseMessage } from '@opra/common';
import { ResponseHost } from '../response.host.js';

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
