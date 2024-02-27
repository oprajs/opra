import omit from 'lodash.omit';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ApiEndpoint } from './api-endpoint.js';
import type { ApiOperation } from './api-operation.js';
import { ApiRequestBody } from './api-request-body.js';
import type { ApiResource } from './api-resource';

/**
 *
 * @class ApiOperationClass
 */
export class ApiOperationClass extends ApiEndpoint {
  readonly kind = OpraSchema.Operation.Kind;
  method: OpraSchema.Operation.Method;
  composition?: string;
  requestBody?: ApiRequestBody;

  constructor(parent: ApiResource, name: string, init: ApiOperation.InitArguments) {
    super(parent, name, init);
    this.method = init.method;
    this.composition = init.composition;
    if (init.requestBody)
      this.requestBody = new ApiRequestBody(this, init.requestBody);
  }

  exportSchema(): OpraSchema.Operation {
    const schema = super.exportSchema() as OpraSchema.Operation;
    return omitUndefined<OpraSchema.Operation>({
      kind: this.kind,
      method: this.method,
      composition: this.composition,
      requestBody: this.requestBody?.exportSchema(),
      ...omit(schema, ['kind', 'method', 'composition', 'requestBody'])
    });
  }

}
