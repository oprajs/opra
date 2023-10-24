import { StrictOmit } from 'ts-gems';
import * as vg from 'valgen';
import { DataType } from '../data-type/data-type.js';
import { Endpoint } from './endpoint.js';
import type { Resource } from './resource';
import type { ResourceDecorator } from './resource-decorator.js';

/**
 *
 * @class Operation
 */
export class Operation extends Endpoint {
  readonly kind = 'operation';
  decodeInput: vg.Validator = vg.isAny();
  returnType: DataType;
  encodeReturning: vg.Validator = vg.isAny();

  constructor(readonly resource: Resource, readonly name: string, init: Operation.InitArguments) {
    super(resource, name, init);
    this.returnType = init.returnType instanceof DataType
        ? init.returnType : this.resource.document.getDataType(init.returnType || 'any');
    this.encodeReturning = this.returnType.generateCodec('encode', {operation: 'read'});
  }

}

export namespace Operation {
  export interface InitArguments extends StrictOmit<ResourceDecorator.OperationMetadata, 'parameters'> {
    parameters: Record<string, Endpoint.ParameterInit>;
    returnType?: DataType;
  }

}

