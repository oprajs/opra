import { HttpResponseMessage } from '@opra/common';

export interface Response {
  value?: any;
  errors: Error[];
  continueOnError?: boolean;

  switchToHttp(): HttpResponseMessage;

  switchToWs(): never;

  switchToRpc(): never;
}
