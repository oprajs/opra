import { Endpoint } from './endpoint.interface.js';

export interface Action extends Endpoint {
  kind: Action.Kind;
}

export namespace Action {
  export const Kind = 'Action';
  export type Kind = 'Action';
}

