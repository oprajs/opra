import { OpraSchema } from '../../../schema/index.js';
import { DataType } from '../../data-type/data-type.js';
import { ApiOperationClass } from '../api-operation.class.js';
import type { ApiOperation } from '../api-operation.js';
import type { ApiResource } from '../api-resource.js';

/**
 *
 * @class ApiOperationClass
 */
export class ApiOperationEntity extends ApiOperationClass {
  type: DataType;

  constructor(readonly resource: ApiResource, readonly name: string, init: ApiOperation.InitArguments) {
    super(resource, name, init);
    this.type = this.document.getDataType(init.type);
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Operation {
    const schema = super.exportSchema(options);
    schema.options = {
      ...this.options,
      type: this.type.name ? this.type.name : this.type.exportSchema(options)
    };
    return schema;
  }

}
