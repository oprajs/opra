import { StrictOmit } from 'ts-gems';
import { isAny, Validator } from 'valgen';
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
  returnType?: DataType;
  returnMime?: string;
  encodeReturning: Validator = isAny;

  constructor(readonly resource: Resource, readonly name: string, init: Action.InitArguments) {
    super(resource, name, init);
    if (init.returnType)
      this.returnType = init.returnType instanceof DataType
          ? init.returnType : this.resource.document.getDataType(init.returnType);
    this.returnMime = init.returnMime;
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Endpoint {
    const schema = super.exportSchema(options) as OpraSchema.Action;
    if (this.returnType)
      schema.returnType = this.returnType.isAnonymous
          ? this.returnType.exportSchema(options)
          : this.returnType.name;
    if (this.returnMime)
      schema.returnMime = this.returnMime;
    return schema;
  }

}

export namespace Action {
  export interface InitArguments extends StrictOmit<ResourceDecorator.ActionMetadata, 'parameters' | 'returnType'> {
    parameters: Record<string, Endpoint.ParameterInit>;
    returnType?: DataType;
    returnMime?: string;
  }
}

