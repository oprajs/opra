import type { Readable } from 'stream';
import type { MultipartIterator } from '../adapter/http/helpers/multipart-helper';
import type { EndpointContext } from '../adapter/endpoint-context';
import type { Request as _Request } from '../adapter/request.js';

declare module "@opra/common" {

  /* ***************************** */
  namespace Storage {

    /* ***************************** */
    namespace Delete {
      interface Request extends _Request {
      }

      interface Context extends EndpointContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Get {
      interface Request extends _Request {
      }

      interface Context extends EndpointContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Post {
      interface Request extends _Request {
        parts: MultipartIterator;
      }

      interface Context extends EndpointContext {
        request: Request;
      }
    }

  }


  /* ***************************** */
  export interface StorageResource {
    delete?(context: Storage.Delete.Context): Promise<number | undefined>;

    get?(context: Storage.Get.Context): Promise<Buffer | Readable | undefined>;

    post?(context: Storage.Post.Context): Promise<void>;

    onInit?(): Promise<void>;

    onShutdown?(): Promise<void>;
  }
}
