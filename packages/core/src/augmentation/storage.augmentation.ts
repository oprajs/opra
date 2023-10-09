import type { MultipartIterator } from '../http/helpers/multipart-helper';
import type { Request as _Request } from '../request.js';
import type { RequestContext } from '../request-context.js';

declare module "@opra/common" {

  /* ***************************** */
  namespace Storage {

    namespace Action {
      interface Request extends _Request {
        operation: 'action';
        action: string;
      }

      interface Context extends Resource.Context {
      }
    }

    /* ***************************** */
    namespace Delete {
      interface Request extends _Request {
        operation: 'delete';
        path?: string;
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Get {
      interface Request extends _Request {
        operation: 'get';
        path?: string;
      }

      interface Context extends RequestContext {
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

      interface Context extends RequestContext {
        request: Request;
      }
    }

  }

}
