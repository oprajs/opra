import { StrictOmit } from 'ts-gems';
import { ApiAction as _Action, ApiOperation as _Operation } from '@opra/common';
import type { MultipartIterator } from '../http/helpers/multipart-helper';
import type { Request as _Request } from '../request.js';
import type { RequestContext } from '../request-context.js';

declare module "@opra/common" {

  /* ***************************** */
  namespace Storage {

    namespace Action {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Action;
      }

      interface Context extends ApiResource.Context {
      }
    }

    /* ***************************** */
    namespace Delete {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'delete' };
        path?: string;
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Get {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'get' };
        path?: string;
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Post {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'post' };
        path?: string;
        parts: MultipartIterator;
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

  }

}
