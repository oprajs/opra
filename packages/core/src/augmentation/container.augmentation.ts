import { StrictOmit } from 'ts-gems';
import { ApiAction as _Action } from '@opra/common';
import type { Request as _Request } from '../request.js';

declare module "@opra/common" {

  /* ***************************** */
  namespace Container {

    namespace Action {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Action;
      }

      interface Context extends ApiResource.Context {
      }
    }
  }

}
