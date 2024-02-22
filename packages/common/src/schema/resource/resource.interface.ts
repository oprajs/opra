import type { Action } from './action.interface.js';
import type { Operation } from './operation.interface.js';
import type { Parameter } from './parameter.interface.js';

export interface Resource {
  kind: string;
  description?: string;
  key?: KeyParameter;
  endpoints?: Record<string, Action | Operation>;
  resources?: Record<string, Resource>;
}

export namespace Resource {
  export type Name = string;
  export const Kind = 'Resource';
  export type Kind = 'Resource';

}

export interface KeyParameter extends Omit<Parameter, 'name' | 'in' | 'required' | 'isArray'> {
  name: string;
}
