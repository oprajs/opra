import omit from 'lodash.omit';
import { isAny, Validator } from 'valgen';
import { OpraSchema } from '../../schema/index.js';
import { ApiEndpoint } from './api-endpoint.js';
import type { ApiOperation } from './api-operation.js';
import type { ApiResource } from './api-resource';

/**
 *
 * @class ApiOperationClass
 */
export class ApiOperationClass extends ApiEndpoint {
  readonly kind = OpraSchema.Operation.Kind;
  readonly method: OpraSchema.Operation.Method;
  readonly composition?: string;
  decodeInput: Validator = isAny;

  constructor(readonly resource: ApiResource, readonly name: string, init: ApiOperation.InitArguments) {
    super(resource, name, init);
    this.method = init.method || 'GET';
    this.composition = init.composition;
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Operation {
    const schema = super.exportSchema(options) as OpraSchema.Operation;
    return {
      kind: this.kind,
      method: this.method,
      composition: this.composition,
      ...omit(schema, ['kind', 'method', 'composition'])
    };
  }

}
