import { Field } from '../data-type/field.interface.js';

export interface Endpoint<TOptions extends Object = any> {
  description?: string;
  parameters?: Record<Endpoint.Parameter.Name, Endpoint.Parameter>
  options?: TOptions;
}

export namespace Endpoint {
  export interface Parameter extends Pick<Field, 'type' | 'description' | 'isArray' | 'default' |
      'required' | 'deprecated' | 'examples'> {
  }

  export namespace Parameter {
    export type Name = string;
  }
}

