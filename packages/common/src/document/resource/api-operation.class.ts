import { isAny, Validator } from 'valgen';
import { OpraSchema } from '../../schema/index.js';
import { ApiField } from '../data-type/field.js';
import { ApiEndpoint } from './api-endpoint.js';
import type { ApiOperation } from './api-operation.js';
import type { Resource } from './resource.js';

/**
 *
 * @class ApiOperationClass
 */
export class ApiOperationClass extends ApiEndpoint {
  readonly kind = 'operation';
  decodeInput: Validator = isAny;
  inputOverwriteFields?: Record<string, ApiField.InitArguments>;
  outputOverwriteFields?: Record<string, ApiField.InitArguments>;

  constructor(readonly resource: Resource, readonly name: string, init: ApiOperation.InitArguments) {
    super(resource, name, init);
    this.inputOverwriteFields = init.options?.inputOverwriteFields;
    this.outputOverwriteFields = init.options?.outputOverwriteFields;
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
