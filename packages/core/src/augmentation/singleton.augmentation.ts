import { StrictOmit } from 'ts-gems';
import type { Action as _Action, CrudOperation as _Operation, PartialOutput } from '@opra/common';
import type { Request as _Request } from '../request.js';
import type { RequestContext } from '../request-context.js';

declare module "@opra/common" {

  /* ***************************** */
  namespace Singleton {

    namespace Action {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Action;
      }

      interface Context extends Resource.Context {
      }
    }

    /* ***************************** */
    namespace Create {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'create' };
        data: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Delete {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'delete' };
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Get {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'get' };
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Update {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'update' };
        data: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

  }

  /* ***************************** */
  export interface ISingleton<T> {
    create?(context: Singleton.Create.Context): Promise<PartialOutput<T>>;

    delete?(context: Singleton.Delete.Context): Promise<number> | undefined;

    get?(context: Singleton.Get.Context): Promise<PartialOutput<T> | undefined>;

    update?(context: Singleton.Update.Context): Promise<PartialOutput<T> | undefined>;

    onInit?(): Promise<void>;

    onShutdown?(): Promise<void>;
  }
}
