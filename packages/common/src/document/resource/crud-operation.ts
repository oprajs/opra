import { StrictOmit } from 'ts-gems';
import * as vg from 'valgen';
import { OpraSchema } from '../../schema/index.js';
import { DataType } from '../data-type/data-type.js';
import { ApiField } from '../data-type/field.js';
import { Endpoint } from './endpoint.js';
import type { Resource } from './resource';
import type { ResourceDecorator } from './resource-decorator.js';

/**
 *
 * @class CrudOperation
 */
export class CrudOperation extends Endpoint {
  readonly kind = 'operation';
  decodeInput: vg.Validator = vg.isAny();
  returnType: DataType;
  encodeReturning: vg.Validator = vg.isAny();
  inputOverwriteFields?: Record<string, ApiField.InitArguments>;
  outputOverwriteFields?: Record<string, ApiField.InitArguments>;

  constructor(readonly resource: Resource, readonly name: string, init: CrudOperation.InitArguments) {
    super(resource, name, init);
    this.returnType = init.returnType instanceof DataType
        ? init.returnType : this.resource.document.getDataType(init.returnType || 'any');
    this.encodeReturning = this.returnType.generateCodec('encode', {operation: 'read'});
    this.inputOverwriteFields = init.options.inputOverwriteFields;
    this.outputOverwriteFields = init.options.outputOverwriteFields;
  }

  exportSchema(options?: { webSafe?: boolean }) {
    const schema: OpraSchema.Endpoint & Record<string, any> = super.exportSchema(options);
    if (this.inputOverwriteFields) {
      const trg = schema.options.inputOverwriteFields = {};
      Object.keys(this.inputOverwriteFields)
          .forEach(([k, o]) => {
            trg[k] = ApiField.prototype.exportSchema.call(o, options);
          })
    }
    if (this.outputOverwriteFields) {
      const trg: any = schema.options.outputOverwriteFields = {};
      Object.keys(this.outputOverwriteFields)
          .forEach(([k, o]) => {
            trg[k] = ApiField.prototype.exportSchema.call(o, options);
          })
    }
    return schema;
  }

}

export namespace CrudOperation {
  export interface InitArguments extends StrictOmit<ResourceDecorator.OperationMetadata, 'parameters'> {
    parameters: Record<string, Endpoint.ParameterInit>;
    returnType?: DataType;
  }

}

