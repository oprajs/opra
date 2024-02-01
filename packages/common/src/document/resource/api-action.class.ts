import { OpraSchema } from '../../schema/index.js';
import type { ApiAction } from './api-action.js';
import { ApiEndpoint } from './api-endpoint.js';
import type { Resource } from './resource';

/**
 *
 * @class ApiActionClass
 */
export class ApiActionClass extends ApiEndpoint {
  readonly kind = 'action';

  constructor(readonly resource: Resource, readonly name: string, init: ApiAction.InitArguments) {
    super(resource, name, init);
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Action {
    const schema = super.exportSchema(options);
    return {
      kind: OpraSchema.Action.Kind,
      ...schema
    }
  }

}
