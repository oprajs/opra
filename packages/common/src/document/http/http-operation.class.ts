import omit from 'lodash.omit';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { HttpEndpoint } from './http-endpoint.js';
import type { HttpOperation } from './http-operation';
import { HttpRequestBody } from './http-request-body.js';
import type { HttpResource } from './http-resource.js';

/**
 *
 * @class HttpOperationClass
 */
export class HttpOperationClass extends HttpEndpoint {
  readonly kind = OpraSchema.Http.Operation.Kind;
  method: OpraSchema.Http.Operation.Method;
  composition?: string;
  compositionOptions?: any;
  requestBody?: HttpRequestBody;

  constructor(parent: HttpResource, name: string, init: HttpOperation.InitArguments) {
    super(parent, name, init);
    this.method = init.method;
    this.composition = init.composition;
    this.compositionOptions = init.compositionOptions;
  }

  setRequestBody(requestBody: HttpRequestBody.InitArguments | undefined) {
    if (requestBody)
      this.requestBody = new HttpRequestBody(this, requestBody);
    else this.requestBody = undefined;
  }

  toJSON(): OpraSchema.Http.Operation {
    const schema = super.toJSON() as OpraSchema.Http.Operation;
    return omitUndefined<OpraSchema.Http.Operation>({
      kind: this.kind,
      method: this.method,
      composition: this.composition,
      requestBody: this.requestBody?.toJSON(),
      ...omit(schema, ['kind', 'method', 'composition', 'requestBody'])
    });
  }

}
