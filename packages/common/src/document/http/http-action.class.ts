import omit from 'lodash.omit';
import { OpraSchema } from '../../schema/index.js';
import type { HttpAction } from './http-action';
import { HttpEndpoint } from './http-endpoint.js';
import type { HttpResource } from './http-resource.js';

/**
 *
 * @class HttpActionClass
 */
export class HttpActionClass extends HttpEndpoint {
  readonly kind = OpraSchema.Http.Action.Kind;

  constructor(parent: HttpResource, name: string, init: HttpAction.InitArguments) {
    super(parent, name, init);
  }

  toJSON(): OpraSchema.Http.Action {
    const schema = super.toJSON() as OpraSchema.Http.Action;
    return {
      kind: this.kind,
      ...omit(schema, ['kind'])
    };
  }

}
