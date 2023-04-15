import { HttpRequestMessage } from '@opra/common';
import { RequestHost } from '../request.host.js';

export class HttpRequestHost extends RequestHost {

  constructor(
      init: RequestHost.Initiator,
      protected _incoming: HttpRequestMessage
  ) {
    super(init);
  }

  switchToHttp(): HttpRequestMessage {
    return this._incoming;
  }

}
