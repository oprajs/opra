import { StrictOmit } from 'ts-gems';
import * as vg from 'valgen';
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

  constructor(readonly resource: Resource, readonly name: string, init: Operation.InitArguments) {
    super(resource, name, init);
  }

}

export namespace Operation {
  export interface InitArguments extends StrictOmit<ResourceDecorator.OperationMetadata, 'parameters'> {
    parameters: Record<string, Endpoint.ParameterInit>;
  }

}

