import { RequestHost } from '../request.host.js';
import { HttpRequestMessage } from './http-request-message.js';

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
