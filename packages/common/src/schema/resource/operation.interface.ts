import { Endpoint } from './endpoint.interface.js';

export interface Operation extends Endpoint {
  kind: Operation.Kind;
  method: Operation.Method;
  composition?: string;
}

export namespace Operation {
  export const Kind = 'Operation';
  export type Kind = typeof Kind;
  export type Method = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

}
