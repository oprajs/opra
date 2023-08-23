import { Field } from '../data-type/field.interface.js';

export interface Endpoint {
  description?: string;
  parameters?: Record<Endpoint.Parameter.Name, Endpoint.Parameter>
}

export namespace Endpoint {
  export interface Parameter extends Pick<Field, 'type' | 'description' | 'isArray' | 'default' |
      'required' | 'deprecated' | 'examples'> {
  }

  export namespace Parameter {
    export type Name = string;
  }
}

