import { StrictOmit } from 'ts-gems';
import * as vg from 'valgen';
import { ResponsiveMap } from '../../helpers/index.js';
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
  inputOverwriteFields?: ResponsiveMap<ApiField.InitArguments>;
  outputOverwriteFields?: ResponsiveMap<ApiField.InitArguments>;

  constructor(readonly resource: Resource, readonly name: string, init: CrudOperation.InitArguments) {
    super(resource, name, init);
    this.returnType = init.returnType instanceof DataType
        ? init.returnType : this.resource.document.getDataType(init.returnType || 'any');
    this.encodeReturning = this.returnType.generateCodec('encode', {operation: 'read'});
    if (init.options?.inputOverwriteFields)
      this.inputOverwriteFields = new ResponsiveMap(init.options.inputOverwriteFields);
    if (init.options?.outputOverwriteFields)
      this.outputOverwriteFields = new ResponsiveMap(init.options.outputOverwriteFields);
  }

  exportSchema(options?: { webSafe?: boolean }) {
    const schema: OpraSchema.Endpoint & Record<string, any> = super.exportSchema(options);
    if (this.inputOverwriteFields) {
      const trg: any = schema.options.inputOverwriteFields = {};
      Array.from(this.inputOverwriteFields.entries())
          .forEach(([k, o]) => {
            trg[k] = ApiField.prototype.exportSchema.call(o, options);
          })
    }
    if (this.outputOverwriteFields) {
      const trg: any = schema.options.outputOverwriteFields = {};
      Array.from(this.outputOverwriteFields.entries())
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

