import { StrictOmit } from 'ts-gems';
import * as vg from 'valgen';
import { OpraSchema } from '../../schema/index.js';
import { ComplexType } from '../data-type/complex-type.js';
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
  inputOverwrite?: ComplexType;
  outputOverwrite?: ComplexType;

  constructor(readonly resource: Resource, readonly name: string, init: CrudOperation.InitArguments) {
    super(resource, name, init);
    this.returnType = init.returnType instanceof DataType
        ? init.returnType : this.resource.document.getDataType(init.returnType || 'any');
    this.encodeReturning = this.returnType.generateCodec('encode', {operation: 'read'});
    if (init.options.inputOverwriteFields) {
      this.inputOverwrite = new ComplexType(resource.document, {});
      for (const [k, o] of Object.entries<any>(init.options.inputOverwriteFields)) {
        const f = new ApiField(this.inputOverwrite, {...o, name: k});
        this.inputOverwrite.own.fields.set(k, f);
        this.inputOverwrite.fields.set(k, f);
      }
    }
    if (init.options.outputOverwriteFields) {
      this.outputOverwrite = new ComplexType(resource.document, {});
      for (const [k, o] of Object.entries<any>(init.options.outputOverwriteFields)) {
        const f = new ApiField(this.outputOverwrite, {...o, name: k});
        this.outputOverwrite.own.fields.set(k, f);
        this.outputOverwrite.fields.set(k, f);
      }
    }
  }

  exportSchema(options?: { webSafe?: boolean }) {
    const schema: OpraSchema.Endpoint & Record<string, any> = super.exportSchema(options);
    if (this.inputOverwrite) {
      const x = this.inputOverwrite.exportSchema(options);
      schema.options.inputOverwriteFields = {...x.fields};
    }
    if (this.outputOverwrite) {
      const x = this.outputOverwrite.exportSchema(options);
      schema.options.outputOverwriteFields = {...x.fields};
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

