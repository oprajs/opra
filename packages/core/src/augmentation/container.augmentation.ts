import type { Request as _Request } from '../request.js';

declare module "@opra/common" {

  /* ***************************** */
  namespace Container {

    namespace Action {
      interface Request extends _Request {
        operation: 'action';
        action: string;
      }

      interface Context<TSession extends {} = {}> extends Resource.Context<TSession> {
      }
    }
  }

}
