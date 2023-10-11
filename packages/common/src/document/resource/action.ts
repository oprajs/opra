import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { DataType } from '../data-type/data-type.js';
import { Endpoint } from './endpoint.js';
import type { Resource } from './resource';
import type { ResourceDecorator } from './resource-decorator.js';

/**
 *
 * @class Action
 */
export class Action extends Endpoint {
  readonly kind = 'action';

  constructor(readonly resource: Resource, readonly name: string, init: Action.InitArguments) {
    super(resource, name, init);
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Endpoint {
    const schema = super.exportSchema(options) as OpraSchema.Action;
    if (this.returnType)
      schema.returnType = this.returnType.name ? this.returnType.name : this.returnType.exportSchema(options);
    return schema;
  }

}

export namespace Action {
  export interface InitArguments extends StrictOmit<ResourceDecorator.ActionMetadata, 'parameters' | 'returnType'> {
    parameters: Record<string, Endpoint.ParameterInit>;
    returnType: DataType;
  }
}

