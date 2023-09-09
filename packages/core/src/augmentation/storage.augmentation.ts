import type { EndpointContext } from '../endpoint-context.js';
import type { MultipartIterator } from '../http/helpers/multipart-helper';
import type { Request as _Request } from '../request.js';

declare module "@opra/common" {

  /* ***************************** */
  namespace Storage {

    namespace Action {
      interface Context<TSession extends {} = {}> extends Resource.Context<TSession> {
      }
    }

    /* ***************************** */
    namespace Delete {
      interface Request extends _Request {
        operation: 'delete';
        path?: string;
      }

      interface Context<TSession extends {} = {}> extends EndpointContext<TSession> {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Get {
      interface Request extends _Request {
        operation: 'get';
        path?: string;
      }

      interface Context<TSession extends {} = {}> extends EndpointContext<TSession> {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Post {
      interface Request extends _Request {
        operation: 'post';
        path?: string;
        parts: MultipartIterator;
      }

      interface Context<TSession extends {} = {}> extends EndpointContext<TSession> {
        request: Request;
      }
    }

  }

}
