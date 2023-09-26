import type { PartialOutput } from '@opra/common';
import type { Request as _Request } from '../request.js';
import type { RequestContext } from '../request-context.js';

declare module "@opra/common" {

  /* ***************************** */
  namespace Singleton {

    namespace Action {
      interface Request extends _Request {
        operation: 'action';
        action: string;
      }

      interface Context<TSession extends {} = {}> extends Resource.Context<TSession> {
      }
    }

    /* ***************************** */
    namespace Create {
      interface Request extends _Request {
        operation: 'create';
        data: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context<TSession extends {} = {}> extends RequestContext<TSession> {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Delete {
      interface Request extends _Request {
        operation: 'delete';
      }

      interface Context<TSession extends {} = {}> extends RequestContext<TSession> {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Get {
      interface Request extends _Request {
        operation: 'get';
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context<TSession extends {} = {}> extends RequestContext<TSession> {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Update {
      interface Request extends _Request {
        operation: 'update';
        data: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context<TSession extends {} = {}> extends RequestContext<TSession> {
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
