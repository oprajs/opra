import type { PartialOutput } from '@opra/common';
import type { EndpointContext } from '../adapter/endpoint-context.js';
import type { Request as _Request } from '../adapter/request.js';

declare module "@opra/common" {

  /* ***************************** */
  namespace Collection {

    /* ***************************** */
    namespace Create {
      interface Request extends _Request {
        endpoint: 'create';
        data: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context extends EndpointContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Delete {
      interface Request extends _Request {
        endpoint: 'delete';
        key: any;
      }

      interface Context extends EndpointContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace DeleteMany {
      interface Request extends _Request {
        endpoint: 'deleteMany';
        params: {
          filter?: any;
        }
      }

      interface Context extends EndpointContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace FindMany {
      interface Request extends _Request {
        endpoint: 'findMany';
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
        }
      }

      interface Context extends EndpointContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Get {
      interface Request extends _Request {
        endpoint: 'get';
        key: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context extends EndpointContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Update {
      interface Request extends _Request {
        endpoint: 'update';
        key: any;
        data: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context extends EndpointContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace UpdateMany {
      interface Request extends _Request {
        endpoint: 'updateMany';
        data: any;
        params: {
          filter?: any;
        }
      }

      interface Context extends EndpointContext {
        request: Request;
      }
    }
  }

  /* ***************************** */
  export interface CollectionResource<T> {
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
