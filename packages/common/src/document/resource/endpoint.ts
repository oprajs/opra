import { StrictOmit } from 'ts-gems';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DataType } from '../data-type/data-type.js';

/**
 *
 * @class Endpoint
 */
export class Endpoint {
  readonly name: string;
  description?: string;
  parameters: ResponsiveMap<EndpointParameter>;

  [key: string]: any;

  constructor(init: Endpoint.InitArguments) {
    Object.assign(this, init);
    this.parameters = new ResponsiveMap();
    if (init.parameters) {
      for (const [n, p] of Object.entries(init.parameters)) {
        this.parameters.set(n, new EndpointParameter(p));
      }
    }
  }

  exportSchema(): OpraSchema.Endpoint {
    const schema = omitUndefined<OpraSchema.Endpoint>({
      description: this.description
    });
    if (this.parameters.size) {
      schema.parameters = {};
      for (const [name, param] of this.parameters.entries()) {
        schema.parameters[name] = param.exportSchema();
      }
    }
    return schema;
  }
}

export namespace Endpoint {
  export interface InitArguments extends OpraSchema.Endpoint {
    name: string;
  }

}

/**
 *
 * @class EndpointParameter
 */
export class EndpointParameter implements StrictOmit<OpraSchema.Endpoint.Parameter, 'type'> {
  readonly name: string;
  readonly type: string | DataType;
  description?: string;
  isArray?: boolean;
  default?: any;
  required?: boolean;
  deprecated?: boolean | string;

  constructor(init: OpraSchema.Endpoint.Parameter) {
    Object.assign(this, init);
  }

  exportSchema(): OpraSchema.Endpoint.Parameter {
    return omitUndefined<OpraSchema.Endpoint.Parameter>({
      type: typeof this.type === 'string' ? this.type : this.type.exportSchema(),
      description: this.description,
      isArray: this.isArray
    })
  }
}

