import omit from 'lodash.omit';
import { OpraSchema } from '../../schema/index.js';
import type { ApiAction } from './api-action.js';
import { ApiEndpoint } from './api-endpoint.js';
import type { ApiResource } from './api-resource';

/**
 *
 * @class ApiActionClass
 */
export class ApiActionClass extends ApiEndpoint {
  readonly kind = OpraSchema.Action.Kind;

  constructor(parent: ApiResource, name: string, init: ApiAction.InitArguments) {
    super(parent, name, init);
  }

  exportSchema(): OpraSchema.Action {
    const schema = super.exportSchema() as OpraSchema.Action;
    return {
      kind: this.kind,
      ...omit(schema, ['kind'])
    };
  }

}
