import type { PartialOutput } from '@opra/common';
import type { EndpointContext } from '../endpoint-context.js';
import type { Request as _Request } from '../request.js';

declare module "@opra/common" {

  /* ***************************** */
  namespace Collection {

    namespace Action {
      interface Context<TSession extends {} = {}> extends Resource.Context<TSession> {
        key?: any;
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
          [key: string]: any;
        }
      }

      interface Context<TSession extends {} = {}> extends EndpointContext<TSession> {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Delete {
      interface Request extends _Request {
        operation: 'delete';
        key: any;
      }

      interface Context<TSession extends {} = {}> extends EndpointContext<TSession> {
        request: Request;
      }
    }

    /* ***************************** */
    namespace DeleteMany {
      interface Request extends _Request {
        operation: 'deleteMany';
        params: {
          filter?: any;
          [key: string]: any;
        }
      }

      interface Context<TSession extends {} = {}> extends EndpointContext<TSession> {
        request: Request;
      }
    }

    /* ***************************** */
    namespace FindMany {
      interface Request extends _Request {
        operation: 'findMany';
        params: {
          filter?: any;
          pick?: string[];
          omit?: string[];
          include?: string[];
          sort?: string[];
          limit?: number;
          skip?: number;
          distinct?: boolean;
          count?: boolean;
          [key: string]: any;
        }
      }

      interface Context<TSession extends {} = {}> extends EndpointContext<TSession> {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Get {
      interface Request extends _Request {
        operation: 'get';
        key: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
          [key: string]: any;
        }
      }

      interface Context<TSession extends {} = {}> extends EndpointContext<TSession> {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Update {
      interface Request extends _Request {
        operation: 'update';
        key: any;
        data: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
          [key: string]: any;
        }
      }

      interface Context<TSession extends {} = {}> extends EndpointContext<TSession> {
        request: Request;
      }
    }

    /* ***************************** */
    namespace UpdateMany {
      interface Request extends _Request {
        operation: 'updateMany';
        data: any;
        params: {
          filter?: any;
          [key: string]: any;
        }
      }

      interface Context<TSession extends {} = {}> extends EndpointContext<TSession> {
        request: Request;
      }
    }
  }

  /* ***************************** */
  export interface ICollection<T> {
    create?(context: Collection.Create.Context): Promise<PartialOutput<T>>;

    delete?(context: Collection.Delete.Context): Promise<number> | undefined;

    deleteMany?(context: Collection.DeleteMany.Context): Promise<number> | undefined;

    findMany?(context: Collection.FindMany.Context): Promise<PartialOutput<T>[] | undefined>;

    get?(context: Collection.Get.Context): Promise<PartialOutput<T> | undefined>;

    update?(context: Collection.Update.Context): Promise<PartialOutput<T> | undefined>;

    updateMany?(context: Collection.UpdateMany.Context): Promise<number> | undefined;

    onInit?(): Promise<void>;

    onShutdown?(): Promise<void>;
  }

}
